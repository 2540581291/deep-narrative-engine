// 情欲工坊 · 淫诗艳曲 · 情色俳句
var 俳句导航 = [
  { id: 'list', label: '📋 俳句列表' },
  { id: 'editor', label: '✍️ 创作' },
];
var 俳句当前视图 = 'list';
var _haikuEditTitle = null;

function 俳句切换视图(view) {
  俳句当前视图 = view;
  var el = document.getElementById('erotic-haikuContent');
  if (!el) return;
  var h = '<div class="tl-subnav">';
  俳句导航.forEach(function(v) { h += '<div class="tl-subitem' + (v.id === 俳句当前视图 ? ' act' : '') + '" data-view="' + v.id + '">' + v.label + '</div>'; });
  h += '</div><div id="haikuViewContent"></div>';
  el.innerHTML = h;
  var vEl = document.getElementById('haikuViewContent');
  if (!vEl) return;
  el.querySelectorAll('.tl-subitem').forEach(function(i) { i.addEventListener('click', function() { 俳句切换视图(this.getAttribute('data-view')); }); });
  switch (view) {
    case 'list':   渲染俳句列表(vEl); break;
    case 'editor': 渲染俳句编辑器(vEl); break;
  }
}

function 俳句新创作() { _haikuEditTitle = null; 俳句切换视图('editor'); }

function 渲染俳句列表(el) {
  Store.eroticHaiku.list().then(function(items) {
    var h = '<div class="mb-10"><button class="btn-new" onclick="俳句新创作()">＋ 新建</button></div>';
    if (!items || !items.length) { h += '<div class="placeholder-text">暂无俳句</div>'; }
    else {
      items.forEach(function(item) {
        h += '<div class="n-card cur-ptr mb-6 p-10" data-title="' + escHtml(item.title) + '">';
        h += '<div class="fw-600 fs-14">' + escHtml(item.title) + '</div>';
        if (item.line1 || item.line2 || item.line3) {
          h += '<div style="margin-top:4px;font-family:serif;line-height:1.6">';
          if (item.line1) h += escHtml(item.line1) + '<br>';
          if (item.line2) h += escHtml(item.line2) + '<br>';
          if (item.line3) h += escHtml(item.line3);
          h += '</div>';
        }
        if (item.tags) h += '<div class="mt-4">' + item.tags.map(function(t){return '<span class="badge-tag">' + escHtml(t) + '</span>';}).join('') + '</div>';
        if (item.annotation) h += '<div class="text-muted text-sm mt-4">📝 ' + escHtml(item.annotation).slice(0,80) + '</div>';
        h += '<div class="mt-6 flex gap-4">';
        h += '<span class="btn-secondary btn-sm" onclick="event.stopPropagation();俳句编辑项(\'' + escHtml(item.title) + '\')">✏️ 编辑</span>';
        h += '<span class="btn-secondary btn-sm c-error" onclick="event.stopPropagation();俳句删除项(\'' + escHtml(item.title) + '\')">🗑 删除</span>';
        h += '</div></div>';
      });
    }
    el.innerHTML = h;
  });
}
function 俳句编辑项(title) { _haikuEditTitle = title; 俳句切换视图('editor'); }
function 俳句删除项(title) { confirmDialog('确定删除？', function(){ Store.eroticHaiku.delete(title).then(function(){ toast('已删除'); 俳句切换视图('list'); }); }); }
window.俳句编辑项 = 俳句编辑项;
window.俳句编辑项 = window.俳句编辑项;
window.俳句删除项 = 俳句删除项;
window.俳句删除项 = window.俳句删除项;

