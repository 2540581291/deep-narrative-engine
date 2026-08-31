// 情欲工坊 · 浪语骚歌 · 颂歌圣咏（由共享工厂生成）
// 列表/阅读/赏析/复制/编辑/删除/创作/经典库 全部由 淫诗体模块工厂 提供（windowPrefix=颂歌圣咏 同名导出）

// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成，与淫诗艳曲完全一致）=====
var 颂歌圣咏 = 淫诗体模块工厂({
  storeKey: 'songGeShengYong', containerId: 'song-ge-sheng-yongContent', viewContentId: 'songGeShengYongViewContent',
  prefix: 'songGeShengYongEdit', windowPrefix: '颂歌圣咏',
  navLabelList: '📋 颂歌列表', navLabelEdit: '✍️ 创作',
  formOptions: ['赞美诗', '圣咏', '唱诗班', '弥撒'],
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'song_ge_sheng_yong_gen', aiFieldId: 'songGeShengYongGen', aiLabel: '颂歌圣咏生成',
  dbPath: '浪语骚歌/颂歌圣咏.csv', classicLabel: '颂歌圣咏',
  题材库: [
    { key: '圣咏', kws: ['赞美', '圣', '祈祷', '恩典', '荣耀', '主', '哈利路亚'] },
    { key: '弥撒', kws: ['弥撒', '礼拜', '唱诗', '圣歌', '礼拜堂'] },
    { key: '颂歌', kws: ['颂', '荣耀', '感恩', '赞颂', '颂扬', '敬拜'] },
    { key: '安魂', kws: ['安魂', '弥留', '安息', '灵魂', '天堂', '圣光'] },
  ],
});
Store.songGeShengYong = createStore('songGeShengYong');
