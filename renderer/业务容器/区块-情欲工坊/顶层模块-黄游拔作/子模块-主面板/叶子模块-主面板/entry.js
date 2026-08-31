// 情欲工坊 · 黄游拔作（黄游图鉴 · 大全书）

// ===== 游戏分类配置（第一层导航） =====
// sections 为该分类的「图鉴词条版块」——点进游戏后详情页按这些版块展示生成内容
var 黄游游戏分类 = {
  galgame: { label: '美少女恋爱游戏', icon: '💗', desc: '以文字+立绘+CG+配音为核心的黄油大类，分支选项推进剧情，拔作的主战场。实用度（H场景密度/CG数/回想容量）是第一卖点，剧情服务于发情。每部作品围绕一条或多条可攻略女主角路线展开。', sections: ['基本信息', '故事简介', '登场角色', '剧情线路', 'H场景·拔点', '画面·音声·CG', '综合评价'], styleDesc: '' },
  rpg:     { label: 'RPG 角色扮演', icon: '⚔️', desc: '以角色扮演推进的黄油，战斗、迷宫、等级、技能与情色内容深度绑定。战斗 H、败北 H、处女膜等级、淫乱度为常见系统。探索与性体验交替进行，职业设定天然自带丰富的性癖框架（魔法师、盗贼、圣骑士）。', sections: ['基本信息', '世界舞台', '战斗系统', '职业·技能', '登场角色', 'H场景·拔点', '结局·收集', '综合评价'], styleDesc: '' },
  slg:     { label: 'SLG 策略调教', icon: '🏰', desc: '策略/经营/调教类黄油，题材很广。一端是「大战略征伐」——像《兰斯（Rance）》《英雄战姬》那样在世界地图上行军、回合制战斗、征服占领、捕获并养成敌方女角色；另一端是「经营调教」——娼馆、女仆、学园等，靠好感度/淫乱度/调教值等数值系统逐步改造目标。玩家的决策驱动剧情与性的走向，大战略的统治与调教、经营的数据与管理是本类的两根主线。', sections: ['基本信息', '世界舞台', '战略系统', '调教系统', '登场角色·单位', '剧情·事件', 'H场景·拔点', '结局·收集', '制作·评价'], styleDesc: '' },
  fmv:     { label: '互动影游', icon: '🎥', desc: '真人演出 + 选择互动的电影式黄油。玩家以第一人称在真实影像里做选择，好感度/剧情走向/结局随选择而分叉。题材按「故事场景」分——都市恋爱、古装宫斗、悬疑推理、恐怖惊悚、职场暧昧、奇幻穿越等。代入感强、画面真实、临场感是最大卖点。', sections: ['基本信息', '剧情大纲', '登场角色', '选择·分支', 'H场景·拔点', '画面·音声', '综合评价'], styleDesc: '' },
  card:    { label: '卡牌游戏', icon: '🃏', desc: '卡牌收集 / 抽卡 / 养成 / 对战型黄油。把女主角做成卡牌，通过抽卡获取、养成升级、组建队伍。收集度和角色养成是核心卖点，稀有度与 H 场景解锁绑定，抽到稀有卡解锁专属调教剧情。', sections: ['基本信息', '卡牌系统', '登场角色·卡牌', 'H场景·拔点', '收集·图鉴', '综合评价'], styleDesc: '' },
};
var 黄游游戏分类键 = Object.keys(黄游游戏分类);

// ===== 兜底版块（分类未定义 sections 时用） =====
var 黄游图鉴版块 = ['基本信息', '故事简介', '登场角色', '游戏系统', '拔点·实用度', '画面·音声·CG', '综合评价'];

