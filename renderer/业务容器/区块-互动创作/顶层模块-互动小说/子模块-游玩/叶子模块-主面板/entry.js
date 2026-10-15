// 互动小说（重做·玩家实时生成）· 游玩层
// 玩家核心：沉浸阅读 + AI 实时生成的意图化选项 + 尺度旋钮 + 存档/回退/结局图鉴。

var 互动小说尺度档 = ['含蓄隐晦', '唯美风雅', '直白露骨', '粗俗露骨'];

function 渲染互动小说游玩(el, story) {
  if (!story || !story.nodes) { el.innerHTML = '<div class="placeholder-text">请选择故事</div>'; return; }
  // 整块重绘会重建 DOM，先记住玩家还没发出去的输入（切换世界状态/回放/条件等只看不发的操作都会触发重绘）
  var 旧输入框 = document.getElementById('inCustomAction');
  var 输入草稿 = (旧输入框 && 旧输入框.value) || '';
  var 输入有焦点 = !!(旧输入框 && document.activeElement === 旧输入框);
  var 光标位 = 输入有焦点 ? (旧输入框.selectionStart || 0) : 0;
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
  h += '<button class="btn-secondary btn-sm" style="font-size:10px" title="按顺序翻看已经走过的所有正文" onclick="互动小说回看前文(\'' + story.id + '\')">📜 回看前文</button>';
  h += '<button class="btn-secondary btn-sm" style="font-size:10px" title="复制一份进度清零、设定保留的新档" onclick="互动小说以此重开确认(\'' + story.id + '\')">🔁 以此重开</button>';
  if (node) {
    h += '<button class="btn-secondary btn-sm" style="font-size:10px" onclick="互动小说编辑节点(\'' + story.id + '\')">✏️ 编辑本段</button>';
    h += '<button class="btn-secondary btn-sm" style="font-size:10px" onclick="互动小说重生成本段(\'' + story.id + '\')">🔄 重写本段</button>';
  }
  h += '</div>';
  // 终局条件相关数据（横幅与面板都要用，先算出来）
  var 条件表 = story.终局条件 || [];
  var 世界态 = (node && node.world) || {};
  // 事实表 = 钉住的 + 累积的（事件类条件在这两个池里都能命中，要和数据层的口径一致）
  var 钉事实表 = story.关键事实钉 || [];
  var 事实表 = (story.关键事实 || []).concat(钉事实表);
  var 步数 = (story.历史 || []).length;
  var 已达成的 = 条件表.filter(function(c) { return 互动小说条件进度(c, 世界态, 事实表, 步数).已达成; }).map(function(c) { return c.名称 || '结局'; });
  var 已达成数 = 已达成的.length;
  // 只在这盘已经玩起来之后才检查"引用不存在"（新开的故事还没跑出变量，会误报）
  var 已知名 = (条件表.length && 步数 >= 8 && typeof 互动小说已知变量与角色 === 'function') ? 互动小说已知变量与角色(story) : null;

  // 横幅：达成条件只作提示，不强制收尾（收尾由玩家点按钮触发）
  if (story.待收束) {
    h += '<div style="margin-bottom:10px;padding:10px 14px;border-radius:10px;background:var(--accent-dim);border:1px solid var(--accent2)">';
    h += '<div style="font-size:13.5px;font-weight:700;color:var(--accent2)">🏁 正在收尾：「' + escHtml(story.待收束.名称 || '') + '」</div>';
    h += '<div style="font-size:11.5px;color:var(--fg2);margin-top:4px">下一步生成的就是这个故事的结局 —— 选任意一个选项，或直接在下方输入后发送。</div>';
    h += '</div>';
  } else if (已达成的.length) {
    h += '<div style="margin-bottom:10px;padding:10px 14px;border-radius:10px;background:var(--accent-dim);border:1px solid var(--accent2)">';
    h += '<div style="font-size:13.5px;font-weight:700;color:var(--accent2)">🏁 已达成「' + escHtml(已达成的.join('、')) + '」</div>';
    h += '<div style="font-size:11.5px;color:var(--fg2);margin-top:4px;line-height:1.7">目标已达到，但<b>不会强制结束</b> —— 你可以继续游玩，剧情照常往前走。想收尾时点下面的按钮，我就为这个故事写下结局。</div>';
    h += '<div style="margin-top:8px"><button class="btn-secondary btn-sm" onclick="互动小说就此收尾(\'' + story.id + '\')">🏁 就此收尾，写下结局</button></div>';
    h += '</div>';
  }
  h += '<div style="margin-bottom:10px">';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;padding:8px 12px;background:var(--bg2);border:1px solid ' + (story.待收束 ? 'var(--accent2)' : 'var(--border)') + ';border-radius:8px" onclick="互动小说切条件(\'' + story.id + '\')">';
  h += '<span style="font-size:12.5px;color:var(--fg)">🏁 终局条件</span>';
  h += '<span style="font-size:11.5px;color:var(--fg2)">已达成 ' + 已达成数 + '/' + 条件表.length + ' <span id="inCondArrow">' + (window.__inCondOpen === story.id ? '▾' : '▸') + '</span></span></div>';
  h += '<div id="inCondPanel" style="display:' + (window.__inCondOpen === story.id ? 'block' : 'none') + ';margin-top:6px;padding:10px 12px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;font-size:12.5px;color:var(--fg2);line-height:1.85">';
  if (!条件表.length) h += '<div>还没有终局条件 —— 故事会自由发展。可以「＋ 添加条件」自己定，或让 AI 重拟一组。</div>';
  条件表.forEach(function(c, i) {
    var 进度 = 互动小说条件进度(c, 世界态, 事实表, 步数);
    var 达成 = 进度.已达成;
    var 判 = c.判定 || {};
    h += '<div style="margin-top:8px;padding:8px 10px;border-radius:8px;background:var(--bg);border:1px solid ' + (达成 ? 'var(--accent2)' : 'var(--border)') + '">';
    h += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">';
    h += '<span style="color:' + (达成 ? 'var(--accent2)' : 'var(--fg)') + ';font-weight:700">' + (达成 ? '✔ ' : '') + escHtml(c.名称 || '未命名') + '</span>';
    h += '<span style="flex:1"></span>';
    h += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="互动小说编辑条件(\'' + story.id + '\',' + i + ')">✏️ 编辑</span>';
    h += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="互动小说删除条件(\'' + story.id + '\',' + i + ')">🗑</span>';
    h += '</div>';
    if (c.描述) h += '<div style="margin-top:3px">' + escHtml(c.描述) + '</div>';
    if (已知名) {
      var 缺名 = 互动小说条件可疑引用(c, 已知名);
      if (缺名.length) h += '<div style="margin-top:3px;font-size:11.5px;color:var(--error);line-height:1.6">⚠ 引用了故事里从未出现过的 ' + escHtml(缺名.join('、')) + '，此条件可能永远不会触发 —— 点「✏️ 编辑」改成实际的名字</div>';
    }
    if (进度.类型 === '数值') {
      var 目标 = 进度.目标;
      if (目标 > 0) {
        var 比 = Math.max(0, Math.min(100, (进度.当前 / 目标) * 100));
        h += '<div style="margin-top:6px;display:flex;align-items:center;gap:8px">';
        h += '<div style="flex:1;height:6px;background:var(--bg2);border-radius:4px;overflow:hidden"><div style="height:100%;width:' + 比 + '%;background:linear-gradient(90deg,#ff8ab0,#ff5c8a)"></div></div>';
        h += '<span style="font-size:11.5px;white-space:nowrap;color:' + (达成 ? 'var(--accent2)' : 'var(--fg2)') + '">' + 进度.当前 + ' / ' + 进度.运算符 + ' ' + 目标 + '</span></div>';
      } else {
        h += '<div style="margin-top:3px;font-size:11.5px">当前 ' + 进度.当前 + '，目标 ' + 进度.运算符 + ' ' + 目标 + '</div>';
      }
    } else if (判.类型 === '事件') {
      h += '<div style="margin-top:3px;font-size:11.5px">需发生：' + escHtml(判.关键词 || '') + '</div>';
    } else if (判.全部 || 判.任一) {
      h += '<div style="margin-top:3px;font-size:11.5px">（组合条件：需' + (判.全部 ? '全部满足' : '满足其一') + '）</div>';
    }
    h += '</div>';
  });
  h += '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">';
  h += '<span class="btn-secondary btn-sm" onclick="互动小说编辑条件(\'' + story.id + '\',-1)">＋ 添加条件</span>';
  h += '<span class="btn-secondary btn-sm" onclick="互动小说AI重拟条件(\'' + story.id + '\')">🔄 AI 重拟</span>';
  h += '</div>';
  // 关键事实：分「钉住」（可编辑、永不被自动丢弃）与「累积」（模型每轮上报，超 60 条丢最早）
  h += '<div style="margin-top:8px"><b style="color:var(--fg)">关键事实</b>'
    + ' <span class="btn-secondary btn-sm" style="font-size:10px" title="钉住重要设定：写进来的每轮都会发给 AI，模型碰不到、不会被丢掉" onclick="互动小说编辑关键事实(\'' + story.id + '\')">📌 钉住/编辑</span>';
  if (钉事实表.length) {
    h += '<div style="margin-top:3px"><span style="color:var(--accent2)">📌 钉住（最高优先级）</span><br>'
      + 钉事实表.map(function(f) { return '· ' + escHtml(f); }).join('<br>') + '</div>';
  }
  if ((story.关键事实 || []).length) {
    h += '<div style="margin-top:5px;color:var(--fg2)">剧情累积（' + story.关键事实.length + ' 条，超出会丢最早的）<br>'
      + story.关键事实.map(function(f) { return '· ' + escHtml(f); }).join('<br>') + '</div>';
  }
  if (!钉事实表.length && !(story.关键事实 || []).length) {
    h += '<div style="margin-top:3px;color:var(--fg3)">（暂无）点「📌 钉住」可以写下必须记住的设定</div>';
  }
  h += '</div>';
  h += '</div></div>';
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
    h += '<span style="font-size:12.5px;color:var(--fg)">📊 世界状态</span>';
    h += '<span style="font-size:11.5px;color:var(--fg2)">' + (w.地点 || '?') + ' · ' + (w.时间 || '') + ' <span id="inWorldArrow">' + (window.__inWorldOpen === story.id ? '▾' : '▸') + '</span></span></div>';
    h += '<div id="inWorldPanel" style="display:' + (window.__inWorldOpen === story.id ? 'block' : 'none') + ';margin-top:6px;padding:10px 12px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;font-size:12.5px;color:var(--fg2);line-height:1.85">';
    h += '<div><b style="color:var(--fg)">地点</b>　' + escHtml(w.地点 || '—') + '</div>';
    // 时间：原样显示剧本纪时，后面补一个 24 小时制钟点（模型给的优先，没有就用换算兜底）
    var 钟点 = String(w.时间24 || '').trim() || 互动小说换算24(w.时间);
    h += '<div><b style="color:var(--fg)">时间</b>　' + escHtml(w.时间 || '—') + (钟点 ? '　<span style="color:var(--accent2)">（' + escHtml(钟点) + '）</span>' : '') + '</div>';
    h += '<div><b style="color:var(--fg)">在场</b>　' + ((w.在场 || []).join('、') || '—') + '</div>';
    // 角色：好感/关系取自本段世界态，刻画（你写的）/演变（模型累积）取自故事级持久状态
    var 好感 = w.好感 || {};
    var 状态表 = story.角色状态 || {};
    var 名集 = {};
    Object.keys(好感).forEach(function(k) { 名集[k] = 1; });
    Object.keys(状态表).forEach(function(k) { 名集[k] = 1; });
    var 名单 = Object.keys(名集);
    if (名单.length) {
      h += '<div style="margin-top:6px"><b style="color:var(--fg)">角色</b>'
        + ' <span class="btn-secondary btn-sm" style="font-size:10px" title="给角色写刻画：写进去的每轮都会发给 AI，模型必须照它演，而且不会改写你写的内容" onclick="互动小说编辑刻画(\'' + story.id + '\')">📝 写刻画</span></div>';
      名单.forEach(function(k) {
        var v = 好感[k];
        var 负 = (typeof v === 'number') && v < 0;
        var 关系 = (w.关系 || {})[k] || (状态表[k] || {}).关系;
        var 我刻画 = (状态表[k] || {}).刻画;
        var 我演变 = (状态表[k] || {}).演变;
        h += '<div style="margin-top:6px">';
        h += '<div><span style="color:var(--fg);font-weight:600">' + escHtml(k) + '</span>'
          + (typeof v === 'number' ? '　<span style="color:' + (负 ? 'var(--error)' : 'var(--fg)') + ';font-weight:700">好感 ' + escHtml(String(v)) + '</span>' : '') + '</div>';
        if (关系) h += '<div style="margin-top:3px;color:var(--fg2);line-height:1.8;word-break:break-word">' + escHtml(关系) + '</div>';
        if (我刻画) h += '<div style="margin-top:3px;color:var(--accent2);line-height:1.8;word-break:break-word">■ 你写的刻画：' + escHtml(我刻画) + '</div>';
        if (我演变) h += '<div style="margin-top:3px;color:var(--fg2);line-height:1.8;word-break:break-word">■ 剧情中的变化：' + escHtml(我演变) + '</div>';
        h += '</div>';
      });
    }
    var 变量 = w.变量 || {}; var 变量键 = Object.keys(变量);
    if (变量键.length) h += '<div style="margin-top:6px"><b style="color:var(--fg)">变量</b>　' + escHtml(变量键.map(function(k) { return k + '=' + 变量[k]; }).join('　')) + '</div>';
    if (w.事件 && w.事件.length) h += '<div style="margin-top:6px"><b style="color:var(--fg)">已发生事件</b><br>' + (w.事件 || []).map(function(e) { return '· ' + escHtml(e); }).join('<br>') + '</div>';
    h += '</div></div>';
  }
  // 剧情回放时间轴（历史）
  if (story.历史 && story.历史.length > 1) {
    h += '<div style="margin-bottom:10px"><div style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;padding:8px 12px;background:var(--bg2);border:1px solid var(--border);border-radius:8px" onclick="互动小说切回放(\'' + story.id + '\')">';
    h += '<span style="font-size:12.5px;color:var(--fg)">🗺 剧情回放（已走 ' + story.历史.length + ' 步）</span>';
    h += '<span id="inReplayArrow" style="font-size:11.5px;color:var(--fg2)">' + (window.__inReplayOpen === story.id ? '▾' : '▸') + '</span></div>';
    h += '<div id="inReplayPanel" style="display:' + (window.__inReplayOpen === story.id ? 'block' : 'none') + ';margin-top:6px;padding:10px 12px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;max-height:440px;overflow-y:auto;overflow-x:hidden">';
    var hists = story.历史 || [];
    hists.forEach(function(nid, hi) {
      var n = story.nodes[nid];
      var txt = n ? (n.summary || n.text || '') : '';
      h += '<div style="position:relative;padding:0 0 10px 18px;border-left:1px solid var(--border)">';
      h += '<span style="position:absolute;left:-4px;top:2px;width:7px;height:7px;border-radius:50%;background:' + (hi === hists.length - 1 ? 'var(--accent2)' : 'var(--fg3)') + '"></span>';
      h += '<div style="font-size:12px;color:var(--fg2);line-height:1.75;white-space:normal;word-break:break-word">'
        + '<span style="color:var(--fg3)">第 ' + (hi + 1) + ' 步</span> · ' + escHtml(txt)
        + (n && n.ending ? '　<span style="color:var(--accent2)">🏁 ' + escHtml(n.ending) + '</span>' : '')
        + '</div>';
      h += '</div>';
    });
    h += '</div></div>';
  }
  // 结局 vs 选项
  if (node && node.type === '结局') {
    h += '<div style="background:linear-gradient(160deg,var(--accent2)22,transparent);border:1px solid var(--accent2);border-radius:12px;padding:14px;margin-bottom:8px">';
    h += '<div style="font-size:16px;font-weight:800;color:var(--accent);margin-bottom:6px">🏁 结局：' + escHtml(node.ending || '终') + '</div>';
    h += '<div style="font-size:12px;color:var(--fg2);margin-bottom:12px">已达结局：' + ((story.结局集 || []).map(function(e) { return escHtml(e); }).join(' · ') || '-') + '</div>';
    h += '<button class="btn" onclick="互动小说去列表()">返回我的故事</button>';
    h += '</div>';
  } else {
    h += '<div id="inPlayOptions" style="display:flex;flex-direction:column;gap:6px">';
    var opts = (node && node.options) || [];
    if (!opts.length) h += '<div class="text-muted text-sm">（剧情暂无可选项 — 可点「回退」回上一步，或继续）</div>';
    opts.forEach(function(o, i) {
      h += '<div class="n-card cur-ptr" style="padding:9px 12px;border-radius:8px;cursor:pointer" onclick="互动小说选择(\'' + story.id + '\',' + i + ')">';
      h += '<div style="display:flex;align-items:flex-start;gap:8px">';
      h += '<div style="flex:1;min-width:0"><span class="badge-tag" style="margin-right:6px;background:var(--accent-dim);color:var(--accent2)">' + escHtml(o.intent) + '</span>' + escHtml(o.text) + '</div>';
      // 整张卡片可点（点了就生成），所以复制按钮必须 stopPropagation，否则会连带触发选项
      h += '<span class="btn-secondary btn-sm" style="flex:0 0 auto;padding:2px 7px;font-size:11px;line-height:1.4" title="复制这条选项的文字" onclick="event.stopPropagation();互动小说复制选项(\'' + story.id + '\',' + i + ')">📋</span>';
      h += '</div>';
      h += '</div>';
    });
    // 自定义输入（自行输入回复/行动，走"自定义"意图）
    h += '<div style="margin-top:8px"><div class="text-sm text-muted" style="margin-bottom:4px">✍️ 或自行输入你的回复 / 行动</div>';
    h += '<div style="display:flex;gap:6px"><input class="llm-input" id="inCustomAction" placeholder="输入你想说的话或做的事…（回车发送）" style="flex:1;height:30px;font-size:12px" onkeydown="if(event.key===\'Enter\'&&!event.isComposing&&event.keyCode!==229)互动小说自定义(\'' + story.id + '\')">';
    h += '<button class="btn-secondary btn-sm" onclick="互动小说自定义(\'' + story.id + '\')">↩ 发送</button></div></div>';
    h += '</div>';
  }
  // 进度
  h += '<div style="margin-top:10px;font-size:10px;color:var(--fg3)">第 ' + (story.历史 || []).length + ' 步 · 已生成 ' + Object.keys(story.nodes || {}).length + ' 段 · 结局 ' + (story.结局集 || []).length + ' 个</div>';
  el.innerHTML = h;
  // 把草稿填回新输入框；原本有焦点的话连光标位置一起还原，继续打字不中断
  if (输入草稿) {
    var 新输入框 = document.getElementById('inCustomAction');
    if (新输入框) {
      新输入框.value = 输入草稿;
      if (输入有焦点) {
        新输入框.focus();
        try { 新输入框.setSelectionRange(光标位, 光标位); } catch (e) { /* 某些输入类型不支持，忽略 */ }
      }
    }
  }
}

