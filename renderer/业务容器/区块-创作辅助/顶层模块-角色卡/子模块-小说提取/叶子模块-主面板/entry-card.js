// 深度-叙事引擎 · 角色卡 · 📖 小说提取子模块
// 上传小说/文本 → AI分析提取角色（按性别分组）→ 选择角色 → 生成详细描述 → 填入生成页面
// 渲染入口，依赖 state/utils/persist/extract/desc/timeline

// ===== 重新渲染（通过主面板刷新视图，确保 DOM 更新） =====
function 刷新视图() {
  console.time('refreshView');
  window.角色切换标签('novel-extract');
  console.timeEnd('refreshView');
}

// 性别折叠状态
var 小说提取性别折叠 = {};

window.小说提取切换性别折叠 = function(gender) {
  小说提取性别折叠[gender] = !小说提取性别折叠[gender];
  var el = document.getElementById('novelGenderGroup_' + gender);
  if (el) {
    el.style.display = 小说提取性别折叠[gender] ? 'none' : 'block';
  }
  // 更新箭头方向
  var spans = document.querySelectorAll('#novelGenderGroup_' + gender + ' ~ div > span');
  // 用更简单的方式：找到标题行里的箭头
  var header = el && el.previousElementSibling;
  if (header) {
    var arrow = header.querySelector('span');
    if (arrow) arrow.style.transform = 小说提取性别折叠[gender] ? '' : 'rotate(90deg)';
  }
};

// ===== 通用角色卡片行渲染（普通角色和阶段角色共用） =====
// readonly 模式：用于角色总览等只读场景——隐藏操作按钮、禁止编辑/弹窗，UI 与正常模式完全一致

// 折叠区①详情拼串（总览惰性渲染复用，展开时按需构建）
var 总览详情区字段 = ['appearance','attireStyle','personality','aura','background','lifeStory','storyRole','relationships','speechManner','catchphrases','race','sexCharacteristics','bedroomTalk','sexualSkill','sexualPreferences','sexualDetails'];
function 小说提取构建详情HTML(c) {
  var extraFields = 总览详情区字段.map(function(f) {
    return { key: f, label: (小说提取字段[f] || {}).label || f };
  });
  var extraInfo = '';
  extraFields.forEach(function(f) {
    if (c[f.key] && c[f.key] !== 'null') {
      var val;
      if (小说提取数组字段.indexOf(f.key) >= 0 && Array.isArray(c[f.key])) {
        val = c[f.key].join('\n');
      } else {
        val = (typeof c[f.key] === 'object') ? JSON.stringify(c[f.key]) : c[f.key];
      }
      extraInfo += '<div style="margin-bottom:2px"><span style="color:var(--accent2)">' + f.label + '：</span>' + escHtml(val) + '</div>';
    }
  });
  return extraInfo;
}
window.小说提取构建详情HTML = 小说提取构建详情HTML;

