// 情欲工坊 · 黄图淫册

// ===== 载体配置（第一层导航） =====
var 图册载体 = {
  chatu:  { label: '插画', icon: '🎨', desc: '单张精美情色插画，以一幅完整构图定格一个色情瞬间。', sections: ['画面描述'] },
  manhua: { label: '漫画', icon: '📖', desc: '分格连载的情色漫画，用连续的画面格子讲述完整故事。连载作品按「话/期」组织，每期从封面到末页，一页一页、一格格地讲述画面与台词。', sections: ['分页'] },
  sheding:{ label: '设定集', icon: '🗂️', desc: '角色、服装、场景、道具的设定图册，为创作提供完整的世界观与视觉设定，是其它图画载体的素材库。', sections: ['封面','角色设定','服装设定','场景设定','道具设定','世界观设定'] },
  xiezhen:{ label: '写真集', icon: '📸', desc: '情色写真集，以一系列写真的构图与场景呈现人体之美，重在姿态、光影与暧昧氛围。', sections: ['封面','单张写真','场景','文案','封底'] },
};
var 图册载体键 = Object.keys(图册载体);

// 单张/独立载体：一张图即一个作品，无「期号」层级；不在列表里出现「新期号」
var 图册单张载体 = { chatu: true };
function 图册是否单张(mk) { return !!(图册单张载体[mk]); }

// 分页载体：连载作品（漫画）按「页→格」组织每一期内容，而不是按剧情阶段板块
var 图册分页载体 = { manhua: true };
function 图册是否分页(mk) { return !!(图册分页载体[mk]); }

// ===== 漫画类型配置 =====
var 漫画类型配置 = {
  romance: { label: '纯爱', icon: '💕', styleDesc: '以纯粹爱情为主线的情色漫画，情感与肉体关系交织共鸣。叙事上先有怦然心动、暧昧试探、确认心意，再一步步走向更亲密的身体接触，情色场面始终服务于情感的递进。分镜善于用留白、眼神交会、近景特写与心跳般的节奏来累积情绪，强调双方互相的珍视、渴望与羞怯。氛围温暖、黏腻，带少年感的青涩或成熟恋人的缱绻；情色部分追求被爱着的安心感与想占有对方的冲动的平衡，而非粗暴征服。常见场景：相遇、告白、初夜、同居日常、旅行独处、多年后重逢。' },
  ntr:     { label: 'NTR', icon: '💔', styleDesc: '以「被夺走」为核心的情色漫画，重点刻画被夺走伴侣一方的心理痛苦与被征服者身体屈服之间的强烈反差。情感内核是嫉妒、无力、屈辱与不甘。画面擅长对比：一边是伴侣在他人怀中遭侵犯的淫靡画面，一边是被夺走者躲在一旁目睹时扭曲的表情、攥紧的拳头与无声的崩溃。分镜多采用旁观视角，让读者与被夺走者一同目睹、一同心痛。情色场面常伴随「被迫接受」与「主动沉沦」的交替，强调精神与肉体双重的被击溃。常见设定：男友被夺、妻子被上司欺辱、青梅被混混占有、主角在门外/电话里/偷看中被逼到崩溃。核心张力在于「爱」被暴力地拆解与扭曲。' },
  tentacle:{ label: '触手', icon: '🐙', styleDesc: '以触手为核心元素的情色漫画。触手作为有生命力的异物，能同时刺激全身所有敏感部位，带来超越人体的感官冲击。画面强调黏滑的体液、蜿蜒缠绕的触手、被紧缚与侵蚀的身体，以及角色在异物触碰下既抗拒又逐渐沉沦的表情。氛围重潮湿、混沌、窒息般的高明感，突出「无法反抗」的绝望与随之而来的强烈快感，以及被彻底控制、被洞穿的掌控。常带异种、异生物、神秘或科幻背景；触手形态多变，可缠绕、可插入、可探索每一寸肌肤，甚至侵入意识。' },
  school:  { label: '校园', icon: '🏫', styleDesc: '以校园为舞台的情色漫画，制服、教室、社团、体育课、游泳池等构成画面，青涩感与越界冲动并存。核心是「明亮青春外衣下的禁忌」。画面重制服（水手服、西装、白衬衫、体操服）的褶皱与半褪，以及课桌、保健室、天台、图书馆、空教室等私密与公共的对比，裙摆、白袜、便当、发圈等青春符号常被用来制造反差。情感带青涩、羞怯、试探与第一次的紧张；也可由坏学生、老师、前辈等制造越界。看点在于「清纯」与「情欲」在同一张脸上、同一个场景里的冲突与张力。' },
  fantasy: { label: '奇幻', icon: '🌌', styleDesc: '以奇幻世界为背景的情色漫画，魔法、异种族、王权冒险构成世界观，在旅途中遭遇各种情色事件。画面重异族与异世界元素：精灵、兽人、龙裔的肉体差异，魔法阵、结晶、异国都城的光景与服饰。剧情常围绕冒险途中的歇脚、被俘、契约、仪式展开，把奇幻设定用于制造情欲——催眠魔法、春药药剂、种族相性、神谕献祭、被诅咒的契约等都是常见的引子。氛围辽阔、神秘，浪漫与猎奇并存，强调「异质」带来的新鲜感与禁忌感，以及异世界法则对人伦的颠覆。' },
  horror:  { label: '猎奇', icon: '💀', styleDesc: '以猎奇、重口味为核心的情色漫画，画面冲击力强，追求禁忌与视觉刺激的极限。核心是「恐怖与性」的交织：濒死、扭曲、痛苦、异化、怪物与人体改造等元素与情欲相结合。画面重挑战感官极限的场景——束缚、钉制、兽交、血肉、黏液、改造、吞噬等，氛围压抑、病态、令人不安，靠强烈的不适感与快感之间的反差来刺激读者。情节常围绕异常环境、病态关系、心理或生理异变展开，强调「无法逃离的噩梦」与「痛苦中的快感」，以及理性被一点点剥落的过程。' },
};

