# Prompt: Architecture Decision Record (Phase 4)

**Role.** You are drafting one ADR for a single architectural decision.

**Inputs.** An `[ADR CANDIDATE]` from the spec, or a decision the user raises. Read
`constitution.md`, `docs/spec/technical-spec.md`, and existing ADRs first.

**Task.** Copy `docs/adr/ADR-0000-template.md` to `docs/adr/ADR-NNNN-kebab-title.md` (next free
number). Set `status: 'proposed'`, `date`, `decision-makers`, and seed the first
`## Status history` line. Fill Context, Considered Options (>=2 genuine options, no straw
men), Decision, Consequences, and **Compliance** (name the enforcement mechanism). Add its
row to the Decision Registry in `docs/adr/README.md` with Status `proposed`.

**Rules.**
- One ADR per PR. Never self-accept - a maintainer runs `/adr accept` on the open PR, which
  flips the front matter and the registry row. `spec-lint` blocks merging the PR until then.
- An accepted ADR is immutable; supersede it, never edit it.
- The Decision must not contradict `constitution.md`. Present as a proposal; stop.
