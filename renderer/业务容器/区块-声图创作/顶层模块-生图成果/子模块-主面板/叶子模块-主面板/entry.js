// 深度-叙事引擎 · 生图成果
// 按角色卡组织的生图成果库：每个角色对应多个大类（正常服装/色情服装/正常事件/色情事件/概念图），
// 每个大类下可自定义多个小类（自定义名称），每个小类下可自定义多个版本（如插画版/真人版/其他版本），
// 每个版本一个图位（上传/查看/删除）。数据来源与「角色卡」和「灵感角色库」并行。
//
// 存储结构（saves 目录）：
//   生图成果/.index.json                          → { entries: { key: { name, source, dir, updatedAt } } }
//   生图成果/{角色卡|灵感角色}/{dir}/成果.json        → { key, name, source, cover, cats: { 大类key: [ { name, versions: [ { name, file } ] } ] } }
//   生图成果/{角色卡|灵感角色}/{dir}/*.{ext}         → 图片文件（base64 写盘）
// 兼容旧格式：slots: { 类别key: { standard, realistic } } 会自动迁移为 cats 下的一个「默认」小类（插画版/真人化两个版本）。

// ===== 常量 =====
var STCD_RESULT_DIR = '生图成果/';
var STCD_RESULT_SOURCES = { card: '角色卡', inspire: '灵感角色' };
// 大类与「生图词典 · 本地提示词」的类别一致（同 key、同顺序、同叫法）：
//   服装：正常/色情/堕落；形态：淑女壶/虫化/家具化/武器化/动物化；事件：正常/色情/堕落/调教/恐虐/色孽/纳垢/奸奇
var STCD_RESULT_CATS = [
  { key: 'charNormal',   label: '👗 正常服装' },
  { key: 'charErotic',   label: '🔥 色情服装' },
  { key: 'charTraining', label: '🖤 堕落服装' },
  { key: 'formVase',     label: '🏺 淑女壶' },
  { key: 'formBug',      label: '🪲 虫化' },
  { key: 'formFurniture', label: '🛋 家具化' },
  { key: 'formWeapon',   label: '⚔️ 武器化' },
  { key: 'formAnimal',   label: '🐾 动物化' },
  { key: 'eventNormal',  label: '🏙 正常事件' },
  { key: 'eventErotic',  label: '🌙 色情事件' },
  { key: 'eventFallen',  label: '💀 堕落事件' },
  { key: 'eventTraining', label: '⛓ 调教事件' },
  { key: 'eventKhorne',  label: '🩸 恐虐事件' },
  { key: 'eventSlaanesh', label: '💜 色孽事件' },
  { key: 'eventNurgle',  label: '🤢 纳垢事件' },
  { key: 'eventTzeentch', label: '⚙️ 奸奇事件' },
];
// 旧大类 key → 新 key 迁移映射（slots/旧 cats 格式）；concept 旧数据不再展示
var STCD_RESULT_CAT_LEGACY = {
  'normal-clothes': 'charNormal',
  'erotic-clothes': 'charErotic',
  'normal-scene': 'eventNormal',
  'erotic-scene': 'eventErotic',
  'concept': 'concept',
};
// 正常服装基础槽：一般/站立/色情；其余大类基础槽：动漫版/真人版（动漫在前）
// 每个版本槽可再挂「变体」（variants 子列表，如真人版等特殊版本），见 生果新建变体
function 生果默认版本槽(catKey) {
  if (catKey === 'charNormal') {
    return [ { name: '一般', file: null }, { name: '站立', file: null }, { name: '色情', file: null } ];
  }
  return [ { name: '动漫版', file: null }, { name: '真人版', file: null } ];
}

