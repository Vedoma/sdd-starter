# /pr-review - Pull request review

Load and obey [`constitution.md`](../../constitution.md) first (binding principles),
then follow the canonical prompt at
[`prompts/pr-review.md`](../../prompts/pr-review.md). The prompt file is the source of
truth for this - do not duplicate its content here.

Usage: `/pr-review [PR]`. Review is not a numbered phase; it applies to every PR.
(Not `/review`: that name is Claude Code's built-in alias for `/code-review`, which a
project command does not override.)

Verify each finding before you report it, and say what you did not check.

Present the review as a draft and stop: posting it, approving and merging are a human's.
