# Hackathon Todo

## Track 1: Smart Contracts

### Bonding Curve + Fees
- [ ] Research and select bonding curve implementation (fork PumpFun approach or build from scratch on Base)
- [ ] Implement bonding curve factory contract (deploy one curve per project)
- [ ] Implement 2% fee on buy/sell with 40/50/10 splitter
- [ ] Wire fee splitter: 40% → work token pool, 50% → creator, 10% → protocol
- [ ] Test: deploy a curve, buy/sell, verify fees route correctly

### Work Token (wToken)
- [ ] Implement wToken ERC-20 factory (one wToken per project, named w{Token})
- [ ] Implement mint function (called on approved work)
- [ ] Implement 2-week rolling lockup (non-transferable during lock)
- [ ] Implement work token pool contract (receives 40% of fees, holds until graduation)
- [ ] Test: mint wTokens, verify lockup, verify pool balance grows with trades

### Work Submission
- [ ] Implement work submission registry contract
- [ ] Submission format: work proof hash, requested wToken amount, worker address, work type
- [ ] Emit events for orchestration agent to monitor
- [ ] Implement referral code generation + redemption on-chain
- [ ] Test: submit work, verify event emitted, verify referral flow

### Graduation
- [ ] Implement graduation trigger (market cap threshold check)
- [ ] Implement liquidity migration: bonding curve → Uniswap pool
- [ ] Implement wToken bonding: set price = pool value / total wToken supply
- [ ] Implement reserve pool allocation for future emissions
- [ ] Research Uniswap V4 hooks for post-graduation fee routing (40/50/10)
- [ ] Test: full lifecycle — deploy, trade to threshold, graduate, verify wToken price

### Snap Polls
- [ ] Implement simple on-chain voting contract (token-weighted, time-bounded)
- [ ] Poll creation by orchestration agent (via trusted role or signature)
- [ ] Vote tallying + approval/rejection outcome
- [ ] wToken reward for poll voters
- [ ] Test: create poll, vote, verify outcome + rewards

---

## Track 2: Orchestration Agent

- [ ] Define orchestration agent architecture (event-driven, listens to on-chain work submissions)
- [ ] Implement work review logic: compare submission against system prompt
- [ ] Implement decision routing: auto-approve / auto-reject / trigger snap poll
- [ ] Implement snap poll scheduling (e.g., batch every 5 minutes, prioritize by engagement)
- [ ] Implement context pack loading (read creator's supplementary context)
- [ ] Deploy one agent per project (managed lifecycle)
- [ ] Test: submit work → agent reviews → correct routing

---

## Track 3: Marketplace + Frontend

### Marketplace API
- [ ] Indexer for on-chain events (new projects, trades, work submissions, approvals, graduations)
- [ ] REST or GraphQL API exposing:
  - Project list with bonding curve progress, market cap, volume, fees, active contributors
  - Per-project work opportunities and submission history
  - Worker earnings and lock status
- [ ] Agent-friendly endpoints (machine-readable, filterable)

### Frontend: Creator Flow
- [ ] Connect wallet page
- [ ] "Launch Idea" form: system prompt textarea, K value slider (with default), basic settings
- [ ] One-click deploy (calls bonding curve factory)
- [ ] Creator dashboard: volume, fees, work submissions, wToken distribution

### Frontend: Marketplace
- [ ] Project cards grid: bonding curve progress bar, market cap, contributors, decay position
- [ ] Project detail page: full stats, work history, snap poll history
- [ ] Buy/sell token UI (bonding curve interaction)

### Frontend: Work Submission
- [ ] Submit work form: proof field (link/text), requested wToken amount
- [ ] Submission status tracker (pending → reviewing → approved/rejected)
- [ ] Referral code generation + sharing

### Frontend: Worker Dashboard
- [ ] wToken balance (locked vs unlocked)
- [ ] Earnings history
- [ ] Lock countdown timers
- [ ] Estimated value (pool value / total supply * your balance)

---

## Track 4: Integration + Demo

- [ ] End-to-end flow: creator launches → worker submits → agent reviews → wTokens minted → trades happen → fees accumulate → graduation → wTokens bonded
- [ ] Demo script with at least one project going through full lifecycle
- [ ] Populate marketplace with 2-3 test ideas
- [ ] Record/screenshot the demo flow

---

## Priority Order

If time is limited, build in this order:

1. **Bonding curve + fee splitter** (the economic engine)
2. **wToken minting + pool** (the reward mechanism)
3. **Work submission registry** (on-chain work recording)
4. **Orchestration agent** (basic auto-approve for demo)
5. **Minimal frontend** (launch + submit work + see dashboard)
6. **Graduation contract** (the bonding moment)
7. **Marketplace API** (index + serve data)
8. **Snap polls** (validation layer)
9. **Referral system** (default work type)
10. **Full frontend polish**
