// 影视动画 · 📝 规划（作品模式 + 期号模式）
var 影视新建角色缓存 = [];
var 影视新建来源缓存 = [];
var 影视角色完整缓存 = {};
var 影视节目简介缓存 = '';

function 影视渲染规划(el) {
  var mk = 影视当前类型;
  if (!影视当前节目) {
    影视渲染规划作品(el);
  } else {
    影视渲染规划期号(el);
  }
}

// ===== AI 字段注册 =====
function 构建作品上下文基础() {
  var mk = 影视当前类型;
  var f = window.影视规划作品表单;
  var m = 影视内容类型[mk];
  var cfg = f ? window.影视获取节目配置(f.type, f.subtype) : null;
  var lines = [];
  if (m) { lines.push('内容类型：' + m.label); if (m.desc) lines.push('内容类型说明：' + m.desc); }
  if (cfg) { lines.push('作品类型：' + cfg.label); if (cfg.styleDesc) lines.push('作品类型说明：' + cfg.styleDesc); lines.push('段落结构：' + cfg.sections.join('、')); }
  if (f && f.name) lines.push('作品名称：' + f.name);
  if (f && f.focus) lines.push('作品定位/关注方向：' + f.focus);
  if (f && f.description) lines.push('作品简介：' + f.description);
  var 演员名 = [];
  if (f && f.refSources && f.refSources.length) {
    f.refSources.forEach(function(s) { 演员名.push(typeof s === 'string' ? s : s.name); });
  }
  if (演员名.length) lines.push('常驻' + (影视来源名称映射[mk] || '演员') + '：' + 演员名.join('、'));
  var 角色名 = f && f.refChars ? f.refChars : [];
  if (角色名.length) lines.push('常驻角色：' + 角色名.join('、'));
  if (演员名.length || 角色名.length) lines.push('');
  if (f && f.refSources && f.refSources.length) {
    lines.push('');
    lines.push('【常驻' + (影视来源名称映射[mk] || '演员') + '】');
    f.refSources.forEach(function(s) {
      var src = typeof s === 'string' ? null : s;
      if (src) { lines.push(JSON.stringify(src, null, 2)); } else { lines.push('- ' + s + '（完整数据不可用）'); }
    });
  }
  return lines.join('\n');
}

function 影视加载角色身份(角色名列表) {
  var lines = [];
  return Promise.all(角色名列表.map(function(rn) {
    return Store.character.get(rn).then(function(d) { return { name: rn, data: d }; });
  })).then(function(loaded) {
    loaded.forEach(function(item) {
      lines.push((item.data && item.data.identity ? JSON.stringify({ identity: item.data.identity }, null, 2) : '- ' + item.name) + '\n');
    });
    return lines.join('');
  });
}

(function() {
  registerAiField('ys_program_name', '作品名称', function() { return 构建作品上下文基础(); }, { suggestPrompt: 'news_program_name' });
  registerAiField('ys_program_focus', '作品定位', function() { return 构建作品上下文基础(); }, { suggestPrompt: 'news_program_focus' });
  registerAiField('ys_program_desc', '作品简介', function() {
    var ctx = 构建作品上下文基础();
    return renderPrompt('news_program_desc', { context: ctx });
  }, { rawText: true, suggestPrompt: 'news_program_desc', fillFn: function(text) { var ta = document.getElementById('ysProgramDesc'); if (ta) { ta.value = text; } 影视节目简介缓存 = text; } });

  registerAiField('ys_episode_focus', '本期关注方向', function() {
    var 节目 = 影视当前节目;
    var mk = 影视当前类型;
    var cfg = window.影视获取节目配置(节目 ? 节目.info.type : '', 节目 ? 节目.info.subtype : '');
    var ctx = '作品名称：' + (节目 ? 节目.info.name : '') + '\n';
    ctx += '作品类型：' + (cfg ? cfg.label : '') + '\n';
    ctx += '作品类型说明：' + (cfg ? cfg.styleDesc : '') + '\n';
    ctx += '段落结构：' + (cfg ? cfg.sections.join('、') : '') + '\n';
    if (节目 && 节目.info.focus) ctx += '作品定位：' + 节目.info.focus + '\n';
    if (节目 && 节目.info.description) ctx += '作品简介：' + 节目.info.description + '\n';
    if (影视期号来源缓存 && 影视期号来源缓存.length) {
      ctx += '\n【演员资料】\n';
      影视期号来源缓存.forEach(function(s) { ctx += '- ' + (s.name || '') + (s.bio ? '：' + s.bio : '') + '\n'; });
    }
    if (window.影视期号角色全量缓存 && window.影视期号角色全量缓存.length) {
      ctx += '\n【出场人物】\n';
      window.影视期号角色全量缓存.forEach(function(c) {
        var name = ((c.identity && c.identity.basicInfo) || {}).name || c.title || '未命名';
        ctx += '- ' + name + '\n';
      });
    }
    return ctx;
  }, { suggestPrompt: 'news_episode_focus' });
})();

