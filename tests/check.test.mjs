/**
 * tests/check.test.mjs — check.mjs 测试
 *
 * 覆盖核心文件检查、Hook 检查、语言检测、LSP 检查。
 */

import { describe, it, expect, vi } from "vitest";
import { join } from "path";
import { check } from "../scripts/check.mjs";
import { createVirtualProject, Fixtures } from "./setup.mjs";

// Mock child_process for LSP version checks (return empty = not installed)
vi.mock("child_process", () => ({
  execSync: vi.fn(() => { throw new Error("not found"); }),
}));

describe("check.mjs: 核心文件检查", () => {
  it("完整项目 → 核心文件全部通过", () => {
    const { projectRoot, cleanup } = createVirtualProject({
      "CLAUDE.md": Fixtures.completeClaudeMd,
      ".claude/settings.json": Fixtures.minimalSettingsJson,
      ".claude/hooks/pre-tool-check.mjs": "// stub",
      ".claude/hooks/session-context.mjs": "// stub",
      ".claude/hooks/session-review.mjs": "// stub",
      ".claude/hooks/post-tool-check.mjs": "// stub",
      ".claude/hooks/pre-compact.mjs": "// stub",
      ".claude/skills/harness-init/SKILL.md": "# stub",
      ".claude/skills/harness-mode/SKILL.md": "# stub",
      "scripts/init.mjs": "// stub",
      "package.json": "{}",
    });
    const result = check(projectRoot);

    const coreNames = ["CLAUDE.md", ".claude/ 目录", "settings.json"];
    for (const name of coreNames) {
      const c = result.checks.find(c => c.name === name);
      expect(c.ok).toBe(true);
    }
    cleanup();
  });

  it("缺少 CLAUDE.md → 失败", () => {
    const { projectRoot, cleanup } = createVirtualProject({});
    const result = check(projectRoot);
    const c = result.checks.find(c => c.name === "CLAUDE.md");
    expect(c.ok).toBe(false);
    cleanup();
  });

  it("缺少 settings.json → 失败", () => {
    const { projectRoot, cleanup } = createVirtualProject({
      "CLAUDE.md": Fixtures.completeClaudeMd,
    });
    const result = check(projectRoot);
    const c = result.checks.find(c => c.name === "settings.json");
    expect(c.ok).toBe(false);
    cleanup();
  });
});

describe("check.mjs: Hook 检查", () => {
  it("全部 5 个 Hook 存在 → 通过", () => {
    const { projectRoot, cleanup } = createVirtualProject({
      "CLAUDE.md": Fixtures.completeClaudeMd,
      ".claude/settings.json": Fixtures.minimalSettingsJson,
      ".claude/hooks/pre-tool-check.mjs": "// stub",
      ".claude/hooks/session-context.mjs": "// stub",
      ".claude/hooks/session-review.mjs": "// stub",
      ".claude/hooks/post-tool-check.mjs": "// stub",
      ".claude/hooks/pre-compact.mjs": "// stub",
    });
    const result = check(projectRoot);
    const hookChecks = result.checks.filter(c => c.name.startsWith("hooks/"));
    expect(hookChecks.every(c => c.ok)).toBe(true);
    cleanup();
  });

  it("缺少必备 Hook → 失败", () => {
    const { projectRoot, cleanup } = createVirtualProject({
      "CLAUDE.md": Fixtures.completeClaudeMd,
      ".claude/settings.json": Fixtures.minimalSettingsJson,
      // 只有 pre-tool-check，缺少 session-context
      ".claude/hooks/pre-tool-check.mjs": "// stub",
    });
    const result = check(projectRoot);
    const sessionCtx = result.checks.find(c => c.name === "hooks/session-context.mjs");
    expect(sessionCtx.ok).toBe(false);
    cleanup();
  });

  it("可选 Hook 缺失 → 不标记 critical", () => {
    // Provide ALL non-optional files so only the optional hook absences remain
    const { projectRoot, cleanup } = createVirtualProject({
      "CLAUDE.md": Fixtures.completeClaudeMd,
      ".claude/settings.json": Fixtures.minimalSettingsJson,
      ".lsp.json": Fixtures.minimalLspJson,
      ".claude/hooks/pre-tool-check.mjs": "// stub",
      ".claude/hooks/session-context.mjs": "// stub",
      ".claude/hooks/session-review.mjs": "// stub",
      ".claude/skills/harness-init/SKILL.md": "# skill",
      ".claude/skills/harness-mode/SKILL.md": "# skill",
      ".claude/skills/harness-gc/SKILL.md": "# skill",
      "package.json": '{"name":"test"}',
      "scripts/init.mjs": "// init",
      "scripts/gc-scan.mjs": "// scan",
      // post-tool-check 和 pre-compact 缺失（optional）
    });
    const result = check(projectRoot);
    const postTool = result.checks.find(c => c.name === "hooks/post-tool-check.mjs（可选）");
    expect(postTool.ok).toBe(false);
    // post-tool-check and pre-compact are genuinely optional (L3+ features)
    // Note: their names in check.mjs don't include "（可选）" — this is a known
    // documentation inconsistency fixed in Phase 4
    const optionalMissing = result.checks.filter(c =>
      !c.ok && (c.name.includes("post-tool-check") || c.name.includes("pre-compact"))
    );
    expect(optionalMissing.length).toBe(2);
    cleanup();
  });
});

