// 情色杂物 · 记录文书 · 调教（调教计划 + 调教日志 + 性奴日志 三合一）
// 三者是同一个调教过程的三个对位视角，合并为一个入口：
//   调教计划 = 主人事前写「怎么调」；调教日志 = 主人事后写「怎么执行」；性奴日志 = 性奴事后写「我的内心」
// 导航：入口 → 计划列表 → 点进某计划 → 详情页内「计划 / 调教日志 / 性奴日志」三个子 tab
// 关联：三份文档各自独立可生成，靠「引用参考文档」把另一份正文作为 AI 上下文，实现「从一个文件反推另外两个」

var 调教当前计划 = null;   // 当前选中计划 title
var 调教子tab = 'plan';     // plan / trainlog / slavelog
var 调教编辑 = {};          // 当前编辑状态 { title, content, refStoreKey, refTitle }
var 调教编辑原标题 = null;  // 当前文档在 store 里的 title（null = 尚未建档）
var 调教防抖保存 = null;

var 调教类型 = {
  plan:     { storeKey: 'docPlan',     promptName: 'doc_plan_gen',     aiFieldId: 'trainingPlanGen',     label: '计划',     icon: '🗓️', 类型名: '调教计划' },
  trainlog: { storeKey: 'docTrainLog', promptName: 'doc_trainlog_gen', aiFieldId: 'trainingTrainlogGen', label: '调教日志', icon: '📝', 类型名: '调教日志' },
  slavelog: { storeKey: 'docSlaveLog', promptName: 'doc_slavelog_gen', aiFieldId: 'trainingSlavelogGen', label: '性奴日志', icon: '📖', 类型名: '性奴日志' },
};

// ===== 入口（主界面 case 调用）=====
function 调教入口() {
  var el = document.getElementById('doc-planContent');
  if (!el) return;
  调教子tab = 'plan';
  调教渲染计划列表(el);
}
window.调教入口 = 调教入口;

// ===== 第一级：计划列表 =====
function 调教渲染计划列表(el) {
  Store.docPlan.list().then(function(items) {
    var h = '<div class="mb-10 flex gap-4 flex-wrap align-center">';
    h += '<button class="btn-new" onclick="调教新计划()">＋ 新建</button>';
    h += '<span class="text-sm text-muted">调教计划 · 调教日志 · 性奴日志 三合一</span>';
    h += '</div>';
    if (!items || !items.length) {
      h += '<div class="placeholder-text">暂无调教计划，点击「＋ 新建计划」开始</div>';
    } else {
      items.forEach(function(item) {
        h += '<div class="n-card cur-ptr mb-6 p-10" onclick="调教打开计划(\'' + escHtml(item.title) + '\')">';
        h += '<div class="fw-600 fs-14">🗓️ ' + escHtml(item.title) + '</div>';
        h += '<div class="mt-4 flex gap-4">';
        h += '<span class="btn-secondary btn-sm" onclick="event.stopPropagation();调教编辑计划(\'' + escHtml(item.title) + '\')">✏️ 编辑</span>';
        h += '<span class="btn-secondary btn-sm c-error" onclick="event.stopPropagation();调教删除计划(\'' + escHtml(item.title) + '\')">🗑 删除</span>';
        h += '</div></div>';
      });
    }
    el.innerHTML = h;
  });
}

function 调教新计划() {
  调教当前计划 = null;
  调教子tab = 'plan';
  调教编辑 = { title: '', content: '', refStoreKey: '', refTitle: '' };
  调教编辑原标题 = null;
  var el = document.getElementById('doc-planContent');
  if (!el) return;
  调教渲染详情(el);
}

function 调教删除计划(title) {
  confirmDialog('确定删除计划「' + title + '」？其下的调教日志、性奴日志不会自动删除。', function() {
    Store.docPlan.delete(title).then(function() {
      toast('已删除');
      var el = document.getElementById('doc-planContent');
      if (el) 调教渲染计划列表(el);
    });
  });
}

