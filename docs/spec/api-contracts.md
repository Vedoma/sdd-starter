# API Contracts: [Product Name]

<!--
PHASE 3 — API CONTRACTS
Instructions: Define every endpoint with enough precision that an engineer (or AI)
can implement it without asking a single clarifying question.

Rules:
- Every endpoint must reference the FR (Functional Requirement) it implements
- Every possible response status must be documented
- Request/response schemas must be complete — no "etc." or "..."
- Changes to this document after acceptance require a spec amendment (SPEC_VERSION.md)
-->

**Version:** 1.0 | **Status:** Draft | **Last Updated:** YYYY-MM-DD  
**Tech Spec Reference:** [docs/spec/technical-spec.md §3](./technical-spec.md)  
**Spec Owner:** [Name]

---

## Global Conventions

See `docs/spec/technical-spec.md §3.1` for base URL, auth, error format, pagination, and rate limiting.

**Error response format (RFC 7807):**
```json
{
  "type": "https://api.[domain]/errors/[error-slug]",
  "title": "Human-readable error title",
  "status": 400,
  "detail": "Specific description of this error instance",
  "instance": "/v1/[path-that-caused-error]"
}
```

---

## Authentication Endpoints

---

### POST /v1/auth/register

**Purpose:** Register a new user account.  
**Auth required:** No  
**FR Reference:** FR-001  
**Rate limit:** 10 requests per hour per IP

**Request body:**
```json
{
  "email": "string (required, RFC 5321, max 255 chars)",
  "password": "string (required, min 8 chars, max 128 chars)"
}
```

**Example request:**
```bash
curl -X POST https://api.[domain]/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepassword123"}'
```

**Responses:**

| Status | Meaning | Body |
|--------|---------|------|
| `201 Created` | User registered successfully | `{ "id": "uuid", "email": "string", "created_at": "ISO8601" }` |
| `400 Bad Request` | Validation error (invalid email, weak password) | RFC 7807 error |
| `409 Conflict` | Email already registered | RFC 7807 error |
| `429 Too Many Requests` | Rate limit exceeded | RFC 7807 error |
| `500 Internal Server Error` | Unexpected server error | RFC 7807 error |

**Business rules enforced:**
- Email stored as lowercase, trimmed
- Password hashed with bcrypt (cost factor ≥ 12) before storage
- Plain-text password never logged or returned

---

### POST /v1/auth/login

**Purpose:** Authenticate a user and return access + refresh tokens.  
**Auth required:** No  
**FR Reference:** FR-001  
**Rate limit:** 20 requests per 15 minutes per IP

**Request body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Responses:**

| Status | Meaning | Body |
|--------|---------|------|
| `200 OK` | Login successful | `{ "access_token": "JWT", "refresh_token": "string", "expires_in": 900 }` |
| `400 Bad Request` | Missing required fields | RFC 7807 error |
| `401 Unauthorized` | Invalid credentials | RFC 7807 error (use generic message — do not reveal which field was wrong) |
| `429 Too Many Requests` | Rate limit exceeded | RFC 7807 error |
| `500 Internal Server Error` | | RFC 7807 error |

**Business rules enforced:**
- Return identical error for wrong email and wrong password (prevent user enumeration)
- Access token TTL: 15 minutes. Refresh token TTL: 7 days.
- Refresh token is single-use; invalidated on use and replaced

---

## Resource Endpoints

<!-- Replace "Resource" with your actual entity name -->

---

### GET /v1/resources

**Purpose:** List all resources owned by the authenticated user.  
**Auth required:** Yes (any role)  
**FR Reference:** FR-002  

**Query parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `cursor` | string | No | Pagination cursor from previous response |
| `limit` | integer | No | Items per page. Default: 20. Max: 100. |
| `status` | string | No | Filter by status: `draft`, `published`, `archived` |

**Example request:**
```bash
curl https://api.[domain]/v1/resources?limit=20&status=published \
  -H "Authorization: Bearer [access_token]"
```

