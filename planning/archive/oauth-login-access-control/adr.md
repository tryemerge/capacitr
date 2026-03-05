---
title: "ADR v1: Shared Persistence and Auth with Minimal Vercel-First Dependencies"
date: 2026-03-02
status: accepted
---

# ADR v1: Shared Persistence and Auth with Minimal Vercel-First Dependencies

## Y-Statement

In the context of **the Capacitor simulator moving from single-user local sessions to multi-user shared usage**,
facing **the need for durable cross-device persistence and basic identity controls without adding heavy third-party platform dependencies**,
we decided for **GCP Cloud SQL (PostgreSQL) via Drizzle ORM + PgBouncer pooling, shared as `@capacitr/database` workspace package, plus Better Auth (anonymous plugin → OAuth upgrade path) for session management in Next.js**
and against **localStorage-only persistence, Upstash/Edge Config as the system of record, Vercel Postgres, hand-rolled HMAC session cookies, and fully managed external auth platforms (e.g., Clerk/Supabase Auth) in v1**,
to achieve **a deployable, low-ops, team-shareable simulator where setup/runs are tied to user sessions with a clear path to gated access and real accounts**,
accepting **that anonymous accounts are not portable across browsers by default and role/enterprise auth is deferred**,
because **Better Auth is TypeScript-first, self-hosted, has a Drizzle adapter, supports anonymous-first → OAuth upgrade without data migration, and handles session cookie signing correctly out of the box — avoiding hand-rolled crypto while still keeping all auth infrastructure under our control**.

## Context

Current simulator persistence is browser-local:

- Launchpad configuration and run history rely on `localStorage` patterns (for example `loadEmitterRuns()` / `saveEmitterRun()` in [apps/sim/src/lib/emitter-runs.ts](apps/sim/src/lib/emitter-runs.ts)).
- Launchpad setup values are currently being moved toward local persistence in the UI layer ([apps/sim/src/components/EmitterSandbox.tsx](apps/sim/src/components/EmitterSandbox.tsx)).
- The app has Next.js API route capacity already ([apps/sim/src/app/api/deliberate/route.ts](apps/sim/src/app/api/deliberate/route.ts)), but no shared persistence/auth boundary for simulation data.

This blocks:

- Shared usage across team members.
- Cross-device continuity.
- Any future user-level quotas, privacy controls, and ownership boundaries for saved simulation artifacts.

The stated product direction is to keep integrations minimal and Vercel-centric.

## Decision

### 1. Persistence system of record: GCP Cloud SQL (PostgreSQL) + Drizzle ORM

Use the existing GCP Cloud SQL PostgreSQL instance as the durable backend, accessed via **Drizzle ORM** in a shared `@capacitr/database` workspace package:

- `users` — anonymous user identity records
- `launchpad_setups` — named setup snapshots/configs
- `emitter_runs` — launchpad simulation results
- `governance_runs` — governance/deliberation simulation results

Connection model:
- `DATABASE_URL` → PgBouncer pool port (runtime queries, serverless-safe)
- `DIRECT_URL` → direct port (migrations only, bypasses PgBouncer)
- Drizzle schema defined in TypeScript, migrations via `drizzle-kit`

Rationale:

- Team already operates the Cloud SQL instance — no new infrastructure.
- Drizzle is TypeScript-first, lightweight, no code generation at runtime.
- PgBouncer (already running on pool port) solves the serverless connection problem cleanly.
- Shared as `packages/database` (`@capacitr/database`) so any future app can import the same schema and client.

### 2. Auth model v1: Better Auth with anonymous plugin

Use **Better Auth** (`better-auth`) as the session and identity layer:

- Anonymous plugin: first-visit auto-provisions a session with no credentials required.
- Session stored in DB (Better Auth manages its own `session` table via Drizzle adapter).
- HttpOnly cookie signing/rotation handled by the library.
- Catch-all API route: `apps/sim/src/app/api/auth/[...all]/route.ts`.
- Middleware: `middleware.ts` guards protected routes using `getSessionCookie()`.
- Client: `createAuthClient({ plugins: [anonymousClient()] })` in `lib/auth-client.ts`.

Upgrade path to real accounts: add OAuth providers (GitHub, Google) to the `betterAuth()` config; existing `users` rows persist and can be linked via `onLinkAccount` callback.

Rationale:

- Self-hosted — no vendor, no cost, no lock-in.
- TypeScript-first with Drizzle adapter: schema additions are generated via `@better-auth/cli generate`.
- Handles cookie signing, rotation, and CSRF correctly — no hand-rolled crypto.
- Anonymous → OAuth upgrade is a config change, not a data migration.
- Route-level gatekeeping via `middleware.ts` matcher is straightforward to extend.

### 3. API boundary

Add route handlers for setup/run CRUD under `apps/sim/src/app/api/` and move persistence writes/reads out of client `localStorage` for shared mode.

- `GET/POST /api/setup`
- `GET/POST /api/runs`
- `GET /api/runs/:id`
- `DELETE /api/runs/:id`

Client components (`EmitterSandbox`, `EmitterRuns`) use these endpoints and keep optional local cache only as UX optimization, not source of truth.

### 4. Deferred capabilities

Defer to later ADR/impl:

- OAuth/social sign-in and account linking.
- Team/org roles and RBAC.
- Edge cache/read replicas.

## Alternatives Considered

### localStorage-only + optional export/import

Rejected because it cannot provide shared persistence, robust ownership, or admin controls across users/devices.

### Upstash KV / Edge Config as primary persistence

Rejected for v1 system-of-record needs:

- KV/Edge Config are better for cache/config distribution than relational user-owned datasets.
- Modeling runs, snapshots, ownership, and query needs in KV increases complexity and migration risk.

### Hand-rolled HMAC session cookies

Rejected because it duplicates work Better Auth already does correctly — session signing, rotation, secure defaults, anonymous user provisioning — with none of the upgrade path.

### Full external auth platform (Clerk, Supabase Auth, Auth0) in v1

Rejected for initial phase because it adds cost, vendor dependency, and policy surface area beyond current scope. Better Auth gives equivalent session management self-hosted.

## Consequences

### Positive
- Shared persistence works locally and on Vercel using the same app API shape.
- Minimal third-party footprint beyond Vercel deployment primitives.
- Clear separation between client UI and server-owned data.
- Future OAuth can be layered onto existing `users` records without redesigning run/setup data.

### Negative
- Anonymous session identity is weaker than full account auth.
- Losing cookies loses identity unless/ until account-linking exists.
- Additional server/API and schema work compared to pure frontend storage.

### Risks
- Cookie/session bugs could orphan user data ownership.
  Mitigation: strict session signing, schema-level ownership checks, and integration tests for CRUD authorization.
- Snapshot payload growth may increase storage cost.
  Mitigation: store summarized metrics by default; gate full event persistence behind sampling/compression policy.

## References

- [apps/sim/src/components/EmitterSandbox.tsx](apps/sim/src/components/EmitterSandbox.tsx)
- [apps/sim/src/components/EmitterRuns.tsx](apps/sim/src/components/EmitterRuns.tsx)
- [apps/sim/src/lib/emitter-runs.ts](apps/sim/src/lib/emitter-runs.ts)
- [apps/sim/src/app/api/deliberate/route.ts](apps/sim/src/app/api/deliberate/route.ts)
- [apps/docs/content/planning/adr/v1-2026-03-01-3-cross-system-integration-adr.md](apps/docs/content/planning/adr/v1-2026-03-01-3-cross-system-integration-adr.md)
