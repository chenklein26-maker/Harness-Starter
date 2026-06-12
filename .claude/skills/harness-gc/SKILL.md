---
name: harness-gc
description: Garbage Collection Agent — 定期扫描项目健康状态，检测文档/代码一致性漂移，自动发起修复提案。
---

# Harness GC (Garbage Collection) Agent

## 核心原则

1. **外部验证门** — 扫描结果来自 `gc-scan.mjs`，非 Agent 自我报告（Sniff 模式）
2. **执行与验证分离** — 写代码的 Agent 不给自己打分（Spotify 模式）
3. **Circuit Breaker** — 连续 3 次无改善则停止，等你介入
4. **认知不投降** — 所有修复最终由你 review → 确认

## 触发方式

| 方式 | 命令 | 说明 |
|------|------|------|
| 手动 | `node scripts/gc-scan.mjs` | 立即执行一次健康检查 |
| Loop | `/loop 24h "node scripts/gc-scan.mjs"` | 每 24 小时自动扫描 |
| Routine | `/schedule daily GC scan at 2am` | 持久化定时（需 Max）|

## 扫描维度

| 维度 | 检查项 | 严重性 |
|------|--------|--------|
| CLAUDE.md 完整性 | 必要章节 + 占位符 | warning |
| TODO/FIXME 密度 | 单文件 >5 处 | info |
| .gitignore 健康 | node_modules/reviews/loops 遗漏 | info |
| Hook 注册 | 文件存在但未注册/被注释 | warning |
| TypeScript 类型 | tsc --noEmit 错误 | warning |
| LSP 配置 | .lsp.json 有效性 | info |
| 调试残留 | console.log/debugger 未清除 | warning |
| Harness 状态 | .harness-state 有效性 | info |

## 工作流

```
TRIGGER → SCAN (gc-scan.msi) → ANALYZE → PROPOSE (可选) → WAIT (你 review)
```

## 状态管理

- `.claude/loops/STATE.md` — 当前活跃状态 (hot, 每次会话自动加载)
- `.claude/loops/LOG.md` — 历史执行记录 (warm, 按需读取)
- `.claude/.harness-state` — Phase/Mode 配置

## Circuit Breaker

连续 3 次扫描无改善 → STOP 自动提案 → 标记 `Phase: blocked` → 等你人工介入。
