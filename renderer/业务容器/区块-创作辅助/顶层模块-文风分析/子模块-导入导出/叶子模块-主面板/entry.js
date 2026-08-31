// 参考文档（文风分析）· 导入导出

// ===== 导入导出 =====
function 渲染文风导入导出(el) {
  var counts = { total: 0 };
  Store.refDoc.list().then(function(items) {
    if (items) counts.total = items.length;

    var h = '<div class="n-card mb-12">';
    h += '<div class="fs-12 fw-600 c-fg mb-8">📦 导入 / 导出</div>';
    h += '<div class="fs-10 c-fg3 mb-12">将文风分析数据导出为 JSON 文件，或从 JSON 文件导入分析数据。</div>';

    h += '<div class="flex gap-6 flex-wrap mb-8 fs-10 c-fg3 p-6-10 bg-bg2 rad-6">';
    h += '分析总数：<span class="c-fg fw-600">' + counts.total + '</span>';
    h += '</div>';

    h += '<div class="mb-12">';
    h += '<div class="flex items-center justify-between mb-6">';
    h += '<div class="fs-11 fw-600 c-fg">📤 导出分析数据</div>';
    h += '<div class="flex gap-4">';
    h += '<span class="btn btn-outline btn-sm" onclick="文风导出全选()">全部</span>';
    h += '<span class="btn btn-outline btn-sm" onclick="文风导出取消全选()">取消</span>';
    h += '</div>';
    h += '</div>';
    h += '<div id="styleExportList" class="maxh-450 overflow-y-auto mb-6"></div>';
    h += '<div class="flex items-center gap-8">';
    h += '<button class="btn btn-primary" onclick="文风导出选中()">📤 导出选中</button>';
    h += '<span id="styleExportCount" class="fs-11 c-fg3">已选 0 / ' + counts.total + '</span>';
    h += '</div>';
    h += '</div>';

    h += '<div class="bt-border mb-12"></div>';

    h += '<div class="mb-8">';
    h += '<div class="fs-11 fw-600 c-fg mb-6">📥 导入分析数据</div>';
    h += '<div class="fs-10 c-fg3 mb-6">从 JSON 文件导入文风分析数据。支持单条或数组格式。</div>';
    h += '<input type="file" id="styleImportFileInput" accept=".json" class="dn" onchange="文风导入文件(this)">';
    h += '<div class="flex gap-8 flex-wrap mb-6">';
    h += '<button class="btn btn-primary" onclick="document.getElementById(\'styleImportFileInput\').click()">📁 选择 JSON 文件</button>';
    h += '<button class="btn btn-outline" onclick="文风显示粘贴导入()">📋 粘贴 JSON</button>';
    h += '</div>';

    h += '<div id="styleImportDropZone" style="border:2px dashed var(--border);border-radius:8px;padding:20px;text-align:center;cursor:pointer" ondragover="event.preventDefault()" ondrop="文风导入拖放(event)">';
    h += '<div class="fs-16 c-fg3 mb-4">📂</div>';
    h += '<div class="fs-11 c-fg3">将 JSON 文件拖放到此处</div>';
    h += '<div class="fs-10 c-fg3">或点击上方按钮选择文件</div>';
    h += '</div>';

    h += '<div id="styleImportPreview" class="mt-8"></div>';
    h += '</div>';
    h += '</div>';

    el.innerHTML = h;
    文风渲染导出列表();
  });
}

// 导出相关
var 文风导出复选框 = {};

function 文风渲染导出列表() {
  var el = document.getElementById('styleExportList');
  if (!el) return;
  Store.refDoc.list().then(function(items) {
    if (!items || !items.length) { el.innerHTML = '<div class="fs-11 c-fg3 p-12-0 text-center">暂无数据可导出</div>'; return; }

    var h = '';
    items.forEach(function(f) {
      // list() 返回数组；用 _dirName（目录名）作为稳定复选框键，title 仅作显示
      var key = f._dirName || f.title || '';
      var title = (window.文风归一化 || function(x){return x||{};})(f).title || key;
      if (文风导出复选框[key] === undefined) 文风导出复选框[key] = false;
      var checked = 文风导出复选框[key] ? 'checked' : '';
      h += '<label class="flex items-center gap-6 p-4-8 cur-ptr fs-11 c-fg rad-3 mb-2" style="cursor:pointer;background:var(--bg2);border-radius:4px">';
      h += '<input type="checkbox" ' + checked + ' onchange="文风切换导出(\'' + escHtml(key) + '\',this.checked);文风更新导出计数()" style="accent-color:var(--accent2)">';
      h += escHtml(title);
      h += '</label>';
    });
    el.innerHTML = h;
    文风更新导出计数();
  });
}

