// 生活纪实 · 写作台（V3 水平时间线 + 左侧时段详情 + 右侧全高编辑器）

var ldw当前段索引 = 0;
var ldw时段集 = [];
var _ldwAutoSaveTimer = null;
var _ldwAiStudioOpen = false;
var _ldwKeystrokes = 0;
var _ldwKeystrokeLog = [];
var _ldwLastRecordTime = Date.now();
var _ldwStreakStoreKey = '';
var _ldwStreakData = { streak: 0, lastDate: '' };

// 判断某时段是否已写内容（有叙事细节 narrative 或有用户草稿 draft/_draft）
function ldwIsSegWritten(i) {
  var seg = ldw时段集 && ldw时段集[i];
  if (!seg) return false;
  return !!(seg.narrative || (seg._draft && String(seg._draft).trim()) || (seg.draft && String(seg.draft).trim()));
}
// 统计已写时段数（用于「x/y 段」计数）
function ldwCountWritten() {
  var n = 0;
  (ldw时段集 || []).forEach(function(seg, i) { if (ldwIsSegWritten(i)) n++; });
  return n;
}

function ldw渲染写作台(el) {
  var ch = lifeDoc当前角色;
  if (!ch) { el.innerHTML = '<div class="placeholder-text">请先选择一个角色</div>'; return; }

  _ldwStreakStoreKey = 'ldw_streak_' + ch.name;
  ldwLoadStreak();
  ldwLoadSegments();

  var type = lifeDoc写作台当前天类型;
  var typeKeys = lifeDoc天类型键.slice();
  // 预设日、活动段、活动日始终显示（作为选择器入口，改为下拉交互）
  typeKeys.push('_presets');
  typeKeys.push('_customSeg');
  typeKeys.push('_customDay');

  var tabsHtml = typeKeys.map(function(t) {
    var label = lifeDoc天类型标签[t] || t;
    var isSpecial = (t === '_presets' || t === '_customSeg' || t === '_customDay');
    var act = t === type ? ' act' : '';
    if (t === '_presets') label = '📁 预设日';
    return '<span class="ldw-tab' + act + (isSpecial ? ' ldw-tab-sel' : '') + '" data-type="' + t + '">' + label + '</span>';
  }).join('');

  // Segments timeline
  var segHtml = ldw时段集.map(function(seg, i) {
    var act = i === ldw当前段索引 ? ' act' : '';
    var done = ldwIsSegWritten(i) ? ' done' : '';
    var timeLabel = seg.timeRange ? seg.timeRange.split('-')[0] : (seg.timeLabel || '');
    var label = seg.timeLabel || '时段' + (i + 1);
    return '<div class="ldw-seg' + act + done + '" data-idx="' + i + '"><div class="ldw-bar"></div><div class="ldw-st">' + escHtml(timeLabel) + '</div><div class="ldw-sl">' + escHtml(label) + '</div></div>';
  }).join('');

  // Left panel segment list
  var listHtml = ldw时段集.map(function(seg, i) {
    var act = i === ldw当前段索引 ? ' act' : '';
    var done = ldwIsSegWritten(i) ? ' done' : '';
    var written = ldwIsSegWritten(i);
    var narrative = seg.narrative || '';
    var plays = seg.plays || '';
    var loc = seg.location || '';
    return '<div class="ldw-item' + act + done + '" data-idx="' + i + '">' +
      '<div class="ldw-ih"><span class="ldw-it">' + escHtml(seg.timeRange || '') + '</span><span class="ldw-is' + (written ? ' done' : '') + '">' + (written ? '✓' : '○') + '</span></div>' +
      '<div class="ldw-in">' + escHtml(seg.timeLabel || '时段' + (i + 1)) + '</div>' +
      '<div class="ldw-im">' +
        (loc ? '<span class="ldw-tag">' + escHtml(loc) + '</span>' : '') +
        (plays ? '<span class="ldw-tag ero">' + escHtml(plays) + '</span>' : '') +
      '</div>' +
      (narrative ? '<div class="ldw-ip">' + escHtml(narrative.slice(0, 50)) + (narrative.length > 50 ? '…' : '') + '</div>' : '') +
    '</div>';
  }).join('');

  // Current segment
  var curSeg = ldw时段集[ldw当前段索引] || {};

  el.innerHTML = [
    // Day type tabs
    '<div class="ldw-topbar">' + tabsHtml + '</div>',
    // Timeline
    '<div class="ldw-tl">' + segHtml + '<div class="ldw-tl-add" onclick="ldwAddSeg()">＋</div></div>',
    // Body
    '<div class="ldw-body">',
    // Left panel
    '<div class="ldw-left">',
    '  <div class="ldw-lh"><span class="ldw-lt">⏱ 时段 · ' + ldw时段集.length + '段</span><span class="ldw-lc" id="ldwSegCount">' + ldwCountWritten() + '/' + ldw时段集.length + '</span></div>',
    '  <div class="ldw-ll" id="ldwSegList">' + listHtml + '</div>',
    '  <div class="ldw-la" onclick="ldwAddSeg()">＋ 新增时段</div>',
    '</div>',
    // Right editor
    '<div class="ldw-right">',
    '  <div class="ldw-eh">',
    '    <div class="ldw-el"><span class="ldw-elb">当前</span><span class="ldw-elt">' + escHtml(curSeg.timeLabel || '') + '</span>',
    '      <span class="ldw-em">' + escHtml(curSeg.timeRange || '') + '</span>' +
        (curSeg.plays ? '<span class="ldw-eg">' + escHtml(curSeg.plays) + '</span>' : '') +
        (curSeg.location ? '<span class="ldw-eloc">' + escHtml(curSeg.location) + '</span>' : '') +
    '    </div>',
    '    <div class="ldw-ea">',
    '      <button class="ldw-btn prim" onclick="ldwSaveSeg()">💾 保存</button>',
    '      <button class="ldw-btn" onclick="openAiGenPanel(\'ldw_continue\')">✏ 续写</button>',
    '      <button class="ldw-btn" onclick="ldwRewrite()">🔄 改写</button>',
    '      <button class="ldw-btn" onclick="ldwToggleStudio()">🎨 工坊</button>',
    '      <button class="ldw-btn gen" onclick="ldwAiGenSeg()">🤖 生成</button>',
    '    </div>',
    '  </div>',
    '  <div id="ldwAiStudio" style="display:none" class="ldw-studio">',
    '    <div class="ldw-studio-inner">AI 工坊面板（方案/风格/方向选择）- 可在后续扩展</div>',
    '  </div>',
    '  <div id="ldwEditor" contenteditable="true" class="ldw-editor" data-placeholder="开始写作，记录这一天的故事…">' + (curSeg._draft ? formatForDisplay(curSeg._draft) : '') + '</div>',
    '  <div class="ldw-sb">',
    '    <div class="ldw-sbl"><span id="ldwWc">📝 0 字</span><span id="ldwKs">⌨ 0 键</span><span id="ldwSpeed">✍ 0 字/分</span></div>',
    '    <div class="ldw-sbr"><span id="ldwStreak" style="color:#d4889e">🔥 ' + _ldwStreakData.streak + '天</span><span id="ldwSaveStatus" style="color:#4ecca3">● 已保存</span></div>',
    '  </div>',
    '</div>',
    '</div>'
  ].join('\n');

  // Bind tab clicks
  el.querySelectorAll('.ldw-tab').forEach(function(t) {
    t.addEventListener('click', function() {
      var t2 = this.getAttribute('data-type');
      if (t2 === type) return;

      // 预设日/活动段/活动日：弹出选择器
      if (t2 === '_presets') { ldwShowTabPicker('preset', ch, el); return; }
      if (t2 === '_customSeg') { ldwShowTabPicker('customSeg', ch, el); return; }
      if (t2 === '_customDay') { ldwShowTabPicker('customDay', ch, el); return; }

      lifeDoc写作台当前天类型 = t2;
      ldw当前段索引 = 0;
      ldwLoadSegments();
      ldw渲染写作台(el);
    });
  });

  // Bind segment clicks (timeline + list)
  el.querySelectorAll('.ldw-seg[data-idx]').forEach(function(s) {
    s.addEventListener('click', function() { ldwSelectSeg(parseInt(this.getAttribute('data-idx')), el); });
  });
  el.querySelectorAll('.ldw-item[data-idx]').forEach(function(s) {
    s.addEventListener('click', function() { ldwSelectSeg(parseInt(this.getAttribute('data-idx')), el); });
  });

  // Editor events
  var ed = document.getElementById('ldwEditor');
  if (ed) {
    ed.addEventListener('input', function() {
      if (_ldwAutoSaveTimer) clearTimeout(_ldwAutoSaveTimer);
      ldwUpdateStatus();
      _ldwAutoSaveTimer = setTimeout(ldwSaveSeg, 500);
    });
    ed.addEventListener('keydown', function(e) {
      _ldwKeystrokes++;
      if (_ldwKeystrokes % 10 === 0) document.getElementById('ldwKs').textContent = '⌨ ' + _ldwKeystrokes + ' 键';
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); ldwSaveSeg(); }
    });
  }

  ldwUpdateStatus();
  ldwRenderStreak();
}

