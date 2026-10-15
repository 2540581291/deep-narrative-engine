// 互动小说（重做·玩家实时生成）· 生成层
// 玩家每回合由 AI 实时生成下一段 + 意图化选项 + 世界状态更新；开场生成 cast(可选现造)。
// 说明：本模块为玩家实时生成，非"弹窗确认"式二元模板，故走 registerPrompt + LLM.callJSON 自动生成。
//
// 【设计：目标约束，不是路线约束】
//   驱动机制 = 一组「终局条件」（好感阈值 / 变量阈值 / 事件发生，可组合），满足任一即走向对应结局。
//   条件由玩家设定、AI 辅助生成候选，判定在数据层用 JS 程序化完成（见 子模块-数据 的 互动小说判定成立）。
//   之所以不做「预设节拍表 + 每轮强制推进」：那会把剧情锁死，玩家选什么都通向同一个预设节点，
//   而且故事会极短（几拍就完）。改用条件后，通往终点的路径开放，玩家自由度来自"路径不唯一"。
//
// 【长线连贯性】上下文 = 终局条件+进度 + 角色档案 + 角色状态(持久) + 关键事实(不丢弃)
//   + 前情摘要(滚动) + 最近 2 段正文 + 世界状态 + 玩家选择。

var 互动小说当前选项索引 = -1;  // 本回合玩家点的是第几个选项（供 提交节点 回填 option.next）
var 互动小说软上限 = 80;        // 兜底：走满这么多段仍未达成任何条件时，提示玩家可以收尾

// ===== 带容错重试的 JSON 调用 =====
// 模型的返回偶尔无法解析成 JSON（格式跑偏，或被输出长度上限截断），此时 LLM.callJSON 会返回 null。
// App 的调用JSON 在设计上「解析失败不重试」，是为了防止第二次调用覆盖第一次已写入的内容；
// 但互动小说在解析失败时还没有写入任何数据，重试是安全的，所以这里补一次，避免玩家白等一场。
function 互动小说调JSON(参数, 校验) {
  校验 = 校验 || function(d) { return !!(d && d.text); };
  function 发起(警告) {
    var p = {};
    Object.keys(参数).forEach(function(k) { p[k] = 参数[k]; });
    if (警告) p.system = (参数.system || '') + '\n\n' + 警告;
    return LLM.callJSON(p).then(function(d) { return (d && 校验(d)) ? d : null; });
  }
  return 发起('').then(function(d) {
    if (d) return d;
    return 发起('【严重警告】上一次的输出无法被解析成有效 JSON。本次必须直接输出一个完整、合法的 JSON 对象：不要任何解释或多余文字，不要用 Markdown 代码块包裹，不要在 JSON 前后添加任何字符，务必保证 JSON 完整闭合、不要被长度截断。').then(function(d2) {
      if (d2) return d2;
      throw new Error('模型连续两次都没能返回可解析的 JSON。可直接重试；若频繁出现，请在「⚙ 设置 → LLM 配置」里把 Max Tokens 调大（思维链会占用同一份输出预算）');
    });
  });
}
function 互动小说校验文本(d) { return !!(d && d.text); }
function 互动小说校验条件(d) { return !!(d && Array.isArray(d.终局条件) && d.终局条件.length); }
function 互动小说校验候选(d) { return !!(d && Array.isArray(d.options) && d.options.length); }

function 互动小说角色行(c) {
  if (!c) return '';
  return '- ' + (c.name || '无名') + '（' + ((c.gender || '') + (c.age ? ' ' + c.age + '岁' : '') + (c.identity ? ' · ' + c.identity : '')).replace(/^·/, '') + '）\n　　性格：' + (c.personality || '') + '\n　　口吻：' + (c.voice || '') + '\n';
}

// ===== 终局条件 → 注入给模型的上下文 =====
function 互动小说条件ctx(故事, 世界) {
  var 列表 = 故事.终局条件 || [];
  var 事实 = 故事.关键事实 || [];
  var 步数 = (故事.历史 || []).length;
  var h = '';
  if (!列表.length) {
    h += '（尚未设定终局条件——故事自由发展，玩家可随时在「终局条件」面板里添加或让 AI 重拟）\n';
  } else {
    h += 列表.map(function(c, i) {
      var 进度 = 互动小说条件进度(c, 世界, 事实, 步数);
      var 进 = 进度.类型 === '数值' ? ('｜当前 ' + 进度.当前 + ' / 目标 ' + 进度.运算符 + ' ' + 进度.目标) : '';
      return (i + 1) + '. [' + (进度.已达成 ? '✔已达成' : '未达成') + '] ' + (c.名称 || '') + '——' + (c.描述 || '') + 进;
    }).join('\n') + '\n';
  }
  h += '【自由度】以上是"终点条件"而非"必经路线"：怎么走到终点由玩家决定，不要为了凑条件而强行编排剧情。';
  if (!故事.待收束 && 列表.length && 步数 >= 互动小说软上限) {
    h += '\n【提示】故事已走 ' + 步数 + ' 段仍未达成任何终局条件，可以开始考虑收束了（但不是必须）。';
  }
  if (故事.待收束) {
    h += '\n\n【⚠ 本段为最终段】已满足终局条件「' + (故事.待收束.名称 || '') + '」（' + (故事.待收束.描述 || '') + '），这一段就是全故事的结尾：\n' +
      '- 正文必须写出结局本身，把当前冲突解决或定格，不得停在悬念、不得停在对话中途\n' +
      '- ending 字段必须填入结局短名（就用「' + (故事.待收束.名称 || '') + '」）\n' +
      '- options 必须输出空数组 []\n' +
      '- 不得再抛出新的矛盾或新的角色\n';
  }
  return h;
}

