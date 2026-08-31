// 情欲工坊 · 文学改编 · 神话改编（由 文学改编体模块工厂 生成）
var 神话改编 = 文学改编体模块工厂({
  storeKey: 'mythAdapt', containerId: 'mythAdaptContent', viewContentId: 'mythAdaptViewContent',
  prefix: 'mythEdit', windowPrefix: '神话改编',
  navLabelList: '📋 神话集', navLabelEdit: '📝 创作', navLabelClassic: '📚 经典库',
  promptName: 'literary_adapt_gen', titlePrompt: 'literary_adapt_title_gen', adaptPrompt: 'literary_adapt_adapt_gen', apprPrompt: 'literary_adapt_appreciation_gen',
  aiFieldId: 'mythAdaptGen', aiLabel: '神话改编',
  classicLabel: '神话', dbPath: '文学改编/神话改编/神话.csv',
  风格选项: ['暗黑成人', '浪漫香艳', '权力反转', '荒诞神话', '史诗感'],
});
Store.mythAdapt = createStore('mythAdapt');
