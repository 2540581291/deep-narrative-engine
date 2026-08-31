// 情欲工坊 · 文学改编 · 改编模块共享工厂
// 为 童话改编 / 历史改编 / 神话改编 / 名著改编 / 寓言改编 提供统一的 list/editor/经典库 逻辑
// 创作页为卡片式：作品信息（标题+改编原作） / 选题（题材+露骨度+风格+角色） / 灵感素材（意象+随机） / AI 生成 / 改编

// ===== 共享题材选项（沿用淫诗艳曲通用）=====
var 文学改编题材选项 = ['口交', '乳交', '调教', '绿帽', '人妻', '乱伦', '足交', '露出', '肛交', '群交'];
// ===== 露骨度选项（两档）=====
var 文学改编露骨度选项 = ['含蓄隐晦', '粗俗露骨'];
var 文学改编露骨度解释表 = {
  '含蓄隐晦': '以隐喻借代写性、不明写性事',
  '粗俗露骨': '直接描写性器官与性行为、用词大胆，性描写毫不遮掩'
};

// ===== 灵感素材卡·意象库（沿用淫诗艳曲内置，模块可覆盖）=====
var 文学改编意象库 = {
  '身体': ['乳房', '乳头', '乳晕', '腰', '臀', '大腿', '阴毛', '肚脐', '锁骨', '脖颈', '嘴唇', '舌头', '手指', '脚', '脚踝', '肩膀', '腋窝', '膝弯'],
  '性器官': ['阴蒂', '阴唇', '阴阜', '阴道', '子宫', '处女膜', '阴茎', '龟头', '包皮', '阴囊', '睾丸', '尿道口', '前列腺', '肛门'],
  '玩具': ['跳蛋', '按摩棒', '假阳具', '振动棒', '飞机杯', '贞操带', '乳夹', '肛塞', '口塞', '锁精环', '皮鞭', '手铐', '项圈', '绳索', '蜡烛', '枷锁'],
  '动作': ['操', '干', '插', '捅', '抽', '顶', '舔', '吮', '含', '咬', '吸', '揉', '捏', '掐', '拍', '打', '扇', '抓', '压', '骑', '塞', '灌', '射', '尿', '拉', '滴', '深喉', '口爆', '颜射', '潮吹', '肛交'],
  '污物': ['尿', '粪', '精液', '包皮垢', '淫水', '白带', '经血', '前列腺液', '口水', '汗液'],
  '场景': ['春宵', '闺房', '浴室', '书房', '花园', '月下', '花前', '灯下', '帐中', '舟中', '屏风后', '池畔', '更衣室', '办公室', '电梯', '车里', '阳台', '天台', '酒吧', '浴室镜前', '雨夜', '雪夜', '午后', '深夜'],
  '衣服': ['船袜', '白丝', '黑丝', '渔网袜', '吊裤袜', '开裆裤', '肚兜', '亵衣', '绣花鞋', '旗袍', '吊带袜', '高跟鞋', '女仆装', '护士装', '教师装', '水手服', '和服', '汉服', '婚纱', '制服', '蕾丝内衣', '丁字裤', '情趣内衣', '猫耳', '眼罩', '项圈', '皮衣', '皮革手套', '露背装'],
};

// 经典库筛选配置常量（各模块 cfg 引用）
var 文学改编朝代轴 = ['先秦', '汉', '魏晋', '南北朝', '隋', '隋末唐初', '唐', '唐末宋初', '五代', '宋', '辽', '金', '宋末金初', '宋末元初', '元', '金末元初', '元末明初', '明', '明末清初', '清', '清末民国初', '清末近现代初', '近现代', '近现代末当代初', '民国末当代初', '当代'];
// 古典题材库（经典库题材行命中用；现按儿童故事类型分：标题/内容关键词出现即归入）
var 文学改编古典题材库 = [
  { key: '经典童话', kws: ['白雪公主', '小红帽', '灰姑娘', '睡美人', '青蛙王子', '皇帝的新装', '丑小鸭', '美人鱼', '海的女儿', '木偶奇遇记', '三只小猪', '拇指姑娘', '卖火柴', '豌豆公主', '勇敢的小裁缝', '安徒生', '格林', '爱丽丝', '夜莺', '野天鹅', '魔豆', '长发公主', '莴苣', '白雪', '青蛙'] },
  { key: '寓言故事', kws: ['寓言', '伊索', '龟兔赛跑', '乌鸦喝水', '狐狸与', '狼与', '狮子与', '农夫与', '蚂蚁与', '寓意', '哲理', '龟兔', '狼来了', '金斧头', '磨坊'] },
  { key: '成语故事', kws: ['守株待兔', '掩耳盗铃', '刻舟求剑', '惊弓之鸟', '初出茅庐', '班门弄斧', '三顾茅庐', '调虎离山', '揠苗助长', '滥竽充数', '狐假虎威', '画蛇添足', '亡羊补牢', '井底之蛙', '对牛弹琴', '叶公好龙', '自相矛盾', '郑人买履', '塞翁失马', '愚公移山', '成语'] },
  { key: '神话传说', kws: ['女娲', '盘古', '嫦娥', '后羿', '夸父', '精卫', '哪吒', '大禹', '牛郎', '织女', '龙王', '十二生肖', '年兽', '龙抬头', '宝莲灯', '西游', '封神', '神话', '传说', '凤凰', '麒麟'] },
  { key: '民间故事', kws: ['阿凡提', '田螺姑娘', '孟姜女', '梁山伯', '祝英台', '白蛇', '许仙', '聊斋', '子不语', '狐仙', '巧媳妇', '财主', '长工', '员外', '状元', '包公', '民间', '对联'] },
  { key: '动物故事', kws: ['小兔', '兔子', '小熊', '小猫', '小狗', '小猴', '狐狸', '大灰狼', '乌龟', '青蛙', '蚂蚁', '大象', '狮子', '老虎', '老鼠', '小羊', '小猪', '小马', '小鹿', '刺猬', '松鼠', '小鸟', '小鸡', '小鸭', '小鱼', '蜗牛', '蝴蝶', '蜜蜂', '螃蟹', '恐龙', '斑马', '犀牛', '河马', '海豚', '鲸', '蛇', '蜘蛛', '孔雀', '燕子', '乌鸦', '老鹰', '猫头鹰', '大公鸡', '花母鸡', '鹅', '猫', '鹅妈妈', '鳄鱼', '蚕'] },
  { key: '自然科普', kws: ['为什么', '科学', '实验', '四季', '天气', '影子', '磁铁', '种子', '植物', '彩虹', '星星', '月亮', '太阳', '露珠', '昆虫', '变色龙'] },
  { key: '成长励志', kws: ['努力', '坚持', '勇敢', '梦想', '成长', '不怕', '独立', '成功', '失败', '第一次', '学会', '进步', '信心', '勇气'] },
  { key: '品德教育', kws: ['诚实', '分享', '礼貌', '孝顺', '感恩', '守信用', '节约', '帮助', '团结', '善良', '习惯', '排队', '卫生', '懂事', '谦虚', '责任'] },
  { key: '亲情友情', kws: ['朋友', '友谊', '妈妈', '爸爸', '爷爷', '奶奶', '爱', '陪伴', '伙伴', '温暖', '一家人', '家', '友情', '情感'] },
  { key: '历史故事', kws: ['诸葛亮', '刘备', '关羽', '张飞', '曹操', '孙权', '周瑜', '岳飞', '包公', '包拯', '孔子', '秦始皇', '刘邦', '项羽', '韩信', '李白', '杜甫', '苏轼', '司马光', '曹冲', '孟母', '唐太宗', '武则天', '完璧归赵', '卧薪尝胆', '破釜沉舟', '三顾茅庐', '花木兰', '杨家将', '郑成功', '华佗', '扁鹊', '桃园结义', '文天祥', '朱元璋', '乾隆', '康熙', '赤壁', '安史之乱', '三国', '隋唐', '汉朝', '唐朝', '宋朝', '明朝', '清朝', '历史', '武松', '林冲', '包青天', '春秋', '战国'] },
];
var 文学改编作者档位 = { 低: 2, 中: 10, 顶: 50 };

