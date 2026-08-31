// 深度-叙事引擎 · 角色卡 · 📚 角色库子模块
// 统一展示所有已生成的角色卡（S.generatedCharacters），按状态分类

// ===== 窗口函数：性别 tab 切换 =====
window.角色库设置性别 = function(g) {
  角色库性别 = g;
  渲染角色主面板(document.getElementById('characterContent'));
};

// ===== 角色库筛选状态 =====
var 角色库状态筛选 = 'all';   // all | outline | generated
var 角色库品级筛选 = 'all';   // all | 金 | 紫 | 蓝 | 绿 | 白
var 角色库搜索文本 = '';        // 名称搜索

window.角色库设置状态筛选 = function(v) {
  角色库状态筛选 = v;
  渲染角色主面板(document.getElementById('characterContent'));
};
window.角色库设置品级筛选 = function(v) {
  角色库品级筛选 = v;
  渲染角色主面板(document.getElementById('characterContent'));
};
window.角色库设置搜索 = function() {
  var el = document.getElementById('charSearchInput');
  if (el) 角色库搜索文本 = el.value.trim();
  渲染角色主面板(document.getElementById('characterContent'));
};

// ===== 彻底删除角色（内存+磁盘） =====
window.角色库删除 = function(id, catKey) {
  if (!window.confirm('确定彻底删除该角色吗？')) return;
  var entries = S.generatedCharacters && S.generatedCharacters[catKey];
  if (!entries || !entries[id]) { window.toast('角色数据不存在'); return; }
  var entry = entries[id];
  var name = (window.角色名 ? window.角色名(entry) : null) || id;
  var dir = LocalFS.sanitize(name);
  delete entries[id];
  // 删除磁盘上的角色目录（数据文件 + 审计）
  LocalFS.delete('角色卡/' + dir).catch(function(){});
  save();
  渲染角色主面板(document.getElementById('characterContent'));
  window.toast('已删除');
};

// ===== 继续生成（概要→完整） =====
window.角色库继续生成 = function(id, catKey) {
  var entries = S.generatedCharacters && S.generatedCharacters[catKey];
  if (!entries || !entries[id]) { window.toast('角色数据不存在'); return; }
  var entry = entries[id];
  角色生成类别 = catKey;
  角色生成描述 = entry.desc || '';
  if (entry.outline) {
    角色生成概要 = JSON.parse(JSON.stringify(entry.outline));
  } else if (entry.fullChar && entry.fullChar.identity) {
    // 已生成角色重启加载后可能没有 outline，从 fullChar.identity 派生概要
    角色生成概要 = JSON.parse(JSON.stringify({ identity: entry.fullChar.identity }));
  }
  角色生成结果 = null;
  角色生成阶段 = 'outline';
  角色暂存最新ID = id;
  角色当前标签 = 'generate';
  渲染角色主面板(document.getElementById('characterContent'));
};

