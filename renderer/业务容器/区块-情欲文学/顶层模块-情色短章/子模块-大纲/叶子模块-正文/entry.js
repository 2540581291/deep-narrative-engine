// 小说大纲 · 正文
function 短renderOutlineMain(el) {
  // 先写入容器，确保 outlineEditor 元素存在
  el.innerHTML = '<div id="outlineEditor" class="n-card"><div class="placeholder-text">加载中...</div></div><div id="outlineStatus" class="text-muted text-sm mt-8"></div>';

  // 默认初始化：如果没有任何章节数据，创建一个空白章节（类似身体参数默认展示空表单）
  if (!短oc.length) {
    if (!短ot) { 短oc = [{index:1,title:'',playTags:'· ·',link:'',content:'',wordTarget:4000,eroticaLevel:'中度',highlight:false,characters:[],setting:''}]; 短renderOutlineList(); return; }
    Store.vignette.get(短ot).then(function(data) {
      if (data && data.outline && data.outline.length) {
        短oc = data.outline;
        短oe = data.ending || '';
        短oc.forEach(function(ch, i) {
          if (ch.index === undefined) {
            ch.index = i + 1;
            if (ch.title && ch.title.indexOf('第') < 0) ch.title = '第' + (i+1) + '章·' + ch.title;
          }
          // 兼容旧数据：characters 字段可能是字符串
          if (ch.characters && typeof ch.characters === 'string') ch.characters = ch.characters.split(/[、,，\s]+/).filter(Boolean);
          if (!ch.characters || !Array.isArray(ch.characters)) ch.characters = [];
        });
      } else {
        // 默认展示一个空白章节
        短oc = [{index:1,title:'',playTags:'· ·',link:'',content:'',wordTarget:4000,eroticaLevel:'中度',highlight:false,characters:[],setting:''}];
      }
      短renderOutlineList();
    });
    return;
  }
  短renderOutlineList();
}

function 短aiGenerateOutline(direction) {
  openAiGenPanel('V_gen_outline');
}

