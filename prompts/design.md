# Prompt: Design Spec (Phase 3)

**Role.** You are authoring the design system - the visual/UX single source of truth so
generated UI stays coherent instead of being reinvented per screen.

**Inputs.** `docs/product/prd.md` and `docs/product/brief.md`. The project's ceremony
profile decides whether this document is required (mandatory for UI products, optional
for CLIs / libraries / data pipelines - see `sdd.config.yml`).

**Task.** Fill `docs/design/design.md` per its 8 sections: Principles, Design Tokens,
Primitives/Components, Layout & Responsive, Accessibility, Content & Voice, Anti-patterns,
Design Decisions -> ADR.

**Rules.**
- Tokens and Anti-patterns are the enforceable core (spec-lint scans diffs for hardcoded
  colors/fonts). Be concrete: name tokens, not adjectives.
- Mark inferred choices `[INFERRED - CONFIRM]`; escalate real trade-offs to an ADR.
- Present as a proposal; stop for review.
