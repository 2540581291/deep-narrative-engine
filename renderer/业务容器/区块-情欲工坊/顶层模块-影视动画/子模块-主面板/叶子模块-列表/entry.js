// 影视动画 · 📋 作品列表（双层：作品→期号）
var 影视列表层级 = 'program';

function 影视渲染列表(el) {
  if (!影视当前节目) {
    影视列表层级 = 'program';
    影视渲染作品列表(el);
  } else {
    影视列表层级 = 'episode';
    影视渲染期号列表(el);
  }
}

function 影视渲染作品列表(el) {
  el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--fg2)">加载中...</div>';
  var mk = 影视当前类型;
  影视列出节目(mk).then(function(programs) {
    if (!programs || !programs.length) {
      el.innerHTML = '<div style="padding:40px;text-align:center"><div style="font-size:40px;margin-bottom:12px">' + 影视内容类型[mk].icon + '</div><div class="placeholder-text" style="margin-bottom:12px">还没有作品，先创建一个吧</div><button class="btn-new" onclick="影视切换标签(\'plan\')">＋ 新建</button></div>';
      return;
    }
    var h = '<div class="mb-10"><button class="btn-new" onclick="影视切换标签(\'plan\')">＋ 新建</button></div>';
    programs.forEach(function(p) {
      var cfg = 影视内容类型[p.type] || {};
      h += '<div class="n-card" style="margin-bottom:8px;padding:12px;cursor:pointer;border-left:3px solid var(--accent2)" onclick="影视进入作品(\'' + p._dir + '\')">';
      h += '<div style="display:flex;justify-content:space-between;align-items:flex-start">';
      h += '<div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--fg)">' + (cfg.icon || '') + ' ' + escHtml(p.name) + '</div>';
      if (p.type) h += '<div style="font-size:10px;color:var(--accent2);margin-top:2px">' + (cfg.label || p.type) + (p.subtype ? ' <span style="font-size:9px;padding:0 6px;border-radius:3px;background:var(--bg3);color:var(--fg3)">' + escHtml(p.subtype) + '</span>' : '') + '</div></div>';
      h += '<div style="display:flex;gap:4px;flex-shrink:0">';
      h += '<span class="btn-sm" style="font-size:10px;color:var(--accent1);cursor:pointer;padding:2px 8px" onclick="event.stopPropagation();影视编辑作品(\'' + p._dir + '\')">✏️ 编辑</span>';
      h += '<span class="btn-sm" style="font-size:10px;color:var(--error);cursor:pointer;padding:2px 8px" onclick="event.stopPropagation();影视删除作品确认(\'' + p._dir + '\')">🗑</span>';
      h += '</div></div>';
      if (p.focus) h += '<div style="font-size:11px;color:var(--fg2);margin-top:4px">📌 ' + escHtml(p.focus) + '</div>';
      if (p.description) h += '<div style="font-size:11px;color:var(--fg3);margin-top:4px;line-height:1.6;white-space:pre-wrap">📖 ' + escHtml(p.description) + '</div>';
      if (p.refSourceNames && p.refSourceNames.length) h += '<div style="font-size:10px;color:var(--fg2);margin-top:4px">🎭 ' + escHtml(p.refSourceNames.join('、')) + '</div>';
      h += '</div>';
    });
    el.innerHTML = h;
  });
}

window.影视进入作品 = function(作品名) {
  var mk = 影视当前类型;
  影视加载节目(mk, 作品名).then(function(info) {
    if (!info) { toast('作品数据不存在'); return; }
    影视当前节目 = { name: 作品名, info: info };
    影视渲染列表(document.getElementById('ysContentView'));
  });
};

window.影视编辑作品 = function(作品名) {
  var mk = 影视当前类型;
  影视加载节目(mk, 作品名).then(function(info) {
    if (!info) { toast('作品数据不存在'); return; }
    window.影视规划作品表单 = {
      type: info.type || '',
      subtype: info.subtype || '',
      name: info.name || '',
      focus: info.focus || '',
      description: info.description || '',
      refSources: info.refSourceNames || [],
      refChars: info.refChars || [],
      _editing: true,
      _editName: 作品名
    };
    影视节目简介缓存 = info.description || '';
    (info.refChars || []).forEach(function(cn) {
      if (cn && !window.影视角色完整缓存[cn]) {
        Store.character.get(cn).then(function(d) { if (d) window.影视角色完整缓存[cn] = d; });
      }
    });
    影视当前节目 = null;
    影视切换标签('plan');
  });
};

