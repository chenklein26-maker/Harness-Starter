/**
 * tests/harness-context.test.mjs — harness-context.mjs 共享工具库测试
 */

import { describe, it, expect, vi } from "vitest";
import {
  getGitContext,
  getLoopState,
  getReviewSummary,
  getHarnessState,
  getClaudeMdStatus,
} from "../.claude/hooks/lib/harness-context.mjs";
import { createVirtualProject, Fixtures } from "./setup.mjs";

// Mock child_process for git commands
vi.mock("child_process", () => ({
  execSync: vi.fn(() => { throw new Error("no git"); }),
}));

describe("getGitContext", () => {
  it("非 git 目录 → 返回 null", () => {
    const { projectRoot, cleanup } = createVirtualProject({});
    const result = getGitContext(projectRoot);
    expect(result).toBeNull();
    cleanup();
  });
});

describe("getLoopState", () => {
  it("STATE.md 存在 → 解析字段", () => {
    const { projectRoot, cleanup } = createVirtualProject({
      ".claude/loops/STATE.md": "**Phase**: idle\n**Last Run**: 2026-06-15\n**Findings Open**: 3\n",
    });
    const result = getLoopState(projectRoot);
    expect(result).not.toBeNull();
    expect(result.phase).toBe("idle");
    expect(result.lastRun).toBe("2026-06-15");
    expect(result.findingsOpen).toBe("3");
    cleanup();
  });

  it("STATE.md 缺失 → 返回 null", () => {
    const { projectRoot, cleanup } = createVirtualProject({});
    const result = getLoopState(projectRoot);
    expect(result).toBeNull();
    cleanup();
  });

  it("STATE.md 存在但缺字段 → 使用默认值", () => {
    const { projectRoot, cleanup } = createVirtualProject({
      ".claude/loops/STATE.md": "# Empty state\n",
    });
    const result = getLoopState(projectRoot);
    expect(result.phase).toBe("unknown");
    expect(result.lastRun).toBe("never");
    expect(result.findingsOpen).toBe("0");
    cleanup();
  });
});

describe("getReviewSummary", () => {
  it("审查目录缺失 → 返回 null", () => {
    const { projectRoot, cleanup } = createVirtualProject({});
    const result = getReviewSummary(projectRoot);
    expect(result).toBeNull();
    cleanup();
  });

  it("有空审查目录 → count=0", () => {
    const { projectRoot, cleanup } = createVirtualProject({
      ".claude/reviews/": null,
    });
    const result = getReviewSummary(projectRoot);
    expect(result.count).toBe(0);
    cleanup();
  });

  it("有审查报告 → 返回文件列表", () => {
    const { projectRoot, cleanup } = createVirtualProject({
      ".claude/reviews/2026-06-01.md": "### 规则检查\n✅ 未发现问题\n### Other\n",
      ".claude/reviews/2026-06-02.md": "### 规则检查\n⚠️ 敏感文件\n### Other\n",
    });
    const result = getReviewSummary(projectRoot);
    expect(result.count).toBe(2);
    expect(result.recentFiles.length).toBe(2);
    expect(result.recentFlags.length).toBeGreaterThan(0);
    cleanup();
  });
});

describe("getHarnessState", () => {
  it("有效状态 → 解析正确", () => {
    const { projectRoot, cleanup } = createVirtualProject({
      ".claude/.harness-state": '{"phase":"fix","mode":"hotfix","since":"2026-01-01"}',
    });
    const result = getHarnessState(projectRoot);
    expect(result.phase).toBe("fix");
    expect(result.mode).toBe("hotfix");
    expect(result.since).toBe("2026-01-01");
    cleanup();
  });

  it("文件缺失 → 返回 null", () => {
    const { projectRoot, cleanup } = createVirtualProject({});
    const result = getHarnessState(projectRoot);
    expect(result).toBeNull();
    cleanup();
  });

  it("JSON 损坏 → 返回 null", () => {
    const { projectRoot, cleanup } = createVirtualProject({
      ".claude/.harness-state": "not json",
    });
    const result = getHarnessState(projectRoot);
    expect(result).toBeNull();
    cleanup();
  });

  it("缺字段 → 使用默认值", () => {
    const { projectRoot, cleanup } = createVirtualProject({
      ".claude/.harness-state": "{}",
    });
    const result = getHarnessState(projectRoot);
    expect(result.phase).toBe("build");
    expect(result.mode).toBe("full");
    cleanup();
  });
});

describe("getClaudeMdStatus", () => {
  it("CLAUDE.md 缺失 → exists=false", () => {
    const { projectRoot, cleanup } = createVirtualProject({});
    const result = getClaudeMdStatus(projectRoot);
    expect(result.exists).toBe(false);
    cleanup();
  });

  it("有占位符 → hasPlaceholders=true", () => {
    const { projectRoot, cleanup } = createVirtualProject({
      "CLAUDE.md": "用途：【待填写】",
    });
    const result = getClaudeMdStatus(projectRoot);
    expect(result.exists).toBe(true);
    expect(result.hasPlaceholders).toBe(true);
    cleanup();
  });

  it("无占位符 → hasPlaceholders=false", () => {
    const { projectRoot, cleanup } = createVirtualProject({
      "CLAUDE.md": "# 项目概要\n用途：完成\n技术栈：Node.js\n",
    });
    const result = getClaudeMdStatus(projectRoot);
    expect(result.hasPlaceholders).toBe(false);
    cleanup();
  });
});
