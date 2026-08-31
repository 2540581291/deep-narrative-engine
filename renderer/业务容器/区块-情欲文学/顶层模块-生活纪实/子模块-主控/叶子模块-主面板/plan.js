// 生活纪实 · 生活规划模块（plan.js）

// ===================== State Variables =====================
var lifeDoc规划角色索引 = 0;
var lifeDoc规划当前子页 = 'workday';
var lifeDoc自定义活动日选中索引 = -1;
var lifeDoc自定义活动视图 = 'list';

// ===================== Character Selection =====================
function lifeDoc选角色规划(idx) {
  lifeDoc规划角色索引 = idx;
  lifeDoc规划当前子页 = 'workday';
  lifeDoc自定义活动日选中索引 = -1;
  lifeDoc切换视图('plan');
}

function lifeDoc切换规划角色(idx) {
  lifeDoc规划角色索引 = idx;
  lifeDoc规划当前子页 = 'workday';
  lifeDoc自定义活动日选中索引 = -1;
  var vEl = document.getElementById('lifeDocViewContent');
  if (vEl) lifeDoc渲染生活规划(vEl);
}

// ===================== Main Plan Page =====================
function lifeDoc渲染生活规划(el) {
  var ch = lifeDoc角色库[lifeDoc规划角色索引];
  if (!ch) {
    el.innerHTML = '<div style="color:var(--fg2);text-align:center;padding:40px">请先选择或创建一个角色</div>';
    return;
  }

  // Ensure dailyRoutine exists
  if (!ch.dailyRoutine) ch.dailyRoutine = lifeDoc空行程();

  // Build tab bar
  var tabs = [];
  var tabDefs = [
    { id: 'workday', label: lifeDoc天类型标签['workday'] || '💼 工作日' },
    { id: 'restday', label: lifeDoc天类型标签['restday'] || '🏖️ 休息日' },
    { id: 'sexday', label: lifeDoc天类型标签['sexday'] || '🔥 性爱日' },
  ];
  tabDefs.forEach(function(t) { tabs.push(t); });

  // Separator + presets
  tabs.push({ id: '__sep__', label: '|', separator: true });
  tabs.push({ id: 'presets', label: '📁 预设模板' });

  // Custom tabs
  tabs.push({ id: '__sep2__', label: '|', separator: true });
  tabs.push({ id: 'segments', label: '📋 活动段' });
  tabs.push({ id: 'days', label: '📅 活动日' });
  tabs.push({ id: 'custom', label: '✨ 自定义生成' });

  var h = '';
  // Character header
  var chName = ch.name || ch.title || '未命名角色';
  h += '<div style="padding:8px 12px;border-bottom:1px solid var(--border);font-size:14px;color:var(--fg);display:flex;align-items:center;gap:8px;background:var(--bg2)">';
  h += '<span style="font-weight:600;color:var(--accent)">📋 ' + chName + '</span>';
  h += '</div>';

  // Tab bar
  h += '<div style="display:flex;flex-wrap:wrap;gap:2px;padding:6px 8px;border-bottom:1px solid var(--border);background:var(--bg);flex-shrink:0">';
  tabs.forEach(function(t) {
    if (t.separator) {
      h += '<span style="color:var(--fg3);padding:0 4px;line-height:30px">' + t.label + '</span>';
      return;
    }
    var active = false;
    if (t.id === 'presets') {
      active = (lifeDoc规划当前子页 === 'presets' || lifeDoc规划当前子页.indexOf('preset_') === 0);
    } else {
      active = (lifeDoc规划当前子页 === t.id);
    }
    h += '<span class="plan-tab" data-page="' + t.id + '" style="padding:4px 12px;border-radius:var(--radius);cursor:pointer;font-size:13px;transition:all 0.15s;';
    h += active ? 'background:var(--accent);color:var(--bg);font-weight:600' : 'background:var(--card);color:var(--fg2);border:1px solid var(--border)';
    h += '">' + t.label + '</span>';
  });
  h += '</div>';

  // Sub-page content area
  h += '<div id="planSubPage" style="flex:1;overflow-y:auto;min-height:0;padding:10px 12px"></div>';

  el.innerHTML = h;

  // Bind tab clicks
  el.querySelectorAll('.plan-tab[data-page]').forEach(function(tab) {
    tab.addEventListener('click', function() {
      var page = this.getAttribute('data-page');
      lifeDoc规划切换子页(page);
    });
  });

  // Render current sub-page
  lifeDoc渲染规划子页();
}

function lifeDoc规划切换子页(page) {
  lifeDoc规划当前子页 = page;
  var el = document.getElementById('lifeDocViewContent');
  if (el) lifeDoc渲染生活规划(el);
}

function lifeDoc渲染规划子页() {
  var spEl = document.getElementById('planSubPage');
  if (!spEl) return;
  var ch = lifeDoc角色库[lifeDoc规划角色索引];
  if (!ch) { spEl.innerHTML = ''; return; }

  var page = lifeDoc规划当前子页;

  if (page === 'custom') {
    lifeDoc渲染自定义生成(spEl, ch);
  } else if (page === 'segments') {
    lifeDoc渲染自定义活动段(spEl, ch);
  } else if (page === 'days') {
    if (lifeDoc自定义活动日选中索引 >= 0 && ch.customDayList && ch.customDayList[lifeDoc自定义活动日选中索引]) {
      // Copy selected custom day segments into dailyRoutine['custom'] for editing
      ch.dailyRoutine['custom'] = ch.customDayList[lifeDoc自定义活动日选中索引].segments || [];
      lifeDoc渲染行程编辑(spEl, ch, 'custom');
    } else {
      lifeDoc渲染自定义活动日(spEl, ch);
    }
  } else if (page === 'presets') {
    lifeDoc渲染预设日模板(spEl, ch);
  } else if (page.indexOf('preset_') === 0) {
    lifeDoc渲染行程编辑(spEl, ch, page);
  } else {
    // workday / restday / sexday / _customSeg / etc.
    lifeDoc渲染行程编辑(spEl, ch, page);
  }
}

