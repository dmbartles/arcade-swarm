"""
Arcade Swarm Supervisor
=======================
Orchestrates Claude agents via the Anthropic Python SDK.

Each agent runs a proper tool-use loop: Claude calls Read/Write/Edit/Bash tools
directly through the API — no claude -p subprocess, no conversational drift.

Agent tiers (in order):
  1. Design tier  — sequential; each agent depends on the previous output
       game-design     → produces docs/gdds/<game>.md
       art-direction   → produces docs/style-guides/<game>.md
                         (receives docs/references/<game>/ images as base64 in context)
       sound-direction → produces docs/sound-guides/<game>.md
                         (reads style guide as tonal anchor; defines every sound event,
                          music track, library choice, and volume hierarchy)
       curriculum      → produces docs/curriculum-maps/<game>.md
       assets          → produces games/<game>/src/assets/SpriteFactory.ts
                       (receives reference images; committed to master before build starts)

  2. Build tier   — five phases (sound-guide is on master before this tier starts):
       Phase 1:   DevEx        — scaffolds build tooling (package.json, vite, tsconfig,
                                 index.html) + writes src/types/ interface stubs.
                                 Runs in its own worktree (feature/build-pipeline).
                                 [Auto-merges feature/build-pipeline → master on completion.]
       Phase 2:   Coordinator  — reads all design docs + src/types/ stubs; writes
                                 concrete build plans to docs/build-plans/ for each
                                 coding agent. Runs in the main repo (no worktree).
                                 [Auto-commits build plans to master on completion.]
       Phase 3:   Engine       — runs sequentially (first); writes scenes, config, main.ts.
                                 Other agents import its config constants — it must finish first.
                                 Worktree: feature/game-engine.
                                 [Auto-merges feature/game-engine → master on completion.]
       Phase 4:   Gameplay+Math — run in parallel after Engine merges; each owns disjoint files.
                                   engine   (feature/game-engine)        → scenes, config, main.ts
                                   gameplay (feature/gameplay-mechanics)  → entities, ScoreManager
                                   math     (feature/math-engine)        → shared/math-engine,
                                                                            MathEngine, DifficultyManager
                                 [Merges gameplay + math branches → master; cleans up all worktrees.]
       Phase 5:   Integration  — runs in main repo after merge; fixes cross-agent wiring
                                 errors (constructor mismatches, import paths, payload shapes)
                                 until typecheck + lint pass clean.

  3. Quality tier — parallel; reviews the combined merged output
       architecture  → docs/reviews/architecture.md
       security      → docs/reviews/security.md
       qa            → writes/runs tests; docs/reviews/qa.md
       accessibility → docs/reviews/accessibility.md
       performance   → docs/reviews/performance.md

  4. Patch tier — single agent; targeted fixes to an already-built game
       patch         → reads relevant source, makes minimum change, runs typecheck/lint, commits
       Accepts a fix description via --fix (inline string) or --fix-file (path to a markdown file).
       Use --then-quality to automatically run the quality tier after the patch completes.

Key design choices for token efficiency:
  - Tiered model selection: Opus only for coding agents; Sonnet for design/quality/coord; Haiku for smoke.
  - Prompt caching: system prompt (including pre-loaded docs) is sent with cache_control=ephemeral.
  - Document pre-injection: key reference files (CLAUDE.md, GDD, build plan, style guide) are
    embedded in the system prompt so agents never burn turns re-reading them via tools.
  - Message history compression: tool results older than HISTORY_KEEP_FULL_TURNS turns are
    trimmed to HISTORY_TRIM_TO_CHARS chars, bounding context growth over long agent runs.

Usage:
    python main.py --game missile-command-math
    python main.py --game missile-command-math --tier design
    python main.py --game missile-command-math --tier build
    python main.py --game missile-command-math --tier build --stop-after devex        <- stop after Phase 1; inspect games/missile-command-math/src/types/
    python main.py --game missile-command-math --tier build --start-after devex       <- skip Phase 1; resume from coordinator (Phase 2)
    python main.py --game missile-command-math --tier build --stop-after coordinator  <- stop after Phase 2; inspect docs/build-plans/
    python main.py --game missile-command-math --tier build --start-after coordinator <- skip Phases 1-2; resume from engine (Phase 3)
    python main.py --game missile-command-math --tier build --stop-after engine       <- stop after Phase 3; inspect engine output before parallel agents
    python main.py --game missile-command-math --tier build --start-after engine      <- skip Phases 1-3; resume from gameplay+math (Phase 4)
    python main.py --game missile-command-math --tier build --clean   <- wipe worktrees + branches before building
    python main.py --game missile-command-math --tier clean            <- wipe worktrees + branches only (no build)
    python main.py --game missile-command-math --tier quality
    python main.py --game missile-command-math --tier smoke   <- quick API + file I/O check (~2 turns)

  Patch tier (post-build targeted fixes):
    python main.py --game missile-command-math --tier patch --fix "score display doesn't update after chain reactions"
    python main.py --game missile-command-math --tier patch --fix-file docs/fixes/score-bug.md
    python main.py --game missile-command-math --tier patch --fix "..." --then-quality
    python main.py --game missile-command-math --tier patch --fix-file docs/fixes/score-bug.md --then-quality

  --fix        Inline fix description (one-liners, quick bugs)
  --fix-file   Path to a markdown file with a detailed fix description, reproduction steps,
               context, or multi-step instructions. Relative to the repo root.

Prerequisites:
    1. Copy ../.env.example to ../.env and set ANTHROPIC_API_KEY
    2. pip install -r requirements.txt
"""

import asyncio
import subprocess
import logging
import glob as glob_module
import datetime
import os
import platform
import json
import re as _re
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

import click
import structlog
from dotenv import load_dotenv
import anthropic

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

log = structlog.get_logger()

REPO_ROOT = Path(__file__).parent.parent
LOGS_DIR = Path(__file__).parent / "logs"

# ---------------------------------------------------------------------------
# Tiered model selection
# ---------------------------------------------------------------------------
DESIGN_MODEL  = "claude-sonnet-4-6"         # markdown doc generation from creative briefs
COORD_MODEL   = "claude-sonnet-4-6"         # structured planning from design documents
BUILD_MODEL   = "claude-sonnet-4-6"           # complex multi-file code generation
QUALITY_MODEL = "claude-sonnet-4-6"         # code review and structured reporting
SMOKE_MODEL   = "claude-haiku-4-5-20251001" # 2-turn API + file I/O connectivity check

# ---------------------------------------------------------------------------
# Tiered token limits
# ---------------------------------------------------------------------------
DESIGN_MAX_TOKENS  = 12_288   # structured templates cap output; 12k is generous headroom
COORD_MAX_TOKENS   = 16_384   # three detailed build plan files
BUILD_MAX_TOKENS   = 32_768   # full game modules (Opus 4.6 supports 128K output)
QUALITY_MAX_TOKENS = 8_192    # review reports
SMOKE_MAX_TOKENS   = 4_096    # 2-turn smoke check

MAX_TURNS    = 50             # per CLAUDE.md: no agent run exceeds 50 turns
MAX_RETRIES  = 3              # retries on 429 rate-limit / 529 overloaded errors
RETRY_DELAYS = [30, 60, 120]  # seconds between retries

# Tool result truncation -- prevents 413 errors from huge file reads or listings
MAX_TOOL_RESULT_CHARS = 40_000

# Message history compression -- keeps context size bounded over long agent runs.
# Tool results older than HISTORY_KEEP_FULL_TURNS are compressed to HISTORY_TRIM_TO_CHARS chars.
HISTORY_KEEP_FULL_TURNS = 12
HISTORY_TRIM_TO_CHARS   = 500


def _ts() -> str:
    """Return current local timestamp string for log lines."""
    return datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")


# ---------------------------------------------------------------------------
# Tool definitions
# ---------------------------------------------------------------------------

READ_TOOL = {
    "name": "Read",
    "description": (
        "Read the full contents of a file at the given path. "
        "Use this to read creative briefs, existing docs, or any source file. "
        "Paths are relative to the repository root."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "file_path": {
                "type": "string",
                "description": "Path to the file, relative to the repository root (e.g. docs/briefs/missile-command-math.md)"
            }
        },
        "required": ["file_path"]
    }
}

WRITE_TOOL = {
    "name": "Write",
    "description": (
        "Write content to a file, creating it (and any parent directories) if it does not exist, "
        "or overwriting it if it does. Use this to produce GDDs, style guides, curriculum maps, "
        "source code files, and test files. "
        "Paths are relative to the repository root."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "file_path": {
                "type": "string",
                "description": "Path to write to, relative to the repository root"
            },
            "content": {
                "type": "string",
                "description": "The full content to write to the file"
            }
        },
        "required": ["file_path", "content"]
    }
}