function 互动小说游玩目标() { return document.getElementById('inViewContent'); }

// 角色名稳定取色（谐音灯——不同角色不同色）
function 互动小说角色色(名字) {
  var s = (名字 || '旁白');
  var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  var 色 = ['#d4889e', '#d4c4f0', '#7ee0a8', '#67c1f5', '#e0b952', '#f6a0c0'][h % 6];
  return 色;
}

// ===== 传统纪时 → 24 小时制 =====
// 剧本用哪种纪时由世界观决定（仙侠用时辰、都市用钟点），这里只在玩家看不懂时补一个对照，故标「左右」。
var 互动小说时辰基 = { 子: 23, 丑: 1, 寅: 3, 卯: 5, 辰: 7, 巳: 9, 午: 11, 未: 13, 申: 15, 酉: 17, 戌: 19, 亥: 21 };
var 互动小说汉字数 = { 初: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };
function 互动小说换算24(文本) {
  var s = String(文本 || '');
  if (!s) return '';
  if (/\d{1,2}\s*[:：]\s*\d{1,2}/.test(s)) return '';   // 本来就有钟点，别重复加
  var m = s.match(/([子丑寅卯辰巳午未申酉戌亥])\s*时/);
  if (m) {
    var 基 = 互动小说时辰基[m[1]];
    if (基 == null) return '';
    var 尾 = s.slice(s.indexOf(m[0]) + m[0].length);
    var 刻 = 0;
    var km = 尾.match(/(初|一|二|三|四|五|六|七|八|九|十|\d+)\s*刻/);
    if (km) 刻 = (互动小说汉字数[km[1]] != null ? 互动小说汉字数[km[1]] : (parseInt(km[1], 10) || 0));
    else if (/正/.test(尾.slice(0, 8))) 刻 = 4;          // 「X时正」＝时辰过半
    var 总 = (基 * 60 + 刻 * 15) % 1440;                 // 一刻 = 15 分钟
    return ('0' + Math.floor(总 / 60)).slice(-2) + ':' + ('0' + (总 % 60)).slice(-2) + ' 左右';
  }
  var g = s.match(/([一二三四五])\s*更/);
  if (g) return ('0' + { 一: 19, 二: 21, 三: 23, 四: 1, 五: 3 }[g[1]]).slice(-2) + ':00 前后';
  return '';
}
window.互动小说换算24 = 互动小说换算24;

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

