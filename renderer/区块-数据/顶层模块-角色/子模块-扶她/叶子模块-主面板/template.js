// 扶她角色 · 标准模板
// 扶她为双性结构：女性身体（胸部、小穴、子宫等）+ 阴茎 + 阴囊
//
// ━━━ 属性值基准标尺 ━━━
//   0 = 完全缺失  50 = 普通人水平  100 = 种族极限
//
// ━━━ 格式规范 ━━━
// 1. 每个字段单独一行 { } 和 [ ] 必须展开多行
// 2. 空值用 null，字符串用单引号，缩进 2 空格
// 3. 注释统一用尾部 //，注释内禁止破折号和表情符号
// 4. bool 类：{ has: false, desc: null }
//    计数类：{ count: 0, desc: null }
//    事件类：{ partner: null, desc: null }
// 5. 方括号 [ ] 只标层级，圆括号（ ）只补充信息
// 6. 三级容器布局：区块有容器 / 节有容器 / 子模块有容器
//
// ━━━ 字段层级命名规范 ━━━
//   区块（章）     ═══     一、~ 十四、
//   顶层模块（节）  ━━━     N-1（如 5-1）
//   子模块（分组）  ────    N-1-1（如 5-1-1）
//   叶子模块（字段） 无标记   具体字段值
//
// ━━━ 定价公式 ━━━
// 身价 = int(10000 乘 年龄 乘 容貌 乘 种族 乘 健康 乘 身材 乘 性格) 加 技能数乘 500
//   年龄：6-9乘5.0 / 10-14乘3.0 / 15-18乘2.0 / 19-25乘1.0 / 26-35乘0.6 / 36及以上乘0.3
//   容貌(face)：40及以下乘0.5 / 41-55乘1.0 / 56-70乘1.5 / 71-80乘2.5 / 81-90乘4.0 / 91-100乘6.0
//   种族：人族乘1.0 / 异族乘2.0
//   健康：健康/强壮乘1.0 / 亚健康乘0.85 / 体弱乘0.6 / 残疾重病乘0.3
//   身材：匀称苗条纤细柔软乘1.0 / 丰腴丰满健壮乘0.9 / 骨瘦如柴干瘦乘0.7 / 肥胖臃肿松垮乘0.5
//   性格：顺从温和忠诚乘1.1 / 普通乘1.0 / 叛逆倔强阴郁乘0.85 / 危险暴力施虐乘0.7
//   技能每项加 500
//   日维护费 = price 除以 100    赎身价 = price 乘 2
//   白10万及以下 / 绿10到20万 / 蓝20到50万 / 紫50到100万 / 金100万以上
//   价格范围：残疾约158元 到 极品精灵扶她约180万元
//
// ━━━ 类型规范 ━━━
// 布尔用 true/false，数字用 Number，对象保持结构，数组用 Array
DATA.futa = DATA.futa || {};
DATA.futa.template = {

  // ════════════════════════════════════════════════
  //  一、身份
  // ════════════════════════════════════════════════
  identity: {                            // 身份[区块]

    // ━━━ 1-1 基本信息 ━━━
    basicInfo: {                       // 基本信息[顶层模块]

      id:       'shuang_hua_qi_fang',   // 唯一ID（英文小写+下划线）
      name:     '霜华',                  // 显示名称
      title:    '魅魔与精灵的混血战士',  // 头衔/称号
      icon:     '⚤',                     // 头像图标
      role:     '自由',                  // 自由/已受邀/员工/奴隶/宠物/囚犯/罪奴/牲畜/工具/废料

      age:      23,                      // 等效人类年龄（整数，不要加岁）
      race:     '半精灵',                // 人族/精灵/兽人/魔族/天使/龙裔/异种
      gender:   '扶她',                  // 女性/男性/伪娘/扶她
      rarity:   '白',                    // 白/绿/蓝/紫/金
      price:    44500,                   // 身价/挂牌价（定价公式见文件头部），单位元，Number 类型

    },

    // ━━━ 1-2 出身背景 ━━━
    background: {                       // 出身背景[顶层模块]

      origin:            '北方冰原的边境要塞',              // 出身地
      birthStatus:       '平民',                           // 奴隶/平民/商贾/贵族/王族/异族
      family:            '母亲是魅魔，父亲是精灵游侠。自幼被遗弃在边境要塞附近，被一个老兵收养',  // 家族背景：父母/兄弟姐妹/家族地位/现状
      upbringing:        '在要塞的兵营里长大，从小和士兵们一起训练、吃饭、睡觉，学会了喝酒打架',  // 成长环境
      education:         '老兵教的读写和算数，其他全靠自学',    // 教育程度
      skills:            [                                  // 技能
        '剑术',
        '追踪',
        '野外生存',
        '魅惑',
      ],
      talents:           [                                  // 天赋
        '夜视',
        '治愈体质',
        '魔抗高',
      ],
      aura:              '凛冽如霜雪，眉宇间带着战士的锋芒，却又有魅魔天生的妖冶',  // 整体气质印象

    },

    // ━━━ 1-3 经历 ━━━
    experience: {                       // 经历[顶层模块]

      currentOccupation: '自由佣兵',                    // 当前职业
      timeline:          '0-10岁被老兵收养在要塞长大，10-16岁在军营打杂学武，16-20岁当佣兵，20岁因双性身份暴露被迫离开',  // 时间线：几岁到几岁在做什么
      lifeOverview:     '霜华不知道自己确切的出生。母亲是魅魔，父亲是精灵游侠——她被遗弃在边境要塞门口，被一个退役老兵捡回去养大。兵营里长大的孩子没有童年。她十岁帮厨擦靴子跑腿，十二岁偷学剑术被抓住，老兵求了情之后干脆教她正经剑法。十六岁养父病逝，她正式当上佣兵。她用绷带缠紧胸部，压低嗓音说话，没人发现她是女人——直到二十岁那次重伤，不仅暴露了女儿身，还多了一根东西。队长强奸了她，不止一次。她在雪夜里用匕首捅穿了他的肚子，连夜逃离。',  // 人生概述：不少于50字
      dailyLife:        '如今她独来独往，只接边境清剿类的脏活——杀强盗、剿山贼、清理魔兽。报酬要现银，不赊账，不讲价。她不在任何一个城镇久留，做完活拿了钱就走，睡最便宜的客栈，喝最烈的酒。偶尔有同行的佣兵想跟她搭伙，她一律拒绝。她习惯了一个人——一个人守夜、一个人吃饭、一个人包扎伤口。夜里有时会梦到要塞的雪地，醒来后就坐着等天亮，不再睡了。',  // 当下日常：不少于50字
      sexualAwakening:  '二十岁那年重伤暴露了双性身份，队长的眼神从震惊变成了一种她从未见过的欲望。那一夜她被按在医疗帐篷的地上，队长骑在她身上的时候说"你他妈到底算是男的还是女的"，她回答不了，因为她自己也不知道。那之后几个月她成了队里的公共用品。她的身体对这些侵犯产生了令她作呕的反应——阴茎会勃起、会射精，后穴被进入时甚至会让她达到高潮。她恨的不是那些男人，恨的是自己居然会有感觉。',  // 性的启蒙：不少于50字
      dailySexuality:   '逃亡后她对性只有厌恶和恐惧，几乎完全禁欲。但魅魔的血统让她的身体有强烈的欲望周期——每隔一个月左右，她会整个人像被火烧一样焦躁，下体湿得一塌糊涂，阴茎硬得发疼。这种时候她会找个没人的山洞，自己用手指解决前面和后面，完事后蜷缩着哭一场。她试过去妓院找男女发泄，但被陌生人触碰让她想起要塞里的那些夜晚，胃里翻涌着恶心。所以她还是一个人解决，做完就忘，假装什么都没发生过。',  // 日常性事：不少于50字
      sexualDetails: [   // 性爱明细：按时间先后编号列出性相关事件（1. 2. 3. ...顺延，不限于4条）；每条详细描述，内容要充足，不能一句话带过
        '1. 12岁：在要塞兵营偷学剑术被老兵抓住，他罚她裸着上半身站在雪地里思过。夜里他摸黑进她帐篷，说她既然被发现是女人，就该"还债"。她没敢声张，从此学会把绷带缠得更紧。',
        '2. 16岁：养父病逝后她正式当佣兵。一次剿匪受伤，队里军医给她换药时发现她下体多了一根东西，当晚她被绑在行军床上。军医说这是老天爷给的"宝贝"，她挣扎无果，只记得那夜帐篷外有人压着嗓子笑。',
        '3. 20岁：重伤暴露了双性身份，队长把她按在医疗帐篷地上，说"你他妈到底是男是女"。那之后几个月她成了队里的公共用品——前面后面都被用过，身体却对侵犯起了可耻的反应，她恨的不是那些男人，恨自己居然会有感觉。',
        '4. 21岁：她在雪夜里用匕首捅穿队长的肚子，连夜逃离要塞。逃亡后几乎禁欲，只在魅魔欲望周期发作时一个人躲进山洞用手解决，完事后蜷缩着哭一场。她试过去妓院，但被陌生人触碰让她想起要塞的夜晚，恶心地逃了出来。',
      ],

    },


  },
  // ════════════════════════════════════════════════
  //  二、外貌
  // ════════════════════════════════════════════════
  appearance: {                            // 外貌[区块]

    // ━━━ 2-1 面容 ━━━
    facialFeatures: {                       // 面容[顶层模块]

      face:       '鹅蛋脸，颧骨微高，眉目锐利如刀，嘴角常带一丝似笑非笑的弧度',  // 面容描写
      forehead:   '光洁饱满，额角微突',          // 额头：宽窄/高低/皱纹
      eyes:       '紫色眸子里闪着暗金色的光——魅魔血统的印记',  // 眼睛描写
      eyelashes:  '浓密纤长',                           // 睫毛
      eyebrows:   '剑眉斜飞入鬓',           // 眉毛
      nose:       '鼻梁直挺，略带鹰钩',        // 鼻子：高矮/鼻型/鼻翼
      lips:       '薄唇紧抿，嘴角常带血迹干裂',  // 嘴唇：厚薄/唇形/唇色/干裂
      teeth:      '整齐，犬齿略尖',            // 牙齿：整齐/发黄/缺损/龅牙
      ears:       '耳廓尖——精灵血统的痕迹',    // 耳朵：大小/形状/贴面/招风

      hair: {                           // 头发
        color:  '银白色带淡紫挑染',                // 发色
        length: '及腰',                                 // 长度：板寸/齐耳/齐肩/及胸/及腰/及臀/及地
        texture:      '粗硬',                       // 发质：干枯/粗硬/普通/柔顺/丝滑
        thickness:    '浓密',                           // 发量：稀疏/普通/浓密/厚重
        style:        '高高束成马尾，几缕散落的碎发垂在脸侧',   // 发型描述
        cleanliness:  '干净',                       // 清洁度：油腻肮脏/略有油光/还算干净/清爽/刚洗过
        notes:        '银发是精灵血统的印记，紫挑染是自己染的',     // 其他备注
      },

      facialHair: null,     // 胡须描述（可选值：山羊胡/络腮胡/无须/短须/胡茬/长须）

    },

    // ━━━ 2-2 体态 ━━━
    bodyShape: {                       // 体态[顶层模块]

      shoulders: '宽肩平直，有战士的骨架',        // 肩膀：宽窄/平溜/厚薄
      chest:     '胸廓宽阔，肋骨线条分明',        // 胸部骨架：宽厚/纤薄/肋骨形态
      waist:     '劲窄有力，腹肌线条分明',        // 腰身：粗细/腰线/腰臀比
      hips:      '窄臀，肌肉结实',                // 臀部/胯部：宽窄/骨盆形状

      figure: '匀称',       // 整体体型：骨瘦如柴/纤细/苗条/匀称/丰腴/丰满/肥胖/健壮
      height: '高挑',       // 身高：矮小/偏矮/中等/偏高/高挑/高大
      build:  '紧实',       // 体质结实度：干瘦/纤细/柔软/紧实/健硕/臃肿/松垮

      hands: '十指修长有力，指节粗大，掌心和指根有老茧',  // 手部描写
      feet:  '宽大有力，脚掌有厚茧',                  // 足部描写

    },

    // ━━━ 2-3 肤发 ━━━
    skinHair: {                       // 肤发[顶层模块]

      skin: {                           // 皮肤
        color:      '白皙带淡紫底色',       // 苍白/白皙/偏黄/小麦/蜜色/古铜/黝黑/灰败
        texture:    '光滑',       // 粗糙/偏粗/普通/细腻/光滑
        moisture:   '正常',       // 龟裂/偏干/普通/滋润/油性
        blemishes:  '左肋下一小块紫色胎记',             // 瑕疵/胎记
        tanLines:   '护腕和护颈下方的浅色印记',     // 晒痕
        calluses:   '掌心有老茧，指节有握剑的硬茧',     // 老茧分布
      },

      bodyHair: {        // 非性器官部位体毛
        arms:   '稀疏',  // 稀疏/茂密/无/剃净
        legs:   '稀疏',    // 腿部体毛
        armpit: '稀疏',    // 腋下体毛
        belly:  '无',       // 腹部体毛
        back:   '无',       // 背部体毛
      },

      nails: {                         // 指甲
        fingernails: '修剪短齐，不涂蔻丹',  // 手指甲
        toenails:    '修剪整洁，不涂色',    // 脚趾甲
        cleanliness: '干净',                // 清洁度
      },

    },

    // ━━━ 2-4 印记 ━━━
    marks: {                       // 印记[顶层模块]

      scars:      '左肩一道利刃留下的旧伤疤，后背有几处抓痕',  // 疤痕/纹身/胎记
      tattoos:    '后颈有一个拇指大的紫色魅魔印记',     // ! 只能用 null 或字符串，不支持数组
      piercings:  '左耳三个银环，右耳一个',             // 穿刺描述

    },

    // ━━━ 2-5 声息 ━━━
    voiceScent: {                       // 声息[顶层模块]

      voice:      '声音低沉略带沙哑，像冰面下的流水',  // 嗓音描写

      scent: {                           // 体味结构：overall/breath/armpits/skin/hair/genitals/feet/notes
        overall:    '松木和冰雪的清冽气息混着淡淡的体香',          // 体骚/狐臭/陈年汗臭/精臊/药味/酒馊
        breath:     '干净清凉',         // 烟臭/酒馊/蒜臭/精液味/胃酸腐臭/粪臭
        armpits:    '运动后的淡汗味，不臭',            // 汗骚/狐臭/酸馊/腋毛积臭
        skin:       '干净，带着皮革护甲的味道',             // 汗垢/油脂/精液/药味/粪渣/老泥垢
        hair:       '松脂味的洗发水',    // 油馊/头垢/汗臭/精味/屎味/桂香
        genitals:   '干净，淡淡皂香混着一点雌性的甜腥',         // 淫水骚/精液腥/白带酸腐/尿骚/脓臭/屎味
        feet:       '皮靴穿了一天，有点潮气但不臭',         // 汗臭/酸馊/烂泥/茧皮臭
        notes:      '每天用雪水擦身，保持得很干净',         // 清洁习惯/体味变化/对方反应
      },

    },


  },
  // ════════════════════════════════════════════════
  //  三、衣着
  // ════════════════════════════════════════════════
  attire: {                            // 衣着[区块]

    // ━━━ 3-1 衣着 ━━━
    clothing: {                       // 衣着[顶层模块]

      attireStyle: '干练',   // 清纯/朴素/风尘/富贵/华美/异域/破旧/不整/干练
      top:         '深紫色的紧身皮甲，露出锁骨和肩膀',    // 上装
      bottom:      '同色皮裤，大腿外侧绑着匕首套',     // 下装
      underwear:   '黑色棉布裹胸和三角裤',          // 内衣
      outerwear:   '灰色的狼皮披肩',     // 外衣/外套
      headwear:    null,     // 头饰/帽子

      // ──── 限制式穿戴 ────

      restraint: {                       // 限制式穿戴[子模块]
        chastityDevice: {                // 贞操锁
          has:  false,                   // 是否佩戴
          desc: null,                    // 负笼/平板笼/带刺笼/尿道贯穿式
        },
        cockRing: {                      // 锁精环
          has:  false,
          desc: null,
        },
        gag: {                           // 口球
          has:  false,
          desc: null,
        },
        nippleClamp: {                   // 乳头夹
          has:  false,
          desc: null,
        },
        shackles: {                      // 镣铐
          has:  false,
          desc: null,
        },
        rope: {                          // 绳束
          has:  false,
          desc: null,
        },
      },

      // ──── 刺激式穿戴 ────

      stimulator: {                      // 刺激式穿戴[子模块]
        eggVibrator: {                   // 跳蛋
          has:  false,
          desc: null,                    // 注明穿戴方式
        },
        dildo: {                         // 阳具
          has:  false,
          desc: null,                    // 注明穿戴方式（自用）
        },
        analPlug: {                      // 肛塞
          has:  false,
          desc: null,
        },
        nippleSucker: {                  // 吸乳器
          has:  false,
          desc: null,
        },
      },

    },

    // ━━━ 3-2 鞋袜 ━━━
    legwear: {                       // 鞋袜[顶层模块]

      hosiery: {                          // 鞋袜结构：type/color/material 等
        type:         '长袜',     // 短袜/长袜/丝袜/吊带袜/过膝袜/腿套/网袜/绑带/链袜/系带
        color:        '黑色',     // 袜子颜色
        material:     '棉',       // 棉/尼龙/蕾丝/网眼/皮革/金属链
        thighHigh:    false,      // 是否过膝
        garter:       false,      // 是否吊带
        openCrotch:   false,      // 是否开裆
        chain:        false,      // 是否链式系带
        notes:        '普通的黑棉袜',
      },

      footwear: {                       // 鞋子
        type:         '皮靴',    // 赤脚/草鞋/布鞋/绣鞋/木屐/皮靴/高跟鞋
        material:     '鞣制牛皮',  // 材质
        color:        '黑色',    // 鞋子颜色
        condition:    '半旧',    // 状况
        heelHeight:   '平底',    // 平底/低跟/中跟/高跟/超高跟
        notes:        '及踝短靴，靴筒上系着小铃铛',
      },

    },

    // ━━━ 3-3 饰品 ━━━
    ornaments: {                       // 饰品[顶层模块]

      accessories: {                        // 饰品
        neck:     '银项链坠着紫色水晶',   // 颈部饰品
        ears:     '四个银环',     // 耳部饰品
        wrists:   '皮革护腕',     // 手腕饰品
        fingers:  '银戒指（战利品）',   // 手指饰品
        anklets:  '皮靴上的铃铛',     // 脚链/脚镯
        other:    '腰间的匕首和钱袋',   // 其他饰品
      },


    },

  },

  // ════════════════════════════════════════════════
  //  四、性特征
  // ════════════════════════════════════════════════
  sexOrgans: {                            // 性特征[区块]

    // 扶她为双性结构：女体和男性全部器官

    // ━━━ 4-1 足部 ━━━

    feet: {                              // 足部[顶层模块]
      shape:        '端正',     // 脚型
      length:       '偏大',     // 大小
      toes:         '整齐',// 脚趾
      soles:        '脚掌有薄茧',// 脚掌
      cleanliness:  '干净',     // 清洁度
      scent:        '略带潮气',     // 汗酸/泥味/茧皮臭/干净
      arch:         '正常',     // 足弓
      legs:         '修长结实',// 腿型
      thighs:       '结实有力',// 大腿
      calves:       '线条流畅',// 小腿
      notes:        '常年行军作战的脚',// 备注
    },

    // ━━━ 4-2 胸部 ━━━

    breasts: {                        // 胸部[顶层模块]
      size:     '一手可握',   // 大小
      shape:    '水滴形',     // 形状
      firmness: '挺拔',       // 坚挺度
      cleavage: '中等深度',// 乳沟
      hang:     '无垂感',  // 垂感
      scent:    '淡淡的体香和皮革味',    // 汗味/乳香/皂味/骚/奶酸
      lactation: false,       // 是否泌乳
      notes:    '经常用裹胸束着，形状保持得很好',          // 胸部备注
    },

    // ━━━ 4-3 乳头 ━━━

    nipples: {                      // 乳头[顶层模块]
      size:       '适中',        // 乳头大小
      color:      '淡紫',        // 乳头颜色，魅魔血统
      shape:      '圆润突起',    // 乳头形状
      areola:     '淡紫色晕',      // 乳晕描述
      areolaSize: '适中',              // 乳晕大小
      erectile:   '容易凸起',    // 勃起状态
      sensitivity: '高',       // 敏感度
      piercing:   false,    // 是否穿刺
    },

    // ━━━ 4-4 龟头 ━━━

    glans: {                          // 龟头[顶层模块]
      size:       '适中',             // 龟头大小
      color:      '淡紫',             // 颜色
      hood:       '完全外露',         // 包皮覆盖状态
      scent:      '干净',             // 气味
      piercing:   false,              // 是否穿刺
      notes:      '颜色受魅魔血统影响呈淡紫色',  // 龟头备注
    },

    // ━━━ 4-5 阴茎 ━━━

    penis: {                          // 阴茎体[顶层模块]
      length:     '中等',             // 长度
      girth:      '适中',             // 粗细
      shape:      '笔直，龟头棱角分明',         // 整体形状
      curvature:  '笔直',             // 弯曲度
      veins:      '略明显',           // 血管
      scent:      '干净，皂香',       // 精液腥/尿骚/汗味/干净
      pubicHair:  '修剪整齐',         // 阴毛
    },

    // ━━━ 4-6 阴囊 ━━━

    scrotum: {                        // 阴囊[顶层模块]
      size:       '正常',             // 偏小/正常/偏大
      hang:       '适中',             // 紧贴/适中/松弛
      color:      '浅褐',             // 颜色
      hair:       '稀疏',             // 阴囊毛：无/稀疏/中等/茂密/剃净
      scent:      '干净',             // 气味
      notes:      null,               // 备注（无）
    },

    // ━━━ 4-7 尿道 ━━━

    urethra: {                        // 尿道[顶层模块]
      opening:    '细小',             // 尿道口：细小/正常/偏大/松弛
      sensitivity: '普通',            // 敏感度
      piercing:   false,              // 是否穿刺
      notes:      null,               // 备注（无）
    },

    // ━━━ 4-8 前列腺 ━━━

    prostate: {                       // 前列腺（生理特征）[顶层模块]
      size:       '正常',             // 偏小/正常/偏大
      condition:  '正常',             // 正常/炎症/增生
      sensitivity: '较高',            // 敏感度
      notes:      null,               // 备注（无）
    },

    // ━━━ 4-9 包皮 ━━━

    foreskin: {                       // 包皮[顶层模块]
      status:    '已割',              // 已割/包皮过长/包茎/正常
      type:      null,                // 包皮类型（无）
      phimosis:  false,               // 是否包茎
      smegma:    '无',                // 包皮垢：无/少量/中等/大量/有异味
      scent:     '干净',              // 气味
      hygiene:   '良好',              // 包皮卫生
      notes:     null,                // 包皮备注（无）
    },

    // ━━━ 4-10 小穴 ━━━

    pussy: {                          // 小穴[顶层模块]
      condition:  '正常',          // 功能状态
      pubicHair:  '修剪整齐',// 阴毛
      scent:      '皂香混着淫水淡淡的甜腥',    // 淫水骚/精液腥/尿骚/白带酸腐/干净
      appearance: '外阴饱满，大阴唇微微分开',      // 外观
      color:      '淡褐',                // 颜色
      notes:      null,                  // 小穴备注（无）

      clitoris: {                     // 阴蒂
        glans:      '花生大小',         // 阴蒂头大小
        hood:       '包皮覆盖',     // 包皮状态
        sensitivity: '敏感',         // 敏感度
        piercing:   false,           // 是否穿刺
      },

      labia: {                        // 阴唇
        majora:   '饱满',            // 大阴唇
        minora:   '适中',            // 小阴唇
        symmetry: '对称',            // 对称性
        color:    '淡褐',            // 颜色
        piercing: false,             // 是否穿刺
      },

      vagina: {                       // 阴道
        tightness:  '紧',            // 紧致度
        wetness:    '正常',          // 湿润度
        depth:      '较深',          // 深度
        hymen:      '已破',          // 处女膜
        cervix:     '正常',          // 宫颈
        gspot:      '明显',          // G点
        taste:      '甜腥',          // 味道
        sensation:  '良好',          // 内部敏感度
        pubicBone:  '正常',          // 耻骨
        notes:      '有经验',        // 备注
      },
    },

    // ━━━ 4-11 肛门 ━━━

    anus: {                           // 肛门[顶层模块]
      appearance:   '浅褐色，紧致，干净',  // 外观
      hair:         '稀疏——经常清理',                // 肛毛
      scent:        '干净',        // 屎味/腥/屁味/干净/肛渍骚
      cleanliness:  '干净',          // 清洁度
      sensitivity:  '普通',          // 敏感度
      preparation:  '偶尔使用',      // 扩张状态
      notes:      null,               // 肛门备注（无）
    },


  },
  // ════════════════════════════════════════════════
  //  五、性能力
  // ════════════════════════════════════════════════
  sexualCapability: {                            // 性能力[区块]

    // ━━━ 5-1 基本性能力 ━━━

    sexualAbility: {                     // 性能力[顶层模块]

      // ──── 勃起功能（来自伪娘）────
      erectile: {                        // 勃起功能[子模块]
        ability:                '正常',  // 勃起能力：正常/需要刺激/药物辅助/无法勃起
        speed:                  '正常',  // 勃起速度：缓慢/正常/快速/一碰就硬
        hardness:               '硬',    // 硬度：软/半硬/硬/很硬/异常坚硬
        duration:               '正常',  // 持续时间：短暂/正常/持久/异常持续
        angle:                  '上翘',  // 角度：贴腹/水平/上翘/下垂
        glansState:             '半露',  // 龟头状态：勃起后包皮露出程度，包茎/半露/全露/翻开
        sizeChange:             '略大于平时', // 尺寸变化：与软态相比的变化
        morningErection:        '有',    // 晨勃：无/偶尔/经常/每天
        spontaneousErection:    '偶尔',  // 自发勃起：无/偶尔/容易/经常
      },

      // ──── 射精能力（来自伪娘）────
      ejaculation: {                     // 射精能力[子模块]
        // 射精方面
        type:               '正常',      // 射精类型：正常/早泄/延迟射精/不射精/逆行射精
        control:            '可控制',    // 高潮时控制射精能力：无法控制/勉强可忍/可控制/完全控制
        stamina:            '正常',      // 性持久力：很差/稍差/正常/持久/很强
        force:              '喷射',      // 喷射力度：流出/溢出/喷射/强力喷射
        method:             '自然射出',  // 射精方式：自然射出/挤压射出/刺激射出/无
        nocturnalEmission:  '偶尔',      // 遗精频率：无/偶尔/经常/频繁
        spermatorrhea:      false,       // 滑精（病态）：极轻微刺激即射精，谨慎设为true

        // 精液性状
        volume:     '正常',              // 射精量：无/很少/偏少/正常/多/非常多
        viscosity:  '偏稀',              // 粘稠度：稀薄如水/偏稀/正常/较稠/浓稠
        color:      '乳白',              // 颜色：乳白/淡黄/黄绿/带血/透明
        storage:    '充足',              // 精液储存量：充足/偏少/枯竭
      },

      // ──── 性唤起（来自女性）────
      arousal: {                         // 性唤起[子模块]
        nippleErection:        '挺立',   // 乳头勃起
        breastEnlargement:     '胀大',   // 乳房胀大
        clitoralErection:      '明显',   // 阴蒂勃起
        glansExposure:         '半露',   // 阴蒂头露出
        sizeChange:            '略肿',   // 阴蒂肿胀
        labiaSwelling:         '轻微肿胀', // 阴唇肿胀
        vaginalMoisture:       '湿润',   // 阴道湿润
        vaginalContract:       '轻微',   // 阴道节律性收缩
        speed:                 '正常',   // 唤起速度
        spontaneousArousal:    '偶尔',   // 自发性唤起
        morningWetness:        '偶尔',   // 晨湿
        dailyDischarge:        '少量',   // 日常分泌物
      },

      // ──── 高潮能力（来自女性）────
      orgasmic: {                        // 高潮能力[子模块]
        // 高潮方面
        speed:    '正常',                // 高潮速度
        control:  '可控制',              // 高潮控制力
        // 体液方面（淫水）
        fluidVolume:     '正常',          // 淫水分泌量
        storage:         '充足',          // 淫水储存量
        fluidViscosity:  '偏稀',          // 淫水粘稠度
        fluidColor:      '透明',          // 淫水颜色
        fluidTaste:      '微咸',          // 淫水味道
        // 体液方面（潮吹）
        squirt:          '有',            // 潮吹
        squirtVolume:    '正常',          // 潮吹量
        squirtStorage:   '充足',          // 潮吹储存量
        squirtViscosity: '偏稀',          // 潮吹粘稠度
        squirtColor:     '透明',          // 潮吹颜色
        squirtTaste:     '微咸',          // 潮吹味道
      },

      // ──── 性行为中的失禁（合并）────
      sexualIncontinence: {              // 性行为中的失禁[子模块]
        semenLeak: {
          has: false,
          desc: null,
        },  // 流精（来自伪娘）
        vaginalAir: {
          has: false,
          desc: null,
        },  // 阴吹（来自女性）
        flatulence: {
          has: false,
          desc: null,
        },  // 放屁（来自女性）
        urine: {
          has: false,
          desc: null,
        },  // 尿液失禁（公共）
        feces: {
          has: false,
          desc: null,
        },  // 粪便失禁（公共）
      },
    },

    // ━━━ 5-2 高潮反应（9器官乘6维度）━━━

    orgasmReaction: {                 // 高潮反应[顶层模块]

      // 9器官：glans 、 penis 、 prostate 、 nipples(女版) 、 clitoris 、 vagina 、 anus(女版) 、 urethra(女版) 、 uterus
      // 6维度：内部感觉 / 面部 / 声音 / 身体 / 器官反应(15字段合并) / 器官特有

      // ──── 龟头（来自伪娘）[子模块] ────
      glans: {
        sensation:        '极度敏感——碰触即痉挛',
        sensitivity:      '暴增',
        duration:         '正常',
        consciousness:    '恍惚',
        mentalThoughts:   '脑海中一片空白，只剩下快感',
        face: {
          flush: '明显',
          eyes: '失神',
          mouth: '微张',
          tears: {
            has: false,
            desc: null,
          },
        },
        moanVolume: '压抑的轻声',
        moanStyle: '娇喘型',
        moanContent: '嗯……啊……不要……',
        scream: {
          has: false,
          desc: null,
        },
        sluttyMoan: {
          has: false,
          desc: null,
        },
        body: {
          backArch: {
            has: false,
            desc: null,
          },
          legTremble: {
            has: false,
            desc: null,
          },
          bodySpasm: {
            has: false,
            desc: null,
          },
          muscleTension: '紧张',
          handAction: '抓紧床单',
          toes: '蜷缩',
        },
        organReaction: {
          saliva: '增多',
          nippleErection: {
            has: false,
            desc: null,
          },
          nippleSecretion: '无',
          clitoralErection: {
            has: false,
            desc: null,
          },
          erection: {
            has: false,
            desc: null,
          },
          yinShui: {
            has: false,
            desc: null,
          },
          preCum: {
            has: false,
            desc: null,
          },
          ejaculation: {
            has: false,
            desc: null,
          },
          squirt: {
            has: false,
            desc: null,
          },
          scrotumContract: {
            has: false,
            desc: null,
          },
          vaginalContract: {
            has: false,
            desc: null,
          },
          urethraOpenClose: {
            has: false,
            desc: null,
          },
          anusOpenClose: {
            has: false,
            desc: null,
          },
          urineIncontinence: {
            has: false,
            desc: null,
          },
          fecesIncontinence: {
            has: false,
            desc: null,
          },
        },
        unique: {
          temperatureChange: '明显',
        },
      },

      // ──── 阴茎（来自伪娘）[子模块] ────
      penis: {
        sensation:        '胀满——喷射时的快感最强',
        sensitivity:      '剧增',
        duration:         '正常',
        consciousness:    '恍惚',
        mentalThoughts:   '爽……还要更多……',
        face: {
          flush: '通红',
          eyes: '紧闭',
          mouth: '咬唇',
          tears: {
            has: false,
            desc: null,
          },
        },
        moanVolume: '粗喘',
        moanStyle: '闷哼型',
        moanContent: '操……射了……',
        scream: {
          has: false,
          desc: null,
        },
        sluttyMoan: {
          has: false,
          desc: null,
        },
        body: {
          backArch: {
            has:  false,
            desc: null,
          },
          legTremble: {
            has: false,
            desc: null,
          },
          bodySpasm: {
            has: true,
            desc: '射精时痉挛',
          },
          muscleTension: '紧张',
          handAction: '抓紧床单',
          toes: '蜷缩',
        },
        organReaction: {
          saliva: '正常',
          nippleErection: {
            has: false,
            desc: null,
          },
          nippleSecretion: '无',
          clitoralErection: {
            has: false,
            desc: null,
          },
          erection: {
            has: true,
            desc: '射精中持续勃起',
          },
          yinShui: {
            has: false,
            desc: null,
          },
          preCum: {
            has: false,
            desc: null,
          },
          ejaculation: {
            has: true,
            desc: '射精',
          },
          squirt: {
            has: false,
            desc: null,
          },
          scrotumContract: {
            has:  false,
            desc: null,
          },
          vaginalContract: {
            has: false,
            desc: null,
          },
          urethraOpenClose: {
            has:  false,
            desc: null,
          },
          anusOpenClose: {
            has: false,
            desc: null,
          },
          urineIncontinence: {
            has: false,
            desc: null,
          },
          fecesIncontinence: {
            has: false,
            desc: null,
          },
        },
        unique: {
          softSpeed: '正常',
          trembleIntensity: '剧烈',
        },
      },

      // ──── 前列腺（来自伪娘）[子模块] ────
      prostate: {
        sensation:        '压迫感——前列腺高潮不同于阴茎高潮',
        sensitivity:      '剧增',
        duration:         '持久',
        consciousness:    '恍惚',
        mentalThoughts:   '从身体深处涌上来的快感……',
        face: {
          flush: '明显',
          eyes: '失神',
          mouth: '微张',
          tears: {
            has: false,
            desc: null,
          },
        },
        moanVolume: '压抑的轻声',
        moanStyle: '闷哼型',
        moanContent: '嗯……那里……不要……',
        scream: {
          has: false,
          desc: null,
        },
        sluttyMoan: {
          has: false,
          desc: null,
        },
        body: {
          backArch: {
            has: true,
            desc: '腰弓起',
          },
          legTremble: {
            has:  false,
            desc: null,
          },
          bodySpasm: {
            has: false,
            desc: null,
          },
          muscleTension: '紧张',
          handAction: '抓住床单',
          toes: '蜷缩',
        },
        organReaction: {
          saliva: '增多',
          nippleErection: {
            has: false,
            desc: null,
          },
          nippleSecretion: '无',
          clitoralErection: {
            has: false,
            desc: null,
          },
          erection: {
            has: true,
            desc: '前列腺高潮维持勃起',
          },
          yinShui: {
            has: false,
            desc: null,
          },
          preCum: {
            has:  false,
            desc: null,
          },
          ejaculation: {
            has: true,
            desc: '可被强制触发',
          },
          squirt: {
            has: false,
            desc: null,
          },
          scrotumContract: {
            has:  false,
            desc: null,
          },
          vaginalContract: {
            has: false,
            desc: null,
          },
          urethraOpenClose: {
            has:  false,
            desc: null,
          },
          anusOpenClose: {
            has:  false,
            desc: null,
          },
          urineIncontinence: {
            has: false,
            desc: null,
          },
          fecesIncontinence: {
            has: false,
            desc: null,
          },
        },
        unique: {
          urinationSensation: '明显',
        },
      },

      // ──── 乳头（女性版）[子模块] ────
      nipples: {
        sensation:        '酥麻',
        sensitivity:      '剧增',
        duration:         '短暂',
        consciousness:    '清醒',
        mentalThoughts:   '有点奇怪的感觉……',
        face: {
          flush: '轻微',
          eyes: '微闭',
          mouth: '微张',
          tears: {
            has: false,
            desc: null,
          },
        },
        moanVolume: '轻声',
        moanStyle: '娇喘型',
        moanContent: '啊……',
        scream: {
          has: false,
          desc: null,
        },
        sluttyMoan: {
          has: false,
          desc: null,
        },
        body: {
          backArch: {
            has: false,
            desc: null,
          },
          legTremble: {
            has: false,
            desc: null,
          },
          bodySpasm: {
            has: false,
            desc: null,
          },
          muscleTension: '紧张',
          handAction: '无',
          toes: '放松',
        },
        organReaction: {
          saliva: '正常',
          nippleErection: {
            has: true,
            desc: '挺立',
          },
          nippleSecretion: '无',
          clitoralErection: {
            has: true,
            desc: '轻微反应',
          },
          erection: {
            has: false,
            desc: null,
          },
          yinShui: {
            has: false,
            desc: null,
          },
          preCum: {
            has: false,
            desc: null,
          },
          ejaculation: {
            has: false,
            desc: null,
          },
          squirt: {
            has: false,
            desc: null,
          },
          scrotumContract: {
            has: false,
            desc: null,
          },
          vaginalContract: {
            has: false,
            desc: null,
          },
          urethraOpenClose: {
            has: false,
            desc: null,
          },
          anusOpenClose: {
            has: false,
            desc: null,
          },
          urineIncontinence: {
            has: false,
            desc: null,
          },
          fecesIncontinence: {
            has: false,
            desc: null,
          },
        },
        unique: {
          pullingSensation: '轻微',
        },
      },

      // ──── 阴蒂（女性）[子模块] ────
      clitoris: {
        sensation:        '极度敏感——碰触即痉挛',
        sensitivity:      '暴增',
        duration:         '正常',
        consciousness:    '恍惚',
        mentalThoughts:   '脑海中一片空白，只剩下快感',
        face: {
          flush: '明显',
          eyes: '失神',
          mouth: '微张',
          tears: {
            has: false,
            desc: null,
          },
        },
        moanVolume: '压抑的轻声',
        moanStyle: '娇喘型',
        moanContent: '嗯……啊……不要……',
        scream: {
          has: false,
          desc: null,
        },
        sluttyMoan: {
          has: false,
          desc: null,
        },
        body: {
          backArch: {
            has:  false,
            desc: null,
          },
          legTremble: {
            has:  false,
            desc: null,
          },
          bodySpasm: {
            has: false,
            desc: null,
          },
          muscleTension: '紧张',
          handAction: '抓紧床单',
          toes: '蜷缩',
        },
        organReaction: {
          saliva: '增多',
          nippleErection: {
            has: false,
            desc: null,
          },
          nippleSecretion: '无',
          clitoralErection: {
            has: true,
            desc: '阴蒂勃起挺立',
          },
          erection: {
            has: false,
            desc: null,
          },
          yinShui: {
            has: false,
            desc: null,
          },
          preCum: {
            has: false,
            desc: null,
          },
          ejaculation: {
            has: false,
            desc: null,
          },
          squirt: {
            has: false,
            desc: null,
          },
          scrotumContract: {
            has: false,
            desc: null,
          },
          vaginalContract: {
            has: false,
            desc: null,
          },
          urethraOpenClose: {
            has: false,
            desc: null,
          },
          anusOpenClose: {
            has: false,
            desc: null,
          },
          urineIncontinence: {
            has: false,
            desc: null,
          },
          fecesIncontinence: {
            has: false,
            desc: null,
          },
        },
        unique: {
          clitoralTrembling: '轻微',
        },
      },

      // ──── 阴道（女性）[子模块] ────
      vagina: {
        sensation:        '胀满——填满感最强',
        sensitivity:      '剧增',
        duration:         '持久',
        consciousness:    '恍惚',
        mentalThoughts:   '好深……被填满了……',
        face: {
          flush: '明显',
          eyes: '失神',
          mouth: '张口',
          tears: {
            has: false,
            desc: null,
          },
        },
        moanVolume: '中等',
        moanStyle: '娇喘型',
        moanContent: '啊……好深……',
        scream: {
          has: false,
          desc: null,
        },
        sluttyMoan: {
          has: true,
          desc: '忍不住浪叫',
        },
        body: {
          backArch: {
            has: true,
            desc: '腰弓起',
          },
          legTremble: {
            has:  false,
            desc: null,
          },
          bodySpasm: {
            has: false,
            desc: null,
          },
          muscleTension: '紧张',
          handAction: '抱住对方',
          toes: '蜷缩',
        },
        organReaction: {
          saliva: '增多',
          nippleErection: {
            has: false,
            desc: null,
          },
          nippleSecretion: '无',
          clitoralErection: {
            has: false,
            desc: null,
          },
          erection: {
            has: false,
            desc: null,
          },
          yinShui: {
            has: false,
            desc: null,
          },
          preCum: {
            has: false,
            desc: null,
          },
          ejaculation: {
            has: false,
            desc: null,
          },
          squirt: {
            has: false,
            desc: null,
          },
          scrotumContract: {
            has: false,
            desc: null,
          },
          vaginalContract: {
            has: false,
            desc: null,
          },
          urethraOpenClose: {
            has:  false,
            desc: null,
          },
          anusOpenClose: {
            has: false,
            desc: null,
          },
          urineIncontinence: {
            has: false,
            desc: null,
          },
          fecesIncontinence: {
            has: false,
            desc: null,
          },
        },
        unique: {
          grippingSensation: '轻微',
        },
      },

      // ──── 肛门（女性版）[子模块] ────
      anus: {
        sensation:        '饱胀——异物感强烈',
        sensitivity:      '剧增',
        duration:         '持久',
        consciousness:    '恍惚',
        mentalThoughts:   '好奇怪……那里不行……',
        face: {
          flush: '明显',
          eyes: '紧闭',
          mouth: '咬唇',
          tears: {
            has: false,
            desc: null,
          },
        },
        moanVolume: '压抑的轻声',
        moanStyle: '闷哼型',
        moanContent: '嗯……那里……不要……',
        scream: {
          has: false,
          desc: null,
        },
        sluttyMoan: {
          has: false,
          desc: null,
        },
        body: {
          backArch: {
            has: true,
            desc: '腰弓起',
          },
          legTremble: {
            has:  false,
            desc: null,
          },
          bodySpasm: {
            has: false,
            desc: null,
          },
          muscleTension: '紧张',
          handAction: '抓住床单',
          toes: '蜷缩',
        },
        organReaction: {
          saliva: '增多',
          nippleErection: {
            has: false,
            desc: null,
          },
          nippleSecretion: '无',
          clitoralErection: {
            has: false,
            desc: null,
          },
          erection: {
            has: false,
            desc: null,
          },
          yinShui: {
            has: false,
            desc: null,
          },
          preCum: {
            has: false,
            desc: null,
          },
          ejaculation: {
            has: false,
            desc: null,
          },
          squirt: {
            has: false,
            desc: null,
          },
          scrotumContract: {
            has: false,
            desc: null,
          },
          vaginalContract: {
            has: false,
            desc: null,
          },
          urethraOpenClose: {
            has:  false,
            desc: null,
          },
          anusOpenClose: {
            has:  false,
            desc: null,
          },
          urineIncontinence: {
            has: false,
            desc: null,
          },
          fecesIncontinence: {
            has: false,
            desc: null,
          },
        },
        unique: {
          defecationUrge: '轻微',
        },
      },

      // ──── 尿道（女性版）[子模块] ────
      urethra: {
        sensation:        '灼热——排尿感强烈',
        sensitivity:      '暴增',
        duration:         '正常',
        consciousness:    '恍惚',
        mentalThoughts:   '想尿……但是好舒服……',
        face: {
          flush: '通红',
          eyes: '紧闭',
          mouth: '咬唇',
          tears: {
            has: false,
            desc: null,
          },
        },
        moanVolume: '压抑的轻声',
        moanStyle: '闷哼型',
        moanContent: '嗯……尿意……',
        scream: {
          has: false,
          desc: null,
        },
        sluttyMoan: {
          has: false,
          desc: null,
        },
        body: {
          backArch: {
            has:  false,
            desc: null,
          },
          legTremble: {
            has:  false,
            desc: null,
          },
          bodySpasm: {
            has: false,
            desc: null,
          },
          muscleTension: '紧张',
          handAction: '抓紧床单',
          toes: '蜷缩',
        },
        organReaction: {
          saliva: '增多',
          nippleErection: {
            has: false,
            desc: null,
          },
          nippleSecretion: '无',
          clitoralErection: {
            has: false,
            desc: null,
          },
          erection: {
            has: false,
            desc: null,
          },
          yinShui: {
            has: false,
            desc: null,
          },
          preCum: {
            has: false,
            desc: null,
          },
          ejaculation: {
            has: false,
            desc: null,
          },
          squirt: {
            has: false,
            desc: null,
          },
          scrotumContract: {
            has: false,
            desc: null,
          },
          vaginalContract: {
            has: false,
            desc: null,
          },
          urethraOpenClose: {
            has: true,
            desc: '尿道口不住张合',
          },
          anusOpenClose: {
            has: false,
            desc: null,
          },
          urineIncontinence: {
            has: true,
            desc: '濒临失禁',
          },
          fecesIncontinence: {
            has: false,
            desc: null,
          },
        },
        unique: {
          burningSensation: '灼烧',
        },
      },

      // ──── 子宫（女性）[子模块] ────
      uterus: {
        sensation:        '酸胀——子宫被撞击的酸麻感',
        sensitivity:      '暴增',
        duration:         '持久',
        consciousness:    '恍惚',
        mentalThoughts:   '顶到最里面了……要坏掉了……',
        face: {
          flush: '全身泛红',
          eyes: '翻白眼',
          mouth: '张口',
          tears: {
            has: true,
            desc: '被顶到流泪',
          },
        },
        moanVolume: '大声',
        moanStyle: '浪叫型',
        moanContent: '顶到了……子宫……',
        scream: {
          has: true,
          desc: '子宫高潮时尖叫',
        },
        sluttyMoan: {
          has: true,
          desc: '不受控制地浪叫',
        },
        body: {
          backArch: {
            has: true,
            desc: '腰弓成桥',
          },
          legTremble: {
            has: true,
            desc: '剧烈颤抖',
          },
          bodySpasm: {
            has: true,
            desc: '子宫高潮引发全身痉挛',
          },
          muscleTension: '僵直',
          handAction: '抱紧对方',
          toes: '痉挛蜷缩',
        },
        organReaction: {
          saliva: '大量分泌',
          nippleErection: {
            has: false,
            desc: null,
          },
          nippleSecretion: '无',
          clitoralErection: {
            has: false,
            desc: null,
          },
          erection: {
            has: false,
            desc: null,
          },
          yinShui: {
            has: false,
            desc: null,
          },
          preCum: {
            has: false,
            desc: null,
          },
          ejaculation: {
            has: false,
            desc: null,
          },
          squirt: {
            has: false,
            desc: null,
          },
          scrotumContract: {
            has: false,
            desc: null,
          },
          vaginalContract: {
            has: false,
            desc: null,
          },
          urethraOpenClose: {
            has:  false,
            desc: null,
          },
          anusOpenClose: {
            has: false,
            desc: null,
          },
          urineIncontinence: {
            has:  false,
            desc: null,
          },
          fecesIncontinence: {
            has: false,
            desc: null,
          },
        },
        unique: {
          cervixImpactPain: '轻微',
        },
      },
    },

    // ━━━ 5-3 高潮后刺激（9器官乘6维度）━━━

    postOrgasmOverstimulation: {      // 高潮后刺激[顶层模块]

      // 9器官：龟头、阴茎、前列腺、乳头、阴蒂、阴道、尿道、子宫、肛门

      // ──── 龟头（来自伪娘）[子模块] ────
      glans: {
        multiOrgasm: false,
        refractory: '较长',
        sensation: '刺痛又麻',
        sensitivity: '极限',
        duration: '几下就受不了',
        consciousness: '恍惚',
        mentalThoughts: '不要了……',
        face: {
          flush: '通红',
          eyes: '紧闭',
          mouth: '张口',
          tears: {
            has: true,
            desc: '被刺激到哭',
          },
        },
        moanVolume: '尖叫',
        moanStyle: '话多型',
        moanContent: '不要了……真的不要了……',
        scream: {
          has:  false,
          desc: null,
        },
        sluttyMoan: {
          has: false,
          desc: null,
        },
        body: {
          backArch: {
            has: true,
            desc: '弓腰想逃',
          },
          legTremble: {
            has: true,
            desc: '剧烈颤抖',
          },
          bodySpasm: {
            has: true,
            desc: '阵发性痉挛',
          },
          muscleTension: '僵直',
          handAction: '拼命推拒',
          toes: '痉挛蜷缩',
        },
        organReaction: {
          saliva: '大量分泌',
          nippleErection: {
            has:  false,
            desc: null,
          },
          nippleSecretion: '无',
          clitoralErection: {
            has: false,
            desc: null,
          },
          erection: {
            has: false,
            desc: '射精后已软',
          },
          yinShui: {
            has: false,
            desc: null,
          },
          preCum: {
            has: false,
            desc: null,
          },
          ejaculation: {
            has: false,
            desc: '已射空',
          },
          squirt: {
            has: false,
            desc: null,
          },
          scrotumContract: {
            has:  false,
            desc: null,
          },
          vaginalContract: {
            has: false,
            desc: null,
          },
          urethraOpenClose: {
            has:  false,
            desc: null,
          },
          anusOpenClose: {
            has: false,
            desc: null,
          },
          urineIncontinence: {
            has: true,
            desc: '被刺激到失禁',
          },
          fecesIncontinence: {
            has: false,
            desc: null,
          },
        },
        unique: {
          temperatureChange: '滚烫',
        },
      },

      // ──── 阴茎（来自伪娘）[子模块] ────
      penis: {
        multiOrgasm: false,
        refractory: '正常',
        sensation: '胀痛感多于快感',
        sensitivity: '暴增',
        duration: '再撸几下就疼得受不了',
        consciousness: '恍惚',
        mentalThoughts: '够了……',
        face: {
          flush: '通红',
          eyes: '翻白眼',
          mouth: '张口',
          tears: {
            has:  false,
            desc: null,
          },
        },
        moanVolume: '粗喘',
        moanStyle: '闷哼型',
        moanContent: '嗯……够了……',
        scream: {
          has: false,
          desc: null,
        },
        sluttyMoan: {
          has: false,
          desc: null,
        },
        body: {
          backArch: {
            has:  false,
            desc: null,
          },
          legTremble: {
            has:  false,
            desc: null,
          },
          bodySpasm: {
            has: false,
            desc: null,
          },
          muscleTension: '僵直',
          handAction: '抓紧床单',
          toes: '蜷缩',
        },
        organReaction: {
          saliva: '增多',
          nippleErection: {
            has:  false,
            desc: null,
          },
          nippleSecretion: '无',
          clitoralErection: {
            has: false,
            desc: null,
          },
          erection: {
            has: false,
            desc: '已软',
          },
          yinShui: {
            has: false,
            desc: null,
          },
          preCum: {
            has: false,
            desc: null,
          },
          ejaculation: {
            has: false,
            desc: null,
          },
          squirt: {
            has: false,
            desc: null,
          },
          scrotumContract: {
            has:  false,
            desc: null,
          },
          vaginalContract: {
            has: false,
            desc: null,
          },
          urethraOpenClose: {
            has:  false,
            desc: null,
          },
          anusOpenClose: {
            has: false,
            desc: null,
          },
          urineIncontinence: {
            has: false,
            desc: null,
          },
          fecesIncontinence: {
            has: false,
            desc: null,
          },
        },
        unique: {
          softSpeed: '缓慢',
          trembleIntensity: '剧烈',
        },
      },

      // ──── 前列腺（来自伪娘）[子模块] ────
      prostate: {
        multiOrgasm: true,
        refractory: '极短',
        sensation: '持续高潮叠加',
        sensitivity: '极限',
        duration: '可以连续高潮好几次',
        consciousness: '失神',
        mentalThoughts: '不行了……要坏掉了……',
        face: {
          flush: '全身泛红',
          eyes: '失神',
          mouth: '咬唇',
          tears: {
            has: true,
            desc: '泪水不受控制',
          },
        },
        moanVolume: '压抑的轻声',
        moanStyle: '闷哼型',
        moanContent: '嗯……又来了……',
        scream: {
          has: false,
          desc: null,
        },
        sluttyMoan: {
          has: true,
          desc: '不受控制地浪叫',
        },
        body: {
          backArch: {
            has: true,
            desc: '腰弓成桥',
          },
          legTremble: {
            has: true,
            desc: '抖得厉害',
          },
          bodySpasm: {
            has:  false,
            desc: null,
          },
          muscleTension: '紧张',
          handAction: '抱紧对方',
          toes: '蜷缩',
        },
        organReaction: {
          saliva: '增多',
          nippleErection: {
            has:  false,
            desc: null,
          },
          nippleSecretion: '无',
          clitoralErection: {
            has: false,
            desc: null,
          },
          erection: {
            has: true,
            desc: '维持勃起',
          },
          yinShui: {
            has: false,
            desc: null,
          },
          preCum: {
            has:  false,
            desc: null,
          },
          ejaculation: {
            has: true,
            desc: '可被强制触发',
          },
          squirt: {
            has: false,
            desc: null,
          },
          scrotumContract: {
            has:  false,
            desc: null,
          },
          vaginalContract: {
            has: false,
            desc: null,
          },
          urethraOpenClose: {
            has:  false,
            desc: null,
          },
          anusOpenClose: {
            has:  false,
            desc: null,
          },
          urineIncontinence: {
            has:  false,
            desc: null,
          },
          fecesIncontinence: {
            has: false,
            desc: null,
          },
        },
        unique: {
          urinationSensation: '强烈',
        },
      },

      // ──── 乳头（女性版）[子模块] ────
      nipples: {
        multiOrgasm: true,
        refractory: '无',
        sensation: '酥麻到全身发软',
        sensitivity: '暴增',
        duration: '可以持续刺激很长时间',
        consciousness: '恍惚',
        mentalThoughts: '好奇怪……停不下来了……',
        face: {
          flush: '轻微',
          eyes: '失神',
          mouth: '微张',
          tears: {
            has: false,
            desc: null,
          },
        },
        moanVolume: '轻声',
        moanStyle: '娇喘型',
        moanContent: '啊……好奇怪……',
        scream: {
          has: false,
          desc: null,
        },
        sluttyMoan: {
          has: false,
          desc: null,
        },
        body: {
          backArch: {
            has: false,
            desc: null,
          },
          legTremble: {
            has: true,
            desc: '微微发抖',
          },
          bodySpasm: {
            has: false,
            desc: null,
          },
          muscleTension: '松弛',
          handAction: '无',
          toes: '放松',
        },
        organReaction: {
          saliva: '正常',
          nippleErection: {
            has: true,
            desc: '极度硬挺',
          },
          nippleSecretion: '无',
          clitoralErection: {
            has: true,
            desc: '阴蒂反应',
          },
          erection: {
            has: false,
            desc: null,
          },
          yinShui: {
            has: false,
            desc: null,
          },
          preCum: {
            has: false,
            desc: null,
          },
          ejaculation: {
            has: false,
            desc: null,
          },
          squirt: {
            has: false,
            desc: null,
          },
          scrotumContract: {
            has: false,
            desc: null,
          },
          vaginalContract: {
            has: false,
            desc: null,
          },
          urethraOpenClose: {
            has: false,
            desc: null,
          },
          anusOpenClose: {
            has: false,
            desc: null,
          },
          urineIncontinence: {
            has: false,
            desc: null,
          },
          fecesIncontinence: {
            has: false,
            desc: null,
          },
        },
        unique: {
          pullingSensation: '轻微',
        },
      },

      // ──── 阴蒂（女性）[子模块] ────
      clitoris: {
        multiOrgasm: false,
        refractory: '较长',
        sensation: '极度敏感——碰触即痉挛，再碰就要疯了',
        sensitivity: '极限',
        duration: '碰一下就受不了',
        consciousness: '失神',
        mentalThoughts: '不要碰那里……',
        face: {
          flush: '通红',
          eyes: '翻白眼',
          mouth: '张口',
          tears: {
            has: true,
            desc: '被刺激到哭',
          },
        },
        moanVolume: '尖叫',
        moanStyle: '话多型',
        moanContent: '不要了……真的不要了……',
        scream: {
          has:  false,
          desc: null,
        },
        sluttyMoan: {
          has: true,
          desc: '不受控制地浪叫',
        },
        body: {
          backArch: {
            has: true,
            desc: '弓腰想逃',
          },
          legTremble: {
            has: true,
            desc: '剧烈颤抖',
          },
          bodySpasm: {
            has: true,
            desc: '阵发性痉挛',
          },
          muscleTension: '僵直',
          handAction: '拼命推拒',
          toes: '痉挛蜷缩',
        },
        organReaction: {
          saliva: '大量分泌',
          nippleErection: {
            has:  false,
            desc: null,
          },
          nippleSecretion: '无',
          clitoralErection: {
            has: true,
            desc: '剧烈抽动',
          },
          erection: {
            has: false,
            desc: null,
          },
          yinShui: {
            has: false,
            desc: null,
          },
          preCum: {
            has: false,
            desc: null,
          },
          ejaculation: {
            has: false,
            desc: null,
          },
          squirt: {
            has: false,
            desc: null,
          },
          scrotumContract: {
            has: false,
            desc: null,
          },
          vaginalContract: {
            has:  false,
            desc: null,
          },
          urethraOpenClose: {
            has:  false,
            desc: null,
          },
          anusOpenClose: {
            has: false,
            desc: null,
          },
          urineIncontinence: {
            has: true,
            desc: '濒临失禁',
          },
          fecesIncontinence: {
            has: false,
            desc: null,
          },
        },
        unique: {
          clitoralTrembling: '剧烈',
        },
      },

      // ──── 阴道（女性）[子模块] ────
      vagina: {
        multiOrgasm: true,
        refractory: '极短',
        sensation: '内壁被反复摩擦的酸胀感',
        sensitivity: '暴增',
        duration: '可以连续承受',
        consciousness: '恍惚',
        mentalThoughts: '又被填满了……',
        face: {
          flush: '明显',
          eyes: '失神',
          mouth: '张口',
          tears: {
            has: false,
            desc: null,
          },
        },
        moanVolume: '大声',
        moanStyle: '浪叫型',
        moanContent: '啊……还来……不行了……',
        scream: {
          has: true,
          desc: '高潮时尖叫',
        },
        sluttyMoan: {
          has: true,
          desc: '忍不住浪叫',
        },
        body: {
          backArch: {
            has: true,
            desc: '腰弓成桥',
          },
          legTremble: {
            has: true,
            desc: '抖得厉害',
          },
          bodySpasm: {
            has:  false,
            desc: null,
          },
          muscleTension: '紧张',
          handAction: '抱紧对方',
          toes: '蜷缩',
        },
        organReaction: {
          saliva: '增多',
          nippleErection: {
            has: false,
            desc: null,
          },
          nippleSecretion: '无',
          clitoralErection: {
            has: false,
            desc: null,
          },
          erection: {
            has: false,
            desc: null,
          },
          yinShui: {
            has: true,
            desc: '淫水泛滥',
          },
          preCum: {
            has: false,
            desc: null,
          },
          ejaculation: {
            has: false,
            desc: null,
          },
          squirt: {
            has: true,
            desc: '可被反复触发',
          },
          scrotumContract: {
            has: false,
            desc: null,
          },
          vaginalContract: {
            has: true,
            desc: '节律性收缩加剧',
          },
          urethraOpenClose: {
            has:  false,
            desc: null,
          },
          anusOpenClose: {
            has: false,
            desc: null,
          },
          urineIncontinence: {
            has:  false,
            desc: null,
          },
          fecesIncontinence: {
            has: false,
            desc: null,
          },
        },
        unique: {
          grippingSensation: '剧烈',
        },
      },

      // ──── 肛门（女性版）[子模块] ────
      anus: {
        multiOrgasm: false,
        refractory: '正常',
        sensation: '被撑开摩擦的异物感',
        sensitivity: '剧增',
        duration: '持续刺激会越来越难受',
        consciousness: '恍惚',
        mentalThoughts: '那里……不要了……',
        face: {
          flush: '明显',
          eyes: '紧闭',
          mouth: '咬唇',
          tears: {
            has: true,
            desc: '被刺激到流泪',
          },
        },
        moanVolume: '压抑的轻声',
        moanStyle: '闷哼型',
        moanContent: '嗯……那里……不行……',
        scream: {
          has: false,
          desc: null,
        },
        sluttyMoan: {
          has: false,
          desc: null,
        },
        body: {
          backArch: {
            has: true,
            desc: '弓腰想逃',
          },
          legTremble: {
            has: true,
            desc: '剧烈',
          },
          bodySpasm: {
            has: false,
            desc: null,
          },
          muscleTension: '僵直',
          handAction: '抓住床单',
          toes: '蜷缩',
        },
        organReaction: {
          saliva: '增多',
          nippleErection: {
            has: false,
            desc: null,
          },
          nippleSecretion: '无',
          clitoralErection: {
            has: false,
            desc: null,
          },
          erection: {
            has: false,
            desc: null,
          },
          yinShui: {
            has: false,
            desc: null,
          },
          preCum: {
            has: false,
            desc: null,
          },
          ejaculation: {
            has: false,
            desc: null,
          },
          squirt: {
            has: false,
            desc: null,
          },
          scrotumContract: {
            has: false,
            desc: null,
          },
          vaginalContract: {
            has: false,
            desc: null,
          },
          urethraOpenClose: {
            has:  false,
            desc: null,
          },
          anusOpenClose: {
            has: true,
            desc: '不住张合',
          },
          urineIncontinence: {
            has:  false,
            desc: null,
          },
          fecesIncontinence: {
            has: false,
            desc: null,
          },
        },
        unique: {
          defecationUrge: '强烈',
        },
      },

      // ──── 尿道（女性版）[子模块] ────
      urethra: {
        multiOrgasm: false,
        refractory: '正常',
        sensation: '尿道内灼烧般的刺激感',
        sensitivity: '极限',
        duration: '持续刺激会越来越敏感',
        consciousness: '恍惚',
        mentalThoughts: '尿意……好难受又好舒服……',
        face: {
          flush: '通红',
          eyes: '紧闭',
          mouth: '咬唇',
          tears: {
            has: false,
            desc: null,
          },
        },
        moanVolume: '压抑的闷哼',
        moanStyle: '闷哼型',
        moanContent: '嗯……别……别弄了……',
        scream: {
          has: false,
          desc: null,
        },
        sluttyMoan: {
          has: false,
          desc: null,
        },
        body: {
          backArch: {
            has:  false,
            desc: null,
          },
          legTremble: {
            has:  false,
            desc: null,
          },
          bodySpasm: {
            has: false,
            desc: null,
          },
          muscleTension: '僵直',
          handAction: '拼命推拒',
          toes: '痉挛蜷缩',
        },
        organReaction: {
          saliva: '增多',
          nippleErection: {
            has: false,
            desc: null,
          },
          nippleSecretion: '无',
          clitoralErection: {
            has: false,
            desc: null,
          },
          erection: {
            has: false,
            desc: null,
          },
          yinShui: {
            has: false,
            desc: null,
          },
          preCum: {
            has: false,
            desc: null,
          },
          ejaculation: {
            has: false,
            desc: null,
          },
          squirt: {
            has: false,
            desc: null,
          },
          scrotumContract: {
            has: false,
            desc: null,
          },
          vaginalContract: {
            has: false,
            desc: null,
          },
          urethraOpenClose: {
            has: true,
            desc: '不住张合',
          },
          anusOpenClose: {
            has: false,
            desc: null,
          },
          urineIncontinence: {
            has: true,
            desc: '濒临失禁',
          },
          fecesIncontinence: {
            has: false,
            desc: null,
          },
        },
        unique: {
          burningSensation: '灼烧',
        },
      },

      // ──── 子宫（女性）[子模块] ────
      uterus: {
        multiOrgasm: true,
        refractory: '极短',
        sensation: '子宫被反复撞击的酸麻胀痛',
        sensitivity: '暴增',
        duration: '持续撞击会越来越酸',
        consciousness: '失神',
        mentalThoughts: '顶到最里面了……要坏掉了……',
        face: {
          flush: '全身泛红',
          eyes: '翻白眼',
          mouth: '张口',
          tears: {
            has: true,
            desc: '被顶到流泪',
          },
        },
        moanVolume: '大声',
        moanStyle: '浪叫型',
        moanContent: '顶到了……子宫……轻点……',
        scream: {
          has: true,
          desc: '子宫高潮时尖叫',
        },
        sluttyMoan: {
          has: true,
          desc: '不受控制地浪叫',
        },
        body: {
          backArch: {
            has: true,
            desc: '腰弓成桥',
          },
          legTremble: {
            has: true,
            desc: '剧烈颤抖',
          },
          bodySpasm: {
            has: true,
            desc: '全身痉挛',
          },
          muscleTension: '僵直',
          handAction: '抱紧对方',
          toes: '痉挛蜷缩',
        },
        organReaction: {
          saliva: '大量分泌',
          nippleErection: {
            has: false,
            desc: null,
          },
          nippleSecretion: '无',
          clitoralErection: {
            has: false,
            desc: null,
          },
          erection: {
            has: false,
            desc: null,
          },
          yinShui: {
            has: false,
            desc: null,
          },
          preCum: {
            has: false,
            desc: null,
          },
          ejaculation: {
            has: false,
            desc: null,
          },
          squirt: {
            has: false,
            desc: null,
          },
          scrotumContract: {
            has: false,
            desc: null,
          },
          vaginalContract: {
            has: true,
            desc: '剧烈收缩',
          },
          urethraOpenClose: {
            has:  false,
            desc: null,
          },
          anusOpenClose: {
            has: false,
            desc: null,
          },
          urineIncontinence: {
            has:  false,
            desc: null,
          },
          fecesIncontinence: {
            has: false,
            desc: null,
          },
        },
        unique: {
          cervixImpactPain: '剧烈',
        },
      },
    },


  },
  // ════════════════════════════════════════════════
  //  六、性历史
  // ════════════════════════════════════════════════
  sexualHistory: {                            // 性历史[区块]

    // ━━━ 6-1 性史概览 ━━━

    milestones: {                  // 性史概览[顶层模块]
      // ──── 各性别人数 ────
      partnerCount: 4,       // 性交总人次（同一人做多次重复计数）

      female: {
        count: 1,
        desc: '和女队友互相抚慰过几次',
        firstTime: {
          partner: null,
          desc: null,
        },
        mostShameful: {
          partner: null,
          desc: null,
        },
        best: {
          partner: null,
          desc: null,
        },
        worst: {
          partner: null,
          desc: null,
        },
      },
      male: {
        count: 3,
        desc: '营地里和几个男兵有过露水情缘',
        firstTime: {
          partner: null,
          desc: null,
        },
        mostShameful: {
          partner: null,
          desc: null,
        },
        best: {
          partner: null,
          desc: null,
        },
        worst: {
          partner: null,
          desc: null,
        },
      },
      femboy: {
        count: 0,
        desc: null,  // 该性别人数 / 概况描述
        firstTime: {
          partner: null,
          desc: null,
        },  // 第一次：描述 / 对象
        mostShameful: {
          partner: null,
          desc: null,
        },  // 最羞耻：描述 / 对象
        best: {
          partner: null,
          desc: null,
        },  // 最佳体验：描述 / 对象
        worst: {
          partner: null,
          desc: null,
        },  // 最差体验：描述 / 对象
      },
      futa: {
        count: 0,
        desc: null,  // 该性别人数 / 概况描述
        firstTime: {
          partner: null,
          desc: null,
        },  // 第一次：描述 / 对象
        mostShameful: {
          partner: null,
          desc: null,
        },  // 最羞耻：描述 / 对象
        best: {
          partner: null,
          desc: null,
        },  // 最佳体验：描述 / 对象
        worst: {
          partner: null,
          desc: null,
        },  // 最差体验：描述 / 对象
      },
      alien:   {
        count: 0,
        desc: null,  // 该性别人数 / 概况描述；异种：动物、虫子、触手等非人类生物
        firstTime: {
          partner: null,
          desc: null,
        },  // 第一次：描述 / 对象
        mostShameful: {
          partner: null,
          desc: null,
        },  // 最羞耻：描述 / 对象
        best: {
          partner: null,
          desc: null,
        },  // 最佳体验：描述 / 对象
        worst: {
          partner: null,
          desc: null,
        },  // 最差体验：描述 / 对象
      },

      // ──── 全局里程碑 ────
      firstTime:      null,
      mostShameful:   null,
      best:           null,
      worst:           null,
    },

    // ━━━ 6-2 身体数据统计 ━━━

    bodyStats: {                   // 身体数据[顶层模块]
      // ──── 阴茎 ────
      penis: {                          // 阴茎统计[子模块]
        uniquePartnerCount: {
          count: 0,
          desc: null,
        },  // 阴茎性交总人数（去重）
        maxPartnerSession: {
          count: 0,
          desc: null,
        },  // 阴茎单次最多伴侣数
        masturbationCount: {
          count: 0,
          desc: null,
        },  // 阴茎自慰次数
        orgasmCount: {
          count: 0,
          desc: null,
        },  // 阴茎高潮次数
        ejaculationCount: {
          count: 0,
          desc: null,
        },  // 阴茎射精次数
        incontinenceCount: {
          count: 0,
          desc: null,
        },  // 阴茎高潮失禁次数
        comaCount: {
          count: 0,
          desc: null,
        },  // 阴茎高潮昏迷次数
      },

      // ──── 前列腺 ────
      prostate: {                       // 前列腺统计[子模块]
        uniquePartnerCount: {
          count: 0,
          desc: null,
        },  // 前列腺性交总人数（去重）
        maxPartnerSession: {
          count: 0,
          desc: null,
        },  // 前列腺单次最多伴侣数
        masturbationCount: {
          count: 0,
          desc: null,
        },  // 前列腺自慰次数
        orgasmCount: {
          count: 0,
          desc: null,
        },  // 前列腺高潮次数
        ejaculationCount: {
          count: 0,
          desc: null,
        },  // 前列腺导致射精次数
        incontinenceCount: {
          count: 0,
          desc: null,
        },  // 前列腺高潮失禁次数
        comaCount: {
          count: 0,
          desc: null,
        },  // 前列腺高潮昏迷次数
      },

      // ──── 女性部分 ────
      femalePart: {                     // 女性部分[子模块]
        uniquePartnerCount: {
          count: 0,
          desc: null,
        },  // 性交总人数（去重）
        maxPartnerSession: {
          count: 0,
          desc: null,
        },  // 单次最多伴侣数
        masturbationCount: {
          count: 0,
          desc: null,
        },  // 自慰次数
        orgasmCount: {
          count: 0,
          desc: null,
        },  // 高潮次数
        squirtCount: {
          count: 0,
          desc: null,
        },  // 潮吹次数
        incontinenceCount: {
          count: 0,
          desc: null,
        },  // 高潮失禁次数
        comaCount: {
          count: 0,
          desc: null,
        },  // 高潮昏迷次数
        pregnancyCount: {
          count: 0,
          desc: null,
        },  // 怀孕次数
        abortionCount: {
          count: 0,
          desc: null,
        },  // 堕胎次数
      },

      // ──── 其他（杂项统计）────
      other: {                          // 其他[子模块]
        nippleMasturbationCount: {
          count: 0,
          desc: null,
        },  // 乳头自慰次数
        nippleOrgasmCount: {
          count: 0,
          desc: null,
        },  // 乳头高潮次数
        nippleEjaculationCount: {
          count: 0,
          desc: null,
        },  // 乳头导致射精次数
        lockEjaculationCount: {
          count: 0,
          desc: null,
        },  // 贞操锁内射精次数
        lockUrinationCount: {
          count: 0,
          desc: null,
        },  // 贞操锁内撒尿次数
        edgingCount: {
          count: 0,
          desc: null,
        },  // 寸止次数
        urethralOrgasmCount: {
          count: 0,
          desc: null,
        },  // 尿道高潮次数
        urethralIncontinenceCount: {
          count: 0,
          desc: null,
        },  // 尿道失禁次数
        urethralEjaculationCount: {
          count: 0,
          desc: null,
        },  // 尿道导致射精次数
        semenSwallowCount: {
          count: 0,
          desc: null,
        },  // 吞精液次数
        urineDrinkCount: {
          count: 0,
          desc: null,
        },  // 喝尿液次数
        fecesEatCount: {
          count: 0,
          desc: null,
        },  // 食粪便次数
      },
    },


  },
  // ════════════════════════════════════════════════
  //  七、首次记录
  // ════════════════════════════════════════════════
  firstRecords: {                            // 首次记录[区块]

    // ━━━ 7-1 破处记录 ━━━

    deflowered: {                   // 破处记录[顶层模块]
      ejaculation: {                // 首次射精
        status:      '已破',        // 状态
        age:         14,            // 年龄
        partner:     '自行',        // 对象
        circumstance: '梦中遗精',   // 情境
        forced:      false,         // 是否被迫
        notes:       '第一次射精是梦遗，醒来又惊又羞',  // 备注
      },
      oral: {                                   // 口交破处（被口）
        status:      '已破',                    // 状态
        age:         20,                        // 年龄
        partner:     '要塞的佣兵队长',           // 对象
        circumstance: '酒后',                   // 情境
        forced:      true,                      // 是否被迫
        notes:       '不愉快的经历',             // 备注（无）
      },
      vaginal: {                      // 阴道破处
        status:      '已破',                    // 状态
        age:         20,                        // 年龄
        partner:     '要塞的佣兵队长',           // 对象
        circumstance: '酒后强迫',               // 情境
        pain:        '剧烈',                    // 疼痛程度
        bleeding:    '大量',                    // 出血情况
        forced:      true,                      // 是否被迫
        notes:       '那次之后她杀了队长逃离要塞',  // 备注（无）
      },
      urethral: {                               // 尿道破处
        status:      '未破',                    // 状态
        age:         null,                      // 年龄
        partner:     null,                      // 对象
        circumstance: null,                     // 情境
        pain:        null,                      // 疼痛程度
        bleeding:    null,                      // 出血情况
        forced:      false,                     // 是否被迫
        notes:       null,                      // 备注
      },
      anal: {                                   // 肛门破处
        status:      '已破',                    // 状态
        age:         21,                        // 年龄
        partner:     '遇到的精灵游侠',           // 对象
        circumstance: '自愿尝试',               // 情境
        pain:        '轻微',                    // 疼痛程度
        bleeding:    '少量',                    // 出血情况
        forced:      false,                     // 是否被迫
        notes:       '第一次不那么痛苦的性经历',  // 备注
      },
      prostate: {                               // 首次触碰到前列腺（不一定高潮）
        status:      '未破',                    // 已破/未破
        age:         null,                      // 年龄（无）
        partner:     null,                      // 对象（无）
        circumstance: null,                     // 情境（无）
        sensation:   null,                      // 快感程度：轻微/明显/强烈/前所未有
        ejaculated:  null,                      // 是否同时射精
        forced:      false,                     // 是否被迫
        notes:       '没试过前列腺高潮',        // 备注
      },
    },

    // ━━━ 7-2 首次高潮记录 ━━━

    firstOrgasm: {                   // 首次高潮记录[顶层模块]
      nipples: {                     // 乳头高潮
        status:      '未',           // 已/未
        age:         null,           // 年龄
        method:      null,           // 方式
        partner:     null,           // 对象
        circumstance: null,          // 情境
        sensation:   null,           // 感受
        notes:       null,           // 备注
      },
      clitoris: {                    // 阴蒂高潮
        status:      '未',           // 已/未
        age:         null,           // 年龄
        method:      null,           // 方式
        partner:     null,           // 对象
        circumstance: null,          // 情境
        sensation:   null,           // 感受
        notes:       null,           // 备注
      },
      vaginal: {                     // 阴道高潮
        status:      '未',           // 已/未
        age:         null,           // 年龄
        method:      null,           // 方式
        partner:     null,           // 对象
        circumstance: null,          // 情境
        sensation:   null,           // 感受
        ejaculated:  null,           // 是否同时射精
        notes:       null,           // 备注
      },
      glans: {                       // 龟头高潮
        status:      '已',           // 已/未
        age:         14,             // 年龄
        method:      '梦遗',         // 方式
        partner:     '自行',         // 对象
        circumstance: '梦中',        // 情境
        sensation:   '困惑中带着快感',  // 感受
        ejaculated:  true,           // 是否同时射精
        notes:       '梦遗中达到第一次龟头高潮',  // 备注
      },
      penis: {                       // 阴茎高潮
        status:      '已',           // 已/未
        age:         14,             // 年龄
        method:      '梦遗',         // 方式
        partner:     '自行',         // 对象
        circumstance: '梦中',        // 情境
        sensation:   '从龟头蔓延到整根',  // 感受
        ejaculated:  true,           // 是否同时射精
        notes:       '和龟头高潮同时发生',  // 备注
      },
      anal: {                        // 肛门高潮
        status:      '已',           // 已/未
        age:         21,             // 年龄
        method:      '肛交',         // 方式
        partner:     '精灵游侠',     // 对象
        circumstance: '自愿尝试',    // 情境
        sensation:   '新奇而强烈的快感',  // 感受
        ejaculated:  true,           // 是否同时射精
        notes:       '第一次肛交被干到射',  // 备注
      },
      prostate: {                    // 前列腺高潮
        status:      '未',           // 已/未
        age:         null,           // 年龄
        method:      null,           // 方式
        partner:     null,           // 对象
        circumstance: null,          // 情境
        sensation:   null,           // 感受
        ejaculated:  null,           // 是否同时射精
        notes:       null,           // 备注
      },
      vaginalUrethra: {              // 小穴尿道高潮
        status:      '未',           // 已/未
        age:         null,           // 年龄
        method:      null,           // 方式
        partner:     null,           // 对象
        circumstance: null,          // 情境
        sensation:   null,           // 感受
        notes:       null,           // 备注
      },
      penileUrethra: {               // 阴茎尿道高潮
        status:      '未',           // 已/未
        age:         null,           // 年龄
        method:      null,           // 方式
        partner:     null,           // 对象
        circumstance: null,          // 情境
        sensation:   null,           // 感受
        ejaculated:  null,           // 是否同时射精
        notes:       null,           // 备注
      },
    },

    // ━━━ 7-3 首次失控记录 ━━━

    firstLosingControl: {            // 首次失控记录[顶层模块]
      ahegao: {                      // 阿黑颜（表情失控）
        status:      '未',           // 已/未
        age:         null,           // 年龄
        partner:     null,           // 对象
        circumstance: null,          // 情境
        duration:    null,           // 持续时间
        notes:       null,           // 备注
      },
      urine: {                       // 尿液失禁
        status:      '未',           // 已/未
        age:         null,           // 年龄
        partner:     null,           // 对象
        circumstance: null,          // 情境
        volume:      null,           // 量
        sensation:   null,           // 感受
        notes:       null,           // 备注
      },
      feces: {                       // 粪便失禁
        status:      '未',           // 已/未
        age:         null,           // 年龄
        partner:     null,           // 对象
        circumstance: null,          // 情境
        consistency: null,           // 性状
        sensation:   null,           // 感受
        notes:       null,           // 备注
      },
      squirt: {                      // 潮吹
        status:      '未',           // 已/未
        age:         null,           // 年龄
        partner:     null,           // 对象
        circumstance: null,          // 情境
        volume:      null,           // 量
        sensation:   null,           // 感受
        notes:       null,           // 备注
      },
      conception: {                  // 首次受孕（作为母体）
        status:      '未',           // 已/未
        age:         null,           // 年龄
        partner:     null,           // 对象
        circumstance: null,          // 情境
        awareAt:     null,           // 发现时间（孕几周）
        reaction:    null,           // 反应
        notes:       null,           // 备注
      },
      abortion: {                    // 首次堕胎
        status:      '未',           // 已/未
        age:         null,           // 年龄
        partner:     null,           // 对象
        method:      null,           // 方式：药流/手术/自然流产/其他
        week:        null,           // 孕几周
        forced:      false,          // 是否被迫
        pain:        null,           // 疼痛程度
        complication: null,          // 并发症
        notes:       null,           // 备注
      },
      lactation: {                   // 泌乳（乳汁失控分泌）
        status:      '未',           // 已/未
        age:         null,           // 年龄
        partner:     null,           // 对象
        circumstance: null,          // 情境
        volume:      null,           // 量
        sensation:   null,           // 感受
        notes:       null,           // 备注
      },
      preCum: {                      // 先走汁
        status:      '已',           // 已/未
        age:         14,             // 年龄
        partner:     '自行',         // 对象
        circumstance: '梦中遗精',    // 情境
        volume:      '少量',         // 量
        sensation:   '没注意到',     // 感受
        notes:       null,           // 备注
      },
      prostateUrine: {               // 前列腺尿液失禁
        status:      '未',           // 已/未
        age:         null,           // 年龄
        partner:     null,           // 对象
        circumstance: null,          // 情境
        volume:      null,           // 量
        sensation:   null,           // 感受
        notes:       null,           // 备注
      },
      prostateSemen: {               // 前列腺精液失禁
        status:      '未',           // 已/未
        age:         null,           // 年龄
        partner:     null,           // 对象
        circumstance: null,          // 情境
        volume:      null,           // 量
        sensation:   null,           // 感受
        notes:       null,           // 备注
      },
      retrogradeEjaculation: {        // 逆行射精（精液射入膀胱）
        status:      '未',           // 已/未
        age:         null,           // 年龄
        partner:     null,           // 对象
        circumstance: null,          // 情境
        sensation:   null,           // 感受
        volume:      null,           // 量
        notes:       null,           // 备注
      },
    },


  },
  // ════════════════════════════════════════════════
  //  八、性偏好
  // ════════════════════════════════════════════════
  sexualPreferences: {                            // 性偏好[区块]

    // ━━━ 8-1 器官偏好（合并伪娘和女性）━━━

    organPreferences: {                  // 器官偏好[顶层模块]

      // ──── 乳头（女性版）[子模块] ────

      nipples: {                         // 乳头偏好[子模块]
        method:     '按摩',              // 方式偏好：震动/按摩/电击/拍打/温度
        type:       '外部刺激',          // 类型偏好：插入式/外部刺激
        pain:       '轻微可以',          // 痛苦偏好：完全不行/轻微可以/喜欢/很享受
        shame:      '有点羞',            // 羞耻度：不觉得羞/有点羞/很害羞/羞得不行
        desire:     '偶尔想要',          // 渴望度：不想要/偶尔想要/挺想要的/天天想
        care:       '有点在乎',          // 在乎程度：不在乎/有点在乎/挺在乎/非常在意
        feeling:    '乳头被玩弄时有种酥麻感', // 感受：对此器官施加刺激时的心理想法

        specific: {                      // 器官特有[子模块]
          biting:   '轻微可以',          // 撕咬拉扯：完全不行/轻微可以/喜欢/很享受
        },
      },

      // ──── 龟头（伪娘版）────

      glans: {                           // 龟头偏好[子模块]
        method:     '震动',              // 方式偏好
        type:       '外部刺激',          // 类型偏好
        pain:       '轻微可以',          // 痛苦偏好
        shame:      '有点羞',            // 羞耻度
        desire:     '挺想要的',          // 渴望度
        care:       '挺在乎',            // 在乎程度
        feeling:    '龟头被碰触时快感直冲头顶', // 感受

        specific: {                      // 器官特有[子模块]
          speed:    '适中',              // 刺激速度：轻柔慢磨/适中/快速摩擦/极速抽插
        },
      },

      // ──── 阴茎（伪娘版）────

      penis: {                           // 阴茎偏好[子模块]
        method:     '按摩',              // 方式偏好
        type:       '插入式',            // 类型偏好
        pain:       '轻微可以',          // 痛苦偏好
        shame:      '有点羞',            // 羞耻度
        desire:     '挺想要的',          // 渴望度
        care:       '挺在乎',            // 在乎程度
        feeling:    '阴茎被服侍的感觉很舒服', // 感受

        specific: {                      // 器官特有[子模块]
          ejaculation: '正常',           // 射精喜好：不喜欢射精/正常/喜欢射精/迷恋射精
        },
      },

      // ──── 前列腺（伪娘版）────

      prostate: {                        // 前列腺偏好[子模块]
        method:     '按摩',              // 方式偏好
        type:       '插入式',            // 类型偏好
        pain:       '喜欢',              // 痛苦偏好
        shame:      '很害羞',            // 羞耻度
        desire:     '挺想要的',          // 渴望度
        care:       '有点在乎',          // 在乎程度
        feeling:    '前列腺高潮和阴茎高潮各有风味', // 感受

        specific: {                      // 器官特有[子模块]
          orgasmType: '都喜欢',          // 高潮类型：射精/湿劲/不射
        },
      },

      // ──── 阴蒂（女性版）────

      clitoris: {                        // 阴蒂偏好[子模块]
        method:     '震动',              // 方式偏好
        type:       '外部刺激',          // 类型偏好
        pain:       '轻微可以',          // 痛苦偏好
        shame:      '很害羞',            // 羞耻度
        desire:     '挺想要的',          // 渴望度
        care:       '非常在意',          // 在乎程度
        feeling:    '阴蒂是双性身体最敏感的地方之一', // 感受

        specific: {                      // 器官特有[子模块]
          speed:    '适中',              // 刺激速度：轻柔慢磨/适中/快速摩擦/极速抽插
        },
      },

      // ──── 阴道（女性版）────

      vagina: {                          // 阴道偏好[子模块]
        method:     '按摩',              // 方式偏好
        type:       '插入式',            // 类型偏好
        pain:       '轻微可以',          // 痛苦偏好
        shame:      '有点羞',            // 羞耻度
        desire:     '偶尔想要',          // 渴望度
        care:       '有点在乎',          // 在乎程度
        feeling:    '小穴被填满时很有安全感', // 感受

        specific: {                      // 器官特有[子模块]
          fullness: '适中',              // 填满感：浅插即可/适中/深顶/直抵子宫口
        },
      },

      // ──── 肛门（女性版）[子模块] ────

      anus: {                            // 肛门偏好[子模块]
        method:     '按摩',              // 方式偏好
        type:       '插入式',            // 类型偏好
        pain:       '轻微可以',          // 痛苦偏好
        shame:      '很害羞',            // 羞耻度
        desire:     '偶尔想要',          // 渴望度
        care:       '挺在乎',            // 在乎程度
        feeling:    '后面被操时又难受又刺激', // 感受

        specific: {                      // 器官特有[子模块]
          dilation: '可以接受',          // 扩张感：完全不行/可以接受/喜欢被撑开/越撑越爽
        },
      },

      // ──── 尿道（女性版）[子模块] ────

      urethra: {                         // 尿道偏好[子模块]
        method:     '温度',              // 方式偏好
        type:       '插入式',            // 类型偏好
        pain:       '完全不行',          // 痛苦偏好
        shame:      '很害羞',            // 羞耻度
        desire:     '不想要',            // 渴望度
        care:       '非常在意',          // 在乎程度
        feeling:    '尿道太敏感了不敢碰', // 感受

        specific: {                      // 器官特有[子模块]
          depth:    '浅口即可',          // 深度喜好：浅口即可/可以深入/越深越好
        },
      },

      // ──── 子宫（女性版）────

      uterus: {                          // 子宫偏好[子模块]
        method:     '按摩',              // 方式偏好
        type:       '插入式',            // 类型偏好
        pain:       '喜欢',              // 痛苦偏好
        shame:      '很害羞',            // 羞耻度
        desire:     '偶尔想要',          // 渴望度
        care:       '挺在乎',            // 在乎程度
        feeling:    '子宫被顶到时酸麻胀满', // 感受

        specific: {                      // 器官特有[子模块]
          cervixImpact: '轻微可以',      // 宫颈撞击：完全不行/轻微可以/喜欢/很享受
        },
      },
    },

    // ━━━ 8-2 玩法偏好 ━━━

    playPreferences: {                   // 玩法偏好[顶层模块]

      // ──── 主动被动 ────

      initiative: {                      // 主动被动[子模块]
        active:     '喜欢',              // 主动（操人）：完全不想/偶尔想/喜欢/非常享受
        passive:    '喜欢',              // 被动（被操）：同上
      },

      // ──── 风格偏好 ────

      style:      '粗暴猛烈',            // 整体风格：轻柔抚慰/温和缠绵/适中/粗暴猛烈/狂野施虐

      // ──── 喜好部位 ────

      targetParts: [                     // 部位列表[子模块]
        '皮具',
        '武器',
        '冰凉的手指',
        '阴茎',
        '小穴',
      ],

      // ──── 接受度 ────

      acceptance: {                      // 接受度[子模块]，以下各项四选一：完全不行/可以接受/喜欢/很享受
        bondage:       '完全不行',       // 捆绑
        filth:         '完全不行',       // 污秽（喝尿等）
        humiliation:   '完全不行',       // 羞辱
        exposure:      '可以接受',       // 露出
        toys:          '可以接受',       // 道具
        neglect:       '完全不行',       // 放置
        incontinence:  '完全不行',       // 失禁
      },

      // ──── 情调 ────

      atmosphere: {                      // 情调[子模块]
        petName: [                       // 称呼：性爱时喜欢被怎么叫/怎么叫对方
          '战士',
          '霜华',
        ],
        dirtyTalk: [                     // 性爱语言：做爱时爱说的话（多选）
          '说骚话',
        ],
        roleplay: {                      // 角色扮演[子模块]
          enjoy:     false,              // 是否喜欢角色扮演
          scenarios: null,               // 喜欢的剧本
        },
      },
    },

    // ━━━ 8-3 特殊时期偏好 ━━━

    specialPeriod: {                     // 特殊时期偏好[顶层模块]

      // ──── 睡眠时 ────

      sleeping: {                        // 睡眠时[子模块]
        active:     '喜欢',              // 主动，喜不喜欢操睡着的人：完全不想/偶尔想/喜欢/非常享受
        passive:    '完全不想',          // 被动，自己睡着时喜不喜欢被操：同上
        acceptance: '喜欢',              // 接受度
        stage:      '浅睡中',            // 阶段：犯困时/浅睡中/深睡中
        thoughts:   null,                // 想法
      },

      // ──── 月经时 ────

      menstruation: {                    // 月经时[子模块]
        active:     '完全不想',
        passive:    '偶尔想',
        acceptance: '可以接受',
        stage:      '经中',
        thoughts:   null,
      },

      // ──── 怀孕时 ────

      pregnancy: {                       // 怀孕时[子模块]
        active:     '完全不想',
        passive:    '完全不想',
        acceptance: '完全不行',
        stage:      '孕早期',
        thoughts:   null,
      },

      // ──── 生病时 ────

      illness: {                         // 生病时[子模块]
        active:     '完全不想',
        passive:    '完全不想',
        acceptance: '完全不行',
        stage:      '初病时',
        thoughts:   null,
      },

      // ──── 腹泻时 ────

      diarrhea: {                        // 腹泻时[子模块]
        active:     '完全不想',
        passive:    '完全不想',
        acceptance: '完全不行',
        stage:      '刚发作',
        thoughts:   null,
      },
    },


  },
  // ════════════════════════════════════════════════
  //  九、生殖健康
  // ════════════════════════════════════════════════
  reproductiveHealth: {                            // 生殖健康[区块]

    // 扶她兼具女性完全生殖系统和男性完全生殖功能

    // ━━━ 9-1 子宫状态 ━━━

    uterusStatus: {                       // 子宫状态[顶层模块]
      condition: '正常',        // 子宫功能状态
      position:  '前位',        // 子宫位置
      cervix:    '正常',    // 宫颈
      fallopian: '通畅',        // 输卵管
    },

    // ━━━ 9-2 月经 ━━━

    menstruation: {                 // 月经[顶层模块]
      status:     '正常',     // 月经状态
      cycle:      28,                   // 周期（天）
      duration:   5,                    // 持续（天）
      regularity: '准时',               // 规律性
      lastDate:   null,                 // 末次月经（无）
      flow:       '正常',               // 经量
      color:      '暗红',               // 颜色
      clots:      false,                // 血块
      pain:       '轻微',               // 痛经
      pms:        '易怒',           // 经前综合征
      notes:      null,                 // 备注（无）
    },

    // ━━━ 9-3 生育力 ━━━

    fertility: {                            // 生育力[顶层模块]
      status:       '可育',                 // 生育状态，扶她子宫可受孕且有精液
      pregnancies:  0,                      // 怀孕次数（作为母体）
      births:       0,                      // 生产次数
      miscarriages: 0,                      // 流产次数
      abortions:    0,                      // 堕胎次数
      children:     0,                      // 已生育子女数（作为父体）
      proven:       false,                  // 是否已验证生育能力
      notes:        '双性体质，既可受孕也可使人受孕',  // 备注
    },

    // ━━━ 9-4 妊娠 ━━━

    currentPregnancy: {                     // 妊娠[顶层模块]
      isPregnant:     false,                // 是否怀孕
      conceptionDate: null,                 // 受孕日期（无）
      dueDate:        null,                 // 预产期（无）
      week:           0,                    // 周数
      trimester:      null,                 // 孕期（无）
      symptoms:       null,                 // 反应（无）
      complication:   null,                 // 并发症（无）
      fetalCount:     0,                    // 胎儿数
      fetalHealth:    null,                 // 胎儿健康（无）
      notes:          null,                 // 备注（无）
    },

    // ━━━ 9-5 睾丸状态 ━━━

    testes: {                         // 睾丸[顶层模块]
      condition:  '正常',             // 正常/萎缩/隐睾/切除
      position:   '正常下垂',         // 正常下垂/高位/隐睾
      leftSize:   '正常',             // 左侧大小：偏小/正常/偏大
      rightSize:  '正常',             // 右侧大小：偏小/正常/偏大
      varicocele: false,              // 是否精索静脉曲张
      notes:      null,               // 备注（无）
    },

    // ━━━ 9-6 膀胱 ━━━

    bladder: {                        // 膀胱[顶层模块]
      capacity:   '正常',             // 正常/偏小/偏大
      control:    '正常',             // 正常/较弱/失禁
      inflammation: false,            // 是否膀胱炎
      notes:      null,               // 备注（无）
    },

    // ━━━ 9-7 精液质量 ━━━

    semen: {                          // 精液[顶层模块]
      volume:     '正常',             // 偏少/正常/较多/非常多
      viscosity:  '中等',             // 稀薄如水/偏稀/中等/较稠/浓稠带块
      color:      '乳白',             // 乳白/淡黄/黄绿/带血/透明
      spermCount: '正常',             // 无精/少精/正常/多精
      motility:   '正常',             // 精子活力：无/弱/正常/强
      morphology: '正常',             // 精子形态：异常/正常
      notes:      null,               // 备注（无）
    },

    // ━━━ 9-8 前列腺健康 ━━━

    prostateHealth: {                 // 前列腺健康[顶层模块]
      condition:  '正常',             // 正常/炎症/增生/切除
      size:       '正常',             // 偏小/正常/偏大
      palpation:  '无异常',           // 指检结果：无异常/压痛/硬结/肿大
      inflammation: false,            // 是否前列腺炎
      hyperplasia:  false,            // 是否前列腺增生
      notes:      null,               // 备注（无）
    },

    // ━━━ 9-9 避孕 ━━━

    contraception: {                        // 避孕[顶层模块]
      using:         false,                 // 是否避孕
      method:        null,                  // 方法（无）
      effectiveness: null,                  // 效果（无）
      notes:         null,                  // 备注（无）
    },


  },
  // ════════════════════════════════════════════════
  //  十、身体健康
  // ════════════════════════════════════════════════
  physicalHealth: {                            // 身体健康[区块]

    // ━━━ 10-1 体质 ━━━
    physique: {                       // 体质[顶层模块]

      physical: '强壮',        // 体质
      mental:   '坚韧',          // 精神

    },

    // ━━━ 10-2 疾病 ━━━
    diseases: {                       // 疾病[顶层模块]

      illnesses:  null,       // 患病记录（无）
      chronic:    null,       // 慢性病

      sti: {                                // 性病
        status:   '无',                      // 状态
        diseases: null,                      // 病种（无）
        history:  null,                      // 病史（无）
        notes:    '身体健康，无性病史',       // 备注
      },

      injuries:       null,   // 受伤记录（无）
      drugResistance: null,   // 药物抗性（无）
      allergies:      null,   // 过敏原（无）

    },

    // ━━━ 10-3 残疾 ━━━
    disabilities: {                    // 残疾[顶层模块]

      disability: {                         // 残疾
        has:         false,                 // 是否有残疾
        type:        null,                  // 类型（无）
        description: null,                  // 描述（无）
        sinceBirth:  false,                 // 是否先天
        affects:     null,                  // 影响（无）
        notes:       null,                  // 备注（无）
      },


    },

  },

  // ════════════════════════════════════════════════
  //  十一、性格言行
  // ════════════════════════════════════════════════
  personality: {                            // 性格言行[区块]

    // ━━━ 11-1 性格 ━━━
    personalityTraits: {                       // 性格[顶层模块]

      personality: {                    // 性格
        attitude:   '冷漠孤高，对陌生人充满戒备',     // 对他人的普遍态度
        temperament:    '冷冽',      // 气质
        stubbornness:   '极高',       // 倔强
        empathy:        '中',         // 同理心
        sociability:    '低',         // 社交
        ambition:       '中',       // 野心
        mentalTraits: [                 // 特质
          '独立',
          '记仇',
          '保护欲强',
          '不信任他人',
        ],
        phobias: [                     // 恐惧症
          '被绑住双手',
          '被多人围困',
        ],
        desires: [                     // 欲望
          '找到接纳她的人',
          '变强到没人能欺负她',
          '解开双性体质的秘密',
        ],
      },

    },

    // ━━━ 11-2 特殊标记 ━━━
    specialMarks: {                       // 特殊标记[顶层模块]

      modified:         false,      // 是否被改造过
      modificationNotes: null,      // 改造备注（无）
      brainwashed:      false,      // 是否被洗脑
      brainwashNotes:   null,       // 洗脑备注（无）
      parasite:         false,      // 是否被寄生
      parasiteNotes:    null,       // 寄生备注（无）
      broken:           false,      // 是否精神崩溃
      brokenNotes:      null,       // 崩溃备注（无）

    },


  },
  // ════════════════════════════════════════════════
  //  十二、状态与契约
  // ════════════════════════════════════════════════
  statusContract: {                            // 状态与契约[区块]

    // ━━━ 12-1 当前状态 ━━━
    currentState: {                       // 当前状态[顶层模块]

      status:   '空闲',       // 空闲/工作中/休息/训练/生病/休假
      location: '未派遣',     // 所在地

    },

    // ━━━ 12-2 工作统计 ━━━
    workStats: {                       // 工作状态[顶层模块]

      // ──── 12-2-1 工作记录 ────
      records: {                               // 工作记录
        todayTasks:        0,                     // 今日任务
        totalTasks:        0,                     // 累计任务
        todayIncome:       0,                     // 今日收入
        totalIncome:       0,                     // 累计收入
        performanceCount:  0,                     // 表演次数
        guestSatisfaction: 0,                     // 客人满意度
        regularCustomers:  null,                  // 常客（无）
        lastWorked:        null,                  // 末次工作（无）
      },

    },

    // ━━━ 12-3 所有权 ━━━
    ownership: {                       // 所属关系[顶层模块]

      // ──── 12-3-1 所有权信息 ────
      detail: {                               // 所有权信息
        owner:   null,                            // 所有者（无）
        group:   null,                            // 所属团体（无）
        cost:    445,                             // 日维护费 = price 除以 100
        acquired: '邀请',                         // 获取方式
        acquiredDate:  null,                      // 获取日期（无）

        contract: {                               // 契约
          type:        '合作契约',                  // 类型
          duration:    '不定期',                    // 期限
          buyoutPrice: 89000,                     // 赎身价 = price 乘 2
        },
      },

    },


  },
  // ════════════════════════════════════════════════
  //  十三、属性
  // ════════════════════════════════════════════════
  attributes: {                            // 属性[区块]

    // 属性值 0-100，50 = 普通人水平

    // ━━━ 13-1 基础属性 ━━━

    basic: {                       // 基础属性[顶层模块]
      stamina:      70,   // 体力：持久力
      strength:     75,   // 力量：肌肉力量
      agility:      65,   // 敏捷：灵活/速度
      intelligence: 55,   // 智力：学习能力
      knowledge:    50,   // 知识：学识储备
      obedience:    30,   // 服从：听话程度
    },

    // ━━━ 13-2 姿色属性 ━━━

    beauty: {                      // 姿色属性[顶层模块]
      face:     78,     // 容貌美：面容精致程度
      figure:   72,     // 身材美：体型曲线程度
      genital:  75,     // 性器美：性器官美观程度
    },

    // ━━━ 13-3 性爱属性 ━━━

    sex: {                         // 性爱属性[顶层模块]
      lust:        40,     // 性欲：性欲旺盛程度
      sensitivity: 65,    // 敏感度：整体敏感程度
      skill:       45,    // 性技巧：性技巧熟练度
    },

    // ━━━ 13-4 关系属性 ━━━

    relation: {                    // 关系属性[顶层模块]
      loyalty:     30,    // 忠诚：对主人的忠诚
      affection:   10,    // 好感：对主人的好感
      fear:        20,    // 恐惧：对主人的恐惧
    },

    // ━━━ 13-5 堕落属性 ━━━

    corruption: {                  // 堕落属性[顶层模块]
      promiscuity:    15,  // 淫乱度：滥交倾向
      exhibitionism:  10,  // 露出度：当众性行为接受度
      masochism:      20,  // 受虐度：享受被虐的程度
      perversion:     10,  // 变态度：变态嗜好的广度和深度
    },


  },
  // ════════════════════════════════════════════════
  //  十四、后台
  // ════════════════════════════════════════════════
  meta: {                            // 后台[区块]

    // ━━━ 14-1 标签 ━━━

    tagList: {                        // 标签[顶层模块]
      //  标签：从以下五大维度中自由选取，每维至少一个，具体值不限于列表
      //  1. 世界观：古代 / 现代 / 异界 / 未来 / 仙侠
      //  2. 职业：农女 / 舞者 / 书生 / 商人 / 刺客 / 罪犯 / 官员 / 猎手
      //  3. 阶层：王族 / 贵族 / 富有 / 贫困 / 奴隶 / 高价值 / 纤弱 / 有教养
      //  4. 身份：处子 / 成年 / 年轻 / 经验丰富 / 新手 / 逃亡 / 异域 / 野性
      //  5. 性格：冷漠 / 温和 / 叛逆 / 清纯 / 魅惑 / 危险 / 骄傲 / 怯懦 / 自由奔放
      //  以下仅为示例，生成本可自行选词组合：
      tags: [
        '异界',
        '战士',
        '平民',
        '成年',
        '冷漠',
        '野性',
        '双性',
      ],
    },

    // ━━━ 14-2 标记 ━━━

    flags: {                          // 标记[顶层模块]
      metPlayer:       false,
      hadFirstSex:     false,
      attemptedEscape: false,
    },

    // ━━━ 14-3 备注 ━━━

    characterNotes: {                  // 备注[顶层模块]
      notes: '魅魔与精灵混血的扶她战士。外表冷冽，内心敏感。双性体质让她既可用阴茎插入，也可用小穴被干。',  // 备注
    },

    // ━━━ 14-4 元数据 ━━━

    metadata: {                       // 元数据[顶层模块]
      createdAt:       null,          // 创建时间（无）
      updatedAt:       null,          // 更新时间（无）
      version:         '1.0',         // 版本号
      author:          null,          // 作者（无）
      sourceFile:      null,          // 源文件（无）
      characterType:   '原创',        // 角色类型：原创/真实/同人（三选一）
      characterOrigin: null,          // 来源详情：原创→设计思路/参考对象；真实→人名+代表作；同人→出自哪个作品
      customFields:    null,          // 自定义字段（无）
    },

  },
};
