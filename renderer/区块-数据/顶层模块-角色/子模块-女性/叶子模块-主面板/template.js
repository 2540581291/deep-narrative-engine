// 女性角色 · 标准模板
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
// 身价 = int(10000 乘 年龄 乘 容貌 乘 处子 乘 种族 乘 健康 乘 身材 乘 性格) 加 技能数乘 500
//   年龄：6-9乘5.0 / 10-14乘3.0 / 15-18乘2.0 / 19-25乘1.0 / 26-35乘0.6 / 36及以上乘0.3
//   容貌(face)：40及以下乘0.5 / 41-55乘1.0 / 56-70乘1.5 / 71-80乘2.5 / 81-90乘4.0 / 91-100乘6.0
//   处子：处女乘3.0 / 非处乘1.0
//   种族：人族乘1.0 / 异族乘2.0
//   健康：健康/强壮乘1.0 / 亚健康乘0.85 / 体弱乘0.6 / 残疾重病乘0.3
//   身材：匀称苗条纤细柔软乘1.0 / 丰腴丰满健壮乘0.9 / 骨瘦如柴干瘦乘0.7 / 肥胖臃肿松垮乘0.5
//   性格：顺从温和忠诚乘1.1 / 普通乘1.0 / 叛逆倔强阴郁乘0.85 / 危险暴力施虐乘0.7
//   技能每项加 500
//   日维护费 = price 除以 100    赎身价 = price 乘 2
//   白10万及以下 / 绿10到20万 / 蓝20到50万 / 紫50到100万 / 金100万以上
//   价格范围：残疾约158元 到 极品精灵处女约180万元
//
// ━━━ 类型规范 ━━━
// 布尔用 true/false，数字用 Number，对象保持结构，数组用 Array
DATA.female = DATA.female || {};
DATA.female.template = {

  // ════════════════════════════════════════════════
  //  一、身份
  // ════════════════════════════════════════════════
  identity: {                            // 身份[区块]

    // ━━━ 1-1 基本信息 ━━━
    basicInfo: {                       // 基本信息[顶层模块]

      id:       'luo_sha_gong_zhu',   // 唯一ID（英文小写+下划线）
      name:     '罗莎',                // 显示名称
      title:    '边境小国的流亡公主',  // 头衔/称号
      icon:     '👸',                  // 头像图标
      role:     '自由',                // 自由/已受邀/员工/奴隶/宠物/囚犯/罪奴/牲畜/工具/废料

      age:      19,                    // 等效人类年龄（整数，不要加岁）
      race:     '人族',                // 人族/精灵/兽人/魔族/天使/龙裔/异种
      gender:   '女性',                // 女性/男性/伪娘/扶她
      rarity:   '白',                  // 白/绿/蓝/紫/金
      price:    56687,                // 身价/挂牌价（按定价公式计算），单位元，Number 类型

    },

    // ━━━ 1-2 出身背景 ━━━
    background: {                       // 出身背景[顶层模块]

      origin:       '南方边境的翡翠王国',        // 出身地
      birthStatus:  '王族',                     // 奴隶/平民/商贾/贵族/王族/异族
      family:       '王室家族，父母在亡国时双双遇害，仅她一人逃亡',  // 家族背景：父母/兄弟姐妹/家族地位/现状
      upbringing:   '自幼在王宫长大，受严格礼仪教育，从不知民间疾苦',  // 成长环境
      education:    '王族教育：阅读写作、礼仪、音乐、绘画、外语',      // 教育程度
      skills: [                        // 技能
        '阅读写作',
        '礼仪',
        '弹琴',
        '绘画',
        '外语（通用语）',
      ],

      talents: [                       // 天赋
        '语言天赋',
        '学习快',
        '绝对音感',
      ],

      aura:       '冷艳高贵，生人勿近',            // 整体气质印象

    },

    // ━━━ 1-3 经历 ━━━
    experience: {                       // 经历[顶层模块]

      currentOccupation: '仕女',                   // 当前职业
      timeline:          '0-16岁在王宫生活，16岁亡国后逃亡，18岁被捕获贩卖',  // 时间线：几岁到几岁在做什么
      lifeOverview:     '生于王室，长于深宫，十六岁那年敌国破城——她躲在母亲尸体下装死才逃过一劫。一夜之间从锦衣玉食的公主变成一无所有的亡命徒。两年逃亡路上，她变卖了身上最后一件首饰，在乡野做过零工，也曾靠姿色换过一顿饭。十八岁在边境被奴隶贩子抓获，押送至奴隶市场。如今站在这肮脏的笼子里，她依然挺直了脊梁，眼神里有王族最后的骄傲。',  // 人生概述：不少于50字
      dailyLife:        '关在奴隶市场的笼子里，每天有不同的人来"看货"。买家捏她的下巴看牙齿、扯开衣襟看胸脯、拍她的屁股看臀形，她紧咬着牙一声不吭。她每天只能吃到一碗稀粥和半个馒头，夜里裹着条薄毯缩在角落。隔壁笼子里关着个比她小几岁的女孩，一直在哭，她握住那女孩的手说别怕，声音比她想象的更平静。',  // 当下日常：不少于50字
      sexualAwakening:  '十六岁前她对性的认知只停留在宫中嬷嬷含糊其辞的训导——"身子不能给男人看"。逃亡路上一个农户收留了她一晚，深夜那男人爬上她的铺，她不知道该怎么反抗。她只记得第二天天没亮就逃了，腿间的疼痛走了三天才消。后来被奴隶贩子剥光了验货，她学会了面无表情地张开腿，心里默念自己已经死了。',  // 性的启蒙：不少于50字
      dailySexuality:   '在奴隶市场她被教导要"会伺候男人"才能卖个好价钱。老鸨掰开她的腿教她怎么笑、怎么叫、怎么扭腰。她学得很快，因为学不会就会挨打。但她心里很清楚这些只是活命的手段。夜里她偶尔会想起王宫里那些无忧无虑的日子，那时候她连牵手都没跟男人牵过。她不知道这算不算堕落，只知道哭也没用。',  // 日常性事：不少于50字
      sexualDetails: [   // 性爱明细：按时间先后编号列出性相关事件（1. 2. 3. ...顺延，不限于4条）；每条详细描述，内容要充足，不能一句话带过
        '1. 16岁：那年冬夜，她被同村的猎户在草垛里强占，事后他塞给她半只野鸡，她咬着牙收下了，腿间的血顺着裤缝滴了一路。',
        '2. 20岁：嫁给镇上屠户做填房，新婚夜她被按在喜床上，屠户的巴掌打得她半边脸肿了三天。后来她学会了在他酒后安静地张开腿，好少挨几下打。',
        '3. 25岁：屠户死后她流落到县城，被老鸨看中买进窑子。头三个月她天天夜里被不同客人翻来覆去地折腾，起不了床也下不了地，老鸨说破了处就值钱了，后来她成了窑里最红的一个。',
        '4. 27岁：一个常客想替她赎身，老鸨开价太高谈崩了。那夜她被灌了迷药，醒来时下身撕裂般的疼，枕头边压着五两银子。她没哭，只是把那银子贴身收好，从此学会了自己留个心眼。',
      ],

    },


  },
  // ════════════════════════════════════════════════
  //  二、外貌
  // ════════════════════════════════════════════════
  appearance: {                            // 外貌[区块]

    // ━━━ 2-1 面容 ━━━
    facialFeatures: {                       // 面容[顶层模块]

      face:       '鹅蛋脸，眉骨高挑，眼窝微陷',  // 面容描写
      forehead:   '饱满光洁',                    // 额头：宽窄/高低/皱纹
      eyes:       '翠绿色猫眼石般的眼睛',        // 眼睛描写
      eyelashes:  '浓密纤长',                    // 睫毛
      eyebrows:   '眉峰微扬，显得倔强',          // 眉毛
      nose:       '挺直秀气',                    // 鼻子：高矮/鼻型/鼻翼
      lips:       '唇形饱满，下唇略厚',          // 嘴唇：厚薄/唇形/唇色/干裂
      teeth:      '整齐洁白',                    // 牙齿：整齐/发黄/缺损/龅牙
      ears:       '耳垂饱满，耳廓线条柔和',      // 耳朵：大小/形状/贴面/招风

      hair: {                           // 头发
        color:  '银白色',                          // 发色
        length: '及腰',                             // 长度：板寸/齐耳/齐肩/及胸/及腰/及臀/及地
        texture:      '柔顺微卷',                   // 发质：干枯/粗硬/普通/柔顺/丝滑
        thickness:    '浓密',                       // 发量：稀疏/普通/浓密/厚重
        style:        '编成松松的辫子垂在胸前',     // 发型描述
        cleanliness:  '还算干净',                   // 清洁度：油腻肮脏/略有油光/还算干净/清爽/刚洗过
        notes:        '王族银发是祖先的祝福',       // 其他备注
      },

      facialHair: null,     // 胡须描述（可选值：山羊胡/络腮胡/无须/短须/胡茬/长须）

    },

    // ━━━ 2-2 体态 ━━━
    bodyShape: {                       // 体态[顶层模块]

      shoulders: '窄肩微溜',              // 肩膀：宽窄/平溜/厚薄
      chest:     '胸廓纤薄',              // 胸部骨架：宽厚/纤薄/肋骨形态
      waist:     '腰肢纤细，腰线优美',    // 腰身：粗细/腰线/腰臀比
      hips:      '窄臀，骨盆不大',        // 臀部/胯部：宽窄/骨盆形状

      figure: '纤细',       // 整体体型：骨瘦如柴/纤细/苗条/匀称/丰腴/丰满/肥胖/健壮
      height: '偏高',       // 身高：矮小/偏矮/中等/偏高/高挑/高大
      build:  '柔软',       // 体质结实度：干瘦/纤细/柔软/紧实/健硕/臃肿/松垮

      hands: '十指修长，指尖圆润，掌心有薄茧',  // 手部描写
      feet:  '纤长，足弓明显',                  // 足部描写

    },

    // ━━━ 2-3 肤发 ━━━
    skinHair: {                       // 肤发[顶层模块]

      skin: {                           // 皮肤
        color:      '白皙',       // 苍白/白皙/偏黄/小麦/蜜色/古铜/黝黑/灰败
        texture:    '细腻',       // 粗糙/偏粗/普通/细腻/光滑
        moisture:   '偏干',       // 龟裂/偏干/普通/滋润/油性
        blemishes:  '左肩三颗小痣',             // 瑕疵/胎记
        tanLines:   '项圈下方一圈浅色印记',     // 晒痕
        calluses:   '脚掌有薄茧，指尖无茧',     // 老茧分布
      },

      bodyHair: {        // 非性器官部位体毛
        arms:   '稀疏',  // 稀疏/茂密/无/剃净
        legs:   '稀疏细软',    // 腿部体毛
        armpit: '稀疏',    // 腋下体毛
        belly:  '无',       // 腹部体毛
        back:   '无',       // 背部体毛
      },

      nails: {                         // 指甲
        fingernails: '修剪整齐，不涂蔻丹',  // 手指甲
        toenails:    '修剪整齐，没有涂色',  // 脚趾甲
        cleanliness: '干净',                // 清洁度
      },

    },

    // ━━━ 2-4 印记 ━━━
    marks: {                       // 印记[顶层模块]

      scars:      '后背肩胛骨有一道三寸旧疤',  // 疤痕/纹身/胎记
      tattoos:    null,     // ! 只能用 null 或字符串，不支持数组（无）
      piercings:  '耳垂各有一个普通的银耳环',   // 穿刺描述

    },

    // ━━━ 2-5 声息 ━━━
    voiceScent: {                       // 声息[顶层模块]

      voice:      '声音清脆，带有异域口音',  // 嗓音描写

      scent: {                           // 体味结构：overall/breath/armpits/skin/hair/genitals/feet/notes
        overall:    '皂角清香混着体香',          // 体骚/狐臭/陈年汗臭/精臊/药味/酒馊
        breath:     '干净，隐约有薄荷味',         // 烟臭/酒馊/蒜臭/精液味/胃酸腐臭/粪臭
        armpits:    '淡汗味混皂角香',            // 汗骚/狐臭/酸馊/腋毛积臭
        skin:       '干净的体温气息',             // 汗垢/油脂/精液/药味/粪渣/老泥垢
        hair:       '皂角为主，发尾有油脂味',    // 油馊/头垢/汗臭/精味/屎味/桂香
        genitals:   '干净清爽，皂香为主',         // 淫水骚/精液腥/白带酸腐/尿骚/脓臭/屎味
        feet:       '走了路有潮气但不臭',         // 汗臭/酸馊/烂泥/茧皮臭
        notes:      '保持每天清洁的习惯',         // 清洁习惯/体味变化/对方反应
      },

    },


  },
  // ════════════════════════════════════════════════
  //  三、衣着
  // ════════════════════════════════════════════════
  attire: {                            // 衣着[区块]

    // ━━━ 3-1 衣着 ━━━
    clothing: {                       // 衣着[顶层模块]

      attireStyle: '朴素',   // 清纯/朴素/风尘/富贵/华美/异域/破旧/不整
      top:         '洗得发白的粗麻布短衫',    // 上装
      bottom:      '同色粗麻裙，长及脚踝',     // 下装
      underwear:   '粗棉布裹胸和衬裤',          // 内衣
      outerwear:   null,     // 外衣/外套（无）
      headwear:    null,     // 头饰/帽子（无）

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
        type:         '短袜',     // 短袜/长袜/丝袜/吊带袜/过膝袜/腿套/网袜/绑带/链袜/系带
        color:        '白色',     // 袜子颜色
        material:     '棉',       // 棉/尼龙/蕾丝/网眼/皮革/金属链
        thighHigh:    false,      // 是否过膝
        garter:       false,      // 是否吊带
        openCrotch:   false,      // 是否开裆
        chain:        false,      // 是否链式系带
        notes:        '普通的白棉袜',
      },

      footwear: {                       // 鞋子
        type:         '布鞋',    // 赤脚/草鞋/布鞋/绣鞋/木屐/皮靴/高跟鞋
        material:     '粗棉布',  // 材质
        color:        '黑色',    // 鞋子颜色
        condition:    '半旧',    // 状况
        heelHeight:   '平底',    // 平底/低跟/中跟/高跟/超高跟
        notes:        '普通的粗棉布鞋',
      },

    },

    // ━━━ 3-3 饰品 ━━━
    ornaments: {                       // 饰品[顶层模块]

      accessories: {                        // 饰品
        neck:     '银项链',   // 颈部饰品
        ears:     '银耳环',   // 耳部饰品
        wrists:   '玉镯',     // 手腕饰品
        fingers:  '银戒指',   // 手指饰品
        anklets:  '脚链',     // 脚链/脚镯
        other:    '小荷包',   // 其他饰品
      },


    },

  },

  // ════════════════════════════════════════════════
  //  四、性特征
  // ════════════════════════════════════════════════
  sexOrgans: {                            // 性特征[区块]

    // ━━━ 4-1 足部 ━━━

    feet: {                              // 足部[顶层模块]
      shape:        '端正',     // 脚型
      length:       '普通',     // 大小
      toes:         '整齐',     // 脚趾
      soles:        '有薄茧',    // 脚掌
      cleanliness:  '干净',     // 清洁度
      scent:        '略带潮气',     // 汗酸/泥味/茧皮臭/干净
      arch:         '普通',     // 足弓
      legs:         '修长',     // 腿型
      thighs:       '匀称',     // 大腿
      calves:       '纤细',     // 小腿
      notes:        '普通的脚', // 备注
    },

    // ━━━ 4-2 胸部 ━━━

    breasts: {                        // 胸部[顶层模块]
      size:     '一手可握',   // 大小
      shape:    '水滴形',     // 形状
      firmness: '挺拔',       // 坚挺度
      cleavage: '中等深度',     // 乳沟
      hang:     '无垂感',  // 垂感
      scent:    '淡淡的汗味和乳香',    // 汗味/乳香/皂味/骚/奶酸
      lactation: false,       // 是否泌乳
      notes:    null,          // 胸部备注（无）
    },

    // ━━━ 4-3 乳头 ━━━

    nipples: {                      // 乳头[顶层模块]
      size:       '小颗',        // 乳头大小
      color:      '粉红',        // 乳头颜色
      shape:      '圆润突起',    // 乳头形状
      areola:     '淡粉色',      // 乳晕描述
      areolaSize: '小巧',              // 乳晕大小
      erectile:   '遇冷凸起',    // 勃起状态
      sensitivity: '普通',       // 敏感度
      piercing:   false,    // 是否穿刺
    },

    // ━━━ 4-4 小穴 ━━━

    pussy: {                          // 小穴[顶层模块]
      condition:  '正常',          // 功能状态
      pubicHair:  '倒三角修剪整齐', // 阴毛
      scent:      '皂味底下有股淡淡的骚',    // 淫水骚/精液腥/尿骚/白带酸腐/干净
      appearance: '外阴饱满',      // 外观
      color:      '淡褐',                // 颜色
      notes:      null,                  // 小穴备注（无）

      clitoris: {                     // 阴蒂
        glans:      '米粒',         // 阴蒂头大小
        hood:       '包皮覆盖',     // 包皮状态
        sensitivity: '普通',         // 敏感度
        piercing:   false,           // 是否穿刺
      },

      labia: {                        // 阴唇
        majora:   '饱满',            // 大阴唇
        minora:   '紧贴',            // 小阴唇
        symmetry: '对称',            // 对称性
        color:    '淡褐',            // 颜色
        piercing: false,             // 是否穿刺
      },

      vagina: {                       // 阴道
        tightness:  '紧',            // 紧致度
        wetness:    '正常',          // 湿润度
        depth:      '正常',          // 深度
        hymen:      '完整',          // 处女膜
        cervix:     '正常',          // 宫颈
        gspot:      '位置偏深',      // G点
        taste:      '咸腥',          // 味道
        sensation:  '普通',                // 内部敏感度
        pubicBone:  '正常',                // 耻骨
        note:       '有经验',        // 备注
      },
    },

    // ━━━ 4-5 肛门 ━━━

    anus: {                           // 肛门[顶层模块]
      appearance:   '浅褐色干净',  // 外观
      hair:         '无',                // 肛毛
      scent:        '干净，括约肌有淡淡的腥',        // 屎味/腥/屁味/干净/肛渍骚
      cleanliness:  '干净',          // 清洁度
      sensitivity:  '未知',          // 敏感度
      preparation:  '未使用过',      // 扩张状态
      notes:      null,                    // 肛门备注（无）
    },


  },
  // ════════════════════════════════════════════════
  //  五、性能力
  // ════════════════════════════════════════════════
  sexualCapability: {                            // 性能力[区块]

    // ━━━ 5-1 基本性能力 ━━━

    sexualAbility: {                     // 性能力[顶层模块]

      // ──── 性唤起 ────
      arousal: {                         // 性唤起[子模块]
        nippleErection:        '挺立',   // 乳头勃起：无/微凸/挺立/硬挺/极度敏感
        breastEnlargement:     '胀大',   // 乳房胀大：无变化/轻微胀大/明显胀大/紧绷
        clitoralErection:      '明显',   // 阴蒂勃起：无/微勃/明显/坚硬突出
        glansExposure:         '半露',   // 阴蒂头露出：包埋/半露/全露/翻开
        sizeChange:            '略肿',   // 阴蒂肿胀：唤起后阴蒂肿胀胀大的程度
        labiaSwelling:         '轻微肿胀', // 阴唇肿胀：无变化/轻微肿胀/明显肿胀/外翻
        vaginalMoisture:       '湿润',   // 阴道湿润：干涩/微润/湿润/潮湿
        vaginalContract:       '轻微',   // 阴道节律性收缩：无/轻微/明显/剧烈
        speed:                 '正常',   // 唤起速度：缓慢/正常/快速/一碰就湿
        spontaneousArousal:    '偶尔',   // 自发性唤起：无/偶尔/容易/经常
        morningWetness:        '偶尔',   // 晨湿：无/偶尔/经常/每天
        dailyDischarge:        '少量',   // 日常分泌物：无/少量/正常/较多/内裤常湿
      },

      // ──── 高潮能力 ────
      orgasmic: {                        // 高潮能力[子模块]
        // 高潮方面
        speed:    '正常',                // 高潮速度：极慢/缓慢/正常/快速/一碰就高潮
        control:  '可控制',              // 高潮控制力：无法控制/勉强可忍/可控制/完全控制

        // 体液方面（淫水）
        fluidVolume:     '正常',          // 淫水分泌量：无/很少/偏少/正常/多/非常多
        storage:         '充足',          // 淫水储存量：充足/偏少/枯竭
        fluidViscosity:  '偏稀',          // 淫水粘稠度：稀薄如水/偏稀/正常/较稠/浓稠带丝
        fluidColor:      '透明',          // 淫水颜色：透明/乳白/淡黄
        fluidTaste:      '微咸',          // 淫水味道：无味/微咸/微甜/腥/复杂

        // 体液方面（潮吹）
        squirt:          '无',            // 潮吹：无/偶尔/经常/大量
        squirtVolume:    '正常',          // 潮吹量：很少/偏少/正常/多/大量
        squirtStorage:   '充足',          // 潮吹储存量：充足/偏少/枯竭
        squirtViscosity: '偏稀',          // 潮吹粘稠度：稀薄如水/偏稀/正常/较稠
        squirtColor:     '透明',          // 潮吹颜色：透明/乳白/淡黄
        squirtTaste:     '微咸',          // 潮吹味道：无味/微咸/微甜/腥/复杂
      },

      // ──── 性行为中的失禁 ────
      sexualIncontinence: {              // 性行为中的失禁[子模块]
        vaginalAir: {
          has: false,
          desc: null,
        },  // 是否阴吹 / 描述
        flatulence: {
          has: false,
          desc: null,
        },  // 是否放屁 / 描述
        urine: {
          has: false,
          desc: null,
        },  // 是否尿液失禁 / 描述
        feces: {
          has: false,
          desc: null,
        },  // 是否粪便失禁 / 描述
      },
    },

    // ━━━ 5-2 高潮反应（6器官乘6维度）━━━

    orgasmReaction: {                 // 高潮反应[顶层模块]

      // 6器官：乳头 、 阴蒂 、 阴道 、 肛门 、 尿道 、 子宫
      // 6维度：内部感觉 / 面部 / 声音 / 身体 / 器官反应 / 器官特有

      // ──── 乳头[子模块] ────
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
          yinShui: {
            has: false,
            desc: null,
          },
          squirt: {
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

      // ──── 阴蒂[子模块] ────
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
          yinShui: {
            has: false,
            desc: null,
          },
          squirt: {
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

      // ──── 阴道[子模块] ────
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
          yinShui: {
            has: false,
            desc: null,
          },
          squirt: {
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

      // ──── 肛门[子模块] ────
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
          yinShui: {
            has: false,
            desc: null,
          },
          squirt: {
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

      // ──── 尿道[子模块] ────
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
          yinShui: {
            has: false,
            desc: null,
          },
          squirt: {
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

      // ──── 子宫[子模块] ────
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
          yinShui: {
            has: false,
            desc: null,
          },
          squirt: {
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

    // ━━━ 5-3 高潮后刺激（6器官乘6维度）━━━

    postOrgasmOverstimulation: {      // 高潮后刺激[顶层模块]

      // 6器官：乳头、阴蒂、阴道、肛门、尿道、子宫

      // ──── 乳头[子模块] ────
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
          nippleSecretion: '透明渗出',
          clitoralErection: {
            has: true,
            desc: '阴蒂反应',
          },
          yinShui: {
            has: false,
            desc: null,
          },
          squirt: {
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

      // ──── 阴蒂[子模块] ────
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
          yinShui: {
            has: false,
            desc: null,
          },
          squirt: {
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

      // ──── 阴道[子模块] ────
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
          yinShui: {
            has: true,
            desc: '淫水泛滥',
          },
          squirt: {
            has: true,
            desc: '可被反复触发',
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

      // ──── 肛门[子模块] ────
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
          yinShui: {
            has: false,
            desc: null,
          },
          squirt: {
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

      // ──── 尿道[子模块] ────
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
          handAction: '想推开',
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
          yinShui: {
            has: false,
            desc: null,
          },
          squirt: {
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

      // ──── 子宫[子模块] ────
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
          yinShui: {
            has: false,
            desc: null,
          },
          squirt: {
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
      partnerCount: 0,       // 性交总人次（同一人做多次重复计数）

      female: {
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
      male: {
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
      firstTime:      null,     // 第一次性经历（描述，越过各性别的细分直接的总览）
      mostShameful:   null,     // 最羞耻的一次
      best:           null,     // 最佳体验
      worst:           null,     // 最差体验
    },

    // ━━━ 6-2 身体数据统计 ━━━

    bodyStats: {                   // 身体数据[顶层模块]
      // ──── 阴道[子模块] ────
      vagina: {                       // 阴道[子模块]
        uniquePartnerCount: {
          count: 0,
          desc: null,
        },  // 阴道性交总人数（去重）
        maxPartnerSession: {
          count: 0,
          desc: null,
        },  // 阴道单次最多伴侣数
        clitMasturbationCount: {
          count: 0,
          desc: null,
        },  // 阴蒂自慰次数
        clitOrgasmCount: {
          count: 0,
          desc: null,
        },  // 阴蒂高潮次数
        clitSquirtCount: {
          count: 0,
          desc: null,
        },  // 阴蒂潮吹次数
        clitIncontinenceCount: {
          count: 0,
          desc: null,
        },  // 阴蒂高潮失禁次数
        clitComaCount: {
          count: 0,
          desc: null,
        },  // 阴蒂高潮昏迷次数
        masturbationCount: {
          count: 0,
          desc: null,
        },  // 阴道自慰次数
        orgasmCount: {
          count: 0,
          desc: null,
        },  // 阴道高潮次数
        squirtCount: {
          count: 0,
          desc: null,
        },  // 阴道潮吹次数
        incontinenceCount: {
          count: 0,
          desc: null,
        },  // 阴道高潮失禁次数
        comaCount: {
          count: 0,
          desc: null,
        },  // 阴道高潮昏迷次数
        pregnancyCount: {
          count: 0,
          desc: null,
        },  // 怀孕次数
        abortionCount: {
          count: 0,
          desc: null,
        },  // 堕胎次数
      },

      // ──── 肛门[子模块] ────
      anus: {                           // 肛门[子模块]
        uniquePartnerCount: {
          count: 0,
          desc: null,
        },  // 肛门性交总人数（去重）
        maxPartnerSession: {
          count: 0,
          desc: null,
        },  // 肛门单次最多伴侣数
        masturbationCount: {
          count: 0,
          desc: null,
        },  // 肛门自慰次数
        orgasmCount: {
          count: 0,
          desc: null,
        },  // 肛门高潮次数
        incontinenceCount: {
          count: 0,
          desc: null,
        },  // 肛门高潮失禁次数
        comaCount: {
          count: 0,
          desc: null,
        },  // 肛门高潮昏迷次数
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
      oral: {                                   // 口交破处
        status:      '未破',                    // 状态
        age:         null,                      // 年龄（无）
        partner:     null,                      // 对象（无）
        circumstance: null,                     // 情境（无）
        forced:      false,                     // 是否被迫
        notes:       null,                      // 备注（无）
      },
      vaginal: {                      // 阴道
        status:      '未破',                    // 状态
        age:         null,                      // 年龄（无）
        partner:     null,                      // 对象（无）
        circumstance: null,                     // 情境（无）
        pain:        null,                      // 疼痛程度（无）
        bleeding:    null,                      // 出血情况（无）
        forced:      false,                     // 是否被迫
        notes:       null,                      // 备注（无）
      },
      urethral: {                               // 尿道破处
        status:      '未破',                    // 状态
        age:         null,                      // 年龄（无）
        partner:     null,                      // 对象（无）
        circumstance: null,                     // 情境（无）
        pain:        null,                      // 疼痛程度（无）
        bleeding:    null,                      // 出血情况（无）
        forced:      false,                     // 是否被迫
        notes:       null,                      // 备注（无）
      },
      anal: {                                   // 肛门破处
        status:      '未破',                    // 状态
        age:         null,                      // 年龄（无）
        partner:     null,                      // 对象（无）
        circumstance: null,                     // 情境（无）
        pain:        null,                      // 疼痛程度（无）
        bleeding:    null,                      // 出血情况（无）
        forced:      false,                     // 是否被迫
        notes:       null,                      // 备注（无）
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
        notes:       null,           // 备注
      },
      urethral: {                    // 尿道高潮
        status:      '未',           // 已/未
        age:         null,           // 年龄
        method:      null,           // 方式
        partner:     null,           // 对象
        circumstance: null,          // 情境
        sensation:   null,           // 感受
        notes:       null,           // 备注
      },
      anal: {                        // 肛门高潮
        status:      '未',           // 已/未
        age:         null,           // 年龄
        method:      null,           // 方式
        partner:     null,           // 对象
        circumstance: null,          // 情境
        sensation:   null,           // 感受
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
      squirt: {                      // 潮吹
        status:      '未',           // 已/未
        age:         null,           // 年龄
        partner:     null,           // 对象
        circumstance: null,          // 情境
        volume:      null,           // 量
        sensation:   null,           // 感受
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
      conception: {                  // 首次受孕
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
    },


  },
  // ════════════════════════════════════════════════
  //  八、性偏好
  // ════════════════════════════════════════════════
  sexualPreferences: {                            // 性偏好[区块]

    // ━━━ 8-1 器官偏好 ━━━

    organPreferences: {                  // 器官偏好[顶层模块]

      // ──── 乳头[子模块] ────

      nipples: {                         // 乳头偏好[子模块]
        method:     '按摩',              // 方式偏好：震动/按摩/电击/拍打/温度
        type:       '外部刺激',          // 类型偏好：插入式/外部刺激
        pain:       '完全不行',          // 痛苦偏好：完全不行/轻微可以/喜欢/很享受
        shame:      '有点羞',            // 羞耻度：不觉得羞/有点羞/很害羞/羞得不行
        desire:     '偶尔想要',          // 渴望度：不想要/偶尔想要/挺想要的/天天想
        care:       '有点在乎',          // 在乎程度：不在乎/有点在乎/挺在乎/非常在意
        feeling:    '有点奇怪的感觉',    // 感受

        specific: {                      // 器官特有[子模块]
          biting:   '完全不行',          // 撕咬拉扯：完全不行/轻微可以/喜欢/很享受
        },
      },

      // ──── 阴蒂[子模块] ────

      clitoris: {                        // 阴蒂偏好[子模块]
        method:     '震动',              // 方式偏好
        type:       '外部刺激',          // 类型偏好
        pain:       '轻微可以',          // 痛苦偏好
        shame:      '很害羞',            // 羞耻度
        desire:     '天天想',            // 渴望度
        care:       '非常在意',          // 在乎程度
        feeling:    '阴蒂是全身最敏感的地方', // 感受

        specific: {                      // 器官特有[子模块]
          speed:    '适中',              // 刺激速度：轻柔慢磨/适中/快速摩擦/极速抽插
        },
      },

      // ──── 阴道[子模块] ────

      vagina: {                          // 阴道偏好[子模块]
        method:     '按摩',              // 方式偏好
        type:       '插入式',            // 类型偏好
        pain:       '轻微可以',          // 痛苦偏好
        shame:      '不觉得羞',          // 羞耻度
        desire:     '挺想要的',          // 渴望度
        care:       '不在乎',            // 在乎程度
        feeling:    '被填满的感觉最舒服', // 感受

        specific: {                      // 器官特有[子模块]
          fullness: '适中',              // 填满感：浅插即可/适中/深顶/直抵子宫口
        },
      },

      // ──── 肛门[子模块] ────

      anus: {                            // 肛门偏好[子模块]
        method:     '按摩',              // 方式偏好
        type:       '插入式',            // 类型偏好
        pain:       '轻微可以',          // 痛苦偏好
        shame:      '很害羞',            // 羞耻度
        desire:     '不想要',            // 渴望度
        care:       '不在乎',            // 在乎程度
        feeling:    '那里太奇怪了',      // 感受

        specific: {                      // 器官特有[子模块]
          dilation: '完全不行',          // 扩张感：完全不行/可以接受/喜欢被撑开/越撑越爽
        },
      },

      // ──── 尿道[子模块] ────

      urethra: {                         // 尿道偏好[子模块]
        method:     '温度',              // 方式偏好
        type:       '插入式',            // 类型偏好
        pain:       '完全不行',          // 痛苦偏好
        shame:      '非常在意',          // 羞耻度
        desire:     '不想要',            // 渴望度
        care:       '非常在意',          // 在乎程度
        feeling:    '尿道刺激想都别想',  // 感受

        specific: {                      // 器官特有[子模块]
          depth:    '浅口即可',           // 深度喜好：浅口即可/可以深入/越深越好
        },
      },

      // ──── 子宫[子模块] ────

      uterus: {                          // 子宫偏好[子模块]
        method:     '按摩',              // 方式偏好
        type:       '插入式',            // 类型偏好
        pain:       '喜欢',              // 痛苦偏好
        shame:      '很害羞',            // 羞耻度
        desire:     '偶尔想要',          // 渴望度
        care:       '挺在乎',            // 在乎程度
        feeling:    '顶到最里面有点害怕但很刺激', // 感受

        specific: {                      // 器官特有[子模块]
          cervixImpact: '轻微可以',      // 宫颈撞击：完全不行/轻微可以/喜欢/很享受
        },
      },
    },

    // ━━━ 8-2 玩法偏好 ━━━

    playPreferences: {                   // 玩法偏好[顶层模块]

      // ──── 主动被动 ────

      initiative: {                      // 主动被动[子模块]
        active:     '完全不想',          // 主动（操人）：完全不想/偶尔想/喜欢/非常享受
        passive:    '喜欢',              // 被动（被操）：同上
      },

      // ──── 风格偏好 ────

      style:      '温和缠绵',            // 整体风格：轻柔抚慰/温和缠绵/适中/粗暴猛烈/狂野施虐

      // ──── 喜好部位 ────

      targetParts: [                     // 部位列表[子模块]
        '温柔的话',
        '被摸头',
        '亲吻手背',
        '被夸',
      ],

      // ──── 接受度 ────

      acceptance: {                      // 接受度[子模块]，以下各项四选一：完全不行/可以接受/喜欢/很享受
        bondage:       '完全不行',       // 捆绑
        filth:         '完全不行',       // 污秽（喝尿等）
        humiliation:   '完全不行',       // 羞辱
        exposure:      '完全不行',       // 露出
        toys:          '完全不行',       // 道具
        neglect:       '完全不行',       // 放置
        incontinence:  '完全不行',       // 失禁
      },

      // ──── 情调 ────

      atmosphere: {                      // 情调[子模块]
        petName: [                       // 称呼：性爱时喜欢被怎么叫/怎么叫对方
          '被夸漂亮',
        ],
        dirtyTalk: [                     // 性爱语言：做爱时爱说的话（多选）
          '表达爱意',
          '只发语气词',
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
        active:     '完全不想',          // 主动，喜不喜欢操睡着的人：完全不想/偶尔想/喜欢/非常享受
        passive:    '喜欢',              // 被动，自己睡着时喜不喜欢被操：同上
        acceptance: '喜欢',              // 接受度
        stage:      '浅睡中',            // 阶段：犯困时/浅睡中/深睡中
        thoughts:   null,                // 想法
      },

      // ──── 月经时 ────

      menstruation: {                    // 月经时[子模块]
        active:     '完全不想',
        passive:    '偶尔想',
        acceptance: '可以接受',
        stage:      '经前',
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

    // ━━━ 9-1 子宫状态 ━━━

    uterusStatus: {                       // 子宫状态[顶层模块]
      condition: '正常',        // 子宫功能状态
      position:  '前位',        // 子宫位置
      cervix:    '正常紧闭',    // 宫颈
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
      pms:        '情绪低落',           // 经前综合征
      notes:      null,                 // 备注（无）
    },

    // ━━━ 9-3 生育力 ━━━

    fertility: {                            // 生育力[顶层模块]
      status:       '可育',                 // 生育状态
      pregnancies:  0,                      // 怀孕次数
      births:       0,                      // 生产次数
      miscarriages: 0,                      // 流产次数
      abortions:    0,                      // 堕胎次数
      notes:        null,                   // 备注（无）
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

    // ━━━ 9-5 避孕 ━━━

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

      physical: '亚健康',        // 体质
      mental:   '脆弱',          // 精神

    },

    // ━━━ 10-2 疾病 ━━━
    diseases: {                       // 疾病[顶层模块]

      illnesses:  null,       // 患病记录（无）
      chronic:    '轻度营养不良',  // 慢性病

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
        attitude:   '冷漠带着戒备',     // 对他人的普遍态度
        temperament:    '骄傲',      // 气质
        stubbornness:   '极高',       // 倔强
        empathy:        '高',         // 同理心
        sociability:    '中',         // 社交
        ambition:       '极高',       // 野心
        mentalTraits: [                 // 特质
          '念旧',
          '渴望自由',
          '自尊心强',
        ],
        phobias: [                     // 恐惧症
          '密室',
          '被绑',
          '粗暴的男性',
        ],
        desires: [                     // 欲望
          '重获自由',
          '回到故乡',
          '复仇',
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
        cost:    566,                             // 日维护费 = 身价除以 100
        acquired: '购入',                         // 获取方式
        acquiredDate:  null,                      // 获取日期（无）

        contract: {                               // 契约
          type:        '卖身契',                  // 类型
          duration:    '终身',                    // 期限
          buyoutPrice: 113374,                   // 赎身价 = 身价乘 2
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
      stamina:      50,   // 体力：持久力
      strength:     40,   // 力量：肌肉力量
      agility:      45,   // 敏捷：灵活/速度
      intelligence: 82,   // 智力：学习能力
      knowledge:    60,   // 知识：学识储备
      obedience:    15,   // 服从：听话程度
    },

    // ━━━ 13-2 姿色属性 ━━━

    beauty: {                      // 姿色属性[顶层模块]
      face:     80,     // 容貌美：面容精致程度
      figure:   75,     // 身材美：体型曲线程度
      genital:  70,     // 性器美：性器官美观程度
    },

    // ━━━ 13-3 性爱属性 ━━━

    sex: {                         // 性爱属性[顶层模块]
      lust:        40,     // 性欲：性欲旺盛程度
      sensitivity: 40,    // 敏感度：整体敏感程度
      skill:       35,    // 性技巧：性技巧熟练度
    },

    // ━━━ 13-4 关系属性 ━━━

    relation: {                    // 关系属性[顶层模块]
      loyalty:     25,    // 忠诚：对主人的忠诚
      affection:   5,     // 好感：对主人的好感
      fear:        40,    // 恐惧：对主人的恐惧
    },

    // ━━━ 13-5 堕落属性 ━━━

    corruption: {                  // 堕落属性[顶层模块]
      promiscuity:    2,  // 淫乱度：滥交倾向
      exhibitionism:  1,  // 露出度：当众性行为接受度
      masochism:      5,  // 受虐度：享受被虐的程度
      perversion:     1,  // 变态度：变态嗜好的广度和深度
    },


  },
  // ════════════════════════════════════════════════
  //  十四、后台
  // ════════════════════════════════════════════════
  meta: {                            // 后台[区块]

    // ━━━ 14-1 标签 ━━━

    //  标签：从以下五大维度中自由选取，每维至少一个，具体值不限于列表
    //  1. 世界观：古代 / 现代 / 异界 / 未来 / 仙侠
    //  2. 职业：农女 / 舞者 / 书生 / 商人 / 刺客 / 罪犯 / 官员 / 猎手
    //  3. 阶层：王族 / 贵族 / 富有 / 贫困 / 奴隶 / 高价值 / 纤弱 / 有教养
    //  4. 身份：处子 / 成年 / 年轻 / 经验丰富 / 新手 / 逃亡 / 异域 / 野性
    //  5. 性格：冷漠 / 温和 / 叛逆 / 清纯 / 魅惑 / 危险 / 骄傲 / 怯懦 / 自由奔放
    //  以下仅为示例，生成本可自行选词组合：
    tags: [
      '古代',
      '贵族',
      '王族',
      '处子',
      '高价值',
    ],

    // ━━━ 14-2 标记 ━━━

    flags: {                          // 标记[顶层模块]
      metPlayer:       false,
      hadFirstSex:     false,
      attemptedEscape: false,
    },

    // ━━━ 14-3 备注 ━━━

    notes: '亡国公主，价值高但需小心处理。烈性难驯但不蠢。',  // 备注

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
