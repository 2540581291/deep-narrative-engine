// 黄图淫册 · 🎨 画师
// 每个画师自带一套自定义字段（fields），字段名/类型/值由该画师自身特征决定，不同画师可有不同字段。
var 图册画师数据 = [];
var 图册画师当前对象 = null;
var 图册画师保存定时器 = null;

// 旧扁平结构 → 新字段数组（迁移）
var 图册画师旧字段映射 = {
  persona:   { label: '一句话定位',   type: 'textarea' },
  signature: { label: '招牌风格',     type: 'text' },
  gender:    { label: '性别',         type: 'text' },
  styleName: { label: '招牌画风名',   type: 'text' },
  styleTags: { label: '画风标签',     type: 'chips' },
  genre:     { label: '流派体系',     type: 'chips' },
  medium:    { label: '媒介笔触',     type: 'chips' },
  palette:   { label: '色调倾向',     type: 'chips' },
  lighting:  { label: '光影偏好',     type: 'text' },
  laneStyle: { label: '线条风格',     type: 'text' },
  skinRendering: { label: '肌肤质感', type: 'text' },
  subjectFocus:  { label: '画面重心', type: 'text' },
  explicitness:  { label: '露骨尺度', type: 'text' },
  preferredGender: { label: '擅长绘制角色', type: 'text' },
  motifs:    { label: '标志性母题',   type: 'chips' },
  fetishes:  { label: '擅长性癖',     type: 'chips' },
  bio:       { label: '简介',         type: 'textarea' },
  style:     { label: '画风',         type: 'textarea' },
  specialty: { label: '擅长题材',     type: 'textarea' },
  fame:      { label: '业内名气',     type: 'textarea' },
  controversy: { label: '争议史',     type: 'textarea' }
};

// 判断字段用途：'content' = 题材/内容（画师擅长画的口味，不可作为剧情硬约束）；'style' = 画风/技法（可继承到画面表现）
var 图册画师内容词 = ['定位', '母题', '性癖', '题材', '人设', '简介', '偏好', '口味', '代表作', '经历', '背景', '标签', '擅长绘制', '画面重心'];
function 图册画师判断用途(label) {
  if (!label) return 'style';
  for (var i = 0; i < 图册画师内容词.length; i++) if (label.indexOf(图册画师内容词[i]) >= 0) return 'content';
  return 'style';
}

function 图册画师迁移旧字段(s) {
  if (!s || typeof s !== 'object') return s;
  if (Array.isArray(s.fields)) return s; // 已是新结构
  var obj = { name: (s.name || ''), fields: [] };
  if (s._fileName) obj._fileName = s._fileName;
  Object.keys(图册画师旧字段映射).forEach(function(k) {
    var m = 图册画师旧字段映射[k];
    var v = s[k];
    if (v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length)) {
      obj.fields.push({ label: m.label, type: m.type, value: v, kind: 图册画师判断用途(m.label) });
    }
  });
  if (!obj.fields.length) obj.fields = [ { label: '个人简介', type: 'textarea', value: '', kind: 'content' } ];
  return obj;
}

// 不同载体的画师，字段所涵盖的维度应当不同（载体上下文，而非预设取值清单）
var 图册画师载体字段域 = {
  chatu:   '单张情色插画。字段应侧重：构图与视角、光影与色调、特写与露骨尺度、肌肤质感、氛围与细节等单张画面维度。',
  manhua:  '连载情色漫画。字段应侧重：分镜与分格、节奏与张力、肢体动作与表情连续性、跨页连贯、台词与对话框、连载节奏等漫画创作维度。',
  sheding: '视觉设定集。字段应侧重：角色外貌/体型/性格/背景、服装与内衣、场景、道具、世界观等设定维度。',
  xiezhen: '情色写真集。字段应侧重：人体姿态、光线与写实质感、私房/户外场景、镜头语言、暧昧氛围等写实维度。'
};
function 图册画师载体上下文() {
  var mk = 图册当前载体;
  var m = window.图册载体 ? window.图册载体[mk] : null;
  return '所属载体：' + (m ? m.label : mk) + '\n载体定位：' + (图册画师载体字段域[mk] || '') + '\n';
}

