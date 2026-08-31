// 情欲工坊 · 浪语骚歌 · 儿歌童谣（由共享工厂生成）
// 列表/阅读/赏析/复制/编辑/删除/创作/经典库 全部由 淫诗体模块工厂 提供（windowPrefix=儿歌童谣 同名导出）

// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成，与淫诗艳曲完全一致）=====
var 儿歌童谣 = 淫诗体模块工厂({
  storeKey: 'erGeTongYao', containerId: 'er-ge-tong-yaoContent', viewContentId: 'erGeTongYaoViewContent',
  prefix: 'erGeTongYaoEdit', windowPrefix: '儿歌童谣',
  navLabelList: '📋 童谣列表', navLabelEdit: '✍️ 创作',
  formOptions: ['摇篮曲', '绕口令', '跳皮筋', '童谣儿歌'],
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'er_ge_tong_yao_gen', aiFieldId: 'erGeTongYaoGen', aiLabel: '儿歌童谣生成',
  dbPath: '浪语骚歌/儿歌童谣.csv', classicLabel: '儿歌童谣',
  题材库: [
    { key: '摇篮', kws: ['睡吧', '宝贝', '妈妈', '摇篮', '乖乖', '梦乡', '安眠'] },
    { key: '游戏', kws: ['跳皮筋', '捉迷藏', '拍手', '丢手绢', '跳绳', '游戏', '老鹰捉小鸡'] },
    { key: '绕口令', kws: ['绕口', '绕口令', '四和十', '扁担'] },
    { key: '动物', kws: ['小兔', '小鸟', '青蛙', '小鸭', '小猫', '小羊', '布谷'] },
    { key: '自然', kws: ['月亮', '星星', '彩虹', '雨', '雪', '春天', '小花'] },
  ],
});
Store.erGeTongYao = createStore('erGeTongYao');
