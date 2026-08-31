const fs = require('fs');
const path = require('path');

// 保存目录：打包后由 main.js 通过 DSH_APP_ROOT 指向 EXE 旁的可写目录（开发模式未设置时仍为项目根）
const SAVES_DIR = path.resolve(process.env.DSH_APP_ROOT || __dirname, '保存');
// 数据库为只读内置内容，始终随程序目录（打包后位于 app.asar 内，Electron 支持只读读取）
const DB_DIR = path.resolve(__dirname, 'renderer', '数据库');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function resolvePath(relPath) {
  // Prevent path traversal
  const full = path.resolve(SAVES_DIR, relPath);
  if (!full.startsWith(SAVES_DIR)) {
    throw new Error('Invalid path');
  }
  return full;
}

// 数据库只读通道（renderer/数据库）
function resolveDbPath(relPath) {
  const full = path.resolve(DB_DIR, relPath);
  if (!full.startsWith(DB_DIR)) {
    throw new Error('Invalid db path');
  }
  return full;
}

/** Read content from database (text, read-only) */
function readDbFile(relPath) {
  const fullPath = resolveDbPath(relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf-8');
}

/** List files in database dir */
function listDbFiles(relPath) {
  const fullPath = resolveDbPath(relPath);
  if (!fs.existsSync(fullPath)) return [];
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  return entries.map(function(e) {
    return { name: e.name, isDir: e.isDirectory() };
  });
}

/** Save content to a file (text) */
function saveFile(relPath, content) {
  const fullPath = resolvePath(relPath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content, 'utf-8');
  return { ok: true };
}

/** Read content from a file (text) */
function readFile(relPath) {
  const fullPath = resolvePath(relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf-8');
}

/** Read binary file as base64 string (无损读图片等二进制) */
function readFileBase64(relPath) {
  const fullPath = resolvePath(relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath).toString('base64');
}

/** Delete a file or directory */
function deleteFile(relPath) {
  const fullPath = resolvePath(relPath);
  if (!fs.existsSync(fullPath)) return { ok: true, notFound: true };
  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) {
    fs.rmSync(fullPath, { recursive: true, force: true });
  } else {
    fs.unlinkSync(fullPath);
  }
  return { ok: true };
}

/** List files/directories in a path */
function listFiles(relPath) {
  const fullPath = resolvePath(relPath);
  if (!fs.existsSync(fullPath)) return [];
  return fs.readdirSync(fullPath).map(name => {
    const stat = fs.statSync(path.join(fullPath, name));
    return {
      name,
      isDir: stat.isDirectory(),
      mtimeMs: stat.mtimeMs,
    };
  });
}

/** Check if a file/directory exists */
function fileExists(relPath) {
  return fs.existsSync(resolvePath(relPath));
}

/** Rename a file or directory (moving to new name) */
function renameItem(oldRelPath, newRelPath) {
  const oldFull = resolvePath(oldRelPath);
  const newFull = resolvePath(newRelPath);
  if (!fs.existsSync(oldFull)) return { ok: true, notFound: true };
  if (fs.existsSync(newFull)) return { ok: false, error: '目标已存在' };
  ensureDir(path.dirname(newFull));
  fs.renameSync(oldFull, newFull);
  return { ok: true };
}

/** Save binary content (Buffer) to a file */
function saveBinaryFile(relPath, buffer) {
  const fullPath = resolvePath(relPath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, buffer);
  return { ok: true, fullPath: fullPath };
}

module.exports = { saveFile, saveBinaryFile, readFile, readFileBase64, deleteFile, listFiles, fileExists, renameItem, readDbFile, listDbFiles };
