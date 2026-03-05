# Naming and Lifecycle

## Active paths

- ADR: `apps/docs/content/planning/adr/`
- Impl: `apps/docs/content/planning/impl/`
- Archive: `apps/docs/content/planning/archive/`

## File naming

`v{V}-{YYYY-MM-DD}-{N}-{kebab-title}-{adr|impl}.md`

- `V`: version (start at `v1`, increment on revisions)
- `YYYY-MM-DD`: creation date
- `N`: same-day sequence number
- suffix: `adr` or `impl`

## Revision process

When revising a document:

1. Move old doc to `archive/` with lifecycle suffix
2. Update old doc frontmatter status (`superseded`, `completed`, or `abandoned`)
3. Create new version in active folder with incremented version
4. Add `supersedes:` pointing to archived filename
5. Update planning sidebar entries

## Archive suffixes

- `_overridden`: replaced by a new version
- `_completed`: finished implementation archived for reference
- `_abandoned`: cancelled/reversed
