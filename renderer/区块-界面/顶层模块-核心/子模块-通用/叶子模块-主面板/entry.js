// 深度-叙事引擎 · 公共 UI 组件
var toastContainer = null;

function toast(msg) {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  var item = document.createElement('div');
  item.className = 'toast-item';
  item.textContent = msg;
  toastContainer.appendChild(item);
  setTimeout(function() {
    if (item.parentNode) item.remove();
  }, 3000);
}

// ===== 完成提示音：动作完成时播放提示音（Web Audio 合成，无需音频文件） =====
// 音色表：{ 音色名: { name: 显示名, parts: [ [频率,峰值音量,衰减时长,波形,延迟起音(秒,可省略)], ... ] } }
// 4 种差异明显的音色：叮（清脆铃音）/ 门铃（两声叮咚）/ 哔（方波电子音）/ 号角（三连音上行）
var _ding音色表 = {
  'ding':     { name: '叮',     parts: [[880, 0.22, 0.5, 'sine'], [1760, 0.07, 0.35, 'sine']] },
  'dingdong': { name: '门铃',   parts: [[880, 0.22, 0.5, 'sine', 0], [1174, 0.18, 0.6, 'sine', 0.28]] },
  'beep':     { name: '哔',     parts: [[660, 0.18, 0.3, 'square'], [990, 0.08, 0.18, 'square', 0.3]] },
  'fanfare':  { name: '号角',   parts: [[523, 0.2, 0.22, 'sawtooth', 0], [659, 0.2, 0.22, 'sawtooth', 0.22], [784, 0.2, 0.22, 'sawtooth', 0.44], [1046, 0.28, 0.5, 'sawtooth', 0.66]] },
};
var _dingCtx = null;
var _dingLastPlay = 0;
// 预热：在用户手势窗口内创建并恢复 AudioContext，避免被 autoplay 策略挂起
function 预热提示音() {
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!_dingCtx) _dingCtx = new AC();
    if (_dingCtx.state === 'suspended') {
      _dingCtx.resume().catch(function() {});
    }
  } catch(e) {}
}
// 播放指定音色（或设置中保存的音色）
function playDing(soundName) {
  try {
    var now = Date.now();
    if (now - _dingLastPlay < 600) return;
    // 读取开关设置（默认开）
    var st = window.S && window.S.settings ? window.S.settings : null;
    if (st && st.dingEnabled === false) return;
    var sound = soundName || (st ? st.dingSound : null) || 'ding';
    var preset = _ding音色表[sound] || _ding音色表['ding'];
    // 音量倍率（0.5/1/2/4，默认 1），通过主增益节点应用
    var volume = st && st.dingVolume !== undefined ? st.dingVolume : 1;
    volume = Math.min(4, Math.max(0.5, Number(volume) || 1));
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!_dingCtx) _dingCtx = new AC();
    // resume 在无用户手势时可能返回 rejected Promise，但振荡器仍可播放；用 .catch 吞掉避免中断
    if (_dingCtx.state === 'suspended') {
      _dingCtx.resume().catch(function() {});
    }
    var t = _dingCtx.currentTime;
    // 主增益节点：应用音量倍率（各 part 峰值保持相对音量，避免单个 part 增益过高削波）
    var masterGain = _dingCtx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(_dingCtx.destination);
    preset.parts.forEach(function(part) {
      var osc = _dingCtx.createOscillator();
      var gain = _dingCtx.createGain();
      var startAt = t + (part[4] || 0); // 第 5 个元素：延迟起音秒数（门铃/号角等多声效果）
      osc.type = part[3] || 'sine';
      osc.frequency.value = part[0];
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(part[1], startAt + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + part[2]);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(startAt);
      osc.stop(startAt + part[2] + 0.05);
    });
    _dingLastPlay = now;
  } catch(e) { /* 音频不可用时静默 */ }
}
// 试听：无视防连响，强制播放指定音色（设置页试听按钮用）
function 试听提示音(soundName) {
  _dingLastPlay = 0;
  playDing(soundName);
}

