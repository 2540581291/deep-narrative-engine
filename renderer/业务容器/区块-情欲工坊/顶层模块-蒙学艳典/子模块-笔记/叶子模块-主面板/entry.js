// 情欲工坊 · 蒙学艳典 · 笔记（21 部笔记小说，数据源 renderer/数据库/经史子集/笔记/）
var 笔记 = 蒙学艳典工厂({
  storeKey: 'mengXueBiJi',
  containerId: 'bi-jiContent',
  viewContentId: 'bjViewContent',
  prefix: 'bjEdit',
  windowPrefix: '笔记',
  navLabelList: '📋 艳解集',
  navLabelEdit: '✍️ 创作',
  aiFieldId: 'mengXueBjGen',
  aiLabel: '笔记艳解生成',
  label: '笔记',
  classicLabel: '笔记',
  defaultForm: '笔记',
  dbDir: '经史子集/笔记',
});
Store.mengXueBiJi = createStore('mengXueBiJi');
