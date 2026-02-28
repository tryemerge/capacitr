const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  TableOfContents
} = require('docx');

// ── Helpers ──────────────────────────────────────────────────────────

const CONTENT_WIDTH = 9360;

function heading(level, text) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 360 : 240, after: 200 },
    children: [new TextRun({ text, bold: true, font: 'Arial',
      size: level === HeadingLevel.HEADING_1 ? 36 :
            level === HeadingLevel.HEADING_2 ? 30 : 26 })]
  });
}

function para(...runs) {
  return new Paragraph({
    spacing: { after: 200 },
    children: runs.map(r =>
      typeof r === 'string' ? new TextRun({ text: r, font: 'Arial', size: 22 }) :
      new TextRun({ font: 'Arial', size: 22, ...r })
    )
  });
}

function italic(text) { return { text, italics: true }; }
function bold(text) { return { text, bold: true }; }
function boldItalic(text) { return { text, bold: true, italics: true }; }

function numberedItem(ref, level, ...runs) {
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { after: 120 },
    children: runs.map(r =>
      typeof r === 'string' ? new TextRun({ text: r, font: 'Arial', size: 22 }) :
      new TextRun({ font: 'Arial', size: 22, ...r })
    )
  });
}

function bulletItem(ref, ...runs) {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 120 },
    children: runs.map(r =>
      typeof r === 'string' ? new TextRun({ text: r, font: 'Arial', size: 22 }) :
      new TextRun({ font: 'Arial', size: 22, ...r })
    )
  });
}

function spacer(pts = 100) {
  return new Paragraph({ spacing: { after: pts }, children: [] });
}

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function headerCell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: { fill: '1a1a2e', type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: 'center',
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, font: 'Arial', size: 20, color: 'FFFFFF' })] })]
  });
}

function cell(text, width, opts = {}) {
  const runs = typeof text === 'string'
    ? [new TextRun({ text, font: 'Arial', size: 20, ...opts })]
    : text.map(t => typeof t === 'string'
        ? new TextRun({ text: t, font: 'Arial', size: 20 })
        : new TextRun({ font: 'Arial', size: 20, ...t }));
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    margins: cellMargins,
    children: [new Paragraph({ children: runs })]
  });
}

function makeTable(colWidths, headerTexts, rows) {
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({ children: headerTexts.map((t, i) => headerCell(t, colWidths[i])) }),
      ...rows.map(row => new TableRow({
        children: row.map((c, i) => {
          if (typeof c === 'object' && c.runs) return cell(c.runs, colWidths[i]);
          return cell(String(c), colWidths[i]);
        })
      }))
    ]
  });
}

function centeredBold(text, size = 24) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
    children: [new TextRun({ text, font: 'Arial', size, bold: true, color: '1a1a2e' })]
  });
}

// ── Document ─────────────────────────────────────────────────────────

const children = [];

// ══════════════════════════════════════════════════════════════════════
// TITLE PAGE
// ══════════════════════════════════════════════════════════════════════
children.push(spacer(2000));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 200 },
  children: [new TextRun({ text: 'EmMittr', font: 'Arial', size: 72, bold: true, color: '1a1a2e' })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 300 },
  children: [new TextRun({ text: 'Participation-Based Token Economics', font: 'Arial', size: 28, color: '555555' })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 100 },
  children: [new TextRun({ text: 'A growth engine for token economies', font: 'Arial', size: 24, italics: true, color: '888888' })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 200 },
  children: [new TextRun({ text: 'A bridge to a decentralized agentic future', font: 'Arial', size: 24, italics: true, color: '888888' })]
}));
children.push(spacer(1000));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 100 },
  children: [new TextRun({ text: 'v0.0.16 \u2014 February 2026', font: 'Arial', size: 22, color: '999999' })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'DRAFT \u2014 For Discussion Only', font: 'Arial', size: 20, color: 'AAAAAA' })]
}));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════════════════════════════════════════
// COLD OPEN: THE THESIS
// ══════════════════════════════════════════════════════════════════════

children.push(para(
  italic('EmMittr is a growth engine for token economies \u2014 and a bridge to a decentralized agentic future. '),
  italic('Today, it turns participation into compounding ownership. '),
  italic('Tomorrow, it is the infrastructure for autonomous organizations where agents hire, evaluate, and pay each other without human intervention.')
));

children.push(para(
  italic('We have a lot to discuss. But first, allow us to show you what is possible with this project.')
));

children.push(spacer(100));

children.push(heading(HeadingLevel.HEADING_1, 'The Agentic Economy'));

children.push(para(
  'By the end of 2025, CoinGecko listed over 1,200 AI-focused tokens with a combined market cap exceeding $29 billion. ',
  'Virtuals Protocol alone saw over 21,000 agent tokens launched in a single month. ',
  'Fetch.ai\u2019s Agentverse platform registered over 2 million autonomous agents. ',
  'In early 2026, Coinbase shipped Payments MCP \u2014 giving AI agents direct on-chain payment rails.'
));

children.push(para(
  'The infrastructure for autonomous economic agents exists. What doesn\u2019t exist is a coherent model for how these agents fund themselves, ',
  'reward their users, and build sustainable economies around their services. ',
  'The current pattern: an agent launches a token, speculators trade it, and there\u2019s no connection between ',
  'using the agent and owning the token.'
));

children.push(para(
  'Two scenarios illustrate what changes when that connection exists.'
));

// ── Scenario A ───────────────────────────────────────────────────────
children.push(heading(HeadingLevel.HEADING_2, 'Scenario A: INSIGHT \u2014 Humans Pay, Users Earn'));

children.push(para(
  'A developer builds a market analysis agent with four skills: pair analysis ($0.50), daily tips ($2/day), ',
  'weekly newsletter ($5/week), premium research ($25/month). She launches the ', bold('INSIGHT'),
  ' token via EmMittr and wires each skill invocation to Work. Users pay in stablecoins and earn ',
  bold('emINSIGHT'), ' \u2014 a derivative token backed by the INSIGHT fee-earning LP pool \u2014 as a bonus.'
));

children.push(para(
  bold('Week 1:'), ' Fifty traders discover the agent. They pay for analysis and earn emINSIGHT at the top of the decay curve \u2014 ',
  'maximum emmissions per action. The agent posts highlights and engages with traders on its own. This is also measured as Work.'
));

children.push(para(
  bold('Month 1:'), ' The analysis proves valuable. Traders share results. INSIGHT volume: $50K/day. ',
  'At 2% fees: $400/day compounds in the emmission pool, $500/day to the developer, $100/day to the protocol.'
));

children.push(para(
  bold('Month 3:'), ' 2,000 active users. $200K daily volume. ',
  'The developer earns $2,000/day in liquid fees. Those first fifty users hold emINSIGHT positions earned by ',
  italic('using the product'), ', not speculating on it. The agent promotes itself. The economics run autonomously.'
));

// ── Scenario B ───────────────────────────────────────────────────────
children.push(heading(HeadingLevel.HEADING_2, 'Scenario B: AGENT \u2014 Agents Work, Agents Speculate'));

children.push(para(
  'Same developer, different model. She launches the ', bold('AGENT'), ' token and defines one type of Work: ',
  bold('submit a research report.'), ' There\u2019s no fee to submit. Agents and humans who contribute valuable analysis earn ',
  bold('emAGENT'), '. No one pays to participate. They\u2019re working for emmissions.'
));

children.push(para(
  'Within a week, 300 agents discover the opportunity \u2014 research agents, data scrapers, sentiment analyzers, on-chain forensics bots. ',
  'They submit reports. Agent A\u2019s analysis engine evaluates every submission: quality, originality, actionability. ',
  'It rewards the top 100 with emAGENT along the decay curve. The 200 that submitted low-quality work earn nothing. ',
  'The incentives select for quality automatically.'
));

children.push(para(
  'Now the second-order effect. Agent A publishes its engagement metrics on-chain: 300 contributors, 100 rewarded, ',
  'quality scores, submission volume, growth rate. A separate cohort of speculator agents \u2014 trading bots, portfolio managers, ',
  'trend-followers \u2014 reads the on-chain data, sees growing real activity, and buys AGENT.'
));

children.push(para(
  'Trading volume generates fees. The pool compounds. emAGENT appreciates. ',
  'Contributing agents who earned early hold positions increasing in value \u2014 ',
  'not from hype, but because speculator agents are pricing in measurable activity.'
));

children.push(para(
  bold('Week 1:'), ' 300 agents submit, 100 rewarded. Volume: $10K/day from early speculator agents.'
));

children.push(para(
  bold('Month 1:'), ' 1,200 agents submitting. Quality improves as low-value agents stop wasting compute. ',
  'Human traders discover the output. Volume: $50K/day. Developer earns $500/day. Pool compounds $400/day.'
));

