// 黄图淫册 · ✍️ 写作台
var 图册写作当前版块 = '';

window.图册写作分页缓存 = []; // 连载漫画：分页编辑缓存

function 图册渲染写作台(el) {
  if (!图册当前期号 || !图册当前期号.info) {
    el.innerHTML = '<div class="placeholder-text" style="padding:40px;text-align:center">请先在列表中选择要编辑的期号</div>';
    return;
  }
  var mk = 图册当前载体;
  if (图册是否分页(mk)) { 图册写作渲染分页(el); return; }
  var issue = 图册当前期号;
  var cfg = 图册获取节目配置(图册当前节目 ? 图册当前节目.info.type : '', 图册当前节目 ? 图册当前节目.info.subtype : '');
  if (!图册写作当前版块 || cfg.sections.indexOf(图册写作当前版块) < 0) 图册写作当前版块 = cfg.sections[0] || '';

  var h = '<div style="display:flex;gap:0;height:calc(100vh - 240px)">';
  h += '<div style="width:160px;flex-shrink:0;overflow-y:auto;border-right:1px solid var(--border);padding:8px">';
  h += '<div style="font-size:11px;font-weight:600;color:var(--fg2);margin-bottom:8px">' + escHtml(图册当前节目 ? 图册当前节目.info.name : '') + '</div>';
  h += '<div style="font-size:10px;color:var(--fg3);margin-bottom:8px">' + (issue.info.episode ? '第' + issue.info.episode + '期' : '') + '</div>';
  cfg.sections.forEach(function(s) {
    h += '<div class="n-card" style="padding:8px;margin-bottom:4px;cursor:pointer;font-size:11px;' + (s === 图册写作当前版块 ? 'border-color:var(--accent2);background:var(--bg2)' : '') + '" onclick="图册写作切换版块(\'' + s + '\')">' + escHtml(s) + '</div>';
  });
  h += '</div>';
  h += '<div id="htEditSection" style="flex:1;overflow-y:auto;padding:12px"><div style="font-size:11px;color:var(--fg3)">加载中...</div></div></div>';
  el.innerHTML = h;
  图册加载版块(issue.dir, 图册写作当前版块).then(function(data) { 图册写作渲染版块(data); });
}

window.图册写作切换版块 = function(section) {
  图册写作当前版块 = section;
  var el = document.getElementById('htEditSection');
  if (el) el.innerHTML = '<div style="font-size:11px;color:var(--fg3)">加载中...</div>';
  图册加载版块(图册当前期号.dir, section).then(function(data) { 图册写作渲染版块(data); });
};

function 图册写作渲染版块(data) {
  var el = document.getElementById('htEditSection');
  if (!el) return;
  var issue = 图册当前期号;
  if (!issue) return;

  var h = '<div style="font-size:14px;font-weight:600;color:var(--fg);margin-bottom:12px">' + escHtml(图册写作当前版块) + '</div>';

  var segments = (data && data.segments) || [];
  if (!segments.length) { h += '<div class="placeholder-text" style="margin-bottom:12px">暂无画面</div><button class="btn-sm btn-main" onclick="图册写作AI生成()">🤖 AI 生成</button>'; el.innerHTML = h; return; }
  segments.forEach(function(sg, i) {
    h += '<div class="n-card" style="margin-bottom:8px;padding:10px;border-left:3px solid var(--accent2)">';
    h += '<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px;font-size:10px;color:var(--fg3)">';
    h += '<input style="flex:1;font-size:11px;font-weight:600;color:var(--accent2);background:transparent;border:none" value="' + escHtml(sg.speaker || '') + '" placeholder="角色 / 旁白" onchange="图册写作更新(' + i + ',\'speaker\',this.value)">';
    h += '<span class="btn-sm" style="color:var(--accent2);cursor:pointer;font-size:10px" onclick="图册写作AI生成(' + i + ')">🤖</span></div>';
    h += '<textarea class="llm-input" style="width:100%;min-height:80px;font-size:12px;color:var(--fg);resize:vertical;margin-bottom:6px" placeholder="画面描述（这格画的是什么）" onchange="图册写作更新(' + i + ',\'visual\',this.value)">' + escHtml(sg.visual || '') + '</textarea>';
    h += '<textarea class="llm-input" style="width:100%;min-height:50px;font-size:12px;color:var(--fg2);resize:vertical" placeholder="台词 / 旁白（对话框或图注文字）" onchange="图册写作更新(' + i + ',\'content\',this.value)">' + escHtml(sg.content || '') + '</textarea>';
    h += '<div style="margin-top:4px"><span class="btn-sm" style="font-size:10px;color:var(--error);cursor:pointer" onclick="图册写作删除(' + i + ')">🗑 删除</span></div></div>';
  });
  h += '<div style="display:flex;gap:6px;margin-top:8px"><button class="btn-sm btn-main" onclick="图册写作AI生成()">🤖 生成画面</button><button class="btn-sm btn-outline" onclick="图册写作保存()">💾 保存</button><button class="btn-sm" style="color:var(--accent2)" onclick="图册写作添加()">＋ 添加</button></div>';
  el.innerHTML = h;
}

