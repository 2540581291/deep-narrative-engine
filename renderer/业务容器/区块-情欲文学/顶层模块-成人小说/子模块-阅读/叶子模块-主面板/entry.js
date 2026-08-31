// 阅读模式
function 渲染小说阅读(el) {
  el.innerHTML = [
    '<div style="display:flex;gap:16px;max-width:960px;margin:0 auto">',
    '<div class="flex-1">',
    '<div class="form-group mb-8"><label class="text-muted">作品标题</label>',
    '<input class="llm-input" id="readingNovelTitle" value="' + escHtml(novelCurrentTitle||'') + '" placeholder="输入或选择作品标题..."></div>',
    '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap" id="readingChapterNav"></div>',
    '<div id="readingContent" class="n-card" style="font-size:15px;line-height:2;padding:24px;min-height:300px">',
    '<div class="placeholder-text">' + (novelCurrentTitle ? '选择章节开始阅读' : '输入作品标题后选择作品') + '</div>',
    '</div>',
    '</div>',
    // Right: chapter metadata sidebar
    '<div id="readingMetaPanel" style="width:220px;flex-shrink:0;border-left:1px solid var(--border);padding-left:12px;display:none">',
    '<div class="text-sm text-muted mb-4">章节信息</div>',
    '<div id="readingMetaContent"></div>',
    '</div>',
    '</div>',
  ].join('\n');

  document.getElementById('readingNovelTitle').addEventListener('change', function() {
    novelCurrentTitle = this.value.trim() || null;
    渲染小说阅读(el);
  });

  if (novelCurrentTitle) {
    Store.novel.get(novelCurrentTitle).then(function(meta) {
      var outline = (meta && meta.outline) || [];
      var navEl = document.getElementById('readingChapterNav');
      if (!navEl) return;
      navEl.innerHTML = '';
      outline.forEach(function(ch, i) {
        var btn = document.createElement('button');
        btn.className = 'btn-secondary btn-sm';
        btn.textContent = ch.title || '第' + (i+1) + '章';
        if (ch.highlight) btn.style.borderColor = 'var(--warning)';
        btn.style.marginRight = '4px';
        btn.addEventListener('click', function() {
          var chName = 'ch' + (i+1) + '.txt';
          Store.novel.getChapter(novelCurrentTitle, chName).then(function(content) {
            var contentEl = document.getElementById('readingContent');
            if (contentEl) {
              contentEl.innerHTML = '<h3 class="mb-8">' + escHtml(ch.title || '第' + (i+1) + '章') + '</h3>';
              contentEl.innerHTML += '<div style="white-space:pre-wrap;line-height:2">' + escHtml(content || '暂无内容') + '</div>';
            }
            // Show metadata sidebar
            var metaPanel = document.getElementById('readingMetaPanel');
            var metaContent = document.getElementById('readingMetaContent');
            if (metaPanel && metaContent) {
              metaPanel.style.display = '';
              var mh = '';
              if (ch.playTags) {
                mh += '<div class="text-muted text-sm mt-8">玩法</div>';
                mh += '<div class="flex gap-4 flex-wrap mt-4">';
                ch.playTags.split(/[··]+/).filter(Boolean).forEach(function(tag) {
                  mh += '<span style="font-size:10px;background:var(--bg3);color:var(--accent2);padding:2px 8px;border-radius:10px">' + escHtml(tag.trim()) + '</span>';
                });
                mh += '</div>';
              }
              if (ch.eroticaLevel) {
                var ec = ch.eroticaLevel === '重度' ? 'var(--accent)' : ch.eroticaLevel === '中度' ? 'var(--warning)' : 'var(--fg2)';
                mh += '<div class="text-muted text-sm mt-8">强度</div>';
                mh += '<span style="font-size:10px;color:' + ec + ';border:1px solid ' + ec + ';padding:1px 8px;border-radius:8px;display:inline-block;margin-top:2px">' + escHtml(ch.eroticaLevel) + '</span>';
              }
              if (ch.characters && ch.characters.length) {
                var chars = Array.isArray(ch.characters) ? ch.characters : (typeof ch.characters === 'string' ? ch.characters.split(/[、,，\s]+/).filter(Boolean) : []);
                if (chars.length) {
                  mh += '<div class="text-muted text-sm mt-8">角色</div>';
                  mh += '<div class="fs-11 mt-2">' + chars.join('、') + '</div>';
                }
              }
              if (ch.setting) {
                mh += '<div class="text-muted text-sm mt-8">场景</div>';
                mh += '<div class="fs-11 c-fg2 mt-2">' + escHtml(ch.setting) + '</div>';
              }
              if (ch.link) {
                mh += '<div class="text-muted text-sm mt-8">衔接</div>';
                mh += '<div class="fs-11 c-fg2 mt-2">' + escHtml(ch.link) + '</div>';
              }
              metaContent.innerHTML = mh || '<div class="text-muted text-sm">暂无章节信息</div>';
            }
          });
        });
        navEl.appendChild(btn);
      });
    });
  }
}
