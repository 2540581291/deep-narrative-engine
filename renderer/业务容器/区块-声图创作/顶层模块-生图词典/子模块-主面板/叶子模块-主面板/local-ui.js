// 生图词典 · 本地提示词 渲染层（本地 tab UI / 时间线面板 / 生成动作 / 深化入口）
// 依赖：entry.js（STCD/stcdModeChips/stcdResultHTML/stcdGen）、local-data.js（选项定义/状态/算法）、picker.js（角色选择器）

function stcdRenderLocal(el) {
  stcdLocalInitState();
  var h = '';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start">';
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px">';
  h += '<div style="font-size:14px;color:var(--fg);font-weight:700;margin-bottom:4px">✍️ 本地创作</div>';
  h += '<div style="font-size:11px;color:var(--fg3);margin-bottom:8px">本地工具无审查，描述直白自由，想说什么就说什么</div>';

  // 👤 角色（导入角色卡作为生成上下文）
  h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">';
  h += '<span style="font-size:12px;color:var(--fg2);font-weight:600">👤 角色</span>';
  h += '<span id="stcd-local-card-name" style="font-size:11px;color:var(--fg3)">未导入</span>';
  h += '<div style="flex:1"></div>';
  h += '<button class="btn-out" style="padding:2px 8px;font-size:10px" onclick="stcdOpenCharPicker(\'stcd-local-card\',{card:1})">📂 从角色卡导入</button>';
  h += '<button class="btn-out" style="padding:2px 8px;font-size:10px" onclick="stcdLocalClearCard()">✕ 移除</button>';
  h += '</div>';

  // 唯一输入框（创作要求）
  h += '<div style="font-size:11px;color:var(--fg2);margin:6px 0 4px">✍️ 创作要求</div>';
  h += '<textarea id="stcd-local-require" class="llm-input" style="width:100%;min-height:110px;resize:vertical" placeholder="例：一个穿红裙的少女，露出大腿，躺在丝绸床单上" oninput="STCD.localRequire=this.value"></textarea>';

  // 字段选择：服装组 + 事件组（各单选；选中后按标签说明进入输入提示词，并在提示词开头注明性别）
  h += '<div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin:10px 0 4px">';
  h += '<span style="font-size:10px;color:var(--fg2)">👕 服装</span>';
  STCD_LOCAL_CHAR_OPTS.forEach(function(k) {
    var act = STCD.localCharOpt === k;
    h += '<span class="preset-chip' + (act ? ' preset-active' : '') + '" data-lopt="' + k + '" style="cursor:pointer" title="' + escHtml(STCD_LOCAL_OPT_DESCS[k]) + '" onclick="stcdLocalOpt(\'' + k + '\')">' + STCD_LOCAL_OPT_LABELS[k] + '</span>';
  });
  h += '</div>';
  h += '<div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin-bottom:4px">';
  h += '<span style="font-size:10px;color:var(--fg2)">🦴 形态</span>';
  STCD_LOCAL_FORM_OPTS.forEach(function(k) {
    var act = STCD.localFormOpt === k;
    h += '<span class="preset-chip' + (act ? ' preset-active' : '') + '" data-lopt="' + k + '" style="cursor:pointer" title="' + escHtml(STCD_LOCAL_OPT_DESCS[k]) + '" onclick="stcdLocalOpt(\'' + k + '\')">' + STCD_LOCAL_OPT_LABELS[k] + '</span>';
  });
  h += '</div>';
  h += '<div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin-bottom:4px">';
  h += '<span style="font-size:10px;color:var(--fg2)">🎭 造型</span>';
  STCD_LOCAL_STYLE_OPTS.forEach(function(k) {
    var act = STCD.localStyleOpt === k;
    h += '<span class="preset-chip' + (act ? ' preset-active' : '') + '" data-lopt="' + k + '" style="cursor:pointer" title="' + escHtml(STCD_LOCAL_OPT_DESCS[k]) + '" onclick="stcdLocalOpt(\'' + k + '\')">' + STCD_LOCAL_OPT_LABELS[k] + '</span>';
  });
  h += '</div>';
  h += '<div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin-bottom:4px">';
  h += '<span style="font-size:10px;color:var(--fg2)">⚡ 事件</span>';
  ['eventNormal', 'eventErotic', 'eventFallen', 'eventTraining'].forEach(function(k) {
    var act = STCD.localEventOpt === k;
    h += '<span class="preset-chip' + (act ? ' preset-active' : '') + '" data-lopt="' + k + '" style="cursor:pointer" title="' + escHtml(STCD_LOCAL_OPT_DESCS[k]) + '" onclick="stcdLocalOpt(\'' + k + '\')">' + STCD_LOCAL_OPT_LABELS[k] + '</span>';
  });
  h += '</div>';
  h += '<div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin-bottom:6px">';
  h += '<span style="font-size:10px;color:var(--fg2)">🌀 混沌事件</span>';
  ['eventKhorne', 'eventSlaanesh', 'eventNurgle', 'eventTzeentch'].forEach(function(k) {
    var act = STCD.localEventOpt === k;
    h += '<span class="preset-chip' + (act ? ' preset-active' : '') + '" data-lopt="' + k + '" style="cursor:pointer" title="' + escHtml(STCD_LOCAL_OPT_DESCS[k]) + '" onclick="stcdLocalOpt(\'' + k + '\')">' + STCD_LOCAL_OPT_LABELS[k] + '</span>';
  });
  h += '<span style="font-size:10px;color:var(--fg3)">服装、形态、造型、事件只能四选一，作为字段选择进入输入提示词；AI 每段开头注明性别</span>';
  h += '</div>';

  // 服装/事件时间线面板（常驻显示：选定类别后在此生成/追加/勾选方案）
  h += '<div id="stcd-local-timelines"></div>';

  h += stcdModeChips();
  h += '<div style="display:flex;gap:8px;margin-top:12px">';
  h += '<button class="btn-main" onclick="stcdGen(\'local\')">🤖 生成提示词</button>';
  h += '<button class="btn-out" onclick="stcdLocalClear()">清空</button>';
  h += '</div>';
  h += '</div>';
  h += '<div>' + stcdResultHTML('stcd-local') + '</div>';
  h += '</div>';
  el.innerHTML = h;
  stcdLocalSyncTextareas();
  stcdLocalSyncOpts();
  stcdLocalSyncCardName();
  stcdLocalSyncTimelines();
}