// ===== 模式一：规划作品 =====
function 影视渲染规划作品(el) {
  var mk = 影视当前类型;
  var cfgList = 影视内容类型键;
  var m = 影视内容类型[mk];
  var existing = window.影视规划作品表单 || null;
  var 表单 = {
    type: mk,
    name: (existing && existing.name) || '',
    focus: (existing && existing.focus) || '',
    description: (existing && existing.description) || '',
    refSources: (existing && existing.refSources) || [],
    refChars: (existing && existing.refChars) || []
  };
  影视节目简介缓存 = 表单.description;
  var 是否编辑 = existing && existing._editing;

  var h = '<div class="n-card">';
  h += '<h3 style="font-size:15px;font-weight:600;margin-bottom:12px">' + m.icon + ' ' + (是否编辑 ? '编辑' : '新建') + '</h3>';

  // 子类型网格
  var 子类型配置 = 影视获取子类型配置(mk);
  var 子类型键 = 子类型配置 ? Object.keys(子类型配置) : [];
  if (子类型键.length) {
    h += '<div class="form-group" style="margin-bottom:8px"><label style="font-size:12px;font-weight:500;color:var(--fg2);display:block;margin-bottom:6px">📋 子类型</label>';
    h += '<div id="ysSubTypeGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
    子类型键.forEach(function(k) {
      var cfg = 子类型配置[k];
      var act = (表单.subtype || 子类型键[0]) === k;
      h += '<div class="n-card" style="padding:10px;cursor:pointer;border:2px solid ' + (act ? 'var(--accent2)' : 'var(--border)') + ';border-radius:6px" onclick="document.querySelectorAll(\'#ysSubTypeGrid .n-card\').forEach(function(c){c.style.borderColor=\'var(--border)\'});this.style.borderColor=\'var(--accent2)\';影视规划作品表单.subtype=\'' + k + '\'">';
      h += '<div style="font-size:13px;font-weight:600;color:var(--fg)">' + cfg.icon + ' ' + cfg.label + '</div>';
      h += '<div style="font-size:10px;color:var(--fg2);margin-top:2px">' + cfg.sections.join(' · ') + '</div></div>';
    });
    h += '</div></div>';
    if (!表单.subtype) 表单.subtype = 子类型键[0];
  }

  h += '<div style="display:flex;gap:12px;margin-top:8px">';
  h += '<div style="flex:0 0 260px">';

  h += '<div class="form-group" style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">🎭 常驻' + (影视来源名称映射[mk] || '演员') + '</label>';
  h += '<div id="ysPlanSources" style="max-height:100px;overflow-y:auto;display:flex;gap:4px;flex-wrap:wrap;padding:6px;background:var(--bg2);border-radius:6px;border:1px solid var(--border)">';
  h += '<span style="font-size:11px;color:var(--fg3)">加载中...</span></div></div>';

  h += '<div class="form-group"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">👤 常驻角色</label>';
  h += '<div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:4px" id="ysPlanGenderTabs">';
  影视性别键.forEach(function(g) {
    h += '<span class="char-cat-tab" style="flex:1;min-width:46px;padding:3px 4px;text-align:center;font-size:10px;cursor:pointer;border-radius:4px;border:1px solid var(--border);background:var(--bg2)" data-pgender="' + g + '" onclick="window.影视新建角色性别=\'' + g + '\';document.querySelectorAll(\'#ysPlanGenderTabs .char-cat-tab\').forEach(function(t){t.style.borderColor=\'var(--border)\';t.style.background=\'var(--bg2)\'});this.style.borderColor=\'var(--accent2)\';this.style.background=\'var(--accent-dim)\';window.影视渲染新建作品角色列表()">' + 影视性别图标[g] + ' ' + g + '</span>';
  });
  h += '</div>';
  h += '<div id="ysPlanChars" style="max-height:260px;overflow-y:auto;padding:4px;background:var(--bg2);border-radius:6px;border:1px solid var(--border)">';
  h += '<span style="font-size:11px;color:var(--fg3)">加载中...</span></div></div>';
  h += '</div>'; // end left col

  h += '<div style="flex:1;min-width:0">';
  h += '<div class="form-group"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">作品名称</label>';
  h += aiInput('ys_program_name', '', '如：「深夜来访」「调教日记」', 表单.name);
  h += '</div>';
  h += '<div class="form-group" style="margin-top:10px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">📌 作品定位/关注方向</label>';
  h += aiInput('ys_program_focus', '', '如：悬疑情色、纯爱调教、重口猎奇', 表单.focus);
  h += '</div>';
  h += '<div class="form-group" style="margin-top:10px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">📖 作品简介</label>';
  h += '<div style="display:flex;gap:6px"><textarea class="llm-input" id="ysProgramDesc" style="flex:1;min-height:120px;resize:vertical" placeholder="说明本作品聚焦什么题材、什么主题方向…" oninput="影视节目简介缓存=this.value">' + escHtml(影视节目简介缓存) + '</textarea>';
  h += '<button class="ai-suggest-btn" onclick="openAiGenPanel(\'ys_program_desc\')" title="AI 生成作品简介" style="align-self:flex-start;margin-top:0">🤖</button></div></div>';

  h += '<div style="margin-top:14px"><button class="btn-main" onclick="影视保存作品配置()" style="width:100%;padding:10px;font-size:13px">' + (是否编辑 ? '💾 保存修改' : '💾 创建作品') + '</button></div>';
  h += '</div>'; // end right col
  h += '</div>'; // end flex row
  h += '</div>'; // end n-card
  el.innerHTML = h;

  window.影视规划作品表单 = 表单;

  影视新建来源缓存 = [];
  影视加载来源(mk).then(function(sources) {
    影视新建来源缓存 = sources || [];
    var pool = document.getElementById('ysPlanSources');
    if (!pool) return;
    if (!sources.length) { pool.innerHTML = '<span style="font-size:11px;color:var(--fg3)">暂无来源</span>'; return; }
    pool.innerHTML = sources.map(function(s, i) {
      var 已选 = 表单.refSources.some(function(r) { return typeof r === 'string' ? r === s.name : r === s; });
      return '<span class="tag-chip' + (已选 ? ' tag-active' : '') + '" data-idx="' + i + '" onclick="var f=window.影视规划作品表单;var s=影视新建来源缓存[this.getAttribute(\'data-idx\')];if(!s)return;var sn=s.name||\'\';var idx=f.refSources.findIndex(function(r){return typeof r===\'string\'?r===sn:r===s;});if(idx>=0){f.refSources.splice(idx,1);this.classList.remove(\'tag-active\')}else{f.refSources.push(s);this.classList.add(\'tag-active\')}" style="cursor:pointer">' + escHtml(s.name || '') + '</span>';
    }).join('');
  });

  影视新建角色缓存 = [];
  window.影视新建角色按性别 = { '女性': [], '男性': [], '扶她': [], '伪娘': [] };
  window.影视新建角色性别 = '女性';
  var pGenderMap = { 'female': '女性', 'male': '男性', 'femboy': '伪娘', 'futa': '扶她', 'beast': '男性' };
  Store.character.list().then(function(items) {
    影视新建角色缓存 = items || [];
    影视新建角色缓存.forEach(function(c) {
      var bi = c.identity && c.identity.basicInfo || {};
      var cg = pGenderMap[bi.gender] || bi.gender;
      if (window.影视新建角色按性别[cg]) window.影视新建角色按性别[cg].push(c);
    });
    var tabs = document.querySelectorAll('#ysPlanGenderTabs .char-cat-tab');
    if (tabs.length) { tabs[0].style.borderColor = 'var(--accent2)'; tabs[0].style.background = 'var(--accent-dim)'; }
    window.影视渲染新建作品角色列表();
  });
}

