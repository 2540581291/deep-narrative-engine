// 情色杂物 · 生活消费 · 居家（家具家装 + 厨具餐具 + 家用电器 + 清洁收纳）
// 由 生活消费工厂 生成，本文件仅提供模块配置

function 居家初始化工厂() {
  if (typeof 生活消费工厂 !== 'function') return;
  生活消费工厂({
    storeKey: 'lifeHome', containerId: 'life-homeContent', viewContentId: 'lifeHomeViewContent',
    prefix: 'lifeHome', windowPrefix: '居家',
    navLabelList: '🛒 居家清单', navLabelEdit: '✍️ 创作',
    图标: '🏠',
    品类选项: ['家具', '电器', '厨具', '清洁用品'],
    筛选维度: ['genre', 'explicit', 'price'],
    promptName: 'life_home_gen', aiFieldId: 'lifeHomeGen', aiLabel: '居家商品生成',
  });
}
if (typeof 生活消费工厂 === 'function') {
  居家初始化工厂();
} else if (document.readyState === 'complete') {
  居家初始化工厂();
} else {
  window.addEventListener('load', 居家初始化工厂);
}
