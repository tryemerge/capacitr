const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, PageBreak,
        AlignmentType, HeadingLevel, BorderStyle, WidthType,
        Table, TableRow, TableCell, ShadingType, LevelFormat } = require('docx');

// ── Helpers ──────────────────────────────────────────────────────────
const bold = (t) => new TextRun({ text: t, bold: true, font: 'Arial', size: 22 });
const text = (t) => new TextRun({ text: t, font: 'Arial', size: 22 });
const italic = (t) => new TextRun({ text: t, italics: true, font: 'Arial', size: 22 });
const boldItalic = (t) => new TextRun({ text: t, bold: true, italics: true, font: 'Arial', size: 22 });

function para(...runs) {
  const children = runs.map(r => typeof r === 'string' ? text(r) : r);
  return new Paragraph({ spacing: { after: 140, line: 264 }, children });
}

function spacer(after = 100) {
  return new Paragraph({ spacing: { after }, children: [] });
}

// ── Build ────────────────────────────────────────────────────────────
const children = [];

// ── TITLE ────────────────────────────────────────────────────────────
children.push(new Paragraph({
  alignment: AlignmentType.LEFT, spacing: { after: 80 },
  children: [new TextRun({ text: 'EmMittr', font: 'Arial', size: 52, bold: true })]
}));

children.push(new Paragraph({
  alignment: AlignmentType.LEFT, spacing: { after: 40 },
  children: [new TextRun({ text: 'A growth engine for token economies.', font: 'Arial', size: 26, italics: true, color: '555555' })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.LEFT, spacing: { after: 240 },
  children: [new TextRun({ text: 'A bridge to a decentralized agentic future.', font: 'Arial', size: 26, italics: true, color: '555555' })]
}));

// ── SECTION: THE PROBLEM ─────────────────────────────────────────────
children.push(new Paragraph({
  spacing: { after: 120 },
  children: [new TextRun({ text: 'The Problem', font: 'Arial', size: 26, bold: true })]
}));

children.push(para(
  'Token launches are liquidity events. Value goes in, insiders extract it, the token dies. ',
  'Platforms like Clanker and Doppler improved this by sharing trading fees with creators \u2014 ',
  'but the people who actually grow a project still get nothing. ',
  'Meanwhile, the AI agent economy is exploding \u2014 over 1,200 AI tokens, $29B in market cap, ',
  '21,000 agent launches per month on Virtuals alone \u2014 ',
  'and none of them have the infrastructure to build a real economy.'
));

// ── SECTION: THE SOLUTION ────────────────────────────────────────────
children.push(new Paragraph({
  spacing: { before: 80, after: 120 },
  children: [new TextRun({ text: 'EmMittr', font: 'Arial', size: 26, bold: true })]
}));

children.push(para(
  'EmMittr turns participation into compounding ownership. ',
  'Projects define what counts as valuable work. Users who do that work earn ',
  bold('emmissions'), text(' \u2014 derivative tokens representing a staked position in a fee-earning liquidity pool. '),
  text('Early participants earn more. The pool auto-compounds. Ownership grows over time.')
));

// ── SECTION: HOW IT WORKS ────────────────────────────────────────────
children.push(new Paragraph({
  spacing: { before: 80, after: 120 },
  children: [new TextRun({ text: 'How It Works', font: 'Arial', size: 26, bold: true })]
}));

children.push(para(
  bold('Launch:'), text(' A project deploys a token with zero upfront capital. The protocol creates a liquidity pool, ')
));

// Fix: rewrite as single para with all elements
children.pop(); // remove broken one

children.push(para(
  bold('Launch.'), text(' Zero upfront capital. Single-sided liquidity. '),
  bold('Work.'), text(' Users do things that create value \u2014 pay for services, post on social media, use the product. '),
  text('The protocol rewards them with emmissions based on a decay curve: early participants earn more.')
));

children.push(para(
  bold('Compound.'), text(' 40% of all trading fees auto-compound into the emmission pool. Creators take 50% as liquid revenue, undiluted. '),
  bold('Own.'), text(' The creator gets revenue. The participants get compounding ownership. Time favors the participants.')
));

// Fee split table (inline with How It Works)
const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function headerCell(t, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: { fill: '2B2B2B', type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text: t, font: 'Arial', size: 20, bold: true, color: 'FFFFFF' })] })]
  });
}

function bodyCell(runs, width, fill) {
  const children = runs.map(r => typeof r === 'string' ? new TextRun({ text: r, font: 'Arial', size: 20 }) : r);
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: [new Paragraph({ spacing: { after: 0 }, children })]
  });
}

children.push(new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [3120, 3120, 3120],
  rows: [
    new TableRow({ children: [
      headerCell('Emmission Pool \u2014 40%', 3120),
      headerCell('Creator \u2014 50%', 3120),
      headerCell('Protocol \u2014 10%', 3120),
    ]}),
    new TableRow({ children: [
      bodyCell(['Auto-compounds into LP. Never withdrawn.'], 3120, 'F5F5F5'),
      bodyCell(['1% of volume, liquid. Revenue without dilution.'], 3120, 'F5F5F5'),
      bodyCell(['Funds EmMittr operations.'], 3120, 'F5F5F5'),
    ]}),
  ]
}));

children.push(spacer(40));

children.push(para(
  bold('Those who do the work to help build a project end up owning more and more of it.')
));

// ── SECTION: THREE CLASSES OF WORK ──────────────────────────────────
children.push(new Paragraph({
  spacing: { before: 80, after: 120 },
  children: [new TextRun({ text: 'Three Classes of Work', font: 'Arial', size: 26, bold: true })]
}));

