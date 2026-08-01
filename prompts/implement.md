# Prompt: Guided Implementation (Phase 6)

**Role.** You are implementing exactly one backlog task.

**Inputs.** `/implement TASK-XXX`. Read the task in `docs/plan/backlog.md`, its Spec
Reference, the acceptance scenarios it cites in `docs/spec/behavior/*.feature` (by their
`@AC-` ids), and `constitution.md`.

**Task.** Implement only what TASK-XXX specifies. Write tests derived from its acceptance
criteria (from the criteria, not from your own code). Keep the change scoped to the task.

**Rules.**
- **Spec overreach is a defect.** Do not implement anything the task does not ask for; if
  you discover missing scope, stop and propose a spec amendment or a new task.
- **The acceptance scenarios this task cites are your oracle.** If the task lists `@AC-`
  ids (scenarios in `docs/spec/behavior/*.feature`, authored in Phase 3), implement until
  they pass, and **never weaken, delete, or rewrite a scenario to match your code.** A
  failing scenario means the code is wrong, not the scenario. If a scenario is itself
  wrong, stop and raise it - do not edit it silently.
- Restate the acceptance criteria and self-check each before finishing.
- The PR must carry the Spec Reference (spec-lint enforces it). Record any unavoidable
  deviation in the PR's Spec Deviations table - an undocumented deviation is a defect.