window.影视渲染新建作品角色列表 = function() {
  var pool = document.getElementById('ysPlanChars');
  if (!pool) return;
  var gender = window.影视新建角色性别 || '女性';
  var items = window.影视新建角色按性别[gender] || [];
  var f = window.影视规划作品表单;
  pool.innerHTML = items.map(function(c) {
    var bi = (c.identity && c.identity.basicInfo) || {};
    var name = bi.name || c.title || '';
    if (!name) return '';
    var 已选 = f && f.refChars && f.refChars.indexOf(name) >= 0;
    var age = bi.age || '';
    var title = bi.title || '';
    var cardStyle = 'cursor:pointer;margin-bottom:4px;padding:8px;border-radius:6px;border:2px solid ' + (已选 ? 'var(--accent2)' : 'var(--border)') + ';background:var(--bg);border-left:3px solid ' + (已选 ? 'var(--accent2)' : 'transparent') + ';transition:all 0.1s';
    return '<div class="n-card" style="' + cardStyle + '" data-pname="' + escHtml(name) + '" onclick="var n=this.getAttribute(\'data-pname\');if(!n)return;var f=window.影视规划作品表单;if(!f)return;var p=f.refChars.indexOf(n);if(p>=0){f.refChars.splice(p,1);this.style.borderColor=\'var(--border)\';this.style.borderLeftColor=\'transparent\'}else{f.refChars.push(n);Store.character.get(n).then(function(d){if(d)影视角色完整缓存[n]=d;});this.style.borderColor=\'var(--accent2)\';this.style.borderLeftColor=\'var(--accent2)\'}">' +
      '<div class="fw-600 fs-13" style="color:var(--fg)">' + escHtml(name) + (age ? ' <span class="text-muted" style="font-weight:400;font-size:11px;color:var(--fg2)">' + age + '岁</span>' : '') + '</div>' +
      (title ? '<div class="text-muted text-sm" style="font-size:11px;color:var(--fg2);margin-top:2px">' + escHtml(title) + '</div>' : '') +
    '</div>';
  }).join('');
  if (!pool.innerHTML) pool.innerHTML = '<div style="padding:12px;text-align:center;font-size:11px;color:var(--fg3)">暂无此性别角色</div>';
};

