// 情欲文学 · 学术春宫（重构版：5 类 + 作者，仿新闻媒体/影视动画结构）
// 一级导航：教学习练 / 学业论文 / 个人笔记 / 公开论坛 / 专著期刊 / 作者
// 每个类别内部二级导航：📋 列表 / 📝 规划 / ✍️ 写作台

// ===== 大类型配置（第一层导航） =====
var 学术类别 = {
  '教学习练': { label:'教学习练', icon:'📘', desc:'以教学和学习为核心，覆盖教材、教案、练习册、课堂随笔等面向学习场景的成人学术内容，用教学框架包装情色叙事。', subtypes:['教材','教案','练习册','课堂随笔'] },
  '学业论文': { label:'学业论文', icon:'📄', desc:'开题报告、毕业论文等以学位论文格式呈现的成人内容，讲究论点、论据与论证的严谨框架。', subtypes:['开题报告','毕业论文'] },
  '个人笔记': { label:'个人笔记', icon:'📓', desc:'实验报告、田野笔记等以研究记录和第一人称观察笔记形式呈现的个人性经验记录。', subtypes:['实验报告','田野笔记'] },
  '公开论坛': { label:'公开论坛', icon:'🎙', desc:'学术讲座、会议记录等面向公众分享的学术交流内容，适合现场感与互动性的情色演绎。', subtypes:['学术讲座','会议记录'] },
  '专著期刊': { label:'专著期刊', icon:'📚', desc:'期刊论文与系统性著作等面向出版的成人学术内容，体例完整、结构严谨。', subtypes:['学术专著','论文期刊'] },
};
var 学术类别键 = ['教学习练','学业论文','个人笔记','公开论坛','专著期刊'];

// ===== 共享状态 =====
var 学术当前类别 = '教学习练';   // 一级（5 类之一，或 '作者'）
var 学术当前子标签 = 'list';    // 二级：list / plan / write
var 学术当前作品 = null;        // { category, data }
var 学术Api = null;
var 学术列表筛选 = {};          // { 类别: 子类型筛选值 }
var 学术子标签 = [
  { id: 'list',  label: '📋 列表' },
  { id: 'plan',  label: '📝 规划' },
  { id: 'write', label: '✍️ 写作台' },
];

// ===== 存储 API（单条书 = 一个 json；正文按章存 {书名}_chapters/chN.txt）=====
var 学术根路径 = '学术/';
function 学术类别目录(cat) { return 学术根路径 + cat + '/'; }

function 学术列出作品(cat) {
  return LocalFS.list(学术类别目录(cat)).then(function(entries) {
    if (!entries || !entries.length) return [];
    var jsonFiles = entries.filter(function(e) { return e.name.endsWith('.json'); });
    return Promise.all(jsonFiles.map(function(f) {
      return LocalFS.readJSON(学术类别目录(cat) + f.name).then(function(data) {
        if (data) { data._fileName = f.name; data._category = cat; }
        return data;
      });
    })).then(function(items) { return items.filter(Boolean); });
  }).catch(function() { return []; });
}

function 学术保存作品(cat, data) {
  var fileName = (data.title || '未命名') + '.json';
  data._fileName = 学术根路径 + cat + '/' + fileName;
  data._category = cat;
  return LocalFS.saveJSON(学术类别目录(cat) + fileName, data);
}

function 学术删除作品(cat, fileName) {
  var name = (fileName || '').replace(/^.*[\\/]/, '');
  return LocalFS.delete(学术类别目录(cat) + name);
}

function 学术全部作品() {
  return Promise.all(学术类别键.map(function(cat) {
    return 学术列出作品(cat);
  })).then(function(results) {
    var all = [];
    results.forEach(function(r) { all = all.concat(r); });
    return all;
  });
}

