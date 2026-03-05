---
title: "Capacitr Hackathon MVP — Implementation Plan"
date: 2026-03-04
status: in-progress
adr: planning/hackathon-mvp/adr.md
---

# Capacitr Hackathon MVP — Implementation Plan

## Goal

Build the Capacitr Idea Launchpad MVP as a new Next.js app (`apps/launchpad/`): a place to launch ideas as tokens, register for work, submit and validate contributions, and see who's building with you. Pump.fun is the comp. `apps/sim/` stays untouched.

## Scope

### In Scope
- New `apps/launchpad/` Next.js app
- Contract specifications (interfaces for devs)
- 7 new database tables (projects, agents, work submissions, snap polls, votes, agent configs, referrals)
- Rolodex landing page with project/agent/investor cards
- Project launch, detail, and configuration pages
- Agent/worker registration with builder codes
- Work attestation flow (submit proof + token ask)
- Snap poll voting (quadratic, 1 wToken OR 200 tokens)
- Token buy/sell UI (mock mode + contract-ready)
- Worker dashboard (earnings, locks, balances)
- Web3 wallet integration (wagmi + viem + RainbowKit)

### Out of Scope
- Post-graduation features (governance, reserve emissions, expanded work)
- Actual Solidity contracts (spec only)
- Work SDK for third parties
- Platform-spun agents, context packs, multi-chain
- Changes to `apps/sim/`

## Checklist

### Phase 0: Foundation

- [x] Scaffold `apps/launchpad/` Next.js app (TypeScript, Tailwind, App Router)
- [x] Add `@capacitr/database` dependency to `apps/launchpad/package.json`
- [x] Add `projects` table to `packages/database/src/schema.ts`
- [x] Add `agents` table to schema
- [x] Add `workSubmissions` table to schema
- [x] Add `snapPolls` table to schema
- [x] Add `snapPollVotes` table to schema
- [x] Add `agentConfigs` table to schema
- [x] Add `referrals` table to schema
- [ ] Run `db:push` to create tables — deferred, needs live DB connection
- [x] Install wagmi, viem, @rainbow-me/rainbowkit, @tanstack/react-query in `apps/launchpad`
- [x] Create `apps/launchpad/src/lib/wagmi.ts` (Base + Base Sepolia config)
- [x] Create `apps/launchpad/src/components/Web3Provider.tsx`
- [x] Create `apps/launchpad/src/app/layout.tsx` with Web3Provider + Tailwind
- [x] Create `apps/launchpad/src/lib/abis/` directory with placeholder ABI files
- [x] Set up Better Auth in `apps/launchpad` (reuse `@capacitr/database` auth tables)
- [x] Create `apps/launchpad/src/middleware.ts` (public routes, wallet routes, auth routes)
- [x] Create `apps/launchpad/src/components/SideNav.tsx` (Launchpad navigation)

### Phase 1: Rolodex + Project CRUD

- [x] Create `GET /api/projects` route (list, public, paginated)
- [x] Create `POST /api/projects` route (create, auth required)
- [x] Create `GET /api/projects/[id]` route (detail with metrics)
- [x] Create `PUT /api/projects/[id]` route (update, creator only)
- [x] Create `ProjectCard.tsx` component (progress bar, market cap, contributors, price)
- [x] Create `RolodexGrid.tsx` component (tabs: Projects/Agents/Investors, search, sort)
- [x] Create new `/` page (Rolodex)
- [x] Create `/projects/new` page (Launch Idea: system prompt, K value, token settings)
- [x] Create `/projects/[id]` page (Project detail: stats, work history)
- [x] Seed 2-3 test projects in the database — seed script at `apps/launchpad/scripts/seed.ts`

### Phase 2: Agent Registration + Builder Codes

