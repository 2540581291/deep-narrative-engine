// 黄游拔作 · 👨‍💻 开发者
var 黄游开发者数据 = [];
var 黄游开发者当前对象 = null;

function 黄游渲染开发者(el) {
  el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--fg2)">加载中...</div>';
  黄游加载开发者().then(function(items) {
    黄游开发者数据 = items || [];
    var h = '';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">';
    h += '<span style="font-size:13px;font-weight:600;color:var(--fg)">👨‍💻 开发者（' + 黄游开发者数据.length + '）</span>';
    h += '<div style="display:flex;gap:6px"><button class="btn-new" onclick="黄游开发者新建()">＋ 新建</button>';
    h += '<button class="btn-import" onclick="黄游开发者导入角色()">📥 导入角色</button></div></div>';
    if (!黄游开发者数据.length) {
      h += '<div class="placeholder-text" style="padding:30px;text-align:center">暂无开发者</div>';
    } else {
      黄游开发者数据.forEach(function(s, i) {
        var realIdx = 黄游开发者数据.indexOf(s);
        h += '<div class="n-card" style="margin-bottom:8px;padding:12px">';
        h += '<div style="display:flex;justify-content:space-between;align-items:flex-start">';
        h += '<div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--fg)">' + escHtml(s.name || '未命名') + '</div>';
        var types = Array.isArray(s.type) ? s.type : (s.type ? [s.type] : []);
        if (types.length) h += '<div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:2px">' + types.map(function(t) { return '<span style="font-size:10px;padding:1px 8px;border-radius:3px;background:var(--accent-dim);color:var(--accent2);display:inline-block">' + escHtml(t) + '</span>'; }).join('') + '</div>';
        if (s.founded) h += '<div style="font-size:10px;color:var(--fg3);margin-top:3px">成立于 ' + escHtml(s.founded) + '</div>';
        if (s.bio) h += '<div style="font-size:11px;color:var(--fg2);margin-top:6px;line-height:1.6;padding:6px 8px;background:var(--bg1);border-radius:4px;border-left:2px solid var(--border)">' + escHtml(s.bio.slice(0, 120)) + (s.bio.length > 120 ? '…' : '') + '</div>';
        if (s.style) h += '<div style="font-size:10px;color:var(--fg);margin-top:4px;padding:3px 8px;background:var(--bg2);border-radius:4px"><span style="color:var(--fg3);font-weight:500">社风</span> ' + escHtml(s.style) + '</div>';
        var tagFields = [];
        if (s.specialty) tagFields.push({ icon: '🎯', label: '擅长题材', val: s.specialty });
        if (s.fame) tagFields.push({ icon: '🏆', label: '代表作品', val: s.fame });
        if (s.artist) tagFields.push({ icon: '✏️', label: '主力画师/编剧', val: s.artist });
        if (s.controversy) tagFields.push({ icon: '⚠️', label: '争议/黑历史', val: s.controversy });
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
        h += '<button class="btn-sm" style="padding:2px 8px;font-size:10px;background:none;border:none;color:var(--fg2);cursor:pointer" onclick="黄游开发者编辑(' + realIdx + ')">✏</button>';
        h += '<button class="btn-sm" style="padding:2px 8px;font-size:10px;background:none;border:none;color:var(--error);cursor:pointer" onclick="黄游开发者删除(' + realIdx + ')">✕</button>';
        h += '</div></div></div>';
      });
    }
    el.innerHTML = h;
  });
}

function 黄游开发者保存() {
  黄游开发者数据.forEach(function(s) {
    if (!s._fileName) s._fileName = LocalFS.sanitize(s.name || '未命名') + '.json';
    黄游保存开发者(s);
  });
}