// ===== 状态 =====
var STCD_RESULT = { source: 'card', view: 'list', detailKey: null, entries: {}, cards: [], inspires: [], _nameCb: null, gender: 'female', inspSubScope: 'world', inspSceneId: null, inspWorldPath: [] };
// 性别 tab（与角色库一致：女性/男性/伪娘/扶她，SVG 图标同款）
var STCD_RESULT_GENDERS = [
  { key: 'female', label: '女性', icon: '<svg class="gender-svg" viewBox="0 0 20 20" width="18" height="18"><circle cx="10" cy="6.5" r="3.8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 10.3v5.5M7.5 14h5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
  { key: 'male', label: '男性', icon: '<svg class="gender-svg" viewBox="0 0 20 20" width="18" height="18"><circle cx="9" cy="9" r="3.8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 12l5-5M14.5 7h3V10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
  { key: 'femboy', label: '伪娘', icon: '<svg class="gender-svg" viewBox="0 0 20 20" width="18" height="18"><path d="M10 15.5c-2.5-2-5-3.8-5-6C5 7 7 5.5 10 7.5c3-2 5-0.5 5 2.5s-2.5 3.5-5 5.5z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M10 7.5v3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>' },
  { key: 'futa', label: '扶她', icon: '<svg class="gender-svg" viewBox="0 0 20 20" width="18" height="18"><circle cx="6.5" cy="6" r="3" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M6.5 9v5M4.5 12.5h4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="13.5" cy="6" r="3" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M13 9l3 3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>' },
];

// 角色性别判定：正式卡 basicInfo.gender（女性/男性/扶她/伪娘）；灵感卡 versions.*.identity.gender（女/男/扶她/伪娘）
function 生果角色性别(it, source) {
  if (!it) return 'female';
  if (source === 'card') {
    var g = (it.identity && it.identity.basicInfo && it.identity.basicInfo.gender) || '';
    if (g === '男性') return 'male';
    if (g === '扶她') return 'futa';
    if (g === '伪娘') return 'femboy';
    return 'female';
  }
  // 灵感卡：normal → cool → deep 任一版本的 identity.gender
  var order = ['normal', 'cool', 'deep'];
  if (it.versions) {
    for (var i = 0; i < order.length; i++) {
      var v = it.versions[order[i]];
      if (v && v.identity && v.identity.gender) {
        var g2 = v.identity.gender;
        if (g2 === '男') return 'male';
        if (g2 === '扶她') return 'futa';
        if (g2 === '伪娘') return 'femboy';
        return 'female';
      }
    }
  }
  if (it.gender === '男') return 'male';
  if (it.gender === '扶她') return 'futa';
  if (it.gender === '伪娘') return 'femboy';
  return 'female';
}

// 取角色数据的「第一页」图 = 书目录后的第一个版本槽（大类顺序：正常服装最先 → 小类 → 类别组 → 版本[动漫版在前]）
// 即读者翻开书看到的第一张图，作为默认封面/缩略图
function 生果第一张图(d) {
  if (!d || !d.cats) return null;
  var found = null;
  STCD_RESULT_CATS.forEach(function(c) {
    if (found) return;
    var subs = d.cats[c.key] || [];
    subs.forEach(function(sb) {
      if (found) return;
      (sb.groups || []).forEach(function(g) {
        if (found) return;
        (g.versions || []).forEach(function(v) {
          if (found) return;
          if (v.file) found = v.file;
        });
      });
    });
  });
  return found;
}

// ===== 存储：索引 =====
function 生果索引路径() { return STCD_RESULT_DIR + '.index.json'; }
function 生果角色目录(source, dir) { return STCD_RESULT_DIR + STCD_RESULT_SOURCES[source] + '/' + dir + '/'; }
function 生果角色数据路径(source, dir) { return 生果角色目录(source, dir) + '成果.json'; }

function 生果空数据() { return { cover: null, cats: {} }; }
// 新建小类默认自带「一般」类别（组），版本槽按大类：正常服装 → 一般/站立/色情；其余 → 动漫版/真人版（动漫在前）
function 生果空小类(catKey) { return { name: '新小类', groups: [ { name: '一般', versions: 生果默认版本槽(catKey) } ] }; }
function 生果空版本组() { return { name: '新类别', versions: [] }; }
function 生果空版本() { return { name: '新版本', file: null }; }

// 正式角色卡 key = 清理后的名字；灵感角色 key = 清理后的名字_原文件夹名（保证唯一）
function 生果卡Key(name) { return LocalFS.sanitize(name) || '未命名'; }
function 生果灵感Key(it) {
  var disp = (typeof stcdInspireDisplayName === 'function') ? stcdInspireDisplayName(it) : (it.name || '未命名');
  var idPart = String(it.id || '').replace(/^i_dir_/, '');
  return LocalFS.sanitize(disp) + '_' + LocalFS.sanitize(idPart);
}

function 生果加载索引() {
  return LocalFS.readJSON(生果索引路径()).then(function(idx) {
    STCD_RESULT.entries = (idx && idx.entries) || {};
    return STCD_RESULT.entries;
  }).catch(function() { STCD_RESULT.entries = {}; return {}; });
}
function 生果保存索引() {
  return LocalFS.saveJSON(生果索引路径(), { entries: STCD_RESULT.entries }).catch(function(e) { console.error('[生图成果] 索引保存失败', e); });
}

// ===== 存储：角色成果数据 =====
function 生果确保条目(source, key, name, extra) {
  var dir = key;
  if (!STCD_RESULT.entries[key]) {
    STCD_RESULT.entries[key] = { name: name, source: source, dir: dir, updatedAt: Date.now() };
  } else {
    STCD_RESULT.entries[key].name = name;
    STCD_RESULT.entries[key].updatedAt = Date.now();
  }
  if (extra) { for (var k in extra) STCD_RESULT.entries[key][k] = extra[k]; }
  return STCD_RESULT.entries[key];
}

// 旧格式迁移：
//   1) slots { 类别: { standard, realistic } } → cats { 类别: [ { name:'默认', versions:[插画版,真人化] } ] }
//   2) 小类无 groups（versions 直接挂小类下）→ 包一层「一般」组
//   3) 旧大类 key（normal-clothes 等）→ 新 key（charNormal 等，与生图词典类别一致）
function 生果迁移(d) {
  if (!d) return null;
  if (d.slots && !d.cats) {
    d.cats = {};
    // 旧 slots key（normal-clothes 等）→ 新 key（charNormal 等）
    Object.keys(d.slots).forEach(function(sk) {
      var nk = STCD_RESULT_CAT_LEGACY[sk] || sk;
      var s = d.slots[sk] || {};
      var versions = [];
      if (s.standard) versions.push({ name: '插画版', file: s.standard });
      if (s.realistic) versions.push({ name: '真人化', file: s.realistic });
      d.cats[nk] = versions.length ? [{ name: '默认', versions: versions }] : [];
    });
    delete d.slots;
  }
  if (!d.cats) d.cats = {};
  // 旧 key → 新 key（含 slots 迁移后遗留的旧 cats key）
  var catsNew = {};
  Object.keys(d.cats).forEach(function(k) {
    var nk = STCD_RESULT_CAT_LEGACY[k] || k;
    catsNew[nk] = d.cats[k];
  });
  d.cats = catsNew;
  STCD_RESULT_CATS.forEach(function(c) {
    var subs = d.cats[c.key] || [];
    subs.forEach(function(sb) {
      if (!sb) return;
      if (sb.versions && Array.isArray(sb.versions) && !sb.groups) {
        sb.groups = [{ name: '一般', versions: sb.versions }];
        delete sb.versions;
      }
      if (!sb.groups) sb.groups = [];
      sb.groups.forEach(function(g) {
        if (!g.versions) g.versions = [];
        g.versions.forEach(function(v) { if (v && !v.variants) v.variants = []; });
      });
    });
  });
  return d;
}

function 生果读取角色(source, key) {
  var e = STCD_RESULT.entries[key];
  if (!e) return Promise.resolve(null);
  return LocalFS.readJSON(生果角色数据路径(source, e.dir)).then(function(d) {
    return 生果迁移(d);
  }).catch(function() { return null; });
}

function 生果保存角色(source, key, data) {
  var e = STCD_RESULT.entries[key];
  if (!e) return Promise.resolve();
  return LocalFS.saveJSON(生果角色数据路径(source, e.dir), data).then(function() {
    e.updatedAt = Date.now();
    // 同步内存书数据：操作函数改的是磁盘新读对象，这里挂回 book.r.d（保留旧图 _url，图片 URL 缓存按文件名命中）
    var bk = STCD_RESULT.book;
    if (bk && bk.key === key && bk.r) {
      var oldD = bk.r.d;
      if (oldD && data !== oldD) {
        // 把旧对象的 _url 合并到新对象（同 file 的沿用，新 file 无 _url 由渲染时按文件名缓存读）
        var mergeUrl = function(o, n) {
          if (!o || !n) return;
          if (n.file && o.file === n.file && o._url) n._url = o._url;
          if (n.variants && o.variants) {
            n.variants.forEach(function(nv, i) {
              var ov = o.variants[i];
              if (ov && nv.file && ov.file === nv.file && ov._url) nv._url = ov._url;
            });
          }
        };
        // 新上传的图（旧对象没有同 file）：从缓存取（新文件刚保存，缓存可能无 → 触发一次磁盘读）
        var ensureUrl = function(n, source, dir) {
          if (!n || !n.file) return;
          if (n._url) return;
          var cacheKey = dir + '/' + n.file;
          if (STCD_RESULT_IMG_CACHE[cacheKey]) { n._url = STCD_RESULT_IMG_CACHE[cacheKey]; return; }
          LocalFS.readBase64(生果角色目录(source, dir) + n.file).then(function(b64) {
            if (!b64) return;
            var ext = (String(n.file).split('.').pop() || 'png').toLowerCase();
            var mime = ext === 'jpg' ? 'jpeg' : ext;
            n._url = 'data:image/' + mime + ';base64,' + b64;
            STCD_RESULT_IMG_CACHE[cacheKey] = n._url;
            生果书渲染页();
          }).catch(function() {});
        };
        STCD_RESULT_CATS.forEach(function(c) {
          var os = (oldD.cats && oldD.cats[c.key]) || [];
          var ns = (data.cats && data.cats[c.key]) || [];
          ns.forEach(function(nsb, si) {
            var osb = os[si]; if (!osb) return;
            (nsb.groups || []).forEach(function(ng, gi) {
              var og = (osb.groups && osb.groups[gi]); if (!og) return;
              (ng.versions || []).forEach(function(nv, vi) {
                var ov = (og.versions && og.versions[vi]);
                if (ov) {
                  mergeUrl(ov, nv);
                  ensureUrl(nv, source, e.dir);
                }
              });
            });
          });
        });
        bk.r.d = data;
        // 数据已变：目录 HTML 缓存失效 + 书页列表重建，下次渲染目录时重建
        bk._tocHTML = undefined;
        bk.pages = 生果书构建(data);
      }
    }
    return 生果保存索引();
  });
}

// 图片 URL 内存缓存：key = 'dir/fname'（文件名含时间戳唯一，覆盖/删除后自然失效）
// 避免每次操作后全量重读磁盘 base64 导致加载慢
var STCD_RESULT_IMG_CACHE = {};
function 生果读图(source, dir, fname) {
  if (!fname) return Promise.resolve(null);
  var cacheKey = dir + '/' + fname;
  if (STCD_RESULT_IMG_CACHE[cacheKey]) return Promise.resolve(STCD_RESULT_IMG_CACHE[cacheKey]);
  return LocalFS.readBase64(生果角色目录(source, dir) + fname).then(function(b64) {
    if (!b64) return null;
    var ext = (String(fname).split('.').pop() || 'png').toLowerCase();
    var mime = ext === 'jpg' ? 'jpeg' : ext;
    var url = 'data:image/' + mime + ';base64,' + b64;
    STCD_RESULT_IMG_CACHE[cacheKey] = url;
    return url;
  }).catch(function() { return null; });
}

// ===== 来源加载（角色卡 / 灵感角色库）=====
function 生果加载来源(source) {
  if (source === 'card') {
    if (STCD_RESULT.cards && STCD_RESULT.cards.length) return Promise.resolve(STCD_RESULT.cards);
    return Store.character.list().then(function(items) {
      STCD_RESULT.cards = items || [];
      return STCD_RESULT.cards;
    }).catch(function() { STCD_RESULT.cards = []; return []; });
  }
  // 灵感角色库已加载过则复用，避免每次操作后重读磁盘
  if (STCD_RESULT.inspires && STCD_RESULT.inspires.length) return Promise.resolve(STCD_RESULT.inspires);
  if (typeof STCD_INSPIRE !== 'undefined' && typeof stcdInspireLoad === 'function') {
    return stcdInspireLoad().then(function(items) {
      STCD_RESULT.inspires = items || [];
      return STCD_RESULT.inspires;
    }).catch(function() { STCD_RESULT.inspires = []; return []; });
  }
  return Promise.resolve([]);
}

// ===== 主渲染 =====
var 成果Api = null;

function 渲染生图成果(el) {
  if (!el) el = document.getElementById('sheng-tu-cheng-guoContent');
  if (!el) return;
  var items = [
    { id: 'card', label: '📚 角色卡' },
    { id: 'inspire', label: '✨ 灵感角色库' },
  ];
  if (!成果Api) {
    成果Api = 渲染标签栏(el, items, { active: STCD_RESULT.source, subId: 'sheng-tu-cheng-guo-sub', onSwitch: function(s){ 生果切换来源(s); } });
  } else {
    成果Api.setActive(STCD_RESULT.source);
  }
  生果渲染内容();
}

function 生果渲染内容() {
  var sub = 成果Api ? 成果Api.sub : null;
  if (!sub) return;
  var h = '';
  // 性别 tab（仅正式角色卡来源需要；灵感角色库已按 世界观/典型场景/典型角色 下钻浏览，无需性别筛选）
  if (STCD_RESULT.source === 'card') {
    h += '<div style="display:flex;gap:6px;margin-bottom:10px">';
    STCD_RESULT_GENDERS.forEach(function(g) {
      var sel = STCD_RESULT.gender === g.key;
      h += '<div class="char-cat-tab flex-1' + (sel ? ' act' : '') + '" onclick="生果切换性别(\'' + g.key + '\')">';
      h += '<div class="char-cat-tab-icon">' + g.icon + '</div>';
      h += '<div class="char-cat-tab-label">' + g.label + '</div>';
      h += '</div>';
    });
    h += '</div>';
  }
  h += '<div id="sheng-tu-cheng-guo-body"></div>';
  sub.innerHTML = h;
  生果加载索引().then(function() {
    生果渲染列表();
  });
}

window.生果切换来源 = function(source) {
  STCD_RESULT.source = source;
  STCD_RESULT.detailKey = null;
  渲染生图成果(document.getElementById('sheng-tu-cheng-guoContent'));
};

window.生果切换性别 = function(g) {
  STCD_RESULT.gender = g;
  STCD_RESULT.detailKey = null;
  生果渲染列表();
};

// ===== 列表视图（按性别分组展示，竖版人物卡）=====
function 生果渲染列表() {
  var body = document.getElementById('sheng-tu-cheng-guo-body');
  if (!body) return;
  var source = STCD_RESULT.source;
  var gender = STCD_RESULT.gender;
  body.innerHTML = '<div style="font-size:12px;color:var(--fg3);padding:20px 0;text-align:center">加载中…</div>';
  生果加载来源(source).then(function(items) {
    if (source === 'inspire') { 生果渲染灵感下钻(body); return; }

    // 收集当前性别的角色：名字 + 成果条目 + 缩略图（最近一张图）
    var rows = [];
    items.forEach(function(it) {
      var name = '';
      var key = '';
      var extra = null;
      if (source === 'card') {
        var bi = (it.identity && it.identity.basicInfo) || {};
        name = bi.name || it.title || '未命名';
        key = 生果卡Key(name);
      } else {
        name = (typeof stcdInspireDisplayName === 'function') ? stcdInspireDisplayName(it) : (it.name || '未命名');
        key = 生果灵感Key(it);
        extra = { id: it.id };
      }
      // 性别过滤
      if (生果角色性别(it, source) !== gender) return;
      生果确保条目(source, key, name, extra);
      rows.push({ key: key, name: name, it: it, source: source });
    });
    // 并行读每个角色的最近图做缩略图 + 计数
    var reads = rows.map(function(r) {
      return 生果读取角色(source, r.key).then(function(d) {
        r.data = d;
        var count = 0;
        if (d && d.cats) {
          STCD_RESULT_CATS.forEach(function(c) {
            var subs = d.cats[c.key] || [];
            subs.forEach(function(sb) {
              (sb.groups || []).forEach(function(g) {
                (g.versions || []).forEach(function(v) {
                  if (v.file) count++;
                  (v.variants || []).forEach(function(vr) { if (vr.file) count++; });
                });
              });
            });
          });
        }
        r.count = count;
        // 默认封面/缩略图 = 该书「第一页」的图（正常服装·首个版本槽，与目录顺序一致）
        var thumbFname = 生果第一张图(d);
        return 生果读图(source, STCD_RESULT.entries[r.key] ? STCD_RESULT.entries[r.key].dir : r.key, thumbFname).then(function(url) { r.thumb = url; });
      }).catch(function() { r.count = 0; r.thumb = null; });
    });
    Promise.all(reads).then(function() {
      rows.sort(function(a, b) { return b.count - a.count; });
      var h = '';
      if (!rows.length) {
        h += '<div class="placeholder-text">' + (source === 'card' ? '该性别暂无角色卡数据，请先在「角色卡」模块创建' : '该性别暂无灵感角色，请到「✨ 灵感角色库」tab 创建') + '</div>';
      } else {
        // 竖版人物卡网格（仿灵感角色库：3:4 上图下文）
        h += '<div style="display:flex;flex-wrap:wrap;gap:8px">';
        rows.forEach(function(r) {
          var info = '';
          if (source === 'card') {
            var bi = (r.it.identity && r.it.identity.basicInfo) || {};
            info = [bi.title, bi.age ? (bi.age + '岁') : '', bi.race].filter(Boolean).join(' · ');
          } else if (r.it.category) {
            info = r.it.category;
          }
          h += '<div style="width:180px;background:var(--card);border:1px solid var(--border);border-radius:8px;cursor:pointer;flex-shrink:0;overflow:hidden;display:flex;flex-direction:column" onclick="生果打开详情(\'' + r.key + '\')">';
          // 竖版图片区（固定比例 3:4）
          h += '<div style="width:100%;aspect-ratio:3/4;background:var(--bg2);overflow:hidden;position:relative">';
          if (r.thumb) h += '<img src="' + r.thumb + '" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.style.display=\'none\'" />';
          if (!r.thumb) h += '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--fg3);font-size:28px">🖼</div>';
          // 图数角标（右下角）
          h += '<span style="position:absolute;bottom:6px;right:6px;background:rgba(0,0,0,0.55);color:#fff;font-size:9px;padding:1px 6px;border-radius:8px">' + r.count + ' 张</span>';
          h += '</div>';
          // 名称 + 信息
          h += '<div style="padding:6px 8px">';
          h += '<div style="font-size:11px;color:var(--fg);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(r.name) + '</div>';
          if (info) h += '<div style="font-size:9px;color:var(--fg3);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(info) + '</div>';
          h += '</div>';
          h += '</div>';
        });
        h += '</div>';
      }
      body.innerHTML = h;
    });
  }).catch(function(err) {
    console.error('[生图成果] 列表加载失败', err);
    body.innerHTML = '<div style="font-size:12px;color:var(--fg3);padding:20px 0;text-align:center">加载失败</div>';
  });
}

window.生果打开详情 = function(key) {
  STCD_RESULT.detailKey = key;
  STCD_RESULT.book = { pages: [], cur: 0, key: null };
  生果渲染详情();
};

// ===== 书式详情弹窗（目录 / 版本页；翻页 + 拖拽上传）=====
// 每本「书」= 一个角色：第 0 页是书样式的目录（全部版本槽的缩略图格子，点击跳转），
// 之后每个版本槽一页（大类 · 小类 · 类别 · 版本），支持 ◀▶ 翻页、目录跳转、每页拖拽上传。
// 无独立封面概念：列表/目录显示的缩略图 = 该书「第一页」的图（生果第一张图：正常服装·首个版本槽）。

// 构建书页列表（目录 + 全部版本槽 + 版本下的变体，每槽一页）
// 页面定位：catKey/si/gi/vi 定位版本槽；variantIdx = -1 表示主版本，>=0 表示该版本的 variants[变体]
function 生果书构建(d) {
  var pages = [];
  pages.push({ type: 'toc', title: '目录' });
  STCD_RESULT_CATS.forEach(function(c) {
    var subs = d.cats[c.key] || [];
    subs.forEach(function(sb, si) {
      (sb.groups || []).forEach(function(g, gi) {
        (g.versions || []).forEach(function(v, vi) {
          var gName = (g.name && g.name !== '一般') ? (' · ' + g.name) : '';
          // 主版本页
          pages.push({
            type: 'ver',
            title: c.label + ' · ' + (sb.name || '未命名') + gName + ' · ' + (v.name || '未命名'),
            catKey: c.key, si: si, gi: gi, vi: vi, variantIdx: -1,
            catLabel: c.label, sbName: sb.name || '未命名', gName: g.name || '一般', vName: v.name || '未命名',
          });
          // 变体页（紧跟主版本之后）
          (v.variants || []).forEach(function(vr, ri) {
            pages.push({
              type: 'ver',
              title: c.label + ' · ' + (sb.name || '未命名') + gName + ' · ' + (v.name || '未命名') + ' › ' + (vr.name || '变体'),
              catKey: c.key, si: si, gi: gi, vi: vi, variantIdx: ri,
              catLabel: c.label, sbName: sb.name || '未命名', gName: g.name || '一般', vName: v.name || '未命名',
              vrName: vr.name || '变体',
            });
          });
        });
      });
    });
  });
  return pages;
}

// 书页是否已有图（读 _url，加载阶段挂载）
function 生果书页有图(p) {
  var v = 生果书当前版本(p);
  return !!(v && v.file && v._url);
}
// 取当前页对应的版本槽对象（主版本 或 变体）
function 生果书当前版本(p) {
  var r = STCD_RESULT.book && STCD_RESULT.book.r;
  if (!r || !p) return null;
  var sb = r.d.cats && r.d.cats[p.catKey] && r.d.cats[p.catKey][p.si];
  var g = sb && sb.groups && sb.groups[p.gi];
  var v = g && g.versions && g.versions[p.vi];
  if (!v) return null;
  if (p.variantIdx >= 0) {
    if (!v.variants) v.variants = [];
    return v.variants[p.variantIdx] || null;
  }
  return v;
}

// 主渲染：加载数据 → 构建书 → 渲染骨架 + 当前页（默认进入目录）
function 生果渲染详情() {
  var key = STCD_RESULT.detailKey;
  var e = STCD_RESULT.entries[key];
  if (!e) return;
  var source = e.source;
  var ov = document.querySelector('.ovl[data-stcd-result-detail]');
  if (!ov) {
    ov = document.createElement('div');
    ov.className = 'ovl';
    ov.setAttribute('data-stcd-result-detail', '1');
    document.body.appendChild(ov);
    ov.addEventListener('click', function(ev) { if (ev.target === ov) 生果关闭详情(); });
  }
  ov.innerHTML = '<div class="mcard" style="width:1320px;max-width:97vw;height:90vh;display:flex;flex-direction:column"><div style="font-size:12px;color:var(--fg3);padding:20px 0;text-align:center">加载中…</div></div>';
  // 找角色数据（正式卡按名字 / 灵感按 id）
  生果加载来源(source).then(function() {
    var charData = null;
    var charInfo = '';
    if (source === 'card') {
      for (var i = 0; i < STCD_RESULT.cards.length; i++) {
        var bi = (STCD_RESULT.cards[i].identity && STCD_RESULT.cards[i].identity.basicInfo) || {};
        if ((bi.name || STCD_RESULT.cards[i].title || '未命名') === e.name) { charData = STCD_RESULT.cards[i]; break; }
      }
      if (charData) {
        var bi2 = (charData.identity && charData.identity.basicInfo) || {};
        charInfo = [bi2.title, bi2.age ? (bi2.age + '岁') : '', bi2.race, bi2.rarity].filter(Boolean).join(' · ');
      }
    } else {
      for (var j = 0; j < STCD_RESULT.inspires.length; j++) {
        if (STCD_RESULT.inspires[j].id === e.id) { charData = STCD_RESULT.inspires[j]; break; }
      }
      if (charData) charInfo = charData.category || '';
    }
    // 同角色已加载：直接复用内存数据（操作函数已修改对象），跳过磁盘读取与全量读图 → 秒开
    var bk0 = STCD_RESULT.book;
    if (bk0 && bk0.key === key && bk0.r && bk0.r.d) {
      var r0 = bk0.r;
      r0.charData = charData; r0.charInfo = charInfo;
      return Promise.resolve(r0);
    }
    // 首次加载：只读 JSON 结构，不预读任何图片（图片由目录/版本页惰性加载，避免几十次 IPC 卡顿）
    return 生果读取角色(source, key).then(function(d) {
      if (!d) d = 生果空数据();
      // 初始化 variants 结构（惰性加载依赖）
      STCD_RESULT_CATS.forEach(function(c) {
        var subs = d.cats[c.key] || [];
        subs.forEach(function(sb) {
          (sb.groups || []).forEach(function(g) {
            (g.versions || []).forEach(function(v) {
              if (!v.variants) v.variants = [];
            });
          });
        });
      });
      return { d: d, charData: charData, charInfo: charInfo };
    });
  }).then(function(r) {
    var bk = STCD_RESULT.book;
    // 同角色复用缓存时 pages 结构不变（数据变化时 生果保存角色 会重建），避免重复构建
    var pages = (bk.key === key && bk.pages && bk.pages.length) ? bk.pages : 生果书构建(r.d);
    bk.pages = pages;
    bk.r = r; bk.e = e; bk.source = source;
    // 换角色 → 回到目录（第 0 页）；否则保留当前页位置（clamp 到有效范围）
    if (bk.key !== key) { bk.key = key; bk.cur = 0; }
    if (bk.cur < 0) bk.cur = 0;
    if (bk.cur >= pages.length) bk.cur = pages.length - 1;
    var h = '<div class="mcard" style="width:1320px;max-width:97vw;height:90vh;display:flex;flex-direction:column">';
    // 头部（紧凑）
    h += '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:8px 10px;border-bottom:1px solid var(--border);flex-shrink:0">';
    h += '<button class="btn-out" style="padding:1px 8px;font-size:10px" onclick="生果关闭详情()">✕ 关闭</button>';
    h += '<span style="font-size:14px;color:var(--fg);font-weight:700">' + escHtml(e.name) + '</span>';
    h += '<span class="tag-chip" style="font-size:9px">' + (source === 'card' ? '📚 角色卡' : '✨ 灵感角色') + '</span>';
    if (r.charInfo) h += '<span style="font-size:10px;color:var(--fg3)">' + escHtml(r.charInfo) + '</span>';
    h += '<div style="flex:1"></div>';
    if (source === 'card' && r.charData && typeof window.角色档案函数 === 'function') {
      h += '<button class="btn-out" style="padding:1px 8px;font-size:10px" onclick="生果查看档案(\'' + key + '\')">📋 档案</button>';
    } else if (source === 'inspire' && r.charData && typeof stcdInspireView === 'function') {
      h += '<button class="btn-out" style="padding:1px 8px;font-size:10px" onclick="stcdInspireView(\'' + escHtml(r.charData.id) + '\')">📋 查看</button>';
    }
    h += '</div>';
    // 书主体（当前页渲染区）+ 左右点击翻页热区
    h += '<div style="flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;position:relative" id="stcd-book-wrap">';
    h += '<div id="stcd-book-main" style="flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;position:relative"></div>';
    // 左右翻页热区：点击主体左右两侧翻页（不遮挡操作按钮所在的中央区域）
    h += '<div id="stcd-book-prev" style="position:absolute;left:0;top:0;bottom:0;width:70px;cursor:w-resize;z-index:5" title="上一页"></div>';
    h += '<div id="stcd-book-next" style="position:absolute;right:0;top:0;bottom:0;width:70px;cursor:e-resize;z-index:5" title="下一页"></div>';
    h += '</div>';
    // 底部翻页条
    h += '<div style="display:flex;align-items:center;gap:6px;padding:6px 10px;border-top:1px solid var(--border);flex-shrink:0;flex-wrap:wrap">';
    h += '<button class="btn-out" style="padding:1px 8px;font-size:10px" onclick="生果书跳转(0)">📖 目录</button>';
    h += '<button class="btn-out" style="padding:1px 8px;font-size:10px" onclick="生果书翻页(-1)">◀ 上一页</button>';
    h += '<span id="stcd-book-page-ind" style="font-size:10px;color:var(--fg2);flex:1;text-align:center"></span>';
    h += '<button class="btn-out" style="padding:1px 8px;font-size:10px" onclick="生果书翻页(1)">下一页 ▶</button>';
    h += '</div>';
    h += '</div>';
    ov.innerHTML = h;
    // 书主体拖拽上传委托（任意位置拖入图片 → 若当前页是版本页则上传到该页）
    var main = document.getElementById('stcd-book-main');
    if (main) {
      main.addEventListener('dragover', function(ev) { ev.preventDefault(); ev.stopPropagation(); });
      main.addEventListener('drop', function(ev) {
        ev.preventDefault(); ev.stopPropagation();
        var file = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
        if (!file) return;
        var p = STCD_RESULT.book.pages[STCD_RESULT.book.cur];
        if (!p || p.type !== 'ver') { toast('请先翻到对应的版本页，再拖入图片'); return; }
        生果保存版本文件(STCD_RESULT.book.e, p.catKey, p.si, p.gi, p.vi, file, p.variantIdx);
      });
    }
    生果书渲染页();
    生果书绑定键盘();
    // 左右点击翻页热区
    var prevZone = document.getElementById('stcd-book-prev');
    var nextZone = document.getElementById('stcd-book-next');
    if (prevZone) prevZone.addEventListener('click', function(ev) { ev.stopPropagation(); 生果书翻页(-1); });
    if (nextZone) nextZone.addEventListener('click', function(ev) { ev.stopPropagation(); 生果书翻页(1); });
  }).catch(function(err) {
    console.error('[生图成果] 详情加载失败', err);
    ov.innerHTML = '<div class="mcard" style="width:1320px;max-width:97vw;height:90vh;display:flex;flex-direction:column"><div style="font-size:12px;color:var(--fg3);padding:20px 0;text-align:center">加载失败</div><div style="text-align:right;padding:8px 12px;border-top:1px solid var(--border);flex-shrink:0"><button class="btn-out" onclick="生果关闭详情()">关闭</button></div></div>';
  });
}

// 翻页 / 跳转
window.生果书翻页 = function(dir) {
  var bk = STCD_RESULT.book;
  if (!bk || !bk.pages.length) return;
  var n = bk.pages.length;
  bk.cur = Math.max(0, Math.min(n - 1, (bk.cur || 0) + dir));
  生果书渲染页();
};
window.生果书跳转 = function(idx) {
  var bk = STCD_RESULT.book;
  if (!bk || !bk.pages.length) return;
  if (idx < 0 || idx >= bk.pages.length) return;
  bk.cur = idx;
  生果书渲染页();
};

// 渲染当前页内容 + 页码指示
function 生果书渲染页() {
  var bk = STCD_RESULT.book;
  var main = document.getElementById('stcd-book-main');
  var ind = document.getElementById('stcd-book-page-ind');
  if (!bk || !main) return;
  var p = bk.pages[bk.cur] || null;
  if (!p) { main.innerHTML = ''; return; }
  var r = bk.r, e = bk.e, source = bk.source;
  var h = '';
  if (p.type === 'toc') {
    // 目录每次按当前 _url 状态重建：已加载的图直接显示，未加载的走懒加载占位。
    // 不做字符串缓存——缓存会把「已填充图片的 DOM」替换成最初的占位版导致图片消失。
    h = 生果书目录HTML(r, e);
  } else {
    h = 生果书版本页HTML(r, e, p);
  }
  main.innerHTML = h;
  if (ind) ind.textContent = '第 ' + (bk.cur + 1) + ' / ' + bk.pages.length + ' 页';
  // 懒加载：目录缩略图按需读图；版本页立即加载当前页大图
  if (p.type === 'toc') 生果目录懒加载();
  else 生果加载槽位图(p);
}

// 读单个槽位图并挂 _url（惰性加载核心：一次只读一张，避免几十次 IPC 卡顿）
// 无论 _url 是否已缓存，都会把 url 填充到当前 DOM 中对应 img（目录重建后 img 是新的占位元素）
function 生果加载槽位图(p) {
  var bk = STCD_RESULT.book;
  if (!bk || !bk.r) return Promise.resolve(null);
  var v = 生果书当前版本(p);
  if (!v || !v.file) return Promise.resolve(null);
  // 填充 img 的公共逻辑
  function fillImg(url) {
    var main = document.getElementById('stcd-book-main');
    if (main) {
      var img = main.querySelector('img[data-slot="' + (p.catKey + '|' + p.si + '|' + p.gi + '|' + p.vi + '|' + p.variantIdx) + '"]');
      if (img) { img.src = url; img.style.opacity = '1'; }
    }
  }
  if (v._url) { fillImg(v._url); return Promise.resolve(v._url); }
  return 生果读图(bk.source, bk.e.dir, v.file).then(function(url) {
    v._url = url;
    fillImg(url);
    return url;
  });
}

// 目录缩略图懒加载：只读视口附近的图（IntersectionObserver），滚动时继续补读
function 生果目录懒加载() {
  var main = document.getElementById('stcd-book-main');
  if (!main) return;
  var imgs = Array.prototype.slice.call(main.querySelectorAll('img[data-lazy="1"]'));
  if (!imgs.length) return;
  // 兜底：立即加载前 4 张（首屏），其余交给 IntersectionObserver
  var slotOf = function(img) {
    var parts = (img.getAttribute('data-slot') || '').split('|');
    if (parts.length !== 5) return null;
    return {
      catKey: parts[0], si: parseInt(parts[1], 10), gi: parseInt(parts[2], 10),
      vi: parseInt(parts[3], 10), variantIdx: parseInt(parts[4], 10),
    };
  };
  imgs.slice(0, 4).forEach(function(img) { var p = slotOf(img); if (p) 生果加载槽位图(p); });
  if (typeof IntersectionObserver !== 'function') return;
  var rest = imgs.slice(4);
  if (!rest.length) return;
  // 用默认视口观察（root 省略）：弹窗内目录在嵌套滚动容器中，视口相交检测最可靠
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(en) {
      if (!en.isIntersecting) return;
      var img = en.target;
      var p = slotOf(img);
      if (!p) return;
      io.unobserve(img);
      生果加载槽位图(p);
    });
  }, { rootMargin: '300px' });
  rest.forEach(function(img) { io.observe(img); });
}

