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

## Two version records

The spec's version is written in two places, and they do different jobs:

| Record | Holds | Moves |
|--------|-------|-------|
| **Revision History** at the end of `docs/spec/technical-spec.md` | the document's own edit log | a row per substantive edit, including while the spec is `Draft` |
| **This file** (Current Version + Changelog) | the canonical *accepted* version and the amendment trail | only when the spec is accepted, and on each amendment after that |

- **Version numbers may advance while `Draft`** - in the Revision History only (`0.1` →
  `0.2` → …). This file stays at the version it was created with, so during `Draft` the two
  are expected to differ.
- **On acceptance**, one PR sets both to the accepted version: a Revision History row in the
  spec, and here the Current Version (Status `Accepted`) plus a Changelog row.
- **After acceptance**, every amendment bumps both, in the same PR.
- Keep the spec header's `**Version:**` equal to its newest Revision History row. That one is
  not checked.

**Enforced:** under `process.mode: sustain`, `spec-lint` fails when the newest Revision
History version differs from Current Version above. Under `greenfield` it only warns, and only
once the spec declares itself `Accepted`.

---

## Amendment Process

When a requirement changes after the spec has been accepted, do it through a change (see
[`docs/changes/`](./docs/changes/)) - never edit the accepted spec silently. Delivering a
change folds its delta into the spec and records the amendment here:

1. Add a new row to the **Changelog** table below (reference the `CHANGE-NNNN` it came from)
2. Update the version number (`MAJOR.MINOR` — minor for additions/clarifications, major for breaking changes)
3. In the spec document, mark the changed section with `<!-- AMENDED: AMEND-ID -->` above it
4. Update `Current Version` table above, and add a Revision History row with the same version to the spec (see "Two version records")
5. List all backlog tasks affected in the amendment entry
6. Move the delivered `docs/changes/CHANGE-NNNN/` to `docs/changes/archive/`, set its Status to `Archived` in `proposal.md` and the change registry, and fill the registry's Delivered In - all in the same PR as steps 1-4 (`spec-lint` checks this)

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
