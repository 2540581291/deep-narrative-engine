// 深度-叙事引擎 · 角色卡 · 📦 导入导出子模块
// 支持导出角色为 JSON 文件，以及从 JSON 文件导入角色

var 角色库导入导出性别 = 'female';
var 角色库导入导出搜索 = '';

function 渲染导入导出面板() {
  var h = '<div class="n-card mb-12">';
  h += '<div class="fs-12 fw-600 c-fg mb-8">📦 导入 / 导出</div>';
  h += '<div class="fs-10 c-fg3 mb-12">将角色数据导出为 JSON 文件，或从 JSON 文件导入角色。</div>';

  // ===== 性别 tab（与角色库一致） =====
  h += '<div class="flex gap-6 mb-10">';
  for (var ci = 0; ci < 类别键数组.length; ci++) {
    var k = 类别键数组[ci];
    var info = 角色类别映射[k];
    var gc = S.generatedCharacters && S.generatedCharacters[k] ? Object.keys(S.generatedCharacters[k]).length : 0;
    var sel = 角色库导入导出性别 === k;
    h += '<div class="char-cat-tab flex-1' + (sel ? ' act' : '') + '" onclick="window.角色库导出设置性别(\'' + k + '\')">';
    h += '<div class="char-cat-tab-icon">' + info.icon + '</div>';
    h += '<div class="char-cat-tab-label">' + info.label + (gc ? ' (' + gc + ')' : '') + '</div>';
    h += '</div>';
  }
  h += '</div>';

  h += '<div class="bt-border mb-10"></div>';

  // ===== 导出区 =====
  h += '<div class="mb-6">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
  h += '<div class="fs-11 fw-600 c-fg">📤 导出角色</div>';
  h += '<div class="flex gap-4">';
  h += '<span class="btn btn-outline btn-sm" onclick="导出全选()">全部</span>';
  h += '<span class="btn btn-outline btn-sm" onclick="导出取消全选()">取消</span>';
  h += '</div>';
  h += '</div>';

  // 搜索框
  h += '<div class="mb-6">';
  h += '<input id="ieSearchInput" type="text" placeholder="🔍 按名称搜索..." value="' + escHtml(角色库导入导出搜索) + '" class="llm-input w-100" oninput="window.角色库导出设置搜索()">';
  h += '</div>';

  // 导出列表容器
  h += '<div id="charExportList" class="maxh-450 overflow-y-auto mb-6"></div>';

  h += '<div class="flex items-center gap-8">';
  h += '<button class="btn btn-primary" onclick="导出选中角色()">📤 导出选中</button>';
  h += '<span id="charExportCount" class="fs-11 c-fg3">已选 0 / 0</span>';
  h += '</div>';
  h += '</div>';

  h += '<div class="bt-border mb-10 mt-10"></div>';

  // ===== 导入区 =====
  h += '<div class="mb-8">';
  h += '<div class="fs-11 fw-600 c-fg mb-6">📥 导入角色</div>';
  h += '<div class="fs-10 c-fg3 mb-6">从 JSON 文件导入角色数据。支持单角色对象或角色数组格式。</div>';
  h += '<input type="file" id="charImportFileInput" accept=".json" class="dn" onchange="导入角色文件(this)">';
  h += '<div class="flex gap-8 flex-wrap mb-6">';
  h += '<button class="btn btn-primary" onclick="document.getElementById(\'charImportFileInput\').click()">📁 选择 JSON 文件</button>';
  h += '<button class="btn btn-outline" onclick="显示粘贴导入()">📋 粘贴 JSON</button>';
  h += '</div>';
  h += '<div id="charImportDropZone" class="char-import-dropzone" ondragover="event.preventDefault()" ondrop="导入拖放文件(event)">';
  h += '<div class="fs-16 c-fg3 mb-4">📂</div>';
  h += '<div class="fs-11 c-fg3">将 JSON 文件拖放到此处</div>';
  h += '<div class="fs-10 c-fg3">或点击上方按钮选择文件</div>';
  h += '</div>';
  h += '<div id="charImportPreview" class="mt-8"></div>';
  h += '</div>';

  // ===== 刷新区 =====
  h += '<div class="bt-border mb-10"></div>';
  h += '<div class="flex items-center gap-6">';
  h += '<button class="btn btn-outline" onclick="角色库刷新磁盘()">🔄 从磁盘刷新</button>';
  h += '<span class="fs-10 c-fg3">重新从磁盘加载所有角色，放弃内存中的未保存更改</span>';
  h += '</div>';

  h += '</div>';

  setTimeout(function() { 渲染导出列表(); }, 0);
  return h;
}

// ===== 导出列表（按性别分组） =====
var 角色导出复选框 = {};

