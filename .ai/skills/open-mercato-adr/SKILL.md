---
name: open-mercato-adr
description: Phase 4 of Open Mercato SDD. Use to author Architecture Decision Records that resolve the open questions surfaced during the Technical Specification phase, with Open Mercato-specific decision categories preloaded.
---

# Skill: Open Mercato ADR

## When to Use

- One or more `[OPEN QUESTION]` entries exist in the Tech Spec or its companion docs.
- The team needs to make a load-bearing architectural choice (data store, eventing, multi-region, etc.) that affects future work.
- A previously accepted ADR is being superseded.

Do **not** use this skill for low-impact, easily reversible choices — those go in code review, not ADRs.

## Required Inputs

- The list of open questions from Phase 3.
- For each, the user's preferred direction and at least one alternative.

## Outputs

- One file per decision, named `docs/adr/ADR-XXXX-<slug>.md`, copied from `docs/adr/ADR-0001-template.md` with status moving Proposed → Accepted (or Rejected / Superseded).
- An updated entry in `docs/adr/README.md` index.
- A reference back to the ADR ID from every spec section that depended on the resolved question.

## Open Mercato-Specific Decision Categories

When you read the open questions, sort them into these categories — they recur across Open Mercato projects, and each has known trade-offs you should surface:

| Category | Typical Question | Trade-offs to Make Explicit |
|----------|------------------|------------------------------|
| Tenancy boundary | tenant-only vs tenant + organization | Data isolation, query cost, support workflows |
| ACL granularity | coarse `module.manage` vs fine `module.resource.action` | Audit fidelity vs config burden |
| CRUD factory deviation | Use factory vs hand-roll a route | Consistency vs custom UX |
| Command vs direct write | Always commands vs direct repo writes for hot paths | Auditability vs throughput |
| Eventing semantics | At-most-once vs at-least-once for `[event]` | Duplicate handling cost vs loss tolerance |
| Migration style | Online expand-contract vs offline window | Downtime vs deploy complexity |
| Webhook delivery | In-process vs queued | Latency vs reliability |
| Multi-region | Active-active vs active-passive vs single-region | Cost, latency, conflict resolution |
| External provider choice | Provider A vs B for `[concern]` | Lock-in, cost, feature parity |

For each ADR, the **Consequences** section should include a row per affected spec document (e.g., `acl-matrix.md`, `module-map.md`).

## Phase Gate

Advance to Phase 5 only when **all** are true:

- [ ] Every `[OPEN QUESTION]` from Phase 3 is either resolved by an ADR or explicitly deferred (with owner and due date).
- [ ] Every ADR has status `Accepted`, `Rejected`, or `Superseded`. No `Proposed` ADRs block Phase 5 unless the user accepts the risk in writing.
- [ ] `docs/adr/README.md` index is up to date.
- [ ] Every accepted ADR has a back-reference inserted into the relevant spec section.
- [ ] `SPEC_VERSION.md` is bumped if a new ADR changed an accepted spec.

## Hand-off

On gate pass, hand to `open-mercato-implementation-plan` (Phase 5).
