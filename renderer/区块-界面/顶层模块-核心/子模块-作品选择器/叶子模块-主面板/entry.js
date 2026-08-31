// 情欲工坊 · 作品选择器（全局可复用组件，仿 生图词典/导入角色卡 stcdOpenCharPicker 的模板）
// 内容树「自动读取」：主进程扫描 renderer/业务容器 的 区块 → 顶层模块 → 子模块(store)，
//   再用 window.存储目录 补全扫描没覆盖、但确实创建了 Store 的类型（如 情欲文学/世界观）。
// 用法（标准回调）：stcdOpenWorkPicker({ onPick: function(work){ ... }, targetId, mode })
//   - opts.onPick(work)  选中后回调，并自动关闭弹窗。work = { storeKey, storeLabel, title, item, content }
//   - opts.targetId      可选，指定一个文本框 id；未传 onPick 时按 fill 模式填入 targetId
//   - opts.card          为 true 时仅作「记录为生成上下文」，不自动填入
// 供「点评赏析：从作品库选」等任何需要选一个作品当上下文的模块复用。

var STCD_WORK_PICKER = { targetId: '', mode: 'fill', onPick: null, groups: {}, block: 0, category: 0, sub: 0, filter: '全部' };
var 作品树 = [];

// 主进程已按真实层级补全；这里仅在主进程漏掉时，按 STORE_DIRS 的层级路径补（带 '/' 的），不再造「其它作品」桶
// 路径如 情欲工坊/书信社交/书信 → 区块=情欲工坊、顶层模块=书信社交、子类型=书信（归并到同一模块）
function 作品补全STORE_DIRS(tree) {
  var dirs = window.存储目录 || window.STORE_DIRS || {};
  var inTree = {};
  tree.forEach(function(b) { (b.modules || []).forEach(function(m) { (m.stores || []).forEach(function(s) { inTree[s.store] = true; }); }); });
  Object.keys(dirs).forEach(function(key) {
    if (inTree[key]) return;
    var st = Store[key];
    if (!st || typeof st.list !== 'function') return;
    var segs = String(dirs[key] || key).split('/').filter(Boolean);
    if (segs.length < 2) return;   // 扁平目录不在此归并（由主进程扫描负责）
    var blockLabel = segs[0], catLabel = segs[1], leafLabel = segs.slice(2).join('/') || segs[1];
    var blk = null;
    for (var i = 0; i < tree.length; i++) if (tree[i].label === blockLabel) { blk = tree[i]; break; }
    if (!blk) { blk = { label: blockLabel, modules: [] }; tree.push(blk); }
    var md = null;
    for (var j = 0; j < blk.modules.length; j++) if (blk.modules[j].label === catLabel) { md = blk.modules[j]; break; }
    if (!md) { md = { label: catLabel, stores: [] }; blk.modules.push(md); }
    var exists = md.stores.some(function(x) { return x.store === key; });
    if (!exists) md.stores.push({ label: leafLabel, store: key });
  });
  return tree;
}

// 按真实 UI 侧边栏顺序排序（区块 → 顶层模块）
function 作品按UI排序() {
  var sb = window.侧边栏项;
  if (!Array.isArray(sb) || !sb.length) return;
  var blockOrder = sb.map(function(c) { return String(c.cat || '').replace(/^\S+\s/, ''); });
  作品树.sort(function(a, b) {
    var ia = blockOrder.indexOf(a.label), ib = blockOrder.indexOf(b.label);
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
  });
  作品树.forEach(function(b) {
    var cat = null;
    sb.forEach(function(c) { if (String(c.cat || '').replace(/^\S+\s/, '') === b.label) cat = c; });
    if (!cat || !Array.isArray(cat.items)) return;
    var itemOrder = cat.items.map(function(it) { return it.label; });
    b.modules.sort(function(x, y) {
      var ix = itemOrder.indexOf(x.label), iy = itemOrder.indexOf(y.label);
      return (ix < 0 ? 999 : ix) - (iy < 0 ? 999 : iy);
    });
  });
}

