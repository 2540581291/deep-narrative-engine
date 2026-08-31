// 情欲工坊 · 影视动画

// ===== 内容类型配置（第一层导航） =====
var 影视内容类型 = {
  tvseries:  { label: '电视剧', icon: '📺', desc: '分集连载的情色故事，每集有完整的起承转合，注重情感铺垫和欲望积累，用剧情包裹色情场面。', sections: ['片头','第一幕','第二幕','第三幕','片尾'], styleDesc: '' },
  movie:     { label: '电影', icon: '🎬', desc: '完整叙事结构的情色影片，有明确的视听语言和叙事节奏，追求艺术性和刺激性的平衡。', sections: ['开场','发展','情色场景','高潮','结局'] },
  special:   { label: '特摄', icon: '⚡', desc: '以特摄片（皮套、紧身衣、特殊装扮）的形式呈现情色内容，束缚感和权力关系贯穿始终。', sections: ['开场','变身/变装','战斗/调教','必杀技','结局'] },
  av:        { label: 'AV', icon: '🔞', desc: '以成人影片标准制作流程呈现直白露骨的情色内容，追求最大限度的视觉刺激。', sections: ['开场','前戏','本番','中出/颜射','访谈'] },
  cartoon:   { label: '动画片', icon: '🎨', desc: '以动画形式呈现情色内容，不受真人拍摄限制，可以表现夸张的体态和超现实的性爱场面。', sections: ['片头','故事展开','情色场面','转折','片尾'] },
  dongman:   { label: '动漫', icon: '🎭', desc: '以日本动漫叙事节奏和分集结构呈现情色内容，声优配音和日式画风是核心魅力。', sections: ['片头','A Part','B Part','插入曲','C Part'] },
  rifan:     { label: '里番', icon: '🔥', desc: '以日本里番（成人动画）的形式呈现情色内容，一集20分钟左右的短篇成人动画，注重性场面密度和视觉冲击力。', sections: ['开场','前戏','本番','后日谈'] },
};
var 影视内容类型键 = Object.keys(影视内容类型);

// ===== 电视剧类型配置 =====
var 电视剧类型配置 = {
  romance: { label: '言情', icon: '💕', sections: ['片头','第一幕','第二幕','第三幕','片尾'], styleDesc: '以爱情为主线的情色电视剧，注重情感纠葛和肉体关系之间的张力。男女主角之间的欲望从克制到释放，每集的性爱场面服务于感情线的推进。适合甜宠、虐恋、三角恋等情感驱动的情色故事。' },
  history: { label: '历史', icon: '🏯', sections: ['片头','第一幕','第二幕','第三幕','片尾'], styleDesc: '以历史背景为舞台的情色电视剧，帝妃之间的权力性爱、后宫争宠中的肉体交易、江湖侠客的露水情缘。古代服饰的层层剥落是独特的情色美感，权力和性欲的交织是核心看点。' },
  mystery: { label: '悬疑', icon: '🔍', sections: ['片头','第一幕','第二幕','第三幕','片尾'], styleDesc: '以悬疑破案为主轴的情色电视剧，每集围绕一个性犯罪案件展开调查。从案发现场的情色线索到审讯室里的心理博弈，性和死亡交织在一起。适合连环色魔、密室性虐、情杀谜局等题材。' },
  family:  { label: '家庭', icon: '🏠', sections: ['片头','第一幕','第二幕','第三幕','片尾'], styleDesc: '以家庭关系为背景的情色电视剧，夫妻之间的性冷淡与出轨、亲戚之间的越界、家庭成员之间的秘密性关系。日常的家庭场景下的欲望暗流，越是熟悉的人之间性张力越强。' },
  life:    { label: '生活', icon: '🌆', sections: ['片头','第一幕','第二幕','第三幕','片尾'], styleDesc: '以都市日常生活为背景的情色电视剧，白领职场中的暧昧、合租室友之间的性试探、健身房更衣室的偷窥、按摩店里的特殊服务。普通人的日常场景中随时可能爆发的性事，贴近真实生活的代入感。' },
  career:  { label: '职场', icon: '💼', sections: ['片头','第一幕','第二幕','第三幕','片尾'], styleDesc: '以职场环境为舞台的情色电视剧，办公室里的权力性爱、上司对下属的潜规则、同事之间的偷情、商务旅行中的一夜情。西装革履下是赤裸的欲望，职场竞争和性竞争双重展开。' },
  school:  { label: '校园', icon: '📚', sections: ['片头','第一幕','第二幕','第三幕','片尾'], styleDesc: '以校园为舞台的情色电视剧，师生之间的禁忌关系、同学之间的性探索、社团活动中的隐秘性事。制服是最强的催情剂，教室、图书馆、体育器材室——学校的每一个角落都可能是情色现场。' },
  comedy:  { label: '喜剧', icon: '😄', sections: ['片头','第一幕','第二幕','第三幕','片尾'], styleDesc: '以轻松搞笑为基调的情色电视剧，尴尬的性场面、阴差阳错的艳遇、令人捧腹的性误会。性爱场面不追求感官刺激而追求戏剧效果，让人笑着硬。适合轻松解压的成人喜剧。' },
  war:     { label: '抗战', icon: '🎖️', sections: ['片头','第一幕','第二幕','第三幕','片尾'], styleDesc: '以抗日/战争为背景的情色电视剧，战火中的人性欲望、女间谍的色诱任务、战地医院里的肉体慰藉、占领军和俘虏之间的权力性关系。战争把人推向极限，性在死亡阴影下更加疯狂和肆意。' },
};
var 电视剧类型键 = Object.keys(电视剧类型配置);

