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

What earns this layer its keep is not the automation — it is the **shared agreement on
behaviour** captured as concrete examples, and the value that behaviour delivers. Automation
is the by-product that keeps the agreement honest over time. In an agentic workflow that
matters more, not less: when an agent writes more code than you can read, a defining example
a human already accepted is the highest-leverage instruction you can hand it — unambiguous,
the oracle `/implement` codes against, and the thing you review *instead of* the diff. Start
from the behaviour and its value; reach for a strict format only where it adds clarity.

## The three practices (behaviour is a workflow, not a file format)

Behaviour work is three practices, in order — this is what "behaviour mindset" means here,
and only the middle one is about writing Gherkin:

| Practice | The point | Phase | Command | Output |
| --- | --- | --- | --- | --- |
| **Discovery** | Build shared understanding by talking through concrete examples; surface the questions. | 2, with the PRD | [`/discover`](../../../prompts/discover.md) | an example map ([`discovery/`](./discovery/)) |
| **Formulation** | Write the agreed examples as concrete, checkable scenarios. | 3, with the spec | [`/acceptance`](../../../prompts/acceptance.md) | `*.feature` scenarios |
| **Automation** | Make the system actually do it — selectively. | 6 | [`/implement`](../../../prompts/implement.md) | [`tests/`](../../../tests/) |

**Discovery is where the value is** — the conversation catches misunderstandings while they
are still a sentence. **Formulation** is the residue that keeps the agreement precise.
**Automation is a by-product**: you automate the scenarios worth automating (see
[`tests/README.md`](../../../tests/README.md)), not as the goal but to keep the agreement
honest over time. A team can get most of the value from Discovery and Formulation alone; the
scaffold never forces you to automate a scenario to have specified it.

Both altitudes below flow through all three practices — a product journey is discovered and
formulated just like a feature, usually first.

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

## The format contract (how to write a good scenario)

The mechanics of writing a good Gherkin scenario — declarative over imperative, one
behaviour per scenario, observable `Then`, concrete realistic data, `<10` steps, no
UI/DB plumbing in steps, stable vocabulary, no bundled quality concerns — live in one
vendored contract, [`gherkin-guidelines.md`](./gherkin-guidelines.md), so there is a single
source of truth for them. `/acceptance` loads it as context; treat it as binding when you
write or review a `.feature` file. It is the **default** format contract, not a mandate: if
another behavioural format serves the project better, swap it and vendor that contract here.

## What this scaffold adds on top of the contract

The guidelines cover *how to phrase a scenario*; these rules are *ours*, and they are what
make the scenarios load-bearing in this methodology:

- **Traceability via `@AC-` ids** — every scenario carries a stable id the technical-spec and
  backlog tasks cite (see "Traceability flows outward" above). The guidelines do not define
  this; it is the scaffold's.
- **Scenarios pin external behaviour only.** "The user sees a generic error" belongs here;
  "bcrypt cost factor 12" belongs in `technical-spec.md`. Do not let the scenarios absorb
  the internals, the data model, or the non-functionals — the technical spec still owns
  those.
- **Do not behaviour-spec everything.** Granular logic (the edge cases of a pure function)
  belongs in unit tests — still derived from the acceptance criteria, just not as a scenario.
  Capture behaviour where a *human agreeing on it* adds value; below that line, a unit test
  is the cheaper, clearer home.

## The two altitudes

| Layer | Scope | Authored | Volume | Home |
| --- | --- | --- | --- | --- |
| **Journeys** | product-level, end-to-end happy paths + critical rules | Phase 2, with the PRD | few, very stable | [`journeys/`](./journeys/) |
| **Features** *(this dir)* | one capability's detailed behaviour | Phase 3, with the spec | many, more volatile | `docs/spec/behavior/*.feature` |

Journeys assert the **flow and the outcome** thinly and reference the feature scenarios for
detail; feature scenarios own the specifics. Holding that line is what stops the two
altitudes duplicating each other. Journeys are optional and additive — add them when the
product has multi-step, cross-capability flows; see [`journeys/README.md`](./journeys/README.md).

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
