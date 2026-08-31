// 黄游拔作 · 📝 规划（收录/编辑游戏信息，AI 补全）
var 黄游新建角色缓存 = [];
var 黄游新建来源缓存 = [];
var 黄游角色完整缓存 = {};
var 黄游游戏简介缓存 = '';
var 黄游性别键 = ['女性', '男性', '扶她', '伪娘'];
var 黄游性别图标 = { '女性': '♀', '男性': '♂', '扶她': '⚤', '伪娘': '⚥' };

function 黄游渲染规划(el) {
  黄游渲染规划游戏(el);
}

// ===== AI 字段注册 =====
function 构建游戏上下文基础() {
  var cat = 黄游当前分类;
  var f = window.黄游规划游戏表单;
  var m = 黄游游戏分类[cat];
  var cfg = f ? window.黄游获取词条配置(f.type, f.subtype) : null;
  var lines = [];
  if (m) { lines.push('游戏分类：' + m.label); if (m.desc) lines.push('分类说明：' + m.desc); }
  if (cfg) { lines.push('游戏类型：' + cfg.label); if (cfg.styleDesc) lines.push('类型说明：' + cfg.styleDesc); }
  if (f && f.name) lines.push('游戏名称：' + f.name);
  if (f && f.focus) lines.push('游戏定位/主打卖点：' + f.focus);
  if (f && f.description) lines.push('游戏简介：' + f.description);
  var 开发者名 = [];
  if (f && f.refSources && f.refSources.length) { f.refSources.forEach(function(s) { 开发者名.push(typeof s === 'string' ? s : s.name); }); }
  if (开发者名.length) lines.push('开发者：' + 开发者名.join('、'));
  var 角色名 = f && f.refChars ? f.refChars : [];
  if (角色名.length) lines.push('登场角色：' + 角色名.join('、'));
  if (开发者名.length || 角色名.length) lines.push('');
  if (f && f.refSources && f.refSources.length) {
    lines.push('');
    lines.push('【开发者资料】');
    f.refSources.forEach(function(s) {
      var src = typeof s === 'string' ? null : s;
      if (src) { lines.push(JSON.stringify(src, null, 2)); } else { lines.push('- ' + s + '（完整数据不可用）'); }
    });
  }
  return lines.join('\n');
}

function 黄游加载角色身份(角色名列表) {
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
  // 游戏生成输入：用户要求 + 分类/类型/名称/开发者/角色等上下文（{text} 变量）
  // 模板开头已有「【用户要求】」，这里不再重复标签，只堆内容。
  window.构建游戏生成上下文 = function() {
    var req = (document.getElementById('hybzProgramReq') ? document.getElementById('hybzProgramReq').value.trim() : '');
    var ctx = 构建游戏上下文基础();
    if (req) ctx = req + '\n\n' + ctx;
    return ctx;
  };
  // 单一 AI 生成入口：生成 名称/定位/简介/售价/版本/DLC/配图/卖点 并整体回填
  registerAiField('hybz_program_req', '游戏信息', function() {
    return { user: 构建游戏生成上下文(), system: '', schema: (typeof window.黄游游戏补全Schema !== 'undefined' ? window.黄游游戏补全Schema : '') };
  }, { suggestPrompt: 'hybz_program_gen_all', fillFn: function(d) {
    if (!d) { toast('AI 返回为空，请重试'); return; }
    var f = window.黄游规划游戏表单;
    var setEl = function(id, v) { var el = document.getElementById(id); if (el && v != null) el.value = v; };
    if (!f) return;
    if (d.name) { f.name = d.name; setEl('hybz_program_name', d.name); }
    if (d.focus) { f.focus = d.focus; setEl('hybz_program_focus', d.focus); }
    if (d.description) { f.description = d.description; setEl('hybzProgramDesc', d.description); 黄游游戏简介缓存 = d.description; }
    ['studio', 'releaseDate', 'platform', 'price', 'publisher', 'versions', 'dlc', 'sells', 'media'].forEach(function(k) { if (d[k]) f[k] = d[k]; });
    var resBox = document.getElementById('yyGenResult');
    if (resBox) {
      var inner = resBox.querySelector('div');
      if (inner) inner.innerHTML = '<b>' + escHtml(d.name || '（未命名）') + '</b><br>' +
        (d.focus ? '<span style="color:var(--fg2)">' + escHtml(d.focus) + '</span><br>' : '') +
        (d.description ? escHtml(d.description) : '') +
        (d.price ? '<br><span style="color:var(--fg2)">' + escHtml(d.price) + '</span>' : '');
      resBox.style.display = 'block';
    }
    toast('✅ AI 已生成本作信息，可检查或直接收录');
  } });
})();

