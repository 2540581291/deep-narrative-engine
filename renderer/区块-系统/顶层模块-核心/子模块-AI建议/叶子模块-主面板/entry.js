// 深度-叙事引擎 · AI 建议系统（完整版）
function aiInput(id, labelTxt, placeholder, value) {
  return aiField(id, labelTxt, placeholder, value, false);
}
function aiTextarea(id, labelTxt, placeholder, value) {
  return aiField(id, labelTxt, placeholder, value, true);
}
function aiField(id, labelTxt, placeholder, value, isTextarea) {
  var html = '<div class="mb-10">';
  html += '<label style="font-size:0.82em;color:var(--fg2);display:block;margin-bottom:3px">' + labelTxt + '</label>';
  html += '<div class="ai-field-row">';
  if (isTextarea) html += '<textarea id="' + id + '" class="llm-input" style="min-height:100px;resize:vertical" placeholder="' + placeholder + '">' + escHtml(value || '') + '</textarea>';
  else html += '<input id="' + id + '" class="llm-input" value="' + escHtml(value || '') + '" placeholder="' + placeholder + '" />';
  html += '<button class="ai-suggest-btn" onclick="openAiPanel(\'' + id + '\')" title="AI 建议">🤖</button>';
  html += '</div>';
  html += '<div id="aiopts_' + id + '" class="ai-options dn mt-4"></div>';
  html += '</div>';
  return html;
}
function aiSelectField(id, labelTxt, options, currentVal) {
  var html = '<div class="flex-1">';
  html += '<label style="font-size:0.82em;color:var(--fg2);display:block;margin-bottom:3px">' + labelTxt + '</label>';
  html += '<div class="ai-field-row">';
  html += '<select id="' + id + '" class="llm-input llm-select">';
  for (var i = 0; i < options.length; i++) html += '<option value="' + options[i] + '"' + (currentVal === options[i] ? ' selected' : '') + '>' + options[i] + '</option>';
  html += '</select>';
  html += '<button class="ai-suggest-btn" onclick="openAiPanel(\'' + id + '\')">🤖</button>';
  html += '</div>';
  html += '<div id="aiopts_' + id + '" class="ai-options" class="dn mt-4"></div></div>';
  return html;
}

