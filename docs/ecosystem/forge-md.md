---
kind: contract
version: 1.0
status: draft
source: sdd-starter
---

# SDD Artifact Contract (forge-md pairing)

> **Optional - delete `docs/ecosystem/` if you are not using forge-md.** This scaffold
> stands alone; nothing here is required to run the SDD workflow. This file matters only
> when you import an idea bundle from the [forge-md](https://github.com/Vedoma/forge-md)
> workbench.

The interoperability contract between **forge-md** (the upstream spec workbench) and
**sdd-starter** (this downstream scaffold / landing zone): how an exported idea bundle maps
into this repository's structure.

The mapping is really a description of **forge-md's export behavior** - sdd-starter is the
passive target, and its own directory layout (below) *is* the target shape. The
authoritative definition therefore lives with forge-md's export implementation and its own
decision records; this file is the sdd-starter-side reference so a reader here can see the
target without opening forge-md.

## 1. Roles - who owns what

| Concern | Canonical owner |
| --- | --- |
| Document **templates** (section layouts for brief, prd, spec, design, ...) | **sdd-starter** (`docs/**`). forge-md vendors them and conformance-tests against them. |
| The **entity model** behind plan docs (tasks, milestones, dependencies) | **forge-md**. sdd-starter receives their Markdown projection. |
| A produced **artifact's content** | The idea it belongs to (authored in forge-md, edited anywhere the bundle travels). |

## 2. Artifact kinds and paths

Each forge-md artifact kind maps to exactly one location in an sdd-starter tree. Paths are
authoritative and come only from this table (never from user input).

| Kind (forge-md) | Frontmatter `kind` | sdd-starter path | Cardinality |
| --- | --- | --- | --- |
| `BRIEF` | `brief` | `docs/product/brief.md` | singleton |
| `PRD` | `prd` | `docs/product/prd.md` | singleton |
| `TECHNICAL_SPEC` | `technical-spec` | `docs/spec/technical-spec.md` | singleton |
| `API_CONTRACTS` | `api-contracts` | `docs/spec/api-contracts.md` | singleton |
| `DATA_MODEL` | `data-model` | `docs/spec/data-model.md` | singleton |
| `DESIGN` | `design` | `docs/design/design.md` | singleton |
| `MILESTONES` | `milestones` | `docs/plan/milestones.md` | singleton (projection) |
| `BACKLOG` | `backlog` | `docs/plan/backlog.md` | singleton (projection) |
| `DECISIONS` | `decisions` | `docs/adr/ADR-NNNN-*.md` | **multi** (see §5) |
| `NOTES` | `notes` | `NOTES.md` | singleton (forge-md extension) |

- `MILESTONES` / `BACKLOG` are **projections** of forge-md's task/milestone entities,
  rendered to Markdown at export; they are not free-form stored docs.
- `NOTES` is a forge-md convenience with no methodology role; it lands at the repo root.

## 3. Shared frontmatter schema

Every artifact file carries YAML frontmatter:

```yaml
---
kind: technical-spec          # required - a canonical kind from §2
version: 0.1                  # required - MAJOR.MINOR document version
status: draft                 # required - draft | accepted | superseded | archived
source: forge-md:idea/<slug>  # required - provenance; "manual" if hand-authored
---
```

Optional keys: `title`, `updated` (ISO date). Readers must ignore unknown keys rather than
fail, so the schema can grow additively.

## 4. Active vs archived

Agents reading requirements load the **active tree only**; delivered/superseded material is
moved out of the hot path (archived, never deleted - immutability and audit).

| State | Location |
| --- | --- |
| Active specs | `docs/product`, `docs/spec`, `docs/design`, active `docs/adr` |
| Active plan | `docs/plan/milestones.md`, `docs/plan/backlog.md` (open items) |
| Archived backlog | `docs/plan/archive/` |
| Archived changes | `docs/changes/archive/` |
| Superseded decisions | stay in `docs/adr/` with `status: superseded` (never removed) |

On export, forge-md emits delivered tasks and completed changes under the `archive/` paths;
active content stays in the hot tree.

## 5. ADR conventions

- **Filename:** `ADR-NNNN-slug.md` (the `ADR-` prefix, four-digit zero-padded number), so a
  `DECISIONS` export drops into `docs/adr/` under this repo's own naming.
- **Format:** MADR (YAML front matter + append-only `## Status history`), plus sdd-starter's
  mandatory `## Compliance` section. See `docs/adr/`.
- **Multi-file:** `docs/adr/` holds one decision per file (`ADR-NNNN-*.md`); an exported
  `DECISIONS` set becomes one ADR file per decision, and each is added to the
  `docs/adr/README.md` registry.

## 6. Template canonicalization and conformance

sdd-starter's templates under `docs/product`, `docs/spec`, `docs/design`, and `docs/plan` are
the **single source of truth** for document section layouts. forge-md **vendors** them (copies
with provenance) and runs a CI **conformance check** that fails when a forge-md generator's
section list diverges from the vendored template. A template change starts here and
propagates downstream, never the reverse.

## 7. Contract versioning

This file carries its own `version` in the frontmatter. A bundle declares the contract version
it was produced against, so a consumer can detect a mismatch. Bump the **minor** version for
additive changes (a new kind, a new optional frontmatter key) and the **major** version for a
breaking change (a moved path, a renamed kind, a changed cardinality).

### Changelog

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | (unreleased) | Initial contract: kinds/paths, frontmatter, active/archived, ADR conventions, template canonicalization. |

## 8. References

- [forge-md](https://github.com/Vedoma/forge-md) - the upstream workbench; its export
  implementation and decision records define the authoritative mapping.
- This scaffold's `docs/adr/`, `docs/plan/`, and `docs/changes/` - the target structure a
  bundle lands into.