function 渲染俳句编辑器(el) {
  if (_haikuEditTitle) {
    Store.eroticHaiku.get(_haikuEditTitle).then(function(data) { render俳句表单(el, data||{}); });
  } else {
    render俳句表单(el, {title:'', line1:'', line2:'', line3:'', annotation:'', tags:[]});
  }
}
function render俳句表单(el, data) {
  var h = '<div class="n-card">';
  h += '<div class="form-group"><label>诗题</label><input class="llm-input" id="haikuEditTitle" value="' + escHtml(data.title||'') + '"></div>';
  h += '<div class="form-group"><label>第一句（五字）</label><input class="llm-input" id="haikuEditLine1" value="' + escHtml(data.line1||'') + '"></div>';
  h += '<div class="form-group"><label>第二句（七字）</label><input class="llm-input" id="haikuEditLine2" value="' + escHtml(data.line2||'') + '"></div>';
  h += '<div class="form-group"><label>第三句（五字）</label><input class="llm-input" id="haikuEditLine3" value="' + escHtml(data.line3||'') + '"></div>';
  h += '<div class="form-group"><label>注释（可选）</label><input class="llm-input" id="haikuEditAnnotation" value="' + escHtml(data.annotation||'') + '"></div>';
  h += '<div class="form-group"><label>标签（逗号分隔）</label><input class="llm-input" id="haikuEditTags" value="' + escHtml((data.tags||[]).join('、')) + '"></div>';
  h += '<div class="n-card" style="margin-top:12px;padding:10px;background:var(--bg2)"><div class="text-sm text-muted mb-4">🤖 AI 智创</div>';
  h += '<div class="form-group"><label>诗题</label><input class="llm-input" id="haikuCreateTitle" placeholder="如：春夜之雨..." value="未命名短诗"></div>';
  h += '<div class="form-group"><label>季节意象（可选）</label><textarea class="llm-input" id="haikuCreateDirection" placeholder="如：春雨、蝉鸣、红叶、初雪..."></textarea></div>';
  h += '<div class="form-group"><label>风格</label><div class="flex gap-6 flex-wrap">' +
    ['含蓄空灵','唯美风雅','直白炽烈','诙谐俏皮'].map(function(s) {
      return '<span class="tag-chip" data-style="' + s + '" onclick="this.classList.toggle(\'tag-active\')">' + s + '</span>';
    }).join('') + '</div></div>';
  h += '<button class="btn w-100 p-10 mt-4" onclick="openAiGenPanel(\'haikuGen\')">🚀 AI 生成</button></div>';
  h += '<div class="flex gap-6 mt-6"><button class="btn" onclick="俳句保存编辑()">💾 保存</button><button class="btn-secondary btn-sm" onclick="俳句切换视图(\'list\')">← 返回</button></div></div>';
  el.innerHTML = h;
}
function 俳句保存编辑() {
  var title = document.getElementById('haikuEditTitle').value.trim();
  if (!title) { toast('请输入诗题'); return; }
  var data={title:title,line1:document.getElementById('haikuEditLine1').value.trim(),line2:document.getElementById('haikuEditLine2').value.trim(),line3:document.getElementById('haikuEditLine3').value.trim(),annotation:document.getElementById('haikuEditAnnotation').value.trim(),tags:document.getElementById('haikuEditTags').value.trim().split(/[、,，\s]+/).filter(Boolean)};
  if (_haikuEditTitle) {
    var old = _haikuEditTitle;
    Store.eroticHaiku.get(old).then(function(m){m=m||{};Object.assign(m,data);
      if (title !== old) { Store.eroticHaiku.rename(old, title).then(function(){ _haikuEditTitle = title; toast('已保存'); 俳句切换视图('list'); }); }
      else { Store.eroticHaiku.save(title, m).then(function(){ toast('已保存'); 俳句切换视图('list'); }); }
    });
  } else {
    Store.eroticHaiku.save(title, data).then(function(){ toast('已保存'); 俳句切换视图('list'); });
  }
}
window.俳句保存编辑 = 俳句保存编辑;
window.俳句保存编辑 = window.俳句保存编辑;

if (typeof registerAiField !== 'undefined') {
  registerAiField('haikuGen', '俳句生成', function() {
    var title = document.getElementById('haikuCreateTitle').value.trim() || '未命名俳句';
    var direction = document.getElementById('haikuCreateDirection').value.trim();
    var styles = []; Array.from(document.querySelectorAll('#haikuViewContent [data-style].tag-active')).forEach(function(c) { styles.push(c.getAttribute('data-style')); });
    var ctx = '诗题：' + title;
    if (direction) ctx += '\n意象：' + direction;
    if (styles.length) ctx += '\n风格：' + styles.join('、');
    var r = renderPrompt('haiku_gen', { ctx: ctx }); return { user: r.user, system: r.system };
  }, { fillFn: function(d) {
    if (!d) return;
    var t = d.title || '未命名俳句';
    Store.eroticHaiku.list().then(function(items) {
      var used = {}; items.forEach(function(i){used[i.title]=true;}); var name=t; var i=2;
      while(used[name]){name=t+i;i++;}
      Store.eroticHaiku.save(name, {title:name, line1:d.line1||'', line2:d.line2||'', line3:d.line3||'', annotation:d.annotation||'', tags:d.tags||[]}).then(function(){ toast('俳句已保存'); 俳句切换视图('list'); });
    });
  }});
}

Store.eroticHaiku = createStore('eroticHaiku');
window.俳句切换视图 = 俳句切换视图;
window.俳句切换视图 = window.俳句切换视图;
