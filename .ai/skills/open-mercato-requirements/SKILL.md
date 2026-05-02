---
name: open-mercato-requirements
description: Phase 2a of Open Mercato SDD. Use to elicit functional and non-functional requirements that feed the PRD, with explicit attention to tenancy, ACL, and platform constraints.
---

# Skill: Open Mercato Requirements

## When to Use

- The Phase 1 gate has passed (`brief.md` and `open-mercato-fit.md` are Accepted).
- The PRD has not been written yet, or it is missing requirements specific to Open Mercato (tenancy, ACL, integrations).

This skill produces the *requirement set*. The PRD skill (`open-mercato-prd`) consumes it and shapes the final document.

## Required Inputs

Walk the user through the following groups. Ask one group at a time.

1. **Functional requirements**
   - For each persona × outcome from the Brief, what user-visible capability is needed?
   - What is the happy path? Two or three error paths?

2. **Tenancy & organization**
   - Tenant-only or tenant + organization scoping?
   - Cross-tenant visibility allowed? If yes, who and why?
   - Onboarding: self-serve, invite-only, or platform-provisioned?

3. **Roles & ACL**
   - What roles exist beyond `superadmin`, `admin`, `staff`, `customer`?
   - For each role, list capabilities in plain English. The ACL feature strings come later.

4. **Integrations**
   - External systems the product talks to (in / out).
   - Required latency / availability targets for each.
   - Failure-mode expectations.

5. **Non-functional requirements**
   - Performance (p95 latency budgets per surface).
   - Compliance (GDPR, PCI, SOC2, etc.).
   - Auditability (who needs to see what trail).
   - Localization, accessibility, supported browsers.

6. **Constraints carried from Phase 1**
   - Restate the Open Mercato fit constraints. Confirm none of the requirements above contradict them.

## Outputs

This skill does not produce a final document by itself. It produces:

- A structured requirements brief that feeds `open-mercato-prd`.
- Updates to `docs/product/brief.md` if Phase 2 reveals defects in Phase 1 (use the amendment process).

## Phase Gate (partial — full gate is in `open-mercato-prd`)

- [ ] Every persona × outcome pair has at least one functional requirement.
- [ ] Tenancy model is explicit (tenant-only vs tenant + org).
- [ ] Each role has plain-English capabilities listed.
- [ ] Each integration has latency / availability / failure expectations.
- [ ] No requirement contradicts the Phase 1 Open Mercato constraints.

## Hand-off

Pass the structured requirements to `open-mercato-prd` to produce the PRD document.
