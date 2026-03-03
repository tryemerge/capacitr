---
title: "ADR v1: Shared Persistence and Auth with Minimal Vercel-First Dependencies"
date: 2026-03-02
status: proposed
---

# ADR v1: Shared Persistence and Auth with Minimal Vercel-First Dependencies

## Y-Statement

In the context of **the Capacitor simulator moving from single-user local sessions to multi-user shared usage**,
facing **the need for durable cross-device persistence and basic identity controls without adding heavy third-party platform dependencies**,
we decided for **Vercel Postgres-backed persistence plus first-party anonymous session auth using signed HttpOnly cookies in Next.js route handlers**
and against **localStorage-only persistence, Upstash/Edge Config as the system of record, and full external auth platforms (e.g., Clerk/Supabase Auth) in v1**,
to achieve **a deployable, low-ops, team-shareable simulator where setup/runs are tied to user sessions and can evolve to stronger auth later**,
accepting **that anonymous accounts are not portable across browsers by default and role/enterprise auth is deferred**,
because **this gives the lightest production path on Vercel while preserving a clean migration path to OAuth/account linking when needed**.

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

### 1. Persistence system of record: Vercel Postgres

Use Vercel Postgres as the durable backend for:

- `launchpad_setups` (named setup snapshots/configs)
- `sim_runs` (summary metadata)
- `sim_run_events` or compressed snapshot payloads (depending on storage/perf tradeoff)
- `users` (anonymous user identity records)

Rationale:

- Relational model fits user-owned artifacts and querying (list runs by user, sort/filter by date/outcome).
- Durable and production-safe for shared usage.
- Vercel-first operational model (single deployment plane with env-managed connection strings).

### 2. Auth model v1: Anonymous first-party session auth

Implement anonymous identity with:

- Secure random `user_id` generated server-side.
- Signed and HttpOnly cookie (`sid`) set by API/session bootstrap.
- Server-side session verification in route handlers.
- Automatic user provisioning on first visit.

Rationale:

- No external auth provider required in v1.
- Low friction for “others can play” immediately.
- Supports per-user ownership and rate limiting.

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

### Full external auth platform (Clerk, Supabase Auth, Auth0) in v1

Rejected for initial phase because it adds integration and policy surface area beyond current scope. Anonymous first-party sessions satisfy immediate multi-user needs with less operational complexity.

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
