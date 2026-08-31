// 设定构建 · 世界观 · Tab 页（世界列表 / 开天辟地）
//   - Tab1 世界列表：卡片式，点卡片进世界编辑/浏览
//   - Tab2 开天辟地：实时保存的多级编辑器（基础信息 + 版块TAB + 子维度TAB + 条目列表）
//   - 世界详情：点卡片进入，复用同一套「版块→子维度→条目」编辑器，实时保存
// 实时保存：填任何内容（含 AI 生成）立即写入磁盘。风格参考其他创作模块（灵感板等）。

var 世界即视图 = 'list';   // 'list' 世界列表 | 'create' 开天辟地 | 'world-detail' 世界详情
var 世界列表缓存 = null;
var 世界当前世界 = null;   // 当前世界 { title, meta, content }（编辑/浏览共用）
var 世界当前版块 = '世界设定';   // 当前版块 TAB
var 世界当前维度 = '';          // 当前子维度 TAB（空=第一个维度）
var 世界详情编辑索引 = -1;      // 条目编辑索引
var 世界子级索引 = -1;          // 当前下钻的父条目索引（-1=顶层；进子级时为父条目在维度数组中的下标）
var 世界生成快照 = null;        // 点击「生成」时锁定的 { 版块, 维度, 子级索引 }，保证结果写入固定 tab，不随切换漂移

// 顶层 tab 定义（芯片标签栏 · 全局渲染标签栏）
var 世界顶层Tab = [
  { key: 'list', label: '📂 世界列表' },
  { key: 'create', label: '💥 开天辟地' },
];

// 模块主题（版块 TAB）
var 世界可用模块 = [
  { id: '世界设定', icon: '📖', label: '世界设定' },
  { id: '地理', icon: '🗺️', label: '地理' },
  { id: '势力', icon: '🏴', label: '势力' },
  { id: '种族', icon: '🧬', label: '种族' },
  { id: '文化', icon: '📜', label: '文化' },
  { id: '时间线', icon: '⏳', label: '时间线' },
];

// 版块定义：每版块含多个「子维度」，每个子维度是一个小 TAB，其下是条目数组
// content.json 结构：{ 版块: { 子维度: [条目, ...] } }
// meta:true 的维度是特殊「基本设定」，渲染为基础信息表单（世界名/简介），不存条目。
// 可下钻:true 的版块，其条目可带「子级」数组（一层），点击条目可进入子级（街道/店铺/地标等）。
// 单条:true 的维度，AI 生成时每条目只生成一个主题（如「种族与文明」每条目只一个种族，不混搭）。
// 维度对象可带 说明（正向：该类该写什么）与 禁混（负向：不要生成的其他类别），拼接进生成提示。
var 世界版块表 = {
  '世界设定': { icon: '📖', 维度: [ { 名: '基本设定', meta: true }, { 名: '宇宙与法则' }, { 名: '力量体系' }, { 名: '情色生态' }, { 名: '剧情种子' } ] },
  '地理': { icon: '🗺️', 维度: [
    { 名: '世界地理', 说明: '这是**世界级 / 超大尺度**的地理实体——大陆、海洋、天空、星球、大界、巨岛、整片海域或天域等，是一个世界最顶层的空间框架。如「玄黄大陆」「无垠星海」「九重天穹」「四海八荒」。**明确只做这类大型地点**：条目即该大型地点本身；**不要把小尺度地点混进来**——峡谷、山谷、溪流、湖泊、海滩、单个洞窟、一处奇观、一座山都**不算世界地理**，它们应归入「聚落」或「奇境」。每个世界地理条目可带「子级」列出其下更细的区域（如某大陆下的某山脉/某海域）。不要写类别名，只写大型地点自身的名称' },
    { 名: '大城名宗', 说明: '这是**大型聚居地**——**宗门驻地（仙山/山门/宗门城）、巨大城市、王都、大都城**等规模宏大、人口稠密、地位显赫的地点。如「凌云仙城」「玄剑宗山门」。条目即该大型聚居地本身；**港口、坊市、市集、集市、码头、地标、街巷等都是城市/宗门的内在组成部分，作为该聚落的子级或写在详述里，绝不单独成条**。不要写类别名，只写大型聚居地自身名称' },
    { 名: '乡镇村落', 说明: '这是**小型/基层聚居地**——**乡镇、村镇、村寨、营地、农庄**等规模较小、地处乡野或边地的聚居之处，是普通人的生息之地。如「仙人镇」「灰烬营地」。条目即该小型聚居地本身；**港口、坊市、集市、码头、地标、祠堂等都是村镇的内在组成部分，作为子级或写在详述里，绝不单独成条**。不要写类别名，只写小型聚居地自身名称' },
    { 名: '奇境', 说明: '这是**特殊、超自然的奇观地点与神秘遗迹**——洞天福地、秘境、险地、奇景、圣泉、异境、上古遗迹等，**且必须与性直接相关**：淫祠遗址、交合洞天、欢愉秘境、情欲圣泉、双修福地、采补邪地、爱欲遗迹、阴阳奇穴之类，以情欲/性爱为内核，是情色传说与秘辛的载体。如「九窍玄阴母池」「欢喜幻境」。条目即该奇境本身；**不要把普通聚居地或世界级大陆混进来**——那些分别归「聚落」「世界地理」。不要写类别名，只写奇境自身名称' },
  ], 可下钻: true },
  '势力': { icon: '🏴', 维度: [
    { 名: '世俗政权', 单条: true, 说明: '这是一个势力，且是**接近官方、极其强大、对整个世界有巨大影响力**的势力——通常执掌一国之权、行于明面、号令八方。皇室、政府、议会、军阀等世俗政治机构与掌权者，记录其权力来源、体制、管辖范围、疆域与支配方式，突出其官方性与强大。条目即该势力整体本身；其下属的官僚体系、法律法令、官府场所等都不作为独立条目，写进该势力的详细描述即可' },
    { 名: '超凡势力', 单条: true, 说明: '这是一个势力，且是**接近官方（正统/台面）、极其强大、对整个世界有巨大影响力**的势力——常为世界秩序的中坚、台面上的至高超凡组织。修仙门派、魔法学院、神魔教会、龙族圣地等超自然/超凡力量组织，记录其传承、道统、强者、版图与超凡支配权，突出其强大与影响力。条目即该势力整体本身；其功法典籍、传承体系、山门道场等场所与内容都不作为独立条目，写在势力详细描述里' },
    { 名: '地下黑道', 单条: true, 说明: '这是一个势力。黑帮、盗贼、蛇头、人口贩卖集团等地下犯罪势力，记录其地盘、规矩、暴力与掠卖/囚禁/地下妓院等勾当。条目即该势力整体本身；其内部堂口、黑市、据点场所等都不作为独立条目，写在势力详细描述里' },
    { 名: '邪教淫祠', 单条: true, 说明: '这是一个势力，且是**异常、极端的病态堕落一脉**——即便整个世界的根基是情色，它也属于最边缘、最扭曲的一支。它以某种病态的信仰或沦丧的教义聚拢信众，把常人视作极端禁忌的事当成日常等闲：截肢、食粪、饮尿、自残、兽奸、血肉献祭、脏器交换、亵渎尸骸等皆是家常便饭，越重口越虔诚、越病态越近神。条目即该势力整体本身；其教义、淫祠、祭坛、血窖、秘仪流程等场所与内容都不作为独立条目，写在势力详细描述里。突出其病态、扭曲、令人作呕而又妖异诡艳的重口格调' },
    { 名: '宗教神权', 单条: true, 说明: '这是一个势力。教派、神殿、圣职机构等以信仰/神权支配的势力，记录其圣职体系、戒律、信仰支配与圣职者的堕落/触犯清规。条目即该势力整体本身；其仪式、典籍、教义、经文、神殿圣地等场所与内容都不作为独立条目，写在势力详细描述里' },
    { 名: '情色行业结社', 单条: true, 说明: '这是一个势力。青楼、花街公会、性奴市场、姬业行会等直接从事色情产业的势力，记录其行会规矩、产业规模、性奴/妓女来源与交易。条目即该势力整体本身；其下属的馆舍、行规、妓院场所等都不作为独立条目，写在势力详细描述里' },
    { 名: '军武集团', 单条: true, 说明: '这是一个势力。军队、骑士团、佣兵团、私人卫队等以武力支配的势力，记录其编制、营地、战利品与强权/征用支配。条目即该势力整体本身；其下属的番号、兵种、军营堡垒等都不作为独立条目，写在势力详细描述里' },
    { 名: '民间宗族', 单条: true, 说明: '这是一个势力。宗族、乡绅、大家长制家族等以血缘权杖支配的势力，记录其族规、辈分长幼、联姻与宗族内的支配。条目即该势力整体本身；其下属的祠堂、族谱、祖宅等都不作为独立条目，写在势力详细描述里' },
  ] },
  '种族': { icon: '🧬', 维度: [ { 名: '种族与文明', 单条: true }, { 名: '性征与繁衍' } ] },
  '文化': { icon: '📜', 维度: [ { 名: '文化与习俗' }, { 名: '哲学与信仰' } ] },
  '时间线': { icon: '⏳', 维度: [ { 名: '历史年表' } ] },
};