// ===== 首页渲染：一级导航（5 类 + 作者）=====
function 渲染学术页(el) {
  var items = 学术类别键.map(function(cat) { var c = 学术类别[cat]; return { id: cat, label: c.icon + ' ' + c.label }; });
  items.push({ id: '作者', label: '✍️ 作者' });
  if (!学术Api) {
    学术Api = 渲染标签栏(el, items, { active: 学术当前类别, subId: 'bookSubContent', onSwitch: function(t){ 学术切换类别(t); } });
  } else {
    学术Api.setActive(学术当前类别);
  }
  渲染学术内容();
}

function 学术切换类别(t) {
  学术当前类别 = t;
  学术当前子标签 = 'list';
  渲染学术内容();
}

// 渲染当前类别的次级分段 + 视图容器
function 渲染学术内容() {
  var sub = 学术Api ? 学术Api.sub : null;
  if (!sub) return;

  // 作者：一级 tab，单视图（直接调用作者管理）
  if (学术当前类别 === '作者') {
    if (typeof 渲染作者页 === 'function') { 渲染作者页(sub); return; }
    sub.innerHTML = '<div class="placeholder-text" style="padding:40px;text-align:center">作者模块加载中...</div>';
    return;
  }

  var h = '<div class="tl-subnav">';
  学术子标签.forEach(function(t) {
    h += '<div class="tl-subitem' + (t.id === 学术当前子标签 ? ' act' : '') + '" data-tab="' + t.id + '">' + t.label + '</div>';
  });
  h += '</div><div id="bookContentView"></div>';
  sub.innerHTML = h;
  sub.querySelectorAll('.tl-subitem[data-tab]').forEach(function(i) {
    i.addEventListener('click', function() { 学术切换子标签(this.getAttribute('data-tab')); });
  });
  学术切换子标签(学术当前子标签);
}

function 学术切换子标签(tab) {
  学术当前子标签 = tab;
  var el = document.getElementById('bookContentView');
  if (!el) return;
  var navs = document.querySelectorAll('#bookSubContent .tl-subitem');
  navs.forEach(function(n) { n.classList.toggle('act', n.getAttribute('data-tab') === tab); });
  if (tab === 'list')   { 学术渲染列表(el); }
  else if (tab === 'plan')  { 学术渲染规划(el); }
  else if (tab === 'write') { if (typeof 渲染学术写作台 === 'function') 渲染学术写作台(el); else el.innerHTML = '<div class="placeholder-text">写作台加载中...</div>'; }
}

