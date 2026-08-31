// 学术写作台（AI 生成初稿 → 人在其上修改）
// 适配学术书籍数据模型，本地 LocalFS 存储

var acadWriting当前章 = 0;
var acadWriting章集 = [];
var acadWriting当前书 = null; // { category, data }
var _acadAutoSaveTimer = null;
var _acadRepairTimer = null;
var _acadCtxPanelOpen = true;

// AI 工坊状态
var _acadAiStudioOpen = false;
var _acadKeystrokes = 0;
var _acadKeystrokeLog = [];
var _acadLastRecordTime = Date.now();
var _acadSnapshots = [];

// 写作热力图
var _acadStreakStoreKey = '';

// ===== 存储 =====
function 学术写作保存当前章() {
  var editor = document.getElementById('acadWritingEditor');
  if (!editor || !acadWriting当前书) return;
  var ch = acadWriting章集[acadWriting当前章];
  if (!ch) return;
  var chName = 'ch' + (acadWriting当前章 + 1) + '.txt';
  var content = formatForStorage(editor.innerText);
  ch._written = !!content.trim();
  ch._wordCount = wordCount(content);

  var dir = '学术/' + acadWriting当前书.category + '/' + 存储文件名(acadWriting当前书.data) + '_chapters';
  LocalFS.saveText(dir + '/' + chName, content).then(function() {
    acadRenderChapterList();
    acadRecordWritingStreak();
    acadRenderStreakBar();
  });
}

function 存储文件名(data) {
  return (data.title || data._fileName || '未命名').replace(/\.json$/, '');
}

function 学术写作加载章节() {
  var itemsEl = document.getElementById('acadChapterItems');
  if (!acadWriting当前书) { if (itemsEl) itemsEl.innerHTML = '<div class="text-muted text-sm p-8">请先选择一部学术作品</div>'; return; }

  var data = acadWriting当前书.data;
  if (!data.chapters || !data.chapters.length) {
    if (itemsEl) itemsEl.innerHTML = '<div class="text-muted text-sm p-8">暂无大纲数据</div>';
    return;
  }

  acadWriting章集 = data.chapters.map(function(ch, i) {
    if (typeof ch === 'string') return { title: ch, summary: '', index: i + 1 };
    ch.index = i + 1;
    return ch;
  });

  acadRenderChapterList();
  学术写作加载当前章内容();
  acadRenderContextPanel();
  acadRenderStreakBar();
}

function 学术写作加载当前章内容() {
  var editor = document.getElementById('acadWritingEditor');
  if (!editor || !acadWriting当前书) return;
  var ch = acadWriting章集[acadWriting当前章];
  if (!ch) { editor.innerHTML = ''; return; }

  var chName = 'ch' + (acadWriting当前章 + 1) + '.txt';
  var dir = '学术/' + acadWriting当前书.category + '/' + 存储文件名(acadWriting当前书.data) + '_chapters';

  LocalFS.readText(dir + '/' + chName).then(function(content) {
    if (content) {
      ch._written = true;
      ch._wordCount = wordCount(content);
      editor.innerHTML = formatForDisplay(content);
    } else {
      ch._written = false;
      ch._wordCount = 0;
      editor.innerHTML = '';
    }
    acadUpdateWritingStatus();
    var titleEl = document.getElementById('acadChapterTitle');
    if (titleEl) titleEl.textContent = ch.title || '第' + (acadWriting当前章 + 1) + '章';
  }).catch(function() {
    ch._written = false;
    ch._wordCount = 0;
    editor.innerHTML = '';
    acadUpdateWritingStatus();
  });
}

// ===== 章节列表渲染 =====
function acadRenderChapterList() {
  var itemsEl = document.getElementById('acadChapterItems');
  if (!itemsEl) return;

  acadWriting章集.forEach(function(ch, i) { ch.index = i + 1; });

  var h = '';
  acadWriting章集.forEach(function(ch, i) {
    var isActive = i === acadWriting当前章;
    var hasContent = !!(ch._written);
    var wc = ch._wordCount || 0;
    var target = ch.wordTarget || 4000;
    var pct = target > 0 ? Math.min(100, Math.round(wc / target * 100)) : 0;
    var statusIcon = hasContent ? (pct >= 80 ? '✓' : '⚡') : '○';
    var statusColor = hasContent ? (pct >= 80 ? '#4ecca3' : '#e9c46a') : '#667';
    var hcStyle = ch.highlight ? 'border-color:#e9c46a;' : '';
    var label = ch.title || '第' + (i + 1) + '章';

    h += '<div class="n-card" style="padding:8px;margin-bottom:4px;cursor:pointer;background:#111128;border:1px solid #1e1e3a;border-radius:6px;' + (isActive ? 'border-color:#4ecca3;' : '') + hcStyle + '" data-ch="' + i + '">';
    h += '  <div style="display:flex;justify-content:space-between;align-items:center">';
    h += '    <span style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;color:#e0e0e0"><span style="color:#4ecca3;margin-right:4px">' + (i + 1) + '.</span>' + escHtml(label) + '</span>';
    h += '    <span style="font-size:11px;color:' + statusColor + ';flex-shrink:0;margin-left:4px">' + statusIcon + '</span>';
    h += '  </div>';
    if (ch.summary) {
      h += '  <div style="font-size:10px;color:#667;margin-top:3px;line-height:1.5;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">' + escHtml(ch.summary) + '</div>';
    }
    if (hasContent) {
      var pctColor = pct >= 80 ? '#4ecca3' : pct >= 40 ? '#e9c46a' : '#667';
      h += '  <div style="margin-top:4px;height:3px;background:#1a1a3a;border-radius:2px;overflow:hidden">';
      h += '    <div style="height:100%;width:' + pct + '%;background:' + pctColor + ';border-radius:2px;transition:width 0.2s"></div></div>';
      h += '  <div style="font-size:10px;color:#667;margin-top:2px;display:flex;justify-content:space-between"><span>' + wc + '/' + target + '</span><span>' + pct + '%</span></div>';
    } else {
      h += '  <div style="font-size:10px;color:#667;margin-top:2px">目标 ' + target + ' 字</div>';
    }
    if (ch.highlight) h += '  <div style="font-size:9px;color:#e9c46a;margin-top:2px">★ 重点章节</div>';
    h += '</div>';
  });
  itemsEl.innerHTML = h;

  itemsEl.querySelectorAll('[data-ch]').forEach(function(item) {
    item.addEventListener('click', function() {
      acadWriting当前章 = parseInt(this.getAttribute('data-ch'));
      acadRenderChapterList();
      学术写作加载当前章内容();
      acadRenderContextPanel();
    });
  });
}

