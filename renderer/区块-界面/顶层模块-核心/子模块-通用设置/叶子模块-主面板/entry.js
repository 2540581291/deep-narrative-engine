// 深度-叙事引擎 · 通用设置（主题、默认模型、窗口模式、分辨率）

function renderGeneralSettings(el) {
  var theme = S.settings.theme || 'dark';
  var html = '<div class="settings-card">';
  html += '<div class="settings-card-title">🎨 外观</div>';
  html += '<div class="settings-card-desc">主题与界面表现。</div>';
  html += '<div class="settings-row"><span class="settings-label" style="margin:0;min-width:80px">主题</span>';
  html += '<select id="themeSelect" class="llm-input llm-select" style="flex:1;max-width:280px" onchange="changeTheme(this.value)">';
  html += '<option value="dark"' + (theme === 'dark' ? ' selected' : '') + '>🌙 暗色</option>';
  html += '<option value="light"' + (theme === 'light' ? ' selected' : '') + '>☀️ 亮色</option></select></div>';
  var configs = LLMService.getAll();
  if (configs.length > 0) {
    html += '<div class="settings-row"><span class="settings-label" style="margin:0;min-width:80px">默认模型</span>';
    html += '<select id="defaultModelSelect" class="llm-input llm-select" style="flex:1;max-width:280px" onchange="changeDefaultModel(this.value)">';
    html += '<option value="">无</option>';
    for (var i = 0; i < configs.length; i++) html += '<option value="' + configs[i].id + '"' + (S.settings.defaultModel === configs[i].id ? ' selected' : '') + '>' + escHtml(configs[i].name) + ' (' + configs[i].model + ')</option>';
    html += '</select></div>';
  }
  html += '</div>';
  // 完成提醒音
  html += '<div class="settings-card">';
  html += '<div class="settings-card-title">🔔 完成提醒音</div>';
  html += '<div class="settings-card-desc">长任务（小说提取分析等）完成时提醒你切回窗口。</div>';
  var dingOn = S.settings.dingEnabled !== false;
  var dingSound = S.settings.dingSound || 'ding';
  html += '<div class="settings-row"><label class="settings-switch"><input type="checkbox" id="dingEnabledToggle"' + (dingOn ? ' checked' : '') + ' onchange="changeDingEnabled(this.checked)"><span class="track"></span><span>长任务完成时播放提示音</span></label></div>';
  html += '<div class="settings-row"><span class="settings-label" style="margin:0;min-width:46px">音色</span>';
  html += '<select id="dingSoundSelect" class="llm-input llm-select" style="width:120px" onchange="changeDingSound(this.value)">';
  var 音色 = window._ding音色表 || { ding: { name: '叮' }, beep: { name: '哔' }, chime: { name: '钟' }, pop: { name: '啵' } };
  for (var k in 音色) {
    html += '<option value="' + k + '"' + (dingSound === k ? ' selected' : '') + '>' + (音色[k].name || k) + '</option>';
  }
  html += '</select><button class="btn-out" onclick="试听提示音(document.getElementById(\'dingSoundSelect\').value)">▶ 试听</button></div>';
  html += '<div class="settings-row"><span class="settings-label" style="margin:0;min-width:46px">音量</span>';
  html += '<div id="dingVolumeChips" style="display:flex;gap:6px;flex-wrap:wrap">';
  var dingVolume = S.settings.dingVolume !== undefined ? S.settings.dingVolume : 1;
  var 音量选项 = [0.5, 1, 2, 4];
  音量选项.forEach(function(v) {
    var active = dingVolume === v;
    html += '<span class="filter-chip' + (active ? ' act' : '') + '" onclick="changeDingVolume(' + v + ')" style="cursor:pointer">' + Math.round(v * 100) + '%</span>';
  });
  html += '</div></div>';
  html += '</div>';
  // 窗口模式
  html += '<div class="settings-card">';
  html += '<div class="settings-card-title">🖥️ 窗口模式</div>';
  html += '<div class="settings-card-desc">窗口化=标准窗口，无边框=隐藏标题栏，全屏=占满屏幕。</div>';
  var curMode = S.settings.windowMode || 'windowed';
  html += '<div class="filter-row" style="margin-bottom:0">';
  [['windowed','窗口化'],['borderless','无边框'],['fullscreen','全屏']].forEach(function(m) {
    var active = curMode === m[0];
    html += '<span class="filter-chip' + (active ? ' act' : '') + '" onclick="changeWindowMode(\'' + m[0] + '\')">' + m[1] + '</span>';
  });
  html += '</div>';
  html += '</div>';
  // 分辨率
  html += '<div class="settings-card">';
  html += '<div class="settings-card-title">📐 分辨率</div>';
  html += '<div class="settings-card-desc">设置后窗口会立即调整，重启后保持。</div>';
  var savedW = S.settings.windowWidth || 1400;
  var savedH = S.settings.windowHeight || 900;
  var presets = [
    { label: '1280×720', w: 1280, h: 720 },
    { label: '1366×768', w: 1366, h: 768 },
    { label: '1440×900', w: 1440, h: 900 },
    { label: '1536×864', w: 1536, h: 864 },
    { label: '1600×900', w: 1600, h: 900 },
    { label: '1920×1080', w: 1920, h: 1080 },
    { label: '2560×1440', w: 2560, h: 1440 },
    { label: '3840×2160', w: 3840, h: 2160 },
  ];
  html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">';
  presets.forEach(function(p) {
    var active = savedW === p.w && savedH === p.h;
    html += '<span class="filter-chip' + (active ? ' act' : '') + '" onclick="setResolutionPreset(' + p.w + ',' + p.h + ')" style="cursor:pointer">' + p.label + '</span>';
  });
  html += '</div>';
  html += '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">';
  html += '<input type="number" id="windowWidthInput" class="llm-input" style="width:86px" value="' + savedW + '" min="960" max="3840" placeholder="宽">';
  html += '<span class="c-fg2">×</span>';
  html += '<input type="number" id="windowHeightInput" class="llm-input" style="width:86px" value="' + savedH + '" min="600" max="2160" placeholder="高">';
  html += '<button class="btn-new" style="padding:6px 14px;font-size:11px" onclick="applyResolution()">立即应用</button>';
  html += '</div>';
  html += '</div>';
  // 重置 LLM 状态
  html += '<div class="settings-card">';
  html += '<div class="settings-card-title">🔄 LLM 状态维护</div>';
  html += '<div class="settings-card-desc">提示词堆积或模型输出混乱时，可重置 LLM 缓存状态以恢复。</div>';
  html += '<button class="btn-out" style="color:var(--accent);border-color:var(--accent)" onclick="resetLLMState()">🔄 重新刷新 API</button>';
  html += '</div>';
  el.innerHTML = html;
}