// ===================== Routine Editor (行程编辑) =====================
function lifeDoc渲染行程编辑(el, ch, type) {
  if (!ch.dailyRoutine) ch.dailyRoutine = lifeDoc空行程();
  if (!ch.dailyRoutine[type]) ch.dailyRoutine[type] = [];

  var segments = ch.dailyRoutine[type];
  var isPreset = (type.indexOf('preset_') === 0);
  var typeLabel = lifeDoc天类型标签[type] || '';

  // Look up preset info
  if (isPreset) {
    var presetId = type.replace('preset_', '');
    var preset = PRESET_DAYS.find(function(p) { return p.id === presetId; });
    if (preset) {
      typeLabel = preset.icon + ' ' + preset.title;
    } else {
      typeLabel = '预设:' + presetId;
    }
  }

  var h = '';

  // Header with back button for presets
  if (isPreset) {
    h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">';
    h += '<span class="plan-back-btn" data-page="presets" style="cursor:pointer;color:var(--accent);font-size:13px;padding:2px 8px;border-radius:var(--radius);background:var(--card);border:1px solid var(--border)">← 返回模板</span>';
    h += '<span style="font-weight:600;color:var(--fg);font-size:15px">' + typeLabel + '</span>';
    h += '</div>';
    h += '<div style="color:var(--fg2);font-size:11px;margin:2px 0 10px 4px">' + escHtml(preset ? preset.desc : '') + '</div>';
  } else if (type === 'custom') {
    h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">';
    h += '<span class="plan-back-btn" data-page="days" style="cursor:pointer;color:var(--accent);font-size:13px;padding:2px 8px;border-radius:var(--radius);background:var(--card);border:1px solid var(--border)">← 返回活动日</span>';
    h += '<span style="font-weight:600;color:var(--fg);font-size:15px">📅 ' + escHtml(ch.customDayList && ch.customDayList[lifeDoc自定义活动日选中索引] ? ch.customDayList[lifeDoc自定义活动日选中索引].title : '活动日') + '</span>';
    h += '</div>';
  } else {
    h += '<div style="font-weight:600;color:var(--fg);font-size:15px;margin-bottom:10px">' + typeLabel + '</div>';
  }

  // Action buttons bar
  h += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">';
  h += '<button class="plan-add-segment" data-type="' + type + '" style="padding:4px 12px;border-radius:var(--radius-sm);cursor:pointer;font-size:12px;border:1px solid var(--success);background:transparent;color:var(--success)">＋ 新增时段</button>';
  h += '<button class="plan-ai-day" data-type="' + type + '" style="padding:4px 12px;border-radius:var(--radius-sm);cursor:pointer;font-size:12px;border:1px solid var(--accent);background:var(--accent-dim);color:var(--accent)">🤖 AI 生成行程</button>';
  if (segments.length > 0) {
    h += '<button class="plan-select-all" data-type="' + type + '" style="padding:4px 12px;border-radius:var(--radius-sm);cursor:pointer;font-size:12px;border:1px solid var(--border);background:var(--bg2);color:var(--fg2)">全选</button>';
    h += '<button class="plan-deselect-all" data-type="' + type + '" style="padding:4px 12px;border-radius:var(--radius-sm);cursor:pointer;font-size:12px;border:1px solid var(--border);background:var(--bg2);color:var(--fg2)">取消全选</button>';
  }
  h += '</div>';

  if (segments.length === 0) {
    h += '<div style="color:var(--fg2);text-align:center;padding:30px 0;font-size:13px">暂无时段。点击「新增时段」添加，或使用「AI 生成行程」自动生成</div>';
  } else {
    h += '<div style="display:flex;flex-direction:column;gap:8px">';
    segments.forEach(function(seg, si) {
      h += lifeDoc渲染单个时段(seg, si, type);
    });
    h += '</div>';
  }

  el.innerHTML = h;

  // Bind events
  // Back button
  el.querySelectorAll('.plan-back-btn[data-page]').forEach(function(btn) {
    btn.addEventListener('click', function() { lifeDoc规划切换子页(this.getAttribute('data-page')); });
  });

  // Add segment
  el.querySelectorAll('.plan-add-segment').forEach(function(btn) {
    btn.addEventListener('click', function() { lifeDoc规划新增时段(this.getAttribute('data-type')); });
  });

  // AI generate day
  el.querySelectorAll('.plan-ai-day').forEach(function(btn) {
    btn.addEventListener('click', function() { lifeDoc生成全天行程(this.getAttribute('data-type')); });
  });

  // Select all
  el.querySelectorAll('.plan-select-all').forEach(function(btn) {
    btn.addEventListener('click', function() { lifeDoc全选时段(this.getAttribute('data-type')); });
  });

  // Deselect all
  el.querySelectorAll('.plan-deselect-all').forEach(function(btn) {
    btn.addEventListener('click', function() { lifeDoc取消全选时段(this.getAttribute('data-type')); });
  });

  // Segment field changes (auto-save)
  el.querySelectorAll('.plan-seg-field').forEach(function(inp) {
    inp.addEventListener('change', function() {
      var type2 = this.getAttribute('data-type');
      var idx = parseInt(this.getAttribute('data-idx'), 10);
      var field = this.getAttribute('data-field');
      lifeDoc规划更新字段(type2, idx, field, this.value);
    });
  });

  // Segment checkbox
  el.querySelectorAll('.plan-seg-check').forEach(function(cb) {
    cb.addEventListener('change', function() {
      var type2 = this.getAttribute('data-type');
      var idx = parseInt(this.getAttribute('data-idx'), 10);
      lifeDoc切换时段选中(type2, idx, this.checked);
    });
  });

  // AI generate detail
  el.querySelectorAll('.plan-ai-seg').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var type2 = this.getAttribute('data-type');
      var idx = parseInt(this.getAttribute('data-idx'), 10);
      lifeDoc生成时段详情(type2, idx);
    });
  });

  // Delete segment
  el.querySelectorAll('.plan-del-seg').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var type2 = this.getAttribute('data-type');
      var idx = parseInt(this.getAttribute('data-idx'), 10);
      lifeDoc规划删除时段(type2, idx);
    });
  });

  // Jump to writing desk
  el.querySelectorAll('.plan-to-writing').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var type2 = this.getAttribute('data-type');
      var idx = parseInt(this.getAttribute('data-idx'), 10);
      lifeDoc跳转写作台(type2, idx);
    });
  });
}

