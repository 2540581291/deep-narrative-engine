// 系列写作 · 写作台（带系列统一参考 + AI 生成）
function renderSwWriting(el) {
  if (!swActiveSeries) { el.innerHTML = '<div class="placeholder-text">请先选择一个系列</div>'; return; }
  Store.seriesWriting.get(swActiveSeries).then(function(data) {
    var vols = data.volumes || [];
    var h = '<div class="mb-8 flex justify-between items-center">';
    h += '<div><span class="fw-600">✍️ ' + escHtml(swActiveSeries) + '</span></div>';
    h += '<div class="btn-secondary btn-sm" onclick="系列写作切换标签(\'outline\')">← 大纲</div></div>';

    // Series reference (collapsible)
    var hasRef = data.style || data.keySettings || data.writingRules || data.premise;
    if (hasRef) {
      h += '<div class="n-card" style="margin-bottom:8px;font-size:12px">';
      h += '<div style="font-weight:600;cursor:pointer" onclick="var p=this.nextElementSibling;p.style.display=p.style.display===\'none\'?\'\':\'none\'">📖 系列参考 ▾</div>';
      h += '<div style="margin-top:4px;display:none">';
      if (data.premise) h += '<div class="text-muted">设定：' + escHtml(data.premise) + '</div>';
      if (data.style) h += '<div class="text-muted">基调：<span class="c-accent">' + escHtml(data.style) + '</span></div>';
      if (data.keySettings) h += '<div class="text-muted">关键设定：' + escHtml(data.keySettings) + '</div>';
      if (data.writingRules) h += '<div class="text-muted">写作规则：' + escHtml(data.writingRules) + '</div>';
      if (data.characters && data.characters.length) {
        h += '<div class="text-muted">角色：' + data.characters.map(function(c){return escHtml(c.name);}).join('、') + '</div>';
      }
      h += '</div></div>';
    }

    // Volume + writing area
    h += '<div class="form-group"><label>选择分卷</label><select class="llm-input" id="swWritingVol" class="w-100">';
    vols.forEach(function(v, i) { h += '<option value="' + i + '">第' + (i+1) + '卷 · ' + escHtml(v.title||'') + '</option>'; });
    if (!vols.length) h += '<option value="-1">暂无分卷</option>';
    h += '</select></div>';

    h += '<div class="form-group"><label>章节标题</label><input class="llm-input" id="swWritingTitle" placeholder="章节/片段标题"></div>';
    h += '<div class="form-group"><label>正文</label><textarea class="llm-input" id="系列写作写作内容" style="min-height:350px;resize:vertical;width:100%;font-size:14px;line-height:1.8"></textarea></div>';
    h += '<div class="flex gap-6 flex-wrap"><button class="btn" onclick="系列写作保存写作()">💾 保存</button>';
    h += '<button class="btn-secondary btn-sm" onclick="swLoadWriting()">📂 载入已有</button>';
    h += '<button class="btn-sm bg-accent" onclick="openAiGenPanel(\'swGen\')">🚀 AI</button></div>';
    h += '<div id="swWritingSaved" class="text-sm text-muted" style="margin-top:6px"></div>';

    el.innerHTML = h;
    swLoadWritingList();
  });
}

// 注册二元模板：AI 生成（注入系列统一方向）
if (typeof registerAiField !== 'undefined') {
  registerAiField('swGen', '系列章节生成', function() {
    var title = document.getElementById('swWritingTitle').value.trim() || '未命名章节';
    var direction = '';
    var seriesRef = '';
    return Store.seriesWriting.get(swActiveSeries).then(function(data) {
      if (data) {
        if (data.premise) seriesRef += '系列设定：' + data.premise + '\n';
        if (data.style) seriesRef += '风格基调：' + data.style + '\n';
        if (data.keySettings) seriesRef += '关键设定：' + data.keySettings + '\n';
        if (data.writingRules) seriesRef += '写作规则：' + data.writingRules + '\n';
        if (data.characters && data.characters.length) {
          seriesRef += '角色表：' + data.characters.map(function(c){return c.name + (c.role?'('+c.role+')':'');}).join('、') + '\n';
        }
      }
      var ctx = '标题：' + title + '\n' + seriesRef;
      if (direction) ctx += '\n方向：' + direction;
      var r = renderPrompt('series_chapter_gen', { ctx: ctx });
      return { user: r.user, system: r.system };
    });
  }, { fillFn: function(d) {
    if (!d) return;
    document.getElementById('swWritingTitle').value = d.title || '';
    document.getElementById('系列写作写作内容').value = d.content || '';
    toast('AI 内容已填充');
  }});
}

function 系列写作保存写作() {
  var volIdx = parseInt(document.getElementById('swWritingVol').value);
  var title = document.getElementById('swWritingTitle').value.trim();
  var content = document.getElementById('系列写作写作内容').value.trim();
  if (!title) { toast('请输入标题'); return; }
  Store.seriesWriting.get(swActiveSeries).then(function(data) {
    var writings = data.writings || {};
    var key = volIdx + ':' + title;
    writings[key] = { title: title, content: content, volIdx: volIdx, updated: new Date().toISOString().slice(0,10) };
    data.writings = writings;
    // Update volume word count
    var vols = data.volumes || [];
    if (vols[volIdx]) vols[volIdx].wordCount = (vols[volIdx].wordCount || 0) + content.length;
    Store.seriesWriting.save(swActiveSeries, data).then(function() {
      document.getElementById('swWritingSaved').textContent = '已保存：' + title;
      toast('已保存');
      swLoadWritingList();
    });
  });
}
window.系列写作保存写作 = 系列写作保存写作;

function swLoadWritingList() {
  Store.seriesWriting.get(swActiveSeries).then(function(data) {
    var writings = data.writings || {};
    var el = document.getElementById('swWritingSaved');
    if (!el) return;
    var keys = Object.keys(writings).sort();
    if (!keys.length) { return; }
    var h = '<div class="mt-8"><div class="text-sm" style="font-weight:600;margin-bottom:4px">已保存的章节</div>';
    keys.forEach(function(k) {
      var w = writings[k];
      h += '<div class="sw-writing-item" style="cursor:pointer;padding:4px 6px;border-radius:4px;font-size:12px" onclick="系列写作打开写作(\'' + escHtml(k) + '\')">📄 ' + escHtml(w.title) + ' <span class="text-xs text-muted">' + (w.updated||'') + '</span></div>';
    });
    h += '</div>';
    var existing = document.getElementById('swWritingListContainer');
    if (existing) existing.innerHTML = h;
    else {
      var container = document.createElement('div');
      container.id = 'swWritingListContainer';
      el.parentNode.appendChild(container);
      container.innerHTML = h;
    }
  });
}

function 系列写作打开写作(key) {
  Store.seriesWriting.get(swActiveSeries).then(function(data) {
    var w = (data.writings||{})[key];
    if (!w) return;
    var sel = document.getElementById('swWritingVol');
    if (sel) sel.value = w.volIdx;
    document.getElementById('swWritingTitle').value = w.title;
    document.getElementById('系列写作写作内容').value = w.content;
  });
}
window.系列写作打开写作 = 系列写作打开写作;

window.swSaveWriting = window.系列写作保存写作;
window.swOpenWriting = window.系列写作打开写作;