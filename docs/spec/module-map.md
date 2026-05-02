# Module Map

> **Phase 3 — Technical Specification, Open Mercato Lens**  
> Lists every Open Mercato module the product introduces or extends, with the entities, commands, and admin UI surfaces each one owns.

**Version:** 0.1 | **Last Updated:** YYYY-MM-DD  
**Spec Reference:** `docs/spec/technical-spec.md`

---

## Module Inventory

| Module | Package | Owns Entities | Exposes Commands | Admin UI Mounts | Depends On |
|--------|---------|---------------|------------------|-----------------|------------|
| `[module-a]` | `@your-org/module-[a]` | `[Entity1]`, `[Entity2]` | `[CommandA]`, `[CommandB]` | `/admin/[a]` | `@open-mercato/core`, `[module-b]` |
| `[module-b]` | `@your-org/module-[b]` | `[Entity3]` | `[CommandC]` | `/admin/[b]` | `@open-mercato/core` |

Add one row per module. New modules require an ADR if they introduce new cross-cutting concerns.

---

## Per-Module Detail

### Module: `[module-a]`

- **Purpose:** [One sentence — what user-visible capability does this module deliver?]
- **Tenancy scope:** [tenant-only / tenant + organization]
- **Entities:** see `docs/spec/data-model.md` §[Module-A]
- **Commands:** see `docs/spec/api-contracts.md` §[Module-A] and §Commands
- **ACL features:** see `docs/spec/acl-matrix.md` §[Module-A]
- **Admin UI:** see `docs/spec/ui-routes.md` §[Module-A]
- **Migrations:** `migrations/[module-a]/*` — see `docs/ops/migration-plan.md`
- **Open questions / risks:** [List or link to ADRs]

Repeat the block above for every module.

---

## Module Boundaries

- A module **must not** import another module's internal files. Cross-module access is via:
  - Public API exports defined in the module's `index.ts`
  - Commands invoked through the platform command bus
  - Read APIs declared in OpenAPI

Cross-module coupling that violates these rules is a defect — open an ADR if you genuinely need to break this rule.

---

## Reusing Built-in Modules

Document any built-in Open Mercato module you extend (e.g., catalog, orders, identity). For each:

| Built-in Module | Why You Extend It | Extension Mechanism | New ACL Feature Strings |
|-----------------|-------------------|---------------------|-------------------------|
| `[catalog]` | [Reason] | [Plugin / event listener / new command] | `[catalog.[feature]]` |

Extending built-ins should still follow the platform's plugin/extension contract. Do not patch source.

---

## Validation Checklist

Before promoting this map from Draft → Accepted:

- [ ] Every entity in `docs/spec/data-model.md` is listed under exactly one owning module.
- [ ] Every command in `docs/spec/api-contracts.md` is listed under exactly one owning module.
- [ ] Every admin UI route in `docs/spec/ui-routes.md` is listed under exactly one owning module.
- [ ] Cross-module dependencies form a DAG (no cycles).
- [ ] Each module has an ACL feature namespace registered in `docs/spec/acl-matrix.md`.
