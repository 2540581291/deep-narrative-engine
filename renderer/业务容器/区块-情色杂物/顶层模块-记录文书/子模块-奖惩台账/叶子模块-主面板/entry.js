// 情色杂物 · 记录文书 · 奖惩台账
// 由 记录文书工厂 生成，本文件仅提供模块配置

function 奖惩台账初始化工厂() {
  if (typeof 记录文书工厂 !== 'function') return;
  记录文书工厂({
    storeKey: 'docReward', containerId: 'doc-rewardContent', viewContentId: 'docRewardViewContent',
    prefix: 'docReward', windowPrefix: '奖惩台账',
    navLabelList: '🏆 奖惩台账', navLabelEdit: '✍️ 创作',
    图标: '🏆',
    文书类型选项: ['奖惩台账'],
    显示标签: true,
    筛选维度: ['type', 'genre', 'explicit'],
    promptName: 'doc_reward_gen', aiFieldId: 'docRewardGen', aiLabel: '台账生成',
    默认文书类型: '奖惩台账',
  });
}
if (typeof 记录文书工厂 === 'function') {
  奖惩台账初始化工厂();
} else if (document.readyState === 'complete') {
  奖惩台账初始化工厂();
} else {
  window.addEventListener('load', 奖惩台账初始化工厂);
}
