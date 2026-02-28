---
title: "Version History"
---

# Version History

## Current Versions

| Document | Version | Date | Status |
|----------|---------|------|--------|
| [Capacitr Brief](/brief/) | v0.1.0 | February 2026 | Current |
| [EmMittr Whitepaper](/whitepaper/) | v0.0.20 | February 2026 | Current |

## Archived Versions

Full snapshots of previous document versions, preserved for reference and comparison.

### Whitepaper

| Version | Date | Brand | Key Changes |
|---------|------|-------|-------------|
| [v0.0.16](/versions/whitepaper/v0-0-16) | 2026-02-22 | EmMittr | Phase 4: Qualitative Work Governance added to roadmap |

::: info
Versions v0.0.3 through v0.0.15 and v0.0.17 through v0.0.19 are documented in the [whitepaper changelog](/versions/whitepaper-changelog) but do not have full content snapshots. Future versions will be snapshotted automatically.
:::

### Brief

| Version | Date | Brand | Key Changes |
|---------|------|-------|-------------|
| [v0.0.3](/versions/brief/v0-0-3) | 2026-02-23 | EmMittr | Final EmMittr-branded brief before Capacitr pivot |

## Version Policy

Each major content revision is snapshotted as a single-page markdown file under `/versions/`. This allows:

- **Full content per version** — every snapshot is a complete, readable document
- **Diffing** — `git diff` between version snapshot files shows exact content changes
- **Branching** — any version can be used as a starting point for a new direction

See the changelogs for detailed change descriptions:
- [Whitepaper Changelog](/versions/whitepaper-changelog) — v0.0.3 through v0.0.20
- [Brief Changelog](/versions/brief-changelog) — v0.0.0 through v0.1.0

## Snapshot Convention

When creating a new version:

```bash
# Snapshot current content before modifying
npm run snapshot -- whitepaper 0.0.20
npm run snapshot -- brief 0.1.0
```

This concatenates all markdown files for the document into a single-page archive at `content/versions/<document>/v<version>.md`.
