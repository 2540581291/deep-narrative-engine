// 新闻媒体 · 📝 规划（节目模式 + 期号模式）
var 报纸新建角色缓存 = [];
var 报纸新建来源缓存 = [];
var 报纸角色完整缓存 = {}; // name → 完整角色 JSON，通过 Store.character.get() 加载
var 报纸节目简介缓存 = '';

function 新闻媒体渲染规划(el) {
  var mk = 新闻媒体当前媒体;
  if (!新闻媒体当前节目) {
    新闻媒体渲染规划节目(el);
  } else {
    新闻媒体渲染规划期号(el);
  }
}

// ===== AI 字段注册（所有字段共享完整上下文） =====

// 构建完整节目上下文（所有字段的 AI 都基于此信息，只包含已选中的常驻信息）
function 构建节目上下文() {
  return 构建节目上下文基础() + 构建节目上下文角色();
}

// 构建不含角色的基础上下文（始终同步返回字符串）
function 构建节目上下文基础() {
  var mk = 新闻媒体当前媒体;
  var f = window.新闻媒体规划节目表单;
  var m = 新闻媒体形态[mk];
  var cfg = f ? 新闻获取类型配置(mk, f.type) : null;
  var lines = [];
  if (m) {
    lines.push('媒体形态：' + m.label);
    if (m.desc) lines.push('媒体形态说明：' + m.desc);
  }
  if (cfg) {
    lines.push('节目类型：' + cfg.label);
    lines.push('节目类型说明：' + cfg.styleDesc);
    lines.push('栏目结构：' + cfg.sections.join('、'));
  }
  if (f && f.name) lines.push('节目名称：' + f.name);
  if (f && f.focus) lines.push('节目定位/关注方向：' + f.focus);
  if (f && f.description) lines.push('节目简介：' + f.description);
  // 常驻主持和常驻角色的名字行
  var 主持名 = [];
  if (f && f.refSources && f.refSources.length) {
    f.refSources.forEach(function(s) { 主持名.push(typeof s === 'string' ? s : s.name); });
  }
  if (主持名.length) lines.push('常驻' + (来源名称映射[mk] || '来源') + '：' + 主持名.join('、'));
  var 角色名 = f && f.refChars ? f.refChars : [];
  if (角色名.length) lines.push('常驻角色：' + 角色名.join('、'));
  // 具体的常驻信息在以下
  if (主持名.length || 角色名.length) lines.push('');
  // 已选常驻来源（完整 JSON 传 AI）
  if (f && f.refSources && f.refSources.length) {
    lines.push('');
    lines.push('【常驻' + (来源名称映射[mk] || '来源') + '】');
    f.refSources.forEach(function(s) {
      var src = typeof s === 'string' ? null : s;
      if (src) {
        lines.push(JSON.stringify(src, null, 2));
      } else {
        lines.push('- ' + s + '（完整数据不可用）');
      }
    });
  }
  // 已选常驻角色：名字已在上面列出，具体 JSON 由调用方异步填充
  return lines.join('\n');
}

// 构建角色的完整 JSON 上下文部分（返回 Promise）
function 构建节目上下文角色() {
  var f = window.新闻媒体规划节目表单;
  if (!f || !f.refChars || !f.refChars.length) return '';
  return ''; // 角色数据通过新闻媒体加载角色身份 异步传入
}

// 从磁盘读取角色的 identity 区块，返回 Promise<string>
function 新闻媒体加载角色身份(角色名列表) {
  var lines = [];
  return Promise.all(角色名列表.map(function(rn) {
    return Store.character.get(rn).then(function(d) {
      return { name: rn, data: d };
    });
  })).then(function(loaded) {
    loaded.forEach(function(item) {
      lines.push((item.data && item.data.identity ? JSON.stringify({ identity: item.data.identity }, null, 2) : '- ' + item.name) + '\n');
    });
    return lines.join('');
  });
}

