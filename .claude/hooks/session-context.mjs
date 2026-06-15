/**
 * SessionStart Hook — 每次新会话开始时注入上下文。
 * 使用 harness-context.mjs 共享库获取数据，只负责格式化输出。
 */
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  getGitContext,
  getLoopState,
  getReviewSummary,
  getHarnessState,
  getClaudeMdStatus,
} from "./lib/harness-context.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "../..");

const lines = ["--- SessionStart Hook ---"];

// Git 上下文
const git = getGitContext(projectRoot);
if (git) {
  lines.push("分支: " + git.branch);
  if (git.changedFiles.length > 0) {
    lines.push("---", "变更:");
    lines.push(git.changedFiles.join("\n"));
  } else {
    lines.push("---", "无未提交变更");
  }
} else {
  lines.push("分支: （非 git 目录）");
}

// Harness 状态
const harness = getHarnessState(projectRoot);
if (harness) {
  lines.push("---");
  lines.push("Harness 状态: 阶段=" + harness.phase + "  模式=" + harness.mode);
}

// Loop 状态
const loop = getLoopState(projectRoot);
if (loop) {
  lines.push("---", "Loop 状态: Phase=" + loop.phase + " | Last Run=" + loop.lastRun + " | Open Findings=" + loop.findingsOpen);
  if (loop.recentScans.length > 0) {
    lines.push("  最近 GC 扫描:");
    for (const s of loop.recentScans) lines.push("    " + s);
  }
}

// 审查报告
const review = getReviewSummary(projectRoot);
if (review && review.count > 0) {
  lines.push("---", "最近 " + Math.min(review.recentFiles.length, 5) + " 次审查:");
  for (const file of review.recentFiles) {
    lines.push(file.replace(".md", ""));
  }
  for (const flag of review.recentFlags) {
    lines.push(flag);
  }
}

// CLAUDE.md 占位符检查
const claude = getClaudeMdStatus(projectRoot);
if (claude && claude.hasPlaceholders) {
  lines.push("---", "⚠️ CLAUDE.md 还有占位符未替换，请对 AI 说：帮我初始化 Harness");
}

lines.push("------------------------");

process.stdout.write(lines.join("\n"));
