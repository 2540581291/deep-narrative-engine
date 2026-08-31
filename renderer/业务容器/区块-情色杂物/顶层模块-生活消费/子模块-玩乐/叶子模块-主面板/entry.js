// 情色杂物 · 生活消费 · 玩乐（娱乐出行 + 健康生活 + 数码电子）
// 由 生活消费工厂 生成，本文件仅提供模块配置

function 玩乐初始化工厂() {
  if (typeof 生活消费工厂 !== 'function') return;
  生活消费工厂({
    storeKey: 'lifePlay', containerId: 'life-playContent', viewContentId: 'lifePlayViewContent',
    prefix: 'lifePlay', windowPrefix: '玩乐',
    navLabelList: '🛒 玩乐清单', navLabelEdit: '✍️ 创作',
    图标: '🎮',
    品类选项: ['娱乐用品', '健身器材', '数码产品'],
    筛选维度: ['genre', 'explicit', 'price'],
    promptName: 'life_play_gen', aiFieldId: 'lifePlayGen', aiLabel: '玩乐商品生成',
  });
}
if (typeof 生活消费工厂 === 'function') {
  玩乐初始化工厂();
} else if (document.readyState === 'complete') {
  玩乐初始化工厂();
} else {
  window.addEventListener('load', 玩乐初始化工厂);
}
