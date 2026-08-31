// 小说大纲 · 入口 + 导航
function 渲染小说大纲(el, title, meta) {
  _outlineTitle = title || novelCurrentTitle;
  debugLog('novel', '渲染小说大纲', '_outlineTitle=' + _outlineTitle + ' title=' + title + ' novelCurrentTitle=' + novelCurrentTitle);

  // 用空字符串兜底到 overview，确保高亮一致
  var activeTab = _outlineSubTab || 'overview';
  el.innerHTML =
    '<div class="flex-row" style="justify-content:space-between;margin-bottom:8px;gap:6px">' +
    '<div class="ai-field-row flex-1">' +
    '<input class="llm-input" id="说outlineTitleInput" style="font-size:16px;font-weight:600;flex:1" value="' + escHtml(_outlineTitle||'') + '" placeholder="输入作品标题...">' +
    '<button class="ai-suggest-btn" onclick="_aiTargetId=\'说outlineTitleInput\';openAiPanel(\'novelTitleSuggest\')" title="AI 建议标题">🤖</button></div>' +
    '</div>' +
    '<div id="aiopts_novelTitleSuggest" class="dn mt-4"></div>' +
    '<div class="sub-nav">' +
    '  <div class="sub-nav-item' + (activeTab === 'overview' ? ' act' : '') + '" data-otab="overview">📋 概览</div>' +
    '  <div class="sub-nav-item' + (activeTab === 'references' ? ' act' : '') + '" data-otab="references">📚 参考</div>' +
    '  <div class="sub-nav-item' + (activeTab === 'outline' ? ' act' : '') + '" data-otab="outline">📝 大纲正文</div>' +
    '  <div class="sub-nav-item' + (activeTab === 'notes' ? ' act' : '') + '" data-otab="notes">📌 写作备注</div>' +
    '</div>' +
    '<div id="说outlineTabContent"></div>';

  var _titleSaveTimer = null;
  document.getElementById('说outlineTitleInput').addEventListener('input', function() {
    var t = this.value.trim();
    if (_titleSaveTimer) clearTimeout(_titleSaveTimer);
    _titleSaveTimer = setTimeout(function() {
      if (!t) return;
      var oldTitle = _outlineTitle || novelCurrentTitle;
      if (oldTitle === t) return;
      if (!oldTitle) {
        // 之前没有保存过（新建作品首次输入标题），直接保存
        _outlineTitle = t;
        novelCurrentTitle = t;
        Store.novel.get(t).then(function(m) {
          m = m || {};
          if (!m.status) m.status = '规划中';
          if (!m.createdAt) m.createdAt = fmtDate(new Date());
          Store.novel.save(t, m);
        });
      } else {
        // 已有旧数据，rename 迁移到新标题
        Store.novel.rename(oldTitle, t).then(function() {
          _outlineTitle = t;
          novelCurrentTitle = t;
        });
      }
    }, 300);
  });

  Array.from(el.querySelectorAll('.sub-nav-item[data-otab]')).forEach(function(item) {
    item.addEventListener('click', function(e) {
      var tab = this.getAttribute('data-otab');
      if (tab) 说otab(tab);
    });
  });

  说otab(_outlineSubTab || 'overview');
  if (_outlineTitle && !_outlineChapters.length && meta && meta.premise) { debugLog('novel', 'auto aiGenerateOutline'); aiGenerateOutline(); }
}

function 说otab(tab) {
  _outlineSubTab = tab;
  // 切 tab 前先同步标题输入框的值到 _outlineTitle
  var titleInput = document.getElementById('说outlineTitleInput');
  if (titleInput && titleInput.value.trim()) {
    var t = titleInput.value.trim();
    if (t !== _outlineTitle && t !== novelCurrentTitle) {
      _outlineTitle = t;
      novelCurrentTitle = t;
      // 立即保存新标题的数据
      Store.novel.get(t).then(function(m) {
        m = m || {};
        if (!m.status) m.status = '规划中';
        if (!m.createdAt) m.createdAt = fmtDate(new Date());
        Store.novel.save(t, m);
      });
    }
  }
  debugLog('novel', '说otab(' + tab + ')', '_outlineTitle=' + _outlineTitle);
  var el = document.getElementById('说outlineTabContent');
  if (!el) { debugLog('novel', '说otab ERROR', 'el=null'); return; }
  // 更新 sub-nav 高亮
  var nav = el.previousElementSibling;
  if (nav && nav.classList.contains('sub-nav')) {
    Array.from(nav.children).forEach(function(item) {
      item.classList.toggle('act', item.getAttribute('data-otab') === tab);
    });
  }
  switch (tab) {
    case 'overview':    renderOutlineOverview(el); break;
    case 'references':  renderOutlineReferences(el); break;
    case 'outline':     renderOutlineMain(el); break;
    case 'notes':       renderOutlineNotes(el); break;
  }
}
window.说otab = 说otab;
window.N_otab = window.说otab;
window.renderNovelOutline = 渲染小说大纲;
