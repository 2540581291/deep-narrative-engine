// 生图词典 · 角色选择器弹窗（正式角色卡 / 灵感角色库 双源并行）
// 依赖：entry.js 先加载（STCD）；dict-data.js 先加载（LocalFS）；local-data.js 先加载（stcdLocalSyncCardName / stcdLocalLoadDetail）
// 供 local/batch/video/cloud 各 tab 的「从角色卡导入」按钮使用

// ===== 公共：人物框（导入正式角色卡 / 手填）=====
function stcdCharBoxHTML(charId) {
  var h = '';
  h += '<div style="margin-bottom:8px">';
  h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">';
  h += '<span style="font-size:12px;color:var(--fg2);font-weight:600">👤 人物</span>';
  h += '<span style="font-size:10px;color:var(--fg3)">可导入角色卡/灵感角色或直接手填</span>';
  h += '<div style="flex:1"></div>';
  h += '<button class="btn-out" style="padding:2px 8px;font-size:10px" onclick="stcdOpenCharPicker(\'' + charId + '\')">📂 从角色卡导入</button>';
  h += '</div>';
  h += '<textarea id="' + charId + '" class="llm-input" style="width:100%;min-height:60px;resize:vertical;font-size:11px" placeholder="点击「从角色卡导入」选角色，或直接输入人物设定"></textarea>';
  h += '</div>';
  return h;
}

// 弹窗内临时状态：来源切换 + 性别筛选 + 两个库的列表 + 目标 + 模式（fill 普通填入 / card 记录角色卡上下文）
// subScope/path：灵感角色库的浏览式选择（世界观/其他分类 + 世界观逐级下钻）
var STCD_CHAR_PICKER = { source: 'card', gender: '女性', targetId: '', cards: [], inspires: [], mode: 'fill', createdAtMap: {}, onPick: null, subScope: 'world', path: [] };

function stcdOpenCharPicker(charId, opts) {
  if (typeof Store === 'undefined' || !Store.character || typeof Store.character.list !== 'function') {
    toast('角色卡存储未就绪');
    return;
  }
  STCD_CHAR_PICKER.targetId = charId;
  STCD_CHAR_PICKER.source = 'card';
  STCD_CHAR_PICKER.gender = (opts && opts.gender) || '女性';
  STCD_CHAR_PICKER.mode = (opts && opts.card) ? 'card' : 'fill';
  STCD_CHAR_PICKER.onPick = (opts && typeof opts.onPick === 'function') ? opts.onPick : null;
  // 并行加载两个体系（正式角色卡 + 灵感角色库）
  var loadCards = Store.character.list().then(function(items) {
    STCD_CHAR_PICKER.cards = items || [];
  }).catch(function(err) {
    console.error('[生图词典] 读取角色卡失败:', err);
    STCD_CHAR_PICKER.cards = [];
  });
  var loadInspires = Promise.resolve([]);
  if (typeof STCD_INSPIRE !== 'undefined' && typeof stcdInspireLoad === 'function') {
    loadInspires = stcdInspireLoad().then(function(items) {
      STCD_CHAR_PICKER.inspires = items || [];
    }).catch(function(err) {
      console.error('[生图词典] 读取灵感角色库失败:', err);
      STCD_CHAR_PICKER.inspires = [];
    });
  } else {
    STCD_CHAR_PICKER.inspires = [];
  }
  // 读取角色卡索引：角色库排序用的是 index 里的数值 createdAt，信息文件里没有
  var loadCreated = LocalFS.readJSON('角色卡/.index.json').then(function(idx) {
    var map = {};
    if (idx && typeof idx === 'object') {
      Object.keys(idx).forEach(function(k) {
        var e = idx[k];
        if (e && e.createdAt) map[k] = e.createdAt;
      });
    }
    STCD_CHAR_PICKER.createdAtMap = map;
  }).catch(function() {
    STCD_CHAR_PICKER.createdAtMap = {};
  });
  Promise.all([loadCards, loadInspires, loadCreated]).then(function() {
    if (!STCD_CHAR_PICKER.cards.length && !STCD_CHAR_PICKER.inspires.length) {
      toast('暂无角色数据，请先在「角色卡」或「灵感角色库」创建角色');
      return;
    }
    stcdCharPickerRender();
  });
}

// 弹窗内来源切换（正式角色卡 / 灵感角色库 并行）
function stcdCharPickerSource(s) {
  STCD_CHAR_PICKER.source = s;
  stcdCharPickerRender();
}

