const { app, BrowserWindow, ipcMain, globalShortcut, screen, session, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

// ===== 应用根目录 =====
// 决定「保存 / 日志 / crash-logs」等可写目录落在哪里：
// - 开发模式：项目根目录（与旧行为一致）
// - 打包模式：EXE 所在目录（便携版由 electron-builder 注入 PORTABLE_EXECUTABLE_DIR；
//   目录版即 process.execPath 所在目录）—— 保证打包后数据写在 EXE 旁边，而不是写进只读的 app.asar
// 通过环境变量 DSH_APP_ROOT 传给 storage.js 等模块
var APP_ROOT = app.isPackaged
  ? (process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath))
  : __dirname;
process.env.DSH_APP_ROOT = APP_ROOT;

const storage = require('./storage.js');

// 必须在 app ready 之前调用：允许无用户手势时播放 Web Audio 合成提示音
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// 单实例锁：防止多个实例同时运行（残留旧实例会加载旧版 main.js，导致 IPC handler 重复注册）
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', function() {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

let mainWindow;
var _hangCheckInterval = null;

// ===== 心跳检测（检测非正常退出） =====
var HEARTBEAT_PATH = path.join(APP_ROOT, 'crash-logs', '.heartbeat');
function heartbeat() {
  try {
    var dir = path.join(APP_ROOT, 'crash-logs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(HEARTBEAT_PATH, String(Date.now()), 'utf8');
  } catch(e) {}
}

function markCleanExit() {
  try {
    var dir = path.join(APP_ROOT, 'crash-logs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(HEARTBEAT_PATH, 'clean', 'utf8');
  } catch(e) {}
}

function checkLastHeartbeat() {
  try {
    if (fs.existsSync(HEARTBEAT_PATH)) {
      var content = fs.readFileSync(HEARTBEAT_PATH, 'utf8');
      if (content !== 'clean') {
        var last = parseInt(content, 10);
        var elapsed = Date.now() - last;
        logCrash('abnormal-exit', new Error('上次异常退出（距上次心跳 ' + Math.round(elapsed/1000) + ' 秒）'));
      }
    }
  } catch(e) {}
}

// ===== 全局未捕获异常处理 =====

// ===== 全局未捕获异常处理 =====
process.on('uncaughtException', function(err) {
  logCrash('uncaughtException', err);
});
process.on('unhandledRejection', function(reason) {
  logCrash('unhandledRejection', reason);
});

function logCrash(type, err) {
  try {
    var now = new Date();
    var pad = function(n) { return String(n).padStart(2, '0'); };
    var filename = now.getFullYear() + '-' + pad(now.getMonth()+1) + '-' + pad(now.getDate()) +
                   '_' + pad(now.getHours()) + '-' + pad(now.getMinutes()) + '-' + pad(now.getSeconds()) +
                   '_' + now.getMilliseconds() + '.log';
    var dir = path.join(APP_ROOT, 'crash-logs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    var lines = [];
    lines.push('Time: ' + now.toLocaleString());
    lines.push('Type: ' + type);
    lines.push('Message: ' + (err && err.message ? err.message : String(err)));
    lines.push('Stack:');
    lines.push(err && err.stack ? err.stack : '(no stack)');
    lines.push('');
    lines.push('Platform: ' + process.platform);
    lines.push('Electron: ' + process.versions.electron);
    lines.push('Node: ' + process.versions.node);
    fs.writeFileSync(path.join(dir, filename), lines.join('\n'), 'utf8');
  } catch(e) {
    // 写日志本身失败时不做任何事，防止死循环
  }
}

// ===== 窗口模式及分辨率控制 =====
// 窗口尺寸与全局设置合并存储在 保存/settings.json（windowWidth/windowHeight 字段）
var savedWidth = 1400, savedHeight = 900;
try {
  var configPath = path.join(APP_ROOT, '保存', 'settings.json');
  if (fs.existsSync(configPath)) {
    var cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (cfg.windowWidth) savedWidth = cfg.windowWidth;
    if (cfg.windowHeight) savedHeight = cfg.windowHeight;
  }
} catch(e) {}

function setWindowSize(w, h) {
  if (!mainWindow) return;
  savedWidth = w;
  savedHeight = h;
  mainWindow.setSize(w, h);
  mainWindow.center();
  saveWindowConfig();
}

function saveWindowConfig() {
  try {
    var cfgPath = path.join(APP_ROOT, '保存', 'settings.json');
    var size = mainWindow ? mainWindow.getSize() : [savedWidth, savedHeight];
    var cfg = { windowWidth: size[0], windowHeight: size[1] };
    if (fs.existsSync(cfgPath)) {
      try {
        var existing = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
        if (existing && typeof existing === 'object') {
          existing.windowWidth = size[0];
          existing.windowHeight = size[1];
          cfg = existing;
        }
      } catch(ee) {}
    }
    fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), 'utf8');
  } catch(e) {}
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: savedWidth,
    height: savedHeight,
    minWidth: 960,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // 窗口关闭时保存尺寸
  mainWindow.on('close', function() {
    saveWindowConfig();
  });

  mainWindow.on('closed', function() {
    markCleanExit();
    mainWindow = null;
  });

  // 渲染进程 WebContents 终止
  mainWindow.webContents.on('destroyed', function() {
    if (mainWindow && !mainWindow._crashLogged) {
      mainWindow._crashLogged = true;
      logCrash('renderer-destroyed', new Error('Renderer WebContents destroyed'));
    }
  });
}

app.whenReady().then(function() {
  checkLastHeartbeat();
  // 启动时清除渲染进程缓存，确保 JS 文件更新后不被旧版本覆盖
  session.defaultSession.clearCache().catch(function() {});
  createWindow();

  // 每 5 秒更新心跳 + 检测渲染进程是否活着
  heartbeat();
  _hangCheckInterval = setInterval(function() {
    heartbeat();
    if (!mainWindow || mainWindow.isDestroyed()) { clearInterval(_hangCheckInterval); return; }
    try {
      mainWindow.webContents.getProcessMemoryInfo().catch(function() {
        logCrash('renderer-hang', new Error('Renderer process unresponsive'));
        clearInterval(_hangCheckInterval);
      });
    } catch(e) {}
  }, 5000);

  // 允许 F12 打开 DevTools
  mainWindow.webContents.on('before-input-event', function(event, input) {
    if (input.key === 'F12') {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
    if (input.key === 'F5' && !input.control && !input.meta) {
      mainWindow.webContents.reload();
      event.preventDefault();
    }
  });

  // 捕获渲染进程崩溃
  mainWindow.webContents.on('crashed', function() {
    logCrash('renderer-crashed', new Error('Renderer process crashed'));
  });

  // 正常退出时写 clean 标记
  app.on('before-quit', function() {
    if (_hangCheckInterval) clearInterval(_hangCheckInterval);
    markCleanExit();
  });
});

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ========== IPC Handlers ==========

// File system operations
ipcMain.handle('file-save', (event, relPath, content) => {
  const result = storage.saveFile(relPath, content);
  writeMainLog('file-save ' + relPath + ' (' + (content ? content.length + 'b' : '0b') + ')');
  return result;
});

ipcMain.handle('file-read', (event, relPath) => {
  const result = storage.readFile(relPath);
  return result;
});

// 读取二进制文件为 base64 字符串（图片等）
ipcMain.handle('file-read-base64', (event, relPath) => {
  const result = storage.readFileBase64(relPath);
  return result;
});

// 生成缩略图（nativeImage resize 到 150px，返回 base64 jpeg；不写盘，由渲染层存储）
ipcMain.handle('file-thumbnail', (event, relPath, size) => {
  const result = storage.readFileBase64(relPath);
  if (!result) return null;
  try {
    const { nativeImage } = require('electron');
    const img = nativeImage.createFromBuffer(Buffer.from(result, 'base64'));
    if (img.isEmpty()) return null;
    const s = Math.max(1, parseInt(size) || 150);
    const thumb = img.resize({ width: s, quality: 'good' });
    return thumb.toJPEG(80).toString('base64');
  } catch (e) {
    writeMainLog('file-thumbnail error: ' + e.message);
    return null;
  }
});

// 数据库只读通道（renderer/数据库）
ipcMain.handle('db-read', (event, relPath) => {
  return storage.readDbFile(relPath);
});
ipcMain.handle('db-list', (event, relPath) => {
  return storage.listDbFiles(relPath);
});

ipcMain.handle('file-delete', (event, relPath) => {
  const result = storage.deleteFile(relPath);
  writeMainLog('file-delete ' + relPath);
  return result;
});

ipcMain.handle('file-list', (event, relPath) => {
  return storage.listFiles(relPath);
});

ipcMain.handle('file-exists', (event, relPath) => {
  return storage.fileExists(relPath);
});

// ===== 网易云音乐 API 代理（渲染进程有 CORS 限制，统一走主进程） =====
const NETEASE_HEADERS = {
  'Referer': 'https://music.163.com/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};
function neteaseGet(urlPath) {
  return new Promise((resolve, reject) => {
    const req = https.get('https://music.163.com' + urlPath, { headers: NETEASE_HEADERS }, (res) => {
      let buf = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { buf += c; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error('netease HTTP ' + res.statusCode));
          return;
        }
        try { resolve(JSON.parse(buf)); }
        catch (e) { reject(new Error('netease parse fail')); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('netease timeout')));
  });
}
// 搜索歌曲（s: 关键词, limit: 条数）
ipcMain.handle('netease-search', async (event, s, limit) => {
  try {
    const n = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 30);
    const data = await neteaseGet('/api/search/get/web?csrf_token=&type=1&s=' + encodeURIComponent(String(s)) + '&limit=' + n);
    const songs = (data && data.result && data.result.songs) || [];
    return {
      ok: true,
      songs: songs.map((sg) => ({
        id: sg.id,
        name: sg.name || '',
        artist: (sg.artists || []).map((a) => a.name || '').filter(Boolean).join(' / '),
        album: (sg.album && sg.album.name) || '',
        duration: sg.duration || 0,
      })),
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});
// 获取歌词（id: 歌曲 id）
ipcMain.handle('netease-lyric', async (event, id) => {
  try {
    const data = await neteaseGet('/api/song/lyric?os=pc&id=' + encodeURIComponent(String(id)) + '&lv=-1&kv=-1&tv=-1');
    const lrc = (data && data.lrc && data.lrc.lyric) || '';
    return { ok: true, lrc: lrc };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.on('file-read-sync', (event, relPath) => {
  try {
    const result = storage.readFile(relPath);
    event.returnValue = result;
  } catch(e) {
    event.returnValue = null;
  }
});

ipcMain.handle('file-rename', (event, oldPath, newPath) => {
  const result = storage.renameItem(oldPath, newPath);
  writeMainLog('file-rename ' + oldPath + ' → ' + newPath + ' ' + JSON.stringify(result));
  return result;
});

// ===== 二进制文件保存 =====
ipcMain.handle('file-save-binary', (event, relPath, base64Data) => {
  const buffer = Buffer.from(base64Data, 'base64');
  const result = storage.saveBinaryFile(relPath, buffer);
  writeMainLog('file-save-binary ' + relPath + ' (' + buffer.length + 'b)');
  return result;
});

// ===== 从 URL 下载图片并保存到本地（主进程无 CORS 限制） =====
ipcMain.handle('download-and-save-image', async (event, imageUrl, relPath) => {
  try {
    writeMainLog('download-and-save-image ' + imageUrl + ' → ' + relPath);
    const buffer = await new Promise((resolve, reject) => {
      const urlObj = new URL(imageUrl);
      const mod = urlObj.protocol === 'https:' ? https : http;
      mod.get(imageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          // follow redirect
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const redirectUrl = new URL(res.headers.location, imageUrl).href;
            writeMainLog('download redirect ' + redirectUrl);
            const mod2 = redirectUrl.startsWith('https') ? https : http;
            mod2.get(redirectUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res2) => {
              const chunks = [];
              res2.on('data', c => chunks.push(c));
              res2.on('end', () => resolve(Buffer.concat(chunks)));
              res2.on('error', reject);
            }).on('error', reject);
            return;
          }
          reject(new Error('HTTP ' + res.statusCode));
          return;
        }
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }).on('error', reject);
    });
    const result = storage.saveBinaryFile(relPath, buffer);
    writeMainLog('download-and-save-image done (' + buffer.length + 'b) → ' + (result.fullPath || ''));
    return result;
  } catch (e) {
    writeMainLog('download-and-save-image failed: ' + e.message);
    return { ok: false, error: e.message };
  }
});

// ===== 系统默认程序打开文件 =====
ipcMain.handle('file-open-path', async (event, fullPath) => {
  try {
    const err = await shell.openPath(fullPath);
    if (err) {
      writeMainLog('file-open-path error: ' + err);
      return { ok: false, error: err };
    }
    writeMainLog('file-open-path ok: ' + fullPath);
    return { ok: true };
  } catch (e) {
    writeMainLog('file-open-path exception: ' + e.message);
    return { ok: false, error: e.message };
  }
});

// ===== 剪贴板写入（渲染进程 navigator.clipboard 在 Electron 中可能不可用/被拒，走主进程可靠）=====
ipcMain.handle('clipboard-write', (event, text) => {
  try {
    const { clipboard } = require('electron');
    clipboard.writeText(String(text == null ? '' : text));
    return { ok: true };
  } catch (e) {
    writeMainLog('clipboard-write exception: ' + e.message);
    return { ok: false, error: e.message };
  }
});

// ===== 窗口模式控制 =====
ipcMain.handle('set-window-mode', function(event, mode) {
  if (!mainWindow) return;
  if (mode === 'fullscreen') {
    mainWindow.setFullScreen(true);
  } else {
    mainWindow.setFullScreen(false);
    mainWindow.setMenuBarVisibility(mode === 'windowed');
    if (mode === 'borderless') {
      mainWindow.setMenuBarVisibility(false);
    }
  }
});

ipcMain.handle('set-window-size', function(event, w, h) {
  if (!mainWindow) return;
  if (w < 960) w = 960;
  if (h < 600) h = 600;
  // setSize 参数为 DIP，渲染进程传的 CSS 像素即 DIP，无需按缩放因子换算
  setWindowSize(w, h);
});

// ===== RunningHub 文档站抓取代理（渲染进程有 CORS 限制，统一走主进程） =====
// 官方 openapi 无"获取模型列表"接口，模型数据来源为文档站 llms.txt + 各模型 .md
function runninghubGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url).href;
        runninghubGet(redirectUrl).then(resolve, reject);
        return;
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error('HTTP ' + res.statusCode));
        return;
      }
      let buf = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { buf += c; });
      res.on('end', () => resolve(buf));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('runninghub fetch timeout')));
  });
}
ipcMain.handle('rh-fetch-doc', async (event, urlPath) => {
  // 仅允许 runninghub.cn 文档站，防 SSRF
  if (!/^\/runninghub-api-doc-cn\/[A-Za-z0-9_\-.]{1,80}$/.test(urlPath)) {
    return { ok: false, error: '非法路径' };
  }
  try {
    const text = await runninghubGet('https://www.runninghub.cn' + urlPath);
    return { ok: true, text: text };
  } catch (e) {
    writeMainLog('rh-fetch-doc failed: ' + urlPath + ' ' + e.message);
    return { ok: false, error: e.message };
  }
});

