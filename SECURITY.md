# Security Policy

`sdd-starter` is a documentation and workflow scaffold — there is no runtime, no
installed package, and no service that accepts external input. Once cloned into a
project, the files sit alongside the user's own code and templates.

That said, three things in this repository could carry a real security concern and
deserve a private report rather than a public issue:

- A supply-chain issue in a script under `scripts/` or `.github/scripts/` (arbitrary
  code execution during a lint, hook, or Action run).
- A GitHub Actions workflow that could be abused to leak secrets, escalate
  permissions, or run untrusted code from a fork.
- A prompt template in `prompts/` or an agent-instruction file (`CLAUDE.md`,
  `.cursor/rules/sdd.mdc`, `.github/copilot-instructions.md`) that could be used to
  exfiltrate a downstream project's data or credentials.

Anything that looks like it could be **weaponised** against a downstream user of the
scaffold — please tell us before disclosing.

## How to report

Email **security@vedoma.tech** with:

- A description of the issue and where it lives in the repo.
- The minimum steps or diff that demonstrates the problem.
- Your name / handle so we can credit you (optional).

We aim to acknowledge within **3 business days** and to have a fix, mitigation, or
public advisory ready within **30 days** of acknowledgement — sooner if the impact
warrants it.

You may also use GitHub's [private security advisory](https://github.com/Vedoma/sdd-starter/security/advisories/new)
flow if you prefer.

## Scope

- **In scope**: this repository and everything it publishes (releases, workflows,
  scripts, templates, prompts, agent-instruction files).
- **Out of scope**: bugs, correctness issues, or usability complaints — those are
  public GitHub issues. Third-party GitHub Actions we depend on — please file with
  them, then tell us so we can pin or replace.

## Supported versions

Security fixes land on `main` and are cut into the next tagged release. There is no
LTS branch; we do not backport to older tags.

## Attribution

Reporters who follow this policy will be credited in the release notes for the fix
(unless they ask to remain anonymous).
