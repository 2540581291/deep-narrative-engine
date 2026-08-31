// 情色杂物 · 生活消费 · 穿戴（服饰鞋包 + 内衣家居服 + 情趣服饰）
// 由 生活消费工厂 生成，本文件仅提供模块配置

function 穿戴初始化工厂() {
  if (typeof 生活消费工厂 !== 'function') return;
  生活消费工厂({
    storeKey: 'lifeWear', containerId: 'life-wearContent', viewContentId: 'lifeWearViewContent',
    prefix: 'lifeWear', windowPrefix: '穿戴',
    navLabelList: '🛒 穿戴清单', navLabelEdit: '✍️ 创作',
    图标: '👗',
    品类选项: ['衣物', '鞋靴', '配饰', '内衣'],
    筛选维度: ['genre', 'explicit', 'price'],
    promptName: 'life_wear_gen', aiFieldId: 'lifeWearGen', aiLabel: '穿戴商品生成',
  });
}
if (typeof 生活消费工厂 === 'function') {
  穿戴初始化工厂();
} else if (document.readyState === 'complete') {
  穿戴初始化工厂();
} else {
  window.addEventListener('load', 穿戴初始化工厂);
}