(function() {
  // 节目名称建议
  registerAiField('np_program_name', '节目名称', function() {
    return 构建节目上下文基础();
  }, { suggestPrompt: 'news_program_name' });

  // 节目定位/关注方向建议
  registerAiField('np_program_focus', '节目定位', function() {
    return 构建节目上下文基础();
  }, { suggestPrompt: 'news_program_focus' });

  // 节目简介完整生成（rawText 模式：contextFn 需返回完整的 system+user 提示词）
  registerAiField('np_program_desc', '节目简介', function() {
    var ctx = 构建节目上下文基础();
    return renderPrompt('news_program_desc', { context: ctx });
  }, {
    rawText: true,
    suggestPrompt: 'news_program_desc',
    fillFn: function(text) {
      var ta = document.getElementById('npProgramDesc');
      if (ta) { ta.value = text; }
      报纸节目简介缓存 = text;
    }
  });

  // 本期关注方向建议
  registerAiField('np_episode_focus', '本期关注方向', function() {
    var 节目 = 新闻媒体当前节目;
    var mk = 新闻媒体当前媒体;
    var cfg = 新闻获取类型配置(mk, 节目 ? 节目.info.type : '');
    var ctx = '节目名称：' + (节目 ? 节目.info.name : '') + '\n';
    ctx += '节目类型：' + (cfg ? cfg.label : '') + '\n';
    ctx += '节目类型说明：' + (cfg ? cfg.styleDesc : '') + '\n';
    ctx += '栏目结构：' + (cfg ? cfg.sections.join('、') : '') + '\n';
    if (节目 && 节目.info.focus) ctx += '节目定位：' + 节目.info.focus + '\n';
    if (节目 && 节目.info.description) ctx += '节目简介：' + 节目.info.description + '\n';
    // 来源信息
    if (报纸期号来源缓存 && 报纸期号来源缓存.length) {
      ctx += '\n【主持人资料】\n';
      报纸期号来源缓存.forEach(function(s) {
        ctx += '- ' + (s.name || '') + (s.bio ? '：' + s.bio : '') + '\n';
      });
    }
    // 角色信息
    if (window.报纸期号角色全量缓存 && window.报纸期号角色全量缓存.length) {
      ctx += '\n【出场人物】\n';
      window.报纸期号角色全量缓存.forEach(function(c) {
        var name = ((c.identity && c.identity.basicInfo) || {}).name || c.title || '未命名';
        ctx += '- ' + name + '\n';
      });
    }
    return ctx;
  }, { suggestPrompt: 'news_episode_focus' });
})();

