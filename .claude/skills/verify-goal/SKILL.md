---
name: verify-goal
description: >
  Independently verifies whether a completed task meets its defined goal
  conditions. Implements maker/checker separation — the agent that wrote
  the code does not grade its own work. Use after task execution to
  validate completion before marking done.
---

# Verify Goal

## 核心理念

写代码的 Agent 不能给自己打分。

一个任务执行完毕时，所谓的"完成了"只是执行者的声称。**verify-goal** 作为独立的验证者，以完成条件为基准逐条验证，输出 PASS / FAIL / PARTIAL 结果。

## 触发条件

在以下场景中**必须触发**：
- `/goal` 循环的每一轮结束后
- 多步骤任务执行完毕后，声称"完成了"之前
- 提交 PR 前的最终检查

**不触发**：
- 用户只是问问题，不需要执行
- 简单的文件操作（重命名、移动、删除）

## 工作流

### Step 1：获取目标定义

从以下来源获取完成条件（按优先级）：
1. 本次任务中用户或 AI 显式定义的完成条件（推荐格式见 CLAUDE.md Goal-Driven Execution）
2. 对话上下文中可推导的隐含完成条件
3. 任务本身的性质（如"修 bug" → 定义是"bug 复现步骤不再触发"）

### Step 2：逐条验证

对每条完成条件，执行对应的验证命令并记录结果：

| 条件类型 | 验证方式 | 示例 |
|---------|---------|------|
| 测试通过 | 运行测试命令 | `npm test -- --testPathPattern=auth` |
| 类型检查 | 运行类型检查 | `tsc --noEmit` |
| Lint | 运行 linter | `npm run lint` |
| 构建 | 运行 build | `npm run build` |
| 边界条件 | 检查文件是否被误改 | `git diff --name-only` 核对范围 |
| 自定义 | 执行用户定义的条件 | 按实际情况 |

### Step 3：输出验证报告

使用以下固定格式输出：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔎 目标完成验证报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

目标：[本次任务的目标描述]

验证结果：✅ 全部通过 / ⚠️ 部分通过 / ❌ 未通过

逐项验证：
  1. [条件 A] ✅ PASS — [命令] → [输出摘要]
  2. [条件 B] ❌ FAIL — [命令] → [失败摘要]
  3. [条件 C] ✅ PASS — [命令] → [输出摘要]

─────────────────────────────────────
[全部通过]
  结论：目标已完成，可进入下一步。

[部分通过 / 未通过]
  失败项：
  - [条件 B] → [失败原因]
  建议：返回执行 Agent 修复后重新验证。
  降级：连续 3 次验证未通过 → 停止循环，汇报给人类。
─────────────────────────────────────
```

### Step 4：判断下一步

根据验证结果决定后续动作：

| 验证结果 | 后续动作 |
|---------|---------|
| ✅ 全部通过 | 标记完成，更新状态文件，通知主流程继续 |
| ⚠️ 部分通过 | 将失败项返回执行 Agent 修复，修复后重新验证 |
| ❌ 全部未通过 | 停止循环，汇报给人类 |
| 连续 3 次 FAIL | **Circuit Breaker 触发** — 停止循环，等待人类介入 |

## 与相关 skill 的关系

```
tech-review（事前）     verify-goal（事后）      acceptance（终验）
  方案查完了没有？   →   做完了条件满足了没？   →   整个流程走完了没？
  执行前触发           每轮 / 每次任务后触发       项目初始化结束时触发
```

三者形成完整链条：事前查方案 → 事后验结果 → 终验看全貌。