function lifeDoc渲染单个时段(seg, si, type) {
  var checked = lifeDoc选中时段[type] && lifeDoc选中时段[type][si] ? 'checked' : '';
  var timeLabel = seg.timeLabel || '';
  var timeRange = seg.timeRange || '';
  var activities = seg.plays || seg.activities || ''; // fallback for old data
  var details = seg.narrative || '';
  var location = seg.location || '';

  var h = '<div class="seg-item" style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:8px 10px;margin-bottom:6px">';

  // Header row: checkbox + time label + time range
  h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">';
  h += '<input type="checkbox" class="plan-seg-check" data-type="' + type + '" data-idx="' + si + '" ' + checked + ' style="flex-shrink:0">';
  h += '<input type="text" class="plan-seg-field" data-type="' + type + '" data-idx="' + si + '" data-field="timeLabel" value="' + escHtml(timeLabel) + '" placeholder="时段名称" style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:3px 6px;color:var(--fg);font-size:12px;min-width:60px;outline:none">';
  h += '<input type="text" class="plan-seg-field" data-type="' + type + '" data-idx="' + si + '" data-field="timeRange" value="' + escHtml(timeRange) + '" placeholder="时间范围" style="width:130px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:3px 6px;color:var(--fg);font-size:12px;outline:none">';
  h += '</div>';

  // Activity + Location
  h += '<div style="display:flex;gap:6px;margin-bottom:4px">';
  h += '<input type="text" class="plan-seg-field" data-type="' + type + '" data-idx="' + si + '" data-field="plays" value="' + escHtml(activities) + '" placeholder="跳蛋、炮机、束缚…" style="flex:2;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:3px 6px;color:var(--fg);font-size:12px;outline:none">';
  h += '<input type="text" class="plan-seg-field" data-type="' + type + '" data-idx="' + si + '" data-field="location" value="' + escHtml(location) + '" placeholder="地点" style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:3px 6px;color:var(--fg);font-size:12px;outline:none">';
  h += '</div>';

  // Details — 最重要的字段，大、亮、显眼
  h += '<div style="margin-bottom:6px">';
  h += '<textarea class="plan-seg-field" data-type="' + type + '" data-idx="' + si + '" data-field="narrative" placeholder="这个时间段里发生的事情" style="width:100%;background:var(--bg2);border:1px solid var(--accent);border-radius:var(--radius-sm);padding:6px 8px;color:var(--fg);font-size:13px;outline:none;resize:vertical;min-height:60px;font-family:inherit;line-height:1.6">' + escHtml(details) + '</textarea>';
  h += '</div>';

  // Action buttons
  h += '<div style="display:flex;gap:4px;justify-content:flex-end">';
  h += '<button class="plan-ai-seg" data-type="' + type + '" data-idx="' + si + '" style="padding:2px 8px;border-radius:var(--radius-sm);cursor:pointer;font-size:11px;border:1px solid var(--accent);background:var(--accent-dim);color:var(--accent)">🤖 AI生成</button>';
  h += '<button class="plan-to-writing" data-type="' + type + '" data-idx="' + si + '" style="padding:2px 8px;border-radius:var(--radius-sm);cursor:pointer;font-size:11px;border:1px solid var(--border);background:var(--bg2);color:var(--fg2)">✍️ 写作台</button>';
  h += '<button class="plan-del-seg" data-type="' + type + '" data-idx="' + si + '" style="padding:2px 8px;border-radius:var(--radius-sm);cursor:pointer;font-size:11px;border:1px solid var(--error);background:transparent;color:var(--error)">🗑 删除</button>';
  h += '</div>';

  h += '</div>';
  return h;
}

