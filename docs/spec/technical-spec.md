# Technical Specification: [Product Name]

<!--
PHASE 3 — TECHNICAL SPECIFICATION (SINGLE SOURCE OF TRUTH)
Instructions: This is the canonical engineering reference. All implementation work
traces back to sections of this document. 

Rules:
- Every design decision must be documented or referenced to an ADR
- Mark decisions that need an ADR with: [ADR CANDIDATE: brief description]
- Mark unresolved technical questions in Section 9
- Never silently edit accepted sections — use the amendment process in SPEC_VERSION.md
-->

**Version:** 1.0 | **Status:** Draft | **Last Updated:** YYYY-MM-DD  
**PRD Reference:** [docs/product/prd.md](../product/prd.md)  
**Spec Owner:** [Name]

---

## 1. System Overview

<!--
2–3 paragraphs describing the system's purpose, its operating environment,
and the primary technical constraints that shaped this design.
-->

[System description here]

### 1.1 Architecture Diagram

<!-- 
Use a Mermaid C4 Level 2 diagram (System Context or Container diagram).
Paste the diagram code below and it will render on GitHub.
-->

```mermaid
graph TD
    User["User\n[Browser / Mobile]"] -->|HTTPS| FE["Frontend\n[Technology]"]
    FE -->|REST/GraphQL| API["Backend API\n[Technology]"]
    API --> DB["Database\n[Technology]"]
    API --> EXT["External Service\n[e.g., Auth Provider]"]
```

### 1.2 Technology Stack

| Layer | Technology | Version | Rationale | ADR |
|-------|-----------|---------|-----------|-----|
| Frontend | | | | |
| Backend | | | | |
| Database | | | | |
| Cache | | | | |
| Infrastructure | | | | |
| Auth | | | | |
| CI/CD | | | | |
| Monitoring | | | | |

---

## 2. Component Specifications

<!--
One subsection per major component. A component is an independently deployable or
logically distinct unit. Do not conflate layers (e.g., "frontend" and "auth service"
are separate components even if they share a server).
-->

### 2.1 [Component Name]

- **Responsibility:** [Single-sentence description — what this component exclusively owns]
- **Technology:** [From stack table above]
- **Interface:** [How other components interact with it — sync/async, protocol, data format]
- **State:** [What state does it hold? Where is state persisted?]
- **Scaling strategy:** [Horizontal / Vertical / Stateless / N/A]
- **Failure modes:** [What happens when this component fails? Graceful degradation?]
- **Security boundary:** [What auth/authz controls apply at this boundary?]

### 2.2 [Component Name]

<!-- Repeat for each component -->

---

## 3. API Contracts

<!-- 
Full endpoint specifications live in docs/spec/api-contracts.md
This section defines conventions that apply to ALL endpoints.
-->

**Full contracts:** [docs/spec/api-contracts.md](./api-contracts.md)

### 3.1 Global Conventions

- **Base URL:** `https://api.[domain]/v1`
- **Authentication:** Bearer token in `Authorization` header
- **Content-Type:** `application/json` for all request/response bodies
- **Error format:** RFC 7807 Problem Details
  ```json
  {
    "type": "https://api.[domain]/errors/[error-slug]",
    "title": "Human-readable error title",
    "status": 400,
    "detail": "Specific description of this error instance",
    "instance": "/path/to/resource"
  }
  ```
- **Pagination:** Cursor-based [or offset-based — choose one and document it]
- **Versioning strategy:** URL path versioning (`/v1/`, `/v2/`)
- **Rate limiting:** [X] requests per minute per authenticated user

### 3.2 Endpoint Index

| Method | Path | Auth | Description | FR Reference |
|--------|------|------|-------------|--------------|
| | | | | |

---

## 4. Data Model

<!--
Full entity definitions live in docs/spec/data-model.md
This section covers high-level entity relationships.
-->

**Full model:** [docs/spec/data-model.md](./data-model.md)

### 4.1 Entity Overview

| Entity | Description | Key Relationships |
|--------|-------------|------------------|
| | | |

### 4.2 Key Invariants

<!--
Business rules that must always be true at the database level.
These become database constraints and application-layer validations.
-->

- [Invariant 1: e.g., "A user must have exactly one active session at a time"]
- [Invariant 2]

---

## 5. Security Specification

<!--
Every item here maps to NFR-003 or NFR-004 from the PRD.
Be specific — "secure" is not a spec. "AES-256-GCM with keys managed by AWS KMS" is a spec.
-->

| Area | Specification | NFR Reference |
|------|--------------|---------------|
| **Authentication** | [Mechanism — e.g., JWT (RS256), 15-min access token, 7-day refresh token] | NFR-003 |
| **Authorization** | [Model — e.g., RBAC with roles: admin, editor, viewer] | NFR-003 |
| **Transport** | TLS 1.2+ enforced, HSTS enabled | NFR-003 |
| **Data at rest** | [Encryption standard] | NFR-004 |
| **Secrets management** | [Tool — e.g., AWS Secrets Manager, HashiCorp Vault] | NFR-003 |
| **Input validation** | All inputs validated at API boundary; allowlist approach | NFR-003 |
| **Audit logging** | [Which actions are logged, where logs are stored, retention period] | NFR-003 |
| **Dependency scanning** | [Tool — e.g., Dependabot, Snyk] — run in CI on every PR | NFR-003 |

---

## 6. Performance Targets

| Operation | P50 Target | P95 Target | P99 Target | NFR Reference |
|-----------|-----------|-----------|-----------|---------------|
| [Read API] | | | | NFR-001 |
| [Write API] | | | | NFR-001 |
| [Page load — LCP] | | | | NFR-002 |
| [Background job] | | | | |

---

## 7. Environment Configuration

<!--
All required environment variables. No secrets with actual values — use placeholders.
Mark variables required at runtime vs. build time.
-->

| Variable | Description | Example Value | Required | Stage |
|----------|-------------|---------------|----------|-------|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@host:5432/db` | Yes | Runtime |
| `JWT_SECRET` | JWT signing key | `[use secrets manager]` | Yes | Runtime |
| `[VAR_NAME]` | [Description] | `[example]` | Yes/No | Runtime/Build |

---

## 8. Third-Party Integrations

| Service | Purpose | SDK / API Version | Auth Method | Fallback Behaviour |
|---------|---------|-------------------|-------------|-------------------|
| | | | | |

---

## 9. Open Technical Questions

<!--
Every unresolved technical decision lives here until it is resolved.
Resolution either updates the spec or produces an ADR.
-->

| # | Question | Owner | Due Date | Resolution |
|---|----------|-------|----------|-----------|
| 1 | | | | |
| 2 | | | | |

---

## 10. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | YYYY-MM-DD | [Name] | Initial draft |

---

<!--
NEXT STEPS:
1. Generate docs/spec/data-model.md using Master Prompt MP-04
2. Generate docs/spec/api-contracts.md using Master Prompt MP-05
3. For each [ADR CANDIDATE] note above, generate an ADR using Master Prompt MP-06
-->
