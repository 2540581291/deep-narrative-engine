// ============================================================
// 生活观赏 · 主界面（3 大 TAB 壳：朋友圈 / 聊天书信 / 电话）
// 概念：用户是【旁观者】，看角色与角色之间如何交流——
//       朋友圈动态、聊天/书信、电话。AI 负责生成全部内容，界面以「观赏」为主。
// ============================================================

// 顶层 TAB（情景交集在最前，是朋友圈/线上聊天/书信留言/电话的源头）
var 生活观赏导航 = [
  { id: 'story',   label: '📖 情景交集', icon: '📖', desc: '设定角色为何、如何交集——一切互动的源头', hint: '选择角色，AI 编织出一段让他们产生交集的情景（世界观、交集机制、时间线、细节）。' },
  { id: 'moments', label: '🌐 社交动态', icon: '🌐', desc: '角色发布的社交动态（微信朋友圈 / QQ空间）', hint: '选择 1-4 位角色，AI 生成他们的社交动态流（微信朋友圈/QQ空间，发布于评论）。最好先有情景交集。' },
  { id: 'ochat',   label: '💬 线上聊天', icon: '💬', desc: '微信/QQ/短信等线上即时交流', hint: '选择 2 位角色，AI 生成微信/QQ/短信风格的在线聊天。最好先有情景交集。' },
  { id: 'oletters',label: '✉️ 书信便条', icon: '✉️', desc: '角色之间的书信 / 便条往来', hint: '选择 2 位角色，AI 生成书信/便条往来（信件/便签样式）。最好先有情景交集。' },
  { id: 'phone',   label: '📞 电话', icon: '📞', desc: '两个角色之间的通话记录与对话', hint: '选择 2 位角色（主叫/被叫），AI 生成通话记录与逐句对话。最好先有情景交集。' },
  { id: 'video',   label: '🎥 视频通话', icon: '🎥', desc: '两个角色之间的视频通话（带聊天的画面）', hint: '选择 2 位角色，AI 生成视频通话，并给出通话中的画面与对话。最好先有情景交集。' },
];
var 生活观赏类型映射 = {};
生活观赏导航.forEach(function(n) { 生活观赏类型映射[n.id] = n; });
var 生活观赏Api = null;

var 生活观赏当前类型 = 'story';     // 默认进入「情景交集」
var 生活观赏子视图 = 'list';        // list | create | view
var 生活观赏当前标题 = null;
var 生活观赏场景 = '';
var 生活观赏角色 = [];             // [{name, title, data}]
var 生活观赏内容 = null;           // 结构化内容（不同类型结构不同）
var 生活观赏预览 = false;
var 生活观赏创建时间 = null;
var 生活观赏关联故事 = null;       // 当前关联的情景交集（供互动生成时注入上下文）
var 生活观赏关联日 = null;         // 关联故事里聚焦的某一天（索引）
var 生活观赏关联段 = null;         // 关联故事里聚焦的某一天中的某时间段（索引）
var 生活观赏方向 = [];             // 创作界面上勾选的「生成方向」（移出 AI 弹窗）
var 生活观赏富化目标 = null;       // 富化目标：{ kind:'segment'|'day', di, si }
var 生活观赏插入目标 = null;       // 事件插入目标：{ di, si }（si = 插入位置）
var 生活观赏插入指令 = '';         // 事件插入指令（用户输入的"点什么事件"）
var 生活观赏新日目标 = null;       // 新增/生成某天：{ index }（index = 天索引）
var 生活观赏选定方向 = null;       // 已选到的候选日程方向：{ title, desc }
var 生活观赏背景集 = {};        // 每个 TAB 独立的快捷背景集合：{ type: [desc,...] }
// 时间段固定选项（时间线内每天只允许这 5 个时间段）
var 生活观赏时间段表 = ['上午', '中午', '下午', '晚上', '午夜'];
window.生活观赏时间段表 = 生活观赏时间段表;

// 给某天找一个还没被占用的下一个时间段（用于新增时间段时默认）
function 生活观赏下一时间段(day) {
  var used = (day && day.segments || []).map(function(s) { return s.time; });
  for (var i = 0; i < 生活观赏时间段表.length; i++) {
    if (used.indexOf(生活观赏时间段表[i]) < 0) return 生活观赏时间段表[i];
  }
  return 生活观赏时间段表[生活观赏时间段表.length - 1];
}
window.生活观赏下一时间段 = 生活观赏下一时间段;

// 时间规范化：把任意值强制归一到五个固定时间段之一
function 生活观赏规范时间(t) {
  if (!t) return '上午';
  if (生活观赏时间段表.indexOf(t) >= 0) return t;
  var map = { '清晨':'上午','早上':'上午','早晨':'上午','早':'上午','午间':'中午','正午':'中午','午后':'下午','傍晚':'下午','黄昏':'下午','晚间':'晚上','夜晚':'晚上','夜':'晚上','深夜':'午夜','凌晨':'午夜','半夜':'午夜','午夜':'午夜' };
  return map[t] || '上午';
}
window.生活观赏规范时间 = 生活观赏规范时间;

// 时间段按固定顺序排序（上午→中午→下午→晚上→午夜；未知/空放最后）
function 生活观赏段排序(segs) {
  var 表 = (typeof 生活观赏时间段表 !== 'undefined') ? 生活观赏时间段表 : ['上午', '中午', '下午', '晚上', '午夜'];
  return (segs || []).slice().sort(function(a, b) {
    var ia = 表.indexOf(a.time); if (ia < 0) ia = 99;
    var ib = 表.indexOf(b.time); if (ib < 0) ib = 99;
    return ia - ib;
  });
}
window.生活观赏段排序 = 生活观赏段排序;

// 日期工具：YYYY-MM-DD → 周X；以及前后一天
function 生活观赏星期文本(dateStr) {
  if (!dateStr) return '';
  var names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  var dt = new Date(dateStr + 'T00:00:00');
  if (isNaN(dt.getTime())) return '';
  return names[dt.getDay()];
}
window.生活观赏星期文本 = 生活观赏星期文本;
function 生活观赏前后一日(dateStr, dir) {
  var dt = new Date(dateStr + 'T00:00:00');
  if (isNaN(dt.getTime())) return null;
  dt.setDate(dt.getDate() + dir);
  var y = dt.getFullYear();
  var m = ('0' + (dt.getMonth() + 1)).slice(-2);
  var d = ('0' + dt.getDate()).slice(-2);
  return y + '-' + m + '-' + d;
}
window.生活观赏前后一日 = 生活观赏前后一日;

// 生成方向预设（按类型；直接在创作界面上选择，不再放进 AI 弹窗）
var 生活观赏互动方向 = [
  { label: '🍵 日常温馨', dir: '日常温馨：体现角色之间平淡而温暖的日常互动，语言朴实自然。' },
  { label: '🔥 暧昧升温', dir: '暧昧升温：暗含情愫与张力，潜台词丰富，欲语还休。' },
  { label: '💥 冲突拉扯', dir: '冲突拉扯：角色之间有矛盾、误会或情感拉扯，对话有火药味。' },
  { label: '😏 幽默逗趣', dir: '幽默逗趣：语气轻快，带点调侃和冷笑话，朋友间的打闹感。' },
];
var 生活观赏故事方向 = [
  { label: '🔀 命运巧合', dir: '命运巧合：用一场偶然的相遇、一次巧合把他们拴在一起，带宿命感。' },
  { label: '📦 共同事件', dir: '共同事件：一件需要合作/被迫同行的事（共同旅行、项目、事故、委托）把他们联系。' },
  { label: '🏠 邻里日常', dir: '邻里日常：同一片屋檐、同一座城市、同一家店，因日常而相遇相熟。' },
  { label: '🎭 身份错位', dir: '身份错位：身份、立场、时空本不相干，因一次误会或身份交错而相遇（关公战秦琼）。' },
];
var 生活观赏方向集 = { story: 生活观赏故事方向, moments: 生活观赏互动方向, ochat: 生活观赏互动方向, oletters: 生活观赏互动方向, phone: 生活观赏互动方向, video: 生活观赏互动方向 };

// 切换 / 复位方向
function 生活观赏清空方向() { 生活观赏方向 = []; }
function 生活观赏切方向(d) {
  var i = 生活观赏方向.indexOf(d);
  if (i >= 0) 生活观赏方向.splice(i, 1);
  else 生活观赏方向.push(d);
  var el = document.getElementById('loDirs');
  if (el) 渲染生活观赏方向(el);
}
window.生活观赏切方向 = 生活观赏切方向;

// ===== 快捷背景设定（生成前的背景/环境快捷选项 · 多选组合 · 每个 TAB 独立一组）=====
var 生活观赏背景预设 = [
  { label: '🏫 校园', desc: '校园/学校：角色是师生长辈、同窗、校园里的交集。' },
  { label: '🏘 街坊邻里', desc: '街坊邻里/社区：角色是邻居、街坊、同一片屋檐下的交集。' },
  { label: '🏢 都市职场', desc: '都市职场/公司：角色是同事、上下级、写字楼里的交集。' },
  { label: '🏥 医院', desc: '医院/诊所：角色是医生护士、病患家属的交叉。' },
  { label: '🌾 乡村田园', desc: '乡村田园/山村：角色是村民、农家、乡野间的交集。' },
  { label: '🍷 夜场酒吧', desc: '夜场/酒吧/娱乐场所：角色是常客、酒保、熟人的交集。' },
  { label: '👑 宫廷宅院', desc: '宫廷/古代宅院：角色是主子、侍女、宅邸内的交集。' },
  { label: '🏨 旅行同居', desc: '旅行/合租/旅馆：角色是旅伴、室友，因同住同行交集。' },
];
window.生活观赏背景预设 = 生活观赏背景预设;
// 当前 TAB 已选的背景 desc 列表
function 生活观赏当前背景() {
  return (生活观赏背景集[生活观赏当前类型] || []);
}
window.生活观赏当前背景 = 生活观赏当前背景;
// 多选切换
function 生活观赏设背景(b) {
  if (!生活观赏背景集[生活观赏当前类型]) 生活观赏背景集[生活观赏当前类型] = [];
  var arr = 生活观赏背景集[生活观赏当前类型];
  var i = arr.indexOf(b);
  if (i >= 0) arr.splice(i, 1); else arr.push(b);
  var el = document.getElementById('loBg');
  if (el) 渲染生活观赏背景(el);
}
window.生活观赏设背景 = 生活观赏设背景;
// 拼成文本（供 AI 上下文）
function 生活观赏背景文本() {
  var arr = 生活观赏当前背景();
  return arr.length ? arr.join('；') : '';
}
window.生活观赏背景文本 = 生活观赏背景文本;
function 渲染生活观赏背景(el) {
  if (!el) return;
  var sel = 生活观赏当前背景();
  var h = '<div class="fs-11 c-fg2 mb-6">🎯 快捷背景（可多选组合，定性整体环境/氛围，每个 TAB 独立）</div>';
  h += '<div class="flex gap-6 flex-wrap">';
  生活观赏背景预设.forEach(function(p) {
    var on = sel.indexOf(p.desc) >= 0;
    h += '<span class="preset-chip' + (on ? ' preset-active' : '') + '" onclick="生活观赏设背景(\'' + escHtml(p.desc) + '\')">' + escHtml(p.label) + '</span>';
  });
  h += '</div>';
  el.innerHTML = h;
}
window.渲染生活观赏背景 = 渲染生活观赏背景;

