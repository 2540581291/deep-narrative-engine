// 角色聊天 · 自由聊天（实时多轮对话）
var 自由聊天方向 = []; // 追加到 system 的风格要求

function 渲染自由聊天(el) {
  if (!角色聊天当前角色 || !角色聊天当前会话 || 角色聊天当前会话.mode !== 'free') {
    el.innerHTML = '<div class="placeholder-text">请先在「选择角色」中选择一位角色开始自由聊天</div>';
    return;
  }
  var role = 角色聊天当前角色;
  var msgs = 角色聊天当前会话.messages || [];
  var bi = (role.data.identity && role.data.identity.basicInfo) || {};
  var h = '<div class="mb-8 flex justify-between items-center">';
  h += '<div class="flex items-center gap-6"><div style="width:36px;height:36px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">' + (bi.icon || '👤') + '</div>';
  h += '<div><div class="fw-600 fs-14">' + escHtml(role.name) + '</div><div class="text-xs text-muted">' + msgs.length + ' 条消息</div></div></div>';
  h += '<div class="flex gap-4"><span class="btn-secondary btn-sm" onclick="自由聊天切纯对白()" style="' + (角色聊天当前会话.pureDialogue ? 'border-color:var(--accent2);color:var(--accent2)' : '') + '" title="纯对白模式：角色只输出台词，不含动作/神态/表情描写">📑 ' + (角色聊天当前会话.pureDialogue ? '纯对白：开' : '纯对白：关') + '</span>';
  h += '<span class="btn-secondary btn-sm" onclick="自由聊天清空()">🗑 清空</span></div></div>';

  // 方向 chip（可选，追加到 system）
  h += '<div class="mb-8 flex gap-4 flex-wrap" style="font-size:11px">';
  var 方向选项 = ['更热情','更含蓄','更直白','更温柔','更俏皮','更主动','话更少','更粘人'];
  方向选项.forEach(function(d) {
    var sel = 自由聊天方向.indexOf(d) >= 0;
    h += '<span class="preset-chip' + (sel ? ' preset-active' : '') + '" onclick="自由聊天切方向(\'' + d + '\')">' + d + '</span>';
  });
  h += '</div>';

  h += '<div id="ccFreeMsgs" style="height:380px;overflow-y:auto;border:1px solid var(--border);border-radius:6px;padding:10px;margin-bottom:10px;background:var(--bg2)">';
  if (!msgs.length) h += '<div class="text-muted text-sm text-center py-40">开始对话吧</div>';
  else {
    msgs.forEach(function(m) {
      if (m.role === 'system') return;
      var isUser = m.role === 'user';
      h += '<div style="margin-bottom:8px;text-align:' + (isUser ? 'right' : 'left') + '">';
      h += '<div style="display:inline-block;max-width:80%;padding:8px 12px;border-radius:8px;background:' + (isUser ? 'var(--accent)' : 'var(--bg)') + ';color:' + (isUser ? '#fff' : 'var(--fg)') + ';text-align:left;font-size:13px;line-height:1.5;white-space:pre-wrap">';
      h += '<div class="text-xs mb-2 opacity-7">' + (isUser ? '你' : escHtml(role.name)) + '</div>';
      h += escHtml(m.content);
      h += '</div></div>';
    });
  }
  h += '</div>';
  h += '<div class="flex-row gap-6" style="align-items:flex-end"><textarea id="ccFreeInput" class="llm-input" style="flex:1;min-height:56px;max-height:120px;resize:vertical" placeholder="输入消息...（Enter 发送，Shift+Enter 换行）" onkeydown="if(event.key===\'Enter\'){event.preventDefault();自由聊天发送()}"></textarea>';
  h += '<button class="btn" style="min-width:96px;height:56px;font-size:15px" onclick="自由聊天发送()">发送</button></div>';
  h += '<div class="flex-row gap-4" style="margin-top:6px"><span class="btn-secondary btn-sm" style="font-size:11px;padding:5px 12px" onclick="角色聊天AI代聊(\'cc_suggest_reply\',\'ccFreeInput\',\'自由聊天\')" title="让 AI 以你的身份向角色接话，填入输入框">🤖 AI 代聊</span></div>';
  el.innerHTML = h;
  var msgsEl = document.getElementById('ccFreeMsgs');
  if (msgsEl) msgsEl.scrollTop = msgsEl.scrollHeight;
}
window.渲染自由聊天 = 渲染自由聊天;

function 自由聊天切方向(d) {
  var idx = 自由聊天方向.indexOf(d);
  if (idx >= 0) 自由聊天方向.splice(idx, 1);
  else 自由聊天方向.push(d);
  渲染自由聊天(document.getElementById('ccViewContent'));
}
window.自由聊天切方向 = 自由聊天切方向;

function 自由聊天切纯对白() {
  角色聊天切纯对白();
}
window.自由聊天切纯对白 = 自由聊天切纯对白;

function 自由聊天发送() {
  var input = document.getElementById('ccFreeInput');
  if (!input || !input.value.trim()) return;
  var msg = input.value.trim();
  input.value = '';
  角色聊天当前会话.messages.push({ role: 'user', content: msg });
  角色聊天保存会话();
  渲染自由聊天(document.getElementById('ccViewContent'));

  var extra = 自由聊天方向.length ? '请以「' + 自由聊天方向.join('、') + '」的基调回应。' : '';
  var 非系统消息 = 角色聊天当前会话.messages.filter(function(m) { return m.role !== 'system'; });
  var msgs = 非系统消息.map(function(m, i) {
    if (m.role === 'assistant') return { role: 'assistant', content: '【' + 角色聊天当前角色.name + '】' + m.content };
    // 最后一条 user 消息 = 完整用户提示（身份段 → 规则 → 对话记录 → 任务），记录已含本条消息，不再重复附加内容
    if (i === 非系统消息.length - 1) return { role: 'user', content: 角色聊天构建用户提示(角色聊天当前角色, 'role', extra) };
    return { role: 'user', content: '【我】' + m.content };
  });
  LLM.call({ system: 角色聊天构建System(角色聊天当前角色), messages: msgs, label: '角色聊天' }).then(function(reply) {
    if (!reply) { toast('AI 返回为空'); return; }
    角色聊天当前会话.messages.push({ role: 'assistant', content: reply });
    角色聊天保存会话();
    渲染自由聊天(document.getElementById('ccViewContent'));
  }).catch(function(err) {
    toast('AI 回复失败：' + (err.message || err));
    渲染自由聊天(document.getElementById('ccViewContent'));
  });
}
window.自由聊天发送 = 自由聊天发送;

function 自由聊天清空() {
  if (!角色聊天当前会话) return;
  if (!confirm('确定清空当前对话？')) return;
  角色聊天当前会话.messages = [];
  角色聊天保存会话();
  渲染自由聊天(document.getElementById('ccViewContent'));
}
window.自由聊天清空 = 自由聊天清空;