// ===== 第二级：详情页（计划 / 调教日志 / 性奴日志 三个子 tab）=====
function 调教打开计划(title) {
  调教当前计划 = title;
  调教子tab = 'plan';
  调教编辑 = { title: '', content: '', refStoreKey: '', refTitle: '' };
  调教编辑原标题 = null;
  var el = document.getElementById('doc-planContent');
  if (!el) return;
  调教渲染详情(el);
}

function 调教渲染详情(el) {
  var subTabs = [
    { id: 'plan', label: '🗓️ 计划' },
    { id: 'trainlog', label: '📝 调教日志' },
    { id: 'slavelog', label: '📖 性奴日志' },
  ];
  var h = '';
  // 面包屑：返回计划列表
  h += '<div class="mb-10 flex gap-4 align-center">';
  h += '<span class="btn-secondary btn-sm" onclick="调教返回列表()">← 计划列表</span>';
  h += '<span class="fw-600 fs-14">' + (调教当前计划 ? escHtml(调教当前计划) : '新建计划') + '</span>';
  h += '</div>';
  // 子 tab
  h += '<div class="sub-nav">';
  subTabs.forEach(function(t) { h += '<div class="sub-nav-item' + (t.id === 调教子tab ? ' act' : '') + '" data-t="' + t.id + '">' + t.label + '</div>'; });
  h += '</div><div id="trainingSubContent"></div>';
  el.innerHTML = h;
  el.querySelectorAll('.sub-nav-item').forEach(function(i) {
    i.addEventListener('click', function() {
      调教子tab = this.getAttribute('data-t');
      调教编辑 = { title: '', content: '', refStoreKey: '', refTitle: '' };
      调教编辑原标题 = null;
      调教渲染详情(el);
    });
  });
  var subEl = document.getElementById('trainingSubContent');
  if (!subEl) return;
  if (调教子tab === 'plan') {
    调教渲染计划子tab(subEl);
  } else {
    调教渲染日志子tab(subEl);
  }
}

function 调教返回列表() {
  var el = document.getElementById('doc-planContent');
  if (!el) return;
  调教当前计划 = null;
  调教子tab = 'plan';
  调教渲染计划列表(el);
}

// ===== 计划子 tab：编辑当前计划 =====
function 调教渲染计划子tab(subEl) {
  if (调教当前计划) {
    Store.docPlan.get(调教当前计划).then(function(m) {
      调教编辑 = { title: m.title || 调教当前计划, content: m.content || '', refStoreKey: '', refTitle: '' };
      调教编辑原标题 = m.title || 调教当前计划;
      调教渲染编辑器(subEl, 'plan');
    });
  } else {
    调教渲染编辑器(subEl, 'plan');
  }
}

// ===== 日志子 tab：列表（挂在当前计划下）+ 编辑器 =====
function 调教渲染日志子tab(subEl) {
  var type = 调教类型[调教子tab];
  if (!调教当前计划) {
    subEl.innerHTML = '<div class="placeholder-text">请先选择或新建一个计划，再为其添加' + type.label + '</div>';
    return;
  }
  // 列表 + 新建按钮
  Store[type.storeKey].list().then(function(items) {
    var mine = (items || []).filter(function(i) { return i.parentStoreKey === 'docPlan' && i.parentTitle === 调教当前计划; });
    var h = '<div class="mb-10 flex gap-4 flex-wrap align-center">';
    h += '<button class="btn-new" onclick="调教新日志()">＋ 新建</button>';
    h += '</div>';
    if (!mine.length) {
      h += '<div class="placeholder-text">暂无' + type.label + '，点击「＋ 新建' + type.label + '」或下方 AI 生成</div>';
    } else {
      mine.forEach(function(item) {
        h += '<div class="n-card cur-ptr mb-6 p-10" onclick="调教打开日志(\'' + escHtml(item.title) + '\')">';
        h += '<div class="fw-600 fs-14">' + type.icon + ' ' + escHtml(item.title) + '</div>';
        h += '<div class="mt-4 flex gap-4">';
        h += '<span class="btn-secondary btn-sm" onclick="event.stopPropagation();调教删除日志(\'' + escHtml(item.title) + '\')">🗑 删除</span>';
        h += '</div></div>';
      });
    }
    h += '<div id="trainingLogEditor"></div>';
    subEl.innerHTML = h;
  });
}

