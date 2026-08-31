// 生图词典 · 数据层（词库 / 收藏 / 保存的提示词 / 云端禁用词）
// 存储：内置只读 renderer/数据库/生图词典/词条.json
//       用户数据 保存/生图词典/{词典,保存的提示词,云端禁用词}.json

var STCD_DICT = window.STCD_DICT || {
  builtin: [], user: [], favIds: {}, loaded: false,
  filter: '全部', subfilter: '', search: '', selected: {},
  viewItem: null, editMode: false, renderedCount: 0,
  savedPrompts: [], savedPromptsLoaded: false,
  banned: null,
  section: 'nsfw',           // 分区：normal / nsfw / lora，默认色情
};
// 两级分类结构：大类 → 子类（正常区三级分类）
var STCD_DICT_CATS = [
  { name: '人物', subs: ['少女系', '御姐系', '职业', '幻想种族', '关系'] },
  { name: '身体', subs: ['胸部', '臀部', '腿足', '躯干', '面部', '肌肤', '其他'] },
  { name: '服装', subs: ['内衣', '丝袜配饰', '制服', '传统服饰', '裙装', '休闲', '风格服饰'] },
  { name: '场景', subs: ['私密', '校园', '都市', '交通住宿', '娱乐', '自然'] },
  { name: '光线', subs: ['自然光', '人造光', '光效'] },
  { name: '风格', subs: ['绘画', '流派', '地域', '摄影媒介'] },
  { name: '画质', subs: ['质量', '镜头', '构图'] },
  { name: '负面', subs: ['画质问题', '解剖错误', '干扰物'] },
];
// 色情区分类结构（12 大类）
var STCD_DICT_NSFW_CATS = [
  { name: '身体', subs: ['胸部', '臀部', '腿足', '腰腹', '口部', '腋部', '全身状态'] },
  { name: '性行为', subs: ['口交', '阴道交', '肛交', '手淫', '特殊交', '多人', '事后状态'] },
  { name: '体位', subs: ['正面位', '后入位', '骑乘位', '站立位', '特殊位'] },
  { name: '体液', subs: ['精液', '爱液', '潮吹', '其他'] },
  { name: '情趣道具', subs: ['插入类', '束缚类', '施虐类', '辅助类'] },
  { name: '情趣服装', subs: ['内衣', '丝袜', '暴露服', '泳装', '制服', '配饰'] },
  { name: '表情动作', subs: ['高潮表情', '情欲表情', '脱衣动作', '抚摸动作', '展示动作', '亲吻动作'] },
  { name: '性场景', subs: ['私密空间', '公共空间', '半公共', '特殊空间'] },
  { name: '关系角色', subs: ['年龄属性', '职业属性', '亲属关系', '权力关系', '特殊属性'] },
  { name: '性器官', subs: ['女阴', '男根', '肛门'] },
  { name: '题材', subs: ['强制', '洗脑控制', '露出偷窥', '触手异种', '堕落', '排泄', '暴力折磨', '血腥猎奇', '兽交'] },
];
// LoRA 区分类结构（一级 = CSV 来源表一级分类去 Lora 前缀；二级 = 词条名第一段，单段归「其他」）
var STCD_DICT_LORA_CATS = [
  { name: '人物', subs: ['1999', '2077', '3D', 'FATE', '三国杀', '中华小子', '主播', '人物', '伪娘', '你的名字', '僵尸娘', '凡人修仙传', '刺客信条', '剑来', '剑风传奇', '南号尚风', '只狼', '围棋少年', '多娜多娜', '夜环', '失落之剑', '奇幻生物', '女巫审判', '对魔忍', '尼尔', '师兄啊师兄', '影之诗', '战锤', '斗破', '斗罗', '无双', '无期迷途', '明日方舟', '星期三', '星游记', '月见草', '村上水军', '极品家丁', '氷菓', '法环', '活侠传', '牧神记', '王者荣耀', '画江湖', '白蛇', '眷思量', '石头门', '神兵小将', '神墓', '秦时明月', '第五人格', '芙莉莲', '萧容鱼', '蔚蓝档案', '诡秘之主', '道诡异仙', '遮天', '金牌得主', '雀魂', '魔女', '魔界战记', '魔童降世', '鸣潮', '黑暗之魂', '黑神话', '龙之信条', '龙之谷', '其他'] },
  { name: '姿势', subs: ['NTR', 'QQS', '乳', '人外', '做爱', '口', '尿', '打', '特殊', '精液', '自慰', '视角', '贞操锁', '足', '蹲', '重口', '其他'] },
  { name: '展示', subs: ['买避孕套', '口', '拉成猪鼻', '本子', '比心', '芭蕾拉伸', '其他'] },
  { name: '姿势-调教', subs: ['壁尻', '机械', '束缚', '其他'] },
  { name: '杂项', subs: ['人设图', '分镜', '场景', '概念强化', '滤镜'] },
  { name: '辅助', subs: ['X图', '变化', '服饰', '皮肤', '纹身', '表情', '贞操锁', '辅助', '道具', '重口'] },
  { name: '形态', subs: ['寄生虫序列', '屌头', '淑女壶', '其他'] },
  { name: '风格', subs: ['1equals2大佬', 'Akabur大佬', 'Brookskim大佬', 'Diathorn大佬', 'Mosouko大佬', 'PAPERMANIA大佬', 'SOS大佬', 'Terasu MC大佬', 'as109大佬', 'ikelag大佬', 'neisan大佬', 'wlop大佬', '╉ヅ20┷┇g┫大佬', 'ポッシ the Posse大佬', '单色手绘', '南号尚风大佬', '影大佬', '斋藤亮辅大佬', '村上水军大佬', '浮世绘', '连环画', '阿戈魔大佬', '高松和樹大佬', '其他'] },
  { name: '表情与状态', subs: ['其他'] },
  { name: '道具', subs: ['其他'] },
  { name: '体型与部位', subs: ['其他'] },
  { name: '姿势-批量生成', subs: ['一般', '群交'] },
  { name: '正经', subs: ['类型', '风格', '其他'] },
  { name: '视频', subs: ['其他'] },
];
var STCD_DICT_PATHS = {
  builtinSfw: '生图词典/sfw.json',
  builtinNsfw: '生图词典/nsfw.json',
  builtinLora: '生图词典/lora.json',
  userSfw: '生图词典/词典-sfw.json',
  userNsfw: '生图词典/词典-nsfw.json',
  userLora: '生图词典/词典-lora.json',
  savedPrompts: '生图词典/保存的提示词.json',
  banned: '生图词典/云端禁用词.json',
};

