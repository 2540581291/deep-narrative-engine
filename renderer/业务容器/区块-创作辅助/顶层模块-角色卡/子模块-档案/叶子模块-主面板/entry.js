// 深度-叙事引擎 · 角色档案完整弹窗组件
// 独立于业务模块，任何地方调 显示角色档案(data) 打开统一弹窗。
// 依赖子模块-档案/labels.js（CHAR_LABELS）

// 品级边框 class
function 品级边框(r) {
  var m = { '金': 'rarity-bd-legendary', '紫': 'rarity-bd-epic', '蓝': 'rarity-bd-rare', '绿': 'rarity-bd-uncommon', '白': 'rarity-bd-common' };
  return m[r] || '';
}

// 性别前缀映射
var 性别前缀映射 = { female: 'chF', male: 'chM', femboy: 'chFB', futa: 'chFT' };

// 标签翻译：回退到 key 的最后一段
function t(key) { return CHAR_LABELS[key] || key; }

// ===== 14 节段落配对 =====
// dataKey: 角色数据中的字段名  labelKey: CHAR_LABELS 中的前缀段（可能与 dataKey 不同）
var 段落配对 = [
  { left: { title: '一·身份',        dataKey: 'identity',           labelKey: 'identity' },
    right:{ title: '四·性特征',      dataKey: 'sexOrgans',          labelKey: 'sexOrgans' } },
  { left: { title: '二·外貌',        dataKey: 'appearance',         labelKey: 'appearance' },
    right:{ title: '五·性能力',      dataKey: 'sexualCapability',   labelKey: 'sexualCapability' } },
  { left: { title: '三·衣着',        dataKey: 'attire',             labelKey: 'attire' },
    right:{ title: '六·性历史',      dataKey: 'sexualHistory',      labelKey: 'sexualHistory' } },
  { left: { title: '七·首次记录',    dataKey: 'firstRecords',       labelKey: 'firstRecords' },
    right:{ title: '八·性偏好',      dataKey: 'sexualPreferences',  labelKey: 'sexualPreferences' } },
  { left: { title: '九·生殖健康',    dataKey: 'reproductiveHealth', labelKey: 'reproductiveHealth' },
    right:{ title: '十·身体健康',    dataKey: 'physicalHealth',      labelKey: 'physicalHealth' } },
  { left: { title: '十一·性格言行',  dataKey: 'personality',        labelKey: 'personality' },
    right:{ title: '十二·状态与契约', dataKey: 'statusContract',     labelKey: 'statusContract' } },
  { left: { title: '十三·属性',      dataKey: 'attributes',         labelKey: 'attributes', statMode: true },
    right:{ title: '十四·后台',      dataKey: 'meta',               labelKey: 'meta' } },
];

function 显示角色档案(entry) {
  // 兼容两种调用方式：
  //   1) 传入 entry 包装对象 { fullChar, outline, ... }（角色库 btn onclick 传入）
  //   2) 直接传入角色数据裸对象 { identity, appearance, ... }
  if (!entry) { if (window.toast) window.toast('没有角色数据'); return; }
  var c = (entry.fullChar || entry.outline || entry);
  if (c !== entry && !c) { if (window.toast) window.toast('没有角色数据'); return; }

  var rb = 品级边框((c.identity && c.identity.basicInfo && c.identity.basicInfo.rarity) || '');
  var h = 角色档案HTML(c);

  // 注入到 modalBox / modalOverlay
  var box = document.getElementById('modalBox');
  var ovl = document.getElementById('modalOverlay');
  if (box && ovl) {
    box.innerHTML = h;
    box.style.maxWidth = '800px';
    box.style.maxHeight = '92vh';
    box.style.padding = '0';
    box.style.overflowY = 'auto';
    if (rb) box.className = 'mcard ' + rb; else box.className = 'mcard';
    ovl.className = 'ovl';
    ovl.style.removeProperty('display');
    ovl.onclick = function(e) { if (e.target === ovl) { ovl.style.display = 'none'; } };
  }
}

