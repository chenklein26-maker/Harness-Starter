#!/usr/bin/env node
/**
 * Harness Starter — 一键安装脚本
 *
 * 安装 L2 核心到目标项目。L3+ 进阶功能留在 GitHub 仓库，手动追加。
 *
 * 用法:
 *   npx harness-starter                    # 安装到当前目录
 *   npx harness-starter /path/to/project   # 安装到指定目录
 *   npx harness-starter --force            # 覆盖已有文件
 *   node scripts/init.mjs                  # 本地运行
 */

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, dirname, resolve, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templateRoot = join(__dirname, "..");

const args = process.argv.slice(2);
const force = args.includes("--force");
const targetArg = args.filter(a => a !== "--force")[0];
const target = targetArg ? resolve(targetArg) : process.cwd();

// L2 核心文件清单 — 精确到文件，不递归复制目录
const FILES = [
  // 项目根
  { src: "CLAUDE.md", dir: false },
  { src: ".lsp.json", dir: false },
  { src: ".gitignore", dir: false },

  // 脚本
  { src: "scripts/check.mjs", dir: false },
  { src: "scripts/init.mjs", dir: false },

  // Hook 配置
  { src: ".claude/settings.json", dir: false },
  { src: ".claude/.harness-state", dir: false },
  { src: ".claude/.harness-version", dir: false },

  // L2 核心 Hook（3 个）
  { src: ".claude/hooks/pre-tool-check.mjs", dir: false },
  { src: ".claude/hooks/session-context.mjs", dir: false },
  { src: ".claude/hooks/session-review.mjs", dir: false },
  { src: ".claude/hooks/lib/harness-context.mjs", dir: false },

  // L2 核心 Skill（2 个）
  { src: ".claude/skills/harness-init/SKILL.md", dir: false },
  { src: ".claude/skills/harness-mode/SKILL.md", dir: false },
];

console.log("\n=== Harness Starter 安装（L2 核心） ===\n");
console.log(`目标路径: ${target}\n`);

if (!existsSync(target)) {
  mkdirSync(target, { recursive: true });
  console.log("✅ 已创建目标目录");
}

let installed = 0;
let skipped = 0;

for (const { src, dir } of FILES) {
  const srcPath = join(templateRoot, src);
  const destPath = join(target, src);

  if (!existsSync(srcPath)) {
    console.log(`❌ 模板文件不存在: ${src}`);
    continue;
  }

  if (existsSync(destPath) && !force) {
    console.log(`⏭️  已存在，跳过: ${src}`);
    skipped++;
    continue;
  }

  try {
    const destDir = dirname(destPath);
    if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
    cpSync(srcPath, destPath, { recursive: dir });
    console.log(`✅ 已安装: ${src}`);
    installed++;
  } catch (e) {
    console.log(`❌ 安装失败: ${src} — ${e.message}`);
  }
}

// 写入版本标记
const versionPath = join(target, ".claude", ".harness-version");
const versionDir = join(target, ".claude");
if (!existsSync(versionDir)) mkdirSync(versionDir, { recursive: true });
const pkg = JSON.parse(readFileSync(join(templateRoot, "package.json"), "utf-8"));
writeFileSync(versionPath, JSON.stringify({
  version: pkg.version || "1.0.0",
  installed: new Date().toISOString(),
}, null, 2) + "\n", "utf-8");
console.log("\n✅ 版本标记: .claude/.harness-version");

console.log(`\n📊 结果: ${installed} 已安装, ${skipped} 已跳过\n`);

console.log("💡 下一步:");
console.log(`   1. cd ${target === process.cwd() ? "." : target}`);
console.log("   2. 在 Claude Code 中输入：帮我初始化 Harness");
console.log("   3. AI 会自动检测技术栈并完成配置\n");

console.log("🔧 想启用 L3+ 高级功能？");
console.log("   详见 https://github.com/chenklein26-maker/Harness-Starter");
console.log("   或手动复制：");
console.log("   L3 自动格式化 → cp .claude/hooks/post-tool-check.mjs 到项目 + 注册到 settings.json");
console.log("   L4 GC 扫描器 → cp scripts/gc-scan.mjs + .claude/skills/harness-gc/\n");

if (skipped > 0) {
  console.log("💡 提示: 使用 --force 可覆盖已有文件\n");
}