var AI_QUICK_PRESETS = {
  _common: [
    { label: '📝 更简洁', dir: '简洁明了，用词精炼，不要冗长', category: 'style' },
    { label: '📝 更详细', dir: '详细具体，包含更多细节和描述', category: 'style' },
    { label: '📝 更有创意', dir: '富有想象力，不拘一格，让人眼前一亮', category: 'style' },
    { label: '📝 更传统', dir: '符合经典套路和读者的预期', category: 'style' },
    { label: '📝 更大胆', dir: '突破常规，出人意料', category: 'style' },
    { label: '📝 更文艺', dir: '文学性强，用词考究，有诗意', category: 'style' },
    { label: '🎯 更具体', dir: '具体可操作，不要空泛', category: 'precision' },
    { label: '🎯 更抽象', dir: '概念化，留出解读空间', category: 'precision' },
    { label: '🎯 更实用', dir: '贴近实际写作场景，直接可用', category: 'precision' },
  ],
  // 点评赏析 · 方向快捷项（评价赏析 / 喷子 / 水军）
  'dianPingAppreciate': [
    { label: '🎯 性描写张弛', dir: '重点点评性描写的张弛与节奏', category: 'focus' },
    { label: '🎯 氛围营造', dir: '重点点评氛围营造与情绪张力', category: 'focus' },
    { label: '🎯 人物欲望刻画', dir: '重点点评人物欲望与心理刻画', category: 'focus' },
    { label: '🎯 情色隐喻', dir: '重点点评情色隐喻与象征的妙处', category: 'focus' },
    { label: '🎯 结构与文笔', dir: '重点点评结构安排与文笔优劣', category: 'focus' },
    { label: '⚖️ 客观中肯', dir: '保持客观中肯，不夸大不贬损', category: 'stance' },
    { label: '⚖️ 犀利但有理', dir: '可以犀利，但每句都要有依据', category: 'stance' },
  ],
  'dianPingTroll': [
    { label: '🔨 吹毛求疵', dir: '吹毛求疵，把小事放大成问题', category: 'flavor' },
    { label: '🔨 放大缺点', dir: '只放大缺点，无视一切优点', category: 'flavor' },
    { label: '🔨 嘲讽拉踩', dir: '用嘲讽口吻拉踩，阴阳怪气', category: 'flavor' },
    { label: '🔨 刻意给差评', dir: '刻意给低分差评，立场先行', category: 'flavor' },
  ],
  'dianPingShill': [
    { label: '🎉 无脑吹捧', dir: '无脑吹捧，全篇只夸不贬', category: 'flavor' },
    { label: '🎉 强行夸细节', dir: '连瑕疵也强行夸成亮点', category: 'flavor' },
    { label: '🎉 捧杀', dir: '过度拔高，捧到不切实际的高度', category: 'flavor' },
  ],
  // 生图词典 · 本地提示词：形态类快捷选项
  'stcd-local-gen': [
    { label: '🍆 阴茎×10', dir: '【核心要求】英文 prompt 中阴茎标签（cock/penis/dick 或等价标签）出现不少于 10 次，宁多勿少。；【反复强调】从多角度重复强化阴茎——大小（粗大/狰狞）、状态（充血勃起/青筋虬结/高翘）、位置（挺立于身前、抵住穴口、贯穿其中）、动作（插入、抽送、拍打、摩擦、喷射），同一意象用不同标签反复出现。；【贯穿使用】阴茎要参与每一个性器官的描写：插入小穴、抵住肛门、顶进咽喉、摩擦乳沟，每一处都点出阴茎本体。；【状态叠加】若佩戴贞操锁或尿道棒，锁闭/贯穿状态同样反复出现（锁笼中阴茎轮廓、尿道棒撑开的尿道口）。；【收尾强化】prompt 结尾再次点出阴茎（如 dripping cock、semen-covered cock），首尾呼应，确保总数不少于 10 次。', category: 'bodyPart' },
    { label: '💦 精液+避孕套', dir: '【精液要求】精液必须大量、醒目、遍布：糊在头发上、淋在脸上/身上（脸、胸、乳沟、大腿、开孔四周被精液覆盖流淌）、积在体内外（小穴/肛门开孔处精液溢出滴落、表面精液蜿蜒成痕）；用 semen、cum、semen-covered、cum-soaked、dripping semen 等标签反复出现。；【避孕套要求】画面必须有使用过的避孕套：套身松弛半垂（worn/used condom）、内中盛满精液（filled with semen）、袋口精液外溢、套体半透明可见内部乳白精液；位置可挂在小穴/肛门开孔处、塞在缝隙、搭在体表、遗落在凹陷处；用 used condom、semen-filled condom 等标签明确强调。', category: 'bodyPart' },
    { label: '💦 尿液(自尿)', dir: '【核心要求】尿液必须大量、醒目：角色自己正在排尿（peeing、urinating、self-peeing）——尿流从小穴/阴茎/尿道口喷出，呈透明淡黄色柱状/散流；尿液喷淋覆盖自身（头发、脸、胸、乳沟、大腿、开孔四周被尿液浸湿流淌）；尿液积存于身体凹陷（腹部/开孔处尿液滴落）；失禁感（involuntary urination、pissing herself/himself）；用 pee、urine、urinating、pissing、golden shower 等标签反复出现，数量充足。', category: 'bodyPart' },
    { label: '💩 粪便(自拉)', dir: '【排便过程（重点展开，必须完整呈现）】角色正在当场排便（defecating、pooping、self-defecation）：蹲踞/蜷缩/伏地的排便姿态、臀部翘起、肛门用力张合——先见粪头（stool、turds）从张开的肛口缓缓顶出、撑开括约肌、随后整根粪条连续排出（排出中的粪便、半挂在肛口的粪便）；伴随用力反应（绷紧的腹部、涨红的脸、皱眉咬牙、腹节收缩蠕动）；失禁感（involuntary defecation、soiling herself/himself）。；【粪便状态与分布】成形/软烂/稀溏均可；粪便沾满身体（臀部、大腿内侧、开孔四周被粪迹涂擦），堆在脚下/身下或挂在肛口未断；污秽氛围（feces、excrement、filth、shit、messy）。', category: 'bodyPart' },
    { label: '🧸 性玩具(多样)', dir: '【互动核心（重点展开）】所有玩具必须处于正在被使用的状态：震动棒插在小穴/阴道内正在震动抽插（vibrating inside、thrusting）、假阳具在体内进进出出（fucking herself with dildo）、肛塞塞在肛门里被括约肌夹紧（plug gripping）、拉珠正在拉出（beads being pulled out）、跳蛋贴紧阴蒂/乳头高频震动（buzzing on clit）、口塞含在嘴里口水顺着流（gagged、drooling）、乳夹夹住乳头越夹越紧（clamped）；身体反应（淫水浸湿玩具、穴肉缠紧玩具、被刺激到颤抖潮吹失禁）。；【多样要求】同时出现至少 3-5 种不同类型玩具（vibrator、dildo、butt plug、anal beads、nipple clamps、magic wand、gag ball 等），每种都有明确使用位置与互动动作。', category: 'tool' },
    { label: '🚰 管道插入', dir: '【管道插入】管道插入肛门、阴道、阴蒂、嘴巴各孔窍（管口自孔窍深入体内，密封衔接）：阴道管、肛门管、阴蒂管、口管。；【连接方向】管道向上连接或向下交接：自嘴部上接、自阴道/肛门下接、管道间可交汇分叉，形成贯穿身体的管道网络。；【管内体液】管道内输送精液或尿液（透明管中可见液体流动），可为精液管、尿液管或二者混合。；【prompt 标签】用 tubes、pipes、inserted tube、tube in pussy/ass/mouth、semen flowing、urine flow、transparent tube 等标签反复出现。', category: 'tool' },
    { label: '🧦 袜子', dir: '【袜子种类（择一或组合，写清具体款式）】连裤袜、吊带袜、过膝长袜、大腿袜、及膝袜、小腿袜、短袜/船袜、网袜、渔网袜、蕾丝袜、棉袜、羊毛袜、堆堆袜、袜套、分趾袜/足袋（古装）、布袜（古装）等。；【材质】尼龙、薄丝、厚丝、丝绸、棉、羊毛、蕾丝、渔网、天鹅绒、莱卡等。；【颜色】白、黑、肤色、粉、红、蓝、紫、绿、灰、棕、渐变、条纹、波点、印花等。；【要求】袜子的种类、材质、颜色必须在 prompt 中明确写出（如 black sheer pantyhose、white cotton thighhighs），写丰富具体；可适当表现袜口勒肉/袜与大腿的贴合感。；【prompt 标签】用 pantyhose、thighhighs、kneehighs、socks、stockings、fishnet、lace socks、cotton socks、tabi（足袋）等标签。', category: 'outfit' },
    { label: '🖐 痛苦标记', dir: '【痕迹类型（同时出现多种）】巴掌痕（slap marks、handprint）：巴掌印、五指分明、微微肿起；鞭痕（whip marks）：纵横交错的红肿鞭痕、条状凸起、带血丝破皮；淤青（bruises）：青紫淤痕、新旧交叠；其他痛苦标记：齿痕/咬痕、掐痕、绳勒痕/捆绑勒痕、烫痕、划痕、针扎红点、刑具烙印。；【状态要求】痕迹必须醒目、密集、新旧交叠：红肿发紫的淤青、破皮渗血丝的鞭痕、肿起的掌印，分布在身体各处；痕迹与身体反应结合（被抽打处皮肤发红发烫、周围微肿、疼痛蜷缩）；用 spanking marks、whip marks、bruises、handprint、rope marks、bite marks 等标签反复出现，数量充足。', category: 'bodyPart' },
    { label: '📜 纹身烙印', dir: '【纹身与烙印类型（同时出现多种）】堕胎纹（abortion scar）、黑桃纹（spade tattoo）、正字（tally marks、正字符号）、编号（number、barcode、serial number）、占有字样（property、owner name、master mark）、淫纹/性奴纹（slave tattoo）、项圈印记、烙印（brand mark）、穿刺环痕。；【状态要求】纹身/烙印必须清晰、醒目：墨色/焦痕的纹样与文字贴在皮肤表面，黑桃纹、正字、编号、烙印字样都要明确可读；纹身可缠绕身体、新旧交叠（旧纹褪色+新纹鲜明）；用 tattoo、spade tattoo、tally marks、brand、barcode、property mark 等标签反复出现，数量充足。', category: 'bodyPart' },
    { label: '🍑 正在被抽插×10', dir: '【核心要求】英文 prompt 中抽插/贯穿类标签（thrusting、penetrating、fucking、pounding、impaled、deep penetration 或等价标签）出现不少于 10 次，宁多勿少。；【反复强调】从多角度重复强化抽插动作——对象（阴茎/假阳具正插入小穴、肛门、口/咽喉、乳沟等各穴）、力度（猛烈抽插/狠狠顶弄/连续贯穿/深顶到最深处）、节奏（急促/往复/抽出一半再狠狠插回）、身体反应（被顶得前后晃动、穴口被撑开吞吐、体液随抽插飞溅）。；【贯穿使用】抽插动作参与每一个被使用的穴口描写。；【收尾强化】prompt 结尾再次点出抽插动作（如 thrusting deep、fucking hard），首尾呼应，确保总数不少于 10 次。', category: 'bodyPart' },
    { label: '🤰 孕肚×10', dir: '【核心要求】英文 prompt 中孕肚/怀孕类标签（pregnant、pregnancy belly、swollen belly、baby bump 或等价标签）出现不少于 10 次，宁多勿少。；【反复强调】从多角度重复强化孕肚——大小（高高隆起/圆滚鼓胀/沉重下垂）、状态（肚皮绷紧发亮、妊娠纹/妊娠线、肚脐被顶得外翻突出、胎动顶起肚皮）、与其他部位对比（孕肚衬托出乳房的肿胀、开孔被压得愈发显眼）。；【贯穿使用】孕肚参与每一个身体描写：挺着孕肚的体态、孕肚下方开孔、孕肚上的纹身烙印被撑大变形、孕肚与抽插动作结合（被插入时孕肚晃动）。；【收尾强化】prompt 结尾再次点出孕肚（如 pregnant belly、heavy belly），首尾呼应，确保总数不少于 10 次。', category: 'bodyPart' },
    { label: '👅 长舌×10', dir: '【核心要求】英文 prompt 中长舌/流涎类标签（long tongue、elongated tongue、tongue out、drooling、saliva dripping、slobbering 或等价标签）出现不少于 10 次，宁多勿少。；【反复强调】从多角度重复强化长舌——长度（舌头长垂、远超常人）、形态（舌面湿亮、可卷曲缠绕）、状态（舌尖滴着口水、唾液拉丝成线、嘴角/下颌口水横流成滩）、动作（舌头伸出垂落/卷起舔舐/缠绕贯穿物/伸向开孔）、身体反应（被舔到的地方湿亮、口水浸湿胸腹）。；【贯穿使用】长舌参与多个部位描写：长舌垂在胸前、舌头缠绕阴茎/玩具、舌尖探入小穴/肛门开孔、口水积在开孔四周。；【收尾强化】prompt 结尾再次点出长舌（如 long tongue、drooling tongue），首尾呼应，确保总数不少于 10 次。', category: 'bodyPart' },
  ],
  // 灵感角色库 · 角色生成：人物类型 + 风格气质快捷方向
  'stcd-inspire-gen': [
    { label: '👧 少女', dir: '少女感，身形娇小，清纯羞怯，神态青涩', category: 'character' },
    { label: '🧑 成熟', dir: '成熟美艳，身段丰腴，气质妩媚，阅历丰富', category: 'character' },
    { label: '❄️ 清冷', dir: '清冷疏离，神色淡漠，拒人千里，禁欲又暗藏风情', category: 'character' },
    { label: '🌺 妖娆', dir: '妖娆诱惑，媚眼如丝，主动撩拨，风情万种', category: 'character' },
    { label: '🏠 邻家', dir: '邻家女孩，温柔恬静，亲切自然，平凡中透暖意', category: 'character' },
    { label: '👑 高贵', dir: '高贵端庄，举手投足优雅，自带威严与距离感', category: 'character' },
    { label: '⚔️ 英气', dir: '英气飒爽，利落干练，眉眼锐利，气势凌厉', category: 'character' },
    { label: '📜 古风', dir: '古风韵味，衣袂飘飘，古典含蓄，符合朝代气质', category: 'style' },
    { label: '🎓 制服', dir: '制服感，职业装/校服，规整克制，突出反差', category: 'style' },
    { label: '✨ 仙侠', dir: '仙侠风，修仙门派气质，法衣法器，出尘脱俗', category: 'style' },
    { label: '🖤 暗黑', dir: '暗黑系，阴郁神秘，有危险气息，冷艳致命', category: 'style' },
  ],
  // 典型角色 · 深化已有：能力/方向快捷预设
  'stcd-inspire-char-gen-deep': [
    { label: '🧬 加性格层次', dir: '把她的性格写出层次：深处的执念、矛盾、伪装下的真实，避免扁平', category: 'character' },
    { label: '📜 丰成长经历', dir: '补全她的成长轨迹：几岁、经历了什么转折、如何变成现在这样，让经历落地', category: 'story' },
    { label: '💞 写关系纠葛', dir: '丰富她与他人（亲人/爱人/敌人）的关系纠葛，让关系线有张力', category: 'relation' },
    { label: '🔞 深化性爱', dir: '把性爱明细写得更细、更贴性格：每段情事的起因、内心、身体反应都具体', category: 'body' },
  ],
  // 典型角色 · 多卡生成：读参考找灵感、再原创的倾向
  'stcd-inspire-char-gen-gen': [
    { label: '💡 读后有感', dir: '读完参考找到打动你的点，凭灵感原创一个气质相近但完全独立的新角色', category: 'character' },
    { label: '🌫 换时代感', dir: '吸收参考的某个内核，放到完全不同的时代/身份去重新演绎，原创出新角色', category: 'story' },
    { label: '🔁 不复制只神似', dir: '绝不能复刻或融合参考角色；只吸收其某种气质，原创出全新的、立得住的新角色', category: 'style' },
  ],
  // 典型角色 · 多卡混搭：融合倾向
  'stcd-inspire-char-gen-mix': [
    { label: '👁 混外貌', dir: '重点取各卡的外貌/体型设定，混搭出一个外观吸睛的新角色', category: 'appearance' },
    { label: '🗣 混性格', dir: '重点取各卡的性格/气质设定，混搭出一个性格鲜明的新角色', category: 'character' },
    { label: '🧬 混身世', dir: '重点取各卡的身世/家族/经历，混搭出一个背景丰富的新角色', category: 'story' },
    { label: '🔞 混性爱风格', dir: '重点取各卡的性爱偏好/风格，混搭出一个性爱观独特的新角色', category: 'body' },
  ],
};
var selectedDirs = {};
var catInfo = {
  style: { label: '风格方向', color: '#4ecca3' }, mood: { label: '情绪氛围', color: '#e94560' },
  precision: { label: '精准度', color: '#a78bfa' },
  structure: { label: '结构选择', color: '#34d399' }, character: { label: '角色类型', color: '#c084fc' },
  world: { label: '世界观', color: '#fb923c' }, identity: { label: '身份背景', color: '#f472b6' },
  body: { label: '体型外貌', color: '#22d3ee' },
  bodyPart: { label: '身体', color: '#ff6b6b' },
  outfit: { label: '装扮', color: '#f783ac' },
  tool: { label: '器物', color: '#9775fa' },
  place: { label: '场所', color: '#20c997' },
  relation: { label: '身份/关系', color: '#ffa94d' },
  sense: { label: '感官/交流', color: '#74c0fc' },
  focus: { label: '关注重点', color: '#22d3ee' },
  stance: { label: '评价立场', color: '#4ecca3' },
  flavor: { label: '风格', color: '#e94560' },
  default: { label: '其他', color: '#94a3b8' },
};

