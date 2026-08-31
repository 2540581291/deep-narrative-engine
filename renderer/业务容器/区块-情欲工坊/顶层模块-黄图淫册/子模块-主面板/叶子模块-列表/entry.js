// 黄图淫册 · 📋 作品列表（双层：作品→期号）
var 图册列表层级 = 'program';

function 图册渲染列表(el) {
  if (图册是否单张(图册当前载体)) { // 单张载体（插画）：一张图即一个作品，直接显示单张列表
    图册列表层级 = 'program';
    图册渲染作品列表(el);
    return;
  }
  if (!图册当前节目) {
    图册列表层级 = 'program';
    图册渲染作品列表(el);
  } else {
    图册列表层级 = 'episode';
    图册渲染期号列表(el);
  }
}

function 图册渲染作品列表(el) {
  el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--fg2)">加载中...</div>';
  var mk = 图册当前载体;
  图册列出节目(mk).then(function(programs) {
    if (!programs || !programs.length) {
      el.innerHTML = '<div style="padding:40px;text-align:center"><div style="font-size:40px;margin-bottom:12px">' + 图册载体[mk].icon + '</div><div class="placeholder-text" style="margin-bottom:12px">还没有作品，先创建一个吧</div><button class="btn-new" onclick="图册切换标签(\'plan\')">＋ 新建</button></div>';
      return;
    }
    // 单张载体（插画）：卡片画廊样式，点卡弹详情窗
    if (图册是否单张(mk)) { 图册渲染插画卡片(el, programs, mk); return; }
    var h = '<div class="mb-10"><button class="btn-new" onclick="图册切换标签(\'plan\')">＋ 新建</button></div>';
    programs.forEach(function(p) {
      var cfg = 图册获取节目配置(p.type, p.subtype);
      h += '<div class="n-card" style="margin-bottom:8px;padding:12px;cursor:pointer;border-left:3px solid var(--accent2)" onclick="图册进入作品(\'' + p._dir + '\')">';
      h += '<div style="display:flex;justify-content:space-between;align-items:flex-start">';
      h += '<div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--fg)">' + (cfg.icon || '') + ' ' + escHtml(p.name) + '</div>';
      if (p.type) h += '<div style="font-size:10px;color:var(--accent2);margin-top:2px">' + (cfg.label || p.type) + (p.subtype ? ' <span style="font-size:9px;padding:0 6px;border-radius:3px;background:var(--bg3);color:var(--fg3)">' + escHtml(p.subtype) + '</span>' : '') + '</div></div>';
      h += '<div style="display:flex;gap:4px;flex-shrink:0">';
      h += '<span class="btn-sm" style="font-size:10px;color:var(--accent1);cursor:pointer;padding:2px 8px" onclick="event.stopPropagation();图册编辑作品(\'' + p._dir + '\')">✏️ 编辑</span>';
      h += '<span class="btn-sm" style="font-size:10px;color:var(--error);cursor:pointer;padding:2px 8px" onclick="event.stopPropagation();图册删除作品确认(\'' + p._dir + '\')">🗑</span>';
      h += '</div></div>';
      if (p.focus) h += '<div style="font-size:11px;color:var(--fg2);margin-top:4px">📌 ' + escHtml(p.focus) + '</div>';
      if (p.description) h += '<div style="font-size:11px;color:var(--fg3);margin-top:4px;line-height:1.6;white-space:pre-wrap">📖 ' + escHtml(p.description) + '</div>';
      if (p.refSourceNames && p.refSourceNames.length) h += '<div style="font-size:10px;color:var(--fg2);margin-top:4px">' + ((typeof window.图册来源标签 === 'function') ? 图册来源标签(图册当前载体) : '🎨 画师') + '：' + escHtml(p.refSourceNames.join('、')) + '</div>';
      h += '</div>';
    });
    el.innerHTML = h;
  });
}

