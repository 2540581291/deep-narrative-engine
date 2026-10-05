// 设定构建 · 世界观 · Tab 页（世界列表 / 开天辟地）
//   - Tab1 世界列表：卡片式，点卡片进世界编辑/浏览
//   - Tab2 开天辟地：实时保存的多级编辑器（基础信息 + 版块TAB + 子维度TAB + 条目列表）
//   - 世界详情：点卡片进入，复用同一套「版块→子维度→条目」编辑器，实时保存
// 实时保存：填任何内容（含 AI 生成）立即写入磁盘。风格参考其他创作模块（灵感板等）。

var 世界即视图 = 'list';   // 'list' 世界列表 | 'create' 开天辟地 | 'world-detail' 世界详情
var 世界列表缓存 = null;
var 世界当前世界 = null;   // 当前世界 { title, meta, content }（编辑/浏览共用）
var 世界当前版块 = '世界设定';   // 当前版块 TAB
var 世界当前维度 = '';          // 当前子维度 TAB（空=第一个维度）
var 世界详情编辑索引 = -1;      // 条目编辑索引
var 世界子级索引 = -1;          // 当前下钻的父条目索引（-1=顶层；进子级时为父条目在维度数组中的下标）
var 世界生成快照 = null;        // 点击「生成」时锁定的 { 版块, 维度, 子级索引 }，保证结果写入固定 tab，不随切换漂移
var 世界关联索引 = -1;          // 「势力」条目下标（-1=没在关联界面）——点势力条目即进关联界面；关联不存数据，现扫现汇
var 世界关联板块 = '';           // 关联视图里当前筛的是哪个板块（''=第一个有关联的）；再往里按 维度 的子 TAB 筛
var 世界关联维度 = '';           // 关联视图里当前筛的是哪个维度（''=该板块的第一个）
var 世界高亮条目 = '';          // 从关联视图跳转过来时高亮的条目名

// 顶层 tab 定义（芯片标签栏 · 全局渲染标签栏）
var 世界顶层Tab = [
  { key: 'list', label: '📂 世界列表' },
  { key: 'create', label: '💥 开天辟地' },
];

// 模块主题（版块 TAB）
// 顺序即版块 TAB 的显示顺序：势力（总览）紧跟世界设定，作为其余板块的索引。
// 「军队」独立成块，夹在种族与物品之间：它既不是势力下的一类组织（兵种是它的内容主体，
// 而兵种不是一个势力），也不是物品（器物归物品）。它和地域/种族/物品平级。
var 世界可用模块 = [
  { id: '世界设定', icon: '📖', label: '世界设定' },
  { id: '势力', icon: '🏴', label: '势力' },
  { id: '地理', icon: '🗺️', label: '地理' },
  { id: '种族', icon: '🧬', label: '种族' },
  { id: '军队', icon: '⚔️', label: '军队' },
  { id: '物品', icon: '🎁', label: '物品' },
  { id: '文化', icon: '📜', label: '文化' },
  { id: '时间线', icon: '⏳', label: '时间线' },
];

// 版块定义：每版块含多个「子维度」，每个子维度是一个小 TAB，其下是条目数组
// content.json 结构：{ 版块: { 子维度: [条目, ...] } }
// meta:true 的维度是特殊「基本设定」，渲染为基础信息表单（世界名/简介），不存条目。
// 可下钻:true 的版块，其条目可带「子级」数组（一层），点击条目可进入子级（街道/店铺/地标等）。
// 单条:true 的维度，AI 生成时每条目只生成一个主题（如「种族」「文明」每条目只一个种族/文明，不混搭）。
// 维度对象可带 说明（正向：该类该写什么）与 禁混（负向：不要生成的其他类别），拼接进生成提示。
var 世界版块表 = {
  '世界设定': { icon: '📖', 维度: [ { 名: '基本设定', meta: true }, { 名: '宇宙与法则' }, { 名: '力量体系' }, { 名: '情色生态' } ] },
  '地理': { icon: '🗺️', 可下钻: true, 维度: [
    { 名: '世界地理', 说明: '这是**世界级 / 超大尺度**的地理实体——大陆、海洋、天空、星球、大界、巨岛、整片海域或天域等，是一个世界最顶层的空间框架。如「玄黄大陆」「无垠星海」「九重天穹」「四海八荒」。**明确只做这类大型地点**：条目即该大型地点本身；**不要把小尺度地点混进来**——峡谷、山谷、溪流、湖泊、海滩、单个洞窟、一处奇观、一座山都**不算世界地理**，它们应归入「聚落」或「奇境」。每个世界地理条目可带「子级」列出其下更细的区域（如某大陆下的某山脉/某海域）。不要写类别名，只写大型地点自身的名称' },
    { 名: '大城名宗', 说明: '这是**大型聚居地**——**宗门驻地（仙山/山门/宗门城）、巨大城市、王都、大都城**等规模宏大、人口稠密、地位显赫的地点。如「凌云仙城」「玄剑宗山门」。条目即该大型聚居地本身；**港口、坊市、市集、集市、码头、地标、街巷等都是城市/宗门的内在组成部分，作为该聚落的子级或写在详述里，绝不单独成条**。不要写类别名，只写大型聚居地自身名称' },
    { 名: '乡镇村落', 说明: '这是**小型/基层聚居地**——**乡镇、村镇、村寨、营地、农庄**等规模较小、地处乡野或边地的聚居之处，是普通人的生息之地。如「仙人镇」「灰烬营地」。条目即该小型聚居地本身；**港口、坊市、集市、码头、地标、祠堂等都是村镇的内在组成部分，作为子级或写在详述里，绝不单独成条**。不要写类别名，只写小型聚居地自身名称' },
    { 名: '奇境', 说明: '这是**特殊、超自然的奇观地点与神秘遗迹**——洞天福地、秘境、险地、奇景、圣泉、异境、上古遗迹等，**且必须与性直接相关**：淫祠遗址、交合洞天、欢愉秘境、情欲圣泉、双修福地、采补邪地、爱欲遗迹、阴阳奇穴之类，以情欲/性爱为内核，是情色传说与秘辛的载体。如「九窍玄阴母池」「欢喜幻境」。条目即该奇境本身；**不要把普通聚居地或世界级大陆混进来**——那些分别归「聚落」「世界地理」。不要写类别名，只写奇境自身名称' },
  ], 可下钻: true },
  // 势力：其余板块的总览 / 索引。条目是「组织」，本身不改动。
  // 关联:true → **点条目就是进关联界面**：现扫全库，把所有「所属势力」填了它的条目
  // （地理 / 种族 / 军队 / 物品 / 文化 / 时间线，除世界设定以外的一切）汇出来，
  // 按板块 → 维度两级筛。这是这个板块唯一的「往里走」的方式。
  // 它**没有**下级、也**没有**内部块：势力往里展开的就是关联，不是一套预先定好的分类。
  '势力': { icon: '🏴', 关联: true, 维度: [
    { 名: '世俗政权', 单条: true, 说明: '这是一个势力，且是**接近官方、极其强大、对整个世界有巨大影响力**的势力——通常执掌一国之权、行于明面、号令八方。皇室、政府、议会、军阀等世俗政治机构与掌权者，记录其权力来源、体制、管辖范围、疆域与支配方式，突出其官方性与强大。条目即该势力整体本身；其下属的官僚体系、法律法令、官府场所等都不作为独立条目，写进该势力的详细描述即可' },
    { 名: '超凡势力', 单条: true, 说明: '这是一个势力，且是**接近官方（正统/台面）、极其强大、对整个世界有巨大影响力**的势力——常为世界秩序的中坚、台面上的至高超凡组织。修仙门派、魔法学院、神魔教会、龙族圣地等超自然/超凡力量组织，记录其传承、道统、强者、版图与超凡支配权，突出其强大与影响力。条目即该势力整体本身；其功法典籍、传承体系、山门道场等场所与内容都不作为独立条目，写在势力详细描述里' },
    { 名: '地下黑道', 单条: true, 说明: '这是一个势力。黑帮、盗贼、蛇头、人口贩卖集团等地下犯罪势力，记录其地盘、规矩、暴力与掠卖/囚禁/地下妓院等勾当。条目即该势力整体本身；其内部堂口、黑市、据点场所等都不作为独立条目，写在势力详细描述里' },
    { 名: '邪教淫祠', 单条: true, 说明: '这是一个势力，且是**异常、极端的病态堕落一脉**——即便整个世界的根基是情色，它也属于最边缘、最扭曲的一支。它以某种病态的信仰或沦丧的教义聚拢信众，把常人视作极端禁忌的事当成日常等闲：截肢、食粪、饮尿、自残、兽奸、血肉献祭、脏器交换、亵渎尸骸等皆是家常便饭，越重口越虔诚、越病态越近神。条目即该势力整体本身；其教义、淫祠、祭坛、血窖、秘仪流程等场所与内容都不作为独立条目，写在势力详细描述里。突出其病态、扭曲、令人作呕而又妖异诡艳的重口格调' },
    { 名: '宗教神权', 单条: true, 说明: '这是一个势力。教派、神殿、圣职机构等以信仰/神权支配的势力，记录其圣职体系、戒律、信仰支配与圣职者的堕落/触犯清规。条目即该势力整体本身；其仪式、典籍、教义、经文、神殿圣地等场所与内容都不作为独立条目，写在势力详细描述里' },
    { 名: '情色行业结社', 单条: true, 说明: '这是一个势力。青楼、花街公会、性奴市场、姬业行会等直接从事色情产业的势力，记录其行会规矩、产业规模、性奴/妓女来源与交易。条目即该势力整体本身；其下属的馆舍、行规、妓院场所等都不作为独立条目，写在势力详细描述里' },
    { 名: '民间宗族', 单条: true, 说明: '这是一个势力。宗族、乡绅、大家长制家族等以血缘权杖支配的势力，记录其族规、辈分长幼、联姻与宗族内的支配。条目即该势力整体本身；其下属的祠堂、族谱、祖宅等都不作为独立条目，写在势力详细描述里' },
  ] },
  // 种族：拆成「种族」（生物性）与「文明」（国族 / 文化圈）两个维度；「性征与繁衍」已移到「文化」。
  '种族': { icon: '🧬', 维度: [
    { 名: '种族', 单条: true, 说明: '这是**一个生物性的种族**——以血统、体质、生理构造与族群性征区分的一支生灵。如「野兽人」「阿苏尔（高等精灵）」「杜鲁齐（黑暗精灵）」「阿斯莱（木精灵）」「龙族与龙裔」「色孽恶魔」「树妖与森林精魂」「亡灵与吸血鬼」「斯卡文鼠人」「食人魔」等。条目即该种族本身；写清它的体质、性征、内部分化与它在这个情色秩序里的位置。**同一个种族的政权、制度与文明风貌不要写在这里**——那些归「文明」与「文化」。不要写类别名，只写种族自身的名称' },
    { 名: '文明', 单条: true, 说明: '这是**一个文明 / 国族 / 文化圈**——以共同的政权、疆域、语言、制度与生活方式聚合而成的人群共同体。如「震旦天朝」「基斯里夫」「帝国」「巴托尼亚」「奥苏安」「艾索洛伦」「纳迦罗斯」「希尔瓦尼亚」「尼赫喀拉」等。条目即该文明本身；写清它的政体、疆域、社会阶层、生活风貌，以及它在这个情色秩序里的处境。**不要写成某个具体政权 / 教会 / 军团**（那些归「势力」），也不要写单个种族的生理特征（那归「种族」）。不要写类别名，只写文明自身的名称' },
  ] },
  // 军队：**以兵种为核心**的板块，九个子 TAB 都是兵种，彼此同质、**没有例外**。
//   步兵 / 骑兵 / 战车 / 远程 / 法师 / 怪兽 / 炮械 / 空军 / 海军 —— 按「它在战场上靠什么打」分。
//   成建制的武装（兽群、禁卫军、骑士团）不另立维度：兽群归怪兽、禁卫军归步兵、骑士团归骑兵。
// 归属不在这里单列一栏：军队是有归属的，条目的「所属势力」指回势力板块。
// 点开任一条目 → **进它的内部**（见 世界渲染内部）：按板块配置的大块铺开，空块照常显示。
  '军队': { icon: '⚔️', 可下钻: true, 维度: [
    { 名: '步兵', 单条: true, 说明: '这是一个**徒步作战的兵种**——步兵、剑手、长矛兵、持盾兵、斧手、棍兵、狂信徒与狂战一类的徒步单位；**以卫护与统率立身的建制**（禁卫军、卫队、精锐武士序列）也归这里。条目即该兵种本身；写清它是什么、由谁驱使、怎么打、装备什么。**不要把骑乘单位（归「骑兵」「战车」）、投射单位（归「远程」「炮械」）、大型怪物（归「怪兽」）混进来。** 不要写类别名，只写该兵种自身的名称' },
    { 名: '骑兵', 单条: true, 说明: '这是一个**骑乘作战的兵种**——骑兵、骑士、骑士团、骑手、重骑、轻骑、半人马一类的骑乘单位。特征是**有人骑在坐骑上冲锋**。条目即该兵种本身；写清它骑什么、怎么冲、装备什么。**不要把乘车作战的单位（归「战车」）、徒步单位（归「步兵」）、不被骑乘的战兽（归「怪兽」）混进来。** 不要写类别名，只写该兵种自身的名称' },
    { 名: '战车', 单条: true, 说明: '这是一个**乘车作战的兵种或车组**——战车、攻城车、兽力拖曳的战车与轮式机械，以及驱赶牲口拖车的那一队人。特征是**它靠车本身与拖曳的牲口作战**，而不是靠骑术。条目即该兵种本身；写清它用什么拖、车上载什么、怎么冲阵。**不要把骑乘单位（归「骑兵」）、徒步单位（归「步兵」）混进来。** 不要写类别名，只写该兵种自身的名称' },
    { 名: '远程', 单条: true, 说明: '这是一个**投射兵种**——弓手、弩手、铳手、火枪手、猎手、投石手与游猎射手。判据是**它在远处放出去，不靠贴身肉搏**：语料里凡挂「射程范围 / 装弹时间 / 远程威力」的人马都归这里。条目即该兵种本身；写清它使什么、射程与威力、装填与补给靠什么。**不要把可被操作的器械本身（归「炮械」「物品·器物」）混进来**——这里写的是操作它的那一支人马。不要写类别名，只写该兵种自身的名称' },
    { 名: '法师', 单条: true, 说明: '这是一个**施法 / 祭仪性质的兵种或法团**——术士、巫师、萨满、祭司、教徒、信徒、魔女、巫灵、死灵单位（天鬼、丧妖、蝠狼、惊惧兽一类），以及**各种恶魔（守密者、欲魔、怒妖、神尊欲魔等，恶魔一律归这类）**。特征是**它的战力来自法术、祝祷、献祭或它本身就是超凡存在**。条目即该兵种本身；写清它的法门、祭仪、力量来源与在军中的位置。**不要把纯肉搏的步兵（归「步兵」）混进来。** 不要写类别名，只写该兵种自身的名称' },
    { 名: '怪兽', 单条: true, 说明: '这是一个**大型怪物或兽类兵种**——巨人、牛头怪、巨龙、狮鹫、奇美拉、蝎尾狮、多头蛇、树人、混沌卵、猎犬、战獒、猛兽，**以及成群的兽类（战群、兽群）**。特征是**体型、兽性或数量本身就是它的战力**。条目即该兵种本身；写清它的形态、习性、战力与被驱使的方式。**不要把施法单位（归「法师」）、被骑乘的坐骑（归「骑兵」）、有翼能飞的（归「空军」）混进来。** 不要写类别名，只写该兵种自身的名称' },
    { 名: '炮械', 单条: true, 说明: '这是一个**火器 / 攻城器械的炮组**——炮、巨炮、火箭炮、铳炮、弩炮、投石车一类，以及**操作它们的炮手队**。特征是**器械本身是主角**，威力来自装药与机械而不是臂力。条目即该兵种本身；写清它使什么、口径与射程、装填与搬运靠什么。**不要把单人弓弩投射（归「远程」）混进来。** 不要写类别名，只写该兵种自身的名称' },
    { 名: '空军', 单条: true, 说明: '这是一个**以飞行为主要作战方式的兵种**——鹰身女妖、血秃鹫、鸾鸟、鸦人、凤凰、蝇群、飞马骑手、飞行巨兽等。特征是**它从空中来、从空中打**。条目即该兵种本身；写清它的形态、飞行方式、从空中怎么施暴。**不要把不飞的走兽（归「怪兽」）混进来。** 不要写类别名，只写该兵种自身的名称' },
    { 名: '海军', 单条: true, 说明: '这是一个**水上 / 空中舰队性质的兵种**——舰队、海盗船队、天舟与飞艇编队、随船作战的登船队。特征是**它依托船舰行动**。条目即该兵种本身；写清它的旗舰与编制、炮位与船上分工、航路与母港。**不要把岸上的步兵（归「步兵」）混进来。** 不要写类别名，只写该兵种自身的名称' },
  ] },
  // 物品：统一的全量器物目录。**一个维度一个意思，不用复合名。**
  // 条目只写器物自身的详情与相关历史：形制材质、效力用途、以及它经历过的来龙去脉。
  // 本板块不出现「谁持有 / 创造 / 毁灭它」这类人物归属字段——那是另一条线上的事。
  '物品': { icon: '🎁', 维度: [
    { 名: '神器', 单条: true, 说明: '这是一件**独特命名的神器**——以自身效力直接改变战局或命运的强器：权杖、法杖、魔杖、宝镜、法典、图腾、护盾石、徽记、王之冠冕等。特征是它**主动施为**：能施法、增幅、护体、号令、改写血肉。**写清它的形制、材质、效力，再写它经历过的相关历史。** 不要把与神祇信仰绑定的圣物（归「圣物」）、兵刃（归「兵刃」）、甲胄（归「甲胄」）混进来。不要写类别名，只写器物自身的名称' },
    { 名: '圣物', 单条: true, 说明: '这是一件**与神祇 / 信仰绑定的圣物**——圣杯、神像、面具、护符、圣徽、圣物碎片、赐福之戒等。特征是它的效力**来自某位神祇的赐福或诅咒**，本身是信仰的凭依与崇拜的对象。**写清它的形制、材质、所系的神祇，再写它经历过的相关历史。** 不要把以自身效力施为的神器（归「神器」）、兵刃甲胄混进来。不要写类别名，只写器物自身的名称' },
    { 名: '兵刃', 单条: true, 说明: '这是一件**进攻性兵刃**——剑、长矛、匕首、斧、锤、弓、弩、箭袋等。**写清它的形制、材质、锻造或附魔的方式，再写它经历过的相关历史。** 不要把防护装具（归「甲胄」）、战旗号角（归「器物」）、有专名的神器（归「神器」）混进来。不要写类别名，只写兵器自身的名称' },
    { 名: '甲胄', 单条: true, 说明: '这是一件**防护装具**——甲、铠、胸甲、腿甲、盾、斗篷、束腰、护腕等。**写清它的形制、材质、防护方式，再写它经历过的相关历史。** 不要把进攻兵刃（归「兵刃」）、贴身饰物（归「饰物」）混进来。不要写类别名，只写装具自身的名称' },
    { 名: '饰物', 单条: true, 说明: '这是一件**装饰性饰物**——戒指、项链、手镯、耳环、头冠、胸针、衣着配饰等。特征是它**以美观与身份标示为主**。**写清它的形制、材质、佩戴方式，再写它经历过的相关历史。** 不要把用于束缚或驯化身体的器具（归「束具」）混进来。不要写类别名，只写饰物自身的名称' },
    { 名: '束具', 单条: true, 说明: '这是一件**用于束缚、驯化或改造身体的器具**——项圈、镣铐、枷、笼、锁精环、缰绳、鞍座、束带、口塞、穿刺饰物、烙印与印记器物等。特征是它**作用于身体以确立支配**。**写清它的形制、材质、佩戴或施用的方式，再写它经历过的相关历史。** 不要把纯装饰的饰物（归「饰物」）、兵刃甲胄混进来。不要写类别名，只写器具自身的名称' },
    { 名: '坐骑', 单条: true, 说明: '这是一头**被骑乘的活体坐骑**——龙、龙马、巨鹰、半人马、战马、飞马等。特征是**有人骑在它背上**。**写清它的形态、习性、被骑乘的方式，再写它经历过的相关历史。** 不要把不被骑乘的战兽巨兽（归「战兽」）混进来。不要写类别名，只写坐骑自身的名称' },
    { 名: '战兽', 单条: true, 说明: '这是一头**投入战阵的活体战兽 / 巨兽**——蝎尾狮、巨蟒、猎犬、天狮、巨熊、独爪兽等。特征是它**作为战力被驱使，而不是被骑乘**。**写清它的形态、习性、战力，再写它经历过的相关历史。** 不要把被骑乘的坐骑（归「坐骑」）混进来。不要写类别名，只写战兽自身的名称' },
    { 名: '随从', 单条: true, 说明: '这是一名**随从 / 侍从 / 家臣 / 幕僚**——为主人效力、但仍保有一定身份与职能的人：副官、间谍、导师、顾问、事务官、女官等。**写清这个人的身份、职能、处境，再写她/他经历过的相关历史。**\n【人物怎么写·重要】**一个人只写一条**，所有东西都写进这一条的「详细描述」里，**不要拆成多条、也不要分块分小标题**。关键人物往往有很长的故事链：先一段概况（她是谁、担什么位子、如今什么处境），往下**一阶一段**，段首写成「第N阶·『称号』」，**每一个称号都要单独写出来**（用『』），**绝不要写成「从 A 到 B」这种概括**。篇幅从几百字到几千字都行，没有字数上限；内容多了就用空行分段。\n不要把被当作财产占有的奴仆（归「奴仆」）混进来。不要写类别名，只写人自身的名称' },
    { 名: '奴仆', 单条: true, 说明: '这是一名**奴仆 / 奴隶 / 母畜——被当作财产占有与支配的人**：被掳的女奴、被驯化的法师与祭司、性奴、繁殖母畜、被牵在链上的战利品等。**写清这个人的身份、来历、被支配的方式与处境，再写她/他经历过的相关历史。**\n【人物怎么写·重要】**一个人只写一条**，所有东西都写进这一条的「详细描述」里，**不要拆成多条、也不要分块分小标题**。被反复转手、反复改造、一步步走到今天的人，要**一阶一段**地写下来，段首写成「第N阶·『称号』」（有称号的必须逐个写出来，用『』）。篇幅从几百字到几千字都行，没有字数上限；内容多了就用空行分段。\n不要把仍保有身份的随从与幕僚（归「随从」）混进来。不要写类别名，只写人自身的名称' },
    { 名: '药剂', 单条: true, 说明: '这是一件**可服用 / 可涂抹的药剂或香料**——药水、灵药、香水、香油、炼金制剂、次元石制品、致幻与催情之物等。**写清它的配方或成分、用法与效力，再写它经历过的相关历史。** 不要把非服用性的器具（归「器物」）混进来。不要写类别名，只写药剂自身的名称' },
    { 名: '器物', 单条: true, 说明: '这是一件**不属于以上各类的实用器具**——战旗、号角、乐器、工具、典籍、卷轴、饮馔、车舆、鞍鞯等。**写清它的形制、材质、用途，再写它经历过的相关历史。** 不要把兵刃甲胄、饰物束具、神器圣物、药剂混进来。不要写类别名，只写器物自身的名称' },
  ] },
  '文化': { icon: '📜', 维度: [ { 名: '文化与习俗' }, { 名: '哲学与信仰' }, { 名: '性征与繁衍' } ] },
  // 时间线：这个世界**没有绝对编年**（语料里几乎不出现年月日），它的时间结构是「从始到终的段落序列」。
  // 所以按刻度分四层：纪元（历史年表）→ 事件段落（事件链）→ 战事（战役）→ 尚未落定的走向（剧情种子）。
  '时间线': { icon: '⏳', 维度: [
    { 名: '历史年表', 时间轴: true, 说明: '这是**世界级的大刻度**——纪元与时代分期的锚点，如「创世」「远古」「上古」「精灵黄金时代（艾纳瑞昂时代）」「终焉之时」。\n【这一维度是一条线，不是一堆卡片】所有条目**从上到下、从古到今连成一条时间轴**：越靠上越古、越靠下越近。因此**每条都必须带一个「时序」字段**（整数，1 = 最古，依次递增），用来把它钉在轴上的位置。\n【只放纪元本身】**不要**把时间观念、时间工具、时间感的比较、天象刻度这类与纪元无关的内容写进这一维度——那些归「世界设定 · 宇宙与法则」。\n本世界**没有绝对编年**（语料里几乎不出现年月日），所以只写纪元之间的先后与每个纪元的性质，**绝不要编造年份、不要写出具体日期**。不要写类别名，只写该纪元自身的名称' },
    { 名: '事件链', 单条: true, 说明: '这是**一条多段连续事件链**——语料里以「（一）（二）（三）…」「第一阶段…第六阶段」「(1/12)」这类编号串起来的连续剧情，例：「食人魔的款待」18 段、「交配礼仪」16 段、「爱莎的命运」13 段、「启示」12 段、「风暴真龙之诱」六阶段、「暮光姐妹」11 段、「莉拉泽尔的崩溃」11 段。**一条链写一条条目**：写明它讲的是谁、从什么状态走到什么状态、一共几段、每一段的关键转折。链条内部按语料自己的编号排；**绝不要给链条之间编造先后与年份**（本世界无绝对编年）。若这条链本身就是某个人被改造的过程，请在叙述里点明它走到了哪一步。不要写类别名，只写该链条自身的名称' },
    { 名: '战役', 单条: true, 说明: '这是**一场战役 / 一次战事 / 一次突发军事事件**——围攻、突袭、会战、兵临城下、屠城、据点陷落等，如「邓肯霍夫城堡之战」「八日之内，血神兵临城下」。写清交战双方、地点、起因、经过与结果，以及它把谁推到了什么境地。**按叙事先后排**；**绝不要编造年份与日期**（本世界无绝对编年）。一场战事一条，不要把一场战役里的每次小规模接触都拆成条目。不要写类别名，只写该战役自身的名称' },
    { 名: '剧情种子', 单条: true, 说明: '这是**一处已经摆好、但走向还没落定的事态**——它是一个钩子，不是已经发生完的事：某个处境已经形成，当事人面前有几条岔路，走哪条由后续决定。如「囚笼里的女沙皇」（她突然开始配合，是为活命还是已经踏上堕落第一阶）、「胜利是被安排的」（她每一次赢，都是对方挪开的一步）。写法：先写清**已经发生的事实**（谁在什么处境里、事情到了哪一步），再点明**它可能往哪几个方向走**，不必替它选定结局。**不要编造年份与日期**（本世界无绝对编年）。不要写类别名，只写该事态自身的名称' },
  ] },
};