// ===== RunningHub 图片上传（multipart，主进程代理无 CORS 限制） =====
// 用于图生图：本地文件转 dataURL 后，先上传获取 download_url，再作为模型图片参数提交
ipcMain.handle('rh-upload-image', async (event, apiKey, base64Data, mimeType) => {
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length === 0) return { ok: false, error: '空文件' };
    if (buffer.length > 15 * 1024 * 1024) return { ok: false, error: '文件过大（超过 15MB）' };
    const extMap = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/webp': '.webp' };
    const ext = extMap[mimeType || ''] || '.png';
    // multipart/form-data 边界
    const boundary = '----RH' + Date.now() + Math.random().toString(36).slice(2);
    const chunks = [];
    chunks.push(Buffer.from('--' + boundary + '\r\n'));
    chunks.push(Buffer.from('Content-Disposition: form-data; name="file"; filename="upload' + ext + '"\r\n'));
    chunks.push(Buffer.from('Content-Type: ' + (mimeType || 'image/png') + '\r\n\r\n'));
    chunks.push(buffer);
    chunks.push(Buffer.from('\r\n--' + boundary + '--\r\n'));
    const body = Buffer.concat(chunks);
    const result = await new Promise((resolve, reject) => {
      const req = https.request('https://www.runninghub.cn/openapi/v2/media/upload/binary', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'multipart/form-data; boundary=' + boundary,
          'Content-Length': body.length,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        },
      }, (res) => {
        let buf = '';
        res.setEncoding('utf8');
        res.on('data', (c) => { buf += c; });
        res.on('end', () => {
          let json = null;
          try { json = JSON.parse(buf); } catch (e) {}
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error('HTTP ' + res.statusCode + (json ? ': ' + JSON.stringify(json).slice(0, 200) : '')));
            return;
          }
          resolve(json || {});
        });
      });
      req.on('error', reject);
      req.setTimeout(30000, () => req.destroy(new Error('upload timeout')));
      req.write(body);
      req.end();
    });
    if (result.code !== undefined && result.code !== 0) {
      return { ok: false, error: result.message || '上传失败 code=' + result.code };
    }
    const url = (result.data && (result.data.download_url || result.data.url)) || '';
    if (!url) return { ok: false, error: '上传成功但未返回 download_url' };
    return { ok: true, url: url };
  } catch (e) {
    writeMainLog('rh-upload-image failed: ' + e.message);
    return { ok: false, error: e.message };
  }
});