// 每个作品类型的富信息卡片（icon / 标题 / 徽标 / 预览）
function 作品选择器子信息(storeKey, it) {
  var r = { icon: '📘', title: it.title || '未命名', badges: [], preview: '' };
  if (storeKey === 'character') {
    var bi = (it.identity && it.identity.basicInfo) || {};
    r.icon = bi.icon || '👤';
    r.title = bi.name || it.title || '未命名';
    r.badges = [bi.gender, bi.age ? (bi.age + '岁') : '', bi.race, bi.rarity].filter(Boolean);
    r.preview = it.title || '';
  } else if (storeKey === 'world') {
    r.icon = '🌍';
    r.badges = [(it.modules || []).length + ' 板块'];
    r.preview = it.description || it.overview || '';
  } else {
    r.icon = '📘';
    var tags = it.genreTags || it.tags || [];
    r.badges = tags.slice(0, 4);
    var cnt = (it.outline || []).length || it.chapterCount;
    if (cnt) r.badges = r.badges.concat([cnt + ' 章']);
    r.preview = it.premise || it.content || '';
  }
  return r;
}

// 每个作品类型的筛选取值（用于顶部筛选行）
function 作品选择器筛选值(storeKey, it) {
  if (storeKey === 'character') { var bi = (it.identity && it.identity.basicInfo) || {}; return bi.gender ? [bi.gender] : []; }
  return (it.genreTags || it.tags || []).slice(0, 12);
}

function 作品选择器命中(item, storeKey, filter) {
  if (!filter || filter === '全部') return true;
  return 作品选择器筛选值(storeKey, item).indexOf(filter) >= 0;
}

function 作品遍历叶(node, acc) {
  if (node.store) acc.push(node);
  (node.children || []).forEach(function(c) { 作品遍历叶(c, acc); });
}
function 作品叶库列表() {
  var acc = [];
  作品树.forEach(function(b) { (b.modules || []).forEach(function(m) { (m.stores || []).forEach(function(s) { acc.push(s); }); }); });
  return acc;
}

function 作品库标签(storeKey) {
  var found = '';
  作品树.forEach(function(b) { (b.modules || []).forEach(function(m) { (m.stores || []).forEach(function(s) { if (s.store === storeKey) found = s.label; }); }); });
  return found;
}

function stcdOpenWorkPicker(opts) {
  opts = opts || {};
  STCD_WORK_PICKER.targetId = opts.targetId || '';
  STCD_WORK_PICKER.mode = (opts && opts.card) ? 'card' : 'fill';
  STCD_WORK_PICKER.onPick = (opts && typeof opts.onPick === 'function') ? opts.onPick : null;
  if (typeof Store === 'undefined') { toast('存储未就绪'); return; }
  STCD_WORK_PICKER.filter = '全部';
  var hasTree = 作品树.length;
  var ensure = Promise.resolve(作品树);
  if (typeof window.narrative !== 'undefined' && typeof window.narrative.getWorksTree === 'function' && !hasTree) {
    ensure = window.narrative.getWorksTree().then(function(res) {
      var tree = (res && res.ok && res.tree) ? res.tree : [];
      console.log('[作品选择器] getWorksTree=' + ((res && res.ok) ? ('ok(' + tree.length + '块)') : ('失败/空→回退')));
      return tree;
    }).catch(function() { console.log('[作品选择器] getWorksTree=reject→回退'); return []; });
  } else if (!hasTree) {
    ensure = Promise.resolve([]);
  }
  ensure.then(function(tree) {
    作品树 = Array.isArray(tree) ? tree : [];
    // 无论主进程扫描是否成功，都用 STORE_DIRS 补全（保证有数据的库一定进树）+ 按真实 UI 排序
    作品树 = 作品补全STORE_DIRS(作品树);
    作品按UI排序();
    var 叶库 = 作品叶库列表();
    var loads = 叶库.map(function(leaf) {
      var s = Store[leaf.store];
      if (!s || typeof s.list !== 'function') return Promise.resolve({ store: leaf.store, items: [] });
      return s.list().then(function(items) { return { store: leaf.store, items: items || [] }; }).catch(function() { return { store: leaf.store, items: [] }; });
    });
    return Promise.all(loads).then(function(res) {
      var groups = {};
      res.forEach(function(r) { groups[r.store] = r.items; });
      STCD_WORK_PICKER.groups = groups;
      var any = 叶库.some(function(leaf) { return (groups[leaf.store] || []).length; });
      console.log('[作品选择器] 叶库=' + 叶库.length + ' 有内容库=' + 叶库.filter(function(l) { return (groups[l.store] || []).length; }).length + (any ? '' : '（空）'));
      if (!any) { toast('作品库暂无内容，请先在对应模块创建作品'); return; }
      STCD_WORK_PICKER.block = 0; STCD_WORK_PICKER.category = 0; STCD_WORK_PICKER.sub = 0;
      // 定位到第一个有内容的 区块/模块/子类型
      for (var bi = 0; bi < 作品树.length; bi++) {
        var found = 作品首个有内容(作品树[bi]);
        if (found) { STCD_WORK_PICKER.block = bi; STCD_WORK_PICKER.category = found.mod; STCD_WORK_PICKER.sub = found.sub || 0; break; }
      }
      stcdWorkPickerRender();
    });
  });
}