// ===== 插画类型配置 =====
var 插画类型配置 = {
  portrait: { label: '单人立绘', icon: '🧍', styleDesc: '以单个角色为主题的情色插画，用一幅完整构图定格一个诱惑瞬间。突出角色的体态、神态与身体细节：站姿、坐姿、侧身、回眸的情态，以及眼神、嘴唇、潮红、吐息等细微表情。画面重心放在角色本身的魅力与性张力上，背景可简洁，意在让观者的注意力集中在角色身体曲线、肌肤质感与私密部位的刻画，营造「被她/他完全掌控视线」的凝视感。' },
  couple:   { label: '双人/群像', icon: '👥', styleDesc: '以两个或多个角色的情色互动为主题，表现交合、亲昵或群体场景的构图。重在角色之间的肢体交缠、体位关系与情感张力：谁的在上、谁在主导、眼神是否交汇、躯体如何贴合。画面需在构图上分清主次，让观者看懂彼此的关系与互动节奏；群像更强调连绵的肢体、错落的视点与欲念的流动，呈现一个充满张力的「关系网」。' },
  scene:    { label: '场景', icon: '🏞️', styleDesc: '以完整场景为背景的情色插画，环境与人物深度互动，氛围感强。场景（卧室、浴室、办公室、教室、地牢、野外、雨夜街头等）不只是背景，而是参与叙事：光线、材质、环境音、空间尺度都在烘托情欲。重在用环境营造暧昧与压迫，人物被置入特定空间里「无处遁形」或「被环境包围」的处境，整体是「人处在某处正在发生某事」的定格。' },
  symbol:   { label: '象征/隐喻', icon: '🌹', styleDesc: '用象征与隐喻表现情色，不直白露骨，靠暗示与意象来挑动想象力。画面常以物件、姿态、光影、意象代指欲望：融化的蜡烛、缠绕的藤蔓、湿润的花瓣、含露的果实、撕裂的衣料、交叠的阴影等。人物可以不直接暴露，靠半遮半掩、语焉不详的构图与氛围，引导观者自行补全那层暧昧。重在余韵与想象空间，是一种「欲语还休」的高级挑逗，适合追求意境与品味的内容。' },
  fetish:   { label: '性癖特写', icon: '🔍', styleDesc: '聚焦某个身体部位或性癖元素的特写插画，细节刻画极致。画面往往放大某个局部：拘束的项圈、缠着绑带的脚踝、滑落的肩带、湿润的私处、被揉捏的乳尖、渗着汁液的指缝等，用极近景、微距般的视角展现那些被日常遮蔽的私密细节。重点在于性感元素的极致呈现与感官放大，让观者被某一局部牢牢抓住；同时通过光影、材质与体液刻画，让特写充满肉感、湿润与张力。' },
};