// ===================== Custom Activity Segments (自定义活动段) =====================
function lifeDoc渲染自定义活动段(el, ch) {
  if (!ch.customActivitySegments) ch.customActivitySegments = [];

  var h = '';
  h += '<div style="font-weight:600;color:var(--fg);font-size:15px;margin-bottom:8px">' + (lifeDoc天类型标签['_customSeg'] || '📋 活动段') + '</div>';
  h += '<div style="color:var(--fg2);font-size:12px;margin-bottom:10px">自定义活动段是可复用的活动块，可在行程编辑中引用。</div>';

  h += '<button class="plan-add-custom-seg" style="padding:4px 12px;border-radius:var(--radius-sm);cursor:pointer;font-size:12px;border:1px solid var(--success);background:transparent;color:var(--success);margin-bottom:10px">＋ 新增活动段</button>';

  if (!ch.customActivitySegments || ch.customActivitySegments.length === 0) {
    h += '<div style="color:var(--fg2);text-align:center;padding:30px 0;font-size:13px">暂无自定义活动段</div>';
  } else {
    h += '<div style="display:flex;flex-direction:column;gap:6px">';
    ch.customActivitySegments.forEach(function(seg, si) {
      h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:8px 10px">';
      h += '<div style="display:flex;gap:6px;margin-bottom:4px">';
      h += '<input type="text" class="plan-cseg-field" data-idx="' + si + '" data-field="timeLabel" value="' + escHtml(seg.timeLabel || '') + '" placeholder="时段名称" style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:3px 6px;color:var(--fg);font-size:12px;outline:none">';
      h += '<input type="text" class="plan-cseg-field" data-idx="' + si + '" data-field="timeRange" value="' + escHtml(seg.timeRange || '') + '" placeholder="时间范围" style="width:120px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:3px 6px;color:var(--fg);font-size:12px;outline:none">';
      h += '</div>';
      h += '<div style="display:flex;gap:6px">';
      h += '<input type="text" class="plan-cseg-field" data-idx="' + si + '" data-field="activities" value="' + escHtml(seg.activities || '') + '" placeholder="活动概括" style="flex:2;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:3px 6px;color:var(--fg);font-size:12px;outline:none">';
      h += '<input type="text" class="plan-cseg-field" data-idx="' + si + '" data-field="location" value="' + escHtml(seg.location || '') + '" placeholder="地点" style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:3px 6px;color:var(--fg);font-size:12px;outline:none">';
      h += '<button class="plan-del-cseg" data-idx="' + si + '" style="padding:2px 8px;border-radius:var(--radius-sm);cursor:pointer;font-size:11px;border:1px solid var(--error);background:transparent;color:var(--error)">✕</button>';
      h += '</div>';
      h += '<div style="margin-top:4px">';
      h += '<textarea class="plan-cseg-field" data-idx="' + si + '" data-field="narrative" placeholder="这个时间段里发生的事情" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:3px 6px;color:var(--fg2);font-size:11px;outline:none;resize:vertical;min-height:32px;font-family:inherit">' + escHtml(seg.narrative || '') + '</textarea>';
      h += '</div>';
      h += '</div>';
    });
    h += '</div>';
  }

  el.innerHTML = h;

  el.querySelectorAll('.plan-add-custom-seg').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var ch2 = lifeDoc角色库[lifeDoc规划角色索引];
      if (!ch2.customActivitySegments) ch2.customActivitySegments = [];
      ch2.customActivitySegments.push({ timeLabel: '', timeRange: '', activities: '', location: '', detailHint: '' });
      lifeDoc保存角色();
      lifeDoc渲染规划子页();
    });
  });

  el.querySelectorAll('.plan-cseg-field').forEach(function(inp) {
    inp.addEventListener('change', function() {
      var idx = parseInt(this.getAttribute('data-idx'), 10);
      var field = this.getAttribute('data-field');
      var ch2 = lifeDoc角色库[lifeDoc规划角色索引];
      if (ch2 && ch2.customActivitySegments && ch2.customActivitySegments[idx]) {
        ch2.customActivitySegments[idx][field] = this.value;
        lifeDoc保存角色();
      }
    });
  });

  el.querySelectorAll('.plan-del-cseg').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var idx = parseInt(this.getAttribute('data-idx'), 10);
      lifeDoc删除自定义活动段(idx);
    });
  });
}

// ===================== Custom Day List (自定义活动日) =====================
function lifeDoc渲染自定义活动日(el, ch) {
  if (!ch.customDayList) ch.customDayList = [];

  var h = '';
  h += '<div style="font-weight:600;color:var(--fg);font-size:15px;margin-bottom:8px">' + (lifeDoc天类型标签['_customDay'] || '📅 活动日') + '</div>';
  h += '<div style="color:var(--fg2);font-size:12px;margin-bottom:10px">自定义活动日是完全自定义的一天行程模板。</div>';

  h += '<button class="plan-add-custom-day" style="padding:4px 12px;border-radius:var(--radius-sm);cursor:pointer;font-size:12px;border:1px solid var(--success);background:transparent;color:var(--success);margin-bottom:10px">＋ 新增活动日</button>';

  if (!ch.customDayList || ch.customDayList.length === 0) {
    h += '<div style="color:var(--fg2);text-align:center;padding:30px 0;font-size:13px">暂无自定义活动日</div>';
  } else {
    h += '<div style="display:flex;flex-direction:column;gap:6px">';
    ch.customDayList.forEach(function(day, di) {
      var segCount = (day.segments && day.segments.length) || 0;
      h += '<div class="plan-custom-day-item" data-idx="' + di + '" style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;cursor:pointer;display:flex;align-items:center;gap:8px">';
      h += '<span style="flex:1;color:var(--fg);font-size:13px">' + escHtml(day.title || '未命名') + ' <span style="color:var(--fg2);font-size:11px">(' + segCount + ' 段)</span></span>';
      h += '<button class="plan-rename-day" data-idx="' + di + '" style="padding:2px 8px;border-radius:var(--radius-sm);cursor:pointer;font-size:11px;border:1px solid var(--border);background:var(--bg2);color:var(--fg2)">✏ 重命名</button>';
      h += '<button class="plan-del-day" data-idx="' + di + '" style="padding:2px 8px;border-radius:var(--radius-sm);cursor:pointer;font-size:11px;border:1px solid var(--error);background:transparent;color:var(--error)">🗑 删除</button>';
      h += '</div>';
    });
    h += '</div>';
  }

  el.innerHTML = h;

  // Click on day item to edit
  el.querySelectorAll('.plan-custom-day-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
      if (e.target.closest('.plan-rename-day') || e.target.closest('.plan-del-day')) return;
      var idx = parseInt(this.getAttribute('data-idx'), 10);
      lifeDoc切换自定义活动日(idx);
    });
  });

  // Add new day
  el.querySelectorAll('.plan-add-custom-day').forEach(function(btn) {
    btn.addEventListener('click', function() { lifeDoc新增自定义活动日(); });
  });

  // Rename
  el.querySelectorAll('.plan-rename-day').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var idx = parseInt(this.getAttribute('data-idx'), 10);
      lifeDoc重命名活动日(idx);
    });
  });

  // Delete
  el.querySelectorAll('.plan-del-day').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var idx = parseInt(this.getAttribute('data-idx'), 10);
      lifeDoc删除自定义活动日(idx);
    });
  });
}

