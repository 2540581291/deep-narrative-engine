// 情欲工坊 · 淫诗艳曲 · 浪词（词牌体艳词 · 由共享工厂生成）
// 列表筛选/阅读/赏析/复制/编辑/删除/创作 全部由 淫诗体模块工厂 提供（windowPrefix=词 同名导出）
// 本文件仅保留模块独有配置（诗体）与工厂初始化调用

// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成）=====
// 工厂在 index.html 中位于本模块之前加载，直接调用即可
var 词 = 淫诗体模块工厂({
  storeKey: 'yinCi', containerId: 'yin-ciContent', viewContentId: 'ciViewContent',
  prefix: 'ciEdit', windowPrefix: '词',
  navLabelList: '📋 浪词集', navLabelEdit: '✍️ 创作',
  formOptions: ['小令', '中调', '长调'],
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'ci_gen', aiFieldId: 'ciGen', aiLabel: '浪词生成',
  dbPath: '淫诗艳曲/📜 浪词/浪词.csv', classicLabel: '浪词',
  模块独有选题: { label: '词牌', 编辑键: 'cipai', ctx标签: '词牌', options: ['如梦令', '菩萨蛮', '蝶恋花', '浣溪沙', '卜算子', '鹧鸪天', '念奴娇', '临江仙', '相见欢', '醉花阴'] },
});
Store.yinCi = createStore('yinCi');