// 目录页：书样式——每个版本槽一个缩略图格子（有图显图/无图显空位），点击跳转；大类分组
function 生果书目录HTML(r, e) {
  var bk = STCD_RESULT.book;
  var pages = bk.pages;
  var d = r.d;
  var h = '<div style="flex:1;overflow-y:auto;padding:14px">';
  // 书封面标题区（角色信息 + 统计）
  var verPages = pages.filter(function(x) { return x.type === 'ver'; });
  var withImg = verPages.filter(生果书页有图).length;
  h += '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding-bottom:10px;margin-bottom:10px;border-bottom:1px solid var(--border)">';
  h += '<div style="font-size:16px;color:var(--fg);font-weight:700">📖 ' + escHtml(e.name) + '</div>';
  if (r.charInfo) h += '<span style="font-size:10px;color:var(--fg3)">' + escHtml(r.charInfo) + '</span>';
  h += '<div style="flex:1"></div>';
  h += '<span style="font-size:10px;color:var(--fg2)">共 ' + verPages.length + ' 页 · 已传 <b style="color:var(--accent)">' + withImg + '</b> 张</span>';
  h += '</div>';
  STCD_RESULT_CATS.forEach(function(c) {
    var subs = d.cats[c.key] || [];
    h += '<div style="font-size:11px;color:var(--fg);font-weight:600;margin:10px 0 6px;display:flex;align-items:center;gap:6px">';
    h += '<span>' + c.label + '</span>';
    h += '<span style="font-size:9px;color:var(--fg3);font-weight:400">' + verPages.filter(function(x) { return x.catKey === c.key; }).length + ' 页</span>';
    h += '<div style="flex:1"></div>';
    h += '<button class="btn-new" onclick="生果新建小类(\'' + c.key + '\')">＋ 新建</button>';
    h += '</div>';
    if (!subs.length) {
      // 空大类：显示占位提示 + 新建入口（保持五大类始终可见）
      h += '<div style="font-size:10px;color:var(--fg3);padding:2px 0 6px">暂无小类，点「＋ 新建小类」创建（如：日常校服；自带 动漫版/真人版 两页）</div>';
      return;
    }
    subs.forEach(function(sb, si) {
      h += '<div style="border:1px solid var(--border);border-radius:8px;padding:6px;margin-bottom:8px;background:var(--bg2)">';
      // 小类头（名称 + 管理）
      h += '<div style="display:flex;align-items:center;gap:5px;margin-bottom:5px">';
      h += '<span style="font-size:10px;color:var(--accent);font-weight:600;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">▸ ' + escHtml(sb.name || '未命名') + '</span>';
      h += '<button class="btn-out" style="padding:0 5px;font-size:8px" title="重命名小类" onclick="生果重命名小类(\'' + c.key + '\',' + si + ')">✎</button>';
      h += '<button class="btn-out" style="padding:0 5px;font-size:8px;color:#e06c75" title="删除小类" onclick="生果删除小类(\'' + c.key + '\',' + si + ')">🗑</button>';
      h += '<button class="btn-out" style="padding:0 5px;font-size:8px" title="新建类别组" onclick="生果新建版本组(\'' + c.key + '\',' + si + ')">＋ 类别</button>';
      h += '</div>';
      // 版本组 → 缩略图格子
      (sb.groups || []).forEach(function(g, gi) {
        var gName = (g.name && g.name !== '一般') ? ('◆ ' + g.name + ' · ') : '';
        h += '<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:4px">';
        if (gName) h += '<span style="font-size:9px;color:var(--fg2)">' + escHtml(gName) + '</span>';
        if (!(g.versions || []).length) {
          h += '<span style="font-size:9px;color:var(--fg3)">（空组）</span>';
          h += '<button class="btn-out" style="padding:0 5px;font-size:8px" title="该组新建版本" onclick="生果新建版本(\'' + c.key + '\',' + si + ',' + gi + ')">＋ 版本</button>';
          if (g.name && g.name !== '一般') {
            h += '<button class="btn-out" style="padding:0 5px;font-size:8px" title="重命名类别组" onclick="生果重命名版本组(\'' + c.key + '\',' + si + ',' + gi + ')">✎</button>';
            h += '<button class="btn-out" style="padding:0 5px;font-size:8px;color:#e06c75" title="删除类别组" onclick="生果删除版本组(\'' + c.key + '\',' + si + ',' + gi + ')">🗑</button>';
          }
          h += '</div>';
          return;
        }
        (g.versions || []).forEach(function(v, vi) {
          var p = pages.filter(function(x) { return x.type === 'ver' && x.catKey === c.key && x.si === si && x.gi === gi && x.vi === vi && x.variantIdx === -1; })[0];
          if (!p) return;
          var idx = pages.indexOf(p);
          // 主版本卡片（纵向：3:4 图 + 名称 + 变体按钮），支持拖拽上传
          h += 生果目录卡片HTML(p, idx, v.name || '未命名', false, c.key, si, gi, vi, -1, v);
          // 变体卡片：紧跟主版本之后，树状（➜ 连接）
          var variants = v.variants || [];
          variants.forEach(function(vr, ri) {
            var vp = pages.filter(function(x) { return x.type === 'ver' && x.catKey === c.key && x.si === si && x.gi === gi && x.vi === vi && x.variantIdx === ri; })[0];
            if (!vp) return;
            var vidx = pages.indexOf(vp);
            h += '<span style="font-size:16px;color:var(--accent);flex-shrink:0">➜</span>';
            h += 生果目录卡片HTML(vp, vidx, vr.name || '变体', true, c.key, si, gi, vi, ri, vr);
          });
        });
        // 组尾：新建版本 + 组管理
        h += '<button class="btn-out" style="padding:0 5px;font-size:8px" title="该组新建版本" onclick="生果新建版本(\'' + c.key + '\',' + si + ',' + gi + ')">＋ 版本</button>';
        if (g.name && g.name !== '一般') {
          h += '<button class="btn-out" style="padding:0 5px;font-size:8px" title="重命名类别组" onclick="生果重命名版本组(\'' + c.key + '\',' + si + ',' + gi + ')">✎</button>';
          h += '<button class="btn-out" style="padding:0 5px;font-size:8px;color:#e06c75" title="删除类别组" onclick="生果删除版本组(\'' + c.key + '\',' + si + ',' + gi + ')">🗑</button>';
        }
        h += '</div>';
      });
      h += '</div>';
    });
  });
  h += '<div style="margin-top:8px;font-size:9px;color:var(--fg3)">💡 点击格子翻到对应页；每页可拖入图片上传；◀▶ 或键盘 ← → 翻页</div>';
  h += '</div>';
  return h;
}

