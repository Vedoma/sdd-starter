<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/95ff5615-ddd6-44b3-8b12-897fd59e171e">
  <img src="https://github.com/user-attachments/assets/7755f537-a930-417f-8735-3515909dda6d" alt="sdd-starter">
</picture>

# SDD Starter - Spec-Driven Development Scaffold

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/9fa10ca9-416a-4686-bc1e-9b0670ebb33f">
  <img src="https://github.com/user-attachments/assets/c351dc30-1d8b-407c-b7b6-7212b6a038db" alt="Principle: the specification is the single source of truth.">
</picture>

A ready-to-use, MIT-licensed scaffold for **Spec-Driven Development**: plain Markdown,
no CLI, no runtime, no lock-in. Clone it, declare what you're building, and drive a project
from idea to implementation with every decision traceable and every rule enforced in CI.

## Why This Exists - Control the Ideas, Not the Code

When an LLM can generate more code than you can read, reviewing code line-by-line stops
scaling. The leverage moves **up a level** - to the ideas the code must satisfy: the
brief, the spec, the decisions, the acceptance criteria. That is not the end of software
craftsmanship; it is craftsmanship applied where it now counts. (See antirez,
[_Control the ideas, not the code_](https://antirez.com/news/169).)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/8cbea053-2f5a-43c9-b70d-bd2a2aaf554a">
  <img src="https://github.com/user-attachments/assets/64b8d284-dc5d-49a9-816a-ba538a20c3d6" alt="Control the ideas, not the code">
</picture>

This scaffold makes those ideas first-class: **versioned, reviewable, and enforced** with
the same rigor as code - immutable decisions, an amendment process, and CI gates that
block a non-compliant PR rather than trusting an agent to remember the rules. That is what
"Idea as code" means here.

## The Two-Mode Lifecycle

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/efd3617d-cb12-4bb7-8000-ea47007f83ec">
  <img src="https://github.com/user-attachments/assets/89886691-1427-42d1-899b-ab0817eda194" alt="The two-mode lifecycle">
</picture>

- **Greenfield** builds the initial living spec, phase by phase.
- **Change-based** sustains it: after the spec is accepted you never edit it ad hoc -
  every change is a delta (`ADDED` / `MODIFIED` / `REMOVED`) that folds into the living
  spec and is then archived. Archiving keeps an agent's working context small (it reads
  the active tree, not the history) without losing the audit trail. See
  [`docs/changes/`](./docs/changes/).

## Repository Structure

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/244ec9a3-3a04-4c3e-994b-5127ad2e2d04">
  <img src="https://github.com/user-attachments/assets/a90cb448-5824-412a-858d-1964c40a2311" alt="Repository map">
</picture>

```
.
├── constitution.md               ← binding principles + enforcement Status (read first)
├── SPEC_VERSION.md               ← spec version + amendment log
├── sdd.config.yml                ← capabilities + process (which docs are mandatory)
├── AGENTS.md                     ← operating manual (the single source every tool loads)
├── CLAUDE.md                     ← imports constitution + AGENTS for Claude Code
├── GEMINI.md                     ← imports constitution + AGENTS for Gemini CLI
├── docs/
│   ├── product/                  ← brief.md, prd.md
│   ├── spec/                     ← technical-spec.md (SSoT), data-model.md, api-contracts.md
│   │   └── behavior/             ← *.feature acceptance spec + journeys/ + discovery/ (behaviour)
│   ├── design/                   ← design.md (design system) + mockups/
│   ├── adr/                      ← MADR decisions (ADR-0000-template.md) + index
│   ├── plan/                     ← milestones.md, backlog.md (+ archive/)
│   ├── changes/                  ← CHANGE-NNNN deltas (+ archive/)
│   ├── repo-setup.md             ← the GitHub settings the constitution assumes
│   ├── profiles.md               ← what capabilities/process resolve to
│   └── ecosystem/                ← OPTIONAL: forge-md interop (delete if unused)
├── prompts/                      ← tool-agnostic prompt body per command
├── .claude/commands/             ← Claude Code command wrappers over prompts/
├── .cursor/rules/                ← points Cursor at AGENTS.md + constitution
├── .github/
│   ├── copilot-instructions.md   ← points Copilot at AGENTS.md + constitution
│   ├── CODEOWNERS                ← required reviewers (fill in before enabling)
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/                ← spec-lint, adr-status, create-followup,
│                                   a11y.yml.example (template, inactive)
├── scripts/spec-lint.mjs         ← the enforcement backbone
├── src/                          ← implementation
├── tests/                        ← acceptance/ (runs the .feature scenarios), integration/, unit/
└── LICENSE                       ← MIT
```

## The Workflow

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/1815b82f-70f3-4304-91b3-e53bab8908c0">
  <img src="https://github.com/user-attachments/assets/4f3f3e6c-b0c0-4bec-961d-52266fde0866" alt="The workflow: six phases, one command each">
</picture

Each phase has a command (Claude Code: [`.claude/commands/`](./.claude/commands/)) backed
by a tool-agnostic prompt (any agent: [`prompts/`](./prompts/)):

| # | Phase | Command | Output |
|---|-------|---------|--------|
| 1 | Idea | `/brief` | `docs/product/brief.md` |
| 2 | Requirements | `/prd`, `/discover` | `docs/product/prd.md`, `docs/spec/behavior/discovery/*.md` |
| 3 | Specification | `/spec`, `/design`, `/acceptance` | `docs/spec/*.md`, `docs/design/design.md`, `docs/spec/behavior/*.feature` |
| 4 | Decisions | `/adr` | `docs/adr/ADR-NNNN-*.md` |
| 5 | Planning | `/plan` | `docs/plan/milestones.md`, `docs/plan/backlog.md` |
| 6 | Implementation | `/implement TASK-XXX` | `src/`, `tests/` |

Agents draft; humans accept. Every generated document marks inferences
`[INFERRED - CONFIRM]` and gaps `[OPEN - REQUIRES INPUT]` rather than guessing. See
[`AGENTS.md`](./AGENTS.md).

## Behaviour, Specified Before It's Built

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/d64888e3-4215-4bb3-8946-b469f90ac0f2">
  <img src="https://github.com/user-attachments/assets/821292b6-02e3-48fb-8de3-e1317054d741" alt="Behaviour, Written First">
</picture

When a capability has user-facing behaviour (`capabilities.behavior: true`), the scaffold
captures it as **executable acceptance scenarios authored in Phase 3, before the code** - the
behavioural half of the spec ([`docs/spec/behavior/`](./docs/spec/behavior/)). This is
constitution **C10**, and it is how C5 ("tests derive from acceptance criteria") stops being
an honour system: a scenario written before the implementation cannot be reverse-engineered
from it. A defining example a human already accepted is also the highest-leverage instruction
you can hand a coding agent - the oracle `/implement` codes against, and the thing you review
*instead of* the diff.

Behaviour is worked as **three practices**, and only the middle one is about writing Gherkin:

- **Discovery** (`/discover`, Phase 2) - facilitate an Example Mapping conversation: rules,
  concrete examples, and the open questions they surface. The value is the shared
  understanding, not the file.
- **Formulation** (`/acceptance`, Phase 3) - turn the agreed examples into concrete scenarios
  carrying stable `@AC-` ids that the spec and backlog tasks cite. Traceability flows outward
  from the scenario; a dangling citation fails `spec-lint`.
- **Automation** (`/implement`, Phase 6) - make the cited scenarios pass, **selectively**.
  Automation is a by-product that keeps the agreement honest, not the goal.

Two altitudes keep it from sprawling: product-level **journeys**
([`docs/spec/behavior/journeys/`](./docs/spec/behavior/journeys/), a few end-to-end `@journey`
happy paths) sit thinly above the per-capability **feature** scenarios. The Gherkin writing
rules are a vendored, pluggable contract
([`gherkin-guidelines.md`](./docs/spec/behavior/gherkin-guidelines.md)) - Gherkin is the
**default, not a mandate**. It is all optional and light: turn it on when it earns its keep,
and `spec-lint` then requires a real, `@AC-`traced scenario and checks that every id a task
cites resolves to one.

## Getting Started

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/7a63c3ac-4c99-4351-bffc-036e93836b62">
  <img src="https://github.com/user-attachments/assets/a6a68c94-72c1-46b9-8b47-752bb56b2b06" alt="Your first 60 seconds: clone, declare, start">
</picture>

1. **Clone and rename** this repo.
2. **Declare your project** in [`sdd.config.yml`](./sdd.config.yml) - set `capabilities`
   (`ui` / `api` / `data` / `behavior`) and `process` (`prd` / `milestones`); that decides
   which docs are mandatory.
3. **Read [`constitution.md`](./constitution.md)** - the binding rules. Check the `Status`
   column: it says which clauses a machine actually blocks and which are review-only or
   not yet enforced at all. Do not assume a rule is checked because it is written down.
4. **Do the setup in [`docs/repo-setup.md`](./docs/repo-setup.md)** - required status
   checks, branch protection, CODEOWNERS. Until that is done the check runs but nothing
   *blocks* a merge, and C8 is not enforced at all.
5. **Enable the local hook** (optional): `git config core.hooksPath .githooks`.
6. **Start at `/brief`** (or, for an existing codebase, write a minimal
   `docs/spec/technical-spec.md` of what is already true and drive changes through
   `docs/changes/`).
7. **Work phase by phase** - do not implement ahead of an accepted spec. Every PR fills
   [`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md); the Spec
   Reference is mandatory and CI-enforced.

## Landing Zone for a forge-md Bundle

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/d3e0f9f1-b98f-45b9-8776-97c095738b2b">
    <img src="https://github.com/user-attachments/assets/5f81eb20-eec1-4d69-88f5-30b92b3247ba" alt="One pipeline, zero lock-in">
</picture>

This scaffold is the downstream half of a pipeline. The
[**forge-md**](https://github.com/Vedoma/forge-md) workbench takes an idea through
collaborative, multi-model spec review and exports a **bundle** that unzips straight into
this structure - phases 1–5 already filled (brief, PRD, spec, decisions, plan). You then
enter at `/implement`. The mapping is described in the optional
[`docs/ecosystem/forge-md.md`](./docs/ecosystem/forge-md.md) (delete it if you never use
forge-md).

Nothing forces you upstream: this scaffold stands alone. Together they are one pipeline -
collaborative spec review + a neutral public scaffold + a plain-Markdown handoff - with
**zero lock-in at every layer**: self-hostable workbench, MIT scaffold, portable Markdown.

## Key Rules

The binding principles live in **[`constitution.md`](./constitution.md)** - each with the
CI/review mechanism that enforces it. In short: the spec is the single source of truth;
spec overreach is a defect; accepted specs are never edited silently (use the
`SPEC_VERSION.md` amendment process); ADRs are immutable (supersede, never overwrite);
tests derive from acceptance criteria; behaviour is specified before it's built (C10); no
secrets in the repo; every change is reviewable and reversible. Read the constitution for
the full, enforceable list.

## Choosing What's Mandatory

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/eff1bd4c-f73f-4ce7-b3e5-42a40ee0b723">
    <img src="https://github.com/user-attachments/assets/c01eb4b7-d6fd-4967-b95f-1b882268691f" alt="What's mandatory: core + capabilities + process">
</picture>

No team-size tiers. Which documents are required is a real, machine-read setting driven by
two honest axes in [`sdd.config.yml`](./sdd.config.yml): **capabilities** - what the project
is (`ui` → design spec, `api` → api-contracts, `data` → data-model, `behavior` → acceptance
scenarios) - and **process** - how much planning you want (`prd`, `milestones`). The core
(brief, technical-spec, backlog) is always required; `spec-lint` enforces exactly what the
config resolves to. A data-less CLI is never asked for a data model; a solo UI app still gets
its design spec. See [`docs/profiles.md`](./docs/profiles.md) for the model and starting points.

## License

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/c3f4882d-6c5c-487a-97d8-93de04520344">
  <img src="https://github.com/user-attachments/assets/8589c6e6-1528-4372-a755-8de2e37092af" alt="MIT License - free of charge, forever">
</picture>

MIT. Use it freely for commercial and open-source projects.
