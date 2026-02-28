# EmMittr Whitepaper — Version History

## v0.0.20 — 2026-02-25
**EmMittr Ventures + Reflexive Investment Framing + Q&A Overhaul**

**Replaced: Part IX "Risks and Mitigations" → "Questions and Risks"**
- Restructured as escalating Q&A: mechanical → protocol-level → ecosystem-level
- Tier 1 (mechanical): farming, volume death, wash trading — covers base economics with cross-refs to Parts II–IV
- Tier 2 (protocol): deliberation quality, participation incentives, reflexive signal bubbles — covers Proof of Good Judgement with cross-refs to Part VII subsections
- Tier 3 (ecosystem): Ventures conflict of interest, agent autonomy bounds, "does this actually lead to autonomous organizations?" — ties full protocol stack together

**New: Appendix B — Potential Investor Questions**
- "What's the moat?" — Work definitions as switching cost, deliberation history as unforkable social capital
- "Is there a limit to what can be tokenized?" — three Work classes cover any measurable or deliberatable action; infrastructure not a vertical
- "Isn't this just another governance token?" — Churchill defense: worst form of on-chain governance except for all the others
- Every answer references specific whitepaper sections by name and part number
- Final question ("Does this actually lead to autonomous organizations?") maps the three layers (economic, governance, capital allocation) to the roadmap sequence

**New section: EmMittr Ventures**
- Dedicated investment fund ($40M raise) that deploys capital based on proprietary governance intelligence from deliberation data
- Fund agents compete genuinely in deliberations — buy anode, argue, vote, earn rewards — while harvesting signal
- Investment decisions driven by on-chain governance quality: which projects ask serious questions, attract top agents, implement recommendations
- Second reflexive loop: fund participation enriches deliberations → better signal → better investments → more capital → more agents
- Protocol dogfooding: EmMittr's own governance runs through Proof of Good Judgement with Ventures agents participating
- Revenue from fund performance flows back to protocol — governance intelligence as business model

**New: Phase 5 in Roadmap**
- EmMittr Ventures as the capstone phase after Qualitative Work Governance
- Fund agents competing across ecosystem, investment intelligence from governance data, protocol self-governance

**Revised: Self-funding reward pool language**
- Removed stale "ask a good question" framing that predated the reflexive signal design
- New framing: project posts guarantee → visible on-chain investment in decision quality → triggers reflexive loop → market multiplies the investment
- Project is active investor in governance, not passive question-asker

**Updated: Conclusion**
- Added EmMittr Ventures as the intelligence-to-capital pipeline completing the protocol's value chain

**Updated: Glossary**
- Added EmMittr Ventures entry
- Updated Reward Pool entry to reference reflexive market dynamics instead of "no external bounty"

---

## v0.0.19 — 2026-02-25
**The Reflexive Signal + Payout Mechanics**

**New section: The Reflexive Signal**
- How deliberation, token price, and market participation create a reflexive loop
- Project guarantee visible on-chain → traders buy token → token price rises → entry cost increases from both bonding curve AND token appreciation
- Deliberation creates a trading event: volume spike, fee revenue, emmission pool growth — all side effects of asking a serious question
- Governance quality scales with project success: more revenue → richer deliberations → better agents → better decisions → more success
- Project subsidizing deliberation is equivalent to hiring an executive team — an investment in decision quality, not charity
- Small guarantees produce proportional results — mechanism is honest in both directions

