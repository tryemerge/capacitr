# MVP Scope

## What MVP Proves

One thing: **Can a token launch generate fees that fund work, where work is recorded on-chain, verified by an AI agent, and rewarded with derivative tokens that get bonded to the fee pool at graduation?**

If this loop works, everything else is an expansion on it.

---

## In Scope (MVP)

### Contracts

| Component | Description |
|---|---|
| **Bonding curve** | PumpFun-style single-sided curve. Deploy per project. 2% fee, 40/50/10 split. |
| **Fee splitter** | Routes fees to work token pool (40%), creator (50%), protocol (10%). |
| **Work token (wToken)** | ERC-20 per project. Minted on approved work. 2-week lockup. |
| **Work token pool** | Receives 40% of fees. Holds value until graduation. |
| **Work submission registry** | On-chain record of work submissions (hash + claim amount + worker address). |
| **Graduation contract** | At market cap threshold: migrate liquidity to Uniswap, bond wTokens to pool, set reserve. |

### Off-Chain

| Component | Description |
|---|---|
| **Orchestration agent** | One per project. Reviews work submissions. Auto-approve / reject / route to snap poll. |
| **Marketplace API** | Index of projects + work opportunities. Read-only API for agents and frontend. |
| **Frontend: Creator launch** | System prompt → configure settings → deploy (one-click). |
| **Frontend: Marketplace** | Browse ideas, see bonding curve progress, work token economics. |
| **Frontend: Work submission** | Submit work (proof + claim amount). View status. |
| **Frontend: Worker dashboard** | See earned wTokens, lock status, estimated value. |

### Work Types (MVP)

| Type | How it works |
|---|---|
| **Referral** | Generate code on-chain. Both parties earn wTokens on use. |
| **Submitted work** | Worker submits proof + claim. Orchestration agent reviews. |

### Validation (MVP)

- Orchestration agent auto-approves / auto-rejects based on system prompt matching
- Snap polls as fallback for ambiguous submissions (simple token-weighted vote, short window)

---

## Out of Scope (MVP)

### Deferred to Post-MVP

| Component | Why deferred |
|---|---|
| **Work SDK for third parties** | Requires partner integrations (Reply Core, Stripe, etc.). SDK spec can be designed but not shipped in MVP. |
| **Platform-spun agents** | Conversational onboarding + agent hosting is a full product. MVP supports BYOA and direct human only. |
| **Context packs** | Creator context beyond the system prompt. Nice to have, not blocking. |
| **Custom work types** | Requires Work SDK. MVP uses referrals + submitted work only. |
| **Post-graduation governance** | Quadratic voting, 1.5x wToken weight, futarchy. Not needed until projects graduate. |
| **Proof of Good Judgement** | Full deliberation protocol. R&D stage. |
| **Auto-compounding** | Pool auto-compounds fees into LP. MVP can accumulate without compounding. |
| **Decay curve tuning UI** | Creator sets K once at launch. No interactive tuning in MVP. |
| **Cross-project agent routing** | Agents optimizing across 30 ideas. MVP supports browsing, not autonomous routing. |
| **Mobile app** | Web-first. |

### Explicitly Not Building

| Component | Reason |
|---|---|
| **CCA / wToken pre-sale** | Parked. Fee-funded model is sufficient. |
| **Fundraising round mechanics** | Future enhancement (bonding curve → structured raise → AMM). |
| **RBAC / team accounts** | Solo creator model for MVP. |
| **Fiat on-ramp** | Crypto-native users first. |
| **Multi-chain** | Single chain (Base) for MVP. |

---

## MVP User Journeys

### Creator
1. Connect wallet
2. Write system prompt describing the idea
3. Set K value (or accept default) and other basic settings
4. Click "Launch" → token deployed, orchestration agent created, idea appears in marketplace
5. See dashboard: trading volume, fees earned, work submissions, wToken distribution

### Worker (Human)
1. Connect wallet
2. Browse marketplace → find an idea
3. View idea card (bonding curve progress, decay position, work opportunities)
4. Submit work (paste proof + request wToken amount)
5. Wait for orchestration agent review or snap poll
6. If approved: wTokens appear in dashboard (locked for 2 weeks)

### Worker (BYOA Agent)
1. Register agent via API
2. Agent queries marketplace API for available work
3. Agent submits work on-chain (same format as human)
4. Agent monitors approval status
5. wTokens accrue to agent's wallet

### Investor / Speculator
1. Connect wallet
2. Browse marketplace → find an idea with traction
3. Buy tokens on bonding curve
4. Fees from their trade fund the work token pool (they're indirectly funding workers)

---

## Success Criteria

MVP is successful if:

1. A creator can launch an idea in < 2 minutes
2. Workers can submit work and receive wTokens within one block confirmation
3. The orchestration agent correctly reviews work against the system prompt
4. Trading fees accumulate in the work token pool
5. At graduation: wTokens bond to pool at correct price
6. The marketplace shows live data (prices, volumes, work activity)
7. At least one project goes through the full lifecycle: launch → work → trade → graduate → bonded wTokens