function 文风切换导出(name, checked) { 文风导出复选框[name] = !!checked; }
function 文风更新导出计数() {
  var el = document.getElementById('styleExportCount');
  if (!el) return;
  Store.refDoc.list().then(function(items) {
    var total = items ? items.length : 0;
    var checked = 0;
    for (var k in 文风导出复选框) { if (文风导出复选框[k]) checked++; }
    el.textContent = '已选 ' + checked + ' / ' + total;
  });
}
function 文风导出全选() {
  Store.refDoc.list().then(function(items) {
    if (!items) return;
    items.forEach(function(f) { var key = f._dirName || f.title || ''; if (key) 文风导出复选框[key] = true; });
    文风渲染导出列表();
  });
}
function 文风导出取消全选() {
  文风导出复选框 = {};
  文风渲染导出列表();
}

function 文风导出选中() {
  Store.refDoc.list().then(function(items) {
    if (!items) return;
    var selected = [];
    items.forEach(function(f) {
      var key = f._dirName || f.title || '';
      if (key && 文风导出复选框[key]) {
        selected.push(f);
      }
    });
    if (!selected.length) { toast('请至少选择一项'); return; }
    var jsonStr = JSON.stringify(selected.length === 1 ? selected[0] : selected, null, 2);
    var blob = new Blob([jsonStr], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = selected.length === 1 ? (selected[0].title || '文风分析') + '.json' : '文风分析导出_' + Date.now() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('已导出 ' + selected.length + ' 项');
    文风导出复选框 = {};
    文风渲染导出列表();
  });
}

// 导入相关
function 文风导入文件(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var data = JSON.parse(e.target.result);
      文风处理导入(data);
    } catch(err) { toast('JSON 解析失败: ' + err.message); }
    input.value = '';
  };
  reader.readAsText(file);
}

function 文风显示粘贴导入() {
  var el = document.getElementById('styleImportPreview');
  if (!el) return;
  el.innerHTML = '<textarea id="styleImportPasteArea" class="llm-input w-100 resize-v textarea-area" placeholder="在此粘贴 JSON 数据..."></textarea>'
    + '<button class="btn btn-primary" onclick="文风提交粘贴导入()" style="margin-top:6px">📥 导入</button>';
}

function 文风提交粘贴导入() {
  var ta = document.getElementById('styleImportPasteArea');
  if (!ta || !ta.value.trim()) { toast('请粘贴 JSON 数据'); return; }
  try {
    var data = JSON.parse(ta.value.trim());
    文风处理导入(data);
  } catch(err) { toast('JSON 解析失败: ' + err.message); }
}

function 文风导入拖放(ev) {
  ev.preventDefault();
  var file = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
  if (!file || !file.name.endsWith('.json')) { toast('请拖入 JSON 文件'); return; }
  var input = document.getElementById('styleImportFileInput');
  if (input) {
    var dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    文风导入文件(input);
  }
}

function 文风处理导入(data) {
  var items = Array.isArray(data) ? data : [data];
  var imported = 0;
  items.forEach(function(item) {
    if (!item || (!item.title && !item.analysis && !item.sections && !item.content)) { toast('跳过无效数据'); return; }
    // 统一归一化（兼容旧 schema 的 content 形式），确保 sections 为合法对象
    var norm = (window.文风归一化 || function(x){return x||{};})(item);
    var key = norm.title || '未命名_' + Date.now();
    Store.refDoc.save(key, {
      title: norm.title || '未命名',
      tags: norm.tags || [],
      sourceText: norm.sourceText || '',
      sections: norm.sections || null,
      analysis: norm.analysis || '',
      createdAt: norm.createdAt || fmtDate(new Date()),
      updatedAt: norm.updatedAt || fmtDate(new Date())
    }).then(function() { imported++; });
  });
  if (imported > 0) {
    setTimeout(function() { toast('成功导入 ' + imported + ' 项'); 文风渲染导出列表(); }, 100);
  }
}

window.文风切换视图 = 文风切换视图;
window.文风导出全选 = 文风导出全选;
window.文风导出取消全选 = 文风导出取消全选;
window.文风导出选中 = 文风导出选中;
window.文风切换导出 = 文风切换导出;
window.文风更新导出计数 = 文风更新导出计数;
window.文风渲染导出列表 = 文风渲染导出列表;
window.文风导入文件 = 文风导入文件;
window.文风显示粘贴导入 = 文风显示粘贴导入;
window.文风提交粘贴导入 = 文风提交粘贴导入;
window.文风导入拖放 = 文风导入拖放;

// ===== 路由注册 =====
Store.refDoc = createStore('refDoc');
try {
  window.注册页面路由('ref-doc', function(el) { 文风切换视图(文风当前视图); });
} catch(e) { console.error('ref-doc route registration failed:', e); }