// ===== 子类型配置（第二层细分） =====
var 黄游Galgame子类型 = {
  纯爱:   { label: '纯爱', icon: '💕', styleDesc: '以纯粹爱情为主线，情感铺垫细腻，H场景服务于感情升温。甜甜的恋爱中融入露骨情色，适合初学者和喜欢情感代入的玩家。' },
  NTR:    { label: 'NTR', icon: '💔', styleDesc: '伴侣被夺走的题材，重点刻画被背叛者的心理痛苦与被抢夺者身体屈服的反差，肉体欢愉与精神痛苦强烈对比。' },
  凌辱:   { label: '凌辱', icon: '⛓️', styleDesc: '强制凌辱题材，从抵抗到崩溃到屈服的精神过程，伴随暴力、束缚和心理摧残，重点刻画受害者彻底坏掉的状态变化。' },
  触手:   { label: '触手', icon: '🐙', styleDesc: '触手不受人体限制，可同时刺激所有敏感部位。体液、黏液、被触手缠绕勒紧的肉体是核心情色元素。' },
  催眠:   { label: '催眠', icon: '🌀', styleDesc: '通过催眠术操控他人进行性行为——被暗示、记忆改造、清醒时不知道自己做了什么。关键词即发情，充满操纵与被操纵的禁忌快感。' },
  后宫:   { label: '后宫', icon: '👑', styleDesc: '一个男主被多位女性围绕，每一条女角色线独立展开，修罗场与性竞争并存，群交场景是高潮看点。' },
  调教:   { label: '调教', icon: '🔗', styleDesc: '从肉体到精神的完整调教流程——规则制定、惩罚实施、奖励给予、门槛逐步提高，最终使其完全服从。' },
  露出:   { label: '露出', icon: '👀', styleDesc: '在公共场合进行性行为、或在危险边缘试探，被看见的危险和被发现的羞耻是核心快感来源。' },
  时间停止: { label: '时间停止', icon: '⏸️', styleDesc: '停止时间后对静止世界为所欲为，玩弄静止女人的每一寸身体而对方毫不知情，恢复时间后毫无察觉的反差是核心趣味。' },
  家族:   { label: '家族', icon: '👨‍👩‍👧‍👦', styleDesc: '家族乱伦题材，从日常的暧昧肢体接触开始，渐渐跨越界线，最后沉沦在背德的关系中无法自拔。' },
  学园:   { label: '学园', icon: '🏫', styleDesc: '以校园为舞台，制服、体操服、泳装是核心服饰元素。教室补课、更衣室偷拍、体育仓库强要等学园场景。' },
  异世界: { label: '异世界', icon: '🌌', styleDesc: '转生/穿越到魔法世界，在冒险中遭遇各种种族的情色事件——精灵祭典、兽人部落、魔王城淫靡陷阱。' },
};
var 黄游Rpg子类型 = {
  迷宫探索: { label: '迷宫探索', icon: '⛏️', styleDesc: '深入迷宫探索，遭遇各种陷阱与怪物，战斗与情色结合。败北后被怪物捕获调教、在迷宫深处发现隐藏的淫窟。' },
  战斗H:   { label: '战斗H', icon: '⚔️', styleDesc: '战斗过程本身就是情色——技能以性结合的形式释放，击败敌人后对其身体为所欲为。' },
  败北H:   { label: '败北H', icon: '💦', styleDesc: '战败类 RPG 的核心——主角（多为女勇者/女骑士）战败后被敌人俘虏调教，从抵抗到屈服。' },
  冒险者公会: { label: '冒险者公会', icon: '🛡️', styleDesc: '以冒险者公会为中心，接任务、组队、完成任务中遭遇各种情色事件，公会内的关系网是核心。' },
};
var 黄游Slg子类型 = {
  调教养成: { label: '调教养成', icon: '🔗', styleDesc: '通过数值系统逐步调教目标——好感度、淫乱度、调教值，每一次调教选项影响角色走向，最终达成完全服从。' },
  娼馆经营: { label: '娼馆经营', icon: '🏮', styleDesc: '经营一家娼馆——招募女郎、培训调教、接待客人、管理营业，在经营中解锁各种情色事件。' },
  女仆咖啡厅: { label: '女仆咖啡厅', icon: '☕', styleDesc: '以女仆咖啡厅为舞台的经营调教，服务客人的过程中逐步深入情色，把女仆训练成完美而顺从的员工。' },
  学园经营: { label: '学园经营', icon: '🏫', styleDesc: '经营一所淫乱学园，管理学生、培养关系、安排课程，在校园经营中展开各种情色故事。' },
  大战略征伐: { label: '大战略征伐', icon: '🗺️', styleDesc: '像《兰斯（Rance）/鬼畜王兰斯》那样的大战略黄油——世界地图攻略、回合制行军战斗、区域占领与统治，征服同时调教捕获的敌方女角色。' },
  英灵征伐: { label: '英灵征伐', icon: '🏛️', styleDesc: '像《英雄战姬》那样收集历史/神话英灵作部将，协同征战并养成好感，战败捕获调教敌方女武将。' },
};
var 黄游Fmv子类型 = {
  都市恋爱: { label: '都市恋爱', icon: '💘', styleDesc: '现代都市真人恋爱互动影游，多女主好感度驱动，选择决定攻略谁、走哪条线。如《完蛋！我被美女包围了》。' },
  古装宫斗: { label: '古装宫斗', icon: '👑', styleDesc: '古代帝王/宫闱真人互动，选妃、权谋与情色交织，在后宫与朝堂之间步步为营。' },
  悬疑推理: { label: '悬疑推理', icon: '🔍', styleDesc: '真人探案/密室互动，解谜破案过程中逐步展开情色线，真相与欲望交织。' },
  恐怖惊悚: { label: '恐怖惊悚', icon: '👻', styleDesc: '在恐怖/惊悚场景中做求生选择，恐惧与情色结合，越危险越刺激。' },
  职场暧昧: { label: '职场暧昧', icon: '💼', styleDesc: '都市/职场生活中的真人暧昧互动，同事、上司、客户之间的选择与关系推进。' },
  奇幻穿越: { label: '奇幻穿越', icon: '🌀', styleDesc: '穿越古代/异世界的真人互动，奇幻设定下的身份与情色选择。' },
};
var 黄游Card子类型 = {
  抽卡收集: { label: '抽卡收集', icon: '🎰', styleDesc: '以抽卡为核心玩法，稀有度决定角色品质，抽到稀有卡解锁专属 H 场景，收集度驱动。' },
  卡牌养成: { label: '卡牌养成', icon: '📈', styleDesc: '通过养成卡牌提升能力——升级、突破、好感度培养，养成过程穿插情色事件。' },
  卡牌对战: { label: '卡牌对战', icon: '⚔️', styleDesc: '以卡牌对战为核心的黄油，战斗规则与情色机制结合，获胜/战败触发不同的 H 场景。' },
};