function 渲染导出列表() {
  var el = document.getElementById('charExportList');
  if (!el) return;

  var catKey = 角色库导入导出性别;
  var searchText = (角色库导入导出搜索 || '').trim();
  var items = [];
  var genMap = S.generatedCharacters && S.generatedCharacters[catKey];
  if (genMap) {
    for (var id in genMap) {
      var e = genMap[id];
      if (!e) continue;
      var bi = {};
      if (e.fullChar) bi = (e.fullChar.identity && e.fullChar.identity.basicInfo) || {};
      else if (e.outline) bi = (e.outline.identity && e.outline.identity.basicInfo) || {};
      var name = bi.name || id;
      if (searchText && name.indexOf(searchText) < 0) continue;
      items.push({ id: id, name: name, phase: e.phase });
      if (角色导出复选框[id] === undefined) 角色导出复选框[id] = false;
    }
  }

  if (!items.length) {
    el.innerHTML = '<div class="fs-11 c-fg3 p-12-0 text-center">' + (searchText ? '没有匹配的角色。' : '当前性别暂无角色。先在「生成角色」中创建角色吧。') + '</div>';
    更新导出计数();
    return;
  }

  items.sort(function(a, b) { return a.name.localeCompare(b.name, 'zh'); });

  var h = '<table style="width:100%;border-collapse:collapse;font-size:11px">';
  h += '<thead><tr style="border-bottom:1px solid var(--border)">';
  h += '<th style="width:30px;padding:6px 8px"></th>';
  h += '<th style="padding:6px 8px;text-align:left;color:var(--fg3);font-weight:600;letter-spacing:1px">角色</th>';
  h += '<th style="padding:6px 8px;text-align:left;color:var(--fg3);font-weight:600;letter-spacing:1px">状态</th>';
  h += '</tr></thead><tbody>';

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var checked = 角色导出复选框[item.id] ? 'checked' : '';
    var phaseColor = item.phase === 'full' ? 'var(--success)' : 'var(--accent)';
    var phaseLabel = item.phase === 'full' ? '已生成' : '概要';

    h += '<tr style="border-bottom:1px solid var(--border)">';
    h += '<td style="padding:8px 4px 8px 8px"><input type="checkbox" ' + checked + ' onchange="切换导出选中(\'' + item.id + '\',this.checked);更新导出计数()" style="accent-color:var(--accent2);width:14px;height:14px"></td>';
    h += '<td style="padding:8px"><span class="fw-500 c-fg">' + escHtml(item.name) + '</span></td>';
    h += '<td style="padding:8px"><span class="badge-tag" style="background:' + phaseColor + '22;color:' + phaseColor + ';border:1px solid ' + phaseColor + '">' + phaseLabel + '</span></td>';
    h += '</tr>';
  }

  h += '</tbody></table>';
  el.innerHTML = h;
  更新导出计数();
}

function 切换导出选中(id, checked) { 角色导出复选框[id] = !!checked; }

function 更新导出计数() {
  var el = document.getElementById('charExportCount');
  if (!el) return;
  var total = 0, checked = 0;
  var genMap = S.generatedCharacters && S.generatedCharacters[角色库导入导出性别];
  if (genMap) {
    for (var id in genMap) {
      total++;
      if (角色导出复选框[id]) checked++;
    }
  }
  el.textContent = '已选 ' + checked + ' / ' + total;
}

function 导出全选() {
  var genMap = S.generatedCharacters && S.generatedCharacters[角色库导入导出性别];
  if (genMap) {
    for (var id in genMap) {
      角色导出复选框[id] = true;
    }
  }
  渲染导出列表();
}

function 导出取消全选() {
  var genMap = S.generatedCharacters && S.generatedCharacters[角色库导入导出性别];
  if (genMap) {
    for (var id in genMap) {
      角色导出复选框[id] = false;
    }
  }
  渲染导出列表();
}

window.角色库导出设置性别 = function(g) {
  角色库导入导出性别 = g;
  角色库导入导出搜索 = '';
  var content = document.getElementById('characterContent');
  if (content) 渲染角色主面板(content);
};

window.角色库导出设置搜索 = function() {
  var el = document.getElementById('ieSearchInput');
  if (el) 角色库导入导出搜索 = el.value.trim();
  渲染导出列表();
};

function 导入拖放文件(ev) {
  ev.preventDefault();
  var file = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
  if (!file || !file.name.endsWith('.json')) { toast('请拖入 JSON 文件'); return; }
  var input = document.getElementById('charImportFileInput');
  if (input) {
    // 复用 file input 的读取逻辑
    var dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    导入角色文件(input);
  }
}

function 导出选中角色() {
  var selected = [];
  for (var catKey in S.generatedCharacters) {
    for (var id in S.generatedCharacters[catKey]) {
      if (角色导出复选框[id]) {
        var e = S.generatedCharacters[catKey][id];
        // 构建导出数据：包含完整角色数据 + 元信息
        var data = null;
        if (e.fullChar) data = JSON.parse(JSON.stringify(e.fullChar));
        else if (e.outline) data = JSON.parse(JSON.stringify(e.outline));
        if (!data) continue;
        var bi = data.identity && data.identity.basicInfo || {};
        var name = bi.name || id;
        selected.push({
          _exportMeta: { id: id, catKey: catKey, desc: e.desc, phase: e.phase, createdAt: e.createdAt },
          data: data,
          name: name,
        });
      }
    }
  }
  if (!selected.length) { toast('请至少选择一个角色'); return; }
  // 生成 JSON 并下载
  var jsonStr = JSON.stringify(selected.length === 1 ? selected[0] : selected, null, 2);
  var blob = new Blob([jsonStr], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = selected.length === 1 ? selected[0].name + '.json' : '角色导出_' + Date.now() + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('✅ 已导出 ' + selected.length + ' 个角色');
  // 重置复选框
  角色导出复选框 = {};
  渲染导出列表();
}

// ===== 导入 =====
function 导入角色文件(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var data = JSON.parse(e.target.result);
      处理导入数据(data);
    } catch(err) { toast('❌ JSON 解析失败: ' + err.message); }
    input.value = '';
  };
  reader.readAsText(file);
}

