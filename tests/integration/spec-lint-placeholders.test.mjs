// Tests for spec-lint's scaffold-placeholder check (scripts/spec-lint.mjs, section 9) and the
// comment/fence stripping it shares with other checks.
//
// These test the scaffold's own tooling, not your project: each case runs spec-lint on a
// minimal filled-in project (see spec-lint-fixture.mjs). Stock Node only: `node --test`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { lint, skeleton, template } from './spec-lint-fixture.mjs'

const BRIEF = skeleton('docs/product/brief.md')
const brief = (text) => lint({ files: { 'docs/product/brief.md': `${BRIEF}\n${text}\n` } })
const flagged = (r, marker) => new RegExp(`brief\\.md: unfilled scaffold placeholders? .*"${marker.replace(/[[\]]/g, '\\$&')}"`).test(r.out)

test("the scaffold's markers fail in a filled-in required document", () => {
  for (const text of ['Owner: [Name]', '# [Product Name] notes', '**Last Updated:** YYYY-MM-DD', '| 1.0 | YYYY-MM-DD |', '**Author:** [name]', '| Owner | [name] |'])
    assert.equal(brief(text).code, 1, text)
})

test('prose, links and code are not placeholders', () => {
  for (const text of [
    'Dates are written YYYY-MM-DD.',
    '**Format** YYYY-MM-DD is required for every date.',
    'Set the [name] field of each record.',
    '| Owner | the [name] field |',
    'See [Title].\n\n[Title]: https://example.com',
    'Ask [Name] for access.\n\n[Name]: https://example.com/name',
    'See [Title](https://example.com) and `[Name]`.',
    '<!-- Owner: [Name] -->',
  ])
    assert.equal(brief(text).code, 0, text)
})

test('fences are read as GitHub renders them', () => {
  assert.equal(brief('Example:\n\n   ```\n   Owner: [Name]\n   ```').code, 0, 'indented fence')
  assert.equal(brief('````md\n```\ninner\n```\n[Name] inside the outer fence\n````').code, 0, 'nested fence')
  assert.equal(brief('```\ncode\n\nOwner: [Name]').code, 0, 'unclosed fence runs to the end')
  const early = brief('````\n```\n````\n\nOwner: [Name]\n\n```\nx\n```')
  assert.ok(flagged(early, '[Name]'), `a short fence line must not close a longer fence early:\n${early.out}`)
})

test('files in a change directory are scanned whatever their name', () => {
  const r = lint({
    files: {
      'docs/changes/CHANGE-0001/proposal.md': '# CHANGE-0001: Emails\n\n**Status:** Proposed\n',
      'docs/changes/CHANGE-0001/email-templates.md': 'Owner: [Name]\n',
    },
  })
  assert.match(r.out, /CHANGE-0001\/email-templates\.md: unfilled scaffold placeholder "\[Name\]"/)
})

test('the pristine scaffold is not checked', () => {
  const r = lint({ files: { 'docs/spec/technical-spec.md': template('docs/spec/technical-spec.md'), 'docs/product/brief.md': `${BRIEF}\nOwner: [Name]\n` } })
  assert.equal(r.code, 0, r.out)
})
