// ============================================================
// 生活观赏 · 线上聊天 / 书信留言（两个角色之间的消息交流）
// 线上聊天：微信/QQ/短信（气泡样式）
// 书信留言：书信往来（信件样式）
// ============================================================
// 内容结构：{ platform, context, messages:[{sender,content,time}] }

// 线上平台固定选项
var 线上平台表 = ['微信', 'QQ', '短信'];
window.线上平台表 = 线上平台表;

// 聊天内容高亮：转义 HTML 后，把 @xxx 高亮（群聊中@成员更醒目）
function 生活观赏聊高亮(text) {
  var t = escHtml(text || '');
  return t.replace(/@([^@\s,，。！？.!?、]+)/g, '<span style="color:var(--accent2);font-weight:600">@$1</span>');
}
window.生活观赏聊高亮 = 生活观赏聊高亮;
// 书信/便条平台固定选项
var 生活观赏书信平台表 = ['书信', '便条'];
window.生活观赏书信平台表 = 生活观赏书信平台表;

// ===== 共同核心渲染 =====
function _生活观赏渲染消息(el, content, editable, isLetter) {
  if (!content) content = 生活观赏内容;
  if (!content) { el.innerHTML = '<div class="placeholder-text">暂无内容</div>'; return; }
  var messages = content.messages || [];
  var platform = content.platform || (isLetter ? '书信' : '微信');
  var h = '';
  // 平台 + 背景
  if (isLetter) {
    var 书信平台 = (typeof 生活观赏书信平台表 !== 'undefined' && 生活观赏书信平台表.indexOf(content.platform || '') >= 0) ? content.platform : '书信';
    if (editable) {
      h += '<div class="flex gap-6 items-center mb-6">';
      h += '<span class="fs-11 c-fg2">类型</span><select class="llm-input llm-select" style="width:130px" onchange="生活观赏书信设平台(this.value)">';
      生活观赏书信平台表.forEach(function(p) {
        h += '<option value="' + p + '"' + (p === 书信平台 ? ' selected' : '') + '>' + p + '</option>';
      });
      h += '</select></div>';
    } else {
      h += '<div class="mb-8 flex justify-between items-center"><span class="badge-tag">✉️ ' + escHtml(书信平台) + '</span>';
      if (content.context) h += '<span class="fs-11 c-fg3" style="padding:0 4px;max-width:70%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">📌 ' + escHtml(content.context) + '</span>';
      h += '</div>';
    }
  } else {
    var talkType = (content.talkType === 'group') ? 'group' : 'private';
    if (editable) {
      h += '<div class="flex gap-6 items-center mb-6">';
      h += '<span class="fs-11 c-fg2">平台</span><select class="llm-input llm-select" style="width:110px" onchange="生活观赏聊天设平台(this.value)">';
      线上平台表.forEach(function(p) {
        h += '<option value="' + p + '"' + (p === platform ? ' selected' : '') + '>' + p + '</option>';
      });
      h += '</select>';
      h += '<span class="fs-11 c-fg2">类型</span><select class="llm-input llm-select" style="width:110px" onchange="生活观赏聊设类型(this.value)">';
      h += '<option value="private"' + (talkType === 'private' ? ' selected' : '') + '>👤 单聊</option>';
      h += '<option value="group"' + (talkType === 'group' ? ' selected' : '') + '>👥 群聊</option>';
      h += '</select></div>';
      if (talkType === 'group') {
        h += '<input class="llm-input" style="width:100%;height:26px;font-size:11px;margin-bottom:6px" value="' + escHtml(content.groupName || '') + '" placeholder="群聊名称" oninput="生活观赏设(\'groupName\', this.value)">';
      }
    } else {
      h += '<div class="mb-8 flex justify-between items-center"><span class="badge-tag">💬 ' + escHtml(platform) + ' · ' + (talkType === 'group' ? ('👥 ' + (content.groupName ? escHtml(content.groupName) : '群聊')) : '👤 单聊') + '</span>';
      if (content.context) h += '<span class="fs-11 c-fg3" style="padding:0 4px;max-width:70%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">📌 ' + escHtml(content.context) + '</span>';
      h += '</div>';
    }
  }
  if (!isLetter && editable) {
    h += '<textarea class="llm-input" style="width:100%;min-height:44px;resize:vertical;margin-bottom:10px" placeholder="交流的背景（一句话）" oninput="生活观赏设(\'context\', this.value)">' + escHtml(content.context || '') + '</textarea>';
  }
  if (isLetter && editable) {
    h += '<textarea class="llm-input" style="width:100%;min-height:44px;resize:vertical;margin-bottom:10px" placeholder="书信往来的背景（一句话）" oninput="生活观赏设(\'context\', this.value)">' + escHtml(content.context || '') + '</textarea>';
  }

  if (!messages.length) h += '<div class="placeholder-text">暂无消息</div>';
  if (isLetter) {
    // 书信样式：每个消息一封信
    messages.forEach(function(m, mi) {
      if (editable) {
        h += '<div class="flex gap-6 items-center mb-6">';
        h += '<input class="llm-input" style="width:120px;height:24px;font-size:11px" value="' + escHtml(m.sender || '') + '" placeholder="写信人" oninput="生活观赏设(\'messages.' + mi + '.sender\', this.value)">';
        h += '<input class="llm-input" style="width:110px;height:24px;font-size:11px" value="' + escHtml(m.time || '') + '" placeholder="日期" oninput="生活观赏设(\'messages.' + mi + '.time\', this.value)">';
        h += '<textarea class="llm-input" style="flex:2;min-height:52px;resize:vertical;font-size:12px;line-height:1.6" placeholder="信件内容" oninput="生活观赏设(\'messages.' + mi + '.content\', this.value)">' + escHtml(m.content || '') + '</textarea>';
        h += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="生活观赏聊天删消息(' + mi + ')">✕</span>';
        h += '</div>';
      } else {
        h += '<div style="border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px;background:var(--bg2)">';
        h += '<div class="flex justify-between items-center mb-4">';
        h += '<span class="fw-600 fs-13" style="color:var(--accent)">✉️ ' + escHtml(m.sender || '') + '</span>';
        if (m.time) h += '<span class="fs-11 c-fg3">' + escHtml(m.time) + '</span>';
        h += '</div>';
        h += '<div style="font-size:13px;line-height:1.7;white-space:pre-wrap">' + escHtml(m.content || '') + '</div>';
        h += '</div>';
      }
    });
  } else {
    // 线上气泡样式
    messages.forEach(function(m, mi) {
      var 靠左 = (mi % 2) === 0;
      if (editable) {
        h += '<div class="flex gap-6 items-center mb-6">';
        h += '<input class="llm-input" style="width:110px;height:24px;font-size:11px" value="' + escHtml(m.sender || '') + '" placeholder="发送人" oninput="生活观赏设(\'messages.' + mi + '.sender\', this.value)">';
        h += '<input class="llm-input" style="flex:1;height:24px;font-size:11px" value="' + escHtml(m.time || '') + '" placeholder="时间" oninput="生活观赏设(\'messages.' + mi + '.time\', this.value)">';
        h += '<textarea class="llm-input" style="flex:2;min-height:40px;resize:vertical;font-size:12px" placeholder="内容" oninput="生活观赏设(\'messages.' + mi + '.content\', this.value)">' + escHtml(m.content || '') + '</textarea>';
        h += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="生活观赏聊天删消息(' + mi + ')">✕</span>';
        h += '</div>';
      } else {
        h += '<div style="display:flex;margin-bottom:10px;' + (靠左 ? '' : 'flex-direction:row-reverse') + '">';
        h += '<div style="max-width:75%;">';
        h += '<div class="flex items-center gap-4 mb-2"><span style="font-size:11px;color:var(--fg3)">' + escHtml(m.sender || '') + '</span>' + (m.time ? '<span style="font-size:10px;color:var(--fg3)">' + escHtml(m.time) + '</span>' : '') + '</div>';
        h += '<div style="padding:8px 12px;border-radius:8px;background:' + (靠左 ? 'var(--bg)' : 'var(--accent)') + ';color:' + (靠左 ? 'var(--fg)' : '#fff') + ';font-size:13px;line-height:1.5;white-space:pre-wrap">' + (typeof 生活观赏聊高亮 === 'function' ? 生活观赏聊高亮(m.content) : escHtml(m.content || '')) + '</div>';
        h += '</div></div>';
      }
    });
  }
  if (editable) h += '<button class="btn-secondary btn-sm" style="font-size:11px" onclick="生活观赏聊天加消息()">＋ 添加一条消息</button>';
  el.innerHTML = h;
}

