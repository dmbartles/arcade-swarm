# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Arcade Swarm** is a monorepo of educational HTML5 arcade games built with Phaser.js 3, aligned to Common Core math standards. Games are built by a swarm of Claude Code AI agents directed by a human Creative Director. The first game is **Missile Command Math** (target: grades 3–5).

The Creative Director sets vision and approves merges — they do not write code. Agents handle implementation.

## Commands

### Game Development (run from within a game directory, e.g. `games/missile-command-math/`)
```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server (hot reload)
npm run build        # Production build
npm run preview      # Preview production build locally
```

### Testing
```bash
npm run test         # Run Vitest unit tests (watch mode)
npm run test:run     # Run Vitest unit tests once (CI mode)
npm run test:e2e     # Run Playwright browser tests
npm run test:e2e -- --grep "test name"  # Run a single e2e test
```

### Linting & Type Checking
```bash
npm run lint         # ESLint
npm run typecheck    # TypeScript type check (tsc --noEmit)
```

### Bundle Size Check
```bash
npm run build -- --report   # Vite build with bundle size report
```
Maximum bundle size per game is **2MB including assets**.

### Supervisor (Python, from `supervisor/`)
```bash
pip install -r requirements.txt
python main.py
```

## Architecture

### Monorepo Layout
- `games/` — Each game is a self-contained Vite+Phaser project
- `shared/` — Pure JS/TS libraries with zero game-engine dependencies
  - `math-engine/` — Procedural math problem generation; the only source of math problems
  - `audio/`, `visual/`, `analytics/` — Shared retro effects and local-only progress tracking
- `supervisor/` — Python orchestration layer that spawns and coordinates Claude Code agent instances
- `docs/briefs/` — Creative briefs from the Creative Director (source of truth for design intent)
- `docs/gdds/`, `docs/style-guides/`, `docs/curriculum-maps/` — Agent-generated artifacts
- `docs/reviews/` — Quality tier agent reports (architecture, security, QA, accessibility, performance)
- `docs/adrs/` — Architecture Decision Records

### Agent Architecture

This project is built by a swarm of Claude Code agents, all orchestrated by a Python supervisor running locally. There is no Azure AI Foundry or external agent platform — every agent is a Claude Code headless instance (`claude -p`) with specialized instructions and tool permissions.

#### Agent Tiers

**Design Tier** — Produce specifications, not code. Write only to `docs/`.
- Game Design Agent: Reads creative briefs, produces Game Design Documents
- Art Direction Agent: Produces visual style guides with exact hex codes, font specs, sprite dimensions
- Curriculum Alignment Agent: Maps math content to Common Core standards by grade level

**Build Tier** — Write code. Each agent operates in its own git worktree.
- Coding Agent 1: Game engine, rendering, scene management, visual effects
- Coding Agent 2: Gameplay mechanics, entities, input handling, scoring
- Coding Agent 3: Math engine, difficulty scaling, curriculum integration
- DevEx Agent: Build pipeline, CI/CD, project configuration, tooling

**Quality Tier** — Review and test. Produce reports to `docs/reviews/`. Do not modify source code unless explicitly noted.
- Architecture Agent: Pattern consistency and design coherence review
- Security Agent: Dependency scanning, privacy checks, supply chain review
- QA Agent: Test writing and execution, math correctness validation (exception: this agent writes test code)
- Accessibility Agent: WCAG 2.2 compliance, keyboard navigation, color contrast
- Performance Agent: Bundle size, mobile FPS, browser compatibility, Lighthouse audits

#### Agent Tool Permissions
- Design agents: `Read, Write, Edit` (read specs, write documents to `docs/` only)
- Build agents: `Read, Write, Edit, Bash` (full development access within their worktree)
- Quality agents: `Read, Grep, Glob` (read-only review, no code changes)
  - Exception: QA agent gets `Read, Write, Edit, Bash` (writes tests and runs them)
  - Exception: Security agent gets `Read, Grep, Glob, Bash` (runs `npm audit`)

