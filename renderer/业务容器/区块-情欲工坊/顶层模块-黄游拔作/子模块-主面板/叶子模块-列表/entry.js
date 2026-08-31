// 黄游拔作 · 📋 游戏列表（点游戏 → 进入 Steam 风格详情页）
function 黄游渲染列表(el) {
  黄游渲染游戏列表(el);
}

// 列表卡片颜色（按名字哈希生成好看的渐变）
function 黄游列表色(s) {
  var h = 0; s = String(s || '');
  for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return 'linear-gradient(135deg,hsl(' + h + ',58%,46%),hsl(' + ((h + 45) % 360) + ',52%,33%))';
}
var 黄游列表样式 = '<style>.hybz-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(272px,1fr));gap:14px}.hybz-card{background:linear-gradient(180deg,var(--bg2),var(--bg3));border:1px solid rgba(102,192,244,.1);border-radius:14px;overflow:hidden;cursor:pointer;transition:transform .12s,box-shadow .12s,border-color .12s}.hybz-card:hover{transform:translateY(-3px);box-shadow:0 10px 26px rgba(0,0,0,.45);border-color:rgba(102,192,244,.35)}.hybz-cover{position:relative;height:112px;display:flex;align-items:center;justify-content:center;font-size:46px;background:linear-gradient(135deg,var(--bg3),var(--bg2));color:var(--accent2)}.hybz-ent-tag{position:absolute;top:8px;left:8px;font-size:9px;padding:2px 9px;border-radius:10px;background:linear-gradient(135deg,#66c0f4,#2a7ac2);color:#0e141b;font-weight:700;letter-spacing:.5px}.hybz-body{padding:12px 14px}.hybz-title{font-size:14px;font-weight:700;color:var(--fg)}.hybz-tags{display:flex;gap:5px;margin-top:5px;flex-wrap:wrap}.hybz-tag{font-size:9px;padding:2px 8px;border-radius:9px;background:rgba(102,192,244,.14);color:#9fd0f0}.hybz-tag.sub{background:rgba(122,79,191,.18);color:#c9a9ff}.hybz-focus{font-size:10px;color:var(--fg2);margin-top:6px;line-height:1.5}.hybz-dlc{position:relative;margin-top:9px;padding:9px 10px;border-radius:10px;background:rgba(0,0,0,.18);border:1px solid rgba(240,185,82,.16)}.hybz-dlc-head{font-size:9px;color:#e0b952;font-weight:700;margin-bottom:6px;letter-spacing:.4px}.hybz-dlc-tiles{display:flex;flex-direction:column;gap:5px}.hybz-dlc-tile{display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.03);cursor:pointer;transition:background .1s,border-color .1s}.hybz-dlc-tile:hover{background:rgba(102,192,244,.1);border-color:rgba(102,192,244,.3)}.hybz-dlc-ic{width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;flex:0 0 auto}.hybz-dlc-name{font-size:11px;color:#c7d5e0;flex:1;line-height:1.4}.hybz-dlc-dev{font-size:9px;color:#66c0f4;padding:2px 7px;border-radius:7px;background:rgba(102,192,244,.14);border:1px solid rgba(102,192,244,.3);flex:0 0 auto;white-space:nowrap}.hybz-dlc-dev:hover{background:rgba(102,192,244,.22)}.hybz-actions{display:flex;gap:5px;margin-top:10px;flex-wrap:wrap}.hybz-btn{font-size:10px;padding:3px 9px;border-radius:8px;cursor:pointer;border:1px solid transparent;transition:background .1s}.hybz-btn.dev{color:#66c0f4;border-color:rgba(102,192,244,.3)}.hybz-btn.dev:hover{background:rgba(102,192,244,.12)}.hybz-btn.edit{color:#c7d5e0;border-color:rgba(199,213,224,.2)}.hybz-btn.del{color:#e06565;border-color:rgba(224,101,101,.3)}.hybz-dlc-del{font-size:11px;color:#8f98a0;padding:2px 5px;border-radius:6px;cursor:pointer;flex:0 0 auto}.hybz-dlc-del:hover{color:#e06565;background:rgba(224,101,101,.15)}</style>';

