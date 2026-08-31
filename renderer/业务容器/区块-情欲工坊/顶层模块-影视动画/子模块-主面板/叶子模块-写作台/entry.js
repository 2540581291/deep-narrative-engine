// 影视动画 · ✍️ 写作台
var 影视写作当前版块 = '';

function 影视渲染写作台(el) {
  if (!影视当前期号 || !影视当前期号.info) {
    el.innerHTML = '<div class="placeholder-text" style="padding:40px;text-align:center">请先在列表中选择要编辑的期号</div>';
    return;
  }
  var mk = 影视当前类型;
  var issue = 影视当前期号;
  var prgType = 影视当前节目 ? 影视当前节目.info.type : '';
  var cfg = 影视内容类型[prgType] || { sections: [] };
  if (!影视写作当前版块 || cfg.sections.indexOf(影视写作当前版块) < 0) 影视写作当前版块 = cfg.sections[0] || '';

  var h = '<div style="display:flex;gap:0;height:calc(100vh - 240px)">';
  h += '<div style="width:160px;flex-shrink:0;overflow-y:auto;border-right:1px solid var(--border);padding:8px">';
  h += '<div style="font-size:11px;font-weight:600;color:var(--fg2);margin-bottom:8px">' + escHtml(影视当前节目 ? 影视当前节目.info.name : '') + '</div>';
  h += '<div style="font-size:10px;color:var(--fg3);margin-bottom:8px">' + (issue.info.episode ? '第' + issue.info.episode + '期' : '') + '</div>';
  cfg.sections.forEach(function(s) {
    h += '<div class="n-card" style="padding:8px;margin-bottom:4px;cursor:pointer;font-size:11px;' + (s === 影视写作当前版块 ? 'border-color:var(--accent2);background:var(--bg2)' : '') + '" onclick="影视写作切换版块(\'' + s + '\')">' + escHtml(s) + '</div>';
  });
  h += '</div>';
  h += '<div id="ysEditSection" style="flex:1;overflow-y:auto;padding:12px"><div style="font-size:11px;color:var(--fg3)">加载中...</div></div></div>';
  el.innerHTML = h;
  影视加载版块(issue.dir, 影视写作当前版块).then(function(data) { 影视写作渲染版块(data); });
}

window.影视写作切换版块 = function(section) {
  影视写作当前版块 = section;
  var el = document.getElementById('ysEditSection');
  if (el) el.innerHTML = '<div style="font-size:11px;color:var(--fg3)">加载中...</div>';
  影视加载版块(影视当前期号.dir, section).then(function(data) { 影视写作渲染版块(data); });
};

function 影视写作渲染版块(data) {
  var el = document.getElementById('ysEditSection');
  if (!el) return;
  var issue = 影视当前期号;
  if (!issue) return;
  var mk = 影视当前类型;

  var h = '<div style="font-size:14px;font-weight:600;color:var(--fg);margin-bottom:12px">' + escHtml(影视写作当前版块) + '</div>';

  var segments = (data && data.segments) || [];
  if (!segments.length) { h += '<div class="placeholder-text" style="margin-bottom:12px">暂无脚本</div><button class="btn-sm btn-main" onclick="影视写作AI生成()">🤖 AI 生成</button>'; el.innerHTML = h; return; }
  segments.forEach(function(sg, i) {
    h += '<div class="n-card" style="margin-bottom:8px;padding:10px;border-left:3px solid var(--accent2)">';
    h += '<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px;font-size:10px;color:var(--fg3)">';
    h += '<input style="flex:1;font-size:11px;font-weight:600;color:var(--accent2);background:transparent;border:none" value="' + escHtml(sg.speaker || '') + '" placeholder="发言人" onchange="影视写作更新(' + i + ',\'speaker\',this.value)">';
    h += '<span class="btn-sm" style="color:var(--accent2);cursor:pointer;font-size:10px" onclick="影视写作AI生成(' + i + ')">🤖</span></div>';
    h += '<textarea class="llm-input" style="width:100%;min-height:60px;font-size:12px;color:var(--fg);resize:vertical" placeholder="内容" onchange="影视写作更新(' + i + ',\'content\',this.value)">' + escHtml(sg.content || '') + '</textarea>';
    h += '<div style="margin-top:4px"><span class="btn-sm" style="font-size:10px;color:var(--error);cursor:pointer" onclick="影视写作删除(' + i + ')">🗑 删除</span></div></div>';
  });
  h += '<div style="display:flex;gap:6px;margin-top:8px"><button class="btn-sm btn-main" onclick="影视写作AI生成()">🤖 生成环节</button><button class="btn-sm btn-outline" onclick="影视写作保存()">💾 保存</button><button class="btn-sm" style="color:var(--accent2)" onclick="影视写作添加()">＋ 添加</button></div>';
  el.innerHTML = h;
}