// ===== 右侧上下文面板 =====
function acadRenderContextPanel() {
  var el = document.getElementById('acadCtxContent');
  if (!el) return;
  var ch = acadWriting章集[acadWriting当前章];
  if (!ch) { el.innerHTML = '<div style="font-size:11px;color:#667">选择章节查看信息</div>'; return; }

  var data = acadWriting当前书 ? acadWriting当前书.data : {};
  var h = '';
  h += '<div style="margin-bottom:8px"><div style="font-size:11px;color:#4ecca3;font-weight:600">' + escHtml(ch.title || '未命名') + '</div></div>';

  if (ch.summary) {
    h += '<div style="margin-bottom:8px;padding:6px;background:#0a0a1a;border:1px solid #1e1e3a;border-radius:4px;font-size:11px;color:#8899aa;line-height:1.5">📝 ' + escHtml(ch.summary) + '</div>';
  }

  h += '<div style="font-size:11px;color:#e0e0e0;line-height:1.6">';
  if (ch.playTags) h += '<div style="margin-bottom:4px"><span style="color:#667">玩法：</span><span style="color:#aab">' + escHtml(ch.playTags) + '</span></div>';
  if (ch.link) h += '<div style="margin-bottom:4px"><span style="color:#667">衔接：</span><span style="color:#aab">' + escHtml(ch.link) + '</span></div>';
  if (ch.setting) h += '<div style="margin-bottom:4px"><span style="color:#667">场景：</span><span style="color:#aab">' + escHtml(ch.setting) + '</span></div>';
  if (ch.eroticaLevel) h += '<div style="margin-bottom:4px"><span style="color:#667">强度：</span><span style="color:#aab">' + escHtml(ch.eroticaLevel) + '</span></div>';
  if (ch.characters && ch.characters.length) h += '<div style="margin-bottom:4px"><span style="color:#667">角色：</span><span style="color:#aab">' + ch.characters.join(', ') + '</span></div>';
  if (ch.wordTarget) h += '<div style="margin-bottom:4px"><span style="color:#667">目标：</span><span style="color:#aab">' + ch.wordTarget + ' 字</span></div>';
  h += '</div>';

  if (ch.content) {
    h += '<div style="margin-top:8px;padding:8px;background:#0a0a1a;border:1px solid #1e1e3a;border-radius:4px;font-size:11px;color:#8899aa;line-height:1.5;max-height:120px;overflow-y:auto">' + escHtml(ch.content) + '</div>';
  }

  el.innerHTML = h;

  // 如果当前章节无内容但有概要，在底部显示生成按钮
  if (ch && !ch._written && ch.summary) {
    el.innerHTML += '<div style="margin-top:10px"><span class="btn-sm" onclick="acadGenerateDraft(' + acadWriting当前章 + ')" style="display:inline-flex;align-items:center;gap:4px;padding:5px 14px;border-radius:4px;background:#2a4a3a;color:#4ecca3;font-size:11px;border:none;cursor:pointer;font-weight:600">🤖 根据概要生成初稿</span></div>';
  }
}

// ===== 状态栏更新 =====
function acadUpdateWritingStatus() {
  var editor = document.getElementById('acadWritingEditor');
  if (!editor) return;
  var text = editor.innerText || '';
  var wc = wordCount(text);
  var wcEl = document.getElementById('acadWordCount');
  if (wcEl) wcEl.textContent = '📝 ' + wc + ' 字';
}

function acadUpdateSparkline() {
  var now = Date.now();
  if (now - _acadLastRecordTime < 2000) return;
  _acadLastRecordTime = now;
  var editor = document.getElementById('acadWritingEditor');
  if (!editor) return;
  _acadKeystrokeLog.push(wordCount(editor.innerText));
  if (_acadKeystrokeLog.length > 20) _acadKeystrokeLog.shift();
  acadRenderSparkline();
}

function acadRenderSparkline() {
  var el = document.getElementById('acadSparkline');
  if (!el || !_acadKeystrokeLog.length) return;
  var max = Math.max.apply(null, _acadKeystrokeLog) || 1;
  el.innerHTML = _acadKeystrokeLog.map(function(v) {
    var h = Math.max(2, Math.round(v / max * 14));
    return '<div style="width:4px;height:' + h + 'px;background:#4ecca3;border-radius:1px;opacity:0.6"></div>';
  }).join('');
}

function acadUpdateKeystrokeDisplay() {
  var el = document.getElementById('acadKeystrokeCount');
  if (el) el.textContent = '⌨ ' + _acadKeystrokes + '键';
}

// ===== 热力图 =====
function acadLoadStreakFromStorage() {
  try { return JSON.parse(localStorage.getItem(_acadStreakStoreKey) || '{}'); } catch(e) { return {}; }
}

function acadRecordWritingStreak() {
  try {
    var data = acadLoadStreakFromStorage();
    var today = new Date().toISOString().slice(0, 10);
    var editor = document.getElementById('acadWritingEditor');
    var wc = editor ? wordCount(editor.innerText) : 0;
    if (wc > 0) {
      data[today] = (data[today] || 0) + 1;
      localStorage.setItem(_acadStreakStoreKey, JSON.stringify(data));
    }
  } catch(e) {}
}

function acadRenderStreakBar() {
  var el = document.getElementById('acadStreakBar');
  if (!el) return;
  var data = acadLoadStreakFromStorage();
  var days = [];
  var today = new Date();
  for (var i = 6; i >= 0; i--) {
    var d = new Date(today);
    d.setDate(d.getDate() - i);
    var key = d.toISOString().slice(0, 10);
    var isToday = i === 0;
    var hasData = data[key];
    days.push({ key: key, hasData: !!hasData, isToday: isToday });
  }
  el.innerHTML = '<div style="font-size:9px;color:#667;margin-bottom:3px">📅 本周写作</div><div style="display:flex;gap:3px">' +
    days.map(function(d) {
      var bg = d.hasData ? '#4ecca3' : (d.isToday ? '#2a2a4a' : '#1a1a3a');
      return '<div style="width:18px;height:18px;border-radius:3px;background:' + bg + ';border:1px solid #2a2a4a" title="' + d.key + (d.hasData ? ' ✓' : '') + '"></div>';
    }).join('') + '</div>';
}