// 目录卡片：纵向大卡片（3:4 图 + 名称 + 操作），支持点击跳转、变体入口、拖拽上传
// isVariant：变体卡片（虚线强调框）；dragover 高亮 + drop 走带确认的上传
// 主版本卡片图片区右上角有悬浮「✚ 变体」小圆钮（点击直接在目录里生成变体）
function 生果目录卡片HTML(p, idx, name, isVariant, catKey, si, gi, vi, variantIdx, slotObj) {
  var filled = 生果书页有图(p);
  var boxStyle = isVariant
    ? 'width:150px;background:var(--bg2);border:1px dashed var(--accent);border-radius:8px;overflow:hidden;cursor:pointer;flex-shrink:0;display:flex;flex-direction:column'
    : 'width:150px;background:var(--card);border:1px solid var(--border);border-radius:8px;overflow:hidden;cursor:pointer;flex-shrink:0;display:flex;flex-direction:column';
  var h = '<div style="' + boxStyle + '"'
    + ' onclick="生果书跳转(' + idx + ')"'
    + ' title="' + escHtml(p.title) + ' · 点击翻页，拖入图片上传"'
    + ' ondragover="event.preventDefault();event.stopPropagation();this.style.borderColor=\'var(--accent)\';this.style.boxShadow=\'0 0 0 1px var(--accent)\'"'
    + ' ondragleave="this.style.borderColor=\'' + (isVariant ? 'var(--accent)' : 'var(--border)') + '\';this.style.boxShadow=\'none\'"'
    + ' ondrop="event.preventDefault();event.stopPropagation();this.style.borderColor=\'' + (isVariant ? 'var(--accent)' : 'var(--border)') + '\';this.style.boxShadow=\'none\';生果目录拖拽上传(event,\'' + catKey + '\',' + si + ',' + gi + ',' + vi + ',' + variantIdx + ')">';
  // 图区（3:4 纵向）；图未加载时显示占位，data-slot 标记供懒加载按需读图
  h += '<div style="width:100%;aspect-ratio:3/4;background:var(--bg2);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative">';
  if (filled && slotObj._url) {
    h += '<img src="' + slotObj._url + '" style="width:100%;height:100%;object-fit:cover;display:block" />';
  } else if (slotObj && slotObj.file) {
    // 有文件但未加载：占位 + 标记（懒加载填充；用 opacity 而非 display:none，保证 IntersectionObserver 可观察）
    h += '<span style="font-size:24px;color:var(--fg3)">🖼</span>';
    h += '<img data-slot="' + escHtml(catKey + '|' + si + '|' + gi + '|' + vi + '|' + variantIdx) + '" data-lazy="1" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0" />';
  } else {
    h += '<span style="font-size:24px;color:var(--fg3)">🖼</span>';
    h += '<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:9px;color:var(--fg3)">空 · 拖图上传</span>';
  }
  // 主版本：图片区右上角悬浮「✚ 变体」小圆钮（不占底部行）
  if (!isVariant) {
    h += '<span title="给这张图生成特殊版本（如真人版）" style="position:absolute;top:4px;right:4px;background:rgba(0,0,0,0.6);color:#fff;font-size:11px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;line-height:1" onclick="event.stopPropagation();生果新建变体(\'' + catKey + '\',' + si + ',' + gi + ',' + vi + ')">✚</span>';
  }
  h += '</div>';
  // 名称行
  h += '<div style="padding:4px 6px;display:flex;align-items:center;gap:3px">';
  h += '<span style="font-size:9px;color:' + (isVariant ? 'var(--accent)' : 'var(--fg)') + ';flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600">' + escHtml(name) + '</span>';
  h += '</div>';
  // 底部操作行（主版本：✎/🗑；变体：✎/🗑）
  h += '<div style="display:flex;gap:3px;padding:0 5px 5px">';
  if (isVariant) {
    h += '<button class="btn-out" style="padding:0 4px;font-size:8px;flex:1" title="重命名变体" onclick="event.stopPropagation();生果重命名变体(\'' + catKey + '\',' + si + ',' + gi + ',' + vi + ',' + variantIdx + ')">✎</button>';
    h += '<button class="btn-out" style="padding:0 4px;font-size:8px;flex:1;color:#e06c75" title="删除变体" onclick="event.stopPropagation();生果删除变体(\'' + catKey + '\',' + si + ',' + gi + ',' + vi + ',' + variantIdx + ')">🗑</button>';
  } else {
    h += '<button class="btn-out" style="padding:0 4px;font-size:8px;flex:1" title="重命名版本" onclick="event.stopPropagation();生果重命名版本(\'' + catKey + '\',' + si + ',' + gi + ',' + vi + ')">✎</button>';
    h += '<button class="btn-out" style="padding:0 4px;font-size:8px;flex:1;color:#e06c75" title="删除版本" onclick="event.stopPropagation();生果删除版本(\'' + catKey + '\',' + si + ',' + gi + ',' + vi + ')">🗑</button>';
  }
  h += '</div>';
  h += '</div>';
  return h;
}