function 小说渲染角色卡片行(c, opts) {
  opts = opts || {};
  var readonly = opts.readonly === true;
  var hasDesc = opts.hasDesc !== undefined ? opts.hasDesc : !!小说提取角色描述[c.name];
  var isGenerating = opts.isGenerating !== undefined ? opts.isGenerating : 小说提取生成中[c.name] === true;
  var desc = opts.desc !== undefined ? opts.desc : 小说提取角色描述[c.name];
  var isStage = opts.isStage === true;

  var h = '';
  var hasStages = !isStage && 小说提取阶段数据[c.name] && 小说提取阶段数据[c.name].length;
  h += '<div style="display:flex;align-items:flex-start;gap:6px;padding:6px 0;border-bottom:1px solid var(--border);content-visibility:auto;contain-intrinsic-size:auto 60px;">';

  // 角色信息区
  h += '<div style="flex:1;min-width:0">';

  // 第一行：名称 + 标签
  h += '<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">';
  if (readonly) {
    h += '<span style="font-size:12px;font-weight:500">' + escHtml(c.name) + '</span>';
  } else {
    h += '<span style="font-size:12px;font-weight:500;cursor:text" contenteditable="true" class="char-name-edit" data-oldname="' + escHtml(c.name) + '">' + escHtml(c.name) + '</span>';
  }
  var roleStyles = {
    '主角': { color: '#f0d060', bg: 'rgba(240,208,96,0.15)', border: 'rgba(240,208,96,0.3)' },
    '主配': { color: '#5bc0eb', bg: 'rgba(91,192,235,0.12)', border: 'rgba(91,192,235,0.3)' },
    '配角': { color: '#d4c4f0', bg: 'rgba(212,196,240,0.12)', border: 'rgba(212,196,240,0.25)' },
    '龙套': { color: '#666688', bg: 'rgba(102,102,136,0.1)', border: 'rgba(102,102,136,0.2)' }
  };
  var rs = roleStyles[c.role] || roleStyles['龙套'];
  if (readonly) {
    h += '<span style="font-size:9px;color:' + rs.color + ';background:' + rs.bg + ';border:1px solid ' + rs.border + ';padding:1px 7px;border-radius:4px;font-weight:600">' + escHtml(c.role) + '</span>';
  } else {
    h += '<span onclick="小说提取弹出调整级别(\'' + escHtml(c.name) + '\')" title="点击调整级别" style="font-size:9px;color:' + rs.color + ';background:' + rs.bg + ';border:1px solid ' + rs.border + ';padding:1px 7px;border-radius:4px;font-weight:600;cursor:pointer">' + escHtml(c.role) + '</span>';
  }
  var gc = 小说提取性别配置[c.gender] || { label: c.gender || '未知', icon: '❓', color: 'var(--fg3)' };
  if (readonly) {
    h += '<span style="font-size:9px;color:' + gc.color + ';background:var(--bg2);border:1px solid ' + gc.color + ';padding:1px 7px;border-radius:4px;font-weight:600">' + gc.icon + ' ' + escHtml(gc.label) + '</span>';
  } else {
    h += '<span onclick="小说提取弹出调整性别(\'' + escHtml(c.name) + '\')" title="点击调整性别" style="font-size:9px;color:' + gc.color + ';background:var(--bg2);border:1px solid ' + gc.color + ';padding:1px 7px;border-radius:4px;font-weight:600;cursor:pointer">' + gc.icon + ' ' + escHtml(gc.label) + '</span>';
  }
  if (c.age && c.age !== 'null') h += '<span style="font-size:9px;color:var(--fg3);background:var(--bg2);padding:0 5px;border-radius:3px">' + escHtml(c.age) + '</span>';
  if (c.title && c.title !== 'null') h += '<span style="font-size:9px;color:var(--accent2);background:var(--bg2);padding:0 5px;border-radius:3px">' + escHtml(c.title) + '</span>';
  if (c.occupation && c.occupation !== 'null') h += '<span style="font-size:9px;color:var(--fg2);background:var(--bg2);padding:0 5px;border-radius:3px">' + escHtml(c.occupation) + '</span>';
  if (c.race && c.race !== 'null') h += '<span style="font-size:9px;color:var(--fg3);background:var(--bg2);padding:0 5px;border-radius:3px">' + escHtml(c.race) + '</span>';
  if (c.aura && c.aura !== 'null') h += '<span style="font-size:9px;color:var(--fg3);background:var(--bg2);padding:0 5px;border-radius:3px;font-style:italic">' + escHtml(c.aura) + '</span>';
  if (!isStage) {
    var aliasText = (c.aliases && Array.isArray(c.aliases) && c.aliases.length) ? c.aliases.join("/") : '';
    if (readonly) {
      h += '<span style="font-size:9px;color:var(--accent2);background:var(--bg2);padding:0 5px;border-radius:3px">📌 ' + (aliasText || '') + '</span>';
    } else {
      h += '<span onclick="小说提取弹出编辑别名(\'' + escHtml(c.name) + '\')" title="点击编辑别名" style="font-size:9px;color:var(--accent2);background:var(--bg2);padding:0 5px;border-radius:3px;cursor:pointer">📌 ' + (aliasText || '添加别名') + '</span>';
    }
  }
  if (hasStages) h += '<span style="font-size:10px;font-weight:500;color:var(--accent);background:rgba(255,255,255,0.05);padding:1px 6px;border-radius:3px;border:1px solid var(--accent)">' + 小说提取阶段数据[c.name].length + ' 阶段</span>';
  h += '</div>';

  // 第二行：brief
  h += '<div style="font-size:11px;color:var(--fg2);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(c.brief || '') + '</div>';

  // 折叠区①：查看提取详情（readonly+lazyDetails 时输出空壳，展开时由总览填充）
  if (readonly && opts.lazyDetails) {
  var _hasExtra = opts.hasExtra;
  if (_hasExtra === undefined) {
    _hasExtra = false;
    for (var _fi = 0; _fi < 总览详情区字段.length; _fi++) {
      var _fv = c[总览详情区字段[_fi]];
      if (_fv && _fv !== 'null') { _hasExtra = true; break; }
    }
  }
  if (_hasExtra) {
    h += '<details data-uid="' + escHtml(c.uid || '') + '" data-lazy="1" style="font-size:10px;margin-top:1px">';
    h += '<summary style="cursor:pointer;color:var(--accent);opacity:0.6;padding:1px 0">📋 查看提取详情</summary>';
    h += '</details>';
  }
} else {
  var extraInfo = 小说提取构建详情HTML(c);
  if (extraInfo) {
    h += '<details style="font-size:10px;margin-top:1px">';
    h += '<summary style="cursor:pointer;color:var(--accent);opacity:0.6;padding:1px 0">📋 查看提取详情</summary>';
    h += '<div style="margin-top:2px;padding:4px 6px;background:var(--bg2);border-radius:4px;line-height:1.5">' + extraInfo + '</div></details>';
  }
}

  // 折叠区②：时间线（有阶段数据才显示；总览 readonly+noDetail 场景跳过）
  var cStages = !isStage && !opts.noDetail ? (小说提取阶段数据[c.name] || []) : [];
  if (cStages.length) {
    h += '<details style="font-size:10px;margin-top:2px" ' + (opts.stageOpen ? 'open' : '') + '>';
    h += '<summary style="cursor:pointer;color:var(--accent);padding:2px 0">⏳ 时间线（' + cStages.length + ' 个阶段）</summary>';
    h += '<div style="margin-top:2px;padding:2px 0;background:var(--bg2);border-radius:4px;border-left:3px solid var(--accent)">';
    cStages.forEach(function(s, si) {
      var stageName = c.name + '-' + s.name;
      // 时间线卡：以父角色完整字段为基础，阶段特有字段覆盖，使它与普通角色卡字段完全一致
      var sc = { name: stageName, gender: c.gender, role: c.role };
      小说提取正文段字段.forEach(function(f) {
        sc[f] = c[f] !== undefined && c[f] !== null ? c[f] : null;
      });
      if (s.fields) {
        Object.keys(s.fields).forEach(function(f) {
          if (s.fields[f] !== undefined && s.fields[f] !== null && s.fields[f] !== 'null') sc[f] = s.fields[f];
        });
      }
      var stageHasDesc = !!小说提取角色描述[stageName];
      var stageIsGenerating = 小说提取生成中[stageName] === true;
      var stageDesc = 小说提取角色描述[stageName];
      // 阶段序号标记（仅序号，与正常角色卡同排版）
      h += '<div style="display:flex;align-items:flex-start;gap:6px;padding:2px 6px">';
      h += '<div style="font-size:9px;color:var(--accent);font-weight:600;padding:6px 0;min-width:18px;text-align:right;flex-shrink:0">#' + (si + 1) + '</div>';
      h += '<div style="flex:1;min-width:0">';
      h += 小说渲染角色卡片行(sc, { hasDesc: stageHasDesc, isGenerating: stageIsGenerating, desc: stageDesc, isStage: true, readonly: readonly });
      h += '</div></div>';
    });
    h += '</div></details>';
  }

  h += '</div>'; // end 角色信息区

  // readonly 模式的右侧自定义按钮区（与正常模式操作按钮同位置）
  if (readonly && opts.rightButtons) {
    h += '<div style="display:flex;gap:4px;flex-shrink:0;margin-top:2px">' + opts.rightButtons + '</div>';
  }

  // 操作按钮：readonly 模式不渲染任何操作按钮
  if (!readonly) {
    // 操作按钮：统一按钮组（填入生成始终存在 + 生成性爱明细 + 其他操作），不区分 hasDesc 状态
    if (isGenerating) {
      h += '<button class="btn-out btn-sm" disabled style="font-size:10px;padding:2px 8px;flex-shrink:0;margin-top:2px;opacity:0.5">⏳ 生成中</button>';
    } else {
      h += '<div style="display:flex;gap:4px;flex-shrink:0;margin-top:2px">';
      h += '<button class="btn btn-sm" onclick="小说提取填入生成(\'' + escHtml(c.name) + '\')" style="font-size:10px;padding:3px 10px">🎯 填入生成</button>';
      h += '<button class="btn-out btn-sm" onclick="小说提取弹出生成单个描述(\'' + escHtml(c.name) + '\')" style="font-size:10px;padding:2px 8px">⚡ 性爱明细生成</button>';
      if (!isStage) h += '<button class="btn-out btn-sm" onclick="小说提取弹出重新提取(\'' + escHtml(c.name) + '\')" style="font-size:10px;padding:2px 8px">🔍 重新提取</button>';
      if (!isStage) h += '<button class="btn-out btn-sm" onclick="小说提取弹出全文提取(\'' + escHtml(c.name) + '\')" style="font-size:10px;padding:2px 8px">📖 全文提取</button>';
      if (!isStage) h += '<button class="btn-out btn-sm" onclick="小说提取弹出分段管理(\'' + escHtml(c.name) + '\')" style="font-size:10px;padding:2px 8px">📑 分段管理</button>';
      if (!isStage) h += '<button class="btn-out btn-sm" onclick="小说提取弹出别名输入(\'' + escHtml(c.name) + '\')" style="font-size:10px;padding:2px 8px">📌 别名</button>';
      if (!isStage) h += '<button class="btn-out btn-sm" onclick="小说提取弹出时间线输入(\'' + escHtml(c.name) + '\')" style="font-size:10px;padding:2px 8px">⏳ 时间线</button>';
      h += '<button class="btn-out btn-sm" onclick="小说提取删除角色(\'' + escHtml(c.name) + '\',' + isStage + ')" style="font-size:10px;padding:2px 6px;color:var(--err);border-color:var(--err);margin-left:4px" title="删除">✕</button>';
      h += '</div>';
    }
  }

  h += '</div>'; // end 卡片行
  return h;
}