// ===== 线上聊天（公开）=====
function 生活观赏渲染线上聊天(el, content, editable) {
  if (content) { content.platform = (content.platform && 线上平台表.indexOf(content.platform) >= 0) ? content.platform : '微信'; }
  return _生活观赏渲染消息(el, content, !!editable, false);
}
window.生活观赏渲染线上聊天 = 生活观赏渲染线上聊天;

// ===== 书信留言（公开）=====
function 生活观赏渲染书信留言(el, content, editable) {
  if (content && typeof 生活观赏书信平台表 !== 'undefined') {
    if (生活观赏书信平台表.indexOf(content.platform || '') < 0) content.platform = '书信';
  }
  return _生活观赏渲染消息(el, content || 生活观赏内容, !!editable, true);
}
window.生活观赏渲染书信留言 = 生活观赏渲染书信留言;

// 设置书信/便条平台
function 生活观赏书信设平台(v) {
  if (生活观赏内容) 生活观赏内容.platform = v;
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染内容(el, 生活观赏内容, true);
}
window.生活观赏书信设平台 = 生活观赏书信设平台;

function 生活观赏聊天设平台(v) {
  if (生活观赏内容) 生活观赏内容.platform = v;
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染内容(el, 生活观赏内容, true);
}
window.生活观赏聊天设平台 = 生活观赏聊天设平台;