window.图册写作更新 = function(idx, field, value) {
  图册加载版块(图册当前期号.dir, 图册写作当前版块).then(function(data) {
    data = data || { section: 图册写作当前版块, segments: [] };
    if (!data.segments[idx]) data.segments[idx] = {};
    data.segments[idx][field] = value;
    return 图册保存版块(图册当前期号.dir, 图册写作当前版块, data);
  });
};

window.图册写作删除 = function(idx) {
  confirmDialog('确定删除这个画面？', function() {
    图册加载版块(图册当前期号.dir, 图册写作当前版块).then(function(data) {
      data = data || {};
      (data.segments || []).splice(idx, 1);
      return 图册保存版块(图册当前期号.dir, 图册写作当前版块, data).then(function() { 图册写作渲染版块(data); });
    });
  });
};

window.图册写作添加 = function() {
  图册加载版块(图册当前期号.dir, 图册写作当前版块).then(function(data) {
    data = data || { section: 图册写作当前版块, segments: [] };
    if (!data.segments) data.segments = [];
    data.segments.push({ speaker: '旁白', visual: '', content: '' });
    return 图册保存版块(图册当前期号.dir, 图册写作当前版块, data).then(function() { 图册写作渲染版块(data); });
  });
};

window.图册写作保存 = function() {
  图册加载版块(图册当前期号.dir, 图册写作当前版块).then(function(data) {
    if (data) return 图册保存版块(图册当前期号.dir, 图册写作当前版块, data);
  }).then(function() { toast('💾 已保存'); });
};

window.图册写作AI生成 = function(itemIdx) {
  var issue = 图册当前期号;
  if (!issue) { toast('请先选择期号'); return; }
  var cfg = 图册获取节目配置(图册当前节目 ? 图册当前节目.info.type : '', 图册当前节目 ? 图册当前节目.info.subtype : '');
  var prompt = '名称：' + (图册当前节目 ? 图册当前节目.info.name : '') + '\n';
  if (!图册是否单张(图册当前载体)) prompt += '第' + (issue.info.episode || '?') + '期\n';
  prompt += '板块：' + 图册写作当前版块 + '\n风格：' + (cfg.styleDesc || '') + '\n';
  if (itemIdx !== undefined) prompt += '\n请重新创作第' + (itemIdx + 1) + '项。\n';
  var sys = '你是一名极致细腻的情色画师/分镜师。JSON格式：{"speaker":"角色名或旁白","visual":"画面描述","content":"台词或旁白文字"}。visual必须是极其精准、高度细腻、毫无遗漏的完整画面描述：写清构图与视角、人物数量与站位、每个角色的姿态/朝向/面部表情/眼神、发型与发丝走向、服饰与材质、裸露部位与性器官细节、身体接触与体位、肢体动作、光影与色调、背景环境、氛围与空气感，以及一切细节（汗珠、体液、水渍、布料皱褶、饰品、纹身等）。禁止笼统概括或遗漏任何可见内容，宁可具体而长。content为该画面的台词或旁白，适当长度。';
  toast('🤖 生成中...');
  LLM.callJSON({ prompt: prompt, system: sys, label: '图册写作生成', temperature: 0.85 }).then(function(data) {
    if (!data) { toast('生成失败'); return; }
    图册加载版块(issue.dir, 图册写作当前版块).then(function(sectionData) {
      sectionData = sectionData || { section: 图册写作当前版块 };
      sectionData.segments = sectionData.segments || [];
      if (itemIdx !== undefined) {
        if (!sectionData.segments[itemIdx]) sectionData.segments[itemIdx] = {};
        Object.keys(data).forEach(function(k) { if (data[k]) sectionData.segments[itemIdx][k] = data[k]; });
      } else { sectionData.segments.push(data); }
      return 图册保存版块(issue.dir, 图册写作当前版块, sectionData).then(function() { 图册写作渲染版块(sectionData); toast('✅ 已生成'); });
    });
  }).catch(function(err) { toast('❌ ' + err.message); });
};