// 全局委托：.desc-edit contenteditable 失焦时保存（只绑定一次）
// 以及 .char-name-edit 失焦时重命名
if (!window._descSaveDelegate) {
  window._descSaveDelegate = true;
  document.addEventListener('blur', function(e) {
    var el = e.target;
    if (el.classList && el.classList.contains('char-name-edit')) {
      var oldName = el.getAttribute('data-oldname');
      var newName = el.textContent.trim();
      if (newName && newName !== oldName) {
        小说提取重命名角色(oldName, newName);
      } else if (!newName) {
        el.textContent = oldName;
      }
      return;
    }
    if (el.classList && el.classList.contains('desc-edit')) {
      var name = el.getAttribute('data-name');
      var field = el.getAttribute('data-field');
      if (name && field) 小说提取保存描述字段(name, field, el.textContent);
    }
  }, true); // useCapture=true 确保 blur 冒泡
}

function 小说提取重命名角色(oldName, newName) {
  if (oldName === newName) return;
  // 更新角色列表
  var renamed = null;
  for (var ri = 0; ri < 小说提取角色列表.length; ri++) {
    if (小说提取角色列表[ri].name === oldName) {
      小说提取角色列表[ri].name = newName;
      renamed = 小说提取角色列表[ri];
      break;
    }
  }
  // 更新描述
  if (小说提取角色描述[oldName]) {
    小说提取角色描述[newName] = 小说提取角色描述[oldName];
    delete 小说提取角色描述[oldName];
  }
  // 更新时间线展开状态
  if (小说提取展开角色[oldName] !== undefined) {
    小说提取展开角色[newName] = 小说提取展开角色[oldName];
    delete 小说提取展开角色[oldName];
  }
  // 从磁盘删除旧文件
  if (小说提取当前记录ID) {
    var _folderName = 本地FS.清理(小说提取当前记录标题) || 小说提取当前记录ID;
    LocalFS.delete(小说提取存储基路径 + _folderName + "/" + 本地FS.清理(oldName) + ".json").catch(function(e) { console.warn("文件删除失败:", e); });
  }
  小说提取保存单个角色(renamed);
  刷新视图();
  toast('已重命名为「' + newName + '」');
}
window.小说提取重命名角色 = 小说提取重命名角色;

