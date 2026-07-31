# /acceptance - Phase 5b: Acceptance Scenarios

Load and obey [`constitution.md`](../../constitution.md) first (binding principles),
then follow the canonical prompt at [`prompts/acceptance.md`](../../prompts/acceptance.md). The prompt
file is the source of truth for this phase - do not duplicate its content here.

Usage: `/acceptance TASK-XXX`. Turns that task's acceptance criteria into Gherkin scenarios under `docs/spec/behavior/`, BEFORE implementation. Produces `.feature` files only - no code, no step definitions.

Present the result as a proposal and stop for human review before saving or committing.