window.影视写作更新 = function(idx, field, value) {
  var mk = 影视当前类型;
  影视加载版块(影视当前期号.dir, 影视写作当前版块).then(function(data) {
    data = data || { section: 影视写作当前版块, segments: [] };
    if (!data.segments[idx]) data.segments[idx] = {};
    data.segments[idx][field] = value;
    return 影视保存版块(影视当前期号.dir, 影视写作当前版块, data);
  });
};

window.影视写作删除 = function(idx) {
  confirmDialog('确定删除？', function() {
  var mk = 影视当前类型;
  影视加载版块(影视当前期号.dir, 影视写作当前版块).then(function(data) {
    data = data || {};
    (data.segments || []).splice(idx, 1);
    return 影视保存版块(影视当前期号.dir, 影视写作当前版块, data).then(function() { 影视写作渲染版块(data); });
  });
  });
};

window.影视写作添加 = function() {
  影视加载版块(影视当前期号.dir, 影视写作当前版块).then(function(data) {
    data = data || { section: 影视写作当前版块, segments: [] };
    if (!data.segments) data.segments = [];
    data.segments.push({ type: 'scene_opener', speaker: '旁白', content: '' });
    return 影视保存版块(影视当前期号.dir, 影视写作当前版块, data).then(function() { 影视写作渲染版块(data); });
  });
};

window.影视写作保存 = function() {
  影视加载版块(影视当前期号.dir, 影视写作当前版块).then(function(data) {
    if (data) return 影视保存版块(影视当前期号.dir, 影视写作当前版块, data);
  }).then(function() { toast('💾 已保存'); });
};

window.影视写作AI生成 = function(itemIdx) {
  var issue = 影视当前期号;
  if (!issue) { toast('请先选择期号'); return; }
  var mk = 影视当前类型;
  var cfg = 影视内容类型[(影视当前节目 ? 影视当前节目.info.type : '')] || {};
  var prompt = '名称：' + (影视当前节目 ? 影视当前节目.info.name : '') + '\n第' + (issue.info.episode || '?') + '期\n段落：' + 影视写作当前版块 + '\n风格：' + (cfg.styleDesc||'') + '\n';
  if (itemIdx !== undefined) prompt += '\n请重新创作第' + (itemIdx+1) + '项。\n';
  var sys = '你是一名影视编导。JSON格式：{"type":"环节类型","speaker":"发言人","content":"内容"}。type: scene_opener/dialogue/erotica/narration/closing。内容100-300字。';
  toast('🤖 生成中...');
  LLM.callJSON({ prompt: prompt, system: sys, label: '影视写作生成', temperature: 0.85 }).then(function(data) {
    if (!data) { toast('生成失败'); return; }
    影视加载版块(issue.dir, 影视写作当前版块).then(function(sectionData) {
      sectionData = sectionData || { section: 影视写作当前版块 };
      sectionData.segments = sectionData.segments || [];
      if (itemIdx !== undefined) {
        if (!sectionData.segments[itemIdx]) sectionData.segments[itemIdx] = {};
        Object.keys(data).forEach(function(k) { if (data[k]) sectionData.segments[itemIdx][k] = data[k]; });
      } else { sectionData.segments.push(data); }
      return 影视保存版块(issue.dir, 影视写作当前版块, sectionData).then(function() { 影视写作渲染版块(sectionData); toast('✅ 已生成'); });
    });
  }).catch(function(err) { toast('❌ ' + err.message); });
};

window.影视渲染写作台 = 影视渲染写作台;
