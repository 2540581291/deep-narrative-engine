// 黄游拔作 · ✍️ 写作台（直接编辑当前游戏的词条版块）
var 黄游写作当前版块 = '';

function 黄游渲染写作台(el) {
  if (!黄游当前游戏) {
    el.innerHTML = '<div class="placeholder-text" style="padding:40px;text-align:center">请先在列表中进入一款游戏，再用写作台编辑它的词条版块</div>';
    return;
  }
  var cat = 黄游当前分类;
  var 游戏 = 黄游当前游戏;
  var cfg = 黄游获取词条配置(游戏.info.type, 游戏.info.subtype);
  if (!黄游写作当前版块 || (cfg.sections || []).indexOf(黄游写作当前版块) < 0) 黄游写作当前版块 = (cfg.sections || [])[0] || '';

  var h = '<div style="display:flex;gap:0;height:calc(100vh - 240px)">';
  h += '<div style="width:160px;flex-shrink:0;overflow-y:auto;border-right:1px solid var(--border);padding:8px">';
  h += '<div style="font-size:11px;font-weight:600;color:var(--fg2);margin-bottom:8px">' + escHtml(游戏.info.name) + '</div>';
  (cfg.sections || []).forEach(function(s) {
    h += '<div class="n-card" style="padding:8px;margin-bottom:4px;cursor:pointer;font-size:11px;' + (s === 黄游写作当前版块 ? 'border-color:var(--accent2);background:var(--bg2)' : '') + '" onclick="黄游写作切换版块(\'' + s + '\')">' + escHtml(s) + '</div>';
  });
  h += '</div>';
  h += '<div id="yyEditSection" style="flex:1;overflow-y:auto;padding:12px"><div style="font-size:11px;color:var(--fg3)">加载中...</div></div></div>';
  el.innerHTML = h;
  黄游加载版块(cat, 游戏.name, 黄游写作当前版块).then(function(data) { 黄游写作渲染版块(data); });
}

window.黄游写作切换版块 = function(section) {
  黄游写作当前版块 = section;
  var el = document.getElementById('yyEditSection');
  if (el) el.innerHTML = '<div style="font-size:11px;color:var(--fg3)">加载中...</div>';
  黄游加载版块(黄游当前分类, 黄游当前游戏 ? 黄游当前游戏.name : '', section).then(function(data) { 黄游写作渲染版块(data); });
};

function 黄游写作渲染版块(data) {
  var el = document.getElementById('yyEditSection');
  if (!el) return;
  var h = '<div style="font-size:14px;font-weight:600;color:var(--fg);margin-bottom:12px">' + escHtml(黄游写作当前版块) + '</div>';
  var segments = (data && data.segments) || [];
  if (!segments.length) { h += '<div class="placeholder-text" style="margin-bottom:12px">暂无内容</div><button class="btn-sm btn-main" onclick="黄游写作AI生成()">🤖 AI 生成</button>'; el.innerHTML = h; return; }
  segments.forEach(function(sg, i) {
    h += '<div class="n-card" style="margin-bottom:8px;padding:10px;border-left:3px solid var(--accent2)">';
    h += '<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px;font-size:10px;color:var(--fg3)">';
    h += '<input style="flex:1;font-size:11px;font-weight:600;color:var(--accent2);background:transparent;border:none" value="' + escHtml(sg.speaker || '') + '" placeholder="小标题/字段" onchange="黄游写作更新(' + i + ',\'speaker\',this.value)">';
    h += '<span class="btn-sm" style="color:var(--accent2);cursor:pointer;font-size:10px" onclick="黄游写作AI生成(' + i + ')">🤖</span></div>';
    h += '<textarea class="llm-input" style="width:100%;min-height:60px;font-size:12px;color:var(--fg);resize:vertical" placeholder="内容" onchange="黄游写作更新(' + i + ',\'content\',this.value)">' + escHtml(sg.content || '') + '</textarea>';
    h += '<div style="margin-top:4px"><span class="btn-sm" style="font-size:10px;color:var(--error);cursor:pointer" onclick="黄游写作删除(' + i + ')">🗑 删除</span></div></div>';
  });
  h += '<div style="display:flex;gap:6px;margin-top:8px"><button class="btn-sm btn-main" onclick="黄游写作AI生成()">🤖 生成内容</button><button class="btn-sm btn-outline" onclick="黄游写作保存()">💾 保存</button><button class="btn-sm" style="color:var(--accent2)" onclick="黄游写作添加()">＋ 添加</button></div>';
  el.innerHTML = h;
}