function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ===== 顶层 tab 导航（芯片标签栏 · 全局渲染标签栏）=====
var 世界Api = null;

// ===== 视图切换 =====
function 世界切换视图(view) {
  世界即视图 = view;
  var el = document.getElementById('worldContent');
  if (el) 世界渲染当前(el);
}

// 第一层用全局组件「渲染标签栏」渲染成芯片；创建一次后复用 setActive
function 世界渲染当前(el) {
  if (!el) return;
  var items = 世界顶层Tab.map(function(t) { return { id: t.key, label: t.label }; });
  var active = (世界即视图 === 'world-detail') ? 'list' : 世界即视图;
  if (!世界Api) {
    世界Api = 渲染标签栏(el, items, { active: active, onSwitch: function(view) { 世界切换类型(view); } });
  } else {
    世界Api.setActive(active);
  }
  世界渲染内容();
}

function 世界切换类型(view) {
  世界即视图 = view;
  世界渲染内容();
}

// 视图内容渲染进组件 sub（嵌套 worldListView / worldEditorView）
function 世界渲染内容() {
  var sub = 世界Api ? 世界Api.sub : null;
  if (!sub) return;
  var h = '';
  if (世界即视图 === 'create') {
    h += '<div id="worldEditorView"></div>';
    sub.innerHTML = h;
    世界渲染空编辑器();
  } else if (世界即视图 === 'world-detail') {
    h += '<div id="worldEditorView"></div>';
    sub.innerHTML = h;
    世界渲染编辑器();
  } else {
    h += '<div id="worldListView"></div>';
    sub.innerHTML = h;
    世界渲染列表(sub);
  }
}

window.世界切换视图 = 世界切换视图;
window.worldSwitchView = 世界切换视图;

// ============================================================
// 首页 · 世界列表（卡片式）
// ============================================================
function 世界渲染列表(el) {
  var viewEl = document.getElementById('worldListView');
  if (!viewEl) return;
  世界加载列表().then(function(list) {
    世界渲染列表HTML(viewEl, list);
  });
}

function 世界加载列表() {
  if (世界列表缓存) return Promise.resolve(世界列表缓存);
  return Store.world.list().then(function(list) {
    世界列表缓存 = list;
    return list;
  });
}

function 世界渲染列表HTML(el, list) {
  var h = '';
  if (!list || list.length === 0) {
    h += '<div class="placeholder-text" style="padding:30px 0;text-align:center">还没有世界观，切到「开天辟地」创建吧。</div>';
    el.innerHTML = h;
    return;
  }
  // 大卡片式网格（世界观不多，卡片做大些；只放名称 + 简介，一眼看出用途）
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:14px">';
  list.forEach(function(w) {
    var title = w.title || '未命名世界';
    var desc = w.description || '';
    h += '<div style="background:var(--bg2);border-radius:var(--radius);border:1px solid var(--border);overflow:hidden;cursor:pointer;transition:.2s" onclick="世界点击世界(\'' + escHtml(title) + '\')">';
    h += '<div style="height:3px;background:linear-gradient(90deg,var(--accent2),var(--accent2))"></div>';
    h += '<div style="padding:16px 18px;min-height:120px;display:flex;flex-direction:column">';
    h += '<div style="font-size:16px;font-weight:700;color:var(--fg);margin-bottom:8px">' + escHtml(title) + '</div>';
    if (desc) {
      h += '<div style="font-size:13px;color:var(--fg2);line-height:1.6;flex:1;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden">' + escHtml(desc) + '</div>';
    } else {
      h += '<div style="font-size:12px;color:var(--fg3);flex:1">（暂无简介）</div>';
    }
    h += '</div>';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 18px;border-top:1px solid var(--border)">';
    h += '<div style="font-size:10px;color:var(--fg3)">' + escHtml(w.updatedAt || '') + '</div>';
    h += '<div style="display:flex;align-items:center;gap:8px">';
    h += '<span style="font-size:11px;color:var(--accent2)">编辑 ›</span>';
    h += '<button class="btn-out" style="padding:1px 8px;font-size:10px;color:#e06c75" onclick="event.stopPropagation();世界删除世界(\'' + escHtml(title) + '\')">🗑 删除</button>';
    h += '</div>';
    h += '</div>';
    h += '</div>';
  });
  h += '</div>';
  el.innerHTML = h;
}

// 点世界卡片 → 进入世界编辑/浏览
function 世界点击世界(title) {
  if (!title) return;
  Promise.all([Store.world.get(title), Store.world.loadContent(title)]).then(function(res) {
    世界当前世界 = { title: title, meta: res[0] || {}, content: res[1] || {} };
    世界当前版块 = '世界设定';
    世界当前维度 = '';
    世界切换视图('world-detail');
  });
}

window.世界渲染列表 = 世界渲染列表;
window.世界点击世界 = 世界点击世界;

// ============================================================
// 世界编辑器（开天辟地新建 = 空世界；详情 = 既有世界）
// 实时保存：填任何内容即时写盘。共用「基础信息 + 版块TAB + 子维度TAB + 条目列表」。
// ============================================================
function 世界渲染空编辑器() {
  // 开天辟地：从未命名空世界开始
  世界当前世界 = { title: '', meta: { title: '', description: '', modules: 世界可用模块.map(function(m){return m.id;}) }, content: {} };
  世界当前版块 = '世界设定';
  世界当前维度 = '';
  var el = document.getElementById('worldEditorView');
  if (el) 世界渲染编辑器();
}

