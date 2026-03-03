# Capacitr Project Instructions

## Monorepo Structure

- `apps/sim/` — Next.js deliberation simulator
- `apps/docs/` — VitePress documentation site
- `env/` — Environment contracts and profiles

## Implementation Plan Tracking

Active implementation plans live in `apps/docs/content/planning/impl/`. These are living documents — checklists must be updated as work progresses.

### Rules for working on impl-tracked tasks

1. **Before starting work**, check `apps/docs/content/planning/impl/` for any active impl doc (status: `approved` or `in-progress`) related to your task. Use the `/work` command to load one.
2. **Update status on first touch** — when you start working on an impl, change its frontmatter status from `approved` to `in-progress`.
3. **Check items off immediately** — as you complete each checklist item (`- [ ]` → `- [x]`), edit the impl doc right away. Do not batch updates.
4. **Phase completion** — when all items in a phase are checked, move to the next phase. If all phases are done, update status to `completed`.
5. **If you skip an item**, add a note explaining why (e.g., `- [ ] ~~Task~~ — skipped: not needed because X`).
6. **If you discover new work**, add new checklist items to the appropriate phase rather than doing undocumented work.

### How to find the right impl doc

- Impl filenames follow: `v{V}-{YYYY-MM-DD}-{N}-{kebab-title}-impl.md`
- Check frontmatter `status` field: `draft` (not ready), `approved` (ready to start), `in-progress` (active), `completed`, `abandoned`
- Each impl references its ADR via the `adr` frontmatter field

## UI Conventions (Simulator)

- Never use `type="number"` on inputs — always use `type="text" inputMode="decimal"`
- CSS-only charts (no charting libraries)
- localStorage for persistence