// ===== 模式一：规划节目 =====
function 新闻媒体渲染规划节目(el) {
  var mk = 新闻媒体当前媒体;
  var cfgList = 新闻获取类型键(mk);
  var configs = mk === 'tv' ? 电视新闻类型配置 : mk === 'radio' ? 广播电台类型配置 : 报纸类型配置;
  var m = 新闻媒体形态[mk];
  // 如果是编辑模式，用已有数据初始化
  var existing = window.新闻媒体规划节目表单 || null;
  var 表单 = {
    type: (existing && existing.type && cfgList.indexOf(existing.type) >= 0) ? existing.type : (cfgList[0] || ''),
    name: (existing && existing.name) || '',
    focus: (existing && existing.focus) || '',
    description: (existing && existing.description) || '',
    refSources: (existing && existing.refSources) || [],
    refChars: (existing && existing.refChars) || []
  };
  报纸节目简介缓存 = 表单.description;
  var 是否编辑 = existing && existing._editing;

  var h = '<div class="n-card">';
  h += '<h3 style="font-size:15px;font-weight:600;margin-bottom:12px">' + m.icon + ' ' + (是否编辑 ? '编辑' : '新建') + '</h3>';

  // 类型（全宽顶部）
  h += '<div class="form-group" style="margin-bottom:6px"><label style="font-size:12px;font-weight:500;color:var(--fg2);display:block;margin-bottom:6px">📋 类型</label>';
  h += '<div id="npTypeGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
  cfgList.forEach(function(k) {
    var cfg = configs[k];
    h += '<div class="n-card" style="padding:10px;cursor:pointer;border:2px solid ' + (k === 表单.type ? 'var(--accent2)' : 'var(--border)') + ';border-radius:6px" onclick="var t=this.parentElement;t.querySelectorAll(\'.n-card\').forEach(function(c){c.style.borderColor=\'var(--border)\'});this.style.borderColor=\'var(--accent2)\';新闻媒体规划节目表单.type=\'' + k + '\'">';
    h += '<div style="font-size:13px;font-weight:600;color:var(--fg)">' + cfg.icon + ' ' + cfg.label + '</div>';
    h += '<div style="font-size:10px;color:var(--fg2);margin-top:2px">' + cfg.sections.join(' · ') + '</div></div>';
  });
  h += '</div></div>';

  // 左右两栏
  h += '<div style="display:flex;gap:12px;margin-top:8px">';

  // 左栏：常驻来源 + 常驻角色
  h += '<div style="flex:0 0 260px">';

  // 主持人（来源多选）
  h += '<div class="form-group" style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">🎙 常驻' + (来源名称映射[mk] || '来源') + '</label>';
  h += '<div id="npPlanSources" style="max-height:100px;overflow-y:auto;display:flex;gap:4px;flex-wrap:wrap;padding:6px;background:var(--bg2);border-radius:6px;border:1px solid var(--border)">';
  h += '<span style="font-size:11px;color:var(--fg3)">加载中...</span></div></div>';

  // 常驻角色
  h += '<div class="form-group"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">👤 常驻角色</label>';
  h += '<div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:4px" id="npPlanGenderTabs">';
  新闻媒体性别键.forEach(function(g) {
    h += '<span class="char-cat-tab" style="flex:1;min-width:46px;padding:3px 4px;text-align:center;font-size:10px;cursor:pointer;border-radius:4px;border:1px solid var(--border);background:var(--bg2)" data-pgender="' + g + '" onclick="window.报纸新建角色性别=\'' + g + '\';document.querySelectorAll(\'#npPlanGenderTabs .char-cat-tab\').forEach(function(t){t.style.borderColor=\'var(--border)\';t.style.background=\'var(--bg2)\'});this.style.borderColor=\'var(--accent2)\';this.style.background=\'var(--accent-dim)\';window.新闻媒体渲染新建节目角色列表()">' + 新闻媒体性别图标[g] + ' ' + g + '</span>';
  });
  h += '</div>';
  h += '<div id="npPlanChars" style="max-height:260px;overflow-y:auto;padding:4px;background:var(--bg2);border-radius:6px;border:1px solid var(--border)">';
  h += '<span style="font-size:11px;color:var(--fg3)">加载中...</span></div></div>';

  h += '</div>'; // end left col

  // 右栏：名称 + 定位 + 简介
  h += '<div style="flex:1;min-width:0">';

  h += '<div class="form-group"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">节目名称</label>';
  h += aiInput('np_program_name', '', '如：' + (mk === 'tv' ? '晚间新闻' : mk === 'radio' ? '音乐之声' : '春城晚报'), 表单.name);
  h += '</div>';

  h += '<div class="form-group" style="margin-top:10px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">📌 节目定位/关注方向</label>';
  h += aiInput('np_program_focus', '', '如：社会热点、娱乐八卦、深度调查', 表单.focus);
  h += '</div>';

  h += '<div class="form-group" style="margin-top:10px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">📖 节目简介</label>';
  h += '<div style="display:flex;gap:6px"><textarea class="llm-input" id="npProgramDesc" style="flex:1;min-height:120px;resize:vertical" placeholder="说明本节目主要关注什么内容、重点是什么…" oninput="报纸节目简介缓存=this.value">' + escHtml(报纸节目简介缓存) + '</textarea>';
  h += '<button class="ai-suggest-btn" onclick="openAiGenPanel(\'np_program_desc\')" title="AI 生成节目简介" style="align-self:flex-start;margin-top:0">🤖</button></div></div>';

  h += '<div style="margin-top:14px"><button class="btn-main" onclick="新闻媒体保存节目配置()" style="width:100%;padding:10px;font-size:13px">' + (是否编辑 ? '💾 保存修改' : '💾 创建节目') + '</button></div>';

  h += '</div>'; // end right col
  h += '</div>'; // end flex row
  h += '</div>'; // end n-card
  el.innerHTML = h;

  window.新闻媒体规划节目表单 = 表单;

  // 加载主持人和角色
  报纸新建来源缓存 = [];
  新闻媒体加载来源(mk).then(function(sources) {
    报纸新建来源缓存 = sources || [];
    var pool = document.getElementById('npPlanSources');
    if (!pool) return;
    if (!sources.length) { pool.innerHTML = '<span style="font-size:11px;color:var(--fg3)">暂无来源</span>'; return; }
    pool.innerHTML = sources.map(function(s, i) {
      var 已选 = 表单.refSources.some(function(r) { return typeof r === 'string' ? r === s.name : r === s; });
      return '<span class="tag-chip' + (已选 ? ' tag-active' : '') + '" data-idx="' + i + '" onclick="var f=window.新闻媒体规划节目表单;var s=报纸新建来源缓存[this.getAttribute(\'data-idx\')];if(!s)return;var sn=s.name||\'\';var idx=f.refSources.findIndex(function(r){return typeof r===\'string\'?r===sn:r===s;});if(idx>=0){f.refSources.splice(idx,1);this.classList.remove(\'tag-active\')}else{f.refSources.push(s);this.classList.add(\'tag-active\')}" style="cursor:pointer">' + escHtml(s.name || '') + '</span>';
    }).join('');
  });

  报纸新建角色缓存 = [];
  window.报纸新建角色按性别 = { '女性': [], '男性': [], '扶她': [], '伪娘': [] };
  window.报纸新建角色性别 = '女性';
  var pGenderMap = { 'female': '女性', 'male': '男性', 'femboy': '伪娘', 'futa': '扶她', 'beast': '男性' };
  Store.character.list().then(function(items) {
    报纸新建角色缓存 = items || [];
    报纸新建角色缓存.forEach(function(c) {
      var bi = c.identity && c.identity.basicInfo || {};
      var cg = pGenderMap[bi.gender] || bi.gender;
      if (window.报纸新建角色按性别[cg]) window.报纸新建角色按性别[cg].push(c);
    });
    var tabs = document.querySelectorAll('#npPlanGenderTabs .char-cat-tab');
    if (tabs.length) { tabs[0].style.borderColor = 'var(--accent2)'; tabs[0].style.background = 'var(--accent-dim)'; }
    window.新闻媒体渲染新建节目角色列表();
  });
}