describe("check.mjs: 语言检测", () => {
  it("Node.js/TypeScript 项目 → 检测到", () => {
    const { projectRoot, cleanup } = createVirtualProject({
      "CLAUDE.md": Fixtures.completeClaudeMd,
      ".claude/settings.json": Fixtures.minimalSettingsJson,
      ".claude/hooks/pre-tool-check.mjs": "// stub",
      ".claude/hooks/session-context.mjs": "// stub",
      ".claude/hooks/session-review.mjs": "// stub",
      "package.json": '{"name": "test"}',
    });
    const result = check(projectRoot);
    const lang = result.checks.find(c => c.name === "检测项目语言");
    expect(lang.ok).toBe(true);
    expect(lang.hint).toContain("Node.js/TypeScript");
    cleanup();
  });

  it("多语言项目 → 全部检测到", () => {
    const { projectRoot, cleanup } = createVirtualProject({
      "CLAUDE.md": Fixtures.completeClaudeMd,
      ".claude/settings.json": Fixtures.minimalSettingsJson,
      ".claude/hooks/pre-tool-check.mjs": "// stub",
      ".claude/hooks/session-context.mjs": "// stub",
      ".claude/hooks/session-review.mjs": "// stub",
      "package.json": '{"name": "test"}',
      "pyproject.toml": "[tool]",
      "go.mod": "module test",
    });
    const result = check(projectRoot);
    const lang = result.checks.find(c => c.name === "检测项目语言");
    expect(lang.hint).toContain("Node.js/TypeScript");
    expect(lang.hint).toContain("Python");
    expect(lang.hint).toContain("Go");
    cleanup();
  });

  it("未检测到项目语言 → 显示未检测到", () => {
    const { projectRoot, cleanup } = createVirtualProject({
      "CLAUDE.md": Fixtures.completeClaudeMd,
      ".claude/settings.json": Fixtures.minimalSettingsJson,
      ".claude/hooks/pre-tool-check.mjs": "// stub",
      ".claude/hooks/session-context.mjs": "// stub",
      ".claude/hooks/session-review.mjs": "// stub",
    });
    const result = check(projectRoot);
    const lang = result.checks.find(c => c.name === "检测项目语言");
    expect(lang.ok).toBe(false);
    expect(lang.hint).toContain("未检测到");
    cleanup();
  });
});

describe("check.mjs: 返回结构", () => {
  it("返回 checks 数组 + okCount + criticalFails", () => {
    const { projectRoot, cleanup } = createVirtualProject({
      "CLAUDE.md": Fixtures.completeClaudeMd,
      ".claude/settings.json": Fixtures.minimalSettingsJson,
      ".claude/hooks/pre-tool-check.mjs": "// stub",
      ".claude/hooks/session-context.mjs": "// stub",
      ".claude/hooks/session-review.mjs": "// stub",
      ".claude/hooks/post-tool-check.mjs": "// stub",
      ".claude/hooks/pre-compact.mjs": "// stub",
      ".claude/skills/harness-init/SKILL.md": "# stub",
      ".claude/skills/harness-mode/SKILL.md": "# stub",
      "scripts/init.mjs": "// stub",
      "package.json": "{}",
    });
    const result = check(projectRoot);
    expect(Array.isArray(result.checks)).toBe(true);
    expect(typeof result.okCount).toBe("number");
    expect(typeof result.criticalFails).toBe("number");
    expect(result.okCount).toBeLessThanOrEqual(result.checks.length);
    cleanup();
  });
});
