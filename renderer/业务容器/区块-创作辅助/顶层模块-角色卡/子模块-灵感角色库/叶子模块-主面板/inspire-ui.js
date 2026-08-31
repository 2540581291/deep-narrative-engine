// ============================================================
// ✨ 灵感角色库 · UI 层
// ⚠️ 注意：这是「灵感角色库」（简单字段角色）的界面，与主「角色卡」无关。
// 全局函数均带 stcdInspire* 前缀，勿与主角色卡混淆。
// ============================================================

var STCD_INSPIRE_VIEW = { item: null, editing: false, version: 'deep' };

// 字段结构定义在 inspire-data.js（window.STCD_INSPIRE_FIELDS，三层容器 + 枚举注释）

// ===== 顶层大分区：世界观 / 典型场景 / 典型角色（默认世界观）=====
var STCD_INSPIRE_SCOPE = { mode: 'world' };   // 'world'(世界观) | 'scene'(典型场景) | 'char'(典型角色)
// 世界观区的下钻路径（不含顶层「世界观」字面）：如 ['熟女仙界','九重天']
var STCD_INSPIRE_WORLD = { path: [] };
// 典型场景区：当前选中的场景 id 与正在下钻的节点 id（null=场景列表；否则=该节点树）
var STCD_INSPIRE_SCENE = { sceneId: null, nodeId: null };

// 世界观子级 · 主题元数据（图标 + 主题色 + 一句话 + UI 序列类型）
// layout：每个世界专属的下钻 UI 序列
//   'tier-ladder'  熟女仙界：九重天飞升阶梯（层阶横排 + 仙门/仙岛入口）
//   'land-board'  大陆棋盘 + 宗门列表
//   'pantheon-tree' 诸神神界：神系谱系树（主神 → 附属神 → 属性）
var STCD_INSPIRE_WORLD_THEMES = {
  '熟女仙界': { icon: '🌺', color: '#d946ef', layout: 'tier-ladder',
    desc: '仙气缥缈的高阶仙界，九重天层层飞升，仙门林立、寿与天齐' },
  '诸神神界': { icon: '✨', color: '#f59e0b', layout: 'pantheon-tree',
    desc: '众神栖居的神域，主神统辖万灵、附属神各司其职、神格划分属性' },
};

function stcdInspireRender(el) {
  if (!el) el = document.getElementById('stcdTabContent') || document.getElementById('inspireRoleTabContent');
  if (!el) return;
  STCD_INSPIRE_VIEW._rootEl = el;   // 记录根容器，供 scope 切换重新渲染
  var h = '';
  // 顶部：标题 + 总计数（合并为一行，无按钮/说明）
  h += stcdInspireHeader();
  // 大分区切换条（世界观 | 典型场景 | 典型角色）
  h += stcdInspireScopeBar();
  // 分区内容容器
  if (STCD_INSPIRE_SCOPE.mode === 'world') {
    // 世界观区：分类UI + 卡片网格（各自独立容器）
    h += '<div id="stcd-inspire-world" style="margin-bottom:10px"></div>';
    h += '<div id="stcd-inspire-cards" style="display:flex;flex-wrap:wrap;gap:8px"></div>';
  } else if (STCD_INSPIRE_SCOPE.mode === 'scene') {
    // 典型场景区：场景列表 + 树状下钻（独立容器，不复用卡片网格）
    h += '<div id="stcd-inspire-scenes" style="margin-bottom:10px"></div>';
  } else {
    // 典型角色区：生成面板 + 已生成列表
    h += '<div id="stcd-inspire-char" style="margin-bottom:10px"></div>';
  }
  el.innerHTML = h;
  // 世界观区需要同时加载已导入的世界列表（否则重启后导入的世界不显示）
  var loadP = stcdInspireLoad();
  if (STCD_INSPIRE_SCOPE.mode === 'world') {
    loadP = Promise.all([
      loadP,
      (typeof window.stcdInspire导入世界观加载 === 'function')
        ? window.stcdInspire导入世界观加载()
        : Promise.resolve(),
    ]);
  } else if (STCD_INSPIRE_SCOPE.mode === 'scene') {
    loadP = Promise.all([
      loadP,
      (typeof window.stcdSceneLoad === 'function') ? window.stcdSceneLoad() : Promise.resolve(),
    ]);
  }
  loadP.then(function() {
    var stats = document.getElementById('stcd-inspire-stats');
    if (stats) stats.textContent = '共 ' + STCD_INSPIRE.items.length + ' 个';
    // 分区切换条高亮
    stcdInspireRefreshScopeBar();
    // 分发渲染
    if (STCD_INSPIRE_SCOPE.mode === 'world') {
      stcdInspireRenderWorld();
      stcdInspireRenderCards();
    } else if (STCD_INSPIRE_SCOPE.mode === 'scene') {
      stcdInspireRenderScenes();
    } else {
      stcdInspireRenderCharTab();
    }
  });
}

// 顶部标题 + 总计数（简洁一行，含 AI 生成角色按钮已移除说明）
function stcdInspireHeader() {
  var h = '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:8px 12px;margin-bottom:8px;display:flex;align-items:center;gap:10px">';
  h += '<div style="font-size:14px;color:var(--fg);font-weight:700">✨ 灵感角色库</div>';
  h += '<div id="stcd-inspire-stats" style="font-size:11px;color:var(--fg3);flex:1">加载中…</div>';
  h += '<div style="font-size:9px;color:var(--fg3)">字段不可手动修改，细节请用主「角色卡」</div>';
  h += '</div>';
  return h;
}

// ===== 顶部大分区切换条（世界观 | 典型场景 | 典型角色，斜线分隔 + 配色区分）=====
function stcdInspireScopeBar() {
  var parts = [
    { m: 'world', label: '🌌 世界观', on: 'linear-gradient(135deg,#7c3aed,#312e81)' },
    { m: 'scene', label: '🗺️ 典型场景', on: 'var(--accent)' },
    { m: 'char',  label: '👤 典型角色', on: 'var(--accent2)' },
  ];
  var h = '<div data-scope-bar style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:6px;margin-bottom:10px;display:flex;overflow:hidden">';
  parts.forEach(function(p, i) {
    if (i > 0) h += '<div style="width:2px;background:linear-gradient(180deg,rgba(255,255,255,0.05),var(--fg3),rgba(255,255,255,0.05));margin:2px 0"></div>';
    var act = STCD_INSPIRE_SCOPE.mode === p.m;
    if (act) {
      h += '<div style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px 0;background:' + p.on + ';border-radius:6px;color:#fff;cursor:pointer;font-size:13px;font-weight:700">' + p.label + '</div>';
    } else {
      h += '<div style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px 0;color:var(--fg3);cursor:pointer;font-size:13px;font-weight:600" onclick="stcdInspireSetScope(\'' + p.m + '\')">' + p.label + '</div>';
    }
  });
  h += '</div>';
  return h;
}

// 刷新切换条高亮（不变整体结构，仅改选中侧样式）
function stcdInspireRefreshScopeBar() {
  // 切换条在 DOM 里，直接重新渲染更简单；标记在返回 scope bar 的父容器
  var bar = document.querySelector('[data-scope-bar]');
  if (bar) bar.outerHTML = stcdInspireScopeBar();
}

function stcdInspireSetScope(mode) {
  STCD_INSPIRE_SCOPE.mode = mode;
  if (mode === 'world') STCD_INSPIRE_WORLD.path = [];    // 进入世界观默认不预选
  if (mode === 'scene') { STCD_INSPIRE_SCENE.sceneId = null; STCD_INSPIRE_SCENE.nodeId = null; }
  var root = STCD_INSPIRE_VIEW._rootEl;
  if (root && root.innerHTML !== undefined) stcdInspireRender(root);
}

// ===== 世界观区 · 分类UI（世界卡片 + 逐层下钻）=====
// 世界观分类树从「世界观」节点往下取（categoryTree 仅剩世界观大类；典型场景走独立存储）：
//   世界观 > 熟女仙界/诸神神界 > 层天/大陆/宗门/神系 > 更细 ...
// STCD_INSPIRE_WORLD.path 存「世界观之后」的路径，如 ['熟女仙界','九重天']

// 取世界观节点（categoryTree 中 name='世界观' 的那个）
function stcdInspireWorldNode() {
  var tree = (typeof window.stcdInspireCategoryTree === 'function') ? window.stcdInspireCategoryTree() : [];
  for (var i = 0; i < tree.length; i++) {
    if (tree[i].name === '世界观') return tree[i];
  }
  return null;
}
function stcdInspireWorldChildren() {
  var nd = stcdInspireWorldNode();
  return (nd && nd.children) || [];
}

function stcdInspireRenderWorld() {
  var el = document.getElementById('stcd-inspire-world');
  if (!el) return;
  var imported = (window.STCD_INSPIRE_IMPORT_LIST) ? window.STCD_INSPIRE_IMPORT_LIST : [];
  var path = STCD_INSPIRE_WORLD.path;
  var h = '';

  // --- 顶部：只显示已导入的世界（世界观一律来自「📥 导入世界观」，去掉预设的熟女仙界/诸神神界）---
  h += '<div style="background:linear-gradient(135deg,#7c3aed22,#312e8122);border:1px solid #8b5cf6;border-radius:12px;padding:12px;margin-bottom:10px">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap">';
  h += '<div style="font-size:13px;font-weight:700;color:#c4b5fd;flex:1">🌌 世界观</div>';
  h += '<button class="btn-out" style="padding:2px 10px;font-size:11px;color:var(--accent2)" onclick="stcdInspire导入世界观弹窗()">📥 导入世界观</button>';
  h += '</div>';
  if (!imported.length) {
    h += '<div style="font-size:11px;color:var(--fg3);padding:10px 2px">还没有导入的世界——点「📥 导入世界观」从「世界观」模块导入</div>';
  } else {
    h += '<div style="display:flex;gap:10px;flex-wrap:wrap">';
    var importPalette = ['#7c3aed', '#10b981', '#f59e0b', '#e94560', '#4ecca3', '#22d3ee', '#c084fc', '#fb7185'];
    var importIcons = ['🌍', '🏭', '🌋', '🗿', '☄️', '🛸', '🏝️', '⛰️'];
    (imported || []).forEach(function(imp, ii) {
      var nm = imp.世界名 || '未命名';
      var active = path[0] === '__import__' && path[1] === nm;
      var icolor = importPalette[ii % importPalette.length];
      var iicon = (imp.icon && imp.icon !== '🌍') ? imp.icon : (importIcons[ii % importIcons.length]);
      // 只统计「地理/势力」入口（与卡片标签、五入口下钻一致）；世界设定/种族/文化/时间线仅作生成背景，不纳入条目数
      var total = 0; var 内容s = imp.内容 || {};
      ['世界地理','聚落','奇境','世俗政权','超凡势力','地下黑道','邪教淫祠','宗教神权','情色行业结社','军武集团','民间宗族'].forEach(function(k) { total += (内容s[k] || []).length; });
      var st = active
        ? 'background:' + icolor + ';color:#fff;border-color:' + icolor + ';box-shadow:0 6px 14px ' + icolor + '44'
        : 'background:' + icolor + '14;border-color:' + icolor + ';color:' + icolor;
      h += '<div style="position:relative;flex:1;min-width:180px;border:1px solid;border-radius:12px;padding:12px;cursor:pointer;' + st + '" onclick="stcdInspire导入世界下钻(\'' + nm + '\')">';
      h += '<button class="btn-out" style="position:absolute;top:6px;right:6px;padding:1px 7px;font-size:10px;color:#e06c75;cursor:pointer;z-index:2" title="删除该已导入世界" onclick="event.stopPropagation();stcdInspire删除导入世界UI(\'' + nm + '\')">🗑</button>';
      h += '<div style="font-size:20px;line-height:1;margin-bottom:6px">' + iicon + '</div>';
      h += '<div style="font-size:13px;font-weight:700;margin-bottom:3px">' + nm + '</div>';
      h += '<div style="font-size:10px;opacity:0.85;line-height:1.5">' + total + ' 条 · 地理/势力</div>';
      h += '</div>';
    });
    h += '</div>';
  }
  h += '</div>';

  // --- 已选中世界：下钻（只支持已导入的世界）---
  if (path.length && path[0] === '__import__') {
    // 已导入的世界：五入口下钻（世界地理/聚落/奇境/势力类别）
    h += stcdInspire导入世界渲染(path);
  }

  // --- 当前筛选中无角色时的提示 ---
  var count = STCD_INSPIRE.items.filter(stcdInspireWorldMatch).length;
  if (path.length && !count) {
    h += '<div style="font-size:11px;color:var(--fg3);padding:4px 0 4px 10px">该已导入世界观下暂无角色，可到角色详情弹窗用「✨ 生成」创建</div>';
  }

  el.innerHTML = h;
}

// ===== 已导入的世界 · 五入口下钻渲染 =====
// path 形如 ['__import__', 世界名] → 五入口；['__import__', 世界名, 入口] → 该入口条目列表；
// ['__import__', 世界名, 入口, 条目名] → 条目子级（可继续生成）。
function stcdInspire导入世界渲染(path) {
  var 世界名 = path[1] || '';
  var 入口 = path[2] || '';
  var 条目名 = path[3] || '';
  var list = (window.STCD_INSPIRE_IMPORT_LIST) ? window.STCD_INSPIRE_IMPORT_LIST : [];
  var imp = null;
  for (var i = 0; i < list.length; i++) if (list[i].世界名 === 世界名) { imp = list[i]; break; }
  if (!imp) return '<div style="font-size:11px;color:var(--fg3);padding:10px">找不到已导入的世界「' + escHtml(世界名) + '」</div>';
  var h = '';
  // 面包屑返回
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">';
  h += '<button class="btn-out" style="padding:2px 10px;font-size:11px" onclick="stcdInspireWorldLevel(0,\'\')">‹ 世界观</button>';
  if (入口) h += '<span style="font-size:11px;color:var(--fg3)">' + escHtml(世界名) + '</span>';
  h += '</div>';

  // ===== 已下钻到某个势力/地点条目 → 渲染该势力的「层级视图」=====
  if (条目名) {
    var itemArr = (imp.内容 && imp.内容[入口]) || [];
    var item = null, itemIdx = -1;
    for (var it = 0; it < itemArr.length; it++) if (itemArr[it]['条目'] === 条目名) { item = itemArr[it]; itemIdx = it; break; }
    if (item) return stcdInspire导入世界层级视图(世界名, 入口, item, itemIdx);
  }

  if (!入口) {
    // 入口平铺：地理三入口 + 势力全部类别（与世界观模块 世界版块表 一致，含新加的地下黑道/宗教神权等）
    var 入口表 = [
      {名:'世界地理',icon:'🌍'}, {名:'聚落',icon:'🏘️'}, {名:'奇境',icon:'🌀'},
      {名:'世俗政权',icon:'🏛️'}, {名:'超凡势力',icon:'⚔️'}, {名:'地下黑道',icon:'🕶️'},
      {名:'邪教淫祠',icon:'🩸'}, {名:'宗教神权',icon:'⛪'}, {名:'情色行业结社',icon:'🌸'}, {名:'军武集团',icon:'🛡️'}, {名:'民间宗族',icon:'🏮'},
    ];
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px">';
    入口表.forEach(function(e) {
      var cnt = (imp.内容 && imp.内容[e.名]) ? imp.内容[e.名].length : 0;
      h += '<div style="border:1px solid var(--border);border-radius:12px;padding:14px;cursor:pointer;background:var(--bg2)" onclick="stcdInspire导入世界进入入口(\'' + 世界名 + '\',\'' + e.名 + '\')">';
      h += '<div style="font-size:22px;margin-bottom:6px">' + e.icon + '</div>';
      h += '<div style="font-size:13px;font-weight:700">' + e.名 + '</div>';
      h += '<div style="font-size:10px;color:var(--fg3);margin-top:3px">' + cnt + ' 条</div>';
      h += '</div>';
    });
    h += '</div>';
    return h;
  }
  // 入口下：该入口的条目列表（可点条目进入子级/继续生成）
  var items = (imp.内容 && imp.内容[入口]) || [];
  h += '<div class="n-card" style="padding:14px">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">';
  h += '<div style="font-size:13px;font-weight:700;flex:1">' + escHtml(入口) + ' <span style="font-size:10px;color:var(--fg3);font-weight:400">' + items.length + ' 条</span></div>';
  h += '<button class="btn-main" style="padding:2px 10px;font-size:11px" onclick="stcdInspire导入世界生成(\'' + 世界名 + '\',\'' + 入口 + '\')">✨ AI 生成</button>';
  h += '</div>';
  if (!items.length) {
    h += '<div style="text-align:center;padding:22px 12px;color:var(--fg3)">还没有内容，用「✨ AI 生成」自动产出</div>';
  } else {
    h += '<div style="display:flex;flex-direction:column;gap:6px">';
    items.forEach(function(item, idx) {
      var t = item['条目'] || '条目';
      var 层级数 = (item['层级'] && item['层级'].length) ? item['层级'].length : 0;
      h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;cursor:pointer" onclick="stcdInspire导入世界进入势力(\'' + 世界名 + '\',\'' + 入口 + '\',' + idx + ')">';
      h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">';
      h += '<div style="font-size:13px;font-weight:700;color:var(--fg);flex:1">' + escHtml(t) + '</div>';
      h += '<span style="font-size:10px;color:var(--fg3)">' + (层级数 ? 层级数 + ' 层级' : '进入') + ' ›</span>';
      h += '</div>';
      if (item['详细描述']) h += '<div style="font-size:11px;color:var(--fg2);line-height:1.6">' + escHtml(item['详细描述']) + '</div>';
      h += '</div>';
    });
    h += '</div>';
  }
  h += '</div>';
  return h;
}

// ===== 已下钻到某个势力/地点条目 → 该势力的「层级视图」=====
// item['级别']：该势力内部的上下层级（如 最高层/决策层/执行层/基层...）；
//            每个级别 含 { 名称, 描述, 职位:[{名称,描述}...] }（级别下再放职位）。
// 生成角色锚定在「职位」上。
function stcdInspire导入世界层级视图(世界名, 入口, item, itemIdx) {
  var 条目名 = item['条目'] || '未命名';
  var 级别 = item['级别'] || [];
  var h = '';
  // 面包屑：返回入口
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">';
  h += '<button class="btn-out" style="padding:2px 10px;font-size:11px" onclick="stcdInspire导入世界进入入口(\'' + 世界名 + '\',\'' + 入口 + '\')">‹ 返回 ' + escHtml(入口) + '</button>';
  h += '<div style="font-size:13px;font-weight:700;flex:1">' + escHtml(条目名) + ' <span style="font-size:10px;color:var(--fg3);font-weight:400">' + 级别.length + ' 级别</span></div>';
  h += '<button class="btn-out" style="padding:2px 10px;font-size:11px" onclick="stcdInspire导入世界新增层级(\'' + 世界名 + '\',\'' + 入口 + '\',' + itemIdx + ')">＋ 新增级别</button>';
  h += '<button class="btn-out" style="padding:2px 10px;font-size:11px;color:var(--accent2)" onclick="stcdInspire导入世界生成代表人物(\'' + 世界名 + '\',\'' + 入口 + '\',' + itemIdx + ')">✦ 代表人物</button>';
  h += '<button class="btn-main" style="padding:2px 10px;font-size:11px" onclick="stcdInspire导入世界生成层级(\'' + 世界名 + '\',\'' + 入口 + '\',' + itemIdx + ')">✨ AI 生成级别</button>';
  h += '</div>';
  // 势力信息（该势力整体详情，供参考）
  if (item['详细描述']) h += '<div style="font-size:11px;color:var(--fg2);line-height:1.6;margin-bottom:10px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px">' + escHtml(item['详细描述']) + '</div>';
  // 代表人物：独立一排，锁定在层级上方，UI 与层级不同、互不影响；用与普通角色完全一致的卡片（缩略图+名称，点开3版本）
  var personaPath = '世界观/' + 世界名 + '/' + 入口 + '/' + 条目名 + '/代表人物';
  var 代表 = STCD_INSPIRE.items.filter(function(c) { return (c.category || '').indexOf(personaPath) === 0; });
  h += '<div style="background:linear-gradient(160deg,var(--accent2)22,transparent);border:1px solid var(--accent2);border-radius:10px;padding:10px;margin-bottom:12px">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">';
  h += '<div style="font-size:12px;font-weight:700;color:var(--accent2);flex:1">🧩 代表人物 <span style="font-size:10px;color:var(--fg3);font-weight:400">' + 代表.length + ' 位 · 台面人物</span></div>';
  h += '</div>';
  if (!代表.length) {
    h += '<div style="font-size:10px;color:var(--fg3)">还没有代表人物——点上面「✦ 代表人物」为「' + escHtml(条目名) + '」树立门面印象（宗主、长老、大弟子、小师妹、身怀绝技的弟子等）</div>';
  } else {
    h += '<div style="display:flex;flex-wrap:wrap;gap:8px">';
    代表.forEach(function(c) {
      var cn = stcdInspireDisplayName(c);
      var order = ['normal', 'cool', 'deep'];
      var cthumb = null;
      if (c.avatars) { for (var ti = 0; ti < order.length; ti++) if (c.avatars[order[ti]]) { cthumb = c.avatars[order[ti]]; break; } }
      var age = '';
      if (c.versions) { for (var ai = 0; ai < order.length; ai++) { var av = c.versions[order[ai]]; if (av && av.identity && av.identity.age) { age = av.identity.age; break; } } }
      var nv = null; for (var oi = 0; oi < order.length; oi++) { var vv = c.versions ? c.versions[order[oi]] : null; if (vv && vv.identity) { nv = vv; break; } }
      var summary = (nv && nv.identity && (nv.identity.title || nv.identity.style)) || '';
      h += '<div style="width:180px;background:var(--card);border:1px solid var(--border);border-radius:8px;cursor:pointer;flex-shrink:0;overflow:hidden;display:flex;flex-direction:column" onclick="stcdInspireView(\'' + c.id + '\')">';
      h += '<div style="width:100%;aspect-ratio:3/4;background:var(--bg2);overflow:hidden;position:relative">';
      h += cthumb ? '<img src="' + cthumb + '" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.style.display=\'none\'" />' : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--fg3);font-size:28px">🖼</div>';
      if (age) h += '<span style="position:absolute;bottom:6px;right:6px;background:rgba(0,0,0,0.55);color:#fff;font-size:9px;padding:1px 6px;border-radius:8px">' + escHtml(String(age).replace(/岁$/, '')) + '岁</span>';
      h += '</div>';
      h += '<div style="padding:6px 8px">';
      h += '<div style="font-size:11px;color:var(--fg);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(cn) + '</div>';
      if (summary) h += '<div style="font-size:9px;color:var(--fg3);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(summary) + '</div>';
      h += '</div></div>';
    });
    h += '</div>';
  }
  h += '</div>';
  if (!级别.length) {
    h += '<div style="text-align:center;padding:22px 12px;color:var(--fg3)">还没有级别，可「＋ 新增级别」手动添加，或用「✨ AI 生成级别」根据该势力自动生成上下层级</div>';
  } else {
    h += '<div style="display:flex;flex-direction:column;gap:8px">';
    级别.forEach(function(lv, li) {
      var 名称 = lv['名称'] || '未命名';
      var 职位 = lv['职位'] || [];
      h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px">';
      // 级别头
      h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">';
      h += '<div style="font-size:13px;font-weight:700;color:var(--fg);flex:1">' + escHtml(名称) + ' <span style="font-size:10px;color:var(--fg3);font-weight:400">' + 职位.length + ' 职位</span></div>';
      h += '<button class="btn-out" style="padding:1px 8px;font-size:9px" onclick="stcdInspire导入世界新增职位(\'' + 世界名 + '\',\'' + 入口 + '\',' + itemIdx + ',' + li + ')">＋ 职位</button>';
      h += '<button class="btn-out" style="padding:1px 8px;font-size:9px" onclick="stcdInspire导入世界生成职位(\'' + 世界名 + '\',\'' + 入口 + '\',' + itemIdx + ',' + li + ')">✨ AI 职位</button>';
      h += '<button class="btn-out" style="padding:1px 8px;font-size:9px;color:#e06c75" onclick="stcdInspire导入世界删除层级(\'' + 世界名 + '\',\'' + 入口 + '\',' + itemIdx + ',' + li + ')">🗑</button>';
      h += '</div>';
      if (lv['描述']) h += '<div style="font-size:11px;color:var(--fg2);line-height:1.6;margin-bottom:6px">' + escHtml(lv['描述']) + '</div>';
      // 职位列表
      if (!职位.length) {
        h += '<div style="font-size:10px;color:var(--fg3);padding-left:10px">该级别暂无职位，可「＋ 职位」或「✨ AI 职位」</div>';
      } else {
        职位.forEach(function(po, pi) {
          var pn = po['名称'] || '未命名';
          // 该职位下已生成的角色（按完整锚点路径过滤）
          var posPath = '世界观/' + 世界名 + '/' + 入口 + '/' + 条目名 + '/' + 名称 + '/' + pn;
          var linked = STCD_INSPIRE.items.filter(function(c) {
            return (c.category || '').indexOf(posPath) === 0;
          });
          h += '<div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px;margin-bottom:8px">';
          h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">';
          h += '<div style="font-size:12px;font-weight:600;color:var(--fg);flex:1">' + escHtml(pn) + ' <span style="font-size:9px;color:var(--fg3);font-weight:400">' + linked.length + ' 角色</span></div>';
          h += '<button class="btn-out" style="padding:1px 9px;font-size:10px" onclick="stcdInspire导入世界生成层级角色(\'' + 世界名 + '\',\'' + 入口 + '\',' + itemIdx + ',' + li + ',' + pi + ')">✨ 角色</button>';
          h += '<button class="btn-out" style="padding:1px 9px;font-size:10px;color:#e06c75" onclick="stcdInspire导入世界删除职位(\'' + 世界名 + '\',\'' + 入口 + '\',' + itemIdx + ',' + li + ',' + pi + ')">🗑</button>';
          h += '</div>';
          if (po['描述']) h += '<div style="font-size:10px;color:var(--fg2);line-height:1.5;margin-bottom:6px">' + escHtml(po['描述']) + '</div>';
          if (!linked.length) {
            h += '<div style="font-size:10px;color:var(--fg3);margin-top:4px">暂无角色——点「✨ 角色」生成</div>';
          } else {
            h += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px">';
            linked.forEach(function(c) {
              var cn = stcdInspireDisplayName(c);
              var cthumb = null;
              if (c.avatars) {
                var ord = ['normal', 'cool', 'deep'];
                for (var ti = 0; ti < ord.length; ti++) if (c.avatars[ord[ti]]) { cthumb = c.avatars[ord[ti]]; break; }
              }
              h += '<div style="width:86px;border:1px solid var(--border);border-radius:8px;overflow:hidden;cursor:pointer;background:var(--card)" onclick="stcdInspireView(\'' + c.id + '\')">';
              h += '<div style="width:100%;aspect-ratio:3/4;background:var(--bg2);overflow:hidden">';
              h += cthumb
                ? '<img src="' + cthumb + '" style="width:100%;height:100%;object-fit:cover;display:block" />'
                : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--fg3);font-size:22px">👤</div>';
              h += '</div>';
              h += '<div style="padding:4px 5px;font-size:9px;color:var(--fg);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(cn) + '</div>';
              h += '</div>';
            });
            h += '</div>';
          }
          h += '</div>';
        });
      }
      h += '</div>';
    });
    h += '</div>';
  }
  return h;
}

