// Tests for spec-lint's PR-template check (scripts/spec-lint.mjs, section 13) and the
// automated-PR policy it shares with the Spec Reference check (section 4).
//
// These test the scaffold's own tooling, not your project. Each case builds a minimal
// filled-in project in a temp directory, copies in this repo's spec-lint and PR template, and
// runs spec-lint the way CI does, with a synthetic PR_BODY. The cases are the acceptance
// criteria of the change that added the check. Stock Node only: `node --test`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const TEMPLATE = readFileSync(join(ROOT, '.github/PULL_REQUEST_TEMPLATE.md'), 'utf8')

// A body that fills the real template: placeholders replaced, the deviations example row
// deleted, and every checkbox left unticked (ticks are not required).
const FILLED = TEMPLATE.replace('§[section(s) from technical-spec.md — required]', '§1')
  .replace('TASK-[XXX]', 'TASK-001')
  .replace('ADR-[XXXX] *(or "N/A")*', 'N/A')
  .replace('M[X]', 'M1')
  .replaceAll('[AC from TASK-XXX]', 'The thing works')
  .replace(/^\| \[What differs from spec\].*\n/m, '')
  .replace('[your test command]', 'npm test')

function lint({ body, env = {}, files = {}, scaffold = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'spec-lint-pr-'))
  const put = (p, content) => {
    mkdirSync(dirname(join(dir, p)), { recursive: true })
    writeFileSync(join(dir, p), content)
  }
  try {
    put('scripts/spec-lint.mjs', readFileSync(join(ROOT, 'scripts/spec-lint.mjs')))
    put('.github/PULL_REQUEST_TEMPLATE.md', TEMPLATE)
    put('sdd.config.yml', 'process:\n  mode: greenfield\n')
    put('docs/product/brief.md', '# Product Brief: Acme\n')
    put('docs/plan/backlog.md', '# Implementation Backlog: Acme\n')
    put(
      'docs/spec/technical-spec.md',
      scaffold ? '# Technical Specification: [Product Name]\n' : '# Technical Specification: Acme\n\n## 1. Overview\n'
    )
    for (const [p, content] of Object.entries(files))
      content == null ? rmSync(join(dir, p), { force: true }) : put(p, content)
    const r = spawnSync(process.execPath, ['scripts/spec-lint.mjs'], {
      cwd: dir,
      encoding: 'utf8',
      env: { PATH: process.env.PATH, ...(body === undefined ? {} : { PR_BODY: body }), ...env },
    })
    return { code: r.status, out: r.stdout + r.stderr }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

const errorLines = (out) => out.split('\n').filter((l) => l.startsWith('error'))

// --- the acceptance criteria -------------------------------------------------------

test('a body that fills the template passes', () => {
  const r = lint({ body: FILLED })
  assert.equal(r.code, 0, r.out)
})

test('a missing section fails, and the message names it and the --body bypass', () => {
  const r = lint({ body: FILLED.replace(/^### Security\n[\s\S]*?(?=^---$)/m, '') })
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /missing 1 section of \.github\/PULL_REQUEST_TEMPLATE\.md: "### Security"/)
  assert.match(r.out, /gh pr create --body/)
})

test('headings present only inside a fenced code block fail', () => {
  const r = lint({ body: `Filled in below:\n\n\`\`\`markdown\n${FILLED}\n\`\`\`\n` })
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /"### Test Coverage" \(present only inside a code fence or HTML comment\)/)
})

test('unreplaced template placeholders fail, by name', () => {
  const r = lint({ body: FILLED.replace('TASK-001', 'TASK-[XXX]').replace('| M1 |', '| M[X] |') })
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /placeholders "TASK-\[XXX\]", "M\[X\]"/)
})

test('an empty or whitespace-only body fails, once', () => {
  for (const body of ['', '  \n\t\n']) {
    const r = lint({ body })
    assert.equal(r.code, 1, r.out)
    assert.equal(errorLines(r.out).length, 1, r.out)
    assert.match(r.out, /the PR body is empty/)
  }
})

test('PR_BODY unset (a push, a local run) skips the check', () => {
  const r = lint({})
  assert.equal(r.code, 0, r.out)
  assert.doesNotMatch(r.out, /PR body/)
})

test('a pristine scaffold skips the check', () => {
  const r = lint({ body: 'nothing like the template', scaffold: true })
  assert.equal(r.code, 0, r.out)
})

// --- the edge cases ------------------------------------------------------------------

test('the Spec Reference placeholder is left to the Spec Reference check: one error, not two', () => {
  const r = lint({ body: FILLED.replace('| §1 |', '| §[section(s) from technical-spec.md — required] |') })
  assert.equal(errorLines(r.out).length, 1, r.out)
  assert.match(r.out, /the PR body has no filled Spec Reference/)
})

test('a demoted heading does not count as present', () => {
  const r = lint({ body: FILLED.replace('### Security', '#### Security') })
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /"### Security" \(found as "#### Security" - keep the template's heading level\)/)
})

test('the expected structure is read from the template at runtime', () => {
  const template = `${TEMPLATE}\n---\n\n### Rollback Plan\n\n<!-- How to undo this PR. -->\n`
  const r = lint({ body: FILLED, files: { '.github/PULL_REQUEST_TEMPLATE.md': template } })
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /missing 1 section .*"### Rollback Plan"/)
})

test('checkboxes need not be ticked, and an unchosen option may keep its placeholder', () => {
  assert.equal(lint({ body: FILLED }).code, 0)
  const r = lint({ body: FILLED.replace('- [ ] **Yes**', '- [x] **Yes**') })
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /"AMEND-\[YYYY-MM-DD\]-\[SEQ\]"/)
})

