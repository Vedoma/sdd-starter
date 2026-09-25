#!/usr/bin/env node
// ADR lifecycle mutation for the /adr slash-command workflow.
//
// Invoked by .github/workflows/adr-status.yml. ALL inputs arrive via env vars
// (never shell-interpolated), so a crafted PR comment cannot inject shell or
// arbitrary file content - the only user-controlled text that reaches a file is
// the reason, sanitized into a single markdown list line.
//
// Env in:
//   COMMENT_BODY  raw PR comment body
//   ADR_FILE      path to the single ADR file changed by the PR
//   ACTOR         commenter login (without @)
//   PR_NUMBER     PR number
//   DATE          ISO date (YYYY-MM-DD) supplied by the workflow
//   ADR_DIR       directory holding ADR files (default: docs/adr)
//   GITHUB_OUTPUT step output file
//
// Besides the ADR file(s), a transition updates the matching Decision Registry row in
// ${ADR_DIR}/README.md (spec-lint fails a PR whose registry disagrees with the front matter).
//
// Output (to GITHUB_OUTPUT): ok=true|false, plus on success
//   changed=<space-separated files> newstatus=<...> summary=<...>
// or on a handled failure: error=<message>. Always exits 0 so the workflow
// branches on `ok`; the workflow marks the job failed when ok=false.

import { readFileSync, writeFileSync, readdirSync, appendFileSync } from 'node:fs'
import { join, basename } from 'node:path'

const env = process.env
const ADR_DIR = env.ADR_DIR || 'docs/adr'

function oneLine(s) {
  // Replace every control character (incl. newlines/tabs) with a space.
  let out = ''
  for (const ch of String(s)) {
    const c = ch.codePointAt(0)
    out += c < 32 || c === 127 ? ' ' : ch
  }
  return out
}

function emit(obj) {
  const lines = Object.entries(obj).map(([k, v]) => `${k}=${oneLine(v)}`)
  if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, lines.join('\n') + '\n')
  for (const l of lines) console.log(l)
}

function handledFailure(message) {
  emit({ ok: 'false', error: message })
  process.exit(0)
}

// Collapse a user reason into a single safe markdown line: strip control chars
// (prevents structure injection), collapse whitespace, cap length.
function sanitizeReason(raw) {
  return oneLine(raw || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500)
}

// Strip one optional surrounding pair of double quotes:
//   /adr reject "the reason"  ->  the reason   (unquoted input also accepted)
function unquote(s) {
  const t = (s || '').trim()
  const m = t.match(/^"(.*)"$/)
  return m ? m[1] : t
}

function frontMatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---\n?/)
  return m ? { block: m[0], body: m[1], end: m[0].length } : null
}

function readStatus(content) {
  const fm = frontMatter(content)
  if (!fm) return null
  const m = fm.body.match(/^status:\s*['"]?([^'"\n]+?)['"]?\s*$/m)
  return m ? m[1].trim() : null
}

function setStatus(content, newStatus, date) {
  const fm = frontMatter(content)
  if (!fm) throw new Error('no front matter')
  let block = fm.block.replace(/^status:.*$/m, `status: '${newStatus}'`)
  if (/^date:.*$/m.test(block)) block = block.replace(/^date:.*$/m, `date: ${date}`)
  else block = block.replace(/\n---\n?$/, `\ndate: ${date}\n---\n`)
  return block + content.slice(fm.end)
}

// Ensures `actor` is listed in the front-matter `decision-makers` flow list.
// Returns { content, added }; added=false when the actor is already listed.
// The actor is pre-sanitized to [A-Za-z0-9-], so inserting it into the flow
// list cannot break the front-matter structure.
function addDecisionMaker(content, actor) {
  const fm = frontMatter(content)
  if (!fm) throw new Error('no front matter')
  const line = fm.body.match(/^decision-makers:\s*\[([^\]]*)\]\s*$/m)
  if (!line) {
    // No flow-style list (template guarantees one; be tolerant): add it.
    const block = fm.block.replace(/^date:.*$/m, (d) => `${d}\ndecision-makers: [${actor}]`)
    return { content: block + content.slice(fm.end), added: block !== fm.block }
  }
  const names = line[1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (names.some((n) => n.toLowerCase() === actor.toLowerCase())) {
    return { content, added: false }
  }
  const block = fm.block.replace(
    /^decision-makers:\s*\[[^\]]*\]\s*$/m,
    `decision-makers: [${[...names, actor].join(', ')}]`
  )
  return { content: block + content.slice(fm.end), added: true }
}