// ===== 设定集类型配置 =====
var 设定集类型配置 = {
  character: { label: '角色设定', icon: '👤', styleDesc: '对角色外貌、体型、性格、背景与性癖的完整视觉与文字设定。画面需展示角色的正面/侧面/背面、身材比例、发型、表情、常用装扮与标志性特征；文字说明其性格、身份、经历与性癖倾向。重在让一个角色「立起来」：她/他是谁、什么性格、有什么身体与性方面的特点，作为后续创作与其它画面载体的依据，是整部作品的角色根基。' },
  costume:   { label: '服装设定', icon: '👗', styleDesc: '对角色服装、内衣、制服与性感情趣装扮的设定。展示衣物的款式、材质（丝绸、蕾丝、皮革、棉麻、PVC等）、配色、细节（绑带、蕾丝边、锁扣、吊带、开衩），以及穿着、半褪、全裸的层次关系。重点在制服/情趣装如何勾勒或暴露身体，如何在拉扯、紧绷、褶皱中呈现性感；同时说明场合（日常、放学后、夜间、演出等）与穿脱的层次，方便后续作画与其它载体引用。' },
  scene:     { label: '场景设定', icon: '🏛️', styleDesc: '对情色场景（卧室、教室、地牢、野外、办公室、浴室等）的环境与氛围设定。详细描绘空间布局、家具/道具摆设、材质与光源，说明这个空间如何烘托情色与暧昧（昏暗暖灯、凌乱床单、镜面、栏杆、地牢石墙、雨夜霓虹等）。重在给出一个可反复使用的「舞台」，让后续画面与剧情都能在该场景里自然发生，并传达该场地带来的安全感、压迫感或禁忌感。' },
  prop:      { label: '道具设定', icon: '🔧', styleDesc: '对情色道具（玩具、拘束具、器物、装置等）的设定与用法说明。展示道具的形态、材质、结构、用途与潜在的危险/趣味，说明它如何被用于调教、束缚、插入、刺激等；也包含日常器物被「性化」的用法（绳、夹、振动器、项圈、假阳具、榨取装置等）。重在把道具的形制与功用描述清楚，让后续画面使用时不失真、有质感，并让道具成为情节与画面的推动元素。' },
  world:     { label: '世界观设定', icon: '🌍', styleDesc: '对支撑情色内容的世界观、规则、种族与关系网络进行设定。构建一个自洽的背景：时代/世界设定（校园、奇幻、末世、贵族社会、异族领地等）、通行规则与禁忌、社会关系与权力结构、种族与体质差异、以及「性」在这个世界里的地位与方式。重在让情色内容有着落于一个可信的框架里，使角色、场景、道具、剧情都能相互印证，避免内容悬浮于真空；同时交代这个世界里最诱人、最允许发生的情色想象。' },
};

// ===== 写真集类型配置 =====
var 写真集类型配置 = {
  idol:    { label: '偶像写真', icon: '🌟', styleDesc: '偶像风格的情色写真，甜美或清纯外表下的暧昧挑逗。画面用打歌服、舞台妆、制服、发饰等偶像元素构建「台上清纯」的形象，再通过私下的凌乱、半褪、湿润、喘息等镜头制造反差——看似纯真的偶像，在镜头前渐渐卸下防备、展露身体。重笑容与眼神的层次、粉丝视角的迷恋感，以及「偶像」光环与她私下性感的对照，营造一种「只拍给你看」的亲密幻想。' },
  nude:    { label: '人体写真', icon: '🫧', styleDesc: '纯粹的人体写真，突出身体线条、光影与肌肤质感。无太多道具与穿着，把重点放在体态的起伏、肌理的细腻、光影在身体上的流转，以及皮肤的温度与光泽。摆姿多为舒展、蜷缩、侧卧、回眸等展现曲线与留白的姿态；画面重节奏与留白，用柔光或片状光塑造形体，追求艺术感与血肉之美的呈现，克制而有张力。' },
  cosplay: { label: '角色扮演', icon: '🎭', styleDesc: '角色扮演的情色写真，制服或幻想装扮下的角色演绎。以某个角色/职业/设定的装扮（女仆、护士、警察、猫娘、圣女、军装等）为壳，在「扮演」中逐步演绎性感的剧情：从入戏的扮相、招牌动作，到逐渐卸下装扮、越界亲密。重角色感与代入感，画面常带道具与场景来强化「扮演」的趣味，强调「她是她，也是这个角色」的游走与暧昧。' },
  boudoir: { label: '私房', icon: '🛏️', styleDesc: '私房情色写真，在卧室等私密空间里的慵懒暧昧。画面以床、沙发、帷幔、昏暖灯光、镜面、丝绒等营造私密与慵懒的氛围；人物多为半穿半裸、凌乱发丝、泛红肌肤、卧或斜倚的姿态，展现「在家毫无防备、只给你看」的亲近感。光线柔、室内、暖色调，追求肌肤的暖调与阴影的深邃，以及暧昧、慵懒、放松的性感，是一种私密而温存的居家情色。' },
  outdoor: { label: '户外', icon: '🏞️', styleDesc: '户外情色写真，在自然或公共空间里的禁忌与暴露。画面置于旷野、海边、森林、天台、街巷、路灯下等开放环境，用「随时可能被人看到」的紧张感制造禁忌与刺激。人物在自然光与广阔空间里半遮半露，或刻意将私密展露于公开，形成暴露与被窥视的双重快感；重光线（逆光、暮色、霓虹）、空间景深与冒险氛围，是「在众目睽睽下秘行」的美学。' }
};