// 单张载体（插画）：卡片画廊列表
function 图册渲染插画卡片(el, programs, mk) {
  var h = '<div class="mb-10"><button class="btn-new" onclick="图册切换标签(\'plan\')">＋ 新建</button></div>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px">';
  programs.forEach(function(p) {
    var cfg = 图册获取节目配置(p.type, p.subtype);
    h += '<div class="n-card" style="cursor:pointer;overflow:hidden;border-radius:10px;border:1px solid var(--border)" onclick="图册预览插画(\'' + p._dir + '\')">';
    h += '<div style="height:160px;background:linear-gradient(135deg,var(--bg2),var(--bg3));display:flex;align-items:center;justify-content:center;font-size:52px;color:var(--accent2)">' + (cfg.icon || '🎨') + '</div>';
    h += '<div style="padding:10px 12px">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center">';
    h += '<div style="flex:1;font-size:13px;font-weight:600;color:var(--fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(p.name) + '</div>';
    h += '<span class="btn-sm" style="padding:2px 6px;font-size:10px;background:none;border:none;color:var(--error);cursor:pointer" title="删除这张插画" onclick="event.stopPropagation();图册删除插画(\'' + p._dir + '\')">🗑</span>';
    h += '</div>';
    if (cfg.label) h += '<span style="font-size:9px;padding:1px 6px;border-radius:3px;background:var(--bg3);color:var(--fg3);margin-top:5px;display:inline-block">' + escHtml(cfg.label) + '</span>';
    var 视觉摘要 = '';
    if (p.visual && typeof p.visual === 'object') { var 首键 = Object.keys(p.visual)[0]; 视觉摘要 = 首键 && p.visual[首键] ? (首键 + '：' + p.visual[首键]) : ''; }
    else if (p.visual) 视觉摘要 = p.visual;
    if (视觉摘要) h += '<div style="font-size:10px;color:var(--fg3);margin-top:5px;line-height:1.5;height:30px;overflow:hidden">' + escHtml(视觉摘要) + '</div>';
    h += '</div></div>';
  });
  h += '</div>';
  el.innerHTML = h;
}