// ===== 视图切换（TAB）=====
function 生活观赏切换视图(type) {
  if (type && 生活观赏类型映射[type]) 生活观赏当前类型 = type;
  // 切换 TAB 时重置编辑器（各类型内容结构不同），回到列表
  生活观赏子视图 = 'list';
  生活观赏当前标题 = null;
  生活观赏场景 = '';
  生活观赏角色 = [];
  生活观赏内容 = null;
  生活观赏预览 = false;
  生活观赏创建时间 = null;
  生活观赏关联故事 = null;
  生活观赏关联日 = null;
  生活观赏关联段 = null;
  生活观赏清空方向();
  // 快捷背景按每个 TAB 独立保留，切换 TAB 不清空
  生活观赏渲染();
}
window.生活观赏切换视图 = 生活观赏切换视图;

function 生活观赏切换子视图(view) {
  // 「创作」= 从非创作状态进入时，作为一次全新创作（与「＋ 新建」一致）；已在创作中则保持
  if (view === 'create') {
    if (生活观赏子视图 !== 'create') { 生活观赏新建(); return; }
    生活观赏渲染();
    return;
  }
  生活观赏子视图 = view;
  生活观赏渲染();
}
window.生活观赏切换子视图 = 生活观赏切换子视图;

// ===== 主渲染 =====
function 生活观赏渲染() {
  var el = document.getElementById('life-observeContent');
  if (!el) return;
  var items = 生活观赏导航.map(function(n) { return { id: n.id, label: n.label }; });
  if (!生活观赏Api) {
    生活观赏Api = 渲染标签栏(el, items, { active: 生活观赏当前类型, subId: 'loBody', onSwitch: function(t){ 生活观赏切换视图(t); } });
  } else {
    生活观赏Api.setActive(生活观赏当前类型);
  }
  生活观赏渲染界面();
}

function 生活观赏渲染界面() {
  var sub = 生活观赏Api ? 生活观赏Api.sub : null;
  if (!sub) return;
  var h = '';
  // 统一的子导航（第一：列表；第二：创作）→ 紧凑次级分段
  var 激活子 = (生活观赏子视图 === 'create') ? 'create' : 'list';
  h += '<div class="tl-subnav mb-10">';
  h += '<div class="tl-subitem' + (激活子 === 'list' ? ' act' : '') + '" onclick="生活观赏切换子视图(\'list\')">📋 列表</div>';
  h += '<div class="tl-subitem' + (激活子 === 'create' ? ' act' : '') + '" onclick="生活观赏切换子视图(\'create\')">✦ 创作</div>';
  h += '</div>';
  h += '<div id="loContentView"></div>';
  sub.innerHTML = h;
  var body = document.getElementById('loContentView');
  if (!body) return;
  if (生活观赏子视图 === 'create') 生活观赏渲染创建(body);
  else if (生活观赏子视图 === 'view') 生活观赏渲染观看(body);
  else 生活观赏渲染列表(body);
}
window.生活观赏渲染 = 生活观赏渲染;

// ===== 观赏列表（仅当前类型的记录）=====
function 生活观赏渲染列表(el) {
  var info = 生活观赏类型映射[生活观赏当前类型];
  el.innerHTML = '<div class="text-sm text-muted">加载中...</div>';
  Store.shenghuoGuanshang.list().then(function(items) {
    var recs = (items || []).filter(function(r) { return r.type === 生活观赏当前类型; });
    var hh = '<div class="mb-10"><button class="btn-new" onclick="生活观赏新建()">＋ 新建</button></div>';
    if (!recs.length) {
      hh += '<div class="placeholder-text">暂无' + info.label + '记录 — 点上方「＋ 新建」，选角色后由 AI 生成。</div>';
      el.innerHTML = hh;
      return;
    }
    recs.forEach(function(rec) {
      var chars = (rec.characters || []).map(function(c) { return c.name || c.title; }).join('、');
      var 概要 = 生活观赏记录概要(rec);
      hh += '<div class="n-card p-10 mb-8 cur-ptr" style="background:var(--bg2);cursor:pointer" onclick="生活观赏进入编辑(\'' + escHtml(rec.title || '') + '\')" title="点击进入编辑">';
      hh += '<div class="flex justify-between items-center mb-4">';
      hh += '<div class="flex gap-6 items-center flex-wrap">';
      hh += '<span class="badge-tag">' + info.icon + ' ' + escHtml(info.label) + '</span>';
      hh += '<span class="fw-600 fs-14">' + escHtml(rec.title || '') + '</span>';
      hh += '</div>';
      hh += '<div class="flex gap-4">';
      hh += '<span class="btn-secondary btn-sm c-error" style="font-size:10px" onclick="event.stopPropagation();生活观赏删除记录(\'' + escHtml(rec.title || '') + '\')">🗑 删除</span>';
      hh += '</div></div>';
      if (chars) hh += '<div class="fs-11 c-fg2 mb-4">👥 ' + escHtml(chars) + '</div>';
      if (rec.scenario) hh += '<div class="fs-11 c-fg2 mb-4" style="opacity:.8">📌 ' + escHtml(String(rec.scenario).slice(0, 50)) + (rec.scenario.length > 50 ? '…' : '') + '</div>';
      if (概要) hh += '<div class="fs-11 c-fg3">' + escHtml(概要) + '</div>';
      hh += '</div>';
    });
    el.innerHTML = hh;
  }).catch(function() {
    el.innerHTML = '<div class="placeholder-text">读取失败</div>';
  });
}
window.生活观赏渲染列表 = 生活观赏渲染列表;

function 生活观赏记录概要(rec) {
  var c = rec.content;
  if (!c) return '';
  if (rec.type === 'story') return (c.mechanism || '情景交集').slice(0, 40);
  if (c.posts) return c.posts.length + ' 条动态';
  if (c.messages) return (c.platform || '交流') + ' · ' + c.messages.length + ' 条消息';
  if (c.calls) return (rec.type === 'video' ? c.calls.length + ' 通视频通话' : c.calls.length + ' 通电话');
  return '';
}

// 初始化该类型的最小可编辑结构（零锁定：打开即见可编辑表单，AI 作为快速填充）
function 生活观赏初始化内容() {
  if (生活观赏当前类型 === 'story') {
    生活观赏内容 = 生活观赏内容 || {
      world: '', mechanism: '',
      days: [ { date: '', weekday: '', segments: [ { time: '上午', event: '', roles: [] } ] } ],
    };
  } else if (生活观赏当前类型 === 'moments') {
    生活观赏内容 = 生活观赏内容 || { platform: '微信朋友圈', posts: [ { author: '', time: '', text: '', likes: 0, comments: [ { author: '', time: '', text: '', replies: [] } ] } ] };
  } else if (生活观赏当前类型 === 'ochat') {
    生活观赏内容 = 生活观赏内容 || { platform: '微信', talkType: 'private', groupName: '', context: '', messages: [ { sender: '', content: '', time: '' } ] };
  } else if (生活观赏当前类型 === 'oletters') {
    生活观赏内容 = 生活观赏内容 || { platform: '书信', context: '', messages: [ { sender: '', content: '', time: '' } ] };
  } else if (生活观赏当前类型 === 'video') {
    生活观赏内容 = 生活观赏内容 || { calls: [ { caller: '', callee: '', time: '', duration: '', location: '', moments: [ { time: '接通', screen: '', dialogue: [] } ] } ] };
  } else {
    生活观赏内容 = 生活观赏内容 || { calls: [ { caller: '', callee: '', time: '', duration: '', summary: '', dialogue: [] } ] };
  }
}
window.生活观赏初始化内容 = 生活观赏初始化内容;

// ===== 创作界面（AI 优先：导入角色 → 场景 → AI 生成）=====
function 生活观赏渲染创建(el) {
  var info = 生活观赏类型映射[生活观赏当前类型];
  var h = '<div class="n-card mb-12">';
  h += '<div class="flex justify-between items-center mb-8">';
  h += '<div class="fs-12 fw-600 c-fg">' + (生活观赏当前标题 ? '✏️ 编辑' : '✦ 新建') + info.label + '</div>';
  h += '<div class="flex gap-4"><span class="btn-secondary btn-sm" style="font-size:10px" onclick="生活观赏切换子视图(\'list\')">取消</span></div>';
  h += '</div>';

  // 角色（全局导入 UI）
  h += '<div class="fs-12 fw-600 c-fg mb-6">👥 参与角色</div>';
  h += '<div class="fs-10 c-fg3 mb-8" style="opacity:.85">💡 ' + escHtml(info.hint || info.desc) + '</div>';
  h += '<div id="loCastChips" class="mb-8"></div>';
  h += '<div class="mb-10"><button class="btn-out btn-sm" style="font-size:11px" onclick="生活观赏导入角色()">📂 导入角色卡（角色选择器）</button></div>';

  // 关联故事背景（仅互动类型）
  if (生活观赏当前类型 !== 'story') h += '<div id="loStoryLink" class="mb-10"></div>';

  // 快捷背景设定
  h += '<div class="mb-10"><div id="loBg"></div></div>';

  // 场景
  h += '<div class="mb-10"><label class="fs-11 c-fg2" style="display:block;margin-bottom:4px">场景 / 关键线索（可留空，AI 自动构建）</label>';
  h += '<textarea id="loScenario" class="llm-input" style="width:100%;min-height:52px;resize:vertical" placeholder="例如：周末傍晚，两人约在一家安静的咖啡馆聊近况…（留空则 AI 自行编造日常）" oninput="生活观赏设场景(this.value)">' + escHtml(生活观赏场景 || '') + '</textarea></div>';

  // 生成方向（非情景交集在创作界面直接选；情景交集改为先生成候选方向）
  if (生活观赏当前类型 !== 'story') h += '<div id="loDirs" class="mb-10"></div>';

  // AI 生成
  h += '<div class="mb-12"><button class="btn" style="width:100%" onclick="生活观赏生成()">🤖 让 AI 生成「' + escHtml(info.label) + '」</button>';
  h += '<div class="fs-10 c-fg3 mt-4" style="text-align:center">' + (生活观赏当前类型 === 'story'
    ? '先由 AI 给出 5 个候选交集方向，挑一个后再正式生成情景交集。'
    : 'AI 会根据所选角色的设定、场景与方向，自动生成完整的互动内容并保存。') + '</div></div>';
  h += '</div>';

  // 内容区
  h += '<div class="n-card"><div class="flex justify-between items-center mb-6">';
  h += '<div class="fs-12 fw-600 c-fg">📄 内容预览</div>';
  h += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="生活观赏切换预览()">' + (生活观赏预览 ? '✏️ 编辑' : '👁 预览观看') + '</span>';
  h += '</div><div id="loContent"><div class="placeholder-text">还没有内容 — 点上方「让 AI 生成」为你创作。</div></div></div>';

  el.innerHTML = h;
  渲染生活观赏阵容();
  渲染生活观赏背景(document.getElementById('loBg'));
  if (生活观赏当前类型 !== 'story') 渲染生活观赏故事关联(document.getElementById('loStoryLink'));
  渲染生活观赏方向(document.getElementById('loDirs'));
  // 零锁定：打开即见可编辑结构（AI 作为快速填充）
  生活观赏初始化内容();
  var contentEl = document.getElementById('loContent');
  if (contentEl) 生活观赏渲染内容(contentEl, 生活观赏内容, !生活观赏预览);
}
window.生活观赏渲染创建 = 生活观赏渲染创建;