function 图册获取子类型配置(mk) {
  if (mk === 'manhua') return 漫画类型配置;
  if (mk === 'chatu') return 插画类型配置;
  if (mk === 'sheding') return 设定集类型配置;
  if (mk === 'xiezhen') return 写真集类型配置;
  return null;
}
function 图册获取子类型详情(mk, subtype) {
  var cfg = 图册获取子类型配置(mk);
  if (cfg && subtype && cfg[subtype]) return cfg[subtype];
  var top = 图册载体[mk];
  return { sections: top ? top.sections : ['画面一','画面二','画面三'], styleDesc: top ? (top.styleDesc || '') : '' };
}
function 图册获取节目配置(type, subtype) {
  var sub = 图册获取子类型详情(type, subtype);
  var top = 图册载体[type] || {};
  return {
    label: ((sub && sub.label) || top.label || ''),
    icon: ((sub && sub.icon) || top.icon || ''),
    sections: (sub && sub.sections) || top.sections || ['画面一','画面二','画面三'],
    styleDesc: (sub && sub.styleDesc) || top.styleDesc || ''
  };
}

// 署名来源：图片类载体是「画师」，写真集是「摄影师」
var 图册来源名称映射 = { manhua:'画师', chatu:'画师', sheding:'画师', xiezhen:'摄影师' };
function 图册来源标题(mk) { return 图册来源名称映射[mk] || '画师'; }
function 图册来源标签(mk) { var n = 图册来源标题(mk); return n === '摄影师' ? '📸 摄影师' : '🎨 ' + n; }

// ===== 共享状态 =====
var 图册当前载体 = 'chatu';
var 图册当前标签 = 'list';
var 图册当前节目 = null; // { name, info }
var 图册当前期号 = null; // { dir, info }
var 图册Api = null;
var 图册子标签 = [
  { id: 'list', label: '📋 列表' },
  { id: 'plan', label: '📝 规划' },
  { id: '画师', label: '🎨 画师' },
  { id: 'write', label: '✍️ 写作台' },
];

// ===== 存储 API =====
var 图册根路径 = '黄图淫册/';
var 图册文件夹 = { manhua:'漫画', chatu:'插画', sheding:'设定集', xiezhen:'写真集' };

function 图册载体目录(mk) { return 图册根路径 + 图册文件夹[mk] + '/'; }
function 图册节目目录(mk, 节目名) { return 图册载体目录(mk) + LocalFS.sanitize(节目名) + '/'; }

// 节目 CRUD
function 图册保存节目(mk, 节目名, data) { return LocalFS.saveJSON(图册节目目录(mk, 节目名) + 'info.json', data); }
function 图册加载节目(mk, 节目名) { return LocalFS.readJSON(图册节目目录(mk, 节目名) + 'info.json'); }
function 图册删除节目(mk, 节目名) { return LocalFS.delete(图册节目目录(mk, 节目名)); }

function 图册列出节目(mk) {
  return LocalFS.list(图册载体目录(mk)).then(function(entries) {
    if (!entries || !entries.length) return [];
    var dirs = entries.filter(function(e) { return e.isDir; });
    return Promise.all(dirs.map(function(d) {
      return LocalFS.readJSON(图册载体目录(mk) + d.name + '/info.json').then(function(info) {
        if (!info) return null;
        info._dir = d.name;
        return info;
      });
    })).then(function(items) { return items.filter(Boolean); });
  }).catch(function() { return []; });
}

