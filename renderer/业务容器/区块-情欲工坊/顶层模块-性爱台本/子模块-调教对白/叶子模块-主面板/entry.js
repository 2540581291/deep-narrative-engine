// 情欲工坊 · 性爱台本 · 调教对白（由共享工厂生成）
// 列表筛选/阅读/赏析/复制/编辑/删除/创作 全部由 淫诗体模块工厂 提供（windowPrefix=调教对白 同名导出）
// 创作界面与淫诗艳曲完全一致：作品信息 / 选题 / 灵感素材 / AI 生成 / 改编 五卡片式

// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成，与淫诗艳曲完全一致）=====
var 调教对白 = 淫诗体模块工厂({
  storeKey: 'tiaoJiaoDuiBai', containerId: 'tiao-jiao-dui-baiContent', viewContentId: 'tiaoJiaoDuiBaiViewContent',
  prefix: 'tiaoJiaoEdit', windowPrefix: '调教对白',
  navLabelList: '📋 对白列表', navLabelEdit: '✍️ 创作',
  formOptions: ['支配服从', '命令回应', '束缚调教', '暴露羞耻'], formOptionsLabel: '调教类型',
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'tiao_jiao_dui_bai_gen', aiFieldId: 'tiaoJiaoDuiBaiGen', aiLabel: '调教对白生成',
  模块独有选题: { label: '关系', 编辑键: 'guanxi', ctx标签: '关系', options: ['主仆', '师生', '恋人', '陌生人', '青梅竹马'] },
});
Store.tiaoJiaoDuiBai = createStore('tiaoJiaoDuiBai');