- [x] Create `GET /api/agents` route (list for Rolodex)
- [x] Create `POST /api/agents` route (register, generate builder code)
- [x] Create `GET /api/agents/[id]` route (profile)
- [x] Create `PUT /api/agents/[id]` route (update profile)
- [x] Create `GET /api/agents/by-code/[code]` route (lookup by builder code)
- [x] Create `AgentCard.tsx` component (name, builder code, earnings, projects)
- [x] Create `/register` page (get builder code, set up profile)
- [x] Create `ConnectWalletButton.tsx` component
- [x] Add Agents tab to RolodexGrid
- [x] Create `GET/POST /api/referrals` route (record + stats)

### Phase 3: Work Submission + Orchestration Agent

- [x] Create `GET/POST /api/work-submissions` route (list + submit)
- [x] Create `GET /api/work-submissions/[id]` route (detail + status)
- [x] Create `POST /api/work-submissions/[id]/review` route (agent review)
- [x] Create `WorkSubmissionForm.tsx` (proof textarea, file attachments, token ask)
- [x] Create `SubmissionStatusTracker.tsx` (pending → reviewing → outcome)
- [x] Create `/submit/[projectId]` page
- [x] Create `POST /api/orchestrate/review` route (trigger batch review)
- [x] Build orchestration agent in `apps/launchpad/src/lib/orchestrator.ts` (Claude API + mock fallback, reviews against system prompt, returns approve/reject/snap_poll)
- [x] Create `GET/PUT /api/agent-configs/[projectId]` routes
- [x] Create `AgentConfigForm.tsx` (system prompt editor, threshold sliders, snap poll duration)
- [x] Create `/projects/[id]/configure` page (agent + project config, creator only)

### Phase 4: Snap Polls

- [x] Create `GET/POST /api/snap-polls` route (list + create)
- [x] Create `GET /api/snap-polls/[id]` route (detail with vote counts)
- [x] Create `POST /api/snap-polls/[id]/vote` route (cast vote, quadratic weight)
- [x] Create `POST /api/snap-polls/[id]/finalize` route (after endTime, updates submission)
- [x] Create `SnapPollCard.tsx` (vote tally bars, countdown, vote buttons)
- [x] Create `QuadraticVoteWeight.tsx` (shows sqrt(balance) weight + eligibility)
- [x] Create `/polls/[pollId]` page
- [ ] Add snap poll list to `/projects/[id]` page — deferred to Phase 6 polish
- [x] Wire orchestrator to create polls for ambiguous submissions — orchestrator returns snap_poll decision, API creates poll via POST /api/snap-polls

### Phase 5: Token Trading UI

- [x] Create `BondingCurveChart.tsx` (CSS-only price curve visualization)
- [x] Create `TokenTradePanel.tsx` (buy/sell, fee breakdown, wallet connect)
- [x] Create `ProjectStats.tsx` (price, market cap, volume, pool value, contributors)
- [x] Wire buy/sell to mock mode using bonding curve math in `emitter.ts` — wagmi hooks ready for Phase 7
- [x] Create `GET /api/projects/[id]/stats` route (real-time metrics)
- [x] Add trading UI to `/projects/[id]` page (chart + trade panel + snap polls)
- [x] Create referral tracking: `POST /api/referrals` records purchase + mints 1 wToken

### Phase 6: Dashboard + Polish

- [x] Create `WorkerDashboard.tsx` (wToken balances per project, earnings history)
- [x] Create `LockTimer.tsx` (CSS-only countdown, days/hours/minutes)
- [x] Create `/dashboard` page
- [x] Add lock countdown timers per wToken position
- [x] Add estimated value calculation (pool value / total supply * your balance)
- [x] Polish: loading states, error states, responsive layout — all pages have loading/error states
- [ ] End-to-end test: launch → register → submit work → agent review → snap poll → buy token → dashboard — deferred, needs live DB

### Phase 7: Contract Integration (when contracts ready)

- [ ] Import compiled ABIs into `apps/launchpad/src/lib/abis/`
- [ ] Wire `/projects/new` to call `BondingCurveFactory.createProject()`
- [ ] Wire `TokenTradePanel` to call `buy()` / `sell()` on bonding curve
- [ ] Wire work submission to call `WorkSubmissionRegistry.submitWork()`
- [ ] Wire snap poll voting to call `SnapPoll.vote()`
- [ ] Build lightweight indexer: poll chain events → update DB
- [ ] Update project creation flow: deploy on-chain first, then store addresses in DB

