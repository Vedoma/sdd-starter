# Environment & Configuration

> **Phase 5/6 — Operational Spec, Open Mercato Lens**  
> Documents every environment variable, secret, and runtime configuration the product needs across local, staging, and production.

**Version:** 0.1 | **Last Updated:** YYYY-MM-DD

---

## Environment Tiers

| Tier | Purpose | Open Mercato Mode | Notes |
|------|---------|-------------------|-------|
| `local` | Developer machines | dev | Docker compose for DB / services. |
| `ci` | Continuous integration | test | Ephemeral DB per job. |
| `staging` | Pre-prod validation | staging | Real integrations in sandbox mode. |
| `prod` | Production | prod | Real integrations live. |

---

## Variables

| Variable | Purpose | Required In | Owner | Example | Secret? |
|----------|---------|-------------|-------|---------|---------|
| `DATABASE_URL` | Primary Postgres connection | all | platform | `postgres://user:pass@host:5432/db` | yes |
| `OM_TENANT_ID` | Default tenant for local dev | local | platform | `tenant-dev` | no |
| `OM_AUTH_SECRET` | Identity signing key | all | platform | `<random 32 bytes>` | yes |
| `OM_FEATURE_FLAGS` | Comma-separated feature flag overrides | optional | product | `flag-a,flag-b` | no |
| `[YOUR_VAR]` | [Purpose] | [tier list] | [team] | [example] | yes/no |

Add one row per variable. Variables that are platform-defined are owned by `platform`; product-specific ones are owned by the team that introduced them.

---

## Secret Sources

| Tier | Source | Access Path |
|------|--------|-------------|
| `local` | `.env.local` (gitignored) | `pnpm dev` reads from `.env.local` automatically |
| `ci` | CI provider secret store | injected as env vars |
| `staging` / `prod` | Secret manager (e.g., AWS Secrets Manager / Vault) | resolved at boot via the platform's config loader |

Never commit secrets. `.env.example` lists variable names with placeholder values.

---

## Tenancy & Organization Defaults

- All requests must carry a tenant context (header or session). Local dev uses `OM_TENANT_ID`.
- Background jobs explicitly bind to a tenant before doing any DB work.
- Cross-tenant operations (rare) require a platform-level role and an audit-log entry.

---

## Runtime Configuration

Open Mercato config files (e.g., `open-mercato.config.ts`) declare:
- Modules to load
- Migration paths
- ACL role definitions per tenant
- Webhook dispatcher settings

Document every override the product makes to the default config. Anything that diverges from the platform defaults must be referenced in an ADR.

---

## Validation Checklist

- [ ] `.env.example` matches the table above.
- [ ] CI fails when a required variable is missing.
- [ ] Secrets never appear in logs or error messages.
- [ ] Local dev boots with only `.env.local`, no extra steps.