function 黄游获取子类型配置(cat) {
  if (cat === 'galgame') return 黄游Galgame子类型;
  if (cat === 'rpg') return 黄游Rpg子类型;
  if (cat === 'slg') return 黄游Slg子类型;
  if (cat === 'fmv') return 黄游Fmv子类型;
  if (cat === 'card') return 黄游Card子类型;
  return null;
}
function 黄游获取子类型详情(cat, subtype) {
  var cfg = 黄游获取子类型配置(cat);
  if (cfg && subtype && cfg[subtype]) return cfg[subtype];
  var top = 黄游游戏分类[cat];
  return { styleDesc: top ? (top.styleDesc || '') : '' };
}
function 黄游获取词条配置(type, subtype) {
  var sub = 黄游获取子类型详情(type, subtype);
  var top = 黄游游戏分类[type] || {};
  return {
    label: ((sub && sub.label) || top.label || ''),
    icon: ((sub && sub.icon) || top.icon || ''),
    sections: (top && top.sections) || 黄游图鉴版块,
    styleDesc: (sub && sub.styleDesc) || top.styleDesc || ''
  };
}

// ===== 来源映射：全部游戏分类都归「开发者」 =====
var 黄游来源名称映射 = { galgame: '开发者', rpg: '开发者', slg: '开发者', fmv: '开发者', card: '开发者' };

// ===== 共享状态 =====
var 黄游当前分类 = 'galgame';
var 黄游当前标签 = 'list';
var 黄游当前游戏 = null; // { name, info }
var 黄游子标签 = [
  { id: 'list', label: '📋 列表' },
  { id: 'plan', label: '📝 规划' },
  { id: 'write', label: '✍️ 写作台' },
];
var 黄游Api = null;

