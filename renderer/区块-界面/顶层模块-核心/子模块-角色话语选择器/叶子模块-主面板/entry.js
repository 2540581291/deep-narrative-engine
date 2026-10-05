// 区块-界面 · 角色话语选择器（全局可复用组件，仿 生图词典 stcdOpenCharPicker / 作品选择器 stcdOpenWorkPicker 的回调模板）
//
// 「角色话语」= 小说提取从原小说里摘出来的**该角色实际说过的原话**（对白/独白/呻吟叫喊/念白唱词），
// 它独立于角色卡的 14 章数据（不进「填入生成」、不影响角色卡生成），但作为一份自由可用的素材库，
// 供 性爱台本 / 角色台本 等创作模块在生成时把「这个角色说话是什么调子」附进提示词。
//
// 数据源：保存/角色话语/<书名｜角色名>/<书名｜角色名> - 信息.json（createStore 标准结构）
//   { 键, bookId, book, char, gender, role, lines:[原话…], count, source, createdAt, updatedAt }
//
// 用法（标准回调）：
//   stcdOpenSpeechPicker({ onPick: function(条目){ … }, 默认角色名: '角色名' })
//   - opts.onPick(条目)  选中后回调，并自动关闭弹窗
//   - opts.默认角色名    可选，命中的条目排在前面并高亮
//   - opts.起始过滤      可选，'全部' | 性别英文值（female/male/femboy/futa/beast）
//
// 供 小说提取（写入）与 性爱台本 / 角色台本（读取注入）共用。

// 惰性兜底创建（initStores 已注册；此处在极端加载顺序下兜底）
if (typeof Store !== 'undefined' && Store && !Store.roleSpeech && typeof createStore === 'function') {
  Store.roleSpeech = createStore('roleSpeech');
}

// shown 为当前渲染出来的列表：行内按钮一律按下标回调，不把「键/角色名」塞进 onclick
// （escHtml 会把单引号转义成 &#39;，HTML 属性解码后反而截断 onclick 里的 JS 字符串）
var STCD_SPEECH_PICKER = { list: [], shown: [], filter: '全部', keyword: '', 默认角色名: '', onPick: null, loaded: false };

// ===== 一、话语库（供其它模块直接调用的全局函数）=====

// 键：书名｜角色名（用全角竖线，避免与文件名清理规则冲突；bookId 用于书名改名后仍能定位）
function 角色话语键(bookId, char) {
  return String(bookId == null ? '' : bookId) + '｜' + String(char == null ? '' : char);
}

function 话语库就绪() {
  if (typeof Store === 'undefined' || !Store) return false;
  if (!Store.roleSpeech && typeof createStore === 'function') Store.roleSpeech = createStore('roleSpeech');
  return !!(Store.roleSpeech && typeof Store.roleSpeech.save === 'function');
}

// 书名规范化：小说提取的记录标题常自带《》，这里剥掉最外层，展示时统一再加，避免出现《《书名》》
function 话语规范书名(b) {
  var s = String(b == null ? '' : b).trim() || '未命名';
  for (var i = 0; i < 2; i++) {
    var m = s.match(/^[《〈「『“"]([\s\S]*?)[》〉」』”"]$/);
    if (!m) break;
    s = m[1].trim();
  }
  return s || '未命名';
}

// 来源（provenance）：每条话语是从全文第几段（切割文本的 12 万字块，1 起）摘出来的。
// 可靠性审查据此「按台词所在的位置」取证据——投给它自己那一段原文，避免用采样窗口核对时
// 把「这段窗口没覆盖」误判成「原文里没有」。键为话语原文，值为段号。
function 话语来源净化(表, lines) {
  var out = {};
  if (!表 || typeof 表 !== 'object' || !Array.isArray(lines)) return out;
  lines.forEach(function(t) { if (表[t] != null && 表[t] !== '') out[t] = Number(表[t]) || 0; });
  return out;
}