// ===== 角色库面板渲染 =====
function 渲染角色库面板() {
  var catKey = 角色库性别;
  var entries = [];
  var genMap = S.generatedCharacters && S.generatedCharacters[catKey];
  if (genMap) {
    var keys = Object.keys(genMap);
    for (var i = 0; i < keys.length; i++) {
      var e = genMap[keys[i]];
      if (!e) continue;
      var bi = {};
      if (e.fullChar) bi = (e.fullChar.identity && e.fullChar.identity.basicInfo) || {};
      else if (e.outline) bi = (e.outline.identity && e.outline.identity.basicInfo) || {};
      // 确定状态
      var status = 'outline';
      if (e.phase === 'full' && e.fullChar) status = 'generated';
      entries.push({
        id: keys[i],
        entry: e,
        status: status,
        name: bi.name || '未命名',
        title: bi.title || '',
        icon: bi.icon || '👤',
        race: bi.race || '',
        age: bi.age,
        price: 获取嵌套值(e.fullChar, 'identity.basicInfo.price') || 获取嵌套值(e.fullChar, 'statusContract.ownership.detail.cost'),
        rarity: bi.rarity || '',
        来源详情: (e.fullChar && e.fullChar.meta && e.fullChar.meta.metadata && e.fullChar.meta.metadata.characterOrigin) || (e.outline && e.outline.meta && e.outline.meta.metadata && e.outline.meta.metadata.characterOrigin) || '',
        createdAt: e.createdAt || 0,
        desc: e.desc || '',
        audit: e.audit || null,
      });
    }
  }

  // ==== 应用筛选 ====
  var filtered = [];
  for (var ei = 0; ei < entries.length; ei++) {
    var item = entries[ei];
    if (角色库状态筛选 !== 'all' && item.status !== 角色库状态筛选) continue;
    if (角色库品级筛选 !== 'all' && item.rarity !== 角色库品级筛选) continue;
    if (角色库搜索文本 && item.name.indexOf(角色库搜索文本) < 0) continue;
    filtered.push(item);
  }

  var h = '';

  // 卡片 1：标题 + 说明 + 性别选择器
  h += '<div class="n-card mb-12">';
  h += '<div class="fs-12 fw-600 c-fg mb-8">📚 角色库</div>';
  h += '<div class="fs-10 c-fg3 mb-8">所有生成的角色统一管理。按状态区分阶段。</div>';
  h += '<div class="flex gap-6 mb-0">';
  for (var ci = 0; ci < 类别键数组.length; ci++) {
    var k = 类别键数组[ci];
    var info = 角色类别映射[k];
    var gc = S.generatedCharacters && S.generatedCharacters[k] ? Object.keys(S.generatedCharacters[k]).length : 0;
    var sel = catKey === k;
    h += '<div class="char-cat-tab flex-1' + (sel ? ' act' : '') + '" onclick="window.角色库设置性别(\'' + k + '\')">';
    h += '<div class="char-cat-tab-icon">' + info.icon + '</div>';
    h += '<div class="char-cat-tab-label">' + info.label + (gc ? ' (' + gc + ')' : '') + '</div>';
    h += '</div>';
  }
  h += '<\/div>';
  h += '<\/div>';

  // 卡片 2：筛选 + 列表
  h += '<div class="n-card mb-12">';

  // ==== 筛选栏 ====
  var STATUS_FILTERS = [
    { key: 'all', label: '全部' },
    { key: 'outline', label: '概要' },
    { key: 'generated', label: '已生成' },
  ];
  h += '<div class="filter-row" style="margin-bottom:8px">';
  h += '<span class="filter-label">状态</span>';
  for (var fi = 0; fi < STATUS_FILTERS.length; fi++) {
    var f = STATUS_FILTERS[fi];
    var act = 角色库状态筛选 === f.key;
    h += '<span class="filter-chip' + (act ? ' act' : '') + '" onclick="window.角色库设置状态筛选(\'' + f.key + '\')">' + f.label + '</span>';
  }
  h += '</div>';

  var RARITY_FILTERS = [
    { key: 'all', label: '全部' },
    { key: '金', label: '🌟金' },
    { key: '紫', label: '🔮紫' },
    { key: '蓝', label: '💎蓝' },
    { key: '绿', label: '🍀绿' },
    { key: '白', label: '⬜白' },
  ];
  h += '<div class="filter-row" style="margin-bottom:8px">';
  h += '<span class="filter-label">稀有度</span>';
  for (var fi2 = 0; fi2 < RARITY_FILTERS.length; fi2++) {
    var f2 = RARITY_FILTERS[fi2];
    var act2 = 角色库品级筛选 === f2.key;
    h += '<span class="filter-chip' + (act2 ? ' act' : '') + '" onclick="window.角色库设置品级筛选(\'' + f2.key + '\')">' + f2.label + '</span>';
  }
  h += '</div>';

  h += '<div class="mb-10">';
  h += '<input id="charSearchInput" type="text" placeholder="🔍 按名称搜索..." value="' + escHtml(角色库搜索文本) + '" class="llm-input w-100" oninput="window.角色库设置搜索()">';
  h += '</div>';

  if (!filtered.length) {
    h += '<div class="fs-11 c-fg3 p-12-0 text-center">' + (角色库状态筛选 !== 'all' || 角色库品级筛选 !== 'all' || 角色库搜索文本 ? '没有匹配的角色，试试调整筛选条件。' : '暂无角色。通过「生成」标签页创建角色后，将出现在此处。') + '</div>';
  } else {
    filtered.sort(function(a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
    h += '<table style="width:100%;border-collapse:collapse;font-size:11px">';
    h += '<thead><tr style="border-bottom:1px solid var(--border)">';
    h += '<th style="padding:6px 8px;text-align:left;color:var(--fg3);font-weight:600;letter-spacing:1px;text-transform:uppercase;font-family:var(--font-sans)">角色</th>';
    h += '<th style="padding:6px 8px;text-align:left;color:var(--fg3);font-weight:600;letter-spacing:1px;text-transform:uppercase;font-family:var(--font-sans)">头衔</th>';
    h += '<th style="padding:6px 8px;text-align:left;color:var(--fg3);font-weight:600;letter-spacing:1px;text-transform:uppercase;font-family:var(--font-sans)">来源详情</th>';
    h += '<th style="padding:6px 8px;text-align:left;color:var(--fg3);font-weight:600;letter-spacing:1px;text-transform:uppercase;font-family:var(--font-sans)">状态</th>';
    h += '<th style="padding:6px 8px;text-align:right;color:var(--fg3);font-weight:600;letter-spacing:1px;text-transform:uppercase;font-family:var(--font-sans)">操作</th>';
    h += '</tr></thead><tbody>';
    for (var ci2 = 0; ci2 < filtered.length; ci2++) {
      var item = filtered[ci2];
      // 状态徽章
      var statusInfo = { color: '', label: '', bg: '' };
      if (item.status === 'outline') {
        statusInfo = { color: 'var(--accent)', label: '概要', bg: 'var(--accent-dim)' };
      } else {
        statusInfo = { color: 'var(--accent2)', label: '已生成', bg: 'rgba(232,160,180,0.12)' };
      }
      var rarityColor = ({'金':'var(--accent2)','紫':'var(--accent)','蓝':'var(--fg2)','绿':'var(--success)','白':'var(--fg3)'})[item.rarity] || 'var(--fg3)';

      h += '<tr style="border-bottom:1px solid var(--border)">';
      h += '<td style="padding:8px"><div class="flex items-center gap-4"><span class="fs-16 flex-shrink-0">' + item.icon + '</span><span class="fw-700 c-fg" style="font-family:var(--font)">' + escHtml(item.name) + '</span></div></td>';
      h += '<td style="padding:8px;color:var(--fg2)">' + escHtml(item.title || '') + '</td>';
      h += '<td style="padding:8px">';
      if (item.来源详情) {
        h += '<span class="fs-10 fw-700" style="padding:1px 5px;border-radius:3px;border:1px solid var(--fg2);color:var(--fg2)">' + escHtml(item.来源详情) + '</span>';
      }
      h += '</td>';
      h += '<td style="padding:8px">';
      h += '<span class="badge-tag" style="background:' + statusInfo.bg + ';color:' + statusInfo.color + ';border:1px solid ' + statusInfo.color + '">' + statusInfo.label + '</span>';
      if (item.audit && item.status === 'generated') {
        if (item.audit.fixesApplied) h += ' <span class="fs-10 fw-700 c-success">✅</span>';
        else if (item.audit.issueCount > 0) h += ' <span class="fs-10 fw-700 c-accent2">🔍' + item.audit.issueCount + '</span>';
        else h += ' <span class="fs-10 c-fg3">🔍✓</span>';
      }
      h += '</td>';
      h += '<td style="padding:8px;text-align:right"><div class="flex gap-2 justify-end">';
      var _qm = String.fromCharCode(39);
      if (item.status === 'outline') {
        h += '<button class="btn" style="padding:2px 8px;font-size:10px" onclick="window.显示角色档案(S.generatedCharacters[' + _qm + catKey + _qm + '][' + _qm + item.id + _qm + '])">档案</button>';
        h += '<button class="btn" style="padding:2px 8px;font-size:10px" onclick="window.角色库继续生成(\'' + item.id + '\',\'' + catKey + '\')">继续</button>';
        h += '<button class="btn btn-del" style="padding:2px 8px;font-size:10px" onclick="window.角色库删除(\'' + item.id + '\',\'' + catKey + '\')">🗑️</button>';
      } else {
        var _q = String.fromCharCode(39);
        h += '<button class="btn" style="padding:2px 8px;font-size:10px" onclick="window.角色审计打开(' + _q + item.id + _q + ',' + _q + catKey + _q + ',' + _q + 'pending' + _q + ')">审计</button>';
        h += '<button class="btn" style="padding:2px 8px;font-size:10px" onclick="window.显示角色档案(S.generatedCharacters[' + _q + catKey + _q + '][' + _q + item.id + _q + '])">档案</button>';
        h += '<button class="btn" style="padding:2px 8px;font-size:10px" onclick="window.角色库继续生成(\'' + item.id + '\',\'' + catKey + '\')">重新生成</button>';
        h += '<button class="btn btn-del" style="padding:2px 8px;font-size:10px" onclick="window.角色库删除(\'' + item.id + '\',\'' + catKey + '\')">🗑️</button>';
      }
      h += '</div></td>';
      h += '</tr>';
    }
    h += '</tbody></table>';
  }

  h += '</div>';
  return h;
}