// ===== 提取选项 · 内联时间线面板（常驻显示在本地创作页，走二元模板：AI 生成弹窗 → 模板 → LLM → 回填）=====
// 刷新时间线面板区（选项切换/生成/选用后调用）；四组互斥，只显示当前选中类别的那一块
function stcdLocalSyncTimelines() {
  var el = document.getElementById('stcd-local-timelines');
  if (!el) return;
  var h = '';
  if (STCD.localCharOpt) {
    h += stcdLocalSuggestPanelHTML('服装', 'char');
  } else if (STCD.localFormOpt) {
    h += stcdLocalSuggestPanelHTML('形态', 'form');
  } else if (STCD.localStyleOpt) {
    h += stcdLocalSuggestPanelHTML('造型', 'style');
  } else if (STCD.localEventOpt) {
    h += stcdLocalSuggestPanelHTML('事件', 'event');
  } else {
    h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:8px;margin:8px 0">';
    h += '<div style="font-size:11px;color:var(--fg);font-weight:600">📋 时间线方案</div>';
    h += '<div style="font-size:10px;color:var(--fg3);padding:4px 0">请先在上方选择一类（服装/形态/造型/事件，四选一），即可在此生成该类别的时间线方案</div>';
    h += '</div>';
  }
  el.innerHTML = h;
}

