"""
Arcade Swarm Supervisor
=======================
Orchestrates Claude agents via the Anthropic Python SDK.

Each agent runs a proper tool-use loop: Claude calls Read/Write/Edit/Bash tools
directly through the API — no claude -p subprocess, no conversational drift.

Agent tiers (in order):
  1. Design tier  — sequential; each agent depends on the previous output
  2. Build tier   — two phases:
       Phase 1: DevEx runs first (scaffolds build tooling + src/types/ interface stubs)
       Phase 2: coding-1/2/3 run in parallel on disjoint file sets
       Phase 3: all build branches merged into master; worktrees cleaned up
  3. Quality tier — sequential; reviews the combined merged output

Usage:
    python main.py --game missile-command-math
    python main.py --game missile-command-math --tier design
    python main.py --game missile-command-math --tier build
    python main.py --game missile-command-math --tier quality

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
import json
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
MODEL = "claude-opus-4-6"
MAX_TOKENS = 32000       # style guides and GDDs can be very large; Opus 4.6 supports up to 128K
MAX_TURNS = 50           # per CLAUDE.md: no agent run exceeds 50 turns
MAX_RETRIES = 3          # retries on 429 rate-limit errors
RETRY_DELAYS = [30, 60, 120]  # seconds between retries


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
        "Useful for discovering existing files before reading or editing them."
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
        "Use this to find specific content across the codebase without reading every file."
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
        "Use sparingly — only for running tests, linters, build commands, or npm audit. "
        "Do NOT use for file reads or writes (use Read/Write tools instead)."
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
    "Read": READ_TOOL,
    "Write": WRITE_TOOL,
    "Edit": EDIT_TOOL,
    "Glob": GLOB_TOOL,
    "Grep": GREP_TOOL,
    "Bash": BASH_TOOL,
}

# ---------------------------------------------------------------------------
# Tool executor
# ---------------------------------------------------------------------------

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
            search_path = str(cwd / inputs.get("path", "."))
            result = subprocess.run(
                ["grep", "-rn", inputs["pattern"], search_path],
                capture_output=True, text=True, timeout=30
            )
            return result.stdout or result.stderr or "(no matches)"

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
# Agent definitions
# ---------------------------------------------------------------------------

DESIGN_AGENTS = [
    {"name": "game-design",  "prompt": "agents/design/game-design.md",  "tools": ["Read", "Write", "Edit"]},
    {"name": "art-direction","prompt": "agents/design/art-direction.md", "tools": ["Read", "Write", "Edit"]},
    {"name": "curriculum",   "prompt": "agents/design/curriculum.md",    "tools": ["Read", "Write", "Edit"]},
]

# DevEx runs first (Phase 1) to scaffold build tooling and src/types/ interface stubs.
# coding-1/2/3 then run in parallel (Phase 2) on strictly disjoint file sets.
DEVEX_AGENT = {
    "name": "devex",
    "prompt": "agents/build/devex.md",
    "worktree": "../agent-4-devex",
    "branch": "feature/build-pipeline",
    "tools": ["Read", "Write", "Edit", "Bash"],
}

CODING_AGENTS = [
    {"name": "coding-1", "prompt": "agents/build/coding-1.md", "worktree": "../agent-1-engine",   "branch": "feature/game-engine",       "tools": ["Read", "Write", "Edit", "Bash"]},
    {"name": "coding-2", "prompt": "agents/build/coding-2.md", "worktree": "../agent-2-gameplay", "branch": "feature/gameplay-mechanics", "tools": ["Read", "Write", "Edit", "Bash"]},
    {"name": "coding-3", "prompt": "agents/build/coding-3.md", "worktree": "../agent-3-math",     "branch": "feature/math-engine",        "tools": ["Read", "Write", "Edit", "Bash"]},
]

# Coordinator runs after devex (Phase 1.5) — reads interface stubs + design docs,
# writes concrete build plans to docs/build-plans/ for each coding agent.
# Runs in the main repo (no worktree needed — write-only to docs/).
COORDINATOR_AGENT = {
    "name": "coordinator",
    "prompt": "agents/build/coordinator.md",
    "tools": ["Read", "Write", "Glob"],
}

# Ordered for merge step: devex first so its type stubs land before coding branches.
# Coordinator has no worktree/branch — it writes to docs/ in the main repo.
BUILD_AGENTS = [DEVEX_AGENT] + CODING_AGENTS

QUALITY_AGENTS = [
    {"name": "architecture", "prompt": "agents/quality/architecture.md", "tools": ["Read", "Glob", "Grep", "Write"]},
    {"name": "security",     "prompt": "agents/quality/security.md",     "tools": ["Read", "Glob", "Grep", "Bash", "Write"]},
    {"name": "qa",           "prompt": "agents/quality/qa.md",           "tools": ["Read", "Write", "Edit", "Bash"]},
    {"name": "accessibility","prompt": "agents/quality/accessibility.md","tools": ["Read", "Glob", "Grep", "Write"]},
    {"name": "performance",  "prompt": "agents/quality/performance.md",  "tools": ["Read", "Glob", "Grep", "Write"]},
]

# ---------------------------------------------------------------------------
# Agent runner
# ---------------------------------------------------------------------------

def run_agent(agent: dict, game: str, cwd: Path, agent_log_file: Path) -> int:
    """
    Run a single agent via the Anthropic SDK tool-use loop.
    Returns 0 on success, 1 on failure.

    Automatically retries up to MAX_RETRIES times on 429 rate-limit errors
    with exponential back-off (RETRY_DELAYS seconds between attempts).
    All turns and tool calls are written to agent_log_file with timestamps.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        log.error("ANTHROPIC_API_KEY not set — copy .env.example to .env and add your key")
        return 1

    client = anthropic.Anthropic(api_key=api_key)

    # Load agent prompt and split into system + task
    prompt_path = Path(__file__).parent / agent["prompt"]
    prompt_text = prompt_path.read_text(encoding="utf-8")

    if "## Your Task" in prompt_text:
        system_prompt, task_section = prompt_text.split("## Your Task", 1)
    else:
        system_prompt = prompt_text
        task_section = "Complete the task described in your system prompt."

    user_message = (
        f"Game name: {game}\n\n"
        f"## Your Task\n{task_section.strip()}"
    )

    tools = [ALL_TOOLS[t] for t in agent["tools"] if t in ALL_TOOLS]
    messages = [{"role": "user", "content": user_message}]

    log.info("agent starting", name=agent["name"], game=game, cwd=str(cwd))

    turn = 0
    with open(agent_log_file, "w", encoding="utf-8") as log_file:

        def write(line: str):
            log_file.write(line)
            log_file.flush()

        write(f"=== Agent: {agent['name']} | Game: {game} | Started: {_ts()} ===\n\n")

        while turn < MAX_TURNS:
            turn += 1
            write(f"\n--- Turn {turn} | {_ts()} ---\n")

            # API call with retry on rate-limit errors
            retry_count = 0
            response = None
            while True:
                try:
                    with client.messages.stream(
                        model=MODEL,
                        max_tokens=MAX_TOKENS,
                        system=system_prompt.strip(),
                        tools=tools,
                        tool_choice={"type": "auto"},
                        messages=messages,
                    ) as stream:
                        response = stream.get_final_message()
                    break  # success

                except anthropic.RateLimitError as e:
                    if retry_count < MAX_RETRIES:
                        delay = RETRY_DELAYS[retry_count]
                        write(
                            f"[{_ts()}] RATE LIMIT — waiting {delay}s before retry "
                            f"{retry_count + 1}/{MAX_RETRIES}: {e}\n"
                        )
                        log.warning("rate limit, retrying", agent=agent["name"], turn=turn, delay=delay)
                        time.sleep(delay)
                        retry_count += 1
                    else:
                        write(f"[{_ts()}] RATE LIMIT — max retries ({MAX_RETRIES}) exceeded\n")
                        write(f"[{_ts()}] ✗ FAILED: rate limit exhausted on turn {turn}.\n")
                        log.error("rate limit max retries exceeded", name=agent["name"], turn=turn)
                        return 1

                except anthropic.APIError as e:
                    write(f"[{_ts()}] API ERROR: {e}\n")
                    write(f"[{_ts()}] ✗ FAILED: API error on turn {turn}.\n")
                    log.error("API error", agent=agent["name"], error=str(e))
                    return 1

            # Append assistant response to message history
            messages.append({"role": "assistant", "content": response.content})

            # Log what Claude did this turn
            for block in response.content:
                if hasattr(block, "text") and block.text:
                    write(f"[{_ts()}] [text] {block.text}\n")
                elif block.type == "tool_use":
                    write(f"[{_ts()}] [tool_use] {block.name}({json.dumps(block.input)[:200]})\n")

            # Done — no more tool calls
            if response.stop_reason == "end_turn":
                write(f"\n[{_ts()}] ✓ Agent finished in {turn} turn(s).\n")
                log.info("agent finished", name=agent["name"], turns=turn, returncode=0)
                return 0

            # Process tool calls
            if response.stop_reason == "tool_use":
                tool_results = []
                for block in response.content:
                    if block.type != "tool_use":
                        continue
                    result = execute_tool(block.name, block.input, cwd)
                    write(f"[{_ts()}] [tool_result] {block.name} → {result[:300]}\n")
                    log.debug("tool executed", tool=block.name, agent=agent["name"])
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
                    f"[{_ts()}] ✗ FAILED: stop_reason=max_tokens on turn {turn}. "
                    f"Response truncated. Increase MAX_TOKENS (currently {MAX_TOKENS}).\n"
                )
                log.error("agent response truncated", name=agent["name"], turn=turn, max_tokens=MAX_TOKENS)
                return 1

            # Unknown stop reason
            write(f"[{_ts()}] ✗ FAILED: unexpected stop_reason='{response.stop_reason}' on turn {turn}.\n")
            log.error("unexpected stop reason", name=agent["name"], stop_reason=response.stop_reason)
            return 1

        write(f"\n[{_ts()}] ✗ FAILED: agent reached the {MAX_TURNS}-turn limit without finishing.\n")
        log.warning("agent hit turn limit", name=agent["name"], turns=turn)
        return 1


