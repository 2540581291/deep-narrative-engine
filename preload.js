const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('narrative', {
  // File system operations
  fileSave: (relPath, content) => ipcRenderer.invoke('file-save', relPath, content),
  fileRead: (relPath) => ipcRenderer.invoke('file-read', relPath),
  fileReadBase64: (relPath) => ipcRenderer.invoke('file-read-base64', relPath),
  fileThumbnail: (relPath, size) => ipcRenderer.invoke('file-thumbnail', relPath, size),
  fileReadSync: (relPath) => ipcRenderer.sendSync('file-read-sync', relPath),
  fileDelete: (relPath) => ipcRenderer.invoke('file-delete', relPath),
  fileList: (relPath) => ipcRenderer.invoke('file-list', relPath),
  dbRead: (relPath) => ipcRenderer.invoke('db-read', relPath),
  dbList: (relPath) => ipcRenderer.invoke('db-list', relPath),
  fileExists: (relPath) => ipcRenderer.invoke('file-exists', relPath),
  fileRename: (oldPath, newPath) => ipcRenderer.invoke('file-rename', oldPath, newPath),
  fileSaveBinary: (relPath, base64Data) => ipcRenderer.invoke('file-save-binary', relPath, base64Data),
  fileOpenPath: (fullPath) => ipcRenderer.invoke('file-open-path', fullPath),
  // 剪贴板写入（主进程 Electron clipboard，渲染进程 navigator.clipboard 在 file:// 下可能被拒）
  clipboardWrite: (text) => ipcRenderer.invoke('clipboard-write', text),
  downloadAndSaveImage: (imageUrl, relPath) => ipcRenderer.invoke('download-and-save-image', imageUrl, relPath),
  // 网易云音乐 API（主进程代理，无 CORS 限制）
  neteaseSearch: (s, limit) => ipcRenderer.invoke('netease-search', s, limit),
  neteaseLyric: (id) => ipcRenderer.invoke('netease-lyric', id),
  // RunningHub 文档站抓取（主进程代理，无 CORS 限制）
  rhFetchDoc: (urlPath) => ipcRenderer.invoke('rh-fetch-doc', urlPath),
  // RunningHub 图片上传（multipart，主进程代理）
  rhUploadImage: (apiKey, base64Data, mimeType) => ipcRenderer.invoke('rh-upload-image', apiKey, base64Data, mimeType),
  // 视频参考片段拆分（主进程 ffmpeg）
  videoPickFile: () => ipcRenderer.invoke('video-pick-file'),
  videoProbe: (filePath) => ipcRenderer.invoke('video-probe', filePath),
  videoSplit: (filePath, outRelDir, segDurSec) => ipcRenderer.invoke('video-split', filePath, outRelDir, segDurSec),
  writeLog: (entry) => ipcRenderer.invoke('write-log', entry),
  setWindowMode: (mode) => ipcRenderer.invoke('set-window-mode', mode),
  setWindowSize: (w, h) => ipcRenderer.invoke('set-window-size', w, h),
  // Crash logging from renderer
  logCrash: (errInfo) => ipcRenderer.invoke('crash-log', errInfo),
  // TTS 引擎管理
  ttsEngineStart: (force) => ipcRenderer.invoke('tts-engine-start', force),
  ttsEngineStop: () => ipcRenderer.invoke('tts-engine-stop'),
  ttsEngineStatus: () => ipcRenderer.invoke('tts-engine-status'),
  ttsTranscribe: (base64Data, ext) => ipcRenderer.invoke('tts-transcribe', base64Data, ext),
  // 作品库层级树（自动扫描 renderer/业务容器 的 区块 → 顶层模块 → 子类型）
  getWorksTree: () => ipcRenderer.invoke('get-works-tree'),
});
