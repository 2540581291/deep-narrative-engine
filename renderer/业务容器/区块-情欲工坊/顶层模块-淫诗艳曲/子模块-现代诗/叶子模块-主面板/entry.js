// 情欲工坊 · 淫诗艳曲 · 现代诗（白话自由诗：自由诗/散文诗/格律体/民歌体/老干体/屎尿体 · 由共享工厂生成）
// 列表筛选/阅读/赏析/复制/编辑/删除/创作 全部由 淫诗体模块工厂 提供（windowPrefix=现代诗 同名导出）
// 本文件仅保留模块独有配置（诗体/json 经典库）与工厂初始化调用


// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成）=====
// 工厂在 index.html 中位于本模块之前加载，直接调用即可
var 现代诗 = 淫诗体模块工厂({
  storeKey: 'modernPoetry', containerId: 'modern-poetryContent', viewContentId: 'modernPoetryViewContent',
  prefix: 'modernEdit', windowPrefix: '现代诗',
  navLabelList: '📋 诗选', navLabelEdit: '✍️ 创作',
  formOptions: ['自由诗', '散文诗', '格律体', '民歌体', '老干体', '屎尿体'],
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'modern_poetry_gen', aiFieldId: 'modernPoetryGen', aiLabel: '现代艳诗生成',
  dbPath: '淫诗艳曲/✨ 现代诗/自由诗.json', classicLabel: '现代', dbFormat: 'json',
  模块独有选题: { label: '现代诗语', 编辑键: 'shiyu', ctx标签: '现代诗语', options: ['意象派', '口语化', '象征', '都市', '身体写作', '先锋实验', '抒情'] },
});
Store.modernPoetry = createStore('modernPoetry');
