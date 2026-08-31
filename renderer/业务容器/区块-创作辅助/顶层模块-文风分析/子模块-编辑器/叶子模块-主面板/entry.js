// 参考文档（文风分析）· 编辑器（条目树版）

var _wfId = 0;

// ===== 条目树模型 =====
// 一条：{ id, title, content, children[] }，children 表示下级（上下级关系）
function 文风条目(title, content, children) {
  return {
    id: 'wf' + (++_wfId) + '_' + Date.now(),
    title: title || '',
    content: content || '',
    children: children || []
  };
}

// 确保数组每条都有 id（递归），AI 返回/旧文本转来的条目补上 id
function 文风条目规范化(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(function(e) {
    if (!e) return 文风条目('', '', []);
    var out = 文风条目(e.title || '', e.content || '', []);
    if (Array.isArray(e.children) && e.children.length) {
      out.children = 文风条目规范化(e.children);
    }
    return out;
  });
}

// 旧文本 → 条目数组：按【类别】/「数字. 标题」/ 空行分块粗拆，拆不出则整块一条
function 文风文本转条目(text) {
  if (!text || !text.trim()) return [];
  var lines = String(text).split(/\n/).map(function(l){ return l.trim(); });
  var root = [];
  var rootCur = null;
  var childCur = null;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (!line) continue;
    var m = line.match(/^【(.+?)】$/);
    var n = line.match(/^(\d+)[.、]\s*(.+)$/);
    if (m) {
      if (!rootCur) {
        rootCur = 文风条目(m[1], '', []);
        root.push(rootCur);
        childCur = null;
      } else if (childCur && /原文示例|示例/.test(m[1])) {
        childCur.children.push(文风条目(m[1], '', []));
        childCur = childCur.children[childCur.children.length - 1];
      } else {
        childCur = 文风条目(m[1], '', []);
        rootCur.children.push(childCur);
      }
    } else if (n) {
      var t = 文风条目(n[2], '', []);
      if (rootCur) rootCur.children.push(t);
      else { root.push(t); rootCur = t; }
      childCur = t;
    } else {
      var target = childCur ||
        (rootCur && rootCur.children.length ? rootCur.children[rootCur.children.length - 1] : rootCur) ||
        (root.length ? root[root.length - 1] : null);
      if (!target) { target = 文风条目('', '', []); root.push(target); rootCur = target; childCur = target; }
      target.content = (target.content ? target.content + '\n' : '') + line;
    }
  }
  return root;
}

// 板块值（字符串|数组）→ 条目数组
function 文风板块到条目(v) {
  if (Array.isArray(v)) return 文风条目规范化(v);
  if (typeof v === 'string' && v.trim()) return 文风文本转条目(v);
  return [];
}

// 从完整 analysis 文本按 ═══ 分隔符解析到各分段（文本版）
function 文风解析分段(fullText) {
  var segs = {};
  if (!fullText) return segs;
  for (var j = 0; j < 文风分析标签.length; j++) {
    var label = 文风分析标签[j].id;
    var re = new RegExp('═══\\s*' + label + '\\s*═══\\s*([\\s\\S]*?)(?=═══|$)');
    var m = fullText.match(re);
    if (m) segs[label] = m[1].trim();
  }
  return segs;
}

// 条目树 → 文本（用于存储 analysis 兼容字段）
function 文风条目文本(e, level) {
  var s = '';
  if (e.title) s += e.title + '\n';
  if (e.content) s += e.content;
  if (e.children && e.children.length) {
    s = (s ? s + '\n' : '') + e.children.map(function(c){ return 文风条目文本(c, level + 1); }).join('\n');
  }
  return s;
}
function 文风树序列化(sections) {
  if (!sections || typeof sections !== 'object') return '';
  return 文风分析标签.map(function(t) {
    var arr = sections[t.id];
    if (!Array.isArray(arr) || !arr.length) return '═══ ' + t.id + ' ═══\n';
    return '═══ ' + t.id + ' ═══\n' + arr.map(function(e){ return 文风条目文本(e, 0); }).join('\n');
  }).join('\n\n');
}