#### Agent Isolation Rules
- Build agents work in separate git worktrees to prevent conflicts
- Quality agents NEVER modify source code — they produce reports in `docs/reviews/` only
- Design agents write ONLY to `docs/` — never to `games/` or `shared/`
- No agent should run for more than 50 turns on a single task
- The supervisor enforces a 10-minute timeout per agent run

#### Supervisor Operation
The supervisor (`supervisor/main.py`) spawns agents via `claude -p` in subprocess calls:
1. Design tier runs sequentially (each depends on the previous output)
2. Build tier runs in parallel (each agent in its own git worktree)
3. Quality tier runs after build tier completes (reviews the combined output)
4. Creative Director reviews quality reports and approves or requests changes

### Phaser Game Architecture

**Scenes** are the top-level units (`src/scenes/`). Each screen (Menu, Game, GameOver, LevelTransition) is its own `Phaser.Scene`. Scenes communicate **only** via the Phaser event bus — never by direct scene reference.

**Entities** (`src/entities/`) are `Phaser.GameObjects` subclasses. Each entity separates rendering, physics, and logic into distinct concerns (Entity-Component pattern).

**Systems** (`src/systems/`) are standalone managers:
- `MathEngine` — wraps `shared/math-engine/`; emits `problem-generated` and `answer-validated` events
- `DifficultyManager` — reads config objects and adjusts parameters at runtime
- `ScoreManager` — tracks and persists score state in-memory

Systems communicate through events (`this.events.emit` / `this.events.on`), not direct method calls to each other.

**Config** (`src/config/`) holds all tunable values: missile speed, spawn rates, problem complexity, time limits. Nothing is hardcoded in entity or system files.

### Math Engine (shared/math-engine/)
Pure JS library. Zero dependencies on Phaser or any game code. API contract:
- Input: `{ gradeLevel, skillType }`
- Output: `{ question, correctAnswer, distractors[] }`

All math problems in every game come from this library — never from hardcoded strings or static arrays.

### Parallel Agent Workflow
When multiple agents work simultaneously, each uses a **separate git worktree** so there are no branch conflicts. Each agent's work lives on its own feature branch. The supervisor creates worktrees before spawning build agents:
```bash
git worktree add ../agent-1-engine feature/game-engine
git worktree add ../agent-2-gameplay feature/gameplay-mechanics
git worktree add ../agent-3-math feature/math-engine
```

## Design Patterns — All Agents Must Follow

1. **Entity-Component** — Game objects are Phaser.GameObjects with separated rendering/physics/logic.
2. **Scene-based architecture** — One Phaser.Scene per distinct screen; inter-scene communication via event bus only.
3. **Event-driven systems** — Systems emit and listen for events; no direct cross-system method calls.
4. **Configuration-driven difficulty** — All parameters in `config/` files; `DifficultyManager` consumes them.
5. **Math engine independence** — `shared/math-engine/` has no game dependencies and is tested in isolation.

## Coding Standards

- ES modules (`import`/`export`) in all JS/TS files — never `require()`
- JSDoc on all public functions
- Named constants for all magic numbers
- All player-visible text must be extractable for localization (no inline strings in render logic)
- Mobile-first: every feature must work on touch screens
- Target 60fps on a 3-year-old mid-range Android phone
- Game state during gameplay lives in memory only — see the localStorage Policy section for exactly what is and is not permitted

## Git Workflow

- `main` is always deployable and auto-deploys to GitHub Pages via `.github/workflows/deploy.yml`
- Feature branches: `feature/description-of-work`
- Commit messages follow **Conventional Commits**: `feat:`, `fix:`, `docs:`, `test:`, `chore:`
- PR requirements: all tests pass, no new lint errors, bundle size check passes

## localStorage Policy

- **ALLOWED** for: high score persistence (arcade-style 3-letter initials + score), user settings (sound volume, preferred difficulty), accessibility preferences (reduced motion, high contrast mode)
- **NOT ALLOWED** for: saving mid-game state, storing any personally identifiable information, tracking gameplay behavior across sessions, or any data that could identify a specific child

## Future Considerations

