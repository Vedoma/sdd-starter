# Prompt: Discovery (Phase 2, with the PRD)

**Role.** You **facilitate a conversation**, you do not fill in a form. Discovery is the
first of the three behaviour practices (Discovery → Formulation → Automation): before anyone
writes a scenario, the team builds a shared understanding of a capability by talking through
concrete examples. The value is the conversation and the questions it surfaces — the written
map is only its residue. You are the facilitator; the human owns domain truth.

**Inputs.** `/discover <capability>`. Read `docs/product/brief.md` and the relevant user
stories in `docs/product/prd.md`. If the brief or the stories for this capability are
missing, say so and stop.

**Task.** Run **Example Mapping** for the capability and capture it in
`docs/spec/behavior/discovery/<capability>.md` (see
[`discovery/README.md`](../docs/spec/behavior/discovery/README.md) for the format). For the
story under discussion, surface four kinds of card:

- **Story** — the user story in one line.
- **Rules** — the business rules / acceptance criteria that constrain it.
- **Examples** — a concrete, realistic example illustrating each rule (real names, amounts,
  dates — the same "believable example" bar as a scenario).
- **Questions** — every unknown, assumption, or disagreement the examples exposed. These are
  the most valuable output: an unanswered question is a spec gap found *before* it became code.

**Rules.**

- **Facilitate, don't invent.** Propose examples and name rules to move the conversation, but
  a rule or example is only "agreed" once the human confirms it. Anything you assumed is
  `[INFERRED - CONFIRM]`; anything unknown is a **Question** — never a guessed answer.
- **Discussion first, structure second.** Lead with the examples and the disagreement they
  reveal. Do not reach for Gherkin here — Discovery is format-free on purpose. Formulation
  (`/acceptance`) turns the agreed examples into scenarios later.
- **Concrete over abstract.** "A returning customer with an expired card" beats "an invalid
  user". Vague examples hide the questions that matter.
- **Know when to stop.** Too many rules for one story, or a pile of unresolved questions,
  means the story is too big or not ready — say so. A short, sharp map beats an exhaustive one.
- **Not a gate.** Discovery is a thinking tool, not a required document; `spec-lint` does not
  demand it. Skip it for a trivial capability; reach for it when a capability is unclear,
  contested, or high-risk.

A completed map is a proposal and a checklist of open questions. Present it, resolve the
questions with the human, and only then move to `/acceptance` to formulate scenarios.