// 统一把任何来源的数据（含旧 schema / 旧文本）归一化成新 schema（sections 为条目树）
function 文风归一化(item) {
  item = item || {};
  var analysis = item.analysis || '';
  // 旧格式：正文在 content（含 ═══ 分隔的完整分析文本），兼容迁移数据
  if (!analysis && typeof item.content === 'string') analysis = item.content || '';
  var raw = item.sections;
  var parsed = 文风解析分段(analysis);
  var sections = {};
  文风分析标签.forEach(function(t) {
    var id = t.id;
    var v = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw[id] : undefined;
    if (v === undefined || v === null) v = parsed[id] || '';
    // 基本信息板块=元数据表单（tags/sourceText），不存条目树
    sections[id] = (id === '基本信息') ? [] : 文风板块到条目(v);
  });
  return {
    title: item.title || item.name || '',
    tags: item.tags || [],
    sourceText: item.sourceText || '',
    sections: sections,
    analysis: analysis,
    createdAt: item.createdAt || '',
    updatedAt: item.updatedAt || ''
  };
}

// ===== 只读树（查看弹窗用） =====
var _wfFold = {};
function 文风树HTML只读(entries) {
  if (!Array.isArray(entries) || !entries.length) return '<div class="text-muted text-sm">（空）</div>';
  return entries.map(function(e){ return 文风树只读条目HTML(e, 0); }).join('');
}
function 文风树只读条目HTML(e, level) {
  var hasKids = Array.isArray(e.children) && e.children.length;
  var kidsHtml = '';
  if (hasKids) {
    kidsHtml = '<div class="wf-kids" style="margin-top:4px;margin-left:12px;padding-left:12px;border-left:1px solid var(--border);display:' + (_wfFold[e.id] ? 'none' : 'block') + '">' +
      e.children.map(function(c){ return 文风树只读条目HTML(c, level + 1); }).join('') + '</div>';
  }
  return '<div class="wf-ent" style="margin-bottom:6px">' +
    '<div style="display:flex;align-items:center;gap:6px">' +
    '<span class="wf-fold' + (hasKids ? '' : ' wf-leaf') + '" style="width:14px;text-align:center;cursor:' + (hasKids ? 'pointer' : 'default') + ';color:var(--fg3)" ' + (hasKids ? ('data-wf="' + e.id + '"') : '') + '>' + (hasKids ? '▾' : '•') + '</span>' +
    (e.title ? '<span class="wf-title c-fg" style="font-weight:' + (level > 0 ? '500' : '700') + '">' + escHtml(e.title) + '</span>' : '') +
    '</div>' +
    (e.content ? '<div class="wf-content" style="margin:2px 0 0 20px;color:var(--fg2);white-space:pre-wrap">' + escHtml(e.content) + '</div>' : '') +
    kidsHtml +
    '</div>';
}
// 绑定只读树的折叠
function 文风树绑定只读(ov) {
  var folds = ov.querySelectorAll('.wf-fold[data-wf]');
  Array.prototype.forEach.call(folds, function(el) {
    el.addEventListener('click', function() {
      var id = el.getAttribute('data-wf');
      _wfFold[id] = !_wfFold[id];
      var kids = el.parentNode ? el.parentNode.nextSibling : null;
      // 找到同一 .wf-ent 内的 .wf-kids
      var ent = el.closest ? el.closest('.wf-ent') : null;
      var k = ent ? ent.querySelector('.wf-kids') : null;
      if (k) k.style.display = _wfFold[id] ? 'none' : 'block';
      el.textContent = _wfFold[id] ? '▸' : '▾';
    });
  });
}

// ===== 树编辑器（替换自由文本） =====
function 文风树查找(arr, id, depth) {
  depth = depth || 0;
  if (!Array.isArray(arr)) return null;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].id === id) return { entry: arr[i], arr: arr, index: i, depth: depth, parent: null };
    var r = 文风树查找(arr[i].children, id, depth + 1);
    if (r) { r.parent = arr[i]; return r; }
  }
  return null;
}

function 文风树输入更新(id, field, value) {
  var arr = _styleAna[_styleEditSubTab];
  var f = 文风树查找(arr, id);
  if (f) f.entry[field] = value;
}

function 文风树折叠(id) {
  _wfFold[id] = !_wfFold[id];
  var el = document.getElementById('wfent_' + id);
  if (el) {
    var k = el.querySelector('.wf-kids');
    var caret = el.querySelector('.wf-fold');
    if (k) k.style.display = _wfFold[id] ? 'none' : 'block';
    if (caret) caret.textContent = _wfFold[id] ? '▸' : '▾';
  }
}