**Responses:**

| Status | Meaning | Body |
|--------|---------|------|
| `200 OK` | Success | `{ "data": [...], "next_cursor": "string\|null", "total": integer }` |
| `401 Unauthorized` | Invalid or expired token | RFC 7807 error |
| `500 Internal Server Error` | | RFC 7807 error |

**Response item schema:**
```json
{
  "id": "uuid",
  "title": "string",
  "status": "draft | published | archived",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

---

### POST /v1/resources

**Purpose:** Create a new resource.  
**Auth required:** Yes (role: `admin` or `editor`)  
**FR Reference:** FR-003  

**Request body:**
```json
{
  "title": "string (required, 3–500 chars)",
  "status": "string (optional, default: 'draft')"
}
```

**Responses:**

| Status | Meaning | Body |
|--------|---------|------|
| `201 Created` | Resource created | Full resource object |
| `400 Bad Request` | Validation error | RFC 7807 error |
| `401 Unauthorized` | | RFC 7807 error |
| `403 Forbidden` | Insufficient role | RFC 7807 error |
| `500 Internal Server Error` | | RFC 7807 error |

---

### GET /v1/resources/:id

**Purpose:** Retrieve a single resource by ID.  
**Auth required:** Yes  
**FR Reference:** FR-002  

**Path parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | UUID | Resource identifier |

**Responses:**

| Status | Meaning | Body |
|--------|---------|------|
| `200 OK` | Found | Full resource object |
| `401 Unauthorized` | | RFC 7807 error |
| `403 Forbidden` | Resource belongs to another user | RFC 7807 error |
| `404 Not Found` | Resource does not exist | RFC 7807 error |
| `500 Internal Server Error` | | RFC 7807 error |

---

### PATCH /v1/resources/:id

**Purpose:** Partially update a resource.  
**Auth required:** Yes (owner or admin)  
**FR Reference:** FR-003  

**Request body:** All fields optional; include only fields to update.
```json
{
  "title": "string (3–500 chars)",
  "status": "draft | published | archived"
}
```

**Business rules enforced:**
- Cannot transition status from `archived` → `draft` directly (must go through `published`)
- [ADR CANDIDATE: State machine for resource status transitions]

**Responses:**

| Status | Meaning | Body |
|--------|---------|------|
| `200 OK` | Updated | Full updated resource object |
| `400 Bad Request` | Invalid field or disallowed status transition | RFC 7807 error |
| `401 Unauthorized` | | RFC 7807 error |
| `403 Forbidden` | Not owner or admin | RFC 7807 error |
| `404 Not Found` | | RFC 7807 error |
| `409 Conflict` | Optimistic lock conflict | RFC 7807 error |
| `500 Internal Server Error` | | RFC 7807 error |

---

### DELETE /v1/resources/:id

**Purpose:** Delete a resource permanently.  
**Auth required:** Yes (role: `admin` only)  
**FR Reference:** FR-004  

**Responses:**

| Status | Meaning | Body |
|--------|---------|------|
| `204 No Content` | Deleted | Empty |
| `401 Unauthorized` | | RFC 7807 error |
| `403 Forbidden` | Not admin | RFC 7807 error |
| `404 Not Found` | | RFC 7807 error |
| `500 Internal Server Error` | | RFC 7807 error |

---

## OpenAPI 3.1 Specification

<!--
Replace this block with the full OpenAPI YAML for your API.
Generate using Master Prompt MP-05 from the Tech Spec.
You can paste the output into https://editor.swagger.io to validate.
-->

```yaml
openapi: 3.1.0
info:
  title: "[Product Name] API"
  version: "1.0.0"
  description: "API specification for [Product Name]"
servers:
  - url: https://api.[domain]/v1
    description: Production
  - url: https://api-staging.[domain]/v1
    description: Staging
# Add full paths, components/schemas, and securitySchemes here
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | YYYY-MM-DD | [Name] | Initial draft |
