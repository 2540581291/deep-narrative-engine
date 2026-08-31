// 情欲工坊 · 文学改编 · 寓言改编（由 文学改编体模块工厂 生成）
var 寓言改编 = 文学改编体模块工厂({
  storeKey: 'fableAdapt', containerId: 'fableAdaptContent', viewContentId: 'fableAdaptViewContent',
  prefix: 'fableEdit', windowPrefix: '寓言改编',
  navLabelList: '📋 寓言集', navLabelEdit: '📝 创作', navLabelClassic: '📚 经典库',
  promptName: 'literary_adapt_gen', titlePrompt: 'literary_adapt_title_gen', adaptPrompt: 'literary_adapt_adapt_gen', apprPrompt: 'literary_adapt_appreciation_gen',
  aiFieldId: 'fableAdaptGen', aiLabel: '寓言改编',
  classicLabel: '寓言', dbPath: '文学改编/寓言改编/寓言.csv',
  风格选项: ['暗黑成人', '浪漫香艳', '权力反转', '讽刺幽默', '寓言新说'],
});
Store.fableAdapt = createStore('fableAdapt');