function 世界渲染编辑器() {
  var el = document.getElementById('worldEditorView');
  if (!el) return;
  var w = 世界当前世界;
  if (!w) { el.innerHTML = '<div class="placeholder-text">请先选择一个世界或从「开天辟地」创建</div>'; return; }
  var title = w.title || '未命名世界';
  var h = '';

  // 顶部：返回（仅详情）+ 标题 + 实时保存提示 + 删除（仅详情）
  h += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap">';
  if (世界即视图 === 'world-detail') h += '<button class="btn-out" style="padding:3px 10px;font-size:11px" onclick="世界返回列表()">‹ 返回</button>';
  h += '<div style="font-size:15px;font-weight:700;flex:1">' + (title ? '🌍 ' : '💥 ') + escHtml(title || '开天辟地') + '</div>';
  h += '<button class="btn-out" style="padding:3px 10px;font-size:11px;color:var(--accent2)" title="粘贴一段叙述文本，逐段提取并全部生成世界观条目" onclick="世界提取文本生成()">📜 提取文本并全部生成</button>';
  if (世界即视图 === 'world-detail' && title) h += '<button class="btn-out" style="padding:3px 10px;font-size:11px;color:#e06c75" onclick="世界删除世界(\'' + escHtml(title) + '\')">🗑 删除世界</button>';
  h += '</div>';

  // 版块 TAB（sub-nav）
  h += '<div class="sub-nav" style="margin-bottom:8px">';
  世界可用模块.forEach(function(m) {
    var sel = 世界当前版块 === m.id;
    h += '<div class="sub-nav-item' + (sel ? ' act' : '') + '" onclick="世界切换版块(\'' + m.id + '\')">' + m.icon + ' ' + m.label + '</div>';
  });
  h += '</div>';

  // 当前版块：子维度 TAB + 内容（基本设定表单 或 条目列表）
  h += '<div id="we-section"></div>';
  el.innerHTML = h;
  世界渲染版块();
}

var 世界改名计时 = null;   // 改名防抖计时器
var 世界待改名 = '';        // 待改名的新名

// 世界名输入（填名即建世界；已建世界改名——防抖后执行）
function 世界名输入() {
  var nameEl = document.getElementById('we-name');
  var w = 世界当前世界;
  if (!w || !nameEl) return;
  var name = nameEl.value.trim();
  if (!w.title) {
    // 首次填名：建世界
    if (!name) return;
    w.title = name;
    w.meta = w.meta || {};
    w.meta.title = name;
    w.meta.modules = w.meta.modules || 世界可用模块.map(function(m){return m.id;});
    Store.world.save(name, w.meta).then(function() {
      return Store.world.saveContent(name, w.content || {});
    }).then(function() {
      世界列表缓存 = null;
      window.toast('已开天辟地: ' + name);
      var ev = document.getElementById('worldEditorView');
      if (ev) 世界渲染编辑器();
    }).catch(function(e) { window.toast('创建失败: ' + (e && e.message ? e.message : '未知')); });
    return;
  }
  // 已建世界：改名（防抖 600ms，避免每次键入都重建）
  if (name === w.title) { 世界待改名 = ''; return; }
  if (!name) { 世界待改名 = ''; return; }
  世界待改名 = name;
  if (世界改名计时) clearTimeout(世界改名计时);
  世界改名计时 = setTimeout(function() { 世界执行改名(世界待改名); }, 600);
}
window.世界名输入 = 世界名输入;

// 执行改名（旧名 → 新名）：更新 meta + 迁移 content.json + 删旧目录
var 世界改名中 = false;
function 世界执行改名(newName) {
  var w = 世界当前世界;
  if (!w || !w.title || 世界改名中) return;
  var oldName = w.title;
  if (!newName || newName === oldName) return;
  世界改名中 = true;
  w.meta = w.meta || {};
  w.meta.title = newName;
  // 1) 先写新目录信息文件 + content
  Store.world.save(newName, w.meta).then(function() {
    return Store.world.saveContent(newName, w.content || {});
  }).then(function() {
    // 2) 删旧目录（含旧信息文件 + content）
    return Store.world.delete(oldName).catch(function() { return null; });
  }).then(function() {
    世界改名中 = false;
    w.title = newName;
    w.meta.title = newName;
    世界列表缓存 = null;
    window.toast('已更名为: ' + newName);
    var ev = document.getElementById('worldEditorView');
    if (ev) 世界渲染编辑器();
  }).catch(function(e) {
    世界改名中 = false;
    window.toast('改名失败: ' + (e && e.message ? e.message : '未知'));
    var nameEl = document.getElementById('we-name');
    if (nameEl) nameEl.value = w.title;
  });
}
window.世界执行改名 = 世界执行改名;

// 保存基础信息（实时保存 meta 简介）
function 世界基础保存() {
  var descEl = document.getElementById('we-desc');
  var w = 世界当前世界;
  if (!w || !descEl) return;
  var desc = descEl.value.trim();
  w.meta = w.meta || {};
  w.meta.description = desc;
  if (!w.title) return;  // 未建世界不写 meta
  w.meta.title = w.title;
  Store.world.save(w.title, w.meta).catch(function() {});
}

// 切换版块
function 世界切换版块(sec) {
  世界当前版块 = sec;
  世界当前维度 = '';
  var el = document.getElementById('we-section');
  if (el) 世界渲染版块();
}
window.世界切换版块 = 世界切换版块;

// 渲染当前版块：子维度 TAB + 内容（基本设定表单 或 条目列表）
function 世界渲染版块() {
  var el = document.getElementById('we-section');
  if (!el) return;
  var section = 世界当前版块;
  var def = 世界版块表[section] || { icon: '📄', 维度: [] };
  if (!世界当前维度 && def.维度.length) 世界当前维度 = def.维度[0].名;
  var w = 世界当前世界;
  var content = (w && w.content) || {};
  var sectionContent = content[section] || {};
  var h = '';

  // 子维度 TAB
  if (def.维度.length) {
    h += '<div class="sub-nav" style="margin-bottom:8px">';
    def.维度.forEach(function(d) {
      var sel = 世界当前维度 === d.名;
      h += '<div class="sub-nav-item' + (sel ? ' act' : '') + '" style="font-size:11px" onclick="世界切换维度(\'' + d.名 + '\')">' + d.名 + '</div>';
    });
    h += '</div>';
  }

  // 若当前维度是「基本设定」（meta:true），渲染基础信息表单
  var curDimDef = null;
  for (var di = 0; di < (def.维度||[]).length; di++) if (def.维度[di].名 === 世界当前维度) { curDimDef = def.维度[di]; break; }
  if (curDimDef && curDimDef.meta) {
    h += 世界渲染基本设定(w);
    el.innerHTML = h;
    return;
  }

  // 当前子维度条目列表（或子级视图）
  var dimName = 世界当前维度;
  var dimData = (dimName && sectionContent[dimName]) ? sectionContent[dimName] : [];
  var 可下钻 = !!(def.可下钻);
  if (可下钻 && 世界子级索引 >= 0 && dimData[世界子级索引]) {
    // ===== 子级视图：显示父条目的「子级」列表 =====
    h += 世界渲染子级(dimName, dimData[世界子级索引]);
    el.innerHTML = h;
    return;
  }
  h += '<div class="n-card" style="padding:14px">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">';
  h += '<div style="font-size:13px;font-weight:700;flex:1">' + escHtml(dimName || section) + ' <span style="font-size:10px;color:var(--fg3);font-weight:400">' + dimData.length + ' 条</span></div>';
  h += '<button class="btn-out" style="padding:2px 10px;font-size:11px" onclick="世界新增条目()">＋ 新增</button>';
  h += '<button class="btn-out" style="padding:2px 10px;font-size:11px;color:#e06c75" title="清空当前维度的全部条目" onclick="世界清除全部条目()">🗑 全部清除</button>';
  h += '<button class="btn-main" style="padding:2px 10px;font-size:11px" onclick="世界AI生成()">✨ AI 生成</button>';
  h += '</div>';

  if (!dimData.length) {
    h += '<div style="text-align:center;padding:22px 12px;color:var(--fg3)">';
    h += '<div style="font-size:11px;margin-bottom:10px">还没有内容，可「＋ 新增」手动添加或用「✨ AI 生成」自动产出</div>';
    h += '<button class="btn-out" style="padding:3px 14px;font-size:12px" onclick="世界新增条目()">＋ 新增</button>';
    h += '<span style="margin:0 4px"></span>';
    h += '<button class="btn-main" style="padding:3px 14px;font-size:12px" onclick="世界AI生成()">✨ AI 生成</button>';
    h += '</div>';
  } else {
    h += '<div style="display:flex;flex-direction:column;gap:6px">';
    dimData.forEach(function(item, idx) {
      var t = item['条目'] || item['标题'] || item['名称'] || item['项目'] || '条目';
      var hasSub = 可下钻 && item['子级'] && item['子级'].length;
      h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px">';
      h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">';
      h += '<div style="font-size:13px;font-weight:700;color:var(--fg);flex:1">' + escHtml(t) + '</div>';
      if (可下钻 && hasSub) h += '<button class="btn-out" style="padding:1px 8px;font-size:9px;color:var(--accent2)" onclick="世界进入子级(' + idx + ')">下钻 ' + item['子级'].length + ' ›</button>';
      h += '<button class="btn-out" style="padding:1px 8px;font-size:9px" onclick="世界编辑条目(' + idx + ')">✏️ 编辑</button>';
      h += '<button class="btn-out" style="padding:1px 8px;font-size:9px;color:#e06c75" onclick="世界删除条目(' + idx + ')">🗑</button>';
      h += '</div>';
      Object.keys(item).forEach(function(k) {
        if (k === '条目' || k === '标题' || k === '名称' || k === '项目' || k === '子级') return;
        if (item[k]) h += '<div style="font-size:11px;color:var(--fg2);line-height:1.6;margin-top:3px"><span style="color:var(--fg3);font-weight:600">' + escHtml(k) + '：</span>' + escHtml(item[k]) + '</div>';
      });
      if (可下钻 && !hasSub) h += '<div style="font-size:9px;color:var(--fg3);margin-top:4px">（可为该地点添加子级：街道/店铺/地标等）</div>';
      h += '</div>';
    });
    h += '</div>';
  }
  h += '</div>';
  el.innerHTML = h;
}