// ===== 快照 =====
function 学术手动快照() {
  var editor = document.getElementById('acadWritingEditor');
  if (!editor || !editor.innerText.trim()) { toast('编辑区为空，无需快照'); return; }
  var ch = acadWriting章集[acadWriting当前章];
  var label = '第' + (acadWriting当前章 + 1) + '章 ' + (ch ? ch.title || '' : '');
  _acadSnapshots.push({ time: Date.now(), label: label, content: editor.innerText });
  var countEl = document.getElementById('acadSnapshotCount');
  if (countEl) countEl.textContent = '📸 ' + _acadSnapshots.length;
  toast('📸 快照已保存：' + label);
}

// ===== AI 操作 =====
function acadGenerateDraft(chIdx) {
  var ch = acadWriting章集[chIdx];
  if (!ch) { toast('章节数据不存在'); return; }
  if (!ch.summary) { toast('该章节没有概要描述，无法生成'); return; }

  var data = acadWriting当前书 ? acadWriting当前书.data : {};
  var bookTitle = data.title || '未命名';
  var prevCh = chIdx > 0 ? acadWriting章集[chIdx - 1] : null;

  var ctx = '【作品】' + bookTitle + '\n';
  ctx += '【当前章节】第' + (chIdx + 1) + '章：' + (ch.title || '') + '\n';
  ctx += '【章节概要】' + ch.summary + '\n';
  if (prevCh) {
    ctx += '【前一章标题】' + prevCh.title + '\n';
    if (prevCh.summary) ctx += '【前一章概要】' + prevCh.summary + '\n';
  }
  if (ch.characters && ch.characters.length) ctx += '【出场角色】' + ch.characters.join('、') + '\n';
  if (ch.setting) ctx += '【场景】' + ch.setting + '\n';
  if (ch.playTags) ctx += '【玩法】' + ch.playTags + '\n';

  var authorName = data.author || data.refAuthor || '';

  // 检查作者列表是否已加载，未加载则先加载
  function 尝试附加作者信息并生成() {
    acadWriting当前章 = chIdx;
    if (authorName && typeof window.按名称获取作家 === 'function') {
      var author = window.按名称获取作家(authorName);
      if (author) {
        ctx += '【引用作家】' + authorName + '\n\n';
        ctx += '【引用作家完整数据】\n';
        var copy = {};
        Object.keys(author).forEach(function(k) { if (k !== '_fileName') copy[k] = author[k]; });
        ctx += JSON.stringify(copy, null, 2) + '\n';
      }
    }
    执行生成(ctx);
  }

  if (authorName && typeof window.获取作家列表 === 'function') {
    var 已有作者 = window.获取作家列表();
    if (!已有作者.length && typeof window.加载作家列表 === 'function') {
      window.加载作家列表().then(function() {
        尝试附加作者信息并生成();
      });
      return;
    }
  }

  尝试附加作者信息并生成();
}

function 执行生成(ctx) {
  var ch = acadWriting章集[acadWriting当前章];
  var sysPrompt = '你是一位情色文学作家。根据给定的章节概要、作品背景和设定，为该章节撰写完整的正文内容。要求：1. 以章节概要为核心展开，不要偏离主题；2. 保持情色描写的文学性和可读性，注意语言质感；3. 如果指定了场景和角色，必须包含它们；4. 文字长度约2000-4000字；5. 直接输出正文，不要添加说明。';

  toast('🤖 正在生成第' + (acadWriting当前章 + 1) + '章初稿...');
  LLM.call({ prompt: ctx, system: sysPrompt, label: '写作台·生成初稿', temperature: 0.85 }).then(function(result) {
    if (!result) { toast('生成失败，请重试'); return; }
    var editor = document.getElementById('acadWritingEditor');
    if (editor) {
      editor.innerHTML = formatForDisplay(result);
      acadUpdateWritingStatus();
      学术写作保存当前章();
    }
    var titleEl = document.getElementById('acadChapterTitle');
    if (titleEl) titleEl.textContent = ch ? (ch.title || '第' + (acadWriting当前章 + 1) + '章') : '';
    acadRenderContextPanel();
    toast('✅ 已生成第' + (acadWriting当前章 + 1) + '章初稿');
  }).catch(function(err) {
    toast('❌ 生成失败: ' + err.message);
  });
}

function acadDoRewrite() {
  var editor = document.getElementById('acadWritingEditor');
  var sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && !sel.isCollapsed && editor && editor.contains(sel.anchorNode)) {
    window._acadWriteSel = { text: sel.toString(), range: sel.getRangeAt(0).cloneRange() };
    openAiGenPanel('acad_write_rewrite');
  } else {
    toast('请先在正文中选中要处理的文字');
  }
}

function acadDoExpand() {
  var editor = document.getElementById('acadWritingEditor');
  var sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && !sel.isCollapsed && editor && editor.contains(sel.anchorNode)) {
    window._acadWriteSel = { text: sel.toString(), range: sel.getRangeAt(0).cloneRange() };
    openAiGenPanel('acad_write_expand');
  } else {
    toast('请先在正文中选中要处理的文字');
  }
}

function acadDoPolish() {
  var editor = document.getElementById('acadWritingEditor');
  var sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && !sel.isCollapsed && editor && editor.contains(sel.anchorNode)) {
    window._acadWriteSel = { text: sel.toString(), range: sel.getRangeAt(0).cloneRange() };
    openAiGenPanel('acad_write_polish');
  } else {
    toast('请先在正文中选中要处理的文字');
  }
}

// ===== AI 工坊方案系统 =====
var _acadPlanStates = { A: false, B: false, C: false, D: false };
var _acadPlanResults = { A: '', B: '', C: '', D: '' };
var _acadPlanGen章 = 0;
var _acadOriginalText = '';

var _acadPlanConfigs = {
  A: { label: '方案 A', desc: '学术严谨 · 逻辑清晰', style: '严谨', rhythm: '绵长舒缓', density: '细腻', vocab: '文雅', distance: '沉浸', depth: '多', dialogue: '平衡', mood: '严肃', emotion: '克制', pace: '舒缓铺陈', explicitness: '含蓄', temp: '审美化', sense: '心理情感' },
  B: { label: '方案 B', desc: '通俗易懂 · 生动活泼', style: '平实', rhythm: '短促有力', density: '白描', vocab: '通俗', distance: '沉浸', depth: '中', dialogue: '对话驱动', mood: '轻松', emotion: '外放', pace: '紧凑推进', explicitness: '含蓄', temp: '审美化', sense: '综合平衡' },
  C: { label: '方案 C', desc: '文学性强 · 富有感染力', style: '诗意', rhythm: '错落有致', density: '浓烈', vocab: '文雅', distance: '平衡', depth: '多', dialogue: '平衡', mood: '深情', emotion: '外放', pace: '适中', explicitness: '适中', temp: '感官化', sense: '心理情感' },
  D: { label: '方案 D', desc: '自定义方向', style: '', rhythm: '', density: '', vocab: '', distance: '', depth: '', dialogue: '', mood: '', emotion: '', pace: '', explicitness: '', temp: '', sense: '' },
};

