# Project Constitution

The binding, near-immutable principles that govern how this project is built. Every other
artifact - spec, ADR, design, backlog, code - must not contradict the constitution. It is
**upstream of ADRs**: an ADR may cite the constitution, never the reverse. If a decision
genuinely needs to violate a principle, that is a constitutional amendment (see below),
not an ADR.

This file is **always loaded into an agent's context**: `CLAUDE.md` imports it for Claude
Code, `.cursor/rules/sdd.mdc` for Cursor, `.github/copilot-instructions.md` for Copilot, and
every `.claude/commands/` wrapper loads it before its prompt. (Until `CLAUDE.md` existed this
was only true inside a `/`-command, which left implementation turns - most of the work -
ungoverned.) But loading is not enforcement - a principle is only real if a machine or a
required review **blocks** a violation. Each clause below therefore names its
enforcement mechanism, the same discipline the ADR template's Compliance section demands.

> "Control the ideas, not the code." Under AI-generated code, craftsmanship does not
> disappear - it moves up a level, to the principles, specs, and decisions in this
> repository. This document is the highest-leverage artifact a human controls here.

## Principles

The **Status** column states how much of each clause is actually enforced today. It exists
because the Enforcement column alone was read as a promise that the machinery existed, and
for several clauses it did not:

- **`automated`** — a check fails the build on violation.
- **`partial`** — part is checked; the cell says which part, and what carries the rest.
- **`review`** — judgement-based. The required PR review is the gate. Honestly unautomatable.
- **`unenforced`** — **the mechanism named here does not exist yet.** The rule still binds,
  but nothing stops you breaking it. Treat these as outstanding work, not as guarantees.

| # | Principle | Status | Enforcement |
| --- | --- | --- | --- |
| C1 | **The specification is the single source of truth.** No code is written without a corresponding spec entry; no spec entry is left silently un-implemented or un-rejected. | `partial` | `spec-lint`: the documents `sdd.config.yml` resolves to must exist, and each backlog task and PR must carry a *non-empty* Spec Reference. It checks presence only — the reference is **not** resolved against a real spec section, so a typo or a stale `§N` after renumbering passes |
| C2 | **Spec overreach is a defect.** Implementing more than the spec asks is treated exactly like a bug. | `review` | PR review + the Spec Deviations table in the PR template (undocumented deviation blocks merge). `spec-lint` warns on hardcoded hex colors in `src/` as one detectable symptom; the general case is a judgement call |
| C3 | **Accepted specs are never edited silently.** Changes go through the amendment process. | `unenforced` | The amendment process in [`SPEC_VERSION.md`](./SPEC_VERSION.md) is fully specified and **nothing checks it**. An accepted spec can currently be edited with no changelog row and no `<!-- AMENDED -->` marker. Review is the only gate |
| C4 | **ADRs are immutable once accepted.** Supersede with a new ADR; never edit or delete a settled one. | `partial` | `spec-lint` checks only that every ADR file has a row in `docs/adr/README.md`. **Immutability itself is unchecked**: editing or deleting a settled ADR passes. The `adr-status` workflow manages status transitions, but does not defend the rest of the file |
| C5 | **Tests are derived from acceptance criteria,** not from the implementation. | `partial` | `spec-lint`: every task needs >=2 acceptance-criteria checkboxes. That tests *derive from* those criteria rather than from the code is review-only — the PR checklist is the gate |
| C6 | **Accessibility is a release gate,** not a nice-to-have, for any user-facing surface. | `unenforced` | No a11y check runs. A runtime axe/pa11y gate needs your built application, so it cannot ship pre-wired — there is a template at [`.github/workflows/a11y.yml.example`](./.github/workflows/a11y.yml.example) to activate. Until then this is review-only |
| C7 | **No secrets in the repository.** Credentials come from the environment. | `unenforced` | No secret scanner runs in CI. Enable GitHub's native push protection as an interim measure and see [`docs/repo-setup.md`](./docs/repo-setup.md) §4 |
| C8 | **Every change is reviewable and reversible.** Atomic PRs; one ADR per PR; changes archived, never deleted. | `partial` | Branch protection per [`docs/repo-setup.md`](./docs/repo-setup.md) — a **settings-level** guarantee, not code. The one-ADR-per-PR rule is enforced only inside the `/adr` command, and archive hygiene is not checked at all |
| C9 | **Plain Markdown, zero lock-in.** Artifacts stay portable, self-hostable, tool-agnostic. | `review` | review; no proprietary/binary artifact format introduced without an ADR. The tooling holds itself to this too: `spec-lint` runs on stock Node with no `package.json` |
| C10 | **Behaviour is specified before it is built.** When a capability has user-facing behaviour, its acceptance scenarios are authored as concrete, human-accepted examples in Phase 3 — *before* the code — and carry stable `@AC-` ids the spec and backlog tasks cite. This is C5 made real: the acceptance criteria exist, in executable form, ahead of the implementation that must satisfy them. | `partial` | `spec-lint`: when `capabilities.behavior` is on, at least one real (non-template) scenario must exist under `docs/spec/behavior/` and carry an `@AC-` trace tag (a missing tag warns); and every `@AC-` a backlog task cites must resolve to a real scenario — a **dangling citation errors**, scenarios no task cites warn. What stays review-only is that the scenarios truly precede the code and were human-accepted, and that a task cites *all* the scenarios it should (coverage direction, not just citation validity) |

When you add a principle, you must add its enforcement **and its Status** in the same PR. A
clause whose Status you cannot honestly write is not a principle — it is a wish. Marking
something `automated` that no check blocks is the worst outcome available here: it buys the
comfort of governance while removing the substance, which is exactly what this table did
before the `Status` column was added.

The four `unenforced` and `partial` gaps above are known and deliberate to record rather
than paper over. Closing them is outstanding work; until then, do not tell yourself the
constitution is enforced.

## Amendment process

The constitution changes rarely and deliberately - a heavier bar than a spec amendment.

1. Open a PR that edits this file and get explicit owner sign-off.
2. Bump the version below (minor for a clarification, major for a changed or removed
   principle).
3. Add a row to the changelog with the rationale.
4. If a principle changes, audit existing ADRs and specs for anything the change now
   contradicts, and open follow-up work for each.

The constitution's amendment log lives **in this file** (the Changelog below), not in
`SPEC_VERSION.md`. The two artifacts have different lifecycles and different bars: a spec
amendment is routine and frequent, a constitutional amendment should be rare and needs owner
sign-off. Interleaving them in one log would blur that distinction and make "how often do
our principles change?" unanswerable at a glance.

## Version

**1.0** (unreleased)

### Changelog

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | (unreleased) | Initial constitution: principles C1-C10, each with an enforcement mechanism and a `Status` stating how much of it is actually enforced today. |

> Still unreleased, so this is one entry rather than an amendment trail. The `Status`
> column was added after an audit found several cells naming enforcement that did not
> exist (C3, C4, C6 and C7 in particular). The cells now say so instead. **C10 (behaviour
> specified before it is built)** was added alongside the `behavior` capability, with its
> `spec-lint` gate and an honest `partial` Status — the existence-and-trace half is checked,
> plus task↔scenario citation validity (a backlog task citing an `@AC-` no scenario defines
> now errors); what stays review-only is that scenarios precede the code, were human-accepted,
> and that a task cites *all* the scenarios it should. Releasing 1.0 requires the
> owner sign-off in step 1 above, and should probably wait until the `unenforced` rows have
> mechanisms behind them.