// 设置单聊/群聊
function 生活观赏聊设类型(v) {
  if (生活观赏内容) 生活观赏内容.talkType = v;
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染内容(el, 生活观赏内容, true);
}
window.生活观赏聊设类型 = 生活观赏聊设类型;

// ===== 填充 =====
function _生活观赏填充消息(d, platform, context) {
  var messages = (Array.isArray(d && d.messages) ? d.messages : []).map(function(m) { return { sender: m.sender || '', content: m.content || '', time: m.time || '' }; });
  return { platform: platform, context: (context != null ? context : ((d && d.context) || '')), messages: messages };
}
// 线上聊天
function 生活观赏填充线上聊天(d) {
  var platform = (d && d.platform) || '微信';
  if (线上平台表.indexOf(platform) < 0) platform = '微信';
  var base = _生活观赏填充消息(d, platform);
  base.talkType = (d && d.talkType === 'group') ? 'group' : 'private';
  base.groupName = (d && d.groupName) || '';
  生活观赏内容 = base;
}
window.生活观赏填充线上聊天 = 生活观赏填充线上聊天;
// 书信留言
function 生活观赏填充书信留言(d) {
  var platform = (d && typeof 生活观赏书信平台表 !== 'undefined' && 生活观赏书信平台表.indexOf(d.platform) >= 0) ? d.platform : '书信';
  生活观赏内容 = _生活观赏填充消息(d, platform);
}
window.生活观赏填充书信留言 = 生活观赏填充书信留言;

// ===== 编辑操作（共同）=====
function 生活观赏聊天加消息() {
  if (!生活观赏内容) 生活观赏内容 = { platform: 生活观赏当前类型 === 'oletters' ? '书信' : '微信', talkType: 'private', groupName: '', context: '', messages: [] };
  if (!生活观赏内容.messages) 生活观赏内容.messages = [];
  生活观赏内容.messages.push({ sender: '', content: '', time: '' });
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染内容(el, 生活观赏内容, true);
}
window.生活观赏聊天加消息 = 生活观赏聊天加消息;

function 生活观赏聊天删消息(mi) {
  if (!生活观赏内容 || !生活观赏内容.messages) return;
  生活观赏内容.messages.splice(mi, 1);
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染内容(el, 生活观赏内容, true);
}
window.生活观赏聊天删消息 = 生活观赏聊天删消息;
