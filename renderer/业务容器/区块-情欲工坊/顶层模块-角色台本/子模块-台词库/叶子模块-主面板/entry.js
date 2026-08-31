// 情欲工坊 · 角色台本 · 台词库（全角色台词聚合浏览）
// 汇总 自述/诵读/经历/关系对话 四个库的全部作品，按角色筛选，一键跳回对应标签编辑
var 角色台词库源 = [
  { tab: 'monologue', label: '🎙 自述',     storeKey: 'roleMonologue', prefix: '角色自述' },
  { tab: 'recite',    label: '📢 诵读',     storeKey: 'roleRecite',    prefix: '角色诵读' },
  { tab: 'experience',label: '🗂 经历',     storeKey: 'roleExperience',prefix: '角色经历' },
  { tab: 'relation',  label: '💬 关系对话', storeKey: 'roleRelation',  prefix: '角色关系对话' },
  { tab: 'insult',    label: '🗯 辱骂',     storeKey: 'roleInsult',    prefix: '角色辱骂' },
];
var 台词库筛选角色 = '全部';
var 台词库搜索 = '';
var 台词库容器 = null;

function 渲染角色台词库(el) {
  台词库容器 = el;
  var jobs = 角色台词库源.map(function(s) {
    return Store[s.storeKey].list().then(function(items) {
      return (items || []).map(function(it) { return { src: s, item: it }; });
    }).catch(function() { return []; });
  });
  Promise.all(jobs).then(function(groups) {
    var all = [];
    groups.forEach(function(g) { all = all.concat(g); });
    // 角色筛选行
    var chars = [];
    all.forEach(function(x) { var c = x.item.char; if (c && chars.indexOf(c) < 0) chars.push(c); });
    chars.sort();
    var h = '<div class="filter-row">';
    h += '<span class="filter-label">角色</span>';
    h += '<span class="filter-chip' + (台词库筛选角色 === '全部' ? ' act' : '') + '" onclick="角色台词库筛选角色(\'全部\')">全部</span>';
    chars.forEach(function(c) {
      h += '<span class="filter-chip' + (台词库筛选角色 === c ? ' act' : '') + '" onclick="角色台词库筛选角色(\'' + escHtml(c) + '\')">' + escHtml(c) + '</span>';
    });
    h += '<input class="llm-input" id="roleLibrarySearch" placeholder="搜索标题 / 正文 / 角色…" value="' + escHtml(台词库搜索) + '" style="flex:1;min-width:160px" onkeydown="if(event.key===\'Enter\')角色台词库搜索()">';
    h += '</div>';
    var filtered = all.filter(function(x) {
      if (台词库筛选角色 !== '全部' && x.item.char !== 台词库筛选角色) return false;
      if (台词库搜索) {
        var q = 台词库搜索;
        return (x.item.title||'').indexOf(q) >= 0 || (x.item.content||'').indexOf(q) >= 0 || (x.item.char||'').indexOf(q) >= 0;
      }
      return true;
    });
    if (!filtered.length) { h += '<div class="placeholder-text">台词库暂无内容，去「自述 / 诵读 / 经历 / 关系对话」生成</div>'; }
    else {
      filtered.forEach(function(x) {
        var it = x.item;
        h += '<div class="n-card cur-ptr mb-6 p-10" onclick="角色台词库打开(\'' + x.src.tab + '\',\'' + escHtml(it.title) + '\')">';
        h += '<div class="fw-600 fs-14">' + escHtml(it.title) + '</div>';
        h += '<div class="mt-4 flex gap-4 flex-wrap">';
        h += '<span class="badge-tag">' + x.src.label + '</span>';
        if (it.char) h += '<span class="badge-tag">👤 ' + escHtml(it.char) + '</span>';
        if (it.theme) h += '<span class="badge-tag">' + escHtml(Array.isArray(it.theme) ? it.theme.join('、') : it.theme) + '</span>';
        if (it.kind) h += '<span class="badge-tag">' + escHtml(it.kind === '性' ? '💢 性辱骂' : '🗯 普通辱骂') + '</span>';
        if (it.scene) h += '<span class="badge-tag">📍 ' + escHtml(it.scene) + '</span>';
        if (it.target) h += '<span class="badge-tag">→ ' + escHtml(it.target) + '</span>';
        if (it.experience) h += '<span class="badge-tag" style="white-space:normal">📌 ' + escHtml(it.experience) + '</span>';
        h += '</div>';
        h += '<div class="text-muted text-sm mt-4" style="white-space:pre-wrap">' + escHtml(it.content||'').slice(0, 100) + '</div>';
        h += '<div class="mt-6 flex gap-4">';
        h += '<span class="btn-secondary btn-sm" onclick="event.stopPropagation();角色台词库打开(\'' + x.src.tab + '\',\'' + escHtml(it.title) + '\')">✏️ 打开编辑</span>';
        h += '<span class="btn-secondary btn-sm c-error" onclick="event.stopPropagation();角色台词库删除(\'' + x.src.storeKey + '\',\'' + escHtml(it.title) + '\')">🗑 删除</span>';
        h += '</div></div>';
      });
    }
    el.innerHTML = h;
  });
}

function 角色台词库筛选角色(r) { 台词库筛选角色 = r; if (台词库容器) 渲染角色台词库(台词库容器); }
function 角色台词库搜索() {
  台词库搜索 = ((document.getElementById('roleLibrarySearch'))||{}).value || '';
  if (台词库容器) 渲染角色台词库(台词库容器);
}
function 角色台词库打开(tab, title) {
  if (typeof 角色台本切换标签 === 'function') 角色台本切换标签(tab);
  var s = null;
  角色台词库源.forEach(function(x) { if (x.tab === tab) s = x; });
  if (!s) return;
  var fn = window[s.prefix + '编辑项'];
  if (typeof fn === 'function') fn(title);
}
function 角色台词库删除(storeKey, title) {
  confirmDialog('确定删除「' + title + '」？', function() {
    Store[storeKey].delete(title).then(function() { toast('已删除'); if (台词库容器) 渲染角色台词库(台词库容器); });
  });
}

window.渲染角色台词库 = 渲染角色台词库;
window.角色台词库筛选角色 = 角色台词库筛选角色;
window.角色台词库搜索 = 角色台词库搜索;
window.角色台词库打开 = 角色台词库打开;
window.角色台词库删除 = 角色台词库删除;
