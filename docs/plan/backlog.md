# Implementation Backlog: [Product Name]

<!--
PHASE 5 — IMPLEMENTATION BACKLOG
Instructions: Decompose each milestone into granular tasks.
Each task must be completable in a single focused session (1–4 hours).

Rules:
- Every task MUST have a Spec Reference to the exact spec section it implements
- Every task MUST have 2–5 verifiable acceptance criteria (binary checkboxes)
- Tasks for AI-assisted implementation MUST include "Do Not" constraints
- BLOCKING tasks must be completed before their dependents can start
- Task IDs are sequential and never reused; closed tasks stay in the backlog
-->

**Spec Version:** [x.x] | **Last Updated:** YYYY-MM-DD

---

## Milestone 0 — Foundation

---

### TASK-001: Initialise Repository Structure

| Field | Value |
|-------|-------|
| **Spec Reference** | §1.2 (Tech Stack), §7 (Environment Config) |
| **ADR Reference** | ADR-0001 (if stack choice is decided) |
| **Milestone** | 0 |
| **Priority** | P0 |
| **Effort** | S (< 1 hour) |
| **Blocked By** | — |
| **Assigned To** | [Name / AI] |
| **Status** | To Do |

**Context:**
Set up the canonical folder structure so all subsequent tasks have a consistent home. This task has no feature logic — it is purely structural scaffolding.

**Implementation Instructions:**
1. Create folder structure per `README.md` (src/, tests/, docs/ are already present in this repo)
2. Add language-appropriate `.gitignore`
3. Create `src/` and `tests/` directories with `.gitkeep` placeholders
4. Verify the structure matches `docs/spec/technical-spec.md §1.1`

**Acceptance Criteria:**
- [ ] All folders defined in the spec exist in the repo
- [ ] `.gitignore` excludes build artifacts, secrets files (`.env`), and OS files
- [ ] `README.md` setup instructions are accurate and tested

**Do Not:**
- Add any application code in this task
- Install dependencies in this task (that is TASK-002)

---

### TASK-002: Configure CI/CD Pipeline

| Field | Value |
|-------|-------|
| **Spec Reference** | §1.2 (CI/CD row in tech stack table) |
| **ADR Reference** | — |
| **Milestone** | 0 |
| **Priority** | P0 |
| **Effort** | M (2–3 hours) |
| **Blocked By** | TASK-001 |
| **Assigned To** | [Name] |
| **Status** | To Do |

**Context:**
A passing CI pipeline is the exit criterion for M0. No feature code is merged until this is green on a clean branch.

**Implementation Instructions:**
1. Create `.github/workflows/ci.yml` (or equivalent for your CI provider)
2. Configure jobs: lint → unit tests → integration tests → security scan → build check
3. Ensure the pipeline runs on: push to `main`, all pull requests
4. Configure branch protection: PRs require passing CI before merge

**Acceptance Criteria:**
- [ ] CI pipeline runs automatically on PR creation
- [ ] CI fails if any lint error, test failure, or build error exists
- [ ] CI passes on a clean repository with placeholder tests
- [ ] Branch protection rules are active on `main`
- [ ] Pipeline runtime < 5 minutes on a typical PR

**Do Not:**
- Configure deployment in this task (staging deployment is TASK-003)
- Add environment secrets to the pipeline yet — use placeholder values

---

### TASK-003: Provision Staging Environment

<!-- Copy and fill in TASK-001 block structure for each new task -->

| Field | Value |
|-------|-------|
| **Spec Reference** | §7 (Environment Configuration), §8 (Third-Party Integrations) |
| **ADR Reference** | — |
| **Milestone** | 0 |
| **Priority** | P0 |
| **Effort** | M |
| **Blocked By** | TASK-002 |
| **Assigned To** | [Name] |
| **Status** | To Do |

**Context:**
All integration tests and QA work happens in staging. Staging must mirror production configuration as closely as possible.

**Implementation Instructions:**
1. Provision staging infrastructure per §7 environment variables
2. Configure all third-party services for staging (use test/sandbox credentials)
3. Apply baseline database migration to staging
4. Verify each environment variable in `.env.example` is set in staging
5. Add automated health check endpoint to confirm staging is live

**Acceptance Criteria:**
- [ ] All environment variables from `.env.example` are configured in staging
- [ ] Database migrations run successfully against staging database
- [ ] Health check endpoint (`GET /health`) returns `200 OK` in staging
- [ ] Deployment to staging is triggered automatically on merge to `main`

**Do Not:**
- Use production credentials in staging
- Expose staging to the public internet without auth protection

---

## Milestone 1 — [Name]

<!-- 
Add tasks below following the same TASK-XXX pattern.
Increment task numbers sequentially across all milestones.
-->

---

### TASK-004: [Task Title]

| Field | Value |
|-------|-------|
| **Spec Reference** | §[x.x] |
| **ADR Reference** | ADR-[XXXX] (if applicable) |
| **Milestone** | 1 |
| **Priority** | P0 / P1 / P2 |
| **Effort** | S / M / L / XL |
| **Blocked By** | TASK-[XXX] (or —) |
| **Assigned To** | [Name / AI] |
| **Status** | To Do |

**Context:**
[2–3 sentences explaining the purpose of this task and how it fits the broader system. Reference the spec section.]

**Implementation Instructions:**
1. [Step 1 — specific, referencing the spec where relevant]
2. [Step 2]
3. [Step 3]

**Acceptance Criteria:**
- [ ] [Criterion 1 — binary, verifiable without interpretation]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

**Acceptance Scenarios** *(when `capabilities.behavior` is on):*
- The `@AC-…` scenarios in `docs/spec/behavior/` this task must make pass — e.g.
  `@AC-login-2`, `@AC-login-3`. These are authored in Phase 3; a task cites them, it does
  not invent them. `/implement` makes exactly these green and never weakens them.

**Do Not:**
- [Anti-pattern or constraint — what should NOT be done in this task]

---

## Dependency Graph

<!--
Update this diagram as tasks are added. Blockers must be listed above their dependents.
-->

```mermaid
graph TD
    T001["TASK-001\nInit Repo"] --> T002["TASK-002\nCI/CD"]
    T002 --> T003["TASK-003\nStaging"]
    T003 --> T004["TASK-004\n[M1 First Task]"]
```

---

## Backlog Status Summary

| Status | Count |
|--------|-------|
| To Do | 4 |
| In Progress | 0 |
| Done | 0 |
| Blocked | 0 |

<!-- Update this table manually or via a script as task statuses change -->
