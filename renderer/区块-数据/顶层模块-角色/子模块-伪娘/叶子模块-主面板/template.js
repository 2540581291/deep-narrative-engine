// 伪娘角色 · 标准模板
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
//   身材：匀称苗条纤细柔软乘1.0 / 丰腴丰满健壮乘0.9 / 骨瘦如柴干瘦乘0.7 / 肥胖臃肿松垮乘0.5
//   性格：顺从温和忠诚乘1.1 / 普通乘1.0 / 叛逆倔强阴郁乘0.85 / 危险暴力施虐乘0.7
//   技能每项加 500
//   日维护费 = price 除以 100    赎身价 = price 乘 2
//   白10万及以下 / 绿10到20万 / 蓝20到50万 / 紫50到100万 / 金100万以上
//   极值参考：残疾约158元 到 极品精灵伪娘约180万元
//
// ━━━ 类型规范 ━━━
// 布尔用 true/false，数字用 Number，对象保持结构，数组用 Array
DATA.femboy = DATA.femboy || {};
DATA.femboy.template = {

  // ════════════════════════════════════════════════
  //  一、身份
  // ════════════════════════════════════════════════
  identity: {                            // 身份[区块]

    // ━━━ 1-1 基本信息 ━━━
    basicInfo: {                       // 基本信息[顶层模块]

      id:       'hua_xiang_dan_qing',   // 唯一ID（英文小写+下划线）
      name:     '花想容',                // 显示名称
      title:    '城南胭脂铺的老板娘',    // 头衔/称号
      icon:     '🌸',                    // 头像图标
      role:     '自由',                  // 自由/已受邀/员工/奴隶/宠物/囚犯/罪奴/牲畜/工具/废料

      age:      22,                      // 等效人类年龄（整数，不要加"岁"）
      race:     '人族',                  // 人族/精灵/兽人/魔族/天使/龙裔/异种
      gender:   '伪娘',                  // 女性/男性/伪娘/扶她
      rarity:   '白',                    // 白/绿/蓝/紫/金
      price:    27000,                    // 身价/挂牌价（按上方定价公式计算），必须为Number

    },

    // ━━━ 1-2 出身背景 ━━━
    background: {                       // 出身背景[顶层模块]

      origin:       '绯红城本地',              // 出身地
      birthStatus:  '平民',                    // 奴隶/平民/商贾/贵族/王族/异族
      family:       '平民家庭，父母早亡，被远房亲戚卖入戏班。无兄弟姐妹',  // 家族背景：父母/兄弟姐妹/家族地位/现状
      upbringing:   '自幼在戏班长大，吃的是开口饭，练的是童子功',  // 成长环境
      education:    '戏班学艺——唱念做打，识字不多但精通音律',      // 教育程度
      skills: [                        // 技能
        '唱戏',
        '化妆',
        '调香',
        '女红',
      ],

      talents: [                       // 天赋
        '身段柔软',
        '模仿女声惟妙惟肖',
        '嗅觉灵敏',
      ],

      aura:       '举手投足间带着旧戏班子的风韵，一颦一笑比女子还妩媚三分',  // 整体气质印象

    },

    // ━━━ 1-3 经历 ━━━
    experience: {                       // 经历[顶层模块]

      currentOccupation: '胭脂铺老板娘',               // 当前职业
      timeline:          '6岁被卖入戏班学旦角，18岁变声后离开戏班，20岁开了胭脂铺',  // 时间线
      lifeOverview:     '花想容6岁被卖入戏班，因眉眼秀气被定为旦角。学艺十年吃尽苦头——天不亮压腿、吊嗓、练身段，一举一动都得"像个女人"。十五六岁开始被师兄们夜里侵扰，她不敢拒绝也不敢声张，第二天照样上台唱《游园惊梦》。变声期后嗓音不复清亮，戏班子散了，她用多年积蓄在城南开了间胭脂铺度日。如今靠一张比女子还妩媚三分的脸和一手化妆手艺谋生。',  // 人生概述：不少于50字
      dailyLife:        '胭脂铺开在城南巷子深处，铺面不大但胜在清静。她每日早起梳妆，对镜描眉时偶尔会想起戏台上的灯火。来买胭脂的男人眼神跟当年的师兄一样——不是为了买东西，是为了看她捻起胭脂抹在手背上时那一截手腕。她不赶人，笑着多聊两句，生意就这么做成了。夜里关了铺门，一个人对着灯，偶尔会想这辈子就这样了么，但第二天天亮还是涂上胭脂推开铺门。',  // 当下日常：不少于50字
      sexualAwakening:  '第一次是十四五岁时，大师兄深夜摸进她的房间。她不敢喊也不敢跑——戏班里的旦角就是半个女人，这是规矩。疼得咬破了嘴唇，师兄压着她的嘴说别出声，她忍了，第二天照样上台唱《贵妃醉酒》。后来她学会了怎么让男人快点完事，学会了假装呻吟，学会了完事后用凉水洗掉腿上的痕迹假装什么都没发生。她那时候才明白，自己这张脸、这副身子，就是最值钱的货物。',  // 性的启蒙：不少于50字
      dailySexuality:   '如今她一个人睡，夜里偶尔会想起那些压在身上的师兄们。她发现自己并不抗拒那些记忆——甚至有时候会偷偷夹着被子磨后面，磨完了又懊恼，觉得自己越发不像个男人了。有熟客来买胭脂时眼神太过直白，她会装作没看见，但心里清楚如果对方真的开口，她未必会拒绝。她已经习惯了用身体换点什么，只是不知道下一次会是因为钱、因为寂寞，还是因为习惯了顺从。',  // 日常性事：不少于50字
      sexualDetails: [   // 性爱明细：按时间先后编号列出性相关事件（1. 2. 3. ...顺延，不限于4条）；每条详细描述，内容要充足，不能一句话带过
        '1. 14岁：在戏班学戏，大师兄深夜摸进房间压住她。她不敢喊，疼得咬破嘴唇，师兄捂着嘴让她别出声。第二天她照样上台唱《贵妃醉酒》，散戏后在茅房吐了一场。',
        '2. 16岁：班主把她许给一个常来看戏的富商做外室。富商喜欢她男身女相的扮相，让她穿戏服伺候，也爱听她学着女人的腔调叫。她学会了不少花样，只求完事早些，少挨些折腾。',
        '3. 19岁：富商玩腻了把她转手给了同行，又被塞给戏班一个师兄。那段日子她前后都要伺候人，有时一个晚上要应付两三个，渐渐麻木，学会了用笑和撒娇换点好处。',
        '4. 21岁：攒够银子赎身开了胭脂铺。有熟客买胭脂时眼神太直白，她笑着多聊两句，却再不轻易跟人上床——她要的价，比戏班里那几年值钱得多。',
      ],

    },


  },
  // ════════════════════════════════════════════════
  //  二、外貌
  // ════════════════════════════════════════════════
  appearance: {                            // 外貌[区块]

    // ━━━ 2-1 面容 ━━━
    facialFeatures: {                       // 面容[顶层模块]

      face:       '鹅蛋脸，下巴尖巧，眉目清秀如画',  // 面容描写
      forehead:   '光洁饱满',                    // 额头：宽窄/高低/皱纹
      eyes:       '杏眼含春，眼尾微挑，天然带三分媚意',  // 眼睛描写
      eyelashes:  '浓密纤长（接的假睫毛）',              // 睫毛
      eyebrows:   '修成柳叶眉，根根分明',           // 眉毛
      nose:       '小巧挺直，鼻翼窄',              // 鼻子：高矮/鼻型/鼻翼
      lips:       '唇形小巧，涂着淡粉色口脂',      // 嘴唇：厚薄/唇形/唇色/干裂
      teeth:      '整齐洁白',                      // 牙齿：整齐/发黄/缺损/龅牙
      ears:       '耳垂薄，戴着小金环',            // 耳朵：大小/形状/贴面/招风

      hair: {                           // 头发
        color:  '墨黑',                              // 发色
        length: '及腰',                                 // 长度：板寸/齐耳/齐肩/及胸/及腰/及臀/及地
        texture:      '柔顺',                       // 发质：干枯/粗硬/普通/柔顺/丝滑
        thickness:    '浓密',                           // 发量：稀疏/普通/浓密/厚重
        style:        '梳成慵懒的坠马髻，斜插一根白玉簪',   // 发型描述
        cleanliness:  '清爽',                       // 清洁度：油腻肮脏/略有油光/还算干净/清爽/刚洗过
        notes:        '是真发，养了很多年',     // 其他备注
      },

      facialHair: null,     // 胡须描述（可选值：山羊胡/络腮胡/无须/短须/胡茬/长须）

    },

    // ━━━ 2-2 体态 ━━━
    bodyShape: {                       // 体态[顶层模块]

      shoulders: '窄肩微溜',              // 肩膀：宽窄/平溜/厚薄
      chest:     '胸廓平坦，肋线清晰',    // 胸部骨架：宽厚/纤薄/肋骨形态
      waist:     '腰肢纤细，勒着束腰',    // 腰身：粗细/腰线/腰臀比
      hips:      '窄臀，扭起来别有风致',  // 臀部/胯部：宽窄/骨盆形状

      figure: '纤细',       // 整体体型：骨瘦如柴/纤细/苗条/匀称/丰腴/丰满/肥胖/健壮
      height: '中等',       // 身高：矮小/偏矮/中等/偏高/高挑/高大
      build:  '柔软',       // 体质结实度：干瘦/纤细/柔软/紧实/健硕/臃肿/松垮

      hands: '十指纤纤，涂着鲜红的蔻丹，保养得比女子还精细',  // 手部描写
      feet:  '纤巧，穿着绣花鞋',                      // 足部描写

    },

    // ━━━ 2-3 肤发 ━━━
    skinHair: {                       // 肤发[顶层模块]

      // ──── 2-3-1 皮肤 ────
      skin: {                           // 皮肤[子模块]
        color:      '白皙',       // 苍白/白皙/偏黄/小麦/蜜色/古铜/黝黑/灰败
        texture:    '细腻',       // 粗糙/偏粗/普通/细腻/光滑
        moisture:   '滋润',       // 龟裂/偏干/普通/滋润/油性
        blemishes:  '无',                 // 瑕疵/胎记
        tanLines:   '无',         // 晒痕
        calluses:   '指尖无茧',         // 老茧分布
      },

      // ──── 2-3-2 体毛 ────
      bodyHair: {        // 非性器官部位体毛[子模块]
        arms:   '无',    // 稀疏/茂密/无/剃净
        legs:   '稀疏细软',    // 腿部体毛
        armpit: '无',    // 腋下体毛
        belly:  '无',       // 腹部体毛
        back:   '无',       // 背部体毛
      },

      // ──── 2-3-3 指甲 ────
      nails: {                         // 指甲[子模块]
        fingernails: '精心修剪涂蔻丹',  // 手指甲
        toenails:    '涂着同色蔻丹',  // 脚趾甲
        cleanliness: '干净',                // 清洁度
      },

    },

    // ━━━ 2-4 印记 ━━━
    marks: {                       // 印记[顶层模块]

      scars:      '后腰有一个拇指大的旧烫疤——小时候练功不小心烫的',  // 疤痕/纹身/胎记
      tattoos:    null,     // ! 只能用 null 或字符串，不支持数组（无）
      piercings:  '耳垂各有一个小金环',             // 穿刺描述

    },

    // ━━━ 2-5 声息 ━━━
    voiceScent: {                       // 声息[顶层模块]

      voice:      '刻意压细的女声，偶尔露馅时会透出原本清朗的男声底色',  // 嗓音描写

      scent: {                           // 体味结构：overall/breath/armpits/skin/hair/genitals/feet/notes
        overall:    '胭脂水粉的花香为主，底下有淡淡的皂角清味',          // 体骚/狐臭/陈年汗臭/精臊/药味/酒馊
        breath:     '干净的甜味——爱吃蜜饯',         // 烟臭/酒馊/蒜臭/精液味/胃酸腐臭/粪臭
        armpits:    '无汗味',            // 汗骚/狐臭/酸馊/腋毛积臭
        skin:       '茉莉花粉混着体温的味道',             // 汗垢/油脂/精液/药味/粪渣/老泥垢
        hair:       '桂花头油的香味',    // 油馊/头垢/汗臭/精味/屎味/桂香
        genitals:   '干净，有淡淡的皂香',         // 淫水骚/精液腥/白带酸腐/尿骚/脓臭/屎味
        feet:       '香粉味',         // 汗臭/酸馊/烂泥/茧皮臭
        notes:      '每日沐浴，极重仪容',         // 清洁习惯/体味变化/对方反应
      },

    },


  },
  // ════════════════════════════════════════════════
  //  三、衣着
  // ════════════════════════════════════════════════
  attire: {                            // 衣着[区块]

    // ━━━ 3-1 衣着 ━━━
    clothing: {                       // 衣着[顶层模块]

      attireStyle: '华美',   // 清纯/朴素/风尘/富贵/华美/异域/破旧/不整
      top:         '水红色的绸衫，领口绣着并蒂莲',    // 上装
      bottom:      '同色百褶裙，走动时摇曳生姿',     // 下装
      underwear:   '白色绸布束胸和亵裤',          // 内衣
      outerwear:   '浅粉色薄纱披帛',     // 外衣/外套
      headwear:    '白玉簪',     // 头饰/帽子

      // ──── 3-1-1 限制式穿戴 ────

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

      // ──── 3-1-2 刺激式穿戴 ────

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

      // ──── 3-2-1 袜子 ────
      hosiery: {                          // 袜子[子模块]
        type:         '长袜',     // 短袜/长袜/丝袜/吊带袜/过膝袜/腿套/网袜/绑带/链袜/系带
        color:        '白色',     // 袜子颜色
        material:     '丝绸',     // 棉/尼龙/蕾丝/网眼/皮革/金属链
        thighHigh:    false,      // 是否过膝
        garter:       false,      // 是否吊带
        openCrotch:   false,      // 是否开裆
        chain:        false,      // 是否链式系带
        notes:        '白色的丝绸袜子',
      },

      // ──── 3-2-2 鞋子 ────
      footwear: {                       // 鞋子[子模块]
        type:         '绣鞋',    // 赤脚/草鞋/布鞋/绣鞋/木屐/皮靴/高跟鞋
        material:     '绸缎',  // 材质
        color:        '水红',    // 鞋子颜色
        condition:    '七成新',    // 状况
        heelHeight:   '平底',    // 平底/低跟/中跟/高跟/超高跟
        notes:        '绣花鞋，鞋头缀着一颗小珍珠',
      },

    },

    // ━━━ 3-3 饰品 ━━━
    ornaments: {                       // 饰品[顶层模块]

      accessories: {                        // 饰品
        neck:     '珍珠项链',   // 颈部饰品
        ears:     '小金环',     // 耳部饰品
        wrists:   '白玉镯',     // 手腕饰品
        fingers:  '银戒指',     // 手指饰品
        anklets:  '银脚铃',     // 脚链/脚镯
        other:    '手帕一方，绣着兰花',   // 其他饰品
      },


    },

  },

  // ════════════════════════════════════════════════
  //  四、性特征
  // ════════════════════════════════════════════════
  sexOrgans: {                            // 性特征[区块]

    // ━━━ 4-1 足部 ━━━

    feet: {                           // 足部[顶层模块]
      shape:        '纤细匀称',       // 足型：端正好看/宽扁/纤细匀称/男性化大脚
      length:       '偏小',           // 足长：偏小/普通/偏大
      toes:         '整齐修长',       // 脚趾：整齐修长/略弯/蜷缩/畸形
      soles:        '前掌有薄茧',     // 脚底：光滑/有薄茧/厚茧/老皮
      cleanliness:  '干净',           // 清洁度：干净/微汗/污垢/泥泞
      scent:        '略带皮革味',     // 气味：干净/汗酸/皮革味/泥味/脚臭
      arch:         '高足弓',         // 足弓：平足/普通/高足弓
      legs:         '修长笔直',       // 腿型：修长笔直/匀称/粗壮/O型/X型
      thighs:       '匀称有肉',       // 大腿：纤细/匀称有肉/粗壮
      calves:       '纤细',           // 小腿：纤细/匀称/粗壮
      notes:        '常年练戏靴功，脚型保持得很好。足弓高，脚背线条优美',  // 足部备注
    },

    // ━━━ 4-2 胸部 ━━━

    breasts: {                        // 胸部[顶层模块]
      size:     '平坦',               // 大小
      shape:    '平坦',               // 形状
      firmness: '平坦',               // 坚挺度
      cleavage: null,                 // 乳沟（无）
      scent:    '干净，淡皂香',       // 汗味/乳香/皂味/骚/奶酸
      lactation: null,                // 泌乳（无）
      notes:    '男身，胸部平坦，束胸后几乎看不出',  // 胸部备注
    },

    // ━━━ 4-3 乳头 ━━━

    nipples: {                      // 乳头[顶层模块]
      size:       '小颗',           // 乳头大小
      color:      '浅褐',           // 乳头颜色
      shape:      '圆润',           // 乳头形状
      areola:     '浅褐色小巧',     // 乳晕描述
      areolaSize: '偏小',           // 乳晕大小
      erectile:   '遇冷凸起',       // 勃起状态
      sensitivity: '高',            // 敏感度
      piercing:   false,            // 是否穿刺
    },

    // ━━━ 4-4 包皮 ━━━

    foreskin: {                       // 包皮[顶层模块]
      status:    '正常',              // 已割/包皮过长/包茎/正常
      type:      null,                // 包皮类型（无）
      phimosis:  false,               // 是否包茎
      smegma:    '无',                // 包皮垢：无/少量/中等/大量/有异味
      scent:     '干净，有皂香',       // 气味
      hygiene:   '良好',              // 包皮卫生
      notes:     null,                // 包皮备注（无）
    },

    // ━━━ 4-5 龟头 ━━━

    glans: {                          // 龟头[顶层模块]
      size:       '小巧',             // 龟头大小
      color:      '粉红',             // 颜色
      hood:       '半露',             // 包皮覆盖状态
      scent:      '干净',             // 气味
      piercing:   false,              // 是否穿刺
      notes:      '常年穿女装束紧下体，比一般男性更敏感',  // 龟头备注
    },

    // ━━━ 4-6 阴茎 ━━━

    penis: {                          // 阴茎体[顶层模块]
      length:     '偏小',             // 长度
      girth:      '偏细',             // 粗细
      shape:      '笔直纤细',         // 整体形状
      curvature:  '笔直',             // 弯曲度
      veins:      '不明显',           // 血管
      scent:      '干净，皂香为主',   // 精液腥/尿骚/汗味/干净
      pubicHair:  '无——剃净',         // 阴毛
    },

    // ━━━ 4-7 阴囊 ━━━

    scrotum: {                        // 阴囊[顶层模块]
      size:       '偏小紧缩',         // 大小
      hang:       '紧贴',             // 下垂度
      color:      '浅褐',             // 颜色
      hair:       '无——剃净',         // 阴囊毛
      scent:      '干净',             // 气味
      notes:      '常年内裤紧束，阴囊习惯性紧缩',   // 备注
    },

    // ━━━ 4-8 尿道 ━━━

    urethra: {                        // 尿道[顶层模块]
      opening:    '细小紧闭',         // 尿道口
      sensitivity: '高',              // 敏感度
      piercing:   false,              // 是否穿刺
      notes:      '常年穿女装紧束，尿道口比一般男性更敏感',  // 备注
    },

    // ━━━ 4-9 肛门 ━━━

    anus: {                           // 肛门[顶层模块]
      appearance:   '浅褐色，干净',   // 外观
      hair:         '无——剃净',       // 肛毛
      scent:        '干净',           // 屎味/腥/屁味/干净/肛渍骚
      cleanliness:  '干净',           // 清洁度
      sensitivity:  '高',             // 敏感度
      preparation:  '有经验',         // 扩张状态
      notes:      '作为被插入方有经验',            // 肛门备注（无）
    },

    // ━━━ 4-10 前列腺 ━━━

    prostate: {                       // 前列腺（生理特征）[顶层模块]
      size:       '正常',             // 偏小/正常/偏大
      condition:  '正常',             // 正常/炎症/增生
      sensitivity: '较高',            // 敏感度
      notes:      '有肛交经验，前列腺经常被刺激',  // 备注
    },


  },
  // ════════════════════════════════════════════════
  //  五、性能力
  // ════════════════════════════════════════════════
  sexualCapability: {                            // 性能力[区块]

    // ━━━ 5-1 基本性能力 ━━━

    sexualAbility: {                     // 性能力[顶层模块]

      // ──── 5-1-1 勃起功能 ────
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

      // ──── 5-1-2 射精能力 ────
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

      // ──── 5-1-3 性行为中的失禁 ────
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

    // ━━━ 5-2 高潮反应 ━━━

    orgasmReaction: {                 // 高潮反应[顶层模块]

      // 5个器官：glans 、 penis 、 prostate 、 nipples 、 urethra
      // 6个维度：内部感觉 / 面部 / 声音 / 身体 / 器官反应 / 器官特有

      // ──── 5-2-1 龟头 ────
      glans: {                          // 龟头[子模块]
        // 1. 内部感觉
        sensation:        '极度敏感，碰触即痉挛',   // 高潮时的内部感觉描述
        sensitivity:      '暴增',                   // 敏感度变化：剧增/暴增/极限
        duration:         '正常',                   // 高潮持续时间：短暂/正常/持久
        consciousness:    '恍惚',                   // 意识状态：清醒/恍惚/失神
        mentalThoughts:   '脑海中一片空白，只剩下快感', // 内心想法文字

        // 2. 面部
        face: {
          flush: '明显',   // 脸红程度：无/轻微/明显/通红/全身泛红
          eyes:  '失神',   // 眼神状态：正常/微闭/紧闭/失神/翻白眼
          mouth: '微张',   // 嘴部状态：正常/微张/咬唇/张口/微颤
          tears: {
            has:  false,   // 是否流泪
            desc: null,    // 流泪描述
          },
        },

        // 3. 声音
        moanVolume:  '压抑的轻声',  // 叫声音量：轻声/压抑的轻声/粗喘/尖叫/无声
        moanStyle:   '娇喘型',      // 叫声风格：娇喘型/闷哼型/话多型/语无伦次型
        moanContent: '嗯……啊……不要……', // 叫声内容文字
        scream: {
          has:  false,   // 是否尖叫
          desc: null,    // 尖叫声描述
        },
        sluttyMoan: {
          has:  false,   // 是否淫叫
          desc: null,    // 淫叫声描述
        },

        // 4. 身体
        body: {
          backArch: {
            has:  false,   // 是否弓背
            desc: null,    // 弓背描述
          },
          legTremble: {
            has:  false,   // 是否腿抖
            desc: null,    // 腿抖描述
          },
          bodySpasm: {
            has:  false,   // 是否身体痉挛
            desc: null,    // 痉挛描述
          },
          muscleTension: '紧张',  // 肌肉紧张度：松弛/紧张/僵直/痉挛
          handAction:    '抓紧床单', // 手部动作：无/抓紧床单/抓住对方/拼命推拒/抱紧对方
          toes:          '蜷缩',    // 脚趾状态：放松/蜷缩/痉挛蜷缩
        },

        // 5. 器官反应
        organReaction: {
          saliva:           '增多',       // 唾液分泌：正常/增多/大量分泌/流涎
          nippleErection: {
            has: false,
            desc: null,
          },  // 乳头挺立：是否+描述
          nippleSecretion:  '无',         // 乳头分泌：无/透明渗出/乳汁
          erection: {
            has: false,
            desc: null,
          },  // 勃起：是否+描述
          preCum: {
            has: false,
            desc: null,
          },  // 先走汁（前列腺液）：是否+描述
          ejaculation: {
            has: false,
            desc: null,
          },  // 射精：是否+描述
          scrotumContract: {
            has: false,
            desc: null,
          },  // 阴囊收缩：是否+描述
          urethraOpenClose: {
            has: false,
            desc: null,
          },  // 尿道口张合：是否+描述
          anusOpenClose: {
            has: false,
            desc: null,
          },  // 肛门张合：是否+描述
          urineIncontinence: {
            has: false,
            desc: null,
          },  // 尿失禁：是否+描述
          fecesIncontinence: {
            has: false,
            desc: null,
          },  // 便失禁：是否+描述
        },

        // 6. 器官特有
        unique: {
          temperatureChange: '明显',  // 温度变化：无/轻微/明显/滚烫
        },
      },

      // ──── 5-2-2 阴茎 ────
      penis: {                          // 阴茎[子模块]
        // 1. 内部感觉
        sensation:        '胀满，喷射时的快感最强',    // 高潮时的内部感觉描述
        sensitivity:      '剧增',                      // 敏感度变化：剧增/暴增/极限
        duration:         '正常',                      // 高潮持续时间：短暂/正常/持久
        consciousness:    '恍惚',                      // 意识状态：清醒/恍惚/失神
        mentalThoughts:   '爽……还要更多……',           // 内心想法文字

        // 2. 面部
        face: {
          flush: '通红',   // 脸红程度：无/轻微/明显/通红/全身泛红
          eyes:  '紧闭',   // 眼神状态：正常/微闭/紧闭/失神/翻白眼
          mouth: '咬唇',   // 嘴部状态：正常/微张/咬唇/张口/微颤
          tears: {
            has:  false,   // 是否流泪
            desc: null,    // 流泪描述
          },
        },

        // 3. 声音
        moanVolume:  '粗喘',        // 叫声音量：轻声/压抑的轻声/粗喘/尖叫/无声
        moanStyle:   '闷哼型',      // 叫声风格：娇喘型/闷哼型/话多型/语无伦次型
        moanContent: '操……射了……', // 叫声内容文字
        scream: {
          has:  false,   // 是否尖叫
          desc: null,    // 尖叫声描述
        },
        sluttyMoan: {
          has:  false,   // 是否淫叫
          desc: null,    // 淫叫声描述
        },

        // 4. 身体
        body: {
          backArch: {
            has:  false,  // 是否弓背
            desc: null,    // 弓背描述
          },
          legTremble: {
            has:  false,   // 是否腿抖
            desc: null,    // 腿抖描述
          },
          bodySpasm: {
            has:  true,           // 是否身体痉挛
            desc: '射精时痉挛',   // 痉挛描述
          },
          muscleTension: '紧张',  // 肌肉紧张度：松弛/紧张/僵直/痉挛
          handAction:    '抓紧床单', // 手部动作：无/抓紧床单/抓住对方/拼命推拒/抱紧对方
          toes:          '蜷缩',    // 脚趾状态：放松/蜷缩/痉挛蜷缩
        },

        // 5. 器官反应
        organReaction: {
          saliva:           '正常',                 // 唾液分泌：正常/增多/大量分泌/流涎
          nippleErection: {
            has: false,
            desc: null,
          },  // 乳头挺立：是否+描述
          nippleSecretion:  '无',                   // 乳头分泌：无/透明渗出/乳汁
          erection: {
            has: true,
            desc: '射精中持续勃起',
          },  // 勃起：是否+描述
          preCum: {
            has: false,
            desc: null,
          },  // 先走汁（前列腺液）：是否+描述
          ejaculation: {
            has: true,
            desc: '射精',
          },  // 射精：是否+描述
          scrotumContract: {
            has:  false,
            desc: null,
          },  // 阴囊收缩：是否+描述
          urethraOpenClose: {
            has:  false,
            desc: null,
          },  // 尿道口张合：是否+描述
          anusOpenClose: {
            has: false,
            desc: null,
          },  // 肛门张合：是否+描述
          urineIncontinence: {
            has: false,
            desc: null,
          },  // 尿失禁：是否+描述
          fecesIncontinence: {
            has: false,
            desc: null,
          },  // 便失禁：是否+描述
        },

        // 6. 器官特有
        unique: {
          softSpeed:        '正常',  // 高潮后软化速度：正常/缓慢/快速
          trembleIntensity: '剧烈',  // 高潮后颤抖强度：轻微/明显/剧烈
        },
      },

      // ──── 5-2-3 前列腺 ────
      prostate: {                       // 前列腺[子模块]
        // 1. 内部感觉
        sensation:        '压迫感，前列腺高潮不同于阴茎高潮',  // 高潮时的内部感觉描述
        sensitivity:      '剧增',                              // 敏感度变化：剧增/暴增/极限
        duration:         '持久',                              // 高潮持续时间：短暂/正常/持久
        consciousness:    '恍惚',                              // 意识状态：清醒/恍惚/失神
        mentalThoughts:   '从身体深处涌上来的快感……',         // 内心想法文字

        // 2. 面部
        face: {
          flush: '明显',   // 脸红程度：无/轻微/明显/通红/全身泛红
          eyes:  '失神',   // 眼神状态：正常/微闭/紧闭/失神/翻白眼
          mouth: '微张',   // 嘴部状态：正常/微张/咬唇/张口/微颤
          tears: {
            has:  false,   // 是否流泪
            desc: null,    // 流泪描述
          },
        },

        // 3. 声音
        moanVolume:  '压抑的轻声',     // 叫声音量：轻声/压抑的轻声/粗喘/尖叫/无声
        moanStyle:   '闷哼型',         // 叫声风格：娇喘型/闷哼型/话多型/语无伦次型
        moanContent: '嗯……那里……不要……', // 叫声内容文字
        scream: {
          has:  false,   // 是否尖叫
          desc: null,    // 尖叫声描述
        },
        sluttyMoan: {
          has:  false,   // 是否淫叫
          desc: null,    // 淫叫声描述
        },

        // 4. 身体
        body: {
          backArch: {
            has:  true,       // 是否弓背
            desc: '腰弓起',   // 弓背描述
          },
          legTremble: {
            has:  false,  // 是否腿抖
            desc: null,    // 腿抖描述
          },
          bodySpasm: {
            has:  false,   // 是否身体痉挛
            desc: null,    // 痉挛描述
          },
          muscleTension: '紧张',  // 肌肉紧张度：松弛/紧张/僵直/痉挛
          handAction:    '抓紧床单', // 手部动作：无/抓紧床单/抓住对方/拼命推拒/抱紧对方
          toes:          '蜷缩',    // 脚趾状态：放松/蜷缩/痉挛蜷缩
        },

        // 5. 器官反应
        organReaction: {
          saliva:           '增多',                    // 唾液分泌：正常/增多/大量分泌/流涎
          nippleErection: {
            has: false,
            desc: null,
          },  // 乳头挺立：是否+描述
          nippleSecretion:  '无',                      // 乳头分泌：无/透明渗出/乳汁
          erection: {
            has: true,
            desc: '前列腺高潮维持勃起',
          },  // 勃起：是否+描述
          preCum: {
            has:  false,
            desc: null,
          },  // 先走汁（前列腺液）：是否+描述
          ejaculation: {
            has: true,
            desc: '可被强制触发',
          },  // 射精：是否+描述
          scrotumContract: {
            has:  false,
            desc: null,
          },  // 阴囊收缩：是否+描述
          urethraOpenClose: {
            has:  false,
            desc: null,
          },  // 尿道口张合：是否+描述
          anusOpenClose: {
            has:  false,
            desc: null,
          },  // 肛门张合：是否+描述
          urineIncontinence: {
            has: false,
            desc: null,
          },  // 尿失禁：是否+描述
          fecesIncontinence: {
            has: false,
            desc: null,
          },  // 便失禁：是否+描述
        },

        // 6. 器官特有
        unique: {
          urinationSensation: '明显',  // 排尿感：无/轻微/明显/强烈
        },
      },

      // ──── 5-2-4 乳头 ────
      nipples: {                        // 乳头[子模块]
        // 1. 内部感觉
        sensation:        '酥麻',                      // 高潮时的内部感觉描述
        sensitivity:      '剧增',                      // 敏感度变化：剧增/暴增/极限
        duration:         '短暂',                      // 高潮持续时间：短暂/正常/持久
        consciousness:    '清醒',                      // 意识状态：清醒/恍惚/失神
        mentalThoughts:   '有点奇怪的感觉……',          // 内心想法文字

        // 2. 面部
        face: {
          flush: '轻微',   // 脸红程度：无/轻微/明显/通红/全身泛红
          eyes:  '微闭',   // 眼神状态：正常/微闭/紧闭/失神/翻白眼
          mouth: '微张',   // 嘴部状态：正常/微张/咬唇/张口/微颤
          tears: {
            has:  false,   // 是否流泪
            desc: null,    // 流泪描述
          },
        },

        // 3. 声音
        moanVolume:  '轻声',    // 叫声音量：轻声/压抑的轻声/粗喘/尖叫/无声
        moanStyle:   '娇喘型',  // 叫声风格：娇喘型/闷哼型/话多型/语无伦次型
        moanContent: '啊……',   // 叫声内容文字
        scream: {
          has:  false,   // 是否尖叫
          desc: null,    // 尖叫声描述
        },
        sluttyMoan: {
          has:  false,   // 是否淫叫
          desc: null,    // 淫叫声描述
        },

        // 4. 身体
        body: {
          backArch: {
            has:  false,   // 是否弓背
            desc: null,    // 弓背描述
          },
          legTremble: {
            has:  false,   // 是否腿抖
            desc: null,    // 腿抖描述
          },
          bodySpasm: {
            has:  false,   // 是否身体痉挛
            desc: null,    // 痉挛描述
          },
          muscleTension: '紧张',  // 肌肉紧张度：松弛/紧张/僵直/痉挛
          handAction:    '无',    // 手部动作：无/抓紧床单/抓住对方/拼命推拒/抱紧对方
          toes:          '放松',  // 脚趾状态：放松/蜷缩/痉挛蜷缩
        },

        // 5. 器官反应
        organReaction: {
          saliva:           '正常',                   // 唾液分泌：正常/增多/大量分泌/流涎
          nippleErection: {
            has: true,
            desc: '挺立',
          },  // 乳头挺立：是否+描述
          nippleSecretion:  '无',                     // 乳头分泌：无/透明渗出/乳汁
          erection: {
            has: true,
            desc: '轻微反应',
          },  // 勃起：是否+描述
          preCum: {
            has: false,
            desc: null,
          },  // 先走汁（前列腺液）：是否+描述
          ejaculation: {
            has: false,
            desc: null,
          },  // 射精：是否+描述
          scrotumContract: {
            has: false,
            desc: null,
          },  // 阴囊收缩：是否+描述
          urethraOpenClose: {
            has: false,
            desc: null,
          },  // 尿道口张合：是否+描述
          anusOpenClose: {
            has: false,
            desc: null,
          },  // 肛门张合：是否+描述
          urineIncontinence: {
            has: false,
            desc: null,
          },  // 尿失禁：是否+描述
          fecesIncontinence: {
            has: false,
            desc: null,
          },  // 便失禁：是否+描述
        },

        // 6. 器官特有
        unique: {
          pullingSensation: '轻微',  // 牵拉感：无/轻微/明显
        },
      },

      // ──── 5-2-5 尿道 ────
      urethra: {                        // 尿道[子模块]
        // 1. 内部感觉
        sensation:        '灼热，排尿感强烈',           // 高潮时的内部感觉描述
        sensitivity:      '暴增',                       // 敏感度变化：剧增/暴增/极限
        duration:         '正常',                       // 高潮持续时间：短暂/正常/持久
        consciousness:    '恍惚',                       // 意识状态：清醒/恍惚/失神
        mentalThoughts:   '想尿……但是好舒服……',        // 内心想法文字

        // 2. 面部
        face: {
          flush: '通红',   // 脸红程度：无/轻微/明显/通红/全身泛红
          eyes:  '紧闭',   // 眼神状态：正常/微闭/紧闭/失神/翻白眼
          mouth: '咬唇',   // 嘴部状态：正常/微张/咬唇/张口/微颤
          tears: {
            has:  false,   // 是否流泪
            desc: null,    // 流泪描述
          },
        },

        // 3. 声音
        moanVolume:  '压抑的轻声',    // 叫声音量：轻声/压抑的轻声/粗喘/尖叫/无声
        moanStyle:   '闷哼型',        // 叫声风格：娇喘型/闷哼型/话多型/语无伦次型
        moanContent: '嗯……尿意……',   // 叫声内容文字
        scream: {
          has:  false,   // 是否尖叫
          desc: null,    // 尖叫声描述
        },
        sluttyMoan: {
          has:  false,   // 是否淫叫
          desc: null,    // 淫叫声描述
        },

        // 4. 身体
        body: {
          backArch: {
            has:  false,  // 是否弓背
            desc: null,    // 弓背描述
          },
          legTremble: {
            has:  false,  // 是否腿抖
            desc: null,    // 腿抖描述
          },
          bodySpasm: {
            has:  false,   // 是否身体痉挛
            desc: null,    // 痉挛描述
          },
          muscleTension: '紧张',  // 肌肉紧张度：松弛/紧张/僵直/痉挛
          handAction:    '抓紧床单', // 手部动作：无/抓紧床单/抓住对方/拼命推拒/抱紧对方
          toes:          '蜷缩',    // 脚趾状态：放松/蜷缩/痉挛蜷缩
        },

        // 5. 器官反应
        organReaction: {
          saliva:           '增多',                         // 唾液分泌：正常/增多/大量分泌/流涎
          nippleErection: {
            has: false,
            desc: null,
          },  // 乳头挺立：是否+描述
          nippleSecretion:  '无',                           // 乳头分泌：无/透明渗出/乳汁
          erection: {
            has: false,
            desc: null,
          },  // 勃起：是否+描述
          preCum: {
            has: false,
            desc: null,
          },  // 先走汁（前列腺液）：是否+描述
          ejaculation: {
            has: false,
            desc: null,
          },  // 射精：是否+描述
          scrotumContract: {
            has: false,
            desc: null,
          },  // 阴囊收缩：是否+描述
          urethraOpenClose: {
            has: true,
            desc: '尿道口不住张合',
          },  // 尿道口张合：是否+描述
          anusOpenClose: {
            has: false,
            desc: null,
          },  // 肛门张合：是否+描述
          urineIncontinence: {
            has: true,
            desc: '濒临失禁',
          },  // 尿失禁：是否+描述
          fecesIncontinence: {
            has: false,
            desc: null,
          },  // 便失禁：是否+描述
        },

        // 6. 器官特有
        unique: {
          burningSensation: '灼烧',  // 灼烧感：无/轻微/灼烧/剧烈
        },
      },
    },

    // ━━━ 5-3 高潮后刺激 ━━━

    postOrgasmOverstimulation: {      // 高潮后刺激[顶层模块]

      // 5器官：龟头、阴茎、前列腺、乳头、尿道

      // ──── 5-3-1 龟头 ────
      glans: {                          // 龟头[子模块]
        multiOrgasm:    false,        // 能否多重高潮
        refractory:     '较长',       // 不应期：无/极短/正常/较长
        sensation:      '刺痛又麻',  // 高潮后刺激的内部感觉描述
        sensitivity:    '极限',       // 敏感度变化：剧增/暴增/极限
        duration:       '几下就受不了', // 能承受的持续时间
        consciousness:  '恍惚',       // 意识状态：清醒/恍惚/失神
        mentalThoughts: '不要了……',   // 内心想法文字

        // 面部
        face: {
          flush: '通红',   // 脸红程度：无/轻微/明显/通红/全身泛红
          eyes:  '紧闭',   // 眼神状态：正常/微闭/紧闭/失神/翻白眼
          mouth: '张口',   // 嘴部状态：正常/微张/咬唇/张口/微颤
          tears: {
            has:  true,            // 是否流泪
            desc: '被刺激到哭',    // 流泪描述
          },
        },

        // 声音
        moanVolume:  '尖叫',                    // 叫声音量：轻声/压抑的轻声/粗喘/尖叫/无声
        moanStyle:   '话多型',                  // 叫声风格：娇喘型/闷哼型/话多型/语无伦次型
        moanContent: '不要了……真的不要了……',   // 叫声内容文字
        scream: {
          has:  false,  // 是否尖叫
          desc: null,    // 尖叫声描述
        },
        sluttyMoan: {
          has:  false,   // 是否淫叫
          desc: null,    // 淫叫声描述
        },

        // 身体
        body: {
          backArch: {
            has:  true,          // 是否弓背
            desc: '弓腰想逃',    // 弓背描述
          },
          legTremble: {
            has:  true,          // 是否腿抖
            desc: '剧烈颤抖',    // 腿抖描述
          },
          bodySpasm: {
            has:  true,          // 是否身体痉挛
            desc: '阵发性痉挛',  // 痉挛描述
          },
          muscleTension: '僵直',     // 肌肉紧张度：松弛/紧张/僵直/痉挛
          handAction:    '拼命推拒', // 手部动作：无/抓紧床单/抓住对方/拼命推拒/抱紧对方
          toes:          '痉挛蜷缩', // 脚趾状态：放松/蜷缩/痉挛蜷缩
        },

        // 器官反应
        organReaction: {
          saliva:           '大量分泌',               // 唾液分泌：正常/增多/大量分泌/流涎
          nippleErection: {
            has:  false,
            desc: null,
          },  // 乳头挺立：是否+描述
          nippleSecretion:  '无',                     // 乳头分泌：无/透明渗出/乳汁
          erection: {
            has: false,
            desc: '射精后已软',
          },  // 勃起：是否+描述
          preCum: {
            has: false,
            desc: null,
          },  // 先走汁（前列腺液）：是否+描述
          ejaculation: {
            has: false,
            desc: '已射空',
          },  // 射精：是否+描述
          scrotumContract: {
            has:  false,
            desc: null,
          },  // 阴囊收缩：是否+描述
          urethraOpenClose: {
            has:  false,
            desc: null,
          },  // 尿道口张合：是否+描述
          anusOpenClose: {
            has: false,
            desc: null,
          },  // 肛门张合：是否+描述
          urineIncontinence: {
            has: true,
            desc: '被刺激到失禁',
          },  // 尿失禁：是否+描述
          fecesIncontinence: {
            has: false,
            desc: null,
          },  // 便失禁：是否+描述
        },

        // 器官特有
        unique: {
          temperatureChange: '滚烫',  // 温度变化：无/轻微/明显/滚烫
        },
      },

      // ──── 5-3-2 阴茎 ────
      penis: {                          // 阴茎[子模块]
        multiOrgasm:    false,          // 能否多重高潮
        refractory:     '正常',         // 不应期：无/极短/正常/较长
        sensation:      '胀痛感多于快感', // 高潮后刺激的内部感觉描述
        sensitivity:    '暴增',         // 敏感度变化：剧增/暴增/极限
        duration:       '再撸几下就疼得受不了', // 能承受的持续时间
        consciousness:  '恍惚',         // 意识状态：清醒/恍惚/失神
        mentalThoughts: '够了……',       // 内心想法文字

        // 面部
        face: {
          flush: '通红',    // 脸红程度：无/轻微/明显/通红/全身泛红
          eyes:  '翻白眼',  // 眼神状态：正常/微闭/紧闭/失神/翻白眼
          mouth: '张口',    // 嘴部状态：正常/微张/咬唇/张口/微颤
          tears: {
            has:  false,  // 是否流泪
            desc: null,    // 流泪描述
          },
        },

        // 声音
        moanVolume:  '粗喘',       // 叫声音量：轻声/压抑的轻声/粗喘/尖叫/无声
        moanStyle:   '闷哼型',     // 叫声风格：娇喘型/闷哼型/话多型/语无伦次型
        moanContent: '嗯……够了……', // 叫声内容文字
        scream: {
          has:  false,   // 是否尖叫
          desc: null,    // 尖叫声描述
        },
        sluttyMoan: {
          has:  false,   // 是否淫叫
          desc: null,    // 淫叫声描述
        },

        // 身体
        body: {
          backArch: {
            has:  false,  // 是否弓背
            desc: null,    // 弓背描述
          },
          legTremble: {
            has:  false,  // 是否腿抖
            desc: null,    // 腿抖描述
          },
          bodySpasm: {
            has:  false,   // 是否身体痉挛
            desc: null,    // 痉挛描述
          },
          muscleTension: '僵直',  // 肌肉紧张度：松弛/紧张/僵直/痉挛
          handAction:    '抓紧床单', // 手部动作：无/抓紧床单/抓住对方/拼命推拒/抱紧对方
          toes:          '蜷缩',  // 脚趾状态：放松/蜷缩/痉挛蜷缩
        },

        // 器官反应
        organReaction: {
          saliva:           '增多',                   // 唾液分泌：正常/增多/大量分泌/流涎
          nippleErection: {
            has:  false,
            desc: null,
          },  // 乳头挺立：是否+描述
          nippleSecretion:  '无',                     // 乳头分泌：无/透明渗出/乳汁
          erection: {
            has: false,
            desc: '已软',
          },  // 勃起：是否+描述
          preCum: {
            has: false,
            desc: null,
          },  // 先走汁（前列腺液）：是否+描述
          ejaculation: {
            has: false,
            desc: null,
          },  // 射精：是否+描述
          scrotumContract: {
            has:  false,
            desc: null,
          },  // 阴囊收缩：是否+描述
          urethraOpenClose: {
            has:  false,
            desc: null,
          },  // 尿道口张合：是否+描述
          anusOpenClose: {
            has: false,
            desc: null,
          },  // 肛门张合：是否+描述
          urineIncontinence: {
            has: false,
            desc: null,
          },  // 尿失禁：是否+描述
          fecesIncontinence: {
            has: false,
            desc: null,
          },  // 便失禁：是否+描述
        },

        // 器官特有
        unique: {
          softSpeed:        '缓慢',  // 高潮后软化速度：正常/缓慢/快速
          trembleIntensity: '剧烈',  // 高潮后颤抖强度：轻微/明显/剧烈
        },
      },

      // ──── 5-3-3 前列腺 ────
      prostate: {                       // 前列腺[子模块]
        multiOrgasm:    true,              // 能否多重高潮
        refractory:     '极短',            // 不应期：无/极短/正常/较长
        sensation:      '持续高潮叠加',    // 高潮后刺激的内部感觉描述
        sensitivity:    '极限',            // 敏感度变化：剧增/暴增/极限
        duration:       '可以连续高潮好几次', // 能承受的持续时间
        consciousness:  '失神',            // 意识状态：清醒/恍惚/失神
        mentalThoughts: '不行了……要坏掉了……', // 内心想法文字

        // 面部
        face: {
          flush: '全身泛红',  // 脸红程度：无/轻微/明显/通红/全身泛红
          eyes:  '失神',      // 眼神状态：正常/微闭/紧闭/失神/翻白眼
          mouth: '咬唇',      // 嘴部状态：正常/微张/咬唇/张口/微颤
          tears: {
            has:  true,                 // 是否流泪
            desc: '泪水不受控制',       // 流泪描述
          },
        },

        // 声音
        moanVolume:  '压抑的轻声',       // 叫声音量：轻声/压抑的轻声/粗喘/尖叫/无声
        moanStyle:   '闷哼型',           // 叫声风格：娇喘型/闷哼型/话多型/语无伦次型
        moanContent: '嗯……又来了……',     // 叫声内容文字
        scream: {
          has:  false,   // 是否尖叫
          desc: null,    // 尖叫声描述
        },
        sluttyMoan: {
          has:  true,                 // 是否淫叫
          desc: '不受控制地浪叫',     // 淫叫声描述
        },

        // 身体
        body: {
          backArch: {
            has:  true,         // 是否弓背
            desc: '腰弓成桥',   // 弓背描述
          },
          legTremble: {
            has:  true,          // 是否腿抖
            desc: '抖得厉害',    // 腿抖描述
          },
          bodySpasm: {
            has:  false,  // 是否身体痉挛
            desc: null,    // 痉挛描述
          },
          muscleTension: '紧张',  // 肌肉紧张度：松弛/紧张/僵直/痉挛
          handAction:    '抱紧对方', // 手部动作：无/抓紧床单/抓住对方/拼命推拒/抱紧对方
          toes:          '蜷缩',    // 脚趾状态：放松/蜷缩/痉挛蜷缩
        },

        // 器官反应
        organReaction: {
          saliva:           '增多',                   // 唾液分泌：正常/增多/大量分泌/流涎
          nippleErection: {
            has:  false,
            desc: null,
          },  // 乳头挺立：是否+描述
          nippleSecretion:  '无',                     // 乳头分泌：无/透明渗出/乳汁
          erection: {
            has: true,
            desc: '维持勃起',
          },  // 勃起：是否+描述
          preCum: {
            has:  false,
            desc: null,
          },  // 先走汁（前列腺液）：是否+描述
          ejaculation: {
            has: true,
            desc: '可被强制触发',
          },  // 射精：是否+描述
          scrotumContract: {
            has:  false,
            desc: null,
          },  // 阴囊收缩：是否+描述
          urethraOpenClose: {
            has:  false,
            desc: null,
          },  // 尿道口张合：是否+描述
          anusOpenClose: {
            has:  false,
            desc: null,
          },  // 肛门张合：是否+描述
          urineIncontinence: {
            has:  false,
            desc: null,
          },  // 尿失禁：是否+描述
          fecesIncontinence: {
            has: false,
            desc: null,
          },  // 便失禁：是否+描述
        },

        // 器官特有
        unique: {
          urinationSensation: '强烈',  // 排尿感：无/轻微/明显/强烈
        },
      },

      // ──── 5-3-4 乳头 ────
      nipples: {                        // 乳头[子模块]
        multiOrgasm:    true,                   // 能否多重高潮
        refractory:     '无',                   // 不应期：无/极短/正常/较长
        sensation:      '酥麻到全身发软',       // 高潮后刺激的内部感觉描述
        sensitivity:    '暴增',                 // 敏感度变化：剧增/暴增/极限
        duration:       '可以持续刺激很长时间', // 能承受的持续时间
        consciousness:  '恍惚',                 // 意识状态：清醒/恍惚/失神
        mentalThoughts: '好奇怪……',              // 内心想法文字

        // 面部
        face: {
          flush: '轻微',   // 脸红程度：无/轻微/明显/通红/全身泛红
          eyes:  '失神',   // 眼神状态：正常/微闭/紧闭/失神/翻白眼
          mouth: '微张',   // 嘴部状态：正常/微张/咬唇/张口/微颤
          tears: {
            has:  false,   // 是否流泪
            desc: null,    // 流泪描述
          },
        },

        // 声音
        moanVolume:  '轻声',            // 叫声音量：轻声/压抑的轻声/粗喘/尖叫/无声
        moanStyle:   '娇喘型',          // 叫声风格：娇喘型/闷哼型/话多型/语无伦次型
        moanContent: '啊……好奇怪……',   // 叫声内容文字
        scream: {
          has:  false,   // 是否尖叫
          desc: null,    // 尖叫声描述
        },
        sluttyMoan: {
          has:  false,   // 是否淫叫
          desc: null,    // 淫叫声描述
        },

        // 身体
        body: {
          backArch: {
            has:  false,   // 是否弓背
            desc: null,    // 弓背描述
          },
          legTremble: {
            has:  true,          // 是否腿抖
            desc: '微微发抖',    // 腿抖描述
          },
          bodySpasm: {
            has:  false,   // 是否身体痉挛
            desc: null,    // 痉挛描述
          },
          muscleTension: '松弛',  // 肌肉紧张度：松弛/紧张/僵直/痉挛
          handAction:    '无',    // 手部动作：无/抓紧床单/抓住对方/拼命推拒/抱紧对方
          toes:          '放松',  // 脚趾状态：放松/蜷缩/痉挛蜷缩
        },

        // 器官反应
        organReaction: {
          saliva:           '正常',                   // 唾液分泌：正常/增多/大量分泌/流涎
          nippleErection: {
            has: true,
            desc: '极度硬挺',
          },  // 乳头挺立：是否+描述
          nippleSecretion:  '透明渗出',               // 乳头分泌：无/透明渗出/乳汁
          erection: {
            has: true,
            desc: '引起阴茎反应',
          },  // 勃起：是否+描述
          preCum: {
            has: false,
            desc: null,
          },  // 先走汁（前列腺液）：是否+描述
          ejaculation: {
            has: false,
            desc: null,
          },  // 射精：是否+描述
          scrotumContract: {
            has: false,
            desc: null,
          },  // 阴囊收缩：是否+描述
          urethraOpenClose: {
            has: false,
            desc: null,
          },  // 尿道口张合：是否+描述
          anusOpenClose: {
            has: false,
            desc: null,
          },  // 肛门张合：是否+描述
          urineIncontinence: {
            has: false,
            desc: null,
          },  // 尿失禁：是否+描述
          fecesIncontinence: {
            has: false,
            desc: null,
          },  // 便失禁：是否+描述
        },

        // 器官特有
        unique: {
          pullingSensation: '轻微',  // 牵拉感：无/轻微/明显
        },
      },

      // ──── 5-3-5 尿道 ────
      urethra: {                        // 尿道[子模块]
        multiOrgasm:    false,                      // 能否多重高潮
        refractory:     '正常',                     // 不应期：无/极短/正常/较长
        sensation:      '尿道内灼烧般的刺激感',     // 高潮后刺激的内部感觉描述
        sensitivity:    '极限',                     // 敏感度变化：剧增/暴增/极限
        duration:       '持续刺激会越来越敏感',     // 能承受的持续时间
        consciousness:  '恍惚',                     // 意识状态：清醒/恍惚/失神
        mentalThoughts: '尿意……好难受又好舒服……',  // 内心想法文字

        // 面部
        face: {
          flush: '通红',   // 脸红程度：无/轻微/明显/通红/全身泛红
          eyes:  '紧闭',   // 眼神状态：正常/微闭/紧闭/失神/翻白眼
          mouth: '咬唇',   // 嘴部状态：正常/微张/咬唇/张口/微颤
          tears: {
            has:  false,   // 是否流泪
            desc: null,    // 流泪描述
          },
        },

        // 声音
        moanVolume:  '压抑的闷哼',       // 叫声音量：轻声/压抑的轻声/粗喘/尖叫/无声
        moanStyle:   '闷哼型',           // 叫声风格：娇喘型/闷哼型/话多型/语无伦次型
        moanContent: '嗯……别……别弄了……', // 叫声内容文字
        scream: {
          has:  false,   // 是否尖叫
          desc: null,    // 尖叫声描述
        },
        sluttyMoan: {
          has:  false,   // 是否淫叫
          desc: null,    // 淫叫声描述
        },

        // 身体
        body: {
          backArch: {
            has:  false,  // 是否弓背
            desc: null,    // 弓背描述
          },
          legTremble: {
            has:  false,  // 是否腿抖
            desc: null,    // 腿抖描述
          },
          bodySpasm: {
            has:  false,   // 是否身体痉挛
            desc: null,    // 痉挛描述
          },
          muscleTension: '僵直',    // 肌肉紧张度：松弛/紧张/僵直/痉挛
          handAction:    '拼命推拒',  // 手部动作：无/抓紧床单/抓住对方/拼命推拒/抱紧对方
          toes:          '痉挛蜷缩', // 脚趾状态：放松/蜷缩/痉挛蜷缩
        },

        // 器官反应
        organReaction: {
          saliva:           '增多',                     // 唾液分泌：正常/增多/大量分泌/流涎
          nippleErection: {
            has: false,
            desc: null,
          },  // 乳头挺立：是否+描述
          nippleSecretion:  '无',                       // 乳头分泌：无/透明渗出/乳汁
          erection: {
            has: false,
            desc: '已软',
          },  // 勃起：是否+描述
          preCum: {
            has: false,
            desc: null,
          },  // 先走汁（前列腺液）：是否+描述
          ejaculation: {
            has: false,
            desc: null,
          },  // 射精：是否+描述
          scrotumContract: {
            has:  false,
            desc: null,
          },  // 阴囊收缩：是否+描述
          urethraOpenClose: {
            has: true,
            desc: '尿道口不自主张合',
          },  // 尿道口张合：是否+描述
          anusOpenClose: {
            has: false,
            desc: null,
          },  // 肛门张合：是否+描述
          urineIncontinence: {
            has: true,
            desc: '濒临失禁',
          },  // 尿失禁：是否+描述
          fecesIncontinence: {
            has: false,
            desc: null,
          },  // 便失禁：是否+描述
        },

        // 器官特有
        unique: {
          burningSensation: '灼烧',  // 灼烧感：无/轻微/灼烧/剧烈
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
      // ──── 6-1-1 各性别人数 ────
      partnerStats: {              // 各性别人数[子模块]
        partnerCount: 3,       // 性交总人次（同一人做多次重复计数）

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
          count: 3,
          desc: '几个恩客，口交和肛交为主',
          firstTime: {
            partner: '戏班师兄',
            desc: '被戏班师兄半推半就破了口的处',
          },
          mostShameful: {
            partner: '戏班师兄',
            desc: '被师兄半推半就破了口的处，事后躲着哭了半夜',
          },
          best: {
            partner: '一个恩客',
            desc: '第一次肛交被干到射精——新奇而强烈的快感直冲头顶',
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
      },

      // ──── 6-1-2 全局里程碑 ────
      globalMilestones: {          // 全局里程碑[子模块]
        firstTime:      '被戏班师兄半推半就破了口的处',
        mostShameful:   '被师兄半推半就破了口的处，事后躲着哭了半夜',
        best:           '第一次肛交被干到射精——新奇而强烈的快感直冲头顶',
        worst:           null,
      },
    },

    // ━━━ 6-2 身体数据统计 ━━━

    bodyStats: {                   // 身体数据[顶层模块]
      // ──── 6-2-1 阴茎统计 ────
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

      // ──── 6-2-2 前列腺统计 ────
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

      // ──── 6-2-3 其他统计 ────
      other: {                          // 其他统计[子模块]
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

      // ──── 7-1-1 射精 ────
      ejaculation: {                // 射精[子模块]
        status:      '已破',        // 状态
        age:         15,            // 年龄
        partner:     '自行',        // 对象
        circumstance: '梦中遗精',   // 情境
        forced:      false,         // 是否被迫
        notes:       '第一次射精是梦遗，醒来又惊又羞',  // 备注
      },

      // ──── 7-1-2 口交 ────
      oral: {                                   // 口交[子模块]
        status:      '已破',                    // 状态
        age:         16,                        // 年龄
        partner:     '戏班师兄',                // 对象
        circumstance: '戏班后院，酒后',         // 情境
        forced:      false,                     // 是否被迫
        notes:       '半推半就的第一次',        // 备注
      },

      // ──── 7-1-3 尿道 ────
      urethral: {                               // 尿道[子模块]
        status:      '未破',                    // 状态
        age:         null,                      // 年龄
        partner:     null,                      // 对象
        circumstance: null,                     // 情境
        pain:        null,                      // 疼痛程度
        bleeding:    null,                      // 出血情况
        forced:      false,                     // 是否被迫
        notes:       null,                      // 备注
      },

      // ──── 7-1-4 肛门 ────
      anal: {                                   // 肛门[子模块]
        status:      '已破',                    // 状态
        age:         17,                        // 年龄
        partner:     '戏班师兄',              // 对象
        circumstance: '被软磨硬泡后答应',       // 情境
        pain:        '轻微',                    // 疼痛程度
        bleeding:    '少量',                    // 出血情况
        forced:      false,                     // 是否被迫
        notes:       '比他想象中舒服',          // 备注
      },

      // ──── 7-1-5 前列腺 ────
      prostate: {                               // 前列腺[子模块]
        status:      '已破',                    // 已破/未破
        age:         17,                        // 年龄
        partner:     '戏班师兄',                // 对象
        circumstance: '肛交过程中被刺激',       // 情境
        sensation:   '明显',                    // 快感程度：轻微/明显/强烈/前所未有
        ejaculated:  true,                      // 是否同时射精
        forced:      false,                     // 是否被迫
        notes:       '没试过前列腺高潮',        // 备注
      },
    },

    // ━━━ 7-2 首次高潮记录 ━━━

    firstOrgasm: {                   // 首次高潮记录[顶层模块]

      // ──── 7-2-1 龟头 ────
      glans: {                       // 龟头高潮[子模块]
        status:      '已',           // 已/未
        age:         15,             // 年龄
        method:      '梦遗',         // 方式
        partner:     '自行',         // 对象
        circumstance: '梦中',        // 情境
        sensation:   '困惑中带着快感',  // 感受
        ejaculated:  true,           // 是否同时射精
        notes:       '梦遗中达到第一次龟头高潮',  // 备注
      },

      // ──── 7-2-2 阴茎 ────
      penis: {                       // 阴茎高潮[子模块]
        status:      '已',           // 已/未
        age:         15,             // 年龄
        method:      '梦遗',         // 方式
        partner:     '自行',         // 对象
        circumstance: '梦中',        // 情境
        sensation:   '从龟头蔓延到整根',  // 感受
        ejaculated:  true,           // 是否同时射精
        notes:       '和龟头高潮同时发生',  // 备注
      },

      // ──── 7-2-3 尿道 ────
      urethral: {                    // 尿道高潮[子模块]
        status:      '未',           // 已/未
        age:         null,           // 年龄
        method:      null,           // 方式
        partner:     null,           // 对象
        circumstance: null,          // 情境
        sensation:   null,           // 感受
        ejaculated:  null,           // 是否同时射精
        notes:       null,           // 备注
      },

      // ──── 7-2-4 乳头 ────
      nipples: {                     // 乳头高潮[子模块]
        status:      '未',           // 已/未
        age:         null,           // 年龄
        method:      null,           // 方式
        partner:     null,           // 对象
        circumstance: null,          // 情境
        sensation:   null,           // 感受
        ejaculated:  null,           // 是否同时射精
        notes:       null,           // 备注
      },

      // ──── 7-2-5 肛门 ────
      anal: {                        // 肛门高潮[子模块]
        status:      '已',           // 已/未
        age:         17,             // 年龄
        method:      '肛交',         // 方式
        partner:     '胭脂铺常客',   // 对象
        circumstance: '第一次肛交时',  // 情境
        sensation:   '新奇而强烈的快感',  // 感受
        ejaculated:  true,           // 是否同时射精
        notes:       '第一次肛交就被干到射了',  // 备注
      },

      // ──── 7-2-6 前列腺 ────
      prostate: {                    // 前列腺高潮[子模块]
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

      // ──── 7-3-1 阿黑颜 ────
      ahegao: {                      // 阿黑颜[子模块]
        status:      '未',           // 已/未
        age:         null,           // 年龄
        partner:     null,           // 对象
        circumstance: null,          // 情境
        duration:    null,           // 持续时间
        notes:       null,           // 备注
      },

      // ──── 7-3-2 先走汁 ────
      preCum: {                      // 先走汁[子模块]
        status:      '已',           // 已/未
        age:         15,             // 年龄
        partner:     '自行',         // 对象
        circumstance: '自慰时',      // 情境
        volume:      '少量',         // 量
        sensation:   '没注意到',     // 感受
        notes:       '自慰时发现龟头渗出透明液体',  // 备注
      },

      // ──── 7-3-3 尿失禁 ────
      urine: {                       // 尿失禁[子模块]
        status:      '未',           // 已/未
        age:         null,           // 年龄
        partner:     null,           // 对象
        circumstance: null,          // 情境
        volume:      null,           // 量
        sensation:   null,           // 感受
        notes:       null,           // 备注
      },

      // ──── 7-3-4 粪失禁 ────
      feces: {                       // 粪失禁[子模块]
        status:      '未',           // 已/未
        age:         null,           // 年龄
        partner:     null,           // 对象
        circumstance: null,          // 情境
        consistency: null,           // 性状
        sensation:   null,           // 感受
        notes:       null,           // 备注
      },

      // ──── 7-3-5 前列腺尿失禁 ────
      prostateUrine: {               // 前列腺尿失禁[子模块]
        status:      '未',           // 已/未
        age:         null,           // 年龄
        partner:     null,           // 对象
        circumstance: null,          // 情境
        volume:      null,           // 量
        sensation:   null,           // 感受
        notes:       null,           // 备注
      },

      // ──── 7-3-6 前列腺精失禁 ────
      prostateSemen: {               // 前列腺精失禁[子模块]
        status:      '未',           // 已/未
        age:         null,           // 年龄
        partner:     null,           // 对象
        circumstance: null,          // 情境
        volume:      null,           // 量
        sensation:   null,           // 感受
        notes:       null,           // 备注
      },

      // ──── 7-3-7 逆行射精 ────
      retrogradeEjaculation: {        // 逆行射精[子模块]
        status:      '未',           // 已/未
        age:         null,           // 年龄
        partner:     null,           // 对象
        circumstance: null,          // 情境
        sensation:   null,           // 感受
        volume:      null,           // 量
        notes:       null,           // 备注
      },

      // ──── 7-3-8 泌乳 ────
      lactation: {                   // 泌乳[子模块]
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

      // ──── 8-1-1 乳头偏好 ────
      nipple: {                         // 乳头偏好[子模块]
        method:     '按摩',              // 方式偏好：震动/按摩/电击/拍打/温度
        type:       '外部刺激',          // 类型偏好：插入式/外部刺激
        pain:       '轻微可以',          // 痛苦偏好：完全不行/轻微可以/喜欢/很享受
        shame:      '有点羞',            // 羞耻度：不觉得羞/有点羞/很害羞/羞得不行
        desire:     '偶尔想要',          // 渴望度：不想要/偶尔想要/挺想要的/天天想
        care:       '有点在乎',          // 在乎程度：不在乎/有点在乎/挺在乎/非常在意
        feeling:    '被揉捏时有种奇怪的感觉', // 感受：对此器官施加刺激时的心理想法

        specific: {                      // 器官特有[子模块]
          biting:   '轻微可以',          // 撕咬拉扯：完全不行/轻微可以/喜欢/很享受
        },
      },

      // ──── 8-1-2 龟头偏好 ────
      glans: {                          // 龟头偏好[子模块]
        method:     '震动',              // 方式偏好
        type:       '外部刺激',          // 类型偏好
        pain:       '轻微可以',          // 痛苦偏好
        shame:      '很害羞',            // 羞耻度
        desire:     '挺想要的',          // 渴望度
        care:       '非常在意',          // 在乎程度
        feeling:    '龟头太敏感了，直接碰会受不了', // 感受

        specific: {                      // 器官特有[子模块]
          speed:    '适中',              // 刺激速度：轻柔慢磨/适中/快速摩擦/极速抽插
        },
      },

      // ──── 8-1-3 阴茎偏好 ────
      penis: {                          // 阴茎偏好[子模块]
        method:     '按摩',              // 方式偏好
        type:       '插入式',            // 类型偏好
        pain:       '轻微可以',          // 痛苦偏好
        shame:      '有点羞',            // 羞耻度
        desire:     '挺想要的',          // 渴望度
        care:       '挺在乎',            // 在乎程度
        feeling:    '喜欢被服侍的感觉',  // 感受

        specific: {                      // 器官特有[子模块]
          ejaculation: '正常',           // 射精喜好：不喜欢射精/正常/喜欢射精/迷恋射精
        },
      },

      // ──── 8-1-4 前列腺偏好 ────
      prostate: {                       // 前列腺偏好[子模块]
        method:     '按摩',              // 方式偏好
        type:       '插入式',            // 类型偏好
        pain:       '喜欢',              // 痛苦偏好
        shame:      '很害羞',            // 羞耻度
        desire:     '天天想',            // 渴望度
        care:       '有点在乎',          // 在乎程度
        feeling:    '前列腺高潮比射精更爽', // 感受

        specific: {                      // 器官特有[子模块]
          orgasmType: '湿劲',            // 高潮类型：射精/湿劲/不射
        },
      },

      // ──── 8-1-5 尿道偏好 ────
      urethra: {                        // 尿道偏好[子模块]
        method:     '温度',              // 方式偏好
        type:       '插入式',            // 类型偏好
        pain:       '轻微可以',          // 痛苦偏好
        shame:      '很害羞',            // 羞耻度
        desire:     '不想要',            // 渴望度
        care:       '不在乎',            // 在乎程度
        feeling:    '尿道刺激还没尝试过', // 感受

        specific: {                      // 器官特有[子模块]
          depth:    '浅口即可',          // 深度喜好：浅口即可/可以深入/越深越好
        },
      },
    },

    // ━━━ 8-2 玩法偏好 ━━━

    playPreferences: {                   // 玩法偏好[顶层模块]

      // ──── 8-2-1 主动被动 ────
      roleStyle: {                       // 主动被动[子模块]
        active:     '喜欢',              // 主动（操人）：完全不想/偶尔想/喜欢/非常享受
        passive:    '喜欢',              // 被动（被操）：同上
      },

      // ──── 8-2-2 风格偏好 ────

      stylePrefs: {                    // 风格偏好[子模块]
        style:      '温和缠绵',            // 整体风格：轻柔抚慰/温和缠绵/适中/粗暴猛烈/狂野施虐
      },

      // ──── 8-2-3 喜好部位 ────
      preferredParts: [                  // 喜好部位[子模块]
        '脚',
        '胸',
        '阴茎',
        '前列腺',
        '屁股',
        '嘴',
      ],

      // ──── 8-2-4 接受度 ────
      acceptance: {                      // 接受度[子模块]，以下各项四选一：完全不行/可以接受/喜欢/很享受
        bondage:       '可以接受',       // 捆绑
        filth:         '完全不行',       // 污秽（喝尿等）
        humiliation:   '可以接受',       // 羞辱
        exposure:      '可以接受',       // 露出
        toys:          '喜欢',           // 道具
        neglect:       '完全不行',       // 放置
        incontinence:  '完全不行',       // 失禁
      },

      // ──── 8-2-5 情调 ────
      eroticMood: {                       // 情调[子模块]
        petName: [                       // 称呼：性爱时喜欢被怎么叫/怎么叫对方
          '小娘子',
          '花魁',
          '美人儿',
        ],
        dirtyTalk: [                     // 性爱语言：做爱时爱说的话（多选）
          '表达爱意',
          '说骚话',
          '只发语气词',
        ],
        roleplay: {                      // 角色扮演[子模块]
          enjoy:     true,               // 是否喜欢角色扮演
          scenarios: [                   // 喜欢的剧本
            '花魁与恩客',
            '小姐与丫鬟',
            '戏台上的才子佳人',
          ],
        },
      },
    },

    // ━━━ 8-3 特殊时期偏好 ━━━

    specialPeriod: {                     // 特殊时期偏好[顶层模块]

      // ──── 8-3-1 睡眠时 ────

      sleeping: {                        // 睡眠时[子模块]
        active:     '偶尔想',            // 主动，喜不喜欢操睡着的人：完全不想/偶尔想/喜欢/非常享受
        passive:    '完全不想',          // 被动，自己睡着时喜不喜欢被操：完全不想/偶尔想/喜欢/非常享受
        acceptance: '可以接受',          // 接受度，对此状态性爱的接受程度
        stage:      '浅睡中',            // 阶段：犯困时/浅睡中/深睡中
        thoughts:   null,                // 想法：对此状态的心理感受，字符串
      },

      // ──── 8-3-2 月经时 ────
      menstruation: {                      // 月经时[子模块]
        active:     '完全不想',
        passive:    '完全不想',
        acceptance: '完全不行',
        stage:      '经中',
        thoughts:   null,
      },

      // ──── 8-3-3 怀孕时 ────
      pregnancy: {                         // 怀孕时[子模块]
        active:     '完全不想',
        passive:    '完全不想',
        acceptance: '完全不行',
        stage:      '孕早期',
        thoughts:   null,
      },

      // ──── 8-3-4 生病时 ────
      illness: {                           // 生病时[子模块]
        active:     '完全不想',
        passive:    '完全不想',
        acceptance: '完全不行',
        stage:      '初病时',
        thoughts:   null,
      },

      // ──── 8-3-5 腹泻时 ────
      diarrhea: {                          // 腹泻时[子模块]
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

    // 伪娘为男身，第九章采用男性生殖健康结构

    // ━━━ 9-1 睾丸状态 ━━━

    testes: {                         // 睾丸[顶层模块]
      condition:  '正常',             // 正常/萎缩/隐睾/切除
      position:   '正常下垂',         // 正常下垂/高位/隐睾
      leftSize:   '偏小',             // 左侧大小：偏小/正常/偏大
      rightSize:  '偏小',             // 右侧大小：偏小/正常/偏大
      varicocele: false,              // 是否精索静脉曲张
      notes:      null,               // 备注（无）
    },

    // ━━━ 9-2 膀胱 ━━━

    bladder: {                        // 膀胱[顶层模块]
      capacity:   '正常',             // 正常/偏小/偏大
      control:    '正常',             // 正常/较弱/失禁
      inflammation: false,            // 是否膀胱炎
      notes:      null,               // 备注（无）
    },

    // ━━━ 9-3 精液质量 ━━━

    semen: {                          // 精液[顶层模块]
      volume:     '正常',             // 偏少/正常/较多/非常多
      viscosity:  '偏稀',             // 稀薄如水/偏稀/中等/较稠/浓稠带块
      color:      '乳白',             // 乳白/淡黄/黄绿/带血/透明
      spermCount: '正常',             // 无精/少精/正常/多精
      motility:   '正常',             // 精子活力：无/弱/正常/强
      morphology: '正常',             // 精子形态：异常/正常
      notes:      null,               // 备注（无）
    },

    // ━━━ 9-4 生育力 ━━━

    fertility: {                      // 生育力[顶层模块]
      status:     '可育',             // 可育/不育/结扎/未知
      children:   0,                  // 已生育子女数
      proven:     false,              // 是否已验证生育能力
      notes:      null,               // 备注（无）
    },

    // ━━━ 9-5 前列腺健康 ━━━

    prostateHealth: {                 // 前列腺健康[顶层模块]
      condition:  '正常',             // 正常/炎症/增生/切除
      size:       '正常',             // 偏小/正常/偏大
      palpation:  '无异常',           // 指检结果：无异常/压痛/硬结/肿大
      inflammation: false,            // 是否前列腺炎
      hyperplasia:  false,            // 是否前列腺增生
      notes:      null,               // 备注（无）
    },

    // ━━━ 9-6 节育 ━━━

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

      physical: '健康',        // 体质
      mental:   '普通',          // 精神

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
        attitude:   '妩媚中带着疏离',   // 对他人的普遍态度
        temperament:    '柔媚',      // 气质
        stubbornness:   '中',       // 倔强
        empathy:        '高',         // 同理心
        sociability:    '高',         // 社交
        ambition:       '中',       // 野心
        mentalTraits: [                 // 特质
          '爱美',
          '敏感',
          '记仇但藏得深',
        ],
        phobias: [                     // 恐惧症
          '被人识破男儿身',
          '毁容',
        ],
        desires: [                     // 欲望
          '攒够钱赎身',
          '遇到真心待他的人',
          '登台唱一出全本的牡丹亭',
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
        cost:    270,                              // 日维护费 = price 除以 100
        acquired: '邀请',                         // 获取方式
        acquiredDate:  null,                      // 获取日期（无）

        contract: {                               // 契约
          type:        '合作契约',                  // 类型
          duration:    '不定期',                    // 期限
          buyoutPrice: 54000,                     // 赎身价 = price 乘 2
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
      stamina:      45,   // 体力：持久力
      strength:     35,   // 力量：肌肉力量
      agility:      70,   // 敏捷：灵活/速度
      intelligence: 60,   // 智力：学习能力
      knowledge:    45,   // 知识：学识储备
      obedience:    60,   // 服从：听话程度
    },

    // ━━━ 13-2 姿色属性 ━━━

    beauty: {                      // 姿色属性[顶层模块]
      face:     75,     // 容貌美：面容精致程度
      figure:   70,     // 身材美：体型曲线程度
      genital:  65,     // 性器美：性器官美观程度
    },

    // ━━━ 13-3 性爱属性 ━━━

    sex: {                         // 性爱属性[顶层模块]
      lust:        40,     // 性欲：性欲旺盛程度
      sensitivity: 70,    // 敏感度：整体敏感程度
      skill:       55,    // 性技巧：性技巧熟练度
    },

    // ━━━ 13-4 关系属性 ━━━

    relation: {                    // 关系属性[顶层模块]
      loyalty:     50,    // 忠诚：对主人的忠诚
      affection:   20,    // 好感：对主人的好感
      fear:        15,    // 恐惧：对主人的恐惧
    },

    // ━━━ 13-5 堕落属性 ━━━

    corruption: {                  // 堕落属性[顶层模块]
      promiscuity:    30,  // 淫乱度：滥交倾向
      exhibitionism:  20,  // 露出度：当众性行为接受度
      masochism:      25,  // 受虐度：享受被虐的程度
      perversion:     40,  // 变态度：变态嗜好的广度和深度
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
    //  标签的多维选择范围，每维至少选一项
    tags: [
      '古代',
      '艺人',
      '平民',
      '伪娘',
      '魅惑',
      '高价值',
    ],

    // ━━━ 14-2 标记 ━━━

    flags: {                          // 标记[顶层模块]
      metPlayer:       false,
      hadFirstSex:     false,
      attemptedEscape: false,
    },

    // ━━━ 14-3 备注 ━━━

    notes: '伪装成女子的男人。外表比女人还女人，脱了裤子才见真章。伺候好了是个尤物，得罪了也会咬人。',  // 备注

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