// 单张载体（插画）：点卡弹出详情窗
window.图册预览插画 = function(作品名) {
  var mk = 图册当前载体;
  图册加载节目(mk, 作品名).then(function(info) {
    if (!info) { toast('作品数据不存在'); return; }
    var cfg = 图册获取节目配置(info.type, info.subtype);
    var h = '<div class="mcard" style="max-width:640px;width:92vw;display:flex;flex-direction:column;max-height:82vh">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border);flex-shrink:0">';
    h += '<div><div style="font-size:16px;font-weight:700;color:var(--fg)">' + (cfg.icon || '🎨') + ' ' + escHtml(info.name || 作品名) + '</div>';
    if (cfg.label) h += '<div style="font-size:10px;color:var(--accent2);margin-top:2px">' + escHtml(cfg.label) + '</div></div>';
    h += '<button class="btn-sm" style="background:transparent;color:var(--fg2);border:1px solid var(--border)" onclick="this.closest(\'.ovl\').remove()">✕ 关闭</button></div>';
    h += '<div style="flex:1;overflow-y:auto;padding:14px 16px">';
    if (info.focus) h += '<div class="n-card" style="padding:8px;margin-bottom:8px;font-size:11px;color:var(--fg2)">📌 ' + escHtml(info.focus) + '</div>';
    if (info.description && info.description !== '画面内容概述' && info.description.trim()) h += '<div class="n-card" style="padding:8px;margin-bottom:8px;font-size:11px;color:var(--fg3);line-height:1.6;white-space:pre-wrap">📖 ' + escHtml(info.description) + '</div>';
    if (info.refSourceNames && info.refSourceNames.length) h += '<div style="font-size:10px;color:var(--fg2);margin-bottom:4px">' + ((typeof window.图册来源标签 === 'function') ? 图册来源标签(图册当前载体) : '🎨 画师') + '：' + escHtml(info.refSourceNames.join('、')) + '</div>';
    if (info.refChars && info.refChars.length) h += '<div style="font-size:10px;color:var(--fg2);margin-bottom:8px">👤 角色：' + escHtml(info.refChars.join('、')) + '</div>';
    var 视觉 = info.visual;
    if (视觉 && typeof 视觉 === 'object' && Object.keys(视觉).length) {
      h += '<div style="font-size:12px;font-weight:600;color:var(--accent2);margin:10px 0 6px">🖼️ 画面描述</div>';
      Object.keys(视觉).forEach(function(fx) {
        if (!视觉[fx]) return;
        h += '<div class="n-card" style="padding:8px;margin-bottom:6px;border-left:3px solid var(--accent2)">';
        h += '<div style="font-size:10px;font-weight:600;color:var(--accent1);margin-bottom:2px">' + escHtml(fx) + '</div>';
        h += '<div style="font-size:11px;color:var(--fg);line-height:1.7">' + escHtml(视觉[fx]) + '</div>';
        h += '</div>';
      });
    } else if (视觉 && typeof 视觉 === 'string' && 视觉.trim()) {
      h += '<div style="font-size:12px;font-weight:600;color:var(--accent2);margin:10px 0 6px">🖼️ 画面描述</div>';
      h += '<div class="n-card" style="padding:10px;border-left:3px solid var(--accent2);font-size:11px;color:var(--fg);line-height:1.8;white-space:pre-wrap">' + escHtml(视觉) + '</div>';
    } else {
      h += '<div style="font-size:11px;color:var(--fg3);margin-top:8px">暂无画面描述，可在「✏️ 编辑」里生成。</div>';
    }
    h += '</div>';
    h += '<div style="display:flex;gap:8px;justify-content:flex-end;padding:10px 16px;border-top:1px solid var(--border);flex-shrink:0">';
    h += '<button class="btn-sm btn-out" onclick="this.closest(\'.ovl\').remove();图册编辑作品(\'' + 作品名 + '\')">✏️ 编辑</button>';
    h += '<button class="btn-sm btn-main" onclick="this.closest(\'.ovl\').remove()">✕ 关闭</button>';
    h += '</div></div>';
    var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = h;
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  });
};

// 单张载体（插画）：删除整张插画
window.图册删除插画 = function(作品名) {
  var mk = 图册当前载体;
  confirmDialog('确定删除这张插画「' + 作品名 + '」？此操作不可恢复。', function() {
    图册删除节目(mk, 作品名).then(function() {
      document.querySelectorAll('.ovl').forEach(function(o) { o.remove(); });
      toast('已删除');
      if (图册当前标签 === 'list') 图册渲染列表(document.getElementById('htContentView'));
    });
  });
};

window.图册进入作品 = function(作品名) {
  var mk = 图册当前载体;
  图册加载节目(mk, 作品名).then(function(info) {
    if (!info) { toast('作品数据不存在'); return; }
    图册当前节目 = { name: 作品名, info: info };
    图册渲染列表(document.getElementById('htContentView'));
  });
};

window.图册编辑作品 = function(作品名) {
  var mk = 图册当前载体;
  图册加载节目(mk, 作品名).then(function(info) {
    if (!info) { toast('作品数据不存在'); return; }
    window.图册规划作品表单 = {
      type: info.type || '',
      subtype: info.subtype || '',
      name: info.name || '',
      focus: info.focus || '',
      description: info.description || '',
      visual: info.visual || {},
      refSources: info.refSourceNames || [],
      refChars: info.refChars || [],
      _editing: true,
      _editName: 作品名
    };
    图册节目简介缓存 = info.description || '';
    (info.refChars || []).forEach(function(cn) {
      if (cn && !window.图册角色完整缓存[cn]) {
        Store.character.get(cn).then(function(d) { if (d) window.图册角色完整缓存[cn] = d; });
      }
    });
    图册当前节目 = null;
    图册切换标签('plan');
  });
};

