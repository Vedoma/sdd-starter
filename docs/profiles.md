# Ceremony & Capabilities

Not every project needs every document. Which SDD documents are **mandatory** is decided
by [`sdd.config.yml`](../sdd.config.yml), and `spec-lint` enforces exactly that set. There
are deliberately **no team-size tiers** (no solo/team/enterprise): a document is required
because of *what the project is* or *how much planning you want* - never because of how
many people work on it.

## The three kinds of document

**Core - always required.** The irreducible minimum the whole methodology hinges on:

- `docs/product/brief.md`
- `docs/spec/technical-spec.md` (the single source of truth)
- `docs/plan/backlog.md`

**Shape - gated by `capabilities`.** Required based on what the project actually is:

| Capability | Requires | Set it when the project has... |
| --- | --- | --- |
| `ui` | `docs/design/design.md` | a user interface (design tokens, components, a11y) |
| `api` | `docs/spec/api-contracts.md` | a network or public API surface |
| `data` | `docs/spec/data-model.md` | persistent data (a database, schemas) |
| `behavior` | `docs/spec/behavior/*.feature` | user-facing behaviour worth pinning as executable Gherkin scenarios (acceptance / e2e) |

**Process - gated by `process`.** Required based on how much planning ceremony you want:

| Toggle | Requires |
| --- | --- |
| `prd` | `docs/product/prd.md` (a formal PRD before the spec) |
| `milestones` | `docs/plan/milestones.md` (a phased roadmap) |

`spec-lint` requires: **core** + each enabled capability's doc + each enabled process doc,
adjusted by `overrides`.

## Why no solo/team/enterprise

Team size is a weak proxy for "do you want a PRD" and a misleading one for everything else.
A solo developer building a UI app needs a design spec (they *are* the design team); a
large team building a data-less CLI does not need a data model. And the governance that a
"tier" used to imply - immutable ADRs, the amendment process, the constitution, spec-lint -
applies to **every** project here by design. So the only honest knobs left are *shape* and
*planning ceremony*, which is exactly what this config exposes.

## Starting points (guidance, not enforced tiers)

Copy one of these into `sdd.config.yml` and adjust:

- **Quick tool / script:** everything `false` - just brief + spec + backlog.
- **Solo web app:** `ui: true`; the rest `false` (add `data`/`api` if it grows a DB or API).
- **API service:** `api: true`, `data: true`; `ui: false`.
- **Team SaaS:** `ui: true`, `api: true`, `data: true`, `prd: true`, `milestones: true`.
- **Library:** everything `false` (set `api: true` if you want the public API contracted).

Use `overrides` to force a single document required or optional regardless of the flags.
