// 情色短章 · 作品列表
var VIGNETTE_MOODS = [
  { id: '温柔', icon: '🌙' },
  { id: '黑暗', icon: '🌑' },
  { id: '诗意', icon: '🌸' },
  { id: '粗暴', icon: '🔥' },
  { id: '浪漫', icon: '💕' },
  { id: '伤感', icon: '😢' },
  { id: '甜美', icon: '🍬' },
  { id: '狂野', icon: '🐺' },
];

function 渲染短章列表(el) {
  el.innerHTML = '<div class="text-center p-30"><div class="loading-spinner"></div></div>';

  Store.vignette.list().then(function(items) {
    if (!items.length) {
      el.innerHTML = '<div style="padding:30px;text-align:center"><div class="placeholder-text" style="margin-bottom:12px">暂无作品</div><button class="btn-new" onclick="vignetteCurrentTitle=null;短章切换视图(\'outline\')">＋ 新建</button></div>';
      return;
    }

    var h = '<div class="mb-10"><button class="btn-new" onclick="vignetteCurrentTitle=null;短章切换视图(\'outline\')">＋ 新建</button></div>';
    items.forEach(function(item) {
      var genre = item.genreTags || [];
      var play = item.playTags || [];
      h += '<div class="n-card" style="margin-bottom:8px;padding:12px;cursor:pointer" onclick="短打开展示(\'' + escHtml(item.title) + '\')">';
      h += '<div style="display:flex;align-items:center;gap:8px">';
      h += '<div class="flex-1">';
      h += '<div style="font-weight:600;font-size:12px;color:var(--fg)">' + escHtml(item.title) + '</div>';
      h += '<div class="fs-11 c-fg2 mt-2">';
      if (item.scene) h += escHtml(item.scene) + ' · ';
      h += (item.wordCount || 0) + ' 字';
      if (item.status === 'finished') h += ' · ✅ 已完成';
      if (genre.length || play.length) {
        h += '</div><div style="margin-top:2px;font-size:10px">';
        genre.forEach(function(t){h += '<span style="background:var(--accent-dim);color:var(--accent2);padding:1px 5px;border-radius:3px;margin-right:3px">' + escHtml(t) + '</span>';});
        play.forEach(function(t){h += '<span style="background:var(--bg3);color:var(--fg2);padding:1px 5px;border-radius:3px;margin-right:3px">' + escHtml(t) + '</span>';});
      }
      h += '</div></div>';
      h += '<div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">';
      h += '<span class="vignette-goto-outline" data-title="' + escHtml(item.title) + '" style="display:inline-flex;align-items:center;justify-content:center;gap:4px;font-size:11px;padding:6px 12px;border-radius:5px;background:var(--accent-dim);color:var(--accent2);cursor:pointer;border:1px solid var(--border);transition:all 0.15s;white-space:nowrap;font-weight:500">📐 大纲</span>';
      h += '<span class="vignette-goto-writing" data-title="' + escHtml(item.title) + '" style="display:inline-flex;align-items:center;justify-content:center;gap:4px;font-size:11px;padding:6px 12px;border-radius:5px;background:var(--bg3);color:var(--fg2);cursor:pointer;border:1px solid var(--border);transition:all 0.15s;white-space:nowrap;font-weight:500">📝 写作</span>';
      h += '</div>';
      h += '<div style="display:flex;gap:4px;flex-shrink:0;align-items:center">';
      h += '<button class="btn-secondary btn-sm" style="padding:2px 6px;font-size:10px" onclick="event.stopPropagation();迁移短章到小说(\'' + escHtml(item.title) + '\')" title="迁移到小说">📚</button>';
      h += '<button class="btn-secondary btn-sm" style="padding:2px 8px;font-size:11px;color:var(--error)" onclick="event.stopPropagation();短删除作品(\'' + escHtml(item.title) + '\')">🗑</button>';
      h += '</div>';
      h += '</div></div>';
    });

    el.innerHTML = h;

    // 大纲按钮点击事件
    el.querySelectorAll('.vignette-goto-outline').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var title = this.getAttribute('data-title');
        if (!title) return;
        vignetteCurrentTitle = title;
        短章切换视图('outline');
      });
    });

    // 写作按钮点击事件
    el.querySelectorAll('.vignette-goto-writing').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var title = this.getAttribute('data-title');
        if (!title) return;
        vignetteCurrentTitle = title;
        短章切换视图('writing');
      });
    });
  });
}

function 短切换氛围组(mood) {
  var el = document.getElementById('vignetteMoodGroup_' + mood);
  var arrow = document.getElementById('vignetteMoodArrow_' + mood);
  if (!el) return;
  var hidden = el.style.display === 'none';
  el.style.display = hidden ? '' : 'none';
  if (arrow) arrow.textContent = hidden ? '▼' : '▶';
}

function 短筛选列表() {
  var q = (document.getElementById('vignetteSearch').value || '').trim().toLowerCase();
  document.querySelectorAll('.vignette-mood-group > div').forEach(function(row) {
    var title = row.querySelector('div[style*="font-weight:600"]');
    if (!title) return;
    row.style.display = (!q || title.textContent.toLowerCase().includes(q)) ? '' : 'none';
  });
}

function 短打开展示(title) {
  vignetteCurrentTitle = title;
  短章切换视图('outline');
}

function 短删除作品(title) {
  confirmDialog('确定删除《' + title + '》？', function() {
    Store.vignette.delete(title).then(function() { toast('已删除'); 短章切换视图('list'); });
  });
}

function 迁移短章到小说(title) {
  if (!title) return;
  Store.vignette.get(title).then(function(data) {
    if (!data) { toast('数据不存在'); return; }
    Store.novel.get(title).then(function(existing) {
      if (existing) {
        confirmDialog('小说中已存在同名作品《' + title + '》，确定覆盖吗？', function() {
          Store.novel.save(title, data).then(function() {
            toast('已迁移到小说：' + title);
          });
        });
      } else {
        Store.novel.save(title, data).then(function() {
          toast('已迁移到小说：' + title);
        });
      }
    });
  });
}
window.迁移短章到小说 = 迁移短章到小说;
window.短migrateVignetteToNovel = window.迁移短章到小说;
