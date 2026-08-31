// 情欲工坊 · 性爱台本 · 台本（由共享工厂生成）
// 列表筛选/阅读/赏析/复制/编辑/删除/创作 全部由 淫诗体模块工厂 提供（windowPrefix=性爱台本 同名导出）
// 创作界面与淫诗艳曲完全一致：作品信息 / 选题 / 灵感素材 / AI 生成 / 改编 五卡片式

// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成，与淫诗艳曲完全一致）=====
var 性爱台本 = 淫诗体模块工厂({
  storeKey: 'sexScript', containerId: 'scriptContent', viewContentId: 'scriptViewContent',
  prefix: 'scriptEdit', windowPrefix: '性爱台本',
  navLabelList: '📋 台本列表', navLabelEdit: '✍️ 创作',
  formOptions: ['微短剧', '独幕剧', '多幕剧', '广播剧'], formOptionsLabel: '形式',
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'script_gen', aiFieldId: 'scriptGen', aiLabel: '台本生成',
  模块独有选题: { label: '风格', 编辑键: 'style', ctx标签: '风格', options: ['正剧', '喜剧', '悲剧', '荒诞', '黑色幽默'] },
});
Store.sexScript = createStore('script');
