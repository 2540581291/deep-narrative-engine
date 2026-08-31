// 学术春宫 · AI 字段（二元模板）+ 整书生成
// 依赖全局：学术当前类别 / 学术类别 / 类型说明 / 类别专属字段 / 年级段选项 / 学科门类 / 门类说明 / 专业类说明 / 二级学科说明 / 学术保存作品 / 学术切换子标签

window.doAI生成学术 = function() {
  var cat = 学术当前类别;                                   // 5 类大类型
  var type = document.getElementById('aiBookType').value;   // 子类型
  var typeHint = 类型说明[type] || '';
  var title = document.getElementById('aiBookTitle').value.trim();
  var authorName = document.getElementById('aiBookAuthor').value;
  var desc = document.getElementById('aiBookDesc').value.trim();
  var subjectCat = document.getElementById('aiField_category').value;
  var subject = document.getElementById('aiField_subject').value;
  var subject2 = document.getElementById('aiField_subject2').value;
  var level = document.getElementById('aiBookLevel') ? document.getElementById('aiBookLevel').value : '';

  // 学科 + 年级段 + 类别专属字段
  var extraParts = [];
  if (subject) extraParts.push('学科门类：' + subjectCat + '（' + (门类说明[subjectCat] || '') + '）' + '、一级学科：' + subject + '（' + (专业类说明[subject] || '') + '）' + (subject2 ? '、二级学科：' + subject2 + '（' + (二级学科说明[subject2] || '') + '）' : ''));
  if (level) extraParts.push('年级段：' + level);
  var cfgs = 类别专属字段[cat];
  if (cfgs && cfgs.fields) {
    cfgs.fields.forEach(function(f) {
      var el = document.getElementById('aiField_' + f.key);
      if (el) {
        var val = el.value.trim();
        if (val) extraParts.push(f.label + '：' + val);
      }
    });
  }
  var extraStr = extraParts.length ? '\n' + extraParts.join('\n') : '';

  var authorStyle = '', authorPlays = '';
  var authorFullData = '';
  if (authorName && typeof 按名称获取作家 === 'function') {
    var author = 按名称获取作家(authorName);
    if (author) {
      authorStyle = author.style || '';
      authorPlays = (author.favoritePlays || []).join('、');
      var copy = {};
      Object.keys(author).forEach(function(k) { if (k !== '_fileName') copy[k] = author[k]; });
      authorFullData = '\n\n【引用作家完整数据】\n' + JSON.stringify(copy, null, 2);
    }
  }

  var btn = document.querySelector('#bookContentView .btn-main');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ 生成中...'; }

  LLM.callJSON({
    label: 'AI生成学术',
    prompt: '请生成一本' + type + '（' + typeHint + '），JSON格式包含：title(书名) author(作者) description(简介) tags(标签数组) chapters(章节对象数组，每章含title标题和summary概述)。\n\n【引用作家】' + (authorName || '（无）') + (authorFullData || '') + '\n\n【写作要求】引用作家的数据仅用于参考其文风、叙事视角和描写质感，生成的内容必须紧扣"' + type + '"这一类型本身的要求。不要将作家的个人经历作为内容来写。\n' + (title ? '\n拟定标题：' + title : '') + (desc ? '\n内容简述：' + desc : '') + (subject ? '\n学科：' + subjectCat + ' > ' + subject + (subject2 ? ' > ' + subject2 : '') : '') + extraStr,
    temperature: 0.8,
  }).then(function(data) {
    if (!data) { toast('生成失败'); return; }
    data.category = cat;                                  // 5 类
    data.type = type;                                     // 子类型
    data.title = title || data.title || '未命名';
    data.author = authorName || data.author || '';
    data.refAuthor = authorName;
    data.subject = subject;
    data.subjectCategory = subjectCat;
    data.subjectDetail = subject2;
    data.level = level;                                   // 年级段（通用字段）
    var cfgs = 类别专属字段[cat];
    if (cfgs && cfgs.fields) {
      cfgs.fields.forEach(function(f) {
        var el = document.getElementById('aiField_' + f.key);
        if (el) data[f.key] = el.value.trim();
      });
    }
    if (!data.createdAt) data.createdAt = fmtDate(new Date());
    if (!data.tags) data.tags = [];
    if (data.chapters && typeof data.chapters === 'string') {
      try { data.chapters = JSON.parse(data.chapters); } catch(e) { data.chapters = [{ title: data.chapters, summary: '' }]; }
    }
    if (!data.chapters || !Array.isArray(data.chapters)) data.chapters = [];
    return 学术保存作品(cat, data);
  }).then(function() {
    toast('✅ 已保存');
    学术切换子标签('list');
  }).catch(function(err) {
    toast('生成失败: ' + err.message);
    if (btn) { btn.disabled = false; btn.textContent = '🎯 生成'; }
  });
};