// ===== 列表页（按当前类别列出，子类型 chip 筛选） =====
function 学术渲染列表(el) {
  var cat = 学术当前类别;
  var 类别 = 学术类别[cat];
  if (!类别) { el.innerHTML = '<div class="placeholder-text" style="padding:40px;text-align:center">请选择类别</div>'; return; }
  var 筛选 = 学术列表筛选[cat] || '';

  el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--fg2);font-size:0.82em">加载中...</div>';
  学术列出作品(cat).then(function(items) {
    if (!items.length) {
      el.innerHTML = '<div style="padding:40px;text-align:center">' +
        '<div class="placeholder-text" style="margin-bottom:12px">「' + 类别.label + '」还没有内容' +
        '</div><button class="btn-new" onclick="学术切换子标签(\'plan\')">＋ 新建</button></div>';
      return;
    }

    // 顶部统一「＋ 新建」
    var h = '<div class="mb-10"><button class="btn-new" onclick="学术切换子标签(\'plan\')">＋ 新建</button></div>';

    // 子类型筛选 chips
    if (类别.subtypes && 类别.subtypes.length > 1) {
      h += '<div class="filter-row" style="border-bottom:1px solid var(--border);padding-bottom:8px">';
      h += '<span class="filter-chip' + (!筛选 ? ' act' : '') + '" onclick="学术筛选(\'\')">📋 全部</span>';
      类别.subtypes.forEach(function(st) {
        var count = items.filter(function(b) { return b.type === st; }).length;
        h += '<span class="filter-chip' + (筛选 === st ? ' act' : '') + '" onclick="学术筛选(\'' + st + '\')">' + st + ' <span class="cnt">' + count + '</span></span>';
      });
      h += '</div>';
    }

    // 列表（点击整卡 → 详情；详情内再进入写作台）
    items.forEach(function(book) {
      if (筛选 && book.type !== 筛选) return;
      h += '<div class="n-card" style="margin-bottom:8px;padding:12px;cursor:pointer" onclick="打开学术详情(\'' + cat + '\',\'' + escHtml(book._fileName) + '\')">';
      h += '<div style="display:flex;justify-content:space-between;align-items:flex-start">';
      h += '<div style="flex:1">';
      h += '<div style="font-size:13px;font-weight:600;color:var(--fg)">' + escHtml(book.title || '未命名') + '</div>';
      if (book.type) h += '<div style="font-size:10px;color:var(--accent2);margin-top:2px">' + escHtml(book.type) + '</div>';
      if (book.author) h += '<div style="font-size:11px;color:var(--accent2);margin-top:2px">✍ ' + escHtml(book.author) + '</div>';
      if (book.description) h += '<div style="font-size:11px;color:var(--fg2);margin-top:4px;line-height:1.5">' + escHtml(book.description.slice(0, 120)) + (book.description.length > 120 ? '…' : '') + '</div>';
      if (book.chapters && book.chapters.length) h += '<div style="font-size:10px;color:var(--fg2);margin-top:4px">📑 ' + book.chapters.length + ' 章</div>';
      if (book.tags && book.tags.length) h += '<div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:4px">' + book.tags.map(function(t) { return '<span style="font-size:9px;padding:1px 6px;border-radius:3px;background:var(--accent-dim);color:var(--accent2)">' + escHtml(t) + '</span>'; }).join('') + '</div>';
      h += '</div>';
      h += '<div style="display:flex;gap:4px;flex-shrink:0;align-items:center">';
      if (book.subject) h += '<span style="font-size:10px;padding:1px 8px;border-radius:3px;background:var(--bg3);color:var(--fg3)">' + escHtml(book.subject) + '</span>';
      h += '</div>';
      h += '</div></div>';
    });
    el.innerHTML = h;
  });
}

window.学术筛选 = function(st) {
  var cat = 学术当前类别;
  学术列表筛选[cat] = st;
  var el = document.getElementById('bookContentView');
  if (el && typeof 学术渲染列表 === 'function') 学术渲染列表(el);
};

