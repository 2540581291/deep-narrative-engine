// 新闻媒体 · 📋 节目列表（双层：节目→期号）
var 新闻媒体列表层级 = 'program'; // program | episode

function 新闻媒体渲染列表(el) {
  if (!新闻媒体当前节目) {
    新闻媒体列表层级 = 'program';
    新闻媒体渲染节目列表(el);
  } else {
    新闻媒体列表层级 = 'episode';
    新闻媒体渲染期号列表(el);
  }
}

function 新闻媒体渲染节目列表(el) {
  el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--fg2)">加载中...</div>';
  var mk = 新闻媒体当前媒体;
  新闻媒体列出节目(mk).then(function(programs) {
    if (!programs || !programs.length) {
      el.innerHTML = '<div style="padding:40px;text-align:center"><div style="font-size:40px;margin-bottom:12px">' + 新闻媒体形态[mk].icon + '</div><div class="placeholder-text" style="margin-bottom:12px">还没有节目，先创建一个吧</div><button class="btn-new" onclick="新闻媒体切换标签(\'plan\')">＋ 新建</button></div>';
      return;
    }
    var h = '<div class="mb-10"><button class="btn-new" onclick="新闻媒体切换标签(\'plan\')">＋ 新建</button></div>';
    programs.forEach(function(p) {
      var cfg = 新闻获取类型配置(mk, p.type) || {};
      h += '<div class="n-card" style="margin-bottom:8px;padding:12px;cursor:pointer;border-left:3px solid var(--accent2)" onclick="新闻媒体进入节目(\'' + p._dir + '\')">';
      h += '<div style="display:flex;justify-content:space-between;align-items:flex-start">';
      h += '<div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--fg)">' + (cfg.icon || '') + ' ' + escHtml(p.name) + '</div>';
      if (p.type) h += '<div style="font-size:10px;color:var(--accent2);margin-top:2px">' + (cfg.label || p.type) + '</div></div>';
      h += '<div style="display:flex;gap:4px;flex-shrink:0">';
      h += '<span class="btn-sm" style="font-size:10px;color:var(--accent1);cursor:pointer;padding:2px 8px" onclick="event.stopPropagation();新闻媒体编辑节目(\'' + p._dir + '\')">✏️ 编辑</span>';
      h += '<span class="btn-sm" style="font-size:10px;color:var(--error);cursor:pointer;padding:2px 8px" onclick="event.stopPropagation();新闻媒体删除节目确认(\'' + p._dir + '\')">🗑</span>';
      h += '</div></div>';
      if (p.focus) h += '<div style="font-size:11px;color:var(--fg2);margin-top:4px">📌 ' + escHtml(p.focus) + '</div>';
      if (p.description) h += '<div style="font-size:11px;color:var(--fg3);margin-top:4px;line-height:1.6;white-space:pre-wrap">📖 ' + escHtml(p.description) + '</div>';
      if (p.refSourceNames && p.refSourceNames.length) h += '<div style="font-size:10px;color:var(--fg2);margin-top:4px">🎙 ' + escHtml(p.refSourceNames.join('、')) + '</div>';
      h += '</div>';
    });
    el.innerHTML = h;
  });
}

window.新闻媒体进入节目 = function(节目名) {
  var mk = 新闻媒体当前媒体;
  新闻媒体加载节目(mk, 节目名).then(function(info) {
    if (!info) { toast('节目数据不存在'); return; }
    新闻媒体当前节目 = { name: 节目名, info: info };
    新闻媒体渲染列表(document.getElementById('npContentView'));
  });
};

window.新闻媒体编辑节目 = function(节目名) {
  var mk = 新闻媒体当前媒体;
  新闻媒体加载节目(mk, 节目名).then(function(info) {
    if (!info) { toast('节目数据不存在'); return; }
    window.新闻媒体规划节目表单 = {
      type: info.type || '',
      name: info.name || '',
      focus: info.focus || '',
      description: info.description || '',
      refSources: info.refSourceNames || [],
      refChars: info.refChars || [],
      _editing: true,
      _editName: 节目名
    };
    报纸节目简介缓存 = info.description || '';
    // 预加载常驻角色的完整数据
    (info.refChars || []).forEach(function(cn) {
      if (cn && !window.报纸角色完整缓存[cn]) {
        Store.character.get(cn).then(function(d) { if (d) window.报纸角色完整缓存[cn] = d; });
      }
    });
    新闻媒体当前节目 = null;
    新闻媒体切换标签('plan');
  });
};

