// 参考文档（文风分析）· 列表与导航

// 创作辅助 · 文风分析
var 文风导航 = [
  { id: 'list', label: '📋 分析列表' },
  { id: 'editor', label: '✍️ 分析编辑' },
  { id: 'import', label: '📦 导入导出' },
];
var 文风当前视图 = 'list';
var 文风Api = null;
var _styleEditTitle = null;
var _styleEditSubTab = '基本信息';
var _styleAna = {};

var 文风分析标签 = [
  { id: '基本信息', label: '📋 基本信息' },
  { id: '文风总评', label: '✍️ 文风总评' },
  { id: '技法拆解', label: '🔧 技法拆解' },
  { id: '结局分析', label: '🎯 结局分析' },
  { id: '语言对白', label: '💬 语言对白' },
  { id: '词汇库',    label: '📖 词汇库' },
  { id: '语言参考',  label: '📚 语言参考' },
];

function 文风切子标签(tab) {
  _styleEditSubTab = tab;
  var el = document.getElementById('说styleTabContent');
  if (!el) return;
  var nav = el.previousElementSibling;
  if (nav && nav.classList.contains('tl-subnav')) {
    Array.from(nav.children).forEach(function(item) {
      item.classList.toggle('act', item.getAttribute('data-stab') === tab);
    });
  }
  渲染当前分析段(el);
}

// 第一层用全局组件「渲染标签栏」渲染成芯片；创建一次后复用 setActive
function 文风切换视图(view) {
  文风当前视图 = view;
  var el = document.getElementById('ref-docContent');
  if (!el) return;
  var items = 文风导航.map(function(v) { return { id: v.id, label: v.label }; });
  if (!文风Api) {
    文风Api = 渲染标签栏(el, items, { active: 文风当前视图, onSwitch: function(view) { 文风切换类型(view); } });
  } else {
    文风Api.setActive(文风当前视图);
  }
  文风渲染内容();
}

function 文风切换类型(view) {
  文风当前视图 = view;
  文风渲染内容();
}

// 视图内容渲染进组件 sub（嵌套 refDocViewContent）
function 文风渲染内容() {
  var sub = 文风Api ? 文风Api.sub : null;
  if (!sub) return;
  sub.innerHTML = '<div id="refDocViewContent"></div>';
  var vEl = document.getElementById('refDocViewContent');
  if (!vEl) return;
  switch (文风当前视图) {
    case 'list':   渲染文风列表(vEl); break;
    case 'editor': 渲染文风编辑器(vEl); break;
    case 'import': 渲染文风导入导出(vEl); break;
  }
}

function 文风新分析() { _styleEditTitle = null; 文风切换视图('editor'); }

// ===== 列表 =====
var _styleUploadInput = null;

function 文风上传文件() {
  if (!_styleUploadInput) {
    _styleUploadInput = document.createElement('input');
    _styleUploadInput.type = 'file';
    _styleUploadInput.accept = '.txt,.md';
    _styleUploadInput.multiple = false;
    _styleUploadInput.style.display = 'none';
    _styleUploadInput.addEventListener('change', function(e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        var content = ev.target.result;
        var name = file.name.replace(/\.(txt|md)$/i, '');
        // 直接创建分析条目，预填标题和原文，跳转到编辑器
        _styleEditTitle = null;
        var key = name;
        Store.refDoc.save(key, {
          title: name,
          tags: [],
          sourceText: content,
          sections: {},
          analysis: '',
          createdAt: fmtDate(new Date()),
          updatedAt: fmtDate(new Date())
        }).then(function() {
          _styleEditTitle = key;
          文风切换视图('editor');
          toast('已导入「' + name + '」，共 ' + content.length + ' 字');
        });
      };
      reader.readAsText(file);
      this.value = '';
    });
    document.body.appendChild(_styleUploadInput);
  }
  _styleUploadInput.click();
}

