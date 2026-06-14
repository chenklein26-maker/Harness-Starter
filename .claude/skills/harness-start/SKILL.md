---
name: harness-start
description: Entry point for new users — guides through initialization, architecture review, and cleanup. Use when the user first opens this project or says "开始" / "初始化" / "怎么用".
---

# Harness Start

你是刚打开这个模板的人。无论你手头是**空项目**还是**做到一半的项目**，四步走完即可就位。

## Step 1：初始化

直接说：

```
帮我初始化 Harness
```

AI 会自动执行 `harness-init` 全流程：检测技术栈 → 填写 CLAUDE.md → 发现 Skill 路由 → 检查 Hook → 安装 LSP → 健康检查。

> 如果已经在 CLAUDE.md 里填过内容，AI 不会覆盖你写好的部分。

## Step 2：整体看一下架构

初始化完成后，说：

```
帮我梳理一下当前项目架构
```

AI 会遍历项目文件，输出一份架构概览——目录结构、模块关系、入口文件都在哪里。这一步让你（也让 AI）对项目全貌建立共识，后续改动才有上下文。

## Step 3：删掉多余的文件

这个模板自带了一些**服务于模板本身**的文件，不是你的项目需要的。根据你的情况处理：

### 必删 / 必改

| 文件 | 说明 | 处理 |
|------|------|------|
| `README.md` | 模板的使用说明，不是你项目的 README | 删掉或替换成你自己的 |
| `README.en.md` | 英文版同上 | 删掉或替换 |
| `package.json` | 模板的 npm 分发配置，不是你项目的依赖 | 删掉或替换成你项目的 |
| `LICENSE` | MIT 许可证 | 保留、换成你的、或删掉 |

### 按需处理

| 文件 | 说明 | 处理 |
|------|------|------|
| `scripts/init.mjs` | 把模板安装到其他项目用的 | 如果以后不需要分发模板，可删 |
| `scripts/upgrade.mjs` | 从上游模板拉取更新 | 建议保留，方便同步 Harness 更新 |
| `.github/workflows/harness-check.yml` | CI 自动检查 Harness 配置 | 建议保留，或合并到你自己的 CI 里 |
| `.claude/skills/harness-start/` | 就是这个入口指南 | 完成后可删 |

### 建议保留

这些是 Harness 运行所需的核心文件，**不要删**：

- `CLAUDE.md` — AI 行为准则
- `.claude/hooks/` — 五个生命周期钩子
- `.claude/settings.json` — Hook 注册
- `.lsp.json` — LSP 配置
- `scripts/check.mjs` — 健康检查
- `scripts/gc-scan.mjs` — GC 扫描

---

## Step 4：目录体检 — 扫描优化空间

前三步做完后，AI 会对整个项目做一次**多维度扫描**，检查是否还有什么可以优化的地方。

扫描范围与标准：

### 🔴 维度一：模板残留

检查 Harness Starter 自身的文件是否还有残留：

| 检查项 | 说明 |
|--------|------|
| `package.json` | 项目名/描述还是 `harness-starter`？→ 应改为你的项目信息 |
| `README.md` | 内容是否仍是模板说明？→ 应替换为你的项目 README |
| `harness-start/` 入口 skill | 初始化完成后这个技能可删除，不是必须保留的 |
| 合入到已有项目时还复制了多余文件？ | 核对模板文件是否被复制到了不应放置的位置 |

### 💡 维度二：结构惯例

根据 Step 1 检测到的技术栈，检查目录结构是否与行业标准做法一致：

| 检测结果 | 发现 | 建议 |
|---------|------|------|
| 检测到前端/Node 项目 | 代码在根目录还是 `src/`？ | 标准做法是收进 `src/` |
| 检测到 Next.js 项目 | 在用 `pages/` 还是 `app/`？ | App Router 是当前推荐做法 |
| 检测到 Python 项目 | 有 `src/` 或模块包结构？ | 标准做法建议 `src/` 布局 |
| 检测到 monorepo | 有 `packages/` 或 `workspaces` 配置？ | 按 monorepo 标准整理 |
| 通用情况 | 根目录散落大量文件？ | 建议按功能归类到子目录 |

### 💡 维度三：命名一致性

扫描主要文件的命名风格，检查是否统一：