function 新闻媒体渲染期号列表(el) {
  el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--fg2)">加载中...</div>';
  var mk = 新闻媒体当前媒体;
  var 节目名 = 新闻媒体当前节目.name;
  var cfg = 新闻获取类型配置(mk, 新闻媒体当前节目.info.type) || {};
  新闻媒体列出期号(mk, 节目名).then(function(issues) {
    var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
    h += '<div><div style="font-size:13px;font-weight:600;color:var(--fg)">' + (cfg.icon || '') + ' ' + escHtml(新闻媒体当前节目.info.name) + '</div>';
    h += '<div style="font-size:10px;color:var(--fg2);margin-top:2px">' + (cfg.label || '') + '</div></div>';
    h += '<div style="display:flex;gap:6px"><button class="btn-sm" style="background:transparent;color:var(--fg2);border:1px solid var(--border);padding:2px 10px;border-radius:4px;cursor:pointer" onclick="新闻媒体返回节目列表()">← 返回</button>';
    h += '<button class="btn-sm btn-main" onclick="新闻媒体切换标签(\'plan\')">📝 新期号</button></div></div>';

    if (!issues || !issues.length) {
      h += '<div class="placeholder-text" style="padding:20px;text-align:center">暂无期号，点击「新期号」创建</div>';
    } else {
      issues.sort(function(a, b) { return (a.episode || 0) - (b.episode || 0); });
      issues.forEach(function(iss) {
        var dir = 新闻媒体期号路径(mk, 节目名, iss.episode);
        h += '<div class="n-card" style="margin-bottom:6px;padding:10px;cursor:pointer" onclick="新闻媒体预览期号(\'' + dir + '\')">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center">';
        h += '<div style="display:flex;align-items:baseline;gap:8px"><span style="font-size:12px;font-weight:600;color:var(--fg)">第' + iss.episode + '期</span>';
        if (iss.headline) h += '<span style="font-size:12px;font-weight:500;color:var(--accent1)">' + escHtml(iss.headline) + '</span></div>';
        else h += '</div>';
        h += '<span class="btn-sm" style="font-size:10px;color:var(--error);cursor:pointer" onclick="event.stopPropagation();新闻媒体删除期号确认(\'' + dir + '\')">🗑</span>';
        h += '</div>';
        if (iss.epFocus) h += '<div style="font-size:10px;color:var(--fg2);margin-top:2px">🎯 ' + escHtml(iss.epFocus.length > 50 ? iss.epFocus.slice(0, 50) + '…' : iss.epFocus) + '</div>';
        if (iss.plot) h += '<div style="font-size:10px;color:var(--fg3);margin-top:2px;line-height:1.5">📜 ' + escHtml(iss.plot.length > 80 ? iss.plot.slice(0, 80) + '…' : iss.plot) + '</div>';
        h += '<div style="margin-top:4px;display:flex;gap:4px">';
        h += '<span class="btn-sm" style="font-size:10px;color:var(--accent1);cursor:pointer" onclick="event.stopPropagation();新闻媒体期号编辑规划(\'' + dir + '\')">✏️ 编辑规划</span>';
        h += '<span class="btn-sm" style="font-size:10px;color:var(--accent2);cursor:pointer" onclick="event.stopPropagation();新闻媒体期号编辑(\'' + dir + '\')">✍️ 写作台</span>';
        h += '<span class="btn-sm" style="font-size:10px;color:var(--accent3);cursor:pointer;font-weight:600" onclick="event.stopPropagation();新闻媒体生成期号内容(\'' + dir + '\',' + iss.episode + ')">⚡ 生成内容</span>';
        h += '</div></div>';
      });
    }
    el.innerHTML = h;
  });
}

window.新闻媒体返回节目列表 = function() {
  新闻媒体当前节目 = null;
  新闻媒体渲染列表(document.getElementById('npContentView'));
};

window.新闻媒体删除节目确认 = function(节目名) {
  confirmDialog('确定删除节目「' + 节目名 + '」及其所有期号？', function() {
    var mk = 新闻媒体当前媒体;
    新闻媒体删除节目(mk, 节目名).then(function() {
      toast('已删除');
      新闻媒体渲染列表(document.getElementById('npContentView'));
    });
  });
};

window.新闻媒体删除期号确认 = function(期号路径) {
  confirmDialog('确定删除？不可恢复。', function() {
    新闻媒体删除期号(期号路径).then(function() {
      toast('已删除');
      新闻媒体渲染列表(document.getElementById('npContentView'));
    });
  });
};

