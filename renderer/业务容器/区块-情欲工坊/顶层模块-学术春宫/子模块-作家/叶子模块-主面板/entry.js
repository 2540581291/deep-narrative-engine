// 情欲工坊 · 书籍 · 作家管理
var AUTHORS_DIR = '学术/作家';
var _authors = [];
var _authorLoaded = false;

function 加载作家列表() {
  return LocalFS.list(AUTHORS_DIR).then(function(files) {
    if (!files || !files.length) { _authors = []; _authorLoaded = true; return _authors; }
    var jsonFiles = files.filter(function(f) { return f.name.endsWith('.json'); });
    return Promise.all(jsonFiles.map(function(f) {
      return LocalFS.readJSON(AUTHORS_DIR + '/' + f.name).then(function(data) { if (data) data._fileName = f.name; return data; });
    })).then(function(items) {
      _authors = items.filter(Boolean);
      _authorLoaded = true;
      return _authors;
    });
  });
}

function 保存作家列表() {
  var promises = _authors.map(function(a) {
    return LocalFS.saveJSON(AUTHORS_DIR + '/' + (a._fileName || a.name + '.json'), a);
  });
  return Promise.all(promises);
}

var _authorSaveTimer = null;
function 排写作家存储() {
  if (_authorSaveTimer) clearTimeout(_authorSaveTimer);
  _authorSaveTimer = setTimeout(function() { 保存作家列表(); }, 300);
}

function 删除作家(idx) {
  confirmDialog('确定删除作家「' + (_authors[idx] ? _authors[idx].name : '') + '」？', function() {
    var removed = _authors.splice(idx, 1)[0];
    if (removed && removed._fileName) LocalFS.delete(AUTHORS_DIR + '/' + removed._fileName).catch(function(){});
    刷新作家列表();
  });
}

function 刷新作家列表() {
  var el = document.getElementById('bookSubContent') || document.getElementById('bookAuthorList');
  if (el && typeof 渲染作家列表 === 'function') 渲染作家列表(el);
}

function 渲染作家列表(el) {
  加载作家列表().then(function() {
    var h = '<div style="display:flex;gap:8px;margin-bottom:12px">';
    h += '<button class="btn-new" onclick="打开新建作家()">＋ 新建</button>';
    h += '<button class="btn-import" onclick="打开导入作家()">📥 导入角色</button>';
    h += '</div>';
    if (!_authors.length) { h += '<div class="placeholder-text">还没有作家，点击上方按钮创建。</div>'; el.innerHTML = h; return; }
    _authors.forEach(function(a) {
      var realIdx = _authors.indexOf(a);
      h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:12px;margin-bottom:8px">';
      h += '<div style="display:flex;justify-content:space-between;align-items:flex-start"><div style="flex:1">';
      h += '<div style="font-size:14px;font-weight:600;color:var(--fg)">' + escHtml(a.name || '未命名') + '</div>';
      if (a.charSource) h += '<div style="font-size:10px;color:var(--accent2);margin-top:2px">📥 来自角色卡：' + escHtml(a.charSource) + '</div>';
      if (a.preferredGender && a.preferredGender !== '不限') h += '<span style="font-size:10px;padding:1px 6px;border-radius:3px;background:var(--accent-dim);color:var(--accent2)">偏好 ' + escHtml(a.preferredGender) + '</span>';
      if (a.bio) h += '<div style="font-size:12px;color:var(--fg2);margin-top:4px;line-height:1.5">' + escHtml(a.bio.slice(0, 100)) + (a.bio.length > 100 ? '…' : '') + '</div>';
      if (a.style) h += '<div style="font-size:11px;color:var(--fg);margin-top:4px"><span style="color:var(--fg2)">风格：</span>' + escHtml(a.style) + '</div>';
      if (a.favoritePlays && a.favoritePlays.length) h += '<div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:4px">' + a.favoritePlays.map(function(t) { return '<span style="font-size:9px;padding:1px 6px;border-radius:3px;background:var(--accent-dim);color:var(--accent2)">' + escHtml(t) + '</span>'; }).join('') + '</div>';
      if (a.fetishes && a.fetishes.length) h += '<div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:3px">' + a.fetishes.map(function(t) { return '<span style="font-size:9px;padding:1px 6px;border-radius:3px;background:var(--bg3);color:var(--fg3)">' + escHtml(t) + '</span>'; }).join('') + '</div>';
      h += '</div><div style="display:flex;gap:4px;flex-shrink:0;margin-left:8px">';
      h += '<button class="btn-sm" style="padding:2px 8px;font-size:10px;background:none;border:none;color:var(--fg2);cursor:pointer" onclick="打开编辑作家(' + realIdx + ')">✏</button>';
      h += '<button class="btn-sm" style="padding:2px 8px;font-size:10px;background:none;border:none;color:var(--error);cursor:pointer" onclick="删除作家(' + realIdx + ')">✕</button>';
      h += '</div></div></div>';
    });
    el.innerHTML = h;
  });
}

