// 情欲工坊 · 淫诗艳曲 · 打油诗（由共享工厂生成）
// 列表筛选/阅读/赏析/复制/编辑/删除/创作 全部由 淫诗体模块工厂 提供（windowPrefix=打油诗 同名导出）
// 本文件仅保留模块独有配置（诗体）与工厂初始化调用


// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成）=====
// 工厂在 index.html 中位于本模块之前加载，直接调用即可
var 打油诗 = 淫诗体模块工厂({
  storeKey: 'dirtyPoetry', containerId: 'dirty-poetryContent', viewContentId: 'dirtyPoetryViewContent',
  prefix: 'dirtyEdit', windowPrefix: '打油诗',
  navLabelList: '📋 诗集', navLabelEdit: '✍️ 创作',
  formOptions: ['打油诗', '四句半', '顺口溜'],
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'dirty_poetry_gen', aiFieldId: 'dirtyPoetryGen', aiLabel: '打油艳诗生成',
  模块独有选题: { label: '幽默方向', 编辑键: 'youmo', ctx标签: '幽默方向', options: ['讽刺', '自嘲', '逗趣', '荤段子', '荒诞'] },
});
Store.dirtyPoetry = createStore('dirtyPoetry');