function ldwLoadSegments() {
  var ch = lifeDoc当前角色;
  var type = lifeDoc写作台当前天类型;
  ldw时段集 = [];
  if (!ch) return;
  if (type === '_customSeg' && ch.customActivitySegments) {
    ldw时段集 = ch.customActivitySegments;
    ldw时段集.forEach(function(s) { s._draft = s.draft || ''; });
    return;
  }
  if (type === '_customDay' && ch.customDayList && ch.customDayList[lifeDoc自定义日索引]) {
    ldw时段集 = ch.customDayList[lifeDoc自定义日索引].segments || [];
    ldw时段集.forEach(function(s) { s._draft = s.draft || ''; });
    return;
  }
  if (ch.dailyRoutine && ch.dailyRoutine[type]) {
    ldw时段集 = ch.dailyRoutine[type];
    ldw时段集.forEach(function(s) { s._draft = s.draft || ''; });
  }
}

function ldwSaveSeg() {
  var editor = document.getElementById('ldwEditor');
  if (!editor || !lifeDoc当前角色) return;
  var content = formatForStorage(editor.innerText);
  if (ldw时段集[ldw当前段索引]) {
    ldw时段集[ldw当前段索引]._draft = content;
    ldw时段集[ldw当前段索引].draft = content;
  }
  var ch = lifeDoc当前角色;
  var type = lifeDoc写作台当前天类型;
  if (type === '_customSeg' || type === '_customDay') {
    lifeDoc保存角色();
  } else if (ch.dailyRoutine && ch.dailyRoutine[type]) {
    lifeDoc保存日程(ch.name, type, ldw时段集);
  }
  var st = document.getElementById('ldwSaveStatus');
  if (st) st.textContent = '● 已保存';
  ldwRecordStreak();
}

