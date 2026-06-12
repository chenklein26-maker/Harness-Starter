#!/usr/bin/env node
/**
 * Harness Starter — 升级脚本
 *
 * 从 GitHub 拉取最新模板，只更新未自定义的文件。
 * 用法：node scripts/upgrade.mjs
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

// 从 package.json 读取仓库地址（单一配置源）
const pkg = JSON.parse(readFileSync(join(projectRoot, "package.json"), "utf-8"));
const REPO = pkg.repository || "chenklein26-maker/Harness-Starter";
const REF = "main";
const TMP_DIR = join(projectRoot, ".claude", ".upgrade-tmp");

// 模板文件列表 — 与 package.json "files" 字段保持一致
const TEMPLATE_FILES = [
  "CLAUDE.md",
  ".lsp.json",
  ".gitignore",
  "package.json",
  "LICENSE",
  "scripts/check.mjs",
  "scripts/gc-scan.mjs",
  "scripts/init.mjs",
  "scripts/upgrade.mjs",
  ".claude/.harness-state",
  ".claude/hooks/pre-tool-check.mjs",
  ".claude/hooks/session-context.mjs",
  ".claude/hooks/session-review.mjs",
  ".claude/hooks/post-tool-check.mjs",
  ".claude/hooks/pre-compact.mjs",
  ".claude/loops/STATE.md",
  ".claude/loops/LOG.md",
  ".claude/settings.json",
  ".claude/skills/harness-init/SKILL.md",
  ".claude/skills/harness-mode/SKILL.md",
  ".claude/skills/harness-gc/SKILL.md",
  ".github/workflows/harness-check.yml",
  "README.md",
  "README.en.md",
];

const run = (cmd) => {
  try {
    return execSync(cmd, { encoding: "utf-8", timeout: 30000 }).trim();
  } catch (e) {
    return { error: e.message };
  }
};

console.log("\n=== Harness Starter 升级检查 ===\n");

// 1. 检查 git 可用性
try {
  execSync("git --version", { stdio: "pipe" });
} catch {
  console.log("❌ 需要 git 来拉取模板更新\n");
  process.exit(1);
}

// 2. 下载最新模板
console.log(`📥 正在拉取 ${REPO}@${REF} ...`);
const tarCmd = `git archive --format=tar --remote=https://github.com/${REPO}.git ${REF} 2>/dev/null`;
let tarOutput;
try {
  tarOutput = execSync(tarCmd, { encoding: "base64", timeout: 15000 });
} catch {
  console.log("⚠️  无法直接拉取，尝试 clone 方式 ...");
  // fallback: shallow clone to tmp
  if (existsSync(TMP_DIR)) {
    execSync(`rm -rf "${TMP_DIR}"`);
  }
  execSync(`git clone --depth 1 --branch ${REF} https://github.com/${REPO}.git "${TMP_DIR}"`, { stdio: "pipe" });
}
console.log("✅ 已获取最新版本\n");

// 3. 比较文件
console.log("📋 检查模板文件差异 ...\n");

let pendingUpgrades = [];
const sourceDir = existsSync(TMP_DIR) ? TMP_DIR : null;

for (const file of TEMPLATE_FILES) {
  const localPath = join(projectRoot, file);
  const upstreamPath = sourceDir ? join(sourceDir, file) : null;

  if (!existsSync(localPath)) {
    pendingUpgrades.push({ file, status: "new" });
    continue;
  }

  if (upstreamPath && existsSync(upstreamPath)) {
    const localContent = readFileSync(localPath, "utf-8");
    const upstreamContent = readFileSync(upstreamPath, "utf-8");

    if (localContent !== upstreamContent) {
      pendingUpgrades.push({ file, status: "differs", localContent, upstreamContent });
    }
  }
}

if (pendingUpgrades.length === 0) {
  console.log("✅ 所有模板文件已是最新版本\n");
  cleanup();
  process.exit(0);
}

console.log(`发现 ${pendingUpgrades.length} 个文件有更新:\n`);
for (const p of pendingUpgrades) {
  console.log(`  ${p.status === "new" ? "🆕 新增" : "📝 可更新"}  ${p.file}`);
}

console.log("\n⚠️  注意：已自定义的文件更新后可能需要手动合并冲突\n");

// 实际更新逻辑
let updated = 0;
let skipped = 0;

for (const p of pendingUpgrades) {
  const localPath = join(projectRoot, p.file);
  const sourceDirPath = sourceDir ? join(sourceDir, p.file) : null;

  if (p.status === "new") {
    // 新文件直接创建
    if (sourceDirPath && existsSync(sourceDirPath)) {
      const dir = dirname(localPath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      writeFileSync(localPath, readFileSync(sourceDirPath, "utf-8"), "utf-8");
      console.log(`  ✅ 已创建: ${p.file}`);
      updated++;
    }
  } else {
    // 差异文件 — 直接覆盖模板文件，但先备份
    const backupPath = join(projectRoot, ".claude", ".upgrade-backups", p.file.replace(/[/\\]/g, "_"));
    if (sourceDirPath && existsSync(sourceDirPath)) {
      const backupDir = dirname(backupPath);
      if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
      writeFileSync(backupPath, p.localContent, "utf-8");
      writeFileSync(localPath, readFileSync(sourceDirPath, "utf-8"), "utf-8");
      console.log(`  ✅ 已更新: ${p.file}（备份: .claude/.upgrade-backups/）`);
      updated++;
    } else {
      console.log(`  ⏭️  跳过: ${p.file}（无法获取上游版本）`);
      skipped++;
    }
  }
}

console.log(`\n📊 结果: ${updated} 已更新, ${skipped} 已跳过\n`);

if (updated > 0) {
  console.log("💡 提示：备份文件保存在 .claude/.upgrade-backups/ 目录");
  console.log("   如果遇到问题，可以从备份恢复\n");
}

cleanup();

function cleanup() {
  if (existsSync(TMP_DIR)) {
    execSync(`rm -rf "${TMP_DIR}"`);
  }
}