// ===== 连载漫画：分页写作台（页 → 格） =====
function 图册写作渲染分页(el) {
  var issue = 图册当前期号;
  var h = '<div style="display:flex;gap:0;height:calc(100vh - 240px)">';
  h += '<div style="width:160px;flex-shrink:0;overflow-y:auto;border-right:1px solid var(--border);padding:8px">';
  h += '<div style="font-size:11px;font-weight:600;color:var(--fg2);margin-bottom:8px">' + escHtml(图册当前节目 ? 图册当前节目.info.name : '') + '</div>';
  h += '<div style="font-size:10px;color:var(--fg3);margin-bottom:8px">' + (issue.info.episode ? '第' + issue.info.episode + '期' : '') + '</div>';
  h += '<div id="图册写作分页导航" style="display:flex;flex-direction:column;gap:4px"></div>';
  h += '<button class="btn-sm btn-outline" style="font-size:11px;margin-top:6px;width:100%" onclick="图册写作分页加页()">＋ 添加一页</button>';
  h += '</div>';
  h += '<div id="图册写作分页主体" style="flex:1;overflow-y:auto;padding:12px"><div style="font-size:11px;color:var(--fg3)">加载中...</div></div></div>';
  el.innerHTML = h;
  图册加载期号分页(issue.dir).then(function(pages) {
    window.图册写作分页缓存 = (pages && pages.length) ? pages : [ { description: '', panels: [ { description: '', dialogue: '' } ] } ];
    window.图册写作分页当前索引 = 0;
    图册写作分页渲染导航();
    图册写作分页渲染主体(0);
  });
}

window.图册写作分页渲染导航 = function() {
  var nav = document.getElementById('图册写作分页导航');
  if (!nav) return;
  var cur = window.图册写作分页当前索引 || 0;
  nav.innerHTML = (window.图册写作分页缓存 || []).map(function(p, i) {
    return '<div class="n-card" style="padding:8px;margin-bottom:4px;cursor:pointer;font-size:11px;' + (i === cur ? 'border-color:var(--accent2);background:var(--bg2)' : '') + '" onclick="图册写作分页切页(' + i + ')">📄 第' + (i + 1) + '页</div>';
  }).join('');
};

window.图册写作分页切页 = function(i) {
  window.图册写作分页当前索引 = i;
  图册写作分页渲染导航();
  图册写作分页渲染主体(i);
};

window.图册写作分页渲染主体 = function(i) {
  var body = document.getElementById('图册写作分页主体');
  if (!body) return;
  var pages = window.图册写作分页缓存 || [];
  if (!pages[i]) { body.innerHTML = '<div style="font-size:11px;color:var(--fg3)">该页不存在</div>'; return; }
  var p = pages[i];
  var h = '<div style="font-size:14px;font-weight:600;color:var(--fg);margin-bottom:8px">📄 第' + (i + 1) + '页</div>';
  h += '<div class="n-card" style="padding:10px;background:var(--bg2)">';
  h += '<div style="font-size:11px;font-weight:600;color:var(--accent2);margin-bottom:4px">本页整张图片</div>';
  h += '<textarea class="llm-input" style="width:100%;min-height:56px;font-size:11px;resize:vertical" placeholder="本页画面描述（整张图片内容、构图、人物与场景）" oninput="图册写作分页更新页(' + i + ',\'description\',this.value)">' + escHtml(p.description || '') + '</textarea>';
  h += '</div>';
  (p.panels || []).forEach(function(g, gi) {
    h += '<div class="n-card" style="padding:10px;margin-top:6px;background:var(--bg1);border-left:3px solid var(--accent2)">';
    h += '<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px"><span style="font-size:11px;font-weight:600;color:var(--accent2)">格 ' + (gi + 1) + '</span><span class="btn-sm" style="font-size:10px;color:var(--accent2);cursor:pointer" onclick="图册写作分页AI格(' + i + ',' + gi + ')">🤖</span><span class="btn-sm" style="font-size:10px;color:var(--error);cursor:pointer" onclick="图册写作分页删格(' + i + ',' + gi + ')">🗑 删格</span></div>';
    h += '<textarea class="llm-input" style="width:100%;min-height:80px;font-size:12px;resize:vertical;margin-bottom:6px" placeholder="这一格的画面描述（本格画什么）" onchange="图册写作分页更新格(' + i + ',' + gi + ',\'description\',this.value)">' + escHtml(g.description || '') + '</textarea>';
    h += '<input class="llm-input" style="width:100%;font-size:12px;color:var(--fg2)" placeholder="台词 / 旁白（本格对话框或图注）" value="' + escHtml(g.dialogue || '') + '" onchange="图册写作分页更新格(' + i + ',' + gi + ',\'dialogue\',this.value)">';
    h += '</div>';
  });
  h += '<div style="display:flex;gap:6px;margin-top:8px"><button class="btn-sm btn-outline" onclick="图册写作分页加格(' + i + ')">＋ 添加一格</button><button class="btn-sm btn-outline" onclick="图册写作分页加页()">＋ 添加一页</button></div>';
  body.innerHTML = h;
};

