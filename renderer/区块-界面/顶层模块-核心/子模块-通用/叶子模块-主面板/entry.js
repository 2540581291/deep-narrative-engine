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

// ===== 角色卡 · 按「创建时间」倒序（新建在前）=====
// 为什么不能直接对 items 排序：角色卡的创建时间**不在**「<名> - 信息.json」里（那里 createdAt 是 null），
// 唯一来源是 角色卡/.index.json 的数值 createdAt（角色库/暂存/角色讨论用的是内存里的 e.createdAt，
// 生图词典角色选择器 picker.js 则是自己去读这份索引）。这里把这条口径做成一个共用件：
// 与「角色卡·角色库」完全一致——**新建的角色在最前**，而不是"最近改动过的在最前"。
// 用法：角色卡按创建倒序(Store.character.list())   也可以直接传已取到的数组
//   → 返回 Promise<排好序的新数组>；索引读不到时退化为原序（不抛错）
function 角色卡按创建倒序(itemsOrPromise) {
  var 表 = {};
  var 读索引 = (typeof LocalFS !== 'undefined' && LocalFS.readJSON)
    ? LocalFS.readJSON('角色卡/.index.json').then(function(idx) {
        if (idx && typeof idx === 'object') {
          Object.keys(idx).forEach(function(k) {
            var e = idx[k];
            if (!e || !e.createdAt) return;
            表[k] = e.createdAt;
            if (e.id) 表[e.id] = e.createdAt;   // 索引键与 id 通常就等于角色目录名，两个都存以防万一
          });
        }
      }).catch(function() {})
    : Promise.resolve();
  var 取数据 = Promise.resolve(itemsOrPromise).catch(function() { return []; });
  return Promise.all([读索引, 取数据]).then(function(r) {
    var items = r[1] || [];
    return items.slice().sort(function(a, b) {
      function 键(x) { return (x && (x._dirName || x.title || x.name)) || ''; }
      return (表[键(b)] || 0) - (表[键(a)] || 0);
    });
  });
}
window.角色卡按创建倒序 = 角色卡按创建倒序;

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

// ===== 全局「可输入下拉选择器」（组合框）=====
// window.组合框HTML(o) + window.attachCombo(id, opts) + window.openCombo(id)
//
// 为什么不用原生 <datalist>：Chromium 里点输入框不会展开（只有输入或点右侧小箭头才弹），
// 且每次按键都要重建整份候选，中文条目一多就明显卡顿。这里换成自绘下拉：
//   · 点击/聚焦输入框 → 立即展开全部候选；输入即过滤（多关键词空格分隔，命中片段高亮）
//   · ↑↓ 选择、Enter 确认、Esc 关闭、点击外部关闭；面板下方空间不足时自动向上展开
//   · 不锁死输入：候选之外的值照样能手输（零锁定）
//
// 组合框HTML({ id, value, placeholder, style, className }) → 输入框 + ▾ 指示的 HTML 片段
// attachCombo(id, { getOptions, emptyHint, onPick, maxShow })
//   getOptions() 每次展开时实时调用，返回 [{ value, label, meta }]（label 主文案，meta 右侧灰色小字）
var _comboReg = {};        // id → { input, opts }
var _comboActive = null;   // { id, input, panel, items, index, opts }

