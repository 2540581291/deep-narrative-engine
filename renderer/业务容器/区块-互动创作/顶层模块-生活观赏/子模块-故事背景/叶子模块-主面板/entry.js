// ============================================================
// 生活观赏 · 情景交集（角色交集的源头 / 情景设定）
// 核心是【总览时间线】：一条统一的时间线，逐日推进（不跳日），
//   每天 → 年月日 + 周几；每天内分若干【时间段】。
//   每个时间段若同时涉及多个人（多个交集），在后面标注涉及人物。
// 支持【丰富】：初版只列概要；可对单个时间段「🎨 丰富」，也可对某天「✨ 一键丰富当天」。
// ============================================================
// 内容结构：{ world, mechanism,
//             days:[ { date, weekday, segments:[{time,event,roles:[名]}] } ] }

// 渲染情景交集（editable=true 时呈现可编辑表单）
function 生活观赏渲染故事(el, content, editable) {
  if (!content) content = 生活观赏内容;
  if (!content) { el.innerHTML = '<div class="placeholder-text">暂无情景交集</div>'; return; }
  var h = '';

  // 世界观 / 设定
  h += 生活观赏故事字段('🌍 世界观 / 设定', 'world', content.world, editable);
  // 交集机制
  h += 生活观赏故事字段('🔗 交集机制（他们是怎么被联系起来的）', 'mechanism', content.mechanism, editable);

  // 总览时间线
  var days = content.days || [];
  h += '<div class="flex justify-between items-center mb-4" style="margin-top:8px">';
  h += '<div class="fs-12 fw-600 c-fg">⏳ 总览时间线（逐日推进 · 不跳日 · 每个时间段标注涉及人物）</div>';
  h += '<span class="btn-out btn-sm" style="font-size:10px" title="让 AI 判断哪些时间段可能发生朋友圈/线上聊天/书信留言/电话，并猜想沟通内容" onclick="生活观赏推断行为()">📡 AI 推断行为</span>';
  h += '</div>';
  if (!days.length) h += '<div class="placeholder-text">暂无时间线</div>';
  if (!days.length) {
    h += '<div class="mb-8"><span class="btn-out btn-sm" style="font-size:11px" title="添加第一天，AI 自动生成" onclick="生活观赏加天结尾()">＋ 添加第一天</span></div>';
  } else {
    h += '<div class="mb-8"><span class="btn-out btn-sm" style="font-size:11px" title="在最前面加一天，AI 依据后文自动生成" onclick="生活观赏加天开头()">＋ 在开头加一天</span></div>';
  }

  days.forEach(function(day, di) {
    h += '<div style="border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:12px;background:var(--bg2)">';
    // 日期头（含当天人物索引）
    var 当天人物 = 生活观赏当天人物(day);
    if (editable) {
      h += '<div class="flex gap-6 items-center mb-6">';
      h += '<input class="llm-input" style="width:160px;height:26px;font-size:12px" value="' + escHtml(day.date || '') + '" placeholder="日期 YYYY-MM-DD" oninput="生活观赏设(\'days.' + di + '.date\', this.value)">';
      h += '<input class="llm-input" style="width:80px;height:26px;font-size:12px" value="' + escHtml(day.weekday || '') + '" placeholder="周几" oninput="生活观赏设(\'days.' + di + '.weekday\', this.value)">';
      if (当天人物.length) h += '<span class="fs-11 c-fg2">当天涉及：' + escHtml(当天人物.join('、')) + '</span>';
      h += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="生活观赏故事删天(' + di + ')">✕ 当天</span>';
      h += '</div>';
    } else {
      h += '<div class="flex items-center gap-6 mb-6">';
      h += '<span class="fs-13" style="color:var(--accent);font-weight:700">' + escHtml(day.date || '') + '</span>';
      if (day.weekday) h += '<span class="badge-tag">' + escHtml(day.weekday) + '</span>';
      if (当天人物.length) h += '<span class="badge-tag" style="color:var(--fg2)">👥 ' + escHtml(当天人物.join('、')) + '</span>';
      h += '<span class="btn-secondary btn-sm" style="font-size:10px;margin-left:auto" title="删除这一天" onclick="生活观赏故事删天(' + di + ')">✕ 当天</span>';
      h += '</div>';
    }
    // 时间段
    var segs = day.segments || [];
    segs.forEach(function(s, si) {
      if (editable) {
        h += '<div class="flex gap-6 items-center mb-3" style="padding-left:8px">';
        // 时间段（固定选项：上午/中午/下午/晚上/午夜）
        h += '<select class="llm-input llm-select" style="width:96px;height:24px;font-size:11px" onchange="生活观赏设(\'days.' + di + '.segments.' + si + '.time\', this.value)">';
        var curT = s.time || '';
        if ((typeof 生活观赏时间段表 !== 'undefined' ? 生活观赏时间段表 : ['上午','中午','下午','晚上','午夜']).indexOf(curT) < 0) h += '<option value="' + escHtml(curT) + '">' + escHtml(curT || '时间段') + '</option>';
        (typeof 生活观赏时间段表 !== 'undefined' ? 生活观赏时间段表 : ['上午','中午','下午','晚上','午夜']).forEach(function(tv) {
          h += '<option value="' + tv + '"' + (tv === curT ? ' selected' : '') + '>' + tv + '</option>';
        });
        h += '</select>';
        h += '<input class="llm-input" style="flex:2;height:24px;font-size:11px" value="' + escHtml(s.event || '') + '" placeholder="这个时间在干什么（一句概览）" oninput="生活观赏设(\'days.' + di + '.segments.' + si + '.event\', this.value)">';
        h += '<input class="llm-input" style="width:120px;height:24px;font-size:11px" value="' + escHtml((s.roles || []).join('、')) + '" placeholder="涉及人物" oninput="生活观赏设角色(' + di + ',' + si + ', this.value)">';
        h += '<span class="btn-out btn-sm" style="font-size:10px" title="为这个时间段选择生成方式（朋友圈/线上聊天/书信/电话）" onclick="生活观赏打开行为生成(' + di + ',' + si + ')">🛠 生成</span>';
        h += '<span class="btn-out btn-sm" style="font-size:10px" title="在此插入一段新事件" onclick="生活观赏打开事件插入(' + di + ',' + (si + 1) + ')">🎬 插入</span>';
        h += '<span class="btn-out btn-sm" style="font-size:10px" title="丰富这个时间段" onclick="生活观赏富化段(' + di + ',' + si + ')">🎨 丰富</span>';
        h += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="生活观赏故事删段(' + di + ',' + si + ')">✕</span>';
        h += '</div>';
      } else {
        h += '<div class="flex gap-6 items-start mb-3" style="padding-left:8px">';
        h += '<span class="fs-12" style="color:var(--fg2);width:82px;flex-shrink:0">' + escHtml(s.time || '') + '</span>';
        h += '<span class="fs-12" style="flex:1;line-height:1.6">' + escHtml(s.event || '') + '</span>';
        if (s.roles && s.roles.length) h += '<span class="fs-11" style="color:var(--accent);flex-shrink:0;white-space:nowrap;margin-left:6px">涉及：' + escHtml(s.roles.join('、')) + '</span>';
        h += '<span class="btn-out btn-sm" style="font-size:10px;flex-shrink:0;margin-left:6px" title="为这个时间段选择生成方式（朋友圈/线上聊天/书信/电话）" onclick="生活观赏打开行为生成(' + di + ',' + si + ')">🛠 生成</span>';
        h += '<span class="btn-out btn-sm" style="font-size:10px;flex-shrink:0;margin-left:6px" title="在此插入一段新事件" onclick="生活观赏打开事件插入(' + di + ',' + (si + 1) + ')">🎬 插入</span>';
        h += '<span class="btn-out btn-sm" style="font-size:10px;flex-shrink:0;margin-left:6px" title="丰富这个时间段" onclick="生活观赏富化段(' + di + ',' + si + ')">🎨 丰富</span>';
        h += '<span class="btn-secondary btn-sm" style="font-size:10px;flex-shrink:0;margin-left:6px" title="删除这个时间段" onclick="生活观赏故事删段(' + di + ',' + si + ')">✕</span>';
        h += '</div>';
      }
      // AI 推断的互动行为标记（点标签可跳转到对应模块细化/生成）
      if (s.infer && s.infer.behaviors && s.infer.behaviors.length) {
        var 标签们 = s.infer.behaviors.map(function(b) {
          var lab = (typeof 生活观赏行为标签 !== 'undefined' && 生活观赏行为标签[b]) ? 生活观赏行为标签[b] : b;
          return '<span style="cursor:pointer;color:var(--accent);font-weight:600" title="跳转到对应模块细化/生成" onclick="生活观赏跳转行为(\'' + b + '\',' + di + ',' + si + ')">' + escHtml(lab) + '</span>';
        }).join('、');
        h += '<div style="margin:0 0 8px 16px;padding:6px 10px;background:rgba(78,204,163,0.08);border-left:2px solid var(--accent);border-radius:4px;font-size:11px;line-height:1.6">';
        h += '<span class="fw-600" style="color:var(--accent)">🔎 可能：</span>' + 标签们;
        h += '<span class="fs-10 c-fg3" style="margin-left:6px">（点标签跳转细化/生成）</span>';
        if (s.infer.content) h += '<div style="margin-top:2px;color:var(--fg2)">💭 ' + escHtml(s.infer.content) + '</div>';
        h += '<span class="btn-out btn-sm" style="font-size:9px;margin-top:4px" onclick="生活观赏清除推断(' + di + ',' + si + ')">✕ 清除推断</span>';
        h += '</div>';
      }
    });
    if (!segs.length) h += '<div class="fs-11 c-fg3">暂无时间段</div>';
    // 操作
    if (editable) {
      h += '<div class="mt-4 flex gap-6" style="padding-left:8px">';
      h += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="生活观赏故事加段(' + di + ')">＋ 时间段</span>';
      h += '<span class="btn-out btn-sm" style="font-size:10px" title="重新生成本天时间段（依据前后文）" onclick="生活观赏生成这天(' + di + ')">⚡ 生成这天</span>';
      h += '<span class="btn-out btn-sm" style="font-size:10px" title="在此天末尾插入一个新事件" onclick="生活观赏打开事件插入(' + di + ')">🎬 插入事件</span>';
      h += '<span class="btn-out btn-sm" style="font-size:10px" title="一键丰富当天全部内容" onclick="生活观赏富化天(' + di + ')">✨ 一键丰富当天</span>';
      h += '</div>';
    } else {
      h += '<div class="mt-4 flex gap-6" style="padding-left:8px">';
      h += '<span class="btn-out btn-sm" style="font-size:10px" title="重新生成本天时间段（依据前后文）" onclick="生活观赏生成这天(' + di + ')">⚡ 生成这天</span>';
      h += '<span class="btn-out btn-sm" style="font-size:10px" title="在此天末尾插入一个新事件" onclick="生活观赏打开事件插入(' + di + ')">🎬 插入事件</span>';
      h += '<span class="btn-out btn-sm" style="font-size:10px" title="一键丰富当天全部内容" onclick="生活观赏富化天(' + di + ')">✨ 一键丰富当天</span>';
      h += '</div>';
    }
    h += '</div>';
  });
  if (days.length) h += '<div class="mt-8"><span class="btn-out btn-sm" style="font-size:11px" title="在最后面加一天，AI 依据前文自动生成" onclick="生活观赏加天结尾()">＋ 在结尾加一天</span></div>';
  el.innerHTML = h;
}
window.生活观赏渲染故事 = 生活观赏渲染故事;

