# Ceremony Profiles

Not every project needs every document. The **profile** in
[`sdd.config.yml`](../sdd.config.yml) selects how much ceremony this repo enforces;
`spec-lint` reads it to decide which documents are mandatory. A profile is a real,
machine-read setting - not just advice in a table - so a solo project is never failed for
lacking enterprise documents.

## The profiles

| Document | solo | team | enterprise |
| --- | --- | --- | --- |
| `product/brief.md` | required | required | required |
| `product/prd.md` | optional | required | required |
| `spec/technical-spec.md` | required | required | required |
| `spec/data-model.md` | optional | required | required |
| `spec/api-contracts.md` | optional | required | required |
| `design/design.md` | optional* | optional* | required* |
| `plan/milestones.md` | optional | required | required |
| `plan/backlog.md` | required | required | required |

\* The design spec is gated by the `ui` flag: for a CLI, library, or data-pipeline project
set `ui: false` and the design spec is never required, even on `enterprise`.

- **solo** - the smallest honest loop: a brief, a technical spec, and a backlog. Add the
  rest only when a real need appears.
- **team** - the full document set so multiple contributors share one source of truth.
- **enterprise** - everything, including the design spec, for regulated or multi-team work.

## Changing profile

Edit `profile:` (and `ui:`) in `sdd.config.yml`. Use `overrides:` to force a single
document required or optional regardless of the profile - e.g. a solo project that still
wants a data model. spec-lint enforces exactly what this file resolves to.
