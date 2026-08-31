// 互动小说（重做·玩家实时生成）· 生成层
// 玩家每回合由 AI 实时生成下一段 + 意图化选项 + 世界状态更新；开场生成 cast(可选现造)。
// 说明：本模块为玩家实时生成，非"弹窗确认"式二元模板，故走 registerPrompt + LLM.callJSON 自动生成。

function 互动小说角色行(c) {
  if (!c) return '';
  return '- ' + (c.name || '无名') + '（' + ((c.gender || '') + (c.age ? ' ' + c.age + '岁' : '') + (c.identity ? ' · ' + c.identity : '')).replace(/^·/, '') + '）\n　　性格：' + (c.personality || '') + '\n　　口吻：' + (c.voice || '') + '\n';
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
  var ctx = '故事标题：' + (故事.title || '未命名') + '\n题材：' + (故事.题材 || '未指定') + '\n尺度档位：' + 故事.尺度 + '\n文风：' + (故事.文风 || '自然') + '\n世界观：' + (故事.世界观锚点 || '未指定') + '\n';
  var 主角 = 故事.主角 || (故事.cast && 故事.cast[0] && 故事.cast[0].name) || '我';
  var 性别 = 故事.主角性别 || (故事.cast && 故事.cast[0] && 故事.cast[0].gender) || '男性';
  var 定位 = 故事.主角定位 || '平等互动';
  ctx += '【主角·玩家扮演】' + 主角 + '（性别：' + 性别 + '，故事定位：' + 定位 + '；全程以「' + 主角 + '」的视角展开，不得切换到他人视角；若定位非「承受者」则不要把主角写成被动承受、总被惩罚/被调教的一方）\n';
  if (故事.cast && 故事.cast.length) ctx += '\n【角色】\n' + 故事.cast.map(互动小说角色行).join('');
  世界 = 世界 || {};
  ctx += '\n【剧情摘要】\n' + (摘要 || '(故事开头)') + '\n';
  ctx += '\n【世界状态】\n地点：' + (世界.地点 || '?') + '\n时间：' + (世界.时间 || '') + '\n在场：' + ((世界.在场 || []).join('、') || '-') + '\n好感：' + ((世界.好感 && Object.keys(世界.好感).length) ? JSON.stringify(世界.好感) : '-') + '\n变量：' + ((世界.变量 && Object.keys(世界.变量).length) ? JSON.stringify(世界.变量) : '-') + '\n已发生事件：' + ((世界.事件 || []).join('、') || '-') + '\n';
  ctx += '\n【上一段】\n' + (上一段 || '') + '\n';
  ctx += '\n【玩家选择】' + (所选选项.intent || '行动') + ' · ' + (所选选项.text || '') + '\n';
  return ctx;
}

// AI 全包生成新故事：方向 + 可选配置(题材/尺度/文风/世界观) → 标题/题材/尺度/文风/世界观/cast/开场/首选项，AI 全包
function 互动小说生成新故事(方向, 配置) {
  配置 = 配置 || {};
  var dir = (方向 || 配置.direction || '').trim() || '（无特定方向，请自由构思一个感人的互动故事）';
  var r = renderPrompt('in_create', { direction: dir, 题材: (配置.题材 || '').trim(), 尺度: (配置.尺度 || '').trim(), 文风: (配置.文风 || '').trim(), 世界观: (配置.世界观 || '').trim(), 主角性别: (配置.主角性别 || '男性'), 主角定位: (配置.主角定位 || '平等互动') });
  return LLM.callJSON({ label: '互动小说·构剧', system: r.system, prompt: r.user }).then(function(d) {
    if (!d || !d.text) throw new Error('故事生成失败');
    var id = 'in_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    var now = new Date().toISOString();
    var cast = Array.isArray(d.cast) ? d.cast : [];
    var 出场名 = cast.map(function(c) { return c && c.name; }).filter(Boolean);
    var world = { 地点: '', 时间: '故事开始', 在场: 出场名, 好感: {}, 变量: {}, 事件: [] };
    var n1 = { id: 'n1', type: '剧情', text: String(d.text), lines: Array.isArray(d.lines) ? d.lines : null, cast: 出场名, options: (d.options || []).map(function(o) { return { text: o.text || '', intent: o.intent || '行动' }; }), world: world, summary: String(d.text), ending: '' };
    var story = { id: id, title: (d.title || '').trim() || '未命名故事', 题材: (d.题材 || '').trim(), 尺度: d.尺度 || '唯美风雅', 文风: (d.文风 || '').trim(), 世界观锚点: (d.世界观 || '').trim(), 主角: (d.protagonist || (cast[0] && cast[0].name) || '我'), 主角性别: (配置.主角性别 || d.主角性别 || (cast[0] && cast[0].gender) || '男性'), 主角定位: (配置.主角定位 || d.主角定位 || '平等互动'), cast: cast, nodes: { n1: n1 }, 开场节点id: 'n1', 当前节点id: 'n1', 历史: ['n1'], 结局集: [], createdAt: now, updatedAt: now };
    return 互动小说存故事(story).then(function() { return story; });
  });
}