// 子级视图：显示某地理条目的「子级」列表（街道/店铺/地标等）
function 世界渲染子级(dimName, parentItem) {
  var items = parentItem['子级'] || [];
  var h = '<div class="n-card" style="padding:14px">';
  // 面包屑返回
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">';
  h += '<button class="btn-out" style="padding:2px 10px;font-size:11px" onclick="世界返回上级()">‹ 返回 ' + escHtml(dimName) + '</button>';
  h += '<div style="font-size:13px;font-weight:700;flex:1">' + escHtml(parentItem['条目'] || '地点') + ' <span style="font-size:10px;color:var(--fg3);font-weight:400">' + items.length + ' 条</span></div>';
  h += '<button class="btn-out" style="padding:2px 10px;font-size:11px" onclick="世界新增条目()">＋ 新增子级</button>';
  h += '<button class="btn-main" style="padding:2px 10px;font-size:11px" onclick="世界AI生成子级()">✨ AI 生成</button>';
  h += '</div>';
  if (!items.length) {
    h += '<div style="text-align:center;padding:22px 12px;color:var(--fg3)">';
    h += '<div style="font-size:11px;margin-bottom:10px">这个地点还没有子级，可新增街道/店铺/地标等，或用 AI 生成</div>';
    h += '<button class="btn-out" style="padding:3px 14px;font-size:12px" onclick="世界新增条目()">＋ 新增</button>';
    h += '<span style="margin:0 4px"></span>';
    h += '<button class="btn-main" style="padding:3px 14px;font-size:12px" onclick="世界AI生成子级()">✨ AI 生成</button>';
    h += '</div>';
  } else {
    h += '<div style="display:flex;flex-direction:column;gap:6px">';
    items.forEach(function(item, idx) {
      var t = item['条目'] || item['标题'] || item['名称'] || item['项目'] || '条目';
      h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px">';
      h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">';
      h += '<div style="font-size:13px;font-weight:700;color:var(--fg);flex:1">' + escHtml(t) + '</div>';
      h += '<button class="btn-out" style="padding:1px 8px;font-size:9px" onclick="世界编辑条目(' + idx + ')">✏️ 编辑</button>';
      h += '<button class="btn-out" style="padding:1px 8px;font-size:9px;color:#e06c75" onclick="世界删除条目(' + idx + ')">🗑</button>';
      h += '</div>';
      Object.keys(item).forEach(function(k) {
        if (k === '条目' || k === '标题' || k === '名称' || k === '项目' || k === '子级') return;
        if (item[k]) h += '<div style="font-size:11px;color:var(--fg2);line-height:1.6;margin-top:3px"><span style="color:var(--fg3);font-weight:600">' + escHtml(k) + '：</span>' + escHtml(item[k]) + '</div>';
      });
      h += '</div>';
    });
    h += '</div>';
  }
  h += '</div>';
  return h;
}

// 进入子级
function 世界进入子级(idx) {
  世界子级索引 = idx;
  var el = document.getElementById('we-section');
  if (el) 世界渲染版块();
}
window.世界进入子级 = 世界进入子级;
// 返回上级
function 世界返回上级() {
  世界子级索引 = -1;
  var el = document.getElementById('we-section');
  if (el) 世界渲染版块();
}
window.世界返回上级 = 世界返回上级;

// 基本设定表单（世界名/简介，实时保存）
function 世界渲染基本设定(w) {
  var meta = (w && w.meta) || {};
  var title = (w && w.title) || '';
  var h = '<div class="n-card" style="padding:16px">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap">';
  h += '<div style="font-size:13px;font-weight:700;flex:1">基本设定</div>';
  h += '<button class="btn-main" style="padding:2px 10px;font-size:11px" onclick="世界基本AI生成()">✨ AI 生成</button>';
  h += '</div>';
  // 世界名（填名即建；已建后可改名）—— 字段旁可单独生成
  h += '<div style="margin-bottom:12px"><div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">';
  h += '<label style="font-size:11px;color:var(--fg2);flex:1">世界名 <span style="color:#e06c75">*</span></label>';
  h += '<button class="btn-out" style="padding:1px 8px;font-size:9px;color:var(--accent2)" title="单独生成世界名" onclick="世界字段AI生成(\'name\')">✨</button>';
  h += '</div>';
  h += '<input id="we-name" class="llm-input" style="width:100%" value="' + escHtml(title) + '" placeholder="例：太初道界 / 星海遗民" oninput="世界名输入()">';
  h += '</div>';
  // 简介 —— 字段旁可单独生成
  h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">';
  h += '<label style="font-size:11px;color:var(--fg2);flex:1">世界简介</label>';
  h += '<button class="btn-out" style="padding:1px 8px;font-size:9px;color:var(--accent2)" title="单独生成世界简介" onclick="世界字段AI生成(\'desc\')">✨</button>';
  h += '</div>';
  h += '<textarea id="we-desc" class="llm-input" style="width:100%;min-height:140px;resize:vertical" placeholder="这段世界的基调、法则或故事核心，写在这里，世界列表会显示它……" oninput="世界基础保存()">' + escHtml(meta.description || '') + '</textarea>';
  h += '</div>';
  return h;
}

// 切换子维度
function 世界切换维度(dim) {
  世界当前维度 = dim;
  var el = document.getElementById('we-section');
  if (el) 世界渲染版块();
}
window.世界切换维度 = 世界切换维度;

// 获取当前 版块+维度 定位（编辑条目用）
function 世界当前定位() {
  return { 版块: 世界当前版块, 维度: 世界当前维度 };
}

