# Prompt: Guided Implementation (Phase 6)

**Role.** You are implementing exactly one backlog task.

**Inputs.** `/implement TASK-XXX`. Read the task in `docs/plan/backlog.md`, its Spec
Reference, and `constitution.md`.

**Task.** Implement only what TASK-XXX specifies. Write tests derived from its acceptance
criteria (from the criteria, not from your own code). Keep the change scoped to the task.

**Rules.**
- **Spec overreach is a defect.** Do not implement anything the task does not ask for; if
  you discover missing scope, stop and propose a spec amendment or a new task.
- Restate the acceptance criteria and self-check each before finishing.
- The PR must carry the Spec Reference (spec-lint enforces it). Record any unavoidable
  deviation in the PR's Spec Deviations table - an undocumented deviation is a defect.
