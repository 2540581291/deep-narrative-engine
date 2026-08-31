// 深度-叙事引擎 · 角色卡模块（共享核心）
// 子模块文件：
//   generate.js  — ✨ 生成标签页（LLM 定制生成）
//   storage.js   — 📋 暂存标签页（手动暂存 + 自动保存的角色）
//   history.js   — 📚 纪事标签页（角色库浏览）
//
// 模块级变量在此声明，子模块共享

var 角色生成类别 = 'female';
var 角色生成阶段 = 'input';       // input | outline-loading | outline | full-loading | full | error
var 角色生成描述 = '';             // 当前输入框描述文本，跨阶段保留
var 角色生成概要 = null;        // 第一步的概要对象（仅身份章节）
var 角色生成结果 = null;         // { _char: {...} } 完整角色 / { _error, _raw, _fromPhase }
var 角色库性别 = 'female';    // 角色库当前选中的性别 tab
var 角色暂存最新ID = null;   // 最近一次自动保存的角色 ID（角色名），用于加载/审计等操作
var 角色当前标签 = 'list';   // 'list' | 'inspire' | 'generate' | 'char-discuss' | 'novel-extract' | 'importexport'

// catKey 映射
var _G = '<svg class="gender-svg" viewBox="0 0 20 20" width="18" height="18"><circle cx="10" cy="6.5" r="3.8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 10.3v5.5M7.5 14h5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
var _M = '<svg class="gender-svg" viewBox="0 0 20 20" width="18" height="18"><circle cx="9" cy="9" r="3.8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 12l5-5M14.5 7h3V10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var _F = '<svg class="gender-svg" viewBox="0 0 20 20" width="18" height="18"><path d="M10 15.5c-2.5-2-5-3.8-5-6C5 7 7 5.5 10 7.5c3-2 5-0.5 5 2.5s-2.5 3.5-5 5.5z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M10 7.5v3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
var _H = '<svg class="gender-svg" viewBox="0 0 20 20" width="18" height="18"><circle cx="6.5" cy="6" r="3" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M6.5 9v5M4.5 12.5h4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="13.5" cy="6" r="3" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M13 9l3 3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
var 角色类别映射 = {
  female: { label: '女性', icon: _G },
  male:   { label: '男性', icon: _M },
  femboy: { label: '伪娘', icon: _F },
  futa:   { label: '扶她', icon: _H },
};
var 类别键数组 = ['female', 'male', 'femboy', 'futa'];

