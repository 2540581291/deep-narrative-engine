// 生活纪实 · 人生模拟
var lifeDoc当前视图 = 'chars';
var lifeDocApi = null;
var lifeDoc角色库 = [];
var lifeDoc当前角色 = null;
var lifeDoc当前角色名 = null;
var lifeDoc选中时段 = {};
var lifeDoc写作台当前天类型 = 'workday';
var lifeDoc写作台当前段索引 = 0;
var lifeDoc自定义日索引 = -1;

// ===== 磁盘存储：角色信息 =====
// 目录前缀走全局存储映射（跟随 UI 层级：情欲文学/生活纪实），不硬编码
var lifeDoc目录 = (typeof STORE_DIRS !== 'undefined' && STORE_DIRS.lifeDoc) ? STORE_DIRS.lifeDoc : '生活纪实';
function lifeDoc角色路径(角色名) { return lifeDoc目录 + '/' + LocalFS.sanitize(角色名) + '/'; }

function lifeDoc保存角色() {
  if (lifeDoc自定义活动日选中索引 >= 0) {
    var ch = lifeDoc角色库[lifeDoc规划角色索引];
    if (ch && ch.dailyRoutine && ch.dailyRoutine['custom'] && ch.customDayList && ch.customDayList[lifeDoc自定义活动日选中索引]) {
      ch.customDayList[lifeDoc自定义活动日选中索引].segments = ch.dailyRoutine['custom'];
    }
  }
  var ch2 = lifeDoc角色库[lifeDoc规划角色索引];
  if (ch2 && ch2.dailyRoutine && ch2.dailyRoutine['_customSeg']) {
    ch2.customActivitySegments = ch2.dailyRoutine['_customSeg'];
  }
  // 逐角色写入磁盘
  lifeDoc角色库.forEach(function(ch) {
    var dir = lifeDoc角色路径(ch.name);
    // 基本信息
    var info = {
      name: ch.name,
      gender: ch.gender,
      age: ch.age,
      title: ch.title,
      bio: ch.bio,
      identity: ch.identity || null,
      createdAt: ch.createdAt || Date.now()
    };
    LocalFS.saveJSON(dir + '信息.json', info).catch(function(e) { console.error('保存角色信息失败', e); });
    // 日程：每个 dayType 单独文件
    if (ch.dailyRoutine) {
      Object.keys(ch.dailyRoutine).forEach(function(type) {
        var segs = ch.dailyRoutine[type];
        if (segs && segs.length) {
          lifeDoc保存日程(ch.name, type, segs);
        }
      });
    }
    // 自定义活动段
    if (ch.customActivitySegments && ch.customActivitySegments.length) {
      var segData = { 类型: '_customSeg', 更新于: fmtDate(new Date()), 时段: ch.customActivitySegments };
      LocalFS.saveJSON(dir + '活动段.json', segData).catch(function(e) {});
    }
    // 自定义活动日
    if (ch.customDayList && ch.customDayList.length) {
      ch.customDayList.forEach(function(day, di) {
        if (day.segments && day.segments.length) {
          var dayFile = '自定义日-' + LocalFS.sanitize(day.title || '未命名' + di) + '.json';
          var dayData = { 类型: '_customDay', 标题: day.title, 更新于: fmtDate(new Date()), 时段: day.segments };
          LocalFS.saveJSON(dir + dayFile, dayData).catch(function(e) {});
        }
      });
    }
  });
}

// ===== 磁盘存储：日程 & 写作内容 =====
var lifeDoc天类型文件映射 = {
  workday: '工作日.json',
  restday: '休息日.json',
  sexday: '性爱日.json',
  _customSeg: '活动段.json'
};

function lifeDoc天类型文件名(dayType) {
  if (lifeDoc天类型文件映射[dayType]) return lifeDoc天类型文件映射[dayType];
  if (dayType.indexOf('preset_') === 0) {
    var pid = dayType.replace('preset_', '');
    var p = window.PRESET_DAYS ? PRESET_DAYS.find(function(x) { return x.id === pid; }) : null;
    return '预设_' + LocalFS.sanitize(p ? p.title : pid) + '.json';
  }
  return dayType + '.json';
}

function lifeDoc加载日程(角色名, dayType) {
  var dir = lifeDoc角色路径(角色名);
  var file = lifeDoc天类型文件名(dayType);
  return LocalFS.readJSON(dir + file).then(function(data) {
    if (data && data.时段) {
      // 给每个 segment 附上 _draft（draft 字段直接嵌入在 JSON 中）
      data.时段.forEach(function(s) {
        s._draft = s.draft || '';
      });
      return data.时段;
    }
    return null;
  }).catch(function() {
    return null; // 文件不存在返回 null
  });
}

function lifeDoc保存日程(角色名, dayType, segments) {
  var dir = lifeDoc角色路径(角色名);
  var file = lifeDoc天类型文件名(dayType);
  // 保存前把 _draft 写回 draft
  var data = {
    类型: dayType,
    更新于: fmtDate(new Date()),
    时段: segments.map(function(s) {
      var out = {};
      for (var k in s) {
        if (k !== '_draft') out[k] = s[k];
      }
      out.draft = s._draft || '';
      return out;
    })
  };
  return LocalFS.saveJSON(dir + file, data);
}

function lifeDoc加载自定义日(角色名, 标题) {
  var dir = lifeDoc角色路径(角色名);
  var file = '自定义日-' + LocalFS.sanitize(标题) + '.json';
  return LocalFS.readJSON(dir + file);
}

function lifeDoc保存自定义日(角色名, 标题, 数据) {
  var dir = lifeDoc角色路径(角色名);
  var file = '自定义日-' + LocalFS.sanitize(标题) + '.json';
  return LocalFS.saveJSON(dir + file, 数据);
}

function lifeDoc删除日程(角色名, dayType) {
  var dir = lifeDoc角色路径(角色名);
  var file = lifeDoc天类型文件名(dayType);
  return LocalFS.delete(dir + file);
}