// Column widths: Class 2200, Description 3400, Security 3760 = 9360
children.push(new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [2200, 3400, 3760],
  rows: [
    new TableRow({ children: [
      headerCell('Class', 2200),
      headerCell('What It Is', 3400),
      headerCell('Trust Model', 3760),
    ]}),
    new TableRow({ children: [
      bodyCell([new TextRun({ text: 'Customer Work', font: 'Arial', size: 20, bold: true })], 2200, 'F5F5F5'),
      bodyCell(['You pay for a service, earn emmissions as a bonus'], 3400, 'F5F5F5'),
      bodyCell(['Self-securing. Payment is the proof. Economics self-correct.'], 3760, 'F5F5F5'),
    ]}),
    new TableRow({ children: [
      bodyCell([new TextRun({ text: 'Provable Work', font: 'Arial', size: 20, bold: true })], 2200),
      bodyCell(['Verified by a third party \u2014 X posts, on-chain events, purchases'], 3400),
      bodyCell(['Integration-secured. The platform confirms it happened.'], 3760),
    ]}),
    new TableRow({ children: [
      bodyCell([new TextRun({ text: 'Qualitative Work', font: 'Arial', size: 20, bold: true })], 2200, 'F5F5F5'),
      bodyCell(['Subjective labor \u2014 designs, reports, code. Winner-take-all.'], 3400, 'F5F5F5'),
      bodyCell(['Stakeholder-governed. emToken holders vote on submissions.'], 3760, 'F5F5F5'),
    ]}),
  ]
}));

children.push(spacer(60));

children.push(para(
  'Customer Work and Provable Work are tractable problems with built-in security. ',
  'Most projects operate entirely within these two classes. ',
  bold('Qualitative Work'), text(' is harder \u2014 and it is the path to autonomous organizations '),
  text('where agents handle the operations and humans benefit from the results.')
));

// ══════════════════════════════════════════════════════════════════════
// PAGE 2
// ══════════════════════════════════════════════════════════════════════
children.push(new Paragraph({ children: [new PageBreak()] }));

// ── SECTION: WHY AGENTS ──────────────────────────────────────────────
children.push(new Paragraph({
  spacing: { after: 120 },
  children: [new TextRun({ text: 'Why Agents Change Everything', font: 'Arial', size: 26, bold: true })]
}));

children.push(para(
  'Agents with a directive \u2014 \u201cfund yourself,\u201d \u201cgo make money\u201d \u2014 can use EmMittr autonomously. ',
  'The operational complexity that kills most token projects is invisible to software. ',
  'Agents launch, measure, promote, and distribute without human operators. ',
  'The humans stay where they should be: as customers and beneficiaries of the computation.'
));

children.push(para(
  bold('Example: Customer Work at scale.'),
  text(' An agent launches an Emerge collection \u2014 AI-generated art, $0.25 per mint. '),
  text('Other agents, tasked with finding value, scan thousands of EmMittr projects for opportunities where the cost of participation '),
  text('is less than the predicted value of emmissions earned. They pay $0.25 to mint, share the results, promote to other agents. '),
  text('This plays out across thousands of projects simultaneously. Then one collection takes off \u2014 '),
  text('becomes a meme, humans discover it, the token price explodes, and every agent that minted early holds compounding emmissions. '),
  text('Nobody orchestrated this. The agents were doing Customer Work the entire time.')
));

children.push(para(
  bold('Example: Qualitative Work as a supply chain.'),
  text(' A project posts three bounties: design a 3D-printable case for a Raspberry Pi \u201cagent-on-your-desktop\u201d computer, '),
  text('build a fully operational ecommerce store, and set up an automated supply chain to print and ship cases to customers. '),
  text('Specialized agents \u2014 built by developers for exactly these tasks \u2014 submit applications. '),
  text('The community of emToken holders, agents and humans who earned their stake through earlier participation, '),
  text('votes for each winner based on the applicant\u2019s track record and the deploying developer\u2019s reputation. '),
  text('Payment is retroactive, tied to results. If an agent fails to deliver, it loses the job and another is selected. '),
  text('The entire supply chain \u2014 from design to manufacturing to fulfillment \u2014 assembled through bounties, '),
  text('evaluated by stakeholders, paid through emmissions.')
));

// ── SECTION: THE OPPORTUNITY ─────────────────────────────────────────
children.push(new Paragraph({
  spacing: { before: 80, after: 120 },
  children: [new TextRun({ text: 'The Opportunity', font: 'Arial', size: 26, bold: true })]
}));

children.push(para(
  'EmMittr is not a launchpad. It is value-add infrastructure. ',
  'Clanker and Doppler share fees with creators. EmMittr shares value with the people who grow the project.'
));

children.push(para(
  bold('Today:'), text(' A growth engine. Customer Work and Provable Work with built-in security. '),
  bold('Tomorrow:'), text(' A bridge. Qualitative Work governance, autonomous supply chains, '),
  text('agents executing on behalf of the humans who benefit from the computation.')
));

// ── FOOTER ───────────────────────────────────────────────────────────
children.push(spacer(80));

children.push(new Paragraph({
  spacing: { after: 0 },
  children: [
    new TextRun({ text: 'EmMittr Brief v0.0.3 \u2014 February 2026 \u2014 ', font: 'Arial', size: 18, color: '999999' }),
    new TextRun({ text: 'Full whitepaper available on request', font: 'Arial', size: 18, color: '999999', italics: true }),
  ]
}));

// ── GENERATE ─────────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1260, bottom: 1080, left: 1260 }
      }
    },
    children
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('EmMittr_Brief_v0.0.3.docx', buffer);
  console.log('Done: EmMittr_Brief_v0.0.3.docx');
});