function 图册画师模板() {
  return { name: '', fields: [] };
}

function 图册画师保存() {
  if (图册画师保存定时器) clearTimeout(图册画师保存定时器);
  var mk = 图册当前载体;
  图册画师数据.forEach(function(s) {
    if (!s._fileName) s._fileName = LocalFS.sanitize(s.name || '未命名') + '.json';
    图册保存来源(mk, s);
  });
}
function 图册画师自动保存() {
  if (图册画师保存定时器) clearTimeout(图册画师保存定时器);
  图册画师保存定时器 = setTimeout(图册画师保存, 400);
}

// ===== 列表卡片 =====
function 图册渲染画师(el) {
  var mk = 图册当前载体;
  el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--fg2)">加载中...</div>';
  图册加载来源(mk).then(function(items) {
    图册画师数据 = (items || []).map(图册画师迁移旧字段);
    var 来源标签 = (typeof window.图册来源标签 === 'function') ? 图册来源标签(mk) : '🎨 画师';
    var 来源标题 = (typeof window.图册来源标题 === 'function') ? 图册来源标题(mk) : '画师';
    var h = '';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">';
    h += '<span style="font-size:13px;font-weight:600;color:var(--fg)">' + 来源标签 + '（' + 图册画师数据.length + '）</span>';
    h += '<div style="display:flex;gap:6px"><button class="btn-new" onclick="图册画师新建()">＋ 新建</button>';
    h += '<button class="btn-import" onclick="图册画师导入角色()">📥 导入角色</button></div></div>';
    if (!图册画师数据.length) {
      h += '<div class="placeholder-text" style="padding:30px;text-align:center">暂无' + 来源标题 + '</div>';
    } else {
      图册画师数据.forEach(function(s, i) {
        var realIdx = 图册画师数据.indexOf(s);
        h += '<div class="n-card" style="margin-bottom:8px;padding:12px">';
        h += '<div style="display:flex;justify-content:space-between;align-items:flex-start">';
        h += '<div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--fg)">' + escHtml(s.name || '未命名') + '</div>';
        h += '<div style="margin-top:6px;display:flex;flex-direction:column;gap:4px">';
        (s.fields || []).forEach(function(f) {
          var v = f.value;
          var 文本 = Array.isArray(v) ? v.join('、') : (typeof v === 'string' ? v : '');
          if (!f.label || !文本) return;
          h += '<div style="font-size:10px;color:var(--fg);padding:3px 8px;background:var(--bg1);border-radius:4px;display:flex;gap:6px">';
          h += '<span style="color:var(--accent2);font-weight:600;white-space:nowrap;flex-shrink:0">' + escHtml(f.label) + '</span>';
          h += '<span style="color:var(--fg);line-height:1.5">' + escHtml(文本.slice(0, 120)) + (文本.length > 120 ? '…' : '') + '</span></div>';
        });
        h += '</div>';
        h += '</div><div style="display:flex;gap:4px;flex-shrink:0;margin-left:8px">';
        h += '<button class="btn-sm" style="padding:2px 8px;font-size:10px;background:none;border:none;color:var(--fg2);cursor:pointer" onclick="图册画师编辑(' + realIdx + ')">✏</button>';
        h += '<button class="btn-sm" style="padding:2px 8px;font-size:10px;background:none;border:none;color:var(--error);cursor:pointer" onclick="图册画师删除(' + realIdx + ')">✕</button>';
        h += '</div></div></div>';
      });
    }
    el.innerHTML = h;
  });
}

// ===== 弹窗 =====
function 图册来源名() { return (typeof window.图册来源标题 === 'function') ? 图册来源标题(图册当前载体) : '画师'; }