function openAiPanel(id) {
  var fieldInfo = getFieldInfo(id);
  if (!fieldInfo) { toast('该字段暂不支持 AI 建议'); return; }
  var presets = AI_QUICK_PRESETS[id] || AI_QUICK_PRESETS._common || [];

  var html = '<div class="mcard" style="max-width:620px">';
  html += '<h3 style="font-size:0.95em;margin-bottom:6px">🤖 AI 建议 · ' + fieldInfo.label + '</h3>';
  html += '<p style="font-size:0.78em;color:var(--fg2);margin-bottom:12px">点击快速预设选择方向（可多选），然后点「生成」。</p>';

  if (presets.length > 0) {
    html += '<div class="mb-12">';
    var groups = {};
    for (var p = 0; p < presets.length; p++) {
      var cat = presets[p].category || 'default';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(presets[p]);
    }
    for (var catKey in groups) {
      var info = catInfo[catKey] || catInfo.default;
      html += '<div class="mb-6">';
      html += '<span style="font-size:0.7em;color:' + info.color + ';font-weight:600;margin-bottom:3px;display:block">' + info.label + '</span>';
      html += '<div style="display:flex;gap:5px;flex-wrap:wrap">';
      for (var gi = 0; gi < groups[catKey].length; gi++) {
        var preset = groups[catKey][gi];
        var sel = (selectedDirs[id] && selectedDirs[id].indexOf(preset.dir) >= 0);
        html += '<span class="preset-chip preset-' + catKey + (sel ? ' preset-active' : '') + '" onclick="' + (preset.mutual ? ('singleTogglePreset(\'' + id + '\',\'' + escHtml(preset.dir) + '\',this)') : ('togglePreset(\'' + id + '\',\'' + escHtml(preset.dir) + '\',this)')) + '">' + preset.label + '</span>';
      }
      html += '</div></div>';
    }
    html += '</div>';
  }

  html += '<div class="mb-10">';
  html += '<label style="font-size:0.78em;color:var(--fg2);display:block;margin-bottom:4px">自定义方向（可选）</label>';
  html += '<input id="ai_dir" class="llm-input" placeholder="例如：偏古典风格" /></div>';

  html += '<div style="display:flex;gap:8px;align-items:center;justify-content:space-between">';
  html += '<div style="display:flex;gap:6px;margin-left:auto">';
  html += '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()" class="fs-082">取消</button>';
  html += '<button class="btn-main" onclick="generateAiOptionsFromPanel(\'' + id + '\', this)" class="fs-082">🎯 生成</button>';
  html += '</div></div></div>';

  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = html;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  setTimeout(function() { var d = document.getElementById('ai_dir'); if (d) d.focus(); }, 100);
}

