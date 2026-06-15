#!/usr/bin/env node
/**
 * Harness Starter — 一键安装脚本
 *
 * 用法:
 *   npx harness-starter                    # 安装到当前目录
 *   npx harness-starter /path/to/project   # 安装到指定目录
 *   npx harness-starter --force            # 覆盖已有文件
 *   node scripts/init.mjs                  # 本地运行
 */

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templateRoot = join(__dirname, "..");

const args = process.argv.slice(2);
const force = args.includes("--force");
const targetArg = args.filter(a => a !== "--force")[0];
const target = targetArg ? resolve(targetArg) : process.cwd();

const FILES = [
  { src: join(templateRoot, ".claude"),        dest: join(target, ".claude"),         dir: true },
  { src: join(templateRoot, "CLAUDE.md"),       dest: join(target, "CLAUDE.md") },
  { src: join(templateRoot, ".lsp.json"),       dest: join(target, ".lsp.json") },
  { src: join(templateRoot, ".gitignore"),      dest: join(target, ".gitignore") },
  { src: join(templateRoot, "scripts"),         dest: join(target, "scripts"),        dir: true, optional: true },
  { src: join(templateRoot, ".github"),         dest: join(target, ".github"),        dir: true, optional: true },
];

console.log("\n=== Harness Starter 安装 ===\n");
console.log(`目标路径: ${target}\n`);

if (!existsSync(target)) {
  mkdirSync(target, { recursive: true });
  console.log("✅ 已创建目标目录");
}

let installed = 0;
let skipped = 0;

for (const { src, dest, dir, optional } of FILES) {
  if (!existsSync(src)) {
    if (optional) continue;
    console.log(`❌ 模板文件不存在: ${src}`);
    continue;
  }

  if (existsSync(dest) && !force) {
    console.log(`⏭️  已存在，跳过: ${dest.replace(target, ".")}`);
    skipped++;
    continue;
  }

  try {
    if (dir) {
      cpSync(src, dest, { recursive: true });
    } else {
      const destDir = dirname(dest);
      if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
      cpSync(src, dest);
    }
    console.log(`✅ 已安装: ${dest.replace(target, ".")}`);
    installed++;
  } catch (e) {
    console.log(`❌ 安装失败: ${dest.replace(target, ".")} — ${e.message}`);
  }
}

console.log(`\n📊 结果: ${installed} 已安装, ${skipped} 已跳过\n`);

// 写入版本跟踪文件
const versionPath = join(target, ".claude", ".harness-version");
const versionDir = join(target, ".claude");
if (!existsSync(versionDir)) mkdirSync(versionDir, { recursive: true });
const pkg = JSON.parse(readFileSync(join(templateRoot, "package.json"), "utf-8"));
writeFileSync(versionPath, JSON.stringify({
  version: pkg.version || "1.0.0",
  installed: new Date().toISOString(),
}, null, 2) + "\n", "utf-8");
console.log("✅ 已写入版本标记: .claude/.harness-version\n");

console.log("💡 下一步:");
console.log(`   1. cd ${target === process.cwd() ? "." : target}`);
console.log("   2. 在 Claude Code 中输入：帮我初始化 Harness");
console.log("   3. AI 会自动检测技术栈并完成配置\n");

if (skipped > 0) {
  console.log("💡 提示: 使用 --force 可覆盖已有文件\n");
}
