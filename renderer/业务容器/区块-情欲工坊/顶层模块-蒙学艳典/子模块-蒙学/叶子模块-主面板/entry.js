// 情欲工坊 · 蒙学艳典 · 蒙学（4 部蒙学读物，数据源 renderer/数据库/经史子集/蒙学/）
var 蒙学 = 蒙学艳典工厂({
  storeKey: 'mengXueMengXue',
  containerId: 'meng-xueContent',
  viewContentId: 'mxViewContent',
  prefix: 'mxEdit',
  windowPrefix: '蒙学',
  navLabelList: '📋 艳解集',
  navLabelEdit: '✍️ 创作',
  aiFieldId: 'mengXueMxGen',
  aiLabel: '蒙学艳解生成',
  label: '蒙学',
  classicLabel: '蒙学',
  defaultForm: '蒙学',
  dbDir: '经史子集/蒙学',
});
Store.mengXueMengXue = createStore('mengXueMengXue');
