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

// ---- 1. Ceremony profile: mandatory documents present (C1) ----------------------
function requiredDocs() {
  const cfg = read('sdd.config.yml')
  if (!cfg) {
    warn('C1', 'sdd.config.yml not found - skipping mandatory-document check')
    return []
  }
  const profile = (cfg.match(/^profile:\s*(\w+)/m) || [])[1] || 'team'
  const ui = !/^ui:\s*false\b/m.test(cfg)
  // Extract the `required:` list under `profiles: <profile>:`.
  const lines = cfg.split('\n')
  let inProfiles = false,
    inProfile = false,
    inRequired = false
  const req = []
  for (const raw of lines) {
    if (/^profiles:\s*$/.test(raw)) inProfiles = true
    if (!inProfiles) continue
    if (new RegExp(`^  ${profile}:\\s*$`).test(raw)) {
      inProfile = true
      continue
    }
    if (inProfile && /^  \w+:\s*$/.test(raw)) break // next profile
    if (inProfile && /^    required:\s*$/.test(raw)) {
      inRequired = true
      continue
    }
    if (inProfile && /^    optional:\s*$/.test(raw)) inRequired = false
    if (inRequired) {
      const m = raw.match(/^\s*-\s*(\S+)\s*$/)
      if (m) req.push(m[1])
    }
  }
  return req.filter((d) => ui || !d.endsWith('design/design.md'))
}
for (const doc of requiredDocs()) {
  if (!existsSync(doc)) err('C1', `required document missing for the active profile: ${doc}`)
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
if (process.env.PR_BODY != null) {
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
  if (/^ui:\s*false\b/m.test(cfg)) return
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
for (const w of warnings) console.log(`warning ${w}`)
for (const e of errors) console.log(`error   ${e}`)
if (errors.length) {
  console.log(`\nspec-lint: ${errors.length} error(s), ${warnings.length} warning(s)`)
  process.exit(1)
}
console.log(`spec-lint: passed (${warnings.length} warning(s))`)
