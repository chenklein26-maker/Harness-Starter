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

## Simplicity First — 动手前先爬 6 级梯子

动手前逐级检查，停在第 1 级能通过的台阶：

| # | 原则 | 做法 |
|---|------|------|
| 1 | **YAGNI** | 这东西真的需要存在吗？不需要就跳过 |
| 2 | **标准库** | JavaScript/Python/Rust 标准库能搞定？用它 |
| 3 | **平台原生** | 浏览器/Node/OS 自带能力能满足？用 native |
| 4 | **已有依赖** | 项目已经装的依赖能解决？复用，不新增 |
| 5 | **一行** | 能一行写完？写一行 |
| 6 | **最少** | 以上都不行 → 写最少代码，不加抽象和配置 |

> 保留的安全区：边界校验、数据防丢、安全防护、无障碍 —— 这些不能"偷懒"。

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

> 详细示例 → GitHub 仓库 `.claude/references/goal-definition-guide.md`

# 全局约定

- **规则放 CLAUDE.md，工作流放 Skills**
- 涉及文件操作先问用户意图
- 每次对话只给 AI 看需要的内容，避免无关上下文稀释注意力
- **架构决策**：如果项目中存在 `openspec/` 目录，涉及架构变更时必须先走 OpenSpec propose。未安装则先口头讨论方案再动手

# 自动审查闭环

- **SessionStart** → 注入 git 状态 + 当前进度
- **PreToolUse** → 拦截 .env 写入、危险操作
- **Stop** → 生成审查报告至 `.claude/reviews/`（按日期累积）

> L3 进阶：启用 PostToolUse（自动格式化）和 PreCompact（长会话保护）可形成完整闭环。详见 GitHub 仓库 README。

# 进阶特性（按需启用）

本模板默认安装 L2 核心。以下高级功能留在 GitHub 仓库中，到达对应成熟度后手动复制：

| 级别 | 功能 | 安装方式 |
|:---:|---|---------|
| L3 | 自动格式化 (PostToolUse) | 复制 `.claude/hooks/post-tool-check.mjs` + 注册到 settings.json |
| L3 | 长会话保护 (PreCompact) | 复制 `.claude/hooks/pre-compact.mjs` + 注册到 settings.json |
| L4 | GC 自治扫描 | 复制 `scripts/gc-scan.mjs` + `.claude/skills/harness-gc/` |
| L4 | 技术方案审查 | 复制 `.claude/skills/tech-review/` |
| L4 | 目标验证 | 复制 `.claude/skills/verify-goal/` |
| L5 | 循环工程 | 详见仓库 `.claude/references/loop-templates.md` |

> 成熟度路线图：L0 → L5，详见 GitHub 仓库 `.claude/references/maturity-roadmap.md`