window.新闻媒体渲染新建节目角色列表 = function() {
  var pool = document.getElementById('npPlanChars');
  if (!pool) return;
  var gender = window.报纸新建角色性别 || '女性';
  var items = window.报纸新建角色按性别[gender] || [];
  var f = window.新闻媒体规划节目表单;
  pool.innerHTML = items.map(function(c) {
    var bi = (c.identity && c.identity.basicInfo) || {};
    var name = bi.name || c.title || '';
    if (!name) return '';
    var 已选 = f && f.refChars && f.refChars.indexOf(name) >= 0;
    var age = bi.age || '';
    var title = bi.title || '';
    var cardStyle = 'cursor:pointer;margin-bottom:4px;padding:8px;border-radius:6px;border:2px solid ' + (已选 ? 'var(--accent2)' : 'var(--border)') + ';background:var(--bg);border-left:3px solid ' + (已选 ? 'var(--accent2)' : 'transparent') + ';transition:all 0.1s';
    return '<div class="n-card" style="' + cardStyle + '" data-pname="' + escHtml(name) + '" onclick="var n=this.getAttribute(\'data-pname\');if(!n)return;var f=window.新闻媒体规划节目表单;if(!f)return;var p=f.refChars.indexOf(n);if(p>=0){f.refChars.splice(p,1);this.style.borderColor=\'var(--border)\';this.style.borderLeftColor=\'transparent\'}else{f.refChars.push(n);Store.character.get(n).then(function(d){if(d)报纸角色完整缓存[n]=d;});this.style.borderColor=\'var(--accent2)\';this.style.borderLeftColor=\'var(--accent2)\'}">' +
      '<div class="fw-600 fs-13" style="color:var(--fg)">' + escHtml(name) + (age ? ' <span class="text-muted" style="font-weight:400;font-size:11px;color:var(--fg2)">' + age + '岁</span>' : '') + '</div>' +
      (title ? '<div class="text-muted text-sm" style="font-size:11px;color:var(--fg2);margin-top:2px">' + escHtml(title) + '</div>' : '') +
    '</div>';
  }).join('');
  if (!pool.innerHTML) pool.innerHTML = '<div style="padding:12px;text-align:center;font-size:11px;color:var(--fg3)">暂无此性别角色</div>';
};

window.新闻媒体保存节目配置 = function() {
  var mk = 新闻媒体当前媒体;
  var f = window.新闻媒体规划节目表单;
  var nameEl = document.getElementById('np_program_name');
  if (nameEl) f.name = nameEl.value.trim();
  var focusEl = document.getElementById('np_program_focus');
  if (focusEl) f.focus = focusEl.value.trim();
  var descEl = document.getElementById('npProgramDesc');
  if (descEl) f.description = descEl.value.trim();

  // 所有字段已填写 → 直接保存
  if (f.name && f.focus && f.description && !f._editing) {
    return 新闻媒体保存节目直接(f);
  }
  // 编辑模式且字段全都有 → 直接保存
  if (f._editing && f.name && f.focus && f.description) {
    return 新闻媒体保存节目直接(f);
  }

  // 有空字段 → AI 补全
  toast('🔄 正在智能补全节目信息...');
  新闻媒体加载角色身份(f.refChars || []).then(function(角色上下文) {
    var ctx = 构建节目上下文基础();
    if (角色上下文) ctx += '\n【常驻角色】\n' + 角色上下文;
    var rendered = renderPrompt('news_program_gen_all', { context: ctx });
    LLM.callJSON({
      prompt: rendered.user,
      system: rendered.system,
      label: '节目补全',
      temperature: 0.85
    }).then(function(data) {
      if (!data) { toast('生成失败'); return; }
      // 只补充原来为空的字段
      if (!f.name && data.name) { f.name = data.name; if (nameEl) nameEl.value = data.name; }
      if (!f.focus && data.focus) { f.focus = data.focus; if (focusEl) focusEl.value = data.focus; }
      if (!f.description && data.description) {
        f.description = data.description;
        if (descEl) descEl.value = data.description;
        报纸节目简介缓存 = data.description;
      }
      if (!f.name) { toast('AI 未能生成节目名称，请手动填写'); return; }
      return 新闻媒体保存节目直接(f);
    }).catch(function(err) {
      toast('AI 补全失败: ' + err.message);
    });
  });
};

function 新闻媒体保存节目直接(f) {
  var mk = 新闻媒体当前媒体;
  var info = { name: f.name, type: f.type, focus: f.focus || '', description: f.description || '', refSourceNames: f.refSources.map(function(s){return s.name;}), refChars: f.refChars, createdAt: Date.now() };
  var saveTask;
  if (f._editing && f._editName && f._editName !== f.name) {
    // 编辑模式且节目名改了：先删除旧的，再保存新的
    saveTask = 新闻媒体删除节目(mk, f._editName).then(function() {
      return 新闻媒体保存节目(mk, f.name, info);
    });
  } else {
    saveTask = 新闻媒体保存节目(mk, f.name, info);
  }
  return saveTask.then(function() {
    toast(f._editing ? '✅ 节目已更新' : '✅ 节目已创建');
    新闻媒体当前节目 = null;
    window.新闻媒体规划节目表单 = null;
    新闻媒体切换标签('list');
  });
}