// 生成方向 chips（创作界面直接选择）
function 渲染生活观赏方向(el) {
  if (!el) return;
  var presets = 生活观赏方向集[生活观赏当前类型] || [];
  if (!presets.length) { el.innerHTML = ''; return; }
  var h = '<div class="fs-11 c-fg2 mb-6">🎯 生成方向（可选，可多选 — 作为本次生成的基调）</div>';
  h += '<div class="flex gap-6 flex-wrap">';
  presets.forEach(function(p) {
    var on = 生活观赏方向.indexOf(p.dir) >= 0;
    h += '<span class="preset-chip' + (on ? ' preset-active' : '') + '" onclick="生活观赏切方向(\'' + escHtml(p.dir) + '\')">' + escHtml(p.label) + '</span>';
  });
  h += '</div>';
  el.innerHTML = h;
}
window.渲染生活观赏方向 = 渲染生活观赏方向;

// 关联故事背景下拉（列出所有 story 记录）
function 渲染生活观赏故事关联(el) {
  if (!el) return;
  Store.shenghuoGuanshang.list().then(function(items) {
    if (!el) return;
    var stories = (items || []).filter(function(r) { return r.type === 'story'; });
    if (!stories.length) { el.innerHTML = '<div class="fs-11 c-fg3 mb-6">（暂无情景交集可关联 — 先去「情景交集」创建）</div>'; return; }
    var h = '<div class="fs-11 c-fg2 mb-6">📎 关联情景交集（可选：作为这次互动的由来，AI 据此生成）</div>';
    h += '<select class="llm-input llm-select" style="width:100%;margin-bottom:6px" onchange="生活观赏选故事(this.value)">';
    h += '<option value="">— 不关联 —</option>';
    stories.forEach(function(s) {
      var sel = 生活观赏关联故事 && 生活观赏关联故事.title === s.title;
      h += '<option value="' + escHtml(s.title || '') + '"' + (sel ? ' selected' : '') + '>' + escHtml(s.title || '') + '</option>';
    });
    h += '</select>';
    el.innerHTML = h;
    if (生活观赏关联故事) 生活观赏故事日段行(el);
  }).catch(function() { if (el) el.innerHTML = ''; });
}
window.渲染生活观赏故事关联 = 渲染生活观赏故事关联;

// 关联故事后：选择「聚焦到某一天 / 某一天中的某时间段」
function 生活观赏故事日段行(el) {
  var story = 生活观赏关联故事;
  var days = (story && story.content && story.content.days) || [];
  if (!days.length) return;
  var h = '';
  h += '<div class="flex gap-6 items-center mb-4"><span class="fs-11 c-fg2" style="width:64px;flex-shrink:0">聚焦到</span>';
  h += '<select class="llm-input llm-select" style="flex:1" onchange="生活观赏选日(this.value)">';
  h += '<option value="">— 整个情景 —</option>';
  days.forEach(function(d, di) {
    var lab = (d.date || '') + (d.weekday ? ' ' + d.weekday : '') + '（' + ((d.segments || []).length) + ' 段）';
    h += '<option value="' + di + '"' + (生活观赏关联日 === di ? ' selected' : '') + '>' + escHtml(lab) + '</option>';
  });
  h += '</select></div>';
  if (生活观赏关联日 != null && days[生活观赏关联日]) {
    var day = days[生活观赏关联日];
    var segs = day.segments || [];
    h += '<div class="flex gap-6 items-center mb-4"><span class="fs-11 c-fg2" style="width:64px;flex-shrink:0">时间段</span>';
    h += '<select class="llm-input llm-select" style="flex:1" onchange="生活观赏选段(this.value)">';
    h += '<option value="">— 整一天 —</option>';
    segs.forEach(function(s, si) {
      h += '<option value="' + si + '"' + (生活观赏关联段 === si ? ' selected' : '') + '>' + escHtml((s.time || '') + '：' + ((s.event || '').slice(0, 18))) + '</option>';
    });
    h += '</select></div>';
  }
  el.insertAdjacentHTML('beforeend', h);
}
window.生活观赏故事日段行 = 生活观赏故事日段行;

// 选定关联故事：带入其角色，作为互动来源；清空聚焦
function 生活观赏选故事(title) {
  if (!title) { 生活观赏关联故事 = null; 生活观赏关联日 = null; 生活观赏关联段 = null; 生活观赏渲染(); return; }
  Store.shenghuoGuanshang.get(title).then(function(rec) {
    if (!rec) { toast('未找到该故事'); return; }
    生活观赏关联故事 = rec;
    生活观赏关联日 = null;
    生活观赏关联段 = null;
    if ((rec.characters || []).length) {
      生活观赏角色 = (rec.characters || []).map(function(c) { return { name: c.name, title: c.title, data: c.data || {} }; });
    }
    生活观赏渲染();
  });
}
window.生活观赏选故事 = 生活观赏选故事;

// 选某一天 / 某时间段
function 生活观赏选日(idx) {
  生活观赏关联日 = (idx === '' || idx == null) ? null : parseInt(idx, 10);
  生活观赏关联段 = null;
  生活观赏渲染();
}
window.生活观赏选日 = 生活观赏选日;
function 生活观赏选段(idx) {
  生活观赏关联段 = (idx === '' || idx == null) ? null : parseInt(idx, 10);
  生活观赏渲染();
}
window.生活观赏选段 = 生活观赏选段;

// 观看界面（只读）
function 生活观赏渲染观看(el) {
  var info = 生活观赏类型映射[生活观赏当前类型];
  var chars = 生活观赏角色.map(function(c) { return c.name; }).join('、');
  var h = '<div class="flex gap-4 mb-10"><span class="btn-out btn-sm" style="font-size:10px" onclick="生活观赏切换子视图(\'list\')">← 返回列表</span>';
  h += '<span class="btn-out btn-sm" style="font-size:10px" onclick="生活观赏编辑当前()">✏️ 编辑</span>';
  h += '<span class="btn-out btn-sm" style="font-size:10px" onclick="生活观赏删除当前()">🗑 删除</span></div>';
  h += '<div class="n-card mb-12"><div class="fs-12 fw-600 c-fg mb-4">👁 ' + escHtml(生活观赏当前标题 || '') + '</div>';
  h += '<div class="flex gap-6 flex-wrap mb-4">';
  h += '<span class="badge-tag">' + info.icon + ' ' + escHtml(info.label) + '</span>';
  if (chars) h += '<span class="fs-11 c-fg2">👥 ' + escHtml(chars) + '</span>';
  if (生活观赏场景) h += '<span class="fs-11 c-fg2" style="opacity:.8">📌 ' + escHtml(生活观赏场景) + '</span>';
  h += '</div></div>';
  h += '<div id="loContent"></div>';
  el.innerHTML = h;
  var contentEl = document.getElementById('loContent');
  if (contentEl) 生活观赏渲染内容(contentEl, 生活观赏内容, false);
}
window.生活观赏渲染观看 = 生活观赏渲染观看;

// ===== 新建 / 打开 / 编辑 / 保存 / 删除 =====
function 生活观赏新建() {
  生活观赏子视图 = 'create';
  生活观赏当前标题 = null;
  生活观赏场景 = '';
  生活观赏角色 = [];
  生活观赏内容 = null;
  生活观赏预览 = false;
  生活观赏创建时间 = null;
  生活观赏关联故事 = null;
  生活观赏关联日 = null;
  生活观赏关联段 = null;
  生活观赏清空方向();
  生活观赏背景集[生活观赏当前类型] = [];
  生活观赏渲染();
}
window.生活观赏新建 = 生活观赏新建;

function 生活观赏打开记录(title) {
  Store.shenghuoGuanshang.get(title).then(function(rec) {
    if (!rec) { toast('未找到该记录'); return; }
    生活观赏当前标题 = title;
    生活观赏当前类型 = (rec.type || 'moments');
    生活观赏场景 = rec.scenario || '';
    生活观赏角色 = (rec.characters || []).map(function(c) { return { name: c.name, title: c.title, data: c.data || {} }; });
    生活观赏内容 = rec.content || null;
    生活观赏创建时间 = rec.createdAt || null;
    生活观赏预览 = false;
    生活观赏关联故事 = null;
    生活观赏关联日 = null;
    生活观赏关联段 = null;
    生活观赏子视图 = 'view';
    生活观赏渲染();
  });
}
window.生活观赏打开记录 = 生活观赏打开记录;

// 列表点击整行：打开该记录并直接进入编辑（create）
function 生活观赏进入编辑(title) {
  Store.shenghuoGuanshang.get(title).then(function(rec) {
    if (!rec) { toast('未找到该记录'); return; }
    生活观赏当前标题 = title;
    生活观赏当前类型 = (rec.type || 'moments');
    生活观赏场景 = rec.scenario || '';
    生活观赏角色 = (rec.characters || []).map(function(c) { return { name: c.name, title: c.title, data: c.data || {} }; });
    生活观赏内容 = rec.content || null;
    生活观赏创建时间 = rec.createdAt || null;
    生活观赏预览 = false;
    生活观赏关联故事 = null;
    生活观赏关联日 = null;
    生活观赏关联段 = null;
    生活观赏清空方向();
    生活观赏子视图 = 'create';
    生活观赏渲染();
  });
}
window.生活观赏进入编辑 = 生活观赏进入编辑;

function 生活观赏编辑当前() {
  生活观赏子视图 = 'create';
  生活观赏渲染();
}
window.生活观赏编辑当前 = 生活观赏编辑当前;

function 生活观赏删除当前() {
  生活观赏删除记录(生活观赏当前标题);
}
window.生活观赏删除当前 = 生活观赏删除当前;

// 用参与角色 + 类型 自动生成有意义的标题
function 生活观赏自动标题() {
  var info = 生活观赏类型映射[生活观赏当前类型] || 生活观赏类型映射.moments;
  var names = 生活观赏角色.map(function(c) { return c.name; });
  var who = names.slice(0, 2).join(' × ');
  if (!who) who = '角色';
  return who + ' · ' + info.label;
}
window.生活观赏自动标题 = 生活观赏自动标题;

function 生活观赏保存() {
  var title = 生活观赏当前标题 || 生活观赏自动标题();
  if (!生活观赏内容) { toast('内容为空，请先让 AI 生成或手动填写'); return; }
  生活观赏当前标题 = title;
  var rec = {
    title: title,
    type: 生活观赏当前类型,
    scenario: 生活观赏场景,
    characters: 生活观赏角色.map(function(c) { return { name: c.name, title: c.title, data: c.data }; }),
    content: 生活观赏内容,
    createdAt: 生活观赏创建时间 || fmtDate(new Date()),
    updatedAt: fmtDate(new Date()),
  };
  if (!生活观赏创建时间) 生活观赏创建时间 = rec.createdAt;
  Store.shenghuoGuanshang.save(title, rec).then(function() {
    toast('已保存');
  }).catch(function(err) { console.error('[生活观赏] save failed', err); toast('保存失败'); });
}
window.生活观赏保存 = 生活观赏保存;

