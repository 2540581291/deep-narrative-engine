// 深度-叙事引擎 · 提示词全局函数（全局唯一入口）
// 所有提示词模块共用的全局函数，必须最先加载

var PROMPTS = {};

function registerPrompt(name, obj) {
  PROMPTS[name] = obj;
}

function renderPrompt(name, vars) {
  var p = PROMPTS[name];
  if (!p) return { system: '', user: '' };
  vars = vars || {};
  var result = { system: p.system || '', user: p.user || '' };
  Object.keys(vars).forEach(function(key) {
    var val = vars[key];
    if (val != null) {
      result.system = result.system.split('{' + key + '}').join(val);
      result.user = result.user.split('{' + key + '}').join(val);
    }
  });
  return result;
}

window.PROMPTS = PROMPTS;
window.registerPrompt = registerPrompt;
window.renderPrompt = renderPrompt;

// ===== 角色卡全局函数 =====

// 把数组/对象值转成可读文本
function 角色值转文本(v) {
  if (v == null) return '';
  if (Array.isArray(v)) return v.join('、');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

// 性别前缀映射（与角色卡档案渲染一致）
var 角色卡前缀表 = { female: 'chF', male: 'chM', femboy: 'chFB', futa: 'chFT' };

// 检测角色性别，返回前缀（与角色卡档案 检测性别 逻辑一致）
function 角色卡前缀(char) {
  var g = char && char.identity && char.identity.basicInfo && char.identity.basicInfo.gender;
  if (g === '女性') return 'chF';
  if (g === '男性') return 'chM';
  if (g === '伪娘') return 'chFB';
  if (g === '扶她') return 'chFT';
  return 'chF';
}

// 字段名翻译：优先查 CHAR_LABELS（角色卡档案翻译字典），查不到回退到 key 最后一段
function 角色字段翻译(prefix, path) {
  var fullKey = prefix + '.' + path;
  if (typeof CHAR_LABELS !== 'undefined' && CHAR_LABELS[fullKey]) return CHAR_LABELS[fullKey];
  var segs = String(path).split('.');
  return segs[segs.length - 1];
}

// 递归把角色卡对象格式化为「中文标签：值」文本
function 角色卡递归文本(char, prefix, root) {
  var lines = [];
  var 前缀 = 角色卡前缀(char);
  for (var key in root) {
    if (!root.hasOwnProperty(key)) continue;
    var val = root[key];
    var path = prefix ? (prefix + '.' + key) : key;
    var label = 角色字段翻译(前缀, path);
    var titleKey = 前缀 + '.' + path + '._title';
    var hasTitle = (typeof CHAR_LABELS !== 'undefined' && CHAR_LABELS[titleKey]);

    // 章节/分组标题（_title）→ 作为分组名输出
    if (hasTitle) {
      var 组名 = CHAR_LABELS[titleKey];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        var sub = 角色卡递归文本(char, path, val);
        if (sub) lines.push('【' + 组名 + '】\n' + sub);
      } else if (val != null && val !== '') {
        lines.push('【' + 组名 + '】' + 角色值转文本(val));
      }
      continue;
    }

    if (val && typeof val === 'object' && !Array.isArray(val)) {
      // 布尔/计数/事件包装对象
      var keys = Object.keys(val);
      if (keys.length <= 3 && keys.indexOf('has') !== -1 && keys.indexOf('desc') !== -1) {
        if (val.has) lines.push(label + '：' + (val.desc ? '是 · ' + 角色值转文本(val.desc) : '是'));
        continue;
      }
      if (keys.length <= 3 && keys.indexOf('count') !== -1 && keys.indexOf('desc') !== -1) {
        lines.push(label + '：' + (val.count != null ? String(val.count) : '0') + (val.desc ? ' · ' + 角色值转文本(val.desc) : ''));
        continue;
      }
      if (keys.length <= 3 && keys.indexOf('partner') !== -1 && keys.indexOf('desc') !== -1) {
        lines.push(label + '：' + [val.partner, val.desc].filter(Boolean).map(角色值转文本).join(' · '));
        continue;
      }
      // 非包装子对象 → 原地展开
      var sub2 = 角色卡递归文本(char, path, val);
      if (sub2) lines.push(sub2);
      continue;
    }

    if (Array.isArray(val)) {
      if (val.length) lines.push(label + '：' + 角色值转文本(val));
      continue;
    }

    if (val != null && val !== '' && val !== false && val !== 0) {
      lines.push(label + '：' + 角色值转文本(val));
    }
  }
  return lines.join('\n');
}