// 保存一条话语（键相同则覆盖）。o = { bookId, book, char, gender, role, lines, source, 来源, 来源段数 }
// lines 为空 = 从库里撤掉该条（不留 0 条的空壳，避免选择器里出现点不开的条目）
function 角色话语保存(o) {
  if (!话语库就绪()) return Promise.resolve(false);
  o = o || {};
  var char = String(o.char || '').trim();
  if (!char) return Promise.resolve(false);
  var bookId = String(o.bookId || '').trim() || ('book_' + 本地FS.清理(o.book || '未命名'));
  var 键 = o.键 || 角色话语键(bookId, char);
  var lines = Array.isArray(o.lines) ? o.lines.filter(function(x) { return x != null && String(x).trim(); }) : [];
  if (!lines.length) return 角色话语删除(键);
  var old = 角色话语读取同步(键) || {};
  // 只保留仍在列表里的条目的来源；调用方没传就沿用旧的
  var 来源 = 话语来源净化(o.来源 != null ? o.来源 : old.来源, lines);
  return Store.roleSpeech.save(键, {
    键: 键,
    bookId: bookId,
    book: 话语规范书名(o.book || old.book),
    char: char,
    gender: o.gender || old.gender || '',
    role: o.role || old.role || '',
    source: o.source || old.source || '',
    lines: lines,
    count: lines.length,
    来源: 来源,
    来源段数: Number(o.来源段数 != null ? o.来源段数 : old.来源段数) || 0,
    createdAt: old.createdAt || new Date().toISOString()
  });
}

// 同步读取（生成时拼提示词用：一次同步 IPC，不阻塞流程且不依赖 Promise）
function 角色话语读取同步(键) {
  if (!键 || !话语库就绪()) return null;
  try {
    var d = LocalFS.readJSONSync(Store.roleSpeech._metaPath(键));
    if (!d) return null;
    if (!Array.isArray(d.lines)) d.lines = [];
    if (d.count === undefined) d.count = d.lines.length;
    return d;
  } catch (e) { return null; }
}

// 列表（异步，供选择器与自动匹配使用）
function 角色话语列表() {
  if (!话语库就绪()) return Promise.resolve([]);
  return Store.roleSpeech.list().then(function(items) {
    return (items || []).filter(function(it) { return it && it.char && Array.isArray(it.lines) && it.lines.length; });
  }).catch(function() { return []; });
}

function 角色话语删除(键) {
  if (!键 || !话语库就绪()) return Promise.resolve(false);
  return Store.roleSpeech.delete(键).catch(function() { return false; });
}

// 书名改名：bookId 不变，仅刷新显示用书名
function 角色话语书名更新(bookId, 新书名) {
  if (!bookId || !话语库就绪()) return Promise.resolve(0);
  return 角色话语列表().then(function(list) {
    var targets = list.filter(function(it) { return it.bookId === bookId; });
    return Promise.all(targets.map(function(it) { return 角色话语保存({ 键: it.键, bookId: bookId, book: 新书名, char: it.char, lines: it.lines, 来源: it.来源, 来源段数: it.来源段数 }); }))
      .then(function() { return targets.length; });
  });
}

// 整本书删除（删除小说提取记录时调用）
function 角色话语书删除(bookId) {
  if (!bookId || !话语库就绪()) return Promise.resolve(0);
  return 角色话语列表().then(function(list) {
    var targets = list.filter(function(it) { return it.bookId === bookId; });
    return Promise.all(targets.map(function(it) { return 角色话语删除(it.键); })).then(function() { return targets.length; });
  });
}