// 单个字段的时间线面板（fieldPrefix: 'char' 服装 / 'form' 形态 / 'style' 造型 / 'event' 事件）
function stcdLocalSuggestPanelHTML(fieldLabel, fieldPrefix) {
  var key = (fieldPrefix === 'char') ? STCD.localCharOpt : (fieldPrefix === 'form' ? STCD.localFormOpt : (fieldPrefix === 'style' ? STCD.localStyleOpt : STCD.localEventOpt));
  var usable = !!(key && key.indexOf('Extract') < 0);
  var h = '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:8px;margin:8px 0">';
  if (!usable) {
    // 未选类别 / 选了提取类：固定占位 + 引导（四组跨组互斥）
    var otherKey = (fieldPrefix === 'char') ? (STCD.localFormOpt || STCD.localEventOpt || STCD.localStyleOpt) : (fieldPrefix === 'form' ? (STCD.localCharOpt || STCD.localEventOpt || STCD.localStyleOpt) : (fieldPrefix === 'style' ? (STCD.localCharOpt || STCD.localFormOpt || STCD.localEventOpt) : (STCD.localCharOpt || STCD.localFormOpt || STCD.localStyleOpt)));
    var hint;
    if (key) {
      hint = '该选项为「提取类」，直接原文提取，无需时间线方案';
    } else if (otherKey) {
      hint = '已选「' + stcdLocalOptField(otherKey) + '」类别，服装/形态/造型/事件只能四选一';
    } else {
      hint = '先选择「' + fieldLabel + '」类别（正常/色情/堕落/淑女壶/虫化/调教等），即可在此生成时间线方案';
    }
    h += '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">';
    h += '<span style="font-size:11px;color:var(--fg);font-weight:600">' + fieldLabel + ' · 时间线</span>';
    h += '<div style="flex:1"></div>';
    h += '<span style="font-size:9px;color:var(--fg3)">' + escHtml(hint) + '</span>';
    h += '</div>';
    h += '</div>';
    return h;
  }
  var list = stcdLocalSuggestListOf(key);
  var detArr = stcdLocalDetailAsList(STCD.localOptDetail && STCD.localOptDetail[key]);
  var selCount = detArr.length;
  var h = '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:8px;margin:8px 0">';
  // 头部：标签 + 数量 + 生成 + 顺序调整 + 深化全部
  h += '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px">';
  h += '<span style="font-size:11px;color:var(--fg);font-weight:600">' + fieldLabel + ' · 时间线</span>';
  h += '<span style="font-size:9px;color:var(--fg3)">实历' + (list.actual || []).length + ' / 想象' + (list.imagined || []).length + ' 项</span>';
  h += '<div style="flex:1"></div>';
  h += '<span style="font-size:9px;color:var(--fg2)">每侧</span>';
  h += '<select id="stcd-opt-count-' + key + '" class="llm-input llm-select" style="width:60px;font-size:9px;padding:1px 2px">';
  h += '<option value="0"' + (!(STCD.localOptSuggestCount > 0) ? ' selected' : '') + '>自动</option>';
  for (var cn = 1; cn <= 20; cn++) {
    h += '<option value="' + cn + '"' + (cn === STCD.localOptSuggestCount ? ' selected' : '') + '>' + cn + '</option>';
  }
  h += '</select>';
  h += '<button class="btn-main" style="padding:1px 8px;font-size:9px" onclick="stcdLocalOptSuggestGen(\'init\',\'' + key + '\')">🎯 生成</button>';
  h += '<button class="btn-out" style="padding:1px 8px;font-size:9px" onclick="stcdLocalOptSuggestGen(\'reorder\',\'' + key + '\')">🔄 顺序调整</button>';
  h += '<button class="btn-out" style="padding:1px 8px;font-size:9px;color:var(--accent)" onclick="stcdLocalOptDeepenAll(\'' + key + '\')" title="对全部方案注入设计感（只改写描述，不改方案名/时间段）">🎨 深化全部</button>';
  h += '</div>';
  // 两栏时间线
  if (!list.actual.length && !list.imagined.length) {
    h += '<div style="font-size:10px;color:var(--fg3);padding:4px 0">暂无方案，点「🎯 生成」从角色卡提取（AI 按时间段从前到后排列）</div>';
  } else {
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0">';
    h += stcdLocalOptSuggestColumnHTML(key, 'actual', '📖 实历时间线', list.actual, detArr);
    h += stcdLocalOptSuggestColumnHTML(key, 'imagined', '✨ 想象时间线', list.imagined, detArr);
    h += '</div>';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">';
    h += '<span style="font-size:9px;color:var(--fg2)">已选 ' + selCount + ' 项（单选互斥，勾选即生效，生成提示词时传入）</span>';
    h += '<button class="btn-out" style="padding:1px 8px;font-size:9px;color:#e06c75" onclick="stcdLocalOptSuggestClearTimeline(\'' + key + '\')">🗑 清空本线</button>';
    h += '</div>';
  }
  h += '</div>';
  return h;
}

