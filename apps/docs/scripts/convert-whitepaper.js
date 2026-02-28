#!/usr/bin/env node
// Converts the pandoc-exported whitepaper markdown into clean VitePress section files.
// Run: node scripts/convert-whitepaper.js

const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(path.join(__dirname, '..', 'whitepaper_raw.md'), 'utf8');

// Clean up pandoc artifacts
let cleaned = raw
  .replace(/\\?\$/g, '$')       // unescape dollars
  .replace(/ --- /g, ' — ')    // em dashes
  .replace(/---/g, '—')        // remaining em dashes
  .replace(/\\\$/g, '$');       // any remaining escaped dollars

// Define section boundaries by line patterns
const sections = [
  { id: 'index', title: 'Overview', startLine: '**EmMittr**', endBefore: '**The Agentic Economy**' },
  { id: 'agentic-economy', title: 'The Agentic Economy', startLine: '**The Agentic Economy**', endBefore: '**Executive Summary**' },
  { id: 'executive-summary', title: 'Executive Summary', startLine: '**Executive Summary**', endBefore: '**Part I: The Opportunity**' },
  { id: 'part-1-opportunity', title: 'Part I: The Opportunity', startLine: '**Part I: The Opportunity**', endBefore: '**Part II: The EmMittr Model**' },
  { id: 'part-2-model', title: 'Part II: The EmMittr Model', startLine: '**Part II: The EmMittr Model**', endBefore: '**Part III: Work' },
  { id: 'part-3-work', title: 'Part III: Work — Three Classes', startLine: '**Part III: Work', endBefore: '**Part IV:' },
  { id: 'part-4-implementation', title: 'Part IV: Implementation', startLine: '**Part IV:', endBefore: '**Part V:' },
  { id: 'part-5-use-cases', title: 'Part V: Use Cases', startLine: '**Part V:', endBefore: '**Part VI:' },
  { id: 'part-6-agents', title: 'Part VI: Why Agents Change Everything', startLine: '**Part VI:', endBefore: '**Part VII:' },
  { id: 'part-7-competitive', title: 'Part VII: Competitive Landscape', startLine: '**Part VII:', endBefore: '**Part VIII:' },
  { id: 'part-8-risks', title: 'Part VIII: Risks and Mitigations', startLine: '**Part VIII:', endBefore: '**Part IX:' },
  { id: 'part-9-roadmap', title: 'Part IX: Roadmap', startLine: '**Part IX:', endBefore: '**Conclusion**' },
  { id: 'conclusion', title: 'Conclusion', startLine: '**Conclusion**', endBefore: '**Appendix A:' },
  { id: 'glossary', title: 'Glossary', startLine: '**Appendix A:', endBefore: null },
];

const lines = cleaned.split('\n');

function findLineIndex(pattern, startFrom = 0) {
  for (let i = startFrom; i < lines.length; i++) {
    if (lines[i].startsWith(pattern)) return i;
  }
  return -1;
}

const outDir = path.join(__dirname, '..', 'content', 'whitepaper');
fs.mkdirSync(outDir, { recursive: true });

for (const sec of sections) {
  const startIdx = findLineIndex(sec.startLine);
  const endIdx = sec.endBefore ? findLineIndex(sec.endBefore, startIdx + 1) : lines.length;
  
  if (startIdx === -1) {
    console.warn(`Section "${sec.title}" not found (looking for "${sec.startLine}")`);
    continue;
  }

  let content = lines.slice(startIdx, endIdx).join('\n').trim();
  
  // Convert bold-only lines to markdown headers
  // **Title** on its own line → ## Title
  content = content.replace(/^(\*\*([^*]+)\*\*)\s*$/gm, (match, full, inner) => {
    // Top-level section titles become ## 
    // Sub-sections become ###
    if (inner.startsWith('Part ') || inner === sec.title || inner.startsWith('Appendix') || 
        inner === 'Executive Summary' || inner === 'Conclusion' || inner === 'The Agentic Economy' ||
        inner === 'Scale the Pattern' || inner.startsWith('What is')) {
      return `## ${inner}`;
    }
    return `### ${inner}`;
  });

  // Add frontmatter
  const frontmatter = `---
title: "${sec.title}"
---

`;

  const outPath = path.join(outDir, `${sec.id}.md`);
  fs.writeFileSync(outPath, frontmatter + content + '\n');
  console.log(`  ${sec.id}.md (${content.split('\n').length} lines)`);
}

console.log('\nDone. Review and clean up tables manually if needed.');
