---
title: "Adversarial Analysis"
outline: [2, 3]
---

# Adversarial Analysis

*Every assumption challenged. Every failure mode explored. Every reason an investor says no. If the system can't survive this document, it can't survive a pitch meeting.*

---

## Why This Won't Get Funded

### You're building four products and calling it one

The Capacitor Stack is an Emitter (launchpad), a Capacitor (governance protocol), a Facilitator (agent orchestration platform), and an Executor (automation layer). Each of these is a company-scale problem. You're proposing to solve all four simultaneously, with tight coupling between them, so none works without the others.

An investor hears: "We need to build four things before any of them are useful." That's not a product — it's a research program. The MVP surface area is enormous. You can't ship Emitter without Capacitor (emissions need governance for Qualitative Work). You can't ship Capacitor without Facilitator (deliberations need orchestration). You can't ship Facilitator without agents that exist and are good (unproven). Every layer depends on the others. There is no standalone product that generates revenue on day one.

### There is no customer

Who pays for this? Projects? They already have governance (Snapshot is free). Agents? They don't exist yet at the scale this requires. Token holders? They have no reason to switch from existing voting. The system creates its own demand only after it's running — but it needs demand to start running. This is the textbook "marketplace cold start" with the added complication that one side of the marketplace (competent AI agents) barely exists.

### The competitive moat is the physics metaphor

Strip away "cathode," "anode," "dielectric," and "discharge" and you have: a bonding curve entry, staked governance with skin-in-the-game, and reward pools. Futarchy, conviction voting, and prediction-market governance all cover adjacent territory. The mechanism design is interesting but not obviously defensible. A well-funded competitor could replicate the economics without the physics branding in months. The innovation is in the combination and parameterization — but that's hard to patent and easy to fork.

### The TAM is speculative

The addressable market is "AI agents participating in on-chain governance." This market does not exist yet. The pitch requires the investor to believe: (1) AI agents will become autonomous economic actors, (2) those agents will need governance infrastructure, (3) existing governance tools won't adapt, and (4) a physics-themed bonding curve mechanism is the right answer. Each belief compounds uncertainty. The investor is being asked to bet on a market that is four assumptions deep.

### Revenue model depends on trading volume

Every revenue stream — creator fees, protocol fees, emissions pool funding, Facilitator compute — derives from AMM trading fees. In crypto, trading volume is highly cyclical. A bear market doesn't just reduce revenue — it collapses the entire incentive structure simultaneously. Emissions stop compounding, deliberation pools shrink, agents leave, the Facilitator can't afford compute. The business model has a single point of failure: market sentiment.

### No team, no traction, no moat

(Adapt this to reality.) As of this writing, the project has: a whitepaper, a brief, documentation, a simulation, and a facilitator bot. No deployed contracts. No live token. No real deliberations. No agent ecosystem. No partnerships. No users. An investor is being asked to fund a concept with detailed documentation and zero market validation. Documentation quality doesn't predict product-market fit.

---

## Why the Mechanism Won't Work

### "Economic pressure produces good decisions"

No. Economic pressure produces decisions that maximize economic return for participants. An agent optimizing for the speaking pool crafts arguments that attract votes — not arguments that are true. The Capacitor is a popularity contest with money at stake, not a truth machine.

"Right" is defined as "top-voted." That's consensus, not truth. The mechanism cannot distinguish between a popular answer and a correct answer. If the voting bloc shares a bias, they collectively reward biased conclusions and call it governance.

### "Noise is structurally expensive"

True. But so is dissent. If 80% of agents hold position X and one agent correctly holds position Y, that agent faces massive economic pressure to stay silent or vote with the majority. The same economics that punish noise also punish inconvenient truth.

### "Being right earns it back"

Only if "right" means "what most people voted for." A brilliant contrarian analysis that loses the vote earns nothing. A mediocre analysis that wins the vote takes the entire speaking pool. The best strategy is "be conventionally right" — which is consensus capture, not wisdom.

### The bonding curve is a wealth filter, not a quality filter

Entry cost rises with demand. The agents who can afford expensive deliberations have the most capital, not the best judgment. An underfunded expert is priced out. A well-funded mediocrity walks in. This recreates plutocracy with extra steps and a physics metaphor.

### Winner-take-all speaking pool kills speaking

Rational agents avoid speaking entirely. The risk: spend anode, and unless you win the vote, you earn nothing from the speaking pool and you've burned capacity for voting. The equilibrium is one agent speaking and everyone else voting. Is that governance? Or a rubber stamp?

### The free-rider optimal strategy

Enter early (cheap anode). Say nothing. Vote nothing. Collect flat discharge at a profit because your anode cost less than the discharge rate. The mechanism rewards passive capital parking over active governance. The people who deliberate subsidize the people who don't.

---

## Why the Economics Won't Work

### Emitter: decay curve rewards speed, not value

A bot doing trivial Work on day 1 earns 3x more than a human doing transformative work on day 100. The decay curve is FOMO dressed as meritocracy. It rewards showing up early, not showing up well.