// ===== 电影类型配置 =====
var 电影类型配置 = {
  romance: { label: '言情', icon: '💕', sections: ['开场','发展','情色场景','高潮','结局'], styleDesc: '以爱情为主线的情色电影，注重情感纠葛和肉体关系之间的张力。男女主角之间的欲望从克制到释放，性爱场面服务于感情线的推进。适合甜宠、虐恋等情感驱动的情色故事。' },
  history: { label: '历史', icon: '🏯', sections: ['开场','发展','情色场景','高潮','结局'], styleDesc: '以历史背景为舞台的情色电影，帝妃之间的权力性爱、后宫争宠中的肉体交易、古代服饰的层层剥落是独特的情色美感。权力和性欲的交织是核心看点。' },
  mystery: { label: '悬疑', icon: '🔍', sections: ['开场','发展','情色场景','高潮','结局'], styleDesc: '以悬疑为框架的情色电影，围绕性犯罪或性秘密展开调查。从案发现场的情色线索到审讯室里的心理博弈，性和死亡交织在一起。节奏紧凑，层层剥开欲望的真相。' },
  family:  { label: '家庭', icon: '🏠', sections: ['开场','发展','情色场景','高潮','结局'], styleDesc: '以家庭关系为背景的情色电影，夫妻之间的性冷淡与出轨、亲戚之间的越界、家庭成员之间的秘密性关系。日常的家庭场景下的欲望暗流，用电影的叙事深度挖掘人性的复杂性。' },
  life:    { label: '生活', icon: '🌆', sections: ['开场','发展','情色场景','高潮','结局'], styleDesc: '以都市日常生活为背景的情色电影，白领职场中的暧昧、合租室友之间的性试探、健身房更衣室的偷窥。普通人的日常场景中随时可能爆发的性事，贴近真实生活的代入感。' },
  career:  { label: '职场', icon: '💼', sections: ['开场','发展','情色场景','高潮','结局'], styleDesc: '以职场环境为舞台的情色电影，办公室里的权力性爱、上司对下属的潜规则、同事之间的偷情、商务旅行中的一夜情。西装革履下是赤裸的欲望。' },
  school:  { label: '校园', icon: '📚', sections: ['开场','发展','情色场景','高潮','结局'], styleDesc: '以校园为舞台的情色电影，师生之间的禁忌关系、同学之间的性探索、社团活动中的隐秘性事。制服是最强的催情剂，学校的每一个角落都可能是情色现场。' },
  comedy:  { label: '喜剧', icon: '😄', sections: ['开场','发展','情色场景','高潮','结局'], styleDesc: '以轻松搞笑为基调的情色电影，尴尬的性场面、阴差阳错的艳遇、令人捧腹的性误会。性爱场面不追求感官刺激而追求戏剧效果，让人笑着硬。' },
  war:     { label: '抗战', icon: '🎖️', sections: ['开场','发展','情色场景','高潮','结局'], styleDesc: '以战争为背景的情色电影，战火中的人性欲望、女间谍的色诱任务、战地医院里的肉体慰藉。战争把人推向极限，性在死亡阴影下更加疯狂和肆意。' },
  art:     { label: '文艺', icon: '🎭', sections: ['开场','发展','情色场景','高潮','结局'], styleDesc: '以艺术审美为导向的情色电影，注重光影构图和情色美学。性爱场面拍得像油画，欲望在慢镜头和氛围音中发酵。不追求直白的感官刺激，而是用暗示和留白挑动观众的性想象力。' },
  action:  { label: '动作', icon: '⚔️', sections: ['开场','发展','情色场景','高潮','结局'], styleDesc: '以动作为框架的情色电影，打斗和性爱交替进行。汗水和体液交融，肌肉和肌肤碰撞。女杀手在执行任务途中被俘调教、黑帮老大用暴力征服肉体——荷尔蒙和肾上腺素双重爆表。' },
  scifi:   { label: '科幻', icon: '🚀', sections: ['开场','发展','情色场景','高潮','结局'], styleDesc: '以科幻设定为背景的情色电影，未来世界的性爱科技、人造人性爱伴侣、脑机接口的虚拟性体验、外星生物的跨物种交配。突破人类生理极限的性想象，科技感和情欲感并存的视觉奇观。' },
};
var 电影类型键 = Object.keys(电影类型配置);

