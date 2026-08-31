// 情色杂物 · 记录文书 · 厕奴契约
// 由 记录文书工厂 生成，本文件仅提供模块配置

function 厕奴契约初始化工厂() {
  if (typeof 记录文书工厂 !== 'function') return;
  记录文书工厂({
    storeKey: 'docToilet', containerId: 'doc-toiletContent', viewContentId: 'docToiletViewContent',
    prefix: 'docToilet', windowPrefix: '厕奴契约',
    navLabelList: '🚽 厕奴契约', navLabelEdit: '✍️ 创作',
    图标: '🚽',
    文书类型选项: ['自认厕奴契约', '强迫厕奴契约'],
    显示标签: true,
    筛选维度: ['type', 'genre', 'explicit'],
    promptName: 'doc_toilet_gen', aiFieldId: 'docToiletGen', aiLabel: '厕奴契约生成',
    默认文书类型: '自认厕奴契约',
  });
}
if (typeof 记录文书工厂 === 'function') {
  厕奴契约初始化工厂();
} else if (document.readyState === 'complete') {
  厕奴契约初始化工厂();
} else {
  window.addEventListener('load', 厕奴契约初始化工厂);
}
