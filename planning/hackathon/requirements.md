# Requirements Document

## System: Capacitr — The Idea Launchpad

This document describes what needs to be built to make the system described in the brief (v0.5.1) work.

---

## 1. Token Launch (Bonding Curve)

### 1.1 Bonding Curve Contract
- Deploy a token on a bonding curve with zero upfront capital (PumpFun-style)
- Single-sided liquidity — creator provides no capital
- Buy/sell at any time during the bonding curve phase
- 2% fee on every trade, split:
  - 40% → work token pool contract
  - 50% → creator wallet
  - 10% → protocol wallet

### 1.2 Graduation Trigger
- Market cap threshold triggers graduation (exact threshold TBD, ~$69k like PumpFun is a starting point)
- Graduation migrates bonding curve liquidity to a Uniswap V4 pool (or V3 with wrapper)
- Graduation is automatic and permissionless — no manual intervention

### 1.3 Post-Graduation Fee Routing
- Uniswap pool swap fees continue to flow through the 40/50/10 split
- Implementation via Uniswap V4 hooks (preferred) or a fee-wrapper contract
- Exact fee percentage post-graduation TBD (likely 1% on top of Uniswap base fee)

---

## 2. Work Token (w{Token}) System

### 2.1 Work Token Contract
- ERC-20 token: w{Token} (e.g., if token is BOXES, work token is wBOXES)
- Minted when work is approved
- 2-week rolling lockup on each mint (non-transferable during lock period)
- Pre-graduation: minted but NOT pegged to pool (earned claims)
- At graduation: bonded to pool (price = pool value / total supply)
- Post-graduation: tracks pool value, appreciates as fees accumulate

### 2.2 Work Token Pool
- Receives 40% of all trading fees (pre and post graduation)
- Pre-graduation: accumulates value, no redemption
- At graduation: bonds to outstanding wToken supply
- Post-graduation: auto-compounds (fees → pool → wToken value increases)

### 2.3 Reserve Pool
- Set at graduation
- Funds future work token emissions post-graduation
- Mechanism for pricing new emissions (decay curve applies)

### 2.4 Decay Curve
- Formula: `Tokens(n) = Base / (1 + K * n)`
- K is configurable per project (default K = 0.002)
- Each work emission produces fewer tokens than the last
- Creator sets K at launch time

---

## 3. Work Submission & Verification

### 3.1 On-Chain Work Recording
- Work submissions are on-chain transactions
- Each submission includes:
  - Proof of work (content hash, link, or reference)
  - Self-assessed wToken claim amount
  - Worker address
  - Work type (default, custom, qualitative)

### 3.2 Work SDK (for third parties)
- SDK that allows external signal providers to submit work on behalf of users
- Example: Twitter engagement tool submits a tx saying "user X did work Y for project Z"
- SDK handles: work formatting, on-chain submission, proof attachment
- Third parties integrate via API key + contract interaction

### 3.3 Default Work Types (ship with every launch)
- **Referral codes**: generate unique code, both referrer and referee earn wTokens
- **Bonding curve participation**: buying the token counts as default work
- **Snap poll voting**: participating in validation earns wTokens

### 3.4 Custom Work Types
- Creator configures measurable actions via the Work SDK
- External signal providers can verify and submit
- Examples: Twitter engagement, Stripe webhooks, API calls, feature usage metrics

---

## 4. Orchestration Agent

### 4.1 Agent Lifecycle
- One agent per idea, created at launch, persists for lifetime of the project
- Seeded with the creator's system prompt + context packs
- Runs continuously (or on a polling schedule)

### 4.2 Agent Responsibilities
- Monitor on-chain work submissions
- Auto-approve clear matches to system prompt
- Auto-reject obvious spam
- Route ambiguous submissions to snap polls
- Decide when to trigger snap polls (e.g., batched every N minutes, or by popularity)
- Provide context to worker agents who query the idea's requirements

### 4.3 Context Packs
- Creator-provided supplementary context (brand guidelines, specs, audience profiles)
- Updatable at any time
- Consumed by orchestration agent and worker agents
- Storage: on-chain reference (IPFS hash or similar) with off-chain content

---

## 5. Snap Polls (Pre-Graduation Validation)

### 5.1 Poll Mechanics
- Short voting window (duration TBD, brief says 5 minutes)
- Token holders vote on: should this work be approved? Is the claim fair?
- Voters earn wTokens for participating (incentivizes validation)
- Simple majority or threshold-based approval

### 5.2 Poll Triggering
- Orchestration agent decides which submissions go to poll
- Batching strategy TBD (e.g., every 5 minutes, pick most-engaged submissions)

---

## 6. Marketplace / Discovery

### 6.1 Idea Marketplace (Project Cards)
- Public directory of all launched ideas
- Each card shows: bonding curve progress, market cap, active contributors, work token economics, decay curve position, volume, fee generation

### 6.2 Task Cards
- Per-project: available work opportunities
- Each shows: reward terms, lock terms, verification method, completion count, success/rejection rate

### 6.3 Agent Routing Signals
- Agents need machine-readable data to route compute to highest-EV work
- API or on-chain index exposing: reward size, decay position, fill rate, approval rate

---

## 7. Demand Side: Worker Onboarding

### 7.1 BYOA (Bring Your Own Agent)
- Registration flow for agent operators
- Agent browses marketplace API, selects work, submits on-chain
- Operator provides their own inference/compute

### 7.2 Platform-Spun Agents
- Conversational onboarding for domain experts (non-technical)
- Platform creates and hosts an agent on the expert's behalf
- Agent competes in the marketplace using the expert's context
- Expert curates context, collects earnings

### 7.3 Direct Human Participation
- Web UI for submitting work directly (no agent required)
- Same on-chain work submission format as agents

---

## 8. Post-Graduation Governance

### 8.1 Voting System
- Token threshold to participate in governance votes
- Quadratic voting: vote weight = sqrt(tokens)
- wToken holders get 1.5x voting weight (workers have more say)
- Governance scope: project decisions, work policy changes, treasury allocation

### 8.2 Future: Proof of Good Judgement
- AMM-based deliberation protocol (full design in whitepaper)
- Qualitative work evaluation through economic incentives
- Deferred — R&D stage, not in initial build

### 8.3 Future: Futarchy Component
- Decision markets for governance questions
- Deferred — research stage

---

## 9. Platform Infrastructure

### 9.1 Chain
- Base (Ethereum L2) — low cost, Uniswap V4 support, Coinbase ecosystem
- Alternative: consider based on where Uniswap V4 hooks are most mature

### 9.2 Contracts
- Bonding curve factory (deploy per project)
- Fee splitter
- Work token (wToken) ERC-20 factory
- Work token pool
- Reserve pool
- Work submission registry
- Snap poll contract
- Graduation/migration contract

### 9.3 Off-Chain Services
- Orchestration agent runtime (per project)
- Marketplace API / indexer
- Platform-spun agent hosting
- Work SDK API
- Frontend web application

### 9.4 Frontend
- Creator launch flow (system prompt → deploy)
- Marketplace browse + discovery
- Work submission UI
- Snap poll voting UI
- Project dashboard (for creators)
- Worker dashboard (earnings, claims, locks)
