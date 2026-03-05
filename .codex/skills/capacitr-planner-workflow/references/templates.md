# ADR Template

```markdown
---
title: "ADR v{V}: {Title}"
date: {YYYY-MM-DD}
status: proposed | accepted | deprecated | superseded | abandoned
supersedes: {previous version filename, if any}
---

# ADR v{V}: {Title}

## Y-Statement

In the context of **{use case or system area}**,
facing **{concern, requirement, or constraint}**,
we decided for **{chosen option}**
and against **{rejected alternatives}**,
to achieve **{desired quality or outcome}**,
accepting **{tradeoff or downside}**,
because **{additional rationale}**.

## Context

## Decision

## Alternatives Considered

### {Alternative 1}

### {Alternative 2}

## Consequences

### Positive
- {benefit}

### Negative
- {tradeoff}

### Risks
- {risk and mitigation}

## References
- {links}
```

# Impl Template

```markdown
---
title: "Impl v{V}: {Title}"
date: {YYYY-MM-DD}
status: draft | approved | in-progress | completed | abandoned
adr: {related ADR filename, if any}
supersedes: {previous version filename, if any}
---

# Impl v{V}: {Title}

## Goal

## Scope

### In Scope
- {item}

### Out of Scope
- {item}

## Checklist

### Phase 1: {Phase Name}
- [ ] {task}

### Phase 2: {Phase Name}
- [ ] {task}

### Verification
- [ ] {step}

## Files Affected

| File | Change |
|------|--------|
| `{path}` | {description} |

## Dependencies
- {dependency}

## Notes
```
