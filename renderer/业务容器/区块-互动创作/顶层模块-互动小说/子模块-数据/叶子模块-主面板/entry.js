// 互动小说（重做·玩家实时生成）· 数据层
// 故事与游玩态一体化存储：每个故事 = 配置 + 生成过的节点图 + 当前进度 + 结局集。
// 节点 node = { id, type, text, cast:[出场角色名], options:[{text,intent,next?}], world:{...}, summary }
// world = { 地点, 时间, 在场:[角色名], 好感:{角色名:数}, 变量:{}, 事件:[...] }

if (typeof Store !== 'undefined' && !Store.interactiveNovel) Store.interactiveNovel = createStore('interactiveNovel');

function 互动小说新建故事(配置) {
  var id = 'in_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  var now = new Date().toISOString();
  var story = {
    id: id,
    title: (配置.title || '').trim() || '未命名故事',
    题材: (配置.题材 || '').trim(),
    尺度: (配置.尺度 || '唯美风雅'),
    文风: (配置.文风 || '').trim(),
    世界观锚点: (配置.世界观锚点 || '').trim(),
    cast: Array.isArray(配置.cast) ? 配置.cast : [],
    nodes: {},              // nodeId -> node
    开场节点id: '',
    当前节点id: '',
    历史: [],               // 走过的 nodeId 序列
    结局集: [],             // 已达成的结局名
    终局条件: [],           // [{名称,描述,判定:{...},已达成,达成于}] 满足任一即走向对应结局（程序化判定）
    待收束: null,           // 条件已达成、等待下一段写下结局：{名称,描述}
    关键事实: [],           // 剧情中累积的设定级事实（模型每轮上报，超 60 条时丢最早的）
    关键事实钉: [],         // 玩家手动钉住的设定：模型碰不到、永不自动丢弃，每轮都以最高优先级发给 AI
    角色状态: {},           // 角色名 -> { 关系, 好感 } 的持久状态
    createdAt: now,
    updatedAt: now,
  };
  return 互动小说存盘(story);
}

// 向后兼容：旧存档缺新字段时补齐默认值，避免 undefined 报错
function 互动小说补默认(story) {
  if (!story || typeof story !== 'object') return story;
  if (!Array.isArray(story.终局条件)) story.终局条件 = [];
  if (story.待收束 === undefined) story.待收束 = null;
  if (!Array.isArray(story.关键事实)) story.关键事实 = [];
  if (!Array.isArray(story.关键事实钉)) story.关键事实钉 = [];
  if (!story.角色状态 || typeof story.角色状态 !== 'object') story.角色状态 = {};
  // 每个角色的持久状态：
  //   刻画 = 玩家亲手写的（模型不得改写、不得违背）
  //   演变 = 模型随剧情补的（逐段累积）
  Object.keys(story.角色状态).forEach(function(k) {
    var s = story.角色状态[k];
    if (!s || typeof s !== 'object') { story.角色状态[k] = { 好感: null, 关系: '', 刻画: '', 演变: '' }; return; }
    if (typeof s.刻画 !== 'string') s.刻画 = '';
    if (typeof s.演变 !== 'string') s.演变 = '';
  });
  return story;
}

// ===== 终局条件：程序化判定引擎 =====
// 判定结构（只允许这几种，由 AI 按提示词的格式产出）：
//   {类型:'好感', 角色:'林夏', 运算符:'>=|<=|>|<|==', 阈值:70}
//   {类型:'变量', 名称:'信任度', 运算符:'>=', 阈值:60}
//   {类型:'事件', 关键词:'主动留下'}          ← 在 已发生事件 + 关键事实 里做子串匹配
//   {全部:[判定,判定,...]} / {任一:[判定,判定,...]}   ← 组合
// 之所以不交给模型判断"够不够结局"，是因为模型判断不可靠；这里在 JS 里判，确定、可测、可显示进度。

function 互动小说数值比较(左, 运算符, 右) {
  switch (运算符) {
    case '>=': return 左 >= 右;
    case '<=': return 左 <= 右;
    case '>':  return 左 > 右;
    case '<':  return 左 < 右;
    case '==': return 左 === 右;
    default:   return false;
  }
}