// ===================== Custom Generation (自定义生成) =====================
function lifeDoc渲染自定义生成(el, ch) {
  var h = '';
  h += '<div class="n-card mb-6">';
  h += '<div class="fs-12 fw-600 c-fg mb-8">✨ 自定义生成活动</div>';
  h += '<div class="fs-10 c-fg3 mb-4">描述你想要生成的活动，AI 将自动创建一天完整的行程。</div>';
  h += '</div>';
  h += '<div class="n-card mb-6">';
  h += '<div class="fs-11 fw-600 c-fg3 mb-4">快速选择活动类型</div>';
  h += '<div class="mb-6">';
  var activityChips = window.lifeDoc活动芯片 || [];
  activityChips.forEach(function(g) {
    h += '<div class="fs-10 c-fg3 mb-2">' + escHtml(g.group) + '</div>';
    h += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">';
    g.chips.forEach(function(c) {
      var val = escHtml(c.text);
      var append = (c.append || '');
      var escAppend = append.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n');
      h += '<span class="tag-chip" style="cursor:pointer;padding:2px 8px;font-size:11px" onclick="var ta=document.getElementById(\'planCustomPrompt\');if(ta){var v=ta.value;ta.value=v?(v+\'\\n【' + val + '】' + escAppend + '\'):\'【' + val + '】' + escAppend + '\';ta.focus()}">' + val + '</span>';
    });
    h += '</div>';
  });
  h += '</div>';
  h += '<div style="margin-bottom:6px;display:flex;gap:6px">';
  h += '<button class="btn-out btn-sm" style="font-size:11px" onclick="打开玩法参考选择器(function(t){var ta=document.getElementById(\'planCustomPrompt\');if(ta){ta.value=ta.value?ta.value+\'\\n\'+t:t;ta.focus()}})">📖 玩法参考</button>';
  h += '</div>';
  h += '<div class="fs-11 fw-600 c-fg3 mb-4">活动描述</div>';
  h += '<textarea id="planCustomPrompt" rows="6" class="llm-input w-100 resize-v" placeholder="描述你想要的行程，例如：&#10;一个慵懒的周末，睡到自然醒，去海边散步，找一家安静的咖啡馆看书，晚上回家做饭看一部电影。" style="font-size:13px;line-height:1.6"></textarea>';
  h += '<div style="display:flex;gap:8px;margin-top:10px">';
  h += '<button id="planGenCustom" class="btn btn-primary" style="flex:1">🎯 AI 生成</button>';
  h += '</div>';
  h += '<div id="planCustomResult" class="mt-6"></div>';
  h += '</div>';
  el.innerHTML = h;
  // 即时保存：输入即持久化
  var _promptTimer = null;
  document.getElementById('planCustomPrompt').addEventListener('input', function() {
    clearTimeout(_promptTimer);
    _promptTimer = setTimeout(function() {
      var ch2 = lifeDoc角色库[lifeDoc规划角色索引];
      if (ch2) { ch2.customActivityPrompt = document.getElementById('planCustomPrompt').value; lifeDoc保存角色(); }
    }, 400);
  });
  document.getElementById('planGenCustom').addEventListener('click', function() {
    var ta = document.getElementById('planCustomPrompt');
    if (!ta || !ta.value.trim()) { toast('请先输入活动描述'); return; }
    lifeDoc生成自定义行程(ta.value);
  });
}

// ===================== Preset Day Templates (预设日模板) =====================
function lifeDoc渲染预设日模板(el, ch) {
  // Compute normal categories (excluding 情色)
  var normalCats = [];
  var seenNormal = {};
  PRESET_DAYS.forEach(function(p) {
    if (p.cat !== '情色' && !seenNormal[p.cat]) {
      seenNormal[p.cat] = true;
      normalCats.push(p.cat);
    }
  });

  // Compute erotic subcategories  (fix for the eroSubcats bug)
  var eroSubcats = [];
  var seenEro = {};
  PRESET_DAYS.forEach(function(p) {
    if (p.cat === '情色' && p.subcat && !seenEro[p.subcat]) {
      seenEro[p.subcat] = true;
      eroSubcats.push(p.subcat);
    }
  });

  var h = '';
  h += '<div style="font-weight:bold;color:#e0c080;font-size:15px;margin-bottom:8px">📁 预设日模板</div>';
  h += '<div style="color:#aaa;font-size:12px;margin-bottom:12px">选择一个预设模板，AI 将自动填充当天行程。点击后可进一步编辑。</div>';

  // Two-column layout
  h += '<div style="display:flex;gap:12px">';

  // Left column: 正常
  h += '<div style="flex:1;min-width:0">';
  h += '<div style="font-weight:bold;color:#8ab;font-size:14px;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #333">正常</div>';
  normalCats.forEach(function(cat) {
    var items = PRESET_DAYS.filter(function(p) { return p.cat === cat; });
    if (items.length === 0) return;
    h += '<div style="margin-bottom:10px">';
    h += '<div style="color:#888;font-size:11px;margin-bottom:4px;padding-left:2px">' + cat + '</div>';
    h += '<div style="display:flex;flex-wrap:wrap;gap:4px">';
    items.forEach(function(p) {
      h += '<div class="plan-preset-card" data-preset="' + p.id + '" style="background:#222;border:1px solid #333;border-radius:6px;padding:6px 8px;cursor:pointer;width:calc(50% - 4px);min-width:120px;box-sizing:border-box">';
      h += '<div style="font-size:16px;margin-bottom:2px">' + p.icon + '</div>';
      h += '<div style="color:#ddd;font-size:12px;font-weight:bold">' + p.title + '</div>';
      h += '<div style="color:#777;font-size:10px;margin-top:2px;line-height:1.3">' + p.desc + '</div>';
      h += '</div>';
    });
    h += '</div></div>';
  });
  h += '</div>';

  // Right column: 情色 (grouped by subcat)
  h += '<div style="flex:1;min-width:0">';
  h += '<div style="font-weight:bold;color:#c88;font-size:14px;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #333">情色</div>';
  eroSubcats.forEach(function(subcat) {
    var items = PRESET_DAYS.filter(function(p) { return p.cat === '情色' && p.subcat === subcat; });
    if (items.length === 0) return;
    h += '<div style="margin-bottom:10px">';
    h += '<div style="color:#888;font-size:11px;margin-bottom:4px;padding-left:2px">' + subcat + '</div>';
    h += '<div style="display:flex;flex-wrap:wrap;gap:4px">';
    items.forEach(function(p) {
      h += '<div class="plan-preset-card" data-preset="' + p.id + '" style="background:#2a1a1a;border:1px solid #4a2a2a;border-radius:6px;padding:6px 8px;cursor:pointer;width:calc(50% - 4px);min-width:120px;box-sizing:border-box">';
      h += '<div style="font-size:16px;margin-bottom:2px">' + p.icon + '</div>';
      h += '<div style="color:#ddd;font-size:12px;font-weight:bold">' + p.title + '</div>';
      h += '<div style="color:#777;font-size:10px;margin-top:2px;line-height:1.3">' + p.desc + '</div>';
      h += '</div>';
    });
    h += '</div></div>';
  });
  h += '</div>';

  h += '</div>'; // end two-column

  el.innerHTML = h;

  // Bind preset card clicks
  el.querySelectorAll('.plan-preset-card').forEach(function(card) {
    card.addEventListener('click', function() {
      var presetId = this.getAttribute('data-preset');
      lifeDoc应用预设日(presetId);
    });
  });
}