function 黄游渲染规划游戏(el) {
  var cat = 黄游当前分类;
  var m = 黄游游戏分类[cat];
  var existing = window.黄游规划游戏表单 || null;
  var 表单 = {
    type: cat,
    name: (existing && existing.name) || '',
    focus: (existing && existing.focus) || '',
    description: (existing && existing.description) || '',
    refSources: (existing && existing.refSources) || [],
    refChars: (existing && existing.refChars) || []
  };
  黄游游戏简介缓存 = 表单.description;
  var 是否编辑 = existing && existing._editing;

  var h = '<div class="n-card">';
  h += '<h3 style="font-size:15px;font-weight:600;margin-bottom:12px">' + m.icon + ' ' + (是否编辑 ? '编辑' : '收录') + m.label + '</h3>';

  var 子类型配置 = 黄游获取子类型配置(cat);
  var 子类型键 = 子类型配置 ? Object.keys(子类型配置) : [];
  if (子类型键.length) {
    h += '<div class="form-group" style="margin-bottom:8px"><label style="font-size:12px;font-weight:500;color:var(--fg2);display:block;margin-bottom:6px">📋 子类型</label>';
    h += '<div id="yySubTypeGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
    子类型键.forEach(function(k) {
      var cfg = 子类型配置[k];
      var act = (表单.subtype || 子类型键[0]) === k;
      h += '<div class="n-card" style="padding:10px;cursor:pointer;border:2px solid ' + (act ? 'var(--accent2)' : 'var(--border)') + ';border-radius:6px" onclick="document.querySelectorAll(\'#yySubTypeGrid .n-card\').forEach(function(c){c.style.borderColor=\'var(--border)\'});this.style.borderColor=\'var(--accent2)\';黄游规划游戏表单.subtype=\'' + k + '\'">';
      h += '<div style="font-size:13px;font-weight:600;color:var(--fg)">' + cfg.icon + ' ' + cfg.label + '</div>';
      h += '<div style="font-size:10px;color:var(--fg2);margin-top:2px">' + (cfg.styleDesc ? cfg.styleDesc.slice(0, 30) + '…' : '') + '</div></div>';
    });
    h += '</div></div>';
    if (!表单.subtype) 表单.subtype = 子类型键[0];
  }

  h += '<div style="display:flex;gap:12px;margin-top:8px">';
  h += '<div style="flex:0 0 260px">';
  h += '<div class="form-group" style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">👨‍💻 开发者</label>';
  h += '<div id="yyPlanSources" style="max-height:100px;overflow-y:auto;display:flex;gap:4px;flex-wrap:wrap;padding:6px;background:var(--bg2);border-radius:6px;border:1px solid var(--border)">';
  h += '<span style="font-size:11px;color:var(--fg3)">加载中...</span></div></div>';
  h += '<div class="form-group"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">👤 登场角色</label>';
  h += '<div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:4px" id="yyPlanGenderTabs">';
  黄游性别键.forEach(function(g) {
    h += '<span class="char-cat-tab" style="flex:1;min-width:46px;padding:3px 4px;text-align:center;font-size:10px;cursor:pointer;border-radius:4px;border:1px solid var(--border);background:var(--bg2)" data-pgender="' + g + '" onclick="window.黄游新建角色性别=\'' + g + '\';document.querySelectorAll(\'#yyPlanGenderTabs .char-cat-tab\').forEach(function(t){t.style.borderColor=\'var(--border)\';t.style.background=\'var(--bg2)\'});this.style.borderColor=\'var(--accent2)\';this.style.background=\'var(--accent-dim)\';window.黄游渲染新建游戏角色列表()">' + 黄游性别图标[g] + ' ' + g + '</span>';
  });
  h += '</div>';
  h += '<div id="yyPlanChars" style="max-height:260px;overflow-y:auto;padding:4px;background:var(--bg2);border-radius:6px;border:1px solid var(--border)">';
  h += '<span style="font-size:11px;color:var(--fg3)">加载中...</span></div></div>';
  h += '</div>';

  h += '<div style="flex:1;min-width:0">';
  h += '<div class="form-group"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">📌 你的要求</label>';
  h += '<div style="display:flex;gap:6px"><textarea class="llm-input" id="hybzProgramReq" style="flex:1;min-height:120px;resize:vertical" placeholder="在这里描述你的要求，如：露出题材、学生会会长、夜晚的危险车站… 点击右上 🤖 按这些要求生成完整游戏档案（名称/定位/简介/售价/版本/DLC/配图/卖点）。左侧可同时选好开发者和角色。"></textarea>';
  h += '<button class="ai-suggest-btn" onclick="generateAiDirectNow(\'hybz_program_req\')" title="AI 生成游戏信息" style="align-self:flex-start;margin-top:0">🤖</button></div></div>';
  h += '<div id="yyGenResult" class="form-group" style="margin-top:10px;display:none"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">✅ 生成结果</label><div style="font-size:11px;color:var(--fg);line-height:1.7;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:8px"></div></div>';
  // 隐藏回填字段：保证 保存/编辑 逻辑与旧版一致（生成后自动写入；编辑旧作时保留原有值）
  h += '<input type="hidden" id="hybz_program_name" value="' + escHtml(表单.name || '') + '">';
  h += '<input type="hidden" id="hybz_program_focus" value="' + escHtml(表单.focus || '') + '">';
  h += '<textarea id="hybzProgramDesc" style="display:none">' + escHtml(黄游游戏简介缓存) + '</textarea>';
  h += '<div style="margin-top:14px"><button class="btn-main" onclick="黄游保存游戏配置()" style="width:100%;padding:10px;font-size:13px">' + (是否编辑 ? '💾 保存修改' : '💾 收录游戏') + '</button>';
  h += '<div style="font-size:11px;color:var(--fg3);margin-top:8px">未填名称/定位/简介时，收录会自动补全；也可点右上 🤖 按你的要求一次性生成。收录后 → 详情页「⚡ 生成词条」；底部可「🤖 AI 生成评测」。</div></div>';
  h += '</div>';
  h += '</div>';
  h += '</div>';
  el.innerHTML = h;

  window.黄游规划游戏表单 = 表单;

  黄游新建来源缓存 = [];
  黄游加载开发者().then(function(sources) {
    黄游新建来源缓存 = sources || [];
    var pool = document.getElementById('yyPlanSources');
    if (!pool) return;
    if (!sources.length) { pool.innerHTML = '<span style="font-size:11px;color:var(--fg3)">暂无开发者</span>'; return; }
    pool.innerHTML = sources.map(function(s, i) {
      var 已选 = 表单.refSources.some(function(r) { return typeof r === 'string' ? r === s.name : r === s; });
      return '<span class="tag-chip' + (已选 ? ' tag-active' : '') + '" data-idx="' + i + '" onclick="var f=window.黄游规划游戏表单;var s=黄游新建来源缓存[this.getAttribute(\'data-idx\')];if(!s)return;var sn=s.name||\'\';var idx=f.refSources.findIndex(function(r){return typeof r===\'string\'?r===sn:r===s;});if(idx>=0){f.refSources.splice(idx,1);this.classList.remove(\'tag-active\')}else{f.refSources.push(s);this.classList.add(\'tag-active\')}" style="cursor:pointer">' + escHtml(s.name || '') + '</span>';
    }).join('');
  });

  黄游新建角色缓存 = [];
  window.黄游新建角色按性别 = { '女性': [], '男性': [], '扶她': [], '伪娘': [] };
  window.黄游新建角色性别 = '女性';
  var pGenderMap = { 'female': '女性', 'male': '男性', 'femboy': '伪娘', 'futa': '扶她', 'beast': '男性' };
  Store.character.list().then(function(items) {
    黄游新建角色缓存 = items || [];
    黄游新建角色缓存.forEach(function(c) {
      var bi = c.identity && c.identity.basicInfo || {};
      var cg = pGenderMap[bi.gender] || bi.gender;
      if (window.黄游新建角色按性别[cg]) window.黄游新建角色按性别[cg].push(c);
    });
    var tabs = document.querySelectorAll('#yyPlanGenderTabs .char-cat-tab');
    if (tabs.length) { tabs[0].style.borderColor = 'var(--accent2)'; tabs[0].style.background = 'var(--accent-dim)'; }
    window.黄游渲染新建游戏角色列表();
  });
}