// ===== 动画片类型配置 =====
var 动画片类型配置 = {


  taskForce: { label: '任务小队', icon: '🚨', sections: ['片头','故事展开','情色场面','转折','片尾'], styleDesc: '以团队冒险动画的形式呈现情色内容。每集围绕一个任务展开——救援被困的公主、寻找失落的宝物、对抗邪恶势力。固定角色阵容各自有不同的性癖角色分工，队长是有领导力的调教者，队员是懵懂的受教者。每集任务是对抗某种性威胁或完成一次性挑战。' },

  mahou:     { label: '魔法少女', icon: '✨', sections: ['片头','故事展开','情色场面','转折','片尾'], styleDesc: '以魔法少女变身动画的形式呈现情色内容。普通少女通过变身成为身穿华丽紧身衣的魔法战士，但变身后的战斗是情色调教——被触手缠绕、被敌人用淫术攻击、战败后被调教。变身过程本身就是一场情色仪式——衣服碎裂、身体发光、敏感部位在变身中暴露。' },


  myth:      { label: '神话改编', icon: '🏛️', sections: ['片头','故事展开','情色场面','转折','片尾'], styleDesc: '以神话传说为蓝本的情色动画。中国神话中仙女下凡与凡人交合、希腊神话中宙斯变成各种动物勾引凡间女子、日本神话中的触手系起源。用动画的形式还原古代神话中那些原始的性想象，画风兼具古典美和情色感。' },
};
var 动画片类型键 = Object.keys(动画片类型配置);

// ===== 动漫类型配置 =====
var 动漫类型配置 = {
  school:  { label: '校园', icon: '🏫', sections: ['片头','A Part','B Part','插入曲','C Part'], styleDesc: '以日本校园恋爱动画的形式呈现情色内容。开学典礼上的一见钟情、放课后空教室里的初体验、夏日合宿时的混浴意外、学园祭后的酒后乱性。用日式动画特有的细腻情感描写铺垫欲望，在青春的酸甜中融入情色元素。' },
  isekai:  { label: '异世界', icon: '🌌', sections: ['片头','A Part','B Part','插入曲','C Part'], styleDesc: '以异世界穿越题材动画的形式呈现情色内容。主角转生到魔法世界后在冒险中遭遇各种种族的情色事件——精灵族的隐秘祭典、兽人部落的强韧交配、魔王城的淫靡陷阱。日式异世界特有的等级制度和种族设定为情色描写提供了丰富的权力关系框架。' },
  mecha:   { label: '机甲', icon: '🤖', sections: ['片头','A Part','B Part','插入曲','C Part'], styleDesc: '以机甲题材动画的形式呈现情色内容。驾驶舱中驾驶员和副驾驶的同步率需要在肉体层面建立连接才能提高精神同步率，每一次出击前都需要一场激烈的性爱来调整神经元接续。机师之间的体液交换成为机体性能的关键——越是投入的战斗越发需要交配来维持精神稳定。' },
  comedy:  { label: '日常搞笑', icon: '😄', sections: ['片头','A Part','B Part','插入曲','C Part'], styleDesc: '以轻松搞笑的日常系动画形式呈现情色内容。每集一个令人捧腹的性误会——误入女汤的男主、给妹妹洗内裤被妈妈撞见、青梅竹马一起看成人影片被家长抓包。性场面不是重点，尴尬、脸红、慌忙掩饰的过程才是笑点所在。画风轻松明快。' },
  chinaStyle:{ label: '国风', icon: '🏮', sections: ['片头','A Part','B Part','插入曲','C Part'], styleDesc: '以中国风动画的形式呈现情色内容。水墨画风的性爱场景、古风配乐下的交合画面。狐妖化作人形引诱书生、蛇妖在深山中与猎人纠缠、画皮鬼在夜里爬上公子的床。国风特有的含蓄美感与露骨情色之间的张力是本类型的核心魅力。' },
  wuxia:   { label: '武侠', icon: '⚔️', sections: ['片头','A Part','B Part','插入曲','C Part'], styleDesc: '以武侠动画的形式呈现情色内容。江湖儿女的快意恩仇延烧到床上——女侠被点了穴后任人摆布、魔教教主用采补之术吸取正道弟子的功力、青楼里的情报交易演变成肉体交易。点穴、内力双修、合欢功法——武侠设定本身自带大量的情色操作空间。' },
  esport:  { label: '电竞', icon: '🎮', sections: ['片头','A Part','B Part','插入曲','C Part'], styleDesc: '以电竞题材动画的形式呈现情色内容。训练赛后的更衣室、夺冠之夜庆功宴上的酒后性事、男女选手在酒店房间里讨论战术到床上。电竞特有的线上身份和线下反差——游戏里冰冷的操作者到了线下变成热情的肉体。失利时用身体安慰、胜利时用身体庆祝。' },
  xianxia: { label: '修仙', icon: '☯️', sections: ['片头','A Part','B Part','插入曲','C Part'], styleDesc: '以修仙题材动画的形式呈现情色内容。双修功法是修为提升的捷径——灵根互补的双人炼丹需要采阴补阳；宗门的秘密献祭仪式需要处子之血；大师兄用禁术在密室中对师妹进行持续数日的灵力灌注。修为突破的关卡往往需要突破身体的界限，渡劫不仅是天雷考验也是欲念的考验。' },
};
var 动漫类型键 = Object.keys(动漫类型配置);