// ===== 主角类型库（经典库「主角」筛选行：标题/内容命中即归入）=====
var 文学改编主角类型库 = [
  { key: '动物', kws: ['兔子', '小熊', '小猫', '小狗', '小猴', '狐狸', '大灰狼', '乌龟', '青蛙', '蚂蚁', '大象', '狮子', '老虎', '老鼠', '小羊', '小猪', '小马', '小鹿', '刺猬', '松鼠', '小鸟', '小鸡', '小鸭', '小鱼', '蜗牛', '蝴蝶', '蜜蜂', '蜻蜓', '螃蟹', '恐龙', '斑马', '犀牛', '河马', '海豚', '鲸', '蛇', '蜘蛛', '孔雀', '燕子', '麻雀', '乌鸦', '老鹰', '猫头鹰', '大公鸡', '花母鸡', '鹅', '鸭', '猫', '鹅妈妈', '海参', '鳄鱼', '蚕', '蝉'] },
  { key: '人物', kws: ['小朋友', '小男孩', '小女孩', '孩子', '宝宝', '娃娃', '学生', '同学', '老师', '妈妈', '爸爸', '爷爷', '奶奶', '哥哥', '姐姐', '妹妹', '弟弟', '朋友', '伙伴', '农民', '牧童', '猎人', '渔夫', '鞋匠', '裁缝', '厨师', '医生', '男孩', '女孩', '樵夫', '将军', '公主', '王子', '国王', '小姐', '公子'] },
  { key: '拟人物品', kws: ['铅笔', '橡皮', '书包', '鞋子', '帽子', '雨伞', '杯子', '桌子', '椅子', '门', '窗', '灯', '钟', '镜子', '枕头', '被子', '闹钟', '小汽车', '火车', '飞机', '房子', '船', '风筝', '皮球', '风筝', '画', '书', '石头', '扫帚', '茶壶'] },
  { key: '自然物', kws: ['太阳', '月亮', '星星', '云', '风', '雨', '雪', '冰', '大海', '河流', '小溪', '山', '树', '花', '草', '露珠', '彩虹', '石头', '森林', '池塘', '泥土', '落叶', '春风', '雪花', '晚霞'] },
  { key: '神怪', kws: ['仙女', '神仙', '妖怪', '鬼', '狐仙', '龙', '凤凰', '精灵', '巫婆', '巨人', '小精灵', '魔法', '妖精', '幽灵', '怪物', '魔王', '精灵', '神'] },
];
// ===== 内容标签库（经典库「标签」筛选行：标题/内容命中多个关键词即打多标签）=====
var 文学改编内容标签库 = [
  { key: '动物', kws: ['兔子', '小熊', '小猫', '小狗', '小猴', '狐狸', '乌龟', '青蛙', '蚂蚁', '大象', '狮子', '老虎', '老鼠', '小猪', '小鸟', '小鱼', '刺猬', '松鼠', '蝴蝶', '蜜蜂', '恐龙', '斑马', '海豚', '鲸', '蛇', '蜘蛛', '孔雀', '燕子', '乌鸦', '猫头鹰', '鸡', '鸭', '鹅', '猫', '狗', '牛', '马', '羊', '猴'] },
  { key: '植物', kws: ['花', '树', '草', '种子', '树叶', '苹果', '西瓜', '桃子', '蘑菇', '麦子', '棉花', '竹子', '向日葵', '玫瑰', '葡萄', '橘子', '草莓', '森林', '园', '瓜', '豆', '玉米', '稻'] },
  { key: '自然', kws: ['春天', '夏天', '秋天', '冬天', '彩虹', '星星', '月亮', '太阳', '云', '雨', '雪', '大海', '河流', '小溪', '森林', '草地', '天气', '季节', '风', '冰', '露珠'] },
  { key: '魔法', kws: ['魔法', '魔棒', '魔女', '巫婆', '仙棒', '神奇', '咒语', '法力', '仙子', '精灵', '变身', '魔', '宝', '愿望'] },
  { key: '冒险', kws: ['冒险', '探险', '旅行', '出发', '远行', '寻宝', '找到', '旅程', '迷路', '山洞', '海上', '岛上', '森林里', '闯荡'] },
  { key: '友情', kws: ['朋友', '友情', '伙伴', '帮忙', '一起', '友谊', '好伙伴', '互相', '陪伴', '帮助'] },
  { key: '亲情', kws: ['妈妈', '爸爸', '爷爷', '奶奶', '哥哥', '姐姐', '妹妹', '弟弟', '家人', '家', '母亲', '父亲', '温暖', '爱'] },
  { key: '美食', kws: ['好吃', '食物', '蛋糕', '饼干', '西瓜', '冰淇淋', '吃饭', '做饭', '糖果', '面包', '水果', '汤', '饺子', '香'] },
  { key: '科学', kws: ['为什么', '科学', '实验', '自然', '磁铁', '影子', '光', '声音', '电', '重力', '秘密', '原理', '发现', '发明'] },
  { key: '成长', kws: ['长大', '成长', '学会', '勇敢', '坚持', '努力', '梦想', '第一次', '进步', '害怕', '不哭', '战胜', '成功', '失败'] },
  { key: '品德', kws: ['诚实', '分享', '礼貌', '孝顺', '感恩', '帮助', '谦虚', '友好', '守信', '节约', '爱心', '责任', '团结', '智慧', '善良'] },
  { key: '习惯', kws: ['刷牙', '洗澡', '睡觉', '起床', '上学', '洗手', '收拾', '排队', '卫生', '挑食', '作息', '吃饭', '穿衣服', '懂礼貌'] },
  { key: '游戏', kws: ['游戏', '玩耍', '运动会', '比赛', '捉迷藏', '踢球', '荡秋千', '跳', '跑', '玩'] },
  { key: '节日', kws: ['春节', '新年', '中秋', '端午', '圣诞', '生日', '节日', '过年', '月饼', '除夕', '元宵', '国庆'] },
  { key: '梦想', kws: ['梦想', '愿望', '理想', '希望', '想成为', '想当', '心愿'] },
];

// ===== 著名库（经典库「著名」筛选：标题命中知名作品即视为著名）=====
var 文学改编著名库 = ['白雪公主', '小红帽', '灰姑娘', '睡美人', '青蛙王子', '皇帝的新装', '丑小鸭', '美人鱼', '海的女儿', '木偶奇遇记', '三只小猪', '拇指姑娘', '卖火柴的小女孩', '勇敢的小裁缝', '长发公主', '野天鹅', '夜莺', '金鹅', '爱丽丝', '杰克与魔豆', '龟兔赛跑', '乌鸦喝水', '狐狸和葡萄', '狼来了', '井底之蛙', '守株待兔', '掩耳盗铃', '揠苗助长', '拔苗助长', '画蛇添足', '亡羊补牢', '对牛弹琴', '叶公好龙', '自相矛盾', '郑人买履', '刻舟求剑', '狐假虎威', '塞翁失马', '滥竽充数', '买椟还珠', '鹬蚌相争', '螳螂捕蝉', '邯郸学步', '东施效颦', '杞人忧天', '寒号鸟', '女娲补天', '女娲造人', '盘古开天', '盘古开天辟地', '嫦娥奔月', '后羿射日', '夸父追日', '精卫填海', '大禹治水', '牛郎织女', '神农尝百草', '八仙过海', '哪吒闹海', '十二生肖', '年兽', '宝莲灯', '白蛇传', '封神', '山海经', '武松打虎', '诸葛亮', '曹冲称象', '孔融让梨', '三顾茅庐', '破釜沉舟', '卧薪尝胆', '孟母三迁', '司马光砸缸', '花木兰', '包公', '包拯', '完璧归赵', '负荆请罪', '望梅止渴', '草船借箭', '空城计', '韩信', '鲁滨逊', '小美人鱼', '金发姑娘', '莴苣', '神笔马良', '红楼梦', '三国演义', '西游记', '水浒传', '封神演义', '聊斋志异', '儒林外史', '镜花缘', '老残游记', '官场现形记', '傲慢与偏见', '简爱', '呼啸山庄', '战争与和平', '安娜·卡列尼娜', '巴黎圣母院', '悲惨世界', '基督山伯爵', '双城记', '雾都孤儿', '红与黑', '包法利夫人', '茶花女', '罗密欧与朱丽叶', '哈姆雷特', '唐吉诃德', '鲁滨逊漂流记', '格列佛游记', '汤姆·索亚历险记', '爱丽丝梦游仙境'];