# ---------------------------------------------------------------------------
# Worktree management
# ---------------------------------------------------------------------------

def _ensure_worktree(agent: dict) -> Path:
    """
    Create the git worktree for a build agent if it does not already exist.
    Returns the worktree path.
    """
    worktree = REPO_ROOT.parent / agent["worktree"].lstrip("../")
    if not worktree.exists():
        log.info("creating worktree", path=str(worktree), branch=agent["branch"])
        result = subprocess.run(
            ["git", "worktree", "add", "-b", agent["branch"], str(worktree), "HEAD"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            if "already exists" in result.stderr:
                # Branch exists from a prior run — check it out into the worktree.
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


def merge_build_branches(run_log_dir: Path) -> bool:
    """
    Sequentially merge all build feature branches into HEAD (master).
    Order: devex first (type stubs), then coding-1/2/3.

    On conflict, stops immediately and prints resolution instructions.
    On success, removes all build worktrees.

    Returns True on success, False on conflict.
    """
    merge_log = run_log_dir / "merge.log"

    with open(merge_log, "w", encoding="utf-8") as f:

        def write(line: str):
            f.write(line)
            f.flush()

        write(f"=== Build Branch Merge | {_ts()} ===\n\n")

        for agent in BUILD_AGENTS:
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
                write(f"\n[{_ts()}] ✗ MERGE CONFLICT in {branch}\n")
                write("Resolve conflicts manually, then run:\n")
                write("  git add -A && git merge --continue\n")
                write("Then re-run the quality tier.\n")
                log.error(
                    "merge conflict — manual intervention required",
                    branch=branch,
                    merge_log=str(merge_log),
                )
                return False

            write(f"[{_ts()}] ✓ Merged {branch}\n\n")

        # Clean up worktrees
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
        write(f"\n[{_ts()}] ✓ All branches merged. Worktrees cleaned up.\n")
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


async def run_build_tier_async(game: str, run_log_dir: Path):
    loop = asyncio.get_event_loop()

    # -------------------------------------------------------------------------
    # Phase 1: DevEx — scaffolds build tooling and src/types/ interface stubs.
    # Coding agents depend on these stubs, so devex must finish first.
    # -------------------------------------------------------------------------
    log.info("=== Build Tier — Phase 1: DevEx (tooling + interfaces) ===")
    devex_worktree = _ensure_worktree(DEVEX_AGENT)
    devex_log = run_log_dir / f"{DEVEX_AGENT['name']}.log"

    with ThreadPoolExecutor(max_workers=1) as executor:
        devex_result = await loop.run_in_executor(
            executor, run_agent, DEVEX_AGENT, game, devex_worktree, devex_log
        )

    if devex_result != 0:
        log.error("devex agent failed — cannot proceed to coordinator", log=str(devex_log))
        raise SystemExit(1)
    log.info("devex complete")

    # -------------------------------------------------------------------------
    # Phase 1.5: Coordinator — reads all design docs + interface stubs, writes
    # docs/build-plans/<game>-coding-{1,2,3}.md. Runs in the main repo so it
    # can read src/types/ from devex's worktree output via the repo root.
    # -------------------------------------------------------------------------
    log.info("=== Build Tier — Phase 1.5: Coordinator (build plans) ===")
    coordinator_log = run_log_dir / f"{COORDINATOR_AGENT['name']}.log"

    with ThreadPoolExecutor(max_workers=1) as executor:
        coordinator_result = await loop.run_in_executor(
            executor, run_agent, COORDINATOR_AGENT, game, REPO_ROOT, coordinator_log
        )

    if coordinator_result != 0:
        log.error("coordinator agent failed — cannot proceed to coding phase", log=str(coordinator_log))
        raise SystemExit(1)
    log.info("coordinator complete — build plans written to docs/build-plans/")

    # -------------------------------------------------------------------------
    # Phase 2: coding-1/2/3 — parallel, each owns a disjoint set of files.
    # Each reads docs/build-plans/<game>-coding-{1,2,3}.md before writing code.
    # -------------------------------------------------------------------------
    log.info("=== Build Tier — Phase 2: Coding Agents (parallel) ===")
    with ThreadPoolExecutor(max_workers=len(CODING_AGENTS)) as executor:
        tasks = [
            run_build_agent_async(agent, game, run_log_dir, executor)
            for agent in CODING_AGENTS
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    for agent, result in zip(CODING_AGENTS, results):
        if isinstance(result, Exception) or result != 0:
            log.error("coding agent failed", name=agent["name"], result=str(result))
            raise SystemExit(1)
    log.info("all coding agents complete")

    # -------------------------------------------------------------------------
    # Phase 3: Merge all build branches into master; clean up worktrees.
    # Merge order: devex → coding-1 → coding-2 → coding-3
    # -------------------------------------------------------------------------
    log.info("=== Build Tier — Phase 3: Merge ===")
    if not merge_build_branches(run_log_dir):
        raise SystemExit(1)
    log.info("build tier complete")


def run_quality_tier(game: str, run_log_dir: Path):
    log.info("=== Quality Tier (sequential) ===")
    for agent in QUALITY_AGENTS:
        agent_log = run_log_dir / f"{agent['name']}.log"
        log.info("running quality agent", name=agent["name"])
        code = run_agent(agent, game, REPO_ROOT, agent_log)
        if code != 0:
            # Quality failures are warnings — Creative Director decides whether to block.
            log.warning("quality agent reported issues", name=agent["name"], log=str(agent_log))
        else:
            log.info("quality agent complete", name=agent["name"])


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

@click.command()
@click.option("--game", required=True, help="Game name (e.g. missile-command-math)")
@click.option(
    "--tier",
    default="all",
    type=click.Choice(["all", "design", "build", "quality"]),
    help="Which tier to run (default: all)",
)
def main(game: str, tier: str):
    """Arcade Swarm supervisor — orchestrates Claude agent swarm via Anthropic SDK."""
    LOGS_DIR.mkdir(exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y-%m-%dT%H-%M-%S")
    run_log_dir = LOGS_DIR / f"{game}-{tier}-{timestamp}"
    run_log_dir.mkdir(exist_ok=True)
    supervisor_log = run_log_dir / "supervisor.log"

    # Consistent timestamped logging: DEBUG to file, INFO to console
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

    if tier in ("all", "design"):
        run_design_tier(game, run_log_dir)

    if tier in ("all", "build"):
        asyncio.run(run_build_tier_async(game, run_log_dir))

    if tier in ("all", "quality"):
        run_quality_tier(game, run_log_dir)

    log.info("supervisor complete", game=game, tier=tier)


if __name__ == "__main__":
    main()
