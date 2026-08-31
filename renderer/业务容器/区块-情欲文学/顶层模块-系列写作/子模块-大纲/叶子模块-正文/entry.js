// 系列写作 · 大纲正文
function XLRenderMain(el) {
  el.innerHTML = '<div id="XLOutlineEditor" class="n-card"><div class="placeholder-text">加载中...</div></div><div id="XLOutlineStatus" class="text-muted text-sm mt-8"></div>';

  if (!_XLChapters.length) {
    Store.seriesWriting.get(swActiveSeries).then(function(data) {
      if (data && data.outline && data.outline.length) {
        _XLChapters = data.outline;
        _XLEnding = data.ending || '';
        _XLChapters.forEach(function(ch, i) {
          if (ch.index === undefined) {
            ch.index = i + 1;
            if (ch.title && ch.title.indexOf('第') < 0) ch.title = '第' + (i+1) + '章·' + ch.title;
          }
          if (ch.characters && typeof ch.characters === 'string') ch.characters = ch.characters.split(/[、,，\s]+/).filter(Boolean);
          if (!ch.characters || !Array.isArray(ch.characters)) ch.characters = [];
        });
      } else {
        _XLChapters = [{index:1,title:'',playTags:'· ·',link:'',content:'',wordTarget:4000,eroticaLevel:'中度',highlight:false,characters:[],setting:''}];
      }
      XLRenderList();
    });
    return;
  }
  XLRenderList();
}

function XLAiGenerateOutline(direction) {
  openAiGenPanel('XL_gen_outline');
}

