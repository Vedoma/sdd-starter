#!/usr/bin/env node
// spec-lint - enforce the SDD constitution mechanically.
//
// Dependency-free. Validates the ACTIVE tree (ignores docs/**/archive/**). Prints
// findings and exits 1 on any error, 0 otherwise. Run locally (`node scripts/spec-lint.mjs`
// or the pre-commit hook) and in CI (.github/workflows/spec-lint.yml).
//
// Optional env:
//   PR_BODY   the pull-request body; when set, the Spec Reference check runs.
//
// Each check maps to a constitution.md clause; see the `clause` tag on each finding.

import { readFileSync, existsSync, readdirSync } from 'node:fs'

const errors = []
const warnings = []
const err = (clause, msg) => errors.push(`[${clause}] ${msg}`)
const warn = (clause, msg) => warnings.push(`[${clause}] ${msg}`)
const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null)

// A pristine scaffold is not a project yet: its spec is still the template. The
// project-level checks (mandatory documents, PR Spec Reference) only make sense once the
// repo is a real project, so they stay off in the sdd-starter repo itself and activate the
// moment docs/spec/technical-spec.md is filled in. Structural checks (ADR index, design
// tokens) run regardless.
const isScaffold = () => (read('docs/spec/technical-spec.md') || '').includes('[Product Name]')
const SCAFFOLD = isScaffold()

// ---- 1. Capabilities + process: mandatory documents present (C1) ----------------
// Read a boolean `key` under a top-level `block:` in sdd.config.yml. Hand-rolled
// because the scaffold ships no YAML dependency. Returns true / false / undefined.
function cfgFlag(cfg, block, key) {
  let inBlock = false
  for (const raw of cfg.split('\n')) {
    if (new RegExp(`^${block}:\\s*$`).test(raw)) {
      inBlock = true
      continue
    }
    if (inBlock && /^\S/.test(raw)) break // dedent to a new top-level key ends the block
    if (inBlock) {
      const m = raw.match(new RegExp(`^\\s+${key}:\\s*(true|false)\\b`))
      if (m) return m[1] === 'true'
    }
  }
  return undefined
}

function requiredDocs() {
  const cfg = read('sdd.config.yml')
  if (!cfg) {
    warn('C1', 'sdd.config.yml not found - skipping mandatory-document check')
    return []
  }
  // Core is always required; capabilities (shape) and process (planning) add to it.
  const req = new Set([
    'docs/product/brief.md',
    'docs/spec/technical-spec.md',
    'docs/plan/backlog.md',
  ])
  if (cfgFlag(cfg, 'process', 'prd')) req.add('docs/product/prd.md')
  if (cfgFlag(cfg, 'process', 'milestones')) req.add('docs/plan/milestones.md')
  if (cfgFlag(cfg, 'capabilities', 'ui')) req.add('docs/design/design.md')
  if (cfgFlag(cfg, 'capabilities', 'api')) req.add('docs/spec/api-contracts.md')
  if (cfgFlag(cfg, 'capabilities', 'data')) req.add('docs/spec/data-model.md')
  // overrides: `  <path>: required | optional`
  let inOverrides = false
  for (const raw of cfg.split('\n')) {
    if (/^overrides:\s*$/.test(raw)) {
      inOverrides = true
      continue
    }
    if (inOverrides && /^\S/.test(raw)) break
    if (inOverrides) {
      const m = raw.match(/^\s+([^\s:]+):\s*(required|optional)\b/)
      if (m) m[2] === 'required' ? req.add(m[1]) : req.delete(m[1])
    }
  }
  return [...req]
}
if (!SCAFFOLD)
  for (const doc of requiredDocs()) {
    if (!existsSync(doc)) err('C1', `required document missing (per sdd.config.yml): ${doc}`)
  }