function togglePreset(id, direction, el) {
  if (!selectedDirs[id]) selectedDirs[id] = [];
  var idx = selectedDirs[id].indexOf(direction);
  if (idx >= 0) { selectedDirs[id].splice(idx, 1); el.classList.remove('preset-active'); }
  else { selectedDirs[id].push(direction); el.classList.add('preset-active'); }
}
// 互斥类选项：点击时先取消同组其它选中，再选中当前（只能选一个）
function singleTogglePreset(id, direction, el) {
  if (!selectedDirs[id]) selectedDirs[id] = [];
  var chips = el.parentNode.querySelectorAll('.preset-chip.preset-active');
  for (var i = 0; i < chips.length; i++) chips[i].classList.remove('preset-active');
  var idx = selectedDirs[id].indexOf(direction);
  if (idx >= 0) { selectedDirs[id].splice(idx, 1); el.classList.remove('preset-active'); }
  else { selectedDirs[id].push(direction); el.classList.add('preset-active'); }
}

function generateAiOptionsFromPanel(id, btn) {
  var ov = btn.closest('.ovl');
  var customDir = document.getElementById('ai_dir') ? document.getElementById('ai_dir').value.trim() : '';
  var allDirs = (selectedDirs[id] || []).slice();
  if (customDir) allDirs.push(customDir);
  var wordLimitStr = '';
  var wordCountEl = document.getElementById('ai_wordcount');
  if (wordCountEl) { var num = parseInt(wordCountEl.value.trim()); if (num > 0) wordLimitStr = '。每个选项大约 ' + num + ' 字'; }
  var direction = allDirs.length > 0 ? allDirs.join('；') : '';
  var count = parseInt(document.getElementById('ai_count') ? document.getElementById('ai_count').value : '5') || 5;
  ov.remove(); delete selectedDirs[id];

  var fieldInfo = getFieldInfo(id);
  console.log('[AI] fieldInfo:', fieldInfo);
  if (!fieldInfo) { toast('该字段暂不支持 AI 建议'); return; }

  var dirHint = direction ? '，特别要求：' + direction : '';
  Promise.resolve(fieldInfo.context).then(function(ctx) {
    var promptName = fieldInfo.suggestPrompt || 'design_field_suggest';
    var contextStr = (typeof ctx === 'object' && ctx !== null) ? (ctx.prompt || ctx.user || JSON.stringify(ctx)) : ctx;
    var rendered = renderPrompt(promptName, { count: count, wordLimit: wordLimitStr, context: contextStr, field: fieldInfo.label, direction: dirHint });
    console.log('[AI] rendered prompt:', rendered);

    if (!rendered.system && !rendered.user) {
      toast('提示词模板未找到（design_field_suggest）');
      return;
    }

    window._lastPrompt = { system: rendered.system, prompt: rendered.user };
    LLM.callJSON({ label: 'AI 建议: ' + fieldInfo.label, system: rendered.system, prompt: rendered.user }).then(function(d) {
      if (!d || !d.options || !d.options.length) { toast('AI 返回格式异常，请重试'); return; }
      showOptionChips(id, d.options);
    }).catch(function(err) {
      console.log('[AI] LLM call error:', err);
      toast('AI 建议失败: ' + err.message);
    });
  }); // end Promise.resolve
} // end generateAiOptionsFromPanel

