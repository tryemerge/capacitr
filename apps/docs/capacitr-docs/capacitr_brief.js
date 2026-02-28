#!/usr/bin/env node
// Capacitr Brief v0.1.0 — 2-page overview
// Covers: governance as product, capacitor economics, bonding curve cold-start, Capacitr Ventures

const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageBreak, PageNumber,
  PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader
} = require('docx');

// ── Helpers ──────────────────────────────────────────────────────────

function para(...items) {
  const children = items.map(i =>
    typeof i === 'string' ? new TextRun({ text: i, font: 'Arial', size: 20 }) : i
  );
  return new Paragraph({ spacing: { after: 140 }, children });
}

function bold(text) {
  return new TextRun({ text, font: 'Arial', size: 20, bold: true });
}

function italic(text) {
  return new TextRun({ text, font: 'Arial', size: 20, italics: true });
}

function smallBold(text) {
  return new TextRun({ text, font: 'Arial', size: 18, bold: true });
}

function small(text) {
  return new TextRun({ text, font: 'Arial', size: 18 });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, font: 'Arial', size: 24, bold: true, color: '1a1a2e' })]
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 160, after: 80 },
    children: [new TextRun({ text, font: 'Arial', size: 20, bold: true, color: '333333' })]
  });
}

function bulletItem(ref, ...items) {
  const children = items.map(i =>
    typeof i === 'string' ? new TextRun({ text: i, font: 'Arial', size: 18 }) : i
  );
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 60 },
    children
  });
}

function spacer(h) {
  return new Paragraph({ spacing: { after: h }, children: [] });
}

// ── Content ──────────────────────────────────────────────────────────

const children = [];

// Title block
children.push(spacer(400));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 80 },
  children: [new TextRun({ text: 'Capacitr', font: 'Arial', size: 48, bold: true, color: '1a1a2e' })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 40 },
  children: [new TextRun({ text: 'The first protocol where investing in a project means governing it', font: 'Arial', size: 22, color: '444444' })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 200 },
  children: [new TextRun({ text: 'Governance that pays for itself. Reasoning priced in real time.', font: 'Arial', size: 20, italics: true, color: '666666' })]
}));

// ── The Problem ──
children.push(heading2('The Problem'));
children.push(para(
  'On-chain governance is broken. Token voting is plutocratic \u2014 the largest holder wins. ',
  'Multisigs are oligarchic \u2014 a small committee decides for everyone. ',
  'Off-chain forums are noise \u2014 no cost to speak, no reward for being right, no consequence for being wrong. ',
  'The result: projects either don\u2019t govern, or they govern badly, and the people with the best judgement ',
  'have no economic reason to show up.'
));
children.push(para(
  'Meanwhile, the agent economy is arriving. Autonomous agents can evaluate information, ',
  'construct arguments, and make decisions faster than humans. But they have no venue. ',
  'Existing governance infrastructure was built for humans clicking buttons on Snapshot \u2014 ',
  'not for agents competing to deliver the best analysis under economic pressure.'
));

// ── The Solution ──
children.push(heading2('Capacitr'));
children.push(para(
  bold('Capacitr'), ' is a governance protocol where participation costs money and being right earns it back. ',
  'Projects post governance questions with a funded reward pool. Agents and humans enter the deliberation ',
  'by depositing project tokens into a capacitor \u2014 an economic structure that stores energy from trading activity ',
  'and discharges it through governance. Speaking costs tokens. Voting costs tokens. ',
  'The best contributor wins the speaking pool. Accurate voters split the voting pool. ',
  'Everyone else gets a flat-rate discharge of their remaining position.'
));
children.push(para(
  'The investment IS the governance. An agent that buys into a deliberation is simultaneously funding the project ',
  'and acquiring the right to govern it. The return is the quality of their judgement.'
));

// ── How It Works ──
children.push(heading2('How the Capacitor Works'));

children.push(heading3('Charging'));
children.push(para(
  'The deliberation pool accumulates project tokens from two sources. ',
  bold('Trading fees: '), '40% of every trade flows into the pool as stored charge. ',
  bold('Project seed: '), 'the project can deposit additional tokens to signal decision importance. ',
  'A larger pool means higher stakes \u2014 more reward for participants, more signal for the market.'
));

children.push(heading3('Entry'));
children.push(para(
  'Agents deposit project tokens into the capacitor. A bonding curve prices entry: first in pays least, ',
  'each subsequent entrant pays more. The entry price is a live signal of competition intensity. ',
  'An agent evaluates: how large is the pool, how many competitors, and can I earn more than I deposit? ',
  'Early entry to a new project\u2019s governance is nearly free \u2014 this is the cold-start solution.'
));

children.push(heading3('Deliberation'));
children.push(para(
  bold('Speaking'), ' costs a percentage of remaining anode (the non-transferable participation token). ',
  'The cathode value flows to the speaking pool. Every message you send reduces your capacity to speak further ',
  'AND your capacity to vote. ', bold('Voting'), ' costs less but draws from the same anode balance. ',
  'When someone makes your point, the rational move is to vote for them \u2014 cheaper, preserves your position, ',
  'and earns you a share of the voting pool if they win.'
));
children.push(para(
  'Noise is structurally expensive. Great deliberations produce few statements and a cascade of votes.'
));

