// 情欲工坊 · 点评赏析 · 喷子（刻意挑刺、放大缺点、阴阳怪气给差评）

function 喷子初始化工厂() {
  if (typeof 点评赏析体模块工厂 !== 'function') return;
  点评赏析体模块工厂({
    storeKey: 'dianPingShangXi', mode: 'troll',
    containerId: 'dianPingTrollContent', viewContentId: 'dianPingTrollView',
    windowPrefix: '喷子', tabLabel: '喷子',
    aiFieldId: 'dianPingTroll', promptName: 'dian_ping_troll',
    desc: '刻意挑刺、放大缺点、阴阳怪气，主观给差评。',
  });
}
if (typeof 点评赏析体模块工厂 === 'function') 喷子初始化工厂();
else if (document.readyState === 'complete') 喷子初始化工厂();
else window.addEventListener('load', 喷子初始化工厂);
