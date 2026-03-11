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
from pathlib import Path

import click
import structlog

log = structlog.get_logger()

REPO_ROOT = Path(__file__).parent.parent

# ---------------------------------------------------------------------------
# Agent definitions
# ---------------------------------------------------------------------------

DESIGN_AGENTS = [
    {"name": "game-design",  "prompt": "agents/design/game-design.md"},
    {"name": "art-direction","prompt": "agents/design/art-direction.md"},
    {"name": "curriculum",   "prompt": "agents/design/curriculum.md"},
]

BUILD_AGENTS = [
    {"name": "coding-1", "prompt": "agents/build/coding-1.md", "worktree": "../agent-1-engine",    "branch": "feature/game-engine"},
    {"name": "coding-2", "prompt": "agents/build/coding-2.md", "worktree": "../agent-2-gameplay",  "branch": "feature/gameplay-mechanics"},
    {"name": "coding-3", "prompt": "agents/build/coding-3.md", "worktree": "../agent-3-math",      "branch": "feature/math-engine"},
    {"name": "devex",    "prompt": "agents/build/devex.md",    "worktree": "../agent-4-devex",      "branch": "feature/build-pipeline"},
]

QUALITY_AGENTS = [
    {"name": "architecture", "prompt": "agents/quality/architecture.md"},
    {"name": "security",     "prompt": "agents/quality/security.md"},
    {"name": "qa",           "prompt": "agents/quality/qa.md"},
    {"name": "accessibility","prompt": "agents/quality/accessibility.md"},
    {"name": "performance",  "prompt": "agents/quality/performance.md"},
]

# ---------------------------------------------------------------------------
# Agent runner
# ---------------------------------------------------------------------------

TIMEOUT_SECONDS = 600  # 10 minutes per agent run


def run_agent(agent: dict, game: str, cwd: Path) -> int:
    """Spawn a single Claude Code agent as a subprocess. Returns exit code."""
    prompt_path = Path(__file__).parent / agent["prompt"]
    prompt_text = prompt_path.read_text(encoding="utf-8")
    task = f"Game: {game}\n\n{prompt_text}"

    log.info("starting agent", name=agent["name"], game=game, cwd=str(cwd))
    result = subprocess.run(
        ["claude", "-p", task],
        cwd=cwd,
        timeout=TIMEOUT_SECONDS,
        check=False,
    )
    log.info("agent finished", name=agent["name"], returncode=result.returncode)
    return result.returncode


async def run_build_agent_async(agent: dict, game: str) -> int:
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
    return await loop.run_in_executor(None, run_agent, agent, game, worktree)


# ---------------------------------------------------------------------------
# Tier runners
# ---------------------------------------------------------------------------

def run_design_tier(game: str):
    log.info("=== Design Tier ===")
    for agent in DESIGN_AGENTS:
        code = run_agent(agent, game, REPO_ROOT)
        if code != 0:
            log.error("design agent failed", name=agent["name"], code=code)
            raise SystemExit(1)


async def run_build_tier_async(game: str):
    log.info("=== Build Tier (parallel) ===")
    tasks = [run_build_agent_async(agent, game) for agent in BUILD_AGENTS]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    for agent, result in zip(BUILD_AGENTS, results):
        if isinstance(result, Exception) or result != 0:
            log.error("build agent failed", name=agent["name"], result=result)
            raise SystemExit(1)


def run_quality_tier(game: str):
    log.info("=== Quality Tier ===")
    for agent in QUALITY_AGENTS:
        code = run_agent(agent, game, REPO_ROOT)
        if code != 0:
            log.warning("quality agent reported issues", name=agent["name"], code=code)
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
    structlog.configure(wrapper_class=structlog.make_filtering_bound_logger(logging.INFO))

    if tier in ("all", "design"):
        run_design_tier(game)

    if tier in ("all", "build"):
        asyncio.run(run_build_tier_async(game))

    if tier in ("all", "quality"):
        run_quality_tier(game)

    log.info("supervisor complete", game=game, tier=tier)


if __name__ == "__main__":
    main()