window.黄游写作更新 = function(idx, field, value) {
  黄游加载版块(黄游当前分类, 黄游当前游戏.name, 黄游写作当前版块).then(function(data) {
    data = data || { section: 黄游写作当前版块, segments: [] };
    if (!data.segments[idx]) data.segments[idx] = {};
    data.segments[idx][field] = value;
    return 黄游保存版块(黄游当前分类, 黄游当前游戏.name, 黄游写作当前版块, data);
  });
};

window.黄游写作删除 = function(idx) {
  if (!confirm('确定删除？')) return;
  黄游加载版块(黄游当前分类, 黄游当前游戏.name, 黄游写作当前版块).then(function(data) {
    data = data || {};
    (data.segments || []).splice(idx, 1);
    return 黄游保存版块(黄游当前分类, 黄游当前游戏.name, 黄游写作当前版块, data).then(function() { 黄游写作渲染版块(data); });
  });
};

window.黄游写作添加 = function() {
  黄游加载版块(黄游当前分类, 黄游当前游戏.name, 黄游写作当前版块).then(function(data) {
    data = data || { section: 黄游写作当前版块, segments: [] };
    if (!data.segments) data.segments = [];
    data.segments.push({ type: 'content', speaker: '小标题', content: '' });
    return 黄游保存版块(黄游当前分类, 黄游当前游戏.name, 黄游写作当前版块, data).then(function() { 黄游写作渲染版块(data); });
  });
};

window.黄游写作保存 = function() {
  黄游加载版块(黄游当前分类, 黄游当前游戏.name, 黄游写作当前版块).then(function(data) {
    if (data) return 黄游保存版块(黄游当前分类, 黄游当前游戏.name, 黄游写作当前版块, data);
  }).then(function() { toast('💾 已保存'); });
};

window.黄游写作AI生成 = function(itemIdx) {
  var 游戏 = 黄游当前游戏;
  if (!游戏) { toast('请先进入游戏'); return; }
  var cfg = 黄游获取词条配置(游戏.info.type, 游戏.info.subtype);
  var prompt = '游戏名称：' + 游戏.info.name + '\n版块：' + 黄游写作当前版块 + '\n风格：' + (cfg.styleDesc || '') + '\n整体简介：' + (游戏.info.description || '') + '\n';
  if (itemIdx !== undefined) prompt += '\n请重新创作第' + (itemIdx + 1) + '项。\n';
  var sys = '你是一名黄油图鉴编纂专家。JSON格式：{"type":"内容类型","speaker":"小标题/字段","content":"内容"}。内容够拔、详实。';
  toast('🤖 生成中...');
  LLM.callJSON({ prompt: prompt, system: sys, label: '图鉴词条生成', temperature: 0.85 }).then(function(data) {
    if (!data) { toast('生成失败'); return; }
    黄游加载版块(黄游当前分类, 游戏.name, 黄游写作当前版块).then(function(sectionData) {
      sectionData = sectionData || { section: 黄游写作当前版块 };
      sectionData.segments = sectionData.segments || [];
      if (itemIdx !== undefined) {
        if (!sectionData.segments[itemIdx]) sectionData.segments[itemIdx] = {};
        Object.keys(data).forEach(function(k) { if (data[k]) sectionData.segments[itemIdx][k] = data[k]; });
      } else { sectionData.segments.push(data); }
      return 黄游保存版块(黄游当前分类, 游戏.name, 黄游写作当前版块, sectionData).then(function() { 黄游写作渲染版块(sectionData); toast('✅ 已生成'); });
    });
  }).catch(function(err) { toast('❌ ' + err.message); });
};

window.黄游渲染写作台 = 黄游渲染写作台;