// ===== 合并加载（内置只读 + 用户可写，按分区）=====
function stcdDictLoad() {
  if (STCD_DICT.loaded) return Promise.resolve(STCD_DICT);
  var section = STCD_DICT.section;
  var builtinPath = null;
  var userPath = STCD_DICT_PATHS.userSfw;
  if (section === 'nsfw') { builtinPath = STCD_DICT_PATHS.builtinNsfw; userPath = STCD_DICT_PATHS.userNsfw; }
  else if (section === 'lora') { builtinPath = STCD_DICT_PATHS.builtinLora; userPath = STCD_DICT_PATHS.userLora; }
  else { builtinPath = STCD_DICT_PATHS.builtinSfw; }
  var reads = [LocalFS.readJSON(userPath)];
  if (builtinPath) reads.unshift(LocalFS.dbReadJSON(builtinPath));
  return Promise.all(reads).then(function(res) {
    var builtin = [];
    var userData = {};
    if (builtinPath) {
      builtin = (res[0] && res[0].items) || [];
      userData = res[1] || {};
    } else {
      userData = res[0] || {};
    }
    STCD_DICT.builtin = builtin.map(function(it, i) {
      return { id: 'b_' + i, source: '内置', createdAt: '', zh: it.zh || '', tag: it.tag || '', cat: it.cat || '场景', subcat: it.subcat || '', zone: it.zone || 'SFW' };
    });
    STCD_DICT.user = (userData.items || []).map(function(it, i) {
      return { id: it.id || ('u_' + Date.now() + '_' + i), source: '用户', createdAt: it.createdAt || '', zh: it.zh || '', tag: it.tag || '', cat: it.cat || '场景', subcat: it.subcat || '', zone: it.zone || 'SFW' };
    });
    STCD_DICT.favIds = userData.favIds || {};
    STCD_DICT.loaded = true;
    return STCD_DICT;
  }).catch(function() {
    STCD_DICT.builtin = STCD_DICT.builtin || [];
    STCD_DICT.user = STCD_DICT.user || [];
    STCD_DICT.favIds = STCD_DICT.favIds || {};
    STCD_DICT.loaded = true;
    if (typeof toast === 'function') toast('词库加载部分失败');
    return STCD_DICT;
  });
}

