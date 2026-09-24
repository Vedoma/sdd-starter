// Tests for spec-lint's canonical-heading check (scripts/spec-lint.mjs, section 14): scaffolded
// documents keep the starter's section headings, and the starter's list of those headings keeps
// agreeing with its own templates.
//
// These test the scaffold's own tooling, not your project: each case runs spec-lint on a
// minimal project (see spec-lint-fixture.mjs). Stock Node only: `node --test`. The two
// starter-side cases read the repo's own templates, so they run only while every scaffolded
// document here is still its template - in sdd-starter itself, not in a project adopting it.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { lint, repoFile, skeleton, template } from './spec-lint-fixture.mjs'

const DOCS = [
  'docs/product/brief.md',
  'docs/product/prd.md',
  'docs/spec/technical-spec.md',
  'docs/spec/api-contracts.md',
  'docs/spec/data-model.md',
  'docs/design/design.md',
  'docs/plan/backlog.md',
  'docs/plan/milestones.md',
]
const TEMPLATES = Object.fromEntries(DOCS.map((path) => [path, repoFile(path)]))
const PRISTINE = Object.values(TEMPLATES).every((md) => /^# .*\[Product Name\]/m.test(md))
const starterOnly = { skip: !PRISTINE && 'the scaffolded documents here are no longer the starter templates' }
const headingErrors = (out) =>
  out.split('\n').filter((l) => l.startsWith('error') && /canonical|CANONICAL_HEADINGS/.test(l))
const spec = (from, to) => ({ 'docs/spec/technical-spec.md': skeleton('docs/spec/technical-spec.md').replace(from, to) })

// --- the starter's side ----------------------------------------------------------------

test("the starter's templates and its canonical-heading list agree", starterOnly, () => {
  const r = lint({ files: TEMPLATES })
  assert.deepEqual(headingErrors(r.out), [], r.out)
  assert.equal(r.code, 0, r.out)
})

test('a template edited without updating the list fails the starter, in both directions', starterOnly, () => {
  const brief = TEMPLATES['docs/product/brief.md'].replace('## Open Questions', '## Competitors')
  const r = lint({ files: { ...TEMPLATES, 'docs/product/brief.md': brief } })
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /brief\.md \(still the template\) has heading "## Competitors" that CANONICAL_HEADINGS/)
  assert.match(r.out, /brief\.md \(still the template\) no longer has canonical heading "## Open Questions"/)
})

// --- the adopter's side ------------------------------------------------------------------

test('a filled-in document may add and renumber sections', () => {
  const r = lint({ files: spec('## 5. Security Specification', '## 5. Glossary\n\n## 6. Security Specification') })
  assert.deepEqual(headingErrors(r.out), [], r.out)
  assert.equal(r.code, 0, r.out)
})

test('a heading rewritten in sentence case fails, naming what was found', () => {
  const r = lint({ files: spec('## 5. Security Specification', '## 5. Security specification') })
  assert.equal(r.code, 1, r.out)
  assert.match(
    r.out,
    /missing canonical section heading "## 5\. Security Specification" \(found as "## 5\. Security specification" - keep the starter's wording, case and punctuation\)/
  )
})

test('a renamed Revision History fails', () => {
  const prd = skeleton('docs/product/prd.md').replace('## 8. Revision History', '## 8. Change history')
  const r = lint({ files: { 'sdd.config.yml': 'process:\n  mode: greenfield\n  prd: true\n', 'docs/product/prd.md': prd } })
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /docs\/product\/prd\.md is missing canonical section heading "## 8\. Revision History"/)
})

test('design.md dropping its Accessibility section fails when the project has a UI', () => {
  const design = skeleton('docs/design/design.md').replace('## 5. Accessibility\n\n', '')
  const withUi = lint({
    files: { 'sdd.config.yml': 'capabilities:\n  ui: true\nprocess:\n  mode: greenfield\n', 'docs/design/design.md': design },
  })
  assert.equal(withUi.code, 1, withUi.out)
  assert.match(withUi.out, /docs\/design\/design\.md is missing canonical section heading "## 5\. Accessibility"/)
  const withoutUi = lint({ files: { 'docs/design/design.md': design } })
  assert.deepEqual(headingErrors(withoutUi.out), [], 'a document the project does not require is not checked')
})

