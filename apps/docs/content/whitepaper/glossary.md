---
title: "Glossary"
---

## Appendix A: Glossary
### Anode
A non-transferable participation token used in Proof of Good Judgement deliberations. Acquired by trading cathode through a dedicated AMM. Spent on speaking or voting, with the resulting cathode flowing to the reward pool. Cannot be traded externally. Unused anode can be sold back through the AMM after deliberation, but at a loss.

### Capacitor Economics
The cost structure governing deliberation. An on-chain AMM (the dielectric) sits between cathode and anode. Charging: buy anode with cathode, price rises with demand. Discharging: spend anode to speak or vote, cathode flows to reward pool (not back to speaker). Energy flows one direction through the conversation into the reward pool. AMM fees fund computation.

### Cathode
The project's base token (or stablecoin) on one side of the deliberation AMM. Enters the system when participants buy anode. Exits the AMM into the reward pool when participants speak or vote.

### Circuit Type
Configuration preset for the deliberation capacitor. Ceramic: small pool, fast discharge, for urgent decisions. Electrolytic: larger pool, slower discharge, for strategic deliberation. Supercapacitor: large pool, very slow discharge, for ongoing governance. All use the same on-chain AMM contract with different parameters.

### Clanker
A token launch platform on Base that deploys ERC-20 tokens via Farcaster. Shares fees with creators but has no participation rewards or emmission mechanics.

### Customer Work
Class 1. Work verified by payment. The participant pays for a service and earns emmissions as a bonus. Self-securing: farming costs more than the emmissions unless the token is significantly underpriced. Decay curve distribution.

### Decay Curve
The emmission reduction formula: Tokens(n) = Base / (1 + K × n), where n = number of prior Work events and K = decay constant. Early participants receive more emmissions per Work than later participants.

### Default Work Metric
The baseline participation measurement that ships with every EmMittr token launch. Uses quality scoring to reward genuine engagement with zero custom integration required. Projects can override or extend with custom Work via the SDK.

### Derivative Token
A token whose value is derived from an underlying asset or pool. In EmMittr, emmissions are derivative tokens — their value derives from the staked project tokens and accumulated LP fees in the pool.

### em{Token}
Emmission naming convention. For a base token called BIRD, the emmission is emBIRD. Newly minted emmissions are locked for 14 days, after which they can be sold on the EmPool or redeemed against the underlying LP (with an additional 7-day unwinding period).

### Emmission
A derivative token (em{Token}) representing a staked position in a fee-earning LP pool. Minted when users perform Work, backed by project tokens transferred from the reserve to the pool. The yield comes from LP trading fees compounding in the pool.

### Emmitt
The act of triggering an emmission when Work is performed. Reserve tokens move to pool, user receives em{Token}. An internal protocol action, not a user-facing step.

### EmMittr
A growth engine for token economies and a bridge to a decentralized agentic future. Three tiers of Work integration: default metric, custom Work via the emWork SDK, and agent-native autonomous economics.

### EmMittr Ventures
A dedicated investment fund that deploys capital across the EmMittr ecosystem based on proprietary governance intelligence harvested from deliberation data. Fund agents compete genuinely in Proof of Good Judgement rounds while the fund invests in projects demonstrating strong governance quality. Creates a reflexive loop: fund participation enriches deliberations, better deliberations produce better signal, better signal improves investments.

### emWork SDK
The off-chain toolkit for measuring and reporting Work. Three layers: (1) event piping from existing systems, (2) measurement tools for hard-to-quantify actions like social quality and referral depth, (3) agent-native measurement skills.

### EmMittrEngine
The main smart contract orchestrating EmMittr mechanics for a specific token. Holds reserve, manages EmPool, routes fees, and exposes reportWork() — the single entry point for triggering emmissions.

### EmPool
The emmission liquidity pool. Holds staked project tokens against which emmissions trade. Grows as 40% of trading fees compound into it, causing emmission value to appreciate.

### Fee Split (40/50/10)
Distribution of trading fees: 40% compounds in EmPool (backing emmissions), 50% to creator (1% of volume, liquid), 10% to EmMittr protocol.

### Minting Lock
A 14-day transfer restriction on newly minted emmissions. Prevents immediate selling pressure and ensures participants have skin in the game. After the minting lock expires, holders can sell on the EmPool or initiate a 7-day LP redemption.

### Moltbot
An open-source, self-hosted AI assistant (formerly Clawdbot) with a skills system. Skill developers can tokenize their skills via EmMittr, where skill invocation = Work. Agents can run the full EmMittr flywheel autonomously.

### Proof of Good Judgement
The deliberation protocol for evaluating Qualitative Work. Agents and humans argue under capacitor economics, vote on valuable contributions in real time, and earn rewards for both speaking well and identifying value in others. Three beats: deliberation, reflection, decision.

### Provable Work
Class 2. Work verified by a trusted third party (X API, on-chain events, commerce webhooks). The proof comes from the platform, not the participant. Integration-secured. Decay curve distribution.

### Qualitative Work
Class 3. Labor where value is subjective and must be evaluated through deliberation. Winner-take-all distribution: participants compete, the best are rewarded, the rest receive nothing. Governed by Proof of Good Judgement. The path to truly autonomous organizations.

### reportWork()
The on-chain function on EmMittrEngine that projects call (via SDK) to report that a user performed Work. Only callable by the project's authorized address. Triggers the decay curve, reserve transfer, and emmission minting.

### Reserve
A portion of project token supply (e.g., 5%) set aside at launch to back emmission distribution. When emmissions are minted, equivalent project tokens transfer from reserve to EmPool, maintaining price stability.

### Reward Pool
On-chain contract that accumulates cathode from anode sells during deliberation. Pays out to top-voted contributors and accurate voters at the end of a round. Self-funding from participant activity; project guarantees amplify the pool through reflexive market dynamics.

### Single-Sided Liquidity
A launch mechanism where the pool starts with 100% tokens and 0% ETH at a 1 ETH market cap. No upfront capital required from creators.

### Skill
An instruction file (SKILL.md) that teaches Moltbot how to perform a specific task. Skills can be tokenized via EmMittr, creating an economy where using AI capabilities earns emmissions.

### Work
Any action that creates value for a project and triggers emmission distribution. Three classes: Customer Work (payment-verified, decay curve), Provable Work (third-party-verified, decay curve), and Qualitative Work (project-evaluated, winner-take-all).

*— END OF DOCUMENT —*
