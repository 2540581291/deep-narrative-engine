// 深度-叙事引擎 · 多任务进度管理器
var _taskProgress = {};
var _taskPanelEl = null;
var _taskTimer = null;

function taskStart(name, detail, model) {
  var id = uuid();
  _taskProgress[id] = { id: id, name: name || '任务', detail: detail || '', model: model || '', status: 'running', msg: name || '任务', startTime: Date.now(), streamContent: '' };
  renderTaskPanel();
  return id;
}

function taskUpdate(id, msg, detail, progress) {
  var t = _taskProgress[id]; if (!t) return;
  if (msg !== undefined) t.msg = msg;
  if (detail !== undefined) t.detail = detail;
  if (progress !== undefined) t.progress = progress;
  renderTaskPanel();
}

function taskDone(id, msg) {
  var t = _taskProgress[id]; if (!t) return;
  t.status = 'done'; if (msg) t.msg = msg; t.progress = 100;
  renderTaskPanel();
  setTimeout(function() { delete _taskProgress[id]; renderTaskPanel(); }, 2500);
}

function taskError(id, msg) {
  var t = _taskProgress[id]; if (!t) return;
  t.status = 'error'; if (msg) t.msg = msg; t.streamContent = '';
  renderTaskPanel();
  setTimeout(function() { delete _taskProgress[id]; renderTaskPanel(); }, 5000);
}

function taskUpdateStream(id, chunk) {
  var t = _taskProgress[id]; if (!t) return;
  if (!chunk) return;
  t.streamContent = (t.streamContent || '') + chunk;
  if (t.streamContent.length > 3000) t.streamContent = t.streamContent.slice(-3000);
}

// 每个任务自己持有提示词，避免并发调用互相覆盖（_lastPrompt 是全局单例）
function taskSetPrompt(id, promptObj) {
  var t = _taskProgress[id]; if (!t) return;
  t.prompt = promptObj || null;
}
function taskGetPrompt(id) {
  var t = _taskProgress[id]; if (!t) return null;
  return t.prompt || null;
}

function getRunningTasks() {
  var list = [];
  for (var id in _taskProgress) { if (_taskProgress[id].status === 'running') list.push(_taskProgress[id]); }
  return list;
}

