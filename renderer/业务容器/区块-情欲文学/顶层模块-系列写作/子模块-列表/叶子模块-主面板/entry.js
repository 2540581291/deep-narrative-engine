// 系列写作 · 列表
var _swList = [];

function 渲染系列写作列表(el) {
  var h = '<div class="mb-10"><button class="btn-new" onclick="系列写作显示创建()">＋ 新建</button></div>';
  h += '<div id="swListContent"></div>';
  el.innerHTML = h;
  loadSwList();
}

function loadSwList() {
  var el = document.getElementById('swListContent');
  if (!el) return;
  Store.seriesWriting.list().then(function(items) {
    _swList = items || [];
    if (!_swList.length) { el.innerHTML = '<div class="placeholder-text">暂无系列，点击上方新建</div>'; return; }
    var h = '';
    _swList.forEach(function(item) {
      var volCount = item.volumes ? item.volumes.length : 0;
      h += '<div class="n-card cur-ptr mb-6 p-10" onclick="系列写作选择系列(\'' + escHtml(item.title) + '\')">';
      h += '<div class="fw-600 fs-14">' + escHtml(item.title) + '</div>';
      h += '<div class="text-sm text-muted">📚 ' + volCount + '卷' + (item.premise ? ' · ' + escHtml(item.premise).slice(0,80) : '') + '</div>';
      if (item.tags) h += '<div class="mt-4">' + item.tags.map(function(t){return '<span class="badge-tag">' + escHtml(t) + '</span>';}).join('') + '</div>';
      h += '<div class="mt-6 flex gap-4">';
      h += '<span class="btn-secondary btn-sm" onclick="event.stopPropagation();系列写作编辑系列(\'' + escHtml(item.title) + '\')">✏️ 编辑</span>';
      h += '<span class="btn-secondary btn-sm c-error" onclick="event.stopPropagation();系列写作删除系列(\'' + escHtml(item.title) + '\')">🗑 删除</span>';
      h += '</div></div>';
    });
    el.innerHTML = h;
  });
}

function 系列写作显示创建() {
  var el = document.getElementById('swListContent');
  if (!el) return;
  el.innerHTML = '<div class="n-card mw-500 ma"><h3 class="n-card-title">新建</h3>'
    + '<div class="form-group"><label>系列名称</label><input class="llm-input" id="swCreateTitle" placeholder="如：调教三部曲"></div>'
    + '<div class="form-group"><label>一句话设定（可选）</label><textarea class="llm-input" id="swCreatePremise" placeholder="这个系列是关于什么的？"></textarea></div>'
    + '<div class="form-group"><label>标签（逗号分隔）</label><input class="llm-input" id="swCreateTags"></div>'
    + '<div class="flex gap-6"><button class="btn" onclick="系列写作保存系列()">💾 保存</button><button class="btn-secondary btn-sm" onclick="loadSwList()">← 返回</button></div></div>';
}
window.系列写作显示创建 = 系列写作显示创建;

function 系列写作保存系列() {
  var title = document.getElementById('swCreateTitle').value.trim();
  if (!title) { toast('请输入系列名称'); return; }
  var premise = document.getElementById('swCreatePremise').value.trim();
  var tags = document.getElementById('swCreateTags').value.trim().split(/[、,，\s]+/).filter(Boolean);
  Store.seriesWriting.save(title, { title: title, premise: premise, tags: tags, volumes: [] }).then(function() {
    toast('系列已创建'); loadSwList();
  });
}
window.系列写作保存系列 = 系列写作保存系列;

function 系列写作选择系列(title) {
  swActiveSeries = title;
  系列写作切换标签('outline');
}
window.系列写作选择系列 = 系列写作选择系列;

function 系列写作编辑系列(title) {
  Store.seriesWriting.get(title).then(function(data) {
    if (!data) return;
    var el = document.getElementById('swListContent');
    if (!el) return;
    el.innerHTML = '<div class="n-card mw-500 ma"><h3 class="n-card-title">编辑系列</h3>'
      + '<div class="form-group"><label>系列名称</label><input class="llm-input" id="swEditTitle" value="' + escHtml(data.title||'') + '"></div>'
      + '<div class="form-group"><label>一句话设定</label><textarea class="llm-input" id="swEditPremise">' + escHtml(data.premise||'') + '</textarea></div>'
      + '<div class="form-group"><label>标签</label><input class="llm-input" id="swEditTags" value="' + escHtml((data.tags||[]).join('、')) + '"></div>'
      + '<div class="flex gap-6"><button class="btn" onclick="系列写作更新系列(\'' + escHtml(title) + '\')">💾 保存</button><button class="btn-secondary btn-sm" onclick="loadSwList()">← 返回</button></div></div>';
  });
}
window.系列写作编辑系列 = 系列写作编辑系列;

function 系列写作更新系列(oldTitle) {
  var title = document.getElementById('swEditTitle').value.trim();
  if (!title) { toast('请输入系列名称'); return; }
  Store.seriesWriting.get(oldTitle).then(function(m) {
    if (!m) return;
    m.title = title;
    m.premise = document.getElementById('swEditPremise').value.trim();
    m.tags = document.getElementById('swEditTags').value.trim().split(/[、,，\s]+/).filter(Boolean);
    if (title !== oldTitle) { Store.seriesWriting.rename(oldTitle, title).then(function(){ toast('已保存'); loadSwList(); }); }
    else { Store.seriesWriting.save(title, m).then(function(){ toast('已保存'); loadSwList(); }); }
  });
}
window.系列写作更新系列 = 系列写作更新系列;

function 系列写作删除系列(title) {
  confirmDialog('确定删除系列「' + title + '」？', function() {
    Store.seriesWriting.delete(title).then(function(){ toast('已删除'); loadSwList(); });
  });
}
window.系列写作删除系列 = 系列写作删除系列;

window.showSwCreate = window.系列写作显示创建;
window.saveSwSeries = window.系列写作保存系列;
window.selectSwSeries = window.系列写作选择系列;
window.editSwSeries = window.系列写作编辑系列;
window.updateSwSeries = window.系列写作更新系列;
window.deleteSwSeries = window.系列写作删除系列;