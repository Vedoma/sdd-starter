# Contributing to sdd-starter

Thanks for taking the time. This scaffold is opinionated, and its opinions are stated
where they belong - not restated here. Two files are the actual rules:

- [`constitution.md`](./constitution.md) - the binding principles (C1–C10). Read it first.
  Every contribution must satisfy it, and `spec-lint` enforces the machine-checkable parts.
- [`AGENTS.md`](./AGENTS.md) - the operational manual (which phase you are in, which
  command to run, when to stop for a human). This applies whether "you" are a person or
  an AI agent.

If you use Claude Code, Cursor, or Copilot, the same conventions load automatically via
[`CLAUDE.md`](./CLAUDE.md), [`.cursor/rules/sdd.mdc`](./.cursor/rules/sdd.mdc), and
[`.github/copilot-instructions.md`](./.github/copilot-instructions.md).

Everything below is the mechanics of *how* to contribute - not what the rules are.

## Ways to contribute

- **Report a bug in the scaffold itself** - a script that fails, a workflow that lies, a
  template that no longer matches what the docs describe. Use the Bug report issue form.
- **Propose an addition or change to the scaffold** - a new prompt phase, a template
  improvement, better CI checks, tighter enforcement of an existing principle. Use the
  Feature request issue form, or start a Discussion if the shape isn't obvious yet.
- **Adopt the scaffold and share what happened** - Discussions are the place for
  "here's how we adapted `.sdd/` for our team". This is genuinely useful feedback.

Please **search open issues and discussions first** to avoid duplicates.

## The workflow

Small, atomic changes only. One concern per pull request.

1. **Fork the repo** (or branch, if you have write access).
2. **Branch from `main`**. Use a descriptive name: `feat/`, `fix/`, or `docs/` prefix
   matches the existing history.
3. **Make the change**. If you're editing a prompt, workflow, or template, verify the
   references (`spec-lint`, hooks, docs) still line up.
4. **Run `node scripts/spec-lint.mjs` locally** before pushing. CI runs the same check
   and will block merge on failure.
5. **Open a pull request against `main`**. Fill in the PR template completely - the
   Spec Compliance Checklist is required, and the template's own instructions explain
   the "N/A" cases (see [PR #27](https://github.com/Vedoma/sdd-starter/pull/27) for a
   scaffold-level example).

The PR template is enforced by CI; skipping fields blocks merge.

## Non-negotiables (see the constitution for the full list)

The rules below break most often and are the fastest way to get a PR rejected. They're
here to save you a review cycle - not to duplicate the constitution.

- **The spec is the source of truth.** No code without a corresponding spec entry (C1).
  For this repo, the "spec" is `docs/spec/technical-spec.md`; it's still a template, so
  `spec-lint` is in **scaffold mode** and skips the Spec Reference check. Scaffold-level
  changes therefore mark the field `N/A - scaffold-level change`.
- **No spec overreach** (C2). If you find yourself changing more than the change ticket
  asks, stop - open a follow-up instead.
- **ADRs are immutable once accepted** (C4). Supersede with a new ADR; never edit or
  delete a settled one.
- **Tests come from acceptance criteria, not from the implementation** (C5).
- **Behaviour is specified before it's built** (C10). When `capabilities.behavior` is on,
  acceptance scenarios (`docs/spec/behavior/*.feature`) are authored in Phase 3 and carry
  `@AC-` ids the backlog cites - never reverse-engineered from the code. A backlog task that
  cites an `@AC-` id no scenario defines fails `spec-lint`.
- **No secrets in commits** (C7). Environment variables only.

Everything else - accessibility, atomic PRs, plain Markdown, portability - is in
`constitution.md`. That file wins if this one drifts.

## Licensing

By contributing, you agree that your contribution is licensed under the same terms as
the project (see [`LICENSE`](./LICENSE)). Please do not open pull requests containing
third-party code you cannot relicense under those terms.

## Code of conduct

Participation is governed by [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md). Report
violations to `conduct@vedoma.tech`.

## Security

Do not open a public issue for a security concern. See [`SECURITY.md`](./SECURITY.md).