function lifeDoc应用预设日(presetId) {
  var ch = lifeDoc角色库[lifeDoc规划角色索引];
  if (!ch) return;
  if (!ch.dailyRoutine) ch.dailyRoutine = lifeDoc空行程();

  var typeKey = 'preset_' + presetId;
  if (ch.dailyRoutine[typeKey]) { lifeDoc规划切换子页(typeKey); return; }

  ch.dailyRoutine[typeKey] = ldw空时段(5);
  lifeDoc保存角色();
  lifeDoc规划切换子页(typeKey);
}

function ldw空时段(n) {
  var segs = [];
  for (var i = 0; i < n; i++) {
    segs.push({ timeLabel: '', timeRange: '', plays: '', narrative: '', location: '' });
  }
  return segs;
}

// ===================== Segment CRUD =====================
function lifeDoc规划新增时段(type) {
  var ch = lifeDoc角色库[lifeDoc规划角色索引];
  if (!ch) return;
  if (!ch.dailyRoutine) ch.dailyRoutine = lifeDoc空行程();
  if (!ch.dailyRoutine[type]) ch.dailyRoutine[type] = [];

  ch.dailyRoutine[type].push({
    timeLabel: '新时段',
    timeRange: '',
    activities: '',
    details: '',
    location: ''
  });
  lifeDoc保存角色();
  lifeDoc渲染规划子页();
}

function lifeDoc规划删除时段(type, si) {
  var ch = lifeDoc角色库[lifeDoc规划角色索引];
  if (!ch || !ch.dailyRoutine || !ch.dailyRoutine[type]) return;
  if (si < 0 || si >= ch.dailyRoutine[type].length) return;

  ch.dailyRoutine[type].splice(si, 1);

  // Clean up selection state
  if (lifeDoc选中时段[type]) {
    delete lifeDoc选中时段[type][si];
    // Shift indices
    var newSel = {};
    Object.keys(lifeDoc选中时段[type]).forEach(function(k) {
      var ki = parseInt(k, 10);
      if (ki < si) { newSel[ki] = lifeDoc选中时段[type][ki]; }
      else if (ki > si) { newSel[ki - 1] = lifeDoc选中时段[type][ki]; }
    });
    lifeDoc选中时段[type] = newSel;
  }

  lifeDoc保存角色();
  lifeDoc渲染规划子页();
}

function lifeDoc规划更新字段(type, si, field, value) {
  var ch = lifeDoc角色库[lifeDoc规划角色索引];
  if (!ch || !ch.dailyRoutine || !ch.dailyRoutine[type]) return;
  if (si < 0 || si >= ch.dailyRoutine[type].length) return;

  ch.dailyRoutine[type][si][field] = value;

  // Also sync back to customDayList if editing a custom day
  if (type === 'custom' && lifeDoc自定义活动日选中索引 >= 0 &&
      ch.customDayList && ch.customDayList[lifeDoc自定义活动日选中索引]) {
    ch.customDayList[lifeDoc自定义活动日选中索引].segments = ch.dailyRoutine['custom'];
  }

  lifeDoc保存角色();
}