function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ===== 顶层 tab 导航（芯片标签栏 · 全局渲染标签栏）=====
var 世界Api = null;

// ===== 视图切换 =====
function 世界切换视图(view) {
  世界即视图 = view;
  var el = document.getElementById('worldContent');
  if (el) 世界渲染当前(el);
}

// 第一层用全局组件「渲染标签栏」渲染成芯片；创建一次后复用 setActive
function 世界渲染当前(el) {
  if (!el) return;
  var items = 世界顶层Tab.map(function(t) { return { id: t.key, label: t.label }; });
  var active = (世界即视图 === 'world-detail') ? 'list' : 世界即视图;
  if (!世界Api) {
    世界Api = 渲染标签栏(el, items, { active: active, onSwitch: function(view) { 世界切换类型(view); } });
  } else {
    世界Api.setActive(active);
  }
  世界渲染内容();
}

function 世界切换类型(view) {
  世界即视图 = view;
  世界渲染内容();
}

// 视图内容渲染进组件 sub（嵌套 worldListView / worldEditorView）
function 世界渲染内容() {
  var sub = 世界Api ? 世界Api.sub : null;
  if (!sub) return;
  var h = '';
  if (世界即视图 === 'create') {
    h += '<div id="worldEditorView"></div>';
    sub.innerHTML = h;
    // 未填名但已经写进东西的草稿（比如先写了简介）：切走再切回来不该被清空
    if (世界当前世界 && !世界当前世界.title && 世界当前世界._草稿中) 世界渲染编辑器();
    else 世界渲染空编辑器();
  } else if (世界即视图 === 'world-detail') {
    h += '<div id="worldEditorView"></div>';
    sub.innerHTML = h;
    世界渲染编辑器();
  } else {
    h += '<div id="worldListView"></div>';
    sub.innerHTML = h;
    世界渲染列表(sub);
  }
}

window.世界切换视图 = 世界切换视图;
window.worldSwitchView = 世界切换视图;

// ============================================================
// 首页 · 世界列表（卡片式）
// ============================================================
function 世界渲染列表(el) {
  var viewEl = document.getElementById('worldListView');
  if (!viewEl) return;
  世界加载列表().then(function(list) {
    世界渲染列表HTML(viewEl, list);
  });
}

function 世界加载列表() {
  if (世界列表缓存) return Promise.resolve(世界列表缓存);
  return Store.world.list().then(function(list) {
    世界列表缓存 = list;
    return list;
  });
}

function 世界渲染列表HTML(el, list) {
  var h = '';
  if (!list || list.length === 0) {
    h += '<div class="placeholder-text" style="padding:30px 0;text-align:center">还没有世界观，切到「开天辟地」创建吧。</div>';
    el.innerHTML = h;
    return;
  }
  // 大卡片式网格（世界观不多，卡片做大些；只放名称 + 简介，一眼看出用途）
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:14px">';
  list.forEach(function(w) {
    var title = w.title || '未命名世界';
    var desc = w.description || '';
    h += '<div style="background:var(--bg2);border-radius:var(--radius);border:1px solid var(--border);overflow:hidden;cursor:pointer;transition:.2s" onclick="世界点击世界(\'' + escHtml(title) + '\')">';
    h += '<div style="height:3px;background:linear-gradient(90deg,var(--accent2),var(--accent2))"></div>';
    h += '<div style="padding:16px 18px;min-height:120px;display:flex;flex-direction:column">';
    h += '<div style="font-size:16px;font-weight:700;color:var(--fg);margin-bottom:8px">' + escHtml(title) + '</div>';
    if (desc) {
      h += '<div style="font-size:13px;color:var(--fg2);line-height:1.6;flex:1;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden">' + escHtml(desc) + '</div>';
    } else {
      h += '<div style="font-size:12px;color:var(--fg3);flex:1">（暂无简介）</div>';
    }
    h += '</div>';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 18px;border-top:1px solid var(--border)">';
    h += '<div style="font-size:10px;color:var(--fg3)">' + escHtml(w.updatedAt || '') + '</div>';
    h += '<div style="display:flex;align-items:center;gap:8px">';
    h += '<span style="font-size:11px;color:var(--accent2)">编辑 ›</span>';
    h += '<button class="btn-out" style="padding:1px 8px;font-size:10px;color:#e06c75" onclick="event.stopPropagation();世界删除世界(\'' + escHtml(title) + '\')">🗑 删除</button>';
    h += '</div>';
    h += '</div>';
    h += '</div>';
  });
  h += '</div>';
  el.innerHTML = h;
}

// 点世界卡片 → 进入世界编辑/浏览
function 世界点击世界(title) {
  if (!title) return;
  Promise.all([Store.world.get(title), Store.world.loadContent(title)]).then(function(res) {
    世界当前世界 = { title: title, meta: res[0] || {}, content: res[1] || {} };
    世界当前版块 = '世界设定';
    世界当前维度 = '';
    世界切换视图('world-detail');
  });
}

window.世界渲染列表 = 世界渲染列表;
window.世界点击世界 = 世界点击世界;

// ============================================================
// 世界编辑器（开天辟地新建 = 空世界；详情 = 既有世界）
// 实时保存：填任何内容即时写盘。共用「基础信息 + 版块TAB + 子维度TAB + 条目列表」。
// ============================================================
function 世界渲染空编辑器() {
  // 开天辟地：从未命名空世界开始
  世界当前世界 = { title: '', meta: { title: '', description: '', modules: 世界可用模块.map(function(m){return m.id;}) }, content: {} };
  世界当前版块 = '世界设定';
  世界当前维度 = '';
  var el = document.getElementById('worldEditorView');
  if (el) 世界渲染编辑器();
}

function 世界渲染编辑器() {
  var el = document.getElementById('worldEditorView');
  if (!el) return;
  var w = 世界当前世界;
  if (!w) { el.innerHTML = '<div class="placeholder-text">请先选择一个世界或从「开天辟地」创建</div>'; return; }
  var title = w.title || '未命名世界';
  var h = '';

  // 顶部：返回（仅详情）+ 标题 + 实时保存提示 + 删除（仅详情）
  h += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap">';
  if (世界即视图 === 'world-detail') h += '<button class="btn-out" style="padding:3px 10px;font-size:11px" onclick="世界返回列表()">‹ 返回</button>';
  h += '<div style="font-size:15px;font-weight:700;flex:1"><span id="we-title">' + (title ? '🌍 ' : '💥 ') + escHtml(title || '开天辟地') + '</span></div>';
  h += '<button class="btn-out" style="padding:3px 10px;font-size:11px;color:var(--accent2)" title="粘贴一段叙述文本，逐段提取并全部生成世界观条目" onclick="世界提取文本生成()">📜 提取文本并全部生成</button>';
  if (世界即视图 === 'world-detail' && title) h += '<button class="btn-out" style="padding:3px 10px;font-size:11px;color:#e06c75" onclick="世界删除世界(\'' + escHtml(title) + '\')">🗑 删除世界</button>';
  h += '</div>';

  // 版块 TAB（sub-nav）
  h += '<div class="sub-nav" style="margin-bottom:8px;flex-wrap:wrap;row-gap:2px">';
  世界可用模块.forEach(function(m) {
    var sel = 世界当前版块 === m.id;
    h += '<div class="sub-nav-item' + (sel ? ' act' : '') + '" onclick="世界切换版块(\'' + m.id + '\')">' + m.icon + ' ' + m.label + '</div>';
  });
  h += '</div>';

  // 当前版块：子维度 TAB + 内容（基本设定表单 或 条目列表）
  h += '<div id="we-section"></div>';
  el.innerHTML = h;
  世界渲染版块();
}

var 世界改名计时 = null;   // 改名防抖计时器
var 世界待改名 = '';        // 待改名的新名

// 只刷新顶栏那行标题文字，**不重建整个编辑器**——
// 重建会把输入框一起换掉、光标与焦点全丢，用户打世界名时会被打断（原来就是这么坏的）。
function 世界刷新标题文字() {
  var el = document.getElementById('we-title');
  if (!el) return;
  var w = 世界当前世界;
  var t = (w && w.title) || '';
  el.textContent = (t ? '🌍 ' : '💥 ') + (t || '开天辟地');
}

// 世界内容能不能落盘：没填世界名就写，会被 本地FS.清理('') 变成「未命名」，
// 多个草稿还会互相覆盖 → 一律拦下并提示。
function 世界可写盘(w) {
  if (!w) { window.toast('未选择世界'); return false; }
  if (!w.title) { window.toast('请先填世界名，再写内容'); return false; }
  return true;
}

// 列表卡片缓存：任何改动（内容或 meta）后置空，回列表时才重新扫盘，
// 否则卡片上的简介 / 更新时间会一直是旧的。
function 世界列表失效() { 世界列表缓存 = null; }

// 同名世界检查：新建与改名都要先问一句，否则会静默覆盖掉那个世界的全部内容。
function 世界名占用(newName, 排除名) {
  if (!newName) return Promise.resolve(false);
  return Store.world.list().then(function(list) {
    return (list || []).some(function(x) { return x && x.title === newName && x.title !== 排除名; });
  }).catch(function() { return false; });
}

// 世界名输入（填名即建世界；已建世界改名——防抖后执行）
function 世界名输入() {
  var nameEl = document.getElementById('we-name');
  var w = 世界当前世界;
  if (!w || !nameEl) return;
  var name = nameEl.value.trim();
  if (!w.title) {
    // 首次填名：建世界（先查重——同名会把那个世界的 content 覆盖成空）
    if (!name) return;
    世界名占用(name).then(function(撞了) {
      if (撞了) {
        window.toast('已有同名世界「' + name + '」，换个名字（避免覆盖它）');
        nameEl.value = '';
        return;
      }
      // 建世界前再确认一次（await 期间用户可能又改了输入框）
      var name2 = nameEl.value.trim();
      if (!name2) return;
      w.title = name2;
      w.meta = w.meta || {};
      w.meta.title = name2;
      w.meta.modules = w.meta.modules || 世界可用模块.map(function(m){return m.id;});
      Store.world.save(name2, w.meta).then(function() {
        return Store.world.saveContent(name2, w.content || {});
      }).then(function() {
        w._草稿中 = false;
        世界列表失效();
        window.toast('已开天辟地: ' + name2);
        // 不重建编辑器：只换标题文字，输入框与焦点保持不动
        世界刷新标题文字();
      }).catch(function(e) { window.toast('创建失败: ' + (e && e.message ? e.message : '未知')); });
    });
    return;
  }
  // 已建世界：改名（防抖 600ms，避免每次键入都重建）
  if (name === w.title) { 世界待改名 = ''; return; }
  if (!name) { 世界待改名 = ''; return; }
  世界待改名 = name;
  if (世界改名计时) clearTimeout(世界改名计时);
  世界改名计时 = setTimeout(function() { 世界执行改名(世界待改名); }, 600);
}
window.世界名输入 = 世界名输入;

// 执行改名（旧名 → 新名）：更新 meta + 迁移 content.json + 删旧目录
var 世界改名中 = false;
function 世界执行改名(newName) {
  var w = 世界当前世界;
  if (!w || !w.title || 世界改名中) return;
  var oldName = w.title;
  if (!newName || newName === oldName) return;
  世界改名中 = true;
  // 查重：改到已有名字上会把那个世界覆盖掉，再顺手删掉自己的旧目录
  世界名占用(newName, oldName).then(function(撞了) {
    if (撞了) {
      世界改名中 = false;
      window.toast('已有同名世界「' + newName + '」，未改名');
      var el0 = document.getElementById('we-name');
      if (el0) el0.value = oldName;
      return;
    }
    w.meta = w.meta || {};
    w.meta.title = newName;
    // 1) 先写新目录信息文件 + content
    Store.world.save(newName, w.meta).then(function() {
      return Store.world.saveContent(newName, w.content || {});
    }).then(function() {
      // 2) 删旧目录（含旧信息文件 + content）
      return Store.world.delete(oldName).catch(function() { return null; });
    }).then(function() {
      世界改名中 = false;
      w.title = newName;
      w.meta.title = newName;
      世界列表失效();
      window.toast('已更名为: ' + newName);
      // 同样不重建编辑器，避免改名打到一半光标消失
      世界刷新标题文字();
    }).catch(function(e) {
      世界改名中 = false;
      window.toast('改名失败: ' + (e && e.message ? e.message : '未知'));
      var nameEl = document.getElementById('we-name');
      if (nameEl) nameEl.value = w.title;
    });
  });
}
window.世界执行改名 = 世界执行改名;

// 保存基础信息（实时保存 meta 简介）
function 世界基础保存() {
  var descEl = document.getElementById('we-desc');
  var w = 世界当前世界;
  if (!w || !descEl) return;
  var desc = descEl.value.trim();
  w.meta = w.meta || {};
  w.meta.description = desc;
  if (!w.title) { w._草稿中 = true; return; }  // 还没填世界名：先留在内存（切回来也不丢，见 世界渲染内容）
  w.meta.title = w.title;
  世界列表失效();   // 简介改了，列表卡片要跟着变（原来不清缓存 → 卡片一直是旧简介）
  Store.world.save(w.title, w.meta).catch(function(e) {
    window.toast('简介保存失败：' + (e && e.message ? e.message : '未知'));
  });
}

// 切换版块
// 某板块下「content 里存在、但版块表没登记」的维度（历史遗留）。
// 这些维度里的条目原来是彻底隐形的（渲染只按版块表铺 TAB），现在铺成带 ⚠ 的 TAB 亮出来。
function 世界额外维度(sectionContent, def) {
  var 登记 = ((def && def.维度) || []).map(function(d) { return d.名; });
  return Object.keys(sectionContent || {}).filter(function(k) {
    return k && 登记.indexOf(k) < 0 && (sectionContent[k] || []).length;
  });
}

// 一个板块里**界面上能看到的全部维度**（现行维度 + 旧维度），供条目弹窗的「所属维度」下拉用
function 世界可选维度(section) {
  var w = 世界当前世界;
  var def = 世界版块表[section] || { 维度: [] };
  var 列 = def.维度.map(function(d) { return d.名; });
  世界额外维度((w && w.content && w.content[section]) || {}, def).forEach(function(k) {
    if (列.indexOf(k) < 0) 列.push(k);
  });
  return 列;
}

function 世界切换版块(sec) {
  世界当前版块 = sec;
  世界当前维度 = '';
  世界子级索引 = -1;
  世界关联索引 = -1;
  世界高亮条目 = '';
  世界军队路径复位();
  var el = document.getElementById('we-section');
  if (el) 世界渲染版块();
}
window.世界切换版块 = 世界切换版块;

// 渲染当前版块：子维度 TAB + 内容（基本设定表单 或 条目列表）
function 世界渲染版块() {
  var el = document.getElementById('we-section');
  if (!el) return;
  var section = 世界当前版块;
  var def = 世界版块表[section] || { icon: '📄', 维度: [] };
  if (!世界当前维度 && def.维度.length) 世界当前维度 = def.维度[0].名;
  var w = 世界当前世界;
  var content = (w && w.content) || {};
  var sectionContent = content[section] || {};
  var h = '';

  // 子维度 TAB（版块表登记的维度 + **content 里实际存在、但版块表已没有的旧维度**）
  // 后者是历史遗留（早期的「种族与文明」「聚落」「剧情种子」等）：不铺出来，
  // 那些条目在界面上就永远看不见、也改不了（零锁定）。铺出来后可用条目弹窗里的
  // 「所属维度」把它们挪到现行维度，挪空后这个 TAB 自然消失。
  var 额外维度 = 世界额外维度(sectionContent, def);
  if (def.维度.length || 额外维度.length) {
    h += '<div class="sub-nav" style="margin-bottom:8px;flex-wrap:wrap;row-gap:2px">';
    def.维度.forEach(function(d) {
      var sel = 世界当前维度 === d.名;
      h += '<div class="sub-nav-item' + (sel ? ' act' : '') + '" style="font-size:11px" onclick="世界切换维度(\'' + d.名 + '\')">' + d.名 + '</div>';
    });
    额外维度.forEach(function(d) {
      var sel = 世界当前维度 === d;
      h += '<div class="sub-nav-item' + (sel ? ' act' : '') + '" style="font-size:11px;color:var(--warning)" ' +
        'title="旧维度「' + escHtml(d) + '」不在当前版块结构里，这里只是把里面的条目亮出来；编辑条目时可用「所属维度」把它们挪到现行维度" ' +
        'onclick="世界切换维度(\'' + escHtml(d) + '\')">⚠ ' + escHtml(d) + '</div>';
    });
    h += '</div>';
  }

  // 若当前维度是「基本设定」（meta:true），渲染基础信息表单
  var curDimDef = null;
  for (var di = 0; di < (def.维度||[]).length; di++) if (def.维度[di].名 === 世界当前维度) { curDimDef = def.维度[di]; break; }
  if (curDimDef && curDimDef.meta) {
    h += 世界渲染基本设定(w);
    el.innerHTML = h;
    return;
  }

  // 当前子维度条目列表（或子级视图）
  var dimName = 世界当前维度;
  var dimData = (dimName && sectionContent[dimName]) ? sectionContent[dimName] : [];
  var 可下钻 = !!(def.可下钻);

  // ===== 进条目内部（大块小块）=====
  // 军队 / 地理 两个板块有「内部块」配置，一律走同一套分组渲染：
  //   空块照常显示，块里写出这一块该写什么，点一下就能加。
  // 其余板块点条目：势力 → 进关联界面（见下）；物品 / 种族 / 文化 / 时间线 → 弹详情。
  if (世界有内部块(section, dimName) && 世界子级索引 >= 0 && dimData[世界子级索引]) {
    h += 世界渲染内部(dimName);
    el.innerHTML = h;
    return;
  }
  // ===== 其余可下钻板块：通用的「子级列表」视图 =====
  // 与「内部块」共用同一套工具条与条目卡（＋新增 / 🗑全部清除 / ✨AI生成；每条 ✏️编辑 · 🗑删除 · 下钻 ›）
  // （势力不在其中：它不配「可下钻」，也没有任何子级数据。）
  if (可下钻 && 世界子级索引 >= 0 && dimData[世界子级索引]) {
    h += 世界渲染子级(dimName, dimData[世界子级索引]);
    el.innerHTML = h;
    return;
  }
  // ===== 历史年表：不铺卡片，渲染成一条从上到下、从古到今连着的线 =====
  if (curDimDef && curDimDef.时间轴) {
    h += 世界渲染时间轴(dimName, dimData);
    el.innerHTML = h;
    return;
  }
  // ===== 势力：关联界面（点条目直接进这里，没有别的前置）=====
  // 汇出的是「整个世界除世界设定以外、与它相关联的一切」，按板块 → 维度两级筛，现扫现汇。
  var 有关联 = !!(def.关联);
  if (有关联 && 世界关联索引 >= 0 && dimData[世界关联索引]) {
    h += 世界渲染关联(dimName, dimData[世界关联索引]);
    el.innerHTML = h;
    return;
  }
  h += '<div class="n-card" style="padding:14px">';
  // 标准工具条：＋新增 / 🗑全部清除 / ✨AI生成（三级共用同一个函数）
  h += 世界工具条({
    标题: dimName || section,
    计数: dimData.length,
    新增: '世界新增条目()',
    清除: '世界全清本级()',
    AI: '世界AI生成()',
  });

  if (!dimData.length) {
    h += '<div style="text-align:center;padding:22px 12px;color:var(--fg3)">';
    h += '<div style="font-size:11px;margin-bottom:10px">还没有内容，可「＋ 新增」手动添加或用「✨ AI 生成」自动产出</div>';
    h += '<button class="btn-out" style="padding:3px 14px;font-size:12px" onclick="世界新增条目()">＋ 新增</button>';
    h += '<span style="margin:0 4px"></span>';
    h += '<button class="btn-main" style="padding:3px 14px;font-size:12px" onclick="世界AI生成()">✨ AI 生成</button>';
    h += '</div>';
  } else {
    h += '<div style="display:flex;flex-direction:column;gap:6px">';
    dimData.forEach(function(item, idx) {
      var t = item['条目'] || item['标题'] || item['名称'] || item['项目'] || '条目';
      var hasSub = 可下钻 && item['子级'] && item['子级'].length;
      var 高亮 = (t && t === 世界高亮条目);
      // 主列表：**点整块方框 = 直接进入**，不等它有没有子级，点一下就走（与「点击即跳转」同一条理）。
      //   军队 / 地理 / 物品·随从 → 进内部（大块小块，空块也照常铺开，接着填就行）；
      //   势力 → **直接进关联界面**（现扫全库，把它名下的一切汇出来）；
      //   其余板块 → 弹详情。
      var 军队块 = 世界有内部块(section, dimName);
      var 有内部块 = 军队块;
      var 点击动作 = 有内部块
        ? '世界进入子级(' + idx + ')'
        : (有关联
          ? '世界展开关联(' + idx + ')'
          : (可下钻 && hasSub
            ? '世界进入子级(' + idx + ')'
            : '世界查看条目(\'' + escHtml(section) + '\',\'' + escHtml(dimName) + '\',\'' + escHtml(t) + '\')'));
      h += '<div style="background:var(--bg2);border:1px solid ' + (高亮 ? 'var(--accent2)' : 'var(--border)') + ';border-left:3px solid ' + (高亮 ? 'var(--accent2)' : 'var(--border)') + ';border-radius:8px;padding:10px;cursor:pointer" title="点击进入" onclick="' + 点击动作 + '">';
      h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;flex-wrap:wrap">';
      h += '<div style="font-size:13px;font-weight:700;color:var(--fg);flex:1">' + escHtml(t) + '</div>';
      // 条目卡的标准操作位：✏️编辑 · 🗑删除，右侧再挂一个「往下走」的入口。
      //   军队 = 进入内部；地理 = 下钻（进内部）；势力 = 展开关联（与点方框同一个动作）。
      h += '<button class="btn-out" style="padding:1px 8px;font-size:9px" onclick="event.stopPropagation();世界编辑条目(' + idx + ')">✏️ 编辑</button>';
      h += '<button class="btn-out" style="padding:1px 8px;font-size:9px;color:#e06c75" onclick="event.stopPropagation();世界删本级条目(' + idx + ')">🗑 删除</button>';
      if (军队块) {
        h += '<button class="btn-out" style="padding:1px 8px;font-size:9px;color:var(--accent2)" title="' + (section === '物品' ? '进她的内部（阶次梯）' : '进它的内部（七个分组）') + '" onclick="event.stopPropagation();世界进入子级(' + idx + ')">进入内部 ›</button>';
      } else {
        if (可下钻 && hasSub) {
          h += '<button class="btn-out" style="padding:1px 8px;font-size:9px;color:var(--accent2)" title="进它的下级" onclick="event.stopPropagation();世界进入子级(' + idx + ')">下钻 ' + item['子级'].length + ' ›</button>';
        }
        if (有关联) {
          h += '<button class="btn-out" style="padding:1px 8px;font-size:9px;color:var(--accent2)" title="汇出挂在这个势力名下的一切（地理 / 种族 / 军队 / 物品 / 文化 / 时间线）" onclick="event.stopPropagation();世界展开关联(' + idx + ')">展开关联 ›</button>';
        }
      }
      h += '</div>';
      h += 世界条目正文(item);
      h += '</div>';
    });
    h += '</div>';
  }
  h += '</div>';
  el.innerHTML = h;
}

