# tests/

Monorepo-level tests that span multiple games or validate cross-cutting concerns.

## Structure

```
tests/
  e2e/           # End-to-end browser tests (Playwright) — cross-game flows
  integration/   # Integration tests — shared library + game wiring
```

## What lives here vs. in a game directory

| Test type | Location | Runner |
|---|---|---|
| Unit tests for a game | `games/<game-name>/tests/unit/` | `npm run test:run` (Vitest) from game dir |
| Unit tests for a shared lib | `shared/<lib-name>/` (colocated) | `npm run test:run` (Vitest) from lib dir |
| E2E tests (single game) | `games/<game-name>/tests/` or here | `npm run test:e2e` (Playwright) |
| Cross-game / monorepo E2E | `tests/e2e/` | Playwright from repo root |
| Shared lib integration | `tests/integration/` | Vitest from repo root |

## Running all tests

```bash
# From repo root — runs tests in all workspaces
npm run test
```
