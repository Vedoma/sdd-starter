// Tests for spec-lint's version-record check (scripts/spec-lint.mjs, section 10): the spec's
// Revision History against SPEC_VERSION.md (SPEC_VERSION.md, "Two version records").
//
// These test the scaffold's own tooling, not your project: each case runs spec-lint on a
// minimal filled-in project (see spec-lint-fixture.mjs). Stock Node only: `node --test`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { lint, skeleton } from './spec-lint-fixture.mjs'

const SPEC = skeleton('docs/spec/technical-spec.md')
const spec = (versions, { status = 'Accepted', header = '| Version | Date | Author | Changes |' } = {}) =>
  SPEC.replace(/^(# .*\n)/, `$1\n**Status:** ${status}\n`).replace(
    /(## 10\. Revision History\n)/,
    `$1\n${header}\n|---|---|---|---|\n${versions.map((v) => `| ${v} | 2026-09-24 | Ada | x |`).join('\n')}\n`
  )
const specVersion = (v) => `# Spec Version Log\n\n## Current Version\n\n| Field | Value |\n|---|---|\n| **Spec Version** | ${v} |\n`
const run = ({ versions, current, mode = 'sustain', status, header }) =>
  lint({
    files: {
      'sdd.config.yml': `process:\n  mode: ${mode}\n`,
      'docs/spec/technical-spec.md': spec(versions, { status, header }),
      'SPEC_VERSION.md': current == null ? null : specVersion(current),
    },
  })

test('sustain: records that agree pass - numerically, and with a v prefix', () => {
  for (const [versions, current] of [[['1.0'], '1.0'], [['1.0'], '1'], [['1.0', 'v1.1'], '1.1'], [['1.0'], 'v1.0'], [['1.9', '1.10'], '1.10']])
    assert.equal(run({ versions, current }).code, 0, `${versions} vs ${current}`)
})

test('sustain: records that disagree fail, v-prefixed rows included', () => {
  assert.match(run({ versions: ['1.0', 'v1.1'], current: '1.0' }).out, /Revision History is at 1\.1, but SPEC_VERSION\.md Current Version is 1\.0/)
})

test('sustain: a missing SPEC_VERSION.md fails', () => {
  assert.match(run({ versions: ['1.0'], current: null }).out, /error .*SPEC_VERSION\.md is missing/)
})

test('sustain: a version spec-lint cannot compare is named, not dropped', () => {
  assert.match(run({ versions: ['1.0', '1.1-rc.1'], current: '1.0' }).out, /Revision History has "1\.1-rc\.1", which spec-lint cannot compare/)
  assert.match(run({ versions: ['1.0'], current: '1.0 (accepted)' }).out, /Spec Version is "1\.0 \(accepted\)", which spec-lint cannot compare/)
})

test('a bold Version header is found; a table without a Version column is named', () => {
  assert.equal(run({ versions: ['1.0'], current: '1.0', header: '| **Version** | Date | Author | Changes |' }).code, 0)
  assert.match(run({ versions: ['1.0'], current: '1.0', header: '| Rev | Date | Author | Changes |' }).out, /no Revision History table with a Version column/)
})

test('the Revision History section is found by its name, not by a feature that mentions it', () => {
  const files = {
    'sdd.config.yml': 'process:\n  mode: sustain\n',
    'docs/spec/technical-spec.md': spec(['1.0']).replace('## 3. API Contracts', '## 3. Revision history export\n\nUsers export a revision history as CSV.\n\n## 4. API Contracts'),
    'SPEC_VERSION.md': specVersion('1.0'),
  }
  const r = lint({ files })
  assert.equal(r.code, 0, r.out)
})

test('greenfield: a Draft may run ahead; an Accepted spec that disagrees only warns', () => {
  assert.equal(run({ versions: ['0.3'], current: null, mode: 'greenfield', status: 'Draft' }).code, 0)
  const r = run({ versions: ['1.1'], current: '1.0', mode: 'greenfield' })
  assert.equal(r.code, 0, r.out)
  assert.match(r.out, /warning .*Revision History is at 1\.1, but SPEC_VERSION\.md Current Version is 1\.0/)
})