function 打开作家弹窗(title, authorObj) {
  var h = '<div class="mcard" style="max-width:560px;width:92vw">';
  h += '<h3 style="font-size:14px;margin-bottom:10px">' + title + '</h3>';
  h += '<div class="form-group"><label>姓名</label><input class="llm-input" id="authorName" style="width:100%" value="' + escHtml(authorObj.name||'') + '"></div>';
  h += '<div style="display:flex;gap:8px"><div class="form-group" style="flex:1"><label>偏好性别</label><select id="authorPrefGender" class="llm-input llm-select" style="width:100%">';
  ['不限','男性','女性','扶她','伪娘'].forEach(function(g) { h += '<option value="' + g + '"' + (authorObj.preferredGender === g ? ' selected' : '') + '>' + g + '</option>'; });
  h += '</select></div></div>';
  h += '<div class="form-group"><label>简介</label><textarea class="llm-input" id="authorBio" style="width:100%;min-height:60px;resize:vertical">' + escHtml(authorObj.bio||'') + '</textarea></div>';
  h += '<div class="form-group"><label>写作风格</label><textarea class="llm-input" id="authorStyle" style="width:100%;min-height:60px;resize:vertical" placeholder="如：细腻的心理描写、粗犷的动作场景、浪漫主义风格、注重感官描写…">' + escHtml(authorObj.style||'') + '</textarea></div>';
  h += '<div class="form-group"><label>偏好玩法</label><div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:4px" id="authorPlaysChips"></div><input class="llm-input" id="authorPlaysCustom" style="width:100%;font-size:11px" placeholder="输入玩法，回车添加" onkeydown="if(event.key===\'Enter\'){addAuthorCustomChip(\'favoritePlays\',this.value);this.value=\'\';event.preventDefault()}"></div>';
  h += '<div class="form-group"><label>性癖</label><div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:4px" id="authorFetishChips"></div><input class="llm-input" id="authorFetishCustom" style="width:100%;font-size:11px" placeholder="输入性癖，回车添加" onkeydown="if(event.key===\'Enter\'){addAuthorCustomChip(\'fetishes\',this.value);this.value=\'\';event.preventDefault()}"></div>';
  if (authorObj.charSource) h += '<div style="font-size:11px;color:var(--fg2);margin-bottom:6px">📥 来自角色卡：' + escHtml(authorObj.charSource) + '</div>';
  h += '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:10px">';
  h += '<button class="btn-out" style="font-size:11px;padding:4px 14px" onclick="abrirAIWriter()">🤖 AI 生成</button>';
  h += '<button class="btn-main" onclick="this.closest(\'.ovl\').remove();刷新作家列表()">✕ 关闭</button></div></div>';
  var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });

  // 自动保存：输入即写磁盘
  var inputs = ov.querySelectorAll('input, textarea, select');
  for (var _ai = 0; _ai < inputs.length; _ai++) {
    (function(el) {
      (el.tagName === 'SELECT' ? 'change' : 'input');
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function() {
        if (el.id === 'authorName') authorObj.name = el.value.trim();
        else if (el.id === 'authorPrefGender') authorObj.preferredGender = el.value;
        else if (el.id === 'authorBio') authorObj.bio = el.value;
        else if (el.id === 'authorStyle') authorObj.style = el.value;
        // 时间戳已移除
        authorObj._fileName = (authorObj.name || '未命名') + '.json';
        排写作家存储();
      });
    })(inputs[_ai]);
  }
  // 渲染已有值到 chips 容器
  (function(){
    var cids = ['authorPlaysChips','authorFetishChips'];
    var flds = ['favoritePlays','fetishes'];
    for(var _xi=0;_xi<2;_xi++){
      var el=document.getElementById(cids[_xi]); if(!el) continue;
      var vals = authorObj[flds[_xi]];
      if(!vals||!vals.length) continue;
      vals.forEach(function(v){
        var sp=document.createElement('span'); sp.className='tag-chip tag-active';
        sp.style.cssText='font-size:10px;cursor:pointer'; sp.textContent=v;
        sp.onclick=function(){toggleAuthorChip(sp,flds[_xi],v);}; el.appendChild(sp);
      });
    }
  })();
}

