// 设定构建 · 角色卡·初始化
Store.character = createStore('character');

function 角色名(entry) {
  if (entry.fullChar && entry.fullChar.identity && entry.fullChar.identity.basicInfo && entry.fullChar.identity.basicInfo.name)
    return entry.fullChar.identity.basicInfo.name;
  if (entry.outline && entry.outline.identity && entry.outline.identity.basicInfo && entry.outline.identity.basicInfo.name)
    return entry.outline.identity.basicInfo.name;
  return null;
}

function san(t) { return LocalFS.sanitize(t); }

// 从磁盘重新加载所有角色数据
window.角色名 = 角色名;
window.角色重新加载 = function() {
  S.generatedCharacters = {};
  S.auditData = {};
  return LocalFS.readJSON('角色卡/.index.json').then(function(index) {
    if (!index) return;
    var loads = [];
    var expectedCount = 0;
    for (var name in index) {
      var meta = index[name];
      if (!meta.catKey) continue;
      expectedCount++;
      (function(name, meta) {
        var suffix = meta.phase === 'full' ? '信息' : '概要';
        loads.push(
          LocalFS.readJSON('角色卡/' + san(name) + '/' + san(name) + ' - ' + suffix + '.json').then(function(data) {
            if (!data) return;
            if (!S.generatedCharacters[meta.catKey]) S.generatedCharacters[meta.catKey] = {};
            var entry = { id: meta.id, catKey: meta.catKey, desc: meta.desc, phase: meta.phase, status: meta.status, createdAt: meta.createdAt };
            if (meta.phase === 'full') entry.fullChar = data;
            else entry.outline = data;
            S.generatedCharacters[meta.catKey][meta.id] = entry;
          })
        );
        // full 角色同时加载概要文件，保证"重新生成"可用（老数据可能没有概要文件，则从 fullChar.identity 派生）
        if (meta.phase === 'full') {
          loads.push(
            LocalFS.readJSON('角色卡/' + san(name) + '/' + san(name) + ' - 概要.json').then(function(od) {
              var entry = S.generatedCharacters[meta.catKey] && S.generatedCharacters[meta.catKey][meta.id];
              if (!entry) return;
              if (od) entry.outline = od;
              else if (entry.fullChar && entry.fullChar.identity) entry.outline = { identity: entry.fullChar.identity };
            }).catch(function(){})
          );
        }
        loads.push(
          LocalFS.readJSON('角色卡/' + san(name) + '/' + san(name) + ' - 审计.json').then(function(ad) {
            if (ad) { if (!S.auditData) S.auditData = {}; S.auditData[meta.catKey + '_' + meta.id] = ad; }
          }).catch(function(){})
        );
      })(name, meta);
    }
    return Promise.all(loads).then(function() {
      // 检查是否有索引条目但数据文件缺失，如有则清理 index
      var loadedCount = 0;
      for (var catKey in (S.generatedCharacters || {})) {
        loadedCount += Object.keys(S.generatedCharacters[catKey]).length;
      }
      if (loadedCount < expectedCount) {
        window.角色清理索引();
      }
    });
  }).catch(function(){});
};

// 从磁盘加载所有角色（启动时执行一次）
(function 初始化角色存储() {
  window.角色重新加载();
})();

// 持久化 — 先等所有数据文件写完毕，再写 index.json，避免异步竞争条件
window.角色持久化 = function() {
  var index = {};
  var saves = [];

  for (var catKey in (S.generatedCharacters || {})) {
    for (var id in (S.generatedCharacters[catKey] || {})) {
      var entry = S.generatedCharacters[catKey][id];
      var name = 角色名(entry) || id;
      var dir = san(name);

      index[name] = { id: id, catKey: catKey, desc: entry.desc, phase: entry.phase, status: entry.status, createdAt: entry.createdAt };

      // 纯数据文件 — 不包裹任何元数据
      if (entry.phase === 'full' && entry.fullChar) {
        saves.push(LocalFS.saveJSON('角色卡/' + dir + '/' + dir + ' - 信息.json', entry.fullChar));
        // 同时持久化概要，保证重启后"重新生成"仍有概要可用
        var outlineForSave = entry.outline || { identity: entry.fullChar.identity };
        saves.push(LocalFS.saveJSON('角色卡/' + dir + '/' + dir + ' - 概要.json', outlineForSave));
      } else if (entry.outline) {
        saves.push(LocalFS.saveJSON('角色卡/' + dir + '/' + dir + ' - 概要.json', entry.outline));
      }

      // 审计 → 同级独立文件
      var auditKey = catKey + '_' + entry.id;
      if (S.auditData && S.auditData[auditKey]) {
        saves.push(LocalFS.saveJSON('角色卡/' + dir + '/' + dir + ' - 审计.json', S.auditData[auditKey]));
      }
    }
  }

  // 等所有数据文件写完，再写 index.json（保证 index 不指向不存在的文件）
  return Promise.all(saves).then(function() {
    return LocalFS.saveJSON('角色卡/.index.json', index);
  }).catch(function(err) {
    console.error('[角色卡] 持久化失败:', err);
  });
};

