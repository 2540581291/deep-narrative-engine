// AI 章节生成函数
// 包含：单版本生成、批量生成

// ===== 单版本生成 =====
function 短doAiGenerateChapterMultiVersion() {
  var editor = document.getElementById('writingEditor');
  var targetIdx = 短写作当前章;
  var ch = 短写作章集[targetIdx];
  var statusEl = document.getElementById('writingSaveStatusHeader');

  Store.vignette.get(vignetteCurrentTitle).then(function(meta) {
    meta = meta || {};

    // 只包含相邻章节的概要（前一章和后一章）
    var adjacentOverview = [];
    var curIdx = targetIdx;
    if (curIdx > 0) {
      var prev = 短写作章集[curIdx - 1];
      adjacentOverview.push('【前一章】第' + curIdx + '章《' + (prev.title || '') + '》' + (prev.content ? '：' + prev.content : ''));
    }
    adjacentOverview.push('【当前章】第' + (curIdx + 1) + '章《' + (ch.title || '') + '》' + (ch.content ? '：' + ch.content : ''));
    if (curIdx < 短写作章集.length - 1) {
      var nextCh = 短写作章集[curIdx + 1];
      adjacentOverview.push('【后一章】第' + (curIdx + 2) + '章《' + (nextCh.title || '') + '》' + (nextCh.content ? '：' + nextCh.content : ''));
    }
    var allOverview = adjacentOverview.join('\n');
    var prevFileName = 'ch' + (targetIdx) + '.txt';
    var prevContentPromise = targetIdx > 0
      ? Store.vignette.getChapter(vignetteCurrentTitle, prevFileName)
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
        charPool += '\n【调教者信息】\n' + meta.doms.map(function(d) { return typeof window.短formatCharContext === 'function' ? window.短formatCharContext(d) : ''; }).filter(Boolean).join('\n---\n');
      }
      if (meta.subs && meta.subs.length) {
        charPool += '\n【被调教者信息】\n' + meta.subs.map(function(s) { return typeof window.短formatCharContext === 'function' ? window.短formatCharContext(s) : ''; }).filter(Boolean).join('\n---\n');
      }
      var tags = (meta.genreTags || meta.tags || []).join('、');
      var premise = meta.premise || '';

      var baseVars = {
        title: vignetteCurrentTitle, tags: tags, premise: premise,
        allChaptersOverview: allOverview,
        chapterTitle: ch.title || '第' + ch.index + '章',
        summary: ch.content || '', playTags: ch.playTags || '',
        eroticaLevel: ch.eroticaLevel || '中度',
        characters: chapterOverview.match(/出场角色：[^\n]+/)?.[0]?.replace('出场角色：', '') || '',
        setting: ch.setting || '',
        wordTarget: String(ch.highlight ? 8000 : (ch.wordTarget || 4000)),
        link: ch.link || '',
        previousSummary: targetIdx > 0 ? (短写作章集[targetIdx - 1].content || '无') : '这是第一章，从头开始',
        previousChapterContent: prevSnippet ? '\n```\n' + prevSnippet + '\n```' : '无上一章内容',
        eroticaGuidance: ch.eroticaLevel ? '本章情色强度：' + ch.eroticaLevel + '。' : '',
        characterGuidance: charPool ? '全局角色信息：' + charPool : '',
      };
      var rendered = renderPrompt('novel_chapter', baseVars);

      if (statusEl) statusEl.textContent = 'AI 生成中...';
      editor.innerHTML = '';
      editor.setAttribute('data-placeholder', '生成中...');

      // 单次 LLM 调用
      LLM.call({ prompt: rendered.user || '', system: rendered.system || '你是一个情色小说作家。直接输出章节正文。', label: '章节生成: ' + (ch.title || '第' + ch.index + '章'), temperature: 0.8 }).then(function(result) {
        ch.aiContent = result;
        ch._written = true;
        ch._wordCount = wordCount(result);
        Store.vignette.saveChapter(vignetteCurrentTitle, 'ch' + (targetIdx + 1) + '.txt', result);
        短renderChapterList();
      }).catch(function(err) {
        ch._genError = err.message || '生成失败';
        短renderChapterList();
      });
    });
  });
}

// ===== AI 生成入口 =====
function 短章AI生成章节() {
  var editor = document.getElementById('writingEditor');
  var ch = 短写作章集[短写作当前章];
  if (!editor || !ch) return;
  if (!vignetteCurrentTitle) { toast('请先选择作品'); return; }
  if (editor.innerText.trim()) {
    confirmDialog('本章已有内容，是否覆盖？', function() {
      短doAiGenerateChapterMultiVersion();
    });
    return;
  }
  短doAiGenerateChapterMultiVersion();
}