// ===== 滚动摘要：把较早节点的摘要拼成前情，近 2 段走正文全文 =====
// 早前的实现是「只保留最近 20 条」——长剧本下开头会被整段丢掉，模型会彻底忘记早期设定与事件。
// 改成「近端全留 + 更早的按间隔抽稀」：整条时间线始终都有覆盖，总量又有上限，可以一直玩下去。
var 互动小说摘要近端 = 40;    // 最近多少条原样保留
var 互动小说摘要上限 = 200;   // 前情摘要总数上限（抽稀之后）
function 互动小说滚动摘要(故事, 排除最近) {
  var hist = 故事.历史 || [];
  var 上界 = Math.max(0, hist.length - (排除最近 || 0));
  var 全部 = [];
  for (var i = 0; i < 上界; i++) {
    var n = 故事.nodes[hist[i]];
    if (!n) continue;
    var s = (n.summary || n.text || '').replace(/\s+/g, ' ').slice(0, 80);
    if (s) 全部.push({ 步: i + 1, 文本: s });
  }
  var 条目 = 全部, 已抽稀 = false;
  if (全部.length > 互动小说摘要上限) {
    var 老 = 全部.slice(0, 全部.length - 互动小说摘要近端);
    var 新 = 全部.slice(-互动小说摘要近端);
    var 老配额 = 互动小说摘要上限 - 互动小说摘要近端;
    var k = Math.ceil(老.length / 老配额);
    var 抽 = [];
    for (var j = 0; j < 老.length; j += k) 抽.push(老[j]);
    条目 = 抽.concat(新);
    已抽稀 = true;
  }
  var 行 = 条目.map(function(e) { return '第' + e.步 + '步：' + e.文本; });
  if (已抽稀) 行.unshift('（早期段落已按间隔抽稀、只留要点，所以步号不连续是正常的；越早越简略）');
  return 行.join('\n');
}

// ===== 最近 N 段正文（全文，保细节）=====
function 互动小说最近正文(故事, n) {
  var hist = 故事.历史 || [];
  var out = [];
  for (var i = Math.max(0, hist.length - n); i < hist.length; i++) {
    var nd = 故事.nodes[hist[i]];
    if (!nd) continue;
    // 正文以 lines 为准（和渲染层同一个口径）：有的节点 text 只是残句，
    // 真正的内容全在 lines 里，只取 text 会让那一段的内容几乎全丢。
    var 文 = '';
    if (Array.isArray(nd.lines) && nd.lines.length) {
      文 = nd.lines.map(function(l) {
        if (!l || !l.text) return '';
        return (l.speaker ? l.speaker + '：' : '') + l.text;
      }).filter(Boolean).join('\n');
    }
    if (!文) 文 = nd.text || '';
    if (文) out.push(文);
  }
  return out;
}

// ===== 角色持久状态 =====
function 互动小说角色状态行(故事) {
  var st = 故事.角色状态 || {};
  var keys = Object.keys(st);
  if (!keys.length) return '';
  return keys.map(function(k) {
    var s = st[k] || {};
    var parts = [];
    if (s.好感 != null) parts.push('好感 ' + s.好感);
    if (s.关系) parts.push('关系：' + s.关系);
    var 行 = '- ' + k + '：' + (parts.join('｜') || '—');
    if (s.刻画) 行 += '\n　　■ 玩家亲手定的刻画（最高优先级：必须照此演，不得改写、不得与之矛盾）：' + String(s.刻画).split('\n').join('\n　　');
    if (s.演变) 行 += '\n　　■ 剧情中的变化（前几段累积的）：' + String(s.演变).split('\n').join('；');
    return 行;
  }).join('\n');
}

// 玩家轨迹：把玩家「自己写过的行动」和「近期实际点过的选项」抽出来，
// 让模型能据此揣摩他想要的体验与节奏（而不是只看到最后一次操作、然后一味推进剧情）
function 互动小说玩家轨迹(故事, 条数) {
  var hist = 故事.历史 || [];
  var out = [];
  for (var i = 0; i < hist.length - 1; i++) {
    var cur = 故事.nodes[hist[i]];
    var nxt = hist[i + 1];
    if (!cur || !cur.options || !cur.options.length) continue;
    for (var j = 0; j < cur.options.length; j++) {
      var o = cur.options[j];
      if (!o || o.next !== nxt) continue;
      var t = String(o.text || '').replace(/\s+/g, ' ').slice(0, 60);
      if (t) out.push((o.intent === '自定义' ? '（我自己写的）' : '（我选的·' + (o.intent || '行动') + '）') + t);
      break;
    }
  }
  return out.slice(-(条数 || 6));
}

