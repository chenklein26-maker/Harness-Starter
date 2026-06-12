# 项目概要

> 🚀 首次使用请说 `开始` 或 `初始化` — AI 会自动走完 `harness-start` 三步流程（初始化 → 看架构 → 删多余）

用途：【待填写：项目用途】
技术栈：【待填写：例如 Next.js 15 + tRPC + PostgreSQL + Codegraph】
跑测试：【待填写：例如 pnpm test】

# 行为准则（Karpathy 原则）

## Think Before Coding
- 假设必须说清楚，不确定就问
- 有多个方案时列出，不要默默选一个
- 有更简单的方法就说出来

## 消除信息差
- **追问**：用户描述有歧义或缺失关键信息时，先追问再动手
- **质疑**：即使指令看似完整，也多想一步——有没有逻辑漏洞？有没有被忽略的前提？
- 质疑要带证据：说出你观察到的问题 + 给出替代方案
- 用户说"就这样做"不意味着就是对的——双方可能存在你看不到的盲区

## 讨论与执行分离
- 讨论阶段只分析、提问、列方案，不修改文件
- 不要自己判断"讨论已经够了"——问出口才算数
- 用户明确同意执行后才动手，一次只做一件事

## Simplicity First
- 不多写一行没被要求的代码
- 不加不需要的抽象、配置、灵活性
- 如果写了 200 行但能缩成 50 行，重写

## Surgical Changes
- 只动必须动的代码，不顺手"改善"无关代码
- 不重构没坏的东西
- 每行改动的代码都应能追溯到用户请求

## Goal-Driven Execution
- 每个任务转成可验证的目标
- 多步骤任务先列计划再动手

# 全局约定

- **规则放 CLAUDE.md，工作流放 Skills**
- 涉及文件操作先问用户意图
- 每次对话只给 AI 看需要的内容，避免无关上下文稀释注意力
- **涉及架构决策必须先走 OpenSpec propose**（如已安装 OpenSpec），不能直接改代码

# 自动审查闭环

- SessionStart 自动注入 git 状态
- PreToolUse 自动拦截危险操作
- PostToolUse 自动格式化代码
- PreCompact 保存 Loop 状态（长会话保护）
- Stop 自动生成审查报告至 .claude/reviews/（按日期累积）
- 下次 SessionStart 自动加载最近几次审查记录

# Loop Engineering（自治循环）

> ⚡ **进阶特性（L4）**：新手可以先熟悉前三个 Hook，后续再了解这部分。

从 "人驱动 AI" 向 "系统驱动 AI" 演进。

## GC Agent（垃圾回收 Agent）

- **Skill**: `.claude/skills/harness-gc/SKILL.md`
- **扫描脚本**: `scripts/gc-scan.mjs`（确定性，8 个维度）
- **状态文件**: `.claude/loops/STATE.md`（hot，每次会话自动加载）
- **历史记录**: `.claude/loops/LOG.md`（warm，按需读取）

### 核心原则

1. **外部验证门** — 扫描来自 `gc-scan.mjs`，非 AI 自我报告
2. **执行与验证分离** — 写代码的 Agent 不给自己打分
3. **Circuit Breaker** — 连续 3 次无改善则停止，等你介入
4. **认知不投降** — 所有修复最终由你 review → 确认

### 触发方式

| 方式 | 命令 | 说明 |
|------|------|------|
| 手动 | `node scripts/gc-scan.mjs` | 立即执行一次健康检查 |
| Loop | `/loop 24h "node scripts/gc-scan.mjs"` | 每 24 小时自动扫描 |
| Routine | `/schedule daily GC scan at 2am` | 持久化定时（需 Max）|

# 成熟度路线图

自评你当前的 Harness 工程水平，每级都是上行台阶：

| 级别 | 名称 | 具体指标 | 当前状态 |
|:---:|---|----|----|
| L0 | 裸用 | 没有 CLAUDE.md，手动提示 | — |
| L1 | 规则层 | 有 CLAUDE.md + 行为准则 + 完成 1 次完整对话 | — |
| L2 | 反馈回路 | PreToolUse + SessionStart + Stop 已激活 + 审查报告 ≥3 份 | — |
| **L3** | **自动修正** | **PostToolUse + PreCompact 已激活 + 审查报告 ≥5 份 + 0 调试残留** | **← 本模板当前在此** |
| **L4** | **自治系统 🔧** | **gc-scan 连续 3 次运行 0 critical + Loop 状态持续更新** | **进阶特性（满足 L3 后再探索）** |

# 扩展方向

以下内容不包含在 Starter 里，按需自行添加：

**PostToolUse 自动格式化** — 已激活。检测项目中的 prettier / biome 等工具，每次编辑后自动格式化。无对应工具时静默跳过。

**PreCompact Hook** — 已激活。在上下文压缩前保存会话关键状态 + 当前任务进度。

**GC Agent（垃圾回收，进阶）** — 已内置但非必须。`scripts/gc-scan.mjs` + `harness-gc` Skill。使用方式：`node scripts/gc-scan.mjs` 或 `/loop 24h "node scripts/gc-scan.mjs"`

**Claude Code Routines** — 可将 GC Agent 部署为 Anthropic 服务端持久任务（需 Max）。`/schedule daily GC scan at 2am`
