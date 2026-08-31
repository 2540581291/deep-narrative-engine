// 深度-叙事引擎 · 角色卡 · 讨论创作子模块
// 左右分栏：左列角色选择 + 操作，右列聊天界面

var 讨论 = {
  当前角色: null,
  当前条目: null,
  当前分类: '',
  当前ID: '',
  性别: 'female',
  消息列表: [],
  加载中: false,
  提取面板: null,
  提取输入: false,  // 是否显示提取输入框
};
var 讨论角色映射 = [];

function 渲染角色讨论面板() {
  var h = '';
  h += '<div style="display:flex;gap:12px;height:calc(100vh - 200px);min-height:420px;margin-top:8px">';

  // ===== 左栏 =====
  h += '<div style="width:240px;flex-shrink:0;display:flex;flex-direction:column;gap:6px">';
  h += '<div style="font-size:14px;font-weight:600;color:var(--fg);margin-bottom:2px">💬 角色讨论</div>';

  if (讨论.当前角色) {
    var bn = 讨论.当前角色.identity && 讨论.当前角色.identity.basicInfo && 讨论.当前角色.identity.basicInfo.name || '未命名';
    h += '<div style="font-size:11px;color:var(--accent2);background:var(--accent-dim);padding:4px 8px;border-radius:4px">📎 ' + escHtml(bn) + '</div>';
  } else {
    h += '<div style="font-size:11px;color:var(--fg3);padding:4px 8px">✨ 从零创作模式</div>';
  }
  h += '<div class="bt-border" style="margin:4px 0"></div>';

  h += '<button class="btn btn-outline btn-sm" onclick="讨论从零创作()">✨ 从零创作</button>';
  h += '<button class="btn btn-outline btn-sm" onclick="讨论清空对话()" style="font-size:10px">🗑️ 清空对话</button>';
  h += '<div class="bt-border" style="margin:4px 0"></div>';

  h += '<div style="font-size:11px;color:var(--fg2);margin-bottom:2px">加载已有角色</div>';
  h += '<div class="flex gap-4" style="margin-bottom:4px">';
  for (var _ci = 0; _ci < 类别键数组.length; _ci++) {
    var k = 类别键数组[_ci];
    var info = 角色类别映射[k];
    var gc = S.generatedCharacters && S.generatedCharacters[k] ? Object.keys(S.generatedCharacters[k]).length : 0;
    var sel = 讨论.性别 === k;
    h += '<div class="char-cat-tab flex-1' + (sel ? ' act' : '') + '" onclick="讨论切换性别(\'' + k + '\')">';
    h += '<div class="char-cat-tab-icon">' + info.icon + '</div>';
    h += '<div class="char-cat-tab-label">' + info.label + (gc ? ' ' + gc : '') + '</div>';
    h += '</div>';
  }
  h += '</div>';

  h += '<div style="flex:1;overflow-y:auto;border:1px solid var(--border);border-radius:4px;background:var(--bg2)">';
  h += 渲染角色列表();
  h += '</div>';
  h += '</div>'; // 左栏结束

  // ===== 右栏：聊天区 =====
  h += '<div style="flex:1;display:flex;flex-direction:column;border:1px solid var(--border);border-radius:8px;overflow:hidden;background:var(--bg2)">';

  h += '<div id="charDiscussMessages" style="flex:1;overflow-y:auto;padding:14px;font-size:12px;line-height:1.8">';
  if (讨论.消息列表.length === 0) {
    h += '<div style="text-align:center;padding:40px 20px;color:var(--fg3)">';
    h += '<div style="font-size:28px;margin-bottom:8px">💬</div>';
    if (讨论.当前角色) {
      h += '<div style="font-size:12px;margin-bottom:4px">发送消息讨论此角色的修改方向</div>';
    } else {
      h += '<div style="font-size:12px;margin-bottom:4px">从左侧选择一个已有角色，或点击「从零创作」开始</div>';
    }
    h += '</div>';
  } else {
    for (var _mi = 0; _mi < 讨论.消息列表.length; _mi++) {
      h += 渲染消息(讨论.消息列表[_mi]);
    }
  }
  h += '</div>';

  // 提取面板
  if (讨论.提取面板) {
    h += 渲染提取面板();
  }

  // 提取输入框
  if (讨论.提取输入) {
    h += '<div style="border-top:1px solid var(--accent2);padding:10px;background:var(--accent-dim)">';
    h += '<div style="font-size:11px;font-weight:600;color:var(--accent2);margin-bottom:6px">📋 提取角色 JSON</div>';
    h += '<div style="font-size:10px;color:var(--fg2);margin-bottom:6px">输入对提取结果的要求（可选），直接发送将按当前讨论输出：</div>';
    h += '<textarea id="extractInput" rows="3" style="width:100%;font-size:12px;padding:6px 8px;border:1px solid var(--border);border-radius:4px;background:var(--bg2);color:var(--fg);resize:vertical;font-family:inherit;outline:none;box-sizing:border-box" placeholder="例如：只提取外貌部分 / 用表格对比修改前后 / 输出精简版…"></textarea>';
    h += '<div style="display:flex;gap:6px;margin-top:6px">';
    h += '<button class="btn btn-primary btn-sm" style="font-size:10px;flex:1" onclick="讨论执行提取()">🚀 提取</button>';
    h += '<button class="btn btn-outline btn-sm" style="font-size:10px" onclick="讨论取消提取()">✕ 取消</button>';
    h += '</div></div>';
  }

  // 操作按钮栏
  if (讨论.消息列表.length > 0) {
    h += '<div style="display:flex;gap:6px;padding:6px 10px;border-top:1px solid var(--border);background:var(--bg)">';
    h += '<span style="font-size:10px;padding:3px 10px;border:1px solid var(--border);border-radius:4px;cursor:pointer;color:var(--fg2)" onclick="讨论打开提取()">📋 提取角色 JSON</span>';
    if (讨论.当前角色) {
      h += '<span style="font-size:10px;padding:3px 10px;border:1px solid var(--accent2);border-radius:4px;cursor:pointer;color:var(--accent2);font-weight:600" onclick="讨论应用修改()">💾 应用修改</span>';
    }
    h += '</div>';
  }

  // 输入区
  h += '<div style="border-top:1px solid var(--border);padding:8px 10px;background:var(--bg)">';
  h += '<div style="display:flex;gap:8px">';
  h += '<textarea id="discussInput" rows="2" style="flex:1;font-size:12px;padding:8px 10px;border:1px solid var(--border);border-radius:4px;background:var(--bg2);color:var(--fg);resize:none;font-family:inherit;outline:none" placeholder="' + (讨论.当前角色 ? '输入修改想法…' : '描述你想要创造的角色…') + '" onkeydown="讨论处理回车(event)"></textarea>';
  h += '<button class="btn btn-primary" style="font-size:12px;padding:6px 14px;align-self:flex-end" onclick="讨论发送()">发送</button>';
  h += '</div></div>';

  h += '</div>'; // 右栏结束
  h += '</div>'; // 外层 flex 结束
  return h;
}