function 互动小说组装开场ctx(故事) {
  var ctx = '故事标题：' + (故事.title || '未命名') + '\n题材：' + (故事.题材 || '未指定') + '\n尺度档位：' + 故事.尺度 + '\n文风：' + (故事.文风 || '自然') + '\n世界观：' + (故事.世界观锚点 || '未指定') + '\n';
  var 主角 = 故事.主角 || (故事.cast && 故事.cast[0] && 故事.cast[0].name) || '我';
  var 性别 = 故事.主角性别 || (故事.cast && 故事.cast[0] && 故事.cast[0].gender) || '男性';
  var 定位 = 故事.主角定位 || '平等互动';
  ctx += '【主角·玩家扮演】' + 主角 + '（性别：' + 性别 + '，故事定位：' + 定位 + '；全程以「' + 主角 + '」的视角展开，不得切换到他人视角；若定位非「承受者」则不要把主角写成被动承受、总被惩罚/被调教的一方）\n';
  if (故事.cast && 故事.cast.length) ctx += '\n【已选角色】\n' + 故事.cast.map(互动小说角色行).join('');
  return ctx;
}

function 互动小说组装turnctx(故事, 上一段, 所选选项, 世界, 摘要) {
  世界 = 世界 || {};
  var ctx = '【故事标题】' + (故事.title || '未命名') + '\n【题材】' + (故事.题材 || '未指定') + '\n【尺度档位】' + 故事.尺度 + '\n【文风】' + (故事.文风 || '自然') + '\n【世界观】' + (故事.世界观锚点 || '未指定') + '\n';
  var 主角 = 故事.主角 || (故事.cast && 故事.cast[0] && 故事.cast[0].name) || '我';
  var 性别 = 故事.主角性别 || (故事.cast && 故事.cast[0] && 故事.cast[0].gender) || '男性';
  var 定位 = 故事.主角定位 || '平等互动';
  ctx += '【主角·玩家扮演】' + 主角 + '（性别：' + 性别 + '，故事定位：' + 定位 + '；全程以「' + 主角 + '」的视角展开，不得切换到他人视角；若定位非「承受者」则不要把主角写成被动承受、总被惩罚/被调教的一方）\n';

  ctx += '\n【终局条件】\n' + 互动小说条件ctx(故事, 世界);

  if (故事.cast && 故事.cast.length) ctx += '\n【角色档案】\n' + 故事.cast.map(互动小说角色行).join('');

  var 状态行 = 互动小说角色状态行(故事);
  if (状态行) ctx += '\n【角色状态·持久】\n' + 状态行 + '\n';

  // 关键事实分两层：玩家亲手钉住的（最高优先级、不会被自动丢弃）+ 模型累积的
  var 钉事实 = 故事.关键事实钉 || [];
  var 累积事实 = 故事.关键事实 || [];
  if (钉事实.length || 累积事实.length) {
    ctx += '\n【关键事实·必须始终遵守，不得与之矛盾】\n';
    if (钉事实.length) ctx += '■ 玩家亲手钉住（最高优先级，任何情况都不得违背、不得遗忘）：\n' + 钉事实.map(function(f) { return '· ' + f; }).join('\n') + '\n';
    if (累积事实.length) ctx += '■ 剧情中累积的事实：\n' + 累积事实.map(function(f) { return '· ' + f; }).join('\n') + '\n';
  }

  // 开场段全文：设定与基调的锚点，长剧本下最容易被摘要稀释掉
  var 开场节点 = 故事.nodes && 故事.nodes[故事.开场节点id];
  if (开场节点 && 开场节点.text && (故事.历史 || []).length > 3) {
    ctx += '\n【故事开场·全文】（设定与基调的锚点，务必以此为据，不要与之矛盾）\n' + String(开场节点.text).replace(/\s+/g, ' ').slice(0, 500) + '\n';
  }

  var 滚动 = 互动小说滚动摘要(故事, 2);
  if (滚动) ctx += '\n【前情摘要】（已走 ' + ((故事.历史 || []).length) + ' 步，以下是走过来的要点）\n' + 滚动 + '\n';

  // 玩家风格：让模型看清玩家一贯想要什么，据此定选项的调性
  var 轨迹 = 互动小说玩家轨迹(故事, 6);
  if (轨迹.length) {
    ctx += '\n【玩家风格·他近期实际做了什么】\n' + 轨迹.map(function(t) { return '- ' + t; }).join('\n') +
      '\n（据此揣摩他想要的体验与节奏：是想一路推进，还是想沉浸、慢下来、专注关系与氛围。选项的整体调性要贴合他，而不是一味往前赶。）\n';
  }

  ctx += '\n【世界状态】\n地点：' + (世界.地点 || '?') + '\n时间：' + (世界.时间 || '') + '\n在场：' + ((世界.在场 || []).join('、') || '-') +
    '\n好感：' + ((世界.好感 && Object.keys(世界.好感).length) ? JSON.stringify(世界.好感) : '-') +
    '\n关系：' + ((世界.关系 && Object.keys(世界.关系).length) ? JSON.stringify(世界.关系) : '-') +
    '\n变量：' + ((世界.变量 && Object.keys(世界.变量).length) ? JSON.stringify(世界.变量) : '-') +
    '\n已发生事件：' + ((世界.事件 || []).join('、') || '-') + '\n';

  var 近 = 互动小说最近正文(故事, 2);
  if (近.length) {
    ctx += '\n【最近剧情·全文】\n' + 近.map(function(t, i) {
      return (i === 近.length - 1 ? '（上一段）' : '（更早一段）') + t;
    }).join('\n') + '\n';
  } else if (上一段) {
    ctx += '\n【上一段】\n' + 上一段 + '\n';
  }

  // 不再把"上一轮揣测的代价"喂回来：那会让主持人照着自己猜的结果去写，等于自己给自己定死了剧本。
  ctx += '\n【玩家选择】' + (所选选项.intent || '行动') + ' · ' + (所选选项.text || '') + '\n';
  return ctx;
}