// ===== 函数1：角色卡 · 身份 =====
// 读取角色卡的 identity 部分（basicInfo + background + experience），中文标签格式化
// 内部函数：仅供 角色卡身份与外貌 复用，输出身份证（第一章 identity）
function 身份文本(char) {
  if (!char) return '';
  var 前缀 = 角色卡前缀(char);
  var parts = [];
  var bi = (char.identity && char.identity.basicInfo) || {};
  var bg = (char.identity && char.identity.background) || {};
  var exp = (char.identity && char.identity.experience) || {};

  if (bi.name) parts.push(角色字段翻译(前缀, 'identity.basicInfo.name') + '：' + bi.name);
  if (bi.title) parts.push(角色字段翻译(前缀, 'identity.basicInfo.title') + '：' + bi.title);
  if (bi.age) parts.push(角色字段翻译(前缀, 'identity.basicInfo.age') + '：' + bi.age);
  if (bi.race) parts.push(角色字段翻译(前缀, 'identity.basicInfo.race') + '：' + bi.race);
  if (bi.gender) parts.push(角色字段翻译(前缀, 'identity.basicInfo.gender') + '：' + bi.gender);
  if (bi.rarity) parts.push(角色字段翻译(前缀, 'identity.basicInfo.rarity') + '：' + bi.rarity);
  if (bi.role) parts.push(角色字段翻译(前缀, 'identity.basicInfo.role') + '：' + bi.role);
  if (bi.price) parts.push(角色字段翻译(前缀, 'identity.basicInfo.price') + '：' + bi.price);

  if (exp.currentOccupation) parts.push(角色字段翻译(前缀, 'identity.experience.currentOccupation') + '：' + exp.currentOccupation);
  if (bg.aura) parts.push(角色字段翻译(前缀, 'identity.background.aura') + '：' + bg.aura);
  if (bg.origin) parts.push(角色字段翻译(前缀, 'identity.background.origin') + '：' + bg.origin);
  if (bg.birthStatus) parts.push(角色字段翻译(前缀, 'identity.background.birthStatus') + '：' + bg.birthStatus);
  if (bg.family) parts.push(角色字段翻译(前缀, 'identity.background.family') + '：' + bg.family);
  if (bg.upbringing) parts.push(角色字段翻译(前缀, 'identity.background.upbringing') + '：' + bg.upbringing);
  if (bg.education) parts.push(角色字段翻译(前缀, 'identity.background.education') + '：' + bg.education);
  if (bg.skills && bg.skills.length) parts.push(角色字段翻译(前缀, 'identity.background.skills') + '：' + 角色值转文本(bg.skills));
  if (bg.talents && bg.talents.length) parts.push(角色字段翻译(前缀, 'identity.background.talents') + '：' + 角色值转文本(bg.talents));

  if (exp.timeline) parts.push(角色字段翻译(前缀, 'identity.experience.timeline') + '：' + exp.timeline);
  if (exp.lifeOverview) parts.push(角色字段翻译(前缀, 'identity.experience.lifeOverview') + '：' + exp.lifeOverview);
  if (exp.dailyLife) parts.push(角色字段翻译(前缀, 'identity.experience.dailyLife') + '：' + exp.dailyLife);
  if (exp.sexualAwakening) parts.push(角色字段翻译(前缀, 'identity.experience.sexualAwakening') + '：' + exp.sexualAwakening);
  if (exp.dailySexuality) parts.push(角色字段翻译(前缀, 'identity.experience.dailySexuality') + '：' + exp.dailySexuality);
  if (exp.sexualDetails && exp.sexualDetails.length) parts.push(角色字段翻译(前缀, 'identity.experience.sexualDetails') + '：' + 角色值转文本(exp.sexualDetails));

  return parts.join('\n');
}

// ===== 函数1·扩展：角色卡 · 身份与外貌 =====
// 输出第一章 身份（identity）+ 第二章 外貌（appearance），中文标签格式化，供 AI 作画/写作取角色概貌
function 角色卡身份与外貌(char) {
  if (!char) return '';
  var parts = [];
  var 身份 = 身份文本(char);
  if (身份) parts.push('【身份】\n' + 身份);
  var 外貌 = char.appearance && typeof char.appearance === 'object'
    ? 角色卡递归文本(char, 'appearance', char.appearance)
    : '';
  if (外貌) parts.push('【外貌】\n' + 外貌);
  return parts.join('\n\n');
}

