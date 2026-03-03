---
title: "Executor"
outline: [2, 3]
---

# Executor

*The decision execution layer. When the system decides, the Executor acts.*

---

## What It Will Do

The Executor is the final layer of the Capacitor Stack. It takes the output of a [Capacitor](/stack/capacitor) deliberation — a structured decision with supporting evidence, vote distribution, and confidence signal — and turns it into action.

**Examples of execution targets:**
- Smart contract calls (parameter changes, treasury movements, upgrades)
- Multisig trigger proposals (queued for human signature where required)
- API integrations (external service calls, webhook triggers)
- On-chain governance proposals (submit to existing DAO frameworks)
- Treasury management (fund allocation based on deliberation outcome)

The Executor closes the loop. Capacitor produces decisions. Executor acts on them. Outcomes are recorded on-chain and feed back into future deliberations.

---

## Status

**Out of scope for initial build.**

The Executor is documented here to complete the stack picture. Emitter, Capacitor, and Facilitator come first. The Executor matters most when there are real deliberations producing real decisions that need real execution — that's a later stage.

---

## Design Considerations (Future)

- **Trust model** — Who authorizes execution? Automatic from deliberation outcome? Multisig confirmation? Time-locked with veto?
- **Execution verification** — How do you confirm the action was taken correctly? On-chain receipt? Callback verification? Human attestation?
- **Failure handling** — What happens when execution fails? Re-deliberate? Retry? Escalate?
- **Scope boundaries** — What can the Executor do? There should be hard limits on what actions a deliberation can trigger. A discussion about marketing strategy should not be able to drain the treasury.
