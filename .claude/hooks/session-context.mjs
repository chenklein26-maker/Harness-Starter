import { execSync } from "child_process";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "../..");
const loopsDir = join(projectRoot, ".claude/loops");

const run = (cmd) => {
  try {
    return execSync(cmd, { encoding: "utf-8", timeout: 3000 }).trim();
  } catch {
    return "";
  }
};

const branch = run("git rev-parse --abbrev-ref HEAD 2>/dev/null") || "（非 git 目录）";
const status = run("git status --short 2>/dev/null") || "";
const log = run("git log --oneline -10 2>/dev/null") || "";

const lines = ["--- SessionStart Hook ---", "分支: " + branch];

if (status) {
  lines.push("---", "变更:");
  lines.push(status);
} else {
  lines.push("---", "无未提交变更");
}

if (log) {
  lines.push("---", "最近 10 条提交:");
  lines.push(log);
}

// Harness 状态感知（阶段 + 模式）
const statePath = join(projectRoot, ".claude/.harness-state");
if (existsSync(statePath)) {
  try {
    const state = JSON.parse(readFileSync(statePath, "utf-8"));
    lines.push("---");
    lines.push("Harness 状态: 阶段=" + (state.phase || "build") + "  模式=" + (state.mode || "full"));
  } catch {}
}

// Loop 状态 (hot state — 从 STATE.md 提取)
const loopStatePath = join(loopsDir, "STATE.md");
if (existsSync(loopStatePath)) {
  const sc = readFileSync(loopStatePath, "utf-8");
  const phaseMatch = sc.match(/\*\*Phase\*\*: (.+)/);
  const lastRunMatch = sc.match(/\*\*Last Run\*\*: (.+)/);
  const findingsMatch = sc.match(/\*\*Findings Open\*\*: (.+)/);
  const phase = phaseMatch ? phaseMatch[1] : "unknown";
  const lastRun = lastRunMatch ? lastRunMatch[1] : "never";
  const findings = findingsMatch ? findingsMatch[1] : "0";
  lines.push("---", "Loop 状态: Phase=" + phase + " | Last Run=" + lastRun + " | Open Findings=" + findings);

  // LOG.md 最近摘要
  const logPath = join(loopsDir, "LOG.md");
  if (existsSync(logPath)) {
    const logContent = readFileSync(logPath, "utf-8");
    const entries = logContent.split("\n").filter(l => l.includes("|") && l.includes("auto") && !l.includes("Timestamp |"));
    const recent = entries.slice(-3);
    if (recent.length > 0) {
      lines.push("  最近 GC 扫描:");
      for (const e of recent) {
        const cols = e.split("|").map(c => c.trim()).filter(Boolean);
        if (cols.length >= 3) lines.push("    " + cols[0] + " → " + cols[2]);
      }
    }
  }
}

// 加载最近 5 次审查报告
const reviewsDir = join(projectRoot, ".claude/reviews");
if (existsSync(reviewsDir)) {
  const reviewFiles = readdirSync(reviewsDir)
    .filter(f => f.endsWith(".md"))
    .sort()
    .reverse()
    .slice(0, 5);

  if (reviewFiles.length > 0) {
    lines.push("---", "最近 " + reviewFiles.length + " 次审查:");
    for (const file of reviewFiles) {
      const content = readFileSync(join(reviewsDir, file), "utf-8");
      const flagSection = (content.split("### 规则检查\n")[1] || "").split("\n###")[0] || "";
      const flags = flagSection.split("\n").filter(l => l.trim());
      lines.push(file.replace(".md", ""));
      lines.push(...flags.map(f => "  " + f));
    }
  }
}

// 检查 CLAUDE.md 是否未初始化
const claudeMdPath = join(projectRoot, "CLAUDE.md");
if (existsSync(claudeMdPath)) {
  const claudeContent = readFileSync(claudeMdPath, "utf-8");
  if (claudeContent.includes("【待填写")) {
    lines.push("---", "⚠️ CLAUDE.md 还有占位符未替换，请对 AI 说：帮我初始化 Harness");
  }
}

lines.push("------------------------");

process.stdout.write(lines.join("\n"));