window.黄游渲染新建游戏角色列表 = function() {
  var pool = document.getElementById('yyPlanChars');
  if (!pool) return;
  var gender = window.黄游新建角色性别 || '女性';
  var items = window.黄游新建角色按性别[gender] || [];
  var f = window.黄游规划游戏表单;
  pool.innerHTML = items.map(function(c) {
    var bi = (c.identity && c.identity.basicInfo) || {};
    var name = bi.name || c.title || '';
    if (!name) return '';
    var 已选 = f && f.refChars && f.refChars.indexOf(name) >= 0;
    var age = bi.age || '';
    var title = bi.title || '';
    var cardStyle = 'cursor:pointer;margin-bottom:4px;padding:8px;border-radius:6px;border:2px solid ' + (已选 ? 'var(--accent2)' : 'var(--border)') + ';background:var(--bg);border-left:3px solid ' + (已选 ? 'var(--accent2)' : 'transparent') + ';transition:all 0.1s';
    return '<div class="n-card" style="' + cardStyle + '" data-pname="' + escHtml(name) + '" onclick="var n=this.getAttribute(\'data-pname\');if(!n)return;var f=window.黄游规划游戏表单;if(!f)return;var p=f.refChars.indexOf(n);if(p>=0){f.refChars.splice(p,1);this.style.borderColor=\'var(--border)\';this.style.borderLeftColor=\'transparent\'}else{f.refChars.push(n);Store.character.get(n).then(function(d){if(d)黄游角色完整缓存[n]=d;});this.style.borderColor=\'var(--accent2)\';this.style.borderLeftColor=\'var(--accent2)\'}">' +
      '<div class="fw-600 fs-13" style="color:var(--fg)">' + escHtml(name) + (age ? ' <span class="text-muted" style="font-weight:400;font-size:11px;color:var(--fg2)">' + age + '岁</span>' : '') + '</div>' +
      (title ? '<div class="text-muted text-sm" style="font-size:11px;color:var(--fg2);margin-top:2px">' + escHtml(title) + '</div>' : '') +
    '</div>';
  }).join('');
  if (!pool.innerHTML) pool.innerHTML = '<div style="padding:12px;text-align:center;font-size:11px;color:var(--fg3)">暂无此性别角色</div>';
};

