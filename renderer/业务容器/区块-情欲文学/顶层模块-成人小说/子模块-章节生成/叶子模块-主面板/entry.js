// 章节生成相关函数
// 提供章节生成、批量生成、版本对比等功能

// ===== 段落格式化（缩进 + 去空行） =====
// 存储格式：干净的文本，段落间用 \n\n 分隔
// 显示格式：段落间只有 \n，每段开头加全角空格缩进
// 段落格式化：返回 HTML，对话用绿色
function formatForDisplay(text) {
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
function extractPlainText(html) {
  if (!html) return '';
  // 去掉 HTML 标签
  var text = html.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<[^>]+>/g, '');
  // 去掉 &nbsp;
  text = text.replace(/&nbsp;/g, '　');
  // HTML 实体解码
  text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
  return text.trim();
}

// 从 HTML 中提取纯文本（用于 wordCount 等，去掉缩进）
function formatForStorage(text) {
  if (!text) return '';
  // 如果是 HTML，提取纯文本
  if (text.indexOf('<') >= 0) text = extractPlainText(text);
  text = text.replace(/^　　/gm, '');
  text = text.replace(/\n　　/g, '\n');
  text = text.replace(/\n/g, '\n\n');
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

// 单版本：只生成一次
var _writingGenVersionCount = 0;

function doAiGenerateChapterMultiVersion() {
  var editor = document.getElementById('writingEditor');
  var targetIdx = 小说写作当前章;
  var ch = 小说写作章集[targetIdx];
  var statusEl = document.getElementById('writingSaveStatusHeader');
  Store.novel.get(novelCurrentTitle).then(function(meta) {
    meta = meta || {};

    // 只包含相邻章节的概要（前一章和后一章），避免长篇小说分散注意力
    var adjacentOverview = [];
    var curIdx = targetIdx;
    if (curIdx > 0) {
      var prev = 小说写作章集[curIdx - 1];
      adjacentOverview.push('【前一章】第' + curIdx + '章《' + (prev.title || '') + '》' + (prev.content ? '：' + prev.content : ''));
    }
    adjacentOverview.push('【当前章】第' + (curIdx + 1) + '章《' + (ch.title || '') + '》' + (ch.content ? '：' + ch.content : ''));
    if (curIdx < 小说写作章集.length - 1) {
      var next = 小说写作章集[curIdx + 1];
      adjacentOverview.push('【后一章】第' + (curIdx + 2) + '章《' + (next.title || '') + '》' + (next.content ? '：' + next.content : ''));
    }
    var allOverview = adjacentOverview.join('\n');
    var prevFileName = 'ch' + (targetIdx) + '.txt';
    var prevContentPromise = targetIdx > 0
      ? Store.novel.getChapter(novelCurrentTitle, prevFileName)
      : Promise.resolve('');

    prevContentPromise.then(function(prevText) {
      var prevSnippet = prevText ? prevText.slice(-500) : '';
      var chapterOverview = '第' + ch.index + '章《' + (ch.title || '') + '》';
      if (ch.playTags) chapterOverview += '\n玩法：' + ch.playTags;
      if (ch.eroticaLevel) chapterOverview += '\n情色强度：' + ch.eroticaLevel;
      if (ch.characters && ch.characters.length) {
        var chars = Array.isArray(ch.characters) ? ch.characters : (typeof ch.characters === 'string' ? ch.characters.split(/[、,，\s]+/).filter(Boolean) : []);
        chapterOverview += '\n出场角色：' + chars.join('、');
      }
      if (ch.setting) chapterOverview += '\n场景：' + ch.setting;
      if (ch.link) chapterOverview += '\n衔接：' + ch.link;
      if (ch.content) chapterOverview += '\n概要：' + ch.content;
      chapterOverview += '\n目标字数：' + (ch.highlight ? 8000 : (ch.wordTarget || 4000));

      var charPool = '';
      if (meta.doms && meta.doms.length) {
        charPool += '\n【调教者信息】\n' + meta.doms.map(function(d) { return typeof window.formatCharContext === 'function' ? window.formatCharContext(d) : ''; }).filter(Boolean).join('\n---\n');
      }
      if (meta.subs && meta.subs.length) {
        charPool += '\n【被调教者信息】\n' + meta.subs.map(function(s) { return typeof window.formatCharContext === 'function' ? window.formatCharContext(s) : ''; }).filter(Boolean).join('\n---\n');
      }
      var tags = (meta.genreTags || meta.tags || []).join('、');
      var premise = meta.premise || '';

      // 构建模板变量
      var vars = {
        title: novelCurrentTitle, tags: tags, premise: premise,
        allChaptersOverview: allOverview,
        chapterTitle: ch.title || '第' + ch.index + '章',
        summary: ch.content || '', playTags: ch.playTags || '',
        eroticaLevel: ch.eroticaLevel || '中度',
        characters: chapterOverview.match(/出场角色：[^\n]+/)?.[0]?.replace('出场角色：', '') || '',
        setting: ch.setting || '',
        wordTarget: String(ch.highlight ? 8000 : (ch.wordTarget || 4000)),
        link: ch.link || '',
        previousSummary: targetIdx > 0 ? (小说写作章集[targetIdx - 1].content || '无') : '这是第一章，从头开始',
        previousChapterContent: prevSnippet ? '\n```\n' + prevSnippet + '\n```' : '无上一章内容',
        eroticaGuidance: ch.eroticaLevel ? '本章情色强度：' + ch.eroticaLevel + '。' : '',
        characterGuidance: charPool ? '全局角色信息：' + charPool : '',
      };
      var rendered = renderPrompt('novel_chapter', vars);

      if (statusEl) statusEl.textContent = 'AI 生成中...';
      editor.innerHTML = '';
      editor.setAttribute('data-placeholder', '生成中...');

      // 单次 LLM 调用
      LLM.call({ prompt: rendered.user || '', system: rendered.system || '你是一个情色小说作家。直接输出章节正文。', label: '章节生成: ' + (ch.title || '第' + ch.index + '章'), temperature: 0.8 }).then(function(result) {
        ch.aiContent = result;
        ch._written = true;
        ch._wordCount = wordCount(result);
        Store.novel.saveChapter(novelCurrentTitle, 'ch' + (targetIdx + 1) + '.txt', result);
        renderChapterList();
      }).catch(function(err) {
        ch._genError = err.message || '生成失败';
        renderChapterList();
      });
    });
  });
}

// ===== 原有功能，增强 =====

function 小说loadWritingChapters() {
  debugLog('novel', 'loadWritingChapters called', 'novelCurrentTitle=' + novelCurrentTitle);
  var itemsEl = document.getElementById('writingChapterItems');
  if (!itemsEl) { debugLog('novel', 'loadWritingChapters ERROR', 'itemsEl null'); return; }

  itemsEl.innerHTML = '<div class="text-muted text-sm p-8">加载中...</div>';

  // 优先使用内存中的 _outlineChapters（如果属于当前作品）
  if (typeof _outlineChapters !== 'undefined' && _outlineChapters.length && _outlineTitle === novelCurrentTitle) {
    debugLog('novel', 'loadWritingChapters', 'using cached _outlineChapters, count=' + _outlineChapters.length);
    小说写作章集 = _outlineChapters;
    renderChapterList();
    loadChapterContent();
    renderContextPanel();
    renderStreakBar();
    return;
  }

  var title = novelCurrentTitle;
  debugLog('novel', 'loadWritingChapters', 'checking title=' + title);
  if (!title) { debugLog('novel', 'loadWritingChapters ERROR', 'title is empty!'); itemsEl.innerHTML = '<div class="text-muted text-sm p-8">请先选择作品</div>'; return; }

  debugLog('novel', 'loadWritingChapters', 'calling Store.novel.get(' + title + ')');

  console.log('[Writing] Store.novel.get(', title, ')');
  Store.novel.get(title).then(function(data) {
    console.log('[Writing] Store.novel.get returned', data ? Object.keys(data) : 'null');

    if (data && data.outline && data.outline.length) {
      console.log('[Writing] outline has', data.outline.length, 'chapters');
      _outlineChapters = data.outline;
      _outlineTitle = novelCurrentTitle;
      _outlineChapters.forEach(function(ch, i) {
        if (ch.index === undefined) ch.index = i + 1;
        if (ch.characters && typeof ch.characters === 'string') ch.characters = ch.characters.split(/[、,，\s]+/).filter(Boolean);
        if (!ch.characters || !Array.isArray(ch.characters)) ch.characters = [];
      });
      小说写作章集 = _outlineChapters;
    } else {
      console.log('[Writing] no outline data in Store', data ? '(data.outline missing/null)' : '(data null)');
      // 如果 Store 中没有数据，尝试从内存恢复
      if (typeof _outlineChapters !== 'undefined' && _outlineChapters.length) {
        console.log('[Writing] falling back to memory _outlineChapters');
        小说写作章集 = _outlineChapters;
        // 确保数据也被保存到 Store
        _outlineTitle = novelCurrentTitle;
        Store.novel.get(novelCurrentTitle).then(function(m) {
          m = m || {};
          m.outline = _outlineChapters;
          Store.novel.save(novelCurrentTitle, m);
          console.log('[Writing] saved _outlineChapters to Store');
        });
      } else {
        小说写作章集 = [];
      }
    }
    if (小说写作章集.length === 0) {
      itemsEl.innerHTML = '<div class="text-muted text-sm p-8">暂无大纲数据</div>';
      return;
    }
    renderChapterList();
    loadChapterContent();
    renderContextPanel();
    renderStreakBar();
  }).catch(function(err) {
    console.error('[Writing] Store.novel.get error:', err);
    itemsEl.innerHTML = '<div class="text-muted text-sm" style="padding:8px;color:var(--error)">加载失败: ' + err.message + '</div>';
  });
}

function renderChapterList() {
  var itemsEl = document.getElementById('writingChapterItems');
  if (!itemsEl) return;

  小说写作章集.forEach(function(ch, i) {
    ch.index = i + 1;
  });

  var h = '';
  小说写作章集.forEach(function(ch, i) {
    var isActive = i === 小说写作当前章;
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
      小说写作当前章 = parseInt(this.getAttribute('data-ch'));
      renderChapterList();
      loadChapterContent();
      renderContextPanel();
    });
  });
}