// ===== 页面级 AI 生成弹窗（直接填充，无 chip 选择） =====
function openAiGenPanel(id) {
  var fieldInfo = getFieldInfo(id);
  if (!fieldInfo) { toast('该字段暂不支持 AI 建议'); return; }
  var presets = AI_QUICK_PRESETS[id] || [];

  var html = '<div class="mcard" style="max-width:620px">';
  html += '<h3 style="font-size:0.95em;margin-bottom:6px">🤖 AI 生成 · ' + fieldInfo.label + '</h3>';
  html += '<p style="font-size:0.78em;color:var(--fg2);margin-bottom:12px">选择方向，AI 将直接生成并填充到页面。</p>';

  // 字段级「数量」快捷 chip（点选即设数量，供模板 {count} 用）
  if (fieldInfo.count) {
    var countOpts = [1, 3, 5, 6, 8, 10];
    var countDef = (fieldInfo.defaultCount || 5);
    if (countOpts.indexOf(countDef) < 0) countOpts.push(countDef);
    countOpts.sort(function(a, b) { return a - b; });
    var curC = String(selectedCount[id] || countDef);
    html += '<div class="mb-12">';
    html += '<span style="font-size:0.7em;color:#a78bfa;font-weight:600;margin-bottom:3px;display:block">数量</span>';
    html += '<div style="display:flex;gap:5px;flex-wrap:wrap">';
    for (var cgi = 0; cgi < countOpts.length; cgi++) {
      var cval = countOpts[cgi];
      var csel = (curC === String(cval));
      html += '<span class="preset-chip preset-precision' + (csel ? ' preset-active' : '') + '" onclick="selectCount(\'' + id + '\',' + cval + ',this)">' + cval + '</span>';
    }
    html += '</div></div>';
  }

  // 角色/人物生成类字段：性别选择（默认女），置于数量下方；选择会映射到生成性别
  if (fieldInfo.gender) {
    html += '<div class="mb-12">';
    html += '<span style="font-size:0.7em;color:#c084fc;font-weight:600;margin-bottom:3px;display:block">性别</span>';
    html += '<div style="display:flex;gap:5px;flex-wrap:wrap">';
    var goptions = ['女', '男', '伪娘', '扶她'];
    var curG = selectedGender[id] || '女';
    for (var ggi = 0; ggi < goptions.length; ggi++) {
      var gval = goptions[ggi];
      var gsel = (curG === gval);
      html += '<span class="preset-chip preset-character' + (gsel ? ' preset-active' : '') + '" onclick="selectGender(\'' + id + '\',\'' + gval + '\',this)">' + gval + '</span>';
    }
    html += '</div></div>';
  }

  if (presets.length > 0) {
    html += '<div class="mb-12">';
    var groups = {};
    for (var p = 0; p < presets.length; p++) {
      var cat = presets[p].category || 'default';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(presets[p]);
    }
    for (var catKey in groups) {
      var info = catInfo[catKey] || catInfo.default;
      html += '<div class="mb-6">';
      html += '<span style="font-size:0.7em;color:' + info.color + ';font-weight:600;margin-bottom:3px;display:block">' + info.label + '</span>';
      html += '<div style="display:flex;gap:5px;flex-wrap:wrap">';
      for (var gi = 0; gi < groups[catKey].length; gi++) {
        var preset = groups[catKey][gi];
        var sel = (selectedDirs[id] && selectedDirs[id].indexOf(preset.dir) >= 0);
        html += '<span class="preset-chip preset-' + catKey + (sel ? ' preset-active' : '') + '" onclick="' + (preset.mutual ? ('singleTogglePreset(\'' + id + '\',\'' + escHtml(preset.dir) + '\',this)') : ('togglePreset(\'' + id + '\',\'' + escHtml(preset.dir) + '\',this)')) + '">' + preset.label + '</span>';
      }
      html += '</div></div>';
    }
    html += '</div>';
  }

  html += '<div class="mb-10">';
  html += '<label style="font-size:0.78em;color:var(--fg2);display:block;margin-bottom:4px">自定义方向（可选）</label>';
  html += '<textarea id="ai_dir" class="llm-input" rows="3" placeholder="例如：偏古典风格、重口味方向" style="resize:vertical;width:100%;font-family:inherit"></textarea></div>';

  html += '<div style="display:flex;gap:8px;align-items:center;justify-content:space-between">';
  html += '<div style="display:flex;gap:8px;margin-left:auto"><button class="btn-out" onclick="this.closest(\'.ovl\').remove()" class="fs-082">取消</button><button class="btn-main" onclick="generateAiDirectFill(\'' + id + '\', this)" class="fs-082">🎯 生成并填充</button></div>';
  html += '</div></div>';

  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = html;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  setTimeout(function() { var d = document.getElementById('ai_dir'); if (d) d.focus(); }, 100);
}

