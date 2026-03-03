# AGENTS.md

## Persistent Session Memory

When a new Codex session starts in this repository, load and follow these files first:

1. `.claude/commands/plan.md`
2. `.claude/commands/work.md`
3. `.claude/context/memory.md`

## Intent

- `plan.md`: Rules for creating/updating ADR and Impl planning documents.
- `work.md`: Rules for executing Impl checklists and updating progress in-place.
- `memory.md`: Project-specific operating preferences and current decisions.

## Execution Preference

- If the user asks to plan, follow `plan.md` workflow.
- If the user asks to implement from a plan, follow `work.md` workflow.
- Keep docs and code changes aligned; do not mark checklist items done unless implemented.
