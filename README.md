# SDD Starter — Spec-Driven Development Repository

> **Version:** 1.0 | **Principle:** The Specification is the Single Source of Truth. Code serves the Spec — the Spec never serves the Code.

This repository is a ready-to-use scaffold for Spec-Driven Development (SDD). Clone it, rename it, and start from Phase 1. Every folder, template, and workflow file is pre-wired.

---

## What Is SDD?

Spec-Driven Development is a methodology in which a living, versioned specification document governs all phases of the project lifecycle — from ideation through deployment. Every implementation decision is traceable to a written requirement; every architectural trade-off is recorded in a formal decision log.

**Core rule:** No code is written without a corresponding spec entry. No spec entry is left un-implemented or un-rejected.

---

## Repository Structure

```
.
├── docs/
│   ├── product/
│   │   ├── brief.md              ← Phase 1: Product Brief (fill this first)
│   │   └── prd.md                ← Phase 2: Product Requirements Document
│   ├── spec/
│   │   ├── technical-spec.md     ← Phase 3: Master Technical Specification (SSoT)
│   │   ├── data-model.md         ← Phase 3: Entity & schema definitions
│   │   └── api-contracts.md      ← Phase 3: API endpoint specifications
│   ├── adr/
│   │   ├── README.md             ← ADR index with status table
│   │   └── ADR-0001-template.md  ← Phase 4: Copy this for each new decision
│   └── plan/
│       ├── milestones.md         ← Phase 5: Delivery roadmap
│       └── backlog.md            ← Phase 5: Granular task backlog
├── src/                          ← Phase 6: Implementation (add your code here)
├── tests/                        ← Phase 6: Spec-derived tests
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md  ← Enforces spec reference on every PR
└── SPEC_VERSION.md               ← Current spec version + changelog
```

---

## The 6-Phase Workflow

| # | Phase | Start Here | Output |
|---|-------|-----------|--------|
| 1 | Idea Crystallization | `docs/product/brief.md` | Product Brief |
| 2 | Requirements Definition | `docs/product/prd.md` | PRD |
| 3 | Technical Specification | `docs/spec/technical-spec.md` | Tech Spec + Data Model + API Contracts |
| 4 | Architecture Decisions | `docs/adr/` | ADR set |
| 5 | Implementation Planning | `docs/plan/` | Milestones + Backlog |
| 6 | Guided Implementation | `src/` + `tests/` | Code with full spec traceability |

---

## Getting Started

1. **Clone this repo** and rename it to your project
2. **Delete placeholder content** inside each template (everything between `<!-- -->` markers or in `[BRACKETS]`)
3. **Start with `docs/product/brief.md`** — fill in the Problem Statement, Target User, and Value Proposition
4. **Work phase by phase** — do not skip to implementation before the spec is accepted
5. **Every PR must fill in** `.github/PULL_REQUEST_TEMPLATE.md` — spec reference is mandatory

---

## Key Rules

The binding principles live in **[`constitution.md`](./constitution.md)** - each with the
CI/review mechanism that enforces it. In short: the spec is the single source of truth;
spec overreach is a defect; accepted specs are never edited silently (use the
`SPEC_VERSION.md` amendment process); ADRs are immutable (supersede, never overwrite);
tests derive from acceptance criteria; no secrets in the repo; every change is reviewable
and reversible. Read the constitution for the full, enforceable list.

---

## Scaling This Repo

| Project Size | Mandatory | Optional |
|---|---|---|
| Solo / Small Tool | Brief, Tech Spec, 1–3 ADRs, Backlog | PRD, Data Model (inline in spec is fine) |
| Team / Mid-size App | All documents | Split spec by domain |
| Enterprise | All documents + ADR registry + change control | Per-service spec files |

---

## License

This scaffold is released under the MIT License. Use it freely for commercial and open-source projects.
