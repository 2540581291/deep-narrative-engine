// 配音配乐 · 已生成列表（① 已生成列表 tab）

// ===== 历史记录管理（存 保存/配音配乐历史.json，数组） =====
PY.historyPath = '配音配乐历史.json';

function pypyGetHistory() {
  try {
    if (typeof LocalFS !== 'undefined' && LocalFS.readJSONSync) {
      var arr = LocalFS.readJSONSync(PY.historyPath);
      if (Array.isArray(arr)) return arr;
    }
  } catch(e) {}
  return [];
}

function pypySaveHistory(list) {
  try {
    if (typeof LocalFS !== 'undefined' && LocalFS.saveJSON) {
      LocalFS.saveJSON(PY.historyPath, list);
    }
  } catch(e) {}
}

function pypyAddHistory(item) {
  var list = pypyGetHistory();
  list.unshift(item);
  if (list.length > 200) list = list.slice(0, 200);
  pypySaveHistory(list);
  if (typeof pypyRenderHistory === 'function') pypyRenderHistory();
}

function pypyRemoveHistory(index) {
  var list = pypyGetHistory();
  list.splice(index, 1);
  pypySaveHistory(list);
  pypyRenderHistory();
}

function pypyPlayHistory(item) {
  if (!item || !item.base64) return;
  var bytes = atob(item.base64);
  var arr = new Uint8Array(bytes.length);
  for (var i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  var blob = new Blob([arr], { type: 'audio/wav' });
  var url = URL.createObjectURL(blob);
  var audio = new Audio(url);
  audio.play();
  toast('播放中…');
}

// ===== 导出到 保存/音频/ =====
function pypyExportHistory(item, index) {
  if (!item || !item.base64) return;
  var ts = new Date(item.time ? new Date(item.time) : new Date());
  var pad = function(n) { return String(n).padStart(2, '0'); };
  var name = '配音_' + ts.getFullYear() + pad(ts.getMonth() + 1) + pad(ts.getDate()) +
             '_' + pad(ts.getHours()) + pad(ts.getMinutes()) + pad(ts.getSeconds()) + '.wav';
  window.narrative.fileSaveBinary('音频/' + name, item.base64).then(function(res) {
    if (res && res.ok) {
      toast('已导出：保存/音频/' + name);
      // 标记已导出
      var list = pypyGetHistory();
      if (list[index]) { list[index].exported = true; pypySaveHistory(list); }
      pypyRenderHistory();
    } else {
      toast('导出失败');
    }
  });
}

function pypyFormatTime(iso) {
  try {
    var d = new Date(iso);
    var pad = function(n) { return String(n).padStart(2, '0'); };
    return pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  } catch(e) { return ''; }
}

// ===== 渲染历史列表 =====
function pypyRenderHistory() {
  var el = document.getElementById('pypy-history-list');
  if (!el) return;
  var list = pypyGetHistory();
  if (!list.length) {
    el.innerHTML = '<div style="font-size:12px;color:var(--fg3)">暂无合成记录——在「语音合成」页生成后会出现在这里</div>';
    return;
  }
  var h = '';
  list.forEach(function(item, i) {
    h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:8px;margin-bottom:6px">';
    h += '<div style="display:flex;align-items:center;gap:8px">';
    h += '<span style="font-size:11px;color:var(--fg3);white-space:nowrap">' + pypyFormatTime(item.time) + '</span>';
    h += '<span style="font-size:12px;color:var(--fg2);white-space:nowrap;flex-shrink:0">' + escHtml(item.voice || '') + '</span>';
    h += '<div style="flex:1;font-size:12px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(item.text || '') + '</div>';
    h += '<span style="font-size:11px;color:var(--fg3);white-space:nowrap">' + ((item.size || 0) / 1024).toFixed(0) + 'KB</span>';
    h += '<button class="btn-out" style="padding:2px 8px;font-size:11px" onclick="pypyPlayHistory(getPypyHistoryItem(' + i + '))">▶ 播放</button>';
    h += '<button class="btn-out" style="padding:2px 8px;font-size:11px"' + (item.exported ? ' disabled' : '') + ' onclick="pypyExportHistory(getPypyHistoryItem(' + i + '),' + i + ')">' + (item.exported ? '✓已导出' : '💾导出') + '</button>';
    h += '<button class="btn-out" style="padding:2px 8px;font-size:11px;color:#e06c75" onclick="pypyRemoveHistory(' + i + ')">🗑</button>';
    h += '</div>';
    h += '</div>';
  });
  el.innerHTML = h;
}

function getPypyHistoryItem(index) {
  var list = pypyGetHistory();
  return list[index] || null;
}

// ===== 渲染历史页 =====
function pypyRenderHistoryPage(el) {
  if (!el) return;
  var h = '';
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:10px">';
  h += '<div style="display:flex;align-items:center;margin-bottom:8px">';
  h += '<div style="font-size:13px;color:var(--fg);font-weight:bold;flex:1">已生成列表</div>';
  h += '<button class="btn-out" style="padding:3px 10px;font-size:12px" onclick="pypyClearHistory()">清空记录</button>';
  h += '</div>';
  h += '<div id="pypy-history-list"></div>';
  h += '</div>';
  el.innerHTML = h;
  pypyRenderHistory();
}

function pypyClearHistory() {
  if (!confirm('确定清空所有合成记录？')) return;
  pypySaveHistory([]);
  pypyRenderHistory();
}

window.pypyRenderHistoryPage = pypyRenderHistoryPage;
window.pypyRenderHistory = pypyRenderHistory;
window.pypyPlayHistory = pypyPlayHistory;
window.pypyExportHistory = pypyExportHistory;
window.pypyRemoveHistory = pypyRemoveHistory;
window.pypyClearHistory = pypyClearHistory;
window.getPypyHistoryItem = getPypyHistoryItem;
