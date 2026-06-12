---
name: harness-start
description: Entry point for new users — guides through initialization, architecture review, and cleanup. Use when the user first opens this project or says "开始" / "初始化" / "怎么用".
---

# Harness Start

你是刚打开这个模板的人。无论你手头是**空项目**还是**做到一半的项目**，三步走完即可就位。

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

## 做完三步之后

你的项目就脱离模板状态了。此时可以说：

```
帮我跑一次健康检查
```

确认一切就绪。之后正常开发即可——每次会话 AI 会自动加载 git 状态、审查记录和 Loop 状态。
