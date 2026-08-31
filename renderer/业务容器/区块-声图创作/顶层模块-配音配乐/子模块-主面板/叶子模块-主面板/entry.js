// 配音配乐 · 主面板（骨架 + 引擎状态栏 + 三 tab 导航）
// TTS 引擎：本地 VoiceStudio/OmniVoice（tts-engine/），端口 3900

var PY = window.PY || (window.PY = {
  baseUrl: 'http://127.0.0.1:3900',
  engineState: 'unknown',      // unknown / starting / ready / error / stopped
  engineTimer: null,
  currentTab: 'gen',           // gen / lib / history
  voices: [],                  // 音色列表缓存
  voicesLoaded: false,
  tmpRefFile: null,            // 临时参考音频 File 对象
  tmpRefBase64: null,          // 临时参考音频 base64
});

// ===== 界面状态持久化（保存/配音配乐状态.json，切页回来时还原） =====
PY.statePath = '配音配乐状态.json';
PY.uiState = {
  currentTab: 'gen',
  genText: '',
  genVoice: 'demo0001',
  genSpeed: '1.0',
  genDesignEnabled: false,
  genGender: '女',
  genAge: '少年',
  genPitch: '中音调',
  genStyle: '',
  genDialect: '',
  genTmpRefText: '',
};

function pypyLoadUIState() {
  try {
    if (typeof LocalFS !== 'undefined' && LocalFS.readJSONSync) {
      var st = LocalFS.readJSONSync(PY.statePath);
      if (st && typeof st === 'object') {
        if (st.currentTab) PY.currentTab = st.currentTab;
        for (var k in PY.uiState) {
          if (k in st && st[k] !== undefined && st[k] !== null) PY.uiState[k] = st[k];
        }
      }
    }
  } catch(e) {}
}

function pypySaveUIState() {
  try {
    if (typeof LocalFS !== 'undefined' && LocalFS.saveJSON) {
      LocalFS.saveJSON(PY.statePath, PY.uiState);
    }
  } catch(e) {}
}

// 把当前页面上的字段值收集进 uiState（切页前调用）
function pypyCollectUIState() {
  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
  }
  function checked(id) {
    var el = document.getElementById(id);
    return el ? el.checked : false;
  }
  PY.uiState.currentTab = PY.currentTab;
  PY.uiState.genText = val('pypy-gen-text');
  PY.uiState.genVoice = val('pypy-gen-voice');
  PY.uiState.genSpeed = val('pypy-gen-speed');
  PY.uiState.genDesignEnabled = checked('pypy-gen-design-enabled');
  PY.uiState.genGender = val('pypy-gen-gender');
  PY.uiState.genAge = val('pypy-gen-age');
  PY.uiState.genPitch = val('pypy-gen-pitch');
  PY.uiState.genStyle = val('pypy-gen-style');
  PY.uiState.genDialect = val('pypy-gen-dialect');
  PY.uiState.genTmpRefText = val('pypy-gen-tmpref-text');
  pypySaveUIState();
}

// 输入即保存：给元素挂 input/change 监听，收集并持久化
function pypyBindUIState(el) {
  if (!el) return;
  ['input', 'change'].forEach(function(evt) {
    el.addEventListener(evt, function() { pypyCollectUIState(); });
  });
}

// ===== 引擎状态 =====
// 引擎 status 取值：ready（已加载）/ loading（加载中）/ idle（待命，模型已就绪）
function pypyEngineReady(d) {
  if (!d || d.error) return false;
  if (d.loading || d.status === 'loading') return false;
  return d.status === 'ready'
    || d.sub_stage === 'ready'
    || (d.status === 'idle' && (d.progress >= 100 || d.detail === 'Model ready'));
}

function pypyCheckEngine() {
  fetch(PY.baseUrl + '/model/status', { method: 'GET' })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var old = PY.engineState;
      if (pypyEngineReady(d)) PY.engineState = 'ready';
      else if (d && (d.status === 'loading' || d.loading)) PY.engineState = 'starting';
      else PY.engineState = 'error';
      if (old !== PY.engineState) pypyRenderStatusBar();
      if (PY.engineState === 'ready' && !PY.voicesLoaded) pypyLoadVoices();
    })
    .catch(function() {
      if (PY.engineState !== 'stopped' && PY.engineState !== 'error') {
        PY.engineState = 'stopped';
        pypyRenderStatusBar();
        // 未运行 → 自动启动（默认行为）
        pypyAutoStartEngine();
      }
    });
}

// 自动启动：只在首次检测到未运行且未处于启动中时触发
function pypyAutoStartEngine() {
  if (PY._autoStartDone) return;
  PY._autoStartDone = true;
  pypyStartEngine(true);
}