// ===== 渲染进程日志 IPC（写入 APP_ROOT/日志/） =====
const LOG_DIR = path.join(APP_ROOT, '日志');
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}
function writeMainLog(msg) {
  try {
    ensureLogDir();
    var now = new Date();
    var dateStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
    var logFile = path.join(LOG_DIR, dateStr + '.log');
    var line = '[' + now.toISOString() + '] [main] ' + msg + '\n';
    fs.appendFileSync(logFile, line, 'utf8');
  } catch(e) { console.error('[写日志失败]', e.message); }
}
ipcMain.handle('write-log', function(event, entry) {
  try {
    ensureLogDir();
    var now = new Date();
    var dateStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
    var logFile = path.join(LOG_DIR, dateStr + '.log');
    var line = '[' + now.toISOString() + '] [' + (entry.module||'system') + '] ' + (entry.action||'') + (entry.detail ? ' | ' + entry.detail : '') + '\n';
    fs.appendFileSync(logFile, line, 'utf8');
    return { ok: true };
  } catch(e) { console.error('[写日志失败]', e.message); return { ok: false, error: e.message }; }
});
ipcMain.handle('write-log-main', function(event, entry) {
  try {
    ensureLogDir();
    var now = new Date();
    var dateStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
    var logFile = path.join(LOG_DIR, dateStr + '.log');
    var line = '[' + now.toISOString() + '] [main] ' + (entry||'') + '\n';
    fs.appendFileSync(logFile, line, 'utf8');
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

// ===== 视频参考片段拆分工具（ffmpeg） =====
// 查找顺序：1) 环境变量 DSH_FFMPEG  2) EXE 旁 ffmpeg/ffmpeg.exe（可自行放置精简 ffmpeg，不重新打包）
//           3) 开发模式 TTS venv 内置的 imageio_ffmpeg  4) 系统 PATH 上的 ffmpeg
function resolveFfmpeg() {
  if (process.env.DSH_FFMPEG && fs.existsSync(process.env.DSH_FFMPEG)) return process.env.DSH_FFMPEG;
  var exeSide = path.join(APP_ROOT, 'ffmpeg', 'ffmpeg.exe');
  if (fs.existsSync(exeSide)) return exeSide;
  var devBin = path.join(__dirname, 'renderer', '声图创作', '配音配乐', 'tts-engine', 'project', '.venv', 'Lib', 'site-packages', 'imageio_ffmpeg', 'binaries', 'ffmpeg-win-x86_64-v7.1.exe');
  if (fs.existsSync(devBin)) return devBin;
  return 'ffmpeg';  // 系统 PATH
}
const FFMPEG_EXE = resolveFfmpeg();
const VIDEO_SPLIT_DIR = '视频参考片段/';
// H3 参考视频限制
const VIDEO_SEG_MAX_SEC = 15;      // 每段最大秒数
const VIDEO_SEG_MAX_BYTES = 50 * 1024 * 1024;  // 每段最大 50MB

function ffmpegExec(args, timeoutMs) {
  return new Promise(function(resolve, reject) {
    if (FFMPEG_EXE !== 'ffmpeg' && !fs.existsSync(FFMPEG_EXE)) { reject(new Error('ffmpeg 不存在: ' + FFMPEG_EXE)); return; }
    const { execFile } = require('child_process');
    execFile(FFMPEG_EXE, args, { timeout: timeoutMs || 300000, maxBuffer: 4 * 1024 * 1024 }, function(err, stdout, stderr) {
      // ffmpeg 正常结束也会向 stderr 输出日志;err 只在真正失败时非 null
      resolve({ err: err, stdout: String(stdout || ''), stderr: String(stderr || '') });
    });
  });
}

// 从 ffmpeg stderr 解析时长（Duration: 00:01:00.00）
function parseDuration(stderr) {
  var m = String(stderr || '').match(/Duration:\s*(\d+):(\d+):(\d+\.?\d*)/);
  if (!m) return null;
  return parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]);
}

// 从 ffmpeg stderr 解析分辨率（Stream ... 1920x1080）
function parseResolution(stderr) {
  var m = String(stderr || '').match(/(\d{2,5})x(\d{2,5})/);
  if (!m) return null;
  return { width: parseInt(m[1]), height: parseInt(m[2]) };
}

// 文件大小（字节）
function fileSize(filePath) {
  try { return fs.statSync(filePath).size; } catch(e) { return 0; }
}

// 选择视频文件
ipcMain.handle('video-pick-file', async function() {
  try {
    const result = await dialog.showOpenDialog({
      title: '选择视频文件',
      properties: ['openFile'],
      filters: [{ name: '视频', extensions: ['mp4', 'mov', 'mkv', 'webm', 'avi'] }],
    });
    if (result.canceled || !result.filePaths || !result.filePaths.length) return { ok: false, canceled: true };
    return { ok: true, filePath: result.filePaths[0] };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

// 探测视频信息（时长/分辨率）
ipcMain.handle('video-probe', async function(event, filePath) {
  try {
    if (!filePath) return { ok: false, error: '未提供文件路径' };
    const r = await ffmpegExec(['-i', filePath], 60000);
    var duration = parseDuration(r.stderr);
    var res = parseResolution(r.stderr);
    if (duration === null) return { ok: false, error: '无法解析视频时长（可能不是有效视频）' };
    return { ok: true, durationSec: Math.round(duration * 10) / 10, width: res ? res.width : null, height: res ? res.height : null };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

// 拆分视频：按 segDur 秒/段重编码，每段压到 ≤50MB
ipcMain.handle('video-split', async function(event, filePath, outRelDir, segDurSec) {
  try {
    if (!filePath || !fs.existsSync(filePath)) return { ok: false, error: '源文件不存在' };
    var segDur = Math.max(2, Math.min(parseInt(segDurSec, 10) || VIDEO_SEG_MAX_SEC, VIDEO_SEG_MAX_SEC));
    // 探测总时长
    var probe = await ffmpegExec(['-i', filePath], 60000);
    var duration = parseDuration(probe.stderr);
    if (duration === null) return { ok: false, error: '无法解析视频时长' };
    // 输出目录（保存/白名单校验）
    var relDir = outRelDir || VIDEO_SPLIT_DIR;
    if (relDir.indexOf('..') >= 0 || relDir.indexOf(':') >= 0 || path.isAbsolute(relDir)) return { ok: false, error: '非法输出目录' };
    var savesRoot = path.join(APP_ROOT, '保存');
    var outAbsDir = path.resolve(savesRoot, relDir);
    if (!outAbsDir.startsWith(savesRoot)) return { ok: false, error: '非法输出目录' };
    fs.mkdirSync(outAbsDir, { recursive: true });
    // 计算段数
    var segCount = Math.ceil(duration / segDur);
    var segments = [];
    for (var i = 0; i < segCount; i++) {
      var start = i * segDur;
      var outFile = path.join(outAbsDir, '片段' + (i + 1) + '_' + start + 's.mp4');
      // 重编码压码率: crf 从 23 起,超 50MB 逐级降到 32
      var crf = 23;
      for (var attempt = 0; attempt < 3; attempt++) {
        var args = ['-y', '-i', filePath, '-ss', String(start), '-t', String(segDur),
          '-c:v', 'libx264', '-preset', 'fast', '-crf', String(crf),
          '-maxrate', '20M', '-bufsize', '40M', '-c:a', 'aac', '-b:a', '128k', outFile];
        var r = await ffmpegExec(args, 600000);
        if (r.err && fs.existsSync(outFile)) { try { fs.unlinkSync(outFile); } catch(e) {} }
        if (!r.err && fileSize(outFile) <= VIDEO_SEG_MAX_BYTES) break;
        crf = crf + 4;  // 28, 32
      }
      if (!fs.existsSync(outFile)) {
        return { ok: false, error: '片段 ' + (i + 1) + ' 生成失败', segments: segments };
      }
      segments.push({ index: i + 1, startSec: start, durationSec: segDur, file: outFile, sizeBytes: fileSize(outFile) });
    }
    return { ok: true, segments: segments, sourceDuration: duration };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

// ===== 渲染进程错误日志 IPC（绕过 saves/ 限制，写入项目根目录 crash-logs/） =====
ipcMain.handle('crash-log', function(event, errInfo) {
  try {
    var now = new Date();
    var pad = function(n) { return String(n).padStart(2, '0'); };
    var filename = now.getFullYear() + '-' + pad(now.getMonth()+1) + '-' + pad(now.getDate()) +
                   '_' + pad(now.getHours()) + '-' + pad(now.getMinutes()) + '-' + pad(now.getSeconds()) +
                   '_' + now.getMilliseconds() + '.log';
    var dir = path.join(APP_ROOT, 'crash-logs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    var lines = [
      'Time: ' + now.toLocaleString(),
      'Type: ' + (errInfo.type || 'renderer-error'),
      'Message: ' + (errInfo.message || ''),
      'Stack:',
      errInfo.stack || '(no stack)',
      '',
      'URL: ' + (errInfo.url || ''),
      'Line: ' + (errInfo.line || '') + ':' + (errInfo.col || ''),
    ];
    fs.writeFileSync(path.join(dir, filename), lines.join('\n'), 'utf8');
  } catch(e) { /* crash log write error — do nothing */ }
});

// ===== 配音配乐 · TTS 引擎管理 =====
const { spawn } = require('child_process');
// 精简版（默认打包）不附带本地 TTS 引擎（约 14.6GB：Python venv + OmniVoice/whisper 等模型权重）。
// 引擎定位顺序：
//   1) 环境变量 DSH_TTS_ENGINE_DIR（显式指定外部引擎目录）
//   2) EXE 旁的 tts-engine/（把完整引擎文件夹放到便携包旁边即可启用，不重新打包）
//   3) 开发模式项目内的 tts-engine/
// 找不到时优雅降级：tts-engine-start 返回明确错误，主程序照常运行。
function resolveTtsEngineDir() {
  if (process.env.DSH_TTS_ENGINE_DIR) return path.resolve(process.env.DSH_TTS_ENGINE_DIR);
  var exeSide = path.join(APP_ROOT, 'tts-engine');
  if (fs.existsSync(path.join(exeSide, 'project', '.venv', 'Scripts', 'python.exe'))) return exeSide;
  return path.join(__dirname, 'renderer', '声图创作', '配音配乐', 'tts-engine');
}
const TTS_ENGINE_DIR = resolveTtsEngineDir();
const TTS_VENV_PYTHON = path.join(TTS_ENGINE_DIR, 'project', '.venv', 'Scripts', 'python.exe');
const TTS_BACKEND_DIR = path.join(TTS_ENGINE_DIR, 'project', 'backend');
const TTS_TRANSCRIBE = path.join(TTS_ENGINE_DIR, 'transcribe.py');
const TTS_HF_CACHE = path.join(TTS_ENGINE_DIR, 'hf-cache');
const TTS_MODEL_CACHE = path.join(TTS_ENGINE_DIR, 'models', 'hf_cache');
// 音色数据目录（音色库/克隆音频/数据库）—— 随引擎目录走，不依赖 AppData
const TTS_DATA_DIR = path.join(TTS_ENGINE_DIR, '..', '音色库');

let ttsEngineProcess = null;
let ttsEngineStarting = false;

// 启动配音引擎（后台 python 进程）；force=true 时强制重启（先停残留进程）
ipcMain.handle('tts-engine-start', (event, force) => {
  // 互斥锁：force 流程进行中（杀端口→等 500ms→spawn）或引擎启动中时，
  // 并发请求直接返回 starting，避免两个 spawnEngine 并存互相挤掉（exit 103 竞态）
  if (force) {
    if (ttsEngineStarting) return Promise.resolve({ ok: true, starting: true });
    // 强制模式：先杀残留进程、清引用，再重新拉起
    if (ttsEngineProcess) {
      try { ttsEngineProcess.kill(); } catch(e) {}
      ttsEngineProcess = null;
    }
    ttsEngineStarting = true;
    writeMainLog('tts-engine force restart requested');
    return new Promise((resolve) => {
      const killPort = () => {
        const { exec } = require('child_process');
        const myPid = process.pid;
        exec('netstat -ano | findstr :3900', (err, stdout) => {
          const pids = new Set();
          (stdout || '').split(/\r?\n/).forEach((line) => {
            // 只匹配 LISTENING 状态的监听进程（真正的引擎），排除 TIME_WAIT 的 PID 0 和连接方
            if (line.indexOf('LISTENING') < 0) return;
            const m = line.match(/\s(\d+)\s*$/);
            if (m) pids.add(parseInt(m[1]));
          });
          pids.forEach((pid) => {
            if (!pid || pid === myPid) return;  // 绝不杀自己
            try { process.kill(pid, 'SIGKILL'); writeMainLog('tts-engine force kill pid=' + pid); } catch(e) {}
          });
          // 端口清理完再正常启动（复用下方普通启动逻辑）
          setTimeout(() => {
            spawnEngine().then(resolve);
          }, 500);
        });
      };
      killPort();
    });
  }
  if (ttsEngineProcess) return Promise.resolve({ ok: true, already: true });
  if (ttsEngineStarting) return Promise.resolve({ ok: true, starting: true });
  if (!fs.existsSync(TTS_VENV_PYTHON)) {
    return Promise.resolve({ ok: false, error: '配音引擎未安装：本精简版未随包附带本地模型（引擎体积约 14.6GB）。' +
      '可将完整 tts-engine 文件夹放到程序旁的 tts-engine/ 目录，或用环境变量 DSH_TTS_ENGINE_DIR 指定引擎位置。（' + TTS_VENV_PYTHON + '）' });
  }
  ttsEngineStarting = true;

  // 端口预检：3900 已有可用引擎（残留进程）则直接复用，避免重复 spawn 报"端口被占"
  return new Promise((resolve) => {
    const net = require('net');
    const probe = net.connect({ host: '127.0.0.1', port: 3900 });
    probe.once('connect', function() {
      probe.destroy();
      ttsEngineStarting = false;
      writeMainLog('tts-engine already running on 3900, reuse');
      resolve({ ok: true, already: true });
    });
    probe.once('error', function() {
      probe.destroy();
      spawnEngine().then(resolve);
    });
  });
});

// 实际拉起引擎进程（供普通启动与强制重启共用）
function spawnEngine() {
  return new Promise((resolve) => {
    try {
      ttsEngineProcess = spawn(TTS_VENV_PYTHON, ['main.py'], {
        cwd: TTS_BACKEND_DIR,
        env: { ...process.env, HF_HUB_OFFLINE: '1', OMNIVOICE_CACHE_DIR: TTS_MODEL_CACHE, HF_HOME: TTS_MODEL_CACHE, HF_HUB_CACHE: TTS_MODEL_CACHE, OMNIVOICE_DATA_DIR: TTS_DATA_DIR },
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false,
      });
      // 引擎日志转发到主日志（诊断启动即退/exit 103 问题用）
      ttsEngineProcess.stdout.on('data', (d) => writeMainLog('[tts-engine:out] ' + String(d).trim()));
      ttsEngineProcess.stderr.on('data', (d) => writeMainLog('[tts-engine:err] ' + String(d).trim()));
      ttsEngineProcess.on('exit', (code, sig) => {
        writeMainLog('tts-engine exit code=' + code + ' signal=' + sig);
        ttsEngineProcess = null;
        ttsEngineStarting = false;
      });
      ttsEngineProcess.on('error', (err) => {
        ttsEngineProcess = null;
        ttsEngineStarting = false;
        writeMainLog('tts-engine spawn error: ' + err.message);
      });
      writeMainLog('tts-engine started');
      resolve({ ok: true });
    } catch (e) {
      ttsEngineStarting = false;
      resolve({ ok: false, error: String(e) });
    }
  });
}

// 停止配音引擎
ipcMain.handle('tts-engine-stop', () => {
  if (ttsEngineProcess) {
    ttsEngineProcess.kill();
    ttsEngineProcess = null;
    ttsEngineStarting = false;
  }
  return { ok: true };
});

// 引擎是否在运行（installed 表示本地引擎文件是否就位，供 UI 区分「未安装」与「未运行」）
ipcMain.handle('tts-engine-status', () => {
  return { running: !!ttsEngineProcess, starting: ttsEngineStarting, installed: fs.existsSync(TTS_VENV_PYTHON) };
});

// 音频转写（faster-whisper base）——接收 base64，存临时文件转写
ipcMain.handle('tts-transcribe', (event, base64Data, ext) => {
  return new Promise((resolve) => {
    try {
      const tmpDir = path.join(APP_ROOT, '保存', '音频', '_tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      const tmpFile = path.join(tmpDir, 'ref_' + Date.now() + '.' + (ext || 'wav'));
      fs.writeFileSync(tmpFile, Buffer.from(base64Data, 'base64'));
      const { execFile } = require('child_process');
      execFile(TTS_VENV_PYTHON, [TTS_TRANSCRIBE, tmpFile], { timeout: 180000, maxBuffer: 1024 * 1024, env: { ...process.env, HF_HOME: TTS_HF_CACHE, HF_HUB_OFFLINE: '1' } }, (err, stdout, stderr) => {
        try { fs.unlinkSync(tmpFile); } catch(e) {}
        if (err) {
          resolve({ ok: false, error: String(stderr || err.message).slice(0, 300) });
          return;
        }
        const text = String(stdout || '').trim();
        resolve(text ? { ok: true, text } : { ok: false, error: '转写为空' });
      });
    } catch (e) {
      resolve({ ok: false, error: String(e).slice(0, 300) });
    }
  });
});

// ===== 作品库层级树（自动扫描 renderer/业务容器 的 区块 → 顶层模块 → 子类型）=====
// 供「从作品库选择」全局组件自动生成内容树：新增内容类型（新的一块 子模块 目录 + createStore）后无需改任何配置。
// 规则（与真实 UI 的 区块→顶层模块→子模块 层级一致）：
//   - 子模块精确归属：从各叶子 entry.js 的 `Store.<KEY> = createStore(...)` / `storeKey:'<KEY>'` 提取（主源）
//   - 注册表建 store、模块直接引用的库（如 成人小说/世界观/互动小说）：按「子模块从未归属过 + 该模块引用次数最多」补到该模块
//   - STORE_DIRS 里带层级路径的（如 情欲文学/生活纪实）：按路径补到 区块/顶层模块
ipcMain.handle('get-works-tree', () => {
  try {
    var baseDir = path.join(__dirname, 'renderer', '业务容器');
    if (!fs.existsSync(baseDir)) return { ok: true, tree: [] };
    var tree = [];
    var modRefs = {};      // block/module -> {store: count}
    var blocks = fs.readdirSync(baseDir, { withFileTypes: true }).filter(function(e) { return e.isDirectory() && e.name.indexOf('区块-') === 0; });
    blocks.sort(function(a, b) { return a.name.localeCompare(b.name); });
    blocks.forEach(function(blk) {
      var blockLabel = blk.name.replace('区块-', '');
      var modsDir = path.join(baseDir, blk.name);
      var modules = fs.readdirSync(modsDir, { withFileTypes: true }).filter(function(e) { return e.isDirectory() && e.name.indexOf('顶层模块-') === 0; });
      modules.sort(function(a, b) { return a.name.localeCompare(b.name); });
      var modNodes = [];
      modules.forEach(function(mod) {
        var modLabel = mod.name.replace('顶层模块-', '');
        var subsDir = path.join(modsDir, mod.name);
        var subs = fs.readdirSync(subsDir, { withFileTypes: true }).filter(function(e) { return e.isDirectory() && e.name.indexOf('子模块-') === 0; });
        subs.sort(function(a, b) { return a.name.localeCompare(b.name); });
        var stores = [];
        var seen = {};
        var refs = {};
        subs.forEach(function(sub) {
          var subLabel = sub.name.replace('子模块-', '');
          if (subLabel === '主界面' || subLabel === '共享工厂' || subLabel === '主面板') return;
          var subDir = path.join(subsDir, sub.name);
          var keys = [];
          var walk = function(d) {
            var ents = fs.readdirSync(d, { withFileTypes: true });
            ents.forEach(function(en) {
              if (en.isDirectory()) walk(path.join(d, en.name));
              else if (en.name === 'entry.js' || /\.js$/.test(en.name)) {
                var txt = fs.readFileSync(path.join(d, en.name), 'utf8');
                var m1 = null; var re1 = /Store\.(\w+)\s*=\s*createStore\(/g;
                while ((m1 = re1.exec(txt))) { if (keys.indexOf(m1[1]) < 0) keys.push(m1[1]); }
                var m2 = null; var re2 = /storeKey:\s*'(\w+)'/g;
                while ((m2 = re2.exec(txt))) { if (keys.indexOf(m2[1]) < 0) keys.push(m2[1]); }
                var m3 = null; var re3 = /Store\.(\w+)/g;
                while ((m3 = re3.exec(txt))) { refs[m3[1]] = (refs[m3[1]] || 0) + 1; }
              }
            });
          };
          walk(subDir);
          keys.forEach(function(k) { if (!seen[k]) { seen[k] = true; stores.push({ label: subLabel, store: k }); } });
        });
        modRefs[blockLabel + '/' + modLabel] = refs;
        if (stores.length) modNodes.push({ label: modLabel, stores: stores });
      });
      if (modNodes.length) tree.push({ label: blockLabel, modules: modNodes });
    });
    // 已被子模块精确归属的 store（不参与引用次数补全，避免交叉引用噪声）
    var attributed = {};
    tree.forEach(function(b) { (b.modules || []).forEach(function(m) { (m.stores || []).forEach(function(s) { attributed[s.store] = true; }); }); });
    // 每个 store 归属到引用次数最多的模块
    var owner = {};
    Object.keys(modRefs).forEach(function(k) {
      var refs = modRefs[k];
      Object.keys(refs).forEach(function(s) {
        if (!owner[s] || refs[s] > owner[s].count) owner[s] = { mod: k, count: refs[s] };
      });
    });
    // 把「引用最多且未被精确归属」的 store 补到对应模块（label 用模块名）
    Object.keys(owner).forEach(function(s) {
      if (attributed[s]) return;
      var parts = owner[s].mod.split('/');
      var blockLabel = parts[0], modLabel = parts[1];
      var blk = null;
      for (var i = 0; i < tree.length; i++) if (tree[i].label === blockLabel) { blk = tree[i]; break; }
      if (!blk) { blk = { label: blockLabel, modules: [] }; tree.push(blk); }
      var md = null;
      for (var j = 0; j < blk.modules.length; j++) if (blk.modules[j].label === modLabel) { md = blk.modules[j]; break; }
      if (!md) { md = { label: modLabel, stores: [] }; blk.modules.push(md); }
      var exists = md.stores.some(function(x) { return x.store === s; });
      if (!exists) md.stores.push({ label: modLabel, store: s });
    });
    // STORE_DIRS 里带层级路径的库（如 情欲文学/生活纪实）按路径补到 区块/顶层模块
    try {
      var dirsModule = path.join(__dirname, 'renderer', '区块-存储', '顶层模块-核心', '子模块-目录', '叶子模块-主面板', 'entry.js');
      if (fs.existsSync(dirsModule)) {
        var dirsTxt = fs.readFileSync(dirsModule, 'utf8');
        var reStoreDir = /(\w+):\s*'([^']+)'/g;
        var mSd = null;
        while ((mSd = reStoreDir.exec(dirsTxt))) {
          var key = mSd[1], dir = mSd[2];
          if (String(dir).indexOf('/') < 0) continue;
          if (tree.some(function(b) { return (b.modules || []).some(function(m) { return (m.stores || []).some(function(x) { return x.store === key; }); }); })) continue;
          var segs = String(dir).split('/').filter(Boolean);
          var bLabel = segs[0], mLabel = segs[1] || segs[0], leafLabel = segs[segs.length - 1];
          var blkR = null;
          for (var bi = 0; bi < tree.length; bi++) if (tree[bi].label === bLabel) { blkR = tree[bi]; break; }
          if (!blkR) { blkR = { label: bLabel, modules: [] }; tree.push(blkR); }
          var mdR = null;
          for (var mj = 0; mj < blkR.modules.length; mj++) if (blkR.modules[mj].label === mLabel) { mdR = blkR.modules[mj]; break; }
          if (!mdR) { mdR = { label: mLabel, stores: [] }; blkR.modules.push(mdR); }
          var exR = mdR.stores.some(function(x) { return x.store === key; });
          if (!exR) mdR.stores.push({ label: leafLabel, store: key });
        }
      }
    } catch (e) {}
    return { ok: true, tree: tree };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});