// ===== 辅助：计算下一期号 =====
function 新闻媒体计算下一期号(mk, 节目名) {
  return 新闻媒体列出期号(mk, 节目名).then(function(episodes) {
    if (!episodes || !episodes.length) return 1;
    var maxEp = 0;
    episodes.forEach(function(ep) {
      // 同时检查 episode 字段和从目录名解析
      var num = ep.episode || 0;
      if (!num && ep._dir) {
        var m = (ep._dir || '').match(/第(\d+)期/);
        if (m) num = parseInt(m[1]);
      }
      if (num > maxEp) maxEp = num;
    });
    return maxEp + 1;
  });
}

// 从期号规划页返回（回到该节目的期号列表，而非节目列表）
window.新闻媒体期号规划返回 = function() {
  window.新闻媒体期号编辑缓存 = null;
  新闻媒体切换标签('list');
};

// ===== 模式二：规划期号（可调整常驻主持人/角色） =====
window.报纸期号来源缓存 = [];
var 报纸期号角色缓存 = [];
window.报纸期号角色按性别 = {};
window.报纸期号角色性别 = '女性';
var 报纸期号角色全量缓存 = [];
window.新闻媒体本期来源 = [];
window.新闻媒体本期角色 = [];
var 新闻媒体性别键 = ['女性', '男性', '扶她', '伪娘'];
var 新闻媒体性别图标 = { '女性': '♀', '男性': '♂', '扶她': '⚤', '伪娘': '⚥' };
window.报纸新建角色按性别 = {};
window.报纸新建角色性别 = '女性';