// ===== 加载 =====
function lifeDoc加载角色() {
  return LocalFS.list(lifeDoc目录 + '/').then(function(entries) {
    if (!entries || !entries.length) {
      lifeDoc角色库 = [];
      return;
    }
    var dirs = entries.filter(function(e) { return e.isDir; });
    return Promise.all(dirs.map(function(d) {
      return LocalFS.readJSON(lifeDoc目录 + '/' + d.name + '/信息.json').then(function(data) {
        if (!data || !data.name) return null;
        var ch = {
          name: data.name,
          gender: data.gender || '女性',
          age: data.age,
          title: data.title || '',
          bio: data.bio || '',
          identity: data.identity || null,
          dailyRoutine: { workday: [], restday: [], sexday: [] },
          customActivitySegments: [],
          customDayList: [],
          customActivityPrompt: '',
          createdAt: data.createdAt || Date.now()
        };
        // 加载角色目录下所有日程文件，将 draft 注入 segments
        return LocalFS.list(lifeDoc目录 + '/' + d.name + '/').then(function(files) {
          if (!files || !files.length) return ch;
          var jsonFiles = files.filter(function(f) { return !f.isDir && f.name.indexOf('信息.json') !== 0 && f.name.indexOf('.json') > 0; });
          return Promise.all(jsonFiles.map(function(f) {
            return LocalFS.readJSON(lifeDoc目录 + '/' + d.name + '/' + f.name).then(function(dayData) {
              if (!dayData || !dayData.类型 || !dayData.时段) return;
              // 根据文件名映射回 dayType
              var type = dayData.类型;
              if (type === '_customSeg') {
                ch.customActivitySegments = dayData.时段;
                return;
              }
              if (type === '_customDay') {
                ch.customDayList.push({ id: 'day-' + Date.now(), title: dayData.标题 || '自定义', segments: dayData.时段 || [] });
                return;
              }
              if (type.indexOf('preset_') === 0 || lifeDoc天类型文件映射[type]) {
                ch.dailyRoutine[type] = dayData.时段;
              }
            }).catch(function() {});
          })).then(function() {
            return ch;
          });
        });
      }).catch(function() { return null; });
    })).then(function(chars) {
      lifeDoc角色库 = chars.filter(function(c) { return c !== null; });
    });
  }).catch(function() {
    lifeDoc角色库 = [];
  });
}

var lifeDoc天类型标签 = { workday: '💼 工作日', restday: '🏖️ 休息日', sexday: '🔥 性爱日', _customSeg: '📋 活动段', _customDay: '📅 活动日' };
var lifeDoc天类型键 = ['workday', 'restday', 'sexday'];

