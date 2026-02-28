#!/usr/bin/env node
// Builds EmMittr_Whitepaper.docx from content/whitepaper/*.md
// Run: npm run build:whitepaper
//
// This is a scaffold. The full whitepaper build should eventually parse
// all markdown features (lists, nested bold/italic, etc). For now it
// wraps the existing emmittr_whitepaper_v6.js generator.
//
// TODO: Migrate to markdown-source build once content is stable.

const fs = require('fs');
const path = require('path');

// For now, use the existing generator script directly.
// The markdown files are the readable/editable source, but the docx
// generation still uses the battle-tested v6 generator.
//
// To build: copy emmittr_whitepaper_v6.js logic here, reading from
// the markdown files instead of inline strings.

console.log('Whitepaper build: using legacy generator (scripts/emmittr_whitepaper_v6.js)');
console.log('Run: node scripts/emmittr_whitepaper_v6.js');
console.log('');
console.log('TODO: Migrate to markdown-source build.');
console.log('The content/whitepaper/*.md files are the source of truth for reading.');
console.log('The legacy generator is the source of truth for docx formatting until migration.');
