// 情欲工坊 · 角色台本 · 经历台词（由共享工厂生成）
// 以角色卡角色为核心：先提取该角色的性爱经历（角色卡性爱明细 / AI 提取），选中一段，生成他在那段经历中说过的话
// 列表/阅读/复制/编辑/删除/创作 全部由 角色台本工厂 提供（windowPrefix=角色经历 同名导出）

var 角色经历 = 角色台本工厂({
  storeKey: 'roleExperience', containerId: 'roleExperienceContent', viewContentId: 'roleExperienceViewContent',
  prefix: 'roleExperienceEdit', windowPrefix: '角色经历',
  navLabelList: '📋 经历列表', navLabelEdit: '✍️ 创作',
  promptName: 'role_experience_gen', aiFieldId: 'roleExperienceGen', aiLabel: '经历台词生成',
  经历模式: true, 对象模式: true,
  主题标签: '台词类型',
  主题选项: ['呻吟与哭喊', '被逼供述', '哀求讨饶', '高潮时的呓语', '事后的抱怨', '内心独白'],
  语气选项: ['破碎断续', '压抑低喘', '哭腔', '高亢失神', '羞愤交加'],
});
if (!Store.roleExperience) Store.roleExperience = createStore('roleExperience');
