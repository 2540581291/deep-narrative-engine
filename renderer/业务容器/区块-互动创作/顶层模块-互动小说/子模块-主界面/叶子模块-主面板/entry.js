// 互动小说（重做·玩家实时生成）· 主界面
var 互动小说导航 = [
  { id: 'list', label: '📚 我的故事' },
  { id: 'create', label: '＋ 新建' },
];
var 互动小说当前视图 = 'list';
var 互动小说当前游玩id = null;
var 互动小说Api = null;

function 互动小说切换视图(view) {
  互动小说当前视图 = view;
  var el = document.getElementById('interactive-novelContent');
  if (!el) return;
  if (!互动小说Api) {
    互动小说Api = 渲染标签栏(el, 互动小说导航, { active: view, subId: 'inViewContent', onSwitch: function(v){ 互动小说切换视图(v); } });
  } else {
    互动小说Api.setActive(view);
  }
  var vEl = 互动小说Api.sub;
  switch (view) {
    case 'list':   互动小说渲染列表(vEl); break;
    case 'create': 互动小说渲染创建(vEl); break;
    case 'play':   互动小说开始游玩(互动小说当前游玩id); break;
  }
}

function 互动小说渲染列表(el) {
  互动小说列表().then(function(items) {
    var h = '<div class="mb-10"><button class="btn-new" onclick="互动小说切换视图(\'create\')">＋ 新建</button></div>';
    if (!items.length) {
      h += '<div class="placeholder-text">还没有故事——点「＋ 新建」让 AI 写一个属于你的互动故事。</div>';
    } else {
      items.forEach(function(s) {
        var 步数 = (s.历史 || []).length;
        var 段数 = Object.keys(s.nodes || {}).length;
        var 结局数 = (s.结局集 || []).length;
        h += '<div class="n-card cur-ptr mb-6 p-10" onclick="互动小说进入故事(\'' + s.id + '\')">';
        h += '<div class="fw-600 fs-14">🎮 ' + escHtml(s.title) + '</div>';
        if (s.题材 || s.尺度) h += '<div class="text-sm text-muted">' + escHtml((s.题材 || '') + (s.尺度 ? ' · ' + s.尺度 : '')) + '</div>';
        if (s.cast && s.cast.length) h += '<div class="mt-4">' + s.cast.map(function(c) { return '<span class="badge-tag">' + escHtml(c.name || '') + '</span>'; }).join(' ') + '</div>';
        h += '<div class="mt-4 text-sm text-muted">已走 ' + 步数 + ' 步 · 生成 ' + 段数 + ' 段 · 结局 ' + 结局数 + ' 个</div>';
        if (s.结局集 && s.结局集.length) h += '<div class="mt-4 flex gap-4 flex-wrap">' + s.结局集.map(function(e) { return '<span class="badge-tag" style="background:rgba(212,136,158,.16);color:#d4889e">🏁 ' + escHtml(e) + '</span>'; }).join('') + '</div>';
        h += '<div class="mt-6 flex gap-4">';
        h += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="event.stopPropagation();互动小说重命名(\'' + s.id + '\')">✏️ 重命名</span>';
        h += '<span class="btn-secondary btn-sm" onclick="event.stopPropagation();互动小说进入故事(\'' + s.id + '\')">🎮 继续/游玩</span>';
        h += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="event.stopPropagation();互动小说导出故事(\'' + s.id + '\')">📤 导出</span>';
        h += '<span class="btn-secondary btn-sm c-error" onclick="event.stopPropagation();互动小说删故事2(\'' + s.id + '\')">🗑 删除</span>';
        h += '</div></div>';
      });
    }
    el.innerHTML = h;
  });
}
function 互动小说进入故事(id) { 互动小说当前游玩id = id; 互动小说切换视图('play'); }
function 互动小说删故事2(id) {
  confirmDialog('确定删除这个故事？', function() { 互动小说删故事(id).then(function() { toast('已删除'); 互动小说切换视图('list'); }); });
}
// 重命名：弹窗输入新标题
function 互动小说重命名(id) {
  互动小说取故事(id).then(function(s) {
    if (!s) { toast('故事不存在'); return; }
    window.__inRenameId = id;
    var html = '<div class="mcard" style="max-width:460px"><div style="font-size:14px;font-weight:700;margin-bottom:10px">✏️ 重命名故事</div>';
    html += '<input class="llm-input" id="inRenameInput" value="' + escHtml(s.title || '') + '" style="width:100%">';
    html += '<div style="margin-top:12px;display:flex;justify-content:flex-end;gap:8px"><button class="btn-out btn-sm" onclick="this.closest(\'.ovl\').remove()">取消</button><button class="btn-main" onclick="互动小说重命名确认(\'' + id + '\')">保存</button></div></div>';
    var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = html;
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
    setTimeout(function() { var d = document.getElementById('inRenameInput'); if (d) d.focus(); }, 60);
  });
}
function 互动小说重命名确认(id) {
  var v = (document.getElementById('inRenameInput') || {}).value || '';
  document.querySelectorAll('.ovl').forEach(function(el) { el.remove(); });
  if (!v.trim()) { toast('名称不能为空'); return; }
  互动小说取故事(id).then(function(s) {
    if (!s) return; s.title = v.trim();
    return 互动小说存故事(s);
  }).then(function() { toast('✅ 已重命名'); 互动小说切换视图('list'); });
}
// 导出故事 JSON 到本地
function 互动小说导出故事(id) {
  互动小说取故事(id).then(function(s) {
    if (!s) { toast('故事不存在'); return; }
    try {
      var blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (s.title || '互动故事') + '.json';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      toast('✅ 已导出');
    } catch(e) { toast('导出失败：' + (e && e.message || e)); }
  });
}
window.互动小说进入故事 = 互动小说进入故事;
window.互动小说删故事2 = 互动小说删故事2;
window.互动小说重命名 = 互动小说重命名;
window.互动小说重命名确认 = 互动小说重命名确认;
window.互动小说导出故事 = 互动小说导出故事;