function 图册渲染期号列表(el) {
  el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--fg2)">加载中...</div>';
  var mk = 图册当前载体;
  var 作品名 = 图册当前节目.name;
  var cfg = 图册获取节目配置(图册当前节目.info.type, 图册当前节目.info.subtype);
  图册列出期号(mk, 作品名).then(function(issues) {
    var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
    h += '<div><div style="font-size:13px;font-weight:600;color:var(--fg)">' + (cfg.icon || '') + ' ' + escHtml(图册当前节目.info.name) + '</div>';
    h += '<div style="font-size:10px;color:var(--fg2);margin-top:2px">' + (cfg.label || '') + '</div></div>';
    h += '<div style="display:flex;gap:6px"><button class="btn-sm" style="background:transparent;color:var(--fg2);border:1px solid var(--border);padding:2px 10px;border-radius:4px;cursor:pointer" onclick="图册返回作品列表()">← 返回</button>';
    h += '<button class="btn-sm btn-main" onclick="图册切换标签(\'plan\')">📝 新期号</button></div></div>';

    if (!issues || !issues.length) {
      h += '<div class="placeholder-text" style="padding:20px;text-align:center">暂无期号，点击「新期号」创建</div>';
    } else {
      issues.sort(function(a, b) { return (a.episode || 0) - (b.episode || 0); });
      issues.forEach(function(iss) {
        var dir = 图册期号路径(mk, 作品名, iss.episode);
        h += '<div class="n-card" style="margin-bottom:6px;padding:10px;cursor:pointer" onclick="图册预览期号(\'' + dir + '\')">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center">';
        h += '<div style="display:flex;align-items:baseline;gap:8px"><span style="font-size:12px;font-weight:600;color:var(--fg)">第' + iss.episode + '期</span>';
        if (iss.headline) h += '<span style="font-size:12px;font-weight:500;color:var(--accent1)">' + escHtml(iss.headline) + '</span></div>';
        else h += '</div>';
        h += '<span class="btn-sm" style="font-size:10px;color:var(--error);cursor:pointer" onclick="event.stopPropagation();图册删除期号确认(\'' + dir + '\')">🗑</span>';
        h += '</div>';
        if (iss.epFocus) h += '<div style="font-size:10px;color:var(--fg2);margin-top:2px">🎯 ' + escHtml(iss.epFocus.length > 50 ? iss.epFocus.slice(0, 50) + '…' : iss.epFocus) + '</div>';
        if (iss.plot) h += '<div style="font-size:10px;color:var(--fg3);margin-top:2px;line-height:1.5">📜 ' + escHtml(iss.plot.length > 80 ? iss.plot.slice(0, 80) + '…' : iss.plot) + '</div>';
        h += '<div style="margin-top:4px;display:flex;gap:4px">';
        h += '<span class="btn-sm" style="font-size:10px;color:var(--accent1);cursor:pointer" onclick="event.stopPropagation();图册期号编辑规划(\'' + dir + '\')">✏️ 编辑内容</span>';
        h += '</div></div>';
      });
    }
    el.innerHTML = h;
  });
}

window.图册返回作品列表 = function() {
  图册当前节目 = null;
  图册渲染列表(document.getElementById('htContentView'));
};

window.图册删除作品确认 = function(作品名) {
  confirmDialog('确定删除作品「' + 作品名 + '」及其所有期号？', function() {
    var mk = 图册当前载体;
    图册删除节目(mk, 作品名).then(function() {
      toast('已删除');
      图册渲染列表(document.getElementById('htContentView'));
    });
  });
};

window.图册删除期号确认 = function(期号路径) {
  confirmDialog('确定删除？不可恢复。', function() {
    图册删除期号(期号路径).then(function() {
      toast('已删除');
      图册渲染列表(document.getElementById('htContentView'));
    });
  });
};

