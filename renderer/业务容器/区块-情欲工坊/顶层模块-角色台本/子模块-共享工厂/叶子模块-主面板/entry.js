// 情欲工坊 · 角色台本 · 模块共享工厂
// 为 自述/诵读/经历/关系对话/辱骂/性辱骂 提供统一的 list/editor/AI 逻辑（以角色卡角色为核心，纯对白/独白生成）
// 创作界面与淫诗艳曲同构：作品信息 / 选题 / 角色素材 / AI 生成 四卡片式，无正文编辑区——AI 生成结果直接保存

// ===== 选题卡「主题」（台词类型/场景/方向/辱骂类型）释义表：选中哪项就把释义随参数段一起下发给 AI =====
var 角色台本主题解释表 = {
  // 🎙 自述主题
  '人生自述': '从头讲自己这一生——出身、遭遇、怎么一步步变成现在这样，是对着人（或镜头）讲的一整段自述',
  '最快乐的经历': '挑自己最快乐的那一次讲，讲清当时的人、地方、做了什么、为什么这么快乐',
  '最羞耻的经历': '挑自己最不愿提的那一次讲，语气里带着羞耻、想遮掩又不得不说',
  '初次性经历': '第一次的完整经过：跟谁、在哪、怎么开始、什么感觉、事后怎么想',
  '最难忘的一夜': '印象最深的一夜，不必是第一次，重点讲清那一夜特殊在哪、难忘在哪',
  '内心隐秘的欲望': '平时说不出口的念头、幻想、癖好，第一次坦白出来，越私密越好',
  '情感告白': '对某个特定的人说心里话：喜欢、依赖、愧疚、想在一起，把感情说透',
  // 🗂 台词类型（经历：角色在某段性爱经历中说过的话）
  '呻吟与哭喊': '当场发出的呻吟、浪叫、哭喊——碎句、短句、喊对方名字，几乎是纯叫声带几个字',
  '被逼供述': '被逼着一句句回答、招认：问什么答什么，被追问就答得更多、更细、更不要脸',
  '哀求讨饶': '求对方停下、放过、慢一点、给个痛快，反复求、越求越没底气',
  '高潮时的呓语': '高潮前后失去理智时说的胡话、断句、重复的短句，语无伦次却露骨',
  '事后的抱怨': '完事之后带着余韵的抱怨、嗔怪、后怕、算账，语气软、话里还带骚',
  '内心独白': '在人前不能出声、只能在心里说给自己的话——想喊不敢喊、想骂不敢骂，全在心里说',
  // 📢 诵读场景（要在公开场合念出来的稿子）
  '当众宣读': '当着一群人的面念出来的稿子，开头结尾有「众位听好」「念完了」这类诵读用语',
  '刑台示众': '被绑着、围着人念的认罪稿，一句一顿，念不下去时被人催着接着念',
  '家族集会': '在自家人面前念的稿子，称呼按辈分来，羞耻感来自「都是熟人」',
  '直播镜头': '对着镜头、说给弹幕和观众听，边念边看镜头，语气里带表演和讨好',
  '广场围观': '在公开场合被围观看热闹时念的稿子，人多、嘈杂，声音要放出来',
  '教会忏悔': '在神像与众人前忏悔告解，句式庄重、有悔罪与祈求宽恕的口吻',
  '主人面前': '跪着或站着念给主人听的稿子，全程请示、认罪、表忠心',
  '婚礼致辞': '在婚礼场合念的致辞，仪式感强，体面话里裹着见不得人的内容',
  // 💬 内容方向（关系对话：对某个关系人物说的话）
  '调情撩拨': '挑逗、逗弄、撩对方，话里带钩子，不直说要什么却处处暗示',
  '求饶示弱': '服软、认输、讨饶，把姿态放低，求对方心软',
  '日常问候': '平常的问候、叮嘱、照料式的话，日常口吻里透出两人的关系和亲近',
  '深情告白': '把感情说透：喜欢、离不开、想一直在一起，认真而动人',
  '威胁质问': '逼问、质问、放狠话，要对方给交代或听话，语气有压迫感',
  '汇报服侍': '向上位者汇报自己的情况、听候指派、请示接下来怎么做',
  '撒娇任性': '赖着、闹着、耍小性子要东西，语气甜里带缠人',
  '告别决裂': '分开、断绝、最后一面的狠话或软话，话里有不舍也有决意',
  // 🗯 普通辱骂类型
  '人身攻击': '直接攻击对方这个人：长相、身材、蠢笨、下贱，句句冲着本人去',
  '身份贬损': '踩对方的身份与出身：下人、贱种、外室、没名分，拿地位压人',
  '亲属辱骂': '骂到对方的父母、妻儿、祖宗，用亲属称呼做辱骂的载体',
  '市井俚骂': '街头巷尾最难听的那套脏话，粗鄙直接、不讲道理',
  '诅咒恶言': '希望对方遭殃：断子绝孙、不得好死、烂在泥里，语气恶毒',
  '揭短打脸': '专揭对方最不愿被提的旧事与短处，当众抖出来让人下不来台',
  '文雅毒舌': '不用脏字也能骂得刻薄，用讥讽、反话、掉书袋把人刺到骨头里',
  '阴阳怪气': '不直接骂，拐着弯损、假夸真贬，让对方听着难受又抓不住把柄',
  '道德批判': '站在道理与规矩上数落对方：不知廉耻、坏了纲常、丧了良心',
  '冷嘲热讽': '语气淡淡的，一句一句冷着损，比破口大骂更难受',
  // 💢 性辱骂类型
  '淫词秽语': '满口最脏的性词：骚穴、贱屄、肉棒、精液，怎么露骨怎么骂',
  '性羞辱': '把对方的身体与性反应当作羞辱材料：湿成这样、自己送上门、离了男人活不了',
  '性能力嘲讽': '嘲讽对方床上不行：早泄、软、没力气、伺候不好人，拿性能力贬低他',
  '身体嘲笑': '专挑身体下手：乳头黑、穴松、奶小、肥、臭，把身体说成不堪入目',
  '性奴呼称': '用性奴称呼压人：母狗、贱奴、骚货、肉便器，把对方钉在从属位置',
  '床笫揭短': '抖出对方床上最不愿被提的表现：怎么求的、怎么叫的、怎么去的、谁先撑不住',
  '淫荡诅咒': '咒对方被操、被轮、被干到烂，用淫荡的后果当诅咒',
  '贞操攻击': '拿贞洁说事：装什么清高、早不是处女、人尽可夫，句句冲着贞操去',
  '挑逗式辱骂': '骂里带撩，一边贬损一边勾着对方，让人被骂着还起了反应',
  '畜生化辱骂': '把人往牲口上贬：母畜、发情的狗、只配配种，剥夺人的身份',
};

// ===== 选题卡「语气」释义表：选中哪项就把释义随参数段一起下发给 AI =====
var 角色台本语气解释表 = {
  // 自述
  '坦然讲述': '不回避、不遮掩，平平静静地把事讲完，像是早就想开了',
  '羞涩断续': '说不出口、说到一半停住，用停顿和含糊把一个羞耻的故事讲完',
  '带着哭腔': '声音发颤、带鼻音，讲到痛处与羞处就压不住哭音',
  '自嘲苦笑': '拿自己开玩笑，笑着讲自己的不堪，笑意里透着认命',
  '庄重平静': '用郑重、平稳的口气讲，把再淫的事也讲得像交代正事',
  '情难自禁': '讲到一半自己先动情，语气越来越软、越来越急，收不住',
  // 经历
  '破碎断续': '话被快感和喘息切成碎片，半句一半句地往外挤',
  '压抑低喘': '不敢出声，压着嗓子低喘，把叫声咽回去再说半个字',
  '哭腔': '带哭音、带鼻音，疼或爽到哭出来还得接着说',
  '高亢失神': '声音拔高、失去理智，喊出来的话不成句、不顾体面',
  '羞愤交加': '又羞又恨，一边被逼着说一边骂自己或骂对方',
  // 诵读
  '羞耻颤抖': '明知念出来丢人，声音抖着念，越念越小声',
  '亢奋得意': '念得眉飞色舞、越念越得意，把自己的不堪当成本事炫耀',
  '麻木顺从': '没有起伏地照念，认了命，语气平得像念公文',
  '哭着念完': '一边哭一边把稿子念到底，中间几次念不下去又接着念',
  '一字一顿': '一个字一个字往外蹦，像被人盯着逼出来的',
  '庄严宣读': '像宣读正式文书那样庄重，把下流内容念得一本正经',
  // 关系对话
  '低声细语': '凑近了小声说，只有对方听得见，气声多、音量低',
  '咬牙切齿': '从牙缝里挤字，恨意与火气压在语气里',
  '娇嗔撒娇': '拖着尾音、带着嗔怪地缠人，甜里带赖',
  '冷若冰霜': '语气冷、字少、不带感情，把对方挡在外面',
  '温柔缱绻': '放软了口气，慢慢说，字里都是舍不得与亲近',
  // 辱骂
  '冷笑讥讽': '先笑一声再开口，用讥笑和反话损人',
  '暴怒咆哮': '火气压不住，吼出来、骂得又快又响，句子都撞在一起',
  '阴阳怪气': '不直接骂，拐着弯损、假夸真贬，让对方听着难受又抓不住把柄',
  '平静恶毒': '语气平平淡淡，内容却句句往死里咒，越平静越可怕',
  '哭着痛骂': '一边哭一边骂，骂声里混着委屈与恨',
  '带笑骂人': '笑着骂、骂得亲昵或阴森，笑意比骂词更刺人',
};

