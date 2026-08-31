// AI 字段注册相关代码
// 提供 AI 建议弹窗字段注册功能

// 选区替换辅助函数
function novelWriteReplace(editor, htmlContent) {
  var selData = window._novelWriteSel;
  if (selData && selData.range) {
    try {
      var range = selData.range;
      range.deleteContents();
      var frag = range.createContextualFragment(htmlContent);
      range.insertNode(frag);
      editor.normalize();
    } catch(e) {
      editor.innerHTML = htmlContent;
    }
    window._novelWriteSel = null;
  } else {
    editor.innerHTML = htmlContent;
  }
}

if (typeof registerAiField !== 'undefined') {
  registerAiField('n_write_continue', '续写', function() {
    var editor = document.getElementById('writingEditor');
    var content = editor ? editor.innerText.slice(-500) : '';
    if (!content) { toast('在编辑器中输入一些内容后即可续写'); return '请先输入内容'; }
    var vars = { title: novelCurrentTitle || '', context: content };
    var r = renderPrompt('chapter_continue', vars);
    return { user: r.user, system: r.system };
  }, { fillFn: function(result) {
    var editor = document.getElementById('writingEditor');
    if (!editor || !result) return;
    editor.innerHTML += formatForDisplay(result);
    updateWritingStatus();
    小说保存当前章();
    toast('续写完成');
  }, rawText: true });

  registerAiField('n_write_rewrite', '改写', function() {
    var editor = document.getElementById('writingEditor');
    var selData = window._novelWriteSel;
    var content = selData ? selData.text : (editor ? editor.innerText.trim() : '');
    if (!content) { toast('请先在正文中选中要处理的文字'); return '请先选中要处理的文字'; }
    var ch = 小说写作章集[小说写作当前章];
    var contextExtra = '';
    if (ch && ch.link) contextExtra += '衔接：' + ch.link + '\\n';
    if (ch && ch.playTags) contextExtra += '玩法：' + ch.playTags + '\\n';
    var vars = { context: contextExtra + content, direction: '保持核心情节不变，优化表达' };
    var r = renderPrompt('chapter_rewrite', vars);
    return { user: r.user, system: r.system };
  }, { fillFn: function(result) {
    var editor = document.getElementById('writingEditor');
    if (!editor || !result) return;
    var html = formatForDisplay(result);
    if (window._novelWriteSel && window._novelWriteSel.range) {
      novelWriteReplace(editor, html);
    } else {
      editor.innerHTML = html;
    }
    updateWritingStatus();
    小说保存当前章();
    toast('改写完成');
  }, rawText: true });

  registerAiField('n_write_expand', '扩写', function() {
    var editor = document.getElementById('writingEditor');
    var selData = window._novelWriteSel;
    var content = selData ? selData.text : (editor ? editor.innerText.trim() : '');
    if (!content) { toast('请先在正文中选中要处理的文字'); return '请先选中要处理的文字'; }
    var wc = wordCount(content);
    var vars = { context: content, wordCount: wc, targetCount: Math.round(wc * 1.5) };
    var r = renderPrompt('chapter_expand', vars);
    return { user: r.user, system: r.system };
  }, { fillFn: function(result) {
    var editor = document.getElementById('writingEditor');
    if (!editor || !result) return;
    var html = formatForDisplay(result);
    if (window._novelWriteSel && window._novelWriteSel.range) {
      novelWriteReplace(editor, html);
    } else {
      editor.innerHTML = html;
    }
    updateWritingStatus();
    小说保存当前章();
    toast('扩写完成');
  }, rawText: true });

  registerAiField('n_write_polish', '润色', function() {
    var editor = document.getElementById('writingEditor');
    var selData = window._novelWriteSel;
    var content = selData ? selData.text : (editor ? editor.innerText.trim() : '');
    if (!content) { toast('请先在正文中选中要处理的文字'); return '请先选中要处理的文字'; }
    var vars = { context: content };
    var r = renderPrompt('chapter_polish', vars);
    return { user: r.user, system: r.system };
  }, { fillFn: function(result) {
    var editor = document.getElementById('writingEditor');
    if (!editor || !result) return;
    var html = formatForDisplay(result);
    if (window._novelWriteSel && window._novelWriteSel.range) {
      novelWriteReplace(editor, html);
    } else {
      editor.innerHTML = html;
    }
    updateWritingStatus();
    小说保存当前章();
    toast('润色完成');
  }, rawText: true });
}