// 预览弹窗（画面 + 台词三段式）
window.图册预览期号 = function(期号路径) {
  图册加载期号(期号路径).then(function(info) {
    if (!info) { toast('数据不存在'); return; }
    var cfg = 图册获取节目配置(图册当前节目 ? 图册当前节目.info.type : '', 图册当前节目 ? 图册当前节目.info.subtype : '');
    if (图册是否分页(图册当前载体)) {
      图册加载期号分页(期号路径).then(function(pages) {
        if (!pages || !pages.length) { toast('暂无内容'); return; }
        window.图册预览分页渲染(info, pages);
      });
      return;
    }
    var sectionLoads = (cfg.sections || []).map(function(s) {
      return 图册加载版块(期号路径, s).then(function(data) { return { name: s, data: data }; });
    });
    Promise.all(sectionLoads).then(function(results) {
      var hasContent = results.filter(function(r) { return r.data && r.data.segments && r.data.segments.length; });
      if (!hasContent.length) { toast('暂无内容'); return; }
      var 角色色 = '#e94560', 画师色 = '#4ecca3', 其他色 = '#8b8b8b';
      var page = 0;
      function renderPage(p) {
        p = Math.max(0, Math.min(p, hasContent.length - 1));
        var r = hasContent[p];
        var h = '<div class="mcard" style="max-width:700px;width:90vw;height:80vh;display:flex;flex-direction:column">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px 8px;border-bottom:1px solid var(--border);flex-shrink:0">';
        h += '<div><div style="font-size:15px;font-weight:700;color:var(--fg)">' + (图册载体[图册当前载体] ? 图册载体[图册当前载体].icon : '') + ' ' + escHtml(info.name || (图册当前节目 ? 图册当前节目.info.name : '')) + '</div>';
        h += '<div style="font-size:10px;color:var(--fg2);margin-top:2px">' + (info.episode ? '第' + info.episode + '期' : '') + '</div></div>';
        h += '<button class="btn-sm" style="background:transparent;color:var(--fg2);border:1px solid var(--border)" onclick="this.closest(\'.ovl\').remove()">关闭</button></div>';
        h += '<div style="display:flex;gap:4px;flex-wrap:wrap;flex-shrink:0;padding:0 16px 8px">';
        for (var i = 0; i < hasContent.length; i++) h += '<span class="tag-chip' + (i === p ? ' tag-active' : '') + '" style="font-size:10px;cursor:pointer" onclick="this.closest(\'.ovl\').remove();window.图册预览渲染页(' + i + ')">' + escHtml(hasContent[i].name) + '</span>';
        h += '</div>';
        h += '<div style="font-size:13px;font-weight:700;color:var(--accent2);margin:0 16px 8px;padding:6px 10px;background:var(--bg2);border-radius:4px;border-left:3px solid var(--accent2);flex-shrink:0">' + escHtml(r.name) + '</div>';
        h += '<div style="flex:1;overflow-y:auto;padding:0 16px">';
        r.data.segments.forEach(function(sg, si) {
          var speaker = sg.speaker || '';
          var hue = 0;
          for (var ci = 0; ci < speaker.length; ci++) { hue = (hue * 31 + speaker.charCodeAt(ci)) & 0xffff; }
          var spColor = 'hsl(' + (hue % 360) + ', 70%, 55%)';
          var isC = info.refChars && info.refChars.some(function(cn) { return sg.speaker && sg.speaker.indexOf(cn) >= 0; });
          var isH = info.refSourceNames && info.refSourceNames.some(function(n) { return sg.speaker && sg.speaker.indexOf(n) >= 0; });
          var roleTag = isC ? '角色' : isH ? ((typeof window.图册来源标题 === 'function') ? 图册来源标题(图册当前载体) : '画师') : '其他';
          var roleColor = isC ? 角色色 : isH ? 画师色 : 其他色;
          var bg = si % 2 === 0 ? 'var(--bg2)' : 'var(--bg1)';
          h += '<div style="padding:8px;margin-bottom:4px;border-radius:4px;background:' + bg + ';border-left:3px solid ' + spColor + '">';
          h += '<span style="font-size:12px;font-weight:700;color:var(--fg)">' + escHtml(sg.speaker || '') + '</span> <span style="font-size:9px;padding:0 5px;border-radius:3px;background:' + roleColor + ';color:#fff;vertical-align:middle">' + roleTag + '</span>';
          if (sg.visual) h += '<div style="font-size:12px;color:var(--fg);line-height:1.7;margin-top:6px;padding:8px 10px;background:var(--bg3);border-radius:4px">🖼️ ' + escHtml(sg.visual) + '</div>';
          if (sg.content) h += '<div style="font-size:12px;color:var(--fg2);line-height:1.6;margin-top:4px">💬 ' + escHtml(sg.content) + '</div>';
          h += '</div>';
        });
        h += '</div></div>';
        window.图册预览渲染页 = renderPage;
        var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = h;
        document.body.appendChild(ov); ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
      }
      renderPage(0);
    });
  });
};