// 点击入口层的某个势力/地点条目 → 进入其层级视图
function stcdInspire导入世界进入势力(世界名, 入口, idx) {
  var list = (window.STCD_INSPIRE_IMPORT_LIST) ? window.STCD_INSPIRE_IMPORT_LIST : [];
  var imp = null;
  for (var i = 0; i < list.length; i++) if (list[i].世界名 === 世界名) { imp = list[i]; break; }
  if (!imp || !imp.内容 || !imp.内容[入口] || !imp.内容[入口][idx]) return;
  var 条目名 = imp.内容[入口][idx]['条目'] || '未命名';
  STCD_INSPIRE_WORLD.path = ['__import__', 世界名, 入口, 条目名];
  stcdInspireRenderWorld();
  stcdInspireRenderCards();
}
window.stcdInspire导入世界进入势力 = stcdInspire导入世界进入势力;

// 新增一个级别（空级别，含职位数组）
function stcdInspire导入世界新增层级(世界名, 入口, itemIdx) {
  var list = (window.STCD_INSPIRE_IMPORT_LIST) ? window.STCD_INSPIRE_IMPORT_LIST : [];
  var imp = null;
  for (var i = 0; i < list.length; i++) if (list[i].世界名 === 世界名) { imp = list[i]; break; }
  if (!imp || !imp.内容 || !imp.内容[入口] || !imp.内容[入口][itemIdx]) return;
  var item = imp.内容[入口][itemIdx];
  if (!item['级别']) item['级别'] = [];
  item['级别'].push({ 名称: '新级别', 描述: '', 职位: [] });
  window.stcdInspire导入世界观保存(list).then(function() {
    window.toast('已新增级别');
    var 条目名 = item['条目'] || '未命名';
    STCD_INSPIRE_WORLD.path = ['__import__', 世界名, 入口, 条目名];
    stcdInspireRenderWorld();
    stcdInspireRenderCards();
  });
}
window.stcdInspire导入世界新增层级 = stcdInspire导入世界新增层级;

// 新增一个职位（在某个级别内）
function stcdInspire导入世界新增职位(世界名, 入口, itemIdx, 级别Idx) {
  var list = (window.STCD_INSPIRE_IMPORT_LIST) ? window.STCD_INSPIRE_IMPORT_LIST : [];
  var imp = null;
  for (var i = 0; i < list.length; i++) if (list[i].世界名 === 世界名) { imp = list[i]; break; }
  if (!imp || !imp.内容 || !imp.内容[入口] || !imp.内容[入口][itemIdx]) return;
  var item = imp.内容[入口][itemIdx];
  if (!item['级别']) item['级别'] = [];
  if (!item['级别'][级别Idx]) return;
  if (!item['级别'][级别Idx]['职位']) item['级别'][级别Idx]['职位'] = [];
  item['级别'][级别Idx]['职位'].push({ 名称: '新职位', 描述: '' });
  window.stcdInspire导入世界观保存(list).then(function() {
    window.toast('已新增职位');
    var 条目名 = item['条目'] || '未命名';
    STCD_INSPIRE_WORLD.path = ['__import__', 世界名, 入口, 条目名];
    stcdInspireRenderWorld();
    stcdInspireRenderCards();
  });
}
window.stcdInspire导入世界新增职位 = stcdInspire导入世界新增职位;

// 删除某个级别（连其下职位）
function stcdInspire导入世界删除层级(世界名, 入口, itemIdx, 级别Idx) {
  var list = (window.STCD_INSPIRE_IMPORT_LIST) ? window.STCD_INSPIRE_IMPORT_LIST : [];
  var imp = null;
  for (var i = 0; i < list.length; i++) if (list[i].世界名 === 世界名) { imp = list[i]; break; }
  if (!imp || !imp.内容 || !imp.内容[入口] || !imp.内容[入口][itemIdx]) return;
  var item = imp.内容[入口][itemIdx];
  if (!item['级别'] || !item['级别'][级别Idx]) return;
  var 级别名 = item['级别'][级别Idx]['名称'] || '未命名';
  confirmDialog('确定删除级别「' + 级别名 + '」及其下所有职位？', function() {
    item['级别'].splice(级别Idx, 1);
    window.stcdInspire导入世界观保存(list).then(function() {
      window.toast('已删除级别');
      var 条目名 = item['条目'] || '未命名';
      STCD_INSPIRE_WORLD.path = ['__import__', 世界名, 入口, 条目名];
      stcdInspireRenderWorld();
      stcdInspireRenderCards();
    });
  });
}
window.stcdInspire导入世界删除层级 = stcdInspire导入世界删除层级;

// 删除某个职位
function stcdInspire导入世界删除职位(世界名, 入口, itemIdx, 级别Idx, 职位Idx) {
  var list = (window.STCD_INSPIRE_IMPORT_LIST) ? window.STCD_INSPIRE_IMPORT_LIST : [];
  var imp = null;
  for (var i = 0; i < list.length; i++) if (list[i].世界名 === 世界名) { imp = list[i]; break; }
  if (!imp || !imp.内容 || !imp.内容[入口] || !imp.内容[入口][itemIdx]) return;
  var item = imp.内容[入口][itemIdx];
  var lv = (item['级别'] || [])[级别Idx] || null;
  if (!lv || !lv['职位'] || !lv['职位'][职位Idx]) return;
  var 职位名 = lv['职位'][职位Idx]['名称'] || '未命名';
  confirmDialog('确定删除职位「' + 职位名 + '」？', function() {
    lv['职位'].splice(职位Idx, 1);
    window.stcdInspire导入世界观保存(list).then(function() {
      window.toast('已删除职位');
      var 条目名 = item['条目'] || '未命名';
      STCD_INSPIRE_WORLD.path = ['__import__', 世界名, 入口, 条目名];
      stcdInspireRenderWorld();
      stcdInspireRenderCards();
    });
  });
}
window.stcdInspire导入世界删除职位 = stcdInspire导入世界删除职位;

// AI 根据势力信息生成「级别」（上下层级，每级含职位数组）——走二元模板弹窗
function stcdInspire导入世界生成层级(世界名, 入口, itemIdx) {
  var list = (window.STCD_INSPIRE_IMPORT_LIST) ? window.STCD_INSPIRE_IMPORT_LIST : [];
  var imp = null;
  for (var i = 0; i < list.length; i++) if (list[i].世界名 === 世界名) { imp = list[i]; break; }
  if (!imp || !imp.内容 || !imp.内容[入口] || !imp.内容[入口][itemIdx]) { window.toast('找不到该势力/地点'); return; }
  var item = imp.内容[入口][itemIdx];
  var 条目名 = item['条目'] || '未命名';
  if (typeof LLM === 'undefined' || !LLM.callJSON) { window.toast('AI 系统未就绪'); return; }
  // 写入目标定位，供 stcd-inspire-level-gen 的 fillFn 写入并落盘
  STCD_INSPIRE_LVGEN = {
    世界名: 世界名, 入口: 入口, itemIdx: itemIdx, 条目名: 条目名,
    详细: (item['详细描述'] || ''), 上下文: stcdInspire导入世界上下文(世界名, '', 0),
  };
  if (typeof openAiGenPanel === 'function') openAiGenPanel('stcd-inspire-level-gen');
  else window.toast('AI 弹窗未就绪');
}
window.stcdInspire导入世界生成层级 = stcdInspire导入世界生成层级;

// 生成该势力的「台面代表人物」——独立于级别/职位，显示在层级上方的一排（走二元模板弹窗）
function stcdInspire导入世界生成代表人物(世界名, 入口, itemIdx) {
  var list = (window.STCD_INSPIRE_IMPORT_LIST) ? window.STCD_INSPIRE_IMPORT_LIST : [];
  var imp = null;
  for (var i = 0; i < list.length; i++) if (list[i].世界名 === 世界名) { imp = list[i]; break; }
  if (!imp || !imp.内容 || !imp.内容[入口] || !imp.内容[入口][itemIdx]) { window.toast('找不到该势力/地点'); return; }
  var item = imp.内容[入口][itemIdx];
  var 条目名 = item['条目'] || '未命名';
  if (typeof LLM === 'undefined' || !LLM.callJSON) { window.toast('AI 系统未就绪'); return; }
  // ① 该势力的级别/职位骨架（AI 生成代表人物时知道这个势力内部怎么分层，代表人物能对上号）
  var 详细 = (item['详细描述'] || '');
  var 级别 = item['级别'] || [];
  if (级别.length) {
    详细 += '\n\n【该势力已有级别体系（从高到低）】\n';
    级别.forEach(function(lv, li) {
      var 级别名 = (lv['名称'] || '未命名');
      var 级别描述 = (lv['描述'] || '');
      详细 += (li + 1) + '. ' + 级别名 + (级别描述 ? ('：' + 级别描述) : '') + '\n';
      var 职位 = lv['职位'] || [];
      if (职位.length) {
        职位.forEach(function(po) {
          详细 += '   - 职位：' + (po['名称'] || '未命名') + (po['描述'] ? ('（' + po['描述'] + '）') : '') + '\n';
        });
      }
    });
  }
  // ② 该势力已有代表人物（供 AI 判断身份是否已被占：代表人物可与现有重合，但不得与现有冲突）
  var personaPath = '世界观/' + 世界名 + '/' + 入口 + '/' + 条目名 + '/代表人物';
  var 已有代表 = STCD_INSPIRE.items.filter(function(c) { return (c.category || '').indexOf(personaPath) === 0; });
  var 已有名 = 已有代表.map(function(c) {
    return (typeof window.stcdInspire代表文本 === 'function') ? stcdInspire代表文本(c) : stcdInspireDisplayName(c);
  }).filter(Boolean);
  if (已有名.length) 详细 += '\n【该势力已有代表人物（代表人物可与他们重合，但**名字与身份经历不得与他们完全一样**；同一身份可有多人，但每位身份经历须彼此不同、不重复）】\n' + 已有名.join('、') + '\n';
  // ③ 世界观其余设定作背景
  var 上下文 = stcdInspire导入世界上下文(世界名, '', 0);
  上下文 = 上下文 ? ('【势力所在世界背景】\n' + 上下文) : '';
  STCD_INSPIRE_PERSONAGEN = {
    世界名: 世界名, 入口: 入口, itemIdx: itemIdx, 条目名: 条目名,
    详细: 详细, 上下文: 上下文,
  };
  if (typeof openAiGenPanel === 'function') openAiGenPanel('stcd-inspire-persona-gen');
  else window.toast('AI 弹窗未就绪');
}
window.stcdInspire导入世界生成代表人物 = stcdInspire导入世界生成代表人物;

// AI 根据某级别信息生成该级别下的职位——走二元模板弹窗
function stcdInspire导入世界生成职位(世界名, 入口, itemIdx, 级别Idx) {
  var list = (window.STCD_INSPIRE_IMPORT_LIST) ? window.STCD_INSPIRE_IMPORT_LIST : [];
  var imp = null;
  for (var i = 0; i < list.length; i++) if (list[i].世界名 === 世界名) { imp = list[i]; break; }
  if (!imp || !imp.内容 || !imp.内容[入口] || !imp.内容[入口][itemIdx]) { window.toast('找不到该势力/地点'); return; }
  var item = imp.内容[入口][itemIdx];
  var lv = (item['级别'] || [])[级别Idx] || null;
  if (!lv) { window.toast('找不到该级别'); return; }
  var 条目名 = item['条目'] || '未命名';
  if (typeof LLM === 'undefined' || !LLM.callJSON) { window.toast('AI 系统未就绪'); return; }
  // 写入目标定位，供 stcd-inspire-pos-gen 的 fillFn 写入并落盘
  STCD_INSPIRE_POSGEN = {
    世界名: 世界名, 入口: 入口, itemIdx: itemIdx, 级别Idx: 级别Idx, 条目名: 条目名,
    levelName: (lv['名称'] || ''), levelDesc: (lv['描述'] || ''),
    上下文: stcdInspire导入世界上下文(世界名, '', 0),
  };
  if (typeof openAiGenPanel === 'function') openAiGenPanel('stcd-inspire-pos-gen');
  else window.toast('AI 弹窗未就绪');
}
window.stcdInspire导入世界生成职位 = stcdInspire导入世界生成职位;

// 在该势力的某个「职位」上生成角色（势力信息最开头 + 级别·职位 + 世界观其余作上下文）
// 走二元模板弹窗（openAiGenPanel），生成后角色挂到该职位显示
function stcdInspire导入世界生成层级角色(世界名, 入口, itemIdx, 级别Idx, 职位Idx) {
  var list = (window.STCD_INSPIRE_IMPORT_LIST) ? window.STCD_INSPIRE_IMPORT_LIST : [];
  var imp = null;
  for (var i = 0; i < list.length; i++) if (list[i].世界名 === 世界名) { imp = list[i]; break; }
  if (!imp || !imp.内容 || !imp.内容[入口] || !imp.内容[入口][itemIdx]) { window.toast('找不到该势力/地点'); return; }
  var item = imp.内容[入口][itemIdx];
  var lv = (item['级别'] || [])[级别Idx] || null;
  var 职位 = (lv && lv['职位'] || [])[职位Idx] || null;
  if (!职位) { window.toast('找不到该职位'); return; }
  var 条目名 = item['条目'] || '未命名';
  var 级别名 = (lv['名称'] || '未命名');
  var 职位名 = (职位['名称'] || '未命名');
  var 世界上下文 = stcdInspire导入世界上下文(世界名, '', 0);
  // 该职位下已存在的角色（供 AI 参考，避免重复生成）
  var posPath = '世界观/' + 世界名 + '/' + 入口 + '/' + 条目名 + '/' + 级别名 + '/' + 职位名;
  var 已有 = STCD_INSPIRE.items.filter(function(c) { return (c.category || '').indexOf(posPath) === 0; });
  // ① 势力信息最开头
  var text = '【' + 入口 + '·' + 条目名 + '】' + (item['详细描述'] || '') + '\n';
  // ② 级别 + 职位
  text += '【该势力中的级别·' + 级别名 + '】' + (lv['描述'] || '') + '\n';
  text += '【在这个级别中的职位·' + 职位名 + '】' + (职位['描述'] || '') + '\n';
  // ②.5 该职位已有角色
  if (已有.length) {
    text += '\n【该职位已有角色（请勿重复）】\n';
    已有.forEach(function(c) {
      var cn = stcdInspireDisplayName(c);
      var idv = (c.versions && c.versions.normal && c.versions.normal.identity && c.versions.normal.identity.title) || '';
      text += '· ' + cn + (idv ? '（' + idv + '）' : '') + '\n';
    });
  }
  text += '\n';
  // ③ 世界观其余设定
  if (世界上下文) text += '【世界观其余设定】\n' + 世界上下文 + '\n\n';
  text += '请在这些设定基础上，为「' + 条目名 + '」中「' + 级别名 + '」级别「' + 职位名 + '」这个职位【新增】一位灵感角色。\n\n';
  text += '【要求】\n';
  if (已有.length) text += '- 必须与上面【该职位已有角色】完全不同：名称、身份、性格、经历都不得与任何已有角色重复或雷同，也不要重新生成他们本人。\n';
  text += '- 若该职位具有强唯一性（如只有一个国王、掌门、教皇、帮主、圣子），不要凭空再造一个同职能的平替；而应创作该职位体系下的其他形态人物，例如「影子国王」「前任国王」「王储」「代行」「摄政」「名义圣座」「隐世师尊」等，或与该职位紧密相关却又独立的人物。\n';
  text += '- 这是【追加】的新角色，请以独立新角色输出，不要去覆盖/替换已有角色。';
  STCD_INSPIRE_GEN.desc = text;
  STCD_INSPIRE_GEN.gender = (typeof STCD_INSPIRE_GEN.gender !== 'undefined' && STCD_INSPIRE_GEN.gender) ? STCD_INSPIRE_GEN.gender : '女';
  // 完整锚点路径：世界观/世界/入口/条目/级别/职位 —— 用于在层级视图把角色挂到对应职位
  STCD_INSPIRE_GEN.category = '世界观/' + 世界名 + '/' + 入口 + '/' + 条目名 + '/' + 级别名 + '/' + 职位名;
  STCD_INSPIRE_GEN.anchor = { 世界名: 世界名, 入口: 入口, 条目: 条目名, 级别: 级别名, 职位: 职位名 };
  STCD_INSPIRE_GEN.fromDetail = false;
  STCD_INSPIRE_GEN.posRefresh = true;
  STCD_INSPIRE_GEN.forceNew = true;   // 职位生成：一律作为新角色追加，绝不覆盖已有角色
  // 走二元模板：弹出 AI 生成方向弹窗（openAiGenPanel），确认后生成并挂回职位
  if (typeof openAiGenPanel === 'function') openAiGenPanel('stcd-inspire-gen');
  else if (typeof stcdInspireGenRun === 'function') stcdInspireGenRun();
}
window.stcdInspire导入世界生成层级角色 = stcdInspire导入世界生成层级角色;

// 点击五入口 → 进入该入口
function stcdInspire导入世界进入入口(世界名, 入口) {
  STCD_INSPIRE_WORLD.path = ['__import__', 世界名, 入口];
  stcdInspireRenderWorld();
  stcdInspireRenderCards();
}
window.stcdInspire导入世界进入入口 = stcdInspire导入世界进入入口;

// 点击导入的世界卡片 → 进入五入口
function stcdInspire导入世界下钻(世界名) {
  STCD_INSPIRE_WORLD.path = ['__import__', 世界名];
  stcdInspireRenderWorld();
  stcdInspireRenderCards();
}
window.stcdInspire导入世界下钻 = stcdInspire导入世界下钻;

// 删除已导入的世界（确认后调数据层删除并刷新世界观区）
function stcdInspire删除导入世界UI(世界名) {
  if (typeof window.stcdInspire删除导入世界观 !== 'function') { window.toast('删除功能未就绪'); return; }
  confirmDialog('确定删除已导入的世界「' + 世界名 + '」？', function() {
    window.stcdInspire删除导入世界观(世界名).then(function() {
      window.toast('已删除导入世界：' + 世界名);
      // 若正下钻在这个被删的世界，回到顶层
      if (STCD_INSPIRE_WORLD.path[0] === '__import__' && STCD_INSPIRE_WORLD.path[1] === 世界名) {
        STCD_INSPIRE_WORLD.path = [];
      }
      stcdInspireRenderWorld();
      stcdInspireRenderCards();
    }).catch(function(e) { window.toast('删除失败：' + (e && e.message ? e.message : '未知')); });
  });
}
window.stcdInspire删除导入世界UI = stcdInspire删除导入世界UI;

// 导入世界 · 某入口保留 placeholder（继续生成可在后续接入二元模板）
function stcdInspire导入世界生成(世界名, 入口) {
  window.toast('导入世界「' + 世界名 + '」的「' + 入口 + '」生成功能（后续接入二元模板）');
}
window.stcdInspire导入世界生成 = stcdInspire导入世界生成;

// 组装「世界观其余部分」作为上下文（跳过当前要生成的 入口·条目；用于角色生成背景）
// 势力/地理类条目只取「条目名 + 详细描述前20字」（与世界观模块 世界条目按版块 保持一致），其余入口全量。
function stcdInspire导入世界上下文(世界名, 跳过入口, 跳过索引) {
  var list = (window.STCD_INSPIRE_IMPORT_LIST) ? window.STCD_INSPIRE_IMPORT_LIST : [];
  var imp = null;
  for (var i = 0; i < list.length; i++) if (list[i].世界名 === 世界名) { imp = list[i]; break; }
  if (!imp || !imp.内容) return '';
  var 地理入口 = { 世界地理: 1, 聚落: 1, 奇境: 1 };
  var 势力类别 = { 世俗政权: 1, 超凡势力: 1, 地下黑道: 1, 邪教淫祠: 1, 宗教神权: 1, 情色行业结社: 1, 军武集团: 1, 民间宗族: 1 };
  var parts = [];
  Object.keys(imp.内容).forEach(function(入口) {
    if (入口 === 跳过入口) return;
    var items = imp.内容[入口] || [];
    if (!items.length) return;
    var 简述 = (地理入口[入口] || 势力类别[入口]) ? true : false;
    var line = items.map(function(x){
      var 名称 = (x['条目'] || '');
      var 描述 = (x['详细描述'] || '');
      if (简述 && 描述.length > 20) 描述 = 描述.substring(0, 20) + '…';
      return 名称 + (描述 ? '：' + 描述 : '');
    }).join('\n');
    parts.push('【' + 入口 + '】' + line);
  });
  return parts.join('\n\n');
}