// ===== 学术详情弹窗 =====
window.打开学术详情 = function(cat, fileName) {
  学术列出作品(cat).then(function(items) {
    var book = items.find(function(i) { return i._fileName === fileName; });
    if (!book) { toast('未找到数据'); return; }
    var stCfg = 类型说明[book.type] || '';
    var h = '<div class="mcard" style="max-width:680px;width:94vw;max-height:85vh;overflow-y:auto">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
    h += '<h3 style="font-size:15px">' + escHtml(book.title) + '</h3>';
    h += '<button class="btn-sm" style="color:var(--error);font-size:11px;background:none;border:none;cursor:pointer" onclick="删除学术确认(\'' + cat + '\',\'' + escHtml(book._fileName) + '\')">🗑</button></div>';
    if (book.type) h += '<div style="font-size:11px;color:var(--accent2);margin-bottom:4px">🏷 ' + escHtml(book.type) + (stCfg ? '　' + escHtml(stCfg) : '') + '</div>';
    if (book.author) h += '<div style="font-size:12px;color:var(--accent2);margin-bottom:6px">✍ ' + escHtml(book.author) + '</div>';
    // 学科 / 年级段 / 类别专属
    var meta = [];
    if (book.subjectCategory || book.subject) meta.push('学科：' + (book.subjectCategory || '') + (book.subject ? ' > ' + book.subject : '') + (book.subjectDetail ? ' > ' + book.subjectDetail : ''));
    if (book.level) meta.push('年级段：' + book.level);
    var 类别 = 学术类别[cat];
    if (类别 && 类别专属字段[cat] && 类别专属字段[cat].fields) {
      类别专属字段[cat].fields.forEach(function(f) { if (book[f.key]) meta.push(f.label + '：' + book[f.key]); });
    }
    if (meta.length) h += '<div style="font-size:11px;color:var(--fg2);line-height:1.7;margin-bottom:8px;background:var(--bg);border:1px solid var(--border);border-radius:4px;padding:6px 10px">' + meta.map(function(m){ return escHtml(m); }).join('<br>') + '</div>';
    if (book.description) h += '<div style="font-size:12px;color:var(--fg2);line-height:1.6;margin-bottom:8px;background:var(--bg2);padding:8px;border-radius:4px">' + escHtml(book.description) + '</div>';
    if (book.tags && book.tags.length) h += '<div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:8px">' + book.tags.map(function(t) { return '<span style="font-size:10px;padding:1px 6px;border-radius:3px;background:var(--accent-dim);color:var(--accent2)">' + escHtml(t) + '</span>'; }).join('') + '</div>';
    if (book.chapters && book.chapters.length) {
      h += '<div style="font-size:12px;font-weight:600;margin-bottom:6px">📑 目录（共' + book.chapters.length + '章）</div>';
      book.chapters.forEach(function(ch, ci) {
        var title = typeof ch === 'string' ? ch : (ch.title || '第' + (ci + 1) + '章');
        var summary = typeof ch === 'string' ? '' : (ch.summary || '');
        h += '<div style="background:var(--bg);border:1px solid var(--border);border-radius:4px;padding:8px;margin-bottom:4px;font-size:11px">';
        h += '<div style="font-weight:500;color:var(--fg)">' + escHtml(title) + '</div>';
        if (summary) h += '<div style="color:var(--fg2);margin-top:3px;line-height:1.5">' + escHtml(summary) + '</div>';
        h += '</div>';
      });
    }
    h += '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:10px;align-items:center">';
    h += '<button class="btn-main" style="font-size:11px;padding:5px 16px" onclick="this.closest(\'.ovl\').remove();学术跳转写作台(\'' + cat + '\',\'' + escHtml(book._fileName) + '\')">✍️ 进入写作台</button>';
    h += '<button class="btn-out" style="font-size:11px;padding:5px 14px" onclick="this.closest(\'.ovl\').remove()">关闭</button></div></div>';
    var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = h;
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  });
};

window.删除学术确认 = function(cat, fileName) {
  confirmDialog('确定删除？', function() {
    学术删除作品(cat, fileName).then(function() {
      toast('已删除');
      var el = document.getElementById('bookContentView');
      if (el) 学术渲染列表(el);
    });
  });
};

window.学术跳转写作台 = function(cat, fileName) {
  学术列出作品(cat).then(function(items) {
    var book = items.find(function(i) { return i._fileName === fileName; });
    if (!book) { toast('未找到数据'); return; }
    学术当前作品 = { category: cat, data: book };
    acadWriting当前书 = { category: cat, data: book };
    _acadStreakStoreKey = 'acad_streak_' + (book.title || '');
    学术切换子标签('write');
  });
};

window.学术选择类别 = function(cat) {
  学术当前类别 = cat;
  学术当前子标签 = 'list';
  var el = document.getElementById('booksContent');
  if (el) 渲染学术页(el);
};

// ===== 路由注册 =====
registerPageRoute('books', function() {
  var el = document.getElementById('booksContent');
  if (el) 渲染学术页(el);
});

// ===== 暴露全局 =====
window.学术类别 = 学术类别;
window.学术类别键 = 学术类别键;
window.学术列出作品 = 学术列出作品;
window.学术保存作品 = 学术保存作品;
window.学术删除作品 = 学术删除作品;
window.学术全部作品 = 学术全部作品;
window.渲染学术页 = 渲染学术页;
window.学术切换子标签 = 学术切换子标签;
window.学术当前类别 = 学术当前类别;
window.学术当前子标签 = 学术当前子标签;
window.学术当前作品 = 学术当前作品;