// ===== 解析 AI 返回的终局条件 =====
function 互动小说解析条件(d) {
  var 列表 = (d && (d.终局条件 || d.结局条件)) || [];
  if (!Array.isArray(列表)) 列表 = [];
  return 列表.map(function(c) {
    c = c || {};
    return {
      名称: String(c.名称 || c.name || '未命名结局'),
      描述: String(c.描述 || c.desc || ''),
      判定: c.判定 || c.condition || null,
      已达成: false,
      达成于: null,
    };
  }).filter(function(c) { return 互动小说判定有效(c.判定); }).slice(0, 8);
}

// 开局阶段：从 in_create / in_open 的返回里抽出通用字段，建 n1
function 互动小说建首节点(d, world) {
  var 出场名 = (world.在场 || []);
  return {
    id: 'n1', type: '剧情',
    text: String(d.text),
    lines: Array.isArray(d.lines) ? d.lines : null,
    cast: 出场名,
    options: (d.options || []).map(function(o) { return { text: o.text || '', intent: o.intent || '行动' }; }),
    world: world,
    summary: String(d.text).replace(/\s+/g, ' ').slice(0, 120),
    ending: '',
    快照: { 关键事实: [], 角色状态: {}, 待收束: null, 结局集: [] },
  };
}

// AI 全包生成新故事：方向 + 可选配置 → 标题/终局条件/cast/开场/首选项
function 互动小说生成新故事(方向, 配置) {
  配置 = 配置 || {};
  var dir = (方向 || 配置.direction || '').trim() || '（无特定方向，请自由构思一个感人的互动故事）';
  var r = renderPrompt('in_create', { direction: dir, 题材: (配置.题材 || '').trim(), 尺度: (配置.尺度 || '').trim(), 文风: (配置.文风 || '').trim(), 世界观: (配置.世界观 || '').trim(), 主角性别: (配置.主角性别 || '男性'), 主角定位: (配置.主角定位 || '平等互动') });
  return 互动小说调JSON({ label: '互动小说·构剧', system: r.system, prompt: r.user }, 互动小说校验文本).then(function(d) {
    if (!d || !d.text) throw new Error('故事生成失败');
    var id = 'in_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    var now = new Date().toISOString();
    var cast = Array.isArray(d.cast) ? d.cast : [];
    var 出场名 = cast.map(function(c) { return c && c.name; }).filter(Boolean);
    var world = { 地点: '', 时间: '故事开始', 在场: 出场名, 好感: {}, 关系: {}, 变量: {}, 事件: [] };
    var n1 = 互动小说建首节点(d, world);
    var story = {
      id: id, title: (d.title || '').trim() || '未命名故事',
      题材: (d.题材 || '').trim(), 尺度: d.尺度 || '唯美风雅', 文风: (d.文风 || '').trim(), 世界观锚点: (d.世界观 || '').trim(),
      主角: (d.protagonist || (cast[0] && cast[0].name) || '我'),
      主角性别: (配置.主角性别 || d.主角性别 || (cast[0] && cast[0].gender) || '男性'),
      主角定位: (配置.主角定位 || d.主角定位 || '平等互动'),
      cast: cast, nodes: { n1: n1 }, 开场节点id: 'n1', 当前节点id: 'n1', 历史: ['n1'], 结局集: [],
      终局条件: 互动小说解析条件(d),
      待收束: null,
      关键事实: [], 角色状态: {},
      创建参数: { 方向: dir, 题材: (配置.题材 || ''), 尺度: (配置.尺度 || ''), 文风: (配置.文风 || ''), 世界观: (配置.世界观 || ''), 主角性别: (配置.主角性别 || '男性'), 主角定位: (配置.主角定位 || '平等互动') },
      createdAt: now, updatedAt: now,
    };
    return 互动小说存故事(story).then(function() { return story; });
  });
}