// 在导入世界下钻的某条「势力/地点」节点生成角色：该势力信息放最开头 + 世界观其余内容作上下文
function stcdInspire导入世界生成角色(世界名, 入口, 条目索引) {
  var list = (window.STCD_INSPIRE_IMPORT_LIST) ? window.STCD_INSPIRE_IMPORT_LIST : [];
  var imp = null;
  for (var i = 0; i < list.length; i++) if (list[i].世界名 === 世界名) { imp = list[i]; break; }
  if (!imp || !imp.内容 || !imp.内容[入口] || !imp.内容[入口][条目索引]) { window.toast('找不到该势力/地点'); return; }
  var 条目 = imp.内容[入口][条目索引];
  var 条目名 = 条目['条目'] || '未命名';
  var 详细 = 条目['详细描述'] || '';
  // ① 势力/地点本身信息放最开头
  var text = '【' + 入口 + '·' + 条目名 + '】' + 详细 + '\n\n';
  // ② 世界观其余内容（除当前势力/地点外的其它入口）作上下文
  var 上下文 = stcdInspire导入世界上下文(世界名, 入口, 条目索引);
  if (上下文) text += '【世界观其余设定】\n' + 上下文 + '\n\n';
  text += '请在这些设定的基础上，创作一位属于「' + 条目名 + '」的灵感角色。';
  // 设置生成参数，走二元模板（inspire_char_gen）
  STCD_INSPIRE_GEN.desc = text;
  STCD_INSPIRE_GEN.gender = (typeof STCD_INSPIRE_GEN.gender !== 'undefined' && STCD_INSPIRE_GEN.gender) ? STCD_INSPIRE_GEN.gender : '女';
  STCD_INSPIRE_GEN.category = '世界观/' + 世界名 + '/' + 入口;
  STCD_INSPIRE_GEN.fromDetail = false;
  if (typeof stcdInspireGenRun === 'function') stcdInspireGenRun();
}
window.stcdInspire导入世界生成角色 = stcdInspire导入世界生成角色;

// 导入世界观弹窗：列出世界观模块的世界 → 选择导入
function stcdInspire导入世界观弹窗() {
  if (typeof window.stcdInspire可取世界列表 !== 'function') { window.toast('世界观模块未就绪'); return; }
  window.stcdInspire可取世界列表().then(function(世界s) {
    var h = '<div class="mcard" style="max-width:520px">';
    h += '<div style="font-size:14px;font-weight:700;margin-bottom:10px">📥 导入世界观（拉取地理 + 势力）</div>';
    if (!世界s.length) {
      h += '<div style="font-size:12px;color:var(--fg3);padding:16px 0;text-align:center">世界观模块暂无世界，请先去「世界观」模块创建。</div>';
    } else {
      h += '<div style="max-height:320px;overflow-y:auto;display:flex;flex-direction:column;gap:6px">';
      世界s.forEach(function(wi) {
        var nm = wi.世界名 || '未命名';
        h += '<div style="display:flex;align-items:center;gap:8px;border:1px solid var(--border);border-radius:8px;padding:8px 10px;background:var(--bg2)">';
        h += '<div style="font-size:16px">🌍</div>';
        h += '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:600">' + escHtml(nm) + '</div>';
        if (wi.简介) h += '<div style="font-size:10px;color:var(--fg3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(wi.简介) + '</div>';
        h += '</div>';
        h += '<button class="btn-main" style="padding:2px 10px;font-size:11px" onclick="stcdInspire执行导入(\'' + escHtml(nm) + '\')">导入</button>';
        h += '</div>';
      });
      h += '</div>';
    }
    h += '<div style="text-align:right;margin-top:10px"><button class="btn-out" onclick="this.closest(\'.ovl\').remove()">关闭</button></div>';
    h += '</div>';
    var ov = document.createElement('div');
    ov.className = 'ovl';
    ov.innerHTML = h;
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  });
}
window.stcdInspire导入世界观弹窗 = stcdInspire导入世界观弹窗;

// 执行导入一个世界
function stcdInspire执行导入(世界名) {
  if (typeof window.stcdInspire导入世界观 !== 'function') { window.toast('导入功能未就绪'); return; }
  window.toast('导入中…');
  window.stcdInspire导入世界观(世界名).then(function() {
    window.toast('已导入世界观: ' + 世界名);
    var ov = document.querySelector('.ovl');
    if (ov) ov.remove();
    // 刷新世界观区（清缓存并重载导入列表）
    return window.stcdInspire导入世界刷新().then(function() {
      stcdInspireRenderWorld();
    });
  }).catch(function(e) { window.toast('导入失败: ' + (e && e.message ? e.message : '未知')); });
}
window.stcdInspire执行导入 = stcdInspire执行导入;

// 刷新导入世界列表（清缓存重读）并把 STCD_INSPIRE_IMPORT_LIST 更新到 UI 用的变量
function stcdInspire导入世界刷新() {
  window.STCD_INSPIRE_IMPORT_LOADED = false;
  return window.stcdInspire导入世界观加载().then(function(list) {
    // UI 读取 stcdInspire导入世界渲染 用的是 STCD_INSPIRE_IMPORT_LIST（IIFE 变量），这里用导出的加载结果同步
    return list;
  });
}
window.stcdInspire导入世界刷新 = stcdInspire导入世界刷新;

// 世界观区匹配：角色 category 形如 '世界观/熟女仙界/九重天/...'，用「世界观之后」的路径前缀匹配
// 若 path 以 '__import__' 开头（导入的世界），则用 ['世界名', 入口, ...] 作为前缀匹配。
function stcdInspireWorldMatch(it) {
  var cat = it.category || '';
  if (cat.indexOf('世界观/') !== 0) return false;      // 非世界观角色，在世界观区不显示
  var parts = cat.split('/').slice(1);                  // 去掉「世界观」
  var path = STCD_INSPIRE_WORLD.path;
  if (!path.length) return true;                        // 未选择具体世界 → 所有世界观角色
  // 导入世界：path = ['__import__', 世界名, 入口, 条目...]；匹配前缀 [世界名, 入口, ...]
  if (path[0] === '__import__') {
    var prefix = path.slice(1);                         // [世界名, 入口, 条目...]
    if (prefix.length > parts.length) return false;
    for (var j = 0; j < prefix.length; j++) { if (prefix[j] !== parts[j]) return false; }
    return true;
  }
  if (path.length > parts.length) return false;
  for (var i = 0; i < path.length; i++) {
    if (path[i] !== parts[i]) return false;
  }
  return true;
}

// 世界观区：点击某层（idx=0 为世界层）value：''=全部/向上，其余=节点名
function stcdInspireWorldLevel(idx, value) {
  var path = STCD_INSPIRE_WORLD.path.slice(0, idx);   // 保留前 idx 层
  if (idx === 0 && value === '') { STCD_INSPIRE_WORLD.path = []; }   // 回到「不预选」
  else {
    if (value) path[idx] = value;
    // 防御：去除空洞，确保这是连续前缀
    STCD_INSPIRE_WORLD.path = path;
  }
  stcdInspireRenderWorld();
  stcdInspireRenderCards();
}

// 世界卡片层也可以一点取消回到全部：点击已选中的世界卡片时清空下钻
function stcdInspireWorldToggle(worldName) {
  if (STCD_INSPIRE_WORLD.path[0] === worldName) {
    STCD_INSPIRE_WORLD.path = [];
  } else {
    STCD_INSPIRE_WORLD.path = [worldName];
  }
  stcdInspireRenderWorld();
  stcdInspireRenderCards();
}

// ===== 世界观下钻 · 通用辅助 =====
// 从 worldNode.children 沿 subPath 逐层下钻，返回「最后一层被选中节点的 children」
function stcdInspireWorldDrillDown(worldNode, subPath) {
  if (!worldNode || !worldNode.children) return [];
  var cur = worldNode.children;
  for (var i = 0; i < subPath.length; i++) {
    var found = null;
    for (var j = 0; j < cur.length; j++) {
      if (cur[j].name === subPath[i]) { found = cur[j]; break; }
    }
    if (!found) return cur;   // 找不到 -> 停在上一层
    cur = found.children || [];
  }
  return cur;
}

// 面向 stcdInspireWorldLevel(depth, value) 的绝对深度换算：
// worldName 占 path[0]，世界下的第一级 options 对应的 depth=1 …以此类推。
// 此处 depth 与 path 下标一致（path[0]=世界名）。
// 面包屑：显示当前已选路径，点击可回到上级
function stcdInspireWorldBreadcrumb(worldName, subPath, meta) {
  var h = '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:10px">';
  h += '<span style="font-size:11px;color:' + (meta.color || 'var(--fg3)') + ';font-weight:700">' + (meta.icon || '🌍') + ' ' + worldName + '</span>';
  // 上级各层
  for (var i = 0; i < subPath.length; i++) {
    h += '<span style="color:var(--fg3);font-size:10px">›</span>';
    var label = subPath[i];
    var depth = i + 1;   // worldName 之下第一层 depth=1
    var isLast = (i === subPath.length - 1);
    if (isLast) {
      h += '<span style="font-size:11px;color:var(--fg);font-weight:600;background:var(--bg2);padding:1px 8px;border-radius:9px">' + label + '</span>';
    } else {
      h += '<span style="font-size:11px;color:var(--fg3);cursor:pointer;text-decoration:underline;text-decoration-style:dotted" onclick="stcdInspireWorldLevel(' + (depth) + ',\'\')">' + label + '</span>';
    }
  }
  h += '</div>';
  return h;
}

// ===== 熟女仙界 · 九重天飞升阶梯（tier-ladder）=====
// 结构：世界下第一级 = 九重天 / 上界仙岛 / 仙门。
//   - 九重天：特殊阶梯，子级为 9 层天，用横向进阶阶梯呈现（第1重天→第9重天），每层可点。
//   - 上界仙岛 / 仙门：常规卡片列表。
function stcdInspireWorldTierLadder(worldNode, subPath, worldName) {
  var meta = STCD_INSPIRE_WORLD_THEMES[worldName] || { color: '#d946ef', icon: '🌺' };
  var h = '';
  // 面包屑
  h += stcdInspireWorldBreadcrumb(worldName, subPath, meta);

  // 第一级维度（世界下）：九重天 / 上界仙岛 / 仙门
  var p = subPath;
  if (!p.length) {
    var dims = worldNode.children || [];
    h += '<div style="display:flex;gap:10px;flex-wrap:wrap">';
    dims.forEach(function(d) {
      var dimMeta = stcdInspireWorldDimIcon(d.name);
      var act = false;
      var st = 'flex:1;min-width:170px;border:1px solid var(--border);border-radius:12px;padding:14px;cursor:pointer;background:var(--card);display:flex;align-items:center;gap:10px';
      h += '<div style="' + st + '" onclick="stcdInspireWorldLevel(1,\'' + d.name + '\')">';
      h += '<div style="width:38px;height:38px;border-radius:10px;background:' + meta.color + '1a;color:' + meta.color + ';display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">' + (dimMeta.icon || '🗺️') + '</div>';
      h += '<div><div style="font-size:13px;font-weight:700;color:var(--fg)">' + d.name + '</div>';
      h += '<div style="font-size:10px;color:var(--fg3);margin-top:1px">' + (dimMeta.desc || ('共 ' + (d.children||[]).length + ' 项')) + '</div></div>';
      h += '</div>';
    });
    h += '</div>';
    return h;
  }

  // 已进入某一维度：九重天 → 阶梯；其余 → 子项列表
  var dimName = p[0];
  var dimChildren = stcdInspireWorldDrillDown(worldNode, [dimName]);
  var curSel = p[1] || '';
  var nextDepth = p.length + 1;   // 世界下当前待选层的下标
  if (dimName === '九重天') {
    // 天阶：9 级横向阶梯
    h += stcdInspireWorldTierSteps(dimChildren, curSel, nextDepth);
  } else {
    // 常规子项卡片
    h += '<div style="display:flex;gap:10px;flex-wrap:wrap">';
    dimChildren.forEach(function(item) {
      var act = curSel === item.name;
      var st = 'flex:1;min-width:150px;border:1px solid ' + (act ? meta.color : 'var(--border)') + ';border-radius:12px;padding:12px;cursor:pointer;' + (act ? 'background:' + meta.color + ';color:#fff' : 'background:var(--card)');
      h += '<div style="' + st + '" onclick="stcdInspireWorldLevel(' + nextDepth + ',\'' + item.name + '\')">';
      h += '<div style="font-size:12px;font-weight:700">' + item.name + '</div>';
      h += '<div style="font-size:10px;opacity:0.8;margin-top:2px">' + ((item.children||[]).length ? '深入 ' + item.children.length + ' 项' : '具体角色') + '</div>';
      h += '</div>';
    });
    h += '</div>';
  }
  return h;
}

// 九重天阶梯（横向 9 级，从低到高；选中级高亮）
function stcdInspireWorldTierSteps(children, curSel, depth) {
  var meta = STCD_INSPIRE_WORLD_THEMES['熟女仙界'] || { color: '#d946ef' };
  var steps = children && children.length ? children : [];
  // 若 children 为空（末级），直接返回
  if (!steps.length) return '';
  var h = '<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px">';
  h += '<div style="font-size:11px;font-weight:700;color:var(--fg2);margin-bottom:10px">☁️ 九重天 · 飞升阶梯</div>';
  h += '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">';
  steps.forEach(function(s, i) {
    var act = curSel === s.name;
    var st = act
      ? 'background:linear-gradient(135deg,' + meta.color + ',' + meta.color + 'cc);color:#fff;border-color:' + meta.color + ';box-shadow:0 4px 10px ' + meta.color + '44;transform:translateY(-2px)'
      : 'background:' + meta.color + '0d;border-color:' + meta.color + '55;color:' + meta.color;
    h += '<div style="flex:1;min-width:90px;border:1px solid;border-radius:10px;padding:12px 8px;text-align:center;cursor:pointer;' + st + '" onclick="stcdInspireWorldLevel(' + depth + ',\'' + s.name + '\')">';
    h += '<div style="font-size:16px;line-height:1;margin-bottom:4px">' + (i+1) + '</div>';
    h += '<div style="font-size:11px;font-weight:600">' + s.name + '</div>';
    h += '</div>';
  });
  h += '</div>';
  h += '</div>';
  return h;
}

// 维度图标/描述（九重天/上界仙岛/仙门 / 大陆/宗门/境界 / 主神/附属神/属性）
function stcdInspireWorldDimIcon(name) {
  var m = {
    '九重天': { icon: '☁️', desc: '九层天阶，层层飞升' },
    '上界仙岛': { icon: '🏝️', desc: '海外仙岛，洞天福地' },
    '仙门': { icon: '🏯', desc: '修仙宗门，弟子万千' },
    '东玄大陆': { icon: '🌄', desc: '东方武道圣地' },
    '西武大陆': { icon: '🏔️', desc: '西方武者豪强' },
    '武道境界': { icon: '📈', desc: '修为层级攀升' },
    '主神': { icon: '👑', desc: '统御神域之尊' },
    '附属神': { icon: '🕊️', desc: '各司其职的神灵' },
    '神格属性': { icon: '🔮', desc: '属性与权柄划分' },
  };
  return m[name] || { icon: '🗺️', desc: '' };
}

// ===== 大陆棋盘 + 宗门列表（land-board）=====
function stcdInspireWorldLandBoard(worldNode, subPath, worldName) {
  var meta = STCD_INSPIRE_WORLD_THEMES[worldName] || { color: '#10b981', icon: '⚔️' };
  var h = '';
  h += stcdInspireWorldBreadcrumb(worldName, subPath, meta);
  var p = subPath;
  if (!p.length) {
    // 大陆棋盘：三大板块卡片（带地图感）
    var dims = worldNode.children || [];
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px">';
    dims.forEach(function(d, i) {
      var dimMeta = stcdInspireWorldDimIcon(d.name);
      var grad = 'linear-gradient(135deg,' + meta.color + '33,' + meta.color + '11)';
      h += '<div style="border:1px solid ' + meta.color + '55;border-radius:14px;padding:16px;cursor:pointer;background:' + grad + ';position:relative;overflow:hidden" onclick="stcdInspireWorldLevel(1,\'' + d.name + '\')">';
      h += '<div style="position:absolute;top:-8px;right:-8px;font-size:46px;opacity:0.12">' + (dimMeta.icon || '🗺️') + '</div>';
      h += '<div style="font-size:24px;margin-bottom:8px">' + (dimMeta.icon || '🗺️') + '</div>';
      h += '<div style="font-size:14px;font-weight:700;color:var(--fg)">' + d.name + '</div>';
      h += '<div style="font-size:10px;color:var(--fg3);margin-top:3px;line-height:1.5">' + (dimMeta.desc || '') + '</div>';
      h += '<div style="font-size:10px;color:' + meta.color + ';margin-top:8px;font-weight:700">' + ((d.children||[]).length) + ' 宗门 / 分支 ›</div>';
      h += '</div>';
    });
    h += '</div>';
    return h;
  }
  // 已进入大陆/境界：显示其下宗门/层级列表
  var dimName = p[0];
  var dimChildren = stcdInspireWorldDrillDown(worldNode, [dimName]);
  var curSel = p[1] || '';
  var nextDepth = p.length + 1;
  var dimMeta = stcdInspireWorldDimIcon(dimName);
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:10px">';
  h += '<div style="font-size:12px;font-weight:700;color:var(--fg2);margin-bottom:8px">' + (dimMeta.icon||'') + ' ' + dimName + '</div>';
  h += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
  dimChildren.forEach(function(item) {
    var act = curSel === item.name;
    var st = act
      ? 'background:' + meta.color + ';color:#fff;border-color:' + meta.color + ';box-shadow:0 4px 10px ' + meta.color + '44'
      : 'background:' + meta.color + '0d;border-color:' + meta.color + '55;color:' + (act ? '#fff' : 'var(--fg)');
    h += '<div style="border:1px solid;border-radius:10px;padding:10px 14px;cursor:pointer;' + st + '" onclick="stcdInspireWorldLevel(' + nextDepth + ',\'' + item.name + '\')">';
    h += '<div style="font-size:12px;font-weight:700">' + item.name + '</div>';
    h += '<div style="font-size:10px;opacity:0.85;margin-top:1px">' + ((item.children||[]).length ? '深入 ' + item.children.length + ' 项' : '具体角色') + '</div>';
    h += '</div>';
  });
  h += '</div></div>';
  return h;
}

// ===== 诸神神界 · 神系谱系树（pantheon-tree）=====
function stcdInspireWorldPantheonTree(worldNode, subPath, worldName) {
  var meta = STCD_INSPIRE_WORLD_THEMES[worldName] || { color: '#f59e0b', icon: '✨' };
  var h = '';
  h += stcdInspireWorldBreadcrumb(worldName, subPath, meta);
  var p = subPath;
  if (!p.length) {
    // 谱系三条主干：主神 / 附属神 / 神格属性
    var dims = worldNode.children || [];
    h += '<div style="display:flex;gap:10px;flex-wrap:wrap">';
    dims.forEach(function(d) {
      var dimMeta = stcdInspireWorldDimIcon(d.name);
      var st = 'flex:1;min-width:200px;border:1px solid ' + meta.color + '55;border-radius:14px;padding:16px;cursor:pointer;background:linear-gradient(160deg,' + meta.color + '22,' + meta.color + '08)';
      h += '<div style="' + st + '" onclick="stcdInspireWorldLevel(1,\'' + d.name + '\')">';
      h += '<div style="font-size:22px;margin-bottom:6px">' + (dimMeta.icon||'') + '</div>';
      h += '<div style="font-size:14px;font-weight:700;color:var(--fg)">' + d.name + '</div>';
      h += '<div style="font-size:10px;color:var(--fg3);margin-top:2px">' + (dimMeta.desc||'') + '</div>';
      h += '<div style="height:14px;border-radius:2px;background:' + meta.color + '55;margin-top:10px;overflow:hidden">';
      h += '<div style="width:' + Math.min(100,(d.children||[]).length*18) + '%;height:100%;background:' + meta.color + '"></div>';
      h += '<span style="display:block;font-size:9px;color:' + meta.color + ';margin-top:4px">' + ((d.children||[]).length) + ' 位神灵</span>';
      h += '</div>';
      h += '</div>';
    });
    h += '</div>';
    return h;
  }
  // 已进入某条谱系：树状展开其下神灵
  var dimName = p[0];
  var dimChildren = stcdInspireWorldDrillDown(worldNode, [dimName]);
  var curSel = p[1] || '';
  var nextDepth = p.length + 1;
  var dimMeta = stcdInspireWorldDimIcon(dimName);
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:10px">';
  h += '<div style="font-size:12px;font-weight:700;color:var(--fg2);margin-bottom:8px">' + (dimMeta.icon||'') + ' ' + dimName + ' · 谱系</div>';
  h += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
  dimChildren.forEach(function(item) {
    var act = curSel === item.name;
    var st = act
      ? 'background:linear-gradient(135deg,' + meta.color + ',' + meta.color + 'dd);color:#fff;border-color:' + meta.color + ';box-shadow:0 4px 10px ' + meta.color + '44'
      : 'background:' + meta.color + '0d;border-color:' + meta.color + '55;color:' + (act ? '#fff' : 'var(--fg)');
    h += '<div style="border:1px solid;border-radius:12px;padding:10px 14px;cursor:pointer;display:flex;align-items:center;gap:8px;' + st + '" onclick="stcdInspireWorldLevel(' + nextDepth + ',\'' + item.name + '\')">';
    h += '<span style="font-size:16px">🪬</span>';
    h += '<div><div style="font-size:12px;font-weight:700">' + item.name + '</div>';
    h += '<div style="font-size:9px;opacity:0.85">' + ((item.children||[]).length ? '权柄 ' + item.children.length + ' 项' : '神明') + '</div></div>';
    h += '</div>';
  });
  h += '</div></div>';
  return h;
}

// ===== 「典型场景」区（树状图：场景 → 身份/名分节点 → 挂人 / 子身份节点）=====
// 场景 = 一个具体实体（丞相的家/皇帝后宫…），内部是「从上到下的树状图」。
// 节点 type：scene(根) / identity(身份/名分)；每节点含 roles[]=人id(角色)、children[]=子身份节点。
// 与世界观不同：世界观先建「级别→职位」再填角色；典型场景直接把「人」挂到身份节点上。

