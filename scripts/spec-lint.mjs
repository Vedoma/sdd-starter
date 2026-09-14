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

// Spec References accepted on presence alone because they name nothing resolvable (C1).
const presenceOnly = []
// Informational lines - a skipped check says so instead of passing silently.
const notes = []

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
// Resolve a filled Spec Reference. A `§N` must be a numbered heading of technical-spec.md - or,
// when the reference also names a change, a section that change's spec-delta.md touches (a
// delta may ADD a section the spec does not have yet). A `CHANGE-NNNN` must be a change
// directory, active or archived. A reference into another document, or naming neither form,
// cannot be resolved and is accepted on presence alone. Returns { problems, resolvable }.
function resolveSpecRef(ref) {
  const problems = []
  const changes = [...new Set(ref.match(/CHANGE-\d{4}\b/g) || [])]
  for (const id of changes)
    if (!existsSync(`docs/changes/${id}`) && !existsSync(`docs/changes/archive/${id}`))
      problems.push(`names ${id}, but neither docs/changes/${id} nor docs/changes/archive/${id} exists`)
  const otherDoc = (ref.match(/[\w./-]+\.md\b/g) || []).some((d) => !d.endsWith('technical-spec.md'))
  const tokens = otherDoc ? [] : [...ref.matchAll(/§\s*([0-9][\w.]*)/g)].map((m) => m[1].replace(/\.+$/, ''))
  if (tokens.length) {
    const spec = (read('docs/spec/technical-spec.md') || '').replace(/\r\n/g, '\n')
    const sections = new Set([...spec.matchAll(/^#{1,6}\s+§?\s*(\d+(?:\.\d+)*)\.?(?=\s|$)/gm)].map((m) => m[1]))
    for (const id of changes) {
      const delta = read(`docs/changes/${id}/spec-delta.md`) ?? read(`docs/changes/archive/${id}/spec-delta.md`) ?? ''
      for (const line of delta.split('\n'))
        if (/^#{1,6}\s/.test(line)) for (const m of line.matchAll(/§\s*(\d+(?:\.\d+)*)/g)) sections.add(m[1])
    }
    const where = ['docs/spec/technical-spec.md', ...changes.map((id) => `${id}'s spec-delta.md`)].join(' or ')
    for (const t of tokens) {
      if (!/^\d+(\.\d+)*$/.test(t)) problems.push(`§${t} is not a section number`)
      else if (!sections.has(t)) problems.push(`§${t} is not a section of ${where}`)
    }
  }
  return { problems, resolvable: changes.length > 0 || tokens.length > 0 }
}

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
    // The table form captures its own cell only: `(.+)` also took the closing pipe, so a
    // blank or dash-only cell read as "|" and passed.
    const specRef = b.match(/\*\*Spec Reference\*\*\s*\|([^|\n]*)/) || b.match(/Spec Reference[:|]\s*(.+)/)
    const refVal = specRef ? specRef[1].trim() : ''
    if (!refVal || /^[-—\s]*$/.test(refVal) || /section\(s\) from/i.test(refVal) || refVal.includes('[')) {
      err('C1', `${path}: ${id} has no filled Spec Reference`)
    } else if (!SCAFFOLD) {
      // Project-level: resolving against a technical-spec.md that is still the template means nothing.
      const { problems, resolvable } = resolveSpecRef(refVal)
      for (const p of problems) err('C1', `${path}: ${id} Spec Reference ${p}`)
      if (!resolvable) presenceOnly.push(`${path} ${id}`)
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
// The PR-body checks (this one and section 13) read PR_BODY, which CI sets on pull requests
// only. Automated PRs are exempt from both, by one explicit policy: a bot author
// (PR_AUTHOR_TYPE=Bot, or a login ending in [bot] - Dependabot, release automation), or a body
// with a visible line "spec-lint: skip-pr-template - <reason>" (a pure revert, say). The
// exemption is printed as a note, and an opt-out without a reason is an error - never a silent
// pass. An opt-out inside an HTML comment or code fence does not count.
const PR_BODY = SCAFFOLD ? null : (process.env.PR_BODY ?? null)
function prExemption(body) {
  const author = process.env.PR_AUTHOR || ''
  if (process.env.PR_AUTHOR_TYPE === 'Bot' || /\[bot\]$/.test(author)) return `the PR author ${author || '(unknown)'} is a bot`
  const m = withoutCommentsAndFences(body).match(/^[ \t]*spec-lint:[ \t]*skip-pr-template\b[ \t]*[-—:]?[ \t]*(.*)$/im)
  if (!m) return null
  const reason = m[1].trim()
  if (!reason)
    err(
      'C1',
      'the PR body opts out of the PR checks ("spec-lint: skip-pr-template") without a reason - give one, e.g. "spec-lint: skip-pr-template - reverts #123"'
    )
  return `the PR body opts out${reason ? `: "${reason}"` : ''}`
}
const PR_EXEMPT = PR_BODY == null ? null : prExemption(PR_BODY)
if (PR_EXEMPT) notes.push(`PR body checks (Spec Reference, template structure) skipped - ${PR_EXEMPT}`)

// A blank body is reported once, by section 13.
if (PR_BODY != null && !PR_EXEMPT && PR_BODY.trim() !== '') {
  const body = PR_BODY
  const m = body.match(/\*\*Spec Reference\*\*\s*\|([^|\n]*)/)
  const val = m ? m[1].trim() : ''
  if (!val || /^[-—\s]*$/.test(val) || /section\(s\) from technical-spec/i.test(val) || val === '§[section(s) from technical-spec.md — required]') {
    err('C1', 'the PR body has no filled Spec Reference (see the PR template)')
  } else {
    const { problems, resolvable } = resolveSpecRef(val)
    for (const p of problems) err('C1', `the PR body's Spec Reference ${p}`)
    if (!resolvable) presenceOnly.push('PR body')
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

// Markdown with fenced code blocks and HTML comments replaced by spaces, so line numbers still
// hold and neither counts as content or structure.
function withoutCommentsAndFences(md) {
  const blank = (m) => m.replace(/[^\n]/g, ' ')
  return md
    .replace(/\r\n/g, '\n')
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, blank)
    .replace(/<!--[\s\S]*?-->/g, blank)
}

// ...and inline code blanked too.
function proseOnly(md) {
  return withoutCommentsAndFences(md).replace(/`[^`\n]*`/g, (m) => ' '.repeat(m.length))
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
  const log = read('SPEC_VERSION.md')
  if (!spec || !log) return
  const sustain = cfgValue(read('sdd.config.yml') || '', 'process', 'mode') === 'sustain'
  if (!sustain && !/^accepted$/i.test(docStatus(spec) || '')) return
  const newest = tableRows(sectionBody(spec, /revision history/i), ['version'])
    .map((r) => cellText(r.version))
    .filter((v) => VERSION.test(v))
    .sort(compareVersions)
    .pop()
  const row = tableRows(log, ['field', 'value']).find((r) => /^spec version$/i.test(cellText(r.field)))
  const current = row ? cellText(row.value) : ''
  if (!newest || !VERSION.test(current)) {
    if (sustain)
      err(
        'C3',
        !newest
          ? 'docs/spec/technical-spec.md has no Revision History version - in sustain mode its newest row must match SPEC_VERSION.md Current Version'
          : `SPEC_VERSION.md has no Current Version "Spec Version" row - in sustain mode it must match the spec's Revision History`
      )
    return
  }
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
// means a change was deleted rather than archived (C8). Structural, so it runs in scaffold
// mode too.
function lintChangeRegistry() {
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
  for (const r of rows) {
    const id = (r.id.match(/CHANGE-\d{4}/) || [])[0]
    if (id && id !== 'CHANGE-0000' && !changes.some((c) => c.name === id || c.name.startsWith(`${id}-`)))
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
// living spec. Whether the folded edit matches the delta is review's job. There is no warning
// for a change left Accepted too long: a proposal's only date is when it was written.
function lintChangeLifecycle() {
  const changelog = tableRows(sectionBody(read('SPEC_VERSION.md') || '', /changelog/i), ['version'])
  const cited = (id) => changelog.some((r) => new RegExp(`\\b${id}\\b`).test(Object.values(r).join(' | ')))
  for (const c of changeDirs()) {
    if (!/^CHANGE-\d{4}$/.test(c.name)) continue // section 11 reports the name
    const status = docStatus(read(`${c.path}/proposal.md`))
    if (!status) continue // section 11 reports the missing Status
    const delivered = /^(delivered|archived)$/i.test(status)
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
  const archivedHere = new Set(
    CHANGED.map((p) => (p.match(/^docs\/changes\/archive\/(CHANGE-\d{4})\//) || [])[1]).filter(
      (id) => id && existsSync(`docs/changes/archive/${id}`)
    )
  )
  for (const id of archivedHere) {
    if (!CHANGED.includes('SPEC_VERSION.md'))
      err('C3', `this PR archives ${id} without changing SPEC_VERSION.md - delivery adds its Changelog row and version bump in the same PR`)
    if (!CHANGED.some((p) => /^docs\/(spec|design)\//.test(p)))
      err(
        'C3',
        `this PR archives ${id} without editing the living spec (docs/spec/** or docs/design/**) - delivery folds the delta in, in the same PR`
      )
  }
}
lintChangeLifecycle()

// ---- 13. The PR body keeps the PR template's structure (C1) ------------------------
// GitHub injects .github/PULL_REQUEST_TEMPLATE.md only for web-UI or interactive creation;
// `gh pr create --body` / `--body-file` bypass it, which is how agents open PRs. A body rebuilt
// from memory of what CI inspects degrades to exactly the inspected part, so the structure is
// enforced - read from the template at runtime, never hardcoded, so that editing the template
// changes what is enforced.
//
// Policy, deliberately:
// - Headings, not prose. Every template heading outside HTML comments and code fences must
//   appear in the body at the same level with the same text. Extra sections are fine and order
//   is not checked; a heading inside a fence or comment does not count - quoting the template
//   is not filling it. What is written under a heading is never judged: that is review's job,
//   and a linter that tried would be gamed with one-word sections.
// - Checkboxes need not be ticked. Requiring ticks teaches authors to tick without reading and
//   turns a review aid into a formality.
// - The template's own bracketed placeholders (TASK-[XXX], M[X], ...) must be replaced, matched
//   as those exact strings - never a generic [...] pattern, which would reject array indexing,
//   links, or [OPEN - REQUIRES INPUT]. An unticked option whose label merely contains one is an
//   option not chosen (the "Yes" line of "Spec Amendment Required?") and is ignored; an unticked
//   item that is nothing but a placeholder was never filled in, and is not.
// - The Spec Reference row is section 4's alone, so its placeholder is not reported here; a
//   blank body is reported here, once. Automated PRs are exempt - see section 4.
const PR_TEMPLATE = '.github/PULL_REQUEST_TEMPLATE.md'
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const headingsOf = (md) =>
  [...md.matchAll(/^(#{1,6})[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/gm)].map((m) => ({
    level: m[1].length,
    text: m[2].replace(/\s+/g, ' '),
  }))
const headingLine = (h) => `${'#'.repeat(h.level)} ${h.text}`

// The template's bracketed placeholders, each with the text glued to it (TASK-[XXX], M[X]).
function templatePlaceholders(template) {
  const found = new Set()
  for (const line of withoutCommentsAndFences(template).split('\n')) {
    if (line.includes('**Spec Reference**')) continue // section 4 owns this row
    for (const m of line.matchAll(/[^\s|`(]*\[[^\]\n]+\][^\s|`)]*/g)) {
      if (/^\[[ xX]\]$/.test(m[0])) continue // a bare checkbox - but M[X] is a placeholder
      if (line[m.index + m[0].length] === '(') continue // a link
      found.add(m[0])
    }
  }
  return [...found]
}

function lintPrTemplate(body) {
  const template = read(PR_TEMPLATE)
  if (template == null) {
    notes.push(`PR template structure not checked - there is no ${PR_TEMPLATE} to read it from`)
    return
  }
  const bypass = `gh pr create --body / --body-file bypasses GitHub's template injection, so copy ${PR_TEMPLATE} and fill it in`
  if (!body.trim()) {
    err('C1', `the PR body is empty - ${bypass}`)
    return
  }
  const clean = withoutCommentsAndFences(body)
  const have = headingsOf(clean)
  const quoted = headingsOf(body.replace(/\r\n/g, '\n'))
  const same = (a, b) => a.level === b.level && a.text === b.text
  const missing = headingsOf(withoutCommentsAndFences(template))
    .filter((h) => !have.some((x) => same(x, h)))
    .map((h) => {
      const moved = have.find((x) => x.text === h.text)
      if (moved) return `"${headingLine(h)}" (found as "${headingLine(moved)}" - keep the template's heading level)`
      if (quoted.some((x) => same(x, h))) return `"${headingLine(h)}" (present only inside a code fence or HTML comment)`
      return `"${headingLine(h)}"`
    })
  if (missing.length)
    err(
      'C1',
      `the PR body is missing ${missing.length} section${missing.length > 1 ? 's' : ''} of ${PR_TEMPLATE}: ${missing.join(', ')} - ${bypass}, keeping every heading`
    )
  const lines = clean.split('\n')
  const left = templatePlaceholders(template).filter((p) => {
    const re = new RegExp(`(?<![\\w-])${escapeRe(p)}(?![\\w-])`)
    return lines.some((l) => {
      if (!re.test(l)) return false
      const option = l.match(/^\s*[-*+]\s+\[ \]\s+(.*)$/)
      return !option || option[1].trim() === p
    })
  })
  if (left.length)
    err(
      'C1',
      `the PR body still carries ${PR_TEMPLATE} placeholder${left.length > 1 ? 's' : ''} ${left.map((p) => `"${p}"`).join(', ')} - replace each with the real value, or delete an example row that does not apply`
    )
}
if (PR_BODY != null && !PR_EXEMPT) lintPrTemplate(PR_BODY)

// ---- report ----------------------------------------------------------------------
if (SCAFFOLD)
  console.log(
    'note    scaffold mode: docs/spec/technical-spec.md is still the template, so project-level checks (mandatory docs, process mode, placeholders, PR Spec Reference) are skipped until it is filled in.'
  )
if (presenceOnly.length)
  console.log(
    `note    presence-only Spec Reference - it points at neither a technical-spec.md §section nor a CHANGE-NNNN, so it could not be resolved: ${presenceOnly.join(', ')}`
  )
for (const n of notes) console.log(`note    ${n}`)
for (const w of warnings) console.log(`warning ${w}`)
for (const e of errors) console.log(`error   ${e}`)
if (errors.length) {
  console.log(`\nspec-lint: ${errors.length} error(s), ${warnings.length} warning(s)`)
  process.exit(1)
}
console.log(`spec-lint: passed (${warnings.length} warning(s))`)
