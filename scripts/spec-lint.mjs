#!/usr/bin/env node
// spec-lint - enforce the SDD constitution mechanically.
//
// Dependency-free. Validates the ACTIVE tree (ignores docs/**/archive/**). Prints
// findings and exits 1 on any error, 0 otherwise. Run locally (`node scripts/spec-lint.mjs`
// or the pre-commit hook) and in CI (.github/workflows/spec-lint.yml).
//
// Optional env:
//   PR_BODY         the pull-request body; when set, the Spec Reference check runs.
//   CHANGED_FILES   newline-separated repo-relative paths the pull request changes; when
//                   set, the diff-aware checks run. CI computes it (spec-lint.yml); a local
//                   run leaves it unset and those checks are skipped.
//
// Each check maps to a constitution.md clause; see the `clause` tag on each finding.

import { readFileSync, existsSync, readdirSync } from 'node:fs'

const errors = []
const warnings = []
const err = (clause, msg) => errors.push(`[${clause}] ${msg}`)
const warn = (clause, msg) => warnings.push(`[${clause}] ${msg}`)
const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null)

// What the pull request changes, or null when unknown (a local run, a push to main).
const CHANGED =
  process.env.CHANGED_FILES == null
    ? null
    : process.env.CHANGED_FILES.split(/\r?\n/)
        .map((p) => p.trim())
        .filter(Boolean)

// A pristine scaffold is not a project yet: its spec is still the template. The
// project-level checks (mandatory documents, PR Spec Reference) only make sense once the
// repo is a real project, so they stay off in the sdd-starter repo itself and activate the
// moment docs/spec/technical-spec.md is filled in. Structural checks (ADR index, design
// tokens) run regardless.
const isScaffold = () => (read('docs/spec/technical-spec.md') || '').includes('[Product Name]')
const SCAFFOLD = isScaffold()

// ---- 1. Capabilities + process: mandatory documents present (C1) ----------------
// Read the scalar `key` under a top-level `block:` in sdd.config.yml (quotes and a trailing
// comment stripped). Hand-rolled because the scaffold ships no YAML dependency. Returns the
// value as a string, or undefined.
function cfgValue(cfg, block, key) {
  let inBlock = false
  for (const raw of cfg.split('\n')) {
    if (new RegExp(`^${block}:\\s*$`).test(raw)) {
      inBlock = true
      continue
    }
    if (inBlock && /^\S/.test(raw)) break // dedent to a new top-level key ends the block
    if (inBlock) {
      const m = raw.match(new RegExp(`^\\s+${key}:\\s*['"]?([^\\s#'"]+)`))
      if (m) return m[1]
    }
  }
  return undefined
}