function _esc(s) {
  if (typeof escHtml === 'function') return escHtml(s);
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function 组合框HTML(o) {
  o = o || {};
  var extra = o.style ? String(o.style) : 'width:100%';
  return '<span style="position:relative;display:inline-flex;align-items:center;' + extra + '">'
    + '<input id="' + o.id + '" type="text" class="llm-input' + (o.className ? ' ' + o.className : '') + '" autocomplete="off" spellcheck="false"'
    + ' style="width:100%;padding-right:22px" value="' + _esc(o.value || '') + '" placeholder="' + _esc(o.placeholder || '') + '" />'
    + '<span style="position:absolute;right:7px;top:50%;transform:translateY(-50%);pointer-events:none;font-size:9px;color:var(--fg3);opacity:.75">▼</span>'
    + '</span>';
}

function _comboOptions(opts) {
  try {
    var list = (opts && typeof opts.getOptions === 'function') ? opts.getOptions() : [];
    return (list || []).filter(function(x) { return x && x.value !== undefined && x.value !== null && x.value !== ''; });
  } catch (e) { return []; }
}

// 空格分隔的多关键词 AND 匹配（value / label / meta 全字段参与）
function _comboFilter(all, q) {
  var tokens = String(q || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return all.slice();
  return all.filter(function(o) {
    var hay = ((o.value || '') + ' ' + (o.label || '') + ' ' + (o.meta || '')).toLowerCase();
    for (var i = 0; i < tokens.length; i++) if (hay.indexOf(tokens[i]) < 0) return false;
    return true;
  });
}

// 命中片段高亮（保持原大小写）
function _comboHl(text, q) {
  text = String(text == null ? '' : text);
  var tokens = String(q || '').trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return _esc(text);
  var lower = text.toLowerCase();
  var marks = [];
  tokens.forEach(function(tk) {
    var t = tk.toLowerCase(), from = 0, at;
    while ((at = lower.indexOf(t, from)) >= 0) { marks.push([at, at + t.length]); from = at + t.length; }
  });
  if (!marks.length) return _esc(text);
  marks.sort(function(a, b) { return a[0] - b[0]; });
  var merged = [], cur = marks[0];
  for (var i = 1; i < marks.length; i++) {
    if (marks[i][0] <= cur[1]) cur[1] = Math.max(cur[1], marks[i][1]);
    else { merged.push(cur); cur = marks[i]; }
  }
  merged.push(cur);
  var out = '', pos = 0;
  merged.forEach(function(m) {
    out += _esc(text.slice(pos, m[0])) + '<span style="color:var(--accent2);font-weight:700">' + _esc(text.slice(m[0], m[1])) + '</span>';
    pos = m[1];
  });
  return out + _esc(text.slice(pos));
}

// 选中/悬停行：跟随项目设计语言（浅色 accent 上不能用白字），用淡底 + accent2 左侧竖条
function _comboItemStyle(on) {
  return 'padding:5px 8px;border-radius:4px;cursor:pointer;display:flex;align-items:baseline;gap:8px;color:var(--fg);'
    + (on ? 'background:var(--accent-dim);box-shadow:inset 2px 0 0 var(--accent2);' : '');
}

function _comboPaint(state) {
  var rows = state.panel.querySelectorAll('[data-ci]');
  for (var i = 0; i < rows.length; i++) {
    var on = (i === state.index);
    rows[i].setAttribute('style', _comboItemStyle(on));
    var meta = rows[i].querySelector('[data-cmeta]');
    if (meta) meta.style.color = on ? 'var(--fg2)' : 'var(--fg3)';
  }
  // 只滚动面板内部，不用 scrollIntoView（避免连带滚动页面）
  var act = rows[state.index];
  if (act) {
    var top = act.offsetTop, bottom = top + act.offsetHeight;
    if (top < state.panel.scrollTop) state.panel.scrollTop = top;
    else if (bottom > state.panel.scrollTop + state.panel.clientHeight) state.panel.scrollTop = bottom - state.panel.clientHeight;
  }
}

function _comboRender(state) {
  var all = _comboOptions(state.opts);
  var q = state.query || '';
  var list = _comboFilter(all, q);
  var cap = state.opts.maxShow || 400;
  var shown = list.slice(0, cap);
  state.items = shown;
  if (state.index >= shown.length) state.index = shown.length ? 0 : -1;

  var h = '';
  if (!all.length) {
    h += '<div style="padding:8px;color:var(--fg3);font-size:11px;line-height:1.6">' + _esc(state.opts.emptyHint || '暂无可选项') + '</div>';
  } else {
    h += '<div style="padding:4px 8px 6px;color:var(--fg3);font-size:10px;border-bottom:1px solid var(--border);margin-bottom:4px">'
      + '共 ' + list.length + (list.length !== all.length ? ' / ' + all.length : '') + ' 个 · 输入可筛选' + (list.length > cap ? '（只显示前 ' + cap + ' 个）' : '') + '</div>';
    if (!shown.length) h += '<div style="padding:8px;color:var(--fg3);font-size:11px">没有匹配「' + _esc(q) + '」的模型，可直接手输</div>';
    shown.forEach(function(it, i) {
      h += '<div data-ci="' + i + '" style="' + _comboItemStyle(i === state.index) + '">'
        + '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _comboHl(it.label || it.value, q) + '</span>'
        + (it.meta ? '<span data-cmeta="1" style="font-family:monospace;font-size:10px;color:var(--fg3);flex-shrink:0">' + _esc(it.meta) + '</span>' : '')
        + '</div>';
    });
  }
  state.panel.innerHTML = h;
}

function _comboPosition(state) {
  var r = state.input.getBoundingClientRect();
  var w = Math.max(r.width, 260);
  var left = Math.min(r.left, Math.max(8, window.innerWidth - w - 8));
  var maxH = 300;
  var top = r.bottom + 4;
  var h = Math.min(state.panel.scrollHeight || 0, maxH);
  if (top + h > window.innerHeight - 8 && r.top - 4 - h > 8) top = r.top - 4 - h;
  state.panel.style.left = left + 'px';
  state.panel.style.top = top + 'px';
  state.panel.style.width = w + 'px';
}

function closeCombo() {
  if (!_comboActive) return;
  if (_comboActive.panel && _comboActive.panel.parentNode) _comboActive.panel.parentNode.removeChild(_comboActive.panel);
  _comboActive = null;
}

function openCombo(id, fromTyping) {
  var reg = _comboReg[id];
  var input = document.getElementById(id);
  // 面板重渲染后元素会被替换，这里以最新的 DOM 为准
  if (reg && input && reg.input !== input) { reg.input = input; }
  if (!reg || !input || !document.body.contains(input)) { closeCombo(); return; }
  if (!reg.panel) {
    reg.panel = document.createElement('div');
    reg.panel.setAttribute('data-combo-panel', id);
    reg.panel.style.cssText = 'position:fixed;z-index:9999;background:var(--card,#1e1e24);border:1px solid var(--border,#333);'
      + 'border-radius:6px;box-shadow:0 10px 28px rgba(0,0,0,.45);max-height:300px;overflow-y:auto;padding:4px;font-size:12px;color:var(--fg,#ddd);'
      // 面板自己滚到头/到底时不要把滚动传给页面（否则页面一动，面板就被「滚动即收起」关掉）
      + 'overscroll-behavior:contain';
    // mousedown + preventDefault：点选项时不夺走输入框焦点（否则 blur 会先关掉面板）
    reg.panel.addEventListener('mousedown', function(e) {
      e.preventDefault();
      // 在列表里按下（多半是想滚动/拖滚动条）：先把焦点还给输入框，
      // 这样 ↑↓ / Enter / Esc 这些键盘操作不会因为焦点跑掉而失效
      var pin = document.getElementById(id);
      if (pin && pin !== document.activeElement) { try { pin.focus({ preventScroll: true }); } catch (err) { pin.focus(); } }
      var row = e.target.closest ? e.target.closest('[data-ci]') : null;
      if (!row) return;
      var st = _comboActive;
      if (!st || st.id !== id) return;
      st.index = parseInt(row.getAttribute('data-ci'), 10) || 0;
      _comboPick();
    });
    reg.panel.addEventListener('mousemove', function(e) {
      var row = e.target.closest ? e.target.closest('[data-ci]') : null;
      if (!row || !_comboActive || _comboActive.id !== id) return;
      var i = parseInt(row.getAttribute('data-ci'), 10) || 0;
      if (i === _comboActive.index) return;
      _comboActive.index = i;
      _comboPaint(_comboActive);
    });
  }
  if (_comboActive && _comboActive.id !== id) closeCombo();
  // query：点击/聚焦展开 = 空（列出全部，避免被框里已有的值过滤掉）；输入展开 = 当前输入
  var state = { id: id, input: input, panel: reg.panel, items: [], index: 0, opts: reg.opts,
                query: fromTyping ? input.value : '', openedValue: input.value, typed: false };
  _comboActive = state;
  _comboRender(state);
  if (!reg.panel.parentNode) document.body.appendChild(reg.panel);
  // 每次展开都从顶部开始（上一轮可能滚到列表中间，位置不该带到新的一轮）
  reg.panel.scrollTop = 0;
  _comboPosition(state);
  // 点击展开时把当前值高亮（列表仍为全量，方便直接换一个）
  if (!fromTyping && state.items.length) {
    for (var ci = 0; ci < state.items.length; ci++) {
      if (String(state.items[ci].value) === String(input.value)) { state.index = ci; break; }
    }
  }
  _comboPaint(state);
}

function moveCombo(delta) {
  if (!_comboActive || !_comboActive.items.length) return;
  var n = _comboActive.items.length;
  _comboActive.index = (_comboActive.index + delta + n) % n;
  _comboPaint(_comboActive);
}

function _comboPick() {
  var st = _comboActive;
  if (!st || st.index < 0 || !st.items[st.index]) return false;
  var it = st.items[st.index];
  st.input.value = it.value;
  // 触发既有绑定（bindModelSelect / 表单读取都依赖 input/change）
  st.input.dispatchEvent(new Event('input', { bubbles: true }));
  st.input.dispatchEvent(new Event('change', { bubbles: true }));
  if (typeof st.opts.onPick === 'function') st.opts.onPick(it);
  closeCombo();
  return true;
}

function attachCombo(id, opts) {
  opts = opts || {};
  var input = document.getElementById(id);
  if (!input) return null;
  if (input.getAttribute('data-combo-ready') === '1') return _comboReg[id] || null;
  // 宿主重渲染：旧面板先收起，避免留下孤儿浮层
  if (_comboActive && _comboActive.id === id) closeCombo();
  input.setAttribute('data-combo-ready', '1');
  input.setAttribute('autocomplete', 'off');
  _comboReg[id] = { input: input, opts: opts, panel: null };

  input.addEventListener('focus', function() { openCombo(id, false); });
  input.addEventListener('click', function() { openCombo(id, false); });
  input.addEventListener('input', function() {
    // 已展开时只重绘面板（原地过滤）；未展开则展开
    if (_comboActive && _comboActive.id === id) {
      var st = _comboActive;
      var v = input.value;
      // 点击展开后第一次输入：若只是在旧值后面接着打，就只用新打的字筛选（否则旧值会把结果过滤空）
      if (!st.typed && st.openedValue && v.length > st.openedValue.length && v.indexOf(st.openedValue) === 0) {
        st.query = v.slice(st.openedValue.length);
      } else {
        st.query = v;
      }
      st.typed = true;
      st.index = 0;
      _comboRender(st); _comboPosition(st); _comboPaint(st);
    } else openCombo(id, true);
  });
  input.addEventListener('keydown', function(e) {
    var open = _comboActive && _comboActive.id === id;
    if (e.key === 'ArrowDown') { if (!open) openCombo(id, false); else moveCombo(1); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { if (!open) openCombo(id, false); else moveCombo(-1); e.preventDefault(); }
    else if (e.key === 'Enter') { if (open && _comboPick()) e.preventDefault(); }
    else if (e.key === 'Escape') { if (open) { closeCombo(); e.preventDefault(); } }
    else if (e.key === 'Tab') { closeCombo(); }
  });
  input.addEventListener('blur', function() { setTimeout(function() { if (_comboActive && _comboActive.id === id) closeCombo(); }, 130); });
  return _comboReg[id];
}

// 点击外部 / 滚动 / 改窗口大小 → 收起
document.addEventListener('mousedown', function(e) {
  if (!_comboActive) return;
  if (_comboActive.panel.contains(e.target) || _comboActive.input === e.target) return;
  closeCombo();
}, true);
// 窗口尺寸变化 → 面板跟着输入框重新定位。
// 注意：这里不能顺手收起面板 —— 面板用的是 fixed 定位，只要重新摆一次位置就能对齐；
// 而有些环境（打开/收起开发者工具、系统缩放）会自发 resize，一 resize 就收起会让用户
// 刚拉开的模型列表无故消失。真要不合适，下面的页面滚动会把面板收掉。
window.addEventListener('resize', function() {
  if (!_comboActive) return;
  _comboPosition(_comboActive);
});
// 页面滚动 → 收起（面板是 fixed 定位，页面一滚它就跟输入框脱位了）
// 但「滚动面板自己」不算：模型列表一次拉回几十上百条，用户必须能滚着挑。
// scroll 不冒泡，所以这里用捕获阶段，必须放行 target 落在面板内的那次滚动。
window.addEventListener('scroll', function(e) {
  if (!_comboActive) return;
  var t = e && e.target;
  if (t && t.nodeType === 1) {
    if (t === _comboActive.panel) return;
    if (_comboActive.panel && _comboActive.panel.contains(t)) return;
  }
  closeCombo();
}, true);

window.组合框HTML = 组合框HTML;
window.attachCombo = attachCombo;
window.openCombo = openCombo;
window.closeCombo = closeCombo;