function XLRenderList() {
  var el = document.getElementById('XLOutlineEditor');
  if (!el) return;

  _XLChapters.forEach(function(ch, i) { ch.index = i + 1; if (ch.characters && typeof ch.characters === 'string') ch.characters = ch.characters.split(/[、,，\s]+/).filter(Boolean); if (!ch.characters || !Array.isArray(ch.characters)) ch.characters = []; });

  var h = '<div class="flex justify-between items-center mb-6">' +
    '<div><h4 class="m-0">📝 大纲正文</h4><p class="text-muted text-sm mt-2">编排章节结构，填写玩法/衔接/内容/场景。拖拽可调整顺序。</p></div>' +
    '<div><button class="btn bg-accent fs-12" id="XLRegenBtn" onclick="openAiGenPanel(\'XL_gen_outline\')">🤖 AI 重绘大纲</button></div></div>' +
    '<div id="aiopts_XL_olChapTitle" class="dn mt-4"></div>' +
    '<div id="aiopts_XL_olChapPlay" class="dn mt-4"></div>' +
    '<div id="aiopts_XL_olChapLink" class="dn mt-4"></div>' +
    '<div id="aiopts_XL_olChapContent" class="dn mt-4"></div>' +
    '<div id="aiopts_XL_olChapChar" class="dn mt-4"></div>' +
    '<div id="aiopts_XL_olChapSet" class="dn mt-4"></div>' +
    '<div id="XLChatSection" style="margin-bottom:20px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow:hidden">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--bg3);border-bottom:1px solid var(--border)">' +
    '<div style="font-weight:600;font-size:13px">💬 大纲讨论</div>' +
    '<button class="btn-sm bg-accent" onclick="XLGenFromChat()" style="font-size:11px">🎯 生成大纲</button></div>' +
    '<div id="XLChatMessages" style="height:280px;overflow-y:auto;padding:14px;background:var(--bg)">';
  if (_XLChatMessages.length) {
    _XLChatMessages.forEach(function(m) {
      if (m.role === 'system') return;
      var _isUser = m.role === 'user';
      if (_isUser) {
        h += '<div style="margin-bottom:12px;display:flex;align-items:flex-start;justify-content:flex-end;gap:8px">' +
        '<div style="max-width:75%;padding:8px 14px;border-radius:12px;background:var(--accent);color:#fff;font-size:12px;line-height:1.6;border-bottom-right-radius:4px;word-break:break-word">' +
        escHtml(m.content).replace(/\n/g,'<br>') + '</div>' +
        '<div style="width:28px;height:28px;border-radius:50%;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;color:var(--accent)">我</div></div>';
      } else {
        h += '<div style="margin-bottom:12px;display:flex;align-items:flex-start;gap:8px">' +
        '<div style="width:28px;height:28px;border-radius:50%;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0">🤖</div>' +
        '<div style="max-width:75%;padding:8px 14px;border-radius:12px;background:var(--bg3);color:var(--fg);font-size:12px;line-height:1.6;border-bottom-left-radius:4px;word-break:break-word">' +
        escHtml(m.content).replace(/\n/g,'<br>') + '</div></div>';
      }
    });
  } else {
    h += '<div class="text-muted text-sm" style="text-align:center;padding:50px 0">和 AI 讨论大纲内容与设计，然后点击「生成大纲」</div>';
  }
  h += '</div>' +
  '<div id="XLChatTyping" style="display:none;padding:6px 14px;font-size:11px;color:var(--fg2);border-top:1px solid var(--border);background:var(--bg2)">🤖 AI 正在输入...</div>' +
  '<div style="padding:10px 14px;border-top:1px solid var(--border);background:var(--bg2)">' +
  '<div style="display:flex;gap:8px;align-items:flex-end">' +
  '<textarea id="XLChatInput" style="flex:1;min-height:38px;max-height:80px;resize:none;background:var(--bg);color:var(--fg);border:1px solid var(--border);border-radius:6px;padding:7px 12px;font-size:12px;font-family:inherit;outline:none" placeholder="输入你的想法..." onkeydown="if(event.keyCode===13&&!event.shiftKey){event.preventDefault();XLSendChatMsg()}"></textarea>' +
  '<button onclick="XLSendChatMsg()" style="height:36px;padding:0 18px;border-radius:6px;background:var(--accent);color:#fff;border:none;cursor:pointer;font-weight:600;font-size:12px;white-space:nowrap;font-family:inherit">发送</button>' +
  '</div></div></div>';
  _XLChapters.forEach(function(ch, i) {
    var hc = ch.highlight;
    h += '<div class="n-card" style="cursor:grab;margin-bottom:8px;padding:12px;' + (hc ? 'border-color:var(--accent);' : '') + '" draggable="true" data-oidx="' + i + '">';
    h += '  <div class="flex-row" style="justify-content:space-between;align-items:center;margin-bottom:8px">' +
         '<div class="flex-row" style="align-items:center;gap:6px;flex:1;min-width:0">' +
         '<span style="font-weight:700;font-size:14px;color:var(--accent2);flex-shrink:0">第' + ch.index + '章</span>' +
         '<input id="XLTitle_' + i + '" style="background:var(--bg2);color:var(--fg);border:1px solid var(--border);border-radius:3px;font-weight:600;font-size:13px;padding:4px 8px;flex:1;min-width:0" value="' + escHtml(ch.title||'') + '" class="XL-ch-title" data-oidx="' + i + '" placeholder="章节标题...">' +
         '<button class="ai-suggest-btn" onclick="_aiTargetId=\'XLTitle_' + i + '\';openAiPanel(\'XL_olChapTitle\')" title="AI 建议标题">🤖</button>' +
         '</div>' +
         '<div class="flex-row" style="align-items:center;gap:4px;flex-shrink:0">' +
         '<span class="XL-hl-btn" data-oidx="' + i + '" style="display:inline-flex;align-items:center;gap:3px;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;font-weight:600;' +
           (hc ? 'background:var(--warning);color:#000;' : 'background:var(--bg3);color:var(--fg2);') + '" title="' + (hc ? '取消重点章节' : '标记为重点章节（字数翻倍至 8000）') + '">' +
         (hc ? '⭐ 重点' : '☆ 标为重要') + '</span>' +
         '<button class="btn-secondary btn-sm XL-regen-ch" data-oidx="' + i + '" style="padding:4px 8px;font-size:11px">🤖 重写</button>' +
         '<button class="btn-secondary btn-sm XL-add-after" data-oidx="' + i + '" style="padding:4px 8px;font-size:11px">＋ 新增</button>' +
         '<button class="btn-secondary btn-sm XL-del-ch" data-oidx="' + i + '" style="color:var(--error);padding:4px 8px;font-size:11px">✕ 删除</button></div></div>';
    h += '  <div class="flex-row" style="gap:8px;margin-bottom:6px">' +
         '<div class="flex-1"><div class="text-sm text-muted">玩法</div><div class="ai-field-row"><input id="XLPlay_' + i + '" class="llm-input XL-ch-play fs-12" data-oidx="' + i + '" value="' + escHtml(ch.playTags||'') + '" placeholder="标签1·标签2·标签3">' +
         '<button class="ai-suggest-btn" onclick="_aiTargetId=\'XLPlay_' + i + '\';_XLAiChapIdx=' + i + ';openAiPanel(\'XL_olChapPlay\')">🤖</button></div></div>' +
         '<div class="flex-1"><div class="text-sm text-muted">衔接<span class="field-tip" title="本章场景是为什么发生的？即调教人为什么要做这件事">?</span></div><div class="ai-field-row"><input id="XLLink_' + i + '" class="llm-input XL-ch-link fs-12" data-oidx="' + i + '" value="' + escHtml(ch.link||'') + '" placeholder="为什么发生？调教人的动机...">' +
         '<button class="ai-suggest-btn" onclick="_aiTargetId=\'XLLink_' + i + '\';_XLAiChapIdx=' + i + ';openAiPanel(\'XL_olChapLink\')">🤖</button></div></div></div>';
    h += '  <div class="form-group mb-6"><div class="text-sm text-muted">内容</div><div class="ai-field-row">' +
         '<textarea id="XLContent_' + i + '" class="XL-ch-content" data-oidx="' + i + '" style="background:var(--bg);color:var(--fg);border:1px solid var(--border);border-radius:3px;font-size:12px;width:100%;min-height:120px;resize:vertical;padding:6px;font-family:inherit" placeholder="核心场景描述…">' + escHtml(ch.content||'') + '</textarea>' +
         '<button class="ai-suggest-btn" onclick="_aiTargetId=\'XLContent_' + i + '\';_XLAiChapIdx=' + i + ';openAiPanel(\'XL_olChapContent\')" style="align-self:stretch">🤖</button></div></div>';
    h += '  <div class="flex-row" style="gap:8px;flex-wrap:wrap">' +
         '<div class="w-80"><div class="text-sm text-muted">字数</div><input type="number" class="llm-input XL-ch-wt fs-12" data-oidx="' + i + '" value="' + (ch.wordTarget||4000) + '"></div>' +
         '<div class="w-80"><div class="text-sm text-muted">强度</div><select class="llm-input llm-select XL-ch-ela fs-12" data-oidx="' + i + '">' + ['无','轻度','中度','重度'].map(function(l) { return '<option value="' + l + '"' + (ch.eroticaLevel === l ? ' selected' : '') + '>' + l + '</option>'; }).join('') + '</select></div>' +
         '<div class="flex-1"><div class="text-sm text-muted">出场角色</div><div class="ai-field-row"><input id="XLChar_' + i + '" class="llm-input XL-ch-char fs-12" data-oidx="' + i + '" value="' + escHtml((ch.characters||[]).join('、')) + '" placeholder="角色A、角色B">' +
         '<button class="ai-suggest-btn" onclick="_aiTargetId=\'XLChar_' + i + '\';_XLAiChapIdx=' + i + ';openAiPanel(\'XL_olChapChar\')">🤖</button></div></div>' +
         '<div class="flex-1"><div class="text-sm text-muted">场景<span class="field-tip" title="本章发生的地点/环境">?</span></div><div class="ai-field-row"><input id="XLSet_' + i + '" class="llm-input XL-ch-set fs-12" data-oidx="' + i + '" value="' + escHtml(ch.setting||'') + '" placeholder="发生地点...">' +
         '<button class="ai-suggest-btn" onclick="_aiTargetId=\'XLSet_' + i + '\';_XLAiChapIdx=' + i + ';openAiPanel(\'XL_olChapSet\')">🤖</button></div></div></div>';
    h += '</div>';
  });
  Array.from(el.querySelectorAll('.XL-del-ch')).forEach(function(btn) { btn.addEventListener('click', function() { var i = parseInt(this.getAttribute('data-oidx')); _XLChapters.splice(i,1); XLRenderList(); XLAutoSave(); }); });
  Array.from(el.querySelectorAll('.XL-add-after')).forEach(function(btn) { btn.addEventListener('click', function() { var i = parseInt(this.getAttribute('data-oidx')); _XLChapters.splice(i, 0, {index:i+1,title:'',playTags:'· ·',link:'',content:'',wordTarget:4000,eroticaLevel:'中度',highlight:false,characters:[],setting:''}); XLRenderList(); XLAutoSave(); }); });
  Array.from(el.querySelectorAll('.XL-regen-ch')).forEach(function(btn) { btn.addEventListener('click', function() { var i = parseInt(this.getAttribute('data-oidx')); _XLAiChapIdx = i; openAiGenPanel('XL_olChapFull'); }); });
  Array.from(el.querySelectorAll('.XL-ch-title')).forEach(function(inp) { inp.addEventListener('change', function() { _XLChapters[parseInt(this.getAttribute('data-oidx'))].title = this.value; XLAutoSave(); }); });
  Array.from(el.querySelectorAll('.XL-hl-btn')).forEach(function(btn) {
    btn.addEventListener('click', function() {
      var i = parseInt(this.getAttribute('data-oidx'));
      var ch = _XLChapters[i];
      ch.highlight = !ch.highlight;
      if (ch.highlight) {
        ch._origWordTarget = ch.wordTarget;
        ch.wordTarget = Math.max(ch.wordTarget || 4000, 8000);
      } else {
        ch.wordTarget = ch._origWordTarget || 4000;
        delete ch._origWordTarget;
      }
      XLRenderList();
      XLAutoSave();
    });
  });
  ['XL-ch-play','XL-ch-link','XL-ch-char','XL-ch-set'].forEach(function(cls) {
    Array.from(el.querySelectorAll('.' + cls)).forEach(function(inp) {
      inp.addEventListener('change', function() {
        var i = parseInt(this.getAttribute('data-oidx')); var key = cls.replace('XL-ch-','');
        _XLChapters[i][key === 'play' ? 'playTags' : key === 'char' ? 'characters' : key === 'set' ? 'setting' : key] = this.value;
        if (key === 'char') _XLChapters[i].characters = this.value.split(/[、,，\s]+/).filter(Boolean);
        XLAutoSave();
      });
    });
  });
  Array.from(el.querySelectorAll('.XL-ch-content')).forEach(function(ta) { ta.addEventListener('change', function() { _XLChapters[parseInt(this.getAttribute('data-oidx'))].content = this.value; XLAutoSave(); }); });
  Array.from(el.querySelectorAll('.XL-ch-wt')).forEach(function(inp) { inp.addEventListener('change', function() { _XLChapters[parseInt(this.getAttribute('data-oidx'))].wordTarget = parseInt(this.value) || 4000; XLAutoSave(); }); });
  Array.from(el.querySelectorAll('.XL-ch-ela')).forEach(function(sel) { sel.addEventListener('change', function() { _XLChapters[parseInt(this.getAttribute('data-oidx'))].eroticaLevel = this.value; XLAutoSave(); }); });
  Array.from(el.querySelectorAll('[draggable]')).forEach(function(item) { item.addEventListener('dragstart', function(e) { e.dataTransfer.setData('text/plain', this.getAttribute('data-oidx')); }); item.addEventListener('dragover', function(e) { e.preventDefault(); }); item.addEventListener('drop', function(e) { e.preventDefault(); var f = parseInt(e.dataTransfer.getData('text/plain')); var t = parseInt(this.getAttribute('data-oidx')); if (f !== t) { var m = _XLChapters.splice(f,1)[0]; _XLChapters.splice(t,0,m); XLRenderList(); XLAutoSave(); } }); });
}

