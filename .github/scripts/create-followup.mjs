#!/usr/bin/env node
// Build a follow-up issue from the comment a maintainer invoked /create-followup on.
//
// Invoked by .github/workflows/create-followup.yml. ALL user text arrives via env
// vars (never shell-interpolated); the title is sanitized to a single safe line and
// the body is written to a file, so a crafted comment cannot inject shell.
//
// Env in:
//   COMMENT_BODY    raw body of the /create-followup comment
//   SOURCE_RAW      body of the parent comment (review-thread replies only; else empty)
//   ACTOR           commenter login (without @)
//   COMMENT_URL     html_url of the /create-followup comment (backlink)
//   CONTEXT_NUMBER  the issue or PR number the comment lives on
//   BODY_FILE       path to write the generated issue body
//   GITHUB_OUTPUT   step output file
//
// Output (GITHUB_OUTPUT): ok=true title=<...>  | on failure: ok=false error=<...>
// Always exits 0 so the workflow branches on `ok`.

import { writeFileSync, appendFileSync } from 'node:fs'

const env = process.env
const COMMAND = '/create-followup'

function emit(obj) {
  const lines = Object.entries(obj).map(([k, v]) => `${k}=${String(v).replace(/[\r\n]+/g, ' ')}`)
  if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, lines.join('\n') + '\n')
  for (const l of lines) console.log(l)
}
function fail(message) {
  emit({ ok: 'false', error: message })
  process.exit(0)
}

const body = String(env.COMMENT_BODY || '').replace(/\r\n/g, '\n')
const sourceRaw = String(env.SOURCE_RAW || '').trim()

// Split the command comment into: the command line (+ any inline note), a quoted
// block (from GitHub "Quote reply", lines starting with ">"), and the remaining note.
const quoted = []
const rest = []
let noteInline = ''
for (const line of body.split('\n')) {
  const trimmed = line.trim()
  if (!noteInline && trimmed.toLowerCase().startsWith(COMMAND)) {
    noteInline = trimmed.slice(COMMAND.length).trim()
    continue
  }
  if (/^\s*>/.test(line)) {
    quoted.push(line.replace(/^\s*>\s?/, ''))
    continue
  }
  rest.push(line)
}
const quotedText = quoted.join('\n').trim()
const noteText = [noteInline, rest.join('\n').trim()].filter(Boolean).join('\n\n').trim()

// Choose the source - "the comment I'm answering":
//   1. the parent comment (a review-thread reply), else
//   2. the quoted text (a "Quote reply"), else
//   3. the note typed after the command, else give up with guidance.
let source = ''
let sourceKind = ''
if (sourceRaw) {
  source = sourceRaw
  sourceKind = 'the comment this reply is under'
} else if (quotedText) {
  source = quotedText
  sourceKind = 'the quoted comment'
} else if (noteText) {
  source = noteText
  sourceKind = 'this comment'
} else {
  fail(
    `\`${COMMAND}\` needs something to summarize: reply to a comment with it, use **Quote reply** to quote one, or add text after the command.`
  )
}

// Deterministic title from the first meaningful line of the source.
const firstLine = source.split('\n').map((s) => s.trim()).find(Boolean) || ''
const clean = firstLine.replace(/[`*_#>\[\]]/g, '').replace(/\s+/g, ' ').trim()
let title = clean ? `Follow-up: ${clean}` : `Follow-up from #${env.CONTEXT_NUMBER || ''}`.trim()
if (title.length > 72) title = title.slice(0, 69).replace(/\s+\S*$/, '') + '...'
title = [...title].map((c) => (c.codePointAt(0) < 32 ? ' ' : c)).join('')

// Body: attribution, a backlink, the quoted source, and any extra note.
const actor = (env.ACTOR || 'someone').replace(/[^A-Za-z0-9-]/g, '')
const url = env.COMMENT_URL || ''
const quoteBlock = source.split('\n').map((l) => `> ${l}`).join('\n')
let issueBody = `Spun off from ${sourceKind} by @${actor} via \`${COMMAND}\`.\n\n`
if (url) issueBody += `**Source:** ${url}\n\n`
issueBody += `${quoteBlock}\n`
if (noteText && source !== noteText) issueBody += `\n**Note from @${actor}:** ${noteText}\n`
issueBody += `\n---\n_Created automatically from #${env.CONTEXT_NUMBER || ''}._\n`

writeFileSync(env.BODY_FILE, issueBody)
emit({ ok: 'true', title })