function 文学改编体模块工厂(cfg) {
  // cfg: { storeKey, containerId, viewContentId, prefix, windowPrefix, navLabelList, navLabelEdit, navLabelClassic,
  //        promptName, titlePrompt, adaptPrompt, apprPrompt, aiFieldId, aiLabel,
  //        classicLabel, dbPath, dbFormat, 题材选项, 露骨度选项, 意象库, 风格选项, 默认露骨度 }
  var 导航 = [
    { id: 'list', label: cfg.navLabelList || '📋 列表' },
    { id: 'editor', label: cfg.navLabelEdit || '📝 创作' },
    { id: 'classic', label: cfg.navLabelClassic || '📚 经典库' },
  ];
  var 当前视图 = 'list';
  var _editTitle = null;
  var 编辑状态 = {};
  var 创作防抖保存 = null;
  var 默认露骨度 = cfg.默认露骨度 || '粗俗露骨';
  var 题材选项 = cfg.题材选项 || 文学改编题材选项;
  var 露骨度选项 = cfg.露骨度选项 || 文学改编露骨度选项;
  var 意象库 = cfg.意象库 || 文学改编意象库;
  var 风格选项 = cfg.风格选项 || ['暗黑成人', '浪漫香艳', '权力反转', '纯爱改编', '荒诞幽默'];

  function 切换视图(view) {
    当前视图 = view;
    var el = document.getElementById(cfg.containerId);
    if (!el) return;
    var h = '<div class="tl-subnav">';
    导航.forEach(function(v) { h += '<div class="tl-subitem' + (v.id === 当前视图 ? ' act' : '') + '" data-view="' + v.id + '">' + v.label + '</div>'; });
    h += '</div><div id="' + cfg.viewContentId + '"></div>';
    el.innerHTML = h;
    var vEl = document.getElementById(cfg.viewContentId);
    if (!vEl) return;
    el.querySelectorAll('.tl-subitem').forEach(function(i) { i.addEventListener('click', function() {
      var v = this.getAttribute('data-view');
      if (v === 'editor') { 新创作(); return; }
      切换视图(v);
    }); });
    switch (view) {
      case 'list': 渲染列表(vEl); break;
      case 'editor': 渲染编辑器(vEl); break;
      case 'classic': 渲染经典库(vEl); break;
    }
  }

  function 新创作() { _editTitle = null; 切换视图('editor'); }

  function 渲染列表(el) {
    Store[cfg.storeKey].list().then(function(items) {
      var h = '<div class="mb-10"><button class="btn-new" onclick="' + cfg.windowPrefix + '新创作()">＋ 新建</button></div>';
      // 题材筛选行
      h += 筛选行('题材', ['全部'].concat(题材选项), 筛选状态.genre, cfg.windowPrefix + '筛选', 'genre');
      // 露骨度筛选行
      h += 筛选行('露骨度', ['全部'].concat(露骨度选项), 筛选状态.explicit, cfg.windowPrefix + '筛选', 'explicit');
      // 风格筛选行
      h += 筛选行('风格', ['全部'].concat(风格选项), 筛选状态.style, cfg.windowPrefix + '筛选', 'style');
      var filtered = items || [];
      if (筛选状态.genre && 筛选状态.genre !== '全部') filtered = filtered.filter(function(i) { var g = Array.isArray(i.genre) ? i.genre : (i.genre ? [i.genre] : []); return g.indexOf(筛选状态.genre) >= 0; });
      if (筛选状态.explicit && 筛选状态.explicit !== '全部') filtered = filtered.filter(function(i) { return (i.explicit || 默认露骨度) === 筛选状态.explicit; });
      if (筛选状态.style && 筛选状态.style !== '全部') filtered = filtered.filter(function(i) { return (i.style || '') === 筛选状态.style; });
      if (!filtered.length) { h += '<div class="placeholder-text">暂无作品</div>'; }
      else {
        filtered.forEach(function(item) {
          h += '<div class="n-card cur-ptr mb-6 p-10" onclick="' + cfg.windowPrefix + '阅读(\'' + escHtml(item.title) + '\')">';
          h += '<div class="fw-600 fs-14">' + escHtml(item.title) + '</div>';
          if (item.original) h += '<div class="text-sm text-muted">📖 改编自：' + escHtml(item.original) + '</div>';
          h += '<div class="mt-4 flex gap-4 flex-wrap">';
          if (item.explicit) h += '<span class="badge-tag">' + escHtml(item.explicit) + '</span>';
          if (item.style) h += '<span class="badge-tag">' + escHtml(item.style) + '</span>';
          var genres = Array.isArray(item.genre) ? item.genre : (item.genre ? [item.genre] : []);
          if (genres.length) h += genres.map(function(g){return '<span class="badge-tag">' + escHtml(g) + '</span>';}).join('');
          var tagsArr = Array.isArray(item.tags) ? item.tags : (item.tags ? [item.tags] : []);
          if (tagsArr.length) h += tagsArr.map(function(t){return '<span class="badge-tag">' + escHtml(t) + '</span>';}).join('');
          h += '</div>';
          h += '<div class="text-muted text-sm mt-4" style="white-space:pre-wrap">' + escHtml(item.content||'').slice(0,120) + '</div>';
          h += '<div class="mt-6 flex gap-4">';
          h += '<span class="btn-secondary btn-sm" onclick="event.stopPropagation();' + cfg.windowPrefix + '编辑项(\'' + escHtml(item.title) + '\')">✏️ 编辑</span>';
          h += '<span class="btn-secondary btn-sm c-error" onclick="event.stopPropagation();' + cfg.windowPrefix + '删除项(\'' + escHtml(item.title) + '\')">🗑 删除</span>';
          h += '</div></div>';
        });
      }
      el.innerHTML = h;
    });
  }

  var 筛选状态 = { genre: '', explicit: '', style: '' };
  function 筛选(field, val) { 筛选状态[field] = val; 切换视图('list'); }

  function 编辑项(title) { _editTitle = title; 切换视图('editor'); }
  function 删除项(title) { confirmDialog('确定删除「' + title + '」？', function(){ Store[cfg.storeKey].delete(title).then(function(){ toast('已删除'); 切换视图('list'); }); }); }

  // ===== 阅读弹窗（正文居中衬线大字 + 赏析区）=====
  function 阅读(title) {
    Store[cfg.storeKey].get(title).then(function(item) {
      item = item || {};
      if (!item.content) { toast('该作品暂无正文'); return; }
      document.querySelectorAll('.ovl').forEach(function(o) { o.remove(); });
      var len = (item.content || '').length;
      var h = '';
      h += '<div class="reader-head">';
      h += '<span class="reader-title">📖 ' + escHtml(item.title || title) + '</span>';
      if (item.original) h += '<span class="reader-tag">改编·' + escHtml(item.original) + '</span>';
      if (item.explicit) h += '<span class="reader-tag">' + escHtml(item.explicit) + '</span>';
      if (item.style) h += '<span class="reader-tag">' + escHtml(item.style) + '</span>';
      var genres2 = Array.isArray(item.genre) ? item.genre : (item.genre ? [item.genre] : []);
      if (genres2.length) h += '<span class="reader-tag">' + escHtml(genres2.join('、')) + '</span>';
      h += '<span class="reader-meta" style="margin-left:auto">' + (len < 80 ? '短' : len < 300 ? '中' : '长') + ' · ' + len + ' 字</span>';
      h += '</div>';
      h += '<div class="reader-body">';
      h += '<div class="reader-poem-title">' + escHtml(item.title || title) + '</div>';
      h += '<div class="reader-poem-author">改编自 ' + (item.original ? escHtml(item.original) : '未注明') + '</div>';
      h += '<div class="reader-poem-text">' + escHtml(item.content || '') + '</div>';
      h += '<div class="reader-appr">';
      if (item.appreciation) {
        h += '<div class="reader-appr-title">✦ 赏析</div>';
        h += '<div class="reader-appr-text">' + escHtml(item.appreciation) + '</div>';
      } else {
        h += '<div class="reader-appr-empty"><div class="text-muted" style="font-size:11px;letter-spacing:2px;margin-bottom:12px">暂无赏析</div></div>';
      }
      h += '<button class="reader-btn" style="margin-top:10px" onclick="' + cfg.windowPrefix + '阅读生成赏析(\'' + escHtml(title) + '\')">🤖 生成赏析</button>';
      h += '</div>';
      h += '</div>';
      h += '<div class="reader-foot">';
      h += '<button class="reader-btn" onclick="' + cfg.windowPrefix + '编辑项(\'' + escHtml(title) + '\')">✏️ 编辑</button>';
      h += '<button class="reader-btn" onclick="' + cfg.windowPrefix + '复制全文(\'' + escHtml(title) + '\')">📋 复制全文</button>';
      h += '<button class="reader-btn primary" onclick="this.closest(\'.ovl\').remove()">关闭</button>';
      h += '</div>';
      showModal('', h, { noWrap: true, cardClass: 'reader-night', ovlClass: 'reader-night-ovl' });
    });
  }

  function 阅读生成赏析(title) {
    Store[cfg.storeKey].get(title).then(function(item) {
      item = item || {};
      if (!item.content) { toast('该作品暂无正文'); return; }
      if (typeof registerAiField === 'undefined') return;
      registerAiField(cfg.aiFieldId + 'Appr', cfg.aiLabel + '赏析', function() {
        var ctx = '作品标题：' + title + '\n改编原作：' + (item.original||'') + '\n题材：' + ((Array.isArray(item.genre) ? item.genre : (item.genre ? [item.genre] : [])).join('、')||'无') + '\n露骨度：' + (item.explicit||'') + '\n风格：' + (item.style||'') + '\n正文：\n' + item.content;
        var r = renderPrompt(cfg.apprPrompt, { ctx: ctx, charCtx: '' }); return { user: r.user, system: r.system };
      }, { fillFn: function(d) {
        if (!d) return;
        item.appreciation = (d.content || d.text || '');
        Store[cfg.storeKey].save(title, item).then(function(){ toast('赏析已生成'); 阅读(title); });
      }});
      openAiGenPanel(cfg.aiFieldId + 'Appr');
    });
  }

  function 复制全文(title) {
    Store[cfg.storeKey].get(title).then(function(item) {
      item = item || {};
      var text = (item.title || title) + (item.original ? '（改编自' + item.original + '）' : '') + (item.explicit ? ' · ' + item.explicit : '') + '\n' + (item.content || '');
      复制到剪贴板(text).then(function(ok){ toast(ok ? '已复制全文' : '复制失败'); });
    });
  }

  // ===== 自动建档 + 防抖写盘（输入即保存）=====
  function 默认数据() { return { title:'', original:'', content:'', tags:[], genre:[], explicit:默认露骨度, style:'', imagery:[], appreciation:'', roles:[], adaptSource:'', adaptExplicit:'污秽淫化', adaptLen:'维持' }; }

  function 拟建档数据(s) {
    var tagsArr = Array.isArray(s.tags) ? s.tags : (s.tags ? String(s.tags).split(/[、,，\s]+/).filter(Boolean) : []);
    return {
      title: s.title, original: s.original || '', content: s.content || '', tags: tagsArr,
      genre: s.genre || [], explicit: s.explicit || 默认露骨度, style: s.style || '',
      imagery: s.imagery || [], appreciation: s.appreciation || '',
      roles: s.roles || [], adaptSource: s.adaptSource || '',
      adaptExplicit: s.adaptExplicit || '污秽淫化', adaptLen: s.adaptLen || '维持'
    };
  }

  function 自动建档() {
    var t = (编辑状态.title || '').trim();
    if (_editTitle || !t) return Promise.resolve(false);
    return Store[cfg.storeKey].list().then(function(items) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].title === t) { toast('同名作品已存在，草稿未建立'); return false; }
      }
      _editTitle = t;
      var data = 拟建档数据(编辑状态);
      return Store[cfg.storeKey].save(t, data).then(function() { toast('已建立草稿「' + t + '」'); return true; });
    });
  }

  function 写盘() {
    var t = (编辑状态.title || '').trim();
    if (!t || !_editTitle) return;
    if (t !== _editTitle) {
      var oldTitle = _editTitle;
      _editTitle = null;
      Store[cfg.storeKey].delete(oldTitle).catch(function(){}).then(function() {
        var data = 拟建档数据(编辑状态);
        data.title = t;
        Store[cfg.storeKey].save(t, data).then(function(){ _editTitle = t; });
      });
      return;
    }
    Store[cfg.storeKey].get(_editTitle).then(function(m) {
      var data = 拟建档数据(编辑状态);
      Store[cfg.storeKey].save(_editTitle, data).then(function(){});
    });
  }

  function 编辑字段(key, val) {
    编辑状态[key] = val;
    if (_editTitle) {
      if (!创作防抖保存) 创作防抖保存 = 防抖(function(){ 写盘(); }, 400);
      创作防抖保存();
    } else if ((编辑状态.title || '').trim()) {
      自动建档().then(function(ok) {
        if (!ok) return;
        if (!创作防抖保存) 创作防抖保存 = 防抖(function(){ 写盘(); }, 400);
        创作防抖保存();
      });
    }
  }

  function 渲染编辑器(el) {
    if (_editTitle) {
      Store[cfg.storeKey].get(_editTitle).then(function(data) { 渲染表单(el, data||{}); });
    } else {
      var base = 默认数据();
      // 保留「去改编」带入的原文与选项（避免新建时被冲掉）
      base.adaptSource = 编辑状态.adaptSource || '';
      base.adaptExplicit = 编辑状态.adaptExplicit || '污秽淫化';
      base.adaptLen = 编辑状态.adaptLen || '维持';
      base.original = 编辑状态.original || '';
      渲染表单(el, base);
    }
  }

  // ===== 卡片式创作页 =====
  function 共享卡片头(icon, label, extra) {
    var h = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;font-family:var(--font-sans)">';
    h += '<span style="width:3px;height:12px;background:var(--accent2);flex-shrink:0"></span>';
    h += '<span style="font-size:11px;letter-spacing:2px;color:var(--fg2)">' + icon + ' ' + label + '</span>';
    if (extra) h += '<span style="margin-left:auto;font-size:10px;color:var(--fg3);letter-spacing:1px">' + extra + '</span>';
    h += '</div>';
    return h;
  }
  function 共享参数行(label, chipsHtml) {
    var w = 52, hang = w + 4;
    return '<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:wrap;padding-left:' + hang + 'px">'
      + '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:' + w + 'px;flex-shrink:0;margin-left:-' + hang + 'px">' + label + '</span>'
      + chipsHtml + '</div>';
  }
  function 共享灵感侧栏HTML() {
    var h = '<div class="inspire-panel">';
    Object.keys(意象库).forEach(function(cat) {
      var imgs = 意象库[cat].map(function(im) {
        return '<span class="tag-chip inspire-imagery' + ((编辑状态.imagery||[]).indexOf(im) >= 0 ? ' tag-active' : '') + '" data-imagery="' + im + '" onclick="' + cfg.windowPrefix + '切换意象(\'' + im + '\');' + cfg.windowPrefix + '同步chips()">' + im + '</span>';
      }).join('');
      h += 共享参数行(cat, imgs);
    });
    var 灵感行 = '<button class="btn-sm" style="flex-shrink:0" onclick="' + cfg.windowPrefix + '随机灵感()">🎲 随机灵感</button>';
    h += 共享参数行('灵感', 灵感行);
    h += '</div>';
    return h;
  }
  function 渲染表单(el, data) {
    var s = 默认数据();
    s.title = data.title || ''; s.original = data.original || '';
    s.genre = Array.isArray(data.genre) ? data.genre : (data.genre ? [data.genre] : []);
    s.explicit = data.explicit || 默认露骨度; s.style = data.style || '';
    s.content = data.content || '';
    s.tags = (Array.isArray(data.tags) ? data.tags : (data.tags ? String(data.tags).split('、') : [])).join('、');
    s.imagery = data.imagery || []; s.appreciation = data.appreciation || '';
    s.roles = data.roles || [];
    s.adaptSource = data.adaptSource || ''; s.adaptExplicit = data.adaptExplicit || '污秽淫化'; s.adaptLen = data.adaptLen || '维持';
    编辑状态 = s;
    var h = '<div class="mw-600">';
    // ① 作品信息卡：标题（AI建议） + 改编原作
    h += '<div class="n-card p-10 mb-6">';
    h += 共享卡片头('📋', '作品信息', '输入即自动保存');
    h += '<div class="ai-field-row">';
    h += '<input class="llm-input" id="' + cfg.prefix + 'Title" placeholder="标题（失焦即自动建档）" value="' + escHtml(s.title||'') + '" style="flex:2" onchange="' + cfg.windowPrefix + '编辑字段(\'title\',this.value)">';
    h += '<button class="ai-suggest-btn" onclick="openAiGenPanel(\'' + cfg.aiFieldId + 'Suggest\')" title="AI 标题建议">🤖</button>';
    h += '<input class="llm-input" id="' + cfg.prefix + 'Original" placeholder="改编原作（如：小红帽）" value="' + escHtml(s.original||'') + '" style="flex:2" onchange="' + cfg.windowPrefix + '编辑字段(\'original\',this.value)">';
    h += '</div></div>';
    // ② 选题卡：题材 / 露骨度 / 风格 / 角色
    h += '<div class="n-card p-10 mb-6">';
    h += 共享卡片头('🎯', '选题', 'AI 可一键建议');
    h += 共享参数行('题材', 题材选项.map(function(g) {
      return '<span class="tag-chip' + (s.genre.indexOf(g) >= 0 ? ' tag-active' : '') + '" data-genre="' + g + '" onclick="' + cfg.windowPrefix + '切换题材(\'' + g + '\');' + cfg.windowPrefix + '同步chips()">' + g + '</span>';
    }).join(''));
    h += 共享参数行('露骨度', 露骨度选项.map(function(e) {
      return '<span class="tag-chip' + (s.explicit === e ? ' tag-active' : '') + '" data-explicit="' + e + '" onclick="' + cfg.windowPrefix + '编辑字段(\'explicit\',\'' + e + '\');' + cfg.windowPrefix + '同步chips()">' + e + '</span>';
    }).join(''));
    h += 共享参数行('风格', 风格选项.map(function(st) {
      return '<span class="tag-chip' + (s.style === st ? ' tag-active' : '') + '" data-style="' + st + '" onclick="' + cfg.windowPrefix + '编辑字段(\'style\',\'' + st + '\');' + cfg.windowPrefix + '同步chips()">' + st + '</span>';
    }).join(''));
    h += 共享参数行('角色', '<span id="' + cfg.prefix + 'RoleChips">' + 共享角色chipsHTML() + '</span>');
    h += '</div>';
    // ③ 灵感素材卡
    h += '<details class="n-card p-10 mb-6" open><summary style="display:flex;align-items:center;gap:8px;margin-bottom:10px;cursor:pointer;list-style:none;font-family:var(--font-sans)">';
    h += '<span style="width:3px;height:12px;background:var(--accent2);flex-shrink:0"></span>';
    h += '<span style="font-size:11px;letter-spacing:2px;color:var(--fg2)">💡 灵感素材</span>';
    h += '<span style="margin-left:auto;font-size:10px;color:var(--fg3);letter-spacing:1px">点击折叠</span>';
    h += '</summary>';
    h += 共享灵感侧栏HTML();
    h += '</details>';
    // ④ AI 生成卡
    h += '<div class="n-card p-10 mb-6">';
    h += 共享卡片头('🚀', 'AI 生成', '按当前参数生成 · 结果回填表单');
    h += '<div class="mb-6"><textarea class="llm-input llm-input-lg" id="' + cfg.prefix + 'Direction" placeholder="方向（可选，如：突出禁忌感、保留原作悲剧）" style="width:100%;height:64px;resize:vertical"></textarea></div>';
    h += '<button class="btn btn-primary" style="width:100%;padding:10px 18px;font-size:13px" onclick="openAiGenPanel(\'' + cfg.aiFieldId + '\')">🚀 AI 生成</button>';
    h += '</div>';
    // ⑤ 改编卡：原文 + 露骨度/篇幅 + 生成按钮
    h += '<div class="n-card p-10 mb-6">';
    h += 共享卡片头('📥', '改编', '粘贴或导入原文，按选项改编成新作');
    h += '<textarea class="llm-input llm-input-lg" id="' + cfg.prefix + 'AdaptSource" placeholder="要改编的原文（经典库「去改编」自动带入 / 粘贴）" style="width:100%;height:96px;resize:vertical" onchange="' + cfg.windowPrefix + '编辑字段(\'adaptSource\',this.value)">' + escHtml(s.adaptSource||'') + '</textarea>';
    h += 共享参数行('露骨度', ['维持原度','污秽淫化'].map(function(o){
      return '<span class="tag-chip' + ((s.adaptExplicit||'污秽淫化') === o ? ' tag-active' : '') + '" data-adapt-explicit="' + o + '" onclick="' + cfg.windowPrefix + '编辑字段(\'adaptExplicit\',\'' + o + '\');' + cfg.windowPrefix + '同步chips()">' + o + '</span>';
    }).join(''));
    h += 共享参数行('篇幅', ['浓缩','维持','扩写'].map(function(o){
      return '<span class="tag-chip' + ((s.adaptLen||'维持') === o ? ' tag-active' : '') + '" data-adapt-len="' + o + '" onclick="' + cfg.windowPrefix + '编辑字段(\'adaptLen\',\'' + o + '\');' + cfg.windowPrefix + '同步chips()">' + o + '</span>';
    }).join(''));
    h += '<button class="btn btn-primary" style="width:100%;padding:10px 18px;font-size:13px;margin-top:6px" onclick="openAiGenPanel(\'' + cfg.aiFieldId + 'Adapt\')">📥 生成改编</button>';
    h += '</div>';
    el.innerHTML = h;
  }

  function 同步chips() {
    var root = document.getElementById(cfg.viewContentId);
    if (!root) return;
    root.querySelectorAll('.tag-chip').forEach(function(c) {
      if (c.classList.contains('inspire-imagery')) {
        c.classList.toggle('tag-active', (编辑状态.imagery||[]).indexOf(c.getAttribute('data-imagery')) >= 0);
      }
      else if (c.hasAttribute('data-genre')) c.classList.toggle('tag-active', (编辑状态.genre||[]).indexOf(c.getAttribute('data-genre')) >= 0);
      else if (c.hasAttribute('data-explicit')) c.classList.toggle('tag-active', (编辑状态.explicit||默认露骨度) === c.getAttribute('data-explicit'));
      else if (c.hasAttribute('data-style')) c.classList.toggle('tag-active', (编辑状态.style||'') === c.getAttribute('data-style'));
      else if (c.hasAttribute('data-adapt-explicit')) c.classList.toggle('tag-active', (编辑状态.adaptExplicit||'污秽淫化') === c.getAttribute('data-adapt-explicit'));
      else if (c.hasAttribute('data-adapt-len')) c.classList.toggle('tag-active', (编辑状态.adaptLen||'维持') === c.getAttribute('data-adapt-len'));
    });
  }
  function 切换题材(g) {
    var arr = 编辑状态.genre || [];
    arr = arr.indexOf(g) >= 0 ? arr.filter(function(x){return x!==g;}) : arr.concat([g]);
    编辑状态.genre = arr;
  }
  function 切换意象(im) {
    var arr = 编辑状态.imagery || [];
    arr = arr.indexOf(im) >= 0 ? arr.filter(function(x){return x!==im;}) : arr.concat([im]);
    编辑状态.imagery = arr;
  }
  function 随机灵感() {
    if (!意象库) { toast('本模块暂无灵感数据'); return; }
    var cats = Object.keys(意象库);
    var imgs = [];
    cats.forEach(function(c) { var arr = 意象库[c]; if (imgs.length < 6) imgs.push(arr[Math.floor(Math.random()*arr.length)]); });
    var g = 题材选项[Math.floor(Math.random()*题材选项.length)];
    编辑状态.imagery = imgs.slice(0, 3 + Math.floor(Math.random()*3));
    编辑状态.genre = g ? [g] : 编辑状态.genre;
    编辑字段('imagery', 编辑状态.imagery);
    编辑字段('genre', 编辑状态.genre);
    同步chips();
    toast('灵感已填入：' + 编辑状态.imagery.slice(0,3).join('、') + (g ? ' · ' + g : ''));
  }

  // ===== 角色导入（stcdOpenCharPicker 全局组件）=====
  function 共享角色名(c) { var bi = c && c.identity && c.identity.basicInfo || {}; return bi.name || '未命名'; }
  function 共享角色上下文() {
    var arr = (编辑状态.roles || []).map(function(c) {
      return '【' + 共享角色名(c) + '】\n' + (typeof window.角色卡身份与外貌 === 'function' ? window.角色卡身份与外貌(c) : JSON.stringify(c || {}));
    });
    if (!arr.length) return '';
    return '【要写的相关人物】\n\n' + arr.join('\n\n');
  }
  function 共享角色chipsHTML() {
    var h = '';
    (编辑状态.roles || []).forEach(function(c) {
      h += '<span class="tag-chip" title="点击移除" onclick="' + cfg.windowPrefix + '移除角色(this)">' + escHtml(共享角色名(c)) + ' ✕</span>';
    });
    if ((编辑状态.roles||[]).length) h += '<span class="tag-chip" style="color:var(--fg3)" title="清空已导入角色" onclick="' + cfg.windowPrefix + '清空角色()">✕ 清空</span>';
    h += '<span class="tag-chip" style="color:var(--accent);cursor:pointer" title="从角色卡导入" onclick="' + cfg.windowPrefix + '导入角色()">📂 导入</span>';
    return h;
  }
  function 共享刷新角色行() { var el = document.getElementById(cfg.prefix + 'RoleChips'); if (el) el.innerHTML = 共享角色chipsHTML(); }
  function 共享移除角色(chip) { var name = chip.textContent.replace(' ✕','').trim(); 编辑状态.roles = (编辑状态.roles||[]).filter(function(c){ return 共享角色名(c) !== name; }); 编辑字段('roles', 编辑状态.roles); 共享刷新角色行(); }
  function 共享清空角色() { 编辑状态.roles = []; 编辑字段('roles', []); 共享刷新角色行(); }
  function 共享导入角色() {
    stcdOpenCharPicker('', { onPick: function(data) {
      if (!data) { toast('角色数据不存在'); return; }
      编辑状态.roles = 编辑状态.roles || [];
      编辑状态.roles.push(JSON.parse(JSON.stringify(data)));
      编辑字段('roles', 编辑状态.roles);
      共享刷新角色行();
      toast('已导入角色：' + 共享角色名(data));
    } });
  }

  // ===== AI 参数段（选题 + 灵感素材，有值才列）=====
  function 共享参数上下文() {
    var ctx = '';
    if (编辑状态.original) ctx += '改编原作：' + 编辑状态.original + '\n';
    if (编辑状态.style) ctx += '风格：' + 编辑状态.style + '\n';
    if (编辑状态.genre && 编辑状态.genre.length) ctx += '题材：' + 编辑状态.genre.join('、') + '\n';
    if (编辑状态.explicit) ctx += '露骨度：' + 编辑状态.explicit + (文学改编露骨度解释表[编辑状态.explicit] ? '\n　' + 文学改编露骨度解释表[编辑状态.explicit] : '') + '\n';
    if (编辑状态.imagery && 编辑状态.imagery.length) ctx += '意象：' + 编辑状态.imagery.join('、') + '\n';
    return ctx;
  }

  // ===== 经典库（读 renderer/数据库）=====
  var 经典缓存 = null;
  var 经典分页 = 0;
  var 经典每页 = 50;
  var 经典筛选 = { dynasty: '', theme: '', protagonist: '', tag: '', length: '', famous: '' };
  var 经典搜索 = '';
  var 经典作者统计 = null;
  var 经典题材缓存 = null;
  var 经典主角缓存 = null;
  var 经典标签缓存 = null;
  var 经典著名缓存 = null;
  var 经典题材库 = 文学改编古典题材库;
  var 经典主角库 = 文学改编主角类型库;
  var 经典标签库 = 文学改编内容标签库;
  var 经典著名库 = 文学改编著名库;
  var 经典朝代轴 = 文学改编朝代轴;
  var 经典档位 = 文学改编作者档位;

  var 经典朝代列表 = null;
  function 经典获取朝代() {
    if (经典朝代列表) return 经典朝代列表;
    var seen = {};
    经典缓存.all.forEach(function(p) { var d = p.dynasty || ''; if (d && !seen[d]) seen[d] = 1; });
    var list = Object.keys(seen);
    var 轴 = {}; 经典朝代轴.forEach(function(d, i) { 轴[d] = i; });
    list.sort(function(a, b) {
      var ai = 轴[a], bi = 轴[b];
      if (ai !== undefined && bi !== undefined) return ai - bi;
      if (ai !== undefined) return -1;
      if (bi !== undefined) return 1;
      return a.localeCompare(b);
    });
    经典朝代列表 = list;
    return list;
  }
  function 经典构建作者统计() {
    if (经典作者统计) return;
    var cnt = {};
    经典缓存.all.forEach(function(p) { var a = (p.author||'').trim(); if (a && a !== '无名氏' && a !== '不详' && a !== '佚名') cnt[a] = (cnt[a]||0)+1; });
    经典作者统计 = cnt;
  }
  function 经典作者档位(name) {
    var a = (name||'').trim();
    if (!a || !经典作者统计 || 经典作者统计[a] === undefined) return '';
    var n = 经典作者统计[a];
    if (n >= 经典档位.顶) return '顶级';
    if (n >= 经典档位.中) return '中知名度';
    if (n >= 经典档位.低) return '低知名度';
    return '不知名';
  }
  var 经典作者档位表 = ['不知名', '低知名度', '中知名度', '顶级'];
  function 经典构建题材缓存() {
    if (经典题材缓存) return;
    经典题材缓存 = 经典缓存.all.map(function(p) {
      var t = (p.title||'') + '|' + (p.content||'');
      var arr = [];
      经典题材库.forEach(function(g) {
        for (var i=0;i<g.kws.length;i++) if (t.indexOf(g.kws[i]) >= 0) { arr.push(g.key); break; }
      });
      return arr;
    });
  }
  function 经典构建主角缓存() {
    if (经典主角缓存) return;
    经典主角缓存 = 经典缓存.all.map(function(p) {
      var t = (p.title||'') + '|' + (p.content||'').slice(0,200);
      var k = '';
      for (var i=0;i<经典主角库.length;i++) {
        var g = 经典主角库[i]; var hit = false;
        for (var j=0;j<g.kws.length;j++) if (t.indexOf(g.kws[j]) >= 0) { hit = true; break; }
        if (hit) { k = g.key; break; }
      }
      return k;
    });
  }
  function 经典构建标签缓存() {
    if (经典标签缓存) return;
    经典标签缓存 = 经典缓存.all.map(function(p) {
      var t = (p.title||'') + '|' + (p.content||'').slice(0,200);
      var arr = [];
      经典标签库.forEach(function(g) {
        for (var i=0;i<g.kws.length;i++) if (t.indexOf(g.kws[i]) >= 0) { arr.push(g.key); break; }
      });
      return arr;
    });
  }
  function 经典篇幅档(p) { var n=(p.content||'').length; return n<300?'微篇':(n<1500?'短篇':(n<5000?'中篇':'长篇')); }
  function 经典著名(p) {
    var t=(p.title||'');
    for (var i=0;i<经典著名库.length;i++) if (t.indexOf(经典著名库[i]) >= 0) return true;
    return false;
  }
  function 经典筛选逻辑(all) {
    var filtered = all;
    if (经典筛选.dynasty) filtered = filtered.filter(function(p){ return (p.dynasty||'') === 经典筛选.dynasty; });
    if (经典筛选.theme) { 经典构建题材缓存(); filtered = filtered.filter(function(p,i){ return 经典题材缓存[i].indexOf(经典筛选.theme) >= 0; }); }
    if (经典筛选.protagonist) { 经典构建主角缓存(); filtered = filtered.filter(function(p,i){ return 经典主角缓存[i] === 经典筛选.protagonist; }); }
    if (经典筛选.tag) { 经典构建标签缓存(); filtered = filtered.filter(function(p,i){ return 经典标签缓存[i].indexOf(经典筛选.tag) >= 0; }); }
    if (经典筛选.length) filtered = filtered.filter(function(p){ return 经典篇幅档(p) === 经典筛选.length; });
    if (经典筛选.famous === '著名') filtered = filtered.filter(function(p){ return 经典著名(p); });
    else if (经典筛选.famous === '普通') filtered = filtered.filter(function(p){ return !经典著名(p); });
    else if (经典筛选.famous === '安徒生') filtered = filtered.filter(function(p){ return (p.source||'').indexOf('安徒生') >= 0; });
    else if (经典筛选.famous === '格林') filtered = filtered.filter(function(p){ return (p.source||'').indexOf('格林') >= 0; });
    if (经典搜索) { var q = 经典搜索; filtered = filtered.filter(function(p){ return (p.title||'').indexOf(q)>=0 || (p.author||'').indexOf(q)>=0 || (p.content||'').indexOf(q)>=0; }); }
    return filtered;
  }
  function 经典筛选栏HTML() {
    var f = 经典筛选;
    var h = '';
    var chip = function(active, fn, label) {
      return '<span class="btn-out btn-sm" style="font-size:10px;padding:2px 8px;' + (active ? 'background:var(--accent);color:#fff;border-color:var(--accent)' : '') + ';cursor:pointer" onclick="' + cfg.windowPrefix + fn + '">' + label + '</span>';
    };
    经典构建作者统计();
    var dyns = 经典获取朝代();
    if (dyns.length) {
      h += '<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:wrap">';
      h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">朝代</span>';
      h += chip(!f.dynasty, '经典筛选朝代(\'\')', '全部');
      dyns.forEach(function(d) { h += chip(f.dynasty === d, '经典筛选朝代(\'' + d + '\')', escHtml(d)); });
      h += '</div>';
    }
    h += '<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:wrap">';
    h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">题材</span>';
    h += chip(!f.theme, '经典筛选题材(\'\')', '全部');
    经典题材库.forEach(function(g) { h += chip(f.theme === g.key, '经典筛选题材(\'' + g.key + '\')', g.key); });
    h += '</div>';
    // 主角类型
    h += '<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:wrap">';
    h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">主角</span>';
    h += chip(!f.protagonist, '经典筛选主角(\'\')', '全部');
    经典主角库.forEach(function(g) { h += chip(f.protagonist === g.key, '经典筛选主角(\'' + g.key + '\')', g.key); });
    h += '</div>';
    // 内容标签
    h += '<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:wrap">';
    h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">标签</span>';
    h += chip(!f.tag, '经典筛选标签(\'\')', '全部');
    经典标签库.forEach(function(g) { h += chip(f.tag === g.key, '经典筛选标签(\'' + g.key + '\')', g.key); });
    h += '</div>';
    // 篇幅
    h += '<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:wrap">';
    h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">篇幅</span>';
    h += chip(!f.length, '经典筛选篇幅(\'\')', '全部');
    ['微篇','短篇','中篇','长篇'].forEach(function(l) { h += chip(f.length === l, '经典筛选篇幅(\'' + l + '\')', l); });
    h += '</div>';
    // 著名（含：著名/普通/安徒生/格林）
    h += '<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:wrap">';
    h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">著名</span>';
    h += chip(!f.famous, '经典筛选著名(\'\')', '全部');
    h += chip(f.famous === '著名', '经典筛选著名(\'著名\')', '著名');
    h += chip(f.famous === '普通', '经典筛选著名(\'普通\')', '普通');
    h += chip(f.famous === '安徒生', '经典筛选著名(\'安徒生\')', '安徒生');
    h += chip(f.famous === '格林', '经典筛选著名(\'格林\')', '格林');
    h += '</div>';
    h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">';
    h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">搜索</span>';
    h += '<input id="' + cfg.prefix + 'ClassicSearch" type="text" placeholder="搜索标题 / 作者 / 内容…" value="' + escHtml(经典搜索) + '" style="flex:1;font-size:12px;padding:4px 8px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;color:var(--fg)" onkeydown="if(event.key===\'Enter\'){' + cfg.windowPrefix + '经典执行搜索()}">';
    h += '<button class="btn btn-sm" onclick="' + cfg.windowPrefix + '经典执行搜索()" style="font-size:11px;padding:4px 12px">🔍 搜索</button>';
    if (经典搜索) h += '<span style="font-size:10px;color:var(--fg3);cursor:pointer" onclick="' + cfg.windowPrefix + '经典清空搜索()">✕ 清除</span>';
    h += '</div>';
    return h;
  }
  function 拆分CSV行(line) {
    var fields = [], cur = '', inQ = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (inQ) {
        if (ch === '"') { if (line[i+1] === '"') { cur += '"'; i++; } else { inQ = false; } }
        else cur += ch;
      } else {
        if (ch === '"') { inQ = true; }
        else if (ch === ',') { fields.push(cur); cur = ''; }
        else cur += ch;
      }
    }
    fields.push(cur);
    return fields;
  }
  function 渲染经典库(el) {
    if (!cfg.dbPath) { el.innerHTML = '<div class="placeholder-text">经典库暂无数据</div>'; return; }
    if (经典缓存) { 渲染经典列表(el); return; }
    el.innerHTML = '<div class="text-muted p-20 text-center">正在加载经典库...</div>';
    LocalFS.dbRead(cfg.dbPath).then(function(text) {
      if (!text) { el.innerHTML = '<div class="placeholder-text">经典库暂无数据</div>'; return; }
      if (cfg.dbFormat === 'json') {
        var arr = JSON.parse(text);
        经典缓存 = { all: arr.map(function(p) { return { title: p.title || p.author || '无题', dynasty: '', author: p.author || '', content: p.body || p.content || '', source: cfg.classicLabel + '库', cipai: '' }; }) };
      } else {
        var lines = text.split(/\r?\n/).slice(1).filter(Boolean);
        var all = lines.map(function(l) {
          var f = 拆分CSV行(l);
          if (!f || f.length < 4) return null;
          return { title: (f[0]||'').trim() || '无题', dynasty: (f[1]||'').trim(), author: (f[2]||'').trim(), content: (f[3]||'').split('⏎').join('\n'), source: (f[4]||'').trim(), cipai: (f[5]||'').trim() };
        }).filter(Boolean);
        经典缓存 = { all: all };
      }
      渲染经典列表(el);
    }).catch(function() { el.innerHTML = '<div class="placeholder-text">经典库加载失败</div>'; });
  }
  function 渲染经典列表(el) {
    var all = 经典缓存.all;
    var filtered = 经典筛选逻辑(all);
    var total = filtered.length;
    var pages = Math.max(1, Math.ceil(total / 经典每页));
    if (经典分页 >= pages) 经典分页 = 0;
    var pageItems = filtered.slice(经典分页 * 经典每页, (经典分页 + 1) * 经典每页);
    var h = '';
    h += '<div class="text-sm fw-600 mb-4" style="color:var(--accent)">📚 ' + cfg.classicLabel + '经典库</div>';
    h += 经典筛选栏HTML();
    h += '<div style="font-size:11px;color:var(--fg3);margin-bottom:10px">共 ' + all.length + ' 篇，当前筛选命中 ' + total + ' 篇</div>';
    if (!pageItems.length) h += '<div class="placeholder-text">无匹配作品</div>';
    pageItems.forEach(function(p, i) {
      var gIdx = 经典分页 * 经典每页 + i;
      var len = (p.content||'').length;
      var lenLabel = len < 80 ? '短' : (len < 300 ? '中' : '长');
      h += '<div class="n-card cur-ptr mb-4 p-8" onclick="' + cfg.windowPrefix + '经典阅读(' + gIdx + ')">';
      h += '<div class="flex gap-4 align-center flex-wrap">';
      h += '<div class="fw-600 fs-13">' + escHtml(p.title || '无题') + '</div>';
      if (p.dynasty) h += '<span class="badge-tag">' + escHtml(p.dynasty) + '</span>';
      if (p.author) h += '<span class="badge-tag">' + escHtml(p.author) + '</span>';
      if (p.cipai) h += '<span class="badge-tag">' + escHtml(p.cipai) + '</span>';
      h += '<span class="text-xs text-muted" style="margin-left:auto">' + lenLabel + ' · ' + len + '字</span>';
      h += '</div>';
      h += '<div class="text-muted text-sm mt-2" style="white-space:pre-wrap;font-family:serif;line-height:1.7">' + escHtml(p.content||'').slice(0,90) + '</div>';
      h += '</div>';
    });
    if (pages > 1) {
      h += '<div class="flex gap-4 align-center mt-6 flex-wrap">';
      h += '<button class="btn-sm"' + (经典分页 === 0 ? ' disabled' : '') + ' onclick="' + cfg.windowPrefix + '经典翻页(-1)">← 上一页</button>';
      h += '<span class="text-sm text-muted">第 ' + (经典分页 + 1) + ' / ' + pages + ' 页</span>';
      h += '<button class="btn-sm"' + (经典分页 >= pages - 1 ? ' disabled' : '') + ' onclick="' + cfg.windowPrefix + '经典翻页(1)">下一页 →</button>';
      h += '</div>';
    }
    el.innerHTML = h;
    var si = document.getElementById(cfg.prefix + 'ClassicSearch');
    if (si) si.value = 经典搜索;
  }
  function 经典阅读(idx) {
    var filtered = 经典筛选逻辑(经典缓存.all);
    var p = filtered[idx];
    if (!p) return;
    document.querySelectorAll('.ovl').forEach(function(o) { o.remove(); });
    var len = (p.content||'').length;
    var h = '';
    h += '<div class="reader-head">';
    h += '<span class="reader-title">📖 ' + escHtml(p.title || '无题') + '</span>';
    if (p.dynasty) h += '<span class="reader-tag">' + escHtml(p.dynasty) + '</span>';
    if (p.author) h += '<span class="reader-tag">' + escHtml(p.author) + '</span>';
    if (p.cipai) h += '<span class="reader-tag">' + escHtml(p.cipai) + '</span>';
    h += '<span class="reader-meta" style="margin-left:auto">' + (len < 80 ? '短' : len < 300 ? '中' : '长') + ' · ' + len + ' 字</span>';
    h += '</div>';
    h += '<div class="reader-body">';
    h += '<div class="reader-poem-title">' + escHtml(p.title || '无题') + '</div>';
    h += '<div class="reader-poem-author">' + escHtml(p.dynasty || '') + '<span class="reader-dot">·</span>' + escHtml(p.author || '无名') + '</div>';
    h += '<div class="reader-poem-text">' + escHtml(p.content || '') + '</div>';
    h += '</div>';
    h += '<div class="reader-foot">';
    h += '<span class="reader-count">' + (idx + 1) + ' / ' + filtered.length + '</span>';
    h += '<button class="reader-btn"' + (idx === 0 ? ' disabled' : '') + ' onclick="' + cfg.windowPrefix + '经典阅读(' + (idx - 1) + ')">← 上一篇</button>';
    h += '<button class="reader-btn"' + (idx >= filtered.length - 1 ? ' disabled' : '') + ' onclick="' + cfg.windowPrefix + '经典阅读(' + (idx + 1) + ')">下一篇 →</button>';
    h += '<button class="reader-btn" onclick="' + cfg.windowPrefix + '经典去改编(' + idx + ')">✍️ 去改编</button>';
    h += '<button class="reader-btn" onclick="' + cfg.windowPrefix + '经典复制(' + idx + ')">📋 复制全文</button>';
    h += '<button class="reader-btn primary" onclick="this.closest(\'.ovl\').remove()">关闭</button>';
    h += '</div>';
    showModal('', h, { noWrap: true, cardClass: 'reader-night', ovlClass: 'reader-night-ovl' });
  }
  function 经典复制(idx) {
    var filtered = 经典筛选逻辑(经典缓存.all);
    var p = filtered[idx];
    if (!p) return;
    var text = (p.title||'') + (p.dynasty ? ' · ' + p.dynasty : '') + (p.author ? ' · ' + p.author : '') + '\n' + (p.content||'');
    复制到剪贴板(text).then(function(ok){ toast(ok ? '已复制全文' : '复制失败'); });
  }
  function 经典去改编(idx) {
    var filtered = 经典筛选逻辑(经典缓存.all);
    var p = filtered[idx];
    if (!p || !(p.content||'').trim()) { toast('该作品暂无正文'); return; }
    document.querySelectorAll('.ovl').forEach(function(o) { o.remove(); });
    _editTitle = null;
    编辑状态.adaptSource = p.content || '';
    编辑状态.adaptExplicit = '污秽淫化';
    编辑状态.adaptLen = '维持';
    编辑状态.original = p.title || '';
    切换视图('editor');
    toast('原文已带入创作页改编卡');
  }

  function 经典筛选朝代(d) { 经典筛选.dynasty = d; 经典分页 = 0; 经典刷新(); }
  function 经典筛选题材(t) { 经典筛选.theme = t; 经典分页 = 0; 经典刷新(); }
  function 经典筛选主角(p) { 经典筛选.protagonist = p; 经典分页 = 0; 经典刷新(); }
  function 经典筛选标签(t) { 经典筛选.tag = t; 经典分页 = 0; 经典刷新(); }
  function 经典筛选篇幅(l) { 经典筛选.length = l; 经典分页 = 0; 经典刷新(); }
  function 经典筛选著名(v) { 经典筛选.famous = v; 经典分页 = 0; 经典刷新(); }
  function 经典执行搜索() { var input = document.getElementById(cfg.prefix + 'ClassicSearch'); 经典搜索 = input ? input.value.trim() : ''; 经典分页 = 0; 经典刷新(); }
  function 经典清空搜索() { 经典搜索 = ''; 经典分页 = 0; 经典刷新(); }
  function 经典刷新() { var vEl = document.getElementById(cfg.viewContentId); if (vEl) 渲染经典列表(vEl); }
  function 经典翻页(delta) { 经典分页 += delta; if (经典分页 < 0) 经典分页 = 0; 经典刷新(); }

  // ===== AI 字段注册 =====
  if (typeof registerAiField !== 'undefined') {
    // 标题建议（作品信息卡 🤖）
    registerAiField(cfg.aiFieldId + 'Suggest', cfg.aiLabel + '标题建议', function() {
      var ctx = '';
      if (编辑状态.original) ctx += '改编原作：' + 编辑状态.original + '\n';
      if (编辑状态.style) ctx += '风格：' + 编辑状态.style + '\n';
      if (编辑状态.genre && 编辑状态.genre.length) ctx += '题材：' + 编辑状态.genre.join('、') + '\n';
      if (编辑状态.imagery && 编辑状态.imagery.length) ctx += '意象：' + 编辑状态.imagery.join('、') + '\n';
      if (!ctx) ctx = '当前无已选元素，自由发挥';
      var r = renderPrompt(cfg.titlePrompt, { ctx: ctx, charCtx: 共享角色上下文() }); return { user: r.user, system: r.system };
    }, { fillFn: function(d) {
      if (!d) return;
      if (d.title) 编辑字段('title', d.title);
      if (d.genre) 编辑字段('genre', d.genre);
      if (d.imagery) 编辑字段('imagery', d.imagery);
      if (d.explicit) 编辑字段('explicit', d.explicit);
      if (d.style) 编辑字段('style', d.style);
      var titleEl = document.getElementById(cfg.prefix + 'Title');
      if (titleEl) titleEl.value = 编辑状态.title || '';
      同步chips();
      toast('标题建议已填入');
    }});
    // 主生成
    registerAiField(cfg.aiFieldId, cfg.aiLabel, function() {
      var direction = ((document.getElementById(cfg.prefix + 'Direction')||{}).value || '').trim();
      var ctx = 共享参数上下文();
      if (direction) ctx += '\n方向：' + direction;
      var r = renderPrompt(cfg.promptName, { ctx: ctx, charCtx: 共享角色上下文() }); return { user: r.user, system: r.system };
    }, { fillFn: function(d) {
      if (!d) return;
      var s = 编辑状态;
      if (d.title) s.title = d.title;
      if (d.original) s.original = d.original;
      if (d.content) s.content = d.content;
      if (d.tags) s.tags = d.tags;
      if (d.genre) s.genre = d.genre;
      if (d.explicit) s.explicit = d.explicit;
      if (d.style) s.style = d.style;
      if (d.imagery) s.imagery = d.imagery;
      var titleEl = document.getElementById(cfg.prefix + 'Title');
      if (titleEl) titleEl.value = s.title || '';
      var origEl = document.getElementById(cfg.prefix + 'Original');
      if (origEl) origEl.value = s.original || '';
      同步chips();
      if (!(s.title || '').trim()) s.title = cfg.aiLabel + '新作';
      var newTitle = (s.title || '').trim();
      var next = function() {
        var data = 拟建档数据(s);
        if (_editTitle) {
          Store[cfg.storeKey].save(_editTitle, data).then(function(){});
        } else {
          Store[cfg.storeKey].save(s.title, data).then(function(){ _editTitle = s.title; });
        }
        toast('AI 提案已填入，可修改后保存');
      };
      if (_editTitle && newTitle && newTitle !== _editTitle) {
        var oldTitle = _editTitle;
        _editTitle = null;
        Store[cfg.storeKey].delete(oldTitle).catch(function(){}).then(function(){ next(); });
      } else { next(); }
    }});
    // 改编卡生成
    registerAiField(cfg.aiFieldId + 'Adapt', cfg.aiLabel + '改编', function() {
      var source = ((document.getElementById(cfg.prefix + 'AdaptSource')||{}).value || '');
      var s = 编辑状态;
      if (!source.trim()) { toast('请先输入要改编的原文'); return null; }
      var ctx = 共享参数上下文();
      var r = renderPrompt(cfg.adaptPrompt, {
        ctx: ctx, charCtx: 共享角色上下文(),
        source: source, adaptExplicit: s.adaptExplicit || '污秽淫化', adaptLen: s.adaptLen || '维持'
      }); return { user: r.user, system: r.system };
    }, { fillFn: function(d) {
      if (!d) return;
      var s = 编辑状态;
      if (d.title) s.title = d.title;
      if (d.original) s.original = d.original;
      if (d.content) s.content = d.content;
      if (d.genre) s.genre = d.genre;
      if (d.explicit) s.explicit = d.explicit;
      if (d.style) s.style = d.style;
      if (d.imagery) s.imagery = d.imagery;
      if (d.tags) s.tags = d.tags;
      if (!(s.title||'').trim()) s.title = '改编' + ((s.adaptSource||'').substring(0,4) || '');
      var titleEl = document.getElementById(cfg.prefix + 'Title');
      if (titleEl) titleEl.value = s.title || '';
      var origEl = document.getElementById(cfg.prefix + 'Original');
      if (origEl) origEl.value = s.original || '';
      同步chips();
      var data = 拟建档数据(s);
      if (_editTitle) {
        Store[cfg.storeKey].save(_editTitle, data).then(function(){});
      } else {
        Store[cfg.storeKey].save(s.title, data).then(function(){ _editTitle = s.title; });
      }
      toast('改编结果已填入编辑器，可修改后保存');
    }});
  }

  // ===== 全局导出 =====
  window[cfg.windowPrefix + '切换视图'] = 切换视图;
  window[cfg.windowPrefix + '新创作'] = 新创作;
  window[cfg.windowPrefix + '筛选'] = 筛选;
  window[cfg.windowPrefix + '编辑项'] = 编辑项;
  window[cfg.windowPrefix + '删除项'] = 删除项;
  window[cfg.windowPrefix + '阅读'] = 阅读;
  window[cfg.windowPrefix + '阅读生成赏析'] = 阅读生成赏析;
  window[cfg.windowPrefix + '复制全文'] = 复制全文;
  window[cfg.windowPrefix + '编辑字段'] = 编辑字段;
  window[cfg.windowPrefix + '同步chips'] = 同步chips;
  window[cfg.windowPrefix + '切换题材'] = 切换题材;
  window[cfg.windowPrefix + '切换意象'] = 切换意象;
  window[cfg.windowPrefix + '随机灵感'] = 随机灵感;
  window[cfg.windowPrefix + '导入角色'] = 共享导入角色;
  window[cfg.windowPrefix + '移除角色'] = 共享移除角色;
  window[cfg.windowPrefix + '清空角色'] = 共享清空角色;
  window[cfg.windowPrefix + '经典库'] = function() { 切换视图('classic'); };
  window[cfg.windowPrefix + '经典筛选朝代'] = 经典筛选朝代;
  window[cfg.windowPrefix + '经典筛选题材'] = 经典筛选题材;
  window[cfg.windowPrefix + '经典筛选主角'] = 经典筛选主角;
  window[cfg.windowPrefix + '经典筛选标签'] = 经典筛选标签;
  window[cfg.windowPrefix + '经典筛选篇幅'] = 经典筛选篇幅;
  window[cfg.windowPrefix + '经典筛选著名'] = 经典筛选著名;
  window[cfg.windowPrefix + '经典执行搜索'] = 经典执行搜索;
  window[cfg.windowPrefix + '经典清空搜索'] = 经典清空搜索;
  window[cfg.windowPrefix + '经典刷新'] = 经典刷新;
  window[cfg.windowPrefix + '经典翻页'] = 经典翻页;
  window[cfg.windowPrefix + '经典阅读'] = 经典阅读;
  window[cfg.windowPrefix + '经典复制'] = 经典复制;
  window[cfg.windowPrefix + '经典去改编'] = 经典去改编;

  return { 切换视图: 切换视图, 当前视图: function(){ return 当前视图; } };
}
window.文学改编体模块工厂 = 文学改编体模块工厂;