function 文风树操作(id, op) {
  var arr = _styleAna[_styleEditSubTab];
  var f = 文风树查找(arr, id);
  if (!f) return;
  var e = f.entry;
  var MAXDEPTH = 3;
  if (op === 'del') {
    f.arr.splice(f.index, 1);
  } else if (op === 'up') {
    if (f.index > 0) { var a = f.arr[f.index - 1]; f.arr[f.index - 1] = e; f.arr[f.index] = a; }
  } else if (op === 'down') {
    if (f.index < f.arr.length - 1) { var b = f.arr[f.index + 1]; f.arr[f.index + 1] = e; f.arr[f.index] = b; }
  } else if (op === 'levelup') { // ⇤ 升级：移出父级，作为父级的兄弟排在父级之后
    if (f.parent) {
      var psiblings = f.arr;
      var parentArr = 文风树查找(arr, f.parent.id);
      if (parentArr && parentArr.entry) {
        var pIdx = parentArr.arr.indexOf(parentArr.entry);
        f.arr.splice(f.index, 1);
        if (pIdx >= 0) parentArr.arr.splice(pIdx + 1, 0, e);
      }
    }
  } else if (op === 'leveldown') { // ⇥ 降级：成为上一条的子级
    if (f.index > 0 && f.depth < MAXDEPTH - 1) {
      var prev = f.arr[f.index - 1];
      f.arr.splice(f.index, 1);
      prev.children = prev.children || [];
      prev.children.push(e);
    }
  } else if (op === 'add') { // 加同级条目
    f.arr.splice(f.index + 1, 0, 文风条目('', '', []));
  } else if (op === 'addchild') { // 加子条目
    if (f.depth < MAXDEPTH - 1) {
      e.children = e.children || [];
      e.children.push(文风条目('', '', []));
    }
  }
  渲染当前树编辑器();
  if (typeof window.文风调度自动保存 === 'function') window.文风调度自动保存();
}

// 渲染一条树编辑器行
function 文风树编辑器条目HTML(e, level) {
  var maxIndent = level > 0;
  var canDown = (level < 2); // 还可再降级（最深 3 层）
  var bstyle = 'cursor:pointer;padding:1px 7px;border-radius:4px;background:var(--bg3);color:var(--fg2);font-size:11px;user-select:none';
  var dstyle = 'cursor:pointer;padding:1px 7px;border-radius:4px;background:var(--accent-dim);color:var(--accent2);font-size:11px;user-select:none';
  var xstyle = 'cursor:pointer;padding:1px 7px;border-radius:4px;background:var(--error);color:#fff;font-size:11px;user-select:none';
  var kids = (e.children && e.children.length ? e.children.map(function(c){ return 文风树编辑器条目HTML(c, level + 1); }).join('') : '');
  return '<div class="wf-ent" id="wfent_' + e.id + '" style="margin-bottom:8px">' +
    '<div style="display:flex;align-items:center;gap:6px">' +
    '<span class="wf-fold" onclick="文风树折叠(\'' + e.id + '\')" style="width:14px;text-align:center;cursor:pointer;color:var(--fg3)">' + (e.children && e.children.length ? '▾' : '•') + '</span>' +
    '<input class="llm-input" value="' + escHtml(e.title) + '" placeholder="条目标题" oninput="文风树输入更新(\'' + e.id + '\',\'title\',this.value);文风调度自动保存()" style="flex:1;min-width:120px">' +
    '</div>' +
    '<textarea class="llm-input" placeholder="正文" oninput="文风树输入更新(\'' + e.id + '\',\'content\',this.value);文风调度自动保存()" style="width:100%;min-height:56px;margin-top:4px">' + escHtml(e.content) + '</textarea>' +
    '<div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap">' +
    '<span style="' + dstyle + '" onclick="文风树操作(\'' + e.id + '\',\'addchild\')" title="加子条目">＋子</span>' +
    '<span style="' + bstyle + '" onclick="文风树操作(\'' + e.id + '\',\'add\')" title="加同级条目">＋项</span>' +
    '<span style="' + bstyle + '" onclick="文风树操作(\'' + e.id + '\',\'up\')" title="上移">↑</span>' +
    '<span style="' + bstyle + '" onclick="文风树操作(\'' + e.id + '\',\'down\')" title="下移">↓</span>' +
    (maxIndent ? '<span style="' + bstyle + '" onclick="文风树操作(\'' + e.id + '\',\'levelup\')" title="升级为父级">⇤上</span>' : '') +
    (canDown ? '<span style="' + bstyle + '" onclick="文风树操作(\'' + e.id + '\',\'leveldown\')" title="降级为子级">⇥下</span>' : '') +
    '<span style="' + xstyle + '" onclick="文风树操作(\'' + e.id + '\',\'del\')" title="删除">🗑</span>' +
    '</div>' +
    '<div class="wf-kids" style="margin-top:6px;margin-left:12px;padding-left:12px;border-left:1px solid var(--border)">' + kids + '</div>' +
    '</div>';
}

