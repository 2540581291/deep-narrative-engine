// ============================================================
// 生活观赏 · 电话（角色之间的通话记录与对话）
// ============================================================
// 内容结构：{ calls: [ { caller, callee, time, duration, summary, dialogue:[{speaker,content}] } ] }

function 生活观赏渲染电话(el, content, editable) {
  if (!content) content = 生活观赏内容;
  if (!content) { el.innerHTML = '<div class="placeholder-text">暂无通话记录</div>'; return; }
  var calls = content.calls || [];
  var h = '';
  if (!calls.length) h += '<div class="placeholder-text">暂无通话</div>';
  calls.forEach(function(c, ci) {
    h += '<div style="border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px;background:var(--bg2)">';
    // 通话头部
    if (editable) {
      h += '<div class="flex gap-6 items-center mb-6">';
      h += '<input class="llm-input" style="flex:1;height:24px;font-size:11px" value="' + escHtml(c.caller || '') + '" placeholder="主叫" oninput="生活观赏设(\'calls.' + ci + '.caller\', this.value)">';
      h += '<span class="fs-11 c-fg3">→</span>';
      h += '<input class="llm-input" style="flex:1;height:24px;font-size:11px" value="' + escHtml(c.callee || '') + '" placeholder="被叫" oninput="生活观赏设(\'calls.' + ci + '.callee\', this.value)">';
      h += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="生活观赏电话删通话(' + ci + ')">✕ 删除</span>';
      h += '</div>';
      h += '<div class="flex gap-6 items-center mb-6">';
      h += '<input class="llm-input" style="width:130px;height:24px;font-size:11px" value="' + escHtml(c.time || '') + '" placeholder="时间" oninput="生活观赏设(\'calls.' + ci + '.time\', this.value)">';
      h += '<input class="llm-input" style="width:110px;height:24px;font-size:11px" value="' + escHtml(c.duration || '') + '" placeholder="时长" oninput="生活观赏设(\'calls.' + ci + '.duration\', this.value)">';
      h += '</div>';
      h += '<textarea class="llm-input" style="width:100%;min-height:40px;resize:vertical;margin-bottom:6px" placeholder="通话摘要" oninput="生活观赏设(\'calls.' + ci + '.summary\', this.value)">' + escHtml(c.summary || '') + '</textarea>';
    } else {
      h += '<div class="flex justify-between items-center mb-6">';
      h += '<div class="fs-13 fw-600">📞 ' + escHtml(c.caller || '') + ' → ' + escHtml(c.callee || '') + '</div>';
      h += '<div class="fs-11 c-fg3">' + escHtml(c.time || '') + (c.duration ? ' · ' + escHtml(c.duration) : '') + '</div>';
      h += '</div>';
      if (c.summary) h += '<div class="fs-11 c-fg2 mb-6" style="opacity:.85">📌 ' + escHtml(c.summary) + '</div>';
    }
    // 通话对白
    var dlg = c.dialogue || [];
    if (dlg.length || editable) {
      h += '<div style="border-top:1px solid var(--border);padding-top:6px">';
      dlg.forEach(function(d, di) {
        h += '<div class="flex items-start gap-6 mb-4">';
        if (editable) {
          h += '<input class="llm-input" style="width:130px;height:24px;font-size:11px" value="' + escHtml(d.speaker || '') + '" placeholder="说话人" oninput="生活观赏设(\'calls.' + ci + '.dialogue.' + di + '.speaker\', this.value)">';
          h += '<input class="llm-input" style="flex:1;height:24px;font-size:11px" value="' + escHtml(d.content || '') + '" placeholder="说的话" oninput="生活观赏设(\'calls.' + ci + '.dialogue.' + di + '.content\', this.value)">';
          h += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="生活观赏电话删对白(' + ci + ',' + di + ')">✕</span>';
        } else {
          h += '<span class="fs-12" style="color:var(--accent);font-weight:600;flex-shrink:0;width:90px">' + escHtml(d.speaker || '') + '</span>';
          h += '<span class="fs-12" style="flex:1;line-height:1.5">' + escHtml(d.content || '') + '</span>';
        }
        h += '</div>';
      });
      if (!dlg.length) h += '<div class="fs-11 c-fg3">暂无对话内容</div>';
      h += '</div>';
    }
    if (editable) h += '<div class="mt-6"><span class="btn-secondary btn-sm" style="font-size:11px" onclick="生活观赏电话加对白(' + ci + ')">＋ 对白</span></div>';
    h += '</div>';
  });
  if (editable) h += '<button class="btn-secondary btn-sm" style="font-size:11px" onclick="生活观赏电话加通话()">＋ 添加一通电话</button>';
  el.innerHTML = h;
}
window.生活观赏渲染电话 = 生活观赏渲染电话;

// 填充：AI 返回的 JSON → 生活观赏内容
function 生活观赏填充电话(d) {
  var calls = (d && Array.isArray(d.calls)) ? d.calls : [];
  生活观赏内容 = {
    calls: calls.map(function(c) {
      return {
        caller: c.caller || '',
        callee: c.callee || '',
        time: c.time || '',
        duration: c.duration || '',
        summary: c.summary || '',
        dialogue: (Array.isArray(c.dialogue) ? c.dialogue : []).map(function(x) { return { speaker: x.speaker || '', content: x.content || '' }; }),
      };
    }),
  };
}
window.生活观赏填充电话 = 生活观赏填充电话;

// 编辑操作
function 生活观赏电话加通话() {
  if (!生活观赏内容) 生活观赏内容 = { calls: [] };
  生活观赏内容.calls.push({ caller: '', callee: '', time: '', duration: '', summary: '', dialogue: [] });
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染电话(el, 生活观赏内容, true);
}
window.生活观赏电话加通话 = 生活观赏电话加通话;

function 生活观赏电话删通话(ci) {
  if (!生活观赏内容 || !生活观赏内容.calls) return;
  生活观赏内容.calls.splice(ci, 1);
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染电话(el, 生活观赏内容, true);
}
window.生活观赏电话删通话 = 生活观赏电话删通话;

function 生活观赏电话加对白(ci) {
  if (!生活观赏内容 || !生活观赏内容.calls || !生活观赏内容.calls[ci]) return;
  if (!生活观赏内容.calls[ci].dialogue) 生活观赏内容.calls[ci].dialogue = [];
  生活观赏内容.calls[ci].dialogue.push({ speaker: '', content: '' });
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染电话(el, 生活观赏内容, true);
}
window.生活观赏电话加对白 = 生活观赏电话加对白;

function 生活观赏电话删对白(ci, di) {
  if (!生活观赏内容 || !生活观赏内容.calls || !生活观赏内容.calls[ci] || !生活观赏内容.calls[ci].dialogue) return;
  生活观赏内容.calls[ci].dialogue.splice(di, 1);
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染电话(el, 生活观赏内容, true);
}
window.生活观赏电话删对白 = 生活观赏电话删对白;