// ============================================================
// ✨ 灵感角色全部 ——「灵感角色库」的【唯一】全局调用入口
// ⚠️⚠️⚠️ 重要区分警告 ⚠️⚠️⚠️
// 本函数只处理「灵感角色库」的精简角色（生图词典模块内维护，字段简单）。
// 它与主「角色卡」是两套完全不同的体系：
//   - 默认 / 泛指「角色卡」「角色库」时，一律用 window.角色卡全部 / window.角色卡身份与外貌（主角色卡）
//   - 只有【明确点名要灵感角色】的场景，才调用本函数 window.灵感角色全部
// 调用约定：window.灵感角色全部(灵感角色对象, 版本)
//   - 版本：'normal'（正常版）/ 'cool'（清凉版）/ 'deep'（深度版），缺省为 'deep'
//   - 输出：该版本数据的原始 JSON（JSON.stringify 全部字段，原样传输）
// ============================================================
function 灵感角色全部(char, version) {
  if (!char) return '';
  var v = version || 'deep';
  var data = (char && char.versions && char.versions[v]) ? char.versions[v] : null;
  if (!data) data = char;  // 兼容旧格式（单版本平铺字段）
  try {
    return JSON.stringify(data);
  } catch(e) {
    return String(data || '');
  }
}

// ============================================================
// ✨ 灵感角色档案 ——「灵感角色卡的档案内容」的全局入口
// 输出灵感角色的完整档案【文本】（不是 UI 弹窗）：版本逐个成段，每段按
// 【区块标题】+「中文标签：值」铺开，与主角色卡的 window.角色卡全部 对位。
// 它与 window.灵感角色全部 的分工：
//   - 灵感角色全部 → 只要【一个版本】的原始 JSON（原样喂模型）
//   - 灵感角色档案 → 【全部版本】的中文标签档案正文（人看的档案 / 需要带字段名的上下文）
// 字段与标签一律取自灵感角色库自己的模板表（window.stcdInspireGetFields），
// 灵感角色库加减字段时本函数自动跟上，不必改这里；表取不到时退化为按数据自有键铺开。
// ⚠️ 只是读取内容，不负责界面。界面上的「📋 档案」按钮不走本函数，
//    走灵感角色库自己的 stcdInspireView（三版本详情弹窗，灵感角色本来就有的那套档案）。
// 调用约定：window.灵感角色档案(灵感角色对象, 版本)
//   - 版本：'normal'（正常版）/ 'cool'（清凉版）/ 'deep'（深度版）；省略 = 三版全出
//   - 整版为空则跳过该版本；三版全空返回空串
//   - 空值字段按「无」输出（不隐藏），数组值逐条成行
// ============================================================
var 灵感角色版本序 = ['normal', 'cool', 'deep'];
var 灵感角色版本名 = { normal: '🌿 正常版', cool: '🧊 清凉版', deep: '🔥 深度版' };
// 灵感角色库未加载时的兜底区块名（正式标签以灵感角色库的 BLOCK_META 为准）
var 灵感角色兜底区块名 = { identity: '一、基本信息', clothing: '二、主服饰', accessories: '三、配饰', appearance: '四、体貌特征', kinks: '五、性癖标签' };

// 灵感角色取值：优先用灵感角色库自己的路径取值函数，未加载时用同规则回退
function 灵感角色取值(vdata, path) {
  if (typeof window.stcdInspireGetField === 'function') return window.stcdInspireGetField(vdata, path);
  var parts = String(path).split('.');
  var cur = vdata;
  for (var i = 0; i < parts.length; i++) {
    if (cur == null) return '';
    cur = cur[parts[i]];
  }
  return cur == null ? '' : cur;
}

// 该版本的区块表：优先灵感角色库按版本生成的字段表（中文标签/顺序/动态器官名都在里面），
// 否则按该版本数据自有的键兜底铺开
function 灵感角色区块表(version, vdata) {
  if (typeof window.stcdInspireGetFields === 'function') {
    var t = window.stcdInspireGetFields(version);
    if (t && t.length) return t;
  }
  var out = [];
  Object.keys(vdata || {}).forEach(function(bk) {
    if (!vdata[bk] || typeof vdata[bk] !== 'object') return;
    out.push({
      block: bk,
      blockLabel: 灵感角色兜底区块名[bk] || bk,
      fields: Object.keys(vdata[bk]).map(function(fk) { return { key: fk, label: fk }; }),
    });
  });
  return out;
}

// 整版是否为空（用于跳过没生成过的版本）
function 灵感角色版本空(vdata) {
  if (!vdata || typeof vdata !== 'object') return true;
  var bks = Object.keys(vdata);
  for (var i = 0; i < bks.length; i++) {
    var b = vdata[bks[i]];
    if (!b || typeof b !== 'object') continue;
    var fks = Object.keys(b);
    for (var j = 0; j < fks.length; j++) {
      var v = b[fks[j]];
      if (v == null || v === '') continue;
      if (Array.isArray(v) && !v.length) continue;
      return false;
    }
  }
  return true;
}

