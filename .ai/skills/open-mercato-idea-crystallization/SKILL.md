---
name: open-mercato-idea-crystallization
description: Phase 1 of Open Mercato SDD. Use when a user has a raw product idea and you need to produce a Product Brief and an Open Mercato fit assessment before any further specification work.
---

# Skill: Open Mercato Idea Crystallization

## When to Use

- The user has an idea but no Product Brief yet, OR the Brief exists but predates the Open Mercato fit lens.
- The product is, or might be, built on the Open Mercato platform.
- You are the Open Mercato SDD Agent (see `docs/prompts/open-mercato-sdd-agent.md`).

Do **not** use this skill if a Brief is already accepted and the fit assessment is already GO.

## Required Inputs

Ask the user for:

1. **Problem statement** — one paragraph, with evidence.
2. **Primary persona** — role, context, frequency of the pain.
3. **Value proposition** — `For X who Y, the product is Z that delivers W, unlike alternative A.`
4. **3–5 success outcomes**, each with a measurable signal.
5. **Out-of-scope list** — what v1 will not do.
6. **Open Mercato fit answers** — the seven-question checklist in `docs/product/open-mercato-fit.md`.

If any input is missing, file it as an Open Question; do not invent it.

## Outputs

Files this skill creates or updates:

- `docs/product/brief.md` — filled-in Product Brief.
- `docs/product/open-mercato-fit.md` — fit checklist, constraints, GO / NO-GO decision.

Both documents move to status `Draft` immediately and are promoted to `Accepted` only after the Phase Gate.

## Phase Gate

Advance to Phase 2 only when **all** of the following are true:

- [ ] `brief.md` has no blank required sections (Problem, Persona, Value Prop, Outcomes, Out-of-Scope).
- [ ] Open Mercato fit decision is `GO` or `GO with caveats` (and caveats are listed).
- [ ] At least one measurable signal per success outcome.
- [ ] All Open Questions in `brief.md` have an Owner and a Due Date.
- [ ] User has explicitly approved both documents.

If the fit decision is `NO-GO`, stop the Open Mercato workflow entirely and recommend an alternative platform via an ADR.

## SDD Docs Validated by This Skill

- `docs/product/brief.md` (creates / updates)
- `docs/product/open-mercato-fit.md` (creates / updates)

## Hand-off

On gate pass, hand to `open-mercato-requirements` (Phase 2). Carry forward:
- The persona definition.
- The success outcomes and their signals.
- The Open Mercato constraints from the fit assessment.
