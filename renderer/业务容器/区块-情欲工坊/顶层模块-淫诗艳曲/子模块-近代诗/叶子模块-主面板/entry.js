// 情欲工坊 · 淫诗艳曲 · 近代诗（近现代旧体：词牌/律绝/古风杂诗 · 由共享工厂生成）
// 列表筛选/阅读/赏析/复制/编辑/删除/创作 全部由 淫诗体模块工厂 提供（windowPrefix=近代诗 同名导出）
// 本文件仅保留模块独有配置（诗体）与工厂初始化调用


// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成）=====
// 工厂在 index.html 中位于本模块之前加载，直接调用即可
var 近代诗 = 淫诗体模块工厂({
  storeKey: 'jindaiPoetry', containerId: 'jindai-poetryContent', viewContentId: 'jindaiPoetryViewContent',
  prefix: 'jindaiEdit', windowPrefix: '近代诗',
  navLabelList: '📋 诗选', navLabelEdit: '✍️ 创作',
  formOptions: ['词牌体', '律绝体', '古风体', '杂言体'],
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'modern_poetry_gen', aiFieldId: 'jindaiPoetryGen', aiLabel: '近代艳诗生成',
  dbPath: '淫诗艳曲/🏛️ 近代诗/律绝体.csv', classicLabel: '近代',
  模块独有选题: { label: '诗风', 编辑键: 'shifeng', ctx标签: '诗风', options: ['新古典', '宋调', '同光体', '南社风', '性灵派', '革命体', '白话化'] },
});
Store.jindaiPoetry = createStore('jindaiPoetry');