// 生成角色档案的完整 HTML 字符串（供浮窗与「今日角色」内联复用）
// opts.stickyChrome=true（默认，浮窗模式）时头像栏随容器吸附顶部；false（内联模式）时不吸顶
function 角色档案HTML(entry, opts) {
  opts = opts || {};
  var c = (entry && (entry.fullChar || entry.outline || entry)) || entry;
  if (!c) return '';

  var gender = 检测性别(c);
  var ident = c.identity && c.identity.basicInfo || {};
  var bg = c.identity && c.identity.background || {};
  var name = ident.name || '未知';
  var roleLabel = ident.role || '';
  var prefix = 性别前缀映射[gender] || 'chF';
  var sticky = opts.stickyChrome !== false;

  var h = '';
  // 顶部头像栏
  h += '<div style="' + (sticky ? 'position:sticky;top:0;' : '') + 'background:var(--bg);z-index:1;padding:14px 18px 10px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px">';
  h += '<div style="font-size:36px">' + (ident.icon || '👤') + '</div>';
  h += '<div class="flex-1">';
  h += '<div style="font-size:16px;color:var(--cream);font-weight:bold">' + escHtml(name) + '</div>';
  h += '<div style="font-size:11px;color:var(--cream)">' + escHtml(ident.title || '') + '</div>';
  h += '<div style="font-size:10px;color:var(--text-dim);margin-top:1px">' + [roleLabel, ident.age ? ident.age+'岁' : '', ident.gender, ident.race, bg.origin].filter(Boolean).join(' · ') + '</div>';
  if (c.meta && c.meta.tags && c.meta.tags.length) {
    h += '<div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:4px">';
    c.meta.tags.forEach(function(tag) { h += '<span class="tag tag-gold" style="font-size:9px;padding:1px 5px">' + escHtml(tag) + '</span>'; });
    h += '</div>';
  }
  h += '</div>';
  h += '</div>';

  // 两栏内容（grid 布局）
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px 16px">';
  for (var i = 0; i < 段落配对.length; i++) {
    var pair = 段落配对[i];
    var l = pair.left, r = pair.right;
    h += rowCols(
      l.title, 渲染段落(c, l, prefix) || '<div class="c-text-dim fs-italic">无信息</div>',
      r.title, 渲染段落(c, r, prefix) || '<div class="c-text-dim fs-italic">无信息</div>'
    );
  }
  h += '</div>';

  return h;
}
window.角色档案HTML = 角色档案HTML;

function 渲染段落(c, def, prefix) {
  var data = c[def.dataKey];
  if (!data) return null;
  var labelPrefix = prefix + '.' + def.labelKey;
  return 渲染容器(data, labelPrefix, def.statMode ? { statMode: true } : {});
}

// 性别检测：仅检查 identity.basicInfo.gender
function 检测性别(c) {
  if (c.identity && c.identity.basicInfo && c.identity.basicInfo.gender) {
    var g = c.identity.basicInfo.gender;
    if (g === '女性') return 'female';
    if (g === '男性') return 'male';
    if (g === '伪娘') return 'femboy';
    if (g === '扶她') return 'futa';
  }
  return 'female';
}

// ===== 布局辅助 =====

function col(c2) { return '<div style="display:flex;flex-direction:column;gap:8px;min-width:0">' + c2 + '</div>'; }
function leftCol(t, c2) { return col(blk(t, c2 || '<div class="c-text-dim fs-italic">无信息</div>')); }
function rightCol(t, c2) { return col(blk(t, c2 || '<div class="c-text-dim fs-italic">无信息</div>')); }
function rowCols(t1, c1, t2, c2) { return leftCol(t1, c1) + rightCol(t2, c2); }
function blk(t, c2) { return '<div class="n-card m-0" style="padding:8px 10px;font-size:11px;line-height:1.6;word-break:break-word"><div class="fs-12 fw-600 c-fg mb-4">' + t + '</div>' + c2 + '</div>'; }
function sub(t) { return '<div class="my-1 p-2-6 bg-accent-dim fw-600 c-fg fs-11">' + t + '</div>'; }