function 渲染当前树编辑器() {
  var el = document.getElementById('说styleTabContent');
  if (!el) return;
  var entries = _styleAna[_styleEditSubTab] || [];
  var h = '<div class="wf-tree-editor">' +
    '<div class="flex items-center justify-between mb-6">' +
    '<span class="fs-11 c-fg3">条目树（⬅ 缩进 = 下级；可加/删/移动/升降级）</span>' +
    '<span class="btn btn-outline btn-sm" onclick="文风树顶层加条目()" style="margin-left:auto">➕ 加条目</span>' +
    '</div>';
  if (!Array.isArray(entries) || !entries.length) {
    h += '<div class="placeholder-text">暂无条目，点「➕ 加条目」或用 AI 生成。</div>';
  } else {
    h += entries.map(function(e){ return 文风树编辑器条目HTML(e, 0); }).join('');
  }
  h += '</div>';
  el.innerHTML = h;
}

// 顶部「➕ 加条目」：在当前板块顶层加一条
window.文风树顶层加条目 = function() {
  var arr = _styleAna[_styleEditSubTab];
  if (!Array.isArray(arr)) arr = [];
  arr.push(文风条目('', '', []));
  _styleAna[_styleEditSubTab] = arr;
  渲染当前树编辑器();
  if (typeof window.文风调度自动保存 === 'function') window.文风调度自动保存();
};

// ===== 渲染 =====
function 渲染文风编辑器(el) {
  if (_styleEditTitle) {
    Store.refDoc.get(_styleEditTitle).then(function(data) { render文风表单(el, data || {}); });
  } else {
    render文风表单(el, { title: '', sourceText: '', analysis: '', tags: [] });
  }
}

function render文风表单(el, data) {
  var norm = 文风归一化(data);
  _styleAna = {};
  文风分析标签.forEach(function(t) { _styleAna[t.id] = norm.sections[t.id] && Array.isArray(norm.sections[t.id]) ? 文风条目规范化(norm.sections[t.id]) : (norm.sections[t.id] && typeof norm.sections[t.id] === 'string' ? 文风文本转条目(norm.sections[t.id]) : []); });
  window._styleEditTagsCache = norm.tags;
  window._styleEditSourceCache = norm.sourceText;
  _styleEditSubTab = '基本信息';

  var h = '<div class="flex-row" style="justify-content:space-between;margin-bottom:8px;gap:6px">';
  h += '<div class="ai-field-row flex-1">';
  h += '<input class="llm-input" id="styleEditTitle" oninput="文风调度自动保存()" style="font-size:16px;font-weight:600;flex:1" value="' + escHtml(norm.title) + '" placeholder="输入作品标题...">';
  h += '<button class="ai-suggest-btn" onclick="生成文风分析()" title="AI 生成文风分析">🤖</button></div>';
  h += '<button class="btn" onclick="生成文风分析()" style="background:var(--accent);color:#fff;flex-shrink:0">🚀 生成文风分析</button>';
  h += '<button class="btn-secondary btn-sm" onclick="文风上传文件()" style="flex-shrink:0">📂 上传原文</button>';
  h += '</div>';

  h += '<div class="tl-subnav" id="说styleSubNav">';
  文风分析标签.forEach(function(t) {
    h += '<div class="tl-subitem' + (t.id === _styleEditSubTab ? ' act' : '') + '" data-stab="' + t.id + '">' + t.label + '</div>';
  });
  h += '</div>';
  h += '<div id="说styleTabContent"></div>';

  h += '<div class="flex gap-6 mt-6 items-center">';
  h += '<button class="btn" onclick="文风保存编辑()">💾 保存</button>';
  h += '<button class="btn-secondary btn-sm" onclick="文风离开编辑器()">← 返回列表</button>';
  h += '<span id="styleSaveStatus" style="font-size:11px;color:var(--accent);opacity:0;transition:opacity 0.2s"></span>';
  h += '</div>';

  el.innerHTML = h;

  el.querySelectorAll('.tl-subitem[data-stab]').forEach(function(item) {
    item.addEventListener('click', function() {
      文风切子标签(this.getAttribute('data-stab'));
    });
  });

  var tc = document.getElementById('说styleTabContent');
  if (tc) 渲染当前分析段(tc);
}