function 角色台本工厂(cfg) {
  // cfg: { storeKey, containerId, viewContentId, prefix, windowPrefix, navLabelList, navLabelEdit,
  //         promptName, aiFieldId, aiLabel, 主题标签, 主题选项, 语气选项, 对象模式, 经历模式, 主题多选 }
  var 主题选项 = cfg.主题选项 || [];
  var 主题标签 = cfg.主题标签 || '主题';
  var 主题多选 = cfg.主题多选;    // 主题 chips 多选（如辱骂类型可组合多种）
  var 语气选项 = cfg.语气选项 || null;
  var 场合选项 = cfg.场合选项 || null;  // 场合/场景行（如 正在被操时 / 正在被调教时 / 当众对峙）
  var 语言风格选项 = cfg.语言风格选项 || null;   // 选题卡·语言风格行：显示的技法名数组（来自共享 语言风格库；用于对白/独白类模块）
  var 语言风格键 = '语言风格';                    // 作品数据字段名
  var 语言风格字段 = cfg.prefix + 'LangStyleReq'; // 自定义风格输入框 id
  var 双模式 = cfg.双模式 || null;      // 双模式（辱骂/性辱骂合并）：[{ key, label, promptName, 主题选项, 场合选项 }]
  var 双模式默认键 = cfg.默认模式 || (双模式 ? 双模式[0].key : '');  // 默认模式（辱骂默认性辱骂）
  var 对象模式 = cfg.对象模式;    // 关系对话/辱骂：对象人物行（输入 + 导入角色卡 + AI 提取关系）
  var 经历模式 = cfg.经历模式;    // 经历：经历列表行（角色卡性爱明细 / AI 提取）+ 选中经历

  // 主题值显示（多选时数组 join，单选时原样）
  function 主题显示(t) {
    if (Array.isArray(t)) return t.join('、');
    return t || '';
  }
  // ===== 语言风格（选题卡·语言风格行）：共用 淫诗体模块工厂 里定义的 语言风格库 =====
  // 旧风格名 → 现用名（与 淫诗体模块工厂 内的 语言风格改名表 同一份）
  function 规范化语言风格名(n) {
    n = String(n == null ? '' : n).trim();
    var t = (typeof window.语言风格改名表 !== 'undefined') ? window.语言风格改名表 : null;
    return (t && t[n]) ? t[n] : n;
  }
  // 读「已选语言风格」（数组；兼容旧的字符串存档；旧风格名自动迁移到现用名）
  function 读语言风格() {
    var v = 编辑状态[语言风格键];
    if (Array.isArray(v)) return v.map(规范化语言风格名).filter(Boolean);
    if (typeof v === 'string' && v.trim()) return v.split(/[、,，]/).map(function(x){ return 规范化语言风格名(x); }).filter(Boolean);
    return [];
  }
  function 写语言风格(arr) {
    编辑状态[语言风格键] = arr;
    编辑字段(语言风格键, arr);
  }
  function 读语言风格自定义() {
    var el = document.getElementById(语言风格字段);
    var t = el ? String(el.value || '').trim() : '';
    读语言风格().forEach(function(s) { t = t.split(s).join(''); });
    return t.replace(/[、,，；;\s]+/g, ' ').trim();
  }
  function 读语言风格全部() {
    var arr = 读语言风格();
    var c = 读语言风格自定义();
    return c ? arr.concat([c]) : arr;
  }
  function 语言风格条目查(name) {
    if (typeof window.语言风格条目 === 'function') return window.语言风格条目(name);
    var lib = window.语言风格库;
    if (!lib) return null;
    for (var i = 0; i < lib.length; i++) { if (lib[i].名 === name) return lib[i]; }
    return null;
  }
  // 语言风格行 HTML：技法 chips（多选）+ 自定义输入 + AI 建议
  function 语言风格行HTML() {
    var names = 语言风格选项 || [];
    var h = '';
    names.forEach(function(n) {
      h += '<span class="tag-chip' + (读语言风格().indexOf(n) >= 0 ? ' tag-active' : '') + '" data-lang-style="' + n + '" onclick="' + cfg.windowPrefix + '切换语言风格(\'' + n + '\')">' + n + '</span>';
    });
    读语言风格().forEach(function(n) {
      if (names.indexOf(n) < 0) h += '<span class="tag-chip tag-active" data-lang-style="' + escHtml(n) + '" title="' + escHtml(n) + '" onclick="' + cfg.windowPrefix + '切换语言风格(this.getAttribute(\'data-lang-style\'))">' + escHtml(n.length > 12 ? n.slice(0, 12) + '…' : n) + '</span>';
    });
    h += '<input class="llm-input" id="' + 语言风格字段 + '" placeholder="自定义语言风格（可留空）" style="flex:1;min-width:130px" value="">';
    h += '<button class="ai-suggest-btn" title="AI 按当前选题建议语言风格" onclick="openAiGenPanel(\'' + cfg.aiFieldId + 'LangStyle\')">🤖</button>';
    h += '<button class="btn-sm" title="把输入框里的自定义风格存入选区" onclick="' + cfg.windowPrefix + '添加语言风格()">＋</button>';
    return h;
  }
  function 切换语言风格(name) {
    var arr = 读语言风格();
    var i = arr.indexOf(name);
    if (i >= 0) arr.splice(i, 1); else arr.push(name);
    写语言风格(arr);
    同步chips();
  }
  function 添加语言风格() {
    var el = document.getElementById(语言风格字段);
    if (!el || !String(el.value || '').trim()) { toast('请先填写自定义语言风格'); return; }
    var t = 读语言风格自定义();
    var arr = 读语言风格();
    if (t && arr.indexOf(t) < 0) arr.push(t);
    el.value = '';
    写语言风格(arr);
    同步chips();
    toast(t ? '已加入语言风格：' + t : '自定义内容已在选区中');
  }
  // 语言风格段（进 AI 参数段）：每种风格是一个整体典型 —— 先给用词与称谓取向，再附上示范台词供体会语感
  // ⚠️ 示范台词只是「语感参照」：写成「整段…要求整体复现」会让模型整句照抄示范台词，必须明写「禁止照抄整句」。
  function 语言风格上下文() {
    var arr = 读语言风格全部();
    if (!arr.length) return '';
    var out = '语言风格：' + arr.join('、') + '\n';
    arr.forEach(function(n) {
      var e = 语言风格条目查(n);
      if (e) {
        out += '　【' + e.名 + '·用词与称谓】' + e.用词 + '\n';
        out += '　【' + e.名 + '·示范台词（只是语感参照，禁止照抄）】\n' + e.例 + '\n';
        out += '　　↑ 上面这些句子**只用来体会这套用词与称谓**：同一个词、同一个称谓可以照用，但**任何整句都不许搬进本次台词**，必须按这套用词另写全新的台词。\n';
      } else {
        out += '　【' + n + '】按此风格整体行文（自定义风格，需自行把握用词）\n';
      }
    });
    out += '　注意：用词要通篇统一成这一套（同一个性器官、同一个身份称谓自始至终用同一个词），不要中途换成别的说法；用词说明里引号中的句子同样只是参照，禁止整句照搬。\n';
    return out;
  }
  // 选题卡·角色话语行：是否把所选角色的「原话」附进提示词 + 从话语库选一个角色（默认渲染，等价于默认启用）
  var 话语行 = cfg.话语行 !== false;

  // ===== 角色话语行 =====
  // 「角色话语」= 小说提取摘出的该角色原话，独立于角色卡数据（不进 角色卡全部 的 14 章）。
  // 这里只做两件事：① 是否附进提示词（默认启用）；② 从话语库选一个角色的原话（不必是当前的 char）。
  // 未手选过时自动跟随当前角色匹配同名条目（话语已手选 一旦为真就不再自动改写）。
  function 读使用话语() { return 编辑状态.使用角色话语 !== false; }
  function 读话语键() { return 编辑状态.话语角色键 || ''; }
  function 写话语选中(d) {
    编辑状态.使用角色话语 = true;
    编辑状态.话语角色键 = d ? (d.键 || '') : '';
    编辑状态.话语角色名 = d ? (d.char || '') : '';
    编辑状态.话语书 = d ? (d.book || '') : '';
    编辑状态.话语条数 = d ? ((d.lines || []).length) : 0;
    编辑字段('使用角色话语', true);
    编辑字段('话语角色键', 编辑状态.话语角色键);
    编辑字段('话语角色名', 编辑状态.话语角色名);
    编辑字段('话语书', 编辑状态.话语书);
    编辑字段('话语条数', 编辑状态.话语条数);
  }
  function 切换使用角色话语() {
    编辑状态.使用角色话语 = !读使用话语();
    编辑字段('使用角色话语', 编辑状态.使用角色话语);
    刷新话语行();
    同步chips();
  }
  function 刷新话语行() {
    var el = document.getElementById(cfg.prefix + 'SpeechRow');
    if (el) el.innerHTML = 话语行HTML();
  }
  function 话语行HTML() {
    var h = '';
    var use = 读使用话语();
    h += '<span class="tag-chip' + (use ? ' tag-active' : '') + '" data-speech-use="1" onclick="' + cfg.windowPrefix + '切换使用角色话语()" title="生成时是否把所选角色的原话附进提示词（只作说话调子的参照）">使用角色话语</span>';
    var 键 = 读话语键();
    var 摘要 = 键 ? 角色话语摘要(键) : null;
    if (摘要 && 摘要.count) {
      h += '<span class="tag-chip tag-active" title="' + escHtml('《' + 摘要.book + '》' + 摘要.char + '：' + 摘要.count + ' 条原话') + '">💬 ' + escHtml(摘要.char) + '（' + 摘要.count + ' 条）</span>';
      h += '<span class="tag-chip" style="color:var(--fg3)" title="清除已选话语" onclick="' + cfg.windowPrefix + '清除话语()">✕ 清除</span>';
    } else if (键) {
      h += '<span class="tag-chip" style="color:var(--warning)" title="所选条目已不在话语库里">💬 已选条目已失效</span>';
      h += '<span class="tag-chip" style="color:var(--fg3)" onclick="' + cfg.windowPrefix + '清除话语()">✕ 清除</span>';
    } else {
      h += '<span class="tag-chip" style="color:var(--fg3)">未选（选好角色后自动匹配同名话语）</span>';
    }
    h += '<button class="btn-sm" onclick="' + cfg.windowPrefix + '选取话语()" title="从角色话语库里选一个角色的原话">📚 选取话语</button>';
    return h;
  }
  function 选取话语() {
    if (typeof stcdOpenSpeechPicker !== 'function') { toast('角色话语库未就绪'); return; }
    stcdOpenSpeechPicker({
      默认角色名: 编辑状态.char || '',
      onPick: function(d) {
        if (!d) return;
        写话语选中(d);
        编辑状态.话语已手选 = true;
        编辑字段('话语已手选', true);
        刷新话语行();
        同步chips();
        toast('已选用「' + (d.char || '') + '」的原话 ' + ((d.lines || []).length) + ' 条');
      }
    });
  }
  function 清除话语() {
    写话语选中(null);
    编辑状态.话语已手选 = true;
    编辑字段('话语已手选', true);
    刷新话语行();
    toast('已清除所选角色话语（开关仍为开，但未选话语时不会附加原话）');
  }
  // 自动匹配：未手选过时，按当前角色名在话语库里找同名条目（取最近更新的一条）
  function 自动匹配话语() {
    if (!话语行 || 编辑状态.话语已手选) return;
    var name = 编辑状态.char || '';
    if (!name) return;
    角色话语找角色([name], 读话语键()).then(function(d) {
      if (!d || d.键 === 读话语键()) return;
      写话语选中(d);
      刷新话语行();
    });
  }

  // 双模式：当前模式（编辑状态.kind 指定，缺省取第一个）
  function 当前模式() {
    if (!双模式) return null;
    var k = 编辑状态.kind || 双模式默认键;
    for (var i = 0; i < 双模式.length; i++) { if (双模式[i].key === k) return 双模式[i]; }
    return 双模式[0];
  }
  function 有效主题选项() { var m = 当前模式(); return m ? (m.主题选项 || []) : 主题选项; }
  function 有效场合选项() { var m = 当前模式(); return m ? (m.场合选项 || null) : 场合选项; }
  function 有效生成提示词() { var m = 当前模式(); return m ? m.promptName : cfg.promptName; }

  // 最少字数（创作页 AI 生成卡上的独立选项；默认 500，0 = 不限）
  var _最低字数 = 500;
  function 读取最少字数() { return _最低字数; }
  function 切换字数(v) {
    var n = Math.max(0, Math.floor(Number(v) || 0));
    _最低字数 = n;
    toast(n > 0 ? '最少字数：' + n + ' 字' : '最少字数：不限');
    var root = document.getElementById(cfg.viewContentId);
    if (root) {
      root.querySelectorAll('.tag-chip[data-minw]').forEach(function(c) {
        c.classList.toggle('tag-active', Number(c.getAttribute('data-minw')) === n);
      });
    }
  }

  var 导航 = [
    { id: 'list', label: cfg.navLabelList },
    { id: 'editor', label: cfg.navLabelEdit },
  ];
  var 当前视图 = 'list';
  var _editTitle = null;
  var 编辑状态 = {};
  var 创作防抖保存 = null;

  function 切换视图(view) {
    当前视图 = view;
    var el = document.getElementById(cfg.containerId);
    if (!el) return;
    var h = '<div class="tl-subnav">';
    导航.forEach(function(v) { h += '<div class="tl-subitem' + (v.id === 当前视图 ? ' act' : '') + '" data-view="' + v.id + '">' + v.label + '</div>'; });
    h += '</div><div id="' + cfg.viewContentId + '"></div>';
    el.innerHTML = h;
    var vEl = document.getElementById(cfg.viewContentId);
    if (!vEl) return;
    el.querySelectorAll('.tl-subitem').forEach(function(i) { i.addEventListener('click', function() {
      var v = this.getAttribute('data-view');
      if (v === 'editor') { 新创作(); return; }
      切换视图(v);
    }); });
    switch (view) {
      case 'list': 渲染列表(vEl); break;
      case 'editor': 渲染编辑器(vEl); break;
    }
  }

  function 新创作() { _editTitle = null; 切换视图('editor'); }
  function 编辑项(title) { _editTitle = title; 切换视图('editor'); }
  function 删除项(title) { confirmDialog('确定删除「' + title + '」？', function(){ Store[cfg.storeKey].delete(title).then(function(){ toast('已删除'); 切换视图('list'); }); }); }

  // ===== 列表（角色筛选 chips + 卡片）=====
  var 列表角色筛选 = '全部';
  function 筛选角色(r) { 列表角色筛选 = r; 切换视图('list'); }

  function 渲染列表(el) {
    Store[cfg.storeKey].list().then(function(items) {
      items = items || [];
      var h = '<div class="mb-10"><button class="btn-new" onclick="' + cfg.windowPrefix + '新创作()">＋ 新建</button></div>';
      // 角色筛选行（有作品的角色）
      var chars = [];
      items.forEach(function(i) { if (i.char && chars.indexOf(i.char) < 0) chars.push(i.char); });
      chars.sort();
      var 角色筛选选项 = ['全部'].concat(chars);
      h += 筛选行('角色', 角色筛选选项, 列表角色筛选, cfg.windowPrefix + '筛选角色');
      var filtered = items;
      if (列表角色筛选 !== '全部') filtered = items.filter(function(i) { return i.char === 列表角色筛选; });
      if (!filtered.length) { h += '<div class="placeholder-text">暂无作品，点击「创作」生成</div>'; }
      else {
        filtered.forEach(function(item) {
          h += '<div class="n-card cur-ptr mb-6 p-10" onclick="' + cfg.windowPrefix + '阅读(\'' + escHtml(item.title) + '\')">';
          h += '<div class="fw-600 fs-14">' + escHtml(item.title) + '</div>';
          h += '<div class="mt-4 flex gap-4 flex-wrap">';
          if (item.char) h += '<span class="badge-tag">👤 ' + escHtml(item.char) + '</span>';
          if (item.theme) h += '<span class="badge-tag">' + escHtml(主题显示(item.theme)) + '</span>';
          if (item.kind) h += '<span class="badge-tag">' + escHtml(item.kind === '性' ? '💢 性辱骂' : '🗯 普通辱骂') + '</span>';
          if (item.scene) h += '<span class="badge-tag">📍 ' + escHtml(item.scene) + '</span>';
          if (item.tone) h += '<span class="badge-tag">' + escHtml(item.tone) + '</span>';
          if (语言风格选项 && Array.isArray(item[语言风格键]) && item[语言风格键].length) h += '<span class="badge-tag">🎙 ' + escHtml(item[语言风格键].join('、')) + '</span>';
          if (item.target) h += '<span class="badge-tag">→ ' + escHtml(item.target) + '</span>';
          if (item.experience) h += '<span class="badge-tag" style="white-space:normal">📌 ' + escHtml(item.experience) + '</span>';
          h += '</div>';
          h += '<div class="text-muted text-sm mt-4" style="white-space:pre-wrap">' + escHtml(item.content||'').slice(0, 100) + '</div>';
          h += '<div class="mt-6 flex gap-4">';
          h += '<span class="btn-secondary btn-sm" onclick="event.stopPropagation();' + cfg.windowPrefix + '编辑项(\'' + escHtml(item.title) + '\')">✏️ 编辑</span>';
          h += '<span class="btn-secondary btn-sm c-error" onclick="event.stopPropagation();' + cfg.windowPrefix + '删除项(\'' + escHtml(item.title) + '\')">🗑 删除</span>';
          h += '</div></div>';
        });
      }
      el.innerHTML = h;
    });
  }

  // ===== 弹窗阅读（正文居中衬线排版）=====
  function 阅读(title) {
    Store[cfg.storeKey].get(title).then(function(item) {
      item = item || {};
      if (!item.content) { toast('该作品暂无正文'); return; }
      document.querySelectorAll('.ovl').forEach(function(o) { o.remove(); });
      var h = '';
      h += '<div class="reader-head">';
      h += '<span class="reader-title">📖 ' + escHtml(item.title || title) + '</span>';
      if (item.char) h += '<span class="reader-tag">👤 ' + escHtml(item.char) + '</span>';
      if (item.theme) h += '<span class="reader-tag">' + escHtml(主题显示(item.theme)) + '</span>';
      if (item.kind) h += '<span class="reader-tag">' + escHtml(item.kind === '性' ? '💢 性辱骂' : '🗯 普通辱骂') + '</span>';
      if (item.scene) h += '<span class="reader-tag">📍 ' + escHtml(item.scene) + '</span>';
      if (item.tone) h += '<span class="reader-tag">' + escHtml(item.tone) + '</span>';
      if (item.target) h += '<span class="reader-tag">→ ' + escHtml(item.target) + '</span>';
      h += '</div>';
      h += '<div class="reader-body">';
      h += '<div class="reader-poem-title">' + escHtml(item.title || title) + '</div>';
      h += '<div class="reader-poem-text">' + escHtml(item.content || '') + '</div>';
      h += '</div>';
      h += '<div class="reader-foot">';
      h += '<button class="reader-btn" onclick="' + cfg.windowPrefix + '编辑项(\'' + escHtml(title) + '\')">✏️ 编辑</button>';
      h += '<button class="reader-btn" onclick="' + cfg.windowPrefix + '复制全文(\'' + escHtml(title) + '\')">📋 复制全文</button>';
      h += '<button class="reader-btn primary" onclick="this.closest(\'.ovl\').remove()">关闭</button>';
      h += '</div>';
      showModal('', h, { noWrap: true, cardClass: 'reader-night', ovlClass: 'reader-night-ovl' });
    });
  }
  function 复制全文(title) {
    Store[cfg.storeKey].get(title).then(function(item) {
      item = item || {};
      var text = (item.title || title) + (item.char ? ' · ' + item.char : '') + (item.theme ? ' · ' + 主题显示(item.theme) : '') + (item.scene ? ' · ' + item.scene : '') + '\n' + (item.content || '');
      复制到剪贴板(text).then(function(ok){ toast(ok ? '已复制全文' : '复制失败'); });
    });
  }

  // 通用规则块：集中承载各生成提示词共用的规则（只说角色的话 / 注意状态与语气词骚话），
  // 由工厂在每次生成时统一追加到提示词末尾，不在各提示词里重复设置
  var 通用规则块 = '【通用规则】\n'
    + '1. 只生成角色说的话：内容必须是角色们口中说出的话语本身，禁止任何叙述者视角的情景、动作、神态、心理、音效描写；如需交代场景与处境，由角色自己在话语中带出。\n'
    + '2. 注意该角色当前的状态与处境，话语中适当加入语气词与符合身份的骚话。\n'
    + '3. 按句分行：每句话自成一行，一句话结束即换行，一句接一句逐行排列，不要连成一大段落。\n'
    + '4. 注意角色的年龄层次，语言风格、断句、语气词要随年龄明显不同，贴合角色的年龄。\n'
    + '5. 保持连续感：上下句要衔接自然，有承接、递进、因果，语气连贯，像一段不间断的话语流，勿使各句各自断裂、前后跳跃。\n'
    + '6. 若该角色要面对多个对象人物（涉及多人），该角色要逐一对着每个对象说话、都照顾到——是主角分别向每位对象开口、把话分头说给每个人，而非让对象人物自己也开口说话。\n'
    + '7. 正文务必达到所设的最小字数，宁长勿短，不要因篇幅短而省略内容。\n'
    + '8. ' + ((typeof window.省略号通用规则 !== 'undefined') ? window.省略号通用规则 : '省略号要用，但不要频繁地使用，务必尽量少用：只在真正停顿、喘息、话被快感打断的地方用，其余地方一律用逗号、顿号或直接连上，绝不要句句都拖一串省略号。') + '\n';

  // ===== 创作页现代化样式（作用域在 .rsc-creator 下，不改动全局类名，避免影响 chip 选中/保存逻辑）=====
  var 角色台本样式文本 = ''
    + '.rsc-creator{font-family:var(--font-sans);display:flex;flex-direction:column;gap:12px;width:100%;}'
    + '.rsc-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}'
    + '@media (max-width:900px){.rsc-grid{grid-template-columns:1fr;}}'
    + '.rsc-sub{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px;min-height:120px;}'
    + '.rsc-sub-head{display:flex;align-items:center;gap:6px;font-size:11px;letter-spacing:1px;color:var(--fg2);font-weight:600;margin-bottom:10px;}'
    + '.rsc-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:10px;}'
    + '.rsc-row .lbl{font-size:11px;color:var(--fg3);font-weight:600;width:48px;flex-shrink:0;letter-spacing:1px;}'
    + '.rsc-detail{font-size:11px;line-height:1.8;color:var(--fg2);background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:8px 10px;white-space:pre-wrap;max-height:420px;overflow-y:auto;}'
    + '.rsc-empty{font-size:11px;color:var(--fg3);padding:2px 0;}'
    + '.rsc-creator .mb-6{margin-bottom:12px;}'
    + '.rsc-creator .n-card{border-radius:12px;padding:14px 16px;background:linear-gradient(180deg,var(--card),var(--bg2));border:1px solid var(--border);box-shadow:0 2px 12px rgba(0,0,0,.22);transition:border-color .2s,box-shadow .2s;margin-bottom:0;}'
    + '.rsc-creator .n-card:hover{border-color:var(--accent2);box-shadow:0 4px 18px rgba(0,0,0,.3);}'
    + '.rsc-creator .tag-chip{border-radius:999px;padding:4px 11px;background:var(--bg2);border:1px solid var(--border);letter-spacing:.5px;transition:all .15s;}'
    + '.rsc-creator .tag-chip:hover{border-color:var(--accent2);color:var(--accent2);transform:translateY(-1px);}'
    + '.rsc-creator .tag-chip.tag-active{background:linear-gradient(135deg,var(--accent2),var(--accent));color:var(--bg);border-color:transparent;}'
    + '.rsc-creator .llm-input,.rsc-creator .llm-input-lg{border-radius:8px;background:var(--bg2);transition:border-color .15s,box-shadow .15s;}'
    + '.rsc-creator .llm-input:focus,.rsc-creator .llm-input-lg:focus{border-color:var(--accent2);box-shadow:0 0 0 2px var(--accent-dim);}'
    + '.rsc-creator .ai-suggest-btn{width:32px;height:32px;border-radius:8px;flex-shrink:0;}'
    + '.rsc-creator .btn-sm{background:var(--bg2);color:var(--fg);border:1px solid var(--border);border-radius:8px;padding:5px 12px;cursor:pointer;flex-shrink:0;font-family:var(--font-sans);letter-spacing:.5px;transition:all .15s;}'
    + '.rsc-creator .btn-sm:hover{border-color:var(--accent2);color:var(--accent2);transform:translateY(-1px);}'
    + '.rsc-creator .btn{border-radius:8px;}'
    + '.rsc-creator .btn.btn-primary{border-radius:10px;background:linear-gradient(135deg,var(--accent2),var(--accent));color:var(--bg);border:none;box-shadow:0 3px 14px rgba(212,136,158,.3);}'
    + '.rsc-creator .btn.btn-primary:hover{filter:brightness(1.08);transform:translateY(-1px);box-shadow:0 5px 18px rgba(212,136,158,.4);}'
    + '.rsc-creator .ai-field-row{border-radius:8px;}';
  var 角色台本样式已注入 = false;
  function 注入角色台本样式() {
    if (角色台本样式已注入) return;
    角色台本样式已注入 = true;
    if (typeof document === 'undefined' || !document.head || typeof document.createElement !== 'function' || typeof document.getElementById !== 'function') return;
    var id = 'role-script-creator-style';
    if (document.getElementById(id)) return;
    var st = document.createElement('style');
    st.id = id;
    st.textContent = 角色台本样式文本;
    document.head.appendChild(st);
  }

  // ===== 即时保存：标题确定即建档，字段改动防抖写盘 =====
  function 自动建档() {
    var t = (编辑状态.title || '').trim();
    if (_editTitle || !t) return Promise.resolve(false);
    return Store[cfg.storeKey].list().then(function(items) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].title === t) { toast('同名作品已存在，草稿未建立'); return false; }
      }
      _editTitle = t;
      var data = 当前数据快照();
      return Store[cfg.storeKey].save(t, data).then(function() { toast('已建立草稿「' + t + '」'); return true; });
    });
  }
  function 写盘() {
    var t = (编辑状态.title || '').trim();
    if (!t || !_editTitle) return;
    if (t !== _editTitle) {
      var oldTitle = _editTitle;
      _editTitle = null;
      Store[cfg.storeKey].delete(oldTitle).catch(function(){}).then(function() {
        var data = 当前数据快照();
        data.title = t;
        Store[cfg.storeKey].save(t, data).then(function(){ _editTitle = t; });
      });
      return;
    }
    Store[cfg.storeKey].get(_editTitle).then(function(m) {
      m = m || {};
      Object.assign(m, 当前数据快照());
      Store[cfg.storeKey].save(_editTitle, m).then(function(){});
    });
  }
  function 编辑字段(key, val) {
    编辑状态[key] = val;
    if (_editTitle) {
      if (!创作防抖保存) 创作防抖保存 = 防抖(function(){ 写盘(); }, 400);
      创作防抖保存();
    } else if ((编辑状态.title || '').trim()) {
      自动建档().then(function(ok) {
        if (!ok) return;
        if (!创作防抖保存) 创作防抖保存 = 防抖(function(){ 写盘(); }, 400);
        创作防抖保存();
      });
    }
  }
  function 当前数据快照() {
    var d = {};
    Object.assign(d, 编辑状态);
    if (typeof d.tags === 'string') d.tags = d.tags.split('、').map(function(x){return x.trim();}).filter(Boolean);
    return d;
  }

  // ===== 角色选择（走全局角色卡选择器 stcdOpenCharPicker）=====
  function 角色名(c) { var b = c && c.identity && c.identity.basicInfo || {}; return b.name || '未命名'; }
  function 自动标题() {
    if ((编辑状态.title || '').trim()) return;
    var t = (编辑状态.char || '');
    var themeText = 主题显示(编辑状态.theme);
    if (themeText) t = t ? t + ' · ' + themeText : themeText;
    if (!t.trim()) return;
    编辑状态.title = t;
    var ti = document.getElementById(cfg.prefix + 'Title');
    if (ti) ti.value = t;
  }
  function 打开角色选择() {
    if (typeof stcdOpenCharPicker !== 'function') { toast('角色卡选择器不可用'); return; }
    stcdOpenCharPicker('', { onPick: function(data) {
      if (!data) { toast('未选择角色'); return; }
      应用角色(data);
    }});
  }
  function 应用角色(card) {
    card = card || {};
    var name = 角色名(card);
    var 切换不同角色 = (编辑状态.char !== name);   // 是否真的切换到了另一个角色
    编辑状态.char = name;
    编辑状态.charRef = JSON.parse(JSON.stringify(card));
    if (name) 自动标题();
    编辑字段('char', name);
    var cd = document.getElementById(cfg.prefix + 'CharDisplay');
    if (cd) cd.innerHTML = '👤 ' + escHtml(name);
    // 切换到另一个角色时：先清空上一角色的经历/关系/选中，再加载新角色存档
    if (切换不同角色) {
      编辑状态.experiences = [];
      编辑状态.relations = [];
      编辑状态.selectedExps = [];
      编辑状态.targets = [];
    }
    // 加载该角色本地存档（关系/经历 全板块通用；对象人物/经历 默认不选中，尊重作品自身选择）
    读取角色提取().then(function(d) {
      if (d) {
        if (Array.isArray(d.experiences) && d.experiences.length) 编辑状态.experiences = d.experiences.slice();
        if (Array.isArray(d.relations) && d.relations.length) 编辑状态.relations = d.relations.slice();
      }
      // 无存档经历时：把角色卡自带性爱明细落盘为本地经历
      if ((!编辑状态.experiences || !编辑状态.experiences.length) && 经历模式 && card.identity && card.identity.experience && Array.isArray(card.identity.experience.sexualDetails) && card.identity.experience.sexualDetails.length) {
        编辑状态.experiences = card.identity.experience.sexualDetails.slice();
        保存角色提取({ experiences: 编辑状态.experiences });
      }
      刷新经历chips();
      刷新关系chips();
      刷新经历详情();
      刷新关系详情();
      自动匹配话语();   // 换角色后重新按同名匹配原话（手选过则不动）
    });
  }
  function 选择角色(name) {
    name = name || '';
    if (!name) { 编辑状态.char = ''; 编辑状态.charRef = null; 刷新经历chips(); 刷新关系chips(); 刷新关系详情(); 刷新经历详情(); return; }
    Store.character.get(name).then(function(card) { 应用角色(card || { identity: { basicInfo: { name: name } } }); })
      .catch(function() { 应用角色({ identity: { basicInfo: { name: name } } }); });
  }
  // ===== 本地存档：角色关系/经历/对象人物（全板块通用，可重新生成覆盖）=====
  var 角色提取保存队列 = Promise.resolve();
  function 读取角色提取() {
    var k = 编辑状态.char || '';
    if (!k || typeof Store.roleExtract === 'undefined' || !Store.roleExtract.get) return Promise.resolve(null);
    return Store.roleExtract.get(k).then(function(d) { return d || null; }).catch(function() { return null; });
  }
  // 串行保存：避免「读-改-写」竞态导致连续写入互相覆盖
  function 保存角色提取(数据) {
    var k = 编辑状态.char || '';
    if (!k || typeof Store.roleExtract === 'undefined' || !Store.roleExtract.save) return Promise.resolve(false);
    角色提取保存队列 = 角色提取保存队列.then(function() {
      return 读取角色提取().then(function(old) {
        var merged = old || { title: k, char: k };
        Object.keys(数据).forEach(function(key) { merged[key] = 数据[key]; });
        merged.updatedAt = new Date().toISOString();
        return Store.roleExtract.save(k, merged);
      });
    });
    return 角色提取保存队列;
  }
  // ===== 角色经历：经历 chips（多选：点击加入/移出，多个可同时高亮；完整显示不截断）=====
  function 选中经历表() {
    return Array.isArray(编辑状态.selectedExps) ? 编辑状态.selectedExps : (编辑状态.selectedExps = []);
  }
  function 刷新经历chips() {
    var box = document.getElementById(cfg.prefix + 'ExpChips');
    if (!box) return;
    var arr = 编辑状态.experiences || [];
    if (!arr.length) { box.innerHTML = '<span class="rsc-empty">暂无经历 —— 点 🤖 提取或自制</span>'; return; }
    var sel = 选中经历表();
    var h = '';
    arr.forEach(function(e, i) {
      var t = String(e || '');
      h += '<span class="tag-chip' + (sel.indexOf(t) >= 0 ? ' tag-active' : '') + '" style="display:inline-block;cursor:pointer;white-space:normal;text-align:left;line-height:1.5;max-width:100%" onclick="' + cfg.windowPrefix + '选择经历(' + i + ')">' + escHtml(t) + '</span>';
    });
    box.innerHTML = h;
  }
  function 选择经历(i) {
    var e = (编辑状态.experiences && 编辑状态.experiences[i]) || '';
    var sel = 选中经历表();
    var j = sel.indexOf(e);
    if (j >= 0) sel.splice(j, 1); else sel.push(e);
    编辑字段('selectedExps', sel.slice());
    刷新经历chips();
    刷新经历详情();
  }

  // ===== 对象人物：关系人物（多选：点击加入/移出，多个可同时高亮；显示所有选中详情）=====
  function 选中对象表() {
    return Array.isArray(编辑状态.targets) ? 编辑状态.targets : (编辑状态.targets = []);
  }
  function 刷新关系详情() {
    var el = document.getElementById(cfg.prefix + 'RelDetail');
    if (!el) return;
    var sel = 选中对象表();
    if (!sel.length) { el.innerHTML = '<div class="rsc-empty">选中关系人物后此处显示详情</div>'; return; }
    var h = '';
    sel.forEach(function(name) {
      var rel = null;
      (编辑状态.relations || []).forEach(function(r) { if (r && r.name === name) rel = r; });
      if (!rel) return;
      h += '<span class="fw-600">' + escHtml(rel.name) + '</span>' + (rel.relation ? '（' + escHtml(rel.relation) + '）' : '');
      if (rel.style) h += '\n语言风格：' + escHtml(rel.style);
      if (rel.events) h += '\n交集经历：' + escHtml(rel.events);
      if (rel.sex) h += '\n性爱经历：' + escHtml(rel.sex);
      h += '\n\n';
    });
    el.innerHTML = h.trim();
  }
  // 经历详情（多选：显示所有选中经历全文）
  function 刷新经历详情() {
    var el = document.getElementById(cfg.prefix + 'ExpDetail');
    if (!el) return;
    var sel = 选中经历表();
    if (!sel.length) { el.innerHTML = '<div class="rsc-empty">选中经历后此处显示全文</div>'; return; }
    el.innerHTML = sel.map(function(e) { return escHtml(去序号(e)); }).join('\n\n');
  }
  function 选择关系(name) {
    var sel = 选中对象表();
    var i = sel.indexOf(name);
    if (i >= 0) sel.splice(i, 1); else sel.push(name);
    编辑字段('targets', sel.slice());
    刷新关系chips();
    刷新关系详情();
  }
  function 刷新关系chips() {
    var box = document.getElementById(cfg.prefix + 'RelChips');
    if (!box) return;
    var arr = 编辑状态.relations || [];
    var sel = 选中对象表();
    var h = '';
    arr.forEach(function(r) {
      var n = (r && r.name) || '';
      if (!n) return;
      var label = r.relation ? n + '（' + r.relation + '）' : n;
      h += '<span class="tag-chip' + (sel.indexOf(n) >= 0 ? ' tag-active' : '') + '" style="cursor:pointer" onclick="' + cfg.windowPrefix + '选择关系(\'' + escHtml(n) + '\')">' + escHtml(label) + '</span>';
    });
    box.innerHTML = h || '<span class="rsc-empty">暂无关系人物 —— 点 🤖 提取或自制人物</span>';
  }
  function 设置对象(name) {
    name = (name || '').trim();
    var sel = 选中对象表();
    if (name) { if (sel.indexOf(name) < 0) sel.push(name); } else { sel.length = 0; }
    编辑字段('targets', sel.slice());
    保存角色提取({ targets: sel.slice() });
    刷新关系chips();
    刷新关系详情();
  }

  // ===== 创作页（五卡片式：作品信息 / 选题 / 灵感素材 / AI 生成 / 正文）=====
  function 卡片头(icon, label, extra) {
    var h = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;font-family:var(--font-sans)">';
    h += '<span style="width:3px;height:12px;background:var(--accent2);flex-shrink:0"></span>';
    h += '<span style="font-size:11px;letter-spacing:2px;color:var(--fg2)">' + icon + ' ' + label + '</span>';
    if (extra) h += '<span style="margin-left:auto;font-size:10px;color:var(--fg3);letter-spacing:1px">' + extra + '</span>';
    h += '</div>';
    return h;
  }
  function 参数行(label, chipsHtml) {
    var w = 52;
    var hang = w + 4;
    return '<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:wrap;padding-left:' + hang + 'px">'
      + '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:' + w + 'px;flex-shrink:0;margin-left:-' + hang + 'px">' + label + '</span>'
      + chipsHtml + '</div>';
  }
  function 渲染编辑器(el) {
    if (_editTitle) {
      Store[cfg.storeKey].get(_editTitle).then(function(data) { 渲染表单(el, data||{}); });
    } else {
      渲染表单(el, { title:'', char:'', charRef:null, theme:'', tone:'', target:'', targetRef:null, experience:'', experiences:[], content:'', tags:[] });
    }
  }
  function 渲染表单(el, data) {
    注入角色台本样式();
    编辑状态 = {
      title: data.title||'', char: data.char||'', charRef: data.charRef||null,
      kind: data.kind || 双模式默认键,
      theme: 主题多选 ? (Array.isArray(data.theme) ? data.theme.slice() : (data.theme ? [data.theme] : [])) : (data.theme||''),
      tone: data.tone||'', scene: data.scene||'',
      target: data.target||'', targetRef: data.targetRef||null,
      targets: Array.isArray(data.targets) ? data.targets.slice() : (data.target ? [data.target] : []),
      experience: data.experience||'', experiences: Array.isArray(data.experiences) ? data.experiences : [],
      selectedExps: Array.isArray(data.selectedExps) ? data.selectedExps.slice() : (data.experience ? [data.experience] : []),
      relations: Array.isArray(data.relations) ? data.relations : [],
      content: data.content||'', tags: Array.isArray(data.tags) ? data.tags : [],
    };
    // 语言风格（多选，数组存档；兼容旧的字符串存档）
    // 默认不启用：新作品为空数组、不预选任何风格，只有用户点 chip / 🤖 建议 / ＋ 自定义才会注入参数段（随机灵感也不再替用户选）
    编辑状态[语言风格键] = Array.isArray(data[语言风格键]) ? data[语言风格键].slice() : (data[语言风格键] ? String(data[语言风格键]).split(/[、,，]/).map(function(x){return x.trim();}).filter(Boolean) : []);
    // 角色话语（独立字段）：使用开关默认启用；未手选过 → 选好角色后自动匹配同名话语
    编辑状态.使用角色话语 = data.使用角色话语 === undefined ? true : !!data.使用角色话语;
    编辑状态.话语角色键 = data.话语角色键 || '';
    编辑状态.话语角色名 = data.话语角色名 || '';
    编辑状态.话语书 = data.话语书 || '';
    编辑状态.话语条数 = data.话语条数 || 0;
    编辑状态.话语已手选 = !!data.话语已手选;
    var s = 编辑状态;
    var h = '<div class="rsc-creator">';
    // ① 作品信息卡：角色 + 标题
    h += '<div class="n-card p-10 mb-6">';
    h += 卡片头('📋', '作品信息', '输入即自动保存');
    h += '<div class="ai-field-row">';
    h += '<button class="btn-sm" style="flex-shrink:0" onclick="' + cfg.windowPrefix + '打开角色选择()" title="从全局角色卡选择">🎭 选择角色</button>';
    h += '<span id="' + cfg.prefix + 'CharDisplay" style="flex:1;font-size:12px;color:var(--fg2);padding:6px 4px">' + (s.char ? '👤 ' + escHtml(s.char) : '未选择角色') + '</span>';
    h += '<input class="llm-input" id="' + cfg.prefix + 'Title" placeholder="标题（失焦自动建档；选好角色与主题后自动生成）" value="' + escHtml(s.title||'') + '" style="flex:2" onchange="' + cfg.windowPrefix + '编辑字段(\'title\',this.value)">';
    h += '</div>';
    h += '</div>';
    // ② 角色信息卡：🔗 对象人物 + 🗂 角色经历（两栏同构子面板 · 全板块通用 · 提取/选择/详情 · 本地存档）
    h += '<div class="n-card p-10 mb-6">';
    h += 卡片头('📁', '角色信息', '对象人物 / 经历 · 提取后本地存档，选中即显示详情');
    h += '<div class="rsc-grid">';
    // 左：🔗 对象人物
    h += '<div class="rsc-sub">';
    h += '<div class="rsc-sub-head">🔗 对象人物</div>';
    h += '<div class="rsc-row"><span id="' + cfg.prefix + 'RelChips" style="flex:1;display:flex;gap:4px;flex-wrap:wrap;max-height:320px;overflow-y:auto"></span>'
      + '<button class="btn-sm" onclick="openAiGenPanel(\'' + cfg.aiFieldId + 'ExtractRel\')" title="AI 提取该角色的关系人物（级别关系/语言风格/交集经历/性爱经历）">🤖 提取</button></div>';
    h += '<div class="rsc-row"><input class="llm-input" id="' + cfg.prefix + 'PersonReq" placeholder="自制人物（描述要设定的人物，AI 生成）" style="flex:1;min-width:130px">'
      + '<button class="ai-suggest-btn" onclick="openAiGenPanel(\'' + cfg.aiFieldId + 'CustomRel\')" title="AI 按你的要求设定一个假设人物">🤖</button></div>';
    h += '<div id="' + cfg.prefix + 'RelDetail" class="rsc-detail"></div>';
    h += '</div>';
    // 右：🗂 角色经历
    h += '<div class="rsc-sub">';
    h += '<div class="rsc-sub-head">🗂 角色经历</div>';
    h += '<div class="rsc-row"><span id="' + cfg.prefix + 'ExpChips" style="flex:1;display:flex;gap:4px;flex-wrap:wrap;max-height:320px;overflow-y:auto"></span>'
      + '<button class="btn-sm" onclick="openAiGenPanel(\'' + cfg.aiFieldId + 'Extract\')" title="AI 提取/重新生成该角色的性爱经历，结果本地存档">🤖 提取</button></div>';
    h += '<div class="rsc-row"><input class="llm-input" id="' + cfg.prefix + 'CustomReq" placeholder="自制经历（给出要求，AI 生成）" style="flex:1;min-width:130px">'
      + '<button class="ai-suggest-btn" onclick="openAiGenPanel(\'' + cfg.aiFieldId + 'Custom\')" title="AI 按你的要求创作一段经历">🤖</button></div>';
    h += '<div id="' + cfg.prefix + 'ExpDetail" class="rsc-detail"></div>';
    h += '</div>';
    h += '</div>'; // rsc-grid
    h += '</div>'; // 角色信息卡
    // ③ 选题卡：模式（双模式）/ 主题 / 语气 / 场合 / 随机灵感
    h += '<div class="n-card p-10 mb-6">';
    h += 卡片头('🎯', '选题', 'AI 可一键生成');
    if (双模式) h += 参数行('模式', 双模式.map(function(m) {
      return '<span class="tag-chip' + (s.kind === m.key ? ' tag-active' : '') + '" data-kind="' + m.key + '" onclick="' + cfg.windowPrefix + '切换模式(\'' + m.key + '\');' + cfg.windowPrefix + '同步chips()">' + m.label + '</span>';
    }).join(''));
    h += 参数行(主题标签, 有效主题选项().map(function(t) {
      return '<span class="tag-chip' + (s.theme === t ? ' tag-active' : '') + '" data-theme="' + t + '" onclick="' + cfg.windowPrefix + '切换主题(\'' + t + '\');' + cfg.windowPrefix + '同步chips()">' + t + '</span>';
    }).join(''));
    if (语气选项) h += 参数行('语气', 语气选项.map(function(t) {
      return '<span class="tag-chip' + (s.tone === t ? ' tag-active' : '') + '" data-tone="' + t + '" onclick="' + cfg.windowPrefix + '切换语气(\'' + t + '\');' + cfg.windowPrefix + '同步chips()">' + t + '</span>';
    }).join(''));
    if (有效场合选项()) h += 参数行('场合', 有效场合选项().map(function(t) {
      return '<span class="tag-chip' + (s.scene === t ? ' tag-active' : '') + '" data-scene="' + t + '" onclick="' + cfg.windowPrefix + '切换场合(\'' + t + '\');' + cfg.windowPrefix + '同步chips()">' + t + '</span>';
    }).join(''));
    // 语言风格行：技法 chips（多选，来自共享 语言风格库）+ 自定义输入 + AI 建议
    if (语言风格选项) h += 参数行('语言风格', 语言风格行HTML());
    // 角色话语行（紧接语言风格之下，与之平级）：使用角色话语 开关 + 选取某个角色的原话
    if (话语行) h += 参数行('角色话语', '<span id="' + cfg.prefix + 'SpeechRow" style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">' + 话语行HTML() + '</span>');
    h += 参数行('灵感', '<button class="btn-sm" onclick="' + cfg.windowPrefix + '随机灵感()">🎲 随机灵感</button>');
    h += '</div>';
    // ④ AI 生成卡
    h += '<div class="n-card p-10 mb-6">';
    h += 卡片头('🚀', 'AI 生成', '按当前参数生成 · 结果直接保存');
    var 字数预设 = [0, 300, 500, 800, 1000, 2000];
    var 当前字数 = 读取最少字数();
    var 字数chips = 字数预设.map(function(v) {
      return '<span class="tag-chip' + (当前字数 === v ? ' tag-active' : '') + '" data-minw="' + v + '" onclick="' + cfg.windowPrefix + '切换字数(' + v + ')">' + (v ? v + ' 字' : '不限') + '</span>';
    }).join('');
    字数chips += '<input type="number" class="llm-input" id="' + cfg.prefix + 'MinWords" value="' + 当前字数 + '" min="0" step="50" style="width:90px;font-size:11px" onchange="' + cfg.windowPrefix + '切换字数(this.value)">';
    h += 参数行('最少字数', 字数chips);
    h += '<div class="mb-6">';
    h += '<textarea class="llm-input llm-input-lg" id="' + cfg.prefix + 'Direction" placeholder="方向（可选，如：要带哭腔、要淫靡一些、要文雅一点）" style="width:100%;height:56px;resize:vertical"></textarea>';
    h += '</div>';
    h += '<button class="btn btn-primary" style="width:100%;padding:10px 18px;font-size:13px" onclick="openAiGenPanel(\'' + cfg.aiFieldId + '\')">🚀 AI 生成</button>';
    h += '</div>';
    el.innerHTML = h;
    // 已有角色：加载角色卡与本地存档（关系/经历/对象人物）；新作品则等待用户点「选择角色」
    if (s.char) {
      选择角色(s.char);
    } else {
      刷新经历chips();
    }
    刷新关系chips();
    刷新经历详情();
    if (话语行) 自动匹配话语();   // 首次进创作页：按当前角色自动匹配同名话语（手选过则不动）
  }

  // ===== chips 交互 =====
  function 同步chips() {
    var root = document.getElementById(cfg.viewContentId);
    if (!root) return;
    root.querySelectorAll('.tag-chip').forEach(function(c) {
      if (c.hasAttribute('data-kind')) c.classList.toggle('tag-active', 编辑状态.kind === c.getAttribute('data-kind'));
      else if (c.hasAttribute('data-theme')) {
        if (主题多选) {
          var arr = Array.isArray(编辑状态.theme) ? 编辑状态.theme : [];
          c.classList.toggle('tag-active', arr.indexOf(c.getAttribute('data-theme')) >= 0);
        } else {
          c.classList.toggle('tag-active', 编辑状态.theme === c.getAttribute('data-theme'));
        }
      }
      else if (c.hasAttribute('data-tone')) c.classList.toggle('tag-active', 编辑状态.tone === c.getAttribute('data-tone'));
      else if (c.hasAttribute('data-scene')) c.classList.toggle('tag-active', 编辑状态.scene === c.getAttribute('data-scene'));
      else if (c.hasAttribute('data-lang-style')) c.classList.toggle('tag-active', 读语言风格().indexOf(c.getAttribute('data-lang-style')) >= 0);
      else if (c.hasAttribute('data-speech-use')) c.classList.toggle('tag-active', 读使用话语());
    });
  }
  function 切换主题(t) {
    if (主题多选) {
      var arr = Array.isArray(编辑状态.theme) ? 编辑状态.theme : [];
      arr = arr.indexOf(t) >= 0 ? arr.filter(function(x){ return x !== t; }) : arr.concat([t]);
      编辑状态.theme = arr;
    } else {
      编辑状态.theme = (编辑状态.theme === t) ? '' : t;
    }
    自动标题();
    编辑字段('theme', 编辑状态.theme);
  }
  function 切换语气(t) {
    编辑状态.tone = (编辑状态.tone === t) ? '' : t;
    编辑字段('tone', 编辑状态.tone);
  }
  function 切换场合(t) {
    编辑状态.scene = (编辑状态.scene === t) ? '' : t;
    编辑字段('scene', 编辑状态.scene);
  }
  function 切换模式(k) {
    var m = null;
    (双模式 || []).forEach(function(x) { if (x.key === k) m = x; });
    if (!m) return;
    编辑状态.kind = k;
    // 清掉新模式下不存在的主题/场合
    if (m.主题选项 && 编辑状态.theme) {
      var arr = Array.isArray(编辑状态.theme) ? 编辑状态.theme : [编辑状态.theme];
      编辑状态.theme = arr.filter(function(t) { return m.主题选项.indexOf(t) >= 0; });
      if (!编辑状态.theme.length) 编辑状态.theme = 主题多选 ? [] : '';
    }
    if (m.场合选项 && 编辑状态.scene && m.场合选项.indexOf(编辑状态.scene) < 0) 编辑状态.scene = '';
    自动标题();
    编辑字段('kind', k);
    // 重渲染表单以切换主题/场合 chips（保留其余状态）
    var vEl = document.getElementById(cfg.viewContentId);
    if (vEl) 渲染表单(vEl, 编辑状态);
  }
  function 随机灵感() {
    // ① 对象人物（随机选一个，替换当前选择）
    var 随机对象名 = '';
    if (编辑状态.relations && 编辑状态.relations.length) {
      var rel = 编辑状态.relations[Math.floor(Math.random() * 编辑状态.relations.length)];
      if (rel && rel.name) { 随机对象名 = rel.name; 编辑状态.targets = [rel.name]; }
      else { 编辑状态.targets = []; }
    } else { 编辑状态.targets = []; }
    编辑字段('targets', (编辑状态.targets || []).slice());
    刷新关系chips();
    刷新关系详情();
    // ② 对象经历（随机选一条，替换当前选择）
    if (编辑状态.experiences && 编辑状态.experiences.length) {
      var ei = Math.floor(Math.random() * 编辑状态.experiences.length);
      编辑状态.selectedExps = [编辑状态.experiences[ei]];
    } else { 编辑状态.selectedExps = []; }
    编辑字段('selectedExps', (编辑状态.selectedExps || []).slice());
    刷新经历chips();
    刷新经历详情();
    // ③ 主题/语气/场合（随机）
    var 当前主题选项 = 有效主题选项();
    if (主题多选) {
      var picks = [];
      if (当前主题选项.length) picks.push(当前主题选项[Math.floor(Math.random() * 当前主题选项.length)]);
      if (当前主题选项.length > 1 && Math.random() < 0.6) picks.push(当前主题选项[Math.floor(Math.random() * 当前主题选项.length)]);
      编辑状态.theme = picks;
    } else if (当前主题选项.length) {
      编辑状态.theme = 当前主题选项[Math.floor(Math.random() * 当前主题选项.length)];
    }
    if (语气选项 && 语气选项.length) 编辑状态.tone = 语气选项[Math.floor(Math.random() * 语气选项.length)];
    var 当前场合选项 = 有效场合选项();
    if (当前场合选项 && 当前场合选项.length) 编辑状态.scene = 当前场合选项[Math.floor(Math.random() * 当前场合选项.length)];
    // 语言风格：不参与随机灵感 —— 语言风格默认不启用，只能由用户点 chip / 🤖 建议 / ＋ 自定义来选
    自动标题();
    编辑字段('theme', 编辑状态.theme);
    编辑字段('tone', 编辑状态.tone);
    编辑字段('scene', 编辑状态.scene);
    同步chips();
    toast('灵感已填入：' + (主题显示(编辑状态.theme)||'') + (编辑状态.tone ? ' · ' + 编辑状态.tone : '') + (编辑状态.scene ? ' · ' + 编辑状态.scene : '') + (随机对象名 ? ' · 对象：' + 随机对象名 : '') + ((编辑状态.selectedExps||[]).length ? ' · 经历' : ''));
  }

  // ===== AI 提示词组装 =====
  function 角色上下文() {
    var ref = 编辑状态.charRef;
    if (!ref) return '';
    return (typeof window.角色卡全部 === 'function') ? 角色卡全部(ref) : JSON.stringify(ref || {});
  }
  // 主题/语气释义（选中项附释义，多选时逐条列出）：进 AI 参数段，让模型知道这一项要求的是什么，而不是只看到一个词
  function 主题说明(v) {
    var arr = Array.isArray(v) ? v : (v ? [v] : []);
    var 有 = arr.filter(function(t) { return 角色台本主题解释表[t]; });
    if (!有.length) return '';
    return '\n' + 有.map(function(t) { return '　· ' + t + '：' + 角色台本主题解释表[t]; }).join('\n');
  }
  function 语气说明(t) {
    if (!t || !角色台本语气解释表[t]) return '';
    return '\n　· ' + t + '：' + 角色台本语气解释表[t];
  }
  function 参数上下文() {
    var ctx = '';
    if (编辑状态.char) ctx += '角色：' + 编辑状态.char + '\n';
    if (编辑状态.theme && (主题多选 ? 编辑状态.theme.length : 编辑状态.theme)) ctx += 主题标签 + '：' + 主题显示(编辑状态.theme) + 主题说明(编辑状态.theme) + '\n';
    if (编辑状态.tone) ctx += '语气：' + 编辑状态.tone + 语气说明(编辑状态.tone) + '\n';
    if (编辑状态.scene) ctx += '场合：' + 编辑状态.scene + '\n';
    if (语言风格选项) ctx += 语言风格上下文();
    // 角色话语段：默认启用，附上所选角色在原作里的原话（只作说话调子的参照）
    if (话语行 && 读使用话语()) ctx += 角色话语上下文(读话语键());
    if (对象模式 && (编辑状态.targets || []).length) ctx += '对象人物：' + (编辑状态.targets || []).join('、') + '\n';
    var direction = ((document.getElementById(cfg.prefix + 'Direction')||{}).value || '').trim();
    if (direction) ctx += '方向：' + direction + '\n';
    // 创作卡上的最少字数选项（默认 500）
    var minW = 读取最少字数();
    if (minW > 0) ctx += '最少字数：正文不少于 ' + minW + ' 字，宁长勿短\n';
    return ctx;
  }
  // 角色素材上下文：只注入「当前选中」的对象人物与该条经历（尊重点选，不再全量倾倒）
  function 去序号(s) { return String(s || '').replace(/^\s*\d+[.、．]\s*/, ''); }
  function 角色素材上下文() {
    var parts = [];
    var sel = 选中对象表();
    var selExp = 选中经历表();
    // 对象人物（仅选中的那些；含本地存档的 级别关系/语言风格/交集经历/性爱经历）
    if (对象模式 && sel.length) {
      var rels = [];
      sel.forEach(function(name) {
        var rel = null;
        (编辑状态.relations || []).forEach(function(r) { if (r && r.name === name) rel = r; });
        if (rel) rels.push(rel);
      });
      var ts = [];
      rels.forEach(function(rel) {
        var t = rel.name + (rel.relation ? '（' + rel.relation + '）' : '');
        if (rel.style) t += '\n　语言风格：' + rel.style;
        if (rel.events) t += '\n　交集经历：' + rel.events;
        if (rel.sex) t += '\n　性爱经历：' + rel.sex;
        ts.push(t);
      });
      if (ts.length) parts.push('【对象人物】' + ts.join('\n\n'));
    }
    // 角色经历（仅选中的那些，剥掉起始序号）
    if (selExp.length) {
      parts.push('【角色经历】' + selExp.map(function(e) { return '・ ' + 去序号(e); }).join('\n'));
    }
    return parts.length ? '\n\n' + parts.join('\n\n') : '';
  }

  // ===== AI 字段注册 =====
  if (typeof registerAiField !== 'undefined') {
    // 语言风格建议（选题卡·语言风格行 🤖）：按角色与选题从技法库里挑 3-5 条追加进已选
    if (语言风格选项) registerAiField(cfg.aiFieldId + 'LangStyle', cfg.aiLabel + '语言风格建议', function() {
      var ctx = '作品类型：' + (cfg.aiLabel || '');
      if (编辑状态.char) ctx += '\n角色：' + 编辑状态.char;
      var m = 当前模式();
      if (m) ctx += '\n模式：' + m.label;
      ctx += '\n' + 主题标签 + '：' + (主题显示(编辑状态.theme) || '（未选）') + 主题说明(编辑状态.theme);
      if (编辑状态.tone) ctx += '\n语气：' + 编辑状态.tone + 语气说明(编辑状态.tone);
      if (编辑状态.scene) ctx += '\n场合：' + 编辑状态.scene;
      if (对象模式 && (编辑状态.targets || []).length) ctx += '\n对象人物：' + (编辑状态.targets || []).join('、');
      var cur = 读语言风格全部();
      ctx += '\n备选语言风格（每种都是一整套用词与称谓取向；只能从中挑选，风格名须一字不差）：\n' + 语言风格选项.map(function(n) {
        var e = 语言风格条目查(n);
        return e ? ('【' + e.名 + '·用词与称谓】' + e.用词 + '\n【' + e.名 + '·示范台词（只是语感参照，禁止照抄整句）】\n' + e.例) : ('【' + n + '】（自定义风格）');
      }).join('\n');
      if (cur.length) ctx += '\n已选语言风格：' + cur.join('、') + '（可保留，也可换更合适的）';
      return renderPrompt('lang_style_suggest', { charCtx: 角色上下文(), ctx: ctx });
    }, { fillFn: function(d) {
      if (!d) { toast('语言风格建议为空'); return; }
      var names = 语言风格选项;
      var got = Array.isArray(d.styles) ? d.styles.filter(function(n){ return names.indexOf(n) >= 0; }) : [];
      if (!got.length) { toast('AI 未给出可用的语言风格'); return; }
      var arr = 读语言风格();
      got.forEach(function(n) { if (arr.indexOf(n) < 0) arr.push(n); });
      写语言风格(arr);
      同步chips();
      toast('已选语言风格：' + got.join('、') + (d.rationale ? '（' + d.rationale + '）' : ''));
    }});
    registerAiField(cfg.aiFieldId, cfg.aiLabel, function() {
      var vars = { ctx: 参数上下文(), charCtx: 角色上下文() };
      if (经历模式) vars.experience = 选中经历表().map(function(e) { return 去序号(e); }).join('\n');
      var r = renderPrompt(有效生成提示词(), vars);
      // 统一追加：角色素材上下文（选中对象/经历）+ 通用规则块
      r.user = (r.user || '') + 角色素材上下文() + '\n\n' + 通用规则块;
      return r;
    }, { fillFn: function(d) {
      if (!d) return;
      var s = 编辑状态;
      if (d.title) s.title = d.title;
      if (d.theme) s.theme = (主题多选 && typeof d.theme === 'string') ? [d.theme] : d.theme;
      if (d.content) s.content = d.content;
      if (d.tags) s.tags = d.tags;
      var titleEl = document.getElementById(cfg.prefix + 'Title');
      if (titleEl) titleEl.value = s.title || '';
      var contentEl = document.getElementById(cfg.prefix + 'Content');
      if (contentEl) contentEl.value = s.content || '';
      同步chips();
      var newTitle = (s.title || '').trim();
      if (!newTitle) {
        s.title = (s.char || '角色') + ' · ' + (s.theme || '未命名');
        newTitle = s.title;
        var titleEl2 = document.getElementById(cfg.prefix + 'Title');
        if (titleEl2) titleEl2.value = s.title;
      }
      var next = function() {
        if (_editTitle) {
          Store[cfg.storeKey].get(_editTitle).then(function(m) {
            m = m || {}; Object.assign(m, 当前数据快照());
            Store[cfg.storeKey].save(_editTitle, m).then(function(){});
          });
        } else {
          Store[cfg.storeKey].save(s.title, 当前数据快照()).then(function(){ _editTitle = s.title; });
        }
        toast('AI 提案已填入，可修改后保存');
      };
      if (_editTitle && newTitle && newTitle !== _editTitle) {
        var oldTitle = _editTitle;
        _editTitle = null;
        Store[cfg.storeKey].delete(oldTitle).catch(function(){}).then(function() { next(); });
      } else {
        next();
      }
    }});
    // 经历提取（全板块通用；可重新生成覆盖本地存档）
    registerAiField(cfg.aiFieldId + 'Extract', cfg.aiLabel + '·经历提取', function() {
      if (!编辑状态.charRef) { toast('请先选择角色'); return null; }
      return renderPrompt('role_experience_extract', { charCtx: 角色上下文() });
    }, { fillFn: function(d) {
      if (!d || !Array.isArray(d.experiences)) { toast('提取结果为空'); return; }
      编辑状态.experiences = d.experiences;
      编辑状态.selectedExps = [];   // 重新提取后重置选中
      编辑字段('selectedExps', []);
      刷新经历chips();
      刷新经历详情();
      保存角色提取({ experiences: d.experiences });
      toast('已提取 ' + d.experiences.length + ' 段性爱经历，已本地存档');
    }});
    // 自制经历（全板块通用；AI 按用户要求创作一段经历，加入列表并本地存档）
    registerAiField(cfg.aiFieldId + 'Custom', cfg.aiLabel + '·自制经历', function() {
      var req = ((document.getElementById(cfg.prefix + 'CustomReq')||{}).value || '').trim();
      if (!req) { toast('请先填写经历要求'); return null; }
      return renderPrompt('role_experience_custom_gen', { charCtx: 角色上下文(), req: req });
    }, { fillFn: function(d) {
      if (!d || !d.experience) { toast('生成结果为空'); return; }
      编辑状态.experiences = (Array.isArray(编辑状态.experiences) ? 编辑状态.experiences : []).concat([d.experience]);
      var sel = 选中经历表();
      if (sel.indexOf(d.experience) < 0) sel.push(d.experience);
      编辑字段('selectedExps', sel.slice());
      刷新经历chips();
      刷新经历详情();
      保存角色提取({ experiences: 编辑状态.experiences });
      toast('自制经历已加入并本地存档');
    }});
    // 关系提取（全板块通用；可重新生成覆盖本地存档；级别关系/语言风格/交集经历/性爱经历）
    registerAiField(cfg.aiFieldId + 'ExtractRel', cfg.aiLabel + '·关系提取', function() {
      if (!编辑状态.charRef) { toast('请先选择角色'); return null; }
      return renderPrompt('role_relation_extract', { charCtx: 角色上下文() });
    }, { fillFn: function(d) {
      if (!d || !Array.isArray(d.relations) || !d.relations.length) { toast('提取结果为空'); return; }
      编辑状态.relations = d.relations;
      保存角色提取({ relations: d.relations });
      // 提取后不自动选中，保持未选择状态，由用户点选
      刷新关系chips();
      刷新关系详情();
      toast('已提取 ' + d.relations.length + ' 个关系人物（级别关系/语言风格/交集经历/性爱经历），已本地存档');
    }});
    // 自制人物（全板块通用；AI 按要求设定一个假设人物，加入关系列表并本地存档）
    registerAiField(cfg.aiFieldId + 'CustomRel', cfg.aiLabel + '·自制人物', function() {
      var req = ((document.getElementById(cfg.prefix + 'PersonReq')||{}).value || '').trim();
      if (!req) { toast('请先描述要设定的人物'); return null; }
      return renderPrompt('role_relation_custom_gen', { charCtx: 角色上下文(), req: req });
    }, { fillFn: function(d) {
      if (!d || !d.name) { toast('生成结果为空'); return; }
      var rel = { name: d.name, relation: d.relation || '', style: d.style || '', events: d.events || '', sex: d.sex || '' };
      编辑状态.relations = (Array.isArray(编辑状态.relations) ? 编辑状态.relations : []).concat([rel]);
      保存角色提取({ relations: 编辑状态.relations });
      var selT = 选中对象表();
      if (selT.indexOf(rel.name) < 0) selT.push(rel.name);
      编辑字段('targets', selT.slice());
      刷新关系chips();
      刷新关系详情();
      toast('已生成假设人物「' + rel.name + '」，已本地存档');
    }});
  }

  // ===== 窗口导出 =====
  window[cfg.windowPrefix + '切换视图'] = 切换视图;
  window[cfg.windowPrefix + '新创作'] = 新创作;
  window[cfg.windowPrefix + '筛选角色'] = 筛选角色;
  window[cfg.windowPrefix + '编辑项'] = 编辑项;
  window[cfg.windowPrefix + '删除项'] = 删除项;
  window[cfg.windowPrefix + '阅读'] = 阅读;
  window[cfg.windowPrefix + '复制全文'] = 复制全文;
  window[cfg.windowPrefix + '编辑字段'] = 编辑字段;
  window[cfg.windowPrefix + '选择角色'] = 选择角色;
  window[cfg.windowPrefix + '打开角色选择'] = 打开角色选择;
  window[cfg.windowPrefix + '切换主题'] = 切换主题;
  window[cfg.windowPrefix + '切换语气'] = 切换语气;
  window[cfg.windowPrefix + '切换场合'] = 切换场合;
  window[cfg.windowPrefix + '切换语言风格'] = 切换语言风格;
  window[cfg.windowPrefix + '添加语言风格'] = 添加语言风格;
  window[cfg.windowPrefix + '切换模式'] = 切换模式;
  window[cfg.windowPrefix + '切换使用角色话语'] = 切换使用角色话语;
  window[cfg.windowPrefix + '选取话语'] = 选取话语;
  window[cfg.windowPrefix + '清除话语'] = 清除话语;
  window[cfg.windowPrefix + '切换字数'] = 切换字数;
  window[cfg.windowPrefix + '随机灵感'] = 随机灵感;
  window[cfg.windowPrefix + '同步chips'] = 同步chips;
  window[cfg.windowPrefix + '设置对象'] = 设置对象;
  window[cfg.windowPrefix + '选择关系'] = 选择关系;
  window[cfg.windowPrefix + '选择经历'] = 选择经历;
  window[cfg.windowPrefix + '刷新经历详情'] = 刷新经历详情;

  return { 切换视图: 切换视图, 当前视图: function(){ return 当前视图; } };
}
window.角色台本工厂 = 角色台本工厂;
if (!Store.roleExtract) Store.roleExtract = createStore('roleExtract');
