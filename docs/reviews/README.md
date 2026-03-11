# docs/reviews/

Quality tier agent reports are written here after each build cycle. Reports are read-only artifacts — they inform the Creative Director's review but do not trigger automatic code changes.

## Structure

Each report file is named `<agent>-<YYYY-MM-DD>.md` (e.g. `architecture-2026-03-08.md`).

| Agent | Scope |
|---|---|
| `architecture-*.md` | Pattern consistency, design coherence, ADR compliance |
| `security-*.md` | Dependency audit, privacy checks, supply chain review |
| `qa-*.md` | Test coverage, math correctness validation, known failures |
| `accessibility-*.md` | WCAG 2.2 compliance, keyboard navigation, color contrast |
| `performance-*.md` | Bundle size, mobile FPS, Lighthouse scores, browser compatibility |

## Rules

- Quality agents write here and **nowhere else**.
- Source code is never modified by quality agents (QA agent may write test files under `games/*/tests/` only).
- The Creative Director reviews these reports before approving any PR merge.
