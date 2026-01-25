# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common commands

### Install
- Install deps:
  - `npm install`

### Develop
- Start dev server:
  - `npm run dev`
  - Vite will print the local URL (commonly `http://localhost:5173`).

### Lint
- Lint the repo:
  - `npm run lint`

### Build / preview production
- Production build (TypeScript build + Vite bundle):
  - `npm run build`
- Preview the production build locally:
  - `npm run preview`

### Tests
- No test runner is currently configured (there is no `test` script in `package.json`).

## High-level architecture

### What this repo is
A small Vite + React + TypeScript single-page app implementing a “Mental Math Challenge” multiplication game.

### Runtime entrypoints
- `index.html` mounts the app at `#root`.
- `src/main.tsx` is the React entrypoint:
  - renders `<App />`
  - also mounts Vercel instrumentation (`@vercel/analytics` and `@vercel/speed-insights`).

### Core UI / game logic
- `src/App.tsx` contains essentially all game logic and UI states:
  - Setup screen (collects player name + max multiplicand)
  - Game loop (20 rounds; random operands between `MIN_NUMBER` and the user-selected max)
  - Game-over screen (final score + total time)
  - Uses a `setTimeout` delay to show correctness feedback before advancing to the next round.

### Build and tooling
- `vite.config.ts` is a minimal Vite config using `@vitejs/plugin-react`.
- TypeScript uses project references:
  - `tsconfig.json` references `tsconfig.app.json` (browser app code under `src/`) and `tsconfig.node.json` (build tooling like `vite.config.ts`).
- ESLint is configured via the flat config in `eslint.config.js` (TypeScript + react-hooks + react-refresh rules).