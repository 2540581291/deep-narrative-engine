// 角色聊天 · 聊天软件（微信/QQ 风格模拟）
var 聊天软件平台 = 'weixin'; // weixin | qq

function 渲染聊天软件(el) {
  if (!角色聊天当前角色 || !角色聊天当前会话 || 角色聊天当前会话.mode !== 'im') {
    el.innerHTML = '<div class="placeholder-text">请先在「选择角色」中选择一位角色，点击「📱 模拟」开始聊天软件模拟</div>';
    return;
  }
  var role = 角色聊天当前角色;
  var msgs = 角色聊天当前会话.messages || [];
  var platform = 聊天软件平台 === 'weixin' ? '微信' : 'QQ';

  var h = '<div class="mb-8 flex justify-between items-center">';
  h += '<div class="flex items-center gap-6"><div style="width:34px;height:34px;border-radius:8px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:18px">' + (role.data.identity && role.data.identity.basicInfo && role.data.identity.basicInfo.icon || '👤') + '</div>';
  h += '<div><div class="fw-600 fs-14">' + escHtml(role.name) + '</div><div class="text-xs text-muted">' + platform + ' 聊天</div></div></div>';
  h += '<div class="flex gap-4"><span class="btn-secondary btn-sm" onclick="聊天软件切平台()">切换 ' + (聊天软件平台 === 'weixin' ? 'QQ' : '微信') + '</span>';
  h += '<span class="btn-secondary btn-sm" onclick="聊天软件切纯对白()" style="' + (角色聊天当前会话.pureDialogue ? 'border-color:var(--accent2);color:var(--accent2)' : '') + '" title="纯对白模式：角色只输出台词，不含动作/神态/表情描写">📑 ' + (角色聊天当前会话.pureDialogue ? '纯对白：开' : '纯对白：关') + '</span>';
  h += '<span class="btn-secondary btn-sm" onclick="聊天软件清空()">🗑 清空</span></div></div>';

  // 聊天界面（气泡）
  h += '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:10px">';
  h += '<div style="padding:6px 10px;font-size:11px;color:var(--fg2);background:var(--bg);border-bottom:1px solid var(--border);text-align:center">' + (聊天软件平台 === 'weixin' ? '💬 微信' : '💬 QQ') + ' · 与 ' + escHtml(role.name) + ' 的对话</div>';
  h += '<div id="ccImMsgs" style="height:360px;overflow-y:auto;padding:12px;background:var(--bg2)">';
  if (!msgs.length) h += '<div class="text-muted text-sm text-center py-40">发送第一条消息，开始聊天吧</div>';
  else {
    msgs.forEach(function(m) {
      if (m.role === 'system') return;
      var isUser = m.role === 'user';
      var t = m.time || '';
      h += '<div style="display:flex;margin-bottom:10px;' + (isUser ? 'flex-direction:row-reverse' : '') + '">';
      h += '<div style="width:32px;height:32px;border-radius:50%;background:' + (isUser ? 'var(--success)' : 'var(--accent)') + ';color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">' + (isUser ? '我' : (role.data.identity && role.data.identity.basicInfo && role.data.identity.basicInfo.icon || '👤')) + '</div>';
      h += '<div style="max-width:65%;margin:' + (isUser ? '0 8px 0 0' : '0 0 0 8px') + '">';
      if (!isUser) h += '<div class="text-xs text-muted mb-2">' + escHtml(role.name) + '</div>';
      h += '<div style="padding:8px 12px;border-radius:8px;background:' + (isUser ? 'var(--accent)' : 'var(--bg)') + ';color:' + (isUser ? '#fff' : 'var(--fg)') + ';font-size:13px;line-height:1.5;white-space:pre-wrap">' + escHtml(m.content) + '</div>';
      if (t) h += '<div class="text-xs text-muted mt-2" style="' + (isUser ? 'text-align:right' : '') + '">' + escHtml(t) + '</div>';
      h += '</div></div>';
    });
  }
  h += '</div>';
  h += '<div class="flex-row gap-4" style="padding:8px;border-top:1px solid var(--border);background:var(--bg);align-items:flex-end">';
  h += '<input id="ccImInput" class="llm-input" style="flex:1;height:44px" placeholder="输入消息..." onkeydown="if(event.key===\'Enter\'){event.preventDefault();聊天软件发送()}">';
  h += '<button class="btn" style="min-width:84px;height:44px;font-size:15px" onclick="聊天软件发送()">发送</button></div>';
  h += '<div style="padding:6px 8px 8px;border-top:1px solid var(--border);background:var(--bg)"><span class="btn-secondary btn-sm" style="font-size:11px;padding:5px 12px" onclick="角色聊天AI代聊(\'cc_suggest_reply\',\'ccImInput\',\'聊天软件\')" title="让 AI 以你的身份向角色接话，填入输入框">🤖 AI 代聊</span></div>';
  h += '</div>';
  el.innerHTML = h;
  var msgsEl = document.getElementById('ccImMsgs');
  if (msgsEl) msgsEl.scrollTop = msgsEl.scrollHeight;
}
window.渲染聊天软件 = 渲染聊天软件;

