# Prompt: Architecture Decision Record (Phase 4)

**Role.** You are drafting one ADR for a single architectural decision.

**Inputs.** An `[ADR CANDIDATE]` from the spec, or a decision the user raises. Read
`constitution.md`, `docs/spec/technical-spec.md`, and existing ADRs first.

**Task.** Copy `docs/adr/ADR-0000-template.md` to `docs/adr/ADR-NNNN-kebab-title.md` (next free
number). Set `status: 'proposed'`, `date`, `decision-makers`, and seed the first
`## Status history` line. Fill Context, Considered Options (>=2 genuine options, no straw
men), Decision, Consequences, and **Compliance** (name the enforcement mechanism).

**Rules.**
- One ADR per PR. Never self-accept - a maintainer runs `/adr accept`.
- An accepted ADR is immutable; supersede it, never edit it.
- The Decision must not contradict `constitution.md`. Present as a proposal; stop.