// ===== 存储 API =====
var 黄游根路径 = '黄游拔作/';
var 黄游文件夹 = { galgame: 'galgame', rpg: 'rpg', slg: 'slg', fmv: 'fmv', card: 'card' };

function 黄游分类目录(cat) { return 黄游根路径 + 黄游文件夹[cat] + '/'; }
function 黄游游戏目录(cat, 游戏名) { return 黄游分类目录(cat) + LocalFS.sanitize(游戏名) + '/'; }
function 黄游版块文件(sectionName) { return LocalFS.sanitize(sectionName) + '.json'; }

// 游戏 CRUD
function 黄游保存游戏(cat, 游戏名, data) { return LocalFS.saveJSON(黄游游戏目录(cat, 游戏名) + 'info.json', data); }
function 黄游加载游戏(cat, 游戏名) { return LocalFS.readJSON(黄游游戏目录(cat, 游戏名) + 'info.json'); }
function 黄游删除游戏(cat, 游戏名) { return LocalFS.delete(黄游游戏目录(cat, 游戏名)); }

// 游戏「内容详情」（关卡/章节/线路等，可按类型增删条目）
function 黄游内容文件(cat, 游戏名, f) {
  var cur = window.黄游当前游戏;
  if (cur && cur.isDLC && cur.name === 游戏名) return 黄游DLC目录(cat, cur.dlcOf, 游戏名) + f;
  return 黄游游戏目录(cat, 游戏名) + f;
}
function 黄游保存游戏内容(cat, 游戏名, data) { return LocalFS.saveJSON(黄游内容文件(cat, 游戏名, '内容.json'), data); }
function 黄游加载游戏内容(cat, 游戏名) { return LocalFS.readJSON(黄游内容文件(cat, 游戏名, '内容.json')).then(function(d) { return d || {}; }).catch(function() { return {}; }); }

function 黄游列出游戏(cat) {
  return LocalFS.list(黄游分类目录(cat)).then(function(entries) {
    if (!entries || !entries.length) return [];
    var dirs = entries.filter(function(e) { return e.isDir; });
    return Promise.all(dirs.map(function(d) {
      return LocalFS.readJSON(黄游分类目录(cat) + d.name + '/info.json').then(function(info) {
        if (!info) return null;
        info._dir = d.name;
        return info;
      });
    })).then(function(items) { return items.filter(Boolean); });
  }).catch(function() { return []; });
}

// 词条版块：直接存游戏下
function 黄游保存版块(cat, 游戏名, sectionName, data) { return LocalFS.saveJSON(黄游游戏目录(cat, 游戏名) + 黄游版块文件(sectionName), data); }
function 黄游加载版块(cat, 游戏名, sectionName) { return LocalFS.readJSON(黄游游戏目录(cat, 游戏名) + 黄游版块文件(sectionName)); }

// 评价
function 黄游加载评价(cat, 游戏名) {
  return LocalFS.readJSON(黄游游戏目录(cat, 游戏名) + '评价.json').then(function(d) { return (d && d.list) || []; }).catch(function() { return []; });
}
function 黄游保存评价(cat, 游戏名, list) { return LocalFS.saveJSON(黄游游戏目录(cat, 游戏名) + '评价.json', { list: list || [] }); }

// ===== 售卖版本（原版/豪华版/完整版）配置 =====
// info.versions 形如：[{label:'原版',price:'HK$ 68'},{label:'豪华版',price:'HK$ 118'},{label:'完整版',price:'HK$ 168'}]
// 若无则按 base price 推导出三档不同定价
function 黄游推导版本(info) {
  if (info.versions && info.versions.length) return info.versions;
  var base = parseFloat(String(info.price || '').replace(/[^\d.]/g, '')) || 68;
  var cur = String(info.price || '').match(/[^\d.]/) ? String(info.price || '').replace(/[\d.,]/g, '') : '¥ ';
  function fmt(n) { return cur + n.toFixed(0); }
  return [
    { label: '原版', price: fmt(base) },
    { label: '豪华版', price: fmt(Math.round(base * 1.6)) },
    { label: '完整版', price: fmt(Math.round(base * 2.4)) }
  ];
}

