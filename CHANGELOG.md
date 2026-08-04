# Changelog

All notable changes to `sdd-starter` are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html) — MAJOR for a
breaking scaffold restructure, MINOR for a new phase / prompt / workflow, PATCH for
fixes and clarifications.

The scaffold's own principles are versioned separately in
[`constitution.md`](./constitution.md); the current spec version lives in
[`SPEC_VERSION.md`](./SPEC_VERSION.md).

## [Unreleased]

<!--
Guidance for the next entry:

- Group changes under Added / Changed / Deprecated / Removed / Fixed / Security.
- Reference the PR: e.g. "- Added: new `/design` prompt phase (#42)."
- On release, rename the [Unreleased] heading to the new version + date and start a
  fresh [Unreleased] block above it.
-->

## [0.1.0] - 2026-08-04

First public release of the SDD Starter scaffold — a plain-Markdown, zero-lock-in
foundation for Spec-Driven Development. Everything below ships in 0.1.0; later changes are
tracked against it.

This release is intentionally pre-1.0: the scaffold is complete and usable, but several
constitution clauses (C3, C6, C7) are honestly marked `unenforced`, and the constitution
itself remains `1.0 (unreleased)` pending owner sign-off. See `constitution.md`.

### Added

- **Spec-Driven Development lifecycle** — a two-mode workflow driven by `/`-commands whose
  tool-agnostic bodies live in `prompts/` and are wrapped by `.claude/commands/`. Greenfield
  bootstrap runs six phases (`/brief` → `/prd` → `/spec` + `/design` → `/adr` → `/plan` →
  `/implement`); post-MVP work runs change-based sustain (`/change`, `/amend`).
- **Behaviour-driven layer** (`docs/spec/behavior/`) — Example Mapping discovery
  (`/discover`), `@AC-`tagged Gherkin scenarios authored before code (`/acceptance`), and
  product-level `@journey` scenarios. Scenarios precede implementation, so tests derive from
  accepted behaviour rather than from the code (constitution C5/C10).
- **Project constitution** (`constitution.md`) — ten binding principles (C1–C10), each
  naming its enforcement mechanism and an honest `Status` (`automated` / `partial` /
  `review` / `unenforced`) that states how much is actually enforced today rather than
  overclaiming.
- **`spec-lint`** (`scripts/spec-lint.mjs`) — the enforcement backbone: runs on stock Node
  with zero dependencies and blocks on Spec-Reference, acceptance-criteria, ADR-index, and
  behaviour-trace violations, tagging each finding with the clause it enforces.
- **ADR framework** (`docs/adr/`) — immutable-once-accepted decision records, with the
  `adr-status` workflow managing status transitions on the PR branch.
- **Change-based sustain mode** (`docs/changes/`) — post-MVP deltas that fold into the
  living spec and archive, instead of editing accepted specs in place.
- **Multi-tool agent instructions** — a single operational source (`AGENTS.md`) imported or
  natively loaded by `CLAUDE.md`, `GEMINI.md`, `.cursor/rules/sdd.mdc`, and
  `.github/copilot-instructions.md`, so the constitution is always in an agent's context.
- **Per-project configuration** (`sdd.config.yml`) — resolves which documents a given
  project is required to have.
- **CI workflows** — `spec-lint`, `adr-status`, and `create-followup`, plus opt-in `a11y`
  and `acceptance-tests` templates to activate against a built application.
- **Repository setup guide** (`docs/repo-setup.md`) — the GitHub settings the constitution
  assumes (branch protection, required checks, CODEOWNERS, secret scanning) written down so
  they are auditable rather than tribal.
- **Community health & templates** — `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`,
  bug-report and feature-request issue forms, a PR template, `CODEOWNERS` (shipped commented
  for adopters to fill), and this changelog.

[Unreleased]: https://github.com/Vedoma/sdd-starter/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Vedoma/sdd-starter/releases/tag/v0.1.0
