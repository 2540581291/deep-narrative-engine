// 男性角色 · 标准模板
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
// 6. 三级容器：区块有容器 / 节有容器 / 子模块有容器
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
//   身材：匀称精壮修长乘1.0 / 魁梧健硕乘0.9 / 干瘦矮小乘0.7 / 肥胖臃肿乘0.5
//   性格：温和顺从忠诚乘1.1 / 普通乘1.0 / 叛逆倔强阴郁乘0.85 / 危险暴力施虐乘0.7
//   技能每项加 500
//   日维护费 = price 除以 100    赎身价 = price 乘 2
//   白10万及以下 / 绿10到20万 / 蓝20到50万 / 紫50到100万 / 金100万以上
//   价格范围：残疾约158元 到 极品精灵男宠约180万元
//
// ━━━ 类型规范 ━━━
// 布尔用 true/false，数字用 Number，对象保持结构，数组用 Array
DATA.male = DATA.male || {};
DATA.male.template = {

  // ════════════════════════════════════════════════
  //  一、身份
  // ════════════════════════════════════════════════
  identity: {                            // 身份[区块]

    // ━━━ 1-1 基本信息 ━━━
    basicInfo: {                       // 基本信息[顶层模块]

      id:       'an_lin_yuan_wai',   // 唯一ID（英文小写+下划线）
      name:     '安林',                // 显示名称
      title:    '城东绸缎庄老板',      // 头衔/称号
      icon:     '👨‍💼',                  // 头像图标
      role:     '自由',                // 自由/已受邀/员工/奴隶/宠物/囚犯/罪奴/牲畜/工具/废料

      age:      47,                    // 等效人类年龄（整数，不要加岁）
      race:     '人族',                // 人族/精灵/兽人/魔族/天使/龙裔/异种
      gender:   '男性',                // 女性/男性/伪娘/扶她
      rarity:   '白',                  // 白/绿/蓝/紫/金
      price:    2701,                  // 身价/挂牌价（按定价公式计算），单位元，Number 类型

    },

    // ━━━ 1-2 出身背景 ━━━
    background: {                       // 出身背景[顶层模块]

      origin:       '绯红城本地',              // 出身地
      birthStatus:  '商贾',                     // 奴隶/平民/商贾/贵族/王族/异族
      family:       '三代经营绸缎庄，家底殷实。父母已故，有一妻一妾，两个儿子一个女儿',  // 家族背景：父母/兄弟姐妹/家族地位/现状
      upbringing:   '从小在商铺里摸爬滚打，算盘珠子比毛笔拿得早',  // 成长环境
      education:    '读过几年私塾，考了两次童生没过便安心做生意',  // 教育程度
      skills: [                        // 技能
        '算盘',
        '品鉴丝绸',
        '谈价',
        '应酬',
      ],

      talents: [                       // 天赋
        '商业嗅觉',
        '人脉广',
        '酒量差但爱喝',
      ],

      aura:       '挺着将军肚，满面油光，十根手指戴了六个金戒指，走路时沉甸甸的腰带坠子叮当作响',  // 整体气质印象

    },

    // ━━━ 1-3 经历 ━━━
    experience: {                       // 经历[顶层模块]

      currentOccupation: '绸缎庄老板',                 // 当前职业
      timeline:          '14岁开始在铺子里帮忙，20岁接手家业，30岁开了第一家当铺，45岁米铺开张',  // 时间线：几岁到几岁在做什么
      lifeOverview:     '三代经营绸缎庄，家底殷实。年轻时读了几年书，考了两次童生没过，父亲说算了，不是读书的料。二十岁父亲突发急病去世，他一夜之间扛起整个绸缎庄——那两年几乎没睡过一个整觉。三十岁开了第一家当铺，开始涉足放贷，渐渐在商圈站住了脚。四十岁时被人设局骗了一笔巨款，差点翻不了身，最后靠卖掉半间铺子和一张老脸借遍亲友才挺过来。如今五十出头，该有的都有了，但也觉得这辈子差不多就这样了。',  // 人生概述：不少于50字
      dailyLife:        '每天卯时起床，洗漱后到铺子里转一圈，看看新到的货，跟掌柜对一遍账目。午时回家吃饭，饭后在堂屋的藤椅上眯一觉。下午有时去当铺坐坐，有时去米铺看看，偶尔有生意上的朋友约去茶楼喝茶。傍晚回铺子收账，戌时关门。夜里一个人喝两盅黄酒，翻翻当天的账本，偶尔从抽屉里摸出那本压箱底的春宫图翻几页，叹口气，熄灯睡觉。',  // 当下日常：不少于50字
      sexualAwakening:  '第一次是在城东的暗娼巷里，十七岁，被几个年长的同窗拉去的。那个女人比他大好几岁，动作熟练得让他觉得自己像个被拆解的机器。他还没搞明白怎么回事就结束了，女人擦着腿说"小相公头一回吧"，他红着脸多塞了一块碎银。后来娶了妻，妻子是正经人家的女儿，床上规矩得很——熄灯、躺平、完事、翻身。他以为性事就是这么回事，直到在一次生意饭局后被带去青楼，才知道原来女人可以叫得那么好听。',  // 性的启蒙：不少于50字
      dailySexuality:   '妻子去世三年了，儿女都成了家，一个人守着老宅。不是没想过续弦，但到了这个年纪也懒得折腾了。城东的暗娼巷他去过几次，挑的都是年轻干净的姑娘，完事后给钱走人，不多说一句话。偶尔夜里喝多了酒，会想起年轻时在青楼里见过的那个花魁——其实也没做什么，就是她给他斟酒时指尖在他手背上停了一瞬。就那一瞬，他记了二十年。',  // 日常性事：不少于50字
      sexualDetails: [   // 性爱明细：按时间先后编号列出性相关事件（1. 2. 3. ...顺延，不限于4条）；每条详细描述，内容要充足，不能一句话带过
        '1. 17岁：被几个年长的同窗拉去城东暗娼巷开荤，那女人比他大好几岁，动作熟练得让他觉得自己像被拆解的机器。他还没弄明白就结束了，红着脸多塞了一块碎银，出了门一路走一路懊悔。',
        '2. 19岁：娶了妻子，是正经人家的女儿。头一晚她躺在喜床上绷得像块木板，说"灯熄了吧"。往后的十来年他们房事规矩得很，熄灯、躺平、完事、翻身，他一度以为天底下夫妻都这样。',
        '3. 35岁：一次生意饭局后被东家带去青楼，那个花魁斟酒时指尖在他手背上停了一瞬，夜里她叫得他头皮发麻。他头一回知道女人可以这样，那夜之后他再看妻子，总觉得差了点什么。',
        '4. 44岁：妻子病故后他隔三差五去暗娼巷，挑年轻干净的姑娘，完事给钱走人。偶尔喝多了会想起花魁那一瞬，他想过去青楼找她，又觉得老都老了，何必。',
      ],

    },


  },
  // ════════════════════════════════════════════════
  //  二、外貌
  // ════════════════════════════════════════════════
  appearance: {                            // 外貌[区块]

    // ━━━ 2-1 面容 ━━━
    facialFeatures: {                       // 面容[顶层模块]

      face:       '圆脸、酒糟鼻、一双眯缝眼总是色眯眯地打量人',  // 面容描写
      forehead:   '宽而油亮',                    // 额头：宽窄/高低/皱纹
      eyes:       '眯缝小眼，眼袋浮肿',        // 眼睛描写
      eyelashes:  '稀疏短小',                           // 睫毛
      eyebrows:   '粗眉散乱，眉尾下垂',           // 眉毛
      nose:       '酒糟鼻，鼻头红肿，毛孔粗大',          // 鼻子：高矮/鼻型/鼻翼
      lips:       '厚嘴唇，嘴角常挂油光',          // 嘴唇：厚薄/唇形/唇色/干裂
      teeth:      '门牙发黄，右侧缺了一小块',      // 牙齿：整齐/发黄/缺损/龅牙
      ears:       '招风耳，耳廓大',      // 耳朵：大小/形状/贴面/招风

      hair: {                           // 头发
        color:  '花白',                              // 发色
        length: '短发',                                 // 长度：板寸/齐耳/齐肩/及胸/及腰/及臀/及地
        texture:      '粗硬',                       // 发质：干枯/粗硬/普通/柔顺/丝滑
        thickness:    '稀疏',                           // 发量：稀疏/普通/浓密/厚重
        style:        '梳成背头，抹了桂花头油',   // 发型描述
        cleanliness:  '还算干净',                       // 清洁度：油腻肮脏/略有油光/还算干净/清爽/刚洗过
        notes:        '爱用桂花头油，发际线有点靠后',     // 其他备注
      },

      facialHair: '山羊胡，修剪整齐',     // 胡须描述（可选值：山羊胡/络腮胡/无须/短须/胡茬/长须）

    },

    // ━━━ 2-2 体态 ━━━
    bodyShape: {                       // 体态[顶层模块]

      shoulders: '宽肩厚背，虎背熊腰',              // 肩膀：宽窄/平溜/厚薄
      chest:     '胸肌松弛，有些赘肉',              // 胸部骨架：宽厚/纤薄/肋骨形态
      waist:     '腰围粗壮，微微发福',    // 腰身：粗细/腰线/腰臀比
      hips:      '窄臀，胯骨不明显',      // 臀部/胯部：宽窄/骨盆形状

      figure: '肥硕',   // 整体体型：干瘦/矮小/纤细/苗条/匀称/精壮/魁梧/健硕/肥硕/肥胖
      height: '中等',   // 身高：矮小/偏矮/中等/偏高/高挑/高大
      build:  '松垮',   // 体质结实度：干瘦/纤细/柔软/精干/紧实/健硕/臃肿/松垮

      hands: '手指粗短，指甲泛黄，右手食指和中指有烟渍',  // 手部描写
      feet:  '宽大厚实，脚趾有茧',                  // 足部描写

    },

    // ━━━ 2-3 肤发 ━━━
    skinHair: {                       // 肤发[顶层模块]

      skin: {                           // 皮肤
        color:      '偏黄',       // 苍白/白皙/偏黄/小麦/蜜色/古铜/黝黑/灰败
        texture:    '粗糙',       // 粗糙/偏粗/普通/细腻/光滑
        moisture:   '偏油',       // 龟裂/偏干/普通/滋润/油性
        blemishes:  '脸颊有酒槽红斑',             // 瑕疵/胎记
        tanLines:   '袖子口一圈晒痕',     // 晒痕
        calluses:   '掌心有老茧，指尖有烟渍',     // 老茧分布
      },

      bodyHair: {        // 非性器官部位体毛
        arms:   '茂密',  // 稀疏/茂密/无/剃净
        legs:   '茂密',    // 腿部体毛
        armpit: '茂密',    // 腋下体毛
        belly:  '浓密灰色卷毛',       // 腹部体毛
        back:   '稀疏',       // 背部体毛
      },

      nails: {                         // 指甲
        fingernails: '修剪不勤，指甲缝有灰',  // 手指甲
        toenails:    '懒得管',    // 脚趾甲
        cleanliness: '一般',                // 清洁度
      },

    },

    // ━━━ 2-4 印记 ━━━
    marks: {                       // 印记[顶层模块]

      scars:      '左眉一道旧刀疤',  // 疤痕/纹身/胎记
      tattoos:    null,     // 数据类型：null 或字符串；不支持数组（无）
      piercings:  null,             // 穿刺描述（无）

    },

    // ━━━ 2-5 声息 ━━━
    voiceScent: {                       // 声息[顶层模块]

      voice:      '粗哑中带着油滑，说话时唾沫星子横飞',  // 嗓音描写

      scent: {                           // 体味结构：overall/breath/armpits/skin/hair/genitals/feet/notes
        overall:    '浓郁酒味混着发油香，还带着一丝汗馊味',          // 体骚/狐臭/陈年汗臭/精臊/药味/酒馊
        breath:     '口臭明显，隐约有股腐臭味',         // 烟臭/酒馊/蒜臭/精液味/胃酸腐臭/粪臭
        armpits:    '汗馊味浓重',            // 汗骚/狐臭/酸馊/腋毛积臭
        skin:       '油脂味混着皂角香',             // 汗垢/油脂/精液/药味/粪渣/老泥垢
        hair:       '桂花头油为主，底下有点头油馊味',    // 油馊/头垢/汗臭/精味/屎味/桂香
        genitals:   '淡淡的尿骚味，不算太难闻',         // 淫水骚/精液腥/白带酸腐/尿骚/脓臭/屎味
        feet:       '穿了皮靴一整天，酸味重',         // 汗臭/酸馊/烂泥/茧皮臭
        notes:      '体味偏重，爱喷桂花油盖住，结果混在一起更冲',         // 清洁习惯/体味变化/对方反应
      },

    },


  },
  // ════════════════════════════════════════════════
  //  三、衣着
  // ════════════════════════════════════════════════
  attire: {                            // 衣着[区块]

    // ━━━ 3-1 衣着 ━━━
    clothing: {                       // 衣着[顶层模块]

      attireStyle: '富贵',   // 朴素/富贵/华美/官气/异域/破旧/考究
      top:         '湖蓝色绸缎长袍',    // 上装
      bottom:      null,     // 下装（长袍一体，无单独下装）
      underwear:   '白色棉布内裤',          // 内衣
      outerwear:   null,     // 外衣/外套（无）
      headwear:    '员外帽',     // 头饰/帽子

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
        type:         '布袜',     // 短袜/长袜/布袜/绑腿
        color:        '白色',     // 袜子颜色
        material:     '棉布',       // 棉/尼龙/丝绸/棉布
        thighHigh:    false,      // 是否过膝
        garter:       false,      // 是否吊带
        openCrotch:   false,      // 是否开裆
        chain:        false,      // 是否链式系带
        notes:        '普通的白布袜',
      },

      footwear: {                       // 鞋子
        type:         '皂靴',    // 赤脚/草鞋/布鞋/靴子/皮鞋/木屐
        material:     '缎面',  // 材质
        color:        '黑色',    // 鞋子颜色
        condition:    '七成新',    // 状况
        heelHeight:   '平底',    // 平底/低跟/中跟/高跟/超高跟
        notes:        '粉底皂靴，鞋底沾了些泥',
      },

    },

    // ━━━ 3-3 饰品 ━━━
    ornaments: {                       // 饰品[顶层模块]

      accessories: {                        // 饰品
        neck:     '玉牌挂坠',   // 颈部饰品
        ears:     null,   // 耳部饰品（无）
        wrists:   '玉镯',   // 手腕饰品
        fingers:  '六个金戒指',   // 手指饰品
        anklets:  null,     // 脚链/脚镯（无）
        other:    '腰间玉佩和钱袋',   // 其他饰品
      },


    },

  },

  // ════════════════════════════════════════════════
  //  四、性特征
  // ════════════════════════════════════════════════
  sexOrgans: {                            // 性特征[区块]

    // ━━━ 4-1 包皮 ━━━

    foreskin: {                       // 包皮[顶层模块]
      status:    '已割',              // 已割/包皮过长/包茎/正常
      type:      null,                // 包皮类型（无）
      phimosis:  false,               // 是否包茎
      smegma:    '少量',              // 包皮垢：无/少量/中等/大量/有异味
      scent:     '淡淡的尿骚味，包皮垢的腥味',  // 气味
      hygiene:   '良好',              // 包皮卫生
      notes:     null,                // 包皮备注（无）
    },

    // ━━━ 4-2 龟头 ━━━

    glans: {                          // 龟头[顶层模块]
      size:       '棱角分明',         // 龟头大小
      color:      '暗紫',             // 颜色
      hood:       '完全外露',         // 包皮覆盖状态
      scent:      '淡淡的尿骚味',     // 气味
      piercing:   false,              // 是否穿刺
      notes:      '龟头颜色偏紫黑，看得出纵欲过度',  // 龟头备注
    },

    // ━━━ 4-3 阴茎 ━━━

    penis: {                          // 阴茎体[顶层模块]
      length:     '中等偏短',         // 长度
      girth:      '偏粗',             // 粗细
      shape:      '微弯上翘，龟头呈蘑菇状',  // 整体形状
      curvature:  '轻微左弯',         // 弯曲度
      veins:      '明显，勃起时青筋暴起',    // 血管
      scent:      '淡淡的尿骚味',     // 精液腥/尿骚/汗味/干净
    },

    // ━━━ 4-4 阴囊 ━━━

    scrotum: {                        // 阴囊[顶层模块]
      size:       '普通',             // 大小
      hang:       '下垂明显',         // 下垂度
      color:      '深褐色',           // 颜色
      hair:       '稀疏',             // 阴囊毛
      scent:      '淡淡的汗味混着皮脂味',  // 气味
      notes:      '纵欲过度的颜色',   // 备注
    },

    // ━━━ 4-5 肛门 ━━━

    anus: {                           // 肛门[顶层模块]
      appearance:   '深褐色，括约肌松弛',  // 外观
      hair:         '少量',                // 肛毛
      scent:        '擦拭不彻底，有淡淡的粪臭',        // 屎味/腥/屁味/干净/肛渍骚
      cleanliness:  '一般',          // 清洁度
      sensitivity:  '低',            // 敏感度
      preparation:  '偶尔被动扩张过',      // 扩张状态
      notes:      null,                    // 肛门备注（无）
    },


  },
  // ════════════════════════════════════════════════
  //  五、性能力
  // ════════════════════════════════════════════════
  sexualCapability: {                            // 性能力[区块]

    // ━━━ 5-1 基本性能力 ━━━

    sexualAbility: {                     // 基本性能力[顶层模块]

      // ──── 勃起功能 ────
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

      // ──── 射精能力 ────
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
        storage:    '充足',              // 精液储存量：充足/偏少/枯竭，不足时稀薄如水、颜色透明
      },

      // ──── 性行为中的失禁 ────
      sexualIncontinence: {              // 性行为中的失禁[子模块]
        semenLeak: {
          has: false,
          desc: null,
        },  // 是否高潮后不自觉流精 / 描述
        urine: {
          has: false,
          desc: null,
        },  // 是否性行为中尿液失禁 / 描述
        feces: {
          has: false,
          desc: null,
        },  // 是否性行为中粪便失禁 / 描述
      },
    },

    // ━━━ 5-2 高潮反应（2器官乘6维度）━━━━

    orgasmReaction: {                 // 高潮反应[顶层模块]

      // 2器官：glans 、 penis（男性无前列腺和乳头）
      // 6维度：内部感觉 / 面部 / 声音 / 身体 / 器官反应 / 器官特有

      // ──── 龟头[子模块] ────
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
          erection: {
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
          scrotumContract: {
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

      // ──── 阴茎[子模块] ────
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
          erection: {
            has: true,
            desc: '射精中持续勃起',
          },
          preCum: {
            has: false,
            desc: null,
          },
          ejaculation: {
            has: true,
            desc: '射精',
          },
          scrotumContract: {
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
    },

    // ━━━ 5-3 高潮后刺激（2器官乘6维度）━━━━

    postOrgasmOverstimulation: {      // 高潮后刺激[顶层模块]

      // 2器官：龟头、阴茎

      // ──── 龟头[子模块] ────
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
          erection: {
            has: false,
            desc: '射精后已软',
          },
          preCum: {
            has: false,
            desc: null,
          },
          ejaculation: {
            has: false,
            desc: '已射空',
          },
          scrotumContract: {
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

      // ──── 阴茎[子模块] ────
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
          erection: {
            has: false,
            desc: '已软',
          },
          preCum: {
            has: false,
            desc: null,
          },
          ejaculation: {
            has: false,
            desc: null,
          },
          scrotumContract: {
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
    },


  },
  // ════════════════════════════════════════════════
  //  六、性历史
  // ════════════════════════════════════════════════
  sexualHistory: {                            // 性历史[区块]

    // ━━━ 6-1 性史概览 ━━━

    milestones: {                  // 性史概览[顶层模块]
      // ──── 各性别人数 ────
      partnerCount: 30,      // 性交总人次（同一人做多次重复计数）

      female: {
        count: 28,
        desc: '妓院常客，以阴道交为主，偶尔口交',
        firstTime: {
          partner: '邻居家姐姐',
          desc: '十六岁被邻居家姐姐半引诱半强迫地拉进柴房',
        },  // 第一次：描述 / 对象
        mostShameful: {
          partner: null,
          desc: null,
        },  // 最羞耻：描述 / 对象
        best: {
          partner: '花魁',
          desc: '新来的花魁吹箫功夫一流，差点当场缴械',
        },  // 最佳体验：描述 / 对象
        worst: {
          partner: null,
          desc: null,
        },  // 最差体验：描述 / 对象
      },
      male: {
        count: 2,
        desc: '酒后和同僚互撸过几次',
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
      firstTime:      '十六岁被邻居家姐姐半引诱半强迫地拉进柴房',
      mostShameful:   '第一次嫖妓紧张得硬不起来，被妓女笑话了半天',
      best:           '新来的花魁吹箫功夫一流，差点当场缴械',
      worst:           null,
    },

    // ━━━ 6-2 身体数据统计 ━━━

    bodyStats: {                   // 身体数据[顶层模块]
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
      ejaculationCount: {
        count: 0,
        desc: null,
      },  // 射精次数
      incontinenceCount: {
        count: 0,
        desc: null,
      },  // 高潮失禁次数
      comaCount: {
        count: 0,
        desc: null,
      },  // 高潮昏迷次数

      // ──── 其他（杂项统计）────
      other: {
        maxEjaculationPerDay: {
          count: 0,
          desc: null,
        },  // 最多一天射精次数
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
        status:      '已破',        // 已破/未破
        age:         14,            // 年龄
        partner:     '自行',        // 对象
        circumstance: '梦中遗精',   // 情境
        forced:      false,         // 是否被迫
        notes:       '第一次射精是梦遗，醒来又惊又羞',  // 备注
      },
    },

    // ━━━ 7-2 首次高潮记录 ━━━

    firstOrgasm: {                   // 首次高潮记录[顶层模块]
      glans: {                       // 龟头高潮
        status:      '已',           // 已/未
        age:         14,             // 年龄
        method:      '梦遗',         // 方式：自慰/梦遗/口交/被手交/其他
        partner:     '自行',         // 对象
        circumstance: '梦中',        // 情境
        sensation:   '困惑中带着快感',  // 感受
        ejaculated:  true,           // 是否同时射精
        notes:       '人生第一次高潮，醒来后摸到一床黏糊不知所措',  // 备注
      },
      penis: {                       // 阴茎高潮
        status:      '已',           // 已/未
        age:         14,             // 年龄
        method:      '梦遗',         // 方式
        partner:     '自行',         // 对象
        circumstance: '梦中',        // 情境
        sensation:   '从龟头蔓延到整根，痉挛式射精',  // 感受
        ejaculated:  true,           // 是否同时射精
        notes:       '和龟头高潮是同时发生的',      // 备注
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
      preCum: {                      // 先走汁
        status:      '已',           // 已/未
        age:         14,             // 年龄
        partner:     '自行',         // 对象
        circumstance: '第一次自慰时',  // 情境
        volume:      '少量',         // 量
        sensation:   '没注意到',     // 感受
        notes:       '自慰时发现龟头渗出透明液体',  // 备注
      },
    },


  },
  // ════════════════════════════════════════════════
  //  八、性偏好
  // ════════════════════════════════════════════════
  sexualPreferences: {                            // 性偏好[区块]

    // ━━━ 8-1 器官偏好 ━━━

    organPreferences: {                  // 器官偏好[顶层模块]

      // ──── 龟头[子模块] ────

      glans: {                           // 龟头偏好[子模块]
        method:     '按摩',              // 方式偏好：震动/按摩/电击/拍打/温度
        type:       '外部刺激',          // 类型偏好：插入式/外部刺激
        pain:       '轻微可以',          // 痛苦偏好：完全不行/轻微可以/喜欢/很享受
        shame:      '有点羞',            // 羞耻度：不觉得羞/有点羞/很害羞/羞得不行
        desire:     '挺想要的',          // 渴望度：不想要/偶尔想要/挺想要的/天天想
        care:       '挺在乎',            // 在乎程度：不在乎/有点在乎/挺在乎/非常在意
        feeling:    '龟头是男人最敏感的地方', // 感受：对此器官施加刺激时的心理想法

        specific: {                      // 器官特有[子模块]
          speed:    '适中',              // 刺激速度：轻柔慢磨/适中/快速摩擦/极速抽插
        },
      },

      // ──── 阴茎[子模块] ────

      penis: {                           // 阴茎偏好[子模块]
        method:     '按摩',              // 方式偏好
        type:       '插入式',            // 类型偏好
        pain:       '轻微可以',          // 痛苦偏好
        shame:      '有点羞',            // 羞耻度
        desire:     '挺想要的',          // 渴望度
        care:       '非常在意',          // 在乎程度
        feeling:    '操人的征服感比快感更让人上瘾', // 感受

        specific: {                      // 器官特有[子模块]
          ejaculation: '正常',           // 射精喜好：不喜欢射精/正常/喜欢射精/迷恋射精
        },
      },
    },

    // ━━━ 8-2 玩法偏好 ━━━

    playPreferences: {                   // 玩法偏好[顶层模块]

      // ──── 主动被动 ────

      initiative: {                      // 主动被动[子模块]
        active:     '非常享受',          // 主动（操人）：完全不想/偶尔想/喜欢/非常享受
        passive:    '偶尔想',            // 被动（被操）：完全不想/偶尔想/喜欢/非常享受
      },

      // ──── 风格偏好 ────

      style:      '粗暴猛烈',            // 整体风格：轻柔抚慰/温和缠绵/适中/粗暴猛烈/狂野施虐

      // ──── 喜好部位 ────

      targetParts: [                     // 部位列表[子模块]
        '足',
        '丝袜',
        '腋下',
        '胸',
      ],

      // ──── 接受度 ────

      acceptance: {                      // 接受度[子模块]，以下各项四选一：完全不行/可以接受/喜欢/很享受
        bondage:       '可以接受',       // 捆绑
        filth:         '完全不行',       // 污秽（喝尿等）
        humiliation:   '可以接受',       // 羞辱
        exposure:      '完全不行',       // 露出
        toys:          '完全不行',       // 道具
        neglect:       '完全不行',       // 放置
        incontinence:  '完全不行',       // 失禁
      },

      // ──── 情调 ────

      atmosphere: {                      // 情调[子模块]
        petName: [                       // 称呼：性爱时喜欢被怎么叫/怎么叫对方
          '骚货',
          '母狗',
        ],
        dirtyTalk: [                     // 性爱语言：做爱时爱说的话（多选）
          '辱骂对方',
          '说骚话',
        ],
        roleplay: {                      // 角色扮演[子模块]
          enjoy:     true,               // 是否喜欢角色扮演
          scenarios: [                   // 喜欢的剧本
            '医生与病人',
            '主人与奴隶',
            '老师与学生',
          ],
        },
      },
    },

    // ━━━ 8-3 特殊时期偏好 ━━━

    specialPeriod: {                     // 特殊时期偏好[顶层模块]

      // ──── 睡眠时 ────

      sleeping: {                        // 睡眠时[子模块]
        active:     '喜欢',              // 主动，喜不喜欢操睡着的人：完全不想/偶尔想/喜欢/非常享受
        passive:    '完全不想',          // 被动，自己睡着时喜不喜欢被操：同上
        acceptance: '可以接受',          // 接受度
        stage:      '深睡中',            // 阶段：犯困时/浅睡中/深睡中
        thoughts:   null,                // 想法
      },

      // ──── 月经时 ────

      menstruation: {                    // 月经时[子模块]
        active:     '完全不想',
        passive:    '完全不想',
        acceptance: '完全不行',
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

    // ━━━ 9-1 睾丸状态 ━━━

    testes: {                         // 睾丸[顶层模块]
      condition:  '正常',             // 正常/萎缩/隐睾/切除
      position:   '正常下垂',         // 正常下垂/高位/隐睾
      leftSize:   '正常',             // 左侧大小：偏小/正常/偏大
      rightSize:  '正常',             // 右侧大小：偏小/正常/偏大
      varicocele: false,              // 是否精索静脉曲张
      notes:      null,               // 备注（无）
    },

    // ━━━ 9-2 精液质量 ━━━

    semen: {                          // 精液[顶层模块]
      volume:     '较多',             // 偏少/正常/较多/非常多
      viscosity:  '中等偏稠',         // 稀薄如水/偏稀/中等/较稠/浓稠带块
      color:      '乳白',             // 乳白/淡黄/黄绿/带血/透明
      spermCount: '正常',             // 无精/少精/正常/多精
      motility:   '正常',             // 精子活力：无/弱/正常/强
      morphology: '正常',             // 精子形态：异常/正常
      notes:      null,               // 备注（无）
    },

    // ━━━ 9-3 生育力 ━━━

    fertility: {                      // 生育力[顶层模块]
      status:     '可育',             // 可育/不育/结扎/未知
      children:   3,                  // 已生育子女数
      proven:     true,               // 是否已验证生育能力
      notes:      null,               // 备注（无）
    },

    // ━━━ 9-4 前列腺健康 ━━━

    prostateHealth: {                 // 前列腺健康[顶层模块]
      condition:  '正常',             // 正常/炎症/增生/切除
      size:       '正常',             // 偏小/正常/偏大
      palpation:  '无异常',           // 指检结果：无异常/压痛/硬结/肿大
      inflammation: false,            // 是否前列腺炎
      hyperplasia:  false,            // 是否前列腺增生
      notes:      null,               // 备注（无）
    },

    // ━━━ 9-5 节育 ━━━

    contraception: {                  // 节育[顶层模块]
      using:         false,           // 是否采取节育措施
      method:        null,            // 方法（无）
      effectiveness: null,            // 效果（无）
      notes:         null,            // 备注（无）
    },


  },
  // ════════════════════════════════════════════════
  //  十、身体健康
  // ════════════════════════════════════════════════
  physicalHealth: {                            // 身体健康[区块]

    // ━━━ 10-1 体质 ━━━
    physique: {                       // 体质[顶层模块]

      physical: '亚健康',        // 体质
      mental:   '普通',          // 精神

    },

    // ━━━ 10-2 疾病 ━━━
    diseases: {                       // 疾病[顶层模块]

      illnesses:  null,       // 患病记录（无）
      chronic:    '轻度脂肪肝',  // 慢性病

      sti: {                                // 性病
        status:   '无',                      // 状态
        diseases: null,                      // 病种（无）
        history:  null,                      // 病史（无）
        notes:    '目前健康，没有性病史',       // 备注
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
        attitude:   '表面客气，骨子里奸猾',     // 对他人的普遍态度
        temperament:    '随和',      // 气质
        stubbornness:   '中',       // 倔强
        empathy:        '低',         // 同理心
        sociability:    '高',         // 社交
        ambition:       '中',       // 野心
        mentalTraits: [                 // 特质
          '贪财',
          '好色',
          '精明',
        ],
        phobias: [                     // 恐惧症
          '老婆发现',
        ],
        desires: [                     // 欲望
          '赚更多钱',
          '睡更多女人',
          '抱孙子',
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

      status:   '空闲',       // 空闲/工作中/休息/生病/休假
      location: '未派遣',     // 所在地

    },

    // ━━━ 12-2 消费统计 ━━━
    workStats: {                       // 工作状态[顶层模块]

      consumption: {                               // 消费统计
        visitCount:      12,                     // 来访次数
        totalSpent:      24000,                     // 累计消费
        lastVisit:        null,                  // 末次来访（无）
        satisfaction:     '还行',                  // 满意度
        isRegular:        true,                     // 是否常客
      },

    },

    // ━━━ 12-3 所有权 ━━━
    ownership: {                       // 所属关系[顶层模块]

      // ──── 12-3-1 所有权信息 ────
      detail: {                               // 所有权信息
        owner:   null,                            // 所有者（无）
        group:   null,                            // 所属团体（无）
        cost:    27,                              // 日维护费 = 身价除以 100
        acquired: '邀请',                         // 获取方式
        acquiredDate:  null,                      // 获取日期（无）

        contract: {                               // 契约
          type:        '合作契约',                  // 类型
          duration:    '不定期',                    // 期限
          buyoutPrice: 5402,                     // 赎身价 = 身价乘 2
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
      stamina:      40,   // 体力：持久力
      strength:     45,   // 力量：肌肉力量
      agility:      35,   // 敏捷：灵活/速度
      intelligence: 55,   // 智力：学习能力
      knowledge:    50,   // 知识：学识储备
      obedience:    20,   // 服从：听话程度（男性宾客不受此约束，纯参考）
    },

    // ━━━ 13-2 姿色属性 ━━━

    beauty: {                      // 姿色属性[顶层模块]
      face:     40,     // 容貌美：面容精致程度
      figure:   35,     // 身材美：体型曲线程度
      genital:  45,     // 性器美：性器官美观程度
    },

    // ━━━ 13-3 性爱属性 ━━━

    sex: {                         // 性爱属性[顶层模块]
      lust:        70,     // 性欲：性欲旺盛程度
      sensitivity: 35,    // 敏感度：整体敏感程度
      skill:       65,    // 性技巧：性技巧熟练度
    },

    // ━━━ 13-4 关系属性 ━━━

    relation: {                    // 关系属性[顶层模块]
      loyalty:     10,    // 忠诚：对主人的忠诚（宾客不适用）
      affection:   15,    // 好感：对玩家的好感
      fear:        5,     // 恐惧：对玩家的恐惧
    },

    // ━━━ 13-5 堕落属性 ━━━

    corruption: {                  // 堕落属性[顶层模块]
      promiscuity:    60,  // 淫乱度：滥交倾向
      exhibitionism:  20,  // 露出度：当众性行为接受度
      masochism:      10,  // 受虐度：享受被虐的程度
      perversion:     30,  // 变态度：变态嗜好的广度和深度
    },


  },
  // ════════════════════════════════════════════════
  //  十四、后台
  // ════════════════════════════════════════════════
  meta: {                            // 后台[区块]

    // ━━━ 14-1 标签 ━━━

    //  标签：从以下五大维度中自由选取，每维至少一个，具体值不限于列表
    //  1. 世界观：古代 / 现代 / 异界 / 未来 / 仙侠
    //  2. 职业：农人 / 商人 / 书生 / 官员 / 工匠 / 猎手 / 艺人 / 仆从 / 药师 / 战士 / 刺客
    //  3. 阶层：王族 / 贵族 / 富有 / 贫困 / 奴隶 / 高价值 / 纤弱 / 有教养
    //  4. 身份：处男 / 成年 / 年轻 / 中年 / 老年 / 经验丰富 / 异域 / 本地
    //  5. 性格：冷漠 / 温和 / 奸猾 / 好色 / 慷慨 / 吝啬 / 危险 / 骄傲 / 怯懦 / 随和
    //  以下仅为示例，生成本可自行选词组合：
    tags: [
      '古代',
      '商人',
      '富有',
      '中年',
      '好色',
      '本地',
    ],

    // ━━━ 14-2 标记 ━━━

    flags: {                          // 标记[顶层模块]
      metPlayer:       false,
      hadFirstSex:     false,
      attemptedEscape: false,
    },

    // ━━━ 14-3 备注 ━━━

    notes: '妓院常客，好色但出手大方。家里有老婆管着，从不过夜。',  // 备注

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
