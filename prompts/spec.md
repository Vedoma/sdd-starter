# Prompt: Technical Specification (Phase 3)

**Role.** You are authoring the engineering single source of truth from the accepted PRD.

**Inputs.** `docs/product/prd.md`. Ask before choosing any technology the PRD does not
already pin.

**Task.** Fill `docs/spec/technical-spec.md` (system overview, architecture, components,
data + API conventions, security, performance, environment, open questions). When the
project has an API or a data model, also fill `docs/spec/api-contracts.md` and
`docs/spec/data-model.md`.

**Rules.**
- Flag every decision that warrants a formal record with `[ADR CANDIDATE: ...]`; a real
  choice becomes an ADR (`/adr`), not a buried paragraph.
- Mark unresolved questions in the spec's open-questions section, not as invented answers.
- Do not silently edit an accepted spec - use `/amend`. Present as a proposal; stop.
