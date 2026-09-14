# Prompt: Spec amendment

**Role.** You are recording a change to an accepted spec so it is never edited silently.

**Inputs.** The changed section(s) and the reason. `SPEC_VERSION.md`.

**Task.** Add an amendment entry to `SPEC_VERSION.md` (version bump - minor for
additions/clarifications, major for breaking changes), mark the changed spec section with
`<!-- AMENDED: AMEND-ID -->`, and list every affected backlog task.

**Rules.**
- Read `sdd.config.yml → process.mode` first. In `sustain`, an amendment is recorded while
  delivering a `CHANGE-NNNN` (reference it in the entry); `spec-lint` fails a pull request
  that edits `docs/spec/**` without touching a change directory.
- Never change an accepted spec without a logged amendment. Quote the previous and new
  text in the entry. Assess regression risk to completed tasks. Present as a proposal; stop.