function 作品首个有内容(block) {
  for (var mi = 0; mi < (block.modules || []).length; mi++) {
    var mod = block.modules[mi];
    var stores = mod.stores || [];
    for (var si = 0; si < stores.length; si++) {
      if ((STCD_WORK_PICKER.groups[stores[si].store] || []).length) return { mod: mi, sub: si };
    }
  }
  return null;
}

function 作品当前库() {
  var block = 作品树[STCD_WORK_PICKER.block] || 作品树[0];
  if (!block) return { store: '', label: '' };
  var mod = (block.modules || [])[STCD_WORK_PICKER.category] || (block.modules || [])[0];
  if (!mod || !(mod.stores || []).length) return { store: '', label: '' };
  // 单 store 的模块 → 直接展示该 store，不出现子类型行
  if (mod.stores.length === 1) return { store: mod.stores[0].store, label: mod.label };
  var sub = mod.stores[STCD_WORK_PICKER.sub] || mod.stores[0];
  return { store: sub.store, label: sub.label };
}

function 作品区块计数(bIdx) {
  var total = 0;
  (作品树[bIdx].modules || []).forEach(function(m) { (m.stores || []).forEach(function(s) { total += (STCD_WORK_PICKER.groups[s.store] || []).length; }); });
  return total;
}
function 作品模块计数(mod) {
  var total = 0; (mod.stores || []).forEach(function(s) { total += (STCD_WORK_PICKER.groups[s.store] || []).length; }); return total;
}

function stcdWorkPickerBlock(i) { STCD_WORK_PICKER.block = i; STCD_WORK_PICKER.category = 0; STCD_WORK_PICKER.sub = 0; STCD_WORK_PICKER.filter = '全部'; stcdWorkPickerRender(); }
function stcdWorkPickerCategory(i) { STCD_WORK_PICKER.category = i; STCD_WORK_PICKER.sub = 0; STCD_WORK_PICKER.filter = '全部'; stcdWorkPickerRender(); }
function stcdWorkPickerSub(i) { STCD_WORK_PICKER.sub = i; STCD_WORK_PICKER.filter = '全部'; stcdWorkPickerRender(); }
function stcdWorkPickerFilter(f) { STCD_WORK_PICKER.filter = f; stcdWorkPickerRender(); }