// 仅重写 index.json（基于当前 S.generatedCharacters），不写数据文件
window.角色清理索引 = function() {
  var index = {};
  for (var catKey in (S.generatedCharacters || {})) {
    for (var id in (S.generatedCharacters[catKey] || {})) {
      var entry = S.generatedCharacters[catKey][id];
      var name = 角色名(entry) || id;
      index[name] = { id: id, catKey: catKey, desc: entry.desc, phase: entry.phase, status: entry.status, createdAt: entry.createdAt };
    }
  }
  return LocalFS.saveJSON('角色卡/.index.json', index);
};

window.save = window.角色持久化;

window.显示角色档案 = function(entry) {
  if (!entry) { window.toast('没有角色数据'); return; }
  var data = entry.fullChar || entry.outline;
  if (!data) { window.toast('没有角色数据'); return; }
  // 优先调用子模块-档案/entry.js 注册的完整档案弹窗
  // 注意：子模块-档案/entry.js 在加载时会把自身保存到 window.角色档案函数
  if (typeof window.角色档案函数 === 'function') {
    try {
      window.角色档案函数(data);
    } catch(e) {
      console.error('[角色卡] 档案弹窗异常:', e);
      alert('档案弹窗异常，请查看控制台: ' + e.message);
    }
    return;
  }
  console.warn('[角色卡] 角色档案函数 未加载，使用降级弹窗');
  // 降级：子模块-档案尚未加载，走简单模态
  var bi = data.identity && data.identity.basicInfo || {};
  var bg = data.identity && data.identity.background || {};
  var exp = data.identity && data.identity.experience || {};
  var name = bi.name || '未命名';
  var phase = entry.phase === 'full' ? '完整角色' : '概要';

  var h = '<div style="padding:16px;max-width:480px">';
  h += '<div style="font-size:18px;font-weight:bold;margin-bottom:4px">' + escHtml(name) + '</div>';
  h += '<div style="font-size:12px;color:var(--fg2);margin-bottom:12px">' + escHtml(bi.title || '') + ' · ' + (bi.age || '?') + '岁 · ' + escHtml(bi.race || '未知') + ' · ' + phase + '</div>';
  if (entry.desc) h += '<div style="font-size:11px;color:var(--fg2);margin-bottom:8px;font-style:italic">"' + escHtml(entry.desc) + '"</div>';
  if (bg.origin) h += '<div class="fs-11 mb-4"><span class="c-fg2">出身：</span>' + escHtml(bg.origin) + (bg.birthStatus ? ' · ' + escHtml(bg.birthStatus) : '') + '</div>';
  if (exp.currentOccupation) h += '<div class="fs-11 mb-4"><span class="c-fg2">职业：</span>' + escHtml(exp.currentOccupation) + '</div>';
  if (bg.aura) h += '<div class="fs-11 mb-4"><span class="c-fg2">气质：</span>' + escHtml(bg.aura) + '</div>';
  if (bg.skills && bg.skills.length) h += '<div class="fs-11 mb-4"><span class="c-fg2">技能：</span>' + escHtml(bg.skills.join('、')) + '</div>';
  if (bi.rarity) h += '<div style="font-size:11px;margin-bottom:8px"><span class="c-fg2">稀有度：</span>' + escHtml(bi.rarity) + '</div>';
  h += '<div style="font-size:11px;color:var(--fg2);margin-bottom:8px;max-height:120px;overflow-y:auto;line-height:1.6">' + escHtml((exp.lifeOverview || '').substring(0, 300)) + (exp.lifeOverview && exp.lifeOverview.length > 300 ? '...' : '') + '</div>';
  h += '<div class="text-right"><button class="btn btn-primary" onclick="document.getElementById(\'modalOverlay\').style.display=\'none\'" class="fs-12">关闭</button></div>';
  h += '</div>';

  var box = document.getElementById('modalBox');
  var ovl = document.getElementById('modalOverlay');
  if (box && ovl) { box.innerHTML = h; ovl.style.display = 'flex'; ovl.onclick = function(e) { if (e.target === ovl) ovl.style.display = 'none'; }; }
  else { alert(name + ':\n' + (exp.lifeOverview || '').substring(0, 200)); }
  console.log('[角色卡] 查看档案:', entry);
};
