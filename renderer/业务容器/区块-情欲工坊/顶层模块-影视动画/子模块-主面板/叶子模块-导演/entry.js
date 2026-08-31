// 影视动画 · 🎬 导演
var 影视导演数据 = [];
var 影视导演当前对象 = null;

function 影视渲染导演(el) {
  el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--fg2)">加载中...</div>';
  影视加载来源(影视当前类型).then(function(items) {
    影视导演数据 = items || [];
    var h = '';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">';
    h += '<span style="font-size:13px;font-weight:600;color:var(--fg)">🎬 导演（' + 影视导演数据.length + '）</span>';
    h += '<div style="display:flex;gap:6px"><button class="btn-new" onclick="影视导演新建()">＋ 新建</button>';
    h += '<button class="btn-import" onclick="影视导演导入角色()">📥 导入角色</button></div></div>';
    if (!影视导演数据.length) {
      h += '<div class="placeholder-text" style="padding:30px;text-align:center">暂无导演</div>';
    } else {
      影视导演数据.forEach(function(s, i) {
        var realIdx = 影视导演数据.indexOf(s);
        h += '<div class="n-card" style="margin-bottom:8px;padding:12px">';
        h += '<div style="display:flex;justify-content:space-between;align-items:flex-start">';
        h += '<div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--fg)">' + escHtml(s.name || '未命名') + '</div>';
        if (s.preferredGender) h += '<span style="font-size:10px;padding:1px 8px;border-radius:3px;background:var(--accent-dim);color:var(--accent2);margin-top:2px;display:inline-block">偏好 ' + escHtml(s.preferredGender) + '</span>';
        if (s.bio) h += '<div style="font-size:11px;color:var(--fg2);margin-top:6px;line-height:1.6;padding:6px 8px;background:var(--bg1);border-radius:4px;border-left:2px solid var(--border)">' + escHtml(s.bio.slice(0, 120)) + (s.bio.length > 120 ? '…' : '') + '</div>';
        if (s.style) h += '<div style="font-size:10px;color:var(--fg);margin-top:4px;padding:3px 8px;background:var(--bg2);border-radius:4px"><span style="color:var(--fg3);font-weight:500">导演风格</span> ' + escHtml(s.style) + '</div>';
        var tagFields = [];
        if (s.genre) tagFields.push({ icon: '🎯', label: '擅长题材', val: s.genre });
        if (s.method) tagFields.push({ icon: '🔍', label: '执导方式', val: s.method });
        if (s.complaint) tagFields.push({ icon: '⚠️', label: '争议', val: s.complaint });
        if (tagFields.length) {
          h += '<div style="margin-top:6px;display:flex;flex-direction:column;gap:3px">';
          tagFields.forEach(function(f) {
            h += '<div style="font-size:10px;color:var(--fg2);padding:3px 8px;background:var(--bg1);border-radius:4px;display:flex;gap:6px">';
            h += '<span style="color:var(--accent2);font-weight:600;white-space:nowrap;flex-shrink:0">' + f.icon + ' ' + f.label + '</span>';
            h += '<span style="color:var(--fg);line-height:1.5">' + escHtml(f.val) + '</span></div>';
          });
          h += '</div>';
        }
        if (s.fetishes && Array.isArray(s.fetishes) && s.fetishes.length) h += '<div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:4px;padding-top:4px;border-top:1px solid var(--border)">' + s.fetishes.map(function(t) { return '<span style="font-size:9px;padding:1px 6px;border-radius:3px;background:var(--bg3);color:var(--fg3)">' + escHtml(t) + '</span>'; }).join('') + '</div>';
        h += '</div><div style="display:flex;gap:4px;flex-shrink:0;margin-left:8px">';
        h += '<button class="btn-sm" style="padding:2px 8px;font-size:10px;background:none;border:none;color:var(--fg2);cursor:pointer" onclick="影视导演编辑(' + realIdx + ')">✏</button>';
        h += '<button class="btn-sm" style="padding:2px 8px;font-size:10px;background:none;border:none;color:var(--error);cursor:pointer" onclick="影视导演删除(' + realIdx + ')">✕</button>';
        h += '</div></div></div>';
      });
    }
    el.innerHTML = h;
  });
}

