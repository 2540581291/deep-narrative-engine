// 情欲工坊 · 淫诗艳曲 · 古体诗（诗经体/骚体/古风/乐府/歌行/杂言 · 由共享工厂生成）
// 列表筛选/阅读/赏析/复制/编辑/删除/创作 全部由 淫诗体模块工厂 提供（windowPrefix=古体诗 同名导出）
// 本文件仅保留模块独有配置（诗体）与工厂初始化调用


// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成）=====
// 工厂在 index.html 中位于本模块之前加载，直接调用即可
var 古体诗 = 淫诗体模块工厂({
  storeKey: 'guTiShi', containerId: 'gu-ti-shiContent', viewContentId: 'gtsViewContent',
  prefix: 'gtsEdit', windowPrefix: '古体诗',
  navLabelList: '📋 古体集', navLabelEdit: '✍️ 创作',
  formOptions: ['诗经体（四言）', '骚体（兮字句）', '古风', '乐府', '歌行', '柏梁体', '杂言'],
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'gu_shi_gen', aiFieldId: 'guShiGen', aiLabel: '古体艳诗生成',
  dbPath: '淫诗艳曲/🏛️ 古体诗/古体诗.csv', classicLabel: '古体',
  模块独有选题: { label: '古体风格', 编辑键: 'gutifengge', ctx标签: '古体风格', options: ['诗经体', '骚体', '古风', '乐府', '歌行', '柏梁体', '杂言'] },
});
Store.guTiShi = createStore('guTiShi');
