// 情色杂物 · 记录文书 · 宠物契约
// 由 记录文书工厂 生成，本文件仅提供模块配置

function 宠物契约初始化工厂() {
  if (typeof 记录文书工厂 !== 'function') return;
  记录文书工厂({
    storeKey: 'docPet', containerId: 'doc-petContent', viewContentId: 'docPetViewContent',
    prefix: 'docPet', windowPrefix: '宠物契约',
    navLabelList: '🐶 宠物契约', navLabelEdit: '✍️ 创作',
    图标: '🐶',
    文书类型选项: ['自认宠物契约', '强迫宠物契约'],
    显示标签: true,
    筛选维度: ['type', 'genre', 'explicit'],
    promptName: 'doc_pet_gen', aiFieldId: 'docPetGen', aiLabel: '宠物契约生成',
    默认文书类型: '自认宠物契约',
  });
}
if (typeof 记录文书工厂 === 'function') {
  宠物契约初始化工厂();
} else if (document.readyState === 'complete') {
  宠物契约初始化工厂();
} else {
  window.addEventListener('load', 宠物契约初始化工厂);
}
