// 作品列表
function _renderListTagChips(item) {
  var allTags = (item.playTags||[]).concat(item.genreTags||item.tags||[]);
  if (!allTags.length) return '';
  var genreLabels = []; var playLabels = [];
  GENRE_TAGS.forEach(function(g){genreLabels.push(g.id);genreLabels.push(g.label);});
  PLAY_TAGS.forEach(function(p){playLabels.push(p.id);playLabels.push(p.label);});
  var genreList = []; var playList = [];
  allTags.forEach(function(t) {
    if (genreLabels.indexOf(t) >= 0) genreList.push(t);
    else playList.push(t);
  });
  var h = '';
  if (genreList.length) h += genreList.map(function(l){return '<span style="font-size:10px;background:var(--accent-dim);color:var(--accent2);padding:2px 6px;border-radius:3px;margin-right:4px">' + escHtml(l) + '</span>';}).join('');
  if (playList.length) h += playList.map(function(l){return '<span style="font-size:10px;background:var(--bg3);color:var(--fg2);padding:2px 6px;border-radius:3px;margin-right:4px">' + escHtml(l) + '</span>';}).join('');
  return h ? '<div class="text-muted text-sm mt-4">' + h + '</div>' : '';
}

function 渲染小说列表(el) {
  debugLog('novel', '渲染小说列表');
  Store.novel.list().then(function(items) {
    var h = '<div class="flex-row" style="justify-content:space-between;margin-bottom:12px">' +
      '<button class="btn-new" id="novelCreateFromListBtn">＋ 新建</button></div>' +
      '<div id="novelListItems">';
    if (!items || !items.length) {
      h += '<div class="placeholder-text">暂无作品，点击上方按钮创建</div>';
    } else {
      items.forEach(function(item) {
        var status = item.status || '规划中';
        var statusColor = status === '写作中' ? 'var(--accent)' : status === '已完成' ? 'var(--success)' : 'var(--fg2)';
        h += '<div class="n-card cur-ptr mb-6 p-10" data-title="' + escHtml(item.title) + '" style="display:flex;align-items:center;gap:12px">' +
          '<div class="flex-1">' +
          '<div class="flex-row justify-between">' +
          '<span style="font-weight:600;font-size:14px;flex:1" class="novel-list-item">' + escHtml(item.title) + '</span>' +
          '<span style="font-size:11px;color:' + statusColor + '">' + escHtml(status) + '</span>' +
          '<span class="novel-del-btn" style="font-size:10px;color:var(--error);cursor:pointer;margin-left:8px;padding:2px 6px;border-radius:3px;opacity:0.6" title="删除作品">✕</span>' +
          '</div>' +
          (item.premise ? '<div class="text-muted text-sm mt-4">' + escHtml(item.premise).slice(0, 80) + '</div>' : '') +
          _renderListTagChips(item) +
          '<div class="text-muted text-xs mt-4">' + escHtml(item.updatedAt || '') + '</div>' +
          '</div>' +
          '<div class="flex-col" style="gap:8px;flex-shrink:0">' +
          '<span class="novel-goto-outline" data-title="' + escHtml(item.title) + '" style="display:inline-flex;align-items:center;justify-content:center;gap:4px;font-size:12px;padding:8px 16px;border-radius:6px;background:var(--accent-dim);color:var(--accent2);cursor:pointer;border:1px solid var(--border);transition:all 0.15s;white-space:nowrap;font-weight:500">📐 大纲</span>' +
          '<span class="novel-goto-writing" data-title="' + escHtml(item.title) + '" style="display:inline-flex;align-items:center;justify-content:center;gap:4px;font-size:12px;padding:8px 16px;border-radius:6px;background:var(--bg3);color:var(--fg2);cursor:pointer;border:1px solid var(--border);transition:all 0.15s;white-space:nowrap;font-weight:500">📝 写作</span>' +
          '</div>' +
          '</div>';
      });
    }
    h += '</div>';
    el.innerHTML = h;
    var createBtn = document.getElementById('novelCreateFromListBtn');
    if (createBtn) {
      createBtn.addEventListener('click', function() {
        novelCurrentTitle = '';
        _outlineTitle = '';
        小说切换视图('outline');
      });
    }
    el.querySelectorAll('.n-card[data-title]').forEach(function(card) {
      card.addEventListener('click', function(e) {
        // 如果点击的是按钮，不处理卡片点击
        if (e.target.classList.contains('novel-goto-outline') || e.target.classList.contains('novel-goto-writing') || e.target.classList.contains('novel-del-btn')) {
          return;
        }
        var title = this.getAttribute('data-title');
        if (!title) return;
        novelCurrentTitle = title;
        _outlineTitle = title;
        小说切换视图('outline');
      });
    });

    // 大纲按钮点击事件
    el.querySelectorAll('.novel-goto-outline').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var title = this.getAttribute('data-title');
        if (!title) return;
        novelCurrentTitle = title;
        _outlineTitle = title;
        小说切换视图('outline');
      });
    });

    // 写作按钮点击事件
    el.querySelectorAll('.novel-goto-writing').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var title = this.getAttribute('data-title');
        if (!title) return;
        novelCurrentTitle = title;
        _outlineTitle = title;
        小说切换视图('writing');
      });
    });

    el.querySelectorAll('.novel-del-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var card = this.closest('.n-card');
        var title = card.getAttribute('data-title');
        if (!title) return;
        confirmDialog('确定要删除作品「' + title + '」吗？此操作不可恢复。', function() {
          Store.novel.delete(title).then(function() {
            toast('已删除：' + title);
            渲染小说列表(el);
          }).catch(function(err) {
            toast('删除失败: ' + (err.message || '未知错误'));
          });
        });
      });
    });
  });
}