// ===== 路由注册（兜底，主面板已注册，重复注册无害）=====
registerPageRoute('books', function() { var el = document.getElementById('booksContent'); if (el) 渲染学术页(el); });
window.渲染学术页 = 渲染学术页;
window.学术切换子标签 = 学术切换子标签;

// ===== AI 字段注册：书名标题建议 =====
if (!AI_QUICK_PRESETS.booksTitle) {
  AI_QUICK_PRESETS.booksTitle = [
    { label:'📝 规范严谨', dir:'学术规范，用词严谨，体现专业性', category:'style' },
    { label:'📝 通俗易懂', dir:'语言通俗，适合大众读者理解', category:'style' },
    { label:'📝 文学性强', dir:'有文学色彩，用词考究，有吸引力', category:'style' },
    { label:'🎯 直白露骨', dir:'标题直接点明情色主题，毫不遮掩', category:'precision' },
    { label:'🎯 含蓄隐晦', dir:'通过隐喻和暗示表达主题，留有余地', category:'precision' },
  ];
}
registerAiField('booksTitle', '春宫标题', function() {
  var infoParts = [];
  var cat = 学术当前类别;
  var 类别 = 学术类别[cat];
  if (类别) infoParts.push('类别：' + 类别.label);
  var typeEl = document.getElementById('aiBookType');
  var type = typeEl ? typeEl.value : '';
  if (type) infoParts.push('子类型：' + type + '（' + (类型说明[type] || '') + '）');
  var cat2 = document.getElementById('aiField_category');
  var sub = document.getElementById('aiField_subject');
  var sub2 = document.getElementById('aiField_subject2');
  if (cat2 && cat2.value) infoParts.push('门类：' + cat2.value + '（' + (门类说明[cat2.value] || '') + '）');
  if (sub && sub.value) infoParts.push('一级学科：' + sub.value + '（' + (专业类说明[sub.value] || '') + '）');
  if (sub2 && sub2.value) infoParts.push('二级学科：' + sub2.value + '（' + (二级学科说明[sub2.value] || '') + '）');
  var desc = document.getElementById('aiBookDesc');
  if (desc && desc.value.trim()) infoParts.push('内容简述：' + desc.value.trim());
  var lv = document.getElementById('aiBookLevel');
  if (lv && lv.value) infoParts.push('年级段：' + lv.value);
  var cfgs = 类别专属字段[cat];
  if (cfgs && cfgs.fields) {
    cfgs.fields.forEach(function(f) {
      var el = document.getElementById('aiField_' + f.key);
      if (el && el.value && el.value.trim()) infoParts.push(f.label + '：' + el.value.trim());
    });
  }

  var authorParts = [];
  var author = document.getElementById('aiBookAuthor');
  if (author && author.value) {
    authorParts.push('引用作家：' + author.value);
    if (typeof 按名称获取作家 === 'function') {
      var a = 按名称获取作家(author.value);
      if (a) {
        var copy = {};
        Object.keys(a).forEach(function(k) { if (k !== '_fileName') copy[k] = a[k]; });
        authorParts.push('作家参考数据（用于参考文风、叙事视角和描写质感，不要将作家个人经历作为内容来写）：' + JSON.stringify(copy));
      }
    }
  }

  var ctx = '【书籍信息】\n' + infoParts.join('\n');
  if (authorParts.length) ctx += '\n\n【引用作家参考】\n' + authorParts.join('\n');
  return { prompt: ctx };
}, { suggestPrompt: 'booksTitle_suggest', fillFn: function(val) {
  var el = document.getElementById('aiBookTitle');
  if (el) { el.value = val; el.dispatchEvent(new Event('input', {bubbles: true})); }
}});