function appendHistory(content, line) {
  const heading = '## Status history'
  const idx = content.indexOf(heading)
  if (idx === -1) throw new Error('no Status history section')
  const after = idx + heading.length
  const nextIdx = content.indexOf('\n## ', after)
  const sectionEnd = nextIdx === -1 ? content.length : nextIdx
  const section = content.slice(after, sectionEnd).replace(/\s+$/, '')
  return content.slice(0, after) + section + `\n${line}\n` + content.slice(sectionEnd)
}

function adrId(file) {
  // Filenames are ADR-NNNN-slug.md, so the number is the second dash-segment.
  return `ADR-${basename(file).split('-')[1]}`
}

// Sets `updates` ({ column: value }, lower-cased header names) on the Decision Registry row
// for `id` in README.md. Values come from a fixed set - statuses and ADR ids - never from the
// comment. Only the updated cells are rewritten, so the row keeps its spacing and its line
// ending. A registry with no "Superseded By" column gets "superseded by ADR-NNNN" in its
// Status cell instead, which spec-lint reads the same way. Returns the README path when a row
// changed, else null (no README, no row: spec-lint reports a missing row on its own).
function syncRegistryRow(id, updates) {
  const path = join(ADR_DIR, 'README.md')
  let text
  try {
    text = readFileSync(path, 'utf8')
  } catch {
    return null
  }
  const lines = text.split('\n')
  let header = null
  let touched = false
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim().startsWith('|')) {
      header = null
      continue
    }
    const cells = lines[i].trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
    if (!header) {
      header = cells.map((c) => c.toLowerCase())
      continue
    }
    const idCol = header.indexOf('id')
    if (idCol === -1 || !new RegExp(`\\b${id}\\b`).test(cells[idCol] || '')) continue
    const set = { ...updates }
    if (set['superseded by'] && !header.includes('superseded by'))
      set.status = `${set.status} by ${set['superseded by']}`
    // Raw segments between pipes: cell k is segment k + 1 (segment 0 precedes the first pipe).
    const segments = lines[i].split('|')
    for (const [col, value] of Object.entries(set)) {
      const k = header.indexOf(col)
      if (k !== -1 && k < cells.length && cells[k] !== value) segments[k + 1] = ` ${value} `
    }
    const next = segments.join('|')
    if (next !== lines[i]) {
      lines[i] = next
      touched = true
    }
  }
  if (!touched) return null
  writeFileSync(path, lines.join('\n'))
  return path
}

function findAdrFile(num) {
  const padded = String(num).padStart(4, '0')
  const files = readdirSync(ADR_DIR).filter((f) => f.startsWith(`ADR-${padded}-`) && f.endsWith('.md'))
  return files.length ? join(ADR_DIR, files[0]) : null
}

// ---- parse the command (first line only; strict, ignores quoted replies) ----
const firstLine = oneLine((env.COMMENT_BODY || '').split('\n')[0]).trim()
let action
let reason = ''
let supersedesNum = null
let mm

if ((mm = firstLine.match(/^\/adr\s+accept\s+supersedes\s+ADR-(\d{1,4})\s*$/i))) {
  action = 'accept'
  supersedesNum = mm[1]
} else if (/^\/adr\s+accept\s*$/i.test(firstLine)) {
  action = 'accept'
} else if ((mm = firstLine.match(/^\/adr\s+reject\b\s*(.*)$/i))) {
  action = 'reject'
  reason = unquote(mm[1])
} else if ((mm = firstLine.match(/^\/adr\s+deprecate\b\s*(.*)$/i))) {
  action = 'deprecate'
  reason = unquote(mm[1])
} else {
  emit({ ok: 'true', changed: '', summary: 'no-op (not a recognized /adr command)' })
  process.exit(0)
}

const file = env.ADR_FILE
if (!file) handledFailure('No ADR file provided.')

let content
try {
  content = readFileSync(file, 'utf8')
} catch {
  handledFailure(`Cannot read ${file}.`)
}

