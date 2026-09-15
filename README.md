# Legacy XI

A football career simulator: create one player, live their whole career season
by season, and see how they stack up on a shared all-time leaderboard.

## Structure

- `packages/sim` — the simulation engine. Pure TypeScript, no UI or network
  dependencies: aging curve, appearance/goal/assist formulas, event system,
  world-rank and career-score math. Has its own test suite (`npm test`).
- `apps/server` — a small Express + Prisma API that persists the shared,
  cross-device all-time leaderboard (SQLite in dev; point `DATABASE_URL` at
  Postgres for production, no code changes needed).
- `apps/web` — the game itself: a React + Vite PWA that imports `@legacyxi/sim`
  directly and talks to the server only for the leaderboard.

## Running it

```bash
npm install

# terminal 1 — leaderboard API
cd apps/server
npx prisma db push   # first run only, creates dev.db
npm run seed         # first run only, seeds a few placeholder legends
npm run dev

# terminal 2 — the game
cd apps/web
npm run dev
```

Open http://localhost:5173.

## Tests

```bash
npm test   # runs the sim package's vitest suite
```