window.影视保存作品配置 = function() {
  var mk = 影视当前类型;
  var f = window.影视规划作品表单;
  var nameEl = document.getElementById('ys_program_name');
  if (nameEl) f.name = nameEl.value.trim();
  var focusEl = document.getElementById('ys_program_focus');
  if (focusEl) f.focus = focusEl.value.trim();
  var descEl = document.getElementById('ysProgramDesc');
  if (descEl) f.description = descEl.value.trim();

  if (f.name && f.focus && f.description && !f._editing) { return 影视保存作品直接(f); }
  if (f._editing && f.name && f.focus && f.description) { return 影视保存作品直接(f); }

  toast('🔄 正在智能补全作品信息...');
  影视加载角色身份(f.refChars || []).then(function(角色上下文) {
    var ctx = 构建作品上下文基础();
    if (角色上下文) ctx += '\n【常驻角色】\n' + 角色上下文;
    var rendered = renderPrompt('news_program_gen_all', { context: ctx });
    LLM.callJSON({ prompt: rendered.user, system: rendered.system, label: '作品补全', temperature: 0.85 }).then(function(data) {
      if (!data) { toast('生成失败'); return; }
      if (!f.name && data.name) { f.name = data.name; if (nameEl) nameEl.value = data.name; }
      if (!f.focus && data.focus) { f.focus = data.focus; if (focusEl) focusEl.value = data.focus; }
      if (!f.description && data.description) { f.description = data.description; if (descEl) descEl.value = data.description; 影视节目简介缓存 = data.description; }
      if (!f.name) { toast('AI 未能生成作品名称，请手动填写'); return; }
      return 影视保存作品直接(f);
    }).catch(function(err) { toast('AI 补全失败: ' + err.message); });
  });
};

function 影视保存作品直接(f) {
  var mk = 影视当前类型;
  var info = { name: f.name, type: f.type, subtype: f.subtype || '', focus: f.focus || '', description: f.description || '', refSourceNames: f.refSources.map(function(s){return s.name;}), refChars: f.refChars, createdAt: Date.now() };
  var saveTask;
  if (f._editing && f._editName && f._editName !== f.name) {
    saveTask = 影视删除节目(mk, f._editName).then(function() { return 影视保存节目(mk, f.name, info); });
  } else { saveTask = 影视保存节目(mk, f.name, info); }
  return saveTask.then(function() {
    toast(f._editing ? '✅ 作品已更新' : '✅ 作品已创建');
    影视当前节目 = null;
    window.影视规划作品表单 = null;
    影视切换标签('list');
  });
}

