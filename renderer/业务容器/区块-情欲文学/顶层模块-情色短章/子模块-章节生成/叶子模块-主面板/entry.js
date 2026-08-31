// 章节列表渲染、上下文面板、加载章节
// 包含：短loadWritingChapters, 短renderChapterList, 短renderContextPanel, 短loadChapterContent, 短updateWritingStatus

// ===== 段落格式化 =====
// 存储格式：干净的文本，段落间用 \n\n 分隔
// 显示格式：HTML，对话用绿色

// 段落格式化：返回 HTML，对话用绿色
function 短formatForDisplay(text) {
  if (!text) return '';
  text = text.replace(/\n{3,}/g, '\n\n');
  var paragraphs = text.split(/\n\n/);
  var result = [];
        // 中文对话引号对：开引号 → 闭引号（对称引号映射到自身）
  var DQ_OPEN = String.fromCharCode(0x201C,0x201D,0x300C,0x300D,0x300E,0x300F,0xFE41,0xFE42,0x0022,0x0027,0x2018,0x2019,0xFF02);
  var DQ_MAP = {};
  var DQ_KEYS = [0x201C,0x201D,0x300C,0x300D,0x300E,0x300F,0xFE41,0xFE42,0x0022,0x0027,0x2018,0x2019,0xFF02];
  var DQ_VALS = [0x201D,0x201D,0x300D,0x300D,0x300F,0x300F,0xFE42,0xFE42,0x0022,0x0027,0x2019,0x2019,0xFF02];
  for (var dq_i = 0; dq_i < DQ_KEYS.length; dq_i++) {
    DQ_MAP[String.fromCharCode(DQ_KEYS[dq_i])] = String.fromCharCode(DQ_VALS[dq_i]);
  }
  for (var i = 0; i < paragraphs.length; i++) {
    var p = paragraphs[i].trim();
    if (!p) continue;
    if (/^[\*\-]{3,}$/.test(p) || /^\.{3,}$/.test(p)) {
      result.push('<div style="text-align:center;color:#4ecca3;margin:1em 0;opacity:0.6;letter-spacing:6px">* * *</div>');
    } else {
      var parts = [];
      var cursor = 0;
      // 扫描整段，找出所有引号对并染色
      while (cursor < p.length) {
        var nextOpen = -1;
        var openerChar = '';
        for (var scan = cursor; scan < p.length; scan++) {
          var sc = p.charAt(scan);
          if (DQ_OPEN.indexOf(sc) >= 0) {
            nextOpen = scan;
            openerChar = sc;
            break;
          }
        }
        if (nextOpen < 0) {
          // 没有更多引号，剩余文字原样输出
          parts.push(p.substring(cursor));
          break;
        }
        // 引号前的文字
        if (nextOpen > cursor) {
          parts.push(p.substring(cursor, nextOpen));
        }
        // 找匹配的闭引号
        var closerChar = DQ_MAP[openerChar] || openerChar;
        var closeIdx = p.indexOf(closerChar, nextOpen + 1);
        if (closeIdx >= 0) {
          parts.push('<span style="color:#4ecca3">' + p.substring(nextOpen, closeIdx + 1) + '</span>');
          cursor = closeIdx + 1;
        } else {
          // 没有闭引号，从开引号到结尾全染
          parts.push('<span style="color:#4ecca3">' + p.substring(nextOpen) + '</span>');
          cursor = p.length;
        }
      }
      var highlighted = parts.join('');
      highlighted = highlighted.replace(/\n/g, '<br>');
      result.push('<div style="text-indent:2em;margin:0">' + highlighted + '</div>');
    }
  }
  return result.join('');
}

// 从 HTML 中提取纯文本（保存用）
function 短extractPlainText(html) {
  if (!html) return '';
  var text = html.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/&nbsp;/g, '　');
  text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
  return text.trim();
}

