// 生活纪实 · AI 写作辅助
// 时段内容生成、续写、改写、扩写、润色、活动描述生成
// 所有函数通过 window 导出

// ========== 写作偏好全局变量 ==========
var lifeDocWritingChars = '';        // 当前出场角色（逗号分隔文本）
var lifeDocWritingPerspective = '第三人称';  // 视角：第一人称/第三人称
var lifeDocWritingTense = '现在时';          // 时态：现在时/过去时
var lifeDocWritingDetail = '中等';            // 细节程度：简略/中等/详细

// ========== 内部工具 ==========

/** 获取当前角色对象 */
function _lifeDocGetChar() {
  if (lifeDoc当前角色) return lifeDoc当前角色;
  if (lifeDoc当前角色名 && lifeDoc角色库 && lifeDoc角色库.length) {
    for (var i = 0; i < lifeDoc角色库.length; i++) {
      var c = lifeDoc角色库[i];
      if (c.name === lifeDoc当前角色名 || (c.identity && c.identity.basicInfo && c.identity.basicInfo.name === lifeDoc当前角色名)) {
        return c;
      }
    }
  }
  if (lifeDoc角色库 && lifeDoc角色库.length > 0) return lifeDoc角色库[0];
  return null;
}

/** 获取当前天数类型的时段列表 */
function _lifeDocGetSegments() {
  var ch = _lifeDocGetChar();
  if (!ch || !ch.dailyRoutine) return [];
  var dayType = lifeDoc写作台当前天类型 || 'workday';
  // 处理 custom 类型
  if (dayType === '_customDay' || dayType === '_customSeg') {
    return ch.customActivitySegments || ch.dailyRoutine._customSeg || [];
  }
  var segs = ch.dailyRoutine[dayType];
  if (Array.isArray(segs)) return segs;
  return [];
}

/** 获取当前时段数据 */
function _lifeDocGetCurrentSegment() {
  var segs = _lifeDocGetSegments();
  var idx = lifeDoc写作台当前段索引 || 0;
  if (idx >= 0 && idx < segs.length) return segs[idx];
  return null;
}

/** 构建角色信息上下文 */
function _lifeDocBuildCharContext() {
  var ch = _lifeDocGetChar();
  if (!ch) return '';
  var lines = [];
  var name = '';
  if (ch.identity && ch.identity.basicInfo) {
    name = ch.identity.basicInfo.name || ch.name || '未命名';
    var gender = ch.identity.basicInfo.gender || '';
    var age = ch.identity.basicInfo.age || '';
    if (gender || age) {
      var info = [];
      if (age) info.push(age + '岁');
      if (gender) info.push(gender);
      lines.push('基本信息：' + name + '，' + info.join('、'));
    } else {
      lines.push('姓名：' + name);
    }
    if (ch.identity.personality) {
      var p = ch.identity.personality;
      if (typeof p === 'string') lines.push('性格：' + p);
      else if (typeof p === 'object') {
        var pStr = [];
        if (p.traits) pStr.push(Array.isArray(p.traits) ? p.traits.join('、') : p.traits);
        if (p.summary) pStr.push(p.summary);
        if (pStr.length) lines.push('性格：' + pStr.join('，'));
      }
    }
    if (ch.identity.background) {
      var bg = typeof ch.identity.background === 'string' ? ch.identity.background : (ch.identity.background.summary || '');
      if (bg) lines.push('背景：' + bg.slice(0, 200));
    }
  } else {
    name = ch.name || '未命名';
    lines.push('姓名：' + name);
  }
  // 附加外貌描述
  if (ch.appearance) {
    var app = typeof ch.appearance === 'string' ? ch.appearance : (ch.appearance.summary || ch.appearance.description || '');
    if (app) lines.push('外貌：' + app.slice(0, 150));
  }
  // 附加当前关系
  if (ch.relationship) {
    var rel = typeof ch.relationship === 'string' ? ch.relationship : (ch.relationship.summary || ch.relationship.status || '');
    if (rel) lines.push('关系：' + rel.slice(0, 100));
  }
  return lines.join('\n');
}