These features are not in scope for the current build but should inform architectural decisions made today. Do not implement any of these without explicit Creative Director approval. When in doubt, design current code so it does not foreclose these options.

### Azure AI Foundry Integration

The current architecture uses all-Claude Code agents for simplicity and learning velocity. A future iteration may migrate non-coding agents (design tier, quality tier) to Azure AI Foundry Agent Service for:
- Enterprise RBAC and audit trails
- Persistent agent memory via conversation threads
- OpenAPI tool connections to external services (SAST scanners, CI systems)
- Multi-model support (GPT-4o for some roles, Claude for others)
- SOC 2 / FedRAMP compliance for enterprise deployments

Design the supervisor's agent interface so the underlying provider (Claude Code subprocess vs. Azure AI Foundry API) can be swapped without rewriting orchestration logic. Use an abstract `Agent` base class with `run(task)` → `AgentResult` contract.

### Backend & Cloud Infrastructure

The current architecture is intentionally client-only (GitHub Pages, no server). A future backend would introduce:

- **API layer** — A REST or GraphQL service (e.g. Node/Express, or a managed platform like Azure App Service) that games call to submit scores and progress events. Game code must remain decoupled from any specific API shape — use a thin `ApiClient` adapter so the transport can be swapped without touching game logic.
- **Authentication** — Student accounts (likely via a school SSO / OAuth provider such as Google Classroom or Clever). Design game identity (`studentId`) as an opaque string from day one so the source can change.
- **Database** — A relational store (e.g. PostgreSQL on Azure) for student records, scores, and progress snapshots. The local `shared/analytics` schema should mirror what would eventually be sent upstream.
- **Infrastructure as Code** — When a backend is introduced, all cloud resources should be defined in Terraform or Azure Bicep. Do not manually configure production infrastructure.

### Leaderboard Service

- Per-game, per-grade, and per-skill leaderboards with opt-in participation (COPPA compliance required for under-13 users).
- Score submissions must be idempotent — design `ScoreManager` events to carry a client-generated session UUID so duplicate submissions are safe to ignore server-side.
- Leaderboards should degrade gracefully: if the backend is unreachable, the game still runs and scores are queued locally for later sync.

### Student Progress Tracking Across Devices

- Cloud sync of the data currently stored locally by `shared/analytics`.
- Progress should be keyed by `studentId`, not device — the local store becomes a write-ahead cache that syncs on connectivity.
- Offline-first architecture: use a sync queue (e.g. background fetch or service worker) so play sessions on a Chromebook, tablet, and phone all converge.

### Parent Dashboard

- A separate web application (outside this monorepo, or in a new `apps/` workspace) that reads from the same backend.
- Read-only view of a child's progress: skills mastered, time played, problem accuracy by grade standard.
- No game logic lives in the dashboard — it consumes the same API the games write to.
- Must meet COPPA / FERPA requirements: parental consent gates, data deletion on request, no third-party sharing.

### Agents' Responsibilities Now

- Keep `shared/analytics` events well-typed and versioned (`{ event, version, payload }`) — this is the contract the future sync layer will consume.
- Never couple game scenes directly to `localStorage` or any persistence layer — always go through `ScoreManager` / `AnalyticsManager` so the backing store can be swapped.
- Document any decision that would be hard to reverse once a backend exists in `docs/adrs/`.

---

## Critical Rules — Never Do These

- **No external network calls.** No analytics, tracking, or any outbound HTTP from game code.
- **No localStorage during gameplay.** In-memory only. See localStorage Policy above for what is and is not allowed.
- **No new npm dependencies** without explicit Creative Director approval.
- **No hardcoded math problems.** All problems come from `shared/math-engine/`.
- **No skipping tests.** Every new system or significant function gets at minimum a unit test.
- **No `alert()`, `confirm()`, or `prompt()`.** These break mobile gameplay.
- **No cross-game imports.** Shared code lives in `/shared/`. Games never import from each other.
- **No modifying source code from quality tier agents.** Quality agents produce reports only. The QA agent may write test files but never modifies game source code.
- **No agent runs exceeding 50 turns.** If a task requires more, decompose it into smaller tasks.