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

### Added

- Diff-aware `spec-lint` checks: on a pull request the workflow passes the changed paths as
  `CHANGED_FILES`; local runs leave it unset and those checks are skipped.
- `spec-lint` blocks merging an ADR that is still `proposed`, an ADR's front-matter `status`
  must be one of the lifecycle states, and the Decision Registry must agree with it in both
  directions (a row per file, a file per row). It cannot tell who accepted an ADR, so a status
  edited by hand passes; the required review is the gate for that. `adr-status` now updates
  the registry row too, then dispatches `spec-lint` on the PR branch, because its
  workflow-token commit does not trigger `pull_request` (other required checks are not
  re-run; see `docs/repo-setup.md` §6). Constitution C4 records the new coverage and stays
  `partial`.
- `spec-lint` fails a filled-in project whose required documents, `SPEC_VERSION.md` or active
  change directories still carry the scaffold's own placeholder markers (`[Product Name]`,
  `[Name]`, `[Task Title]`, `[Title]`, `[Date]`, `[x.x]`; `[name]` or a `YYYY-MM-DD` date as a
  table cell or after a `**Label:**`). It is a fixed list, not every template hint. HTML
  comments, fenced and inline code, and links (including reference-style ones) are ignored,
  so prose does not trip it; fences are read as GitHub renders them. Constitution C1 records
  it. A leftover backlog template block now fails
  instead of silently switching the task checks off.
- The relationship between the spec's Revision History and `SPEC_VERSION.md` is written down
  (`SPEC_VERSION.md` → "Two version records"): the history may advance while `Draft`;
  `SPEC_VERSION.md` moves only on acceptance and amendments. `spec-lint` fails a `sustain`
  project whose two records disagree, whose `SPEC_VERSION.md` is missing, or whose records
  hold a version it cannot compare (dotted numbers, optionally `v`-prefixed), and warns under
  `greenfield` once the spec is `Accepted`.
- `CHANGE-NNNN` numbering is defined (the next free four-digit number, never a tracker id),
  and `docs/changes/README.md` gains a Change Registry. `spec-lint` fails a change directory
  not named `CHANGE-NNNN` (and any other directory under `docs/changes/` besides `archive/`),
  a change with no registry row or with a row whose Status disagrees with its `proposal.md`,
  a row whose directory is gone, and a malformed or duplicated registry ID.
- The second half of the change lifecycle is enforced. `spec-lint` fails a `Delivered` or
  `Archived` change outside `docs/changes/archive/`, an archived change that was never
  delivered or that no `SPEC_VERSION.md` Changelog row cites, a PR that archives a change
  without also changing `SPEC_VERSION.md` (the citing row at the Current Version) and the
  living spec, and a PR that deletes a change. Under `sustain`, delivering means archiving: a PR
  that edits `docs/spec/**` must archive the change it delivers. A change whose
  every task box is ticked while it is still active warns. The proposal's state machine
  (`Proposed → Accepted → Delivered → Archived`) is spelled out. Constitution C3 records the
  mechanics and stays `partial`: whether a folded spec edit matches its delta, and whether a
  change that shipped was ever delivered, are review-only.
- `Spec Reference` values resolve. In backlog tasks, change tasks and the PR body, a `§N` must
  be a numbered heading of `technical-spec.md` (or a section the named change's
  `spec-delta.md` touches), and a `CHANGE-NNNN` must exist, active or archived. A reference
  into another document, or in prose, is still accepted on presence alone, and `spec-lint`
  prints a note naming each one. Constitution C1 stays `partial`.

### Changed

- The `technical-spec.md` template starts at version `0.1`, matching `SPEC_VERSION.md`. It
  said `1.0`, so the starter shipped the very disagreement it now checks for.

### Changed

- **Breaking:** `sdd.config.yml` must declare `process.mode` (`greenfield` | `sustain`),
  and `spec-lint` holds the project to it: `greenfield` fails on any `docs/changes/CHANGE-*`
  directory; `sustain` requires an `Accepted` technical spec and fails a PR that edits
  `docs/spec/**` without delivering a change. Constitution C3 moves from
  `unenforced` to `partial`. **Migrating:** add `mode:` under `process:` in
  `sdd.config.yml` — `greenfield` while you are still writing the spec, `sustain` if it is
  accepted and you already work through `docs/changes/`. Without it `spec-lint` fails.

### Fixed

- `spec-lint` no longer accepts a blank or dash-only `Spec Reference` table cell, in a
  backlog task or the PR body. Its pattern captured the cell's closing pipe, so a blank cell
  read as `|` and passed the presence check.
- The `spec-lint` workflow no longer passes an empty `PR_BODY` on pushes to `main`, which a
  filled-in project would read as a PR with no Spec Reference.

## [0.1.1] - 2026-08-07

### Fixed

- Synced the optional forge-md interop contract (`docs/ecosystem/forge-md.md`) with
  forge-md `ADR-0025`: added the reserved `BEHAVIOR` kind (`docs/spec/behavior/*.feature`,
  multi) and the `@AC-`/C10 behaviour axis, and marked the sdd-starter side of the contract
  `accepted` at `1.0` (dated 2026-08-07) — closing the drift between the two mirrors. The
  contract version stays `1.0` (the kind was already part of the ratified definition). (#44)

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

[Unreleased]: https://github.com/Vedoma/sdd-starter/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/Vedoma/sdd-starter/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/Vedoma/sdd-starter/releases/tag/v0.1.0
