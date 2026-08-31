// 深度-叙事引擎 · 本地文件系统封装
var 本地FS = {};

本地FS.清理 = function(name) {
  if (!name) return '未命名';
  return String(name).replace(/[<>:"/\\|?*\x00-\x1f]/g, '').trim() || '未命名';
};

本地FS.保存文本 = function(relPath, content) {
  return window.narrative.fileSave(relPath, content);
};

本地FS.读取文本 = function(relPath) {
  return window.narrative.fileRead(relPath);
};

// 读取二进制文件为 base64 字符串（无损读图片等）
本地FS.读取二进制 = function(relPath) {
  return window.narrative.fileReadBase64(relPath);
};

本地FS.保存JSON = function(relPath, data) {
  return window.narrative.fileSave(relPath, JSON.stringify(data, null, 2));
};

本地FS.读取JSON = function(relPath) {
  return window.narrative.fileRead(relPath).then(function(text) {
    return text ? JSON.parse(text) : null;
  });
};

本地FS.读取JSON同步 = function(relPath) {
  if (!window.narrative.fileReadSync) return null;
  try {
    var text = window.narrative.fileReadSync(relPath);
    return text ? JSON.parse(text) : null;
  } catch(e) { return null; }
};

本地FS.删除 = function(relPath) {
  return window.narrative.fileDelete(relPath);
};

// 保存二进制（base64 字符串，主进程解码写盘）
本地FS.保存二进制 = function(relPath, base64Data) {
  return window.narrative.fileSaveBinary(relPath, base64Data);
};

本地FS.列表 = function(relPath) {
  return window.narrative.fileList(relPath);
};

// 数据库只读通道（renderer/数据库）
本地FS.dbRead = function(relPath) {
  return window.narrative.dbRead(relPath);
};
本地FS.dbReadJSON = function(relPath) {
  return window.narrative.dbRead(relPath).then(function(text) {
    return text ? JSON.parse(text) : null;
  });
};
本地FS.dbList = function(relPath) {
  return window.narrative.dbList(relPath);
};

本地FS.存在 = function(relPath) {
  return window.narrative.fileExists(relPath);
};

本地FS.重命名 = function(oldPath, newPath) {
  return window.narrative.fileRename(oldPath, newPath);
};

window.本地FS = 本地FS;
window.LocalFS = 本地FS;
// method-level backward compat
LocalFS.sanitize = 本地FS.清理;
LocalFS.saveText = 本地FS.保存文本;
LocalFS.readText = 本地FS.读取文本;
LocalFS.readBase64 = 本地FS.读取二进制;
LocalFS.saveJSON = 本地FS.保存JSON;
LocalFS.readJSON = 本地FS.读取JSON;
LocalFS.readJSONSync = 本地FS.读取JSON同步;
LocalFS['delete'] = 本地FS.删除;
LocalFS.list = 本地FS.列表;
LocalFS.exists = 本地FS.存在;
LocalFS.rename = 本地FS.重命名;
LocalFS.saveBinary = 本地FS.保存二进制;