function 黄游开发者字段定义() {
  var long = '内容充实、具体即可';
  return {
    name: { label: '开发者名 / 社名', type: 'text', ph: '名称须符合所选性质：社团/工作室→工房/社/制作组/工作室名；公司→XX娱乐/株式会社等' },
    type: { label: '性质', type: 'chips', chips: ['个人开发者', '同人社团', '商业会社', '独立工作室', '拔作专业户'] },
    founded: { label: '成立时间', type: 'text', ph: '如 1998 / 2010 年代' },
    bio: { label: '简介 / 创业史', type: 'textarea', ph: '开发者的来历、成名作、发展历程（' + long + '）' },
    style: { label: '招牌风格 / 社风', type: 'textarea', ph: '一贯的创作风格、画面/剧情/拔点的特色（' + long + '）' },
    specialty: { label: '擅长题材', type: 'textarea', ph: '经常创作的题材大类（归纳为通用题材类型，如宫廷/调教/凌辱/权力不对等/多P等，不要照搬具体剧情或具体角色的人生经历细节）（' + long + '）' },
    fame: { label: '代表作品', type: 'textarea', ph: '代表作及其亮点（' + long + '）' },
    artist: { label: '主力画师 / 编剧', type: 'text', ph: '社内核心创作者，如 画师×× / 剧本××' },
    fetishes: { label: '常做性癖 / 题材', type: 'chips', chips: ['绿帽', '轮奸', '调教', '露出', '偷窥', '群交', 'sm', '催眠', '纯爱', 'ntr', '触手', '凌辱'] },
    controversy: { label: '争议 / 黑历史', type: 'textarea', ph: '因内容或行为引发的争议（' + long + '）' },
  };
}

function 黄游开发者模板() {
  var fields = 黄游开发者字段定义();
  var obj = {};
  Object.keys(fields).forEach(function(k) { obj[k] = fields[k].type === 'chips' ? [] : ''; });
  obj.type = ['同人社团'];
  return obj;
}

window.黄游开发者新建 = function() {
  var obj = 黄游开发者模板();
  黄游开发者数据.push(obj);
  黄游开发者当前对象 = obj;
  黄游开发者打开弹窗('➕ 新建', obj, true);
};

window.黄游开发者编辑 = function(idx) {
  var obj = 黄游开发者数据[idx];
  if (!obj) return;
  黄游开发者当前对象 = obj;
  黄游开发者打开弹窗('✏️ 编辑开发者', obj, false);
};

function 黄游开发者打开弹窗(title, obj, isNew) {
  var fields = 黄游开发者字段定义();
  var h = '<div class="mcard" style="max-width:560px;width:92vw">';
  h += '<h3 style="font-size:14px;margin-bottom:10px">👨‍💻 ' + title + '</h3>';
  Object.keys(fields).forEach(function(k) {
    var f = fields[k]; var val = obj[k] || '';
    if (f.type === 'select') {
      h += '<div class="form-group"><label>' + f.label + '</label><select class="llm-input llm-select" id="yykf_' + k + '" style="width:100%">';
      f.options.forEach(function(o) { h += '<option value="' + o + '"' + (val === o ? ' selected' : '') + '>' + o + '</option>'; });
      h += '</select></div>';
    } else if (f.type === 'chips') {
      h += '<div class="form-group"><label>' + f.label + '</label>';
      h += '<div id="yykf_' + k + '_chips" style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:4px">';
      (f.chips || []).forEach(function(c) {
        var active = (val || []).indexOf(c) >= 0;
        h += '<span class="tag-chip' + (active ? ' tag-active' : '') + '" style="font-size:10px;cursor:pointer" onclick="黄游开发者切换芯片(\'' + k + '\',this,\'' + c + '\')">' + c + '</span>';
      });
      h += '</div><input class="llm-input" style="width:100%;font-size:11px" placeholder="输入自定义项，回车添加" onkeydown="if(event.key===\'Enter\'){黄游开发者添加芯片(\'' + k + '\',this.value);this.value=\'\';event.preventDefault()}">';
      h += '</div>';
    } else if (f.type === 'textarea') {
      h += '<div class="form-group"><label>' + f.label + '</label><textarea class="llm-input" id="yykf_' + k + '" style="width:100%;min-height:60px;resize:vertical" placeholder="' + f.ph + '">' + escHtml(val) + '</textarea></div>';
    } else {
      h += '<div class="form-group"><label>' + f.label + '</label><input class="llm-input" id="yykf_' + k + '" style="width:100%" value="' + escHtml(val) + '" placeholder="' + f.ph + '"></div>';
    }
  });
  h += '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:10px">';
  h += '<button class="btn-out" onclick="黄游开发者AI生成()" style="font-size:11px;padding:4px 14px">🤖 AI 生成</button>';
  h += '<button class="btn-sm" style="background:transparent;color:var(--fg2);border:1px solid var(--border)" onclick="this.closest(\'.ovl\').remove()">关闭</button></div></div>';
  var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  var fieldsKeys = Object.keys(fields);
  ov.querySelectorAll('input, textarea, select').forEach(function(el) {
    el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function() {
      var key = this.id.replace('yykf_', '');
      if (fieldsKeys.indexOf(key) < 0) return;
      if (fields[key].type === 'chips') return;
      obj[key] = this.value;
      if (isNew) 黄游开发者当前对象 = obj;
      黄游开发者保存();
    });
  });
}

