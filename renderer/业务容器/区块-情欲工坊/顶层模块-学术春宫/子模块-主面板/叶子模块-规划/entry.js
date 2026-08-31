// 学术春宫 · 📝 规划（AI 生成；子类型绑定当前类别；年级段为通用字段）
// 依赖全局：学术类别 / 学术当前类别 / 类型说明 / 类别专属字段 / 年级段选项 / 学科门类 / 门类说明 / 专业类说明 / 二级学科说明

function 渲染类型专属字段(cat) {
  var cfg = 类别专属字段[cat];
  if (!cfg || !cfg.fields) return '';
  var h = '<div style="display:flex;gap:12px;flex-wrap:wrap">';
  cfg.fields.forEach(function(f) {
    h += '<div style="flex:1;min-width:160px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px;font-weight:500">' + f.label + '</label>';
    if (f.type === 'select') {
      h += '<select class="llm-input llm-select" id="aiField_' + f.key + '" style="width:100%">';
      f.options.forEach(function(o) { h += '<option value="' + o + '">' + o + '</option>'; });
      h += '</select>';
    } else {
      h += '<input class="llm-input" id="aiField_' + f.key + '" style="width:100%" placeholder="' + (f.placeholder||'') + '">';
    }
    h += '</div>';
  });
  h += '</div>';
  return h;
}

function 学术渲染规划(el) {
  var cat = 学术当前类别;
  var 类别 = 学术类别[cat];
  if (!类别) { el.innerHTML = '<div class="placeholder-text" style="padding:40px;text-align:center">请选择类别</div>'; return; }
  var typeList = 类别.subtypes || [];

  var authors = [];
  var authorOpts = '<option value="">— 不引用作家 —</option>';

  function 渲染作家下拉() {
    authors = (typeof 获取作家列表 === 'function') ? 获取作家列表() : [];
    if (!authors.length && typeof 加载作家列表 === 'function') {
      加载作家列表().then(function() { 渲染作家下拉(); });
      return;
    }
    authors.forEach(function(a) { authorOpts += '<option value="' + escHtml(a.name) + '">' + escHtml(a.name) + '</option>'; });
    var sel = document.getElementById('aiBookAuthor');
    if (sel) sel.innerHTML = authorOpts;
  }

  authors = (typeof 获取作家列表 === 'function') ? 获取作家列表() : [];
  if (!authors.length && typeof 加载作家列表 === 'function') {
    加载作家列表().then(function() { 渲染作家下拉(); });
  }
  authors.forEach(function(a) { authorOpts += '<option value="' + escHtml(a.name) + '">' + escHtml(a.name) + '</option>'; });

  var defaultType = typeList[0] || '';

  var h = '';
  h += '<h3 style="font-size:14px;font-weight:600;margin-bottom:16px">🤖 AI 生成「' + 类别.label + '」内容</h3>';

  // 主卡片
  h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:4px;padding:16px;margin-bottom:12px">';

  // 子类型
  h += '<div style="margin-bottom:14px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px;font-weight:500">子类型</label>';
  h += '<select id="aiBookType" class="llm-input llm-select" style="width:100%">';
  typeList.forEach(function(st) { h += '<option value="' + st + '"' + (st === defaultType ? ' selected' : '') + '>' + st + '</option>'; });
  h += '</select>';
  h += '<div id="aiTypeDesc" style="font-size:10px;color:var(--fg3);margin-top:4px;line-height:1.4">' + 类型说明[defaultType] + '</div></div>';

  // 学科
  h += '<div style="margin-bottom:14px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px;font-weight:500">学科</label>';
  h += '<div style="display:flex;gap:8px">';
  h += '<select id="aiField_category" class="llm-input llm-select" style="flex:1" onchange="更新学科二级列表()">';
  h += '<option value="">— 门类 —</option>';
  Object.keys(学科门类).forEach(function(c) { h += '<option value="' + c + '">' + c + '</option>'; });
  h += '</select>';
  h += '<select id="aiField_subject" class="llm-input llm-select" style="flex:1" onchange="更新学科三级列表()">';
  h += '<option value="">— 一级学科 —</option>';
  h += '</select>';
  h += '<select id="aiField_subject2" class="llm-input llm-select" style="flex:1" onchange="更新学科描述()">';
  h += '<option value="">— 二级学科 —</option>';
  h += '</select>';
  h += '</div>';
  h += '<div id="aiSubjectDesc" style="font-size:10px;color:var(--fg3);margin-top:4px;line-height:1.4">全部学科</div></div>';

  // 年级段（通用字段：所有类别都显示，位于学科下方 / 标题上方）
  h += '<div style="margin-bottom:14px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px;font-weight:500">年级段</label>';
  h += '<select id="aiBookLevel" class="llm-input llm-select" style="width:100%">';
  年级段选项.forEach(function(lv) { h += '<option value="' + lv + '"' + (lv === '大学' ? ' selected' : '') + '>' + lv + '</option>'; });
  h += '</select></div>';

  // 标题
  h += '<div style="margin-bottom:14px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px;font-weight:500">标题</label>';
  h += '<div class="ai-field-row" style="display:flex;gap:6px">';
  h += '<input class="llm-input" id="aiBookTitle" style="flex:1" placeholder="留空由 AI 自动生成">';
  h += '<button class="ai-suggest-btn" onclick="window._aiTargetId=\'aiBookTitle\';openAiPanel(\'booksTitle\')" title="AI 生成标题" style="padding:4px 10px;border:1px solid var(--border);border-radius:4px;background:transparent;color:var(--accent2);cursor:pointer;font-size:14px">🤖</button>';
  h += '<div id="aiopts_booksTitle" class="ai-options" style="display:none;margin-top:4px"></div>';
  h += '</div></div>';

  // 作家
  h += '<div style="margin-bottom:14px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px;font-weight:500">作家</label>';
  h += '<select class="llm-input llm-select" id="aiBookAuthor" style="width:100%">' + authorOpts + '</select></div>';

  // 内容简述
  h += '<div style="margin-bottom:0"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px;font-weight:500">内容简述</label>';
  h += '<textarea class="llm-input" id="aiBookDesc" style="width:100%;min-height:70px;resize:vertical;font-size:12px" placeholder="简述这本书的核心内容、主题方向…"></textarea></div>';

  h += '</div>';

  // 类型专属卡片（当前类别专属）
  h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:4px;padding:16px;margin-bottom:12px">';
  h += '<div style="font-size:12px;font-weight:600;color:var(--accent2);margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid var(--border)">📌 类型专属（' + 类别.label + '）</div>';
  h += '<div id="aiTypeSpecific">' + 渲染类型专属字段(cat) + '</div></div>';

  // 生成按钮
  h += '<div style="display:flex;gap:8px"><button class="btn-main" onclick="doAI生成学术()">🎯 生成</button></div>';

  el.innerHTML = h;

  // 子类型切换 → 仅更新说明（类型专属按类别，不随子类型变化）
  document.getElementById('aiBookType').addEventListener('change', function() {
    var d = document.getElementById('aiTypeDesc');
    if (d) d.textContent = 类型说明[this.value] || '';
  });

  // 学科三级联动初始化
  更新学科二级列表();
  更新学科三级列表();
}

