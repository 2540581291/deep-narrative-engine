// 角色聊天 · 历史记录（按角色分组会话，可回看/继续/删除）
var 聊天历史查看Id = null;

function 渲染聊天历史(el) {
  if (聊天历史查看Id) {
    渲染聊天历史详情(el);
    return;
  }
  var h = '<div class="fs-12 fw-600 c-fg mb-8">📋 聊天历史</div>';
  h += '<div id="ccHistBody"><div class="text-sm text-muted">加载中...</div></div>';
  el.innerHTML = h;
  Store.charChat.list().then(function(items) {
    var body = document.getElementById('ccHistBody');
    if (!body) return;
    if (!items || !items.length) {
      body.innerHTML = '<div class="placeholder-text">暂无聊天记录。开始聊天后会自动保存。</div>';
      return;
    }
    // 按角色分组
    var groups = {};
    items.forEach(function(it) {
      var name = it.character || it.name || '未知角色';
      if (!groups[name]) groups[name] = [];
      groups[name].push(it);
    });
    var hh = '';
    Object.keys(groups).forEach(function(name) {
      var list = groups[name].sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); });
      hh += '<div class="n-card mb-8 p-10">';
      hh += '<div class="fs-13 fw-600 c-fg mb-4">👤 ' + escHtml(name) + '（' + list.length + ' 次会话）</div>';
      list.forEach(function(session) {
        var msgs = session.messages || [];
        var nonSys = msgs.filter(function(m) { return m.role !== 'system'; });
        var lastMsg = nonSys.length ? nonSys[nonSys.length - 1].content : '';
        if (lastMsg.length > 40) lastMsg = lastMsg.slice(0, 40) + '…';
        var modeLabel = session.mode === 'im' ? '📱 聊天软件' : '💬 自由聊天';
        hh += '<div class="n-card p-8 mb-4" style="background:var(--bg2)">';
        hh += '<div class="flex justify-between items-center">';
        hh += '<div class="fs-12">' + modeLabel + ' · ' + escHtml((session.date || '').slice(0, 19)) + ' · ' + nonSys.length + ' 条</div>';
        hh += '<div class="flex gap-4">';
        hh += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="聊天历史查看(\'' + escHtml(session.id || '') + '\')">📖 查看</span>';
        hh += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="聊天历史继续(\'' + escHtml(session.id || '') + '\')">▶ 继续</span>';
        hh += '<span class="btn-secondary btn-sm c-error" style="font-size:10px" onclick="聊天历史删除(\'' + escHtml(session.id || '') + '\')">🗑 删除</span>';
        hh += '</div></div>';
        if (lastMsg) hh += '<div class="text-sm text-muted mt-4">' + escHtml(lastMsg) + '</div>';
        hh += '</div>';
      });
      hh += '</div>';
    });
    body.innerHTML = hh;
  }).catch(function() {
    var body = document.getElementById('ccHistBody');
    if (body) body.innerHTML = '<div class="placeholder-text">读取失败</div>';
  });
}
window.渲染聊天历史 = 渲染聊天历史;

function 聊天历史查看(id) {
  聊天历史查看Id = id;
  渲染聊天历史(document.getElementById('ccViewContent'));
}
window.聊天历史查看 = 聊天历史查看;

function 渲染聊天历史详情(el) {
  Store.charChat.get(聊天历史查看Id).then(function(session) {
    var h = '<div class="flex justify-between items-center mb-8">';
    h += '<span class="fs-13 fw-600">👤 ' + escHtml(session ? (session.character || '') : '') + ' · 会话详情</span>';
    h += '<button class="btn-secondary btn-sm" style="font-size:10px" onclick="聊天历史返回()">← 返回列表</button></div>';
    if (!session) {
      h += '<div class="placeholder-text">未找到该会话</div>';
      el.innerHTML = h;
      return;
    }
    var msgs = (session.messages || []).filter(function(m) { return m.role !== 'system'; });
    var modeLabel = session.mode === 'im' ? '📱 聊天软件' : '💬 自由聊天';
    h += '<div class="n-card p-10 mb-8">';
    h += '<div class="fs-12 text-muted mb-6">' + modeLabel + ' · ' + escHtml(session.date || '') + ' · ' + msgs.length + ' 条消息</div>';
    if (!msgs.length) {
      h += '<div class="text-sm text-muted">该会话暂无对话</div>';
    } else {
      msgs.forEach(function(m) {
        var isUser = m.role === 'user';
        h += '<div style="margin-bottom:8px;text-align:' + (isUser ? 'right' : 'left') + '">';
        h += '<div style="display:inline-block;max-width:85%;padding:8px 12px;border-radius:8px;background:' + (isUser ? 'var(--accent)' : 'var(--bg)') + ';color:' + (isUser ? '#fff' : 'var(--fg)') + ';text-align:left;font-size:13px;line-height:1.5;white-space:pre-wrap">';
        h += '<div class="text-xs mb-2 opacity-7">' + (isUser ? '你' : escHtml(session.character || '角色')) + '</div>';
        h += escHtml(m.content);
        h += '</div></div>';
      });
    }
    h += '</div>';
    el.innerHTML = h;
  });
}

function 聊天历史返回() {
  聊天历史查看Id = null;
  渲染聊天历史(document.getElementById('ccViewContent'));
}
window.聊天历史返回 = 聊天历史返回;

function 聊天历史继续(id) {
  Store.charChat.get(id).then(function(session) {
    if (!session) { toast('未找到该会话'); return; }
    角色聊天当前角色 = { name: session.character || '角色', title: session.character || '', data: session.charData || {} };
    角色聊天当前会话 = JSON.parse(JSON.stringify(session));
    角色聊天切换视图(session.mode === 'im' ? 'im' : 'free');
  });
}
window.聊天历史继续 = 聊天历史继续;

function 聊天历史删除(id) {
  if (!confirm('确定删除该会话？')) return;
  Store.charChat.delete(id).then(function() {
    toast('已删除');
    if (聊天历史查看Id === id) 聊天历史查看Id = null;
    渲染聊天历史(document.getElementById('ccViewContent'));
  });
}
window.聊天历史删除 = 聊天历史删除;
