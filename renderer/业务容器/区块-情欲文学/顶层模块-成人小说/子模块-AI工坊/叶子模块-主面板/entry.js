// AI 工坊相关函数
// 提供芯片组渲染、风格指引、预设管理、热力图等功能

// === AI 工坊工具函数 ===

function updateKeystrokeDisplay() {
  var el = document.getElementById('writingKeystrokeCount');
  if (el) el.textContent = '⌨ ' + _writingKeystrokes + '键';
}

function updateSparkline() {
  var now = Date.now();
  if (now - _writingLastRecordTime < 2000) return;
  _writingLastRecordTime = now;
  var editor = document.getElementById('writingEditor');
  if (!editor) return;
  _writingKeystrokeLog.push(wordCount(editor.value));
  if (_writingKeystrokeLog.length > 20) _writingKeystrokeLog.shift();
  renderSparkline();
}

function renderSparkline() {
  var el = document.getElementById('writingSparkline');
  if (!el || !_writingKeystrokeLog.length) return;
  var max = Math.max.apply(null, _writingKeystrokeLog) || 1;
  el.innerHTML = _writingKeystrokeLog.map(function(v) {
    var h = Math.max(2, Math.round(v / max * 14));
    return '<div class="spark-bar" style="height:' + h + 'px"></div>';
  }).join('');
}

// 手动快照
function 小说手动快照() {
  var editor = document.getElementById('writingEditor');
  if (!editor || !editor.value.trim()) { toast('编辑区为空，无需快照'); return; }
  var ch = 小说写作章集[小说写作当前章];
  var label = '第' + (小说写作当前章 + 1) + '章 ' + (ch ? ch.title || '' : '');
  _writingSnapshots.push({ time: Date.now(), label: label, content: editor.value });
  document.getElementById('writingSnapshotCount').textContent = '📸 ' + _writingSnapshots.length;
  if (typeof toast !== 'undefined') toast('📸 快照已保存：' + label);
}

// 热力图
function loadStreakFromStorage() {
  try {
    var data = localStorage.getItem(_writingStreakStoreKey);
    return data ? JSON.parse(data) : {};
  } catch(e) { return {}; }
}

function recordWritingStreak() {
  try {
    var data = loadStreakFromStorage();
    var today = new Date().toISOString().slice(0, 10);
    var editor = document.getElementById('writingEditor');
    var wc = editor ? wordCount(editor.value) : 0;
    if (wc > 0) {
      data[today] = (data[today] || 0) + 1;
      localStorage.setItem(_writingStreakStoreKey, JSON.stringify(data));
    }
  } catch(e) {}
}

function renderStreakBar() {
  var el = document.getElementById('writingStreakBar');
  if (!el) return;
  var data = loadStreakFromStorage();
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
  el.innerHTML = '<div class="writing-streak-label">📅 本周写作</div><div class="writing-streak-days">' +
    days.map(function(d) {
      var cls = 'writing-streak-day' + (d.hasData ? ' on' : '') + (d.isToday ? ' today' : '');
      return '<div class="' + cls + '" title="' + d.key + (d.hasData ? ' ✓' : '') + '"></div>';
    }).join('') + '</div>';
}

// ===== 方案模式 =====
var _writingPlanStates = { A: false, B: false, C: false, D: false };
var _writingPlanResults = { A: '', B: '', C: '', D: '' };
var _writingPlanGeneration章 = 0;

// 方案配置
var _writingPlanConfigs = {
  A: { label: '方案 A', desc: '诗意温柔 · 心理沉浸', explicitness: '含蓄', temp: '审美化', sense: '心理情感', style: '诗意', rhythm: '绵长舒缓', density: '细腻', vocab: '文雅', distance: '沉浸', depth: '多', dialogue: '平衡', mood: '温柔缱绻', emotion: '外放', pace: '舒缓铺陈' },
  B: { label: '方案 B', desc: '直白狂放 · 感官冲击', explicitness: '露骨', temp: '感官化', sense: '身体触觉', style: '粗粝', rhythm: '短促有力', density: '浓烈', vocab: '通俗', distance: '沉浸', depth: '少', dialogue: '动作叙事', mood: '狂放放纵', emotion: '内敛', pace: '紧凑推进' },
  C: { label: '方案 C', desc: '冷峻旁观 · 视觉意象', explicitness: '含蓄', temp: '审美化', sense: '视觉意象', style: '诗意', rhythm: '错落有致', density: '白描', vocab: '文雅', distance: '旁观', depth: '中', dialogue: '对话驱动', mood: '冷峻克制', emotion: '克制', pace: '适中' },
  D: { label: '方案 D', desc: '自定义方向', explicitness: '', temp: '', sense: '', style: '', rhythm: '', density: '', vocab: '', distance: '', depth: '', dialogue: '', mood: '', emotion: '', pace: '' },
};

