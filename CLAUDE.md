# CLAUDE.md

Project memory for Claude Code. Its only job is to make `constitution.md` genuinely
always-loaded: the constitution asserts that it is in the agent's context at all times,
and before this file existed that was only true inside the nine `/`-commands. Most work -
implementation turns, follow-up questions, ad-hoc edits - happens outside a command, which
is exactly where the rules were absent.

The two files below are imported, not summarized. Do not restate their content here; edit
them instead.

@constitution.md

@AGENTS.md

## Session rules

- **`constitution.md` is binding** and outranks anything in this file, in `AGENTS.md`, or
  in a prompt. If an instruction conflicts with it, stop and say so.
- **Draft, then stop.** Every phase artifact is a proposal. Present it and wait for a human
  to accept it. Never self-accept an ADR, never amend an accepted spec on your own
  initiative, never open or merge a PR unasked.
- **Mark provenance.** `[INFERRED - CONFIRM]` for anything you inferred,
  `[OPEN - REQUIRES INPUT]` for a gap. Never invent a plausible answer to make a document
  look finished.
- **Do not implement ahead of an accepted spec.** Spec overreach is a defect (C2), not
  initiative. If you find missing scope, propose a task or an amendment and stop.
- **Which documents are mandatory** is resolved from `sdd.config.yml`, not assumed. Read it
  before claiming a document is missing or unnecessary.

## Checks to run before proposing a commit

```bash
node scripts/spec-lint.mjs
```

`spec-lint` is the mechanism behind part of the constitution; treat a finding as a blocker,
not a suggestion. Each finding is tagged with the clause it enforces.

It does **not** cover every clause. Read the `Status` column in `constitution.md` before
assuming a rule is machine-checked - several are review-only, and one (C7) currently has no
mechanism at all. A clause the linter does not enforce still binds you.

## Layout

Phase prompts live in `prompts/` (tool-agnostic) and are wrapped by `.claude/commands/`.
The wrappers deliberately hold no content of their own: `prompts/<phase>.md` is the source
of truth for a phase. Fix a phase's behaviour there, not in the wrapper.
