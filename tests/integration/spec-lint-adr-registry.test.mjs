// Tests for spec-lint's ADR registry and merge gate (scripts/spec-lint.mjs, section 3) and
// the registry update in .github/scripts/adr-status.mjs that has to keep it green.
//
// These test the scaffold's own tooling, not your project: each case runs spec-lint on a
// minimal filled-in project (see spec-lint-fixture.mjs). Stock Node only: `node --test`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { lint, repoFile, errorLines } from './spec-lint-fixture.mjs'

const adr = (status, n = '0001') =>
  `---\nstatus: '${status}'\ndate: 2026-01-01\ndecision-makers: [ada]\n---\n\n# ADR-${n}: A decision\n\n## Status history\n\n- 2026-01-01 - proposed by @ada\n`
const registry = (rows, header = '| ID | Title | Status | Date | Deciders | Superseded By |\n| --- | --- | --- | --- | --- | --- |') =>
  `# Architecture Decision Records - Index\n\n## Decision Registry\n\n${header}\n${rows.join('\n')}\n`
const row = (n, status, by = '') => `| ADR-${n} | A decision | ${status} | 2026-01-01 | ada | ${by} |`
const project = (adrs, rows, header) => ({
  'docs/adr/README.md': registry(rows, header),
  ...Object.fromEntries(Object.entries(adrs).map(([n, status]) => [`docs/adr/ADR-${n}-decision.md`, adr(status, n)])),
})

test('a registry that agrees with the front matter passes', () => {
  const r = lint({ files: project({ '0001': 'accepted', '0002': 'superseded by ADR-0003', '0003': 'accepted' }, [row('0001', 'accepted'), row('0002', 'superseded', 'ADR-0003'), row('0003', '**Accepted**')]) })
  assert.equal(r.code, 0, r.out)
})

test('a missing row, a disagreeing row and a row without a file fail', () => {
  assert.match(lint({ files: project({ '0001': 'accepted' }, ['| 0001 | A decision | accepted | | | |']) }).out, /missing a registry row for ADR-0001 .* the row's ID cell must say ADR-0001/)
  assert.match(lint({ files: project({ '0001': 'accepted' }, [row('0001', 'proposed')]) }).out, /lists ADR-0001 as "proposed", but .* says "accepted"/)
  assert.match(lint({ files: project({}, [row('0005', 'accepted')]) }).out, /lists ADR-0005, but no docs\/adr\/ADR-0005-\*\.md exists/)
})

test('a status outside the lifecycle fails, and so does superseded without a successor', () => {
  assert.match(lint({ files: project({ '0001': 'banana' }, [row('0001', 'banana')]) }).out, /has status 'banana' - expected/)
  assert.match(lint({ files: project({ '0001': 'superseded' }, [row('0001', 'superseded')]) }).out, /has status 'superseded' - expected/)
})

test('a PR that changes an ADR still proposed fails; outside a PR it does not', () => {
  const files = project({ '0001': 'proposed' }, [row('0001', 'proposed')])
  assert.equal(lint({ files }).code, 0)
  const r = lint({ files, env: { CHANGED_FILES: 'docs/adr/ADR-0001-decision.md' } })
  assert.match(r.out, /ADR-0001-decision\.md is still status: 'proposed'/)
})

test('known gap (C4): a status edited to accepted by hand passes', () => {
  const r = lint({ files: project({ '0001': 'accepted' }, [row('0001', 'accepted')]), env: { CHANGED_FILES: 'docs/adr/ADR-0001-decision.md' } })
  assert.equal(r.code, 0, r.out)
})

// Runs adr-status.mjs on `files` as the /adr workflow would and returns the files afterwards.
function adrCommand(files, comment, adrFile) {
  const dir = mkdtempSync(join(tmpdir(), 'adr-status-'))
  try {
    for (const [p, c] of Object.entries(files)) {
      mkdirSync(dirname(join(dir, p)), { recursive: true })
      writeFileSync(join(dir, p), c)
    }
    mkdirSync(join(dir, '.github/scripts'), { recursive: true })
    writeFileSync(join(dir, '.github/scripts/adr-status.mjs'), repoFile('.github/scripts/adr-status.mjs'))
    const r = spawnSync(process.execPath, ['.github/scripts/adr-status.mjs'], {
      cwd: dir,
      encoding: 'utf8',
      env: { PATH: process.env.PATH, COMMENT_BODY: comment, ADR_FILE: adrFile, ACTOR: 'maintainer', PR_NUMBER: '7', DATE: '2026-09-24' },
    })
    assert.match(r.stdout, /^ok=true/m, r.stdout)
    return Object.fromEntries(Object.keys(files).map((p) => [p, readFileSync(join(dir, p), 'utf8')]))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

test('/adr accept supersedes keeps spec-lint green, with or without a Superseded By column', () => {
  for (const header of [undefined, '| ID | Title | Status |\n| --- | --- | --- |']) {
    const rows = header ? ['| ADR-0001 | A decision | accepted |', '| ADR-0002 | A decision | proposed |'] : [row('0001', 'accepted'), row('0002', 'proposed')]
    const after = adrCommand(project({ '0001': 'accepted', '0002': 'proposed' }, rows, header), '/adr accept supersedes ADR-0001', 'docs/adr/ADR-0002-decision.md')
    const r = lint({ files: after })
    assert.equal(r.code, 0, `${header ? 'no column' : 'column'}:\n${r.out}`)
    if (header) assert.match(after['docs/adr/README.md'], /\| ADR-0001 \| A decision \| superseded by ADR-0002 \|/)
  }
})

test('the registry row is rewritten cell by cell, keeping its spacing and CRLF', () => {
  const readme = registry(['| ADR-0001 | Title   | proposed | 2026-01-01 | ada   |   |']).replace(/\n/g, '\r\n')
  const after = adrCommand({ 'docs/adr/README.md': readme, 'docs/adr/ADR-0001-decision.md': adr('proposed') }, '/adr accept', 'docs/adr/ADR-0001-decision.md')
  assert.match(after['docs/adr/README.md'], /\| ADR-0001 \| Title {3}\| accepted \| 2026-01-01 \| ada {3}\| {3}\|\r\n/)
  assert.doesNotMatch(after['docs/adr/README.md'], /[^\r]\n/)
  assert.deepEqual(errorLines(lint({ files: after }).out), [])
})