window.图册画师新建 = function() {
  var obj = 图册画师模板();
  图册画师数据.push(obj);
  图册画师当前对象 = obj;
  图册画师打开弹窗('➕ 新建', obj, true);
};

window.图册画师编辑 = function(idx) {
  var obj = 图册画师数据[idx];
  if (!obj) return;
  图册画师当前对象 = obj;
  图册画师打开弹窗('✏️ 编辑', obj, false);
};

function 图册画师打开弹窗(title, obj, isNew) {
  if (!obj.fields) obj.fields = [];
  var 来源标签 = (typeof window.图册来源标签 === 'function') ? 图册来源标签(图册当前载体) : '🎨 画师';
  var 来源名 = 图册来源名();
  var h = '<div class="mcard" style="max-width:620px;width:94vw;max-height:86vh;overflow-y:auto">';
  h += '<h3 style="font-size:14px;margin-bottom:10px">' + 来源标签 + ' ' + title + '</h3>';
  h += '<div class="form-group"><label>' + 来源名 + '名 / 艺名</label><input class="llm-input" id="htys_name" style="width:100%" value="' + escHtml(obj.name || '') + '" placeholder="' + 来源名 + '姓名或艺名"></div>';
  h += '<div id="htys_fields" style="margin-top:6px;display:flex;flex-direction:column;gap:8px"></div>';
  h += '<div style="margin-top:6px;display:flex;gap:6px"><button class="btn-sm btn-outline" onclick="图册画师添加字段()" style="font-size:11px">＋ 添加字段</button><button class="btn-sm btn-outline" onclick="图册画师AI生成()" style="font-size:11px">🤖 AI 生成整位' + 来源名 + '</button></div>';
  h += '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:10px">';
  h += '<button class="btn-sm" style="background:transparent;color:var(--fg2);border:1px solid var(--border)" onclick="this.closest(\'.ovl\').remove()">关闭</button></div></div>';
  var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  var nameEl = ov.querySelector('#htys_name');
  nameEl.addEventListener('input', function() {
    obj.name = this.value;
    if (isNew) 图册画师当前对象 = obj;
    图册画师自动保存();
  });
  图册画师渲染弹窗字段(obj);
}

function 图册画师渲染弹窗字段(obj) {
  var c = document.getElementById('htys_fields');
  if (!c) return;
  var 类型名 = { text: '文本', textarea: '多行', chips: '标签' };
  c.innerHTML = (obj.fields || []).map(function(f, i) {
    var h = '<div class="n-card" style="padding:8px;background:var(--bg1)">';
    h += '<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px">';
    h += '<input class="llm-input" style="flex:1;font-size:11px" value="' + escHtml(f.label || '') + '" placeholder="字段标签" onchange="图册画师改标签(' + i + ',this.value)">';
    h += '<select class="llm-input llm-select" style="width:72px;font-size:11px" title="字段用途" onchange="图册画师改用途(' + i + ',this.value)">';
    h += '<option value="style"' + (f.kind !== 'content' ? ' selected' : '') + '>画风</option>';
    h += '<option value="content"' + (f.kind === 'content' ? ' selected' : '') + '>题材</option>';
    h += '</select>';
    h += '<select class="llm-input llm-select" style="width:72px;font-size:11px" onchange="图册画师改类型(' + i + ',this.value)">';
    ['text', 'textarea', 'chips'].forEach(function(t) { h += '<option value="' + t + '"' + (f.type === t ? ' selected' : '') + '>' + 类型名[t] + '</option>'; });
    h += '</select>';
    h += '<button class="btn-sm" style="font-size:10px;color:var(--accent2);cursor:pointer;background:none;border:none" title="AI 生成此字段内容" onclick="图册画师AI字段(' + i + ')">🤖</button>';
    h += '<button class="btn-sm" style="font-size:10px;color:var(--error);cursor:pointer;background:none;border:none" onclick="图册画师删字段(' + i + ')">🗑</button>';
    h += '</div>';
    if (f.type === 'textarea') {
      h += '<textarea class="llm-input" style="width:100%;min-height:60px;font-size:11px;resize:vertical" placeholder="内容" oninput="图册画师改值(' + i + ',\'textarea\',this.value)">' + escHtml(f.value || '') + '</textarea>';
    } else if (f.type === 'chips') {
      var vals = Array.isArray(f.value) ? f.value : (f.value ? [f.value] : []);
      h += '<div id="htys_f' + i + '_chips" style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:4px">';
      vals.forEach(function(v) { h += '<span class="tag-chip tag-active" style="font-size:10px" onclick="图册画师删芯片(' + i + ',this)">' + escHtml(v) + '</span>'; });
      h += '</div><input class="llm-input" style="width:100%;font-size:11px" placeholder="输入标签，回车添加" onkeydown="if(event.key===\'Enter\'){图册画师加芯片(' + i + ',this.value);this.value=\'\';event.preventDefault()}">';
    } else {
      h += '<input class="llm-input" style="width:100%;font-size:11px" value="' + escHtml(f.value || '') + '" placeholder="内容" oninput="图册画师改值(' + i + ',\'text\',this.value)">';
    }
    h += '</div>';
    return h;
  }).join('') || '<div style="font-size:11px;color:var(--fg3)">暂无字段，点「＋ 添加字段」或「🤖 AI 生成整位画师」。</div>';
}

