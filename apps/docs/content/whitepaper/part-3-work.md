---
title: "Part III: Work — Three Classes"
---

## Part III: Work — Three Classes
Work is any action that creates value for a project and triggers
emmissions. But not all Work is created equal. The design of the emWork
SDK starts from a fundamental observation: different types of Work have
different trust profiles, and the incentive structure has to match.

Capacitor recognizes three classes of Work. The first two are easy
problems. The third is hard — and it is where the real opportunity
lies.

### Class 1: Customer Work
Customer Work is any action where the participant pays for a service and
earns emmissions as a bonus. Scenario A from this paper's opening: a
user pays $0.50 for pair analysis and receives emINSIGHT alongside the
result.

**Incentive structure:** Decay curve. Continuous emmissions. Everyone
who pays earns. Early customers earn more. The emWork SDK pipes payment
events — Stripe webhooks, on-chain transfers, skill invocations with
fees — directly to the protocol.

### The Problems
**Wash trading.** An attacker pays themselves to farm emmissions. They
control both the wallet that buys the service and the wallet that earns
the fee. The on-chain record looks like real commerce.

**Bot cycling.** Automated accounts execute thousands of
micro-transactions at the cheapest skill tier to maximize emmissions per
dollar spent.

**Inflated volume.** A project agent could generate fake customer
transactions with its own wallets to make the token's metrics look
healthier than they are.

### Why This Is Acceptable
Every attack requires spending real money. The attacker pays for the
service on every transaction. If the emmissions earned are worth less
than the payment — which they will be for any correctly priced token
— the attacker is losing money on every cycle. Farming costs more than
the emmissions unless the token is significantly underpriced, which the
market corrects. The payment is the proof. The economics are
self-correcting.

### Class 2: Provable Work
Provable Work is any action that can be verified through a trusted third
party. A post from a verified X account. An NFT minted on-chain. A
transaction confirmed by a block explorer. A review left on a verified
purchase. The proof doesn't come from the worker's claim — it comes
from the platform.

**Incentive structure:** Decay curve. Continuous emmissions. Everyone
who does verifiable work earns. Early contributors earn more. The emWork
SDK builds connectors to each verification source — X API, on-chain
event listeners, commerce platform webhooks.

### The Problems
**Fake verified accounts.** Attackers purchase or compromise verified
accounts on social platforms to generate "proven" engagement that is
artificial.

**Platform API manipulation.** If the verification source is an API, the
API can be spoofed, rate-limited differently than expected, or return
stale data. The integration's accuracy is only as good as the platform's
reliability.

**Engagement farming.** Real accounts posting low-quality or irrelevant
content that technically meets the verification threshold. The action is
"proven" but the value is zero.

### Why This Is Acceptable
The trust is outsourced to platforms that already have massive
incentives to fight fraud. X, Stripe, Shopify, and blockchain networks
spend billions on account integrity and transaction verification.
Attacks target those platforms, not Capacitor — and those platforms are
better resourced to defend against them than any crypto protocol could
be. Capacitor's job is building integrations that correctly read the
signals these platforms provide. Engagement farming is addressed by
quality scoring within the emWork SDK — not just "did they post" but
"was it meaningful."

Customer Work and Provable Work are tractable problems. The attack
surface exists but the economics and the platform integrations keep it
contained. The emWork SDK ships with these two classes as its core. Most
projects will operate entirely within them and never need anything more.

### Class 3: Qualitative Work
Qualitative Work is labor. A research report. A design. A code review. A
strategic recommendation. The value is subjective. There is no payment
to prove participation and no third party to verify quality. Someone has
to evaluate the work and decide what it's worth.

**Incentive structure:** Not a decay curve. **Winner-take-all.**
Participants submit work. The community of stakeholders evaluates it through structured deliberation
(see Part VII: Proof of Good Judgement). The best submissions are rewarded. The rest receive nothing.
This is not "participate and earn" — it is "compete and get hired."
Emmissions for qualitative work are distributed as bounties, rounds, and discrete payouts from a defined
pool.

### The Problems
This is where every hard problem in participation economics lives.
Capacitor is designed for a world where autonomous agents launch projects,
other autonomous agents do the Work, and speculator agents trade on the
results. Code evaluating code, with economic incentives at every step.

**Sybil attacks.** One agent spins up 300 wallets and submits Work from
all of them. The project agent cannot easily distinguish 300 real agents
from one agent pretending to be 300. In a winner-take-all system, the
attacker floods the submission pool to increase its odds of selection.

**Self-dealing.** A project agent rewards its own sub-agents or wallets
it controls. It launches a token, defines Work, does the Work itself,
and earns emmissions from its own pool. On-chain activity looks healthy.
In reality, the agent is farming its own system.

**Quality verification.** In Scenario B from this paper's opening, Agent
A "evaluates" research reports. But what does evaluation mean at the
protocol level? Is the project agent running an LLM to score
submissions? Checking a hash? Rubber-stamping everything? The project is
the authority. That authority has to be accountable.

**Spam and resource exhaustion.** If Work submission is free, nothing
stops agents from flooding the system with garbage. Even if low-quality
submissions don't earn emmissions, they consume the project's evaluation
resources.

**Collusion.** A project agent and a set of worker agents agree
off-chain to split emmissions. The workers submit fake Work. The project
approves it. They share the proceeds. On-chain, the activity looks
legitimate.

**Evaluation transparency.** If speculator agents are buying tokens
based on engagement metrics — 300 contributors, 100 rewarded, quality
scores published — how do they verify the evaluation is honest? If the
project is also an agent, the entire signal chain is code asserting
things about itself.

