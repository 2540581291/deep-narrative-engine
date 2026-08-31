// 情欲工坊 · 淫诗艳曲 · 淫诗（诗集 / 创作 · 由共享工厂生成）
// 列表筛选/阅读/赏析/复制/编辑/删除/创作 全部由 淫诗体模块工厂 提供（windowPrefix=淫诗 同名导出）
// 本文件仅保留模块独有配置（诗体）与工厂初始化调用

// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成）=====
// 工厂在 index.html 中位于淫诗之后加载，故延迟到工厂定义后再执行
function 淫诗初始化工厂() {
  if (typeof 淫诗体模块工厂 !== 'function') return;
  淫诗体模块工厂({
    storeKey: 'yinShi', containerId: 'poetryContent', viewContentId: 'poetryViewContent',
    prefix: 'poetryEdit', windowPrefix: '淫诗',
    navLabelList: '📖 诗集', navLabelEdit: '✍️ 创作',
    formOptions: ['无', '五言', '七言', '长短句', '自由诗', '五绝', '七绝', '五律', '七律', '排律'],
    formOptionsLabel: '诗体',
    默认露骨度: '粗俗荤诗', 默认诗体: '无',
    promptName: 'poetry_gen', aiFieldId: 'poetryGen', aiLabel: '淫诗生成',
    dbPath: '淫诗艳曲/📖 淫诗/淫诗.csv', classicLabel: '数据库全量淫诗',
    筛选维度: ['form', 'genre', 'explicit'],
    模块独有选题: { label: '气象', 编辑键: 'qixiang', ctx标签: '气象', options: ['圣唐气象', '盛唐气象', '中唐气象', '晚唐气象', '五代气象', '北宋气象', '南宋气象', '金元气象', '明清气象', '近世气象'] },
  });
}
if (typeof 淫诗体模块工厂 === 'function') {
  淫诗初始化工厂();
} else if (document.readyState === 'complete') {
  淫诗初始化工厂();
} else {
  window.addEventListener('load', 淫诗初始化工厂);
}