// 获取当前操作的条目数组（顶层维度数组 或 若在子级则父条目['子级']数组）
// 返回 { list, 在子级 }；list 可能为 null（未建立）。
function 世界当前条目容器() {
  var w = 世界当前世界;
  var loc = 世界当前定位();
  var content = (w && w.content) || {};
  var dimArr = (content[loc.版块] && content[loc.版块][loc.维度]) ? content[loc.版块][loc.维度] : null;
  if (!dimArr) return { list: null, 在子级: false };
  if (世界子级索引 >= 0 && dimArr[世界子级索引]) {
    var parent = dimArr[世界子级索引];
    if (!parent['子级']) parent['子级'] = [];
    return { list: parent['子级'], 在子级: true };
  }
  return { list: dimArr, 在子级: false };
}

// 新增条目（新建空白并打开编辑框；若在子级则加到子级数组）
function 世界新增条目() {
  var w = 世界当前世界;
  if (!w) return;
  var loc = 世界当前定位();
  var content = w.content = w.content || {};
  content[loc.版块] = content[loc.版块] || {};
  content[loc.版块][loc.维度] = content[loc.版块][loc.维度] || [];
  var container = 世界当前条目容器();
  var list = container.list || content[loc.版块][loc.维度];
  if (!container.list) { content[loc.版块][loc.维度] = list; }
  if (世界子级索引 >= 0 && content[loc.版块][loc.维度][世界子级索引]) {
    var parent = content[loc.版块][loc.维度][世界子级索引];
    if (!parent['子级']) parent['子级'] = [];
    list = parent['子级'];
  }
  list.push({ 条目: '新子级' });
  世界编辑条目(list.length - 1);
}
window.世界新增条目 = 世界新增条目;

// 清空当前维度的全部条目（确认后整组删除并保存）
function 世界清除全部条目() {
  var w = 世界当前世界;
  var loc = 世界当前定位();
  if (!w || !w.content || !w.content[loc.版块] || !w.content[loc.版块][loc.维度]) { window.toast('该维度暂无内容'); return; }
  var items = w.content[loc.版块][loc.维度];
  if (!items.length) { window.toast('该维度暂无内容'); return; }
  if (!window.confirm('确定清除「' + loc.版块 + ' · ' + loc.维度 + '」下的全部 ' + items.length + ' 条内容？该操作不可撤销。')) return;
  w.content[loc.版块][loc.维度] = [];
  Store.world.saveContent(w.title, w.content).then(function() {
    window.toast('已全部清除');
    var el = document.getElementById('we-section');
    if (el) 世界渲染版块();
  }).catch(function(e) { window.toast('保存失败：' + (e && e.message ? e.message : '未知')); });
}
window.世界清除全部条目 = 世界清除全部条目;

// 编辑条目弹窗（字段 = 子维度名 + 详细描述；若在子级则标题标注子级）
function 世界编辑条目(index) {
  var w = 世界当前世界;
  var loc = 世界当前定位();
  var container = 世界当前条目容器();
  var list = container.list || [];
  var item = list[index] || {};
  世界详情编辑索引 = index;

  var h = '<div class="mcard" style="max-width:560px">';
  h += '<div style="font-size:14px;font-weight:700;margin-bottom:12px">' + (list[index] && list[index].条目 ? '✏️ 编辑：' + escHtml(list[index].条目) : '＋ 新增条目') + ' <span style="font-size:10px;color:var(--fg3);font-weight:400">（' + escHtml(loc.版块) + ' · ' + escHtml(loc.维度) + (container.在子级 ? ' · 子级' : '') + '）</span></div>';
  // 条目名
  h += '<div style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:3px">条目名</label>';
  h += '<input id="wde-title" class="llm-input" style="width:100%" value="' + escHtml(item['条目'] || item['标题'] || item['名称'] || item['项目'] || '') + '"></div>';
  // 详细描述
  h += '<div style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:3px">详细描述</label>';
  h += '<textarea id="wde-desc" class="llm-input" style="width:100%;min-height:140px;resize:vertical" placeholder="这个条目的详细内容……">' + escHtml(item['详细描述'] || item['描述'] || '') + '</textarea></div>';
  h += '<div style="display:flex;gap:8px;justify-content:flex-end">';
  h += '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>';
  h += '<button class="btn-main" onclick="世界保存条目()">保存</button>';
  h += '</div></div>';

  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
}
window.世界编辑条目 = 世界编辑条目;

// 保存条目（实时写 content.json；若在子级写到父条目['子级']）
function 世界保存条目() {
  var w = 世界当前世界;
  var loc = 世界当前定位();
  var index = 世界详情编辑索引;
  var titleEl = document.getElementById('wde-title');
  if (!titleEl) { window.toast('输入框丢失'); return; }
  var title = titleEl.value.trim();
  if (!title) { window.toast('条目名不能为空'); return; }
  var descEl = document.getElementById('wde-desc');
  var item = { '条目': title };
  if (descEl && descEl.value.trim()) item['详细描述'] = descEl.value.trim();
  w.content = w.content || {};
  w.content[loc.版块] = w.content[loc.版块] || {};
  w.content[loc.版块][loc.维度] = w.content[loc.版块][loc.维度] || [];
  var container = 世界当前条目容器();
  var list = container.list || w.content[loc.版块][loc.维度];
  if (index >= 0 && list[index]) list[index] = item;
  else list.push(item);
  Store.world.saveContent(w.title, w.content).then(function() {
    var ov = document.querySelector('.ovl');
    if (ov) ov.remove();
    window.toast('已保存');
    var el = document.getElementById('we-section');
    if (el) 世界渲染版块();
  });
}
window.世界保存条目 = 世界保存条目;

// 删除条目（若在子级则删子级）
function 世界删除条目(index) {
  var w = 世界当前世界;
  var container = 世界当前条目容器();
  var list = container.list || [];
  if (index < 0 || index >= list.length) return;
  if (!window.confirm('确定删除该条目？')) return;
  list.splice(index, 1);
  Store.world.saveContent(w.title, w.content).then(function() {
    window.toast('已删除');
    var el = document.getElementById('we-section');
    if (el) 世界渲染版块();
  });
}
window.世界删除条目 = 世界删除条目;

// 返回世界列表
function 世界返回列表() {
  世界切换视图('list');
}
window.世界返回列表 = 世界返回列表;

// 删除世界（确认后删整目录，回列表）
function 世界删除世界(title) {
  if (!title) return;
  if (!window.confirm('确定彻底删除世界「' + title + '」？该操作不可撤销。')) return;
  Store.world.delete(title).then(function() {
    世界列表缓存 = null;
    if (世界当前世界 && 世界当前世界.title === title) 世界当前世界 = null;
    window.toast('已删除世界: ' + title);
    世界切换视图('list');
  }).catch(function(e) { window.toast('删除失败: ' + (e && e.message ? e.message : '未知')); });
}
window.世界删除世界 = 世界删除世界;

// ===== 世界观 · AI 字段（二元模板）=====
// 版块子维度内容生成：走二元模板弹窗（可填方向），动态绑定当前「版块·子维度」。

// 交给 AI 时条目的「简要」形式：条目名 + 详细描述前 20 字（仅用于 势力 / 地理 这类条目众多的版块）
function 世界条目简述(items) {
  if (!items || !items.length) return '（空）';
  return items.map(function(x){
    var 描述 = (x['详细描述'] || x['描述'] || '');
    if (描述.length > 20) 描述 = 描述.substring(0, 20) + '…';
    var base = (x['条目'] || '') + (描述 ? '：' + 描述 : '');
    if (x['子级'] && x['子级'].length) base += '（子级：' + x['子级'].map(function(y){return y['条目']||'';}).join('、') + '）';
    return base;
  }).join('；');
}

