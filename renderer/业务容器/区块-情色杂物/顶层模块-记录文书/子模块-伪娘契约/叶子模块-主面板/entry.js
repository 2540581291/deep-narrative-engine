// 情色杂物 · 记录文书 · 伪娘的自我养成
// 由 记录文书工厂 生成，本文件仅提供模块配置

function 伪娘契约初始化工厂() {
  if (typeof 记录文书工厂 !== 'function') return;
  记录文书工厂({
    storeKey: 'docFemboy', containerId: 'doc-femboyContent', viewContentId: 'docFemboyViewContent',
    prefix: 'docFemboy', windowPrefix: '伪娘契约',
    navLabelList: '🌸 伪娘的养成', navLabelEdit: '✍️ 创作',
    图标: '🌸',
    文书类型选项: ['伪娘的自我养成'],
    显示标签: true,
    筛选维度: ['type', 'genre', 'explicit'],
    promptName: 'doc_femboy_gen', aiFieldId: 'docFemboyGen', aiLabel: '伪娘的养成生成',
    默认文书类型: '伪娘的自我养成',
  });
}
if (typeof 记录文书工厂 === 'function') {
  伪娘契约初始化工厂();
} else if (document.readyState === 'complete') {
  伪娘契约初始化工厂();
} else {
  window.addEventListener('load', 伪娘契约初始化工厂);
}