function 显示粘贴导入() {
  var el = document.getElementById('charImportPreview');
  if (!el) return;
  el.innerHTML = '<textarea id="charImportPasteArea" class="llm-input w-100 resize-v textarea-area" placeholder="在此粘贴角色 JSON 数据..."></textarea>'
    + '<button class="btn btn-primary" onclick="提交粘贴导入()" style="margin-top:6px">📥 导入</button>';
}

function 提交粘贴导入() {
  var ta = document.getElementById('charImportPasteArea');
  if (!ta || !ta.value.trim()) { toast('请粘贴 JSON 数据'); return; }
  try {
    var data = JSON.parse(ta.value.trim());
    处理导入数据(data);
  } catch(err) { toast('❌ JSON 解析失败: ' + err.message); }
}

function 处理导入数据(data) {
  // 兼容单角色和多角色数组
  var items = Array.isArray(data) ? data : [data];
  var imported = 0;
  items.forEach(function(item) {
    // 提取角色数据
    var charData = item.data || item;
    if (!charData.identity || !charData.identity.basicInfo || !charData.identity.basicInfo.name) {
      toast('⚠️ 跳过无效角色数据（缺少 identity.basicInfo.name）');
      return;
    }
    var meta = item._exportMeta || {};
    var name = charData.identity.basicInfo.name;
    var catKey = meta.catKey || charData.identity.basicInfo.gender || 'female';
    // 性别 → catKey 映射
    var genderMap = { '女性': 'female', '男性': 'male', '伪娘': 'femboy', '扶她': 'futa' };
    if (!meta.catKey) catKey = genderMap[catKey] || 'female';
    var id = meta.id || name;
    if (id !== name) id = name; // 用角色名作为 id
    // 检测是全角色还是概要
    var hasFull = !!(charData.appearance || charData.sexOrgans || charData.sexualHistory);
    if (!S.generatedCharacters) S.generatedCharacters = {};
    if (!S.generatedCharacters[catKey]) S.generatedCharacters[catKey] = {};
    var entry = {
      id: id,
      catKey: catKey,
      desc: meta.desc || charData._desc || '',
      phase: hasFull ? 'full' : 'outline',
      status: 'pending',
      createdAt: meta.createdAt || Date.now(),
    };
    if (hasFull) { entry.fullChar = charData; }
    else { entry.outline = charData; }
    S.generatedCharacters[catKey][id] = entry;
    imported++;
  });
  if (imported > 0) {
    if (typeof 角色持久化 === 'function') 角色持久化();
    toast('✅ 成功导入 ' + imported + ' 个角色');
    // 刷新导出列表和角色库
    渲染导出列表();
    var content = document.getElementById('characterContent');
    if (content) 渲染角色主面板(content);
  }
}

window.渲染导入导出面板 = 渲染导入导出面板;
window.导出选中角色 = 导出选中角色;
window.切换导出选中 = 切换导出选中;
window.导入角色文件 = 导入角色文件;
window.显示粘贴导入 = 显示粘贴导入;
window.提交粘贴导入 = 提交粘贴导入;
window.渲染导出列表 = 渲染导出列表;
window.导出全选 = 导出全选;
window.导出取消全选 = 导出取消全选;
window.更新导出计数 = 更新导出计数;
window.导入拖放文件 = 导入拖放文件;

// ===== 从磁盘重新加载所有角色 =====
window.角色库刷新磁盘 = function() {
  if (!window.confirm('从磁盘重新加载将丢失所有未保存的内存修改，确定吗？')) return;
  if (typeof window.角色重新加载 !== 'function') { window.toast('❌ 角色加载函数不可用'); return; }
  window.角色重新加载().then(function() {
    window.toast('✅ 已从磁盘重新加载');
    渲染导出列表();
    var content = document.getElementById('characterContent');
    if (content) 渲染角色主面板(content);
  }).catch(function() {
    window.toast('❌ 重新加载失败');
  });
};

// backward compat
window.renderCharImportExportPanel = window.渲染导入导出面板;
window.wxExportSelected = window.导出选中角色;
window.wxToggleExport = window.切换导出选中;
window.wxImportCharFile = window.导入角色文件;
window.wxShowImportPaste = window.显示粘贴导入;
window.wxImportPasteSubmit = window.提交粘贴导入;
window.wxRenderExportList = window.渲染导出列表;
window.wxExportSelectAll = window.导出全选;
window.wxExportDeselectAll = window.导出取消全选;
