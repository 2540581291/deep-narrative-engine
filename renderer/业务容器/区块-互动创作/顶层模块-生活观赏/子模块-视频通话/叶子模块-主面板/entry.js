// ============================================================
// 生活观赏 · 视频通话（两个角色之间的视频通话，附「聊天的画面」）
// 与「电话」不同：视频通话能【看到画面】。真正视频通话是随时间的——
// 画面（看到对方样子/表情/背景）会随时间变化，说的话也随时间变化。
// 所以每个通话由【一段一段的时间片段（moments）】构成：每段有
//   时刻(time) + 画面(screen) + 这一刻说的对白(dialogue)，逐步推进。
// ============================================================
// 内容结构：{ calls:[ { caller, callee, time, duration, location,
//             moments:[ { time, screen, dialogue:[{speaker,content}] } ] } ] }

// 渲染视频通话（editable=true 时呈现可编辑表单）
function 生活观赏渲染视频(el, content, editable) {
  if (!content) content = 生活观赏内容;
  if (!content) { el.innerHTML = '<div class="placeholder-text">暂无视频通话</div>'; return; }
  var calls = content.calls || [];
  var h = '';
  if (!calls.length) h += '<div class="placeholder-text">暂无通话</div>';
  calls.forEach(function(c, ci) {
    h += '<div style="border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px;background:var(--bg2)">';
    // 头部：主叫→被叫 + 通话时间/时长/地点
    if (editable) {
      h += '<div class="flex gap-6 items-center mb-6">';
      h += '<input class="llm-input" style="flex:1;height:24px;font-size:11px" value="' + escHtml(c.caller || '') + '" placeholder="主叫" oninput="生活观赏设(\'calls.' + ci + '.caller\', this.value)">';
      h += '<span class="fs-11 c-fg3">→</span>';
      h += '<input class="llm-input" style="flex:1;height:24px;font-size:11px" value="' + escHtml(c.callee || '') + '" placeholder="被叫" oninput="生活观赏设(\'calls.' + ci + '.callee\', this.value)">';
      h += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="生活观赏视频删通话(' + ci + ')">✕ 删除</span>';
      h += '</div>';
      h += '<div class="flex gap-6 items-center mb-6">';
      h += '<input class="llm-input" style="width:140px;height:24px;font-size:11px" value="' + escHtml(c.time || '') + '" placeholder="通话开始（如 晚上8点）" oninput="生活观赏设(\'calls.' + ci + '.time\', this.value)">';
      h += '<input class="llm-input" style="width:110px;height:24px;font-size:11px" value="' + escHtml(c.duration || '') + '" placeholder="总时长" oninput="生活观赏设(\'calls.' + ci + '.duration\', this.value)">';
      h += '<input class="llm-input" style="flex:1;height:24px;font-size:11px" value="' + escHtml(c.location || '') + '" placeholder="各自所在/场景" oninput="生活观赏设(\'calls.' + ci + '.location\', this.value)">';
      h += '</div>';
    } else {
      h += '<div class="flex justify-between items-center mb-6">';
      h += '<div class="fs-13 fw-600">🎥 ' + escHtml(c.caller || '') + ' → ' + escHtml(c.callee || '') + '</div>';
      h += '<div class="fs-11 c-fg3">' + escHtml(c.time || '') + (c.duration ? ' · ' + escHtml(c.duration) : '') + (c.location ? ' · 📍 ' + escHtml(c.location) : '') + '</div>';
      h += '</div>';
    }
    // 时间轴（随时间推进的片段）
    var moments = c.moments || [];
    if (!moments.length) h += '<div class="fs-11 c-fg3">暂无时间片段</div>';
    moments.forEach(function(m, mi) {
      if (editable) {
        h += '<div style="border-top:1px solid var(--border);padding:8px 0 4px 8px">';
        h += '<div class="flex gap-6 items-center mb-4">';
        h += '<input class="llm-input" style="width:120px;height:24px;font-size:11px" value="' + escHtml(m.time || '') + '" placeholder="时刻（如 接通/三分钟后）" oninput="生活观赏设(\'calls.' + ci + '.moments.' + mi + '.time\', this.value)">';
        h += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="生活观赏视频删时刻(' + ci + ',' + mi + ')">✕ 时刻</span>';
        h += '</div>';
        h += '<textarea class="llm-input" style="width:100%;min-height:52px;resize:vertical;margin-bottom:6px;font-size:12px;line-height:1.6" placeholder="这一刻的画面（看到对方的样子/表情/穿着/背景）" oninput="生活观赏设(\'calls.' + ci + '.moments.' + mi + '.screen\', this.value)">' + escHtml(m.screen || '') + '</textarea>';
        (m.dialogue || []).forEach(function(d, di) {
          h += '<div class="flex gap-6 items-center mb-2">';
          h += '<input class="llm-input" style="width:120px;height:22px;font-size:10px" value="' + escHtml(d.speaker || '') + '" placeholder="说话人" oninput="生活观赏设(\'calls.' + ci + '.moments.' + mi + '.dialogue.' + di + '.speaker\', this.value)">';
          h += '<input class="llm-input" style="flex:1;height:22px;font-size:10px" value="' + escHtml(d.content || '') + '" placeholder="这一刻说的话" oninput="生活观赏设(\'calls.' + ci + '.moments.' + mi + '.dialogue.' + di + '.content\', this.value)">';
          h += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="生活观赏视频删对白(' + ci + ',' + mi + ',' + di + ')">✕</span>';
          h += '</div>';
        });
        h += '<span class="btn-out btn-sm" style="font-size:10px" onclick="生活观赏视频加对白(' + ci + ',' + mi + ')">＋ 对白</span>';
        h += '</div>';
      } else {
        h += '<div style="border-top:1px solid var(--border);padding:8px 0 4px 8px">';
        h += '<div class="flex items-center gap-6 mb-4"><span class="fs-12" style="color:var(--accent);font-weight:700">⏱ ' + escHtml(m.time || '') + '</span></div>';
        if (m.screen) {
          h += '<div style="margin-bottom:8px;background:linear-gradient(135deg,var(--bg),var(--card));border:1px solid var(--border);border-radius:8px;padding:10px">';
          h += '<div class="fs-10 fw-600 mb-3" style="color:var(--accent2)">🎬 通话画面</div>';
          h += '<div style="font-size:12px;line-height:1.7;white-space:pre-wrap">' + escHtml(m.screen) + '</div>';
          h += '</div>';
        }
        (m.dialogue || []).forEach(function(d) {
          h += '<div class="flex items-start gap-6 mb-2"><span class="fs-12" style="color:var(--accent);font-weight:600;flex-shrink:0;width:90px">' + escHtml(d.speaker || '') + '</span>';
          h += '<span class="fs-12" style="flex:1;line-height:1.5">' + escHtml(d.content || '') + '</span></div>';
        });
        h += '</div>';
      }
    });
    if (editable) h += '<div class="mt-6 flex gap-6"><span class="btn-secondary btn-sm" style="font-size:11px" onclick="生活观赏视频加时刻(' + ci + ')">＋ 加一个时刻</span> <span class="btn-secondary btn-sm" style="font-size:11px" onclick="生活观赏视频加通话()">＋ 添加一通视频通话</span></div>';
    h += '</div>';
  });
  if (editable && !calls.length) h += '<button class="btn-secondary btn-sm" style="font-size:11px" onclick="生活观赏视频加通话()">＋ 添加一通视频通话</button>';
  el.innerHTML = h;
}
window.生活观赏渲染视频 = 生活观赏渲染视频;