// 期号路径：节目名/第X期
function 图册期号目录(mk, 节目名, 期号) { return 图册节目目录(mk, 节目名) + '第' + 期号 + '期/'; }
function 图册期号路径(mk, 节目名, 期号) {
  var base = 图册文件夹[mk] + '/' + LocalFS.sanitize(节目名);
  if (图册是否单张(mk)) return base; // 单张载体：无「期号」层，直接挂在作品目录下
  return base + '/第' + 期号 + '期';
}

// 期号 CRUD
function 图册列出期号(mk, 节目名) {
  var dir = 图册节目目录(mk, 节目名);
  return LocalFS.list(dir).then(function(entries) {
    if (!entries || !entries.length) return [];
    var dirs = entries.filter(function(e) { return e.isDir && e.name.match(/^第\d+期/); });
    if (!dirs.length) return [];
    return Promise.all(dirs.map(function(d) {
      return LocalFS.readJSON(dir + d.name + '/info.json').then(function(info) {
        if (!info) return null;
        info._dir = d.name;
        return info;
      });
    })).then(function(items) { return items.filter(Boolean); });
  }).catch(function() { return []; });
}

function 图册保存期号(期号路径, info) { return LocalFS.saveJSON(图册根路径 + 期号路径 + '/info.json', info); }
function 图册加载期号(期号路径) { return LocalFS.readJSON(图册根路径 + 期号路径 + '/info.json'); }
function 图册保存版块(期号路径, sectionName, data) { return LocalFS.saveJSON(图册根路径 + 期号路径 + '/' + sectionName + '.json', data); }
function 图册加载版块(期号路径, sectionName) { return LocalFS.readJSON(图册根路径 + 期号路径 + '/' + sectionName + '.json'); }
function 图册删除期号(期号路径) { return LocalFS.delete(图册根路径 + 期号路径); }

// ===== 来源存储 API（画师每人一个文件） =====
function 图册来源目录(mk) {
  var sub = 图册来源名称映射[mk] || '画师';
  return 图册根路径 + 图册文件夹[mk] + '/' + sub + '/';
}
function 图册保存来源(mk, source) {
  var name = LocalFS.sanitize(source.name || '未命名') + '.json';
  return LocalFS.saveJSON(图册来源目录(mk) + name, source);
}
function 图册删除来源文件(mk, source) {
  var name = LocalFS.sanitize(source.name || '未命名') + '.json';
  return LocalFS.delete(图册来源目录(mk) + name);
}
function 图册加载来源(mk) {
  return LocalFS.list(图册来源目录(mk)).then(function(files) {
    if (!files || !files.length) return [];
    var jsonFiles = files.filter(function(f) { return f.name.endsWith('.json'); });
    return Promise.all(jsonFiles.map(function(f) {
      return LocalFS.readJSON(图册来源目录(mk) + f.name);
    })).then(function(items) { return items.filter(Boolean); });
  }).catch(function() { return []; });
}

// ===== 首页渲染 =====
function 渲染黄图淫册页(el) {
  var items = 图册载体键.map(function(mk) { var m = 图册载体[mk]; return { id: mk, label: m.icon + ' ' + m.label }; });
  if (!图册Api) {
    图册Api = 渲染标签栏(el, items, { active: 图册当前载体, subId: 'htSubContent', onSwitch: function(mk){ 图册切换类型(mk); } });
  } else {
    图册Api.setActive(图册当前载体);
  }
  渲染图册内容();
}

function 图册切换类型(mk) {
  图册当前载体 = mk;
  图册当前标签 = 'list';
  渲染图册内容();
}

// 渲染当前载体的次级分段 + 视图容器
function 渲染图册内容() {
  var sub = 图册Api ? 图册Api.sub : null;
  if (!sub) return;
  if (!图册当前载体) {
    sub.innerHTML = '<div class="placeholder-text" style="padding:40px;text-align:center">选择上方载体开始编辑</div>';
    return;
  }
  var h = '<div class="tl-subnav">';
  图册子标签.forEach(function(t) {
    if (t.id === 'write') return; // 内容已在规划里直接生成，无写作台
    var 标签 = (t.id === '画师') ? 图册来源标签(图册当前载体) : t.label;
    h += '<div class="tl-subitem' + (t.id === 图册当前标签 ? ' act' : '') + '" data-tab="' + t.id + '">' + 标签 + '</div>';
  });
  h += '</div><div id="htContentView"></div>';
  sub.innerHTML = h;
  sub.querySelectorAll('.tl-subitem[data-tab]').forEach(function(i) {
    i.addEventListener('click', function() { 图册切换标签(this.getAttribute('data-tab')); });
  });
  图册切换标签(图册当前标签);
}

