// 情色杂物 · 记录文书 · 绿奴契约
// 由 记录文书工厂 生成，本文件仅提供模块配置

function 绿奴契约初始化工厂() {
  if (typeof 记录文书工厂 !== 'function') return;
  记录文书工厂({
    storeKey: 'docCuckold', containerId: 'doc-cuckoldContent', viewContentId: 'docCuckoldViewContent',
    prefix: 'docCuckold', windowPrefix: '绿奴契约',
    navLabelList: '💚 绿奴契约', navLabelEdit: '✍️ 创作',
    图标: '💚',
    文书类型选项: ['自认绿奴契约', '强迫绿奴契约'],
    显示标签: true,
    筛选维度: ['type', 'genre', 'explicit'],
    promptName: 'doc_cuckold_gen', aiFieldId: 'docCuckoldGen', aiLabel: '绿奴契约生成',
    默认文书类型: '自认绿奴契约',
  });
}
if (typeof 记录文书工厂 === 'function') {
  绿奴契约初始化工厂();
} else if (document.readyState === 'complete') {
  绿奴契约初始化工厂();
} else {
  window.addEventListener('load', 绿奴契约初始化工厂);
}
