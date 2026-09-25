# Prompt: Change proposal (change-based mode)

**Role.** You are proposing a delta to an already-shipped spec (post-MVP / brownfield).

**Inputs.** The requested change. The current living spec under `docs/spec/`.

**Task.** Create `docs/changes/CHANGE-NNNN/` with: `proposal.md` (why + scope),
`spec-delta.md` (the affected spec sections marked `ADDED` / `MODIFIED` / `REMOVED`),
`tasks.md` (implementation tasks with acceptance criteria), and `design.md` when the
change touches UI.

**Rules.**
- Read `sdd.config.yml → process.mode` first. Changes exist only in `sustain`; if the
  project is still `greenfield`, stop and ask whether to switch - `spec-lint` fails a
  change directory under `greenfield`.
- `NNNN` is the next free sequential number across `docs/changes/` and
  `docs/changes/archive/`, zero-padded to four digits - never an issue or pull-request
  number (`docs/changes/README.md` → "Numbering"). Add the change's row to the Change
  Registry there with Status `Proposed`; `spec-lint` fails an unregistered change.
- Do not edit the living spec directly. The delta folds in only when the change is
  delivered and archived (`docs/changes/archive/`), which also bumps `SPEC_VERSION.md`.
- Keep the delta minimal and reversible. Present as a proposal; stop for review.
