# Behavioural specification — the acceptance criteria, made executable

This directory is the **behavioural half of the specification** (Phase 3). While
`docs/spec/technical-spec.md` says *what the system is* — structure, data, interfaces,
non-functionals — these Gherkin `*.feature` files say *how it must behave*, as concrete
examples a human can review and a machine can run.

They are **authored during Specification, before the code**, from the user stories in the
PRD. `/implement` (Phase 6) then makes them pass. That ordering is the point: it is what
constitution clause **C5** ("tests derived from acceptance criteria, not from the
implementation") looks like when it is real instead of an honour system. A scenario that
exists before the code cannot be reverse-engineered from it.

> **Altitude — read this first.** This layer holds the **detailed, feature-level** examples
> for a capability. The **product-level end-to-end journeys** (the few happy paths that
> define the whole product) are a separate, higher layer authored earlier, with the PRD —
> see "The two altitudes" below. Do not put whole-product journeys here, and do not try to
> enumerate every edge case up front: write the **defining examples** (happy paths + the
> critical rules), and let completeness fill in as the spec and tasks firm up. Exhaustive
> edge-case scenarios written before the spec exists only churn.

## Traceability flows *outward* from here

Because scenarios are authored *before* the technical spec is finished, they are the
anchor, not the follower:

- Every `Scenario` is **one acceptance criterion** and carries a stable id tag —
  `@AC-<area>-<n>` (e.g. `@AC-login-2`).
- The **technical-spec and the backlog tasks cite those ids** — a task says "satisfies
  `@AC-login-2`", not the other way round.
- `spec-lint` checks that, when `capabilities.behavior` is on, real scenarios exist and
  carry `@AC-` ids. Wiring the full task↔scenario coverage check is the next tightening.

## Rules for a scenario

- **Declarative, not imperative.** Describe *what* the user achieves in business language,
  not which buttons they click. Click-by-click scenarios are brittle and quietly become
  "tests written from the UI".
- **One behaviour per scenario.** Use a `Scenario Outline` with `Examples` for data
  variations, not copy-paste.
- **Scenarios pin external behaviour only.** "The user sees a generic error" belongs here;
  "bcrypt cost factor 12" belongs in `technical-spec.md`. Do not let the scenarios absorb
  the internals, the data model, or the non-functionals — the technical spec still owns
  those.
- **Gherkin is for behaviour.** Granular logic (the edge cases of a pure function) belongs
  in unit tests — still derived from the acceptance criteria, just not in Gherkin. Do not
  Gherkin everything or it becomes ceremony.

## The two altitudes

| Layer | Scope | Authored | Volume | Home |
| --- | --- | --- | --- | --- |
| **Journeys** | product-level, end-to-end happy paths + critical rules | Phase 2, with the PRD | few, very stable | *(planned — see below)* |
| **Features** *(this dir)* | one capability's detailed behaviour | Phase 3, with the spec | many, more volatile | `docs/spec/behavior/*.feature` |

Journeys assert the **flow and the outcome** thinly and reference the feature scenarios for
detail; feature scenarios own the specifics. Holding that line is what stops the two
altitudes duplicating each other. The journey layer is a planned second increment; until it
lands, this feature layer stands on its own.

## Portability (no lock-in)

The `.feature` files are plain Gherkin — portable, tool-agnostic, readable without any
runtime. The **step definitions and the runner** that execute them (Cucumber, Behave,
pytest-bdd, Playwright + cucumber, …) are a **per-project choice** and live in
[`../../../tests/acceptance/`](../../../tests/acceptance/). Record the choice in an ADR and
wire it via [`../../../.github/workflows/acceptance-tests.yml.example`](../../../.github/workflows/acceptance-tests.yml.example).
Nothing in this directory commits you to a runner.

## When this layer is required

Required when `capabilities.behavior` is `true` in
[`sdd.config.yml`](../../../sdd.config.yml). Off by default; turn it on as the project takes
shape (see [`docs/profiles.md`](../../profiles.md)). See [`example.feature`](./example.feature)
for the conventions — then delete it and write your own.