function 新闻媒体渲染规划期号(el) {
  var mk = 新闻媒体当前媒体;
  var 节目 = 新闻媒体当前节目;
  var cfg = 新闻获取类型配置(mk, 节目.info.type) || {};

  // 检查是否是编辑已有期号
  var editCache = window.新闻媒体期号编辑缓存;
  var 编辑中期号 = editCache && editCache.episode ? editCache : null;
  if (编辑中期号) {
    // 已有期号的编辑：用已存数据预填
    新闻媒体本期来源 = (编辑中期号.refSourceNames || 节目.info.refSourceNames || []).slice();
    新闻媒体本期角色 = (编辑中期号.refChars || 节目.info.refChars || []).slice();
  } else {
    // 新建期号：从节目继承常驻
    新闻媒体本期来源 = (节目.info.refSourceNames || []).slice();
    新闻媒体本期角色 = (节目.info.refChars || []).slice();
  }

  var 标题 = 编辑中期号 ? '编辑' + escHtml(节目.info.name) + ' · 第' + 编辑中期号.episode + '期' : escHtml(节目.info.name) + ' · 新建期号';
  if (编辑中期号) window.新闻媒体期号编辑缓存 = 编辑中期号;
  var h = '<div class="n-card">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">';
  h += '<h3 style="font-size:15px;font-weight:600;margin:0">' + 标题 + '</h3>';
  h += '<button class="btn-sm" style="background:transparent;color:var(--fg2);border:1px solid var(--border);padding:2px 10px;border-radius:4px;cursor:pointer" onclick="新闻媒体期号规划返回()">← 返回</button>';
  h += '</div>';

  // 左右两栏
  h += '<div style="display:flex;gap:12px">';

  // === 左栏：主持 + 出场人物 ===
  h += '<div style="flex:0 0 260px">';

  // 主持人
  h += '<div class="form-group" style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">🎙 主持</label>';
  h += '<div id="npEpSources" style="max-height:100px;overflow-y:auto;display:flex;gap:4px;flex-wrap:wrap;padding:6px;background:var(--bg2);border-radius:6px;border:1px solid var(--border)">';
  h += '<span style="font-size:11px;color:var(--fg3)">加载中...</span></div></div>';

  // 出场人物
  h += '<div class="form-group"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">👤 出场人物</label>';
  h += '<div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:4px" id="npEpGenderTabs">';
  新闻媒体性别键.forEach(function(g) {
    h += '<span class="char-cat-tab" style="flex:1;min-width:46px;padding:3px 4px;text-align:center;font-size:10px;cursor:pointer;border-radius:4px;border:1px solid var(--border);background:var(--bg2)" data-gender="' + g + '" onclick="window.报纸期号角色性别=\'' + g + '\';document.querySelectorAll(\'#npEpGenderTabs .char-cat-tab\').forEach(function(t){t.style.borderColor=\'var(--border)\';t.style.background=\'var(--bg2)\'});this.style.borderColor=\'var(--accent2)\';this.style.background=\'var(--accent-dim)\';window.新闻媒体渲染期号角色列表()">' + 新闻媒体性别图标[g] + ' ' + g + '</span>';
  });
  h += '</div>';
  h += '<div id="npEpChars" style="max-height:300px;overflow-y:auto;padding:4px;background:var(--bg2);border-radius:6px;border:1px solid var(--border)">';
  h += '<span style="font-size:11px;color:var(--fg3)">加载中...</span></div></div>';

  h += '</div>'; // end left col

  // === 右栏：编辑内容 ===
  h += '<div style="flex:1;min-width:0">';

  h += '<div style="display:flex;gap:10px">';
  h += '<div class="form-group" style="flex:0 0 70px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">期号</label>';
  h += '<input class="llm-input" id="npEpNumber" type="number" min="1" style="width:100%" readonly></div>';
  h += '<div class="form-group" style="flex:1"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">📌 本期头条</label>';
  h += '<input class="llm-input" id="npEpHeadline" style="width:100%" placeholder="留空由 AI 生成" value="' + escHtml(编辑中期号 && 编辑中期号.headline ? 编辑中期号.headline : '') + '" oninput="新闻媒体自动保存期号()"></div>';
  h += '</div>';

  h += '<div class="form-group" style="margin-top:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">🎯 本期关注方向</label>';
  h += '<div style="display:flex;gap:6px"><textarea class="llm-input" id="npEpFocus" style="flex:1;min-height:70px;resize:vertical" placeholder="本期重点关注话题、内容倾向…" oninput="新闻媒体自动保存期号()">' + escHtml(编辑中期号 && 编辑中期号.epFocus ? 编辑中期号.epFocus : '') + '</textarea>';
  h += '<button class="ai-suggest-btn" onclick="openAiPanel(\'np_episode_focus\')" title="AI 建议" style="align-self:flex-start;margin-top:0">🤖</button></div></div>';

  h += '<div class="form-group" style="margin-top:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">📜 本期大致情节</label>';
  h += '<textarea class="llm-input" id="npEpPlot" style="width:100%;min-height:200px;resize:vertical" placeholder="描述本期大致的剧情走向、环节安排、看点…" oninput="新闻媒体自动保存期号()">' + escHtml(编辑中期号 && 编辑中期号.plot ? 编辑中期号.plot : '') + '</textarea></div>';

  h += '<div style="margin-top:10px"><button class="btn-main" onclick="新闻媒体AI生成期号()" style="width:100%;padding:8px;font-size:13px">🤖 AI 生成规划</button></div>';
  h += '<div id="npEpStatus" style="margin-top:6px;font-size:11px;color:var(--fg2)"></div>';

  h += '</div>'; // end right col
  h += '</div>'; // end flex row
  h += '</div>'; // end n-card
  el.innerHTML = h;

  // 自动计算并填充下一期号（编辑模式直接用已有期号）
  var epInput = document.getElementById('npEpNumber');
  if (epInput) {
    if (编辑中期号) {
      epInput.value = 编辑中期号.episode;
      window.新闻媒体当前期号编号 = 编辑中期号.episode;
    } else {
      新闻媒体计算下一期号(mk, 节目.name).then(function(nextEp) {
        epInput.value = nextEp;
        window.新闻媒体当前期号编号 = nextEp;
      });
    }
  }

  // 加载主持人列表并标记常驻
  var srcPool = document.getElementById('npEpSources');
  if (srcPool) {
    新闻媒体加载来源(mk).then(function(sources) {
      报纸期号来源缓存 = sources || [];
      srcPool.innerHTML = sources.map(function(s, i) {
        var 是常驻 = 新闻媒体本期来源.indexOf(s.name) >= 0;
        var cls = 是常驻 ? 'tag-chip tag-active' : 'tag-chip';
        return '<span class="' + cls + '" data-idx="' + i + '" onclick="var a=报纸期号来源缓存[this.getAttribute(\'data-idx\')];if(!a)return;var p=window.新闻媒体本期来源.indexOf(a.name);if(p>=0){window.新闻媒体本期来源.splice(p,1);this.classList.remove(\'tag-active\')}else{window.新闻媒体本期来源.push(a.name);this.classList.add(\'tag-active\')};新闻媒体自动保存期号()" style="cursor:pointer;' + (是常驻 ? 'color:var(--accent2)' : '') + '">' + escHtml(s.name || '') + '</span>';
      }).join('');
    });
  }

  // 按性别分组加载角色
  window.报纸期号角色性别 = '女性';
  报纸期号角色全量缓存 = [];
  window.报纸期号角色按性别 = { '女性': [], '男性': [], '扶她': [], '伪娘': [] };
  var genderMap = { 'female': '女性', 'male': '男性', 'femboy': '伪娘', 'futa': '扶她', 'beast': '男性' };
  Store.character.list().then(function(items) {
    报纸期号角色全量缓存 = items || [];
    报纸期号角色全量缓存.forEach(function(c) {
      var bi = c.identity && c.identity.basicInfo || {};
      var cg = genderMap[bi.gender] || bi.gender;
      if (window.报纸期号角色按性别[cg]) window.报纸期号角色按性别[cg].push(c);
    });
    var tabs = document.querySelectorAll('#npEpGenderTabs .char-cat-tab');
    if (tabs.length) { tabs[0].style.borderColor = 'var(--accent2)'; tabs[0].style.background = 'var(--accent-dim)'; }
    新闻媒体渲染期号角色列表();
  });
}

