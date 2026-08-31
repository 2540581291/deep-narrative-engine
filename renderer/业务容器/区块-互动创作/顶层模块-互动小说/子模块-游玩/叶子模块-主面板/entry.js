// 互动小说（重做·玩家实时生成）· 游玩层
// 玩家核心：沉浸阅读 + AI 实时生成的意图化选项 + 尺度旋钮 + 存档/回退/结局图鉴。

var 互动小说尺度档 = ['含蓄隐晦', '唯美风雅', '直白露骨', '粗俗露骨'];

function 渲染互动小说游玩(el, story) {
  if (!story || !story.nodes) { el.innerHTML = '<div class="placeholder-text">请选择故事</div>'; return; }
  var node = story.nodes[story.当前节点id];
  var h = '';
  // 顶栏：返回 / 标题 / 尺度旋钮 / 存档 / 回退
  h += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">';
  h += '<button class="btn-secondary btn-sm" onclick="互动小说去列表()">← 列表</button>';
  h += '<div style="font-size:14px;font-weight:700;flex:1;min-width:120px">🎮 ' + escHtml(story.title) + '</div>';
  h += '<label style="font-size:10px;color:var(--fg3)">尺度</label>';
  h += '<select class="llm-input llm-select" style="font-size:11px;padding:2px 6px;width:auto" onchange="互动小说改尺度(\'' + story.id + '\',this.value)">';
  互动小说尺度档.forEach(function(s) { h += '<option value="' + s + '"' + (story.尺度 === s ? ' selected' : '') + '>' + s + '</option>'; });
  h += '</select>';
  h += '<button class="btn-secondary btn-sm" title="已自动存档" onclick="互动小说存档(\'' + story.id + '\')">💾 存档</button>';
  h += '<button class="btn-secondary btn-sm" onclick="互动小说回退游玩(\'' + story.id + '\')">↩ 回退</button>';
  if (node) {
    h += '<button class="btn-secondary btn-sm" style="font-size:10px" onclick="互动小说编辑节点(\'' + story.id + '\')">✏️ 编辑本段</button>';
    h += '<button class="btn-secondary btn-sm" style="font-size:10px" onclick="互动小说重生成本段(\'' + story.id + '\')">🔄 重写本段</button>';
  }
  h += '</div>';
  // 阅读区（优先 lines 分行渲染：台词高亮，旁白正常；无 lines 回退 text）
  var 阅读内容 = 互动小说渲染正文(node);
  h += '<div class="n-card" id="inPlayText" style="min-height:170px;margin-bottom:10px;line-height:1.95;font-size:14.5px;padding:18px 20px">' + 阅读内容 + '</div>';
  // 出场角色（可点开档案）
  if (node && node.cast && node.cast.length) {
    h += '<div style="margin-bottom:10px">' + node.cast.map(function(cn) {
      return '<span class="badge-tag cur-ptr" style="cursor:pointer" onclick="互动小说角色卡(\'' + story.id + '\',\'' + escHtml(cn) + '\')">' + escHtml(cn) + '</span>';
    }).join(' ') + '</div>';
  }
  // 世界状态抽屉（数据已有，前端展示）
  if (node && node.world) {
    var w = node.world;
    h += '<div style="margin-bottom:10px">';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;padding:8px 12px;background:var(--bg2);border:1px solid var(--border);border-radius:8px" onclick="互动小说切世界态(\'' + story.id + '\')">';
    h += '<span style="font-size:11px;color:var(--fg2)">📊 世界状态</span>';
    h += '<span style="font-size:10px;color:var(--fg3)">' + (w.地点 || '?') + ' · ' + (w.时间 || '') + (window.__inWorldOpen ? ' ▾' : ' ▸') + '</span></div>';
    h += '<div id="inWorldPanel" style="display:' + (window.__inWorldOpen === story.id ? 'block' : 'none') + ';margin-top:6px;padding:10px 12px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;font-size:11px;color:var(--fg2);line-height:1.8">';
    h += '<div><b style="color:var(--fg)">地点</b>　' + escHtml(w.地点 || '—') + '</div>';
    h += '<div><b style="color:var(--fg)">时间</b>　' + escHtml(w.时间 || '—') + '</div>';
    h += '<div><b style="color:var(--fg)">在场</b>　' + ((w.在场 || []).join('、') || '—') + '</div>';
    var 好感 = w.好感 || {};
    var 好感键 = Object.keys(好感);
    if (好感键.length) {
      h += '<div style="margin-top:4px"><b style="color:var(--fg)">好感</b></div>';
      好感键.forEach(function(k) {
        var v = 好感[k];
        h += '<div style="display:flex;align-items:center;gap:6px;margin-top:2px"><span style="flex:0 0 70px;color:var(--fg2)">' + escHtml(k) + '</span><div style="flex:1;height:6px;background:var(--bg);border-radius:4px;overflow:hidden"><div style="height:100%;width:' + Math.max(0, Math.min(100, v * 4)) + '%;background:linear-gradient(90deg,#ff8ab0,#ff5c8a)"></div></div><span style="flex:0 0 24px;text-align:right;color:var(--fg)">' + v + '</span></div>';
      });
    }
    var 变量 = w.变量 || {}; var 变量键 = Object.keys(变量);
    if (变量键.length) h += '<div style="margin-top:5px"><b style="color:var(--fg)">变量</b>　' + escHtml(变量键.map(function(k) { return k + '=' + 变量[k]; }).join('　')) + '</div>';
    if (w.事件 && w.事件.length) h += '<div style="margin-top:5px"><b style="color:var(--fg)">已发生事件</b><br>' + (w.事件 || []).map(function(e) { return '· ' + escHtml(e); }).join('<br>') + '</div>';
    h += '</div></div>';
  }
  // 剧情回放时间轴（历史）
  if (story.历史 && story.历史.length > 1) {
    h += '<div style="margin-bottom:10px"><div style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;padding:8px 12px;background:var(--bg2);border:1px solid var(--border);border-radius:8px" onclick="互动小说切回放(\'' + story.id + '\')">';
    h += '<span style="font-size:11px;color:var(--fg2)">🗺 剧情回放（已走 ' + story.历史.length + ' 步）</span>';
    h += '<span style="font-size:10px;color:var(--fg3)">' + (window.__inReplayOpen === story.id ? '▾' : '▸') + '</span></div>';
    h += '<div id="inReplayPanel" style="display:' + (window.__inReplayOpen === story.id ? 'block' : 'none') + ';margin-top:6px;padding:10px 12px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;max-height:200px;overflow-y:auto">';
    var hists = story.历史 || [];
    hists.forEach(function(nid, hi) {
      var n = story.nodes[nid];
      var txt = n ? (n.summary || n.text || '').slice(0, 44) : '';
      h += '<div style="position:relative;padding:0 0 10px 18px;border-left:1px solid var(--border)">';
      h += '<span style="position:absolute;left:-4px;top:2px;width:7px;height:7px;border-radius:50%;background:' + (hi === hists.length - 1 ? 'var(--accent2)' : 'var(--fg3)') + '"></span>';
      h += '<div style="font-size:10px;color:var(--fg3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">第 ' + (hi + 1) + ' 步 · ' + escHtml(txt) + (n && n.ending ? ' · 🏁 ' + escHtml(n.ending) : '') + '</div>';
      h += '</div>';
    });
    h += '</div></div>';
  }
  // 结局 vs 选项
  if (node && node.type === '结局') {
    h += '<div style="background:linear-gradient(160deg,var(--accent2)22,transparent);border:1px solid var(--accent2);border-radius:12px;padding:14px;margin-bottom:8px">';
    h += '<div style="font-size:16px;font-weight:800;color:var(--accent);margin-bottom:6px">🏁 结局：' + escHtml(node.ending || '终') + '</div>';
    h += '<div style="font-size:10px;color:var(--fg3);margin-bottom:12px">已达结局：' + ((story.结局集 || []).map(function(e) { return escHtml(e); }).join(' · ') || '-') + '</div>';
    h += '<button class="btn" onclick="互动小说去列表()">返回我的故事</button>';
    h += '</div>';
  } else {
    h += '<div id="inPlayOptions" style="display:flex;flex-direction:column;gap:6px">';
    var opts = (node && node.options) || [];
    if (!opts.length) h += '<div class="text-muted text-sm">（剧情暂无可选项 — 可点「回退」回上一步，或继续）</div>';
    opts.forEach(function(o, i) {
      h += '<div class="n-card cur-ptr" style="padding:9px 12px;border-radius:8px;cursor:pointer" onclick="互动小说选择(\'' + story.id + '\',' + i + ')">';
      h += '<span class="badge-tag" style="margin-right:6px;background:var(--accent-dim);color:var(--accent2)">' + escHtml(o.intent) + '</span>' + escHtml(o.text) + '</div>';
    });
    // 自定义输入（自行输入回复/行动，走"自定义"意图）
    h += '<div style="margin-top:8px"><div class="text-sm text-muted" style="margin-bottom:4px">✍️ 或自行输入你的回复 / 行动</div>';
    h += '<div style="display:flex;gap:6px"><input class="llm-input" id="inCustomAction" placeholder="输入你想说的话或做的事…" style="flex:1;height:30px;font-size:12px" onkeydown="if(event.key===\'Enter\')互动小说自定义(\'' + story.id + '\')">';
    h += '<button class="btn-secondary btn-sm" onclick="互动小说自定义(\'' + story.id + '\')">↩ 发送</button></div></div>';
    h += '</div>';
  }
  // 进度
  h += '<div style="margin-top:10px;font-size:10px;color:var(--fg3)">第 ' + (story.历史 || []).length + ' 步 · 已生成 ' + Object.keys(story.nodes || {}).length + ' 段 · 结局 ' + (story.结局集 || []).length + ' 个</div>';
  el.innerHTML = h;
}

function 互动小说游玩目标() { return document.getElementById('inViewContent'); }

// 角色名稳定取色（谐音灯——不同角色不同色）
function 互动小说角色色(名字) {
  var s = (名字 || '旁白');
  var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  var 色 = ['#d4889e', '#d4c4f0', '#7ee0a8', '#67c1f5', '#e0b952', '#f6a0c0'][h % 6];
  return 色;
}

// 正文渲染：优先 lines 分行（台词高亮+角色名，旁白正常），无则回退整段 text
function 互动小说渲染正文(node) {
  if (!node) return '';
  var lines = node.lines;
  if (lines && lines.length) {
    return lines.map(function(l) {
      var sp = (l && l.speaker) ? String(l.speaker).trim() : '';
      var txt = (l && l.text) ? String(l.text) : '';
      if (!txt) return '';
      if (sp) {
        var c = 互动小说角色色(sp);
        return '<div style="margin:6px 0"><span style="font-weight:700;color:' + c + '">' + escHtml(sp) + '</span><span style="color:var(--fg3)">：</span><span style="color:#f0ead8">' + escHtml(txt) + '</span></div>';
      }
      return '<div style="color:var(--fg2);margin:4px 0">' + escHtml(txt) + '</div>';
    }).join('');
  }
  return '<span style="white-space:pre-wrap">' + escHtml(node.text || '') + '</span>';
}

function 互动小说选择(故事id, idx) {
  互动小说取故事(故事id).then(function(story) {
    if (!story) return;
    var t = document.getElementById('inPlayText'); if (t) t.textContent = (t.textContent || '') + '\n\n⏳ 生成中…';
    var o = document.getElementById('inPlayOptions'); if (o) o.innerHTML = '<div class="text-sm text-muted">⏳ 剧情生成中…</div>';
    互动小说下一步生成(story, idx).then(function(res) {
      渲染互动小说游玩(互动小说游玩目标(), res.story);
      if (res.ending) toast('已抵达结局「' + res.ending + '」');
    }).catch(function(e) { toast('生成失败：' + (e && e.message || '未知')); 互动小说取故事(故事id).then(function(s) { 渲染互动小说游玩(互动小说游玩目标(), s); }); });
  });
}
// 自定义自由输入 → 生成下一段
function 互动小说自定义(故事id) {
  var v = ((document.getElementById('inCustomAction') || {}).value || '').trim();
  if (!v) { toast('请输入你的回复或行动'); return; }
  互动小说取故事(故事id).then(function(story) {
    if (!story) return;
    var t = document.getElementById('inPlayText'); if (t) t.textContent = (t.textContent || '') + '\n\n⏳ 生成中…';
    var o = document.getElementById('inPlayOptions'); if (o) o.innerHTML = '<div class="text-sm text-muted">⏳ 剧情生成中…</div>';
    互动小说自定义生成(story, v).then(function(res) {
      渲染互动小说游玩(互动小说游玩目标(), res.story);
      if (res.ending) toast('已抵达结局「' + res.ending + '」');
    }).catch(function(e) { toast('生成失败：' + (e && e.message || '未知')); 互动小说取故事(故事id).then(function(s) { 渲染互动小说游玩(互动小说游玩目标(), s); }); });
  });
}
function 互动小说回退游玩(故事id) {
  互动小说取故事(故事id).then(function(story) {
    if (!story) return;
    互动小说回退(story).then(function(s) { 渲染互动小说游玩(互动小说游玩目标(), s); }).catch(function(e) { toast(e.message || '回退失败'); });
  });
}
function 互动小说存档(故事id) {
  toast('已存档（每步自动存档）');
}
function 互动小说改尺度(故事id, 尺度) {
  互动小说取故事(故事id).then(function(story) {
    if (!story) return;
    story.尺度 = 尺度;
    互动小说存故事(story).then(function() { toast('尺度已切至「' + 尺度 + '」'); });
  });
}
function 互动小说去列表() { if (typeof 互动小说切换视图 === 'function') 互动小说切换视图('list'); }
function 互动小说开始游玩(故事id) {
  互动小说取故事(故事id).then(function(story) {
    if (!story) { toast('故事不存在'); return; }
    if (!story.nodes || !Object.keys(story.nodes).length) {
      // 首次进入：生成开场
      var t = document.getElementById('inViewContent');
      if (t) t.innerHTML = '<div class="placeholder-text">⏳ 正在用 AI 写开场…</div>';
      互动小说开场生成(story).then(function(s) { 渲染互动小说游玩(t, s); }).catch(function(e) { toast('开场生成失败：' + (e && e.message || '未知')); 互动小说取故事(故事id).then(function(s) { 渲染互动小说游玩(t, s); }); });
      return;
    }
    渲染互动小说游玩(互动小说游玩目标(), story);
  });
}

window.渲染互动小说游玩 = 渲染互动小说游玩;
window.互动小说选择 = 互动小说选择;
window.互动小说自定义 = 互动小说自定义;
window.互动小说回退游玩 = 互动小说回退游玩;
window.互动小说存档 = 互动小说存档;
window.互动小说改尺度 = 互动小说改尺度;
window.互动小说去列表 = 互动小说去列表;
window.互动小说开始游玩 = 互动小说开始游玩;

// ===== 游玩增强：世界状态抽屉 / 剧情回放 / 角色档案卡 =====
function 互动小说切世界态(故事id) {
  window.__inWorldOpen = (window.__inWorldOpen === 故事id) ? '' : 故事id;
  互动小说取故事(故事id).then(function(s) { if (s) 渲染互动小说游玩(互动小说游玩目标(), s); });
}
function 互动小说切回放(故事id) {
  window.__inReplayOpen = (window.__inReplayOpen === 故事id) ? '' : 故事id;
  互动小说取故事(故事id).then(function(s) { if (s) 渲染互动小说游玩(互动小说游玩目标(), s); });
}
function 互动小说角色卡(故事id, 角色名) {
  互动小说取故事(故事id).then(function(s) {
    if (!s) return;
    var c = (s.cast || []).filter(function(x) { return x && x.name === 角色名; })[0];
    if (!c) { toast('未找到角色「' + 角色名 + '」'); return; }
    var 好感 = ((s.nodes && Object.keys(s.nodes).length) ? (s.nodes[s.nodes[Object.keys(s.nodes)[0]]] && s.nodes[s.nodes[Object.keys(s.nodes)[0]]].world || {}) : {}).好感 || {};
    var 好感值 = 好感[角色名];
    var html = '<div class="mcard" style="max-width:520px">';
    html += '<div style="font-size:15px;font-weight:700;margin-bottom:6px">👤 ' + escHtml(c.name || 角色名) + '</div>';
    html += '<div style="font-size:11px;color:var(--fg2);line-height:2;margin-bottom:8px">';
    html += '<div><b style="color:var(--fg)">性别</b>　' + escHtml(c.gender || '—') + '</div>';
    html += '<div><b style="color:var(--fg)">年龄</b>　' + escHtml(c.age != null ? c.age : '—') + '</div>';
    html += '<div><b style="color:var(--fg)">身份</b>　' + escHtml(c.identity || '—') + '</div>';
    html += '<div><b style="color:var(--fg)">性格</b>　' + escHtml(c.personality || '—') + '</div>';
    html += '<div><b style="color:var(--fg)">口吻</b>　' + escHtml(c.voice || '—') + '</div>';
    if (好感值 != null) html += '<div><b style="color:var(--fg)">当前好感</b>　' + escHtml(String(好感值)) + '</div>';
    html += '</div></div>';
    var ov = document.createElement('div');
    ov.className = 'ovl';
    ov.innerHTML = html;
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
    setTimeout(function() { var d = ov.querySelector('.mcard'); if (d) { d.style.cursor = 'pointer'; d.onclick = function() { ov.remove(); }; } }, 50);
  });
}
window.互动小说切世界态 = 互动小说切世界态;
window.互动小说切回放 = 互动小说切回放;
window.互动小说角色卡 = 互动小说角色卡;

// ===== 编辑 / 重生成当前节点 =====
function 互动小说编辑节点(故事id) {
  互动小说取故事(故事id).then(function(s) {
    if (!s) return;
    var node = s.nodes[s.当前节点id];
    if (!node) { toast('当前无节点可编辑'); return; }
    window.__inEditId = 故事id;
    var html = '<div class="mcard" style="max-width:640px"><div style="font-size:14px;font-weight:700;margin-bottom:8px">✏️ 编辑本段</div>';
    html += '<textarea class="llm-input" id="inEditText" rows="8" style="width:100%;resize:vertical">' + escHtml(node.text || '') + '</textarea>';
    html += '<div style="margin-top:10px;display:flex;justify-content:flex-end;gap:8px"><button class="btn-out btn-sm" onclick="this.closest(\'.ovl\').remove()">取消</button><button class="btn-main" onclick="互动小说编辑节点保存(\'' + 故事id + '\')">保存</button></div></div>';
    var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = html;
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
    setTimeout(function() { var d = document.getElementById('inEditText'); if (d) d.focus(); }, 60);
  });
}
function 互动小说编辑节点保存(故事id) {
  var v = (document.getElementById('inEditText') || {}).value || '';
  document.querySelectorAll('.ovl').forEach(function(el) { el.remove(); });
  互动小说取故事(故事id).then(function(s) {
    if (!s) return;
    var node = s.nodes[s.当前节点id];
    if (node) { node.text = v; node.lines = null; } // 手动改正文：清掉分行渲染
    互动小说存故事(s);
  }).then(function() { toast('✅ 已保存'); 互动小说取故事(故事id).then(function(s) { if (s) 渲染互动小说游玩(互动小说游玩目标(), s); }); });
}
// 重写当前节点（AI 基于上下文只重写本段正文；不改后续分支）
function 互动小说重生成本段(故事id) {
  互动小说取故事(故事id).then(function(s) {
    if (!s) return;
    var node = s.nodes[s.当前节点id];
    if (!node) { toast('当前无节点'); return; }
    var t = document.getElementById('inPlayText'); if (t) t.innerHTML = '<div class="text-muted" style="padding:12px">⏳ 正在重写本段…</div>';
    互动小说重生成节点(s, node).then(function(story) {
      渲染互动小说游玩(互动小说游玩目标(), story);
      toast('✅ 已重写本段');
    }).catch(function(e) { toast('重写失败：' + (e && e.message || '未知')); 互动小说取故事(故事id).then(function(st) { if (st) 渲染互动小说游玩(互动小说游玩目标(), st); }); });
  });
}
window.互动小说编辑节点 = 互动小说编辑节点;
window.互动小说编辑节点保存 = 互动小说编辑节点保存;
window.互动小说重生成本段 = 互动小说重生成本段;
