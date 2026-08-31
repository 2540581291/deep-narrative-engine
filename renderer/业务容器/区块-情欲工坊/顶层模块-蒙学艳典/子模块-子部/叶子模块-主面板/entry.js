// 情欲工坊 · 蒙学艳典 · 子部（17 部诸子百家，数据源 renderer/数据库/经史子集/子部/）
var 子部 = 蒙学艳典工厂({
  storeKey: 'mengXueZhuZi',
  containerId: 'zi-buContent',
  viewContentId: 'zbViewContent',
  prefix: 'zbEdit',
  windowPrefix: '子部',
  navLabelList: '📋 艳解集',
  navLabelEdit: '✍️ 创作',
  aiFieldId: 'mengXueZbGen',
  aiLabel: '子部艳解生成',
  label: '子部',
  classicLabel: '子部',
  defaultForm: '子部',
  dbDir: '经史子集/子部',
});
Store.mengXueZhuZi = createStore('mengXueZhuZi');