// A boolean `key` under `block:`. Returns true / false / undefined.
function cfgFlag(cfg, block, key) {
  const v = cfgValue(cfg, block, key)
  return v === 'true' ? true : v === 'false' ? false : undefined
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
const REQUIRED_DOCS = SCAFFOLD ? [] : requiredDocs()
for (const doc of REQUIRED_DOCS) {
  if (!existsSync(doc)) err('C1', `required document missing (per sdd.config.yml): ${doc}`)
}

// ---- 2. Backlog tasks: Spec Reference + >=2 acceptance criteria (C1, C5) ----------
function lintTaskFile(path) {
  const txt = read(path)
  if (!txt) return
  // Skip an unedited scaffold template - checks activate once it is filled in. In a real
  // project the file does not pass silently: section 9 fails it for those placeholders.
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

// ---- 3. ADR registry: files <-> README rows agree; no ADR merges proposed (C4, C8) --
// The Decision Registry is what people read; the front matter is what adr-status.yml writes.
// A row that merely exists can say anything, so every ADR needs a row whose Status matches its
// front-matter status, and every row needs its file (ADRs are never deleted). On a PR, no ADR
// the PR touches may still be `proposed`: acceptance happens on the open PR (/adr accept),
// before merge. Structural, so it runs in scaffold mode too.

// Every row of every Markdown table in `md` whose header has all of `columns`, as an object
// keyed by lower-cased header text.
function tableRows(md, columns) {
  const rows = []
  let header = null
  for (const line of md.replace(/\r\n/g, '\n').split('\n')) {
    if (!line.trim().startsWith('|')) {
      header = null
      continue
    }
    const cells = line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
    if (!header) {
      header = cells.map((c) => c.toLowerCase())
      continue
    }
    if (cells.every((c) => /^:?-+:?$/.test(c))) continue
    if (columns.every((c) => header.includes(c)))
      rows.push(Object.fromEntries(header.map((h, i) => [h, cells[i] ?? ''])))
  }
  return rows
}

// The front-matter `status` of an ADR, or null.
function adrStatus(txt) {
  const fm = (txt || '').replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/)
  const m = fm && fm[1].match(/^status:\s*['"]?([^'"\n]+?)['"]?\s*$/m)
  return m ? m[1].trim() : null
}

// "superseded by ADR-0007" / "**Accepted**" -> { state: 'superseded', by: 'ADR-0007' }
function adrState(text) {
  return {
    state: (text.toLowerCase().match(/[a-z]+/) || [''])[0],
    by: (text.match(/ADR-\d{4}/i) || [''])[0].toUpperCase(),
  }
}

function lintAdrRegistry() {
  const dir = 'docs/adr'
  if (!existsSync(dir)) return
  const rows = tableRows(read(`${dir}/README.md`) || '', ['id', 'status'])
  const files = readdirSync(dir).filter(
    (f) => /^ADR-\d{4}-.*\.md$/.test(f) && f !== 'ADR-0000-template.md'
  )
  for (const f of files) {
    const id = f.match(/^(ADR-\d{4})/)[1]
    const row = rows.find((r) => new RegExp(`\\b${id}\\b`).test(r.id))
    if (!row) {
      err('C4', `docs/adr/README.md is missing a registry row for ${id} (${f})`)
      continue
    }
    const status = adrStatus(read(`${dir}/${f}`))
    if (status === null) {
      err('C4', `${dir}/${f} has no front-matter status - the registry check and the merge gate read it from there (see ADR-0000-template.md)`)
      continue
    }
    const file = adrState(status)
    const listed = adrState(row.status)
    if (listed.state === 'superseded' && !listed.by) listed.by = adrState(row['superseded by'] || '').by
    if (file.state !== listed.state || file.by !== listed.by)
      err(
        'C4',
        `docs/adr/README.md lists ${id} as "${listed.by ? `${listed.state} by ${listed.by}` : row.status}", but ${f} front matter says "${status}" - update the registry row (the /adr commands keep it in step)`
      )
  }
  for (const r of rows) {
    const id = (r.id.match(/ADR-\d{4}/) || [])[0]
    if (id && id !== 'ADR-0000' && !files.some((f) => f.startsWith(`${id}-`)))
      err('C4', `docs/adr/README.md lists ${id}, but no docs/adr/${id}-*.md exists - ADRs are never deleted; restore the file`)
  }
  for (const p of CHANGED || []) {
    if (!/^docs\/adr\/ADR-\d{4}-.*\.md$/.test(p) || p.endsWith('/ADR-0000-template.md') || !existsSync(p)) continue
    const status = adrStatus(read(p))
    if (status !== null && adrState(status).state === 'proposed')
      err(
        'C4',
        `${p} is still status: 'proposed' - an ADR is accepted or rejected on its open PR, before merge: a maintainer comments /adr accept (or /adr reject "<reason>"); see docs/adr/README.md`
      )
  }
}
lintAdrRegistry()

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

// ---- 6. Behavioural spec present when the project has user-facing behaviour (C10) ---
// When capabilities.behavior is on, the accepted behaviour must exist as concrete examples:
// at least one real .feature under docs/spec/behavior/ (Gherkin is the default format
// contract). This gate checks the DISCIPLINE - that an accepted example exists and traces -
// not the syntax; it does not validate Gherkin grammar. The shipped example template is
// ignored. A scenario with no @AC- trace tag (the stable id the spec and backlog tasks
// cite) is a warning, not a hard error, so tag parsing can never block a merge on an edge case.
const isFeatureTemplate = (t) => t.includes('# TEMPLATE - copy this') || t.includes('# TEMPLATE — copy this')
function lintBehaviourSpec() {
  const cfg = read('sdd.config.yml') || ''
  if (cfgFlag(cfg, 'capabilities', 'behavior') !== true) return
  const dir = 'docs/spec/behavior'
  const features = existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith('.feature'))
        .map((f) => ({ path: `${dir}/${f}`, txt: read(`${dir}/${f}`) || '' }))
        .filter((f) => !isFeatureTemplate(f.txt))
    : []
  if (features.length === 0) {
    err('C10', `capabilities.behavior is on but no behavioural scenarios exist - add ${dir}/<capability>.feature (see ${dir}/README.md)`)
    return
  }
  for (const f of features) {
    const scenarios = (f.txt.match(/^\s*Scenario(?: Outline)?:/gm) || []).length
    const acTags = (f.txt.match(/@AC-[\w.-]+/g) || []).length
    if (scenarios === 0) warn('C10', `${f.path}: no Scenario found`)
    else if (acTags === 0) warn('C10', `${f.path}: scenarios have no @AC- trace tag (the id the spec and tasks cite)`)
  }
}
if (!SCAFFOLD) lintBehaviourSpec()