// 大纲讨论
var _XLChatMessages = [];

function XLRenderChat() {
  var el = document.getElementById('XLChatMessages');
  if (!el) return;
  if (!_XLChatMessages.length) {
    el.innerHTML = '<div class="text-muted text-sm" style="text-align:center;padding:50px 0">和 AI 讨论大纲内容与设计，然后点击「生成大纲」</div>';
    return;
  }
  var h = '';
  _XLChatMessages.forEach(function(m) {
    if (m.role === 'system') return;
    var _isUser = m.role === 'user';
    if (_isUser) {
      h += '<div style="margin-bottom:12px;display:flex;align-items:flex-start;justify-content:flex-end;gap:8px">' +
        '<div style="max-width:75%;padding:8px 14px;border-radius:12px;background:var(--accent);color:#fff;font-size:12px;line-height:1.6;border-bottom-right-radius:4px;word-break:break-word">' +
        escHtml(m.content).replace(/\n/g,'<br>') + '</div>' +
        '<div style="width:28px;height:28px;border-radius:50%;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;color:var(--accent)">我</div></div>';
    } else {
      h += '<div style="margin-bottom:12px;display:flex;align-items:flex-start;gap:8px">' +
        '<div style="width:28px;height:28px;border-radius:50%;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0">🤖</div>' +
        '<div style="max-width:75%;padding:8px 14px;border-radius:12px;background:var(--bg3);color:var(--fg);font-size:12px;line-height:1.6;border-bottom-left-radius:4px;word-break:break-word">' +
        escHtml(m.content).replace(/\n/g,'<br>') + '</div></div>';
    }
  });
  el.innerHTML = h;
  el.scrollTop = el.scrollHeight;
}