window.黄游开发者切换芯片 = function(field, el, val) {
  if (!黄游开发者当前对象) return;
  if (!黄游开发者当前对象[field]) 黄游开发者当前对象[field] = [];
  var arr = 黄游开发者当前对象[field];
  var idx = arr.indexOf(val);
  if (idx >= 0) { arr.splice(idx, 1); el.classList.remove('tag-active'); }
  else { arr.push(val); el.classList.add('tag-active'); }
  黄游开发者保存();
};

window.黄游开发者添加芯片 = function(field, val) {
  val = val.trim(); if (!val) return;
  if (!黄游开发者当前对象) return;
  if (!黄游开发者当前对象[field]) 黄游开发者当前对象[field] = [];
  if (黄游开发者当前对象[field].indexOf(val) < 0) 黄游开发者当前对象[field].push(val);
  var container = document.getElementById('yykf_' + field + '_chips');
  if (container) {
    var sp = document.createElement('span'); sp.className = 'tag-chip tag-active';
    sp.style.cssText = 'font-size:10px;cursor:pointer'; sp.textContent = val;
    sp.onclick = function() { 黄游开发者切换芯片(field, sp, val); };
    container.appendChild(sp);
  }
  黄游开发者保存();
};

// ===== AI 生成 =====
window.黄游开发者AI生成 = function() {
  var h = '<div class="mcard" style="max-width:500px;width:90vw"><h3 style="font-size:14px;margin-bottom:10px">🤖 AI 生成开发者</h3>';
  h += '<div style="margin-bottom:8px;font-size:11px;color:var(--fg2)">选择方向或自定义要求</div><div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">';
  var dirs = ['同人社团', '个人开发者', '商业会社', '独立工作室', '拔作专业户'];
  dirs.forEach(function(v) { h += '<span class="tag-chip" style="font-size:10px;cursor:pointer" onclick="黄游开发者切换AI方向(this,\'' + v + '\')">' + v + '</span>'; });
  h += '</div><div class="form-group"><textarea class="llm-input" id="黄游开发者AI自定义" style="width:100%;min-height:50px;resize:vertical;font-size:12px" placeholder="补充具体要求…"></textarea></div>';
  h += '<div style="display:flex;gap:6px;justify-content:flex-end"><button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button><button class="btn-main" onclick="黄游开发者执行AI生成()">🎯 生成</button></div></div>';
  var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  window._黄游开发者AI方向 = [];
};

window.黄游开发者切换AI方向 = function(el, val) {
  var a = window._黄游开发者AI方向 || [];
  var i = a.indexOf(val);
  if (i >= 0) { a.splice(i, 1); el.classList.remove('tag-active'); }
  else { a.push(val); el.classList.add('tag-active'); }
  window._黄游开发者AI方向 = a;
};