// 面板内各种生成动作（初始 / 末尾追加 / 两段之间 / 某段补充 / 单项重生成）
window.stcdLocalOptSuggestGen = function(mode, key, side, idx) {
  var countEl = document.getElementById('stcd-opt-count-' + key);
  var count = countEl ? (parseInt(countEl.value, 10) || 0) : (STCD.localOptSuggestCount || 0);
  STCD.localOptSuggestCount = count;
  var list = stcdLocalSuggestListOf(key);
  var arr = side ? (list[side] || []) : null;
  var ctx = { key: key, mode: mode, count: count, side: side || null, insertIndex: null, replaceIndex: null, targetText: '初始生成' };
  if (mode === 'init') {
    ctx.targetText = ((list.actual && list.actual.length) || (list.imagined && list.imagined.length))
      ? '在已有时间线基础上继续生成新的方案（与已有不重复、不覆盖原有）'
      : '初始生成';
  }
  else if (mode === 'reorder') {
    ctx.targetText = '顺序调整：仅依据角色卡信息重新排列已有时间线方案的时间先后顺序，不改动任何方案内容、不新增方案';
  }
  else if (mode === 'between') {
    ctx.insertIndex = idx + 1;
    ctx.targetText = '两段之间：『' + stcdLocalOptSuggestSeg(arr && arr[idx]) + '』 与 『' + stcdLocalOptSuggestSeg(arr && arr[idx + 1]) + '』 之间';
  }
  else if (mode === 'before') {
    ctx.insertIndex = 0;
    ctx.targetText = '时间线之前：生成早于已有时间线最早阶段的方案（与已有不重复）';
  }
  else if (mode === 'after') {
    ctx.insertIndex = (arr || []).length;
    ctx.targetText = '时间线之后：生成晚于已有时间线最晚阶段的方案（与已有不重复）';
  }
  else if (mode === 'refill') {
    ctx.insertIndex = idx + 1;
    ctx.targetText = '某段补充：在『' + stcdLocalOptSuggestSeg(arr && arr[idx]) + '』时间段内补充生成更多方案';
  }
  else if (mode === 'regenerate') {
    ctx.replaceIndex = idx;
    ctx.targetText = '单项重生成：重新生成『' + ((arr && arr[idx] && arr[idx].label) || '') + '』（其他方案保持）';
  }
  STCD.localOptSuggestCtx = ctx;
  if (typeof openAiGenPanel === 'function') openAiGenPanel('stcd-local-opt-suggest');
  else toast('AI 生成系统未就绪');
};

// ===== 深化设计 · 入口（单项 / 全部）=====
// 单项深化：只深化时间线中指定的一条方案（ctx.mode='one'，记录 oneLabel 供提示）
window.stcdLocalOptDeepenOne = function(key, side, idx) {
  var list = stcdLocalSuggestListOf(key);
  var arr = list[side] || [];
  var one = arr[idx];
  if (!one || !one.label) { toast('该方案不存在'); return; }
  STCD.localOptDeepenCtx = { key: key, mode: 'one', side: side, idx: idx, oneLabel: one.label };
  if (typeof openAiGenPanel === 'function') openAiGenPanel('stcd-local-opt-deepen');
  else toast('AI 生成系统未就绪');
};
// 全部深化：深化该时间线（选定类别）下的全部方案
window.stcdLocalOptDeepenAll = function(key) {
  var list = stcdLocalSuggestListOf(key);
  var total = ((list.actual || []).length || 0) + ((list.imagined || []).length || 0);
  if (!total) { toast('该时间线暂无方案，先点「🎯 生成」'); return; }
  STCD.localOptDeepenCtx = { key: key, mode: 'all' };
  if (typeof openAiGenPanel === 'function') openAiGenPanel('stcd-local-opt-deepen');
  else toast('AI 生成系统未就绪');
};

