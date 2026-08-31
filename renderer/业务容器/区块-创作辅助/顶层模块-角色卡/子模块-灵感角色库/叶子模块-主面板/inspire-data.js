(function() {
// ============================================================
// ✨ 灵感角色库 · 数据层（IIFE 包裹，内部函数不进全局作用域）
// ⚠️⚠️⚠️ 重要区分警告 ⚠️⚠️⚠️
// 本文件是「灵感角色库」——字段精简的简单角色，仅供 AI 写作/生图灵感快速调用。
// 它【不是】主「角色卡」（复杂字段的完整角色档案）！
// 调用规则：
//   - 默认一律使用主「角色卡」的全局函数（window.角色卡全部 / window.角色卡身份与外貌），不要用本库！
//   - 只有【明确点名调用灵感角色】的场景，才使用本库的【唯一】全局入口：
//     window.灵感角色全部(灵感角色对象, 版本) —— 定义在 区块-提示词/全局函数/entry.js
//   - 本文件其余 stcdInspire* 函数仅供生图词典 UI 内部使用，不对外
//
// 角色数据结构（三版本，同一角色一个文件条目，三版各自独立全套字段）：
//   {
//     id: 'i_...',
//     createdAt: '...',
//     versions: {
//       normal: { name, gender, identity:{...}, clothing:{...}, accessories:{...}, appearance:{...} },
//       cool:   { 同构全套字段 },
//       deep:   { 同构全套字段 },
//     }
//   }
//
// 字段结构（学主角色卡三层容器）：
//   identity   基本信息[区块]  → basicInfo[顶层]：age / identity / style
//   clothing   主服饰[区块]    → outfit[顶层]：top / bottom / outerwear / special
//   accessories 配饰[区块]     → details[顶层]：ear / head / face / neck / hand / waist / foot / shoes
//   appearance 体貌特征[区块]  → features[顶层]：skinTone / hair / eyeColor / defect / temperament
// ============================================================

var STCD_INSPIRE = window.STCD_INSPIRE || {
  items: [], loaded: false,
};
// 一角色一文件：保存/角色卡/灵感角色库/ 目录
var STCD_INSPIRE_DIR = '角色卡/灵感角色库/';
// 旧路径（不再兼容读取）：生图词典/灵感角色库.json 与 生图词典/灵感角色/
var STCD_INSPIRE_PATH = '';
var STCD_INSPIRE_LEGACY_OLD = '';
var STCD_INSPIRE_LEGACY_DIR = '';
var STCD_INSPIRE_VERSIONS = ['normal', 'cool', 'deep'];
var STCD_INSPIRE_VERSION_LABELS = { normal: '🌿 正常版', cool: '🧊 清凉版', deep: '🔥 深度版' };

// ===== 字段结构定义 =====
// 结构从角色卡同构模板 DATA.inspire.template.{版本} 生成（区块 → 顶层模块 → 叶子字段），
// 三版本模板格式完全一致，按当前版本取对应模板。
// UI 提示（placeholder/note/type）由下方 UI_META 补充。
// stcdInspireGetFields(version) 按版本生成；STCD_INSPIRE_FIELDS 为默认（deep）版。
var STCD_INSPIRE_FIELDS = (function() {
  // UI 元数据：叶子字段 → {label, type, placeholder, note}
  var UI_META = {
    name:           { label: '名称', type: 'input', placeholder: '如：谢道清', note: '显示名称' },
    gender:         { label: '性别', type: 'select', options: ['女', '男', '扶她', '伪娘'], note: '女性/男性/伪娘/扶她（决定生殖器官字段显示）' },
    age:            { label: '年龄', type: 'input', placeholder: '如：22', note: '年龄：看起来几岁（外观年龄，非实际岁数），整数，不要加岁' },
    race:           { label: '种族', type: 'input', placeholder: '如：人族', note: '种族：人族/精灵/兽人/魔族/天使/龙裔/异种' },
    title:          { label: '头衔', type: 'input', placeholder: '如：宗主/大弟子/剑宗首席', note: '头衔/称号：一个简洁的身份或称号短语（如 边境小国的流亡公主），只填一个；不要用「·」叠加多个称号、不要加破折号长释义' },
    style:          { label: '风格', type: 'input', placeholder: '如：古代-才子', note: '版本风格标注' },
    lifeExperience: { label: '人生经历', type: 'textarea', placeholder: '如：出身书香门第，少年丧父，以诗名传遍江南…', note: '生平/经历/背景故事' },
    sexualDetails:  { label: '性爱明细', type: 'array', placeholder: '如："1. 及笄后与表兄私定终身，于私家园林初尝云雨…"', note: '数组，按时间先后编号列出性相关事件（["1. …","2. …","3. …",…]）；条数随人生经历丰富铺开——通常 6~10 条、宁多勿少，绝不能只写 4 条敷衍凑数；每条详细描述，内容要充足，不能一句话带过（参考主角色卡性爱明细）' },
    temperament:    { label: '气质', type: 'input', placeholder: '清逸、沉思', note: '气质/神态关键词' },
    height:         { label: '身高', type: 'input', placeholder: '172cm', note: '身高（cm）' },
    build:          { label: '体型', type: 'input', placeholder: '120斤，正常体型', note: '体重/体型描述' },
    chest:          { label: '胸部', type: 'textarea', placeholder: '笋乳，罩杯B，乳首浅褐凸起', note: '胸型/罩杯/乳首/味道' },
    genitals:       { label: '生殖器官', type: 'textarea', placeholder: '一线天，唇形闭合留缝，颜色浅粉', note: '按性别动态：女→小穴 / 男·伪娘→肉棒 / 扶她→肉棒+小穴；形态/颜色/毛发/味道' },
    anus:           { label: '肛门', type: 'textarea', placeholder: '处子肛，紧度紧，颜色浅粉，无毛', note: '状态/紧度/颜色/毛发/味道' },
    voice:          { label: '声音', type: 'input', placeholder: '音量偏小，音色低沉，语速偏慢', note: '音量/音色/语速' },
    obedience:      { label: '服从程度', type: 'input', placeholder: '轻度M', note: '轻度M/重度M/轻度S/重度S/双/普通' },
    socialRole:     { label: '社会定位', type: 'textarea', placeholder: '大理寺狱中层管理者', note: '社会身份与权力关系' },
    sensitiveSpots: { label: '身体敏感点', type: 'input', placeholder: '后颈，阴蒂，肛门', note: '逗号分隔' },
    preferences:    { label: '偏好', type: 'textarea', placeholder: '被囚犯反制在牢房角落、被镣铐缚住后从背后进入', note: '喜欢的玩法/场景' },
    breakSwitch:    { label: '崩溃开关', type: 'textarea', placeholder: '铁证公堂，胁迫在升堂时将私藏体液瓶当众呈上', note: '彻底击溃心理防线的事件' },
    family:         { label: '家庭背景', type: 'textarea', placeholder: '狱丞世家，父亲曾任大理寺少卿因贪墨被贬', note: '出身/家族' },
    top:            { label: '上身', type: 'textarea', placeholder: '交领襦衣，月白色、交领右衽…', note: '上装：衣型/颜色/质地/领口状态' },
    bottom:         { label: '下身', type: 'textarea', placeholder: '长裙，藏蓝色、无纹无绣、裙长曳地…', note: '下装：裙型/颜色/裙长/质地' },
    outerwear:      { label: '外搭', type: 'input', placeholder: '对襟长衫，长至膝下', note: '外衣/外套（无则填「无」）' },
    special:        { label: '特别装饰', type: 'textarea', placeholder: '左手持一卷诗稿，墨迹半干…', note: '道具/持物/特殊细节' },
    ear:            { label: '耳饰', type: 'input', placeholder: '银质耳钉', note: '无则填「无」' },
    head:           { label: '头饰', type: 'input', placeholder: '银竹节簪', note: '发簪/发带/冠帽' },
    face:           { label: '面饰', type: 'input', placeholder: '无', note: '面纱/花钿/妆容' },
    neck:           { label: '颈饰', type: 'input', placeholder: '无', note: '项链/项圈' },
    hand:           { label: '手饰', type: 'input', placeholder: '右手三指沾满墨渍', note: '戒指/手镯/手上痕迹' },
    waist:          { label: '腰饰', type: 'input', placeholder: '藏蓝丝绦', note: '腰带/绦带/玉佩' },
    foot:           { label: '足饰', type: 'input', placeholder: '白绢袜', note: '袜子/脚链' },
    shoes:          { label: '鞋履', type: 'input', placeholder: '藏蓝布履', note: '鞋/靴/履' },
    skinTone:       { label: '肤色', type: 'input', placeholder: '偏白皙，室内居多', note: '肤色+肤质' },
    hair:           { label: '发型', type: 'input', placeholder: '乌黑长发绾为松髻，银竹节簪固定', note: '发色+长度+发型' },
    eyeColor:       { label: '瞳色', type: 'input', placeholder: '深棕色', note: '眼睛颜色' },
    defect:         { label: '残缺', type: 'input', placeholder: '无', note: '疤痕/残缺（无则填「无」）' },
  };
  var BLOCK_META = {
    identity:    { blockLabel: '一、基本信息', sectionLabel: '1-1 基础' },
    clothing:    { blockLabel: '二、主服饰', sectionLabel: '2-1 衣着' },
    accessories: { blockLabel: '三、配饰', sectionLabel: '3-1 配件' },
    appearance:  { blockLabel: '四、体貌特征', sectionLabel: '4-1 体态' },
    kinks:       { blockLabel: '五、性癖标签', sectionLabel: '5-1 性癖' },
  };
  // 生殖器官字段按性别动态命名（女→小穴 / 男·伪娘→肉棒 / 扶她→肉棒+小穴）
  window.stcdInspireGetGenitalsLabel = function(gender) {
    if (gender === '女') return '小穴';
    if (gender === '男' || gender === '伪娘') return '肉棒';
    if (gender === '扶她') return '肉棒+小穴';
    return '生殖器官';
  };
  // 取指定版本的模板（兼容旧结构：template 直接是区块）
  function getTpl(version) {
    var t = (typeof DATA !== 'undefined' && DATA.inspire && DATA.inspire.template) ? DATA.inspire.template : null;
    if (!t) return null;
    if (t[version] && t[version].identity) return t[version];   // 新版：template.{版本}
    if (t.identity) return t;                                   // 旧版：template 直接是区块
    return null;
  }
  // 生成字段（按版本）
  function build(version) {
    var tpl = getTpl(version);
    var result = [];
    if (tpl) {
      // 只遍历该版本模板中实际存在的区块（三版同构：identity/clothing/accessories/appearance/kinks）
      Object.keys(tpl).forEach(function(blockKey) {
        var meta = BLOCK_META[blockKey];
        if (!meta) return;
        var blockTpl = tpl[blockKey] || {};
        var sectionKeys = Object.keys(blockTpl);
        var fields = [];
        sectionKeys.forEach(function(sk) {
          var sec = blockTpl[sk] || {};
          Object.keys(sec).forEach(function(fk) {
            var um = UI_META[fk] || { label: fk, type: 'input', placeholder: '', note: '' };
            fields.push({ key: fk, label: um.label, type: um.type, options: um.options, placeholder: um.placeholder, note: um.note });
          });
        });
        result.push({ block: blockKey, blockLabel: meta.blockLabel, section: sectionKeys[0] || '', sectionLabel: meta.sectionLabel, fields: fields });
      });
    }
    return result;
  }
  // 优先用 deep 模板生成（三版同构，任意版皆可），失败则兜底
  var result = build('deep') || [];
  if (!result.length) result = build('normal') || [];
  if (!result.length) result = build('cool') || [];
  // 导出按版本生成的函数（模板加载后可用）
  window.stcdInspireGetFields = function(version) {
    var r = build(version || 'deep');
    if (!r.length) r = build('normal');
    if (!r.length) r = build('cool');
    return r;
  };
  if (!result.length) {
    // 兜底：模板未加载时用内置定义
    result = [
      { block: 'identity', blockLabel: '一、基本信息', section: 'basicInfo', sectionLabel: '1-1 基础', fields: [
        { key: 'name', label: '名称', type: 'input', placeholder: '如：谢道清', note: '显示名称' },
        { key: 'gender', label: '性别', type: 'select', options: ['女', '男', '扶她', '伪娘'], note: '女性/男性/伪娘/扶她' },
        { key: 'age', label: '年龄', type: 'input', placeholder: '如：26岁', note: '年龄（整数，不要加岁）' },
        { key: 'title', label: '身份', type: 'input', placeholder: '如：女诗人', note: '职业身份' },
        { key: 'style', label: '风格', type: 'input', placeholder: '如：古代-才子', note: '版本风格标注' },
        { key: 'lifeExperience', label: '人生经历', type: 'textarea', placeholder: '如：出身书香门第…', note: '生平/经历/背景故事' },
      ]},
      { block: 'clothing', blockLabel: '二、主服饰', section: 'outfit', sectionLabel: '2-1 衣着', fields: [
        { key: 'top', label: '上身', type: 'textarea', placeholder: '交领襦衣，月白色…', note: '上装' },
        { key: 'bottom', label: '下身', type: 'textarea', placeholder: '长裙，藏蓝色…', note: '下装' },
        { key: 'outerwear', label: '外搭', type: 'input', placeholder: '对襟长衫', note: '外衣/外套' },
        { key: 'special', label: '特别装饰', type: 'textarea', placeholder: '左手持一卷诗稿…', note: '道具/持物' },
      ]},
      { block: 'accessories', blockLabel: '三、配饰', section: 'details', sectionLabel: '3-1 配件', fields: [
        { key: 'ear', label: '耳饰', type: 'input', placeholder: '银质耳钉', note: '' },
        { key: 'head', label: '头饰', type: 'input', placeholder: '银竹节簪', note: '' },
        { key: 'face', label: '面饰', type: 'input', placeholder: '无', note: '' },
        { key: 'neck', label: '颈饰', type: 'input', placeholder: '无', note: '' },
        { key: 'hand', label: '手饰', type: 'input', placeholder: '右手三指沾满墨渍', note: '' },
        { key: 'waist', label: '腰饰', type: 'input', placeholder: '藏蓝丝绦', note: '' },
        { key: 'foot', label: '足饰', type: 'input', placeholder: '白绢袜', note: '' },
        { key: 'shoes', label: '鞋履', type: 'input', placeholder: '藏蓝布履', note: '' },
      ]},
      { block: 'appearance', blockLabel: '四、体貌特征', section: 'features', sectionLabel: '4-1 体态', fields: [
        { key: 'skinTone', label: '肤色', type: 'input', placeholder: '偏白皙', note: '' },
        { key: 'hair', label: '发型', type: 'input', placeholder: '乌黑长发绾为松髻', note: '' },
        { key: 'eyeColor', label: '瞳色', type: 'input', placeholder: '深棕色', note: '' },
        { key: 'defect', label: '残缺', type: 'input', placeholder: '无', note: '' },
        { key: 'temperament', label: '气质', type: 'input', placeholder: '清逸、沉思', note: '' },
      ]},
    ];
  }
  return result;
})();

// 空版本模板（三层结构，按版本字段生成；缺省用默认字段）
function stcdInspireEmptyVersion(version) {
  var fields = (version && typeof window.stcdInspireGetFields === 'function')
    ? window.stcdInspireGetFields(version) : STCD_INSPIRE_FIELDS;
  var v = { name: '', gender: '' };
  fields.forEach(function(block) {
    v[block.block] = {};
    block.fields.forEach(function(f) {
      v[block.block][f.key] = (f.type === 'array') ? [] : '';
    });
  });
  return v;
}

// 取版本内指定路径的值（path: 'identity.age'）
function stcdInspireGetField(vdata, path) {
  var parts = path.split('.');
  var cur = vdata;
  for (var i = 0; i < parts.length; i++) {
    if (cur == null) return '';
    cur = cur[parts[i]];
  }
  return cur == null ? '' : cur;
}

// 设置版本内指定路径的值
function stcdInspireSetField(vdata, path, val) {
  var parts = path.split('.');
  var cur = vdata;
  for (var i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = val;
}

// 兼容旧数据：旧格式（字段平铺）自动迁移为 versions.normal
function stcdInspireNormalize(item) {
  if (item && item.versions) {
    STCD_INSPIRE_VERSIONS.forEach(function(v) {
      if (!item.versions[v]) item.versions[v] = stcdInspireEmptyVersion(v);
    });
    if (!item.category) item.category = '';
    return item;
  }
  if (item && typeof item === 'object') {
    // 旧格式迁移：平铺字段 → 三层结构（identity.age 等）
    var v = stcdInspireEmptyVersion('normal');
    Object.keys(item).forEach(function(k) {
      if (item[k] !== undefined) stcdInspireSetField(v, k, item[k]);
    });
    return {
      id: item.id || ('i_' + Date.now() + '_' + Math.floor(Math.random() * 1000)),
      createdAt: item.createdAt || '',
      category: item.category || '',
      versions: { normal: v, cool: stcdInspireEmptyVersion('cool'), deep: stcdInspireEmptyVersion('deep') },
    };
  }
  return null;
}

// 三级分类树（从模板读取，内置只读）
function stcdInspireCategoryTree() {
  return (typeof DATA !== 'undefined' && DATA.inspire && DATA.inspire.template && DATA.inspire.template.categoryTree)
    ? DATA.inspire.template.categoryTree : [];
}

// ===== 加载 / 保存（一角色一文件夹，三版本各自独立文件）=====
// 目录结构：角色卡/灵感角色库/{角色名}/{版本}.json（正常版.json / 清凉版.json / 深度版.json）
// 图片：{角色名}/avatar-{版本}.jpg（与版本 json 平级，固定名）
var STCD_INSPIRE_VERSION_FILES = { normal: '正常版.json', cool: '清凉版.json', deep: '深度版.json' };
var STCD_INSPIRE_AVATAR_FILES = { normal: 'avatar-normal.jpg', cool: 'avatar-cool.jpg', deep: 'avatar-deep.jpg' };

// 递归收集「角色叶子目录」：目录里含 正常版.json/清凉版.json/深度版.json 中的任一文件即为角色目录；
// 否则将其视为层级容器目录继续下钻。返回的是【相对 STCD_INSPIRE_DIR 的多级相对路径】数组（如 世界观/熟女仙界/.../柳寒烟）。
function stcdInspireCollectRoleDirs(relPath) {
  return LocalFS.list(relPath).then(function(entries) {
    var dirs = (entries || []).filter(function(e) { return e.isDir; });
    var work = dirs.map(function(d) {
      // 本级是否为角色目录：含任一版本文件即视为角色
      var versionChecks = STCD_INSPIRE_VERSIONS.map(function(v) {
        return LocalFS.exists(relPath + d.name + '/' + STCD_INSPIRE_VERSION_FILES[v]);
      });
      return Promise.all(versionChecks).then(function(exists) {
        if (exists.some(function(x) { return x; })) {
          // 是角色叶子目录（相对路径，不含顶层 STCD_INSPIRE_DIR）
          return Promise.resolve(relPath.slice(STCD_INSPIRE_DIR.length) + d.name);
        }
        // 否则递归下钻
        return stcdInspireCollectRoleDirs(relPath + d.name + '/');
      });
    });
    return Promise.all(work).then(function(res) {
      return res.reduce(function(acc, r) { return acc.concat(Array.isArray(r) ? r : [r]); }, []);
    });
  }).catch(function() { return []; });
}

function stcdInspireLoad() {
  if (STCD_INSPIRE.loaded) return Promise.resolve(STCD_INSPIRE.items);
  // 递归收集所有角色叶子目录（支持 世界观/世界/入口/条目/… 多级层级）
  return stcdInspireCollectRoleDirs(STCD_INSPIRE_DIR).then(function(relDirs) {
    // 每个角色目录 → 读三个版本文件 + 三张图片 + meta.json（id/category/createdAt/锚点）
    var reads = relDirs.map(function(rel) {
      var item = stcdInspireNewItem();
      item._dirName = rel;
      var versions = STCD_INSPIRE_VERSIONS.map(function(v) {
        return LocalFS.readJSON(STCD_INSPIRE_DIR + rel + '/' + STCD_INSPIRE_VERSION_FILES[v])
          .then(function(data) {
            if (data && typeof data === 'object') item.versions[v] = data;
          }).catch(function() {});
      });
      var avatars = STCD_INSPIRE_VERSIONS.map(function(v) {
        return LocalFS.exists(STCD_INSPIRE_DIR + rel + '/' + STCD_INSPIRE_AVATAR_FILES[v])
          .then(function(ex) {
            if (!ex) return;
            return LocalFS.readBase64(STCD_INSPIRE_DIR + rel + '/' + STCD_INSPIRE_AVATAR_FILES[v])
              .then(function(b64) {
                if (b64) item.avatars[v] = 'data:image/jpeg;base64,' + b64;
              }).catch(function() {});
          }).catch(function() {});
      });
      var meta = LocalFS.readJSON(STCD_INSPIRE_DIR + rel + '/meta.json')
        .then(function(m) {
          if (m && typeof m === 'object') {
            if (m.id) item.id = m.id;
            if (m.category) item.category = m.category;
            if (m.createdAt) item.createdAt = m.createdAt;
            if (m.anchor) item.anchor = m.anchor;
          }
        }).catch(function() {});
      return Promise.all(versions.concat(avatars).concat([meta])).then(function() {
        if (!item.id) item.id = stcdInspireIdFromDir(rel);
        return item;
      });
    });
    return Promise.all(reads);
  }).catch(function() {
    return [];
  }).then(function(items) {
    STCD_INSPIRE.items = items.filter(function(it) {
      // 至少有一个版本文件存在才算有效角色
      return it && STCD_INSPIRE_VERSIONS.some(function(v) {
        return it.versions[v] && Object.keys(it.versions[v]).length;
      });
    });
    STCD_INSPIRE.loaded = true;
    // 一次性迁移：把历史「平铺目录（_dirName 不含 /）」按 category 归位到 世界观/世界/入口/… 层级目录
    return stcdInspireMigrateHierarchy(STCD_INSPIRE.items).then(function() { return STCD_INSPIRE.items; });
  });
}

// 历史平铺目录 → 层级目录 自动迁移。
// 判定：item._dirName 不含 '/'（仍是旧的角色名目录）且 meta 里有非空 category。
// 用 LocalFS.rename 把整个角色文件夹（3版本+图片+meta）移动到位，并更新内存 _dirName。
// 幂等：已迁移（_dirName 含 '/'）或 category 为空 的角色跳过，重复调用不会二次移动。
function stcdInspireMigrateHierarchy(items) {
  var work = Promise.resolve();
  (items || []).forEach(function(it) {
    var oldDir = it._dirName;
    if (!oldDir || oldDir.indexOf('/') >= 0) return;       // 已是层级目录，跳过
    if (!it.category) return;                               // 无分类，保持原状
    it._dirName = stcdInspireDirName(it);                   // 计算新层级路径（category+名）
    var newDir = it._dirName;
    if (newDir === oldDir) return;                          // 路径没变（如 category 为空处理过的），跳过
    work = work.then(function() {
      return LocalFS.rename(STCD_INSPIRE_DIR + oldDir, STCD_INSPIRE_DIR + newDir)
        .then(function(r) {
          if (!r || !r.ok) {
            if (typeof toast === 'function') toast('迁移角色目录失败：' + oldDir + ' → ' + newDir);
            // 失败则回退 _dirName，保持原状
            it._dirName = oldDir;
          }
          return r;
        });
    });
  });
  return work;
}

// 文件夹路径 → 角色 id（meta.json 有 id 时优先；此处仅当 meta 缺 id 时兜底）。
// 多级目录名含 /，统一替换成 _，保证 id 干净可溯源。
function stcdInspireIdFromDir(dirName) {
  return 'i_dir_' + String(dirName).replace(/[\/\\]/g, '_');
}

// 新建空角色条目
function stcdInspireNewItem() {
  var it = {
    id: '',
    createdAt: new Date().toISOString(),
    category: '',
    versions: {},
    avatars: {},
  };
  STCD_INSPIRE_VERSIONS.forEach(function(v) {
    it.versions[v] = stcdInspireEmptyVersion(v);
    it.avatars[v] = null;
  });
  return it;
}

// 角色目录名（多级层级路径）：已记录 _dirName 则用记录值；
// 否则由 「category（世界观/世界/入口/条目/…） + 角色名」拼成真实多级目录，逐段清理（保留 / 分隔）。
// 例：category=世界观/熟女仙界/情色行业结社/驻颜娼行 → 世界观/熟女仙界/情色行业结社/驻颜娼行/柳寒烟
// 若 category 末段已等于角色名（如 典型角色/秦霜凌），则不再重复拼接，直接用作完整目录。
function stcdInspireDirName(it) {
  if (it && it._dirName) return it._dirName;
  var name = (it && stcdInspireDisplayName(it)) || '未命名';
  var nameSeg = LocalFS.sanitize(name);
  var cat = (it && it.category) ? it.category : '';
  if (!cat) return nameSeg;
  // category 逐段清理（每段去掉非法字符），再用 / 连接成真正层级路径
  var catSegs = cat.split('/').map(function(s) { return LocalFS.sanitize(s); }).filter(Boolean);
  if (!catSegs.length) return nameSeg;
  var catPath = catSegs.join('/');
  // 末段已是角色名 → 直接用 category 路径；否则 role 名作为最后一层追加
  if (catSegs[catSegs.length - 1] === nameSeg) return catPath;
  return catPath + '/' + nameSeg;
}

// 保存单个版本文件（每版本独立文件，并发写互不覆盖）
function stcdInspireSaveVersion(it, version) {
  if (!it._dirName) it._dirName = stcdInspireDirName(it);
  var dir = it._dirName;
  var file = STCD_INSPIRE_VERSION_FILES[version];
  var data = it.versions[version] || stcdInspireEmptyVersion(version);
  return LocalFS.saveJSON(STCD_INSPIRE_DIR + dir + '/' + file, data)
    .catch(function() { if (typeof toast === 'function') toast('灵感角色保存失败'); });
}

// 保存角色条目元数据（id/category/createdAt/anchor → meta.json），保证分类与职位锚点在重启后不丢失
function stcdInspireSaveMeta(it) {
  if (!it || !it._dirName) { if (it) it._dirName = stcdInspireDirName(it); else return Promise.resolve(); }
  var data = { id: it.id, category: it.category || '', createdAt: it.createdAt || '' };
  if (it.anchor) data.anchor = it.anchor;
  return LocalFS.saveJSON(STCD_INSPIRE_DIR + it._dirName + '/meta.json', data)
    .catch(function() { if (typeof toast === 'function') toast('灵感角色元数据保存失败'); });
}

function stcdInspireSave() {
  // 保存全部角色、全部版本（每版本独立文件）+ 元数据
  var w = Promise.resolve();
  STCD_INSPIRE.items.forEach(function(it) {
    STCD_INSPIRE_VERSIONS.forEach(function(v) {
      w = w.then(function() { return stcdInspireSaveVersion(it, v); });
    });
    w = w.then(function() { return stcdInspireSaveMeta(it); });
  });
  return w;
}

// 兼容：旧代码可能调用 stcdInspireSaveItem（单文件保存）——改为保存全部版本 + 元数据
function stcdInspireSaveItem(it) {
  var w = Promise.resolve();
  STCD_INSPIRE_VERSIONS.forEach(function(v) {
    w = w.then(function() { return stcdInspireSaveVersion(it, v); });
  });
  return w.then(function() { return stcdInspireSaveMeta(it); });
}

// 角色显示名（normal 版优先，其次任一非空版本）
function stcdInspireDisplayName(it) {
  if (!it) return '未命名';
  if (it.versions) {
    if (it.versions.normal && it.versions.normal.name) return it.versions.normal.name;
    if (it.versions.normal && it.versions.normal.identity && it.versions.normal.identity.name) return it.versions.normal.identity.name;
    for (var i = 0; i < STCD_INSPIRE_VERSIONS.length; i++) {
      var v = it.versions[STCD_INSPIRE_VERSIONS[i]];
      if (v && v.name) return v.name;
      if (v && v.identity && v.identity.name) return v.identity.name;
    }
  }
  return it.name || '未命名';
}

// 代表人物的展示文本：身份「名字」（有身份时），否则仅名字。用于喂给 AI，让模型判断「哪个身份已被某人占据」。
function stcdInspire代表文本(it) {
  if (!it) return '';
  var nm = stcdInspireDisplayName(it);
  var t = '';
  if (it.versions) {
    for (var i = 0; i < STCD_INSPIRE_VERSIONS.length; i++) {
      var v = it.versions[STCD_INSPIRE_VERSIONS[i]];
      if (v && v.identity && v.identity.title) { t = v.identity.title; break; }
      if (v && v.title) { t = v.title; break; }
    }
  } else if (it.title) { t = it.title; }
  return t ? (t + '「' + nm + '」') : nm;
}

// ===== CRUD（前缀 stcdInspire*，避免与主角色卡混淆）=====
function stcdInspireAdd(item) {
  var it = stcdInspireNewItem();
  it.id = 'i_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  it.createdAt = new Date().toISOString();
  it.category = (item && item.category) || '';
  // item 若带 versions 则填充对应版本（支持路径键或嵌套结构）
  if (item && item.versions) {
    STCD_INSPIRE_VERSIONS.forEach(function(v) {
      if (item.versions[v]) {
        Object.keys(item.versions[v]).forEach(function(k) {
          var val = item.versions[v][k];
          if (val === undefined) return;
          if (val && typeof val === 'object' && !(k.indexOf('.') >= 0)) {
            // 嵌套对象：逐层展开
            Object.keys(val).forEach(function(k2) {
              if (val[k2] !== undefined) stcdInspireSetField(it.versions[v], k + '.' + k2, val[k2]);
            });
          } else {
            // 路径键（如 'identity.age'）或标量
            stcdInspireSetField(it.versions[v], k, val);
          }
        });
      }
    });
  } else if (item) {
    // 兼容平铺字段 → 填 normal 版
    Object.keys(item).forEach(function(k) {
      if (item[k] !== undefined) stcdInspireSetField(it.versions.normal, k, item[k]);
    });
  }
  STCD_INSPIRE.items.push(it);
  return stcdInspireSave().then(function() { return it; });
}

// 注意：灵感角色字段不可手动修改（只读原则），无 stcdInspireUpdate；只能 AI 生成或删除。

function stcdInspireDelete(id) {
  var target = STCD_INSPIRE.items.filter(function(x) { return x.id === id; })[0];
  STCD_INSPIRE.items = STCD_INSPIRE.items.filter(function(x) { return x.id !== id; });
  // 按文件夹删除（整目录：三版本文件 + 分类等）
  if (target && target._dirName) {
    return LocalFS.delete(STCD_INSPIRE_DIR + target._dirName)
      .then(function() { return true; })
      .catch(function() { return true; });
  }
  return Promise.resolve(true);
}

// 取指定版本数据（无则返回空版本）
function stcdInspireGetVersion(it, version) {
  if (!it || !it.versions) return stcdInspireEmptyVersion(version);
  return it.versions[version] || stcdInspireEmptyVersion(version);
}

// ===== 对外唯一入口说明 =====
// 本文件不定义任何全局读取函数。
// 跨模块调用灵感角色：【唯一】入口是 window.灵感角色全部(角色对象, 版本)（区块-提示词/全局函数）。
// 生图词典 UI 内部通过 window.STCD_INSPIRE.items 直接访问数据。

// 数据容器（UI 内部访问）
window.STCD_INSPIRE = STCD_INSPIRE;
window.STCD_INSPIRE_VERSIONS = STCD_INSPIRE_VERSIONS;
window.STCD_INSPIRE_VERSION_LABELS = STCD_INSPIRE_VERSION_LABELS;
window.STCD_INSPIRE_FIELDS = STCD_INSPIRE_FIELDS;
// 仅供生图词典 UI 内部使用的 CRUD（不对外暴露为跨模块入口）
window.stcdInspireLoad = stcdInspireLoad;
window.stcdInspireSave = stcdInspireSave;
window.stcdInspireAdd = stcdInspireAdd;
// 注意：不导出 stcdInspireUpdate —— 灵感角色字段不可手动修改，只能 AI 生成（只读原则）
window.stcdInspireDelete = stcdInspireDelete;
window.stcdInspireGetVersion = stcdInspireGetVersion;
window.stcdInspireDisplayName = stcdInspireDisplayName;
window.stcdInspire代表文本 = stcdInspire代表文本;
window.stcdInspireGetField = stcdInspireGetField;
window.stcdInspireSetField = stcdInspireSetField;
window.stcdInspireEmptyVersion = stcdInspireEmptyVersion;
window.stcdInspireCategoryTree = stcdInspireCategoryTree;
window.stcdInspireReadBaseFromDisk = stcdInspireReadBaseFromDisk;
window.stcdInspireUploadImage = stcdInspireUploadImage;
window.stcdInspireDeleteImage = stcdInspireDeleteImage;

// ===== AI 生成（二元模板：AI 字段 + 提示词模板 + 弹窗 + 回填）=====
// 正常版生成：描述 → 正常版完整 JSON
// 容错：把 AI 可能返回的三层嵌套结构（如 identity.basicInfo.name）展平为解析器期望的「区块→字段」两层结构
var STCD_INSPIRE_MODULE_MAP = { basicInfo: 'identity', outfit: 'clothing', details: 'accessories', features: 'appearance', profile: 'kinks' };
function stcdInspireFlatten(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) return d;
  var out = {};
  Object.keys(d).forEach(function(k) {
    var v = d[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      // 该值对象里是否含顶层模块键（如 identity 里有 basicInfo）？
      var hasModule = false;
      Object.keys(v).forEach(function(kk) { if (STCD_INSPIRE_MODULE_MAP.hasOwnProperty(kk)) hasModule = true; });
      if (hasModule) {
        var flat = {};
        Object.keys(v).forEach(function(kk) {
          var mv = v[kk];
          if (STCD_INSPIRE_MODULE_MAP.hasOwnProperty(kk) && mv && typeof mv === 'object' && !Array.isArray(mv)) {
            Object.keys(mv).forEach(function(ck) { flat[ck] = mv[ck]; });
          } else {
            flat[kk] = mv;   // 区块层已有的直接字段（如 identity.name）保留
          }
        });
        out[k] = flat;
      } else {
        out[k] = v;
      }
    } else {
      out[k] = v;
    }
  });
  return out;
}
function stcdInspireApplyNormal(d, desc, gender) {
  if (!d || typeof d !== 'object') return false;
  // 容错：AI 可能返回字段元数据数组（[{block, fields:{...}}]）而非数据对象
  if (Array.isArray(d)) {
    var merged = {};
    d.forEach(function(seg) {
      if (seg && seg.fields && typeof seg.fields === 'object') {
        // 按 block 名嵌套回区块（如 {identity:{name,gender,...}}）
        if (seg.block) merged[seg.block] = seg.fields;
        else Object.keys(seg.fields).forEach(function(k) { merged[k] = seg.fields[k]; });
      }
    });
    if (Object.keys(merged).length) d = merged;
  }
  d = stcdInspireFlatten(d);
  var name = (d.identity && d.identity.name) ? d.identity.name : (d.name || '未命名');
  // 目标角色优先：生成框指定 targetId 时写该角色，否则按名字匹配
  // forceNew（职位生成）：一律作为新角色追加，绝不覆盖同名已有角色
  var existing = null;
  var forceNew = (typeof STCD_INSPIRE_GEN !== 'undefined' && STCD_INSPIRE_GEN.forceNew);
  if (STCD_INSPIRE_GEN) STCD_INSPIRE_GEN.forceNew = false;   // 消费后重置
  if (!forceNew) {
    if (typeof STCD_INSPIRE_GEN !== 'undefined' && STCD_INSPIRE_GEN.targetId) {
      existing = STCD_INSPIRE.items.filter(function(x) { return x.id === STCD_INSPIRE_GEN.targetId; })[0];
    }
    if (!existing) existing = STCD_INSPIRE.items.filter(function(x) { return stcdInspireDisplayName(x) === name; })[0];
  }
  var it = existing || stcdInspireEmptyItem();
  // 写分类（从生成配置读取）
  if (typeof STCD_INSPIRE_GEN !== 'undefined') {
    if (STCD_INSPIRE_GEN.category) it.category = STCD_INSPIRE_GEN.category;
    // 职位锚点（世界/入口/条目/级别/职位）——用于在层级视图中把角色挂到对应职位
    if (STCD_INSPIRE_GEN.anchor) it.anchor = STCD_INSPIRE_GEN.anchor;
  }
  // 按正常版字段结构写入
  var fields = (typeof window.stcdInspireGetFields === 'function') ? window.stcdInspireGetFields('normal') : STCD_INSPIRE_FIELDS;
  var v = stcdInspireEmptyVersion('normal');
  Object.keys(d).forEach(function(k) {
    var val = d[k];
    if (val === null || val === undefined) return;
    if (val && typeof val === 'object') {
      Object.keys(val).forEach(function(k2) {
        if (val[k2] !== null && val[k2] !== undefined) stcdInspireSetField(v, k + '.' + k2, val[k2]);
      });
    } else {
      stcdInspireSetField(v, k, val);
    }
  });
  it.versions.normal = v;
  return stcdInspireSave().then(function() { return it; });
}

function stcdInspireEmptyItem() {
  var it = stcdInspireNewItem();
  it.id = 'i_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  it.createdAt = new Date().toISOString();
  STCD_INSPIRE.items.push(it);
  return it;
}

// 派生版生成：正常版内容 → 目标版本 JSON
function stcdInspireApplyDerive(d, targetVersion, it) {
  if (!d || typeof d !== 'object') return false;
  // 容错：AI 返回字段元数据数组时按 block 嵌套
  if (Array.isArray(d)) {
    var merged = {};
    d.forEach(function(seg) {
      if (seg && seg.fields && typeof seg.fields === 'object') {
        if (seg.block) merged[seg.block] = seg.fields;
        else Object.keys(seg.fields).forEach(function(k) { merged[k] = seg.fields[k]; });
      }
    });
    if (Object.keys(merged).length) d = merged;
  }
  var v = stcdInspireEmptyVersion(targetVersion);
  Object.keys(d).forEach(function(k) {
    var val = d[k];
    if (val === null || val === undefined) return;
    if (val && typeof val === 'object') {
      Object.keys(val).forEach(function(k2) {
        if (val[k2] !== null && val[k2] !== undefined) stcdInspireSetField(v, k + '.' + k2, val[k2]);
      });
    } else {
      stcdInspireSetField(v, k, val);
    }
  });
  it.versions[targetVersion] = v;
  return stcdInspireSave();
}

// 从磁盘读取指定角色的正常版内容（生成即保存，磁盘始终有最新数据）
function stcdInspireReadBaseFromDisk(targetId) {
  var it = STCD_INSPIRE.items.filter(function(x) { return x.id === targetId; })[0] || null;
  if (!it || !it._dirName) return Promise.resolve(null);
  return LocalFS.readJSON(STCD_INSPIRE_DIR + it._dirName + '/' + STCD_INSPIRE_VERSION_FILES.normal).then(function(d) {
    if (!d || !d.identity) return null;
    return d;
  }).catch(function() { return null; });
}

// 上传版本图片（dataUrl → 纯 base64 存盘 → 更新内存）
function stcdInspireUploadImage(it, version, dataUrl) {
  if (!it || !it._dirName || !STCD_INSPIRE_AVATAR_FILES[version]) return Promise.resolve(false);
  var b64 = String(dataUrl || '').replace(/^data:image\/[^;]+;base64,/, '');
  if (!b64) return Promise.resolve(false);
  return LocalFS.saveBinary(STCD_INSPIRE_DIR + it._dirName + '/' + STCD_INSPIRE_AVATAR_FILES[version], b64)
    .then(function(res) {
      if (!res || !res.ok) return false;
      it.avatars[version] = 'data:image/jpeg;base64,' + b64;
      return true;
    })
    .catch(function() { return false; });
}

// 删除版本图片（删磁盘文件 + 清内存）
function stcdInspireDeleteImage(it, version) {
  if (!it || !it._dirName || !STCD_INSPIRE_AVATAR_FILES[version]) return Promise.resolve(false);
  return LocalFS.delete(STCD_INSPIRE_DIR + it._dirName + '/' + STCD_INSPIRE_AVATAR_FILES[version])
    .then(function() {
      it.avatars[version] = null;
      return true;
    })
    .catch(function() { return false; });
}

// 派生版 LLM 调用（正常版为基础 → 清凉/深度，base 从磁盘读取）
function stcdInspireGenDerive(version, it) {
  var tpl = '';
  if (typeof window.stcdInspireGetFields === 'function') {
    var _t = {};
    window.stcdInspireGetFields(version).forEach(function(b) {
      var blk = {};
      b.fields.forEach(function(f) { blk[f.key] = (f.type === 'array') ? [''] : ''; });
      _t[b.block] = blk;
    });
    tpl = JSON.stringify(_t);
  }
  var promptName = version === 'cool' ? 'inspire_char_derive_cool' : 'inspire_char_derive_deep';
  return stcdInspireReadBaseFromDisk(it.id).then(function(base) {
    if (!base) throw new Error('磁盘上未读取到正常版内容，无法派生');
    var rendered = (typeof renderPrompt === 'function')
      ? renderPrompt(promptName, { base: JSON.stringify(base), template: tpl })
      : { system: '', user: '' };
    return LLM.callJSON({
      label: '灵感角色派生(' + version + ')',
      system: rendered.system,
      prompt: rendered.user,
    }).then(function(d) {
      if (!d || typeof d !== 'object') return false;
      return stcdInspireApplyDerive(d, version, it).then(function() { return true; });
    });
  });
}
window.stcdInspireGenDerive = stcdInspireGenDerive;

// AI 字段注册
(function() {
  if (typeof registerAiField !== 'function') return;
  registerAiField('stcd-inspire-gen', '灵感角色生成', function() {
    var desc = (typeof STCD_INSPIRE_GEN !== 'undefined' && STCD_INSPIRE_GEN.desc) ? STCD_INSPIRE_GEN.desc : '';
    var gender = (typeof STCD_INSPIRE_GEN !== 'undefined' && STCD_INSPIRE_GEN.gender) ? STCD_INSPIRE_GEN.gender : '女';
    var category = (typeof STCD_INSPIRE_GEN !== 'undefined' && STCD_INSPIRE_GEN.category) ? STCD_INSPIRE_GEN.category : '';
    // 典型场景：若在场景节点上生成，把场景/节点上下文拼入描述，让 AI 知道人物属于哪个身份
    var sn = (typeof STCD_INSPIRE_GEN !== 'undefined' && STCD_INSPIRE_GEN.sceneNode) ? STCD_INSPIRE_GEN.sceneNode : null;
    if (sn && sn.nodeName) {
      var 上下文 = (sn.场景名 ? '场景「' + sn.场景名 + '」；' : '') + '该人物属于身份「' + sn.nodeName + '」。';
      desc = desc ? ('[' + 上下文 + '] ' + desc) : 上下文;
    }
    var tpl = '';
    if (typeof window.stcdInspireGetFields === 'function') {
      var _t = {};
      window.stcdInspireGetFields('normal').forEach(function(b) {
        var blk = {};
        b.fields.forEach(function(f) { blk[f.key] = (f.type === 'array') ? [''] : ''; });
        _t[b.block] = blk;
      });
      tpl = JSON.stringify(_t);
    }
    return { user: desc, gender: gender, category: category, template: tpl };
  }, {
    suggestPrompt: 'inspire_char_gen',
    gender: true,
    fillFn: function(d) {
      var gen = (typeof STCD_INSPIRE_GEN !== 'undefined') ? STCD_INSPIRE_GEN : {};
      var desc = gen.desc || '';
      var gender = gen.gender || '女';
      var posRefresh = !!(gen && gen.posRefresh);
      var sceneNode = (gen && gen.sceneNode) ? gen.sceneNode : null;   // 兼容旧典型场景（不再用于挂回）
      if (STCD_INSPIRE_GEN) { STCD_INSPIRE_GEN.posRefresh = false; STCD_INSPIRE_GEN.sceneNode = null; }   // 消费后重置
      // 正常版写入（写入即保存到磁盘）
      stcdInspireApplyNormal(d, desc, gender).then(function(it) {
        if (typeof toast === 'function') toast('灵感角色已生成');
        if (typeof stcdInspireRenderCards === 'function') stcdInspireRenderCards();
        // 若从「职位」生成，刷新层级视图让角色立即挂到该职位
        if (posRefresh && typeof stcdInspireRenderWorld === 'function') stcdInspireRenderWorld();
        // 若从详情弹窗生成，刷新详情内容
        if (typeof stcdInspireView === 'function' && it && STCD_INSPIRE_GEN && STCD_INSPIRE_GEN.fromDetail) {
          var ov = document.querySelector('.ovl');
          if (ov) ov.remove();
          stcdInspireView(it.id);
        }
      });
    },
  });

  // 补充生成（详情弹窗版本卡片「🔧 补充生成」）：保留已填字段，只补空字段
  registerAiField('stcd-inspire-gen-fill', '灵感角色补充生成', function() {
    var g = (typeof STCD_INSPIRE_GEN !== 'undefined') ? STCD_INSPIRE_GEN : {};
    var it = STCD_INSPIRE.items.filter(function(x) { return x.id === g.targetId; })[0];
    var ver = g.fillVersion || 'normal';
    var vdata = (it && it.versions && it.versions[ver]) ? it.versions[ver] : {};
    var existing = {};
    Object.keys(vdata).forEach(function(bk) { if (vdata[bk] && typeof vdata[bk] === 'object') existing[bk] = vdata[bk]; });
    var tpl = '';
    if (typeof window.stcdInspireGetFields === 'function') {
      var _t = {};
      window.stcdInspireGetFields('normal').forEach(function(b) {
        var blk = {};
        b.fields.forEach(function(f) { blk[f.key] = (f.type === 'array') ? [''] : ''; });
        _t[b.block] = blk;
      });
      tpl = JSON.stringify(_t);
    }
    // 版本口吻：按当前版本选用该版本「正常生成」时的口吻词
    var tone;
    if (ver === 'cool') tone = '清凉版口吻：服饰清凉暴露（半透明薄纱、领口滑落、高开衩、无外搭），身份/背景/性格核心与正常版一致，只是衣着与气质偏清凉性感。';
    else if (ver === 'deep') tone = '深度版口吻：以「性」为根本与核心重新表述——情色身世、以暴露/挑逗为取向的服饰、直白重述性征（胸部/生殖器官/肛门）、露骨性爱明细、性癖标签；身份/背景/性格核心保留。';
    else tone = '正常版口吻：服饰端正保守（交领右衽、裙长曳地、有外搭），气质温婉端正。';
    return { user: '', gender: (g.gender || '女'), category: (g.category || ''), existing: JSON.stringify(existing), template: tpl, tone: tone };
  }, {
    suggestPrompt: 'inspire_char_gen_fill',
    fillFn: function(d) {
      var g = (typeof STCD_INSPIRE_GEN !== 'undefined') ? STCD_INSPIRE_GEN : {};
      var it = STCD_INSPIRE.items.filter(function(x) { return x.id === g.targetId; })[0];
      if (!it) { if (typeof toast === 'function') toast('角色不存在'); return; }
      var ver = g.fillVersion || 'normal';
      // 先保存旧版本（已填字段），避免被 AI 覆盖
      var oldv = it.versions && it.versions[ver] ? JSON.parse(JSON.stringify(it.versions[ver])) : null;
      stcdInspireApplyNormal(d, '', (g.gender || '女')).then(function(nit) {
        // 保留已填：把旧版本里非空字段覆盖回新结果，AI 只补空的字段（不覆盖已填）
        var nv = nit.versions.normal;
        if (oldv) {
          Object.keys(oldv).forEach(function(bk) {
            if (oldv[bk] && typeof oldv[bk] === 'object') {
              Object.keys(oldv[bk]).forEach(function(k) {
                var v = oldv[bk][k];
                if (v != null && v !== '' && (!Array.isArray(v) || v.length)) {
                  stcdInspireSetField(nv, bk + '.' + k, v);
                }
              });
            }
          });
        }
        it.versions[ver] = nv;
        return stcdInspireSave().then(function() {
          if (typeof toast === 'function') toast('已补充生成（保留已填字段）');
          if (typeof stcdInspireView === 'function') {
            var ovl = document.querySelector('.ovl');
            if (ovl) ovl.remove();
            stcdInspireView(it.id);
          }
        });
      });
    },
  });

  // 导入世界 · 势力的「级别」层级生成（走二元模板弹窗；目标由 UI 在打开前写入 STCD_INSPIRE_LVGEN）
  registerAiField('stcd-inspire-level-gen', '导入世界·级别生成', function() {
    var g = (typeof STCD_INSPIRE_LVGEN !== 'undefined') ? STCD_INSPIRE_LVGEN : {};
    return { user: '', name: (g.条目名 || ''), detail: (g.详细 || ''), context: (g.上下文 || '') };
  }, {
    suggestPrompt: 'inspire_world_level_gen',
    count: true,
    defaultCount: 6,
    countLabel: '个级别（层级）',
    countNote: '每个级别的职位数量不做限制。',
    fillFn: function(d) {
      var g = (typeof STCD_INSPIRE_LVGEN !== 'undefined') ? STCD_INSPIRE_LVGEN : {};
      var list = (window.STCD_INSPIRE_IMPORT_LIST) ? window.STCD_INSPIRE_IMPORT_LIST : [];
      var imp = null;
      for (var i = 0; i < list.length; i++) if (list[i].世界名 === g.世界名) { imp = list[i]; break; }
      if (!imp || !imp.内容 || !imp.内容[g.入口] || !imp.内容[g.入口][g.itemIdx]) { if (typeof toast === 'function') toast('找不到该势力/地点'); return; }
      var item = imp.内容[g.入口][g.itemIdx];
      var arr = (d && Array.isArray(d['级别'])) ? d['级别'] : (Array.isArray(d) ? d : null);
      if (!arr || !arr.length) { if (typeof toast === 'function') toast('生成结果为空'); return; }
      arr.forEach(function(lv) { if (!lv['职位']) lv['职位'] = []; });
      item['级别'] = arr;
      window.stcdInspire导入世界观保存(list).then(function() {
        if (typeof toast === 'function') toast('级别已生成');
        var 条目名 = item['条目'] || '未命名';
        if (typeof STCD_INSPIRE_WORLD !== 'undefined') STCD_INSPIRE_WORLD.path = ['__import__', g.世界名, g.入口, 条目名];
        if (typeof stcdInspireRenderWorld === 'function') stcdInspireRenderWorld();
        if (typeof stcdInspireRenderCards === 'function') stcdInspireRenderCards();
      });
    },
  });

  // 导入世界 · 某个「级别」下的职位生成（走二元模板弹窗；目标由 UI 在打开前写入 STCD_INSPIRE_POSGEN）
  registerAiField('stcd-inspire-pos-gen', '导入世界·职位生成', function() {
    var g = (typeof STCD_INSPIRE_POSGEN !== 'undefined') ? STCD_INSPIRE_POSGEN : {};
    return { user: '', name: (g.条目名 || ''), levelName: (g.levelName || ''), levelDesc: (g.levelDesc || ''), context: (g.上下文 || '') };
  }, {
    suggestPrompt: 'inspire_world_pos_gen',
    fillFn: function(d) {
      var g = (typeof STCD_INSPIRE_POSGEN !== 'undefined') ? STCD_INSPIRE_POSGEN : {};
      var list = (window.STCD_INSPIRE_IMPORT_LIST) ? window.STCD_INSPIRE_IMPORT_LIST : [];
      var imp = null;
      for (var i = 0; i < list.length; i++) if (list[i].世界名 === g.世界名) { imp = list[i]; break; }
      if (!imp || !imp.内容 || !imp.内容[g.入口] || !imp.内容[g.入口][g.itemIdx]) { if (typeof toast === 'function') toast('找不到该势力/地点'); return; }
      var item = imp.内容[g.入口][g.itemIdx];
      var lv = (item['级别'] || [])[g.级别Idx] || null;
      if (!lv) { if (typeof toast === 'function') toast('找不到该级别'); return; }
      var arr = (d && Array.isArray(d['职位'])) ? d['职位'] : (Array.isArray(d) ? d : null);
      if (!arr || !arr.length) { if (typeof toast === 'function') toast('生成结果为空'); return; }
      // 补充而非覆盖：新职位追加到该级别已有职位末尾，同名职位不重复添加
      if (!lv['职位']) lv['职位'] = [];
      arr.forEach(function(p) {
        var pname = (p && p['名称']) || '';
        var dup = false;
        for (var e = 0; e < lv['职位'].length; e++) {
          if (lv['职位'][e] && lv['职位'][e]['名称'] === pname) { dup = true; break; }
        }
        if (!dup) lv['职位'].push(p);
      });
      window.stcdInspire导入世界观保存(list).then(function() {
        if (typeof toast === 'function') toast('职位已补充');
        var 条目名 = item['条目'] || '未命名';
        if (typeof STCD_INSPIRE_WORLD !== 'undefined') STCD_INSPIRE_WORLD.path = ['__import__', g.世界名, g.入口, 条目名];
        if (typeof stcdInspireRenderWorld === 'function') stcdInspireRenderWorld();
        if (typeof stcdInspireRenderCards === 'function') stcdInspireRenderCards();
      });
    },
  });

  // 导入世界 · 该势力的「台面代表人物」生成（走二元模板弹窗；目标由 UI 在打开前写入 STCD_INSPIRE_PERSONAGEN；产出与普通角色一致的灵感角色卡片）
  registerAiField('stcd-inspire-persona-gen', '导入世界·代表人物生成', function() {
    var g = (typeof STCD_INSPIRE_PERSONAGEN !== 'undefined') ? STCD_INSPIRE_PERSONAGEN : {};
    var 性别 = (typeof STCD_INSPIRE_GEN !== 'undefined' && STCD_INSPIRE_GEN.gender) ? STCD_INSPIRE_GEN.gender : '女';
    // 字段结构模板：给「区块内扁平」的嵌套对象示例，让模型照正确形状输出（避免 {block,fields} 平铺段）
    var tpl = {};
    if (typeof window.stcdInspireGetFields === 'function') {
      window.stcdInspireGetFields('normal').forEach(function(b) {
        var blk = {};
        b.fields.forEach(function(f) { blk[f.key] = (f.type === 'array') ? [''] : ''; });
        tpl[b.block] = blk;
      });
    }
    return { user: '', name: (g.条目名 || ''), detail: (g.详细 || ''), context: (g.上下文 || ''), 性别: 性别, template: JSON.stringify(tpl) };
  }, {
    suggestPrompt: 'inspire_persona_gen',
    count: true,
    defaultCount: 3,
    countLabel: '位',
    gender: true,
    fillFn: function(d) {
      var g = (typeof STCD_INSPIRE_PERSONAGEN !== 'undefined') ? STCD_INSPIRE_PERSONAGEN : {};
      var list = (window.STCD_INSPIRE_IMPORT_LIST) ? window.STCD_INSPIRE_IMPORT_LIST : [];
      var imp = null;
      for (var i = 0; i < list.length; i++) if (list[i].世界名 === g.世界名) { imp = list[i]; break; }
      if (!imp || !imp.内容 || !imp.内容[g.入口] || !imp.内容[g.入口][g.itemIdx]) { if (typeof toast === 'function') toast('找不到该势力/地点'); return; }
      var item = imp.内容[g.入口][g.itemIdx];
      var 条目名 = item['条目'] || '未命名';
      var personaPath = '世界观/' + g.世界名 + '/' + g.入口 + '/' + 条目名 + '/代表人物';
      var arr = (d && Array.isArray(d['代表人物'])) ? d['代表人物'] : (Array.isArray(d) ? d : null);
      if (!arr || !arr.length) { if (typeof toast === 'function') toast('生成结果为空'); return; }
      // 逐个人物建成灵感角色（增量：同名不重复；分类锚点=代表人物）
      var created = 0;
      var seq = arr.map(function(p) {
        if (!p || typeof p !== 'object') return Promise.resolve();
        p = stcdInspireFlatten(p);
        var pname = (p.identity && p.identity.name) || p.name || '';
        if (pname) {
          var dup = STCD_INSPIRE.items.some(function(c) { return (c.category || '').indexOf(personaPath) === 0 && stcdInspireDisplayName(c) === pname; });
          if (dup) return Promise.resolve();
        }
        STCD_INSPIRE_GEN.category = personaPath;
        STCD_INSPIRE_GEN.anchor = { 世界名: g.世界名, 入口: g.入口, 条目: 条目名, 代表人物: true };
        STCD_INSPIRE_GEN.forceNew = true;
        var gender = (p.identity && p.identity.gender) || '';
        var desc = (p.identity && p.identity.title) ? p.identity.title : (item['详细描述'] || '');
        return stcdInspireApplyNormal(p, desc, gender).then(function(it) { if (it) created++; });
      });
      Promise.all(seq).then(function() {
        if (typeof toast === 'function') toast('代表人物已生成 ' + created + ' 位');
        if (typeof STCD_INSPIRE_WORLD !== 'undefined') STCD_INSPIRE_WORLD.path = ['__import__', g.世界名, g.入口, 条目名];
        if (typeof stcdInspireRenderWorld === 'function') stcdInspireRenderWorld();
        if (typeof stcdInspireRenderCards === 'function') stcdInspireRenderCards();
      });
    },
  });

  // 导入世界/典型场景 · 「典型场景」生成（走二元模板：场景名 + 整批按地位分层的人；由用户方向输入提炼场景）
  registerAiField('stcd-inspire-scene-tree-gen', '典型场景·生成（场景+人）', function() {
    return { user: '' };
  }, {
    suggestPrompt: 'inspire_scene_tree_gen',
    fillFn: function(d) {
      // AI 返回 { org(势力名), name(地点名), desc(场景描述), levels:[{name, persons:[{name,title}]}] }
      var levels = (d && Array.isArray(d.levels)) ? d.levels : [];
      if (!levels.length) { if (typeof toast === 'function') toast('生成结果为空'); return; }
      var 势力名 = (d && d.org) ? d.org : '';
      var 场景名 = (d && d.name) ? d.name : '未命名场景';
      var 描述 = (d && d.desc) ? d.desc : '';
      var pending = (typeof stcdSceneCreate === 'function') ? stcdSceneCreate(场景名, 描述, 势力名) : Promise.reject(new Error('场景创建函数未就绪'));
      pending.then(function(s) {
        if (!s.levels) s.levels = [];
        var writes = Promise.resolve();
        var usedLevels = [];
        levels.forEach(function(lv) {
          if (!lv || typeof lv !== 'object') return;
          var levelObj = stcdSceneAddLevelObj(s, (lv.name || ''));
          usedLevels.push(levelObj);
          (lv.persons || []).forEach(function(p) {
            if (!p || typeof p !== 'object') return;
            writes = writes.then(function() { return makeScenePersonToLevel(s, levelObj, p); });
          });
        });
        writes.then(function() {
          if (typeof stcdSceneSave === 'function') stcdSceneSave().then(function() {
            if (typeof toast === 'function') toast('场景已生成');
            if (typeof window.stcdInspireSceneOpen === 'function') window.stcdInspireSceneOpen(s.id);
          });
        });
      });
    },
  });

  // 典型场景 · 对已有场景「一键生成一批人」：按地位分层补人到场景（走二元模板弹窗）
  registerAiField('stcd-inspire-scene-person-gen', '典型场景·生成一批人', function() {
    var g = (typeof STCD_INSPIRE_SCENEGEN !== 'undefined') ? STCD_INSPIRE_SCENEGEN : {};
    return { user: '', 场景名: (g.场景名 || ''), 描述: (g.描述 || ''), 已有层: (g.已有层 || []) };
  }, {
    suggestPrompt: 'inspire_scene_person_gen',
    count: true,
    defaultCount: 8,
    fillFn: function(d) {
      var g = (typeof STCD_INSPIRE_SCENEGEN !== 'undefined') ? STCD_INSPIRE_SCENEGEN : {};
      var scene = (typeof stcdSceneGet === 'function') ? stcdSceneGet(g.场景id) : null;
      if (!scene) { if (typeof toast === 'function') toast('场景不存在'); return; }
      // AI 返回 { levels:[{name, persons:[{name,title}]}] }
      var levels = (d && Array.isArray(d.levels)) ? d.levels : (Array.isArray(d) ? d : []);
      if (!levels.length) { if (typeof toast === 'function') toast('生成结果为空'); return; }
      if (!scene.levels) scene.levels = [];
      var writes = Promise.resolve();
      levels.forEach(function(lv) {
        if (!lv || typeof lv !== 'object') return;
        var levelObj = stcdSceneAddLevelObj(scene, (lv.name || ''));
        (lv.persons || []).forEach(function(p) {
          if (!p || typeof p !== 'object') return;
          writes = writes.then(function() { return makeScenePersonToLevel(scene, levelObj, p); });
        });
      });
      writes.then(function() {
        if (typeof stcdSceneSave === 'function') stcdSceneSave().then(function() {
          if (typeof toast === 'function') toast('已生成一批人');
          if (typeof window.stcdInspireSceneRefresh === 'function') window.stcdInspireSceneRefresh();
        });
      });
    },
  });

  // 典型场景 · 在指定层级「加一个人」：生成单个完整人物并挂到该层（二元模板弹窗）
  registerAiField('stcd-inspire-scene-person-add', '典型场景·在该层加一个人', function() {
    var g = (typeof STCD_INSPIRE_PERSONADD !== 'undefined') ? STCD_INSPIRE_PERSONADD : {};
    return { user: '', 场景名: (g.场景名 || ''), 描述: (g.描述 || ''), 已有层: (g.已有层 || []), 目标层: (g.目标层 || ''), 该层已有: (g.该层已有 || []) };
  }, {
    suggestPrompt: 'inspire_scene_person_add',
    fillFn: function(d) {
      var g = (typeof STCD_INSPIRE_PERSONADD !== 'undefined') ? STCD_INSPIRE_PERSONADD : {};
      var scene = (typeof stcdSceneGet === 'function') ? stcdSceneGet(g.场景id) : null;
      if (!scene) { if (typeof toast === 'function') toast('场景不存在'); return; }
      var levelObj = null;
      if (typeof g.levelIdx === 'number' && scene.levels && scene.levels[g.levelIdx]) levelObj = scene.levels[g.levelIdx];
      else (scene.levels || []).forEach(function(lv) { if ((lv.name || '') === g.目标层) levelObj = lv; });
      if (!levelObj) { if (typeof toast === 'function') toast('目标层级不存在'); return; }
      if (!d || !d.identity) { if (typeof toast === 'function') toast('生成结果为空'); return; }
      makeScenePersonToLevel(scene, levelObj, d).then(function() {
        if (typeof stcdSceneSave === 'function') stcdSceneSave().then(function() {
          if (typeof toast === 'function') toast('已加入「' + (g.目标层 || '') + '」');
          if (typeof window.stcdInspireSceneRefresh === 'function') window.stcdInspireSceneRefresh();
        });
      });
    },
  });

  // 典型场景 · 台面「代表人物」生成（批量产出完整角色；目标由 UI 写入 STCD_INSPIRE_SCENEPERSONA；产出与普通角色一致的灵感角色卡片）
  registerAiField('stcd-inspire-scene-persona-gen', '典型场景·代表人物生成', function() {
    var g = (typeof STCD_INSPIRE_SCENEPERSONA !== 'undefined') ? STCD_INSPIRE_SCENEPERSONA : {};
    // 性别：由弹窗「性别」选择传入（默认女）
    var 性别 = (typeof STCD_INSPIRE_GEN !== 'undefined' && STCD_INSPIRE_GEN.gender) ? STCD_INSPIRE_GEN.gender : '女';
    // 字段结构模板：给「区块内扁平」的嵌套对象示例，让模型照正确形状输出（避免 {block,fields} 平铺段）
    var tpl = {};
    if (typeof window.stcdInspireGetFields === 'function') {
      window.stcdInspireGetFields('normal').forEach(function(b) {
        var blk = {};
        b.fields.forEach(function(f) { blk[f.key] = (f.type === 'array') ? [''] : ''; });
        tpl[b.block] = blk;
      });
    }
    var detail = '场景：' + (g.场景名 || '');
    if (g.描述) detail += '\n场景描述：' + g.描述;
    if (g.已有层 && g.已有层.length) detail += '\n已有层级（每层已有的人：身份「名字」，代表人物在与他们对得上号的同时，名字与经历不得与他们完全一样）：\n' + g.已有层.join('\n');
    if (g.已有代表 && g.已有代表.length) detail += '\n【已有代表人物（代表人物可与他们重合，但**名字与身份经历不得与他们完全一样**；同一身份可有多人，但每位身份经历须彼此不同、不重复）】\n' + g.已有代表.join('、');
    return { user: '', name: (g.场景名 || ''), detail: detail, context: '', 性别: 性别, template: JSON.stringify(tpl) };
  }, {
    suggestPrompt: 'inspire_scene_persona_gen',
    count: true,
    defaultCount: 3,
    countLabel: '位',
    gender: true,
    fillFn: function(d) {
      var g = (typeof STCD_INSPIRE_SCENEPERSONA !== 'undefined') ? STCD_INSPIRE_SCENEPERSONA : {};
      var scene = (typeof stcdSceneGet === 'function') ? stcdSceneGet(g.场景id) : null;
      if (!scene) { if (typeof toast === 'function') toast('场景不存在'); return; }
      var personaPath = '典型场景/' + (scene.name || '') + '/代表人物';
      var arr = (d && Array.isArray(d['代表人物'])) ? d['代表人物'] : (Array.isArray(d) ? d : null);
      if (!arr || !arr.length) { if (typeof toast === 'function') toast('生成结果为空'); return; }
      var created = 0;
      var seq = arr.map(function(p) {
        if (!p || typeof p !== 'object') return Promise.resolve();
        p = stcdInspireFlatten(p);
        var pname = (p.identity && p.identity.name) || p.name || '';
        if (pname) {
          var dup = STCD_INSPIRE.items.some(function(c) { return (c.category || '').indexOf(personaPath) === 0 && stcdInspireDisplayName(c) === pname; });
          if (dup) return Promise.resolve();
        }
        STCD_INSPIRE_GEN.category = personaPath;
        STCD_INSPIRE_GEN.anchor = { 典型场景: true, 场景名: scene.name || '', 代表人物: true };
        STCD_INSPIRE_GEN.forceNew = true;
        var gender = (p.identity && p.identity.gender) || '';
        return stcdInspireApplyNormal(p, '', gender).then(function(it) { if (it) created++; });
      });
      Promise.all(seq).then(function() {
        if (typeof toast === 'function') toast('代表人物已生成 ' + created + ' 位');
        if (typeof window.stcdInspireSceneRefresh === 'function') window.stcdInspireSceneRefresh();
      });
    },
  });

  // 典型场景 · 对已有场景「AI 加一层」：生成新层级与该层的人，并判断插到第几层（走二元模板弹窗）
  registerAiField('stcd-inspire-scene-level-gen', '典型场景·AI 加一层', function() {
    var g = (typeof STCD_INSPIRE_LEVELGEN !== 'undefined') ? STCD_INSPIRE_LEVELGEN : {};
    // 已有层级 → 可读文本（供模板 {已有层} 替换，模板按字符串替换，不能传数组）
    var 已有层文本 = (g.已有层 || []).map(function(l) {
      var ppl = (Array.isArray(l.人) && l.人.length) ? ('[' + l.人.join('、') + ']') : '（空）';
      return '【层序' + l.层序 + '】' + (l.层名 || ('第' + l.层序 + '层')) + '：' + ppl;
    }).join('\n');
    return {
      user: '',
      场景名: (g.场景名 || ''),
      势力名: (g.势力名 || ''),
      场景描述: (g.场景描述 || ''),
      已有层: 已有层文本 || '（该场景当前还没有任何层级）',
      // 若用户在弹窗里没填方向，用这个默认引导 AI
      direction: '请根据场景本身补一个与现有层级相衔接的新层（若你判断需要补充哪些人可按此生成）',
    };
  }, {
    suggestPrompt: 'inspire_scene_level_gen',
    fillFn: function(d) {
      var g = (typeof STCD_INSPIRE_LEVELGEN !== 'undefined') ? STCD_INSPIRE_LEVELGEN : {};
      var scene = (typeof stcdSceneGet === 'function') ? stcdSceneGet(g.场景id) : null;
      if (!scene) { if (typeof toast === 'function') toast('场景不存在'); return; }
      // AI 返回 { levels:[{position, name, persons:[{identity:{...}}]}] }
      var levels = (d && Array.isArray(d.levels)) ? d.levels : (Array.isArray(d) ? d : []);
      if (!levels.length) { if (typeof toast === 'function') toast('生成结果为空'); return; }
      if (!scene.levels) scene.levels = [];
      // 按 position 从大到小插入，保证先插高处下标、后插低处下标时低处不受影响
      var sorted = levels.slice().sort(function(a, b) {
        var pa = (typeof a.position === 'number' && !isNaN(a.position)) ? a.position : 99999;
        var pb = (typeof b.position === 'number' && !isNaN(b.position)) ? b.position : 99999;
        return pb - pa;
      });
      var writes = Promise.resolve();
      var 已加层 = [], 已加人 = 0;
      sorted.forEach(function(lv) {
        if (!lv || typeof lv !== 'object') return;
        var pos = (typeof lv.position === 'number' && !isNaN(lv.position)) ? Math.max(0, Math.floor(lv.position)) : scene.levels.length;
        var levelObj = stcdSceneInsertLevelObj(scene, (lv.name || ''), pos);
        已加层.push(levelObj);
        (lv.persons || []).forEach(function(p) {
          if (!p || typeof p !== 'object') return;
          writes = writes.then(function() { return makeScenePersonToLevel(scene, levelObj, p); }).then(function() { 已加人++; });
        });
      });
      writes.then(function() {
        if (typeof stcdSceneSave === 'function') stcdSceneSave().then(function() {
          if (typeof toast === 'function') toast('已新增 ' + 已加层.length + ' 层、' + 已加人 + ' 人');
          if (typeof window.stcdInspireSceneRefresh === 'function') window.stcdInspireSceneRefresh();
        });
      });
    },
  });

  // 典型场景 · 「AI 生成场景」前先出候选选项（走二元模板；fillFn 交给 UI 层展示选卡）
  registerAiField('stcd-inspire-scene-tree-options', '典型场景·候选选项', function() {
    return { user: '', direction: '' };
  }, {
    suggestPrompt: 'inspire_scene_tree_options',
    fillFn: function(d) {
      if (typeof window.stcdInspireSceneTreeShowOptions === 'function') window.stcdInspireSceneTreeShowOptions(d);
      else if (typeof toast === 'function') toast('候选展示函数未就绪');
    },
  });

  // 典型场景 · 「AI 加一层」前先出候选选项（走二元模板；fillFn 交给 UI 层展示选卡）
  registerAiField('stcd-inspire-scene-level-options', '典型场景·加一层候选', function() {
    var g = (typeof STCD_INSPIRE_LEVELGEN !== 'undefined') ? STCD_INSPIRE_LEVELGEN : {};
    var 已有层文本 = (g.已有层 || []).map(function(l) {
      var ppl = (Array.isArray(l.人) && l.人.length) ? ('[' + l.人.join('、') + ']') : '（空）';
      return '【层序' + l.层序 + '】' + (l.层名 || ('第' + l.层序 + '层')) + '：' + ppl;
    }).join('\n');
    return {
      user: '',
      场景名: (g.场景名 || ''),
      势力名: (g.势力名 || ''),
      场景描述: (g.场景描述 || ''),
      已有层: 已有层文本 || '（该场景当前还没有任何层级）',
      direction: '',
    };
  }, {
    suggestPrompt: 'inspire_scene_level_options',
    fillFn: function(d) {
      if (typeof window.stcdInspireSceneLevelShowOptions === 'function') window.stcdInspireSceneLevelShowOptions(d);
      else if (typeof toast === 'function') toast('候选展示函数未就绪');
    },
  });

  // 典型角色 · 填充（deep/mix 共用的 fillFn）：把 AI 返回的单角色写入灵感角色库
  function stcdInspireCharGenApply(d) {
    var g = (typeof STCD_INSPIRE_CHARGEN !== 'undefined') ? STCD_INSPIRE_CHARGEN : {};
    var name = (g.name || '');
    var idt = (d && d.identity) ? d.identity : {};
    var 真名 = idt.name || name || '未命名';
    STCD_INSPIRE_GEN = { category: '典型角色/' + 真名, gender: idt.gender || '女', forceNew: true };
    var desc = name ? ('角色名：' + name + '；' + (g.ref || '')) : (g.ref || '');
    stcdInspireApplyNormal(d, desc, idt.gender || '女').then(function(it) {
      if (typeof toast === 'function') toast('典型角色已生成：' + 真名);
      if (typeof window.stcdInspireRenderCharTab === 'function') window.stcdInspireRenderCharTab();
      if (typeof stcdInspireRenderCards === 'function') stcdInspireRenderCards();
    });
  }

  // 典型角色 · 生成上下文（含全部选项变量，经 contextFn 传给模板）
  function stcdInspireCharContext() {
    var g = (typeof STCD_INSPIRE_CHARGEN !== 'undefined') ? STCD_INSPIRE_CHARGEN : {};
    var ref = (g.ref || '');
    // 深化已有：无论哪条生成路径（创作台/弹窗/全局 AI 面板），只要已导入基座，
    // 就把【要深化的角色】兜底注入 ref，保证基座信息一定传给 LLM。
    if (g.mode === 'deep' && typeof window.STCD_INSPIRE_CHAR_BASE !== 'undefined' && window.STCD_INSPIRE_CHAR_BASE) {
      if (ref.indexOf('[要深化的角色]') < 0) {
        var bt = (typeof window.stcdInspireCharRefText === 'function') ? window.stcdInspireCharRefText(window.STCD_INSPIRE_CHAR_BASE) : '';
        if (bt) ref = '[要深化的角色]\n' + bt + (ref ? ('\n\n' + ref) : '');
      }
    }
    // 生成可读的「区块 → 字段」清单，给 AI 作为正常版全部字段的参考（不是元数据数组）
    var tpl = '';
    if (typeof window.stcdInspireGetFields === 'function') {
      window.stcdInspireGetFields('normal').forEach(function(b) {
        var names = b.fields.map(function(f) { return f.key + '(' + f.label + ')'; });
        tpl += b.blockLabel + '：' + names.join(' / ') + '\n';
      });
    }
    return {
      user: '',
      name: (g.name || ''),
      ref: ref,
      gender: (g.gender || '女'),
      ageTend: (g.ageTend || ''),
      styleTags: (g.styleTags || ''),
      traits: (g.traits || ''),
      template: tpl,
    };
  }

  // 典型角色 · 深化已有（走二元模板；明确任务 → 明确提示词 inspire_char_ref_deep）
  registerAiField('stcd-inspire-char-gen-deep', '典型角色·深化已有', stcdInspireCharContext, {
    suggestPrompt: 'inspire_char_ref_deep',
    fillFn: stcdInspireCharGenApply,
  });

  // 典型角色 · 多卡生成（走二元模板；明确任务 → 明确提示词 inspire_char_ref_gen：读参考激发灵感、独立再创作）
  registerAiField('stcd-inspire-char-gen-gen', '典型角色·多卡生成', stcdInspireCharContext, {
    suggestPrompt: 'inspire_char_ref_gen',
    fillFn: stcdInspireCharGenApply,
  });

  // 典型角色 · 多卡混搭（走二元模板；明确任务 → 明确提示词 inspire_char_ref_mix：融合经历特征、关公战秦琼）
  registerAiField('stcd-inspire-char-gen-mix', '典型角色·多卡混搭', stcdInspireCharContext, {
    suggestPrompt: 'inspire_char_ref_mix',
    fillFn: stcdInspireCharGenApply,
  });

  // 典型角色 · 先生成候选选项（正式生成前先出 5 个候选概要，供用户选）；fillFn 交给 UI 层展示选卡
  registerAiField('stcd-inspire-char-options', '典型角色·候选选项', stcdInspireCharContext, {
    suggestPrompt: 'inspire_char_options',
    fillFn: function(d) {
      if (typeof window.stcdInspireCharShowOptions === 'function') window.stcdInspireCharShowOptions(d);
      else if (typeof toast === 'function') toast('候选展示函数未就绪');
    },
  });
})();

// ============================================================
// 灵感角色库 · 导入世界观（只导地理+势力五入口；存本库数据）
// 数据文件：角色卡/灵感角色库/导入世界观.json
// 结构：[ { 世界名, 图标, 色, 内容: { 世界地理:[条目], 聚落:[条目], 奇境:[条目], 世俗政权:[条目], 超凡势力:[条目] } } ]
// ============================================================
var STCD_INSPIRE_IMPORT_DIR = '角色卡/灵感角色库/';
var STCD_INSPIRE_IMPORT_FILE = '角色卡/灵感角色库/导入世界观.json';
var STCD_INSPIRE_IMPORT_LIST = [];   // 已导入的世界（内存缓存）
var STCD_INSPIRE_IMPORT_LOADED = false;

// 读取已导入的世界
function stcdInspire导入世界观加载() {
  if (STCD_INSPIRE_IMPORT_LOADED) return Promise.resolve(STCD_INSPIRE_IMPORT_LIST);
  return LocalFS.readJSON(STCD_INSPIRE_IMPORT_FILE).then(function(list) {
    STCD_INSPIRE_IMPORT_LIST.length = 0;
    (list && Array.isArray(list) ? list : []).forEach(function(w) { STCD_INSPIRE_IMPORT_LIST.push(w); });
    STCD_INSPIRE_IMPORT_LOADED = true;
    return STCD_INSPIRE_IMPORT_LIST;
  }).catch(function() {
    STCD_INSPIRE_IMPORT_LIST.length = 0;
    STCD_INSPIRE_IMPORT_LOADED = true;
    return STCD_INSPIRE_IMPORT_LIST;
  });
}

// ============================================================
// 「典型场景」数据层（独立存储，与世界观/角色 items 分离）
// 场景 = 一个具体实体（长信宫/小饭庄/书院…）。进入后是一棵【以人为核心、按地位级别分层】的树：
//   - 没有「场景名根节点」；进场景后最顶层就是人。
//   - 层级从上到下地位递减（第1层地位最高），每层是若干【人】（名字+头衔）并列。
//   - 「身份/职位/分组」是人的分组标签，不是独立节点。人复用完整灵感角色（refRoleId），但本页只生成 name+title。
// 数据文件：角色卡/灵感角色库/典型场景.json
//   结构：{ scenes:[ { id,name,desc,source, levels:[ { id,name,groups:[{id,name,persons:[{id,refRoleId,name,title}]}], persons:[{id,refRoleId,name,title}] } ] } ] }
//   层级 level 可直接含 persons（无分组），也可用 groups 细分组。person.refRoleId 指向 STCD_INSPIRE.items 里的角色。
// ============================================================
var STCD_SCENE_FILE = '角色卡/灵感角色库/典型场景.json';
var STCD_SCENES = { scenes: [], loaded: false };

function stcdSceneId() { return 'sn_' + Date.now() + '_' + Math.floor(Math.random() * 10000); }
function stcdScenePerson(name, title, refRoleId) {
  return { id: stcdSceneId(), refRoleId: refRoleId || '', name: name || '未命名', title: title || '' };
}
function stcdSceneGroup(name) {
  return { id: stcdSceneId(), name: name || '分组', persons: [] };
}
function stcdSceneLevel(name, idx) {
  return { id: stcdSceneId(), name: name || ('第' + ((idx || 1)) + '层'), groups: [], persons: [] };
}
// 向 scene 加一个层对象（未保存），返回该层对象
function stcdSceneAddLevelObj(scene, name) {
  if (!scene.levels) scene.levels = [];
  var lv = stcdSceneLevel(name || '', scene.levels.length + 1);
  scene.levels.push(lv);
  return lv;
}
// 把新层【插入】到 scene.levels 的指定下标（position=0-based；越界/缺省则追加到底部），返回该层对象
function stcdSceneInsertLevelObj(scene, name, position) {
  if (!scene.levels) scene.levels = [];
  var lv = stcdSceneLevel(name || '', scene.levels.length + 1);
  var p = (typeof position === 'number' && !isNaN(position)) ? Math.max(0, Math.min(Math.floor(position), scene.levels.length)) : scene.levels.length;
  scene.levels.splice(p, 0, lv);
  return lv;
}
// 建一个场景里的人（完整基本信息：name/gender/age/identity头衔/style/family/lifeExperience/sexualDetails），挂到某层，返回 Promise<person>
// personData 形如 { identity:{name, gender, age, title(头衔), style, family, lifeExperience, sexualDetails} }
function makeScenePersonToLevel(scene, levelObj, personData) {
  personData = personData || {};
  var idt = personData.identity || {};
  var name = idt.name || '未命名';
  var title = idt.title || '';   // 头衔
  var gender = idt.gender || '女';
  STCD_INSPIRE_GEN = { desc: '', gender: gender, forceNew: true, category: '典型场景/人物' };
  return stcdInspireApplyNormal(personData, '', gender).then(function(it) {
    if (!it || !it.id) throw new Error('创建角色失败');
    var p = stcdScenePerson(name, title || '', it.id);
    if (!levelObj.persons) levelObj.persons = [];
    levelObj.persons.push(p);
    return p;
  });
}
function stcdSceneNew(sceneName, desc, org) {
  return {
    id: 'sc_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    name: sceneName || '未命名场景',
    org: org || '',        // 势力名（如 靖北王帐/铁蹄营）
    desc: desc || '',
    source: 'custom',
    createdAt: new Date().toISOString(),
    levels: [],   // 层级人列表（进场景后的树），无根节点
  };
}

// 加载典型场景（缓存）
function stcdSceneLoad() {
  if (STCD_SCENES.loaded) return Promise.resolve(STCD_SCENES.scenes);
  return LocalFS.readJSON(STCD_SCENE_FILE).then(function(d) {
    STCD_SCENES.scenes.length = 0;
    ((d && d.scenes) || []).forEach(function(s) { STCD_SCENES.scenes.push(s); });
    STCD_SCENES.loaded = true;
    return STCD_SCENES.scenes;
  }).catch(function() {
    STCD_SCENES.scenes.length = 0;
    STCD_SCENES.loaded = true;
    return STCD_SCENES.scenes;
  });
}
function stcdSceneSave() {
  return LocalFS.saveJSON(STCD_SCENE_FILE, { scenes: STCD_SCENES.scenes });
}
// 新增场景（name=地点名，desc=场景描述，org=势力名）
function stcdSceneCreate(name, desc, org) {
  return stcdSceneLoad().then(function() {
    var s = stcdSceneNew(name, desc, org);
    STCD_SCENES.scenes.push(s);
    return stcdSceneSave().then(function() { return s; });
  });
}
function stcdSceneGet(id) {
  for (var i = 0; i < STCD_SCENES.scenes.length; i++) if (STCD_SCENES.scenes[i].id === id) return STCD_SCENES.scenes[i];
  return null;
}
function stcdSceneRemove(sceneId) {
  return stcdSceneLoad().then(function() {
    var i = -1;
    for (var k = 0; k < STCD_SCENES.scenes.length; k++) if (STCD_SCENES.scenes[k].id === sceneId) { i = k; break; }
    if (i >= 0) STCD_SCENES.scenes.splice(i, 1);
    return stcdSceneSave();
  });
}
// 更新场景名/描述
function stcdSceneRename(sceneId, name, desc) {
  return stcdSceneLoad().then(function() {
    var s = stcdSceneGet(sceneId);
    if (!s) return;
    if (name !== undefined) s.name = name;
    if (desc !== undefined) s.desc = desc;
    return stcdSceneSave();
  });
}

// ---- 层级/人操作（含保存）----
// 新增一层（可选层名），返回层
function stcdSceneAddLevelSave(sceneId, name) {
  return stcdSceneLoad().then(function() {
    var s = stcdSceneGet(sceneId);
    if (!s) return null;
    if (!s.levels) s.levels = [];
    var lv = stcdSceneLevel(name, s.levels.length + 1);
    s.levels.push(lv);
    return stcdSceneSave().then(function() { return lv; });
  });
}
// 某层下加一个人（person），refRoleId 复用角色
function stcdSceneAddPersonSave(sceneId, levelIdx, personName, title, refRoleId) {
  return stcdSceneLoad().then(function() {
    var s = stcdSceneGet(sceneId);
    if (!s || !s.levels || !s.levels[levelIdx]) return null;
    var lv = s.levels[levelIdx];
    var p = stcdScenePerson(personName, title, refRoleId);
    if (!lv.persons) lv.persons = [];
    lv.persons.push(p);
    return stcdSceneSave().then(function() { return p; });
  });
}
// 某层某分组下加一个人
function stcdSceneAddGroupPersonSave(sceneId, levelIdx, groupIdx, personName, title, refRoleId) {
  return stcdSceneLoad().then(function() {
    var s = stcdSceneGet(sceneId);
    if (!s || !s.levels || !s.levels[levelIdx]) return null;
    var lv = s.levels[levelIdx];
    var g = (lv.groups || [])[groupIdx];
    if (!g) return null;
    var p = stcdScenePerson(personName, title, refRoleId);
    if (!g.persons) g.persons = [];
    g.persons.push(p);
    return stcdSceneSave().then(function() { return p; });
  });
}
function stcdSceneRemoveLevelSave(sceneId, levelIdx) {
  return stcdSceneLoad().then(function() {
    var s = stcdSceneGet(sceneId);
    if (!s || !s.levels) return false;
    s.levels.splice(levelIdx, 1);
    return stcdSceneSave().then(function() { return true; });
  });
}
function stcdSceneRemovePersonSave(sceneId, levelIdx, personIdx, inGroup) {
  return stcdSceneLoad().then(function() {
    var s = stcdSceneGet(sceneId);
    if (!s || !s.levels || !s.levels[levelIdx]) return false;
    var lv = s.levels[levelIdx];
    if (inGroup && lv.groups) {
      var g = lv.groups[inGroup];
      if (g && g.persons) g.persons.splice(personIdx, 1);
    } else if (lv.persons) {
      lv.persons.splice(personIdx, 1);
    }
    return stcdSceneSave().then(function() { return true; });
  });
}

// 从世界观导入一个场景（旧接口兼容：自动转成 levels 模型，初始为空）
function stcdSceneImportFromWorld(世界名, 入口, 条目名, 详细描述) {
  return stcdSceneLoad().then(function() {
    var s = stcdSceneNew(条目名, 详细描述);
    s.source = 'imported';
    s.from = { 世界名: 世界名, 入口: 入口 };
    STCD_SCENES.scenes.push(s);
    return stcdSceneSave().then(function() { return s; });
  });
}

window.stcdScenes = STCD_SCENES;
window.stcdSceneLoad = stcdSceneLoad;
window.stcdSceneSave = stcdSceneSave;
window.stcdSceneCreate = stcdSceneCreate;
window.stcdSceneGet = stcdSceneGet;
window.stcdSceneRemove = stcdSceneRemove;
window.stcdSceneRename = stcdSceneRename;
window.stcdSceneAddLevelSave = stcdSceneAddLevelSave;
window.stcdSceneAddPersonSave = stcdSceneAddPersonSave;
window.stcdSceneAddGroupPersonSave = stcdSceneAddGroupPersonSave;
window.stcdSceneRemoveLevelSave = stcdSceneRemoveLevelSave;
window.stcdSceneRemovePersonSave = stcdSceneRemovePersonSave;
window.stcdSceneImportFromWorld = stcdSceneImportFromWorld;
window.stcdScenePerson = stcdScenePerson;

// 保存已导入的世界（原位更新数组，保持 window.STCD_INSPIRE_IMPORT_LIST 引用稳定）
function stcdInspire导入世界观保存(list) {
  if (list && list !== STCD_INSPIRE_IMPORT_LIST) {
    STCD_INSPIRE_IMPORT_LIST.length = 0;
    list.forEach(function(w) { STCD_INSPIRE_IMPORT_LIST.push(w); });
  }
  return LocalFS.saveJSON(STCD_INSPIRE_IMPORT_FILE, STCD_INSPIRE_IMPORT_LIST);
}

// 从世界观模块读取世界列表（含描述，供导入弹窗选择）
function stcdInspire可取世界列表() {
  if (typeof Store === 'undefined' || !Store.world || typeof Store.world.list !== 'function') return Promise.resolve([]);
  return Store.world.list().then(function(list) {
    return (list || []).map(function(w) {
      return { 世界名: w.title || '未命名', 简介: w.description || '' };
    });
  }).catch(function() { return []; });
}

// 从世界观模块导入一个世界（拉地理三入口 + 势力全部类别，复制进本库数据）
function stcdInspire导入世界观(世界名) {
  if (typeof Store === 'undefined' || !Store.world || typeof Store.world.loadContent !== 'function') return Promise.reject(new Error('世界观模块未就绪'));
  return Store.world.loadContent(世界名).then(function(content) {
    content = content || {};
    // 地理：固定三入口
    var 内容 = {
      世界地理: (content.地理 && content.地理['世界地理']) || [],
      聚落: []
        .concat((content.地理 && content.地理['聚落']) || [])
        .concat((content.地理 && content.地理['大城名宗']) || [])
        .concat((content.地理 && content.地理['乡镇村落']) || []),
      奇境: (content.地理 && content.地理['奇境']) || [],
    };
    // 势力：同步全部势力类别（世界观 schema 里的 8 类；content 里有的取条目，没有的预置空数组）
    var 势力 = content.势力 || {};
    var 势力类别 = ['世俗政权','超凡势力','地下黑道','邪教淫祠','宗教神权','情色行业结社','军武集团','民间宗族'];
    势力类别.forEach(function(k) {
      内容[k] = (势力 && 势力[k]) || [];
    });
    // 其余板块全量写入（内容较少、作为完整背景）：世界设定/种族/文化/时间线
    var 设定 = content.世界设定 || {};
    ['宇宙与法则','力量体系','情色生态','剧情种子'].forEach(function(k) { 内容[k] = (设定 && 设定[k]) || []; });
    var 种族 = content.种族 || {};
    ['种族与文明','性征与繁衍'].forEach(function(k) { 内容[k] = (种族 && 种族[k]) || []; });
    var 文化 = content.文化 || {};
    ['文化与习俗','哲学与信仰'].forEach(function(k) { 内容[k] = (文化 && 文化[k]) || []; });
    var 时间线 = content.时间线 || {};
    ['历史年表'].forEach(function(k) { 内容[k] = (时间线 && 时间线[k]) || []; });
    return stcdInspire导入世界观加载().then(function(list) {
      // 若已导入同名，覆盖
      var idx = -1;
      for (var i = 0; i < list.length; i++) if (list[i].世界名 === 世界名) { idx = i; break; }
      var entry = { 世界名: 世界名, icon: '🌍', color: 'var(--accent2)', 内容: 内容 };
      if (idx >= 0) list[idx] = entry; else list.push(entry);
      return stcdInspire导入世界观保存(list).then(function() { return entry; });
    });
  });
}

// 删除已导入的世界
function stcdInspire删除导入世界观(世界名) {
  return stcdInspire导入世界观加载().then(function(list) {
    var kept = list.filter(function(w) { return w.世界名 !== 世界名; });
    return stcdInspire导入世界观保存(kept);
  });
}

window.stcdInspire导入世界观加载 = stcdInspire导入世界观加载;
window.stcdInspire导入世界观保存 = stcdInspire导入世界观保存;
window.stcdInspire可取世界列表 = stcdInspire可取世界列表;
window.stcdInspire导入世界观 = stcdInspire导入世界观;
window.stcdInspire删除导入世界观 = stcdInspire删除导入世界观;
window.STCD_INSPIRE_IMPORT_LIST = STCD_INSPIRE_IMPORT_LIST;
})();