function 渲染文风列表(el) {
  Store.refDoc.list().then(function(items) {
    var h = '<div class="mb-10"><button class="btn-new" onclick="文风新分析()">＋ 新建</button></div>';
    if (!items || !items.length) {
      h += '<div class="placeholder-text">暂无文风分析。上传 .txt/.md 原文文件或点「新建分析」手动开始。</div>';
    } else {
      items.forEach(function(item) {
        // list() 返回数组；用 _dirName（目录名）作为稳定存储键，title 仅作显示
        var key = item._dirName || item.title || '';
        var norm = (window.文风归一化 || function(x){return x||{};})(item);
        var title = norm.title || key;
        var tags = norm.tags || [];
        var analysis = norm.analysis || '';
        h += '<div class="n-card mb-6 p-10" style="cursor:pointer" onclick="文风查看弹窗(\'' + escHtml(key) + '\')">';
        h += '<div class="flex justify-between items-center">';
        h += '<div class="flex-1">';
        h += '<div class="fw-600 fs-14">' + escHtml(title) + '</div>';
        if (norm.updatedAt) h += '<div class="text-sm text-muted mt-2">📅 ' + (norm.updatedAt || norm.createdAt) + '</div>';
        if (tags.length) h += '<div class="mt-4">' + tags.map(function(t){return '<span class="badge-tag">' + escHtml(t) + '</span>';}).join('') + '</div>';
        if (analysis) {
          var preview = analysis.length > 120 ? analysis.slice(0, 120) + '...' : analysis;
          h += '<div class="text-muted text-sm mt-4" style="white-space:pre-wrap">' + escHtml(preview) + '</div>';
        }
        h += '</div>';
        h += '<div class="flex gap-4 ml-10 flex-shrink-0">';
        h += '<span class="btn-secondary btn-sm" onclick="event.stopPropagation();文风编辑项(\'' + escHtml(key) + '\')">✏️ 编辑</span>';
        h += '<span class="btn-secondary btn-sm c-error" onclick="event.stopPropagation();文风删除项(\'' + escHtml(key) + '\')">🗑 删除</span>';
        h += '</div></div>';
        h += '</div>';
      });
    }
    el.innerHTML = h;
  });
}

function 文风编辑项(key) { _styleEditTitle = key; 文风切换视图('editor'); }
function 文风删除项(key) {
  confirmDialog('确定删除「' + key + '」？', function() {
    Store.refDoc.delete(key).then(function() { toast('已删除'); 文风切换视图('list'); });
  });
}

// ===== 查看弹窗（列表点击 → 只读展示 7 板块条目树） =====
function 文风查看去编辑(key) {
  var ov = document.querySelector('.ovl');
  if (ov) ov.remove();
  文风编辑项(key);
}
function 文风查看弹窗(key) {
  Store.refDoc.get(key).then(function(item) {
    if (!item) { toast('未找到该分析'); return; }
    var norm = (window.文风归一化 || function(x){return x||{};})(item);
    var tags = norm.tags || [];
    var h = '<div class="mcard" style="max-width:860px;max-height:88vh;overflow:auto">';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;gap:8px">';
    h += '<div style="font-size:16px;font-weight:700;flex:1;min-width:0">📖 ' + escHtml(norm.title || key) + '</div>';
    h += '<div style="display:flex;gap:6px;flex-shrink:0">';
    h += '<button class="btn btn-outline btn-sm" onclick="文风查看去编辑(\'' + escHtml(key) + '\')">✏️ 编辑</button>';
    h += '<button class="btn btn-outline btn-sm" onclick="this.closest(\'.ovl\').remove()">关闭</button>';
    h += '</div></div>';
    if (tags.length) h += '<div style="margin-bottom:8px">' + tags.map(function(t){return '<span class="badge-tag">' + escHtml(t) + '</span>';}).join(' ') + '</div>';
    if (norm.updatedAt) h += '<div class="text-muted text-sm mb-10">📅 ' + escHtml(norm.updatedAt) + '</div>';
    var treeHTML = (window.文风树HTML只读 || function(){return '';});
    for (var i = 0; i < 文风分析标签.length; i++) {
      var t = 文风分析标签[i];
      h += '<div class="wf-board" style="margin-bottom:14px;border-top:1px solid var(--border);padding-top:8px">';
      h += '<div class="wf-board-title" style="font-weight:600;margin-bottom:4px">' + t.label + '</div>';
      if (t.id === '基本信息') {
        var src = norm.sourceText || '';
        h += '<div class="text-muted text-sm">' + (src ? ('原文 ' + src.length + ' 字') : '无原文') + '</div>';
      } else {
        var entries = (norm.sections && norm.sections[t.id]) || [];
        h += treeHTML(entries);
      }
      h += '</div>';
    }
    h += '</div>';
    var ov = document.createElement('div');
    ov.className = 'ovl';
    ov.innerHTML = h;
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
    if (typeof window.文风树绑定只读 === 'function') window.文风树绑定只读(ov);
  });
}
window.文风查看弹窗 = 文风查看弹窗;
window.文风查看去编辑 = 文风查看去编辑;
window.文风编辑项 = 文风编辑项;
window.文风删除项 = 文风删除项;
