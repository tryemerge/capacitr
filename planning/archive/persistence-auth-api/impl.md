---
title: "Impl v1: Persistence, Auth, and API Layer"
date: 2026-03-03
status: completed
adr: v1-2026-03-02-1-persistence-and-auth-minimal-vercel-adr.md
---

# Impl v1: Persistence, Auth, and API Layer

## Goal

Move simulator persistence from `localStorage` to a server-owned API backed by GCP Cloud SQL (PostgreSQL) via Drizzle ORM. Add anonymous session auth via signed HttpOnly cookies. Enable team members to share and compare runs across devices.

## Scope

### In Scope

- Initial DB migration via `drizzle-kit push` from `packages/database`
- Session bootstrap: anonymous `users` row + signed `sid` cookie
- API route handlers in `apps/sim/src/app/api/` for session, setups, and runs
- Swap `localStorage` reads/writes in `EmitterRuns`, `EmitterSandbox`, and `SimulationRuns`
- Cross-run comparison UI for the Launchpad runs page (`/emitter/runs`)

### Out of Scope

- OAuth / social sign-in (deferred)
- Governance run persistence wiring (separate impl once governance sim is stable)
- Full snapshot storage for governance runs (summarized form only in v1)
- RBAC / team accounts

---

## Checklist

### Phase 1: Database Setup

- [ ] Run `pnpm db:push` from `packages/database` to create tables from schema in Cloud SQL
  - Requires `DIRECT_URL` loaded in env (use `apps/sim/.ce.production` or a local `.env`)
  - Tables: `users`, `launchpad_setups`, `emitter_runs`, `governance_runs`
  - **Manual step** — run with: `cd packages/database && dotenv -e ../apps/sim/.ce.production -- pnpm db:push`
- [ ] Verify all four tables exist in Cloud SQL (via `psql` or a GUI)
  - **Manual step**
- [x] Add `db:push` and `db:studio` scripts to `packages/database/package.json`
  - Already present: `db:generate`, `db:migrate`, `db:push`, `db:studio`

### Phase 2: Better Auth Setup

- [x] Add `better-auth` to `apps/sim/package.json` dependencies and run `pnpm install`
  - Installed `better-auth@1.5.1`; also bumped `drizzle-orm` in `packages/database` to `^0.41.0` to satisfy peer dep
- [x] Generate the Better Auth schema additions into `packages/database/src/schema.ts`
  - Wrote Better Auth tables manually (`user`, `session`, `account`, `verification`) with anonymous plugin `isAnonymous` field
  - Removed old `users` table — replaced by Better Auth's `user` table
  - Updated FK columns in `launchpadSetups`, `emitterRuns`, `governanceRuns` from `uuid` → `text` to match Better Auth IDs
- [ ] Run `pnpm db:push` again to apply the new tables to Cloud SQL
  - **Manual step** — run after Phase 1 db:push with DIRECT_URL loaded
- [x] Create `apps/sim/src/lib/auth.ts` — server-side auth instance
- [x] Create `apps/sim/src/lib/auth-client.ts` — client-side auth instance
- [x] Create `apps/sim/src/app/api/auth/[...all]/route.ts` — catch-all Next.js handler
- [x] Create `apps/sim/middleware.ts` — route protection
  - Matcher: `["/admin/:path*"]` — placeholder for future gated routes
- [x] Create `apps/sim/src/lib/get-session.ts` — shared server helper

### Phase 3: API Routes

#### Setups

- [x] Create `apps/sim/src/app/api/setups/route.ts`
- [x] Create `apps/sim/src/app/api/setups/[id]/route.ts`

#### Runs

- [x] Create `apps/sim/src/app/api/runs/route.ts`
  - GET omits snapshots column for list view performance
  - POST upserts via `onConflictDoUpdate`
- [x] Create `apps/sim/src/app/api/runs/[id]/route.ts`

#### Error handling