// ===== DLC（可下载内容）存储 API —— 每个 DLC 是游戏目录下的子目录 =====
function 黄游DLC根目录(cat, 游戏名) { return 黄游游戏目录(cat, 游戏名) + 'dlc/'; }
function 黄游DLC目录(cat, 游戏名, dlc名) { return 黄游DLC根目录(cat, 游戏名) + LocalFS.sanitize(dlc名) + '/'; }
function 黄游保存DLC(cat, 游戏名, dlc名, data) { return LocalFS.saveJSON(黄游DLC目录(cat, 游戏名, dlc名) + 'info.json', data); }
function 黄游加载DLC(cat, 游戏名, dlc名) { return LocalFS.readJSON(黄游DLC目录(cat, 游戏名, dlc名) + 'info.json'); }
function 黄游删除DLC(cat, 游戏名, dlc名) { return LocalFS.delete(黄游DLC目录(cat, 游戏名, dlc名)); }
function 黄游列出DLC(cat, 游戏名) {
  return LocalFS.list(黄游DLC根目录(cat, 游戏名)).then(function(files) {
    var dirs = (files || []).filter(function(f) { return f.isDir; });
    return Promise.all(dirs.map(function(d) {
      return LocalFS.readJSON(黄游DLC目录(cat, 游戏名, d.name) + 'info.json').then(function(info) { if (!info) return null; info._dir = d.name; return info; });
    })).then(function(items) { return items.filter(Boolean).sort(function(a, b) { return (a.createdAt || 0) - (b.createdAt || 0); }); });
  }).catch(function() { return []; });
}
function 黄游保存DLC版块(cat, 游戏名, dlc名, sectionName, data) { return LocalFS.saveJSON(黄游DLC目录(cat, 游戏名, dlc名) + LocalFS.sanitize(sectionName) + '.json', data); }
function 黄游加载DLC版块(cat, 游戏名, dlc名, sectionName) { return LocalFS.readJSON(黄游DLC目录(cat, 游戏名, dlc名) + LocalFS.sanitize(sectionName) + '.json'); }
function 黄游保存DLC评价(cat, 游戏名, dlc名, list) { return LocalFS.saveJSON(黄游DLC目录(cat, 游戏名, dlc名) + '评价.json', { list: list || [] }); }
function 黄游加载DLC评价(cat, 游戏名, dlc名) { return LocalFS.readJSON(黄游DLC目录(cat, 游戏名, dlc名) + '评价.json').then(function(d) { return (d && d.list) || []; }).catch(function() { return []; }); }

// ===== 社区区（讨论区 / 指南 / 创意工坊）存储 API =====
// 每个游戏下存 讨论.json / 指南.json / 创意工坊.json，结构为 { list: [ ... ] }
function 黄游区文件(cat, 游戏名, 区名) { return 黄游游戏目录(cat, 游戏名) + LocalFS.sanitize(区名) + '.json'; }
function 黄游读区(cat, 游戏名, 区名) { return LocalFS.readJSON(黄游区文件(cat, 游戏名, 区名)).then(function(d) { return d || { list: [] }; }).catch(function() { return { list: [] }; }); }
function 黄游写区(cat, 游戏名, 区名, data) { return LocalFS.saveJSON(黄游区文件(cat, 游戏名, 区名), data || { list: [] }); }

// ===== 来源存储 API（开发者：共享一套 roster） =====
function 黄游开发者目录() { return 黄游根路径 + '开发者/'; }
function 黄游保存开发者(source) {
  var name = LocalFS.sanitize(source.name || '未命名') + '.json';
  return LocalFS.saveJSON(黄游开发者目录() + name, source);
}
function 黄游删除开发者文件(source) {
  var name = LocalFS.sanitize(source.name || '未命名') + '.json';
  return LocalFS.delete(黄游开发者目录() + name);
}
function 黄游加载开发者() {
  return LocalFS.list(黄游开发者目录()).then(function(files) {
    if (!files || !files.length) return [];
    var jsonFiles = files.filter(function(f) { return f.name.endsWith('.json'); });
    return Promise.all(jsonFiles.map(function(f) {
      return LocalFS.readJSON(黄游开发者目录() + f.name);
    })).then(function(items) { return items.filter(Boolean); });
  }).catch(function() { return []; });
}