function pypyStartEngine(silent) {
  var force = (arguments.length > 1) ? arguments[1] : false;
  window.narrative.ttsEngineStart(force).then(function(res) {
    if (res && res.ok) {
      PY.engineState = 'starting';
      pypyRenderStatusBar();
      if (!silent) toast(force ? '强制重启配音引擎…（模型加载需 30-60 秒）' : '配音引擎启动中…（模型加载需 30-60 秒）');
      if (PY.engineTimer) clearInterval(PY.engineTimer);
      PY.engineTimer = setInterval(function() {
        pypyCheckEngine();
        if (PY.engineState === 'ready') {
          clearInterval(PY.engineTimer);
          PY.engineTimer = null;
          pypyLoadVoices();
          if (!silent) toast('配音引擎已就绪');
        }
      }, 5000);
    } else {
      if (!silent) toast('引擎启动失败：' + (res && res.error ? res.error : '未知错误'));
    }
  });
}

// 状态栏「启动引擎」按钮：强制启动（清理残留进程后重新拉起）
function pypyForceStartEngine() {
  pypyStartEngine(false, true);
}

function pypyStopEngine() {
  window.narrative.ttsEngineStop().then(function() {
    PY.engineState = 'stopped';
    if (PY.engineTimer) { clearInterval(PY.engineTimer); PY.engineTimer = null; }
    pypyRenderStatusBar();
    toast('配音引擎已停止');
  });
}

function pypyStatusText() {
  var map = {
    unknown: '检测中…',
    starting: '引擎加载中…',
    ready: '就绪',
    stopped: '未运行',
    error: '异常',
  };
  return map[PY.engineState] || PY.engineState;
}

function pypyRenderStatusBar() {
  var el = document.getElementById('pypyStatusBar');
  if (!el) return;
  var ready = PY.engineState === 'ready';
  var color = ready ? '#7ec699' : (PY.engineState === 'starting' ? '#e0c068' : '#e06c75');
  var h = '';
  h += '<div style="display:flex;align-items:center;gap:10px;padding:6px 10px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;margin-bottom:10px;font-size:12px">';
  h += '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + color + '"></span>';
  h += '<span style="color:var(--text)">配音引擎：<b style="color:' + color + '">' + pypyStatusText() + '</b></span>';
  h += '<span style="color:var(--fg3)">' + PY.baseUrl + '</span>';
  h += '<span style="flex:1"></span>';
  if (!ready) {
    h += '<button class="btn-main" style="padding:3px 12px;font-size:12px" onclick="pypyForceStartEngine()" title="清理残留进程后强制重新启动">启动引擎</button>';
  } else {
    h += '<button class="btn-out" style="padding:3px 12px;font-size:12px" onclick="pypyStopEngine()">停止引擎</button>';
    h += '<button class="btn-out" style="padding:3px 12px;font-size:12px" onclick="pypyRefreshAll()">刷新音色</button>';
  }
  h += '</div>';
  el.innerHTML = h;
}

function pypyRefreshAll() {
  if (PY.engineState === 'ready') {
    pypyLoadVoices();
    if (typeof pypyRenderVoiceLib === 'function') pypyRenderVoiceLib();
    if (typeof pypyRenderHistory === 'function') pypyRenderHistory();
  }
}

// ===== 音色类别持久化（id → 类别，存 配音配乐音色类别.json） =====
PY.categoriesPath = '配音配乐音色类别.json';
PY.voiceCategories = {};          // { id: '类别' }
PY._voiceCatsLoaded = false;
PY.voiceCategoryPresets = ['角色卡', '明日方舟', '原神', '内置', '其他'];

function pypyLoadVoiceCategories() {
  if (PY._voiceCatsLoaded) return;
  PY._voiceCatsLoaded = true;
  try {
    if (typeof LocalFS !== 'undefined' && LocalFS.readJSONSync) {
      var st = LocalFS.readJSONSync(PY.categoriesPath);
      if (st && typeof st === 'object') PY.voiceCategories = st;
    }
  } catch(e) {}
}

function pypySaveVoiceCategories() {
  try {
    if (typeof LocalFS !== 'undefined' && LocalFS.saveJSON) {
      LocalFS.saveJSON(PY.categoriesPath, PY.voiceCategories);
    }
  } catch(e) {}
}

// 未归类时按名字智能分组：demo → 内置，游戏角色名 → 对应游戏
function pypyVoiceCategory(v) {
  pypyLoadVoiceCategories();
  var c = PY.voiceCategories[v.id];
  if (c) return c;
  var name = (v.name || '');
  if (v.is_demo || v.id === 'demo0001' || name.indexOf('Demo') >= 0) return '内置';
  if (name.indexOf('原神') >= 0) return '原神';
  if (name.indexOf('明日方舟') >= 0) return '明日方舟';
  return '其他';
}

