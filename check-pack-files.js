// 打包文件清单校验工具
// 作用：在不联网、不安装 electron-builder 的情况下，模拟 package.json build.files 白名单，
// 输出"真正会打进安装包的文件清单 + 总体积"，用于确认重型目录（TTS 引擎等）已被剔除。
// 用法：node check-pack-files.js   （或 npm run check）
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const patterns = (pkg.build && pkg.build.files) || [];

// ---- 轻量 glob 匹配（仅覆盖本项目用到的模式子集） ----
// 规则与 electron-builder/minimatch 一致：路径用 / 分隔；最后一条命中的模式决定去留。
function patternMatch(rel, pattern) {
  if (pattern === '**/*') return true;
  if (pattern.endsWith('/**')) {
    const prefix = pattern.slice(0, -3); // 去掉 /**
    return rel === prefix.replace(/\/$/, '') || rel.startsWith(prefix);
  }
  if (pattern.includes('*')) {
    // 仅支持 ** 或 * 的简单情况（本项目未使用复杂通配）
    const re = new RegExp('^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*') + '$');
    return re.test(rel);
  }
  return rel === pattern;
}

function included(rel) {
  let inc = false;
  for (const p of patterns) {
    const neg = p.startsWith('!');
    const pat = neg ? p.slice(1) : p;
    if (patternMatch(rel, pat)) inc = !neg;
  }
  return inc;
}

// ---- 递归收集（跳过重型/无关目录，避免扫 14.6GB） ----
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '保存', '日志', 'crash-logs', '.claude']);
const files = [];

function walk(dir, relBase) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const ent of entries) {
    if (ent.name.startsWith('.') && ent.name !== '.heartbeat') continue;
    const full = path.join(dir, ent.name);
    const rel = relBase ? relBase + '/' + ent.name : ent.name;
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      walk(full, rel);
    } else if (ent.isFile()) {
      if (included(rel)) {
        let size = 0;
        try { size = fs.statSync(full).size; } catch (e) {}
        files.push({ rel, size });
      }
    }
  }
}
walk(ROOT, '');

// 自动附带：electron-builder 总会包含生产依赖 node_modules（当前 dependencies 为空则没有）
// 略。

// ---- 报告 ----
const total = files.reduce((s, f) => s + f.size, 0);
console.log('使用的 build.files 规则:');
for (const p of patterns) console.log('  ' + p);
console.log('');
console.log('预计打包文件数: ' + files.length);
console.log('预计打包总体积: ' + (total / 1024 / 1024).toFixed(1) + ' MB');
console.log('');

// 按一级/二级目录汇总
const byCat = {};
for (const f of files) {
  const parts = f.rel.split('/');
  const cat = parts.length > 1 ? parts[0] + '/' + parts[1] : parts[0];
  if (!byCat[cat]) byCat[cat] = { count: 0, size: 0 };
  byCat[cat].count++;
  byCat[cat].size += f.size;
}
console.log('按目录汇总（前 20）:');
Object.entries(byCat)
  .sort((a, b) => b[1].size - a[1].size)
  .slice(0, 20)
  .forEach(([cat, v]) => {
    console.log('  ' + cat.padEnd(46) + (v.size / 1024 / 1024).toFixed(1).padStart(9) + ' MB  (' + v.count + ' 文件)');
  });

console.log('');
console.log('体积最大的 10 个文件:');
files.sort((a, b) => b.size - a.size).slice(0, 10).forEach(f => {
  console.log('  ' + (f.size / 1024 / 1024).toFixed(1).padStart(9) + ' MB  ' + f.rel);
});
