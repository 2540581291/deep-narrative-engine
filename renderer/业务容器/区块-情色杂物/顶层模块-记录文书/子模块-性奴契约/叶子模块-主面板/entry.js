// 情色杂物 · 记录文书 · 性奴契约
// 由 记录文书工厂 生成，本文件仅提供模块配置

function 性奴契约初始化工厂() {
  if (typeof 记录文书工厂 !== 'function') return;
  记录文书工厂({
    storeKey: 'docContract', containerId: 'doc-contractContent', viewContentId: 'docContractViewContent',
    prefix: 'docContract', windowPrefix: '性奴契约',
    navLabelList: '📜 契约文书', navLabelEdit: '✍️ 创作',
    图标: '📜',
    文书类型选项: ['自认性奴契约', '强迫性奴契约'],
    显示标签: true,
    筛选维度: ['type', 'genre', 'explicit'],
    promptName: 'doc_contract_gen', aiFieldId: 'docContractGen', aiLabel: '契约生成',
    默认文书类型: '自认性奴契约',
  });
}
if (typeof 记录文书工厂 === 'function') {
  性奴契约初始化工厂();
} else if (document.readyState === 'complete') {
  性奴契约初始化工厂();
} else {
  window.addEventListener('load', 性奴契约初始化工厂);
}