function ldwSelectSeg(idx, elOverride) {
  ldwSaveSeg();
  ldw当前段索引 = idx;
  if (elOverride) ldw渲染写作台(elOverride);
  else {
    var el = document.getElementById('lifeDocViewContent');
    if (el) ldw渲染写作台(el);
  }
}

function ldwAddSeg() {
  var ch = lifeDoc角色库[lifeDoc规划角色索引];
  if (!ch || !ch.dailyRoutine) return;
  var type = lifeDoc写作台当前天类型;
  if (!ch.dailyRoutine[type]) ch.dailyRoutine[type] = [];
  ch.dailyRoutine[type].push({ timeLabel: '', timeRange: '', plays: '', narrative: '', location: '' });
  lifeDoc保存角色();
  ldwLoadSegments();
  var el = document.getElementById('lifeDocViewContent');
  if (el) ldw渲染写作台(el);
}

function ldwUpdateStatus() {
  var editor = document.getElementById('ldwEditor');
  if (!editor) return;
  var wc = wordCount(editor.innerText || '');
  var wcEl = document.getElementById('ldwWc');
  if (wcEl) wcEl.textContent = '📝 ' + wc + ' 字';
}

function ldwToggleStudio() {
  _ldwAiStudioOpen = !_ldwAiStudioOpen;
  var s = document.getElementById('ldwAiStudio');
  if (s) s.style.display = _ldwAiStudioOpen ? '' : 'none';
}