// ===== 里番类型配置 =====
var 里番类型配置 = {
  ntr:     { label: 'NTR', icon: '💔', sections: ['开场','前戏','本番','后日谈'], styleDesc: '以牛头人（NTR）题材里番的形式呈现情色内容。主角的伴侣被他人夺走、在眼前被侵犯的过程详细刻画。重点描写被背叛者的心理痛苦和被抢夺者的身体屈服之间的反差，肉体欢愉和精神痛苦的强烈对比是本类型最大看点。' },
  netorare:{ label: '寝取', icon: '😈', sections: ['开场','前戏','本番','后日谈'], styleDesc: '以女性主动或被引诱的寝取题材里番。人妻在丈夫不在时被邻居/上司/快递员逐步攻陷的过程，从一开始的抗拒到半推半就到主动索求。细腻的心理变化是核心，每一步陷落都伴随着更深的快感。' },
  rape:    { label: '凌辱', icon: '⛓️', sections: ['开场','前戏','本番','后日谈'], styleDesc: '以强制凌辱题材里番的形式呈现情色内容。从抵抗到崩溃到屈服的精神过程，强迫性的性行为伴随暴力、捆绑和心理摧残。重点刻画受害者从抗拒到绝望到彻底坏掉的状态变化。' },
  tentacle:{ label: '触手', icon: '🐙', sections: ['开场','前戏','本番','后日谈'], styleDesc: '以触手题材里番的形式呈现情色内容。触手不受人体限制，可以同时在所有敏感部位进行刺激。体液、黏液、被触手缠绕勒紧的肉体是本类型的核心情色元素。触手既是施暴者也是性玩具，充满日式独特的淫秽想象力。' },
  incest:  { label: '家族', icon: '👨‍👩‍👧‍👦', sections: ['开场','前戏','本番','后日谈'], styleDesc: '以家族乱伦题材里番的形式呈现情色内容。继母与继子、亲兄妹、父女之间的禁忌关系。日式里番特有的温水煮青蛙式发展——从日常的暧昧肢体接触开始，渐渐跨越界线，最后沉沦在背德的关系中无法自拔。' },
  school:  { label: '学园', icon: '🏫', sections: ['开场','前戏','本番','后日谈'], styleDesc: '以学园题材里番的形式呈现情色内容。以校园为舞台的纯肉系成人动画。教室里的课后补课变成调教、女子更衣室的偷拍演变成胁迫性行为、体育仓库里的强要。制服、体操服、泳装是核心服饰元素，大量群交和轮奸场景。' },
  harem:   { label: '后宫', icon: '👑', sections: ['开场','前戏','本番','后日谈'], styleDesc: '以后宫题材里番的形式呈现情色内容。一个男主被多位各具特色的女性围绕，每一集展开一条女角色的性爱线——学姐的主动诱惑、同学的意外撞见、老师的深夜家访。修罗场和性竞争并存，群交场景是每集的高潮看点。' },
  training:{ label: '调教', icon: '🔗', sections: ['开场','前戏','本番','后日谈'], styleDesc: '以调教题材里番的形式呈现情色内容。从肉体到精神的完整调教流程——规则的制定、惩罚的实施、奖励的给予、门槛的逐步提高。调教者一步步突破被调教者的身体极限和心理防线，最终使其完全服从。工具使用（鞭子、跳蛋、拘束具等）是核心视觉元素。' },
  hypnosis:{ label: '催眠', icon: '🌀', sections: ['开场','前戏','本番','后日谈'], styleDesc: '以催眠题材里番的形式呈现情色内容。通过催眠术操控他人进行性行为——在不知不觉中被暗示、从抗拒到接受的记忆改造、清醒时不知道自己在做什么的淫乱行为。催眠指令是核心机制，一句关键词就能让人当场发情，充满操纵和被操纵的禁忌快感。' },
  expose:  { label: '露出', icon: '👀', sections: ['开场','前戏','本番','后日谈'], styleDesc: '以露出题材里番的形式呈现情色内容。在公共场所进行性行为、或在可能被看到的危险边缘试探——天台上的站立后入、公园草丛中的口交、深夜公交上的痴汉play、电梯里从背后撩起裙子。被看见的危险和被发现的羞耻是核心快感来源。' },
  prison:  { label: '监禁', icon: '🔒', sections: ['开场','前戏','本番','后日谈'], styleDesc: '以监禁题材里番的形式呈现情色内容。受害者被囚禁在密室地下室中成为性奴。昏暗的光线、铁链的声音、长时间的肉欲折磨。重点是囚禁状态中的心理变化——从求救到绝望到习惯到依赖的斯德哥尔摩演变。密闭空间中施虐者与受虐者的关系是本类型灵魂。' },
  timeStop:{ label: '时间停止', icon: '⏸️', sections: ['开场','前戏','本番','后日谈'], styleDesc: '以时间停止题材里番的形式呈现情色内容。主角获得停止时间的能力后对静止的世界为所欲为。玩弄静止女人的每一寸身体而对方完全不知情——解开衣服、改变姿势、随意摆弄。时间停止后的为所欲为带来的支配感，以及恢复时间后对方毫无察觉的反差是本类型的核心趣味。' },
};
var 里番类型键 = Object.keys(里番类型配置);

