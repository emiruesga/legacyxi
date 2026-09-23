# Legacy XI

A football career simulator: create one player, live their whole career season
by season, and see how they stack up on a shared all-time leaderboard.

## Structure

- `packages/sim` — the simulation engine. Pure TypeScript, no UI or network
  dependencies: aging curve, appearance/goal/assist formulas, event system,
  world-rank and career-score math. Has its own test suite (`npm test`).
- `apps/server` — a small Express + Prisma API that persists the shared,
  cross-device all-time leaderboard. Postgres both in dev and production —
  point `DATABASE_URL` at whichever instance you're using.
- `apps/web` — the game itself: a React + Vite PWA that imports `@legacyxi/sim`
  directly and talks to the server only for the leaderboard.

## Running it

You'll need a Postgres database. The easiest local option is a free one from
[Neon](https://neon.tech) or [Railway](https://railway.app) — copy its
connection string into `apps/server/.env` (see `apps/server/.env.example`).
A local Postgres install works too.

```bash
npm install

# terminal 1 — leaderboard API
cd apps/server
cp .env.example .env   # then edit DATABASE_URL
npx prisma db push     # first run only, creates the schema
npm run seed           # first run only, seeds a few placeholder legends
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

## Deploying it for real

The app splits cleanly into a static frontend (`apps/web`) and a small API
(`apps/server`). Deploy each to a free host and point them at each other.

### 1. Backend — Render

Render's free tier gives you a Postgres database and a web service together.

1. Push this repo to GitHub (if it isn't already), then go to
   [render.com](https://render.com) → **New** → **Blueprint**, and connect
   the repo. Render reads `render.yaml` at the repo root and provisions a
   free Postgres database (`legacyxi-db`) plus a web service
   (`legacyxi-server`) automatically — no manual config needed for those.
2. Once it's live, Render gives the web service a public URL, e.g.
   `https://legacyxi-server.onrender.com`. Copy it.
3. After you've deployed the frontend (next step) and have its URL, go to
   the `legacyxi-server` service → **Environment** and set `CORS_ORIGIN` to
   that frontend URL (e.g. `https://legacyxi.vercel.app`). This locks the API
   down to your site instead of allowing any origin.

Render's free web services spin down after inactivity and take ~30-50s to
wake up on the next request — the first leaderboard call after a quiet
period will be slow. That's expected on the free tier.

### 2. Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**, and
   import the same repo. Vercel reads `vercel.json` at the repo root, which
   tells it to build only the `@legacyxi/web` workspace and serve
   `apps/web/dist` — no manual build settings needed.
2. Before the first deploy (or after, then redeploy), add a project
   environment variable: `VITE_API_BASE` = your Render service's URL from
   step 1 (e.g. `https://legacyxi-server.onrender.com`). This is baked in at
   build time, so changing it later requires a redeploy.
3. Deploy. Vercel gives you a URL like `https://legacyxi.vercel.app` — that's
   your live site. Go back to Render and set `CORS_ORIGIN` to it (step 1.3).

That's it — the frontend talks to the backend over `VITE_API_BASE`, and the
backend only accepts requests from `CORS_ORIGIN`. Both hosts redeploy
automatically on every push to this branch.
