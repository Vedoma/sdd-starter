# AGENTS.md - operating manual for AI agents

This file is the **operational** guide for any agent (Claude, Cursor, Copilot, Gemini,
Grok, Aider, ...) working in this repository: which phase you are in, which command to
run, when to stop for a human, and how to write honestly. It is the single source every
tool loads — natively (Codex, Cursor, Copilot, Grok, Gemini CLI, ...) or by import
(`CLAUDE.md`, `GEMINI.md`). The per-tool files carry no rules of their own; they point
here, so there is exactly one copy to keep current.

The **normative** rules - the principles your output must satisfy - live in
[`constitution.md`](./constitution.md). Read the constitution first; it is binding and
takes precedence over anything here.

## The SDD lifecycle

This scaffold has two modes, and a project is in exactly one of them.

**Pre-flight:** before editing `docs/spec/**`, read `sdd.config.yml → process.mode`. It
decides whether you edit the spec directly (`greenfield`) or open a change (`sustain`), and
`spec-lint` fails a project that runs both flows at once.

**Greenfield bootstrap** (new project, `process.mode: greenfield`) - work the phases in order:

| Phase | Command | Produces |
| --- | --- | --- |
| 1 Idea | `/brief` | `docs/product/brief.md` |
| 2 Requirements | `/prd`, `/discover` | `docs/product/prd.md`, `docs/spec/behavior/discovery/*.md`, `docs/spec/behavior/journeys/*.feature` |
| 3 Specification | `/spec`, `/design`, `/acceptance` | `docs/spec/*.md`, `docs/design/design.md`, `docs/spec/behavior/*.feature` |
| 4 Decisions | `/adr` | `docs/adr/ADR-NNNN-*.md` |
| 5 Planning | `/plan` | `docs/plan/milestones.md`, `docs/plan/backlog.md` |
| 6 Implementation | `/implement TASK-XXX` | `src/`, `tests/` |

When `capabilities.behavior` is on, behaviour is worked as **three practices** across the
phases — **Discovery** (Phase 2, `/discover`: facilitate an Example Mapping conversation,
surface rules/examples/questions), **Formulation** (Phase 3, `/acceptance`: turn agreed
examples into `@AC-`tagged scenarios), and **Automation** (Phase 6, `/implement`:
selectively). Scenarios are authored **before** the code, so the spec, decisions, plan, and
`/implement` all serve behaviour a human has already accepted — not tests reverse-engineered
from the agent's own code (constitution C5). Discovery and journeys are optional and light;
the feature-level scenarios are what `spec-lint` requires. Product-level end-to-end
**journeys** (`@journey`, authored in Phase 2) sit above the per-capability feature
scenarios. See [`docs/spec/behavior/`](./docs/spec/behavior/) and [`tests/`](./tests/).

**Change-based sustain** (post-MVP / brownfield, `process.mode: sustain`) - do not edit
accepted specs ad hoc.
Every change is a delta: `/change` opens `docs/changes/CHANGE-XXXX/`; on delivery the
delta folds into the living spec and the change is archived. See
[`docs/changes/`](./docs/changes/).

Commands are defined in [`.claude/commands/`](./.claude/commands/) and back onto the
tool-agnostic prompt bodies in [`prompts/`](./prompts/); a non-Claude agent can read the
`prompts/` file directly.

Which documents a given project is required to have is declared in
[`sdd.config.yml`](./sdd.config.yml) — read it rather than assuming a document is
mandatory or optional.

## How to write (provenance rule)

You are drafting artifacts a human will accept, edit, or reject - never silently commit
your guesses as fact. In every generated document:

- Preserve what the author actually stated.
- Mark anything you inferred with `[INFERRED - CONFIRM]`.
- Mark any gap you cannot fill with `[OPEN - REQUIRES INPUT]` - never invent a plausible
  answer to make the document look finished.

**Ask, don't guess.** If a phase's inputs are missing or contradictory, ask clarifying
questions before drafting.

## Human-in-the-loop checkpoints

Stop and get explicit human approval before:

- Accepting an ADR (a maintainer runs `/adr accept`; you never self-accept).
- Amending an accepted spec (`/amend` + `SPEC_VERSION.md`).
- Anything destructive or irreversible (deleting files, force-pushing, rewriting history).
- Opening or merging a pull request.

A drafted artifact is a proposal. Present it and wait.

## Repository structure

```
constitution.md              # binding project principles (read first)
CLAUDE.md                    # imports constitution + AGENTS for Claude Code
GEMINI.md                    # imports constitution + AGENTS for Gemini CLI
SPEC_VERSION.md              # spec version + amendment log
docs/
  product/  spec/  design/  plan/  adr/  changes/
  spec/behavior/             # behavioural spec: Gherkin *.feature (executable acceptance)
  spec/behavior/journeys/    # product-level end-to-end @journey scenarios (Phase 2, optional)
  spec/behavior/discovery/   # Example Mapping residue from /discover (Phase 2, optional)
  repo-setup.md              # GitHub settings the constitution assumes
  ecosystem/forge-md.md      # OPTIONAL: forge-md interop - delete if unused
prompts/                     # tool-agnostic prompt bodies (one per phase)
.claude/commands/            # Claude Code command wrappers over prompts/
.cursor/rules/               # points Cursor at this file + the constitution
.github/                     # copilot-instructions.md (pointer), CODEOWNERS, PR template, CI
scripts/spec-lint.mjs        # the enforcement backbone
src/                         # implementation
tests/                       # acceptance/ (runs the .feature scenarios), integration/, unit/
```

## What is actually enforced

Run `node scripts/spec-lint.mjs` before proposing a commit; each finding names the clause
it enforces. But **read the `Status` column in `constitution.md` before assuming a rule is
machine-checked** — C6 and C7 currently name mechanisms that do not exist, C3 checks the
process mode but not the amendment bookkeeping, and C1's Spec Reference check verifies
presence, not that the reference resolves. Those clauses still bind you; the unchecked parts
are simply enforced by you and the reviewer rather than by CI.

## Non-negotiables (see constitution.md for the full list + enforcement)

- The specification is the single source of truth; no code without a spec entry.
- Implementing more than the spec asks ("spec overreach") is a defect.
- ADRs are immutable once accepted - supersede, never edit.
- Tests are derived from acceptance criteria, not from the implementation.
- Every PR carries a Spec Reference (enforced by spec-lint).