var PRESET_DAYS = [
  { id:'social', icon:'🎉', title:'社交日', cat:'日常', desc:'聚会、访友、约会、聚餐，以社交事件为主线' },
  { id:'study', icon:'📚', title:'学习日', cat:'日常', desc:'上课、备考、培训、读书，以学习成长为主线' },
  { id:'sports', icon:'🏃', title:'运动日', cat:'日常', desc:'健身、球类、户外运动，体能消耗和汗水' },
  { id:'create', icon:'🎨', title:'创作日', cat:'日常', desc:'写作、绘画、手工，以产出创作为核心' },
  { id:'cook', icon:'🍳', title:'烹饪日', cat:'日常', desc:'烘焙、做大餐、研究菜谱，厨房里一整天' },
  { id:'chores', icon:'🧹', title:'家务日', cat:'日常', desc:'大扫除、收纳、整理，琐碎但充实的家务' },
  { id:'shopping', icon:'🛍️', title:'购物日', cat:'日常', desc:'逛街采购，从商场到菜市场满载而归' },
  { id:'stayhome', icon:'🏠', title:'宅家日', cat:'日常', desc:'完全不出门，追剧打游戏睡觉放空' },
  { id:'nightowl', icon:'🌙', title:'夜猫日', cat:'日常', desc:'通宵颠倒作息，深夜活跃白天补觉' },
  { id:'travel', icon:'🧳', title:'旅行日', cat:'户外', desc:'外出游览、景区打卡，场景变化大' },
  { id:'nature', icon:'🌿', title:'自然日', cat:'户外', desc:'露营、登山、海边、田园，深度接触自然' },
  { id:'adventure', icon:'⚡', title:'冒险日', cat:'户外', desc:'跳伞、潜水、密室、攀岩等刺激体验' },
  { id:'gaming', icon:'🎮', title:'游戏日', cat:'娱乐', desc:'打游戏、桌游、电竞，纯粹娱乐时间' },
  { id:'culture', icon:'🎭', title:'文化日', cat:'娱乐', desc:'看展、听音乐会、博物馆，文艺熏陶' },
  { id:'photo', icon:'📸', title:'拍摄日', cat:'娱乐', desc:'拍照、录 vlog、修图，以记录为主线' },
  { id:'karaoke', icon:'🎤', title:'嗨唱日', cat:'娱乐', desc:'KTV、蹦迪、Livehouse，释放热情' },
  { id:'wellness', icon:'🧘', title:'养生日', cat:'自我', desc:'体检、美容、按摩、泡澡，以护理为主线' },
  { id:'spa', icon:'🛁', title:'水疗日', cat:'自我', desc:'温泉、桑拿、SPA，彻底放空身心' },
  { id:'selfcare', icon:'💆', title:'自省日', cat:'自我', desc:'写日记、冥想、发呆，偏内心叙事' },
  { id:'growth', icon:'🌱', title:'成长日', cat:'自我', desc:'早起打卡、技能练习、读书会，自我提升' },
  { id:'festival', icon:'🎊', title:'节日日', cat:'事件', desc:'生日、跨年、春节、特定节日，有仪式感' },
  { id:'memorial', icon:'💝', title:'纪念日', cat:'事件', desc:'求婚、纪念日、定情日，有特殊意义' },
  { id:'volunteer', icon:'🤝', title:'志愿日', cat:'事件', desc:'义工、捐款、社区服务，公益向的一天' },
  { id:'ritual', icon:'🕯️', title:'祭祀日', cat:'事件', desc:'祭祖、扫墓、祭祀，传统仪式' },
  { id:'indulge', icon:'🥂', title:'放纵日', cat:'放纵', desc:'夜店、酗酒、暴食、挥霍，打破日常约束' },
  { id:'binge', icon:'🍕', title:'暴食日', cat:'放纵', desc:'吃遍想吃的美食，不计算卡路里的一天' },
  { id:'companion', icon:'👥', title:'陪伴日', cat:'陪伴', desc:'陪父母、带孩子、陪宠物，以他人为中心' },
  // 情色类
  { id:'bdsm', icon:'🔗', title:'调教日', cat:'情色', subcat:'调教', desc:'BDSM、纪律、惩罚、服从，权力交换为核心' },
  { id:'training', icon:'📏', title:'训练日', cat:'情色', subcat:'调教', desc:'身体改造、持久调教、扩肛乳夹凯格尔练习' },
  { id:'hunt', icon:'🎯', title:'狩猎日', cat:'情色', subcat:'征服', desc:'勾引、搭讪、一夜情、征服新对象' },
  { id:'affair', icon:'🤫', title:'偷情日', cat:'情色', subcat:'征服', desc:'背着伴侣偷情，秘密约会的刺激和内疚' },
  { id:'corrupt', icon:'😈', title:'堕落日', cat:'情色', subcat:'征服', desc:'突破底线做平时不会做的事' },
  { id:'exposure', icon:'👀', title:'露出日', cat:'情色', subcat:'暴露', desc:'公共场合性行为、被窥视的紧张感' },
  { id:'record', icon:'📹', title:'影像日', cat:'情色', subcat:'暴露', desc:'拍照录视频直播，以记录和展示为核心' },
  { id:'service', icon:'💋', title:'服务日', cat:'情色', subcat:'服务', desc:'全篇服务对方，口交足交按摩角色扮演' },
  { id:'tease', icon:'🎀', title:'诱惑日', cat:'情色', subcat:'服务', desc:'穿性感内衣、挑逗、跳舞、勾引，延迟满足' },
  { id:'orgy', icon:'👥', title:'群交日', cat:'情色', subcat:'群体', desc:'三人以上、换妻、party，群体性爱' },
  { id:'solo', icon:'✋', title:'自慰日', cat:'情色', subcat:'单人', desc:'一整天自我探索，玩具直播对镜记录' },
  { id:'romance', icon:'💕', title:'纯爱日', cat:'情色', subcat:'双人', desc:'温柔缠绵，情感交流大于肉体冲击' },
  { id:'recover', icon:'🩹', title:'恢复日', cat:'情色', subcat:'双人', desc:'性爱后的温存护理，清洗按摩聊天' },
  { id:'roleplay', icon:'🎭', title:'角色扮演日', cat:'情色', subcat:'扮演', desc:'师生医生主仆等扮演，以剧情推动' },
  { id:'force', icon:'⛔', title:'强迫日', cat:'情色', subcat:'扮演', desc:'CNC/强迫幻想，安全词下进行的角色扮演' },
  { id:'master', icon:'🏰', title:'主奴日', cat:'情色', subcat:'支配', desc:'24/7主奴身份，主人下令奴隶服侍' },
  { id:'pet', icon:'🐾', title:'宠物日', cat:'情色', subcat:'支配', desc:'被当作宠物对待，戴项圈爬行舔食' },
  { id:'dom', icon:'👑', title:'支配日', cat:'情色', subcat:'支配', desc:'完全掌握主动权，命令对方按节奏走' },
  { id:'blindfold', icon:'🕶️', title:'蒙眼日', cat:'情色', subcat:'感官', desc:'剥夺视觉，触觉听觉被放大' },
  { id:'bondage', icon:'⛓️', title:'束缚日', cat:'情色', subcat:'感官', desc:'绳索手铐绑带，无力感和挣脱欲' },
  { id:'icfire', icon:'❄️🔥', title:'冰火日', cat:'情色', subcat:'感官', desc:'冰块蜡烛热蜡，温度变化带来的刺激' },
  { id:'spank', icon:'✋', title:'击打日', cat:'情色', subcat:'感官', desc:'鞭打拍打SP，痛感和快感交织' },
  { id:'squirt', icon:'💦', title:'潮吹日', cat:'情色', subcat:'体液', desc:'女性高潮射液为核心，长时间刺激' },
  { id:'cum', icon:'🌊', title:'吞精日', cat:'情色', subcat:'体液', desc:'口交颜射吞精，以射精和精液处理为主线' },
  { id:'impreg', icon:'🤰', title:'受孕日', cat:'情色', subcat:'体液', desc:'内射受孕play繁殖本能' },
  { id:'outdoor', icon:'🌲', title:'野战日', cat:'情色', subcat:'场景', desc:'户外车里楼梯间等半公开场所' },
  { id:'bath', icon:'🚿', title:'浴室日', cat:'情色', subcat:'场景', desc:'淋浴浴缸水相关的性爱' },
  { id:'mirror', icon:'🪞', title:'镜前日', cat:'情色', subcat:'场景', desc:'所有活动在镜子前进行，视觉刺激' },
  { id:'toys', icon:'🧸', title:'玩具日', cat:'情色', subcat:'道具', desc:'跳蛋按摩棒拉珠假阳具轮番上阵' },
  { id:'machine', icon:'🤖', title:'机器日', cat:'情色', subcat:'道具', desc:'使用炮机震动器等固定设备解放双手' },
  { id:'show', icon:'📢', title:'展示日', cat:'情色', subcat:'展示', desc:'被展示被评价被围观，观众知道' },
  { id:'gangbang', icon:'🔄', title:'轮奸日', cat:'情色', subcat:'群体', desc:'多人轮流顺序同时，不对等结构' },
  { id:'spectate', icon:'👀', title:'围观日', cat:'情色', subcat:'群体', desc:'一个人在中间表演一圈人看着' },
  { id:'orgasm', icon:'🔥', title:'高潮日', cat:'情色', subcat:'调教', desc:'强制高潮连续高潮不许高潮，控制高潮时刻' },
  { id:'endure', icon:'🧎', title:'忍耐日', cat:'情色', subcat:'调教', desc:'不许射精不许高潮不许动，忍耐和服从' },
  { id:'tutorial', icon:'🎓', title:'启蒙日', cat:'情色', subcat:'调教', desc:'教导引导第一次尝试新玩法' },
  { id:'writhe', icon:'✍️', title:'淫纹日', cat:'情色', subcat:'其他', desc:'身体写字画淫纹标记，以印记为主线' },
  { id:'lactation', icon:'🍼', title:'哺乳日', cat:'情色', subcat:'其他', desc:'吸吮乳汁乳房play，不限于产后设定' },
  { id:'morning', icon:'🌅', title:'晨爱日', cat:'情色', subcat:'其他', desc:'从睡梦中被唤醒清晨做爱，温柔到激烈渐变' },
  { id:'teacher', icon:'🍎', title:'师生日', cat:'情色', subcat:'身份', desc:'老师和学生的身份play和禁忌感' },
  { id:'doctor', icon:'🩺', title:'医患日', cat:'情色', subcat:'身份', desc:'医生和病人的诊疗play' },
  { id:'police', icon:'🚔', title:'警匪日', cat:'情色', subcat:'身份', desc:'警察和匪徒的对抗与制服' },
  { id:'incest', icon:'🏠', title:'乱伦日', cat:'情色', subcat:'关系', desc:'家庭身份相关的背德感play' },
  { id:'older', icon:'🧓', title:'年上日', cat:'情色', subcat:'关系', desc:'年龄差带来的权力不对等和呵护感' },
  { id:'jealous', icon:'💚', title:'吃醋日', cat:'情色', subcat:'心理', desc:'因第三者的存在产生的妒忌和占有欲play' },
  { id:'coldwar', icon:'☁️', title:'冷战日', cat:'情色', subcat:'心理', desc:'吵架后的冷战中带着情欲张力' },
  { id:'forgive', icon:'🙏', title:'原谅日', cat:'情色', subcat:'心理', desc:'犯错后的道歉和补偿式性爱' },
  { id:'bet', icon:'🎲', title:'打赌日', cat:'情色', subcat:'心理', desc:'以性为赌注的博弈和胜负奖惩' },
  { id:'uniform', icon:'👔', title:'制服日', cat:'情色', subcat:'服装', desc:'各种制服play，装扮本身就是前戏' },
  { id:'stocking', icon:'🧦', title:'丝袜日', cat:'情色', subcat:'服装', desc:'丝袜包裹的触感和视觉刺激' },
  { id:'heels', icon:'👠', title:'高跟鞋日', cat:'情色', subcat:'服装', desc:'穿着高跟鞋做爱，身材线条和姿势变化' },
  { id:'lingerie', icon:'👙', title:'内衣日', cat:'情色', subcat:'服装', desc:'各种内衣的展示和缓慢剥离' },
  { id:'footjob', icon:'🦶', title:'足交日', cat:'情色', subcat:'部位', desc:'以足部为中心的挑逗和性交' },
  { id:'anal', icon:'🍑', title:'臀交日', cat:'情色', subcat:'部位', desc:'臀部玩弄和后穴的深度开发' },
  { id:'breast', icon:'🍈', title:'胸交日', cat:'情色', subcat:'部位', desc:'乳房play乳交乳夹和乳汁' },
  { id:'thigh', icon:'🦵', title:'腿交日', cat:'情色', subcat:'部位', desc:'大腿夹紧的摩擦和腿缝性交' },
  { id:'quickie', icon:'⏱️', title:'快速日', cat:'情色', subcat:'节奏', desc:'随时随地快速来一发，紧张刺激' },
  { id:'slow', icon:'🐢', title:'慢爱日', cat:'情色', subcat:'节奏', desc:'极慢节奏的做爱，每一秒都被拉长' },
  { id:'allnight', icon:'🌃', title:'通宵日', cat:'情色', subcat:'节奏', desc:'一整夜的缠绵不睡' },
  { id:'drunk', icon:'🍷', title:'喝醉日', cat:'情色', subcat:'状态', desc:'酒后微醺的放纵和失控' },
  { id:'hangover', icon:'😵', title:'宿醉日', cat:'情色', subcat:'状态', desc:'宿醉后的慵懒和迷糊中的温存' },
  { id:'period', icon:'❤️', title:'经期日', cat:'情色', subcat:'状态', desc:'经期中的性爱，温柔小心中的禁忌感' },
  { id:'pregsex', icon:'🤰', title:'孕期性爱日', cat:'情色', subcat:'状态', desc:'孕期中的性爱，笨拙而温柔' },
  { id:'fisting', icon:'✊', title:'拳交日', cat:'情色', subcat:'进阶', desc:'拳头进入的极致撑满感' },
  { id:'dp', icon:'🐉', title:'双龙日', cat:'情色', subcat:'进阶', desc:'双入双龙，前后同时被填满' },
  { id:'sandwich', icon:'🥪', title:'三明治日', cat:'情色', subcat:'进阶', desc:'被前后夹击，两个人体三明治' },
  { id:'nopenis', icon:'🚫', title:'真空日', cat:'情色', subcat:'进阶', desc:'不使用阴茎的性爱，手指口舌玩具' },
  { id:'phone', icon:'📞', title:'电话日', cat:'情色', subcat:'媒介', desc:'电话做爱，声音和语言的挑逗' },
  { id:'video', icon:'📱', title:'视频日', cat:'情色', subcat:'媒介', desc:'视频做爱，视觉和远程互动' },
  { id:'text', icon:'📝', title:'文字日', cat:'情色', subcat:'媒介', desc:'文字调情和色情聊天，想象力的盛宴' },
  { id:'ntr', icon:'😭', title:'NTR日', cat:'情色', subcat:'关系', desc:'被夺走伴侣的屈辱和背德感' },
  { id:'cuckold', icon:'🧢', title:'绿帽日', cat:'情色', subcat:'关系', desc:'看着伴侣和别人做爱的刺激' },
  { id:'swap', icon:'🔄', title:'交换日', cat:'情色', subcat:'关系', desc:'伴侣交换，四人或多人的互换' },
  { id:'chastity', icon:'🔐', title:'贞操带日', cat:'情色', subcat:'道具', desc:'贞操带的佩戴和控制权交换' },
  { id:'urethra', icon:'🧊', title:'尿道日', cat:'情色', subcat:'道具', desc:'尿道棒的插入和刺激' },
  { id:'shock', icon:'⚡', title:'电击日', cat:'情色', subcat:'道具', desc:'电击玩具的酥麻和刺痛' },
  { id:'pump', icon:'🌀', title:'真空泵日', cat:'情色', subcat:'道具', desc:'真空泵造成的充血和肿胀感' },
  { id:'consumption', icon:'🍽️', title:'吞食日', cat:'情色', subcat:'边缘', desc:'吞精吞尿吞体液，以吞咽为核心' },
  { id:'scent', icon:'👃', title:'气味日', cat:'情色', subcat:'边缘', desc:'体味汗味和性器官的气味play' },
  { id:'scat', icon:'🚽', title:'排泄日', cat:'情色', subcat:'边缘', desc:'与排泄相关的边缘play' },
  { id:'blood', icon:'🩸', title:'放血日', cat:'情色', subcat:'边缘', desc:'微量出血和穿刺的边缘刺激' },
  { id:'gag', icon:'🔴', title:'口球日', cat:'情色', subcat:'感官', desc:'口球口塞口水，沉默和服从的象征' },
  { id:'earplug', icon:'🔇', title:'耳塞日', cat:'情色', subcat:'感官', desc:'隔断听觉后其他感官更敏感' },
  { id:'masked', icon:'🎭', title:'蒙面日', cat:'情色', subcat:'感官', desc:'遮住面孔只露出特定部位保持神秘' },
  { id:'nude', icon:'🏁', title:'全裸日', cat:'情色', subcat:'感官', desc:'全天不穿衣物的羞耻和释放感' },
  { id:'glove', icon:'🧤', title:'手套日', cat:'情色', subcat:'感官', desc:'戴手套抚摸的触感和仪式感' },
  { id:'nun', icon:'⛪', title:'修女日', cat:'情色', subcat:'身份', desc:'修女和忏悔者的禁忌play' },
  { id:'courier', icon:'📦', title:'快递日', cat:'情色', subcat:'身份', desc:'快递员和收件人的偶遇play' },
  { id:'driver', icon:'🚕', title:'司机日', cat:'情色', subcat:'身份', desc:'司机和乘客的空间play' },
  { id:'nanny', icon:'🧹', title:'保姆日', cat:'情色', subcat:'身份', desc:'保姆和主人的家庭play' },
  { id:'hide', icon:'🙈', title:'躲藏日', cat:'情色', subcat:'情境', desc:'躲起来不被发现的紧张和刺激' },
  { id:'silent', icon:'🤐', title:'无声日', cat:'情色', subcat:'情境', desc:'不许出声的忍耐和压抑的快感' },
  { id:'timed', icon:'⏳', title:'时限日', cat:'情色', subcat:'情境', desc:'设定时间限制的紧迫感' },
  { id:'interrupt', icon:'⏸️', title:'打断日', cat:'情色', subcat:'情境', desc:'随时可能被打断的风险play' },
  { id:'sneak', icon:'🥷', title:'潜入日', cat:'情色', subcat:'情境', desc:'偷偷摸摸行动的刺激感' },
  { id:'countdown', icon:'⏰', title:'倒计时日', cat:'情色', subcat:'仪式', desc:'从倒计时开始到结束的期待' },
  { id:'lottery', icon:'🎟️', title:'抽签日', cat:'情色', subcat:'仪式', desc:'抽签决定每次做什么的随机play' },
  { id:'task', icon:'📋', title:'任务日', cat:'情色', subcat:'仪式', desc:'每完成一个任务解锁一个奖励' },
  { id:'score', icon:'⭐', title:'评分日', cat:'情色', subcat:'仪式', desc:'每个环节被打分评价的仪式感' },
  { id:'punish', icon:'⛓️', title:'惩罚日', cat:'情色', subcat:'仪式', desc:'违反规则后的惩罚执行' },
  { id:'reward', icon:'🏆', title:'奖励日', cat:'情色', subcat:'仪式', desc:'表现好的奖励性爱' },
  { id:'beach', icon:'🏖️', title:'海滩日', cat:'情色', subcat:'场景', desc:'沙滩海水阳光下的性爱' },
  { id:'elevator', icon:'🛗', title:'电梯日', cat:'情色', subcat:'场景', desc:'电梯狭小空间随时有人进来的紧张' },
  { id:'rooftop', icon:'🏢', title:'楼顶日', cat:'情色', subcat:'场景', desc:'天台上俯瞰城市的高空刺激' },
  { id:'forest', icon:'🌲', title:'森林日', cat:'情色', subcat:'场景', desc:'树林深处的自然之爱' },
  { id:'pool', icon:'🏊', title:'泳池日', cat:'情色', subcat:'场景', desc:'泳池旁或水中的湿身诱惑' },
  { id:'japanese', icon:'🏯', title:'和风日', cat:'情色', subcat:'文化', desc:'和服榻榻米日式美学中的性爱' },
  { id:'ancient', icon:'🏮', title:'古风日', cat:'情色', subcat:'文化', desc:'古装古典氛围的含蓄和爆发' },
  { id:'demon', icon:'👿', title:'恶魔日', cat:'情色', subcat:'文化', desc:'恶魔诱惑堕落和禁忌的象征play' },
  { id:'dessert', icon:'🍦', title:'甜品日', cat:'情色', subcat:'食物', desc:'奶油冰淇淋巧克力涂满全身慢慢舔' },
  { id:'fruit', icon:'🍓', title:'水果日', cat:'情色', subcat:'食物', desc:'水果的汁水和身体的混合味道' },
  { id:'iceplay', icon:'🧊', title:'冰品日', cat:'情色', subcat:'食物', desc:'冰块冰棒在身体上的游走和融化' },
  { id:'firstnight', icon:'🌸', title:'初夜日', cat:'情色', subcat:'状态', desc:'初次体验的紧张青涩和突破' },
  { id:'abstain', icon:'🚫', title:'戒断日', cat:'情色', subcat:'状态', desc:'禁欲一段时间后的释放' },
  { id:'reboot', icon:'🔄', title:'重启日', cat:'情色', subcat:'状态', desc:'关系修复后的重新开始和陌生又熟悉的感觉' },
  { id:'sevenday', icon:'📅', title:'七日挑战日', cat:'情色', subcat:'状态', desc:'连续七天的任务挑战每一天升级' },
  { id:'exam', icon:'📝', title:'考核日', cat:'情色', subcat:'心理', desc:'性爱技巧的考核和过关' },
  { id:'teach', icon:'📖', title:'教学日', cat:'情色', subcat:'心理', desc:'一方教学另一方的引导式性爱' },
  { id:'rank', icon:'🏅', title:'排位日', cat:'情色', subcat:'心理', desc:'比较和排名的胜负欲融入性爱' },
  { id:'live', icon:'📡', title:'直播日', cat:'情色', subcat:'媒介', desc:'直播做爱有观众在场的刺激' },
  { id:'studio', icon:'🎨', title:'画室日', cat:'情色', subcat:'记录', desc:'被画被拍被记录的身体和凝视' },
  { id:'dailywrite', icon:'✍️', title:'色文日', cat:'情色', subcat:'记录', desc:'把当天的性爱写成日记或小作文' },
  { id:'christmas', icon:'🎄', title:'圣诞日', cat:'情色', subcat:'节庆', desc:'圣诞夜的壁炉前和礼物play' },
  { id:'halloween', icon:'🎃', title:'万圣日', cat:'情色', subcat:'节庆', desc:'万圣夜的变装和trick or fuck' },
  { id:'newyear', icon:'🎆', title:'跨年日', cat:'情色', subcat:'节庆', desc:'新年倒计时的钟声里的亲吻和做爱' },
  { id:'qixi', icon:'🏮', title:'七夕日', cat:'情色', subcat:'节庆', desc:'牛郎织女相会的浪漫之夜' },
];