function 影视导演保存() {
  var mk = 影视当前类型;
  影视导演数据.forEach(function(s) {
    if (!s._fileName) s._fileName = LocalFS.sanitize(s.name || '未命名') + '.json';
    影视保存来源(mk, s);
  });
}

function 影视导演字段定义() {
  var long = '不少于50字';
  return {
    name: { label: '姓名', type: 'text', ph: '导演姓名' },
    gender: { label: '性别', type: 'select', options: ['男性','女性','扶她','伪娘'] },
    bio: { label: '简介', type: 'textarea', ph: '情色影视导演经历、代表作品（' + long + '）' },
    style: { label: '导演风格', type: 'textarea', ph: '情色画面的拍摄风格和审美倾向（' + long + '）' },
    genre: { label: '擅长题材', type: 'textarea', ph: '最擅长的情色题材类型（' + long + '）' },
    method: { label: '执导方式', type: 'textarea', ph: '在现场如何调教演员和控制情色尺度（' + long + '）' },
    complaint: { label: '争议', type: 'textarea', ph: '因拍摄内容或对待演员方式引发的争议（' + long + '）' },
    preferredGender: { label: '对手偏好', type: 'select', options: ['男性','女性','扶她','伪娘'] },
    fetishes: { label: '性癖', type: 'chips', chips: ['绿帽','轮奸','调教','露出','偷窥','群交','sm','催眠','纯爱','ntr'] },
  };
}

function 影视导演模板() {
  var fields = 影视导演字段定义();
  var obj = {};
  Object.keys(fields).forEach(function(k) { obj[k] = fields[k].type === 'chips' ? [] : ''; });
  obj.gender = '男性';
  obj.preferredGender = '女性';
  return obj;
}

window.影视导演新建 = function() {
  var obj = 影视导演模板();
  影视导演数据.push(obj);
  影视导演当前对象 = obj;
  影视导演打开弹窗('➕ 新建', obj, true);
};

window.影视导演编辑 = function(idx) {
  var obj = 影视导演数据[idx];
  if (!obj) return;
  影视导演当前对象 = obj;
  影视导演打开弹窗('✏️ 编辑导演', obj, false);
};

function 影视导演打开弹窗(title, obj, isNew) {
  var fields = 影视导演字段定义();
  var h = '<div class="mcard" style="max-width:560px;width:92vw">';
  h += '<h3 style="font-size:14px;margin-bottom:10px">🎬 ' + title + '</h3>';
  Object.keys(fields).forEach(function(k) {
    var f = fields[k]; var val = obj[k] || '';
    if (f.type === 'select') {
      h += '<div class="form-group"><label>' + f.label + '</label><select class="llm-input llm-select" id="ysdy_' + k + '" style="width:100%">';
      f.options.forEach(function(o) { h += '<option value="' + o + '"' + (val === o ? ' selected' : '') + '>' + o + '</option>'; });
      h += '</select></div>';
    } else if (f.type === 'chips') {
      h += '<div class="form-group"><label>' + f.label + '</label>';
      h += '<div id="ysdy_' + k + '_chips" style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:4px">';
      (f.chips || []).forEach(function(c) {
        var active = (val || []).indexOf(c) >= 0;
        h += '<span class="tag-chip' + (active ? ' tag-active' : '') + '" style="font-size:10px;cursor:pointer" onclick="影视导演切换芯片(\'' + k + '\',this,\'' + c + '\')">' + c + '</span>';
      });
      h += '</div><input class="llm-input" style="width:100%;font-size:11px" placeholder="输入自定义项，回车添加" onkeydown="if(event.key===\'Enter\'){影视导演添加芯片(\'' + k + '\',this.value);this.value=\'\';event.preventDefault()}">';
      h += '</div>';
    } else if (f.type === 'textarea') {
      h += '<div class="form-group"><label>' + f.label + '</label><textarea class="llm-input" id="ysdy_' + k + '" style="width:100%;min-height:60px;resize:vertical" placeholder="' + f.ph + '">' + escHtml(val) + '</textarea></div>';
    } else {
      h += '<div class="form-group"><label>' + f.label + '</label><input class="llm-input" id="ysdy_' + k + '" style="width:100%" value="' + escHtml(val) + '" placeholder="' + f.ph + '"></div>';
    }
  });
  h += '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:10px">';
  h += '<button class="btn-out" onclick="影视导演AI生成()" style="font-size:11px;padding:4px 14px">🤖 AI 生成</button>';
  h += '<button class="btn-sm" style="background:transparent;color:var(--fg2);border:1px solid var(--border)" onclick="this.closest(\'.ovl\').remove()">关闭</button></div></div>';
  var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  var fieldsKeys = Object.keys(fields);
  ov.querySelectorAll('input, textarea, select').forEach(function(el) {
    el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function() {
      var key = this.id.replace('ysdy_', '');
      if (fieldsKeys.indexOf(key) < 0) return;
      obj[key] = this.value;
      if (isNew) 影视导演当前对象 = obj;
      影视导演保存();
    });
  });
}

