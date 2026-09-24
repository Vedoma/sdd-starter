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
// comment stripped). Hand-rolled because the scaffold ships no YAML dependency, so it reads
// block style only (`block:` then indented `key: value` lines, not `block: { key: value }`)
// and only the block's own keys, not ones nested deeper. Returns the value as a string, or
// undefined.
function cfgValue(cfg, block, key) {
  let inBlock = false
  let indent = null // the indentation of the block's own keys, set by its first one
  for (const raw of cfg.split(/\r?\n/)) {
    if (new RegExp(`^${block}:\\s*(#.*)?$`).test(raw)) {
      inBlock = true
      continue
    }
    if (!inBlock || !raw.trim() || /^\s*#/.test(raw)) continue
    if (/^\S/.test(raw)) break // dedent to a new top-level key ends the block
    const lead = raw.match(/^\s*/)[0].length
    indent ??= lead
    if (lead !== indent) continue // a key nested under one of the block's own
    const m = raw.match(new RegExp(`^\\s+${key}:\\s*['"]?([^\\s#'"]+)`))
    if (m) return m[1]
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
// keyed by lower-cased header text (emphasis and code marks dropped, so **Status** is status).
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
      header = cells.map((c) => c.replace(/[*`]/g, '').trim().toLowerCase())
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

// The lifecycle states of ADR-0000-template.md; `superseded` also names its successor.
const ADR_STATES = ['proposed', 'accepted', 'rejected', 'deprecated', 'superseded']

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
      err('C4', `docs/adr/README.md is missing a registry row for ${id} (${f}) - the row's ID cell must say ${id}`)
      continue
    }
    const status = adrStatus(read(`${dir}/${f}`))
    if (status === null) {
      err('C4', `${dir}/${f} has no front-matter status - the registry check and the merge gate read it from there (see ADR-0000-template.md)`)
      continue
    }
    const file = adrState(status)
    if (!ADR_STATES.includes(file.state) || (file.state === 'superseded') !== Boolean(file.by)) {
      err(
        'C4',
        `${dir}/${f} has status '${status}' - expected ${ADR_STATES.slice(0, -1).join(', ')} or 'superseded by ADR-NNNN'`
      )
      continue
    }
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
// A path inside an archived change: what a delivering PR adds (section 12).
const ARCHIVED_CHANGE_PATH = /^docs\/changes\/archive\/CHANGE-\d{4}\//

// Change directories: active (docs/changes/) and delivered (docs/changes/archive/). The
// shipped template is not a change.
function changeDirs() {
  const list = (base, archived) =>
    existsSync(base)
      ? readdirSync(base, { withFileTypes: true })
          .filter((d) => d.isDirectory() && d.name.startsWith('CHANGE-') && d.name !== 'CHANGE-0000-template')
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
    // In sustain the spec changes only when a change is delivered, and delivering a change
    // archives it in the same PR (section 12). Touching an active change is not enough, and a
    // deleted path does not count: removing some other change does not deliver one.
    if (specEdits.length && !CHANGED.some((p) => ARCHIVED_CHANGE_PATH.test(p) && existsSync(p))) {
      const shown = specEdits.slice(0, 3).join(', ') + (specEdits.length > 3 ? `, +${specEdits.length - 3} more` : '')
      err(
        'C3',
        `this PR edits the living spec (${shown}) without delivering a change - in sustain mode docs/spec/** changes only in the PR that folds a change's delta in and moves it to docs/changes/archive/ (docs/changes/README.md, "Deliver")`
      )
    }
  }
}
if (!SCAFFOLD) lintProcessMode()

// ---- 9. Adoption: no unfilled scaffold placeholders in governance documents (C1) ----
// A governance document still carrying template markers - a spec owned by "[Name]", a version
// log dated "YYYY-MM-DD" - was never adopted. Scans the documents sdd.config.yml requires,
// SPEC_VERSION.md, and active change directories for the scaffold's own markers - a fixed
// list, not every bracketed hint a template carries. Precision over recall: HTML comments,
// fenced/inline code and link reference definitions are blanked first (keeping line numbers);
// a bracket marker followed by ( or [, or defined as a link reference, is a link; and the
// date and `[name]` markers count only as a table cell or after a **Label:**, so prose such as
// "dates are YYYY-MM-DD" passes.
const PLACEHOLDERS = ['[Product Name]', '[Task Title]', '[Title]', '[Name]', '[Date]', '[x.x]']
const AFTER_LABEL = String.raw`(?<=\*\*[^*\n]+(?::\*\*|\*\*:)[ \t]*)`
const PLACEHOLDER_RES = [
  ...PLACEHOLDERS.map((p) => ({
    label: p,
    re: new RegExp(`${p.replace(/[.[\]]/g, '\\$&')}(?![(\\[])`, 'g'),
  })),
  { label: '[name]', re: new RegExp(`${AFTER_LABEL}\\[name\\]`, 'g') },
  { label: 'YYYY-MM-DD', re: new RegExp(`(?<=\\|[ \\t]*)YYYY-MM-DD(?=[ \\t]*\\|)|${AFTER_LABEL}YYYY-MM-DD`, 'g') },
]

// The document with HTML comments and fenced code blocks replaced by spaces, so line numbers
// still hold. Fences follow CommonMark closely enough for prose checks: a run of 3+ backticks
// or tildes opens one (at any indentation, so fences in list items count), only a run of the
// same character at least as long closes it, and an unclosed fence runs to the end of the
// document - which is how GitHub renders it.
function withoutCommentsAndFences(md) {
  const blank = (s) => s.replace(/[^\n]/g, ' ')
  let fence = null
  const lines = md.replace(/\r\n/g, '\n').split('\n').map((line) => {
    if (fence) {
      const close = line.match(/^\s*(`{3,}|~{3,})\s*$/)
      if (close && close[1][0] === fence[0] && close[1].length >= fence.length) fence = null
      return blank(line)
    }
    const open = line.match(/^\s*(`{3,}|~{3,})(.*)$/)
    if (open && !(open[1][0] === '`' && open[2].includes('`'))) {
      fence = open[1]
      return blank(line)
    }
    return line
  })
  return lines.join('\n').replace(/<!--[\s\S]*?-->/g, blank)
}

// withoutCommentsAndFences, and inline code and link reference definitions blanked too.
function proseOnly(md) {
  const blank = (s) => s.replace(/[^\n]/g, ' ')
  return withoutCommentsAndFences(md)
    .replace(/`[^`\n]*`/g, blank)
    .replace(/^ {0,3}\[[^\]\n]+\]:[ \t]*\S.*$/gm, blank)
}

// The labels a document defines as link references (`[label]: url`), lower-cased.
const linkLabels = (md) =>
  new Set([...withoutCommentsAndFences(md).matchAll(/^ {0,3}\[([^\]\n]+)\]:[ \t]*\S/gm)].map((m) => m[1].toLowerCase()))

function lintPlaceholders() {
  const docs = new Set([...REQUIRED_DOCS, 'SPEC_VERSION.md'])
  for (const c of changeDirs().filter((c) => !c.archived))
    for (const f of readdirSync(c.path)) if (f.endsWith('.md')) docs.add(`${c.path}/${f}`)
  for (const path of docs) {
    const txt = read(path)
    if (!txt) continue
    const prose = proseOnly(txt)
    const links = linkLabels(txt)
    const found = new Map() // label -> { first: index, lines: Set }
    let total = 0
    for (const { label, re } of PLACEHOLDER_RES)
      for (const m of prose.matchAll(re)) {
        if (label.startsWith('[') && links.has(label.slice(1, -1).toLowerCase())) continue // a shortcut reference link
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

// ---- 10. Version records: Revision History and SPEC_VERSION.md agree (C3) ----------
// Two records, two jobs (SPEC_VERSION.md, "Two version records"): the spec's Revision History
// logs every substantive edit and may run ahead while the spec is Draft; SPEC_VERSION.md holds
// the accepted version and moves only on acceptance and amendments. In sustain they move
// together, so a mismatch is an error. In greenfield it is a warning, and only once the spec
// says Accepted - a Draft running ahead is the rule working, not drift.
function compareVersions(a, b) {
  const x = a.split('.').map(Number)
  const y = b.split('.').map(Number)
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] || 0) - (y[i] || 0)
    if (d) return d
  }
  return 0
}
const VERSION = /^\d+(\.\d+)*$/
const cellText = (s) => (s || '').replace(/[*`]/g, '').trim()
// A version cell as a dotted number ("v1.2" -> "1.2"), or null when it is something else.
const parseVersion = (s) => {
  const v = cellText(s).replace(/^v(?=\d)/i, '')
  return VERSION.test(v) ? v : null
}

// The lines under the first heading matching `re`, up to the next heading.
function sectionBody(md, re) {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const start = lines.findIndex((l) => /^#{1,6}\s/.test(l) && re.test(l))
  if (start === -1) return ''
  const end = lines.findIndex((l, i) => i > start && /^#{1,6}\s/.test(l))
  return lines.slice(start + 1, end === -1 ? undefined : end).join('\n')
}

function lintVersionRecords() {
  const spec = read('docs/spec/technical-spec.md')
  if (!spec) return // section 1 reports a missing required spec
  const sustain = cfgValue(read('sdd.config.yml') || '', 'process', 'mode') === 'sustain'
  if (!sustain && !/^accepted$/i.test(docStatus(spec) || '')) return
  const report = (msg) =>
    (sustain ? err : warn)(
      'C3',
      `${msg} (${sustain ? 'process.mode is sustain' : 'the spec is Accepted'}, so the spec's Revision History and SPEC_VERSION.md must agree; see SPEC_VERSION.md, "Two version records")`
    )
  const log = read('SPEC_VERSION.md')
  if (!log) return report('SPEC_VERSION.md is missing')
  const history = tableRows(sectionBody(spec, /revision history/i), ['version'])
    .map((r) => cellText(r.version))
    .filter(Boolean)
  if (!history.length)
    return report('docs/spec/technical-spec.md has no Revision History table with a Version column, or no rows in it')
  const unparsed = history.filter((v) => !parseVersion(v))
  if (unparsed.length)
    return report(
      `docs/spec/technical-spec.md Revision History has ${unparsed.map((v) => `"${v}"`).join(', ')}, which spec-lint cannot compare - write versions as dotted numbers (1.2, or v1.2)`
    )
  const newest = history.map(parseVersion).sort(compareVersions).pop()
  const row = tableRows(log, ['field', 'value']).find((r) => /^spec version$/i.test(cellText(r.field)))
  if (!row) return report('SPEC_VERSION.md has no "Spec Version" row in its Current Version table')
  const current = parseVersion(row.value)
  if (!current)
    return report(
      `SPEC_VERSION.md Spec Version is "${cellText(row.value)}", which spec-lint cannot compare - write it as a dotted number (1.2, or v1.2)`
    )
  if (compareVersions(newest, current) !== 0)
    (sustain ? err : warn)(
      'C3',
      `docs/spec/technical-spec.md Revision History is at ${newest}, but SPEC_VERSION.md Current Version is ${current} - ${
        sustain
          ? 'in sustain mode every amendment bumps both in the same PR'
          : 'the spec is Accepted, so acceptance should have set both to the accepted version'
      } (see SPEC_VERSION.md, "Two version records")`
    )
}
if (!SCAFFOLD) lintVersionRecords()

// ---- 11. Change registry: CHANGE-NNNN naming + a matching row per change (C3, C8) ----
// Mirrors the ADR registry (section 3). A change is docs/changes/CHANGE-NNNN/ - the next free
// four-digit number, never an id borrowed from an issue tracker - and has a row in
// docs/changes/README.md whose Status matches its proposal.md. A row whose directory is gone
// means a change was deleted rather than archived (C8). A directory that is not CHANGE-* at
// all would escape every change check, so it fails too. Structural, so it runs in scaffold
// mode too.
function lintChangeRegistry() {
  for (const base of ['docs/changes', 'docs/changes/archive'])
    for (const d of existsSync(base) ? readdirSync(base, { withFileTypes: true }) : [])
      if (d.isDirectory() && !d.name.startsWith('CHANGE-') && !(base === 'docs/changes' && d.name === 'archive'))
        err(
          'C3',
          `${base}/${d.name} is not a change directory - everything under docs/changes/ is CHANGE-NNNN (or archive/), so the change checks would skip it; rename it CHANGE-NNNN or move it out of docs/changes/`
        )
  const changes = changeDirs()
  const rows = tableRows(read('docs/changes/README.md') || '', ['id', 'status'])
  for (const c of changes) {
    if (!/^CHANGE-\d{4}$/.test(c.name)) {
      err(
        'C3',
        `${c.path} is not named CHANGE-NNNN - a change takes the next free four-digit number (CHANGE-0001, CHANGE-0002, ...), never an issue or pull-request number; see docs/changes/README.md`
      )
      continue
    }
    const row = rows.find((r) => new RegExp(`\\b${c.name}\\b`).test(r.id))
    if (!row) {
      err('C3', `docs/changes/README.md is missing a registry row for ${c.name} (${c.path})`)
      continue
    }
    const status = docStatus(read(`${c.path}/proposal.md`))
    if (!status) {
      err('C3', `${c.path}/proposal.md has no **Status:** - the registry check reads it from there`)
      continue
    }
    if (cellText(row.status).toLowerCase() !== status.toLowerCase())
      err(
        'C3',
        `docs/changes/README.md lists ${c.name} as "${cellText(row.status)}", but ${c.path}/proposal.md says "${status}" - update the registry row`
      )
  }
  const listed = new Map() // id -> number of rows
  for (const r of rows) {
    const id = (r.id.match(/\bCHANGE-\w+/i) || [])[0]
    if (!id || id === 'CHANGE-0000') continue
    if (!/^CHANGE-\d{4}$/.test(id)) {
      err('C3', `docs/changes/README.md has a row for "${id}" - registry IDs are CHANGE-NNNN, four digits`)
      continue
    }
    listed.set(id, (listed.get(id) || 0) + 1)
    if (listed.get(id) === 2) err('C3', `docs/changes/README.md lists ${id} more than once - keep one row per change`)
    if (listed.get(id) === 1 && !changes.some((c) => c.name === id || c.name.startsWith(`${id}-`)))
      err(
        'C8',
        `docs/changes/README.md lists ${id}, but neither docs/changes/${id} nor docs/changes/archive/${id} exists - changes are archived, never deleted`
      )
  }
}
lintChangeRegistry()

// ---- 12. Change lifecycle: a delivered change is folded, bumped, archived (C3, C8) ---
// Proposed -> Accepted -> Delivered -> Archived. One PR delivers a change: it folds the delta
// into the living spec, adds a SPEC_VERSION.md Changelog row citing the change, and moves the
// directory to docs/changes/archive/. Checked mechanically: a Delivered or Archived change may
// not sit outside archive/; an archived change must have been delivered and be cited by a
// Changelog row; and a PR that touches an archived change - so editing one counts as delivering
// it again, which keeps archived records frozen - must also change SPEC_VERSION.md and the
// living spec. Whether the folded edit matches the delta is review's job. "Delivered" is
// self-declared, so the one mechanical hint that a change shipped without being delivered - every
// task box ticked while it is still active - only warns. There is no warning for a change left
// Accepted too long: a proposal's only date is when it was written.
function lintChangeLifecycle() {
  const log = read('SPEC_VERSION.md') || ''
  const changelog = tableRows(sectionBody(log, /changelog/i), ['version'])
  const citing = (id) => changelog.filter((r) => new RegExp(`\\b${id}\\b`).test(Object.values(r).join(' | ')))
  const cited = (id) => citing(id).length > 0
  for (const c of changeDirs()) {
    if (!/^CHANGE-\d{4}$/.test(c.name)) continue // section 11 reports the name
    const status = docStatus(read(`${c.path}/proposal.md`))
    if (!status) continue // section 11 reports the missing Status
    const delivered = /^(delivered|archived)$/i.test(status)
    const boxes = [...(read(`${c.path}/tasks.md`) || '').matchAll(/^\s*-\s*\[([ xX])\]/gm)].map((m) => m[1] !== ' ')
    if (!c.archived && !delivered && boxes.length && boxes.every(Boolean))
      warn(
        'C3',
        `${c.path}: every task box in tasks.md is ticked, but the change is still ${status} - if it has shipped, deliver it (fold the delta, bump SPEC_VERSION.md, archive); if not, untick what is not done`
      )
    if (!c.archived && delivered)
      err(
        'C8',
        `${c.path} is ${status} but still sits outside docs/changes/archive/ - move it to docs/changes/archive/${c.name} in the PR that delivers it`
      )
    if (c.archived && !delivered)
      err('C8', `${c.path} is archived, but its proposal.md says "${status}" - only a Delivered change is archived`)
    if (c.archived && !cited(c.name))
      err(
        'C3',
        `${c.path} is archived, but SPEC_VERSION.md has no Changelog row referencing ${c.name} - delivering a change records its amendment and version bump there (SPEC_VERSION.md, "Amendment Process")`
      )
  }
  if (!CHANGED) return
  // A change directory the PR touched that is gone from both places was deleted, not archived.
  const touched = new Set(CHANGED.map((p) => (p.match(/^docs\/changes\/(?:archive\/)?(CHANGE-\d{4})\//) || [])[1]).filter(Boolean))
  for (const id of touched)
    if (!existsSync(`docs/changes/${id}`) && !existsSync(`docs/changes/archive/${id}`))
      err('C8', `this PR deletes ${id} - changes are archived, never deleted; restore it (move it to docs/changes/archive/ if it is done)`)
  const currentRow = tableRows(log, ['field', 'value']).find((r) => /^spec version$/i.test(cellText(r.field)))
  const current = currentRow && parseVersion(currentRow.value)
  const archivedHere = new Set(
    CHANGED.map((p) => (p.match(/^docs\/changes\/archive\/(CHANGE-\d{4})\//) || [])[1]).filter(
      (id) => id && existsSync(`docs/changes/archive/${id}`)
    )
  )
  for (const id of archivedHere) {
    if (!CHANGED.includes('SPEC_VERSION.md'))
      err('C3', `this PR archives ${id} without changing SPEC_VERSION.md - delivery adds its Changelog row and version bump in the same PR`)
    const rows = citing(id)
    if (current && rows.length && !rows.some((r) => parseVersion(r.version) === current))
      err(
        'C3',
        `this PR archives ${id}, but the SPEC_VERSION.md Changelog row citing it is at ${rows.map((r) => cellText(r.version)).join(', ')}, not the Current Version ${current} - delivery adds a row at the bumped version`
      )
    if (!CHANGED.some((p) => /^docs\/(spec|design)\//.test(p) && existsSync(p)))
      err(
        'C3',
        `this PR archives ${id} without editing the living spec (docs/spec/** or docs/design/**) - delivery folds the delta in, in the same PR`
      )
  }
}
lintChangeLifecycle()

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
