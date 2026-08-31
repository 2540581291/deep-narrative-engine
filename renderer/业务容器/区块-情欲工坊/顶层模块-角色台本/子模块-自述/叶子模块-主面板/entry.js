// 情欲工坊 · 角色台本 · 角色自述（由共享工厂生成）
// 以角色卡角色为核心：第一人称自述——人生回顾 / 最快乐或最羞耻的经历 / 隐秘的欲望 / 情感告白
// 列表/阅读/复制/编辑/删除/创作 全部由 角色台本工厂 提供（windowPrefix=角色自述 同名导出）

var 角色自述 = 角色台本工厂({
  storeKey: 'roleMonologue', containerId: 'roleMonologueContent', viewContentId: 'roleMonologueViewContent',
  prefix: 'roleMonologueEdit', windowPrefix: '角色自述',
  navLabelList: '📋 自述列表', navLabelEdit: '✍️ 创作',
  promptName: 'role_monologue_gen', aiFieldId: 'roleMonologueGen', aiLabel: '角色自述生成',
  对象模式: true,
  主题标签: '自述主题',
  主题选项: ['人生自述', '最快乐的经历', '最羞耻的经历', '初次性经历', '最难忘的一夜', '内心隐秘的欲望', '情感告白'],
  语气选项: ['坦然讲述', '羞涩断续', '带着哭腔', '自嘲苦笑', '庄重平静', '情难自禁'],
});
if (!Store.roleMonologue) Store.roleMonologue = createStore('roleMonologue');
