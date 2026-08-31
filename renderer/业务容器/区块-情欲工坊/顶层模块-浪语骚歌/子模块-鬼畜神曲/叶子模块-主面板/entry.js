// 情欲工坊 · 浪语骚歌 · 鬼畜神曲（由共享工厂生成）
// 列表/阅读/赏析/复制/编辑/删除/创作 全部由 淫诗体模块工厂 提供（windowPrefix=鬼畜神曲 同名导出）

// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成，与淫诗艳曲完全一致）=====
var 鬼畜神曲 = 淫诗体模块工厂({
  storeKey: 'guiChuShenQu', containerId: 'gui-chu-shen-quContent', viewContentId: 'guiChuShenQuViewContent',
  prefix: 'guiChuShenQuEdit', windowPrefix: '鬼畜神曲',
  navLabelList: '📋 神曲列表', navLabelEdit: '✍️ 创作',
  formOptions: ['广告洗脑', '循环复读', '恶搞填词', '方言神曲'],
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'gui_chu_shen_qu_gen', aiFieldId: 'guiChuShenQuGen', aiLabel: '鬼畜神曲生成',
  题材库: [
    { key: '洗脑', kws: ['循环', '重复', '魔性', '上头', '洗脑', '无限'] },
    { key: '广告', kws: ['广告', '促销', '买它', '心动', '好物', '卖'] },
    { key: '恶搞', kws: ['恶搞', '改编', '神曲', '鬼畜', '搞笑', '恶趣味'] },
    { key: '方言', kws: ['方言', '口音', '东北', '河南', '四川', '广东'] },
    { key: '节奏', kws: ['咚咚', '节拍', '哒哒', '节奏', '摇摆', '蹦迪'] },
  ],
});
Store.guiChuShenQu = createStore('guiChuShenQu');
