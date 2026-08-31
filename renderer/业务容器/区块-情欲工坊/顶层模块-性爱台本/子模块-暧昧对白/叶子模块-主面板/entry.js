// 情欲工坊 · 性爱台本 · 暧昧对白（由共享工厂生成）
// 列表筛选/阅读/赏析/复制/编辑/删除/创作 全部由 淫诗体模块工厂 提供（windowPrefix=暧昧对白 同名导出）
// 创作界面与淫诗艳曲完全一致：作品信息 / 选题 / 灵感素材 / AI 生成 / 改编 五卡片式

// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成，与淫诗艳曲完全一致）=====
var 暧昧对白 = 淫诗体模块工厂({
  storeKey: 'aiMeiDuiBai', containerId: 'ai-mei-dui-baiContent', viewContentId: 'aiMeiDuiBaiViewContent',
  prefix: 'aiMeiEdit', windowPrefix: '暧昧对白',
  navLabelList: '📋 对白列表', navLabelEdit: '✍️ 创作',
  formOptions: ['含蓄撩拨', '若即若离', '试探暗示', '情话绵绵'], formOptionsLabel: '暧昧类型',
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'ai_mei_dui_bai_gen', aiFieldId: 'aiMeiDuiBaiGen', aiLabel: '暧昧对白生成',
  模块独有选题: { label: '关系', 编辑键: 'guanxi', ctx标签: '关系', options: ['暗恋', '前任', '青梅竹马', '师生', '职场', '初识'] },
});
Store.aiMeiDuiBai = createStore('aiMeiDuiBai');