// 预设日/活动段/活动日选择器
function ldwShowTabPicker(type, ch, el) {
  var items = [];
  if (type === 'preset' && ch.dailyRoutine) {
    Object.keys(ch.dailyRoutine).forEach(function(k) {
      if (k.indexOf('preset_') === 0) {
        var pid = k.replace('preset_', '');
        var p = window.PRESET_DAYS ? PRESET_DAYS.find(function(x) { return x.id === pid; }) : null;
        items.push({ key: k, label: (p ? p.icon + ' ' + p.title : k) });
      }
    });
  } else if (type === 'customSeg' && ch.customActivitySegments) {
    ch.customActivitySegments.forEach(function(s, i) { items.push({ key: '_customSeg-' + i, label: s.timeLabel || '活动段' + (i + 1) }); });
  } else if (type === 'customDay' && ch.customDayList) {
    ch.customDayList.forEach(function(d, i) { items.push({ key: '_customDay-' + i, label: d.title || '活动日' + (i + 1) }); });
  }
  if (!items.length) { toast('暂无可用项目，请先在生活规划中创建'); return; }

  var old = document.getElementById('ldwTabPicker');
  if (old) old.remove();

  var picker = document.createElement('div');
  picker.id = 'ldwTabPicker';
  picker.style.cssText = 'position:fixed;z-index:100;background:var(--ldw-surface);border:1px solid var(--ldw-border);border-radius:6px;padding:4px;min-width:160px;box-shadow:0 8px 24px rgba(0,0,0,0.4)';
  items.forEach(function(item) {
    var btn = document.createElement('div');
    btn.style.cssText = 'padding:6px 10px;border-radius:4px;cursor:pointer;font-size:11px;color:var(--ldw-text)';
    btn.textContent = item.label;
    btn.onmouseover = function() { this.style.background = 'var(--ldw-surface2)'; };
    btn.onmouseout = function() { this.style.background = 'transparent'; };
    btn.onclick = function() {
      picker.remove();
      if (type === 'customSeg') { lifeDoc写作台当前天类型 = '_customSeg'; lifeDoc自定义日索引 = parseInt(item.key.split('-')[1]); }
      else if (type === 'customDay') { lifeDoc写作台当前天类型 = '_customDay'; lifeDoc自定义日索引 = parseInt(item.key.split('-')[1]); }
      else { lifeDoc写作台当前天类型 = item.key; }
      ldw当前段索引 = 0;
      ldwLoadSegments();
      ldw渲染写作台(el);
    };
    picker.appendChild(btn);
  });
  document.body.appendChild(picker);

  var tab = el.querySelector('[data-type="_' + type + 's"]') || el.querySelector('[data-type="_presets"]');
  if (tab) {
    var rect = tab.getBoundingClientRect();
    picker.style.left = Math.max(8, rect.left) + 'px';
    picker.style.top = (rect.bottom + 4) + 'px';
  }
  var closeHandler = function(e) {
    if (!picker.contains(e.target)) { picker.remove(); document.removeEventListener('mousedown', closeHandler); }
  };
  setTimeout(function() { document.addEventListener('mousedown', closeHandler); }, 10);
}

function ldwRewrite() {
  var ed = document.getElementById('ldwEditor');
  var sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && !sel.isCollapsed && ed && ed.contains(sel.anchorNode)) {
    window._ldwWriteSel = { text: sel.toString(), range: sel.getRangeAt(0).cloneRange() };
    openAiGenPanel('ldw_rewrite');
  } else toast('请先在正文中选中要处理的文字');
}

function ldwAiGenSeg() {
  var ch = lifeDoc当前角色;
  if (!ch) return;
  var seg = ldw时段集[ldw当前段索引];
  if (!seg) return;
  var fullCh = lifeDocFullCharData(ch);
  var charData = JSON.stringify(fullCh, null, 2);
  var info = '时段：' + (seg.timeLabel || '') + ' (' + (seg.timeRange || '') + ')\n玩法：' + (seg.plays || '无') + '\n地点：' + (seg.location || '') + '\n详情：' + (seg.narrative || '');
  var prompt = '角色数据：\n' + charData + '\n\n当前时段：\n' + info + '\n\n请根据以上内容，写出这个时段里发生的事情。要求：500字以上。直接输出正文，不要 JSON 包裹。';
  LLM.call({ prompt: prompt, system: '你是生活纪实作家。', label: 'AI生成:' + (seg.timeLabel || '') }).then(function(result) {
    if (result && result.trim()) { seg.narrative = result.trim(); lifeDoc保存角色(); }
    var ed = document.getElementById('ldwEditor');
    if (ed && result) ed.innerHTML = formatForDisplay(result);
    ldwSaveSeg();
    toast('✅ 已生成');
  }).catch(function() { toast('⚠️ 生成失败'); });
}
function ldwLoadStreak() {
  try {
    var d = JSON.parse(localStorage.getItem(_ldwStreakStoreKey) || '{}');
    _ldwStreakData = { streak: d.streak || 0, lastDate: d.lastDate || '' };
  } catch(e) { _ldwStreakData = { streak: 0, lastDate: '' }; }
}

function ldwRecordStreak() {
  var today = new Date().toISOString().slice(0, 10);
  if (_ldwStreakData.lastDate !== today) {
    _ldwStreakData.streak++;
    _ldwStreakData.lastDate = today;
    localStorage.setItem(_ldwStreakStoreKey, JSON.stringify(_ldwStreakData));
  }
}

function ldwRenderStreak() {
  var el = document.getElementById('ldwStreak');
  if (el) el.textContent = '🔥 ' + (_ldwStreakData.streak || 0) + '天';
}

// === Exports ===
window.ldw渲染写作台 = ldw渲染写作台;
window.ldw保存当前段 = ldwSaveSeg;
window.ldwToggleStudio = ldwToggleStudio;
window.ldwSelectSeg = ldwSelectSeg;
window.ldwAddSeg = ldwAddSeg;
window.ldwAiGenSeg = ldwAiGenSeg;
window.ldwRewrite = ldwRewrite;