function renderTaskPanel() {
  var tasks = [];
  for (var id in _taskProgress) tasks.push(_taskProgress[id]);

  if (tasks.length === 0) {
    if (_taskPanelEl) _taskPanelEl.style.display = 'none';
    stopTimer(); return;
  }

  var btn = document.querySelector('.nav-tab[onclick*="openUsageModal"]');
  if (btn) btn.style.border = '1px solid var(--success)';

  if (!_taskPanelEl) {
    _taskPanelEl = document.createElement('div');
    _taskPanelEl.id = 'taskProgressPanel';
    _taskPanelEl.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:10000;display:flex;flex-direction:column;gap:6px;max-width:340px;min-width:240px';
    document.body.appendChild(_taskPanelEl);
  }
  _taskPanelEl.style.display = 'flex';

  tasks.sort(function(a, b) { return a.startTime - b.startTime; });

  var html = '';
  for (var i = 0; i < tasks.length; i++) {
    var t = tasks[i];
    var isRunning = t.status === 'running';
    var isDone = t.status === 'done';
    var isError = t.status === 'error';
    var borderColor = isRunning ? 'var(--success)' : isError ? 'var(--accent)' : 'var(--border)';
    var iconColor = isDone ? 'var(--success)' : isError ? 'var(--accent)' : 'var(--accent2)';
    var icon = isDone ? '✓' : isError ? '✕' : '⏳';

    html += '<div class="tpi-card" data-task-id="' + t.id + '" style="background:var(--card-bg);border:1px solid ' + borderColor + ';border-radius:var(--radius);padding:8px 12px;font-size:0.76em;box-shadow:0 4px 16px rgba(0,0,0,0.35);display:flex;align-items:flex-start;gap:8px;transition:opacity 0.3s">';
    html += '<span style="color:' + iconColor + ';font-size:1em;line-height:1.4;flex-shrink:0">' + icon + '</span>';
    html += '<div class="flex-1">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">';
    html += '<span style="color:var(--fg);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(t.name) + '</span>';
    html += '<div class="tpi-header-right" style="display:flex;align-items:center;gap:6px;flex-shrink:0">';
    var _tp = taskGetPrompt(t.id) || {};
    var modelName = t.model || _tp.model || '';
    if (modelName) html += '<span class="tpi-model" style="font-size:0.70em;color:var(--accent2);padding:0 6px;border:1px solid var(--accent-dim);border-radius:3px;line-height:1.6">' + escHtml(modelName) + '</span>';
    if (isRunning) html += '<span class="tpi-elapsed" style="color:var(--fg2);font-size:0.72em">' + Math.round((Date.now() - t.startTime) / 1000) + 's</span>';
    html += '</div>';
    html += '</div>';

    var subLines = [];
    if (t.detail) {
      var _mdl = (_tp && _tp.model) || '';
      if (t.detail !== _mdl) subLines.push(t.detail);
    }
    if (t.msg && t.msg !== t.name) subLines.push(t.msg);
    if (subLines.length > 0) {
      html += '<div style="color:var(--fg2);font-size:0.7em;margin-top:1px;line-height:1.5">';
      for (var si = 0; si < subLines.length; si++) html += '<div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(subLines[si]) + '</div>';
      html += '</div>';
    }

    if (isRunning) {
      var hasRealProgress = t.progress !== undefined && t.progress >= 0;
      var pct = hasRealProgress ? Math.min(100, Math.max(0, t.progress)) : 0;
      html += '<div style="margin-top:5px;height:3px;background:var(--border);border-radius:2px;overflow:hidden;position:relative">';
      if (hasRealProgress) html += '<div style="height:100%;width:' + pct + '%;border-radius:2px;background:' + iconColor + ';transition:width 0.3s ease;position:absolute;top:0;left:0"></div>';
      else html += '<div style="height:100%;width:60%;border-radius:2px;background:linear-gradient(90deg,transparent,' + iconColor + ',transparent);animation:taskProgressBar 1s infinite linear;position:absolute;top:0;left:-20%"></div>';
      html += '</div>';
      if (hasRealProgress) html += '<div style="margin-top:1px;color:var(--fg2);font-size:0.66em;text-align:right">' + pct + '%</div>';
      html += '<div style="margin-top:3px;display:flex;gap:8px;flex-wrap:wrap"><span style="font-size:0.7em;color:var(--accent2);cursor:pointer" onclick="viewTaskPrompt(\'' + escHtml(t.id) + '\')">📋 提示词</span>';
      html += '<span style="font-size:0.7em;color:var(--error);cursor:pointer;font-weight:500" onclick="taskAbort(\'' + escHtml(t.id) + '\')">⏹ 终止</span></div>';
    }

    if (!isRunning) html += '<div style="margin-top:2px;color:' + (isDone ? 'var(--success)' : 'var(--accent)') + ';font-size:0.7em">' + escHtml(t.msg) + '</div>';
    html += '</div>';
    if (!isRunning) html += '<span style="color:var(--fg2);font-size:0.72em;cursor:pointer;flex-shrink:0;line-height:1.4" onclick="taskDismiss(\'' + escHtml(t.id) + '\')">✕</span>';
    html += '</div>';
  }
  _taskPanelEl.innerHTML = html;
  startTimer();
}

