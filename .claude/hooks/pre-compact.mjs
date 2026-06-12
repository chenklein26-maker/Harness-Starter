import { execSync } from "child_process";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// PreCompact Hook
// 在上下文压缩前保存关键状态 + Loop 进度，压缩后自动恢复

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "../..");
const loopsDir = join(projectRoot, ".claude/loops");

const run = (cmd) => {
  try {
    return execSync(cmd, { cwd: projectRoot, encoding: "utf-8", timeout: 3000 }).trim();
  } catch {
    return "";
  }
};

const lines = [
  "[PreCompact: 会话状态快照]",
  "",
];

// 1. 当前任务
const branch = run("git rev-parse --abbrev-ref HEAD 2>/dev/null") || "（非 git 目录）";
const status = run("git status --short 2>/dev/null") || "";
const changedFiles = status.split("\n").filter(Boolean).map(l => l.trim());
if (changedFiles.length > 0) {
  lines.push("当前分支: " + branch);
  lines.push("未提交变更: " + changedFiles.length + " 个文件");
  lines.push(...changedFiles.slice(0, 10).map(f => "  " + f));
  if (changedFiles.length > 10) lines.push("  ...及其他 " + (changedFiles.length - 10) + " 个文件");
  lines.push("");
}

// 2. 最近提交
const lastCommit = run("git log -1 --oneline 2>/dev/null");
if (lastCommit) {
  lines.push("最近提交: " + lastCommit);
  lines.push("");
}

// 3. Loop 状态 (新增)
const statePath = join(loopsDir, "STATE.md");
if (existsSync(statePath)) {
  const stateContent = readFileSync(statePath, "utf-8");
  const phaseLine = stateContent.match(/\*\*Phase\*\*: (.+)/);
  const lastRunLine = stateContent.match(/\*\*Last Run\*\*: (.+)/);
  if (phaseLine) lines.push("Loop Phase: " + phaseLine[1]);
  if (lastRunLine) lines.push("Last Loop Run: " + lastRunLine[1]);
  lines.push("");
}

// 4. 审查报告累积
const reviewsDir = join(projectRoot, ".claude/reviews");
if (existsSync(reviewsDir)) {
  const count = readdirSync(reviewsDir).filter(f => f.endsWith(".md")).length;
  if (count > 0) {
    lines.push("审查报告: " + count + " 次已累积");
    lines.push("");
  }
}

lines.push("---");

process.stdout.write(lines.join("\n"));
