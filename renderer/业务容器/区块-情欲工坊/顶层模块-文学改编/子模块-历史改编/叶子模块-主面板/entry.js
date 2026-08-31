// 情欲工坊 · 文学改编 · 历史改编（由 文学改编体模块工厂 生成）
var 历史改编 = 文学改编体模块工厂({
  storeKey: 'historyAdapt', containerId: 'historyAdaptContent', viewContentId: 'histAdaptViewContent',
  prefix: 'histEdit', windowPrefix: '历史改编',
  navLabelList: '📋 作品集', navLabelEdit: '📝 创作', navLabelClassic: '📚 经典库',
  promptName: 'literary_adapt_gen', titlePrompt: 'literary_adapt_title_gen', adaptPrompt: 'literary_adapt_adapt_gen', apprPrompt: 'literary_adapt_appreciation_gen',
  aiFieldId: 'historyAdaptGen', aiLabel: '历史改编',
  classicLabel: '历史', dbPath: '文学改编/历史改编/历史.csv',
  风格选项: ['野史秘闻', '权力情欲', '宫闱艳事', '市井风流', '正史歪写'],
});
Store.historyAdapt = createStore('historyAdapt');