window.新闻媒体渲染期号角色列表 = function() {
  var pool = document.getElementById('npEpChars');
  if (!pool) return;
  var gender = window.报纸期号角色性别 || '女性';
  var items = window.报纸期号角色按性别[gender] || [];
  pool.innerHTML = items.map(function(c) {
    var bi = (c.identity && c.identity.basicInfo) || {};
    var name = bi.name || c.title || '';
    if (!name) return '';
    var 已选 = window.新闻媒体本期角色.indexOf(name) >= 0;
    var age = bi.age || '';
    var title = bi.title || '';
    var cardStyle = 'cursor:pointer;margin-bottom:4px;padding:8px;border-radius:6px;border:2px solid ' + (已选 ? 'var(--accent2)' : 'var(--border)') + ';background:var(--bg);border-left:3px solid ' + (已选 ? 'var(--accent2)' : 'transparent') + ';transition:all 0.1s';
    return '<div class="n-card" style="' + cardStyle + '" data-name="' + escHtml(name) + '" onclick="var n=this.getAttribute(\'data-name\');if(!n)return;var p=window.新闻媒体本期角色.indexOf(n);if(p>=0){window.新闻媒体本期角色.splice(p,1);this.style.borderColor=\'var(--border)\';this.style.borderLeftColor=\'transparent\'}else{window.新闻媒体本期角色.push(n);this.style.borderColor=\'var(--accent2)\';this.style.borderLeftColor=\'var(--accent2)\'};新闻媒体自动保存期号()">' +
      '<div class="fw-600 fs-13" style="color:var(--fg)">' + escHtml(name) + (age ? ' <span class="text-muted" style="font-weight:400;font-size:11px;color:var(--fg2)">' + age + '岁</span>' : '') + '</div>' +
      (title ? '<div class="text-muted text-sm" style="font-size:11px;color:var(--fg2);margin-top:2px">' + escHtml(title) + '</div>' : '') +
    '</div>';
  }).join('');
  if (!pool.innerHTML) pool.innerHTML = '<div style="padding:12px;text-align:center;font-size:11px;color:var(--fg3)">暂无此性别角色</div>';
};