function 调教新日志() {
  调教编辑 = { title: '', content: '', refStoreKey: '', refTitle: '' };
  调教编辑原标题 = null;
  var subEl = document.getElementById('trainingLogEditor');
  if (!subEl) {
    // 编辑器容器尚未建立（可能正在列表渲染），重新渲染
    var el = document.getElementById('doc-planContent');
    if (el) 调教渲染详情(el);
    return;
  }
  调教渲染编辑器(subEl, 调教子tab);
}

function 调教打开日志(title) {
  调教编辑原标题 = title;
  var type = 调教类型[调教子tab];
  Store[type.storeKey].get(title).then(function(m) {
    调教编辑 = { title: m.title || title, content: m.content || '', refStoreKey: m.refStoreKey || '', refTitle: m.refTitle || '' };
    调教编辑原标题 = m.title || title;
    var subEl = document.getElementById('trainingLogEditor');
    if (subEl) 调教渲染编辑器(subEl, 调教子tab);
  });
}

function 调教删除日志(title) {
  var type = 调教类型[调教子tab];
  confirmDialog('确定删除「' + title + '」？', function() {
    Store[type.storeKey].delete(title).then(function() {
      toast('已删除');
      var el = document.getElementById('doc-planContent');
      if (el) 调教渲染详情(el);
    });
  });
}

// ===== 编辑器（计划/日志 通用）=====
function 调教渲染编辑器(el, kind) {
  var type = 调教类型[kind];
  var s = 调教编辑;
  var refLabel = '';
  if (s.refStoreKey && s.refTitle) {
    var refTypeName = (调教类型.plan.storeKey === s.refStoreKey) ? '计划' : (调教类型.trainlog.storeKey === s.refStoreKey ? '调教日志' : '性奴日志');
    refLabel = refTypeName + '：' + s.refTitle;
  }
  var h = '<div class="mw-600">';
  // 标题行
  h += '<div class="n-card p-10 mb-6">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">';
  h += '<span style="width:3px;height:12px;background:var(--accent2)"></span>';
  h += '<span style="font-size:11px;letter-spacing:2px;color:var(--fg2)">' + type.icon + ' ' + type.label + '信息</span>';
  h += '</div>';
  h += '<div class="ai-field-row">';
  h += '<input class="llm-input" id="训练Title" placeholder="' + type.label + '名（失焦即建档）" value="' + escHtml(s.title || '') + '" style="flex:2" onchange="调教标题变更(this.value)">';
  h += '</div></div>';
  // 引用参考文档卡
  h += '<div class="n-card p-10 mb-6">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">';
  h += '<span style="width:3px;height:12px;background:var(--accent2)"></span>';
  h += '<span style="font-size:11px;letter-spacing:2px;color:var(--fg2)">📎 引用参考文档</span>';
  h += '<span style="margin-left:auto;font-size:10px;color:var(--fg3)">AI 生成时把所选文档正文作为上下文</span>';
  h += '</div>';
  h += '<div class="flex gap-4 align-center" style="flex-wrap:wrap">';
  h += '<button class="btn-sm" onclick="调教选择参考()">📎 选择参考文档</button>';
  h += (s.refStoreKey && s.refTitle ? '<span class="tag-chip">' + escHtml(refLabel) + '</span>' : '<span class="text-sm text-muted">未选择（将自由生成）</span>');
  h += (s.refStoreKey && s.refTitle ? '<span class="tag-chip" style="color:var(--fg3)" onclick="调教清除参考()">✕ 清除</span>' : '');
  h += '</div></div>';
  // 正文编辑卡
  h += '<div class="n-card p-10 mb-6">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">';
  h += '<span style="width:3px;height:12px;background:var(--accent2)"></span>';
  h += '<span style="font-size:11px;letter-spacing:2px;color:var(--fg2)">正文</span>';
  h += '<span style="margin-left:auto;font-size:10px;color:var(--fg3)">输入即自动保存</span>';
  h += '</div>';
  h += '<textarea class="llm-input" id="训练Content" placeholder="' + type.label + '正文" style="width:100%;min-height:280px;resize:vertical" oninput="调教正文变更(this.value)">' + escHtml(s.content || '') + '</textarea>';
  h += '</div>';
  // AI 生成卡
  h += '<div class="n-card p-10 mb-6">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">';
  h += '<span style="width:3px;height:12px;background:var(--accent2)"></span>';
  h += '<span style="font-size:11px;letter-spacing:2px;color:var(--fg2)">🚀 AI 生成</span>';
  h += '</div>';
  h += '<textarea class="llm-input" id="训练Direction" placeholder="方向（可选，如：主仆关系明确、重口味）" style="width:100%;height:56px;resize:vertical"></textarea>';
  h += '<button class="btn btn-primary" style="width:100%;padding:10px 18px;font-size:13px;margin-top:8px" onclick="openAiGenPanel(\'' + type.aiFieldId + '\')">🚀 AI 生成</button>';
  h += '</div>';
  h += '</div>';
  el.innerHTML = h;
}

