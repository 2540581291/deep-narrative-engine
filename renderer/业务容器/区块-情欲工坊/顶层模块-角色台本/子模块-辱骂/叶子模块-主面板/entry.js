// 情欲工坊 · 角色台本 · 辱骂（普通辱骂 + 性辱骂合并 · 由共享工厂生成）
// 以角色卡角色为核心：对特定对象的辱骂——可在「普通辱骂 / 性辱骂」两种模式间切换，
// 各自有独立的辱骂类型（可多选组合）与场合选项；对象可手输 / 导入角色卡 / AI 提取关系人物
// 列表/阅读/复制/编辑/删除/创作 全部由 角色台本工厂 提供（windowPrefix=角色辱骂 同名导出）

var 角色辱骂 = 角色台本工厂({
  storeKey: 'roleInsult', containerId: 'roleInsultContent', viewContentId: 'roleInsultViewContent',
  prefix: 'roleInsultEdit', windowPrefix: '角色辱骂',
  navLabelList: '📋 辱骂列表', navLabelEdit: '✍️ 创作',
  aiFieldId: 'roleInsultGen', aiLabel: '辱骂生成',
  双模式: [
    { key: '普通', label: '🗯 普通辱骂', promptName: 'role_insult_gen',
      主题选项: ['人身攻击', '身份贬损', '亲属辱骂', '市井俚骂', '诅咒恶言', '揭短打脸', '文雅毒舌', '阴阳怪气', '道德批判', '冷嘲热讽'],
      场合选项: ['当众对峙', '私下独处', '家族宴席', '大街上', '电话里', '婚礼现场', '法庭上', '邻里围观'] },
    { key: '性', label: '💢 性辱骂', promptName: 'role_sex_insult_gen',
      主题选项: ['淫词秽语', '性羞辱', '性能力嘲讽', '身体嘲笑', '性奴呼称', '床笫揭短', '淫荡诅咒', '贞操攻击', '挑逗式辱骂', '畜生化辱骂'],
      场合选项: ['正在被操时', '正在被调教时', '被捆绑束缚时', '高潮失神时', '被围观时', '跪在胯下时', '被灌精时', '事后余韵时', '边做边骂时', '被当众羞辱时'] },
  ],
  默认模式: '性',
  主题标签: '辱骂类型',
  语气选项: ['冷笑讥讽', '暴怒咆哮', '阴阳怪气', '平静恶毒', '哭着痛骂', '带笑骂人'],
  对象模式: true, 主题多选: true,
});
if (!Store.roleInsult) Store.roleInsult = createStore('roleInsult');
// 旧「性辱骂」独立库的一次性并入（按标题去重，标 kind='性'）
if (!Store.roleSexInsult) Store.roleSexInsult = createStore('roleSexInsult');
Store.roleInsult.list().then(function(existing) {
  var have = {};
  (existing || []).forEach(function(i) { have[i.title] = 1; });
  Store.roleSexInsult.list().then(function(oldItems) {
    (oldItems || []).forEach(function(it) {
      if (it && it.title && !have[it.title]) {
        it.kind = '性';
        Store.roleInsult.save(it.title, it).then(function(){});
      }
    });
  }).catch(function(){});
}).catch(function(){});