function 短formatForStorage(text) {
  if (!text) return '';
  if (text.indexOf('<') >= 0) text = 短extractPlainText(text);
  text = text.replace(/^　　/gm, '');
  text = text.replace(/\n　　/g, '\n');
  text = text.replace(/\n/g, '\n\n');
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

// ===== 章节加载 =====
function 短loadWritingChapters() {
  var itemsEl = document.getElementById('writingChapterItems');
  if (!itemsEl) { console.log('[Writing] itemsEl null!'); return; }

  itemsEl.innerHTML = '<div class="text-muted text-sm p-8">加载中...</div>';

  // 优先使用内存中的 短oc（如果属于当前作品）
  if (typeof 短oc !== 'undefined' && 短oc.length && 短ot === vignetteCurrentTitle) {
    短写作章集 = 短oc;
    短renderChapterList();
    短loadChapterContent();
    短renderContextPanel();
    短renderStreakBar();
    return;
  }

  var title = vignetteCurrentTitle;
  if (!title) { itemsEl.innerHTML = '<div class="text-muted text-sm p-8">请先选择作品</div>'; return; }

  Store.vignette.get(title).then(function(data) {
    if (data && data.outline && data.outline.length) {
      短oc = data.outline;
      短ot = vignetteCurrentTitle;
      短oc.forEach(function(ch, i) {
        if (ch.index === undefined) ch.index = i + 1;
        if (ch.characters && typeof ch.characters === 'string') ch.characters = ch.characters.split(/[、,，\s]+/).filter(Boolean);
        if (!ch.characters || !Array.isArray(ch.characters)) ch.characters = [];
      });
      短写作章集 = 短oc;
    } else {
      // 如果 Store 中没有数据，尝试从内存恢复
      if (typeof 短oc !== 'undefined' && 短oc.length) {
        短写作章集 = 短oc;
        // 确保数据也被保存到 Store
        短ot = vignetteCurrentTitle;
        Store.vignette.get(vignetteCurrentTitle).then(function(m) {
          m = m || {};
          m.outline = 短oc;
          Store.vignette.save(vignetteCurrentTitle, m);
        });
      } else {
        短写作章集 = [];
      }
    }
    if (短写作章集.length === 0) {
      itemsEl.innerHTML = '<div class="text-muted text-sm p-8">暂无大纲数据</div>';
      return;
    }
    短renderChapterList();
    短loadChapterContent();
    短renderContextPanel();
    短renderStreakBar();
  }).catch(function(err) {
    console.error('[Writing] Store.vignette.get error:', err);
    itemsEl.innerHTML = '<div class="text-muted text-sm" style="padding:8px;color:var(--error)">加载失败: ' + err.message + '</div>';
  });
}

// ===== 章节列表渲染 =====
function 短renderChapterList() {
  var itemsEl = document.getElementById('writingChapterItems');
  if (!itemsEl) return;

  短写作章集.forEach(function(ch, i) { ch.index = i + 1; });

  var h = '';
  短写作章集.forEach(function(ch, i) {
    var isActive = i === 短写作当前章;
    var hasContent = !!(ch.aiContent || ch._written);
    var wc = ch._wordCount || 0;
    var target = ch.highlight ? 8000 : (ch.wordTarget || 4000);
    var pct = target > 0 ? Math.min(100, Math.round(wc / target * 100)) : 0;
    var statusIcon = hasContent ? (pct >= 80 ? '✓' : '⚡') : '○';
    var statusColor = hasContent ? (pct >= 80 ? 'var(--success)' : 'var(--warning)') : 'var(--fg2)';
    var hcStyle = ch.highlight ? 'border-color:var(--warning);' : '';

    h += '<div class="n-card" style="padding:8px;margin-bottom:4px;cursor:pointer;' + (isActive ? 'border-color:var(--accent2);' : '') + hcStyle + '" data-ch="' + i + '">';
    h += '  <div class="flex-row" style="justify-content:space-between;align-items:center">';
    h += '    <span style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1"><span style="color:var(--accent2);margin-right:4px">' + (i + 1) + '.</span>' + escHtml(ch.title || '未命名') + '</span>';
    h += '    <span style="font-size:11px;color:' + statusColor + ';flex-shrink:0;margin-left:4px">' + statusIcon + '</span>';
    h += '  </div>';
    if (hasContent) {
      var pctColor = pct >= 80 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--fg2)';
      h += '  <div style="margin-top:4px;height:3px;background:var(--bg3);border-radius:2px;overflow:hidden">';
      h += '    <div style="height:100%;width:' + pct + '%;background:' + pctColor + ';border-radius:2px;transition:width 0.2s"></div></div>';
      h += '  <div class="text-muted fs-10 mt-2" style="display:flex;justify-content:space-between"><span>' + wc + '/' + target + '</span><span>' + pct + '%</span></div>';
    } else {
      h += '  <div class="text-muted fs-10 mt-2">' + target + ' 字</div>';
    }
    if (ch.highlight) h += '  <div style="font-size:9px;color:var(--warning);margin-top:2px">★ 重点章节</div>';
    h += '</div>';
  });
  itemsEl.innerHTML = h;

  itemsEl.querySelectorAll('[data-ch]').forEach(function(item) {
    item.addEventListener('click', function() {
      短写作当前章 = parseInt(this.getAttribute('data-ch'));
      短renderChapterList();
      短loadChapterContent();
      短renderContextPanel();
    });
  });
}