// 切换分区时重置加载状态（不同分区读取不同文件）
function stcdDictReload() {
  STCD_DICT.loaded = false;
  STCD_DICT.builtin = [];
  STCD_DICT.user = [];
  STCD_DICT.favIds = {};
  return stcdDictLoad();
}

// ===== 全量（内置在前）=====
function stcdDictAll() {
  return STCD_DICT.builtin.concat(STCD_DICT.user);
}

// 按分区过滤词条：normal → SFW；nsfw → NSFW
function stcdDictSectionItems(section) {
  var all = stcdDictAll();
  if (section === 'nsfw') return all.filter(function(x) { return x.zone === 'NSFW'; });
  return all.filter(function(x) { return x.zone !== 'NSFW'; });
}

function stcdDictFind(id) {
  return stcdDictAll().filter(function(x) { return x.id === id; })[0] || null;
}

// ===== 写回用户词典（按当前分区）=====
function stcdDictSave() {
  var userPath = STCD_DICT_PATHS.userSfw;
  if (STCD_DICT.section === 'nsfw') userPath = STCD_DICT_PATHS.userNsfw;
  else if (STCD_DICT.section === 'lora') userPath = STCD_DICT_PATHS.userLora;
  return LocalFS.saveJSON(userPath, { items: STCD_DICT.user, favIds: STCD_DICT.favIds })
    .then(function() { return true; })
    .catch(function() { if (typeof toast === 'function') toast('词典保存失败'); return false; });
}

// ===== 收藏切换 =====
function stcdDictToggleFav(id) {
  if (STCD_DICT.favIds[id]) delete STCD_DICT.favIds[id];
  else STCD_DICT.favIds[id] = true;
  return stcdDictSave();
}

// ===== 新增 / 更新 / 删除 =====
function stcdDictAdd(item) {
  var it = {
    id: 'u_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    zh: item.zh || '', tag: item.tag || '', cat: item.cat || '场景',
    subcat: item.subcat || '', zone: item.zone || 'SFW', source: '用户', createdAt: new Date().toISOString(),
  };
  if (item.fav) STCD_DICT.favIds[it.id] = true;
  STCD_DICT.user.push(it);
  return stcdDictSave().then(function() { return it; });
}

function stcdDictUpdate(id, patch) {
  var it = stcdDictFind(id);
  if (!it) return Promise.resolve(false);
  if (patch.zh !== undefined) it.zh = patch.zh;
  if (patch.tag !== undefined) it.tag = patch.tag;
  if (patch.cat !== undefined) it.cat = patch.cat;
  if (patch.subcat !== undefined) it.subcat = patch.subcat;
  if (patch.zone !== undefined) it.zone = patch.zone;
  if (patch.fav !== undefined) {
    if (patch.fav) STCD_DICT.favIds[id] = true;
    else delete STCD_DICT.favIds[id];
  }
  return stcdDictSave();
}

function stcdDictDelete(id) {
  var it = stcdDictFind(id);
  if (!it || it.source !== '用户') return Promise.resolve(false);
  STCD_DICT.user = STCD_DICT.user.filter(function(x) { return x.id !== id; });
  delete STCD_DICT.favIds[id];
  delete STCD_DICT.selected[id];
  return stcdDictSave();
}

// ===== 云端禁用词（文件存储：命名预设集合 + 生效模式；默认预设/自定义为固定槽）=====
function stcdBannedDraft() {
  return { words: '', note: '' };
}

function stcdLoadBanned() {
  if (STCD_DICT.banned) return Promise.resolve(STCD_DICT.banned);
  var fresh = {
    presets: {
      '默认预设': stcdBannedDraft(),
      '自定义': stcdBannedDraft(),
    },
    active: '默认预设',
  };
  return LocalFS.readJSON(STCD_DICT_PATHS.banned).then(function(d) {
    STCD_DICT.banned = (d && d.presets) ? d : fresh;
    // 固定槽位兜底（文件缺失/损坏时）
    if (!STCD_DICT.banned.presets['默认预设']) STCD_DICT.banned.presets['默认预设'] = stcdBannedDraft();
    if (!STCD_DICT.banned.presets['自定义']) STCD_DICT.banned.presets['自定义'] = stcdBannedDraft();
    if (!STCD_DICT.banned.active || !STCD_DICT.banned.presets[STCD_DICT.banned.active]) STCD_DICT.banned.active = '默认预设';
    return STCD_DICT.banned;
  }).catch(function() {
    STCD_DICT.banned = fresh;
    return STCD_DICT.banned;
  });
}