window.黄游开发者执行AI生成 = function() {
  var dirs = window._黄游开发者AI方向 || [];
  var custom = (document.getElementById('黄游开发者AI自定义') || {}).value || '';
  var ctx = [];
  if (dirs.length) ctx.push('【方向】' + dirs.join('、'));
  if (custom) ctx.push('【要求】' + custom);
  var sys = '你是一名黄油产业专家。根据要求生成黄游开发者的完整资料。';
  var fieldLines = '- name：开发者名/社名（须与 type 性质匹配：个人开发者/同人社团/独立工作室→工房、社、制作组、工作室之类的社名；商业会社→XX株式会社/娱乐/互动等公司名；名称要贴合该性质，有圈内味）\n- type：性质（个人开发者/同人社团/商业会社/独立工作室/拔作专业户，可多选，输出数组）\n- founded：成立时间\n- bio：简介/创业史\n- style：招牌风格/社风\n- specialty：擅长题材（总结其经常创作的通用题材大类，如宫廷/虐恋/调教/凌辱/权力不对等/多P/纯爱等；从背景经历中提炼通用类型即可，不要照搬具体剧情或具体角色的具体人生经历细节）\n- fame：代表作品\n- artist：主力画师/编剧\n- fetishes：常做性癖/题材数组\n- controversy：争议/黑历史';
  var prompt = '请生成一个黄游开发者。\n' + ctx.join('\n') + '\n\n字段说明：\n' + fieldLines + '\n\n输出JSON格式：' + JSON.stringify(黄游开发者模板());
  toast('🤖 生成中...');
  LLM.callJSON({ prompt: prompt, system: sys, label: '开发者AI生成', temperature: 0.85 }).then(function(d) {
    if (!d) { toast('生成失败'); return; }
    if (!d.name) d.name = '未命名';
    if (黄游开发者当前对象) {
      var fields = 黄游开发者字段定义();
      Object.keys(fields).forEach(function(k) { if (d[k] !== undefined && d[k] !== null) 黄游开发者当前对象[k] = d[k]; });
      黄游开发者保存();
      toast('✅ 已生成');
      document.querySelectorAll('.ovl').forEach(function(o) { if (o.querySelector('.mcard')) o.remove(); });
      黄游渲染开发者(document.getElementById('yyContentView'));
    }
  }).catch(function(err) { toast('❌ ' + err.message); });
};

// ===== 删除 =====
window.黄游开发者删除 = function(idx) {
  confirmDialog('确定删除？', function() {
  var s = 黄游开发者数据[idx];
  if (s && s._fileName) 黄游删除开发者文件(s);
  黄游开发者数据.splice(idx, 1);
  黄游渲染开发者(document.getElementById('yyContentView'));
  });
};

// ===== 角色卡 / 灵感角色库 导入（统一全局弹窗） =====
window.黄游开发者导入角色 = function() {
  stcdOpenCharPicker('', {
    onPick: function(data) {
      if (!data) { toast('未能识别所选角色'); return; }
      if (data.versions) { 黄游开发者确认导入灵感角色(data); }
      else {
        var key = data._dirName || data.title;
        if (key) 黄游开发者确认导入角色(key);
        else if (data.name) 黄游开发者确认导入角色(data.name);
        else toast('未能识别所选角色');
      }
    }
  });
};

