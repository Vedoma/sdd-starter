# Repository Setup — the settings the constitution assumes

Several constitution clauses are enforced by GitHub settings rather than by code in this
repository. Those settings cannot be committed, so they are written down here: this file is
the checklist that makes them auditable instead of assumed.

Until this checklist is done, `spec-lint` still runs but nothing **blocks** a merge — the
checks are advisory. C8 in particular ("every change is reviewable and reversible") is
entirely a settings-level guarantee.

## 1. Required status checks

Add all four as required checks on the default branch. Names match the `name:` field of
each workflow:

| Check | Workflow | Enforces |
| --- | --- | --- |
| `spec-lint` | [spec-lint.yml](../.github/workflows/spec-lint.yml) | C1, C3, C4, C5 |
| `self-test` | [self-test.yml](../.github/workflows/self-test.yml) | that spec-lint itself still works |
| `secret-scan` | [secret-scan.yml](../.github/workflows/secret-scan.yml) | C7 |

`self-test` matters more than it looks: without it, a change that breaks the linter turns
every other check into a pass.

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

## 4. Secret scanning license (organisation-owned repos only)

`gitleaks-action` v2 is free for public and personal repositories. **Organisation-owned**
repositories require a paid `GITLEAKS_LICENSE` repository secret. If you do not have one,
switch `secret-scan.yml` to the license-free container invocation documented in its header
comment — otherwise C7's gate will fail or be skipped rather than protect you.

## 5. Local hook (each contributor, optional but recommended)

```bash
git config core.hooksPath .githooks
```

This runs `spec-lint` pre-commit with `STAGED=true`, which also activates the C3 amendment
check against the staged index — catching an unamended edit to an accepted spec before the
commit exists rather than in review.

## 6. Actions permissions

Default `GITHUB_TOKEN` permissions can stay read-only; each workflow requests exactly what
it needs. Note that `adr-status.yml` requests `contents: write` in order to push a status
commit to the PR branch, and deliberately executes its script from the **default branch**
rather than from the pull request — see the comment on that step before changing it.

## Verifying the setup

Open a throwaway PR that deliberately violates a clause — e.g. add a backlog task with one
acceptance criterion — and confirm the merge button is blocked, not merely annotated. A gate
you have not watched fail is a gate you have not got.