var _acadDirCategories = [
  { key: 'explicitness', label: '露骨程度', options: ['含蓄', '适中', '露骨'] },
  { key: 'temp', label: '描写温度', options: ['审美化', '感官化', '功能化'] },
  { key: 'sense', label: '感官侧重', options: ['身体触觉', '视觉意象', '心理情感', '综合平衡'] },
  { key: 'style', label: '语言风格', options: ['诗意', '平实', '严谨'] },
  { key: 'rhythm', label: '句式节奏', options: ['短促有力', '绵长舒缓', '错落有致'] },
  { key: 'density', label: '描写密度', options: ['白描', '细腻', '浓烈'] },
  { key: 'vocab', label: '词汇层次', options: ['通俗', '文雅', '学术'] },
  { key: 'distance', label: '叙事距离', options: ['沉浸', '平衡', '旁观'] },
  { key: 'depth', label: '心理深度', options: ['少', '中', '多'] },
  { key: 'dialogue', label: '动作/对话', options: ['动作叙事', '平衡', '对话驱动'] },
  { key: 'mood', label: '情感基调', options: ['温柔缱绻', '狂放放纵', '冷静克制', '严肃学术'] },
  { key: 'emotion', label: '情绪显隐', options: ['外放', '内敛', '克制'] },
  { key: 'pace', label: '叙事速度', options: ['舒缓铺陈', '适中', '紧凑推进'] },
];

var _acadDirMaps = {
  explicitness: { '含蓄': '情色描写含蓄委婉，多用暗示和留白', '适中': '情色描写尺度适中，不过分直白也不过分含蓄', '露骨': '情色描写直接露骨，用词大胆不加修饰' },
  temp: { '审美化': '用美的眼光描写身体和性，注重比喻、意象和艺术感', '感官化': '侧重触觉、体感、温度、气味等感官细节', '功能化': '对身体动作做功能性陈述，不做修饰或比喻' },
  sense: { '身体触觉': '优先描写身体感受、触觉和肉体反应', '视觉意象': '优先描写视觉画面和场景人物的外貌', '心理情感': '优先描写内心感受、情绪变化和心理活动', '综合平衡': '身体、视觉和心理描写平衡分配' },
  style: { '诗意': '语言有文学性和韵律感，注重意象和隐喻', '平实': '语言自然流畅，像讲故事一样平实', '严谨': '语言准确严密，符合学术写作规范' },
  rhythm: { '短促有力': '多用短句和断句，节奏紧凑张力强', '绵长舒缓': '多用长句和复合句，节奏舒缓沉浸感强', '错落有致': '长短句交替，节奏变化丰富自然流畅' },
  density: { '白描': '描写简约克制，点到即止', '细腻': '描写细致入微，细节丰富但不繁冗', '浓烈': '描写铺陈饱满，感官信息密集' },
  vocab: { '通俗': '使用日常口语化词汇，平易近人', '文雅': '使用书面语和文学词汇，格调雅致', '学术': '使用学术语体和专业术语' },
  distance: { '沉浸': '叙述贴近角色内心和身体，有强烈代入感', '平衡': '叙述保持适中距离，既有代入也有观察', '旁观': '叙述保持距离，以观察者视角客观描述' },
  depth: { '少': '减少心理描写，以外部动作和对话为主', '中': '心理描写适中，内外兼顾', '多': '深入刻画内心活动和情感变化' },
  dialogue: { '动作叙事': '以动作推进为主，对话为辅', '平衡': '动作叙事和对话比重均衡', '对话驱动': '以对话推动情节为主' },
  mood: { '温柔缱绻': '情感基调温柔缠绵，充满亲昵和温情', '狂放放纵': '情感基调狂野奔放，毫无拘束', '冷静克制': '情感基调冷静克制，保持距离感', '严肃学术': '情感基调严肃正式，符合学术氛围' },
  emotion: { '外放': '情感直接外露，充分描写角色的情绪反应', '内敛': '情感含蓄内敛，以动作暗示代替直抒胸臆', '克制': '情感高度克制，以冷静克制的笔触叙述' },
  pace: { '舒缓铺陈': '叙事节奏缓慢，注重细节铺陈和氛围渲染', '适中': '叙事节奏适中，推进自然', '紧凑推进': '叙事节奏紧凑，情节推进快速' },
};

