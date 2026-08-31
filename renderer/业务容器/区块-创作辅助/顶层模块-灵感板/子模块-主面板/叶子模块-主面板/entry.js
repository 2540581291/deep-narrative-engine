// 灵感板 · 主面板
var _inspirations = [];
var _inspireFilter = '';
var _inspireTab = 'list';
var 灵感Api = null;

// 注入按钮动效样式
(function() {
  var style = document.createElement('style');
  style.textContent = `
    .insp-btn { transition: all 0.15s ease; cursor: pointer; }
    .insp-btn:hover { filter: brightness(1.25); transform: translateY(-1px); }
    .insp-btn:active { transform: translateY(0); filter: brightness(0.9); }
    .insp-chip { transition: all 0.15s ease; cursor: pointer; }
    .insp-chip:hover { filter: brightness(1.3); transform: translateY(-1px); }
  `;
  document.head.appendChild(style);
})();

// ===== 存储层：统一走全局 Store.inspiration（createStore），不再维护独立文件目录 =====
// 每个灵感条目 = Store.inspiration 的一个文档，title 为唯一标识，
// 完整数据（content/mood/type/createdAt/_title/_plays/_character）作为 meta 一起存，
// 落盘为 创作辅助/灵感板/<title>/<title>-信息.json

// 生成灵感条目的唯一 title：已有 _fileName 则沿用（去 .json 后缀，含时间戳天然唯一），
// 否则用 名称前20字_时间戳（与旧逻辑一致，保证不冲突）
function 灵感标题(insp) {
  if (insp._fileName) return insp._fileName.replace(/\.json$/i, '');
  var name = insp._title || insp.content || '未命名';
  name = name.replace(/[\/\\?*:|"<>]/g, '').trim().slice(0, 20) || '未命名';
  return name + '_' + Date.now();
}

function 加载灵感() {
  // 统一从 Store.inspiration 读取（list 返回 [{title,_dirName,createdAt,updatedAt,...meta}]）
  return Store.inspiration.list().then(function(items) {
    _inspirations = (items || []).map(function(m) {
      // 把完整字段带回，_fileName 设为 title（兼容既有编辑函数按 _fileName 关联）
      var insp = {};
      Object.keys(m).forEach(function(k) { insp[k] = m[k]; });
      insp._fileName = m.title;
      return insp;
    });
    return _inspirations;
  }).catch(function() { _inspirations = []; return _inspirations; });
}

function saveInspirations() {
  var promises = _inspirations.map(function(insp) {
    var title = 灵感标题(insp);
    insp._fileName = title + '.json';
    var meta = {};
    Object.keys(insp).forEach(function(k) { if (k !== '_fileName') meta[k] = insp[k]; });
    return Store.inspiration.save(title, meta);
  });
  return Promise.all(promises).then(function() {});
}

// 第一层用全局组件「渲染标签栏」渲染成芯片；创建一次后复用 setActive
function 渲染灵感板(el) {
  if (!el) el = document.getElementById('inspirationContent');
  if (!el) return;
  var items = [
    { id: 'list', label: '💡 灵感列表' },
    { id: 'gen',  label: '🎯 灵感生成' },
    { id: 'chat', label: '💬 灵感讨论' },
  ];
  if (!灵感Api) {
    灵感Api = 渲染标签栏(el, items, { active: _inspireTab, onSwitch: function(tab) { 灵感切换类型(tab); } });
  } else {
    灵感Api.setActive(_inspireTab);
  }
  渲染灵感内容();
}

function 灵感切换类型(tab) {
  _inspireTab = tab;
  渲染灵感内容();
}

// 视图内容渲染进组件 sub（嵌套 inspireTabContent）
function 渲染灵感内容() {
  var sub = 灵感Api ? 灵感Api.sub : null;
  if (!sub) return;
  sub.innerHTML = '<div id="inspireTabContent"></div>';
  切换灵感子标签(_inspireTab);
}

function 切换灵感子标签(tab) {
  _inspireTab = tab;
  var el = document.getElementById('inspireTabContent');
  if (!el) return;
  if (灵感Api) 灵感Api.setActive(tab);
  switch (tab) {
    case 'list': 渲染灵感列表(el); break;
    case 'gen':  渲染灵感生成(el); break;
    case 'chat': 渲染灵感讨论(el); break;
  }
}

// ===== 子标签3：灵感讨论 =====
var _chatMessages = [];

function 渲染灵感讨论(el) {
  var h = '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:14px;margin-bottom:10px">';
  h += '<div style="font-size:13px;font-weight:600;color:var(--fg);margin-bottom:2px">💬 灵感讨论</div>';
  h += '<div style="font-size:11px;color:var(--fg2);margin-bottom:8px">和 AI 讨论灵感方向，聊完后将内容提取到灵感生成中。</div>';
  h += '</div>';

  // 聊天记录
  h += '<div id="chatMessages" style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:14px;margin-bottom:10px;min-height:300px;max-height:400px;overflow-y:auto">';
  if (!_chatMessages.length) {
    h += '<div style="text-align:center;padding:60px 20px;color:var(--fg3);font-size:12px">和 AI 讨论你的灵感方向，<br>然后使用下方按钮提取到灵感内容或获取延伸想法。</div>';
  } else {
    _chatMessages.forEach(function(m) {
      if (m.role === 'system') return;
      if (m.role === 'user') {
        h += '<div style="display:flex;justify-content:flex-end;margin-bottom:10px;gap:8px">' +
          '<div style="max-width:75%;background:var(--accent);color:#fff;padding:8px 14px;border-radius:12px 12px 4px 12px;font-size:12px;line-height:1.6;word-break:break-word">' + escHtml(m.content).replace(/\n/g,'<br>') + '</div>' +
          '<div style="width:28px;height:28px;border-radius:50%;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0">我</div></div>';
      } else {
        h += '<div style="display:flex;margin-bottom:10px;gap:8px">' +
          '<div style="width:28px;height:28px;border-radius:50%;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0">🤖</div>' +
          '<div style="max-width:75%;background:var(--bg3);color:var(--fg);padding:8px 14px;border-radius:12px 12px 12px 4px;font-size:12px;line-height:1.6;word-break:break-word">' + escHtml(m.content).replace(/\n/g,'<br>') + '</div></div>';
      }
    });
  }
  h += '<div id="chatTyping" style="display:none;font-size:11px;color:var(--fg2);padding:4px 0">🤖 AI 正在输入...</div>';
  h += '</div>';

  // 输入区
  h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:12px">';
  h += '<textarea id="chatInput" rows="2" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:8px 10px;color:var(--fg);font-size:12px;outline:none;font-family:inherit;resize:vertical;line-height:1.6" placeholder="输入你的想法…"></textarea>';
  h += '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">';
  h += '<button class="btn-sm bg-accent insp-btn" style="padding:6px 14px;border-radius:var(--radius-sm);font-size:11px" onclick="发送讨论消息()">💬 发送</button>';
  h += '<button class="btn-sm insp-btn" style="padding:6px 14px;border-radius:var(--radius-sm);font-size:11px;background:var(--bg3);border:1px solid var(--border);color:var(--fg2)" onclick="提取讨论到灵感()">📥 提取到灵感内容</button>';
  h += '<button class="btn-sm insp-btn" style="padding:6px 14px;border-radius:var(--radius-sm);font-size:11px;background:var(--bg3);border:1px solid var(--border);color:var(--fg2)" onclick="延伸讨论方向()">🔗 提出5个延伸方向</button>';
  h += '<button class="btn-sm bg-accent insp-btn" style="padding:6px 14px;border-radius:var(--radius-sm);font-size:11px" onclick="生成灵感方案()">📝 生成5个灵感方案</button>';
  h += '</div></div>';

  // 预设方向卡片
  h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:12px;margin-top:10px">';
  h += '<div style="font-size:11px;color:var(--fg2);margin-bottom:6px">🎯 不知道往哪个方向？试试这些：</div>';
  h += '<div style="display:flex;gap:4px;flex-wrap:wrap">';
  var _quickDirs = [
    { label: '💢 重口一点', msg: '往更重口的方向调整，增加暴力、强制、疼痛、羞辱等要素，突破极限' },
    { label: '⚡ 反差一点', msg: '增加反差感，让角色身份/外表和实际行为形成强烈对比' },
    { label: '📋 分多阶段', msg: '拆分成多个阶段，从轻到重逐步推进，每个阶段有明确的升级和突破点' },
    { label: '💩 肮脏一点', msg: '增加体液、排泄物、肮脏环境、不讲卫生等肮脏要素，降低底线' },
    { label: '🎭 代入感', msg: '增强第一人称视角的代入感，突出心理活动和感官细节' },
    { label: '🔗 玩法组合', msg: '把2-3种不太相关的玩法组合在一起，制造出人意料的效果' },
    { label: '🏞 切换场景', msg: '换一个完全不同的场景来重新演绎这个方向，保持核心玩法不变' },
    { label: '🆔 切换身份', msg: '换一组完全不同的身份关系来重新演绎这个方向，保持核心玩法不变' },
    { label: '💼 切换职业', msg: '给角色换上不同的职业背景来重新演绎这个方向，保持核心玩法不变' },
    { label: '♀ 改为女性', msg: '把所有角色换成女性，重新演绎这个方向' },
    { label: '⚤ 改为伪娘', msg: '把所有角色换成伪娘，重新演绎这个方向' },
  ];
  _quickDirs.forEach(function(qd) {
    h += '<span class="insp-chip" onclick="快速讨论方向(\'' + escHtml(qd.msg) + '\')" style="font-size:10px;padding:4px 12px;border-radius:12px;cursor:pointer;border:1px solid var(--border);color:var(--fg2);background:var(--bg3)">' + qd.label + '</span>';
  });
  h += '</div></div>';

  el.innerHTML = h;

  // 首次打开时自动发送初始消息
  if (!_chatMessages.length) {
    var initMsg = '我们来讨论色情创作的灵感方向。不要分析、不要给建议、不要列123点。不要以场景中角色的身份说话，不要写角色的台词或内心独白，不要用括号写动作描写。你始终是助手，你写出的内容应该是从外部描述的创作素材，而不是角色在演戏。**本条消息不是素材，第一次必须只回复"收到"两个字，不要写任何其他内容。**';
    var chatInput = document.getElementById('chatInput');
    if (chatInput) chatInput.value = initMsg;
    发送讨论消息();
  }
}

function 快速讨论方向(msg) {
  var input = document.getElementById('chatInput');
  if (input) input.value = msg;
  发送讨论消息();
}
function 发送讨论消息() {
  var input = document.getElementById('chatInput');
  if (!input || !input.value.trim()) return;
  var msg = input.value.trim();
  input.value = '';
  _chatMessages.push({ role: 'user', content: msg });

  var ctx = '';
  _chatMessages.forEach(function(m, idx) {
    if (idx === 0 && m.role === 'user') {
      ctx = '当前讨论方向：\n' + m.content + '\n\n---\n\n';
    }
  });

  渲染讨论消息();
  var typingEl = document.getElementById('chatTyping');
  if (typingEl) typingEl.style.display = '';

  LLM.call({
    system: '',
    messages: _chatMessages.map(function(m) { return { role: m.role, content: m.content }; }),
    label: '灵感讨论',
  }).then(function(reply) {
    if (typingEl) typingEl.style.display = 'none';
    if (!reply) return;
    _chatMessages.push({ role: 'assistant', content: reply });
    渲染讨论消息();
  }).catch(function(err) {
    if (typingEl) typingEl.style.display = 'none';
    toast('AI 响应失败: ' + err.message);
  });
}

function 渲染讨论消息() {
  var el = document.getElementById('chatMessages');
  if (!el) return;
  var h = '';
  _chatMessages.forEach(function(m) {
    if (m.role === 'system') return;
    if (m.role === 'user') {
      h += '<div style="display:flex;justify-content:flex-end;margin-bottom:10px;gap:8px">' +
        '<div style="max-width:75%;background:var(--accent);color:#fff;padding:8px 14px;border-radius:12px 12px 4px 12px;font-size:12px;line-height:1.6;word-break:break-word">' + escHtml(m.content).replace(/\n/g,'<br>') + '</div>' +
        '<div style="width:28px;height:28px;border-radius:50%;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0">我</div></div>';
    } else {
      var extra = '';
      if (m._ideas && m._ideas.length) {
        extra = '<div style="margin-top:8px;border-top:1px solid var(--border);padding-top:6px">';
        m._ideas.forEach(function(idea, i) {
          extra += '<div class="insp-chip" onclick="采用延伸方向(' + i + ')" style="font-size:11px;padding:6px 12px;margin-bottom:4px;border-radius:6px;cursor:pointer;border:1px solid var(--border);background:var(--bg3);line-height:1.5;transition:all 0.15s;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden" title="点击此方向进行调整">' + escHtml(idea) + '</div>';
        });
        extra += '</div>';
      }
      if (m._schemas && m._schemas.length) {
        if (extra) extra += '<div style="margin-top:4px"></div>';
        extra = (extra || '') + '<div style="margin-top:6px;border-top:1px solid var(--border);padding-top:6px">';
        m._schemas.forEach(function(s, i) {
          extra += '<div class="insp-chip" onclick="采用灵感方案(' + i + ')" style="font-size:11px;padding:6px 12px;margin-bottom:4px;border-radius:6px;cursor:pointer;border:1px solid var(--border);background:var(--bg3);line-height:1.5;transition:all 0.15s;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden" title="点击在讨论中完善">' + escHtml(s) + '</div>';
        });
        extra += '</div>';
      }
      h += '<div style="display:flex;margin-bottom:10px;gap:8px">' +
        '<div style="width:28px;height:28px;border-radius:50%;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0">🤖</div>' +
        '<div style="flex:1;min-width:0"><div style="background:var(--bg3);color:var(--fg);padding:8px 14px;border-radius:12px 12px 12px 4px;font-size:12px;line-height:1.6;word-break:break-word">' + escHtml(m.content).replace(/\n/g,'<br>') + '</div>' + extra + '</div></div>';
    }
  });
  el.innerHTML = h;
  el.scrollTop = el.scrollHeight;
}

// 提取最后一条AI回复到灵感内容
function 提取讨论到灵感() {
  var lastAi = '';
  for (var i = _chatMessages.length - 1; i >= 0; i--) {
    if (_chatMessages[i].role === 'assistant') { lastAi = _chatMessages[i].content; break; }
  }
  if (!lastAi) { toast('没有可提取的讨论内容'); return; }
  // 先切到生成标签（渲染 inspireInput），再填入内容
  _inspireTab = 'gen'; // 跳过切换动画
  var el = document.getElementById('inspireTabContent');
  if (el) 渲染灵感生成(el);
  // 更新导航高亮（芯片）
  if (灵感Api) 灵感Api.setActive('gen');
  var ta = document.getElementById('inspireInput');
  if (ta) { ta.value = lastAi; ta.focus(); }
  toast('已提取到最后回复');
}

// 根据当前方向生成5个延伸想法
function 延伸讨论方向() {
  var dirInput = document.getElementById('inspireDirInput');
  var lastAi = '';
  var lastUser = '';
  for (var i = _chatMessages.length - 1; i >= 0; i--) {
    if (_chatMessages[i].role === 'assistant' && !lastAi) lastAi = _chatMessages[i].content;
    if (_chatMessages[i].role === 'user' && !lastUser) lastUser = _chatMessages[i].content;
  }
  var direction = (dirInput ? dirInput.value.trim() : '') || lastUser || '未指定方向';

  var promptText = '当前讨论的方向/内容：\n' + direction;
  if (lastAi) promptText += '\n\n最新AI回复：\n' + lastAi;
  promptText += '\n\n请基于以上内容，提出5个具体的延伸方向或创意扩展点。每个方向用一句话概括，要有可操作性。\n\n输出JSON格式：{"ideas":["方向1","方向2","方向3","方向4","方向5"]}';

  LLM.callJSON({ label: '延伸方向', prompt: promptText, temperature: 0.7 }).then(function(d) {
    if (!d || !d.ideas) { toast('AI 返回格式异常'); return; }
    var ideas = d.ideas.filter(Boolean);
    _chatMessages.push({ role: 'assistant', content: 'AI 提出了 ' + ideas.length + ' 个延伸方向：', _ideas: ideas });
    渲染讨论消息();
  }).catch(function(err) {
    toast('AI 生成失败: ' + err.message);
  });
}

// 生成5个完整灵感方案
function 生成灵感方案() {
  var dirInput = document.getElementById('inspireDirInput');
  var lastAi = '';
  var lastUser = '';
  for (var i = _chatMessages.length - 1; i >= 0; i--) {
    if (_chatMessages[i].role === 'assistant' && !lastAi) lastAi = _chatMessages[i].content;
    if (_chatMessages[i].role === 'user' && !lastUser) lastUser = _chatMessages[i].content;
  }
  var direction = (dirInput ? dirInput.value.trim() : '') || lastUser || '未指定方向';

  var promptText = '当前讨论的方向/内容：\n' + direction;
  if (lastAi) promptText += '\n\n最新AI回复：\n' + lastAi;
  promptText += '\n\n请基于以上内容，直接写出5个完整的灵感片段。每个片段是一个独立场景（150-300字），包含具体的人物、环境、动作和情色描写。要求每个片段可以直接作为创作素材使用，不需要进一步展开。\n\n输出JSON格式：{"schemas":["完整场景1","完整场景2","完整场景3","完整场景4","完整场景5"]}';

  LLM.callJSON({ label: '灵感方案', prompt: promptText, temperature: 0.8 }).then(function(d) {
    if (!d || !d.schemas) { toast('AI 返回格式异常'); return; }
    var schemas = d.schemas.filter(Boolean);
    _chatMessages.push({ role: 'assistant', content: 'AI 生成了 ' + schemas.length + ' 个灵感方案：', _schemas: schemas });
    渲染讨论消息();
  }).catch(function(err) {
    toast('AI 生成失败: ' + err.message);
  });
}

var _windowExportsDone = false;
window.渲染讨论消息 = 渲染讨论消息;
window.提取讨论到灵感 = 提取讨论到灵感;
window.延伸讨论方向 = 延伸讨论方向;
window.生成灵感方案 = 生成灵感方案;

// 点击延伸方向 → 在讨论中进一步丰富
function 采用延伸方向(idx) {
  for (var i = _chatMessages.length - 1; i >= 0; i--) {
    if (_chatMessages[i]._ideas && _chatMessages[i]._ideas[idx]) {
      var idea = _chatMessages[i]._ideas[idx];
      var input = document.getElementById('chatInput');
      if (input) { input.value = '请对这个方向进行丰富和展开：' + idea; }
      发送讨论消息();
      return;
    }
  }
  toast('方向数据异常');
}
window.采用延伸方向 = 采用延伸方向;

// 点击灵感方案 → 在讨论中进一步丰富
function 采用灵感方案(idx) {
  for (var i = _chatMessages.length - 1; i >= 0; i--) {
    if (_chatMessages[i]._schemas && _chatMessages[i]._schemas[idx]) {
      var schema = _chatMessages[i]._schemas[idx];
      var input = document.getElementById('chatInput');
      if (input) { input.value = '请对这个灵感方案进行丰富和完善：' + schema; }
      发送讨论消息();
      return;
    }
  }
  toast('方案数据异常');
}
window.采用灵感方案 = 采用灵感方案;

// 快速预设方向：填入输入框并发送
function 快速讨论方向(msg) {
  var input = document.getElementById('chatInput');
  if (input) input.value = msg;
  发送讨论消息();
}
window.快速讨论方向 = 快速讨论方向;

// ===== 子标签1：灵感列表 =====
function 渲染灵感列表(el) {
  加载灵感().then(function() {
    var originals = _inspirations.filter(function(insp) { return !insp.type || insp.type === 'original'; });
    var quotes = _inspirations.filter(function(insp) { return insp.type === 'quote'; });

    var h = '';

    h += '<div style="display:flex;gap:4px;margin-bottom:16px;flex-wrap:wrap">';
    h += '<span class="' + (!_inspireFilter ? 'tag-chip tag-active' : 'tag-chip') + '" style="font-size:11px;padding:3px 12px;border-radius:var(--radius-sm);cursor:pointer" onclick="_inspireFilter=\'\';渲染灵感列表(document.getElementById(\'inspireTabContent\'))">全部</span>';
    h += '<span class="' + (_inspireFilter === '__original__' ? 'tag-chip tag-active' : 'tag-chip') + '" style="font-size:11px;padding:3px 12px;border-radius:var(--radius-sm);cursor:pointer" onclick="_inspireFilter=\'__original__\';渲染灵感列表(document.getElementById(\'inspireTabContent\'))">💡 原创</span>';
    h += '<span class="' + (_inspireFilter === '__quote__' ? 'tag-chip tag-active' : 'tag-chip') + '" style="font-size:11px;padding:3px 12px;border-radius:var(--radius-sm);cursor:pointer" onclick="_inspireFilter=\'__quote__\';渲染灵感列表(document.getElementById(\'inspireTabContent\'))">📖 摘抄</span>';
    h += '</div>';

    if (!_inspirations.length) {
      h += '<div class="placeholder-text">还没有灵感，切换到「🎯 灵感生成」标签创建吧。</div>';
      el.innerHTML = h;
      return;
    }

    var sorted = _inspirations.slice().reverse();
    if (_inspireFilter === '__original__') sorted = sorted.filter(function(insp) { return !insp.type || insp.type === 'original'; });
    else if (_inspireFilter === '__quote__') sorted = sorted.filter(function(insp) { return insp.type === 'quote'; });
    else if (_inspireFilter) sorted = sorted.filter(function(insp) { return insp.mood === _inspireFilter; });

    if (!sorted.length) { h += '<div class="placeholder-text">没有匹配该分类的灵感</div>'; el.innerHTML = h; return; }

    function renderCard(insp, listIdx) {
      var type = (!insp.type || insp.type === 'original') ? 'original' : 'quote';
      var typeLabel = (!insp.type || insp.type === 'original') ? '💡 原创' : '📖 摘抄';
      var accentColor = type === 'original' ? 'var(--accent2)' : '#4a8a6a';
      var isAiGen = insp._title ? true : false;
      return '<div style="background:var(--bg2);border-radius:var(--radius);border:1px solid var(--border);overflow:hidden;transition:.2s">' +
        '<div style="height:3px;background:linear-gradient(90deg,' + accentColor + ',' + (type === 'original' ? '#ff6b8a' : '#6aaa80') + ')"></div>' +
        '<div style="padding:12px 14px">' +
        '<div style="font-size:10px;color:var(--fg3);letter-spacing:1px;margin-bottom:4px;display:flex;gap:6px;align-items:center">' +
        '<span onclick="切换灵感类型(' + listIdx + ')" style="cursor:pointer;padding:1px 8px;border-radius:3px;background:' + (type === 'original' ? 'rgba(233,69,96,.1)' : 'rgba(74,138,106,.1)') + ';border:1px solid ' + accentColor + ';color:' + accentColor + '" title="点击切换原创/摘抄">' + typeLabel + '</span>' +
        (insp.mood ? '<span style="color:var(--fg3)">🏷 ' + escHtml(insp.mood) + '</span>' : '') + '</div>' +
        (isAiGen ?
          '<div style="font-size:14px;font-weight:600;color:var(--fg);margin-bottom:6px;line-height:1.4">' + escHtml(insp._title) + '</div>' +
          (insp._plays ? '<div style="font-size:11px;color:var(--accent2);margin-bottom:6px">🎯 ' + escHtml(insp._plays) + '</div>' : '') +
          (insp._character ? '<div style="font-size:11px;color:var(--fg2);margin-bottom:8px;white-space:pre-line">👤 ' + escHtml(insp._character) + '</div>' : '') +
          '<div style="font-size:13px;line-height:1.7;color:var(--fg);display:-webkit-box;-webkit-line-clamp:6;-webkit-box-orient:vertical;overflow:hidden">' + escHtml(insp.content) + '</div>'
        :
          '<div style="font-size:13px;line-height:1.7;color:var(--fg);display:-webkit-box;-webkit-line-clamp:6;-webkit-box-orient:vertical;overflow:hidden">' + escHtml(insp.content) + '</div>'
        ) + '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;border-top:1px solid var(--border)">' +
        '<div style="font-size:10px;color:var(--fg3)">' + (insp.createdAt || '') + '</div>' +
        '<div style="display:flex;gap:3px;flex-wrap:wrap;justify-content:flex-end">' +
        '<button class="btn-sm insp-btn" style="padding:2px 8px;font-size:10px;background:none;border:none;color:var(--fg2);cursor:pointer;border-radius:3px" onclick="发展灵感(' + listIdx + ')">✍ 发展</button>' +
        '<button class="btn-sm insp-btn" style="padding:2px 8px;font-size:10px;background:none;border:none;color:var(--fg2);cursor:pointer;border-radius:3px" onclick="AI分类氛围(' + listIdx + ')">🏷 分类</button>' +
        '<button class="btn-sm insp-btn" style="padding:2px 8px;font-size:10px;background:none;border:none;color:var(--fg2);cursor:pointer;border-radius:3px" onclick="AI润色灵感(' + listIdx + ')">✨ 润色</button>' +
        (insp._prevContent ? '<button class="btn-sm insp-btn" style="padding:2px 8px;font-size:10px;background:none;border:none;color:var(--fg2);cursor:pointer;border-radius:3px" onclick="取消润色(' + listIdx + ')">↩ 回退</button>' : '') +
        '<button class="btn-sm insp-btn" style="padding:2px 8px;font-size:10px;background:none;border:none;color:var(--fg2);cursor:pointer;border-radius:3px" onclick="编辑灵感(' + listIdx + ')">✏ 编辑</button>' +
        '<button class="btn-sm insp-btn" style="padding:2px 8px;font-size:10px;background:none;border:none;color:var(--error);cursor:pointer;border-radius:3px" onclick="删除灵感(' + listIdx + ')">✕ 删除</button>' +
        '</div></div></div>';
    }

    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px">';
    sorted.forEach(function(insp, idx) { h += renderCard(insp, idx); });
    h += '</div>';
    el.innerHTML = h;
  });
}

// ===== 子标签2：灵感生成（内联AI面板，无弹窗） =====
var _genPresets = [
  { group: '反差破局', options: [
    { text: '纯洁×重口', append: '表面最纯洁的人做着最重口的事——圣女、幼师、清纯偶像私下是重度调教奴' },
    { text: '日常×异常', append: '在最日常的场景里插入最不日常的玩法——外卖员、快递员、维修工上门时顺便调教' },
    { text: '公开×私密', append: '在人前保持体面，人后完全放荡——餐桌下遥控、会议中震动、晚宴时灌肠' },
    { text: '科技×原始', append: '用最尖端的科技做最原始的事——VR触觉同步、AI控制高潮、脑机接口调教' },
    { text: '童话×暗黑', append: '把童话/动漫/游戏等熟悉IP改写成暗黑情色版本——用既有期待制造反差冲击' },
  ]},
  { group: '权力游戏', options: [
    { text: '上位者坠落', append: '让最高位的人跪下来——女帝、CEO、将军、女王变成最低贱的性奴' },
    { text: '规则重塑', append: '重新定义游戏规则——猎物变成猎人、主人变成狗、强者变成肉便器' },
    { text: '制度崩塌', append: '在严密的制度/规则/等级体系下彻底崩坏的秩序感' },
    { text: '忠诚变质', append: '从绝对的忠诚转变到绝对的占有——守护者与被守护者的关系变质' },
    { text: '集体羞辱', append: '当着众人的面让一个人彻底失去尊严——公开审判、当众处刑、全校围观的羞辱' },
  ]},
  { group: '融合跨界', options: [
    { text: '武侠色情', append: '用武功心法做性技、用内功双修、用点穴控制高潮——武侠世界的色情体系' },
    { text: '赛博纵欲', append: '义体改造性器官、脑机接口共享快感、数字意识在虚拟空间交媾' },
    { text: '克苏鲁肉欲', append: '触手、异形、不可名状的存在与人类的肉体交融——恐怖与快感的边界模糊' },
    { text: '末世狂欢', append: '末日崩塌之下的一切道德崩坏——资源换肉体、安保队长享用避难所女性' },
    { text: '历史重写', append: '把真实历史人物/事件改写为情色版本——知名字人、著名事件的另类诠释' },
  ]},
  { group: '极端体验', options: [
    { text: '感官过载', append: '同时刺激所有感官——视觉剥夺、触觉放大、多重高潮的极限体验设计' },
    { text: '时间拉长', append: '把极短的时间无限拉长、把极长的时间缩短——时间感知扭曲下的性爱体验' },
    { text: '数量碾压', append: '以数量对抗质量——群交、轮奸、持续不断的多人与单人的数量差' },
    { text: '改造进化', append: '身体被逐渐改造的过程——从抗拒到接受、从羞耻到渴望、从人类到玩具' },
    { text: '阈值突破', append: '不断突破承受极限——从轻微到重度、从接受到渴望更严重的渐进过程' },
  ]},
  { group: '叙事技巧', options: [
    { text: '视角反转', append: '从另一个角色的视角讲述同一个故事——施虐者的内心、旁观者的日记、物品的第一人称' },
    { text: '时间切片', append: '浓缩小段时间或放大片刻——一天中的关键10分钟、或者一秒钟被展开成完整场景' },
    { text: '循环结构', append: '同一件事反复发生但每次都有微妙变化——仪式化的日常、逐渐加码的调教流程' },
    { text: '多线交织', append: '多个角色/多条线索同时推进最后交汇——不同视角下的同一事件' },
    { text: '倒叙揭谜', append: '先展示结果再回溯成因——一个完全驯化的人、一个彻底崩坏的角色如何走到这一步' },
  ]},
];

function 渲染灵感生成(el) {
  var h = '';

  // ===== 卡片1：内容输入 =====
  h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:12px">';
  h += '<div style="display:flex;gap:8px;align-items:flex-start">';
  h += '<textarea id="inspireInput" rows="3" style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;color:var(--fg);font-size:13px;outline:none;font-family:inherit;resize:vertical;line-height:1.6" placeholder="输入灵感内容或方向描述…"></textarea>';
  h += '<button class="btn-sm insp-btn" style="padding:8px 14px;border-radius:var(--radius-sm);font-size:11px;background:none;border:1px solid #2a4a3a;color:#4a8a6a;flex-shrink:0" onclick="打开玩法参考选择器(function(t){var ta=document.getElementById(\'inspireInput\');if(ta){var cur=ta.value.trim();ta.value=cur?cur+\'\\n\\n\'+t:t;ta.focus();ta.scrollTop=ta.scrollHeight;}})">📖 玩法参考</button>';
  h += '</div></div>';

  // ===== 卡片2：生成选项（角色卡风格） =====
  h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px">';
  h += '<div class="fs-13 fw-600 c-fg mb-2">🎯 生成灵感</div>';
  h += '<div class="fs-11 c-fg2 mb-10">选择方向标签，自动填入输入框。可多选，用顿号分隔组合。</div>';

  for (var g = 0; g < _genPresets.length; g++) {
    var group = _genPresets[g];
    h += '<div class="fs-10 c-fg3 mb-2">' + escHtml(group.group) + '</div>';
    h += '<div class="flex flex-wrap gap-2 mb-4">';
    for (var c = 0; c < group.options.length; c++) {
      h += '<span class="tag-chip insp-chip" style="cursor:pointer;padding:1px 5px;font-size:9px" onclick="灵感追加芯片(' + g + ',' + c + ')">'
        + escHtml(group.options[c].text) + '</span>';
    }
    h += '</div>';
  }

  h += '<input id="inspireDirInput" class="llm-input" style="width:100%;font-size:12px;margin-top:4px" placeholder="点击上方标签组合方向，或直接输入…">';
  h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">';
  h += '<button class="btn-sm bg-accent insp-btn" style="padding:8px 20px;border-radius:var(--radius-sm);font-size:12px" onclick="内联AI生成灵感()">🎯 生成</button>';
  h += '<button class="btn-sm insp-btn" style="padding:8px 16px;border-radius:var(--radius-sm);font-size:11px;background:var(--bg3);border:1px solid var(--border);color:var(--fg2)" onclick="直接录入灵感()">📝 录入为摘抄</button>';
  h += '</div></div>';

  el.innerHTML = h;
}

window.灵感追加芯片 = function(g, c) {
  var chip = _genPresets[g].options[c];
  var input = document.getElementById('inspireDirInput');
  if (!input) return;
  var cur = input.value.trim();
  input.value = cur ? cur + '、' + chip.append : chip.append;
  input.focus();
};


function 内联AI生成灵感() {
  var input = document.getElementById('inspireInput');
  var dirInput = document.getElementById('inspireDirInput');
  var baseText = input ? input.value.trim() : '';
  var direction = dirInput ? dirInput.value.trim() : '';
  var promptText = '';
  if (baseText) promptText += '以下是一段灵感内容：\n' + baseText + '\n\n';
  promptText += '请以这段内容为底本，按照方向要求进行改写。';
  if (direction) promptText += '\n方向要求：' + direction;
  promptText += '\n\n输出JSON格式：{"title":"一句话概括","plays":"玩法组合","character":"角色A：描述\\n角色B：描述（每个角色占一行）","scene":"场景片段100-200字"}';

  LLM.callJSON({ label: '灵感生成', prompt: promptText, temperature: 0.7 }).then(function(d) {
    if (!d) { toast('AI 返回格式异常'); return; }
    var scene = d.scene || d.content || '';
    var title = d.title || '';
    var plays = d.plays || '';
    var character = d.character || '';
    _inspirations.push({
      content: scene.trim(),
      mood: '', type: 'original', createdAt: fmtDate(new Date()),
      _title: title, _plays: plays, _character: character,
    });
    saveInspirations().then(function() {
      document.getElementById('inspireDirInput').value = '';
      切换灵感子标签('list');
      toast('灵感已生成');
    });
  }).catch(function(err) {
    toast('AI 生成失败: ' + err.message);
  });
}

// ===== 公用操作函数 =====
function 删除灵感(idx) {
  confirmDialog('确定删除这条灵感？', function() {
    var realIdx = _inspirations.length - 1 - idx;
    var removed = _inspirations.splice(realIdx, 1)[0];
    if (removed && removed._fileName) {
      Store.inspiration.delete(removed._fileName.replace(/\.json$/i, '')).catch(function(){});
    }
    渲染灵感列表(document.getElementById('inspireTabContent'));
  });
}

function 发展灵感(idx) {
  var realIdx = _inspirations.length - 1 - idx;
  var insp = _inspirations[realIdx];
  if (!insp) return;
  var content = insp.content ? insp.content.trim() : '';
  if (!content) { toast('灵感内容为空'); return; }
  var title = insp._title || ('灵感_' + fmtDate(new Date()).slice(5, 16));
  if (Store.vignette) {
    Store.vignette.save(title, { title: title, status: '规划中', createdAt: fmtDate(new Date()), premise: content }).then(function() {
      window.location.hash = '#vignette';
      toast('灵感已发送到情色短章');
    });
  } else {
    toast('情色短章模块未加载，无法发展灵感');
  }
}

function AI分类氛围(idx) {
  window._classifyInspirationIdx = idx;
  openAiGenPanel('inspiration_classify');
}

function AI润色灵感(idx) {
  window._polishInspirationIdx = idx;
  openAiGenPanel('inspiration_polish');
}

function 取消润色(idx) {
  var realIdx = _inspirations.length - 1 - idx;
  var insp = _inspirations[realIdx];
  if (!insp || !insp._prevContent) { toast('没有可回退的版本'); return; }
  insp.content = insp._prevContent; delete insp._prevContent;
  saveInspirations().then(function() { 渲染灵感列表(document.getElementById('inspireTabContent')); });
  toast('已回退到润色前');
}

function 编辑灵感(idx) {
  var realIdx = _inspirations.length - 1 - idx;
  var insp = _inspirations[realIdx];
  if (!insp) return;
  var html = '<div class="mcard" style="max-width:720px;width:90vw">';
  html += '<h3 class="fs-14 mb-8">✏ 编辑灵感</h3>';
  html += '<textarea id="editInspireContent" style="width:100%;min-height:300px;resize:vertical;background:var(--bg);color:var(--fg);border:1px solid var(--border);border-radius:4px;padding:10px;font-size:13px;font-family:inherit;line-height:1.7">' + escHtml(insp.content) + '</textarea>';
  html += '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:8px">';
  html += '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>';
  html += '<button class="btn-main" onclick="保存编辑灵感(' + idx + ')">💾 保存</button></div></div>';
  var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = html;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  setTimeout(function() { var ta = document.getElementById('editInspireContent'); if (ta) ta.focus(); }, 100);
}

function 保存编辑灵感(idx) {
  var realIdx = _inspirations.length - 1 - idx;
  var insp = _inspirations[realIdx];
  if (!insp) return;
  var ta = document.getElementById('editInspireContent');
  if (!ta || !ta.value.trim()) { toast('内容不能为空'); return; }
  insp.content = ta.value.trim();
  saveInspirations().then(function() { toast('灵感已更新'); 渲染灵感列表(document.getElementById('inspireTabContent')); });
}

function 直接录入灵感() {
  var input = document.getElementById('inspireInput');
  if (!input || !input.value.trim()) { toast('请输入灵感内容'); return; }
  _inspirations.push({ content: input.value.trim(), mood: '', type: 'quote', createdAt: fmtDate(new Date()) });
  saveInspirations().then(function() { input.value = ''; 切换灵感子标签('list'); toast('灵感已录入'); });
}

function 切换灵感类型(idx) {
  var realIdx = _inspirations.length - 1 - idx;
  var insp = _inspirations[realIdx];
  if (!insp) return;
  insp.type = (!insp.type || insp.type === 'original') ? 'quote' : 'original';
  saveInspirations().then(function() { 渲染灵感列表(document.getElementById('inspireTabContent')); });
}
// Register page route
registerPageRoute('inspiration', function() {
  var el = document.getElementById('inspirationContent');
  if (el) 渲染灵感板(el);
});

window.渲染灵感板 = 渲染灵感板;
window.渲染灵感列表 = 渲染灵感列表;
window.渲染灵感生成 = 渲染灵感生成;
window.切换灵感子标签 = 切换灵感子标签;
window.加载灵感 = 加载灵感;
window.删除灵感 = 删除灵感;
window.发展灵感 = 发展灵感;
window.编辑灵感 = 编辑灵感;
window.保存编辑灵感 = 保存编辑灵感;
window.AI分类氛围 = AI分类氛围;
window.AI润色灵感 = AI润色灵感;
window.取消润色 = 取消润色;
window.直接录入灵感 = 直接录入灵感;
window.切换灵感类型 = 切换灵感类型;