// ============================================================
// 历史年表 · 时间轴
// 这一维度**不是一堆并列的卡片，而是一条从上到下、从古到今连着的线**：
// 条目按「时序」排成轴上的站点。只放纪元本身；时间观念 / 工具类归「世界设定 · 宇宙与法则」。
// ============================================================
function 世界渲染时间轴(dimName, items) {
  items = items || [];
  var 有轴 = [], 无轴 = [];
  items.forEach(function(it) {
    var n = Number(it['时序']);
    if (isFinite(n) && n > 0) 有轴.push(it); else 无轴.push(it);
  });
  有轴.sort(function(a, b) { return Number(a['时序']) - Number(b['时序']); });
  // 没填「时序」的条目不能凭空消失（零锁定）：排在轴尾并标「未定序」，而不是另立一块
  var 轴 = 有轴.concat(无轴);

  var h = '<div class="n-card" style="padding:14px">';
  // 工具条
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">';
  h += '<div style="font-size:13px;font-weight:700;flex:1">⏳ ' + escHtml(dimName || '历史年表') +
       ' <span style="font-size:10px;color:var(--fg3);font-weight:400">一条从古到今连着的线 · ' + 轴.length + ' 站</span></div>';
  h += '<button class="btn-out" style="padding:2px 10px;font-size:11px" onclick="世界新增条目()">＋ 新增</button>';
  h += '<button class="btn-out" style="padding:2px 10px;font-size:11px;color:#e06c75" title="清空当前维度的全部条目" onclick="世界全清本级()">🗑 全部清除</button>';
  h += '<button class="btn-main" style="padding:2px 10px;font-size:11px" onclick="世界AI生成()">✨ AI 生成</button>';
  h += '</div>';
  // 固定说明：这一维度只表先后，没有年代
  h += '<div style="font-size:10px;color:var(--fg3);line-height:1.6;margin-bottom:10px;padding:6px 10px;background:var(--bg2);border:1px dashed var(--border);border-radius:8px">' +
       '本世界没有绝对编年（语料里几乎不出现年月日）：这条线只表示先后顺序，站点之间没有年代。</div>';

  if (!items.length) {
    h += '<div style="text-align:center;padding:22px 12px;color:var(--fg3)">';
    h += '<div style="font-size:11px;margin-bottom:10px">还没有内容，可「＋ 新增」手动添加或用「✨ AI 生成」自动产出</div>';
    h += '<button class="btn-out" style="padding:3px 14px;font-size:12px" onclick="世界新增条目()">＋ 新增</button>';
    h += '<span style="margin:0 4px"></span>';
    h += '<button class="btn-main" style="padding:3px 14px;font-size:12px" onclick="世界AI生成()">✨ AI 生成</button>';
    h += '</div></div>';
    return h;
  }

  // ===== 轴线 =====
  if (轴.length) {
    h += '<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--fg3);margin:2px 0 8px 28px">';
    h += '<span>▲ 最古</span><span>越往下越近 ▼</span></div>';
    h += '<div style="position:relative;padding-left:28px">';
    h += '<div style="position:absolute;left:10px;top:10px;bottom:10px;width:2px;border-radius:2px;background:linear-gradient(180deg,var(--accent2),var(--border))"></div>';
    轴.forEach(function(it) {
      var idx = items.indexOf(it);
      var 有序列 = Number(it['时序']) > 0;
      h += '<div style="position:relative;margin-bottom:10px">';
      h += '<div style="position:absolute;left:-24px;top:15px;width:12px;height:12px;border-radius:50%;background:' + (有序列 ? 'var(--accent2)' : 'var(--border)') + ';border:2px solid var(--bg);box-sizing:border-box"></div>';
      h += '<div style="background:var(--bg2);border:1px solid var(--border);border-left:3px solid ' + (有序列 ? 'var(--accent2)' : 'var(--border)') + ';border-radius:8px;padding:10px;cursor:pointer" title="点击查看" onclick="世界查看条目(\'' + escHtml(世界当前版块) + '\',\'' + escHtml(dimName) + '\',\'' + escHtml(it['条目'] || '条目') + '\')">';
      h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;flex-wrap:wrap">';
      h += 有序列
        ? '<span style="font-size:9px;color:var(--accent2);border:1px solid var(--accent2);border-radius:8px;padding:0 6px;flex-shrink:0">第 ' + escHtml(String(it['时序'])) + ' 站</span>'
        : '<span style="font-size:9px;color:var(--fg3);border:1px dashed var(--border);border-radius:8px;padding:0 6px;flex-shrink:0">未定序</span>';
      h += '<div style="font-size:13px;font-weight:700;color:var(--fg);flex:1">' + escHtml(it['条目'] || '条目') + '</div>';
      h += '<button class="btn-out" style="padding:1px 8px;font-size:9px" onclick="event.stopPropagation();世界编辑条目(' + idx + ')">✏️ 编辑</button>';
      h += '<button class="btn-out" style="padding:1px 8px;font-size:9px;color:#e06c75" onclick="event.stopPropagation();世界删本级条目(' + idx + ')">🗑 删除</button>';
      h += '</div>';
      if (it['详细描述']) h += '<div style="font-size:11px;color:var(--fg2);line-height:1.65;margin-top:3px">' + escHtml(it['详细描述']) + '</div>';
      // 「所属势力」始终在这张卡的最下方
      if (it['所属势力']) h += '<div style="font-size:10px;color:var(--accent2);margin-top:6px">🫱 ' + escHtml(it['所属势力']) + '</div>';
      h += '</div></div>';
    });
    h += '</div>';
  }
  h += '</div>';
  return h;
}

// 条目下级视图：显示某个条目的「子级」列表（地理的街道/店铺/地标，或势力的下级条目）
// 与「维度列表」**共用同一套**工具条与条目卡：＋新增 / 🗑全部清除 / ✨AI生成，
// 每条右侧 ✏️编辑 · 🗑删除 · 下钻 ›。字段名与正文样式也一致（世界条目正文）。
//
// 【现状：暂时走不到这里 —— 刻意留着】
// 调用它的只有 世界渲染版块 里那一支「可下钻、但没有内部块」的分支，而当前两个 可下钻 板块
// （军队 / 地理）都被登记为有内部块（见 世界有内部块），所以现在一定从上面那条内部块分支返回。
// 保留它是**设计上的将来路径**：哪天再加一个「可下钻、但不按分组铺」的板块（比如纯粹的下级清单），
// 就是这一套；也让 世界新增条目 / 世界全清本级 这类本级操作有个现成的落点。
// 与之配套的 世界AI生成子级() 是同一件事的 AI 入口（同样是预留）。
function 世界渲染子级(dimName, parentItem) {
  var items = parentItem['子级'] || [];
  var h = '<div class="n-card" style="padding:14px">';
  h += 世界工具条({
    返回文字: dimName,
    返回动作: '世界返回上级()',
    标题: parentItem['条目'] || '条目',
    计数: items.length,
    新增: '世界新增条目()',
    清除: '世界全清本级()',
    AI: '世界AI生成子级()',
  });
  if (!items.length) {
    h += '<div style="text-align:center;padding:22px 12px;color:var(--fg3)">';
    h += '<div style="font-size:11px;margin-bottom:10px">还没有内容，可「＋ 新增」手动添加或用「✨ AI 生成」自动产出</div>';
    h += '<button class="btn-out" style="padding:3px 14px;font-size:12px" onclick="世界新增条目()">＋ 新增</button>';
    h += '<span style="margin:0 4px"></span>';
    h += '<button class="btn-main" style="padding:3px 14px;font-size:12px" onclick="世界AI生成子级()">✨ AI 生成</button>';
    h += '</div>';
  } else {
    h += '<div style="display:flex;flex-direction:column;gap:6px">';
    items.forEach(function(item, idx) {
      var t = item['条目'] || item['标题'] || item['名称'] || item['项目'] || '条目';
      var hasSub = item['子级'] && item['子级'].length;
      h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;cursor:pointer" title="点击进入它的下级" onclick="世界进入子级(' + idx + ')">';
      h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;flex-wrap:wrap">';
      h += '<div style="font-size:13px;font-weight:700;color:var(--fg);flex:1">' + escHtml(t) + '</div>';
      h += '<button class="btn-out" style="padding:1px 8px;font-size:9px" onclick="event.stopPropagation();世界编辑条目(' + idx + ')">✏️ 编辑</button>';
      h += '<button class="btn-out" style="padding:1px 8px;font-size:9px;color:#e06c75" onclick="event.stopPropagation();世界删本级条目(' + idx + ')">🗑 删除</button>';
      if (hasSub) {
        h += '<button class="btn-out" style="padding:1px 8px;font-size:9px;color:var(--accent2)" title="进它的下级" onclick="event.stopPropagation();世界进入子级(' + idx + ')">下钻 ' + item['子级'].length + ' ›</button>';
      }
      h += '</div>';
      h += 世界条目正文(item);
      h += '</div>';
    });
    h += '</div>';
  }
  h += '</div>';
  return h;
}

// ============================================================
// 条目内部 · 两个板块（军队七个分组 / 地理六个分组）
// ------------------------------------------------------------
// 点开任一条**军队条目**或**地理条目**，进到它的**内部**：
//   军队：历史与传说 · 战力与装备 · 阶序与晋升 · 军法与惩戒 · 征募与补充 · 驻地与营垒 · 俘获与处置
//   地理：地标性建筑 · 自然景观 · 城区与分区 · 道路与门户 · 郊野与水系 · 防御与关隘
// 每块内部是它自己的条目，**显示全文，不截断**。
//
// **内部条目不再往下钻**——这一层就是叶子。点条目名没有任何动作，
// 想改就点卡片上的 ✏️（改名 / 改描述）；想进内部只有一条路：在条目列表里点那一条。
// 所以「点击就跳转」只跳一次：子 TAB → 条目内部。
//
// 与「势力关联总览」的关系（这一点是刻意的）：
//   势力那边的小条目是**关联来的**——现扫全库，谁填了这个势力名就汇过来，本身不存数据，
//   「大块 + 块内卡片」的观感就是照它做的；
//   军队 / 地理这边是**它自己的下一层**——存在条目自己的「子级」数组里。
// ============================================================

// ============================================================
// 条目内部 · 分组（多个板块共用同一套渲染）
// ------------------------------------------------------------
// 凡是**有条目内部**的板块，一律铺成**大块 + 块内小卡片**：
//   军队：历史与传说 / 战力与装备 / 阶序与晋升 / 军法与惩戒 / 征募与补充 / 驻地与营垒 / 俘获与处置
//   地理：地标性建筑 / 自然景观 / 城区与分区 / 道路与门户 / 郊野与水系 / 防御与关隘
//   其余板块：用一套通用块（来历与沿革 / 关联与纠葛 / 风貌与习气 / 传承与秘辛 / 局势与动向）
// 势力**不走这一套**：它点进去是关联界面（现扫全库，汇出挂在它名下的一切），
// 不是一套预先定好的分类——「治下疆域 / 治下军民」那种固定块这个世界不需要。
// 分组名存在子条目的「分组」字段上；**空块照常显示**（零锁定），块里直接写出这一块该写什么。
// ============================================================

var 世界军队分组 = [
  '历史与传说',      // 它从哪来、打过什么仗、世人怎么讲它
  '战力与装备',      // 用什么打、护甲与附魔、怕什么、克制谁
  '阶序与晋升',      // 军阶与位阶次序、靠什么升
  '军法与惩戒',      // 军规、违令与怯战的下场、刑具与刑场
  '征募与补充',      // 从哪招、怎么补员、强征、买、掳
  '驻地与营垒',      // 军营、要塞、据点、母港与内部构造
  '俘获与处置',      // 抓来的人怎么分级使用、献祭、烙印、变卖
];

var 世界军队分组引导 = {
  '历史与传说': '它从哪来、由谁所创、打过哪些仗、世人怎么讲它（诨名、歌谣、悬赏、它留下的痕迹）。',
  '战力与装备': '它用什么打、护甲与附魔、战场上的打法与阵型、怕什么、克制谁。',
  '阶序与晋升': '军阶与位阶的次序、靠什么升（战功 / 血统 / 献祭 / 性役）、位阶与待遇的对应。',
  '军法与惩戒': '军规、违令与怯战的下场、刑罚与刑具、羞辱刑与示众。',
  '征募与补充': '从哪招人、怎么补员、强征与买卖、被掳来的人如何编入。',
  '驻地与营垒': '军营、要塞、据点、母港与行军路线，以及驻地的内部构造。',
  '俘获与处置': '抓来的人怎么分级使用（生育 / 献祭 / 当魔力容器 / 变卖）、烙印与驯化，以及「征用」的具体做法。',
};

// 地理的分组：**这一块装的是地点，不是内容**——人文景观与自然景观为主。
// 顺序：第一块是地标性建筑（用户指定），往下依次是自然景观、城区与分区、道路与门户、郊野与水系、防御与关隘。
var 地理分组引导 = {
  '地标性建筑': '这一带有名字的标志性建筑与胜景：宫室、神殿、塔楼、广场、桥梁、城门、纪念物、奇观。写清它是什么、在哪、谁造的、如今什么样。',
  '自然景观': '天生的地形与景致：山脉、森林、湖泊、海湾、河川、平原、洞窟、岛屿、异象。写清它的形貌与特别之处。',
  '城区与分区': '内部怎么划分：区、坊、环、岛、领地、街区，各是哪一块、彼此怎么连。',
  '道路与门户': '进出的通道：城门、关隘、渡口、桥梁、港口、航路、要道。写清它通向哪里、为什么重要。',
  '郊野与水系': '外围的地面与水域：郊野、农田、林场、滩涂、近海、水道、沟渠。',
  '防御与关隘': '守卫这一带的东西：城墙、要塞、哨所、堡垒、封锁线、工事。',
};
// 人物（随从 / 奴仆）**不做内部细分**：她的一切（来历、阶次、纠葛、动向）直接写进自己的「详细描述」。
// 所以这里没有「随从分组」；点人物条目就是看她的表述。军队 / 地理仍然是内部块——
// 那两个装的是成建制的编排与地点分区，和人不是一回事。

// 通用块：给「有内部块、但不属于军队 / 地理」的板块兜底（目前没有这种板块，留着以便将来新板块直接用）
var 通用分组引导 = {
  '来历与沿革': '它从哪来、由谁所创、经历过哪些变迁。',
  '关联与纠葛': '它和哪些人 / 势力 / 地方有关，是同盟、世仇还是隶属。',
  '风貌与习气': '它看起来是什么样、有什么独有的做派与风气。',
  '传承与秘辛': '它独有的技艺、传承、不为人知的隐秘。',
  '局势与动向': '眼下的处境与下一步可能往哪走。',
};

// 当前板块 / 维度该用哪一套分组 / 引导
//   军队 → 七个兵种分组；地理 → 六个地点分组；其余（含物品·随从 / 奴仆）→ 通用块
// 注：只有 军队 / 地理 被登记为「有内部块」（见 世界有内部块）；物品·随从 / 奴仆 是普通条目。
function 世界分组表(section, dim) {
  if (section === '军队') return 世界军队分组;
  if (section === '地理') return Object.keys(地理分组引导);
  return Object.keys(通用分组引导);
}
// 这个板块 / 维度是不是**有条目内部**（决定点条目进去是「大块小块」还是「普通列表 / 关联」）
//   只有军队 / 地理。人物（随从 / 奴仆）不细分，点条目就是看她的表述。
//   势力点进去是**关联界面**，不算内部块。
function 世界有内部块(section, dim) {
  return section === '军队' || section === '地理';
}
function 世界分组引导表(section, dim) {
  if (section === '军队') return 世界军队分组引导;
  if (section === '地理') return 地理分组引导;
  return 通用分组引导;
}
// 当前板块的分组里，某一条子级属于哪一块（没标分组的落第一块）
function 世界子级分组名(section, it) {
  var 组 = 世界分组表(section, 世界当前维度);
  var g = it && it['分组'];
  return (g && 组.indexOf(g) >= 0) ? g : 组[0];
}

// 军队内部用的就是通用的 世界子级索引——不再另立一套下标。
// 进内部走 世界进入子级(idx)，退出走 世界返回上级()，与地理 / 势力完全同一条路。
function 世界军队路径复位() { 世界子级索引 = -1; }

// 当前正在查看的那一条军队条目
function 世界军队当前父() {
  var w = 世界当前世界;
  var list = (w && w.content && w.content[世界当前版块] && w.content[世界当前版块][世界当前维度]) || [];
  return (世界子级索引 >= 0 && list[世界子级索引]) ? list[世界子级索引] : null;
}

// 「🗑 全部清除」：把这个条目的七个分组一次清空（与「维度列表」的清空同级）
function 世界军队全清() {
  var parent = 世界军队当前父();
  if (!parent || !(parent['子级'] || []).length) { window.toast('这一条还没有内部设定'); return; }
  var n = parent['子级'].length;
  window.confirmDialog('确定清除「' + (parent['条目'] || '这一条') + '」下的全部 ' + n + ' 条内部设定？该操作不可撤销。', function() {
    parent['子级'] = [];
    世界军队保存('已全部清除');
  });
}
window.世界军队全清 = 世界军队全清;

// 进某条内部设定的下级（军用不着，留个入口免得点了没反应）
function 世界军队子级下钻(分组, 下标) {
  var parent = 世界军队当前父();
  if (!parent || !parent['子级'] || !parent['子级'][下标]) return;
  window.toast('这一层是叶子，不能再往下钻；点 ✏️ 改它的名字或描述');
}
window.世界军队子级下钻 = 世界军队子级下钻;

// 取某一条内部设定属于哪个分组的条目。
// 分组名一律按**指定的板块**那套判定，不看当前板块——AI 生成期间用户可能已经切走，
// 那时 世界当前版块 不再是原板块，按当前板块判会把分组判错（地理曾被判成军队的组）。
function 世界内部分组条目(parent, 分组, sec) {
  sec = sec || 世界当前版块;
  return ((parent && parent['子级']) || []).filter(function(it) {
    return 世界子级分组名(sec, it) === 分组;
  });
}

// 内部块 AI 生成的目标：优先用点「✨ AI 生成」时锁定的快照（世界 / 板块 / 维度 / 条目下标），
// 这样生成期间用户切 tab、切条目，结果也一定写回原来那一条；
// 快照不存在或已失效（比如那一条被删了）时，回退到当前打开的那一条。
// sec 必传：军队走 '军队'，地理走 '地理'——两边的分组名、提示词、快照板块都必须各自成套。
function 世界内部目标(sec) {
  sec = sec || 世界当前版块;
  var snap = 世界生成快照;
  if (snap && snap.版块 === sec && snap.世界) {
    var arr = ((snap.世界.content || {})[sec] || {})[snap.维度] || [];
    var p = arr[snap.子级索引];
    if (p) return { 世界: snap.世界, 版块: sec, 维度: snap.维度, 索引: snap.子级索引, 父: p, 锁定: true };
  }
  var w = 世界当前世界;
  var 是同板块 = (世界当前版块 === sec);
  var list = (w && w.content && w.content[sec] && w.content[sec][世界当前维度]) || [];
  var p2 = (是同板块 && 世界子级索引 >= 0) ? list[世界子级索引] : null;
  return { 世界: w, 版块: sec, 维度: 世界当前维度, 索引: 世界子级索引, 父: p2 || null, 锁定: false };
}

// 进入某一条的内部 / 退出内部
function 世界军队进入(idx) { 世界子级索引 = idx; 世界军队重绘(); }
function 世界军队退() { 世界子级索引 = -1; 世界军队重绘(); }
function 世界军队退到列表() { 世界子级索引 = -1; 世界军队重绘(); }
function 世界军队重绘() {
  var el = document.getElementById('we-section');
  if (el) 世界渲染版块();
}
window.世界军队进入 = 世界军队进入;
window.世界军队退 = 世界军队退;
window.世界军队退到列表 = 世界军队退到列表;

function 世界军队保存(msg) {
  var w = 世界当前世界;
  if (!世界可写盘(w)) return;
  Store.world.saveContent(w.title, w.content || {}).then(function() {
    if (msg) window.toast(msg);
    世界军队重绘();
  }).catch(function(e) { window.toast('保存失败：' + (e && e.message ? e.message : '未知')); });
}

// ===== 主渲染：一条内部条目（军队的兵种 / 地理的地点，同一套大块小块）=====
function 世界渲染内部(dimName) {
  var sec = 世界当前版块;
  var 分组名表 = 世界分组表(sec, dimName);
  var 当前 = 世界军队当前父();
  if (!当前) { 世界子级索引 = -1; return ''; }
  var 内层 = 当前['子级'] || [];
  var h = '<div class="n-card" style="padding:0">';

  // 与其它层级共用同一套工具条：返回 · 标题 · ＋新增 · 🗑全部清除 · ✨AI生成。
  // 这块内部按该板块的分组铺开，所以三个按钮作用于**这些分组的全体**（与「维度列表」同级的意思）。
  h += 世界工具条({
    返回文字: dimName,
    返回动作: '世界军队退()',
    标题: 当前['条目'] || '未命名',
    计数: 内层.length,
    计数单位: '条内部设定',
    新增: '世界军队加(\'\')',
    清除: '世界军队全清()',
    // 按当前板块选字段：地理走地理那一套（六个地点分组），军队走七个兵种分组
    // 原来这里写死「世界军队AI」→ 在地理条目里也会按军队出题、按军队锁定快照
    AI: '世界内部AI(\'\')',
  });

  // 条目正文（它是「什么」）：点一下就地改，**全文显示，不截断**
  // 注：这一条自己的「改名 / 删除」不在这里——在**条目列表**上点 ✏️ / 🗑 就能改，
  // 内部不再重开一套（与外边重复，而且容易两个地方改出不一样的认知）。
  h += '<div style="padding:12px 14px;border-bottom:1px solid var(--border)">';
  h += '<div id="wm-desc" style="font-size:11.5px;color:var(--fg2);line-height:1.8;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px 12px;min-height:20px;cursor:text" ' +
       'title="点这里直接改这一条的描述" onclick="世界军队改描述()">' +
       (当前['详细描述'] ? escHtml(当前['详细描述']) : '<span style="color:var(--fg3)">（还没有描述）点这里写这一条是什么</span>') + '</div>';
  h += '</div>';

  // ===== 该板块的全部分组：每块内部是卡片，显示全文 =====
  h += '<div style="padding:4px 14px 16px">';
  分组名表.forEach(function(分组) {
    var 组 = 世界内部分组条目(当前, 分组, sec);
    h += '<div style="margin-top:14px">';
    h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">';
    h += '<div style="font-size:12px;font-weight:700;color:var(--fg)">' + escHtml(分组) +
         '<span style="font-size:10px;color:var(--fg3);font-weight:400"> · ' + 组.length + '</span></div>';
    h += '<span style="flex:1"></span>';
    h += '<button class="btn-out" style="padding:1px 8px;font-size:9px" onclick="世界军队加(\'' + escHtml(分组) + '\')">＋ 新增</button>';
    h += '<button class="btn-main" style="padding:1px 8px;font-size:9px" onclick="世界内部AI(\'' + escHtml(分组) + '\')">✨ AI 生成</button>';
    h += '</div>';
    if (!组.length) {
      h += '<div style="font-size:10px;color:var(--fg3);line-height:1.7;background:var(--bg2);border:1px dashed var(--border);border-radius:8px;padding:7px 10px;cursor:pointer" ' +
           'title="点这里往这一块里加一条" onclick="世界军队加(\'' + escHtml(分组) + '\')">' +
           '<span style="color:var(--fg2)">' + escHtml(世界分组引导表(sec, dimName)[分组] || '') + '</span><br>' +
           '（这一块还空着）点这里加一条，或点右侧 ✨ 让 AI 按「' + escHtml(当前['条目'] || '') + '」生成这一块</div>';
    } else {
      h += '<div style="display:flex;flex-direction:column;gap:5px">';
      组.forEach(function(it) {
        var 名 = it['条目'] || '未命名';
        // 下标在**父条目 子级 数组**里的真实位置（世界内部分组条目 给的是筛过的条目，不带上标）
        var 下标 = 内层.indexOf(it);
        // 条目卡与其它层级同构：✏️编辑 · 🗑删除 ·（有下级时）下钻 ›；正文全文展开
        h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:9px 11px">';
        h += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">';
        h += '<div style="font-size:13px;font-weight:700;color:var(--fg);flex:1">' + escHtml(名) + '</div>';
        h += '<button class="btn-out" style="padding:1px 8px;font-size:9px" title="改名 / 改描述" onclick="世界军队改(\'' + escHtml(分组) + '\',' + 下标 + ')">✏️ 编辑</button>';
        h += '<button class="btn-out" style="padding:1px 8px;font-size:9px;color:#e06c75" title="删掉这一条" onclick="世界军队删这层(\'' + escHtml(分组) + '\',' + 下标 + ')">🗑 删除</button>';
        if (it['子级'] && it['子级'].length) {
          h += '<button class="btn-out" style="padding:1px 8px;font-size:9px;color:var(--accent2)" title="进它的下级" onclick="世界军队子级下钻(\'' + escHtml(分组) + '\',' + 下标 + ')">下钻 ' + it['子级'].length + ' ›</button>';
        }
        h += '</div>';
        h += 世界条目正文(it, { '所属势力': 1 });
        h += '</div>';
      });
      h += '</div>';
    }
    h += '</div>';
  });
  h += '</div></div>';
  return h;
}

