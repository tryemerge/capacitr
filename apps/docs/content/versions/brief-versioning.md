---
title: "Brief Versioning Model"
---

# Brief Versioning Model

This project supports branching brief development with traceable lineage and multiple canonical tracks.

## Goals

- Allow parallel brief options for different audiences (for example `X`, `V`, `A/B/C`)
- Preserve clear ancestry between revisions
- Support deep branch paths without losing readability
- Keep archived snapshots immutable

## Version ID Structure

Use a two-part identifier:

1. **Core semantic path**: `MAJOR.MINOR.PATCH[.branch...]`
2. **Track tag**: `-<TRACK>`

Examples:

- `v0.3.3a-X` (default canonical track)
- `v0.3.2-V` (alternate canonical track)
- `v0.3.2.1-V` (child branch under `v0.3.2-V`)
- `v0.3.2.1.4-V` (deeper branch path)

## Breadcrumb Lineage

Every canonical or branch brief should declare lineage in the document header or intro, using:

`Lineage: <parent> -> <child>`

Examples:

- `Lineage: v0.3.3-X -> v0.3.3a-X`
- `Lineage: v0.3.1d -> v0.3.2-V`
- `Lineage: v0.3.2-V -> v0.3.2.1-V`

## Canonical Tracks

Multiple canonical briefs may exist at once.

Current convention:

- **Track X**: default activity-market-making brief
- **Track V**: alternate canonical with stronger context-first coordination bridge

Canonical tracks are listed in:

- `/brief/` sidebar (`Canonical Tracks`)
- `/versions/` table (`Canonical Brief Tracks`)

## Naming and Subtitle

Each canonical brief should include:

- `track` (for example `X`, `V`)
- `subtitle` describing why this variant exists
- `lineage` breadcrumb

## Archival Rule

Historical versions remain untouched in `/versions/brief/`.
Rebranding or terminology updates apply to current/canonical surfaces, not archived snapshots.

Letter suffixes (`a`, `b`, `c`, `d`) represent revisions of the same base version line (for example `v0.3.1a` through `v0.3.1d`), not a separate track system.