- [x] All routes: return `401` if `getSession()` returns null (cookie missing or invalid)
- [x] All routes: return `403` if resource `userId` does not match session `userId`
- [x] All routes: use try/catch → `500` with a safe message (no stack traces in response body)

### Phase 4: Client-Side Wiring

#### EmitterRuns (`apps/sim/src/components/EmitterRuns.tsx`)

- [x] On mount: call `authClient.signIn.anonymous()` to ensure a session exists (no-op if session already set), then `GET /api/runs`
- [x] After a simulation completes: `POST /api/runs` instead of `saveEmitterRun()`
- [x] Delete button: `DELETE /api/runs/:id` then refresh list
- [x] Keep `SavedEmitterRun` type in `emitter-runs.ts` — used for deserialization
- [x] Remove the `loadEmitterRuns()` / `saveEmitterRun()` / `deleteEmitterRun()` localStorage calls (kept type definitions)
- [x] Show a loading state while runs are fetching (skeleton rows with animate-pulse)

#### EmitterSandbox (`apps/sim/src/components/EmitterSandbox.tsx`)

- [x] On mount: call `authClient.signIn.anonymous()`, then `GET /api/setups`
- [x] Save setup button: "Save Setup" button → inline name input → `POST /api/setups`
- [x] Load setup: dropdown + pill list from API setups; clicking loads config into form state
- [ ] Remove `saveLaunchpadSetupValues()` / `loadLaunchpadSetupValues()` localStorage calls from this component
  - **Deferred**: localStorage scratch state still needed for "From Setup" preset in EmitterRuns. Defer until that flow migrates to API-backed setup selection.

#### SimulationRuns (`apps/sim/src/components/SimulationRuns.tsx`)

- [x] Check if `SimulationRuns` currently uses localStorage — yes, via `loadRuns`/`saveRun`/`deleteRun` in `runs.ts`
  - Created separate `/api/governance-runs` and `/api/governance-runs/[id]` routes
  - Removed `loadRuns`, `saveRun`, `deleteRun` imports; kept `SavedRun`, `RunSummary` types
- [x] Load governance runs from API on mount via `authClient.signIn.anonymous()` then `GET /api/governance-runs`

### Phase 5: Cross-Run Comparison (Launchpad Runs)

- [x] Add multi-select checkboxes to the runs list in `EmitterRuns` (up to 3 runs)
- [x] Add a "Compare" button that appears when 2+ runs are selected
- [x] Comparison panel (shown below the runs list):
  - 8-metric stat table: token price, emToken price, emToken in TKN, total volume, creator USDC, pool value, work events, reserve depleted
  - Each column labeled with run name + date
  - Best value highlighted in emerald green
- [x] Fetch full run data (with snapshots) for selected runs via `GET /api/runs/:id`
- [x] Chart: CSS-only overlay of token price curves across selected runs (indigo / amber / emerald)
- [x] "Clear selection" / "✕ Close" buttons to dismiss comparison

### Phase 6: Verification

- [x] `npx turbo build --filter=sim` passes with no type errors
  - Fixed: added `drizzle-orm` to `apps/sim` deps; made `getAuth()` lazy to avoid build-time `DATABASE_URL` error; used `ReturnType<typeof createAuth>` pattern to preserve plugin types
- [ ] First browser visit: Better Auth sets session cookie, `user` + `session` rows created in DB (**manual — needs DB**)
- [ ] Second visit (same browser): same session returned, no new user created (**manual**)
- [ ] Save a run → appears in `GET /api/runs` → persists after page refresh (**manual**)
- [ ] Delete a run → removed from DB, disappears from list (**manual**)
- [ ] Different browser (no cookie): new anonymous user provisioned, cannot read other user's runs (401/403) (**manual**)
- [ ] Future gated route (e.g. `/admin`) redirected by middleware when no session cookie (**manual**)
- [ ] Comparison panel shows 2+ runs side by side with best-value highlights (**manual**)
- [ ] Price overlay chart renders correctly for 2+ selected runs (**manual**)
