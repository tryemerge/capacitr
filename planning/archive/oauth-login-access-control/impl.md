---
title: "Impl v1: OAuth Login and Access Control"
date: 2026-03-03
status: completed
adr: v1-2026-03-02-1-persistence-and-auth-minimal-vercel-adr.md
---

# Impl v1: OAuth Login and Access Control

## Goal

Activate the Better Auth OAuth upgrade path (Google provider) to replace anonymous-only auth. Add a login page and gate all sim routes behind authentication. Control access via an email allowlist.

## Scope

### In Scope

- Google OAuth provider added to `auth.ts`
- `/login` page with Google sign-in button
- Middleware updated to gate all sim routes (redirect unauthenticated → `/login`)
- Allowlist check: only emails in `ALLOWED_EMAILS` env var can sign in
- Env vars wired through composable.env (sim component + contract)
- Remove `authClient.signIn.anonymous()` calls from components — replaced with session check + redirect

### Out of Scope

- GitHub OAuth (can be added later as a second provider)
- Account linking from existing anonymous sessions (data is still there, linking deferred)
- RBAC / roles
- Account management UI (logout is sufficient for v1)

---

## Checklist

### Phase 1: Env Vars

- [x] Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ALLOWED_EMAILS` to `env/components/sim.env`
  - Vars come from composable.env component system — already present in `.ce.production`
- [x] Add those vars to `env/contracts/sim.contract.json` required fields
- [x] Add Google OAuth credentials to Vercel env vars (manual — done in Google Cloud Console + Vercel dashboard)

### Phase 2: Server Auth Config

- [x] Add `socialProviders.google` to `auth.ts` with `clientId` / `clientSecret` from env
- [x] Add `allowlist` check in Better Auth `hooks.before` (or `callbacks.signIn`) — reject emails not in `ALLOWED_EMAILS`
- [x] Remove `anonymous()` plugin from `auth.ts` (no longer needed as entry point)
- [x] Update `auth-client.ts` — remove `anonymousClient()` plugin, no other changes needed

### Phase 3: Login Page

- [x] Create `apps/sim/src/app/login/page.tsx`
  - Dark-themed, centered card
  - "Sign in with Google" button using `authClient.signIn.social({ provider: "google" })`
  - Loading state while redirect is in progress
  - If already signed in, redirect to `/`

### Phase 4: Middleware + Route Protection

- [x] Update `middleware.ts` matcher to gate all routes except `/login` and `/api/auth/*`
- [x] Redirect unauthenticated requests to `/login`
- [x] Redirect authenticated users away from `/login` → `/`

### Phase 5: Component Cleanup

- [x] Remove `authClient.signIn.anonymous()` from `EmitterRuns.tsx` mount effect — middleware handles redirect; call fetchRuns() directly
- [x] Remove `authClient.signIn.anonymous()` from `EmitterSandbox.tsx` mount effect — same pattern
- [x] Remove `authClient.signIn.anonymous()` from `SimulationRuns.tsx` mount effect — same pattern
- [x] Add a logout button to `SideNav.tsx` — calls `authClient.signOut()` then redirects to `/login`

### Phase 6: Verification

- [x] `npx turbo build --filter=sim` passes (**automated**)
- [ ] Visit sim without session → redirected to `/login` (**manual**)
- [ ] Sign in with allowed Google account → lands on `/` (**manual**)
- [ ] Sign in with blocked Google account → rejected with error message (**manual**)
- [ ] Session persists across page refresh (**manual**)
- [ ] Logout → session cleared, redirected to `/login` (**manual**)

---

## Files Affected

| File | Change |
|------|--------|
| `env/components/sim.env` | Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ALLOWED_EMAILS` |
| `env/contracts/sim.contract.json` | Add those vars to required fields |
| `apps/sim/src/lib/auth.ts` | Add Google provider, add allowlist hook, remove anonymous plugin |
| `apps/sim/src/lib/auth-client.ts` | Remove anonymousClient plugin |
| `apps/sim/src/app/login/page.tsx` | New login page |
| `apps/sim/middleware.ts` | Gate all routes, update matcher |
| `apps/sim/src/components/EmitterRuns.tsx` | Remove signIn.anonymous() |
| `apps/sim/src/components/EmitterSandbox.tsx` | Remove signIn.anonymous() |
| `apps/sim/src/components/SimulationRuns.tsx` | Remove signIn.anonymous() |
| `apps/sim/src/components/SideNav.tsx` | Add logout button |

## Dependencies

- Better Auth already installed and configured (`v1-2026-03-03-1-persistence-auth-api-impl.md` complete)
- Google OAuth app created in Google Cloud Console with correct redirect URI: `https://<your-domain>/api/auth/callback/google`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` available before Phase 2

## Notes

- `ALLOWED_EMAILS` is a comma-separated list: `user@example.com,other@example.com`
- Better Auth redirect URI for Google must be registered: `/api/auth/callback/google`
- The anonymous `user` rows already in the DB are harmless — they won't be linked unless account linking is implemented later
