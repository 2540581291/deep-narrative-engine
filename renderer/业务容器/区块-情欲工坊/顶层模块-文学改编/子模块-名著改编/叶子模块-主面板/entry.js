// 情欲工坊 · 文学改编 · 名著改编（由 文学改编体模块工厂 生成）
var 名著改编 = 文学改编体模块工厂({
  storeKey: 'classicAdapt', containerId: 'classicAdaptContent', viewContentId: 'classicAdaptViewContent',
  prefix: 'classicEdit', windowPrefix: '名著改编',
  navLabelList: '📋 名著集', navLabelEdit: '📝 创作', navLabelClassic: '📚 经典库',
  promptName: 'literary_adapt_gen', titlePrompt: 'literary_adapt_title_gen', adaptPrompt: 'literary_adapt_adapt_gen', apprPrompt: 'literary_adapt_appreciation_gen',
  aiFieldId: 'classicAdaptGen', aiLabel: '名著改编',
  classicLabel: '名著', dbPath: '文学改编/名著改编/名著.csv',
  风格选项: ['古典香艳', '现代重述', '权力反转', '暗黑成人', '浪漫纯爱'],
});
Store.classicAdapt = createStore('classicAdapt');