function generateAiDirectFill(id, btn) {
  var ov = btn.closest('.ovl');
  var customDir = document.getElementById('ai_dir') ? document.getElementById('ai_dir').value.trim() : '';
  var allDirs = (selectedDirs[id] || []).slice();
  if (customDir) allDirs.push(customDir);
  var direction = allDirs.length > 0 ? allDirs.join('；') : '';
  var fi = getFieldInfo(id);
  // 数量：由字段级「数量」快捷 chip（selectCount）记录；无则用字段默认值 defaultCount
  var count = parseInt(selectedCount[id] || String((fi && fi.defaultCount) || 5), 10) || (fi && fi.defaultCount) || 5;
  ov.remove(); delete selectedDirs[id]; delete selectedCount[id];
  // 角色字段：把弹窗顶部选的性别映射到 STCD_INSPIRE_GEN.gender（生成时 contextFn 会读取）
  if (fi && fi.gender && typeof STCD_INSPIRE_GEN !== 'undefined') {
    STCD_INSPIRE_GEN.gender = selectedGender[id] || '女';
  }
  delete selectedGender[id];
  _runAiDirect(id, direction, count);
}

// 无面板一键直生成（页面按钮一步到位，如视频提示词/首尾帧，无需中途中再点确认）
function generateAiDirectNow(id) {
  _runAiDirect(id, '');
}

