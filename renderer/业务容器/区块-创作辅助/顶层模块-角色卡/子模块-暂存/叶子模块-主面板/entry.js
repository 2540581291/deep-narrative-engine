// 深度-叙事引擎 · 角色卡 · 📋 暂存子模块
// 合并手动暂存的概要（S.charDrafts）和 LLM 自动保存的角色（S.generatedCharacters）

var 角色待处理性别 = 'female';

// ===== 窗口函数：性别 tab 切换 =====

window.角色暂存设置性别 = function(g) {
  角色待处理性别 = g;
  渲染角色主面板(document.getElementById('characterContent'));
};

// ===== 窗口函数：角色操作 =====

window.角色暂存加载 = function(id) {
  var catKey = 角色待处理性别;
  var entries = S.generatedCharacters && S.generatedCharacters[catKey];
  if (!entries || !entries[id]) { window.toast('待处理角色不存在'); return; }
  var entry = entries[id];
  if (entry.phase === 'full' && entry.fullChar) {
    角色生成类别 = catKey;
    角色生成描述 = entry.desc || '';
    角色生成结果 = { _char: JSON.parse(JSON.stringify(entry.fullChar)), _desc: entry.desc };
    角色生成概要 = entry.outline ? JSON.parse(JSON.stringify(entry.outline)) : null;
    角色生成阶段 = 'full';
    角色暂存最新ID = id;
    角色当前标签 = 'generate';
    渲染角色主面板(document.getElementById('characterContent'));
  } else if (entry.outline) {
    角色生成类别 = catKey;
    角色生成描述 = entry.desc || '';
    角色生成概要 = JSON.parse(JSON.stringify(entry.outline));
    角色生成结果 = null;
    角色生成阶段 = 'outline';
    角色当前标签 = 'generate';
    渲染角色主面板(document.getElementById('characterContent'));
  } else {
    window.toast('待处理角色数据不完整');
  }
};

window.角色暂存删除 = function(id) {
  var catKey = 角色待处理性别;
  var entries = S.generatedCharacters && S.generatedCharacters[catKey];
  if (!entries || !entries[id]) return;
  if (!window.confirm('确定删除该角色吗？')) return;
  var entry = entries[id];
  var name = (window.角色名 ? window.角色名(entry) : null) || id;
  var dir = LocalFS.sanitize(name);
  delete entries[id];
  // 删除磁盘上的角色目录
  LocalFS.delete('角色卡/' + dir).catch(function(){});
  save();
  渲染角色主面板(document.getElementById('characterContent'));
  window.toast('已删除');
};

// ===== 暂存标签页渲染 =====