function showModal(title, content, opts) {
  opts = opts || {};
  var ov = document.createElement('div');
  ov.className = 'ovl' + (opts.ovlClass ? ' ' + opts.ovlClass : '');
  var card = '<div class="' + (opts.cardClass || 'mcard') + '">';
  if (opts.noWrap) {
    // 无包裹层：content 直接作为卡片子元素（阅读弹窗的 head/body/foot flex 结构）
    card += content;
  } else {
    card += '<h2 class="mb-12 fs-1em" style="flex-shrink:0">' + title + '</h2>';
    card += '<div style="font-size:0.85em;line-height:1.6;margin-bottom:12px;overflow-y:auto;flex:1;min-height:0">' + content + '</div>';
    card += '<button class="btn-main" style="flex-shrink:0" onclick="this.closest(\'.ovl\').remove()">关闭</button>';
  }
  card += '</div>';
  ov.innerHTML = card;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
}

function confirmDialog(msg, onConfirm) {
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = '<div class="mcard"><div style="font-size:0.85em;margin-bottom:16px">' + msg + '</div><div style="text-align:right;display:flex;gap:8px;justify-content:flex-end"><button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button><button class="btn-main" id="confirmBtn">确认</button></div></div>';
  document.body.appendChild(ov);
  document.getElementById('confirmBtn').onclick = function() {
    ov.remove();
    if (onConfirm) onConfirm();
  };
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  // 回车确认
  ov.addEventListener('keydown', function(e) { if (e.key === 'Enter') { document.getElementById('confirmBtn').click(); } });
  setTimeout(function() { var btn = document.getElementById('confirmBtn'); if (btn) btn.focus(); }, 50);
}

if (typeof uuid === 'undefined') {
  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

window.toast = toast;
window.confirmDialog = confirmDialog;
window.playDing = playDing;
window.预热提示音 = 预热提示音;
window.试听提示音 = 试听提示音;
window._ding音色表 = _ding音色表;

// ===== 复制到剪贴板（全局）：主进程 Electron clipboard → navigator.clipboard → execCommand 三级回退 =====
// 返回 Promise<boolean>；Electron 渲染进程的 navigator.clipboard 在 file:// 下常被拒（提示「复制失败」），
// 优先走主进程 IPC（preload 的 narrative.clipboardWrite），最稳。
function 复制到剪贴板(text) {
  var content = String(text == null ? '' : text);
  if (!content) return Promise.resolve(false);
  // 1) 主进程 clipboard（Electron 最可靠）
  if (window.narrative && typeof window.narrative.clipboardWrite === 'function') {
    return window.narrative.clipboardWrite(content).then(function(res) {
      if (res && res.ok) return true;
      // 2) navigator.clipboard
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        return navigator.clipboard.writeText(content).then(function() { return true; }, function() { return false; });
      }
      // 3) execCommand 兜底
      return 复制兜底execCommand(content);
    }).catch(function() {
      return 复制兜底execCommand(content);
    });
  }
  // 无主进程通道：navigator.clipboard → execCommand
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    return navigator.clipboard.writeText(content).then(function() { return true; }, function() { return 复制兜底execCommand(content); });
  }
  return Promise.resolve(复制兜底execCommand(content));
}

