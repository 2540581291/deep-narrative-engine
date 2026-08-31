// 小说大纲 · 入口 + 导航
function 渲染短章大纲(el, title, meta) {
  短ot = title || vignetteCurrentTitle;
  debugLog('vignette', '渲染短章大纲', '短ot=' + 短ot + ' title=' + title + ' vignetteCurrentTitle=' + vignetteCurrentTitle);

  // 用空字符串兜底到 overview，确保高亮一致
  var activeTab = 短ost || 'overview';
  el.innerHTML =
    '<div class="flex-row" style="justify-content:space-between;margin-bottom:8px;gap:6px">' +
    '<div class="ai-field-row flex-1">' +
    '<input class="llm-input" id="短outlineTitleInput" style="font-size:16px;font-weight:600;flex:1" value="' + escHtml(短ot||'') + '" placeholder="输入作品标题...">' +
    '<button class="ai-suggest-btn" onclick="_aiTargetId=\'短outlineTitleInput\';openAiPanel(\'V_novelTitleSuggest\')" title="AI 建议标题">🤖</button></div>' +
    '</div>' +
    '<div id="aiopts_V_novelTitleSuggest" class="dn mt-4"></div>' +
    '<div class="sub-nav">' +
    '  <div class="sub-nav-item' + (activeTab === 'overview' ? ' act' : '') + '" data-otab="overview">📋 概览</div>' +
    '  <div class="sub-nav-item' + (activeTab === 'references' ? ' act' : '') + '" data-otab="references">📚 参考</div>' +
    '  <div class="sub-nav-item' + (activeTab === 'outline' ? ' act' : '') + '" data-otab="outline">📝 大纲正文</div>' +
    '  <div class="sub-nav-item' + (activeTab === 'notes' ? ' act' : '') + '" data-otab="notes">📌 写作备注</div>' +
    '</div>' +
    '<div id="短outlineTabContent"></div>';

  var _titleSaveTimer = null;
  document.getElementById('短outlineTitleInput').addEventListener('input', function() {
    var t = this.value.trim();
    if (_titleSaveTimer) clearTimeout(_titleSaveTimer);
    _titleSaveTimer = setTimeout(function() {
      if (!t) return;
      var oldTitle = 短ot || vignetteCurrentTitle;
      if (oldTitle === t) return;
      if (!oldTitle) {
        短ot = t;
        vignetteCurrentTitle = t;
        Store.vignette.get(t).then(function(m) {
          m = m || {};
          if (!m.status) m.status = '规划中';
          if (!m.createdAt) m.createdAt = fmtDate(new Date());
          Store.vignette.save(t, m);
        });
      } else {
        Store.vignette.rename(oldTitle, t).then(function() {
          短ot = t;
          vignetteCurrentTitle = t;
        });
      }
    }, 300);
  });

  Array.from(el.querySelectorAll('.sub-nav-item[data-otab]')).forEach(function(item) {
    item.addEventListener('click', function(e) {
      var tab = this.getAttribute('data-otab');
      if (tab) 短otab(tab);
    });
  });

  短otab(短ost || 'overview');
  if (短ot && !短oc.length && meta && meta.premise) { debugLog('vignette', 'auto 短aiGenerateOutline'); 短aiGenerateOutline(); }
}

function 短otab(tab) {
  短ost = tab;
  // 切 tab 前先同步标题输入框的值到 短ot
  var titleInput = document.getElementById('短outlineTitleInput');
  if (titleInput && titleInput.value.trim()) {
    var t = titleInput.value.trim();
    if (t !== 短ot && t !== vignetteCurrentTitle) {
      短ot = t;
      vignetteCurrentTitle = 短ot;
      Store.vignette.get(t).then(function(m) {
        m = m || {};
        if (!m.status) m.status = '规划中';
        if (!m.createdAt) m.createdAt = fmtDate(new Date());
        Store.vignette.save(t, m);
      });
    }
  }
  debugLog('vignette', '短otab(' + tab + ')', '短ot=' + 短ot);
  var el = document.getElementById('短outlineTabContent');
  if (!el) { debugLog('vignette', '短otab ERROR', 'el=null'); return; }
  // 更新 sub-nav 高亮
  var nav = el.previousElementSibling;
  if (nav && nav.classList.contains('sub-nav')) {
    Array.from(nav.children).forEach(function(item) {
      item.classList.toggle('act', item.getAttribute('data-otab') === tab);
    });
  }
  switch (tab) {
    case 'overview':    短renderOutlineOverview(el); break;
    case 'references':  短renderOutlineReferences(el); break;
    case 'outline':     if (短ot) 短renderOutlineMain(el); else el.innerHTML = '<div class="placeholder-text">请先创建或选择作品</div>'; break;
    case 'notes':       短renderOutlineNotes(el); break;
  }
}
window.短otab = 短otab;
window.V_otab = window.短otab;
window.renderVignetteOutline = 渲染短章大纲;
