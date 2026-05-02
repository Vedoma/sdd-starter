# Migration Plan

> **Phase 5/6 — Operational Spec, Open Mercato Lens**  
> Plans every schema and data migration the product introduces, with rollout, rollback, and validation steps.

**Version:** 0.1 | **Last Updated:** YYYY-MM-DD  
**Spec Reference:** `docs/spec/data-model.md`, `docs/spec/module-map.md`

---

## Migration Inventory

| ID | Module | Type | Description | Reversible? | Owner | Status |
|----|--------|------|-------------|-------------|-------|--------|
| `M-0001` | `[module-a]` | schema | Create `[resource]` table | yes | [Name] | Planned |
| `M-0002` | `[module-a]` | data | Backfill `[resource].status` defaults | yes | [Name] | Planned |
| `M-0003` | `[module-b]` | schema | Add index on `[entity].tenant_id` | yes | [Name] | Planned |

One row per migration. Statuses: Planned → In Review → Merged → Released.

---

## Per-Migration Detail

For non-trivial migrations, expand here.

### `M-0002` — Backfill `[resource].status` defaults

- **Why:** New non-nullable column requires a value for existing rows.
- **Before:** Existing rows have `status = NULL`.
- **After:** All existing rows have `status = 'pending'`.
- **Approach:** Migration runs in batches of 1,000 rows.
- **Tenant scope:** All tenants. Tenants opted out via `OM_FEATURE_FLAGS` are skipped.
- **Estimated duration:** [X minutes per million rows]
- **Rollback:** Delete the column. Data loss is acceptable because the value is defaulted.
- **Verification:** `SELECT COUNT(*) FROM [resource] WHERE status IS NULL` returns 0.

---

## Conventions

- Every migration has a paired test that runs the migration on a fixture DB.
- Migrations are **forward-only in production**. Rollback is by writing a new "undo" migration, not by reversing a merged one.
- Long-running data migrations run as background jobs with progress checkpoints, not as part of boot.
- Schema migrations that lock tables on large datasets must use `CONCURRENTLY` (Postgres) or equivalent and be scheduled in the deploy plan.

---

## Deploy Sequencing

| Step | Action | Pre-condition |
|------|--------|---------------|
| 1 | Deploy code that tolerates **both** old and new schema | Migration not yet run |
| 2 | Run schema migration | Step 1 deployed everywhere |
| 3 | Run data migration | Step 2 succeeded |
| 4 | Deploy code that requires the new schema | Step 3 succeeded |
| 5 | Drop the now-unused old column / table (separate migration, separate release) | Step 4 stable for at least one release window |

Skipping the expand-then-contract pattern requires an ADR.

---

## Validation Checklist

- [ ] Every entity in `docs/spec/data-model.md` is created or modified by a migration listed here.
- [ ] Every migration has a test.
- [ ] Every migration declares whether it is reversible and how.
- [ ] CI runs migrations against a fresh DB in every build.
- [ ] Production runbook (see `qa-runbook.md`) covers how to monitor and roll back a bad migration.