function XLSendChatMsg() {
  var input = document.getElementById('XLChatInput');
  if (!input || !input.value.trim()) return;
  var msg = input.value.trim();
  input.value = '';
  _XLChatMessages.push({ role: 'user', content: msg });

  (typeof XLGetOutlineContext === 'function' ? XLGetOutlineContext(swActiveSeries) : Promise.resolve('')).then(function(ctx) {
    ctx = ctx || '';
    var msgs = [];
    _XLChatMessages.forEach(function(m, idx) {
      if (idx === 0 && m.role === 'user') {
        msgs.push({ role: 'user', content: '当前大纲信息：\n' + ctx + '\n\n---\n\n' + m.content });
      } else {
        msgs.push({ role: m.role, content: m.content });
      }
    });
    XLRenderChat();
    var typingEl = document.getElementById('XLChatTyping');
    if (typingEl) typingEl.style.display = '';


    LLM.call({ system: '你是一个情色小说大纲创作顾问。正在和作者讨论大纲设计。回复要简洁有建设性，给出具体建议。作者可以随时点击「从讨论生成大纲」来生成正式大纲。', messages: msgs, label: '大纲讨论' }).then(function(reply) {
      if (typingEl) typingEl.style.display = 'none';
      if (!reply) { toast('AI 返回为空'); return; }
      _XLChatMessages.push({ role: 'assistant', content: reply });
      XLRenderChat();
    }).catch(function(err) {
      if (typingEl) typingEl.style.display = 'none';
      toast('AI 响应失败: ' + err.message);
    });
  });
}