var _directionCategories = [
  { key: 'explicitness', label: '露骨程度', options: ['含蓄', '适中', '露骨'] },
  { key: 'temp', label: '描写温度', options: ['审美化', '感官化', '功能化'] },
  { key: 'sense', label: '感官侧重', options: ['身体触觉', '视觉意象', '心理情感', '综合平衡'] },
  { key: 'style', label: '语言风格', options: ['诗意', '平实', '粗粝'] },
  { key: 'rhythm', label: '句式节奏', options: ['短促有力', '绵长舒缓', '错落有致'] },
  { key: 'density', label: '描写密度', options: ['白描', '细腻', '浓烈'] },
  { key: 'vocab', label: '词汇层次', options: ['通俗', '文雅', '古风'] },
  { key: 'distance', label: '叙事距离', options: ['沉浸', '平衡', '旁观'] },
  { key: 'depth', label: '心理深度', options: ['少', '中', '多'] },
  { key: 'dialogue', label: '动作/对话', options: ['动作叙事', '平衡', '对话驱动'] },
  { key: 'mood', label: '情感基调', options: ['温柔缱绻', '狂放放纵', '冷峻克制', '紧张压迫'] },
  { key: 'emotion', label: '情绪显隐', options: ['外放', '内敛', '克制'] },
  { key: 'pace', label: '叙事速度', options: ['舒缓铺陈', '适中', '紧凑推进'] },
];

var _directionMaps = {
  explicitness: { '含蓄': '情色描写含蓄委婉，多用暗示和留白', '适中': '情色描写尺度适中，不过分直白也不过分含蓄', '露骨': '情色描写直接露骨，用词大胆不加修饰' },
  temp: { '审美化': '用美的眼光描写身体和性，注重比喻、意象和艺术感', '感官化': '侧重触觉、体感、温度、气味等感官细节', '功能化': '对身体动作做功能性陈述，不做修饰或比喻' },
  sense: { '身体触觉': '优先描写身体感受、触觉和肉体反应', '视觉意象': '优先描写视觉画面和场景人物的外貌', '心理情感': '优先描写内心感受、情绪变化和心理活动', '综合平衡': '身体、视觉和心理描写平衡分配' },
  style: { '诗意': '语言有文学性和韵律感，注重意象和隐喻', '平实': '语言自然流畅，像讲故事一样平实', '粗粝': '语言粗粝有力，短句为主，不加修饰' },
  rhythm: { '短促有力': '多用短句和断句，节奏紧凑张力强', '绵长舒缓': '多用长句和复合句，节奏舒缓沉浸感强', '错落有致': '长短句交替，节奏变化丰富自然流畅' },
  density: { '白描': '描写简约克制，点到即止，留给读者想象空间', '细腻': '描写细致入微，细节丰富但不繁冗', '浓烈': '描写铺陈饱满，感官信息密集画面感强' },
  vocab: { '通俗': '使用日常口语化词汇，平易近人', '文雅': '使用书面语和文学词汇，格调雅致', '古风': '适当使用古典词汇和句式，营造古韵' },
  distance: { '沉浸': '叙述贴近角色内心和身体，有强烈代入感', '平衡': '叙述保持适中距离，既有代入也有观察', '旁观': '叙述保持距离，以观察者视角客观描述' },
  depth: { '少': '减少心理描写，以外部动作和对话为主', '中': '心理描写适中，内外兼顾', '多': '深入刻画内心活动和情感变化' },
  dialogue: { '动作叙事': '以动作推进为主，对话为辅', '平衡': '动作叙事和对话比重均衡', '对话驱动': '以对话推动情节为主' },
  mood: { '温柔缱绻': '情感基调温柔缠绵，充满亲昵和温情', '狂放放纵': '情感基调狂野奔放，毫无拘束', '冷峻克制': '情感基调冷静克制，保持距离感', '紧张压迫': '情感基调紧张压抑，充满张力和不安' },
  emotion: { '外放': '情感直接外露，充分描写角色的情绪反应', '内敛': '情感含蓄内敛，以动作暗示代替直抒胸臆', '克制': '情感高度克制，以冷静克制的笔触叙述' },
  pace: { '舒缓铺陈': '叙事节奏缓慢，注重细节铺陈和氛围渲染', '适中': '叙事节奏适中，推进自然', '紧凑推进': '叙事节奏紧凑，情节推进快速' },
};

