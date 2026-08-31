// 情欲工坊 · 蒙学艳典 · 兵书（11 部兵家典籍，数据源 renderer/数据库/经史子集/兵书/）
var 兵书 = 蒙学艳典工厂({
  storeKey: 'mengXueBingShu',
  containerId: 'bing-shuContent',
  viewContentId: 'bsViewContent',
  prefix: 'bsEdit',
  windowPrefix: '兵书',
  navLabelList: '📋 艳解集',
  navLabelEdit: '✍️ 创作',
  aiFieldId: 'mengXueBsGen',
  aiLabel: '兵书艳解生成',
  label: '兵书',
  classicLabel: '兵书',
  defaultForm: '兵书',
  dbDir: '经史子集/兵书',
});
Store.mengXueBingShu = createStore('mengXueBingShu');
