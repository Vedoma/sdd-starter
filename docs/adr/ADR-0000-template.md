---
status: 'proposed'
date: 2026-01-01
decision-makers: [your-handle]
---

# ADR-NNNN: Title

<!--
Copy this file to docs/adr/ADR-NNNN-kebab-title.md for each new decision.

Lifecycle status lives in the front matter above:
  proposed | accepted | rejected | deprecated | superseded by ADR-XXXX
The "## Status history" log below records every transition with who/when/why -
the /adr slash-command workflow appends to it automatically (see
.github/workflows/adr-status.yml).

Once Status is "accepted" this record is IMMUTABLE. Do not edit a settled ADR;
supersede it with a new one. Rejected and superseded ADRs are kept as the
durable decision record - never delete them.

Section contract:
  Required:    Status history, Context, Decision, Consequences, Compliance, References
  Recommended: Considered Options - a decision record that does not say what
               else was weighed ages badly. Present at least two genuine
               options; no straw men.
  Optional:    Decision Drivers, Revisit / out of scope.
Order: Context, Decision Drivers, Considered Options, Decision, Consequences,
Compliance, Revisit / out of scope, References. Delete unused optional sections.
-->

## Status history

- 2026-01-01 - proposed by @your-handle

## Context

What is the issue that motivates this decision or change? What constraints make
it non-obvious? Write for a reader with no prior context.

## Decision Drivers

<!-- optional - delete if unused -->

- Driver 1 - a force, requirement, or constraint that picks the winner
- Driver 2

## Considered Options

<!-- recommended -->

- **Option 1** - one-line description; why it wins or loses against the drivers
- **Option 2** - ...

## Decision

Name the chosen option directly, then its concrete shape. No hedging - this is
the line future readers see first.

## Consequences

### Positive

- Benefit 1

### Negative

- Drawback 1

### Neutral

- Observation 1

## Compliance

<!--
How is this decision ENFORCED? "We agreed to X" is not enforcement. Name the
mechanism - a lint rule, a CI job, a spec-lint check, a review-checklist item.
An unenforced decision drifts. This section is what makes an ADR a governance
artifact rather than a note. (See constitution.md and the spec-lint workflow.)
-->

- [ ] Enforcement mechanism 1 (e.g. spec-lint rule, CI job, lint rule)
- [ ] This decision is referenced from the relevant section of `docs/spec/technical-spec.md`

## Revisit / out of scope

<!-- optional - delete if unused -->

- What is deliberately not decided here, and the future condition that would
  reopen it

## References

- Link to related discussions, issues, ADRs, or `docs/spec/technical-spec.md` sections