// 连载漫画：分页预览（页 导航 + 每格画面/台词）
window.图册预览分页渲染 = function(info, pages) {
  var h = '<div class="mcard" style="max-width:760px;width:92vw;height:82vh;display:flex;flex-direction:column">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px 8px;border-bottom:1px solid var(--border);flex-shrink:0">';
  h += '<div><div style="font-size:15px;font-weight:700;color:var(--fg)">' + (图册载体[图册当前载体] ? 图册载体[图册当前载体].icon : '') + ' ' + escHtml(info.name || (图册当前节目 ? 图册当前节目.info.name : '')) + '</div>';
  h += '<div style="font-size:10px;color:var(--fg2);margin-top:2px">' + (info.episode ? '第' + info.episode + '期' : '') + '</div></div>';
  h += '<button class="btn-sm" style="background:transparent;color:var(--fg2);border:1px solid var(--border)" onclick="this.closest(\'.ovl\').remove()">关闭</button></div>';
  h += '<div style="display:flex;gap:4px;flex-wrap:wrap;flex-shrink:0;padding:0 16px 8px">';
  pages.forEach(function(pg, i) {
    h += '<span class="tag-chip' + (i === 0 ? ' tag-active' : '') + '" style="font-size:10px;cursor:pointer" onclick="window.图册预览分页跳(' + i + ')">第' + (i + 1) + '页</span>';
  });
  h += '</div><div id="图册预览分页主体" style="flex:1;overflow-y:auto;padding:0 16px 16px"></div></div>';
  var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = h;
  document.body.appendChild(ov); ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  window.图册预览分页数据 = pages;
  window.图册预览分页跳 = function(i) {
    var body = document.getElementById('图册预览分页主体');
    if (!body) return;
    var pg = window.图册预览分页数据 && window.图册预览分页数据[i];
    if (!pg) return;
    var panels = (pg.panels && pg.panels.length) ? pg.panels : [ { description: pg.description || '', dialogue: '' } ];
    var inner = '<div style="font-size:13px;font-weight:700;color:var(--accent2);margin:0 0 8px;padding:6px 10px;background:var(--bg2);border-radius:4px;border-left:3px solid var(--accent2)">📄 第' + (i + 1) + '页</div>';
    if (pg.description) inner += '<div class="n-card" style="padding:8px;margin-bottom:8px;font-size:11px;color:var(--fg);line-height:1.7">🖼️ ' + escHtml(pg.description) + '</div>';
    panels.forEach(function(g, gi) {
      inner += '<div class="n-card" style="padding:8px;margin-bottom:6px;border-left:3px solid var(--border)">';
      if (panels.length > 1) inner += '<div style="font-size:10px;font-weight:600;color:var(--fg3);margin-bottom:2px">格 ' + (gi + 1) + '</div>';
      if (g.description) inner += '<div style="font-size:11px;color:var(--fg);line-height:1.7">🖼️ ' + escHtml(g.description) + '</div>';
      if (g.dialogue) inner += '<div style="font-size:11px;color:var(--fg2);line-height:1.6;margin-top:4px">💬 ' + escHtml(g.dialogue) + '</div>';
      inner += '</div>';
    });
    body.innerHTML = inner;
  };
  window.图册预览分页跳(0);
};

