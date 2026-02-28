#!/usr/bin/env node
// Builds EmMittr_Brief.docx from content/brief/index.md
// Run: npm run build:brief

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { Document, Packer, Paragraph, TextRun, PageBreak,
        AlignmentType, BorderStyle, WidthType,
        Table, TableRow, TableCell, ShadingType } = require('docx');

// ── Read source ──────────────────────────────────────────────────────
const srcPath = path.join(__dirname, '..', 'content', 'brief', 'index.md');
const { data: meta, content } = matter(fs.readFileSync(srcPath, 'utf8'));
const version = meta.version || '0.0.0';

// ── Helpers ──────────────────────────────────────────────────────────
const bold = (t) => new TextRun({ text: t, bold: true, font: 'Arial', size: 22 });
const text = (t) => new TextRun({ text: t, font: 'Arial', size: 22 });

function para(...runs) {
  const children = runs.map(r => typeof r === 'string' ? text(r) : r);
  return new Paragraph({ spacing: { after: 140, line: 264 }, children });
}

function spacer(after = 100) {
  return new Paragraph({ spacing: { after }, children: [] });
}

function sectionHeader(t) {
  return new Paragraph({
    spacing: { before: 80, after: 120 },
    children: [new TextRun({ text: t, font: 'Arial', size: 26, bold: true })]
  });
}

// ── Table helpers ────────────────────────────────────────────────────
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

function bodyCell(t, width, fill) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: t, font: 'Arial', size: 20 })] })]
  });
}

// ── Parse markdown into blocks ───────────────────────────────────────
// Simple parser that converts our specific markdown structure into docx elements.
// Not a general-purpose markdown→docx converter — tuned for the brief format.

function parseInlineRuns(line) {
  // Parse **bold** and regular text into TextRun array
  const runs = [];
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(bold(part.slice(2, -2)));
    } else if (part) {
      runs.push(text(part));
    }
  }
  return runs;
}

function parseMarkdownTable(tableLines) {
  // Parse pipe-delimited markdown table
  const rows = tableLines
    .filter(l => !l.match(/^\|[\s-|]+\|$/))  // skip separator rows
    .map(l => l.split('|').slice(1, -1).map(c => c.trim()));
  return rows;
}

function buildContent() {
  const children = [];
  const lines = content.split('\n');
  
  // ── Title block ──────────────────────────────────────────────────
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

  // ── Process sections ─────────────────────────────────────────────
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Skip the title lines (# EmMittr and the two italic taglines) — already handled above
    if (line === '# EmMittr' || line === '*A growth engine for token economies.*' || 
        line === '*A bridge to a decentralized agentic future.*') {
      i++; continue;
    }

    // Section headers
    if (line.startsWith('## ')) {
      children.push(sectionHeader(line.slice(3)));
      i++; continue;
    }

    // Tables
    if (line.startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const rows = parseMarkdownTable(tableLines);
      if (rows.length >= 2) {
        const numCols = rows[0].length;
        const colWidth = Math.floor(9360 / numCols);
        const colWidths = Array(numCols).fill(colWidth);
        // Adjust last column to absorb rounding
        colWidths[numCols - 1] = 9360 - colWidth * (numCols - 1);

        const tableRows = rows.map((row, rowIdx) => {
          const cells = row.map((cell, colIdx) => {
            const w = colWidths[colIdx];
            const cellText = cell.replace(/\*\*/g, ''); // strip bold markers for table cells
            if (rowIdx === 0) return headerCell(cellText, w);
            return bodyCell(cellText, w, rowIdx % 2 === 1 ? 'F5F5F5' : undefined);
          });
          return new TableRow({ children: cells });
        });

        children.push(new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: colWidths,
          rows: tableRows,
        }));
        children.push(spacer(40));
      }
      continue;
    }

    // Empty lines
    if (!line) { i++; continue; }

    // Regular paragraphs
    children.push(para(...parseInlineRuns(line)));
    i++;
  }

  // ── Footer ─────────────────────────────────────────────────────
  children.push(spacer(80));
  children.push(new Paragraph({
    spacing: { after: 0 },
    children: [
      new TextRun({ text: `EmMittr Brief v${version} \u2014 February 2026 \u2014 `, font: 'Arial', size: 18, color: '999999' }),
      new TextRun({ text: 'Full whitepaper available on request', font: 'Arial', size: 18, color: '999999', italics: true }),
    ]
  }));

  return children;
}

// ── Generate ─────────────────────────────────────────────────────────
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
    children: buildContent()
  }]
});

const distDir = path.join(__dirname, '..', 'dist');
fs.mkdirSync(distDir, { recursive: true });
const outPath = path.join(distDir, `EmMittr_Brief_v${version}.docx`);

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log(`Built: dist/EmMittr_Brief_v${version}.docx`);
});
