# Product Requirements Document: [Product Name]

<!--
PHASE 2 — REQUIREMENTS DEFINITION
Instructions: This document is derived from docs/product/brief.md.
Every requirement here must trace back to a Brief outcome or open question resolution.
Mark inferred requirements with [INFERRED - CONFIRM] and open gaps with [OPEN - REQUIRES INPUT].
-->

**Version:** 1.0 | **Status:** Draft | **Last Updated:** YYYY-MM-DD  
**Brief Reference:** [docs/product/brief.md](./brief.md) | **Author:** [Name]

---

## 1. Objectives & Success Metrics

| Objective | KPI | Target | Measurement Method |
|-----------|-----|--------|--------------------|
| | | | |
| | | | |
| | | | |

---

## 2. User Personas

### 2.1 [Primary Persona Name]

- **Role:** [Job title / context]
- **Goals:** [What they are trying to achieve]
- **Frustrations:** [What currently blocks them]
- **Technical proficiency:** [Novice / Intermediate / Expert]
- **Key quote:** "[A real or representative quote capturing their pain]"

### 2.2 [Secondary Persona Name] *(if applicable)*

- **Role:**
- **Goals:**
- **Frustrations:**
- **Technical proficiency:**

---

## 3. Functional Requirements

<!--
Group requirements by feature area. Each FR must be:
- Written in present tense with the system as subject ("The system shall...")
- Unambiguous — testable by a QA engineer
- Traceable to a Brief outcome (add outcome # in parentheses)
-->

### 3.1 [Feature Area Name]

**FR-001:** [Requirement statement] *(Brief Outcome #X)*

#### User Stories

| ID | Story | Priority |
|----|-------|----------|
| US-001 | As a [persona], I want [action] so that [outcome] | Must Have |
| US-002 | As a [persona], I want [action] so that [outcome] | Should Have |

#### Acceptance Criteria — US-001

- **Given** [system/user state precondition]
- **When** [user action or system event]
- **Then** [expected observable result]
- **And** [additional expected result, if needed]

#### Acceptance Criteria — US-002

- **Given**
- **When**
- **Then**

---

### 3.2 [Feature Area Name]

**FR-002:** [Requirement statement]

<!-- Repeat pattern above for each feature area -->

---

## 4. Non-Functional Requirements

<!--
Every NFR must have a specific, testable acceptance threshold.
No vague terms: "fast", "secure", "reliable" are not acceptable without thresholds.
-->

| ID | Category | Requirement | Acceptance Threshold | Test Method |
|----|----------|-------------|---------------------|-------------|
| NFR-001 | Performance | API response time (read operations) | p95 < 200ms | Load test with k6 |
| NFR-002 | Performance | Page initial load | LCP < 2.5s | Lighthouse CI |
| NFR-003 | Security | Authentication | OAuth 2.0 + PKCE | Security audit |
| NFR-004 | Security | Data at rest | AES-256 encryption | Audit |
| NFR-005 | Availability | Uptime SLA | 99.9% monthly | Uptime monitoring |
| NFR-006 | Accessibility | Standard | WCAG 2.1 AA | axe-core automated + manual audit |
| NFR-007 | Scalability | Concurrent users | [N] users without degradation | Load test |

---

## 5. Constraints & Assumptions

### Constraints

- **Technical:** [e.g., Must integrate with existing PostgreSQL instance]
- **Business:** [e.g., GDPR compliance required — EU users only in v1]
- **Regulatory:** [e.g., PCI-DSS if handling payments]
- **Budget:** [e.g., Infrastructure cost cap of $X/month]

### Assumptions

- [e.g., Users have access to a modern browser (Chrome 110+, Firefox 120+)]
- [e.g., Mobile is secondary — desktop-first in v1]
- [Add all assumptions that, if wrong, would invalidate requirements]

---

## 6. Dependencies

| Dependency | Type | Owner | Status | Risk if Unavailable |
|------------|------|-------|--------|---------------------|
| [Third-party service] | External API | [Vendor] | Confirmed | High — core feature blocked |
| [Internal service] | Internal | [Team] | TBC | Medium |

---

## 7. Out of Scope

<!--
Reiterate from Brief + add any new scope boundaries surfaced during PRD writing.
Be precise — ambiguous out-of-scope statements cause disputes.
-->

The following are explicitly excluded from this product version:

- [Item 1 — with brief explanation of why it's deferred]
- [Item 2]
- [Item 3]

---

## 8. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | YYYY-MM-DD | [Name] | Initial draft |

---

<!--
NEXT STEP: When PRD is reviewed and accepted by stakeholders, generate the Technical Specification.
Use Master Prompt MP-03 with this document as input to generate docs/spec/technical-spec.md
-->
