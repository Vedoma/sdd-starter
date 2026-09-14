// Shared fixture for the scaffold's own spec-lint tests (tests/integration/spec-lint-*.test.mjs).
// Builds a minimal filled-in project in a temp directory from this repo's real files and runs
// spec-lint on it the way CI does. Not a test file itself, so node --test does not pick it up.

import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const repoFile = (path) => readFileSync(join(ROOT, path), 'utf8')

// A filled-in stand-in for a scaffolded document: the template's title with a product name,
// then the template's own headings - minus placeholder headings and example tasks - with no
// content. It passes the heading and placeholder checks by construction.
export function skeleton(path) {
  const lines = repoFile(path)
    .replace(/\r\n/g, '\n')
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .split('\n')
  const title = lines.find((l) => l.startsWith('# ')).replace('[Product Name]', 'Acme')
  const headings = lines.filter((l) => /^#{2,6} /.test(l) && !l.includes('[') && !l.includes('TASK-'))
  return `${[title, ...headings].join('\n\n')}\n`
}

// Runs spec-lint on a project made of spec-lint, the PR template, a greenfield sdd.config.yml
// and skeletons of the three always-required documents, with `files` on top (null deletes one).
// `body`, when given, becomes PR_BODY.
export function lint({ files = {}, env = {}, body } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'spec-lint-'))
  const put = (path, content) => {
    mkdirSync(dirname(join(dir, path)), { recursive: true })
    writeFileSync(join(dir, path), content)
  }
  try {
    put('scripts/spec-lint.mjs', repoFile('scripts/spec-lint.mjs'))
    put('.github/PULL_REQUEST_TEMPLATE.md', repoFile('.github/PULL_REQUEST_TEMPLATE.md'))
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