function startTimer() {
  if (_taskTimer) return;
  _taskTimer = setInterval(function() {
    if (!_taskPanelEl || _taskPanelEl.style.display === 'none') { stopTimer(); return; }
    var hasRunning = false;
    var cards = _taskPanelEl.querySelectorAll('.tpi-card');
    for (var ci = 0; ci < cards.length; ci++) {
      var card = cards[ci];
      var id = card.getAttribute('data-task-id');
      var t = _taskProgress[id];
      if (!t || t.status !== 'running') continue;
      hasRunning = true;
      var el = card.querySelector('.tpi-elapsed');
      if (el) el.textContent = Math.round((Date.now() - t.startTime) / 1000) + 's';
      var _p = taskGetPrompt(id);
      var modelName = (_p && _p.model) || '';
      if (modelName && !card.querySelector('.tpi-model')) {
        var hr = card.querySelector('.tpi-header-right');
        if (hr) {
          var badge = document.createElement('span');
          badge.className = 'tpi-model';
          badge.style.cssText = 'font-size:10px;color:var(--accent2);padding:0 6px;border:1px solid var(--accent-dim);border-radius:3px;line-height:1.6';
          badge.textContent = modelName;
          hr.insertBefore(badge, hr.firstChild);
        }
      }
    }
    if (!hasRunning) stopTimer();
  }, 1000);
}

function stopTimer() { if (_taskTimer) { clearInterval(_taskTimer); _taskTimer = null; } }

function taskDismiss(id) { delete _taskProgress[id]; renderTaskPanel(); }

function taskAbort(id) {
  var t = _taskProgress[id]; if (!t) return;
  if (window._currentAbortController) {
    window._currentAbortController.abort();
    window._currentAbortController = null;
  }
  t.status = 'error'; t.msg = '已终止';
  renderTaskPanel();
  setTimeout(function() { delete _taskProgress[id]; renderTaskPanel(); }, 2000);
  toast('已终止 AI 调用');
}

function _renderPromptModal(p) {
  if (!p || (!p.system && !p.prompt)) { toast('暂无提示词记录'); return; }
  var html = '<div class="mcard" style="max-width:700px;max-height:80vh;overflow-y:auto">';
  html += '<h3 class="fs-14 mb-8">📋 本次 LLM 提示词' + (p.model ? ' <span style="font-size:10px;padding:2px 8px;border-radius:3px;background:var(--accent-dim);color:var(--accent2);font-weight:400">' + escHtml(p.model) + '</span>' : '') + '</h3>';
  if (p.system) html += '<div class="text-sm text-muted mb-4">System</div><pre style="background:var(--bg);padding:8px;border-radius:4px;font-size:11px;line-height:1.5;white-space:pre-wrap;word-break:break-word;max-height:300px;overflow-y:auto">' + escHtml(p.system) + '</pre>';
  html += '<div class="text-sm text-muted mb-4 mt-8">User</div><pre style="background:var(--bg);padding:8px;border-radius:4px;font-size:11px;line-height:1.5;white-space:pre-wrap;word-break:break-word;max-height:300px;overflow-y:auto">' + escHtml(p.prompt) + '</pre>';
  html += '<div style="text-align:right;margin-top:8px"><button class="btn-sm" onclick="this.closest(\'.ovl\').remove()">关闭</button></div></div>';
  var ov = document.createElement('div'); ov.className = 'ovl'; ov.innerHTML = html;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
}

function viewLastPrompt() {
  _renderPromptModal(window._lastPrompt);
}

// 按任务 id 查看该任务自己的提示词（并发时不会被其他调用的提示词覆盖）
function viewTaskPrompt(id) {
  _renderPromptModal(taskGetPrompt(id) || window._lastPrompt);
}

(function injectTaskStyles() {
  var style = document.createElement('style');
  style.textContent = '@keyframes taskProgressBar { 0% { left: -30%; } 100% { left: 110%; } }';
  document.head.appendChild(style);
})();

window.taskStart = taskStart;
window.taskUpdate = taskUpdate;
window.taskDone = taskDone;
window.taskError = taskError;
window.taskUpdateStream = taskUpdateStream;
window.taskSetPrompt = taskSetPrompt;
window.taskGetPrompt = taskGetPrompt;
window.taskDismiss = taskDismiss;
window.taskAbort = taskAbort;
window.viewLastPrompt = viewLastPrompt;
window.viewTaskPrompt = viewTaskPrompt;
window.getRunningTasks = getRunningTasks;
