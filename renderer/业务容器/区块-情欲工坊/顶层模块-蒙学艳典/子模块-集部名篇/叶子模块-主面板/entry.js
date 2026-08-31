// 情欲工坊 · 蒙学艳典 · 集部名篇（359 篇名篇，数据源 renderer/数据库/经典名篇/经典名篇.csv）
var 集部名篇 = 蒙学艳典工厂({
  storeKey: 'mengXueJiBu',
  containerId: 'ji-bu-ming-pianContent',
  viewContentId: 'jbmpViewContent',
  prefix: 'jbmpEdit',
  windowPrefix: '集部名篇',
  navLabelList: '📋 艳解集',
  navLabelEdit: '✍️ 创作',
  aiFieldId: 'mengXueJbmpGen',
  aiLabel: '集部名篇艳解生成',
  label: '集部名篇',
  classicLabel: '集部名篇',
  defaultForm: '集部名篇',
  dbPath: '经典名篇/经典名篇.csv',
});
Store.mengXueJiBu = createStore('mengXueJiBu');