// ===== 特摄类型配置 =====
var 特摄类型配置 = {
  ultraman:{ label: '奥特曼', icon: '🦸', sections: ['开场','变身/变装','战斗/调教','必杀技','结局'], styleDesc: '以奥特曼系列特摄的形式呈现情色内容。巨大化的光之巨人与怪兽在城市中战斗，但战斗过程充满性暗示——怪兽的触手缠绕奥特曼的身体、光线必杀技从胯部或胸口射出后的灼热余韵、被击败后仰面倒地的战败体位。地面视角下的裙底风光、大楼被撞碎时暴露的都市隐秘角落。地球防卫队的女队员在基地中被外星人附身调教。适合巨人×巨人、巨人×人类、触手×皮套等巨大化情色场景。' },
  kamen:   { label: '假面骑士', icon: '🏍️', sections: ['开场','变身/变装','战斗/调教','必杀技','结局'], styleDesc: '以假面骑士系列特摄的形式呈现情色内容。变身后的皮套性爱是本类型最大特色——紧身皮衣在性爱中摩擦发亮、护甲一块块被卸下露出内层的敏感部位、复眼面具下的视线在交合时的失神。变身体位从常人的体术升级为骑士踢姿势中的插入、骑士机枪扫射时的射精隐喻。反派女干部用蛇一般的身体缠绕骑士，用舌头舔舐面具的缝隙。骑士变身器可以被改装成按摩棒或跳蛋遥控器。' },
  sentai:  { label: '战队', icon: '🌈', sections: ['开场','变身/变装','战斗/调教','必杀技','结局'], styleDesc: '以超级战队系列特摄的形式呈现情色内容。五色战队的色情化——红色队长是攻、粉色女队员是团宠、蓝色冷感、黄色天真、绿色兽欲。每集战斗前有集体变身，变身过程本身就是一场团体性仪式——紧身衣包裹身体、头盔锁住面孔后只剩下喘息。战斗中的连携攻击是性爱配合的预演，必杀技的合体姿势是多P体位。战斗结束后基地里的嘉奖性爱——队长对表现最好的队员的奖励、输掉比赛后的惩罚性调教。巨大机器人合体也是五人的身体拼合在一起。' },
  kaiju:   { label: '怪兽', icon: '🦖', sections: ['开场','变身/变装','战斗/调教','必杀技','结局'], styleDesc: '以怪兽特摄的形式呈现情色内容。以怪兽和异形为主角，完全脱离人类审美的性爱场面——巨大的鳞片摩擦、黏液分泌、触手缠绕、锯齿状生殖器的交配。哥斯拉式的雄性怪兽和雌性怪兽在城市废墟中发情交配，撞击和破坏就是前戏。人类在这一类型中通常处于被玩弄的位置——被小型怪兽当作性玩具、被黏液包裹全身后一点点被吞入体内的窒息式高潮。' },
  ninja:   { label: '忍者', icon: '🥷', sections: ['开场','变身/变装','战斗/调教','必杀技','结局'], styleDesc: '以忍者特摄的形式呈现情色内容。忍者之间用忍术进行肉体对决——隐身术用于偷窥和尾随、分身术让多人同时服侍一人、口寄术召唤出淫兽攻击女忍者。女忍者在任务中故意被俘以接近目标，却在对方面前被真正的调教降服。手里剑划过紧身衣的裂缝、苦无挑断腰带——武器和道具在忍者特摄情色化中扮演重要角色。忍术对决演变为体液交换的竞技，谁的查克拉先耗尽谁就成为对方的性奴。' },
};
var 特摄类型键 = Object.keys(特摄类型配置);