window.图册选择载体 = function(mk) {
  图册当前载体 = mk;
  图册当前标签 = 'list';
  var el = document.getElementById('artsContent');
  if (el) 渲染黄图淫册页(el);
};

function 图册切换标签(tab) {
  // 单张载体（插画）没有「期号」，不保存期号信息，避免覆盖作品 info.json
  if (图册当前标签 === 'plan' && tab !== 'plan' && window.图册当前节目 && !图册是否单张(图册当前载体)) {
    if (图册自动保存计时器) clearTimeout(图册自动保存计时器);
    图册自动保存计时器 = null;
    var epInput = document.getElementById('htEpNumber');
    var hlEl = document.getElementById('htEpHeadline');
    var focusEl = document.getElementById('htEpFocus');
    var plotEl = document.getElementById('htEpPlot');
    if (epInput && hlEl && focusEl && plotEl) {
      var ep = parseInt(epInput.value) || 0;
      if (ep >= 1) {
        var mk = 图册当前载体;
        var 节目 = 图册当前节目;
        var srcNames = [], charNames = [];
        document.querySelectorAll('#htEpSources .tag-active').forEach(function(el) {
          srcNames.push(el.textContent.trim());
        });
        document.querySelectorAll('#htEpChars .tag-active').forEach(function(el) {
          charNames.push(el.textContent.trim());
        });
        var info = {
          episode: ep,
          headline: hlEl.value.trim() || '',
          epFocus: focusEl.value.trim() || '',
          plot: plotEl.value.trim() || '',
          refChars: charNames,
          refSourceNames: srcNames,
          createdAt: Date.now()
        };
        var 期号路径 = 图册期号路径(mk, 节目.name, ep);
        图册保存期号(期号路径, info);
      }
    }
  }
  图册当前标签 = tab;
  var el = document.getElementById('htContentView');
  if (!el) return;
  var navs = document.querySelectorAll('#artsContent .tl-subitem');
  navs.forEach(function(n) { n.classList.toggle('act', n.getAttribute('data-tab') === tab); });
  if (tab === 'list')     { 图册渲染列表(el); }
  else if (tab === 'plan')     { 图册渲染规划(el); }
  else if (tab === '画师')     { 图册渲染画师(el); }
  else if (tab === 'write')    { 图册渲染写作台(el); }
}

window.图册返回首页 = function() {
  图册当前载体 = '';
  图册当前标签 = 'list';
  var el = document.getElementById('artsContent');
  if (el) 渲染黄图淫册页(el);
};

// ===== 路由注册 =====
registerPageRoute('arts', function() {
  var el = document.getElementById('artsContent');
  if (el) 渲染黄图淫册页(el);
});

window.渲染黄图淫册页 = 渲染黄图淫册页;
window.图册载体 = 图册载体;
window.图册载体键 = 图册载体键;
window.图册单张载体 = 图册单张载体;
window.图册是否单张 = 图册是否单张;
window.图册分页载体 = 图册分页载体;
window.图册是否分页 = 图册是否分页;
window.漫画类型配置 = 漫画类型配置;
window.插画类型配置 = 插画类型配置;
window.设定集类型配置 = 设定集类型配置;
window.写真集类型配置 = 写真集类型配置;
window.图册获取子类型配置 = 图册获取子类型配置;
window.图册获取子类型详情 = 图册获取子类型详情;
window.图册获取节目配置 = 图册获取节目配置;
window.图册来源名称映射 = 图册来源名称映射;
window.图册来源标题 = 图册来源标题;
window.图册来源标签 = 图册来源标签;
window.图册列出节目 = 图册列出节目;
window.图册保存节目 = 图册保存节目;
window.图册加载节目 = 图册加载节目;
window.图册删除节目 = 图册删除节目;
window.图册列出期号 = 图册列出期号;
window.图册保存期号 = 图册保存期号;
window.图册加载期号 = 图册加载期号;
window.图册保存版块 = 图册保存版块;
window.图册加载版块 = 图册加载版块;
window.图册删除期号 = 图册删除期号;
window.图册期号路径 = 图册期号路径;
window.图册保存来源 = 图册保存来源;
window.图册加载来源 = 图册加载来源;
window.图册删除来源文件 = 图册删除来源文件;
window.图册当前载体 = 图册当前载体;
window.图册当前节目 = 图册当前节目;
window.图册当前期号 = 图册当前期号;
window.图册文件夹 = 图册文件夹;
