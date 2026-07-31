# Copilot instructions

This repository practises Spec-Driven Development and is governed by a constitution. These
instructions are a pointer, not a copy — the authoritative files are:

- **`constitution.md`** — binding principles (C1–C9), each with the mechanism that enforces
  it. It outranks this file and any prompt. If asked to do something that conflicts with it,
  say so instead of complying.
- **`AGENTS.md`** — the operating manual: phases, commands, and when to stop for a human.
- **`prompts/`** — the tool-agnostic prompt body for each phase (`brief`, `prd`, `spec`,
  `design`, `adr`, `plan`, `implement`, `change`, `amend`). Read the relevant one before
  producing that phase's artifact.
- **`sdd.config.yml`** — which SDD documents this project is required to have. Read it
  rather than assuming.

## Rules that most often get broken

- **No code without a spec entry.** Every change traces to a section of
  `docs/spec/technical-spec.md`, and every PR records that Spec Reference. CI enforces it.
- **Spec overreach is a defect** — implementing more than the spec asks is treated exactly
  like a bug. Do not add unrequested improvements, extra endpoints, or speculative
  abstractions. If scope is missing, propose it and stop.
- **Never edit an accepted spec silently.** Use the amendment process in `SPEC_VERSION.md`
  or route the change through `docs/changes/`. CI blocks unamended edits.
- **Never edit an accepted ADR.** Supersede it with a new one. CI blocks edits to settled
  ADRs.
- **Tests come from acceptance criteria,** not from the code you just wrote. Writing a test
  that asserts current behaviour defeats the point.
- **Mark what you inferred** with `[INFERRED - CONFIRM]` and what you could not determine
  with `[OPEN - REQUIRES INPUT]`. A confidently invented answer is worse than a marked gap.

## Checks

```bash
node scripts/spec-lint.mjs
```

Each finding names the constitution clause it enforces. It does not cover every clause —
several are review-based rather than automated, so a passing lint is not proof the
constitution is satisfied. A clause no check enforces still binds you.