function pypySetVoiceCategory(id, cat) {
  pypyLoadVoiceCategories();
  var c = (cat || '').trim();
  if (!c) delete PY.voiceCategories[id];
  else PY.voiceCategories[id] = c;
  pypySaveVoiceCategories();
  if (typeof pypyRenderVoiceLib === 'function') pypyRenderVoiceLib();
  if (typeof pypyRenderVoiceSelect === 'function') pypyRenderVoiceSelect();
}

// ===== 音色列表 =====
function pypyLoadVoices() {
  fetch(PY.baseUrl + '/profiles')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var items = Array.isArray(data) ? data : (data.profiles || data.items || []);
      PY.voices = items;
      PY.voicesLoaded = true;
      if (typeof pypyRenderVoiceSelect === 'function') pypyRenderVoiceSelect();
      if (typeof pypyRenderVoiceLib === 'function') pypyRenderVoiceLib();
      if (typeof pypyRenderVoiceTags === 'function') pypyRenderVoiceTags();
    })
    .catch(function() {});
}

function pypyVoiceDisplayName(v) {
  return (v.name || v.id || '未知音色') + (v.kind === 'design' ? '（设计）' : '');
}

// ===== Tab 切换 =====
var pypyApi = null;
function 渲染配音配乐(el) {
  if (!el) el = document.getElementById('pei-yin-pei-yueContent');
  if (!el) return;
  pypyLoadUIState();   // 切回来时还原上次状态
  var tabs = [
    { id: 'history', label: '📋 已生成列表' },
    { id: 'gen', label: '🎙 语音合成' },
    { id: 'create', label: '🎛 音色生成' },
    { id: 'lib', label: '🎤 音色库' },
  ];
  if (!pypyApi) {
    pypyApi = 渲染标签栏(el, tabs, { active: PY.currentTab, subId: 'pypyTabContent', onSwitch: function(t){ pypySwitchTab(t); } });
  } else {
    pypyApi.setActive(PY.currentTab);
  }
  pypySwitchTab(PY.currentTab);
  pypyCheckEngine();
  if (PY.engineState === 'ready') pypyLoadVoices();
  else if (PY.engineState === 'stopped' || PY.engineState === 'unknown') pypyAutoStartEngine();
}

function pypySwitchTab(tab, skipRender) {
  if (tab !== PY.currentTab) pypyCollectUIState();   // 离开当前 tab 前保存
  PY.currentTab = tab;
  PY.uiState.currentTab = tab;
  if (pypyApi) pypyApi.setActive(tab);
  var vEl = document.getElementById('pypyTabContent');
  if (!vEl) return;
  if (skipRender) return;
  vEl.innerHTML = '<div id="pypyStatusBar"></div><div id="pypyTabBody"></div>';
  pypyRenderStatusBar();
  var body = document.getElementById('pypyTabBody');
  if (tab === 'gen' && typeof pypyRenderGen === 'function') pypyRenderGen(body);
  else if (tab === 'create' && typeof pypyRenderCreatePage === 'function') pypyRenderCreatePage(body);
  else if (tab === 'lib' && typeof pypyRenderVoiceLibPage === 'function') pypyRenderVoiceLibPage(body);
  else if (tab === 'history' && typeof pypyRenderHistoryPage === 'function') pypyRenderHistoryPage(body);
}

// ===== 初始化 =====
registerPageRoute('pei-yin-pei-yue', function(e) {
  渲染配音配乐(e);
});

// 应用启动即默认启动配音引擎（后台预热，进入页面时往往已就绪）
(function() {
  try {
    if (window.narrative && window.narrative.ttsEngineStart) {
      // 先查一次引擎状态，未运行再启动
      fetch(PY.baseUrl + '/model/status', { method: 'GET' })
        .then(function(r) { return r.json(); })
        .then(function(d) {
          if (pypyEngineReady(d)) { PY.engineState = 'ready'; }
          else if (d && (d.status === 'loading' || d.loading)) { PY.engineState = 'starting'; }
          else if (typeof pypyAutoStartEngine === 'function') pypyAutoStartEngine();
        })
        .catch(function() {
          if (typeof pypyAutoStartEngine === 'function') pypyAutoStartEngine();
        });
    }
  } catch(e) {}
})();

window.渲染配音配乐 = 渲染配音配乐;
window.pypySwitchTab = pypySwitchTab;
window.pypyStartEngine = pypyStartEngine;
window.pypyForceStartEngine = pypyForceStartEngine;
window.pypyStopEngine = pypyStopEngine;
window.pypyRefreshAll = pypyRefreshAll;
window.pypyCollectUIState = pypyCollectUIState;
window.pypyBindUIState = pypyBindUIState;
window.pypyLoadVoiceCategories = pypyLoadVoiceCategories;
window.pypyVoiceCategory = pypyVoiceCategory;
window.pypySetVoiceCategory = pypySetVoiceCategory;
window.pypyVoiceCategoryPresets = PY.voiceCategoryPresets;