// 开场：生成开场段 + cast(可现造) + 意图化选项 + 终局条件
function 互动小说开场生成(故事) {
  var r = renderPrompt('in_open', { ctx: 互动小说组装开场ctx(故事) });
  return 互动小说调JSON({ label: '互动小说·开场', system: r.system, prompt: r.user }, 互动小说校验文本).then(function(d) {
    if (!d || !d.text) throw new Error('开场生成失败');
    if (d.cast && d.cast.length) 故事.cast = d.cast;
    故事.cast = 故事.cast || [];
    故事.主角 = d.protagonist || (故事.cast[0] && 故事.cast[0].name) || '我';
    var 出场名 = 故事.cast.map(function(c) { return c && c.name; }).filter(Boolean);
    var world = { 地点: '', 时间: '故事开始', 在场: 出场名, 好感: {}, 关系: {}, 变量: {}, 事件: [] };
    var n1 = 互动小说建首节点(d, world);
    故事.nodes = { n1: n1 };
    故事.开场节点id = 'n1';
    故事.当前节点id = 'n1';
    故事.历史 = ['n1'];
    var 新条件 = 互动小说解析条件(d);
    if (新条件.length) 故事.终局条件 = 新条件;
    return 互动小说存故事(故事).then(function() { return 故事; });
  });
}

// 跳到已存在节点（用于回退/已选分支）
function 互动小说跳到节点(故事, nodeId) {
  if (!故事.nodes[nodeId]) return Promise.reject(new Error('节点不存在'));
  故事.当前节点id = nodeId;
  if (故事.历史[故事.历史.length - 1] !== nodeId) 故事.历史.push(nodeId);
  return 互动小说存故事(故事).then(function() { return 故事; });
}

// 合并本回合世界状态；随后程序化评估终局条件
function 互动小说并世界(故事, cur, d) {
  var 旧 = (cur && cur.world) || {};
  var w = d.world || {};
  var world = {
    地点: w.地点 != null ? w.地点 : (旧.地点 || ''),
    时间: w.时间 != null ? w.时间 : (旧.时间 || ''),
    时间24: (w.时间24 != null && String(w.时间24).trim()) ? String(w.时间24).trim() : (旧.时间24 || ''),
    在场: Array.isArray(w.在场) ? w.在场 : (旧.在场 || []),
    好感: Object.assign({}, 旧.好感 || {}, w.好感 || {}),
    关系: Object.assign({}, 旧.关系 || {}, w.关系 || {}),
    变量: Object.assign({}, 旧.变量 || {}, w.变量 || {}),
    事件: (Array.isArray(w.事件) ? w.事件 : []).concat(旧.事件 || []).slice(-60),
  };
  // 关键事实（模型累积层）：去重后只保留最近 60 条，更早的会被挤掉。
  // 玩家钉住的另存在 故事.关键事实钉，这里绝不触碰 —— 否则钉住的东西会被模型的新事实冲掉。
  var 钉集 = {};
  (故事.关键事实钉 || []).forEach(function(f) { 钉集[String(f)] = 1; });
  var 新事实 = (Array.isArray(w.关键事实) ? w.关键事实 : []).filter(function(f) {
    return f && String(f).trim() && !钉集[String(f)];   // 别把已钉住的又累积一份
  });
  var 全部 = (故事.关键事实 || []).concat(新事实).filter(function(f) { return f && String(f).trim(); });
  故事.关键事实 = 全部.filter(function(f, i) { return 全部.indexOf(f) === i; }).slice(-60);
  // 好感 / 关系 → story 级持久角色状态
  故事.角色状态 = 故事.角色状态 || {};
  Object.keys(world.好感).forEach(function(k) {
    if (typeof world.好感[k] !== 'number') return;
    故事.角色状态[k] = 故事.角色状态[k] || {};
    故事.角色状态[k].好感 = world.好感[k];
  });
  Object.keys(world.关系).forEach(function(k) {
    故事.角色状态[k] = 故事.角色状态[k] || {};
    故事.角色状态[k].关系 = world.关系[k];
  });
  // 模型每轮上报的「刻画」→ 累积进「演变」（玩家手写的「刻画」绝不触碰，那是他自己的东西）
  var 模型刻画 = (w && w.刻画) || {};
  Object.keys(模型刻画).forEach(function(k) {
    var 新 = String(模型刻画[k] || '').trim();
    if (!新) return;
    故事.角色状态[k] = 故事.角色状态[k] || {};
    var 旧演 = 故事.角色状态[k].演变 || '';
    if (旧演.indexOf(新) >= 0) return;                        // 重复的不再记
    var 行 = (旧演 ? 旧演.split('\n') : []).concat([新]);
    故事.角色状态[k].演变 = 行.slice(-5).join('\n');           // 只留最近 5 条，避免无限长
  });
  // 程序化评估终局条件：只记录「已达成」，**不自动收尾**。
  // 是否结束交给玩家决定（面板上点「就此收尾」才进 待收束），这样可以达成后继续游玩。
  if (typeof 互动小说评估条件 === 'function') 互动小说评估条件(故事, world);
  return world;
}