function 聊天软件切平台() {
  聊天软件平台 = 聊天软件平台 === 'weixin' ? 'qq' : 'weixin';
  渲染聊天软件(document.getElementById('ccViewContent'));
}
window.聊天软件切平台 = 聊天软件切平台;

function 聊天软件切纯对白() {
  角色聊天切纯对白();
}
window.聊天软件切纯对白 = 聊天软件切纯对白;

function 聊天软件发送() {
  var input = document.getElementById('ccImInput');
  if (!input || !input.value.trim()) return;
  var msg = input.value.trim();
  input.value = '';
  var now = new Date();
  var t = (now.getHours() < 10 ? '0' : '') + now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
  角色聊天当前会话.messages.push({ role: 'user', content: msg, time: t });
  角色聊天保存会话();
  渲染聊天软件(document.getElementById('ccViewContent'));

  var platform = 聊天软件平台 === 'weixin' ? '微信' : 'QQ';
  var extra = '当前正在使用' + platform + '聊天。请像在' + platform + '上发消息一样简短口语化地回复，可用表情符号（如😏🥵💦）或 emoji，模拟真实聊天的节奏。';
  var 非系统消息 = 角色聊天当前会话.messages.filter(function(m) { return m.role !== 'system'; });
  var msgs = 非系统消息.map(function(m, i) {
    if (m.role === 'assistant') return { role: 'assistant', content: '【' + 角色聊天当前角色.name + '】' + m.content };
    // 最后一条 user 消息 = 完整用户提示（身份段 → 规则 → 对话记录 → 任务），记录已含本条消息，不再重复附加内容
    if (i === 非系统消息.length - 1) return { role: 'user', content: 角色聊天构建用户提示(角色聊天当前角色, 'role', extra) };
    return { role: 'user', content: '【我】' + m.content };
  });
  LLM.call({ system: 角色聊天构建System(角色聊天当前角色), messages: msgs, label: '角色聊天·' + platform }).then(function(reply) {
    if (!reply) { toast('AI 返回为空'); return; }
    var now2 = new Date();
    var t2 = (now2.getHours() < 10 ? '0' : '') + now2.getHours() + ':' + (now2.getMinutes() < 10 ? '0' : '') + now2.getMinutes();
    角色聊天当前会话.messages.push({ role: 'assistant', content: reply, time: t2 });
    角色聊天保存会话();
    渲染聊天软件(document.getElementById('ccViewContent'));
  }).catch(function(err) {
    toast('AI 回复失败：' + (err.message || err));
    渲染聊天软件(document.getElementById('ccViewContent'));
  });
}
window.聊天软件发送 = 聊天软件发送;

function 聊天软件清空() {
  if (!角色聊天当前会话) return;
  if (!confirm('确定清空当前对话？')) return;
  角色聊天当前会话.messages = [];
  角色聊天保存会话();
  渲染聊天软件(document.getElementById('ccViewContent'));
}
window.聊天软件清空 = 聊天软件清空;