// ===== 字段事件 =====
window.图册画师改标签 = function(i, v) { var f = 图册画师当前对象; if (f && f.fields[i]) f.fields[i].label = v; 图册画师自动保存(); };
window.图册画师改类型 = function(i, type) {
  var f = 图册画师当前对象; if (!f || !f.fields[i]) return;
  var fl = f.fields[i];
  fl.type = type;
  if (type === 'chips' && typeof fl.value === 'string') fl.value = fl.value ? [fl.value] : [];
  if (type !== 'chips' && Array.isArray(fl.value)) fl.value = fl.value.join('、');
  图册画师渲染弹窗字段(f);
  图册画师自动保存();
};
window.图册画师改值 = function(i, type, val) { var f = 图册画师当前对象; if (f && f.fields[i]) f.fields[i].value = val; 图册画师自动保存(); };
window.图册画师改用途 = function(i, kind) { var f = 图册画师当前对象; if (f && f.fields[i]) f.fields[i].kind = kind; 图册画师自动保存(); };
window.图册画师删字段 = function(i) { var f = 图册画师当前对象; if (f && f.fields) f.fields.splice(i, 1); 图册画师渲染弹窗字段(f); 图册画师自动保存(); };
window.图册画师添加字段 = function() { var f = 图册画师当前对象; if (!f) return; if (!f.fields) f.fields = []; f.fields.push({ label: '新字段', type: 'text', value: '', kind: 'style' }); 图册画师渲染弹窗字段(f); 图册画师自动保存(); };
window.图册画师加芯片 = function(i, val) {
  val = (val || '').trim(); if (!val) return;
  var f = 图册画师当前对象; if (!f || !f.fields[i]) return;
  if (!Array.isArray(f.fields[i].value)) f.fields[i].value = [];
  if (f.fields[i].value.indexOf(val) < 0) f.fields[i].value.push(val);
  var box = document.getElementById('htys_f' + i + '_chips');
  if (box) {
    var sp = document.createElement('span'); sp.className = 'tag-chip tag-active'; sp.style.cssText = 'font-size:10px'; sp.textContent = val;
    sp.onclick = function() { 图册画师删芯片(i, sp); };
    box.appendChild(sp);
  }
  图册画师自动保存();
};
window.图册画师删芯片 = function(i, el) {
  var f = 图册画师当前对象; if (!f || !f.fields[i] || !Array.isArray(f.fields[i].value)) return;
  var v = (el.textContent || '').trim();
  var idx = f.fields[i].value.indexOf(v);
  if (idx >= 0) f.fields[i].value.splice(idx, 1);
  if (el.parentNode) el.parentNode.removeChild(el);
  图册画师自动保存();
};