// 玩家主动触发的收尾：把当前节点当作"上一段"，让模型写下结局。
// 前置条件：调用方已设置好 故事.待收束（提交节点会据此强制收尾）。
function 互动小说收尾生成(故事) {
  var cur = 故事.nodes[故事.当前节点id];
  if (!cur) return Promise.reject(new Error('当前节点不存在'));
  var 世界 = cur.world || {};
  var 伪选项 = { intent: '收尾', text: '（在此为这个故事写下结局）' };
  var r = renderPrompt('in_turn', { ctx: 互动小说组装turnctx(故事, cur.text, 伪选项, 世界, cur.summary || '') });
  return 互动小说调JSON({ label: '互动小说·收尾', system: r.system, prompt: r.user }, 互动小说校验文本).then(function(d) {
    if (!d || !d.text) throw new Error('收尾生成失败');
    return 互动小说提交节点(故事, cur, d, cur.summary || '');
  });
}
window.互动小说收尾生成 = 互动小说收尾生成;

// 组装并保存一个新节点（下一段生成 / 自定义输入 共用）
function 互动小说提交节点(故事, cur, d, 摘要) {
  var 本轮前待收束 = 故事.待收束;          // 生成前的收束状态：本段是否就是"最终段"
  var world = 互动小说并世界(故事, cur, d);
  var newId = 'n' + (Object.keys(故事.nodes).length + 1);
  // 兜底：已进入最终段但模型没给 ending 时，用条件名强制收尾 —— 保证故事一定能终止，不靠模型自觉
  var ending = d.ending || (本轮前待收束 ? (本轮前待收束.名称 || '结局') : '');
  var node = {
    id: newId, type: ending ? '结局' : '剧情',
    text: String(d.text),
    lines: Array.isArray(d.lines) ? d.lines : null,
    cast: world.在场,
    options: ending ? [] : (d.options || []).map(function(o) { return { text: o.text || '', intent: o.intent || '行动' }; }),
    world: world,
    summary: (d.summary && String(d.summary).trim()) || String(d.text).replace(/\s+/g, ' ').slice(0, 120),
    ending: ending,
  };
  故事.nodes[newId] = node;
  if (!ending && cur && cur.options && cur.options[互动小说当前选项索引] && !cur.options[互动小说当前选项索引].next) {
    cur.options[互动小说当前选项索引].next = newId;
  }
  故事.当前节点id = newId;
  故事.历史.push(newId);
  if (ending) {
    if (故事.结局集.indexOf(ending) < 0) 故事.结局集.push(ending);
    故事.待收束 = null;
  }
  // 快照跨章节累积状态，供回退时还原（关键事实无法由节点 world 重建，必须快照）
  node.快照 = {
    关键事实: (故事.关键事实 || []).slice(),
    角色状态: JSON.parse(JSON.stringify(故事.角色状态 || {})),
    待收束: 故事.待收束 ? JSON.parse(JSON.stringify(故事.待收束)) : null,
    结局集: (故事.结局集 || []).slice(),
  };
  return 互动小说存故事(故事).then(function() { return { story: 故事, node: node, ending: ending }; });
}

// 玩家选择当前节点的第 idx 个选项 → 生成下一段（若该选项已生成则跳过去）
function 互动小说下一步生成(故事, idx) {
  var cur = 故事.nodes[故事.当前节点id];
  var option = cur && cur.options && cur.options[idx];
  if (!option) return Promise.reject(new Error('选项无效'));
  if (option.next && 故事.nodes[option.next]) {
    // 走已生成过的分支：返回结构要和 提交节点 一致（{story,node,ending}），
    // 否则调用方拿到的 res.story 会是 undefined，播放区渲染成空白
    return 互动小说跳到节点(故事, option.next).then(function(s) {
      return { story: s, node: s.nodes[s.当前节点id], ending: '' };
    });
  }
  互动小说当前选项索引 = idx;
  var 世界 = cur.world || {};
  var 摘要 = cur.summary || '';
  var r = renderPrompt('in_turn', { ctx: 互动小说组装turnctx(故事, cur.text, option, 世界, 摘要) });
  return 互动小说调JSON({ label: '互动小说·延续', system: r.system, prompt: r.user }, 互动小说校验文本).then(function(d) {
    if (!d || !d.text) throw new Error('延续生成失败');
    return 互动小说提交节点(故事, cur, d, 摘要);
  });
}

// 回退到上一个选择点（弹掉最后一步，回到上一个节点，允许重选生成新分支）
function 互动小说回退(故事) {
  if (故事.历史.length <= 1) { toast('已是开头，无法回退'); return Promise.resolve(故事); }
  故事.历史.pop();
  故事.当前节点id = 故事.历史[故事.历史.length - 1];
  // 还原跨章节累积状态：关键事实/角色状态/待收束/结局集 不随节点回退，必须显式恢复，否则被抛弃分支的设定会残留、污染下一段
  var 目标 = 故事.nodes[故事.当前节点id];
  if (目标 && 目标.快照) {
    故事.关键事实 = (目标.快照.关键事实 || []).slice();
    故事.角色状态 = JSON.parse(JSON.stringify(目标.快照.角色状态 || {}));
    故事.待收束   = 目标.快照.待收束 ? JSON.parse(JSON.stringify(目标.快照.待收束)) : null;
    故事.结局集   = (目标.快照.结局集 || []).slice();
  } else if (目标) {
    // 兼容旧存档（节点无快照）：角色状态可按节点 world 精确重建；关键事实无法回溯，只能保留不动
    故事.角色状态 = {};
    var w = 目标.world || {};
    Object.keys(w.好感 || {}).forEach(function(k) { if (typeof w.好感[k] === 'number') { 故事.角色状态[k] = 故事.角色状态[k] || {}; 故事.角色状态[k].好感 = w.好感[k]; } });
    Object.keys(w.关系 || {}).forEach(function(k) { 故事.角色状态[k] = 故事.角色状态[k] || {}; 故事.角色状态[k].关系 = w.关系[k]; });
    故事.待收束 = null;
  }
  return 互动小说存故事(故事).then(function() { return 故事; });
}

