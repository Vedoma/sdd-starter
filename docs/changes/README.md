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
- **Deliver:** when the change ships, apply the delta to `docs/spec/**`, add an amendment
  row to `SPEC_VERSION.md` (version bump), and move the change directory to `archive/`.
- **Archive, never delete.** Archived changes are the durable record of *why* the spec
  looks the way it does; they are out of the default agent context, not gone.

Delivered backlog tasks move to [`docs/plan/archive/`](../plan/archive/) by the same
principle - the active `docs/plan/backlog.md` holds only open work.

## Relationship to greenfield

You do not have to start greenfield. For an existing codebase, write a minimal
`docs/spec/technical-spec.md` describing what is *already* true, then drive all further
work through `docs/changes/`. This is the "brownfield first" path OpenSpec popularized,
here in plain Markdown with no CLI dependency.
