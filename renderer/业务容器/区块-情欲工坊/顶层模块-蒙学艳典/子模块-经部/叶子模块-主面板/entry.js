// 情欲工坊 · 蒙学艳典 · 经部（11 部儒家经典，数据源 renderer/数据库/经史子集/经部/）
var 经部 = 蒙学艳典工厂({
  storeKey: 'mengXueJingBu',
  containerId: 'jing-buContent',
  viewContentId: 'jbViewContent',
  prefix: 'jbEdit',
  windowPrefix: '经部',
  navLabelList: '📋 艳解集',
  navLabelEdit: '✍️ 创作',
  aiFieldId: 'mengXueJbGen',
  aiLabel: '经部艳解生成',
  label: '经部',
  classicLabel: '经部',
  defaultForm: '经部',
  dbDir: '经史子集/经部',
});
Store.mengXueJingBu = createStore('mengXueJingBu');
