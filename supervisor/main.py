"""
Arcade Swarm Supervisor
=======================
Orchestrates Claude Code agent instances via `claude -p` subprocess calls.

Agent tiers (in order):
  1. Design tier  — runs sequentially; each agent depends on the previous output
  2. Build tier   — runs in parallel; each agent works in its own git worktree
  3. Quality tier — runs after build tier; reviews the combined output

Usage:
    python main.py --game missile-command-math
    python main.py --game missile-command-math --tier design
    python main.py --game missile-command-math --tier build
    python main.py --game missile-command-math --tier quality
"""

import asyncio
import subprocess
import logging
import shutil
import datetime
from pathlib import Path

import click
import structlog

log = structlog.get_logger()

REPO_ROOT = Path(__file__).parent.parent
LOGS_DIR = Path(__file__).parent / "logs"

# Resolve the claude executable once at import time.
# On Windows, npm-installed CLIs are .cmd wrappers that subprocess won't find
# by bare name without shell=True — shutil.which() handles this correctly.
CLAUDE_BIN = shutil.which("claude")
if CLAUDE_BIN is None:
    raise SystemExit(
        "ERROR: 'claude' executable not found in PATH.\n"
        "Install Claude Code with: npm install -g @anthropic-ai/claude-code"
    )

# ---------------------------------------------------------------------------
# Agent definitions
# Tool permissions are passed to claude via --allowedTools so agents can only
# access the tools their role requires.
# ---------------------------------------------------------------------------

DESIGN_AGENTS = [
    {
        "name": "game-design",
        "prompt": "agents/design/game-design.md",
        "tools": "Read,Write,Edit",
    },
    {
        "name": "art-direction",
        "prompt": "agents/design/art-direction.md",
        "tools": "Read,Write,Edit",
    },
    {
        "name": "curriculum",
        "prompt": "agents/design/curriculum.md",
        "tools": "Read,Write,Edit",
    },
]

BUILD_AGENTS = [
    {
        "name": "coding-1",
        "prompt": "agents/build/coding-1.md",
        "worktree": "../agent-1-engine",
        "branch": "feature/game-engine",
        "tools": "Read,Write,Edit,Bash",
    },
    {
        "name": "coding-2",
        "prompt": "agents/build/coding-2.md",
        "worktree": "../agent-2-gameplay",
        "branch": "feature/gameplay-mechanics",
        "tools": "Read,Write,Edit,Bash",
    },
    {
        "name": "coding-3",
        "prompt": "agents/build/coding-3.md",
        "worktree": "../agent-3-math",
        "branch": "feature/math-engine",
        "tools": "Read,Write,Edit,Bash",
    },
    {
        "name": "devex",
        "prompt": "agents/build/devex.md",
        "worktree": "../agent-4-devex",
        "branch": "feature/build-pipeline",
        "tools": "Read,Write,Edit,Bash",
    },
]

QUALITY_AGENTS = [
    {"name": "architecture", "prompt": "agents/quality/architecture.md", "tools": "Read,Grep,Glob"},
    {"name": "security",     "prompt": "agents/quality/security.md",     "tools": "Read,Grep,Glob,Bash"},
    {"name": "qa",           "prompt": "agents/quality/qa.md",           "tools": "Read,Write,Edit,Bash"},
    {"name": "accessibility","prompt": "agents/quality/accessibility.md","tools": "Read,Grep,Glob"},
    {"name": "performance",  "prompt": "agents/quality/performance.md",  "tools": "Read,Grep,Glob"},
]

# ---------------------------------------------------------------------------
# Agent runner
# ---------------------------------------------------------------------------

TIMEOUT_SECONDS = 600  # 10 minutes per agent run


def run_agent(agent: dict, game: str, cwd: Path, agent_log_file: Path) -> int:
    """Spawn a single Claude Code agent as a subprocess. Returns exit code."""
    prompt_path = Path(__file__).parent / agent["prompt"]
    prompt_text = prompt_path.read_text(encoding="utf-8")
    task = f"Game: {game}\n\n{prompt_text}"

    log.info("starting agent", name=agent["name"], game=game, cwd=str(cwd))

    with open(agent_log_file, "w", encoding="utf-8") as f:
        result = subprocess.run(
            [CLAUDE_BIN, "-p", task, "--allowedTools", agent["tools"]],
            cwd=cwd,
            timeout=TIMEOUT_SECONDS,
            check=False,
            stdout=f,
            stderr=subprocess.STDOUT,
        )

    log.info(
        "agent finished",
        name=agent["name"],
        returncode=result.returncode,
        output=str(agent_log_file),
    )
    return result.returncode


async def run_build_agent_async(agent: dict, game: str, agent_log_file: Path) -> int:
    """Run a build agent in its dedicated git worktree."""
    worktree = REPO_ROOT.parent / agent["worktree"].lstrip("../")
    if not worktree.exists():
        log.info("creating worktree", path=str(worktree), branch=agent["branch"])
        subprocess.run(
            ["git", "worktree", "add", str(worktree), agent["branch"]],
            cwd=REPO_ROOT,
            check=True,
        )
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, run_agent, agent, game, worktree, agent_log_file)


# ---------------------------------------------------------------------------
# Tier runners
# ---------------------------------------------------------------------------

def run_design_tier(game: str, run_log_dir: Path):
    log.info("=== Design Tier ===")
    for agent in DESIGN_AGENTS:
        agent_log = run_log_dir / f"{agent['name']}.log"
        code = run_agent(agent, game, REPO_ROOT, agent_log)
        if code != 0:
            log.error("design agent failed", name=agent["name"], code=code, output=str(agent_log))
            raise SystemExit(1)


async def run_build_tier_async(game: str, run_log_dir: Path):
    log.info("=== Build Tier (parallel) ===")
    agent_logs = [run_log_dir / f"{agent['name']}.log" for agent in BUILD_AGENTS]
    tasks = [run_build_agent_async(agent, game, agent_log)
             for agent, agent_log in zip(BUILD_AGENTS, agent_logs)]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    for agent, result in zip(BUILD_AGENTS, results):
        if isinstance(result, Exception) or result != 0:
            log.error("build agent failed", name=agent["name"], result=result)
            raise SystemExit(1)


def run_quality_tier(game: str, run_log_dir: Path):
    log.info("=== Quality Tier ===")
    for agent in QUALITY_AGENTS:
        agent_log = run_log_dir / f"{agent['name']}.log"
        code = run_agent(agent, game, REPO_ROOT, agent_log)
        if code != 0:
            log.warning("quality agent reported issues", name=agent["name"], code=code, output=str(agent_log))
            # Quality failures are warnings, not hard stops — Creative Director decides.


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
    """Arcade Swarm supervisor — orchestrates Claude Code agent swarm."""
    LOGS_DIR.mkdir(exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y-%m-%dT%H-%M-%S")

    # One subdirectory per run — supervisor log + one log file per agent inside it
    run_log_dir = LOGS_DIR / f"{game}-{tier}-{timestamp}"
    run_log_dir.mkdir(exist_ok=True)
    supervisor_log = run_log_dir / "supervisor.log"

    file_handler = logging.FileHandler(supervisor_log, encoding="utf-8")
    file_handler.setLevel(logging.DEBUG)
    stream_handler = logging.StreamHandler()
    stream_handler.setLevel(logging.INFO)

    logging.basicConfig(level=logging.DEBUG, handlers=[file_handler, stream_handler])
    structlog.configure(wrapper_class=structlog.make_filtering_bound_logger(logging.DEBUG))

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
