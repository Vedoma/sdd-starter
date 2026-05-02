# QA Runbook

> **Phase 6 — Implementation, Open Mercato Lens**  
> The operational checklist QA and on-call use to verify a release and respond to incidents.

**Version:** 0.1 | **Last Updated:** YYYY-MM-DD

---

## Pre-Release Checklist

Run before promoting a build to staging or prod.

- [ ] All migrations from `docs/ops/migration-plan.md` for this release are merged and tested.
- [ ] OpenAPI verification passes (`pnpm openapi:check` or project equivalent).
- [ ] Every PR in this release references a spec section in its description.
- [ ] ACL smoke tests pass for every gated route in `docs/spec/acl-matrix.md`.
- [ ] Tenant isolation test passes (a request with tenant A cannot read tenant B's data).
- [ ] Feature flags listed in `docs/ops/environment.md` are configured per tier.
- [ ] Release notes drafted in `docs/plan/milestones.md`.

---

## Release Steps

1. **Tag** the release commit with `vX.Y.Z`.
2. **Deploy schema migrations** (expand phase) per `migration-plan.md`.
3. **Deploy application code** to staging.
4. **Run smoke tests** (see below).
5. **Promote** to prod.
6. **Run data migrations** (if any) as scheduled jobs.
7. **Verify** dashboards: error rate, p95 latency, queue depth.
8. **Drop deprecated schema** in a follow-up release once stable.

---

## Smoke Tests

The minimum manual or automated checks per release.

| # | Surface | Test | Expected | ACL Variant |
|---|---------|------|----------|-------------|
| 1 | `/admin/[module-a]` | Load the list page as `admin` | 200, list renders | — |
| 2 | `/admin/[module-a]` | Load as `customer` | 403 | — |
| 3 | `POST /api/[module-a]/[resource]` | Create with valid payload | 201, command emitted | `admin` |
| 4 | `POST /api/[module-a]/[resource]` | Create without `[module-a].[resource].write` | 403 | `staff` |
| 5 | Cross-tenant read | Read tenant A resource with tenant B context | 404 (not 200, not 403) | — |

Add one row per critical path. Smoke tests are not exhaustive — they catch regressions in the highest-value flows.

---

## Incident Response

### If a migration goes bad

1. Stop the deployment pipeline.
2. Check `docs/ops/migration-plan.md` for the rollback approach.
3. If reversible: run the down migration on the affected tier.
4. If not reversible: write a new "undo" migration and ship it as a hotfix.
5. Open an incident ADR documenting cause and follow-up.

### If ACL leaks data

1. Treat as a security incident. Page the security on-call.
2. Identify scope using audit-log queries (see `docs/spec/integration-contracts.md` §Domain Events).
3. Patch by tightening the offending feature string in `docs/spec/acl-matrix.md` and shipping a fix.
4. Notify affected tenants per the project's disclosure policy.

### If a webhook dead-letters

1. Inspect the dead-letter queue.
2. Identify the failing subscriber.
3. Decide: retry, drop, or notify the subscriber.
4. If a payload schema change caused the failure, the change should have been an ADR — escalate.

---

## Observability Targets

| Signal | Tool | Threshold |
|--------|------|-----------|
| HTTP 5xx rate | [Datadog / Grafana / etc.] | < 0.1% sustained |
| p95 admin route latency | [tool] | < 500ms |
| Command queue lag | [tool] | < 10s |
| Webhook delivery failure rate | [tool] | < 1% |

Specific dashboard URLs go in `docs/spec/integration-contracts.md` or a separate observability spec — not in this runbook.

---

## Validation Checklist

- [ ] Smoke tests are automated where possible.
- [ ] Incident-response steps are linked from the on-call channel topic.
- [ ] Every observability target has a paging rule.
- [ ] Runbook is reviewed every release cycle.
