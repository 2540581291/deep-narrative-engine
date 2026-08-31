// 情欲工坊 · 蒙学艳典 · 史部（30 部史书，数据源 renderer/数据库/经史子集/史部/）
var 史部 = 蒙学艳典工厂({
  storeKey: 'mengXueShiBu',
  containerId: 'shi-buContent',
  viewContentId: 'sbViewContent',
  prefix: 'sbEdit',
  windowPrefix: '史部',
  navLabelList: '📋 艳解集',
  navLabelEdit: '✍️ 创作',
  aiFieldId: 'mengXueSbGen',
  aiLabel: '史部艳解生成',
  label: '史部',
  classicLabel: '史部',
  defaultForm: '史部',
  dbDir: '经史子集/史部',
});
Store.mengXueShiBu = createStore('mengXueShiBu');