// ===== AI 生成整位画师（方向弹窗） =====
window.图册画师AI生成 = function() {
  var h = '<div class="mcard" style="max-width:520px;width:92vw"><h3 style="font-size:14px;margin-bottom:10px">🤖 AI 生成' + 图册来源名() + '</h3>';
  h += '<div style="margin-bottom:8px;font-size:11px;color:var(--fg2)">选择方向或自定义要求</div><div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">';
  var dirs = ['漫画画师', '插画画师', '设定画师', '写真摄影师'];
  dirs.forEach(function(v) { h += '<span class="tag-chip" style="font-size:10px;cursor:pointer" onclick="图册画师切换AI方向(this,\'' + v + '\')">' + v + '</span>'; });
  h += '</div><div class="form-group"><textarea class="llm-input" id="图册画师AI自定义" style="width:100%;min-height:50px;resize:vertical;font-size:12px" placeholder="补充具体要求…"></textarea></div>';
  h += '<div style="display:flex;gap:6px;justify-content:flex-end"><button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button><button class="btn-main" onclick="图册画师执行AI生成()">🎯 生成</button></div></div>';
  var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  window._图册画师AI方向 = [];
};

window.图册画师切换AI方向 = function(el, val) {
  var a = window._图册画师AI方向 || [];
  var i = a.indexOf(val);
  if (i >= 0) { a.splice(i, 1); el.classList.remove('tag-active'); }
  else { a.push(val); el.classList.add('tag-active'); }
  window._图册画师AI方向 = a;
};

// 字段输出 schema 说明（不含预设类型清单）
function 图册画师字段输出说明() {
  return 'fields：字段数组，每个元素 { "label":"字段名","type":"text或textarea或chips","value":"...","kind":"style或content" }。\n- kind：字段用途。style=画风/技法（该画师怎么画，可继承到画面表现）；content=题材/内容（该画师擅长画的口味，仅供参考，不可作为剧情硬约束）。';
}

// 规范化 AI 返回的字段
function 图册画师字段规范化(f) {
  var kind = (f.kind === 'content') ? 'content' : (f.kind === 'style' ? 'style' : 图册画师判断用途(f.label || ''));
  return {
    label: f.label || '新字段',
    type: ['text', 'textarea', 'chips'].indexOf(f.type) >= 0 ? f.type : 'text',
    value: f.type === 'chips' ? (Array.isArray(f.value) ? f.value : (f.value ? [f.value] : [])) : (f.value || ''),
    kind: kind
  };
}

window.图册画师执行AI生成 = function() {
  var dirs = window._图册画师AI方向 || [];
  var custom = (document.getElementById('图册画师AI自定义') || {}).value || '';
  var ctx = [];
  if (dirs.length) ctx.push('【方向】' + dirs.join('、'));
  if (custom) ctx.push('【要求】' + custom);
  var sys = '你是一名情色绘画行业专家兼画风策划。你要生成一位「画师」。她/他是一套可逐条约束画面生成的风格指令。请为该画师生成一套【贴合其自身特征】的字段（字段名、类型、内容）。不同画师应有不同字段，字段由你根据该画师的信息自由决定，不要给预设类型清单；字段数量5-12个，类型只用 text（单行）/textarea（多行）/chips（标签数组）。';
  var prompt = '请生成一位情色画师。\n' + ctx.join('\n') + '\n' + 图册画师载体上下文() + '\n输出JSON格式：{"name":"画师名/笔名","fields":[{"label":"字段名","type":"text","value":"内容","kind":"style"},{"label":"标签类","type":"chips","value":["a","b"],"kind":"content"}]}。\n' + 图册画师字段输出说明() + '\n\n字段方向请贴合上方「载体定位」，不同载体画师字段应侧重不同维度。name 用画师名（新建时若来自角色卡则用角色名，不要加前缀）。';
  toast('🤖 生成中...');
  LLM.callJSON({ prompt: prompt, system: sys, label: '画师AI生成', temperature: 0.85 }).then(function(d) {
    if (!d) { toast('生成失败'); return; }
    if (!d.name) d.name = '未命名';
    if (图册画师当前对象) {
      图册画师当前对象.name = d.name;
      图册画师当前对象.fields = (Array.isArray(d.fields) ? d.fields : []).map(图册画师字段规范化);
      图册画师保存();
      toast('✅ 已生成');
      document.querySelectorAll('.ovl').forEach(function(o) { if (o.querySelector('.mcard')) o.remove(); });
      图册画师渲染画师(document.getElementById('htContentView'));
    }
  }).catch(function(err) { toast('❌ ' + err.message); });
};