function renderContextPanel() {
  var el = document.getElementById('writingCtxContent');
  if (!el) return;
  var ch = 小说写作章集[小说写作当前章];
  if (!ch) { el.innerHTML = '<div class="text-muted text-sm">选择章节查看信息</div>'; return; }

  var h = '';

  if (ch.playTags) {
    h += '<div class="text-muted text-sm mt-8">玩法</div>';
    h += '<div class="flex gap-4 flex-wrap mt-4">';
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
    h += '<div class="text-muted text-sm mt-8">出场角色</div>';
    h += '<div class="flex gap-4 flex-wrap mt-4">';
    var chars = Array.isArray(ch.characters) ? ch.characters : (typeof ch.characters === 'string' ? ch.characters.split(/[、,，\s]+/).filter(Boolean) : []);
    chars.forEach(function(c) {
      h += '<span style="font-size:10px;background:var(--accent-dim);color:var(--accent2);padding:2px 8px;border-radius:10px">' + escHtml(c.trim()) + '</span>';
    });
    h += '</div>';
  }
  if (ch.setting) {
    h += '<div class="text-muted text-sm mt-8">场景</div>';
    h += '<div class="fs-11 mt-2">' + escHtml(ch.setting) + '</div>';
  }
  if (ch.link) {
    h += '<div class="text-muted text-sm mt-8">衔接</div>';
    h += '<div class="fs-11 c-fg2 mt-2">' + escHtml(ch.link) + '</div>';
  }
  if (ch.content) {
    h += '<div class="text-muted text-sm mt-8">内容概要</div>';
    h += '<div style="font-size:11px;color:var(--fg2);margin-top:2px;line-height:1.5">' + escHtml(ch.content) + '</div>';
  }
  // Quick actions
  h += '<div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border)">';
  h += '  <button class="btn-sm" id="ctxGenBtn" style="background:var(--accent);color:#fff;width:100%;font-size:12px">🤖 根据大纲生成本章</button>';
  h += '</div>';

  el.innerHTML = h;
  var genBtn = document.getElementById('ctxGenBtn');
  if (genBtn) genBtn.addEventListener('click', 小说AI生成章节);
}

