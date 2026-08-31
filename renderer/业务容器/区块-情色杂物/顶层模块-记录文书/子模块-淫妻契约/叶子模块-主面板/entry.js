// 情色杂物 · 记录文书 · 淫妻契约
// 由 记录文书工厂 生成，本文件仅提供模块配置

function 淫妻契约初始化工厂() {
  if (typeof 记录文书工厂 !== 'function') return;
  记录文书工厂({
    storeKey: 'docHotwife', containerId: 'doc-hotwifeContent', viewContentId: 'docHotwifeViewContent',
    prefix: 'docHotwife', windowPrefix: '淫妻契约',
    navLabelList: '🔥 淫妻契约', navLabelEdit: '✍️ 创作',
    图标: '🔥',
    文书类型选项: ['自认淫妻契约', '强迫淫妻契约'],
    显示标签: true,
    筛选维度: ['type', 'genre', 'explicit'],
    promptName: 'doc_hotwife_gen', aiFieldId: 'docHotwifeGen', aiLabel: '淫妻契约生成',
    默认文书类型: '自认淫妻契约',
  });
}
if (typeof 记录文书工厂 === 'function') {
  淫妻契约初始化工厂();
} else if (document.readyState === 'complete') {
  淫妻契约初始化工厂();
} else {
  window.addEventListener('load', 淫妻契约初始化工厂);
}
