// 情欲工坊 · 淫诗艳曲 · 艳曲（散曲小令 · 由共享工厂生成）
// 列表筛选/阅读/赏析/复制/编辑/删除/创作 全部由 淫诗体模块工厂 提供（windowPrefix=曲 同名导出）
// 本文件仅保留模块独有配置（诗体）与工厂初始化调用


// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成）=====
// 工厂在 index.html 中位于本模块之前加载，直接调用即可
var 曲 = 淫诗体模块工厂({
  storeKey: 'yinQu', containerId: 'yin-quContent', viewContentId: 'quViewContent',
  prefix: 'quEdit', windowPrefix: '曲',
  navLabelList: '📋 艳曲集', navLabelEdit: '✍️ 创作',
  formOptions: ['小令', '套数', '带过曲'],
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'qu_gen', aiFieldId: 'quGen', aiLabel: '艳曲生成',
  dbPath: '淫诗艳曲/🎶 艳曲/艳曲.csv', classicLabel: '艳曲',
  模块独有选题: { label: '曲牌', 编辑键: 'qupai', ctx标签: '曲牌', options: ['山坡羊', '天净沙', '醉太平', '满庭芳', '喜春来', '红绣鞋', '水仙子', '驻马听', '落梅风', '折桂令'] },
});
Store.yinQu = createStore('yinQu');