// ===== 新增 / 编辑一条内部设定（弹窗只在编辑时开）=====
function 世界军队弹窗(可选分组, 下标) {
  var parent = 世界军队当前父();
  if (!parent) { window.toast('请先进入一个' + (世界当前版块 || '') + '条目'); return; }
  var 编辑 = (下标 >= 0);
  var sub = parent['子级'] || (parent['子级'] = []);
  var 分组表 = 世界分组表(世界当前版块, 世界当前维度);
  // 即时保存：新增时**先把草稿放进数据里**（下面 世界内部弹窗暂存 每敲一下就写它），
  // 弹窗里不再有「保存」这个提交动作——见文件上方「弹窗 · 即时保存共用件」。
  var it;
  if (编辑) {
    it = sub[下标];
  } else {
    it = { '条目': '', '详细描述': '', '分组': 可选分组 || 分组表[0] };
    sub.push(it);
    下标 = sub.length - 1;
  }
  if (!it) { window.toast('这一条已经不在了'); return; }
  var 当前分组 = it['分组'] || 分组表[0];
  if (分组表.indexOf(当前分组) < 0) 当前分组 = 分组表[0];
  var 名 = it['条目'] || '';
  var 描 = it['详细描述'] || '';
  var h = '<div class="mcard" style="max-width:580px">';
  h += '<div style="font-size:14px;font-weight:700;margin-bottom:3px">' + (编辑 ? '✏️ 改这一条' : '＋ 往「' + escHtml(当前分组) + '」里加一条') + '</div>';
  h += '<div style="font-size:10px;color:var(--fg3);margin-bottom:12px">' + escHtml(parent['条目'] || '') + ' · 内部　·　改动即时保存</div>';
  h += '<div style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:3px">归入哪一块</label>';
  h += '<select id="wm-group" class="llm-input" style="width:100%" onchange="世界弹窗防抖保存(世界弹窗存那一笔)">';
  分组表.forEach(function(g) {
    h += '<option value="' + escHtml(g) + '"' + (g === 当前分组 ? ' selected' : '') + '>' + escHtml(g) + '</option>';
  });
  h += '</select></div>';
  h += '<div style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:3px">名称</label>';
  // 名称的占位示例按板块给：军队是编成与军法，地理是地点分区（原来只有军队那几句，地理会看到不对味的例子）
  var 名例 = (世界当前版块 === '地理')
    ? '如：宫室与神殿 / 港汊与渡口 / 外垒与哨所'
    : '如：三三制营伍 / 附魔冰霜长戟 / 鞭刑与黥面';
  h += '<input id="wm-title" class="llm-input" style="width:100%" value="' + escHtml(名) + '" placeholder="' + escHtml(名例) + '" oninput="世界弹窗防抖保存(世界弹窗存那一笔)"></div>';
  h += '<div style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:3px">描述</label>';
  h += '<textarea id="wm-desc2" class="llm-input" style="width:100%;min-height:130px;resize:vertical" placeholder="把这一条写具体些……" oninput="世界弹窗防抖保存(世界弹窗存那一笔)">' + escHtml(描) + '</textarea></div>';
  h += '<div style="display:flex;gap:8px;justify-content:flex-end">';
  h += '<button class="btn-out" onclick="世界弹窗取消()">取消</button>';
  h += '<button class="btn-main" onclick="世界弹窗完成()">完成</button>';
  h += '</div></div>';
  // 这一笔怎么存 / 草稿是哪一个：交给共用的「完成 / 取消」收尾
  世界弹窗草稿项 = 编辑 ? null : it;
  世界弹窗存fn = function() { 世界内部弹窗暂存(下标); };
  世界关闭所有弹窗();
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) 世界弹窗取消(); });
}

function 世界军队加(分组) { 世界军队弹窗(分组, -1); }
window.世界军队加 = 世界军队加;
function 世界军队改(分组, 下标) { 世界军队弹窗(分组, 下标); }
window.世界军队改 = 世界军队改;

// 把弹窗里的值写进那一条内部设定（静默：不关窗、不提示——即时保存不刷屏）
function 世界内部弹窗暂存(下标) {
  var parent = 世界军队当前父();
  if (!parent) return;
  var t = document.getElementById('wm-title');
  if (!t) return;
  var sub = parent['子级'] || [];
  var it = sub[下标];
  if (!it) return;
  var d = document.getElementById('wm-desc2');
  var g = document.getElementById('wm-group');
  it['条目'] = t.value.trim();
  it['详细描述'] = (d && d.value) || '';
  it['分组'] = (g && g.value) || 世界分组表(世界当前版块, 世界当前维度)[0];
  世界军队保存();   // 静默落盘
}
window.世界内部弹窗暂存 = 世界内部弹窗暂存;

// 删掉当前这一层里的某一条内部设定
function 世界军队删这层(分组, 下标) {
  var parent = 世界军队当前父();
  if (!parent) return;
  var sub = parent['子级'] || [];
  if (!sub[下标]) return;
  var nm = sub[下标]['条目'] || '这一条';
  window.confirmDialog('确定删除「' + nm + '」？', function() {
    sub.splice(下标, 1);
    世界军队保存('已删除');
  });
}
window.世界军队删这层 = 世界军队删这层;

// 注：内部**不再提供「改名 / 改描述 / 删除这一条」**——那三件在**条目列表**上就有
// （点条目卡右侧的 ✏️ / 🗑，或直接点卡片进详情弹窗编辑）。内部只做两件事：
// ① 就地改这一条的描述（点正文块）；② 管理它下面的那些块。

// 直接点描述块就地改（不开弹窗、不跳转）
function 世界军队改描述() {
  var el = document.getElementById('wm-desc');
  if (!el || el.querySelector('textarea')) return;
  var it = 世界军队当前父();
  if (!it) return;
  var 原 = it['详细描述'] || '';
  el.innerHTML = '';
  var ta = document.createElement('textarea');
  ta.className = 'llm-input';
  ta.style.cssText = 'width:100%;min-height:120px;resize:vertical';
  ta.value = 原;
  ta.onclick = function(e) { e.stopPropagation(); };
  ta.onblur = function() {
    it['详细描述'] = ta.value;
    世界军队保存();
  };
  el.onclick = null;
  el.appendChild(ta);
  ta.focus();
}
window.世界军队改描述 = 世界军队改描述;

// 按分组 AI 生成（生成到**当前这一条**下，分组按**当前板块**的那一套）
// 走二元模板：军队 → AI 字段 world-military-group / 提示词 world_military_group（七个兵种分组）
//             地理 → AI 字段 world-geo-group     / 提示词 world_geo_group（六个地点分组）
// （人物不走这里：随从 / 奴仆没有内部块，内容直接写在她的「详细描述」里）
function 世界内部AI(分组) {
  var sec = 世界当前版块;
  if (!世界有内部块(sec, 世界当前维度)) { window.toast('这个板块没有内部块'); return; }
  if (!世界军队当前父()) { window.toast('请先进入一个条目'); return; }
  var w = 世界当前世界;
  if (!w || !w.title) { window.toast('请先填世界名'); return; }
  if (typeof openAiGenPanel !== 'function') { window.toast('AI 建议系统未就绪'); return; }
  window.世界内部生成分组 = 分组 || 世界分组表(sec, 世界当前维度)[0];
  // 锁定目标（与 世界AI生成 同一套快照）：生成结果固定写回这一个世界 / 这一条目，
  // 不随生成期间切 tab 漂移。板块必须跟着当前板块走——原来写死 '军队'，
  // 地理条目点生成时会走军队那套（分组名、提示词、快照全错）。
  世界生成快照 = { 世界: w, 版块: sec, 维度: 世界当前维度, 子级索引: 世界子级索引 };
  openAiGenPanel(sec === '地理' ? 'world-geo-group' : 'world-military-group');
}
window.世界内部AI = 世界内部AI;

// 进入子级：有内部块的板块（军队 / 地理）走它自己的内部（一层），其余走原来的子级索引
// （物品·随从 / 奴仆 是普通条目，没有内部块——见 世界有内部块）
function 世界进入子级(idx) {
  if (世界有内部块(世界当前版块, 世界当前维度)) {
    世界军队进入(idx);
    return;
  }
  世界子级索引 = idx;
  var el = document.getElementById('we-section');
  if (el) 世界渲染版块();
}
window.世界进入子级 = 世界进入子级;
// 返回上级
function 世界返回上级() {
  if (世界有内部块(世界当前版块, 世界当前维度)) {
    世界军队退();
    return;
  }
  世界子级索引 = -1;
  var el = document.getElementById('we-section');
  if (el) 世界渲染版块();
}
window.世界返回上级 = 世界返回上级;

// ============================================================
// 势力 · 关联界面
// 「势力」是其余板块的总览 / 索引：**点一个势力，就直接进到这里**——它没有别的往里走的路。
// 这里汇出的是「与之相关联的一切」：除「世界设定」以外，每个板块的每条都能用
// 「所属势力」指回来（地理 / 种族 / 军队 / 物品 / 文化 / 时间线），谁填了这个势力名就归它。
// **关联不另存数据**——现扫现汇，因此两边永远不会不一致，改了某条的「所属势力」，这里立刻跟着变。
// 界面本身不预设任何分类：第一层筛「板块」、第二层筛该板块下的「维度」，
// 两层的选项都是**扫出来的**（某板块一条关联都没有，它就不会出现在筛选项里）。
// ============================================================

// 「所属势力」可能是「甲、乙」多个。注意：势力名**本身可能含「、」**
// （如「极端实践：穿刺、嫁接与人皮」），所以不能按分隔符盲切，
// 要拿已知势力名做**最长匹配**来切词。
function 世界归入势力(条目项, 势力名) {
  if (!条目项 || !势力名) return false;
  var v = String(条目项['所属势力'] || '').trim();
  if (!v || v === '无') return false;
  var 词表 = 世界归入势力词表();
  var i = 0, 命中 = false;
  while (i < v.length) {
    if (/[、，,;；\/\s]/.test(v.charAt(i))) { i++; continue; }
    var hit = '';
    var maxL = Math.min(24, v.length - i);
    for (var L = maxL; L >= 2; L--) {
      var cand = v.substr(i, L);
      if (词表.indexOf(cand) >= 0) { hit = cand; break; }
    }
    // 认不出的词**不再一票否决整条**：跳过这一个字继续往后认。
    // （原来这里是 `return false` —— 「所属势力」里只要有一个名字不在清单里
    //   （比如写了「破阵营、合欢盟」而清单里只有合欢盟），整条就从总览里消失了，
    //   哪怕它明明白白写着本势力的名字。）
    if (!hit) { i++; continue; }
    if (hit === 势力名) 命中 = true;
    i += hit.length;
  }
  return 命中;
}

// 关联分组的显示顺序与图标（键 = 板块 · 维度）
var 世界关联组表 = [
  { 板块: '种族', 维度: '种族', icon: '🧬', label: '种族' },
  { 板块: '种族', 维度: '文明', icon: '🏛️', label: '文明' },
  // 军队：条目带「所属势力」，所以在某个势力的关联总览里就是「它下辖的军队」。
  // 没有「所属军势」这一说了——军队里不再有组织维度，**九个子 TAB 都是兵种**，归属统一走「所属势力」。
  { 板块: '军队', 维度: '步兵', icon: '🚶', label: '所属步兵' },
  { 板块: '军队', 维度: '骑兵', icon: '🐎', label: '所属骑兵' },
  { 板块: '军队', 维度: '战车', icon: '🛞', label: '所属战车' },
  { 板块: '军队', 维度: '远程', icon: '🏹', label: '所属远程' },
  { 板块: '军队', 维度: '法师', icon: '✨', label: '所属法师' },
  { 板块: '军队', 维度: '怪兽', icon: '🐉', label: '所属怪兽' },
  { 板块: '军队', 维度: '炮械', icon: '💥', label: '所属炮械' },
  { 板块: '军队', 维度: '空军', icon: '🦅', label: '所属空军' },
  { 板块: '军队', 维度: '海军', icon: '⚓', label: '所属海军' },
  { 板块: '物品', 维度: '神器', icon: '🏺', label: '神器' },
  { 板块: '物品', 维度: '圣物', icon: '🕊️', label: '圣物' },
  { 板块: '物品', 维度: '兵刃', icon: '⚔️', label: '兵刃' },
  { 板块: '物品', 维度: '甲胄', icon: '🛡️', label: '甲胄' },
  { 板块: '物品', 维度: '饰物', icon: '💍', label: '饰物' },
  { 板块: '物品', 维度: '束具', icon: '⛓️', label: '束具' },
  { 板块: '物品', 维度: '坐骑', icon: '🐎', label: '坐骑' },
  { 板块: '物品', 维度: '战兽', icon: '🐉', label: '战兽' },
  { 板块: '物品', 维度: '随从', icon: '🧑‍💼', label: '随从' },
  { 板块: '物品', 维度: '奴仆', icon: '🪢', label: '奴仆' },
  { 板块: '物品', 维度: '药剂', icon: '⚗️', label: '药剂' },
  { 板块: '物品', 维度: '器物', icon: '🧰', label: '器物' },
  { 板块: '地理', 维度: '世界地理', icon: '🌍', label: '所在世界地理' },
  { 板块: '地理', 维度: '大城名宗', icon: '🏙️', label: '拥有的大城名宗' },
  { 板块: '地理', 维度: '乡镇村落', icon: '🏘️', label: '乡镇村落与据点' },
  { 板块: '地理', 维度: '奇境', icon: '🌀', label: '奇境' },
  { 板块: '文化', 维度: '文化与习俗', icon: '📜', label: '文化与习俗' },
  { 板块: '文化', 维度: '哲学与信仰', icon: '🕯️', label: '哲学与信仰' },
  { 板块: '文化', 维度: '性征与繁衍', icon: '🧫', label: '性征与繁衍' },
  { 板块: '时间线', 维度: '历史年表', icon: '⏳', label: '历史年表' },
  { 板块: '时间线', 维度: '事件链', icon: '🔗', label: '相关事件链' },
  { 板块: '时间线', 维度: '战役', icon: '🔥', label: '相关战役' },
  { 板块: '时间线', 维度: '剧情种子', icon: '🌱', label: '相关剧情种子' },
];

// 注：旧的 世界关联组元(板块, 维度) 已删除——审计确认全项目无人调用（关联视图的维度
// TAB、板块图标都直接走 世界关联组表 / 世界可用模块 两张表，不需要再包一层查表函数）。

// 扫描全库，汇出「归属于该势力」的条目并按 板块·维度 分组
function 世界扫描关联(势力名) {
  var w = 世界当前世界;
  var content = (w && w.content) || {};
  var 组 = [];
  Object.keys(content).forEach(function(sec) {
    // 势力自己不算自己的关联：它的关联是「谁归它管」——除世界设定以外的每个版块
    // 都用「所属势力」指回来（地理 / 种族 / 军队 / 物品 / 文化 / 时间线）。军队**要**扫，
    // 军队条目自己带「所属势力」。
    if (sec === '势力') return;
    // 只有「世界设定」不扫：它是整个世界通行的法则，不分属哪个势力，
    // 所以它既不生成这个字段，也不该出现在某个势力的总览里。
    if (!世界带势力板块[sec]) return;
    var sub = content[sec] || {};
    Object.keys(sub).forEach(function(dim) {
      var hits = (sub[dim] || []).filter(function(it) { return 世界归入势力(it, 势力名); });
      if (!hits.length) return;
      // 子 TAB 的显示名就用**维度名本身**（步兵 / 骑兵 / 大城名宗…）——
      // 与顶层板块里那套子 TAB 同名同序，一眼对得上；不用关联组表那套「所属某某」的长标签。
      组.push({ 板块: sec, 维度: dim, 子标签: dim, 条目: hits });
    });
  });
  // 按组表顺序排，未登记的排最后
  组.sort(function(a, b) {
    var ia = 世界关联组表.findIndex(function(x) { return x.板块 === a.板块 && x.维度 === a.维度; });
    var ib = 世界关联组表.findIndex(function(x) { return x.板块 === b.板块 && x.维度 === b.维度; });
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  return 组;
}

function 世界渲染关联(dimName, item) {
  var 名 = item['条目'] || '势力';
  var 组 = 世界扫描关联(名);
  var 总 = 组.reduce(function(a, g) { return a + g.条目.length; }, 0);

  // 按板块归拢（顺序 = 顶层板块顺序：地理 → 种族 → 军队 → 物品 → 文化 → 时间线 → 世界设定）
  var 序 = 世界可用模块.map(function(m) { return m.id; });
  var 篮 = {};
  组.forEach(function(g) {
    (篮[g.板块] = 篮[g.板块] || []).push(g);
  });
  var 有内容的板块 = Object.keys(篮).sort(function(a, b) {
    var ia = 序.indexOf(a), ib = 序.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });

  // 当前筛的板块 / 维度（筛选状态失效就退回第一个）
  // **候选一律取 世界关联组表（全部可能的 板块·维度）**，不是「已经有内容的那些」——
  // 原来只按有内容的铺：一个刚建的势力底下什么都没有时，板块与维度都退成空，
  // 整个面板只剩一句「还没有任何条目归属于它」，连「＋新增 / ✨AI 生成」两个入口都没有
  // （违反零锁定：空白状态必须能直接开写）。有内容只是多显示一个条数。
  var 候选板块 = [];
  世界关联组表.forEach(function(g) { if (候选板块.indexOf(g.板块) < 0) 候选板块.push(g.板块); });
  有内容的板块.forEach(function(sec) { if (候选板块.indexOf(sec) < 0) 候选板块.push(sec); });
  // 默认落在**第一个真有内容的板块**上（组表第一个往往是空的，一进来就是空格子看着像没功能）；
  // 一条关联都没有时才退回第一个候选。灵感角色库那边的关联面板同一处理。
  if (候选板块.indexOf(世界关联板块) < 0) 世界关联板块 = 有内容的板块[0] || 候选板块[0] || '';
  // 这个板块下**界面上要铺的维度**：组表登记的 + 篮子里有内容的旧维度（合并去重，组表序在前）
  var 本板块维度 = [];
  世界关联组表.forEach(function(g) { if (g.板块 === 世界关联板块 && 本板块维度.indexOf(g.维度) < 0) 本板块维度.push(g.维度); });
  (篮[世界关联板块] || []).forEach(function(g) { if (本板块维度.indexOf(g.维度) < 0) 本板块维度.push(g.维度); });
  var 本板块组 = 篮[世界关联板块] || [];
  if (本板块维度.indexOf(世界关联维度) < 0) {
    // 默认落在这板块下**第一个有内容的维度**上；整块都空时才留在第一个维度
    // （用户自己点的空格子不会被顶掉——那条路进来时 世界关联维度 已经在本板块维度里了）
    世界关联维度 = (本板块组[0] && 本板块组[0].维度) || 本板块维度[0] || '';
  }
  var 当前组 = null;
  for (var i = 0; i < 本板块组.length; i++) if (本板块组[i].维度 === 世界关联维度) { 当前组 = 本板块组[i]; break; }
  // 这一格还空着也给一个「空组」，好让工具条（＋新增 / ✨AI）照常出现
  if (!当前组) 当前组 = { 板块: 世界关联板块, 维度: 世界关联维度, 子标签: 世界关联维度, 条目: [] };

  // 板块元信息（图标/名字取顶层板块定义）
  var 板块元 = function(sec) {
    for (var k = 0; k < 世界可用模块.length; k++) if (世界可用模块[k].id === sec) return 世界可用模块[k];
    return { id: sec, icon: '📄', label: sec };
  };

  var h = '<div class="n-card" style="padding:14px">';
  // 面包屑返回
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">';
  h += '<button class="btn-out" style="padding:2px 10px;font-size:11px" onclick="世界收起关联()">‹ 返回 ' + escHtml(dimName) + '</button>';
  h += '<div style="font-size:13px;font-weight:700;flex:1">🏴 ' + escHtml(名) + ' <span style="font-size:10px;color:var(--fg3);font-weight:400">关联 ' + 总 + ' 条</span></div>';
  h += '<button class="btn-out" style="padding:2px 10px;font-size:11px" onclick="世界编辑条目(' + 世界关联索引 + ')">✏️ 编辑本势力</button>';
  h += '</div>';
  // 势力自身详情
  if (item['详细描述']) h += '<div style="font-size:11px;color:var(--fg2);line-height:1.7;margin-bottom:12px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px">' + escHtml(item['详细描述']) + '</div>';
  if (!总) {
    h += '<div style="text-align:center;padding:8px 12px 14px;color:var(--fg3);font-size:11px;line-height:1.8">' +
      '还没有任何条目归属于它。<br>在下面选一个板块与类型，直接「＋ 新增」或点「✨ AI 生成」；' +
      '也可以到「地理 / 种族 / 军队 / 物品 / 文化 / 时间线」里把条目的「<b>所属势力</b>」填成本势力名，这里就会自动汇出来。</div>';
  }

  // ===== 第一层：按**顶层板块**筛（要的就是这个，不再一上来铺二十几个小类）=====
  h += '<div style="font-size:10px;color:var(--fg3);margin-bottom:5px">按板块筛</div>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px">';
  候选板块.forEach(function(sec) {
    var m = 板块元(sec);
    var 组列 = 篮[sec] || [];
    var 条 = 组列.reduce(function(a, g) { return a + g.条目.length; }, 0);
    var 选 = (sec === 世界关联板块);
    h += '<div style="background:var(--bg2);border:1px solid ' + (选 ? 'var(--accent2)' : 'var(--border)') + ';border-left:3px solid ' + (选 ? 'var(--accent2)' : 'var(--border)') + ';border-radius:8px;padding:8px 10px;cursor:pointer;transition:.15s" ' +
         'title="只看这个板块的关联条目" onclick="世界切关联板块(\'' + escHtml(sec) + '\')">';
    h += '<div style="font-size:12px;font-weight:700;color:' + (选 ? 'var(--accent2)' : 'var(--fg)') + '">' + m.icon + ' ' + escHtml(m.label) + '</div>';
    h += '<div style="font-size:10px;color:var(--fg3);margin-top:2px">' + (条 ? 组列.length + ' 类 · ' + 条 + ' 条' : '暂无关联条目') + '</div>';
    h += '</div>';
  });
  h += '</div>';

  // ===== 第二层：该板块下的**维度**子 TAB（筛选）=====
  h += '<div class="sub-nav" style="margin:12px 0 8px;flex-wrap:wrap;row-gap:2px">';
  本板块维度.forEach(function(d) {
    var 选 = (d === 世界关联维度);
    var g = null;
    for (var j = 0; j < 本板块组.length; j++) if (本板块组[j].维度 === d) { g = 本板块组[j]; break; }
    h += '<div class="sub-nav-item' + (选 ? ' act' : '') + '" style="font-size:11px" onclick="世界切关联维度(\'' + escHtml(d) + '\')">' +
         escHtml(d) + ' <span style="font-size:9px;color:var(--fg3)">' + (g ? g.条目.length : 0) + '</span></div>';
  });
  h += '</div>';

  // ===== 第三层：当前维度下的条目 =====
  {
    // 工具条：这一维度的名字 + 条数 + **只生成与这个势力相关的 AI 生成**
    h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:7px;flex-wrap:wrap">';
    h += '<div style="font-size:12px;font-weight:700;color:var(--fg)">' + escHtml(当前组.子标签 || 当前组.维度) +
         ' <span style="font-size:10px;color:var(--fg3);font-weight:400">' + 当前组.条目.length + ' 条</span></div>';
    h += '<span style="flex:1"></span>';
    h += '<button class="btn-out" style="padding:1px 9px;font-size:10px" title="往「' + escHtml(dimName) + '」名下再添一条地理 / 种族 / 军队 / 物品 / 文化 / 时间线条目" ' +
         'onclick="世界关联加一条()">＋ 新增</button>';
    h += '<button class="btn-main" style="padding:1px 9px;font-size:10px" title="只生成与「' + escHtml(名) + '」相关的这一类内容；生成结果自动挂在它名下" ' +
         'onclick="世界关联AI生成()">✨ AI 生成</button>';
    h += '</div>';
    if (!当前组.条目.length) {
      h += '<div style="font-size:10px;color:var(--fg3);line-height:1.7;background:var(--bg2);border:1px dashed var(--border);border-radius:8px;padding:8px 10px">' +
           '这一格里还没有与「' + escHtml(名) + '」相关的' + escHtml(世界关联维度) + '条目。' +
           '点「＋ 新增」自己写一条，或点「✨ AI 生成」让 AI 只补这一类——生成结果会自动挂在它名下。</div>';
    }
    h += '<div style="display:flex;flex-direction:column;gap:5px">';
    当前组.条目.forEach(function(it) {
      var nm = it['条目'] || '未命名';
      // 正文**全文显示，不截断**——截断了看不到内容，还得再点一次才知道是什么
      var 详 = it['详细描述'] || '';
      h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:8px 10px;cursor:pointer" title="就地查看该条目的详情（不跳转）" onclick="世界查看条目(\'' + escHtml(当前组.板块) + '\',\'' + escHtml(当前组.维度) + '\',\'' + escHtml(nm) + '\')">';
      h += '<div style="display:flex;align-items:center;gap:6px">';
      h += '<div style="font-size:12px;font-weight:700;color:var(--fg);flex:1">' + escHtml(nm) + '</div>';
      h += '<span style="font-size:9px;color:var(--accent2)">' +
           ((it['子级'] && it['子级'].length) ? '详情 · 可下钻 ' + it['子级'].length + ' ›' : '详情 ›') + '</span>';
      h += '</div>';
      if (详) h += '<div style="font-size:10px;color:var(--fg2);line-height:1.7;margin-top:2px">' + escHtml(详) + '</div>';
      h += '</div>';
    });
    h += '</div>';
  }
  h += '</div>';
  return h;
}

// 关联视图里切板块 / 切维度（纯筛选，不跳转、不存数据）
function 世界切关联板块(sec) {
  世界关联板块 = sec;
  世界关联维度 = '';
  var el = document.getElementById('we-section');
  if (el) 世界渲染版块();
}
window.世界切关联板块 = 世界切关联板块;

function 世界切关联维度(dim) {
  世界关联维度 = dim;
  var el = document.getElementById('we-section');
  if (el) 世界渲染版块();
}
window.世界切关联维度 = 世界切关联维度;

// ===== 势力关联面板 · 当前子 TAB 的 AI 生成 =====
// 只生成**与当前势力相关**的那一类内容：按 板块 / 维度 / 势力名 出题，
// 生成结果自动把「所属势力」填成本势力，所以一回填就出现在这里。
// 走二元模板：AI 字段 world-faction-related + 提示词 world_faction_related。
function 世界关联AI生成() {
  if (世界关联索引 < 0 || !世界关联板块 || !世界关联维度) { window.toast('请先选一个板块与类型'); return; }
  if (typeof openAiGenPanel !== 'function') { window.toast('AI 建议系统未就绪'); return; }
  var list = (世界当前世界 && 世界当前世界.content && 世界当前世界.content['势力'] &&
              世界当前世界.content['势力'][世界当前维度]) || [];
  var it = list[世界关联索引];
  window.世界关联生成势力 = (it && it['条目']) || '';
  openAiGenPanel('world-faction-related');
}
window.世界关联AI生成 = 世界关联AI生成;

// 在当前子 TAB 下手工新增一条（同样把「所属势力」预填成本势力）
// 即时保存：先把草稿推进目标维度数组（「所属势力」已填好），每敲一下写一次
function 世界关联加一条() {
  if (世界关联索引 < 0 || !世界关联板块 || !世界关联维度) { window.toast('请先选一个板块与类型'); return; }
  var w = 世界当前世界;
  if (!世界可写盘(w)) return;
  var 势力 = ((w.content['势力'][世界当前维度] || [])[世界关联索引] || {})['条目'] || '';
  w.content[世界关联板块] = w.content[世界关联板块] || {};
  w.content[世界关联板块][世界关联维度] = w.content[世界关联板块][世界关联维度] || [];
  var 草稿 = { '条目': '', '详细描述': '', '所属势力': 势力 };
  w.content[世界关联板块][世界关联维度].push(草稿);
  var h = '<div class="mcard" style="max-width:560px">';
  h += '<div style="font-size:14px;font-weight:700;margin-bottom:3px">＋ 新增一条关联内容</div>';
  h += '<div style="font-size:10px;color:var(--fg3);margin-bottom:12px">' + escHtml(世界关联板块) + ' · ' + escHtml(世界关联维度) + '　→ 挂在「' + escHtml(势力) + '」名下　·　改动即时保存</div>';
  h += '<div style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:3px">条目名</label>';
  h += '<input id="wfa-title" class="llm-input" style="width:100%" oninput="世界弹窗防抖保存(世界弹窗存那一笔)"></div>';
  h += '<div style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:3px">详细描述</label>';
  h += '<textarea id="wfa-desc" class="llm-input" style="width:100%;min-height:130px;resize:vertical" oninput="世界弹窗防抖保存(世界弹窗存那一笔)"></textarea></div>';
  h += '<div style="display:flex;gap:8px;justify-content:flex-end">';
  h += '<button class="btn-out" onclick="世界弹窗取消()">取消</button>';
  h += '<button class="btn-main" onclick="世界弹窗完成()">完成</button>';
  h += '</div></div>';
  世界弹窗草稿项 = 草稿;
  世界弹窗存fn = function() { 世界关联暂存(草稿); };
  世界关闭所有弹窗();
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) 世界弹窗取消(); });
}
window.世界关联加一条 = 世界关联加一条;

