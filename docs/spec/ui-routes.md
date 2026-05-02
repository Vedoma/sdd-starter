# Admin UI Routes

> **Phase 3 — Technical Specification, Open Mercato Lens**  
> Catalog of every admin UI route the product mounts, its module owner, the ACL feature that gates it, and the data it depends on.

**Version:** 0.1 | **Last Updated:** YYYY-MM-DD  
**Spec Reference:** `docs/spec/technical-spec.md`, `docs/spec/module-map.md`, `docs/spec/acl-matrix.md`

---

## Route Inventory

| Route | Module | Purpose | ACL Feature | Reads From | Writes Via |
|-------|--------|---------|-------------|------------|------------|
| `/admin/[module-a]` | `[module-a]` | List `[Resource]` | `[module-a].[resource].read` | `GET /api/[module-a]/[resource]` | — |
| `/admin/[module-a]/new` | `[module-a]` | Create `[Resource]` | `[module-a].[resource].write` | — | `Create[Resource]Command` |
| `/admin/[module-a]/:id` | `[module-a]` | Detail / edit `[Resource]` | `[module-a].[resource].write` | `GET /api/[module-a]/[resource]/:id` | `Update[Resource]Command`, `Delete[Resource]Command` |

One row per route. Nested routes are explicit, not implied.

---

## Per-Route Detail (only where non-trivial)

### `/admin/[module-a]/:id`

- **Layout:** Detail page using the platform admin layout.
- **CRUD factory used:** [Yes / No — if Yes, which factory hooks customized?]
- **Empty state:** [Describe what the user sees when the resource is missing]
- **Error states:** 403 → redirect to `/admin/forbidden`; 404 → not-found pane.
- **Side effects:** [Audit log entries / events emitted]
- **Spec ref:** `technical-spec.md` §[Route].

Only add a detail section when the route deviates from the CRUD factory defaults. Routes that are pure CRUD-factory output do not need extra prose.

---

## Navigation

Document where each route appears in the admin navigation. Routes that exist but are unreachable from the nav must justify it (deep-link only, embedded panel, etc.).

| Nav Group | Items | Visible To (ACL) |
|-----------|-------|------------------|
| `[Group Name]` | `/admin/[module-a]`, `/admin/[module-b]` | `[module-a].[resource].read OR module-b.[resource].read` |

---

## Validation Checklist

- [ ] Every route has an ACL feature listed in `docs/spec/acl-matrix.md`.
- [ ] Every route's owning module is listed in `docs/spec/module-map.md`.
- [ ] Every CRUD-factory deviation has an explanation here.
- [ ] Every route is either in the navigation table or marked deep-link-only.
- [ ] Smoke tests cover a `403` and a `200` case per gated route.
