// 情色短章 · 阅读模式
function 渲染短章阅读(el) {
  el.innerHTML = [
    '<div style="max-width:700px;margin:0 auto">',
    '<div class="form-group mb-8"><label class="text-muted">短章标题</label>',
    '<input class="llm-input" id="短章阅读标题" value="' + escHtml(vignetteCurrentTitle||'') + '" placeholder="输入或从列表选择短章标题..."></div>',
    '<div id="vignetteReadingMeta" class="text-muted text-sm mb-16"></div>',
    '<div id="vignetteReadingContent" class="n-card" style="font-size:15px;line-height:2;padding:24px;white-space:pre-wrap;min-height:300px">',
    '<div class="placeholder-text">' + (vignetteCurrentTitle ? '加载中…' : '输入标题后保存即可阅读') + '</div>',
    '</div>',
    '</div>',
  ].join('\n');

  document.getElementById('短章阅读标题').addEventListener('change', function() {
    vignetteCurrentTitle = this.value.trim() || null;
    渲染短章阅读(el);
  });

  if (!vignetteCurrentTitle) return;

  Store.vignette.get(vignetteCurrentTitle).then(function(meta) {
    var metaEl = document.getElementById('vignetteReadingMeta');
    if (metaEl && meta) {
      var parts = [];
      if (meta.mood) parts.push(meta.mood);
      if (meta.wordCount) parts.push(meta.wordCount + ' 字');
      if (meta.scene) parts.push('场景：' + meta.scene);
      if (meta.pov) parts.push(meta.pov);
      if (meta.updatedAt) parts.push('更新：' + meta.updatedAt);
      metaEl.textContent = parts.join(' · ');
    }
  });

  Store.vignette.loadContent(vignetteCurrentTitle).then(function(content) {
    var contentEl = document.getElementById('vignetteReadingContent');
    if (contentEl) {
      if (content) {
        contentEl.innerHTML = '';
        var paragraphs = content.split('\n').filter(Boolean);
        paragraphs.forEach(function(p) {
          contentEl.innerHTML += '<p style="text-indent:2em;margin-bottom:0.8em">' + escHtml(p) + '</p>';
        });
      }
    }
  });
}