// 当天所有涉及人物（每个时间段涉及人物的并集）
function 生活观赏当天人物(day) {
  var set = [];
  (day.segments || []).forEach(function(s) {
    (s.roles || []).forEach(function(r) { if (set.indexOf(r) < 0 && r) set.push(r); });
  });
  return set;
}
window.生活观赏当天人物 = 生活观赏当天人物;

// 单个故事字段的渲染（编辑 / 只读）
function 生活观赏故事字段(label, key, val, editable) {
  var h = '<div style="margin-bottom:10px"><div class="fs-11 c-fg2 mb-4">' + label + '</div>';
  if (editable) {
    h += '<textarea class="llm-input" style="width:100%;min-height:46px;resize:vertical;font-size:13px;line-height:1.6" oninput="生活观赏设(\'' + key + '\', this.value)">' + escHtml(val || '') + '</textarea>';
  } else {
    h += '<div style="font-size:13px;line-height:1.7;white-space:pre-wrap;padding:8px 10px;background:var(--bg2);border-radius:6px">' + escHtml(val || '（未填写）') + '</div>';
  }
  h += '</div>';
  return h;
}
window.生活观赏故事字段 = 生活观赏故事字段;

// 时间段「涉及人物」数组写入（与通用标量写入不同，这里是数组）
function 生活观赏设角色(di, si, value) {
  if (!生活观赏内容 || !生活观赏内容.days || !生活观赏内容.days[di]) return;
  var seg = 生活观赏内容.days[di].segments && 生活观赏内容.days[di].segments[si];
  if (!seg) return;
  seg.roles = String(value || '').split(/[、，,]/).map(function(s) { return s.trim(); }).filter(Boolean);
}
window.生活观赏设角色 = 生活观赏设角色;