window.影视导演切换芯片 = function(field, el, val) {
  if (!影视导演当前对象) return;
  if (!影视导演当前对象[field]) 影视导演当前对象[field] = [];
  var arr = 影视导演当前对象[field];
  var idx = arr.indexOf(val);
  if (idx >= 0) { arr.splice(idx, 1); el.classList.remove('tag-active'); }
  else { arr.push(val); el.classList.add('tag-active'); }
  影视导演保存();
};

window.影视导演添加芯片 = function(field, val) {
  val = val.trim(); if (!val) return;
  if (!影视导演当前对象) return;
  if (!影视导演当前对象[field]) 影视导演当前对象[field] = [];
  if (影视导演当前对象[field].indexOf(val) < 0) 影视导演当前对象[field].push(val);
  var container = document.getElementById('ysdy_' + field + '_chips');
  if (container) {
    var sp = document.createElement('span'); sp.className = 'tag-chip tag-active';
    sp.style.cssText = 'font-size:10px;cursor:pointer'; sp.textContent = val;
    sp.onclick = function() { 影视导演切换芯片(field, sp, val); };
    container.appendChild(sp);
  }
  影视导演保存();
};

window.影视导演AI生成 = function() {
  var h = '<div class="mcard" style="max-width:500px;width:90vw"><h3 style="font-size:14px;margin-bottom:10px">🤖 AI 生成导演</h3>';
  h += '<div style="margin-bottom:8px;font-size:11px;color:var(--fg2)">选择方向或自定义要求</div><div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">';
  var dirs = ['情色电影','AV监督','艺术情色','BDSM题材','浪漫情色'];
  dirs.forEach(function(v) { h += '<span class="tag-chip" style="font-size:10px;cursor:pointer" onclick="影视导演切换AI方向(this,\'' + v + '\')">' + v + '</span>'; });
  h += '</div><div class="form-group"><textarea class="llm-input" id="影视导演AI自定义" style="width:100%;min-height:50px;resize:vertical;font-size:12px" placeholder="补充具体要求…"></textarea></div>';
  h += '<div style="display:flex;gap:6px;justify-content:flex-end"><button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button><button class="btn-main" onclick="影视导演执行AI生成()">🎯 生成</button></div></div>';
  var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  window._影视导演AI方向 = [];
};

window.影视导演切换AI方向 = function(el, val) {
  var a = window._影视导演AI方向 || [];
  var i = a.indexOf(val);
  if (i >= 0) { a.splice(i,1); el.classList.remove('tag-active'); }
  else { a.push(val); el.classList.add('tag-active'); }
  window._影视导演AI方向 = a;
};