function 更新学科二级列表() {
  var cat = document.getElementById('aiField_category');
  if (!cat) return;
  var sub = document.getElementById('aiField_subject');
  var sub2 = document.getElementById('aiField_subject2');
  if (!sub || !sub2) return;
  sub2.innerHTML = '<option value="">— 二级学科 —</option>';
  var h = '<option value="">— 一级学科 —</option>';
  if (cat.value) {
    Object.keys(学科门类[cat.value]||{}).forEach(function(s) { h += '<option value="' + s + '">' + s + '</option>'; });
  } else {
    for (var c in 学科门类) { for (var s in 学科门类[c]) { h += '<option value="' + s + '">' + s + '</option>'; } }
  }
  sub.innerHTML = h;
  更新学科描述();
  更新学科三级列表();
}
function 更新学科三级列表() {
  var cat = document.getElementById('aiField_category');
  var sub = document.getElementById('aiField_subject');
  var sub2 = document.getElementById('aiField_subject2');
  if (!cat || !sub || !sub2) return;
  var h = '<option value="">— 二级学科 —</option>';
  if (sub.value) {
    (学科门类[cat.value]&&学科门类[cat.value][sub.value]||[]).forEach(function(s) { h += '<option value="' + s + '">' + s + '</option>'; });
  } else if (cat.value && !sub.value) {
    for (var s in 学科门类[cat.value]) {
      学科门类[cat.value][s].forEach(function(d) { h += '<option value="' + d + '">' + d + '</option>'; });
    }
  } else {
    for (var c in 学科门类) {
      for (var s in 学科门类[c]) {
        学科门类[c][s].forEach(function(d) { h += '<option value="' + d + '">' + d + '</option>'; });
      }
    }
  }
  sub2.innerHTML = h;
  更新学科描述();
}
function 更新学科描述() {
  var desc = document.getElementById('aiSubjectDesc');
  if (!desc) return;
  var cat = document.getElementById('aiField_category');
  var sub = document.getElementById('aiField_subject');
  var sub2 = document.getElementById('aiField_subject2');
  var c = cat ? cat.value : '';
  var s = sub ? sub.value : '';
  var s2 = sub2 ? sub2.value : '';
  var parts = [];
  if (c) parts.push(c + (门类说明[c] ? '（' + 门类说明[c] + '）' : ''));
  if (s) parts.push(s + (专业类说明[s] ? '（' + 专业类说明[s] + '）' : ''));
  if (s2) parts.push(s2 + (二级学科说明[s2] ? '（' + 二级学科说明[s2] + '）' : ''));
  desc.textContent = parts.length ? '当前：' + parts.join(' > ') : '全部学科';
}

// 暴露全局
window.学术渲染规划 = 学术渲染规划;
