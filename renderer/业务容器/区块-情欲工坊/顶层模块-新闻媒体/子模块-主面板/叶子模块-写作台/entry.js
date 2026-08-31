// 新闻媒体 · ✍️ 写作台
var 新闻写作当前版块 = '';

function 新闻媒体渲染写作台(el) {
  if (!新闻媒体当前期号 || !新闻媒体当前期号.info) {
    el.innerHTML = '<div class="placeholder-text" style="padding:40px;text-align:center">请先在列表中选择要编辑的期号</div>';
    return;
  }
  var mk = 新闻媒体当前媒体;
  var issue = 新闻媒体当前期号;
  var isSegment = mk === 'tv' || mk === 'radio';
  var prgType = 新闻媒体当前节目 ? 新闻媒体当前节目.info.type : '';
  var cfg = 新闻获取类型配置(mk, prgType) || { sections: [] };
  if (!新闻写作当前版块 || cfg.sections.indexOf(新闻写作当前版块) < 0) 新闻写作当前版块 = cfg.sections[0] || '';

  var h = '<div style="display:flex;gap:0;height:calc(100vh - 240px)">';
  h += '<div style="width:160px;flex-shrink:0;overflow-y:auto;border-right:1px solid var(--border);padding:8px">';
  h += '<div style="font-size:11px;font-weight:600;color:var(--fg2);margin-bottom:8px">' + escHtml(新闻媒体当前节目 ? 新闻媒体当前节目.info.name : '') + '</div>';
  h += '<div style="font-size:10px;color:var(--fg3);margin-bottom:8px">' + (issue.info.episode ? '第' + issue.info.episode + '期' : '') + '</div>';
  cfg.sections.forEach(function(s) {
    h += '<div class="n-card" style="padding:8px;margin-bottom:4px;cursor:pointer;font-size:11px;' + (s === 新闻写作当前版块 ? 'border-color:var(--accent2);background:var(--bg2)' : '') + '" onclick="新闻写作切换版块(\'' + s + '\')">' + escHtml(s) + '</div>';
  });
  h += '</div>';
  h += '<div id="npEditSection" style="flex:1;overflow-y:auto;padding:12px"><div style="font-size:11px;color:var(--fg3)">加载中...</div></div></div>';
  el.innerHTML = h;
  新闻媒体加载版块(issue.dir, 新闻写作当前版块).then(function(data) { 新闻写作渲染版块(data); });
}

window.新闻写作切换版块 = function(section) {
  新闻写作当前版块 = section;
  var el = document.getElementById('npEditSection');
  if (el) el.innerHTML = '<div style="font-size:11px;color:var(--fg3)">加载中...</div>';
  新闻媒体加载版块(新闻媒体当前期号.dir, section).then(function(data) { 新闻写作渲染版块(data); });
};