/** 构建当前时段上下文 */
function _lifeDocBuildSegmentContext() {
  var seg = _lifeDocGetCurrentSegment();
  if (!seg) return '';
  var lines = [];
  var dayType = lifeDoc写作台当前天类型 || 'workday';
  var dayLabels = { workday: '工作日', restday: '休息日', sexday: '性爱日', _customSeg: '活动段', _customDay: '活动日' };
  lines.push('天类型：' + (dayLabels[dayType] || dayType));

  if (seg.timeLabel) lines.push('时段：' + seg.timeLabel);
  if (seg.plays) lines.push('玩法：' + seg.plays);
  else if (seg.activities) lines.push('玩法：' + (Array.isArray(seg.activities) ? seg.activities.join('、') : seg.activities));
  if (seg.location) lines.push('地点：' + seg.location);
  if (seg.mood) lines.push('情绪基调：' + seg.mood);
  if (seg.weather) lines.push('天气：' + seg.weather);
  if (seg.purpose) lines.push('目的：' + seg.purpose);

  return lines.join('\n');
}

/** 构建写作风格指令 */
function _lifeDocBuildStyleInstruction() {
  var parts = [];
  if (lifeDocWritingPerspective) parts.push('视角：' + lifeDocWritingPerspective);
  if (lifeDocWritingTense) parts.push('时态：' + lifeDocWritingTense);
  var detailMap = { '简略': '简要叙述，点到为止，不展开细节描写', '中等': '适度展开，兼顾叙事节奏和细节刻画', '详细': '充分展开，注重感官细节和环境描写' };
  if (lifeDocWritingDetail && detailMap[lifeDocWritingDetail]) {
    parts.push('细节程度：' + detailMap[lifeDocWritingDetail]);
  }
  return parts.join('\n');
}

/** 构建角色出场列表上下文 */
function _lifeDocBuildCharsContext() {
  if (!lifeDocWritingChars || !lifeDocWritingChars.trim()) return '';
  return '出场角色：' + lifeDocWritingChars;
}

// ========== AI 写作系统提示词 ==========

var _LIFEDOC_SYSTEM_BASE = '你是一位生活纪实文学作家，擅长以细腻的笔触描绘日常生活的点滴。你的文字真实、自然、充满生活气息，注重感官细节（视觉、听觉、嗅觉、触觉、味觉）和情感流动。你不写浮夸的情节，而是在平凡中发现诗意，在日常中捕捉温度。';

var _LIFEDOC_SYSTEM_REWRITE = '你是一位生活纪实文学润色专家。你擅长在不改变原意的前提下，优化文字的表达方式，使其更富有文学质感和生活气息。';

// ========== 主函数 ==========

/**
 * lifeDocAI生成时段内容() - 根据当前时段、角色、方向芯片生成完整内容
 * 读取 writing.js 中的全局状态，调用 LLM 后将结果填入编辑器
 */
function lifeDocAI生成时段内容() {
  var editor = document.getElementById('lifeDocWritingEditor');
  if (!editor) { toast('找不到编辑器'); return; }

  var ch = _lifeDocGetChar();
  if (!ch) { toast('请先选择角色'); return; }

  var seg = _lifeDocGetCurrentSegment();
  if (!seg) { toast('当前时段无数据'); return; }

  

  var charCtx = _lifeDocBuildCharContext();
  var segCtx = _lifeDocBuildSegmentContext();
  var styleInstruction = _lifeDocBuildStyleInstruction();
  var charsCtx = _lifeDocBuildCharsContext();

  // 用户选择的方向芯片（由 writing.js 传入）
  var selectedDirs = window._lifeDocSelectedDirections || [];
  var directionText = '';
  if (selectedDirs.length > 0) {
    directionText = '\n【方向提示】用户希望内容侧重以下方向：\n' + selectedDirs.map(function(d) {
      return '- ' + d;
    }).join('\n');
  }

  var userPrompt = ''
    + charCtx + '\n\n'
    + '===== 当前时段 =====\n'
    + segCtx + '\n\n'
    + (charsCtx ? charsCtx + '\n\n' : '')
    + (styleInstruction ? '===== 写作要求 =====\n' + styleInstruction + '\n\n' : '')
    + (directionText ? directionText + '\n\n' : '')
    + '请根据以上信息，以生活纪实文学的笔触描写这个时段发生的事。从主人公的视角出发，用具体的感官细节和生活化的场景让文字充满真实感。不追求戏剧化，而是捕捉日常中的情感和温度。\n\n'
    + '注意：\n'
    + '1. 直接输出正文，不要输出标题或「以下是……」之类的引导语\n'
    + '2. 使用自然的中文，避免过度修饰或矫情\n'
    + '3. 字数控制在300-800字之间\n'
    + '4. 如果时段中有具体活动，请围绕活动展开叙事';

  var systemPrompt = _LIFEDOC_SYSTEM_BASE;
  if (seg.mood) {
    systemPrompt += '\n\n当前情绪基调偏向「' + seg.mood + '」，请在行文中自然融入这种氛围。';
  }

  LLM.call({
    system: systemPrompt,
    prompt: userPrompt,
    label: '生活纪实生成: ' + (seg.timeLabel || '时段'),
    temperature: 0.85
  }).then(function(result) {
    if (!result) { toast('AI 返回为空');  return; }
    editor.innerHTML = formatForDisplay(result);
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    toast('时段内容已生成');
    
  }).catch(function(err) {
    toast('AI 生成失败: ' + err.message);
    
  });
}

