// 情欲工坊 · 性爱台本 · 戏曲唱段（由共享工厂生成）
// 列表筛选/阅读/赏析/复制/编辑/删除/创作 全部由 淫诗体模块工厂 提供（windowPrefix=戏曲唱段 同名导出）
// 创作界面与淫诗艳曲完全一致：作品信息 / 选题 / 灵感素材 / AI 生成 / 改编 五卡片式

// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成，与淫诗艳曲完全一致）=====
var 戏曲唱段 = 淫诗体模块工厂({
  storeKey: 'xiQuChangDuan', containerId: 'xi-qu-chang-duanContent', viewContentId: 'xiQuChangDuanViewContent',
  prefix: 'xiQuEdit', windowPrefix: '戏曲唱段',
  navLabelList: '📋 唱段列表', navLabelEdit: '✍️ 创作',
  formOptions: ['京剧', '越剧', '黄梅戏', '昆曲', '豫剧', '评剧', '川剧', '秦腔'], formOptionsLabel: '剧种',
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'xi_qu_chang_duan_gen', aiFieldId: 'xiQuChangDuanGen', aiLabel: '戏曲唱段生成',
  模块独有选题: { label: '行当', 编辑键: 'hangdang', ctx标签: '行当', options: ['青衣', '花旦', '老生', '小生', '武生', '老旦', '彩旦', '闺门旦'] },
});
Store.xiQuChangDuan = createStore('xiQuChangDuan');