function 渲染暂存面板() {
  var catKey = 角色待处理性别;
  var entries = [];

  // Source 1: S.charDrafts（手动暂存的概要）
  var drafts = (S.charDrafts || []).filter(function(d) { return d.gender === catKey; });
  for (var i = 0; i < drafts.length; i++) {
    var d = drafts[i];
    var bi = (d.outline && d.outline.identity && d.outline.identity.basicInfo) || {};
    entries.push({
      id: d.id,
      source: 'draft',
      phase: 'outline',
      name: bi.name || '未命名',
      title: bi.title || '',
      icon: bi.icon || '👤',
      createdAt: d.createdAt || 0,
      desc: d.desc || '',
    });
  }

  // Source 2: S.generatedCharacters（LLM 自动保存）
  var genMap = S.generatedCharacters && S.generatedCharacters[catKey];
  if (genMap) {
    var keys = Object.keys(genMap);
    for (var i = 0; i < keys.length; i++) {
      var e = genMap[keys[i]];
      if (!e) continue;
      var bi = {};
      if (e.fullChar) bi = (e.fullChar.identity && e.fullChar.identity.basicInfo) || {};
      else if (e.outline) bi = (e.outline.identity && e.outline.identity.basicInfo) || {};
      entries.push({
        id: keys[i],
        source: 'pending',
        phase: e.phase || 'outline',
        name: bi.name || '未命名',
        title: bi.title || '',
        icon: bi.icon || '👤',
        createdAt: e.createdAt || 0,
        desc: e.desc || '',
        audit: e.audit || null,
      });
    }
  }

  var h = '<div class="n-card mb-12">';
  h += '<div class="fs-12 fw-600 c-fg mb-8">📋 暂存列表</div>';
  h += '<div class="fs-10 c-fg3 mb-8">自动保存的角色和手动暂存的概要统一管理，可继续编辑完善或进行审计。</div>';

  // 性别 tabs
  h += '<div class="flex gap-6 mb-10">';
  for (var ci = 0; ci < 类别键数组.length; ci++) {
    var k = 类别键数组[ci];
    var info = 角色类别映射[k];
    var dc = (S.charDrafts || []).filter(function(dr) { return dr.gender === k; }).length;
    var gc = S.generatedCharacters && S.generatedCharacters[k] ? Object.keys(S.generatedCharacters[k]).length : 0;
    var cnt = dc + gc;
    var sel = catKey === k;
    h += '<div class="char-cat-tab flex-1' + (sel ? ' act' : '') + '" onclick="window.角色暂存设置性别(\'' + k + '\')">';
    h += '<div class="char-cat-tab-icon">' + info.icon + '</div>';
    h += '<div class="char-cat-tab-label">' + info.label + (cnt ? ' (' + cnt + ')' : '') + '</div>';
    h += '</div>';
  }
  h += '</div>';

  if (!entries.length) {
    h += '<div class="fs-11 c-fg3 p-12-0 text-center">暂无暂存内容。通过「生成」标签页创建角色后，概要和完整角色将出现在此处。</div>';
  } else {
    entries.sort(function(a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
    for (var ci2 = 0; ci2 < entries.length; ci2++) {
      var item = entries[ci2];
      var sourceLabel = item.source === 'draft' ? '暂存' : '已生成';
      var sourceColor = item.source === 'draft' ? 'var(--accent)' : 'var(--accent2)';
      var phaseLabel = item.phase === 'full' ? '完整' : '概要';
      var phaseColor = item.phase === 'full' ? 'var(--success)' : 'var(--accent2)';
      h += '<div class="flex items-center gap-8 p-6-0 b-border-bottom">';
      h += '<span class="fs-24">' + item.icon + '</span>';
      h += '<div class="flex-1">';
      h += '<div class="fs-12 fw-700 c-fg">' + escHtml(item.name) + '</div>';
      h += '<div class="fs-10 c-fg3">' + escHtml(item.title || '') + '</div>';
      h += '<div class="fs-09 c-fg3 mt-1">' + (item.createdAt ? 格式化时间(item.createdAt) : '') + '</div>';
      h += '</div>';
      h += '<span class="badge-tag" style="background:' + sourceColor + '22;color:' + sourceColor + ';border:1px solid ' + sourceColor + '">' + sourceLabel + '</span>';
      h += '<span class="badge-tag" style="background:' + phaseColor + '22;color:' + phaseColor + ';border:1px solid ' + phaseColor + '">' + phaseLabel + '</span>';
      h += '<button class="btn btn-primary btn-sm" onclick="window.角色暂存继续(\'' + item.id + '\',\'' + item.source + '\',\'' + catKey + '\')">继续</button>';
      if (item.source === 'pending' && item.phase === 'full') {
        if (item.audit) {
          if (item.audit.fixesApplied) h += '<span class="fs-10 fw-700 c-success">✅</span>';
          else if (item.audit.issueCount > 0) h += '<span class="fs-10 fw-700 c-accent2">🔍' + item.audit.issueCount + '</span>';
          else h += '<span class="fs-10 c-fg3">🔍✓</span>';
        }
        h += '<button class="btn btn-outline btn-sm" onclick="window.角色审计打开(\'' + item.id + '\',\'' + catKey + '\',\'' + 'pending' + '\')">审计</button>';
      }
      h += '<button class="btn btn-outline btn-sm" onclick="window.角色暂存删除操作(\'' + item.id + '\',\'' + item.source + '\',\'' + catKey + '\')" style="color:var(--error)">🗑️</button>';
      h += '</div>';
    }
  }

  h += '</div>';
  return h;
}

// ===== 暂存标签页窗口桥接 =====

window.角色暂存继续 = function(id, source, gender) {
  if (source === 'draft') {
    window.角色生成载入暂存(id);
  } else if (source === 'pending') {
    角色待处理性别 = gender;
    window.角色暂存加载(id);
  }
};

window.角色暂存删除操作 = function(id, source, gender) {
  if (source === 'draft') {
    window.角色生成删除暂存(id);
  } else if (source === 'pending') {
    角色待处理性别 = gender;
    window.角色暂存删除(id);
  }
};