function stcdSaveBannedFile() {
  return LocalFS.saveJSON(STCD_DICT_PATHS.banned, STCD_DICT.banned)
    .catch(function() { if (typeof toast === 'function') toast('禁用词保存失败'); });
}

// 当前生效预设对象（{words, note}）；预设不存在则返回空
function stcdCurrentBannedPreset() {
  if (STCD_DICT && STCD_DICT.banned && STCD_DICT.banned.presets) {
    var p = STCD_DICT.banned.presets[STCD_DICT.banned.active];
    if (p) return p;
  }
  return { words: '', note: '' };
}

// ===== 保存的提示词（生图时收藏的整条）=====
function stcdLoadSavedPrompts() {
  if (STCD_DICT.savedPromptsLoaded) return Promise.resolve(STCD_DICT.savedPrompts);
  return LocalFS.readJSON(STCD_DICT_PATHS.savedPrompts).then(function(d) {
    STCD_DICT.savedPrompts = Array.isArray(d) ? d : [];
    STCD_DICT.savedPromptsLoaded = true;
    return STCD_DICT.savedPrompts;
  }).catch(function() {
    STCD_DICT.savedPrompts = [];
    STCD_DICT.savedPromptsLoaded = true;
    return STCD_DICT.savedPrompts;
  });
}

function stcdSaveSavedPrompts() {
  return LocalFS.saveJSON(STCD_DICT_PATHS.savedPrompts, STCD_DICT.savedPrompts)
    .catch(function() { if (typeof toast === 'function') toast('提示词保存失败'); });
}

// ===== 全局收藏入口（三个生成 tab 调用）=====
function stcdAddToDict(tag, defaultZh, catHint) {
  if (!tag || !tag.trim()) { toast('没有可收藏的提示词'); return; }
  var defSection = (STCD_DICT.section === 'nsfw') ? 'nsfw' : 'normal';
  var h = '<div class="mcard" style="max-width:420px">';
  h += '<h3 style="font-size:0.95em;margin-bottom:10px">⭐ 收藏入词库</h3>';
  h += '<div style="margin-bottom:8px"><label style="font-size:0.8em;color:var(--fg2);display:block;margin-bottom:3px">中文名</label>';
  h += '<input id="stcd-add-zh" class="llm-input" style="width:100%" value="' + escHtml(defaultZh || '') + '"></div>';
  h += '<div style="display:flex;gap:8px;margin-bottom:10px">';
  h += '<div style="flex:1"><label style="font-size:0.8em;color:var(--fg2);display:block;margin-bottom:3px">分区</label>';
  h += '<select id="stcd-add-zone" class="llm-input llm-select" style="width:100%">';
  h += '<option value="SFW"' + (defSection === 'normal' ? ' selected' : '') + '>🌿 正常 SFW</option>';
  h += '<option value="NSFW"' + (defSection === 'nsfw' ? ' selected' : '') + '>🔞 色情 NSFW</option>';
  h += '</select></div>';
  h += '<div style="flex:1"><label style="font-size:0.8em;color:var(--fg2);display:block;margin-bottom:3px">分类</label>';
  h += '<select id="stcd-add-cat" class="llm-input llm-select" style="width:100%">';
  var addCats = (STCD_DICT.section === 'nsfw' && typeof STCD_DICT_NSFW_CATS !== 'undefined') ? STCD_DICT_NSFW_CATS : STCD_DICT_CATS;
  addCats.forEach(function(c) {
    h += '<option value="' + c.name + '"' + (c.name === (catHint || '场景') ? ' selected' : '') + '>' + c.name + '</option>';
  });
  h += '</select></div>';
  h += '</div>';
  h += '<div style="font-size:0.75em;color:var(--fg3);margin-bottom:10px;word-break:break-all">' + escHtml(tag.slice(0, 120)) + (tag.length > 120 ? '…' : '') + '</div>';
  h += '<div style="display:flex;gap:8px;justify-content:flex-end">';
  h += '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>';
  h += '<button class="btn-main" id="stcd-add-btn">💾 收藏</button>';
  h += '</div></div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  document.getElementById('stcd-add-btn').onclick = function() {
    var zh = (document.getElementById('stcd-add-zh').value || '').trim() || '未命名词条';
    var cat = document.getElementById('stcd-add-cat').value;
    var zone = document.getElementById('stcd-add-zone').value;
    stcdDictAdd({ zh: zh, tag: tag.trim(), cat: cat, fav: true, zone: zone }).then(function() {
      // 同时入「保存的提示词」历史
      stcdLoadSavedPrompts().then(function() {
        STCD_DICT.savedPrompts.unshift({
          id: 's_' + Date.now(), zh: zh, tag: tag.trim(), cat: cat, zone: zone,
          createdAt: new Date().toISOString(),
        });
        stcdSaveSavedPrompts();
      });
      ov.remove();
      toast('已收藏入词库');
    });
  };
}