window.图册写作分页加页 = function() {
  window.图册写作分页缓存.push({ description: '', panels: [ { description: '', dialogue: '' } ] });
  window.图册写作分页当前索引 = window.图册写作分页缓存.length - 1;
  图册写作分页渲染导航();
  图册写作分页渲染主体(window.图册写作分页当前索引);
  图册写作分页保存();
};
window.图册写作分页加格 = function(i) {
  var pages = window.图册写作分页缓存;
  if (!pages[i]) return;
  if (!pages[i].panels) pages[i].panels = [];
  pages[i].panels.push({ description: '', dialogue: '' });
  图册写作分页渲染主体(window.图册写作分页当前索引 || 0);
  图册写作分页保存();
};
window.图册写作分页删格 = function(i, gi) {
  var pages = window.图册写作分页缓存;
  if (pages[i] && pages[i].panels) pages[i].panels.splice(gi, 1);
  图册写作分页渲染主体(window.图册写作分页当前索引 || 0);
  图册写作分页保存();
};
window.图册写作分页更新页 = function(i, field, val) {
  var pages = window.图册写作分页缓存;
  if (!pages[i]) return;
  pages[i][field] = val;
  图册写作分页保存();
};
window.图册写作分页更新格 = function(i, gi, field, val) {
  var pages = window.图册写作分页缓存;
  if (pages[i] && pages[i].panels && pages[i].panels[gi]) pages[i].panels[gi][field] = val;
  图册写作分页保存();
};
window.图册写作分页保存 = function() {
  var issue = 图册当前期号;
  if (!issue) return Promise.resolve();
  return 图册保存期号分页(issue.dir, (window.图册写作分页缓存 || []).map(function(p) { return { description: p.description || '', panels: (p.panels || []).map(function(g) { return { description: g.description || '', dialogue: g.dialogue || '' }; }) }; }));
};
window.图册写作分页AI格 = function(i, gi) {
  var pages = window.图册写作分页缓存;
  if (!pages[i] || !pages[i].panels || !pages[i].panels[gi]) return;
  var g = pages[i].panels[gi];
  var cfg = 图册获取节目配置(图册当前节目 ? 图册当前节目.info.type : '', 图册当前节目 ? 图册当前节目.info.subtype : '');
  var prompt = '名称：' + (图册当前节目 ? 图册当前节目.info.name : '') + '\n第' + ((图册当前期号 && 图册当前期号.info.episode) || '?') + '期\n第' + (i + 1) + '页 第' + (gi + 1) + '格\n风格：' + (cfg.styleDesc || '') + '\n本页：' + (pages[i].description || '') + '\n';
  var sys = '你是一名极致细腻的情色画师/漫画分镜师。JSON格式：{"description":"这一格的画面描述","dialogue":"台词/旁白"}。描述要极其精准、高度细腻、毫无遗漏：构图与视角、人物姿态/朝向/表情/眼神、服饰与材质、裸露部位与性器官细节、身体接触与体位、光影与色调、背景环境、氛围，以及汗珠、体液、水渍、布料皱褶、饰品、纹身等一切细节。禁止笼统概括或遗漏。';
  toast('🤖 生成中...');
  LLM.callJSON({ prompt: prompt, system: sys, label: '图册写作分格生成', temperature: 0.85 }).then(function(data) {
    if (!data) { toast('生成失败'); return; }
    if (data.description) pages[i].panels[gi].description = data.description;
    if (data.dialogue) pages[i].panels[gi].dialogue = data.dialogue;
    图册写作分页渲染主体(window.图册写作分页当前索引 || 0);
    图册写作分页保存();
    toast('✅ 已生成');
  }).catch(function(err) { toast('❌ ' + err.message); });
};

window.图册渲染写作台 = 图册渲染写作台;