// 填充：AI 返回的 JSON → 生活观赏内容
function 生活观赏填充视频(d) {
  var calls = (Array.isArray(d && d.calls) ? d.calls : []).map(function(c) {
    return {
      caller: c.caller || '',
      callee: c.callee || '',
      time: c.time || '',
      duration: c.duration || '',
      location: c.location || '',
      moments: (Array.isArray(c.moments) ? c.moments : []).map(function(m) {
        return {
          time: m.time || '',
          screen: m.screen || '',
          dialogue: (Array.isArray(m.dialogue) ? m.dialogue : []).map(function(x) { return { speaker: x.speaker || '', content: x.content || '' }; }),
        };
      }),
    };
  });
  生活观赏内容 = { calls: calls };
}
window.生活观赏填充视频 = 生活观赏填充视频;

// ===== 编辑操作 =====
function 生活观赏视频加通话() {
  if (!生活观赏内容) 生活观赏内容 = { calls: [] };
  生活观赏内容.calls.push({ caller: '', callee: '', time: '', duration: '', location: '', moments: [ { time: '接通', screen: '', dialogue: [] } ] });
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染视频(el, 生活观赏内容, true);
}
window.生活观赏视频加通话 = 生活观赏视频加通话;
function 生活观赏视频删通话(ci) {
  if (!生活观赏内容 || !生活观赏内容.calls) return;
  生活观赏内容.calls.splice(ci, 1);
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染视频(el, 生活观赏内容, true);
}
window.生活观赏视频删通话 = 生活观赏视频删通话;
function 生活观赏视频加时刻(ci) {
  if (!生活观赏内容 || !生活观赏内容.calls || !生活观赏内容.calls[ci]) return;
  var c = 生活观赏内容.calls[ci];
  if (!c.moments) c.moments = [];
  c.moments.push({ time: '', screen: '', dialogue: [] });
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染视频(el, 生活观赏内容, true);
}
window.生活观赏视频加时刻 = 生活观赏视频加时刻;
function 生活观赏视频删时刻(ci, mi) {
  if (!生活观赏内容 || !生活观赏内容.calls || !生活观赏内容.calls[ci]) return;
  生活观赏内容.calls[ci].moments.splice(mi, 1);
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染视频(el, 生活观赏内容, true);
}
window.生活观赏视频删时刻 = 生活观赏视频删时刻;
function 生活观赏视频加对白(ci, mi) {
  if (!生活观赏内容 || !生活观赏内容.calls || !生活观赏内容.calls[ci]) return;
  var m = 生活观赏内容.calls[ci].moments && 生活观赏内容.calls[ci].moments[mi];
  if (!m) return;
  if (!m.dialogue) m.dialogue = [];
  m.dialogue.push({ speaker: '', content: '' });
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染视频(el, 生活观赏内容, true);
}
window.生活观赏视频加对白 = 生活观赏视频加对白;
function 生活观赏视频删对白(ci, mi, di) {
  if (!生活观赏内容 || !生活观赏内容.calls || !生活观赏内容.calls[ci]) return;
  生活观赏内容.calls[ci].moments[mi].dialogue.splice(di, 1);
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染视频(el, 生活观赏内容, true);
}
window.生活观赏视频删对白 = 生活观赏视频删对白;