function acadRenderPlanChips() {
  ['A', 'B', 'C'].forEach(function(plan) {
    var cfg = _acadPlanConfigs[plan];
    var el = document.getElementById('acadPlan' + plan + 'Chips');
    if (!el) return;
    el.style.display = 'grid';
    el.style.gridTemplateColumns = '1fr 1fr';
    el.style.gap = '3px 8px';
    el.innerHTML = _acadDirCategories.map(function(cat) {
      var chips = cat.options.map(function(o) {
        var active = cfg[cat.key] === o;
        return '<span class="writing-plan-chip' + (active ? ' active' : '') + '" onclick="acadSetPlanChip(\'' + plan + '\',\'' + cat.key + '\',\'' + o.replace(/'/g, "\\'") + '\')">' + o + '</span>';
      }).join('');
      return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px"><span style="font-size:10px;color:#667;width:48px;flex-shrink:0">' + cat.label + '</span><span style="display:flex;gap:2px;flex-wrap:wrap">' + chips + '</span></div>';
    }).join('');
  });
}

function acadSetPlanChip(plan, field, value) {
  _acadPlanConfigs[plan][field] = value;
  acadRenderPlanChips();
}

function acadTogglePlan(plan) {
  _acadPlanStates[plan] = !_acadPlanStates[plan];
  var toggle = document.getElementById('acadToggle' + plan);
  var knob = document.getElementById('acadKnob' + plan);
  if (toggle) toggle.style.background = _acadPlanStates[plan] ? '#4ecca3' : '#1e1e3a';
  if (knob) knob.style.left = _acadPlanStates[plan] ? '16px' : '2px';
}

function acadGeneratePlans() {
  var enabledPlans = [];
  ['A', 'B', 'C', 'D'].forEach(function(plan) {
    if (_acadPlanStates[plan]) enabledPlans.push(plan);
  });
  if (!enabledPlans.length) { toast('请先启用至少一个方案'); return; }
  _acadPlanGen章 = acadWriting当前章;
  var ch = acadWriting章集[acadWriting当前章];
  if (!ch) { toast('请先选择章节'); return; }
  var editor = document.getElementById('acadWritingEditor');
  var editorText = editor ? editor.innerText : '';
  if (!editorText.trim()) { toast('编辑区为空，请先生成或输入内容'); return; }

  _acadOriginalText = editorText;
  var context = editorText;

  var genStatus = document.getElementById('acadGenStatus');
  if (genStatus) { genStatus.style.display = ''; genStatus.textContent = '🤖 生成中 0/' + enabledPlans.length; }
  var _genCompleted = 0;

  enabledPlans.forEach(function(plan) {
    var cfg = _acadPlanConfigs[plan];
    var customDir = plan === 'D' ? (document.getElementById('acadPlanDCustom') ? document.getElementById('acadPlanDCustom').value : '') : '';

    var guidance = [];
    _acadDirCategories.forEach(function(cat) {
      var val = cfg[cat.key];
      if (val && _acadDirMaps[cat.key] && _acadDirMaps[cat.key][val]) {
        guidance.push('· ' + _acadDirMaps[cat.key][val]);
      }
    });
    if (customDir) guidance.push('· ' + customDir);

    var sysPrompt = '你是一个情色写作风格重塑专家。你的核心任务是将给定的文字按指定的风格要求进行大幅度、显著可感知的风格转换。要求：1. 保持原有剧情、情节推进、人物关系和对话内容不变；2. 必须对写作风格、语言质感、句式结构和叙事方式进行大幅度的重写；3. 避免保留原文的措辞习惯和句式结构；4. 直接输出改写后的完整正文，不要添加说明。';
    var userPrompt = '【风格要求】\n' + guidance.join('\n') + '\n\n【原文内容】\n' + context + '\n\n【改写要求】\n请严格按照风格要求对原文进行大幅度重写。保留剧情走向和对话内容，但改变叙述方式、描写角度、语言节奏和词汇选择。每句话都必须重新组织语言，严禁直接复制原文中的任何完整句子。\n\n请现在输出改写后的完整版本：';

    var loadingEl = document.getElementById('acadPlan' + plan + 'Loading');
    var resultEl = document.getElementById('acadPlan' + plan + 'Result');
    var resultText = document.getElementById('acadPlan' + plan + 'ResultText');
    if (loadingEl) loadingEl.style.display = '';
    if (resultEl) resultEl.style.display = 'none';

    LLM.call({ prompt: userPrompt, system: sysPrompt, label: 'AI工坊·方案' + plan, temperature: 0.85 }).then(function(result) {
      if (loadingEl) loadingEl.style.display = 'none';
      if (resultEl) resultEl.style.display = '';
      if (resultText) resultText.textContent = result || '(无内容)';
      _acadPlanResults[plan] = result || '';
      _genCompleted++;
      if (genStatus) genStatus.textContent = '🤖 生成中 ' + _genCompleted + '/' + enabledPlans.length;
      if (_genCompleted >= enabledPlans.length && genStatus) genStatus.style.display = 'none';
    }).catch(function(err) {
      if (loadingEl) loadingEl.textContent = '❌ 生成失败: ' + err.message;
      _genCompleted++;
      if (genStatus) genStatus.textContent = '🤖 生成中 ' + _genCompleted + '/' + enabledPlans.length;
      if (_genCompleted >= enabledPlans.length && genStatus) genStatus.style.display = 'none';
    });
  });
}

function acadPlanWrite(plan) {
  var result = _acadPlanResults[plan];
  if (!result) { toast('该方案还没有生成内容'); return; }

  if (acadWriting当前章 !== _acadPlanGen章) {
    acadWriting当前章 = _acadPlanGen章;
    acadRenderChapterList();
    var ch = acadWriting章集[acadWriting当前章];
    var titleEl = document.getElementById('acadChapterTitle');
    if (titleEl) titleEl.textContent = ch ? (ch.title || '第' + (acadWriting当前章 + 1) + '章') : '';
  }

  var editor = document.getElementById('acadWritingEditor');
  if (!editor) return;
  editor.innerHTML = formatForDisplay(result);
  _acadPlanResults[plan] = '';
  var resultEl = document.getElementById('acadPlan' + plan + 'Result');
  if (resultEl) resultEl.style.display = 'none';
  acadUpdateWritingStatus();
  学术写作保存当前章();
  toast('方案 ' + plan + ' 内容已写入');
}

// ===== main 渲染 =====
function 渲染学术写作台(el) {
  if (!el) return;
  console.log('[AcadWriting] rendering');

  var aiStudioDisplay = _acadAiStudioOpen ? '' : 'display:none;';

  el.innerHTML = [
    '<div class="flex-row writing-root" style="gap:0;height:calc(100vh - 200px);align-items:stretch;border-radius:12px;border:1px solid #2a2a4a;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.4);background:#0a0a1a;color:#e0e0e0;font-family:\'Microsoft YaHei\',sans-serif;font-size:12px">',
    // ====== 左侧栏 ======
    '<div style="width:190px;flex-shrink:0;background:#111128;border-right:1px solid #1e1e3a;overflow-y:auto;display:flex;flex-direction:column" id="acadChapterList">',
    '  <div style="padding:8px" id="acadBookSelector"></div>',
    '  <div class="flex-row" style="justify-content:space-between;align-items:center;margin-bottom:6px;padding:0 8px">',
    '    <span class="text-sm text-muted">章节列表</span>',
    '  </div>',
    '  <div id="acadChapterItems" style="flex:1;overflow-y:auto;padding:0 8px"><div class="text-muted text-sm p-8">加载中...</div></div>',
    '  <div id="acadStreakBar" class="writing-streak-bar" style="padding:6px 8px;border-top:1px solid #1e1e3a"></div>',
    '</div>',
    // ====== 中央编辑区 ======
    '<div style="flex:1;display:flex;flex-direction:column;min-width:0;background:#0a0a1a">',
    '  <div class="flex-row" style="align-items:flex-start;margin-bottom:6px;gap:4px;padding:8px 12px;border-bottom:1px solid #1e1e3a">',
    '    <div style="min-width:0;overflow:hidden">',
    '      <div style="font-size:11px;color:#667;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" id="acadBookTitle">'+(acadWriting当前书?escHtml(acadWriting当前书.data.title||''):'未选择作品')+'</div>',
    '      <h3 id="acadChapterTitle" style="font-size:14px;font-weight:600;color:#fff;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></h3>',
    '    </div>',
    '    <div style="display:flex;justify-content:space-between;align-items:center;flex-shrink:0;gap:4px">',
    '    <div class="flex-row" style="gap:3px;flex-shrink:0;flex-wrap:wrap">',
    '      <button class="btn-secondary btn-sm" onclick="openAiGenPanel(\'acad_write_continue\')" style="background:#1e1e3a;color:#aab;padding:4px 10px;border:none;border-radius:4px;cursor:pointer">✏ 续写</button>',
    '      <button class="btn-secondary btn-sm" onclick="acadDoRewrite()" style="background:#1e1e3a;color:#aab;padding:4px 10px;border:none;border-radius:4px;cursor:pointer">🔄 改写</button>',
    '      <button class="btn-secondary btn-sm" onclick="acadDoExpand()" style="background:#1e1e3a;color:#aab;padding:4px 10px;border:none;border-radius:4px;cursor:pointer">📖 扩写</button>',
    '      <button class="btn-secondary btn-sm" onclick="acadDoPolish()" style="background:#1e1e3a;color:#aab;padding:4px 10px;border:none;border-radius:4px;cursor:pointer">✨ 润色</button>',
    '      </div>',
    '    <button class="btn-secondary btn-sm" onclick="acadToggleAiStudio()" id="acadAiStudioToggle" style="background:#0d3a2a;color:#4ecca3;padding:4px 10px;border:none;border-radius:4px;cursor:pointer">🎨 工坊 ▼</button>',
    '    </div>',
    '  </div>',
    // AI 工坊面板
    '<div id="acadAiStudio" style="'+aiStudioDisplay+'">',
    '  <div class="writing-ai-studio" style="background:#0d0d22;border:1px solid #2a2a4a;border-radius:8px;padding:12px 12px 6px;margin:0 12px 6px">',
    '    <div style="align-items:center;margin-bottom:8px">',
    '      <span style="font-size:10px;color:#4ecca3;font-weight:600">🎨 AI 工坊 · 风格方案</span>',
    '    </div>',
    '    <div style="font-size:10px;color:#667;margin-bottom:8px">启用方案后，点击「为已启用方案生成」按钮，AI 会同时为所有已启用的方案生成内容。</div>',
    '    <div style="margin-bottom:10px"><span class="btn-sm" onclick="acadGeneratePlans()" style="display:inline-flex;align-items:center;gap:4px;padding:5px 14px;border-radius:4px;background:#4ecca3;color:#000;font-weight:600;font-size:11px;border:none;cursor:pointer">🤖 为已启用方案生成</span></div>',
    // A
    '<div class="writing-plan" id="acadPlanA" style="background:#0a0a1a;border:1px solid #1e1e3a;border-radius:6px;padding:10px;margin-bottom:8px">',
    '  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">',
    '    <div class="writing-plan-toggle" id="acadToggleA" onclick="acadTogglePlan(\'A\')" style="position:relative;width:32px;height:18px;background:#1e1e3a;border-radius:9px;cursor:pointer;transition:background 0.2s"><div style="position:absolute;top:2px;left:2px;width:14px;height:14px;background:#fff;border-radius:50%;transition:left 0.2s" id="acadKnobA"></div></div>',
    '    <span style="font-size:11px;font-weight:600;color:#4ecca3">方案 A</span>',
    '    <span style="font-size:10px;color:#667;flex:1">学术严谨 · 逻辑清晰</span>',
    '  </div>',
    '  <div id="acadPlanAChips" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px"></div>',
    '  <div id="acadPlanALoading" style="display:none;font-size:10px;color:#4ecca3;margin-top:6px">⏳ AI 生成中...</div>',
    '  <div id="acadPlanAResult" style="display:none;margin-top:8px;padding:8px;background:#111128;border-radius:4px;border:1px solid #1e1e3a">',
    '    <div id="acadPlanAResultText" style="font-size:12px;color:#ccc;line-height:1.6;max-height:80px;overflow-y:auto"></div>',
    '    <div style="display:flex;gap:6px;margin-top:6px"><span class="writing-plan-write" onclick="acadPlanWrite(\'A\')" style="font-size:10px;padding:4px 12px;border-radius:4px;background:#4ecca3;color:#000;cursor:pointer;font-weight:600">✓ 写入</span></div>',
    '  </div>',
    '</div>',
    // B
    '<div class="writing-plan" id="acadPlanB" style="background:#0a0a1a;border:1px solid #1e1e3a;border-radius:6px;padding:10px;margin-bottom:8px">',
    '  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">',
    '    <div class="writing-plan-toggle" id="acadToggleB" onclick="acadTogglePlan(\'B\')" style="position:relative;width:32px;height:18px;background:#1e1e3a;border-radius:9px;cursor:pointer;transition:background 0.2s"><div style="position:absolute;top:2px;left:2px;width:14px;height:14px;background:#fff;border-radius:50%;transition:left 0.2s" id="acadKnobB"></div></div>',
    '    <span style="font-size:11px;font-weight:600;color:#4ecca3">方案 B</span>',
    '    <span style="font-size:10px;color:#667;flex:1">通俗易懂 · 生动活泼</span>',
    '  </div>',
    '  <div id="acadPlanBChips" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px"></div>',
    '  <div id="acadPlanBLoading" style="display:none;font-size:10px;color:#4ecca3;margin-top:6px">⏳ AI 生成中...</div>',
    '  <div id="acadPlanBResult" style="display:none;margin-top:8px;padding:8px;background:#111128;border-radius:4px;border:1px solid #1e1e3a">',
    '    <div id="acadPlanBResultText" style="font-size:12px;color:#ccc;line-height:1.6;max-height:80px;overflow-y:auto"></div>',
    '    <div style="display:flex;gap:6px;margin-top:6px"><span class="writing-plan-write" onclick="acadPlanWrite(\'B\')" style="font-size:10px;padding:4px 12px;border-radius:4px;background:#4ecca3;color:#000;cursor:pointer;font-weight:600">✓ 写入</span></div>',
    '  </div>',
    '</div>',
    // C
    '<div class="writing-plan" id="acadPlanC" style="background:#0a0a1a;border:1px solid #1e1e3a;border-radius:6px;padding:10px;margin-bottom:8px">',
    '  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">',
    '    <div class="writing-plan-toggle" id="acadToggleC" onclick="acadTogglePlan(\'C\')" style="position:relative;width:32px;height:18px;background:#1e1e3a;border-radius:9px;cursor:pointer;transition:background 0.2s"><div style="position:absolute;top:2px;left:2px;width:14px;height:14px;background:#fff;border-radius:50%;transition:left 0.2s" id="acadKnobC"></div></div>',
    '    <span style="font-size:11px;font-weight:600;color:#4ecca3">方案 C</span>',
    '    <span style="font-size:10px;color:#667;flex:1">文学性强 · 富有感染力</span>',
    '  </div>',
    '  <div id="acadPlanCChips" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px"></div>',
    '  <div id="acadPlanCLoading" style="display:none;font-size:10px;color:#4ecca3;margin-top:6px">⏳ AI 生成中...</div>',
    '  <div id="acadPlanCResult" style="display:none;margin-top:8px;padding:8px;background:#111128;border-radius:4px;border:1px solid #1e1e3a">',
    '    <div id="acadPlanCResultText" style="font-size:12px;color:#ccc;line-height:1.6;max-height:80px;overflow-y:auto"></div>',
    '    <div style="display:flex;gap:6px;margin-top:6px"><span class="writing-plan-write" onclick="acadPlanWrite(\'C\')" style="font-size:10px;padding:4px 12px;border-radius:4px;background:#4ecca3;color:#000;cursor:pointer;font-weight:600">✓ 写入</span></div>',
    '  </div>',
    '</div>',
    // D
    '<div class="writing-plan" id="acadPlanD" style="background:#0a0a1a;border:1px solid #1e1e3a;border-radius:6px;padding:10px">',
    '  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">',
    '    <div class="writing-plan-toggle" id="acadToggleD" onclick="acadTogglePlan(\'D\')" style="position:relative;width:32px;height:18px;background:#1e1e3a;border-radius:9px;cursor:pointer;transition:background 0.2s"><div style="position:absolute;top:2px;left:2px;width:14px;height:14px;background:#fff;border-radius:50%;transition:left 0.2s" id="acadKnobD"></div></div>',
    '    <span style="font-size:11px;font-weight:600;color:#4ecca3">方案 D</span>',
    '    <span style="font-size:10px;color:#667;flex:1">自定义方向</span>',
    '  </div>',
    '  <textarea id="acadPlanDCustom" style="width:100%;background:#0a0a1a;border:1px solid #2a2a4a;border-radius:4px;padding:6px 8px;color:#ccc;font-size:11px;font-family:inherit;resize:none;min-height:40px" placeholder="输入你想要的写作风格、方向、特殊要求..."></textarea>',
    '  <div id="acadPlanDLoading" style="display:none;font-size:10px;color:#4ecca3;margin-top:6px">⏳ AI 生成中...</div>',
    '  <div id="acadPlanDResult" style="display:none;margin-top:8px;padding:8px;background:#111128;border-radius:4px;border:1px solid #1e1e3a">',
    '    <div id="acadPlanDResultText" style="font-size:12px;color:#ccc;line-height:1.6;max-height:80px;overflow-y:auto"></div>',
    '    <div style="display:flex;gap:6px;margin-top:6px"><span class="writing-plan-write" onclick="acadPlanWrite(\'D\')" style="font-size:10px;padding:4px 12px;border-radius:4px;background:#4ecca3;color:#000;cursor:pointer;font-weight:600">✓ 写入</span></div>',
    '  </div>',
    '</div>',
    '  </div>',
    '</div>',
    // 编辑器
    '<div id="acadWritingEditor" contenteditable="true" class="writing-editor" style="flex:1;min-height:300px;font-family:\'Noto Serif SC\',\'Source Han Serif SC\',Georgia,serif;font-size:16px;line-height:2.2;padding:20px 28px;background:#0a0a1a;color:#d4d4d4;outline:none;border-top:1px solid #1e1e3a;overflow-y:auto;white-space:pre-wrap;word-wrap:break-word;letter-spacing:0.5px" data-placeholder="选择章节开始写作"></div>',
    // 状态栏
    '<div id="acadStatusBar" class="writing-status-bar" style="padding:4px 12px;border-top:1px solid #1e1e3a;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#667;background:#0a0a1a">',
    '  <div class="writing-status-left" style="display:flex;align-items:center;gap:12px">',
    '    <span class="writing-wc" id="acadWordCount"></span>',
    '    <span class="writing-sparkline" id="acadSparkline" style="display:flex;align-items:flex-end;gap:2px;height:16px"></span>',
    '    <span class="writing-speed" id="acadSpeed" style="color:#667">✍ 0字/分</span>',
    '  </div>',
    '  <div class="writing-status-right" style="display:flex;align-items:center;gap:8px">',
    '    <span class="writing-ai-tag" id="acadAiTag" style="font-size:9px;padding:1px 6px;border-radius:4px;background:#0d1f3a;color:#4ecca3;white-space:nowrap"></span>',
    '    <span id="acadKeystrokeCount" style="color:#667">⌨ 0键</span>',
    '    <span id="acadFocusTimer" style="color:#667">⏱ --:--</span>',
    '    <span id="acadSnapshotCount" style="color:#667">📸 0</span>',
    '    <span id="acadGenStatus" style="display:none;color:#4ecca3;font-size:10px;padding:1px 6px;border-radius:4px;background:#0d3a2a">🤖 生成中...</span>',
    '  </div>',
    '</div>',
    // 浮动提示
    '<div id="acadFloatHint" class="writing-float-hint" style="position:fixed;bottom:60px;right:290px;background:#0d3a2a;border:1px solid #4ecca3;border-radius:8px;padding:8px 12px;font-size:11px;color:#4ecca3;box-shadow:0 4px 12px rgba(78,204,163,0.2);display:none;align-items:center;gap:6px;z-index:100">💡 <span id="acadFloatHintText">选择章节开始写作</span></div>',
    '</div>',
    // ====== 右侧上下文面板 ======
    '<div id="acadCtxPanel" style="width:270px;flex-shrink:0;background:#0f0f23;border-left:1px solid #1e1e3a;padding:12px;overflow-y:auto" class="writing-right-panel">',
    '  <div class="flex-row" style="justify-content:space-between;align-items:center;margin-bottom:6px">',
    '    <span style="font-size:12px;color:#667">章节信息</span>',
    '    <button class="btn-secondary btn-sm" id="acadCtxToggle" style="font-size:10px;background:transparent;color:#667;border:none;cursor:pointer;padding:2px 6px">◀ 收起</button>',
    '  </div>',
    '  <div id="acadCtxContent" style="color:#e0e0e0"></div>',
    '</div>',
    '</div>',
  ].join('\n');

  // 事件绑定
  document.getElementById('acadCtxToggle').addEventListener('click', function() {
    var panel = document.getElementById('acadCtxPanel');
    var btn = document.getElementById('acadCtxToggle');
    if (_acadCtxPanelOpen) { panel.style.display = 'none'; btn.textContent = '▶ 展开'; }
    else { panel.style.display = ''; btn.textContent = '◀ 收起'; }
    _acadCtxPanelOpen = !_acadCtxPanelOpen;
  });

  // 作品选择器
  acadRenderBookSelector();

  // 编辑器事件
  var editor = document.getElementById('acadWritingEditor');
  if (editor) {
    editor.addEventListener('input', function() {
      if (_acadAutoSaveTimer) clearTimeout(_acadAutoSaveTimer);
      if (_acadRepairTimer) clearTimeout(_acadRepairTimer);
      acadUpdateWritingStatus();
      acadUpdateSparkline();
      _acadAutoSaveTimer = setTimeout(学术写作保存当前章, 500);
    });
    editor.addEventListener('keydown', function(e) {
      _acadKeystrokes++;
      if (_acadKeystrokes % 10 === 0) acadUpdateKeystrokeDisplay();
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); 学术写作保存当前章(); }
    });
    editor.addEventListener('paste', function() {
      setTimeout(function() {
        var ed = document.getElementById('acadWritingEditor');
        if (ed) { ed.innerHTML = formatForDisplay(extractPlainText(ed.innerHTML)); }
      }, 100);
    });
  }

  acadRenderPlanChips();
  学术写作加载章节();
}