function 影视计算下一期号(mk, 作品名) {
  return 影视列出期号(mk, 作品名).then(function(episodes) {
    if (!episodes || !episodes.length) return 1;
    var maxEp = 0;
    episodes.forEach(function(ep) {
      var num = ep.episode || 0;
      if (!num && ep._dir) { var m = (ep._dir || '').match(/第(\d+)期/); if (m) num = parseInt(m[1]); }
      if (num > maxEp) maxEp = num;
    });
    return maxEp + 1;
  });
}

window.影视期号规划返回 = function() {
  window.影视期号编辑缓存 = null;
  影视切换标签('list');
};

// ===== 模式二：规划期号 =====
window.影视期号来源缓存 = [];
var 影视期号角色缓存 = [];
window.影视期号角色按性别 = {};
window.影视期号角色性别 = '女性';
var 影视期号角色全量缓存 = [];
window.影视本期来源 = [];
window.影视本期角色 = [];
var 影视性别键 = ['女性', '男性', '扶她', '伪娘'];
var 影视性别图标 = { '女性': '♀', '男性': '♂', '扶她': '⚤', '伪娘': '⚥' };
window.影视新建角色按性别 = {};
window.影视新建角色性别 = '女性';

function 影视渲染规划期号(el) {
  var mk = 影视当前类型;
  var 节目 = 影视当前节目;
  var cfg = window.影视获取节目配置(节目.info.type, 节目.info.subtype);

  var editCache = window.影视期号编辑缓存;
  var 编辑中期号 = editCache && editCache.episode ? editCache : null;
  if (编辑中期号) {
    影视本期来源 = (编辑中期号.refSourceNames || 节目.info.refSourceNames || []).slice();
    影视本期角色 = (编辑中期号.refChars || 节目.info.refChars || []).slice();
  } else {
    影视本期来源 = (节目.info.refSourceNames || []).slice();
    影视本期角色 = (节目.info.refChars || []).slice();
  }

  var 标题 = 编辑中期号 ? '编辑' + escHtml(节目.info.name) + ' · 第' + 编辑中期号.episode + '期' : escHtml(节目.info.name) + ' · 新建期号';
  if (编辑中期号) window.影视期号编辑缓存 = 编辑中期号;
  var h = '<div class="n-card">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">';
  h += '<h3 style="font-size:15px;font-weight:600;margin:0">' + 标题 + '</h3>';
  h += '<button class="btn-sm" style="background:transparent;color:var(--fg2);border:1px solid var(--border);padding:2px 10px;border-radius:4px;cursor:pointer" onclick="影视期号规划返回()">← 返回</button>';
  h += '</div>';

  h += '<div style="display:flex;gap:12px">';
  h += '<div style="flex:0 0 260px">';

  h += '<div class="form-group" style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">🎭 演员</label>';
  h += '<div id="ysEpSources" style="max-height:100px;overflow-y:auto;display:flex;gap:4px;flex-wrap:wrap;padding:6px;background:var(--bg2);border-radius:6px;border:1px solid var(--border)">';
  h += '<span style="font-size:11px;color:var(--fg3)">加载中...</span></div></div>';

  h += '<div class="form-group"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">👤 出场人物</label>';
  h += '<div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:4px" id="ysEpGenderTabs">';
  影视性别键.forEach(function(g) {
    h += '<span class="char-cat-tab" style="flex:1;min-width:46px;padding:3px 4px;text-align:center;font-size:10px;cursor:pointer;border-radius:4px;border:1px solid var(--border);background:var(--bg2)" data-gender="' + g + '" onclick="window.影视期号角色性别=\'' + g + '\';document.querySelectorAll(\'#ysEpGenderTabs .char-cat-tab\').forEach(function(t){t.style.borderColor=\'var(--border)\';t.style.background=\'var(--bg2)\'});this.style.borderColor=\'var(--accent2)\';this.style.background=\'var(--accent-dim)\';window.影视渲染期号角色列表()">' + 影视性别图标[g] + ' ' + g + '</span>';
  });
  h += '</div>';
  h += '<div id="ysEpChars" style="max-height:300px;overflow-y:auto;padding:4px;background:var(--bg2);border-radius:6px;border:1px solid var(--border)">';
  h += '<span style="font-size:11px;color:var(--fg3)">加载中...</span></div></div>';
  h += '</div>'; // end left col

  h += '<div style="flex:1;min-width:0">';
  h += '<div style="display:flex;gap:10px">';
  h += '<div class="form-group" style="flex:0 0 70px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">期号</label>';
  h += '<input class="llm-input" id="ysEpNumber" type="number" min="1" style="width:100%" readonly></div>';
  h += '<div class="form-group" style="flex:1"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">📌 本期标题</label>';
  h += '<input class="llm-input" id="ysEpHeadline" style="width:100%" placeholder="留空由 AI 生成" value="' + escHtml(编辑中期号 && 编辑中期号.headline ? 编辑中期号.headline : '') + '" oninput="影视自动保存期号()"></div>';
  h += '</div>';

  h += '<div class="form-group" style="margin-top:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">🎯 本期关注方向</label>';
  h += '<div style="display:flex;gap:6px"><textarea class="llm-input" id="ysEpFocus" style="flex:1;min-height:70px;resize:vertical" placeholder="本期重点关注话题、内容倾向…" oninput="影视自动保存期号()">' + escHtml(编辑中期号 && 编辑中期号.epFocus ? 编辑中期号.epFocus : '') + '</textarea>';
  h += '<button class="ai-suggest-btn" onclick="openAiPanel(\'np_episode_focus\')" title="AI 建议" style="align-self:flex-start;margin-top:0">🤖</button></div></div>';

  h += '<div class="form-group" style="margin-top:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">📜 本期大致情节</label>';
  h += '<textarea class="llm-input" id="ysEpPlot" style="width:100%;min-height:200px;resize:vertical" placeholder="描述本期大致的剧情走向、情色场景安排、看点…" oninput="影视自动保存期号()">' + escHtml(编辑中期号 && 编辑中期号.plot ? 编辑中期号.plot : '') + '</textarea></div>';

  h += '<div style="margin-top:10px"><button class="btn-main" onclick="影视AI生成期号()" style="width:100%;padding:8px;font-size:13px">🤖 AI 生成规划</button></div>';
  h += '<div id="ysEpStatus" style="margin-top:6px;font-size:11px;color:var(--fg2)"></div>';
  h += '</div>'; // end right col
  h += '</div>'; // end flex row
  h += '</div>'; // end n-card
  el.innerHTML = h;

  var epInput = document.getElementById('ysEpNumber');
  if (epInput) {
    if (编辑中期号) { epInput.value = 编辑中期号.episode; window.影视当前期号编号 = 编辑中期号.episode; }
    else { 影视计算下一期号(mk, 节目.name).then(function(nextEp) { epInput.value = nextEp; window.影视当前期号编号 = nextEp; }); }
  }

  var srcPool = document.getElementById('ysEpSources');
  if (srcPool) {
    影视加载来源(mk).then(function(sources) {
      影视期号来源缓存 = sources || [];
      srcPool.innerHTML = sources.map(function(s, i) {
        var 是常驻 = 影视本期来源.indexOf(s.name) >= 0;
        var cls = 是常驻 ? 'tag-chip tag-active' : 'tag-chip';
        return '<span class="' + cls + '" data-idx="' + i + '" onclick="var a=影视期号来源缓存[this.getAttribute(\'data-idx\')];if(!a)return;var p=window.影视本期来源.indexOf(a.name);if(p>=0){window.影视本期来源.splice(p,1);this.classList.remove(\'tag-active\')}else{window.影视本期来源.push(a.name);this.classList.add(\'tag-active\')};影视自动保存期号()" style="cursor:pointer;' + (是常驻 ? 'color:var(--accent2)' : '') + '">' + escHtml(s.name || '') + '</span>';
      }).join('');
    });
  }

  window.影视期号角色性别 = '女性';
  影视期号角色全量缓存 = [];
  window.影视期号角色按性别 = { '女性': [], '男性': [], '扶她': [], '伪娘': [] };
  var genderMap = { 'female': '女性', 'male': '男性', 'femboy': '伪娘', 'futa': '扶她', 'beast': '男性' };
  Store.character.list().then(function(items) {
    影视期号角色全量缓存 = items || [];
    影视期号角色全量缓存.forEach(function(c) {
      var bi = c.identity && c.identity.basicInfo || {};
      var cg = genderMap[bi.gender] || bi.gender;
      if (window.影视期号角色按性别[cg]) window.影视期号角色按性别[cg].push(c);
    });
    var tabs = document.querySelectorAll('#ysEpGenderTabs .char-cat-tab');
    if (tabs.length) { tabs[0].style.borderColor = 'var(--accent2)'; tabs[0].style.background = 'var(--accent-dim)'; }
    影视渲染期号角色列表();
  });
}

