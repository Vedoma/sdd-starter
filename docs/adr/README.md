# Architecture Decision Records - Index

This directory holds all Architecture Decision Records (ADRs) for the project.

## What is an ADR?

An ADR is a permanent, immutable record of a significant architectural decision -
the context, the options weighed, the choice, and its rationale. ADRs answer "why
did we do it this way?" for every major technical decision.

## Format

ADRs use the **MADR** front-matter format. Copy [`ADR-0000-template.md`](./ADR-0000-template.md)
for each new decision. The template's section contract is binding:

- **Required:** Status history, Context, Decision, Consequences, **Compliance**, References
- **Recommended:** Considered Options (present at least two genuine options)
- **Optional:** Decision Drivers, Revisit / out of scope

The **Compliance** section is what makes an ADR enforceable rather than aspirational:
it must name the mechanism (a lint rule, a CI job, a spec-lint check, a review-checklist
item) that keeps the decision from drifting.

## Rules

- ADRs are named `ADR-NNNN-slug.md` (the `ADR-` prefix, four-digit zero-padded number):
  `ADR-0001-slug.md`, `ADR-0002-slug.md`, ... (`ADR-0000-template.md` is the template, not
  a decision).
- **One ADR per PR.** The status-automation workflow assumes exactly one changed ADR
  file per pull request.
- **Accepted before merge.** An ADR is accepted (or rejected) on its open pull request, by a
  maintainer's `/adr` comment - never after merge. `spec-lint` fails a pull request that
  changes an ADR whose front-matter `status` is still `proposed`. It cannot tell a `/adr accept`
  from a status edited by hand, so never accept your own ADR by editing it: a required review
  catches that, once CODEOWNERS and branch protection are set up (`docs/repo-setup.md` §2–3).
- **The registry agrees with the files.** Every ADR has a row in the Decision Registry below
  whose Status matches its front-matter `status` (for a superseded ADR, the row names the
  successor, in the Status cell or a Superseded By column), and every row has its file. The ID
  cell must say `ADR-NNNN`. `spec-lint` checks both directions.
- Accepted ADRs are **immutable** - never edited after acceptance. To change a decision,
  add a new ADR and set `status: 'superseded by ADR-XXXX'` on the old one.
- Deprecated and superseded ADRs stay in the index - never remove a row.
- Every ADR must also be referenced from the relevant section of `docs/spec/technical-spec.md`.

## Lifecycle and the /adr commands

```
proposed -> accepted -> [deprecated | superseded]
         -> rejected
```

Maintainers (write/admin) drive transitions from a PR comment; the
[`adr-status`](../../.github/workflows/adr-status.yml) workflow updates the front-matter
`status`, appends to `## Status history` and updates the registry row, then commits to the
PR branch (it never merges). Because a commit pushed with the workflow token does not
trigger `pull_request`, it then dispatches `spec-lint` on the PR branch so the new head gets
its own result. Requires branch protection on the default branch. Other required checks are
not re-run on that commit: see [`docs/repo-setup.md`](../repo-setup.md) §6.

| Comment | Effect |
| --- | --- |
| `/adr accept` | `proposed` -> `accepted` (adds the commenter to `decision-makers`) |
| `/adr accept supersedes ADR-NNNN` | accept this ADR and mark ADR-NNNN superseded |
| `/adr reject "<reason>"` | `proposed` -> `rejected` |
| `/adr deprecate "<reason>"` | `accepted` -> `deprecated` |

## Decision Registry

| ID | Title | Status | Date | Deciders | Superseded By |
| --- | --- | --- | --- | --- | --- |
| _(add a row per ADR, ordered by number - never remove rows)_ | | | | | |