### Verification

- [ ] Navigate to `/` → Rolodex with project cards renders
- [ ] Create project at `/projects/new` → appears in Rolodex
- [ ] Register at `/register` → get builder code, appear in Agents tab
- [ ] Submit work at `/submit/[id]` → status tracks through review
- [ ] Vote on snap poll at `/polls/[id]` → quadratic weight calculated correctly
- [ ] Buy/sell tokens on `/projects/[id]` → price updates, fees split correctly
- [ ] Check `/dashboard` → wToken balance with lock timer displays

## Files Affected

| File | Change |
|------|--------|
| `packages/database/src/schema.ts` | Add 7 new tables |
| `apps/launchpad/` | New Next.js app (entire directory) |
| `apps/launchpad/package.json` | New: deps (next, react, wagmi, viem, rainbowkit, react-query, @capacitr/database) |
| `apps/launchpad/src/app/layout.tsx` | New: root layout with Web3Provider + Tailwind |
| `apps/launchpad/src/app/page.tsx` | New: Rolodex landing page |
| `apps/launchpad/src/middleware.ts` | New: route protection |
| `apps/launchpad/src/lib/wagmi.ts` | New: wagmi config for Base chain |
| `apps/launchpad/src/lib/auth.ts` | New: Better Auth config (reuses @capacitr/database) |
| `apps/launchpad/src/lib/orchestrator.ts` | New: orchestration agent using Claude Agent SDK |
| `apps/launchpad/src/lib/contracts.ts` | New: contract addresses + ABI references |
| `apps/launchpad/src/lib/emitter.ts` | New: bonding curve math (copied from apps/sim) |
| `apps/launchpad/src/lib/abis/*.ts` | New: typed ABI files (placeholder until contracts ready) |
| `apps/launchpad/src/components/Web3Provider.tsx` | New: wagmi + RainbowKit provider |
| `apps/launchpad/src/components/SideNav.tsx` | New: launchpad navigation |
| `apps/launchpad/src/components/ConnectWalletButton.tsx` | New: wallet connection UI |
| `apps/launchpad/src/components/ProjectCard.tsx` | New: project card for Rolodex |
| `apps/launchpad/src/components/AgentCard.tsx` | New: agent card for Rolodex |
| `apps/launchpad/src/components/RolodexGrid.tsx` | New: tabbed grid container |
| `apps/launchpad/src/components/BondingCurveChart.tsx` | New: CSS-only price chart |
| `apps/launchpad/src/components/TokenTradePanel.tsx` | New: buy/sell interface |
| `apps/launchpad/src/components/ProjectStats.tsx` | New: key metrics display |
| `apps/launchpad/src/components/WorkSubmissionForm.tsx` | New: work proof submission |
| `apps/launchpad/src/components/SubmissionStatusTracker.tsx` | New: status timeline |
| `apps/launchpad/src/components/SnapPollCard.tsx` | New: poll voting card |
| `apps/launchpad/src/components/QuadraticVoteWeight.tsx` | New: vote weight display |
| `apps/launchpad/src/components/AgentConfigForm.tsx` | New: agent config editor |
| `apps/launchpad/src/components/WorkerDashboard.tsx` | New: earnings + balances |
| `apps/launchpad/src/components/LockTimer.tsx` | New: countdown timer |
| `apps/launchpad/src/app/projects/new/page.tsx` | New: launch idea |
| `apps/launchpad/src/app/projects/[id]/page.tsx` | New: project detail + trading |
| `apps/launchpad/src/app/projects/[id]/configure/page.tsx` | New: config page |
| `apps/launchpad/src/app/register/page.tsx` | New: agent registration |
| `apps/launchpad/src/app/submit/[projectId]/page.tsx` | New: work submission |
| `apps/launchpad/src/app/polls/[pollId]/page.tsx` | New: snap poll voting |
| `apps/launchpad/src/app/dashboard/page.tsx` | New: worker dashboard |
| `apps/launchpad/src/app/login/page.tsx` | New: login page |
| `apps/launchpad/src/app/api/auth/[...all]/route.ts` | New: Better Auth routes |
| `apps/launchpad/src/app/api/projects/route.ts` | New: project CRUD |
| `apps/launchpad/src/app/api/projects/[id]/route.ts` | New: project detail |
| `apps/launchpad/src/app/api/projects/[id]/stats/route.ts` | New: real-time stats |
| `apps/launchpad/src/app/api/agents/route.ts` | New: agent registration |
| `apps/launchpad/src/app/api/agents/[id]/route.ts` | New: agent profile |
| `apps/launchpad/src/app/api/agents/by-code/[code]/route.ts` | New: builder code lookup |
| `apps/launchpad/src/app/api/work-submissions/route.ts` | New: work CRUD |
| `apps/launchpad/src/app/api/work-submissions/[id]/route.ts` | New: submission detail |
| `apps/launchpad/src/app/api/work-submissions/[id]/review/route.ts` | New: agent review |
| `apps/launchpad/src/app/api/snap-polls/route.ts` | New: poll CRUD |
| `apps/launchpad/src/app/api/snap-polls/[id]/route.ts` | New: poll detail |
| `apps/launchpad/src/app/api/snap-polls/[id]/vote/route.ts` | New: cast vote |
| `apps/launchpad/src/app/api/snap-polls/[id]/finalize/route.ts` | New: finalize poll |
| `apps/launchpad/src/app/api/agent-configs/[projectId]/route.ts` | New: config CRUD |
| `apps/launchpad/src/app/api/referrals/route.ts` | New: referral tracking |
| `apps/launchpad/src/app/api/orchestrate/review/route.ts` | New: trigger agent review |
| `package.json` | Update turbo pipeline if needed |
| `pnpm-workspace.yaml` | Already covers apps/* |

## Dependencies

- `packages/database` — shared Drizzle schema + connection (same DB as apps/sim)
- `packages/facilitator` — Claude Agent SDK pattern for orchestration agent
- Bonding curve math copied from `apps/sim/src/lib/emitter.ts` into `apps/launchpad/src/lib/emitter.ts`
- wagmi/viem/RainbowKit for wallet connection (new deps)
- Better Auth for session management (new instance, same DB tables)

## Notes

- **Separate app**: `apps/launchpad/` is a new Next.js app. `apps/sim/` stays untouched. Both share `packages/database` (same DB, same auth tables).
- **Branding**: Everything user-facing uses "Capacitr" (not "Capacitor")
- **Mock mode**: The entire app works without deployed contracts. Bonding curve math from `emitter.ts` handles mock trading. Contract calls are behind a feature flag — when ABIs + addresses are available, flip to real mode.
- **Dual auth**: Better Auth (Google OAuth) for user sessions + wagmi wallet for on-chain interactions. The `agents` table bridges both via `userId` + `walletAddress`.
- **CSS-only charts**: No charting libraries. Use CSS for all visualizations.
- **Input convention**: Always `type="text" inputMode="decimal"` for numeric inputs.
- **Contract specs**: Documented in the ADR companion file. Devs build these separately — we consume ABIs when ready.
- **Port**: `apps/launchpad` runs on a different port than `apps/sim` (e.g., 3001 vs 3000).

## Contract Specifications

See [adr.md](./adr.md) for contract interface details. Summary:

| Contract | Key Functions |
|----------|--------------|
| BondingCurveFactory | `createProject()`, `buy()`, `sell()`, `getPrice()`, `getMarketCap()` |
| WorkToken (wToken) | `mint()`, `transfer()` (lock-aware), `balanceOf()`, `unlockedBalanceOf()` |
| WorkTokenPool | `deposit()`, `getPoolValue()`, `getBondedPrice()` |
| WorkSubmissionRegistry | `submitWork()`, `approveWork()`, `rejectWork()`, `routeToSnapPoll()` |
| SnapPoll | `createPoll()`, `vote()`, `finalize()` |
| Graduation | `graduate()` (triggered at market cap threshold) |