// 目录卡片拖拽上传：空位直接上传；已有图需确认覆盖
window.生果目录拖拽上传 = function(ev, catKey, si, gi, vi, variantIdx) {
  ev.preventDefault(); ev.stopPropagation();
  var file = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
  if (!file) return;
  var e = STCD_RESULT.entries[STCD_RESULT.detailKey];
  if (!e) return;
  // 读取当前目标槽是否有图
  生果读取角色(e.source, STCD_RESULT.detailKey).then(function(d) {
    if (!d) d = 生果空数据();
    var sb = d.cats && d.cats[catKey] && d.cats[catKey][si];
    var g = sb && sb.groups && sb.groups[gi];
    var v = g && g.versions && g.versions[vi];
    if (!v) return;
    var target = v;
    if (variantIdx >= 0) {
      if (!v.variants) v.variants = [];
      target = v.variants[variantIdx];
    }
    if (!target) return;
    var doUpload = function() { 生果保存版本文件(e, catKey, si, gi, vi, file, variantIdx); };
    if (target.file) {
      // 已有图：确认覆盖
      if (confirm('该位置已有图片，确定覆盖上传吗？')) doUpload();
    } else {
      doUpload();
    }
  });
};

// 版本页：单页展示一个版本槽（主版本 或 变体），大图 + 操作 + 拖拽上传
function 生果书版本页HTML(r, e, p) {
  var v = 生果书当前版本(p);
  var url = v && v._url;
  var isVariant = p.variantIdx >= 0;
  var h = '<div style="flex:1;min-height:0;display:flex;flex-direction:column;padding:10px 12px">';
  // 页眉：面包屑（可点击跳转）+ 操作
  var bk = STCD_RESULT.book;
  var pages = bk ? bk.pages : [];
  // 层级定位：大类 → 该大类第一个版本页；小类 → 该小类第一个版本页；类别组 → 该组第一个版本页
  window.生果面包屑跳转 = function(catKey, si, gi) {
    var pages2 = STCD_RESULT.book ? STCD_RESULT.book.pages : [];
    var t = pages2.find(function(x) {
      if (x.type !== 'ver') return false;
      if (x.catKey !== catKey) return false;
      if (si != null && x.si !== si) return false;
      if (gi != null && x.gi !== gi) return false;
      return x.variantIdx === -1;
    });
    if (t) 生果书跳转(pages2.indexOf(t));
  };
  h += '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px;flex-shrink:0">';
  h += '<span style="font-size:9px;color:var(--accent);cursor:pointer;font-weight:600" title="回到目录" onclick="生果书跳转(0)">📖 目录</span><span style="color:var(--fg3)">›</span>';
  h += '<span style="font-size:9px;color:var(--fg3);cursor:pointer" title="跳到该大类" onclick="生果面包屑跳转(\'' + p.catKey + '\')">' + escHtml(p.catLabel) + '</span><span style="color:var(--fg3)">›</span>';
  h += '<span style="font-size:10px;color:var(--accent);font-weight:600;cursor:pointer" title="跳到该小类" onclick="生果面包屑跳转(\'' + p.catKey + '\',' + p.si + ')">' + escHtml(p.sbName) + '</span>';
  if (p.gName && p.gName !== '一般') {
    h += '<span style="color:var(--fg3)">›</span><span style="font-size:10px;color:var(--fg2);cursor:pointer" title="跳到该类别组" onclick="生果面包屑跳转(\'' + p.catKey + '\',' + p.si + ',' + p.gi + ')">' + escHtml(p.gName) + '</span>';
  }
  h += '<span style="color:var(--fg3)">›</span><span style="font-size:11px;color:var(--fg);font-weight:700">' + escHtml(p.vName) + '</span>';
  if (isVariant) {
    h += '<span style="color:var(--accent)">➜</span><span style="font-size:11px;color:var(--accent);font-weight:700">' + escHtml(p.vrName || '变体') + '</span>';
  }
  h += '<div style="flex:1"></div>';
  if (isVariant) {
    // 变体页操作
    h += '<button class="btn-out" style="padding:0 6px;font-size:9px" onclick="生果重命名变体(\'' + p.catKey + '\',' + p.si + ',' + p.gi + ',' + p.vi + ',' + p.variantIdx + ')">✎ 改名</button>';
    h += '<button class="btn-out" style="padding:0 6px;font-size:9px;color:#e06c75" onclick="生果删除变体(\'' + p.catKey + '\',' + p.si + ',' + p.gi + ',' + p.vi + ',' + p.variantIdx + ')">🗑 删变体</button>';
  } else {
    // 主版本页操作：同组新建版本 + 新建变体 + 改名 + 删除
    h += '<button class="btn-out" style="padding:0 6px;font-size:9px" title="给这张图生成特殊版本（如真人版）" onclick="生果新建变体(\'' + p.catKey + '\',' + p.si + ',' + p.gi + ',' + p.vi + ')">➕ 变体</button>';
    h += '<button class="btn-out" style="padding:0 6px;font-size:9px" title="同组新建版本" onclick="生果新建版本(\'' + p.catKey + '\',' + p.si + ',' + p.gi + ')">＋ 版本</button>';
    h += '<button class="btn-out" style="padding:0 6px;font-size:9px" onclick="生果重命名版本(\'' + p.catKey + '\',' + p.si + ',' + p.gi + ',' + p.vi + ')">✎ 改名</button>';
    h += '<button class="btn-out" style="padding:0 6px;font-size:9px;color:#e06c75" onclick="生果删除版本(\'' + p.catKey + '\',' + p.si + ',' + p.gi + ',' + p.vi + ')">🗑 删版本</button>';
  }
  h += '</div>';
  // 图区（可拖拽上传）；有文件未加载时先占位，渲染后由 生果加载槽位图 填充
  var hasFile = !!(v && v.file);
  h += '<div style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center;border:1px dashed ' + ((url || hasFile) ? 'var(--border)' : 'var(--accent)') + ';border-radius:8px;background:var(--card);overflow:hidden;position:relative" '
    + 'ondragover="event.preventDefault();event.stopPropagation();this.style.borderColor=\'var(--accent)\';this.style.background=\'rgba(78,204,163,0.08)\'" '
    + 'ondragleave="this.style.borderColor=\'var(--border)\';this.style.background=\'var(--card)\'" '
    + 'ondrop="event.preventDefault();event.stopPropagation();this.style.borderColor=\'var(--border)\';this.style.background=\'var(--card)\';生果书拖拽上传(event)">';
  if (url) {
    h += '<img src="' + url + '" style="max-width:100%;max-height:100%;object-fit:contain;cursor:zoom-in" onclick="生果预览(\'' + url + '\')" />';
    h += '<span style="position:absolute;left:8px;bottom:6px;font-size:9px;color:var(--fg3);background:rgba(0,0,0,0.55);padding:1px 6px;border-radius:3px">🖼 点击看图 · 拖入新图可替换</span>';
  } else if (hasFile) {
    // 有文件未加载：占位，data-slot 供加载后填充
    h += '<div style="text-align:center;color:var(--fg3);font-size:12px;padding:20px">';
    h += '<div style="font-size:30px;margin-bottom:6px">📥</div>';
    h += '图片加载中…（拖入新图可替换）';
    h += '</div>';
    h += '<img data-slot="' + escHtml(p.catKey + '|' + p.si + '|' + p.gi + '|' + p.vi + '|' + p.variantIdx) + '" data-lazy="1" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:0" />';
  } else {
    h += '<div style="text-align:center;color:var(--fg3);font-size:12px;padding:20px">';
    h += '<div style="font-size:30px;margin-bottom:6px">📥</div>';
    h += '把图片拖到这里上传，或点下方按钮选择文件';
    h += '</div>';
  }
  h += '</div>';
  // 底部操作
  h += '<div style="display:flex;gap:4px;margin-top:6px;flex-shrink:0;flex-wrap:wrap">';
  h += '<button class="btn-main" style="padding:1px 10px;font-size:9px" onclick="生果上传版本(\'' + p.catKey + '\',' + p.si + ',' + p.gi + ',' + p.vi + (isVariant ? ',' + p.variantIdx : '') + ')">📷 上传</button>';
  if (url) h += '<button class="btn-out" style="padding:1px 8px;font-size:9px" onclick="生果预览(\'' + url + '\')">🔍 查看</button>';
  if (url) h += '<button class="btn-out" style="padding:1px 8px;font-size:9px;color:#e06c75" onclick="生果删除版本图(\'' + p.catKey + '\',' + p.si + ',' + p.gi + ',' + p.vi + (isVariant ? ',' + p.variantIdx : '') + ')">🗑 删图</button>';
  h += '<div style="flex:1"></div>';
  h += '<span style="font-size:9px;color:var(--fg3)">' + (isVariant ? '变体页' : '该页已有图') + (hasFile ? ' · 已有图' : ' · 空页') + ' · ◀▶ 翻页</span>';
  h += '</div>';
  h += '</div>';
  return h;
}

