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
    createdAt: now,
    updatedAt: now,
  };
  return Store.interactiveNovel.save(id, story).then(function() { return story; });
}

function 互动小说取故事(id) { return Store.interactiveNovel.get(id); }
function 互动小说存故事(story) {
  if (!story || !story.id) return Promise.reject(new Error('故事无效'));
  story.updatedAt = new Date().toISOString();
  return Store.interactiveNovel.save(story.id, story);
}
function 互动小说列表() {
  return Store.interactiveNovel.list().then(function(items) {
    return (items || []).filter(function(i) { return i && i.id && i.nodes; });
  });
}
function 互动小说删故事(id) { return Store.interactiveNovel.delete(id); }

window.互动小说新建故事 = 互动小说新建故事;
window.互动小说取故事 = 互动小说取故事;
window.互动小说存故事 = 互动小说存故事;
window.互动小说列表 = 互动小说列表;
window.互动小说删故事 = 互动小说删故事;
