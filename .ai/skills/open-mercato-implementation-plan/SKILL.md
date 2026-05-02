---
name: open-mercato-implementation-plan
description: Phase 5 of Open Mercato SDD. Use to convert the accepted Tech Spec and ADRs into milestones, a granular backlog, and operational runbooks for environment, migrations, and QA.
---

# Skill: Open Mercato Implementation Plan

## When to Use

- The Tech Spec (Phase 3) and ADRs (Phase 4) are Accepted.
- The team needs a delivery plan and the operational documents that production requires.

## Required Inputs

- Every Accepted document from Phases 1–4.
- Team capacity and target dates (rough is fine).
- Any organizational deploy windows / freezes.

## Outputs

- `docs/plan/milestones.md` — release-shaped milestones with goals, dates, and exit criteria.
- `docs/plan/backlog.md` — granular tasks. Every task has:
  - A unique ID (`TASK-XXX`)
  - A spec back-reference (FR ID, ADR ID, or section)
  - The owning module from `module-map.md`
  - The ACL feature string(s) it touches (if any)
  - The migrations it depends on
  - Acceptance tests derived from the spec, not from the code
- `docs/ops/environment.md` — env vars, secrets, tiers (use the existing template).
- `docs/ops/migration-plan.md` — schema and data migrations with rollout/rollback (use the existing template).
- `docs/ops/qa-runbook.md` — pre-release checks, smoke tests, incident response (use the existing template).

## Open Mercato-Specific Rules

- **Expand-then-contract migrations by default.** Plan tasks accordingly — the schema migration, the dual-tolerant code, the data migration, the cleanup migration. Each step is its own task.
- **Tenant rollout.** If the product can roll out per tenant, the backlog must include a rollout-control task (feature flag, allow-list, etc.).
- **Smoke tests cover ACL.** Every gated route must have at least one allow-case and one deny-case test in `qa-runbook.md`.
- **Webhook & event delivery.** If the product emits webhooks or events, the plan includes dead-letter handling and replay tasks.
- **OpenAPI verification job.** The CI plan includes the OpenAPI vs runtime check as a required step.

## Phase Gate

Implementation may start only when **all** are true:

- [ ] Every FR ID from the PRD maps to at least one task in `backlog.md`.
- [ ] Every task in `backlog.md` has acceptance tests written from the spec.
- [ ] Every migration in `data-model.md` has a corresponding entry in `migration-plan.md`.
- [ ] Every gated route has smoke tests in `qa-runbook.md`.
- [ ] `environment.md` is complete; `.env.example` aligns.
- [ ] CI plan includes: lint, test, migration test, OpenAPI verification, ACL smoke tests.
- [ ] User has approved milestones and the backlog.

## Hand-off

On gate pass, run the `open-mercato-review-gate` skill to validate the full document set, then hand off to the implementation-side skills (`coding-workflow`, `commit-push-pr`, etc.) for actual code work.