// 版本页拖拽上传（由页面内 drop 触发）
window.生果书拖拽上传 = function(ev) {
  var file = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
  if (!file) return;
  var p = STCD_RESULT.book.pages[STCD_RESULT.book.cur];
  if (!p || p.type !== 'ver') { toast('当前页不是版本页'); return; }
  生果保存版本文件(STCD_RESULT.book.e, p.catKey, p.si, p.gi, p.vi, file, p.variantIdx);
};

// 键盘翻页（弹窗打开期间生效）
function 生果书绑定键盘() {
  if (STCD_RESULT._kbBound) return;
  STCD_RESULT._kbBound = true;
  document.addEventListener('keydown', 生果书键盘);
}
function 生果书键盘(ev) {
  if (!document.querySelector('.ovl[data-stcd-result-detail]')) return;
  if (ev.key === 'ArrowLeft') { ev.preventDefault(); 生果书翻页(-1); }
  else if (ev.key === 'ArrowRight') { ev.preventDefault(); 生果书翻页(1); }
}

window.生果关闭详情 = function() {
  var ov = document.querySelector('.ovl[data-stcd-result-detail]');
  if (ov) ov.remove();
  STCD_RESULT.detailKey = null;
  if (STCD_RESULT._kbBound) {
    STCD_RESULT._kbBound = false;
    document.removeEventListener('keydown', 生果书键盘);
  }
};

window.生果查看档案 = function(key) {
  var e = STCD_RESULT.entries[key];
  if (!e || e.source !== 'card') return;
  for (var i = 0; i < STCD_RESULT.cards.length; i++) {
    var bi = (STCD_RESULT.cards[i].identity && STCD_RESULT.cards[i].identity.basicInfo) || {};
    if ((bi.name || STCD_RESULT.cards[i].title || '未命名') === e.name) {
      if (typeof window.角色档案函数 === 'function') {
        // 档案置顶：把 modalOverlay 移到 DOM 最后并提升 z-index，盖在生图成果详情弹窗之上
        var mOv = document.getElementById('modalOverlay');
        if (mOv) {
          mOv.style.zIndex = '10000';
          document.body.appendChild(mOv);
        }
        window.角色档案函数(STCD_RESULT.cards[i]);
      } else toast('完整档案组件未加载');
      return;
    }
  }
  toast('角色数据不存在');
};

// ===== 命名弹窗（小类/版本自定义名称）=====
function 生果命名弹窗(title, placeholder, value, cb) {
  var h = '<div class="mcard" style="max-width:380px">';
  h += '<h3 style="font-size:0.95em;margin-bottom:10px">' + escHtml(title) + '</h3>';
  h += '<input id="stcd-result-name-input" class="llm-input" style="width:100%" value="' + escHtml(value || '') + '" placeholder="' + escHtml(placeholder || '') + '">';
  h += '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px">';
  h += '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>';
  h += '<button class="btn-main" onclick="生果命名弹窗确认()">确定</button>';
  h += '</div></div>';
  var ov = document.querySelector('.ovl[data-stcd-result-name]');
  if (!ov) {
    ov = document.createElement('div');
    ov.className = 'ovl';
    ov.setAttribute('data-stcd-result-name', '1');
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  }
  ov.innerHTML = h;
  STCD_RESULT._nameCb = cb;
  var input = document.getElementById('stcd-result-name-input');
  if (input) {
    input.focus();
    input.select();
    input.onkeydown = function(e) { if (e.key === 'Enter') 生果命名弹窗确认(); };
  }
}

window.生果命名弹窗确认 = function() {
  var input = document.getElementById('stcd-result-name-input');
  var v = input ? input.value.trim() : '';
  var cb = STCD_RESULT._nameCb;
  STCD_RESULT._nameCb = null;
  var ov = document.querySelector('.ovl[data-stcd-result-name]');
  if (ov) ov.remove();
  if (typeof cb === 'function') cb(v);
};

// ===== 小类操作 =====
window.生果新建小类 = function(catKey) {
  生果命名弹窗('新建', '小类名称，如：日常校服', '', function(name) {
    if (!name) return;
    var e = STCD_RESULT.entries[STCD_RESULT.detailKey];
    if (!e) return;
    生果读取角色(e.source, STCD_RESULT.detailKey).then(function(d) {
      if (!d) d = 生果空数据();
      if (!d.cats) d.cats = {};
      if (!d.cats[catKey]) d.cats[catKey] = [];
      // 新建小类默认版本槽按大类：正常服装→一般/站立/色情；其余→动漫版/真人版
      var sb = 生果空小类(catKey);
      sb.name = name;
      d.cats[catKey].push(sb);
      return 生果保存角色(e.source, STCD_RESULT.detailKey, d);
    }).then(function() { 生果渲染详情(); }).catch(function(err) { console.error('[生图成果] 新建小类失败', err); });
  });
};

window.生果重命名小类 = function(catKey, si) {
  var e = STCD_RESULT.entries[STCD_RESULT.detailKey];
  if (!e) return;
  生果读取角色(e.source, STCD_RESULT.detailKey).then(function(d) {
    var sb = d && d.cats && d.cats[catKey] && d.cats[catKey][si];
    if (!sb) return;
    生果命名弹窗('重命名小类', '小类名称', sb.name || '', function(name) {
      if (!name) return;
      sb.name = name;
      生果保存角色(e.source, STCD_RESULT.detailKey, d).then(function() { 生果渲染详情(); });
    });
  });
};

window.生果删除小类 = function(catKey, si) {
  if (!confirm('删除该小类及其全部图片？')) return;
  var e = STCD_RESULT.entries[STCD_RESULT.detailKey];
  if (!e) return;
  生果读取角色(e.source, STCD_RESULT.detailKey).then(function(d) {
    var subs = d && d.cats && d.cats[catKey];
    var sb = subs && subs[si];
    if (!sb) return;
    var dels = [];
    (sb.groups || []).forEach(function(g) {
      (g.versions || []).forEach(function(v) {
        if (v.file) dels.push(LocalFS['delete'](生果角色目录(e.source, e.dir) + v.file).catch(function() {}));
        (v.variants || []).forEach(function(vr) {
          if (vr.file) dels.push(LocalFS['delete'](生果角色目录(e.source, e.dir) + vr.file).catch(function() {}));
        });
      });
    });
    return Promise.all(dels).then(function() {
      subs.splice(si, 1);
      return 生果保存角色(e.source, STCD_RESULT.detailKey, d);
    });
  }).then(function() { 生果渲染详情(); }).catch(function(err) { console.error('[生图成果] 删除小类失败', err); });
};

// ===== 版本组（类别）操作 =====
window.生果新建版本组 = function(catKey, si) {
  生果命名弹窗('新建类别', '类别名称，如：一般 / 精修', '', function(name) {
    if (!name) return;
    var e = STCD_RESULT.entries[STCD_RESULT.detailKey];
    if (!e) return;
    生果读取角色(e.source, STCD_RESULT.detailKey).then(function(d) {
      var sb = d && d.cats && d.cats[catKey] && d.cats[catKey][si];
      if (!sb) return;
      if (!sb.groups) sb.groups = [];
      var g = 生果空版本组();
      g.name = name;
      sb.groups.push(g);
      return 生果保存角色(e.source, STCD_RESULT.detailKey, d);
    }).then(function() { 生果渲染详情(); }).catch(function(err) { console.error('[生图成果] 新建类别失败', err); });
  });
};

window.生果重命名版本组 = function(catKey, si, gi) {
  var e = STCD_RESULT.entries[STCD_RESULT.detailKey];
  if (!e) return;
  生果读取角色(e.source, STCD_RESULT.detailKey).then(function(d) {
    var sb = d && d.cats && d.cats[catKey] && d.cats[catKey][si];
    var g = sb && sb.groups && sb.groups[gi];
    if (!g) return;
    生果命名弹窗('重命名类别', '类别名称', g.name || '', function(name) {
      if (!name) return;
      g.name = name;
      生果保存角色(e.source, STCD_RESULT.detailKey, d).then(function() { 生果渲染详情(); });
    });
  });
};