// ===== 学术写作台 AI 字段（续写/改写/扩写/润色，保持原有）=====
if (typeof registerAiField !== 'undefined') {
  registerAiField('acad_write_continue', '续写', function() {
    var editor = document.getElementById('acadWritingEditor');
    var content = editor ? editor.innerText.slice(-500) : '';
    if (!content) { toast('请先输入内容'); return '请先输入内容'; }
    var r = renderPrompt('chapter_continue', { title: (acadWriting当前书 ? acadWriting当前书.data.title : '') || '', context: content });
    return { user: r.user, system: r.system };
  }, { fillFn: function(result) {
    var editor = document.getElementById('acadWritingEditor');
    if (!editor || !result) return;
    editor.innerHTML += formatForDisplay(result);
    acadUpdateWritingStatus();
    学术写作保存当前章();
    toast('续写完成');
  }, rawText: true });

  registerAiField('acad_write_rewrite', '改写', function() {
    var editor = document.getElementById('acadWritingEditor');
    var selData = window._acadWriteSel;
    var content = selData ? selData.text : (editor ? editor.innerText.trim() : '');
    if (!content) { toast('请先在正文中选中要处理的文字'); return '请先选中文字'; }
    var ch = acadWriting章集[acadWriting当前章];
    var extra = '';
    if (ch && ch.link) extra += '衔接：' + ch.link + '\n';
    var r = renderPrompt('chapter_rewrite', { context: extra + content, direction: '保持核心情节不变，优化表达' });
    return { user: r.user, system: r.system };
  }, { fillFn: function(result) {
    var editor = document.getElementById('acadWritingEditor');
    if (!editor || !result) return;
    var html = formatForDisplay(result);
    if (window._acadWriteSel && window._acadWriteSel.range) {
      var sel = window._acadWriteSel;
      try { sel.range.deleteContents(); sel.range.insertNode(sel.range.createContextualFragment(html)); editor.normalize(); } catch(e) { editor.innerHTML = html; }
      window._acadWriteSel = null;
    } else { editor.innerHTML = html; }
    acadUpdateWritingStatus();
    学术写作保存当前章();
    toast('改写完成');
  }, rawText: true });

  registerAiField('acad_write_expand', '扩写', function() {
    var editor = document.getElementById('acadWritingEditor');
    var selData = window._acadWriteSel;
    var content = selData ? selData.text : (editor ? editor.innerText.trim() : '');
    if (!content) { toast('请先在正文中选中要处理的文字'); return '请先选中文字'; }
    var wc = wordCount(content);
    var r = renderPrompt('chapter_expand', { context: content, wordCount: wc, targetCount: Math.round(wc * 1.5) });
    return { user: r.user, system: r.system };
  }, { fillFn: function(result) {
    var editor = document.getElementById('acadWritingEditor');
    if (!editor || !result) return;
    var html = formatForDisplay(result);
    if (window._acadWriteSel && window._acadWriteSel.range) {
      var sel = window._acadWriteSel;
      try { sel.range.deleteContents(); sel.range.insertNode(sel.range.createContextualFragment(html)); editor.normalize(); } catch(e) { editor.innerHTML = html; }
      window._acadWriteSel = null;
    } else { editor.innerHTML = html; }
    acadUpdateWritingStatus();
    学术写作保存当前章();
    toast('扩写完成');
  }, rawText: true });

  registerAiField('acad_write_polish', '润色', function() {
    var editor = document.getElementById('acadWritingEditor');
    var selData = window._acadWriteSel;
    var content = selData ? selData.text : (editor ? editor.innerText.trim() : '');
    if (!content) { toast('请先在正文中选中要处理的文字'); return '请先选中文字'; }
    var r = renderPrompt('chapter_polish', { context: content });
    return { user: r.user, system: r.system };
  }, { fillFn: function(result) {
    var editor = document.getElementById('acadWritingEditor');
    if (!editor || !result) return;
    var html = formatForDisplay(result);
    if (window._acadWriteSel && window._acadWriteSel.range) {
      var sel = window._acadWriteSel;
      try { sel.range.deleteContents(); sel.range.insertNode(sel.range.createContextualFragment(html)); editor.normalize(); } catch(e) { editor.innerHTML = html; }
      window._acadWriteSel = null;
    } else { editor.innerHTML = html; }
    acadUpdateWritingStatus();
    学术写作保存当前章();
    toast('润色完成');
  }, rawText: true });
}