// ===== 提示词注册（二元模板） =====
registerPrompt('hybz_program_name', {
  system: '',
  user: '你是一个黄油图鉴专家。根据以下游戏完整信息生成{count}个合适的游戏名称。JSON输出：{"options":["名称1","名称2"]}。{wordLimit}{direction}\n\n{context}\n\n基于以上全部信息，生成合适的黄油名称选项（要够拔、够直白，贴合题材）。',
});
registerPrompt('hybz_program_focus', {
  system: '',
  user: '你是一个黄油图鉴专家。根据以下游戏完整信息生成{count}个合适的游戏定位/主打卖点。JSON输出：{"options":["卖点1","卖点2"]}。{wordLimit}{direction}\n\n{context}\n\n基于以上全部信息，生成合适的黄油定位和主打方向选项。',
});
registerPrompt('hybz_program_desc', {
  system: '',
  user: '你是一个黄油图鉴专家。根据游戏所有信息撰写游戏简介，聚焦于游戏的内容题材、核心卖点和拔点。\n\n{context}\n\n请为这个游戏撰写一段简介，说明它是什么内容、主打什么题材、核心拔点是什么、适合哪类玩家。直接输出简介正文，不要标题。',
});
registerPrompt('hybz_dlc_gen', {
  system: '',
  user: '你是黄油图鉴销售策划专家。为下面这款黄油设计若干贴合题材的可下载内容（DLC）。DLC 是游戏的扩展包/外传/追加内容，要各自有独立主题与卖点。\n\n{context}\n\n输出严格 JSON 格式：{"list":[{"name":"DLC名","price":"¥ 30","focus":"DLC 定位一句话","description":"DLC 简介"}]}。\n- name：DLC 名，贴合游戏题材（如「××× 外传」\u3001「××× 扩展包」等）\n- price：DLC 定价，以人民币 ¥ 为单位，必须低于本体且各不相同\n- focus：一句话卖点\n- description：DLC 简介，紧扣本作题材与内容\n- DLC 内容须与本作定位/题材逻辑自洽（如 NTR 游戏的 DLC 也应延续其婚姻/介入关系设定），不得跑题\n数量自行把握（可 1 至多个），金额不得照搬示例',
});

// ===== 首页渲染 =====
function 渲染黄游页(el) {
  var items = 黄游游戏分类键.map(function(cat) { var m = 黄游游戏分类[cat]; return { id: cat, label: m.icon + ' ' + m.label }; });
  items.push({ id: '开发者', label: '👨‍💻 开发者' });
  if (!黄游Api) {
    黄游Api = 渲染标签栏(el, items, { active: 黄游当前分类, subId: 'yySubContent', onSwitch: function(cat) { 黄游切换分类(cat); } });
  } else {
    黄游Api.setActive(黄游当前分类);
  }
  黄游渲染内容();
}

function 黄游切换分类(cat) {
  黄游当前分类 = cat;
  黄游当前标签 = 'list';
  黄游渲染内容();
}

// 渲染当前分类的次级分段 + 视图容器
function 黄游渲染内容() {
  var sub = 黄游Api ? 黄游Api.sub : null;
  if (!sub) return;
  if (!黄游当前分类) {
    sub.innerHTML = '<div class="placeholder-text" style="padding:40px;text-align:center">选择上方游戏分类开始编辑</div>';
    return;
  }
  if (黄游当前分类 === '开发者') {
    sub.innerHTML = '<div id="yyContentView"></div>';
    黄游渲染开发者(document.getElementById('yyContentView'));
    return;
  }
  var h = '<div class="tl-subnav">';
  黄游子标签.forEach(function(t) {
    h += '<div class="tl-subitem' + (t.id === 黄游当前标签 ? ' act' : '') + '" data-tab="' + t.id + '">' + t.label + '</div>';
  });
  h += '</div><div id="yyContentView"></div>';
  sub.innerHTML = h;
  sub.querySelectorAll('.tl-subitem[data-tab]').forEach(function(i) {
    i.addEventListener('click', function() { 黄游切换标签(this.getAttribute('data-tab')); });
  });
  黄游切换标签(黄游当前标签);
}