function 影视渲染期号列表(el) {
  el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--fg2)">加载中...</div>';
  var mk = 影视当前类型;
  var 作品名 = 影视当前节目.name;
  var cfg = 影视内容类型[影视当前节目.info.type] || {};
  影视列出期号(mk, 作品名).then(function(issues) {
    var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
    h += '<div><div style="font-size:13px;font-weight:600;color:var(--fg)">' + (cfg.icon || '') + ' ' + escHtml(影视当前节目.info.name) + '</div>';
    h += '<div style="font-size:10px;color:var(--fg2);margin-top:2px">' + (cfg.label || '') + '</div></div>';
    h += '<div style="display:flex;gap:6px"><button class="btn-sm" style="background:transparent;color:var(--fg2);border:1px solid var(--border);padding:2px 10px;border-radius:4px;cursor:pointer" onclick="影视返回作品列表()">← 返回</button>';
    h += '<button class="btn-sm btn-main" onclick="影视切换标签(\'plan\')">📝 新期号</button></div></div>';

    if (!issues || !issues.length) {
      h += '<div class="placeholder-text" style="padding:20px;text-align:center">暂无期号，点击「新期号」创建</div>';
    } else {
      issues.sort(function(a, b) { return (a.episode || 0) - (b.episode || 0); });
      issues.forEach(function(iss) {
        var dir = 影视期号路径(mk, 作品名, iss.episode);
        h += '<div class="n-card" style="margin-bottom:6px;padding:10px;cursor:pointer" onclick="影视预览期号(\'' + dir + '\')">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center">';
        h += '<div style="display:flex;align-items:baseline;gap:8px"><span style="font-size:12px;font-weight:600;color:var(--fg)">第' + iss.episode + '期</span>';
        if (iss.headline) h += '<span style="font-size:12px;font-weight:500;color:var(--accent1)">' + escHtml(iss.headline) + '</span></div>';
        else h += '</div>';
        h += '<span class="btn-sm" style="font-size:10px;color:var(--error);cursor:pointer" onclick="event.stopPropagation();影视删除期号确认(\'' + dir + '\')">🗑</span>';
        h += '</div>';
        if (iss.epFocus) h += '<div style="font-size:10px;color:var(--fg2);margin-top:2px">🎯 ' + escHtml(iss.epFocus.length > 50 ? iss.epFocus.slice(0, 50) + '…' : iss.epFocus) + '</div>';
        if (iss.plot) h += '<div style="font-size:10px;color:var(--fg3);margin-top:2px;line-height:1.5">📜 ' + escHtml(iss.plot.length > 80 ? iss.plot.slice(0, 80) + '…' : iss.plot) + '</div>';
        h += '<div style="margin-top:4px;display:flex;gap:4px">';
        h += '<span class="btn-sm" style="font-size:10px;color:var(--accent1);cursor:pointer" onclick="event.stopPropagation();影视期号编辑规划(\'' + dir + '\')">✏️ 编辑规划</span>';
        h += '<span class="btn-sm" style="font-size:10px;color:var(--accent2);cursor:pointer" onclick="event.stopPropagation();影视期号编辑(\'' + dir + '\')">✍️ 写作台</span>';
        h += '<span class="btn-sm" style="font-size:10px;color:var(--accent3);cursor:pointer;font-weight:600" onclick="event.stopPropagation();影视生成期号内容(\'' + dir + '\',' + iss.episode + ')">⚡ 生成内容</span>';
        h += '</div></div>';
      });
    }
    el.innerHTML = h;
  });
}

window.影视返回作品列表 = function() {
  影视当前节目 = null;
  影视渲染列表(document.getElementById('ysContentView'));
};

window.影视删除作品确认 = function(作品名) {
  confirmDialog('确定删除作品「' + 作品名 + '」及其所有期号？', function() {
    var mk = 影视当前类型;
    影视删除节目(mk, 作品名).then(function() {
      toast('已删除');
      影视渲染列表(document.getElementById('ysContentView'));
    });
  });
};

window.影视删除期号确认 = function(期号路径) {
  confirmDialog('确定删除？不可恢复。', function() {
    影视删除期号(期号路径).then(function() {
      toast('已删除');
      影视渲染列表(document.getElementById('ysContentView'));
    });
  });
};