// 把弹窗里的值写进那条草稿（静默落盘）
function 世界关联暂存(草稿) {
  var w = 世界当前世界;
  if (!w || !草稿) return;
  var t = document.getElementById('wfa-title');
  var d = document.getElementById('wfa-desc');
  if (!t) return;
  草稿['条目'] = t.value.trim();
  草稿['详细描述'] = (d && d.value) || '';
  if (世界可写盘(w)) Store.world.saveContent(w.title, w.content || {}).catch(function() {});
}
window.世界关联暂存 = 世界关联暂存;

function 世界展开关联(idx) {
  世界关联索引 = idx;
  世界高亮条目 = '';
  世界关联板块 = '';   // 换一个势力 → 筛选退回第一个有关联的板块
  世界关联维度 = '';
  var el = document.getElementById('we-section');
  if (el) 世界渲染版块();
}
window.世界展开关联 = 世界展开关联;

function 世界收起关联() {
  世界关联索引 = -1;
  世界关联板块 = '';
  世界关联维度 = '';
  var el = document.getElementById('we-section');
  if (el) 世界渲染版块();
}
window.世界收起关联 = 世界收起关联;

// 注：旧的 世界跳到(sec, dim, 名) 已删除——审计确认全项目无人调用（关联总览里的跳转
// 早改成了「就地查看详情 + 世界下钻到 / 世界进入内部到」），它只会留在文件里当噪声。

// 基本设定表单（世界名/简介，实时保存）
function 世界渲染基本设定(w) {
  var meta = (w && w.meta) || {};
  var title = (w && w.title) || '';
  var h = '<div class="n-card" style="padding:16px">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap">';
  h += '<div style="font-size:13px;font-weight:700;flex:1">基本设定</div>';
  h += '<button class="btn-main" style="padding:2px 10px;font-size:11px" onclick="世界基本AI生成()">✨ AI 生成</button>';
  h += '</div>';
  // 世界名（填名即建；已建后可改名）—— 字段旁可单独生成
  h += '<div style="margin-bottom:12px"><div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">';
  h += '<label style="font-size:11px;color:var(--fg2);flex:1">世界名 <span style="color:#e06c75">*</span></label>';
  h += '<button class="btn-out" style="padding:1px 8px;font-size:9px;color:var(--accent2)" title="单独生成世界名" onclick="世界字段AI生成(\'name\')">✨</button>';
  h += '</div>';
  h += '<input id="we-name" class="llm-input" style="width:100%" value="' + escHtml(title) + '" placeholder="例：太初道界 / 星海遗民" oninput="世界名输入()">';
  h += '</div>';
  // 简介 —— 字段旁可单独生成
  h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">';
  h += '<label style="font-size:11px;color:var(--fg2);flex:1">世界简介</label>';
  h += '<button class="btn-out" style="padding:1px 8px;font-size:9px;color:var(--accent2)" title="单独生成世界简介" onclick="世界字段AI生成(\'desc\')">✨</button>';
  h += '</div>';
  h += '<textarea id="we-desc" class="llm-input" style="width:100%;min-height:140px;resize:vertical" placeholder="这段世界的基调、法则或故事核心，写在这里，世界列表会显示它……" oninput="世界基础保存()">' + escHtml(meta.description || '') + '</textarea>';
  h += '</div>';
  return h;
}

// 切换子维度
function 世界切换维度(dim) {
  世界当前维度 = dim;
  世界关联索引 = -1;
  世界子级索引 = -1;
  世界高亮条目 = '';
  世界军队路径复位();
  var el = document.getElementById('we-section');
  if (el) 世界渲染版块();
}
window.世界切换维度 = 世界切换维度;

// 获取当前 版块+维度 定位（编辑条目用）
function 世界当前定位() {
  return { 版块: 世界当前版块, 维度: 世界当前维度 };
}

// 获取当前操作的条目数组（顶层维度数组 或 若在子级则父条目['子级']数组）
// 返回 { list, 在子级 }；list 可能为 null（未建立）。
function 世界当前条目容器() {
  var w = 世界当前世界;
  var loc = 世界当前定位();
  var content = (w && w.content) || {};
  var dimArr = (content[loc.版块] && content[loc.版块][loc.维度]) ? content[loc.版块][loc.维度] : null;
  if (!dimArr) return { list: null, 在子级: false };
  if (世界子级索引 >= 0 && dimArr[世界子级索引]) {
    var parent = dimArr[世界子级索引];
    if (!parent['子级']) parent['子级'] = [];
    return { list: parent['子级'], 在子级: true };
  }
  return { list: dimArr, 在子级: false };
}

// 新增条目（先把空白草稿放进数据、再打开编辑弹窗）
// 即时保存：草稿一进来就在数据里，弹窗里每敲一下写一次盘；
// 什么都没写就关掉（取消 / 点弹窗外 / 完成）由 世界弹窗取消 / 世界弹窗完成 把它收回——
// 原来「取消」是不回滚的：点一下取消，数据里就永久多一条「新子级」。
function 世界新增条目() {
  var w = 世界当前世界;
  if (!w) return;
  var loc = 世界当前定位();
  var content = w.content = w.content || {};
  content[loc.版块] = content[loc.版块] || {};
  content[loc.版块][loc.维度] = content[loc.版块][loc.维度] || [];
  var container = 世界当前条目容器();
  var list = container.list || content[loc.版块][loc.维度];
  if (!container.list) { content[loc.版块][loc.维度] = list; }
  if (世界子级索引 >= 0 && content[loc.版块][loc.维度][世界子级索引]) {
    var parent = content[loc.版块][loc.维度][世界子级索引];
    if (!parent['子级']) parent['子级'] = [];
    list = parent['子级'];
  }
  list.push({ '条目': '' });
  世界编辑条目(list.length - 1);
}
window.世界新增条目 = 世界新增条目;

// 注：「全部清除」已统一到共用件 世界全清本级() / 世界军队全清()，这里不再另存一份。
// （旧的世界清除全部条目() 已删除：它只清维度列表，在条目下级里会清错层。）

// ============================================================
// 条目详情 / 编辑
// 关联总览里点条目**不跳转**，就地弹出详情；详情里可以**就地编辑**（不改动当前浏览位置）。
// ============================================================

// 就地操作的目标：非空时，编辑 / 保存作用于它，而不是当前浏览位置
var 世界就地目标 = null;

function 世界关闭所有弹窗() {
  var all = document.querySelectorAll('.ovl');
  for (var i = 0; i < all.length; i++) all[i].remove();
}
window.世界关闭所有弹窗 = 世界关闭所有弹窗;

// ============================================================
// 弹窗 · 即时保存共用件
// ------------------------------------------------------------
// 世界观里三个「条目表单」弹窗（编辑条目 / 内部设定 / 关联新增）一律**输入即落盘**：
//   ① 新增时弹窗一打开就把「草稿条目」放进数据里，之后每个输入框的 input 事件
//      防抖 400ms 写盘（世界弹窗防抖保存）；
//   ② 「保存」按钮因此退化成「完成」——只关窗、不作提交动作（CLAUDE.md：保存按钮
//      只能作为辅助确认手段）；
//   ③ 「取消」在草稿还空着时把它收回去（连磁盘一起），已经写了内容就按即时保存留在原地
//      ——即时保存优先于「取消回滚」，不能因为点了一下取消就把刚写的东西吞掉；
//   ④ 点弹窗外也走同一条「取消」路径（原来是直接 remove 层，草稿就留在数据里变成幽灵条目）。
// ============================================================
var 世界弹窗保存定时 = 0;
var 世界弹窗草稿项 = null;   // 本次弹窗新建的那一条（空着就收回，非空就即时存）
var 世界弹窗存fn = null;     // 当前弹窗「把界面上的值写进数据 + 落盘」的那件事

function 世界弹窗防抖保存(fn) {
  if (世界弹窗保存定时) clearTimeout(世界弹窗保存定时);
  世界弹窗保存定时 = setTimeout(function() { 世界弹窗保存定时 = 0; fn(); }, 400);
}
window.世界弹窗防抖保存 = 世界弹窗防抖保存;
// 点「完成 / 取消」时先把防抖里那一笔冲刷掉——不能因为点了按钮丢掉最后敲的字
function 世界弹窗冲刷保存(fn) {
  if (世界弹窗保存定时) { clearTimeout(世界弹窗保存定时); 世界弹窗保存定时 = 0; }
  if (fn) fn();
}
// 界面上任何一个输入框变动 → 交给当前弹窗的存函数（防抖）
function 世界弹窗存那一笔() {
  var f = 世界弹窗存fn;
  if (f) f();
}
window.世界弹窗存那一笔 = 世界弹窗存那一笔;
// 这一条是不是还空着（分组 / 所属势力 / 子级 是弹窗预填的，不算内容）
function 世界条目空着(item) {
  if (!item) return true;
  var 预填 = { '分组': 1, '所属势力': 1, '子级': 1 };
  var ks = Object.keys(item);
  for (var i = 0; i < ks.length; i++) {
    if (预填[ks[i]]) continue;
    var v = item[ks[i]];
    if (v !== null && v !== undefined && String(v).trim() !== '') return false;
  }
  return true;
}
// 把草稿从数据里摘掉（认**对象**不认下标：它可能在顶层维度数组里，也可能在某个条目的子级里）
function 世界摘掉草稿(obj) {
  var w = 世界当前世界;
  if (!w || !obj) return false;
  var content = w.content || {};
  var 动过 = false;
  Object.keys(content).forEach(function(sec) {
    var secC = content[sec] || {};
    Object.keys(secC).forEach(function(dim) {
      var arr = secC[dim];
      if (!arr || !arr.length) return;
      var i = arr.indexOf(obj);
      if (i >= 0) { arr.splice(i, 1); 动过 = true; return; }
      arr.forEach(function(p) {
        var sub = p && p['子级'];
        if (sub && sub.length) {
          var j = sub.indexOf(obj);
          if (j >= 0) { sub.splice(j, 1); 动过 = true; }
        }
      });
    });
  });
  // 已经落过盘的草稿：连磁盘一起收回（写失败不弹窗——这只是收尾）
  if (动过 && w.title) Store.world.saveContent(w.title, w.content).catch(function() {});
  return 动过;
}
// 收尾重绘：弹窗关掉之后，底下那一屏要跟着变
function 世界弹窗收尾重绘() {
  世界列表失效();
  var el = document.getElementById('we-section');
  if (el) 世界渲染版块();
}
// 「取消」：空草稿收回，写了内容的留在原地
function 世界弹窗取消() {
  世界弹窗冲刷保存();
  var d = 世界弹窗草稿项;
  世界弹窗草稿项 = null;
  世界弹窗存fn = null;
  if (d && 世界条目空着(d)) 世界摘掉草稿(d);
  世界关闭所有弹窗();
  世界弹窗收尾重绘();
}
window.世界弹窗取消 = 世界弹窗取消;
// 「完成」：把最后那一笔存掉；空草稿则收回（不留「未命名」空条目）
function 世界弹窗完成() {
  var d = 世界弹窗草稿项;
  var f = 世界弹窗存fn;
  世界弹窗草稿项 = null;
  世界弹窗存fn = null;
  世界弹窗冲刷保存(function() {
    if (d && 世界条目空着(d)) 世界摘掉草稿(d);
    else if (f) f();
  });
  世界关闭所有弹窗();
  世界弹窗收尾重绘();
}
window.世界弹窗完成 = 世界弹窗完成;

// 找条目：给了「父名」就表示在它的「子级」里找
function 世界找条目(sec, dim, 名, 父名) {
  var w = 世界当前世界;
  var list = (w && w.content && w.content[sec] && w.content[sec][dim]) || [];
  if (父名) {
    for (var i = 0; i < list.length; i++) {
      if (list[i]['条目'] !== 父名) continue;
      var sub = list[i]['子级'] || [];
      for (var j = 0; j < sub.length; j++) if (sub[j]['条目'] === 名) return sub[j];
      return null;
    }
    return null;
  }
  for (var k = 0; k < list.length; k++) if (list[k]['条目'] === 名) return list[k];
  return null;
}

// 从下钻状态走捷径：军队条目在**当前维度**里的下标（按名字找）
function 世界当前条目索引() {
  var w = 世界当前世界;
  var list = (w && w.content && w.content[世界当前版块] && w.content[世界当前版块][世界当前维度]) || [];
  var 名 = 世界高亮条目;
  for (var i = 0; i < list.length; i++) if (list[i]['条目'] === 名) return i;
  return 世界子级索引 >= 0 ? 世界子级索引 : 0;
}

// ============================================================
// 条目视图 · 共用件（三级都用同一套，别再各写各的）
// ------------------------------------------------------------
// 世界观里凡是「列条目」的地方都长一样，共三级：
//   ① 维度列表   —— 版块 → 子维度（如 地理 · 世界地理）
//   ② 条目下级   —— 点条目进去后的那一层（地理的子级 也用这套）
//   ③ 势力关联   —— 展开势力后的那一层（按板块 / 维度筛出来的条目）
// 三级**共用**下面这两个函数：`世界工具条`（＋新增 / 🗑全部清除 / ✨AI生成，外加一个返回）
// 与 `世界条目正文`（正文全文展开，字段名加粗）。三级还共用同一套条目卡：
// 标题 + ✏️编辑 + 🗑删除，有下级的再加一个「下钻 ›」。
// ============================================================

// 共用工具条。opts：{ 返回文字, 返回动作, 标题, 计数, 计数单位, 新增, 清除, AI, 右侧, 样式 }
//   三个标准按钮都能省（省了就不显示那一个）；**三个都在**才是标准形态。
//   右侧 = [{ 文字, 动作, 色, 主, 提示 }]：给别的模块挂自己的按钮用的
//   （灵感角色库要在同一条工具条上挂「级别 · 职位 ›」，两个模块的工具条才长得一样）。
function 世界工具条(opts) {
  opts = opts || {};
  var 小 = opts.样式 === '小';
  var 尺寸 = 小 ? 'padding:1px 8px;font-size:9px' : 'padding:2px 10px;font-size:11px';
  var 题尺寸 = 小 ? 'font-size:12px' : 'font-size:13px';
  var h = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:' + (小 ? '6' : '10') + 'px;flex-wrap:wrap">';
  if (opts.返回文字 && opts.返回动作) {
    h += '<button class="btn-out" style="' + 尺寸 + '" onclick="' + opts.返回动作 + '">‹ 返回 ' + escHtml(opts.返回文字) + '</button>';
  }
  if (opts.标题) {
    h += '<div style="' + 题尺寸 + ';font-weight:700;flex:1">' + escHtml(opts.标题);
    if (opts.计数 !== undefined && opts.计数 !== null) {
      h += ' <span style="font-size:10px;color:var(--fg3);font-weight:400">' + opts.计数 + ' ' + (opts.计数单位 || '条') + '</span>';
    }
    h += '</div>';
  } else {
    h += '<span style="flex:1"></span>';
  }
  (opts.右侧 || []).forEach(function(b) {
    h += '<button class="' + (b.主 ? 'btn-main' : 'btn-out') + '" style="' + 尺寸 + (b.色 ? ';color:' + b.色 : '') + '"' +
         (b.提示 ? ' title="' + escHtml(b.提示) + '"' : '') + ' onclick="' + b.动作 + '">' + b.文字 + '</button>';
  });
  if (opts.新增) h += '<button class="btn-out" style="' + 尺寸 + '" onclick="' + opts.新增 + '">＋ 新增</button>';
  if (opts.清除) h += '<button class="btn-out" style="' + 尺寸 + ';color:#e06c75" title="清空这一层的全部条目" onclick="' + opts.清除 + '">🗑 全部清除</button>';
  if (opts.AI) h += '<button class="btn-main" style="' + 尺寸 + '" onclick="' + opts.AI + '">✨ AI 生成</button>';
  h += '</div>';
  return h;
}

// 共用条目正文：**全文展开，不截断**；字段名加粗，换行原样保留。
// 主列表与下级列表都用它，视觉才一致（下级不再用「字段名：值」的另一种写法）。
var 世界条目名键 = { '条目': 1, '标题': 1, '名称': 1, '项目': 1, '子级': 1, '分组': 1 };
// 「所属势力」在界面上**始终排在最后**：它是一条归属注记，不是条目内容本身。
// 所有显示路径（维度的卡片、下级卡片、关联总览、详情弹窗）统一走 世界字段序()，
// 免得显示顺序跟着 JSON 的键序飘——数据是哪一种写法，界面上的观感都一致。
var 世界置底字段 = { '所属势力': 1 };
// 这些字段在世界观模块里**不显示、也不解析**：它们不是本模块的概念，摆在世界观条目上
// 只会被当成字符串拼成 [object Object]。归谁的就让谁去显示，两边互不牵连。
var 世界不显示字段 = { '级别': 1 };
// 下划线开头的一律是**内部记账戳**，不是内容 —— 一律不显示：
//   物品·随从 / 奴仆 导入灵感角色库时会盖上 `_维度` / `_板块`（用来把 12 个物品维度汇成池化目录），
//   它们是给程序看的，绝不该出现在卡片、正文、详情弹窗里当字段。
// （过滤放在这里，是因为卡片 / 正文 / 详情弹窗 / 层级视图全都走 世界字段序()，
//   一处改完两个模块都干净。）
function 世界是内部字段(k) { return !!世界不显示字段[k] || String(k || '').charAt(0) === '_'; }
function 世界字段序(item) {
  var ks = Object.keys(item || {}).filter(function(k) { return !世界是内部字段(k); });
  return ks.filter(function(k) { return !世界置底字段[k]; })   // ① 普通字段，保持原序
           .concat(ks.filter(function(k) { return !!世界置底字段[k]; }));   // ② 置底字段
}
window.世界字段序 = 世界字段序;

function 世界条目正文(item, 跳过字段) {
  var h = '';
  世界字段序(item).forEach(function(k) {
    if (世界条目名键[k]) return;
    if (跳过字段 && 跳过字段[k]) return;
    if (!item[k]) return;
    // 置底字段单独一种样子：浅色小字，看着像注记而不像正文
    if (世界置底字段[k]) {
      h += '<div style="font-size:10px;color:var(--accent2);line-height:1.75;margin-top:6px">🫱 ' + escHtml(item[k]) + '</div>';
      return;
    }
    h += '<div style="font-size:11px;color:var(--fg2);line-height:1.75;margin-top:3px;white-space:pre-wrap">' +
         '<span style="color:var(--fg3);font-weight:600">' + escHtml(k) + '：</span>' + escHtml(item[k]) + '</div>';
  });
  return h;
}
window.世界条目正文 = 世界条目正文;

// 详情弹窗的正文块：一个字段一块（字段名小字 + 正文块），**全文不截断**。
// 抽出来是为了给别的模块复用（灵感角色库的详情弹窗走同一份，两个模块的详情长得一样）。
function 世界详情字段(item, 跳过字段) {
  item = item || {};
  var h = '';
  世界字段序(item).forEach(function(k) {
    if (世界条目名键[k]) return;
    if (跳过字段 && 跳过字段[k]) return;
    if (!item[k]) return;
    if (世界置底字段[k]) {
      h += '<div style="margin-top:12px"><div style="font-size:10px;color:var(--accent2);font-weight:600;margin-bottom:2px">🫱 ' + escHtml(k) + '</div>';
      h += '<div style="font-size:12px;color:var(--accent2);line-height:1.7">' + escHtml(item[k]) + '</div></div>';
      return;
    }
    h += '<div style="margin-bottom:8px"><div style="font-size:10px;color:var(--fg3);font-weight:600;margin-bottom:2px">' + escHtml(k) + '</div>';
    h += '<div style="font-size:12px;color:var(--fg2);line-height:1.7;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:8px 10px;white-space:pre-wrap">' + escHtml(item[k]) + '</div></div>';
  });
  return h;
}
window.世界详情字段 = 世界详情字段;

// 详情弹窗里的「内部设定（N）」：按分组列条目名（军队 / 地理这类有内部块的板块用）
function 世界详情内部设定(it, sec, dim) {
  if (!it || !(it['子级'] || []).length) return '';
  if (!世界有内部块(sec, dim)) return '';
  var h = '<div style="margin-bottom:8px"><div style="font-size:10px;color:var(--fg3);font-weight:600;margin-bottom:3px">内部设定（' + it['子级'].length + '）</div>';
  世界分组表(sec, dim).forEach(function(g) {
    // 分组一律按**这个条目所在的板块**判（世界内部分组条目 传 sec），不看当前板块
    var 组 = 世界内部分组条目(it, g, sec);
    if (!组.length) return;
    h += '<div style="font-size:11px;color:var(--fg2);line-height:1.7;margin-top:3px">' +
         '<span style="color:var(--fg3);font-weight:600">' + escHtml(g) + '：</span>' +
         组.map(function(x) { return escHtml(x['条目'] || ''); }).join('、') + '</div>';
  });
  return h + '</div>';
}
window.世界详情内部设定 = 世界详情内部设定;

