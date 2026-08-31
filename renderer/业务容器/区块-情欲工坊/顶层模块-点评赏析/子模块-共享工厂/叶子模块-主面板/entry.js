// 情欲工坊 · 点评赏析 · 类型模块共享工厂
// 为「评价赏析 / 喷子 / 水军」三种点评方向提供统一的 列表 / 创作 / 详情 / AI 生成（生成即入列表）逻辑。
// 用法：点评赏析体模块工厂({ storeKey, containerId, viewContentId, windowPrefix, mode, tabLabel, aiFieldId, promptName, desc })
//   每种方向一个子模块，调用即生成该方向的全部 UI 与 AI 字段；windowPrefix 用于把 切换视图/新创作/打开详情 等挂到 window。

function 点评赏析体模块工厂(cfg) {
  var 导航 = [{ id: 'list', label: '📋 ' + cfg.tabLabel + '列表' }, { id: 'create', label: '✍️ 创作' }];
  var 当前视图 = 'list';
  var 详情标题 = null;
  var 生成上下文 = { target: '', workStore: '', workTitle: '', source: '' };

  function 切换视图(view) {
    当前视图 = view;
    var el = document.getElementById(cfg.containerId);
    if (!el) return;
    var h = '<div class="tl-subnav">';
    导航.forEach(function(v) { h += '<div class="tl-subitem' + (v.id === 当前视图 ? ' act' : '') + '" data-view="' + v.id + '">' + v.label + '</div>'; });
    h += '</div><div id="' + cfg.viewContentId + '"></div>';
    el.innerHTML = h;
    var vEl = document.getElementById(cfg.viewContentId);
    if (!vEl) return;
    el.querySelectorAll('.tl-subitem').forEach(function(i) {
      i.addEventListener('click', function() {
        var v = this.getAttribute('data-view');
        if (v === 'create') { 新创作(); return; }
        切换视图(v);
      });
    });
    if (view === 'list') 渲染列表(vEl);
    else if (view === 'create') 渲染创作(vEl);
    else if (view === 'detail') 渲染详情(vEl);
  }
  function 新创作() { 详情标题 = null; 生成上下文 = { target:'', workStore:'', workTitle:'', source:'' }; 切换视图('create'); }
  function 打开详情(title) { 详情标题 = title; 切换视图('detail'); }

  function 评分星(s) {
    var n = Math.max(0, Math.min(10, parseFloat(s) || 0));
    var full = Math.round(n / 2);
    var star = '';
    for (var i = 0; i < full; i++) star += '★';
    for (var i = full; i < 5; i++) star += '☆';
    return star;
  }

  function 渲染列表(el) {
    Store[cfg.storeKey].list().then(function(items) {
      var filtered = (items || []).filter(function(i) { return (i.mode || 'appreciate') === cfg.mode; });
      var h = '<div class="mb-10 flex gap-4 flex-wrap items-center">';
      h += '<button class="btn-new" onclick="' + cfg.windowPrefix + '新创作()">＋ 新建</button>';
      h += '</div>';
      if (!filtered.length) {
        h += '<div class="placeholder-text">暂无' + cfg.tabLabel + '点评，点「写点评」由 AI 生成</div>';
      } else {
        h += '<div class="flex flex-col gap-4">';
        filtered.forEach(function(item) {
          h += '<div class="card cur-ptr" onclick="' + cfg.windowPrefix + '打开详情(\'' + escHtml(item.title) + '\')" style="padding:10px 14px">';
          h += '<div class="flex justify-between items-center">';
          h += '<div class="fw-600">' + escHtml(item.title) + '</div>';
          h += '<div class="flex gap-4 items-center">';
          if (item.score != null) h += '<span class="fs-10 c-fg2" title="综合评分 ' + item.score + '">' + 评分星(item.score) + '</span>';
          h += '<span class="badge-tag">' + escHtml(item.type || cfg.tabLabel) + '</span>';
          h += '</div></div>';
          if (item.target) h += '<div class="fs-10 c-fg3 mt-2">点评对象：' + escHtml(item.target) + '</div>';
          if (item.tldr) h += '<div class="fs-10 c-fg3 mt-2">省流：' + escHtml(item.tldr) + '</div>';
          if (item.content) h += '<div style="margin-top:6px;padding:8px;background:var(--bg2);border-radius:8px;font-size:12px;line-height:1.8;white-space:pre-wrap">' + escHtml(item.content.substring(0, 160)) + (item.content.length > 160 ? '…' : '') + '</div>';
          h += '<div class="mt-6 flex gap-4">';
          h += '<span class="btn-secondary btn-sm" onclick="event.stopPropagation();' + cfg.windowPrefix + '打开详情(\'' + escHtml(item.title) + '\')">👁 查看</span>';
          h += '<span class="btn-secondary btn-sm c-error" onclick="event.stopPropagation();' + cfg.windowPrefix + '删除项(\'' + escHtml(item.title) + '\')">🗑 删除</span>';
          h += '</div></div>';
        });
        h += '</div>';
      }
      el.innerHTML = h;
    });
  }

  function 渲染创作(el) {
    生成上下文 = { target: '', workStore: '', workTitle: '', source: '' };
    var h = '<div style="max-width:660px">';
    h += '<div class="n-card" style="margin-bottom:12px">';
    h += '<div class="text-sm text-muted mb-8">' + cfg.tabLabel + ' · ' + cfg.desc + '</div>';
    h += '<div class="form-group"><label>点评对象</label><div class="flex gap-4 items-center"><input id="' + cfg.windowPrefix + 'Target" class="llm-input" style="flex:1" oninput="' + cfg.windowPrefix + '更新生成上下文(\'target\',this.value)" placeholder="作品名，或从作品库选择"><button class="btn-sm" onclick="' + cfg.windowPrefix + '选作品()">📚 从作品库选</button></div></div>';
    h += '<input type="hidden" id="' + cfg.windowPrefix + 'WorkStore" value="">';
    h += '<input type="hidden" id="' + cfg.windowPrefix + 'WorkTitle" value="">';
    h += '<div class="form-group"><label>作品原文（可选）</label><textarea id="' + cfg.windowPrefix + 'Source" class="llm-input" rows="4" style="width:100%;resize:vertical" oninput="' + cfg.windowPrefix + '更新生成上下文(\'source\',this.value)" placeholder="可粘贴原文，AI 据此点评"></textarea></div>';
    h += '</div>';
    h += '<div class="n-card" style="margin-bottom:12px">';
    h += '<div class="text-sm text-muted mb-8">🎯 方向</div>';
    h += '<div class="fs-10 c-fg3" style="line-height:1.8">点「生成点评」后，在弹窗里按需勾选若干方向快捷项，让 AI 按你指定的侧重点来写。其余全部由 AI 产出，无需你手写。</div>';
    h += '</div>';
    h += '<div class="flex gap-6 items-center">';
    h += '<button class="btn" onclick="openAiGenPanel(\'' + cfg.aiFieldId + '\')">🤖 生成点评</button>';
    h += '<button class="btn-secondary btn-sm" onclick="切换视图(\'list\')">← 返回列表</button>';
    h += '</div></div>';
    el.innerHTML = h;
  }

  function 渲染详情(el) {
    if (!详情标题) { el.innerHTML = '<div class="placeholder-text">未找到该点评</div>'; return; }
    Store[cfg.storeKey].get(详情标题).then(function(item) {
      if (!item) { el.innerHTML = '<div class="placeholder-text">未找到该点评</div>'; return; }
      var 分维标签 = { sex:'性描写', atmosphere:'氛围营造', character:'人物欲望', prose:'文笔', metaphor:'情色隐喻', pacing:'节奏张力', fantasy:'幻想共鸣', immersion:'沉浸感' };
      var dims = item.dimScores || {};
      var dimIds = ['sex','atmosphere','character','prose','metaphor','pacing','fantasy','immersion'];
      var dimTexts = dimIds.filter(function(k){ return dims[k] != null; }).map(function(k){ return (分维标签[k]||k) + ' ' + dims[k]; });
      var h = '<div class="card" style="padding:16px;max-width:760px">';
      h += '<div class="flex justify-between items-center mb-6">';
      h += '<div class="fw-600 fs-16">' + escHtml(item.title) + '</div>';
      if (item.score != null) h += '<span class="fs-10" title="综合评分 ' + item.score + '">' + 评分星(item.score) + ' (' + item.score + ')</span>';
      h += '</div>';
      if (item.type) h += '<div class="fs-10 c-fg2 mb-2">类型：' + escHtml(item.type) + '</div>';
      if (item.target) h += '<div class="fs-10 c-fg2 mb-2">点评对象：' + escHtml(item.target) + '</div>';
      if (item.tldr) h += '<div class="fs-10 c-fg2 mb-2">省流：' + escHtml(item.tldr) + '</div>';
      if (item.tags && item.tags.length) h += '<div class="fs-10 c-fg2 mb-2">标签：' + item.tags.map(function(t) { return escHtml(t); }).join(' · ') + '</div>';
      if (dimTexts.length) h += '<div class="fs-10 c-fg2 mb-2" style="line-height:1.8">分维：' + dimTexts.join(' · ') + '</div>';
      if (item.highlights) h += '<div class="fs-10 c-fg2 mb-2">亮点：' + escHtml(item.highlights) + '</div>';
      if (item.flaws) h += '<div class="fs-10 c-fg2 mb-2">败笔：' + escHtml(item.flaws) + '</div>';
      if (item.bestLine) h += '<div class="fs-10 c-fg2 mb-2">最出彩一句：' + escHtml(item.bestLine) + '</div>';
      if (item.kinkAppeal) h += '<div class="fs-10 c-fg2 mb-2">性癖契合度：' + escHtml(item.kinkAppeal) + '</div>';
      if (item.eroticaNote) h += '<div class="fs-10 c-fg2 mb-2">情色技法：' + escHtml(item.eroticaNote) + '</div>';
      if (item.source) h += '<details style="margin:8px 0"><summary class="fs-10 c-fg2" style="cursor:pointer">查看被点评的原文</summary><div class="fs-10 c-fg3 mt-4" style="white-space:pre-wrap;max-height:200px;overflow:auto">' + escHtml(item.source) + '</div></details>';
      h += '<div style="margin:10px 0;padding:12px;background:var(--bg2);border-radius:8px;font-size:14px;line-height:1.9;white-space:pre-wrap">' + escHtml(item.content || '') + '</div>';
      h += '<div class="flex gap-6 items-center">';
      h += '<button class="btn-secondary btn-sm" onclick="切换视图(\'list\')">← 返回列表</button>';
      h += '<button class="btn-secondary btn-sm" onclick="' + cfg.windowPrefix + '重新生成()">🔄 重新生成</button>';
      h += '<button class="btn-secondary btn-sm c-error" onclick="' + cfg.windowPrefix + '删除项(\'' + escHtml(item.title) + '\')">🗑 删除</button>';
      h += '</div></div>';
      el.innerHTML = h;
    });
  }

  function 删除项(title) {
    confirmDialog('确定删除「' + title + '」？', function() {
      Store[cfg.storeKey].delete(title).then(function() { toast('已删除'); 切换视图('list'); });
    });
  }
  function 重新生成() {
    Store[cfg.storeKey].get(详情标题).then(function(item) {
      if (item) 设定生成上下文({ target: item.target, workStore: item.workStore, workTitle: item.workTitle, source: item.source });
      openAiGenPanel(cfg.aiFieldId);
    });
  }
  function 更新生成上下文(k, val) {
    生成上下文[k] = val;
    var idMap = { target: cfg.windowPrefix + 'Target', source: cfg.windowPrefix + 'Source', workStore: cfg.windowPrefix + 'WorkStore', workTitle: cfg.windowPrefix + 'WorkTitle' };
    var fid = idMap[k];
    if (fid) { var f = document.getElementById(fid); if (f) f.value = val; }
  }
  function 设定生成上下文(obj) {
    if (!obj) return;
    for (var k in obj) { if (obj.hasOwnProperty(k)) 生成上下文[k] = obj[k]; }
  }
  function 选作品() {
    stcdOpenWorkPicker({
      onPick: function(work) {
        设定生成上下文({ target: work.title, workStore: work.storeKey, workTitle: work.title, source: (work.content || '') });
        var set = function(id, val) { var e = document.getElementById(id); if (e) e.value = (val == null ? '' : val); };
        set(cfg.windowPrefix + 'Target', work.title);
        set(cfg.windowPrefix + 'WorkStore', work.storeKey);
        set(cfg.windowPrefix + 'WorkTitle', work.title);
        if (work.content) set(cfg.windowPrefix + 'Source', work.content);
        toast('已选择：' + work.title);
      },
    });
  }
  function 上下文() {
    var c = 生成上下文;
    var ctx = '';
    if (c.target) ctx += '点评对象：' + c.target + '\n';
    if (c.workTitle) ctx += '关联作品：' + c.workTitle + (c.workStore ? '（' + c.workStore + '）' : '') + '\n';
    if (c.source) ctx += '作品原文：\n' + c.source + '\n';
    return ctx || '（未指定作品，请根据用户方向写一篇通用示例点评）';
  }
  function 唯一标题(base, cb) {
    Store[cfg.storeKey].get(base).then(function(existing) {
      if (!existing) return cb(base);
      var i = 2;
      var next = base + '·' + i;
      var tryNext = function() {
        Store[cfg.storeKey].get(next).then(function(e) { if (!e) return cb(next); i++; next = base + '·' + i; tryNext(); });
      };
      tryNext();
    });
  }
  function 保存生成(d) {
    d = d || {};
    var c = 生成上下文;
    var base = d.title || c.target || (cfg.tabLabel + '点评');
    唯一标题(base, function(title) {
      var meta = {
        mode: cfg.mode, title: title,
        type: d.type || cfg.tabLabel,
        target: d.target || c.target || '',
        workStore: c.workStore || '', workTitle: c.workTitle || '', source: c.source || '',
        content: d.content || '',
        score: d.score != null ? d.score : (cfg.mode === 'troll' ? 2 : cfg.mode === 'shill' ? 9 : 8),
        dimScores: d.dimScores || {},
        highlights: d.highlights || '', flaws: d.flaws || '',
        bestLine: d.bestLine || '', kinkAppeal: d.kinkAppeal || '', eroticaNote: d.eroticaNote || '',
        tldr: d.tldr || '', recommend: d.recommend, tags: (d.tags || []),
        createdAt: fmtDate(new Date()), updatedAt: fmtDate(new Date()),
      };
      Store[cfg.storeKey].save(title, meta).then(function() {
        toast('已保存到 ' + cfg.tabLabel + ' 列表');
        切换视图('list');
      });
    });
  }

  if (typeof registerAiField !== 'undefined') {
    registerAiField(cfg.aiFieldId, cfg.tabLabel + '生成', function() { return { user: 上下文(), system: '' }; }, {
      suggestPrompt: cfg.promptName,
      fillFn: 保存生成,
    });
  }

  window[cfg.windowPrefix + '切换视图'] = 切换视图;
  window[cfg.windowPrefix + '新创作'] = 新创作;
  window[cfg.windowPrefix + '打开详情'] = 打开详情;
  window[cfg.windowPrefix + '删除项'] = 删除项;
  window[cfg.windowPrefix + '重新生成'] = 重新生成;
  window[cfg.windowPrefix + '选作品'] = 选作品;
  window[cfg.windowPrefix + '更新生成上下文'] = 更新生成上下文;
  window[cfg.windowPrefix + '保存生成'] = 保存生成;
}
window.点评赏析体模块工厂 = 点评赏析体模块工厂;
