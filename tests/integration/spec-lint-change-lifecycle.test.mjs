// Tests for spec-lint's change-lifecycle check (scripts/spec-lint.mjs, section 12) and the
// sustain-mode rule that the living spec changes only by delivering a change (section 8).
//
// These test the scaffold's own tooling, not your project: each case runs spec-lint on a
// minimal filled-in sustain project (see spec-lint-fixture.mjs). Stock Node only: `node --test`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { lint, skeleton } from './spec-lint-fixture.mjs'

const SPEC = skeleton('docs/spec/technical-spec.md')
const spec = (v) =>
  SPEC.replace(/^(# .*\n)/, '$1\n**Status:** Accepted\n').replace(
    /(## 10\. Revision History\n)/,
    `$1\n| Version | Date | Author | Changes |\n|---|---|---|---|\n| ${v} | 2026-09-24 | Ada | x |\n`
  )
const specVersion = (v, rows = []) =>
  `# Spec Version Log\n\n## Current Version\n\n| Field | Value |\n|---|---|\n| **Spec Version** | ${v} |\n\n## Changelog\n\n| Version | Amendment ID | Date | Author | Summary | Affected Tasks |\n|---|---|---|---|---|---|\n| 1.0 | — | 2026-09-01 | Ada | Accepted | — |\n${rows.join('\n')}\n`
const registry = (rows) => `# Changes\n\n## Change Registry\n\n| ID | Title | Status | Delivered In |\n| --- | --- | --- | --- |\n${rows.join('\n')}\n`
const proposal = (status) => `# CHANGE-0001: A change\n\n**Status:** ${status}\n`
const tasks = (...ticks) =>
  `# Tasks - CHANGE-0001\n\n### TASK-001: Do it\n\n| Field | Value |\n| --- | --- |\n| **Spec Reference** | §1 |\n\n${ticks.map((t) => `- [${t ? 'x' : ' '}] criterion`).join('\n')}\n`

// A sustain project at spec version `v`, with `files` on top.
const run = ({ v = '1.0', log = [], files = {}, changed } = {}) =>
  lint({
    files: { 'sdd.config.yml': 'process:\n  mode: sustain\n', 'docs/spec/technical-spec.md': spec(v), 'SPEC_VERSION.md': specVersion(v, log), ...files },
    env: changed ? { CHANGED_FILES: changed.join('\n') } : {},
  })

const active = (status, ...ticks) => ({
  'docs/changes/CHANGE-0001/proposal.md': proposal(status),
  'docs/changes/CHANGE-0001/tasks.md': tasks(...(ticks.length ? ticks : [false, false])),
  'docs/changes/README.md': registry([`| CHANGE-0001 | A change | ${status} | |`]),
})
const archived = {
  'docs/changes/archive/CHANGE-0001/proposal.md': proposal('Archived'),
  'docs/changes/README.md': registry(['| CHANGE-0001 | A change | Archived | 1.1 |']),
}
const DELIVERY = ['docs/spec/technical-spec.md', 'SPEC_VERSION.md', 'docs/changes/CHANGE-0001/proposal.md', 'docs/changes/archive/CHANGE-0001/proposal.md', 'docs/changes/README.md']
const CITED = ['| 1.1 | CHANGE-0001 | 2026-09-24 | Ada | A change | TASK-001 |']

test('a delivery that folds, bumps, cites and archives passes', () => {
  const r = run({ v: '1.1', log: CITED, files: archived, changed: DELIVERY })
  assert.equal(r.code, 0, r.out)
})

test('ordinary sustain PRs pass: a new change, an implementation, a fold into design only', () => {
  assert.equal(run({ files: active('Proposed'), changed: ['docs/changes/CHANGE-0001/proposal.md', 'docs/changes/README.md'] }).code, 0)
  assert.equal(run({ files: active('Accepted'), changed: ['src/app.ts', 'docs/changes/CHANGE-0001/tasks.md'] }).code, 0)
  const design = { ...archived, 'docs/design/design.md': '# Design\n' }
  const r = run({ v: '1.1', log: CITED, files: design, changed: ['docs/design/design.md', 'SPEC_VERSION.md', 'docs/changes/archive/CHANGE-0001/proposal.md'] })
  assert.equal(r.code, 0, r.out)
})

test('a spec edit that delivers no change fails, even when it touches an active one', () => {
  for (const changed of [['docs/spec/technical-spec.md'], ['docs/spec/technical-spec.md', 'docs/changes/CHANGE-0001/tasks.md']])
    assert.match(run({ files: active('Accepted'), changed }).out, /edits the living spec .* without delivering a change/)
})

test('a Delivered change outside archive/, and an archived change never delivered or never cited, fail', () => {
  assert.match(run({ files: active('Delivered') }).out, /CHANGE-0001 is Delivered but still sits outside docs\/changes\/archive\//)
  const early = { ...archived, 'docs/changes/archive/CHANGE-0001/proposal.md': proposal('Accepted'), 'docs/changes/README.md': registry(['| CHANGE-0001 | A change | Accepted | |']) }
  assert.match(run({ log: CITED, files: early }).out, /is archived, but its proposal\.md says "Accepted"/)
  assert.match(run({ files: archived }).out, /is archived, but SPEC_VERSION\.md has no Changelog row referencing CHANGE-0001/)
})

test('archiving without SPEC_VERSION.md, without an existing spec edit, or citing an older row fails', () => {
  const noLog = run({ v: '1.1', log: CITED, files: archived, changed: DELIVERY.filter((p) => p !== 'SPEC_VERSION.md') })
  assert.match(noLog.out, /archives CHANGE-0001 without changing SPEC_VERSION\.md/)
  const goneSpec = run({ v: '1.1', log: CITED, files: archived, changed: ['docs/spec/gone.md', ...DELIVERY.slice(1)] })
  assert.match(goneSpec.out, /archives CHANGE-0001 without editing the living spec/)
  const oldRow = ['| 1.0 | CHANGE-0001 | 2026-09-24 | Ada | A change | TASK-001 |', '| 1.1 | — | 2026-09-24 | Ada | Other | — |']
  assert.match(run({ v: '1.1', log: oldRow, files: archived, changed: DELIVERY }).out, /the SPEC_VERSION\.md Changelog row citing it is at 1\.0, not the Current Version 1\.1/)
})

test('a PR that deletes a change fails, even with its registry row gone too', () => {
  const r = run({ files: { 'docs/changes/README.md': registry([]) }, changed: ['docs/changes/archive/CHANGE-0003/proposal.md', 'docs/changes/README.md'] })
  assert.match(r.out, /error .*this PR deletes CHANGE-0003 - changes are archived, never deleted/)
})

test('an active change with every task ticked warns; one with open tasks does not', () => {
  const done = run({ files: active('Accepted', true, true) })
  assert.equal(done.code, 0, done.out)
  assert.match(done.out, /warning .*every task box in tasks\.md is ticked, but the change is still Accepted/)
  assert.doesNotMatch(run({ files: active('Accepted', true, false) }).out, /ticked/)
})