EDIT_TOOL = {
    "name": "Edit",
    "description": (
        "Replace the first occurrence of old_string with new_string in the given file. "
        "Use this for targeted edits rather than rewriting an entire file. "
        "Paths are relative to the repository root."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "file_path": {
                "type": "string",
                "description": "Path to the file to edit, relative to the repository root"
            },
            "old_string": {
                "type": "string",
                "description": "The exact string to find and replace (must exist in the file)"
            },
            "new_string": {
                "type": "string",
                "description": "The replacement string"
            }
        },
        "required": ["file_path", "old_string", "new_string"]
    }
}

GLOB_TOOL = {
    "name": "Glob",
    "description": (
        "Find files matching a glob pattern. Returns a newline-separated list of matching paths. "
        "Useful for discovering existing files before reading or editing them. "
        "Prefer this over Bash directory listings -- it is fast, safe, and cross-platform."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "pattern": {
                "type": "string",
                "description": "Glob pattern relative to the repository root (e.g. docs/**/*.md, src/**/*.ts)"
            }
        },
        "required": ["pattern"]
    }
}

GREP_TOOL = {
    "name": "Grep",
    "description": (
        "Search for a pattern in files. Returns matching lines with file paths and line numbers. "
        "Use this to find specific content across the codebase without reading every file. "
        "Skips .git, node_modules, dist, and __pycache__ automatically."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "pattern": {
                "type": "string",
                "description": "The regex or literal string to search for"
            },
            "path": {
                "type": "string",
                "description": "Directory or file to search in, relative to repository root. Defaults to '.' (all files)."
            }
        },
        "required": ["pattern"]
    }
}

BASH_TOOL = {
    "name": "Bash",
    "description": (
        "Run a shell command and return its output. "
        "Use sparingly -- only for running tests, linters, build commands, or npm audit. "
        "Do NOT use for file reads or writes (use Read/Write tools instead). "
        "Do NOT run recursive directory listings (dir /s, find ., ls -R) -- use Glob instead."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "command": {
                "type": "string",
                "description": "The shell command to execute"
            }
        },
        "required": ["command"]
    }
}

ALL_TOOLS = {
    "Read":  READ_TOOL,
    "Write": WRITE_TOOL,
    "Edit":  EDIT_TOOL,
    "Glob":  GLOB_TOOL,
    "Grep":  GREP_TOOL,
    "Bash":  BASH_TOOL,
}

# ---------------------------------------------------------------------------
# Tool executor
# ---------------------------------------------------------------------------

# Directories to skip during Grep searches
_GREP_SKIP_DIRS = {".git", "node_modules", "__pycache__", ".venv", "dist", ".cache", "coverage"}


def execute_tool(name: str, inputs: dict, cwd: Path) -> str:
    """Execute a tool call and return the result as a string."""
    try:
        if name == "Read":
            path = (cwd / inputs["file_path"]).resolve()
            return path.read_text(encoding="utf-8")

        elif name == "Write":
            path = (cwd / inputs["file_path"]).resolve()
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(inputs["content"], encoding="utf-8")
            return f"Written: {inputs['file_path']}"

        elif name == "Edit":
            path = (cwd / inputs["file_path"]).resolve()
            content = path.read_text(encoding="utf-8")
            if inputs["old_string"] not in content:
                return f"ERROR: old_string not found in {inputs['file_path']}"
            new_content = content.replace(inputs["old_string"], inputs["new_string"], 1)
            path.write_text(new_content, encoding="utf-8")
            return f"Edited: {inputs['file_path']}"

        elif name == "Glob":
            pattern = str(cwd / inputs["pattern"])
            matches = glob_module.glob(pattern, recursive=True)
            if not matches:
                return "(no matches)"
            return "\n".join(str(Path(m).relative_to(cwd)) for m in sorted(matches))

        elif name == "Grep":
            # Pure-Python implementation: cross-platform, no external grep binary needed.
            search_root = (cwd / inputs.get("path", ".")).resolve()
            raw_pattern = inputs["pattern"]
            try:
                regex = _re.compile(raw_pattern)
            except _re.error:
                regex = _re.compile(_re.escape(raw_pattern))

            results: list[str] = []
            MAX_GREP_RESULTS = 500

            def _should_skip(p: Path) -> bool:
                return any(part in _GREP_SKIP_DIRS for part in p.parts)

            try:
                for file_path in search_root.rglob("*"):
                    if _should_skip(file_path) or not file_path.is_file():
                        continue
                    try:
                        text = file_path.read_text(encoding="utf-8", errors="ignore")
                    except Exception:
                        continue
                    for lineno, line in enumerate(text.splitlines(), 1):
                        if regex.search(line):
                            try:
                                rel = file_path.relative_to(cwd)
                            except ValueError:
                                rel = file_path
                            results.append(f"{rel}:{lineno}:{line}")
                            if len(results) >= MAX_GREP_RESULTS:
                                results.append(f"... [truncated at {MAX_GREP_RESULTS} matches]")
                                return "\n".join(results)
            except Exception as e:
                return f"ERROR during Grep: {e}"

            return "\n".join(results) if results else "(no matches)"

        elif name == "Bash":
            result = subprocess.run(
                inputs["command"], shell=True, cwd=cwd,
                capture_output=True, text=True, timeout=120
            )
            output = result.stdout
            if result.stderr:
                output += f"\nSTDERR:\n{result.stderr}"
            return output or "(no output)"

        else:
            return f"ERROR: Unknown tool '{name}'"

    except Exception as e:
        return f"ERROR: {e}"


# ---------------------------------------------------------------------------
# Pre-load helper -- injects reference docs into the agent's system prompt
# ---------------------------------------------------------------------------

def _load_preload_docs(agent: dict, game: str) -> tuple[str, list[str]]:
    """
    Read each path in agent['preload'], substituting {game}, and return
    (concatenated_content, list_of_resolved_paths).

    Files are always read from REPO_ROOT so preloads are independent of
    the agent's working directory (worktree vs. main repo).
    Missing files are noted inline rather than raising.
    """
    preloads: list[str] = agent.get("preload", [])
    parts: list[str] = []
    resolved: list[str] = []

    for template in preloads:
        path_str = template.replace("{game}", game)
        resolved.append(path_str)
        full_path = REPO_ROOT / path_str
        try:
            content = full_path.read_text(encoding="utf-8")
            parts.append(f"### `{path_str}`\n\n{content}")
        except FileNotFoundError:
            parts.append(f"### `{path_str}`\n\n*(file not yet generated -- do not attempt to read it)*")

    combined = "\n\n---\n\n".join(parts) if parts else ""
    return combined, resolved


# ---------------------------------------------------------------------------
# Reference image loader -- injects docs/references/<game>/ images into context
# ---------------------------------------------------------------------------