// 生成互斥：防止连点 / 回车重复触发导致两次生成并发（并发会互相覆盖，表现为"没反应"或内容跳变）
var 互动小说生成中 = false;

// 统一的生成流程：置锁 → 提示 → 取故事 → 生成 → 解锁 → 渲染；任何异常都会解锁并提示，不再静默失败
function 互动小说跑生成(故事id, 动作, 标签, 清空输入) {
  if (互动小说生成中) { toast('上一次生成还没结束，请稍候…'); return; }
  互动小说生成中 = true;
  var o = document.getElementById('inPlayOptions');
  if (o) o.innerHTML = '<div class="text-sm text-muted">⏳ ' + (标签 || '剧情生成中') + '…</div>';
  互动小说取故事(故事id).then(function(story) {
    if (!story) throw new Error('故事读取为空');
    return 动作(story);
  }).then(function(res) {
    互动小说生成中 = false;
    // 只有「玩家自己输入并发送」才清空输入框；点选项 / 重写 / 收尾时保留草稿，免得白打一场
    if (清空输入) { var 输入框 = document.getElementById('inCustomAction'); if (输入框) 输入框.value = ''; }
    渲染互动小说游玩(互动小说游玩目标(), res && res.story);
    if (res && res.ending) toast('已抵达结局「' + res.ending + '」');
  }).catch(function(e) {
    互动小说生成中 = false;
    toast('生成失败：' + ((e && e.message) || e || '未知') + '（已恢复到上一步，可直接重试）');
    // 恢复视图；若读取本身也失败，不能再往外抛（否则变成静默未处理异常）
    互动小说取故事(故事id).then(function(s) {
      if (s) 渲染互动小说游玩(互动小说游玩目标(), s);
    }).catch(function() { /* 恢复失败：停在提示上，用户可返回列表重进 */ });
  });
}