// ===== 即时保存：编辑改动即落盘（防抖 300ms）=====
var 生活观赏保存定时器 = null;
// 防抖定时器
function 生活观赏即时保存() {
  if (生活观赏保存定时器) clearTimeout(生活观赏保存定时器);
  生活观赏保存定时器 = setTimeout(function() {
    var title = 生活观赏当前标题;
    // 已确定标题的（编辑已有记录）才即时落盘；新建未定型时由「AI 生成 / 保存」负责确定标题
    if (!title) { 生活观赏保存定时器 = null; return; }
    var rec = {
      title: title,
      type: 生活观赏当前类型,
      scenario: 生活观赏场景,
      characters: 生活观赏角色.map(function(c) { return { name: c.name, title: c.title, data: c.data }; }),
      content: 生活观赏内容,
      createdAt: 生活观赏创建时间 || fmtDate(new Date()),
      updatedAt: fmtDate(new Date()),
    };
    if (!生活观赏内容) { 生活观赏保存定时器 = null; return; }
    if (!生活观赏创建时间) 生活观赏创建时间 = rec.createdAt;
    Store.shenghuoGuanshang.save(title, rec).catch(function(err) { console.error('[生活观赏] 即时保存失败', err); });
    // 保存成功后刷新列表（若当前在列表视图）——避免 stale
    生活观赏更新列表节流();
    生活观赏保存定时器 = null;
  }, 300);
}
window.生活观赏即时保存 = 生活观赏即时保存;
// 列表刷新节流：即时保存后不打断编辑视图，切回列表时自然刷新
var 生活观赏列表刷新定时器 = null;
function 生活观赏更新列表节流() {
  if (生活观赏子视图 !== 'list') return;   // 编辑/观看中不动作
  if (生活观赏列表刷新定时器) return;
  生活观赏列表刷新定时器 = setTimeout(function() {
    生活观赏列表刷新定时器 = null;
    var el = document.getElementById('loContentView');
    if (el) 生活观赏渲染列表(el);
  }, 200);
}
window.生活观赏更新列表节流 = 生活观赏更新列表节流;

function 生活观赏删除记录(title) {
  confirmDialog('确定删除该记录？', function() {
    Store.shenghuoGuanshang.delete(title).then(function() {
      toast('已删除');
      生活观赏子视图 = 'list';
      生活观赏渲染();
    });
  });
}
window.生活观赏删除记录 = 生活观赏删除记录;

// ===== 角色：全局导入 UI =====
function 生活观赏导入角色() {
  if (typeof stcdOpenCharPicker !== 'function') { toast('角色选择器未就绪'); return; }
  stcdOpenCharPicker('lo-pick-char', { mode: 'card', card: 1, onPick: function(found) {
    var bi = (found.identity && found.identity.basicInfo) || {};
    var name = bi.name || found.name || found.title || '未命名';
    var title = found.title || bi.title || found.name || name;
    var exists = 生活观赏角色.some(function(c) { return c.name === name || c.title === title; });
    if (exists) { toast('该角色已在阵容中'); return; }
    生活观赏角色.push({ name: name, title: title, data: JSON.parse(JSON.stringify(found)) });
    var el = document.getElementById('loCastChips');
    if (el) 渲染生活观赏阵容();
    toast('已加入：' + name);
  }});
}
window.生活观赏导入角色 = 生活观赏导入角色;

function 生活观赏移除角色(idx) {
  生活观赏角色.splice(idx, 1);
  var el = document.getElementById('loCastChips');
  if (el) 渲染生活观赏阵容();
}
window.生活观赏移除角色 = 生活观赏移除角色;

function 渲染生活观赏阵容() {
  var el = document.getElementById('loCastChips');
  if (!el) return;
  if (!生活观赏角色.length) {
    el.innerHTML = '<div class="fs-11 c-fg3">尚未加入角色 — 点「📂 导入角色卡」从角色选择器选择。</div>';
    return;
  }
  var h = '<div class="flex gap-6 flex-wrap">';
  生活观赏角色.forEach(function(c, i) {
    var bi = (c.data && c.data.identity && c.data.identity.basicInfo) || {};
    h += '<span class="tag-chip" style="gap:4px">' + escHtml(bi.icon || '👤') + ' ' + escHtml(c.name) + '<span style="cursor:pointer;color:#e06c75" onclick="生活观赏移除角色(' + i + ')">✕</span></span>';
  });
  h += '</div>';
  el.innerHTML = h;
}
window.渲染生活观赏阵容 = 渲染生活观赏阵容;

function 生活观赏设场景(v) { 生活观赏场景 = v; 生活观赏即时保存(); }
window.生活观赏设场景 = 生活观赏设场景;

// ===== 通用路径写入：posts.0.author / messages.1.content / calls.0.dialogue.0.text =====
function 生活观赏设(path, value) {
  var segs = String(path).split('.');
  var obj = 生活观赏内容;
  if (!obj) return;
  for (var i = 0; i < segs.length - 1; i++) {
    obj = obj[segs[i]];
    if (obj == null) return;
  }
  obj[segs[segs.length - 1]] = value;
  生活观赏即时保存();
}
window.生活观赏设 = 生活观赏设;

// ===== 内容区渲染分发（按当前类型）=====
function 生活观赏渲染内容(el, content, editable) {
  content = content || 生活观赏内容;
  if (!content) {
    el.innerHTML = '<div class="placeholder-text">还没有内容 — 点「让 AI 生成」为你创作。</div>';
    return;
  }
  if (生活观赏当前类型 === 'story' && typeof 生活观赏渲染故事 === 'function') 生活观赏渲染故事(el, content, !!editable);
  else if (生活观赏当前类型 === 'moments' && typeof 生活观赏渲染朋友圈 === 'function') 生活观赏渲染朋友圈(el, content, !!editable);
  else if (生活观赏当前类型 === 'ochat' && typeof 生活观赏渲染线上聊天 === 'function') 生活观赏渲染线上聊天(el, content, !!editable);
  else if (生活观赏当前类型 === 'oletters' && typeof 生活观赏渲染书信留言 === 'function') 生活观赏渲染书信留言(el, content, !!editable);
  else if (生活观赏当前类型 === 'phone' && typeof 生活观赏渲染电话 === 'function') 生活观赏渲染电话(el, content, !!editable);
  else if (生活观赏当前类型 === 'video' && typeof 生活观赏渲染视频 === 'function') 生活观赏渲染视频(el, content, !!editable);
  else el.innerHTML = '<div class="placeholder-text">该类型渲染函数缺失</div>';
}
window.生活观赏渲染内容 = 生活观赏渲染内容;

function 生活观赏切换预览() {
  生活观赏预览 = !生活观赏预览;
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染内容(el, 生活观赏内容, !生活观赏预览);
}
window.生活观赏切换预览 = 生活观赏切换预览;

// ===== AI 生成上下文 =====
// 关联故事导出：若聚焦到某天/某段，则只导出该天的信息；否则导出整个故事
function 生活观赏故事导出聚焦(story) {
  var c = story && story.content;
  if (!c) return '';
  if (生活观赏关联日 != null && c.days && c.days[生活观赏关联日]) {
    var day = c.days[生活观赏关联日];
    var parts = [];
    if (c.world) parts.push('世界观：' + c.world);
    if (c.mechanism) parts.push('交集机制：' + c.mechanism);
    if (生活观赏关联段 != null && day.segments && day.segments[生活观赏关联段]) {
      var seg = day.segments[生活观赏关联段];
      var roles = (seg.roles && seg.roles.length) ? '（涉及：' + seg.roles.join('、') + '）' : '';
      parts.push('【聚焦·这一天 ' + (seg.time || '') + ' 段】' + (seg.event || '') + roles);
    } else {
      var daylines = (day.segments || []).map(function(s) {
        var r = (s.roles && s.roles.length) ? '（涉及：' + s.roles.join('、') + '）' : '';
        return (s.time || '') + ' ' + (s.event || '') + r;
      }).join('；');
      parts.push('【聚焦·这一天】' + (day.date || '') + (day.weekday ? ' ' + day.weekday : '') + '：' + (daylines || '（暂无内容）'));
    }
    return parts.join('\n');
  }
  return (typeof 生活观赏故事导出文本 === 'function') ? 生活观赏故事导出文本(story) : '';
}
window.生活观赏故事导出聚焦 = 生活观赏故事导出聚焦;

