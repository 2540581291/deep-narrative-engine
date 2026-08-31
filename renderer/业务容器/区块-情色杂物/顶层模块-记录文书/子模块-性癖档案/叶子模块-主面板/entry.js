// 情色杂物 · 记录文书 · 性癖档案
// 由 记录文书工厂 生成，本文件仅提供模块配置

function 性癖档案初始化工厂() {
  if (typeof 记录文书工厂 !== 'function') return;
  记录文书工厂({
    storeKey: 'docProfile', containerId: 'doc-profileContent', viewContentId: 'docProfileViewContent',
    prefix: 'docProfile', windowPrefix: '性癖档案',
    navLabelList: '🗂️ 性癖档案', navLabelEdit: '✍️ 创作',
    图标: '🗂️',
    文书类型选项: ['性癖档案'],
    显示标签: true,
    筛选维度: ['type', 'genre', 'explicit'],
    promptName: 'doc_profile_gen', aiFieldId: 'docProfileGen', aiLabel: '档案生成',
    默认文书类型: '性癖档案',
  });
}
if (typeof 记录文书工厂 === 'function') {
  性癖档案初始化工厂();
} else if (document.readyState === 'complete') {
  性癖档案初始化工厂();
} else {
  window.addEventListener('load', 性癖档案初始化工厂);
}
