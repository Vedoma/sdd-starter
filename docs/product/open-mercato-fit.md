# Open Mercato Fit Assessment

> **Phase 1.5 — Idea Crystallization, Open Mercato Lens**  
> Use this document to confirm that your product is a good fit for the Open Mercato platform before drafting the PRD.

**Version:** 0.1 | **Date:** YYYY-MM-DD | **Author:** [Name]  
**Status:** Draft  
**Inputs:** `docs/product/brief.md`  
**Outputs:** A go / no-go decision for building on Open Mercato, plus a list of constraints to carry into the PRD.

---

## What Is Open Mercato?

Open Mercato is a TypeScript-based, modular commerce platform organized around tenants, organizations, modules, entities, ACL feature strings, and admin UI routes. Reusable building blocks include a CRUD factory, command-backed mutations, OpenAPI-verified contracts, and migration-driven schema changes. Reference: [docs.openmercato.com](https://docs.openmercato.com).

---

## Fit Checklist

| # | Question | Answer | Notes |
|---|----------|--------|-------|
| 1 | Is the product multi-tenant or organization-scoped? | [Y/N] | Open Mercato assumes tenant + organization scoping by default. |
| 2 | Does it expose admin UI screens for back-office users? | [Y/N] | Admin UI routes are first-class. |
| 3 | Are there CRUD-shaped entities behind the workflows? | [Y/N] | The CRUD factory handles list/detail/create/update/delete. |
| 4 | Do mutations need to run as commands (audited, side-effecting)? | [Y/N] | Command-backed mutations are the default write path. |
| 5 | Will external systems integrate via REST/JSON? | [Y/N] | OpenAPI contracts are validated in CI. |
| 6 | Do you need role-based access via feature strings? | [Y/N] | ACL feature strings gate routes, commands, and UI. |
| 7 | Are migrations and seed data acceptable as the schema mechanism? | [Y/N] | Schema changes ship as migrations. |

If five or more answers are **Y**, Open Mercato is a strong fit. Three or fewer **Y** answers — reconsider the platform or scope down.

---

## Constraints Inherited from Open Mercato

List the constraints that will carry into the PRD and Tech Spec.

- **Tenancy:** every entity is scoped by `tenantId` and (optionally) `organizationId`.
- **Identity:** users authenticate against the platform identity layer; do not roll your own.
- **ACL:** every protected route, command, and UI surface needs a feature string.
- **Modules:** features ship as modules (`@your-org/module-<name>`); cross-module coupling goes through declared contracts.
- **APIs:** every public API endpoint must have an OpenAPI definition that CI validates against the implementation.
- **Mutations:** non-trivial writes go through commands; direct repository writes are a code-review red flag.
- **Migrations:** no in-place schema edits — every change is a migration with up/down.

---

## Decision

| Field | Value |
|-------|-------|
| **Decision** | [GO / NO-GO / GO with caveats] |
| **Caveats** | [If any] |
| **Reviewer** | [Name] |
| **Decision Date** | YYYY-MM-DD |

If **NO-GO**, document the alternative platform choice in an ADR and stop the Open Mercato workflow.

---

## Next Step

If **GO**, proceed to `docs/product/prd.md` (Phase 2) using the Open Mercato-specific PRD skill (`.ai/skills/open-mercato-prd`). Carry the constraints above forward as non-negotiable inputs.