// 交给 AI 时条目的「完整」形式：条目名 + 完整详细描述（用于 世界设定/种族/文化/时间线 等条目较少的版块）
function 世界条目完整(items) {
  if (!items || !items.length) return '（空）';
  return items.map(function(x){
    var 描述 = (x['详细描述'] || x['描述'] || '');
    var base = (x['条目'] || '') + (描述 ? '：' + 描述 : '');
    if (x['子级'] && x['子级'].length) base += '（子级：' + x['子级'].map(function(y){return y['条目']||'';}).join('、') + '）';
    return base;
  }).join('；\n');
}

// 按版块决定条目呈现形式：势力 / 地理 → 简写（名+前20字）；其余 → 完整表述
function 世界条目按版块(items, sec) {
  if (sec === '势力' || sec === '地理') return 世界条目简述(items);
  return 世界条目完整(items);
}

// 收集「当前世界其余部分已有内容」作为上下文（供 AI 参考、保持一致）
function 世界组装上下文() {
  var w = 世界当前世界;
  if (!w) return '（无）';
  var meta = w.meta || {};
  var content = w.content || {};
  var parts = [];
  // 世界名 + 简介（基本设定）
  if (meta.title) parts.push('世界名：' + meta.title);
  if (meta.description) parts.push('基本简介：' + meta.description);
  // 各版块子维度已有内容（除当前定位外）
  var loc = 世界当前定位();
  Object.keys(content).forEach(function(sec) {
    var sub = content[sec] || {};
    Object.keys(sub).forEach(function(dim) {
      if (sec === loc.版块 && dim === loc.维度) return;  // 跳过当前要生成的
      var items = sub[dim] || [];
      if (items.length) {
        parts.push('【' + sec + '·' + dim + '】' + 世界条目按版块(items, sec));
      }
    });
  });
  return parts.length ? parts.join('\n') : '（暂无其他内容）';
}

// 版块子维度条目生成（内容）：锁定当前 tab（版块/维度/子级），生成结果固定写入该 tab
function 世界AI生成() {
  var w = 世界当前世界;
  if (!w) { window.toast('未选择世界'); return; }
  if (!w.title) { window.toast('请先填世界名'); return; }
  if (typeof openAiGenPanel !== 'function') { window.toast('AI 建议系统未就绪'); return; }
  var loc = 世界当前定位();
  世界生成快照 = { 世界: w, 版块: loc.版块, 维度: loc.维度, 子级索引: 世界子级索引 };
  openAiGenPanel('world-element');
}
window.世界AI生成 = 世界AI生成;

// 子级内容 AI 生成（复用 world-element，锁定当前子级）
function 世界AI生成子级() {
  var w = 世界当前世界;
  if (!w) { window.toast('未选择世界'); return; }
  if (!w.title) { window.toast('请先填世界名'); return; }
  if (typeof openAiGenPanel !== 'function') { window.toast('AI 建议系统未就绪'); return; }
  var loc = 世界当前定位();
  世界生成快照 = { 世界: w, 版块: loc.版块, 维度: loc.维度, 子级索引: 世界子级索引 };
  openAiGenPanel('world-element');
}
window.世界AI生成子级 = 世界AI生成子级;

// 基本设定（世界名/简介）AI 生成
function 世界基本AI生成() {
  var w = 世界当前世界;
  if (!w) { window.toast('未选择世界'); return; }
  if (typeof openAiGenPanel !== 'function') { window.toast('AI 建议系统未就绪'); return; }
  openAiGenPanel('world-basic');
}
window.世界基本AI生成 = 世界基本AI生成;

// 基本设定·单字段 AI 生成（name=世界名 / desc=世界简介）
function 世界字段AI生成(target) {
  var w = 世界当前世界;
  if (!w) { window.toast('未选择世界'); return; }
  if (typeof openAiGenPanel !== 'function') { window.toast('AI 建议系统未就绪'); return; }
  if (target === 'name') openAiGenPanel('world-name');
  else openAiGenPanel('world-desc');
}
window.世界字段AI生成 = 世界字段AI生成;

// ===== 世界名不限：未命名则自动随机生成并创建世界 =====
function 世界自动命名(w) {
  if (w && w.title) return null;
  var 前缀 = ['太初', '玄黄', '无极', '云梦', '天澜', '太虚', '玉衡', '寰宇', '九霄', '沧溟'];
  var 后缀 = ['界', '域', '天', '墟', '境', '大陆', '神国', '仙境', '乾坤', '洪荒'];
  var name = 前缀[Math.floor(Math.random() * 前缀.length)] + 后缀[Math.floor(Math.random() * 后缀.length)] + '_' + Date.now().toString().slice(-4);
  w.title = name;
  w.meta = w.meta || {};
  w.meta.title = name;
  w.meta.modules = w.meta.modules || 世界可用模块.map(function(m) { return m.id; });
  return name;
}

// ===== 提取文本并全部生成：上传/粘贴叙述文本 → 按段落逐段提取 → 每段生成一条完整条目 → 合并去重填入当前维度 =====
function 世界提取文本生成() {
  var w = 世界当前世界;
  if (!w) { window.toast('未选择世界'); return; }
  var autoName = 世界自动命名(w);   // 世界名不做限制：未命名则自动随机生成 + 创建世界
  var openModal = function() {
    var h = '<div class="mcard" style="max-width:600px">';
    h += '<h3 style="font-size:0.95em;margin-bottom:10px">📜 提取文本并全部生成' + (autoName ? ' <span style="font-size:10px;color:var(--accent2);font-weight:400">（已自动命名：' + escHtml(autoName) + '）</span>' : '') + '</h3>';
    h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">';
    h += '<button class="btn-out" style="padding:2px 10px;font-size:11px" onclick="document.getElementById(\'wte-file\').click()">📁 上传文本文件</button>';
    h += '<span style="font-size:10px;color:var(--fg3)">支持 .txt，自动识别 UTF-8 / GBK</span>';
    h += '<input id="wte-file" type="file" accept=".txt,text/plain" style="display:none">';
    h += '</div>';
    h += '<div style="font-size:11px;color:var(--fg2);margin-bottom:8px;line-height:1.5">粘贴或上传一段世界观设定 / 小说叙述。系统将按<b>段落</b>逐段提取，<b>每一段生成一条完整的世界观条目</b>，最后合并（同名去重）填入当前「' + escHtml(世界当前版块) + ' · ' + escHtml(世界当前维度) + '」。</div>';
    h += '<textarea id="wte-text" class="llm-input" style="width:100%;min-height:200px;resize:vertical" placeholder="在这里粘贴或上传文本……（段落之间用空行分隔）"></textarea>';
    h += '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px">';
    h += '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>';
    h += '<button class="btn-main" id="wte-go">🚀 开始生成</button>';
    h += '</div></div>';
    var ov = document.createElement('div');
    ov.className = 'ovl';
    ov.innerHTML = h;
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
    // 上传 .txt（仿小说提取：UTF-8 优先，乱码则回退 GBK）
    var fileInput = document.getElementById('wte-file');
    if (fileInput) fileInput.addEventListener('change', function(e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      if (!/\.txt$/i.test(file.name)) { window.toast('请选择 .txt 格式文件'); return; }
      var reader = new FileReader();
      reader.onload = function(ev) {
        var bytes = new Uint8Array(ev.target.result);
        var text = new TextDecoder('UTF-8', { fatal: false }).decode(bytes);
        if (text.indexOf('\uFFFD') >= 0) {
          try {
            var gbk = new TextDecoder('GBK', { fatal: false }).decode(bytes);
            if (gbk.indexOf('\uFFFD') < 0) text = gbk;
          } catch(e) {}
        }
        document.getElementById('wte-text').value = text;
        window.toast('✅ 已加载: ' + file.name + ' (' + text.length + ' 字)');
      };
      reader.readAsArrayBuffer(file);
    });
    document.getElementById('wte-go').onclick = function() {
      var text = (document.getElementById('wte-text').value || '').trim();
      if (!text) { window.toast('请粘贴或上传文本'); return; }
      ov.remove();
      世界提取文本执行(w, text);
    };
  };
  if (autoName) {
    // 未命名：先创建世界（信息文件 + 内容），再打开弹窗
    Store.world.save(w.title, w.meta).then(function() {
      return Store.world.saveContent(w.title, w.content || {});
    }).then(function() {
      世界列表缓存 = null;
      openModal();
    }).catch(function(e) { window.toast('创建世界失败：' + (e && e.message ? e.message : '未知')); });
  } else {
    openModal();
  }
}
window.世界提取文本生成 = 世界提取文本生成;

