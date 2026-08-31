// 情欲工坊 · 性爱台本 · 相声（由共享工厂生成）
// 列表筛选/阅读/赏析/复制/编辑/删除/创作 全部由 淫诗体模块工厂 提供（windowPrefix=相声 同名导出）
// 创作界面与淫诗艳曲完全一致：作品信息 / 选题 / 灵感素材 / AI 生成 / 改编 五卡片式

// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成，与淫诗艳曲完全一致）=====
var 相声 = 淫诗体模块工厂({
  storeKey: 'xiangSheng', containerId: 'xiang-shengContent', viewContentId: 'xiangShengViewContent',
  prefix: 'xiangShengEdit', windowPrefix: '相声',
  navLabelList: '📋 相声列表', navLabelEdit: '✍️ 创作',
  formOptions: ['对口', '单口', '群口', '柳活'], formOptionsLabel: '形式',
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'xiang_sheng_gen', aiFieldId: 'xiangShengGen', aiLabel: '相声生成',
  模块独有选题: { label: '包袱方向', 编辑键: 'baofu', ctx标签: '包袱方向', options: ['荤包袱', '伦理哏', '贯口艳词', '谐音梗', '方言'] },
});
Store.xiangSheng = createStore('xiangSheng');
