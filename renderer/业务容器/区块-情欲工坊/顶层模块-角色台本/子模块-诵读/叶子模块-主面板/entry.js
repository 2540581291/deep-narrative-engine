// 情欲工坊 · 角色台本 · 角色诵读（由共享工厂生成）
// 以角色卡角色为核心：公开诵读稿——当众宣读 / 刑台示众 / 家族集会 / 直播镜头等场景下要念出来的文本
// 列表/阅读/复制/编辑/删除/创作 全部由 角色台本工厂 提供（windowPrefix=角色诵读 同名导出）

var 角色诵读 = 角色台本工厂({
  storeKey: 'roleRecite', containerId: 'roleReciteContent', viewContentId: 'roleReciteViewContent',
  prefix: 'roleReciteEdit', windowPrefix: '角色诵读',
  navLabelList: '📋 诵读列表', navLabelEdit: '✍️ 创作',
  promptName: 'role_recite_gen', aiFieldId: 'roleReciteGen', aiLabel: '角色诵读生成',
  对象模式: true,
  主题标签: '诵读场景',
  主题选项: ['当众宣读', '刑台示众', '家族集会', '直播镜头', '广场围观', '教会忏悔', '主人面前', '婚礼致辞'],
  语气选项: ['羞耻颤抖', '亢奋得意', '麻木顺从', '哭着念完', '一字一顿', '庄严宣读'],
});
if (!Store.roleRecite) Store.roleRecite = createStore('roleRecite');