// ---- 2. Backlog tasks: Spec Reference + >=2 acceptance criteria (C1, C5) ----------
function lintTaskFile(path) {
  const txt = read(path)
  if (!txt) return
  // Skip an unedited scaffold template - checks activate once it is filled in.
  if (txt.includes('[Product Name]') || txt.includes('[Task Title]')) return
  // Split into TASK blocks by the "### TASK-" heading.
  const blocks = txt.split(/^### /m).filter((b) => /^TASK-/.test(b))
  for (const b of blocks) {
    const id = (b.match(/^(TASK-[\w-]+)/) || [])[1] || '(unnamed task)'
    const specRef = b.match(/\*\*Spec Reference\*\*\s*\|\s*(.+)/) || b.match(/Spec Reference[:|]\s*(.+)/)
    const refVal = specRef ? specRef[1].trim() : ''
    if (!refVal || /^[-—\s]*$/.test(refVal) || /section\(s\) from/i.test(refVal) || refVal.includes('[')) {
      err('C1', `${path}: ${id} has no filled Spec Reference`)
    }
    const acCount = (b.match(/^\s*-\s*\[[ x]\]/gm) || []).length
    if (acCount < 2) err('C5', `${path}: ${id} has ${acCount} acceptance criteria (need >=2)`)
  }
}
lintTaskFile('docs/plan/backlog.md')
for (const dir of activeChangeDirs()) lintTaskFile(`${dir}/tasks.md`)

function activeChangeDirs() {
  const base = 'docs/changes'
  if (!existsSync(base)) return []
  return readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== 'archive' && !d.name.includes('0000-template'))
    .map((d) => `${base}/${d.name}`)
}

// ---- 3. ADR index consistency: files <-> README registry (C4, C8) ----------------
function lintAdrIndex() {
  const dir = 'docs/adr'
  if (!existsSync(dir)) return
  const readme = read(`${dir}/README.md`) || ''
  const files = readdirSync(dir).filter(
    (f) => /^ADR-\d{4}-.*\.md$/.test(f) && f !== 'ADR-0000-template.md'
  )
  for (const f of files) {
    const id = f.match(/^(ADR-\d{4})/)[1]
    if (!readme.includes(id)) err('C4', `docs/adr/README.md is missing a registry row for ${id} (${f})`)
  }
}
lintAdrIndex()

// ---- 4. PR carries a filled Spec Reference (C1) -----------------------------------
if (!SCAFFOLD && process.env.PR_BODY != null) {
  const body = process.env.PR_BODY
  const m = body.match(/\*\*Spec Reference\*\*\s*\|\s*(.+)/)
  const val = m ? m[1].trim() : ''
  if (!val || /section\(s\) from technical-spec/i.test(val) || val === '§[section(s) from technical-spec.md — required]') {
    err('C1', 'the PR body has no filled Spec Reference (see the PR template)')
  }
}

// ---- 5. Design anti-patterns: no hardcoded colors in src/ when a UI project (C2) --
function lintDesignTokens() {
  const cfg = read('sdd.config.yml') || ''
  if (cfgFlag(cfg, 'capabilities', 'ui') !== true) return
  if (!existsSync('src')) return
  const hex = /#[0-9a-fA-F]{6}\b/
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = `${d}/${e.name}`
      if (e.isDirectory()) walk(p)
      else if (/\.(css|scss|ts|tsx|js|jsx|vue|svelte)$/.test(e.name)) {
        const t = read(p) || ''
        if (hex.test(t)) warn('C2', `${p}: hardcoded hex color - reference a design token (docs/design/design.md §2)`)
      }
    }
  }
  walk('src')
}
lintDesignTokens()

// ---- report ----------------------------------------------------------------------
if (SCAFFOLD)
  console.log(
    'note    scaffold mode: docs/spec/technical-spec.md is still the template, so project-level checks (mandatory docs, PR Spec Reference) are skipped until it is filled in.'
  )
for (const w of warnings) console.log(`warning ${w}`)
for (const e of errors) console.log(`error   ${e}`)
if (errors.length) {
  console.log(`\nspec-lint: ${errors.length} error(s), ${warnings.length} warning(s)`)
  process.exit(1)
}
console.log(`spec-lint: passed (${warnings.length} warning(s))`)
