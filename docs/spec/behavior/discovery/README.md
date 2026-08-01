# Discovery — the conversation before the scenarios

This directory holds the **residue of Discovery**, the first of the three behaviour
practices:

| Practice | Question it answers | Phase | Output |
| --- | --- | --- | --- |
| **Discovery** *(here)* | Do we share an understanding of the behaviour? | 2, with the PRD | an example map (`.md`) |
| **Formulation** | Can we write that agreement as concrete examples? | 3, `/acceptance` | `../*.feature` scenarios |
| **Automation** | Does the system actually do it? | 6, `/implement` | `tests/` (selective — see below) |

Discovery is **the** high-value practice: a room (or an agent and a human) talking through
concrete examples of a capability *before* building it, catching the misunderstandings and
missing rules while they are still a sentence, not a sprint. The written map is secondary —
what matters is the shared understanding and the **questions** the conversation exposes.

## Example Mapping

`/discover <capability>` runs [Example Mapping](https://cucumber.io/blog/bdd/example-mapping-introduction/):
for one user story, sort the discussion into four kinds of card.

- **Story** — the user story, one line.
- **Rule** — a business rule or acceptance criterion that constrains the story.
- **Example** — a concrete, realistic illustration of a rule (real names, amounts, dates).
- **Question** — an unknown, assumption, or disagreement the examples exposed. **The most
  valuable output.** An unanswered question here is a spec gap found before it became code.

See [`example.md`](./example.md) for the shape. Keep a map short: many rules or a pile of
unresolved questions means the story is too big or not ready — split it or answer the
questions first.

## What Discovery is *not*

- **Not Gherkin.** Discovery is deliberately format-free — plain rules and examples, in
  whatever words fit the domain. Turning agreed examples into scenarios is *Formulation*
  (`/acceptance`), which happens next, in Phase 3.
- **Not a gate.** `spec-lint` does not require a discovery map. It is a thinking tool: skip
  it for a trivial capability, reach for it when one is unclear, contested, or high-risk.
- **Not a record of decisions.** Binding decisions become ADRs; requirements become the PRD.
  A map is working material — once its questions are answered and its examples are formulated
  into scenarios, it has done its job.

## From here to Formulation

The agreed **Examples** are the raw material `/acceptance` formulates into `@AC-`tagged
scenarios; the resolved **Questions** feed the PRD and the technical spec. A rule with no
example is under-specified; an example nobody can turn into an observable scenario is a sign
the behaviour is not yet understood — go back to the conversation.