// ===== AV类型配置 =====
var AV类型配置 = {
  amateur: { label: '素人出道', icon: '🌟', sections: ['开场','前戏','本番','中出/颜射','访谈'], styleDesc: '以素人出道题材AV的形式呈现情色内容。新人女优的第一支作品——素人被星探发现后拍摄初次镜头前的性爱。从面试签约到第一次在镜头前脱衣、第一次被陌生人抚摸、第一次在众人注视下插入的完整记录。初次的生涩、紧张和真实的反应是本类型最大卖点。' },
  massage: { label: '女性按摩', icon: '💆', sections: ['开场','前戏','本番','中出/颜射','访谈'], styleDesc: '以女性按摩题材AV的形式呈现情色内容。女性顾客到按摩店接受按摩服务，按摩逐渐越界变成彻底的性服务。女客被按摩师的手法从专业到暧昧逐步攻陷——潮吹喷水是常规操作，高潮失禁喷出尿液也是常见场景。每一次按压都精准刺激敏感点，直到全身痉挛着喷出最后一波液体。' },
  toilet:  { label: '公共便器', icon: '🚽', sections: ['开场','前戏','本番','中出/颜射','访谈'], styleDesc: '以公共便器题材AV的形式呈现情色内容。被当作公共厕所使用——在众人面前蹲下排泄、被要求喝下对方的尿液、把排泄物涂抹在身体上。突破人类最基本的羞耻防线，将排便排尿这一生理行为完全情色化。' },
  dogSlave:{ label: '犬奴调教', icon: '🐕', sections: ['开场','前戏','本番','中出/颜射','访谈'], styleDesc: '以犬奴调教题材AV的形式呈现情色内容。被当作狗一样生活和交配——四肢着地走路、用嘴接食物、像狗一样爬行到主人面前接受抚摸或惩罚。项圈牵引绳是核心道具，在户外被牵着散步后在路边交配、在公园里被其他"狗"骑跨。完全剥离人的身份回归动物层面的性。' },
  box24hr: { label: '箱中24小时', icon: '📦', sections: ['开场','前戏','本番','中出/颜射','访谈'], styleDesc: '以箱中监禁题材AV的形式呈现情色内容。被关在狭小的透明箱子中生活24小时——吃喝拉撒全在观众眼前进行。箱子成了活的展示柜，每一个高潮时身体撞击箱壁的声响、箱壁上因呼吸产生的雾气、箱底积攒的体液，都成为情色观赏的一部分。' },
  netorare:{ label: '寝取报告', icon: '📹', sections: ['开场','前戏','本番','中出/颜射','访谈'], styleDesc: '以寝取报告题材AV的形式呈现情色内容。丈夫或男友请人勾引自己的伴侣并全程拍摄——看着妻子/女友在别人身下辗转承欢。隐藏摄像头记录妻子一步步沦陷的过程——从拒绝到犹豫到接受到主动索求。观影者（丈夫本人）的心碎和勃起并存。' },
  eggOn:   { label: '跳蛋上街', icon: '🔋', sections: ['开场','前戏','本番','中出/颜射','访谈'], styleDesc: '以跳蛋上街题材AV的形式呈现情色内容。体内塞入跳蛋或遥控器后正常出门——超市购物时遥控器开到最大档、公交车上被远程操控到双腿发软、公司开会时桌下已经湿成一片。公众场合的日常生活和体内无法克制的快感之间的强烈对比。' },
  retire:  { label: '引退作', icon: '🎬', sections: ['开场','前戏','本番','中出/颜射','访谈'], styleDesc: '以引退/毕业题材AV的形式呈现情色内容。女优职业生涯的最后一部作品，通常包含回顾集锦、最终演出和真情告别。可能尝试之前从未拍过的题材，以最真实的情感和最投入的表演作为职业生涯的句号。事后的访谈中泪水和笑容交织，观众和女优一起完成这场告别的仪式。' },
};
var AV类型键 = Object.keys(AV类型配置);

function 影视获取子类型配置(mk) {
  if (mk === 'tvseries') return 电视剧类型配置;
  if (mk === 'movie') return 电影类型配置;
  if (mk === 'cartoon') return 动画片类型配置;
  if (mk === 'dongman') return 动漫类型配置;
  if (mk === 'rifan') return 里番类型配置;
  if (mk === 'special') return 特摄类型配置;
  if (mk === 'av') return AV类型配置;
  return null;
}
function 影视获取子类型详情(mk, subtype) {
  var cfg = 影视获取子类型配置(mk);
  if (cfg && subtype && cfg[subtype]) return cfg[subtype];
  // 没有子类型时用顶层配置的默认值
  var top = 影视内容类型[mk];
  return { sections: top ? top.sections : ['片段一','片段二','片段三'], styleDesc: top ? (top.styleDesc || '') : '' };
}
function 影视获取节目配置(type, subtype) {
  // 统一获取节目的有效配置：子类型 > 顶层配置
  var sub = 影视获取子类型详情(type, subtype);
  var top = 影视内容类型[type] || {};
  return {
    label: ((sub && sub.label) || top.label || ''),
    icon: ((sub && sub.icon) || top.icon || ''),
    sections: (sub && sub.sections) || top.sections || ['片段一','片段二','片段三'],
    styleDesc: (sub && sub.styleDesc) || top.styleDesc || ''
  };
}

var 影视来源名称映射 = { tvseries: '演员', movie: '演员', special: '演员', av: '演员', cartoon: '声优', dongman: '声优', rifan: '声优' };