function 复制兜底execCommand(text) {
  try {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    var ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch(e) { return false; }
}

window.复制到剪贴板 = 复制到剪贴板;
window.copyText = 复制到剪贴板;

// ===== 全局标签组件 · 分段芯片标签栏（window.渲染标签栏）=====
// 用法：var api = 渲染标签栏(宿主el, [{id,label}], { active, subId, onSwitch });
// 返回 { bar, sub, setActive }。label 内嵌 emoji（与项目内容一致）；onSwitch(id) 点击标签时回调（模块在其中做视图分发）。
// 说明：玻璃…（无）芯片由组件管理，切标签只更新激活态、不重建整条，平滑过渡无闪动。
function 渲染标签栏(mount, items, opts) {
  opts = opts || {};
  mount.innerHTML = '';
  var bar = document.createElement('div'); bar.className = 'tl-bar';
  var sub = document.createElement('div'); sub.className = 'tl-sub'; if (opts.subId) sub.id = opts.subId;
  var onChange = (typeof opts.onSwitch === 'function') ? opts.onSwitch : function() {};
  var chipEls = [];
  function setActive(id) {
    chipEls.forEach(function(d) {
      d.classList.toggle('act', String(d.getAttribute('data-id')) === String(id));
    });
  }
  items.forEach(function(it, i) {
    var d = document.createElement('div');
    d.className = 'tl-tab'; d.setAttribute('data-id', it.id);
    d.innerHTML = (typeof escHtml === 'function') ? escHtml(it.label) : it.label;
    bar.appendChild(d); chipEls.push(d);
    d.addEventListener('click', function(e) {
      // 点击涟漪
      var r = document.createElement('span'); r.className = 'tl-rip';
      var rect = d.getBoundingClientRect(); var s = Math.max(rect.width, rect.height) * 1.1;
      r.style.left = ((e.clientX - rect.left) - s / 2) + 'px';
      r.style.top = ((e.clientY - rect.top) - s / 2) + 'px';
      r.style.width = r.style.height = s + 'px';
      d.appendChild(r); setTimeout(function(){ r.remove(); }, 600);
      setActive(it.id);
      onChange(it.id);
    });
  });
  mount.appendChild(bar); mount.appendChild(sub);
  var header = document.createElement('div'); header.className = 'tl-header'; header.style.display = 'none';
  mount.insertBefore(header, bar);
  function setHeader(html) { header.innerHTML = html || ''; header.style.display = html ? '' : 'none'; }
  if (opts.header) setHeader(opts.header);
  if (opts.active !== undefined) setActive(opts.active);
  else if (items.length) setActive(items[0].id);
  return { bar: bar, sub: sub, setActive: setActive, setHeader: setHeader };
}
window.渲染标签栏 = 渲染标签栏;

// ===== 全局「新建」按钮（统一叫「新建」，风格贴近芯片）=====
// 用法：新建按钮('打开调用()')  或  新建按钮('fn()', 'margin-left:8px')
function 新建按钮(onclick, extraStyle) {
  return '<button class="btn-new" onclick="' + onclick + '"' + (extraStyle ? ' style="' + extraStyle + '"' : '') + '>＋ 新建</button>';
}
window.新建按钮 = 新建按钮;

// ===== 全局「导入角色」按钮（与「新建」统一但作区分 · 细描边软底）=====
// 用法：导入按钮('fn()')  或  导入按钮('fn()', 'margin-left:8px')
function 导入按钮(onclick, extraStyle) {
  return '<button class="btn-import" onclick="' + onclick + '"' + (extraStyle ? ' style="' + extraStyle + '"' : '') + '>📥 导入角色</button>';
}
window.导入按钮 = 导入按钮;

// ===== 全局筛选行（统一现代化筛选芯片）=====
// 用法：var html = 筛选行('题材', ['全部','校园','修仙'], 当前选中值, '小说筛选', 'genre');
//   label   可选，传空/null 则不显示维度标签
//   options 选项字符串数组（首项通常是「全部」）
//   active  当前激活的选项值（与此值相等的 chip 加 .act）
//   onClick 点击回调的函数名字符串
//   field   可选。若回调是 (field, val) 两参形式（如共享工厂的 筛选(field,val)），
//           传 field 则生成 onclick="函数名('field','val')"；不传则生成 onclick="函数名('val')"。
// 返回一段 <div class="filter-row">…</div>，样式由 .filter-chip/.filter-label 提供。
function 筛选行(label, options, active, onClick, field) {
  var h = '<div class="filter-row">';
  if (label) h += '<span class="filter-label">' + escHtml(label) + '</span>';
  (options || []).forEach(function(opt) {
    var on = String(opt) === String(active);
    var onclk;
    if (field !== undefined && field !== null) {
      onclk = onClick + '(\'' + field + '\',\'' + String(opt).replace(/'/g, "\\'") + '\')';
    } else {
      onclk = onClick + '(\'' + String(opt).replace(/'/g, "\\'") + '\')';
    }
    h += '<span class="filter-chip' + (on ? ' act' : '') + '" onclick="' + onclk + '">' + escHtml(opt) + '</span>';
  });
  h += '</div>';
  return h;
}
window.筛选行 = 筛选行;
