// 深度-叙事引擎 · 全局状态管理
var 状态 = {};
var 设置键 = 'ne_settings';

function 默认设置() {
  return {
    theme: 'dark',
    language: 'zh-CN',
    llmConfigs: [],
    defaultModel: null,
    debugMode: false,
    windowMode: 'windowed',
    windowWidth: 1400,
    windowHeight: 900,
    moduleModels: {},
    runninghubApiKey: '',
    runninghubDefaultT2i: 'seedream-v4',
    runninghubDefaultI2i: 'seedream-v4',
    runninghubDynamicT2i: [],
    runninghubDynamicI2i: [],
    dingEnabled: true,
    dingSound: 'ding',
    dingVolume: 1,
  };
}

function 加载设置() {
  try {
    var raw = localStorage.getItem(设置键);
    if (raw) {
      var parsed = JSON.parse(raw);
      var def = 默认设置();
      for (var k in def) { if (!(k in parsed)) parsed[k] = def[k]; }
      return parsed;
    }
  } catch(e) {
    console.warn('[State] localStorage 读取失败:', e);
  }
  // 尝试从磁盘备份恢复（完整设置备份）
  try {
    if (window.narrative && window.narrative.fileReadSync) {
      var bakRaw = window.narrative.fileReadSync('settings.json');
      if (bakRaw) {
        var bak = JSON.parse(bakRaw);
        var def = 默认设置();
        for (var k in def) { if (!(k in bak)) bak[k] = def[k]; }
        console.log('[State] 从磁盘备份恢复设置');
        return bak;
      }
    }
  } catch(e2) {
    console.warn('[State] 磁盘备份恢复失败:', e2);
  }
  // 尝试从磁盘备份恢复 llmConfigs（旧版备份）
  try {
    if (window.narrative && window.narrative.fileReadSync) {
      var bakRaw = window.narrative.fileReadSync('llm_configs.json');
      if (bakRaw) {
        var bak = JSON.parse(bakRaw);
        if (bak && bak.length) {
          var restored = 默认设置();
          restored.llmConfigs = bak;
          console.log('[State] 从磁盘备份恢复 llmConfigs');
          return restored;
        }
      }
    }
  } catch(e2) {
    console.warn('[State] 磁盘备份恢复失败:', e2);
  }
  return 默认设置();
}

function 保存设置(st) {
  localStorage.setItem(设置键, JSON.stringify(st));
  if (!本地FS) return;
  // 窗口尺寸由主进程独占写入（saveWindowConfig），这里合并保留而非覆盖
  var disk = {};
  for (var k in st) {
    if (k !== 'windowWidth' && k !== 'windowHeight') disk[k] = st[k];
  }
  本地FS.读取JSON('settings.json').then(function(existing) {
    if (existing && typeof existing === 'object') {
      if (existing.windowWidth !== undefined) disk.windowWidth = existing.windowWidth;
      if (existing.windowHeight !== undefined) disk.windowHeight = existing.windowHeight;
    }
    return 本地FS.保存JSON('settings.json', disk);
  }).catch(function() {
    return 本地FS.保存JSON('settings.json', disk);
  });
  if (st && st.llmConfigs) {
    本地FS.保存JSON('llm_configs.json', st.llmConfigs);
  }
}

function 初始化状态() {
  状态.settings = 加载设置();
  状态.currentPage = 'home';
  状态.currentModel = null;
  状态._sessionStart = new Date().toISOString();
  console.log('[State] 初始化完成');

  // 恢复调试控制台状态
  var debugConsole = document.getElementById('debugConsole');
  if (debugConsole && 状态.settings.debugMode) {
    debugConsole.style.display = 'flex';
  }
}

function 设置当前页面(page) {
  状态.currentPage = page;
}

window.状态 = 状态;
window.S = 状态;
window.初始化状态 = 初始化状态;
window.initState = 初始化状态;
window.保存设置 = 保存设置;
window.saveSettings = 保存设置;
window.设置当前页面 = 设置当前页面;
window.setCurrentPage = 设置当前页面;
