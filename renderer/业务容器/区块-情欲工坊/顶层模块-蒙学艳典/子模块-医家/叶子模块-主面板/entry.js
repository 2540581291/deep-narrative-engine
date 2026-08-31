// 情欲工坊 · 蒙学艳典 · 医家（3 部医学典籍，数据源 renderer/数据库/经史子集/医家/）
var 医家 = 蒙学艳典工厂({
  storeKey: 'mengXueYiJia',
  containerId: 'yi-jiaContent',
  viewContentId: 'yjViewContent',
  prefix: 'yjEdit',
  windowPrefix: '医家',
  navLabelList: '📋 艳解集',
  navLabelEdit: '✍️ 创作',
  aiFieldId: 'mengXueYjGen',
  aiLabel: '医家艳解生成',
  label: '医家',
  classicLabel: '医家',
  defaultForm: '医家',
  dbDir: '经史子集/医家',
});
Store.mengXueYiJia = createStore('mengXueYiJia');