// 删除「当前这一层」里的某一条（第 1 层就是维度列表本身）
function 世界删本级条目(idx) {
  var w = 世界当前世界;
  if (!世界可写盘(w)) return;
  var c = 世界当前条目容器();
  var list = c.list || [];
  if (!list[idx]) return;
  var nm = list[idx]['条目'] || '这一条';
  window.confirmDialog('确定删除「' + nm + '」？', function() {
    list.splice(idx, 1);
    if (!c.在子级) 世界子级索引 = -1;
    Store.world.saveContent(w.title, w.content).then(function() {
      window.toast('已删除');
      var el = document.getElementById('we-section');
      if (el) 世界渲染版块();
    }).catch(function(e) { window.toast('保存失败：' + (e && e.message ? e.message : '未知')); });
  });
}
window.世界删本级条目 = 世界删本级条目;

// 「🗑 全部清除」：清掉**当前这一层**的全部条目（在条目下级时，只清那个条目的子级，不动条目本身）
function 世界全清本级() {
  var w = 世界当前世界;
  if (!世界可写盘(w)) return;
  var c = 世界当前条目容器();
  var list = c.list || [];
  if (!list.length) { window.toast('这一层还没有内容'); return; }
  var 谁 = c.在子级 ? '这个条目的下级' : (世界当前版块 + ' · ' + 世界当前维度);
  window.confirmDialog('确定清除「' + 谁 + '」下的全部 ' + list.length + ' 条？该操作不可撤销。', function() {
    list.length = 0;
    Store.world.saveContent(w.title, w.content).then(function() {
      window.toast('已全部清除');
      var el = document.getElementById('we-section');
      if (el) 世界渲染版块();
    }).catch(function(e) { window.toast('保存失败：' + (e && e.message ? e.message : '未知')); });
  });
}
window.世界全清本级 = 世界全清本级;

// 只读详情弹窗：展示该条目的全部字段，带「编辑」与「关闭」。不切换版块、不跳转。
function 世界查看条目(sec, dim, 名, 父名) {
  var it = 世界找条目(sec, dim, 名, 父名);
  if (!it) { window.toast('找不到该条目'); return; }
  var 跳过 = { '条目': 1, '标题': 1, '名称': 1, '项目': 1, '子级': 1 };
  var h = '<div class="mcard" style="max-width:620px">';
  h += '<div style="font-size:14px;font-weight:700;margin-bottom:3px">📄 ' + escHtml(名) + '</div>';
  h += '<div style="font-size:10px;color:var(--fg3);margin-bottom:12px">' + escHtml(sec) + ' · ' + escHtml(dim) + (父名 ? ' · ' + escHtml(父名) + ' · 子级' : '') + '　·　就地查看（不跳转）</div>';
  // 正文可能很长（人物的表述里连着整条阶次链），所以中间这一块自己带滚轮，页头页脚不动
  h += '<div style="flex:1;min-height:0;overflow-y:auto;scrollbar-gutter:stable;padding-right:2px">';
  var 有内容 = false;
  世界字段序(it).forEach(function(k) {
    if (跳过[k]) return;
    if (it[k]) 有内容 = true;
  });
  h += 世界详情字段(it, 跳过);
  h += 世界详情内部设定(it, sec, dim);
  if (it['子级'] && it['子级'].length && !世界有内部块(sec, dim)) {
    // 没有内部块的板块（旧数据 / 通用子级）：子级就平铺一行名字
    h += '<div style="margin-bottom:8px"><div style="font-size:10px;color:var(--fg3);font-weight:600;margin-bottom:2px">子级（' + it['子级'].length + '）</div>';
    h += '<div style="font-size:12px;color:var(--fg2);line-height:1.7">' + it['子级'].map(function(x) { return escHtml(x['条目'] || ''); }).join('、') + '</div></div>';
  }
  if (!有内容) h += '<div style="font-size:11px;color:var(--fg3);padding:8px 0">这个条目还没有内容。</div>';
  h += '</div>';   // 关闭可滚动的正文区
  // 底栏：把「往下走」的入口都放这里——有子级就能下钻，是势力就能展开关联总览，
  // 否则从详情弹窗里就没有路进去了。
  var 有子级 = it['子级'] && it['子级'].length;
  var 该板块可下钻 = !!(世界版块表[sec] && 世界版块表[sec].可下钻);
  var 该板块有关联 = !!(世界版块表[sec] && 世界版块表[sec].关联);
  var 可下钻 = 有子级 && 该板块可下钻;
  h += '<div style="display:flex;align-items:center;gap:8px;margin-top:14px;flex-wrap:wrap;flex:none">';
  if (世界有内部块(sec, dim)) {
    // 有内部块板块的主入口是「进入内部」——点卡片就直接进去了，这里是兜底的第二条路。
    // 必须**顺着这个条目自己的板块 / 维度**进（世界进入内部到）：原来用 世界当前条目索引()
    // 取的是「当前版块当前行」的下标，从关联总览点开地理条目时会进到另一条去。
    h += '<button class="btn-out" style="padding:3px 12px;font-size:11px;color:var(--accent2)" onclick="世界进入内部到(\'' + escHtml(sec) + '\',\'' + escHtml(dim) + '\',\'' + escHtml(名) + '\')">进入内部（按分组铺开）›</button>';
  }
  if (可下钻) {
    h += '<button class="btn-out" style="padding:3px 12px;font-size:11px;color:var(--accent2)" onclick="世界下钻到(\'' + escHtml(sec) + '\',\'' + escHtml(dim) + '\',\'' + escHtml(名) + '\')">下钻它的 ' + it['子级'].length + ' 个子级 ›</button>';
  }
  if (该板块有关联 && !世界有内部块(sec, dim)) {
    h += '<button class="btn-out" style="padding:3px 12px;font-size:11px;color:var(--accent2)" onclick="世界展开关联到(\'' + escHtml(sec) + '\',\'' + escHtml(dim) + '\',\'' + escHtml(名) + '\')">展开关联总览 ›</button>';
  }
  if (可下钻 || (该板块有关联 && !世界有内部块(sec, dim)) || 世界有内部块(sec, dim)) h += '<span style="font-size:10px;color:var(--fg3)">（点击后离开详情，进入它的下级）</span>';
  h += '<span style="flex:1"></span>';
  h += '<button class="btn-out" onclick="世界关闭所有弹窗()">关闭</button>';
  h += '<button class="btn-main" onclick="世界就地编辑(\'' + escHtml(sec) + '\',\'' + escHtml(dim) + '\',\'' + escHtml(名) + '\',\'' + escHtml(父名 || '') + '\')">✏️ 编辑</button>';
  h += '</div></div>';
  世界关闭所有弹窗();
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
}
window.世界查看条目 = 世界查看条目;
window.世界找条目 = 世界找条目;

// 组装并弹出编辑弹窗。sec / dim 由调用方给定，所以从关联总览里也能**就地**编辑别的板块的条目。
// 在子级 = 这一条在某个父条目的「子级」里（那时不给「所属维度」下拉：它的位置由父条目决定）。
// 弹窗是**即时保存**：每个输入框 input 即写盘，按钮只有「完成 / 取消」（见上方共用件）。
function 世界弹出编辑弹窗(item, sec, dim, 注记, 在子级) {
  item = item || {};
  var h = '<div class="mcard" style="max-width:560px">';
  h += '<div style="font-size:14px;font-weight:700;margin-bottom:12px">' + (item.条目 ? '✏️ 编辑：' + escHtml(item.条目) : '＋ 新增条目') + ' <span style="font-size:10px;color:var(--fg3);font-weight:400">（' + escHtml(sec) + ' · ' + escHtml(dim) + (注记 || '') + '　·　改动即时保存）</span></div>';
  // 「所属维度」：把这一条挪到本板块的另一个维度去（旧维度里那批历史遗留条目靠它搬回现行维度）。
  // 只在**顶层条目**上给——子级的位置由它的父条目决定，不能单独挪板块 / 维度。
  if (!在子级) {
    var 维度列 = 世界可选维度(sec);
    if (维度列.length > 1) {
      var secDef = 世界版块表[sec] || { 维度: [] };
      var 登记维度 = (secDef.维度 || []).map(function(d) { return d.名; });
      h += '<div style="margin-bottom:8px;padding-bottom:8px;border-bottom:1px dashed var(--border)"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:3px">所属维度</label>';
      h += '<select id="wde-dim" class="llm-input" style="width:100%" onchange="世界保存条目()">';
      维度列.forEach(function(d) {
        var 旧 = 登记维度.indexOf(d) < 0;
        h += '<option value="' + escHtml(d) + '"' + (d === dim ? ' selected' : '') + '>' + escHtml(d) + (旧 ? '（旧维度）' : '') + '</option>';
      });
      h += '</select>';
      h += '<div style="font-size:9px;color:var(--fg3);margin-top:3px">换一个维度保存，这一条就会挪过去（旧维度里那批条目可以这样搬回现行维度）</div></div>';
    }
  }
  // 条目名
  h += '<div style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:3px">条目名</label>';
  h += '<input id="wde-title" class="llm-input" style="width:100%" value="' + escHtml(item['条目'] || item['标题'] || item['名称'] || item['项目'] || '') + '" oninput="世界弹窗防抖保存(世界弹窗存那一笔)"></div>';
  // 「所属势力」的输入框排在表单**最下方**（见下面按钮行之前），与显示层的「始终置底」一致。
  // 历史年表：这一维度是一条线，条目靠「时序」钉在轴上
  if (sec === '时间线' && dim === '历史年表') {
    h += '<div style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:3px">时序</label>';
    h += '<input id="wde-order" class="llm-input" style="width:100%" value="' + escHtml(item['时序'] || '') + '" placeholder="整数，1 = 最古，依次递增（这条线靠它把条目钉在轴上）" oninput="世界弹窗防抖保存(世界弹窗存那一笔)"></div>';
  }
  // 详细描述：占位示例按板块 / 维度给，让人一眼知道这一条该写成什么样
  var 描述例 = '这个条目的详细内容……内容多了就用空行分段，不限字数';
  if (sec === '物品' && (dim === '随从' || dim === '奴仆')) {
    描述例 = '一个人一条：先一段概况（她是谁、担什么位子、如今什么处境），往下有阶次链的一阶一段，段首写「第N阶·『称号』」，每个称号都单独写出来。不限字数，段与段之间空一行';
  } else if (sec === '物品') {
    描述例 = '这件东西本身：形制、材质、构造、用途与效力，以及它经历过的来龙去脉（全都写在这一段里）。不限字数，内容多了用空行分段';
  } else if (sec === '时间线' && dim === '历史年表') {
    描述例 = '这个纪元是什么样子：它的性质、谁在位、世界到了哪一步。不限字数，内容多了用空行分段';
  } else if (sec === '地理') {
    描述例 = '这一处地方是什么样：形貌、里头的分区与人的活法。不限字数，内容多了用空行分段';
  } else if (sec === '军队') {
    描述例 = '这一支兵是什么：由谁驱使、怎么打、装备什么、抓来的人怎么处置。不限字数，内容多了用空行分段';
  }
  h += '<div style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:3px">详细描述</label>';
  h += '<textarea id="wde-desc" class="llm-input" style="width:100%;min-height:140px;resize:vertical" placeholder="' + escHtml(描述例) + '" oninput="世界弹窗防抖保存(世界弹窗存那一笔)">' + escHtml(item['详细描述'] || item['描述'] || '') + '</textarea></div>';
  // 物品（器物类）是两条线：详细描述（这件东西本身）+ 历史（它经历过的来龙去脉）
  // 人物（随从 / 奴仆）不是器物：一个人一条长表述，没有历史这一格
  if (sec === '物品' && dim !== '随从' && dim !== '奴仆') {
    h += '<div style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:3px">历史</label>';
    h += '<textarea id="wde-history" class="llm-input" style="width:100%;min-height:140px;resize:vertical" placeholder="这件东西经历过的来龙去脉：从何而来、由谁做成或赐下、在谁手里流转、出现在哪些事件里、被谁改造或毁去……（不限字数，内容多了用空行分段）" oninput="世界弹窗防抖保存(世界弹窗存那一笔)">' + escHtml(item['历史'] || '') + '</textarea></div>';
  }
  // 所属势力：**排在表单最下方**（与界面上的「始终置底」一致）——它是一条归属注记，不是条目内容。
  // 地理 / 种族 / 军队 / 物品 / 时间线 的条目都要挂到某个势力上，「势力」才能当总览用。
  // 候选只给**势力板块那批组织**（= 世界组织清单() = 世界归入势力词表()）——时间线自己那批条目
  // 也带「所属势力」，但它们不是组织名，塞进候选只会让人在几百项里翻；军队条目同理不进来。
  // 军队是兵种目录，不是归属对象的登记处：某个组织要当归属对象，就建成「势力」板块的一条。
  if (世界带势力板块[sec]) {
    var 清单 = 世界组织清单();
    h += '<div style="margin-bottom:8px;padding-top:10px;border-top:1px dashed var(--border)"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:3px">🫱 所属势力</label>';
    h += '<input id="wde-faction" class="llm-input" style="width:100%" value="' + escHtml(item['所属势力'] || '') + '" placeholder="填势力名，多个用「、」分隔；不属于任何势力填「无」" list="wde-faction-list" oninput="世界弹窗防抖保存(世界弹窗存那一笔)">';
    if (清单.length) {
      h += '<datalist id="wde-faction-list">' + 清单.map(function(n) { return '<option value="' + escHtml(n) + '"></option>'; }).join('') + '</datalist>';
      h += '<div style="font-size:9px;color:var(--fg3);margin-top:3px">可填：' + escHtml(清单.slice(0, 12).join('、')) + (清单.length > 12 ? ' …等 ' + 清单.length + ' 个' : '') + '</div>';
    }
    h += '</div>';
  }
  h += '<div style="display:flex;gap:8px;justify-content:flex-end">';
  h += '<button class="btn-out" onclick="世界弹窗取消()">取消</button>';
  h += '<button class="btn-main" onclick="世界弹窗完成()">完成</button>';
  h += '</div></div>';
  // 这一笔怎么存：静默写盘（不关窗、不提示）；草稿项由调用方（世界新增条目 → 世界编辑条目）认对象
  世界弹窗存fn = function() { 世界保存条目(true); };
  世界关闭所有弹窗();
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) 世界弹窗取消(); });
}
window.世界弹出编辑弹窗 = 世界弹出编辑弹窗;

// 编辑当前维度的条目（在「当前定位」上编辑）
function 世界编辑条目(index) {
  世界就地目标 = null;
  var loc = 世界当前定位();
  var container = 世界当前条目容器();
  var list = container.list || [];
  var item = list[index] || {};
  世界详情编辑索引 = index;
  世界弹窗草稿项 = item.条目 ? null : item;   // 名字还空着 = 刚推的草稿（取消就收回）
  世界弹出编辑弹窗(item, loc.版块, loc.维度, container.在子级 ? ' · 子级' : '', container.在子级);
}
window.世界编辑条目 = 世界编辑条目;

// 从详情弹窗下钻到某条目的子级列表（这是唯一必须切换版块的动作——子级本来就在那条目底下）
function 世界下钻到(sec, dim, 名) {
  var w = 世界当前世界;
  if (!w) return;
  var list = (w.content && w.content[sec] && w.content[sec][dim]) || [];
  var idx = -1;
  for (var i = 0; i < list.length; i++) if (list[i]['条目'] === 名) { idx = i; break; }
  if (idx < 0) { window.toast('找不到该条目'); return; }
  世界关闭所有弹窗();
  世界当前版块 = sec;
  世界当前维度 = dim;
  世界关联索引 = -1;
  世界高亮条目 = '';
  世界子级索引 = idx;
  var el = document.getElementById('we-section');
  if (el) 世界渲染版块();
}
window.世界下钻到 = 世界下钻到;

// 从详情弹窗进入某条目的内部（军队 / 地理这类有内部块的板块：进去按分组铺开）。
// 与 世界下钻到 同一套动作，只是落点是**内部**（世界子级索引 = 那一条），
// 且版块 / 维度按条目自身所在的格子给——详情弹窗可能是在关联总览里点开的，
// 那时当前版块根本不是它所在的板块（见 世界查看条目 的调用）。
function 世界进入内部到(sec, dim, 名) {
  var w = 世界当前世界;
  if (!w) return;
  var list = (w.content && w.content[sec] && w.content[sec][dim]) || [];
  var idx = -1;
  for (var i = 0; i < list.length; i++) if (list[i]['条目'] === 名) { idx = i; break; }
  if (idx < 0) { window.toast('找不到该条目'); return; }
  if (!世界有内部块(sec, dim)) { window.toast('这个板块没有内部块'); return; }
  世界关闭所有弹窗();
  世界当前版块 = sec;
  世界当前维度 = dim;
  世界关联索引 = -1;
  世界高亮条目 = '';
  世界子级索引 = idx;
  var el = document.getElementById('we-section');
  if (el) 世界渲染版块();
}
window.世界进入内部到 = 世界进入内部到;

// 从详情弹窗展开某势力的关联总览（同样必须切到「势力」板块）
function 世界展开关联到(sec, dim, 名) {
  var w = 世界当前世界;
  if (!w) return;
  var list = (w.content && w.content[sec] && w.content[sec][dim]) || [];
  var idx = -1;
  for (var i = 0; i < list.length; i++) if (list[i]['条目'] === 名) { idx = i; break; }
  if (idx < 0) { window.toast('找不到该条目'); return; }
  世界关闭所有弹窗();
  世界当前版块 = sec;
  世界当前维度 = dim;
  世界子级索引 = -1;
  世界高亮条目 = '';
  世界关联索引 = idx;
  var el = document.getElementById('we-section');
  if (el) 世界渲染版块();
}
window.世界展开关联到 = 世界展开关联到;

// 就地编辑：不动当前浏览位置（关联总览 / 子级列表里的「编辑」走这里，也就不会跳走）
function 世界就地编辑(sec, dim, 名, 父名) {
  var w = 世界当前世界;
  if (!w) return;
  var it = 世界找条目(sec, dim, 名, 父名);
  if (!it) { window.toast('找不到该条目'); return; }
  世界就地目标 = { 版块: sec, 维度: dim, 条目: 名, 父: 父名 || '' };
  世界详情编辑索引 = -1;
  世界弹窗草稿项 = null;   // 就地编辑已有条目：不是草稿，取消不收
  世界弹出编辑弹窗(it, sec, dim, 父名 ? ' · 就地编辑（子级）' : ' · 就地编辑', !!父名);
}
window.世界就地编辑 = 世界就地编辑;

// 保存条目（实时写 content.json；若在子级写到父条目['子级']；若在就地编辑则写回它自己那一格）
// 保留原条目的其余字段（如「子级」），避免编辑一次就把它们抹掉。
// 静默 = 输入框防抖触发的即时保存：不关弹窗、不弹提示（提示会刷屏）；
//        非静默 = 老路径（显式点保存），关窗并提示。
function 世界保存条目(静默) {
  var w = 世界当前世界;
  if (!世界可写盘(w)) return;
  var tgt = 世界就地目标;
  var loc = tgt ? { 版块: tgt.版块, 维度: tgt.维度 } : 世界当前定位();
  var index = tgt ? -1 : 世界详情编辑索引;
  var titleEl = document.getElementById('wde-title');
  if (!titleEl) { if (!静默) window.toast('输入框丢失'); return; }
  var title = titleEl.value.trim();
  // 草稿还没起名：留在内存里等下一笔（「取消 / 完成」时若仍空着会被收回）
  if (!title) { if (!静默) window.toast('条目名不能为空'); return; }
  // 「所属维度」下拉：会话里可以把它挪到本板块的另一个维度（顶层的旧维度条目靠这个搬出来）
  var dimEl = document.getElementById('wde-dim');
  var 新维度 = (dimEl && dimEl.value) ? dimEl.value : loc.维度;
  w.content = w.content || {};
  w.content[loc.版块] = w.content[loc.版块] || {};
  w.content[loc.版块][loc.维度] = w.content[loc.版块][loc.维度] || [];
  var list;
  if (tgt) {
    // 就地编辑：目标条目由 世界就地目标 指定，不依赖当前 tab；带「父」时改的是父条目的子级
    var 顶层 = w.content[loc.版块][loc.维度];
    if (tgt.父) {
      var 父项 = null;
      for (var p = 0; p < 顶层.length; p++) if (顶层[p]['条目'] === tgt.父) { 父项 = 顶层[p]; break; }
      if (!父项) { if (!静默) window.toast('找不到父条目'); return; }
      父项['子级'] = 父项['子级'] || [];
      list = 父项['子级'];
    } else {
      list = 顶层;
    }
    index = -1;
    for (var i = 0; i < list.length; i++) if (list[i]['条目'] === tgt.条目) { index = i; break; }
    if (index < 0) { if (!静默) window.toast('找不到要改的条目'); return; }
  } else {
    var container = 世界当前条目容器();
    list = container.list || w.content[loc.版块][loc.维度];
  }
  var old = (index >= 0 && list[index]) ? list[index] : {};
  var item = {};
  Object.keys(old).forEach(function(k) { item[k] = old[k]; });
  item['条目'] = title;
  var descEl = document.getElementById('wde-desc');
  if (descEl && descEl.value.trim()) item['详细描述'] = descEl.value.trim();
  else delete item['详细描述'];
  // 物品的第二条线：历史（不在物品版块时不产生该字段）
  var histEl = document.getElementById('wde-history');
  if (histEl) {
    if (histEl.value.trim()) item['历史'] = histEl.value.trim();
    else delete item['历史'];
  }
  // 所属势力（只有带势力的板块会渲染这一栏）
  var facEl = document.getElementById('wde-faction');
  if (facEl) {
    if (facEl.value.trim()) item['所属势力'] = facEl.value.trim();
    else delete item['所属势力'];
  }
  // 历史年表的「时序」（这条线靠它排位）
  var ordEl = document.getElementById('wde-order');
  if (ordEl) {
    var ov2 = ordEl.value.trim();
    if (ov2 && isFinite(Number(ov2)) && Number(ov2) > 0) item['时序'] = Number(ov2);
    else delete item['时序'];
  }
  // 「所属维度」换了 → 这一条要**挪窝**：从旧维度数组摘掉，写进新维度数组。
  // （旧维度「种族与文明」「聚落」这类历史遗留维度里的条目，靠这里搬回现行维度；
  //   搬空之后那个 ⚠ TAB 自然消失。）
  var 挪维度 = (!tgt || !tgt.父) && 新维度 && 新维度 !== loc.维度;
  if (挪维度) {
    if (index >= 0 && list[index]) {
      list.splice(index, 1);
      if (tgt) 世界就地目标 = null;   // 就地目标指向的还是旧格子，挪完清掉，免得下一笔又写回旧维度
      else 世界详情编辑索引 = -1;
    }
    w.content[loc.版块][新维度] = w.content[loc.版块][新维度] || [];
    w.content[loc.版块][新维度].push(item);
    世界列表失效();
    Store.world.saveContent(w.title, w.content).then(function() {
      if (!静默) {
        世界关闭所有弹窗();
        window.toast('已挪到「' + 新维度 + '」：' + title);
      }
      var el = document.getElementById('we-section');
      if (el) 世界渲染版块();
    }).catch(function(e) { window.toast('保存失败：' + (e && e.message ? e.message : '未知')); });
    return;
  }
  if (index >= 0 && list[index]) list[index] = item;
  else list.push(item);
  if (tgt) 世界就地目标 = { 版块: loc.版块, 维度: loc.维度, 条目: title, 父: tgt.父 || '' };
  世界列表失效();
  Store.world.saveContent(w.title, w.content).then(function() {
    // 即时保存（静默）不关窗、不提示——提示会刷屏；关窗与提示交给「完成 / 取消」
    if (!静默) {
      世界关闭所有弹窗();
      window.toast('已保存');
    }
    var el = document.getElementById('we-section');
    if (el) 世界渲染版块();
  }).catch(function(e) {
    // 以前这里没有 catch：写盘失败时弹窗不关、也不提示，用户以为存上了
    window.toast('保存失败：' + (e && e.message ? e.message : '未知'));
  });
}
window.世界保存条目 = 世界保存条目;

// 注：删除条目统一走共用件 世界删本级条目()（带项目自己的确认弹窗；
// 旧的世界删除条目() 用的是原生 confirm，已删除）。

// 返回世界列表
function 世界返回列表() {
  世界切换视图('list');
}
window.世界返回列表 = 世界返回列表;

// 删除世界（确认后删整目录，回列表）
function 世界删除世界(title) {
  if (!title) return;
  // 用项目统一的确认弹窗（别处 9 处删除/清空都用它；原生 confirm 在 Electron 下不可靠）
  window.confirmDialog('确定彻底删除世界「' + title + '」？该操作不可撤销。', function() {
    Store.world.delete(title).then(function() {
      世界列表失效();
      if (世界当前世界 && 世界当前世界.title === title) 世界当前世界 = null;
      window.toast('已删除世界: ' + title);
      世界切换视图('list');
    }).catch(function(e) { window.toast('删除失败：' + (e && e.message ? e.message : '未知')); });
  });
}
window.世界删除世界 = 世界删除世界;

// ===== 世界观 · AI 字段（二元模板）=====
// 版块子维度内容生成：走二元模板弹窗（可填方向），动态绑定当前「版块·子维度」。