window.STCD_DICT = STCD_DICT;
window.STCD_DICT_CATS = STCD_DICT_CATS;
window.STCD_DICT_NSFW_CATS = STCD_DICT_NSFW_CATS;
window.STCD_DICT_LORA_CATS = STCD_DICT_LORA_CATS;

// ===== 词条图片（按中文名 zh 命名，存 保存/生图词典/词典/{zh}.jpg）=====
var STCD_DICT_IMG_DIR = '生图词典/词典/';
// 图片缓存：{zh: dataUrl}（null 也缓存负面结果）
var STCD_DICT_IMG_CACHE = {};
// 目录索引：文件名字典（消除每次 exists IPC）
var STCD_DICT_IMG_INDEX = null;

// 构建图片目录索引（一次列出所有文件名）
function stcdDictImgBuildIndex() {
  if (STCD_DICT_IMG_INDEX) return Promise.resolve(STCD_DICT_IMG_INDEX);
  return LocalFS.list(STCD_DICT_IMG_DIR).then(function(files) {
    var idx = {};
    (files || []).forEach(function(f) {
      // list 返回 [{name, isDir, ...}] 对象数组
      var name = String(f && f.name !== undefined ? f.name : f).replace(/\.\w+$/, '');
      idx[name] = true;
    });
    STCD_DICT_IMG_INDEX = idx;
    return idx;
  }).catch(function() { STCD_DICT_IMG_INDEX = {}; return STCD_DICT_IMG_INDEX; });
}

// 词条图片文件路径（按中文名 sanitize 后命名）
function stcdDictImgPath(zh) {
  return STCD_DICT_IMG_DIR + LocalFS.sanitize(zh || '未命名') + '.jpg';
}

// 缩略图路径（磁盘持久，首次生成后复用）
function stcdDictThumbPath(zh) {
  return STCD_DICT_IMG_DIR + 'thumbs/' + LocalFS.sanitize(zh || '未命名') + '.jpg';
}

// 读取词条图片（内存缓存 → 磁盘缩略图 → 原图；缩略图 IPC 不可用时直接读原图保证显示）
function stcdDictImg(zh) {
  if (!zh) return Promise.resolve(null);
  if (STCD_DICT_IMG_CACHE[zh] !== undefined) return Promise.resolve(STCD_DICT_IMG_CACHE[zh]);
  return stcdDictImgBuildIndex().then(function(idx) {
    var name = LocalFS.sanitize(zh);
    if (!idx[name]) { STCD_DICT_IMG_CACHE[zh] = null; return null; }  // 索引无此图，写负面缓存
    // 1. 优先读磁盘缩略图（快：~20KB）
    return LocalFS.exists(stcdDictThumbPath(zh)).then(function(thumbEx) {
      if (thumbEx) {
        return LocalFS.readBase64(stcdDictThumbPath(zh)).then(function(b64) {
          if (!b64) return stcdDictImgReadOrig(zh);
          STCD_DICT_IMG_CACHE[zh] = 'data:image/jpeg;base64,' + b64;
          return STCD_DICT_IMG_CACHE[zh];
        }).catch(function() { return stcdDictImgReadOrig(zh); });
      }
      return stcdDictImgFromOrig(zh);
    }).catch(function() { return stcdDictImgReadOrig(zh); });
  }).catch(function() { return null; });
}

// 直接读原图 base64（最稳的回退，一定能显示）
function stcdDictImgReadOrig(zh) {
  return LocalFS.readBase64(stcdDictImgPath(zh)).then(function(b64) {
    if (!b64) { STCD_DICT_IMG_CACHE[zh] = null; return null; }
    STCD_DICT_IMG_CACHE[zh] = 'data:image/jpeg;base64,' + b64;
    return STCD_DICT_IMG_CACHE[zh];
  }).catch(function() { return null; });
}