function stcdWorkPickerRender() {
  var block = 作品树[STCD_WORK_PICKER.block] || 作品树[0];
  var mod = (block && block.modules) ? (block.modules[STCD_WORK_PICKER.category] || block.modules[0]) : null;
  var cur = 作品当前库();
  var items = STCD_WORK_PICKER.groups[cur.store] || [];
  var filtered = items.filter(function(it) { return 作品选择器命中(it, cur.store, STCD_WORK_PICKER.filter); });
  var vals = [];
  items.forEach(function(it) { 作品选择器筛选值(cur.store, it).forEach(function(v) { if (vals.indexOf(v) < 0) vals.push(v); }); });
  var showSub = mod && mod.stores && mod.stores.length > 1;

  var h = '<div class="mcard" style="width:900px;max-width:96vw;height:80vh;max-height:80vh;display:flex;flex-direction:column">';
  h += '<style>#stcdWorkGrid{overflow-y:scroll;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.25) rgba(255,255,255,0.06)}#stcdWorkGrid::-webkit-scrollbar{width:10px;display:block}#stcdWorkGrid::-webkit-scrollbar-track{background:rgba(255,255,255,0.06)}#stcdWorkGrid::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.25);border-radius:5px}</style>';
  // 头部
  h += '<div style="display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--border);flex-shrink:0">';
  h += '<span style="font-size:15px;font-weight:600">📚 从作品库选择</span>';
  h += '<span style="font-size:11px;color:var(--fg3)">' + (STCD_WORK_PICKER.mode === 'card' ? '选择作品作为生成上下文' : '选择作品填入') + '</span>';
  h += '<div style="flex:1"></div>';
  h += '<span style="cursor:pointer;color:var(--fg3);font-size:18px" onclick="this.closest(\'.ovl\').remove()">✕</span>';
  h += '</div>';
  // 层级面包屑：区块 › 顶层模块 › 子类型
  h += '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:8px 16px;border-bottom:1px solid var(--border);flex-shrink:0;font-size:11px">';
  h += '<span style="color:var(--fg3)">当前位置：</span>';
  h += '<span style="cursor:pointer;color:var(--accent);font-weight:600" onclick="stcdWorkPickerBlock(' + STCD_WORK_PICKER.block + ')">' + escHtml(block.label) + '</span>';
  if (mod) {
    h += '<span style="color:var(--fg3)">›</span>';
    h += '<span style="cursor:pointer;color:var(--accent)" onclick="stcdWorkPickerCategory(' + STCD_WORK_PICKER.category + ')">' + escHtml(mod.label) + '</span>';
    if (showSub) {
      h += '<span style="color:var(--fg3)">›</span>';
      h += '<span style="color:var(--fg)">' + escHtml(cur.label) + '</span>';
    }
  }
  h += '</div>';
  // 区块
  h += '<div style="display:flex;gap:5px;flex-wrap:wrap;padding:10px 16px;border-bottom:1px solid var(--border);flex-shrink:0">';
  作品树.forEach(function(b, i) {
    var act = i === STCD_WORK_PICKER.block;
    h += '<span class="tag-chip' + (act ? ' tag-active' : '') + '" style="cursor:pointer;font-size:10px;padding:2px 8px" onclick="stcdWorkPickerBlock(' + i + ')">' + escHtml(b.label) + (作品区块计数(i) ? ' (' + 作品区块计数(i) + ')' : '') + '</span>';
  });
  h += '</div>';
  // 顶层模块
  h += '<div style="display:flex;gap:5px;flex-wrap:wrap;padding:8px 16px;border-bottom:1px solid var(--border);flex-shrink:0">';
  (block.modules || []).forEach(function(m, i) {
    var act = i === STCD_WORK_PICKER.category;
    var cnt = 作品模块计数(m);
    h += '<span class="tag-chip' + (act ? ' tag-active' : '') + '" style="cursor:pointer;font-size:10px;padding:2px 8px" onclick="stcdWorkPickerCategory(' + i + ')">' + escHtml(m.label) + (cnt ? ' (' + cnt + ')' : '') + '</span>';
  });
  h += '</div>';
  // 子类型（该模块有多个 store 时）
  if (showSub) {
    h += '<div style="display:flex;gap:5px;flex-wrap:wrap;padding:8px 16px;border-bottom:1px solid var(--border);flex-shrink:0">';
    mod.stores.forEach(function(s, i) {
      var act = i === STCD_WORK_PICKER.sub;
      var cnt = (STCD_WORK_PICKER.groups[s.store] || []).length;
      h += '<span class="tag-chip' + (act ? ' tag-active' : '') + '" style="cursor:pointer;font-size:10px;padding:2px 8px" onclick="stcdWorkPickerSub(' + i + ')">' + escHtml(s.label) + (cnt ? ' (' + cnt + ')' : '') + '</span>';
    });
    h += '</div>';
  }
  // 筛选行
  if (vals.length) {
    h += '<div style="display:flex;gap:5px;flex-wrap:wrap;padding:8px 16px;border-bottom:1px solid var(--border);flex-shrink:0">';
    ['全部'].concat(vals).forEach(function(v) {
      var act = STCD_WORK_PICKER.filter === v;
      h += '<span class="tag-chip' + (act ? ' tag-active' : '') + '" style="cursor:pointer;font-size:10px;padding:2px 8px" onclick="stcdWorkPickerFilter(\'' + v + '\')">' + escHtml(v) + '</span>';
    });
    h += '</div>';
  }
  // 作品网格
  h += '<div id="stcdWorkGrid" style="flex:1;min-height:0;overflow-y:scroll;padding:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;align-content:start">';
  if (!filtered.length) {
    h += '<div style="grid-column:1/-1;font-size:11px;color:var(--fg3);text-align:center;padding:30px">该库暂无内容</div>';
  } else {
    filtered.forEach(function(it) {
      var s = 作品选择器子信息(cur.store, it);
      h += '<div class="card cur-ptr" style="padding:0;overflow:hidden;border-radius:10px;display:flex;flex-direction:column" onclick="stcdWorkPickerPick(\'' + escHtml(cur.store) + '\',\'' + escHtml(it.title) + '\')">';
      h += '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,0.03);border-bottom:1px solid var(--border)">';
      h += '<span style="font-size:18px;line-height:1">' + escHtml(s.icon) + '</span>';
      h += '<div style="font-size:12px;font-weight:600;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(s.title) + '</div>';
      h += '</div>';
      if (s.badges.length) h += '<div style="padding:6px 10px 2px;display:flex;gap:4px;flex-wrap:wrap">' + s.badges.map(function(b) { return '<span class="badge-tag">' + escHtml(b) + '</span>'; }).join('') + '</div>';
      if (s.preview) h += '<div style="padding:4px 10px 8px;font-size:10px;color:var(--fg3);line-height:1.7;max-height:48px;overflow:hidden">' + escHtml(s.preview.substring(0, 80)) + '</div>';
      h += '</div>';
    });
  }
  h += '</div>';
  // 底部
  h += '<div style="text-align:right;padding:10px 16px;border-top:1px solid var(--border);flex-shrink:0"><button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button></div>';
  h += '</div>';

  var ov = document.querySelector('.ovl[data-stcd-work-picker]');
  if (!ov) {
    ov = document.createElement('div');
    ov.className = 'ovl';
    ov.setAttribute('data-stcd-work-picker', '1');
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  }
  ov.innerHTML = h;
}