function changeWindowMode(mode) {
  S.settings.windowMode = mode;
  saveSettings(S.settings);
  if (window.narrative && window.narrative.setWindowMode) {
    window.narrative.setWindowMode(mode);
  }
  toast('窗口模式已切换');
}

function applyResolution() {
  applySize(document.getElementById('windowWidthInput').value, document.getElementById('windowHeightInput').value);
}

function setResolutionPreset(w, h) {
  document.getElementById('windowWidthInput').value = w;
  document.getElementById('windowHeightInput').value = h;
  applySize(w, h);
  // 刷新高亮
  var chips = document.querySelectorAll('#settingsTabContent .filter-chip');
  chips.forEach(function(chip) {
    chip.classList.toggle('act', chip.textContent.trim() === w + '×' + h);
  });
}

function applySize(w, h) {
  w = parseInt(w);
  h = parseInt(h);
  if (w < 960 || h < 600) { toast('最小分辨率 960×600'); return; }
  S.settings.windowWidth = w;
  S.settings.windowHeight = h;
  saveSettings(S.settings);
  if (window.narrative && window.narrative.setWindowSize) {
    window.narrative.setWindowSize(w, h);
  }
  toast('分辨率已调整');
}

function changeTheme(theme) {
  S.settings.theme = theme;
  saveSettings(S.settings);
  var root = document.documentElement;
  if (theme === 'light') {
    root.style.setProperty('--bg', '#f7f7f7');
    root.style.setProperty('--bg2', '#ffffff');
    root.style.setProperty('--card', '#ffffff');
    root.style.setProperty('--card-hover', '#eeeeee');
    root.style.setProperty('--fg', '#1a1a2e');
    root.style.setProperty('--fg2', '#666688');
    root.style.setProperty('--fg3', '#9999aa');
    root.style.setProperty('--border', '#dddde0');
    root.style.setProperty('--accent', '#c8b8d8');
    root.style.setProperty('--accent2', '#d490a8');
    root.style.setProperty('--accent-dim', 'rgba(200,184,216,0.12)');
  } else {
    root.style.setProperty('--bg', '#0f0f1a');
    root.style.setProperty('--bg2', '#161625');
    root.style.setProperty('--card', '#1c1c2e');
    root.style.setProperty('--card-hover', '#222238');
    root.style.setProperty('--fg', '#ececf5');
    root.style.setProperty('--fg2', '#8888aa');
    root.style.setProperty('--fg3', '#555577');
    root.style.setProperty('--border', 'rgba(212,196,240,0.08)');
    root.style.setProperty('--accent', '#d4c4f0');
    root.style.setProperty('--accent2', '#e8a0b4');
    root.style.setProperty('--accent-dim', 'rgba(212,196,240,0.12)');
  }
}

function changeDefaultModel(id) {
  S.settings.defaultModel = id;
  if (id) { var configs = LLMService.getAll(); for (var i = 0; i < configs.length; i++) { if (configs[i].id === id) { S.currentModel = configs[i].model; break; } } }
  else { S.currentModel = null; }
  saveSettings(S.settings);
  toast('默认模型已更新');
}

function changeDingEnabled(on) {
  S.settings.dingEnabled = !!on;
  saveSettings(S.settings);
  toast(on ? '完成提醒音已开启' : '完成提醒音已关闭');
}

function changeDingSound(sound) {
  S.settings.dingSound = sound;
  saveSettings(S.settings);
  toast('已切换音色');
}

function changeDingVolume(v) {
  var vol = Math.min(4, Math.max(0.5, Number(v) || 1));
  S.settings.dingVolume = vol;
  saveSettings(S.settings);
  // 刷新音量选项高亮（只作用于音量 chips 容器内）
  var box = document.getElementById('dingVolumeChips');
  if (box) {
    var chips = box.querySelectorAll('.filter-chip');
    chips.forEach(function(chip) {
      chip.classList.toggle('act', chip.textContent.trim() === Math.round(vol * 100) + '%');
    });
  }
}

// 暴露到全局
window.renderGeneralSettings = renderGeneralSettings;
window.changeTheme = changeTheme;
window.changeDefaultModel = changeDefaultModel;
window.changeDingEnabled = changeDingEnabled;
window.changeDingSound = changeDingSound;
window.changeDingVolume = changeDingVolume;
window.changeWindowMode = changeWindowMode;
window.applyResolution = applyResolution;
window.setResolutionPreset = setResolutionPreset;
