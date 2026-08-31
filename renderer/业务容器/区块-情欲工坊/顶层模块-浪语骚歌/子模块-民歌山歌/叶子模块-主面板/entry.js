// 情欲工坊 · 浪语骚歌 · 民歌山歌（由共享工厂生成）
// 列表/阅读/赏析/复制/编辑/删除/创作/经典库 全部由 淫诗体模块工厂 提供（windowPrefix=民歌山歌 同名导出）

// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成，与淫诗艳曲完全一致）=====
var 民歌山歌 = 淫诗体模块工厂({
  storeKey: 'shanGe', containerId: 'min-ge-shan-geContent', viewContentId: 'minGeViewContent',
  prefix: 'minGeEdit', windowPrefix: '民歌山歌',
  navLabelList: '📋 民歌列表', navLabelEdit: '✍️ 创作',
  formOptions: ['山歌', '小调', '劳动号子'],
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'shan_ge_gen', aiFieldId: 'shanGeGen', aiLabel: '民歌山歌生成',
  dbPath: '浪语骚歌/民歌山歌.csv', classicLabel: '民歌山歌',
  题材库: [
    { key: '对唱', kws: ['对唱', '问答', '唱和', '妹', '哥', '情郎', '心上人'] },
    { key: '山野', kws: ['山', '河', '田野', '放牛', '采茶', '砍柴', '小溪', '青草'] },
    { key: '劳动', kws: ['挑担', '织布', '插秧', '打谷', '耕田', '纺纱', '船工'] },
    { key: '情歌', kws: ['情歌', '情郎', '姑娘', '阿妹', '阿哥', '相好', '想嫁'] },
    { key: '情欲', kws: ['摸', '亲', '抱', '半夜', '偷', '被窝', '云雨'] },
  ],
});
Store.shanGe = createStore('shanGe');
Store.minGe = Store.shanGe;  // 兼容旧变量名（注册表/主界面兜底引用）
