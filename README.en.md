<div align="center">

# Harness Starter

A ready-to-use Claude Code Harness Engineering template  
Works with both new and existing projects

<p>
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License">
  <img src="https://img.shields.io/badge/Claude_Code-2.1%2B-blue" alt="Claude Code 2.1+">
  <img src="https://img.shields.io/badge/tests-54%20passing-brightgreen" alt="54 tests passing">
</p>

> Other platforms (Cursor, Codex, Gemini, etc.): just tell your AI "adapt this template to my environment"

<br>

https://github.com/chenklein26-maker/Harness-Starter

</div>

---

## Design

Every new project requires repeating the same rules to the AI.  
**Harness Starter automates this through hooks. Install once, use everywhere.**

## Install

```bash
npx harness-starter
```

Then in Claude Code: `Initialize this project with Harness Starter`.  
AI auto-detects tech stack → fills CLAUDE.md → installs Language Server → runs health check.

## Core Features

- **🛡️ Safety Guard** — PreToolUse blocks .env writes and dangerous commands
- **📋 Audit Trail** — Every AI response triggers automatic review, reports by date
- **🧠 Behavior Rules** — 6 Karpathy principles + 6-rung simplicity ladder (YAGNI → stdlib → platform → existing deps → one line → minimum)
- **🔧 Progressive** — L2 core out of the box, L3+ on demand

## Project Structure

```
your-project/
├── CLAUDE.md                   AI behavior rules (~70 lines)
├── .lsp.json                   LSP configuration
├── scripts/
│   ├── check.mjs               Health check
│   └── init.mjs                Installer
└── .claude/
    ├── settings.json           3 hooks registered
    ├── hooks/                  Safety + context + review
    └── skills/                 Setup wizard + mode switching
```

L3+ optional: auto-format, GC scan, loop engineering → [GitHub repo](https://github.com/chenklein26-maker/Harness-Starter)

## Upgrade Path

| Level | Feature | How to enable |
|:---:|---|---------|
| L2 | Safety + Audit + Behavior Rules | **`npx` out of the box** |
| L3 | Auto-format + Long-session guard | Copy PostToolUse + PreCompact hooks |
| L4 | GC scan + Circuit Breaker | Copy `scripts/gc-scan.mjs` |
| L5 | Loop Engineering | Assemble loop templates |

[CHANGELOG.md](CHANGELOG.md) · [中文版](README.md) · MIT License
