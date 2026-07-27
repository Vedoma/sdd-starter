# Design Spec: [Product Name]

<!--
PHASE 3 — DESIGN SYSTEM (visual/UX single source of truth)
This document is to the UI what technical-spec.md is to the architecture: the ideas an
implementer (human or agent) must obey so generated UI stays coherent instead of being
reinvented per screen.

Required for UI products (SaaS, web app, mobile); optional/minimal for CLI, library, and
data-pipeline profiles — see sdd.config.yml. If your profile does not require it, delete
this file or keep only sections 1, 5, and 6.

Rules:
- Sections 2 (Tokens) and 7 (Anti-patterns) are machine-checkable — spec-lint scans diffs
  for hardcoded colors/fonts. Be concrete: name tokens, not adjectives.
- Escalate real design trade-offs to an ADR (docs/adr/), linked from section 8.
- Mark inferred choices [INFERRED - CONFIRM] and gaps [OPEN - REQUIRES INPUT].
-->

**Version:** 0.1 | **Status:** Draft | **Last Updated:** YYYY-MM-DD
**PRD Reference:** [docs/product/prd.md](../product/prd.md)

---

## 1. Design Principles

<!-- 3-6 principles that decide trade-offs. Each is a stance, not a platitude. -->

- [Principle 1 — e.g. "Density over decoration: this is a tool, not a landing page."]
- [Principle 2]

## 2. Design Tokens

<!--
The single source of visual values. NEVER hardcode these in components — reference the
token. spec-lint flags raw hex colors and font names in the diff.
-->

### Color

| Token | Value | Usage |
| --- | --- | --- |
| `color.bg` | `#[hex]` | Page background |
| `color.fg` | `#[hex]` | Primary text |
| `color.accent` | `#[hex]` | Primary action |
| `color.border` | `#[hex]` | Dividers, input borders |
| `color.danger` | `#[hex]` | Destructive actions, errors |

### Typography

| Token | Value |
| --- | --- |
| `font.sans` | `[family stack]` |
| `font.mono` | `[family stack]` |
| `text.scale` | `[e.g. 12 / 14 / 16 / 20 / 28]` |

### Spacing, radius, shadow, motion

| Token | Value |
| --- | --- |
| `space.scale` | `[e.g. 4 / 8 / 12 / 16 / 24 / 32]` |
| `radius` | `[e.g. 2px — keep it small]` |
| `shadow` | `[token or "none"]` |
| `motion.duration` | `[e.g. 150ms]` |

## 3. Primitives / Components

<!-- The component inventory. "Do not reinvent a button." List what exists and its states. -->

| Component | States | Notes |
| --- | --- | --- |
| Button | default / hover / active / disabled / loading | primary, secondary, ghost |
| Input | default / focus / error / disabled | — |
| [Card, Modal, Toast, Table, ...] | | |

## 4. Layout & Responsive

<!-- Breakpoints, grid, and the mobile stance. -->

- **Breakpoints:** [e.g. mobile < 640, tablet < 1024, desktop >=]
- **Grid / max width:** [e.g. 12-col, content max 1200px]
- **Mobile:** [what reflows, what collapses]

## 5. Accessibility

<!-- A release gate (constitution C6), not a nice-to-have. -->

- Target: **WCAG [AA]**.
- Color contrast >= [4.5:1 body / 3:1 large].
- All interactive elements keyboard-reachable; visible focus ring (`[token]`).
- Semantic HTML / ARIA for [components]; motion respects `prefers-reduced-motion`.

## 6. Content & Voice

<!-- Optional. Microcopy tone, capitalization, error-message style. -->

- Voice: [e.g. plain, direct, no marketing tone].
- Errors state what happened and the next action.

## 7. Anti-patterns

<!-- The "never do" list. spec-lint and review enforce these. -->

- No hardcoded colors, fonts, or shadows — reference a token from section 2.
- No new font families beyond `font.sans` / `font.mono`.
- No border radius larger than `radius`.
- No reimplementing a primitive that already exists in section 3.
- [Project-specific anti-patterns]

## 8. Design Decisions → ADR

<!-- Non-trivial design choices get an ADR; link them here. -->

- [ADR-NNNN — e.g. "Component library vs hand-rolled primitives"]
