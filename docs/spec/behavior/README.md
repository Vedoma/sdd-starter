# Behavioural specification — executable acceptance criteria

This directory holds the **behavioural half of the spec**: the user-facing behaviour of
the system, written as Gherkin `*.feature` scenarios. `docs/spec/technical-spec.md` says
*what the system is*; these files say *how it must behave*, in a form a human can review
and a machine can run.

A scenario here is **not a test written after the code**. It is a backlog task's
acceptance criteria, expressed as `Given / When / Then`, **authored before implementation**.
`/implement` then makes the scenarios pass. That ordering is the whole point — it is what
constitution clause **C5** ("tests are derived from acceptance criteria, not from the
implementation") looks like when it is real instead of an honour system.

## Why this exists (and why it matters more with AI agents)

When an agent writes code faster than anyone can read it, the reviewer's leverage moves
from *code* to *behaviour*. A `.feature` file is the artifact that carries that leverage:

- It is the **executable definition of done**. "The scenarios are green" is a fact, not
  an opinion.
- It is an unambiguous **target** for the agent. A failing scenario says exactly what to
  build — and, just as importantly, when to *stop* (spec overreach is a defect, C2).
- It **breaks the tautology**. If the agent writes the test after the code, the test only
  asserts what the code already does. A scenario that existed first cannot be
  reverse-engineered from the implementation.
- Reviewing a scenario is **cheap and high-leverage**; reviewing generated code is
  expensive and does not scale. Accepting a `.feature` file *is* accepting the behaviour —
  the same "control the ideas, not the code" move the constitution is built on.

## Rules for a scenario

- **Trace it.** Tag every `Feature`/`Scenario` with the task and spec section it satisfies:

  ```gherkin
  @TASK-014 @spec-§4.2
  ```

  so it resolves to a real backlog task (C5) and a real spec section (C1). An untagged
  scenario is an orphan.
- **Declarative, not imperative.** Describe *what* the user achieves in business language,
  not which buttons they click. Click-by-click scenarios are brittle and quietly become
  "tests written from the UI".
- **One behaviour per scenario.** Use a `Scenario Outline` with `Examples` for data
  variations, not copy-paste.
- **Cover behaviour, not every branch.** Gherkin is for user-facing behaviour and the
  acceptance/e2e layer. Granular logic (edge cases of a pure function) belongs in unit
  tests — still derived from the acceptance criteria, just not in Gherkin. Do not
  Gherkin everything or it becomes ceremony.

## Portability (no lock-in)

The `.feature` files are plain Gherkin — portable, tool-agnostic, and readable without any
runtime. The **step definitions and the runner** that execute them (Cucumber, Behave,
pytest-bdd, Playwright + cucumber, …) are a **per-project choice** and live in
[`../../../tests/acceptance/`](../../../tests/acceptance/). Record the choice in an ADR.
Nothing in this directory commits you to a runner.

## When this layer is required

Required when `capabilities.behavior` is `true` in
[`sdd.config.yml`](../../../sdd.config.yml) — i.e. when the project has user-facing
behaviour worth pinning down. Like every other capability, it is off by default and you
turn it on as the project takes shape (see [`docs/profiles.md`](../../profiles.md)).

See [`example.feature`](./example.feature) for the conventions in practice — then delete
it and write your own.