// 取人卡片（复用生图成果卡片样式）——点击进 3 版本详情
// 场景里的人卡片 —— 与「生图成果」卡片 UI 完全一致（180px 竖版，3:4 上图，右下角年龄角标，11px 名称 + 9px 头衔）
// 带一个删除按钮；点击卡片进完整灵感角色详情。
function stcdInspireScenePersonCard(person, sceneId, levelIdx, groupIdx, personIdx, onPickName) {
  if (!person) return '';
  var name = person.name || '未命名';
  var title = person.title || '';
  // 找到复用的完整灵感角色（取缩略图/年龄/种族）
  var role = null;
  if (person.refRoleId) role = STCD_INSPIRE.items.filter(function(x) { return x.id === person.refRoleId; })[0] || null;
  var order = ['normal', 'cool', 'deep'];
  var thumb = null, age = '', race = '';
  if (role) {
    if (role.avatars) { for (var i = 0; i < order.length; i++) if (role.avatars[order[i]]) { thumb = role.avatars[order[i]]; break; } }
    if (role.versions) {
      for (var ai = 0; ai < order.length; ai++) {
        var av = role.versions[order[ai]];
        if (!av) continue;
        if (!age && av.identity && av.identity.age) { age = av.identity.age; }
        if (!race && av.identity && av.identity.race) { race = av.identity.race; }
        if (age && race) break;
      }
    }
  }
  var openAttr = '';
  if (role) openAttr = onPickName ? ' onclick="' + onPickName + '(\'' + person.refRoleId + '\')"' : ' onclick="stcdInspireView(\'' + person.refRoleId + '\')"';
  // 与「生图成果」卡片内容区一致：下方第二行 = [头衔, 年龄岁, 种族].filter(Boolean).join(' · ')
  var info = [title, age ? (age + '岁') : '', race].filter(Boolean).join(' · ');
  var h = '<div style="width:150px;background:var(--card);border:1px solid var(--border);border-radius:8px;cursor:pointer;flex-shrink:0;overflow:hidden;display:flex;flex-direction:column"' + openAttr + '>';
  // 竖版图片区（固定比例 3:4）
  h += '<div style="width:100%;aspect-ratio:3/4;background:var(--bg2);overflow:hidden;position:relative">';
  if (thumb) {
    h += '<img src="' + thumb + '" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.style.display=\'none\'" />';
  } else {
    h += '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--fg3);font-size:28px">🖼</div>';
  }
  h += '</div>';
  // 名称 + 信息（与生图成果一致：第二行头衔·年龄·种族 用 · 连接）
  h += '<div style="padding:6px 8px">';
  h += '<div style="font-size:11px;color:var(--fg);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(name) + '</div>';
  if (info) h += '<div style="font-size:9px;color:var(--fg3);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(info) + '</div>';
  h += '</div>';
  h += '</div>';
  return h;
}