function 渲染角色列表() {
  讨论角色映射 = [];
  var genMap = S.generatedCharacters && S.generatedCharacters[讨论.性别];
  if (!genMap || !Object.keys(genMap).length) {
    return '<div style="padding:20px;text-align:center;font-size:11px;color:var(--fg3)">暂无角色</div>';
  }
  var ids = Object.keys(genMap).sort(function(a, b) {
    return (genMap[b].createdAt || 0) - (genMap[a].createdAt || 0);
  });
  var h = '';
  var idx = 0;
  for (var _ri = 0; _ri < ids.length; _ri++) {
    var id = ids[_ri];
    var entry = genMap[id];
    if (entry.phase !== 'full') continue;
    var ch = entry.fullChar || entry.outline || {};
    var bi = ch.identity && ch.identity.basicInfo || {};
    var name = bi.name || id;
    var rarity = bi.rarity || '';
    var rarityColor = { '金': 'var(--accent2)', '紫': 'var(--accent)', '蓝': 'var(--fg2)', '绿': 'var(--success)', '白': 'var(--fg3)' }[rarity] || 'var(--fg3)';
    var active = 讨论.当前ID === id && 讨论.当前分类 === 讨论.性别;

    h += '<div style="display:flex;align-items:center;gap:6px;padding:6px 8px;cursor:pointer;transition:background 0.12s;border-bottom:1px solid rgba(255,255,255,0.03);background:' + (active ? 'var(--accent-dim)' : 'var(--bg2)') + '" onclick="讨论点击角色(' + idx + ')">';
    h += '<span style="font-size:12px;font-weight:600;color:var(--fg);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(name) + '</span>';
    if (rarity) h += '<span style="font-size:9px;color:' + rarityColor + ';font-weight:600">' + rarity + '</span>';
    h += '</div>';
    讨论角色映射[idx] = { cat: 讨论.性别, id: id };
    idx++;
  }
  return h;
}

