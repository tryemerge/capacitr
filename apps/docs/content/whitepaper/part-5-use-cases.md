---
title: "Part V: Use Cases"
---

## Part V: Use Cases
EmMittr serves three tiers of users. Each tier gets more from the
protocol, and each validates the model for the others.

### Default: Any App Token
A project launches a token on EmMittr with no custom SDK integration.
The default Work metric activates automatically. Holders who participate
— engage, share, bring in new users — earn emmissions based on
quality-scored contributions. The creator earns 50% of all trading fees
(1% of volume) directly and permanently.

This is the baseline. It's what Clanker and Doppler offer creators,
extended to participants. No extra effort required from the project —
just a better set of launch economics.

### Tier 2: Emerge — Content Engines with Emmissions
**Emerge** is the first application built on EmMittr, focused on
creator-driven content generation. In Emerge, **Work = generating
content** through creator-defined workflows.

When a creator launches through Emerge, they launch a workflow — a
recipe for generating on-brand content: character designs, lore
snippets, meme templates, video scripts. Each generation costs a small
fee (e.g., $0.25), creates unique content, builds the brand's lore, and
emmitts based on position in the decay curve.

Emerge uses the default Work metric *plus* content generation as custom
Work. Users earn emmissions for both baseline participation and creating
content. The SDK integration is minimal because Emerge controls the
generation pipeline.

Emerge NFTs bundle multiple generations: 1 NFT = 4 generations at
consecutive decay curve positions. The NFT holder earns exactly what 4
individual generations would earn, with ongoing fee income as long as
the token trades.

### Tier 3: The Agentic Business Flywheel
**Moltbot** (formerly Clawdbot) is an open-source AI assistant with a
skills system where developers create instruction files (SKILL.md) that
teach the AI how to perform specific tasks. EmMittr enables **tokenized
skills** — skills where invocation triggers emmission distribution,
and the agent runs the entire economy.

### The Full Stack
A skill creator deploys an EmMittr token tied to their skill. Then the
agent takes over:

1.  **Launch:** Deploy token at 1 ETH market cap with emmission reserve.
    Zero capital required.

2.  **Serve:** Users invoke the skill, paying in stables. Each
    invocation is Work.

3.  **Measure:** The agent logs every invocation automatically —
    inputs, outputs, quality. reportWork() fires.

4.  **Reward:** Users emmitt based on the decay curve. Early adopters
    get the most.

5.  **Promote:** The agent posts results, engages with users, shares
    wins. This is also Work.

6.  **Grow:** Better results → more users → more trading → more fees →
    pool grows → emmissions appreciate.

The default Work metric runs underneath all of this. Human users who
engage with the agent's token earn emmissions too. The agent and its
users are all in the same flywheel.

### Case Study: Molten Insight
Scenario A from the opening section describes this pattern in detail. A
solo developer builds a market analysis agent on Moltbot, launches the
INSIGHT token via EmMittr, and wires each skill invocation to Work:

  —————- ————- ————- ——————————
  **Skill**        **Price**     **Work        **emINSIGHT Earned**
                                 Value**       

  Analyze Any Pair $0.50        1 Work        \~1,000 tokens

  Daily Trading    $2/day       2 Work        \~2,000 tokens
  Tips                                         

  Weekly           $5/week      3 Work        \~3,000 tokens
  Newsletter                                   

  **Premium        **$25/mo**   **10 Work**   **\~10,000 tokens**
  Access**                                     
  —————- ————- ————- ——————————

Users pay in stablecoins. They don't need to buy INSIGHT to use the
product. Each invocation earns emmissions as a bonus. By month three:
2,000 active users, $200K daily volume, the developer earning
$2,000/day in liquid fees, and early users holding emINSIGHT positions
earned by being early *users*, not early speculators. The agent promotes
itself, the economics compound autonomously.

Scenario B from the opening shows the complementary model: agents
working for emmissions instead of humans paying for services. Both run
on the same protocol. A single token economy can have both
simultaneously.