function pf(label, value) {
  if (value === true) return '<div class="my-1"><span class="c-fg3">' + label + '：</span>✅</div>';
  if (value === false) return '<div class="my-1"><span class="c-fg3">' + label + '：</span>❌</div>';
  if (value == null || value === '') return '<div class="my-1"><span class="c-fg3">' + label + '：</span><span class="c-fg3">无</span></div>';
  return '<div class="my-1"><span class="c-fg3">' + label + '：</span>' + escHtml(String(value)) + '</div>';
}
function pfArr(label, arr, fullKey) {
  if (!arr) return '';
  if (typeof arr === 'string') return pf(label, arr);
  if (!arr.length) return '';
  // 性爱明细：每条独立成行（1234 逐条分行显示）
  if (fullKey && /\.sexualDetails$/.test(fullKey)) {
    return '<div class="my-1"><span class="c-fg3">' + label + '：</span>' + arr.map(function(x) { return escHtml(String(x)); }).join('<br>') + '</div>';
  }
  return pf(label, arr.join('、'));
}
function pfStatBar(label, val, max) {
  if (val == null) return '';
  max = max || 100;
  var pct = Math.min(val / max * 100, 100);
  return '<div style="margin:1px 0;display:flex;align-items:center;gap:6px"><span style="color:var(--text-dim);min-width:28px;flex-shrink:0">' + label + '</span><span style="color:var(--cream);min-width:18px;text-align:right;font-weight:600">' + val + '</span><div style="flex:1;height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden"><div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--gold-dim),var(--gold-bright));border-radius:2px"></div></div></div>';
}

// ===== 遍历式渲染引擎 =====
// 渲染容器(data, i18nPrefix, opts)
//   data —— 模板数据片段（如 c.identity）
//   i18nPrefix —— CHAR_LABELS 中的路径前缀（如 'chF.identity'）
//   引擎遍历 data 的所有 key，对每个 key：
//     - 如果 labels 中有对应的 _title → 渲染 sub header，递归进入
//     - 如果是标准包装对象 {has,desc}/{count,desc}/{partner,desc} → 自动渲染
//     - 如果是数组 → pfArr
//     - 如果是裸对象（无 _title、非包装）→ 原地展开字段
//     - 否则 → pf 或 pfStatBar（statMode 开启时）

function 渲染容器(data, i18nPrefix, opts) {
  opts = opts || {};
  var r = '';
  for (var key in data) {
    if (!data.hasOwnProperty(key)) continue;
    var val = data[key];
    var fullKey = i18nPrefix + '.' + key;
    var label = t(fullKey);
    var titleKey = fullKey + '._title';
    var title = t(titleKey);
    var isContainer = (title !== titleKey);

    if (isContainer) {
      r += sub(title);
      if (Array.isArray(val)) {
        r += '<div class="my-1">' + escHtml(val.join('、')) + '</div>';
      } else if (typeof val === 'object' && val !== null) {
        r += 渲染容器(val, fullKey, opts);
      } else if (val === true) {
        r += '<div class="my-1">✅</div>';
      } else if (val === false) {
        r += '<div class="my-1">❌</div>';
      } else if (val == null || val === '') {
        r += '<div style="margin:1px 0;color:var(--text-dim-muted)">无</div>';
      } else {
        r += '<div class="my-1">' + escHtml(String(val)) + '</div>';
      }
      continue;
    }

    if (val != null && typeof val === 'object') {
      if (Array.isArray(val)) {
        r += pfArr(label, val, fullKey);
        continue;
      }
      // 标准包装对象检测
      var keys = Object.keys(val);
      if (keys.length <= 3) {
        if (keys.indexOf('has') !== -1 && keys.indexOf('desc') !== -1) {
          r += val.has ? pf(label, val.desc ? '✅ · ' + val.desc : '✅') : pf(label, false);
          continue;
        }
        if (keys.indexOf('count') !== -1 && keys.indexOf('desc') !== -1) {
          r += pf(label, (val.count != null ? String(val.count) : '0') + (val.desc ? ' · ' + val.desc : ''));
          continue;
        }
        if (keys.indexOf('partner') !== -1 && keys.indexOf('desc') !== -1) {
          r += pf(label, [val.partner, val.desc].filter(Boolean).join(' · ') || null);
          continue;
        }
      }
      // 非包装子对象 → 原地展开
      r += 渲染容器(val, fullKey, opts);
      continue;
    }

    // 叶子值：优先查 unit 后缀
    if (CHAR_LABELS[fullKey + '.unit'] != null && val != null) {
      val = String(val) + CHAR_LABELS[fullKey + '.unit'];
    }

    if (opts.statMode && typeof val === 'number') {
      r += pfStatBar(label, val, 100);
    } else {
      r += pf(label, val);
    }
  }
  return r;
}