function 短renderOutlineList() {
  var el = document.getElementById('outlineEditor');
  if (!el) return;

  短oc.forEach(function(ch, i) { ch.index = i + 1; if (ch.characters && typeof ch.characters === 'string') ch.characters = ch.characters.split(/[、,，\s]+/).filter(Boolean); if (!ch.characters || !Array.isArray(ch.characters)) ch.characters = []; });

  var h = '<div class="flex justify-between items-center mb-6">' +
    '<div><h4 class="m-0">📝 大纲正文</h4><p class="text-muted text-sm mt-2">编排章节结构，填写玩法/衔接/内容/场景。拖拽可调整顺序。</p></div>' +
    '<div><button class="btn" id="olRegenBtn" class="bg-accent fs-12" onclick="openAiGenPanel(\'V_gen_outline\')">🤖 AI 重绘大纲</button></div></div>' +
    '<!-- AI 选项容器 -->' +
    '<div id="aiopts_V_olChapTitle" class="dn mt-4"></div>' +
    '<div id="aiopts_V_olChapPlay" class="dn mt-4"></div>' +
    '<div id="aiopts_V_olChapLink" class="dn mt-4"></div>' +
    '<div id="aiopts_V_olChapContent" class="dn mt-4"></div>' +
    '<div id="aiopts_V_olChapChar" class="dn mt-4"></div>' +
    '<div id="aiopts_V_olChapSet" class="dn mt-4"></div>' +
    // ===== 大纲讨论区 =====
    '<div id="olChatSection" style="margin-bottom:20px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow:hidden">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--bg3);border-bottom:1px solid var(--border)">' +
    '<div style="font-weight:600;font-size:13px">💬 大纲讨论</div>' +
    '<button class="btn-sm bg-accent" onclick="短genOutlineFromChat()" style="font-size:11px">🎯 生成大纲</button></div>' +
    '<div id="olChatMessages" style="height:280px;overflow-y:auto;padding:14px;background:var(--bg)">';
    if (短olChatMsgs.length) {
      短olChatMsgs.forEach(function(m) {
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
    '<div id="olChatTyping" style="display:none;padding:6px 14px;font-size:11px;color:var(--fg2);border-top:1px solid var(--border);background:var(--bg2)">🤖 AI 正在输入...</div>' +
    '<div style="padding:10px 14px;border-top:1px solid var(--border);background:var(--bg2)">' +
    '<div style="display:flex;gap:8px;align-items:flex-end">' +
    '<textarea id="olChatInput" style="flex:1;min-height:38px;max-height:80px;resize:none;background:var(--bg);color:var(--fg);border:1px solid var(--border);border-radius:6px;padding:7px 12px;font-size:12px;font-family:inherit;outline:none" placeholder="输入你的想法..." onkeydown="if(event.keyCode===13&&!event.shiftKey){event.preventDefault();短sendOutlineChatMsg()}"></textarea>' +
    '<button onclick="短sendOutlineChatMsg()" style="height:36px;padding:0 18px;border-radius:6px;background:var(--accent);color:#fff;border:none;cursor:pointer;font-weight:600;font-size:12px;white-space:nowrap;font-family:inherit">发送</button>' +
    '</div></div></div>';
  短oc.forEach(function(ch, i) {
    var hc = ch.highlight;
    h += '<div class="n-card" style="cursor:grab;margin-bottom:8px;padding:12px;' + (hc ? 'border-color:var(--accent);' : '') + '" draggable="true" data-oidx="' + i + '">';
    // ===== 标题行 =====
    h += '  <div class="flex-row" style="justify-content:space-between;align-items:center;margin-bottom:8px">' +
         '<div class="flex-row" style="align-items:center;gap:6px;flex:1;min-width:0">' +
         '<span style="font-weight:700;font-size:14px;color:var(--accent2);flex-shrink:0">第' + ch.index + '章</span>' +
         '<input id="olTitle_' + i + '" style="background:var(--bg2);color:var(--fg);border:1px solid var(--border);border-radius:3px;font-weight:600;font-size:13px;padding:4px 8px;flex:1;min-width:0" value="' + escHtml(ch.title||'') + '" class="ol-ch-title" data-oidx="' + i + '" placeholder="章节标题...">' +
         '<button class="ai-suggest-btn" onclick="_aiTargetId=\'olTitle_' + i + '\';openAiPanel(\'V_olChapTitle\')" title="AI 建议标题">🤖</button>' +
         '</div>' +
         '<div class="flex-row" style="align-items:center;gap:4px;flex-shrink:0">' +
         '<span class="ol-hl-btn" data-oidx="' + i + '" style="display:inline-flex;align-items:center;gap:3px;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;font-weight:600;' +
           (hc ? 'background:var(--warning);color:#000;' : 'background:var(--bg3);color:var(--fg2);') + '" title="' + (hc ? '取消重点章节' : '标记为重点章节（字数翻倍至 8000）') + '">' +
         (hc ? '⭐ 重点' : '☆ 标为重要') + '</span>' +
         '<button class="btn-secondary btn-sm ol-regen-ch" data-oidx="' + i + '" style="padding:4px 8px;font-size:11px">🤖 重写</button>' +
         '<button class="btn-secondary btn-sm ol-add-after" data-oidx="' + i + '" style="padding:4px 8px;font-size:11px">＋ 新增</button>' +
         '<button class="btn-secondary btn-sm ol-del-ch" data-oidx="' + i + '" style="color:var(--error);padding:4px 8px;font-size:11px">✕ 删除</button></div></div>';
    // ===== 玩法 + 衔接 =====
    h += '  <div class="flex-row" style="gap:8px;margin-bottom:6px">' +
         '<div class="flex-1"><div class="text-sm text-muted">玩法</div><div class="ai-field-row"><input id="olPlay_' + i + '" class="llm-input ol-ch-play fs-12" data-oidx="' + i + '" value="' + escHtml(ch.playTags||'') + '" placeholder="标签1·标签2·标签3">' +
         '<button class="ai-suggest-btn" onclick="_aiTargetId=\'olPlay_' + i + '\';_aiChapIdx=' + i + ';openAiPanel(\'V_olChapPlay\')">🤖</button></div></div>' +
         '<div class="flex-1"><div class="text-sm text-muted">衔接<span class="field-tip" title="本章场景是为什么发生的？即调教人为什么要做这件事">?</span></div><div class="ai-field-row"><input id="olLink_' + i + '" class="llm-input ol-ch-link fs-12" data-oidx="' + i + '" value="' + escHtml(ch.link||'') + '" placeholder="为什么发生？调教人的动机...">' +
         '<button class="ai-suggest-btn" onclick="_aiTargetId=\'olLink_' + i + '\';_aiChapIdx=' + i + ';openAiPanel(\'V_olChapLink\')">🤖</button></div></div></div>';
    // ===== 内容 =====
    h += '  <div class="form-group mb-6"><div class="text-sm text-muted">内容</div><div class="ai-field-row">' +
         '<textarea id="olContent_' + i + '" class="ol-ch-content" data-oidx="' + i + '" style="background:var(--bg);color:var(--fg);border:1px solid var(--border);border-radius:3px;font-size:12px;width:100%;min-height:120px;resize:vertical;padding:6px;font-family:inherit" placeholder="核心场景描述…">' + escHtml(ch.content||'') + '</textarea>' +
         '<button class="ai-suggest-btn" onclick="_aiTargetId=\'olContent_' + i + '\';_aiChapIdx=' + i + ';openAiPanel(\'V_olChapContent\')" style="align-self:stretch">🤖</button></div></div>';
    // ===== 字数 + 强度 + 角色 + 场景 =====
    h += '  <div class="flex-row" style="gap:8px;flex-wrap:wrap">' +
         '<div class="w-80"><div class="text-sm text-muted">字数</div><input type="number" class="llm-input ol-ch-wt fs-12" data-oidx="' + i + '" value="' + (ch.wordTarget||4000) + '"></div>' +
         '<div class="w-80"><div class="text-sm text-muted">强度</div><select class="llm-input llm-select ol-ch-ela fs-12" data-oidx="' + i + '">' + ['无','轻度','中度','重度'].map(function(l) { return '<option value="' + l + '"' + (ch.eroticaLevel === l ? ' selected' : '') + '>' + l + '</option>'; }).join('') + '</select></div>' +
         '<div class="flex-1"><div class="text-sm text-muted">出场角色</div><div class="ai-field-row"><input id="olChar_' + i + '" class="llm-input ol-ch-char fs-12" data-oidx="' + i + '" value="' + escHtml((ch.characters||[]).join('、')) + '" placeholder="角色A、角色B">' +
         '<button class="ai-suggest-btn" onclick="_aiTargetId=\'olChar_' + i + '\';_aiChapIdx=' + i + ';openAiPanel(\'V_olChapChar\')">🤖</button></div></div>' +
         '<div class="flex-1"><div class="text-sm text-muted">场景<span class="field-tip" title="本章发生的地点/环境">?</span></div><div class="ai-field-row"><input id="olSet_' + i + '" class="llm-input ol-ch-set fs-12" data-oidx="' + i + '" value="' + escHtml(ch.setting||'') + '" placeholder="发生地点...">' +
         '<button class="ai-suggest-btn" onclick="_aiTargetId=\'olSet_' + i + '\';_aiChapIdx=' + i + ';openAiPanel(\'V_olChapSet\')">🤖</button></div></div></div>';
    h += '</div>';
  });
  // ===== 大纲讨论区已移至上方 =====
  el.innerHTML = h;

  Array.from(el.querySelectorAll('.ol-del-ch')).forEach(function(btn) { btn.addEventListener('click', function() { var i = parseInt(this.getAttribute('data-oidx')); 短oc.splice(i,1); 短renderOutlineList(); 短olAutoSave(); }); });
  Array.from(el.querySelectorAll('.ol-add-after')).forEach(function(btn) { btn.addEventListener('click', function() { var i = parseInt(this.getAttribute('data-oidx')); 短oc.splice(i, 0, {index:i+1,title:'',playTags:'· ·',link:'',content:'',wordTarget:4000,eroticaLevel:'中度',highlight:false,characters:[],setting:''}); 短renderOutlineList(); 短olAutoSave(); }); });
  Array.from(el.querySelectorAll('.ol-regen-ch')).forEach(function(btn) { btn.addEventListener('click', function() { var i = parseInt(this.getAttribute('data-oidx')); _aiChapIdx = i; openAiGenPanel('V_olChapFull'); }); });
  Array.from(el.querySelectorAll('.ol-ch-title')).forEach(function(inp) { inp.addEventListener('change', function() { 短oc[parseInt(this.getAttribute('data-oidx'))].title = this.value; 短olAutoSave(); }); });
  Array.from(el.querySelectorAll('.ol-hl-btn')).forEach(function(btn) {
    btn.addEventListener('click', function() {
      var i = parseInt(this.getAttribute('data-oidx'));
      var ch = 短oc[i];
      ch.highlight = !ch.highlight;
      if (ch.highlight) {
        ch._origWordTarget = ch.wordTarget;
        ch.wordTarget = Math.max(ch.wordTarget || 4000, 8000);
      } else {
        ch.wordTarget = ch._origWordTarget || 4000;
        delete ch._origWordTarget;
      }
      短renderOutlineList();
      短olAutoSave();
    });
  });
  ['ol-ch-play','ol-ch-link','ol-ch-char','ol-ch-set'].forEach(function(cls) {
    Array.from(el.querySelectorAll('.' + cls)).forEach(function(inp) {
      inp.addEventListener('change', function() {
        var i = parseInt(this.getAttribute('data-oidx')); var key = cls.replace('ol-ch-','');
        短oc[i][key === 'play' ? 'playTags' : key === 'char' ? 'characters' : key === 'set' ? 'setting' : key] = this.value;
        if (key === 'char') 短oc[i].characters = this.value.split(/[、,，\s]+/).filter(Boolean);
        短olAutoSave();
      });
    });
  });
  Array.from(el.querySelectorAll('.ol-ch-content')).forEach(function(ta) { ta.addEventListener('change', function() { 短oc[parseInt(this.getAttribute('data-oidx'))].content = this.value; 短olAutoSave(); }); });
  Array.from(el.querySelectorAll('.ol-ch-wt')).forEach(function(inp) { inp.addEventListener('change', function() { 短oc[parseInt(this.getAttribute('data-oidx'))].wordTarget = parseInt(this.value) || 4000; 短olAutoSave(); }); });
  Array.from(el.querySelectorAll('.ol-ch-ela')).forEach(function(sel) { sel.addEventListener('change', function() { 短oc[parseInt(this.getAttribute('data-oidx'))].eroticaLevel = this.value; 短olAutoSave(); }); });
  Array.from(el.querySelectorAll('[draggable]')).forEach(function(item) { item.addEventListener('dragstart', function(e) { e.dataTransfer.setData('text/plain', this.getAttribute('data-oidx')); }); item.addEventListener('dragover', function(e) { e.preventDefault(); }); item.addEventListener('drop', function(e) { e.preventDefault(); var f = parseInt(e.dataTransfer.getData('text/plain')); var t = parseInt(this.getAttribute('data-oidx')); if (f !== t) { var m = 短oc.splice(f,1)[0]; 短oc.splice(t,0,m); 短renderOutlineList(); 短olAutoSave(); } }); });
}

// ===== 大纲讨论 - 聊天功能 =====
var 短olChatMsgs = [];

function 短renderOutlineChat() {
  var el = document.getElementById('olChatMessages');
  if (!el) return;
  if (!短olChatMsgs.length) {
    el.innerHTML = '<div class="text-muted text-sm" style="text-align:center;padding:50px 0">和 AI 讨论大纲内容与设计，然后点击「生成大纲」</div>';
    return;
  }
  var h = '';
  短olChatMsgs.forEach(function(m) {
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

function 短sendOutlineChatMsg() {
  var input = document.getElementById('olChatInput');
  if (!input || !input.value.trim()) return;
  var msg = input.value.trim();
  input.value = '';
  短olChatMsgs.push({ role: 'user', content: msg });

  // 每次调用都加载最新上下文拼入第一条 user 消息，确保 AI 始终知道完整大纲信息
  // LLM API 无状态，不能依赖 AI 记忆
  (typeof 短getOutlineContext === 'function' ? 短getOutlineContext(短ot) : Promise.resolve('')).then(function(ctx) {
    ctx = ctx || '';
    var msgs = [];
    短olChatMsgs.forEach(function(m, idx) {
      if (idx === 0 && m.role === 'user') {
        msgs.push({ role: 'user', content: '当前大纲信息：\n' + ctx + '\n\n---\n\n' + m.content });
      } else {
        msgs.push({ role: m.role, content: m.content });
      }
    });
    短renderOutlineChat();
    var typingEl = document.getElementById('olChatTyping');
    if (typingEl) typingEl.style.display = '';


    LLM.call({ system: '你是一个情色小说大纲创作顾问。正在和作者讨论大纲设计。回复要简洁有建设性，给出具体建议。作者可以随时点击「从讨论生成大纲」来生成正式大纲。', messages: msgs, label: '大纲讨论' }).then(function(reply) {
      if (typingEl) typingEl.style.display = 'none';
      if (!reply) { toast('AI 返回为空'); return; }
      短olChatMsgs.push({ role: 'assistant', content: reply });
      短renderOutlineChat();
    }).catch(function(err) {
      if (typingEl) typingEl.style.display = 'none';
      toast('AI 响应失败: ' + err.message);
    });
  });
}

function 短genOutlineFromChat() {
  if (!短olChatMsgs.length) { toast('请先和 AI 讨论大纲内容'); return; }
  if (!短ot) { toast('请先输入作品标题'); return; }
  // 使用与 AI 重绘大纲完全一致的提示词
  Store.vignette.get(短ot).then(function(m) {
    m = m || {};
    var outline = m.outline || [];
    return 短getOutlineContext(短ot).then(function(ctx) {
      // 已有章节处理：只有存在空白章节时才保留已有大纲内容，否则剔除
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
      // 取最后一次 AI 回复作为讨论内容
      var lastAi = '';
      for (var i = 短olChatMsgs.length - 1; i >= 0; i--) {
        if (短olChatMsgs[i].role === 'assistant') { lastAi = 短olChatMsgs[i].content; break; }
      }
      ctx = ctx + '\n\n【AI 讨论内容】\n' + lastAi;
      ctx = ctx + '\n\n【重要】创作原则——以下所有内容以【AI 讨论内容】为唯一依据：\n1. 方向服从讨论：故事走向、情节设计、角色关系、情色方向等所有核心决策，必须严格遵循讨论中确定的创意方向，不得偏离或自行另起炉灶；\n2. 内容服从讨论：讨论中明确提到的章节设定、玩法、衔接、场景、角色出场等具体内容，必须完整还原到对应章节中，不得遗漏或篡改；\n3. 讨论优先于背景：前文提供的已有大纲章节、标签、角色设定等仅作为背景参考，当背景与讨论方向不一致时，一律以讨论内容为准；\n4. 讨论优先于模板：模板中要求的 JSON 字段结构必须遵守，但所有字段的具体取值一律以讨论内容为准，模板中的示例仅为格式参考。';
      var r = renderPrompt('gen_quick_outline', { ctx: ctx, chapterHint: '精简=1、短篇=3、丰润=5' });

    window._lastPrompt = { prompt: r.user };
    var typingEl = document.getElementById('olChatTyping');
    if (typingEl) typingEl.style.display = '';
    LLM.callJSON({ label: '从讨论生成大纲', prompt: r.user, system: r.system, temperature: 0.7 }).then(function(d) {
      if (typingEl) typingEl.style.display = 'none';
      短oc = d.chapters;
      短oc.forEach(function(ch, i) {
        ch.index = i + 1;
        if (!ch.wordTarget) ch.wordTarget = 4000;
        if (ch.highlight === undefined) ch.highlight = false;
        if (ch.eroticaLevel === undefined) ch.eroticaLevel = '中度';
        if (ch.characters && typeof ch.characters === 'string') ch.characters = ch.characters.split(/[、,，\s]+/).filter(Boolean);
        if (!ch.characters || !Array.isArray(ch.characters)) ch.characters = [];
      });
      短renderOutlineList();
      短olAutoSave();
      toast('大纲已生成（共' + 短oc.length + '章）');
    }).catch(function(err) {
      if (typingEl) typingEl.style.display = 'none';
      toast('大纲生成失败: ' + err.message);
    });
  });
});
}
window.短sendOutlineChatMsg = 短sendOutlineChatMsg;
window.短genOutlineFromChat = 短genOutlineFromChat;

// 即时保存：大纲正文的任何修改立即写入 Store
var 短olSaveTimer = null;
function 短olAutoSave() {
  if (短olSaveTimer) clearTimeout(短olSaveTimer);
  短olSaveTimer = setTimeout(function() {
    if (!短ot || !短oc) return;
    Store.vignette.get(短ot).then(function(m) {
      m = m || {};
      m.outline = 短oc;
      m.ending = 短oe;
      Store.vignette.save(短ot, m);
    });
  }, 300);
}

function 短olAddCh() {
  短oc.push({index:短oc.length+1,title:'',playTags:'· ·',link:'',content:'',wordTarget:4000,eroticaLevel:'中度',highlight:false,characters:[],setting:''});
  短renderOutlineList();
}
function 短olConfirm() { if (!短oc || !短oc.length) { toast('请先生成大纲'); return; } 短olDoConfirm(); }
function 短olDoConfirm() { Store.vignette.get(短ot).then(function(m) { m = m || {}; m.outline = 短oc; m.ending = 短oe; m.status = '写作中'; Store.vignette.save(短ot, m); vignetteCurrentTitle = 短ot; toast('大纲已确认'); 短章切换视图('writing'); }); }