// ===================== AI Generation =====================
function lifeDoc生成时段详情(type, si) {
  var ch = lifeDoc角色库[lifeDoc规划角色索引];
  if (!ch || !ch.dailyRoutine || !ch.dailyRoutine[type]) return;
  var seg = ch.dailyRoutine[type][si];
  if (!seg) return;
  var fullCh = lifeDocFullCharData(ch);

  // Build prompt from segment data
  var charData = JSON.stringify(fullCh, null, 2);
  var segmentInfo = '时段：' + (seg.timeLabel || '未命名') + ' (' + (seg.timeRange || '时间待定') + ')';
  if (seg.plays) segmentInfo += '\n玩法：' + seg.plays;
  if (seg.location) segmentInfo += '\n地点：' + seg.location;
  if (seg.narrative) segmentInfo += '\n细节：' + seg.narrative;

  var prompt = '角色完整数据：\n' + charData + '\n\n当前时段信息：\n' + segmentInfo + '\n\n请为以上时段生成叙事内容（中文，100-200字），描述这个时间段里发生的事情。\n\n同时推荐该时段适合使用的玩法/道具。输出JSON格式：{"narrative":"叙事内容","plays":"玩法道具，无则填无"}。';

  LLM.callJSON({ prompt: prompt, system: '你是一个生活纪实文学作家，擅长描写日常生活中的细节和氛围。', label: '时段详情: ' + ch.name + ' ' + (seg.timeLabel || '') }).then(function(result) {
    
    if (result) {
      if (result.details) seg.narrative = result.details.trim();
      if (result.plays) seg.plays = result.plays;
      lifeDoc保存角色();
      lifeDoc渲染规划子页();
      toast('✅ 已生成详情');
    }
  }).catch(function(err) {
    
    toast('⚠️ 生成失败: ' + err.message);
  });

}
function lifeDoc生成全天行程(type) {
  var ch = lifeDoc角色库[lifeDoc规划角色索引];
  if (!ch) { toast('请先选择角色'); return; }

  var segCount = Math.max(1, (ch.dailyRoutine && ch.dailyRoutine[type] ? ch.dailyRoutine[type].length : 0));
  if (segCount === 0) segCount = 5;


  var sourceData = ch;
  var fullCh = lifeDocFullCharData(ch);
  var charData = JSON.stringify(fullCh, null, 2);
  var dayHint = '需生成 ' + segCount + ' 个时段。';
  if (type === 'workday') dayHint += '这是工作日，角色需要上班/上学，按工作日的节奏安排。';
  else if (type === 'restday') dayHint += '这是休息日，角色不用工作，安排休闲、娱乐、外出等活动。';
  else if (type === 'sexday') dayHint += '这是性爱日，以性爱为核心主题，包含调情、前戏、性交、温存等环节。';
  else if (type.indexOf('preset_') === 0) {
    var presetId = type.replace('preset_', '');
    var preset = PRESET_DAYS.find(function(p) { return p.id === presetId; });
    if (preset) dayHint += '这是【' + preset.title + '】，' + preset.desc;
  }

  var rendered = renderPrompt('life_doc_analyze_single', { charData: charData, dayTypeLabel: lifeDoc天类型标签[type] || type, dayTypeHint: dayHint, segCount: segCount });
  if (!rendered || !rendered.user) {  toast('提示词模板未找到'); return; }

  LLM.callJSON({ prompt: rendered.user, system: rendered.system, label: '生成' + (lifeDoc天类型标签[type] || type) + ': ' + ch.name }).then(function(data) {
    if (!data || !data.length) {  toast('生成失败，请重试'); return; }
    if (!ch.dailyRoutine) ch.dailyRoutine = lifeDoc空行程();
    ch.dailyRoutine[type] = data;
    lifeDoc保存角色();
    
    toast('✅ ' + (lifeDoc天类型标签[type] || type) + ' 行程已生成');
    lifeDoc渲染规划子页();
  }).catch(function(err) {
    
    toast('⚠️ 生成失败: ' + err.message);
  });
}

function lifeDoc生成自定义行程(promptText) {
  var ch = lifeDoc角色库[lifeDoc规划角色索引];
  if (!ch) { toast('请先选择角色'); return; }
  if (!promptText || !promptText.trim()) { toast('请先输入活动描述'); return; }

  

  var sourceData = ch;
  var fullCh = lifeDocFullCharData(ch);
  var charData = JSON.stringify(fullCh, null, 2);

  var segCount = 5;
  if (ch.customDayList && ch.customDayList.length > 0) {
    var last = ch.customDayList[ch.customDayList.length - 1];
    if (last.segments) segCount = last.segments.length;
  }
  var rendered = renderPrompt('life_doc_custom_day', { charData: charData, activityPrompt: promptText + '\n\n请拆分为 ' + segCount + ' 个时段。' });
  if (!rendered || !rendered.user) {  toast('提示词模板未找到'); return; }

  LLM.callJSON({ prompt: rendered.user, system: rendered.system, label: '自定义行程: ' + ch.name }).then(function(data) {
    if (!data || !data.segments) {  toast('生成失败，请重试'); return; }
    if (!ch.customDayList) ch.customDayList = [];
    ch.customDayList.push({
      id: 'custom-' + Date.now(),
      title: data.title || '自定义活动',
      description: data.description || promptText.slice(0, 50),
      segments: data.segments
    });
    lifeDoc保存角色();
    
    toast('✅ 自定义行程已生成');
    lifeDoc渲染规划子页();
  }).catch(function(err) {
    
    toast('⚠️ 生成失败: ' + err.message);
  });
}

// ===================== Writing Desk Navigation =====================
function lifeDoc跳转写作台(type, si) {
  lifeDoc写作台当前天类型 = type;
  lifeDoc写作台当前段索引 = si;

  lifeDoc当前视图 = 'writing';
  var el = document.getElementById('lifeDocViewContent');
  if (el) {
    if (typeof ldw渲染写作台 === 'function') {
      ldw渲染写作台(el);
    } else {
      el.innerHTML = '<div style="color:#888;text-align:center;padding:40px">写作台模块未加载 (writing.js)</div>';
    }
  }

  // Update tab highlight
  var navEl = document.getElementById('life-docContent');
  if (navEl) {
    navEl.querySelectorAll('.sub-nav-item[data-view]').forEach(function(i) {
      var v = i.getAttribute('data-view');
      i.className = 'sub-nav-item' + (v === 'writing' ? ' act' : '');
    });
  }
}

// ===================== Segment Selection =====================
function lifeDoc切换时段选中(type, si, checked) {
  if (!lifeDoc选中时段[type]) lifeDoc选中时段[type] = {};
  if (checked) {
    lifeDoc选中时段[type][si] = true;
  } else {
    delete lifeDoc选中时段[type][si];
  }
}

function lifeDoc全选时段(type) {
  var ch = lifeDoc角色库[lifeDoc规划角色索引];
  if (!ch || !ch.dailyRoutine || !ch.dailyRoutine[type]) return;
  if (!lifeDoc选中时段[type]) lifeDoc选中时段[type] = {};
  ch.dailyRoutine[type].forEach(function(_, si) {
    lifeDoc选中时段[type][si] = true;
  });
  lifeDoc渲染规划子页();
}

function lifeDoc取消全选时段(type) {
  if (lifeDoc选中时段[type]) {
    lifeDoc选中时段[type] = {};
  }
  lifeDoc渲染规划子页();
}

