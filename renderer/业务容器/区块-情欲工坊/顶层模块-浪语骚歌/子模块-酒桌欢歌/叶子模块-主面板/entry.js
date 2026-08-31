// 情欲工坊 · 浪语骚歌 · 酒桌欢歌（由共享工厂生成）
// 列表/阅读/赏析/复制/编辑/删除/创作/经典库 全部由 淫诗体模块工厂 提供（windowPrefix=酒桌欢歌 同名导出）

// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成，与淫诗艳曲完全一致）=====
var 酒桌欢歌 = 淫诗体模块工厂({
  storeKey: 'jiuZhuoHuanGe', containerId: 'jiu-zhuo-huan-geContent', viewContentId: 'jiuZhuoHuanGeViewContent',
  prefix: 'jiuZhuoHuanGeEdit', windowPrefix: '酒桌欢歌',
  navLabelList: '📋 酒歌列表', navLabelEdit: '✍️ 创作',
  formOptions: ['祝酒歌', '划拳令', '劝酒调', '行酒令'],
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'jiu_zhuo_ge_gen', aiFieldId: 'jiuZhuoHuanGeGen', aiLabel: '酒桌欢歌生成',
  dbPath: '浪语骚歌/酒桌欢歌.csv', classicLabel: '酒桌欢歌',
  题材库: [
    { key: '祝酒', kws: ['举杯', '干杯', '敬酒', '满上', '喝一杯', '杯莫停', '好酒'] },
    { key: '划拳', kws: ['划拳', '拳', '猜拳', '五魁首', '六六顺', '八匹马'] },
    { key: '劝酒', kws: ['劝', '再饮', '再喝', '感情深', '一口闷', '不醉不归'] },
    { key: '行令', kws: ['行令', '酒令', '接龙', '成语接龙', '对诗'] },
    { key: '醉态', kws: ['醉', '微醺', '脸红', '歪倒', '扶墙', '醺'] },
  ],
});
Store.jiuZhuoHuanGe = createStore('jiuZhuoHuanGe');