function 新闻写作渲染版块(data) {
  var el = document.getElementById('npEditSection');
  if (!el) return;
  var issue = 新闻媒体当前期号;
  if (!issue) return;
  var mk = 新闻媒体当前媒体;
  var isSegment = mk === 'tv' || mk === 'radio';

  var h = '<div style="font-size:14px;font-weight:600;color:var(--fg);margin-bottom:12px">' + escHtml(新闻写作当前版块) + '</div>';

  if (isSegment) {
    var segments = (data && data.segments) || [];
    if (!segments.length) { h += '<div class="placeholder-text" style="margin-bottom:12px">暂无脚本</div><button class="btn-sm btn-main" onclick="新闻写作AI生成()">🤖 AI 生成</button>'; el.innerHTML = h; return; }
    segments.forEach(function(sg, i) {
      h += '<div class="n-card" style="margin-bottom:8px;padding:10px;border-left:3px solid var(--accent2)">';
      h += '<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px;font-size:10px;color:var(--fg3)">';
      h += '<input style="flex:1;font-size:11px;font-weight:600;color:var(--accent2);background:transparent;border:none" value="' + escHtml(sg.speaker || '') + '" placeholder="发言人" onchange="新闻写作更新(' + i + ',\'speaker\',this.value)">';
      h += '<span class="btn-sm" style="color:var(--accent2);cursor:pointer;font-size:10px" onclick="新闻写作AI生成(' + i + ')">🤖</span></div>';
      h += '<textarea class="llm-input" style="width:100%;min-height:60px;font-size:12px;color:var(--fg);resize:vertical" placeholder="内容" onchange="新闻写作更新(' + i + ',\'content\',this.value)">' + escHtml(sg.content || '') + '</textarea>';
      h += '<div style="margin-top:4px"><span class="btn-sm" style="font-size:10px;color:var(--error);cursor:pointer" onclick="新闻写作删除(' + i + ')">🗑 删除</span></div></div>';
    });
    h += '<div style="display:flex;gap:6px;margin-top:8px"><button class="btn-sm btn-main" onclick="新闻写作AI生成()">🤖 生成环节</button><button class="btn-sm btn-outline" onclick="新闻写作保存()">💾 保存</button><button class="btn-sm" style="color:var(--accent2)" onclick="新闻写作添加()">＋ 添加</button></div>';
  } else {
    var articles = (data && data.articles) || [];
    if (!articles.length) { h += '<div class="placeholder-text" style="margin-bottom:12px">暂无文章</div><button class="btn-sm btn-main" onclick="新闻写作AI生成()">🤖 AI 生成</button>'; el.innerHTML = h; return; }
    articles.forEach(function(a, i) {
      h += '<div class="n-card" style="margin-bottom:10px;padding:12px">';
      h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">';
      h += '<input class="llm-input" style="flex:1;font-size:13px;font-weight:600;background:transparent;border:none;color:var(--fg)" value="' + escHtml(a.title||'') + '" placeholder="标题" onchange="新闻写作更新(' + i + ',\'title\',this.value)">';
      h += '<span class="btn-sm" style="color:var(--accent2);cursor:pointer;font-size:10px" onclick="新闻写作AI生成(' + i + ')">🤖</span></div>';
      h += '<input class="llm-input" style="width:120px;font-size:11px;color:var(--accent2);background:transparent;border:none;margin-bottom:4px" value="' + escHtml(a.byline||'') + '" placeholder="记者" onchange="新闻写作更新(' + i + ',\'byline\',this.value)">';
      h += '<textarea class="llm-input" style="width:100%;min-height:50px;font-size:11px;color:var(--fg2);resize:vertical;margin-bottom:4px;background:var(--bg2)" placeholder="导语" onchange="新闻写作更新(' + i + ',\'lead\',this.value)">' + escHtml(a.lead||'') + '</textarea>';
      h += '<textarea class="llm-input" style="width:100%;min-height:120px;font-size:12px;color:var(--fg);resize:vertical;line-height:1.7" placeholder="正文" onchange="新闻写作更新(' + i + ',\'content\',this.value)">' + escHtml(a.content||'') + '</textarea>';
      h += '<div style="margin-top:4px"><span class="btn-sm" style="font-size:10px;color:var(--error);cursor:pointer" onclick="新闻写作删除(' + i + ')">🗑 删除</span></div></div>';
    });
    h += '<div style="display:flex;gap:6px;margin-top:8px"><button class="btn-sm btn-main" onclick="新闻写作AI生成()">🤖 生成文章</button><button class="btn-sm btn-outline" onclick="新闻写作保存()">💾 保存</button></div>';
  }
  el.innerHTML = h;
}