// ===================== Custom Day Operations =====================
function lifeDoc切换自定义活动日(idx) {
  var ch = lifeDoc角色库[lifeDoc规划角色索引];
  if (!ch || !ch.customDayList || !ch.customDayList[idx]) return;

  lifeDoc自定义活动日选中索引 = idx;

  // Copy segments into dailyRoutine['custom'] for editing
  ch.dailyRoutine['custom'] = ch.customDayList[idx].segments || [];

  // Stay on 'days' page but it will now show the editor (via lifeDoc渲染规划子页 dispatch)
  lifeDoc规划当前子页 = 'days';
  lifeDoc渲染规划子页();
}

function lifeDoc删除自定义活动段(si) {
  var ch = lifeDoc角色库[lifeDoc规划角色索引];
  if (!ch || !ch.customActivitySegments) return;
  if (si < 0 || si >= ch.customActivitySegments.length) return;
  ch.customActivitySegments.splice(si, 1);
  lifeDoc保存角色();
  lifeDoc渲染规划子页();
}

function lifeDoc删除自定义活动日(di) {
  var ch = lifeDoc角色库[lifeDoc规划角色索引];
  if (!ch || !ch.customDayList) return;
  if (di < 0 || di >= ch.customDayList.length) return;

  if (!confirm('确定删除活动日「' + (ch.customDayList[di].title || '未命名') + '」？')) return;

  // 删除磁盘上对应的自定义日文件
  var day = ch.customDayList[di];
  var dir = lifeDoc角色路径(ch.name);
  var file = '自定义日-' + LocalFS.sanitize(day.title || '未命名' + di) + '.json';
  LocalFS.delete(dir + file).catch(function(){});

  ch.customDayList.splice(di, 1);

  // Reset selection if editing the deleted day
  if (lifeDoc自定义活动日选中索引 === di) {
    lifeDoc自定义活动日选中索引 = -1;
    if (ch.dailyRoutine) delete ch.dailyRoutine['custom'];
  } else if (lifeDoc自定义活动日选中索引 > di) {
    lifeDoc自定义活动日选中索引--;
  }

  lifeDoc保存角色();
  lifeDoc渲染规划子页();
}

function lifeDoc重命名活动日(di) {
  var ch = lifeDoc角色库[lifeDoc规划角色索引];
  if (!ch || !ch.customDayList || !ch.customDayList[di]) return;

  var oldTitle = ch.customDayList[di].title || '';
  var newTitle = prompt('请输入新的活动日名称：', oldTitle);
  if (newTitle && newTitle.trim()) {
    ch.customDayList[di].title = newTitle.trim();
    lifeDoc保存角色();
    lifeDoc渲染规划子页();
  }
}

function lifeDoc新增自定义活动日() {
  var ch = lifeDoc角色库[lifeDoc规划角色索引];
  if (!ch) return;
  if (!ch.customDayList) ch.customDayList = [];

  var title = prompt('请输入活动日名称（如：约会日、出游日）：', '自定义日');
  if (!title || !title.trim()) return;

  ch.customDayList.push({
    id: 'day-' + Date.now(),
    title: title.trim(),
    segments: ldw空时段(5)
  });
  lifeDoc保存角色();
  lifeDoc渲染规划子页();
}

// ===================== Utility =====================
function escHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// showToast fallback in case it's not defined globally
if (typeof showToast !== 'function') {
  function showToast(msg) {
    console.log('[Toast] ' + msg);
  }
}

// ===================== Export to Window =====================
window.lifeDoc规划角色索引 = lifeDoc规划角色索引;
window.lifeDoc规划当前子页 = lifeDoc规划当前子页;
window.lifeDoc自定义活动日选中索引 = lifeDoc自定义活动日选中索引;
window.lifeDoc自定义活动视图 = lifeDoc自定义活动视图;

window.lifeDoc选角色规划 = lifeDoc选角色规划;
window.lifeDoc渲染生活规划 = lifeDoc渲染生活规划;
window.lifeDoc规划切换子页 = lifeDoc规划切换子页;
window.lifeDoc渲染规划子页 = lifeDoc渲染规划子页;
window.lifeDoc渲染行程编辑 = lifeDoc渲染行程编辑;
window.lifeDoc渲染自定义活动段 = lifeDoc渲染自定义活动段;
window.lifeDoc渲染自定义活动日 = lifeDoc渲染自定义活动日;
window.lifeDoc渲染自定义生成 = lifeDoc渲染自定义生成;
window.lifeDoc渲染预设日模板 = lifeDoc渲染预设日模板;
window.lifeDoc应用预设日 = lifeDoc应用预设日;
window.lifeDoc规划新增时段 = lifeDoc规划新增时段;
window.lifeDoc规划删除时段 = lifeDoc规划删除时段;
window.lifeDoc规划更新字段 = lifeDoc规划更新字段;
window.lifeDoc生成时段详情 = lifeDoc生成时段详情;
window.lifeDoc生成全天行程 = lifeDoc生成全天行程;
window.lifeDoc生成自定义行程 = lifeDoc生成自定义行程;
window.lifeDoc跳转写作台 = lifeDoc跳转写作台;
window.lifeDoc切换时段选中 = lifeDoc切换时段选中;
window.lifeDoc全选时段 = lifeDoc全选时段;
window.lifeDoc取消全选时段 = lifeDoc取消全选时段;
window.lifeDoc切换自定义活动日 = lifeDoc切换自定义活动日;
window.lifeDoc删除自定义活动段 = lifeDoc删除自定义活动段;
window.lifeDoc删除自定义活动日 = lifeDoc删除自定义活动日;
window.lifeDoc重命名活动日 = lifeDoc重命名活动日;
window.lifeDoc新增自定义活动日 = lifeDoc新增自定义活动日;
window.lifeDoc切换规划角色 = lifeDoc切换规划角色;
