// Shared fixture for the scaffold's own spec-lint tests (tests/integration/spec-lint-*.test.mjs).
// Builds a minimal filled-in project in a temp directory and runs this repo's spec-lint on it
// the way CI does. Not a test file itself, so node --test does not pick it up.
//
// Hermetic by design: the only files taken from the repo are the tools under test. The
// documents the project is built from are frozen here, because these tests also run in an
// adopter's CI - where docs/ holds their real, filled-in documents.

import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const repoFile = (path) => readFileSync(join(ROOT, path), 'utf8')

// Filled-in stand-ins for the scaffolded documents, as the starter ships them: each template's
// title with a product name, then its headings - minus placeholder headings and example tasks -
// with no content. They pass the heading and placeholder checks by construction.
const SKELETONS = {
  'docs/product/brief.md': [
    '# Product Brief: Acme',
    '## Problem Statement',
    '## Target User',
    '## Value Proposition',
    '## Success Outcomes',
    '## Explicit Out-of-Scope',
    '## Open Questions',
  ],
  'docs/spec/technical-spec.md': [
    '# Technical Specification: Acme',
    '## 1. System Overview',
    '### 1.1 Architecture Diagram',
    '### 1.2 Technology Stack',
    '## 2. Component Specifications',
    '## 3. API Contracts',
    '### 3.1 Global Conventions',
    '### 3.2 Endpoint Index',
    '## 4. Data Model',
    '### 4.1 Entity Overview',
    '### 4.2 Key Invariants',
    '## 5. Security Specification',
    '## 6. Performance Targets',
    '## 7. Environment Configuration',
    '## 8. Third-Party Integrations',
    '## 9. Open Technical Questions',
    '## 10. Revision History',
  ],
  'docs/plan/backlog.md': [
    '# Implementation Backlog: Acme',
    '## Milestone 0 — Foundation',
    '## Dependency Graph',
    '## Backlog Status Summary',
  ],
}
export const skeleton = (path) => `${SKELETONS[path].join('\n\n')}\n`

// The PR template as the starter ships it, frozen in fixtures/ so that an adopter editing their
// own .github/PULL_REQUEST_TEMPLATE.md changes what spec-lint enforces, not what these tests expect.
export const PR_TEMPLATE = readFileSync(join(ROOT, 'tests/integration/fixtures/pr-template.md'), 'utf8')

// Runs spec-lint on a project made of spec-lint, the frozen PR template, a greenfield
// sdd.config.yml and skeletons of the three always-required documents, with `files` on top
// (null deletes one). `body`, when given, becomes PR_BODY.
export function lint({ files = {}, env = {}, body } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'spec-lint-'))
  const put = (path, content) => {
    mkdirSync(dirname(join(dir, path)), { recursive: true })
    writeFileSync(join(dir, path), content)
  }
  try {
    put('scripts/spec-lint.mjs', repoFile('scripts/spec-lint.mjs'))
    put('.github/PULL_REQUEST_TEMPLATE.md', PR_TEMPLATE)
    put('sdd.config.yml', 'process:\n  mode: greenfield\n')
    for (const path of ['docs/product/brief.md', 'docs/spec/technical-spec.md', 'docs/plan/backlog.md'])
      put(path, skeleton(path))
    for (const [path, content] of Object.entries(files))
      content == null ? rmSync(join(dir, path), { force: true }) : put(path, content)
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

export const errorLines = (out) => out.split('\n').filter((l) => l.startsWith('error'))