// ===== 调整级别弹窗（点击等级徽章 → 单选级别） =====
window.小说提取弹出调整级别 = function(name) {
  if (document.getElementById('roleAdjustOverlay')) return;
  var c = null;
  小说提取角色列表.forEach(function(r) { if (r.name === name) c = r; });
  if (!c) { toast('未找到角色'); return; }
  var 等级序 = ['主角', '主配', '配角', '龙套'];
  var roleStyles = {
    '主角': { color: '#f0d060', bg: 'rgba(240,208,96,0.15)', border: 'rgba(240,208,96,0.3)' },
    '主配': { color: '#5bc0eb', bg: 'rgba(91,192,235,0.12)', border: 'rgba(91,192,235,0.3)' },
    '配角': { color: '#d4c4f0', bg: 'rgba(212,196,240,0.12)', border: 'rgba(212,196,240,0.25)' },
    '龙套': { color: '#666688', bg: 'rgba(102,102,136,0.1)', border: 'rgba(102,102,136,0.2)' }
  };
  var chips = 等级序.map(function(r) {
    var rs = roleStyles[r] || roleStyles['龙套'];
    var sel = c.role === r ? ' data-selected="true"' : '';
    var sty = 'font-size:12px;padding:6px 14px;border-radius:6px;font-weight:600;cursor:pointer;border:1px solid ' + (c.role === r ? rs.border : 'var(--border)') + ';color:' + rs.color + ';background:' + (c.role === r ? rs.bg : 'var(--bg2)') + ';' + (c.role === r ? 'outline:1px solid ' + rs.color + ';' : '');
    return '<span class="role-opt-chip" data-role="' + r + '"' + sel + ' onclick="小说提取单选切换(this,\'.role-opt-chip\')" style="' + sty + '">' + r + '</span>';
  }).join('');

  var ov = document.createElement('div');
  ov.id = 'roleAdjustOverlay';
  ov.className = 'ovl';
  ov.innerHTML = '<div class="mcard" style="max-width:420px;width:90%">' +
    '<div style="font-size:15px;font-weight:600;margin-bottom:4px">🎚️ 调整级别</div>' +
    '<div style="font-size:11px;color:var(--fg2);margin-bottom:14px">为「' + escHtml(name) + '」选择角色级别</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' + chips + '</div>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">' +
    '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>' +
    '<button class="btn-main" onclick="小说提取确认调整级别(\'' + escHtml(name) + '\')">✓ 确认</button>' +
    '</div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
};

