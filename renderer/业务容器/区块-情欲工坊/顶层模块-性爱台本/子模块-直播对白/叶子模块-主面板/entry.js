// 情欲工坊 · 性爱台本 · 直播对白（由共享工厂生成）
// 列表筛选/阅读/赏析/复制/编辑/删除/创作 全部由 淫诗体模块工厂 提供（windowPrefix=直播对白 同名导出）
// 创作界面与淫诗艳曲完全一致：作品信息 / 选题 / 灵感素材 / AI 生成 / 改编 五卡片式

// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成，与淫诗艳曲完全一致）=====
var 直播对白 = 淫诗体模块工厂({
  storeKey: 'zhiBoDuiBai', containerId: 'zhi-bo-dui-baiContent', viewContentId: 'zhiBoDuiBaiViewContent',
  prefix: 'zhiBoEdit', windowPrefix: '直播对白',
  navLabelList: '📋 对白列表', navLabelEdit: '✍️ 创作',
  formOptions: ['连麦调情', '打赏点播', '互动问答', '私聊解锁'], formOptionsLabel: '直播类型',
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'zhi_bo_dui_bai_gen', aiFieldId: 'zhiBoDuiBaiGen', aiLabel: '直播对白生成',
  模块独有选题: { label: '人设', 编辑键: 'renshe', ctx标签: '人设', options: ['深夜电台', '擦边舞室', '清纯反差', '御姐', '邻家'] },
});
Store.zhiBoDuiBai = createStore('zhiBoDuiBai');