// 开场：生成开场段 + cast(可现造) + 意图化选项，并建立初始节点/世界态/摘要
function 互动小说开场生成(故事) {
  var r = renderPrompt('in_open', { ctx: 互动小说组装开场ctx(故事) });
  return LLM.callJSON({ label: '互动小说·开场', system: r.system, prompt: r.user }).then(function(d) {
    if (!d || !d.text) throw new Error('开场生成失败');
    if (d.cast && d.cast.length) 故事.cast = d.cast;
    故事.cast = 故事.cast || [];
    故事.主角 = d.protagonist || (故事.cast[0] && 故事.cast[0].name) || '我';
    var 出场名 = 故事.cast.map(function(c) { return c && c.name; }).filter(Boolean);
    var world = { 地点: '', 时间: '故事开始', 在场: 出场名, 好感: {}, 变量: {}, 事件: [] };
    var n1 = { id: 'n1', type: '剧情', text: String(d.text), lines: Array.isArray(d.lines) ? d.lines : null, cast: 出场名, options: (d.options || []).map(function(o) { return { text: o.text || '', intent: o.intent || '行动' }; }), world: world, summary: String(d.text), ending: '' };
    故事.nodes = { n1: n1 };
    故事.开场节点id = 'n1';
    故事.当前节点id = 'n1';
    故事.历史 = ['n1'];
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

// 玩家选择当前节点的第 idx 个选项 → 生成下一段（若该选项已生成则跳过去）
function 互动小说下一步生成(故事, idx) {
  var cur = 故事.nodes[故事.当前节点id];
  var option = cur && cur.options && cur.options[idx];
  if (!option) return Promise.reject(new Error('选项无效'));
  if (option.next && 故事.nodes[option.next]) return 互动小说跳到节点(故事, option.next);
  var 世界 = cur.world || {};
  var 摘要 = cur.summary || '';
  var r = renderPrompt('in_turn', { ctx: 互动小说组装turnctx(故事, cur.text, option, 世界, 摘要) });
  return LLM.callJSON({ label: '互动小说·延续', system: r.system, prompt: r.user }).then(function(d) {
    if (!d || !d.text) throw new Error('延续生成失败');
    var newId = 'n' + (Object.keys(故事.nodes).length + 1);
    var w = d.world || {};
    var world = {
      地点: w.地点 != null ? w.地点 : (世界.地点 || ''),
      时间: w.时间 != null ? w.时间 : (世界.时间 || ''),
      在场: Array.isArray(w.在场) ? w.在场 : (世界.在场 || []),
      好感: Object.assign({}, 世界.好感 || {}, w.好感 || {}),
      变量: Object.assign({}, 世界.变量 || {}, w.变量 || {}),
      事件: (Array.isArray(w.事件) ? w.事件 : []).concat(世界.事件 || []).slice(-8),
    };
    var node = { id: newId, type: d.ending ? '结局' : '剧情', text: String(d.text), lines: Array.isArray(d.lines) ? d.lines : null, cast: world.在场, options: (d.options || []).map(function(o) { return { text: o.text || '', intent: o.intent || '行动' }; }), world: world, summary: d.summary || 摘要, ending: d.ending || '' };
    故事.nodes[newId] = node;
    option.next = newId;
    故事.当前节点id = newId;
    故事.历史.push(newId);
    if (d.ending && 故事.结局集.indexOf(d.ending) < 0) 故事.结局集.push(d.ending);
    return 互动小说存故事(故事).then(function() { return { story: 故事, node: node, ending: d.ending || '' }; });
  });
}

// 回退到上一个选择点（弹掉最后一步，回到上一个节点，允许重选生成新分支）
function 互动小说回退(故事) {
  if (故事.历史.length <= 1) { toast('已是开头，无法回退'); return Promise.resolve(故事); }
  故事.历史.pop();
  故事.当前节点id = 故事.历史[故事.历史.length - 1];
  return 互动小说存故事(故事).then(function() { return 故事; });
}

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
  var 世界 = cur.world || {};
  var 摘要 = cur.summary || '';
  var r = renderPrompt('in_turn', { ctx: 互动小说组装turnctx(故事, cur.text, option, 世界, 摘要) });
  return LLM.callJSON({ label: '互动小说·自定义延续', system: r.system, prompt: r.user }).then(function(d) {
    if (!d || !d.text) throw new Error('延续生成失败');
    var newId = 'n' + (Object.keys(故事.nodes).length + 1);
    var w = d.world || {};
    var world = {
      地点: w.地点 != null ? w.地点 : (世界.地点 || ''),
      时间: w.时间 != null ? w.时间 : (世界.时间 || ''),
      在场: Array.isArray(w.在场) ? w.在场 : (世界.在场 || []),
      好感: Object.assign({}, 世界.好感 || {}, w.好感 || {}),
      变量: Object.assign({}, 世界.变量 || {}, w.变量 || {}),
      事件: (Array.isArray(w.事件) ? w.事件 : []).concat(世界.事件 || []).slice(-8),
    };
    var node = { id: newId, type: d.ending ? '结局' : '剧情', text: String(d.text), lines: Array.isArray(d.lines) ? d.lines : null, cast: world.在场, options: (d.options || []).map(function(o) { return { text: o.text || '', intent: o.intent || '行动' }; }), world: world, summary: d.summary || 摘要, ending: d.ending || '' };
    故事.nodes[newId] = node;
    故事.当前节点id = newId;
    故事.历史.push(newId);
    if (d.ending && 故事.结局集.indexOf(d.ending) < 0) 故事.结局集.push(d.ending);
    return 互动小说存故事(故事).then(function() { return { story: 故事, node: node, ending: d.ending || '' }; });
  });
}
window.互动小说自定义生成 = 互动小说自定义生成;

// 重写当前节点正文（AI 基于上下文只重写本段，保留世界态/选项/分支锚点）
function 互动小说重生成节点(故事, node) {
  var 世界 = node.world || {};
  var 摘要 = node.summary || '';
  var 前一句 = (故事.历史 && 故事.历史.length > 1) ? (故事.nodes[故事.历史[故事.历史.length - 2]] || {}).text || '' : '（这是开场/上一段）';
  var ctx = '题材：' + (故事.题材 || '未指定') + '\n尺度档位：' + 故事.尺度 + '\n文风：' + (故事.文风 || '自然') + '\n世界观：' + (故事.世界观锚点 || '未指定') + '\n';
  if (故事.cast && 故事.cast.length) ctx += '\n【角色】\n' + 故事.cast.map(互动小说角色行).join('');
  ctx += '\n【剧情摘要】\n' + (摘要 || '(故事开头)') + '\n';
  ctx += '\n【世界状态】\n地点：' + (世界.地点 || '?') + '\n时间：' + (世界.时间 || '') + '\n在场：' + ((世界.在场 || []).join('、') || '-') + '\n好感：' + ((世界.好感 && Object.keys(世界.好感).length) ? JSON.stringify(世界.好感) : '-') + '\n变量：' + ((世界.变量 && Object.keys(世界.变量).length) ? JSON.stringify(世界.变量) : '-') + '\n已发生事件：' + ((世界.事件 || []).join('、') || '-') + '\n';
  ctx += '\n【上一段】\n' + 前一句 + '\n';
  var r = renderPrompt('in_rewrite', { ctx: ctx });
  return LLM.callJSON({ label: '互动小说·重写本段', system: r.system, prompt: r.user }).then(function(d) {
    if (!d || !d.text) throw new Error('重写失败');
    node.text = String(d.text);
    if (Array.isArray(d.lines)) node.lines = d.lines; else node.lines = null;
    故事.nodes[node.id] = node;
    return 互动小说存故事(故事).then(function() { return 故事; });
  });
}
window.互动小说重生成节点 = 互动小说重生成节点;