// ===== 上下文面板 =====
function 短renderContextPanel() {
  var el = document.getElementById('writingCtxContent');
  if (!el) return;
  var ch = 短写作章集[短写作当前章];
  if (!ch) { el.innerHTML = '<div class="text-muted text-sm">选择章节查看信息</div>'; return; }

  var h = '';

  if (ch.playTags) {
    h += '<div class="text-muted text-sm mt-8">玩法</div><div class="flex gap-4 flex-wrap mt-4">';
    var pt = ch.playTags;
    var ptArr = Array.isArray(pt) ? pt : (typeof pt === 'string' ? pt.split(/[··]+/).filter(Boolean) : []);
    ptArr.forEach(function(tag) {
      h += '<span style="font-size:10px;background:var(--bg3);color:var(--accent2);padding:2px 8px;border-radius:10px">' + escHtml(tag.trim()) + '</span>';
    });
    h += '</div>';
  }
  if (ch.eroticaLevel) {
    var elaColor = ch.eroticaLevel === '重度' ? 'var(--accent)' : ch.eroticaLevel === '中度' ? 'var(--warning)' : 'var(--fg2)';
    h += '<div class="text-muted text-sm mt-8">情色强度</div>';
    h += '<span style="font-size:10px;color:' + elaColor + ';border:1px solid ' + elaColor + ';padding:1px 8px;border-radius:8px;display:inline-block;margin-top:2px">' + escHtml(ch.eroticaLevel) + '</span>';
  }
  var target = ch.highlight ? 8000 : (ch.wordTarget || 4000);
  h += '<div class="text-muted text-sm mt-8">字数目标</div>';
  h += '<div style="font-size:12px;margin-top:2px">' + target + ' 字' + (ch.highlight ? ' <span style="color:var(--warning);font-size:10px">★ 重点翻倍</span>' : '') + '</div>';
  if (ch.characters && ch.characters.length) {
    h += '<div class="text-muted text-sm mt-8">出场角色</div><div class="flex gap-4 flex-wrap mt-4">';
    (Array.isArray(ch.characters) ? ch.characters : []).forEach(function(c) {
      h += '<span style="font-size:10px;background:var(--accent-dim);color:var(--accent2);padding:2px 8px;border-radius:10px">' + escHtml(c.trim()) + '</span>';
    });
    h += '</div>';
  }
  if (ch.setting) h += '<div class="text-muted text-sm mt-8">场景</div><div class="fs-11 mt-2">' + escHtml(ch.setting) + '</div>';
  if (ch.link) h += '<div class="text-muted text-sm mt-8">衔接</div><div class="fs-11 c-fg2 mt-2">' + escHtml(ch.link) + '</div>';
  if (ch.content) h += '<div class="text-muted text-sm mt-8">内容概要</div><div style="font-size:11px;color:var(--fg2);margin-top:2px;line-height:1.5">' + escHtml(ch.content) + '</div>';
  h += '<div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border)">';
  h += '  <button class="btn-sm" id="ctxGenBtn" style="background:var(--accent);color:#fff;width:100%;font-size:12px">🤖 根据大纲生成本章</button></div>';

  el.innerHTML = h;
  var genBtn = document.getElementById('ctxGenBtn');
  if (genBtn) genBtn.addEventListener('click', function() { if (typeof window.短章AI生成章节 === 'function') window.短章AI生成章节(); else toast('AI 模块未加载'); });
}

// ===== 章节内容加载 =====
function 短loadChapterContent() {
  var ch = 短写作章集[短写作当前章];
  if (!ch) return;
  var titleEl = document.getElementById('writingChapterTitle');
  if (titleEl) titleEl.textContent = ch.title || '第' + (短写作当前章 + 1) + '章';
  var editor = document.getElementById('writingEditor');
  if (!editor) return;
  var chName = 'ch' + (短写作当前章 + 1) + '.txt';

  Store.vignette.getChapter(vignetteCurrentTitle, chName).then(function(content) {
    if (content) { editor.innerHTML = 短formatForDisplay(content); ch._written = true; ch._wordCount = wordCount(formatForStorage(content)); }
    else if (ch.aiContent) { editor.innerHTML = 短formatForDisplay(ch.aiContent); ch._wordCount = wordCount(ch.aiContent); }
    else { editor.innerHTML = ''; ch._wordCount = 0; }
    短updateWritingStatus();
    短recordWritingStreak();
  });
}

// ===== 写作状态更新 =====
function 短updateWritingStatus() {
  var wcEl = document.getElementById('writingWordCount');
  if (!wcEl) return;
  var ch = 短写作章集[短写作当前章];
  if (!ch) return;
  var editor = document.getElementById('writingEditor');
  if (!editor) return;

  var wc = wordCount(editor.innerText);
  ch._wordCount = wc;
  var target = ch.highlight ? 8000 : (ch.wordTarget || 4000);
  var pct = target > 0 ? Math.round(wc / target * 100) : 0;
  var pctColor = pct >= 100 ? 'var(--success)' : pct >= 80 ? 'var(--warning)' : 'var(--fg2)';
  wcEl.innerHTML = '字数：<span style="color:' + pctColor + '">' + wc + '</span> / ' + target + ' 字（' + pct + '%）';
  if (editor.innerText.trim()) ch._written = true;
}