window.新闻媒体AI生成期号 = function() {
  var mk = 新闻媒体当前媒体;
  var 节目 = 新闻媒体当前节目;
  if (!节目) { toast('请先选择节目'); return; }
  var epInput = document.getElementById('npEpNumber');
  var ep = epInput ? parseInt(epInput.value) : 0;
  if (!ep || ep < 1) { toast('请输入期号'); return; }
  var hlEl = document.getElementById('npEpHeadline');
  var headline = hlEl ? hlEl.value.trim() : '';
  var focusEl = document.getElementById('npEpFocus');
  var epFocus = focusEl ? focusEl.value.trim() : '';
  var plotEl = document.getElementById('npEpPlot');
  var plot = plotEl ? plotEl.value.trim() : '';
  var statusEl = document.getElementById('npEpStatus');
  toast('🤖 正在生成第' + ep + '期规划...');
  if (statusEl) statusEl.textContent = '⏳ 生成中...';

  var cfg = 新闻获取类型配置(mk, 节目.info.type) || {};

  // 先加载已有期号概览
  新闻媒体列出期号(mk, 节目.name).then(function(eps) {
    var ctx = '媒体形态：' + (新闻媒体形态[mk] ? 新闻媒体形态[mk].label : '') + '\n';
    ctx += '频道：' + 新闻媒体文件夹[mk] + '\n';
    ctx += '节目名称：' + 节目.info.name + '\n';
    ctx += '节目类型：' + cfg.label + '\n风格要求：' + cfg.styleDesc + '\n栏目结构：' + cfg.sections.join('、') + '\n';
    ctx += '期号：第' + ep + '期（新期号）\n';
    if (节目.info.focus) ctx += '节目定位：' + 节目.info.focus + '\n';
    if (节目.info.description) ctx += '节目简介：' + 节目.info.description + '\n';
    if (headline) ctx += '已填头条：' + headline + '\n';
    if (epFocus) ctx += '已填关注方向：' + epFocus + '\n';
    if (plot) ctx += '已填情节概述：' + plot + '\n';
    // 本期概况：显示本期出席人员与节目常驻的差异
    var 节目常驻主持 = 节目.info.refSourceNames || [];
    var 节目常驻角色 = 节目.info.refChars || [];
    ctx += '\n【本期概况】\n';
    ctx += '本期主持：' + (新闻媒体本期来源.length ? 新闻媒体本期来源.join('、') : '（无）') + '\n';
    ctx += '本期出场：' + (新闻媒体本期角色.length ? 新闻媒体本期角色.join('、') : '（无）') + '\n';
    // 比较本期与常驻的差异
    var 本期新增主持 = 新闻媒体本期来源.filter(function(n) { return 节目常驻主持.indexOf(n) < 0; });
    var 本期缺席主持 = 节目常驻主持.filter(function(n) { return 新闻媒体本期来源.indexOf(n) < 0; });
    var 本期新增角色 = 新闻媒体本期角色.filter(function(n) { return 节目常驻角色.indexOf(n) < 0; });
    var 本期缺席角色 = 节目常驻角色.filter(function(n) { return 新闻媒体本期角色.indexOf(n) < 0; });
    if (本期新增主持.length) ctx += '⚡ 本期新增主持：' + 本期新增主持.join('、') + '（非节目常驻）\n';
    if (本期缺席主持.length) ctx += '⚠️ 本期缺席主持：' + 本期缺席主持.join('、') + '（常驻本期未出场）\n';
    if (本期新增角色.length) ctx += '⚡ 本期新增角色：' + 本期新增角色.join('、') + '（非节目常驻）\n';
    if (本期缺席角色.length) ctx += '⚠️ 本期缺席角色：' + 本期缺席角色.join('、') + '（常驻本期未出场）\n';

    // 已有期号历史
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

  // 主持人资料
  if (新闻媒体本期来源 && 新闻媒体本期来源.length) {
    ctx += '\n【常驻主持】\n';
    新闻媒体本期来源.forEach(function(n) {
      var found = 报纸期号来源缓存.find(function(s) { return s.name === n; });
      ctx += (found ? JSON.stringify(found, null, 2) : n) + '\n';
    });
  }
  // 角色资料（从磁盘读取完整数据）
  var 角色加载 = [];
  if (新闻媒体本期角色 && 新闻媒体本期角色.length) {
    ctx += '\n【出场人物】\n';
    角色加载 = 新闻媒体本期角色.map(function(rn) {
      return Store.character.get(rn).then(function(d) { return { name: rn, data: d }; });
    });
  }

  Promise.all(角色加载).then(function(角色列表) {
    // 用角色数据替换占位
    角色列表.forEach(function(item) {
      ctx += (item.data && item.data.identity ? JSON.stringify({ identity: item.data.identity }, null, 2) : '- ' + item.name) + '\n';
    });

    var rendered = renderPrompt('news_episode_plan', { context: ctx });
    LLM.callJSON({
      prompt: rendered.user,
      system: rendered.system,
      label: '期号规划',
      temperature: 0.85
      }).then(function(data) {
      if (!data) { toast('生成失败'); return; }
      // 回填生成的字段到表单
      var newHeadline = data.headline || '';
      var newFocus = data.epFocus || '';
      var newPlot = data.plot || '';
      if (hlEl && newHeadline) hlEl.value = newHeadline;
      if (focusEl && newFocus) focusEl.value = newFocus;
      if (plotEl && newPlot) plotEl.value = newPlot;
      新闻媒体自动保存期号();
      toast('✅ 第' + ep + '期规划已生成');
      if (statusEl) statusEl.textContent = '✅ 规划完成，可继续调整或到写作台撰写内容';
    }).catch(function(err) { toast('❌ ' + err.message); if (statusEl) statusEl.textContent = '❌ ' + err.message; });
    });
  }).catch(function(err) { toast('❌ ' + err.message); });
};

var 新闻媒体自动保存计时器 = null;
window.新闻媒体自动保存期号 = function() {
  if (新闻媒体自动保存计时器) clearTimeout(新闻媒体自动保存计时器);
  新闻媒体自动保存计时器 = setTimeout(新闻媒体保存当前期号, 500);
};

function 新闻媒体保存当前期号() {
  var mk = 新闻媒体当前媒体;
  var 节目 = 新闻媒体当前节目;
  if (!节目) return Promise.resolve();
  var epInput = document.getElementById('npEpNumber');
  var ep = epInput ? parseInt(epInput.value) : 0;
  if (!ep || ep < 1) return Promise.resolve();
  var hlEl = document.getElementById('npEpHeadline');
  var focusEl = document.getElementById('npEpFocus');
  var plotEl = document.getElementById('npEpPlot');
  var info = {
    episode: ep,
    headline: (hlEl ? hlEl.value.trim() : '') || '',
    epFocus: (focusEl ? focusEl.value.trim() : '') || '',
    plot: (plotEl ? plotEl.value.trim() : '') || '',
    refChars: 新闻媒体本期角色 || [],
    refSourceNames: 新闻媒体本期来源 || [],
    createdAt: Date.now()
  };
  var 期号路径 = 新闻媒体期号路径(mk, 节目.name, ep);
  return 新闻媒体保存期号(期号路径, info).then(function() {
    window.新闻媒体当前期号 = { dir: 期号路径, info: info };
  });
}

window.新闻媒体期号完成规划 = function() {
  新闻媒体保存当前期号().then(function() {
    新闻媒体当前期号 = window.新闻媒体当前期号 || null;
    window.新闻媒体期号编辑缓存 = null;
    新闻媒体切换标签('list');
  });
};

window.新闻媒体渲染规划 = 新闻媒体渲染规划;