window.黄游选择分类 = function(cat) {
  黄游当前分类 = cat;
  黄游当前标签 = 'list';
  var el = document.getElementById('gamesContent');
  if (el) 渲染黄游页(el);
};

function 黄游切换标签(tab) {
  黄游当前标签 = tab;
  var el = document.getElementById('yyContentView');
  if (!el) return;
  var navs = document.querySelectorAll('#gamesContent .tl-subitem');
  navs.forEach(function(n) { n.classList.toggle('act', n.getAttribute('data-tab') === tab); });
  if (tab === 'list')   { 黄游渲染列表(el); }
  else if (tab === 'plan')   { 黄游渲染规划(el); }
  else if (tab === '开发者')   { 黄游渲染开发者(el); }
  else if (tab === 'write')  { 黄游渲染写作台(el); }
}

window.黄游返回首页 = function() {
  黄游当前分类 = '';
  黄游当前标签 = 'list';
  var el = document.getElementById('gamesContent');
  if (el) 渲染黄游页(el);
};

// ===== 路由注册 =====
registerPageRoute('games', function() {
  var el = document.getElementById('gamesContent');
  if (!el) return;
  渲染黄游页(el);
});

// ===== 暴露全局 =====
window.黄游游戏分类 = 黄游游戏分类;
window.黄游游戏分类键 = 黄游游戏分类键;
window.黄游Galgame子类型 = 黄游Galgame子类型;
window.黄游Rpg子类型 = 黄游Rpg子类型;
window.黄游Slg子类型 = 黄游Slg子类型;
window.黄游Fmv子类型 = 黄游Fmv子类型;
window.黄游Card子类型 = 黄游Card子类型;
window.黄游获取子类型配置 = 黄游获取子类型配置;
window.黄游获取子类型详情 = 黄游获取子类型详情;
window.黄游获取词条配置 = 黄游获取词条配置;
window.黄游来源名称映射 = 黄游来源名称映射;
window.黄游列出游戏 = 黄游列出游戏;
window.黄游保存游戏 = 黄游保存游戏;
window.黄游加载游戏 = 黄游加载游戏;
window.黄游保存游戏内容 = 黄游保存游戏内容;
window.黄游加载游戏内容 = 黄游加载游戏内容;
window.黄游删除游戏 = 黄游删除游戏;
window.黄游保存版块 = 黄游保存版块;
window.黄游加载版块 = 黄游加载版块;
window.黄游保存评价 = 黄游保存评价;
window.黄游加载评价 = 黄游加载评价;
window.黄游推导版本 = 黄游推导版本;
window.黄游保存DLC = 黄游保存DLC;
window.黄游加载DLC = 黄游加载DLC;
window.黄游删除DLC = 黄游删除DLC;
window.黄游列出DLC = 黄游列出DLC;
window.黄游保存DLC版块 = 黄游保存DLC版块;
window.黄游加载DLC版块 = 黄游加载DLC版块;
window.黄游保存DLC评价 = 黄游保存DLC评价;
window.黄游加载DLC评价 = 黄游加载DLC评价;
window.黄游读区 = 黄游读区;
window.黄游写区 = 黄游写区;
window.黄游保存开发者 = 黄游保存开发者;
window.黄游加载开发者 = 黄游加载开发者;
window.黄游删除开发者文件 = 黄游删除开发者文件;
window.黄游当前分类 = 黄游当前分类;
window.黄游当前游戏 = 黄游当前游戏;
window.渲染黄游页 = 渲染黄游页;
