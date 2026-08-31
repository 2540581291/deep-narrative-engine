// 深度-叙事引擎 · 首页（小部件面板版）
// 每个顶层模块一个小部件，可自由添加/移除/排序，配置存 localStorage
// 数据：启动时聚合一次成快照（window.HOME_SNAPSHOT），页面只读快照

var HOME_CFG_KEY = 'home_widgets_cfg';

function 首页小部件配置() {
  try {
    var raw = localStorage.getItem(HOME_CFG_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return { enabled: (window.HOME_WIDGET_DEFAULT || []).slice() };
}

function 保存首页小部件配置(cfg) {
  try { localStorage.setItem(HOME_CFG_KEY, JSON.stringify(cfg)); } catch(e) {}
}

function renderDashboard(el) {
  var cfg = 首页小部件配置();
  var html = '<style>'
    + '@media (max-width:1100px){.role-wall{grid-template-columns:repeat(6,1fr)!important}}'
    + '@media (max-width:900px){.role-wall{grid-template-columns:repeat(4,1fr)!important}}'
    + '</style>';
  html += '<div class="dash-head" style="display:flex;align-items:center;gap:10px;margin-bottom:18px">'
    + '<div><div class="dash-title">总览</div><div class="page-sub" style="color:var(--fg3);font-size:11px;margin-top:2px">Overview · 自由组合你的创作面板</div></div>'
    + '<div style="flex:1"></div>'
    + '<button class="btn-out" style="padding:6px 14px;font-size:11px" onclick="打开首页小部件面板()">＋ 添加小部件</button>'
    + '</div>';
  html += '<div id="homeWidgetGrid" style="display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:minmax(120px,auto);gap:12px;grid-auto-flow:dense"></div>';
  el.innerHTML = html;

  // 数据快照（复用内存缓存，避免重复聚合）
  if (window.HOME_SNAPSHOT) {
    渲染小部件网格(el, cfg);
  } else {
    Promise.resolve(typeof 聚合首页数据 === 'function' ? 聚合首页数据() : {}).then(function(snap){
      window.HOME_SNAPSHOT = snap;
      渲染小部件网格(el, cfg);
    });
  }
}

// 刷新首页网格（不重建整个页面，用于添加/移除后即时更新）
function 刷新首页网格() {
  var grid = document.getElementById('homeWidgetGrid');
  if (!grid) return;
  if (!window.HOME_SNAPSHOT) {
    // 快照未就绪：等聚合完成后刷新
    Promise.resolve(typeof 聚合首页数据 === 'function' ? 聚合首页数据() : {}).then(function(){
      var g = document.getElementById('homeWidgetGrid');
      if (g) 渲染小部件网格(null, 首页小部件配置());
    });
    return;
  }
  渲染小部件网格(null, 首页小部件配置());
}

function 渲染小部件网格(el, cfg) {
  var grid = document.getElementById('homeWidgetGrid');
  if (!grid) return;
  var snap = window.HOME_SNAPSHOT || {};
  var enabled = (cfg.enabled || []).filter(function(id){
    return id === 'stats' || window.HOME_WIDGET_BY_ID[id];
  });
  if (!enabled.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;padding:50px;text-align:center;color:var(--fg3);border:1px dashed var(--border);border-radius:12px">首页还是空的 — 点右上角「＋ 添加小部件」添加你的创作模块</div>';
    return;
  }
  grid.innerHTML = enabled.map(function(id, idx){
    if (id === 'stats') return 统计小部件HTML(snap.stats);
    var w = window.HOME_WIDGET_BY_ID[id];
    if (!w) return '';
    if (w.virtual) return 区块总览小部件HTML(w, snap[id] || {}, idx, enabled.length);
    // 大卡片：角色卡、生图成果（占 6 个小卡片面积 = 2 行 × 3 列）
    if (id === 'character') return 角色卡大卡片HTML(snap.character || {}, idx, enabled.length);
    if (id === 'sheng-tu-cheng-guo') return 生图成果大卡片HTML(snap['sheng-tu-cheng-guo'] || {}, idx, enabled.length);
    if (id === 'today-char') return 今日角色小部件HTML(snap['today-char'] || {}, idx, enabled.length);
    var d = snap[id] || { count: 0, latest: [] };
    return 模块小部件HTML(w, d, idx, enabled.length);
  }).join('');
}

// 统计小部件（创作总览 · 中卡：横跨整行 3 列，6 个数字横向铺开）
function 统计小部件HTML(s) {
  s = s || {};
  return '<div class="home-widget" style="grid-column:1/-1;background:linear-gradient(120deg,var(--card2),var(--card));border:1px solid var(--border);border-radius:12px;padding:16px 20px">'
    + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">'
    + '<span style="font-size:16px">📊</span><b style="font-size:12px;flex:1">创作总览</b>'
    + '<span style="font-size:10px;color:var(--fg3)">累计 ' + (s.totalRecords||0) + ' 次 AI 调用</span>'
    + '<span class="hw-del" style="cursor:pointer;color:var(--fg3);font-size:12px" title="移除" onclick="移除首页小部件(\'stats\')">✕</span></div>'
    + '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px">'
    + 小数字('角色', s.charCount||0) + 小数字('小说', s.novelCount||0) + 小数字('短章', s.vignetteCount||0)
    + 小数字('灵感', s.inspCount||0) + 小数字('Token', fmtW(s.totalTokens||0)) + 小数字('成本', '¥' + (s.totalCost||0).toFixed(1))
    + '</div></div>';
}

// 区块总览小部件（该区块所有模块的汇总）
function 区块总览小部件HTML(w, d, idx, total) {
  var rows = (d.rows||[]).slice(0, 6);
  var rowHtml = rows.length ? rows.map(function(r){
    return '<div style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:10px;color:var(--fg2)">'
      + '<span style="font-size:12px">' + r.icon + '</span>'
      + '<span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(r.label) + '</span>'
      + '<span style="color:var(--accent);font-weight:700;flex-shrink:0">' + r.count + '</span></div>';
  }).join('') : '<div style="font-size:10px;color:var(--fg3);padding:4px 0">暂无内容</div>';
  return '<div class="home-widget" data-wid="' + w.id + '" style="background:linear-gradient(160deg,var(--card2),var(--card));border:1px solid var(--border);border-radius:12px;padding:14px 16px">'
    + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">'
    + '<span style="font-size:18px">' + (w.icon||'📁') + '</span>'
    + '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:700">' + escHtml(w.label) + '</div><div style="font-size:9px;color:var(--fg3);margin-top:1px">区块汇总</div></div>'
    + '<span style="font-size:14px;color:var(--accent);font-weight:700;flex-shrink:0">' + (d.count||0) + '</span>'
    + '</div>'
    + '<div style="border-top:1px solid var(--border);padding-top:6px">' + rowHtml + '</div>'
    + '<div style="display:flex;gap:8px;margin-top:8px;font-size:10px;color:var(--fg3)">'
    + (idx>0?'<span style="cursor:pointer" onclick="event.stopPropagation();移动小部件('+idx+',-1)">↑ 上移</span>':'')
    + (idx<total-1?'<span style="cursor:pointer" onclick="event.stopPropagation();移动小部件('+idx+',1)">↓ 下移</span>':'')
    + '<span style="flex:1"></span>'
    + '<span style="cursor:pointer;color:#e06c75" onclick="event.stopPropagation();移除首页小部件(\''+w.id+'\')">✕ 移除</span>'
    + '</div></div>';
}

function 小数字(l, v) {
  return '<div style="text-align:center;background:var(--bg2);border-radius:8px;padding:8px 4px"><div style="font-size:15px;font-weight:700;color:var(--accent)">'+v+'</div><div style="font-size:9px;color:var(--fg3);margin-top:2px">'+l+'</div></div>';
}
function fmtW(n) {
  if (n == null) return '0';
  if (n >= 100000000) return (n/100000000).toFixed(2)+'亿';
  if (n >= 10000) return (n/10000).toFixed(1)+'万';
  return String(n);
}

// 角色卡大卡片：占 2 行 × 3 列（6 个小卡片面积）
function 角色卡大卡片HTML(d, idx, total) {
  var list = d.list || [];
  var g = d.byGender || {};
  var r = d.byRarity || {};
  var rColor = { '金':'#f0c674','蓝':'#81a1c1','绿':'#4ecca3','紫':'#b48ead','白':'#8a8799' };
  var gIcon = { '女性':'♀','伪娘':'⚧','扶她':'⚥','男性':'♂' };
  // 角色墙（前 18 个，横向铺开）
  var wall = list.slice(0, 18).map(function(c){
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 2px;cursor:pointer;border-radius:8px;transition:background .15s" title="'+escHtml(c.name)+'" onclick="跳到小部件模块(\'character\')">'
      + '<span style="font-size:20px">' + escHtml(c.icon || '👤') + '</span>'
      + '<span style="font-size:9px;color:var(--fg2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%">' + escHtml(c.name) + '</span>'
      + '<span style="font-size:8px;color:var(--fg3)">' + (gIcon[c.gender]||'') + (c.rarity ? ' <b style="color:'+(rColor[c.rarity]||'#888')+'">'+escHtml(c.rarity)+'</b>' : '') + '</span>'
      + '</div>';
  }).join('');
  // 性别分布条
  var gTotal = (d.count) || 1;
  var gColors = { '女性':'#e8a0b4','伪娘':'#b48ead','扶她':'#4ecca3','男性':'#81a1c1' };
  var gBar = Object.keys(g).map(function(k){
    return '<i style="width:'+((g[k]/gTotal)*100).toFixed(1)+'%;background:'+(gColors[k]||'#888')+';display:block;height:100%"></i>';
  }).join('') || '<i style="width:100%;background:#333;display:block;height:100%"></i>';
  var gLeg = Object.keys(g).map(function(k){
    return '<span style="font-size:9px;color:var(--fg2)"><b style="display:inline-block;width:8px;height:8px;border-radius:2px;background:'+(gColors[k]||'#888')+';margin-right:3px"></b>'+k+' '+g[k]+'</span>';
  }).join('');
  // 稀有度分布
  var rRows = Object.keys(r).map(function(k){
    return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span style="font-size:9px;color:var(--fg2);width:16px">'+k+'</span>'
      + '<div style="flex:1;height:8px;background:var(--bg2);border-radius:3px;overflow:hidden"><i style="display:block;height:100%;width:'+((r[k]/gTotal)*100).toFixed(1)+'%;background:'+(rColor[k]||'#888')+'"></i></div>'
      + '<span style="font-size:9px;color:var(--fg3);width:20px;text-align:right">'+r[k]+'</span></div>';
  }).join('');
  return '<div class="home-widget" data-wid="character" style="grid-column:1/-1;grid-row:span 2;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px">'
    + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">'
    + '<span style="font-size:20px">👥</span>'
    + '<div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:700">角色卡</div><div style="font-size:9px;color:var(--fg3);margin-top:1px">'+d.count+' 位角色 · 点击角色跳转</div></div>'
    + '<span style="font-size:16px;color:var(--accent);font-weight:700">'+d.count+'</span>'
    + '<span style="cursor:pointer;color:var(--fg3);font-size:12px" title="移除" onclick="event.stopPropagation();移除首页小部件(\'character\')">✕</span>'
    + '</div>'
    + '<div class="role-wall" style="display:grid;grid-template-columns:repeat(9,1fr);gap:2px;margin-bottom:14px">' + wall + '</div>'
    + '<div style="display:grid;grid-template-columns:1.2fr 1fr;gap:16px">'
    + '<div><div style="font-size:10px;color:var(--fg3);margin-bottom:6px">性别分布</div><div style="height:12px;border-radius:4px;overflow:hidden;display:flex;margin-bottom:6px">'+gBar+'</div><div style="display:flex;gap:12px;flex-wrap:wrap">'+gLeg+'</div></div>'
    + '<div><div style="font-size:10px;color:var(--fg3);margin-bottom:6px">稀有度分布</div>'+rRows+'</div>'
    + '</div>'
    + '<div style="display:flex;gap:8px;margin-top:12px;font-size:10px;color:var(--fg3)">'
    + (idx>0?'<span style="cursor:pointer" onclick="event.stopPropagation();移动小部件('+idx+',-1)">↑ 上移</span>':'')
    + (idx<total-1?'<span style="cursor:pointer" onclick="event.stopPropagation();移动小部件('+idx+',1)">↓ 下移</span>':'')
    + '<span style="flex:1"></span>'
    + '<span style="cursor:pointer;color:var(--accent)" onclick="event.stopPropagation();跳到小部件模块(\'character\')">进入角色卡 →</span>'
    + '</div></div>';
}

// 生图成果大卡片：占 2 行 × 3 列（成果画廊 + 词典资源）
function 生图成果大卡片HTML(d, idx, total) {
  var arts = d.artWorks || [];
  var dict = d.dict || {};
  // 成果画廊（角色封面占位）
  var gallery = arts.length ? arts.map(function(a){
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 4px;background:var(--bg2);border-radius:8px">'
      + '<span style="font-size:22px">🖼</span>'
      + '<span style="font-size:9px;color:var(--fg2)">'+escHtml(a.char)+'</span>'
      + '<span style="font-size:8px;color:var(--accent)">'+a.count+' 组</span>'
      + '</div>';
  }).join('') : '<div style="font-size:10px;color:var(--fg3);padding:12px;text-align:center;grid-column:1/-1">暂无生图成果 — 从「生图词典」生成后自动归档到这里</div>';
  var dictCells = [
    ['🖼', '参考图', dict.refImgs||0],
    ['📁', '选项方案', dict.options||0],
    ['✨', '灵感角色', dict.inspireChars||0],
    ['🧰', '识图缓存', d.aids||0],
  ].map(function(c){
    return '<div style="text-align:center;background:var(--bg2);border-radius:8px;padding:10px 4px"><div style="font-size:18px">'+c[0]+'</div><div style="font-size:16px;font-weight:700;color:var(--accent);margin-top:2px">'+c[1]+'</div><div style="font-size:9px;color:var(--fg3);margin-top:2px">'+c[2]+'</div></div>';
  }).join('');
  return '<div class="home-widget" data-wid="sheng-tu-cheng-guo" style="grid-column:1/-1;grid-row:span 2;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px 20px">'
    + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">'
    + '<span style="font-size:20px">🖼</span>'
    + '<div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:700">生图成果</div><div style="font-size:9px;color:var(--fg3);margin-top:1px">成果画廊 · 生图词典资源 · 识图缓存</div></div>'
    + '<span style="font-size:16px;color:var(--accent);font-weight:700">'+d.count+'</span>'
    + '<span style="cursor:pointer;color:var(--fg3);font-size:12px" title="移除" onclick="event.stopPropagation();移除首页小部件(\'sheng-tu-cheng-guo\')">✕</span>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:14px">' + gallery + '</div>'
    + '<div style="font-size:10px;color:var(--fg3);margin-bottom:6px">生图资源库</div>'
    + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">' + dictCells + '</div>'
    + '<div style="display:flex;gap:8px;margin-top:12px;font-size:10px;color:var(--fg3)">'
    + (idx>0?'<span style="cursor:pointer" onclick="event.stopPropagation();移动小部件('+idx+',-1)">↑ 上移</span>':'')
    + (idx<total-1?'<span style="cursor:pointer" onclick="event.stopPropagation();移动小部件('+idx+',1)">↓ 下移</span>':'')
    + '<span style="flex:1"></span>'
    + '<span style="cursor:pointer;color:var(--accent)" onclick="event.stopPropagation();跳到小部件模块(\'sheng-tu-cheng-guo\')">进入生图成果 →</span>'
    + '</div></div>';
}

// 今日角色小部件：左图 + 右档案（每次启动随机，纯随机挑一位已有图的角色）
// 左右各占一半；右侧用完整档案渲染器内联展示，固定卡片大小，超出滚动查看
function 今日角色小部件HTML(d, idx, total) {
  var empty = d.empty || !d.img;
  var name = d.name || '未命名角色';
  var c = d.charData;
  // 右侧档案：直接走完整档案渲染器（角色档案HTML），内联、不吸顶、可滚动
  var archive = (c && typeof window.角色档案HTML === 'function')
    ? window.角色档案HTML(c, { stickyChrome: false })
    : '<div class="c-fg3" style="font-size:11px;padding:16px">（暂无档案内容）</div>';

  return '<div class="home-widget" data-wid="today-char" style="grid-column:1/-1;background:linear-gradient(120deg,var(--card2),var(--card));border:1px solid var(--border);border-radius:12px;padding:18px 20px;display:flex;flex-direction:column">'
    + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-shrink:0">'
    + '<span style="font-size:16px">⭐</span><b style="font-size:13px;flex:1">今日角色</b>'
    + '<span style="font-size:10px;color:var(--fg3)">每次启动随机 · 已上传图片的角色</span>'
    + '<span class="hw-del" style="cursor:pointer;color:var(--fg3);font-size:12px" title="移除" onclick="移除首页小部件(\'today-char\')">✕</span>'
    + '</div>'
    + (empty
        ? '<div style="height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:var(--fg3);font-size:11px">'
          + '<span style="font-size:26px">🖼</span><span>暂无已上传图片的角色 — 先到「生图成果」上传图片</span></div>'
        : '<div style="display:flex;gap:16px;height:800px;flex-shrink:0">'
          // 左：图（占 50%）
          + '<div style="flex:0 0 calc(50% - 8px);min-width:0;background:var(--bg2);border:1px solid var(--border);border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center">'
          + (d.img ? '<img src="' + d.img + '" style="width:100%;height:100%;object-fit:cover;display:block" />' : '<span style="font-size:40px;color:var(--fg3)">🖼</span>')
          + '</div>'
          // 右：档案（占 50% · 固定高度滚动）
          + '<div class="tc-archive" style="flex:1 1 50%;min-width:0">' + archive + '</div>'
          + '</div>')
    + '<div style="display:flex;gap:8px;margin-top:14px;font-size:10px;color:var(--fg3);flex-shrink:0">'
    + (idx>0?'<span style="cursor:pointer" onclick="移动小部件('+idx+',-1)">↑ 上移</span>':'')
    + (idx<total-1?'<span style="cursor:pointer" onclick="移动小部件('+idx+',1)">↓ 下移</span>':'')
    + '<span style="flex:1"></span>'
    + '</div></div>';
}

// 模块小部件
function 模块小部件HTML(w, d, idx, total) {
  var latest = (d.latest||[]).slice(0,3);
  var rows = latest.length ? latest.map(function(it){
    return '<div style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:10px;color:var(--fg2);overflow:hidden">'
      + '<span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(it.title||'') + '</span>'
      + (it.time ? '<span style="color:var(--fg3);flex-shrink:0;font-size:9px">' + 相对时间(it.time) + '</span>' : '')
      + '</div>';
  }).join('') : '<div style="font-size:10px;color:var(--fg3);padding:4px 0">暂无内容</div>';
  return '<div class="home-widget" data-wid="' + w.id + '" style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;cursor:pointer;transition:border-color .15s" onclick="跳到小部件模块(\''+w.id+'\')">'
    + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">'
    + '<span style="font-size:18px">'+w.icon+'</span>'
    + '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+w.label+'</div><div style="font-size:9px;color:var(--fg3);margin-top:1px">'+w.desc+'</div></div>'
    + '<span style="font-size:11px;color:var(--accent);font-weight:700;flex-shrink:0">'+d.count+'</span>'
    + '</div>'
    + '<div style="border-top:1px solid var(--border);padding-top:6px">'+rows+'</div>'
    + '<div style="display:flex;gap:8px;margin-top:8px;font-size:10px;color:var(--fg3)">'
    + (idx>0?'<span style="cursor:pointer" onclick="event.stopPropagation();移动小部件('+idx+',-1)">↑ 上移</span>':'')
    + (idx<total-1?'<span style="cursor:pointer" onclick="event.stopPropagation();移动小部件('+idx+',1)">↓ 下移</span>':'')
    + '<span style="flex:1"></span>'
    + '<span style="cursor:pointer;color:#e06c75" onclick="event.stopPropagation();移除首页小部件(\''+w.id+'\')">✕ 移除</span>'
    + '</div></div>';
}

// ===== 添加小部件面板（内容可滚动，底部按钮固定）=====
function 打开首页小部件面板() {
  var cfg = 首页小部件配置();
  var enabled = (cfg.enabled||[]).slice();
  var snap = window.HOME_SNAPSHOT || {};
  var h = '<div class="mcard" style="max-width:760px;width:92vw;max-height:calc(100vh - 48px)">';
  h += '<div style="flex-shrink:0;border-bottom:1px solid var(--border);padding-bottom:10px;margin-bottom:10px">';
  h += '<h3 style="font-size:14px;margin-bottom:4px">＋ 添加小部件</h3>';
  h += '<p style="font-size:10px;color:var(--fg3)">像手机桌面一样自由组合 — 点击添加/移除，首页即时更新；可拖动排序或使用卡片上的 ↑ ↓</p>';
  h += '</div>';
  // 可滚动内容区
  h += '<div style="flex:1;min-height:0;overflow-y:auto;padding-right:6px">';
  // 总览类（置顶）：创作总览 + 用量
  h += '<div style="margin-bottom:12px">';
  h += '<div style="font-size:10px;color:var(--fg3);font-weight:600;margin-bottom:6px">通用总览</div>';
  h += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px">';
  h += 总览项HTML('stats','📊','创作总览','角色/作品/Token/成本', enabled);
  h += 总览项HTML('block-情欲文学','📚','情欲文学总览','文学区块汇总', enabled);
  h += 总览项HTML('block-情欲工坊','🔧','情欲工坊总览','工坊区块汇总', enabled);
  h += 总览项HTML('block-情色杂物','📦','情色杂物总览','杂物区块汇总', enabled);
  h += 总览项HTML('block-互动创作','✨','互动创作总览','互动区块汇总', enabled);
  h += 总览项HTML('block-声图创作','🎨','声图创作总览','声图区块汇总', enabled);
  h += 总览项HTML('block-创作辅助','👤','创作辅助总览','辅助区块汇总', enabled);
  h += '</div></div>';
  // 按区块分组的模块小部件
  var blocks = {};
  window.HOME_WIDGETS.forEach(function(w){
    (blocks[w.block] = blocks[w.block] || []).push(w);
  });
  Object.keys(blocks).forEach(function(b){
    var list = blocks[b];
    h += '<div style="margin-bottom:12px">';
    h += '<div style="font-size:10px;color:var(--fg3);font-weight:600;margin-bottom:6px">'+b+'</div>';
    h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">';
    list.forEach(function(w){
      var on = enabled.indexOf(w.id) >= 0;
      h += 模块项HTML(w, on);
    });
    h += '</div></div>';
  });
  h += '</div>'; // 结束滚动区
  // 底部固定按钮
  h += '<div style="flex-shrink:0;display:flex;justify-content:flex-end;gap:8px;border-top:1px solid var(--border);padding-top:10px;margin-top:10px">';
  h += '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">完成</button></div>';
  h += '</div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e){ if (e.target === ov) ov.remove(); });
}

// 总览类小部件项（通用总览区）
function 总览项HTML(id, icon, label, desc, enabled) {
  var on = enabled.indexOf(id) >= 0;
  return '<div style="border:1px solid '+(on?'var(--accent)':'var(--border)')+';border-radius:8px;padding:8px;display:flex;align-items:center;gap:6px;cursor:pointer;background:'+(on?'rgba(78,204,163,0.08)':'transparent')+'" onclick="添加或移除小部件(\''+id+'\',this)">'
    + '<span style="font-size:14px">'+icon+'</span>'
    + '<div style="flex:1;min-width:0"><div style="font-size:10px;font-weight:600">'+label+'</div><div style="font-size:8px;color:var(--fg3)">'+desc+'</div></div>'
    + '<span style="font-size:10px;color:'+(on?'var(--accent)':'var(--fg3)')+'">'+(on?'✓':'＋')+'</span>'
    + '</div>';
}

// 模块小部件项（区块分组区）
function 模块项HTML(w, on) {
  return '<div style="border:1px solid '+(on?'var(--accent)':'var(--border)')+';border-radius:8px;padding:8px;display:flex;align-items:center;gap:6px;cursor:pointer;background:'+(on?'rgba(78,204,163,0.08)':'transparent')+'" onclick="添加或移除小部件(\''+w.id+'\',this)">'
    + '<span style="font-size:14px">'+w.icon+'</span>'
    + '<div style="flex:1;min-width:0"><div style="font-size:10px;font-weight:600">'+w.label+'</div><div style="font-size:8px;color:var(--fg3)">'+w.desc+'</div></div>'
    + '<span style="font-size:10px;color:'+(on?'var(--accent)':'var(--fg3)')+'">'+(on?'✓':'＋')+'</span>'
    + '</div>';
}

function 添加或移除小部件(id, el) {
  var cfg = 首页小部件配置();
  var idx = (cfg.enabled||[]).indexOf(id);
  if (idx >= 0) {
    cfg.enabled.splice(idx, 1);
    el.style.borderColor = 'var(--border)';
    el.style.background = 'transparent';
    el.querySelector('span:last-child').textContent = '＋';
  } else {
    (cfg.enabled = cfg.enabled || []).push(id);
    el.style.borderColor = 'var(--accent)';
    el.style.background = 'rgba(78,204,163,0.08)';
    el.querySelector('span:last-child').textContent = '✓';
  }
  保存首页小部件配置(cfg);
  刷新首页网格();  // 即时刷新，不用关弹窗就能看到效果
}

function 移除首页小部件(id) {
  var cfg = 首页小部件配置();
  cfg.enabled = (cfg.enabled||[]).filter(function(x){ return x !== id; });
  保存首页小部件配置(cfg);
  刷新首页网格();
}

function 移动小部件(idx, dir) {
  var cfg = 首页小部件配置();
  var all = cfg.enabled || [];
  var shown = [];
  all.forEach(function(id){ if (id === 'stats' || window.HOME_WIDGET_BY_ID[id]) shown.push(id); });
  var j = idx + dir;
  if (j < 0 || j >= shown.length) return;
  var movedId = shown[idx];
  var t = shown[idx]; shown[idx] = shown[j]; shown[j] = t;
  var si = 0;
  var newArr = all.map(function(id){ return (id === 'stats' || window.HOME_WIDGET_BY_ID[id]) ? shown[si++] : id; });
  cfg.enabled = newArr;
  保存首页小部件配置(cfg);
  刷新首页网格();
  // 移动后把被移动的卡片滚到可视区，避免大卡片换序后看不清
  setTimeout(function(){
    var el = document.querySelector('#homeWidgetGrid [data-wid="' + movedId + '"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 30);
}

function 跳到小部件模块(id) {
  var w = window.HOME_WIDGET_BY_ID[id];
  if (!w || w.virtual || typeof 切换页面 !== 'function') return;
  切换页面(w.pg);
}

function 相对时间(t) {
  if (!t) return '';
  var d = new Date(String(t).replace(' ','T'));
  if (isNaN(d.getTime())) return '';
  var diff = Date.now() - d.getTime();
  var m = Math.floor(diff/60000);
  if (m < 1) return '刚刚';
  if (m < 60) return m+'分钟前';
  var h = Math.floor(m/60);
  if (h < 24) return h+'小时前';
  var day = Math.floor(h/24);
  if (day < 30) return day+'天前';
  return String(t).slice(0,10);
}

registerPageRoute('home', renderDashboard);
window.renderDashboard = renderDashboard;
window.打开首页小部件面板 = 打开首页小部件面板;
window.添加或移除小部件 = 添加或移除小部件;
window.移除首页小部件 = 移除首页小部件;
window.移动小部件 = 移动小部件;
window.跳到小部件模块 = 跳到小部件模块;