window.生果删除版本组 = function(catKey, si, gi) {
  if (!confirm('删除该类别及其全部图片？')) return;
  var e = STCD_RESULT.entries[STCD_RESULT.detailKey];
  if (!e) return;
  生果读取角色(e.source, STCD_RESULT.detailKey).then(function(d) {
    var sb = d && d.cats && d.cats[catKey] && d.cats[catKey][si];
    var g = sb && sb.groups && sb.groups[gi];
    if (!g) return;
    var dels = [];
    (g.versions || []).forEach(function(v) {
      if (v.file) dels.push(LocalFS['delete'](生果角色目录(e.source, e.dir) + v.file).catch(function() {}));
      (v.variants || []).forEach(function(vr) {
        if (vr.file) dels.push(LocalFS['delete'](生果角色目录(e.source, e.dir) + vr.file).catch(function() {}));
      });
    });
    return Promise.all(dels).then(function() {
      sb.groups.splice(gi, 1);
      return 生果保存角色(e.source, STCD_RESULT.detailKey, d);
    });
  }).then(function() { 生果渲染详情(); }).catch(function(err) { console.error('[生图成果] 删除类别失败', err); });
};

// ===== 版本操作 =====
window.生果新建版本 = function(catKey, si, gi) {
  var e = STCD_RESULT.entries[STCD_RESULT.detailKey];
  if (!e) return;
  生果命名弹窗('新建版本', '版本名称，如：真人版 / 动漫版', '', function(name) {
    if (!name) return;
    生果读取角色(e.source, STCD_RESULT.detailKey).then(function(d) {
      var sb = d && d.cats && d.cats[catKey] && d.cats[catKey][si];
      var g = sb && sb.groups && sb.groups[gi];
      if (!g) return;
      if (!g.versions) g.versions = [];
      g.versions.push({ name: name, file: null });
      return 生果保存角色(e.source, STCD_RESULT.detailKey, d);
    }).then(function() { 生果渲染详情(); }).catch(function(err) { console.error('[生图成果] 新建版本失败', err); });
  });
};

window.生果重命名版本 = function(catKey, si, gi, vi) {
  var e = STCD_RESULT.entries[STCD_RESULT.detailKey];
  if (!e) return;
  生果读取角色(e.source, STCD_RESULT.detailKey).then(function(d) {
    var sb = d && d.cats && d.cats[catKey] && d.cats[catKey][si];
    var g = sb && sb.groups && sb.groups[gi];
    var v = g && g.versions && g.versions[vi];
    if (!v) return;
    生果命名弹窗('重命名版本', '版本名称', v.name || '', function(name) {
      if (!name) return;
      v.name = name;
      生果保存角色(e.source, STCD_RESULT.detailKey, d).then(function() { 生果渲染详情(); });
    });
  });
};

window.生果删除版本 = function(catKey, si, gi, vi) {
  if (!confirm('删除该版本？')) return;
  var e = STCD_RESULT.entries[STCD_RESULT.detailKey];
  if (!e) return;
  生果读取角色(e.source, STCD_RESULT.detailKey).then(function(d) {
    var sb = d && d.cats && d.cats[catKey] && d.cats[catKey][si];
    var g = sb && sb.groups && sb.groups[gi];
    var v = g && g.versions && g.versions[vi];
    if (!v) return;
    var del = v.file ? LocalFS['delete'](生果角色目录(e.source, e.dir) + v.file).catch(function() {}) : Promise.resolve();
    // 一并删除该版本下的全部变体图
    (v.variants || []).forEach(function(vr) {
      if (vr.file) del = del.then(function() { return LocalFS['delete'](生果角色目录(e.source, e.dir) + vr.file).catch(function() {}); });
    });
    return del.then(function() {
      g.versions.splice(vi, 1);
      return 生果保存角色(e.source, STCD_RESULT.detailKey, d);
    });
  }).then(function() { 生果渲染详情(); }).catch(function(err) { console.error('[生图成果] 删除版本失败', err); });
};

// ===== 变体操作（每个版本可挂多个特殊版本，如真人版；树状显示在主版本之后）=====
// 新建变体：默认名称「真人版」，可改
window.生果新建变体 = function(catKey, si, gi, vi) {
  var e = STCD_RESULT.entries[STCD_RESULT.detailKey];
  if (!e) return;
  生果命名弹窗('新建变体', '变体名称，默认：真人版（该图的特殊版本）', '真人版', function(name) {
    if (!name) return;
    生果读取角色(e.source, STCD_RESULT.detailKey).then(function(d) {
      var sb = d && d.cats && d.cats[catKey] && d.cats[catKey][si];
      var g = sb && sb.groups && sb.groups[gi];
      var v = g && g.versions && g.versions[vi];
      if (!v) return;
      if (!v.variants) v.variants = [];
      v.variants.push({ name: name, file: null });
      return 生果保存角色(e.source, STCD_RESULT.detailKey, d);
    }).then(function() { 生果渲染详情(); }).catch(function(err) { console.error('[生图成果] 新建变体失败', err); });
  });
};

window.生果重命名变体 = function(catKey, si, gi, vi, ri) {
  var e = STCD_RESULT.entries[STCD_RESULT.detailKey];
  if (!e) return;
  生果读取角色(e.source, STCD_RESULT.detailKey).then(function(d) {
    var sb = d && d.cats && d.cats[catKey] && d.cats[catKey][si];
    var g = sb && sb.groups && sb.groups[gi];
    var v = g && g.versions && g.versions[vi];
    var vr = v && v.variants && v.variants[ri];
    if (!vr) return;
    生果命名弹窗('重命名变体', '变体名称', vr.name || '', function(name) {
      if (!name) return;
      vr.name = name;
      生果保存角色(e.source, STCD_RESULT.detailKey, d).then(function() { 生果渲染详情(); });
    });
  });
};

window.生果删除变体 = function(catKey, si, gi, vi, ri) {
  if (!confirm('删除该变体及其图片？')) return;
  var e = STCD_RESULT.entries[STCD_RESULT.detailKey];
  if (!e) return;
  生果读取角色(e.source, STCD_RESULT.detailKey).then(function(d) {
    var sb = d && d.cats && d.cats[catKey] && d.cats[catKey][si];
    var g = sb && sb.groups && sb.groups[gi];
    var v = g && g.versions && g.versions[vi];
    var vr = v && v.variants && v.variants[ri];
    if (!vr) return;
    var del = vr.file ? LocalFS['delete'](生果角色目录(e.source, e.dir) + vr.file).catch(function() {}) : Promise.resolve();
    return del.then(function() {
      v.variants.splice(ri, 1);
      return 生果保存角色(e.source, STCD_RESULT.detailKey, d);
    });
  }).then(function() { 生果渲染详情(); }).catch(function(err) { console.error('[生图成果] 删除变体失败', err); });
};

// ===== 版本图上传 / 删除（variantIdx 可选：-1/缺省 = 主版本，>=0 = 变体）=====
// 公共上传逻辑：按钮选择与拖拽上传共用（file 为 File 对象）
function 生果保存版本文件(e, catKey, si, gi, vi, file, variantIdx) {
  if (!e) { toast('角色不存在'); return; }
  var source = e.source;
  var reader = new FileReader();
  reader.onload = function(e2) {
    var dataUrl = e2.target.result || '';
    var m = dataUrl.match(/^data:image\/([a-zA-Z+]+);base64,(.*)$/);
    if (!m) { toast('仅支持图片文件'); return; }
    var ext = m[1].toLowerCase() === 'jpeg' ? 'jpg' : m[1].toLowerCase();
    var relPath = 生果角色目录(source, e.dir) + catKey + '-' + Date.now() + (variantIdx >= 0 ? '-v' + variantIdx : '') + '.' + ext;
    LocalFS.saveBinary(relPath, m[2]).then(function() {
      return 生果读取角色(source, STCD_RESULT.detailKey).then(function(d) {
        if (!d) d = 生果空数据();
        var sb = d.cats && d.cats[catKey] && d.cats[catKey][si];
        var g = sb && sb.groups && sb.groups[gi];
        var v = g && g.versions && g.versions[vi];
        if (!v) throw new Error('版本不存在');
        if (variantIdx >= 0) {
          if (!v.variants) v.variants = [];
          var vr = v.variants[variantIdx];
          if (!vr) throw new Error('变体不存在');
          vr.file = relPath.split('/').pop();
        } else {
          v.file = relPath.split('/').pop();
        }
        return 生果保存角色(source, STCD_RESULT.detailKey, d);
      });
    }).then(function() {
      toast('已保存');
      生果渲染详情();
    }).catch(function(err) {
      console.error('[生图成果] 上传失败', err);
      toast('保存失败');
    });
  };
  reader.onerror = function() { toast('读取文件失败'); };
  reader.readAsDataURL(file);
}

window.生果上传版本 = function(catKey, si, gi, vi, variantIdx) {
  var e = STCD_RESULT.entries[STCD_RESULT.detailKey];
  if (!e) { toast('角色不存在'); return; }
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.display = 'none';
  document.body.appendChild(input);
  input.addEventListener('change', function(ev) {
    var file = ev.target.files && ev.target.files[0];
    document.body.removeChild(input);
    if (!file) return;
    生果保存版本文件(e, catKey, si, gi, vi, file, variantIdx);
  });
  input.click();
};

window.生果删除版本图 = function(catKey, si, gi, vi, variantIdx) {
  if (!confirm('删除这张图片？')) return;
  var e = STCD_RESULT.entries[STCD_RESULT.detailKey];
  if (!e) return;
  var source = e.source;
  生果读取角色(source, STCD_RESULT.detailKey).then(function(d) {
    var sb = d && d.cats && d.cats[catKey] && d.cats[catKey][si];
    var g = sb && sb.groups && sb.groups[gi];
    var v = g && g.versions && g.versions[vi];
    if (!v) return;
    var target = v;
    if (variantIdx >= 0) {
      if (!v.variants) v.variants = [];
      target = v.variants[variantIdx];
    }
    if (!target || !target.file) return;
    var fname = target.file;
    target.file = null;
    var del = LocalFS['delete'](生果角色目录(source, e.dir) + fname).catch(function() {});
    return del.then(function() { return 生果保存角色(source, STCD_RESULT.detailKey, d); });
  }).then(function() {
    toast('已删除');
    生果渲染详情();
  }).catch(function(err) { console.error('[生图成果] 删除图片失败', err); });
};

// ===== 预览 =====
window.生果预览 = function(url) {
  var h = '<div class="mcard" style="max-width:640px">';
  h += '<img src="' + url + '" style="max-width:100%;max-height:72vh;border-radius:6px;border:1px solid var(--border);object-fit:contain" />';
  h += '<div style="text-align:right;margin-top:8px"><button class="btn-out" onclick="this.closest(\'.ovl\').remove()">关闭</button></div>';
  h += '</div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
};

// ===== 路由注册 =====
registerPageRoute('sheng-tu-cheng-guo', function(e) {
  渲染生图成果(e);
});

window.渲染生图成果 = 渲染生图成果;
window.STCD_RESULT = STCD_RESULT;


// ===== 生图成果 · 灵感角色库 下钻（典型场景），点角色 → 打开成果详情 =====
// 分区：世界观 / 典型场景 / 典型角色；当前重点复用「典型场景」树（stcdInspireSceneDetail + onPickName）
function 生果渲染灵感下钻(el) {
  var sc = STCD_RESULT.inspSubScope || 'scene';
  var h = '';
  h += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px">';
  [['world','🌌 世界观'],['scene','🗺️ 典型场景'],['char','👤 典型角色']].forEach(function(s) {
    var on = sc === s[0];
    h += '<span class="sub-nav-item' + (on ? ' act' : '') + '" style="font-size:11px;padding:3px 10px" onclick="生果灵感切分区(\'' + s[0] + '\')">' + s[1] + '</span>';
  });
  h += '</div>';
  if (sc === 'scene') {
    h += 生果灵感场景区();
  } else if (sc === 'world') {
    h += 生果灵感世界观区();
  } else {
    h += 生果灵感角色区('典型角色/');
  }
  el.innerHTML = h;
}