test('a demoted canonical heading fails', () => {
  const r = lint({ files: spec('## 6. Performance Targets', '### 6. Performance Targets') })
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /"## 6\. Performance Targets" \(found as "### 6\. Performance Targets" - keep its level\)/)
})

test('a canonical heading only inside a code fence does not count', () => {
  const r = lint({ files: spec('## 9. Open Technical Questions', '```\n## 9. Open Technical Questions\n```') })
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /missing canonical section heading "## 9\. Open Technical Questions"/)
})

test('until the spec is filled in, a filled-in document is not held to the list yet', () => {
  const brief = skeleton('docs/product/brief.md').replace('## Open Questions', '## Competitors')
  const r = lint({
    files: { 'docs/spec/technical-spec.md': template('docs/spec/technical-spec.md'), 'docs/product/brief.md': brief },
  })
  assert.deepEqual(headingErrors(r.out), [], r.out)
  assert.equal(r.code, 0, r.out)
})

test('a rename or a near miss is named, not just reported missing', () => {
  const cases = [
    ['## 10. Revision History', '## 10. Change history', /"## 10\. Revision History" \(renamed to "## 10\. Change history"\? - keep the starter's wording\)/],
    ['## 5. Security Specification', '## 5. Security Specification:', /\(found as "## 5\. Security Specification:" - keep the starter's wording, case and punctuation\)/],
    ['## 6. Performance Targets', '## 6. 🚀 Performance Targets', /\(found as "## 6\. 🚀 Performance Targets" - keep the starter's wording, case and punctuation\)/],
    ['## 7. Environment Configuration', 'Environment Configuration\n------------------------', /\(found as an underlined heading "Environment Configuration" - write it as a # heading\)/],
  ]
  for (const [from, to, message] of cases) assert.match(lint({ files: spec(from, to) }).out, message, to)
  const design = skeleton('docs/design/design.md').replace('## 8. Design Decisions → ADR', '## 8. Design Decisions -> ADR')
  const r = lint({ files: { 'sdd.config.yml': 'capabilities:\n  ui: true\nprocess:\n  mode: greenfield\n', 'docs/design/design.md': design } })
  assert.match(r.out, /\(found as "## 8\. Design Decisions -> ADR" - keep the starter's wording, case and punctuation\)/)
})

test('any section-number style is fine: "5.", "5" or "5)"', () => {
  const specMd = skeleton('docs/spec/technical-spec.md')
    .replace('## 5. Security Specification', '## 5) Security Specification')
    .replace('## 6. Performance Targets', '## 6 Performance Targets')
  const r = lint({ files: { 'docs/spec/technical-spec.md': specMd } })
  assert.deepEqual(headingErrors(r.out), [], r.out)
})

test('a canonical subsection must sit under its canonical section', () => {
  const prd = skeleton('docs/product/prd.md').replace('### Constraints\n\n', '').replace('## 7. Out of Scope', '## 7. Out of Scope\n\n### Constraints')
  const r = lint({ files: { 'sdd.config.yml': 'process:\n  mode: greenfield\n  prd: true\n', 'docs/product/prd.md': prd } })
  assert.match(r.out, /"### Constraints" \(found under "## 7\. Out of Scope" - keep it under "## 5\. Constraints & Assumptions"\)/)
})

test('a canonical heading after an unclosed fence does not count', () => {
  const r = lint({ files: spec('## 8. Third-Party Integrations', '```\nexample\n\n## 8. Third-Party Integrations') })
  assert.match(r.out, /missing canonical section heading.*"## 8\. Third-Party Integrations"/)
})