function 互动小说选择(故事id, idx) {
  互动小说跑生成(故事id, function(story) { return 互动小说下一步生成(story, idx); });
}
// 自定义自由输入 → 生成下一段
function 互动小说自定义(故事id) {
  var 输入框 = document.getElementById('inCustomAction');
  var v = ((输入框 || {}).value || '').trim();
  // 中文输入法确认候选词时也会触发回车：那时输入框还是空的，这里明确提示并把焦点还回去，避免"点了没反应"
  if (!v) { toast('请先输入你的回复或行动'); if (输入框) 输入框.focus(); return; }
  互动小说跑生成(故事id, function(story) { return 互动小说自定义生成(story, v); }, null, true);
}

// ===== 复制到剪贴板 =====
// file:// 下 navigator.clipboard 不一定可用（且要求窗口聚焦），因此保留 execCommand 兜底
function 互动小说复制文本(文本) {
  var 文 = String(文本 == null ? '' : 文本);
  if (!文) { toast('没有可复制的内容'); return; }
  function 兜底() {
    try {
      var ta = document.createElement('textarea');
      ta.value = 文;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      toast(ok ? '📋 已复制到剪贴板' : '复制失败，请手动选中文字');
    } catch (e) { toast('复制失败：' + ((e && e.message) || e)); }
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(文).then(function() { toast('📋 已复制到剪贴板'); }, 兜底);
  } else {
    兜底();
  }
}