window.黄游保存游戏配置 = function() {
  var cat = 黄游当前分类;
  var f = window.黄游规划游戏表单;
  var nameEl = document.getElementById('hybz_program_name');
  if (nameEl) f.name = nameEl.value.trim();
  var focusEl = document.getElementById('hybz_program_focus');
  if (focusEl) f.focus = focusEl.value.trim();
  var descEl = document.getElementById('hybzProgramDesc');
  if (descEl) f.description = descEl.value.trim();

  if (f.name && f.focus && f.description && !f._editing) { return 黄游保存游戏直接(f); }
  if (f._editing && f.name && f.focus && f.description) { return 黄游保存游戏直接(f); }

  toast('🔄 正在智能补全游戏信息...');
  黄游加载角色身份(f.refChars || []).then(function(角色上下文) {
    var ctx = 构建游戏生成上下文();
    if (角色上下文) ctx += '\n【登场角色】\n' + 角色上下文;
    var rendered = renderPrompt('hybz_program_gen_all', { text: ctx, schema: (typeof window.黄游游戏补全Schema !== 'undefined' ? window.黄游游戏补全Schema : '') });
    LLM.callJSON({ prompt: rendered.user, system: rendered.system, label: '游戏补全', temperature: 0.85 }).then(function(data) {
      if (!data) { toast('生成失败'); return; }
      if (!f.name && data.name) { f.name = data.name; if (nameEl) nameEl.value = data.name; }
      if (!f.focus && data.focus) { f.focus = data.focus; if (focusEl) focusEl.value = data.focus; }
      if (!f.description && data.description) { f.description = data.description; if (descEl) descEl.value = data.description; 黄游游戏简介缓存 = data.description; }
      ['studio', 'releaseDate', 'platform', 'price', 'publisher', 'versions', 'dlc', 'sells', 'media'].forEach(function(k) { if (data[k]) f[k] = data[k]; });
      if (!f.name) { toast('AI 未能生成游戏名称，请手动填写'); return; }
      return 黄游保存游戏直接(f);
    }).catch(function(err) { toast('AI 补全失败: ' + err.message); });
  });
};