window.影视导演执行AI生成 = function() {
  var dirs = window._影视导演AI方向 || [];
  var custom = (document.getElementById('影视导演AI自定义') || {}).value || '';
  var ctx = [];
  if (dirs.length) ctx.push('【方向】' + dirs.join('、'));
  if (custom) ctx.push('【要求】' + custom);
  var sys = '你是一名影视行业专家。根据要求生成情色导演的完整资料。';
  var fieldLines = '- name：姓名\n- bio：简介\n- style：导演风格\n- preferredGender：对手偏好（男性/女性/扶她/伪娘，从这些中选择一个）\n- genre：擅长题材\n- method：执导方式\n- complaint：争议\n- fetishes：性癖数组\n\n所有字段内容不少于50字';
  var prompt = '请生成一个情色导演。\n' + ctx.join('\n') + '\n\n字段说明：\n' + fieldLines + '\n\n输出JSON格式：' + JSON.stringify(影视导演模板());
  toast('🤖 生成中...');
  LLM.callJSON({ prompt: prompt, system: sys, label: '导演AI生成', temperature: 0.85 }).then(function(d) {
    if (!d) { toast('生成失败'); return; }
    if (!d.name) d.name = '未命名';
    if (!d.preferredGender) d.preferredGender = '不限';
    if (影视导演当前对象) {
      var fields = 影视导演字段定义();
      Object.keys(fields).forEach(function(k) { if (d[k] !== undefined && d[k] !== null) 影视导演当前对象[k] = d[k]; });
      影视导演保存();
      toast('✅ 已生成');
      document.querySelectorAll('.ovl').forEach(function(o) { if (o.querySelector('.mcard')) o.remove(); });
      影视渲染导演(document.getElementById('ysContentView'));
    }
  }).catch(function(err) { toast('❌ ' + err.message); });
};

window.影视导演删除 = function(idx) {
  confirmDialog('确定删除？', function() {
    var s = 影视导演数据[idx];
    if (s && s._fileName) 影视删除来源文件(影视当前类型, s);
    影视导演数据.splice(idx, 1);
    影视渲染导演(document.getElementById('ysContentView'));
  });
};

window.影视导演导入角色 = function() {
  stcdOpenCharPicker('', {
    onPick: function(data) {
      if (!data) { toast('未能识别所选角色'); return; }
      if (data.versions) { 影视导演确认导入灵感角色(data); }
      else {
        var key = data._dirName || data.title;
        if (key) 影视导演确认导入角色(key);
        else if (data.name) 影视导演确认导入角色(data.name);
        else toast('未能识别所选角色');
      }
    }
  });
};

window.影视导演确认导入灵感角色 = function(insp) {
  document.querySelectorAll('.ovl').forEach(function(o) { if (o.querySelector('.mcard')) o.remove(); });
  var json = (typeof window.灵感角色全部 === 'function') ? window.灵感角色全部(insp, 'deep') : '';
  if (!json) { toast('灵感角色数据为空'); return; }
  var 名字 = (insp && (insp.name || (insp.versions && insp.versions.deep && insp.versions.deep.name))) || '未命名';
  var sys = '你是一名情色行业专家。根据灵感角色数据生成导演的完整资料。preferredGender是ta擅长绘制角色的性别取向，不等于ta本人的gender。';
  var fieldLines = '- name：姓名\n- bio：简介\n- style：导演风格\n- preferredGender：对手偏好（男性/女性/扶她/伪娘）\n- genre：擅长题材\n- method：执导方式\n- complaint：争议\n- fetishes：性癖数组\n\n所有字段内容不少于50字';
  var prompt = '基于以下灵感角色数据生成导演资料：\n' + json + '\n\n字段说明：\n' + fieldLines + '\n\n输出JSON格式：' + JSON.stringify(影视导演模板());
  toast('🤖 正在从灵感角色生成...');
  LLM.callJSON({ prompt: prompt, system: sys, label: '影视导演-灵感角色导入', temperature: 0.85 }).then(function(d) {
    if (!d) { toast('生成失败'); return; }
    if (!d.name) d.name = 名字;
    if (!d.gender) d.gender = '';
    if (!d.preferredGender) d.preferredGender = '女性';
    var 角色性别映射 = { male:'男性', female:'女性', femboy:'伪娘', futa:'扶她' };
    var 卡性别 = (insp && insp.versions && insp.versions.deep && insp.versions.deep.gender) || '';
    if (角色性别映射[卡性别]) d.gender = 角色性别映射[卡性别];
    else if (['男性','女性','扶她','伪娘'].indexOf(卡性别) >= 0) d.gender = 卡性别;
    影视导演数据.push(d); 影视导演保存(); toast('✅ 已导入: ' + d.name); 影视渲染导演(document.getElementById('ysContentView'));
  }).catch(function(err) { toast('❌ ' + err.message); });
};