// 角色改名（小说提取里改角色名时调用，键含角色名，需要迁移）
function 角色话语改名(bookId, 旧角色名, 新角色名) {
  if (!bookId || !旧角色名 || !新角色名 || 旧角色名 === 新角色名 || !话语库就绪()) return Promise.resolve(false);
  var 旧键 = 角色话语键(bookId, 旧角色名);
  var 新键 = 角色话语键(bookId, 新角色名);
  var d = 角色话语读取同步(旧键);
  if (!d) return Promise.resolve(false);
  return 角色话语保存({ 键: 新键, bookId: bookId, book: d.book, char: 新角色名, gender: d.gender, role: d.role, source: d.source, lines: d.lines, 来源: d.来源, 来源段数: d.来源段数 })
    .then(function() { return 角色话语删除(旧键); });
}

// 取某条的来源信息（同步）：{ 表: {话语: 段号}, 段数 }
function 角色话语来源(键) {
  var d = 角色话语读取同步(键);
  if (!d) return { 表: {}, 段数: 0 };
  return { 表: (d.来源 && typeof d.来源 === 'object') ? d.来源 : {}, 段数: Number(d.来源段数) || 0 };
}

// 按角色名找一个最合适的话语条目（自动匹配用）
// 同名多条（同一角色名出现在多本书里）时：当前已选的若仍有效就保持不变，否则取最近更新的一条。
// 不能「排除当前键再挑最新」——那样每次重渲染都会在两本书之间来回跳。
function 角色话语找角色(角色名数组, 首选键) {
  var names = (角色名数组 || []).map(function(n) { return String(n || '').trim(); }).filter(Boolean);
  if (!names.length) return Promise.resolve(null);
  return 角色话语列表().then(function(list) {
    var 候选 = list.filter(function(it) { return names.indexOf(it.char) >= 0; });
    if (!候选.length) return null;
    if (首选键) {
      for (var i = 0; i < 候选.length; i++) { if (候选[i].键 === 首选键) return 候选[i]; }
    }
    候选.sort(function(a, b) { return String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')); });
    return 候选[0];
  });
}

// 生成用：话语段（同步）。不做字数截断——原话全量附上，避免把角色的说话调子截掉半截。
function 角色话语上下文(键, opts) {
  var d = 角色话语读取同步(键);
  if (!d || !d.lines || !d.lines.length) return '';
  var head = '【角色话语·' + (d.char || '') + '（摘自《' + (d.book || '') + '》的原话）】\n';
  var body = '';
  for (var i = 0; i < d.lines.length; i++) body += '- ' + d.lines[i] + '\n';
  var tail = '（以上是该角色在原作里实际说出口的话，共 ' + d.lines.length + ' 条）\n'
    + '　用法：以上只作「这个角色说话是什么调子」的参照——沿用其用词、语气词、口头禅、身份称谓与断句习惯，但不要照抄整句，按本次要求重新组织内容。\n';
  return head + body + tail;
}

// 摘要（UI 行上显示：书名·角色名（N 条））
function 角色话语摘要(键) {
  var d = 角色话语读取同步(键);
  if (!d) return null;
  return { char: d.char || '', book: d.book || '', count: (d.lines || []).length, bookId: d.bookId || '' };
}

window.角色话语键 = 角色话语键;
window.角色话语保存 = 角色话语保存;
window.角色话语读取同步 = 角色话语读取同步;
window.角色话语列表 = 角色话语列表;
window.角色话语删除 = 角色话语删除;
window.角色话语书名更新 = 角色话语书名更新;
window.角色话语书删除 = 角色话语书删除;
window.角色话语改名 = 角色话语改名;
window.角色话语来源 = 角色话语来源;
window.角色话语找角色 = 角色话语找角色;
window.角色话语上下文 = 角色话语上下文;
window.角色话语摘要 = 角色话语摘要;

// ===== 二、选择弹窗 =====

var 话语性别标签 = { female: '👩 女性', male: '👨 男性', femboy: '⚧ 伪娘', futa: '🔮 扶她', beast: '👾 异种' };
function 话语性别显示(g) { return 话语性别标签[g] || (g || '未分类'); }

function stcdOpenSpeechPicker(opts) {
  opts = opts || {};
  STCD_SPEECH_PICKER.onPick = (typeof opts.onPick === 'function') ? opts.onPick : null;
  STCD_SPEECH_PICKER.默认角色名 = opts.默认角色名 || '';
  STCD_SPEECH_PICKER.filter = opts.起始过滤 || '全部';
  STCD_SPEECH_PICKER.keyword = '';
  if (!话语库就绪()) { toast('角色话语库未就绪'); return; }
  角色话语列表().then(function(list) {
    STCD_SPEECH_PICKER.list = list || [];
    STCD_SPEECH_PICKER.loaded = true;
    if (!STCD_SPEECH_PICKER.list.length) {
      toast('暂无角色话语，请先到「角色卡 · 小说提取」里对角色执行「💬 话语提取」');
      return;
    }
    stcdSpeechPickerRender();
  });
}

function stcdSpeechPickerFilter(g) {
  STCD_SPEECH_PICKER.filter = g;
  stcdSpeechPickerRender();
}

function stcdSpeechPickerSearch() {
  var el = document.getElementById('stcdSpeechSearch');
  STCD_SPEECH_PICKER.keyword = el ? String(el.value || '').trim() : '';
  stcdSpeechPickerRender();
}

// 过滤 + 排序：默认角色名命中的排最前
function stcdSpeechPickerList() {
  var kw = STCD_SPEECH_PICKER.keyword;
  var 默认名 = STCD_SPEECH_PICKER.默认角色名;
  var list = STCD_SPEECH_PICKER.list.filter(function(it) {
    if (STCD_SPEECH_PICKER.filter !== '全部' && (it.gender || '') !== STCD_SPEECH_PICKER.filter) return false;
    if (!kw) return true;
    var hay = (it.char || '') + ' ' + (it.book || '') + ' ' + (it.lines || []).join(' ');
    return hay.indexOf(kw) >= 0;
  });
  list.sort(function(a, b) {
    var am = (默认名 && a.char === 默认名) ? 0 : 1;
    var bm = (默认名 && b.char === 默认名) ? 0 : 1;
    if (am !== bm) return am - bm;
    var c = String(a.char || '').localeCompare(String(b.char || ''), 'zh');
    if (c !== 0) return c;
    return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
  });
  return list;
}

function stcdSpeechPickerRender() {
  var all = STCD_SPEECH_PICKER.list;
  var list = stcdSpeechPickerList();
  var 默认名 = STCD_SPEECH_PICKER.默认角色名;
  STCD_SPEECH_PICKER.shown = list;

  var h = '<div class="mcard" style="width:820px;max-width:96vw;height:78vh;max-height:78vh;display:flex;flex-direction:column">';
  h += '<style>#stcdSpeechList{overflow-y:scroll;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.25) rgba(255,255,255,0.06)}#stcdSpeechList::-webkit-scrollbar{width:10px;display:block}#stcdSpeechList::-webkit-scrollbar-track{background:rgba(255,255,255,0.06)}#stcdSpeechList::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.25);border-radius:5px}</style>';
  // 头部
  h += '<div style="display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--border);flex-shrink:0">';
  h += '<span style="font-size:15px;font-weight:600">💬 选择角色话语</span>';
  h += '<span style="font-size:11px;color:var(--fg3)">选用某个角色在原文里说过的话，作为生成时的说话调子参照</span>';
  h += '<div style="flex:1"></div>';
  h += '<span style="cursor:pointer;color:var(--fg3);font-size:18px" onclick="this.closest(\'.ovl\').remove()">✕</span>';
  h += '</div>';
  // 性别筛选 + 搜索
  h += '<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;padding:10px 16px;border-bottom:1px solid var(--border);flex-shrink:0">';
  var 性别项 = ['全部', 'female', 'male', 'femboy', 'futa', 'beast'];
  var 计数 = { '全部': all.length };
  all.forEach(function(it) { var g = it.gender || ''; if (g) 计数[g] = (计数[g] || 0) + 1; });
  性别项.forEach(function(g) {
    if (g !== '全部' && !计数[g]) return;
    var act = STCD_SPEECH_PICKER.filter === g;
    h += '<span class="tag-chip' + (act ? ' tag-active' : '') + '" style="cursor:pointer;font-size:10px;padding:2px 8px" onclick="stcdSpeechPickerFilter(\'' + g + '\')">' + (g === '全部' ? '全部' : 话语性别显示(g)) + ' (' + (计数[g] || 0) + ')</span>';
  });
  h += '<input id="stcdSpeechSearch" class="llm-input" style="flex:1;min-width:150px;font-size:11px" placeholder="搜索角色名 / 书名 / 话语内容…" value="' + escHtml(STCD_SPEECH_PICKER.keyword) + '" onkeydown="if(event.key===\'Enter\')stcdSpeechPickerSearch()">';
  h += '<button class="btn-out btn-sm" style="font-size:10px;padding:2px 10px" onclick="stcdSpeechPickerSearch()">🔍 搜索</button>';
  h += '</div>';
  // 列表
  h += '<div id="stcdSpeechList" style="flex:1;min-height:0;overflow-y:scroll;padding:12px 16px">';
  if (!list.length) {
    h += '<div style="font-size:11px;color:var(--fg3);text-align:center;padding:30px">' + (all.length ? '没有匹配的角色话语' : '话语库暂无内容，请先到「角色卡 · 小说提取」里对角色执行「💬 话语提取」') + '</div>';
  } else {
    list.forEach(function(it, idx) {
      var 命中 = (默认名 && it.char === 默认名);
      var 预览 = (it.lines || []).slice(0, 2).map(function(x) { return '· ' + x; }).join('\n');
      h += '<div class="card mb-6" style="padding:0;overflow:hidden;border-radius:10px' + (命中 ? ';border-color:var(--accent)' : '') + '">';
      h += '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,0.03);border-bottom:1px solid var(--border)">';
      h += '<span style="font-size:14px;line-height:1">👤</span>';
      h += '<div style="font-size:12px;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(it.char || '未命名') + '</div>';
      if (命中) h += '<span class="badge-tag" style="border-color:var(--accent);color:var(--accent)">跟随角色</span>';
      h += '<span class="badge-tag">' + escHtml(话语性别显示(it.gender)) + '</span>';
      if (it.role) h += '<span class="badge-tag">' + escHtml(it.role) + '</span>';
      h += '<span class="badge-tag">' + escHtml((it.count || (it.lines || []).length) + ' 条') + '</span>';
      h += '<span style="font-size:10px;color:var(--fg3);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right">《' + escHtml(it.book || '未命名') + '》</span>';
      h += '</div>';
      h += '<div style="padding:6px 10px;font-size:11px;color:var(--fg2);line-height:1.7;white-space:pre-wrap;max-height:52px;overflow:hidden">' + escHtml(预览) + '</div>';
      h += '<div style="display:flex;gap:6px;padding:0 10px 8px">';
      h += '<button class="btn btn-sm" style="font-size:10px;padding:2px 12px" onclick="stcdSpeechPickerPick(' + idx + ')">✓ 选用</button>';
      h += '<button class="btn-out btn-sm" style="font-size:10px;padding:2px 10px" onclick="stcdSpeechPickerView(' + idx + ')">👁 查看全部</button>';
      h += '</div></div>';
    });
  }
  h += '</div>';
  // 底部
  h += '<div style="display:flex;align-items:center;gap:8px;padding:10px 16px;border-top:1px solid var(--border);flex-shrink:0">';
  h += '<span style="font-size:10px;color:var(--fg3)">共 ' + all.length + ' 个角色的话语' + (list.length !== all.length ? '，当前筛选命中 ' + list.length + ' 个' : '') + '</span>';
  h += '<div style="flex:1"></div>';
  h += '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>';
  h += '</div>';
  h += '</div>';

  var ov = document.querySelector('.ovl[data-stcd-speech-picker]');
  if (!ov) {
    ov = document.createElement('div');
    ov.className = 'ovl';
    ov.setAttribute('data-stcd-speech-picker', '1');
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  }
  ov.innerHTML = h;
}

// 按下标取出当前列表里的条目（避免把键塞进 onclick）
function 话语渲染项(idx) {
  var it = STCD_SPEECH_PICKER.shown[idx];
  if (!it) return null;
  return 角色话语读取同步(it.键) || it;
}

function stcdSpeechPickerPick(idx) {
  var d = 话语渲染项(idx);
  if (!d) { toast('该条话语已不存在'); return; }
  var ov = document.querySelector('.ovl[data-stcd-speech-picker]');
  if (STCD_SPEECH_PICKER.onPick) {
    STCD_SPEECH_PICKER.onPick(d);
    if (ov) ov.remove();
    return;
  }
  if (ov) ov.remove();
  toast('已选择角色话语：' + (d.char || '') + '（' + (d.lines || []).length + ' 条）');
}

// 查看某条话语的全部内容（只读）
function stcdSpeechPickerView(idx) {
  var d = 话语渲染项(idx);
  if (!d) { toast('该条话语已不存在'); return; }
  var ov = document.querySelector('.ovl[data-stcd-speech-view]');
  if (!ov) {
    ov = document.createElement('div');
    ov.className = 'ovl';
    ov.setAttribute('data-stcd-speech-view', '1');
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  }
  var 文本 = (d.lines || []).join('\n');
  var 头 = '💬 ' + escHtml(d.char || '未命名') + ' 的原话';
  var 副 = '<span class="badge-tag">《' + escHtml(d.book || '未命名') + '》</span>'
    + '<span class="badge-tag">' + escHtml((d.lines || []).length + ' 条') + '</span>';
  var 尾 = '<button class="btn-out" onclick="stcdSpeechPickerCopyText()">📋 复制全部</button>'
    + '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">关闭</button>';
  var h = '<div class="mcard" style="width:760px;max-width:96vw;height:76vh;max-height:76vh;display:flex;flex-direction:column">';
  h += '<div style="display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--border);flex-shrink:0">';
  h += '<span style="font-size:15px;font-weight:600">' + 头 + '</span>' + 副;
  h += '<div style="flex:1"></div>';
  h += '<span style="cursor:pointer;color:var(--fg3);font-size:18px" onclick="this.closest(\'.ovl\').remove()">✕</span>';
  h += '</div>';
  h += '<textarea id="stcdSpeechViewText" readonly class="llm-input" style="flex:1;min-height:0;width:100%;resize:none;font-size:12px;line-height:1.9;font-family:inherit;white-space:pre-wrap">' + escHtml(文本) + '</textarea>';
  h += '<div style="display:flex;gap:8px;justify-content:flex-end;padding:10px 16px;border-top:1px solid var(--border);flex-shrink:0">' + 尾 + '</div>';
  h += '</div>';
  ov.innerHTML = h;
}

function stcdSpeechPickerCopyText() {
  var el = document.getElementById('stcdSpeechViewText');
  if (!el) return;
  复制到剪贴板(el.value).then(function(ok) { toast(ok ? '已复制全部原话' : '复制失败'); });
}

window.stcdOpenSpeechPicker = stcdOpenSpeechPicker;
window.stcdSpeechPickerFilter = stcdSpeechPickerFilter;
window.stcdSpeechPickerSearch = stcdSpeechPickerSearch;
window.stcdSpeechPickerRender = stcdSpeechPickerRender;
window.stcdSpeechPickerPick = stcdSpeechPickerPick;
window.stcdSpeechPickerView = stcdSpeechPickerView;
window.stcdSpeechPickerCopyText = stcdSpeechPickerCopyText;