function 黄游保存游戏直接(f) {
  var cat = 黄游当前分类;
  var info = { name: f.name, type: f.type, subtype: f.subtype || '', focus: f.focus || '', description: f.description || '', studio: f.studio || '', releaseDate: f.releaseDate || '', platform: f.platform || '', price: f.price || '', publisher: f.publisher || '', refSourceNames: f.refSources.map(function(s){return s.name;}), refChars: f.refChars, createdAt: Date.now() };
  // 三档售价（原版/豪华版/完整版）：AI 可能输出对象，标准化为数组；无则留空由渲染时推导
  var versions = f.versions;
  if (versions && !Array.isArray(versions) && typeof versions === 'object') {
    versions = ['原版', '豪华版', '完整版'].map(function(l) { return { label: l, price: versions[l] || '' }; }).filter(function(v) { return v.price; });
  }
  if (versions && versions.length) info.versions = versions;
  var saveTask;
  if (f._editing && f._editName && f._editName !== f.name) {
    saveTask = 黄游删除游戏(cat, f._editName).then(function() { return 黄游保存游戏(cat, f.name, info); });
  } else { saveTask = 黄游保存游戏(cat, f.name, info); }
  return saveTask.then(function() {
    // 为本作创建议好的 DLC 子目录（每个 DLC 可独立生成内容/进入详情）
    var dlcList = f.dlc || [];
    if (dlcList.length) {
      var saves = dlcList.map(function(d) {
        var saveDlc = 黄游保存DLC(cat, f.name, d.name, { name: d.name, dlcType: d.dlcType || '', 豪华特典: (d.name === '豪华版特典' || d.豪华特典), type: f.type, subtype: f.subtype || '', focus: d.focus || '', description: d.description || '', price: d.price || '', studio: info.studio || '', releaseDate: info.releaseDate || '', platform: info.platform || 'PC', publisher: info.publisher || '', 配图: d.配图 || [], 新增内容: d.新增内容 || [], createdAt: Date.now() });
        // 把 配图→顶部媒体(media) + 关于此DLC 卖点块(sells) 存进该 DLC 自己的 内容.json
        if (d.配图 || d.sells) {
          saveDlc = saveDlc.then(function() {
            var content = {};
            if (d.配图 && d.配图.length) content.media = d.配图.map(function(x) { return { label: x.title || '', desc: x.content || '' }; });
            if (d.sells && d.sells.length) content.sells = d.sells;
            return 黄游保存DLC版块(cat, f.name, d.name, '内容', content);
          });
        }
        return saveDlc;
      });
      return Promise.all(saves);
    }
  }).then(function() {
    // 保存「关于此游戏」营销卖点块 + 配图/截图（合并进 内容.json）
    if ((f.sells && f.sells.length) || (f.media && f.media.length)) {
      return 黄游加载游戏内容(cat, f.name).then(function(data) {
        if (f.sells && f.sells.length) data.sells = f.sells;
        if (f.media && f.media.length) data.media = f.media;
        return 黄游保存游戏内容(cat, f.name, data);
      });
    }
  }).then(function() {
    toast(f._editing ? '✅ 游戏已更新' : '✅ 游戏已收录');
    黄游当前游戏 = null;
    window.黄游规划游戏表单 = null;
    黄游切换标签('list');
  });
}

window.黄游渲染规划 = 黄游渲染规划;