function 短doAiGenerateChapterSingle() {
  var editor = document.getElementById('writingEditor');
  var targetIdx = 短写作当前章;
  var ch = 短写作章集[targetIdx];
  var statusEl = document.getElementById('writingSaveStatusHeader');

  Store.vignette.get(vignetteCurrentTitle).then(function(meta) {
    meta = meta || {};

    // 只包含相邻章节的概要（前一章和后一章）
    var adjacentOverview = [];
    var curIdx = targetIdx;
    if (curIdx > 0) {
      var prev = 短写作章集[curIdx - 1];
      adjacentOverview.push('【前一章】第' + curIdx + '章《' + (prev.title || '') + '》' + (prev.content ? '：' + prev.content : ''));
    }
    adjacentOverview.push('【当前章】第' + (curIdx + 1) + '章《' + (ch.title || '') + '》' + (ch.content ? '：' + ch.content : ''));
    if (curIdx < 短写作章集.length - 1) {
      var nextCh = 短写作章集[curIdx + 1];
      adjacentOverview.push('【后一章】第' + (curIdx + 2) + '章《' + (nextCh.title || '') + '》' + (nextCh.content ? '：' + nextCh.content : ''));
    }
    var allOverview = adjacentOverview.join('\n');
    var prevFileName = 'ch' + (targetIdx) + '.txt';
    var prevContentPromise = targetIdx > 0
      ? Store.vignette.getChapter(vignetteCurrentTitle, prevFileName)
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
        charPool += '\n【调教者信息】\n' + meta.doms.map(function(d) { return typeof window.短formatCharContext === 'function' ? window.短formatCharContext(d) : ''; }).filter(Boolean).join('\n---\n');
      }
      if (meta.subs && meta.subs.length) {
        charPool += '\n【被调教者信息】\n' + meta.subs.map(function(s) { return typeof window.短formatCharContext === 'function' ? window.短formatCharContext(s) : ''; }).filter(Boolean).join('\n---\n');
      }
      var tags = (meta.genreTags || meta.tags || []).join('、');
      var premise = meta.premise || '';

      var vars = {
        title: vignetteCurrentTitle, tags: tags, premise: premise, allChaptersOverview: allOverview,
        chapterTitle: ch.title || '第' + ch.index + '章', summary: ch.content || '', playTags: ch.playTags || '',
        eroticaLevel: ch.eroticaLevel || '中度',
        characters: chapterOverview.match(/出场角色：[^\n]+/)?.[0]?.replace('出场角色：', '') || '',
        setting: ch.setting || '',
        wordTarget: String(ch.highlight ? 8000 : (ch.wordTarget || 4000)),
        link: ch.link || '',
        previousSummary: targetIdx > 0 ? (短写作章集[targetIdx - 1].content || '无') : '这是第一章，从头开始',
        previousChapterContent: prevSnippet ? '\n```\n' + prevSnippet + '\n```' : '无上一章内容',
        eroticaGuidance: ch.eroticaLevel ? '本章情色强度：' + ch.eroticaLevel + '。' : '',
        characterGuidance: charPool ? '全局角色信息：' + charPool : '',
      };
      var rendered = renderPrompt('novel_chapter', vars);

      if (statusEl) statusEl.textContent = 'AI 生成中...';
      if (editor) { editor.innerHTML = ''; editor.setAttribute('data-placeholder', '生成中...'); }

      LLM.call({ prompt: rendered.user || '', system: rendered.system || '你是一个情色小说作家。直接输出章节正文。', label: '章节生成', temperature: 0.8 })
        .then(function(result) {
          ch.aiContent = result; ch._written = true; ch._wordCount = wordCount(result);
          Store.vignette.saveChapter(vignetteCurrentTitle, 'ch' + (targetIdx + 1) + '.txt', result);
          短renderChapterList();
        }).catch(function(err) {
          ch._genError = err.message || '生成失败';
          短renderChapterList();
        });
    });
  });
}

// ===== 批量生成 =====
function 短章批量生成未写() {
  var unwritten = [];
  短写作章集.forEach(function(ch, i) { if (!ch._written && !ch.aiContent) unwritten.push(i); });
  if (!unwritten.length) { toast('所有章节均已写作'); return; }
  var idx = 0;

  function genNext() {
    if (idx >= unwritten.length) { toast('批量生成完成'); return; }
    var i = unwritten[idx];
    短写作当前章 = i;
    短renderChapterList(); 短loadChapterContent(); 短renderContextPanel();
    短doAiGenerateChapterSingle();
    var checkInterval = setInterval(function() {
      var ch = 短写作章集[i];
      if (ch._written || ch.aiContent) { clearInterval(checkInterval); idx++; setTimeout(genNext, 500); }
    }, 1000);
  }
  genNext();
}

// ===== Window exports (partial) =====
window.短章批量生成未写 = 短章批量生成未写;