// 核心：解析异步 context → 渲染模板 → 调用 LLM（rawText 或 JSON）→ 回填
function _runAiDirect(id, direction, count) {
  var fieldInfo = getFieldInfo(id);
  if (!fieldInfo) { toast('该字段暂不支持 AI 建议'); return; }

  // 先解析异步 context，再启动任务，确保 _lastPrompt 在卡片出现时已有内容
  Promise.resolve(fieldInfo.context).then(function(ctx) {
    // 二元模板：优先用提示词模板渲染（renderPrompt），模板缺失时回退 ctx
    var rendered = null;
    if (fieldInfo.suggestPrompt && typeof renderPrompt === 'function') {
      var rawText = (typeof ctx === 'object' && ctx !== null) ? (ctx.prompt || ctx.user || '') : ctx;
      // 模板变量：contextFn 返回对象时的额外字段（已由 getFieldInfo 存入 vars）
      var extraVars = fieldInfo.vars || {};
      // 预设方向作为模板变量 {direction} 传入，插入模板主体（而非末尾追加），确保 LLM 优先处理
      if (direction) extraVars.direction = direction;
      if (count) extraVars.count = count;
      rendered = renderPrompt(fieldInfo.suggestPrompt, Object.assign({ text: rawText }, extraVars));
      if (!rendered.system && !rendered.user) rendered = null;
    }
    var promptText, systemPrompt;
    if (rendered) {
      promptText = rendered.user;
      systemPrompt = rendered.system;
    } else {
      promptText = (typeof ctx === 'object' && ctx !== null) ? (ctx.prompt || ctx.user || '') : ctx;
      systemPrompt = (typeof ctx === 'object' && ctx !== null) ? (ctx.system || '') : '';
      systemPrompt = systemPrompt || fieldInfo.system || '';
    }
    // 末尾兜底：仅当方向要求未通过模板 {direction} 插入时才追加（避免重复）
    if (direction && !(rendered && String(rendered.user || '').indexOf(direction) >= 0)) promptText += '\n\n【方向要求】' + direction;
    // 数量：字段挂了 count 快捷选项时，把选中的数量作为「数量要求」追加到提示词末尾（与方向快捷选项同样的体现方式，不在模板里用 {count} 引用式）
    if (fieldInfo.count && count) {
      var cl = fieldInfo.countLabel || '个';
      var cn = fieldInfo.countNote || '';
      promptText += '\n\n【数量要求】共 ' + count + ' ' + cl + '，以「数量」设置为准，严格按此数量生成，不要多也不要少。' + cn;
    }
    window._lastPrompt = { system: systemPrompt, prompt: promptText };

    if (fieldInfo.rawText) {
      // rawText 模式：返回纯文本而非 JSON，用于写作辅助（续写/改写/扩写/润色）及 H3 官方 schema 文本
      LLM.call({ label: 'AI 生成: ' + fieldInfo.label, prompt: promptText, system: systemPrompt, temperature: fieldInfo.temperature || 0.8 }).then(function(result) {
        if (!result) { toast('AI 返回为空'); return; }
        if (fieldInfo.fillFn) {
          fieldInfo.fillFn(result);
        }
      }).catch(function(err) {
        console.log('[AI] Gen error:', err);
        toast('AI 生成失败: ' + err.message);
      });
    } else {
      LLM.callJSON({ label: 'AI 生成: ' + fieldInfo.label, prompt: promptText, system: systemPrompt }).then(function(d) {
        if (!d) { toast('AI 返回为空，请重试'); return; }
        if (fieldInfo.fillFn) {
          fieldInfo.fillFn(d);
        } else {
          toast('生成完成（无填充函数）');
        }
      }).catch(function(err) {
        console.log('[AI] Gen error:', err);
        toast('AI 生成失败: ' + err.message);
      });
    }
  });
}