window.新闻写作更新 = function(idx, field, value) {
  新闻媒体加载版块(新闻媒体当前期号.dir, 新闻写作当前版块).then(function(data) {
    data = data || { section: 新闻写作当前版块, segments: [], articles: [] };
    var key = (mk === 'tv' || mk === 'radio') ? 'segments' : 'articles';
    if (!data[key][idx]) data[key][idx] = {};
    data[key][idx][field] = value;
    return 新闻媒体保存版块(新闻媒体当前期号.dir, 新闻写作当前版块, data);
  });
};
window.新闻写作删除 = function(idx) {
  confirmDialog('确定删除？', function() {
    新闻媒体加载版块(新闻媒体当前期号.dir, 新闻写作当前版块).then(function(data) {
      data = data || {};
      var key = (mk === 'tv' || mk === 'radio') ? 'segments' : 'articles';
      (data[key] || []).splice(idx, 1);
      return 新闻媒体保存版块(新闻媒体当前期号.dir, 新闻写作当前版块, data).then(function() { 新闻写作渲染版块(data); });
    });
  });
};
window.新闻写作添加 = function() {
  新闻媒体加载版块(新闻媒体当前期号.dir, 新闻写作当前版块).then(function(data) {
    data = data || { section: 新闻写作当前版块, segments: [] };
    if (!data.segments) data.segments = [];
    data.segments.push({ type: 'anchor_lead', speaker: '主持人', content: '' });
    return 新闻媒体保存版块(新闻媒体当前期号.dir, 新闻写作当前版块, data).then(function() { 新闻写作渲染版块(data); });
  });
};
window.新闻写作保存 = function() {
  新闻媒体加载版块(新闻媒体当前期号.dir, 新闻写作当前版块).then(function(data) {
    if (data) return 新闻媒体保存版块(新闻媒体当前期号.dir, 新闻写作当前版块, data);
  }).then(function() { toast('💾 已保存'); });
};
window.新闻写作AI生成 = function(itemIdx) {
  var issue = 新闻媒体当前期号;
  if (!issue) { toast('请先选择期号'); return; }
  var isSegment = mk === 'tv' || mk === 'radio';
  var cfg = 新闻获取类型配置(mk, (新闻媒体当前节目 ? 新闻媒体当前节目.info.type : '')) || {};
  var prompt = '名称：' + (新闻媒体当前节目 ? 新闻媒体当前节目.info.name : '') + '\n第' + (issue.info.episode || '?') + '期\n版块：' + 新闻写作当前版块 + '\n风格：' + (cfg.styleDesc||'') + '\n';
  if (itemIdx !== undefined) prompt += '\n请重新创作第' + (itemIdx+1) + '项。\n';
  var sys = isSegment
    ? (mk === 'tv' ? '你是一名电视编导。JSON格式：{"type":"环节类型","speaker":"发言人","content":"内容"}。type: anchor_lead/correspondent/interview/anchor_comment。内容100-300字。'
      : '你是一名电台编导。JSON格式：{"type":"环节类型","speaker":"发言人","content":"内容"}。type: dj_opener/news_read/phone_in/interview/music_interlude/dj_comment/closing。内容100-300字。')
    : '你是一名新闻编辑。JSON格式：{"title":"标题","byline":"记者","lead":"导语","content":"正文"}。正文100-300字。';
  toast('🤖 生成中...');
  LLM.callJSON({ prompt: prompt, system: sys, label: '写作生成', temperature: 0.85 }).then(function(data) {
    if (!data) { toast('生成失败'); return; }
    新闻媒体加载版块(issue.dir, 新闻写作当前版块).then(function(sectionData) {
      var key = isSegment ? 'segments' : 'articles';
      sectionData = sectionData || { section: 新闻写作当前版块 };
      sectionData[key] = sectionData[key] || [];
      if (itemIdx !== undefined) {
        if (!sectionData[key][itemIdx]) sectionData[key][itemIdx] = {};
        Object.keys(data).forEach(function(k) { if (data[k]) sectionData[key][itemIdx][k] = data[k]; });
      } else {
        sectionData[key].push(data);
      }
      return 新闻媒体保存版块(issue.dir, 新闻写作当前版块, sectionData).then(function() {
        新闻写作渲染版块(sectionData);
        toast('✅ 已生成');
      });
    });
  }).catch(function(err) { toast('❌ ' + err.message); });
};
window.新闻媒体渲染写作台 = 新闻媒体渲染写作台;