// ---- 7. Behavioural traceability: task citations resolve to real scenarios (C10) ---
// The @AC- ids a backlog task cites must point at scenarios that actually exist (traceability
// flows outward: a task cites a scenario, the scenario is the anchor). A dangling citation -
// a task pointing at an @AC- no scenario defines - is an ERROR: the trace is broken, usually a
// typo or a scenario renamed/removed without updating the task. Behavioural scenarios that no
// task cites are a WARNING, not an error: it may just mean planning is not done yet. Runs only
// on a genuinely filled backlog (template placeholders still present -> skipped), so a
// half-scaffolded project is never blocked by its own template's illustrative @AC- ids.
function lintBehaviourCoverage() {
  const cfg = read('sdd.config.yml') || ''
  if (cfgFlag(cfg, 'capabilities', 'behavior') !== true) return
  const backlog = read('docs/plan/backlog.md')
  if (!backlog || backlog.includes('[Product Name]') || backlog.includes('[Task Title]')) return
  const dir = 'docs/spec/behavior'
  if (!existsSync(dir)) return
  // Defined ids: @AC- tags on real Gherkin tag lines (a line starting with @, not a comment)
  // in non-template .feature files, walked recursively but skipping any archive/ tree.
  const defined = new Set()
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      if (entry.name === 'archive') continue
      const p = `${d}/${entry.name}`
      if (entry.isDirectory()) walk(p)
      else if (entry.name.endsWith('.feature')) {
        const txt = read(p) || ''
        if (isFeatureTemplate(txt)) continue
        for (const line of txt.split('\n')) {
          if (/^\s*@/.test(line)) for (const m of line.match(/@AC-[\w.-]+/g) || []) defined.add(m)
        }
      }
    }
  }
  walk(dir)
  if (defined.size === 0) return // lintBehaviourSpec already reports "no scenarios exist"
  const cited = [...new Set(backlog.match(/@AC-[\w.-]+/g) || [])]
  for (const id of cited.filter((id) => !defined.has(id)))
    err('C10', `docs/plan/backlog.md cites ${id}, but no scenario under ${dir}/ defines it (dangling trace - fix the id, or add/restore the scenario)`)
  if (cited.length === 0)
    warn('C10', `behavioural scenarios exist but no backlog task cites an @AC- id - a specified behaviour that nothing plans to build (or planning is not done yet)`)
}
if (!SCAFFOLD) lintBehaviourCoverage()

// ---- 8. Process mode: one SDD flow at a time (C3) --------------------------------
// sdd.config.yml -> process.mode declares which flow the project is in, so no agent has to
// guess. greenfield bootstraps the spec and edits docs/spec/** directly; sustain changes the
// accepted spec only through docs/changes/CHANGE-NNNN deltas. Running both at once is how an
// accepted spec gets edited silently, so each mode rejects the other's artifacts.
const MODES = ['greenfield', 'sustain']
const CHANGE_PATH = /^docs\/changes\/(?:archive\/)?CHANGE-(?!0000-template)[^/]+\//

// Change directories: active (docs/changes/) and delivered (docs/changes/archive/). The
// shipped template is not a change.
function changeDirs() {
  const list = (base, archived) =>
    existsSync(base)
      ? readdirSync(base, { withFileTypes: true })
          .filter((d) => d.isDirectory() && d.name.startsWith('CHANGE-') && !d.name.includes('0000-template'))
          .map((d) => ({ name: d.name, path: `${base}/${d.name}`, archived }))
      : []
  return [...list('docs/changes', false), ...list('docs/changes/archive', true)]
}

// The first `**Status:** <word>` in a document - its header block - e.g. "Draft".
const docStatus = (txt) => ((txt || '').match(/\*\*Status:\*\*\s*([A-Za-z]+)/) || [])[1]

