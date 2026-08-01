# Journeys — the product-level behavioural altitude

This directory holds the **few end-to-end happy paths that define the product** — the
"if these work, the product works" flows. They are the *higher* of the two behavioural
altitudes; the detailed, per-capability scenarios live one level up in
[`../`](../) (`docs/spec/behavior/*.feature`).

| Altitude | Scope | Authored | Volume | Home |
| --- | --- | --- | --- | --- |
| **Journeys** *(this dir)* | product-level, end-to-end happy paths + critical rules | Phase 2, with the PRD | few, very stable | `docs/spec/behavior/journeys/*.feature` |
| **Features** | one capability's detailed behaviour | Phase 3, with the spec | many, more volatile | `docs/spec/behavior/*.feature` |

## Thin by rule (the anti-drift discipline)

A journey asserts the **flow and the outcome**, and **references** the feature scenarios for
the detail — it does not restate them. This is the one rule that keeps the two altitudes from
duplicating each other and drifting apart:

- **Do** name the steps of the flow at product level ("Given a registered customer", "When
  she checks out", "Then the order is confirmed").
- **Do** tag each journey `@journey` and cite the feature scenarios it traverses by their
  `@AC-` ids, so the detail has one home and the trace is explicit.
- **Don't** re-specify a rule a feature scenario already owns (the exact error text, the
  lockout count). If you feel the urge, that detail belongs in the feature scenario; link it.
- **Keep it short.** A journey longer than the flow it names is a feature scenario in
  disguise. If it needs many steps or branches, it is at the wrong altitude — push the detail
  down to a feature.

See [`example.feature`](./example.feature) for the shape.

## When to use journeys (opt-in)

Journeys are **optional and additive**. Add them when the product has **multi-step,
cross-capability flows** whose end-to-end success is the real definition of "it works" — a
checkout, an onboarding, a booking. A single-capability tool or a library usually does not
need a journey layer; its feature scenarios already say everything.

They are **not separately gated**: `spec-lint`'s behaviour check requires feature-level
scenarios (the detail), and journeys sit on top when the product warrants them. Do not add a
journey just to have one — an empty ceremony at the top altitude is worse than none.

## Discovery, Formulation, Automation apply here too

A journey is discovered and formulated like any behaviour — often *first*, because the
end-to-end flow is what the product is *for*. Automating journeys is a deliberate, selective
choice (they are the slowest, highest-value end-to-end tests); see
[`../../../../tests/README.md`](../../../../tests/README.md).