function lifeDoc空行程() {
  var r = {};
  lifeDoc天类型键.forEach(function(k) { r[k] = []; });
  return r;
}

function lifeDoc预置活动分组() {
  return [
    { name: '🏠 生活日常', activities: ['上学', '上班', '购物', '运动', '健身', '理发', '美容', '按摩', '泡澡', '游泳'] },
    { name: '🎉 社交活动', activities: ['聚会', '访友', '约会', '看电影', '看演出', '旅行', '野餐', '露营'] },
    { name: '🏥 健康医疗', activities: ['体检', '看病', '养病'] },
    { name: '💒 特殊事件', activities: ['婚礼', '祭祖', '扫墓', '祭祀', '搬家', '看房'] },
    { name: '⚔️ 特殊行动', activities: ['自卫', '加班', '考试', '面试'] },
  ];
}

var lifeDoc活动芯片 = [
  { group: '🏠 生活日常', chips: [
    { text: '上学', append: '清晨背着书包匆匆赶往学校，在课堂上听课记笔记，课间和同学们嬉笑打闹' },
    { text: '上班', append: '挤上早高峰的地铁赶到公司，对着电脑屏幕处理堆积如山的文件，偶尔和同事闲聊几句' },
    { text: '购物', append: '在超市或商场里悠闲地逛着，仔细比对商品，偶尔被路边的促销吸引' },
    { text: '运动', append: '换上运动服在操场或健身房挥汗如雨，感受肌肉的酸痛和释放的快感' },
    { text: '健身', append: '在健身房里和铁块较劲，对着镜子调整动作姿势，感受身体一点点变得更紧实' },
    { text: '理发', append: '坐在理发店的椅子上和发型师闲聊，听着剪刀咔嚓声期待换个新形象' },
    { text: '美容', append: '躺在美容院的按摩床上，享受护理师轻柔的手法，肌肤在精油的滋养下焕发光彩' },
    { text: '按摩', append: '趴在按摩床上，任由技师的手在酸痛的肌肉上来回按压推拿，舒服得几乎睡过去' },
    { text: '泡澡', append: '整个人沉入热气腾腾的浴缸中，暖意从指尖蔓延到全身，紧绷的神经慢慢放松下来' },
    { text: '游泳', append: '跳入清凉的池水中，身体被水波温柔包裹，划水时肌肉的每一次收缩都充满韵律' },
    { text: '晨跑', append: '清晨换上跑鞋出门，在晨光中沿着熟悉的路线慢跑，呼吸着清冽的空气，额头上渐渐沁出细密的汗珠' },
    { text: '遛狗', append: '牵着狗绳在小区里散步，看着狗狗欢快地东闻西嗅，尾巴摇得像个小风车' },
    { text: '打扫', append: '拿起扫帚和抹布开始整理房间，把散落的东西一件件归位，看着逐渐整洁的屋子心里很踏实' },
    { text: '洗衣', append: '把脏衣服分类扔进洗衣机，倒入洗衣液按下开关，听着滚筒转动的水声发了一会儿呆' },
    { text: '煮饭', append: '在厨房里系上围裙洗菜切菜，锅里的油烧热后滋滋作响，佐料下锅的香气慢慢飘散开来' },
    { text: '种花', append: '蹲在阳台的花盆前小心翼翼地把幼苗移栽进新土里，用手指压实根部周围的土壤再浇透水' },
    { text: '收纳', append: '把乱糟糟的抽屉柜子全部清空，分类整理好再一件件放回去，贴上标签看着整齐的成果' },
    { text: '倒垃圾', append: '拎着系好的垃圾袋下楼，在暮色中走到小区垃圾站，扔完袋子拍了拍手上的灰长舒一口气' },
    { text: '换床单', append: '把旧床单扯下来揉成一团扔进脏衣篮，抖开干净的床单四个角拉平塞进床垫下' },
    { text: '取快递', append: '收到取件码后溜达到驿站，在货架间穿梭找到自己的包裹' },
  ]},
  { group: '🎉 社交活动', chips: [
    { text: '聚会', append: '热闹的聚会上觥筹交错，和朋友们谈天说地，笑声此起彼伏' },
    { text: '访友', append: '按响朋友家的门铃，进门后熟稔地换上拖鞋，窝在沙发上聊起近况' },
    { text: '约会', append: '精心打扮后赴约，和对方在餐厅或公园里度过一段甜蜜的时光' },
    { text: '看电影', append: '抱着爆米花坐在昏暗的影院里，银幕上的光影变幻在脸上流转' },
    { text: '看演出', append: '坐在剧场或Livehouse里，沉浸在舞台上的表演中' },
    { text: '旅行', append: '背上行囊踏上旅途，陌生的街道和风景让每一天都充满新奇感' },
    { text: '野餐', append: '在公园的草坪上铺开野餐垫，阳光透过树叶洒下斑驳的光影' },
    { text: '露营', append: '在星空下搭起帐篷，篝火的噼啪声和远处的虫鸣交织成夜的交响曲' },
    { text: '唱K', append: '在KTV包厢里握着话筒嘶吼，屏幕上滚动的歌词映在脸上' },
    { text: '蹦迪', append: '在震耳欲聋的电子音乐中扭动身体，炫目的灯光在黑暗中闪烁' },
    { text: '下午茶', append: '在精致的咖啡馆里找个靠窗的位置坐下，看着窗外人来人往' },
    { text: '烧烤', append: '围在烤炉前翻动着滋滋冒油的肉串，炭火的热气把脸颊烤得发烫' },
    { text: '桌游', append: '一群朋友围在桌前研究游戏规则，时而为策略争论不休' },
    { text: '密室逃脱', append: '和朋友们被锁在主题密室里四处翻找线索' },
  ]},
  { group: '🍳 饮食烹饪', chips: [
    { text: '早餐', append: '在晨光中给自己准备一份简单的早餐，煎蛋在平底锅里滋滋作响' },
    { text: '午餐', append: '在食堂或餐馆里解决午间的温饱，打量周围食客的餐盘' },
    { text: '晚餐', append: '在暖黄的灯光下享受一顿精心准备的晚餐' },
    { text: '夜宵', append: '深夜肚子咕咕叫，溜进厨房煮了碗泡面或热了杯牛奶' },
    { text: '烘焙', append: '围上围裙按照食谱称量面粉和糖，把面糊倒进模具送进烤箱' },
    { text: '煲汤', append: '把洗净的食材依次放入砂锅加满水，盖上盖子用小火慢炖' },
    { text: '煮面', append: '等锅里的水烧开后将面条散开放进去用筷子拨散' },
    { text: '凉拌', append: '把黄瓜拍碎切段放在大碗里，加入蒜末醋酱油和辣椒油拌匀' },
  ]},
  { group: '🎮 休闲娱乐', chips: [
    { text: '打游戏', append: '窝在沙发里握着游戏手柄全神贯注地盯着屏幕' },
    { text: '追剧', append: '裹着毯子窝在被窝里抱着平板一集接一集地看' },
    { text: '阅读', append: '靠在窗边或窝在沙发角落里翻开一本书' },
    { text: '听音乐', append: '戴上耳机闭上眼睛，身体随着旋律轻轻晃动' },
    { text: '画画', append: '坐在画架前握着铅笔端详着画纸，沉浸在光影和轮廓的世界里' },
    { text: '摄影', append: '端着相机在街头或公园里寻找好看的构图' },
    { text: '钓鱼', append: '坐在水边支好鱼竿挂上饵料把线甩出去' },
    { text: '园艺', append: '戴上手套拿着小铲子在花园里松土除草修剪枝叶' },
    { text: '练字', append: '铺开宣纸倒好墨汁提起毛笔，笔尖在纸上游走留下端正的墨迹' },
  ]},
  { group: '📚 学习进修', chips: [
    { text: '自习', append: '在图书馆的自习区找了个靠窗的位置坐下翻开书本' },
    { text: '上网课', append: '打开笔记本电脑登录网课平台戴上耳机调好音量' },
    { text: '背单词', append: '握着手机或单词书一个一个地过，嘴里小声默念着发音和释义' },
    { text: '写论文', append: '坐在书桌前对着电脑屏幕拧着眉头反复措辞' },
    { text: '编程', append: '对着屏幕上的代码一行行排查逻辑漏洞' },
    { text: '考试', append: '坐在考场上笔尖在试卷上沙沙作响，偶尔抬头看一眼墙上的时钟' },
    { text: '面试', append: '坐在面试官对面，努力保持微笑的同时大脑飞速运转' },
  ]},
  { group: '💼 工作职场', chips: [
    { text: '参加会议', append: '抱着笔记本走进会议室在长桌边找到位置坐下' },
    { text: '出差', append: '拎着行李箱在机场办理值机托运' },
    { text: '加班', append: '办公室里只剩下自己一个人，键盘的敲击声在空荡的楼层里格外清晰' },
    { text: '述职', append: '站在会议室的白板前对着领导和同事汇报工作成果' },
    { text: '辞职', append: '把打印好的辞职信折好放进信封里，深吸了一口气敲响领导办公室的门' },
  ]},
  { group: '💒 特殊事件', chips: [
    { text: '婚礼', append: '穿着礼服站在装饰精美的会场里，在亲友的见证下说出誓言' },
    { text: '搬家', append: '在堆满纸箱的房间里穿梭整理，每翻出一件旧物都勾起一段回忆' },
    { text: '生日', append: '对着插满蜡烛的蛋糕双手合十闭上眼睛许愿' },
    { text: '跨年', append: '挤在热闹的人群中仰头望着夜空中炸开的璀璨烟花' },
    { text: '纪念日', append: '精心安排了整天的行程，每个环节都有特别的意义' },
    { text: '扫墓', append: '提着香烛纸钱和供品沿着山路往上走' },
  ]},
  { group: '🛍️ 购物逛街', chips: [
    { text: '逛商场', append: '在商场里一层一层逛上去在每家感兴趣的店铺前驻足' },
    { text: '超市采购', append: '推着购物车在货架间穿行对照着购物清单拿起一样样东西' },
    { text: '菜市场', append: '在菜市场里走走停停和小贩讨价还价挑挑拣拣' },
    { text: '网购拆箱', append: '从驿站取回包裹一路小跑回家迫不及待地拆开快递箱' },
  ]},
  { group: '🚗 出行交通', chips: [
    { text: '公交', append: '挤在高峰期的公交车厢里拉着吊环站着' },
    { text: '自驾', append: '握着方向盘行驶在熟悉的路上，车窗半开风吹进来' },
    { text: '骑行', append: '蹬着自行车在城市的街道间穿行，风掠过耳畔' },
    { text: '坐地铁', append: '站在地铁车厢门边的位置握着吊环' },
    { text: '赶高铁', append: '拎着包在候车大厅里一路小跑' },
    { text: '堵车', append: '被堵在高架路中间前后都是红彤彤的刹车灯' },
  ]},
  { group: '🌙 夜间活动', chips: [
    { text: '散步', append: '在夜色中沿着路灯慢慢走，月亮挂在天上洒下银白的光' },
    { text: '看夜景', append: '站在天台上扶着栏杆俯瞰城市的万家灯火' },
    { text: '失眠', append: '翻来覆去地睡不着，盯着黑暗中的天花板数羊' },
    { text: '夜读', append: '在床头开着暖黄色的小台灯翻着书页' },
    { text: '深夜泡面', append: '肚子在半夜咕咕叫蹑手蹑脚溜进厨房烧了壶水泡上面' },
    { text: '泡酒吧', append: '推开酒吧沉重的木门在吧台的高脚凳上坐下来' },
  ]},
  { group: '🥰 情感互动', chips: [
    { text: '拥抱', append: '张开双臂把对方搂进怀里，感受彼此的温度隔着衣料传来' },
    { text: '亲吻', append: '慢慢凑近对方的脸庞，在唇瓣相触的瞬间屏住呼吸' },
    { text: '牵手', append: '手指慢慢靠近然后交握在一起，掌心的温度传来' },
    { text: '依偎', append: '靠进对方的怀里，把头枕在肩窝处，闻着熟悉的气息' },
    { text: '撒娇', append: '扯着对方的袖口左右摇晃，声音软糯地提着小要求' },
    { text: '调情', append: '凑到对方耳边压低声音说了句什么' },
    { text: '说情话', append: '捧着对方的脸认真地看着眼睛一字一句地说出心里话' },
    { text: '早安吻', append: '清晨在对方额头上轻轻落下一吻' },
    { text: '晚安吻', append: '关了灯在黑暗里摸索着找到对方的嘴唇轻轻碰了一下' },
  ]},
];