// ===== 世界观区：已导入世界 → 逐级下钻（复用导入角色弹窗 stcdCharPickerWorldBrowse 机制）=====
// 顶层级显示「已导入世界」卡片；点开某世界 → 沿用 STCD_CHAR_PICKER.path 式下钻（分段 chips → 该节点下所有角色）。
// 点角色卡 → 直接打开该角色生图成果详情。
function 生果灵感世界观区() {
  // 确保「已导入的世界」列表已从磁盘加载（否则重启/首次打开「世界观」时一直显示「暂无已导入世界」）
  if (typeof stcdInspire导入世界观加载 === 'function' && !STCD_RESULT._inspWorldLoaded) {
    STCD_RESULT._inspWorldLoaded = true;
    var _wp = stcdInspire导入世界观加载();
    if (_wp && typeof _wp.then === 'function') {
      _wp.then(function() { 生果渲染灵感下钻(document.getElementById('sheng-tu-cheng-guo-body')); });
    }
  }
  var items = STCD_RESULT.inspires || [];
  var path = STCD_RESULT.inspWorldPath || [];
  var h = '';
  // 面包屑（非顶层时显示 返回 + 已选分段）
  if (path.length) {
    h += '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px">';
    h += '<button class="btn-out" style="padding:1px 8px;font-size:10px" onclick="生果灵感世界返回()">‹ 返回</button>';
    path.forEach(function(seg, i) {
      h += '<span style="font-size:11px;color:var(--fg3)">›</span>';
      h += '<span style="font-size:11px;color:var(--fg);font-weight:600;cursor:pointer;text-decoration:underline;text-decoration-style:dotted" onclick="生果灵感世界路径(' + i + ',\'\')">' + escHtml(seg) + '</span>';
    });
    h += '</div>';
  }
  if (path.length === 0) {
    // 顶层：已导入世界卡片（与灵感角色库/导入角色弹窗一致，只显示已导入世界）
    var worlds = (window.STCD_INSPIRE_IMPORT_LIST && window.STCD_INSPIRE_IMPORT_LIST.length) ? window.STCD_INSPIRE_IMPORT_LIST : [];
    var worldNames = worlds.map(function(w) { return (w && w.世界名) || ''; }).filter(Boolean);
    if (!worldNames.length) {
      return '<div style="font-size:11px;color:var(--fg3);padding:24px 0;text-align:center">暂无已导入世界——请先到「角色卡 → 灵感角色库 → 世界观」导入世界</div>';
    }
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px">';
    worldNames.forEach(function(w) {
      var cnt = items.filter(function(it) { return (it.category || '').indexOf('世界观/' + w + '/') === 0; }).length;
      h += '<div style="border:1px solid var(--border);border-radius:12px;padding:12px;cursor:pointer;background:var(--bg2)" onclick="生果灵感世界路径(0,\'' + w + '\')">';
      h += '<div style="font-size:20px;line-height:1;margin-bottom:6px">🌍</div>';
      h += '<div style="font-size:13px;font-weight:700;margin-bottom:3px">' + escHtml(w) + '</div>';
      h += '<div style="font-size:10px;color:var(--fg3)">' + cnt + ' 角色</div>';
      h += '</div>';
    });
    h += '</div>';
    return h;
  }
  // 下钻层：下一层可下钻分段 + 该节点下所有角色（含更深层级）
  var segList = (typeof stcdInspirePickWorldNextSegs === 'function') ? stcdInspirePickWorldNextSegs(items, path) : [];
  if (segList.length) {
    h += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">';
    segList.forEach(function(s) {
      h += '<span class="tag-chip" style="cursor:pointer;font-size:10px;padding:2px 8px" onclick="生果灵感世界路径(' + path.length + ',\'' + s + '\')">' + escHtml(s) + ' ›</span>';
    });
    h += '</div>';
  }
  var under = (typeof stcdInspirePickWorldChars === 'function') ? stcdInspirePickWorldChars(items, path) : [];
  if (under.length) {
    h += 生果灵感角色卡排(under);
  }
  if (!segList.length && !under.length) {
    h += '<div style="font-size:11px;color:var(--fg3);padding:24px 0;text-align:center">该层级暂无角色</div>';
  }
  return h;
}

// 世界观下钻路径跳转：idx 为在路径中的层位，val 为节点名（'' = 截断到该层，即点面包屑回跳）
function 生果灵感世界路径(idx, val) {
  var p = (STCD_RESULT.inspWorldPath || []).slice(0, idx);
  if (val) p[idx] = val;
  STCD_RESULT.inspWorldPath = p;
  生果渲染灵感下钻(document.getElementById('sheng-tu-cheng-guo-body'));
}
function 生果灵感世界返回() {
  STCD_RESULT.inspWorldPath = (STCD_RESULT.inspWorldPath || []).slice(0, STCD_RESULT.inspWorldPath.length - 1);
  生果渲染灵感下钻(document.getElementById('sheng-tu-cheng-guo-body'));
}

// 典型角色分区：列出 category 以「典型角色/」开头的角色卡，点击角色卡 → 直接打开该角色生图成果详情
function 生果灵感角色区(prefix) {
  var items = (STCD_RESULT.inspires || []).filter(function(it) {
    return (it.category || '').indexOf(prefix) === 0;
  });
  if (!items.length) {
    return '<div style="font-size:11px;color:var(--fg3);padding:24px 0;text-align:center">该分区暂无典型角色——请先到「角色卡 → 灵感角色库 → 典型角色」创作一个</div>';
  }
  var h = '<div style="font-size:12px;font-weight:700;color:var(--fg);margin-bottom:8px">已生成 ' + items.length + ' 个典型角色</div>';
  h += 生果灵感角色卡排(items);
  return h;
}

function 生果灵感角色卡排(items) {
  var order = ['normal', 'cool', 'deep'];
  var h = '<div style="display:flex;flex-wrap:wrap;gap:8px">';
  items.forEach(function(it) {
    var name = (typeof stcdInspireDisplayName === 'function') ? stcdInspireDisplayName(it) : (it.name || '未命名');
    var thumb = null;
    if (it.avatars) { for (var i = 0; i < order.length; i++) if (it.avatars[order[i]]) { thumb = it.avatars[order[i]]; break; } }
    var info = it.category || '';
    h += '<div style="width:150px;background:var(--card);border:1px solid var(--border);border-radius:8px;cursor:pointer;flex-shrink:0;overflow:hidden;display:flex;flex-direction:column" onclick="生果从场景选角色(\'' + it.id + '\')">';
    h += '<div style="width:100%;aspect-ratio:3/4;background:var(--bg2);overflow:hidden;position:relative">';
    h += thumb ? '<img src="' + thumb + '" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.style.display=\'none\'" />' : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--fg3);font-size:26px">🖼</div>';
    h += '</div>';
    h += '<div style="padding:5px 7px">';
    h += '<div style="font-size:11px;color:var(--fg);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(name) + '</div>';
    if (info) h += '<div style="font-size:9px;color:var(--fg3);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(info) + '</div>';
    h += '</div></div>';
  });
  h += '</div>';
  return h;
}

function 生果灵感切分区(sc) { STCD_RESULT.inspSubScope = sc; STCD_RESULT.inspSceneId = null; STCD_RESULT.inspWorldPath = []; 生果渲染灵感下钻(document.getElementById('sheng-tu-cheng-guo-body')); }

function 生果灵感场景区() {
  var h = '';
  if (STCD_RESULT.inspSceneId) {
    var scene = null;
    var scs = (window.stcdScenes && window.stcdScenes.scenes) || [];
    for (var i = 0; i < scs.length; i++) { if (scs[i].id === STCD_RESULT.inspSceneId) { scene = scs[i]; break; } }
    h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap">';
    h += '<button class="btn-out" style="padding:2px 10px;font-size:11px" onclick="生果灵感场景返回()">← 场景列表</button>';
    h += '<div style="font-size:13px;font-weight:700;color:var(--fg);flex:1">🗺️ ' + (scene ? (escHtml(scene.org||'') + ' · ' + escHtml(scene.name)) : '场景') + '</div>';
    h += '<span style="font-size:10px;color:var(--fg3)">点角色卡打开成果</span>';
    h += '</div>';
    h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:4px 2px 4px;">';
    h += '<div style="transform:scale(0.82);transform-origin:top left;width:calc(100%/0.82)">';
    if (scene && typeof window.stcdInspireSceneDetail === 'function') h += window.stcdInspireSceneDetail(scene, '生果从场景选角色', { readOnly: true });
    else h += '<div style="font-size:11px;color:var(--fg3);padding:20px;text-align:center">场景树组件未加载</div>';
    h += '</div></div>';
  } else {
    var scs = (window.stcdScenes && window.stcdScenes.scenes) || [];
    if (!scs.length) {
      h += '<div style="font-size:11px;color:var(--fg3);padding:24px 0;text-align:center">暂无典型场景——请先到「角色卡 → 灵感角色库 → 典型场景」创建/导入场景</div>';
      return h;
    }
    h += '<div style="display:flex;flex-wrap:wrap;gap:10px">';
    scs.forEach(function(s) {
      var 标题 = (s.org ? escHtml(s.org) + ' · ' : '') + escHtml(s.name);
      h += '<div style="flex:1;min-width:200px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;cursor:pointer" onclick="生果灵感场景打开(\'' + s.id + '\')">';
      h += '<div style="font-size:14px;font-weight:700;color:var(--fg);margin-bottom:4px">🗺️ ' + 标题 + '</div>';
      h += '<div style="font-size:10px;color:var(--fg3);line-height:1.5">' + (s.desc ? escHtml(s.desc) : '暂无简介') + '</div>';
      h += '</div>';
    });
    h += '</div>';
  }
  return h;
}

function 生果灵感场景打开(id) { STCD_RESULT.inspSceneId = id; 生果渲染灵感下钻(document.getElementById('sheng-tu-cheng-guo-body')); }
function 生果灵感场景返回() { STCD_RESULT.inspSceneId = null; 生果渲染灵感下钻(document.getElementById('sheng-tu-cheng-guo-body')); }

// 点角色卡 → 找该灵感角色 → 打开其生图成果详情
function 生果从场景选角色(refRoleId) {
  var items = STCD_RESULT.inspires || [];
  var found = null;
  for (var i = 0; i < items.length; i++) { if (items[i].id === refRoleId) { found = items[i]; break; } }
  if (!found) { toast('角色不存在'); return; }
  var name = (typeof stcdInspireDisplayName === 'function') ? stcdInspireDisplayName(found) : (found.name || '未命名');
  var key = 生果灵感Key(found);
  生果确保条目('inspire', key, name, { id: found.id });
  生果打开详情(key);
}

window.生果渲染灵感下钻 = 生果渲染灵感下钻;
window.生果灵感切分区 = 生果灵感切分区;
window.生果灵感场景打开 = 生果灵感场景打开;
window.生果灵感场景返回 = 生果灵感场景返回;
window.生果从场景选角色 = 生果从场景选角色;
window.生果灵感世界路径 = 生果灵感世界路径;
window.生果灵感世界返回 = 生果灵感世界返回;