function XLGenFromChat() {
  if (!_XLChatMessages.length) { toast('请先和 AI 讨论大纲内容'); return; }
  if (!swActiveSeries) { toast('请先输入系列标题'); return; }
  Store.seriesWriting.get(swActiveSeries).then(function(m) {
    m = m || {};
    var outline = m.outline || [];
    return XLGetOutlineContext(swActiveSeries).then(function(ctx) {
      var hasBlanks = outline.some(function(ch) { return !ch.title && !ch.content; });
      if (hasBlanks) {
        var blankSlots = [];
        for (var i = 0; i < outline.length; i++) {
          if (!outline[i].title && !outline[i].content) blankSlots.push('第' + (i+1) + '章');
        }
        ctx += '\n\n【保留约束】已有章节如上，请遵守以下规则：\n';
        ctx += '- 非空白章节内容必须原样保留，不得修改；\n';
        ctx += '- 以下空白章节需生成完整新内容：' + blankSlots.join('、');
      } else if (outline.length > 0) {
        ctx = ctx.replace(/\n已有大纲章节：[\s\S]*?(?=\n(?:结局方向|参考作品|【参考文档|计划章节数)|\s*$)/, '');
      }
      var lastAi = '';
      for (var i = _XLChatMessages.length - 1; i >= 0; i--) {
        if (_XLChatMessages[i].role === 'assistant') { lastAi = _XLChatMessages[i].content; break; }
      }
      ctx = ctx + '\n\n【AI 讨论内容】\n' + lastAi;
      ctx = ctx + '\n\n【重要】创作原则——以下所有内容以【AI 讨论内容】为唯一依据：\n1. 方向服从讨论：故事走向、情节设计、角色关系、情色方向等所有核心决策，必须严格遵循讨论中确定的创意方向，不得偏离或自行另起炉灶；\n2. 内容服从讨论：讨论中明确提到的章节设定、玩法、衔接、场景、角色出场等具体内容，必须完整还原到对应章节中，不得遗漏或篡改；\n3. 讨论优先于背景：前文提供的已有大纲章节、标签、角色设定等仅作为背景参考，当背景与讨论方向不一致时，一律以讨论内容为准；\n4. 讨论优先于模板：模板中要求的 JSON 字段结构必须遵守，但所有字段的具体取值一律以讨论内容为准，模板中的示例仅为格式参考。';
      var r = renderPrompt('gen_quick_outline', { ctx: ctx, chapterHint: '微小说=3、短篇=5、中篇=10、长篇=20、超长篇=30' });

      window._lastPrompt = { prompt: r.user };
      var typingEl = document.getElementById('XLChatTyping');
      if (typingEl) typingEl.style.display = '';
      LLM.callJSON({ label: '从讨论生成大纲', prompt: r.user, system: r.system, temperature: 0.7 }).then(function(d) {
        if (typingEl) typingEl.style.display = 'none';
        if (!d || !d.chapters || !d.chapters.length) { toast('AI 返回格式异常，请重试'); return; }
        _XLChapters = d.chapters;
        _XLChapters.forEach(function(ch, i) {
          ch.index = i + 1;
          if (!ch.wordTarget) ch.wordTarget = 4000;
          if (ch.highlight === undefined) ch.highlight = false;
          if (ch.eroticaLevel === undefined) ch.eroticaLevel = '中度';
          if (ch.characters && typeof ch.characters === 'string') ch.characters = ch.characters.split(/[、,，\s]+/).filter(Boolean);
          if (!ch.characters || !Array.isArray(ch.characters)) ch.characters = [];
        });
        XLRenderList();
        XLAutoSave();
        toast('大纲已生成（共' + _XLChapters.length + '章）');
      }).catch(function(err) {
        if (typingEl) typingEl.style.display = 'none';
        toast('大纲生成失败: ' + err.message);
      });
    });
  });
}
window.XLSendChatMsg = XLSendChatMsg;
window.XLGenFromChat = XLGenFromChat;

// 即时保存
var _XLSaveTimer = null;
function XLAutoSave() {
  if (_XLSaveTimer) clearTimeout(_XLSaveTimer);
  _XLSaveTimer = setTimeout(function() {
    if (!swActiveSeries || !_XLChapters) return;
    Store.seriesWriting.get(swActiveSeries).then(function(m) {
      m = m || {};
      m.outline = _XLChapters;
      m.ending = _XLEnding;
      Store.seriesWriting.save(swActiveSeries, m);
    });
  }, 300);
}

function XLAddCh() {
  _XLChapters.push({index:_XLChapters.length+1,title:'',playTags:'· ·',link:'',content:'',wordTarget:4000,eroticaLevel:'中度',highlight:false,characters:[],setting:''});
  XLRenderList();
}
