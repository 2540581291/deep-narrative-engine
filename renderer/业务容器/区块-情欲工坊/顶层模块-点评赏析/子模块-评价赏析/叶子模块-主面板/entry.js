// 情欲工坊 · 点评赏析 · 评价赏析（客观认真赏析/评判，褒贬有据）

function 评价赏析初始化工厂() {
  if (typeof 点评赏析体模块工厂 !== 'function') return;
  点评赏析体模块工厂({
    storeKey: 'dianPingShangXi', mode: 'appreciate',
    containerId: 'dianPingAppContent', viewContentId: 'dianPingAppView',
    windowPrefix: '评价赏析', tabLabel: '评价赏析',
    aiFieldId: 'dianPingAppreciate', promptName: 'dian_ping_appreciate',
    desc: '客观、认真地赏析与评判作品，褒贬有据。',
  });
}
if (typeof 点评赏析体模块工厂 === 'function') 评价赏析初始化工厂();
else if (document.readyState === 'complete') 评价赏析初始化工厂();
else window.addEventListener('load', 评价赏析初始化工厂);
