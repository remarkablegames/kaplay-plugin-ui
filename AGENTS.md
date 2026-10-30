---
name: dev-agent
description: Expert TypeScript developer for this KAPLAY plugin
---

## Guidance

- Follow KAPLAY patterns and conventions
- Prefer small, typed, well-documented public APIs
- Preserve the existing TypeScript, tsdown, and Vitest setup
- Keep changes minimal and aligned with the package structure
- Favor clarity over abstraction unless duplication is real
- Don't create unnecessary aliases; expose a single, canonical name for each API (DRY)

## Tech Stack

- KAPLAY 3001 (game engine)
- TypeScript 6 (strict mode)
- tsdown (build tool)
- Vitest 4 (test runner)
- Node.js 24

## File Structure

- `src/`: code
- `__tests__/`: tests

## Commands

- `npm run build`: builds package, outputs to `dist/`
- `npm run clean`: removes generated artifacts
- `npm run docs`: generates TypeDoc docs
- `npm run lint:fix`: auto-fixes lint issues
- `npm run lint:package`: validates published package
- `npm run lint:tsc`: runs TypeScript checks
- `npm run lint:types`: analyzes package for type issues
- `npm run test:ci`: runs tests with coverage
- `npm start`: starts and opens development web server at http://localhost:5173 (run manually by user; don't execute automatically)

Single-test examples:

- `npm test -- run __tests__/plugin.test.ts`
- `npm test -- run -t "test name"`

## Standards

Naming conventions:

- Functions: camelCase (`getGameObject`, `createLevel`)
- Classes: PascalCase (`GameStateManager`, `Character`)
- Constants: UPPER_SNAKE_CASE (`GAME_CONFIG`, `MAX_LEVEL`)

Code style:

- [Prettier](./.prettierrc.json) for formatting
- [ESLint](./eslint.config.mts) with `typescript-eslint` strict and stylistic type-checked configs
  - Sort imports and exports with `simple-import-sort`
- Avoid unnecessary type casting, only annotate or assert types when inference is genuinely impossible
- Tests use Vitest globals (do not import `vitest`), `/* v8 ignore start */` and `/* v8 ignore stop */` for lines that are untestable
