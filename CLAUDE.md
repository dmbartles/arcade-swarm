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
- `docs/references/<game-name>/` — **Visual reference images** dropped in by the Creative Director before build starts. The art direction agent reads these images directly and must anchor every major style decision to a file found here. See [Visual References](#visual-references) below for naming conventions.
- `docs/gdds/`, `docs/style-guides/`, `docs/sound-guides/`, `docs/curriculum-maps/` — Agent-generated artifacts
- `docs/build-plans/` — Per-agent build plans written by the Coordinator agent
- `docs/reviews/` — Quality tier agent reports (architecture, security, QA, accessibility, performance)
- `docs/adrs/` — Architecture Decision Records

### Agent Architecture

This project is built by a swarm of Claude Code agents, all orchestrated by a Python supervisor running locally. There is no Azure AI Foundry or external agent platform — every agent runs a tool-use loop via the Anthropic SDK with specialized instructions and tool permissions.

#### Agent Tiers

**Design Tier** — Produce specifications, not code. Write only to `docs/`.
- Game Design Agent: Reads creative briefs, produces Game Design Documents
- Art Direction Agent: Reads creative briefs + GDD + **visual reference images from `docs/references/<game>/`**; produces visual style guides with exact hex codes, font specs, sprite dimensions — every decision anchored to a reference
- Sound Direction Agent: Reads brief + GDD + visual style guide (as tonal anchor); produces `docs/sound-guides/<game>.md` — defines every sound event ID, music track, npm library choice, volume hierarchy, and audio polish rules. Build agents must not make audio decisions not specified here.
- Curriculum Alignment Agent: Maps math content to Common Core standards by grade level
- Asset Creation Agent: Reads style guide + references; writes `games/<game>/src/assets/SpriteFactory.ts` — procedurally draws every sprite in the style guide using HTML Canvas so build agents load real pixel art, not rectangles

**Build Tier** — Write code. Each agent operates in its own git worktree.
- Engine Agent: Game engine, rendering, scene management, visual effects — imports from SpriteFactory
- Gameplay Agent: Gameplay mechanics, entities, input handling, scoring
- Math Agent: Math engine, difficulty scaling, curriculum integration
- DevEx Agent: Build pipeline, CI/CD, project configuration, tooling

**Quality Tier** — Review and test. Produce reports to `docs/reviews/`. Do not modify source code unless explicitly noted.
- Architecture Agent: Pattern consistency and design coherence review
- Security Agent: Dependency scanning, privacy checks, supply chain review
- QA Agent: Test writing and execution, math correctness validation (exception: this agent writes test code)
- Accessibility Agent: WCAG 2.2 compliance, keyboard navigation, color contrast
- Performance Agent: Bundle size, mobile FPS, browser compatibility, Lighthouse audits

#### Agent Tool Permissions
- Design agents: `Read, Write, Edit` (read specs, write documents to `docs/` only)
  - Exception: Asset Creation Agent gets `Read, Write, Edit` with write access to `games/<game>/src/assets/` only
- Build agents: `Read, Write, Edit, Bash, Glob, Grep` (full development access within their worktree)
- Quality agents: `Read, Grep, Glob` (read-only review, no code changes)
  - Exception: QA agent gets `Read, Write, Edit, Bash` (writes tests and runs them)
  - Exception: Security agent gets `Read, Grep, Glob, Bash` (runs `npm audit`)
- Patch agent: `Read, Write, Edit, Bash, Glob` (targeted fixes to an already-built game; runs in main repo, no worktree)

#### Agent Isolation Rules
- Build agents work in separate git worktrees to prevent conflicts
- Quality agents NEVER modify source code — they produce reports in `docs/reviews/` only
- Design agents write ONLY to `docs/` — never to `games/` or `shared/` (except Asset Creation Agent — see above)
- No agent should run for more than 50 turns on a single task
- The supervisor enforces a 10-minute timeout per agent run

#### Supervisor Operation
The supervisor (`supervisor/main.py`) orchestrates agents via the Anthropic SDK:
1. Design tier runs sequentially (each depends on the previous output):
   - game-design → art-direction → sound-direction → curriculum → **assets**
   - The art-direction agent receives reference images from `docs/references/<game>/` injected directly into its context as base64 image blocks — it literally sees the images, not just text descriptions
   - The assets agent writes `SpriteFactory.ts` to master before build agents start
2. Build tier runs in five phases (DevEx → Coordinator → Engine → Gameplay+Math parallel → Integration)
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
git worktree add ../agent-engine feature/game-engine
git worktree add ../agent-gameplay feature/gameplay-mechanics
git worktree add ../agent-math feature/math-engine
```

### Visual References

Before running the design tier on any game, the Creative Director drops reference images into `docs/references/<game-name>/`. The art direction agent receives these images injected directly into its API context — it sees the actual pixels, not text descriptions.

**What to include:** Sketches, screenshots of reference games, mood images, color palette photos, pixel art samples you like the look of, UI composition references.

**What NOT to include:** Copyrighted assets you intend to ship. References are inspiration only — the asset creation agent produces original art derived from them.

**The `manifest.md` file** — also drop a `manifest.md` alongside the images. Write one sentence per image describing what to take from it. The art direction agent reads this file to understand your intent before it sees the image:
```
playfield-layout-sketch.jpg — My rough layout. Respect the city positions and launcher placement shown here exactly.
missile-command-1980-screenshot.png — Original Missile Command. Match the near-black background and phosphor-green launcher color. The missiles are thin angular lines, not thick shapes.
explosion-palette-ref.png — The pastel lavender/mint/gold explosion palette I want. NOT orange fire.
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
- Web-first design, to be mainly use on broswers, so the game should scale with window size
- Mobile 2nd: every feature must work on touch screens, target 60fps on a 3-year-old mid-range Android phone
- Game state during gameplay lives in memory only — see the localStorage Policy section for exactly what is and is not permitted
- **Never use raw string literals for sprite or animation keys.** Always import `SPRITE_KEYS` and `ANIM_KEYS` from `src/assets` and reference keys through those consts. A typo in a raw string is a silent runtime failure; a typo in a const reference is a compile error caught before the game runs.

## Git Workflow

- `main` is always deployable and auto-deploys to GitHub Pages via `.github/workflows/deploy.yml`
- Feature branches: `feature/description-of-work`
- Commit messages follow **Conventional Commits**: `feat:`, `fix:`, `docs:`, `test:`, `chore:`
- PR requirements: all tests pass, no new lint errors, bundle size check passes

## localStorage Policy

- **ALLOWED** for: high score persistence (arcade-style 3-letter initials + score), user settings (sound volume, preferred difficulty), accessibility preferences (reduced motion, high contrast mode)
- **NOT ALLOWED** for: saving mid-game state, storing any personally identifiable information, tracking gameplay behavior across sessions, or any data that could identify a specific child

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
- **Keep `shared/analytics` events well-typed and versioned** (`{ event, version, payload }`) — this is the contract a future sync layer will consume.
- **Never couple game scenes directly to `localStorage`** or any persistence layer — always go through `ScoreManager` / `AnalyticsManager` so the backing store can be swapped.
- **Document hard-to-reverse decisions** in `docs/adrs/` — especially anything that would be difficult to change once a backend or second game exists.