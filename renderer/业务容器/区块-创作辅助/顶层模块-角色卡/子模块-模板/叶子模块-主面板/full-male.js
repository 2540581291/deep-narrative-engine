// 深度-叙事引擎 · 角色卡 · 男性完整角色模板
// 完整角色（14章），用于 LLM 第二步完整角色生成
// 字段结构以 DATA.male.template 为准绳

var 男性完整模板 = {
  // ═══ 一、身份 ═══
  identity: {
    basicInfo: { id: null, name: '角色名', title: '称号/头衔', icon: '👤', role: '自由', age: 25, race: '人族', gender: '男性', rarity: '蓝', price: 0 },
    background: { origin: '出身地', birthStatus: '平民', family: '家族背景', upbringing: '成长环境', education: '教育程度', skills: ['技能1', '技能2'], talents: ['天赋1'], aura: '气质印象一句话' },
    experience: { currentOccupation: '当前职业', timeline: '人生时间线', lifeOverview: '人生概述不少于50字', dailyLife: '当下日常不少于50字', sexualAwakening: '性的启蒙不少于50字', dailySexuality: '日常性事不少于50字', sexualDetails: ['1. 时间事件描述', '2. 时间事件描述'] },
  },

  // ═══ 二、外貌 ═══
  appearance: {
    facialFeatures: { face: '面容描写不少于30字', forehead: '额头描述', eyes: '眼睛描写', eyelashes: '睫毛描述', eyebrows: '眉毛描述', nose: '鼻子描述', lips: '嘴唇描述', teeth: '牙齿描述', ears: '耳朵描述', hair: { color: '发色', length: '长度', texture: '发质', thickness: '发量', style: '发型描述', cleanliness: '干净', notes: null }, facialHair: null },
    bodyShape: { shoulders: '肩膀描述', chest: '胸膛描述', waist: '腰身描述', hips: '臀部描述', figure: '匀称', height: '中等', build: '紧实', hands: '手部描写', feet: '足部描写' },
    skinHair: { skin: { color: '肤色', texture: '肤质', moisture: '正常', blemishes: null, tanLines: null, calluses: null }, bodyHair: { arms: '稀疏', legs: '稀疏', armpit: '稀疏', belly: '稀疏', back: '稀疏' }, nails: { fingernails: '描述', toenails: '描述', cleanliness: '干净' } },
    marks: { scars: null, tattoos: null, piercings: null },
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
    foreskin: { status: '正常', type: null, phimosis: false, smegma: '少量', scent: '干净', hygiene: '良好', notes: null },
    glans: { size: '适中', color: '粉红', hood: '半露', scent: '干净', piercing: false, notes: null },
    penis: { length: '中等', girth: '适中', shape: '笔直', curvature: '笔直', veins: '不明显', scent: '干净' },
    scrotum: { size: '正常', hang: '正常', color: '浅褐', hair: '稀疏', scent: '干净', notes: null },
    anus: { appearance: '浅褐色干净', hair: '无', scent: '干净', cleanliness: '干净', sensitivity: '普通', preparation: '未使用过', notes: null },
  },

  // ═══ 五、性能力 ═══
  sexualCapability: {
    sexualAbility: {
      erectile: { ability: null, speed: null, hardness: null, duration: null, angle: null, glansState: null, sizeChange: null, morningErection: null, spontaneousErection: null },
      ejaculation: { type: null, control: null, stamina: null, force: null, method: null, nocturnalEmission: null, spermatorrhea: false, volume: null, viscosity: null, color: null, storage: null },
      sexualIncontinence: { semenLeak: { has: false, desc: null }, urine: { has: false, desc: null }, feces: { has: false, desc: null } },
    },
    orgasmReaction: {
      glans: { sensation: null, sensitivity: null, duration: null, consciousness: null, mentalThoughts: null, face: { flush: null, eyes: null, mouth: null, tears: { has: false, desc: null } }, moanVolume: null, moanStyle: null, moanContent: null, scream: { has: false, desc: null }, sluttyMoan: { has: false, desc: null }, body: { backArch: { has: false, desc: null }, legTremble: { has: false, desc: null }, bodySpasm: { has: false, desc: null }, muscleTension: null, handAction: null, toes: null }, organReaction: { saliva: null, nippleErection: { has: false, desc: null }, nippleSecretion: null, erection: { has: false, desc: null }, preCum: { has: false, desc: null }, ejaculation: { has: false, desc: null }, scrotumContract: { has: false, desc: null }, urethraOpenClose: { has: false, desc: null }, anusOpenClose: { has: false, desc: null }, urineIncontinence: { has: false, desc: null }, fecesIncontinence: { has: false, desc: null } }, unique: { temperatureChange: null } },
      penis: { sensation: null, sensitivity: null, duration: null, consciousness: null, mentalThoughts: null, face: { flush: null, eyes: null, mouth: null, tears: { has: false, desc: null } }, moanVolume: null, moanStyle: null, moanContent: null, scream: { has: false, desc: null }, sluttyMoan: { has: false, desc: null }, body: { backArch: { has: false, desc: null }, legTremble: { has: false, desc: null }, bodySpasm: { has: false, desc: null }, muscleTension: null, handAction: null, toes: null }, organReaction: { saliva: null, nippleErection: { has: false, desc: null }, nippleSecretion: null, erection: { has: false, desc: null }, preCum: { has: false, desc: null }, ejaculation: { has: false, desc: null }, scrotumContract: { has: false, desc: null }, urethraOpenClose: { has: false, desc: null }, anusOpenClose: { has: false, desc: null }, urineIncontinence: { has: false, desc: null }, fecesIncontinence: { has: false, desc: null } }, unique: { softSpeed: null, trembleIntensity: null } },
    },
    postOrgasmOverstimulation: {
      glans: { multiOrgasm: false, refractory: null, sensation: null, sensitivity: null, duration: null, consciousness: null, mentalThoughts: null, face: { flush: null, eyes: null, mouth: null, tears: { has: false, desc: null } }, moanVolume: null, moanStyle: null, moanContent: null, scream: { has: false, desc: null }, sluttyMoan: { has: false, desc: null }, body: { backArch: { has: false, desc: null }, legTremble: { has: false, desc: null }, bodySpasm: { has: false, desc: null }, muscleTension: null, handAction: null, toes: null }, organReaction: { saliva: null, nippleErection: { has: false, desc: null }, nippleSecretion: null, erection: { has: false, desc: null }, preCum: { has: false, desc: null }, ejaculation: { has: false, desc: null }, scrotumContract: { has: false, desc: null }, urethraOpenClose: { has: false, desc: null }, anusOpenClose: { has: false, desc: null }, urineIncontinence: { has: false, desc: null }, fecesIncontinence: { has: false, desc: null } }, unique: { temperatureChange: null } },
      penis: { multiOrgasm: false, refractory: null, sensation: null, sensitivity: null, duration: null, consciousness: null, mentalThoughts: null, face: { flush: null, eyes: null, mouth: null, tears: { has: false, desc: null } }, moanVolume: null, moanStyle: null, moanContent: null, scream: { has: false, desc: null }, sluttyMoan: { has: false, desc: null }, body: { backArch: { has: false, desc: null }, legTremble: { has: false, desc: null }, bodySpasm: { has: false, desc: null }, muscleTension: null, handAction: null, toes: null }, organReaction: { saliva: null, nippleErection: { has: false, desc: null }, nippleSecretion: null, erection: { has: false, desc: null }, preCum: { has: false, desc: null }, ejaculation: { has: false, desc: null }, scrotumContract: { has: false, desc: null }, urethraOpenClose: { has: false, desc: null }, anusOpenClose: { has: false, desc: null }, urineIncontinence: { has: false, desc: null }, fecesIncontinence: { has: false, desc: null } }, unique: { softSpeed: null, trembleIntensity: null } },
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
      globalMilestones: {
        firstTime: "首次性经历描述",
        mostShameful: "最羞耻经历描述",
        best: "最佳体验描述",
        worst: "最差体验描述",
      },
    },
    bodyStats: { uniquePartnerCount: { count: "合理数字", desc: null }, maxPartnerSession: { count: "合理数字", desc: null }, masturbationCount: { count: "合理数字", desc: null }, orgasmCount: { count: "合理数字", desc: null }, ejaculationCount: { count: "合理数字", desc: null }, incontinenceCount: { count: "合理数字", desc: null }, comaCount: { count: "合理数字", desc: null }, other: { maxEjaculationPerDay: { count: "合理数字", desc: null }, semenSwallowCount: { count: "合理数字", desc: null }, urineDrinkCount: { count: "合理数字", desc: null }, fecesEatCount: { count: "合理数字", desc: null } } },
  },

  // ═══ 七、首次记录 ═══
  firstRecords: {
    deflowered: { ejaculation: { status: '已破/未破（根据设定）', age: "年龄", partner: "对象", circumstance: "情境", forced: false, notes: "备注" } },
    firstOrgasm: { glans: { status: '已/未（根据设定）', age: "年龄", method: "方式", partner: "对象", circumstance: "情境", sensation: "感受", ejaculated: false, notes: "备注" }, penis: { status: '已/未（根据设定）', age: "年龄", method: "方式", partner: "对象", circumstance: "情境", sensation: "感受", ejaculated: false, notes: "备注" } },
    firstLosingControl: { ahegao: { status: '已/未（根据设定）', age: "年龄", partner: "对象", circumstance: "情境", duration: "持续时间", notes: "备注" }, preCum: { status: '已/未（根据设定）', age: "年龄", partner: "对象", circumstance: "情境", volume: "量", sensation: "感受", notes: "备注" } },
  },

  // ═══ 八、性偏好 ═══
  sexualPreferences: {
    organPreferences: { glans: { method: null, type: null, pain: null, shame: null, desire: null, care: null, feeling: null, specific: { speed: null } }, penis: { method: null, type: null, pain: null, shame: null, desire: null, care: null, feeling: null, specific: { ejaculation: null } } },
    playPreferences: { initiative: { active: null, passive: null }, style: null, targetParts: [], acceptance: { bondage: null, filth: null, humiliation: null, exposure: null, toys: null, neglect: null, incontinence: null }, atmosphere: { petName: [], dirtyTalk: [], roleplay: { enjoy: false, scenarios: null } } },
    specialPeriod: { sleeping: { active: null, passive: null, acceptance: null, stage: null, thoughts: null }, menstruation: { active: null, passive: null, acceptance: null, stage: null, thoughts: null }, pregnancy: { active: null, passive: null, acceptance: null, stage: null, thoughts: null }, illness: { active: null, passive: null, acceptance: null, stage: null, thoughts: null }, diarrhea: { active: null, passive: null, acceptance: null, stage: null, thoughts: null } },
  },

  // ═══ 九、生殖健康 ═══
  reproductiveHealth: {
    testes: { condition: '正常', position: '正常下垂', leftSize: '正常', rightSize: '正常', varicocele: false, notes: null },
    semen: { volume: '正常', viscosity: '中等', color: '乳白', spermCount: '正常', motility: '正常', morphology: '正常', notes: null },
    fertility: { status: '可育', children: 0, proven: false, notes: null },
    prostateHealth: { condition: '正常', size: '正常', palpation: '无异常', inflammation: false, hyperplasia: false, notes: null },
    contraception: { using: false, method: null, effectiveness: null, notes: null },
  },

  // ═══ 十、身体健康 ═══
  physicalHealth: { physique: { physical: '健康', mental: '正常' }, diseases: { illnesses: null, chronic: null, sti: { status: '无', diseases: null, history: null, notes: null }, injuries: null, drugResistance: null, allergies: null }, disabilities: { disability: { has: false, type: null, description: null, sinceBirth: false, affects: null, notes: null } }, bodyModifications: { modified: false, modificationNotes: null, brainwashed: false, brainwashNotes: null, parasite: false, parasiteNotes: null, broken: false, brokenNotes: null } },

  // ═══ 十一、性格言行 ═══
  personality: {
    personality: {
      traits: {
        personality: { attitude: '待人态度', temperament: '气质', stubbornness: '固执程度', empathy: '同理心', sociability: '社交能力', ambition: '野心抱负', mentalTraits: ['性格特质'] },
      },
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
  statusContract: { currentState: { status: '空闲', location: '未派遣' }, workStats: { consumption: { visitCount: 0, totalSpent: 0, lastVisit: null, satisfaction: null, isRegular: false } }, ownership: { detail: { owner: null, group: null, cost: 0, acquired: null, acquiredDate: null, contract: { type: null, duration: null, buyoutPrice: null } } } },

  // ═══ 十三、属性 ═══
  attributes: { basic: { stamina: 50, strength: 50, agility: 50, intelligence: 50, knowledge: 50, obedience: 50 }, beauty: { face: 50, figure: 50, genital: 50 }, sex: { lust: 50, sensitivity: 50, skill: 50 }, relation: { loyalty: 50, affection: 50, fear: 50 }, corruption: { promiscuity: 10, exhibitionism: 10, masochism: 10, perversion: 10 } },

  // ═══ 十四、后台 ═══
  meta: { tags: ['标签1', '标签2'], flags: { metPlayer: false, hadFirstSex: false, attemptedEscape: false }, notes: '备注信息', metadata: { createdAt: null, updatedAt: null, version: '1.0', author: null, sourceFile: null, characterType: '原创', characterOrigin: null, customFields: null } },
};