// 复制某条选项的文字。传下标而不是文本，避免文字里的引号把 HTML 属性打断
function 互动小说复制选项(故事id, idx) {
  互动小说取故事(故事id).then(function(s) {
    if (!s) throw new Error('故事读取失败');
    var n = s.nodes[s.当前节点id];
    var o = n && n.options && n.options[idx];
    if (!o || !o.text) { toast('这条选项没有可复制的文字'); return; }
    互动小说复制文本(o.text);
  }).catch(function(e) { toast('复制失败：' + ((e && e.message) || e)); });
}
window.互动小说复制文本 = 互动小说复制文本;
window.互动小说复制选项 = 互动小说复制选项;
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
// 抽屉只切换显示，**不整块重绘**：重绘会重建 DOM（丢掉输入框里还没发出去的内容、丢掉滚动位置），
// 还要重新读一次盘，纯属浪费。箭头在这里一并翻转。
function 互动小说切抽屉(面板id, 箭头id, 开) {
  var 面板 = document.getElementById(面板id);
  if (面板) 面板.style.display = 开 ? 'block' : 'none';
  var 箭头 = document.getElementById(箭头id);
  if (箭头) 箭头.textContent = 开 ? '▾' : '▸';
}
function 互动小说切世界态(故事id) {
  var 开 = (window.__inWorldOpen !== 故事id);
  window.__inWorldOpen = 开 ? 故事id : '';
  互动小说切抽屉('inWorldPanel', 'inWorldArrow', 开);
}
function 互动小说切回放(故事id) {
  var 开 = (window.__inReplayOpen !== 故事id);
  window.__inReplayOpen = 开 ? 故事id : '';
  互动小说切抽屉('inReplayPanel', 'inReplayArrow', 开);
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

function 互动小说切条件(故事id) {
  var 开 = (window.__inCondOpen !== 故事id);
  window.__inCondOpen = 开 ? 故事id : '';
  互动小说切抽屉('inCondPanel', 'inCondArrow', 开);
}
window.互动小说切条件 = 互动小说切条件;
window.互动小说切抽屉 = 互动小说切抽屉;

// ===== 终局条件编辑器（玩家自定义）=====
function 互动小说重渲染(故事id) {
  互动小说取故事(故事id).then(function(s) { if (s) 渲染互动小说游玩(互动小说游玩目标(), s); });
}

function 互动小说条件字段HTML(类型, 判) {
  判 = 判 || {};
  var 运算符 = 判.运算符 || '>=';
  var 选项 = ['>=', '<=', '>', '<', '=='].map(function(o) {
    return '<option value="' + o + '"' + (运算符 === o ? ' selected' : '') + '>' + o + '</option>';
  }).join('');
  if (类型 === '步数') {
    return '<div style="display:flex;gap:8px;align-items:flex-end">' +
      '<div style="flex:1"><div style="font-size:11px;color:var(--fg2);margin-bottom:4px">已走过的段数</div>' +
      '<div style="font-size:11px;color:var(--fg3);line-height:1.6">常用于「错过式结局」：先等若干段再看好感，避免开局两段就误触发。</div></div>' +
      '<div style="flex:0 0 86px"><div style="font-size:11px;color:var(--fg2);margin-bottom:4px">运算符</div><select class="llm-input llm-select" id="condOp" style="width:100%">' + 选项 + '</select></div>' +
      '<div style="flex:0 0 96px"><div style="font-size:11px;color:var(--fg2);margin-bottom:4px">阈值</div><input class="llm-input" id="condVal" type="number" value="' + (判.阈值 != null ? 判.阈值 : 20) + '" style="width:100%"></div>' +
      '</div>';
  }
  if (类型 === '好感' || 类型 === '变量') {
    var 标签 = 类型 === '好感' ? '角色名' : '变量名';
    var 提示 = 类型 === '好感' ? '如：林夏' : '如：信任度';
    var 现值 = 类型 === '好感' ? (判.角色 || '') : (判.名称 || '');
    return '<div style="display:flex;gap:8px">' +
      '<div style="flex:1"><div style="font-size:11px;color:var(--fg2);margin-bottom:4px">' + 标签 + '</div><input class="llm-input" id="condKey" value="' + escHtml(现值) + '" placeholder="' + 提示 + '" style="width:100%"></div>' +
      '<div style="flex:0 0 86px"><div style="font-size:11px;color:var(--fg2);margin-bottom:4px">运算符</div><select class="llm-input llm-select" id="condOp" style="width:100%">' + 选项 + '</select></div>' +
      '<div style="flex:0 0 96px"><div style="font-size:11px;color:var(--fg2);margin-bottom:4px">阈值</div><input class="llm-input" id="condVal" type="number" value="' + (判.阈值 != null ? 判.阈值 : 50) + '" style="width:100%"></div>' +
      '</div>';
  }
  if (类型 === '事件') {
    return '<div><div style="font-size:11px;color:var(--fg2);margin-bottom:4px">关键词（在「已发生事件 / 关键事实」里做子串匹配）</div>' +
      '<input class="llm-input" id="condKey" value="' + escHtml(判.关键词 || '') + '" placeholder="如：主动留下" style="width:100%"></div>';
  }
  var 模板 = (判.全部 || 判.任一) ? 判 : { 全部: [{ 类型: '好感', 角色: '角色名', 运算符: '>=', 阈值: 70 }, { 类型: '事件', 关键词: '关键词' }] };
  var json = JSON.stringify(模板, null, 2);
  return '<div><div style="font-size:11px;color:var(--fg2);margin-bottom:4px">判定 JSON（支持 {"全部":[...]} / {"任一":[...]}，叶子可用 好感 / 变量 / 事件）</div>' +
    '<textarea class="llm-input" id="condJson" style="width:100%;min-height:120px;font-family:monospace;font-size:11.5px">' + escHtml(json) + '</textarea></div>';
}

window.互动小说条件类型切换 = function() {
  var 类型 = ((document.getElementById('condType') || {}).value) || '好感';
  var el = document.getElementById('condFields');
  if (el) el.innerHTML = 互动小说条件字段HTML(类型, {});
};

window.互动小说编辑条件 = function(故事id, idx) {
  互动小说取故事(故事id).then(function(s) {
    if (!s) return;
    s.终局条件 = s.终局条件 || [];
    var 是新增 = idx < 0;
    var c = 是新增 ? {} : (s.终局条件[idx] || {});
    var 判 = c.判定 || {};
    var 类型 = (判.全部 || 判.任一) ? '组合' : (判.类型 || '好感');
    window.__inCondEdit = { id: 故事id, idx: idx };
    var hh = '<div class="mcard" style="max-width:580px">';
    hh += '<div style="font-size:14px;font-weight:700;margin-bottom:10px">' + (是新增 ? '＋ 添加终局条件' : '✏️ 编辑终局条件') + '　<span style="font-size:10.5px;color:var(--fg3);font-weight:400">满足即走向该结局</span></div>';
    hh += '<div style="margin-bottom:8px"><div style="font-size:11px;color:var(--fg2);margin-bottom:4px">结局名称</div><input class="llm-input" id="condName" value="' + escHtml(c.名称 || '') + '" placeholder="如：圆满·自愿留下" style="width:100%"></div>';
    hh += '<div style="margin-bottom:8px"><div style="font-size:11px;color:var(--fg2);margin-bottom:4px">给玩家看的说明</div><input class="llm-input" id="condDesc" value="' + escHtml(c.描述 || '') + '" placeholder="达成什么会走向这个结局" style="width:100%"></div>';
    hh += '<div style="margin-bottom:8px"><div style="font-size:11px;color:var(--fg2);margin-bottom:4px">判定类型</div><select class="llm-input llm-select" id="condType" style="width:100%" onchange="互动小说条件类型切换()">';
    [['好感', '角色好感达到阈值'], ['变量', '某个变量达到阈值'], ['事件', '发生过某个事件'], ['步数', '已走过的段数达到阈值'], ['组合', '组合条件（写 JSON）']].forEach(function(t) {
      hh += '<option value="' + t[0] + '"' + (类型 === t[0] ? ' selected' : '') + '>' + t[0] + ' —— ' + t[1] + '</option>';
    });
    hh += '</select></div>';
    hh += '<div id="condFields">' + 互动小说条件字段HTML(类型, 判) + '</div>';
    hh += '<div style="margin-top:12px;display:flex;justify-content:flex-end;gap:8px"><button class="btn-out btn-sm" onclick="this.closest(\'.ovl\').remove()">取消</button><button class="btn-main" onclick="互动小说保存条件()">保存</button></div></div>';
    var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = hh;
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  });
};

window.互动小说保存条件 = function() {
  var 编辑 = window.__inCondEdit || {};
  var 名称 = (((document.getElementById('condName') || {}).value) || '').trim();
  var 描述 = (((document.getElementById('condDesc') || {}).value) || '').trim();
  var 类型 = ((document.getElementById('condType') || {}).value) || '好感';
  if (!名称) { toast('请填写结局名称'); return; }
  var 判定;
  if (类型 === '组合') {
    try { 判定 = JSON.parse((((document.getElementById('condJson') || {}).value) || '').trim()); }
    catch (e) { toast('判定 JSON 解析失败：' + e.message); return; }
  } else {
    var 键 = (((document.getElementById('condKey') || {}).value) || '').trim();
    if (类型 === '事件') {
      if (!键) { toast('请填写关键词'); return; }
      判定 = { 类型: '事件', 关键词: 键 };
    } else if (类型 === '步数') {
      判定 = { 类型: '步数', 运算符: (((document.getElementById('condOp') || {}).value) || '>='), 阈值: Number(((document.getElementById('condVal') || {}).value)) || 0 };
    } else {
      if (!键) { toast('请填写' + (类型 === '好感' ? '角色名' : '变量名')); return; }
      判定 = { 类型: 类型, 运算符: (((document.getElementById('condOp') || {}).value) || '>='), 阈值: Number(((document.getElementById('condVal') || {}).value)) || 0 };
      if (类型 === '好感') 判定.角色 = 键; else 判定.名称 = 键;
    }
  }
  if (!判定 || typeof 判定 !== 'object') { toast('判定无效'); return; }
  互动小说取故事(编辑.id).then(function(s) {
    if (!s) return;
    s.终局条件 = s.终局条件 || [];
    var 新 = { 名称: 名称, 描述: 描述, 判定: 判定, 已达成: false, 达成于: null };
    if (编辑.idx < 0) s.终局条件.push(新); else s.终局条件[编辑.idx] = 新;
    互动小说存故事(s).then(function() {
      document.querySelectorAll('.ovl').forEach(function(el) { el.remove(); });
      toast('✅ 已保存');
      互动小说重渲染(编辑.id);
    });
  });
};

window.互动小说删除条件 = function(故事id, idx) {
  confirmDialog('确定删除这个终局条件？', function() {
    互动小说取故事(故事id).then(function(s) {
      if (!s) return;
      s.终局条件.splice(idx, 1);
      互动小说存故事(s).then(function() { toast('已删除'); 互动小说重渲染(故事id); });
    });
  });
};

window.互动小说AI重拟条件 = function(故事id) {
  confirmDialog('让 AI 根据当前剧情重拟一组终局条件？现有条件会被替换。', function() {
    互动小说取故事(故事id).then(function(s) {
      if (!s) return;
      toast('AI 正在规划终局条件…');
      互动小说重拟条件(s).then(function() {
        toast('✅ 已重拟终局条件');
        互动小说重渲染(故事id);
      }).catch(function(e) { toast('重拟失败：' + ((e && e.message) || '未知')); });
    });
  });
};

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
// 重写当前节点：先让玩家写下想改的方向，再据此重写（不改后续分支）
function 互动小说重生成本段(故事id) {
  互动小说取故事(故事id).then(function(s) {
    if (!s) return;
    var node = s.nodes[s.当前节点id];
    if (!node) { toast('当前无节点'); return; }
    window.__inRewriteId = 故事id;
    var 预设 = ['更细腻', '更有张力', '换个笔法', '收敛一点', '加强氛围', '多写对白', '再长一些', '精简一些'];
    var hh = '<div class="mcard" style="max-width:560px">';
    hh += '<div style="font-size:14px;font-weight:700;margin-bottom:8px">🔄 重写本段</div>';
    hh += '<div style="font-size:11px;color:var(--fg2);margin-bottom:8px;line-height:1.7">写一句你希望怎么改（可留空，交给 AI 自由润色）。只重写这一段的写法，<b>不改变已发生的事与世界状态</b>。</div>';
    hh += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">';
    预设.forEach(function(p) {
      hh += '<span class="preset-chip" onclick="互动小说重写填预设(\'' + p + '\')">' + p + '</span>';
    });
    hh += '</div>';
    hh += '<textarea class="llm-input" id="inRewriteReq" placeholder="例如：这段太急了，想更慢、更暧昧一点；多用她的沉默和眼神，少写动作" style="width:100%;box-sizing:border-box;min-height:82px;resize:vertical;border-radius:9px;line-height:1.7"></textarea>';
    hh += '<div style="margin-top:12px;display:flex;justify-content:flex-end;gap:8px"><button class="btn-out btn-sm" onclick="this.closest(\'.ovl\').remove()">取消</button><button class="btn-main" onclick="互动小说重写提交()">🔄 开始重写</button></div></div>';
    var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = hh;
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
    setTimeout(function() { var d = document.getElementById('inRewriteReq'); if (d) d.focus(); }, 60);
  });
}

// 点预设芯片往输入框里追加（可多选，用分号连起来）
window.互动小说重写填预设 = function(文本) {
  var ta = document.getElementById('inRewriteReq');
  if (!ta) return;
  var 现 = (ta.value || '').replace(/[；;]\s*$/, '').trim();
  ta.value = 现 ? (现 + '；' + 文本) : 文本;
  ta.focus();
};

window.互动小说重写提交 = function() {
  var id = window.__inRewriteId;
  var 要求 = (((document.getElementById('inRewriteReq') || {}).value) || '').trim();
  document.querySelectorAll('.ovl').forEach(function(el) { el.remove(); });
  if (!id) return;
  // 复用统一的生成流程：并发锁 + 出错必有提示 + 自动回滚视图
  互动小说跑生成(id, function(story) {
    var node = story.nodes[story.当前节点id];
    if (!node) throw new Error('当前无节点');
    return 互动小说重生成节点(story, node, 要求).then(function(st) {
      toast('✅ 已重写本段');
      return { story: st, ending: '' };
    });
  }, '正在重写本段');
};

window.互动小说编辑节点 = 互动小说编辑节点;
window.互动小说编辑节点保存 = 互动小说编辑节点保存;
window.互动小说重生成本段 = 互动小说重生成本段;

// 玩家主动收尾：把已达成的条件拿来写结局（在此之前可以一直继续游玩）
window.互动小说就此收尾 = function(故事id) {
  互动小说取故事(故事id).then(function(s) {
    if (!s) return;
    if (s.待收束) { toast('已经在收尾了，选任意一个选项即可'); return; }
    var 已达成 = (s.终局条件 || []).filter(function(c) {
      var w = (s.nodes[s.当前节点id] || {}).world || {};
      return 互动小说条件进度(c, w, s.关键事实 || [], (s.历史 || []).length).已达成;
    });
    if (!已达成.length) { toast('还没有达成的终局条件'); return; }
    var 名 = 已达成[已达成.length - 1].名称 || '结局';
    confirmDialog('现在为「' + 名 + '」写下结局？\n写完后这个故事就结束了（之后仍可用「↩ 回退」退回来继续玩）。', function() {
      互动小说跑生成(故事id, function(story) {
        var 命中 = (story.终局条件 || []).filter(function(c) { return c.已达成; }).pop();
        story.待收束 = { 名称: (命中 && 命中.名称) || 名, 描述: (命中 && 命中.描述) || '' };
        return 互动小说收尾生成(story).then(function(res) {
          return { story: res.story, ending: res.ending };
        });
      }, '正在写下结局');
    });
  });
};

// ===== 关键事实 · 钉住 / 编辑 =====
// 这些是玩家亲手写下的设定：每轮都以最高优先级发给 AI，模型碰不到、也不会被自动丢弃。
// （模型自己累积的那些放在 关键事实，超 60 条会丢最早的 —— 所以"钉住"这一层是必需的。）
window.互动小说编辑关键事实 = function(故事id) {
  互动小说取故事(故事id).then(function(s) {
    if (!s) { toast('故事读取失败'); return; }
    var 钉 = s.关键事实钉 || [];
    var 累积 = s.关键事实 || [];
    var hh = '<div class="mcard" style="max-width:640px">';
    hh += '<div style="font-size:14px;font-weight:700;margin-bottom:6px">📌 钉住关键事实</div>';
    hh += '<div style="font-size:11px;color:var(--fg2);margin-bottom:8px;line-height:1.75">一行一条。这些内容<b>每轮都会随上下文发给 AI</b>，用来钉死不该被忘的设定（身份、承诺、誓言、失去的东西、人物关系…）。<br>模型碰不到它们，也不会像下面「剧情累积」那样被自动丢弃。建议 30 条以内、每条一两句。</div>';
    hh += '<textarea class="llm-input" id="inFactsPin" style="width:100%;box-sizing:border-box;min-height:180px;resize:vertical;border-radius:9px;line-height:1.85;font-size:12.5px">' + escHtml(钉.join('\n')) + '</textarea>';
    hh += '<div style="margin-top:6px;font-size:11px;color:var(--fg3)">当前钉住 ' + 钉.length + ' 条；保存时自动去掉空行与重复</div>';
    if (累积.length) {
      hh += '<details style="margin-top:10px"><summary style="font-size:11.5px;color:var(--fg2);cursor:pointer">查看剧情累积的事实（' + 累积.length + ' 条，只读）</summary>'
        + '<div style="margin-top:6px;max-height:160px;overflow-y:auto;font-size:11.5px;color:var(--fg3);line-height:1.8">'
        + 累积.map(function(f) { return '· ' + escHtml(f); }).join('<br>') + '</div></details>';
    }
    hh += '<div style="margin-top:12px;display:flex;justify-content:flex-end;gap:8px"><button class="btn-out btn-sm" onclick="this.closest(\'.ovl\').remove()">取消</button><button class="btn-main" onclick="互动小说保存关键事实(\'' + 故事id + '\')">保存</button></div></div>';
    var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = hh;
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
    setTimeout(function() { var d = document.getElementById('inFactsPin'); if (d) d.focus(); }, 60);
  }).catch(function(e) { toast('打开失败：' + ((e && e.message) || e)); });
};

window.互动小说保存关键事实 = function(故事id) {
  var 文 = ((document.getElementById('inFactsPin') || {}).value) || '';
  var 列表 = 文.split(/\r?\n/)
    .map(function(l) { return l.replace(/^[\s·•\-*]+/, '').trim(); })
    .filter(Boolean);
  var 见 = {}, 去重 = [];
  列表.forEach(function(f) { if (!见[f]) { 见[f] = 1; 去重.push(f); } });
  互动小说取故事(故事id).then(function(s) {
    if (!s) { toast('故事读取失败'); return; }
    s.关键事实钉 = 去重;
    return 互动小说存故事(s).then(function(st) {
      document.querySelectorAll('.ovl').forEach(function(el) { el.remove(); });
      toast('✅ 已钉住 ' + 去重.length + ' 条关键事实');
      渲染互动小说游玩(互动小说游玩目标(), st);
    });
  }).catch(function(e) { toast('保存失败：' + ((e && e.message) || e)); });
};

// ===== 角色刻画 · 自己写 =====
// 你写进去的内容每轮都会发给 AI，且模型**不得改写**它。
// 模型自己在 world.刻画 里报的新变化另存到「演变」，不会覆盖你写的。
window.互动小说编辑刻画 = function(故事id) {
  互动小说取故事(故事id).then(function(s) {
    if (!s) { toast('故事读取失败'); return; }
    s.角色状态 = s.角色状态 || {};
    var 名集 = {};
    (s.cast || []).forEach(function(c) { if (c && c.name) 名集[c.name] = 1; });
    Object.keys(s.角色状态).forEach(function(k) { 名集[k] = 1; });
    var 名单 = Object.keys(名集);
    if (!名单.length) { toast('这个故事还没有角色'); return; }
    window.__inKbEdit = 故事id;
    var hh = '<div class="mcard" style="max-width:680px;max-height:84vh;display:flex;flex-direction:column">';
    hh += '<div style="font-size:14px;font-weight:700;margin-bottom:6px">📝 写刻画</div>';
    hh += '<div style="font-size:11px;color:var(--fg2);margin-bottom:8px;line-height:1.75">给每个角色写一两句：他的动机／软肋／说话习惯／你希望他怎么演。<br>这些内容<b>每轮都会发给 AI</b>，标为「玩家亲手定的刻画」——模型必须照此演，<b>而且不会改写你写的</b>。（它随剧情自己补的变化，另存为「剧情中的变化」，不影响你写的。）</div>';
    hh += '<div style="flex:1;overflow-y:auto;padding-right:6px">';
    名单.forEach(function(k, i) {
      var 现刻 = (s.角色状态[k] || {}).刻画 || '';
      var 现演 = (s.角色状态[k] || {}).演变 || '';
      hh += '<div style="margin-bottom:10px">';
      hh += '<div style="font-size:12px;color:var(--fg);font-weight:600;margin-bottom:4px">' + escHtml(k) + '</div>';
      hh += '<textarea class="llm-input" id="inKb' + i + '" data-name="' + escHtml(k) + '" style="width:100%;box-sizing:border-box;min-height:70px;resize:vertical;border-radius:9px;line-height:1.8;font-size:12.5px">' + escHtml(现刻) + '</textarea>';
      if (现演) hh += '<div style="margin-top:4px;font-size:11px;color:var(--fg3);line-height:1.7">剧情中的变化（只读）：' + escHtml(现演) + '</div>';
      hh += '</div>';
    });
    hh += '</div>';
    hh += '<div style="margin-top:10px;display:flex;justify-content:flex-end;gap:8px"><button class="btn-out btn-sm" onclick="this.closest(\'.ovl\').remove()">取消</button><button class="btn-main" onclick="互动小说保存刻画()">保存</button></div></div>';
    var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = hh;
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
    setTimeout(function() { var d = document.getElementById('inKb0'); if (d) d.focus(); }, 60);
  }).catch(function(e) { toast('打开失败：' + ((e && e.message) || e)); });
};

window.互动小说保存刻画 = function() {
  var id = window.__inKbEdit;
  var 收集 = {};
  // 先把值读出来，再关弹窗（顺序反了就什么都读不到）
  document.querySelectorAll('textarea[data-name]').forEach(function(t) {
    var 名 = t.getAttribute('data-name');
    if (名) 收集[名] = String(t.value || '').trim();
  });
  document.querySelectorAll('.ovl').forEach(function(el) { el.remove(); });
  if (!id) return;
  互动小说取故事(id).then(function(s) {
    if (!s) { toast('故事读取失败'); return; }
    s.角色状态 = s.角色状态 || {};
    Object.keys(收集).forEach(function(k) {
      s.角色状态[k] = s.角色状态[k] || {};
      s.角色状态[k].刻画 = 收集[k];       // 只动「刻画」，模型累积的「演变」原样保留
    });
    return 互动小说存故事(s).then(function(st) {
      toast('✅ 已保存刻画');
      渲染互动小说游玩(互动小说游玩目标(), st);
    });
  }).catch(function(e) { toast('保存失败：' + ((e && e.message) || e)); });
};

// ===== 回看前文 =====
// 把已经走过的每一段正文按顺序铺出来（沿用正文渲染，台词高亮保留）。
// 段数很多时只渲染最近若干段，避免一次塞进过大的 DOM。
var 互动小说回看上限 = 120;

function 互动小说回看前文(故事id) {
  互动小说取故事(故事id).then(function(s) {
    if (!s) { toast('故事读取失败'); return; }
    var 轨迹 = s.历史 || [];
    if (轨迹.length <= 1) { toast('还没有前文可以回看'); return; }
    var 起点 = Math.max(0, 轨迹.length - 互动小说回看上限);
    var hh = '<div class="mcard" style="max-width:720px;max-height:84vh;display:flex;flex-direction:column">';
    hh += '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px">';
    hh += '<div style="font-size:14px;font-weight:700">📜 回看前文</div>';
    hh += '<span style="font-size:11px;color:var(--fg3)">' + escHtml(s.title || '') + ' · 共 ' + 轨迹.length + ' 段</span></div>';
    hh += '<div id="inRecapBody" style="flex:1;overflow-y:auto;padding-right:8px">';
    if (起点 > 0) hh += '<div style="font-size:11px;color:var(--fg3);margin-bottom:10px">（只显示最近 ' + 互动小说回看上限 + ' 段；更早的可在「🗺 剧情回放」里看摘要）</div>';
    for (var i = 起点; i < 轨迹.length; i++) {
      var n = s.nodes[轨迹[i]];
      if (!n) continue;
      var 是当前 = (i === 轨迹.length - 1);
      hh += '<div style="padding:0 0 12px;margin-bottom:12px;border-bottom:1px solid var(--border)">';
      hh += '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11px;color:var(--fg3);margin-bottom:5px">';
      hh += '<span>第 ' + (i + 1) + ' 段'
        + (n.ending ? '　<span style="color:var(--accent2)">🏁 ' + escHtml(n.ending) + '</span>' : '')
        + (是当前 ? '　<span style="color:var(--accent2)">· 当前</span>' : '') + '</span>';
      if (!是当前) hh += '<span class="btn-secondary btn-sm" style="font-size:10px;flex:0 0 auto" title="退回到这一段，从这儿另走一条路" onclick="互动小说跳到某段(\'' + s.id + '\',' + i + ')">↩ 跳到这里</span>';
      hh += '</div>';
      hh += '<div style="font-size:13.5px;line-height:1.95">' + 互动小说渲染正文(n) + '</div>';
      hh += '</div>';
    }
    hh += '</div>';
    hh += '<div style="margin-top:10px;text-align:right"><button class="btn-out btn-sm" onclick="this.closest(\'.ovl\').remove()">关闭</button></div></div>';
    var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = hh;
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
    // 打开时滚到最新一段，向上翻即是往回读
    setTimeout(function() { var b = document.getElementById('inRecapBody'); if (b) b.scrollTop = b.scrollHeight; }, 60);
  }).catch(function(e) { toast('回看失败：' + ((e && e.message) || e)); });
}
window.互动小说回看前文 = 互动小说回看前文;

// 跳到历史里的某一段：等价于连点多次「↩ 回退」，把后面走过的步数撤掉，从那儿另走一条路。
// 想保留现在这版，先「📄 复制存档」另存一份再跳。
window.互动小说跳到某段 = function(故事id, idx) {
  互动小说取故事(故事id).then(function(s) {
    if (!s) { toast('故事读取失败'); return; }
    var 历史 = s.历史 || [];
    if (!(idx >= 0 && idx < 历史.length)) { toast('无效的位置'); return; }
    if (idx === 历史.length - 1) { toast('已经在这一段了'); return; }
    var 丢 = 历史.length - 1 - idx;
    confirmDialog('跳到第 ' + (idx + 1) + ' 段？\n\n'
      + '这会撤销后面走过的 ' + 丢 + ' 步：世界状态、好感、关系、结局集都会回到那一刻。\n'
      + '（模型累积的「关键事实」不会回退，介意的话跳完可在面板里编辑。）\n\n'
      + '想保留现在这版，先取消、用「📄 复制存档」另存一份再跳。', function() {
      s.历史 = 历史.slice(0, idx + 1);
      s.当前节点id = s.历史[s.历史.length - 1];
      s.待收束 = null;   // 回到过去就不该还挂着"待收尾"
      // 角色状态也跟着回退，否则面板会显示"未来的"好感
      var 目标世界 = (s.nodes[s.当前节点id] || {}).world || {};
      var 新状态 = {};
      Object.keys(目标世界.好感 || {}).forEach(function(k) {
        新状态[k] = 新状态[k] || {};
        if (typeof 目标世界.好感[k] === 'number') 新状态[k].好感 = 目标世界.好感[k];
      });
      Object.keys(目标世界.关系 || {}).forEach(function(k) {
        新状态[k] = 新状态[k] || {};
        新状态[k].关系 = 目标世界.关系[k];
      });
      s.角色状态 = 新状态;
      互动小说存故事(s).then(function(st) {
        document.querySelectorAll('.ovl').forEach(function(el) { el.remove(); });
        渲染互动小说游玩(互动小说游玩目标(), st);
        toast('✅ 已跳到第 ' + (idx + 1) + ' 段');
      }).catch(function(e) { toast('跳转失败：' + ((e && e.message) || e)); });
    });
  }).catch(function(e) { toast('跳转失败：' + ((e && e.message) || e)); });
};
