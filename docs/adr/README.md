# Architecture Decision Records — Index

This directory contains all Architecture Decision Records (ADRs) for [Product Name].

## What Is an ADR?

An ADR is a permanent, immutable record of a significant architectural decision — capturing the context, options considered, the choice made, and the rationale. ADRs answer the question "why did we do it this way?" for every major technical decision.

## Rules

- ADRs are **numbered sequentially**: `ADR-0001`, `ADR-0002`, etc.
- Accepted ADRs are **immutable** — never edited after acceptance
- To change a decision, create a new ADR with `Status: Supersedes ADR-XXXX`
- Every ADR in the index must also be referenced in the relevant section of `docs/spec/technical-spec.md`

## When to Create an ADR

Create an ADR whenever you are:

- Choosing between two or more viable technical approaches
- Selecting a framework, library, or infrastructure provider
- Making a decision that would be costly or disruptive to reverse
- Establishing a pattern that will be repeated across the codebase
- Resolving an open question from `docs/spec/technical-spec.md §9`

## ADR Lifecycle

```
Proposed → Accepted → (years later) → Deprecated / Superseded
```

## Decision Registry

| ID | Title | Status | Date | Deciders | Superseded By |
|----|-------|--------|------|----------|---------------|
| [ADR-0001](./ADR-0001-template.md) | [Template — replace with your first decision] | Proposed | YYYY-MM-DD | [Names] | — |

<!-- 
Add a row to this table every time you create a new ADR.
Keep rows ordered by ADR number. Never remove rows — deprecated ADRs stay in the index.
-->

## Proposed ADR Queue

<!-- 
List [ADR CANDIDATE] items from technical-spec.md that still need ADRs written.
Remove items from this list as ADRs are created for them.
-->

- [ ] [Candidate 1 from technical-spec.md §X.X]
- [ ] [Candidate 2 from technical-spec.md §Y.Y]