// 单个版本的档案正文
function 灵感角色版本文本(vdata, version) {
  var blocks = 灵感角色区块表(version, vdata);
  var gender = 灵感角色取值(vdata, 'identity.gender') || '';
  var 器官名 = (typeof window.stcdInspireGetGenitalsLabel === 'function')
    ? window.stcdInspireGetGenitalsLabel(gender) : '生殖器官';
  var parts = [];
  blocks.forEach(function(b) {
    var lines = [];
    (b.fields || []).forEach(function(f) {
      // 「生殖器官」按性别动态改名（女→小穴 / 男·伪娘→肉棒 / 扶她→肉棒+小穴）
      var label = (f.key === 'genitals') ? 器官名 : (f.label || f.key);
      var val = 灵感角色取值(vdata, b.block + '.' + f.key);
      if (Array.isArray(val)) {
        if (!val.length) { lines.push(label + '：无'); return; }
        lines.push(label + '：');
        val.forEach(function(x) { lines.push('　' + 角色值转文本(x)); });
        return;
      }
      if (val == null || val === '') { lines.push(label + '：无'); return; }
      if (val === true) { lines.push(label + '：是'); return; }
      if (val === false) { lines.push(label + '：否'); return; }
      lines.push(label + '：' + 角色值转文本(val));
    });
    if (lines.length) parts.push('【' + (b.blockLabel || b.block) + '】\n' + lines.join('\n'));
  });
  return parts.join('\n\n');
}

function 灵感角色档案(char, version) {
  if (!char) return '';
  var 有版本表 = !!(char.versions && typeof char.versions === 'object');
  var 取版本 = function(v) {
    if (有版本表) return char.versions[v] || null;
    return (v === 'normal') ? char : null;   // 旧格式（单版本平铺字段）视作正常版
  };
  var 版本们 = version ? [version] : 灵感角色版本序;
  // 抬头名字：先在各版本里找 identity.name（正常版优先），再退到显示名函数与顶层 name
  var 名字 = '';
  版本们.forEach(function(v) {
    if (名字) return;
    var d = 取版本(v);
    if (d && d.identity && d.identity.name) 名字 = d.identity.name;
  });
  if (!名字 && typeof window.stcdInspireDisplayName === 'function') 名字 = window.stcdInspireDisplayName(char);
  if (!名字 || 名字 === '未命名') 名字 = char.name || 名字 || '';
  var 段 = [];
  版本们.forEach(function(v) {
    var vdata = 取版本(v);
    if (!vdata || 灵感角色版本空(vdata)) return;
    var txt = 灵感角色版本文本(vdata, v);
    if (!txt) return;
    段.push('===== ' + (灵感角色版本名[v] || v) + ' =====\n' + txt);
  });
  if (!段.length) return '';
  var 抬头 = 名字 + (char.category ? '（' + char.category + '）' : '');
  return 抬头 + '\n\n' + 段.join('\n\n');
}

// ===== 函数2：角色卡 · 全部 =====
// 读取角色卡全部章节（identity + appearance + attire + ... 14章），中文标签格式化
function 角色卡全部(char) {
  if (!char) return '';
  var 章节名 = {
    identity: '身份', appearance: '外貌', attire: '衣着装扮', sexOrgans: '性特征',
    sexualCapability: '性能力', sexualHistory: '性历史', firstRecords: '首次记录',
    sexualPreferences: '性偏好', reproductiveHealth: '生殖健康', physicalHealth: '身体健康',
    personality: '性格言行', statusContract: '状态与契约', attributes: '属性', meta: '后台',
  };
  var parts = [];
  Object.keys(章节名).forEach(function(key) {
    var val = char[key];
    if (val == null) return;
    var 文本;
    if (key === 'identity') {
      文本 = 身份文本(char);
      if (文本) parts.push('【身份】\n' + 文本);
      return;
    }
    文本 = 角色卡递归文本(char, key, val);
    if (文本) parts.push('【' + 章节名[key] + '】\n' + 文本);
  });
  return parts.join('\n\n');
}

window.角色卡身份与外貌 = 角色卡身份与外貌;
window.角色卡全部 = 角色卡全部;
window.charIdentityAppearance = 角色卡身份与外貌;
window.charFull = 角色卡全部;
// 灵感角色库唯一全局入口（仅点名调用灵感角色时使用；默认一律用上面的角色卡函数）
window.灵感角色全部 = 灵感角色全部;
window.inspireCharFull = 灵感角色全部;
// 灵感角色档案内容（三版本中文标签正文；界面上的「📋 档案」走 stcdInspireView，不走这里）
window.灵感角色档案 = 灵感角色档案;
window.inspireCharArchive = 灵感角色档案;
