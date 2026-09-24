# Repository Setup — the settings the constitution assumes

Several constitution clauses are enforced by GitHub settings rather than by code in this
repository. Those settings cannot be committed, so they are written down here: this file is
the checklist that makes them auditable instead of assumed.

Until this checklist is done, `spec-lint` still runs but nothing **blocks** a merge — the
checks are advisory. C8 in particular ("every change is reviewable and reversible") is
entirely a settings-level guarantee.

## 1. Required status checks

Add this as a required check on the default branch. The name matches the workflow's
`name:` field:

| Check | Workflow | Enforces |
| --- | --- | --- |
| `spec-lint` | [spec-lint.yml](../.github/workflows/spec-lint.yml) | the checked parts of C1, C3, C4, C5 and C10 |

That is currently the **only** merge-blocking check in the repository. Read the `Status`
column in [`constitution.md`](../constitution.md) before assuming a clause is covered:
C6 and C7 name mechanisms that do not exist yet, and every clause `spec-lint` touches is
only `partial`, so requiring this one check does not make the constitution enforced — it
makes the checked half of a few clauses enforced.

## 2. Branch protection / ruleset on the default branch

- **Require a pull request before merging** — with at least **1 approval**.
- **Dismiss stale approvals when new commits are pushed.** Without this, an approval of a
  compliant diff silently carries over to a non-compliant one.
- **Require status checks to pass** — the checks in §1, with **"require branches to be up
  to date"** on. Two PRs that each pass alone can break C1 once merged together.
- **Require conversation resolution before merging** — C2 and C5 are review-enforced, so an
  unresolved review thread is an unfinished gate.
- **Block force pushes** and **restrict deletions** — C8's reversibility depends on history
  surviving.
- **Do not allow bypassing the above**, including for administrators. A gate an owner can
  step around is a gate that will be stepped around under deadline.

Branch protection is also what keeps the `adr-status` bot honest: it pushes ADR status
commits to the **PR branch**, never to trunk, and never merges.

## 3. CODEOWNERS

Fill in [`.github/CODEOWNERS`](../.github/CODEOWNERS) — it ships with every rule commented
out — then enable **Require review from Code Owners**.

Read the warning in that file first: GitHub silently ignores a rule naming an owner who
cannot review the repository, so a placeholder handle plus this setting yields a gate that
appears enabled and enforces nothing.

## 4. Secret scanning (C7) — not yet wired

C7 says "no secrets in the repository" and names a CI secret scan as its enforcement, but
**no such workflow exists in this repo**. Until one is added, C7 is a rule with no
mechanism: nothing stops a committed credential.

Enable GitHub's native push protection and secret scanning in the repository's Security
settings as an interim measure, and treat adding a scanner to CI as outstanding work.

## 5. Local hook (each contributor, optional but recommended)

```bash
git config core.hooksPath .githooks
```

This runs `spec-lint` before each commit, so a finding surfaces locally rather than in
review.

## 6. Actions permissions

Default `GITHUB_TOKEN` permissions can stay read-only; each workflow requests exactly what
it needs.

One thing to know before enabling the `/adr` flow: `adr-status.yml` requests
`contents: write`, checks out the **pull request's** branch, and then runs that branch's own
copy of `.github/scripts/adr-status.mjs`. So a maintainer typing `/adr accept` executes
PR-authored code with a write-scoped token. Cross-fork pull requests are rejected and the
commenter must already have write access, which keeps the blast radius to existing
collaborators — but "already trusted" is not a reason to hand a pull request a privileged
token.

Reading that script from the default branch instead is a small change and is **outstanding
work**, not something this checklist can configure. Until it lands, treat `/adr accept` on a
branch you have not reviewed as running code you have not reviewed.

## Verifying the setup

Open a throwaway PR that deliberately violates a clause — e.g. add a backlog task with one
acceptance criterion — and confirm the merge button is blocked, not merely annotated. A gate
you have not watched fail is a gate you have not got.

One trap while you do this: spec-lint skips the task checks for the whole of
`docs/plan/backlog.md` if the string `[Task Title]` appears anywhere in it, and reports
"passed" either way. Delete the shipped template block before you conclude the gate works.
