// 情欲工坊 · 性爱台本 · 快板（由共享工厂生成）
// 列表筛选/阅读/赏析/复制/编辑/删除/创作 全部由 淫诗体模块工厂 提供（windowPrefix=快板 同名导出）
// 创作界面与淫诗艳曲完全一致：作品信息 / 选题 / 灵感素材 / AI 生成 / 改编 五卡片式

// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成，与淫诗艳曲完全一致）=====
var 快板 = 淫诗体模块工厂({
  storeKey: 'kuaiBan', containerId: 'kuai-banContent', viewContentId: 'kuaiBanViewContent',
  prefix: 'kuaiBanEdit', windowPrefix: '快板',
  navLabelList: '📋 快板列表', navLabelEdit: '✍️ 创作',
  formOptions: ['快板', '数来宝', '竹板书', '山东快书'], formOptionsLabel: '板式',
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'kuai_ban_gen', aiFieldId: 'kuaiBanGen', aiLabel: '快板生成',
  模块独有选题: { label: '包袱方向', 编辑键: 'baofu', ctx标签: '包袱方向', options: ['庙会风流', '货郎艳事', '逗趣荤段', '贯口'] },
});
Store.kuaiBan = createStore('kuaiBan');