window.影视渲染期号角色列表 = function() {
  var pool = document.getElementById('ysEpChars');
  if (!pool) return;
  var gender = window.影视期号角色性别 || '女性';
  var items = window.影视期号角色按性别[gender] || [];
  pool.innerHTML = items.map(function(c) {
    var bi = (c.identity && c.identity.basicInfo) || {};
    var name = bi.name || c.title || '';
    if (!name) return '';
    var 已选 = window.影视本期角色.indexOf(name) >= 0;
    var age = bi.age || '';
    var title = bi.title || '';
    var cardStyle = 'cursor:pointer;margin-bottom:4px;padding:8px;border-radius:6px;border:2px solid ' + (已选 ? 'var(--accent2)' : 'var(--border)') + ';background:var(--bg);border-left:3px solid ' + (已选 ? 'var(--accent2)' : 'transparent') + ';transition:all 0.1s';
    return '<div class="n-card" style="' + cardStyle + '" data-name="' + escHtml(name) + '" onclick="var n=this.getAttribute(\'data-name\');if(!n)return;var p=window.影视本期角色.indexOf(n);if(p>=0){window.影视本期角色.splice(p,1);this.style.borderColor=\'var(--border)\';this.style.borderLeftColor=\'transparent\'}else{window.影视本期角色.push(n);this.style.borderColor=\'var(--accent2)\';this.style.borderLeftColor=\'var(--accent2)\'};影视自动保存期号()">' +
      '<div class="fw-600 fs-13" style="color:var(--fg)">' + escHtml(name) + (age ? ' <span class="text-muted" style="font-weight:400;font-size:11px;color:var(--fg2)">' + age + '岁</span>' : '') + '</div>' +
      (title ? '<div class="text-muted text-sm" style="font-size:11px;color:var(--fg2);margin-top:2px">' + escHtml(title) + '</div>' : '') +
    '</div>';
  }).join('');
  if (!pool.innerHTML) pool.innerHTML = '<div style="padding:12px;text-align:center;font-size:11px;color:var(--fg3)">暂无此性别角色</div>';
};