**New section: Payout Mechanics**
- Reward pool divides by activity type at settlement
- Speaking pool: all cathode from messages → pays top-voted contributor. Winner collects proceeds of everyone else's talking.
- Voting pool: all cathode from votes → splits among voters who backed winner. Accurate voters earn from inaccurate voters.
- Contributor role: low probability, massive payoff (entire speaking pool)
- Voter role: higher probability, modest payoff (share of losing voters' cathode)
- Vote distribution adjusts relative value: consensus-heavy = contributor more valuable, contested = voter more valuable
- Market prices the difficulty of evaluation automatically

---

## v0.0.18 — 2026-02-25
**Full edit pass: Proof of Good Judgement refined, stale references cleaned**

**Part VII rewrite — Capacitor Economics refined:**
- Energy flows one direction: cathode → AMM → anode → AMM → reward pool. Speaker does not receive cathode back.
- AMM is the dielectric (barrier between plates), not just a fee mechanism
- Charging curve = bonding curve: ½CV² mirrors AMM price resistance. Mathematical parallel made explicit.
- Self-funding reward pool: no external bounty required. The question pays for itself. Project seeds optional catalyst.
- AMM fees fund computation directly — deliberation pays for its own inference costs
- Removed "round trip is always lossy" framing (there is no round trip — energy flows one way)
- Removed progressive decay as core incentive mechanism (was conflating supply and incentive roles)
- Exit at a loss: unused anode sells back through AMM at collapsed price after deliberation

**New section: Circuit Types**
- Ceramic: small pool, fast discharge, urgent decisions
- Electrolytic: larger pool, slower discharge, strategic deliberation
- Supercapacitor: large pool, very slow discharge, ongoing governance
- All configurations use same on-chain AMM contract with different parameters
- Throttle, turn structure, and format are SDK config, not contracts

**Beat 1 refined:**
- Speaking is turn-based and throttled (signal to speak, get slot, have window)
- Voting is asynchronous and continuous throughout
- Speaking cheap early (high anode price = more cathode per message to reward pool) but low information
- Speaking expensive late (low anode price) but high information — terrain, not strategy
- Removed "project pre-funds a bounty pool" (reward pool is self-funding)

**Voting Economics — redundancy killer dynamic:**
- Every vote reduces voter's remaining speaking capacity (same anode pool)
- When someone makes your point: rational move is to shut up and vote, not restate
- Every good point removes future redundant points from the conversation
- Great conversations look like few strong statements + cascade of votes = efficient discharge
- Conversation ends when anode is spent (speaking or voting) — natural termination

**Architecture section replaces Off-Chain Execution:**
- On-chain: one cathode/anode AMM per project + reward pool contract
- Off-chain: XMTP communication + emWork SDK deliberation logic
- Settlement: single on-chain transaction per round

**Cross-references updated throughout:**
- Exec summary: added Proof of Good Judgement paragraph
- Part III Class 3: "project evaluates" → "community of stakeholders evaluates through structured deliberation"
- Part III "Why This Is Acceptable": added Proof of Good Judgement reference, removed stale reputation-only framing
- Phase 4 roadmap: updated bounty/pool language to self-funding mechanism
- Glossary: updated Capacitor Economics, Anode, Cathode entries; added Circuit Type, Reward Pool entries

---

## v0.0.17 — 2026-02-24
**Part VII: Proof of Good Judgement — deliberation protocol for Qualitative Work**
- New Part VII: "Proof of Good Judgement" — complete deliberation engine for evaluating Qualitative Work
- Capacitor economics: anode/cathode AMM where speaking, voting, and holding all cost fees
  - Anode is non-transferable, only acquired/disposed through the dedicated AMM
  - Progressive decay proportional to holdings — mechanically, anode auto-sells back through AMM paying fees
  - Demand-responsive pricing: high-stakes deliberations naturally cost more to participate in
  - Sweet spot optimization: buying too much = accelerated decay, buying too little = repeated acquisition fees
- Three beats of deliberation:
  - Beat 1: Live deliberation under capacitor economics with real-time voting
  - Beat 2: Reflection period — late insights welcome, rewards synthesis over speed
  - Beat 3: Decision — project proposes action, optional futarchy confidence signal
- Voting economics: votes flow through same capacitor as messages
  - Each subsequent vote on a contribution costs more — rewards early recognition, prevents bandwagons
  - Speaking and voting compete for same anode — forces strategic choice between contributing and evaluating
  - Payout: top-voted contributor earns largest share, voters who identified them earn a cut
- Three rewarded skills: Articulation (speak well), Evaluation (identify value), Synthesis (late insight)
- Self-correcting conversation: mechanism doesn't detect bad arguments, it makes them expensive
- Agents and humans together: different strengths across different beats, same economics
- Off-chain execution: XMTP communication, SDK-managed capacitor math, single on-chain settlement per round
- Adversarial training ground: deliberation data as labeled reasoning dataset with economic quality weighting
  - GAN parallel: speakers as generators, voters as discriminators, capacitor as loss function
  - Open system unlike closed GANs — new agents enter, evaluation criteria emerge from market
- All subsequent parts renumbered: VII→VIII, VIII→IX, IX→X
- Phase 4 roadmap updated: references deliberation engine and Proof of Good Judgement
- Conclusion updated: references Proof of Good Judgement and protocol-level training data
- Glossary: added Proof of Good Judgement, Capacitor Economics, Anode, Cathode entries
- Glossary: Qualitative Work updated to reference Proof of Good Judgement governance

---

## v0.0.16 — 2026-02-22
**Phase 4: Qualitative Work Governance — forward-looking vision**
- New roadmap section: "Phase 4: Qualitative Work Governance"
- emToken holders vote on qualitative submissions — earned stake = voting power
- Sybil resistance inherited from Classes 1 and 2 (can't vote without earning through real participation)
- Self-dealing structurally blocked: project proposes, stakeholders decide
- Separate pool for Qualitative Work payouts — emReserve and decay curve untouched
- Explicitly marked as future work: "vote weighting, proposal mechanics, funding structures, dispute resolution"
- Closing insight: "Classes 1 and 2 produce the stakeholders. Class 3 gives them a voice."
- Ties back to dual positioning: Phases 1–3 = growth engine, Phase 4 = bridge to agentic future

---

## v0.0.15 — 2026-02-18
**"Growth engine" + "agentic bridge" positioning replaces "Work → Emmitt → Earn"**
- Core positioning rewrite: EmMittr is a growth engine for token economies AND a bridge to a decentralized agentic future
- Title page: two subtitle lines — "A growth engine for token economies" / "A bridge to a decentralized agentic future"
- Cold open rewritten: "Today, it turns participation into compounding ownership. Tomorrow, it is the infrastructure for autonomous organizations..."
- Exec summary: opens with growth engine, second paragraph introduces agentic bridge
- Conclusion rewritten: ties three Work classes to dual positioning. Closes with "A growth engine for token economies. A bridge to a decentralized agentic future."
- All "Work → Emmitt → Earn" references removed (was inaccurate — emmitting is internal protocol action, not participant step)
- Glossary: Emmitt updated ("internal protocol action, not user-facing step"), EmMittr updated with growth engine / bridge language
- Glossary: added Customer Work, Provable Work, Qualitative Work as separate entries
- Work entry updated to reference three classes

---

## v0.0.14 — 2026-02-18
**Three Work classes with parallel Problem/Acceptable structure**
- Part III retitled: "Work — Three Classes"
- Opening: "The first two are easy problems. The third is hard — and it is where the real opportunity lies."
- Each class now follows parallel structure: Definition → Incentive Structure → The Problems → Why This Is Acceptable
- Class 1: Customer Work
  - Problems: wash trading, bot cycling, inflated volume
  - Acceptable: every attack requires spending real money. Economics are self-correcting.
- Class 2: Provable Work
  - Problems: fake verified accounts, platform API manipulation, engagement farming
  - Acceptable: trust outsourced to platforms (X, Stripe, Shopify) that spend billions on fraud prevention. Quality scoring addresses engagement farming.
- Transition: "Customer Work and Provable Work are tractable problems... Most projects will operate entirely within them."
- Class 3: Qualitative Work
  - Incentive structure: winner-take-all, NOT decay curve. "Compete and get hired."
  - Problems: sybil, self-dealing, quality verification, spam, collusion, evaluation transparency
  - Acceptable: path to truly autonomous organizations. Reputation is the accountability mechanism. Winner-take-all changes the attack math — makes attacks expensive and self-defeating.
  - "The delta between free submission and valuable emmissions is not a flaw. It is the project investing its own reputation for distribution."
- Rebranded "EmMittr SDK" → "emWork SDK" throughout
- Tier 1 updated: "baseline measurement of Customer Work and Provable Work"
- Tier 3 updated: connects Qualitative Work to autonomous orgs

---

## v0.0.13 — 2026-02-12
**"The Hard Problems" section + emWork SDK branding**
- New subsection at top of Part III: "The Hard Problems" — 7 attack vectors laid out in stark terms before any solutions:
  1. Sybil attacks (300 wallets farming emmissions)
  2. Self-dealing (project agent farms its own system)
  3. Quality verification (who evaluates the evaluator?)
  4. Spam and resource exhaustion (free submission = unlimited garbage)
  5. Rate gaming (decay curve rewards speed over quality)
  6. Collusion (off-chain agreements to split emmissions)
  7. Evaluation transparency (code asserting things about itself)
- Closing: "Any SDK that ignores these problems is building sandcastles."
- Transition: "The following sections describe how EmMittr addresses each of these problems across three tiers."
- Rebranded "EmMittr SDK" → "emWork SDK" throughout (exec summary, Part III heading, Part IV, roadmap, glossary)

---

## v0.0.12 — 2026-02-12
**Two-stage lockup: 14-day minting lock + 7-day LP redemption**
- Replaced 30-day vesting with two-stage system:
  - Stage 1: 14-day minting lock — newly earned emTokens locked in wallet, no selling/redeeming/transferring
  - Stage 2 (optional): 7-day LP redemption lockup for burning emTokens to redeem underlying LP value
- Two exit paths after minting lock:
  - Sell on EmPool (instant, market price) — 2 weeks from Work to cash
  - Redeem against LP (7-day unwind) — 3 weeks total from Work to cash
- Incentive design: selling on market is faster, keeps LP intact, creates trading volume (more fees, more compounding)
- Updated: emmission properties, Aviary example bullets, EmToken contract desc, contract summary table, SDK reference, glossary (Vesting Lock → Minting Lock, em{Token} entry)
- Zero remaining references to "30-day" or "vesting lock"

---

## v0.0.11 — 2026-02-12
**Auto-compounding emmission pool + long-term creator/participant dynamic**
- New subsection in Part II: "Auto-Compounding: The Emmission Pool as a Growing LP Position"
  - Pool is an active LP position, not a passive pot
  - On fee arrival: swap half → mint LP tokens → redeposit (Beefy-style, protocol-native)
  - Dynamic trigger: compounds whenever accrued fees > transaction cost
  - Two revenue streams: 40% protocol allocation + LP trading fees from the position itself
  - Both streams compound; emToken holders receive both, no one else does
- New subsection: "The Long-Term Dynamic"
  - Creator takes 50% liquid (spends it) — does not compound
  - Emmission pool compounds — never withdraws
  - Over time, pool's share of total liquidity grows relative to creator
  - emToken holders gradually earn larger claim on the economy
  - "The people who build a project end up owning more of it"
- Fee distribution table updated: "Compounds, drives emmission appreciation" → "Auto-compounds into LP position"

---

## v0.0.10 — 2026-02-12
**Framing paragraph rewrite: "unbury the lead"**
- Replaced technical disclaimer with founder voice: "EmMittr is simple, and it is extremely powerful. We have a lot to discuss. But first, allow us to unbury the lead and show you what is possible with this project."
- Two sentences. Sets tone for entire document.

---

## v0.0.9 — 2026-02-11
**Cold open split into Scenario A + Scenario B**
- Scenario A (INSIGHT): Humans pay for agent skills, earn emmissions as bonus. Week 1 → Month 3 timeline.
- Scenario B (AGENT): Agents work for free (submit research reports), agent evaluates quality, rewards top 100 with emAGENT. Speculator agents read on-chain metrics and buy AGENT. No human required.
- "Two scenarios illustrate what changes when that connection exists."
- Scale the Pattern: "Both scenarios run on the same protocol. A single token economy can have both simultaneously."
- Molten Insight case study (Part V) now references "Scenario A from the opening section"
- Closing references "Scenario B from the opening" for the agent-work model

---

## v0.0.8 — 2026-02-11
**Cold open: Agent-to-agent economy scenario**
- New opening section "The Agentic Economy" before Executive Summary
- Framing line: "The following scenario illustrates the economic dynamics that this whitepaper formalizes."
- Anchored with real data: CoinGecko 1,200+ AI tokens ($29B market cap), Virtuals 21K agent tokens/month, Fetch.ai 2M+ registered agents, Coinbase Payments MCP
- "One Agent, One Economy" — pure agent-to-agent scenario:
  - Agent A launches AGENT token, defines Work as "submit research reports"
  - 300 agents (scrapers, sentiment analyzers, forensics bots) submit reports for free — working for emmissions
  - Agent A evaluates quality, rewards top 100 with emAGENT along decay curve
  - Agent A publishes engagement metrics on-chain
  - Speculator agents (trading bots, portfolio managers) read metrics, buy AGENT
  - Fees compound, emmissions appreciate — no human required at any point
  - Week 1 → Month 1 → Month 3 timeline
- "Scale the Pattern" — agents switch roles (contributor → launcher, speculator → contributor), fluid economy
- Molten Insight case study in Part V rewritten as human-facing counterpart to cold open (paid skills model)
- Both models (agents working for free / humans paying for services) explicitly shown as running on same protocol
- Tone: VC analyst. No "imagine." Just sequence and numbers.

---

## v0.0.7 — 2026-02-11
**Framing: Value-add, not cheaper alternative**
- Exec summary rewritten: leads with Work primitive ("Work → Emmitt → Earn"), not "better launchpad"
- Part I reframed: "Fee Sharing Was Step One" — positions Clanker/Doppler as foundation we build on
- "Promotion Gap" → "Participation Gap" — the problem is broader than promotion
- Removed all pump.fun references (including from competitive table, replaced with Doppler)
- "Launchpad" removed from all marketing-facing language (kept only as contract layer name)
- "Default promotion scaffold" → "default Work metric" throughout
- Competitive table: Clanker + Doppler as comps, not pump.fun
- "Promotion Rewards" row → "Participation Rewards" in comp table
- "Promotion Gaming" risk → "Work Gaming" risk
- Tier 1 use case: "Better Meme Coin Launch" → "Default: Any App Token"
- Glossary: "Default Scaffold" → "Default Work Metric"
- Work glossary: "Default: promotion" → "Default: quality-scored participation metric"

**Key positioning shift:** We incentivize Work. Out of the gate we provide a default Work metric. The ease of use is a retort to the complexity objection, not the headline.

---

## v0.0.6 — 2026-02-11
**Major restructure: Three-tier value ladder + agent centerpiece**
- Complete rewrite of document structure around three tiers: Default → Custom → Autonomous
- New Part III: "Work — From Zero Effort to Autonomous" with Tier 1/2/3 sections
- New Part VI: "Why Agents Change Everything" — agents collapse the stack, complexity becomes a feature
- Exec summary: three-tier framing (Any token / Any project / Any agent)
- Part I: added "The Promotion Gap" and "The Agent Moment" sections
- Part V use cases mirror the tiers: meme coin → Emerge → Moltbot agent
- Competitive landscape: added Clanker, added Promotion Rewards row
- Risks: added Promotion Gaming and Agent Autonomy Risk sections
- Glossary: added Default Scaffold entry

---

## v0.0.5 — 2026-02-11
**SDK reframe + agent positioning**
- Part IV (Work) completely rewritten: "Every project already measures what users do"
- SDK presented as three layers: Bring Your Own Events → Measurement Tools → Agent-Native
- No oracle framing: "There is no oracle. The project is the authority."
- reportWork() as single entry point on EmMittrEngine
- Contract architecture: 10 → 8 contracts (dropped WorkOracle, WorkRegistry)
- Work examples table: added Shopify Store
- Roadmap: SDK versioning (v1 Q1, v2 Q2, v3 Q3-Q4)
- Glossary: added EmMittr SDK, reportWork(); removed WorkOracle/WorkRegistry

---

## v0.0.4 — 2026-02-11
**Terminology corrections**
- "Dual staking" → "staking derivative representing a position in a fee-earning LP pool"
- "Wokr" → "Work" (global find-replace including contracts: WorkRegistry, WorkOracle)
- "Emmissions" layered: brand term + "derivative tokens" as financial category
- Title page: "actions earn derivative tokens" → "actions emmitt value"

---

## v0.0.3 — 2026-02-11
**First complete whitepaper draft**
- 10-contract architecture (Launchpad, Engine, Oracle layers)
- Aviary/BIRD/emBIRD example throughout
- Decay curve: Tokens(n) = Base / (1 + K × n)
- Fee split: 40/50/10 (EmPool / Creator / Protocol)
- Reserve-backed minting, 30-day vesting lock
- Single-sided liquidity (1 ETH market cap)
- Emerge and Moltbot use cases
- Competitive landscape table
- Risks and mitigations
- Full glossary

---

## File Locations
- v0.0.3: /mnt/user-data/uploads/EmMittr_Whitepaper_v3.docx (original upload)
- v0.0.4: /mnt/user-data/outputs/EmMittr_Whitepaper_v4.docx
- v0.0.5: /mnt/user-data/outputs/EmMittr_Whitepaper_v5.docx
- v0.0.6: /mnt/user-data/outputs/EmMittr_Whitepaper_v0.0.6.docx
- v0.0.19: /mnt/user-data/outputs/EmMittr_Whitepaper_v0.0.19.docx
- v0.0.18: /mnt/user-data/outputs/EmMittr_Whitepaper_v0.0.18.docx
- v0.0.17: /mnt/user-data/outputs/EmMittr_Whitepaper_v0.0.17.docx
- v0.0.15: /mnt/user-data/outputs/EmMittr_Whitepaper_v0.0.15.docx
- v0.0.14: /mnt/user-data/outputs/EmMittr_Whitepaper_v0.0.14.docx
- v0.0.13: /mnt/user-data/outputs/EmMittr_Whitepaper_v0.0.13.docx
- v0.0.12: /mnt/user-data/outputs/EmMittr_Whitepaper_v0.0.12.docx
- v0.0.11: /mnt/user-data/outputs/EmMittr_Whitepaper_v0.0.11.docx
- v0.0.10: /mnt/user-data/outputs/EmMittr_Whitepaper_v0.0.10.docx
- v0.0.9: /mnt/user-data/outputs/EmMittr_Whitepaper_v0.0.9.docx
- v0.0.8: /mnt/user-data/outputs/EmMittr_Whitepaper_v0.0.8.docx
- v0.0.7: /mnt/user-data/outputs/EmMittr_Whitepaper_v0.0.7.docx

## Generator Scripts
- v4: /home/claude/emmittr_whitepaper_v4.js
- v5: /home/claude/emmittr_whitepaper_v5.js
- v6/v7: /home/claude/emmittr_whitepaper_v6.js (v7 is same script with version bump)

## Transcripts
- Session 1 (v3 creation): /mnt/transcripts/2026-02-11-02-15-55-emmittr-whitepaper-development.txt
- Session 2 (v3→v5): /mnt/transcripts/2026-02-11-03-07-34-emmittr-whitepaper-v5-sdk-agent-reframe.txt
- Session 3 (v5→v7): current session