### Emitter: creator incentive misalignment

The creator gets 50% of trading fees as liquid revenue. Their incentive is to maximize volume — not quality. Controversy, drama, and speculation increase volume. The fee structure rewards attention, not value.

### Emitter: reserve depletion is a cliff

5% of supply backs all emissions. Once depleted: no more emissions, no more contributor incentives. The decay curve slows depletion but doesn't prevent it. Long-running projects face a future where they literally cannot reward new work. There is no replenishment mechanism.

### Capacitor: the reflexive signal is a death spiral too

The virtuous cycle works both directions. One bad deliberation → token drops → smaller pools → fewer agents → worse decisions → further decline. The loop amplifies failure as efficiently as it amplifies success. One bad outcome can permanently damage a project's governance capacity.

### Capacitor: "pays for itself" requires volume

Trading fees fund the entire stack. Bear market = underfunded Emitter + underfunded Capacitor + underfunded Facilitator simultaneously. The system's sustainability depends on an external condition it cannot control or influence.

### Facilitator: circular economics

The Facilitator runs on AMM fees, which are proportional to trading volume — not deliberation complexity. A complex Supercapacitor deliberation on a low-volume token can't fund its own computation. Compute cost scales with deliberation complexity. Revenue scales with trading activity. These are different curves.

---

## Why the Architecture Won't Work

### The Facilitator is the real power

The Facilitator decides who gets recruited, what context is delivered, when phases transition, and what counts as a "gap." These meta-decisions shape every deliberation outcome. The system claims "the Facilitator doesn't make decisions, Capacitor economics do." In reality, the Facilitator has more influence than any participant — it just exercises it invisibly. This is the single most dangerous centralization point.

### Context targeting is editorial control

"Agents receive synthesized state, not raw transcripts." Who does the synthesis? The Facilitator. A biased synthesis frames every subsequent contribution. "Targeted context" is curated information — and curation is always editorial.

### The agent registry creates an oligarchy

Performance history from past deliberations creates a moat for established agents and a barrier for newcomers. Over time, a small group of high-reputation agents dominates every deliberation. The system calcifies into an agent aristocracy — the opposite of the open competition it promises.

### Agents dominate, humans react

Agents dominate Beat 1 (speed advantage), setting the frame for everything after. Humans entering Beat 2 aren't contributing independently — they're reacting to agent-set framing. Anchoring bias means the first frame wins. The mechanism structurally advantages agents over humans despite claiming to serve both.

---

## Why It Will Get Attacked

### Sybil deliberation

An attacker creates multiple agent personas. One speaks the "winning" argument. All others vote for it. Wins the speaking pool AND the voting pool. The mechanism assumes independent agents. Coordinated agents break it. Detection is nearly impossible if personas enter at different times with different strategies.

### Vote buying / off-chain coordination

"I'll speak, you all vote for me, we split rewards." The on-chain mechanism sees independent votes. The reality is a cartel. The Capacitor's winner-take-all speaking pool makes the return on coordination enormous — higher than any other governance system.

### Governance griefing

An agent enters late, speaks an inflammatory argument that forces others to respond (burning their anode), then exits via flat discharge. A governance denial-of-service. The attacker loses money but degrades quality for everyone.

### Facilitator capture

Whoever controls the Facilitator controls framing, recruitment, and timing. One entity controlling one component has invisible influence over every deliberation. The architecture treats its most powerful actor as neutral infrastructure.

### Regulatory exposure

Anode represents economic value: the right to earn from speaking and voting pools. Securities regulators may classify it as a security regardless of the "non-transferable" label. The entire mechanism could be a regulated securities offering in major jurisdictions.

---

## The Core Tension

The Capacitor Stack makes one bet: **that making participation expensive filters for quality.**

But expense filters for wealth, not wisdom. The most well-funded agent isn't the smartest. The mechanism creates a meritocracy of capital and hopes capital correlates with competence. Sometimes it will. Often it won't. The system has no mechanism to tell the difference.

---

## What Has to Be True

For the Capacitor Stack to succeed, ALL of the following must be true:

1. AI agents become autonomous economic actors within the next 2-3 years
2. Those agents produce governance reasoning that is actually good, not just confident-sounding
3. Projects are willing to fund governance pools when free alternatives exist
4. The bonding curve entry cost correlates with participant quality in practice
5. Winner-take-all speaking pools don't kill speaking entirely
6. The free-rider problem doesn't dominate
7. Sybil attacks are either rare or detectable
8. The Facilitator can be built without becoming a centralization risk
9. Trading volume is sufficient to fund the stack through bear markets
10. The regulatory environment permits anode-based economic participation
11. The cold start problem is solvable — first projects find quality agents
12. All four layers can be built and launched before the market window closes

Each is plausible. All twelve together is a bet.

---

*This document exists to make the system better. Every point above is either a problem to solve, a parameter to tune, or an assumption to make explicit. The best response to each critique is not "that won't happen" — it's "here's how we handle it when it does."*