// 读原图 → 生成缩略图写盘 → 返回缩略图 dataUrl
function stcdDictImgFromOrig(zh) {
  return LocalFS.exists(stcdDictImgPath(zh)).then(function(ex) {
    if (!ex) { STCD_DICT_IMG_CACHE[zh] = null; return null; }
    // 用主进程缩略图 IPC（nativeImage resize 150px，~20KB），不传原图回渲染层
    if (typeof window.narrative !== 'undefined' && window.narrative.fileThumbnail) {
      return window.narrative.fileThumbnail(stcdDictImgPath(zh), 150).then(function(tb64) {
        if (!tb64) {
          return stcdDictImgReadOrig(zh);
        }
        var dataUrl = 'data:image/jpeg;base64,' + tb64;
        STCD_DICT_IMG_CACHE[zh] = dataUrl;
        // 缩略图写盘（磁盘持久，下次直接读）
        LocalFS.saveBinary(stcdDictThumbPath(zh), tb64).catch(function() {});
        return dataUrl;
      }).catch(function() { return stcdDictImgReadOrig(zh); });
    }
    return stcdDictImgReadOrig(zh);
  }).catch(function() { return stcdDictImgReadOrig(zh); });
}

// 读取原图（详情/预览大图用；缩略图单独走 stcdDictImg）
function stcdDictOrigImg(zh) {
  if (!zh) return Promise.resolve(null);
  return LocalFS.exists(stcdDictImgPath(zh)).then(function(ex) {
    if (!ex) return null;
    return LocalFS.readBase64(stcdDictImgPath(zh)).then(function(b64) {
      if (!b64) return null;
      return 'data:image/jpeg;base64,' + b64;
    }).catch(function() { return null; });
  }).catch(function() { return null; });
}

// 上传词条图片（dataUrl → 纯 base64 存盘，更新缓存；清旧缩略图保证换图生效）
function stcdDictUploadImg(zh, dataUrl) {
  if (!zh) return Promise.resolve(false);
  var b64 = String(dataUrl || '').replace(/^data:image\/[^;]+;base64,/, '');
  if (!b64) return Promise.resolve(false);
  return LocalFS.saveBinary(stcdDictImgPath(zh), b64)
    .then(function(res) {
      if (!res || !res.ok) return false;
      // 换图后清缓存和旧缩略图，下次读取时走缩略图管线生成新缩略图
      delete STCD_DICT_IMG_CACHE[zh];
      LocalFS.delete(stcdDictThumbPath(zh)).catch(function() {});
      return true;
    })
    .catch(function() { return false; });
}

// 删除词条图片（删磁盘文件 + 清缓存 + 清缩略图）
function stcdDictDeleteImg(zh) {
  if (!zh) return Promise.resolve(false);
  return LocalFS.delete(stcdDictImgPath(zh))
    .then(function() {
      delete STCD_DICT_IMG_CACHE[zh];
      LocalFS.delete(stcdDictThumbPath(zh)).catch(function() {});
      return true;
    })
    .catch(function() { return false; });
}

window.stcdDictImg = stcdDictImg;
window.stcdDictOrigImg = stcdDictOrigImg;
window.stcdDictUploadImg = stcdDictUploadImg;
window.stcdDictDeleteImg = stcdDictDeleteImg;
window.stcdDictLoad = stcdDictLoad;
window.stcdDictReload = stcdDictReload;
window.stcdDictAll = stcdDictAll;
window.stcdDictFind = stcdDictFind;
window.stcdDictSave = stcdDictSave;
window.stcdDictToggleFav = stcdDictToggleFav;
window.stcdDictAdd = stcdDictAdd;
window.stcdDictUpdate = stcdDictUpdate;
window.stcdDictDelete = stcdDictDelete;
window.stcdLoadBanned = stcdLoadBanned;
window.stcdSaveBannedFile = stcdSaveBannedFile;
window.stcdCurrentBannedPreset = stcdCurrentBannedPreset;
window.stcdBannedDraft = stcdBannedDraft;
window.stcdLoadSavedPrompts = stcdLoadSavedPrompts;
window.stcdSaveSavedPrompts = stcdSaveSavedPrompts;
window.stcdAddToDict = stcdAddToDict;
window.stcdDictSectionItems = stcdDictSectionItems;