window.影视导演导入角色列表 = function(genderFilter) {
  影视导演导入角色();
};

window.影视导演导入角色列表 = function(genderFilter) {
  Store.character.list().then(function(items) {
    var gm = {female:'女性',male:'男性',femboy:'伪娘',futa:'扶她'};
    var h = '<div class="mcard" style="max-width:500px;max-height:500px;overflow-y:auto"><h3 style="font-size:14px;margin-bottom:10px">📂 选择 ' + genderFilter + ' 角色</h3><div class="text-muted text-sm mb-8">选择角色后 AI 自动生成导演资料</div>';
    if (!items || !items.length) { h += '<div class="placeholder-text">暂无角色卡数据</div>'; }
    else {
      items.forEach(function(c) {
        var bi = c.identity && c.identity.basicInfo || {};
        var cg = gm[bi.gender] || bi.gender;
        if (cg !== genderFilter) return;
        h += '<div class="n-card" style="cursor:pointer;margin-bottom:4px;padding:8px" onclick="影视导演确认导入角色(\'' + escHtml(bi.name || c.title || '') + '\')">';
        h += '<div class="fw-600 fs-13">' + escHtml(bi.name || c.title || '未命名') + (bi.age ? ' <span class="text-muted" style="font-weight:400;font-size:11px">' + bi.age + '岁</span>' : '') + '</div>';
        h += (bi.title ? '<div class="text-muted text-sm" style="font-size:11px;color:var(--fg2);margin-top:2px">' + escHtml(bi.title) + '</div>' : '');
        h += '</div>';
      });
    }
    h += '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:8px"><button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button></div></div>';
    var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = h;
    document.body.appendChild(ov); ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  });
};

window.影视导演确认导入角色 = function(charName) {
  Store.character.get(charName).then(function(data) {
    if (!data) { toast('角色数据不存在'); return; }
    document.querySelectorAll('.ovl').forEach(function(o) { if (o.querySelector('.mcard')) o.remove(); });
    var sys = '你是一名影视行业专家。根据角色卡数据生成情色导演的完整资料。';
    var fieldLines = '- name：姓名\n- bio：简介\n- style：导演风格\n- preferredGender：对手偏好（男性/女性/扶她/伪娘）\n- genre：擅长题材\n- method：执导方式\n- complaint：争议\n- fetishes：性癖数组\n\n所有字段内容不少于50字';
    var prompt = '基于以下角色卡数据生成导演资料：\n' + ((typeof window.角色卡身份与外貌 === 'function') ? window.角色卡身份与外貌(data) : JSON.stringify(data, null, 2)) + '\n\n字段说明：\n' + fieldLines + '\n\n输出JSON格式：' + JSON.stringify(影视导演模板());
    toast('🤖 正在从角色卡生成...');
    LLM.callJSON({ prompt: prompt, system: sys, label: '导演-角色导入', temperature: 0.85 }).then(function(d) {
      if (!d) { toast('生成失败'); return; }
      if (!d.name) d.name = (data.identity && data.identity.basicInfo && data.identity.basicInfo.name) || charName;
      if (!d.gender) d.gender = '';
      if (!d.preferredGender) d.preferredGender = '女性';
      var 角色性别映射 = { male:'男性', female:'女性', femboy:'伪娘', futa:'扶她' };
      var 卡性别 = (data.identity && data.identity.basicInfo && data.identity.basicInfo.gender) || '';
      if (角色性别映射[卡性别]) d.gender = 角色性别映射[卡性别];
      else if (['男性','女性','扶她','伪娘'].indexOf(卡性别) >= 0) d.gender = 卡性别;
      影视导演数据.push(d);
      影视导演保存();
      toast('✅ 已导入: ' + d.name);
      影视渲染导演(document.getElementById('ysContentView'));
    }).catch(function(err) { toast('❌ ' + err.message); });
  });
};

window.影视渲染导演 = 影视渲染导演;