// ===== AI 生成单个字段内容 =====
window.图册画师AI字段 = function(i) {
  var f = 图册画师当前对象;
  if (!f || !f.fields[i]) return;
  var target = f.fields[i];
  var ctx = '画师：' + (f.name || '') + '\n已有字段：\n' + (f.fields || []).map(function(x, ix) {
    return '-' + (x.label || ('字段' + (ix + 1))) + '：' + (Array.isArray(x.value) ? x.value.join('、') : (x.value || ''));
  }).join('\n');
  var sys = '你是一名情色绘画行业专家兼画风策划。根据该画师的信息生成一个字段的内容。JSON格式：{"value":"..."}。';
  var prompt = '请为这位画师的字段「' + (target.label || '') + '」（类型：' + ({ text: '单行文本', textarea: '多行文本', chips: '标签数组' })[target.type || 'text'] + '）生成内容。\n' + 图册画师载体上下文() + ctx + '\n\n若类型为 chips，value 输出字符串数组；否则输出字符串。按该画师真实特点与所属载体的创作维度填写，不要给预设类型清单。';
  toast('🤖 生成中...');
  LLM.callJSON({ prompt: prompt, system: sys, label: '画师字段生成', temperature: 0.85 }).then(function(d) {
    if (!d) { toast('生成失败'); return; }
    if (target.type === 'chips') target.value = Array.isArray(d.value) ? d.value : (d.value ? [d.value] : []);
    else target.value = (d.value != null ? d.value : '');
    图册画师渲染弹窗字段(f);
    图册画师自动保存();
    toast('✅ 已生成');
  }).catch(function(err) { toast('❌ ' + err.message); });
};

// ===== 删除 =====
window.图册画师删除 = function(idx) {
  var s = 图册画师数据[idx];
  confirmDialog('确定删除画师「' + (s && s.name ? s.name : '') + '」？', function() {
    if (s && s._fileName) 图册删除来源文件(图册当前载体, s);
    图册画师数据.splice(idx, 1);
    图册渲染画师(document.getElementById('htContentView'));
  });
};

// ===== 角色卡 / 灵感角色库 导入（统一全局弹窗） =====
window.图册画师导入角色 = function() {
  stcdOpenCharPicker('', {
    onPick: function(data) {
      if (!data) { toast('未能识别所选角色'); return; }
      if (data.versions) { // 灵感角色库（有 versions 三版本）
        图册画师确认导入灵感角色(data);
      } else { // 正式角色卡：Store.character 的 key 是目录名
        var key = data._dirName || data.title;
        if (key) 图册画师确认导入角色(key);
        else if (data.name) 图册画师确认导入角色(data.name);
        else toast('未能识别所选角色');
      }
    }
  });
};

