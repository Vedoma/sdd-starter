# Spec Version Log

> This file tracks the canonical version of the Technical Specification.
> Every accepted change to `docs/spec/technical-spec.md` or `docs/product/prd.md` must be logged here.
> **Never silently edit an accepted spec.** Use the amendment process below.

---

## Current Version

| Field | Value |
|-------|-------|
| **Spec Version** | 0.1 |
| **Status** | Draft |
| **Last Updated** | YYYY-MM-DD |
| **Spec Owner** | [Name] |

---

## Amendment Process

When a requirement changes after the spec has been accepted:

1. Add a new row to the **Changelog** table below
2. Update the version number (`MAJOR.MINOR` — minor for additions/clarifications, major for breaking changes)
3. In the spec document, mark the changed section with `<!-- AMENDED: AMEND-ID -->` above it
4. Update `Current Version` table above
5. List all backlog tasks affected in the amendment entry

---

## Changelog

| Version | Amendment ID | Date | Author | Summary | Affected Tasks |
|---------|-------------|------|--------|---------|---------------|
| 0.1 | — | YYYY-MM-DD | [Name] | Initial spec draft | — |

---

## Amendment Template

When adding an amendment, copy this block into the changelog and fill it in:

```
### AMEND-[YYYY-MM-DD]-[SEQ]
- **Version bump:** 0.x → 0.y
- **Changed sections:** §[x.x], §[y.y]
- **Reason:** [Why this change was needed]
- **Previous text:** [Exact quote of what was replaced]
- **New text:** [Exact replacement text]
- **Affected backlog tasks:** TASK-[XXX], TASK-[YYY]
- **ADR impact:** [None / ADR-XXXX superseded by ADR-YYYY]
- **Risk:** [LOW / MEDIUM / HIGH — regression risk to completed tasks]
```