// 面板内单列时间线（detArr = 该字段已选用的方案数组，勾选状态即其成员）
function stcdLocalOptSuggestColumnHTML(key, side, title, items, detArr) {
  function has(label) {
    return stcdLocalDetailAsList(detArr).some(function(d) { return d && d.label === label && d.side === side; });
  }
  var h = '<div style="' + (side === 'actual' ? 'border-right:1px solid var(--border);padding-right:8px' : 'padding-left:8px') + '">';
  h += '<div style="font-size:10px;color:var(--fg);font-weight:600;margin-bottom:4px">' + title + '（' + items.length + '）<span style="color:var(--fg3);font-weight:400">· 按 1、2、3… 排序</span></div>';
  if (!items.length) {
    h += '<div style="font-size:9px;color:var(--fg3)">暂无</div>';
  }
  if (items.length) {
    h += '<div style="text-align:center;margin:1px 0 4px"><button class="btn-out" style="padding:0 6px;font-size:8px;color:var(--fg3)" onclick="stcdLocalOptSuggestGen(\'before\',\'' + key + '\',\'' + side + '\',0)">＋ 时间线之前生成</button></div>';
  }
  items.forEach(function(o, i) {
    var label = o.label || ('方案 ' + (i + 1));
    var on = has(label);
    var seqNo = (stcdLocalSeqNum(o.seq) != null) ? stcdLocalSeqNum(o.seq) : (i + 1);
    h += '<div style="border:1px solid var(--border);border-radius:6px;padding:5px 6px;margin-bottom:5px;cursor:pointer;' + (on ? 'border-color:var(--accent);background:rgba(78,204,163,0.08)' : '') + '" onclick="stcdLocalOptSuggestToggle(\'' + key + '\',\'' + side + '\',\'' + escHtml(label) + '\')">';
    h += '<div style="display:flex;align-items:center;gap:4px">';
    h += '<span style="font-size:10px;color:' + (on ? 'var(--accent)' : 'var(--fg3)') + '">' + (on ? '✔' : '○') + '</span>';
    h += '<span style="font-size:10px;color:var(--fg3);min-width:14px;text-align:right;font-weight:600">' + seqNo + '.</span>';
    if (o.time) h += '<span style="font-size:8px;color:var(--accent2);background:rgba(232,160,180,0.12);border-radius:3px;padding:0 3px;white-space:nowrap">⏱' + escHtml(o.time) + '</span>';
    if (o.origin) h += '<span style="font-size:8px;color:' + (o.origin === '原创' ? 'var(--accent)' : 'var(--fg3)') + ';border:1px solid ' + (o.origin === '原创' ? 'var(--accent)' : 'var(--border)') + ';border-radius:3px;padding:0 3px;white-space:nowrap">' + (o.origin === '原创' ? '🆕 原创' : '📚 参考') + '</span>';
    h += '<span title="点击复制方案名（同时切换选中）" style="font-size:10px;color:var(--fg);font-weight:600;flex:1;cursor:copy" onclick="复制到剪贴板(\'' + escHtml(label) + '\').then(function(ok){toast(ok ? \'已复制：' + escHtml(label) + '\' : \'复制失败\');})">' + escHtml(label) + '</span>';
    h += '<button class="btn-out" style="padding:0 4px;font-size:8px;color:#e06c75" title="删除该条方案" onclick="event.stopPropagation();stcdLocalOptSuggestRemoveItem(\'' + key + '\',\'' + side + '\',' + i + ')">🗑</button>';
    h += '<button class="btn-out" style="padding:0 4px;font-size:8px" title="单项重生成" onclick="event.stopPropagation();stcdLocalOptSuggestGen(\'regenerate\',\'' + key + '\',\'' + side + '\',' + i + ')">↻</button>';
    h += '<button class="btn-out" style="padding:0 4px;font-size:8px" title="该时间段补充生成" onclick="event.stopPropagation();stcdLocalOptSuggestGen(\'refill\',\'' + key + '\',\'' + side + '\',' + i + ')">➕</button>';
    h += '<button class="btn-out" style="padding:0 4px;font-size:8px;color:var(--accent)" title="深化设计：给这条方案注入设计感（只改写描述）" onclick="event.stopPropagation();stcdLocalOptDeepenOne(\'' + key + '\',\'' + side + '\',' + i + ')">🎨</button>';
    h += '</div>';
    if (o.desc) h += '<div style="font-size:9px;color:var(--fg2);margin-top:1px;line-height:1.4">' + escHtml(o.desc) + '</div>';
    if (o.deepened) h += '<div style="font-size:8px;color:var(--accent);margin-top:1px">🎨 已深化</div>';
    h += '</div>';
    // 两段之间生成
    if (i < items.length - 1) {
      h += '<div style="text-align:center;margin:1px 0"><button class="btn-out" style="padding:0 6px;font-size:8px;color:var(--fg3)" onclick="stcdLocalOptSuggestGen(\'between\',\'' + key + '\',\'' + side + '\',' + i + ')">＋ 两段之间生成</button></div>';
    }
  });
  if (items.length) {
    h += '<div style="text-align:center;margin:3px 0 1px"><button class="btn-out" style="padding:0 6px;font-size:8px;color:var(--fg3)" onclick="stcdLocalOptSuggestGen(\'after\',\'' + key + '\',\'' + side + '\',' + (items.length - 1) + ')">＋ 时间线之后生成</button></div>';
  }
  h += '</div>';
  return h;
}

// 本地 tab 渲染入口由 stcdSwitchTab（entry.js）调用；
// stcdLocalOpt / stcdLocalClearCard / stcdLocalClear 为 local-data.js 的全局函数声明，已自动挂到 window，无需重复导出。