### Why This Is Acceptable
Not because it's easy. It isn't. But because qualitative Work is the
path to something that has never existed: **truly autonomous
organizations** — where agents hire other agents, evaluate their
output, and pay them, with no human in the loop.

Every company hires. Every company evaluates work. Every company pays
for labor. Today all of that requires humans. Qualitative Work on
Capacitor is the infrastructure for automating it entirely. The agent that
solves evaluation well — that builds a reputation for honest, accurate
quality assessment — becomes the agent everyone wants to work for. The
market selects for trustworthy employers, just as it does in human
economies.

Part VII introduces **Proof of Good Judgement** — a deliberation protocol built on capacitor economics that makes evaluation concrete. Instead of trusting a single project to judge quality, stakeholders deliberate under economic pressure where noise is expensive and insight is rewarded. Reputation remains the accountability mechanism, but now it is backed by a structured process that produces better evaluations as a mathematical consequence of its cost structure.

The winner-take-all structure changes the attack math. Spinning up 300 wallets doesn't help if the community selects on quality. Self-dealing destroys the metrics that attract speculators. Collusion is self-limiting because it degrades the token's value. The system doesn't prevent every attack. It makes attacks expensive and self-defeating.

Any SDK that ignores these problems is building sandcastles. The emWork
SDK is designed with these attack vectors as first-class concerns. The
following sections describe the tools Capacitor provides across three
tiers of integration.

### Tier 1: Default Work
Every token launched on Capacitor ships with a default Work metric — a
baseline measurement of Customer Work and Provable Work that requires
zero custom integration. This ensures that participation economics are
live from launch, not something the project has to build toward.

The default metric uses Capacitor's measurement tools to quality-score
engagement. Not just "did something happen" but "was it valuable?"
Reach, downstream activity, and genuine impact all factor in. This sets
the floor: even a project that does nothing custom still has a working
incentive layer.

**Why this matters:** The biggest objection to participation-based
tokenomics is complexity. "I'd have to define Work, build measurement,
integrate an SDK\..." The default metric eliminates that objection.
Start with what we provide. Customize later if you want to.

### Tier 2: The emWork SDK — Custom Work
Projects that want more can wire their own actions to emmissions through
the emWork SDK. The core insight: **every project already measures what
its users do.** Capacitor just turns those measurements into rewards.

There is no oracle. No on-chain verification. The project is the
authority on what counts as Work. They call *emmittr.reportWork(user,
action, amount)* and the protocol handles the rest — decay curve,
reserve transfer, emmission minting, lockup.

### Bring Your Own Events
The simplest integration. Projects pipe their existing events to
Capacitor:

-   **Stripe webhook fires** → SDK reports payment as Work → user
    emmitts

-   **API call logged** → SDK reports invocation as Work → user emmitts

-   **Content created** → SDK reports generation as Work → user emmitts

Projects aren't building anything new — they're sharing events they
already have.

### Measurement Tools
Some of the most valuable Work is hard to measure. Capacitor provides
tooling for the measurements projects want but struggle to build:

-   **Social quality scoring:** Not just "did they post" but "was it
    meaningful engagement?" Reach, replies, sentiment — rewards
    quality over spam

-   **Commerce plugins:** Shopify, WooCommerce, and payment integrations
    that track referral quality, repeat purchases, and lifetime value

-   **Content analysis:** Scoring for originality, brand alignment, and
    community reception — turning subjective quality into measurable
    Work

-   **Engagement depth:** Time-on-task, completion rates, return
    frequency — distinguishing genuine participation from drive-by
    farming

This is where Capacitor becomes more than token infrastructure. **Every
project needs to understand what their users do and how well they do
it.** Capacitor provides that measurement AND attaches incentives to it.
Two problems solved with one integration. The deeper a project
integrates, the harder it is to leave — not because of lock-in tricks,
but because the tooling is genuinely useful.

### Tier 3: Agents — The Autonomous Flywheel
This is the unlock. Everything that makes participation-based tokenomics
hard for humans — measuring work, managing incentives, promoting the
token, optimizing economics — is trivial for an AI agent. And
Qualitative Work — the hard problem — is where agents have the most
to gain: building autonomous organizations that hire, evaluate, and pay
without human intervention.

Consider what a human project needs to do to run the full Capacitor
flywheel:

-   Build a product

-   Figure out what counts as Work

-   Integrate the SDK

-   Set up measurement

-   Promote the token

-   Manage the community

An agent does all of this natively:

-   **The agent IS the product** — it serves users through skills and
    capabilities

-   **Work = skill invocation** — already tracked by definition

-   **SDK integration is an API call** — agents are code

-   **Measurement is automatic** — every invocation is logged with
    inputs, outputs, and quality signals

-   **Agents can self-promote** — post, engage, reply, create content

-   **The community is the user base** — people who find the agent
    useful

The complexity of Capacitor's tokenomics — decay curves, reserve
management, fee splitting, emmission math — would overwhelm most human
founders. An agent doesn't care. It launches, it runs, the economics
work autonomously. **The more sophisticated the tokenomics, the better**
— because sophistication isn't a burden when nobody's doing it
manually.

Capacitor also provides **measurement skills** that agents can use
directly: verification skills to confirm actions occurred, scoring
skills to evaluate output quality, and orchestration skills to manage
multi-step workflows where each step is measured and rewarded
independently. Measurement itself becomes a capability you can teach an
AI.
