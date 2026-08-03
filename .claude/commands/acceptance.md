# /acceptance - Phase 3: Acceptance Scenarios (behavioural spec)

Load and obey [`constitution.md`](../../constitution.md) first (binding principles),
then follow the canonical prompt at [`prompts/acceptance.md`](../../prompts/acceptance.md). The prompt
file is the source of truth for this phase - do not duplicate its content here.

Usage: `/acceptance <capability>`. Specifies a capability's observable behaviour as Gherkin scenarios under `docs/spec/behavior/`, from the PRD's user stories, as the technical spec firms up. Produces `.feature` files only - no code, no step definitions.

Present the result as a proposal and stop for human review before saving or committing.
