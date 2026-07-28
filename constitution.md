# Project Constitution

The binding, near-immutable principles that govern how this project is built. Every other
artifact - spec, ADR, design, backlog, code - must not contradict the constitution. It is
**upstream of ADRs**: an ADR may cite the constitution, never the reverse. If a decision
genuinely needs to violate a principle, that is a constitutional amendment (see below),
not an ADR.

This file is **always loaded into an agent's context** (see `AGENTS.md` and
`.claude/commands/`). But loading is not enforcement - a principle is only real if a
machine or a required review **blocks** a violation. Each clause below therefore names its
enforcement mechanism, the same discipline the ADR template's Compliance section demands.

> "Control the ideas, not the code." Under AI-generated code, craftsmanship does not
> disappear - it moves up a level, to the principles, specs, and decisions in this
> repository. This document is the highest-leverage artifact a human controls here.

## Principles

| # | Principle | Enforcement |
| --- | --- | --- |
| C1 | **The specification is the single source of truth.** No code is written without a corresponding spec entry; no spec entry is left silently un-implemented or un-rejected. | spec-lint: every PR carries a Spec Reference that resolves to a real spec section |
| C2 | **Spec overreach is a defect.** Implementing more than the spec asks is treated exactly like a bug. | PR review + the Spec Deviations table in the PR template (undocumented deviation blocks merge) |
| C3 | **Accepted specs are never edited silently.** Changes go through the amendment process. | spec-lint: a diff to an accepted spec section requires a matching `SPEC_VERSION.md` entry / `<!-- AMENDED -->` marker |
| C4 | **ADRs are immutable once accepted.** Supersede with a new ADR; never edit or delete a settled one. | CI: diff-check fails if an accepted ADR file is modified (except its status line via the adr-status workflow) |
| C5 | **Tests are derived from acceptance criteria,** not from the implementation. | PR review checklist; tests reference the TASK/AC they cover |
| C6 | **Accessibility is a release gate,** not a nice-to-have, for any user-facing surface. | spec-lint / CI a11y check (e.g. axe/pa11y) on UI profiles |
| C7 | **No secrets in the repository.** Credentials come from the environment. | CI secret scan (e.g. gitleaks) blocks merge |
| C8 | **Every change is reviewable and reversible.** Atomic PRs; one ADR per PR; changes archived, never deleted. | branch protection + one-ADR-per-PR check + archive-hygiene lint |
| C9 | **Plain Markdown, zero lock-in.** Artifacts stay portable, self-hostable, tool-agnostic. | review; no proprietary/binary artifact formats introduced without an ADR |

A principle whose enforcement is "review" (C2, C5, C9) is judgment-based - there is no full
automation, so the required PR review is the gate. Everything else is a check that fails
the build. When you add a principle, you must add its enforcement in the same PR, or it is
not a principle - it is a wish.

## Amendment process

The constitution changes rarely and deliberately - a heavier bar than a spec amendment.

1. Open a PR that edits this file and get explicit owner sign-off.
2. Bump the version below (minor for a clarification, major for a changed or removed
   principle).
3. Add a row to the changelog with the rationale.
4. If a principle changes, audit existing ADRs and specs for anything the change now
   contradicts, and open follow-up work for each.

> **Open decision (confirm on the PR):** whether the amendment log lives here (proposed)
> or as a `constitutional`-typed row in `SPEC_VERSION.md`. Proposed default: keep it here,
> since the constitution's lifecycle differs from the spec's.

## Version

**1.0** (unreleased)

### Changelog

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | (unreleased) | Initial constitution: principles C1-C9 with enforcement mapping. |
