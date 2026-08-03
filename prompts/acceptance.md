# Prompt: Acceptance Scenarios (Phase 3, with the spec)

**Role.** You capture a capability's observable behaviour as concrete, human-accepted
examples — the behavioural half of the specification — **before** it is built. The value is
the shared agreement on *what the system does and why it matters*; the executable Gherkin is
how that agreement stays honest. Lead with the behaviour and its value, not the syntax.

This is **Formulation**, the second behaviour practice: you turn the examples agreed during
**Discovery** into concrete, checkable scenarios. If a Discovery example map exists for this
capability (`docs/spec/behavior/discovery/<capability>.md`), it is your primary source — its
agreed examples become scenarios and its open questions must be resolved first, not papered
over. If none exists, formulate from the PRD's user stories directly.

**Inputs.** `/acceptance <capability>`. Read any `docs/spec/behavior/discovery/<capability>.md`,
the user stories in `docs/product/prd.md` (and `docs/product/brief.md`), the relevant part of
the emerging `docs/spec/technical-spec.md`, `docs/spec/behavior/README.md`, and
`constitution.md`. Load
`docs/spec/behavior/gherkin-guidelines.md` — the vendored **format contract** — and follow
it when phrasing scenarios (declarative, observable `Then`, concrete realistic data, one
behaviour per scenario, `<10` steps). Gherkin is the default contract; if the project has
adopted another behavioural format, follow that project's contract instead.

**Task.** For the capability, produce or extend `docs/spec/behavior/<capability>.feature`:

- One `Scenario` (or `Scenario Outline`) per acceptance criterion. Give each a stable
  `@AC-<capability>-<n>` id — the tag the technical-spec and, later, the backlog tasks
  cite. Traceability flows outward from these scenarios.
- Write declarative `Given / When / Then` in business language — what the user achieves,
  not which buttons they click.
- Cover the **defining examples**: the happy paths plus the critical rules the stories and
  spec imply (a forbidden disclosure, an invalid-input rejection, a permission boundary).
  Not every edge case — completeness fills in as the spec and tasks firm up.

**Rules.**

- **Behaviour before build.** This phase produces `.feature` files only — no `src/`, no
  step definitions, no runner. Do not implement.
- **Do not invent behaviour.** A scenario asserts only what a user story or the spec
  states. If the stories are ambiguous, or silent on a case that matters, mark it
  `[OPEN - REQUIRES INPUT]` and ask — never paper over the gap with a plausible scenario.
- **External behaviour only.** Scenarios describe what the user observes. Internals, the
  data model, and non-functionals stay in `technical-spec.md`; do not let the scenarios
  absorb them.
- **Right altitude.** These are feature-level details for one capability. Product-level
  end-to-end journeys are a separate, higher layer (authored with the PRD). Do not put
  whole-product journeys here.
- **Declarative, one behaviour per scenario**, `Scenario Outline` for data variations. If a
  criterion is better checked by a unit test than a scenario, say which and why.
- A drafted `.feature` is a proposal, and **accepting it is accepting the behaviour** — the
  agreement on *what*, before anyone specs *how*. Present it and stop for human review
  before saving or committing.
