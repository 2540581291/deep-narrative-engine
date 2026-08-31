// 角色聊天 · 主界面（Tab 壳 + 角色选择）
var 角色聊天导航 = [
  { id: 'chars', label: '👤 选择角色' },
  { id: 'free', label: '💬 自由聊天' },
  { id: 'im', label: '📱 聊天软件' },
  { id: 'history', label: '📋 历史记录' },
];
var 角色聊天当前视图 = 'chars';
var 角色聊天Api = null;
var 角色聊天当前角色 = null;
var 角色聊天当前会话 = null; // { id, mode, messages, ... } 实时内存会话
var 角色聊天性别 = '女性';

// 从角色库读取角色，按性别过滤
function 角色聊天读角色(性别) {
  return Store.character.list().then(function(items) {
    return (items || []).filter(function(item) {
      var g = item.identity && item.identity.basicInfo && item.identity.basicInfo.gender;
      return g === 性别;
    });
  });
}

function 角色聊天切换视图(view) {
  角色聊天当前视图 = view;
  var el = document.getElementById('char-chatContent');
  if (!el) return;
  if (!角色聊天Api) {
    角色聊天Api = 渲染标签栏(el, 角色聊天导航, { active: view, subId: 'ccViewContent', onSwitch: function(v){ 角色聊天切换视图(v); } });
  } else {
    角色聊天Api.setActive(view);
  }
  var vEl = 角色聊天Api.sub;
  switch (view) {
    case 'chars':   渲染角色聊天角色列表(vEl); break;
    case 'free':    渲染自由聊天(vEl); break;
    case 'im':      渲染聊天软件(vEl); break;
    case 'history': 渲染聊天历史(vEl); break;
  }
}
window.角色聊天切换视图 = 角色聊天切换视图;
window.ccSwitchView = 角色聊天切换视图;

