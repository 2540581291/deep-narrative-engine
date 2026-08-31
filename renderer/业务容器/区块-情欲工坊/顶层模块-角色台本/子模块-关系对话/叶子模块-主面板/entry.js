// 情欲工坊 · 角色台本 · 关系对话（由共享工厂生成）
// 以角色卡角色为核心：该角色对某个有关系的人物说话——对象可输入 / 导入角色卡 / AI 提取关系人物
// 列表/阅读/复制/编辑/删除/创作 全部由 角色台本工厂 提供（windowPrefix=角色关系对话 同名导出）

var 角色关系对话 = 角色台本工厂({
  storeKey: 'roleRelation', containerId: 'roleRelationContent', viewContentId: 'roleRelationViewContent',
  prefix: 'roleRelationEdit', windowPrefix: '角色关系对话',
  navLabelList: '📋 对话列表', navLabelEdit: '✍️ 创作',
  promptName: 'role_relation_gen', aiFieldId: 'roleRelationGen', aiLabel: '关系对话生成',
  对象模式: true,
  主题标签: '内容方向',
  主题选项: ['调情撩拨', '求饶示弱', '日常问候', '深情告白', '威胁质问', '汇报服侍', '撒娇任性', '告别决裂'],
  语气选项: ['低声细语', '带着哭腔', '咬牙切齿', '娇嗔撒娇', '冷若冰霜', '温柔缱绻'],
});
if (!Store.roleRelation) Store.roleRelation = createStore('roleRelation');
