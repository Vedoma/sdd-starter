// Tests for spec-lint's process-mode check (scripts/spec-lint.mjs, section 8) and the
// sdd.config.yml reader it relies on (section 1).
//
// These test the scaffold's own tooling, not your project: each case runs spec-lint on a
// minimal filled-in project (see spec-lint-fixture.mjs). Stock Node only: `node --test`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { lint, skeleton } from './spec-lint-fixture.mjs'

const SPEC = skeleton('docs/spec/technical-spec.md')
const MISSING = /does not declare process\.mode/
const config = (text) => ({ 'sdd.config.yml': text })

test('greenfield passes; a change directory under greenfield fails', () => {
  assert.equal(lint().code, 0)
  const r = lint({ files: { 'docs/changes/CHANGE-0001/proposal.md': '**Status:** Proposed\n' } })
  assert.match(r.out, /docs\/changes\/CHANGE-0001 exists but process\.mode is greenfield/)
})

test('a missing or unknown process.mode fails', () => {
  assert.match(lint({ files: config('process:\n  prd: false\n') }).out, MISSING)
  assert.match(lint({ files: config('process:\n  mode: agile\n') }).out, /process\.mode is "agile" - expected greenfield or sustain/)
})

test('the config reader takes comments, CRLF, quotes and nested keys the way YAML does', () => {
  for (const text of [
    'process: # planning\n  mode: greenfield\n',
    'process:\n# a note\n  mode: greenfield\n',
    'process: # x\r\n  mode: "greenfield" # comment\r\n',
  ])
    assert.equal(lint({ files: config(text) }).code, 0, JSON.stringify(text))
  // A `mode:` nested under another key of `process:` is not process.mode.
  assert.match(lint({ files: config('process:\n  sub:\n    mode: greenfield\n') }).out, MISSING)
})

test('sustain requires an Accepted spec', () => {
  const r = lint({ files: config('process:\n  mode: sustain\n') })
  assert.match(r.out, /process\.mode is sustain but docs\/spec\/technical-spec\.md declares \*\*Status:\*\* \(none\)/)
})

test('switching to sustain in a PR that edits nothing under docs/spec/ passes', () => {
  const spec = SPEC.replace(/^(# .*\n)/, '$1\n**Status:** Accepted\n').replace(
    /(## 10\. Revision History\n)/,
    '$1\n| Version | Date | Author | Changes |\n|---|---|---|---|\n| 1.0 | 2026-09-24 | Ada | Accepted |\n'
  )
  const specVersion = '## Current Version\n\n| Field | Value |\n|---|---|\n| **Spec Version** | 1.0 |\n'
  const r = lint({
    files: { ...config('process:\n  mode: sustain\n'), 'docs/spec/technical-spec.md': spec, 'SPEC_VERSION.md': specVersion },
    env: { CHANGED_FILES: 'sdd.config.yml' },
  })
  assert.equal(r.code, 0, r.out)
})