// 弹窗内性别筛选（点击 chip 重渲染弹窗内容）
function stcdCharPickerGender(g) {
  STCD_CHAR_PICKER.gender = g;
  stcdCharPickerRender();
}

function stcdCharPickerGenderOf(bi) {
  var genderMap = { 'female': '女性', 'male': '男性', 'femboy': '伪娘', 'futa': '扶她', 'beast': '男性' };
  var rawG = bi.gender;
  return genderMap[rawG] || rawG || '未知';
}

function stcdCharPickerRender() {
  var targetId = STCD_CHAR_PICKER.targetId;
  var h = '<div class="mcard" style="width:960px;max-width:96vw;height:80vh;max-height:80vh;display:flex;flex-direction:column">';
  // 固定滚动条：右侧滚动区域始终显示滚动条，不随内容多少隐藏
  h += '<style>#stcdCharGrid,#stcdCharInspireList{overflow-y:scroll;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.25) rgba(255,255,255,0.06)}#stcdCharGrid::-webkit-scrollbar,#stcdCharInspireList::-webkit-scrollbar{width:10px;display:block}#stcdCharGrid::-webkit-scrollbar-track,#stcdCharInspireList::-webkit-scrollbar-track{background:rgba(255,255,255,0.06)}#stcdCharGrid::-webkit-scrollbar-thumb,#stcdCharInspireList::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.25);border-radius:5px}</style>';
  // 头部
  h += '<div style="display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--border);flex-shrink:0">';
  h += '<span style="font-size:15px;font-weight:600">' + (STCD_CHAR_PICKER.mode === 'card' ? '📂 导入角色卡' : '👤 导入角色到人物框') + '</span>';
  h += '<span style="font-size:11px;color:var(--fg3)">' + (STCD_CHAR_PICKER.mode === 'card' ? '选择角色作为生成上下文' : '选择角色填入人物框') + '</span>';
  h += '<div style="flex:1"></div>';
  h += '<span style="cursor:pointer;color:var(--fg3);font-size:18px" onclick="this.closest(\'.ovl\').remove()">✕</span>';
  h += '</div>';
  // 来源切换（两个体系并行）
  h += '<div style="display:flex;gap:5px;flex-wrap:wrap;padding:10px 16px;border-bottom:1px solid var(--border);flex-shrink:0">';
  h += '<span class="tag-chip' + (STCD_CHAR_PICKER.source === 'card' ? ' tag-active' : '') + '" style="cursor:pointer;font-size:10px;padding:2px 8px" onclick="stcdCharPickerSource(\'card\')">📚 正式角色卡</span>';
  h += '<span class="tag-chip' + (STCD_CHAR_PICKER.source === 'inspire' ? ' tag-active' : '') + '" style="cursor:pointer;font-size:10px;padding:2px 8px" onclick="stcdCharPickerSource(\'inspire\')">✨ 灵感角色库</span>';
  h += '</div>';
  // 主体：左侧性别栏 + 右内容
  h += '<div style="display:flex;flex:1;min-height:0">';
  if (STCD_CHAR_PICKER.source === 'card') {
    h += stcdCharPickerGenderSide();
    h += '<div style="flex:1;min-width:0;min-height:0;display:flex;flex-direction:column">';
    h += stcdCharPickerRenderCards();
    h += '</div>';
  } else {
    // 灵感角色库：采用灵感角色库模块的浏览式（世界观/其他分类 + 世界观逐级下钻）
    h += '<div style="flex:1;min-width:0;min-height:0;display:flex;flex-direction:column">';
    h += stcdCharPickerRenderInspires();
    h += '</div>';
  }
  h += '</div>';
  // 底部：取消
  h += '<div style="text-align:right;padding:10px 16px;border-top:1px solid var(--border);flex-shrink:0"><button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button></div>';
  h += '</div>';

  var ov = document.querySelector('.ovl[data-stcd-char-picker]');
  if (!ov) {
    ov = document.createElement('div');
    ov.className = 'ovl';
    ov.setAttribute('data-stcd-char-picker', '1');
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  }
  ov.innerHTML = h;
}

// 左侧性别竖栏：全部 + 4 个性别，伪娘在扶她前
function stcdCharPickerGenderSide() {
  var genders = ['全部', '女性', '男性', '伪娘', '扶她'];
  var h = '<div style="width:110px;flex-shrink:0;border-right:1px solid var(--border);padding:10px;display:flex;flex-direction:column;gap:6px">';
  genders.forEach(function(g) {
    var act = STCD_CHAR_PICKER.gender === g;
    h += '<div style="padding:10px 0;text-align:center;border-radius:8px;border:1px solid ' + (act ? 'var(--accent)' : 'var(--border)') + ';background:' + (act ? 'rgba(78,204,163,0.12)' : 'var(--bg2)') + ';color:' + (act ? 'var(--accent)' : 'var(--fg3)') + ';font-size:13px;font-weight:600;cursor:pointer;user-select:none" onclick="stcdCharPickerGender(\'' + g + '\')">' + g + '</div>';
  });
  h += '</div>';
  return h;
}