var lifeDoc导航 = [
  { id: 'chars', label: '👤 角色库' },
  { id: 'plan', label: '📋 生活规划' },
  { id: 'writing', label: '✍️ 写作台' },
];

function lifeDoc切换视图(view) {
  lifeDoc当前视图 = view;
  var el = document.getElementById('life-docContent');
  if (!el) return;
  if (!lifeDocApi) {
    lifeDocApi = 渲染标签栏(el, lifeDoc导航, { active: view, subId: 'lifeDocViewContent', onSwitch: function(v){ lifeDoc切换视图(v); } });
  } else {
    lifeDocApi.setActive(view);
  }
  var vEl = lifeDocApi.sub;
  switch (view) {
    case 'chars':   lifeDoc渲染角色库(vEl); break;
    case 'plan':    lifeDoc渲染生活规划(vEl); break;
    case 'writing': ldw渲染写作台(vEl); break;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  lifeDoc加载角色().then(function() {
    lifeDoc切换视图('chars');
  });
});

window.lifeDoc切换视图 = lifeDoc切换视图;
window.lifeDoc保存角色 = lifeDoc保存角色;
window.lifeDoc加载日程 = lifeDoc加载日程;
window.lifeDoc保存日程 = lifeDoc保存日程;
window.lifeDoc加载自定义日 = lifeDoc加载自定义日;
window.lifeDoc保存自定义日 = lifeDoc保存自定义日;
window.lifeDoc删除日程 = lifeDoc删除日程;
window.lifeDoc天类型文件名 = lifeDoc天类型文件名;
window.PRESET_DAYS = PRESET_DAYS;
window.lifeDoc活动芯片 = lifeDoc活动芯片;