function loadChapterContent() {
  var ch = 小说写作章集[小说写作当前章];
  if (!ch) return;
  var titleEl = document.getElementById('writingChapterTitle');
  if (titleEl) titleEl.textContent = ch.title || '第' + (小说写作当前章 + 1) + '章';

  var editor = document.getElementById('writingEditor');
  if (!editor) return;

  var chName = 'ch' + (小说写作当前章 + 1) + '.txt';

  Store.novel.getChapter(novelCurrentTitle, chName).then(function(content) {
    if (content) {
      // 调试：查看实际的引号字符（扫描全文）
      var quoteChars = [];
      var quoteTypes = {};
      for (var ci = 0; ci < content.length; ci++) {
        var code = content.charCodeAt(ci);
        if (code === 34 || code === 0x201C || code === 0x201D || code === 0x300C || code === 0x300D || code === 0x2018 || code === 0x2019 || code === 0xFF02) {
          var charName = String.fromCharCode(code);
          if (!quoteTypes[charName]) quoteTypes[charName] = { char: charName, code: '0x' + code.toString(16), count: 0, first: -1 };
          quoteTypes[charName].count++;
          if (quoteTypes[charName].first < 0) quoteTypes[charName].first = ci;
        }
      }
      console.log('[Writing] quote types found:', JSON.stringify(quoteTypes));
      // 显示前10个非空格字符的编码
      var sampleChars = [];
      for (var si = 0; si < Math.min(content.length, 200); si++) {
        var sc = content[si];
        if (sc.trim()) sampleChars.push(sc + '(0x' + content.charCodeAt(si).toString(16) + ')');
      }
      console.log('[Writing] first 200 non-space chars:', sampleChars.slice(0, 30).join(' '));
      var html = formatForDisplay(content);
      console.log('[Writing] formatForDisplay result length:', html.length, 'has green:', html.indexOf('color:#4ecca3') >= 0);
      editor.innerHTML = html;
      ch._written = true;
      ch._wordCount = wordCount(formatForStorage(content));
    } else if (ch.aiContent) {
      editor.innerHTML = formatForDisplay(ch.aiContent);
      ch._wordCount = wordCount(ch.aiContent);
    } else {
      editor.innerHTML = '';
      ch._wordCount = 0;
    }
    updateWritingStatus();
    // 记录热力图
    recordWritingStreak();
  });
}