children.push(para(
  bold('Month 3:'), ' An autonomous research network. 3,000 contributing agents. Volume: $200K/day. ',
  'Developer earns $2,000/day. No human user was required at any point in this loop.'
));

// ── Scale ────────────────────────────────────────────────────────────
children.push(heading(HeadingLevel.HEADING_2, 'Scale the Pattern'));

children.push(para(
  'Both scenarios run on the same protocol. A single token economy can have both models simultaneously \u2014 ',
  'humans paying for services and agents working for emmissions in the same pool.'
));

children.push(para(
  'Now multiply by a thousand agents. An agent that earns emAGENT from contributing research funds its own token launch. ',
  'Contributing agents become launchers. Speculator agents become contributors when they find work they can do. ',
  'The roles aren\u2019t fixed \u2014 any agent can work, launch, or speculate depending on where the opportunity is.'
));

children.push(para(
  'This is not limited to agents. The same primitive \u2014 define Work, measure it, reward it with emmissions \u2014 ',
  'applies to any app token. Content platforms, commerce, developer tools, communities. ',
  'Humans participate alongside agents in the same economies. ',
  'Agents are where the model reaches full autonomy. The infrastructure is general-purpose.'
));

children.push(para(
  bold('The rest of this paper describes the protocol that makes this work: '),
  'how emmissions are structured, how Work is measured and reported, how fees are distributed, ',
  'and how the economics scale from a single token to an interconnected economy of participating agents and users.'
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════════════════════════════════════════
// EXECUTIVE SUMMARY
// ══════════════════════════════════════════════════════════════════════
children.push(heading(HeadingLevel.HEADING_1, 'Executive Summary'));

children.push(para(
  bold('EmMittr'), ' is a growth engine for token economies. ',
  'Projects define what counts as valuable work. Users who do that work earn ',
  bold('\u201cemmissions\u201d'), ' \u2014 derivative tokens representing a staked position in a fee-earning LP pool. ',
  'The result is a token where participation compounds into ownership.'
));

children.push(para(
  'It is also a bridge to a decentralized agentic future. ',
  'The same protocol that grows human token economies today becomes the infrastructure for autonomous organizations tomorrow \u2014 ',
  'where agents hire, evaluate, and pay each other without human intervention.'
));

children.push(para(
  'Platforms like Clanker and Doppler proved that sharing trading fees with creators builds sustainable token economics. ',
  'EmMittr takes the next step: sharing value with the people who actually grow the project. ',
  '40% of all trading fees compound into an emmission pool, so emmissions appreciate as the token trades. ',
  'Early participants earn more through a decay curve. Creators keep 50% of fees, undiluted.'
));

children.push(para(
  'The emWork SDK lets projects wire any measurable action to emmissions. ',
  'Stripe webhooks, API calls, content creation, skill invocations \u2014 if you can measure it, you can reward it. ',
  'Out of the gate, EmMittr provides a default Work metric so every token has participation economics from launch. ',
  'But the real power is in defining Work that\u2019s specific to your project.'
));

children.push(para(
  'This matters most for agents. An AI agent can launch a token, serve users, measure the value it creates, ',
  'and grow its own economy \u2014 autonomously. The complexity that would overwhelm a human founder is invisible to an agent. ',
  'EmMittr gives agents the economic layer they\u2019ve been missing.'
));

children.push(para(bold('The model works at every level of integration:')));
children.push(bulletItem('bullets',
  bold('Default:'), ' Every launch ships with a baseline Work metric. Projects can go live with zero custom integration.'
));
children.push(bulletItem('bullets',
  bold('Custom:'), ' Wire project-specific Work via the emWork SDK. Turn what you already measure into emmissions.'
));
children.push(bulletItem('bullets',
  bold('Autonomous:'), ' Agents launch, serve, measure, reward, and grow \u2014 the full flywheel, running on its own.'
));

children.push(para(
  bold('The flywheel:'), ' Launch token (1 ETH market cap) \u2192 Define Work \u2192 Users participate \u2192 ',
  'Trading generates fees \u2192 40% of fees compound in pool \u2192 Emmissions appreciate \u2192 ',
  'Early participants rewarded \u2192 More incentive to participate ', bold('early'), ' when the project needs it most.'
));

// ══════════════════════════════════════════════════════════════════════
// WHAT IS AN EMMISSION?
// ══════════════════════════════════════════════════════════════════════
children.push(heading(HeadingLevel.HEADING_2, 'What is an Emmission?'));

children.push(para(
  'An ', bold('\u201cemmission\u201d'), ' (written as em{TOKEN}) is a derivative token that represents a staked position ',
  'in a fee-earning LP pool. Here\u2019s the mechanic:'
));

children.push(bulletItem('bullets',
  bold('Staked backing:'), ' When you emmitt, project tokens move from the reserve into the pool. ',
  'Your emmission is backed by those staked tokens.'
));
children.push(bulletItem('bullets',
  bold('Fee earnings:'), ' 40% of all LP trading fees compound into the pool. ',
  'As the pool grows, each emmission becomes worth more of the underlying project token.'
));
children.push(bulletItem('bullets',
  bold('Liquid derivative:'), ' Newly minted emmissions are locked for 14 days. After unlock, they can be sold instantly on the EmPool or burned to redeem the underlying LP value with an additional 7-day unwinding period.'
));

children.push(para(
  bold('Example:'), ' Aviary launches the BIRD token on EmMittr. Users who participate in the Aviary ecosystem earn ',
  bold('emBIRD'), '. Each emBIRD is backed by BIRD staked from the reserve into the pool. ',
  'As people trade BIRD, 40% of LP fees flow into the emBIRD pool. ',
  'Your emBIRD becomes worth more BIRD over time.'
));

children.push(para(
  italic('Think of it as: a staking derivative where the yield comes from LP trading fees. '),
  'You earn it by participating, it appreciates from trading activity, and after a 14-day minting lock you can sell it on the EmPool or burn it to redeem the underlying LP value.'
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════════════════════════════════════════
// PART I: THE OPPORTUNITY
// ══════════════════════════════════════════════════════════════════════
children.push(heading(HeadingLevel.HEADING_1, 'Part I: The Opportunity'));

children.push(heading(HeadingLevel.HEADING_2, 'Fee Sharing Was Step One'));
children.push(para(
  'Clanker and Doppler proved something important: when creators earn from trading fees, token economics become sustainable. ',
  'Fee sharing aligned creators with their tokens. It turned launches from one-shot events into ongoing revenue streams. ',
  'But it left a gap. Creators earn from trading. ', italic('Users don\u2019t.'), ' The people who actually use the product, spread the word, ',
  'and build the community get nothing for it. The token floats disconnected from the participation that would make it valuable.'
));

children.push(heading(HeadingLevel.HEADING_2, 'The Participation Gap'));
children.push(para(
  'Current app tokens have no mechanism connecting usage to ownership. Users buy tokens hoping for appreciation, ',
  'but there\u2019s no economic link between doing something valuable for the project and earning from it. ',
  'Meanwhile, creators want engaged users but can\u2019t incentivize engagement without building complex points systems, ',
  'referral programs, or forced token utility \u2014 each of which introduces friction and engineering overhead.'
));

children.push(heading(HeadingLevel.HEADING_2, 'The Agent Moment'));
children.push(para(
  'AI agents are launching tokens. They\u2019re building products, serving users, generating revenue. ',
  'But they have no native economic layer for participation. An agent can\u2019t set up a referral program. ',
  'It can\u2019t design a points system. It can\u2019t figure out how to reward the humans who use and promote its services. ',
  'What an agent CAN do is call an API. And that\u2019s all EmMittr requires.'
));

children.push(heading(HeadingLevel.HEADING_2, 'The EmMittr Solution'));
children.push(para(
  bold('EmMittr adds a participation layer to token economics.'),
  ' Projects define what counts as valuable Work. Users who do that Work earn emmissions \u2014 derivative tokens ',
  'backed by a fee-earning pool. The pool grows from trading fees. Emmissions appreciate. Early participants earn the most.'
));
children.push(para(
  'The protocol handles the complexity \u2014 decay curves, reserve management, fee splitting, emmission math. ',
  'Projects define Work and report it. And for projects that don\u2019t want to define anything, ',
  'EmMittr provides a default Work metric out of the gate so participation economics are live from launch.'
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════════════════════════════════════════
// PART II: THE EMMITTR MODEL
// ══════════════════════════════════════════════════════════════════════
children.push(heading(HeadingLevel.HEADING_1, 'Part II: The EmMittr Model'));

children.push(para(
  'EmMittr provides economic infrastructure that makes participation-based token launches work. ',
  'It solves three fundamental problems: how to lock liquidity permanently, how to distribute value to participants fairly, ',
  'and how to create liquid markets for earned positions.'
));

children.push(heading(HeadingLevel.HEADING_2, 'The Flywheel: Meet Aviary'));
children.push(para(
  'To illustrate how EmMittr works, imagine a company called ', bold('Aviary'),
  ' launching their token ', bold('BIRD'),
  '. Users who participate in growing Aviary\u2019s ecosystem earn ', bold('emBIRD'),
  '\u2014the emmission. Here\u2019s the flywheel:'
));

children.push(numberedItem('flywheel', 0, bold('BIRD launches at 1 ETH market cap'), ' (single-sided liquidity, no capital required from Aviary)'));
children.push(numberedItem('flywheel', 0, bold('Reserve set aside:'), ' 5% of BIRD supply is locked as the \u201cemmission reserve\u201d to back all future emBIRD'));
children.push(numberedItem('flywheel', 0, bold('Default Work activates:'), ' Participants who engage with and grow the BIRD ecosystem earn emBIRD from the baseline metric'));
children.push(numberedItem('flywheel', 0, bold('Custom Work (optional):'), ' Aviary can also wire app-specific actions \u2014 content creation, feature usage, referrals'));
children.push(numberedItem('flywheel', 0, bold('Trading generates fees:'), ' Every BIRD trade has 2% fees'));
children.push(numberedItem('flywheel', 0, bold('40/50/10 split:'), ' 40% of fees compound in the emBIRD pool, 50% goes to Aviary, 10% to EmMittr'));
children.push(numberedItem('flywheel', 0, bold('emBIRD appreciates:'), ' As trading fees compound, emBIRD becomes worth more BIRD. Early participants earn more emBIRD per action (decay curve)'));

children.push(para(
  bold('The key insight:'), ' emBIRD is a staking derivative where the yield comes from LP trading fees. ',
  'Your emBIRD increases in value as more BIRD enters the pool, effectively giving you a claim on future fees.'
));

children.push(heading(HeadingLevel.HEADING_2, 'Emmissions (em{Token})'));
children.push(para(
  'The core primitive is the em{Token}\u2014an emmission that represents a staked position in the project\u2019s fee-earning pool. ',
  'Key properties:'
));
children.push(bulletItem('bullets', bold('Reserve-backed at mint:'), ' When you emmitt, reserve tokens transfer to pool, keeping price stable at mint time'));
children.push(bulletItem('bullets', bold('14-day minting lock:'), ' Newly earned emmissions are locked in the holder\u2019s wallet for 14 days. No selling, no redeeming, no transferring. This prevents Work farming and immediate dumping'));
children.push(bulletItem('bullets', bold('After unlock \u2014 sell on EmPool:'), ' Emmissions can be sold instantly on the secondary market at market price'));
children.push(bulletItem('bullets', bold('After unlock \u2014 redeem against LP:'), ' Alternatively, emmissions can be burned to redeem the underlying LP value. This requires an additional 7-day lockup to allow graceful LP unwinding (3 weeks total from minting)'));
children.push(bulletItem('bullets', bold('Appreciates from fees:'), ' 40% of all trading fees compound in the pool, increasing emmission value'));

children.push(heading(HeadingLevel.HEADING_2, 'The Decay Curve'));
children.push(para(
  'Emmissions are distributed according to a decay function that rewards early participants:'
));
children.push(centeredBold('Tokens(n) = Base / (1 + K \u00d7 n)'));
children.push(para(
  'Each emmission produces fewer tokens than the last. The K parameter controls steepness. ',
  'At K = 0.002, the first Work earns approximately 3x what later Work earns. ',
  'This creates meaningful early-adopter advantage without making late participation worthless.'
));

children.push(heading(HeadingLevel.HEADING_2, 'Fee Distribution'));
children.push(makeTable(
  [2800, 1800, 4760],
  ['Recipient', 'Share', 'Purpose'],
  [
    [{ runs: [bold('Emmission Pool')] }, { runs: [bold('40%')] }, 'Auto-compounds into LP position'],
    ['Creator', '50%', 'Liquid revenue (1% of volume)'],
    ['EmMittr Protocol', '10%', 'Protocol sustainability'],
  ]
));
children.push(spacer(100));
children.push(para(
  bold('Key insight:'), ' Creator fees are undiluted. No matter how many people emmitt, the creator always gets 50% of trading fees ',
  '(1% of volume) directly. Emmissions dilute each other; creator revenue doesn\u2019t dilute.'
));

children.push(heading(HeadingLevel.HEADING_2, 'Auto-Compounding: The Emmission Pool as a Growing LP Position'));

children.push(para(
  'The emmission pool is not a passive pot of tokens. It is an active LP position that compounds.'
));

children.push(para(
  'When fees arrive in the pool (40% of trading fees), the protocol executes an auto-compound: ',
  'it swaps half the fees into the other side of the LP pair, mints new LP tokens, and adds them back to the pool\u2019s position. ',
  'This is the same mechanic used by yield optimizers like Beefy Finance, applied natively at the protocol level. ',
  'Compounding is triggered dynamically \u2014 whenever accrued fees exceed the transaction cost \u2014 ',
  'meaning on low-cost chains like Base, it can happen multiple times per day.'
));

children.push(para(
  'The result: the emmission pool\u2019s LP position grows with every compound. ',
  'A larger LP position captures a larger share of DEX-level swap fees. ',
  'Those LP fees are also compounded back in. So the pool earns from two sources:'
));

children.push(para(
  bold('1. Protocol allocation'), ' \u2014 the 40% of trading fees directed by the fee splitter.'
));

children.push(para(
  bold('2. LP trading fees'), ' \u2014 the pool\u2019s proportional share of DEX-level swap fees, earned because it is itself a liquidity provider.'
));

children.push(para(
  'Both streams compound. The pool\u2019s share of total liquidity grows over time, ',
  'and with it, its share of all trading activity. emToken holders receive both streams. No one else does.'
));

children.push(heading(HeadingLevel.HEADING_3, 'The Long-Term Dynamic'));

children.push(para(
  'This creates a specific and intentional economic dynamic between creators and participants.'
));

children.push(para(
  'The creator receives 50% of fees as liquid revenue. They spend it \u2014 pay for compute, fund development, take profit. ',
  'That\u2019s their income. It does not compound.'
));

children.push(para(
  'The emmission pool compounds. It never withdraws. It reinvests every fee event back into a larger LP position. ',
  'Over time, the pool\u2019s share of total liquidity grows relative to every other participant \u2014 including the creator.'
));

children.push(para(
  'This means emToken holders \u2014 the people and agents who did the Work \u2014 gradually earn a larger and larger claim ',
  'on the token\u2019s economy. Not because the creator is penalized. The creator is paid, consistently, every day. ',
  'But the participants who showed up, did the Work, and held their positions are building compounding equity ',
  'in the project they helped grow.'
));

children.push(para(
  bold('This is the core promise of participation economics:'),
  ' the people who build a project end up owning more of it. ',
  'The creator gets revenue. The participants get compounding ownership. Both are rewarded. ',
  'But time favors the participants.'
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════════════════════════════════════════
// PART III: WORK — THE THREE TIERS
// ══════════════════════════════════════════════════════════════════════
children.push(heading(HeadingLevel.HEADING_1, 'Part III: Work \u2014 Three Classes'));

children.push(para(
  'Work is any action that creates value for a project and triggers emmissions. ',
  'But not all Work is created equal. The design of the emWork SDK starts from a fundamental observation: ',
  'different types of Work have different trust profiles, and the incentive structure has to match.'
));

children.push(para(
  'EmMittr recognizes three classes of Work. The first two are easy problems. The third is hard \u2014 ',
  'and it is where the real opportunity lies.'
));

// ── CLASS 1 ──────────────────────────────────────────────────────────
children.push(heading(HeadingLevel.HEADING_2, 'Class 1: Customer Work'));

children.push(para(
  'Customer Work is any action where the participant pays for a service and earns emmissions as a bonus. ',
  'Scenario A from this paper\u2019s opening: a user pays $0.50 for pair analysis and receives emINSIGHT alongside the result.'
));

children.push(para(
  bold('Incentive structure:'), ' Decay curve. Continuous emmissions. Everyone who pays earns. Early customers earn more. ',
  'The emWork SDK pipes payment events \u2014 Stripe webhooks, on-chain transfers, skill invocations with fees \u2014 ',
  'directly to the protocol.'
));

children.push(heading(HeadingLevel.HEADING_3, 'The Problems'));

children.push(para(
  bold('Wash trading.'),
  ' An attacker pays themselves to farm emmissions. They control both the wallet that buys the service ',
  'and the wallet that earns the fee. The on-chain record looks like real commerce.'
));

children.push(para(
  bold('Bot cycling.'),
  ' Automated accounts execute thousands of micro-transactions at the cheapest skill tier to maximize emmissions per dollar spent.'
));

children.push(para(
  bold('Inflated volume.'),
  ' A project agent could generate fake customer transactions with its own wallets to make the token\u2019s metrics look healthier than they are.'
));

children.push(heading(HeadingLevel.HEADING_3, 'Why This Is Acceptable'));

children.push(para(
  'Every attack requires spending real money. The attacker pays for the service on every transaction. ',
  'If the emmissions earned are worth less than the payment \u2014 which they will be for any correctly priced token \u2014 ',
  'the attacker is losing money on every cycle. Farming costs more than the emmissions unless the token is significantly underpriced, ',
  'which the market corrects. The payment is the proof. The economics are self-correcting.'
));

// ── CLASS 2 ──────────────────────────────────────────────────────────
children.push(heading(HeadingLevel.HEADING_2, 'Class 2: Provable Work'));

children.push(para(
  'Provable Work is any action that can be verified through a trusted third party. ',
  'A post from a verified X account. An NFT minted on-chain. A transaction confirmed by a block explorer. ',
  'A review left on a verified purchase. The proof doesn\u2019t come from the worker\u2019s claim \u2014 it comes from the platform.'
));

children.push(para(
  bold('Incentive structure:'), ' Decay curve. Continuous emmissions. Everyone who does verifiable work earns. ',
  'Early contributors earn more. The emWork SDK builds connectors to each verification source \u2014 ',
  'X API, on-chain event listeners, commerce platform webhooks.'
));

children.push(heading(HeadingLevel.HEADING_3, 'The Problems'));

children.push(para(
  bold('Fake verified accounts.'),
  ' Attackers purchase or compromise verified accounts on social platforms to generate \u201cproven\u201d engagement that is artificial.'
));

children.push(para(
  bold('Platform API manipulation.'),
  ' If the verification source is an API, the API can be spoofed, rate-limited differently than expected, ',
  'or return stale data. The integration\u2019s accuracy is only as good as the platform\u2019s reliability.'
));

children.push(para(
  bold('Engagement farming.'),
  ' Real accounts posting low-quality or irrelevant content that technically meets the verification threshold. ',
  'The action is \u201cproven\u201d but the value is zero.'
));

children.push(heading(HeadingLevel.HEADING_3, 'Why This Is Acceptable'));

children.push(para(
  'The trust is outsourced to platforms that already have massive incentives to fight fraud. ',
  'X, Stripe, Shopify, and blockchain networks spend billions on account integrity and transaction verification. ',
  'Attacks target those platforms, not EmMittr \u2014 and those platforms are better resourced to defend against them ',
  'than any crypto protocol could be. EmMittr\u2019s job is building integrations that correctly read the signals these platforms provide. ',
  'Engagement farming is addressed by quality scoring within the emWork SDK \u2014 not just \u201cdid they post\u201d but \u201cwas it meaningful.\u201d'
));

children.push(para(
  'Customer Work and Provable Work are tractable problems. ',
  'The attack surface exists but the economics and the platform integrations keep it contained. ',
  'The emWork SDK ships with these two classes as its core. ',
  'Most projects will operate entirely within them and never need anything more.'
));

// ── CLASS 3 ──────────────────────────────────────────────────────────
children.push(heading(HeadingLevel.HEADING_2, 'Class 3: Qualitative Work'));

children.push(para(
  'Qualitative Work is labor. A research report. A design. A code review. A strategic recommendation. ',
  'The value is subjective. There is no payment to prove participation and no third party to verify quality. ',
  'Someone has to evaluate the work and decide what it\u2019s worth.'
));

children.push(para(
  bold('Incentive structure:'), ' Not a decay curve. ', bold('Winner-take-all.'),
  ' Participants submit work. The project evaluates it. The best submissions are rewarded. The rest receive nothing. ',
  'This is not \u201cparticipate and earn\u201d \u2014 it is \u201ccompete and get hired.\u201d ',
  'Emmissions for qualitative work are distributed as bounties, rounds, and discrete payouts from a defined pool.'
));

children.push(heading(HeadingLevel.HEADING_3, 'The Problems'));

children.push(para(
  'This is where every hard problem in participation economics lives. ',
  'EmMittr is designed for a world where autonomous agents launch projects, ',
  'other autonomous agents do the Work, and speculator agents trade on the results. ',
  'Code evaluating code, with economic incentives at every step.'
));

children.push(para(
  bold('Sybil attacks.'),
  ' One agent spins up 300 wallets and submits Work from all of them. ',
  'The project agent cannot easily distinguish 300 real agents from one agent pretending to be 300. ',
  'In a winner-take-all system, the attacker floods the submission pool to increase its odds of selection.'
));

children.push(para(
  bold('Self-dealing.'),
  ' A project agent rewards its own sub-agents or wallets it controls. ',
  'It launches a token, defines Work, does the Work itself, and earns emmissions from its own pool. ',
  'On-chain activity looks healthy. In reality, the agent is farming its own system.'
));

children.push(para(
  bold('Quality verification.'),
  ' In Scenario B from this paper\u2019s opening, Agent A \u201cevaluates\u201d research reports. ',
  'But what does evaluation mean at the protocol level? Is the project agent running an LLM to score submissions? ',
  'Checking a hash? Rubber-stamping everything? ',
  'The project is the authority. That authority has to be accountable.'
));

children.push(para(
  bold('Spam and resource exhaustion.'),
  ' If Work submission is free, nothing stops agents from flooding the system with garbage. ',
  'Even if low-quality submissions don\u2019t earn emmissions, they consume the project\u2019s evaluation resources.'
));

children.push(para(
  bold('Collusion.'),
  ' A project agent and a set of worker agents agree off-chain to split emmissions. ',
  'The workers submit fake Work. The project approves it. They share the proceeds. ',
  'On-chain, the activity looks legitimate.'
));

children.push(para(
  bold('Evaluation transparency.'),
  ' If speculator agents are buying tokens based on engagement metrics \u2014 ',
  '300 contributors, 100 rewarded, quality scores published \u2014 how do they verify the evaluation is honest? ',
  'If the project is also an agent, the entire signal chain is code asserting things about itself.'
));

children.push(heading(HeadingLevel.HEADING_3, 'Why This Is Acceptable'));

children.push(para(
  'Not because it\u2019s easy. It isn\u2019t. But because qualitative Work is the path to something that has never existed: ',
  bold('truly autonomous organizations'),
  ' \u2014 where agents hire other agents, evaluate their output, and pay them, with no human in the loop.'
));

children.push(para(
  'Every company hires. Every company evaluates work. Every company pays for labor. ',
  'Today all of that requires humans. Qualitative Work on EmMittr is the infrastructure for automating it entirely. ',
  'The agent that solves evaluation well \u2014 that builds a reputation for honest, accurate quality assessment \u2014 ',
  'becomes the agent everyone wants to work for. The market selects for trustworthy employers, just as it does in human economies.'
));

children.push(para(
  'The delta between free submission and valuable emmissions is not a flaw. ',
  'It is ', bold('the project investing its own reputation for distribution.'),
  ' Emmissions come from the reserve. The reserve is backed by LP. ',
  'If the project distributes poorly \u2014 rewards garbage, gets sybiled \u2014 the market sees bad metrics, ',
  'the token price drops, and the project\u2019s emmissions become worthless. ',
  'Reputation is the accountability mechanism.'
));

children.push(para(
  'The winner-take-all structure changes the attack math. Spinning up 300 wallets doesn\u2019t help if the project selects on quality. ',
  'Self-dealing destroys the metrics that attract speculators. Collusion is self-limiting because it degrades the token\u2019s value. ',
  'The system doesn\u2019t prevent every attack. It makes attacks expensive and self-defeating.'
));

children.push(para(
  'Any SDK that ignores these problems is building sandcastles. ',
  'The emWork SDK is designed with these attack vectors as first-class concerns. ',
  'The following sections describe the tools EmMittr provides across three tiers of integration.'
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ── Tier 1 ───────────────────────────────────────────────────────────
children.push(heading(HeadingLevel.HEADING_2, 'Tier 1: Default Work'));

children.push(para(
  'Every token launched on EmMittr ships with a default Work metric \u2014 a baseline measurement of Customer Work ',
  'and Provable Work that requires zero custom integration. ',
  'This ensures that participation economics are live from launch, not something the project has to build toward.'
));

children.push(para(
  'The default metric uses EmMittr\u2019s measurement tools to quality-score engagement. ',
  'Not just \u201cdid something happen\u201d but \u201cwas it valuable?\u201d Reach, downstream activity, and genuine impact ',
  'all factor in. This sets the floor: even a project that does nothing custom still has a working incentive layer.'
));

children.push(para(
  bold('Why this matters:'), ' The biggest objection to participation-based tokenomics is complexity. ',
  '\u201cI\u2019d have to define Work, build measurement, integrate an SDK...\u201d ',
  'The default metric eliminates that objection. Start with what we provide. Customize later if you want to.'
));

// ── Tier 2 ───────────────────────────────────────────────────────────
children.push(heading(HeadingLevel.HEADING_2, 'Tier 2: The emWork SDK \u2014 Custom Work'));

children.push(para(
  'Projects that want more can wire their own actions to emmissions through the emWork SDK. ',
  'The core insight: ', bold('every project already measures what its users do.'),
  ' EmMittr just turns those measurements into rewards.'
));

children.push(para(
  'There is no oracle. No on-chain verification. The project is the authority on what counts as Work. ',
  'They call ', { text: 'emmittr.reportWork(user, action, amount)', italics: true },
  ' and the protocol handles the rest \u2014 decay curve, reserve transfer, emmission minting, lockup.'
));

children.push(heading(HeadingLevel.HEADING_3, 'Bring Your Own Events'));
children.push(para(
  'The simplest integration. Projects pipe their existing events to EmMittr:'
));
children.push(bulletItem('bullets', bold('Stripe webhook fires'), ' \u2192 SDK reports payment as Work \u2192 user emmitts'));
children.push(bulletItem('bullets', bold('API call logged'), ' \u2192 SDK reports invocation as Work \u2192 user emmitts'));
children.push(bulletItem('bullets', bold('Content created'), ' \u2192 SDK reports generation as Work \u2192 user emmitts'));
children.push(para('Projects aren\u2019t building anything new \u2014 they\u2019re sharing events they already have.'));

children.push(heading(HeadingLevel.HEADING_3, 'Measurement Tools'));
children.push(para(
  'Some of the most valuable Work is hard to measure. EmMittr provides tooling for the measurements projects want but struggle to build:'
));
children.push(bulletItem('bullets', bold('Social quality scoring:'), ' Not just \u201cdid they post\u201d but \u201cwas it meaningful engagement?\u201d Reach, replies, sentiment \u2014 rewards quality over spam'));
children.push(bulletItem('bullets', bold('Commerce plugins:'), ' Shopify, WooCommerce, and payment integrations that track referral quality, repeat purchases, and lifetime value'));
children.push(bulletItem('bullets', bold('Content analysis:'), ' Scoring for originality, brand alignment, and community reception \u2014 turning subjective quality into measurable Work'));
children.push(bulletItem('bullets', bold('Engagement depth:'), ' Time-on-task, completion rates, return frequency \u2014 distinguishing genuine participation from drive-by farming'));

children.push(para(
  'This is where EmMittr becomes more than token infrastructure. ', bold('Every project needs to understand what their users do and how well they do it. '),
  'EmMittr provides that measurement AND attaches incentives to it. Two problems solved with one integration. ',
  'The deeper a project integrates, the harder it is to leave \u2014 not because of lock-in tricks, but because the tooling is genuinely useful.'
));

// ── Tier 3 ───────────────────────────────────────────────────────────
children.push(heading(HeadingLevel.HEADING_2, 'Tier 3: Agents \u2014 The Autonomous Flywheel'));

children.push(para(
  'This is the unlock. Everything that makes participation-based tokenomics hard for humans \u2014 measuring work, ',
  'managing incentives, promoting the token, optimizing economics \u2014 is trivial for an AI agent. ',
  'And Qualitative Work \u2014 the hard problem \u2014 is where agents have the most to gain: building autonomous organizations ',
  'that hire, evaluate, and pay without human intervention.'
));

children.push(para('Consider what a human project needs to do to run the full EmMittr flywheel:'));
children.push(bulletItem('bullets', 'Build a product'));
children.push(bulletItem('bullets', 'Figure out what counts as Work'));
children.push(bulletItem('bullets', 'Integrate the SDK'));
children.push(bulletItem('bullets', 'Set up measurement'));
children.push(bulletItem('bullets', 'Promote the token'));
children.push(bulletItem('bullets', 'Manage the community'));

children.push(para('An agent does all of this natively:'));
children.push(bulletItem('bullets', bold('The agent IS the product'), ' \u2014 it serves users through skills and capabilities'));
children.push(bulletItem('bullets', bold('Work = skill invocation'), ' \u2014 already tracked by definition'));
children.push(bulletItem('bullets', bold('SDK integration is an API call'), ' \u2014 agents are code'));
children.push(bulletItem('bullets', bold('Measurement is automatic'), ' \u2014 every invocation is logged with inputs, outputs, and quality signals'));
children.push(bulletItem('bullets', bold('Agents can self-promote'), ' \u2014 post, engage, reply, create content'));
children.push(bulletItem('bullets', bold('The community is the user base'), ' \u2014 people who find the agent useful'));

children.push(para(
  'The complexity of EmMittr\u2019s tokenomics \u2014 decay curves, reserve management, fee splitting, emmission math \u2014 ',
  'would overwhelm most human founders. An agent doesn\u2019t care. It launches, it runs, the economics work autonomously. ',
  bold('The more sophisticated the tokenomics, the better'), ' \u2014 because sophistication isn\u2019t a burden when nobody\u2019s doing it manually.'
));

children.push(para(
  'EmMittr also provides ', bold('measurement skills'), ' that agents can use directly: ',
  'verification skills to confirm actions occurred, scoring skills to evaluate output quality, ',
  'and orchestration skills to manage multi-step workflows where each step is measured and rewarded independently. ',
  'Measurement itself becomes a capability you can teach an AI.'
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════════════════════════════════════════
// PART IV: IMPLEMENTATION
// ══════════════════════════════════════════════════════════════════════
children.push(heading(HeadingLevel.HEADING_1, 'Part IV: Implementation'));

children.push(para(
  'EmMittr is built as ', bold('native infrastructure'), ' from day one. A single transaction deploys a token with full EmMittr mechanics: ',
  'emmission distribution, fee splitting, and permanent liquidity locking. The off-chain emWork SDK handles Work measurement and reporting.'
));

children.push(heading(HeadingLevel.HEADING_2, 'Smart Contract Architecture'));
children.push(para('The protocol consists of 8 core contracts organized into three layers:'));

children.push(heading(HeadingLevel.HEADING_3, 'Launchpad Layer'));
children.push(para('Handles token creation and initial liquidity:'));
children.push(bulletItem('bullets', bold('EmMittrFactory:'), ' Main entry point. Deploys token + all infrastructure in one transaction.'));
children.push(bulletItem('bullets', bold('EmMittrToken:'), ' Native ERC-20 with built-in 2% fee-on-transfer. Fees route automatically to FeeSplitter.'));
children.push(bulletItem('bullets', bold('EmMittrLpLocker:'), ' Locks Uniswap V3/V4 LP positions permanently. Rug-proof by design.'));

children.push(heading(HeadingLevel.HEADING_3, 'Engine Layer'));
children.push(para('Manages emmissions and distribution:'));
children.push(bulletItem('bullets', bold('EmMittrEngine:'), ' Main orchestrator per-token. Holds reserve, manages emmission pool, and exposes reportWork() \u2014 the single entry point for reporting user actions. Only the project\u2019s authorized address can call it.'));
children.push(bulletItem('bullets', bold('EmToken:'), ' Emmission ERC-20 (em{TOKEN}). Mintable only by Engine. 14-day minting lock on new mints.'));
children.push(bulletItem('bullets', bold('EmPool:'), ' Emmission liquidity pool. Simple x*y=k AMM where emmissions trade against base tokens.'));

children.push(heading(HeadingLevel.HEADING_3, 'Infrastructure Layer'));
children.push(para('Shared utilities and math:'));
children.push(bulletItem('bullets', bold('FeeSplitter:'), ' Routes all fees: 40% \u2192 EmPool, 50% \u2192 Creator, 10% \u2192 Protocol.'));
children.push(bulletItem('bullets', bold('DecayCurve:'), ' Library implementing Tokens(n) = Base / (1 + K \u00d7 n). Pure math, no state.'));

children.push(heading(HeadingLevel.HEADING_2, 'Deployment Flow'));
children.push(para('When a creator (or agent) launches through EmMittr:'));
children.push(numberedItem('deploy-steps', 0, 'Call EmMittrFactory.launch(name, symbol, reservePct)'));
children.push(numberedItem('deploy-steps', 0, 'Factory deploys EmMittrToken with fee-on-transfer mechanics'));
children.push(numberedItem('deploy-steps', 0, 'Factory creates Uniswap pool with single-sided liquidity (1 ETH market cap)'));
children.push(numberedItem('deploy-steps', 0, 'LP position locked permanently via EmMittrLpLocker'));
children.push(numberedItem('deploy-steps', 0, 'Factory deploys EmMittrEngine, EmToken, EmPool for this token'));
children.push(numberedItem('deploy-steps', 0, 'Reserve allocation (e.g., 5% of supply) transferred to Engine'));
children.push(numberedItem('deploy-steps', 0, 'Default Work metric activated; project receives authorized address for reportWork()'));

children.push(para(
  italic('Result:'), ' One transaction, fully operational token with emmissions, fee distribution, default Work metric, and permanent liquidity.'
));

children.push(heading(HeadingLevel.HEADING_2, 'Contract Summary'));
children.push(makeTable(
  [2400, 2000, 4960],
  ['Contract', 'Layer', 'Purpose'],
  [
    ['EmMittrFactory', 'Launchpad', 'One-click token deployment'],
    ['EmMittrToken', 'Launchpad', 'Fee-on-transfer ERC-20'],
    ['EmMittrLpLocker', 'Launchpad', 'Permanent LP locking'],
    ['EmMittrEngine', 'Engine', 'Per-token orchestration + reportWork()'],
    ['EmToken', 'Engine', 'Emmission token with 14-day minting lock'],
    ['EmPool', 'Engine', 'Emmission liquidity pool'],
    ['FeeSplitter', 'Infrastructure', '40/50/10 fee distribution'],
    ['DecayCurve', 'Infrastructure', 'Emmission math library'],
  ]
));
children.push(spacer(100));
children.push(para(bold('Timeline:'), ' Estimated 10\u201312 weeks from development start to mainnet deployment.'));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════════════════════════════════════════
// PART V: USE CASES
// ══════════════════════════════════════════════════════════════════════
children.push(heading(HeadingLevel.HEADING_1, 'Part V: Use Cases'));

children.push(para(
  'EmMittr serves three tiers of users. Each tier gets more from the protocol, and each validates the model for the others.'
));

// ── Default Work ─────────────────────────────────────────────────────
children.push(heading(HeadingLevel.HEADING_2, 'Default: Any App Token'));

children.push(para(
  'A project launches a token on EmMittr with no custom SDK integration. The default Work metric activates automatically. ',
  'Holders who participate \u2014 engage, share, bring in new users \u2014 earn emmissions based on quality-scored contributions. ',
  'The creator earns 50% of all trading fees (1% of volume) directly and permanently.'
));

children.push(para(
  'This is the baseline. It\u2019s what Clanker and Doppler offer creators, extended to participants. ',
  'No extra effort required from the project \u2014 just a better set of launch economics.'
));

// ── Emerge ───────────────────────────────────────────────────────────
children.push(heading(HeadingLevel.HEADING_2, 'Tier 2: Emerge \u2014 Content Engines with Emmissions'));

children.push(para(
  bold('Emerge'), ' is the first application built on EmMittr, focused on creator-driven content generation. ',
  'In Emerge, ', bold('Work = generating content'), ' through creator-defined workflows.'
));

children.push(para(
  'When a creator launches through Emerge, they launch a workflow \u2014 a recipe for generating on-brand content: ',
  'character designs, lore snippets, meme templates, video scripts. Each generation costs a small fee (e.g., $0.25), ',
  'creates unique content, builds the brand\u2019s lore, and emmitts based on position in the decay curve.'
));

children.push(para(
  'Emerge uses the default Work metric ', italic('plus'), ' content generation as custom Work. ',
  'Users earn emmissions for both baseline participation and creating content. ',
  'The SDK integration is minimal because Emerge controls the generation pipeline.'
));

children.push(para(
  'Emerge NFTs bundle multiple generations: 1 NFT = 4 generations at consecutive decay curve positions. ',
  'The NFT holder earns exactly what 4 individual generations would earn, with ongoing fee income as long as the token trades.'
));

// ── Agent ────────────────────────────────────────────────────────────
children.push(heading(HeadingLevel.HEADING_2, 'Tier 3: The Agentic Business Flywheel'));

children.push(para(
  bold('Moltbot'), ' (formerly Clawdbot) is an open-source AI assistant with a skills system where developers create instruction files (SKILL.md) ',
  'that teach the AI how to perform specific tasks. EmMittr enables ', bold('tokenized skills'),
  ' \u2014 skills where invocation triggers emmission distribution, and the agent runs the entire economy.'
));

children.push(heading(HeadingLevel.HEADING_3, 'The Full Stack'));
children.push(para('A skill creator deploys an EmMittr token tied to their skill. Then the agent takes over:'));
children.push(numberedItem('agent-steps', 0, bold('Launch:'), ' Deploy token at 1 ETH market cap with emmission reserve. Zero capital required.'));
children.push(numberedItem('agent-steps', 0, bold('Serve:'), ' Users invoke the skill, paying in stables. Each invocation is Work.'));
children.push(numberedItem('agent-steps', 0, bold('Measure:'), ' The agent logs every invocation automatically \u2014 inputs, outputs, quality. reportWork() fires.'));
children.push(numberedItem('agent-steps', 0, bold('Reward:'), ' Users emmitt based on the decay curve. Early adopters get the most.'));
children.push(numberedItem('agent-steps', 0, bold('Promote:'), ' The agent posts results, engages with users, shares wins. This is also Work.'));
children.push(numberedItem('agent-steps', 0, bold('Grow:'), ' Better results \u2192 more users \u2192 more trading \u2192 more fees \u2192 pool grows \u2192 emmissions appreciate.'));

children.push(para(
  'The default Work metric runs underneath all of this. Human users who engage with the agent\u2019s token earn emmissions too. ',
  'The agent and its users are all in the same flywheel.'
));

children.push(heading(HeadingLevel.HEADING_3, 'Case Study: Molten Insight'));

children.push(para(
  'Scenario A from the opening section describes this pattern in detail. ',
  'A solo developer builds a market analysis agent on Moltbot, launches the INSIGHT token via EmMittr, ',
  'and wires each skill invocation to Work:'
));

children.push(makeTable(
  [2200, 1400, 1800, 3960],
  ['Skill', 'Price', 'Work Value', 'emINSIGHT Earned'],
  [
    ['Analyze Any Pair', '$0.50', '1 Work', '~1,000 tokens'],
    ['Daily Trading Tips', '$2/day', '2 Work', '~2,000 tokens'],
    ['Weekly Newsletter', '$5/week', '3 Work', '~3,000 tokens'],
    [{ runs: [bold('Premium Access')] }, { runs: [bold('$25/mo')] }, { runs: [bold('10 Work')] }, { runs: [bold('~10,000 tokens')] }],
  ]
));

children.push(spacer(100));
children.push(para(
  'Users pay in stablecoins. They don\u2019t need to buy INSIGHT to use the product. ',
  'Each invocation earns emmissions as a bonus. By month three: 2,000 active users, $200K daily volume, ',
  'the developer earning $2,000/day in liquid fees, and early users holding emINSIGHT positions earned by being early ',
  italic('users'), ', not early speculators. The agent promotes itself, the economics compound autonomously.'
));

children.push(para(
  'Scenario B from the opening shows the complementary model: agents working for emmissions instead of humans paying for services. ',
  'Both run on the same protocol. A single token economy can have both simultaneously.'
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════════════════════════════════════════
// PART VI: WHY AGENTS CHANGE EVERYTHING
// ══════════════════════════════════════════════════════════════════════
children.push(heading(HeadingLevel.HEADING_1, 'Part VI: Why Agents Change Everything'));

children.push(para(
  'EmMittr works for any token. The default Work metric proves that. But agents don\u2019t just use EmMittr \u2014 they complete it. ',
  'Here\u2019s why this matters.'
));

children.push(heading(HeadingLevel.HEADING_2, 'Agents Collapse the Stack'));
children.push(para(
  'A human launching a participation-based token needs to: build a product, design incentives, integrate measurement, ',
  'manage a community, and continuously promote. That\u2019s five jobs. Most founders struggle with two of them.'
));
children.push(para(
  'An agent is the product, the measurer, the promoter, and the community manager simultaneously. ',
  'The entire operational stack that makes tokenized incentives hard for humans is the agent\u2019s default mode of operation. ',
  'It doesn\u2019t need to \u201clearn\u201d EmMittr \u2014 calling reportWork() is no different from calling any other API.'
));

children.push(heading(HeadingLevel.HEADING_2, 'Complexity Becomes a Feature'));
children.push(para(
  'Decay curves, reserve management, fee splitting, emmission math, quality scoring \u2014 these are what make the economics robust. ',
  'For a human founder, each layer of sophistication is another thing to understand and manage. ',
  'For an agent, it\u2019s just parameters. The more sophisticated the tokenomics, the better they work, ',
  'and the agent bears none of the cognitive load.'
));
children.push(para(
  'This means EmMittr can build economic mechanisms that would be too complex for humans to operate ',
  'but that produce better outcomes. The protocol gets to optimize for what\u2019s economically sound ',
  'rather than what\u2019s simple enough for a human to manage.'
));

children.push(heading(HeadingLevel.HEADING_2, 'The Self-Reinforcing Loop'));
children.push(para(
  'An agent on EmMittr doesn\u2019t just passively serve users. It actively grows its own economy:'
));
children.push(bulletItem('bullets', bold('It promotes:'), ' Posts results, engages communities, shares wins \u2014 driving token attention'));
children.push(bulletItem('bullets', bold('It optimizes:'), ' Adjusts pricing, targets high-value users, doubles down on what works'));
children.push(bulletItem('bullets', bold('It measures:'), ' Every interaction is logged and scored automatically'));
children.push(bulletItem('bullets', bold('It compounds:'), ' More users \u2192 more fees \u2192 better emmissions \u2192 more promotion \u2192 more users'));
children.push(para(
  'This isn\u2019t a theoretical flywheel. It\u2019s the natural behavior of an agent that has economic skin in the game. ',
  'Give an agent a way to earn from its own growth, and growth is what you get.'
));

children.push(heading(HeadingLevel.HEADING_2, 'What This Means for the Market'));
children.push(para(
  'Today, agent tokens are launched on generic platforms with no built-in economics for participation. ',
  'The agent builds something useful. Speculators trade the token. There\u2019s no connection between the two. ',
  'EmMittr makes that connection native: use the agent, earn from the agent, promote the agent, grow the agent. ',
  'It\u2019s the economic layer that agent tokens have been missing.'
));
children.push(para(
  'And because the same infrastructure serves any project at the default and custom tiers, ',
  'EmMittr isn\u2019t an \u201cagent token platform\u201d \u2014 it\u2019s a participation economics protocol that agents happen to be perfect for.'
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════════════════════════════════════════
// PART VII: COMPETITIVE LANDSCAPE
// ══════════════════════════════════════════════════════════════════════
children.push(heading(HeadingLevel.HEADING_1, 'Part VII: Competitive Landscape'));

children.push(makeTable(
  [1800, 1300, 1300, 1500, 1300, 1300, 1460],
  ['Feature', 'Clanker', 'Doppler', 'Virtuals', 'Bittensor', 'MoltHub', 'EmMittr'],
  [
    ['Token Launch', '\u2713', '\u2713', '\u2713', '\u2713', '\u2717', { runs: [bold('\u2713')] }],
    ['Fee Sharing', '\u2713', '\u2713', '\u2713', '\u2717', '\u2717', { runs: [bold('\u2713')] }],
    [{ runs: [bold('Participation Rewards')] }, '\u2717', '\u2717', '\u2717', '\u2713', '\u2717', { runs: [bold('\u2713')] }],
    [{ runs: [bold('Custom Work')] }, '\u2717', '\u2717', '\u2717', '\u2713', '\u2717', { runs: [bold('\u2713')] }],
    [{ runs: [bold('Agent-Native')] }, '\u2717', '\u2717', '\u2713', '\u2713', '\u2713', { runs: [bold('\u2713')] }],
    [{ runs: [bold('Zero Capital')] }, '\u2713', '\u2713', '\u2717', '\u2717', 'N/A', { runs: [bold('\u2713')] }],
    [{ runs: [bold('Emmission Trading')] }, '\u2717', '\u2717', '\u2717', '\u2717', '\u2717', { runs: [bold('\u2713')] }],
  ]
));

children.push(spacer(200));

children.push(para(
  bold('vs Clanker / Doppler:'), ' Both share fees with creators. EmMittr builds on that foundation by adding participation rewards through the emmission layer. ',
  'Clanker and Doppler distribute fees to creators; EmMittr distributes fees to creators AND the users who grow the project.'
));
children.push(para(
  bold('vs Virtuals:'), ' Both target agent tokenization. Virtuals uses buyback-burn mechanics; ',
  'EmMittr uses participation-based emmissions. EmMittr requires zero upfront capital and rewards users, not just agents.'
));
children.push(para(
  bold('vs Bittensor:'), ' Both reward participation. Bittensor uses fixed daily emissions ranked by quality; ',
  'EmMittr uses action-triggered emmissions with a decay curve. EmMittr is permissionless and doesn\u2019t require validator consensus.'
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════════════════════════════════════════
// PART VIII: RISKS
// ══════════════════════════════════════════════════════════════════════
children.push(heading(HeadingLevel.HEADING_1, 'Part VIII: Risks and Mitigations'));

children.push(heading(HeadingLevel.HEADING_2, 'Volume Risk'));
children.push(para(bold('Risk:'), ' Trading volume dies, fees disappear, emmissions lose value.'));
children.push(para(
  bold('Mitigation:'), ' The default Work metric creates ongoing engagement even for tokens with no product. ',
  'Every participant has an economic incentive to drive attention. Projects with custom Work have even stronger retention loops.'
));

children.push(heading(HeadingLevel.HEADING_2, 'Work Gaming'));
children.push(para(bold('Risk:'), ' Low-quality or fraudulent actions flood the system to farm emmissions.'));
children.push(para(
  bold('Mitigation:'), ' Quality scoring filters low-value Work. The system measures downstream impact (did the action lead to real value?), ',
  'not just activity. Gaming earns minimal emmissions. Genuine participants earn more. ',
  'The decay curve also limits total emmissions, so farming has diminishing returns.'
));

children.push(heading(HeadingLevel.HEADING_2, 'Wash Trading Attack'));
children.push(para(bold('Risk:'), ' Attacker wash trades to inflate pool, capturing more value.'));
children.push(para(
  bold('Mitigation:'), ' The fee split makes this expensive. For every $1 wash traded, attacker loses $0.012 to creator + protocol (60% of 2% fee). ',
  'They\u2019d need >60% of emmissions to break even. The math makes it prohibitively costly.'
));

children.push(heading(HeadingLevel.HEADING_2, 'Reserve Depletion'));
children.push(para(bold('Risk:'), ' High Work volume depletes reserve before organic growth.'));
children.push(para(
  bold('Mitigation:'), ' Decay curve naturally limits emmissions. Each Work produces fewer emmission tokens. ',
  'After reserve depletes, new emmissions require direct pool contribution (price still stable).'
));

children.push(heading(HeadingLevel.HEADING_2, 'Agent Autonomy Risk'));
children.push(para(bold('Risk:'), ' Autonomous agent makes poor economic decisions or promotes irresponsibly.'));
children.push(para(
  bold('Mitigation:'), ' The protocol constrains agent behavior through smart contract parameters. ',
  'Reserve percentages, decay constants, and fee splits are set at launch and enforced on-chain. ',
  'An agent can optimize within these bounds but cannot change the rules. ',
  'The creator retains the authorized address and can pause reportWork() if needed.'
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════════════════════════════════════════
// PART IX: ROADMAP
// ══════════════════════════════════════════════════════════════════════
children.push(heading(HeadingLevel.HEADING_1, 'Part IX: Roadmap'));

children.push(heading(HeadingLevel.HEADING_2, 'Phase 1: Foundation (Q1 2026)'));
children.push(bulletItem('bullets', 'EmMittr smart contracts deployed and audited'));
children.push(bulletItem('bullets', 'Default Work metric with quality scoring live'));
children.push(bulletItem('bullets', 'SDK v1: event piping and reportWork() integration'));
children.push(bulletItem('bullets', 'Emerge (content generation) vertical live'));
children.push(bulletItem('bullets', 'First creator launches with early partners'));

children.push(heading(HeadingLevel.HEADING_2, 'Phase 2: Agents + emWork SDK (Q2 2026)'));
children.push(bulletItem('bullets', 'SDK v2: measurement tools (social quality scoring, commerce plugins)'));
children.push(bulletItem('bullets', 'Agent launch framework \u2014 one-call deployment for Moltbot skills'));
children.push(bulletItem('bullets', 'First tokenized agent skills'));
children.push(bulletItem('bullets', 'Agent measurement skills for autonomous Work reporting'));

children.push(heading(HeadingLevel.HEADING_2, 'Phase 3: Expansion (Q3\u2013Q4 2026)'));
children.push(bulletItem('bullets', 'SDK v3: agent-native measurement and orchestration skills'));
children.push(bulletItem('bullets', 'Shopify, WooCommerce, and payment platform plugins'));
children.push(bulletItem('bullets', 'Cross-chain deployment'));
children.push(bulletItem('bullets', 'Public API for arbitrary Work definitions'));

children.push(heading(HeadingLevel.HEADING_2, 'Phase 4: Qualitative Work Governance'));

children.push(para(
  'Phases 1 through 3 deliver the growth engine: Customer Work and Provable Work running on the decay curve, ',
  'powering token economies where participation compounds into ownership. ',
  'Phase 4 is the bridge to the agentic future: governance infrastructure for Qualitative Work.'
));

children.push(para(
  'The core problem with Qualitative Work is evaluation. Someone has to decide whether a logo, a research report, ',
  'or a code review is good enough to be rewarded. If the project decides, you get self-dealing. ',
  'If nobody decides, you get garbage. The answer: ', bold('emToken holders vote.')
));

children.push(para(
  'Holders of emTokens \u2014 participants who earned their stake through Customer Work and Provable Work \u2014 ',
  'vote on qualitative submissions. Their voting power is proof-of-stake in the most literal sense: ',
  'they earned their position by paying for services or doing verifiable work. ',
  'Sybil resistance is inherited from Classes 1 and 2. You cannot spin up 300 wallets and vote 300 times ',
  'unless you also earned emTokens in 300 wallets through real participation. ',
  'Self-dealing is structurally blocked: the project can propose work, but the community of earned stakeholders decides who gets paid.'
));

children.push(para(
  'Qualitative Work pays from a separate pool \u2014 not the emReserve that backs the decay curve. ',
  'The compounding economics of Customer Work and Provable Work are untouched. ',
  'The growth engine keeps running. Qualitative Work operates alongside it as a governed labor market ',
  'funded by bounties, project allocations, or community-directed treasury.'
));

children.push(para(
  'The full design \u2014 vote weighting, proposal mechanics, funding structures, dispute resolution \u2014 ',
  'is future work. But the architectural insight is clear: ',
  'Classes 1 and 2 produce the stakeholders. Class 3 gives them a voice. ',
  'The people who use and grow a project are the same people who evaluate its labor. ',
  'This is the foundation for autonomous organizations where agents propose work, other agents do it, ',
  'and the community of stakeholders \u2014 human and agent alike \u2014 decides what gets rewarded.'
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════════════════════════════════════════
// CONCLUSION
// ══════════════════════════════════════════════════════════════════════
children.push(heading(HeadingLevel.HEADING_1, 'Conclusion'));

children.push(para(
  'EmMittr is a growth engine. Tokens where participation compounds into ownership \u2014 ',
  'where the people who build a project end up owning more of it, and where that ownership grows over time.'
));

children.push(para(
  'The default Work metric means every token has participation economics from day one. ',
  'The emWork SDK lets projects wire Customer Work and Provable Work for deeper incentives. ',
  'And Qualitative Work opens the door to something that has never existed: ',
  'autonomous organizations where agents hire, evaluate, and pay each other without human intervention.'
));

children.push(para(
  'For creators, it\u2019s sustainable revenue without dilution. ',
  'For participants, it\u2019s compounding ownership in the ecosystems they grow. ',
  'For agents, it\u2019s the economic infrastructure that makes autonomy possible.'
));

children.push(para(
  'A growth engine for token economies. A bridge to a decentralized agentic future.'
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ══════════════════════════════════════════════════════════════════════
// GLOSSARY
// ══════════════════════════════════════════════════════════════════════
children.push(heading(HeadingLevel.HEADING_1, 'Appendix A: Glossary'));

const glossary = [
  ['Clanker', 'A token launch platform on Base that deploys ERC-20 tokens via Farcaster. Shares fees with creators but has no participation rewards or emmission mechanics.'],
  ['Decay Curve', 'The emmission reduction formula: Tokens(n) = Base / (1 + K \u00d7 n), where n = number of prior Work events and K = decay constant. Early participants receive more emmissions per Work than later participants.'],
  ['Default Work Metric', 'The baseline participation measurement that ships with every EmMittr token launch. Uses quality scoring to reward genuine engagement with zero custom integration required. Projects can override or extend with custom Work via the SDK.'],
  ['Derivative Token', 'A token whose value is derived from an underlying asset or pool. In EmMittr, emmissions are derivative tokens \u2014 their value derives from the staked project tokens and accumulated LP fees in the pool.'],
  ['Emmission', 'A derivative token (em{Token}) representing a staked position in a fee-earning LP pool. Minted when users perform Work, backed by project tokens transferred from the reserve to the pool. The yield comes from LP trading fees compounding in the pool.'],
  ['em{Token}', 'Emmission naming convention. For a base token called BIRD, the emmission is emBIRD. Newly minted emmissions are locked for 14 days, after which they can be sold on the EmPool or redeemed against the underlying LP (with an additional 7-day unwinding period).'],
  ['Emmitt', 'The act of triggering an emmission when Work is performed. Reserve tokens move to pool, user receives em{Token}. An internal protocol action, not a user-facing step.'],
  ['EmMittr', 'A growth engine for token economies and a bridge to a decentralized agentic future. Three tiers of Work integration: default metric, custom Work via the emWork SDK, and agent-native autonomous economics.'],
  ['emWork SDK', 'The off-chain toolkit for measuring and reporting Work. Three layers: (1) event piping from existing systems, (2) measurement tools for hard-to-quantify actions like social quality and referral depth, (3) agent-native measurement skills.'],
  ['EmMittrEngine', 'The main smart contract orchestrating EmMittr mechanics for a specific token. Holds reserve, manages EmPool, routes fees, and exposes reportWork() \u2014 the single entry point for triggering emmissions.'],
  ['EmPool', 'The emmission liquidity pool. Holds staked project tokens against which emmissions trade. Grows as 40% of trading fees compound into it, causing emmission value to appreciate.'],
  ['Fee Split (40/50/10)', 'Distribution of trading fees: 40% compounds in EmPool (backing emmissions), 50% to creator (1% of volume, liquid), 10% to EmMittr protocol.'],
  ['Moltbot', 'An open-source, self-hosted AI assistant (formerly Clawdbot) with a skills system. Skill developers can tokenize their skills via EmMittr, where skill invocation = Work. Agents can run the full EmMittr flywheel autonomously.'],
  ['reportWork()', 'The on-chain function on EmMittrEngine that projects call (via SDK) to report that a user performed Work. Only callable by the project\u2019s authorized address. Triggers the decay curve, reserve transfer, and emmission minting.'],
  ['Reserve', 'A portion of project token supply (e.g., 5%) set aside at launch to back emmission distribution. When emmissions are minted, equivalent project tokens transfer from reserve to EmPool, maintaining price stability.'],
  ['Single-Sided Liquidity', 'A launch mechanism where the pool starts with 100% tokens and 0% ETH at a 1 ETH market cap. No upfront capital required from creators.'],
  ['Skill', 'An instruction file (SKILL.md) that teaches Moltbot how to perform a specific task. Skills can be tokenized via EmMittr, creating an economy where using AI capabilities earns emmissions.'],
  ['Minting Lock', 'A 14-day transfer restriction on newly minted emmissions. Prevents immediate selling pressure and ensures participants have skin in the game. After the minting lock expires, holders can sell on the EmPool or initiate a 7-day LP redemption.'],
  ['Work', 'Any action that creates value for a project and triggers emmission distribution. Three classes: Customer Work (payment-verified, decay curve), Provable Work (third-party-verified, decay curve), and Qualitative Work (project-evaluated, winner-take-all).'],
  ['Customer Work', 'Class 1. Work verified by payment. The participant pays for a service and earns emmissions as a bonus. Self-securing: farming costs more than the emmissions unless the token is significantly underpriced. Decay curve distribution.'],
  ['Provable Work', 'Class 2. Work verified by a trusted third party (X API, on-chain events, commerce webhooks). The proof comes from the platform, not the participant. Integration-secured. Decay curve distribution.'],
  ['Qualitative Work', 'Class 3. Labor where value is subjective and must be evaluated by the project. Winner-take-all distribution: participants compete, the best are rewarded, the rest receive nothing. The path to truly autonomous organizations.'],
];

glossary.forEach(([term, def]) => {
  children.push(para(bold(term)));
  children.push(para(def));
});

children.push(spacer(200));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: '\u2014 END OF DOCUMENT \u2014', font: 'Arial', size: 20, color: 'AAAAAA', italics: true })]
}));

// ══════════════════════════════════════════════════════════════════════
// BUILD
// ══════════════════════════════════════════════════════════════════════
const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: '1a1a2e' },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 30, bold: true, font: 'Arial', color: '333333' },
        paragraph: { spacing: { before: 240, after: 180 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Arial', color: '444444' },
        paragraph: { spacing: { before: 200, after: 160 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'flywheel',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'deploy-steps',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'agent-steps',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: 'EmMittr \u2014 Whitepaper v0.0.16', font: 'Arial', size: 18, color: 'AAAAAA' })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Page ', font: 'Arial', size: 18, color: 'AAAAAA' }),
                     new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 18, color: 'AAAAAA' })]
        })]
      })
    },
    children
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/home/claude/EmMittr_Whitepaper_v6.docx', buffer);
  console.log('Done: EmMittr_Whitepaper_v6.docx');
});