window.黄游开发者确认导入角色 = function(charName) {
  Store.character.get(charName).then(function(data) {
    if (!data) { toast('角色数据不存在'); return; }
    document.querySelectorAll('.ovl').forEach(function(o) { if (o.querySelector('.mcard')) o.remove(); });
    var sys = '你是一名黄油产业专家。根据角色卡数据生成黄游开发者的完整资料。';
    var fieldLines = '- name：开发者名/社名（须与 type 性质匹配：个人开发者/同人社团/独立工作室→工房、社、制作组、工作室之类的社名；商业会社→XX株式会社/娱乐/互动等公司名；名称要贴合该性质，有圈内味）\n- type：性质（个人开发者/同人社团/商业会社/独立工作室/拔作专业户，可多选，输出数组）\n- founded：成立时间\n- bio：简介/创业史\n- style：招牌风格/社风\n- specialty：擅长题材（总结其经常创作的通用题材大类，如宫廷/虐恋/调教/凌辱/权力不对等/多P/纯爱等；从背景经历中提炼通用类型即可，不要照搬具体剧情或具体角色的具体人生经历细节）\n- fame：代表作品\n- artist：主力画师/编剧\n- fetishes：常做性癖/题材数组\n- controversy：争议/黑历史';
    var prompt = '基于以下角色卡数据生成开发者资料：\n' + ((typeof window.角色卡身份与外貌 === 'function') ? window.角色卡身份与外貌(data) : JSON.stringify(data, null, 2)) + '\n\n字段说明：\n' + fieldLines + '\n\n输出JSON格式：' + JSON.stringify(黄游开发者模板());
    toast('🤖 正在从角色卡生成...');
    LLM.callJSON({ prompt: prompt, system: sys, label: '开发者-角色导入', temperature: 0.85 }).then(function(d) {
      if (!d) { toast('生成失败'); return; }
      if (!d.name) d.name = (data.identity && data.identity.basicInfo && data.identity.basicInfo.name) || charName;
      黄游开发者数据.push(d);
      黄游开发者保存();
      toast('✅ 已导入: ' + d.name);
      黄游渲染开发者(document.getElementById('yyContentView'));
    }).catch(function(err) { toast('❌ ' + err.message); });
  });
};

window.黄游开发者确认导入灵感角色 = function(insp) {
  document.querySelectorAll('.ovl').forEach(function(o) { if (o.querySelector('.mcard')) o.remove(); });
  var json = (typeof window.灵感角色全部 === 'function') ? window.灵感角色全部(insp, 'deep') : '';
  if (!json) { toast('灵感角色数据为空'); return; }
  var 名字 = (insp && (insp.name || (insp.versions && insp.versions.deep && insp.versions.deep.name))) || '未命名';
  var sys = '你是一名黄油产业专家。根据灵感角色数据生成黄游开发者的完整资料。';
  var fieldLines = '- name：开发者名/社名（须与 type 性质匹配：个人开发者/同人社团/独立工作室→工房、社、制作组、工作室之类的社名；商业会社→XX株式会社/娱乐/互动等公司名；名称要贴合该性质，有圈内味）\n- type：性质（个人开发者/同人社团/商业会社/独立工作室/拔作专业户，可多选，输出数组）\n- founded：成立时间\n- bio：简介/创业史\n- style：招牌风格/社风\n- specialty：擅长题材（总结其经常创作的通用题材大类，如宫廷/虐恋/调教/凌辱/权力不对等/多P/纯爱等；从背景经历中提炼通用类型即可，不要照搬具体剧情或具体角色的具体人生经历细节）\n- fame：代表作品\n- artist：主力画师/编剧\n- fetishes：常做性癖/题材数组\n- controversy：争议/黑历史';
  var prompt = '基于以下灵感角色数据生成开发者资料：\n' + json + '\n\n字段说明：\n' + fieldLines + '\n\n输出JSON格式：' + JSON.stringify(黄游开发者模板());
  toast('🤖 正在从灵感角色生成...');
  LLM.callJSON({ prompt: prompt, system: sys, label: '开发者-灵感角色导入', temperature: 0.85 }).then(function(d) {
    if (!d) { toast('生成失败'); return; }
    if (!d.name) d.name = 名字;
    if (!d.type) d.type = '同人社团';
    黄游开发者数据.push(d);
    黄游开发者保存();
    toast('✅ 已导入: ' + d.name);
    黄游渲染开发者(document.getElementById('yyContentView'));
  }).catch(function(err) { toast('❌ ' + err.message); });
};

window.黄游渲染开发者 = 黄游渲染开发者;