/**
 * lifeDocAI续写() - 取编辑器最后200字，由 AI 续写下一段
 */
function lifeDocAI续写() {
  var editor = document.getElementById('lifeDocWritingEditor');
  if (!editor) { toast('找不到编辑器'); return; }

  var currentText = editor.innerText || '';
  if (!currentText.trim()) {
    toast('编辑器为空，请先让 AI 生成或手动写入内容');
    return;
  }

  

  var lastChars = currentText.slice(-200);
  var styleInstruction = _lifeDocBuildStyleInstruction();
  var charsCtx = _lifeDocBuildCharsContext();

  var systemPrompt = _LIFEDOC_SYSTEM_BASE + '\n\n你正在续写一段生活纪实文字。请保持与上文一致的风格和语调。';

  var userPrompt = ''
    + (styleInstruction ? '写作要求：\n' + styleInstruction + '\n\n' : '')
    + (charsCtx ? charsCtx + '\n\n' : '')
    + '以下是上文的最末尾（200字）：\n'
    + '```\n' + lastChars + '\n```\n\n'
    + '请直接续写下一段内容，自然衔接上文，保持相同的叙事节奏和生活纪实风格。\n'
    + '注意：\n'
    + '1. 只输出续写内容，不要重复上文\n'
    + '2. 续写200-400字\n'
    + '3. 不要输出「以下是续写」之类的引导语';

  LLM.call({
    system: systemPrompt,
    prompt: userPrompt,
    label: '生活纪实续写',
    temperature: 0.8
  }).then(function(result) {
    if (!result) { toast('AI 返回为空');  return; }
    // 在编辑器末尾追加续写内容，加两个换行分隔
    editor.innerHTML = formatForDisplay(currentText + '\n\n' + result);
    // 滚动到底部
    editor.scrollTop = editor.scrollHeight;
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    toast('续写完成');
    
  }).catch(function(err) {
    toast('AI 续写失败: ' + err.message);
    
  });
}

/**
 * lifeDocAI改写() - 改写编辑器中的选中文本（若无选中则改写全部）
 */