// ===== 共享状态 =====
var 影视当前类型 = 'tvseries';
var 影视当前标签 = 'list';
var 影视当前节目 = null; // { name, info }
var 影视当前期号 = null; // { dir, info }
var 影视Api = null;
var 影视子标签 = [
  { id: 'list', label: '📋 列表' },
  { id: 'plan', label: '📝 规划' },
  { id: '演员', label: '🎭 演员' },
  { id: '导演', label: '🎬 导演' },
  { id: '声优', label: '🎤 声优' },
  { id: 'write', label: '✍️ 写作台' },
];

// ===== 存储 API =====
var 影视根路径 = '影视动画/';
var 影视文件夹 = { tvseries: '电视剧', movie: '电影', cartoon: '动画片', dongman: '动漫', special: '特摄', av: 'AV', rifan: '里番' };

function 影视媒体目录(mk) { return 影视根路径 + 影视文件夹[mk] + '/'; }
function 影视节目目录(mk, 节目名) { return 影视媒体目录(mk) + LocalFS.sanitize(节目名) + '/'; }

// 节目 CRUD
function 影视保存节目(mk, 节目名, data) { return LocalFS.saveJSON(影视节目目录(mk, 节目名) + 'info.json', data); }
function 影视加载节目(mk, 节目名) { return LocalFS.readJSON(影视节目目录(mk, 节目名) + 'info.json'); }
function 影视删除节目(mk, 节目名) { return LocalFS.delete(影视节目目录(mk, 节目名)); }

function 影视列出节目(mk) {
  return LocalFS.list(影视媒体目录(mk)).then(function(entries) {
    if (!entries || !entries.length) return [];
    var dirs = entries.filter(function(e) { return e.isDir; });
    return Promise.all(dirs.map(function(d) {
      return LocalFS.readJSON(影视媒体目录(mk) + d.name + '/info.json').then(function(info) {
        if (!info) return null;
        info._dir = d.name;
        return info;
      });
    })).then(function(items) { return items.filter(Boolean); });
  }).catch(function() { return []; });
}

// 期号路径：节目名/第X期
function 影视期号目录(mk, 节目名, 期号) { return 影视节目目录(mk, 节目名) + '第' + 期号 + '期/'; }
function 影视期号路径(mk, 节目名, 期号) { return 影视文件夹[mk] + '/' + LocalFS.sanitize(节目名) + '/第' + 期号 + '期'; }