function 渲染当前分析段(el) {
  if (_styleEditSubTab === '基本信息') {
    var tags = window._styleEditTagsCache || [];
    var srcText = window._styleEditSourceCache || '';
    var h = '<div class="n-card">';
    h += '<div class="form-group"><label>标签（逗号分隔）</label><input class="llm-input" id="styleEditTags" oninput="文风调度自动保存()" value="' + escHtml(tags.join('、')) + '" placeholder="NTR、隐奸、幼女..."></div>';
    h += '<div class="form-group"><label>原始文本</label>';
    h += '<textarea class="llm-input textarea-area-lg" id="styleEditSource" oninput="文风调度自动保存()" style="min-height:250px" placeholder="粘贴或导入要分析的原始文本...">' + escHtml(srcText) + '</textarea>';
    if (srcText.length > 500) h += '<div class="text-sm text-muted mt-2">原始文本共 ' + srcText.length + ' 字</div>';
    h += '</div></div>';
    el.innerHTML = h;
    return;
  }
  渲染当前树编辑器();
}

// ===== 即时保存 =====
function 文风当前数据() {
  var titleEl = document.getElementById('styleEditTitle');
  var t = (titleEl && titleEl.value) ? titleEl.value.trim() : '';
  var tagsInput = document.getElementById('styleEditTags');
  var tags = tagsInput ? tagsInput.value.trim().split(/[、,，\s]+/).filter(Boolean) : (window._styleEditTagsCache || []);
  var srcInput = document.getElementById('styleEditSource');
  var sourceText = srcInput ? srcInput.value.trim() : (window._styleEditSourceCache || '');
  window._styleEditTagsCache = tags;
  window._styleEditSourceCache = sourceText;
  var sections = {};
  文风分析标签.forEach(function(t) {
    var arr = _styleAna[t.id];
    sections[t.id] = Array.isArray(arr) ? arr : [];
  });
  return {
    title: t,
    key: _styleEditTitle || t,
    tags: tags,
    sourceText: sourceText,
    sections: sections,
    analysis: 文风树序列化(sections)
  };
}

function 文风持久化(data, opts) {
  var auto = !!(opts && opts.auto);
  return Store.refDoc.get(data.key).then(function(existing) {
    return Store.refDoc.save(data.key, {
      title: data.title,
      tags: data.tags,
      sourceText: data.sourceText,
      sections: data.sections,
      analysis: data.analysis,
      createdAt: (existing && existing.createdAt) || fmtDate(new Date()),
      updatedAt: fmtDate(new Date())
    }).then(function() {
      _styleEditTitle = data.key;
      if (auto) {
        var badge = document.getElementById('styleSaveStatus');
        if (badge) { badge.textContent = '已自动保存 ✓'; badge.style.opacity = '1'; setTimeout(function(){ badge.style.opacity = '0'; }, 1200); }
      } else {
        toast('保存成功');
        文风切换视图('list');
      }
    });
  });
}

var _styleSaveTimer = null;
function 文风调度自动保存() {
  clearTimeout(_styleSaveTimer);
  _styleSaveTimer = setTimeout(function() {
    var data = 文风当前数据();
    if (!data.title) return;
    文风持久化(data, { auto: true });
  }, 500);
}

function 文风离开编辑器() {
  clearTimeout(_styleSaveTimer);
  var data = 文风当前数据();
  if (data.title) {
    文风持久化(data, { auto: true }).then(function() { 文风切换视图('list'); });
  } else {
    文风切换视图('list');
  }
}

function 文风保存编辑() {
  clearTimeout(_styleSaveTimer);
  var data = 文风当前数据();
  if (!data.title) { toast('请输入作品标题'); return; }
  文风持久化(data, { auto: false });
}

window.文风保存编辑 = 文风保存编辑;
window.文风调度自动保存 = 文风调度自动保存;
window.文风离开编辑器 = 文风离开编辑器;
window.文风归一化 = 文风归一化;
window.文风树HTML只读 = 文风树HTML只读;
window.文风树绑定只读 = 文风树绑定只读;
window.文风条目规范化 = 文风条目规范化;
window.文风板块到条目 = 文风板块到条目;
window.文风树序列化 = 文风树序列化;
window.文风树输入更新 = 文风树输入更新;
window.文风树折叠 = 文风树折叠;
window.文风树操作 = 文风树操作;
