# Change-based mode (post-MVP / brownfield)

The greenfield phases (1-6) bootstrap the initial living spec. **After the spec is
accepted, you never edit it ad hoc** - every change is a reviewable delta that folds back
into the living spec and is then archived. This keeps `docs/spec/**` the current truth and
keeps an agent's working context small (it reads the active tree, not the change history).

## Lifecycle

```
/change  ->  docs/changes/CHANGE-NNNN/   (proposal + spec-delta + tasks [+ design])
             review + implement
             deliver  ->  fold the delta into docs/spec/**, bump SPEC_VERSION.md
             archive  ->  docs/changes/archive/CHANGE-NNNN/
```

- **Propose:** `/change` scaffolds `CHANGE-NNNN/` from `CHANGE-0000-template/`. The delta
  marks affected spec sections `ADDED` / `MODIFIED` / `REMOVED`.
- **Deliver:** when the change ships, one pull request applies the delta to `docs/spec/**`
  (and `docs/design/**`), adds a Changelog row citing `CHANGE-NNNN` to `SPEC_VERSION.md` with
  the version bump, moves the change directory to `archive/`, and sets its Status - in
  `proposal.md` and in the registry - to `Archived`.
- **Archive, never delete.** Archived changes are the durable record of *why* the spec
  looks the way it does; they are out of the default agent context, not gone.

A proposal's `**Status:**` moves one way: `Proposed → Accepted → Delivered → Archived`.
`Delivered` and `Archived` normally land in the same delivering pull request, so a change on
the default branch is either active (`Proposed`, `Accepted`) or archived (`Delivered`,
`Archived`). `spec-lint` fails a `Delivered` or `Archived` change outside `archive/`, an
archived change that was never delivered, an archived change no `SPEC_VERSION.md` Changelog
row cites, a pull request that archives a change without also changing `SPEC_VERSION.md`
(with the citing Changelog row at the new Current Version) and the living spec, and a pull
request that deletes a change. Editing an archived change counts as delivering it again, so
archived records stay frozen. `Delivered` is still self-declared: a change whose every task box
is ticked while it is still active only warns. Whether a change that shipped was ever
delivered, and whether the folded spec edit matches the delta, are left to review.

Delivered backlog tasks move to [`docs/plan/archive/`](../plan/archive/) by the same
principle - the active `docs/plan/backlog.md` holds only open work.

## Relationship to greenfield

`sdd.config.yml → process.mode` declares which flow the project is in, and `spec-lint`
holds the project to exactly one:

- **`greenfield`** — the phases are bootstrapping the spec; `docs/spec/**` is edited
  directly. A `docs/changes/CHANGE-*` directory is an error.
- **`sustain`** — this directory's flow. `docs/spec/technical-spec.md` must declare
  `**Status:** Accepted`, and a pull request that edits `docs/spec/**` must deliver a change:
  move its `CHANGE-NNNN/` directory to `archive/` in the same pull request. The exception is a
  change's scenarios: behaviour is specified before it is built (constitution C10), so
  `docs/spec/behavior/**` may change earlier, in a pull request that also works on the active
  change whose tasks cite them.

Switch `greenfield` → `sustain` deliberately, in its own pull request, after the pull request
that accepts the spec has merged. There is no way back: archived changes under `greenfield`
are an error too.

You do not have to start greenfield. For an existing codebase, write a minimal
`docs/spec/technical-spec.md` describing what is *already* true and accept it in one pull
request, still under `greenfield`. Then set `process.mode: sustain` in a second pull request
that edits nothing under `docs/spec/`, and drive all further work through `docs/changes/`.
Doing both in one pull request fails: under `sustain` a spec edit must deliver a change, and
the first spec is not a change. This is the "brownfield first" path OpenSpec
popularized, here in plain Markdown with no CLI dependency.

## Numbering

A change lives in `docs/changes/CHANGE-NNNN/`, where `NNNN` is the **next free sequential
number** across active and archived changes, zero-padded to four digits: `CHANGE-0001`,
`CHANGE-0002`, ... Do not borrow an id from an issue tracker. A tracker's ids belong to the
tracker - GitHub, for one, numbers issues and pull requests from a single sequence - so they
are neither stable nor collision-free here, and a first change called `CHANGE-0017` implies
sixteen predecessors that never existed.

An id is permanent once its change has merged: tasks, pull requests and `SPEC_VERSION.md`
cite it, and renaming the directory reads as deleting the change (`spec-lint` fails it, C8).
A project that already merged a borrowed id keeps it; the next change takes the next number
after the highest in use.

## Change Registry

Every change has a row here, active or archived; never remove one. **Status** mirrors the
`**Status:**` line of the change's `proposal.md`, and **Delivered In** names the spec version
(`SPEC_VERSION.md`) the change folded into. `spec-lint` fails a change directory not named
`CHANGE-NNNN` (and any other directory here besides `archive/`), a change with no row, a row
whose Status disagrees with the proposal, a row whose directory is gone, and an ID that is not
`CHANGE-NNNN` or appears in more than one row.

| ID | Title | Status | Delivered In |
| --- | --- | --- | --- |
| _(add a row per change, ordered by number - never remove rows)_ | | | |