test('an unticked item that is nothing but a placeholder still fails', () => {
  const r = lint({ body: FILLED.replace('- [ ] The thing works', '- [ ] [AC from TASK-XXX]') })
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /"\[AC from TASK-XXX\]"/)
})

test('bracketed prose, links and ticked boxes are not placeholders', () => {
  const prose =
    'Checked items[0], see [the spec](docs/spec/technical-spec.md), gaps stay [OPEN - REQUIRES INPUT].\n\n- [X] reviewed\n\n'
  const r = lint({ body: FILLED.replace('<!--\nOptional.', `${prose}<!--\nOptional.`) })
  assert.equal(r.code, 0, r.out)
})

test('a bot-authored PR skips the PR-body checks, with a note', () => {
  const r = lint({
    body: 'Bumps lodash from 4.17.20 to 4.17.21.',
    env: { PR_AUTHOR: 'dependabot[bot]', PR_AUTHOR_TYPE: 'Bot' },
  })
  assert.equal(r.code, 0, r.out)
  assert.match(r.out, /note .*skipped - the PR author dependabot\[bot\] is a bot/)
})

test('a visible opt-out line with a reason skips the PR-body checks, with a note', () => {
  const r = lint({ body: 'Reverts #41.\n\nspec-lint: skip-pr-template - pure revert of #41\n' })
  assert.equal(r.code, 0, r.out)
  assert.match(r.out, /note .*skipped - the PR body opts out: "pure revert of #41"/)
})

test('an opt-out without a reason fails, and one hidden in a comment does not count', () => {
  const bare = lint({ body: 'Reverts #41.\n\nspec-lint: skip-pr-template\n' })
  assert.equal(bare.code, 1, bare.out)
  assert.match(bare.out, /opts out of the PR checks .* without a reason/)
  const hidden = lint({ body: 'Reverts #41.\n\n<!-- spec-lint: skip-pr-template - sneaky -->\n' })
  assert.equal(hidden.code, 1, hidden.out)
  assert.match(hidden.out, /missing \d+ sections/)
})

test('a project without a PR template is noted, not failed', () => {
  const r = lint({
    body: '| Field | Value |\n|---|---|\n| **Spec Reference** | §1 |\n',
    files: { '.github/PULL_REQUEST_TEMPLATE.md': null },
  })
  assert.equal(r.code, 0, r.out)
  assert.match(r.out, /note .*PR template structure not checked/)
})