// ===== 即时保存 =====
function 调教标题变更(val) {
  var t = (val || '').trim();
  调教编辑.title = t;
  if (!t) return;
  if (调教编辑原标题 && 调教编辑原标题 !== t) {
    // 改名：删旧建新（保留 content）
    var oldTitle = 调教编辑原标题;
    var type = 调教类型[调教子tab];
    var data = 调教建档数据(t);
    Store[type.storeKey].delete(oldTitle).then(function() {
      Store[type.storeKey].save(t, data).then(function() {
        调教编辑原标题 = t;
        toast('已改名并保存');
      });
    });
  } else if (!调教编辑原标题) {
    调教建档并保存();
  }
}

function 调教正文变更(val) {
  调教编辑.content = val;
  if (!调教防抖保存) 调教防抖保存 = 防抖(function() { 调教写盘(); }, 400);
  调教防抖保存();
}

function 调教写盘() {
  var t = (调教编辑.title || '').trim();
  if (!t || !调教编辑原标题) return;
  var type = 调教类型[调教子tab];
  Store[type.storeKey].get(调教编辑原标题).then(function(m) {
    m = m || {};
    Object.assign(m, 调教建档数据(调教编辑原标题));
    Store[type.storeKey].save(调教编辑原标题, m).then(function() {});
  });
}

function 调教建档数据(t) {
  var data = {
    title: t,
    content: 调教编辑.content || '',
    type: 调教类型[调教子tab].类型名,
  };
  if (调教编辑.refStoreKey) data.refStoreKey = 调教编辑.refStoreKey;
  if (调教编辑.refTitle) data.refTitle = 调教编辑.refTitle;
  // 日志挂当前计划
  if (调教子tab !== 'plan' && 调教当前计划) {
    data.parentStoreKey = 'docPlan';
    data.parentTitle = 调教当前计划;
  }
  return data;
}

function 调教建档并保存() {
  var t = (调教编辑.title || '').trim();
  if (!t) return;
  var type = 调教类型[调教子tab];
  Store[type.storeKey].list().then(function(items) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].title === t && items[i].title !== 调教编辑原标题) { toast('同名' + type.label + '已存在'); return; }
    }
    Store[type.storeKey].save(t, 调教建档数据(t)).then(function() {
      调教编辑原标题 = t;
      toast('已建立' + type.label + '「' + t + '」');
    });
  });
}