// 选中：尽力拉取原文（内容最佳），统一回调 onPick；未传 onPick 时按 mode 填入 targetId
function stcdWorkPickerPick(storeKey, title) {
  var items = STCD_WORK_PICKER.groups[storeKey] || [];
  var found = null;
  items.forEach(function(it) { if ((it.title || '未命名') === title) found = it; });
  if (!found) { toast('作品不存在'); return; }
  var label = 作品库标签(storeKey);
  var done = function(content) {
    var work = { storeKey: storeKey, storeLabel: label, title: title, item: found, content: content || '' };
    var ov = document.querySelector('.ovl[data-stcd-work-picker]');
    if (STCD_WORK_PICKER.onPick) {
      STCD_WORK_PICKER.onPick(work);
      if (ov) ov.remove();
      return;
    }
    var box = document.getElementById(STCD_WORK_PICKER.targetId);
    if (box) box.value = (content || title);
    if (ov) ov.remove();
    toast('已选择：' + title);
  };
  var direct = found.content || found.premise || found.description;
  if (direct && typeof direct === 'string') { done(String(direct).slice(0, 6000)); return; }
  var s = Store[storeKey];
  if (s && typeof s.loadContent === 'function') {
    s.loadContent(title).then(function(text) {
      if (text) { done(String(text).slice(0, 6000)); return; }
      if (typeof s.get === 'function') s.get(title).then(function(meta) { done(meta ? JSON.stringify(meta, null, 2).slice(0, 6000) : ''); }).catch(function() { done(''); });
    }).catch(function() { done(''); });
  } else {
    done('');
  }
}

window.stcdOpenWorkPicker = stcdOpenWorkPicker;
window.stcdWorkPickerBlock = stcdWorkPickerBlock;
window.stcdWorkPickerCategory = stcdWorkPickerCategory;
window.stcdWorkPickerSub = stcdWorkPickerSub;
window.stcdWorkPickerFilter = stcdWorkPickerFilter;
window.stcdWorkPickerPick = stcdWorkPickerPick;
