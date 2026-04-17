# ADR-0001: [Decision Title]

<!--
PHASE 4 — ARCHITECTURE DECISION RECORD
Instructions:
- Copy this file for every new ADR: ADR-0002-[slug].md, ADR-0003-[slug].md, etc.
- Once Status is set to "Accepted", this document is IMMUTABLE.
  Changes require a new ADR with Status "Supersedes ADR-XXXX".
- Every ADR must present at least 2 genuinely viable options.
  Do not create straw-man alternatives.
- The Compliance section is mandatory — how will this decision be enforced?
- Update docs/adr/README.md after creating each ADR.
-->

**Date:** YYYY-MM-DD  
**Status:** Proposed <!-- Proposed | Accepted | Deprecated | Superseded by ADR-XXXX -->  
**Deciders:** [Names and roles]  
**Spec Reference:** [Section(s) of technical-spec.md this decision applies to]

---

## Context

<!--
2–4 sentences describing the situation that FORCED this decision.
Describe forces, constraints, and the environment — not the solution.
Write this section as if the reader has no prior context.
-->

[Describe the situation requiring a decision. What is the problem? What constraints exist? What would happen if no decision were made?]

---

## Decision Drivers

<!--
List the criteria that will determine the right choice.
Order by importance. These become the scoring dimensions in Options Considered.
-->

- **[Driver 1]:** [e.g., Must support horizontal scaling to handle peak traffic of 10k req/min]
- **[Driver 2]:** [e.g., Team has no prior production experience with X]
- **[Driver 3]:** [e.g., Must remain within $200/month infrastructure budget]
- **[Driver 4]:** [e.g., Decision must be reversible within 3 months without full rewrite]

---

## Options Considered

### Option A: [Name]

**Description:** [What this option entails — be specific enough that a new team member could implement it]

**Pros:**
- [Advantage 1 — quantify where possible]
- [Advantage 2]

**Cons:**
- [Disadvantage 1 — be honest, not dismissive]
- [Disadvantage 2]

**How it satisfies decision drivers:**
| Driver | Satisfied? | Notes |
|--------|-----------|-------|
| [Driver 1] | ✅ / ⚠️ / ❌ | [Explanation] |
| [Driver 2] | ✅ / ⚠️ / ❌ | [Explanation] |
| [Driver 3] | ✅ / ⚠️ / ❌ | [Explanation] |

---

### Option B: [Name]

**Description:** [What this option entails]

**Pros:**
- 

**Cons:**
- 

**How it satisfies decision drivers:**
| Driver | Satisfied? | Notes |
|--------|-----------|-------|
| [Driver 1] | ✅ / ⚠️ / ❌ | |
| [Driver 2] | ✅ / ⚠️ / ❌ | |
| [Driver 3] | ✅ / ⚠️ / ❌ | |

---

### Option C: [Name] *(if applicable)*

<!-- Copy Option A/B block if a third option is needed -->

---

## Decision

**Chosen option: Option [X] — [Name]**

<!--
State the decision clearly and definitively. No hedging.
This is the outcome future engineers will read first.
-->

[2–3 sentences. What was decided and why Option X best satisfies the decision drivers over the alternatives.]

---

## Rationale

<!--
Detailed explanation of the choice. Explicitly acknowledge what you are giving up
by not choosing the alternatives. A good rationale anticipates the follow-up question:
"But couldn't we have just used Option Y?"
-->

[Full rationale here. Reference specific decision drivers. Acknowledge the trade-offs honestly.]

---

## Consequences

**Positive:**
- [What becomes easier, cheaper, or better as a result of this decision]
- [What new capabilities this decision enables]

**Negative / Trade-offs:**
- [What becomes harder, more expensive, or more constrained]
- [What technical debt this decision incurs]

**Neutral:**
- [What changes but is neither clearly better nor worse]
- [What this decision forces us to decide in the future]

---

## Compliance

<!--
How will adherence to this decision be enforced in the codebase?
"We agreed to use X" is not enforcement. Linting rules, CI checks, and code review
checklists are enforcement.
-->

- [ ] [Enforcement mechanism 1: e.g., ESLint rule prohibiting import of disallowed library]
- [ ] [Enforcement mechanism 2: e.g., CI job that fails if forbidden pattern is detected]
- [ ] [Enforcement mechanism 3: e.g., Code review checklist item in PR template]
- [ ] ADR reference added to relevant section of `docs/spec/technical-spec.md`

---

## Review Date

<!--
When should this decision be reconsidered? Set a concrete date or triggering condition.
-->

[e.g., "Reconsider if monthly infrastructure costs exceed $500" or "Review at 6-month mark: YYYY-MM-DD"]

---

<!--
After this ADR is accepted:
1. Update Status from "Proposed" to "Accepted"
2. Add a row to docs/adr/README.md
3. Reference this ADR number in the relevant section of docs/spec/technical-spec.md
-->
