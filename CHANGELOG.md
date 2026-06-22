# 更新日志

## 2026-06 — 瘦身 + Ponytail 融合

- **瘦身**：`npx harness-starter` 从全量安装改为 L2 核心（14 个文件），L3+ 可选按需追加
- **Ponytail 6 级梯子**：Simplicity First 升级为 YAGNI → 标准库 → 平台原生 → 已有依赖 → 一行 → 最少代码
- **自动格式化优化**：先 `--check` 再 `--write`，仅格式有问题时触发
- **升级可控**：`node scripts/upgrade.mjs --dry-run` 预览变更
- **54 个自动化测试**：覆盖 gc-scan、check、harness-context、init、upgrade

## 2026-06 — Loop Engineering 自治循环

- **GC 自治扫描**：`node scripts/gc-scan.mjs` — 8 维确定性检查，不依赖 AI 自我报告
- **Circuit Breaker**：连续 3 次无改善 → 自动暂停，等你介入
- **状态持久化**：STATE.md（热，会话自动加载）+ LOG.md（冷，按需读取）
- **3 种 Loop 模板**：每日巡检、PR babysit、自我进化
- **执行/验证分离**：写代码的 Agent 不给自己打分，`verify-goal` 独立验证

## 2026-06 — 架构重构与测试体系

- **5 钩子生命周期**：SessionStart → PreToolUse → PostToolUse → PreCompact → Stop
- **共享工具库**：`harness-context.mjs` 消除 ~40 行钩子间重复逻辑
- **CLAUDE.md 精简**：146 → 60 行，参考文档拆分到 `.claude/references/`
- **版本跟踪**：`.claude/.harness-version` + `upgrade.mjs --dry-run`
- **OpenSpec 条件化**：规则仅在 `openspec/` 目录存在时触发