function 世界提取文本执行(w, text) {
  if (typeof LLM === 'undefined' || !LLM.callJSON || typeof renderPrompt !== 'function') { window.toast('AI 系统未就绪'); return; }
  var loc = 世界当前定位();
  var section = loc.版块, dim = loc.维度;
  var def = 世界版块表[section] || { 维度: [] };
  var dimDef = null;
  def.维度.forEach(function(d) { if (d.名 === dim) dimDef = d; });
  var 类约束 = (dimDef && dimDef.说明) || '';
  var content = w.content = w.content || {};
  content[section] = content[section] || {};
  content[section][dim] = content[section][dim] || [];
  // 按空行分段
  var paras = text.split(/\n\s*\n/).map(function(s) { return s.trim(); }).filter(Boolean);
  if (!paras.length) { window.toast('未提取到段落'); return; }
  // 记录已有条目标题，用于去重
  var seen = {};
  content[section][dim].forEach(function(it) { if (it['条目']) seen[it['条目']] = true; });
  window.toast('共 ' + paras.length + ' 段，正在逐段生成…');
  var chain = Promise.resolve();
  var added = 0;
  paras.forEach(function(p, i) {
    chain = chain.then(function() {
      var r = renderPrompt('world_text_entry', { worldName: w.title, section: section, dim: dim, 类约束: 类约束, paragraph: p });
      return LLM.callJSON({
        label: '世界文本提取(第' + (i + 1) + '/' + paras.length + '段)',
        system: r.system,
        prompt: r.user,
      }).then(function(d) {
        var it = d && d['条目'] ? d : null;
        if (!it && Array.isArray(d)) it = (d[0] && d[0]['条目']) ? d[0] : null;
        if (it && it['条目'] && !seen[it['条目']]) {
          seen[it['条目']] = true;
          content[section][dim].push({ '条目': String(it['条目']), '详细描述': String(it['详细描述'] || '') });
          added++;
        }
      }).catch(function(e) { window.toast('第' + (i + 1) + '段失败：' + (e && e.message ? e.message : '未知')); });
    });
  });
  chain.then(function() { return Store.world.saveContent(w.title, w.content); })
    .then(function() {
      window.toast('已提取生成 ' + added + ' 条并保存');
      var el = document.getElementById('we-section');
      if (el) 世界渲染版块();
    })
    .catch(function(e) { window.toast('保存失败：' + (e && e.message ? e.message : '未知')); });
}

// 生成「当前定位」标注：世界观「X」> 版块「Y」> 子维度「Z」> 字段「W」
// 用于让 AI 明确知道它正在为哪个世界、哪个版块、哪个子维度、哪个字段生成内容。
// 若当前在「子级」（地理可下钻），会标注其父条目。
function 世界AI定位串(fieldLabel) {
  var w = 世界当前世界;
  var loc = 世界当前定位();
  var title = (w && w.title) || '未命名';
  var sec = loc.版块 || '世界设定';
  var dim = loc.维度 || '基本设定';
  var f = fieldLabel || '';
  var subNote = '';
  if (世界子级索引 >= 0 && w && w.content && w.content[sec] && w.content[sec][dim] && w.content[sec][dim][世界子级索引]) {
    var pn = w.content[sec][dim][世界子级索引]['条目'] || '地点';
    subNote = '（当前在「' + pn + '」的子级）';
  }
  return '【当前编辑定位】世界观「' + title + '」 > 版块「' + sec + '」 > 子维度「' + dim + '」' + (f ? ' > 字段「' + f + '」' : '') + subNote + '。\n请生成的内容将填入「' + sec + ' / ' + dim + '」' + (f ? ' 的「' + f + '」字段' : '') + '。';
}