window.小说提取确认调整级别 = function(name) {
  var ov = document.getElementById('roleAdjustOverlay');
  var sel = ov ? ov.querySelector('.role-opt-chip[data-selected="true"]') : null;
  if (ov) ov.remove();
  if (!sel) { toast('请选择级别'); return; }
  var role = sel.getAttribute('data-role');
  var c = null;
  小说提取角色列表.forEach(function(r) { if (r.name === name) c = r; });
  if (!c) { toast('未找到角色'); return; }
  c.role = role;
  小说提取保存单个角色(c);
  刷新视图();
  toast('已将「' + name + '」设为' + role);
};

// ===== 调整性别弹窗（点击性别徽章 → 单选性别） =====
window.小说提取弹出调整性别 = function(name) {
  if (document.getElementById('genderAdjustOverlay')) return;
  var c = null;
  小说提取角色列表.forEach(function(r) { if (r.name === name) c = r; });
  if (!c) { toast('未找到角色'); return; }
  var chips = 小说提取性别顺序.map(function(g) {
    var gc = 小说提取性别配置[g] || { label: g, icon: '❓', color: 'var(--fg3)' };
    var sel = c.gender === g ? ' data-selected="true"' : '';
    var sty = 'font-size:12px;padding:6px 12px;border-radius:6px;font-weight:600;cursor:pointer;border:1px solid ' + (c.gender === g ? gc.color : 'var(--border)') + ';color:' + gc.color + ';background:' + (c.gender === g ? 'rgba(255,255,255,0.06)' : 'var(--bg2)') + ';' + (c.gender === g ? 'outline:1px solid ' + gc.color + ';' : '');
    return '<span class="gender-opt-chip" data-gender="' + g + '"' + sel + ' onclick="小说提取单选切换(this,\'.gender-opt-chip\')" style="' + sty + '">' + gc.icon + ' ' + escHtml(gc.label) + '</span>';
  }).join('');

  var ov = document.createElement('div');
  ov.id = 'genderAdjustOverlay';
  ov.className = 'ovl';
  ov.innerHTML = '<div class="mcard" style="max-width:460px;width:90%">' +
    '<div style="font-size:15px;font-weight:600;margin-bottom:4px">🚻 调整性别</div>' +
    '<div style="font-size:11px;color:var(--fg2);margin-bottom:14px">为「' + escHtml(name) + '」选择性别分组</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' + chips + '</div>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">' +
    '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>' +
    '<button class="btn-main" onclick="小说提取确认调整性别(\'' + escHtml(name) + '\')">✓ 确认</button>' +
    '</div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
};

