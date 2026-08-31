// 情欲工坊 · 浪语骚歌 · 嘻哈说唱（由共享工厂生成）
// 列表/阅读/赏析/复制/编辑/删除/创作/经典库 全部由 淫诗体模块工厂 提供（windowPrefix=嘻哈说唱 同名导出）

// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成，与淫诗艳曲完全一致）=====
var 嘻哈说唱 = 淫诗体模块工厂({
  storeKey: 'xiHaShuoChang', containerId: 'xi-ha-shuo-changContent', viewContentId: 'xiHaShuoChangViewContent',
  prefix: 'xiHaShuoChangEdit', windowPrefix: '嘻哈说唱',
  navLabelList: '📋 说唱列表', navLabelEdit: '✍️ 创作',
  formOptions: ['Trap 艳曲', 'Boom Bap 情话', 'Drill 街头', '旋律说唱'],
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'xi_ha_shuo_chang_gen', aiFieldId: 'xiHaShuoChangGen', aiLabel: '嘻哈说唱生成',
  dbPath: '浪语骚歌/嘻哈说唱.csv', classicLabel: '嘻哈说唱',
  题材库: [
    { key: '街头', kws: ['街头', '兄弟', 'real', 'gang', 'hood', '街区', 'Hustle'] },
    { key: '爱情', kws: ['宝贝', '女孩', '心', '爱情', '女友', '爱人', '亲爱的'] },
    { key: '炫富', kws: ['钞票', '跑车', '名牌', '钻石', '金链', '大G', 'LV'] },
    { key: '奋斗', kws: ['梦想', '努力', '逆袭', '拼搏', '汗水', '坚持', 'respect'] },
    { key: '夜店', kws: ['夜店', '派对', '舞池', '摇头', '香槟', 'club', 'party'] },
  ],
});
Store.xiHaShuoChang = createStore('xiHaShuoChang');