// 初始化方案 chips
function renderPlanChips() {
  ['A', 'B', 'C'].forEach(function(plan) {
    var cfg = _writingPlanConfigs[plan];
    var el = document.getElementById('plan' + plan + 'Chips');
    if (!el) return;
    el.style.display = 'grid';
    el.style.gridTemplateColumns = '1fr 1fr';
    el.style.gap = '3px 8px';
    el.innerHTML = _directionCategories.map(function(cat) {
      var chips = cat.options.map(function(o) {
        var active = cfg[cat.key] === o;
        return '<span class="writing-plan-chip' + (active ? ' active' : '') + '" onclick="setPlanChip(\'' + plan + '\',\'' + cat.key + '\',\'' + o.replace(/'/g, "\\'") + '\')">' + o + '</span>';
      }).join('');
      return '<div class="writing-dir-row"><span class="writing-dir-label">' + cat.label + '</span><span style="display:flex;gap:2px;flex-wrap:wrap">' + chips + '</span></div>';
    }).join('');
  });
}

function setPlanChip(plan, field, value) {
  _writingPlanConfigs[plan][field] = value;
  renderPlanChips();
}

// 切换方案启用状态
function toggleWritingPlan(plan) {
  _writingPlanStates[plan] = !_writingPlanStates[plan];
  var toggle = document.getElementById('toggle' + plan);
  var knob = document.getElementById('knob' + plan);
  if (toggle) toggle.style.background = _writingPlanStates[plan] ? '#4ecca3' : '#1e1e3a';
  if (knob) knob.style.left = _writingPlanStates[plan] ? '16px' : '2px';
}

// 存储生成前的原文，用于对比
var _writingOriginalText = '';

// 为已启用的方案生成内容
function writingGeneratePlans() {
  var enabledPlans = [];
  ['A', 'B', 'C', 'D'].forEach(function(plan) {
    if (_writingPlanStates[plan]) enabledPlans.push(plan);
  });
  if (!enabledPlans.length) { toast('请先启用至少一个方案'); return; }
  // 记录生成时的章节索引，确保写入时写入正确的章节
  _writingPlanGeneration章 = 小说写作当前章;
  var ch = 小说写作章集[小说写作当前章];
  if (!ch) { toast('请先选择章节'); return; }
  var editor = document.getElementById('writingEditor');
  var editorText = editor ? editor.innerText : '';
  if (!editorText.trim()) { toast('编辑区为空，请先生成或输入内容'); return; }

  // 保存原文用于后续对比
  _writingOriginalText = editorText;

  // 取全文，要求 AI 重写风格
  var context = editorText;

  // 显示底部生成状态
  var genStatus = document.getElementById('writingGenStatus');
  if (genStatus) {
    genStatus.style.display = '';
    genStatus.textContent = '🤖 生成中 0/' + enabledPlans.length;
  }
  var _genCompleted = 0;

  enabledPlans.forEach(function(plan) {
    var cfg = _writingPlanConfigs[plan];
    var customDir = plan === 'D' ? (document.getElementById('planDCustom') ? document.getElementById('planDCustom').value : '') : '';
    if (plan !== 'D' && !cfg.style) return;

    var guidance = [];
    _directionCategories.forEach(function(cat) {
      var val = cfg[cat.key];
      if (val && _directionMaps[cat.key] && _directionMaps[cat.key][val]) {
        guidance.push('· ' + _directionMaps[cat.key][val]);
      }
    });
    if (customDir) guidance.push('· ' + customDir);

    var sysPrompt = '你是一个情色小说风格重塑专家。你的核心任务是将给定的文字按指定的风格要求进行大幅度的、显著可感知的风格转换。要求：1. 保持原有剧情、情节推进、人物关系和对话内容不变；2. 必须对写作风格、语言质感、句式结构和叙事方式进行大幅度的重写，让读者一眼就能感受到风格变化；3. 避免保留原文的措辞习惯和句式结构，用全新的语言表达同样的内容；4. 追求极致风格化，让每个维度指引都清晰体现在文字中；5. 直接输出改写后的完整正文，不要添加说明';
    var userPrompt = '【风格要求】\n' + guidance.join('\n') + '\n\n【原文内容】\n' + context + '\n\n【改写要求】\n请严格按照风格要求对原文进行大幅度重写。注意：不要只做微调或局部修改，而是用全新的语言和句式重新表达同样的情节。保留剧情走向和对话内容，但改变叙述方式、描写角度、语言节奏和词汇选择。输出要有强烈的"脱胎换骨"感。每句话都必须重新组织语言，严禁直接复制原文中的任何完整句子，改写后与原文的重复率不得超过 80%。\n\n请现在输出改写后的完整版本：';

    var loadingEl = document.getElementById('plan' + plan + 'Loading');
    var resultEl = document.getElementById('plan' + plan + 'Result');
    var resultText = document.getElementById('plan' + plan + 'ResultText');
    if (loadingEl) loadingEl.style.display = '';
    if (resultEl) resultEl.style.display = 'none';

    LLM.call({ prompt: userPrompt, system: sysPrompt, label: 'AI工坊·方案' + plan, temperature: 0.85 }).then(function(result) {
      if (loadingEl) loadingEl.style.display = 'none';
      if (resultEl) resultEl.style.display = '';
      if (resultText) resultText.textContent = result || '(无内容)';
      _writingPlanResults[plan] = result || '';
      _genCompleted++;
      if (genStatus) genStatus.textContent = '🤖 生成中 ' + _genCompleted + '/' + enabledPlans.length;
      if (_genCompleted >= enabledPlans.length && genStatus) { genStatus.style.display = 'none'; }
    }).catch(function(err) {
      if (loadingEl) loadingEl.textContent = '❌ 生成失败: ' + err.message;
      console.error('[AI工坊] 方案' + plan + ' 生成失败:', err);
      _genCompleted++;
      if (genStatus) genStatus.textContent = '🤖 生成中 ' + _genCompleted + '/' + enabledPlans.length;
      if (_genCompleted >= enabledPlans.length && genStatus) { genStatus.style.display = 'none'; }
    });
  });
}

// 写入方案结果到编辑器
function writingPlanWrite(plan) {
  var result = _writingPlanResults[plan];
  if (!result) { toast('该方案还没有生成内容'); return; }

  // 切换到生成时的章节（如果不是当前章节），确保内容写入正确的章节
  if (小说写作当前章 !== _writingPlanGeneration章) {
    小说写作当前章 = _writingPlanGeneration章;
    renderChapterList();
    // 更新章节标题（不调用 loadChapterContent 以避免异步竞争）
    var ch = 小说写作章集[小说写作当前章];
    var titleEl = document.getElementById('writingChapterTitle');
    if (titleEl) titleEl.textContent = ch ? (ch.title || '第' + (小说写作当前章 + 1) + '章') : '';
  }

  var editor = document.getElementById('writingEditor');
  if (!editor) return;
  editor.innerHTML = formatForDisplay(result);
  _writingPlanResults[plan] = '';
  var resultEl = document.getElementById('plan' + plan + 'Result');
  if (resultEl) resultEl.style.display = 'none';
  updateWritingStatus();
  小说保存当前章();
  toast('方案 ' + plan + ' 内容已写入第' + (小说写作当前章 + 1) + '章');
}

// 初始渲染方案 chips
setTimeout(function() { renderPlanChips(); }, 100);
window.updateKeystrokeDisplay = updateKeystrokeDisplay;
window.updateSparkline = updateSparkline;
window.renderSparkline = renderSparkline;
window.小说手动快照 = 小说手动快照;
window.loadStreakFromStorage = loadStreakFromStorage;
window.recordWritingStreak = recordWritingStreak;
window.renderStreakBar = renderStreakBar;
window.toggleWritingPlan = toggleWritingPlan;
window.setPlanChip = setPlanChip;
window.writingGeneratePlans = writingGeneratePlans;
window.writingPlanWrite = writingPlanWrite;
window.renderPlanChips = renderPlanChips;

// ===== 对比功能 =====

// 将相邻的 add/remove 合并为 change（配对到同一行）
function mergeDiff(diff) {
  var merged = [];
  var i = 0;
  while (i < diff.length) {
    if (diff[i].type === 'same') {
      merged.push(diff[i]);
      i++;
    } else {
      var adds = [], removes = [];
      while (i < diff.length && diff[i].type !== 'same') {
        if (diff[i].type === 'add') adds.push(diff[i].text);
        else removes.push(diff[i].text);
        i++;
      }
      merged.push({ type: 'change', oldText: removes.join(''), newText: adds.join('') });
    }
  }
  return merged;
}

// LCS 句子级 diff（返回对齐的 same/add/remove 序列）
function computeDiff(original, modified) {
  var re = /[^。！？\n]+[。！？\n]?/g;
  var origSentences = original.match(re) || [original];
  var modSentences = modified.match(re) || [modified];

  var lcs = [];
  for (var i = 0; i <= origSentences.length; i++) {
    lcs[i] = [];
    for (var j = 0; j <= modSentences.length; j++) {
      if (i === 0 || j === 0) lcs[i][j] = 0;
      else if (origSentences[i-1] === modSentences[j-1]) lcs[i][j] = lcs[i-1][j-1] + 1;
      else lcs[i][j] = Math.max(lcs[i-1][j], lcs[i][j-1]);
    }
  }

  var result = [];
  var i = origSentences.length, j = modSentences.length;
  var temp = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origSentences[i-1] === modSentences[j-1]) {
      result = temp.reverse().concat(result); temp = [];
      result.unshift({ type: 'same', text: origSentences[i-1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || lcs[i][j-1] >= lcs[i-1][j])) {
      temp.push({ type: 'add', text: modSentences[j-1] });
      j--;
    } else {
      temp.push({ type: 'remove', text: origSentences[i-1] });
      i--;
    }
  }
  result = temp.reverse().concat(result);
  return mergeDiff(result);
}

function writingShowDiff(plan) {
  var result = _writingPlanResults[plan];
  var original = _writingOriginalText;
  if (!result) { toast('该方案还没有生成内容'); return; }
  if (!original) { toast('没有原文可对比'); return; }

  var diff = computeDiff(original, result);
  var html = '<div class="mcard" style="max-width:820px;max-height:85vh;overflow-y:auto;padding:0">';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;position:sticky;top:0;background:#1c1c2e;z-index:1;border-bottom:1px solid #1e1e3a">';
  html += '<h3 style="font-size:0.95em;margin:0">📊 对比 · 方案 ' + plan + '</h3>';
  html += '<span style="font-size:10px;color:#667">左=AI 生成 &nbsp;&nbsp; 右=原文</span>';
  html += '</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:0;font-size:12px;line-height:1.8">';
  // 表头
  html += '<div style="padding:6px 10px;background:#0d1f3a;color:#4ecca3;font-weight:600;font-size:11px;border-right:1px solid #1e1e3a">AI 生成</div>';
  html += '<div style="padding:6px 10px;background:#2a0d0d;color:#ef4444;font-weight:600;font-size:11px">原文</div>';

  diff.forEach(function(seg) {
    if (seg.type === 'same') {
      html += '<div style="padding:3px 10px;color:#889;border-right:1px solid #1e1e3a;border-bottom:1px solid #0a0a1a">' + escHtml(seg.text) + '</div>';
      html += '<div style="padding:3px 10px;color:#889;border-bottom:1px solid #0a0a1a">' + escHtml(seg.text) + '</div>';
    } else if (seg.type === 'add') {
      html += '<div style="padding:3px 10px;color:#4ecca3;background:#0d3a2a;border-right:1px solid #1e1e3a;border-bottom:1px solid #0a0a1a">' + escHtml(seg.text) + '</div>';
      html += '<div style="padding:3px 10px;color:#444;background:#0a0a1a;border-bottom:1px solid #0a0a1a"></div>';
    } else if (seg.type === 'remove') {
      html += '<div style="padding:3px 10px;color:#444;background:#0a0a1a;border-right:1px solid #1e1e3a;border-bottom:1px solid #0a0a1a"></div>';
      html += '<div style="padding:3px 10px;color:#ef4444;background:#3a0d0d;border-bottom:1px solid #0a0a1a;text-decoration:line-through">' + escHtml(seg.text) + '</div>';
    } else if (seg.type === 'change') {
      html += '<div style="padding:3px 10px;color:#4ecca3;background:#0d3a2a;border-right:1px solid #1e1e3a;border-bottom:1px solid #0a0a1a">' + escHtml(seg.newText) + '</div>';
      html += '<div style="padding:3px 10px;color:#ef4444;background:#3a0d0d;border-bottom:1px solid #0a0a1a;text-decoration:line-through">' + escHtml(seg.oldText) + '</div>';
    }
  });

  html += '</div></div>';

  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = html;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
}

window.writingShowDiff = writingShowDiff;