function 渲染属性容器(data, i18nPrefix) {
  return 渲染容器(data, i18nPrefix, { statMode: true });
}

// ===== 标签翻译 =====

function 中文标签(tag) {
  var map = {
    virgin: '处女', untrained: '未调教', trained: '已调教', high_value: '高价值',
    traumatized: '有创伤', royal: '王族', noble: '贵族', exotic: '异域',
    fertile: '易孕', beauty: '美人', seductive: '魅惑', innocent: '清纯',
    loyal: '忠诚', rebellious: '叛逆', broken: '击溃', brainwashed: '已洗脑',
    modified: '已改造', parasite: '寄宿中', pregnant: '怀孕中',
    child: '幼小', young: '年轻', adult: '成年', mature: '成熟', elderly: '年老',
    slave: '奴隶出身', worker: '员工出身', free: '自由出身',
    popular: '人气', local: '本地', prostitute: '妓女', experienced: '经验丰富',
    warrior: '战士', wild: '野性', unbroken: '未驯服', foreign: '异邦', dangerous: '危险',
    dancer: '舞者', flirty: '轻挑', 'free-spirited': '自由奔放',
    assassin: '刺客', cold: '冷漠', hired: '受雇',
    perfect: '完美品', expensive: '昂贵', submissive: '顺从',
    widow: '寡妇', business: '商人', smoker: '烟枪',
    orphan: '孤儿', dirty: '脏兮', undernourished: '营养不良',
    peasant: '农女', rural: '乡下', healthy: '健康', untouched: '未染',
    delicate: '纤弱', educated: '有教养', fragile: '脆弱',
    rich: '富有', poor: '贫困', merchant: '商人', official: '官员',
    first_time: '初次', regular: '常客', drunkard: '酒鬼', violent: '暴力倾向',
    gentle: '温和', pervert: '变态', novice: '新手',
    generous: '大方', stingy: '吝啬', influential: '有势力',
    country: '乡下', city: '城里', runaway: '逃亡',
    scholar: '书生', criminal: '罪犯', black_market: '黑市', sadist: '施虐狂',
    'ex-prostitute': '前妓女',
  };
  return map[tag] || tag;
}

window.角色档案函数 = 显示角色档案;
window.角色档案降级 = window.显示角色档案;
window.显示角色档案 = 显示角色档案;
window.中文标签 = 中文标签;
window.渲染容器 = 渲染容器;
window.渲染属性容器 = 渲染属性容器;

// backward compat
window.showCharProfile = window.显示角色档案;
window.cnTag = window.中文标签;
window.renderContainer = window.渲染容器;
window.renderStatsContainer = window.渲染属性容器;