function 黄游渲染游戏列表(el) {
  el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--fg2)">加载中...</div>';
  var cat = 黄游当前分类;
  黄游列出游戏(cat).then(function(games) {
    if (!games || !games.length) {
      el.innerHTML = '<div style="padding:40px;text-align:center"><div style="font-size:40px;margin-bottom:12px">' + 黄游游戏分类[cat].icon + '</div><div class="placeholder-text" style="margin-bottom:12px">还没有收录游戏，先创建一个吧</div><button class="btn-new" onclick="黄游切换标签(\'plan\')">＋ 新建</button></div>';
      return;
    }
    var h = 黄游列表样式 + '<div class="hybz-list">';
    h += '<div class="mb-10"><button class="btn-new" onclick="黄游切换标签(\'plan\')">＋ 新建</button></div>';

    h += '<div class="hybz-grid">';
    Promise.all(games.map(function(p) {
      return 黄游列出DLC(cat, p._dir).then(function(dlcs) { return { game: p, dlcs: (dlcs || []) }; });
    })).then(function(items) {
      items.forEach(function(it) {
        var p = it.game, dlcs = it.dlcs;
        var cfg = 黄游获取词条配置(p.type, p.subtype);
        // —— 本体卡片 ——
        h += '<div class="hybz-card" onclick="黄游打开详情(\'' + p._dir + '\')">';
        h += '<div class="hybz-cover"><span class="hybz-ent-tag">本体</span>' + (cfg.icon || '🎮') + '</div>';
        h += '<div class="hybz-body">';
        h += '<div class="hybz-title">' + escHtml(p.name) + '</div>';
        h += '<div class="hybz-tags">' + (p.type ? '<span class="hybz-tag">' + escHtml(cfg.label || p.type) + '</span>' : '') + (p.subtype ? '<span class="hybz-tag sub">' + escHtml(p.subtype) + '</span>' : '') + '</div>';
        if (p.focus) h += '<div class="hybz-focus">📌 ' + escHtml(p.focus.length > 36 ? p.focus.slice(0, 36) + '…' : p.focus) + '</div>';
        // —— DLC 区（本体 vs DLC 明显区分，DLC 之间也各自独立）——
        if (dlcs.length) {
          h += '<div class="hybz-dlc"><div class="hybz-dlc-head">🗃 DLC · 点击查看详情，右侧 👨‍💻 进入其开发者模式</div><div class="hybz-dlc-tiles">';
          dlcs.forEach(function(dl) {
            h += '<div class="hybz-dlc-tile" onclick="event.stopPropagation();黄游打开DLC详情(\'' + p._dir + '\',\'' + (dl._dir || dl.name) + '\')"><div class="hybz-dlc-ic" style="background:' + 黄游列表色(dl.name) + '">' + escHtml((dl.name || 'D').slice(0, 1)) + '</div><div class="hybz-dlc-name">' + escHtml(dl.name || '未命名 DLC') + '</div><span class="hybz-dlc-dev" onclick="event.stopPropagation();黄游跳转DLC开发者模式(\'' + p._dir + '\',\'' + (dl._dir || dl.name) + '\')">👨‍💻 开发者模式</span><span class="hybz-dlc-del" onclick="event.stopPropagation();黄游删除DLC确认(\'' + p._dir + '\',\'' + (dl._dir || dl.name) + '\')" title="删除该 DLC">🗑</span></div>';
          });
          h += '</div></div>';
        }
        h += '<div class="hybz-actions">';
        h += '<span class="hybz-btn dev" onclick="event.stopPropagation();黄游跳转开发者模式(\'' + p._dir + '\')">👨‍💻 开发者模式</span>';
        h += '<span class="hybz-btn edit" onclick="event.stopPropagation();黄游编辑游戏(\'' + p._dir + '\')">✏️ 编辑</span>';
        h += '<span class="hybz-btn del" onclick="event.stopPropagation();黄游删除游戏确认(\'' + p._dir + '\')">🗑</span>';
        h += '</div></div></div>';
      });
      h += '</div></div>';
      el.innerHTML = h;
    });
  });
}

// 快捷跳转：从列表直接进入【本体游戏】的开发者模式
window.黄游跳转开发者模式 = function(游戏名) {
  var cat = 黄游当前分类;
  黄游加载游戏(cat, 游戏名).then(function(info) {
    if (!info) { toast('游戏数据不存在'); return; }
    黄游当前游戏 = { name: 游戏名, info: info, cat: cat, isDLC: false, dlcOf: '' };
    if (typeof 黄游打开内容 === 'function') 黄游打开内容(); else 黄游渲染详情(document.getElementById('yyContentView'));
  });
};
// 快捷跳转：从列表直接进入【某个 DLC】的开发者模式
window.黄游跳转DLC开发者模式 = function(游戏名, dlc名) {
  var cat = 黄游当前分类;
  黄游加载DLC(cat, 游戏名, dlc名).then(function(info) {
    if (!info) { toast('DLC 数据不存在'); return; }
    黄游当前游戏 = { name: dlc名, info: info, cat: cat, isDLC: true, dlcOf: 游戏名 };
    if (typeof 黄游打开内容 === 'function') 黄游打开内容(); else 黄游渲染详情(document.getElementById('yyContentView'));
  });
};

window.黄游编辑游戏 = function(游戏名) {
  var cat = 黄游当前分类;
  黄游加载游戏(cat, 游戏名).then(function(info) {
    if (!info) { toast('游戏数据不存在'); return; }
    window.黄游规划游戏表单 = {
      type: info.type || '',
      subtype: info.subtype || '',
      name: info.name || '',
      focus: info.focus || '',
      description: info.description || '',
      refSources: info.refSourceNames || [],
      refChars: info.refChars || [],
      _editing: true,
      _editName: 游戏名
    };
    黄游游戏简介缓存 = info.description || '';
    (info.refChars || []).forEach(function(cn) {
      if (cn && !window.黄游角色完整缓存[cn]) {
        Store.character.get(cn).then(function(d) { if (d) window.黄游角色完整缓存[cn] = d; });
      }
    });
    黄游当前游戏 = null;
    黄游切换标签('plan');
  });
};

window.黄游删除游戏确认 = function(游戏名) {
  if (!confirm('确定删除游戏「' + 游戏名 + '」及其全部内容？')) return;
  var cat = 黄游当前分类;
  黄游删除游戏(cat, 游戏名).then(function() {
    toast('已删除');
    黄游渲染列表(document.getElementById('yyContentView'));
  });
};

window.黄游渲染列表 = 黄游渲染列表;
