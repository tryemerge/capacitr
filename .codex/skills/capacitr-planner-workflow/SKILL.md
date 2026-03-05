---
name: capacitr-planner-workflow
description: Plan and execute Capacitr ADR/Impl documentation with repository-specific naming, versioning, archival, and sidebar update rules. Use when creating or revising planning docs in apps/docs/content/planning/, archiving overridden/completed plans, updating planning sidebar links, or selecting active implementation plans for /work execution.
---

# Capacitr Planner Workflow

Use this skill to create, revise, archive, and execute planning docs in this repository.

## Use This Workflow

1. Determine mode:
- `ADR` mode for architecture decisions (why)
- `Impl` mode for execution checklists (how)
- `/work` mode for executing checklist items in order

2. Locate documents in:
- `apps/docs/content/planning/adr/`
- `apps/docs/content/planning/impl/`
- `apps/docs/content/planning/archive/`

3. For `/work` with no target:
- run `scripts/list_active_impls.py`
- choose from `approved`/`in-progress` impl docs only

4. Follow lifecycle rules:
- never overwrite superseded docs in place
- archive with suffixes (`_overridden`, `_completed`, `_abandoned`)
- update frontmatter status and sidebar links

## Authoring Rules

- Use naming format: `v{V}-{YYYY-MM-DD}-{N}-{kebab-title}-{adr|impl}.md`
- Check same-day sequence numbers before creating files
- Keep impl checklists granular and executable in order
- Check off impl items immediately after implementation
- Update `apps/docs/content/.vitepress/config.ts` for new/archived planning docs

## References

- Naming/lifecycle rules: `references/naming-and-lifecycle.md`
- ADR/Impl templates: `references/templates.md`
- Sidebar patterns: `references/sidebar-snippets.md`

## Script

- Active impl listing/picker: `scripts/list_active_impls.py`

Run examples:

```bash
python3 .codex/skills/capacitr-planner-workflow/scripts/list_active_impls.py
python3 .codex/skills/capacitr-planner-workflow/scripts/list_active_impls.py --format json
python3 .codex/skills/capacitr-planner-workflow/scripts/list_active_impls.py --pick
```