// 导出为一段文本（供互动生成时注入上下文；总览时间线要点）
function 生活观赏故事导出文本(story) {
  if (!story || !story.content) return '';
  var c = story.content;
  var parts = [];
  if (c.world) parts.push('世界观：' + c.world);
  if (c.mechanism) parts.push('交集机制：' + c.mechanism);
  var days = c.days || [];
  var daylines = days.slice(0, 7).map(function(day) {
    var segs = (day.segments || []).slice(0, 4).map(function(s) {
      var roleStr = (s.roles && s.roles.length) ? '（涉及：' + s.roles.join('、') + '）' : '';
      return (s.time || '') + ' ' + (s.event || '') + roleStr;
    }).join('；');
    return (day.date || '') + (day.weekday ? ' ' + day.weekday : '') + '：' + (segs || '（当天内容待补充）');
  });
  if (daylines.length) parts.push('时间线：\n' + daylines.join('\n'));
  return parts.join('\n');
}
window.生活观赏故事导出文本 = 生活观赏故事导出文本;

// 填充：AI 返回的交集 JSON → 生活观赏内容
function 生活观赏填充故事(d) {
  var days = (Array.isArray(d && d.days) ? d.days : []).map(function(day) {
    return {
      date: day.date || '',
      weekday: day.weekday || '',
      segments: (typeof 生活观赏段排序 === 'function' ? 生活观赏段排序 : function(s){return s;})((Array.isArray(day.segments) ? day.segments : []).map(function(s) {
        return {
          time: (typeof 生活观赏规范时间 === 'function' ? 生活观赏规范时间(s.time) : s.time),
          event: s.event || '',
          roles: (Array.isArray(s.roles) ? s.roles : []).map(function(r) { return String(r); }),
        };
      })),
    };
  });
  生活观赏内容 = {
    world: (d && d.world) || '',
    mechanism: (d && d.mechanism) || '',
    days: days,
  };
}
window.生活观赏填充故事 = 生活观赏填充故事;

