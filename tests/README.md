# tests/ — the executable half of the spec

Tests here are not an afterthought bolted on at `/implement` time; they are how the spec
becomes checkable. Every test traces to an acceptance criterion, and no test is
reverse-engineered from the code it checks (constitution **C5**).

Why this is load-bearing, not optional: when an agent generates more code than you can
read, the code review that used to catch mistakes stops scaling. The tests become the
thing you actually trust — the executable statement of what the system must do. A green
suite is the unit of trust; without it, "the agent said it works" is all you have.

## The three layers

| Layer | Directory | Derived from | Form |
| --- | --- | --- | --- |
| **Acceptance / e2e** | `tests/acceptance/` | the `.feature` scenarios in [`docs/spec/behavior/`](../docs/spec/behavior/) | Gherkin scenarios + step definitions, run end-to-end |
| **Integration** | `tests/integration/` | acceptance criteria that cross a component boundary | your test framework |
| **Unit** | `tests/unit/` | acceptance criteria for a single unit's logic and edge cases | your test framework |

Most behaviour is pinned at the **acceptance** layer (it is user-visible and survives
refactors); units cover the branches and edge cases underneath. All three derive from the
**same acceptance criteria** — they differ in altitude, not in where their truth comes
from. None is written by asserting whatever the implementation happens to do.

## Automation is selective (the third practice, not the goal)

Automation is one of the three behaviour practices (Discovery → Formulation → **Automation**),
and it is a **by-product, not the point**. Specifying behaviour — the Discovery conversation
and the Formulated scenarios under [`docs/spec/behavior/`](../docs/spec/behavior/) — delivers
value whether or not a scenario is ever automated. You automate a scenario to keep the
agreement honest over time, and you do it **selectively**:

- **Always** the `@AC-` scenarios a backlog task cites — `/implement` makes exactly those green.
- **Usually** the product-level `@journey` scenarios — the highest-value end-to-end checks,
  though also the slowest, so automate the few that define the product.
- **Not** every scenario reflexively. A scenario documenting an agreement a cheaper unit test
  already guards does not need its own end-to-end automation. Do not manufacture step
  definitions to hit a coverage number — that is the automation-first anti-pattern BDD warns
  against.

The discipline `spec-lint` enforces is that the scenarios a task *cites* pass — not that
every scenario in the tree is wired to a runner.

## Acceptance tests and Gherkin

The `.feature` files are the **behavioural spec** and live under `docs/spec/behavior/`
(they are spec, and portable Gherkin). What lives *here*, under `tests/acceptance/`, is the
executable glue: the **step definitions** and the **runner** that make those scenarios run.

The runner is a **per-project choice** — Cucumber, Behave, pytest-bdd, Playwright +
cucumber, Reqnroll, … — because it depends on your language and stack, which this scaffold
deliberately does not assume. Record the choice in an ADR, wire it into CI via
[`.github/workflows/acceptance-tests.yml.example`](../.github/workflows/acceptance-tests.yml.example),
and add it to the required checks (see [`docs/repo-setup.md`](../docs/repo-setup.md)).

## Ordering (the part that makes C5 real)

1. `/acceptance <capability>` (Phase 3) specifies behaviour as `.feature` scenarios under
   `docs/spec/behavior/`, from the PRD's user stories — **before** the technical spec is
   finished and long before any code. A human accepts the scenarios; accepting them *is*
   accepting the behaviour.
2. `/plan` (Phase 5) decomposes the work; each task cites the `@AC-` scenarios it advances.
3. `/implement TASK-XXX` (Phase 6) writes code until the cited scenarios and the unit tests
   pass, and **never weakens or rewrites a scenario to match the code**.

A test that only exists after the code, asserting what the code already does, is not
evidence — it is a mirror.

## The scaffold's own tests

`tests/integration/spec-lint-*.test.mjs` test the scaffold's `spec-lint`, not your product.
They run on stock Node (`node --test`) inside the `spec-lint` workflow, which selects them by
name so your own tests never run there. They build their own throwaway projects from frozen
fixtures and read only the tools under test, so filling in your documents or editing the PR
template cannot break them. Keep them as long as you keep `spec-lint`.