function 互动小说渲染创建(el) {
  // 主角视角默认值
  if (!window.__inGender) window.__inGender = '男性';
  if (!window.__inPos) window.__inPos = '平等互动';
  var h = '';
  h += '<div style="max-width:960px;margin:0 auto;display:flex;flex-direction:column;gap:16px">';
  // —— 顶部标语区 ——
  h += '<div style="padding:6px 2px 2px">';
  h += '<div style="font-size:22px;font-weight:700;letter-spacing:.5px">✨ 创作一个新的互动故事</div>';
  h += '<div style="color:var(--fg2);font-size:12.5px;margin-top:6px;line-height:1.7">给 AI 一个方向或几项锚点，它会为你构思标题、题材、尺度、文风、世界观与角色，并写好开场。你可以先让 AI 给候选点子，或直接生成。</div>';
  h += '</div>';

  // —— 主区：左配置 / 右候选 ——
  h += '<div style="display:flex;gap:16px;align-items:stretch;flex-wrap:wrap">';

  // ===== 左列：生成配置 =====
  h += '<div style="flex:1.4;min-width:0;display:flex;flex-direction:column;gap:14px">';
  // 主角视角（性别 + 定位）—— 置于最上方，最显眼
  h += '<div class="n-card" style="border-radius:14px;padding:14px 16px;border-color:var(--accent2)">';
  h += '<div style="font-size:13.5px;font-weight:700;margin-bottom:2px">👤 主角视角 <span style="font-size:10px;color:var(--accent2);font-weight:600">点选即可切换</span></div>';
  h += '<div style="font-size:10.5px;color:var(--fg3);margin-bottom:12px">决定你扮演的角色性别，以及主动/被动关系——不再固定为被惩罚、被调教的一方。</div>';
  h += '<div style="font-size:11px;color:var(--fg2);margin-bottom:6px">主角性别</div>';
  h += '<div id="inC_GenderChips" class="flex gap-6 flex-wrap" style="margin-bottom:13px">';
  h += 互动小说chipsHTML([['男性','男'],['女性','女'],['扶她','扶她'],['伪娘','伪娘']], 'inC_GenderChips');
  h += '</div>';
  h += '<div style="font-size:11px;color:var(--fg2);margin-bottom:6px">主角定位（主动 / 被动 / 平等）</div>';
  h += '<div id="inC_PosChips" class="flex gap-6 flex-wrap" style="margin-bottom:4px">';
  h += 互动小说chipsHTML([['平等互动','平等互动'],['主导者','主导 · 调教方'],['承受者','承受 · 被调教方']], 'inC_PosChips');
  h += '</div>';
  h += '<div style="font-size:10px;color:var(--fg3);line-height:1.7;margin-top:6px">主导者=你是调教/支配/引导的一方；承受者=你被调教/被支配；平等互动=双方对等。除非选「承受者」，否则不会把你写成总被惩罚的一方。</div></div>';

  // 一句话方向
  h += '<div class="n-card" style="border-radius:14px;padding:16px 18px">';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">';
  h += '<div style="font-size:13.5px;font-weight:700">🎯 一句话方向</div>';
  h += '<span style="font-size:10px;color:var(--fg3)">可留空，AI 即兴</span></div>';
  h += '<div class="flex gap-6 flex-wrap" id="inC_DirChips" style="margin-bottom:9px">';
  ['深夜雾都的隐秘客人','修真后宫的内门小师妹','被她老师牵住的乖学生','都市夜归人的暧昧来电','学园天台的一场交易','女仆咖啡厅的深夜调教','雪夜温泉的独居老板','赛博义体诊所的艳客'].map(function(d) {
    return '<span class="preset-chip" onclick="document.getElementById(\'inC_Direction\').value=\'' + d + '\';document.querySelectorAll(\'#inC_DirChips .preset-chip\').forEach(function(c){c.classList.remove(\'preset-active\')});this.classList.add(\'preset-active\')">' + d + '</span>';
  }).join('') + '</div>';
  h += '<textarea class="llm-input" id="inC_Direction" placeholder="用一句话描述你想读到的故事…" style="min-height:62px;resize:vertical;border-radius:10px"></textarea></div>';

  // 生成锚点（2x2 栅格）
  h += '<div class="n-card" style="border-radius:14px;padding:16px 18px">';
  h += '<div style="font-size:13.5px;font-weight:700;margin-bottom:12px">⚙️ 生成锚点 <span style="font-size:10px;color:var(--fg3);font-weight:400">全部可留空，AI 自动补全</span></div>';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
  h += '<div class="form-group" style="margin:0"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:5px">📌 题材</label><input class="llm-input" id="inC_Tema" placeholder="如：都市·悬疑·暧昧" style="height:34px;border-radius:9px"></div>';
  h += '<div class="form-group" style="margin:0"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:5px">🎚 尺度档位</label><select class="llm-input llm-select" id="inC_Scale" style="height:34px;border-radius:9px;font-size:12px"><option value="">AI 自定</option><option>含蓄隐晦</option><option>唯美风雅</option><option>直白露骨</option><option>粗俗露骨</option></select></div>';
  h += '<div class="form-group" style="margin:0"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:5px">✒️ 文风</label><input class="llm-input" id="inC_Wen" placeholder="如：冷冽、古典、口语化" style="height:34px;border-radius:9px"></div>';
  h += '<div class="form-group" style="margin:0"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:5px">🌌 世界观锚点</label><input class="llm-input" id="inC_World" placeholder="如：近未来赛博都市" style="height:34px;border-radius:9px"></div>';
  h += '</div>';
  h += '<div style="margin-top:10px;font-size:10.5px;color:var(--fg3);line-height:1.7">提示：题材/文风/世界观会作为后续续写的锚点，越具体越贴合；留空则交给 AI 自由发挥。</div></div>';

  // 快速随机制
  h += '<div class="n-card" style="border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:12px">';
  h += '<div style="font-size:12px;color:var(--fg2)">🎲 没有想法？让 AI 抛个方向：</div>';
  h += '<button class="btn-out btn-sm" style="border-radius:8px" onclick="互动小说随机方向()">🎲 随机方向</button>';
  h += '<button class="btn-out btn-sm" style="border-radius:8px" onclick="互动小说候选方向()">💡 给 3 个候选</button>';
  h += '</div></div>';

  // ===== 右列：AI 候选区 =====
  h += '<div class="n-card" style="flex:1;min-width:300px;border-radius:14px;padding:16px 18px;display:flex;flex-direction:column">';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px"><div style="font-size:13.5px;font-weight:700">💡 AI 候选构思</div><span id="inCandFlag" style="font-size:10px;color:var(--accent2);background:var(--accent-dim);padding:2px 8px;border-radius:10px;font-weight:600">♂ 男 · 平等</span></div>';
  h += '<div style="font-size:10.5px;color:var(--fg3);margin-bottom:12px">先让 AI 给 3 个差异鲜明的小点子，点选一个再正式生成。按左侧「主角视角」来定主角性别与定位。</div>';
  h += '<div id="inCandHint" style="font-size:11px;color:var(--accent2);margin-bottom:8px;min-height:16px"></div>';
  h += '<div id="inCandBox" style="flex:1;overflow-y:auto;max-height:340px"></div></div>';

  h += '</div>'; // 主区

  // —— 底部生成按钮 ——
  h += '<button id="inCreateBtn" class="btn" style="height:46px;border-radius:12px;font-size:14px;font-weight:700;letter-spacing:1px">🚀 AI 生成新故事</button>';
  h += '</div>';
  el.innerHTML = h;
  var b = document.getElementById('inCreateBtn');
  if (b) b.onclick = function() { 互动小说生成故事(); };
}
// 随机方向：随机挑一个预置方向填入
function 互动小说随机方向() {
  var 池 = ['深夜雾都的隐秘客人','修真后宫的内门小师妹','被她老师牵住的乖学生','都市夜归人的暧昧来电','学园天台的一场交易','女仆咖啡厅的深夜调教','雪夜温泉的独居老板','赛博义体诊所的艳客','合租屋里的双面少女','旧书店的午夜来客'];
  var d = 池[Math.floor(Math.random() * 池.length)];
  var t = document.getElementById('inC_Direction');
  if (t) t.value = d;
}
// 让 AI 给 3 个候选构思
// 读取主角性别/定位（优先读全局选中值，兜底从 DOM 查）
function 互动小说读主角() {
  var 性别 = window.__inGender || '男性';
  var 定位 = window.__inPos || '平等互动';
  return { 主角性别: 性别, 主角定位: 定位 };
}
function 互动小说候选方向() {
  var dir = ((document.getElementById('inC_Direction') || {}).value || '').trim();
  var 主角 = 互动小说读主角();
  var 配置 = {
    direction: dir,
    题材: ((document.getElementById('inC_Tema') || {}).value || '').trim(),
    尺度: ((document.getElementById('inC_Scale') || {}).value || '').trim(),
    文风: ((document.getElementById('inC_Wen') || {}).value || '').trim(),
    世界观: ((document.getElementById('inC_World') || {}).value || '').trim(),
    主角性别: 主角.主角性别,
    主角定位: 主角.主角定位,
  };
  var box = document.getElementById('inCandBox');
  var hint = document.getElementById('inCandHint');
  if (box) box.innerHTML = '<div style="padding:22px;text-align:center;color:var(--fg3);font-size:12px">⏳ AI 正在构思 3 个候选点子…</div>';
  if (hint) hint.textContent = '';
  var r = renderPrompt('in_create_options', { direction: 配置.direction || '（自由构思，请给 3 个差异鲜明的成人互动故事方向）', 题材: 配置.题材, 尺度: 配置.尺度, 文风: 配置.文风, 世界观: 配置.世界观, 主角性别: 配置.主角性别, 主角定位: 配置.主角定位 });
  LLM.callJSON({ label: '互动小说·候选', system: r.system, prompt: r.user }).then(function(d) {
    var opts = (d && Array.isArray(d.options)) ? d.options : [];
    if (!opts.length) { if (box) box.innerHTML = '<div style="padding:22px;text-align:center;color:var(--fg3);font-size:12px">候选为空，请重试</div>'; return; }
    var html = opts.map(function(o, oi) {
      return '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:8px;cursor:pointer;transition:all 0.15s" onclick="互动小说选候选(\'' + escHtml(JSON.stringify(o).replace(/'/g, "\\'")) + '\')" onmouseover="this.style.borderColor=\'var(--accent2)\';this.style.background=\'var(--accent-dim)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.background=\'var(--bg2)\'">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px"><span style="width:20px;height:20px;border-radius:6px;background:var(--accent-dim);color:var(--accent2);display:inline-flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0">' + (oi + 1) + '</span>' +
        '<div style="font-size:12.5px;font-weight:700;color:var(--fg)">' + escHtml(o.title || '') + '</div></div>' +
        '<div style="font-size:11px;color:var(--fg2);line-height:1.6;padding-left:28px">' + escHtml(o.desc || '') + '</div></div>';
    }).join('');
    if (box) box.innerHTML = html;
  }).catch(function(e) { if (box) box.innerHTML = '<div style="padding:22px;text-align:center;color:var(--fg3);font-size:12px">生成失败：' + (e && e.message || e) + '</div>'; });
}
// 点选候选：填入方向框，提示可正式生成
function 互动小说选候选(optJson) {
  var o = null; try { o = JSON.parse(optJson); } catch(e) {}
  if (!o) return;
  var d = document.getElementById('inC_Direction');
  if (d) d.value = (o.title || '') + '：' + (o.desc || '');
  var hint = document.getElementById('inCandHint');
  if (hint) hint.textContent = '✔ 已选「' + (o.title || '') + '」，点下方生成即可';
}
// 单选 chip 内联样式（不依赖可能失效的 preset-chip 类，确保视觉上是可点的单选按钮）
function 互动小说chip样式(active) {
  return active
    ? 'display:inline-flex;align-items:center;gap:5px;padding:7px 14px;font-size:12px;border-radius:8px;cursor:pointer;border:1.5px solid var(--accent2);background:var(--accent-dim);color:var(--accent2);font-weight:700;user-select:none;transition:all .15s'
    : 'display:inline-flex;align-items:center;gap:5px;padding:7px 14px;font-size:12px;border-radius:8px;cursor:pointer;border:1px solid var(--border);background:var(--bg2);color:var(--fg2);font-weight:400;user-select:none;transition:all .15s';
}
// 生成某组单选 chips 的 HTML（按当前全局选中值决定 active）
function 互动小说chipsHTML(选项, 容器id) {
  var cur = (容器id === 'inC_GenderChips') ? (window.__inGender || '男性') : (window.__inPos || '平等互动');
  return 选项.map(function(o) {
    var on = (o[0] === cur);
    return '<span data-v="' + o[0] + '" onclick="互动小说chip选(\'' + 容器id + '\',\'' + o[0] + '\',event)" style="' + 互动小说chip样式(on) + '">' + o[1] + '</span>';
  }).join('');
}
// chip 单选切换（内联样式高亮 + 记录选中值）
function 互动小说chip选(容器id, val, evt) {
  var box = document.getElementById(容器id);
  if (!box) return;
  box.querySelectorAll('span[data-v]').forEach(function(c) { c.style.cssText = 互动小说chip样式(false); c.classList.remove('preset-active'); });
  var found = (evt && evt.target) ? evt.target : box.querySelector('span[data-v="' + val + '"]');
  if (found) { found.style.cssText = 互动小说chip样式(true); found.classList.add('preset-active'); }
  if (容器id === 'inC_GenderChips') window.__inGender = val;
  else if (容器id === 'inC_PosChips') window.__inPos = val;
  互动小说刷新候选徽标();
}
// 刷新候选区徽标为当前主角选择
function 互动小说刷新候选徽标() {
  var flag = document.getElementById('inCandFlag');
  if (!flag) return;
  var 性 = { '男性':'男', '女性':'女', '扶她':'扶她', '伪娘':'伪娘' }[window.__inGender || '男性'] || '男';
  var 定 = { '主导者':'调教方', '承受者':'被调教方', '平等互动':'平等' }[window.__inPos || '平等互动'] || '平等';
  flag.textContent = 性 + ' · ' + 定;
}
// 正式生成
function 互动小说生成故事() {
  var 主角 = 互动小说读主角();
  var 配置 = {
    direction: ((document.getElementById('inC_Direction') || {}).value || '').trim(),
    题材: ((document.getElementById('inC_Tema') || {}).value || '').trim(),
    尺度: ((document.getElementById('inC_Scale') || {}).value || '').trim(),
    文风: ((document.getElementById('inC_Wen') || {}).value || '').trim(),
    世界观: ((document.getElementById('inC_World') || {}).value || '').trim(),
    主角性别: 主角.主角性别,
    主角定位: 主角.主角定位,
  };
  互动小说生成新故事(配置.direction, 配置).then(function(story) {
    互动小说当前游玩id = story.id;
    互动小说切换视图('play');
  }).catch(function(e) { toast('生成失败：' + (e && e.message || '未知')); });
}

registerPageRoute('interactive-novel', function(){ 互动小说切换视图(互动小说当前视图); });
window.互动小说切换视图 = 互动小说切换视图;
window.互动小说渲染创建 = 互动小说渲染创建;
window.互动小说生成故事 = 互动小说生成故事;
window.互动小说候选方向 = 互动小说候选方向;
window.互动小说选候选 = 互动小说选候选;
window.互动小说随机方向 = 互动小说随机方向;
window.互动小说chip选 = 互动小说chip选;
window.互动小说chip样式 = 互动小说chip样式;
window.互动小说刷新候选徽标 = 互动小说刷新候选徽标;
window.互动小说读主角 = 互动小说读主角;
