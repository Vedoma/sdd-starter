## Spec Compliance Checklist

<!--
Every PR must fill in this template. Incomplete templates block merge.
Rule: If you implemented anything not in the spec, or differently than specified,
document it in "Spec Deviations" below — never leave it undocumented.
-->

### References

| Field | Value |
|-------|-------|
| **Spec Reference** | §[section(s) from technical-spec.md — required] |
| **Task Reference** | TASK-[XXX] |
| **ADR Reference** | ADR-[XXXX] *(or "N/A")* |
| **Milestone** | M[X] |

---

### What This PR Implements

<!--
One paragraph. Describe WHAT was built and WHERE in the spec it comes from.
Reference the spec section, not the code. Do not describe how the code works.
-->

---

### Acceptance Criteria — Verified by This PR

<!--
Copy the acceptance criteria from the backlog task. Check each one.
All must be checked before requesting review.
-->

- [ ] [AC from TASK-XXX]
- [ ] [AC from TASK-XXX]
- [ ] [AC from TASK-XXX]

---

### Spec Deviations

<!--
If you implemented anything NOT in the spec, or differently than the spec describes,
document it here precisely. This is not optional — undocumented deviations are defects.

If there are zero deviations, check the box below and leave the list empty.
-->

- [ ] **No deviations** — this PR implements exactly what the spec describes

**If deviations exist, list them:**

| Deviation | Reason | Spec Amendment Needed? |
|-----------|--------|----------------------|
| [What differs from spec] | [Why the deviation was necessary] | Yes (AMEND-ID) / No |

---

### Test Coverage

- [ ] Unit tests cover all acceptance criteria
- [ ] Integration tests updated (if this PR touches cross-component behaviour)
- [ ] All tests pass locally (`[your test command]`)
- [ ] No existing tests were deleted or weakened without justification

---

### Security

- [ ] No secrets, API keys, or credentials committed
- [ ] All user inputs validated at the API boundary
- [ ] Auth/authz rules from `docs/spec/technical-spec.md §5` are respected

---

### Spec Amendment Required?

- [ ] **No** — this PR is fully within the current spec
- [ ] **Yes** — I have created/updated the spec amendment: `AMEND-[YYYY-MM-DD]-[SEQ]` and updated `SPEC_VERSION.md`

---

### Reviewer Notes

<!--
Optional. Anything you want the reviewer to pay special attention to,
or context that will help them understand the PR faster.
-->