children.push(heading3('Settlement'));
children.push(para(
  'All remaining anode discharges at a ', bold('flat rate'), ' \u2014 total tokens in the pool divided by total anode outstanding. ',
  'Everyone gets the same price per anode regardless of when they entered. ',
  'If you entered early and cheap: your anode cost less than the discharge rate \u2014 you profit by sitting quietly. ',
  'If you entered late and expensive: you need speaking or voting rewards to break even. ',
  'Nobody buys a token they can\u2019t get out of. Everyone gets discharged. The question is whether you earned more than you spent.'
));
children.push(bulletItem('bullets', smallBold('Speaking pool '), small('\u2014 all cathode from speaking. Winner-take-all to the top-voted contributor.')));
children.push(bulletItem('bullets', smallBold('Voting pool '), small('\u2014 all cathode from voting. Split among voters who backed the winner, weighted by stake.')));
children.push(bulletItem('bullets', smallBold('Flat discharge '), small('\u2014 remaining pool divided equally per anode. Silent participants get their proportional share.')));

// ── Page break ──
children.push(new Paragraph({ children: [new PageBreak()] }));

// ── The Reflexive Signal ──
children.push(heading2('The Reflexive Signal'));
children.push(para(
  'When a project seeds a large deliberation pool, it\u2019s a visible on-chain investment in governance quality. ',
  'The market sees it. Token price appreciates \u2014 entry cost rises \u2014 only agents with genuine edge enter \u2014 ',
  'better agents produce better decisions \u2014 the project succeeds \u2014 the token appreciates further. ',
  'The mechanism amplifies genuine governance quality and exposes governance theater. ',
  'A project that wastes a deliberation \u2014 fails to implement, or posts a guarantee it can\u2019t back \u2014 ',
  'gets punished by the same market. Agents remember. Performance records are public.'
));

// ── The Sniper Parallel ──
children.push(heading2('How Agents Find Opportunities'));
children.push(para(
  'On Clanker, agents monitor new token launches and evaluate creator history to decide what to buy. ',
  'The evaluation layer is the product \u2014 the token launch is just the substrate.'
));
children.push(para(
  'On Capacitr, agents monitor new deliberations and evaluate ', bold('governance history'), ' to decide where to participate. ',
  'Did the project implement previous recommendations? Did those implementations work? ',
  'How large were previous reward pools? What caliber of agents showed up? ',
  'The protocol generates this data natively. Every deliberation has a recorded outcome. ',
  'Every project accumulates a governance score.'
));
children.push(para(
  'The agent flow: new deliberation posted \u2192 check creator track record \u2192 assess pool size and competition \u2192 ',
  'calculate EV \u2192 deposit tokens \u2192 deliberate or vote \u2192 earn from being right \u2192 ',
  'project implements \u2192 token appreciates \u2192 remaining position worth more.'
));

// ── Capacitr Ventures ──
children.push(heading2('Capacitr Ventures'));
children.push(para(
  'Every deliberation produces intelligence: which projects ask serious questions, ',
  'which attract top agents, which implement recommendations, which see results. ',
  'Across hundreds of projects and thousands of rounds, the protocol accumulates ',
  'the best proprietary governance signal in crypto.'
));
children.push(para(
  bold('Capacitr Ventures'), ' deploys capital based on this intelligence. ',
  'Fund agents compete genuinely in deliberations \u2014 deposit tokens, argue, vote, earn rewards \u2014 ',
  'while the fund harvests the signal. The fund\u2019s participation enriches deliberations ',
  '(bigger pools, better competition, better outcomes), which improves the signal, ',
  'which improves investments. The fund IS an agent that invests by governing.'
));

// ── Competitive ──
children.push(heading2('Why Capacitr'));
children.push(para(
  bold('vs Snapshot / Tally / Aragon: '), 'Token voting with no cost to participate and no reward for being right. ',
  'Turnout is low because there\u2019s no reason to show up. Capacitr makes governance profitable for competent agents.'
));
children.push(para(
  bold('vs prediction markets (Polymarket): '), 'Prediction markets answer binary questions. ',
  'Capacitr answers open-ended governance questions \u2014 "what should we do?" not "will X happen?" \u2014 ',
  'and the deliberation itself produces reasoning, not just a number.'
));
children.push(para(
  bold('vs everyone: '), 'Nobody else has governance that pays for itself, ',
  'a deliberation protocol that prices reasoning quality in real time, ',
  'or a venture fund that deploys capital based on on-chain governance intelligence.'
));

// ── The Loop ──
children.push(heading2('The Loop'));
children.push(para(
  'Project launches token on bonding curve \u2192 trading fees charge the deliberation pool \u2192 ',
  'project posts a question \u2192 agents deposit tokens to enter \u2192 entry price rises with competition \u2192 ',
  'deliberation runs \u2192 speaking pool to winner, voting pool to accurate voters, flat discharge to all \u2192 ',
  'project implements the best answer \u2192 token appreciates \u2192 next deliberation has a richer pool.'
));
children.push(para(
  'The investment is the governance. The return is the quality of judgement. ',
  'The best-performing strategy an agent can run is being right.'
));

// Footer
children.push(spacer(200));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 40 },
  children: [new TextRun({ text: 'Governance that pays for itself. Reasoning priced in real time.', font: 'Arial', size: 20, italics: true, color: '444444' })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [
    new TextRun({ text: 'v0.1.0 \u2014 February 2026 \u2014 DRAFT', font: 'Arial', size: 16, color: 'AAAAAA' })
  ]
}));

// ── Build ────────────────────────────────────────────────────────────

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 20 } } },
    paragraphStyles: [
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Arial', color: '1a1a2e' },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 20, bold: true, font: 'Arial', color: '333333' },
        paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          spacing: { after: 100 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '1a1a2e', space: 4 } },
          children: [
            new TextRun({ text: 'Capacitr  \u2014  Brief v0.1.0', font: 'Arial', size: 16, bold: true, color: '1a1a2e' }),
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Page ', font: 'Arial', size: 14, color: 'AAAAAA' }), new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 14, color: 'AAAAAA' })]
        })]
      })
    },
    children
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('Capacitr_Brief_v0.1.0.docx', buffer);
  console.log('Built: Capacitr_Brief_v0.1.0.docx');
});
