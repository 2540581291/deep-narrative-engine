// 深度-叙事引擎 · 角色卡 · 伪娘完整角色模板
// 完整角色（14章），用于 LLM 第二步完整角色生成
// 字段结构以 DATA.femboy.template 为准绳

var 伪娘完整模板 = {
  // ═══ 一、身份 ═══
  identity: {
    basicInfo: { id: null, name: '角色名', title: '称号/头衔', icon: '👤', role: '自由', age: 25, race: '人族', gender: '伪娘', rarity: '蓝', price: 0 },
    background: { origin: '出身地', birthStatus: '平民', family: '家族背景', upbringing: '成长环境', education: '教育程度', skills: ['技能1', '技能2'], talents: ['天赋1'], aura: '气质印象一句话' },
    experience: { currentOccupation: '当前职业', timeline: '人生时间线', lifeOverview: '角色人生故事，不少于50字', dailyLife: '当下日常，不少于50字', sexualAwakening: '性的启蒙，不少于50字', dailySexuality: '日常性事，不少于50字', sexualDetails: ['1. 时间事件描述', '2. 时间事件描述'] },
  },
  // ═══ 二、外貌 ═══
  appearance: {
    facialFeatures: { face: '面容描写，不少于30字', forehead: '额头描述', eyes: '眼睛描写', eyelashes: '浓密纤长', eyebrows: '柳叶弯眉', nose: '鼻子描述', lips: '嘴唇描述', teeth: '牙齿描述', ears: '耳朵描述', hair: { color: '发色', length: '长度', texture: '发质', thickness: '发量', style: '发型描述', cleanliness: '干净', notes: null }, facialHair: null },
    bodyShape: { shoulders: '肩膀描述', chest: '胸部描述', waist: '腰身描述', hips: '臀部描述', figure: '苗条', height: '中等', build: '柔软', hands: '手部描写', feet: '足部描写' },
    skinHair: { skin: { color: '白皙', texture: '细腻', moisture: '正常', blemishes: null, tanLines: null, calluses: null }, bodyHair: { arms: '无', legs: '无', armpit: '无', belly: '无', back: '无' }, nails: { fingernails: '修剪整齐', toenails: '修剪整齐', cleanliness: '干净' } },
    marks: { scars: null, tattoos: null, piercings: '无' },
    voiceScent: { voice: '嗓音描述', scent: { overall: '整体气味', breath: '口气', armpits: '腋下气味', skin: '肌肤气息', hair: '发香', genitals: '私处气味', feet: '足部气味', notes: null } },
  },
  // ═══ 三、衣着 ═══
  attire: {
    clothing: { attireStyle: '朴素', top: '上衣描述', bottom: '下装描述', underwear: '内衣描述', outerwear: null, headwear: null, restraint: { chastityDevice: { has: false, desc: null }, cockRing: { has: false, desc: null }, gag: { has: false, desc: null }, nippleClamp: { has: false, desc: null }, shackles: { has: false, desc: null }, rope: { has: false, desc: null } }, stimulator: { eggVibrator: { has: false, desc: null }, dildo: { has: false, desc: null }, analPlug: { has: false, desc: null }, nippleSucker: { has: false, desc: null } } },
    legwear: { hosiery: { type: null, color: null, material: null, thighHigh: false, garter: false, openCrotch: false, chain: false, notes: null }, footwear: { type: '布鞋', material: '布', color: '黑色', condition: '崭新', heelHeight: '平底', notes: null } },
    ornaments: { accessories: { neck: null, ears: null, wrists: null, fingers: null, anklets: null, other: null } },
  },
  // ═══ 四、性特征 ═══
  sexOrgans: {
    feet: { shape: '端正', length: '普通', toes: '整齐', soles: '有薄茧', cleanliness: '干净', scent: '略带潮气', arch: '普通', legs: '修长', thighs: '匀称', calves: '纤细', notes: null },
    breasts: { size: '平坦', shape: '平坦', firmness: '平坦', cleavage: null, scent: '干净', lactation: null, notes: '男身，胸部平坦' },
    nipples: { size: '小颗', color: '粉红', shape: '圆润突起', areola: '淡粉色', areolaSize: '小巧', erectile: '遇冷凸起', sensitivity: '普通', piercing: false },
    foreskin: { status: '正常', type: null, phimosis: false, smegma: '少量', scent: '干净', hygiene: '良好', notes: null },
    glans: { size: '适中', color: '粉红', hood: '半露', scent: '干净', piercing: false, notes: null },
    penis: { length: '中等', girth: '适中', shape: '笔直', curvature: '笔直', veins: '不明显', scent: '干净', pubicHair: '无' },
    scrotum: { size: '正常', hang: '正常', color: '浅褐', hair: '稀疏', scent: '干净', notes: null },
    urethra: { opening: '正常', sensitivity: '普通', piercing: false, notes: null },
    anus: { appearance: '浅褐色干净', hair: '无', scent: '干净', cleanliness: '干净', sensitivity: '未知', preparation: '未使用过', notes: null },
    prostate: { size: '正常', condition: '正常', sensitivity: '普通', notes: null },
  },
  // ═══ 五、性能力 ═══
  sexualCapability: {
    sexualAbility: {
      erectile: { ability: '正常', speed: '正常', hardness: '正常', duration: '正常', angle: '上翘', glansState: '半露', sizeChange: '略大', morningErection: '有', spontaneousErection: '偶尔' },
      ejaculation: { type: '正常', control: '可控制', stamina: '正常', force: '喷射', method: '自然射出', nocturnalEmission: '偶尔', spermatorrhea: false, volume: '正常', viscosity: '中等', color: '乳白', storage: '充足' },
      sexualIncontinence: { semenLeak: { has: false, desc: null }, urine: { has: false, desc: null }, feces: { has: false, desc: null } },
    },
    orgasmReaction: {
      glans: { sensation: '敏感', sensitivity: '剧增', duration: '正常', consciousness: '恍惚', mentalThoughts: '内心想法', face: { flush: '轻微', eyes: '微闭', mouth: '微张', tears: { has: false, desc: null } }, moanVolume: '轻声', moanStyle: '压抑型', moanContent: '叫床内容', scream: { has: false, desc: null }, sluttyMoan: { has: false, desc: null }, body: { backArch: { has: false, desc: null }, legTremble: { has: false, desc: null }, bodySpasm: { has: false, desc: null }, muscleTension: '紧张', handAction: '描述', toes: '放松' }, organReaction: { saliva: '正常', nippleErection: { has: false, desc: null }, nippleSecretion: '无', erection: { has: false, desc: null }, preCum: { has: false, desc: null }, ejaculation: { has: false, desc: null }, scrotumContract: { has: false, desc: null }, urethraOpenClose: { has: false, desc: null }, anusOpenClose: { has: false, desc: null }, urineIncontinence: { has: false, desc: null }, fecesIncontinence: { has: false, desc: null } }, unique: { temperatureChange: '轻微' } },
      penis: { sensation: '抽插快感', sensitivity: '剧增', duration: '持久', consciousness: '恍惚', mentalThoughts: '内心想法', face: { flush: '明显', eyes: '失神', mouth: '微张', tears: { has: false, desc: null } }, moanVolume: '中等', moanStyle: '喘息型', moanContent: '叫床内容', scream: { has: false, desc: null }, sluttyMoan: { has: false, desc: null }, body: { backArch: { has: false, desc: null }, legTremble: { has: false, desc: null }, bodySpasm: { has: false, desc: null }, muscleTension: '紧张', handAction: '描述', toes: '蜷缩' }, organReaction: { saliva: '增多', nippleErection: { has: false, desc: null }, nippleSecretion: '无', erection: { has: false, desc: null }, preCum: { has: false, desc: null }, ejaculation: { has: false, desc: null }, scrotumContract: { has: false, desc: null }, urethraOpenClose: { has: false, desc: null }, anusOpenClose: { has: false, desc: null }, urineIncontinence: { has: false, desc: null }, fecesIncontinence: { has: false, desc: null } }, unique: { softSpeed: '正常', trembleIntensity: '轻微' } },
      prostate: { sensation: '酸胀快感', sensitivity: '暴增', duration: '持久', consciousness: '恍惚', mentalThoughts: '内心想法', face: { flush: '明显', eyes: '紧闭', mouth: '咬唇', tears: { has: false, desc: null } }, moanVolume: '压抑的轻声', moanStyle: '闷哼型', moanContent: '叫床内容', scream: { has: false, desc: null }, sluttyMoan: { has: false, desc: null }, body: { backArch: { has: false, desc: null }, legTremble: { has: false, desc: null }, bodySpasm: { has: false, desc: null }, muscleTension: '紧张', handAction: '描述', toes: '蜷缩' }, organReaction: { saliva: '增多', nippleErection: { has: false, desc: null }, nippleSecretion: '无', erection: { has: false, desc: null }, preCum: { has: false, desc: null }, ejaculation: { has: false, desc: null }, scrotumContract: { has: false, desc: null }, urethraOpenClose: { has: false, desc: null }, anusOpenClose: { has: false, desc: null }, urineIncontinence: { has: false, desc: null }, fecesIncontinence: { has: false, desc: null } }, unique: { urinationSensation: '轻微' } },
      nipples: { sensation: '酥麻', sensitivity: '剧增', duration: '短暂', consciousness: '清醒', mentalThoughts: '内心想法', face: { flush: '轻微', eyes: '微闭', mouth: '微张', tears: { has: false, desc: null } }, moanVolume: '轻声', moanStyle: '娇喘型', moanContent: '叫床内容', scream: { has: false, desc: null }, sluttyMoan: { has: false, desc: null }, body: { backArch: { has: false, desc: null }, legTremble: { has: false, desc: null }, bodySpasm: { has: false, desc: null }, muscleTension: '正常', handAction: '描述', toes: '放松' }, organReaction: { saliva: '正常', nippleErection: { has: false, desc: null }, nippleSecretion: '无', erection: { has: false, desc: null }, preCum: { has: false, desc: null }, ejaculation: { has: false, desc: null }, scrotumContract: { has: false, desc: null }, urethraOpenClose: { has: false, desc: null }, anusOpenClose: { has: false, desc: null }, urineIncontinence: { has: false, desc: null }, fecesIncontinence: { has: false, desc: null } }, unique: { pullingSensation: '轻微' } },
      urethra: { sensation: '灼热', sensitivity: '暴增', duration: '正常', consciousness: '恍惚', mentalThoughts: '内心想法', face: { flush: '通红', eyes: '紧闭', mouth: '咬唇', tears: { has: false, desc: null } }, moanVolume: '压抑的轻声', moanStyle: '闷哼型', moanContent: '叫床内容', scream: { has: false, desc: null }, sluttyMoan: { has: false, desc: null }, body: { backArch: { has: false, desc: null }, legTremble: { has: false, desc: null }, bodySpasm: { has: false, desc: null }, muscleTension: '紧张', handAction: '描述', toes: '蜷缩' }, organReaction: { saliva: '增多', nippleErection: { has: false, desc: null }, nippleSecretion: '无', erection: { has: false, desc: null }, preCum: { has: false, desc: null }, ejaculation: { has: false, desc: null }, scrotumContract: { has: false, desc: null }, urethraOpenClose: { has: false, desc: null }, anusOpenClose: { has: false, desc: null }, urineIncontinence: { has: false, desc: null }, fecesIncontinence: { has: false, desc: null } }, unique: { burningSensation: '轻微' } },
    },
    postOrgasmOverstimulation: {
      glans: { multiOrgasm: false, refractory: '较长', sensation: '描述', sensitivity: '极限', duration: '描述', consciousness: '失神', face: { flush: '通红', eyes: '翻白眼', mouth: '张口', tears: { has: false, desc: null } }, moanVolume: '压抑的闷哼', moanStyle: '描述', moanContent: '内容', scream: { has: false, desc: null }, sluttyMoan: { has: false, desc: null }, body: { backArch: { has: false, desc: null }, legTremble: { has: false, desc: null }, bodySpasm: { has: false, desc: null }, muscleTension: '紧张', handAction: '描述', toes: '蜷缩' }, organReaction: { saliva: '增多', nippleErection: { has: false, desc: null }, nippleSecretion: '无', erection: { has: false, desc: null }, preCum: { has: false, desc: null }, ejaculation: { has: false, desc: null }, scrotumContract: { has: false, desc: null }, urethraOpenClose: { has: false, desc: null }, anusOpenClose: { has: false, desc: null }, urineIncontinence: { has: false, desc: null }, fecesIncontinence: { has: false, desc: null } }, unique: { temperatureChange: '明显' } },
      penis: { multiOrgasm: false, refractory: '正常', sensation: '描述', sensitivity: '剧增', duration: '描述', consciousness: '恍惚', face: { flush: '明显', eyes: '失神', mouth: '微张', tears: { has: false, desc: null } }, moanVolume: '轻声', moanStyle: '描述', moanContent: '内容', scream: { has: false, desc: null }, sluttyMoan: { has: false, desc: null }, body: { backArch: { has: false, desc: null }, legTremble: { has: false, desc: null }, bodySpasm: { has: false, desc: null }, muscleTension: '松弛', handAction: '描述', toes: '放松' }, organReaction: { saliva: '正常', nippleErection: { has: false, desc: null }, nippleSecretion: '无', erection: { has: false, desc: null }, preCum: { has: false, desc: null }, ejaculation: { has: false, desc: null }, scrotumContract: { has: false, desc: null }, urethraOpenClose: { has: false, desc: null }, anusOpenClose: { has: false, desc: null }, urineIncontinence: { has: false, desc: null }, fecesIncontinence: { has: false, desc: null } }, unique: { softSpeed: '正常', trembleIntensity: '轻微' } },
      prostate: { multiOrgasm: true, refractory: '极短', sensation: '描述', sensitivity: '暴增', duration: '描述', consciousness: '恍惚', face: { flush: '明显', eyes: '紧闭', mouth: '咬唇', tears: { has: false, desc: null } }, moanVolume: '压抑的轻声', moanStyle: '描述', moanContent: '内容', scream: { has: false, desc: null }, sluttyMoan: { has: false, desc: null }, body: { backArch: { has: false, desc: null }, legTremble: { has: false, desc: null }, bodySpasm: { has: false, desc: null }, muscleTension: '僵直', handAction: '描述', toes: '蜷缩' }, organReaction: { saliva: '增多', nippleErection: { has: false, desc: null }, nippleSecretion: '无', erection: { has: false, desc: null }, preCum: { has: false, desc: null }, ejaculation: { has: false, desc: null }, scrotumContract: { has: false, desc: null }, urethraOpenClose: { has: false, desc: null }, anusOpenClose: { has: false, desc: null }, urineIncontinence: { has: false, desc: null }, fecesIncontinence: { has: false, desc: null } }, unique: { urinationSensation: '轻微' } },
      nipples: { multiOrgasm: true, refractory: '无', sensation: '描述', sensitivity: '暴增', duration: '描述', consciousness: '恍惚', face: { flush: '轻微', eyes: '失神', mouth: '微张', tears: { has: false, desc: null } }, moanVolume: '轻声', moanStyle: '描述', moanContent: '内容', scream: { has: false, desc: null }, sluttyMoan: { has: false, desc: null }, body: { backArch: { has: false, desc: null }, legTremble: { has: false, desc: null }, bodySpasm: { has: false, desc: null }, muscleTension: '松弛', handAction: '描述', toes: '放松' }, organReaction: { saliva: '正常', nippleErection: { has: false, desc: null }, nippleSecretion: '无', erection: { has: false, desc: null }, preCum: { has: false, desc: null }, ejaculation: { has: false, desc: null }, scrotumContract: { has: false, desc: null }, urethraOpenClose: { has: false, desc: null }, anusOpenClose: { has: false, desc: null }, urineIncontinence: { has: false, desc: null }, fecesIncontinence: { has: false, desc: null } }, unique: { pullingSensation: '轻微' } },
      urethra: { multiOrgasm: false, refractory: '正常', sensation: '描述', sensitivity: '极限', duration: '描述', consciousness: '恍惚', face: { flush: '通红', eyes: '紧闭', mouth: '咬唇', tears: { has: false, desc: null } }, moanVolume: '压抑的闷哼', moanStyle: '描述', moanContent: '内容', scream: { has: false, desc: null }, sluttyMoan: { has: false, desc: null }, body: { backArch: { has: false, desc: null }, legTremble: { has: false, desc: null }, bodySpasm: { has: false, desc: null }, muscleTension: '僵直', handAction: '描述', toes: '蜷缩' }, organReaction: { saliva: '增多', nippleErection: { has: false, desc: null }, nippleSecretion: '无', erection: { has: false, desc: null }, preCum: { has: false, desc: null }, ejaculation: { has: false, desc: null }, scrotumContract: { has: false, desc: null }, urethraOpenClose: { has: false, desc: null }, anusOpenClose: { has: false, desc: null }, urineIncontinence: { has: false, desc: null }, fecesIncontinence: { has: false, desc: null } }, unique: { burningSensation: '灼烧' } },
    },
  },
  // ═══ 六、性历史 ═══
  sexualHistory: {
    milestones: {
      partnerCount: "合理数字（根据角色年龄和背景）",
      female: { count: "合理数字", desc: "概况描述", firstTime: { partner: "对象", desc: "描述" }, mostShameful: { partner: "对象", desc: "描述" }, best: { partner: "对象", desc: "描述" }, worst: { partner: "对象", desc: "描述" } },
      male: { count: "合理数字", desc: "概况描述", firstTime: { partner: "对象", desc: "描述" }, mostShameful: { partner: "对象", desc: "描述" }, best: { partner: "对象", desc: "描述" }, worst: { partner: "对象", desc: "描述" } },
      femboy: { count: "合理数字", desc: "概况描述", firstTime: { partner: "对象", desc: "描述" }, mostShameful: { partner: "对象", desc: "描述" }, best: { partner: "对象", desc: "描述" }, worst: { partner: "对象", desc: "描述" } },
      futa: { count: "合理数字", desc: "概况描述", firstTime: { partner: "对象", desc: "描述" }, mostShameful: { partner: "对象", desc: "描述" }, best: { partner: "对象", desc: "描述" }, worst: { partner: "对象", desc: "描述" } },
      alien: { count: "合理数字", desc: "概况描述", firstTime: { partner: "对象", desc: "描述" }, mostShameful: { partner: "对象", desc: "描述" }, best: { partner: "对象", desc: "描述" }, worst: { partner: "对象", desc: "描述" } },
      globalMilestones: { firstTime: "首次性经历描述", mostShameful: "最羞耻经历描述", best: "最佳体验描述", worst: "最差体验描述" },
    },
    bodyStats: {
      penis: { uniquePartnerCount: { count: "合理数字", desc: null }, maxPartnerSession: { count: "合理数字", desc: null }, masturbationCount: { count: "合理数字", desc: null }, orgasmCount: { count: "合理数字", desc: null }, ejaculationCount: { count: "合理数字", desc: null }, incontinenceCount: { count: "合理数字", desc: null }, comaCount: { count: "合理数字", desc: null } },
      prostate: { uniquePartnerCount: { count: "合理数字", desc: null }, maxPartnerSession: { count: "合理数字", desc: null }, masturbationCount: { count: "合理数字", desc: null }, orgasmCount: { count: "合理数字", desc: null }, ejaculationCount: { count: "合理数字", desc: null }, incontinenceCount: { count: "合理数字", desc: null }, comaCount: { count: "合理数字", desc: null } },
      other: { nippleMasturbationCount: { count: "合理数字", desc: null }, nippleOrgasmCount: { count: "合理数字", desc: null }, nippleEjaculationCount: { count: "合理数字", desc: null }, lockEjaculationCount: { count: "合理数字", desc: null }, lockUrinationCount: { count: "合理数字", desc: null }, edgingCount: { count: "合理数字", desc: null }, urethralOrgasmCount: { count: "合理数字", desc: null }, urethralIncontinenceCount: { count: "合理数字", desc: null }, urethralEjaculationCount: { count: "合理数字", desc: null }, semenSwallowCount: { count: "合理数字", desc: null }, urineDrinkCount: { count: "合理数字", desc: null }, fecesEatCount: { count: "合理数字", desc: null } },
    },
  },
  // ═══ 七、首次记录 ═══
  firstRecords: {
    deflowered: {
      ejaculation: { status: '已破/未破（根据设定）', age: "年龄", partner: "对象", circumstance: "情境", forced: false, notes: "备注" },
      oral: { status: '已破/未破（根据设定）', age: "年龄", partner: "对象", circumstance: "情境", forced: false, notes: "备注" },
      urethral: { status: '已破/未破（根据设定）', age: "年龄", partner: "对象", circumstance: "情境", pain: "疼痛程度", bleeding: "出血情况", forced: false, notes: "备注" },
      anal: { status: '已破/未破（根据设定）', age: "年龄", partner: "对象", circumstance: "情境", pain: "疼痛程度", bleeding: "出血情况", forced: false, notes: "备注" },
      prostate: { status: '已破/未破（根据设定）', age: "年龄", partner: "对象", circumstance: "情境", sensation: "感受", ejaculated: false, forced: false, notes: "备注" },
    },
    firstOrgasm: {
      glans: { status: '已/未（根据设定）', age: "年龄", method: "方式", partner: "对象", circumstance: "情境", sensation: "感受", ejaculated: false, notes: "备注" },
      penis: { status: '已/未（根据设定）', age: "年龄", method: "方式", partner: "对象", circumstance: "情境", sensation: "感受", ejaculated: false, notes: "备注" },
      urethral: { status: '已/未（根据设定）', age: "年龄", method: "方式", partner: "对象", circumstance: "情境", sensation: "感受", ejaculated: null, notes: "备注" },
      nipples: { status: '已/未（根据设定）', age: "年龄", method: "方式", partner: "对象", circumstance: "情境", sensation: "感受", ejaculated: null, notes: "备注" },
      anal: { status: '已/未（根据设定）', age: "年龄", method: "方式", partner: "对象", circumstance: "情境", sensation: "感受", ejaculated: false, notes: "备注" },
      prostate: { status: '已/未（根据设定）', age: "年龄", method: "方式", partner: "对象", circumstance: "情境", sensation: "感受", ejaculated: false, notes: "备注" },
    },
    firstLosingControl: {
      ahegao: { status: '已/未（根据设定）', age: "年龄", partner: "对象", circumstance: "情境", duration: "持续时间", notes: "备注" },
      preCum: { status: '已/未（根据设定）', age: "年龄", partner: "对象", circumstance: "情境", volume: "量", sensation: "感受", notes: "备注" },
      urine: { status: '已/未（根据设定）', age: "年龄", partner: "对象", circumstance: "情境", volume: "量", sensation: "感受", notes: "备注" },
      feces: { status: '已/未（根据设定）', age: "年龄", partner: "对象", circumstance: "情境", consistency: "性状", sensation: "感受", notes: "备注" },
      prostateUrine: { status: '已/未（根据设定）', age: "年龄", partner: "对象", circumstance: "情境", volume: "量", sensation: "感受", notes: "备注" },
      prostateSemen: { status: '已/未（根据设定）', age: "年龄", partner: "对象", circumstance: "情境", volume: "量", sensation: "感受", notes: "备注" },
      retrogradeEjaculation: { status: '已/未（根据设定）', age: "年龄", partner: "对象", circumstance: "情境", sensation: "感受", volume: "量", notes: "备注" },
      lactation: { status: '已/未（根据设定）', age: "年龄", partner: "对象", circumstance: "情境", volume: "量", sensation: "感受", notes: "备注" },
    },
  },
  // ═══ 八、性偏好 ═══
  sexualPreferences: {
    organPreferences: {
      nipple: { method: '按摩', type: '外部刺激', pain: '完全不行', shame: '有点羞', desire: '偶尔想要', care: '有点在乎', feeling: '感受', specific: { biting: '完全不行' } },
      glans: { method: '按摩', type: '外部刺激', pain: '完全不行', shame: '有点羞', desire: '偶尔想要', care: '有点在乎', feeling: '感受', specific: { speed: '适中' } },
      penis: { method: '按摩', type: '插入式', pain: '轻微可以', shame: '不觉得羞', desire: '想要', care: '不在乎', feeling: '感受', specific: { ejaculation: '正常' } },
      prostate: { method: '按摩', type: '插入式', pain: '完全不行', shame: '很害羞', desire: '不想要', care: '非常在意', feeling: '感受', specific: { orgasmType: '湿劲' } },
      urethra: { method: '温度', type: '插入式', pain: '完全不行', shame: '非常在意', desire: '不想要', care: '非常在意', feeling: '感受', specific: { depth: '浅口即可' } },
    },
    playPreferences: {
      roleStyle: { active: '偶尔想', passive: '喜欢' },
      stylePrefs: { style: '温和缠绵' },
      preferredParts: ['喜欢的部位'],
      acceptance: { bondage: '完全不行', filth: '完全不行', humiliation: '完全不行', exposure: '完全不行', toys: '完全不行', neglect: '完全不行', incontinence: '完全不行' },
      eroticMood: { petName: ['称呼'], dirtyTalk: ['爱说的话'], roleplay: { enjoy: false, scenarios: null } },
    },
    specialPeriod: {
      sleeping: { active: '偶尔想', passive: '喜欢', acceptance: '喜欢', stage: '浅睡中', thoughts: null },
      menstruation: { active: '完全不想', passive: '完全不想', acceptance: '完全不行', stage: '经中', thoughts: null },
      pregnancy: { active: '完全不想', passive: '完全不想', acceptance: '完全不行', stage: '孕早期', thoughts: null },
      illness: { active: '完全不想', passive: '完全不想', acceptance: '完全不行', stage: '初病时', thoughts: null },
      diarrhea: { active: '完全不想', passive: '完全不想', acceptance: '完全不行', stage: '刚发作', thoughts: null },
    },
  },
  // ═══ 九、生殖健康 ═══
  reproductiveHealth: {
    testes: { condition: '正常', position: '正常下垂', leftSize: '正常', rightSize: '正常', varicocele: false, notes: null },
    bladder: { capacity: '正常', control: '正常', inflammation: false, notes: null },
    semen: { volume: '正常', viscosity: '中等', color: '乳白', spermCount: '正常', motility: '正常', morphology: '正常', notes: null },
    fertility: { status: '可育', children: 0, proven: false, notes: null },
    prostateHealth: { condition: '正常', size: '正常', palpation: '无异常', inflammation: false, hyperplasia: false, notes: null },
    contraception: { using: false, method: null, effectiveness: null, notes: null },
  },
  // ═══ 十、身体健康 ═══
  physicalHealth: {
    physique: { physical: '健康', mental: '普通' },
    diseases: { illnesses: null, chronic: null, sti: { status: '无', diseases: null, history: null, notes: null }, injuries: null, drugResistance: null, allergies: null },
    disabilities: { disability: { has: false, type: null, description: null, sinceBirth: false, affects: null, notes: null } },
    bodyModifications: { modified: false, modificationNotes: null, brainwashed: false, brainwashNotes: null, parasite: false, parasiteNotes: null, broken: false, brokenNotes: null },
  },
  // ═══ 十一、性格言行 ═══
  personality: {
    personality: {
      traits: { personality: { attitude: '待人态度', temperament: '气质', stubbornness: '中', empathy: '中', sociability: '中', ambition: '中', mentalTraits: ['性格特质'] } },
      goals: {
        shortTerm: '短期目标',
        longTerm: '长远目标',
        dreams: '梦想愿景',
      },
      likes: {
        likes: ['喜欢的事物'],
        dislikes: ['厌恶的事物'],
        phobias: ['恐惧的事物'],
      },
    },
    speech: {
      address: {
        lovemaking: {
          selfTitle: ['做爱时对自己的称呼'],
          partnerTitle: ['做爱时对爱人的称呼'],
        },
        training: {
          selfTitle: ['调教时对自己的称呼'],
          masterTitle: ['调教时对主人的称呼'],
        },
      },
      words: {
        catchphrases: ['日常口头禅'],
        curses: ['骂人/粗话'],
        sex: {
          foreplay: {
            teasing: ['...'],
            seducing: ['...'],
            afterglow: ['...'],
          },
          inAction: {
            entering: ['...'],
            beingFucked: ['...'],
            asking: ['...'],
            guiding: ['...'],
            fellatio: ['...'],
          },
          climax: {
            preClimax: ['...'],
            atClimax: ['...'],
            afterClimax: ['...'],
          },
          domSub: {
            humiliated: ['...'],
            humiliating: ['...'],
            dominated: ['...'],
            dominating: ['...'],
          },
          begging: {
            begging: ['...'],
            losingControl: ['...'],
          },
        },
      },
    },
  },
  // ═══ 十二、状态与契约 ═══
  statusContract: {
    currentState: { status: '空闲', location: '未派遣' },
    workStats: { records: { todayTasks: 0, totalTasks: 0, todayIncome: 0, totalIncome: 0, performanceCount: 0, guestSatisfaction: 0, regularCustomers: null, lastWorked: null } },
    ownership: { detail: { owner: null, group: null, cost: 0, acquired: null, acquiredDate: null, contract: { type: null, duration: null, buyoutPrice: null } } },
  },
  // ═══ 十三、属性 ═══
  attributes: {
    basic: { stamina: 50, strength: 50, agility: 50, intelligence: 50, knowledge: 50, obedience: 50 },
    beauty: { face: 50, figure: 50, genital: 50 },
    sex: { lust: 50, sensitivity: 50, skill: 50 },
    relation: { loyalty: 50, affection: 50, fear: 50 },
    corruption: { promiscuity: 10, exhibitionism: 10, masochism: 10, perversion: 10 },
  },
  // ═══ 十四、后台 ═══
  meta: {
    tags: ['标签1', '标签2'],
    flags: { metPlayer: false, hadFirstSex: false, attemptedEscape: false },
    notes: '备注信息',
    metadata: { createdAt: null, updatedAt: null, version: '1.0', author: null, sourceFile: null, characterType: '原创', characterOrigin: null, customFields: null },
  },
};
