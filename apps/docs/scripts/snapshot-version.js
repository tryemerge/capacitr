#!/usr/bin/env node

/**
 * snapshot-version.js
 *
 * Creates a single-page version snapshot of a document (whitepaper or brief)
 * by concatenating all markdown files in reading order.
 *
 * Usage:
 *   node scripts/snapshot-version.js <document> <version>
 *
 * Examples:
 *   node scripts/snapshot-version.js whitepaper 0.0.20
 *   node scripts/snapshot-version.js brief 0.1.0
 *
 * Output:
 *   content/versions/<document>/v<version-with-dashes>.md
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'content');

// Reading order for each document type
const WHITEPAPER_ORDER = [
  'whitepaper/index.md',
  'whitepaper/agentic-economy.md',
  'whitepaper/executive-summary.md',
  'whitepaper/part-1-opportunity.md',
  'whitepaper/part-2-model.md',
  'whitepaper/part-3-work.md',
  'whitepaper/part-4-implementation.md',
  'whitepaper/part-5-use-cases.md',
  'whitepaper/part-6-agents.md',
  'whitepaper/part-7-proof-of-good-judgement.md',
  'whitepaper/part-8-competitive.md',
  'whitepaper/part-9-questions-and-risks.md',
  'whitepaper/part-10-roadmap.md',
  'whitepaper/conclusion.md',
  'whitepaper/glossary.md',
  'whitepaper/appendix-b-investor-questions.md',
];

const BRIEF_ORDER = [
  'brief/index.md',
];

const ORDERS = {
  whitepaper: WHITEPAPER_ORDER,
  brief: BRIEF_ORDER,
};

function main() {
  const [,, docType, version] = process.argv;

  if (!docType || !version) {
    console.error('Usage: node scripts/snapshot-version.js <document> <version>');
    console.error('  document: whitepaper | brief');
    console.error('  version: e.g., 0.0.20 or 0.1.0');
    process.exit(1);
  }

  const order = ORDERS[docType];
  if (!order) {
    console.error(`Unknown document type: ${docType}. Use "whitepaper" or "brief".`);
    process.exit(1);
  }

  const slug = `v${version.replace(/\./g, '-')}`;
  const outDir = join(CONTENT, 'versions', docType);
  const outPath = join(outDir, `${slug}.md`);

  mkdirSync(outDir, { recursive: true });

  // Determine document title from the first file
  const firstFile = join(CONTENT, order[0]);
  const firstContent = readFileSync(firstFile, 'utf-8');
  const { data: firstMatter } = matter(firstContent);
  const docTitle = docType === 'whitepaper'
    ? `EmMittr Whitepaper v${version}`
    : `Capacitr Brief v${version}`;

  // Concatenate all files
  const sections = [];
  for (const relPath of order) {
    const filePath = join(CONTENT, relPath);
    if (!existsSync(filePath)) {
      console.warn(`  Warning: ${relPath} not found, skipping`);
      continue;
    }
    const raw = readFileSync(filePath, 'utf-8');
    const { content } = matter(raw);
    sections.push(content.trim());
  }

  const today = new Date().toISOString().split('T')[0];

  const output = `---
title: "${docTitle}"
version: "${version}"
date: "${today}"
document: ${docType}
---

# ${docTitle}

::: info Archive
This is an archived snapshot of the ${docType === 'whitepaper' ? 'EmMittr Whitepaper' : 'Capacitr Brief'} at version ${version}. For the current version, see the [latest ${docType}](/${docType}/).
:::

---

${sections.join('\n\n---\n\n')}
`;

  writeFileSync(outPath, output);
  console.log(`Snapshot created: ${outPath}`);
}

main();