// 预览弹窗
window.影视预览期号 = function(期号路径) {
  影视加载期号(期号路径).then(function(info) {
    if (!info) { toast('数据不存在'); return; }
    var parts = 期号路径.split('/');
    var cfg = 影视内容类型[影视当前节目 ? 影视当前节目.info.type : ''] || { sections: [] };
    var sectionLoads = cfg.sections.map(function(s) {
      return 影视加载版块(期号路径, s).then(function(data) { return { name: s, data: data }; });
    });
    Promise.all(sectionLoads).then(function(results) {
      var hasContent = results.filter(function(r) { return r.data && r.data.segments && r.data.segments.length; });
      if (!hasContent.length) { toast('暂无内容'); return; }
      var 演角色 = '#4ecca3', 角色色 = '#e94560', 其他色 = '#8b8b8b';
      var page = 0;
      function renderPage(p) {
        p = Math.max(0, Math.min(p, hasContent.length - 1));
        var r = hasContent[p];
        var h = '<div class="mcard" style="max-width:700px;width:90vw;height:80vh;display:flex;flex-direction:column">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px 8px;border-bottom:1px solid var(--border);flex-shrink:0">';
        h += '<div><div style="font-size:15px;font-weight:700;color:var(--fg)">' + 影视内容类型[影视当前类型].icon + ' ' + escHtml(info.name || 影视当前节目.info.name) + '</div>';
        h += '<div style="font-size:10px;color:var(--fg2);margin-top:2px">' + (info.episode ? '第' + info.episode + '期' : '') + '</div></div>';
        h += '<button class="btn-sm" style="background:transparent;color:var(--fg2);border:1px solid var(--border)" onclick="this.closest(\'.ovl\').remove()">关闭</button></div>';
        h += '<div style="display:flex;gap:4px;flex-wrap:wrap;flex-shrink:0;padding:0 16px 8px">';
        for (var i = 0; i < hasContent.length; i++) h += '<span class="tag-chip' + (i === p ? ' tag-active' : '') + '" style="font-size:10px;cursor:pointer" onclick="this.closest(\'.ovl\').remove();window.影视预览渲染页(' + i + ')">' + escHtml(hasContent[i].name) + '</span>';
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
          var roleTag = isC ? '角色' : isH ? '演员' : '其他';
          var roleColor = isC ? 角色色 : isH ? 演角色 : 其他色;
          var bg = si % 2 === 0 ? 'var(--bg2)' : 'var(--bg1)';
          h += '<div style="padding:6px 8px;margin-bottom:3px;border-radius:4px;background:' + bg + ';border-left:3px solid ' + spColor + '">';
          h += '<span style="font-size:12px;font-weight:700;color:var(--fg)">' + escHtml(sg.speaker || '') + '</span> <span style="font-size:9px;padding:0 5px;border-radius:3px;background:' + roleColor + ';color:#fff;vertical-align:middle">' + roleTag + '</span>';
          h += '<div style="font-size:12px;color:var(--fg2);line-height:1.6;margin-top:2px">' + escHtml(sg.content || '') + '</div></div>';
        });
        h += '</div></div>';
        window.影视预览渲染页 = renderPage;
        var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = h;
        document.body.appendChild(ov); ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
      }
      renderPage(0);
    });
  });
};

window.影视期号编辑 = function(期号路径) {
  影视加载期号(期号路径).then(function(info) {
    if (!info) { toast('数据不存在'); return; }
    影视当前期号 = { dir: 期号路径, info: info };
    影视切换标签('write');
  });
};

window.影视期号编辑规划 = function(期号路径) {
  var mk = 影视当前类型;
  影视加载期号(期号路径).then(function(info) {
    if (!info) { toast('数据不存在'); return; }
    window.影视期号编辑缓存 = info;
    影视切换标签('plan');
  });
};

window.影视渲染列表 = 影视渲染列表;

