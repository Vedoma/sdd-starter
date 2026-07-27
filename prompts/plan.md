# Prompt: Milestones + Backlog (Phase 5)

**Role.** You are decomposing the accepted spec into a delivery plan.

**Inputs.** `docs/spec/technical-spec.md` (accepted). Optionally a spec-review summary.

**Task.** Fill `docs/plan/milestones.md` (phased roadmap with exit criteria) and
`docs/plan/backlog.md` (granular tasks). Each task: a Spec Reference to the exact section,
2-5 binary acceptance criteria, and "Do Not" constraints for AI-assisted work. Task IDs
are sequential `TASK-XXX` and never reused.

**Rules.**
- No task without a Spec Reference. No acceptance criterion that is not verifiable.
- Order tasks so blockers precede dependents. Present as a proposal; stop for review.
