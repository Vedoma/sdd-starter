// Tests for spec-lint's change naming and Change Registry check (scripts/spec-lint.mjs,
// section 11).
//
// These test the scaffold's own tooling, not your project: each case runs spec-lint on a
// minimal filled-in project (see spec-lint-fixture.mjs). Stock Node only: `node --test`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { lint } from './spec-lint-fixture.mjs'

const registry = (rows) => `# Changes\n\n## Change Registry\n\n| ID | Title | Status | Delivered In |\n| --- | --- | --- | --- |\n${rows.join('\n')}\n`
const proposal = (status) => `# CHANGE: A change\n\n**Status:** ${status}\n`
const run = (files) => lint({ files: { 'sdd.config.yml': 'process:\n  mode: sustain\n', ...files } })
const registryErrors = (out) => out.split('\n').filter((l) => /^error .*(docs\/changes|CHANGE-)/.test(l) && !/sustain|Revision History|SPEC_VERSION/.test(l))

test('a registered change whose row agrees passes', () => {
  const r = run({ 'docs/changes/CHANGE-0001/proposal.md': proposal('Proposed'), 'docs/changes/README.md': registry(['| CHANGE-0001 | A change | Proposed | |']) })
  assert.deepEqual(registryErrors(r.out), [])
})

test('an unregistered change, a disagreeing row and a row without a directory fail', () => {
  assert.match(run({ 'docs/changes/CHANGE-0001/proposal.md': proposal('Proposed') }).out, /missing a registry row for CHANGE-0001/)
  assert.match(
    run({ 'docs/changes/CHANGE-0001/proposal.md': proposal('Accepted'), 'docs/changes/README.md': registry(['| CHANGE-0001 | A change | Proposed | |']) }).out,
    /lists CHANGE-0001 as "Proposed", but .* says "Accepted"/
  )
  assert.match(run({ 'docs/changes/README.md': registry(['| CHANGE-0004 | Gone | Proposed | |']) }).out, /lists CHANGE-0004, but neither .* exists/)
})

test('a change directory not named CHANGE-NNNN fails', () => {
  assert.match(run({ 'docs/changes/CHANGE-17/proposal.md': proposal('Proposed') }).out, /CHANGE-17 is not named CHANGE-NNNN/)
})

test('a directory that is not CHANGE-* at all fails instead of escaping every check', () => {
  for (const dir of ['docs/changes/change-0002', 'docs/changes/0002-foo', 'docs/changes/archive/old-thing'])
    assert.match(run({ [`${dir}/proposal.md`]: proposal('Delivered') }).out, new RegExp(`${dir} is not a change directory`), dir)
})

test('a malformed registry id is reported whole, and a duplicated one fails', () => {
  for (const id of ['CHANGE-00005', 'CHANGE-12345'])
    assert.match(run({ 'docs/changes/README.md': registry([`| ${id} | x | Proposed | |`]) }).out, new RegExp(`has a row for "${id}"`), id)
  const r = run({
    'docs/changes/CHANGE-0001/proposal.md': proposal('Proposed'),
    'docs/changes/README.md': registry(['| CHANGE-0001 | x | Proposed | |', '| CHANGE-0001 | y | Proposed | |']),
  })
  assert.match(r.out, /lists CHANGE-0001 more than once/)
})