window.图册期号编辑 = function(期号路径) {
  图册加载期号(期号路径).then(function(info) {
    if (!info) { toast('数据不存在'); return; }
    图册当前期号 = { dir: 期号路径, info: info };
    图册切换标签('write');
  });
};

window.图册期号编辑规划 = function(期号路径) {
  图册加载期号(期号路径).then(function(info) {
    if (!info) { toast('数据不存在'); return; }
    window.图册期号编辑缓存 = info;
    图册切换标签('plan');
  });
};

window.图册渲染列表 = 图册渲染列表;

// ===== 快捷生成整期内容 =====
window.图册生成期号内容 = function(期号路径, epNum) {
  var mk = 图册当前载体;
  if (!mk) { toast('请先选择载体'); return; }
  var 节目 = 图册当前节目;
  if (!节目) { toast('请先选择作品'); return; }
  var cfg = window.图册获取节目配置(节目.info.type, 节目.info.subtype);
  var 分页 = 图册是否分页(mk);

  toast('⚡ 正在生成第' + epNum + '期全部内容...');

  Promise.all([
    图册加载期号(期号路径),
    图册加载来源(mk)
  ]).then(function(results) {
    var info = results[0];
    var sources = results[1] || [];
    if (!info) { toast('期号数据不存在'); return; }

    var ctx = '载体类型：' + (图册载体[mk] ? 图册载体[mk].label : '') + '\n';
    ctx += '文件夹：' + 图册文件夹[mk] + '\n';
    ctx += '作品名称：' + 节目.info.name + '\n';
    ctx += '作品类型：' + cfg.label + '\n风格说明：' + cfg.styleDesc + '\n';
    ctx += (分页 ? '本期内容按「页」组织：从封面到末页，每页一张图片，若有分格则描述每一格。\n' : '板块结构：' + cfg.sections.join('、') + '\n');
    ctx += '期号：第' + epNum + '期\n';
    if (节目.info.focus) ctx += (分页 ? '剧情发展方向：' : '作品定位：') + 节目.info.focus + '\n';
    if (节目.info.description) ctx += (分页 ? '大致剧情内容：' : '作品简介：') + 节目.info.description + '\n';
    if (info.headline) ctx += '本期标题：' + info.headline + '\n';
    if (info.epFocus) ctx += (分页 ? '本期内容简介：' : '本期关注方向：') + info.epFocus + '\n';
    if (info.plot) ctx += (分页 ? '本期分页内容说明：' : '本期大致情节：') + info.plot + '\n';

    var 画师名 = info.refSourceNames || [];
    if (画师名.length) {
      ctx += '\n【画师 · 本作执笔者】\n';
      画师名.forEach(function(n) {
        var s = sources.find(function(x) { return x.name === n; });
        ctx += ((typeof window.图册画师风格指令 === 'function') ? window.图册画师风格指令(s || n) : (s ? JSON.stringify(s, null, 2) : n)) + '\n';
      });
    }
    var 角色名 = info.refChars || [];
    if (角色名.length) ctx += '\n【出场人物】\n';

    var loadRoleData = 角色名.length
      ? Promise.all(角色名.map(function(rn) {
          return Store.character.get(rn).then(function(d) { return { name: rn, data: d }; });
        })).then(function(loaded) {
          loaded.forEach(function(item) {
            ctx += (item.data && item.data.identity ? JSON.stringify({ identity: item.data.identity }, null, 2) : '- ' + item.name) + '\n';
          });
        })
      : Promise.resolve();

    loadRoleData.then(function() {
      var sysPrompt = '你是一名极致细腻的情色画师/漫画分镜师。生成完整图画脚本。每个画面必须包含极其精准、高度细腻、毫无遗漏的画面描述（visual/description）：写清构图与视角、人物姿态/朝向/面部表情/眼神、服饰与材质、裸露部位与性器官细节、身体接触与体位、肢体动作、光影与色调、背景环境、氛围与空气感，以及汗珠、体液、水渍、布料皱褶、饰品、纹身等一切细节，禁止笼统概括或遗漏任何内容。每个画面还必须配台词/旁白（content/dialogue）。角色必须有实际出场和互动。本作由画师/摄影师以执笔者身份创作，其画风技法与创作风格用于画面呈现；画面与剧情的主体由作品类型、子类型与出场角色决定。';
      var outputFormat;
      var req;
      if (分页) {
        outputFormat = '「pages」为分页数组，从封面到末页按顺序排列，每页为一张完整图片。每页格式：{"description":"本页整张图片的画面描述","panels":[{"description":"这一格的内容描述","dialogue":"这一格的台词/旁白"},...]}；若该页非分格则 panels 为空数组 [{"description":"本页整张图片的画面描述","dialogue":"本页台词/旁白"}]\n\n整体格式：{"pages":[{"description":"...","panels":[{"description":"...","dialogue":"..."}]}]}';
        req = '每页的每一格都要有精准细腻的画面描述与适当台词/旁白。顺序为封面到末页，一次覆盖全部页数。剧情要丰富完整、符合逻辑与情理：人物动机合理、情节推进自然、与整部作品承上启下，避免粗制滥造或流水账。';
      } else {
        var sectionKeys = JSON.stringify(cfg.sections);
        outputFormat = 'sections 的 key 必须与板块结构完全一致，即 ' + sectionKeys + '。\n格式：{"sections":{"板块名":[{"speaker":"角色名或旁白","visual":"画面描述","content":"台词或旁白文字"},...]}}';
        req = '每个画面描述要精准细腻、覆盖全部细节，台词/旁白适当长度。每个出场人物至少出场一次。';
      }

      var prep = 分页 ? 图册加载期号分页(期号路径) : Promise.resolve([]);
      prep.then(function(草稿) {
        if (分页 && 草稿 && 草稿.length) {
          ctx += '\n【分页草稿】以下是规划阶段生成的分页大纲，请据此细化为最终画面与台词（可适当增补格数）：\n' + JSON.stringify(草稿, null, 2) + '\n';
        }
        LLM.callJSON({
          prompt: ctx + '\n【输出格式】\n' + outputFormat + '\n要求：' + req,
          system: sysPrompt,
          label: '期号内容生成',
          temperature: 0.85
        }).then(function(data) {
          if (!data) { toast('生成失败'); return; }
          var saves;
          if (分页) {
            if (!data.pages || !data.pages.length) { toast('生成失败'); return; }
            saves = 图册保存期号分页(期号路径, data.pages);
          } else {
            if (!data.sections) { toast('生成失败'); return; }
            var sectionMap = {};
            if (Array.isArray(data.sections)) { data.sections.forEach(function(s) { sectionMap[s.name] = s.segments || s.items || []; }); }
            else { Object.keys(data.sections).forEach(function(k) { sectionMap[k] = data.sections[k]; }); }
            var sectionSaves = [];
            cfg.sections.forEach(function(section) {
              var items = sectionMap[section] || [];
              sectionSaves.push(图册保存版块(期号路径, section, { section: section, segments: items }));
            });
            saves = Promise.all(sectionSaves);
          }
          return saves;
        }).then(function() {
          toast('✅ 第' + epNum + '期内容已全部生成');
          图册渲染列表(document.getElementById('htContentView'));
        }).catch(function(err) { toast('❌ ' + err.message); });
      });
    }).catch(function(err) { toast('❌ ' + err.message); });
  }).catch(function(err) { toast('❌ ' + err.message); });
};
