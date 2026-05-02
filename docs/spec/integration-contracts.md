# Integration Contracts

> **Phase 3 — Technical Specification, Open Mercato Lens**  
> Defines the external-facing contracts (REST, webhooks, events, SDK shapes) that the product publishes or consumes. Every contract must have an OpenAPI definition or an equivalent typed schema.

**Version:** 0.1 | **Last Updated:** YYYY-MM-DD  
**Spec Reference:** `docs/spec/technical-spec.md`, `docs/spec/api-contracts.md`

---

## Contract Categories

1. **Outbound REST APIs** — HTTP endpoints the product exposes to other systems.
2. **Inbound integrations** — third-party APIs the product calls.
3. **Webhooks** — events the product emits over HTTP to external subscribers.
4. **Domain events** — events on the internal Open Mercato event bus that other modules may subscribe to.
5. **Commands** — write-path entrypoints invoked through the platform command bus.

Each section below uses the same shape: the contract's identifier, version, ACL/auth, and the OpenAPI / schema artifact that backs it.

---

## 1. Outbound REST APIs

| Endpoint | Module | OpenAPI Ref | Auth / ACL | Idempotency | Pagination | Notes |
|----------|--------|-------------|------------|-------------|-----------|-------|
| `GET /api/[module-a]/[resource]` | `[module-a]` | `openapi/[module-a].yaml#/paths/~1api~1[module-a]~1[resource]/get` | `[module-a].[resource].read` | n/a | cursor | |
| `POST /api/[module-a]/[resource]` | `[module-a]` | `…/post` | `[module-a].[resource].write` | `Idempotency-Key` header | n/a | Backed by `Create[Resource]Command` |

OpenAPI files live under `openapi/` in the implementation repo (or wherever the project conventionally stores them). CI must run a contract test that diffs the live route against the OpenAPI definition.

---

## 2. Inbound Integrations

| Provider | Purpose | Auth | Failure Mode | Retry / Backoff | Spec Ref |
|----------|---------|------|--------------|-----------------|----------|
| `[stripe]` | Payment capture | API key per tenant | Surface as `PaymentFailed` event | exp backoff up to 3× | `technical-spec.md` §Payments |

Document, for every external dependency:
- What happens during outage
- Whether a circuit breaker is in place
- Where credentials live (envvars, secret manager — see `docs/ops/environment.md`)

---

## 3. Webhooks (Outbound Events Over HTTP)

| Event | Trigger | Payload Schema | Delivery | Replay Policy |
|-------|---------|----------------|----------|---------------|
| `[resource].created` | After `Create[Resource]Command` succeeds | `openapi/webhooks.yaml#/components/schemas/[Resource]CreatedEvent` | HTTPS POST, signed with HMAC-SHA256 | Exponential backoff 5×, then dead-letter |

Webhook subscribers register through the admin UI; the registration UI must itself be ACL-gated.

---

## 4. Internal Domain Events

| Event | Emitter Module | Subscribers | Schema | At-Most-Once / At-Least-Once |
|-------|---------------|-------------|--------|------------------------------|
| `[resource].created` | `[module-a]` | `[audit-log]`, `[search-indexer]` | TypeScript type in `module-a/events.ts` | At-least-once |

Internal events are not part of the public contract, but other modules in this repo depend on them — treat changes the same way as breaking API changes.

---

## 5. Commands

| Command | Module | Triggered By | ACL Feature | Side Effects |
|---------|--------|--------------|-------------|--------------|
| `Create[Resource]Command` | `[module-a]` | `POST /api/[module-a]/[resource]`, admin UI form | `[module-a].[resource].write` | Inserts row, emits `[resource].created` |
| `Update[Resource]Command` | `[module-a]` | `PATCH /api/[module-a]/[resource]/:id` | `[module-a].[resource].write` | Updates row, emits `[resource].updated` |

Commands are the only sanctioned path for non-trivial writes. Direct repository writes are reviewed as a defect unless explicitly justified.

---

## OpenAPI Verification Workflow

1. Author or update `openapi/<module>.yaml`.
2. Run the contract validation script (project-specific — typically `pnpm openapi:check` or equivalent).
3. CI runs the same script. Drift between OpenAPI and runtime fails the build.
4. Breaking changes require an ADR and a version bump in `SPEC_VERSION.md`.

---

## Validation Checklist

- [ ] Every public REST route appears in §1 and has a corresponding OpenAPI ref.
- [ ] Every external dependency in §2 has a documented failure mode.
- [ ] Every webhook in §3 has a payload schema and signing scheme.
- [ ] Every command in §5 has an ACL feature listed in `docs/spec/acl-matrix.md`.
- [ ] CI runs the OpenAPI verification script.
