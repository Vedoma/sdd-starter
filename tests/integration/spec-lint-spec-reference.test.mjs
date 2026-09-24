// Tests for spec-lint's Spec Reference resolution (scripts/spec-lint.mjs, sections 2 and 4).
//
// These test the scaffold's own tooling, not your project: each case runs spec-lint on a
// minimal filled-in project (see spec-lint-fixture.mjs). Stock Node only: `node --test`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { lint, skeleton } from './spec-lint-fixture.mjs'

const BACKLOG = skeleton('docs/plan/backlog.md')
const SPEC = skeleton('docs/spec/technical-spec.md') // numbered sections 1-10, 1.1, 1.2, 3.1, ...

// A backlog with one task per Spec Reference value, each with two acceptance criteria.
const backlog = (...refs) =>
  BACKLOG +
  refs
    .map(
      (ref, i) =>
        `\n### TASK-00${i + 1}: Task\n\n| Field | Value |\n| --- | --- |\n| **Spec Reference** | ${ref} |\n\n- [ ] one\n- [ ] two\n`
    )
    .join('')

// A change directory (active by default) whose spec-delta.md touches `sections`.
const change = (id, sections = [], { archived = false, tasks } = {}) => {
  const dir = `docs/changes/${archived ? 'archive/' : ''}${id}`
  return {
    [`${dir}/proposal.md`]: `# ${id}: A change\n\n**Status:** ${archived ? 'Archived' : 'Accepted'}\n`,
    [`${dir}/spec-delta.md`]: `# Spec delta - ${id}\n\n${sections.map((s) => `## ADDED - §${s} New section\n`).join('\n')}`,
    ...(tasks ? { [`${dir}/tasks.md`]: tasks } : {}),
  }
}

const refErrors = (out) => out.split('\n').filter((l) => l.startsWith('error') && /Spec Reference/.test(l))

test('a § that is a heading of technical-spec.md resolves; one that is not fails', () => {
  assert.deepEqual(refErrors(lint({ files: { 'docs/plan/backlog.md': backlog('§1', '§1.2', '§ 3.1.') } }).out), [])
  const r = lint({ files: { 'docs/plan/backlog.md': backlog('§99') } })
  assert.match(r.out, /TASK-001 Spec Reference §99 is not a section of docs\/spec\/technical-spec\.md/)
})

test('both ends of a range are checked', () => {
  assert.deepEqual(refErrors(lint({ files: { 'docs/plan/backlog.md': backlog('§3-9', '§3–9', '§1.1 – §1.2') } }).out), [])
  const r = lint({ files: { 'docs/plan/backlog.md': backlog('§3-12', '§3–13') } })
  assert.match(r.out, /§12 is not a section/)
  assert.match(r.out, /§13 is not a section/)
})

test('a § keeps its own document: another .md later does not switch the check off', () => {
  const r = lint({ files: { 'docs/plan/backlog.md': backlog('technical-spec.md §99; see design.md') } })
  assert.match(r.out, /§99 is not a section/)
})

test('a § after another document is presence-only, noted - and api-technical-spec.md is another document', () => {
  const r = lint({ files: { 'docs/plan/backlog.md': backlog('data-model.md §3', 'api-technical-spec.md §99') } })
  assert.deepEqual(refErrors(r.out), [])
  assert.match(r.out, /note .*presence-only Spec Reference.*TASK-001, .*TASK-002/)
})

test('a § after a file inside a change resolves against that change', () => {
  const files = { ...change('CHANGE-0001', ['11']) }
  const ok = lint({ files: { ...files, 'docs/plan/backlog.md': backlog('CHANGE-0001/spec-delta.md §11') } })
  assert.deepEqual(refErrors(ok.out), [])
  const r = lint({ files: { ...files, 'docs/plan/backlog.md': backlog('CHANGE-0001/spec-delta.md §12') } })
  assert.match(r.out, /§12 is not a section of docs\/spec\/technical-spec\.md or CHANGE-0001's spec-delta\.md/)
})

test('a CHANGE-NNNN must exist, active or archived', () => {
  const files = { ...change('CHANGE-0002', [], { archived: true }) }
  assert.deepEqual(refErrors(lint({ files: { ...files, 'docs/plan/backlog.md': backlog('CHANGE-0002 §1') } }).out), [])
  const r = lint({ files: { 'docs/plan/backlog.md': backlog('CHANGE-0003 §1') } })
  assert.match(r.out, /names CHANGE-0003, but neither docs\/changes\/CHANGE-0003 nor docs\/changes\/archive\/CHANGE-0003 exists/)
})

test('a malformed change id fails instead of passing on presence', () => {
  const r = lint({ files: { 'docs/plan/backlog.md': backlog('CHANGE-9', 'CHANGE-00009', 'change-0009') } })
  for (const id of ['CHANGE-9', 'CHANGE-00009', 'change-0009'])
    assert.match(r.out, new RegExp(`names "${id}" - a change id is CHANGE-NNNN`))
})

test('a task inside a change may cite its own delta without naming the change', () => {
  const tasks = backlog('§11').replace(BACKLOG, '# Tasks - CHANGE-0004\n')
  const r = lint({ files: change('CHANGE-0004', ['11'], { tasks }) })
  assert.deepEqual(refErrors(r.out), [])
})

test('headings inside a code fence are not sections; an emphasised number is', () => {
  const spec = `${SPEC}\n\`\`\`markdown\n## 11. Only an example\n\`\`\`\n\n## **12.** Bold\n`
  const r = lint({ files: { 'docs/spec/technical-spec.md': spec, 'docs/plan/backlog.md': backlog('§11', '§12') } })
  assert.match(r.out, /TASK-001 Spec Reference §11 is not a section/)
  assert.doesNotMatch(r.out, /§12 is not a section/)
})

test('blank, dash-only and placeholder values are unfilled - tasks and PR body alike', () => {
  const r = lint({ files: { 'docs/plan/backlog.md': backlog(' ', '—', '§[x.x]', '[TBD]') } })
  for (const n of [1, 2, 3, 4]) assert.match(r.out, new RegExp(`TASK-00${n} has no filled Spec Reference`))
  for (const body of ['| **Spec Reference** |  |', '| **Spec Reference** | §[section(s) from technical-spec.md — required] |'])
    assert.match(lint({ body }).out, /the PR body has no filled Spec Reference/)
})

test('tasks and the PR body accept the same forms: a table cell or a line, [§N] included', () => {
  assert.deepEqual(refErrors(lint({ files: { 'docs/plan/backlog.md': backlog('[§3]') } }).out), [])
  for (const body of ['| **Spec Reference** | [§3] |', 'Spec Reference: §3', '**Spec Reference:** §3'])
    assert.deepEqual(refErrors(lint({ body }).out), [], body)
  const r = lint({ body: 'Spec Reference: §99' })
  assert.match(r.out, /the PR body's Spec Reference §99 is not a section/)
})

test('N/A resolves nothing, so it passes on presence with a note', () => {
  const r = lint({ files: { 'docs/plan/backlog.md': backlog('N/A') } })
  assert.deepEqual(refErrors(r.out), [])
  assert.match(r.out, /note .*presence-only Spec Reference/)
})