function showOptionChips(id, options) {
  var container = document.getElementById('aiopts_' + id);
  if (!container) return;
  var html = '<div style="display:flex;gap:6px;flex-wrap:wrap;padding:4px 0">';
  for (var i = 0; i < options.length; i++) html += '<span class="ai-chip" onclick="selectAiOption(\'' + id + '\',\'' + escHtml(typeof options[i] === 'string' ? options[i] : (options[i].label || options[i].value || '')) + '\')" title="点击选用">' + escHtml(typeof options[i] === 'string' ? options[i] : (options[i].label || options[i].value || '')) + '</span>';
  html += '</div>';
  container.innerHTML = html; container.style.display = 'block';
  setTimeout(function() { container.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 50);
}

function selectAiOption(id, value) {
  var el = _aiTargetId ? document.getElementById(_aiTargetId) : document.getElementById(id);
  _aiTargetId = null;
  if (!el) return;
  if (el.tagName === 'SELECT') {
    for (var i = 0; i < el.options.length; i++) { if (el.options[i].value === value) { el.selectedIndex = i; return; } }
    var opt = document.createElement('option'); opt.value = value; opt.textContent = value + ' ✨'; el.appendChild(opt); el.selectedIndex = el.options.length - 1;
  } else { el.value = value; }
  // 手动触发 input + change 事件，确保依赖任一事件的自动保存逻辑被驱动
  var evt = new Event('input', { bubbles: true });
  el.dispatchEvent(evt);
  var evt2 = new Event('change', { bubbles: true });
  el.dispatchEvent(evt2);
  var container = document.getElementById('aiopts_' + id);
  if (container) container.style.display = 'none';
}

var aiFieldRegistry = {};
var _aiTargetId = null;
// 角色生成类字段的「性别」选择（弹窗顶部，默认女）；按字段 id 记录当前选中性别
var selectedGender = {};
// 字段级「数量」快捷 chip（与性别同套路：字段注册 count:true 才显示）；按字段 id 记录当前选中数量
var selectedCount = {};
function registerAiField(id, label, contextFn, opts) {
  aiFieldRegistry[id] = {
    label: label, contextFn: contextFn,
    fillFn: opts && opts.fillFn,
    rawText: opts && opts.rawText,
    suggestPrompt: opts && opts.suggestPrompt,
    gender: opts && opts.gender,
    count: opts && opts.count,
    defaultCount: opts && opts.defaultCount,
    countLabel: opts && opts.countLabel,
    countNote: opts && opts.countNote,
  };
}
// 性别 chip 点击：记录选中并高亮
function selectGender(id, val, el) {
  selectedGender[id] = val;
  if (el && el.parentNode) {
    var chips = el.parentNode.querySelectorAll('.preset-chip');
    for (var i = 0; i < chips.length; i++) chips[i].classList.remove('preset-active');
  }
  if (el) el.classList.add('preset-active');
}
// 数量 chip 点击：记录选中并高亮
function selectCount(id, val, el) {
  selectedCount[id] = String(val);
  if (el && el.parentNode) {
    var chips = el.parentNode.querySelectorAll('.preset-chip');
    for (var i = 0; i < chips.length; i++) chips[i].classList.remove('preset-active');
  }
  if (el) el.classList.add('preset-active');
}
function getFieldInfo(id) {
  var e = aiFieldRegistry[id];
  if (!e) return null;
  try {
    var result = {
      label: e.label, fillFn: e.fillFn, rawText: e.rawText,
      suggestPrompt: e.suggestPrompt, gender: e.gender,
      count: e.count,
      defaultCount: e.defaultCount,
      countLabel: e.countLabel,
      countNote: e.countNote,
    };
    var ctx = e.contextFn();
    // 支持 Promise 形式的 contextFn
    if (ctx && typeof ctx.then === 'function') {
      result.context = ctx;
    } else if (ctx && typeof ctx === 'object' && ctx.user !== undefined) {
      result.context = ctx.user;
      result.system = ctx.system || '';
      // 保留 user/system 之外的模板变量（style/mode/bannedRule 等），供 generateAiDirectFill 透传
      result.vars = {};
      Object.keys(ctx).forEach(function(k) {
        if (k !== 'user' && k !== 'system' && ctx[k] != null) result.vars[k] = ctx[k];
      });
    } else {
      result.context = ctx || '';
      result.system = '';
    }
    return result;
  } catch(err) { console.error('[AI] contextFn error:', err); return null; }
}

window.AI_QUICK_PRESETS = AI_QUICK_PRESETS;
window.aiInput = aiInput;
window.aiTextarea = aiTextarea;
window.aiSelectField = aiSelectField;
window.openAiPanel = openAiPanel;
window.togglePreset = togglePreset;
window.singleTogglePreset = singleTogglePreset;
window.generateAiOptionsFromPanel = generateAiOptionsFromPanel;
window.selectAiOption = selectAiOption;
window.registerAiField = registerAiField;
window.getFieldInfo = getFieldInfo;
window.openAiGenPanel = openAiGenPanel;
window.generateAiDirectNow = generateAiDirectNow;
window.selectGender = selectGender;
window.selectCount = selectCount;
