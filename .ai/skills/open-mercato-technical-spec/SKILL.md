---
name: open-mercato-technical-spec
description: Phase 3 of Open Mercato SDD. Use to produce the master technical specification and its companion artifacts (data model, API contracts, module map, ACL matrix, UI routes, integration contracts) for an Open Mercato product.
---

# Skill: Open Mercato Technical Specification

## When to Use

- The PRD is Accepted (Phase 2 gate passed).
- The technical specification is missing, partial, or out of date.
- The product is being built on Open Mercato.

## Required Inputs

- `docs/product/prd.md` (Accepted) — every FR ID is referenced from the spec.
- `docs/product/brief.md` and `docs/product/open-mercato-fit.md`.
- A working list of modules the product introduces or extends.

## Outputs

This is the largest skill. It owns these documents and ensures they cross-reference cleanly:

| Document | Purpose |
|----------|---------|
| `docs/spec/technical-spec.md` | Master spec — narrative architecture, sections cross-link to the rest |
| `docs/spec/data-model.md` | Entities, relations, indexes, tenant scoping rules |
| `docs/spec/api-contracts.md` | Per-endpoint request / response, references OpenAPI files |
| `docs/spec/module-map.md` | Modules, their entities, commands, UI mounts, dependencies |
| `docs/spec/acl-matrix.md` | Feature strings, gates, role assignments |
| `docs/spec/ui-routes.md` | Admin UI route inventory, ACL, data sources |
| `docs/spec/integration-contracts.md` | Outbound APIs, inbound integrations, webhooks, events, commands |

## Open Mercato-Specific Rules

- **Modules first.** Define modules before entities. Every entity belongs to exactly one module.
- **Tenant scoping is explicit.** Every entity declares its tenancy: tenant-only, tenant + organization, or platform-global (rare; requires ADR).
- **Commands cover all non-trivial writes.** Direct repo writes are the exception and require a justification line.
- **ACL feature strings are first-class.** Every protected route, command, and admin UI surface lists its feature string.
- **OpenAPI is the contract.** Every public route in `api-contracts.md` references an entry in an `openapi/*.yaml` file.
- **CRUD factory by default.** Routes that deviate from the CRUD factory record the deviation in `ui-routes.md`.
- **Migrations align with the data model.** Every schema element here is created by a migration listed in `docs/ops/migration-plan.md`.

## Phase Gate

Advance to Phase 4 only when **all** are true:

- [ ] Every FR ID from the PRD is referenced by at least one section in `technical-spec.md`.
- [ ] Every entity in `data-model.md` is in `module-map.md` and has a tenancy declaration.
- [ ] Every command and public route in `api-contracts.md` is in `acl-matrix.md`.
- [ ] Every admin UI route in `ui-routes.md` is in `acl-matrix.md` and `module-map.md`.
- [ ] Every public REST route has an OpenAPI ref in `integration-contracts.md`.
- [ ] No cross-module cycles in `module-map.md`.
- [ ] User has approved all seven documents.

## Hand-off

On gate pass, hand to `open-mercato-adr` (Phase 4) for any architectural decisions surfaced during spec drafting (e.g., choice of search backend, eventing semantics, multi-region strategy). Anything marked `[OPEN QUESTION]` in the spec must become an ADR or be resolved before Phase 5.