window.打开新建作家 = function() {
  var a = { name:'', bio:'', style:'', preferredGender:'不限', favoritePlays:[], fetishes:[], charSource:null };
  _authors.push(a);
  window._authorPlaysCache = []; window._authorFetishCache = [];
  打开作家弹窗('✍ 新建', a);
  排写作家存储();
};

window.打开编辑作家 = function(idx) {
  var a = _authors[idx]; if (!a) return;
  window._authorPlaysCache = (a.favoritePlays || []).slice();
  window._authorFetishCache = (a.fetishes || []).slice();
  window._currentAuthorObj = a;
  打开作家弹窗('✏ 编辑作家', a);
};

window.toggleAuthorChip = function(el, field, val) {
  var cache = field === 'favoritePlays' ? '_authorPlaysCache' : '_authorFetishCache';
  var arr = window[cache] || []; var idx = arr.indexOf(val);
  if (idx >= 0) { arr.splice(idx, 1); el.classList.remove('tag-active'); } else { arr.push(val); el.classList.add('tag-active'); }
  window[cache] = arr;
  if (window._currentAuthorObj) { window._currentAuthorObj[field] = arr.slice(); 排写作家存储(); }
};

window.addAuthorCustomChip = function(field, val) {
  val = val.trim(); if (!val) return;
  var cache = field === 'favoritePlays' ? '_authorPlaysCache' : '_authorFetishCache';
  var arr = window[cache] || [];
  if (arr.indexOf(val) < 0) arr.push(val);
  window[cache] = arr;
  var cid = field === 'favoritePlays' ? 'authorPlaysChips' : 'authorFetishChips';
  var container = document.getElementById(cid);
  if (container) { var sp = document.createElement('span'); sp.className='tag-chip tag-active'; sp.style.cssText='font-size:10px;cursor:pointer'; sp.textContent=val; sp.onclick=function(){toggleAuthorChip(sp,field,val);}; container.appendChild(sp); }
  if (window._currentAuthorObj) { window._currentAuthorObj[field] = arr.slice(); 排写作家存储(); }
};

// ===== 从角色卡导入（统一全局弹窗） =====
window.打开导入作家 = function(genderFilter) {
  stcdOpenCharPicker('', {
    gender: genderFilter || '女性',
    onPick: function(data) {
      if (!data) { toast('角色数据不存在'); return; }
      window._importCharFullData = data;
      window._importCharName = data._dirName || data.title || data.name;
      abrirAIWriter();
    }
  });
};

window.confirmImportChar = function(charName) {
  Store.character.get(charName).then(function(data) {
    if(!data){toast('角色数据不存在');return;}
    document.querySelectorAll('.ovl').forEach(function(o){if(o.querySelector('.mcard'))o.remove();});
    window._importCharFullData = data;
    window._importCharName = charName;
    abrirAIWriter();
  });
};

// ===== AI 一键生成 =====
window.abrirAIWriter = function(){
  var h='<div class="mcard" style="max-width:500px;width:90vw"><h3 style="font-size:14px;margin-bottom:10px">🤖 AI 生成作家</h3><div style="margin-bottom:8px;font-size:11px;color:var(--fg2)">选择方向或自定义要求</div><div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">';
  ['纯爱作家','凌辱系','NTR系','催眠系','调教系','百合系','触手系','露出系','群交系'].forEach(function(v){h+='<span class="tag-chip" style="font-size:10px;cursor:pointer" onclick="toggleAIDir(this,\''+v+'\')">'+v+'</span>';});
  if(window._importCharFullData)h+='<span class="tag-chip tag-active" style="font-size:10px;color:var(--accent2);border-color:var(--accent2)">📥 基于角色卡</span>';
  h+='</div><div class="form-group"><textarea class="llm-input" id="aiWriterDir" style="width:100%;min-height:50px;resize:vertical;font-size:12px" placeholder="补充具体要求…"></textarea></div>';
  h+='<div id="aiWriterResult" style="display:none;background:var(--bg);border:1px solid var(--border);border-radius:4px;padding:8px;margin-bottom:8px;font-size:12px;line-height:1.6;white-space:pre-wrap;max-height:300px;overflow-y:auto"></div>';
  h+='<div style="display:flex;gap:6px;justify-content:flex-end"><button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button><button class="btn-main" id="aiWriterGenBtn" onclick="doAIWriterGen()">🎯 生成</button></div></div>';
  var ov=document.createElement('div'); ov.className='ovl'; ov.innerHTML=h; document.body.appendChild(ov);
  ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();}); window._aiWriterDirs=[];
};