window.影视AI生成期号 = function() {
  var mk = 影视当前类型;
  var 节目 = 影视当前节目;
  if (!节目) { toast('请先选择作品'); return; }
  var epInput = document.getElementById('ysEpNumber');
  var ep = epInput ? parseInt(epInput.value) : 0;
  if (!ep || ep < 1) { toast('请输入期号'); return; }
  var hlEl = document.getElementById('ysEpHeadline');
  var headline = hlEl ? hlEl.value.trim() : '';
  var focusEl = document.getElementById('ysEpFocus');
  var epFocus = focusEl ? focusEl.value.trim() : '';
  var plotEl = document.getElementById('ysEpPlot');
  var plot = plotEl ? plotEl.value.trim() : '';
  var statusEl = document.getElementById('ysEpStatus');
  toast('🤖 正在生成第' + ep + '期规划...');
  if (statusEl) statusEl.textContent = '⏳ 生成中...';

  var cfg = window.影视获取节目配置(节目.info.type, 节目.info.subtype);

  影视列出期号(mk, 节目.name).then(function(eps) {
    var ctx = '内容类型：' + (影视内容类型[mk] ? 影视内容类型[mk].label : '') + '\n';
    ctx += '频道：' + 影视文件夹[mk] + '\n';
    ctx += '作品名称：' + 节目.info.name + '\n';
    ctx += '作品类型：' + cfg.label + '\n风格要求：' + cfg.styleDesc + '\n段落结构：' + cfg.sections.join('、') + '\n';
    ctx += '期号：第' + ep + '期（新期号）\n';
    if (节目.info.focus) ctx += '作品定位：' + 节目.info.focus + '\n';
    if (节目.info.description) ctx += '作品简介：' + 节目.info.description + '\n';
    if (headline) ctx += '已填标题：' + headline + '\n';
    if (epFocus) ctx += '已填关注方向：' + epFocus + '\n';
    if (plot) ctx += '已填情节概述：' + plot + '\n';

    var 节目常驻演员 = 节目.info.refSourceNames || [];
    var 节目常驻角色 = 节目.info.refChars || [];
    ctx += '\n【本期概况】\n';
    ctx += '本期演员：' + (影视本期来源.length ? 影视本期来源.join('、') : '（无）') + '\n';
    ctx += '本期出场：' + (影视本期角色.length ? 影视本期角色.join('、') : '（无）') + '\n';

    if (eps && eps.length) {
      ctx += '\n【已有期号概览】\n';
      eps.sort(function(a, b) { return (a.episode || 0) - (b.episode || 0); });
      eps.forEach(function(e) {
        var plotText = e.plot || '';
        var head = plotText ? '\n    开头：' + plotText.slice(0, 100) : '';
        var tail = plotText.length > 100 ? '\n    结尾：' + plotText.slice(-80) : '';
        ctx += '第' + e.episode + '期：' + (e.headline || '无标题') + head + tail + '\n';
      });
    }

    if (影视本期来源 && 影视本期来源.length) {
      ctx += '\n【演员】\n';
      影视本期来源.forEach(function(n) {
        var found = 影视期号来源缓存.find(function(s) { return s.name === n; });
        ctx += (found ? JSON.stringify(found, null, 2) : n) + '\n';
      });
    }

    var 角色加载 = [];
    if (影视本期角色 && 影视本期角色.length) {
      ctx += '\n【出场人物】\n';
      角色加载 = 影视本期角色.map(function(rn) {
        return Store.character.get(rn).then(function(d) { return { name: rn, data: d }; });
      });
    }

    Promise.all(角色加载).then(function(角色列表) {
      角色列表.forEach(function(item) {
        ctx += (item.data && item.data.identity ? JSON.stringify({ identity: item.data.identity }, null, 2) : '- ' + item.name) + '\n';
      });

      var rendered = renderPrompt('news_episode_plan', { context: ctx });
      LLM.callJSON({ prompt: rendered.user, system: rendered.system, label: '期号规划', temperature: 0.85 }).then(function(data) {
        if (!data) { toast('生成失败'); return; }
        var newHeadline = data.headline || '';
        var newFocus = data.epFocus || '';
        var newPlot = data.plot || '';
        if (hlEl && newHeadline) hlEl.value = newHeadline;
        if (focusEl && newFocus) focusEl.value = newFocus;
        if (plotEl && newPlot) plotEl.value = newPlot;
        影视自动保存期号();
        toast('✅ 第' + ep + '期规划已生成');
        if (statusEl) statusEl.textContent = '✅ 规划完成';
      }).catch(function(err) { toast('❌ ' + err.message); if (statusEl) statusEl.textContent = '❌ ' + err.message; });
    });
  }).catch(function(err) { toast('❌ ' + err.message); });
};