window.图册画师确认导入灵感角色 = function(insp) {
  document.querySelectorAll('.ovl').forEach(function(o) { if (o.querySelector('.mcard')) o.remove(); });
  var json = (typeof window.灵感角色全部 === 'function') ? window.灵感角色全部(insp, 'deep') : '';
  if (!json) { toast('灵感角色数据为空'); return; }
  var 名字 = (insp && (insp.name || (insp.versions && insp.versions.deep && insp.versions.deep.name))) || '未命名';
  var sys = '你是一名情色绘画行业专家兼画风策划。根据灵感角色数据生成一位画师。name 必须使用该角色的名字（' + 名字 + '），不得加前缀/笔名/修饰词。请为该画师生成一套【贴合其自身特征】的字段，不同画师字段不同；字段数量5-12个，类型只用 text/textarea/chips，不要给预设类型清单。每个字段用 kind 标注用途：style=画风/技法，content=题材/内容（画师擅长画的口味）。';
  var prompt = '基于以下灵感角色数据生成画师资料：\n' + json + '\n' + 图册画师载体上下文() + '\n输出JSON格式：{"name":"' + 名字 + '","fields":[{"label":"字段名","type":"text","value":"内容","kind":"style"},{"label":"标签类","type":"chips","value":["a","b"],"kind":"content"}]}。\n' + 图册画师字段输出说明() + '\n\n字段方向请贴合上方「载体定位」，不同载体画师字段应侧重不同维度。';
  toast('🤖 正在从灵感角色生成...');
  LLM.callJSON({ prompt: prompt, system: sys, label: '画师-灵感角色导入', temperature: 0.85 }).then(function(d) {
    if (!d) { toast('生成失败'); return; }
    d.name = 名字; // 画师名一律强制取角色名，不加前缀
    d.fields = (Array.isArray(d.fields) ? d.fields : []).map(图册画师字段规范化);
    图册画师数据.push(d);
    图册画师保存();
    toast('✅ 已导入: ' + d.name);
    图册渲染画师(document.getElementById('htContentView'));
  }).catch(function(err) { toast('❌ ' + err.message); });
};

window.图册画师确认导入角色 = function(charName) {
  Store.character.get(charName).then(function(data) {
    if (!data) { toast('角色数据不存在'); return; }
    document.querySelectorAll('.ovl').forEach(function(o) { if (o.querySelector('.mcard')) o.remove(); });
    var 角色名 = (data.identity && data.identity.basicInfo && data.identity.basicInfo.name) || charName;
    var sys = '你是一名情色绘画行业专家兼画风策划。根据角色卡数据生成一位画师。name 必须使用该角色的名字（' + 角色名 + '），不得加前缀/笔名/修饰词。请为该画师生成一套【贴合其自身特征】的字段，不同画师字段不同；字段数量5-12个，类型只用 text/textarea/chips，不要给预设类型清单。每个字段用 kind 标注用途：style=画风/技法，content=题材/内容（画师擅长画的口味）。';
    var prompt = '基于以下角色卡数据生成画师资料：\n' + ((typeof window.角色卡身份与外貌 === 'function') ? window.角色卡身份与外貌(data) : JSON.stringify(data, null, 2)) + '\n' + 图册画师载体上下文() + '\n输出JSON格式：{"name":"' + 角色名 + '","fields":[{"label":"字段名","type":"text","value":"内容","kind":"style"},{"label":"标签类","type":"chips","value":["a","b"],"kind":"content"}]}。\n' + 图册画师字段输出说明() + '\n\n字段方向请贴合上方「载体定位」，不同载体画师字段应侧重不同维度。';
    toast('🤖 正在从角色卡生成...');
    LLM.callJSON({ prompt: prompt, system: sys, label: '画师-角色导入', temperature: 0.85 }).then(function(d) {
      if (!d) { toast('生成失败'); return; }
      d.name = 角色名; // 画师名一律强制取角色名，不加前缀
      d.fields = (Array.isArray(d.fields) ? d.fields : []).map(图册画师字段规范化);
      图册画师数据.push(d);
      图册画师保存();
      toast('✅ 已导入: ' + d.name);
      图册渲染画师(document.getElementById('htContentView'));
    }).catch(function(err) { toast('❌ ' + err.message); });
  });
};

window.图册渲染画师 = 图册渲染画师;