// ============================================================
// 交给 AI 的上下文：三段式（用户口径）
// ------------------------------------------------------------
//   ① 本条目 —— 当前正在生成 / 编辑的那一条（含它内部全部分组的小条目）：**全文，一字不删**。
//                没有点进某一条（在维度列表上生成）时，「本条目」＝**这一格里已有的全部条目**，同样全文。
//   ② 世界设定 —— 世界名 + 简介 + 宇宙与法则 / 力量体系 / 情色生态：**全文**。
//   ③ 其余 —— 除①②以外的所有板块 · 维度条目（含当前板块的其他维度）：每条**只给标题 + 前 20 字**。
// 顺序固定。三段的详略差别是刻意的：正在写的那条、以及世界的通行法则要细节；
// 别处只要「有这个、叫什么、大概是什么」——上百条别的条目全给全文，只会把要写的那条淹掉。
// ============================================================

// ③ 用的紧凑形式：标题 + 前 20 字（就这两样，不再缀「所属势力 / 子级」）
function 世界条目标题20(x) {
  var 名 = (x && (x['条目'] || x['标题'] || x['名称'] || x['项目'])) || '（未命名）';
  var 描述 = String((x && (x['详细描述'] || x['描述'])) || '').replace(/\s+/g, ' ').trim();
  if (描述.length > 20) 描述 = 描述.substring(0, 20) + '…';
  return 名 + (描述 ? '：' + 描述 : '');
}
// 一串条目的紧凑形式（也用于「这一格已有内容，别重复」那份清单）
function 世界条目标题20列(items) {
  if (!items || !items.length) return '（空）';
  return items.map(世界条目标题20).join('；');
}

// ①② 用的全文形式：名字一行 → 逐字段全文（详细描述 / 历史 / 所属势力 / 时序…）
// → 再逐条列出它的内部块（[分组] 小条目名：全文）
function 世界条目全文(x) {
  if (!x) return '';
  var 跳过 = { '条目': 1, '标题': 1, '名称': 1, '项目': 1, '子级': 1 };
  var h = [(x['条目'] || x['标题'] || x['名称'] || x['项目']) || '（未命名）'];
  世界字段序(x).forEach(function(k) {
    if (跳过[k]) return;
    var v = x[k];
    if (v === null || v === undefined || v === '') return;
    h.push('　' + k + '：' + String(v));
  });
  (x['子级'] || []).forEach(function(c) {
    if (!c) return;
    var g = c['分组'] ? '[' + c['分组'] + '] ' : '';
    var 名 = c['条目'] || c['标题'] || c['名称'] || '（未命名）';
    var 描 = String(c['详细描述'] || c['描述'] || '');
    h.push('　· ' + g + 名 + (描 ? '：' + 描 : ''));
  });
  return h.join('\n');
}

// ② 世界设定（全文）：世界名 + 简介 + 该板块全部维度的条目（含 content 里的旧维度）
function 世界设定全文(w) {
  var meta = (w && w.meta) || {};
  var 设定 = ((w && w.content) || {})['世界设定'] || {};
  var 登记 = ((世界版块表['世界设定'] || {}).维度 || []).map(function(d) { return d.名; });
  var h = [];
  if (meta.title) h.push('世界名：' + meta.title);
  if (meta.description) h.push('基本简介：' + meta.description);
  var 出 = function(维度名) {
    (设定[维度名] || []).forEach(function(it) { h.push('[' + 维度名 + '] ' + 世界条目全文(it)); });
  };
  // 按版块表顺序（跳过「基本设定」——那是 meta，上面已经给过了），再铺 content 里的旧维度
  登记.forEach(function(d) { if (d !== '基本设定') 出(d); });
  Object.keys(设定).forEach(function(d) { if (登记.indexOf(d) < 0) 出(d); });
  return h.length ? h.join('\n') : '（还没有世界设定）';
}

// 整段上下文（三段式）。sec / dim / 子级索引 传「这次要生成的目标」（调用方拿生成快照给），
// 不传就用当前界面位置。
function 世界组装上下文(sec, dim, 子级索引) {
  var w = 世界当前世界;
  if (!w) return '（无）';
  var content = w.content || {};
  var loc = 世界当前定位();
  if (sec === undefined || sec === null || sec === '') sec = loc.版块;
  if (dim === undefined || dim === null || dim === '') dim = loc.维度;
  if (子级索引 === undefined || 子级索引 === null) 子级索引 = 世界子级索引;
  var 本条目 = (子级索引 >= 0) ? ((((content[sec] || {})[dim]) || [])[子级索引] || null) : null;

  var 段 = [];
  // ① 本条目（全文）：点进某一条 → 只给那一条；没点进去 → 给这一格已有的全部条目
  var 一 = [];
  if (本条目) 一.push(世界条目全文(本条目));
  else ((content[sec] || {})[dim] || []).forEach(function(it) { 一.push(世界条目全文(it)); });
  if (一.length) 段.push('【一 · 本条目（全文）】\n' + 一.join('\n\n'));
  // ② 世界设定（全文）
  段.push('【二 · 世界设定（全文）】\n' + 世界设定全文(w));
  // ③ 其余（每条：标题 + 前 20 字）
  var 三 = [];
  var 铺 = function(s, d) {
    if (s === '世界设定') return;                    // 世界通行的那一套已经在②里
    if (!本条目 && s === sec && d === dim) return;   // 整格就是①，不再重复进③
    var items = (((content[s] || {})[d]) || []).filter(function(it) { return it && it !== 本条目; });
    if (items.length) 三.push('[' + s + '·' + d + '] ' + 世界条目标题20列(items));
  };
  var 板序 = Object.keys(世界版块表);
  Object.keys(content).forEach(function(s) { if (板序.indexOf(s) < 0) 板序.push(s); });
  板序.forEach(function(s) {
    var 维序 = (((世界版块表[s] || {}).维度) || []).map(function(x) { return x.名; });
    Object.keys(content[s] || {}).forEach(function(d) { if (维序.indexOf(d) < 0) 维序.push(d); });
    维序.forEach(function(d) { 铺(s, d); });
  });
  段.push('【三 · 其余（每条：标题 + 前 20 字）】\n' + (三.length ? 三.join('\n') : '（没有其他内容）'));
  return 段.join('\n\n');
}

// 版块子维度条目生成（内容）：锁定当前 tab（版块/维度/子级），生成结果固定写入该 tab
function 世界AI生成() {
  var w = 世界当前世界;
  if (!w) { window.toast('未选择世界'); return; }
  if (!w.title) { window.toast('请先填世界名'); return; }
  if (typeof openAiGenPanel !== 'function') { window.toast('AI 建议系统未就绪'); return; }
  var loc = 世界当前定位();
  世界生成快照 = { 世界: w, 版块: loc.版块, 维度: loc.维度, 子级索引: 世界子级索引 };
  openAiGenPanel('world-element');
}
window.世界AI生成 = 世界AI生成;

// 子级内容 AI 生成（复用 world-element，锁定当前子级）
function 世界AI生成子级() {
  var w = 世界当前世界;
  if (!w) { window.toast('未选择世界'); return; }
  if (!w.title) { window.toast('请先填世界名'); return; }
  if (typeof openAiGenPanel !== 'function') { window.toast('AI 建议系统未就绪'); return; }
  var loc = 世界当前定位();
  世界生成快照 = { 世界: w, 版块: loc.版块, 维度: loc.维度, 子级索引: 世界子级索引 };
  openAiGenPanel('world-element');
}
window.世界AI生成子级 = 世界AI生成子级;

// 基本设定（世界名/简介）AI 生成
function 世界基本AI生成() {
  var w = 世界当前世界;
  if (!w) { window.toast('未选择世界'); return; }
  if (typeof openAiGenPanel !== 'function') { window.toast('AI 建议系统未就绪'); return; }
  openAiGenPanel('world-basic');
}
window.世界基本AI生成 = 世界基本AI生成;

// 基本设定·单字段 AI 生成（name=世界名 / desc=世界简介）
function 世界字段AI生成(target) {
  var w = 世界当前世界;
  if (!w) { window.toast('未选择世界'); return; }
  if (typeof openAiGenPanel !== 'function') { window.toast('AI 建议系统未就绪'); return; }
  if (target === 'name') openAiGenPanel('world-name');
  else openAiGenPanel('world-desc');
}
window.世界字段AI生成 = 世界字段AI生成;

// ===== 世界名不限：未命名则自动随机生成并创建世界 =====
function 世界自动命名(w) {
  if (w && w.title) return null;
  var 前缀 = ['太初', '玄黄', '无极', '云梦', '天澜', '太虚', '玉衡', '寰宇', '九霄', '沧溟'];
  var 后缀 = ['界', '域', '天', '墟', '境', '大陆', '神国', '仙境', '乾坤', '洪荒'];
  var name = 前缀[Math.floor(Math.random() * 前缀.length)] + 后缀[Math.floor(Math.random() * 后缀.length)] + '_' + Date.now().toString().slice(-4);
  w.title = name;
  w.meta = w.meta || {};
  w.meta.title = name;
  w.meta.modules = w.meta.modules || 世界可用模块.map(function(m) { return m.id; });
  return name;
}

// ===== 提取文本并全部生成：上传/粘贴叙述文本 → 按段落逐段提取 → 每段生成一条完整条目 → 合并去重填入当前维度 =====
function 世界提取文本生成() {
  var w = 世界当前世界;
  if (!w) { window.toast('未选择世界'); return; }
  var autoName = 世界自动命名(w);   // 世界名不做限制：未命名则自动随机生成 + 创建世界
  var openModal = function() {
    var h = '<div class="mcard" style="max-width:600px">';
    h += '<h3 style="font-size:0.95em;margin-bottom:10px">📜 提取文本并全部生成' + (autoName ? ' <span style="font-size:10px;color:var(--accent2);font-weight:400">（已自动命名：' + escHtml(autoName) + '）</span>' : '') + '</h3>';
    h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">';
    h += '<button class="btn-out" style="padding:2px 10px;font-size:11px" onclick="document.getElementById(\'wte-file\').click()">📁 上传文本文件</button>';
    h += '<span style="font-size:10px;color:var(--fg3)">支持 .txt，自动识别 UTF-8 / GBK</span>';
    h += '<input id="wte-file" type="file" accept=".txt,text/plain" style="display:none">';
    h += '</div>';
    h += '<div style="font-size:11px;color:var(--fg2);margin-bottom:8px;line-height:1.5">粘贴或上传一段世界观设定 / 小说叙述。系统将按<b>段落</b>逐段提取，<b>每一段生成一条完整的世界观条目</b>，最后合并（同名去重）填入当前「' + escHtml(世界当前版块) + ' · ' + escHtml(世界当前维度) + '」。</div>';
    h += '<textarea id="wte-text" class="llm-input" style="width:100%;min-height:200px;resize:vertical" placeholder="在这里粘贴或上传文本……（段落之间用空行分隔）"></textarea>';
    h += '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px">';
    h += '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>';
    h += '<button class="btn-main" id="wte-go">🚀 开始生成</button>';
    h += '</div></div>';
    var ov = document.createElement('div');
    ov.className = 'ovl';
    ov.innerHTML = h;
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
    // 上传 .txt（仿小说提取：UTF-8 优先，乱码则回退 GBK）
    var fileInput = document.getElementById('wte-file');
    if (fileInput) fileInput.addEventListener('change', function(e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      if (!/\.txt$/i.test(file.name)) { window.toast('请选择 .txt 格式文件'); return; }
      var reader = new FileReader();
      reader.onload = function(ev) {
        var bytes = new Uint8Array(ev.target.result);
        var text = new TextDecoder('UTF-8', { fatal: false }).decode(bytes);
        if (text.indexOf('\uFFFD') >= 0) {
          try {
            var gbk = new TextDecoder('GBK', { fatal: false }).decode(bytes);
            if (gbk.indexOf('\uFFFD') < 0) text = gbk;
          } catch(e) {}
        }
        document.getElementById('wte-text').value = text;
        window.toast('✅ 已加载: ' + file.name + ' (' + text.length + ' 字)');
      };
      reader.readAsArrayBuffer(file);
    });
    document.getElementById('wte-go').onclick = function() {
      var text = (document.getElementById('wte-text').value || '').trim();
      if (!text) { window.toast('请粘贴或上传文本'); return; }
      ov.remove();
      世界提取文本执行(w, text);
    };
  };
  if (autoName) {
    // 未命名：先创建世界（信息文件 + 内容），再打开弹窗
    Store.world.save(w.title, w.meta).then(function() {
      return Store.world.saveContent(w.title, w.content || {});
    }).then(function() {
      世界列表缓存 = null;
      openModal();
    }).catch(function(e) { window.toast('创建世界失败：' + (e && e.message ? e.message : '未知')); });
  } else {
    openModal();
  }
}
window.世界提取文本生成 = 世界提取文本生成;

function 世界提取文本执行(w, text) {
  if (typeof LLM === 'undefined' || !LLM.callJSON || typeof renderPrompt !== 'function') { window.toast('AI 系统未就绪'); return; }
  var loc = 世界当前定位();
  var section = loc.版块, dim = loc.维度;
  var def = 世界版块表[section] || { 维度: [] };
  var dimDef = null;
  def.维度.forEach(function(d) { if (d.名 === dim) dimDef = d; });
  var 类约束 = (dimDef && dimDef.说明) || '';
  var 规格 = 世界字段规格(section, dim);   // 人物＝一条长表述；历史年表带「时序」
  var content = w.content = w.content || {};
  content[section] = content[section] || {};
  content[section][dim] = content[section][dim] || [];
  // 按空行分段
  var paras = text.split(/\n\s*\n/).map(function(s) { return s.trim(); }).filter(Boolean);
  if (!paras.length) { window.toast('未提取到段落'); return; }
  // 人物（随从 / 奴仆）**一个人就是一条**：不能按空行切——切了会把一个人拆成好几条。
  // 所以这一层改成「整段文字＝一个人」，一条一生成；如果粘的是好几个人，就用一行一个名字的小标题自行分隔。
  var 人物 = (section === '物品' && (dim === '随从' || dim === '奴仆'));
  if (人物) paras = [paras.join('\n\n')];
  // 记录已有条目标题，用于去重
  var seen = {};
  content[section][dim].forEach(function(it) { if (it['条目']) seen[it['条目']] = true; });
  window.toast(人物 ? '人物按「一个人一条」整篇生成…' : ('共 ' + paras.length + ' 段，正在逐段生成…'));
  var chain = Promise.resolve();
  var added = 0;
  paras.forEach(function(p, i) {
    chain = chain.then(function() {
      var r = renderPrompt('world_text_entry', { worldName: w.title, section: section, dim: dim, 类约束: 类约束, paragraph: p, 字段要求: 规格.提取字段要求, 输出结构: 规格.单条结构, 势力清单: 世界组织清单().join('、') || '（本世界还没有势力条目——遇到「所属势力」一律写「无」）' });
      return LLM.callJSON({
        label: '世界文本提取(第' + (i + 1) + '/' + paras.length + '段)',
        system: r.system,
        prompt: r.user,
      }).then(function(d) {
        var it = d && d['条目'] ? d : null;
        if (!it && Array.isArray(d)) it = (d[0] && d[0]['条目']) ? d[0] : null;
        if (it && it['条目'] && !seen[it['条目']]) {
          seen[it['条目']] = true;
          var 新条目 = { '条目': String(it['条目']) };
          规格.键.forEach(function(k) {
            if (k === '条目') return;
            var v = String(it[k] || '').trim();
            if (v) 新条目[k] = v;
          });
          content[section][dim].push(新条目);
          added++;
        }
      }).catch(function(e) { window.toast('第' + (i + 1) + '段失败：' + (e && e.message ? e.message : '未知')); });
    });
  });
  chain.then(function() { return Store.world.saveContent(w.title, w.content); })
    .then(function() {
      window.toast('已提取生成 ' + added + ' 条并保存');
      var el = document.getElementById('we-section');
      if (el) 世界渲染版块();
    })
    .catch(function(e) { window.toast('保存失败：' + (e && e.message ? e.message : '未知')); });
}

// 生成「当前定位」标注：世界观「X」> 版块「Y」> 子维度「Z」> 字段「W」
// 用于让 AI 明确知道它正在为哪个世界、哪个版块、哪个子维度、哪个字段生成内容。
// 若当前在「子级」（地理可下钻），会标注其父条目。
function 世界AI定位串(fieldLabel) {
  var w = 世界当前世界;
  var loc = 世界当前定位();
  var title = (w && w.title) || '未命名';
  var sec = loc.版块 || '世界设定';
  var dim = loc.维度 || '基本设定';
  var f = fieldLabel || '';
  var subNote = '';
  if (世界子级索引 >= 0 && w && w.content && w.content[sec] && w.content[sec][dim] && w.content[sec][dim][世界子级索引]) {
    var pn = w.content[sec][dim][世界子级索引]['条目'] || '地点';
    subNote = '（当前在「' + pn + '」的子级）';
  }
  return '【当前编辑定位】世界观「' + title + '」 > 版块「' + sec + '」 > 子维度「' + dim + '」' + (f ? ' > 字段「' + f + '」' : '') + subNote + '。\n请生成的内容将填入「' + sec + ' / ' + dim + '」' + (f ? ' 的「' + f + '」字段' : '') + '。';
}

// 需要标注「所属势力」的版块——除「世界设定」以外的**全部版块**都带这一个字段：
// 地理 / 种族 / 军队 / 物品 / 文化 / 时间线 的每一条都要写明它属于哪个势力，
// 这样「势力」才能真正当总览用：点开一个势力，就能汇出**整个世界里与它相关联的一切**
// ——它下辖的军队与种族、它的所在地与城市、它的器物、它的习俗与信仰、它在时间线上的战事。
// 「世界设定」**不在**这里：那是整个世界通行的法则（宇宙与法则 / 力量体系 / 情色生态），
// 不属于任何一个势力——所以它既不生成这个字段，也不进任何势力的关联总览。
var 世界带势力板块 = { '地理': 1, '种族': 1, '军队': 1, '物品': 1, '文化': 1, '时间线': 1 };

// 势力清单（全量）：既当「某条目是否归属于某势力」的匹配词表，也当 AI 的取值池。
// **一律从本世界的 meta.势力清单 取**——那是势力实体名（不是条目名），单一而稳定：
//   ① 势力板块新加条目时会自动进清单；
//   ② 军队条目的名字（欢愉剑吟者、步兵…）**不会**混进来，所以「所属势力」不会误指到作战单位；
//   ③ 名称里含「、」的势力（如「极端实践：穿刺、嫁接与人皮」）也不会被切词切坏。
// 若某个世界还没有 meta.势力清单（老世界），回退到「**势力板块**的全部条目名」——
// 军队不参与：它只是兵种目录，不是归属对象的登记处（见 世界归入势力词表 上面那段说明）。
// 这套口径已经在 世界归入势力词表() / 世界组织清单() 里实现，旧的 世界势力清单() 是重复的一份
// （审计确认全项目无人调用），已删除——留两份口径迟早会改歪一份。

// 「真正的组织」清单：AI 生成「所属势力」时的取值池，也是编辑框里那个下拉候选。
// 口径与 世界归入势力词表 完全一致（**同一份**）——
// 这样「AI 能填的」与「系统认得的」永远是同一套，不会一边能填一边认不出。
function 世界组织清单() {
  return 世界归入势力词表();
}

// 判定「某条目是否归属于某势力」用的词表，也是 AI / 下拉框的候选。
//
// 【口径：只认「势力」板块的条目名 + meta.势力清单，两个出处】
//
// 军队**不参与**这张词表，它不 dual-serve 成「归属对象」的登记处。原因：
//   · 军队是纯粹的兵种目录（步兵 / 骑兵 / 战车 / 远程 / 法师 / 怪兽 / 炮械 / 空军 / 海军），
//     条目名大多是作战单位（欢愉剑吟者、紫血蝠狼、沙皇禁卫军…），本来就不是势力；
//   · 一旦让军队名进词表，别的板块（时间线 / 种族 / 文化 / 物品 / 地理）就会把「所属势力」
//     填成兵种名，于是「删掉军队」会连带把那些板块的归属整片打断——一个板块的增删不该
//     影响另一个板块的语义，这是必须避免的耦合；
//   · 军队条目自己的内部设定（驻地与营垒、战力与装备、俘获与处置里生出的地点与器物）
//     只活在**那一条军队条目内部**，不下沉到地理 / 物品，也不进这张词表。
//
// 所以：某个组织若确实要当归属对象，**就把它建成「势力」板块的一条**，而不是指望军队。
// 这样「什么算势力」只有一个出处，AI 能填的与系统认得的也永远是同一套。
//
// 候选从**本世界的 meta.势力清单**补足（那是势力实体名，含「、」也不会被切坏）；
// 该清单为空（老世界 / 迁移后清空过）时，词表就等于「势力板块的全部条目名」。
function 世界归入势力词表() {
  var w = 世界当前世界;
  var content = (w && w.content) || {};
  var meta = (w && w.meta) || {};

  var 名 = [], seen = {};
  var 收 = function(n) { if (!n || seen[n]) return; seen[n] = 1; 名.push(n); };

  // ① 势力板块的全部条目名
  var sub = content['势力'] || {};
  Object.keys(sub).forEach(function(dim) {
    (sub[dim] || []).forEach(function(it) { if (it && it['条目']) 收(it['条目']); });
  });
  // ② meta.势力清单里点名过的实体名一律补进来（它们是势力，哪怕还没人引用）
  (Array.isArray(meta['势力清单']) ? meta['势力清单'] : []).forEach(收);
  return 名;
}

// 世界观条目的字段规格：
//   默认   →「条目 + 详细描述」
//   物品   → 两条线：「详细描述」（这件东西本身）＋「历史」（它经历过的来龙去脉）
//   军队   → 与默认相同：「条目 + 详细描述」。
//            历史与传说 / 战力与装备 / 阶序与晋升 / 军法与惩戒 / 征募与补充 / 驻地与营垒 / 俘获与处置 **不是条目的字段**，
//            而是条目下钻之后的**七个分组**，各自装自己的小条目（与地理的六个分组同一套数据结构）。
//   地理/种族/物品/时间线 → 追加「所属势力」（取值必须来自〈势力清单〉）
// 注：「谁持有 / 创造 / 毁灭它」不在这两条线里——本板块只写器物自身。
function 世界字段规格(section, dim) {
  var 带势力 = !!世界带势力板块[section];
  var 势要求 = 带势力
    ? '另外必须带一个「所属势力」字段：写明这一条归属于哪一个势力，取值**必须从末尾〈势力清单〉里挑**，照抄清单里的原词（可写 1～3 个，用「、」分隔）；若确实不属于清单里的任何一个，就写「无」。'
    : '';
  var 势结构 = 带势力 ? ',"所属势力":""' : '';
  var 势键 = 带势力 ? ['所属势力'] : [];
  // 时间线 · 历史年表：条目要按「时序」钉在时间轴上（界面就是这么排的），生成时必须带上
  var 要时序 = (section === '时间线' && dim === '历史年表');
  var 时要求 = 要时序
    ? '另外必须带一个「时序」字段：整数，1 = 最古，依次递增，用来把这一条钉在时间轴上的位置。本世界没有绝对编年，时序只是先后次序，**不要**把它写成年份或日期。'
    : '';
  var 时结构 = 要时序 ? ',"时序":1' : '';
  var 时键 = 要时序 ? ['时序'] : [];
  // 通用段落规范：没有字数上限，长内容用空行分段（界面按段显示）
  var 分段 = '「详细描述」可以写很长——几百字到几千字都行，**没有字数上限**；内容多的时候**用空行分成若干段**，一段说一件事，不要挤成一整块。';
  // 人物（随从 / 奴仆）：一个人一条，不拆条、不分子块；有阶次链的一阶一段
  var 人物 = (section === '物品' && (dim === '随从' || dim === '奴仆'));
  if (人物) {
    return {
      键: ['条目', '详细描述'].concat(势键).concat(时键),
      字段要求: '每条目包含「条目」「详细描述」字段。**一个人只写一条**：把她的身份、职能或处境、以及她一步步走到今天的全过程，全部写进这一条的「详细描述」里——**不要拆成多条，也不要另立小标题或分块**。她有称号／名号的，**每一个都要单独写出来**（用『』）；带阶次链的要**一阶一段**，段首写成「第N阶·『称号』」，**绝对不要写成「从 A 到 B」这种概括**。' + 分段 + '色情向内容要贴合本世界的情色生态，写得直白。' + 势要求,
      提取字段要求: '这是一条【完整】人物条目：条目名就是这个人本身的名字（不得写进类别名）；「详细描述」把她写透——身份、职能或处境、以及她走到今天的每一步，**一个人只做一条**，不要拆成多条。有阶次链的一阶一段，段首「第N阶·『称号』」，每个称号都单独写出来。' + 分段 + 势要求,
      输出结构: '{"items":[{"条目":"","详细描述":""' + 势结构 + 时结构 + '}, ...]}',
      单条结构: '{"条目":"","详细描述":""' + 势结构 + 时结构 + '}',
    };
  }
  if (section === '物品' && dim !== '随从' && dim !== '奴仆') {
    return {
      键: ['条目', '详细描述', '历史'].concat(势键).concat(时键),
      字段要求: '每条目包含三个字段：「条目」「详细描述」「历史」。「详细描述」只写它**本身**——形制、材质、外观、构造、用途、用法、魔力或效力、如今的状态；「历史」只写它**经历过的来龙去脉**——从何而来、由谁做成或赐下、在谁手里流转、出现在哪些事件里、如何被改造 / 玷污 / 毁去。这两段**不得互相重复**，同一个事实只写在它更该属的那一段；「历史」是**必须写**的一段，不能空着。不要在条目里另立「持有者 / 创造者 / 毁灭者」这类字段。' + 分段 + 势要求 + 时要求,
      提取字段要求: '这是一条【完整】条目：条目名简短贴切、能概括该段核心设定，不得写进类别名；「详细描述」只写它**本身**——形制、材质、外观、构造、用途、用法、魔力或效力、如今的状态；「历史」只写它**经历过的来龙去脉**——从何而来、由谁做成或赐下、在谁手里流转、出现在哪些事件里、如何被改造 / 玷污 / 毁去。两段**不得互相重复**，都要写具体、可独立成段，「历史」不能空着。' + 分段 + 势要求 + 时要求,
      输出结构: '{"items":[{"条目":"","详细描述":"","历史":""' + 势结构 + 时结构 + '}, ...]}',
      单条结构: '{"条目":"","详细描述":"","历史":""' + 势结构 + 时结构 + '}',
    };
  }
  return {
    键: ['条目', '详细描述'].concat(势键).concat(时键),
    字段要求: '每条目包含「条目」「详细描述」字段（详细描述要具体、可被小说情节和生图 prompt 直接使用；色情向内容要贴合本世界的情色生态）。' + 分段 + 势要求 + 时要求,
    提取字段要求: '这是一条【完整】条目：条目名简短贴切、能概括该段核心设定，不得写进类别名；「详细描述」把这一段里关于世界观的设定信息写全、写具体、可独立成段，贴合本世界的情色生态，不是提纲。' + 分段 + 势要求 + 时要求,
    输出结构: '{"items":[{"条目":"","详细描述":""' + 势结构 + 时结构 + '}, ...]}',
    单条结构: '{"条目":"","详细描述":""' + 势结构 + 时结构 + '}',
  };
}