// 以此重开：复制一份进度清零的新档，保留 设定/角色/终局条件/开场，便于原档玩废后原样重来
function 互动小说以此重开(故事) {
  var 首id = 故事.开场节点id || (故事.历史 && 故事.历史[0]) || 'n1';
  var 首节点 = (故事.nodes || {})[首id];
  if (!首节点) return Promise.reject(new Error('找不到开场节点'));
  var n1 = JSON.parse(JSON.stringify(首节点));
  (n1.options || []).forEach(function(o) { o.next = ''; });   // 清掉指回旧分支的锚点，重开后重新生成
  n1.快照 = { 关键事实: [], 角色状态: {}, 待收束: null, 结局集: [] };
  var now = new Date().toISOString();
  var 新 = {
    id: 'in_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    title: (故事.title || '未命名故事').replace(/（重开）$/, '') + '（重开）',
    题材: 故事.题材, 尺度: 故事.尺度, 文风: 故事.文风, 世界观锚点: 故事.世界观锚点,
    主角: 故事.主角, 主角性别: 故事.主角性别, 主角定位: 故事.主角定位,
    cast: JSON.parse(JSON.stringify(故事.cast || [])),
    nodes: {}, 开场节点id: 首id, 当前节点id: 首id, 历史: [首id], 结局集: [],
    终局条件: (故事.终局条件 || []).map(function(c) { var cc = JSON.parse(JSON.stringify(c)); cc.已达成 = false; cc.达成于 = null; return cc; }),
    待收束: null,
    关键事实: [], 角色状态: {},
    创建参数: 故事.创建参数 ? JSON.parse(JSON.stringify(故事.创建参数)) : null,
    createdAt: now, updatedAt: now,
  };
  新.nodes[首id] = n1;
  return 互动小说存故事(新).then(function() { return 新; });
}
window.互动小说以此重开 = 互动小说以此重开;

window.互动小说生成新故事 = 互动小说生成新故事;
window.互动小说开场生成 = 互动小说开场生成;
window.互动小说下一步生成 = 互动小说下一步生成;
window.互动小说回退 = 互动小说回退;
window.互动小说跳到节点 = 互动小说跳到节点;

// 自定义输入：玩家自由输入回复/行动 → 当作"自定义"选项生成下一段
function 互动小说自定义生成(故事, 文本) {
  var cur = 故事.nodes[故事.当前节点id];
  if (!cur) return Promise.reject(new Error('当前节点不存在'));
  var option = { text: 文本 || '（玩家自由行动）', intent: '自定义', next: '' };
  互动小说当前选项索引 = -1;
  var 世界 = cur.world || {};
  var 摘要 = cur.summary || '';
  var r = renderPrompt('in_turn', { ctx: 互动小说组装turnctx(故事, cur.text, option, 世界, 摘要) });
  return 互动小说调JSON({ label: '互动小说·自定义延续', system: r.system, prompt: r.user }, 互动小说校验文本).then(function(d) {
    if (!d || !d.text) throw new Error('延续生成失败');
    return 互动小说提交节点(故事, cur, d, 摘要);
  });
}
window.互动小说自定义生成 = 互动小说自定义生成;

// ===== 重拟终局条件（AI 辅助，供玩家挑选）=====
function 互动小说条件语境ctx(故事) {
  var 世界 = (故事.nodes[故事.当前节点id] || {}).world || {};
  var ctx = '故事标题：' + (故事.title || '未命名') + '\n题材：' + (故事.题材 || '未指定') + '\n尺度档位：' + 故事.尺度 + '\n文风：' + (故事.文风 || '自然') + '\n世界观：' + (故事.世界观锚点 || '未指定') + '\n';
  if (故事.cast && 故事.cast.length) ctx += '\n【角色】\n' + 故事.cast.map(互动小说角色行).join('');
  ctx += '\n【已走步数】' + ((故事.历史 || []).length) + '\n';
  ctx += '\n【当前世界状态】\n地点：' + (世界.地点 || '?') + '\n在场：' + ((世界.在场 || []).join('、') || '-') +
    '\n好感：' + ((世界.好感 && Object.keys(世界.好感).length) ? JSON.stringify(世界.好感) : '-') +
    '\n变量：' + ((世界.变量 && Object.keys(世界.变量).length) ? JSON.stringify(世界.变量) : '-') +
    '\n已发生事件：' + ((世界.事件 || []).join('、') || '-') + '\n';
  var 滚动 = 互动小说滚动摘要(故事, 0);
  if (滚动) ctx += '\n【前情摘要】\n' + 滚动 + '\n';
  return ctx;
}