// ===== 引用参考文档选择器 =====
function 调教选择参考() {
  Promise.all([
    Store.docPlan.list(),
    Store.docTrainLog.list(),
    Store.docSlaveLog.list(),
  ]).then(function(lists) {
    var h = '<div class="mcard" style="max-width:500px;max-height:560px;overflow-y:auto">';
    h += '<h3 style="font-size:14px;margin-bottom:10px">📎 选择要引用的文档（其正文将作为 AI 上下文）</h3>';
    var groups = [
      { name: '调教计划', storeKey: 'docPlan', icon: '🗓️', items: lists[0] || [] },
      { name: '调教日志', storeKey: 'docTrainLog', icon: '📝', items: lists[1] || [] },
      { name: '性奴日志', storeKey: 'docSlaveLog', icon: '📖', items: lists[2] || [] },
    ];
    var any = false;
    groups.forEach(function(g) {
      if (!g.items.length) return;
      any = true;
      h += '<div style="font-size:11px;color:var(--fg2);margin:8px 0 4px">' + g.icon + ' ' + g.name + '</div>';
      g.items.forEach(function(item) {
        h += '<div class="n-card cur-ptr" style="cursor:pointer;padding:8px;margin-bottom:4px" data-sk="' + g.storeKey + '" data-t="' + escHtml(item.title) + '">' + g.icon + ' ' + escHtml(item.title) + '</div>';
      });
    });
    if (!any) h += '<div class="placeholder-text">暂无任何文档可引用，请先创建</div>';
    h += '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:8px">';
    h += '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>';
    h += '<button class="btn-main" onclick="this.closest(\'.ovl\').remove();调教清除参考()">不引用</button></div></div>';
    var ov = document.createElement('div');
    ov.className = 'ovl';
    ov.innerHTML = h;
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
    ov.querySelectorAll('[data-sk]').forEach(function(card) {
      card.addEventListener('click', function() {
        var sk = this.getAttribute('data-sk');
        var t = this.getAttribute('data-t');
        ov.remove();
        调教编辑.refStoreKey = sk;
        调教编辑.refTitle = t;
        调教刷新编辑器();
        toast('已引用：' + t);
      });
    });
  });
}

function 调教清除参考() {
  调教编辑.refStoreKey = '';
  调教编辑.refTitle = '';
  调教刷新编辑器();
}

function 调教刷新编辑器() {
  var el = null;
  if (调教子tab === 'plan') {
    el = document.getElementById('trainingSubContent');
  } else {
    el = document.getElementById('trainingLogEditor');
  }
  if (el) 调教渲染编辑器(el, 调教子tab);
}

// ===== AI 字段注册 =====
if (typeof registerAiField !== 'undefined') {
  ['plan', 'trainlog', 'slavelog'].forEach(function(kind) {
    var type = 调教类型[kind];
    registerAiField(type.aiFieldId, '调教' + type.label + '生成', function() {
      return 调教组装上下文(kind);
    }, {
      fillFn: function(d) {
        调教回填(kind, d);
      },
    });
  });
}

// 组装 AI 上下文（返回 Promise<{user, system}>，读引用文档正文注入 refDoc）
function 调教组装上下文(kind) {
  var type = 调教类型[kind];
  var ctx = '';
  if (调教编辑.type) ctx += '文书类型：' + 调教编辑.type + '\n';
  var dirEl = document.getElementById('训练Direction');
  if (dirEl && dirEl.value && dirEl.value.trim()) ctx += '方向：' + dirEl.value.trim() + '\n';
  var refPromise = Promise.resolve('');
  if (调教编辑.refStoreKey && 调教编辑.refTitle && Store[调教编辑.refStoreKey]) {
    refPromise = Store[调教编辑.refStoreKey].get(调教编辑.refTitle).then(function(m) {
      if (m && m.content) return '【参考文档：' + 调教编辑.refTitle + '】\n' + m.content;
      return '';
    }).catch(function() { return ''; });
  }
  return refPromise.then(function(refDoc) {
    var r = renderPrompt(type.promptName, { ctx: ctx, refDoc: refDoc, charCtx: '' });
    return { user: r.user, system: r.system };
  });
}

// AI 回填
function 调教回填(kind, d) {
  if (!d) return;
  调教编辑.title = d.title || 调教编辑.title;
  调教编辑.content = d.content || '';
  var tEl = document.getElementById('训练Title');
  if (tEl) tEl.value = 调教编辑.title;
  var cEl = document.getElementById('训练Content');
  if (cEl) cEl.value = 调教编辑.content;
  // 落盘
  if (调教编辑原标题) {
    var type = 调教类型[kind];
    Store[type.storeKey].get(调教编辑原标题).then(function(m) {
      m = m || {};
      Object.assign(m, 调教建档数据(调教编辑原标题));
      Store[type.storeKey].save(调教编辑原标题, m).then(function() {});
    });
  } else {
    调教建档并保存();
  }
  toast('AI 生成完成，可修改后保存');
}

window.调教切换视图 = 调教入口;
