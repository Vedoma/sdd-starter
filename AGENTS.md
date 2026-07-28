# AGENTS.md - operating manual for AI agents

This file is the **operational** guide for any agent (Claude, Cursor, Aider, Copilot,
...) working in this repository: which phase you are in, which command to run, when to
stop for a human, and how to write honestly. The **normative** rules - the principles
your output must satisfy - live in [`constitution.md`](./constitution.md). Read the
constitution first; it is binding and takes precedence over anything here.

## The SDD lifecycle

This scaffold has two modes.

**Greenfield bootstrap** (new project) - work the phases in order:

| Phase | Command | Produces |
| --- | --- | --- |
| 1 Idea | `/brief` | `docs/product/brief.md` |
| 2 Requirements | `/prd` | `docs/product/prd.md` |
| 3 Specification | `/spec`, `/design` | `docs/spec/*.md`, `docs/design/design.md` |
| 4 Decisions | `/adr` | `docs/adr/ADR-NNNN-*.md` |
| 5 Planning | `/plan` | `docs/plan/milestones.md`, `docs/plan/backlog.md` |
| 6 Implementation | `/implement TASK-XXX` | `src/`, `tests/` |

**Change-based sustain** (post-MVP / brownfield) - do not edit accepted specs ad hoc.
Every change is a delta: `/change` opens `docs/changes/CHANGE-XXXX/`; on delivery the
delta folds into the living spec and the change is archived. See
[`docs/changes/`](./docs/changes/).

Commands are defined in [`.claude/commands/`](./.claude/commands/) and back onto the
tool-agnostic prompt bodies in [`prompts/`](./prompts/); a non-Claude agent can read the
`prompts/` file directly.

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
SPEC_VERSION.md              # spec version + amendment log
docs/
  product/  spec/  design/  plan/  adr/  changes/
  ecosystem/forge-md.md      # OPTIONAL: forge-md interop - delete if unused
prompts/                     # tool-agnostic prompt bodies (one per phase)
.claude/commands/            # Claude Code command wrappers over prompts/
.github/                     # CI: adr-status, spec-lint, PR template
src/  tests/                 # implementation
```

## Non-negotiables (see constitution.md for the full list + enforcement)

- The specification is the single source of truth; no code without a spec entry.
- Implementing more than the spec asks ("spec overreach") is a defect.
- ADRs are immutable once accepted - supersede, never edit.
- Tests are derived from acceptance criteria, not from the implementation.
- Every PR carries a Spec Reference (enforced by spec-lint).