// ===== 快捷生成整期内容 =====
window.影视生成期号内容 = function(期号路径, epNum) {
  var mk = 影视当前类型;
  if (!mk) { toast('请先选择类型'); return; }
  var 节目 = 影视当前节目;
  if (!节目) { toast('请先选择作品'); return; }
  var cfg = window.影视获取节目配置(节目.info.type, 节目.info.subtype);

  toast('⚡ 正在生成第' + epNum + '期全部内容...');

  Promise.all([
    影视加载期号(期号路径),
    影视加载来源(mk)
  ]).then(function(results) {
    var info = results[0];
    var sources = results[1] || [];
    if (!info) { toast('期号数据不存在'); return; }

    var ctx = '内容类型：' + (影视内容类型[mk] ? 影视内容类型[mk].label : '') + '\n';
    ctx += '频道：' + 影视文件夹[mk] + '\n';
    ctx += '作品名称：' + 节目.info.name + '\n';
    ctx += '作品类型：' + cfg.label + '\n风格说明：' + cfg.styleDesc + '\n段落结构：' + cfg.sections.join('、') + '\n';
    ctx += '期号：第' + epNum + '期\n';
    if (节目.info.focus) ctx += '作品定位：' + 节目.info.focus + '\n';
    if (节目.info.description) ctx += '作品简介：' + 节目.info.description + '\n';
    if (info.headline) ctx += '本期标题：' + info.headline + '\n';
    if (info.epFocus) ctx += '本期关注方向：' + info.epFocus + '\n';
    if (info.plot) ctx += '本期大致情节：' + info.plot + '\n';
    var 节目常驻演员 = 节目.info.refSourceNames || [];
    var 节目常驻角色 = 节目.info.refChars || [];
    var 本期演员名 = info.refSourceNames || [];
    var 本期角色名 = info.refChars || [];
    ctx += '\n【本期概况】\n';
    ctx += '本期演员：' + (本期演员名.length ? 本期演员名.join('、') : '（无）') + '\n';
    ctx += '本期出场：' + (本期角色名.length ? 本期角色名.join('、') : '（无）') + '\n';
    var 本期新增演员 = 本期演员名.filter(function(n) { return 节目常驻演员.indexOf(n) < 0; });
    var 本期缺席演员 = 节目常驻演员.filter(function(n) { return 本期演员名.indexOf(n) < 0; });
    var 本期新增角色 = 本期角色名.filter(function(n) { return 节目常驻角色.indexOf(n) < 0; });
    var 本期缺席角色 = 节目常驻角色.filter(function(n) { return 本期角色名.indexOf(n) < 0; });
    if (本期新增演员.length) ctx += '⚡ 本期新增演员：' + 本期新增演员.join('、') + '（非作品常驻）\n';
    if (本期缺席演员.length) ctx += '⚠️ 本期缺席演员：' + 本期缺席演员.join('、') + '（常驻本期未出场）\n';
    if (本期新增角色.length) ctx += '⚡ 本期新增角色：' + 本期新增角色.join('、') + '（非作品常驻）\n';
    if (本期缺席角色.length) ctx += '⚠️ 本期缺席角色：' + 本期缺席角色.join('、') + '（常驻本期未出场）\n';

    var 演员名 = info.refSourceNames || [];
    if (演员名.length) {
      ctx += '\n【演员】\n';
      演员名.forEach(function(n) {
        var s = sources.find(function(x) { return x.name === n; });
        ctx += (s ? JSON.stringify(s, null, 2) : n) + '\n';
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
      var 环节类型说明 = '环节类型说明：scene_opener(开场)、dialogue(对白)、erotica(情色场景)、narration(旁白)、closing(结束)';
      var sectionKeys = JSON.stringify(cfg.sections);
      var outputFormat = 'sections 的 key 必须与段落结构完全一致，即 ' + sectionKeys + '。\n格式：{"sections":{"段落名":[{"type":"环节类型","speaker":"发言人","content":"内容"},...]}}';
      var sysPrompt = '你是一名影视编导。生成完整脚本。每个段落标明发言人。演员和角色必须有实际对话和互动，不能只是独白。确保每个出场人物都有发言。';
      var req = '每个段落不少于5个环节，每段口播100-300字。每个出场人物至少要有一次发言。';

      LLM.callJSON({
        prompt: ctx + '\n【输出格式】\n' + outputFormat + '\n' + 环节类型说明 + '\n要求：' + req,
        system: sysPrompt,
        label: '期号内容生成',
        temperature: 0.85
      }).then(function(data) {
        if (!data || !data.sections) { toast('生成失败'); return; }
        var saves = [];
        var sectionMap = {};
        if (Array.isArray(data.sections)) {
          data.sections.forEach(function(s) { sectionMap[s.name] = s.segments || s.articles || s.items || []; });
        } else {
          Object.keys(data.sections).forEach(function(k) { sectionMap[k] = data.sections[k]; });
        }
        cfg.sections.forEach(function(section) {
          var items = sectionMap[section] || [];
          saves.push(影视保存版块(期号路径, section, { section: section, segments: items }));
        });
        return Promise.all(saves);
      }).then(function() {
        toast('✅ 第' + epNum + '期内容已全部生成');
        影视渲染列表(document.getElementById('ysContentView'));
      }).catch(function(err) { toast('❌ ' + err.message); });
    }).catch(function(err) { toast('❌ ' + err.message); });
  }).catch(function(err) { toast('❌ ' + err.message); });
};