function 生活观赏生成上下文() {
  var info = 生活观赏类型映射[生活观赏当前类型] || 生活观赏类型映射.moments;
  var chars = 生活观赏角色.map(function(c) { return c.name; }).join('、');
  var charData = 生活观赏角色.map(function(c) {
    return typeof 角色卡身份与外貌 === 'function'
      ? ('【' + c.name + '】\n' + 角色卡身份与外貌(c.data))
      : ('【' + c.name + '】\n' + JSON.stringify(c.data).slice(0, 1500));
  }).join('\n\n');

  var 结构要求;
  if (生活观赏当前类型 === 'story') {
    结构要求 = '请生成一个「情景交集」，核心是【一条总览时间线】。输出 JSON：{"world":"世界观/环境设定","mechanism":"交集机制：把本不相干的角色联系起来的、具体的一种方式/事件（关公战秦琼）","days":[{"date":"YYYY-MM-DD","weekday":"周X","segments":[{"time":"上午|中午|下午|晚上|午夜","event":"这个时间发生/在干什么（一句概括）","roles":["涉及的角色名"]}]}]}。要求：1) days 逐日连续推进、不跳日；2) 这是一条【总览时间线】——把所有参与角色的时间都合并到同一条上，而不是按角色分开；3) 【每一天的 segments 必须依次包含 上午、中午、下午、晚上、午夜 这 5 个时间段，且严格按 上午→中午→下午→晚上→午夜 的顺序排列——不要缺漏、不要乱序、不要把午夜放前面】；4) 每个时间段若同时涉及多个人/多个交集，把涉及的人物填进 roles 数组（否则留空）；5) 时间线是【概要】，只列大致的、符合逻辑的日子与时间段，不要展开细节描写；6) date 用年月日 YYYY-MM-DD + 周X；7) 时间线【必须从"正常的、交集发生之前"的状态开始】——起初角色各自独立、正常生活（互不相识或没有交集），然后在某一天【依据交集机制自然触发交集、发生相遇或联结】，之后才进入交集之后；【绝不能一开始就设定成两人/多人早已相识、早已交集过】；8) 【基调必须契合整体【色情/成人】氛围与角色设定】——这是情欲向的创作，交集可以走向暧昧、诱惑、欲望、支配、禁忌等方向；【绝不要写成"温情、互相救赎、治愈纯爱"这种与情欲无缘、甚至与整体基调相反、本末倒置的方向】；9) 【每天、每段时间都不要重复、要有变化、要逐日推进】：时间线应【一天比一天不同、情节/冲突/情欲展开不断演化】——不同天的安排、处境、互动、遭遇应各不相同；同一天的上午/中午/下午/晚上/午夜也各有内容、不能套同一个模板；【绝对避免】"每天中午各自吃饭""每晚都被按在窗边操弄、呻吟声交叠"这种千篇一律的重复——每一段都要写它【独特的一次具体事件】，让剧情一步步往前、角色关系一步步变化。';
  } else if (生活观赏当前类型 === 'moments') {
    结构要求 = '请生成一条社交动态流（微信朋友圈 / QQ空间），包含 2-4 条不同角色发布的动态。每组动态的【评论要丰富、人多】：每条动态的评论来自【很多不同的人】——既可以是参与角色，也可以是虚构的路人/同学/朋友/老师/粉丝等（人数多、名字各异、数量 5~20+ 条）；评论内容【多种多样】（夸赞、调侃、疑问、捧场、吃瓜、@人、表情等）；评论之间要【相互回复、逐层延伸】——给出 replies 数组，每条 reply 用 replyTo 指明它回复的是谁，形成对话链路（如 A 评论→B 回复 A→A 再回复 B）。输出 JSON：{"platform":"微信朋友圈|QQ空间","posts":[{"author":"角色名","time":"时间","text":"动态正文","likes":数字,"comments":[{"author":"评论者","time":"时间","text":"评论内容","replies":[{"author":"回复者","time":"时间","text":"回复内容","replyTo":"被回复者"}]}]}]}';
  } else if (生活观赏当前类型 === 'ochat') {
    结构要求 = '请生成角色之间的线上聊天（微信/QQ/短信）。输出 JSON：{"platform":"微信|QQ|短信","talkType":"private|group","groupName":"群聊名称（仅群聊填，单聊留空）","context":"本次交流的背景一句话","messages":[{"sender":"角色名","content":"内容","time":"时间"}]}。要求：1) talkType 用 private（两人单聊）或 group（群聊，多人参与），根据【本次涉及的参与人数】决定——若同一场景下多人一起聊就用 group，只有两人就用 private；2) 群聊时 messages 里 sender 可用群昵称/角色名，名字多个各异，并可【@其他成员】如 "@孙婷婷 哈哈哈哈😂"；3) 这是【文字聊天】，角色只能看到文字和 emoji 表情（如😂😏😭🐶），【绝不能用括号（）写动作/神态/心理】——例如（僵住了）、（笑）、（脸红）这种在聊天里是不可能出现的，想表达情绪就用 emoji 或“哈哈/笑哭/无语”这类口吻；4) 单聊为两人、群聊可多人。';
  } else if (生活观赏当前类型 === 'oletters') {
    结构要求 = '请生成两个角色之间的书信/便条往来。输出 JSON：{"platform":"书信|便条","context":"本次通联的背景一句话","messages":[{"sender":"角色名","content":"内容","time":"时间"}]}';
  } else if (生活观赏当前类型 === 'video') {
    结构要求 = '请生成两个角色之间的视频通话，要【有一步一步随时间推进的感觉】。真正的视频通话：双方看到的画面会随时间变化(表情/动作/穿着/背景)，说的话也随时间变化。输出 JSON：{"calls":[{"caller":"角色名","callee":"角色名","time":"通话开始时间","duration":"总时长","location":"各自所在/场景","moments":[{"time":"通话内时刻（如 接通 / 三分钟后 / 临近挂断）","screen":"这一时刻的画面：对方的样子、表情、动作、穿着、背景，像一张视频截图","dialogue":[{"speaker":"角色名","content":"这一时刻说的话"}]}]}]}。要求：moments 要有【多个、至少 3~6 个】，按时间顺序【逐步推进】——每段画面和说的话都随进程变化（如寒暄→切入正题→情绪变化→结束），不要只有一个画面；每段给一句画面描述 + 这段的对白。';
  } else {
    结构要求 = '请生成两个角色之间的电话/通话记录。输出 JSON：{"calls":[{"caller":"角色名","callee":"角色名","time":"时间","duration":"时长","summary":"通话摘要","dialogue":[{"speaker":"角色名","content":"内容"}]}]}';
  }

  // 关联故事背景（仅互动类型；故事类型自身不注入）
  var 关联故事块 = '';
  if (生活观赏当前类型 !== 'story' && 生活观赏关联故事) {
    var st = 生活观赏故事导出聚焦(生活观赏关联故事);
    if (st) 关联故事块 = '\n\n【关联情景交集（本次互动的由来）】\n' + st;
  }

  var 场景 = 生活观赏场景 || (生活观赏当前类型 === 'story'
    ? '请围绕这些角色构建一段有生活质感、能自圆其说的交集故事。'
    : '这是一段这些角色之间自然的生活片段，请根据角色设定自行构建一个日常生活场景。');
  var 方向块 = '';
  if (生活观赏方向.length) 方向块 = '\n\n【生成方向】请整体朝以下方向创作：' + 生活观赏方向.join('；');
  // 快捷背景设定
  var 背景块 = '';
  var 背景文本 = (typeof 生活观赏背景文本 === 'function') ? 生活观赏背景文本() : '';
  if (背景文本) 背景块 = '\n\n【背景设定】' + 背景文本;
  // 情景交集：把用户从候选方向里挑中的「已选方向」注入
  var 已选方向块 = '';
  if (生活观赏当前类型 === 'story' && 生活观赏选定方向) {
    已选方向块 = '\n\n【已选方向】' + (生活观赏选定方向.title ? ('「' + 生活观赏选定方向.title + '」\n') : '') + (生活观赏选定方向.desc || '');
  }
  var text = '【观察/创作形式】' + info.desc + '\n【参与角色】' + (chars || '请选择参与角色') + '\n\n【角色设定】\n' + (charData || '（暂无角色设定）') + '\n\n【场景设定】\n' + 场景 + 背景块 + 关联故事块 + 方向块 + 已选方向块 + '\n\n【结构要求】' + 结构要求;
  return { user: text };
}
window.生活观赏生成上下文 = 生活观赏生成上下文;

// 情景交集 · 候选方向（第一步）：生成 5 个候选交集方向的上下文
function 生活观赏交集生成选项上下文() {
  var info = 生活观赏类型映射.story || 生活观赏类型映射.moments;
  var chars = 生活观赏角色.map(function(c) { return c.name; }).join('、');
  var charData = 生活观赏角色.map(function(c) {
    return typeof 角色卡身份与外貌 === 'function'
      ? ('【' + c.name + '】\n' + 角色卡身份与外貌(c.data))
      : ('【' + c.name + '】\n' + JSON.stringify(c.data).slice(0, 1500));
  }).join('\n\n');
  var 场景 = 生活观赏场景 || '请围绕这些角色构建一段有生活质感、能自圆其说的交集故事。';
  var 背景块 = '';
  var 背景文本 = (typeof 生活观赏背景文本 === 'function') ? 生活观赏背景文本() : '';
  if (背景文本) 背景块 = '\n【背景设定】' + 背景文本 + '\n';
  var text = '【创作形式】' + info.desc + '\n【参与角色】' + (chars || '请选择参与角色') + '\n\n【角色设定】\n' + (charData || '（暂无角色设定）') + '\n\n【场景/契机】\n' + 场景 + 背景块 + '\n\n【任务】请为这段情景交集构思 5 个差异鲜明、有张力的【候选交集方向】（不同的事件/命运走向/世界设定/主题），供用户挑选一个后再正式生成。每个方向一两句话。只输出 JSON：{"options":[{"id":1,"title":"方向名","desc":"一句话构思梗概"},{"id":2,"title":"…","desc":"…"},{"id":3,"title":"…","desc":"…"},{"id":4,"title":"…","desc":"…"},{"id":5,"title":"…","desc":"…"}]}，恰好 5 个，只输出JSON。\n【基调】这是情欲向创作：方向应朝吸引/暧昧/诱惑/欲望/支配/禁忌等【色情氛围】走；【不要】"温情治愈、互相救赎、纯爱"这种与情欲无缘、本末倒置的方向。';
  return { user: text };
}
window.生活观赏交集生成选项上下文 = 生活观赏交集生成选项上下文;

// 情景交集 · 候选方向（第一步入口）
function 生活观赏交集生成选项() {
  if (!生活观赏角色.length) { toast('请先导入至少一位角色'); return; }
  if (typeof generateAiDirectNow === 'function') generateAiDirectNow('life_story_options');
  else toast('AI 生成入口未就绪');
}
window.生活观赏交集生成选项 = 生活观赏交集生成选项;

