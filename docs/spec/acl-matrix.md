# ACL Feature Matrix

> **Phase 3 — Technical Specification, Open Mercato Lens**  
> The single source of truth for every ACL feature string the product introduces, the actions it gates, and the roles that hold it.

**Version:** 0.1 | **Last Updated:** YYYY-MM-DD  
**Spec Reference:** `docs/spec/technical-spec.md`, `docs/spec/module-map.md`

---

## Feature String Naming Convention

```
<module>.<resource>.<action>
```

- `<module>` — short module slug (matches `docs/spec/module-map.md`)
- `<resource>` — entity or surface (e.g., `order`, `dashboard`)
- `<action>` — `read`, `write`, `delete`, `manage`, or domain verbs (`refund`, `approve`)

`manage` implies all sub-actions on that resource. Avoid it unless you mean it.

---

## Master Matrix

| Feature String | Module | Resource | Action | Gates (Routes / Commands / UI) | Default Roles |
|----------------|--------|----------|--------|--------------------------------|---------------|
| `[module-a].[resource].read` | `[module-a]` | `[resource]` | read | `GET /api/[module-a]/[resource]`, `/admin/[module-a]` list | `staff`, `admin` |
| `[module-a].[resource].write` | `[module-a]` | `[resource]` | write | `POST /api/[module-a]/[resource]`, `Create[Resource]Command` | `admin` |
| `[module-a].[resource].delete` | `[module-a]` | `[resource]` | delete | `DELETE /api/[module-a]/[resource]/:id`, `Delete[Resource]Command` | `admin` |

Every row must reference at least one concrete gate. Unused feature strings are deleted, not parked.

---

## Role → Feature Matrix

| Role | Features |
|------|----------|
| `customer` | [list] |
| `staff` | [list] |
| `admin` | [list] |
| `superadmin` | platform-defined |

Roles are defined per-tenant unless otherwise noted. The platform `superadmin` role bypasses ACL by definition; do not list features for it.

---

## Validation Checklist

- [ ] Every public route in `docs/spec/api-contracts.md` references a feature string from this matrix.
- [ ] Every command listed in `docs/spec/api-contracts.md` references a feature string.
- [ ] Every admin UI route in `docs/spec/ui-routes.md` references a feature string.
- [ ] No two modules share the same `<module>` prefix.
- [ ] Tests assert that each gated endpoint returns `403` when the feature is missing.

---

## Change Log

| Date | Feature(s) | Change | Reviewer |
|------|-----------|--------|----------|
| YYYY-MM-DD | `[module-a].[resource].read` | Added | [Name] |