function 互动小说重拟条件(故事) {
  var r = renderPrompt('in_conditions', { ctx: 互动小说条件语境ctx(故事) });
  return 互动小说调JSON({ label: '互动小说·重拟终局条件', system: r.system, prompt: r.user }, 互动小说校验条件).then(function(d) {
    var 新 = 互动小说解析条件(d);
    if (!新.length) throw new Error('AI 没有返回有效的终局条件');
    故事.终局条件 = 新;
    故事.待收束 = null;
    return 互动小说存故事(故事).then(function() { return 故事; });
  });
}
window.互动小说重拟条件 = 互动小说重拟条件;

// 兜底：模型没给 lines 时，从正文里按「角色名：台词」切出分行结构，尽量保住台词高亮。
// （提示词已强制要求 lines，这里只是防止模型偶尔省略导致高亮整段消失。）
function 互动小说分拣行(文本, cast) {
  var 名字表 = (cast || []).map(function(c) { return (c && c.name) || ''; }).filter(Boolean);
  var 原行 = String(文本 || '').split(/\r?\n/).map(function(s) { return s.trim(); }).filter(Boolean);
  if (!原行.length) return null;
  var 出 = [];
  for (var i = 0; i < 原行.length; i++) {
    var s = 原行[i], 命中 = '';
    for (var j = 0; j < 名字表.length; j++) {
      var n = 名字表[j];
      if (s.indexOf(n) !== 0) continue;
      if (/^\s*[：:，,、]/.test(s.slice(n.length))) { 命中 = n; break; }
    }
    if (命中) 出.push({ speaker: 命中, text: s.slice(命中.length).replace(/^\s*[：:，,、]\s*/, '') });
    else 出.push({ speaker: '', text: s });
  }
  // 一个说话人都没切出来就当失败，交回纯文本回退，别把旁白硬当台词
  return 出.some(function(x) { return x.speaker; }) ? 出 : null;
}

// 重写当前节点正文（AI 基于上下文只重写本段，保留世界态/选项/分支锚点；要求 = 玩家写的改进方向）
function 互动小说重生成节点(故事, node, 要求) {
  var 世界 = node.world || {};
  var 摘要 = node.summary || '';
  var 前一句 = (故事.历史 && 故事.历史.length > 1) ? (故事.nodes[故事.历史[故事.历史.length - 2]] || {}).text || '' : '（这是开场/上一段）';
  var ctx = '【故事标题】' + (故事.title || '未命名') + '\n题材：' + (故事.题材 || '未指定') + '\n尺度档位：' + 故事.尺度 + '\n文风：' + (故事.文风 || '自然') + '\n世界观：' + (故事.世界观锚点 || '未指定') + '\n';
  if (故事.cast && 故事.cast.length) ctx += '\n【角色档案】\n' + 故事.cast.map(互动小说角色行).join('');
  if ((故事.关键事实 || []).length) ctx += '\n【关键事实】\n' + 故事.关键事实.map(function(f) { return '· ' + f; }).join('\n') + '\n';
  ctx += '\n【本段摘要】\n' + (摘要 || '(无)') + '\n';
  ctx += '\n【本段现在的正文】\n' + String(node.text || '') + '\n';
  ctx += '\n【世界状态】\n地点：' + (世界.地点 || '?') + '\n时间：' + (世界.时间 || '') + '\n在场：' + ((世界.在场 || []).join('、') || '-') +
    '\n好感：' + ((世界.好感 && Object.keys(世界.好感).length) ? JSON.stringify(世界.好感) : '-') +
    '\n关系：' + ((世界.关系 && Object.keys(世界.关系).length) ? JSON.stringify(世界.关系) : '-') +
    '\n变量：' + ((世界.变量 && Object.keys(世界.变量).length) ? JSON.stringify(世界.变量) : '-') +
    '\n已发生事件：' + ((世界.事件 || []).join('、') || '-') + '\n';
  ctx += '\n【上一段】\n' + 前一句 + '\n';
  var r = renderPrompt('in_rewrite', { ctx: ctx, 要求: String(要求 || '').trim() || '（无特别要求，自由润色）' });
  return 互动小说调JSON({ label: '互动小说·重写本段', system: r.system, prompt: r.user }, 互动小说校验文本).then(function(d) {
    if (!d || !d.text) throw new Error('重写失败');
    node.text = String(d.text);
    var 行 = (Array.isArray(d.lines) && d.lines.length) ? d.lines : null;
    if (!行) 行 = 互动小说分拣行(node.text, 故事.cast);   // 兜底：别让高亮整段消失
    node.lines = 行 || null;
    故事.nodes[node.id] = node;
    return 互动小说存故事(故事).then(function() { return 故事; });
  });
}
window.互动小说重生成节点 = 互动小说重生成节点;