function 渲染角色聊天角色列表(el) {
  var 性别映射 = { '女性': '👩', '男性': '👨', '伪娘': '👘', '扶她': '⚧' };
  var h = '<div class="n-card mb-12">';
  h += '<div class="fs-12 fw-600 c-fg mb-8">👤 选择角色</div>';
  h += '<div class="fs-10 c-fg3 mb-8">从角色库中选择一位角色开始聊天。支持自由对话、聊天软件模拟两种聊天模式。</div>';
  h += '<div class="flex gap-6 mb-0">';
  if (!角色聊天性别) 角色聊天性别 = Object.keys(性别映射)[0];
  Object.keys(性别映射).forEach(function(g) {
    var sel = 角色聊天性别 === g;
    h += '<div class="char-cat-tab flex-1' + (sel ? ' act' : '') + '" onclick="角色聊天设性别(\'' + g + '\')">';
    h += '<div class="char-cat-tab-icon">' + 性别映射[g] + '</div><div class="char-cat-tab-label">' + g + '</div></div>';
  });
  h += '</div></div>';

  h += '<div class="n-card mb-12"><div id="ccCharList"></div></div>';
  el.innerHTML = h;
  角色聊天读角色(角色聊天性别).then(function(items) {
    var body = document.getElementById('ccCharList');
    if (!body) return;
    if (!items.length) {
      body.innerHTML = '<div class="fs-11 c-fg3 p-12-0 text-center">' + (Store.character && '该性别下暂无角色，请先到「角色卡」创建角色。' || '暂无角色，请先到「角色卡」创建角色。') + '</div>';
      return;
    }
    var hh = '<table style="width:100%;border-collapse:collapse;font-size:11px">';
    hh += '<thead><tr style="border-bottom:1px solid var(--border)">';
    hh += '<th style="padding:6px 8px;text-align:left;color:var(--fg3);font-weight:600">角色</th>';
    hh += '<th style="padding:6px 8px;text-align:left;color:var(--fg3);font-weight:600">头衔</th>';
    hh += '<th style="padding:6px 8px;text-align:left;color:var(--fg3);font-weight:600">年龄</th>';
    hh += '<th style="padding:6px 8px;text-align:left;color:var(--fg3);font-weight:600">品级</th>';
    hh += '<th style="padding:6px 8px;text-align:left;color:var(--fg3);font-weight:600">聊天</th>';
    hh += '</tr></thead><tbody>';
    items.forEach(function(item) {
      var bi = item.identity && item.identity.basicInfo || {};
      var safeTitle = (item.title || bi.title || '').replace(/'/g, "\\'");
      var name = bi.name || item.name || item.title || '未命名';
      var icon = bi.icon || '👤';
      var rarityColor = ({'金':'var(--accent2)','紫':'var(--accent)','蓝':'var(--fg2)','绿':'var(--success)','白':'var(--fg3)'})[bi.rarity] || 'var(--fg3)';
      hh += '<tr style="border-bottom:1px solid var(--border)">';
      hh += '<td style="padding:8px"><div class="flex items-center gap-4"><span class="fs-16 flex-shrink-0">' + icon + '</span><span class="fw-700 c-fg">' + escHtml(name) + '</span></div></td>';
      hh += '<td style="padding:8px;color:var(--fg2)">' + escHtml(bi.title || '') + '</td>';
      hh += '<td style="padding:8px;color:var(--fg2)">' + escHtml(bi.age != null ? bi.age + '岁' : '') + '</td>';
      hh += '<td style="padding:8px">';
      if (bi.rarity) hh += '<span class="fs-10 fw-700" style="color:' + rarityColor + ';padding:1px 4px;border-radius:3px;border:1px solid ' + rarityColor + '">' + bi.rarity + '</span>';
      hh += '</td>';
      hh += '<td style="padding:8px">';
      hh += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="角色聊天开始(\'' + safeTitle + '\',\'free\')">💬 自由聊天</span> ';
      hh += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="角色聊天开始(\'' + safeTitle + '\',\'im\')">📱 模拟</span>';
      hh += '</td></tr>';
    });
    hh += '</tbody></table>';
    body.innerHTML = hh;
  });
}
window.渲染角色聊天角色列表 = 渲染角色聊天角色列表;

function 角色聊天设性别(g) {
  角色聊天性别 = g;
  渲染角色聊天角色列表(document.getElementById('ccViewContent'));
}
window.角色聊天设性别 = 角色聊天设性别;

// 选择角色并启动会话（mode: 'free' | 'im'）
function 角色聊天开始(title, mode) {
  Store.character.get(title).then(function(data) {
    if (!data) { toast('角色数据不存在'); return; }
    var charData = JSON.parse(JSON.stringify(data));
    var name = (data.identity && data.identity.basicInfo && data.identity.basicInfo.name) || data.name || data.title || title;
    角色聊天当前角色 = { name: name, title: title, data: charData };
    角色聊天当前会话 = {
      id: 'cc_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      mode: mode,
      character: name,
      charData: charData,
      messages: [],
      pureDialogue: false,
      date: new Date().toISOString(),
    };
    角色聊天切换视图(mode === 'im' ? 'im' : 'free');
  });
}
window.角色聊天开始 = 角色聊天开始;

// 共享：纯对白规则文案（放在 user 侧，与实时对话/AI 代聊共用，保证两处提示词完全一致）
var 角色聊天纯对白规则 = '【本会话为纯对白模式】你只能输出角色说出的台词本身（含语气词、口头禅），禁止任何动作、神态、表情、心理描写，禁止使用星号*或括号（）来标注动作，不要描写「抬起头」「冷哼一声」之类，直接说话。';

// 共享：构建角色扮演 system 提示词（聊天类实时多轮交互，二元模板唯一例外）
// system 只放角色资料章节，不声明「你是谁」，也不放对话规则——身份声明与对话规则统一放在 user 侧
function 角色聊天构建System(角色数据) {
  var 资料 = typeof 角色卡身份与外貌 === 'function' ? 角色卡身份与外貌(角色数据.data) : '';
  return 资料 ? '【角色资料】\n' + 资料 : '';
}

// 共享：构建 user 侧的对话规则（对话形式 + 纯对白 + 本次要求），拼接在身份段之后
function 角色聊天构建用户规则(角色数据, 额外要求) {
  var parts = [];
  parts.push('【对话形式】以聊天方式交流。用户为「我」，聊天对象为角色「' + 角色数据.name + '」。');
  if (角色聊天当前会话 && 角色聊天当前会话.pureDialogue) parts.push(角色聊天纯对白规则);
  if (额外要求) parts.push('【本次会话要求】' + 额外要求);
  return parts.join('\n\n');
}
window.角色聊天构建System = 角色聊天构建System;
window.角色聊天构建用户规则 = 角色聊天构建用户规则;

// 共享：统一构建完整 user 侧提示词（从 cc_suggest_reply 模板渲染，与 AI 代聊完全同构）
// speaker 不同只影响身份段与任务描述；实时对话与 AI 代聊共用同一模板
function 角色聊天构建用户提示(角色, speaker, 额外要求) {
  var 任务 = speaker === 'user'
    ? '请以我（用户）的身份，结合以上对话，向聊天对象' + 角色.name + '自然地接一句话（1-3句，口语化，符合当前对话氛围和两人关系）。'
    : '请完全以' + 角色.name + '的身份、语气和视角，结合以上对话，向我（用户）自然地回复一句话（1-3句，口语化，符合当前对话氛围和两人关系），保持角色一致性，绝不跳出角色。';
  var rendered = renderPrompt('cc_suggest_reply', {
    charData: typeof 角色卡身份与外貌 === 'function' ? 角色卡身份与外貌(角色.data) : '',
    identity: 角色聊天构建身份段(角色, speaker),
    dialogueRule: 角色聊天构建用户规则(角色, 额外要求),
    history: 角色聊天构建对话记录(角色, 角色聊天当前会话),
    task: 任务,
  });
  return rendered.user;
}
window.角色聊天构建用户提示 = 角色聊天构建用户提示;

// 共享：持久化当前会话
function 角色聊天保存会话() {
  if (!角色聊天当前会话) return;
  var snapshot = JSON.parse(JSON.stringify(角色聊天当前会话));
  Store.charChat.save(snapshot.id, snapshot).then(function() {}).catch(function(err) { console.error('[charChat] save failed', err); });
}
window.角色聊天保存会话 = 角色聊天保存会话;

// ===== AI 代聊（二元模板：registerAiField + openAiGenPanel + fillFn + 提示词模板 cc_suggest_reply）=====
// 共享：切换纯对白模式（开关状态直接注入提示词）
function 角色聊天切纯对白() {
  if (!角色聊天当前会话) return;
  角色聊天当前会话.pureDialogue = !角色聊天当前会话.pureDialogue;
  角色聊天保存会话();
  角色聊天切换视图(角色聊天当前视图);
}
window.角色聊天切纯对白 = 角色聊天切纯对白;

// 共享：统一对话身份说明
// speaker: 'role'（实时对话，AI 扮演角色发言）| 'user'（AI 代聊，AI 帮用户发言）
function 角色聊天构建身份段(角色, speaker) {
  if (speaker === 'user') {
    return '【当前身份】我（用户）\n【聊天对象】' + 角色.name + '\n【任务】你是我（用户）的对话助手。请你以我（用户）的身份，向聊天对象' + 角色.name + '说出一句话。';
  }
  return '【当前身份】' + 角色.name + '（聊天对象）\n【聊天对象】我（用户）\n【任务】你是我（用户）的对话助手。请完全以' + 角色.name + '的身份、语气和视角，向我（用户）说出一句话，保持角色一致性，绝不跳出角色。';
}
window.角色聊天构建身份段 = 角色聊天构建身份段;

// 共享：统一对话记录格式化（我：… / 角色名：…）
function 角色聊天构建对话记录(角色, 会话) {
  var msgs = (会话 && 会话.messages) || [];
  var lines = msgs.filter(function(m) { return m.role !== 'system'; })
    .map(function(m) { return (m.role === 'user' ? '我' : 角色.name) + '：' + m.content; });
  return lines.length ? lines.join('\n') : '（还没有任何对话）';
}
window.角色聊天构建对话记录 = 角色聊天构建对话记录;

function 角色聊天AI代聊(fieldId, inputId, modeLabel) {
  if (!角色聊天当前角色 || !角色聊天当前会话) {
    toast('请先在「选择角色」中开始一段聊天');
    return;
  }
  openAiGenPanel(fieldId);
}
window.角色聊天AI代聊 = 角色聊天AI代聊;

// 共享：AI 代聊弹窗预设方向（二元模板的 preset chips，多选后拼进任务）
var 角色聊天代聊方向 = [
  { label: '⏭ 推进到下一场景', dir: '推进场景：让对话向前发展，开启一个新的场景或情境，比如时间跳跃、换到新地点、出现新人物或事件。', category: 'structure' },
  { label: '🔁 换个话题', dir: '换个话题：自然地中断当前话题，转到另一个全新的、有趣的话题上。', category: 'structure' },
];
if (typeof AI_QUICK_PRESETS === 'object' && AI_QUICK_PRESETS !== null) {
  AI_QUICK_PRESETS.cc_suggest_reply = 角色聊天代聊方向;
}

function 角色聊天AI代聊上下文() {
  var role = 角色聊天当前角色;
  var session = 角色聊天当前会话;
  if (!role || !session) return null;
  var 资料 = typeof 角色卡身份与外貌 === 'function' ? 角色卡身份与外貌(role.data) : JSON.stringify(role.data).slice(0, 2000);
  return renderPrompt('cc_suggest_reply', {
    charData: 资料,
    identity: 角色聊天构建身份段(role, 'user'),
    dialogueRule: 角色聊天构建用户规则(role),
    history: 角色聊天构建对话记录(role, session),
    task: '请以我（用户）的身份，结合以上对话，向聊天对象' + role.name + '自然地接一句话（1-3句，口语化，符合当前对话氛围和两人关系）。',
  });
}registerAiField('cc_suggest_reply', 'AI 代聊 · 以我的身份接话', 角色聊天AI代聊上下文, {
  rawText: true,
  fillFn: function(result) {
    var input = document.getElementById('ccFreeInput') || document.getElementById('ccImInput');
    if (!input || !result) return;
    input.value = result;
    input.focus();
  },
});

registerPageRoute('char-chat', function() { 角色聊天切换视图(角色聊天当前视图); });
window.角色聊天当前角色 = 角色聊天当前角色;
window.角色聊天当前会话 = 角色聊天当前会话;