function acadToggleAiStudio() {
  _acadAiStudioOpen = !_acadAiStudioOpen;
  var studio = document.getElementById('acadAiStudio');
  if (studio) studio.style.display = _acadAiStudioOpen ? '' : 'none';
  var btn = document.getElementById('acadAiStudioToggle');
  if (btn) btn.innerHTML = _acadAiStudioOpen ? '🎨 工坊 ▼' : '🎨 工坊 ▶';
}

// ===== 作品选择器 =====
function acadRenderBookSelector() {
  var el = document.getElementById('acadBookSelector');
  if (!el) return;

  asyncLoadAllBooks().then(function(allBooks) {
    var html = '<select id="acadBookSelect" style="width:100%;background:#0a0a1a;border:1px solid #2a2a4a;border-radius:4px;color:#e0e0e0;padding:4px 6px;font-size:11px;font-family:inherit;margin-bottom:6px">';
    html += '<option value="">— 选择作品 —</option>';
    allBooks.forEach(function(b) {
      var val = b.category + '::' + (b.data._fileName || '');
      var label = '[' + (b.data.type || b.category) + '] ' + (b.data.title || '未命名');
      var selected = acadWriting当前书 && acadWriting当前书.category === b.category && acadWriting当前书.data._fileName === b.data._fileName;
      html += '<option value="' + escHtml(val) + '"' + (selected ? ' selected' : '') + '>' + escHtml(label) + '</option>';
    });
    html += '</select>';

    var cur = acadWriting当前书;
    if (cur) {
      html += '<div style="font-size:10px;color:#4ecca3;padding:2px 0 4px;word-break:break-all">📄 ' + escHtml(cur.data.title || '') + '</div>';
    }

    el.innerHTML = html;

    document.getElementById('acadBookSelect').addEventListener('change', function() {
      var val = this.value;
      if (!val) { acadWriting当前书 = null; 学术写作加载章节(); return; }
      var parts = val.split('::');
      var category = parts[0];
      var fileName = parts[1];

      var found = null;
      for (var i = 0; i < allBooks.length; i++) {
        if (allBooks[i].category === category && allBooks[i].data._fileName === fileName) {
          found = allBooks[i].data;
          break;
        }
      }
      if (found) {
        acadWriting当前书 = { category: category, data: found };
        _acadStreakStoreKey = 'acad_streak_' + (found.title || '');
        acadLoadStreakFromStorage();
        var titleEl = document.getElementById('acadBookTitle');
        if (titleEl) titleEl.textContent = found.title || '';
        acadRenderBookSelector();
        学术写作加载章节();
      }
    });
  });
}