// 期号 CRUD
function 影视列出期号(mk, 节目名) {
  var dir = 影视节目目录(mk, 节目名);
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

function 影视保存期号(期号路径, info) { return LocalFS.saveJSON(影视根路径 + 期号路径 + '/info.json', info); }
function 影视加载期号(期号路径) { return LocalFS.readJSON(影视根路径 + 期号路径 + '/info.json'); }
function 影视保存版块(期号路径, sectionName, data) { return LocalFS.saveJSON(影视根路径 + 期号路径 + '/' + sectionName + '.json', data); }
function 影视加载版块(期号路径, sectionName) { return LocalFS.readJSON(影视根路径 + 期号路径 + '/' + sectionName + '.json'); }
function 影视删除期号(期号路径) { return LocalFS.delete(影视根路径 + 期号路径); }

// ===== 来源存储 API（演员/导演每人一个文件） =====
function 影视来源目录(mk) {
  var sub = 影视来源名称映射[mk] || '演员';
  return 影视根路径 + 影视文件夹[mk] + '/' + sub + '/';
}
function 影视保存来源(mk, source) {
  var name = LocalFS.sanitize(source.name || '未命名') + '.json';
  return LocalFS.saveJSON(影视来源目录(mk) + name, source);
}
function 影视删除来源文件(mk, source) {
  var name = LocalFS.sanitize(source.name || '未命名') + '.json';
  return LocalFS.delete(影视来源目录(mk) + name);
}
function 影视加载来源(mk) {
  return LocalFS.list(影视来源目录(mk)).then(function(files) {
    if (!files || !files.length) return [];
    var jsonFiles = files.filter(function(f) { return f.name.endsWith('.json'); });
    return Promise.all(jsonFiles.map(function(f) {
      return LocalFS.readJSON(影视来源目录(mk) + f.name);
    })).then(function(items) { return items.filter(Boolean); });
  }).catch(function() { return []; });
}

// ===== 首页渲染 =====
function 渲染影视动画页(el) {
  var items = 影视内容类型键.map(function(mk) { var m = 影视内容类型[mk]; return { id: mk, label: m.icon + ' ' + m.label }; });
  if (!影视Api) {
    影视Api = 渲染标签栏(el, items, { active: 影视当前类型, subId: 'ysSubContent', onSwitch: function(mk){ 影视切换类型(mk); } });
  } else {
    影视Api.setActive(影视当前类型);
  }
  渲染影视内容();
}

function 影视切换类型(mk) {
  影视当前类型 = mk;
  影视当前标签 = 'list';
  渲染影视内容();
}

// 渲染当前类型的次级分段 + 视图容器
function 渲染影视内容() {
  var sub = 影视Api ? 影视Api.sub : null;
  if (!sub) return;
  if (!影视当前类型) {
    sub.innerHTML = '<div class="placeholder-text" style="padding:40px;text-align:center">选择上方内容类型开始编辑</div>';
    return;
  }
  var h = '<div class="tl-subnav">';
  影视子标签.forEach(function(t) {
    if (t.id === '演员' && ['cartoon','dongman','rifan'].indexOf(影视当前类型) >= 0) return;
    if (t.id === '声优' && ['tvseries','movie','special','av'].indexOf(影视当前类型) >= 0) return;
    h += '<div class="tl-subitem' + (t.id === 影视当前标签 ? ' act' : '') + '" data-tab="' + t.id + '">' + t.label + '</div>';
  });
  h += '</div><div id="ysContentView"></div>';
  sub.innerHTML = h;
  sub.querySelectorAll('.tl-subitem[data-tab]').forEach(function(i) {
    i.addEventListener('click', function() { 影视切换标签(this.getAttribute('data-tab')); });
  });
  影视切换标签(影视当前标签);
}

window.影视选择类型 = function(mk) {
  影视当前类型 = mk;
  影视当前标签 = 'list';
  var el = document.getElementById('videosContent');
  if (el) 渲染影视动画页(el);
};

function 影视切换标签(tab) {
  if (影视当前标签 === 'plan' && tab !== 'plan' && window.影视当前节目) {
    if (影视自动保存计时器) clearTimeout(影视自动保存计时器);
    影视自动保存计时器 = null;
    var epInput = document.getElementById('ysEpNumber');
    var hlEl = document.getElementById('ysEpHeadline');
    var focusEl = document.getElementById('ysEpFocus');
    var plotEl = document.getElementById('ysEpPlot');
    if (epInput && hlEl && focusEl && plotEl) {
      var ep = parseInt(epInput.value) || 0;
      if (ep >= 1) {
        var mk = 影视当前类型;
        var 节目 = 影视当前节目;
        var srcNames = [], charNames = [];
        document.querySelectorAll('#ysEpSources .tag-active').forEach(function(el) {
          srcNames.push(el.textContent.trim());
        });
        document.querySelectorAll('#ysEpChars .tag-active').forEach(function(el) {
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
        var 期号路径 = 影视期号路径(mk, 节目.name, ep);
        影视保存期号(期号路径, info);
      }
    }
  }
  影视当前标签 = tab;
  var el = document.getElementById('ysContentView');
  if (!el) return;
  var navs = document.querySelectorAll('#videosContent .tl-subitem');
  navs.forEach(function(n) { n.classList.toggle('act', n.getAttribute('data-tab') === tab); });
  if (tab === 'list')   { 影视渲染列表(el); }
  else if (tab === 'plan')   { 影视渲染规划(el); }
  else if (tab === '演员')   { 影视渲染演员(el); }
  else if (tab === '导演')   { 影视渲染导演(el); }
  else if (tab === '声优')   { 影视渲染声优(el); }
  else if (tab === 'write')  { 影视渲染写作台(el); }
}

window.影视返回首页 = function() {
  影视当前类型 = '';
  影视当前标签 = 'list';
  var el = document.getElementById('videosContent');
  if (el) 渲染影视动画页(el);
};

// ===== 路由注册 =====
// 用已有路由 ID 'videos'
var _origVideosRender = window.渲染影视页;
window.渲染影视动画页 = 渲染影视动画页;
registerPageRoute('videos', function() {
  var el = document.getElementById('videosContent');
  if (!el) return;
  // 检查是否已有占位渲染（旧的 渲染影视页），替换为新的
  if (window.渲染影视动画页) 渲染影视动画页(el);
});

window.影视内容类型 = 影视内容类型;
window.影视内容类型键 = 影视内容类型键;
window.电视剧类型配置 = 电视剧类型配置;
window.电影类型配置 = 电影类型配置;
window.动画片类型配置 = 动画片类型配置;
window.动漫类型配置 = 动漫类型配置;
window.里番类型配置 = 里番类型配置;
window.特摄类型配置 = 特摄类型配置;
window.AV类型配置 = AV类型配置;
window.影视获取子类型配置 = 影视获取子类型配置;
window.影视获取子类型详情 = 影视获取子类型详情;
window.影视获取节目配置 = 影视获取节目配置;
window.影视来源名称映射 = 影视来源名称映射;
window.影视列出节目 = 影视列出节目;
window.影视保存节目 = 影视保存节目;
window.影视加载节目 = 影视加载节目;
window.影视删除节目 = 影视删除节目;
window.影视列出期号 = 影视列出期号;
window.影视保存期号 = 影视保存期号;
window.影视加载期号 = 影视加载期号;
window.影视保存版块 = 影视保存版块;
window.影视加载版块 = 影视加载版块;
window.影视删除期号 = 影视删除期号;
window.影视期号路径 = 影视期号路径;
window.影视保存来源 = 影视保存来源;
window.影视加载来源 = 影视加载来源;
window.影视当前类型 = 影视当前类型;
window.影视当前节目 = 影视当前节目;
window.影视当前期号 = 影视当前期号;
