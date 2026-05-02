---
name: open-mercato-prd
description: Phase 2b of Open Mercato SDD. Use to draft or update the PRD using requirements gathered by the open-mercato-requirements skill. Enforces Open Mercato constraints in every PRD section.
---

# Skill: Open Mercato PRD

## When to Use

- Requirements have been gathered (see `open-mercato-requirements`).
- The PRD is missing or out of date with respect to Open Mercato constraints.

## Required Inputs

- The requirements brief from `open-mercato-requirements`.
- `docs/product/brief.md` (Accepted).
- `docs/product/open-mercato-fit.md` (Accepted, GO).

If any input is missing or stale, return to the Phase 1 / 2a skills first.

## Outputs

- `docs/product/prd.md` — the Product Requirements Document, with the following sections (each Open Mercato-aware):
  - Overview & goals
  - Personas & roles (cross-references the ACL plan)
  - Tenancy model (must explicitly state tenant-only vs tenant + organization)
  - Functional requirements (numbered, testable, each tagged with target persona + role)
  - Non-functional requirements (latency, compliance, auditability, accessibility, localization)
  - Integration requirements (in / out / webhooks / events)
  - Out-of-scope (carried forward from Brief, plus anything new)
  - Open Questions (with owner + due date)

Every functional requirement is numbered (e.g., `FR-012`) and is referenced later by the Tech Spec, ACL matrix, and backlog.

## Open Mercato-Specific Rules

- The PRD must name a tenancy model. Saying "we'll figure it out" is a gate failure.
- Every functional requirement that involves a write must declare whether it is command-backed.
- Every functional requirement that involves a public API must declare its OpenAPI ownership.
- Every persona × capability pair must map to at least one prospective ACL feature string (full strings come later in `acl-matrix.md`).

## Phase Gate

Advance to Phase 3 only when **all** are true:

- [ ] PRD has all sections filled or has explicit Open Questions with owners.
- [ ] Every FR has an ID, a persona, and a target role.
- [ ] Tenancy model is stated.
- [ ] Every write FR declares command-backed status.
- [ ] Every API FR declares OpenAPI ownership.
- [ ] User has approved the PRD.
- [ ] `SPEC_VERSION.md` is updated if the PRD has been amended.

## Hand-off

On gate pass, hand to `open-mercato-technical-spec` (Phase 3). Carry forward:
- All FR IDs.
- The tenancy model and ACL plan.
- The list of integrations and webhooks.
