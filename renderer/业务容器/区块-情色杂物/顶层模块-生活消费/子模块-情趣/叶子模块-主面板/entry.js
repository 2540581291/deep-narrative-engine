// 情色杂物 · 生活消费 · 情趣（性玩具 + 爱爱耗材）
// 由 生活消费工厂 生成，本文件仅提供模块配置

function 情趣初始化工厂() {
  if (typeof 生活消费工厂 !== 'function') return;
  生活消费工厂({
    storeKey: 'lifeKink', containerId: 'life-kinkContent', viewContentId: 'lifeKinkViewContent',
    prefix: 'lifeKink', windowPrefix: '情趣',
    navLabelList: '🛒 情趣清单', navLabelEdit: '✍️ 创作',
    图标: '🧸',
    品类选项: ['玩具', '耗材'],
    筛选维度: ['genre', 'explicit', 'price'],
    promptName: 'life_kink_gen', aiFieldId: 'lifeKinkGen', aiLabel: '情趣商品生成',
  });
}
if (typeof 生活消费工厂 === 'function') {
  情趣初始化工厂();
} else if (document.readyState === 'complete') {
  情趣初始化工厂();
} else {
  window.addEventListener('load', 情趣初始化工厂);
}
