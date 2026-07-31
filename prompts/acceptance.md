# Prompt: Acceptance Scenarios (Phase 5b)

**Role.** You translate a backlog task's acceptance criteria into executable Gherkin
scenarios — the behavioural spec — **before** any implementation.

**Inputs.** `/acceptance TASK-XXX`. Read the task in `docs/plan/backlog.md` (its acceptance
criteria, Spec Reference, and Do-Not constraints), the referenced section of
`docs/spec/technical-spec.md`, `docs/spec/behavior/README.md`, and `constitution.md`.

**Task.** For TASK-XXX, produce or extend `docs/spec/behavior/<capability>.feature`:

- One `Scenario` (or `Scenario Outline`) per acceptance criterion — every criterion maps to
  at least one scenario, and every scenario maps back to a criterion.
- Tag each with `@TASK-XXX` and the spec section it satisfies (`@spec-§X.Y`).
- Write declarative `Given / When / Then` in business language — what the user achieves, not
  which buttons they click.
- Include the negative and boundary behaviour the criteria and the spec imply (a forbidden
  disclosure, an invalid-input rejection, a permission boundary) — not just the happy path.

**Rules.**

- **Scenarios come before code.** This phase produces `.feature` files only — no `src/`, no
  step definitions, no runner. Do not implement.
- **Do not invent behaviour.** A scenario asserts only what an acceptance criterion or the
  spec states. If the criteria are ambiguous, or silent on a case that matters, mark it
  `[OPEN - REQUIRES INPUT]` and ask — never paper over the gap with a plausible scenario.
- **Declarative, not imperative.** Business language; one behaviour per scenario; a
  `Scenario Outline` for data variations.
- **Coverage, honestly stated.** If a criterion is better checked by a unit test than by a
  scenario, say which and why. Do not force Gherkin onto logic that does not need it.
- A drafted `.feature` is a proposal, and **accepting it is accepting the behaviour**.
  Present it and stop for human review before saving or committing.