function updateWritingStatus() {
  var wcEl = document.getElementById('writingWordCount');
  if (!wcEl) return;
  var ch = 小说写作章集[小说写作当前章];
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

// ===== AI 生成（分层传入：全脉络 + 上一章正文 + 当前章完整大纲） =====
function 小说AI生成章节() {
  var editor = document.getElementById('writingEditor');
  var ch = 小说写作章集[小说写作当前章];
  if (!editor || !ch) return;
  if (!novelCurrentTitle) { toast('请先选择作品'); return; }

  if (editor.innerText.trim()) {
    confirmDialog('本章已有内容，是否覆盖？', function() {
      doAiGenerateChapterMultiVersion();
    });
    return;
  }
  doAiGenerateChapterMultiVersion();
}

// ===== 批量生成未写章节 =====
function 小说批量生成未写() {
  var unwritten = [];
  小说写作章集.forEach(function(ch, i) {
    if (!ch._written && !ch.aiContent) unwritten.push(i);
  });
  if (!unwritten.length) { toast('所有章节均已写作'); return; }
  var idx = 0;
  var errors = [];
  var TIMEOUT_MS = 120000;

  function genNext() {
    if (idx >= unwritten.length) {
      var msg = '批量生成完成';
      if (errors.length) msg += '，' + errors.length + ' 章失败';
      toast(msg);
      return;
    }
    var i = unwritten[idx];
    小说写作当前章 = i;
    renderChapterList();
    loadChapterContent();
    renderContextPanel();

    // 批量时用单版本快速生成
    doAiGenerateChapterSingle();

    var timedOut = false;
    var timeoutId = setTimeout(function() {
      timedOut = true;
      errors.push('第' + (i + 1) + '章超时');
      clearInterval(checkInterval);
      idx++;
      setTimeout(genNext, 500);
    }, TIMEOUT_MS);

    var checkInterval = setInterval(function() {
      var ch = 小说写作章集[i];
      if (timedOut) return;
      if (ch._written || ch.aiContent || ch._genError) {
        clearInterval(checkInterval);
        clearTimeout(timeoutId);
        if (ch._genError) errors.push('第' + (i + 1) + '章: ' + (ch._genError || '失败'));
        idx++;
        setTimeout(genNext, 500);
      }
    }, 1000);
  }
  genNext();
}

// 单版本快速生成（用于批量）
function doAiGenerateChapterSingle() {
  var editor = document.getElementById('writingEditor');
  var targetIdx = 小说写作当前章;
  var ch = 小说写作章集[targetIdx];
  var statusEl = document.getElementById('writingSaveStatusHeader');
  var taskId = 'batch_gen_' + Date.now();

  Store.novel.get(novelCurrentTitle).then(function(meta) {
    meta = meta || {};

    // 只包含相邻章节的概要（前一章和后一章），避免长篇小说分散注意力
    var adjacentOverview = [];
    var curIdx = targetIdx;
    if (curIdx > 0) {
      var prev = 小说写作章集[curIdx - 1];
      adjacentOverview.push('【前一章】第' + curIdx + '章《' + (prev.title || '') + '》' + (prev.content ? '：' + prev.content : ''));
    }
    adjacentOverview.push('【当前章】第' + (curIdx + 1) + '章《' + (ch.title || '') + '》' + (ch.content ? '：' + ch.content : ''));
    if (curIdx < 小说写作章集.length - 1) {
      var next = 小说写作章集[curIdx + 1];
      adjacentOverview.push('【后一章】第' + (curIdx + 2) + '章《' + (next.title || '') + '》' + (next.content ? '：' + next.content : ''));
    }
    var allOverview = adjacentOverview.join('\n');
    var prevFileName = 'ch' + (targetIdx) + '.txt';
    var prevContentPromise = targetIdx > 0
      ? Store.novel.getChapter(novelCurrentTitle, prevFileName)
      : Promise.resolve('');

    prevContentPromise.then(function(prevText) {
      var prevSnippet = prevText ? prevText.slice(-500) : '';
      var chapterOverview = '第' + ch.index + '章《' + (ch.title || '') + '》';
      if (ch.playTags) chapterOverview += '\n玩法：' + ch.playTags;
      if (ch.eroticaLevel) chapterOverview += '\n情色强度：' + ch.eroticaLevel;
      if (ch.characters && ch.characters.length) {
        var chars = Array.isArray(ch.characters) ? ch.characters : (typeof ch.characters === 'string' ? ch.characters.split(/[、,，\s]+/).filter(Boolean) : []);
        chapterOverview += '\n出场角色：' + chars.join('、');
      }
      if (ch.setting) chapterOverview += '\n场景：' + ch.setting;
      if (ch.link) chapterOverview += '\n衔接：' + ch.link;
      if (ch.content) chapterOverview += '\n概要：' + ch.content;
      chapterOverview += '\n目标字数：' + (ch.highlight ? 8000 : (ch.wordTarget || 4000));

      var charPool = '';
      if (meta.doms && meta.doms.length) {
        charPool += '\n【调教者信息】\n' + meta.doms.map(function(d) { return typeof window.formatCharContext === 'function' ? window.formatCharContext(d) : ''; }).filter(Boolean).join('\n---\n');
      }
      if (meta.subs && meta.subs.length) {
        charPool += '\n【被调教者信息】\n' + meta.subs.map(function(s) { return typeof window.formatCharContext === 'function' ? window.formatCharContext(s) : ''; }).filter(Boolean).join('\n---\n');
      }
      var tags = (meta.genreTags || meta.tags || []).join('、');
      var premise = meta.premise || '';

      var vars = {
        title: novelCurrentTitle, tags: tags, premise: premise,
        allChaptersOverview: allOverview,
        chapterTitle: ch.title || '第' + ch.index + '章',
        summary: ch.content || '', playTags: ch.playTags || '',
        eroticaLevel: ch.eroticaLevel || '中度',
        characters: chapterOverview.match(/出场角色：[^\n]+/)?.[0]?.replace('出场角色：', '') || '',
        setting: ch.setting || '',
        wordTarget: String(ch.highlight ? 8000 : (ch.wordTarget || 4000)),
        link: ch.link || '',
        previousSummary: targetIdx > 0 ? (小说写作章集[targetIdx - 1].content || '无') : '这是第一章，从头开始',
        previousChapterContent: prevSnippet ? '\n```\n' + prevSnippet + '\n```' : '无上一章内容',
        eroticaGuidance: ch.eroticaLevel ? '本章情色强度：' + ch.eroticaLevel + '。' : '',
        characterGuidance: charPool ? '全局角色信息：' + charPool : '',
      };
      var rendered = renderPrompt('novel_chapter', vars);

      if (statusEl) statusEl.textContent = 'AI 生成中...';
      if (editor) { editor.innerHTML = ''; editor.setAttribute('data-placeholder', '生成中...'); }

      LLM.call({
        prompt: rendered.user || '',
        system: rendered.system || '你是一个情色小说作家。直接输出章节正文。',
        label: '章节生成: ' + (ch.title || '第' + ch.index + '章'),
        temperature: 0.8,
      }).then(function(result) {
        ch.aiContent = result;
        ch._written = true;
        ch._wordCount = wordCount(result);
        Store.novel.saveChapter(novelCurrentTitle, 'ch' + (targetIdx + 1) + '.txt', result);
        renderChapterList();
      }).catch(function(err) {
        ch._genError = err.message || '生成失败';
        renderChapterList();
      });
    });
  });
}

// window 导出
window.小说loadWritingChapters = 小说loadWritingChapters;
window.renderChapterList = renderChapterList;
window.renderContextPanel = renderContextPanel;
window.loadChapterContent = loadChapterContent;
window.updateWritingStatus = updateWritingStatus;
window.小说AI生成章节 = 小说AI生成章节;
window.aiGenerateChapter = window.小说AI生成章节;
window.小说批量生成未写 = 小说批量生成未写;
window.batchGenerateUnwritten = window.小说批量生成未写;
window.doAiGenerateChapterMultiVersion = doAiGenerateChapterMultiVersion;
window.doAiGenerateChapterSingle = doAiGenerateChapterSingle;