// 预览弹窗
window.新闻媒体预览期号 = function(期号路径) {
  新闻媒体加载期号(期号路径).then(function(info) {
    if (!info) { toast('数据不存在'); return; }
    var parts = 期号路径.split('/');
    var cfg = 新闻获取类型配置(新闻媒体当前媒体, 新闻媒体当前节目 ? 新闻媒体当前节目.info.type : '') || { sections: [] };
    var sectionLoads = cfg.sections.map(function(s) {
      return 新闻媒体加载版块(期号路径, s).then(function(data) { return { name: s, data: data }; });
    });
    Promise.all(sectionLoads).then(function(results) {
      var isSegment = 新闻媒体当前媒体 === 'tv' || 新闻媒体当前媒体 === 'radio';
      if (isSegment) {
        var hasContent = results.filter(function(r) { return r.data && r.data.segments && r.data.segments.length; });
        if (!hasContent.length) { toast('暂无内容'); return; }
        var 主持色 = '#4ecca3', 嘉宾色 = '#e94560', 其他色 = '#8b8b8b';
        var page = 0;
        function renderPage(p) {
          p = Math.max(0, Math.min(p, hasContent.length - 1));
          var r = hasContent[p];
          var h = '<div class="mcard" style="max-width:700px;width:90vw;height:80vh;display:flex;flex-direction:column">';
          h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px 8px;border-bottom:1px solid var(--border);flex-shrink:0">';
          h += '<div><div style="font-size:15px;font-weight:700;color:var(--fg)">' + 新闻媒体形态[新闻媒体当前媒体].icon + ' ' + escHtml(info.name || 新闻媒体当前节目.info.name) + '</div>';
          h += '<div style="font-size:10px;color:var(--fg2);margin-top:2px">' + (info.episode ? '第' + info.episode + '期' : '') + '</div></div>';
          h += '<button class="btn-sm" style="background:transparent;color:var(--fg2);border:1px solid var(--border)" onclick="this.closest(\'.ovl\').remove()">关闭</button></div>';
          h += '<div style="display:flex;gap:4px;flex-wrap:wrap;flex-shrink:0;padding:0 16px 8px">';
          for (var i = 0; i < hasContent.length; i++) h += '<span class="tag-chip' + (i === p ? ' tag-active' : '') + '" style="font-size:10px;cursor:pointer" onclick="this.closest(\'.ovl\').remove();window.新闻媒体预览渲染页(' + i + ')">' + escHtml(hasContent[i].name) + '</span>';
          h += '</div>';
          h += '<div style="font-size:13px;font-weight:700;color:var(--accent2);margin:0 16px 8px;padding:6px 10px;background:var(--bg2);border-radius:4px;border-left:3px solid var(--accent2);flex-shrink:0">' + escHtml(r.name) + '</div>';
          h += '<div style="flex:1;overflow-y:auto;padding:0 16px">';
          r.data.segments.forEach(function(sg, si) {
            var speaker = sg.speaker || '';
            // 每个发言人分配独立色相
            var hue = 0;
            for (var ci = 0; ci < speaker.length; ci++) {
              hue = (hue * 31 + speaker.charCodeAt(ci)) & 0xffff;
            }
            var spColor = 'hsl(' + (hue % 360) + ', 70%, 55%)';
            var isC = info.refChars && info.refChars.some(function(cn) { return sg.speaker && sg.speaker.indexOf(cn) >= 0; });
            var isH = info.refSourceNames && info.refSourceNames.some(function(n) { return sg.speaker && sg.speaker.indexOf(n) >= 0; });
            var roleTag = isC ? '嘉宾' : isH ? '主持' : '其他';
            var roleColor = isC ? 嘉宾色 : isH ? 主持色 : 其他色;
            var bg = si % 2 === 0 ? 'var(--bg2)' : 'var(--bg1)';
            h += '<div style="padding:6px 8px;margin-bottom:3px;border-radius:4px;background:' + bg + ';border-left:3px solid ' + spColor + '">';
            h += '<span style="font-size:12px;font-weight:700;color:var(--fg)">' + escHtml(sg.speaker || '') + '</span> <span style="font-size:9px;padding:0 5px;border-radius:3px;background:' + roleColor + ';color:#fff;vertical-align:middle">' + roleTag + '</span>';
            h += '<div style="font-size:12px;color:var(--fg2);line-height:1.6;margin-top:2px">' + escHtml(sg.content || '') + '</div></div>';
          });
          h += '</div></div>';
          window.新闻媒体预览渲染页 = renderPage;
          var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = h;
          document.body.appendChild(ov); ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
        }
        renderPage(0);
      } else {
        var h = '<div class="mcard" style="max-width:700px;width:90vw;max-height:90vh;overflow-y:auto">';
        h += '<div style="padding:12px 16px;border-bottom:1px solid var(--border)"><div style="font-size:15px;font-weight:700">' + escHtml(info.name) + '</div></div>';
        results.forEach(function(r) {
          if (!r.data || !r.data.articles) return;
          h += '<div style="padding:8px"><div style="font-size:12px;font-weight:600;color:var(--accent2)">' + escHtml(r.name) + '</div>';
          r.data.articles.forEach(function(a) {
            h += '<div style="padding:4px 0"><div style="font-size:12px;font-weight:600">' + escHtml(a.title||'') + '</div>';
            if (a.content) h += '<div style="font-size:11px;color:var(--fg2)">' + escHtml(a.content.slice(0,100)) + '</div></div>';
          });
          h += '</div>';
        });
        h += '</div>';
        var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = h;
        document.body.appendChild(ov); ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
      }
    });
  });
};