// 场景列表视图（顶层）：横幅 + 新建/AI + 场景卡片
function stcdInspireSceneList() {
  var scenes = (window.stcdScenes && window.stcdScenes.scenes) || [];
  var h = '';
  h += '<div style="background:linear-gradient(160deg,var(--accent2)22,transparent);border:1px solid var(--accent2);border-radius:12px;padding:12px;margin-bottom:10px">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap">';
  h += '<div style="font-size:13px;font-weight:700;color:var(--accent2);flex:1">🗺️ 典型场景</div>';
  h += '<button class="btn-out" style="padding:2px 10px;font-size:11px;color:var(--accent2)" onclick="stcdInspireSceneGen()">✨ AI 生成场景</button>';
  h += '<button class="btn-out" style="padding:2px 10px;font-size:11px;color:var(--accent2)" onclick="stcdInspireSceneImportDialog()">📥 从世界观导入</button>';
  h += '</div>';
  h += '<div style="font-size:10px;color:var(--fg3);margin-bottom:8px">典型场景是一个具体实体（如丞相的家、皇帝的后宫），进入后是一棵从上到下的树状图——节点是身份/名分（皇后/贵妃/派系），人挂到节点上。与世界观不同：世界观先生成级别/职位，这里直接把人挂进树。</div>';
  h += '</div>';
  if (!scenes.length) {
    h += '<div class="placeholder-text" style="text-align:center;padding:30px 0;color:var(--fg3);font-size:12px">还没有典型场景——点「✨ AI 生成场景」让 AI 建一个，或「📥 从世界观导入」</div>';
    return h;
  }
  h += '<div style="display:flex;flex-wrap:wrap;gap:8px">';
  scenes.forEach(function(s) {
    var 人数 = stcdSceneCountPersons(s);
    var 标题 = (s.org && s.org !== s.name ? escHtml(s.org) + ' · ' : '') + escHtml(s.name);
    h += '<div style="flex:1;min-width:180px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;cursor:pointer" onclick="stcdInspireSceneOpen(\'' + s.id + '\')">';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">';
    h += '<div style="font-size:13px;font-weight:700;color:var(--fg)">' + 标题 + '</div>';
    h += '<button class="btn-out" style="padding:0 6px;font-size:10px;color:#e06c75" title="删除场景" onclick="event.stopPropagation();stcdInspireSceneRemove(\'' + s.id + '\')">🗑</button>';
    h += '</div>';
    h += '<div style="font-size:10px;color:var(--fg3);line-height:1.5">' + (s.desc ? escHtml(s.desc) : '暂无简介') + '</div>';
    h += '<div style="font-size:9px;color:var(--fg3);margin-top:6px">' + 人数 + ' 人 · ' + ((s.levels||[]).length) + ' 层 · ' + (s.source === 'imported' ? '来自世界观' : '自定义') + '</div>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}

// 统计场景总人数（遍历 levels 的所有 persons）
function stcdSceneCountPersons(scene) {
  var seen = {};
  (scene.levels || []).forEach(function(lv) {
    (lv.persons || []).forEach(function(p) { seen[p.id] = true; });
    (lv.groups || []).forEach(function(g) { (g.persons || []).forEach(function(p) { seen[p.id] = true; }); });
  });
  return Object.keys(seen).length;
}

// 树状下钻视图（进入某个场景，正交连线组织架构树）
// opts.readOnly：只读模式（用于被其它模块嵌入选人/看人），隐藏返回、重命名、生成一批人、AI加一层、手动层等管理操作，
// 只渲染场景简介 + 分层人物卡；点击人物卡走 onPickName。
function stcdInspireSceneDetail(scene, onPickName, opts) {
  var readOnly = opts && opts.readOnly;
  if (!scene) return '<div style="color:var(--fg3);font-size:12px;padding:20px 0;text-align:center">场景不存在</div>';
  var h = '';
  h += stcdInspireSceneOrgCss();
  // 顶部：返回 + 场景名（仅在标题，不作为树的节点/根）+ 重命名（只读模式隐藏这一行，由宿主自带标题）
  if (!readOnly) {
    h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap">';
    h += '<button class="btn-out" style="padding:2px 10px;font-size:11px" onclick="stcdInspireSceneBack()">← 场景列表</button>';
    h += '<div style="font-size:14px;font-weight:700;color:var(--fg);flex:1">🗺️ ' + (scene.org && scene.org !== scene.name ? escHtml(scene.org) + ' · ' : '') + escHtml(scene.name) + '</div>';
    h += '<button class="btn-out" style="padding:2px 8px;font-size:10px;color:var(--accent2)" onclick="stcdInspireSceneRename(\'' + scene.id + '\')">✏️ 重命名</button>';
    h += '<button class="btn-out" style="padding:2px 8px;font-size:10px;color:var(--accent2)" onclick="stcdInspireSceneGenPersona(\'' + scene.id + '\')">🧩 代表人物</button>';
    h += '<button class="btn-out" style="padding:2px 8px;font-size:10px;color:var(--accent2)" onclick="stcdInspireSceneGenPersons(\'' + scene.id + '\')">✦ 生成一批人</button>';
    h += '<button class="btn-out" style="padding:2px 8px;font-size:10px;color:var(--accent2)" onclick="stcdInspireSceneAddLevelAI(\'' + scene.id + '\')">✨ AI 加一层</button>';
    h += '<button class="btn-out" style="padding:2px 8px;font-size:10px;color:var(--fg3)" title="只手动加一层（仅层名，不含人），不调用 AI" onclick="stcdInspireSceneAddLevel(\'' + scene.id + '\')">＋ 手动层</button>';
    h += '</div>';
  }
  if (scene.desc) h += '<div style="font-size:11px;color:var(--fg2);line-height:1.6;margin-bottom:10px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px">' + escHtml(scene.desc) + '</div>';
  // 代表人物：独立一排，锁定在层级上方（与世界观代表人物同款门面人物）
  var personaPath = '典型场景/' + (scene.name || '') + '/代表人物';
  var 代表 = STCD_INSPIRE.items.filter(function(c) { return (c.category || '').indexOf(personaPath) === 0; });
  if (代表.length || !readOnly) {
    h += '<div style="background:linear-gradient(160deg,var(--accent2)22,transparent);border:1px solid var(--accent2);border-radius:10px;padding:10px;margin-bottom:12px">';
    h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><div style="font-size:12px;font-weight:700;color:var(--accent2);flex:1">🧩 代表人物 <span style="font-size:10px;color:var(--fg3);font-weight:400">' + 代表.length + ' 位 · 台面人物</span></div></div>';
    if (!代表.length) {
      h += '<div style="font-size:10px;color:var(--fg3)">还没有代表人物——点上方「🧩 代表人物」为「' + escHtml(scene.name || '') + '」树立门面印象（宗主、首脑、大弟子、小师妹、身怀绝技的人物等）</div>';
    } else {
      var order = ['normal', 'cool', 'deep'];
      var 代表Cards = 代表.map(function(c) {
        var cn = stcdInspireDisplayName(c);
        var nv = null, age = '';
        for (var oi = 0; oi < order.length; oi++) { var vv = c.versions ? c.versions[order[oi]] : null; if (vv && vv.identity) { nv = vv; break; } }
        if (nv && nv.identity && nv.identity.age) age = nv.identity.age;
        var summary = (nv && nv.identity && (nv.identity.title || nv.identity.style)) || '';
        return '<div style="width:150px;background:var(--card);border:1px solid var(--border);border-radius:8px;cursor:pointer;flex-shrink:0;overflow:hidden;display:flex;flex-direction:column"' + (onPickName ? ' onclick="' + onPickName + '(\'' + c.id + '\')"' : ' onclick="stcdInspireView(\'' + c.id + '\')"') + '>'
          + '<div style="padding:8px"><div style="font-size:12px;color:var(--fg);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(cn) + (age ? ' <span style="color:var(--fg3);font-size:9px">' + escHtml(String(age).replace(/岁$/, '')) + '岁</span>' : '') + '</div>'
          + (summary ? '<div style="font-size:9px;color:var(--fg3);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(summary) + '</div>' : '')
          + '</div></div>';
      });
      h += '<div style="display:flex;flex-wrap:wrap;gap:8px">' + 代表Cards.join('') + '</div>';
    }
    h += '</div>';
  }
  // 无层级提示
  if (!scene.levels || !scene.levels.length) {
    h += '<div class="placeholder-text" style="text-align:center;padding:28px 0;color:var(--fg3);font-size:12px">' + (readOnly ? '这个场景还没有人' : '这个场景还没有人——点「✦ 生成一批人」让 AI 按地位级别生成整批人（名字+头衔），或「✨ AI 加一层」让 AI 生成一层及该层的人。也可「＋ 手动层」手动添加。') + '</div>';
    return h;
  }
  // 分层树状渲染：顶层是人（无根节点），每层一组人横向排，层与层之间正交连线。
  h += '<div class="sc-org-wrap">';
  h += '<div class="sc-org">';
  scene.levels.forEach(function(lv, li) {
    h += stcdInspireSceneRenderLevel(scene, lv, li, onPickName, opts);
  });
  h += '</div>';
  h += '</div>';
  return h;
}

// 渲染一层：层头 + 该层的人卡片横排（以「从上到下的地位层级」组织，层间用 CSS 连线）
// opts.readOnly：只读模式，隐藏层头「＋人/🗑」管理操作，仅展示层名、人数、人物卡。
function stcdInspireSceneRenderLevel(scene, lv, li, onPickName, opts) {
  var readOnly = opts && opts.readOnly;
  var hasGroups = (lv.groups && lv.groups.length);
  var persons = [];
  if (hasGroups) {
    lv.groups.forEach(function(g) { (g.persons || []).forEach(function(p) { persons.push({ p: p, gi: lv.groups.indexOf(g) }); }); });
  }
  (lv.persons || []).forEach(function(p) { persons.push({ p: p, gi: -1 }); });
  var h = '';
  h += '<div class="sc-tier' + (li === 0 ? ' top' : '') + '" data-idx="' + li + '">';
  // 层头
  h += '<div class="sc-tier-head">';
  h += '<span class="sc-tier-name">' + escHtml(lv.name || ('第' + (li + 1) + '层')) + '</span>';
  h += '<span class="sc-tier-cnt">' + stcdLevelPersonCount(lv) + ' 人</span>';
  if (!readOnly) {
    h += '<div class="sc-tier-ops">';
    h += '<button class="btn-out op" title="在这一层加人" onclick="stcdInspireSceneAddPerson(\'' + scene.id + '\',' + li + ')">＋人</button>';
    h += '<button class="btn-out op" title="删除这一层" onclick="stcdInspireSceneRemoveLevel(\'' + scene.id + '\',' + li + ')">🗑</button>';
    h += '</div>';
  }
  h += '</div>';
  // 层内人卡片（横向排）
  h += '<div class="sc-tier-people">';
  if (persons.length) {
    persons.forEach(function(item) {
      h += stcdInspireScenePersonCard(item.p, scene.id, li, item.gi, persons.indexOf(item), onPickName);
    });
  } else {
    h += '<div class="sc-org-empty-small">（这一层还没有人）</div>';
  }
  h += '</div>';
  h += '</div>';
  return h;
}

// 一层的人数
function stcdLevelPersonCount(lv) {
  var seen = {};
  (lv.persons || []).forEach(function(p) { seen[p.id] = true; });
  (lv.groups || []).forEach(function(g) { (g.persons || []).forEach(function(p) { seen[p.id] = true; }); });
  return Object.keys(seen).length;
}

// 场景分层树状图 CSS（注入一次，自包含，不影响其它模块）
// 组织架构图式：从上到下的地位层级，层间用正交连线，同层人横向排。顶层直接是人，无根节点。
function stcdInspireSceneOrgCss() {
  return '<style>'
    + '.sc-org-wrap{overflow-x:auto;padding:6px 2px 18px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;}'
    + '.sc-org-wrap::-webkit-scrollbar{height:8px}.sc-org-wrap::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px;}'
    + '.sc-org{display:flex;flex-direction:column;align-items:center;padding:16px 8px 4px;min-width:max-content;}'
    // ---- 层（垂直逐层，层间正交连线）----
    + '.sc-tier{display:flex;flex-direction:column;align-items:center;position:relative;}'
    + '.sc-tier:not(.top){margin-top:30px;}'
    // 层间竖线（下一层从上一层底部垂下来）
    + '.sc-tier:not(.top)::before{content:"";position:absolute;top:-30px;left:50%;transform:translateX(-50%);width:2px;height:30px;background:var(--border);}'
    // 层头
    + '.sc-tier-head{display:flex;align-items:center;gap:8px;margin-bottom:6px;background:var(--card);border:1px solid var(--border);border-left:3px solid var(--accent2);border-radius:8px;padding:4px 12px;}'
    + '.sc-tier-name{font-size:12px;font-weight:700;color:var(--accent2);}'
    + '.sc-tier-cnt{font-size:9px;color:var(--fg3);}'
    + '.sc-tier-ops{display:flex;gap:4px;margin-left:6px;}'
    + '.sc-tier-ops .op{font-size:9px;padding:1px 5px;line-height:1;color:var(--accent2);}'
    // ---- 该层的人卡片（横排）----
    + '.sc-tier-people{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;position:relative;}'
    + '.sc-org-empty-small{font-size:9px;color:var(--fg3);line-height:1.4;padding:10px;}'
    + '</style>';
}

// ============ 典型角色 tab（生成面板 + 已生成列表）============
// 典型角色 = 复用灵感角色体系（STCD_INSPIRE.items），category 以「典型角色/」开头。
// 宗旨：通过参考生成/深化单个角色——可导入已有角色卡做深化，或混搭多卡提取优秀设定，让角色有血有肉。

function stcdInspireRenderCharTab() {
  var el = document.getElementById('stcd-inspire-char');
  if (!el) return;
  if (STCD_INSPIRE_CHAR_VIEW.mode === 'studio') { el.innerHTML = stcdInspireRenderCharStudio(); return; }
  var h = '';
  // 生成面板
  h += '<div style="background:linear-gradient(160deg,var(--accent2)22,transparent);border:1px solid var(--accent2);border-radius:12px;padding:12px;margin-bottom:10px">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">';
  h += '<div style="font-size:13px;font-weight:700;color:var(--accent2);flex:1">👤 典型角色</div>';
  h += '<button class="btn-main" style="padding:2px 12px;font-size:11px;color:#fff" onclick="stcdInspireCharOpenStudio()">✦ 进入创作台</button>';
  h += '</div>';
  h += '<div style="font-size:10px;color:var(--fg3);line-height:1.6">这里是让单个角色「有血有肉」的地方——专注一人，极大丰富其性格与经历。进创作台：多卡生成（读参考凭灵感原创）/ 深化已有 / 多卡混搭（融合多卡）。</div>';
  h += '</div>';
  // 已生成列表
  var chars = STCD_INSPIRE.items.filter(function(it) { return (it.category || '').indexOf('典型角色/') === 0; });
  if (!chars.length) {
    h += '<div class="placeholder-text" style="text-align:center;padding:28px 0;color:var(--fg3);font-size:12px">还没有典型角色——点「✦ 进入创作台」创作一个</div>';
  } else {
    h += '<div style="font-size:12px;font-weight:700;color:var(--fg);margin-bottom:8px">已生成 ' + chars.length + ' 个典型角色</div>';
    h += '<div style="display:flex;flex-wrap:wrap;gap:8px">';
    chars.forEach(function(it) { h += stcdInspireCharCard(it); });
    h += '</div>';
  }
  el.innerHTML = h;
}

// 进入/退出典型角色创作台
function stcdInspireCharOpenStudio() {
  STCD_INSPIRE_CHAR_VIEW.mode = 'studio';
  if (typeof stcdInspireRenderCharTab === 'function') stcdInspireRenderCharTab();
}
function stcdInspireCharCloseStudio() {
  STCD_INSPIRE_CHAR_VIEW.mode = 'list';
  if (typeof stcdInspireRenderCharTab === 'function') stcdInspireRenderCharTab();
}

// 典型角色 · 创作台（独立界面：左侧设置面板 + 右侧说明/预览；选项全面）
function stcdInspireRenderCharStudio() {
  var g = STCD_INSPIRE_CHARGEN || {};
  var mode = g.mode || 'gen';
  var h = '';
  h += '<style>.chg-studio input[type=text],.chg-studio textarea{background:var(--bg2);border:1px solid var(--border);color:var(--fg);padding:6px 10px;font-size:12px;border-radius:6px;outline:none;width:100%;box-sizing:border-box}.chg-studio select{background:var(--bg2);border:1px solid var(--border);color:var(--fg);padding:5px 8px;font-size:12px;border-radius:6px;outline:none}.chg-chip{display:inline-flex;align-items:center;gap:3px;padding:3px 10px;font-size:11px;background:var(--bg2);border:1px solid var(--border);border-radius:14px;cursor:pointer;user-select:none;color:var(--fg2)}.chg-chip.on{background:var(--accent);color:#fff;border-color:var(--accent)}</style>';
  // 顶部栏：返回 + 标题
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">';
  h += '<button class="btn-out" style="padding:2px 10px;font-size:11px" onclick="stcdInspireCharCloseStudio()">← 返回</button>';
  h += '<div style="font-size:14px;font-weight:700;color:var(--accent2);flex:1">👤 典型角色创作台</div>';
  h += '</div>';
  // 主体两栏
  h += '<div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap">';
  // 左栏 · 设置
  h += '<div class="chg-studio" style="flex:2;min-width:400px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px">';
  // 1) 模式
  h += '<div style="margin-bottom:12px"><div style="font-size:12px;color:var(--fg2);font-weight:600;margin-bottom:6px">① 创作模式</div>';
  h += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
  h += '<span class="chg-chip' + (mode==='gen'?' on':'') + '" onclick="stcdInspireCharSetMode(\'gen\',this)" data-mode="gen">💡 多卡生成</span>';
  h += '<span class="chg-chip' + (mode==='mix'?' on':'') + '" onclick="stcdInspireCharSetMode(\'mix\',this)" data-mode="mix">🎨 多卡混搭</span>';
  h += '<span class="chg-chip' + (mode==='deep'?' on':'') + '" onclick="stcdInspireCharSetMode(\'deep\',this)" data-mode="deep">🧩 深化已有</span>';
  h += '</div></div>';
  // 2) 角色名
  h += '<div style="margin-bottom:12px"><label style="font-size:12px;color:var(--fg2);font-weight:600;display:block;margin-bottom:4px">② 新角色名（可留空，AI 自拟真实人名）</label>';
  h += '<input id="chg-name" type="text" placeholder="如 徐清婉；留空则 AI 起名" value="' + escHtml(g.name||'') + '" /></div>';
  // 3) 性别
  h += '<div style="margin-bottom:12px"><label style="font-size:12px;color:var(--fg2);font-weight:600;display:block;margin-bottom:4px">③ 性别</label>';
  h += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
  ['女','男','扶她','伪娘'].forEach(function(gv){ h += '<span class="chg-chip'+(g.gender===gv?' on':'')+'" onclick="stcdInspireCharSetGender(this,\''+gv+'\')">'+gv+'</span>'; });
  h += '</div></div>';
  // 4) 年龄倾向
  h += '<div style="margin-bottom:12px"><label style="font-size:12px;color:var(--fg2);font-weight:600;display:block;margin-bottom:4px">④ 年龄倾向（视觉年龄）</label>';
  h += '<select id="chg-agetend"><option value="">不限定</option><option value="幼年"'+((g.ageTend||'')==='幼年'?' selected':'')+'>幼年 / 稚嫩</option><option value="少女"'+((g.ageTend||'')==='少女'?' selected':'')+'>少女</option><option value="少妇"'+((g.ageTend||'')==='少妇'?' selected':'')+'>青年 / 少妇</option><option value="成熟"'+((g.ageTend||'')==='成熟'?' selected':'')+'>成熟 / 风韵</option></select></div>';
  // 5) 风格标签
  h += '<div style="margin-bottom:12px"><label style="font-size:12px;color:var(--fg2);font-weight:600;display:block;margin-bottom:4px">⑤ 风格 / 题材标签（可多选）</label>';
  h += '<div id="chg-style" style="display:flex;gap:5px;flex-wrap:wrap">';
  var styles = ['古风','仙侠','江湖','现代','民国','暗黑','清冷','妖娆','温婉','英气','制服','青楼'];
  styles.forEach(function(s){ var on = ((g.styleTags||'').indexOf(s) >= 0); h += '<span class="chg-chip'+(on?' on':'')+'" data-style="'+s+'" onclick="stcdInspireCharToggleStyle(this)">'+s+'</span>'; });
  h += '</div></div>';
  // 6) 人物塑造要点（可多选）——典型角色重性格/经历，这里选塑造重点
  h += '<div style="margin-bottom:12px"><label style="font-size:12px;color:var(--fg2);font-weight:600;display:block;margin-bottom:4px">⑥ 人物塑造要点（可多选，引导 AI 往哪里写）</label>';
  h += '<div id="chg-traits" style="display:flex;gap:5px;flex-wrap:wrap">';
  var traits = ['执念','反差','黑化','救赎','内心矛盾','欲望','宿命','成长','孤独','重情'];
  traits.forEach(function(s){ var on = ((g.traits||'').indexOf(s) >= 0); h += '<span class="chg-chip'+(on?' on':'')+'" data-trait="'+s+'" onclick="stcdInspireCharToggleTrait(this)">'+s+'</span>'; });
  h += '</div></div>';
  // 7) 参考角色区（按模式变化）
  h += '<div style="margin-bottom:12px"><div style="font-size:12px;color:var(--fg2);font-weight:600;margin-bottom:6px">⑦ ' + (mode==='deep' ? '要深化的基座 + 参考' : '参考角色（可导入多张，独立于要求）') + '</div>';
  h += '<div id="chg-ref-zone">' + stcdInspireCharRefZoneHtml(mode) + '</div></div>';
  // 8) 你的要求
  h += '<div style="margin-bottom:12px"><label style="font-size:12px;color:var(--fg2);font-weight:600;display:block;margin-bottom:4px">⑧ 你的要求（纯粹放你的创作要求/描述）</label>';
  h += '<textarea id="chg-ref" placeholder="写你的要求，如：把她学刺绣的执着、与表兄的纠葛、婚后苦闷写得更血肉丰满">' + escHtml(g.ref||'') + '</textarea></div>';
  // 生成按钮
  h += '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px"><button class="btn-main" style="color:#fff" onclick="stcdInspireCharStudioGenerate()">🎯 生成</button></div>';
  h += '</div>';
  // 右栏 · 说明
  h += '<div style="flex:1;min-width:240px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px;font-size:11px;color:var(--fg2);line-height:1.7">';
  h += '<div style="font-size:13px;font-weight:700;color:var(--accent2);margin-bottom:8px">✦ 模式说明</div>';
  h += '<div id="chg-mode-note" style="white-space:pre-line">' + stcdInspireCharModeNote(mode) + '</div>';
  h += '</div>';
  h += '</div>';
  return h;
}

// 模式说明文字
function stcdInspireCharModeNote(mode) {
  if (mode === 'deep') return '🧩 深化已有：导入一个【要深化的基座角色】，把 TA 挖得更立体——性格、执念、成长、内心矛盾、关系纠葛，写成人。';
  if (mode === 'mix') return '🎨 多卡混搭：把多张参考角色的经历/特征/性爱风格【融合】进同一人——关公战秦琼式同人合体写法。';
  return '💡 多卡生成：读多张参考角色找感觉、吸收内核，然后凭灵感【原创】一个全新的独立角色（不是复刻、不是融合）。';
}

// 参考角色区（按模式变化）
function stcdInspireCharRefZoneHtml(mode) {
  if (mode === 'deep') {
    return '<div style="margin-bottom:8px"><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">'
      + '<span style="font-size:11px;color:var(--fg2)">要深化的基座（导入一个）</span>'
      + '<button type="button" class="btn-out" style="padding:2px 8px;font-size:10px;color:var(--accent2)" onclick="stcdInspireCharPickBase()">📂 导入</button>'
      + '<button type="button" class="btn-out" style="padding:2px 8px;font-size:10px;color:var(--accent2)" onclick="stcdInspireCharClearBase()">🗑 清空</button></div>'
      + '<div id="chg-base" style="display:flex;flex-direction:column;gap:5px">' + stcdInspireCharBaseHtml() + '</div></div>'
      + '<div><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">'
      + '<span style="font-size:11px;color:var(--fg2)">参考角色（多选）</span>'
      + '<button type="button" class="btn-out" style="padding:2px 8px;font-size:10px;color:var(--accent2)" onclick="stcdInspireCharPickBaseRef()">📂 导入</button>'
      + '<button type="button" class="btn-out" style="padding:2px 8px;font-size:10px;color:var(--accent2)" onclick="stcdInspireCharClearBaseRefs()">🗑 清空</button></div>'
      + '<div id="chg-base-refs" style="display:flex;flex-direction:column;gap:5px;max-height:150px;overflow-y:auto">' + stcdInspireCharBaseRefsHtml() + '</div></div>';
  }
  return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">'
    + '<span style="font-size:11px;color:var(--fg2)">参考角色（可导入多张）</span>'
    + '<button type="button" class="btn-out" style="padding:2px 8px;font-size:10px;color:var(--accent2)" onclick="stcdInspireCharPickRef()">📂 导入</button>'
    + '<button type="button" class="btn-out" style="padding:2px 8px;font-size:10px;color:var(--accent2)" onclick="stcdInspireCharClearRefs()">🗑 清空</button></div>'
    + '<div id="chg-refs" style="display:flex;flex-direction:column;gap:5px;max-height:180px;overflow-y:auto">' + stcdInspireCharRefsHtml() + '</div>';
}

// 性别 chip 切换
function stcdInspireCharSetGender(el, val) {
  STCD_INSPIRE_CHARGEN = STCD_INSPIRE_CHARGEN || {};
  STCD_INSPIRE_CHARGEN.gender = val;
  var wrap = el.parentNode;
  var cps = wrap.querySelectorAll('.chg-chip');
  for (var i = 0; i < cps.length; i++) cps[i].classList.remove('on');
  el.classList.add('on');
}
// 风格标签切换（多选）
function stcdInspireCharToggleStyle(el) {
  var s = el.getAttribute('data-style');
  STCD_INSPIRE_CHARGEN = STCD_INSPIRE_CHARGEN || {};
  var arr = (STCD_INSPIRE_CHARGEN.styleTags || '').split(',').filter(Boolean);
  if (arr.indexOf(s) >= 0) { arr.splice(arr.indexOf(s), 1); el.classList.remove('on'); }
  else { arr.push(s); el.classList.add('on'); }
  STCD_INSPIRE_CHARGEN.styleTags = arr.join(',');
}

// 创作台 · 生成：收集表单 → 先生成 5 个候选选项 → 用户选一个 → 正式生成
function stcdInspireCharStudioGenerate() {
  var name = (document.getElementById('chg-name') ? document.getElementById('chg-name').value : '').trim();
  var req = (document.getElementById('chg-ref') ? document.getElementById('chg-ref').value : '').trim();
  var ageTend = (document.getElementById('chg-agetend') ? document.getElementById('chg-agetend').value : '');
  var m = (window.STCD_INSPIRE_CHARGEN && STCD_INSPIRE_CHARGEN.mode) || 'gen';
  var refParts = [];
  if (req) refParts.push(req);
  if (m === 'deep') {
    if (STCD_INSPIRE_CHAR_BASE) { var bt = stcdInspireCharRefText(STCD_INSPIRE_CHAR_BASE); if (bt) refParts.push('[要深化的角色]\n' + bt); }
    (STCD_INSPIRE_CHAR_BASE_REFS || []).forEach(function(found){ var t = stcdInspireCharRefText(found); if (t) refParts.push('[参考角色]\n' + t); });
  } else {
    (STCD_INSPIRE_CHAR_REFS || []).forEach(function(found){ var t = stcdInspireCharRefText(found); if (t) refParts.push('[参考角色]\n' + t); });
  }
  STCD_INSPIRE_CHARGEN = { name: name, ref: refParts.join('\n\n'), mode: m, gender: (STCD_INSPIRE_CHARGEN.gender || '女'), ageTend: ageTend, styleTags: (STCD_INSPIRE_CHARGEN.styleTags || ''), traits: (STCD_INSPIRE_CHARGEN.traits || '') };
  stcdInspireCharGenOptions();   // 第一步：先生成候选选项
}

// 第一步：生成 5 个候选选项概要（走二元模板 stcd-inspire-char-options）
function stcdInspireCharGenOptions() {
  if (typeof getFieldInfo !== 'function' || typeof renderPrompt !== 'function' || typeof LLM === 'undefined' || !LLM.callJSON) { toast('AI 系统未就绪'); return; }
  var fi = getFieldInfo('stcd-inspire-char-options');
  if (!fi) { toast('AI 字段未就绪'); return; }
  var vars = fi.vars || {};
  // 深化已有：用专属的【深化方向】候选模板（保留基座）；其余模式走通用创作候选模板
  var mode = (window.STCD_INSPIRE_CHARGEN && STCD_INSPIRE_CHARGEN.mode) || 'gen';
  var promptName = (mode === 'deep') ? 'inspire_char_deep_options' : 'inspire_char_options';
  toast(mode === 'deep' ? '正在生成深化方向…' : '正在生成候选选项…');
  var rendered = renderPrompt(promptName, Object.assign({ text: '' }, vars));
  if (!rendered.user) { toast('模板渲染失败'); return; }
  LLM.callJSON({ label: '典型角色候选', system: rendered.system, prompt: rendered.user }).then(function(d) {
    if (typeof fi.fillFn === 'function') fi.fillFn(d);
    else toast('候选生成完成（无展示函数）');
  }).catch(function(e) { toast('候选生成失败：' + (e && e.message ? e.message : '未知')); });
}

// 展示 5 个候选选卡，用户点选一个 → 正式生成
function stcdInspireCharShowOptions(d) {
  var opts = (d && Array.isArray(d.options)) ? d.options : (Array.isArray(d) ? d : []);
  if (!opts.length) { toast('候选生成结果为空'); return; }
  var isDeep = (window.STCD_INSPIRE_CHARGEN && STCD_INSPIRE_CHARGEN.mode === 'deep');
  var h = '<div class="mcard" style="max-width:640px">';
  h += '<h3 style="font-size:0.95em;margin-bottom:8px">' + (isDeep ? '✨ 挑选一个深化方向，再正式深化' : '✨ 挑选一个候选，再正式生成') + '</h3>';
  h += '<p style="font-size:0.78em;color:var(--fg2);margin-bottom:10px">先看这 ' + opts.length + ' 个' + (isDeep ? '深化方向' : '方向') + '，点选一个' + (isDeep ? '，即按该方向把角色往深里挖' : '作为正式生成的基础') + '。</p>';
  h += '<div style="display:flex;flex-direction:column;gap:8px;max-height:56vh;overflow-y:auto">';
  opts.forEach(function(o) {
    var title = (o.title || ('候选' + o.id));
    var desc = (o.desc || '');
    h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px 12px;cursor:pointer" onclick="stcdInspireCharPickOption(\'' + escHtml(JSON.stringify(o).replace(/'/g, "\\'")) + '\')">';
    h += '<div style="font-size:12px;font-weight:700;color:var(--accent2);margin-bottom:3px">' + escHtml(title) + '</div>';
    h += '<div style="font-size:11px;color:var(--fg2);line-height:1.6">' + escHtml(desc) + '</div>';
    h += '</div>';
  });
  h += '</div></div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  window._charOptions = opts;
}

// 用户选中一个候选 → 正式生成（正常生成提示词 + 加上选中选项的内容）
function stcdInspireCharPickOption(optJson) {
  var o = null; try { o = JSON.parse(optJson); } catch(e) {}
  if (!o) return;
  var ov = document.querySelector('.ovl');
  if (ov) ov.remove();
  var m = (STCD_INSPIRE_CHARGEN && STCD_INSPIRE_CHARGEN.mode) || 'gen';
  var fieldId = (m === 'deep') ? 'stcd-inspire-char-gen-deep' : (m === 'mix') ? 'stcd-inspire-char-gen-mix' : 'stcd-inspire-char-gen-gen';
  // 把选中选项的内容作为「已选的方向」附加进正式生成
  STCD_INSPIRE_CHARGEN.option = (o.title ? ('【已选方向】' + o.title + '\n') : '') + (o.desc || '');
  stcdInspireCharGenRun(fieldId);
}

// 典型角色 · 精简生成弹窗：只留一个补充输入框 + 生成按钮（选项都已在创作台填好）
function stcdInspireCharGenRun(fieldId) {
  if (typeof getFieldInfo !== 'function' || typeof renderPrompt !== 'function' || typeof LLM === 'undefined' || !LLM.callJSON) { toast('AI 系统未就绪'); return; }
  var fi = getFieldInfo(fieldId);
  if (!fi) { toast('AI 字段未就绪'); return; }
  var vars = fi.vars || {};
  var h = '<div class="mcard" style="max-width:520px">';
  h += '<h3 style="font-size:0.95em;margin-bottom:8px">✨ ' + (fi.label || '生成') + '</h3>';
  h += '<div style="margin-bottom:8px"><label style="font-size:0.8em;color:var(--fg2);display:block;margin-bottom:3px">补充说明（可选，留空即按创作台设定生成）</label>';
  h += '<textarea id="chg-run-dir" class="llm-input" style="width:100%;min-height:70px;resize:vertical" placeholder="补充的创作指令，如：性格再冷一点、结局悲惨一些…"></textarea></div>';
  h += '<div style="text-align:right;display:flex;gap:8px;justify-content:flex-end"><button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button><button class="btn-main" id="chg-run-btn">🎯 生成</button></div>';
  h += '</div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  document.getElementById('chg-run-btn').onclick = function() {
    var dir = (document.getElementById('chg-run-dir').value || '').trim();
    ov.remove();
    var vars2 = Object.assign({}, vars, { direction: dir });
    var rendered = renderPrompt(fi.suggestPrompt, Object.assign({ text: '' }, vars2));
    if (!rendered.user) { toast('模板渲染失败'); return; }
    // 追加【已选方向】（候选选项的内容），让正式生成贴合用户挑中的那个方向
    if (STCD_INSPIRE_CHARGEN && STCD_INSPIRE_CHARGEN.option) rendered.user += '\n\n' + STCD_INSPIRE_CHARGEN.option;
    if (dir) rendered.user += '\n\n【用户补充】' + dir;
    toast('典型角色生成中…');
    LLM.callJSON({ label: '典型角色生成', system: rendered.system, prompt: rendered.user }).then(function(d) {
      if (typeof fi.fillFn === 'function') fi.fillFn(d);
      else toast('生成完成（无填充函数）');
    }).catch(function(e) { toast('生成失败：' + (e && e.message ? e.message : '未知')); });
  };
}

// 人物塑造要点 chip 切换（多选）
function stcdInspireCharToggleTrait(el) {
  var s = el.getAttribute('data-trait');
  STCD_INSPIRE_CHARGEN = STCD_INSPIRE_CHARGEN || {};
  var arr = (STCD_INSPIRE_CHARGEN.traits || '').split(',').filter(Boolean);
  if (arr.indexOf(s) >= 0) { arr.splice(arr.indexOf(s), 1); el.classList.remove('on'); }
  else { arr.push(s); el.classList.add('on'); }
  STCD_INSPIRE_CHARGEN.traits = arr.join(',');
}

// 典型角色卡片（复用生图成果卡片样式）
function stcdInspireCharCard(it) {
  var name = stcdInspireDisplayName(it);
  var order = ['normal', 'cool', 'deep'];
  var thumb = null, age = '';
  if (it.avatars) { for (var i = 0; i < order.length; i++) if (it.avatars[order[i]]) { thumb = it.avatars[order[i]]; break; } }
  if (it.versions) { for (var ai = 0; ai < order.length; ai++) { var av = it.versions[order[ai]]; if (av && av.identity && av.identity.age) { age = av.identity.age; break; } } }
  var nv = null; var info = '';
  for (var oi = 0; oi < order.length; oi++) { var vv = it.versions ? it.versions[order[oi]] : null; if (vv && (vv.identity||{}).title) { nv = vv; break; } }
  if (nv) info = [nv.identity.title, age ? (age + '岁') : '', nv.identity.race].filter(Boolean).join(' · ');
  if (!info) info = it.category || '';
  var h = '<div style="width:180px;background:var(--card);border:1px solid var(--border);border-radius:8px;cursor:pointer;flex-shrink:0;overflow:hidden;display:flex;flex-direction:column" onclick="stcdInspireView(\'' + it.id + '\')">';
  h += '<div style="width:100%;aspect-ratio:3/4;background:var(--bg2);overflow:hidden;position:relative">';
  h += thumb ? '<img src="' + thumb + '" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.style.display=\'none\'" />' : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--fg3);font-size:28px">🖼</div>';
  h += '</div>';
  h += '<div style="padding:6px 8px">';
  h += '<div style="font-size:11px;color:var(--fg);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(name) + '</div>';
  if (info) h += '<div style="font-size:9px;color:var(--fg3);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(info) + '</div>';
  h += '</div></div>';
  return h;
}

// 生成/深化典型角色弹窗 —— 三模式（深化已有/多卡生成/多卡混搭），按模式区分界面
function stcdInspireCharGen() {
  var mode = (window.STCD_INSPIRE_CHARGEN && STCD_INSPIRE_CHARGEN.mode) || 'gen';
  var h = '<div class="mcard" style="max-width:620px">';
  h += '<h3 style="font-size:0.95em;margin-bottom:8px">✦ 生成/深化典型角色</h3>';
  // 模式切换（三个不同界面）：多卡生成(默认) / 深化已有 / 多卡混搭
  h += '<div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">';
  h += '<span class="preset-chip preset-character' + (mode === 'gen' ? ' preset-active' : '') + '" data-chgmode="gen" onclick="stcdInspireCharSetMode(\'gen\',this)">💡 多卡生成</span>';
  h += '<span class="preset-chip preset-character' + (mode === 'deep' ? ' preset-active' : '') + '" data-chgmode="deep" onclick="stcdInspireCharSetMode(\'deep\',this)">🧩 深化已有</span>';
  h += '<span class="preset-chip preset-character' + (mode === 'mix' ? ' preset-active' : '') + '" data-chgmode="mix" onclick="stcdInspireCharSetMode(\'mix\',this)">🎨 多卡混搭</span>';
  h += '</div>';
  // 角色名（各模式共用）
  h += '<div style="margin-bottom:8px"><label style="font-size:0.8em;color:var(--fg2);display:block;margin-bottom:3px">新角色名（可留空，AI 自拟真实人名）</label>';
  h += '<input id="chg-name" class="llm-input" style="width:100%" placeholder="如 徐清婉；留空则 AI 起名" /></div>';
  // 你的要求（各模式共用，纯粹放要求）
  h += '<div style="margin-bottom:10px"><label style="font-size:0.8em;color:var(--fg2);display:block;margin-bottom:3px">你的要求（纯粹放你的创作要求/描述）</label>';
  h += '<textarea id="chg-ref" class="llm-input" style="width:100%;min-height:80px;resize:vertical" placeholder="写你的要求，如：把她学刺绣的执着、与表兄的纠葛、婚后苦闷写得更血肉丰满"></textarea></div>';

  // ===== 深化已有：基座角色（单选） + 参考角色（多选）=====
  h += '<div id="chg-deep-panel" style="margin-bottom:10px' + (mode === 'deep' ? '' : ';display:none') + '">';
  h += '<div style="margin-bottom:8px"><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">';
  h += '<span style="font-size:0.8em;color:var(--fg2)">要深化的角色（基座，导入一个）</span>';
  h += '<button type="button" class="btn-out" style="padding:2px 8px;font-size:10px;color:var(--accent2)" onclick="stcdInspireCharPickBase()">📂 导入角色卡</button>';
  h += '<button type="button" class="btn-out" style="padding:2px 8px;font-size:10px;color:var(--accent2)" onclick="stcdInspireCharClearBase()">🗑 清空</button>';
  h += '</div>';
  h += '<div id="chg-base" style="display:flex;flex-direction:column;gap:5px">' + stcdInspireCharBaseHtml() + '</div></div>';
  h += '<div style="margin-bottom:8px"><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">';
  h += '<span style="font-size:0.8em;color:var(--fg2)">参考角色（可多选，作深化参照）</span>';
  h += '<button type="button" class="btn-out" style="padding:2px 8px;font-size:10px;color:var(--accent2)" onclick="stcdInspireCharPickBaseRef()">📂 导入角色卡</button>';
  h += '<button type="button" class="btn-out" style="padding:2px 8px;font-size:10px;color:var(--accent2)" onclick="stcdInspireCharClearBaseRefs()">🗑 清空</button>';
  h += '</div>';
  h += '<div id="chg-base-refs" style="display:flex;flex-direction:column;gap:5px;max-height:150px;overflow-y:auto">' + stcdInspireCharBaseRefsHtml() + '</div></div>';
  h += '</div>';

  // ===== 多卡生成 / 多卡混搭：共同的面板（参考角色多选导入），仅提示词不同 =====
  var multiShow = (mode === 'gen' || mode === 'mix') ? '' : ';display:none';
  h += '<div id="chg-gen-panel" style="margin-bottom:10px' + multiShow + '">';
  h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">';
  h += '<span style="font-size:0.8em;color:var(--fg2)">参考角色（可导入多张）</span>';
  h += '<button type="button" class="btn-out" style="padding:2px 8px;font-size:10px;color:var(--accent2)" onclick="stcdInspireCharPickRef()">📂 导入角色卡</button>';
  h += '<button type="button" class="btn-out" style="padding:2px 8px;font-size:10px;color:var(--accent2)" onclick="stcdInspireCharClearRefs()">🗑 清空</button>';
  h += '</div>';
  h += '<div id="chg-refs" style="display:flex;flex-direction:column;gap:5px;max-height:180px;overflow-y:auto">' + stcdInspireCharRefsHtml() + '</div>';
  h += '<div id="chg-gen-note" style="font-size:9px;color:var(--fg3);margin-top:4px">' + ((mode === 'mix')
        ? '多卡混搭：把这几张角色的经历、特征、性爱风格融合成同一人（关公战秦琼式同人）。'
        : '多卡生成：读这几张角色找感觉、吸收内核，再凭灵感原创一个全新的独立角色。') + '</div>';
  h += '</div>';

  h += '<div style="text-align:right;display:flex;gap:8px;justify-content:flex-end"><button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button><button class="btn-main" id="chg-btn">🎯 生成</button></div>';
  h += '</div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  document.getElementById('chg-btn').onclick = function() {
    var name = (document.getElementById('chg-name').value || '').trim();
    var req = (document.getElementById('chg-ref').value || '').trim();
    var m = (window.STCD_INSPIRE_CHARGEN && STCD_INSPIRE_CHARGEN.mode) || 'gen';
    var refParts = [];
    if (req) refParts.push(req);
    if (m === 'deep') {
      if (STCD_INSPIRE_CHAR_BASE) {
        var bt = stcdInspireCharRefText(STCD_INSPIRE_CHAR_BASE);
        if (bt) refParts.push('[要深化的角色]\n' + bt);
      }
      (STCD_INSPIRE_CHAR_BASE_REFS || []).forEach(function(found) {
        var text = stcdInspireCharRefText(found);
        if (text) refParts.push('[参考角色]\n' + text);
      });
    } else {
      // gen（多卡生成）/ mix（多卡混搭）：都读参考角色
      (STCD_INSPIRE_CHAR_REFS || []).forEach(function(found) {
        var text = stcdInspireCharRefText(found);
        if (text) refParts.push('[参考角色]\n' + text);
      });
    }
    ov.remove();
    STCD_INSPIRE_CHARGEN = { name: name, ref: refParts.join('\n\n'), mode: m };
    // 明确任务 → 用对应的专用提示词弹窗（gen/mix/deep 各自明确，不丢给 AI）。
    var fieldId = (m === 'deep') ? 'stcd-inspire-char-gen-deep'
      : (m === 'mix') ? 'stcd-inspire-char-gen-mix' : 'stcd-inspire-char-gen-gen';
    if (typeof openAiGenPanel === 'function') openAiGenPanel(fieldId);
    else toast('AI 弹窗未就绪');
  };
}

// ===== 深化已有 · 基座角色（单选）=====
function stcdInspireCharBaseHtml() {
  var found = STCD_INSPIRE_CHAR_BASE;
  if (!found) return '<div style="font-size:10px;color:var(--fg3)">还没有导入要深化的角色——点「📂 导入角色卡」</div>';
  var cn = stcdInspireCharRefName(found);
  return '<div style="display:flex;align-items:center;gap:8px;background:var(--bg2);border:1px solid var(--accent2);border-radius:6px;padding:5px 10px">' +
    '<span style="font-size:12px;font-weight:600;flex:1">' + escHtml(cn) + '</span>' +
    '<span style="font-size:10px;color:var(--fg3)">🔄 将深化这一位</span>' +
    '<button type="button" style="padding:0 6px;font-size:10px;color:#e06c75;border:none;background:transparent;cursor:pointer" onclick="stcdInspireCharClearBase()">🗑</button>' +
    '</div>';
}
function stcdInspireCharPickBase() {
  if (typeof window.stcdOpenCharPicker !== 'function') { toast('角色选择器未就绪'); return; }
  window.stcdOpenCharPicker('chg-base', {
    mode: 'fill',
    onPick: function(found) {
      if (!found) return;
      STCD_INSPIRE_CHAR_BASE = found;
      var box = document.getElementById('chg-base');
      if (box) box.innerHTML = stcdInspireCharBaseHtml();
      toast('已选要深化的角色：' + stcdInspireCharRefName(found));
    }
  });
}
function stcdInspireCharClearBase() {
  STCD_INSPIRE_CHAR_BASE = null;
  var box = document.getElementById('chg-base');
  if (box) box.innerHTML = stcdInspireCharBaseHtml();
}

// ===== 深化已有 · 参考角色（多选，作深化参照）=====
function stcdInspireCharBaseRefsHtml() {
  var arr = STCD_INSPIRE_CHAR_BASE_REFS || [];
  if (!arr.length) return '<div style="font-size:10px;color:var(--fg3)">还没有导入参考角色——点「📂 导入角色卡」</div>';
  return arr.map(function(found, i) {
    var cn = stcdInspireCharRefName(found);
    return '<div style="display:flex;align-items:center;gap:8px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:5px 10px">' +
      '<span style="font-size:12px;font-weight:600;flex:1">' + escHtml(cn) + '</span>' +
      '<button type="button" style="padding:0 6px;font-size:10px;color:#e06c75;border:none;background:transparent;cursor:pointer" onclick="stcdInspireCharRemoveBaseRef(' + i + ')">🗑</button>' +
      '</div>';
  }).join('');
}
function stcdInspireCharPickBaseRef() {
  if (typeof window.stcdOpenCharPicker !== 'function') { toast('角色选择器未就绪'); return; }
  window.stcdOpenCharPicker('chg-base-refs', {
    mode: 'fill',
    onPick: function(found) {
      if (!found) return;
      if (!STCD_INSPIRE_CHAR_BASE_REFS) STCD_INSPIRE_CHAR_BASE_REFS = [];
      var cn = stcdInspireCharRefName(found);
      var dup = STCD_INSPIRE_CHAR_BASE_REFS.some(function(r) { return stcdInspireCharRefName(r) === cn; });
      if (dup) { toast('该角色已导入'); return; }
      STCD_INSPIRE_CHAR_BASE_REFS.push(found);
      var box = document.getElementById('chg-base-refs');
      if (box) box.innerHTML = stcdInspireCharBaseRefsHtml();
      toast('已导入参考角色：' + cn);
    }
  });
}
function stcdInspireCharRemoveBaseRef(i) {
  STCD_INSPIRE_CHAR_BASE_REFS.splice(i, 1);
  var box = document.getElementById('chg-base-refs');
  if (box) box.innerHTML = stcdInspireCharBaseRefsHtml();
}
function stcdInspireCharClearBaseRefs() {
  STCD_INSPIRE_CHAR_BASE_REFS.length = 0;
  var box = document.getElementById('chg-base-refs');
  if (box) box.innerHTML = stcdInspireCharBaseRefsHtml();
}

// 渲染混搭参考角色列表 HTML
function stcdInspireCharRefsHtml() {
  var arr = STCD_INSPIRE_CHAR_REFS || [];
  if (!arr.length) return '<div style="font-size:10px;color:var(--fg3)">还没有导入参考角色——点「📂 导入角色卡」</div>';
  return arr.map(function(found, i) {
    var cn = stcdInspireCharRefName(found);
    return '<div style="display:flex;align-items:center;gap:8px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:5px 10px">' +
      '<span style="font-size:12px;font-weight:600;flex:1">' + escHtml(cn) + '</span>' +
      '<button type="button" style="padding:0 6px;font-size:10px;color:#e06c75;border:none;background:transparent;cursor:pointer" onclick="stcdInspireCharRemoveRef(' + i + ')">🗑</button>' +
      '</div>';
  }).join('');
}
// 取角色显示名
function stcdInspireCharRefName(found) {
  if (!found) return '未命名';
  if (found.identity && found.identity.basicInfo) return found.identity.basicInfo.name || found.identity.basicInfo.title || '未命名';
  if (typeof stcdInspireDisplayName === 'function') return stcdInspireDisplayName(found);
  return found.name || '未命名';
}
// 用全局函数导出角色内容（正式角色卡→角色卡全部；灵感角色→灵感角色全部）
function stcdInspireCharRefText(found) {
  if (!found) return '';
  if (found.versions && typeof window.灵感角色全部 === 'function') {
    // 取「有内容的版本」优先：deep → cool → normal → 兜底整个对象
    // （深化已有常选一个已有内容的角色，其 deep 可能是空模板，不能只导出 deep）
    var order = (typeof window.STCD_INSPIRE_VERSIONS !== 'undefined' && Array.isArray(window.STCD_INSPIRE_VERSIONS))
      ? window.STCD_INSPIRE_VERSIONS.slice() : ['normal', 'cool', 'deep'];
    // 优先导出内容最全的版本（deep 通常内容最丰富）
    order.sort(function(a, b) { return stcdInspireVersionWeight(b) - stcdInspireVersionWeight(a); });
    for (var i = 0; i < order.length; i++) {
      var v = order[i];
      var vd = found.versions[v];
      if (vd && stcdInspireVersionHasContent(vd)) return JSON.stringify(vd);
    }
    // 所有版本都空 → 原样导出整个对象
    try { return JSON.stringify(found); } catch(e) { return ''; }
  }
  // 正式角色卡：只导入「身份」章节（第一章），不导入整套14章
  var txt = '';
  if (typeof window.角色卡身份与外貌 === 'function') txt = window.角色卡身份与外貌(found);
  if (!txt && typeof window.角色卡全部 === 'function') txt = window.角色卡全部(found);
  // 兜底：上述都取不到文本时，直接原样导出整个对象，保证基座/参考信息一定传下去
  if (!txt) { try { txt = JSON.stringify(found); } catch(e) { txt = ''; } }
  return txt;
}
// 版本权重：deep 最高（内容最丰富），normal 最低
function stcdInspireVersionWeight(v) { return (v === 'deep') ? 3 : (v === 'cool') ? 2 : 1; }
// 判断一个版本是否有实际内容（任一字段非空/非空数组）
function stcdInspireVersionHasContent(vd) {
  if (!vd || typeof vd !== 'object') return false;
  var keys = Object.keys(vd);
  for (var i = 0; i < keys.length; i++) {
    var val = vd[keys[i]];
    if (val == null) continue;
    if (typeof val === 'string' && val.trim() !== '') return true;
    if (Array.isArray(val) && val.length > 0) return true;
    if (typeof val === 'object' && !Array.isArray(val)) {
      var sub = stcdInspireVersionHasContent(val);
      if (sub) return true;
    }
  }
  return false;
}
// 移除一个参考角色
function stcdInspireCharRemoveRef(i) {
  STCD_INSPIRE_CHAR_REFS.splice(i, 1);
  var box = document.getElementById('chg-refs');
  if (box) box.innerHTML = stcdInspireCharRefsHtml();
}
function stcdInspireCharClearRefs() {
  STCD_INSPIRE_CHAR_REFS.length = 0;
  var box = document.getElementById('chg-refs');
  if (box) box.innerHTML = stcdInspireCharRefsHtml();
}
function stcdInspireCharSetMode(mode, el) {
  STCD_INSPIRE_CHARGEN = STCD_INSPIRE_CHARGEN || {};
  STCD_INSPIRE_CHARGEN.mode = mode;
  // 工作室视图：直接重渲染整个创作台（刷新参考区/说明/模式高亮）
  if (STCD_INSPIRE_CHAR_VIEW.mode === 'studio') {
    if (typeof stcdInspireRenderCharTab === 'function') stcdInspireRenderCharTab();
    return;
  }
  // 高亮模式 chip
  var wrap = el.parentNode;
  var chips = wrap.querySelectorAll('.preset-chip');
  for (var i = 0; i < chips.length; i++) chips[i].classList.remove('preset-active');
  el.classList.add('preset-active');
  // 切换对应界面板块
  var deep = document.getElementById('chg-deep-panel');
  var genp = document.getElementById('chg-gen-panel');
  if (deep) deep.style.display = (mode === 'deep' ? '' : 'none');
  if (genp) genp.style.display = (mode === 'gen' || mode === 'mix') ? '' : 'none';
  // 更新面板下说明文字（多卡生成 vs 多卡混搭）
  var note = document.getElementById('chg-gen-note');
  if (note) note.textContent = (mode === 'mix')
    ? '多卡混搭：把这几张角色的经历、特征、性爱风格融合成同一人（关公战秦琼式同人）。'
    : '多卡生成：读这几张角色找感觉、吸收内核，再凭灵感原创一个全新的独立角色。';
}

// 导入参考角色（多卡混搭，复用通用角色选择器 stcdOpenCharPicker，可多选）
function stcdInspireCharPickRef() {
  if (typeof window.stcdOpenCharPicker !== 'function') { toast('角色选择器未就绪'); return; }
  window.stcdOpenCharPicker('chg-refs', {
    mode: 'fill',
    onPick: function(found) {
      if (!found) return;
      if (!STCD_INSPIRE_CHAR_REFS) STCD_INSPIRE_CHAR_REFS = [];
      var cn = stcdInspireCharRefName(found);
      var dup = STCD_INSPIRE_CHAR_REFS.some(function(r) { return stcdInspireCharRefName(r) === cn; });
      if (dup) { toast('该角色已导入'); return; }
      STCD_INSPIRE_CHAR_REFS.push(found);
      var box = document.getElementById('chg-refs');
      if (box) box.innerHTML = stcdInspireCharRefsHtml();
      toast('已导入参考角色：' + cn);
    }
  });
}

// 场景区主渲染（根据导航状态：列表 or 场景详情分层）
function stcdInspireRenderScenes() {
  var el = document.getElementById('stcd-inspire-scenes');
  if (!el) return;
  var sceneId = STCD_INSPIRE_SCENE.sceneId;
  if (!sceneId) {
    el.innerHTML = stcdInspireSceneList();
    return;
  }
  var scene = stcdSceneGet(sceneId);
  el.innerHTML = stcdInspireSceneDetail(scene);
}

// 打开场景（进入树状下钻）
function stcdInspireSceneOpen(sceneId) {
  STCD_INSPIRE_SCENE.sceneId = sceneId;
  STCD_INSPIRE_SCENE.nodeId = null;
  stcdInspireRenderScenes();
}
function stcdInspireSceneBack() {
  STCD_INSPIRE_SCENE.sceneId = null;
  STCD_INSPIRE_SCENE.nodeId = null;
  stcdInspireRenderScenes();
}
function stcdInspireSceneRefresh() {
  stcdInspireRenderScenes();
}

// ===== 弹窗输入（替代被禁用的 prompt()）：Promise<string|null> =====
function stcdInspireTextPrompt(label, placeholder, value, okLabel) {
  return new Promise(function(resolve) {
    var h = '<div class="mcard" style="max-width:440px">';
    h += '<div style="font-size:0.9em;margin-bottom:8px">' + label + '</div>';
    h += '<input id="stcd-inp" class="llm-input" style="width:100%;margin-bottom:12px" placeholder="' + (placeholder || '') + '" value="' + (value || '') + '" />';
    h += '<div style="display:flex;gap:8px;justify-content:flex-end">';
    h += '<button class="btn-out" data-cancel>取消</button>';
    h += '<button class="btn-main" data-ok>' + (okLabel || '确定') + '</button>';
    h += '</div></div>';
    var ov = document.createElement('div');
    ov.className = 'ovl';
    ov.innerHTML = h;
    document.body.appendChild(ov);
    var inp = ov.querySelector('#stcd-inp');
    var done = false;
    function finish(val) { if (done) return; done = true; ov.remove(); resolve(val); }
    ov.querySelector('[data-ok]').onclick = function() { finish((inp.value || '').trim()); };
    ov.querySelector('[data-cancel]').onclick = function() { finish(null); };
    ov.addEventListener('click', function(e) { if (e.target === ov) finish(null); });
    inp.addEventListener('keydown', function(e) { if (e.key === 'Enter') finish((inp.value || '').trim()); });
    setTimeout(function() { if (inp) { inp.focus(); inp.select(); } }, 50);
  });
}
window.stcdInspireTextPrompt = stcdInspireTextPrompt;

// 删除场景
function stcdInspireSceneRemove(sceneId) {
  var scene = stcdSceneGet(sceneId);
  if (!scene) return;
  if (typeof confirmDialog === 'function') confirmDialog('确定删除场景「' + scene.name + '」？', function() {
    stcdSceneRemove(sceneId).then(function() { toast('已删除'); stcdInspireSceneRefresh(); });
  });
}
// 重命名场景
function stcdInspireSceneRename(sceneId) {
  var scene = stcdSceneGet(sceneId);
  if (!scene) return;
  stcdInspireTextPrompt('重命名场景：', scene.name, scene.name).then(function(name) {
    if (!name) return;
    stcdSceneRename(sceneId, name, scene.desc).then(function() { toast('已重命名'); stcdInspireSceneRefresh(); });
  });
}
// 加一层
function stcdInspireSceneAddLevel(sceneId) {
  stcdInspireTextPrompt('输入这一层的名称（如「至尊」「妃嫔」「执事」，留空自动编号）：', '', '').then(function(name) {
    stcdSceneAddLevelSave(sceneId, name || '').then(function() { toast('已添加一层'); stcdInspireSceneRefresh(); });
  });
}
// AI 加一层（两步：先生成候选方向 → 用户挑一个 → 正式生成该层及该层的人，并判断插到哪层。走二元模板）
function stcdInspireSceneAddLevelAI(sceneId) {
  var scene = stcdSceneGet(sceneId);
  if (!scene) { if (typeof toast === 'function') toast('场景不存在'); return; }
  var 已有层 = (scene.levels || []).map(function(lv, li) {
    var ppl = [];
    (lv.persons || []).forEach(function(p) { ppl.push((p.name || '') + (p.title ? ('·' + p.title) : '')); });
    (lv.groups || []).forEach(function(g) { (g.persons || []).forEach(function(p) { ppl.push((p.name || '') + (p.title ? ('·' + p.title) : '')); }); });
    return { 层序: li + 1, 层名: lv.name || ('第' + (li + 1) + '层'), 人: ppl };
  });
  STCD_INSPIRE_LEVELGEN = { 场景id: sceneId, 场景名: scene.name, 势力名: scene.org || '', 场景描述: scene.desc || '', 已有层: 已有层 };
  stcdInspireSceneOptInput('✨ AI 加一层', '描述你想加的层（如「补一层太妃」「一批江湖客卿」；留空则 AI 按场景自动判断）', function(dir) {
    stcdInspireSceneLevelGenOptions(dir);
  });
}
// 第一步：生成候选方向（走二元模板 stcd-inspire-scene-level-options）
function stcdInspireSceneLevelGenOptions(dir) {
  if (typeof getFieldInfo !== 'function' || typeof renderPrompt !== 'function' || typeof LLM === 'undefined' || !LLM.callJSON) { toast('AI 系统未就绪'); return; }
  var fi = getFieldInfo('stcd-inspire-scene-level-options');
  if (!fi) { toast('AI 字段未就绪'); return; }
  var vars = fi.vars || {};
  vars.direction = dir || '（无特定方向，请根据场景自动判断应补什么层）';
  toast('正在生成加一层候选…');
  var rendered = renderPrompt('inspire_scene_level_options', Object.assign({}, vars));
  if (!rendered.user) { toast('模板渲染失败'); return; }
  LLM.callJSON({ label: '典型场景加一层候选', system: rendered.system, prompt: rendered.user }).then(function(d) {
    if (typeof fi.fillFn === 'function') fi.fillFn(d);
    else toast('候选生成完成（无展示函数）');
  }).catch(function(e) { toast('候选生成失败：' + (e && e.message ? e.message : '未知')); });
}
// 展示候选方向选卡，用户点选一个 → 正式生成
function stcdInspireSceneLevelShowOptions(d) {
  var opts = (d && Array.isArray(d.options)) ? d.options : (Array.isArray(d) ? d : []);
  if (!opts.length) { toast('候选生成结果为空'); return; }
  var h = '<div class="mcard" style="max-width:640px">';
  h += '<h3 style="font-size:0.95em;margin-bottom:8px">✨ 挑选一个候选方向，再生成这一层</h3>';
  h += '<p style="font-size:0.78em;color:var(--fg2);margin-bottom:10px">先看这 ' + opts.length + ' 个方向，点选一个作为正式生成的基础。</p>';
  h += '<div style="display:flex;flex-direction:column;gap:8px;max-height:56vh;overflow-y:auto">';
  opts.forEach(function(o) {
    var title = (o.title || ('候选' + o.id));
    var desc = (o.desc || '');
    h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px 12px;cursor:pointer" onclick="stcdInspireSceneLevelPickOption(\'' + escHtml(JSON.stringify(o).replace(/'/g, "\\'")) + '\')">';
    h += '<div style="font-size:12px;font-weight:700;color:var(--accent2);margin-bottom:3px">' + escHtml(title) + '</div>';
    h += '<div style="font-size:11px;color:var(--fg2);line-height:1.6">' + escHtml(desc) + '</div>';
    h += '</div>';
  });
  h += '</div></div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
}
// 用户选中一个候选方向 → 正式生成该层
function stcdInspireSceneLevelPickOption(optJson) {
  var o = null; try { o = JSON.parse(optJson); } catch(e) {}
  if (!o) return;
  var ov = document.querySelector('.ovl');
  if (ov) ov.remove();
  var chosen = (o.title ? ('【已选方向】' + o.title + '\n') : '') + (o.desc || '');
  stcdInspireSceneLevelRun(chosen);
}
// 正式生成该层（新层+人+position，走 stcd-inspire-scene-level-gen）
function stcdInspireSceneLevelRun(chosen) {
  if (typeof getFieldInfo !== 'function' || typeof renderPrompt !== 'function' || typeof LLM === 'undefined' || !LLM.callJSON) { toast('AI 系统未就绪'); return; }
  var fi = getFieldInfo('stcd-inspire-scene-level-gen');
  if (!fi) { toast('AI 字段未就绪'); return; }
  var h = '<div class="mcard" style="max-width:560px">';
  h += '<h3 style="font-size:0.95em;margin-bottom:8px">✨ 加一层</h3>';
  h += '<div style="font-size:11px;color:var(--fg2);line-height:1.6;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:8px 10px;margin-bottom:10px">' + escHtml(chosen) + '</div>';
  h += '<div class="mb-10"><label style="font-size:0.78em;color:var(--fg2);display:block;margin-bottom:3px">补充说明（可选）</label>';
  h += '<textarea id="scene-level-dir" class="llm-input" rows="3" style="width:100%;min-height:70px;resize:vertical" placeholder="补充的创作指令，如：这一层的等级、人物关系…"></textarea></div>';
  h += '<div style="text-align:right;display:flex;gap:8px;justify-content:flex-end"><button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button><button class="btn-main" id="scene-level-btn">🎯 生成</button></div>';
  h += '</div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  document.getElementById('scene-level-btn').onclick = function() {
    var dir = (document.getElementById('scene-level-dir').value || '').trim();
    ov.remove();
    var vars2 = Object.assign({}, fi.vars || {});
    vars2.direction = chosen;
    if (dir) vars2.direction += '\n\n【用户补充】' + dir;
    var rendered = renderPrompt(fi.suggestPrompt, Object.assign({ text: '' }, vars2));
    if (!rendered.user) { toast('模板渲染失败'); return; }
    toast('加一层生成中…');
    LLM.callJSON({ label: '典型场景加一层', system: rendered.system, prompt: rendered.user }).then(function(d) {
      if (typeof fi.fillFn === 'function') fi.fillFn(d);
      else toast('生成完成（无填充函数）');
    }).catch(function(e) { toast('生成失败：' + (e && e.message ? e.message : '未知')); });
  };
}
// 方向输入弹窗（可选）+ 下一步生成候选
function stcdInspireSceneOptInput(title, placeholder, onNext) {
  var h = '<div class="mcard" style="max-width:560px">';
  h += '<h3 style="font-size:0.95em;margin-bottom:8px">' + title + '</h3>';
  h += '<div class="mb-10"><label style="font-size:0.78em;color:var(--fg2);display:block;margin-bottom:4px">描述你的想法（可选）</label>';
  h += '<textarea id="scene-opt-dir" class="llm-input" rows="3" style="width:100%;resize:vertical;font-family:inherit" placeholder="' + placeholder + '"></textarea></div>';
  h += '<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button><button class="btn-main" id="scene-opt-next">✨ 生成候选</button></div>';
  h += '</div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  document.getElementById('scene-opt-next').onclick = function() {
    var dir = (document.getElementById('scene-opt-dir').value || '').trim();
    ov.remove();
    if (typeof onNext === 'function') onNext(dir);
  };
  setTimeout(function(){ var d = document.getElementById('scene-opt-dir'); if (d) d.focus(); }, 100);
}
window.stcdInspireSceneAddLevelAI = stcdInspireSceneAddLevelAI;
// 删一层
function stcdInspireSceneRemoveLevel(sceneId, levelIdx) {
  if (typeof confirmDialog === 'function') confirmDialog('确定删除这一层及其下所有人？', function() {
    stcdSceneRemoveLevelSave(sceneId, levelIdx).then(function() { toast('已删除'); stcdInspireSceneRefresh(); });
  });
}
// 在某层加一个人（走二元模板：AI 在指定层级生成单个完整人物并挂到该层）
function stcdInspireSceneAddPerson(sceneId, levelIdx, groupIdx) {
  var scene = stcdSceneGet(sceneId);
  if (!scene) { toast('场景不存在'); return; }
  var levelObj = (scene.levels || [])[levelIdx];
  var 目标层 = levelObj ? (levelObj.name || '') : '';
  var 该层已有 = (levelObj && Array.isArray(levelObj.persons)) ? levelObj.persons.map(function(p) { return p.name || p.title || ''; }).filter(Boolean) : [];
  STCD_INSPIRE_PERSONADD = { 场景id: sceneId, levelIdx: levelIdx, 场景名: scene.name || '', 描述: scene.desc || '', 已有层: (scene.levels || []).map(function(lv) { return lv.name || ''; }), 目标层: 目标层, 该层已有: 该层已有 };
  if (typeof openAiGenPanel === 'function') openAiGenPanel('stcd-inspire-scene-person-add');
  else toast('AI 弹窗未就绪');
}
// 删一个人
function stcdInspireSceneRemovePerson(sceneId, levelIdx, groupIdx, personIdx) {
  if (typeof confirmDialog === 'function') confirmDialog('确定删除这个人？', function() {
    stcdSceneRemovePersonSave(sceneId, levelIdx, personIdx, groupIdx >= 0 ? groupIdx : null).then(function() { toast('已删除'); stcdInspireSceneRefresh(); });
  });
}
// 创建场景里的人（建空灵感角色条目，只填 name + 头衔(identity)）
function createScenePerson(sceneId, levelIdx, groupIdx, name, title) {
  // 建一个空灵感角色（identity.name + identity.title 头衔），作为该人的 refRoleId
  STCD_INSPIRE_GEN = { desc: '', gender: '女', forceNew: true, category: '典型场景/人物' };
  var d = { identity: { name: name, title: title || '' } };
  return stcdInspireApplyNormal(d, '', '女').then(function(it) {
    if (!it || !it.id) throw new Error('创建角色失败');
    if (groupIdx >= 0) return stcdSceneAddGroupPersonSave(sceneId, levelIdx, groupIdx, name, title, it.id);
    return stcdSceneAddPersonSave(sceneId, levelIdx, name, title, it.id);
  });
}

// 角色是否命中当前分区下的筛选
function stcdInspireScopeMatch(it) {
  if (STCD_INSPIRE_SCOPE.mode === 'world') return stcdInspireWorldMatch(it);
  // 典型场景：不走全局卡片网格（人挂在场景树上），故不在此过滤
  return false;
}

// 一键生成一批人（走二元模板：场景名+现有层级 → AI 生成整批名字+头衔，按地位分层自动排树）
function stcdInspireSceneGenPersons(sceneId) {
  var scene = stcdSceneGet(sceneId);
  if (!scene) { toast('场景不存在'); return; }
  var 已有层 = (scene.levels || []).map(function(lv) { return lv.name || ''; });
  STCD_INSPIRE_SCENEGEN = { 场景id: sceneId, 场景名: scene.name, 描述: scene.desc || '', 已有层: 已有层 };
  if (typeof openAiGenPanel === 'function') openAiGenPanel('stcd-inspire-scene-person-gen');
  else toast('AI 弹窗未就绪');
}

// 生成场景的「台面代表人物」（独立一排；走二元模板弹窗）
function stcdInspireSceneGenPersona(sceneId) {
  var scene = stcdSceneGet(sceneId);
  if (!scene) { toast('场景不存在'); return; }
  var personaPath = '典型场景/' + (scene.name || '') + '/代表人物';
  var 已有代表 = STCD_INSPIRE.items.filter(function(c) { return (c.category || '').indexOf(personaPath) === 0; }).map(function(c) {
    return (typeof window.stcdInspire代表文本 === 'function') ? stcdInspire代表文本(c) : stcdInspireDisplayName(c);
  });
  // 现有的人物（各层级：身份「名字」）——供模型判断哪些身份已被某人占据，避免再造一个同职不同名的人
  var 已有层 = (scene.levels || []).map(function(lv) {
    var ppl = [];
    (lv.persons || []).forEach(function(p) { if (p.name) ppl.push((p.title ? p.title : '') + '「' + p.name + '」'); });
    (lv.groups || []).forEach(function(g) { (g.persons || []).forEach(function(p) { if (p.name) ppl.push((p.title ? p.title : '') + '「' + p.name + '」'); }); });
    return lv.name + '：' + (ppl.join('、') || '（空）');
  });
  STCD_INSPIRE_SCENEPERSONA = { 场景id: sceneId, 场景名: scene.name || '', 描述: scene.desc || '', 已有层: 已有层, 已有代表: 已有代表 };
  if (typeof openAiGenPanel === 'function') openAiGenPanel('stcd-inspire-scene-persona-gen');
  else toast('AI 弹窗未就绪');
}

// 选一个已有灵感角色挂到场景某层（作为该层的人）
function stcdInspireScenePickPerson(sceneId, levelIdx) {
  var items = STCD_INSPIRE.items;
  if (!items.length) { toast('暂无灵感角色可挂载——请先在「世界观」区创建'); return; }
  var h = '<div class="mcard" style="max-width:520px">';
  h += '<h3 style="font-size:0.95em;margin-bottom:10px">＋ 选择已有角色挂到这一层</h3>';
  h += '<div style="max-height:60vh;overflow-y:auto">';
  items.slice().reverse().forEach(function(it) {
    var nm = stcdInspireDisplayName(it);
    var cat = it.category || '';
    h += '<div style="display:flex;align-items:center;gap:8px;padding:6px;border-bottom:1px solid var(--border);cursor:pointer" onclick="stcdInspireScenePickConfirm(\'' + sceneId + '\',' + levelIdx + ',\'' + it.id + '\',this)">';
    h += '<span style="font-size:11px;color:var(--fg);font-weight:600;flex:1">' + escHtml(nm) + '</span>';
    if (cat) h += '<span style="font-size:9px;color:var(--fg3)">' + escHtml(cat) + '</span>';
    h += '</div>';
  });
  h += '</div></div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
}
function stcdInspireScenePickConfirm(sceneId, levelIdx, roleId, el) {
  var s = stcdSceneGet(sceneId);
  if (!s) return;
  var role = STCD_INSPIRE.items.filter(function(x) { return x.id === roleId; })[0];
  var name = role ? stcdInspireDisplayName(role) : '未命名';
  var title = (role && role.versions && role.versions.normal && role.versions.normal.identity && role.versions.normal.identity.title) || '';
  stcdSceneAddPersonSave(sceneId, levelIdx, name, title, roleId).then(function() {
    toast('已挂载');
    var ov = document.querySelector('.ovl');
    if (ov) ov.remove();
    stcdInspireSceneRefresh();
  });
}

// AI 生成整棵场景树（两步：先生成候选场景 → 用户挑一个 → 正式生成。走二元模板）
function stcdInspireSceneGen() {
  stcdInspireSceneOptInput('✨ AI 生成典型场景', '描述你想要的场景方向（如「后宫」「江南绸缎庄」「落第书院」；留空则 AI 自由发挥）', function(dir) {
    stcdInspireSceneTreeGenOptions(dir);
  });
}
// 第一步：生成候选场景（走二元模板 stcd-inspire-scene-tree-options）
function stcdInspireSceneTreeGenOptions(dir) {
  if (typeof getFieldInfo !== 'function' || typeof renderPrompt !== 'function' || typeof LLM === 'undefined' || !LLM.callJSON) { toast('AI 系统未就绪'); return; }
  var fi = getFieldInfo('stcd-inspire-scene-tree-options');
  if (!fi) { toast('AI 字段未就绪'); return; }
  var vars = fi.vars || {};
  vars.direction = dir || '（无特定方向，请自由发挥，给出 5 个各具特色的典型场景）';
  toast('正在生成候选场景…');
  var rendered = renderPrompt('inspire_scene_tree_options', Object.assign({}, vars));
  if (!rendered.user) { toast('模板渲染失败'); return; }
  LLM.callJSON({ label: '典型场景候选', system: rendered.system, prompt: rendered.user }).then(function(d) {
    if (typeof fi.fillFn === 'function') fi.fillFn(d);
    else toast('候选生成完成（无展示函数）');
  }).catch(function(e) { toast('候选生成失败：' + (e && e.message ? e.message : '未知')); });
}
// 展示候选场景选卡，用户点选一个 → 正式生成
function stcdInspireSceneTreeShowOptions(d) {
  var opts = (d && Array.isArray(d.options)) ? d.options : (Array.isArray(d) ? d : []);
  if (!opts.length) { toast('候选生成结果为空'); return; }
  var h = '<div class="mcard" style="max-width:640px">';
  h += '<h3 style="font-size:0.95em;margin-bottom:8px">✨ 挑选一个候选场景，再正式生成</h3>';
  h += '<p style="font-size:0.78em;color:var(--fg2);margin-bottom:10px">先看这 ' + opts.length + ' 个方向，点选一个作为正式生成的基础。</p>';
  h += '<div style="display:flex;flex-direction:column;gap:8px;max-height:56vh;overflow-y:auto">';
  opts.forEach(function(o) {
    var title = (o.title || ('候选' + o.id));
    var desc = (o.desc || '');
    h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px 12px;cursor:pointer" onclick="stcdInspireSceneTreePickOption(\'' + escHtml(JSON.stringify(o).replace(/'/g, "\\'")) + '\')">';
    h += '<div style="font-size:12px;font-weight:700;color:var(--accent2);margin-bottom:3px">' + escHtml(title) + '</div>';
    h += '<div style="font-size:11px;color:var(--fg2);line-height:1.6">' + escHtml(desc) + '</div>';
    h += '</div>';
  });
  h += '</div></div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
}
// 用户选中一个候选场景 → 正式生成（带补充说明框）
function stcdInspireSceneTreePickOption(optJson) {
  var o = null; try { o = JSON.parse(optJson); } catch(e) {}
  if (!o) return;
  var ov = document.querySelector('.ovl');
  if (ov) ov.remove();
  var chosen = (o.title ? ('【已选方向】' + o.title + '\n') : '') + (o.desc || '');
  stcdInspireSceneTreeRun(chosen);
}
// 正式生成场景（场景名+势力+描述+按地位分层的人，走 stcd-inspire-scene-tree-gen）
function stcdInspireSceneTreeRun(chosen) {
  if (typeof getFieldInfo !== 'function' || typeof renderPrompt !== 'function' || typeof LLM === 'undefined' || !LLM.callJSON) { toast('AI 系统未就绪'); return; }
  var fi = getFieldInfo('stcd-inspire-scene-tree-gen');
  if (!fi) { toast('AI 字段未就绪'); return; }
  var h = '<div class="mcard" style="max-width:560px">';
  h += '<h3 style="font-size:0.95em;margin-bottom:8px">✨ 生成典型场景</h3>';
  h += '<div style="font-size:11px;color:var(--fg2);line-height:1.6;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:8px 10px;margin-bottom:10px">' + escHtml(chosen) + '</div>';
  h += '<div class="mb-10"><label style="font-size:0.78em;color:var(--fg2);display:block;margin-bottom:3px">补充说明（可选）</label>';
  h += '<textarea id="scene-gen-dir" class="llm-input" rows="3" style="width:100%;min-height:70px;resize:vertical" placeholder="补充的创作指令，如：后宫的等级、主事者偏好…"></textarea></div>';
  h += '<div style="text-align:right;display:flex;gap:8px;justify-content:flex-end"><button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button><button class="btn-main" id="scene-gen-btn">🎯 生成</button></div>';
  h += '</div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  document.getElementById('scene-gen-btn').onclick = function() {
    var dir = (document.getElementById('scene-gen-dir').value || '').trim();
    ov.remove();
    var vars2 = { direction: chosen };
    if (dir) vars2.direction += '\n\n【用户补充】' + dir;
    var rendered = renderPrompt(fi.suggestPrompt, Object.assign({ text: '' }, vars2));
    if (!rendered.user) { toast('模板渲染失败'); return; }
    toast('典型场景生成中…');
    LLM.callJSON({ label: '典型场景生成', system: rendered.system, prompt: rendered.user }).then(function(d) {
      if (typeof fi.fillFn === 'function') fi.fillFn(d);
      else toast('生成完成（无填充函数）');
    }).catch(function(e) { toast('生成失败：' + (e && e.message ? e.message : '未知')); });
  };
}

// 从世界观导入场景：列出已导入世界的势力/地点条目，选一个转成典型场景
function stcdInspireSceneImportDialog() {
  var imported = (window.STCD_INSPIRE_IMPORT_LIST) ? window.STCD_INSPIRE_IMPORT_LIST : [];
  if (!imported.length) { toast('还没有已导入的世界——请先到「世界观」区导入'); return; }
  var h = '<div class="mcard" style="max-width:520px">';
  h += '<h3 style="font-size:0.95em;margin-bottom:10px">📥 从世界观导入典型场景</h3>';
  h += '<div style="max-height:60vh;overflow-y:auto">';
  imported.forEach(function(w) {
    var 内容 = w.内容 || {};
    Object.keys(内容).forEach(function(入口) {
      var items = 内容[入口] || [];
      items.forEach(function(it, idx) {
        var nm = it['条目'] || '未命名';
        var desc = (it['详细描述'] || '').substring(0, 40);
        h += '<div style="display:flex;align-items:center;gap:8px;padding:6px;border-bottom:1px solid var(--border);cursor:pointer" onclick="stcdInspireSceneImportConfirm(\'' + (w.世界名 || '') + '\',\'' + 入口 + '\',\'' + nm + '\',this)">';
        h += '<span style="font-size:11px;color:var(--fg);font-weight:600;flex:1">' + escHtml(nm) + '</span>';
        h += '<span style="font-size:9px;color:var(--fg3)">' + escHtml(w.世界名 || '') + ' · ' + 入口 + '</span>';
        h += '</div>';
      });
    });
  });
  h += '</div></div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
}
function stcdInspireSceneImportConfirm(世界名, 入口, 条目名, el) {
  var imported = (window.STCD_INSPIRE_IMPORT_LIST) ? window.STCD_INSPIRE_IMPORT_LIST : [];
  var desc = '';
  for (var i = 0; i < imported.length; i++) {
    if (imported[i].世界名 !== 世界名) continue;
    var items = (imported[i].内容 || {})[入口] || [];
    for (var j = 0; j < items.length; j++) { if (items[j]['条目'] === 条目名) { desc = items[j]['详细描述'] || ''; break; } }
  }
  stcdSceneImportFromWorld(世界名, 入口, 条目名, desc).then(function(scene) {
    toast('已导入场景：' + 条目名);
    var ov = document.querySelector('.ovl');
    if (ov) ov.remove();
    stcdInspireSceneOpen(scene.id);
  });
}

// ============ 场景区导出 ============
window.stcdSceneList = stcdInspireSceneList;
window.stcdInspireRenderScenes = stcdInspireRenderScenes;
window.stcdInspireRenderCharTab = stcdInspireRenderCharTab;
window.stcdInspireCharGen = stcdInspireCharGen;
window.stcdInspireCharOpenStudio = stcdInspireCharOpenStudio;
window.stcdInspireCharCloseStudio = stcdInspireCharCloseStudio;
window.stcdInspireRenderCharStudio = stcdInspireRenderCharStudio;
window.stcdInspireCharStudioGenerate = stcdInspireCharStudioGenerate;
window.stcdInspireCharGenRun = stcdInspireCharGenRun;
window.stcdInspireCharGenOptions = stcdInspireCharGenOptions;
window.stcdInspireCharShowOptions = stcdInspireCharShowOptions;
window.stcdInspireCharPickOption = stcdInspireCharPickOption;
window.stcdInspireCharSetGender = stcdInspireCharSetGender;
window.stcdInspireCharToggleStyle = stcdInspireCharToggleStyle;
window.stcdInspireCharSetMode = stcdInspireCharSetMode;
window.stcdInspireCharPickRef = stcdInspireCharPickRef;
window.stcdInspireCharClearRefs = stcdInspireCharClearRefs;
window.stcdInspireCharRemoveRef = stcdInspireCharRemoveRef;
window.stcdInspireCharRefsHtml = stcdInspireCharRefsHtml;
window.stcdInspireCharPickBase = stcdInspireCharPickBase;
window.stcdInspireCharClearBase = stcdInspireCharClearBase;
window.stcdInspireCharBaseHtml = stcdInspireCharBaseHtml;
window.stcdInspireCharBaseRefsHtml = stcdInspireCharBaseRefsHtml;
window.stcdInspireCharPickBaseRef = stcdInspireCharPickBaseRef;
window.stcdInspireCharRemoveBaseRef = stcdInspireCharRemoveBaseRef;
window.stcdInspireCharClearBaseRefs = stcdInspireCharClearBaseRefs;
window.stcdInspireSceneRemove = stcdInspireSceneRemove;
window.stcdInspireSceneDetail = stcdInspireSceneDetail;
window.stcdInspireSceneRename = stcdInspireSceneRename;
window.stcdInspireSceneOpen = stcdInspireSceneOpen;
window.stcdInspireSceneBack = stcdInspireSceneBack;
window.stcdInspireSceneGen = stcdInspireSceneGen;
window.stcdInspireSceneGenPersons = stcdInspireSceneGenPersons;
window.stcdInspireSceneGenPersona = stcdInspireSceneGenPersona;
window.stcdInspireSceneTreeGenOptions = stcdInspireSceneTreeGenOptions;
window.stcdInspireSceneTreeShowOptions = stcdInspireSceneTreeShowOptions;
window.stcdInspireSceneTreePickOption = stcdInspireSceneTreePickOption;
window.stcdInspireSceneTreeRun = stcdInspireSceneTreeRun;
window.stcdInspireSceneLevelGenOptions = stcdInspireSceneLevelGenOptions;
window.stcdInspireSceneLevelShowOptions = stcdInspireSceneLevelShowOptions;
window.stcdInspireSceneLevelPickOption = stcdInspireSceneLevelPickOption;
window.stcdInspireSceneLevelRun = stcdInspireSceneLevelRun;
window.stcdInspireSceneAddLevel = stcdInspireSceneAddLevel;
window.stcdInspireSceneRemoveLevel = stcdInspireSceneRemoveLevel;
window.stcdInspireSceneAddPerson = stcdInspireSceneAddPerson;
window.stcdInspireSceneRemovePerson = stcdInspireSceneRemovePerson;
window.stcdInspireSceneImportDialog = stcdInspireSceneImportDialog;
window.stcdInspireSceneImportConfirm = stcdInspireSceneImportConfirm;
window.stcdInspireScenePickPerson = stcdInspireScenePickPerson;
window.stcdInspireScenePickConfirm = stcdInspireScenePickConfirm;

function stcdInspireRenderCards() {
  var el = document.getElementById('stcd-inspire-cards');
  if (!el) return;
  var list = STCD_INSPIRE.items.filter(stcdInspireScopeMatch);
  if (!list.length) {
    el.innerHTML = '<div style="font-size:12px;color:var(--fg3);padding:20px 0;width:100%;text-align:center">暂无灵感角色——进入角色详情可在「✨ 生成」中创建</div>';
    return;
  }
  var h = '';
  list.forEach(function(it) {
    var name = stcdInspireDisplayName(it);
    // 版本内容回退：正常版 → 清凉版 → 深度版，取第一个有内容的版本
    var nv = null;
    var order = ['normal', 'cool', 'deep'];
    for (var oi = 0; oi < order.length; oi++) {
      var vv = it.versions ? it.versions[order[oi]] : null;
      if (!vv) continue;
      var hasContent = false;
      ['identity', 'clothing', 'appearance'].forEach(function(bk) {
        var block = vv[bk];
        if (block && typeof block === 'object') {
          for (var fk in block) {
            if (Object.prototype.hasOwnProperty.call(block, fk) && block[fk]) { hasContent = true; break; }
          }
        }
      });
      if (hasContent) { nv = vv; break; }
    }
    // 版本缩略图：正常版 → 清凉版 → 深度版，取第一个有图的版本
    var thumb = null;
    if (it.avatars) {
      for (var ti = 0; ti < order.length; ti++) {
        if (it.avatars[order[ti]]) { thumb = it.avatars[order[ti]]; break; }
      }
    }
    // 年龄：与缩略图同优先级，取第一个有年龄的版本
    var age = '';
    if (it.versions) {
      for (var ai = 0; ai < order.length; ai++) {
        var av = it.versions[order[ai]];
        if (av && av.identity && av.identity.age) { age = av.identity.age; break; }
      }
    }
    // 次要信息（与生图成果一致：头衔 · 年龄岁 · 种族 用 · 连接）：从 nv 取 头衔(identity.title) / 种族(identity.race)
    var info = '';
    if (nv) {
      var 头衔 = (nv.identity && nv.identity.title) || (nv.clothing && nv.clothing.top) || '';
      var 种族 = (nv.identity && nv.identity.race) || '';
      info = [头衔, age ? (age + '岁') : '', 种族].filter(Boolean).join(' · ');
    }
    // 角色卡（与「生图成果」卡片 UI 完全一致：180px 竖版，3:4 上图，11px 名称 + 9px 头衔·年龄·种族）
    h += '<div style="width:180px;background:var(--card);border:1px solid var(--border);border-radius:8px;cursor:pointer;flex-shrink:0;overflow:hidden;display:flex;flex-direction:column" onclick="stcdInspireView(\'' + it.id + '\')">';
    // 竖版图片区（固定比例 3:4）
    h += '<div style="width:100%;aspect-ratio:3/4;background:var(--bg2);overflow:hidden;position:relative">';
    if (thumb) {
      h += '<img src="' + thumb + '" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.style.display=\'none\'" />';
    } else {
      h += '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--fg3);font-size:28px">🖼</div>';
    }
    h += '</div>';
    // 名称 + 次要信息（头衔 · 年龄 · 种族）
    h += '<div style="padding:6px 8px">';
    h += '<div style="font-size:11px;color:var(--fg);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(name) + '</div>';
    if (info) h += '<div style="font-size:9px;color:var(--fg3);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(info) + '</div>';
    h += '</div></div>';
  });
  el.innerHTML = h;
}

// 点击角色卡 → 弹窗（3 版本卡片并排）
function stcdInspireView(id) {
  var it = STCD_INSPIRE.items.filter(function(x) { return x.id === id; })[0] || null;
  if (!it) return;
  STCD_INSPIRE_CURRENT = it;
  var name = stcdInspireDisplayName(it);
  var h = '<div class="mcard" style="max-width:900px;width:90vw;max-height:85vh;display:flex;flex-direction:column">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;flex-shrink:0">';
  h += '<div style="font-size:14px;color:var(--fg);font-weight:700">' + escHtml(name) + '</div>';
  if (it.category) h += '<span style="font-size:10px;color:var(--fg3);background:var(--bg2);padding:2px 8px;border-radius:3px">' + escHtml(it.category) + '</span>';
  h += '<div style="flex:1"></div>';
  h += '<button class="btn-out" style="padding:3px 10px;font-size:11px" onclick="stcdInspireCopyCtx(\'' + it.id + '\')">📋 复制上下文</button>';
  h += '<button class="btn-out" style="padding:3px 10px;font-size:11px;color:#e06c75" onclick="stcdInspireDeleteForm()">🗑 删除角色</button>';
  h += '</div>';
  // 3 版本卡片并排（内容区可滚动）
  h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;overflow-y:auto;flex:1;min-height:0;padding-right:4px">';
  STCD_INSPIRE_VERSIONS.forEach(function(v) {
    h += stcdInspireRenderVersionCard(it, v);
  });
  h += '</div>';
  h += '<div style="text-align:right;margin-top:10px;flex-shrink:0"><button class="btn-main" onclick="this.closest(\'.ovl\').remove()">关闭</button></div>';
  h += '</div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
}

// 渲染单版本图片区（有图显示 + 点击预览 + 换图/删图；无图显示占位 + 上传）
function stcdInspireRenderVersionImage(it, version) {
  var av = it.avatars ? it.avatars[version] : null;
  if (av) {
    return '<div style="margin-bottom:8px;text-align:center">'
      + '<img src="' + av + '" style="max-width:100%;max-height:140px;border-radius:6px;border:1px solid var(--border);object-fit:contain;background:var(--card);cursor:zoom-in" onclick="event.stopPropagation();stcdInspirePreviewVersionImage(\'' + it.id + '\',\'' + version + '\')" title="点击预览" />'
      + '<div style="display:flex;gap:4px;justify-content:center;margin-top:4px">'
      + '<button class="btn-out" style="padding:2px 8px;font-size:10px" onclick="event.stopPropagation();stcdInspireUploadImageForm(\'' + it.id + '\',\'' + version + '\')">🔄 换图</button>'
      + '<button class="btn-out" style="padding:2px 8px;font-size:10px;color:#e06c75" onclick="event.stopPropagation();stcdInspireRemoveImage(\'' + it.id + '\',\'' + version + '\')">🗑 删图</button>'
      + '</div></div>';
  }
  // 零锁定：无图时显示占位 + 上传按钮
  return '<div style="margin-bottom:8px;text-align:center">'
    + '<div style="height:80px;display:flex;align-items:center;justify-content:center;border:1px dashed var(--border);border-radius:6px;color:var(--fg3);font-size:10px;background:var(--card)">暂无图片</div>'
    + '<button class="btn-out" style="padding:2px 8px;font-size:10px;margin-top:4px" onclick="event.stopPropagation();stcdInspireUploadImageForm(\'' + it.id + '\',\'' + version + '\')">📷 上传图片</button>'
    + '</div>';
}

// 上传图片表单（动态文件选择器 → dataURL → 存盘 → 刷新详情）
function stcdInspireUploadImageForm(id, version) {
  var it = STCD_INSPIRE.items.filter(function(x) { return x.id === id; })[0] || null;
  if (!it) return;
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.display = 'none';
  document.body.appendChild(input);
  input.addEventListener('change', function(e) {
    var file = e.target.files && e.target.files[0];
    document.body.removeChild(input);
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      toast('图片上传中…');
      stcdInspireUploadImage(it, version, ev.target.result).then(function(ok) {
        if (!ok) { toast('图片保存失败'); return; }
        toast('图片已上传');
        var ov = document.querySelector('.ovl');
        if (ov) ov.remove();
        stcdInspireView(it.id);
      });
    };
    reader.onerror = function() { toast('读取文件失败'); };
    reader.readAsDataURL(file);
  });
  input.click();
}

// 删除版本图片
function stcdInspireRemoveImage(id, version) {
  var it = STCD_INSPIRE.items.filter(function(x) { return x.id === id; })[0] || null;
  if (!it) return;
  confirmDialog('确定删除「' + STCD_INSPIRE_VERSION_LABELS[version].slice(2) + '」图片？', function() {
    stcdInspireDeleteImage(it, version).then(function(ok) {
      toast(ok ? '图片已删除' : '删除失败');
      var ov = document.querySelector('.ovl');
      if (ov) ov.remove();
      stcdInspireView(it.id);
    });
  });
}

// 图片大图预览（详情弹窗内版本卡片图片点击触发，全屏覆盖层，点击任意处关闭）
function stcdInspirePreviewVersionImage(id, version) {
  var it = STCD_INSPIRE.items.filter(function(x) { return x.id === id; })[0] || null;
  if (!it) return;
  var img = it.avatars ? it.avatars[version] : null;
  if (!img) return;
  var name = stcdInspireDisplayName(it);
  var label = STCD_INSPIRE_VERSION_LABELS[version] || version;
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:zoom-out';
  ov.innerHTML = '<div style="color:var(--fg2);font-size:13px;margin-bottom:10px">' + escHtml(name) + ' · ' + label + ' · 点击任意处关闭</div>'
    + '<img src="' + img + '" style="max-width:92vw;max-height:85vh;border-radius:8px;border:1px solid var(--border);object-fit:contain;background:#111" />';
  ov.addEventListener('click', function() { ov.remove(); });
  document.body.appendChild(ov);
}

// 渲染单版本卡片（只读，按区块分组；标题行带生成按钮）
function stcdInspireRenderVersionCard(it, version) {
  var vdata = stcdInspireGetVersion(it, version);
  var fields = (typeof window.stcdInspireGetFields === 'function')
    ? window.stcdInspireGetFields(version) : STCD_INSPIRE_FIELDS;
  var currentGender = stcdInspireGetField(vdata, 'identity.gender') || '';
  var genitalsLabel = (typeof window.stcdInspireGetGenitalsLabel === 'function')
    ? window.stcdInspireGetGenitalsLabel(currentGender) : '生殖器官';
  var h = '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;max-height:calc(85vh - 100px);overflow-y:auto">';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">';
  h += '<div style="font-size:11px;color:var(--accent);font-weight:600">' + STCD_INSPIRE_VERSION_LABELS[version] + '</div>';
  h += '<div style="display:flex;gap:6px">';
  h += '<button class="btn-out" style="padding:2px 8px;font-size:10px;color:var(--accent2)" onclick="event.stopPropagation();stcdInspireGenVersionFill(\'' + it.id + '\',\'' + version + '\')">🔧 补充生成</button>';
  h += '<button class="btn-main" style="padding:2px 8px;font-size:10px" onclick="event.stopPropagation();stcdInspireGenVersion(\'' + it.id + '\',\'' + version + '\')">✨ 生成</button>';
  h += '</div>';
  h += '</div>';
  // 版本图片（上传/换图/删图）
  h += stcdInspireRenderVersionImage(it, version);
  var hasAny = false;
  fields.forEach(function(block) {
    var blockParts = [];
    block.fields.forEach(function(f) {
      var path = block.block + '.' + f.key;
      var val = stcdInspireGetField(vdata, path);
      if (val) {
        var label = f.key === 'genitals' ? genitalsLabel : f.label;
        var valHtml = Array.isArray(val)
          ? '<div style="margin-top:1px">' + val.map(function(s) { return '<div>' + escHtml(s) + '</div>'; }).join('') + '</div>'
          : escHtml(val);
        blockParts.push('<div style="margin-top:2px;font-size:10px"><span style="color:var(--fg3)">' + escHtml(label) + '：</span>' + valHtml + '</div>');
        hasAny = true;
      }
    });
    if (blockParts.length) {
      h += '<div style="font-size:10px;color:var(--fg);font-weight:600;margin-top:6px;border-bottom:1px dashed var(--border);padding-bottom:2px">' + block.blockLabel + '</div>';
      blockParts.forEach(function(r) { h += r; });
    }
  });
  if (!hasAny) h += '<div style="font-size:10px;color:var(--fg3)">（本版本暂无内容）</div>';
  h += '</div>';
  return h;
}

// 打开 AI 生成弹窗（描述/性别/生成模式）
var STCD_INSPIRE_GEN = { desc: '', gender: '女' };
// 导入世界 · 级别/职位生成的目标定位（在打开弹窗前写入，供二元模板 fillFn 定位写入）
// 本文件为非 IIFE，顶层 var 即可作为全局，data 层 fillFn 可直接读到
var STCD_INSPIRE_LVGEN = { 世界名: '', 入口: '', itemIdx: -1, 条目名: '', 详细: '', 上下文: '' };
var STCD_INSPIRE_POSGEN = { 世界名: '', 入口: '', itemIdx: -1, 级别Idx: -1, 条目名: '', levelName: '', levelDesc: '' };
var STCD_INSPIRE_PERSONAGEN = { 世界名: '', 入口: '', itemIdx: -1, 条目名: '', 详细: '', 上下文: '' };
var STCD_INSPIRE_SCENEGEN = { 场景id: '', 场景名: '', 描述: '', 已有层: [] };
var STCD_INSPIRE_PERSONADD = { 场景id: '', levelIdx: -1, 场景名: '', 描述: '', 已有层: [], 目标层: '', 该层已有: [] };
var STCD_INSPIRE_SCENEPERSONA = { 场景id: '', 场景名: '', 描述: '', 已有层: [], 已有代表: [] };
var STCD_INSPIRE_CHARGEN = { name: '', ref: '', mode: 'gen' };
var STCD_INSPIRE_CHAR_REFS = [];   // 多卡混搭 · 参考角色对象数组
var STCD_INSPIRE_CHAR_BASE = null; // 深化已有 · 要深化的基座角色对象
var STCD_INSPIRE_CHAR_BASE_REFS = []; // 深化已有 · 参照用的参考角色对象数组
var STCD_INSPIRE_CHAR_VIEW = { mode: 'list' };  // 'list' | 'studio'（典型角色创作台）
// 卡片生成按钮：对指定角色补全/重新生成版本（描述 + 3 版本多选）
function stcdInspireGenFor(id) {
  var it = STCD_INSPIRE.items.filter(function(x) { return x.id === id; })[0] || null;
  if (!it) return;
  var nv = it.versions ? it.versions.normal : null;
  var cv = it.versions ? it.versions.cool : null;
  var dv = it.versions ? it.versions.deep : null;
  // 预填描述：normal 版身份/人生经历
  var preDesc = '';
  if (nv) {
    var parts = [];
    if (nv.identity && nv.identity.name) parts.push(nv.identity.name);
    if (nv.identity && nv.identity.title) parts.push(nv.identity.title);
    if (nv.identity && nv.identity.lifeExperience) parts.push(nv.identity.lifeExperience);
    preDesc = parts.join('，');
  }
  var name = stcdInspireDisplayName(it);
  var h = '<div class="mcard" style="max-width:460px">';
  h += '<h3 style="font-size:0.95em;margin-bottom:10px">✨ 生成：' + escHtml(name) + (it.category ? ' <span style="font-size:10px;color:var(--fg3);background:var(--bg2);padding:2px 6px;border-radius:3px">' + escHtml(it.category) + '</span>' : '') + '</h3>';
  h += '<div style="margin-bottom:8px"><label style="font-size:0.8em;color:var(--fg2);display:block;margin-bottom:3px">描述（可修改）</label>';
  h += '<textarea id="stcd-genfor-desc" class="llm-input" style="width:100%;min-height:60px;resize:vertical" placeholder="留空则 AI 自行决定">' + escHtml(preDesc) + '</textarea></div>';
  h += '<div style="display:flex;gap:8px;justify-content:flex-end">';
  h += '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>';
  h += '<button class="btn-main" id="stcd-genfor-btn">🎯 生成</button>';
  h += '</div></div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  document.getElementById('stcd-genfor-btn').onclick = function() {
    var desc = (document.getElementById('stcd-genfor-desc').value || '').trim();
    var gender = (nv && nv.identity && nv.identity.gender) || '女';
    STCD_INSPIRE_GEN = { desc: desc, gender: gender, category: it.category || '', targetId: it.id };
    ov.remove();
    stcdInspireGenRun();
  };
}

function stcdInspireGenOpen() {
  var tree = (typeof window.stcdInspireCategoryTree === 'function') ? window.stcdInspireCategoryTree() : [];
  var h = '<div class="mcard" style="max-width:480px">';
  h += '<h3 style="font-size:0.95em;margin-bottom:10px">✨ AI 生成灵感角色</h3>';
  h += '<div style="margin-bottom:8px"><label style="font-size:0.8em;color:var(--fg2);display:block;margin-bottom:3px">角色描述 *</label>';
  h += '<textarea id="stcd-gen-desc" class="llm-input" style="width:100%;min-height:80px;resize:vertical" placeholder="例：大理寺女狱丞，冷硬警觉，私藏囚犯体液…"></textarea></div>';
  h += '<div style="display:flex;gap:8px;margin-bottom:8px">';
  h += '<div style="flex:1"><label style="font-size:0.8em;color:var(--fg2);display:block;margin-bottom:3px">性别</label>';
  h += '<select id="stcd-gen-gender" class="llm-input llm-select" style="width:100%">';
  ['女', '男', '扶她', '伪娘'].forEach(function(g) {
    h += '<option value="' + g + '"' + (g === STCD_INSPIRE_GEN.gender ? ' selected' : '') + '>' + g + '</option>';
  });
  h += '</select></div>';
  h += '</div>';
  // 三级分类选择器（级联）
  h += '<div style="margin-bottom:8px"><label style="font-size:0.8em;color:var(--fg2);display:block;margin-bottom:3px">分类（世界观可逐级细分）</label>';
  h += '<div id="stcd-gen-classes" style="display:flex;gap:6px;flex-wrap:wrap"></div>';
  h += '</div>';
  h += '<div style="display:flex;gap:8px;justify-content:flex-end">';
  h += '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>';
  h += '<button class="btn-main" id="stcd-gen-btn">🎯 生成</button>';
  h += '</div></div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  // 动态渲染分类级联下拉
  window.stcdGenClassRender();
  document.getElementById('stcd-gen-btn').onclick = function() {
    var desc = (document.getElementById('stcd-gen-desc').value || '').trim();
    STCD_INSPIRE_GEN.desc = desc;
    STCD_INSPIRE_GEN.gender = document.getElementById('stcd-gen-gender').value;
    // 分类：从所有级联下拉收集路径
    STCD_INSPIRE_GEN.category = window.stcdGenClassCollect();
    ov.remove();
    // 直接生成（不走 openAiGenPanel，避免双弹窗）
    stcdInspireGenRun();
  };
}

// 单版本生成：详情弹窗内每个版本卡片的「✨ 生成」按钮
function stcdInspireGenVersion(id, version) {
  var it = STCD_INSPIRE.items.filter(function(x) { return x.id === id; })[0] || null;
  if (!it) { toast('角色不存在'); return; }
  if (typeof LLM === 'undefined' || !LLM.callJSON) { toast('AI 系统未就绪'); return; }
  STCD_INSPIRE_CURRENT = it;
  STCD_INSPIRE_GEN.targetId = it.id;
  STCD_INSPIRE_GEN.gender = stcdInspireGetField(stcdInspireGetVersion(it, 'normal'), 'identity.gender') || '女';
  STCD_INSPIRE_GEN.category = it.category || '';
  STCD_INSPIRE_GEN.fromDetail = true;
  if (version === 'normal') {
    // 正常版：从描述生成（走正常版模板）
    var desc = stcdInspireGetField(stcdInspireGetVersion(it, 'normal'), 'identity.name') || '';
    var life = stcdInspireGetField(stcdInspireGetVersion(it, 'normal'), 'identity.lifeExperience') || '';
    if (life) desc = desc ? desc + '，' + life : life;
    STCD_INSPIRE_GEN.desc = desc;
    stcdInspireGenRun();
  } else {
    // 清凉/深度版：基于正常版派生（base 从磁盘读取）
    toast('正在派生' + STCD_INSPIRE_VERSION_LABELS[version] + '…');
    stcdInspireGenDerive(version, it).then(function(ok) {
      if (ok) {
        toast(STCD_INSPIRE_VERSION_LABELS[version] + '已生成');
        // 重新打开详情弹窗刷新内容
        var ov = document.querySelector('.ovl');
        if (ov) ov.remove();
        stcdInspireView(it.id);
      } else {
        toast('派生失败');
      }
    }).catch(function(e) {
      toast('派生失败：' + (e && e.message ? e.message : '未知'));
    });
  }
}

// 补充生成（详情弹窗「🔧 补充生成」）：保留已填字段，只补空字段；走二元模板 stcd-inspire-gen-fill
function stcdInspireGenVersionFill(id, version) {
  var it = STCD_INSPIRE.items.filter(function(x) { return x.id === id; })[0] || null;
  if (!it) { toast('角色不存在'); return; }
  if (typeof openAiGenPanel !== 'function') { toast('AI 弹窗未就绪'); return; }
  STCD_INSPIRE_CURRENT = it;
  STCD_INSPIRE_GEN.targetId = it.id;
  STCD_INSPIRE_GEN.fillVersion = version;
  STCD_INSPIRE_GEN.gender = stcdInspireGetField(stcdInspireGetVersion(it, 'normal'), 'identity.gender') || '女';
  STCD_INSPIRE_GEN.category = it.category || '';
  openAiGenPanel('stcd-inspire-gen-fill');
}

// 直接运行 AI 生成（单弹窗：自定义弹窗收集参数 → 渲染模板 → LLM.callJSON → fillFn）
function stcdInspireGenRun() {
  var fi = (typeof getFieldInfo === 'function') ? getFieldInfo('stcd-inspire-gen') : null;
  if (!fi) { toast('AI 字段未就绪'); return; }
  if (typeof renderPrompt !== 'function' || typeof LLM === 'undefined' || !LLM.callJSON) {
    toast('AI 系统未就绪'); return;
  }
  var ctx = fi.context || '';
  var rendered = renderPrompt('inspire_char_gen', Object.assign({ text: ctx }, fi.vars || {}));
  if (!rendered.user) { toast('模板渲染失败'); return; }
  toast('灵感角色生成中…');
  LLM.callJSON({
    label: '灵感角色生成',
    system: rendered.system,
    prompt: rendered.user,
  }).then(function(d) {
    if (typeof fi.fillFn === 'function') fi.fillFn(d);
  }).catch(function(e) {
    toast('生成失败：' + (e && e.message ? e.message : '未知'));
  });
}

// ===== 生成弹窗 · 分类级联（任意深度递归）=====
// 渲染 `#stcd-gen-classes` 容器内的级联下拉：第一个是顶级大类（含「未分类」），
// 选中某层后递归追加下一层下拉；每层都是独立的 select，由下一层的 onChange 驱动。
// 按当前分区 mode 决定根节点：world → 世界观下的世界；other → 其他 6 类。
function stcdGenClassRoot() {
  var tree = (typeof window.stcdInspireCategoryTree === 'function') ? window.stcdInspireCategoryTree() : [];
  if (STCD_INSPIRE_SCOPE && STCD_INSPIRE_SCOPE.mode === 'world') {
    // 世界观一律来自「导入世界观」：用已导入的世界/入口/条目构建分类级联
    var imported = (window.STCD_INSPIRE_IMPORT_LIST) ? window.STCD_INSPIRE_IMPORT_LIST : [];
    var worlds = imported.map(function(w) {
      var 内容 = w.内容 || {};
      var 入口 = Object.keys(内容).map(function(k) {
        var items = 内容[k] || [];
        return { name: k, children: items.map(function(it) { return { name: it['条目'] || '未命名', children: [] }; }) };
      });
      return { name: w.世界名 || '未命名', children: 入口 };
    });
    return { children: worlds, prefix: '世界观/' };
  }
  // 其它模式（典型场景）：不走分类级联
  return { children: [], prefix: '' };
}

function stcdGenClassRender() {
  var el = document.getElementById('stcd-gen-classes');
  if (!el) return;
  var root = stcdGenClassRoot();
  var children = root.children;
  var h = '';
  // 收集已选路径（从已存在的下拉读），用于重建时保持已选层级
  var selects = el.querySelectorAll('select[data-class-idx]');
  var sel = [];
  for (var i = 0; i < selects.length; i++) sel[i] = selects[i].value || '';
  // 逐层生成下拉：第 0 层 = 顶级大类；第 N 层 = 前一层选中的 children
  var curChildren = children;
  var depth = 0;
  var picked = [];
  while (true) {
    if (!curChildren || !curChildren.length) break;
    h += '<select class="llm-input llm-select" style="flex:1;min-width:100px;font-size:11px" data-class-idx="' + depth + '" onchange="stcdGenClassChange(' + depth + ')">';
    h += '<option value="">' + (depth === 0 ? '未分类' : '—') + '</option>';
    curChildren.forEach(function(nd) {
      var val = nd.name;
      h += '<option value="' + val + '"' + (sel[depth] === val ? ' selected' : '') + '>' + val + '</option>';
    });
    h += '</select>';
    var chosen = (depth < sel.length) ? sel[depth] : '';
    // 选中的值必须存在，否则停（未选满一层）
    if (!chosen) break;
    picked.push(chosen);
    curChildren = stcdGenClassRoot().children && stcdTreeChildrenOf(root, picked) || [];
    depth++;
  }
  el.innerHTML = h;
}

// 从根 children 沿 picked 名字下钻
function stcdTreeChildrenOf(root, picked) {
  var cur = root.children;
  for (var i = 0; i < picked.length; i++) {
    var found = null;
    for (var j = 0; j < cur.length; j++) {
      if (cur[j].name === picked[i]) { found = cur[j]; break; }
    }
    if (!found || !found.children) return [];
    cur = found.children;
  }
  return cur;
}

// 某层下拉变化：清掉它之后所有层，并根据新选择追加下一层下拉
function stcdGenClassChange(depth) {
  var el = document.getElementById('stcd-gen-classes');
  if (!el) return;
  var selects = el.querySelectorAll('select[data-class-idx]');
  // 删除该层之后的 select
  for (var i = selects.length - 1; i > depth; i--) {
    if (selects[i] && selects[i].parentNode) selects[i].parentNode.removeChild(selects[i]);
  }
  // 重新完整渲染（stcdGenClassRender 会从现存 select 读取已选层级）
  stcdGenClassRender();
}

// 收集所有级联下拉的选中路径（跳过空值），拼成 category 路径字符串
function stcdGenClassCollect() {
  var el = document.getElementById('stcd-gen-classes');
  if (!el) return '';
  var out = [];
  var selects = el.querySelectorAll('select[data-class-idx]');
  for (var i = 0; i < selects.length; i++) {
    var v = selects[i].value || '';
    if (v) out.push(v);
  }
  var path = out.join('/');
  // 世界模式：加「世界观/」前缀
  if (STCD_INSPIRE_SCOPE && STCD_INSPIRE_SCOPE.mode === 'world' && path) {
    return '世界观/' + path;
  }
  return path;
}

// 切换版本（保持编辑/查看状态）
function stcdInspireSwitchVersion(v) {
  STCD_INSPIRE_VIEW.version = v;
  // 详情弹窗版本切换通过 stcdInspireView 重新渲染实现；此处仅作兜底，避免悬空引用
  if (typeof stcdInspireRenderDetail === 'function') stcdInspireRenderDetail();
}

// 当前弹窗查看的角色（供删除/复制使用）
var STCD_INSPIRE_CURRENT = null;

function stcdInspireDeleteForm() {
  var it = STCD_INSPIRE_CURRENT;
  if (!it) return;
  confirmDialog('确定删除灵感角色「' + stcdInspireDisplayName(it) + '」？', function() {
    stcdInspireDelete(it.id).then(function() {
      toast('已删除');
      var ov = document.querySelector('.ovl');
      if (ov) ov.remove();
      STCD_INSPIRE_CURRENT = null;
      // 刷新整个灵感区：重新读取数据 + 更新顶部「共 N 个」计数 + 重绘当前分区内容
      var root = STCD_INSPIRE_VIEW._rootEl;
      if (root && root.innerHTML !== undefined) {
        stcdInspireRender(root);
      } else {
        stcdInspireRenderCards();
      }
    });
  });
}

// 复制角色上下文（AI 调用用）——走全局唯一入口 window.灵感角色全部(角色, 版本)
// 弹窗内复制全部 3 版本上下文
function stcdInspireCopyCtx(id) {
  var it = STCD_INSPIRE.items.filter(function(x) { return x.id === id; })[0] || null;
  if (!it) { toast('角色不存在'); return; }
  var parts = [];
  STCD_INSPIRE_VERSIONS.forEach(function(v) {
    var ctx = (typeof window.灵感角色全部 === 'function') ? window.灵感角色全部(it, v) : '';
    if (ctx) parts.push('【' + STCD_INSPIRE_VERSION_LABELS[v].slice(2) + '】\n' + ctx);
  });
  var text = parts.join('\n\n');
  if (!text) { toast('角色无内容'); return; }
  复制到剪贴板(text).then(function(ok) { toast(ok ? '上下文已复制（全部版本）' : '复制失败'); });
}

window.stcdInspireRender = stcdInspireRender;
window.stcdInspireRenderCards = stcdInspireRenderCards;
window.stcdInspireView = stcdInspireView;
window.stcdInspireSwitchVersion = stcdInspireSwitchVersion;
window.stcdInspireDeleteForm = stcdInspireDeleteForm;
window.stcdInspireCopyCtx = stcdInspireCopyCtx;
window.stcdInspireGenOpen = stcdInspireGenOpen;
window.stcdInspireGenFor = stcdInspireGenFor;
window.stcdInspireGenRun = stcdInspireGenRun;
window.stcdInspireGenVersion = stcdInspireGenVersion;
window.stcdInspireGenVersionFill = stcdInspireGenVersionFill;
window.stcdInspireUploadImageForm = stcdInspireUploadImageForm;
window.stcdInspireRemoveImage = stcdInspireRemoveImage;
window.stcdInspirePreviewVersionImage = stcdInspirePreviewVersionImage;
window.stcdGenClassRender = stcdGenClassRender;
window.stcdGenClassChange = stcdGenClassChange;
window.stcdGenClassCollect = stcdGenClassCollect;
window.stcdInspireSetScope = stcdInspireSetScope;
window.stcdInspireRenderWorld = stcdInspireRenderWorld;
window.stcdInspireWorldLevel = stcdInspireWorldLevel;
window.stcdInspireWorldToggle = stcdInspireWorldToggle;