// 快速选择芯片
var 角色快速芯片 = [
  { group: '世界观', chips: [
    { text: '修仙', append: '灵气浓郁、万宗林立的东方修仙世界，以修炼为核心的社会体系。强者为尊的生存法则下，追求长生的道路上充满了机缘与凶险，道心与欲望的博弈是每个修士终身的课题。' },
    { text: '魔幻', append: '剑与魔法并存的经典奇幻世界，多智慧种族共同生活在这片大陆上。教廷、魔法学院、各国王室构成错综复杂的权力网络，魔法既是恩赐也是诅咒。' },
    { text: '赛博朋克', append: '高科技低生活的反乌托邦未来都市，巨型财阀掌控一切。义体改造、虚拟网络、霓虹灯海构成了城市的外貌，底层在钢筋水泥的缝隙中挣扎求存，人性在技术的冲击下面临前所未有的异化。' },
    { text: '末日废土', append: '文明覆灭后的残酷新世界，核辐射尘遮蔽了天空。幸存者在废土上艰难求生，资源是唯一的信仰，弱肉强食是唯一的法则，秩序的废墟上滋生出野蛮而顽强的生命力。' },
    { text: '古代东方', append: '拥有几千年文明积淀的东方古风世界，皇权至上、礼教森严。家族门第决定了一个人的命运，在儒家伦理和道德规范的外衣下，人性的复杂与欲望的暗流构成了这个世界的底色。' },
    { text: '现代都市', append: '与当代现实世界无异的现代大都市，钢铁森林中高楼林立。信息爆炸、节奏飞快、人与人之间的关系既近在咫尺又远在天涯，无孔不入的商业社会里物质繁荣与精神空虚同样触目。' },
    { text: '中世纪欧洲', append: '以中世纪欧洲为原型的剑与铠甲时代，城堡矗立在山巅、骑士效忠于领主。宗教的威严笼罩着每一寸土地，贵族与平民的阶级壁垒坚不可摧，战争与瘟疫是时代背景板上最深的阴影。' },
    { text: '星际科幻', append: '人类文明跨入星辰大海的远大未来，星际航行和基因改造已成为日常。联邦、帝国、自由星系之间维持着微妙的平衡，面对浩瀚宇宙和未知文明，人类的身份和意义正在被重新定义。' },
    { text: '江湖武侠', append: '刀光剑影的快意江湖，各大门派割据一方、武林秘籍人人觊觎。侠客以义字当头、以剑说话，恩怨情仇交织成一张逃不出的网，江湖不仅是打打杀杀更是人情世故。' },
    { text: '宫廷权谋', append: '以天子宫殿为核心运作的权力中枢，龙椅之下是万丈深渊。后宫佳丽与朝臣勋贵交织成密不透风的权力网络，一颦一笑都可能是局、一步一履都可能是棋。' },
    { text: '校园青春', append: '以学校为舞台的青春世界，课桌和黑板框出了最纯真的年代。友情的建立与破裂、懵懂的好感与暗恋、对未来的憧憬与迷茫，所有纯粹而强烈的情感都发生在这个看似平静的象牙塔里。' },
    { text: '黑帮暗巷', append: '脱序于法律之外的地下社会，帮派以暴力和利益维系着自己的秩序。枪支、钞票、背叛构成了日常，在这个规则与无规则并存的世界里，每一个爬上去的人脚下都踩着累累白骨。' },
    { text: '蒸汽朋克', append: '以蒸汽机械为技术核心的复古未来世界，齿轮、管道和黄铜构成了独特的视觉美学。工业革命带来了前所未有的技术飞跃，也撕开了贫富差距与社会矛盾的深渊。' },
    { text: '克苏鲁神话', append: '在洛夫克拉夫特式的恐怖世界观中，地球只是远古存在们打盹时的玩物。人类引以为傲的文明和理智在不可名状的存在面前脆弱如纸，越接近真相就越接近疯狂。' },
    { text: '西方奇幻', append: '受欧洲中世纪启发的高奇幻世界，骑士、恶龙、魔法构成了史诗的底色。各个王国与种族之间既有血火交融的战争也有剪不断理还乱的联盟与背叛。' },
    { text: '民国风云', append: '清朝覆灭后的民国乱世，旧的秩序被打破而新的尚未建立。西洋思潮涌入、军阀各据一方、租界里灯红酒绿、战火中生灵涂炭，这是一段充满矛盾和可能性的激荡岁月。' },
    { text: '原始部落', append: '远古蒙昧的蛮荒世代，部落是人类社会的雏形。火与石器是最高的技术成就，自然之力被神化崇拜，巫术和传统维系着部族的秩序，生存的欲望是驱动一切的原始力量。' },
  ]},
  { group: '种族', chips: [
    { text: '精灵', append: '长生不老的类人种族，以修长的尖耳朵为最显著的外貌标志。容貌普遍精致出众，与自然之力有着深层的共鸣，拥有悠长的寿命和与之相应的从容心态。' },
    { text: '兽娘', append: '兼具哺乳动物特征和人类形态的混血种族，保留着毛茸茸的兽耳和尾巴。感官比人类敏锐得多，保留着动物本能的直觉和野性的活力，情感和欲望的表达比人类更加直接。' },
    { text: '恶魔', append: '来自地下深渊或异界的魔族，头顶犄角、暗色肌肤是常见的种族特征。天生精通诱惑与契约的技艺，拥有超越凡人的魔法力量和悠长的寿命。' },
    { text: '天使', append: '生活在高天之上的圣光造物，背生洁白的羽翼是种族标志。神圣的能量环绕周身，天然倾向于秩序与光明，拥有强大的神圣魔法力量，严格的神圣法则意味着对欲望的绝对禁忌。' },
    { text: '龙族', append: '身负远古巨龙血脉的超凡种族，额头生有龙角、瞳孔呈竖瞳是龙裔特征。拥有远超人类的身体强度和魔法抗性，体温偏高且新陈代谢极为旺盛，伴随强大力量的是同样强烈的激情。' },
    { text: '人鱼', append: '上半身为人类女性形态、下半身为鱼尾的水中种族。生活在深海或沿岸水域，以美妙的歌喉和绝美的容貌闻名，其生理构造和生活习性与人类存在显著差异。' },
    { text: '魅魔', append: '以情欲为能量来源的恶魔亚种，拥有随意调整自身外貌以迎合目标欲望的能力。天生精通诱惑之术，在交合过程中吸取精气或生命力，是欲望本身的人格化体现。' },
    { text: '哥布林', append: '身材矮小皮肤呈绿色的智慧种族，以部落为单位聚居生活。繁殖能力极强、适应力惊人，个体战力不算强但以数量和人海战术取胜。' },
    { text: '不死族', append: '从死亡状态被重新唤醒的存在，身体维持着死亡时的状态因而体温冰冷、肤色苍白。对生者的世界既向往又疏离，对生命和死亡的认知与活着时已经完全不同。' },
    { text: '仿生人', append: '以机械和人工智能技术制造的类人存在，外观与人类无异但躯体由合金和仿生材料构成。搭载着高度发达的人工意识，在逻辑与情感、程序与自由意志之间寻找着自己的定位。' },
    { text: '吸血鬼', append: '被永恒诅咒的夜之贵族，以鲜血为食、以黑夜为袍。苍白如瓷的肌肤和不老的容颜是永生的证明也是永恒的惩罚，对温度的感知已经在漫长的岁月中褪色，只有温热的颈动脉还能让死寂的心泛起涟漪。' },
    { text: '猫娘', append: '拥有人类与猫科动物双重特征的混血族裔，头顶一对灵敏的三角耳、身后拖着一条表达情绪的长尾。天性好奇贪玩、身体柔韧度惊人，呼噜声是放松的信号、炸毛是警觉的标志，感官敏锐到能听见最轻的耳语。' },
    { text: '狐妖', append: '修炼千年的狐族化形而成的妖媚存在，天生精通幻术与魅惑之道。身后蓬松的狐尾数量代表道行深浅，一颦一笑间带着勾魂摄魄的妖气，越是美丽的狐妖越是危险的代名词。' },
    { text: '史莱姆', append: '由胶状物质构成的软体魔物，形态可以随环境自由变化。身体透明或半透明呈现果冻般的质感，触碰时冰凉滑腻、可以延展成任何形状，没有固定骨架意味着没有致命要害。' },
    { text: '矮人', append: '身高只有人类一半但体格粗壮如铁砧的古老种族，留着浓密的大胡子和精湛的锻造手艺。性格固执豪爽、酒量和脾气一样大，在地下的矿坑和熔炉边度过了整个文明的兴衰。' },
    { text: '妖精', append: '指节大小长着透明翅翼的自然精灵，生活在花丛和蘑菇圈之间。寿命悠长但心智永远带着几分孩童般的顽皮和任性，对人类的善恶观念没有概念，全凭当下的喜好行事。' },
    { text: '翼人', append: '背生双翼的天空族裔，骨骼中空因而体重极轻。在高山或云端筑巢而居，视力可以看清数公里之外的猎物，羽毛的色泽和光泽是翼人族审美和健康的最高标准。' },
    { text: '鬼族', append: '头顶犄角、肤色偏深的战斗民族，以力量和勇武为至高信仰。性情暴烈而直爽，崇尚用拳头解决一切问题，体温比人类高出数度、血液在黑暗中泛着微弱的荧光。' },
    { text: '蛇妖', append: '上半身为人形、下半身为蛇尾的古老年裔，蜕皮即是一次重生。冷血动物的体温使肌肤永远冰凉光滑，分叉的舌尖能嗅到空气中的情绪激素，缠绕绞杀的本能刻在每一块鳞片里。' },
  ]},
  { group: '家庭背景', chips: [
    { text: '乞讨', append: '出身社会最底层的乞丐家庭，从有记忆起就以乞讨为生。没吃过一顿饱饭没穿过一件完整的衣服，尊严在生存面前一文不值，活着本身就需要拼尽全力。' },
    { text: '负债', append: '一出生就背负着家族世代的巨额债务，人生从负数开始。每一口呼吸都在增加利息，身体和未来早就被抵押干净，债主的催逼是每天睁眼后第一个听到的声音。' },
    { text: '贫苦', append: '赤贫家庭出身，终日为下一顿饭发愁的底层生活。在匮乏中长大对物质的渴望深入骨髓，没有试错的资本也没有跌倒后爬起来的余力。' },
    { text: '平民', append: '最寻常不过的普通人家，不穷不富不显不隐。没有背景没有资源没有人脉，一切都是自己一步一个脚印挣出来的，踏实的平庸中有一种沉默的力量。' },
    { text: '小康', append: '衣食无忧的中产之家，物质安稳精神充裕。在温室中长大因而对人心险恶缺乏切身体验，好人家出身的乖孩子，善良天真但也脆弱得不堪一击。' },
    { text: '权贵', append: '出身于一地一方的权力家族，从小耳濡目染权力的运作规则。家族的一张条子能让普通人少奋斗一辈子，但也从出生就被绑在了家族利益的战车上。' },
    { text: '豪门', append: '传承超过百年的豪门望族，产业和人脉渗透各行各业的毛细血管。流淌着贵族的血液从出生就被当作继承人培养，接受最精英的教育也面对最残酷的内部倾轧。' },
    { text: '皇族', append: '统治家族血脉的正统继承人，龙椅上流淌着你的血。自幼在宫廷礼仪和权力斗争的刀尖上长大，享受着至高无上的尊荣也承受着皇家无親的宿命。' },
    { text: '幕后主宰', append: '极少有人知其存在的世界级暗中操盘手，隐于一切权力结构的阴影最深处。国家元首的任命、全球资本的流向、甚至战争的爆发与平息，都可能是你闲庭信步间的一步棋。' },
  ]},
  { group: '角色职业-常规', chips: [
    { text: '教师', append: '戴金丝眼镜的知识分子，讲台上端庄知性学识渊博，习惯于掌控课堂的主导地位。言行举止间透着为人师表的优雅与威信，制服之下的真实欲望与讲台上的端庄形成鲜明对比，知性的气质下藏着不为人知的另一面。' },
    { text: '学生', append: '正值青春年华的在校学生，穿着校服洋溢着朝气与活力。对世界充满好奇又带着几分叛逆，外表青涩纯真但心智正在飞速成长的阶段。身体和心灵都处在人生最具可塑性的时期，也是最容易被环境和他人塑造的阶段。' },
    { text: '医师', append: '身穿白大褂的医疗工作者，理性冷静对人体构造了如指掌。见惯了赤裸的躯体因而对肉体有超乎常人的熟悉感，职业性的触碰中带着令人安心的温柔。长期与生死打交道使她对人性深处的欲望有着冷静而通透的洞察力。' },
    { text: '护士', append: '穿着粉色制服的医护助手，温柔耐心是职业赋予的标签。日常工作中免不了与患者的肢体接触和亲密距离，习惯了他人赤裸的身体和脆弱的姿态。口罩上方那双含笑的眼睛藏着职业性的温和与不经意间流露的妩媚。' },
    { text: '商人', append: '西装革履的生意人，精明世故善于算计八面玲珑。在社会的大染缸里摸爬滚打多年深谙人情世故，利益至上是刻在骨子里的信条。财富和权力的游戏里一切都可量化包括肉体，对交易的艺术有着直觉般的精通。' },
    { text: '科学家', append: '理性至上的科研工作者，智力超群逻辑缜密常年泡在实验室里。思维方式异于常人的冷静与分析性，对未知领域有无穷的好奇心和探索欲。独处研究让社交能力有所退化但观察力极其敏锐，禁欲系外表下藏着最狂野的想象力。' },
    { text: '女仆', append: '身着制服的专职家政侍从，训练有素举止规范忠诚可靠。习惯了以服从和服务为天职，察言观色的能力一流。永远出现在需要的时候消失在不需要的时候，守口如瓶是职业素养的核心，低眉顺眼的外表下可能藏着不为人知的自我。' },
    { text: '秘书', append: '穿着一步裙和高跟鞋的办公室精英，干练高效条理清晰。作为老板最亲近的助手掌握着公司最多的秘密，永远妆容精致举止得体是职业本能。在权力最近的地方工作，最清楚成功人士光鲜外表背后藏着多少见不得光的角落。' },
    { text: '主播', append: '镜头前光彩照人的网络主播，靠颜值和才艺吃饭的流量玩家。直播间的美颜滤镜背后是精心设计的人设和话术，打赏金额决定了今天笑容的真诚度，私信里的露骨邀约多到看不过来。' },
    { text: '模特', append: '靠身体吃饭的衣架子，站在聚光灯下被无数双眼睛审视和觊觎。对自己的身体有超乎常人的掌控力和展示欲，习惯了在他人炽热的目光中保持优雅和从容，肉体即是谋生的资本。' },
    { text: '空姐', append: '穿着制服在高空服务的空中乘务员，经过严格训练的职业微笑永远挂在脸上。万米高空中的密闭空间里制服代表着权威与禁欲的反差，见惯了头等舱里衣冠楚楚之人的另一副嘴脸。' },
    { text: '律师', append: '以唇枪舌剑为武器的法律从业者，思维缜密言辞锋利逻辑无懈可击。在法庭上为委托人不遗余力地辩护，精通规则也精通如何利用规则的漏洞，理性到近乎冷酷的头脑是最大的武器。' },
    { text: '警察', append: '身着制服维护法纪的公权力执行者，配枪和手铐是权威的象征。见惯了社会最阴暗的角落因而对人性不抱幻想，命令与服从是刻进骨髓的职业本能，制服之下的身体是用高强度训练锻造的。' },
    { text: '画家', append: '用画笔捕捉灵魂的视觉艺术家，画室里堆满了画布和颜料。敏感细腻的神经既是天赋也是诅咒，从人体素描中练就了对每一寸线条和光影的精准把握，审美眼光毒辣到能看穿一切伪装。' },
    { text: '健身教练', append: '在健身房里挥汗如雨的身体雕塑家，每一块肌肉都是自律和欲望的结晶。对人体构造了如指掌——知道每一块肌肉怎么发力也知道每一处敏感点如何被触碰，指导和纠正动作时肢体接触是家常便饭。' },
  ]},
  { group: '角色职业-特殊', chips: [
    { text: '战士', append: '身经百战的老兵或武人，体格强健浑身散发着实战锤炼出的铁血气质。伤疤是岁月的勋章，粗犷的外表下有着战场上磨练出的坚韧意志和直率性格。经历过生死边缘的考验，对肉体和欲望有着直接而坦荡的态度，行动永远快于言语。' },
    { text: '法师', append: '沉浸在元素与魔法之力中的施法者，气质神秘眼神深邃常年与奥秘为伴。长期独处研究使身心变得异常敏感敏锐，理智与情感的天平永远在危险的边缘摇摆。知识渊博但对世俗人情知之甚少，禁欲的长袍下是对未知体验的隐秘渴望。' },
    { text: '公主', append: '出身皇室的高贵血脉，从小在金碧辉煌的宫殿中长大养尊处优不谙世事。举手投足间自然而然地流露出贵族气质与良好教养，天真纯洁得对世界的黑暗面一无所知。被层层保护下长大的温室花朵，有着令人想要呵护与占有并存的矛盾魅力。' },
    { text: '刺客', append: '黑暗中潜行的致命之人，身手敏捷行动无声冷酷而专注。身体经过严苛到非人的训练拥有超常的柔韧度和控制力，对人类的一切弱点——致命的和敏感的都了如指掌。常以各种伪装示人，真实情绪永远藏在波澜不惊的面具之下。' },
    { text: '奴隶', append: '被剥夺了自由身的可怜人，身份卑微但求生意志顽强。经历过命运的无情碾压后学会了隐忍与顺从，但眼底深处依然保留着一丝不曾熄灭的反抗之火。身上残留着苦难磨砺的痕迹，却也因此有着令人心碎的脆弱美感。' },
    { text: '圣女', append: '信奉神明侍奉宗教的圣洁处子，一袭素袍周身散发着禁欲的清冷气息。信仰坚定心性纯洁，对世俗的欲望抱着警惕与本能的排斥。圣洁本身就是一种令人敬畏的美，那双清澈如水的眼眸从未被尘世的污浊沾染，干净到让人自惭形秽。' },
    { text: '忍者', append: '修炼忍术的秘密特工，经过地狱式的身心训练达到了人类极限的掌控力。行动如猫般无声而优雅，在任何极端情况下都能保持绝对的冷静与克制。身份和情感永远隐藏在层层伪装之下，没有人见过面具之下的真实表情和温度。' },
    { text: '海盗', append: '纵横四海的亡命之徒，桀骜不驯崇尚自由不受任何规则的约束。常年海上漂泊使体格强健粗犷，海风和烈日在大地上刻下了沧桑的印记。奉行弱肉强食的丛林法则，豪爽义气的外表下也有着为达目的不择手段的残忍一面。' },
    { text: '贵妇', append: '穿着华服佩戴珠宝的上流社会名媛，举手投足间流露出优渥生活养出的雍容气质。社交场上长袖善舞精通人情世故，用精致的妆容和得体的微笑面对每一个人。富丽堂皇的生活背后是金丝雀般的空虚与长期压抑的隐秘欲望。' },
    { text: '杀手', append: '收钱买命的职业清道夫，冷漠精准高效是吃饭的本钱。情感被训练得像刀刃一样锋利而冰冷，从不和目标产生任何多余的联系。不执行任务时隐匿在人群中与常人无异，那双平静如古井的眼睛里看不到任何情绪的波澜。' },
    { text: '流浪者', append: '没有固定居所也没有确定身份的漂泊者，天为被地为床四海为家。见多识广阅人无数，对人间的冷暖有着最真实也最深刻的体悟。不受世俗规则约束也不被任何关系羁绊，自由到极致的同时也孤独到了极致，身上带着风尘的味道。' },
    { text: '女王', append: '头戴王冠手握权杖的一国之主，坐拥万里江山和千万子民。习惯了生杀予夺的大权和臣民的山呼万岁，威严和气场是与生俱来的血统天赋，没有人敢直视她的眼睛超过三秒。' },
    { text: '魔女', append: '以灵魂为代价换取禁忌知识的女性施法者，指尖流淌着黑魔法的暗影。被主流社会驱逐的异类因而对一切权威充满蔑视，独居深林的日常让身体和感官对自然的律动异常敏锐，禁咒的代价往往写在身体上。' },
    { text: '巫女', append: '侍奉神明、镇守神社的灵媒巫女，身着白衣绯袴手持神乐铃。在神明与凡人之间传递旨意，用舞蹈和祝词沟通彼岸的世界。常年独处于神明的结界之中，纤尘不染的圣洁气息让凡夫俗子望而却步。' },
    { text: '骑士', append: '身披重甲誓死效忠的荣耀战士，剑盾之上刻着家族的徽章。对主人绝对忠诚对敌人绝不手软，荣誉高于生命誓言重于一切。铠甲之内是经过千锤百炼的强韧躯体，卸甲之后的肌肤上遍布着刀剑留下的印记。' },
    { text: '修女', append: '身着黑色修道服发誓侍奉上帝的虔诚信徒，胸前悬挂着银质的十字架。在修道院的钟声和祈祷中度过了与世隔绝的岁月，对肉体的认知仅来自解剖学和告解室里颤抖的忏悔，禁欲的外衣之下信仰与本能日日交战。' },
    { text: '弓手', append: '百步穿杨的远程猎手，弓箭或枪械是身体的延伸。常年训练使双臂和背部的肌肉线条如雕刻般分明，目光锐利到能锁定千米之外的猎物，耐心好到可以为了一个目标潜伏一整天。' },
    { text: '狂战士', append: '在战斗中进入狂怒状态的失控战士，理智被战斗本能完全吞没。平时沉默寡言甚至有些迟钝，一旦进入战斗状态就会变成一台人形绞肉机，疼痛只会让怒火烧得更旺，需要特殊的羁绊才能从失控中被唤醒。' },
    { text: '菩萨', append: '发大愿渡化众生的觉悟者，端坐莲台手持杨枝净瓶的庄严法相之下是悲悯众生的慈悲心。戒律清规束缚着每一寸肉身和每一个念头，佛性与魔性只在一念之间，越是压制欲望反弹时就越是汹涌。' },
    { text: '尼姑', append: '剃度出家的佛门女弟子，青灯古佛木鱼声中度过了整个青春。缁衣芒鞋不施粉黛的朴素外表下是一颗被经文戒律反复洗涤过的凡心，空门之中最难空的恰恰是那颗砰砰跳动着的人心。' },
    { text: '妖王', append: '统御万妖的绝世大妖，修炼了千年万年才走到这一步的丛林法则顶点。妖气冲天令一方生灵颤栗，骨子里是弱肉强食的野兽逻辑，力量和领土是唯一的信仰，对人类的道德和法律嗤之以鼻。' },
    { text: '妓女', append: '以身体为商品的古老职业者，春楼画舫或红灯区里的一盏孤灯。迎来送往中见惯了男人的嘴脸和欲望的丑态，笑容和技巧都已经打磨成了职业化的本能，客人的手在身上游走时心里可能在想着今晚的菜钱。' },
  ]},
  { group: '角色身份', chips: [
    { text: '神明', append: '超越凡物生命层次的神性存在，掌管着某片领域或某种法则的至高权柄。信徒的祈祷是力量的来源之一，凡人的欲望和算计在神明的视角下幼稚得可笑，但神性再高也压不住本能的躁动。' },
    { text: '世界化身', append: '一方世界本身意志的人格化具象，不是神明而是世界本身。举手投足间带着山河的重量和法则的回响，对世间万物的感知如同感受自己身体的每一个角落。' },
    { text: '仙人', append: '飞升之后的超脱存在，已经跳出三界外不在五行中。仙体不染凡尘俗念、仙心不动七情六欲，但正因为在上面待得太久了才会对人间的那点烟火气格外怀念。' },
    { text: '国王', append: '头戴王冠手握权杖的一国之主，坐拥万里江山和千万子民。习惯了生杀予夺的大权和臣民的山呼万岁，威严和气场是与生俱来的血统天赋，没有人敢直视她的眼睛超过三秒。' },
    { text: '贵族', append: '出身显赫的世家子弟，流淌着高贵的血液享受着世袭的特权。从小接受最精英的教育，言行举止间带着与生俱来的优雅和傲慢，社交场上风度翩翩但骨子里视平民如草芥。' },
    { text: '宗主', append: '统御一方修仙门派或势力的最高掌权者，举手投足间带着上位者的威压和世外高人的超然。门下弟子成千上万、一言一行牵动整个宗门的兴衰，站在权力和修为的顶端却也被困在最深的孤独里。' },
    { text: '教主', append: '执掌一方教派的至高领袖，信徒眼中的神之代言人。以信仰为缰绳驾驭着万千教徒的灵魂与财富，神坛之上悲悯众生的圣光背后是铁腕的政治手段。' },
    { text: '偶像', append: '站在聚光灯下的人气明星，舞台上光彩照人举手投足都经过精心设计。公众形象清纯阳光是职业包装的核心，但保持完美人设需要付出常人难以想象的代价。习惯了在镜头前表演的每一分钟，真实自我与台前的光鲜之间隔着巨大的鸿沟。' },
    { text: '主角', append: '被世界意志选中的命运之子，一切剧情围绕你旋转的核心存在。气运加身逢凶化吉、奇遇不断遇难成祥，所有重要角色都与你有着或深或浅的羁绊。' },
  ]},
  { group: '角色实力', chips: [
    { text: '蝼蚁', append: '位于力量体系最底层、最末端的微末存在，任何修行者都可以随意碾死你。没有实力就没有被正眼看待的资格，连被凌辱都要看对方的心情，你的挣扎在强者眼里和虫子没有区别。' },
    { text: '习武', append: '经过长期系统武术淬炼的格斗者，肉身即是兵器。拳风化刃、反应如电，在冷兵器对抗中足以以一当十，但面对超自然力量时仍然力不从心。' },
    { text: '修真', append: '踏入修仙之途的求道者，以天地灵气淬炼肉身与神魂。法术傍身、法宝随行，已经突破了凡人的生命层次，举手投足间带着灵力的威压。' },
    { text: '魔法', append: '掌握了元素之力或奥术知识的施法者，咒语和法印是撬动世界的杠杆。输出上限极高但近身孱弱，力量的边界只取决于天赋和钻研的深度。' },
    { text: '异能', append: '觉醒了超越常理的超自然能力的异变个体，能力的种类千奇百怪。从心灵操控到物质重构、从时间干涉到空间撕裂，每一个异能者都是行走的天灾预备役。' },
    { text: '灭国', append: '单枪匹马就能颠覆一个国家的顶级战力，个人武力凌驾于国家机器之上。跺跺脚地动山摇、挥挥手城摧墙倒，位于力量金字塔最尖端的那个层级。' },
    { text: '隐者', append: '表面平平无奇甚至刻意示弱的当世最强者之一，真实力量深入不可测的领域。从不公开出手但从无败绩，底牌永远比亮出来的多得多，不出手则已一出手就是碾压。' },
    { text: '宗师', append: '将一门技艺或功法练至化境的超凡存在，举手投足间已暗合天地至理。不需要出手，一个眼神就能让对手噤若寒蝉，门下弟子遍布四方，一声令下便可调动半个江湖的力量。' },
    { text: '武者', append: '以武入道的修行中人，内功外功兼修、拳脚兵器皆通。经过千锤百炼的身体反应速度快过意识，筋骨皮肉都淬炼到了凡人的极致境界，距离超凡只差临门一脚的悟性。' },
    { text: '觉醒者', append: '体内沉睡的远古血脉或异界基因被重新激活的超越者，力量以不可控的方式从身体深处涌现。觉醒的过程往往伴随着剧烈的痛苦和身体的异变，力量的上限连自己都不知道在哪里。' },
  ]},
  { group: '年龄', chips: [
    { text: '18岁', append: '十八岁法律意义上的成年起点，拥有了完整民事行为能力。身心发育的成熟度因人而异，刚从中学步入更广阔的天地，一个满载可能性也满载危险的分水岭。' },
    { text: '19岁', append: '十九岁刚刚脱离家庭或中学校园庇护的年纪，开始独立面对社会和人生的各种课题。性观念和价值观在这个阶段最容易受到冲击和重塑，是从青涩走向成熟的关键转折期。' },
    { text: '20岁', append: '二十岁的桃李年华，身心发育基本完成进入了成年早期的稳定阶段。精力充沛适应力强，对性和亲密关系有了更成熟的认知和需求，开始以成年人的方式探索和建立关系。' },
    { text: '21-25岁', append: '二十出头的成年早期阶段，身体状态处在人生的巅峰期。完成了从校园到社会的过渡，开始建立自己的生活方式和亲密关系模式，性经验逐渐丰富、性态度趋于成熟。' },
    { text: '26-30岁', append: '二十后半的轻熟阶段，褪去了二十出头的青涩但保有全部的活力和魅力。事业和人生阅历都有了相当积累，对自己有了更深的理解，对欲望诚实面对不扭捏。' },
    { text: '31-35岁', append: '三十出头的成熟期，身体依然保持着良好状态同时拥有更丰富的人生阅历。对人际关系和亲密关系有了更通透的理解，既有成熟的魅力又有追求品质的热情。' },
    { text: '36-40岁', append: '三十六到四十岁的壮年期，身体经过了岁月的沉淀而别具风韵。事业家庭多已稳固，对自己的身体和欲望有了最充分的了解，是最懂得享受生活也能放得开的阶段。' },
    { text: '41-45岁', append: '四十岁出头的中年前期，青春的外貌开始留下岁月的痕迹但风韵犹存。阅历和智慧赋予了从容淡定的气质，对人生和欲望的理解达到了最通透的层面。' },
    { text: '46-49岁', append: '接近五十岁的成熟阶段，外貌不可避免地显出年纪但气质和韵味经过了时间的充分沉淀。对自己的欲望诚实坦然，有着岁月馈赠的通透和从容。' },
  ]},
  { group: '外貌体征', chips: [
    { text: '金发碧眼', append: '一头如阳光般灿烂的金色长发，配上海洋般深邃的蓝色眼眸。五官偏向西方人的立体深邃，肤色白皙，是极具视觉辨识度的欧式长相。' },
    { text: '黑长直', append: '一头乌黑如瀑的笔直长发垂至腰际，发质柔顺亮泽如丝绸。眉目如画具有东方古典美的特征，肤色白净，含蓄内敛的气质由内而外自然散。' },
    { text: '银发红瞳', append: '银白色的长发配上一双醒目的赤红色眼眸，稀有的发色瞳色组合极具视觉冲击力。肤色因缺乏色素而呈现出瓷器般的冷白质感，整个人散发着非人感的妖异美感。' },
    { text: '双马尾', append: '将头发分成两束分别扎在头部两侧的双马尾造型，是最具少女感的发型之一。配合活泼的动作发尾会随之跳动，自带元气和青春的气息，是少女感和活力的外在标志。' },
    { text: '巨乳', append: '胸部尺寸远超平均水平的丰满体型，乳量傲人且存在感极强。无论穿着何种衣物胸部曲线都会成为无法忽视的焦点，是最具女性第二性征符号意义的体型特征之一。' },
    { text: '贫乳', append: '胸部尺寸偏小甚至接近平坦的体型，几乎没有明显的胸部曲线起伏。偏中性的身材轮廓在视觉上显得轻盈纤细，带着一种未完全发育的青涩感和少女独有的清爽感。' },
    { text: '御姐', append: '高挑修长的成熟女性体型，身高通常在170cm以上且比例匀称。有着明显的腰线、臀线和胸线构成的曲线轮廓，呈现出成熟女性特有的体态美和优雅气质。' },
    { text: '肌肉', append: '经过长期系统的力量训练塑造出的结实体格，肌肉线条清晰分明。体脂率较低因此肌肉纹理和轮廓都很明显，身体充满力量感和爆发力，举手投足间带着长期自律留下的痕迹。' },
    { text: '丰满', append: '体态丰腴圆润的肉感体型，身体各部位覆盖着柔软的皮下脂肪。肌理柔软有弹性没有尖锐的骨感，整体轮廓呈现出饱满圆润的曲线美，触感温暖而柔软。' },
  ]},
  { group: '性格特征', chips: [
    { text: '冷傲', append: '行走的冰山，对任何人都不假辞色、目光扫过都带着寒霜。言语短促而锋利，拒人于千里之外是常态，傲慢的外壳包裹着一颗不知道如何与人亲近的笨拙灵魂。' },
    { text: '温柔', append: '水做的人，说话轻声细语、目光温软含情。天生的抚慰者善于察觉每一丝情绪的波动，体贴入微到让人沉溺，但过度的柔软也意味着没有边界——容易被入侵、被占据、被利用。' },
    { text: '妩媚', append: '行走的春药，不需要刻意勾引就能让男人喉咙发紧。眼波里盛着一汪春水、唇齿间叼着半截风情，妩媚是天生的武器也是刻在骨血里的本能，她自己可能都没意识到自己有多致命。' },
    { text: '纯真', append: '一张从未被涂抹过的白纸，眼神干净得像山间的溪流。对世界的恶意毫无防备、对人的谎言深信不疑，这种不设防的纯真让有的人想拼命守护、让另一些人想狠狠撕碎。' },
    { text: '偏执', append: '用极端的方式去爱的疯子，在她这里占有就是爱、控制就是深情。无法容忍任何形式的拒绝和背叛，嫉妒和不安会像野火一样烧光理智，爱到极致就是毁灭。' },
    { text: '强势', append: '天生的支配者，气场强大到让周围的人不自觉地屏住呼吸。习惯于掌控全局、发号施令、占据上风，温柔不是她的语言、服从不是她的选项，每一次对视都是一场无声的较量。' },
    { text: '腹黑', append: '脸上挂着最温柔的笑容心里转着最狠毒的念头，笑容越灿烂手段越不见血。从不正面冲突但每一步都算好了三步之后的棋，等你发现自己被卖了的时候还在替她数钱。' },
    { text: '傲娇', append: '嘴上说着"谁稀罕"眼睛却忍不住往这边瞟的教科书式别扭精。打死不承认心里话、用刻薄掩饰在乎、用转身掩饰脸红，要是真信了她的拒绝你就永远失去了她。' },
    { text: '天然呆', append: '仿佛活在自己的次元里的迷糊虫，迟钝到让人怀疑是不是少了一根筋。走路会撞到门、做饭会烧了厨房、说话经常脱线到让人哭笑不得，但那种毫无防备的天真恰恰是她的杀伤力。' },
    { text: '中二病', append: '坚信自己体内封印着远古力量的自我陶醉者，日常沉迷于自己设定的世界观角色里不能自拔。随口就是"黑暗之力""契约封印"之类的羞耻台词，被戳穿时会脸红到耳根但嘴硬绝不认输。' },
    { text: '毒舌', append: '舌头上淬了毒的刻薄鬼，精准打击别人最在意的痛点是她最大的乐趣。反应快到让你被骂完了才反应过来被骂了，但仔细观察就会发现她只嘲讽真正在意的人。' },
    { text: '元气', append: '精力充沛到令人害怕的永动机，微笑和活力是永不耗尽的燃料。嗓门天生比别人大一圈、行动力永远比思考快三秒，最擅长的就是把身边所有人都卷入她停不下来的节奏里。' },
    { text: '傻子', append: '脑袋里缺根筋的天然蠢货，智力和判断力都低到令人着急。别人说啥信啥、被骗了还帮人数钱，反射弧长得能从北京绕到东京，但那种傻乎乎的笑容反而让人不忍心对她下太重的手。' },
    { text: '淫荡', append: '脑子里没有别的内容只剩性的行走欲望，看到任何活物都能联想到交配。正经对话超不过三句就会拐到黄色话题上，公共场合和私密场合的界限在她这里根本不存在，性就是她理解世界的唯一坐标。' },
    { text: '抖S', append: '以他人的痛苦和屈辱为快乐源泉的施虐者，看着别人露出痛苦表情时会露出真心实意的愉悦笑容。支配和掌控是本能需求，温柔体贴只是一种更高明的折磨手段，猫捉老鼠的游戏永远不会腻。' },
    { text: '抖M', append: '在痛苦和屈辱中才能找到存在价值的受虐者，被当作抹布踩踏反而能获得最大的满足。尊严是随时可以碾碎的东西、服从是刻进骨子里的本能，越是被粗暴对待越能感受到被需要的实感。' },
    { text: '傻白甜', append: '傻乎乎、白嫩嫩、甜滋滋的三合一无害生物，脑子里装的可能是棉花糖和彩虹。被人卖了还会帮人数钱的那种纯天然蠢萌，所有人都忍不住想保护她也有人忍不住想毁掉这份干净。' },
    { text: '无口', append: '沉默到让人忘记她会说话的三无少女，表情和语言一样稀罕。存在感低到经常被忽略但其实一直在观察着周围的一切，偶尔迸出的一句话往往直击要害让人无法反驳。' },
  ]},
  { group: '性格反差', chips: [
    { text: '外冷内热', append: '表面冷漠疏离不轻易与人接近，言辞冷冽带有距离感。然而坚硬冰冷的外壳之下包裹着一颗异常炽热的心，只是不善也不惯于表达柔软的一面，外表的温度与内在的温度之间存在巨大的反差。' },
    { text: '外冷内齁', append: '外表高傲冷峻生人勿近，一副清冷矜持不食人间烟火的模样。然而身体对外界的刺激异常敏感，反应远比正常人大得多，生理性的热烈反应与高冷的表象形成极致的反差。' },
    { text: '外热内冷', append: '表面上热情开朗对任何人都笑脸相迎，是社交圈里公认的开心果。但只有独处时才会卸下那张永远微笑的面具，内心其实冷淡疏离，所有的热情都只是社交技巧而非真心。' },
    { text: '外柔内刚', append: '外表温柔随和说话轻声细语，看起来很好说话甚至有些怯懦。但骨子里有着出人意料的坚韧和固执，一旦触及原则问题会展现出与外表截然不同的强硬。' },
    { text: '外刚内柔', append: '外表强悍霸道说话直来直去，看起来不好惹且不易亲近。然而强硬的外壳保护着的是一颗异常柔软敏感的心，极度渴望被理解和温柔对待只是从来不敢表现出来。' },
    { text: '表面清纯内心放荡', append: '公众形象和私密生活之间存在巨大反差的人格类型。在人前维持着纯洁端庄或天真的形象，但在独处或特定私密场合中展现出完全相反的奔放和纵欲。' },
    { text: '表面强势内心脆弱', append: '在工作中或社交中扮演着强硬独立无所畏惧的角色，习惯用强势来武装自己。然而独处时会被铺天盖地的不安和脆弱淹没，强硬只是保护易碎内心的手段而非本性。' },
    { text: '表面乖巧内心叛逆', append: '从小到大都是长辈眼中听话懂事的模范孩子，循规蹈矩从不逾矩。但内心深处积累着对被压抑自我的反抗冲动，在某些时刻以极端的方式爆发出来，人前的乖巧程度与人后的叛逆程度成正比。' },
  ]},
  { group: '性经验', chips: [
    { text: '处女', append: '从未被开发过的处子之身，处女膜是最后的防线。对性仅有来自偷看和耳语的模糊想象，被触碰时全身紧绷像受惊的小兽，青涩到连自己都不敢碰自己。' },
    { text: '经验丰富', append: '身经百战的床上老手，经历的性伴侣多到数不过来。深谙每一处敏感点的位置和每一种体位的妙处，能用细微的技巧差距就让对方欲仙欲死，经验和技巧已经刻进了身体记忆。' },
    { text: '滥交', append: '来者不拒的肉体容器，交配对她来说和吃饭喝水一样稀松平常。性伴侣的数量和质量都不重要，重要的是从不间断的肉体刺激，一天没有性就浑身不自在。' },
    { text: '纯情', append: '提起性话题就脸红到脖子根，连接吻都要犹豫半天。对肉体探索既恐惧又好奇，在性事中完全处于被动和被引导的位置，越羞耻身体反而越诚实。' },
    { text: '荡妇', append: '以性为食的肉食动物，看到合口味的猎物就主动出击。不需要感情铺垫也不需要前戏铺垫，直奔主题是她一贯的风格，放荡到让最老练的嫖客都自愧不如。' },
    { text: '已调教', append: '被反复、系统、深入地开发过的完美性奴，身体已经形成了最彻底的条件反射。特定的词语、手势甚至眼神都能让身体自动进入状态，服从和取悦是刻进脊髓的本能。' },
    { text: '痴女', append: '性欲旺盛到病态的永动机，自慰是日常、做爱是刚需。看到任何柱状物都会联想到性，得不到满足时会焦躁到失控，性欲就是驱动她一切行为的第一燃料。' },
    { text: '反差婊', append: '白天和夜晚不是同一个人的双重人格。人前有多端庄自持、独处就有多放纵堕落，不同的社交圈子里分别扮演着圣女和荡妇，连她自己都快分不清哪张脸才是真实。' },
  ]},
];

