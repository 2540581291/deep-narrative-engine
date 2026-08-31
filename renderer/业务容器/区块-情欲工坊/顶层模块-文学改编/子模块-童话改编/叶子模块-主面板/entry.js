// 情欲工坊 · 文学改编 · 童话改编（由 文学改编体模块工厂 生成）
// 列表/阅读/赏析/复制/编辑/删除/创作/经典库 全部由工厂提供（windowPrefix=童话改编 同名导出）
var 童话改编 = 文学改编体模块工厂({
  storeKey: 'eroticFairyTale', containerId: 'erotic-fairy-taleContent', viewContentId: 'fairyAdaptViewContent',
  prefix: 'fairyEdit', windowPrefix: '童话改编',
  navLabelList: '📋 童话集', navLabelEdit: '📝 创作', navLabelClassic: '📚 经典库',
  promptName: 'literary_adapt_gen', titlePrompt: 'literary_adapt_title_gen', adaptPrompt: 'literary_adapt_adapt_gen', apprPrompt: 'literary_adapt_appreciation_gen',
  aiFieldId: 'fairyAdaptGen', aiLabel: '童话改编',
  classicLabel: '童话', dbPath: '文学改编/童话改编/童话.csv',
  风格选项: ['暗黑成人', '浪漫香艳', '权力反转', '纯爱改编', '荒诞幽默'],
});
Store.eroticFairyTale = createStore('eroticFairyTale');