const current = readStatus(content)
if (current === null) {
  handledFailure(
    `${basename(file)} has no front-matter status. Migrate it to the front-matter template before using /adr.`
  )
}
if (!content.includes('## Status history')) {
  handledFailure(
    `${basename(file)} has no Status history section. Migrate it to the front-matter template before using /adr.`
  )
}

const actor = (env.ACTOR || 'unknown').replace(/[^A-Za-z0-9-]/g, '')
const pr = (env.PR_NUMBER || '').replace(/[^0-9]/g, '')
const date = (env.DATE || '').replace(/[^0-9-]/g, '')
const reasonClean = sanitizeReason(reason)
const suffix = reasonClean ? `: ${reasonClean}` : ''
const changed = []
const addChanged = (p) => {
  if (p && !changed.includes(p)) changed.push(p)
}

function flip(from, statusStr) {
  if (current !== from) {
    handledFailure(
      `${basename(file)} is ${current}, but /adr ${action} requires ${from}. Edit the file manually to change a settled status.`
    )
  }
  let next = setStatus(content, statusStr, date)
  next = appendHistory(next, `- ${date} - ${statusStr} by @${actor} (#${pr})${suffix}`)
  writeFileSync(file, next)
  addChanged(file)
  addChanged(syncRegistryRow(adrId(file), { status: statusStr }))
}

if (action === 'accept') {
  if (current === 'accepted' && !supersedesNum) {
    const res = addDecisionMaker(content, actor)
    if (!res.added) {
      emit({
        ok: 'true',
        changed: '',
        summary: `${adrId(file)} is already accepted and @${actor} is already a decision-maker - nothing to do`,
      })
      process.exit(0)
    }
    const next = appendHistory(res.content, `- ${date} - also accepted by @${actor} (#${pr})`)
    writeFileSync(file, next)
    emit({
      ok: 'true',
      changed: file,
      newstatus: 'accepted',
      summary: `${adrId(file)} co-accepted by @${actor} (added to decision-makers)`,
    })
    process.exit(0)
  }
  if (current === 'accepted' && supersedesNum) {
    handledFailure(
      `${basename(file)} is already accepted - "supersedes" must ride the first acceptance. Edit ADR-${supersedesNum} manually to supersede it now.`
    )
  }
  flip('proposed', 'accepted')
  {
    const res = addDecisionMaker(readFileSync(file, 'utf8'), actor)
    if (res.added) writeFileSync(file, res.content)
  }
  if (supersedesNum) {
    const target = findAdrFile(supersedesNum)
    if (!target) handledFailure(`Cannot find ADR-${supersedesNum} to supersede.`)
    if (target === file) handledFailure('An ADR cannot supersede itself.')
    const tcontent = readFileSync(target, 'utf8')
    const tcurrent = readStatus(tcontent)
    if (tcurrent === null)
      handledFailure(`ADR-${supersedesNum} has no front-matter status; migrate it first.`)
    if (tcurrent !== 'accepted')
      handledFailure(
        `ADR-${supersedesNum} is ${tcurrent}, not accepted; only an accepted ADR can be superseded.`
      )
    if (!tcontent.includes('## Status history'))
      handledFailure(`ADR-${supersedesNum} has no Status history section; migrate it first.`)
    const thisId = adrId(file)
    let tnext = setStatus(tcontent, `superseded by ${thisId}`, date)
    tnext = appendHistory(tnext, `- ${date} - superseded by ${thisId} (#${pr})`)
    writeFileSync(target, tnext)
    addChanged(target)
    addChanged(syncRegistryRow(adrId(target), { status: 'superseded', 'superseded by': thisId }))
  }
  emit({
    ok: 'true',
    changed: changed.join(' '),
    newstatus: 'accepted',
    summary: `${adrId(file)} accepted${supersedesNum ? `, ADR-${supersedesNum} superseded` : ''}`,
  })
} else if (action === 'reject') {
  flip('proposed', 'rejected')
  emit({
    ok: 'true',
    changed: changed.join(' '),
    newstatus: 'rejected',
    summary: `${adrId(file)} rejected`,
  })
} else if (action === 'deprecate') {
  flip('accepted', 'deprecated')
  emit({
    ok: 'true',
    changed: changed.join(' '),
    newstatus: 'deprecated',
    summary: `${adrId(file)} deprecated`,
  })
}
