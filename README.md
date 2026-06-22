<div align="center">

# Harness Starter

一套开箱即用的 Claude Code Harness Engineering 模板  
新项目和已有项目均可使用

<p>
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License">
  <img src="https://img.shields.io/badge/Claude_Code-2.1%2B-blue" alt="Claude Code 2.1+">
  <img src="https://img.shields.io/badge/tests-54%20passing-brightgreen" alt="54 tests passing">
</p>

> 其他平台（Cursor、Codex、Gemini 等）用户直接告诉 AI：「适配这个模板到我的环境」

<br>

https://github.com/chenklein26-maker/Harness-Starter

</div>

---

## 设计理念

每次新建项目，都要反复告诉 AI 同样的规则。  
**Harness Starter 把重复劳动固化为自动化机制。装一次，所有项目通用。**

## 安装

```bash
npx harness-starter
```

在 Claude Code 中输入 `帮我初始化 Harness`，AI 自动检测技术栈 → 填写 CLAUDE.md → 安装 Language Server → 健康检查。

## 核心能力

- **🛡️ 安全护栏** — PreToolUse 自动拦截 .env 写入、危险命令
- **📋 审计闭环** — 每次 AI 响应后自动审查变更，按日期累积报告
- **🧠 行为准则** — 6 条 Karpathy 原则 + 6 级精简梯子（YAGNI → 标准库 → 原生 → 已有依赖 → 一行 → 最少）
- **🔧 渐进增强** — L2 核心开箱即用，L3+ 按需启用

## 30 秒感受

```bash
npx harness-starter
cd my-project
# 在 Claude Code 中：帮我初始化 Harness
# 搞定。
```

## 项目结构

```
your-project/
├── CLAUDE.md                   AI 行为规则（~70 行）
├── .lsp.json                   LSP 配置
├── scripts/
│   ├── check.mjs               健康检查
│   └── init.mjs                安装器
└── .claude/
    ├── settings.json           3 个 Hook 注册
    ├── hooks/                  安全拦截 + 上下文 + 审查
    └── skills/                 安装向导 + 模式切换
```

L3+ 可选：自动格式化、GC 扫描、循环工程 → [GitHub 仓库](https://github.com/chenklein26-maker/Harness-Starter)

## 升级路径

| 级别 | 功能 | 启用方式 |
|:---:|---|---------|
| L2 | 安全护栏 + 审计闭环 + 行为准则 | **`npx` 开箱即用** |
| L3 | 自动格式化 + 长会话保护 | 复制 PostToolUse + PreCompact Hook |
| L4 | GC 自治扫描 + Circuit Breaker | 复制 `scripts/gc-scan.mjs` |
| L5 | 循环工程 + Maker/Checker 分离 | 组装 loop 模板 |

[CHANGELOG.md](CHANGELOG.md) · [English](README.en.md) · MIT License
