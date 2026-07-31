# GEMINI.md

Context file for Gemini CLI — the counterpart to `CLAUDE.md`. Its one job: make
`constitution.md` and `AGENTS.md` always-loaded for Gemini too, so the binding rules are
present outside any single command.

The two files below are **imported, not summarized**: Gemini CLI inlines their full
content via the `@file.md` import syntax. Do not restate their content here — edit the
source instead, so there is one copy to keep current.

@constitution.md

@AGENTS.md

<!--
Alternative to this file: point Gemini CLI straight at AGENTS.md by setting the context
filename in .gemini/settings.json —

  { "context": { "fileName": ["AGENTS.md", "constitution.md", "GEMINI.md"] } }

Both mechanisms load the same single source; this file is the zero-config default.
-->