- 识别项目主风格（kebab-case / camelCase / snake_case / PascalCase）
- 列出偏离主风格的文件
- **不强制改**，只提醒混用了

### 🔍 维度四：孤立文件

- 空目录
- 没有被人引用或使用的 `.md` 文档
- 旧版本配置与新配置共存（如 `.eslintrc` 和 `eslint.config.js` 同时存在）
- 备份残留（如 `*.bak`、`*.old`）

### ✅ 维度五：配置缺漏

根据技术栈，检查是否缺少标准配置文件：

| 技术栈 | 期望有 |
|--------|--------|
| 所有项目 | `.gitignore`、`README.md`（如果被删了） |
| TypeScript | `tsconfig.json` |
| Python | `pyproject.toml` 或 `requirements.txt` |
| Node.js | `.nvmrc` 或 `engines` 字段 |
| Docker | `Dockerfile`、`.dockerignore` |
| Git | `.gitattributes` |
| Linter | `eslint.config.js` 或 `.prettierrc` |

### 输出格式

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 目录体检报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 总览
✅ 正常：N 项
💡 建议优化：N 项
❌ 需要处理：N 项

【🔴 模板残留】
  • package.json → 项目名仍是 "harness-starter"
    → 建议改为你的项目名: "my-project"

【💡 结构建议】
  • 代码在根目录而非 src/ 下
    → 建议收入 src/ 目录，方便扩展

【💡 命名建议】
  • 主风格为 kebab-case，有 2 个文件例外：
    - src/utils/apiHelper.ts → 建议 api-helper.ts
    - src/components/UserProfile.tsx → 建议 user-profile.tsx

【🔍 孤立文件】
  • src/legacy/ 目录为空，建议删除
  • .eslintrc 与 eslint.config.js 同时存在
    → .eslintrc 是旧版格式，建议删除

【✅ 配置完整】
  • .gitignore: 存在 ✅
  • tsconfig.json: 存在 ✅
  • .env.example: 缺失 ⚠️（建议创建）

─────────────────────────────────────
是否执行以上建议？
  A) 全部执行
  B) 逐条确认
  C) 跳过
─────────────────────────────────────
```

用户选择后，AI 按确认内容执行优化。

---

## ✅ 验收：四步都做完了吗？

四步执行完毕时，AI **必须**执行以下验收检查并输出结果。不得以"做完了"笼统收尾。

### 检查项

| # | 检查项 | 自动/手动 | 证据来源 |
|---|--------|----------|---------|
| 1 | CLAUDE.md 无占位符 | 自动 | `grep '【待填写】' CLAUDE.md` → 0 匹配 |
| 2 | 模板多余文件已处理 | 手动确认 | 逐项确认 README.md / package.json / LICENSE 已处理 |
| 3 | 5 个 Hook 已注册 | 自动 | `.claude/settings.json` 中五项齐全 |
| 4 | LSP 可用 | 自动 | 检查 language server 安装状态 |
| 5 | 健康检查通过 | 自动 | `node scripts/check.mjs` 输出全绿 |
| 6 | 项目能正常运行 | 手动确认 | 根据项目类型执行对应的 run 命令 |

### 验收输出格式

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 初始化验收报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[#1] ✔ CLAUDE.md 已填写 — 无【待填写】占位符
[#2] ✔ 模板文件已清理 — README.md 已替换 / package.json 已确认
[#3] ✔ 5 个 Hook 已注册 — PreToolUse / PostToolUse / PreCompact / SessionStart / Stop
[#4] ✔ LSP 可用 — typescript-language-server 正常
[#5] ✔ 健康检查通过 — node scripts/check.mjs → 全绿
[#6] ✔ 项目可运行 — npm run dev → exit 0

─────────────────────────────────────
结论：全部通过 ✅  项目已就位
─────────────────────────────────────
```

含 ✘ 的项不处理完毕，四步流程不算结束。

---

## 做完四步之后

你的项目就脱离模板状态了。之后正常开发即可——每次会话 AI 会自动加载 git 状态、审查记录和 Loop 状态。

> 关于 tech-review：Harness Starter 内置了**技术方案审查**能力。当你在开发中要求 AI 实现某个技术方案时，AI 会自动审查该方案在当前行业是否仍然是最佳实践。详见 `.claude/skills/tech-review/SKILL.md`。
