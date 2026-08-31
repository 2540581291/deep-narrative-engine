// 情欲工坊 · 点评赏析 · 水军（无底线吹捧、只看立场不看对错）

function 水军初始化工厂() {
  if (typeof 点评赏析体模块工厂 !== 'function') return;
  点评赏析体模块工厂({
    storeKey: 'dianPingShangXi', mode: 'shill',
    containerId: 'dianPingShillContent', viewContentId: 'dianPingShillView',
    windowPrefix: '水军', tabLabel: '水军',
    aiFieldId: 'dianPingShill', promptName: 'dian_ping_shill',
    desc: '无底线吹捧，只看立场不看对错，把任何瑕疵都夸成亮点。',
  });
}
if (typeof 点评赏析体模块工厂 === 'function') 水军初始化工厂();
else if (document.readyState === 'complete') 水军初始化工厂();
else window.addEventListener('load', 水军初始化工厂);
