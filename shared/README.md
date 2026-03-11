# shared/

Shared libraries used by all Arcade Swarm games. Each package is framework-agnostic — **no Phaser, no DOM, no game-engine dependencies**.

Games import these packages via npm workspaces:

```js
import { generateProblem } from '@arcade-swarm/math-engine'
import { playRetroBlip } from '@arcade-swarm/audio'
```

## Packages

| Package | Purpose | Imported by games? |
|---|---|---|
| [`math-engine`](./math-engine/) | Procedural math problem generation (Common Core aligned) | Yes — required |
| [`audio`](./audio/) | Retro audio effect helpers | Yes — optional |
| [`visual`](./visual/) | Retro visual effect helpers | Yes — optional |
| [`analytics`](./analytics/) | Local-only learning progress tracking | Yes — optional |

## Rules

- **No external network calls** in any shared package.
- **No localStorage** except in `analytics/` (for optional settings persistence).
- **No game imports** — shared code must never import from `games/`.
- Each package is independently testable: `npm run test:run` from within any subdirectory.

## math-engine API contract

```ts
generateProblem(input: { gradeLevel: number, skillType: string }): {
  question: string
  correctAnswer: number | string
  distractors: (number | string)[]
}
```

All math problems in every game come exclusively from this library. Hardcoded problem strings are forbidden.