window.小说提取确认调整性别 = function(name) {
  var ov = document.getElementById('genderAdjustOverlay');
  var sel = ov ? ov.querySelector('.gender-opt-chip[data-selected="true"]') : null;
  if (ov) ov.remove();
  if (!sel) { toast('请选择性别'); return; }
  var gender = sel.getAttribute('data-gender');
  var c = null;
  小说提取角色列表.forEach(function(r) { if (r.name === name) c = r; });
  if (!c) { toast('未找到角色'); return; }
  c.gender = gender;
  小说提取保存单个角色(c);
  刷新视图();
  var gc = 小说提取性别配置[gender] || { label: gender };
  toast('已将「' + name + '」设为' + gc.label);
};

// ===== 弹窗内单选切换（同一组内清除其他选中，选中当前） =====
window.小说提取单选切换 = function(el, groupSelector) {
  document.querySelectorAll(groupSelector).forEach(function(x) {
    x.removeAttribute('data-selected');
    x.style.outline = 'none';
    x.style.background = 'var(--bg2)';
  });
  el.setAttribute('data-selected', 'true');
  el.style.outline = '1px solid currentColor';
  el.style.background = 'rgba(255,255,255,0.06)';
};

// ===== 别名编辑弹窗 =====
window.小说提取弹出编辑别名 = function(name) {
  if (document.getElementById('aliasEditOverlay')) return;
  var c = null;
  小说提取角色列表.forEach(function(r) { if (r.name === name) c = r; });
  if (!c) { toast('未找到角色'); return; }
  var aliases = Array.isArray(c.aliases) ? c.aliases.slice() : [];
  var currentText = aliases.join('、');

  var ov = document.createElement('div');
  ov.id = 'aliasEditOverlay';
  ov.className = 'ovl';
  ov.innerHTML = '<div class="mcard" style="max-width:480px;width:90%">' +
    '<div style="font-size:15px;font-weight:600;margin-bottom:4px">📌 编辑别名</div>' +
    '<div style="font-size:11px;color:var(--fg2);margin-bottom:14px">角色：' + escHtml(name) + '</div>' +
    '<div style="font-size:10px;color:var(--fg3);margin-bottom:6px">多个别名用顿号「、」或逗号「,」分隔，输入后自动拆分保存</div>' +
    '<textarea id="aliasEditInput" class="llm-input" rows="4" style="width:100%;font-size:12px;resize:vertical;font-family:inherit" placeholder="如：零、冰雕女孩、主人……">' + escHtml(currentText) + '</textarea>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">' +
    '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>' +
    '<button class="btn-main" onclick="小说提取确认编辑别名(\'' + escHtml(name) + '\')">✓ 保存</button>' +
    '</div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
};

window.小说提取确认编辑别名 = function(name) {
  var ta = document.getElementById('aliasEditInput');
  var ov = document.getElementById('aliasEditOverlay');
  if (ov) ov.remove();
  var c = null;
  小说提取角色列表.forEach(function(r) { if (r.name === name) c = r; });
  if (!c) { toast('未找到角色'); return; }
  var raw = ta ? ta.value : '';
  var aliases = raw.split(/[、,，/\s]+/).map(function(a) { return a.trim(); }).filter(function(a) { return a && a !== name; });
  aliases = aliases.filter(function(v, i, self) { return self.indexOf(v) === i; });
  c.aliases = aliases;
  小说提取保存单个角色(c);
  刷新视图();
  toast('已保存「' + name + '」的别名');
};