// ===== 编辑操作 =====
function 生活观赏故事加天() {
  if (!生活观赏内容) 生活观赏内容 = { days: [] };
  if (!生活观赏内容.days) 生活观赏内容.days = [];
  生活观赏内容.days.push({ date: '', weekday: '', segments: [ { time: '上午', event: '', roles: [] } ] });
  生活观赏故事重绘();
}
window.生活观赏故事加天 = 生活观赏故事加天;

function 生活观赏故事删天(di) {
  if (!生活观赏内容 || !生活观赏内容.days) return;
  生活观赏内容.days.splice(di, 1);
  生活观赏保存();
  生活观赏渲染();
}
window.生活观赏故事删天 = 生活观赏故事删天;

function 生活观赏故事加段(di) {
  if (!生活观赏内容 || !生活观赏内容.days || !生活观赏内容.days[di]) return;
  var day = 生活观赏内容.days[di];
  if (!day.segments) day.segments = [];
  var t = (typeof 生活观赏下一时间段 === 'function') ? 生活观赏下一时间段(day) : '上午';
  day.segments.push({ time: t, event: '', roles: [] });
  生活观赏保存();
  生活观赏渲染();
}
window.生活观赏故事加段 = 生活观赏故事加段;

function 生活观赏故事删段(di, si) {
  if (!生活观赏内容 || !生活观赏内容.days || !生活观赏内容.days[di]) return;
  生活观赏内容.days[di].segments.splice(si, 1);
  生活观赏保存();
  生活观赏渲染();
}
window.生活观赏故事删段 = 生活观赏故事删段;

function 生活观赏故事重绘() {
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染故事(el, 生活观赏内容, true);
}
window.生活观赏故事重绘 = 生活观赏故事重绘;