function stcdCharPickerRenderCards() {
  var items = STCD_CHAR_PICKER.cards || [];
  // 与角色库一致：按角色卡索引里的数值 createdAt 倒序
  function 角色名(c) {
    var bi = (c.identity && c.identity.basicInfo) || {};
    return bi.name || c.title || '未命名';
  }
  items = items.slice().sort(function(a, b) {
    var ca = (STCD_CHAR_PICKER.createdAtMap || {})[角色名(a)] || 0;
    var cb = (STCD_CHAR_PICKER.createdAtMap || {})[角色名(b)] || 0;
    return cb - ca;
  });
  // 性别筛选（左侧竖栏控制）
  var list = items;
  if (STCD_CHAR_PICKER.gender !== '全部') {
    list = items.filter(function(c) {
      var bi = (c.identity && c.identity.basicInfo) || {};
      return stcdCharPickerGenderOf(bi) === STCD_CHAR_PICKER.gender;
    });
  }
  var h = '';
  if (!list.length) {
    h += '<div style="flex:1;display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--fg3)">该性别暂无角色卡，请先在「角色卡」模块创建</div>';
    return h;
  }
  // 右侧卡片网格（固定显示右侧滚动条）
  h += '<div id="stcdCharGrid" style="flex:1;min-height:0;overflow-y:scroll;padding:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;align-content:start">';
  list.forEach(function(c) {
    var bi = (c.identity && c.identity.basicInfo) || {};
    var name = bi.name || c.title || '未命名';
    var genderText = stcdCharPickerGenderOf(bi);
    var ageText = bi.age ? (bi.age + '岁') : '';
    // 一句话描述：优先称号，其次简介开头；固定宽度省略，避免顶开底部档案按钮
    var descText = bi.title || '';
    var brief = (c.identity && c.identity.summary) || '';
    if (!descText && brief) {
      var m = String(brief).match(/^[^，。！？]*/);
      descText = (m && m[0]) ? m[0] : brief;
      if (descText.length > 14) descText = descText.substring(0, 14) + '…';
    }
    var icon = bi.icon || '👤';
    h += '<div data-name="' + escHtml(name) + '" style="border:1px solid var(--border);border-radius:8px;cursor:pointer;background:var(--bg2);display:flex;flex-direction:column" onclick="stcdImportChar(this,\'' + STCD_CHAR_PICKER.targetId + '\')">';
    // 顶部头像条：与角色库一致，直接显示角色 icon
    h += '<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:rgba(255,255,255,0.03);border-bottom:1px solid var(--border)">';
    h += '<span style="font-size:18px;line-height:1;flex-shrink:0">' + escHtml(icon) + '</span>';
    h += '<div style="font-size:12px;color:var(--fg);font-weight:600;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(name) + '</div>';
    h += '</div>';
    // 描述 + 年龄（固定行高/省略，防止把底部档案按钮顶下去；行高足够保证可见）
    h += '<div style="padding:6px 8px 5px">';
    h += '<div style="font-size:11px;color:var(--accent2);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;height:16px;line-height:16px">' + escHtml(descText) + '</div>';
    h += '<div style="font-size:11px;color:var(--fg3);display:block;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;height:16px;line-height:16px">' + escHtml(ageText) + '</div>';
    h += '</div>';
    // 底部档案按钮
    h += '<div style="display:flex;justify-content:flex-end;padding:4px 8px;border-top:1px solid var(--border)">';
    h += '<button class="btn-out" style="padding:1px 8px;font-size:9px" onclick="event.stopPropagation();stcdCharArchive(this)">📋 档案</button>';
    h += '</div>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}

// ===== 灵感角色库 · 浏览式选择（与灵感角色库模块一致：世界观 | 其他分类 + 世界观逐级下钻）=====
// 从角色 category（如 世界观/世界/入口/条目/级别/职位）逐级下钻，最终可导入具体角色
function stcdCharPickerSub(s) {
  STCD_CHAR_PICKER.subScope = s;
  // 除世界观（逐级下钻）外，切到典型场景/典型角色时清空下钻路径
  if (s !== 'world') STCD_CHAR_PICKER.path = [];
  stcdCharPickerRender();
}
function stcdCharPickerPathSet(idx, val) {
  var p = STCD_CHAR_PICKER.path.slice(0, idx);
  if (val) p[idx] = val;
  STCD_CHAR_PICKER.path = p;
  stcdCharPickerRender();
}
function stcdCharPickerPathBack() {
  STCD_CHAR_PICKER.path = STCD_CHAR_PICKER.path.slice(0, STCD_CHAR_PICKER.path.length - 1);
  stcdCharPickerRender();
}

// 已下钻路径的世界观角色：类别前缀匹配
function stcdInspirePickWorldChars(items, path) {
  if (path.length === 0) return items.filter(function(it) { return (it.category || '').indexOf('世界观/') === 0; });
  var prefix = '世界观/' + path.join('/');
  return items.filter(function(it) { return (it.category || '').indexOf(prefix) === 0; });
}

// 下一层可下钻的分类分段（自上而下：世界 → 入口/维度 → 条目 → 级别 → 职位）
function stcdInspirePickWorldNextSegs(items, path) {
  var segs = {};
  var prefix = '世界观/' + path.join('/');
  items.forEach(function(it) {
    var cat = it.category || '';
    if (cat.indexOf('世界观/') !== 0) return;
    if (path.length === 0) {
      var p0 = cat.split('/')[1];
      if (p0) segs[p0] = true;
    } else {
      var pf = prefix + '/';
      if (cat.indexOf(pf) !== 0) return;   // 必须比当前路径更深
      var seg = cat.slice(pf.length).split('/')[0];
      if (seg) segs[seg] = true;
    }
  });
  return Object.keys(segs);
}

// 单个可导入的灵感角色卡片（头像 + 名称 + 分类 + 版本 + 导入）
function stcdCharPickerInspireCard(it) {
  var disp = (typeof stcdInspireDisplayName === 'function') ? stcdInspireDisplayName(it) : (it.name || '未命名');
  var cat = it.category || '';
  var thumb = null;
  if (it.avatars) {
    var ord = ['normal', 'cool', 'deep'];
    for (var i = 0; i < ord.length; i++) if (it.avatars[ord[i]]) { thumb = it.avatars[ord[i]]; break; }
  }
  // 次要信息（与生图成果/灵感角色库卡片一致：头衔 · 年龄岁 · 种族，用「·」连接）
  var versionOrder = ['normal', 'cool', 'deep'];
  var nv = (it.versions && it.versions.normal) ? it.versions.normal : null;
  var age = '';
  if (it.versions) {
    for (var vi = 0; vi < versionOrder.length; vi++) {
      var av = it.versions[versionOrder[vi]];
      if (av && av.identity && av.identity.age) { age = av.identity.age; break; }
    }
  }
  var info = '';
  if (nv) {
    var 头衔 = (nv.identity && nv.identity.title) || (nv.clothing && nv.clothing.top) || '';
    var 种族 = (nv.identity && nv.identity.race) || '';
    info = [头衔, age ? (age + '岁') : '', 种族].filter(Boolean).join(' · ');
  }
  var h = '<div style="border:1px solid var(--border);border-radius:8px;background:var(--bg2);display:flex;flex-direction:column;overflow:hidden">';
  h += '<div style="height:120px;background:var(--bg);overflow:hidden;display:flex;align-items:center;justify-content:center">';
  h += thumb ? '<img src="' + thumb + '" style="width:100%;height:100%;object-fit:cover;display:block" />' : '<span style="font-size:32px;color:var(--fg3)">👤</span>';
  h += '</div>';
  h += '<div style="padding:6px 8px;border-bottom:1px solid var(--border)">';
  h += '<div style="font-size:12px;color:var(--fg);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(disp) + '</div>';
  if (info) h += '<div style="font-size:9px;color:var(--fg3);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="' + escHtml(cat) + '">' + escHtml(info) + '</div>';
  h += '</div>';
  h += '<div style="display:flex;align-items:center;gap:4px;padding:4px 8px;border-top:1px solid var(--border)">';
  h += '<select data-char-id="' + escHtml(it.id) + '" class="llm-input llm-select" style="flex:1;min-width:0;font-size:10px;padding:1px 4px">';
  ['normal', 'cool', 'deep'].forEach(function(v) {
    h += '<option value="' + v + '"' + (v === 'normal' ? ' selected' : '') + '>' + (v === 'normal' ? '正常版' : v === 'cool' ? '清凉版' : '深度版') + '</option>';
  });
  h += '</select>';
  h += '<button class="btn-out" style="padding:1px 8px;font-size:9px" onclick="stcdImportInspireChar(this,\'' + STCD_CHAR_PICKER.targetId + '\')">导入</button>';
  h += '</div>';
  h += '</div>';
  return h;
}

// 世界观区逐级下钻（世界卡片 → 层级分段 → 职位 → 角色卡片）
function stcdCharPickerWorldBrowse(items) {
  var path = STCD_CHAR_PICKER.path || [];
  var h = '';
  // 面包屑
  if (path.length) {
    h += '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px">';
    h += '<button class="btn-out" style="padding:1px 8px;font-size:10px" onclick="stcdCharPickerPathBack()">‹ 返回</button>';
    path.forEach(function(seg, i) {
      h += '<span style="font-size:11px;color:var(--fg3)">›</span>';
      h += '<span style="font-size:11px;color:var(--fg);font-weight:600;cursor:pointer;text-decoration:underline;text-decoration-style:dotted" onclick="stcdCharPickerPathSet(' + i + ',\'\')">' + escHtml(seg) + '</span>';
    });
    h += '</div>';
  }
  var segList = stcdInspirePickWorldNextSegs(items, path);
  // 顶层：已导入的世界卡片（与灵感角色库模块一致，只显示已导入世界）
  if (path.length === 0) {
    var worlds = (typeof window.STCD_INSPIRE_IMPORT_LIST !== 'undefined' && window.STCD_INSPIRE_IMPORT_LIST) ? window.STCD_INSPIRE_IMPORT_LIST : [];
    var worldNames = worlds.map(function(w) { return w.世界名; }).filter(Boolean);
    if (!worldNames.length) {
      h += '<div style="font-size:11px;color:var(--fg3);padding:20px;text-align:center">暂无已导入世界——请先到「角色卡 → 灵感角色库 → 世界观」导入世界</div>';
      return h;
    }
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px">';
    worldNames.forEach(function(w) {
      var cnt = items.filter(function(it) { return (it.category || '').indexOf('世界观/' + w + '/') === 0; }).length;
      h += '<div style="border:1px solid var(--border);border-radius:12px;padding:12px;cursor:pointer;background:var(--bg2)" onclick="stcdCharPickerPathSet(0,\'' + w + '\')">';
      h += '<div style="font-size:20px;line-height:1;margin-bottom:6px">🌍</div>';
      h += '<div style="font-size:13px;font-weight:700;margin-bottom:3px">' + escHtml(w) + '</div>';
      h += '<div style="font-size:10px;color:var(--fg3)">' + cnt + ' 角色</div>';
      h += '</div>';
    });
    h += '</div>';
    return h;
  }
  // 下钻层：分段 chips + 该节点下【所有】角色（含更深层级的职位角色）
  if (segList.length) {
    h += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">';
    segList.forEach(function(s) {
      h += '<span class="tag-chip" style="cursor:pointer;font-size:10px;padding:2px 8px" onclick="stcdCharPickerPathSet(' + path.length + ',\'' + s + '\')">' + escHtml(s) + ' ›</span>';
    });
    h += '</div>';
  }
  // 该节点下的所有角色（世界观/... 前缀匹配，含更深层级）
  var under = stcdInspirePickWorldChars(items, path);
  if (under.length) {
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px">';
    under.forEach(function(it) { h += stcdCharPickerInspireCard(it); });
    h += '</div>';
  }
  if (!segList.length && !under.length) {
    h += '<div style="font-size:11px;color:var(--fg3);padding:20px;text-align:center">该层级暂无角色</div>';
  }
  return h;
}

// 渲染灵感角色库 tab：世界观 | 其他分类 切换 + 内容
function stcdCharPickerRenderInspires() {
  // 确保「已导入的世界」列表已从磁盘加载（否则重启/首次打开「世界观」页时一直显示「暂无已导入世界」）
  if (typeof stcdInspire导入世界观加载 === 'function' && !STCD_CHAR_PICKER._inspireWorldLoaded) {
    STCD_CHAR_PICKER._inspireWorldLoaded = true;
    var _wp = stcdInspire导入世界观加载();
    if (_wp && typeof _wp.then === 'function') {
      _wp.then(function() { if (typeof stcdCharPickerRender === 'function') stcdCharPickerRender(); });
    }
  }
  var items = (typeof STCD_INSPIRE !== 'undefined' && STCD_INSPIRE.items) ? STCD_INSPIRE.items : [];
  var sub = STCD_CHAR_PICKER.subScope || 'world';
  var h = '';
  // 顶部：世界观 | 典型场景 | 典型角色 切换（与灵感角色库模块一分区一致）
  h += '<div style="display:flex;gap:5px;flex-wrap:wrap;padding:10px 16px;border-bottom:1px solid var(--border);flex-shrink:0">';
  h += '<span class="tag-chip' + (sub === 'world' ? ' tag-active' : '') + '" style="cursor:pointer;font-size:10px;padding:2px 8px" onclick="stcdCharPickerSub(\'world\')">🌌 世界观</span>';
  h += '<span class="tag-chip' + (sub === 'scene' ? ' tag-active' : '') + '" style="cursor:pointer;font-size:10px;padding:2px 8px" onclick="stcdCharPickerSub(\'scene\')">🗺️ 典型场景</span>';
  h += '<span class="tag-chip' + (sub === 'char' ? ' tag-active' : '') + '" style="cursor:pointer;font-size:10px;padding:2px 8px" onclick="stcdCharPickerSub(\'char\')">👤 典型角色</span>';
  h += '</div>';
  if (sub === 'world') {
    h += '<div style="flex:1;min-height:0;overflow-y:scroll;padding:12px">';
    h += stcdCharPickerWorldBrowse(items);
    h += '</div>';
  } else if (sub === 'scene') {
    // 典型场景：场景列表 → 点开 → 树状图下钻（复用典型场景模块的组织树，等比例缩放）
    if (STCD_CHAR_PICKER.sceneId) {
      var scene = null;
      var scs = (window.stcdScenes && window.stcdScenes.scenes) || [];
      for (var si = 0; si < scs.length; si++) { if (scs[si].id === STCD_CHAR_PICKER.sceneId) { scene = scs[si]; break; } }
      h += '<div style="flex:1;min-height:0;min-width:0;overflow-y:auto;padding:8px 10px">';
      h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap">';
      h += '<button class="btn-out" style="padding:2px 10px;font-size:11px" onclick="stcdCharPickerSceneBack()">← 场景列表</button>';
      h += '<div style="font-size:13px;font-weight:700;color:var(--fg);flex:1">🗺️ ' + (scene ? (escHtml(scene.org||'') + ' · ' + escHtml(scene.name)) : '场景') + '</div>';
      h += '<span style="font-size:10px;color:var(--fg3)">点角色卡导入</span>';
      h += '</div>';
      h += '<div style="border-radius:10px;padding:4px 2px 4px;border:1px solid var(--border);background:var(--bg2)">';
      h += '<div style="transform:scale(0.82);transform-origin:top left;width:calc(100%/0.82)">';
      if (scene && typeof window.stcdInspireSceneDetail === 'function') h += window.stcdInspireSceneDetail(scene, 'stcdCharPickerScenePick', { readOnly: true });
      else h += '<div style="font-size:11px;color:var(--fg3);padding:20px;text-align:center">场景树组件未加载</div>';
      h += '</div></div>';
      h += '</div>';
    } else {
      h += '<div style="flex:1;min-height:0;min-width:0;overflow-y:auto;padding:12px">';
      h += stcdCharPickerSceneList();
      h += '</div>';
    }
  } else {
    // 典型角色：按 category 前缀过滤
    var prefix = '典型角色/';
    var list = items.filter(function(it) { return (it.category || '').indexOf(prefix) === 0; });
    h += '<div style="flex:1;min-height:0;min-width:0;overflow-y:auto;padding:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,auto));gap:10px;align-content:start">';
    if (!list.length) {
      h += '<div style="font-size:11px;color:var(--fg3);padding:20px;grid-column:1/-1;text-align:center">典型角色暂无灵感角色</div>';
    } else {
      list.forEach(function(it) { h += stcdCharPickerInspireCard(it); });
    }
    h += '</div>';
  }
  return h;
}

// 导入正式角色卡：fill 模式填「角色卡身份与外貌」（只放身份+外貌详情）；card 模式（本地 tab）记录角色卡作为生成上下文
function stcdImportChar(el, targetId) {
  var row = el.hasAttribute('data-name') ? el : el.closest('[data-name]');
  var name = row ? row.getAttribute('data-name') : '';
  var items = STCD_CHAR_PICKER.cards || [];
  var found = null;
  for (var i = 0; i < items.length; i++) {
    var c = items[i];
    var bi = (c.identity && c.identity.basicInfo) || {};
    if ((bi.name || c.title || '未命名') === name) { found = c; break; }
  }
  if (!found) { toast('角色数据不存在'); return; }
  var ov = row ? row.closest('.ovl') : null;
  // 统一回调：其他模块通过 stcdOpenCharPicker(..., { onPick }) 使用同一个弹窗
  if (STCD_CHAR_PICKER.onPick) {
    STCD_CHAR_PICKER.onPick(found);
    if (ov) ov.remove();
    return;
  }
  if (STCD_CHAR_PICKER.mode === 'card') {
    // card 模式：仅记录角色卡，作为本地「生成提示词」时的角色上下文
    var cardJson = '';
    try { cardJson = JSON.stringify(found); } catch(e) { cardJson = ''; }
    var cardText = (typeof window.角色卡身份与外貌 === 'function') ? window.角色卡身份与外貌(found) : '';
    STCD.localCard = { name: name, json: cardJson, text: cardText, source: 'card' };
    // 换人了：清空内存方案，并从磁盘恢复该角色保存的「具体方案」
    STCD.localOptDetail = {};
    if (ov) ov.remove();
    stcdLocalSyncCardName();
    stcdLocalLoadDetail();
    toast('已导入角色卡：' + name);
    return;
  }
  var ctx = (typeof window.角色卡身份与外貌 === 'function') ? window.角色卡身份与外貌(found) : '';
  if (!ctx) { toast('该角色档案为空'); return; }
  var box = document.getElementById(targetId);
  if (box) box.value = ctx;
  if (ov) ov.remove();
  toast('已导入角色卡：' + name);
}

// 导入灵感角色：fill 模式填所选版本内容；card 模式（本地 tab）记录角色卡作为生成上下文
function stcdImportInspireChar(btn, targetId) {
  var row = btn.parentElement;
  var sel = row ? row.querySelector('select[data-char-id]') : null;
  var charId = sel ? sel.getAttribute('data-char-id') : '';
  var version = sel ? sel.value : 'normal';
  var items = STCD_CHAR_PICKER.inspires || [];
  var found = null;
  for (var i = 0; i < items.length; i++) {
    if (items[i].id === charId) { found = items[i]; break; }
  }
  if (!found) { toast('角色不存在'); return; }
  var ov = btn.closest('.ovl');
  var json = (typeof window.灵感角色全部 === 'function') ? window.灵感角色全部(found, version) : '';
  // 统一回调：其它模块通过 stcdOpenCharPicker(..., { onPick }) 使用同一个弹窗（与 stcdImportChar 一致）
  if (STCD_CHAR_PICKER.onPick) {
    STCD_CHAR_PICKER.onPick(found);
    if (ov) ov.remove();
    return;
  }
  if (STCD_CHAR_PICKER.mode === 'card') {
    // card 模式：仅记录角色卡（所选版本），作为本地「生成提示词」时的角色上下文
    var dispName = (typeof stcdInspireDisplayName === 'function') ? stcdInspireDisplayName(found) : (found.name || '未命名');
    STCD.localCard = { name: dispName, json: json || '', text: json || '', source: 'inspire', id: found.id };
    // 换人了：清空内存方案，并从磁盘恢复该角色保存的「具体方案」
    STCD.localOptDetail = {};
    if (ov) ov.remove();
    stcdLocalSyncCardName();
    stcdLocalLoadDetail();
    toast('已导入灵感角色：' + dispName);
    return;
  }
  if (!json) { toast('该版本角色内容为空'); return; }
  var box = document.getElementById(targetId);
  if (box) box.value = json;
  if (ov) ov.remove();
  toast('已导入灵感角色');
}

// ===== 全局：查看正式角色卡档案（复用「角色库/生图成果」的统一档案弹窗） =====
window.stcdCharArchive = function(el) {
  var row = el && el.closest ? el.closest('[data-name]') : null;
  var name = row ? row.getAttribute('data-name') : '';
  var items = STCD_CHAR_PICKER.cards || [];
  for (var i = 0; i < items.length; i++) {
    var c = items[i];
    var bi = (c.identity && c.identity.basicInfo) || {};
    if ((bi.name || c.title || '未命名') === name) {
      if (typeof window.角色档案函数 === 'function') {
        // 档案置顶：把 modalOverlay 移到 DOM 最后并提升 z-index，盖在当前弹窗之上
        var mOv = document.getElementById('modalOverlay');
        if (mOv) {
          mOv.style.zIndex = '10000';
          document.body.appendChild(mOv);
        }
        window.角色档案函数(c);
      } else {
        toast('完整档案组件未加载');
      }
      return;
    }
  }
  toast('角色数据不存在');
};

window.stcdOpenCharPicker = stcdOpenCharPicker;
window.stcdCharPickerSource = stcdCharPickerSource;
window.stcdCharPickerGender = stcdCharPickerGender;
window.stcdImportChar = stcdImportChar;
window.stcdImportInspireChar = stcdImportInspireChar;
window.stcdCharPickerSub = stcdCharPickerSub;
window.stcdCharPickerPathSet = stcdCharPickerPathSet;
window.stcdCharPickerPathBack = stcdCharPickerPathBack;


// ===== 导入角色弹窗 · 典型场景下钻辅助（场景列表 / 返回 / 点人导入）=====
function stcdCharPickerSceneList() {
  var scs = (window.stcdScenes && window.stcdScenes.scenes) || [];
  var h = '';
  if (!scs.length) {
    if (typeof window.stcdSceneLoad === 'function' && !(window.stcdScenes && window.stcdScenes.loaded)) {
      window.stcdSceneLoad().then(function() { if (typeof stcdCharPickerRender === 'function') stcdCharPickerRender(); });
      h += '<div style="font-size:11px;color:var(--fg3);padding:24px 0;text-align:center">典型场景加载中…</div>'; return h;
    }
    h += '<div style="font-size:11px;color:var(--fg3);padding:24px 0;text-align:center">暂无典型场景——请先到「角色卡 → 灵感角色库 → 典型场景」创建/导入场景</div>';
    return h;
  }
  h += '<div style="display:flex;flex-wrap:wrap;gap:10px">';
  scs.forEach(function(s) {
    var 标题 = (s.org ? escHtml(s.org) + ' · ' : '') + escHtml(s.name);
    h += '<div style="flex:1;min-width:200px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;cursor:pointer" onclick="stcdCharPickerSceneOpen(\'' + s.id + '\')">';
    h += '<div style="font-size:14px;font-weight:700;color:var(--fg);margin-bottom:4px">🗺️ ' + 标题 + '</div>';
    h += '<div style="font-size:10px;color:var(--fg3);line-height:1.5">' + (s.desc ? escHtml(s.desc) : '暂无简介') + '</div>';
    h += '<div style="font-size:9px;color:var(--fg3);margin-top:6px">' + stcdSceneCountPersons(s) + ' 人 · ' + ((s.levels||[]).length) + ' 层 · ' + (s.source === 'imported' ? '来自世界观' : '自定义') + '</div>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}

function stcdCharPickerSceneOpen(id) { STCD_CHAR_PICKER.sceneId = id; stcdCharPickerRender(); }
function stcdCharPickerSceneBack() { STCD_CHAR_PICKER.sceneId = null; stcdCharPickerRender(); }

// 点人卡 → 导入该灵感角色（默认 normal 版），与 stcdImportInspireChar 的填 targetId/onPick/card 逻辑一致
function stcdCharPickerScenePick(refRoleId) {
  var items = STCD_CHAR_PICKER.inspires || [];
  var found = null;
  for (var i = 0; i < items.length; i++) { if (items[i].id === refRoleId) { found = items[i]; break; } }
  if (!found) { toast('角色不存在'); return; }
  var version = 'normal';
  var json = (typeof window.灵感角色全部 === 'function') ? window.灵感角色全部(found, version) : '';
  var ov = document.querySelector('.ovl[data-stcd-char-picker]');
  if (STCD_CHAR_PICKER.onPick) {
    STCD_CHAR_PICKER.onPick(found);
    if (ov) ov.remove();
    return;
  }
  if (STCD_CHAR_PICKER.mode === 'card') {
    var dispName = (typeof stcdInspireDisplayName === 'function') ? stcdInspireDisplayName(found) : (found.name || '未命名');
    STCD.localCard = { name: dispName, json: json || '', text: json || '', source: 'inspire', id: found.id };
    STCD.localOptDetail = {};
    if (ov) ov.remove();
    if (typeof stcdLocalSyncCardName === 'function') stcdLocalSyncCardName();
    if (typeof stcdLocalLoadDetail === 'function') stcdLocalLoadDetail();
    toast('已导入灵感角色：' + dispName);
    return;
  }
  if (!json) { toast('该版本角色内容为空'); return; }
  var box = document.getElementById(STCD_CHAR_PICKER.targetId);
  if (box) box.value = json;
  if (ov) ov.remove();
  toast('已导入灵感角色');
}

window.stcdCharPickerSceneList = stcdCharPickerSceneList;
window.stcdCharPickerSceneOpen = stcdCharPickerSceneOpen;
window.stcdCharPickerSceneBack = stcdCharPickerSceneBack;
window.stcdCharPickerScenePick = stcdCharPickerScenePick;