window.toggleAIDir=function(el,val){var a=window._aiWriterDirs||[];var i=a.indexOf(val);if(i>=0){a.splice(i,1);el.classList.remove('tag-active');}else{a.push(val);el.classList.add('tag-active');}window._aiWriterDirs=a;};

window.doAIWriterGen=function(){
  var aiov=document.querySelector('.ovl'); while(aiov&&aiov.querySelector('#aiWriterGenBtn')){var p=aiov.parentNode;aiov.remove();aiov=p?p.querySelector('.ovl'):null;}
  var dirs=window._aiWriterDirs||[];var custom=(document.getElementById('aiWriterDir')||{}).value||'';
  var ctxParts=[];
  if(dirs.length)ctxParts.push('【方向要求】\n'+dirs.join('、'));
  if(custom)ctxParts.push('【额外要求】\n'+custom);
  if(window._importCharFullData)ctxParts.push('【角色卡参考】\n以下角色卡数据就是作家本人——直接以角色本人为原型，沿用其姓名、身份、经历来生成作家档案。preferredGender是他擅长写的题材性别取向，不等于他本人的gender：\n'+JSON.stringify(window._importCharFullData,null,2));
  var rendered=renderPrompt('writer_gen',{context:ctxParts.join('\n\n')});
  LLM.callJSON({label:'AI生成作家',system:rendered.system,prompt:rendered.user,temperature:0.8}).then(function(d){
    if(!d){toast('生成失败');return;}
    // 从角色卡导入场景：无编辑表单，直接创建并保存作家
    if(window._importCharFullData && d.name) {
      var a={name:d.name,bio:d.bio||'',style:d.style||'',preferredGender:d.preferredGender||'不限',favoritePlays:d.favoritePlays||[],fetishes:d.fetishes||[],charSource:window._importCharName||'',_fileName:(d.name||'未命名')+'.json'};
      _authors.push(a);
      window._importCharFullData=null;window._importCharName=null;
      // 立即同步保存到磁盘，再刷新列表（避免防抖保存被读盘覆盖丢数据）
      保存作家列表().then(function(){ 刷新作家列表(); });
      toast('✅ 已导入并生成: '+d.name);
      return;
    }
    // 编辑表单场景：有表单填入选填
    ['authorName','authorBio','authorStyle','authorPrefGender'].forEach(function(id){
      var el=document.getElementById(id);if(!el)return;
      var val=null; if(id==='authorName')val=d.name; else if(id==='authorBio')val=d.bio; else if(id==='authorStyle')val=d.style; else if(id==='authorPrefGender')val=d.preferredGender;
      if(val){el.value=val; el.dispatchEvent(new Event('input',{bubbles:true}));}
    });
    if(d.favoritePlays&&d.favoritePlays.length){window._authorPlaysCache=d.favoritePlays.slice();renderAuthorChips('authorPlaysChips',d.favoritePlays); if(window._currentAuthorObj){window._currentAuthorObj.favoritePlays=d.favoritePlays.slice(); 排写作家存储();}}
    if(d.fetishes&&d.fetishes.length){window._authorFetishCache=d.fetishes.slice();renderAuthorChips('authorFetishChips',d.fetishes); if(window._currentAuthorObj){window._currentAuthorObj.fetishes=d.fetishes.slice(); 排写作家存储();}}
    // 立即同步保存到磁盘，防止用户随后关闭弹窗触发读盘覆盖内存丢数据
    保存作家列表();
    toast('AI 内容已填入');
  }).catch(function(err){toast('生成失败: '+err.message);});
};

function renderAuthorChips(cid,vals){var el=document.getElementById(cid);if(!el)return;el.querySelectorAll('.tag-chip').forEach(function(c){c.classList.remove('tag-active');});el.querySelectorAll('.tag-chip').forEach(function(c){if(vals.indexOf(c.textContent)>=0)c.classList.add('tag-active');});}

window.加载作家列表=加载作家列表;
window.获取作家列表=function(){return _authors;};
window.获取作家选项HTML=function(){if(!_authors.length)return '<option value="">无可用作家</option>';var h='<option value="">— 不引用 —</option>';_authors.forEach(function(a){h+='<option value="'+escHtml(a.name)+'">'+escHtml(a.name)+'</option>';});return h;};
window.按名称获取作家=function(name){for(var _ai=0;_ai<_authors.length;_ai++){if(_authors[_ai].name===name)return _authors[_ai];}return null;};

// ===== 一级「作者」TAB 入口：单视图，直接渲染作者列表 =====
window.渲染作者页 = function(el) { 渲染作家列表(el); };