// 展示 5 个候选交集方向（点选一个 → 正式生成）
function 生活观赏交集显示选项(d) {
  var opts = (d && Array.isArray(d.options)) ? d.options : [];
  if (!opts.length) { toast('候选生成结果为空'); return; }
  var h = '<div class="mcard" style="max-width:640px">';
  h += '<h3 style="font-size:0.95em;margin-bottom:8px">✨ 挑选一个交集方向，再正式生成情景交集</h3>';
  h += '<p style="font-size:0.78em;color:var(--fg2);margin-bottom:10px">先看这 ' + opts.length + ' 个候选方向，点选一个，即按该方向生成这段情景交集（世界观 / 交集机制 / 总览时间线）。</p>';
  h += '<div style="display:flex;flex-direction:column;gap:8px;max-height:56vh;overflow-y:auto">';
  opts.forEach(function(o) {
    var title = (o.title || ('候选' + o.id));
    var desc = (o.desc || '');
    h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px 12px;cursor:pointer" onclick="生活观赏交集选选项(\'' + escHtml(JSON.stringify(o).replace(/'/g, "\\'")) + '\')">';
    h += '<div style="font-size:12px;font-weight:700;color:var(--accent2);margin-bottom:3px">' + escHtml(title) + '</div>';
    h += '<div style="font-size:11px;color:var(--fg2);line-height:1.6">' + escHtml(desc) + '</div>';
    h += '</div>';
  });
  h += '</div></div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
}
window.生活观赏交集显示选项 = 生活观赏交集显示选项;

// 用户选中一个候选 → 正式生成情景交集
function 生活观赏交集选选项(optJson) {
  var o = null; try { o = JSON.parse(optJson); } catch(e) {}
  if (!o) return;
  var ov = document.querySelector('.ovl');
  if (ov) ov.remove();
  生活观赏选定方向 = { title: o.title || '', desc: o.desc || '' };
  if (typeof generateAiDirectNow === 'function') generateAiDirectNow('life_story_gen');
  else toast('AI 生成入口未就绪');
}
window.生活观赏交集选选项 = 生活观赏交集选选项;

// ===== AI 生成入口 =====
// 情景交集：先生成 5 个候选交集方向供挑选；其它类型：一键直生成
function 生活观赏生成() {
  if (!生活观赏角色.length) { toast('请先导入至少一位角色'); return; }
  if (生活观赏当前类型 === 'story') { 生活观赏交集生成选项(); return; }
  var field = 'life_observe_gen';
  if (typeof generateAiDirectNow === 'function') generateAiDirectNow(field);
  else { toast('AI 生成入口未就绪'); }
}
window.生活观赏生成 = 生活观赏生成;

// 统一 AI 回填：按当前类型写入内容 → 自动保存 → 跳转到「观赏」视图
function 生活观赏AI回填(d) {
  if (!d) { toast('生成结果为空'); return; }
  try {
    if (生活观赏当前类型 === 'story') 生活观赏填充故事(d);
    else if (生活观赏当前类型 === 'moments') 生活观赏填充朋友圈(d);
    else if (生活观赏当前类型 === 'ochat') 生活观赏填充线上聊天(d);
    else if (生活观赏当前类型 === 'oletters') 生活观赏填充书信留言(d);
    else if (生活观赏当前类型 === 'phone') 生活观赏填充电话(d);
    else 生活观赏填充视频(d);
    if (!生活观赏当前标题) 生活观赏当前标题 = 生活观赏自动标题();
    生活观赏选定方向 = null;   // 情景交集：生成完清掉已选方向
    生活观赏保存();
    生活观赏子视图 = 'view';
    生活观赏预览 = false;
    生活观赏渲染();
  } catch(err) {
    console.error('[生活观赏] fill failed', err);
    toast('填充失败：' + (err.message || err));
  }
}
window.生活观赏AI回填 = 生活观赏AI回填;

registerAiField('life_observe_gen', 'AI 生成 · 生活观赏互动', 生活观赏生成上下文, {
  rawText: false,
  suggestPrompt: 'life_observe_gen',
  fillFn: 生活观赏AI回填,
});
registerAiField('life_story_gen', 'AI 生成 · 情景交集', 生活观赏生成上下文, {
  rawText: false,
  suggestPrompt: 'life_story_gen',
  fillFn: 生活观赏AI回填,
});
registerAiField('life_story_options', '候选交集方向', 生活观赏交集生成选项上下文, {
  rawText: false,
  suggestPrompt: 'life_story_options',
  fillFn: 生活观赏交集显示选项,
});

// ===== 情景交集 · 时间线「丰富」功能（初版只列概要，可对时间段/当天一键扩写）=====
// 目标：{ kind:'segment'|'day', di, si }  → 由下面的进入函数设置，供 contextFn 读取
function 生活观赏富化段(di, si) {
  if (!生活观赏内容 || !生活观赏内容.days || !生活观赏内容.days[di]) { toast('时间段不存在'); return; }
  生活观赏富化目标 = { kind: 'segment', di: di, si: si };
  if (typeof generateAiDirectNow === 'function') generateAiDirectNow('life_segment_enrich');
  else toast('AI 生成入口未就绪');
}
window.生活观赏富化段 = 生活观赏富化段;

function 生活观赏富化天(di) {
  if (!生活观赏内容 || !生活观赏内容.days || !生活观赏内容.days[di]) { toast('当天不存在'); return; }
  生活观赏富化目标 = { kind: 'day', di: di, si: null };
  if (typeof generateAiDirectNow === 'function') generateAiDirectNow('life_day_enrich');
  else toast('AI 生成入口未就绪');
}
window.生活观赏富化天 = 生活观赏富化天;

// 把当前情景交集的世界观/机制 + 角色设定 拼成共用上下文头
function 生活观赏富化公共头() {
  var parts = [];
  if (生活观赏内容 && 生活观赏内容.world) parts.push('世界观：' + 生活观赏内容.world);
  if (生活观赏内容 && 生活观赏内容.mechanism) parts.push('交集机制：' + 生活观赏内容.mechanism);
  var cast = 生活观赏角色.map(function(c) {
    return typeof 角色卡身份与外貌 === 'function' ? ('【' + c.name + '】\n' + 角色卡身份与外貌(c.data)) : ('【' + c.name + '】');
  }).join('\n\n');
  if (cast) parts.push('角色设定：\n' + cast);
  return parts.join('\n\n');
}

// 丰富单个时间段上下文
function 生活观赏段富化上下文() {
  var t = 生活观赏富化目标;
  if (!t || t.kind !== 'segment') return { user: '' };
  var day = 生活观赏内容.days[t.di];
  var seg = day && day.segments && day.segments[t.si];
  if (!seg) return { user: '' };
  var roles = (seg.roles && seg.roles.length) ? '（涉及：' + seg.roles.join('、') + '）' : '';
  var text = 生活观赏富化公共头()
    + '\n\n【当天】' + (day.date || '') + (day.weekday ? ' ' + day.weekday : '')
    + '\n【要丰富的时间段】' + (seg.time || '') + '——' + (seg.event || '') + roles
    + '\n\n请把这一时间段扩充成一段丰富、具体、符合角色性格与世界观的生活描写（几百字，可含环境、动作、对话、心理），只输出正文本身，不要任何前缀、说明或JSON。';
  return { user: text };
}
window.生活观赏段富化上下文 = 生活观赏段富化上下文;

// 丰富当天上下文
function 生活观赏日富化上下文() {
  var t = 生活观赏富化目标;
  if (!t || t.kind !== 'day') return { user: '' };
  var day = 生活观赏内容.days[t.di];
  if (!day) return { user: '' };
  var segs = (day.segments || []).map(function(s) {
    var roles = (s.roles && s.roles.length) ? '（涉及：' + s.roles.join('、') + '）' : '';
    return (s.time || '') + ' ' + (s.event || '') + roles;
  }).join('；');
  var text = 生活观赏富化公共头()
    + '\n\n【当天】' + (day.date || '') + (day.weekday ? ' ' + day.weekday : '')
    + '\n【当天概要】' + (segs || '（暂无概要）')
    + '\n\n请把这一天的每一个时间段（按上面【当天概要】的顺序，一一对应）都丰富成一段具体、有生活质感的描写（含环境、动作、对话、心理，体现角色互动）。输出 JSON：{"segments":[{"event":"第1段时间丰富后的内容"},{"event":"第2段时间丰富后的内容"}]}，条数必须与当天时间段数一致、按顺序对应，只输出JSON。';
  return { user: text };
}
window.生活观赏日富化上下文 = 生活观赏日富化上下文;

// 富化回填：把返回文本写入对应位置
registerAiField('life_segment_enrich', 'AI 丰富 · 时间段', 生活观赏段富化上下文, {
  rawText: true,
  suggestPrompt: 'life_segment_enrich',
  fillFn: function(result) {
    if (!result) { toast('丰富结果为空'); return; }
    var t = 生活观赏富化目标;
    if (t && t.kind === 'segment' && 生活观赏内容 && 生活观赏内容.days && 生活观赏内容.days[t.di] && 生活观赏内容.days[t.di].segments && 生活观赏内容.days[t.di].segments[t.si]) {
      生活观赏内容.days[t.di].segments[t.si].event = result.trim();
    }
    生活观赏富化目标 = null;
    生活观赏保存();
    生活观赏渲染();
  },
});
registerAiField('life_day_enrich', 'AI 丰富 · 当天', 生活观赏日富化上下文, {
  rawText: false,
  suggestPrompt: 'life_day_enrich',
  fillFn: function(d) {
    if (!d) { toast('丰富结果为空'); return; }
    var t = 生活观赏富化目标;
    if (t && t.kind === 'day' && 生活观赏内容 && 生活观赏内容.days && 生活观赏内容.days[t.di]) {
      var day = 生活观赏内容.days[t.di];
      var segs = (Array.isArray(d.segments) ? d.segments : []);
      (day.segments || []).forEach(function(seg, i) {
        if (segs[i] && segs[i].event != null) seg.event = String(segs[i].event);
      });
    }
    生活观赏富化目标 = null;
    生活观赏保存();
    生活观赏渲染();
  },
});

// ===== 情景交集 · 事件插入（对某个切入点插入灾难/意外等事件，可修改世界）=====
// 打开事件插入弹窗（di = 天索引；si = 插入位置，-1 表示追加到该天末尾）
function 生活观赏打开事件插入(di, si) {
  if (!生活观赏内容 || !生活观赏内容.days || !生活观赏内容.days[di]) return;
  var day = 生活观赏内容.days[di];
  生活观赏插入目标 = { di: di, si: (typeof si === 'number' && si >= 0) ? si : (day.segments || []).length };
  var h = '<div class="mcard" style="max-width:560px">';
  h += '<div style="border-bottom:1px solid var(--border);padding-bottom:10px;margin-bottom:10px">';
  h += '<h3 style="font-size:14px;margin-bottom:4px">🎬 插入事件 · ' + escHtml(day.date || '') + (day.weekday ? ' ' + day.weekday : '') + '</h3>';
  h += '<p style="font-size:10px;color:var(--fg3)">在时间线里插入一个事件（如重大灾害、事故、角色死亡、世界变化等），可调整/丰富这条情景。填入你想改的，或让 AI 生成。</p></div>';
  h += '<div style="margin-bottom:10px"><label class="fs-11 c-fg2" style="display:block;margin-bottom:4px">事件指令（想要发生什么？）</label>';
  h += '<textarea id="loEvtDirective" class="llm-input" style="width:100%;min-height:60px;resize:vertical" placeholder="例如：傍晚发生了一场 7 级地震 / 林亦在回家路上被车撞身亡 / 警方在公寓发现一具尸体…"></textarea></div>';
  h += '<div class="flex gap-6 mb-10"><div style="flex:1"><label class="fs-11 c-fg2" style="display:block;margin-bottom:4px">时间段（固定）</label>';
  h += '<select id="loEvtTime" class="llm-input llm-select" style="width:100%">';
  h += '<option value="">— 请选择 —</option>';
  (typeof 生活观赏时间段表 !== 'undefined' ? 生活观赏时间段表 : ['上午','中午','下午','晚上','午夜']).forEach(function(tv) {
    h += '<option value="' + tv + '">' + tv + '</option>';
  });
  h += '</select></div>';
  h += '<div style="flex:1"><label class="fs-11 c-fg2" style="display:block;margin-bottom:4px">涉及角色（如多人用、分隔，可留空）</label>';
  h += '<input id="loEvtRoles" class="llm-input" style="width:100%" placeholder="如 林亦、苏浅浅"></div></div>';
  h += '<div style="display:flex;gap:8px;justify-content:flex-end">';
  h += '<button class="btn-out btn-sm" onclick="this.closest(\'.ovl\').remove()">取消</button>';
  h += '<button class="btn-out btn-sm" onclick="生活观赏事件手动()">✍️ 手动插入</button>';
  h += '<button class="btn-main btn-sm" onclick="生活观赏事件AI()">🎯 让 AI 生成并插入</button>';
  h += '</div></div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  setTimeout(function() { var d = document.getElementById('loEvtDirective'); if (d) d.focus(); }, 100);
}
window.生活观赏打开事件插入 = 生活观赏打开事件插入;

// AI 生成并插入事件
function 生活观赏事件AI() {
  var d = document.getElementById('loEvtDirective');
  var directive = d ? d.value.trim() : '';
  if (!directive) { toast('请先填写事件指令'); return; }
  生活观赏插入指令 = directive;
  if (typeof generateAiDirectNow === 'function') generateAiDirectNow('life_event_gen');
  else toast('AI 生成入口未就绪');
}
window.生活观赏事件AI = 生活观赏事件AI;

// 手动插入事件（用弹窗里的直接输入）
function 生活观赏事件手动() {
  var d = document.getElementById('loEvtDirective');
  var tEl = document.getElementById('loEvtTime');
  var rEl = document.getElementById('loEvtRoles');
  var directive = d ? d.value.trim() : '';
  if (!directive) { toast('请先填写事件指令'); return; }
  var time = tEl ? tEl.value.trim() : '';
  var roles = (rEl ? rEl.value.trim() : '').split(/[、，,]/).map(function(s){ return s.trim(); }).filter(Boolean);
  生活观赏事件插入(生活观赏插入目标, time, directive, roles);
  var ov = document.querySelector('.ovl');
  if (ov) ov.remove();
  toast('已插入事件');
}
window.生活观赏事件手动 = 生活观赏事件手动;

// 生成事件上下文
function 生活观赏事件生成上下文() {
  var t = 生活观赏插入目标;
  if (!t || !生活观赏内容 || !生活观赏内容.days || !生活观赏内容.days[t.di]) return { user: '' };
  var day = 生活观赏内容.days[t.di];
  var 当天已列 = (day.segments || []).map(function(s) {
    var roles = (s.roles && s.roles.length) ? '（涉及：' + s.roles.join('、') + '）' : '';
    return (s.time || '') + ' ' + (s.event || '') + roles;
  }).join('；');
  var text = 生活观赏富化公共头()
    + '\n\n【目标日期】' + (day.date || '') + (day.weekday ? ' ' + day.weekday : '')
    + '\n【当天已有内容】' + (当天已列 || '（暂无）')
    + '\n【要插入的事件指令】' + 生活观赏插入指令
    + '\n\n请根据以上世界设定与角色，生成一个具体、有冲击力的事件（可以是灾难、意外、角色死亡、重大变故等，也可将指令中的变化实打实写出来），并结合当天已有内容，输出 JSON：{"time":"上午|中午|下午|晚上|午夜（五选一）","event":"这个事件的具体描述","roles":["涉及的角色名"]}。只输出JSON。';
  return { user: text };
}
window.生活观赏事件生成上下文 = 生活观赏事件生成上下文;

// 事件插入：把 {time,event,roles} 插入到目标天（位置 si）
function 生活观赏事件插入(t, time, event, roles) {
  if (!t || !生活观赏内容 || !生活观赏内容.days || !生活观赏内容.days[t.di]) return;
  var day = 生活观赏内容.days[t.di];
  if (!day.segments) day.segments = [];
  var si = (typeof t.si === 'number' && t.si >= 0 && t.si <= day.segments.length) ? t.si : day.segments.length;
  day.segments.splice(si, 0, { time: (typeof 生活观赏规范时间 === 'function' ? 生活观赏规范时间(time) : time), event: event || '', roles: roles || [] });
}
window.生活观赏事件插入 = 生活观赏事件插入;

// 事件生成回填
registerAiField('life_event_gen', 'AI 插入 · 事件', 生活观赏事件生成上下文, {
  rawText: false,
  suggestPrompt: 'life_event_gen',
  fillFn: function(d) {
    if (!d) { toast('生成结果为空'); return; }
    var t = 生活观赏插入目标;
    生活观赏事件插入(t, d.time || '', d.event || '', (Array.isArray(d.roles) ? d.roles : []).map(function(r){return String(r);}));
    生活观赏插入指令 = '';
    生活观赏插入目标 = null;
    var ov = document.querySelector('.ovl');
    if (ov) ov.remove();
    生活观赏保存();
    生活观赏渲染();
    toast('已插入事件');
  },
});

// ===== 情景交集 · AI 推断互动行为（总览时间线上标记：哪些时间段可能产生朋友圈/线上聊天/书信/电话）=====
var 生活观赏行为标签 = { wxmoments: '微信朋友圈', qzone: 'QQ空间', weixin: '微信', qq: 'QQ', sms: '短信', letter: '书信', note: '便签', phone: '电话', video: '视频通话' };
window.生活观赏行为标签 = 生活观赏行为标签;

// 入口：点按钮 → 让 AI 对整个总览时间线做行为推断
function 生活观赏推断行为() {
  if (!生活观赏内容 || !生活观赏内容.days || !生活观赏内容.days.length) { toast('请先生成时间线'); return; }
  if (typeof generateAiDirectNow === 'function') generateAiDirectNow('life_infer_behaviors');
  else toast('AI 生成入口未就绪');
}
window.生活观赏推断行为 = 生活观赏推断行为;

// 推断上下文：把时间线（含索引）拼给 AI，让 AI 判断每个时间段可能的行为
function 生活观赏推断上下文() {
  if (!生活观赏内容) return { user: '' };
  var parts = [];
  if (生活观赏内容.world) parts.push('世界观：' + 生活观赏内容.world);
  if (生活观赏内容.mechanism) parts.push('交集机制：' + 生活观赏内容.mechanism);
  var cast = 生活观赏角色.map(function(c) {
    return typeof 角色卡身份与外貌 === 'function' ? ('【' + c.name + '】\n' + 角色卡身份与外貌(c.data)) : ('【' + c.name + '】');
  }).join('\n\n');
  if (cast) parts.push('角色设定：\n' + cast);

  var lines = [];
  (生活观赏内容.days || []).forEach(function(day, di) {
    lines.push('[天' + di + '] ' + (day.date || '') + (day.weekday ? ' ' + day.weekday : ''));
    (day.segments || []).forEach(function(s, si) {
      var roles = (s.roles && s.roles.length) ? '（涉及：' + s.roles.join('、') + '）' : '';
      lines.push('  [段' + si + '] ' + (s.time || '') + '：' + (s.event || '') + roles);
    });
  });
  parts.push('总览时间线：\n' + (lines.join('\n') || '（空）'));

  var text = parts.join('\n\n')
    + '\n\n【任务】请判断哪些时间段可能自然产生以下一种或几种社交/通讯行为（媒介尽量精确）：wxmoments(发【微信朋友圈】动态)、qzone(发【QQ空间】动态)、weixin(用【微信】聊天)、qq(用【QQ】聊天/发QQ信息)、sms(发【短信】)、letter(写【书信】)、note(写【便签/便条】)、phone(打【电话】)、video(打【视频通话】)。'
    + '\n【要求】每一个【天】至少应当能推断出一种行为（一天里总有些社交/通讯发生）；但不必让每一个【时间段】都有——某时间段确实没有行为可能，就不要硬标（省略即可）。宁可多标、不要漏标，但要合理、不生硬；同一时间段可同时给多个行为。每个行为尽量给出一句具体的内容猜想（content）。'
    + '\n输出 JSON：{"results":[{"day":天索引,"segment":段索引,"behaviors":["wxmoments","qq","phone","video"],"content":"猜想的具体内容"}]}。results 只列出【有行为】的时间段，且每个【天】至少出现 1 条。只输出JSON。';
  return { user: text };
}
window.生活观赏推断上下文 = 生活观赏推断上下文;

// 推断回填：把结果合并到对应时间段的 infer 字段
function 生活观赏推断回填(d) {
  if (!d || !Array.isArray(d.results)) { toast('推断结果为空'); return; }
  if (!生活观赏内容 || !生活观赏内容.days) return;
  var 命中 = 0;
  d.results.forEach(function(r) {
    var day = 生活观赏内容.days[r.day];
    if (!day || !day.segments) return;
    var seg = day.segments[r.segment];
    if (!seg) return;
    seg.infer = { behaviors: (Array.isArray(r.behaviors) ? r.behaviors : []), content: r.content || '' };
    命中++;
  });
  if (!命中) toast('AI 判断没有找到合理的时间段');
  生活观赏保存();
  生活观赏渲染();
}
window.生活观赏推断回填 = 生活观赏推断回填;

// 清除某段推断
function 生活观赏清除推断(di, si) {
  if (!生活观赏内容 || !生活观赏内容.days || !生活观赏内容.days[di] || !生活观赏内容.days[di].segments) return;
  delete 生活观赏内容.days[di].segments[si].infer;
  生活观赏渲染();
}
window.生活观赏清除推断 = 生活观赏清除推断;

// 点推断里的某个行为（朋友圈/线上聊天/书信/电话）→ 跳到对应 TAB，带上该时间段上下文，用于细化/生成
function 生活观赏跳转行为(behaviorTag, dayIdx, segIdx) {
  var ov = document.querySelector('.ovl');
  if (ov) ov.remove();
  var 映射 = {
    wxmoments: { type: 'moments', platform: '微信朋友圈' },
    qzone: { type: 'moments', platform: 'QQ空间' },
    weixin: { type: 'ochat', platform: '微信' },
    qq: { type: 'ochat', platform: 'QQ' },
    sms: { type: 'ochat', platform: '短信' },
    letter: { type: 'oletters', platform: '书信' },
    note: { type: 'oletters', platform: '便条' },
    phone: { type: 'phone', platform: '' },
    video: { type: 'video', platform: '' },
  };
  var m = 映射[behaviorTag];
  if (!m) return;
  var 故事内容 = 生活观赏内容; // 先抓取故事（避免后面被覆盖）
  var day = 故事内容 && 故事内容.days ? 故事内容.days[dayIdx] : null;
  var seg = day && day.segments ? day.segments[segIdx] : null;
  var 推断 = (seg && seg.infer && seg.infer.content) ? String(seg.infer.content) : '';
  var 角色 = (生活观赏角色 || []).slice();
  var 涉及 = (seg && seg.roles && seg.roles.length) ? seg.roles.slice() : [];
  var 段提示 = (day ? ((day.date || '') + (day.weekday ? ' ' + day.weekday : '') + (seg && seg.time ? ' ' + seg.time : '')) : '');
  var 场景 = 推断 ? (推断 + '（' + 段提示 + '，来自情景交集推断' + (涉及.length ? '；涉及：' + 涉及.join('、') : '') + '）') : ('基于情景交集推断：' + (段提示 || '某时间段') + (涉及.length ? '｜涉及：' + 涉及.join('、') : ''));

  生活观赏当前类型 = m.type;
  生活观赏角色 = 角色;
  生活观赏关联故事 = { title: 生活观赏当前标题 || '', content: 故事内容, characters: 角色 };
  生活观赏关联日 = dayIdx;
  生活观赏关联段 = (segIdx != null ? segIdx : null);
  生活观赏场景 = 场景;
  生活观赏当前标题 = null;
  生活观赏创建时间 = null;
  生活观赏方向 = [];
  生活观赏选定方向 = null;
  生活观赏富化目标 = null;
  生活观赏插入目标 = null;
  // 目标类型的最小内容结构（带对应平台）
  var 平台 = m.platform;
  if (m.type === 'moments') 生活观赏内容 = { platform: 平台 || '微信朋友圈', posts: [ { author: '', time: '', text: '', likes: 0, comments: [] } ] };
  else if (m.type === 'ochat') {
    var 人数 = 涉及.length || 角色.length;
    var 群聊 = 人数 >= 3;
    生活观赏内容 = {
      platform: 平台 || '微信',
      talkType: 群聊 ? 'group' : 'private',
      groupName: 群聊 ? (角色.map(function(c) { return c.name; }).join('、') + ' 的群聊') : '',
      context: 推断 || '',
      messages: [ { sender: '', content: '', time: '' } ],
    };
  }
  else if (m.type === 'oletters') 生活观赏内容 = { platform: 平台 || '书信', context: 推断 || '', messages: [ { sender: '', content: '', time: '' } ] };
  else if (m.type === 'phone') 生活观赏内容 = { calls: [ { caller: '', callee: '', time: '', duration: '', summary: 推断 || '', dialogue: [] } ] };
  else 生活观赏内容 = { calls: [ { caller: '', callee: '', time: '', duration: '', location: '', moments: [ { time: '接通', screen: 推断 || '', dialogue: [] } ] } ] };
  生活观赏子视图 = 'create';
  生活观赏预览 = false;
  生活观赏渲染();
}
window.生活观赏跳转行为 = 生活观赏跳转行为;

// 手动为某个时间段选择「生成方式」弹窗（朋友圈/线上聊天/书信/电话等）
var 生活观赏行为菜单 = [
  { tag: 'wxmoments', label: '🌐 微信朋友圈' },
  { tag: 'qzone', label: '🌐 QQ空间' },
  { tag: 'weixin', label: '💬 线上聊天·微信' },
  { tag: 'qq', label: '💬 线上聊天·QQ' },
  { tag: 'sms', label: '📱 线上聊天·短信' },
  { tag: 'letter', label: '✉️ 书信' },
  { tag: 'note', label: '📝 便签/便条' },
  { tag: 'phone', label: '📞 电话' },
  { tag: 'video', label: '🎥 视频通话' },
];
function 生活观赏打开行为生成(di, si) {
  var h = '<div class="mcard" style="max-width:520px">';
  h += '<h3 style="font-size:0.95em;margin-bottom:6px">🛠 为这个时间段选择生成方式</h3>';
  h += '<p style="font-size:0.78em;color:var(--fg2);margin-bottom:10px">选一个，会跳到对应模块，并带入该时间段信息用于细化/生成。</p>';
  h += '<div class="flex gap-6 flex-wrap">';
  生活观赏行为菜单.forEach(function(m) {
    h += '<span class="preset-chip" style="cursor:pointer" onclick="生活观赏跳转行为(\'' + m.tag + '\',' + di + ',' + si + ')">' + escHtml(m.label) + '</span>';
  });
  h += '</div></div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
}
window.生活观赏打开行为生成 = 生活观赏打开行为生成;

registerAiField('life_infer_behaviors', 'AI 推断 · 互动行为', 生活观赏推断上下文, {
  rawText: false,
  suggestPrompt: 'life_infer_behaviors',
  fillFn: 生活观赏推断回填,
});

// ===== 情景交集 · 新增/生成某天（先生成 5 个候选日程方向，用户选 1 个再正式生成）=====
// 在最前面加一天
function 生活观赏加天开头() {
  if (!生活观赏内容) 生活观赏内容 = { days: [] };
  if (!生活观赏内容.days) 生活观赏内容.days = [];
  var 首天 = 生活观赏内容.days[0];
  var date = '';
  if (首天 && 首天.date) date = (typeof 生活观赏前后一日 === 'function') ? 生活观赏前后一日(首天.date, -1) : '';
  var weekday = date ? ((typeof 生活观赏星期文本 === 'function') ? 生活观赏星期文本(date) : '') : '';
  生活观赏内容.days.unshift({ date: date, weekday: weekday, segments: [ { time: '上午', event: '', roles: [] } ] });
  生活观赏新日目标 = { index: 0 };
  生活观赏日生成选项();
}
window.生活观赏加天开头 = 生活观赏加天开头;

// 在最后面加一天
function 生活观赏加天结尾() {
  if (!生活观赏内容) 生活观赏内容 = { days: [] };
  if (!生活观赏内容.days) 生活观赏内容.days = [];
  var 末天 = 生活观赏内容.days[生活观赏内容.days.length - 1];
  var date = '';
  if (末天 && 末天.date) date = (typeof 生活观赏前后一日 === 'function') ? 生活观赏前后一日(末天.date, 1) : '';
  var weekday = date ? ((typeof 生活观赏星期文本 === 'function') ? 生活观赏星期文本(date) : '') : '';
  生活观赏内容.days.push({ date: date, weekday: weekday, segments: [ { time: '上午', event: '', roles: [] } ] });
  生活观赏新日目标 = { index: 生活观赏内容.days.length - 1 };
  生活观赏日生成选项();
}
window.生活观赏加天结尾 = 生活观赏加天结尾;

// 重新生成某一天的内容（保留日期；先生成候选日程方向选 1 个）
function 生活观赏生成这天(di) {
  if (!生活观赏内容 || !生活观赏内容.days || !生活观赏内容.days[di]) { toast('当天不存在'); return; }
  生活观赏新日目标 = { index: di };
  生活观赏日生成选项();
}
window.生活观赏生成这天 = 生活观赏生成这天;

// 某天上下文摘要（世界观/机制/角色/前后几天/本天），供选项生成与正式生成共用
function 生活观赏日上下文摘要() {
  var idx = 生活观赏新日目标 && 生活观赏新日目标.index;
  if (idx == null || !生活观赏内容 || !生活观赏内容.days || !生活观赏内容.days[idx]) return { idx: null, text: '' };
  var day = 生活观赏内容.days[idx];
  var prev = idx > 0 ? 生活观赏内容.days[idx - 1] : null;
  var next = idx < 生活观赏内容.days.length - 1 ? 生活观赏内容.days[idx + 1] : null;
  var parts = [];
  if (生活观赏内容.world) parts.push('世界观：' + 生活观赏内容.world);
  if (生活观赏内容.mechanism) parts.push('交集机制：' + 生活观赏内容.mechanism);
  var 背景文本 = (typeof 生活观赏背景文本 === 'function') ? 生活观赏背景文本() : '';
  if (背景文本) parts.push('背景设定：' + 背景文本);
  var cast = 生活观赏角色.map(function(c) {
    return typeof 角色卡身份与外貌 === 'function' ? ('【' + c.name + '】\n' + 角色卡身份与外貌(c.data)) : ('【' + c.name + '】');
  }).join('\n\n');
  if (cast) parts.push('角色设定：\n' + cast);
  function 天线(day) { return ((day && day.segments) || []).map(function(s) { var r = (s.roles && s.roles.length) ? '（涉及：' + s.roles.join('、') + '）' : ''; return (s.time || '') + ' ' + (s.event || '') + r; }).join('；'); }
  if (prev) parts.push('【前一天】' + (prev.date || '') + (prev.weekday ? ' ' + prev.weekday : '') + '：' + (天线(prev) || '（空）'));
  if (next) parts.push('【后一天】' + (next.date || '') + (next.weekday ? ' ' + next.weekday : '') + '：' + (天线(next) || '（空）'));
  parts.push('【本天】' + (day.date || '') + (day.weekday ? ' ' + day.weekday : ''));
  return { idx: idx, text: parts.join('\n\n') };
}
window.生活观赏日上下文摘要 = 生活观赏日上下文摘要;

// 生成某天内容的上下文（依据前后几天上下文推断 + 已选方向）
function 生活观赏日生成上下文() {
  var s = 生活观赏日上下文摘要();
  if (s.idx == null) return { user: '' };
  var parts = [];
  if (s.text) parts.push(s.text);
  if (生活观赏选定方向) parts.push('【已选方向】' + (生活观赏选定方向.title ? ('「' + 生活观赏选定方向.title + '」\n') : '') + (生活观赏选定方向.desc || ''));
  parts.push('【任务】请为这一天生成时间段：必须【依次包含】上午、中午、下午、晚上、午夜这 5 个时间段，并【严格按 上午→中午→下午→晚上→午夜 顺序】排列（不要缺漏、不要乱序）。内容与前后几天衔接、符合世界观与角色设定。【这一天的 5 个时间段要各不相同、且与前后几天不重复】——不要套"各自吃饭""被按在窗边操弄、呻吟交叠"这类模板；每段写一次具体、独特的安排，让整天乃至整条时间线有变化、有推进。输出 JSON：{"segments":[{"time":"上午","event":"这个时间在干什么（一句）","roles":["涉及角色名"]}]}。只输出JSON。');
  return { user: parts.join('\n\n') };
}
window.生活观赏日生成上下文 = 生活观赏日生成上下文;

// 第一步：生成 5 个「候选日程方向」上下文（选 1 个后再正式生成）
function 生活观赏日生成选项上下文() {
  var s = 生活观赏日上下文摘要();
  if (s.idx == null) return { user: '' };
  var parts = [];
  if (s.text) parts.push(s.text);
  parts.push('【任务】请为这一天构思 5 个差异鲜明的【候选日程方向】，供用户挑选一个后再据此正式生成该天内容。每个方向用一两句话概括核心构思/张力，不展开。只输出 JSON：{"options":[{"id":1,"title":"方向名","desc":"一句话构思梗概"},{"id":2,"title":"…","desc":"…"},{"id":3,"title":"…","desc":"…"},{"id":4,"title":"…","desc":"…"},{"id":5,"title":"…","desc":"…"}]}，恰好 5 个，只输出JSON。');
  return { user: parts.join('\n\n') };
}
window.生活观赏日生成选项上下文 = 生活观赏日生成选项上下文;

// 第一步入口：生成候选日程方向
function 生活观赏日生成选项() {
  if (!生活观赏内容 || !生活观赏内容.days || !生活观赏内容.days[生活观赏新日目标 && 生活观赏新日目标.index]) { toast('当天不存在'); return; }
  if (typeof generateAiDirectNow === 'function') generateAiDirectNow('life_day_options');
  else toast('AI 生成入口未就绪');
}
window.生活观赏日生成选项 = 生活观赏日生成选项;

// 展示 5 个候选日程方向（点选一个 → 正式生成）
function 生活观赏日显示选项(d) {
  var opts = (d && Array.isArray(d.options)) ? d.options : [];
  if (!opts.length) { toast('候选生成结果为空'); return; }
  var h = '<div class="mcard" style="max-width:640px">';
  h += '<h3 style="font-size:0.95em;margin-bottom:8px">✨ 挑选一个日程方向，再正式生成</h3>';
  h += '<p style="font-size:0.78em;color:var(--fg2);margin-bottom:10px">先看这 ' + opts.length + ' 个候选方向，点选一个，即按该方向生成这一天。</p>';
  h += '<div style="display:flex;flex-direction:column;gap:8px;max-height:56vh;overflow-y:auto">';
  opts.forEach(function(o) {
    var title = (o.title || ('候选' + o.id));
    var desc = (o.desc || '');
    h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px 12px;cursor:pointer" onclick="生活观赏日选选项(\'' + escHtml(JSON.stringify(o).replace(/'/g, "\\'")) + '\')">';
    h += '<div style="font-size:12px;font-weight:700;color:var(--accent2);margin-bottom:3px">' + escHtml(title) + '</div>';
    h += '<div style="font-size:11px;color:var(--fg2);line-height:1.6">' + escHtml(desc) + '</div>';
    h += '</div>';
  });
  h += '</div></div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
}
window.生活观赏日显示选项 = 生活观赏日显示选项;

// 用户选中一个候选 → 正式生成该天
function 生活观赏日选选项(optJson) {
  var o = null; try { o = JSON.parse(optJson); } catch(e) {}
  if (!o) return;
  var ov = document.querySelector('.ovl');
  if (ov) ov.remove();
  生活观赏选定方向 = { title: o.title || '', desc: o.desc || '' };
  if (typeof generateAiDirectNow === 'function') generateAiDirectNow('life_day_gen');
  else toast('AI 生成入口未就绪');
}
window.生活观赏日选选项 = 生活观赏日选选项;

// 生成某天内容的回填
function 生活观赏日生成回填(d) {
  if (!d) { toast('生成结果为空'); return; }
  var idx = 生活观赏新日目标 && 生活观赏新日目标.index;
  if (idx == null || !生活观赏内容 || !生活观赏内容.days || !生活观赏内容.days[idx]) { toast('目标天不存在'); return; }
  var day = 生活观赏内容.days[idx];
  day.segments = (typeof 生活观赏段排序 === 'function' ? 生活观赏段排序 : function(s){return s;})((Array.isArray(d.segments) ? d.segments : []).map(function(s) {
    return { time: (typeof 生活观赏规范时间 === 'function' ? 生活观赏规范时间(s.time) : s.time), event: s.event || '', roles: (Array.isArray(s.roles) ? s.roles : []).map(function(r) { return String(r); }) };
  }));
  生活观赏新日目标 = null;
  生活观赏选定方向 = null;
  生活观赏保存();
  生活观赏渲染();
}
window.生活观赏日生成回填 = 生活观赏日生成回填;

registerAiField('life_day_gen', 'AI 生成 · 某天内容', 生活观赏日生成上下文, {
  rawText: false,
  suggestPrompt: 'life_day_gen',
  fillFn: 生活观赏日生成回填,
});
registerAiField('life_day_options', '候选日程方向', 生活观赏日生成选项上下文, {
  rawText: false,
  suggestPrompt: 'life_day_options',
  fillFn: 生活观赏日显示选项,
});

// ===== 注册页面路由 =====
registerPageRoute('life-observe', function() { 生活观赏渲染(); });