window.新闻媒体期号编辑 = function(期号路径) {
  新闻媒体加载期号(期号路径).then(function(info) {
    if (!info) { toast('数据不存在'); return; }
    新闻媒体当前期号 = { dir: 期号路径, info: info };
    新闻媒体切换标签('write');
  });
};

window.新闻媒体期号编辑规划 = function(期号路径) {
  var mk = 新闻媒体当前媒体;
  新闻媒体加载期号(期号路径).then(function(info) {
    if (!info) { toast('数据不存在'); return; }
    window.新闻媒体期号编辑缓存 = info;
    新闻媒体切换标签('plan');
  });
};

window.新闻媒体渲染列表 = 新闻媒体渲染列表;

// ===== 快捷生成整期内容 =====
window.新闻媒体生成期号内容 = function(期号路径, epNum) {
  var mk = 新闻媒体当前媒体;
  if (!mk) { toast('请先选择媒体'); return; }
  var 节目 = 新闻媒体当前节目;
  if (!节目) { toast('请先选择节目'); return; }
  var cfg = 新闻获取类型配置(mk, 节目.info.type) || {};
  var isScript = mk === 'tv' || mk === 'radio';

  toast('⚡ 正在生成第' + epNum + '期全部内容...');

  Promise.all([
    新闻媒体加载期号(期号路径),
    新闻媒体加载来源(mk)
  ]).then(function(results) {
    var info = results[0];
    var sources = results[1] || [];
    if (!info) { toast('期号数据不存在'); return; }

    var ctx = '媒体形态：' + (新闻媒体形态[mk] ? 新闻媒体形态[mk].label : '') + '\n';
    ctx += '频道：' + 新闻媒体文件夹[mk] + '\n';
    ctx += '节目名称：' + 节目.info.name + '\n';
    ctx += '节目类型：' + cfg.label + '\n节目类型说明：' + cfg.styleDesc + '\n栏目结构：' + cfg.sections.join('、') + '\n';
    ctx += '期号：第' + epNum + '期\n';
    if (节目.info.focus) ctx += '节目定位：' + 节目.info.focus + '\n';
    if (节目.info.description) ctx += '节目简介：' + 节目.info.description + '\n';
    if (info.headline) ctx += '本期头条：' + info.headline + '\n';
    if (info.epFocus) ctx += '本期关注方向：' + info.epFocus + '\n';
    if (info.plot) ctx += '本期大致情节：' + info.plot + '\n';
    // 本期概况：与节目常驻对比
    var 节目常驻主持 = 节目.info.refSourceNames || [];
    var 节目常驻角色 = 节目.info.refChars || [];
    var 本期主持名 = info.refSourceNames || [];
    var 本期角色名 = info.refChars || [];
    ctx += '\n【本期概况】\n';
    ctx += '本期主持：' + (本期主持名.length ? 本期主持名.join('、') : '（无）') + '\n';
    ctx += '本期出场：' + (本期角色名.length ? 本期角色名.join('、') : '（无）') + '\n';
    var 本期新增主持 = 本期主持名.filter(function(n) { return 节目常驻主持.indexOf(n) < 0; });
    var 本期缺席主持 = 节目常驻主持.filter(function(n) { return 本期主持名.indexOf(n) < 0; });
    var 本期新增角色 = 本期角色名.filter(function(n) { return 节目常驻角色.indexOf(n) < 0; });
    var 本期缺席角色 = 节目常驻角色.filter(function(n) { return 本期角色名.indexOf(n) < 0; });
    if (本期新增主持.length) ctx += '⚡ 本期新增主持：' + 本期新增主持.join('、') + '（非节目常驻）\n';
    if (本期缺席主持.length) ctx += '⚠️ 本期缺席主持：' + 本期缺席主持.join('、') + '（常驻本期未出场）\n';
    if (本期新增角色.length) ctx += '⚡ 本期新增角色：' + 本期新增角色.join('、') + '（非节目常驻）\n';
    if (本期缺席角色.length) ctx += '⚠️ 本期缺席角色：' + 本期缺席角色.join('、') + '（常驻本期未出场）\n';

    // 主持人详细资料
    var 主持名 = info.refSourceNames || [];
    if (主持名.length) {
      ctx += '\n【常驻主持】\n';
      主持名.forEach(function(n) {
        var s = sources.find(function(x) { return x.name === n; });
        ctx += (s ? JSON.stringify(s, null, 2) : n) + '\n';
      });
    }
    // 角色（通过 Store.character.get 从磁盘读取完整角色数据）
    var 角色名 = info.refChars || [];
    if (角色名.length) {
      ctx += '\n【出场人物】\n';
    }

    // 异步加载所有角色数据
    var loadRoleData = 角色名.length
      ? Promise.all(角色名.map(function(rn) {
          return Store.character.get(rn).then(function(d) { return { name: rn, data: d }; });
        })).then(function(loaded) {
          loaded.forEach(function(item) {
            ctx += (item.data && item.data.identity ? JSON.stringify({ identity: item.data.identity }, null, 2) : '- ' + item.name) + '\n';
          });
        })
      : Promise.resolve();

    // 角色加载完后调 LLM
    loadRoleData.then(function() {
      var 环节类型说明 = mk === 'tv' ? '环节类型说明：anchor_lead(主播引入)、correspondent(记者连线)、interview(采访)、anchor_comment(主播评论)' : mk === 'radio' ? '环节类型说明：dj_opener(开场白)、news_read(新闻播报)、phone_in(热线)、interview(访谈)、music_interlude(音乐插曲)、dj_comment(点评)、closing(结束语)' : '';
      var sectionKeys = JSON.stringify(cfg.sections);
      var outputFormat = isScript ? 'sections 的 key 必须与栏目结构完全一致，即 ' + sectionKeys + '。\n格式：{"sections":{"栏目名":[{"type":"环节类型","speaker":"发言人","content":"内容"},...]}}' : 'sections 的 key 必须与栏目结构完全一致，即 ' + sectionKeys + '。\n格式：{"sections":{"版块名":[{"title":"标题","byline":"记者","lead":"导语","content":"正文"},...]}}';
      var sysPrompt = isScript
        ? (mk === 'tv' ? '你是一名电视新闻编导。生成完整节目脚本。每个环节标明发言人。主持人负责引导和串场，但参与角色不能只是被提及——他们必须有实际对话和互动，和主持人之间形成有来有回的交流。避免主持人独白过长，确保每个出场人物都有属于自己的发言段落。' : '你是一名电台节目编导。生成完整电台脚本。每个环节标明发言人。主持人负责引导和串场，但参与角色必须有实际对话和互动，不能只是主持人在独白。确保每个出场人物都有发言。')
        : '你是一名资深新闻编辑。生成完整报纸内容。每个版块包含若干篇文章。';
      var req = isScript ? '每个栏目不少于10个环节，每段口播100-300字。每个出场人物至少要有一次发言。' : '每个版块至少2-3篇文章，正文100-300字';

      LLM.callJSON({
        prompt: ctx + '\n【输出格式】\n' + outputFormat + '\n' + 环节类型说明 + '\n要求：' + req,
        system: sysPrompt,
        label: '期号内容生成',
        temperature: 0.85
      }).then(function(data) {
        if (!data || !data.sections) { toast('生成失败'); return; }
        var saves = [];
        // 兼容 sections 为数组（[{name,segments},{name,segments}]）或对象（{栏目名:[...]}）两种格式
        var sectionMap = {};
        if (Array.isArray(data.sections)) {
          data.sections.forEach(function(s) { sectionMap[s.name] = s.segments || s.articles || s.items || []; });
        } else {
          Object.keys(data.sections).forEach(function(k) { sectionMap[k] = data.sections[k]; });
        }
        cfg.sections.forEach(function(section) {
          var items = sectionMap[section] || [];
          if (isScript) {
            saves.push(新闻媒体保存版块(期号路径, section, { section: section, segments: items }));
          } else {
            saves.push(新闻媒体保存版块(期号路径, section, { section: section, articles: items }));
          }
        });
        return Promise.all(saves);
      }).then(function() {
        toast('✅ 第' + epNum + '期内容已全部生成');
        新闻媒体渲染列表(document.getElementById('npContentView'));
      }).catch(function(err) { toast('❌ ' + err.message); });
    }).catch(function(err) { toast('❌ ' + err.message); });
  }).catch(function(err) { toast('❌ ' + err.message); });
};