function 渲染消息(msg) {
  // Diff 变更对比
  if (msg.type === 'diff' && msg.diffHtml) {
    return '<div style="display:flex;flex-direction:column;align-items:center;margin-bottom:10px">' + msg.diffHtml + '</div>';
  }

  var isUser = msg.role === 'user';

  var h = '<div style="display:flex;flex-direction:column;margin-bottom:12px">';
  h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;padding:0 4px">';
  h += '<span style="font-size:9px;color:var(--fg3);font-weight:600">' + (isUser ? '你' : 'AI') + '</span>';
  if (!isUser) {
    h += '<span style="font-size:8px;color:var(--fg3);background:var(--bg);padding:1px 6px;border-radius:2px;border:1px solid var(--border)">角色顾问</span>';
  }
  h += '</div>';

  if (isUser) {
    h += '<div style="padding:8px 14px;border-radius:6px;background:var(--accent);color:#fff;font-size:12px;line-height:1.7;max-width:80%;align-self:flex-end;word-wrap:break-word">' + escHtml(msg.content) + '</div>';
  } else {
    h += '<div style="padding:8px 14px;border-radius:6px;background:var(--bg);color:var(--fg);font-size:12px;line-height:1.8;max-width:88%;align-self:flex-start;word-wrap:break-word;border-left:2px solid var(--accent2)">';
    var content = msg.content;
    if (msg.isStreaming) {
      content = msg.content + '<span style="animation:blink 1s infinite">▊</span>';
    }
    h += 渲染AI内容(content);
    h += '</div>';
  }
  h += '</div>';
  return h;
}

function 渲染AI内容(content) {
  var result = '';
  // 按代码块分割，代码块原样保留
  var parts = content.split(/(```[\s\S]*?```)/);
  for (var pi = 0; pi < parts.length; pi++) {
    var p = parts[pi];
    if (!p) continue;
    if (p.startsWith('```')) {
      var code = p.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
      result += '<div style="margin:6px 0;padding:8px 10px;background:var(--bg2);border:1px solid var(--accent2);border-radius:4px;font-size:10px;font-family:monospace;white-space:pre-wrap;max-height:200px;overflow-y:auto;color:var(--accent2);line-height:1.5">' + escHtml(code) + '</div>';
    } else {
      result += 渲染Markdown(p);
    }
  }
  return result || escHtml(content);
}

function 渲染Markdown(text) {
  text = text.trim();
  if (!text) return '';

  // 1. 分割行
  var lines = text.split('\n');
  var h = '';
  var inTable = false;
  var tableRows = [];

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var trimmed = line.trim();

    // 表格处理
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      // 表头分隔行（| --- | --- |）跳过
      if (/^\|[\s:-]+\|$/.test(trimmed)) continue;
      tableRows.push(trimmed);
      inTable = true;
      // 下一行不是表格时输出
      if (i + 1 >= lines.length || !lines[i + 1].trim().startsWith('|')) {
        h += 渲染表格(tableRows);
        tableRows = [];
        inTable = false;
      }
      continue;
    }
    if (inTable) {
      // 表格打断，输出之前收集的
      h += 渲染表格(tableRows);
      tableRows = [];
      inTable = false;
    }

    // 分割线
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(trimmed)) {
      h += '<hr style="border:none;border-top:1px solid var(--border);margin:8px 0">';
      continue;
    }

    // 标题 ## 或 ###
    var headingMatch = trimmed.match(/^(#{2,3})\s+(.+)/);
    if (headingMatch) {
      var level = headingMatch[1].length === 2 ? 14 : 12;
      h += '<div style="font-size:' + level + 'px;font-weight:700;color:var(--fg);margin:10px 0 4px 0">' + 渲染行内(headingMatch[2]) + '</div>';
      continue;
    }

    // 无序列表 - item
    var listMatch = trimmed.match(/^[-*]\s+(.+)/);
    if (listMatch) {
      h += '<div style="padding:1px 0 1px 14px;font-size:12px;line-height:1.7">• ' + 渲染行内(listMatch[1]) + '</div>';
      continue;
    }

    // 有序列表 1. item
    var olMatch = trimmed.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      h += '<div style="padding:1px 0 1px 14px;font-size:12px;line-height:1.7">' + (i + 1) + '. ' + 渲染行内(olMatch[1]) + '</div>';
      continue;
    }

    // 普通段落
    if (trimmed) {
      h += '<div style="margin-bottom:4px;font-size:12px;line-height:1.8">' + 渲染行内(trimmed) + '</div>';
    } else {
      h += '<div style="height:4px"></div>'; // 空行作间距
    }
  }

  return h;
}

function 渲染表格(rows) {
  if (!rows || rows.length < 2) return '';
  var h = '<div style="overflow-x:auto;margin:6px 0">';
  h += '<table style="width:100%;border-collapse:collapse;font-size:11px;line-height:1.6">';
  for (var ri = 0; ri < rows.length; ri++) {
    var cells = rows[ri].split('|').filter(Boolean);
    var tag = ri === 0 ? 'th' : 'td';
    h += '<tr>';
    for (var ci = 0; ci < cells.length; ci++) {
      h += '<' + tag + ' style="border:1px solid var(--border);padding:4px 8px;text-align:left;color:var(--fg)">' + 渲染行内(cells[ci].trim()) + '</' + tag + '>';
    }
    h += '</tr>';
  }
  h += '</table></div>';
  return h;
}