var 影视自动保存计时器 = null;
window.影视自动保存期号 = function() {
  if (影视自动保存计时器) clearTimeout(影视自动保存计时器);
  影视自动保存计时器 = setTimeout(影视保存当前期号, 500);
};

function 影视保存当前期号() {
  var mk = 影视当前类型;
  var 节目 = 影视当前节目;
  if (!节目) return Promise.resolve();
  var epInput = document.getElementById('ysEpNumber');
  var ep = epInput ? parseInt(epInput.value) : 0;
  if (!ep || ep < 1) return Promise.resolve();
  var hlEl = document.getElementById('ysEpHeadline');
  var focusEl = document.getElementById('ysEpFocus');
  var plotEl = document.getElementById('ysEpPlot');
  var info = { episode: ep, headline: (hlEl ? hlEl.value.trim() : '') || '', epFocus: (focusEl ? focusEl.value.trim() : '') || '', plot: (plotEl ? plotEl.value.trim() : '') || '', refChars: 影视本期角色 || [], refSourceNames: 影视本期来源 || [], createdAt: Date.now() };
  var 期号路径 = 影视期号路径(mk, 节目.name, ep);
  return 影视保存期号(期号路径, info).then(function() { window.影视当前期号 = { dir: 期号路径, info: info }; });
}

window.影视期号完成规划 = function() {
  影视保存当前期号().then(function() {
    影视当前期号 = window.影视当前期号 || null;
    window.影视期号编辑缓存 = null;
    影视切换标签('list');
  });
};

window.影视渲染规划 = 影视渲染规划;
