# EmMittr Docs

Documentation site and document generator for EmMittr — a growth engine for token economies and a bridge to a decentralized agentic future.

## Structure

```
emmittr-docs/
  content/                    ← VitePress source (markdown = source of truth)
    index.md                  ← Landing page
    changelog.md              ← Version history
    brief/
      index.md                ← 2-page brief (v0.0.3)
    whitepaper/
      index.md                ← Overview / cold open
      agentic-economy.md      ← Scenarios A & B
      executive-summary.md
      part-1-opportunity.md
      part-2-model.md         ← Flywheel, emmissions, decay curve, fees
      part-3-work.md          ← Three classes, hard problems, tiers
      part-4-implementation.md
      part-5-use-cases.md
      part-6-agents.md
      part-7-competitive.md
      part-8-risks.md
      part-9-roadmap.md       ← Phases 1-4 including Qualitative Work governance
      conclusion.md
      glossary.md
    .vitepress/
      config.mts              ← Site config, nav, sidebar
  scripts/
    build-brief.js            ← Generates Brief docx from markdown source
    build-whitepaper.js       ← Whitepaper docx build (TODO: migrate from legacy)
    emmittr_whitepaper_v6.js  ← Legacy whitepaper generator (inline content)
    emmittr_brief_legacy.js   ← Legacy brief generator (inline content)
    convert-whitepaper.js     ← One-time pandoc→markdown conversion
  dist/                       ← Generated docx files (gitignored)
  CHANGELOG-whitepaper.md     ← Full whitepaper version history (v0.0.1 → v0.0.16)
  CHANGELOG-brief.md          ← Brief version history (v0.0.0 → v0.0.3)
```

## Quick Start

```bash
npm install

# Dev server (VitePress)
npm run dev

# Build docx files
npm run build:brief          # → dist/EmMittr_Brief_v0.0.3.docx
npm run build:whitepaper     # → uses legacy generator (see TODO)

# Build static site
npm run build                # → content/.vitepress/dist/
```

## How It Works

**Markdown is the source of truth.** All content lives in `content/` as standard markdown files. VitePress renders them as a website. Build scripts read them and generate formatted `.docx` files for distribution.

**Version bumps:** Update the `version` field in the markdown frontmatter, then rebuild.

**Brief workflow:**
1. Edit `content/brief/index.md`
2. Bump `version` in frontmatter
3. `npm run build:brief`
4. Commit

**Whitepaper workflow (current):**
1. Edit `content/whitepaper/*.md` for web content
2. For docx, edit `scripts/emmittr_whitepaper_v6.js` (legacy)
3. `node scripts/emmittr_whitepaper_v6.js`
4. Commit

## Migration Status

| Component | Source of Truth | Docx Build |
|-----------|----------------|------------|
| Brief | `content/brief/index.md` ✅ | Reads from markdown ✅ |
| Whitepaper | `content/whitepaper/*.md` ✅ | Legacy generator ⚠️ |

The whitepaper docx build still uses the legacy `emmittr_whitepaper_v6.js` generator with inline content. Migrating this to read from markdown is a TODO — the markdown files are already the authoritative source for the web version.

## Key Decisions

See changelogs for full history. Highlights:

- **"Growth engine + agentic bridge"** positioning replaced "Work → Emmitt → Earn" (v0.0.15)
- **Three Work classes** — Customer, Provable, Qualitative (v0.0.14)
- **Agents execute on behalf of humans** — not "no human in the loop" (Brief v0.0.3)
- **emmissions** = staking derivatives, NOT dual staking
