# Arcade Swarm

A monorepo of educational HTML5 arcade games built with [Phaser.js 3](https://phaser.io/), aligned to Common Core math standards.

Games are built by a swarm of AI agents directed by a human **Creative Director**. The Creative Director sets vision and approves merges — agents handle implementation.

## Games

| Game | Grade Target | Status |
|---|---|---|
| [Missile Command Math](games/missile-command-math/) | 3–5 | In development |

## Repository Structure

```
arcade-swarm/
  games/                        # Self-contained Vite + Phaser game projects
    missile-command-math/
  shared/                       # Framework-agnostic shared libraries
    math-engine/                # Procedural math problem generation (required by all games)
    audio/                      # Retro audio effect helpers
    visual/                     # Retro visual effect helpers
    analytics/                  # Local-only learning progress tracking
  supervisor/                   # Python orchestration layer (Azure AI Foundry + Semantic Kernel)
  docs/
    briefs/                     # Creative Director briefs — source of truth for design intent
    gdds/                       # Agent-generated Game Design Documents
    style-guides/               # Agent-generated style guides
    curriculum-maps/            # Agent-generated curriculum alignment maps
    adrs/                       # Architecture Decision Records
  tests/
    e2e/                        # Cross-game end-to-end tests (Playwright)
    integration/                # Shared library integration tests
```

## Getting Started

### Prerequisites
- Node.js >= 20
- npm >= 10
- Python >= 3.11 (for supervisor only)

### Install all workspace dependencies

```bash
npm install
```

### Run a game in development

```bash
cd games/missile-command-math
npm run dev
```

### Run all tests

```bash
npm run test            # All workspaces
```

## Key Constraints

- **No external network calls** from game code — ever.
- **No localStorage during gameplay** — in-memory only; localStorage only for settings.
- **No new npm dependencies** without Creative Director approval.
- **All math problems** come from `shared/math-engine/` — never hardcoded.
- **Bundle size limit**: 2MB per game including assets.
- **Target performance**: 60fps on a 3-year-old mid-range Android phone.

## Agent Workflow

Each agent works on a **separate git worktree** on its own feature branch to avoid conflicts. See `docs/adrs/` for architectural decisions and `docs/briefs/` for Creative Director intent.

## Deployment

`main` is always deployable and auto-deploys to GitHub Pages via `.github/workflows/deploy.yml`.