function 渲染行内(text) {
  // 先转义 HTML，再处理行内 Markdown
  var s = escHtml(text);
  // **粗体**
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--fg);font-weight:700">$1</strong>');
  // *斜体*
  s = s.replace(/\*(.+?)\*/g, '<em style="font-style:italic;color:var(--fg2)">$1</em>');
  // `行内代码`
  s = s.replace(/`([^`]+)`/g, '<code style="background:var(--bg2);padding:1px 5px;border-radius:3px;font-size:10px;border:1px solid var(--border)">$1</code>');
  return s;
}

// ===== 操作函数 =====

window.讨论切换性别 = function(g) {
  讨论.性别 = g;
  渲染讨论面板();
};

window.讨论点击角色 = function(idx) {
  var item = 讨论角色映射[idx];
  if (!item) return;
  讨论.性别 = item.cat;
  讨论加载角色(item.id);
};

window.讨论加载角色 = function(id) {
  var entry = S.generatedCharacters && S.generatedCharacters[讨论.性别] && S.generatedCharacters[讨论.性别][id];
  if (!entry) { toast('角色数据不存在'); return; }
  var char = entry.fullChar || entry.outline;
  if (!char) { toast('角色数据不完整'); return; }

  讨论.当前角色 = JSON.parse(JSON.stringify(char));
  讨论.当前条目 = entry;
  讨论.当前分类 = 讨论.性别;
  讨论.当前ID = id;
  讨论.消息列表 = [];
  讨论.加载中 = false;

  讨论.消息列表.push({ role: 'assistant', content: '已加载角色「' + (char.identity.basicInfo.name || id) + '」。你可以讨论如何修改完善，确认方案后我会输出角色 JSON。' });
  渲染讨论面板();
};

window.讨论从零创作 = function() {
  讨论.当前角色 = null;
  讨论.当前条目 = null;
  讨论.当前分类 = '';
  讨论.当前ID = '';
  讨论.消息列表 = [];
  讨论.加载中 = false;

  讨论.消息列表.push({ role: 'assistant', content: '开始从零创作！描述你想要的角色类型、世界观或任何想法，我来帮你构思完善。' });
  渲染讨论面板();
};

// 回车发送，Shift+回车换行
window.讨论处理回车 = function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    讨论发送();
  }
};

window.讨论清空对话 = function() {
  if (讨论.消息列表.length === 0) return;
  if (!confirm('确认清空所有对话记录？')) return;
  讨论.消息列表 = [];
  讨论.加载中 = false;
  渲染讨论面板();
};

window.讨论发送 = function() {
  var input = document.getElementById('discussInput');
  if (!input) return;
  var text = input.value.trim();
  if (!text) { toast('请输入内容'); return; }
  if (讨论.加载中) { toast('请等待回复完成'); return; }

  input.value = '';
  讨论.消息列表.push({ role: 'user', content: text });
  讨论.加载中 = true;
  渲染讨论面板();
  滚动到底部();

  var formatGuide = '回复要求：用 Markdown 格式输出，适当使用标题、粗体、列表、表格。清晰分段，避免长篇无分段文本。';
  var formatGuideJSON = '当讨论达成一致需要输出角色数据时，只输出需要修改的字段和值，不需要输出整个角色卡。未提及的字段保持原样。在回复末尾用 ```json ... ``` 输出。';
  var formatGuideNew = '回复要求：用 Markdown 格式输出，适当使用标题、粗体、列表、表格。清晰分段，避免长篇无分段文本。设定基本确定时在回复末尾用 ```json ... ``` 输出完整角色 JSON。';

  var systemPrompt;
  if (讨论.当前角色) {
    systemPrompt = '你是一位角色创作顾问。用户正在与你讨论一个角色，角色数据已附在对话中。讨论如何修改完善。注意：严格遵守角色卡的 JSON 结构，只可以修改现有字段的值，不得新增字段、不得删除字段、不得改变数据结构。' + formatGuide + formatGuideJSON;
  } else {
    systemPrompt = '你是一位角色创作顾问。用户想和你一起创作新角色。通过对话了解他的想法，帮助构思和完善角色设定。' + formatGuideNew;
  }

  var messages = [];
  // 角色数据放在 user 消息里而不是 system，避免长对话后被遗忘
  if (讨论.当前角色) {
    messages.push({ role: 'user', content: '以下是当前角色的完整数据，请基于它进行讨论和修改：\n```json\n' + JSON.stringify(讨论.当前角色, null, 2) + '\n```' });
  }
  for (var _mi = 0; _mi < 讨论.消息列表.length - 1; _mi++) {
    var m = 讨论.消息列表[_mi];
    if (m.role === 'user' || m.role === 'assistant') {
      messages.push({ role: m.role, content: m.content });
    }
  }

  var msgIdx = 讨论.消息列表.length;
  讨论.消息列表.push({ role: 'assistant', content: '', isStreaming: true });
  渲染讨论面板();
  滚动到底部();

  大模型.调用({
    system: systemPrompt,
    messages: messages.concat([{ role: 'user', content: text }]),
    label: '角色讨论',
  }).then(function(result) {
    讨论.消息列表[msgIdx].content = result || '';
    讨论.消息列表[msgIdx].isStreaming = false;
    讨论.加载中 = false;
    渲染讨论面板();
    滚动到底部();
  }).catch(function(err) {
    if (msgIdx < 讨论.消息列表.length) {
      讨论.消息列表[msgIdx].content = '[调用失败: ' + err.message + ']';
      讨论.消息列表[msgIdx].isStreaming = false;
    }
    讨论.加载中 = false;
    渲染讨论面板();
    toast('调用失败: ' + err.message);
  });
};

window.讨论应用修改 = function() {
  if (!讨论.当前角色) { toast('没有加载角色'); return; }

  var lastAI = null;
  for (var _i = 讨论.消息列表.length - 1; _i >= 0; _i--) {
    if (讨论.消息列表[_i].role === 'assistant' && !讨论.消息列表[_i].isStreaming) {
      lastAI = 讨论.消息列表[_i]; break;
    }
  }
  if (!lastAI) { toast('没有可用的 AI 回复'); return; }

  var match = lastAI.content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (!match) { toast('AI 回复中没有角色 JSON'); return; }

  var parsed;
  try { parsed = JSON.parse(match[1].trim()); }
  catch(e) {
    try { parsed = JSON.parse(match[1].trim().replace(/,\s*([}\]])/g, '$1')); }
    catch(e2) { toast('JSON 解析失败'); return; }
  }
  if (!parsed.identity || !parsed.identity.basicInfo || !parsed.identity.basicInfo.name) {
    toast('JSON 缺少必要字段'); return;
  }

  // 生成变更对比
  var diffHtml = 渲染变更对比(讨论.当前角色, parsed);
  if (!diffHtml) { toast('未检测到任何变更'); return; }

  讨论.待应用角色 = parsed;
  讨论.待应用diff = diffHtml;
  讨论.消息列表.push({ role: 'system', content: '', type: 'diff', diffHtml: diffHtml, pendingChar: parsed });
  渲染讨论面板();
  滚动到底部();
};

function 渲染变更对比(oldChar, newChar) {
  var lines = [];

  // 基础信息变更（name, age, gender, race, title）
  var oldBi = oldChar.identity && oldChar.identity.basicInfo || {};
  var newBi = newChar.identity && newChar.identity.basicInfo || {};
  var basicChanges = [];
  var basicFields = { name: '名称', age: '年龄', gender: '性别', race: '种族', title: '称号', rarity: '稀有度' };
  for (var f in basicFields) {
    if (oldBi[f] !== undefined && newBi[f] !== undefined && String(oldBi[f]) !== String(newBi[f])) {
      basicChanges.push({ field: basicFields[f], old: oldBi[f], new: newBi[f] });
    } else if (newBi[f] !== undefined && oldBi[f] === undefined) {
      basicChanges.push({ field: basicFields[f], old: '(无)', new: newBi[f] });
    }
  }
  if (basicChanges.length) lines.push({ section: '基本信息', changes: basicChanges });

  // 背景变更（origin, upbringing, family）
  var oldBg = oldChar.identity && oldChar.identity.background || {};
  var newBg = newChar.identity && newChar.identity.background || {};
  var bgChanges = [];
  var bgFields = { origin: '出身', upbringing: '成长经历', family: '家族', education: '教育', aura: '气质' };
  for (var g in bgFields) {
    if (oldBg[g] !== undefined && newBg[g] !== undefined && String(oldBg[g]) !== String(newBg[g])) {
      bgChanges.push({ field: bgFields[g], old: (oldBg[g] || '').substring(0, 40), new: (newBg[g] || '').substring(0, 40) });
    }
  }
  if (bgChanges.length) lines.push({ section: '背景', changes: bgChanges });

  // 经历变更
  var oldExp = oldChar.identity && oldChar.identity.experience || {};
  var newExp = newChar.identity && newChar.identity.experience || {};
  var expChanges = [];
  if (String(oldExp.lifeOverview || '') !== String(newExp.lifeOverview || '')) {
    expChanges.push({ field: '人生概述', old: (oldExp.lifeOverview || '').substring(0, 30) + '…', new: (newExp.lifeOverview || '').substring(0, 30) + '…' });
  }
  if (expChanges.length) lines.push({ section: '经历', changes: expChanges });

  // 外貌变更（appearance）
  if (JSON.stringify(oldChar.appearance) !== JSON.stringify(newChar.appearance)) {
    var appChanges = [];
    var oldApp = oldChar.appearance || {};
    var newApp = newChar.appearance || {};
    if (String(oldApp.figure || '') !== String(newApp.figure || '')) appChanges.push({ field: '体型', old: oldApp.figure || '(无)', new: newApp.figure || '(无)' });
    if (String(oldApp.height || '') !== String(newApp.height || '')) appChanges.push({ field: '身高', old: oldApp.height || '(无)', new: newApp.height || '(无)' });
    if (oldApp.breasts && newApp.breasts && JSON.stringify(oldApp.breasts) !== JSON.stringify(newApp.breasts)) {
      appChanges.push({ field: '胸部', old: '(已变更)', new: '(已变更)' });
    }
    if (appChanges.length) lines.push({ section: '外貌', changes: appChanges });
  }

  // 性格变更
  if (JSON.stringify(oldChar.personality) !== JSON.stringify(newChar.personality)) {
    var oldPers = oldChar.personality || {};
    var newPers = newChar.personality || {};
    var pChanges = [];
    var pt = oldPers.personalityTraits && oldPers.personalityTraits.personality || {};
    var nt = newPers.personalityTraits && newPers.personalityTraits.personality || {};
    if (pt.summary !== nt.summary) pChanges.push({ field: '性格概述', old: (pt.summary || '').substring(0, 30), new: (nt.summary || '').substring(0, 30) });
    if (pChanges.length) lines.push({ section: '性格', changes: pChanges });
  }

  if (!lines.length) return null;

  var h = '<div style="border:1px solid var(--accent2);border-radius:6px;padding:8px;margin:6px 0;background:var(--bg2)">';
  h += '<div style="font-size:11px;font-weight:600;color:var(--accent2);margin-bottom:6px;display:flex;align-items:center;gap:4px">📋 检测到以下变更</div>';

  for (var si = 0; si < lines.length; si++) {
    var sec = lines[si];
    h += '<div style="font-size:10px;font-weight:600;color:var(--fg);margin:6px 0 3px 0;padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.05)">' + sec.section + '</div>';
    for (var ci = 0; ci < sec.changes.length; ci++) {
      var ch = sec.changes[ci];
      h += '<div style="font-size:10px;display:grid;grid-template-columns:50px 1fr 1fr;gap:4px;padding:2px 4px;border-radius:2px;margin:1px 0">';
      h += '<span style="color:var(--fg3)">' + escHtml(ch.field) + '</span>';
      h += '<span style="color:var(--error);text-decoration:line-through;opacity:0.7">' + escHtml(ch.old) + '</span>';
      h += '<span style="color:var(--success)">' + escHtml(ch.new) + '</span>';
      h += '</div>';
    }
  }

  h += '<div style="display:flex;gap:6px;margin-top:8px;padding-top:6px;border-top:1px solid var(--border)">';
  h += '<button class="btn btn-primary btn-sm" style="font-size:10px;flex:1" onclick="讨论确认应用()">✅ 确认应用</button>';
  h += '<button class="btn btn-outline btn-sm" style="font-size:10px" onclick="讨论取消应用()">✕ 取消</button>';
  h += '</div></div>';
  return h;
}

window.讨论确认应用 = function() {
  if (!讨论.待应用角色) { toast('没有待应用的角色数据'); return; }

  讨论.当前角色 = 深度合并(讨论.当前角色, 讨论.待应用角色);
  var entry = S.generatedCharacters && S.generatedCharacters[讨论.当前分类] && S.generatedCharacters[讨论.当前分类][讨论.当前ID];
  if (entry) {
    entry.fullChar = JSON.parse(JSON.stringify(讨论.当前角色));
    try { save(); } catch(e) {}
    toast('✅ 角色已更新');
  } else {
    toast('⚠️ 内存已更新');
  }
  讨论.待应用角色 = null;
  讨论.待应用diff = null;
  for (var _i = 讨论.消息列表.length - 1; _i >= 0; _i--) {
    if (讨论.消息列表[_i].type === 'diff') {
      讨论.消息列表.splice(_i, 1);
      break;
    }
  }
  讨论.消息列表.push({ role: 'assistant', content: '✅ 已应用上述变更。' });
  渲染讨论面板();
};

window.讨论取消应用 = function() {
  讨论.待应用角色 = null;
  讨论.待应用diff = null;
  for (var _i = 讨论.消息列表.length - 1; _i >= 0; _i--) {
    if (讨论.消息列表[_i].type === 'diff') {
      讨论.消息列表.splice(_i, 1);
      break;
    }
  }
  渲染讨论面板();
};

function 渲染提取面板() {
  var p = 讨论.提取面板;
  if (!p || !p.jsons || !p.jsons.length) return '';

  var h = '<div style="border-top:1px solid var(--accent2);padding:10px;background:var(--accent-dim);max-height:260px;overflow-y:auto">';
  h += '<div style="font-size:11px;font-weight:600;color:var(--accent2);margin-bottom:6px;display:flex;align-items:center;gap:4px">📋 提取到角色数据';
  h += '<span style="font-size:10px;color:var(--fg3);font-weight:400;margin-left:auto;cursor:pointer" onclick="讨论关闭提取()">✕ 关闭</span>';
  h += '</div>';

  if (p.jsons.length > 1) {
    h += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">';
    for (var oi = 0; oi < p.jsons.length; oi++) {
      var sel = oi === p.selectedIdx;
      h += '<span style="font-size:10px;padding:2px 8px;border-radius:3px;cursor:pointer;background:' + (sel ? 'var(--accent2)' : 'var(--bg)') + ';color:' + (sel ? '#fff' : 'var(--fg2)') + '" onclick="讨论选择提取(' + oi + ')">选项 ' + (oi + 1) + '</span>';
    }
    h += '</div>';
  }

  var cur = p.jsons[p.selectedIdx];
  if (cur) {
    var name = cur.data && cur.data.identity && cur.data.identity.basicInfo && cur.data.identity.basicInfo.name || '(未命名)';
    h += '<div style="font-size:11px;font-weight:600;color:var(--fg);margin-bottom:4px">' + escHtml(name) + '</div>';
    h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:4px;padding:6px 8px;font-size:9px;font-family:monospace;white-space:pre-wrap;max-height:120px;overflow-y:auto;color:var(--fg2);line-height:1.5;user-select:text">' + escHtml(JSON.stringify(cur.data, null, 2)) + '</div>';
    h += '<div style="display:flex;gap:6px;margin-top:6px">';
    h += '<button class="btn btn-primary btn-sm" style="font-size:10px;flex:1" onclick="讨论确认提取()">✅ 应用此版本</button>';
    h += '<button class="btn btn-outline btn-sm" style="font-size:10px" onclick="讨论关闭提取()">✕ 关闭</button>';
    h += '</div>';
  }
  h += '</div>';
  return h;
}

window.讨论打开提取 = function() {
  讨论.提取输入 = true;
  渲染讨论面板();
  setTimeout(function() {
    var el = document.getElementById('extractInput');
    if (el) el.focus();
  }, 50);
};

window.讨论取消提取 = function() {
  讨论.提取输入 = false;
  渲染讨论面板();
};

window.讨论执行提取 = function() {
  if (讨论.加载中) { toast('请等待当前回复完成'); return; }
  var input = document.getElementById('extractInput');
  var extra = input ? input.value.trim() : '';
  var text = '请根据讨论，只输出需要修改的字段和值。' + (extra ? '\n\n额外要求：' + extra : '');
  讨论.提取输入 = false;
  讨论.消息列表.push({ role: 'user', content: text });
  讨论.加载中 = true;
  讨论.提取面板 = null;
  渲染讨论面板();
  滚动到底部();

  var formatGuide = '回复要求：用 Markdown 格式输出，适当使用标题、粗体、列表、表格。清晰分段，避免长篇无分段文本。';
  var formatGuideJSON = '需要输出角色数据时，只输出修改涉及的字段。有多种可能时列出多个 JSON 选项。在回复末尾用 ```json ... ``` 输出。';
  var formatGuideNew = '回复要求：用 Markdown 格式输出，适当使用标题、粗体、列表、表格。清晰分段，避免长篇无分段文本。有多种可能时列出多个 JSON 选项。在回复末尾用 ```json ... ``` 输出完整角色 JSON。';
  var systemPrompt = 讨论.当前角色
    ? '你是一位角色创作顾问。用户正在与你讨论一个角色，角色数据已附在对话中。讨论如何修改完善。注意：严格遵守角色卡的 JSON 结构，只可以修改现有字段的值，不得新增字段、不得删除字段、不得改变数据结构。' + formatGuide + formatGuideJSON
    : '你是一位角色创作顾问。用户想和你一起创作新角色。通过对话了解他的想法，帮助构思和完善角色设定。' + formatGuideNew;

  var messages = [];
  if (讨论.当前角色) {
    messages.push({ role: 'user', content: '以下是当前角色的完整数据，请基于它进行讨论和修改：\n```json\n' + JSON.stringify(讨论.当前角色, null, 2) + '\n```' });
  }
  for (var _mi = 0; _mi < 讨论.消息列表.length - 1; _mi++) {
    var m = 讨论.消息列表[_mi];
    if (m.role === 'user' || m.role === 'assistant') {
      messages.push({ role: m.role, content: m.content });
    }
  }

  var msgIdx = 讨论.消息列表.length;
  讨论.消息列表.push({ role: 'assistant', content: '', isStreaming: true });
  渲染讨论面板();
  滚动到底部();

  大模型.调用({
    system: systemPrompt,
    messages: messages.concat([{ role: 'user', content: text }]),
    label: '角色讨论-提取',
  }).then(function(result) {
    讨论.消息列表[msgIdx].content = result || '';
    讨论.消息列表[msgIdx].isStreaming = false;
    讨论.加载中 = false;
    var jsons = 提取AI中的JSON(讨论.消息列表[msgIdx].content);
    if (jsons && jsons.length) {
      讨论.提取面板 = { jsons: jsons, selectedIdx: 0 };
    }
    渲染讨论面板();
    滚动到底部();
  }).catch(function(err) {
    if (msgIdx < 讨论.消息列表.length) {
      讨论.消息列表[msgIdx].content = '[调用失败: ' + err.message + ']';
      讨论.消息列表[msgIdx].isStreaming = false;
    }
    讨论.加载中 = false;
    渲染讨论面板();
    toast('调用失败: ' + err.message);
  });
};

window.讨论选择提取 = function(idx) {
  if (讨论.提取面板) {
    讨论.提取面板.selectedIdx = idx;
    渲染讨论面板();
  }
};

window.讨论确认提取 = function() {
  var p = 讨论.提取面板;
  if (!p || !p.jsons || !p.jsons.length) return;
  var cur = p.jsons[p.selectedIdx];
  if (!cur) return;

  // 深度合并：只修改已有字段的值，不新增不删除
  if (讨论.当前角色) {
    讨论.当前角色 = 深度合并(讨论.当前角色, cur.data);
  } else {
    讨论.当前角色 = JSON.parse(JSON.stringify(cur.data));
  }

  讨论.提取面板 = null;

  if (!讨论.当前分类 && !讨论.当前ID) {
    toast('✅ 角色数据已提取到内存，可继续讨论或去「生成角色」中完善保存');
  } else {
    var entry = S.generatedCharacters && S.generatedCharacters[讨论.当前分类] && S.generatedCharacters[讨论.当前分类][讨论.当前ID];
    if (entry) {
      entry.fullChar = JSON.parse(JSON.stringify(讨论.当前角色));
      try { save(); } catch(e) {}
      toast('✅ 角色已更新');
    } else {
      toast('✅ 已应用提取的版本');
    }
  }
  讨论.消息列表.push({ role: 'assistant', content: '✅ 已应用提取的角色版本。' });
  渲染讨论面板();
};

window.讨论关闭提取 = function() {
  讨论.提取面板 = null;
  渲染讨论面板();
};

function 提取AI中的JSON(text) {
  var results = [];
  var regex = /```(?:json)?\s*([\s\S]*?)```/g;
  var match;
  while ((match = regex.exec(text)) !== null) {
    var str = match[1].trim();
    if (!str) continue;
    try {
      var data = JSON.parse(str);
      results.push({ name: data.identity && data.identity.basicInfo && data.identity.basicInfo.name || '(未命名)', data: data });
    } catch(e) {
      try {
        var fixed = str.replace(/,\s*([}\]])/g, '$1');
        var data2 = JSON.parse(fixed);
        results.push({ name: data2.identity && data2.identity.basicInfo && data2.identity.basicInfo.name || '(未命名)', data: data2 });
      } catch(e2) {}
    }
  }
  return results.length ? results : null;
}

// 深度合并：只修改 target 中已存在的字段的值，不新增不删除字段
function 深度合并(target, source) {
  if (!target || !source || typeof target !== 'object' || typeof source !== 'object') return target || source;
  var t = Array.isArray(target) ? target.slice() : JSON.parse(JSON.stringify(target));
  var s = Array.isArray(source) ? source : source;
  if (Array.isArray(t) && Array.isArray(s)) {
    return s.slice(); // 数组整体替换
  }
  for (var k in s) {
    if (k in t) {
      if (typeof s[k] === 'object' && s[k] !== null && typeof t[k] === 'object' && t[k] !== null && !Array.isArray(s[k])) {
        t[k] = 深度合并(t[k], s[k]);
      } else {
        t[k] = JSON.parse(JSON.stringify(s[k]));
      }
    }
    // 如果 source 中有 target 没有的字段，跳过（不新增）
  }
  return t;
}

// ===== 辅助 =====

function 渲染讨论面板() {
  var el = document.getElementById('characterContent');
  if (el) 渲染角色主面板(el);
}

function 滚动到底部() {
  setTimeout(function() {
    var el = document.getElementById('charDiscussMessages');
    if (el) el.scrollTop = el.scrollHeight;
  }, 50);
}
