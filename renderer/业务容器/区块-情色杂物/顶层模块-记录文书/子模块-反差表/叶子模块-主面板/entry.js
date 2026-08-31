// 情色杂物 · 记录文书 · 反差婊的自我养成
// 由 记录文书工厂 生成，本文件仅提供模块配置

function 反差表初始化工厂() {
  if (typeof 记录文书工厂 !== 'function') return;
  记录文书工厂({
    storeKey: 'docReverse', containerId: 'doc-reverseContent', viewContentId: 'docReverseViewContent',
    prefix: 'docReverse', windowPrefix: '反差表',
    navLabelList: '🔁 反差婊养成', navLabelEdit: '✍️ 创作',
    图标: '🔁',
    文书类型选项: ['反差婊的自我养成'],
    显示标签: true,
    筛选维度: ['type', 'genre', 'explicit'],
    promptName: 'doc_reverse_gen', aiFieldId: 'docReverseGen', aiLabel: '反差婊养成生成',
    默认文书类型: '反差婊的自我养成',
  });
}
if (typeof 记录文书工厂 === 'function') {
  反差表初始化工厂();
} else if (document.readyState === 'complete') {
  反差表初始化工厂();
} else {
  window.addEventListener('load', 反差表初始化工厂);
}