// 注册 AI 字段（二元模板）
if (typeof registerAiField === 'function' && window.全局字段已注册 !== true) {
  window.全局字段已注册 = true;

  // 1) 版块子维度内容生成
  registerAiField('world-element', '世界观·内容生成', function() {
    var w = 世界当前世界;
    // 用「生成快照」锁定点击时的 tab，避免面板打开后切换导致目标漂移；无快照则回退当前定位
    var snap = 世界生成快照 || { 版块: 世界当前定位().版块, 维度: 世界当前定位().维度, 子级索引: 世界子级索引 };
    var section = snap.版块;
    var dim = snap.维度;
    var 子级索引 = snap.子级索引;
    var def = 世界版块表[section] || { 维度: [] };
    var content = (w && w.content) || {};
    // existing：若在子级则用「父条目的子级已有内容」，否则用整体；生成时避免重复（势力/地理简写，其余完整）
    var existing = '（空）';
    if (子级索引 >= 0 && content[section] && content[section][dim] && content[section][dim][子级索引]) {
      var p = content[section][dim][子级索引];
      existing = p['子级'] ? 世界条目按版块(p['子级'], section) : '（空）';
    } else if (content[section] && content[section][dim]) {
      existing = 世界条目按版块(content[section][dim], section);
    }
    var context = 世界组装上下文();
    var curDim = null;
    for (var di2 = 0; di2 < (def.维度||[]).length; di2++) if (def.维度[di2].名 === dim) { curDim = def.维度[di2]; break; }
    var 类约束 = '';
    // 正向说明：本类下该写什么内容（若维度配了 说明）
    if (curDim && curDim.说明) {
      类约束 += '\n【本类应生成的内容】' + curDim.说明 + '。' + (curDim.单条 ? '条目标题只写该类下具体某某的自身名称，不要带类别名。' : '');
    }
    // 维度是「单条」时，动态列出「除了当前维度之外的所有其他维度」作负向约束
    if (curDim && curDim.单条) {
      // 动态收集当前版块中除 dim 外的所有其他单条维度名
      var 其他类 = [];
      for (var di3 = 0; di3 < (def.维度||[]).length; di3++) {
        var d0 = def.维度[di3];
        if (d0 && d0.名 && d0.名 !== dim && d0.单条) 其他类.push(d0.名);
      }
      if (其他类.length) {
        类约束 += '\n【不要生成其他类别】本类是「' + dim + '」，**只生成属于本类的条目**，不要写成以下其他类别的任何内容——不要混入、不要兼写、不要边界模糊：\n' + 其他类.map(function(n){return '— ' + n;}).join('\n');
      }
    }
    return {
      user: 世界AI定位串(dim) + '\n请为世界观「' + (w ? w.title : '未命名') + '」的「' + section + ' / ' + dim + '」生成条目，每条目含「条目」「详细描述」。**请务必对照上面的「该子维度已有内容」逐条检查，不要生成与已有任何条目相同或雷同的重复条目**——只创作全新、彼此各异的条目。条目标题只写该类下**具体势力/地点的自身名称**，绝不要把「' + dim + '」这个类别名写进条目标题或内容里。' + 类约束,
      system: '你是世界构建专家，为成人向创作软件构建世界观设定。',
      worldName: w ? w.title : '',
      section: section,
      dim: dim,
      existing: existing,
      context: context,
      type: section,
      类约束: 类约束.trim() || '（无特殊说明，按该类通用标准生成）',
    };
  }, {
    suggestPrompt: 'world_element',
    count: true,
    defaultCount: 5,
    countLabel: '条',
    fillFn: function(d) {
      // 用「生成快照」锁定目标 世界 + tab（点击时），保证不随切换漂移；无快照回退当前世界/定位
      var snap = 世界生成快照 || { 世界: 世界当前世界, 版块: 世界当前定位().版块, 维度: 世界当前定位().维度, 子级索引: 世界子级索引 };
      var w = snap.世界;
      if (!w) { window.toast('未选择世界'); return; }
      var section = snap.版块;
      var dim = snap.维度;
      var 子级索引 = snap.子级索引;
      var list = (d && typeof d === 'object' && Array.isArray(d.items)) ? d.items : (Array.isArray(d) ? d : null);
      if (!list || !list.length) { window.toast('生成结果为空或无条目'); return; }
      w.content = w.content || {};
      w.content[section] = w.content[section] || {};
      w.content[section][dim] = w.content[section][dim] || [];
      // 根据快照决定写入顶层维度 还是 父条目['子级']
      var 在子级 = (子级索引 >= 0 && w.content[section][dim][子级索引]);
      var target = 在子级 ? (w.content[section][dim][子级索引]['子级'] || []) : w.content[section][dim];
      target = target.concat(list);
      if (在子级) {
        w.content[section][dim][子级索引]['子级'] = target;
      } else {
        w.content[section][dim] = target;
      }
      Store.world.saveContent(w.title, w.content).then(function() {
        window.toast(dim + (在子级 ? ' 子级' : '') + ' 已追加 ' + list.length + ' 条');
        // 把当前定位切回快照指向的 世界 + tab，然后再渲染（让用户看到结果落到那个世界/tab）
        世界当前世界 = w;
        世界当前版块 = section;
        世界当前维度 = dim;
        世界子级索引 = 子级索引;
        var el = document.getElementById('we-section');
        if (el) 世界渲染版块();
      }).catch(function(e) { window.toast('保存失败：' + (e && e.message ? e.message : '未知')); });
    },
  });

  // 2) 基本设定（世界名/简介）生成
  registerAiField('world-basic', '世界观·基本设定', function() {
    var w = 世界当前世界;
    var meta = (w && w.meta) || {};
    var context = 世界组装上下文();
    return {
      user: 世界AI定位串('基本设定') + '\n请为世界观「' + (w ? w.title : '未命名') + '」生成基本设定（世界名/世界观一句话概括与简介/立意）。',
      system: '你是世界构建专家，为成人向创作软件构建世界观基本设定。',
      worldName: w ? w.title : '',
      section: '世界设定',
      dim: '基本设定',
      existing: meta.description ? JSON.stringify({ description: meta.description }) : '（空）',
      context: context,
    };
  }, {
    suggestPrompt: 'world_element',
    fillFn: function(d) {
      var w = 世界当前世界;
      if (!w) { window.toast('未选择世界'); return; }
      // 兼容：可能返回 {description}/{简介} 或 {items:[...]}，取简介类文本
      var desc = '';
      if (typeof d === 'string') desc = d;
      else if (d && typeof d === 'object') {
        desc = d['描述'] || d['简介'] || d['description'] || (Array.isArray(d.items) && d.items[0] && (d.items[0]['详细描述'] || d.items[0]['描述'])) || '';
      }
      if (!desc) { window.toast('生成结果为空'); return; }
      w.meta = w.meta || {};
      w.meta.description = String(desc).trim();
      if (!w.title && w.meta.title) w.title = w.meta.title;
      Store.world.save(w.title, w.meta).then(function() {
        window.toast('基本设定已更新');
        var ev = document.getElementById('worldEditorView');
        if (ev) 世界渲染编辑器();
      }).catch(function(e) { window.toast('保存失败：' + (e && e.message ? e.message : '未知')); });
    },
  });

  // 3) 基本设定 · 单字段：世界名
  registerAiField('world-name', '世界观·世界名', function() {
    var w = 世界当前世界;
    var meta = (w && w.meta) || {};
    var context = 世界组装上下文();
    return {
      user: 世界AI定位串('世界名') + '\n请为世界观「' + (w ? w.title : '未命名') + '」生成一个贴切、有辨识度的世界名。',
      system: '你是世界构建专家，为成人向创作软件取世界名。只输出世界名，不要解释。',
      worldName: w ? w.title : '',
      section: '世界设定',
      dim: '基本设定',
      existing: meta.title ? JSON.stringify({ title: meta.title }) : '（空）',
      context: context,
    };
  }, {
    suggestPrompt: 'world_element',
    fillFn: function(d) {
      var w = 世界当前世界;
      if (!w) { window.toast('未选择世界'); return; }
      var name = '';
      if (typeof d === 'string') name = d;
      else if (d && typeof d === 'object') name = d['世界名'] || d['名称'] || d['name'] || d['title'] || (Array.isArray(d.items) && d.items[0] && (d.items[0]['条目']||'')) || '';
      name = String(name).trim();
      if (!name) { window.toast('生成结果为空'); return; }
      // 若世界尚未建立，先建；否则改名
      if (!w.title) {
        w.title = name;
        w.meta = w.meta || {};
        w.meta.title = name;
        w.meta.modules = w.meta.modules || 世界可用模块.map(function(m){return m.id;});
        Store.world.save(name, w.meta).then(function() {
          return Store.world.saveContent(name, w.content || {});
        }).then(function() {
          世界列表缓存 = null;
          window.toast('已开天辟地: ' + name);
          var ev = document.getElementById('worldEditorView');
          if (ev) 世界渲染编辑器();
        });
      } else {
        // 已建世界：改名
        if (name !== w.title) 世界执行改名(name);
        else {
          var ev2 = document.getElementById('worldEditorView');
          if (ev2) 世界渲染编辑器();
        }
      }
    },
  });

  // 4) 基本设定 · 单字段：世界简介
  registerAiField('world-desc', '世界观·世界简介', function() {
    var w = 世界当前世界;
    var meta = (w && w.meta) || {};
    var context = 世界组装上下文();
    return {
      user: 世界AI定位串('世界简介') + '\n请为世界观「' + (w ? w.title : '未命名') + '」生成其世界简介（一段贴合世界基调、法则与故事核心的概述，300 字左右）。',
      system: '你是世界构建专家，为成人向创作软件写世界简介。只输出简介正文，不要解释、不要标题。',
      worldName: w ? w.title : '',
      section: '世界设定',
      dim: '基本设定',
      existing: meta.description ? JSON.stringify({ description: meta.description }) : '（空）',
      context: context,
    };
  }, {
    suggestPrompt: 'world_element',
    fillFn: function(d) {
      var w = 世界当前世界;
      if (!w) { window.toast('未选择世界'); return; }
      var desc = '';
      if (typeof d === 'string') desc = d;
      else if (d && typeof d === 'object') desc = d['描述'] || d['简介'] || d['description'] || (d.items && Array.isArray(d.items) && d.items[0] && (d.items[0]['详细描述']||'')) || '';
      desc = String(desc).trim();
      if (!desc) { window.toast('生成结果为空'); return; }
      w.meta = w.meta || {};
      w.meta.description = desc;
      if (w.title) {
        Store.world.save(w.title, w.meta).then(function() {
          window.toast('简介已更新');
          var ev = document.getElementById('worldEditorView');
          if (ev) 世界渲染编辑器();
        });
      } else {
        window.toast('简介已生成（待填世界名后保存）');
        var ev = document.getElementById('worldEditorView');
        if (ev) 世界渲染编辑器();
      }
    },
  });
}

window.世界渲染编辑器 = 世界渲染编辑器;