function 互动小说判定成立(判定, 世界, 关键事实, 步数) {
  if (!判定 || typeof 判定 !== 'object') return false;
  if (Array.isArray(判定.全部)) {
    return 判定.全部.length > 0 && 判定.全部.every(function(c) { return 互动小说判定成立(c, 世界, 关键事实, 步数); });
  }
  if (Array.isArray(判定.任一)) {
    return 判定.任一.some(function(c) { return 互动小说判定成立(c, 世界, 关键事实, 步数); });
  }
  var 类型 = String(判定.类型 || '');
  if (类型 === '好感') {
    var v = (世界.好感 || {})[判定.角色];
    return typeof v === 'number' && 互动小说数值比较(v, 判定.运算符, Number(判定.阈值));
  }
  if (类型 === '变量') {
    var w = (世界.变量 || {})[判定.名称];
    return typeof w === 'number' && 互动小说数值比较(w, 判定.运算符, Number(判定.阈值));
  }
  if (类型 === '事件') {
    var 词 = String(判定.关键词 || '').trim();
    if (!词) return false;
    var 池 = (世界.事件 || []).concat(关键事实 || []);
    return 池.some(function(e) { return String(e).indexOf(词) >= 0; });
  }
  // 步数：防止「错过式结局」在开局几段就误触发（配合好感/事件一起用）
  if (类型 === '步数') {
    return typeof 步数 === 'number' && 互动小说数值比较(步数, 判定.运算符, Number(判定.阈值));
  }
  return false;
}

// 判定是否有效：用来过滤掉模型写漏判定的"死条件"（永远不可能达成，只会误导玩家）
function 互动小说判定有效(判定) {
  if (!判定 || typeof 判定 !== 'object') return false;
  if (Array.isArray(判定.全部)) return 判定.全部.some(互动小说判定有效);
  if (Array.isArray(判定.任一)) return 判定.任一.some(互动小说判定有效);
  return ['好感', '变量', '事件', '步数'].indexOf(String(判定.类型)) >= 0;
}

// 收集这个故事里实际出现过的变量名 / 角色名。
// 目的：条件如果引用了「模型实际从没用过的名字」（比如条件写 掌控、模型实际写 掌控欲），
// 这条条件就永远不会触发，而玩家完全看不出来。
function 互动小说已知变量与角色(故事) {
  var 变量表 = {}, 角色表 = {};
  var nodes = (故事 && 故事.nodes) || {};
  Object.keys(nodes).forEach(function(id) {
    var w = (nodes[id] || {}).world || {};
    Object.keys(w.变量 || {}).forEach(function(k) { 变量表[k] = true; });
    Object.keys(w.好感 || {}).forEach(function(k) { 角色表[k] = true; });
  });
  Object.keys((故事 && 故事.角色状态) || {}).forEach(function(k) { 角色表[k] = true; });
  (故事 && 故事.cast || []).forEach(function(c) { if (c && c.name) 角色表[c.name] = true; });
  return { 变量表: 变量表, 角色表: 角色表 };
}

// 返回条件里「引用但从未出现过」的名字（空数组 = 没问题）
function 互动小说条件可疑引用(条件, 已知) {
  var 缺 = [];
  if (!已知) return 缺;
  (function 走(判) {
    if (!判 || typeof 判 !== 'object') return;
    if (Array.isArray(判.全部)) return 判.全部.forEach(走);
    if (Array.isArray(判.任一)) return 判.任一.forEach(走);
    if (判.类型 === '变量' && 判.名称 && !已知.变量表[判.名称]) 缺.push('变量「' + 判.名称 + '」');
    if (判.类型 === '好感' && 判.角色 && !已知.角色表[判.角色]) 缺.push('角色「' + 判.角色 + '」');
  })(条件 && 条件.判定);
  return 缺;
}

// 单个条件的进度（供 UI 画进度条 / 显示当前值）
function 互动小说条件进度(条件, 世界, 关键事实, 步数) {
  世界 = 世界 || {};
  var 判 = (条件 && 条件.判定) || null;
  var 已达成 = 互动小说判定成立(判, 世界, 关键事实, 步数);
  if (判 && (判.类型 === '好感' || 判.类型 === '变量' || 判.类型 === '步数')) {
    var 当前;
    if (判.类型 === '步数') 当前 = 步数;
    else if (判.类型 === '好感') 当前 = (世界.好感 || {})[判.角色];
    else 当前 = (世界.变量 || {})[判.名称];
    return { 类型: '数值', 当前: (typeof 当前 === 'number' ? 当前 : 0), 目标: Number(判.阈值) || 0, 运算符: 判.运算符 || '>=', 已达成: 已达成 };
  }
  return { 类型: '事件', 已达成: 已达成 };
}

// 评估全部条件 → 返回第一个达成的条件（没达成返回 null）
function 互动小说评估条件(故事, 世界) {
  var 列表 = (故事 && 故事.终局条件) || [];
  // 事件类条件在两个事实池里都能命中：模型累积的事实 + 玩家钉住的设定
  var 事实 = ((故事 && 故事.关键事实) || []).concat((故事 && 故事.关键事实钉) || []);
  var 步数 = ((故事 && 故事.历史) || []).length;
  for (var i = 0; i < 列表.length; i++) {
    if (互动小说判定成立(列表[i] && 列表[i].判定, 世界, 事实, 步数)) {
      if (!列表[i].已达成) { 列表[i].已达成 = true; 列表[i].达成于 = 步数; }
      return 列表[i];
    }
  }
  return null;
}
function 互动小说取故事(id) { return Store.interactiveNovel.get(id).then(互动小说补默认); }

