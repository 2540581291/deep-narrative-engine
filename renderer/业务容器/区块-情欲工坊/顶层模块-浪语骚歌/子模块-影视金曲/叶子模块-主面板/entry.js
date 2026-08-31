// 情欲工坊 · 浪语骚歌 · 影视金曲（由共享工厂生成）
// 列表/阅读/赏析/复制/编辑/删除/创作/经典库 全部由 淫诗体模块工厂 提供（windowPrefix=影视金曲 同名导出）

// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成，与淫诗艳曲完全一致）=====
var 影视金曲 = 淫诗体模块工厂({
  storeKey: 'yingShiJinQu', containerId: 'ying-shi-jin-quContent', viewContentId: 'yingShiJinQuViewContent',
  prefix: 'yingShiJinQuEdit', windowPrefix: '影视金曲',
  navLabelList: '📋 主题歌列表', navLabelEdit: '✍️ 创作',
  formOptions: ['武侠', '宫斗', '谍战', '仙侠', '都市'],
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'ying_shi_zhu_ti_qu_gen', aiFieldId: 'yingShiJinQuGen', aiLabel: '影视金曲生成',
  dbPath: '浪语骚歌/影视金曲.csv', classicLabel: '影视金曲',
  题材库: [
    { key: '武侠', kws: ['江湖', '剑', '侠', '武林', '刀光', '恩怨', '恩怨情仇'] },
    { key: '宫斗', kws: ['宫廷', '皇后', '妃', '皇上', '深宫', '争宠', '娘娘'] },
    { key: '仙侠', kws: ['修仙', '仙', '妖', '法术', '凡尘', '灵', '轮回'] },
    { key: '都市', kws: ['都市', '城市', '白领', '写字楼', '咖啡馆', '地铁', '霓虹'] },
    { key: '年代', kws: ['年代', '老上海', '旗袍', '旧梦', '时光', '岁月', '回忆'] },
  ],
});
Store.yingShiJinQu = createStore('yingShiJinQu');