function asyncLoadAllBooks() {
  var categories = (typeof 学术类别键 !== 'undefined' && 学术类别键) ? 学术类别键 : ['教学习练', '学业论文', '个人笔记', '公开论坛', '专著期刊'];
  return Promise.all(categories.map(function(c) {
    return LocalFS.list('学术/' + c).then(function(entries) {
      if (!entries || !entries.length) return [];
      var jsonFiles = entries.filter(function(e) { return e.name.endsWith('.json'); });
      return Promise.all(jsonFiles.map(function(f) {
        return LocalFS.readJSON('学术/' + c + '/' + f.name).then(function(data) {
          if (data) { data._fileName = f.name; data._category = c; }
          return data;
        });
      })).then(function(items) {
        return items.filter(Boolean).map(function(data) { return { category: c, data: data }; });
      });
    });
  })).then(function(results) {
    var all = [];
    results.forEach(function(r) { all = all.concat(r); });
    return all;
  });
}

// ===== 暴露全局 =====
window.渲染学术写作台 = 渲染学术写作台;
window.acadGenerateDraft = acadGenerateDraft;
window.acadDoRewrite = acadDoRewrite;
window.acadDoExpand = acadDoExpand;
window.acadDoPolish = acadDoPolish;
window.acadToggleAiStudio = acadToggleAiStudio;
window.acadTogglePlan = acadTogglePlan;
window.acadSetPlanChip = acadSetPlanChip;
window.acadGeneratePlans = acadGeneratePlans;
window.acadPlanWrite = acadPlanWrite;
window.acadUpdateWritingStatus = acadUpdateWritingStatus;
window.学术写作保存当前章 = 学术写作保存当前章;