// ===== 概要模板（按性别拆分到各自文件） =====

var 角色概要模板 = {
  female: 女性概要模板,
  male: 男性概要模板,
  femboy: 伪娘概要模板,
  futa: 扶她概要模板,
};

// ===== 完整角色模板（按性别拆分） =====

var 角色完整模板 = {
  female: 女性完整模板,
  male: 男性完整模板,
  femboy: 伪娘完整模板,
  futa: 扶她完整模板,
};

// ===== 价格评估模板（按性别拆分） =====

var 角色评估模板 = {
  female: 女性评估模板,
  male: 男性评估模板,
  femboy: 伪娘评估模板,
  futa: 扶她评估模板,
};

// ===== 简约 JSON 解析器（专用于概要，不做默认值填充） =====

function 解析概要JSON(text) {
  if (!text || !text.trim()) return { ok: false, error: 'LLM 返回为空' };
  var cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  var braceStart = cleaned.indexOf('{');
  var braceEnd = cleaned.lastIndexOf('}');
  if (braceStart >= 0 && braceEnd > braceStart) {
    cleaned = cleaned.slice(braceStart, braceEnd + 1);
  } else {
    return { ok: false, error: '未找到 JSON 对象' };
  }
  var repairSteps = [
    function(s) { return s.replace(/\/\/.*$/gm, ''); },
    function(s) { return s.replace(/,\s*([}\]])/g, '$1'); },
    function(s) { return s.replace(/([一-鿿　-〿＀-￯])"([^"]{1,100}?)"([一-鿿　-〿＀-￯，。、！？；：）])/g, '$1「$2」$3'); },
    function(s) { return s.replace(/""([^"]{1,300}?)""/g, '“$1”'); },
    function(s) { return s.replace(/'/g, '"'); },
    function(s) { return s.replace(/([{,])\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":'); },
  ];
  function tryRepair(s, idx) {
    if (idx >= repairSteps.length) {
      try { return JSON.parse(s); } catch(e) { return null; }
    }
    var combined = s;
    for (var i = 0; i <= idx; i++) {
      try { combined = repairSteps[i](combined); } catch(e) { return null; }
    }
    try { return JSON.parse(combined); } catch(e) {}
    return tryRepair(s, idx + 1);
  }
  var obj = tryRepair(cleaned, 0);
  if (!obj) return { ok: false, error: 'JSON 解析失败' };
  if (!obj.identity || !obj.identity.basicInfo || !obj.identity.basicInfo.name) {
    return { ok: false, error: '缺少角色名' };
  }
  // normalize
  if (!obj.identity.basicInfo.id) obj.identity.basicInfo.id = null;
  if (!obj.identity.basicInfo.role) obj.identity.basicInfo.role = '自由';
  return { ok: true, outline: obj };
}

// ===== 嵌套路径安全读取 =====

function 获取嵌套值(obj, path) {
  var parts = path.split('.');
  var cur = obj;
  for (var i = 0; i < parts.length; i++) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[parts[i]];
  }
  return cur;
}

// ===== 完整角色 JSON 解析（嵌套结构版） =====

function 解析完整角色(text) {
  if (!text || !text.trim()) return { ok: false, error: 'LLM 返回为空', raw: text };
  var cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  var braceStart = cleaned.indexOf('{');
  var braceEnd = cleaned.lastIndexOf('}');
  if (braceStart >= 0 && braceEnd > braceStart) {
    cleaned = cleaned.slice(braceStart, braceEnd + 1);
  } else {
    return { ok: false, error: 'JSON 解析失败: 未找到 {} 对象', raw: text };
  }
  var repairSteps = [
    function(s) { return s.replace(/\/\/.*$/gm, ''); },
    function(s) { return s.replace(/,\s*([}\]])/g, '$1'); },
    function(s) { return s.replace(/([一-鿿　-〿＀-￯])"([^"]{1,100}?)"([一-鿿　-〿＀-￯，。、！？；：）])/g, '$1「$2」$3'); },
    function(s) { return s.replace(/""([^"]{1,300}?)""/g, '“$1”'); },
    function(s) { return s.replace(/'/g, '"'); },
    function(s) { return s.replace(/([{,])\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":'); },
  ];
  function tryRepair(s, idx) {
    if (idx >= repairSteps.length) {
      try { return JSON.parse(s); } catch(e) { return null; }
    }
    var combined = s;
    for (var i = 0; i <= idx; i++) {
      try { combined = repairSteps[i](combined); } catch(e) { return null; }
    }
    try { return JSON.parse(combined); } catch(e) {}
    return tryRepair(s, idx + 1);
  }
  var obj = tryRepair(cleaned, 0);
  if (!obj) return { ok: false, error: 'JSON 解析失败: 所有修复均无效', raw: text };
  if (!obj.identity || !obj.identity.basicInfo || !obj.identity.basicInfo.name) {
    return { ok: false, error: '缺少必需字段: name', raw: text };
  }
  obj.identity.basicInfo.id = null;
  obj.identity.basicInfo.role = '自由';
  填充角色默认值(obj);
  return { ok: true, char: obj };
}

// ===== 嵌套结构默认值补充 =====

function 填充角色默认值(obj) {
  var bi = obj.identity && obj.identity.basicInfo;
  if (!bi.icon) bi.icon = '👤';
  if (!bi.race) bi.race = '人族';
  if (!bi.rarity) bi.rarity = '蓝';
  if (!bi.price) bi.price = 0;
  // 外貌
  var app = obj.appearance;
  if (app) {
    var bs = app.bodyShape;
    if (bs) {
      if (!bs.figure) bs.figure = '匀称';
      if (!bs.height) bs.height = '中等';
      if (!bs.build) bs.build = '普通';
    }
    var sh = app.skinHair;
    if (sh) {
      if (!sh.skin) sh.skin = { color: '白皙', texture: '普通', moisture: '普通', blemishes: null, tanLines: null, calluses: null };
      if (!sh.bodyHair) sh.bodyHair = { arms: '无', legs: '无', armpit: '无', belly: '无', back: '无' };
      if (!sh.nails) sh.nails = { fingernails: '普通', toenails: '普通', cleanliness: '干净' };
    }
    var vs = app.voiceScent;
    if (vs && !vs.scent) vs.scent = { overall: null, breath: null, armpits: null, skin: null, hair: null, genitals: null, feet: null, notes: null };
  }
  // 衣着默认
  var at = obj.attire;
  if (at) {
    if (!at.legwear) at.legwear = {};
    if (!at.legwear.hosiery) at.legwear.hosiery = { type: null, color: null, material: null, thighHigh: false, garter: false, openCrotch: false, chain: false, notes: null };
    if (!at.legwear.footwear) at.legwear.footwear = { type: null, material: null, color: null, condition: null, heelHeight: null, notes: null };
    if (!at.ornaments) at.ornaments = { accessories: { neck: null, ears: null, wrists: null, fingers: null, anklets: null, other: null } };
  }
  // 性能力
  var sc = obj.sexualCapability;
  if (sc && sc.sexualAbility) {
    if (sc.sexualAbility.sexualIncontinence == null) sc.sexualAbility.sexualIncontinence = { vaginalAir: { has: false, desc: null }, flatulence: { has: false, desc: null }, urine: { has: false, desc: null }, feces: { has: false, desc: null } };
  }
  // 性历史
  var sh = obj.sexualHistory;
  if (sh) {
    if (!sh.milestones) sh.milestones = { partnerCount: 0, female: { count: 0, desc: null, firstTime: null, mostShameful: null, best: null, worst: null }, male: { count: 0, desc: null, firstTime: null, mostShameful: null, best: null, worst: null }, femboy: { count: 0, desc: null, firstTime: null, mostShameful: null, best: null, worst: null }, futa: { count: 0, desc: null, firstTime: null, mostShameful: null, best: null, worst: null }, alien: { count: 0, desc: null, firstTime: null, mostShameful: null, best: null, worst: null }, firstTime: null, mostShameful: null, best: null, worst: null };
  }
  // 状态契约
  var sc2 = obj.statusContract;
  if (sc2) {
    if (!sc2.ownership) sc2.ownership = {};
    if (!sc2.ownership.detail) sc2.ownership.detail = { owner: null, group: null, cost: 0, acquired: null, acquiredDate: null };
    if (!sc2.ownership.detail.contract) sc2.ownership.detail.contract = { type: null, duration: null, buyoutPrice: null };
    if (!sc2.workStats) sc2.workStats = { records: { todayTasks: 0, totalTasks: 0, todayIncome: 0, totalIncome: 0, performanceCount: 0, guestSatisfaction: 0, regularCustomers: null, lastWorked: null } };
  }
  // 属性
  var attrs = obj.attributes;
  if (attrs) {
    if (!attrs.basic) attrs.basic = { stamina: 50, strength: 50, agility: 50, intelligence: 50, knowledge: 50, obedience: 50 };
    if (!attrs.beauty) attrs.beauty = { face: 50, figure: 50, genital: 50 };
    if (!attrs.sex) attrs.sex = { lust: 50, sensitivity: 50, skill: 50 };
    if (!attrs.relation) attrs.relation = { loyalty: 50, affection: 50, fear: 50 };
    if (!attrs.corruption) attrs.corruption = { promiscuity: 10, exhibitionism: 10, masochism: 10, perversion: 10 };
  }
  // 性格
  var pers = obj.personality;
  if (pers) {
    if (pers.personality && pers.personality.traits && !pers.personality.traits.personality) {
      pers.personality.traits.personality = { attitude: null, temperament: null, stubbornness: null, empathy: null, sociability: null, ambition: null, mentalTraits: null };
    }
    // 兼容旧结构：若 LLM 仍输出 personalityTraits 路径则归一为 traits
    if (pers.personalityTraits && !pers.personality) {
      pers.personality = { traits: pers.personalityTraits, goals: null, likes: null };
      delete pers.personalityTraits;
    }
  }
  // 身体健康
  var ph = obj.physicalHealth;
  if (ph && ph.diseases) {
    if (!ph.diseases.sti) ph.diseases.sti = { status: '无', diseases: null, history: null, notes: null };
  }
  if (ph && ph.disabilities && !ph.disabilities.disability) {
    ph.disabilities.disability = { has: false, type: null, description: null, sinceBirth: false, affects: null, notes: null };
  }
  // 后台
  var meta = obj.meta;
  if (meta) {
    if (!meta.flags) meta.flags = { metPlayer: false, hadFirstSex: false, attemptedEscape: false };
    if (!meta.metadata) meta.metadata = { createdAt: null, updatedAt: null, version: '1.0', author: null, sourceFile: null, characterType: '原创', characterOrigin: null, customFields: null };
  }
}

// ===== 路由注册 =====

registerPageRoute('character', function(el) {
  渲染角色主面板(el);
});

// ===== 价格评估 JSON 解析器 =====

function 解析评估JSON(text) {
  if (!text || !text.trim()) return { ok: false };
  var cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  var braceStart = cleaned.indexOf('{');
  var braceEnd = cleaned.lastIndexOf('}');
  if (braceStart < 0 || braceEnd <= braceStart) return { ok: false };
  cleaned = cleaned.slice(braceStart, braceEnd + 1);
  cleaned = cleaned.replace(/'/g, '"');
  try {
    var obj = JSON.parse(cleaned);
    if (typeof obj.price === 'number' && obj.rarity) {
      return { ok: true, price: obj.price, rarity: obj.rarity };
    }
    return { ok: false };
  } catch(e) {
    return { ok: false };
  }
}

// ===== 主渲染函数 =====

// ===== 顶部标签栏（统一 sub-nav 风格） =====

function 渲染角色主标签() {
  var tabs = [
    { key: 'list', label: '角色库' },
    { key: 'inspire', label: '灵感角色库' },
    { key: 'generate', label: '生成角色' },
    { key: 'char-discuss', label: '角色讨论' },
    { key: 'novel-extract', label: '小说提取' },
    { key: 'importexport', label: '导入导出' },
  ];
  var h = '<div class="sub-nav">';
  for (var i = 0; i < tabs.length; i++) {
    var t = tabs[i];
    var sel = 角色当前标签 === t.key;
    var clickFn = t.key === 'novel-extract' ? '角色切换标签并同步磁盘' : '角色切换标签';
    h += '<div class="sub-nav-item' + (sel ? ' act' : '') + '" onclick="window.' + clickFn + '(\'' + t.key + '\')">' + escHtml(t.label) + '</div>';
  }
  h += '</div>';
  return h;
}

// ===== 辅助函数 =====

function 格式化时间(ts) {
  if (!ts) return '';
  var d = new Date(ts);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}
function pad(n) { return n < 10 ? '0' + n : '' + n; }

// ===== 主渲染函数 =====

var 角色Api = null;

function 渲染角色主面板(el) {
  var items = [
    { id: 'list', label: '📚 角色库' },
    { id: 'inspire', label: '✨ 灵感角色库' },
    { id: 'generate', label: '🧬 生成角色' },
    { id: 'char-discuss', label: '💬 角色讨论' },
    { id: 'novel-extract', label: '📖 小说提取' },
    { id: 'importexport', label: '📤 导入导出' },
  ];
  if (!角色Api) {
    角色Api = 渲染标签栏(el, items, { active: 角色当前标签, subId: 'charTabContent', onSwitch: function(t){ 角色切换标签并同步磁盘(t); } });
  } else {
    角色Api.setActive(角色当前标签);
  }
  var sub = 角色Api.sub;
  // 条件分派到面板
  if (角色当前标签 === 'generate') {
    sub.innerHTML = 渲染生成面板();
  } else if (角色当前标签 === 'char-discuss') {
    sub.innerHTML = 渲染角色讨论面板();
  } else if (角色当前标签 === 'novel-extract') {
    sub.innerHTML = 渲染小说提取面板();
  } else if (角色当前标签 === 'importexport') {
    sub.innerHTML = 渲染导入导出面板();
  } else if (角色当前标签 === 'inspire') {
    sub.innerHTML = '<div id="inspireRoleTabContent"></div>';
    if (typeof window.stcdInspireRender === 'function') {
      window.stcdInspireRender(document.getElementById('inspireRoleTabContent'));
    }
  } else {
    sub.innerHTML = 渲染角色库面板();
  }
}

// ===== 标签切换 =====
window.角色切换标签 = function(tab) {
  角色当前标签 = tab;
  渲染角色主面板(document.getElementById('characterContent'));
};

// 进入小说提取标签时，先从磁盘重新加载保证实时性
window.角色切换标签并同步磁盘 = function(tab) {
  if (tab === 'novel-extract' && window.小说提取当前记录ID && window.小说提取加载记录) {
    var folderName = (window.本地FS && 本地FS.清理(window.小说提取当前记录标题)) || window.小说提取当前记录ID;
    小说提取加载记录(folderName);
    return;
  }
  角色切换标签(tab);
};

function 显示状态(msg) {
  var el = document.getElementById('charStatus');
  if (el) el.textContent = msg;
}

// 导出英文别名，供 AI 注册等模块引用
window.FEMALE_CHARACTER_TEMPLATE = window.女性完整模板;
window.MALE_CHARACTER_TEMPLATE = window.男性完整模板;
window.FEMBOY_CHARACTER_TEMPLATE = window.伪娘完整模板;
window.FUTA_CHARACTER_TEMPLATE = window.扶她完整模板;
