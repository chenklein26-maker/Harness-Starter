# 项目概要

> 🚀 首次使用请说 `开始` 或 `初始化` — AI 会自动走完 `harness-start` 四步流程（初始化 → 看架构 → 删多余 → 目录体检）

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
- **技术方案审查规则**：用户指定"用 X 做 Y"的技术实现方案时，AI 必须先调用 `tech-review` 审查该方案在当前行业是否仍是最佳实践

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

### 目标定义规则（硬性）

执行多步骤任务前，完成条件必须满足：

1. **可被机器验证** — 能用自动化命令验证，不依赖主观判断
2. **含边界条件** — 明确什么能做、什么不能做
3. **有失败降级方案** — 设置停止条件，防止无限重试（3 轮未通过 → 停止并汇报）
4. **目标分层** — 区分长期目标和本轮目标

> 详细示例 → `.claude/references/goal-definition-guide.md`

# 全局约定

- **规则放 CLAUDE.md，工作流放 Skills**
- 涉及文件操作先问用户意图
- 每次对话只给 AI 看需要的内容，避免无关上下文稀释注意力
- **架构决策**：如果项目中存在 `openspec/` 目录，涉及架构变更时必须先走 OpenSpec propose。未安装则先口头讨论方案再动手

# 自动审查闭环

- **SessionStart** → 注入 git 状态 + Loop 状态 + 最近审查
- **PreToolUse** → 拦截 .env 写入、危险操作
- **PostToolUse** → 自动格式化（仅检测到格式问题时触发）
- **PreCompact** → 保存会话状态快照（长会话保护）
- **Stop** → 生成审查报告至 `.claude/reviews/`

# 进阶特性

- **GC Agent**：`node scripts/gc-scan.mjs` — 8 维确定性健康检查。详见 `.claude/skills/harness-gc/SKILL.md`
- **Loop 自动化**：`/loop 24h "node scripts/gc-scan.mjs"` — 定时自治循环。模板见 `.claude/references/loop-templates.md`
- **成熟度路线图**：L0 → L5，当前模板开箱即用 L3。详见 `.claude/references/maturity-roadmap.md`
- **扩展功能目录**：Worktree 隔离、Routines、自定义 Hook/Skill。详见 `.claude/references/extension-catalog.md`
