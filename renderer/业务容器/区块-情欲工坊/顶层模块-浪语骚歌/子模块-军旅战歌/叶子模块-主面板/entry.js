// 情欲工坊 · 浪语骚歌 · 军旅战歌（由共享工厂生成）
// 列表/阅读/赏析/复制/编辑/删除/创作/经典库 全部由 淫诗体模块工厂 提供（windowPrefix=军旅战歌 同名导出）

// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成，与淫诗艳曲完全一致）=====
var 军旅战歌 = 淫诗体模块工厂({
  storeKey: 'junLvZhanGe', containerId: 'jun-lv-zhan-geContent', viewContentId: 'junLvZhanGeViewContent',
  prefix: 'junLvZhanGeEdit', windowPrefix: '军旅战歌',
  navLabelList: '📋 军旅战歌列表', navLabelEdit: '✍️ 创作',
  formOptions: ['队列操练', '行军拉练', '军营夜话', '凯旋庆功'],
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'jun_ge_gen', aiFieldId: 'junLvZhanGeGen', aiLabel: '军旅战歌生成',
  dbPath: '浪语骚歌/军旅战歌.csv', classicLabel: '军旅战歌',
  题材库: [
    { key: '行军', kws: ['前进', '出发', '号角', '列队', '步伐', '行军', '挺进'] },
    { key: '思念', kws: ['家乡', '亲人', '姑娘', '母亲', '故乡', '想念', '远方'] },
    { key: '战地', kws: ['战场', '钢枪', '阵地', '冲锋', '硝烟', '战火', '哨位'] },
    { key: '凯旋', kws: ['胜利', '归来', '凯旋', '荣光', '勋章', '庆功'] },
    { key: '军营', kws: ['军营', '宿舍', '操场', '出操', '熄灯', '值班'] },
  ],
});
Store.junLvZhanGe = createStore('junLvZhanGe');
