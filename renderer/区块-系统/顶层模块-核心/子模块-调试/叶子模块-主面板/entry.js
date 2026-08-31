// 调试日志系统 — 写入文件 + 提示词调用记录
var _debugLogBuffer = [];

// 浮动面板拖拽
window._initDebugDrag = function(e) {
  if (e.target.tagName === 'BUTTON') return;
  var el = document.getElementById('debugConsole');
  var s = {
    ox: e.clientX, oy: e.clientY,
    ot: parseInt(el.style.top) || 0,
    ol: parseInt(el.style.left) || 0
  };
  el.classList.add('dragging');
  function m(ev) {
    var dx = ev.clientX - s.ox, dy = ev.clientY - s.oy;
    el.style.top = (s.ot + dy) + 'px';
    el.style.left = (s.ol + dx) + 'px';
    el.style.bottom = 'auto';
    el.style.right = 'auto';
  }
  function u() {
    el.classList.remove('dragging');
    document.removeEventListener('mousemove', m);
    document.removeEventListener('mouseup', u);
  }
  document.addEventListener('mousemove', m);
  document.addEventListener('mouseup', u);
  e.preventDefault();
};

function debugLog(module, action, detail) {
  var time = new Date();
  var ts = time.getHours().toString().padStart(2,'0') + ':' + time.getMinutes().toString().padStart(2,'0') + ':' + time.getSeconds().toString().padStart(2,'0');
  _debugLogBuffer.push({ ts: ts, module: module, action: action, detail: detail || '' });
  if (_debugLogBuffer.length > 500) _debugLogBuffer.shift();

  // 写入文件日志
  try {
    if (window.narrative && window.narrative.writeLog) {
      window.narrative.writeLog({ module: module, action: action, detail: detail ? String(detail).slice(0, 200) : '' });
    }
  } catch(e) {}

  // 渲染到浮动面板
  var panel = document.getElementById('debugConsoleLog');
  if (!panel) return;
  var consoleEl = document.getElementById('debugConsole');
  if (!consoleEl || consoleEl.style.display === 'none') return;

  var entry = document.createElement('div');
  entry.className = 'debug-entry';

  var color = '#888';
  if (module === 'router') color = '#e94560';
  else if (module === 'view') color = '#ff6b8a';
  else if (module === 'llm') color = '#6bc';
  else if (module === 'store') color = '#8b5';
  else if (module === 'fap') color = '#d95';
  else if (module === 'novel') color = '#7cf';
  else if (module === 'vignette') color = '#c8f';
  else if (module === 'system') color = '#aaa';

  var html = '<span class="debug-entry-time">' + ts + '</span> '
    + '<span class="debug-entry-module" style="color:' + color + '">[' + escHtml(module) + ']</span> '
    + '<span class="debug-entry-action">' + escHtml(action) + '</span>';
  if (detail) {
    var d = detail.toString().length > 80 ? detail.toString().slice(0,80) + '…' : detail.toString();
    html += ' <span class="debug-entry-detail">' + escHtml(d) + '</span>';
  }
  entry.innerHTML = html;
  panel.appendChild(entry);
  panel.scrollTop = panel.scrollHeight;
}

// 提示词查看器
var _debugPromptCount = 0;
var debugPromptLog = [];
var _debugPromptLogId = 0;

window.capturePromptLog = function(messages, done) {
  var id = ++_debugPromptLogId;
  debugPromptLog.push({
    id: id,
    time: fmtDate(new Date()),
    messages: JSON.parse(JSON.stringify(messages)),
  });
  if (debugPromptLog.length > 50) debugPromptLog.shift();
  if (done) done(id);
};
window.fillPromptResponse = function(id, response) {
  for (var i = debugPromptLog.length - 1; i >= 0; i--) {
    if (debugPromptLog[i].id === id) {
      debugPromptLog[i].response = response;
      var entryEl = document.getElementById("promptEntry_" + id);
      if (entryEl) {
        var respEl = entryEl.querySelector(".debug-response");
        if (!respEl) {
          respEl = document.createElement("div");
          respEl.className = "debug-response";
          respEl.innerHTML = '<span class="debug-response-label">Response:</span><pre class="debug-pre"></pre>';
          entryEl.appendChild(respEl);
        }
        var pre = respEl.querySelector("pre");
        if (pre) pre.textContent = response;
      }
      return;
    }
  }
};

function debugLogPrompt(system, prompt, label, model) {
  _debugPromptCount++;
  // 写入文件日志
  var detail = label + (system ? ' | sys:' + system.slice(0, 60) : '') + ' | prompt:' + (prompt ? prompt.slice(0, 120) : '');
  debugLog('llm', 'prompt', detail);

  // 渲染到浮动面板
  var panel = document.getElementById('debugConsolePrompts');
  if (!panel) return;
  var consoleEl = document.getElementById('debugConsole');
  if (!consoleEl || consoleEl.style.display === 'none') return;

  var entry = document.createElement('div');
  entry.className = 'debug-prompt-entry';
  entry.id = "promptEntry_" + _debugPromptCount;

  var h = '<div class="debug-prompt-label">#' + _debugPromptCount + ' ' + escHtml(label || '') + (model ? ' <span style="font-size:9px;padding:1px 6px;border-radius:3px;background:var(--accent-dim);color:var(--accent2);margin-left:6px">' + escHtml(model) + '</span>' : '') + '</div>';
  if (system) {
    h += '<div class="mb-4">'
      + '<div class="debug-prompt-section">System:</div>'
      + '<pre class="debug-pre">' + escHtml(system) + '</pre>'
      + '</div>';
  }
  h += '<div>'
    + '<div class="debug-prompt-section prompt-content">Prompt:</div>'
    + '<pre class="debug-pre">' + escHtml(prompt || '') + '</pre>'
    + '</div>';
  entry.innerHTML = h;
  panel.appendChild(entry);
  panel.scrollTop = panel.scrollHeight;

  var ph = panel.querySelector('.debug-empty-state');
  if (ph) ph.remove();
}

window.debugLogPrompt = debugLogPrompt;
window.debugLog = debugLog;