function lintProcessMode() {
  const cfg = read('sdd.config.yml')
  if (!cfg) return // section 1 already warns that the config is missing
  const mode = cfgValue(cfg, 'process', 'mode')
  if (!MODES.includes(mode)) {
    err(
      'C3',
      mode === undefined
        ? 'sdd.config.yml does not declare process.mode - set greenfield (bootstrapping the spec) or sustain (the spec is accepted; every change is a docs/changes/ delta)'
        : `sdd.config.yml process.mode is "${mode}" - expected greenfield or sustain`
    )
    return
  }
  if (mode === 'greenfield') {
    for (const c of changeDirs())
      err(
        'C3',
        c.archived
          ? `${c.path} is an archived change but process.mode is greenfield - archived changes mean this project already runs change-based; set process.mode: sustain`
          : `${c.path} exists but process.mode is greenfield - change-based mode is not active; either set process.mode: sustain or remove the change directory`
      )
    return
  }
  const status = docStatus(read('docs/spec/technical-spec.md'))
  if (!/^accepted$/i.test(status || ''))
    err(
      'C3',
      `process.mode is sustain but docs/spec/technical-spec.md declares **Status:** ${status || '(none)'} - sustain begins once the spec is accepted; accept it, or return to process.mode: greenfield`
    )
  if (CHANGED) {
    const specEdits = CHANGED.filter((p) => p.startsWith('docs/spec/'))
    if (specEdits.length && !CHANGED.some((p) => CHANGE_PATH.test(p))) {
      const shown = specEdits.slice(0, 3).join(', ') + (specEdits.length > 3 ? `, +${specEdits.length - 3} more` : '')
      err(
        'C3',
        `this PR edits the living spec (${shown}) without touching a docs/changes/CHANGE-NNNN/ directory - in sustain mode docs/spec/** changes only by delivering a change (/change)`
      )
    }
  }
}
if (!SCAFFOLD) lintProcessMode()

// ---- 9. Adoption: no unfilled scaffold placeholders in governance documents (C1) ----
// A governance document still carrying template markers - a spec owned by "[Name]", a version
// log dated "YYYY-MM-DD" - was never adopted. Scans the documents sdd.config.yml requires,
// SPEC_VERSION.md, and active change directories for the scaffold's own markers. Precision
// over recall: HTML comments and fenced/inline code are blanked first (keeping line numbers),
// a bracket marker followed by ( or [ is a link, and the date marker counts only as a table
// cell or after a **Label:**, so prose such as "dates are YYYY-MM-DD" passes.
const PLACEHOLDERS = ['[Product Name]', '[Task Title]', '[Title]', '[Name]', '[name]', '[Date]', '[x.x]']
const PLACEHOLDER_RES = [
  ...PLACEHOLDERS.map((p) => ({
    label: p,
    re: new RegExp(`${p.replace(/[.[\]]/g, '\\$&')}(?![(\\[])`, 'g'),
  })),
  { label: 'YYYY-MM-DD', re: /(?<=\|[ \t]*)YYYY-MM-DD(?=[ \t]*\|)|(?<=\*\*[^*\n]+\*\*[ \t]*)YYYY-MM-DD/g },
]

// The document with comments and code replaced by spaces, so line numbers still hold.
function proseOnly(md) {
  const blank = (m) => m.replace(/[^\n]/g, ' ')
  return md
    .replace(/\r\n/g, '\n')
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, blank)
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/`[^`\n]*`/g, blank)
}

function lintPlaceholders() {
  const docs = new Set([...REQUIRED_DOCS, 'SPEC_VERSION.md'])
  for (const c of changeDirs().filter((c) => !c.archived))
    for (const f of readdirSync(c.path)) if (f.endsWith('.md')) docs.add(`${c.path}/${f}`)
  for (const path of [...docs].filter((p) => !/template/i.test(p))) {
    const txt = read(path)
    if (!txt) continue
    const prose = proseOnly(txt)
    const found = new Map() // label -> { first: index, lines: Set }
    let total = 0
    for (const { label, re } of PLACEHOLDER_RES)
      for (const m of prose.matchAll(re)) {
        const hit = found.get(label) || { first: m.index, lines: new Set() }
        hit.lines.add(prose.slice(0, m.index).split('\n').length)
        found.set(label, hit)
        total++
      }
    if (!total) continue
    const list = [...found]
      .sort((a, b) => a[1].first - b[1].first)
      .map(([label, { lines }]) => `"${label}" (line${lines.size > 1 ? 's' : ''} ${[...lines].join(', ')})`)
      .join(', ')
    err(
      'C1',
      `${path}: unfilled scaffold placeholder${total > 1 ? 's' : ''} ${list} - fill them in; a governance document still carrying template markers was never adopted`
    )
  }
}
if (!SCAFFOLD) lintPlaceholders()

// ---- report ----------------------------------------------------------------------
if (SCAFFOLD)
  console.log(
    'note    scaffold mode: docs/spec/technical-spec.md is still the template, so project-level checks (mandatory docs, process mode, placeholders, PR Spec Reference) are skipped until it is filled in.'
  )
for (const w of warnings) console.log(`warning ${w}`)
for (const e of errors) console.log(`error   ${e}`)
if (errors.length) {
  console.log(`\nspec-lint: ${errors.length} error(s), ${warnings.length} warning(s)`)
  process.exit(1)
}
console.log(`spec-lint: passed (${warnings.length} warning(s))`)
