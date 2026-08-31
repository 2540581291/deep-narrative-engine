// 系列写作 · 入口 + 导航
function XL渲染大纲(el, title, meta) {
  swActiveSeries = title || swActiveSeries;

  var activeTab = _XLSubTab || 'overview';
  el.innerHTML =
    '<div class="flex-row" style="justify-content:space-between;margin-bottom:8px;gap:6px">' +
    '<div class="ai-field-row flex-1">' +
    '<input class="llm-input" id="XLTitleInput" style="font-size:16px;font-weight:600;flex:1" value="' + escHtml(swActiveSeries||'') + '" placeholder="输入系列标题...">' +
    '<button class="ai-suggest-btn" onclick="_aiTargetId=\'XLTitleInput\';openAiPanel(\'XLTitleSuggest\')" title="AI 建议标题">🤖</button></div>' +
    '</div>' +
    '<div id="aiopts_XLTitleSuggest" class="dn mt-4"></div>' +

    // Volume management at top
    '<div id="XLVolSection" class="n-card mb-8" style="padding:8px 12px"><div class="fw-600 fs-13 mb-6">📖 分卷管理</div><div id="XLVolList"></div></div>' +

    // Tab navigation
    '<div class="sub-nav">' +
    '  <div class="sub-nav-item' + (activeTab === 'overview' ? ' act' : '') + '" data-XLtab="overview">📋 概览</div>' +
    '  <div class="sub-nav-item' + (activeTab === 'references' ? ' act' : '') + '" data-XLtab="references">📚 参考</div>' +
    '  <div class="sub-nav-item' + (activeTab === 'outline' ? ' act' : '') + '" data-XLtab="outline">📝 大纲正文</div>' +
    '  <div class="sub-nav-item' + (activeTab === 'notes' ? ' act' : '') + '" data-XLtab="notes">📌 写作备注</div>' +
    '</div>' +
    '<div id="XLOutlineTabContent"></div>';

  // Volume management: load and render
  XL渲染卷列表();

  var _titleSaveTimer = null;
  document.getElementById('XLTitleInput').addEventListener('input', function() {
    var t = this.value.trim();
    if (_titleSaveTimer) clearTimeout(_titleSaveTimer);
    _titleSaveTimer = setTimeout(function() {
      if (!t) return;
      var oldTitle = swActiveSeries;
      if (oldTitle === t) return;
      if (!oldTitle) {
        swActiveSeries = t;
        Store.seriesWriting.get(t).then(function(m) {
          m = m || {};
          if (!m.createdAt) m.createdAt = fmtDate(new Date());
          Store.seriesWriting.save(t, m);
        });
      } else {
        Store.seriesWriting.rename(oldTitle, t).then(function() {
          swActiveSeries = t;
        });
      }
    }, 300);
  });

  Array.from(el.querySelectorAll('.sub-nav-item[data-XLtab]')).forEach(function(item) {
    item.addEventListener('click', function(e) {
      var tab = this.getAttribute('data-XLtab');
      if (tab) XL切标签(tab);
    });
  });

  XL切标签(_XLSubTab || 'overview');
  if (swActiveSeries && !_XLChapters.length && meta && meta.premise) { debugLog('novel', 'auto aiGenerateOutline'); XLAiGenerateOutline(); }
}

function XL渲染卷列表() {
  if (!swActiveSeries) return;
  Store.seriesWriting.get(swActiveSeries).then(function(data) {
    if (!data) return;
    var el = document.getElementById('XLVolList');
    if (!el) return;
    var vols = data.volumes || [];
    var h = '';
    if (!vols.length) { h += '<div class="text-muted text-sm">暂无分卷</div>'; }
    else {
      vols.forEach(function(v, i) {
        h += '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--border)">';
        h += '<span style="font-weight:600;font-size:12px;color:var(--accent)">第' + (i+1) + '卷</span>';
        h += '<span class="flex-1 fs-13">' + escHtml(v.title||'未命名') + '</span>';
        h += '<span class="text-xs text-muted">' + (v.wordCount||0) + '字</span>';
        h += '<span class="btn-secondary btn-sm fs-10" onclick="XL编辑卷标题(' + i + ')">✏️</span>';
        h += '</div>';
      });
    }
    h += '<div style="margin-top:4px"><span class="btn-sm bg-accent" onclick="XL增加卷()">＋ 新增分卷</span></div>';
    el.innerHTML = h;
  });
}

function XL切标签(tab) {
  _XLSubTab = tab;
  var titleInput = document.getElementById('XLTitleInput');
  if (titleInput && titleInput.value.trim()) {
    var t = titleInput.value.trim();
    if (t !== swActiveSeries) {
      swActiveSeries = t;
      Store.seriesWriting.get(t).then(function(m) {
        m = m || {};
        if (!m.createdAt) m.createdAt = fmtDate(new Date());
        Store.seriesWriting.save(t, m);
      });
    }
  }
  var el = document.getElementById('XLOutlineTabContent');
  if (!el) return;
  var nav = el.previousElementSibling;
  if (nav && nav.classList.contains('sub-nav')) {
    Array.from(nav.children).forEach(function(item) {
      item.classList.toggle('act', item.getAttribute('data-XLtab') === tab);
    });
  }
  switch (tab) {
    case 'overview':    XLRenderOverview(el); break;
    case 'references':  XLRenderReferences(el); break;
    case 'outline':     XLRenderMain(el); break;
    case 'notes':       XLRenderNotes(el); break;
  }
}

// Volume management (ported from existing)
function XL增加卷() {
  Store.seriesWriting.get(swActiveSeries).then(function(m) {
    m = m || {};
    if (!m.volumes) m.volumes = [];
    m.volumes.push({ title: '未命名卷', wordCount: 0 });
    Store.seriesWriting.save(swActiveSeries, m).then(function() { XL渲染卷列表(); });
  });
}
window.XL增加卷 = XL增加卷;

function XL编辑卷标题(idx) {
  Store.seriesWriting.get(swActiveSeries).then(function(m) {
    m = m || {};
    var vols = m.volumes || [];
    var newTitle = prompt('修改卷名：', vols[idx] ? vols[idx].title : '');
    if (newTitle !== null && newTitle.trim()) {
      vols[idx].title = newTitle.trim();
      m.volumes = vols;
      Store.seriesWriting.save(swActiveSeries, m).then(function() { XL渲染卷列表(); });
    }
  });
}
window.XL编辑卷标题 = XL编辑卷标题;

window.XL渲染大纲 = XL渲染大纲;
window.XL切标签 = XL切标签;
