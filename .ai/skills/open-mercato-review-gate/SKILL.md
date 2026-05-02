---
name: open-mercato-review-gate
description: Cross-cutting review gate for Open Mercato SDD. Use to verify that every phase document is complete, consistent, and cross-referenced before allowing implementation to begin.
---

# Skill: Open Mercato Review Gate

## When to Use

- After Phase 5, before any code is written.
- Whenever an amendment to an Accepted spec lands and you need to confirm consistency.
- Whenever a new ADR resolves an open question, to verify the back-references are in place.

## Required Inputs

- The full `docs/` tree.
- `SPEC_VERSION.md`.
- The `.ai/skills/` directory (this skill checks that every phase has a matching skill present).

## Method

Run the checks in order. Report each as pass / fail with file references. Do not silently fix issues — list them for the user.

### 1. Document Presence

| Required Path | Phase | Pass If |
|---------------|-------|---------|
| `docs/product/brief.md` | 1 | exists, not blank |
| `docs/product/open-mercato-fit.md` | 1 | exists, decision = GO or GO with caveats |
| `docs/product/prd.md` | 2 | exists, not blank |
| `docs/spec/technical-spec.md` | 3 | exists, not blank |
| `docs/spec/data-model.md` | 3 | exists |
| `docs/spec/api-contracts.md` | 3 | exists |
| `docs/spec/module-map.md` | 3 | exists |
| `docs/spec/acl-matrix.md` | 3 | exists |
| `docs/spec/ui-routes.md` | 3 | exists |
| `docs/spec/integration-contracts.md` | 3 | exists |
| `docs/adr/` | 4 | at least one ADR if Phase 3 had open questions |
| `docs/plan/milestones.md` | 5 | exists |
| `docs/plan/backlog.md` | 5 | exists |
| `docs/ops/environment.md` | 5 | exists |
| `docs/ops/migration-plan.md` | 5 | exists |
| `docs/ops/qa-runbook.md` | 5 | exists |

### 2. Cross-Reference Integrity

- Every FR ID in `prd.md` is referenced at least once in `technical-spec.md` or a companion spec.
- Every entity in `data-model.md` appears in `module-map.md` exactly once.
- Every command and public route in `api-contracts.md` appears in `acl-matrix.md`.
- Every admin UI route in `ui-routes.md` appears in `acl-matrix.md` and `module-map.md`.
- Every public REST route has an OpenAPI ref in `integration-contracts.md`.
- Every entity is created or modified by a migration in `migration-plan.md`.
- Every backlog task in `backlog.md` references a spec section, FR ID, or ADR ID.
- Every ACL feature string in `acl-matrix.md` is referenced from at least one route, command, or UI surface.

### 3. Open Mercato Constraint Audit

- Tenancy declared for every entity in `data-model.md`.
- Every write FR in `prd.md` declares command-backed status.
- No cross-module cycles in `module-map.md`.
- Every gated route has both an allow-case and a deny-case smoke test in `qa-runbook.md`.
- CI plan in `qa-runbook.md` (or `environment.md`) includes OpenAPI verification.

### 4. Status & Versioning

- `SPEC_VERSION.md` reflects the current state.
- Every Phase doc header status is `Accepted` (or has a documented exception).
- Every ADR has status `Accepted`, `Rejected`, or `Superseded`.
- No `[OPEN QUESTION]` blocks remain unresolved unless explicitly deferred with owner + due date.

### 5. Skill Coverage

- One SKILL.md exists per phase under `.ai/skills/open-mercato-*`.
- Each skill's frontmatter has `name` and `description`.

## Outputs

A single report, structured as:

```
# Open Mercato SDD Review Gate — YYYY-MM-DD

## Section 1 — Document Presence
- PASS / FAIL: <path> — <reason>

## Section 2 — Cross-Reference Integrity
…

## Section 3 — Open Mercato Constraint Audit
…

## Section 4 — Status & Versioning
…

## Section 5 — Skill Coverage
…

## Summary
- Total checks: N
- Pass: N
- Fail: N
- Blocking: <list>
```

## Phase Gate

Implementation may start only when the Summary shows `Fail: 0`. Any failures require either a fix in the relevant earlier phase or an ADR documenting acceptance of the gap.