// Store.save 会把 meta.title 覆盖成传入的 key（本模块传的是 story.id），标题会被冲掉。
// 早先的写法是「先 save 一遍、再把标题补写回去」—— 每回合**写两份文件**（存档 1.6MB+ 时白写一倍）。
// 现在直接按正确标题一次写完，并自己维护 Store 约定要维护的 updatedAt / createdAt。
function 互动小说存盘(story) {
  if (!story || !story.id) return Promise.reject(new Error('故事无效'));
  // updatedAt 必须用工具模块 格式化日期 的格式（YYYY-MM-DD HH:MM）——
  // 存档列表按它排序，混进 ISO 格式会导致排序错乱。
  var 时间 = (typeof fmtDate === 'function') ? fmtDate(new Date()) : new Date().toISOString();
  story.updatedAt = 时间;
  if (!story.createdAt) story.createdAt = 时间;
  try { if (typeof debugLog === 'function') debugLog('store', 'save', 'interactiveNovel [' + story.id + ']'); } catch (e) { }

  var 路径 = (typeof Store !== 'undefined' && Store.interactiveNovel && Store.interactiveNovel._metaPath)
    ? Store.interactiveNovel._metaPath(story.id) : null;
  if (路径 && typeof LocalFS !== 'undefined' && LocalFS.saveJSON) {
    return LocalFS.saveJSON(路径, story).then(function() { return story; });
  }

  // 兜底（拿不到内部路径时）——退回原先的两步写法
  var 真标题 = story.title;
  return Store.interactiveNovel.save(story.id, story).then(function() {
    story.title = 真标题;
    if (typeof LocalFS !== 'undefined' && LocalFS.saveJSON && Store.interactiveNovel._metaPath) {
      return LocalFS.saveJSON(Store.interactiveNovel._metaPath(story.id), story);
    }
  }).then(function() { return story; });
}
function 互动小说存故事(story) { return 互动小说存盘(story); }
function 互动小说列表() {
  return Store.interactiveNovel.list().then(function(items) {
    return (items || []).filter(function(i) { return i && i.id && i.nodes; }).map(互动小说补默认);
  });
}
function 互动小说删故事(id) { return Store.interactiveNovel.delete(id); }

// 复制故事：**完整继承**全部节点与历史，生成一份独立新档。
// 用途：从同一个节点出发去试不同的分支（进副本后用「↩ 回退」可退到任意更早的节点再选别的）。
// 与「以此重开」相反：那个是保留设定、进度清零；这个是连进度一起搬过去。
function 互动小说复制故事(id) {
  return 互动小说取故事(id).then(function(旧) {
    if (!旧) throw new Error('原故事不存在');
    return 互动小说列表().then(function(列表) {
      // 副本命名：原名 +（分支 N），N 取未被占用的最小数字
      var 基名 = String(旧.title || '未命名故事').replace(/（分支\s*\d+）\s*$/, '');
      var 已用 = {};
      (列表 || []).forEach(function(s) {
        var m = String(s.title || '').match(/^([\s\S]+?)（分支\s*(\d+)）\s*$/);
        if (m && m[1] === 基名) 已用[parseInt(m[2], 10)] = true;
      });
      var n = 2;
      while (已用[n]) n++;
      var 新 = JSON.parse(JSON.stringify(旧));
      新.id = 'in_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      新.title = 基名 + '（分支 ' + n + '）';
      新.待收束 = null;   // 副本不继承"待收束"，免得刚进来就被收尾
      新.createdAt = new Date().toISOString();
      return 互动小说存故事(新).then(function() { return 新; });
    });
  });
}
window.互动小说复制故事 = 互动小说复制故事;

window.互动小说新建故事 = 互动小说新建故事;
window.互动小说补默认 = 互动小说补默认;
window.互动小说判定成立 = 互动小说判定成立;
window.互动小说判定有效 = 互动小说判定有效;
window.互动小说已知变量与角色 = 互动小说已知变量与角色;
window.互动小说条件可疑引用 = 互动小说条件可疑引用;
window.互动小说条件进度 = 互动小说条件进度;
window.互动小说评估条件 = 互动小说评估条件;
window.互动小说取故事 = 互动小说取故事;
window.互动小说存故事 = 互动小说存故事;
window.互动小说列表 = 互动小说列表;
window.互动小说删故事 = 互动小说删故事;