// 注册 AI 字段（二元模板）
if (typeof registerAiField === 'function' && window.全局字段已注册 !== true) {
  window.全局字段已注册 = true;

  // 1) 版块子维度内容生成
  registerAiField('world-element', '世界观·内容生成', function() {
    var w = 世界当前世界;
    // 用「生成快照」锁定点击时的 tab，避免面板打开后切换导致目标漂移；无快照则回退当前定位
    var snap = 世界生成快照 || { 版块: 世界当前定位().版块, 维度: 世界当前定位().维度, 子级索引: 世界子级索引 };
    var section = snap.版块;
    var dim = snap.维度;
    var 子级索引 = snap.子级索引;
    var def = 世界版块表[section] || { 维度: [] };
    var content = (w && w.content) || {};
    // existing：若在子级则用「父条目的子级已有内容」，否则用整体；生成时避免重复。
    // 只给「标题 + 前 20 字」的紧凑清单——全文已经在上下文①（本条目）里给过了，
    // 这里再铺一遍全文就是把同一批内容喂两遍（原来正是如此）。
    var existing = '（空）';
    if (子级索引 >= 0 && content[section] && content[section][dim] && content[section][dim][子级索引]) {
      var p = content[section][dim][子级索引];
      existing = p['子级'] ? 世界条目标题20列(p['子级']) : '（空）';
    } else if (content[section] && content[section][dim]) {
      existing = 世界条目标题20列(content[section][dim]);
    }
    // 三段式上下文：① 本条目（这一格 / 点进去的那一条，全文）② 世界设定（全文）③ 其余（标题+前20字）
    var context = 世界组装上下文(section, dim, 子级索引);
    var curDim = null;
    for (var di2 = 0; di2 < (def.维度||[]).length; di2++) if (def.维度[di2].名 === dim) { curDim = def.维度[di2]; break; }
    var 类约束 = '';
    // 正向说明：本类下该写什么内容（若维度配了 说明）
    if (curDim && curDim.说明) {
      类约束 += '\n【本类应生成的内容】' + curDim.说明 + '。' + (curDim.单条 ? '条目标题只写该类下具体某某的自身名称，不要带类别名。' : '');
    }
    // 维度是「单条」时，动态列出「除了当前维度之外的所有其他维度」作负向约束
    if (curDim && curDim.单条) {
      // 动态收集当前版块中除 dim 外的所有其他单条维度名
      var 其他类 = [];
      for (var di3 = 0; di3 < (def.维度||[]).length; di3++) {
        var d0 = def.维度[di3];
        if (d0 && d0.名 && d0.名 !== dim && d0.单条) 其他类.push(d0.名);
      }
      if (其他类.length) {
        类约束 += '\n【不要生成其他类别】本类是「' + dim + '」，**只生成属于本类的条目**，不要写成以下其他类别的任何内容——不要混入、不要兼写、不要边界模糊：\n' + 其他类.map(function(n){return '— ' + n;}).join('\n');
      }
    }
    var 规格 = 世界字段规格(section, dim);
    return {
      user: 世界AI定位串(dim) + '\n请为世界观「' + (w ? w.title : '未命名') + '」的「' + section + ' / ' + dim + '」生成条目，每条目含「' + 规格.键.join('」「') + '」。**请务必对照上面的「该子维度已有内容」逐条检查，不要生成与已有任何条目相同或雷同的重复条目**——只创作全新、彼此各异的条目。条目标题只写该类下**具体势力/地点的自身名称**，绝不要把「' + dim + '」这个类别名写进条目标题或内容里。' + 类约束,
      system: '你是世界构建专家，为成人向创作软件构建世界观设定。',
      worldName: w ? w.title : '',
      section: section,
      dim: dim,
      existing: existing,
      context: context,
      // 定位串走 {定位} 变量进模板：world_element 模板不用 {text}，所以必须单独透传，
      // 否则「当前编辑定位」与「当前在『某父条目』的子级」这个提示到不了模型。
      定位: 世界AI定位串(dim),
      type: section,
      类约束: 类约束.trim() || '（无特殊说明，按该类通用标准生成）',
      字段要求: 规格.字段要求,
      输出结构: 规格.输出结构,
      势力清单: 世界组织清单().join('、') || '（本世界还没有势力条目——遇到「所属势力」一律写「无」）',
    };
  }, {
    suggestPrompt: 'world_element',
    count: true,
    defaultCount: 5,
    countLabel: '条',
    fillFn: function(d) {
      // 用「生成快照」锁定目标 世界 + tab（点击时），保证不随切换漂移；无快照回退当前世界/定位
      var snap = 世界生成快照 || { 世界: 世界当前世界, 版块: 世界当前定位().版块, 维度: 世界当前定位().维度, 子级索引: 世界子级索引 };
      var w = snap.世界;
      if (!w) { window.toast('未选择世界'); return; }
      // 没有世界名就别落盘：saveContent('' …) 会在存档目录里造一个「未命名」幽灵世界
      if (!w.title) { window.toast('请先填世界名，再生成条目'); return; }
      var section = snap.版块;
      var dim = snap.维度;
      var 子级索引 = snap.子级索引;
      var list = (d && typeof d === 'object' && Array.isArray(d.items)) ? d.items : (Array.isArray(d) ? d : null);
      if (!list || !list.length) { window.toast('生成结果为空或无条目'); return; }
      w.content = w.content || {};
      w.content[section] = w.content[section] || {};
      w.content[section][dim] = w.content[section][dim] || [];
      // 根据快照决定写入顶层维度 还是 父条目['子级']
      var 在子级 = (子级索引 >= 0 && w.content[section][dim][子级索引]);
      var target = 在子级 ? (w.content[section][dim][子级索引]['子级'] || []) : w.content[section][dim];
      target = target.concat(list);
      if (在子级) {
        w.content[section][dim][子级索引]['子级'] = target;
      } else {
        w.content[section][dim] = target;
      }
      Store.world.saveContent(w.title, w.content).then(function() {
        window.toast(dim + (在子级 ? ' 子级' : '') + ' 已追加 ' + list.length + ' 条');
        // 把当前定位切回快照指向的 世界 + tab，然后再渲染（让用户看到结果落到那个世界/tab）
        世界当前世界 = w;
        世界当前版块 = section;
        世界当前维度 = dim;
        世界子级索引 = 子级索引;
        var el = document.getElementById('we-section');
        if (el) 世界渲染版块();
      }).catch(function(e) { window.toast('保存失败：' + (e && e.message ? e.message : '未知')); });
    },
  });

  // 2) 基本设定（世界名/简介）生成
  registerAiField('world-basic', '世界观·基本设定', function() {
    var w = 世界当前世界;
    var meta = (w && w.meta) || {};
    // 基本设定写的就是②（世界设定）本身，所以①没有「本条目」，③ 给其余条目的紧凑清单
    var context = 世界组装上下文('世界设定', '基本设定', -1);
    return {
      user: 世界AI定位串('基本设定') + '\n请为世界观「' + (w ? w.title : '未命名') + '」生成基本设定（世界名/世界观一句话概括与简介/立意）。',
      system: '你是世界构建专家，为成人向创作软件构建世界观基本设定。',
      worldName: w ? w.title : '',
      section: '世界设定',
      dim: '基本设定',
      existing: meta.description ? JSON.stringify({ description: meta.description }) : '（空）',
      context: context,
    };
  }, {
    // 单值字段：用自己的模板（world_basic），模板里用 {text} 承接下面的 user（定位串 + 该字段的具体要求），
    // 不能借用 world_element——那是「条目列表」模板，会丢掉定位串与专属 system，还会让模型产出 items 再靠 fillFn 兜底取值。
    suggestPrompt: 'world_basic',
    fillFn: function(d) {
      var w = 世界当前世界;
      if (!w) { window.toast('未选择世界'); return; }
      // 兼容：可能返回 {世界简介}/{description}/{简介} 或 {items:[...]}，取简介类文本
      var desc = '';
      if (typeof d === 'string') desc = d;
      else if (d && typeof d === 'object') {
        desc = d['世界简介'] || d['描述'] || d['简介'] || d['description'] || (Array.isArray(d.items) && d.items[0] && (d.items[0]['详细描述'] || d.items[0]['描述'])) || '';
      }
      if (!desc) { window.toast('生成结果为空'); return; }
      w.meta = w.meta || {};
      w.meta.description = String(desc).trim();
      if (!w.title && w.meta.title) w.title = w.meta.title;
      // 世界还没起名：只留在内存（切回来也不丢，见 世界渲染内容），**不要**拿空标题落盘
      // ——那会在存档目录里生出一个「未命名」幽灵世界
      if (!w.title) {
        w._草稿中 = true;
        window.toast('基本设定已生成（待填世界名后保存）');
        var ev0 = document.getElementById('worldEditorView');
        if (ev0) 世界渲染编辑器();
        return;
      }
      Store.world.save(w.title, w.meta).then(function() {
        window.toast('基本设定已更新');
        var ev = document.getElementById('worldEditorView');
        if (ev) 世界渲染编辑器();
      }).catch(function(e) { window.toast('保存失败：' + (e && e.message ? e.message : '未知')); });
    },
  });

  // 3) 基本设定 · 单字段：世界名
  registerAiField('world-name', '世界观·世界名', function() {
    var w = 世界当前世界;
    var meta = (w && w.meta) || {};
    var context = 世界组装上下文('世界设定', '基本设定', -1);
    return {
      user: 世界AI定位串('世界名') + '\n请为世界观「' + (w ? w.title : '未命名') + '」生成一个贴切、有辨识度的世界名。',
      system: '你是世界构建专家，为成人向创作软件取世界名。只输出世界名，不要解释。',
      worldName: w ? w.title : '',
      section: '世界设定',
      dim: '基本设定',
      existing: meta.title ? JSON.stringify({ title: meta.title }) : '（空）',
      context: context,
    };
  }, {
    // 单值字段：用自己的模板（world_name），{text} 承接定位串 + 取名字要求，system 也由模板提供。
    suggestPrompt: 'world_name',
    fillFn: function(d) {
      var w = 世界当前世界;
      if (!w) { window.toast('未选择世界'); return; }
      var name = '';
      if (typeof d === 'string') name = d;
      else if (d && typeof d === 'object') name = d['世界名'] || d['名称'] || d['name'] || d['title'] || (Array.isArray(d.items) && d.items[0] && (d.items[0]['条目']||'')) || '';
      name = String(name).trim();
      if (!name) { window.toast('生成结果为空'); return; }
      // 若世界尚未建立，先建；否则改名
      if (!w.title) {
        // 先查重：AI 取的名字撞上已有世界的话，直接建下去会把那个世界的 content 覆盖成空
        世界名占用(name).then(function(撞了) {
          if (撞了) { window.toast('已有同名世界「' + name + '」，请再来一次取个别的名字'); return; }
          w.title = name;
          w.meta = w.meta || {};
          w.meta.title = name;
          w.meta.modules = w.meta.modules || 世界可用模块.map(function(m){return m.id;});
          Store.world.save(name, w.meta).then(function() {
            return Store.world.saveContent(name, w.content || {});
          }).then(function() {
            世界列表缓存 = null;
            window.toast('已开天辟地: ' + name);
            var ev = document.getElementById('worldEditorView');
            if (ev) 世界渲染编辑器();
          }).catch(function(e) {
            // 没有 catch 时：建世界失败不提示，界面上却已经当成建好了
            w.title = '';
            window.toast('创建失败: ' + (e && e.message ? e.message : '未知'));
          });
        });
      } else {
        // 已建世界：改名
        if (name !== w.title) 世界执行改名(name);
        else {
          var ev2 = document.getElementById('worldEditorView');
          if (ev2) 世界渲染编辑器();
        }
      }
    },
  });

  // 4) 基本设定 · 单字段：世界简介
  registerAiField('world-desc', '世界观·世界简介', function() {
    var w = 世界当前世界;
    var meta = (w && w.meta) || {};
    var context = 世界组装上下文('世界设定', '基本设定', -1);
    return {
      user: 世界AI定位串('世界简介') + '\n请为世界观「' + (w ? w.title : '未命名') + '」生成其世界简介（一段贴合世界基调、法则与故事核心的概述，300 字左右）。',
      system: '你是世界构建专家，为成人向创作软件写世界简介。只输出简介正文，不要解释、不要标题。',
      worldName: w ? w.title : '',
      section: '世界设定',
      dim: '基本设定',
      existing: meta.description ? JSON.stringify({ description: meta.description }) : '（空）',
      context: context,
    };
  }, {
    // 单值字段：用自己的模板（world_desc），{text} 承接定位串 + 「300 字左右简介」要求，system 也由模板提供。
    suggestPrompt: 'world_desc',
    fillFn: function(d) {
      var w = 世界当前世界;
      if (!w) { window.toast('未选择世界'); return; }
      var desc = '';
      if (typeof d === 'string') desc = d;
      else if (d && typeof d === 'object') desc = d['世界简介'] || d['描述'] || d['简介'] || d['description'] || (d.items && Array.isArray(d.items) && d.items[0] && (d.items[0]['详细描述']||'')) || '';
      desc = String(desc).trim();
      if (!desc) { window.toast('生成结果为空'); return; }
      w.meta = w.meta || {};
      w.meta.description = desc;
      if (w.title) {
        Store.world.save(w.title, w.meta).then(function() {
          window.toast('简介已更新');
          var ev = document.getElementById('worldEditorView');
          if (ev) 世界渲染编辑器();
        }).catch(function(e) { window.toast('保存失败：' + (e && e.message ? e.message : '未知')); });
      } else {
        window.toast('简介已生成（待填世界名后保存）');
        var ev = document.getElementById('worldEditorView');
        if (ev) 世界渲染编辑器();
      }
    },
  });

  // 5) 军队 / 地理 · 条目内部（按分组生成）
  //    这两个板块的条目下钻之后都按分组铺开：军队七块（历史与传说 / 战力与装备 / 阶序与晋升 /
  //    军法与惩戒 / 征募与补充 / 驻地与营垒 / 俘获与处置），地理六块（地标性建筑 / 自然景观 /
  //    城区与分区 / 道路与门户 / 郊野与水系 / 防御与关隘）。每个大块是一次生成——所以这里只针对
  //    「当前正打开的那个条目 + 当前那一块」出题。为什么不做「一次生成全部块」：各块的东西差别极大
  //    （番号是编成、战利品是处置；地标是建筑、水系是河渠），合在一条 prompt 里必然互相串味，
  //    分块出题才能让每一块写透。
  //    两支共用下面这一对 contextFn / fillFn，只把板块（sec）换掉——分组表、分组引导、
  //    提示词、生成快照全都按这个板块走（原来只有军队那一套，地理复用它 → 分组名、提示词、
  //    快照板块全错，见 世界内部AI 上面的说明）。

  // 内部生成的上下文（{定位} 必须单独透传：world_military_group / world_geo_group 模板不用 {text}，
  // 走的是与 world_element 同一条路——见 world_element 模板上方那段说明）
  function 世界内部生成上下文(sec) {
    // 用生成快照锁定目标（世界 / 板块 / 维度 / 条目下标），与 world-element 同一条路；
    // contextFn 在「打开弹窗」与「点生成」时各跑一次，取的都是同一个锁定目标，不会漂移
    var t = 世界内部目标(sec);
    var w = t.世界;
    var p = t.父;
    var 分组 = window.世界内部生成分组 || 世界分组表(sec, t.维度)[0];
    var 已有 = 世界内部分组条目(p, 分组, sec).map(function(x) { return x['条目']; });
    var 全部 = (p && p['子级']) || [];
    return {
      user: 世界AI定位串(分组) + '\n请为这一' + (sec === '地理' ? '处「' + ((p && p['条目']) || '地点') + '」' : '支军队') + '写出「' + 分组 + '」这一块下的若干条内部设定。',
      system: (sec === '地理'
        ? '你是地理设定专家，为成人向创作软件构建世界观里的地点分区设定。只输出 JSON。'
        : '你是军事设定专家，为成人向创作软件构建世界观里的军队设定。只输出 JSON。'),
      worldName: (w && w.title) || '',
      section: sec,
      dim: t.维度,
      定位: 世界AI定位串(分组),
      条目: (p && p['条目']) || '',
      分组: 分组,
      条目正文: (p && p['详细描述']) || '（空）',
      existing: 已有.length ? 已有.join('、') : '（空）',
      其他块已有: 全部.filter(function(x) { return 世界子级分组名(sec, x) !== 分组; })
        .map(function(x) { return '[' + 世界子级分组名(sec, x) + '] ' + (x['条目'] || ''); }).join('\n') || '（空）',
      // 三段式上下文：① 就是「这一条兵种 / 这处地点」的全文（含它内部已写的各分组）
      context: 世界组装上下文(t.版块, t.维度, t.索引),
    };
  }

  // 内部生成的回填
  function 世界内部生成回填(sec, d) {
    // 与 world-element 的 fillFn 同构：锁定目标 → 去重 → 写进 父条目['子级'] → 落盘 → 切回锁定位置重绘
    var t = 世界内部目标(sec);
    var w = t.世界;
    var p = t.父;
    if (!p) { window.toast('生成目标已不在（那一条可能被删了），请重新进入该条目再生成'); return; }
    if (!w || !w.title) { window.toast('请先完成世界创建再保存'); return; }
    var 分组 = window.世界内部生成分组 || 世界分组表(sec, t.维度)[0];
    var list = (d && typeof d === 'object' && Array.isArray(d.items)) ? d.items : (Array.isArray(d) ? d : null);
    if (!list || !list.length) { window.toast('生成结果为空或无条目'); return; }
    var sub = p['子级'] || (p['子级'] = []);
    // 这一条内部的各块一起去重（同一条目里不该出现同名内部设定；prompt 也让 AI 别跨块重复）
    var 已有 = {};
    世界分组表(sec, t.维度).forEach(function(g) {
      世界内部分组条目(p, g, sec).forEach(function(x) { 已有[x['条目']] = 1; });
    });
    var 加 = 0;
    list.forEach(function(it) {
      var nm = String((it && (it['条目'] || it['名称'])) || '').trim();
      if (!nm || 已有[nm]) return;
      已有[nm] = 1;
      sub.push({ '条目': nm, '详细描述': String((it && it['详细描述']) || '').trim(), '分组': 分组 });
      加++;
    });
    if (!加) { window.toast('都与已有条目重复，未新增'); return; }
    Store.world.saveContent(w.title, w.content || {}).then(function() {
      window.toast('「' + 分组 + '」已加入 ' + 加 + ' 条');
      // 把定位切回生成时锁定的世界 / 条目，让用户看到结果落在原处
      世界当前世界 = w;
      世界当前版块 = sec;
      世界当前维度 = t.维度;
      世界子级索引 = t.索引;
      var el = document.getElementById('we-section');
      if (el) 世界渲染版块();
    }).catch(function(e) { window.toast('保存失败：' + (e && e.message ? e.message : '未知')); });
  }

  registerAiField('world-military-group', '军队·内部设定生成', function() { return 世界内部生成上下文('军队'); }, {
    suggestPrompt: 'world_military_group',
    count: true,
    defaultCount: 4,
    countLabel: '条',
    fillFn: function(d) { 世界内部生成回填('军队', d); },
  });

  registerAiField('world-geo-group', '地理·内部设定生成', function() { return 世界内部生成上下文('地理'); }, {
    suggestPrompt: 'world_geo_group',
    count: true,
    defaultCount: 4,
    countLabel: '条',
    fillFn: function(d) { 世界内部生成回填('地理', d); },
  });

  // 6) 人物（随从 / 奴仆）**不做内部分块**：
  //    一个人就是一条「详细描述」——来历、阶次、纠葛、动向全都写在里头（用户口径）。
  //    所以这里不再注册「按块生成」的 AI 字段；人物内容走维度级的 ✨ AI 生成（world_element）。

  // 7) 势力 · 关联面板的「只生成这一类」AI 生成
  //    场景：展开一个势力 → 点到「地理 · 世界地理」这一格 → 让 AI 只补这一类、
  //    而且**只补与这个势力相关的**。生成结果自动把「所属势力」填成本势力，一回填就出现在这一格。
  //    走二元模板：AI 字段 world-faction-related + 提示词 world_faction_related。
  registerAiField('world-faction-related', '势力·关联内容生成', function() {
    var w = 世界当前世界;
    var sec = 世界关联板块;
    var dim = 世界关联维度;
    var 势力 = window.世界关联生成势力 || '';
    var 组 = 世界扫描关联(势力);
    var 已有 = [];
    组.forEach(function(g) {
      if (g.板块 === sec && g.维度 === dim) g.条目.forEach(function(it) { 已有.push(it['条目']); });
    });
    var def = 世界版块表[sec] || {};
    var dimDef = null;
    for (var i = 0; i < (def.维度 || []).length; i++) if (def.维度[i].名 === dim) dimDef = def.维度[i];
    return {
      user: 世界AI定位串(dim) + '\n请只生成与势力「' + 势力 + '」有关的「' + sec + ' / ' + dim + '」条目。',
      system: '你是世界构建专家，为成人向创作软件构建世界观设定。只输出 JSON。',
      worldName: (w && w.title) || '',
      section: sec,
      dim: dim,
      定位: 世界AI定位串(dim),
      势力: 势力,
      类约束: (dimDef && dimDef.说明) || '（按该类通用标准生成）',
      existing: 已有.length ? 已有.join('、') : '（这一格还空着）',
      // 三段式上下文：① 就是「展开的这个势力」那一条的全文（你在它名下加东西，它自己最要紧）
      context: 世界组装上下文('势力', 世界当前维度, 世界关联索引),
    };
  }, {
    suggestPrompt: 'world_faction_related',
    count: true,
    defaultCount: 4,
    countLabel: '条',
    fillFn: function(d) {
      var w = 世界当前世界;
      var sec = 世界关联板块;
      var dim = 世界关联维度;
      var 势力 = window.世界关联生成势力 || '';
      if (!w || !sec || !dim || !势力) { window.toast('定位已失效，请回到那张势力卡片重试'); return; }
      if (!w.title) { window.toast('请先填世界名，再生成条目'); return; }
      var list = (d && typeof d === 'object' && Array.isArray(d.items)) ? d.items : (Array.isArray(d) ? d : null);
      if (!list || !list.length) { window.toast('生成结果为空或无条目'); return; }
      w.content = w.content || {};
      w.content[sec] = w.content[sec] || {};
      w.content[sec][dim] = w.content[sec][dim] || [];
      var 已存 = {};
      w.content[sec][dim].forEach(function(it) { if (it && it['条目']) 已存[it['条目']] = 1; });
      var 加 = 0;
      list.forEach(function(it) {
        var nm = String((it && it['条目']) || '').trim();
        if (!nm || 已存[nm]) return;
        已存[nm] = 1;
        var o = { '条目': nm, '详细描述': String((it && it['详细描述']) || '').trim(), '所属势力': 势力 };
        if (sec === '物品' && it['历史']) o['历史'] = String(it['历史']).trim();
        w.content[sec][dim].push(o);
        加++;
      });
      if (!加) { window.toast('都与已有条目重复，未新增'); return; }
      Store.world.saveContent(w.title, w.content).then(function() {
        window.toast('已为「' + 势力 + '」加入 ' + 加 + ' 条' + dim);
        var el = document.getElementById('we-section');
        if (el) 世界渲染版块();
      }).catch(function(e) { window.toast('保存失败：' + (e && e.message ? e.message : '未知')); });
    },
  });
}

window.世界渲染编辑器 = 世界渲染编辑器;