def _load_reference_images(game: str) -> list[dict]:
    """
    Scan docs/references/<game>/ for image files and return a list of Anthropic
    content blocks (image + caption text) to inject into the first user message.

    Supports: .png, .jpg, .jpeg, .gif, .webp
    Images are base64-encoded and sent as image content blocks so the agent
    literally sees the pixels, not just text descriptions.

    Returns an empty list if the references directory does not exist or contains
    no recognised image files.
    """
    import base64

    refs_dir = REPO_ROOT / "docs" / "references" / game
    if not refs_dir.exists():
        return []

    _MEDIA_TYPES = {
        ".png":  "image/png",
        ".jpg":  "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif":  "image/gif",
        ".webp": "image/webp",
    }

    blocks: list[dict] = []
    for img_path in sorted(refs_dir.iterdir()):
        ext = img_path.suffix.lower()
        if ext not in _MEDIA_TYPES or not img_path.is_file():
            continue
        try:
            data = base64.standard_b64encode(img_path.read_bytes()).decode("utf-8")
        except Exception as e:
            log.warning("could not read reference image", path=str(img_path), error=str(e))
            continue
        blocks.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": _MEDIA_TYPES[ext],
                "data": data,
            },
        })
        blocks.append({
            "type": "text",
            "text": f"[Reference image: {img_path.name}]",
        })

    if blocks:
        log.info("injecting reference images", game=game, count=len(blocks) // 2)
    return blocks


# ---------------------------------------------------------------------------
# Message history compression
# ---------------------------------------------------------------------------

def _trim_message_history(messages: list) -> list:
    """
    Compress tool results in old turns to prevent unbounded context growth.

    Keeps the last HISTORY_KEEP_FULL_TURNS tool-result user-messages at full
    fidelity; compresses earlier ones to HISTORY_TRIM_TO_CHARS chars each.
    The initial user message (task prompt at index 0) is never modified.

    Only the copy passed to the API is trimmed -- the supervisor's working
    copy continues to accumulate the full history for accurate turn tracking.
    """
    # Identify user messages that contain tool_results (skip index 0 = task)
    tr_indices = [
        i for i, m in enumerate(messages)
        if i > 0
        and m["role"] == "user"
        and isinstance(m["content"], list)
        and any(
            isinstance(b, dict) and b.get("type") == "tool_result"
            for b in m["content"]
        )
    ]

    if len(tr_indices) <= HISTORY_KEEP_FULL_TURNS:
        return messages  # nothing to compress yet

    compress_set = set(tr_indices[:-HISTORY_KEEP_FULL_TURNS])

    result = []
    for i, msg in enumerate(messages):
        if i in compress_set:
            new_content = []
            for block in msg["content"]:
                if isinstance(block, dict) and block.get("type") == "tool_result":
                    content = block.get("content", "")
                    if isinstance(content, str) and len(content) > HISTORY_TRIM_TO_CHARS:
                        block = {
                            **block,
                            "content": (
                                content[:HISTORY_TRIM_TO_CHARS]
                                + f"\n... [compressed: {len(content) - HISTORY_TRIM_TO_CHARS} chars omitted]"
                            ),
                        }
                new_content.append(block)
            result.append({**msg, "content": new_content})
        else:
            result.append(msg)
    return result


# ---------------------------------------------------------------------------
# Agent definitions
# ---------------------------------------------------------------------------

DESIGN_AGENTS = [
    {
        "name": "game-design",
        "prompt": "agents/design/game-design.md",
        "tools": ["Read", "Write", "Edit"],
        "model": DESIGN_MODEL,
        "max_tokens": DESIGN_MAX_TOKENS,
        # Brief is the primary input; CLAUDE.md provides project rules.
        "preload": ["CLAUDE.md", "docs/briefs/{game}.md"],
    },
    {
        "name": "art-direction",
        "prompt": "agents/design/art-direction.md",
        "tools": ["Read", "Write", "Edit"],
        "model": DESIGN_MODEL,
        "max_tokens": DESIGN_MAX_TOKENS,
        # GDD exists because game-design ran first (design tier is sequential).
        # inject_references=True causes docs/references/<game>/ images to be
        # base64-encoded and prepended to the first user message as image blocks.
        "preload": ["CLAUDE.md", "docs/briefs/{game}.md", "docs/gdds/{game}.md"],
        "inject_references": True,
    },
    {
        "name": "sound-direction",
        "prompt": "agents/design/sound-direction.md",
        "tools": ["Read", "Write", "Edit"],
        "model": DESIGN_MODEL,
        "max_tokens": DESIGN_MAX_TOKENS,
        # Style guide exists because art-direction ran first; drives tonal anchoring.
        # Sound guide must be on master before build tier so engine agent can preload it.
        "preload": ["CLAUDE.md", "docs/briefs/{game}.md", "docs/gdds/{game}.md", "docs/style-guides/{game}.md"],
    },
    {
        "name": "curriculum",
        "prompt": "agents/design/curriculum.md",
        "tools": ["Read", "Write", "Edit"],
        "model": DESIGN_MODEL,
        "max_tokens": DESIGN_MAX_TOKENS,
        "preload": ["CLAUDE.md", "docs/briefs/{game}.md", "docs/gdds/{game}.md"],
    },
    {
        "name": "assets",
        "prompt": "agents/design/assets.md",
        "tools": ["Read", "Write", "Edit"],
        "model": BUILD_MODEL,          # Opus: drawing code requires the same precision as game code
        "max_tokens": BUILD_MAX_TOKENS,
        # Style guide exists because art-direction ran first.
        # inject_references=True so the agent sees the actual reference images
        # when deciding how to draw each sprite.
        "preload": ["CLAUDE.md", "docs/style-guides/{game}.md"],
        "inject_references": True,
    },
]

# Phase 1 -- DevEx: scaffolds build tooling and src/types/ interface stubs.
DEVEX_AGENT = {
    "name": "devex",
    "prompt": "agents/build/devex.md",
    "worktree": "../agent-4-devex",
    "branch": "feature/build-pipeline",
    "tools": ["Read", "Write", "Edit", "Bash", "Glob"],
    "model": BUILD_MODEL,
    "max_tokens": BUILD_MAX_TOKENS,
    "preload": [
        "CLAUDE.md",
        "docs/gdds/{game}.md",
        # Type stubs -- written by DevEx itself; present on re-runs, skipped gracefully on first run
        "games/{game}/src/types/GameEvents.ts",
        "games/{game}/src/types/IMathProblem.ts",
        "games/{game}/src/types/IMathEngine.ts",
        "games/{game}/src/types/IScoreManager.ts",
        "games/{game}/src/types/IDifficultyConfig.ts",
        "games/{game}/src/types/index.ts",
    ],
}

# Phase 1.5 -- Coordinator: reads all design docs + type stubs, writes build plans.
# By the time Coordinator runs, feature/build-pipeline has been merged into master
# so the type stubs are visible in REPO_ROOT/games/{game}/src/types/.
COORDINATOR_AGENT = {
    "name": "coordinator",
    "prompt": "agents/build/coordinator.md",
    "tools": ["Read", "Write", "Glob"],
    "model": COORD_MODEL,
    "max_tokens": COORD_MAX_TOKENS,
    # All design docs + type stubs pre-loaded; coordinator won't need Read tool for them.
    "preload": [
        "CLAUDE.md",
        "docs/gdds/{game}.md",
        "docs/style-guides/{game}.md",
        "docs/sound-guides/{game}.md",
        "docs/curriculum-maps/{game}.md",
        "games/{game}/src/types/GameEvents.ts",
        "games/{game}/src/types/IMathProblem.ts",
        "games/{game}/src/types/IScoreManager.ts",
        "games/{game}/src/types/IDifficultyConfig.ts",
        "games/{game}/src/types/IMathEngine.ts",
    ],
}

# Phase 3 -- engine: runs sequentially before gameplay/math.
# Its config constants are imported by the gameplay and math agents.
ENGINE_AGENT = {
    "name": "engine",
    "prompt": "agents/build/engine.md",
    "worktree": "../agent-engine",
    "branch": "feature/game-engine",
    "tools": ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
    "model": BUILD_MODEL,
    "max_tokens": BUILD_MAX_TOKENS,
    "preload": [
        "CLAUDE.md",
        "docs/gdds/{game}.md",
        "docs/style-guides/{game}.md",
        "docs/sound-guides/{game}.md",
        "docs/build-plans/{game}-engine.md",
        # SpriteFactory -- pre-loaded so the engine agent knows the full texture
        # key API before writing any scene or entity code.
        "games/{game}/src/assets/SpriteFactory.ts",
        # Type stubs -- pre-loaded so the agent knows exact exports before writing imports,
        # avoiding typecheck failures caused by importing from the wrong source file.
        "games/{game}/src/types/GameEvents.ts",
        "games/{game}/src/types/IMathProblem.ts",
        "games/{game}/src/types/IMathEngine.ts",
        "games/{game}/src/types/IScoreManager.ts",
        "games/{game}/src/types/IDifficultyConfig.ts",
        "games/{game}/src/types/index.ts",
    ],
}

# Phase 4 -- gameplay and math: run in parallel after engine merges into master.
# By the time these run, master contains: type stubs + build plans + engine code (config, scenes).
GAMEPLAY_AGENT = {
    "name": "gameplay",
    "prompt": "agents/build/gameplay.md",
    "worktree": "../agent-gameplay",
    "branch": "feature/gameplay-mechanics",
    "tools": ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
    "model": BUILD_MODEL,
    "max_tokens": BUILD_MAX_TOKENS,
    "preload": [
        "CLAUDE.md",
        "docs/gdds/{game}.md",
        "docs/style-guides/{game}.md",
        "docs/build-plans/{game}-gameplay.md",
        # SpriteFactory -- gameplay entities use sprite keys; must know the API.
        "games/{game}/src/assets/SpriteFactory.ts",
        # Type stubs -- pre-loaded so the agent knows exact exports before writing imports.
        "games/{game}/src/types/GameEvents.ts",
        "games/{game}/src/types/IMathProblem.ts",
        "games/{game}/src/types/IMathEngine.ts",
        "games/{game}/src/types/IScoreManager.ts",
        "games/{game}/src/types/IDifficultyConfig.ts",
        "games/{game}/src/types/index.ts",
    ],
}

MATH_AGENT = {
    "name": "math",
    "prompt": "agents/build/math.md",
    "worktree": "../agent-math",
    "branch": "feature/math-engine",
    "tools": ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
    "model": BUILD_MODEL,
    "max_tokens": BUILD_MAX_TOKENS,
    "preload": [
        "CLAUDE.md",
        "docs/gdds/{game}.md",
        "docs/style-guides/{game}.md",
        "docs/curriculum-maps/{game}.md",
        "docs/build-plans/{game}-math.md",
        # Type stubs -- pre-loaded so the agent knows exact exports before writing imports.
        "games/{game}/src/types/GameEvents.ts",
        "games/{game}/src/types/IMathProblem.ts",
        "games/{game}/src/types/IMathEngine.ts",
        "games/{game}/src/types/IScoreManager.ts",
        "games/{game}/src/types/IDifficultyConfig.ts",
        "games/{game}/src/types/index.ts",
    ],
}

# Convenience list of all worktree-based coding agents (used by BUILD_AGENTS / clean)
CODING_AGENTS = [ENGINE_AGENT, GAMEPLAY_AGENT, MATH_AGENT]

# Parallel coding agents (Phase 4 -- run after engine merges)
PARALLEL_CODING_AGENTS = [GAMEPLAY_AGENT, MATH_AGENT]

# Phase 5 -- integration: runs in main repo after all branches are merged.
# Fixes cross-agent wiring errors (constructor mismatches, import paths, payload shapes)
# until typecheck and lint pass clean. No worktree -- operates on master directly.
INTEGRATION_AGENT = {
    "name": "integration",
    "prompt": "agents/build/integration.md",
    "tools": ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
    "model": BUILD_MODEL,
    "max_tokens": BUILD_MAX_TOKENS,
    "preload": [
        "CLAUDE.md",
        "docs/gdds/{game}.md",
    ],
}

SMOKE_AGENT = {
    "name": "smoke",
    "prompt": "agents/utilities/smoke.md",
    "tools": ["Read", "Write"],
    "model": SMOKE_MODEL,
    "max_tokens": SMOKE_MAX_TOKENS,
    "preload": ["CLAUDE.md"],
}

QUALITY_AGENTS = [
    {
        "name": "architecture",
        "prompt": "agents/quality/architecture.md",
        "tools": ["Read", "Glob", "Grep", "Write"],
        "model": QUALITY_MODEL,
        "max_tokens": QUALITY_MAX_TOKENS,
        "preload": ["CLAUDE.md"],
    },
    {
        "name": "security",
        "prompt": "agents/quality/security.md",
        "tools": ["Read", "Glob", "Grep", "Bash", "Write"],
        "model": QUALITY_MODEL,
        "max_tokens": QUALITY_MAX_TOKENS,
        "preload": ["CLAUDE.md"],
    },
    {
        "name": "qa",
        "prompt": "agents/quality/qa.md",
        "tools": ["Read", "Write", "Edit", "Bash"],
        "model": QUALITY_MODEL,
        "max_tokens": QUALITY_MAX_TOKENS,
        "preload": ["CLAUDE.md"],
    },
    {
        "name": "accessibility",
        "prompt": "agents/quality/accessibility.md",
        "tools": ["Read", "Glob", "Grep", "Write"],
        "model": QUALITY_MODEL,
        "max_tokens": QUALITY_MAX_TOKENS,
        "preload": ["CLAUDE.md"],
    },
    {
        "name": "performance",
        "prompt": "agents/quality/performance.md",
        "tools": ["Read", "Glob", "Grep", "Bash", "Write"],
        "model": QUALITY_MODEL,
        "max_tokens": QUALITY_MAX_TOKENS,
        "preload": ["CLAUDE.md"],
    },
]

# Patch tier -- single agent; targeted fixes to an already-built game.
# Runs in the main repo (no worktree) -- the game is already on master.
# Fix description is injected at runtime via run_patch_tier(); not hardcoded here.
PATCH_AGENT = {
    "name": "patch",
    "prompt": "agents/patch/patch.md",
    "tools": ["Read", "Write", "Edit", "Bash", "Glob"],
    "model": BUILD_MODEL,       # Opus: same as coding agents; patches require the same precision
    "max_tokens": BUILD_MAX_TOKENS,
    "preload": [
        "CLAUDE.md",
        "docs/gdds/{game}.md",
        "games/{game}/src/types/GameEvents.ts",
        "games/{game}/src/types/IMathProblem.ts",
        "games/{game}/src/types/IMathEngine.ts",
        "games/{game}/src/types/IScoreManager.ts",
        "games/{game}/src/types/IDifficultyConfig.ts",
    ],
}

# All agents that use worktrees (used by clean / worktree management)
BUILD_AGENTS = [DEVEX_AGENT] + CODING_AGENTS

# Phase 4 merge: only gameplay + math. Engine was already merged after Phase 3.
_PHASE4_MERGE_AGENTS = PARALLEL_CODING_AGENTS


# ---------------------------------------------------------------------------
# Agent runner
# ---------------------------------------------------------------------------

def run_agent(
    agent: dict,
    game: str,
    cwd: Path,
    agent_log_file: Path,
    extra_task_context: str | None = None,
) -> int:
    """
    Run a single agent via the Anthropic SDK tool-use loop.
    Returns 0 on success, 1 on failure.

    extra_task_context -- optional string prepended to the agent's task section in
    the first user message. Used by the patch tier to inject the fix description at
    runtime without modifying the agent's prompt file.

    Token efficiency features:
    - Agent-specific model and max_tokens (tiered per role).
    - System prompt sent with cache_control=ephemeral for prompt caching.
    - Key reference documents pre-injected into the system prompt so agents
      do not burn tool-use turns reading them, and they never accumulate
      in the growing message history.
    - Message history is compressed before each API call to keep context bounded.

    Automatically retries up to MAX_RETRIES times on 429/529 errors with
    exponential back-off. All turns and tool calls are written to agent_log_file.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        log.error("ANTHROPIC_API_KEY not set")
        return 1

    client = anthropic.Anthropic(api_key=api_key)

    model      = agent.get("model",      BUILD_MODEL)
    max_tokens = agent.get("max_tokens", BUILD_MAX_TOKENS)

    # Load pre-injected reference documents (always read from REPO_ROOT)
    preloaded_content, preloaded_paths = _load_preload_docs(agent, game)

    # Split agent prompt into system + task sections
    prompt_path = Path(__file__).parent / agent["prompt"]
    prompt_text = prompt_path.read_text(encoding="utf-8")

    if "## Your Task" in prompt_text:
        system_prompt, task_section = prompt_text.split("## Your Task", 1)
    else:
        system_prompt = prompt_text
        task_section = "Complete the task described in your system prompt."

    # Build combined system prompt (role rules + pre-loaded docs).
    # This entire block is sent with cache_control=ephemeral so it is cached
    # across turns -- the dominant source of repeated input tokens.
    combined_system = system_prompt.strip()
    if preloaded_content:
        combined_system += (
            "\n\n---\n\n## Pre-loaded Reference Documents\n\n"
            "The following documents are included for your reference. "
            "**Do NOT use the Read tool to re-read any of them** -- they are already in context.\n\n"
            + preloaded_content
        )

    # System as a list enables prompt caching on the Anthropic API.
    system_blocks = [
        {
            "type": "text",
            "text": combined_system,
            "cache_control": {"type": "ephemeral"},
        }
    ]

    # First user message lists pre-loaded paths so the agent knows what to skip.
    preload_notice = ""
    if preloaded_paths:
        preload_notice = (
            "**Already in your system prompt (do not Read again):** "
            + ", ".join(f"`{p}`" for p in preloaded_paths)
            + "\n\n"
        )

    task_body = task_section.strip()
    if extra_task_context:
        task_body = extra_task_context.strip() + "\n\n" + task_body

    os_name = platform.system()  # "Windows", "Darwin", or "Linux"
    os_notice = (
        f"**Host OS: {os_name}** — "
        + ("shell is `cmd.exe` (no `grep`, `ls`, `head`, `tail`, or `2>/dev/null`); "
           "use the `Grep` and `Glob` tools instead of Bash for file searches."
           if os_name == "Windows"
           else "standard Unix shell available.")
        + "\n\n"
    )

    text_message = (
        f"Game name: {game}\n\n"
        + os_notice
        + preload_notice
        + f"## Your Task\n{task_body}"
    )

    # Inject visual reference images for agents that request it.
    # Images are prepended before the text so the agent sees them first.
    reference_image_blocks = (
        _load_reference_images(game) if agent.get("inject_references") else []
    )
    if reference_image_blocks:
        first_message_content: str | list = (
            reference_image_blocks + [{"type": "text", "text": text_message}]
        )
    else:
        first_message_content = text_message

    tools    = [ALL_TOOLS[t] for t in agent["tools"] if t in ALL_TOOLS]
    messages = [{"role": "user", "content": first_message_content}]

    log.info("agent starting", name=agent["name"], game=game, model=model, cwd=str(cwd))

    turn = 0
    with open(agent_log_file, "w", encoding="utf-8") as log_file:

        def write(line: str):
            log_file.write(line)
            log_file.flush()

        write(
            f"=== Agent: {agent['name']} | Game: {game} | Model: {model} | "
            f"MaxTokens: {max_tokens} | Started: {_ts()} ===\n\n"
        )
        if preloaded_paths:
            write(f"Pre-loaded: {', '.join(preloaded_paths)}\n\n")

        while turn < MAX_TURNS:
            turn += 1
            write(f"\n--- Turn {turn} | {_ts()} ---\n")

            # Compress old tool results before sending to keep context bounded.
            # The full messages list is preserved for accurate turn tracking.
            api_messages = _trim_message_history(messages)

            # API call with retry on rate-limit / overloaded errors
            retry_count = 0
            response = None
            while True:
                try:
                    with client.messages.stream(
                        model=model,
                        max_tokens=max_tokens,
                        system=system_blocks,
                        tools=tools,
                        tool_choice={"type": "auto"},
                        messages=api_messages,
                    ) as stream:
                        response = stream.get_final_message()
                    break  # success

                except (anthropic.RateLimitError, anthropic.InternalServerError) as e:
                    error_kind = "RATE LIMIT" if isinstance(e, anthropic.RateLimitError) else "OVERLOADED"
                    if retry_count < MAX_RETRIES:
                        delay = RETRY_DELAYS[retry_count]
                        write(
                            f"[{_ts()}] {error_kind} -- waiting {delay}s before retry "
                            f"{retry_count + 1}/{MAX_RETRIES}: {e}\n"
                        )
                        log.warning(f"{error_kind.lower()}, retrying", agent=agent["name"], turn=turn, delay=delay)
                        time.sleep(delay)
                        retry_count += 1
                    else:
                        write(f"[{_ts()}] {error_kind} -- max retries ({MAX_RETRIES}) exceeded\n")
                        write(f"[{_ts()}] X FAILED: {error_kind.lower()} exhausted on turn {turn}.\n")
                        log.error(f"{error_kind.lower()} max retries exceeded", name=agent["name"], turn=turn)
                        return 1

                except anthropic.APIError as e:
                    write(f"[{_ts()}] API ERROR: {e}\n")
                    write(f"[{_ts()}] X FAILED: API error on turn {turn}.\n")
                    log.error("API error", agent=agent["name"], error=str(e))
                    return 1

            # Append assistant response to the full (uncompressed) message history
            messages.append({"role": "assistant", "content": response.content})

            # Log what Claude did this turn
            for block in response.content:
                if hasattr(block, "text") and block.text:
                    write(f"[{_ts()}] [text] {block.text}\n")
                elif block.type == "tool_use":
                    write(f"[{_ts()}] [tool_use] {block.name}({json.dumps(block.input)[:200]})\n")

            # Done -- no more tool calls
            if response.stop_reason == "end_turn":
                write(f"\n[{_ts()}] + Agent finished in {turn} turn(s).\n")
                log.info("agent finished", name=agent["name"], turns=turn, returncode=0)
                return 0

            # Process tool calls
            if response.stop_reason == "tool_use":
                tool_results = []
                for block in response.content:
                    if block.type != "tool_use":
                        continue
                    result = execute_tool(block.name, block.input, cwd)
                    write(f"[{_ts()}] [tool_result] {block.name} -> {result[:300]}\n")
                    log.debug("tool executed", tool=block.name, agent=agent["name"])
                    if len(result) > MAX_TOOL_RESULT_CHARS:
                        truncated = result[:MAX_TOOL_RESULT_CHARS]
                        truncated += (
                            f"\n... [truncated: {len(result) - MAX_TOOL_RESULT_CHARS} chars omitted"
                            " -- result too large; use a more targeted query]"
                        )
                        write(
                            f"[{_ts()}] [truncated] {block.name} result was {len(result)} chars, "
                            f"trimmed to {MAX_TOOL_RESULT_CHARS}\n"
                        )
                        result = truncated
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result,
                    })
                messages.append({"role": "user", "content": tool_results})
                continue

            # max_tokens: response was cut off mid-generation
            if response.stop_reason == "max_tokens":
                write(
                    f"[{_ts()}] X FAILED: stop_reason=max_tokens on turn {turn}. "
                    f"Response truncated. Increase the max_tokens for this agent tier "
                    f"(currently {max_tokens}).\n"
                )
                log.error("agent response truncated", name=agent["name"], turn=turn, max_tokens=max_tokens)
                return 1

            # Unknown stop reason
            write(f"[{_ts()}] X FAILED: unexpected stop_reason='{response.stop_reason}' on turn {turn}.\n")
            log.error("unexpected stop reason", name=agent["name"], stop_reason=response.stop_reason)
            return 1

        write(f"\n[{_ts()}] X FAILED: agent reached the {MAX_TURNS}-turn limit without finishing.\n")
        log.warning("agent hit turn limit", name=agent["name"], turns=turn)
        return 1


# ---------------------------------------------------------------------------
# Worktree management
# ---------------------------------------------------------------------------

def _is_valid_worktree(path: Path) -> bool:
    """Return True only if path is a directory that git recognises as a worktree."""
    if not path.exists():
        return False
    result = subprocess.run(
        ["git", "rev-parse", "--git-dir"],
        cwd=path,
        capture_output=True,
        text=True,
    )
    return result.returncode == 0


def _force_remove_dir(path: Path) -> None:
    """
    Remove a directory tree, working around Windows file-lock errors (WinError 32).

    Strategy:
      1. Try shutil.rmtree (fast, cross-platform).
      2. On Windows PermissionError, fall back to `cmd /c rmdir /s /q`.
      3. If the directory still exists after both attempts, raise with a clear message.
    """
    import shutil
    try:
        shutil.rmtree(path)
        return
    except PermissionError:
        pass  # fall through to Windows fallback

    subprocess.run(
        ["cmd", "/c", "rmdir", "/s", "/q", str(path)],
        capture_output=True,
    )
    if not path.exists():
        return

    raise PermissionError(
        f"Cannot delete {path} -- it appears to be open in another process (VSCode, Explorer, etc.).\n"
        f"Close the folder in VSCode (File -> Close Folder or close the '{path.name}' tab) "
        f"and re-run the command, or run: python main.py --game <game> --tier clean"
    )


def _ensure_worktree(agent: dict) -> Path:
    """
    Create the git worktree for a build agent if it does not already exist
    OR if the directory exists but is not a valid git worktree.
    Returns the worktree path.
    """
    worktree = REPO_ROOT.parent / agent["worktree"].lstrip("../")

    if _is_valid_worktree(worktree):
        log.info("worktree already valid, reusing", path=str(worktree))
        return worktree

    if worktree.exists():
        log.warning(
            "directory exists but is not a valid git worktree -- removing and recreating",
            path=str(worktree),
        )
        subprocess.run(
            ["git", "worktree", "remove", str(worktree), "--force"],
            cwd=REPO_ROOT, capture_output=True,
        )
        if worktree.exists():
            _force_remove_dir(worktree)

    log.info("creating worktree", path=str(worktree), branch=agent["branch"])
    result = subprocess.run(
        ["git", "worktree", "add", "-b", agent["branch"], str(worktree), "HEAD"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        if "already exists" in result.stderr:
            subprocess.run(
                ["git", "worktree", "add", str(worktree), agent["branch"]],
                cwd=REPO_ROOT,
                check=True,
            )
        else:
            raise subprocess.CalledProcessError(
                result.returncode, result.args, result.stdout, result.stderr
            )
    return worktree


def clean_build_state() -> None:
    """
    Remove all build worktree directories and delete their feature branches.

    Safe to run at any time -- if a worktree or branch does not exist, the step
    is skipped silently. Always ends with `git worktree prune` to clean up any
    stale git metadata.
    """
    log.info("=== Clean Build State ===")

    for agent in BUILD_AGENTS:
        worktree = REPO_ROOT.parent / agent["worktree"].lstrip("../")
        branch = agent["branch"]

        if worktree.exists():
            r = subprocess.run(
                ["git", "worktree", "remove", str(worktree), "--force"],
                cwd=REPO_ROOT, capture_output=True, text=True,
            )
            if r.returncode == 0:
                log.info("removed worktree", path=str(worktree))
            else:
                _force_remove_dir(worktree)
                log.info("force-deleted unregistered directory", path=str(worktree))
        else:
            log.info("worktree already absent", path=str(worktree))

        r = subprocess.run(
            ["git", "branch", "-D", branch],
            cwd=REPO_ROOT, capture_output=True, text=True,
        )
        if r.returncode == 0:
            log.info("deleted branch", branch=branch)
        else:
            log.info("branch already absent", branch=branch)

    subprocess.run(["git", "worktree", "prune"], cwd=REPO_ROOT, capture_output=True)
    log.info("git worktree prune complete")
    log.info("=== Clean complete -- all build worktrees and branches removed ===")


# ---------------------------------------------------------------------------
# Inter-phase git operations
# ---------------------------------------------------------------------------

def merge_devex_branch(run_log_dir: Path) -> bool:
    """
    Phase 1a: merge feature/build-pipeline into master after DevEx completes.

    This makes the type stubs (src/types/) written by DevEx visible in REPO_ROOT
    so the Coordinator can read them, and so coding worktrees (which branch from
    HEAD at creation time) will contain them.
    """
    branch = DEVEX_AGENT["branch"]
    merge_log = run_log_dir / "merge-devex.log"
    log.info("merging devex branch into master", branch=branch)

    with open(merge_log, "w", encoding="utf-8") as f:
        f.write(f"=== Phase 1a: Merge {branch} -> master | {_ts()} ===\n\n")

        result = subprocess.run(
            ["git", "merge", "--no-ff", branch, "-m",
             f"chore: merge {branch} (build tooling + type stubs)"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
        )
        if result.stdout:
            f.write(result.stdout)
        if result.stderr:
            f.write(f"STDERR: {result.stderr}\n")

        if result.returncode != 0:
            # "Already up to date" means DevEx made no new commits -- not a failure.
            if "already up to date" in (result.stdout + result.stderr).lower():
                f.write(f"[{_ts()}] Already up to date -- nothing new to merge\n")
                log.info("devex branch already up to date", branch=branch)
                return True
            f.write(f"[{_ts()}] X MERGE FAILED for {branch}\n")
            log.error("devex merge failed", branch=branch, merge_log=str(merge_log))
            return False

        f.write(f"[{_ts()}] + Merged {branch} into master\n")
        log.info("devex branch merged into master", branch=branch)
        return True


def commit_build_plans(game: str, run_log_dir: Path) -> bool:
    """
    Phase 1b: commit the Coordinator's build plans to master.

    Build plans are written by the Coordinator as untracked files in REPO_ROOT.
    Committing them to master ensures every coding worktree (branched from HEAD)
    will contain them at creation time -- no Read-tool round-trip needed.
    """
    commit_log = run_log_dir / "commit-build-plans.log"
    log.info("committing coordinator build plans to master", game=game)

    plan_files = [
        f"docs/build-plans/{game}-engine.md",
        f"docs/build-plans/{game}-gameplay.md",
        f"docs/build-plans/{game}-math.md",
    ]

    with open(commit_log, "w", encoding="utf-8") as f:
        f.write(f"=== Phase 1b: Commit build plans | {_ts()} ===\n\n")

        stage = subprocess.run(
            ["git", "add", "--"] + plan_files,
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
        )
        f.write(f"git add: {stage.stdout or '(ok)'}\n")
        if stage.stderr:
            f.write(f"STDERR: {stage.stderr}\n")
        if stage.returncode != 0:
            f.write(f"[{_ts()}] X git add failed\n")
            log.error("git add build plans failed")
            return False

        # Check if there is anything staged before committing
        diff = subprocess.run(
            ["git", "diff", "--cached", "--quiet"],
            cwd=REPO_ROOT,
            capture_output=True,
        )
        if diff.returncode == 0:
            f.write(f"[{_ts()}] Nothing to commit -- build plans already in index\n")
            log.info("build plans already committed to master")
            return True

        commit = subprocess.run(
            ["git", "commit", "-m", f"chore: coordinator build plans for {game}"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
        )
        if commit.stdout:
            f.write(commit.stdout)
        if commit.stderr:
            f.write(f"STDERR: {commit.stderr}\n")

        if commit.returncode != 0:
            f.write(f"[{_ts()}] X COMMIT FAILED\n")
            log.error("build plan commit failed")
            return False

        f.write(f"[{_ts()}] + Build plans committed to master\n")
        log.info("build plans committed to master")
        return True


def merge_engine_branch(run_log_dir: Path) -> bool:
    """
    Phase 3 completion: merge feature/game-engine into master after the engine agent finishes.

    This makes the engine's config constants visible in master so gameplay and math
    worktrees (branched from HEAD) will contain them at creation time.
    Returns True on success, False on failure.
    """
    branch = ENGINE_AGENT["branch"]
    merge_log = run_log_dir / "merge-engine.log"
    log.info("merging engine branch into master", branch=branch)

    with open(merge_log, "w", encoding="utf-8") as f:
        f.write(f"=== Phase 3 merge: {branch} -> master | {_ts()} ===\n\n")

        result = subprocess.run(
            ["git", "merge", "--no-ff", branch, "-m",
             f"chore: merge {branch} (engine scenes + config)"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
        )
        if result.stdout:
            f.write(result.stdout)
        if result.stderr:
            f.write(f"STDERR: {result.stderr}\n")

        if result.returncode != 0:
            if "already up to date" in (result.stdout + result.stderr).lower():
                f.write(f"[{_ts()}] Already up to date -- nothing new to merge\n")
                log.info("engine branch already up to date", branch=branch)
                return True
            f.write(f"[{_ts()}] X MERGE FAILED for {branch}\n")
            log.error("engine merge failed", branch=branch, merge_log=str(merge_log))
            return False

        f.write(f"[{_ts()}] + Merged {branch} into master\n")
        log.info("engine branch merged into master", branch=branch)
        return True


def merge_build_branches(run_log_dir: Path) -> bool:
    """
    Phase 4 completion: merge gameplay + math branches into master.

    Engine (feature/game-engine) was already merged after Phase 3 and is excluded here.
    DevEx (feature/build-pipeline) was already merged after Phase 1 and is excluded here.
    Merge order: gameplay -> math.
    On conflict, stops immediately and prints resolution instructions.
    On success, removes all remaining build worktrees.
    Returns True on success, False on conflict.
    """
    merge_log = run_log_dir / "merge.log"

    with open(merge_log, "w", encoding="utf-8") as f:

        def write(line: str):
            f.write(line)
            f.flush()

        write(f"=== Phase 4 merge: gameplay + math branches | {_ts()} ===\n\n")
        write("Merging gameplay and math branches (DevEx and Engine already merged).\n\n")

        for agent in _PHASE4_MERGE_AGENTS:
            branch = agent["branch"]
            write(f"[{_ts()}] Merging {branch}...\n")
            log.info("merging branch", branch=branch)

            result = subprocess.run(
                ["git", "merge", "--no-ff", branch, "-m", f"chore: merge {branch}"],
                cwd=REPO_ROOT,
                capture_output=True,
                text=True,
            )
            if result.stdout:
                write(result.stdout)
            if result.stderr:
                write(f"STDERR: {result.stderr}\n")

            if result.returncode != 0:
                write(f"\n[{_ts()}] X MERGE CONFLICT in {branch}\n")
                write("Resolve conflicts manually, then run:\n")
                write("  git add -A && git merge --continue\n")
                write("Then re-run the quality tier.\n")
                log.error(
                    "merge conflict -- manual intervention required",
                    branch=branch,
                    merge_log=str(merge_log),
                )
                return False

            write(f"[{_ts()}] + Merged {branch}\n\n")

        # Remove all remaining build worktrees (including DevEx which is still checked out)
        write(f"[{_ts()}] Cleaning up worktrees...\n")
        for agent in BUILD_AGENTS:
            worktree = REPO_ROOT.parent / agent["worktree"].lstrip("../")
            if worktree.exists():
                r = subprocess.run(
                    ["git", "worktree", "remove", str(worktree), "--force"],
                    cwd=REPO_ROOT,
                    capture_output=True,
                    text=True,
                )
                status = "ok" if r.returncode == 0 else r.stderr.strip()
                write(f"[{_ts()}]   Removed {worktree.name}: {status}\n")

        subprocess.run(["git", "worktree", "prune"], cwd=REPO_ROOT, capture_output=True)
        write(f"\n[{_ts()}] + All branches merged. Worktrees cleaned up.\n")
        log.info("build merge complete", merge_log=str(merge_log))

    return True


# ---------------------------------------------------------------------------
# Build agent async wrapper
# ---------------------------------------------------------------------------

async def run_build_agent_async(
    agent: dict, game: str, run_log_dir: Path, executor: ThreadPoolExecutor
) -> int:
    """Run a build agent in its dedicated git worktree."""
    worktree = _ensure_worktree(agent)
    agent_log = run_log_dir / f"{agent['name']}.log"
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, run_agent, agent, game, worktree, agent_log)


# ---------------------------------------------------------------------------
# Tier runners
# ---------------------------------------------------------------------------

def _commit_sprite_factory(game: str, run_log_dir: Path) -> bool:
    """
    Commit games/<game>/src/assets/ to master after the assets agent completes.

    Build worktrees branch from HEAD at creation time, so SpriteFactory.ts must
    be committed to master before any build worktree is created — otherwise build
    agents will not see the pre-built assets.
    Returns True on success (or if there is nothing new to commit), False on failure.
    """
    commit_log = run_log_dir / "commit-sprite-factory.log"
    assets_glob = f"games/{game}/src/assets/"
    log.info("committing SpriteFactory to master", game=game)

    with open(commit_log, "w", encoding="utf-8") as f:
        f.write(f"=== Commit SpriteFactory | {_ts()} ===\n\n")

        stage = subprocess.run(
            ["git", "add", assets_glob],
            cwd=REPO_ROOT, capture_output=True, text=True,
        )
        f.write(f"git add: {stage.stdout or '(ok)'}\n")
        if stage.stderr:
            f.write(f"STDERR: {stage.stderr}\n")
        if stage.returncode != 0:
            f.write(f"[{_ts()}] X git add failed\n")
            log.error("git add SpriteFactory failed")
            return False

        diff = subprocess.run(
            ["git", "diff", "--cached", "--quiet"],
            cwd=REPO_ROOT, capture_output=True,
        )
        if diff.returncode == 0:
            f.write(f"[{_ts()}] Nothing to commit -- SpriteFactory already in index\n")
            log.info("SpriteFactory already committed to master")
            return True

        commit = subprocess.run(
            ["git", "commit", "-m", f"chore: sprite factory assets for {game}"],
            cwd=REPO_ROOT, capture_output=True, text=True,
        )
        if commit.stdout:
            f.write(commit.stdout)
        if commit.stderr:
            f.write(f"STDERR: {commit.stderr}\n")

        if commit.returncode != 0:
            f.write(f"[{_ts()}] X COMMIT FAILED\n")
            log.error("SpriteFactory commit failed")
            return False

        f.write(f"[{_ts()}] + SpriteFactory committed to master\n")
        log.info("SpriteFactory committed to master")
        return True


def run_design_tier(game: str, run_log_dir: Path):
    log.info("=== Design Tier (sequential) ===")
    for agent in DESIGN_AGENTS:
        agent_log = run_log_dir / f"{agent['name']}.log"
        log.info("running design agent", name=agent["name"])
        code = run_agent(agent, game, REPO_ROOT, agent_log)
        if code != 0:
            log.error("design agent failed", name=agent["name"], log=str(agent_log))
            raise SystemExit(1)
        log.info("design agent complete", name=agent["name"])
        # After the assets agent, commit SpriteFactory.ts to master so build
        # worktrees (which branch from HEAD) inherit the pre-built sprite assets.
        if agent["name"] == "assets":
            if not _commit_sprite_factory(game, run_log_dir):
                log.error("SpriteFactory commit failed -- build agents will not see pre-built assets")
                raise SystemExit(1)
            log.info("SpriteFactory on master -- build worktrees will inherit it")


async def run_build_tier_async(
    game: str,
    run_log_dir: Path,
    stop_after: str | None = None,
    start_after: str | None = None,
):
    """
    Run the build tier across five phases.

    stop_after  -- stop after the named phase for inspection before continuing:
      "devex"       -- stop after Phase 1; inspect src/types/
      "coordinator" -- stop after Phase 2; inspect docs/build-plans/
      "engine"      -- stop after Phase 3; inspect engine output before parallel agents

    start_after -- skip phases up to and including the named phase (resume mode):
      "devex"       -- skip Phase 1; assume feature/build-pipeline already merged;
                       resume from Phase 2 (coordinator)
      "coordinator" -- skip Phases 1-2; assume build plans committed; resume from Phase 3 (engine)
      "engine"      -- skip Phases 1-3; assume engine branch merged; resume from Phase 4 (gameplay+math)
    """
    loop = asyncio.get_event_loop()

    # -------------------------------------------------------------------------
    # Phase 1: DevEx -- scaffold build tooling and src/types/ interface stubs.
    # Auto-merges feature/build-pipeline -> master on completion.
    # -------------------------------------------------------------------------
    if start_after in ("devex", "coordinator", "engine"):
        log.info("=== Build Tier -- Phase 1: DevEx (SKIPPED via --start-after) ===")
    else:
        log.info("=== Build Tier -- Phase 1: DevEx (tooling + interfaces) ===")
        devex_worktree = _ensure_worktree(DEVEX_AGENT)
        devex_log = run_log_dir / f"{DEVEX_AGENT['name']}.log"

        with ThreadPoolExecutor(max_workers=1) as executor:
            devex_result = await loop.run_in_executor(
                executor, run_agent, DEVEX_AGENT, game, devex_worktree, devex_log
            )

        if devex_result != 0:
            log.error("devex agent failed -- cannot proceed", log=str(devex_log))
            raise SystemExit(1)
        log.info("devex complete -- merging into master")

        if not merge_devex_branch(run_log_dir):
            log.error("devex merge failed -- cannot proceed to coordinator")
            raise SystemExit(1)
        log.info("devex merged -- type stubs now visible on master")

        if stop_after == "devex":
            log.info(
                "Stopped after Phase 1: DevEx (--stop-after devex). "
                f"Inspect worktree at {devex_worktree} then re-run with --start-after devex."
            )
            return

    # -------------------------------------------------------------------------
    # Phase 2: Coordinator -- reads all design docs + type stubs (now on master),
    # writes docs/build-plans/<game>-engine/gameplay/math.md.
    # Auto-commits build plans to master on completion.
    # -------------------------------------------------------------------------
    if start_after in ("coordinator", "engine"):
        log.info("=== Build Tier -- Phase 2: Coordinator (SKIPPED via --start-after) ===")
    else:
        log.info("=== Build Tier -- Phase 2: Coordinator (build plans) ===")
        coordinator_log = run_log_dir / f"{COORDINATOR_AGENT['name']}.log"

        with ThreadPoolExecutor(max_workers=1) as executor:
            coordinator_result = await loop.run_in_executor(
                executor, run_agent, COORDINATOR_AGENT, game, REPO_ROOT, coordinator_log
            )

        if coordinator_result != 0:
            log.error("coordinator agent failed -- cannot proceed to engine phase", log=str(coordinator_log))
            raise SystemExit(1)
        log.info("coordinator complete -- committing build plans to master")

        if not commit_build_plans(game, run_log_dir):
            log.error("build plan commit failed -- cannot proceed to engine phase")
            raise SystemExit(1)
        log.info("build plans committed -- engine worktree will inherit them from HEAD")

        if stop_after == "coordinator":
            log.info(
                "Stopped after Phase 2: Coordinator (--stop-after coordinator). "
                "Inspect docs/build-plans/ then re-run with --start-after coordinator."
            )
            return

    # -------------------------------------------------------------------------
    # Phase 3: Engine -- runs sequentially first.
    # Its config constants are imported by the gameplay and math agents.
    # Auto-merges feature/game-engine -> master on completion.
    # -------------------------------------------------------------------------
    if start_after == "engine":
        log.info("=== Build Tier -- Phase 3: Engine (SKIPPED via --start-after) ===")
    else:
        log.info("=== Build Tier -- Phase 3: Engine (scenes + config, sequential) ===")
        with ThreadPoolExecutor(max_workers=1) as executor:
            engine_result = await run_build_agent_async(ENGINE_AGENT, game, run_log_dir, executor)

        if isinstance(engine_result, Exception) or engine_result != 0:
            log.error("engine agent failed -- cannot proceed to parallel agents", result=str(engine_result))
            raise SystemExit(1)
        log.info("engine complete -- merging into master so gameplay/math can see config")

        if not merge_engine_branch(run_log_dir):
            log.error("engine merge failed -- cannot proceed to parallel agents")
            raise SystemExit(1)
        log.info("engine merged -- config constants now visible on master")

        if stop_after == "engine":
            log.info(
                "Stopped after Phase 3: Engine (--stop-after engine). "
                "Inspect engine output then re-run with --start-after engine."
            )
            return

    # -------------------------------------------------------------------------
    # Phase 4: Gameplay + Math -- parallel, each owns a disjoint set of files.
    # Worktrees branch from updated master (type stubs + build plans + engine code).
    # Merges gameplay + math into master; cleans up all worktrees.
    # -------------------------------------------------------------------------
    log.info("=== Build Tier -- Phase 4: Gameplay + Math (parallel) ===")
    with ThreadPoolExecutor(max_workers=len(PARALLEL_CODING_AGENTS)) as executor:
        tasks = [
            run_build_agent_async(agent, game, run_log_dir, executor)
            for agent in PARALLEL_CODING_AGENTS
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    for agent, result in zip(PARALLEL_CODING_AGENTS, results):
        if isinstance(result, Exception) or result != 0:
            log.error("coding agent failed", name=agent["name"], result=str(result))
            raise SystemExit(1)
    log.info("gameplay and math agents complete -- merging branches")

    if not merge_build_branches(run_log_dir):
        raise SystemExit(1)
    log.info("all branches merged -- proceeding to integration")

    # -------------------------------------------------------------------------
    # Phase 5: Integration -- runs in main repo after merge.
    # Fixes cross-agent wiring errors until typecheck + lint pass clean.
    # -------------------------------------------------------------------------
    log.info("=== Build Tier -- Phase 5: Integration (cross-agent wiring fixes) ===")
    integration_log = run_log_dir / f"{INTEGRATION_AGENT['name']}.log"
    integration_result = run_agent(INTEGRATION_AGENT, game, REPO_ROOT, integration_log)
    if integration_result != 0:
        log.warning(
            "integration agent did not complete cleanly -- manual review may be needed",
            log=str(integration_log),
        )
    else:
        log.info("integration complete -- codebase compiles cleanly")
    log.info("build tier complete")


def run_smoke_test(game: str, run_log_dir: Path):
    """
    Run the smoke test agent: reads CLAUDE.md + brief, writes docs/utilities/smoke-test.md,
    reads it back. Verifies API connectivity + Read/Write tool execution in ~2 turns.
    """
    log.info("=== Smoke Test ===")
    smoke_log = run_log_dir / "smoke.log"
    code = run_agent(SMOKE_AGENT, game, REPO_ROOT, smoke_log)
    if code != 0:
        log.error("smoke test FAILED", log=str(smoke_log))
        raise SystemExit(1)
    log.info("smoke test PASSED -- API connectivity and file I/O are working")


async def _run_quality_tier_async(game: str, run_log_dir: Path):
    """
    Run all quality agents in parallel -- none depend on each other's output.
    Architecture, Security, Accessibility, and Performance are read-only reviewers.
    QA writes test files but these do not conflict with the other reviewers.
    Quality failures are warnings only -- the Creative Director decides whether to block.
    """
    log.info("=== Quality Tier (parallel) ===")
    loop = asyncio.get_event_loop()

    with ThreadPoolExecutor(max_workers=len(QUALITY_AGENTS)) as executor:
        tasks = [
            loop.run_in_executor(
                executor,
                run_agent,
                agent,
                game,
                REPO_ROOT,
                run_log_dir / f"{agent['name']}.log",
            )
            for agent in QUALITY_AGENTS
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    for agent, result in zip(QUALITY_AGENTS, results):
        if isinstance(result, Exception):
            log.warning("quality agent exception", name=agent["name"], error=str(result))
        elif result != 0:
            log.warning("quality agent reported issues", name=agent["name"])
        else:
            log.info("quality agent complete", name=agent["name"])


def run_quality_tier(game: str, run_log_dir: Path):
    asyncio.run(_run_quality_tier_async(game, run_log_dir))


def run_patch_tier(
    game: str,
    run_log_dir: Path,
    fix: str | None,
    fix_file: str | None,
    then_quality: bool,
):
    """
    Run the patch agent against an already-built game.

    The fix description is assembled from --fix (inline string) and/or --fix-file
    (path to a markdown file relative to REPO_ROOT). Both can be supplied together;
    fix-file content comes first, then the inline --fix string.

    If --then-quality is set, the full quality tier runs immediately after the patch
    agent commits its changes.
    """
    # Build fix description from one or both sources.
    parts: list[str] = []

    if fix_file:
        fix_file_path = REPO_ROOT / fix_file
        if not fix_file_path.exists():
            log.error("--fix-file not found", path=str(fix_file_path))
            raise SystemExit(1)
        parts.append(fix_file_path.read_text(encoding="utf-8").strip())
        log.info("loaded fix description from file", path=fix_file)

    if fix:
        parts.append(fix.strip())

    if not parts:
        log.error("patch tier requires --fix or --fix-file (or both)")
        raise SystemExit(1)

    fix_description = "\n\n".join(parts)

    # Inject the fix description as extra task context so the agent sees it
    # at the top of its task section without modifying the prompt file.
    extra_context = f"## Fix Description\n\n{fix_description}"

    log.info("=== Patch Tier ===")
    log.info("fix description", content=fix_description[:200] + ("..." if len(fix_description) > 200 else ""))

    patch_log = run_log_dir / "patch.log"
    result = run_agent(PATCH_AGENT, game, REPO_ROOT, patch_log, extra_task_context=extra_context)

    if result != 0:
        log.error("patch agent failed", log=str(patch_log))
        raise SystemExit(1)
    log.info("patch complete")

    if then_quality:
        log.info("--then-quality set: running quality tier after patch")
        run_quality_tier(game, run_log_dir)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

@click.command()
@click.option("--game", required=True, help="Game name (e.g. missile-command-math)")
@click.option(
    "--tier",
    default="all",
    type=click.Choice(["all", "design", "build", "quality", "patch", "smoke", "clean"]),
    help=(
        "Which tier to run (default: all). "
        "'smoke' verifies API + file I/O before a real run. "
        "'clean' removes all build worktrees and branches without running any agents."
    ),
)
@click.option(
    "--clean",
    is_flag=True,
    default=False,
    help=(
        "Wipe all build worktrees and feature branches before running the build tier. "
        "Use when retrying a failed build run from scratch. "
        "Has no effect unless --tier is 'build' or 'all'."
    ),
)
@click.option(
    "--stop-after",
    default=None,
    type=click.Choice(["devex", "coordinator", "engine"]),
    help=(
        "Stop the build tier after the named phase for inspection. "
        "'devex' stops after Phase 1 (inspect src/types/). "
        "'coordinator' stops after Phase 2 (inspect docs/build-plans/). "
        "'engine' stops after Phase 3 (inspect engine output before parallel agents)."
    ),
)
@click.option(
    "--start-after",
    default=None,
    type=click.Choice(["devex", "coordinator", "engine"]),
    help=(
        "Resume the build tier, skipping phases already completed. "
        "'devex' skips Phase 1 and resumes from Phase 2 (coordinator). "
        "'coordinator' skips Phases 1-2 and resumes from Phase 3 (engine). "
        "'engine' skips Phases 1-3 and resumes from Phase 4 (gameplay + math)."
    ),
)
@click.option(
    "--fix",
    default=None,
    help=(
        "Inline fix description for the patch tier. "
        "Use for quick one-liners (e.g. --fix 'score display freezes after chain reaction'). "
        "Can be combined with --fix-file; --fix-file content comes first."
    ),
)
@click.option(
    "--fix-file",
    default=None,
    help=(
        "Path to a markdown file (relative to repo root) containing a detailed fix description. "
        "Use for multi-step fixes, reproduction steps, or fixes with supporting context. "
        "Can be combined with --fix; file content comes first. "
        "Example: --fix-file docs/fixes/score-bug.md"
    ),
)
@click.option(
    "--then-quality",
    is_flag=True,
    default=False,
    help=(
        "After the patch tier completes, automatically run the full quality tier. "
        "Has no effect unless --tier is 'patch'."
    ),
)
def main(
    game: str,
    tier: str,
    stop_after: str | None,
    start_after: str | None,
    clean: bool,
    fix: str | None,
    fix_file: str | None,
    then_quality: bool,
):
    """Arcade Swarm supervisor -- orchestrates Claude agent swarm via Anthropic SDK."""
    LOGS_DIR.mkdir(exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y-%m-%dT%H-%M-%S")
    run_log_dir = LOGS_DIR / f"{game}-{tier}-{timestamp}"
    run_log_dir.mkdir(exist_ok=True)
    supervisor_log = run_log_dir / "supervisor.log"

    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)-8s] %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )
    file_handler = logging.FileHandler(supervisor_log, encoding="utf-8")
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)

    stream_handler = logging.StreamHandler()
    stream_handler.setLevel(logging.INFO)
    stream_handler.setFormatter(formatter)

    logging.basicConfig(level=logging.DEBUG, handlers=[file_handler, stream_handler], force=True)
    structlog.configure(wrapper_class=structlog.make_filtering_bound_logger(logging.DEBUG))

    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise SystemExit(
            "ERROR: ANTHROPIC_API_KEY not set.\n"
            "Copy .env.example to .env in the repo root and add your key from https://console.anthropic.com"
        )

    log.info("supervisor starting", game=game, tier=tier, log_dir=str(run_log_dir))

    if tier == "smoke":
        run_smoke_test(game, run_log_dir)
        return

    if tier == "clean":
        clean_build_state()
        return

    if tier in ("all", "design"):
        run_design_tier(game, run_log_dir)

    if tier in ("all", "build"):
        if clean:
            log.info("--clean flag set: wiping build worktrees and branches before building")
            clean_build_state()
        asyncio.run(run_build_tier_async(game, run_log_dir, stop_after=stop_after, start_after=start_after))

    if tier in ("all", "quality"):
        run_quality_tier(game, run_log_dir)

    if tier == "patch":
        run_patch_tier(game, run_log_dir, fix=fix, fix_file=fix_file, then_quality=then_quality)

    log.info("supervisor complete", game=game, tier=tier)


if __name__ == "__main__":
    main()
