---
title: "Version History"
---

# Version History

## Current Versions

| Document | Version | Date | Status |
|----------|---------|------|--------|
| [Capacitr Brief](/brief/) | v0.1.0 | February 2026 | Current |
| [EmMittr Whitepaper](/whitepaper/) | v0.0.20 | February 2026 | Current |

## Whitepaper Versions

| Version | Date | Summary | Content |
|---------|------|---------|---------|
| [v0.0.20](/versions/whitepaper/v0-0-20) | 2026-02-25 | EmMittr Ventures + Reflexive Investment + Q&A Overhaul | Full |
| [v0.0.19](/versions/whitepaper/v0-0-19) | 2026-02-25 | The Reflexive Signal + Payout Mechanics | Full |
| [v0.0.18](/versions/whitepaper/v0-0-18) | 2026-02-25 | Proof of Good Judgement refined, Circuit Types | Summary |
| [v0.0.17](/versions/whitepaper/v0-0-17) | 2026-02-24 | Part VII: Proof of Good Judgement — deliberation protocol | Summary |
| [v0.0.16](/versions/whitepaper/v0-0-16) | 2026-02-22 | Phase 4: Qualitative Work Governance | Full |
| [v0.0.15](/versions/whitepaper/v0-0-15) | 2026-02-18 | "Growth engine" + "agentic bridge" positioning | Full |
| [v0.0.14](/versions/whitepaper/v0-0-14) | 2026-02-18 | Three Work classes with Problem/Acceptable structure | Full |
| [v0.0.13](/versions/whitepaper/v0-0-13) | 2026-02-12 | "The Hard Problems" section + emWork SDK branding | Full |
| [v0.0.12](/versions/whitepaper/v0-0-12) | 2026-02-12 | Two-stage lockup: 14-day minting + 7-day LP redemption | Full |
| [v0.0.11](/versions/whitepaper/v0-0-11) | 2026-02-12 | Auto-compounding emmission pool | Full |
| [v0.0.10](/versions/whitepaper/v0-0-10) | 2026-02-12 | Framing rewrite: "unbury the lead" | Full |
| [v0.0.9](/versions/whitepaper/v0-0-9) | 2026-02-11 | Cold open split into Scenario A + Scenario B | Full |
| [v0.0.8](/versions/whitepaper/v0-0-8) | 2026-02-11 | Cold open: Agent-to-agent economy scenario | Full |
| [v0.0.7](/versions/whitepaper/v0-0-7) | 2026-02-11 | Framing: Value-add, not cheaper alternative | Full |
| [v0.0.6](/versions/whitepaper/v0-0-6) | 2026-02-11 | Three-tier value ladder + agent centerpiece | Full |
| [v0.0.5](/versions/whitepaper/v0-0-5) | 2026-02-11 | SDK reframe + agent positioning | Full |
| [v0.0.4](/versions/whitepaper/v0-0-4) | 2026-02-11 | Terminology corrections | Full |
| [v0.0.3](/versions/whitepaper/v0-0-3) | 2026-02-11 | First complete whitepaper draft | Summary |

## Brief Versions

| Version | Date | Summary | Content |
|---------|------|---------|---------|
| [v0.1.0](/brief/) | February 2026 | Capacitr Brief — governance-first positioning | Current |
| [v0.0.3](/versions/brief/v0-0-3) | 2026-02-23 | Final EmMittr-branded brief | Full |

## Snapshot Convention

When creating a new version:

```bash
# Snapshot current content before modifying
npm run snapshot -- whitepaper 0.0.20
npm run snapshot -- brief 0.1.0
```

This concatenates all markdown files for the document into a single-page archive at `content/versions/<document>/v<version>.md`.
