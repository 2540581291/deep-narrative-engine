// 深度-叙事引擎 · 角色卡 · 📖 小说提取 · 字段集中定义
// 唯一事实来源：所有提取/保存/加载/合并/展示/审查共用的字段定义
// 加新字段只需在此加一行（label 显示名 / type 类型 / prompt 提取说明）

var 小说提取字段 = {
  name:   { label: '名称', type: 'text', prompt: '角色姓名或称呼' },
  gender: { label: '性别', type: 'enum', prompt: 'female/male/femboy/futa/beast' },
  role:   { label: '角色定位', type: 'enum', prompt: '主角/主配/配角/龙套' },
  brief:  { label: '简介', type: 'text', prompt: '一句话概括角色定位和核心特征' },
  title:  { label: '称号', type: 'text', prompt: '称号/头衔（如剑圣/三公主/魔王），无则null' },
  age:    { label: '年龄', type: 'text', prompt: '年龄或年龄段（如25岁/中年/青年），无则null' },
  race:   { label: '种族', type: 'text', prompt: '种族（人类/精灵/兽人等），无则null' },
  occupation: { label: '职业', type: 'text', prompt: '职业/身份（剑士/公主/教师/学生等），无则null' },
  appearance: { label: '外貌', type: 'text', prompt: '外貌特征完整描述：身高体型、发型发色、瞳色、面容五官、肌肤状况等原文全部外貌信息，不遗漏任何细节' },
  personality: { label: '性格', type: 'text', prompt: '性格特点：从言行、选择、态度、他人评价中归纳的所有性格特征' },
  aura:   { label: '气质', type: 'text', prompt: '气质印象（如冷若冰霜/温婉可亲），无则null' },
  background: { label: '背景', type: 'text', prompt: '背景信息：出身来历、成长经历、当前处境、家族、人生历程等' },
  lifeStory: { label: '人生经历', type: 'text', prompt: '角色人生故事：包含人生经历中的重要事件、日常生活的描写、成长中的关键经历等叙事性内容，越详细越好' },
  storyRole: { label: '故事定位', type: 'text', prompt: '在故事中起什么作用，与其他角色的关系' },
  relationships: { label: '关系', type: 'text', prompt: '与其他角色的具体关系（如张三的妹妹/李四的恋人/某人的仇敌）' },
  attireStyle: { label: '衣着装扮', type: 'text', prompt: '衣着装扮完整描述：包括服装款式（上衣/下装/内衣/鞋袜）、颜色材质、配饰、整体风格、日常穿着习惯等所有衣着信息' },
  speechManner: { label: '说话风格', type: 'text', prompt: '说话风格和语气特点（如文绉绉/粗俗/温柔/冰冷/爱用方言等），无则null' },
  catchphrases: { label: '口头禅', type: 'array', prompt: '角色常挂在嘴边的话/口头禅' },
  bedroomTalk: { label: '做爱说过的话', type: 'array', prompt: '角色在性爱中实际说过的台词/叫床/淫语' },
  sexCharacteristics: { label: '性特征', type: 'text', prompt: '性特征描述：第二性征发育、体态曲线、私处（乳房/阴茎/阴道/肛门等）的外貌描述' },
  sexualSkill: { label: '性经验', type: 'text', prompt: '性经验与身体表现：从经历中沉淀出的性技能与身体被开发程度——技巧熟练度、性欲强弱、敏感带与身体反应、床笫间的表现（主动/被动、克制/放浪）、被调教出的身体习惯与承受力' },
  sexualPreferences: { label: '性偏好', type: 'text', prompt: '性偏好与癖好：敏感带、喜欢的性行为方式、性幻想、特殊癖好、接受度等' },
  sexualDetails: { label: '性爱明细', type: 'array', prompt: '性爱明细：字符串数组，每个元素以序号开头，如 "1. 时间事件描述"、"2. 时间事件描述"，编号顺延（1. 2. 3. ...不限于4条），每条详细描述内容充足、不能一句话带过；以时间顺序排列，作为角色的性爱百科' },
  aliases: { label: '别名', type: 'array', prompt: '别名（昵称/称号/代称），无则空数组[]' },
};

// ===== 派生数组（供下游复用） =====

// 全部字段名（保存/加载/审查/结果拷贝）
var 小说提取字段名 = Object.keys(小说提取字段);

// 提取/描述使用的字段顺序（与历史模板一致，aliases 紧跟 name）
var 小说提取字段序 = ['name','aliases','gender','role','brief','title','age','race','occupation','appearance','personality','aura','background','lifeStory','storyRole','relationships','attireStyle','speechManner','catchphrases','bedroomTalk','sexCharacteristics','sexualSkill','sexualPreferences','sexualDetails'];

// 正文段字段（不含 name/gender/role/brief 的 19 项：title/age/.../aliases，用于保存/加载/拷贝）
var 小说提取正文段字段 = 小说提取字段名.filter(function(f) { return f !== 'name' && f !== 'gender' && f !== 'role' && f !== 'brief'; });

// 审查字段（name/gender/role/brief + 正文段字段，23 项，用于审查序列化）
var 小说提取审查字段 = ['name', 'gender', 'role', 'brief'].concat(小说提取正文段字段);

// 文本字段（合并时取较长值）
var 小说提取文本字段 = 小说提取字段名.filter(function(f) { return 小说提取字段[f].type === 'text'; });

// 数组字段（合并时去重、展示时顿号连接、保存描述按行拆分）
var 小说提取数组字段 = 小说提取字段名.filter(function(f) { return 小说提取字段[f].type === 'array'; });

// 阶段卡字段（从字段序派生：不含 name/aliases/gender/role，brief 在末尾，与历史 stageFieldList 一致）
var 小说提取阶段字段 = 小说提取字段序.slice(5).concat(['brief']);

// ===== 字段 Schema 生成（供 LLM prompt 注入） =====
// 生成 JSON 对象的字段片段，fields 为字段名数组，indent 为缩进前缀
function 小说提取字段Schema(fields, indent) {
  indent = indent || '\n    ';
  return fields.map(function(f) {
    var d = 小说提取字段[f];
    if (!d) return '';
    var key = d.type === 'array' ? JSON.stringify([d.prompt]) : '"' + d.prompt + '"';
    return indent + '"' + f + '":' + key;
  }).join(',');
}

// ===== 暴露到全局 =====
window.小说提取字段 = 小说提取字段;
window.小说提取字段名 = 小说提取字段名;
window.小说提取字段序 = 小说提取字段序;
window.小说提取正文段字段 = 小说提取正文段字段;
window.小说提取审查字段 = 小说提取审查字段;
window.小说提取文本字段 = 小说提取文本字段;
window.小说提取数组字段 = 小说提取数组字段;
window.小说提取阶段字段 = 小说提取阶段字段;
window.小说提取字段Schema = 小说提取字段Schema;