function lifeDocAI改写() {
  var editor = document.getElementById('lifeDocWritingEditor');
  if (!editor) { toast('找不到编辑器'); return; }

  var selection = window.getSelection();
  var selectedText = '';
  var isRangeSelected = false;

  if (selection && selection.rangeCount > 0 && !selection.isCollapsed && editor.contains(selection.anchorNode)) {
    selectedText = selection.toString();
    isRangeSelected = true;
  }

  if (!selectedText.trim()) {
    selectedText = editor.innerText || '';
    if (!selectedText.trim()) { toast('编辑器为空，无内容可改写'); return; }
  }

  

  var styleInstruction = _lifeDocBuildStyleInstruction();

  var userPrompt = ''
    + '请改写以下生活纪实文字，保持原意但优化表达方式。\n\n'
    + (styleInstruction ? '写作要求：\n' + styleInstruction + '\n\n' : '')
    + '原文：\n'
    + '```\n' + selectedText + '\n```\n\n'
    + '要求：\n'
    + '1. 保持原意和关键信息不变\n'
    + '2. 优化语言表达，使文字更流畅、更富有生活气息\n'
    + '3. 不改变叙事角度和时态\n'
    + '4. 直接输出改写后的内容，不要输出引导语或说明';

  LLM.call({
    system: _LIFEDOC_SYSTEM_REWRITE,
    prompt: userPrompt,
    label: '生活纪实改写',
    temperature: 0.7
  }).then(function(result) {
    if (!result) { toast('AI 返回为空');  return; }

    if (isRangeSelected && window._lifeDocSelectedRange) {
      // 替换选中区域
      try {
        var range = window._lifeDocSelectedRange;
        range.deleteContents();
        range.insertNode(document.createTextNode(result));
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (e) {
        // 如果选区失效，替换全部内容
        editor.innerHTML = formatForDisplay(result);
      }
      window._lifeDocSelectedRange = null;
    } else {
      editor.innerHTML = formatForDisplay(result);
    }

    editor.dispatchEvent(new Event('input', { bubbles: true }));
    toast('改写完成');
    
  }).catch(function(err) {
    toast('AI 改写失败: ' + err.message);
    
  });
}

/**
 * lifeDocAI扩写() - 对选中文本（或全文）进行扩写，增加细节
 */
function lifeDocAI扩写() {
  var editor = document.getElementById('lifeDocWritingEditor');
  if (!editor) { toast('找不到编辑器'); return; }

  var selection = window.getSelection();
  var selectedText = '';
  var isRangeSelected = false;

  if (selection && selection.rangeCount > 0 && !selection.isCollapsed && editor.contains(selection.anchorNode)) {
    selectedText = selection.toString();
    isRangeSelected = true;
  }

  if (!selectedText.trim()) {
    selectedText = editor.innerText || '';
    if (!selectedText.trim()) { toast('编辑器为空，无内容可扩写'); return; }
  }

  

  var segCtx = _lifeDocBuildSegmentContext();
  var styleInstruction = _lifeDocBuildStyleInstruction();

  var userPrompt = ''
    + '请扩写以下生活纪实文字，在保持原意和结构的基础上增加更多细节。\n\n'
    + (segCtx ? '当前情境：\n' + segCtx + '\n\n' : '')
    + (styleInstruction ? '写作要求：\n' + styleInstruction + '\n\n' : '')
    + '原文：\n'
    + '```\n' + selectedText + '\n```\n\n'
    + '要求：\n'
    + '1. 保留原文所有内容和信息\n'
    + '2. 在适当位置加入感官细节（视觉、听觉、嗅觉、触觉）\n'
    + '3. 丰富环境和人物动作描写\n'
    + '4. 增加心理活动和情绪变化的刻画\n'
    + '5. 总长度约为原文的1.5-2倍\n'
    + '6. 直接输出扩写后的完整内容，不要输出引导语';

  LLM.call({
    system: _LIFEDOC_SYSTEM_BASE,
    prompt: userPrompt,
    label: '生活纪实扩写',
    temperature: 0.8
  }).then(function(result) {
    if (!result) { toast('AI 返回为空');  return; }

    if (isRangeSelected && window._lifeDocSelectedRange) {
      try {
        var range = window._lifeDocSelectedRange;
        range.deleteContents();
        range.insertNode(document.createTextNode(result));
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (e) {
        editor.innerHTML = formatForDisplay(result);
      }
      window._lifeDocSelectedRange = null;
    } else {
      editor.innerHTML = formatForDisplay(result);
    }

    editor.dispatchEvent(new Event('input', { bubbles: true }));
    toast('扩写完成');
    
  }).catch(function(err) {
    toast('AI 扩写失败: ' + err.message);
    
  });
}

/**
 * lifeDocAI润色() - 润色编辑器文字，优化语言流畅度和表达
 */
function lifeDocAI润色() {
  var editor = document.getElementById('lifeDocWritingEditor');
  if (!editor) { toast('找不到编辑器'); return; }

  var selection = window.getSelection();
  var selectedText = '';
  var isRangeSelected = false;

  if (selection && selection.rangeCount > 0 && !selection.isCollapsed && editor.contains(selection.anchorNode)) {
    selectedText = selection.toString();
    isRangeSelected = true;
  }

  if (!selectedText.trim()) {
    selectedText = editor.innerText || '';
    if (!selectedText.trim()) { toast('编辑器为空，无内容可润色'); return; }
  }

  

  var userPrompt = ''
    + '请润色以下生活纪实文字。优化语言表达，修正不通顺处，但不改变原意和风格。\n\n'
    + '原文：\n'
    + '```\n' + selectedText + '\n```\n\n'
    + '要求：\n'
    + '1. 保持原意、叙事视角和时态不变\n'
    + '2. 修正语法问题和不通顺的表达\n'
    + '3. 优化用词，使文字更自然流畅\n'
    + '4. 适当调整长句为短句，提升可读性\n'
    + '5. 不增删实质性内容，只做语言层面的优化\n'
    + '6. 直接输出润色后的文字，不要输出引导语或对比说明';

  LLM.call({
    system: _LIFEDOC_SYSTEM_REWRITE,
    prompt: userPrompt,
    label: '生活纪实润色',
    temperature: 0.5
  }).then(function(result) {
    if (!result) { toast('AI 返回为空');  return; }

    if (isRangeSelected && window._lifeDocSelectedRange) {
      try {
        var range = window._lifeDocSelectedRange;
        range.deleteContents();
        range.insertNode(document.createTextNode(result));
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (e) {
        editor.innerHTML = formatForDisplay(result);
      }
      window._lifeDocSelectedRange = null;
    } else {
      editor.innerHTML = formatForDisplay(result);
    }

    editor.dispatchEvent(new Event('input', { bubbles: true }));
    toast('润色完成');
    
  }).catch(function(err) {
    toast('AI 润色失败: ' + err.message);
    
  });
}

/**
 * lifeDocAI生成活动描述(seg) - 根据时段的关键字段生成活动描述
 * 由 plan.js 调用，不依赖编辑器和选区
 * @param {Object} seg - 时段对象，包含 timeLabel/activities/location 等字段
 * @returns {Promise<string>} 生成的描述文本
 */
function lifeDocAI生成活动描述(seg) {
  if (!seg) return Promise.resolve('');

  var ch = _lifeDocGetChar();

  var charCtx = ch ? _lifeDocBuildCharContext() : '';
  var dayType = lifeDoc写作台当前天类型 || 'workday';
  var dayLabels = { workday: '工作日', restday: '休息日', sexday: '性爱日', _customSeg: '活动段', _customDay: '活动日' };

  var segLines = [];
  segLines.push('天类型：' + (dayLabels[dayType] || dayType));
  if (seg.timeLabel) segLines.push('时段：' + seg.timeLabel);
  if (seg.plays) segLines.push('玩法：' + seg.plays);
  else if (seg.activities && seg.activities.length) segLines.push('玩法：' + (Array.isArray(seg.activities) ? seg.activities.join('、') : seg.activities));
  if (seg.location) segLines.push('地点：' + seg.location);
  if (seg.mood) segLines.push('情绪：' + seg.mood);
  if (seg.purpose) segLines.push('目的：' + seg.purpose);

  var segCtx = segLines.join('\n');

  var userPrompt = ''
    + (charCtx ? charCtx + '\n\n' : '')
    + '===== 时段信息 =====\n'
    + segCtx + '\n\n'
    + '请根据以上信息，以生活纪实文学的笔触，用一段话（80-150字）描绘这个时段的核心场景。捕捉最具画面感的瞬间和真实的感官体验。\n\n'
    + '要求：\n'
    + '1. 直接输出正文，不要引导语\n'
    + '2. 80-150字，简洁有画面感\n'
    + '3. 聚焦于「正在做什么」和「周围环境」'

  return LLM.call({
    system: _LIFEDOC_SYSTEM_BASE,
    prompt: userPrompt,
    label: '生成活动描述',
    temperature: 0.8
  }).then(function(result) {
    if (!result) {  return ''; }
    
    return result;
  }).catch(function(err) {
    
    return '';
  });
}

// ========== 选区保存 ==========

/**
 * 保存当前选区，供改写/扩写/润色使用
 * 由 writing.js 在用户点击 AI 操作按钮前调用
 */
function lifeDocSaveSelection() {
  var editor = document.getElementById('lifeDocWritingEditor');
  if (!editor) return;

  var selection = window.getSelection();
  if (selection && selection.rangeCount > 0 && !selection.isCollapsed && editor.contains(selection.anchorNode)) {
    window._lifeDocSelectedRange = selection.getRangeAt(0).cloneRange();
    window._lifeDocSelectedText = selection.toString();
  } else {
    window._lifeDocSelectedRange = null;
    window._lifeDocSelectedText = '';
  }
}

// ========== 导出 ==========
window.lifeDocAI生成时段内容 = lifeDocAI生成时段内容;
window.lifeDocAI续写 = lifeDocAI续写;
window.lifeDocAI改写 = lifeDocAI改写;
window.lifeDocAI扩写 = lifeDocAI扩写;
window.lifeDocAI润色 = lifeDocAI润色;
window.lifeDocAI生成活动描述 = lifeDocAI生成活动描述;
window.lifeDocSaveSelection = lifeDocSaveSelection;
window.lifeDocWritingChars = lifeDocWritingChars;
window.lifeDocWritingPerspective = lifeDocWritingPerspective;
window.lifeDocWritingTense = lifeDocWritingTense;
window.lifeDocWritingDetail = lifeDocWritingDetail;

console.log('[LifeDoc AI] writing-ai.js loaded');
