// 生图识图 · 通用工具函数

// ===== 通用渲染辅助 =====
function renderQuickSizes(state, prefix) {
  var groups = [
    { key: 'landscape', label: '风景' },
    { key: 'portrait', label: '人物' }
  ];
  var h = '';
  groups.forEach(function(g) {
    h += '<div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;margin-bottom:4px">';
    h += '<span style="color:var(--fg3);font-size:0.75em;margin-right:6px;width:30px">' + g.label + '</span>';
    RH.SIZE_PRESETS.forEach(function(s) {
      if (s.group !== g.key) return;
      var active = (s.w === state.width && s.h === state.height);
      var style = 'font-size:0.72em;padding:1px 8px';
      if (active) style += ';background:var(--accent);color:#fff;border-color:var(--accent)';
      h += '<button id="' + prefix + 'Size_' + s.w + 'x' + s.h + '" class="btn-out" style="' + style + '" onclick="onQuickSize(\'' + prefix + '\',' + s.w + ',' + s.h + ')">' + escHtml(s.label) + '</button>';
    });
    h += '</div>';
  });
  return h;
}

function renderSizeAndNegative(state, prefix) {
  var h = '<div style="display:flex;gap:10px;margin-bottom:8px;flex-wrap:wrap">';
  h += '<div style="flex:1;min-width:210px">';
  h += '<label style="font-size:0.8em;color:var(--fg2);display:block;margin-bottom:3px">尺寸</label>';
  h += renderQuickSizes(state, prefix);
  h += '<div style="display:flex;gap:4px;align-items:center">';
  h += '<span style="color:var(--fg3);font-size:0.75em;margin-right:6px;width:30px">自定义</span>';
  h += '<input id="' + prefix + 'Width" type="number" class="llm-input" style="width:70px;font-size:0.78em;padding:2px 4px" value="' + state.width + '" min="256" max="4096" step="64" placeholder="宽" />';
  h += '<span style="color:var(--fg2);font-size:0.78em">×</span>';
  h += '<input id="' + prefix + 'Height" type="number" class="llm-input" style="width:70px;font-size:0.78em;padding:2px 4px" value="' + state.height + '" min="256" max="4096" step="64" placeholder="高" />';
  h += '</div></div>';
  h += '<div style="flex:1;min-width:140px">';
  h += '<label style="font-size:0.8em;color:var(--fg2);display:block;margin-bottom:3px">负面提示词（可选）</label>';
  h += '<input id="' + prefix + 'Negative" type="text" class="llm-input" style="width:100%;font-size:0.82em" placeholder="不想出现的内容..." value="' + escHtml(state.negativePrompt) + '" />';
  h += '</div></div>';
  return h;
}

function renderGenButtons(state, prefix, genFn, cancelFn) {
  var h = '<div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;padding:8px 0;border-top:1px solid var(--border)">';
  h += '<button id="' + prefix + 'GenBtn" class="btn-main" style="font-size:0.85em" onclick="' + genFn + '()">✨ 生成图片</button>';
  h += '<button id="' + prefix + 'CancelBtn" class="btn-out" style="font-size:0.78em;color:var(--accent);display:none" onclick="' + cancelFn + '()">取消</button>';
  h += '<span id="' + prefix + 'Status" style="font-size:0.78em;color:var(--fg2)">' + escHtml(state.statusText) + '</span>';
  h += '</div>';
  return h;
}

function renderResultsArea(state, prefix, clearFn) {
  var results = state.results || [];
  var h = '<div style="border-top:1px solid var(--border);padding-top:10px">';
  h += '<div style="font-size:0.82em;color:var(--fg2);margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">';
  h += '<span>生成结果</span>';
  if (results.length) {
    h += '<button class="btn-out" style="font-size:0.72em;padding:1px 8px" onclick="' + clearFn + '()">清空结果</button>';
  }
  h += '</div>';
  h += '<div id="' + prefix + 'Results" style="display:flex;gap:8px;flex-wrap:wrap;min-height:60px">';
  if (results.length === 0) {
    h += '<div style="color:var(--fg3);font-size:0.78em;padding:12px 0">暂无生成结果，填写提示词后点击生成</div>';
  } else {
    results.forEach(function(r, i) {
      var url = typeof r === 'string' ? r : r.url;
      h += '<div style="position:relative;display:inline-block">';
      h += '<img src="' + url + '" style="max-width:240px;max-height:240px;border-radius:6px;border:1px solid var(--border);cursor:pointer" onclick="openImageResult(' + i + ',\'' + prefix + '\')" />';
      h += '<button class="btn-out" style="position:absolute;top:4px;right:4px;font-size:0.7em;padding:1px 6px;background:rgba(0,0,0,0.6);border-color:transparent" onclick="RH.saveImage(\'' + url + '\',\'生成图片_' + (i + 1) + '.png\')">⬇</button>';
      h += '</div>';
    });
  }
  h += '</div></div>';
  return h;
}

// ===== 通用事件绑定 =====
function bindInput(id, setter) {
  var el = document.getElementById(id);
  if (el) el.addEventListener('input', function() { setter(this.value); });
}

function bindModelSelect(id, setter) {
  var el = document.getElementById(id);
  if (el) el.addEventListener('change', function() { setter(this.value); });
}

function bindSizeInputs(state, prefix) {
  var wEl = document.getElementById(prefix + 'Width');
  var hEl = document.getElementById(prefix + 'Height');
  if (wEl) wEl.addEventListener('change', function() { state.width = parseInt(this.value) || 1024; refreshSizeHighlight(state, prefix); });
  if (hEl) hEl.addEventListener('change', function() { state.height = parseInt(this.value) || 1024; refreshSizeHighlight(state, prefix); });
}

function bindImageUrl(state, prefix) {
  var urlEl = document.getElementById(prefix + 'ImageUrl');
  if (urlEl) urlEl.addEventListener('input', function() { state.imageUrl = this.value; });
}

function bindFileUpload(state, prefix, el) {
  var fileEl = document.getElementById(prefix + 'FileInput');
  if (!fileEl) return;
  fileEl.addEventListener('change', function(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      state.imageUrl = ev.target.result;
      var urlEl = document.getElementById(prefix + 'ImageUrl');
      if (urlEl) urlEl.value = ev.target.result;
      // 重新渲染以显示预览
      if (prefix === 'i2i') renderI2I(el);
    };
    reader.readAsDataURL(file);
  });
}

// ===== 尺寸快捷按钮 =====
function refreshSizeHighlight(state, prefix) {
  RH.SIZE_PRESETS.forEach(function(s) {
    var btn = document.getElementById(prefix + 'Size_' + s.w + 'x' + s.h);
    if (!btn) return;
    var active = (s.w === state.width && s.h === state.height);
    btn.style.background = active ? 'var(--accent)' : '';
    btn.style.color = active ? '#fff' : '';
    btn.style.borderColor = active ? 'var(--accent)' : '';
  });
}

function onQuickSize(prefix, w, h) {
  var state = prefix === 't2i' ? T2I : I2I;
  state.width = w;
  state.height = h;
  var wEl = document.getElementById(prefix + 'Width');
  var hEl = document.getElementById(prefix + 'Height');
  if (wEl) wEl.value = w;
  if (hEl) hEl.value = h;
  refreshSizeHighlight(state, prefix);
}
window.onQuickSize = onQuickSize;

// ===== 图片预览 =====
function openImagePreview(url) {
  var box = document.getElementById('modalBox');
  var ovl = document.getElementById('modalOverlay');
  if (!box || !ovl) return;
  box.innerHTML = '<div style="position:relative;max-width:90vw;max-height:90vh;display:flex;flex-direction:column;align-items:center">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;width:100%;margin-bottom:8px">'
    + '<span style="color:var(--fg2);font-size:13px">图片预览</span>'
    + '<button class="btn-out" style="font-size:11px;padding:2px 10px" onclick="document.getElementById(\'modalOverlay\').style.display=\'none\'">✕ 关闭</button>'
    + '</div>'
    + '<img src="' + url + '" style="max-width:100%;max-height:75vh;border-radius:6px;border:1px solid var(--border);object-fit:contain" onerror="this.outerHTML=\'<div style=color:red;padding:20px>图片加载失败</div>\'" />'
    + '<div style="margin-top:8px;font-size:11px;color:var(--fg3);word-break:break-all;max-width:100%"><a href="' + url + '" target="_blank" style="color:var(--accent)">' + url + '</a></div>'
    + '</div>';
  ovl.style.display = 'flex';
}

// ===== 通用生成流程 =====
function openImageResult(idx, prefix) {
  var state = prefix === 't2i' ? T2I : I2I;
  var item = state.results && state.results[idx];
  if (!item) return;
  var localPath = typeof item === 'object' ? item.localPath : null;
  var url = typeof item === 'string' ? item : item.url;
  if (localPath && window.narrative && window.narrative.fileOpenPath) {
    window.narrative.fileOpenPath(localPath);
  } else {
    openImagePreview(url);
  }
}

function ensureHttps(url) {
  if (typeof url !== 'string') return url;
  return url.replace(/^http:\/\//i, 'https://');
}

function autoSaveImage(imgUrl, idx, state, prefix) {
  if (!window.narrative || !window.narrative.downloadAndSaveImage) return;
  var subDir = prefix === 't2i' ? '文生图' : '图生图';
  var filename = Date.now() + '_' + idx + '.png';
  var relPath = '生图识图/' + subDir + '/' + filename;
  window.narrative.downloadAndSaveImage(imgUrl, relPath).then(function(res) {
    if (res && res.ok && res.fullPath) {
      var item = state.results[idx];
      if (item && typeof item === 'object') {
        item.localPath = res.fullPath;
        saveResults();
      }
    }
  }).catch(function(e) {
    console.warn('[aids] 自动保存图片失败:', e);
  });
}

function saveResults() {
  if (!Store.aids) return;
  // 异步持久化到磁盘，不阻塞 UI
  Store.aids.save('_生成缓存', {
    t2i: T2I.results.slice(),
    i2i: I2I.results.slice()
  }).catch(function(e) {
    console.warn('[aids] 保存生成缓存失败:', e);
  });
}

// 从磁盘恢复历史生成结果
var _resultsLoaded = false;
function loadStoredResults() {
  if (_resultsLoaded || !Store.aids) return;
  _resultsLoaded = true;
  Store.aids.get('_生成缓存').then(function(data) {
    if (!data) return;
    // 兼容旧数据：旧格式是纯字符串数组，新格式是 {url, localPath} 对象数组
    if (data.t2i && data.t2i.length) {
      T2I.results = data.t2i.map(function(r) { return typeof r === 'string' ? { url: r, localPath: null } : r; });
    }
    if (data.i2i && data.i2i.length) {
      I2I.results = data.i2i.map(function(r) { return typeof r === 'string' ? { url: r, localPath: null } : r; });
    }
    // 重绘当前 tab 的结果区
    var prefix = 当前辅助视图;
    var state = prefix === 't2i' ? T2I : (prefix === 'i2i' ? I2I : null);
    if (state && state.results.length) renderResultsDom(state, prefix);
  }).catch(function(e) {
    console.warn('[aids] 读取生成缓存失败:', e);
  });
}

function updateGenStatus(state, prefix) {
  var statusEl = document.getElementById(prefix + 'Status');
  var genBtn = document.getElementById(prefix + 'GenBtn');
  var cancelBtn = document.getElementById(prefix + 'CancelBtn');
  if (statusEl) statusEl.textContent = state.statusText;
  if (genBtn) genBtn.disabled = (state.status === 'submitting' || state.status === 'waiting');
  if (cancelBtn) cancelBtn.style.display = state.status === 'waiting' ? 'inline-block' : 'none';
}

function handleSubmitResult(state, res, prefix) {
  // 检查 API 返回的业务错误
  if (res.errorCode || res.errorMessage) {
    state.status = 'error';
    state.statusText = '提交失败';
    updateGenStatus(state, prefix);
    toast('提交失败: ' + (res.errorMessage || '错误码: ' + res.errorCode));
    return;
  }
  // 兼容多种返回格式: taskId / data.taskId / id
  var taskId = res.taskId || (res.data && res.data.taskId) || res.id || (res.data && res.data.id);
  if (!taskId) {
    state.status = 'error';
    state.statusText = '提交失败：未获取到 taskId';
    updateGenStatus(state, prefix);
    toast('提交失败：' + JSON.stringify(res));
    return;
  }
  state.taskId = taskId;
  state.status = 'waiting';
  state.statusText = '正在生成...';
  updateGenStatus(state, prefix);

  var startTime = Date.now();
  var pollTimer = setInterval(function() {
    RH.queryTask(state.taskId).then(function(qr) {
      if (qr.status === 'SUCCESS') {
        clearInterval(pollTimer);
        state.status = 'done';
        state.statusText = '生成完成！';
        // 兼容多种结果格式: results / data / output
        var results = qr.results || qr.data || qr.output || [];
        if (typeof results === 'string') results = [results];
        for (var i = 0; i < results.length; i++) {
          var url = results[i].url || results[i].image_url || results[i].img || (typeof results[i] === 'string' ? results[i] : null);
          if (url) {
            url = ensureHttps(url);
            state.results.push({ url: url, localPath: null });
            // 自动保存到本地（异步，成功后填充 localPath）
            autoSaveImage(url, state.results.length - 1, state, prefix);
          }
        }
        saveResults();
        updateGenStatus(state, prefix);
        renderResultsDom(state, prefix);
        toast('图片生成完成');
      } else if (qr.status === 'FAILED' || qr.errorCode) {
        clearInterval(pollTimer);
        state.status = 'error';
        state.statusText = '生成失败';
        updateGenStatus(state, prefix);
        toast('生成失败: ' + (qr.errorMessage || '未知错误'));
      } else {
        var elapsed = Math.floor((Date.now() - startTime) / 1000);
        state.statusText = '生成中... (' + elapsed + 's)';
        updateGenStatus(state, prefix);
      }
    }).catch(function(err) {
      clearInterval(pollTimer);
      state.status = 'error';
      state.statusText = '查询失败';
      updateGenStatus(state, prefix);
      toast('查询失败: ' + err.message);
    });
  }, 2000);
}

function handleSubmitError(state, err, prefix) {
  state.status = 'error';
  state.statusText = '提交失败';
  updateGenStatus(state, prefix);
  toast('提交失败: ' + err.message);
}

function cancelGen(state, prefix) {
  state.status = 'idle';
  state.statusText = '已取消';
  state.taskId = null;
  updateGenStatus(state, prefix);
}

function clearResults(state, prefix) {
  state.results = [];
  saveResults();
  renderResultsDom(state, prefix);
}

function renderResultsDom(state, prefix) {
  var el = document.getElementById(prefix + 'Results');
  if (!el) return;
  if (state.results.length === 0) {
    el.innerHTML = '<div style="color:var(--fg3);font-size:0.78em;padding:12px 0">暂无生成结果，填写提示词后点击生成</div>';
    return;
  }
  var h = '';
  state.results.forEach(function(r, i) {
    var url = typeof r === 'string' ? r : r.url;
    h += '<div style="position:relative;display:inline-block">';
    h += '<img src="' + url + '" style="max-width:240px;max-height:240px;border-radius:6px;border:1px solid var(--border);cursor:pointer" onclick="openImageResult(' + i + ',\'' + prefix + '\')" />';
    h += '<button class="btn-out" style="position:absolute;top:4px;right:4px;font-size:0.7em;padding:1px 6px;background:rgba(0,0,0,0.6);border-color:transparent" onclick="RH.saveImage(\'' + url + '\',\'生成图片_' + (i + 1) + '.png\')">⬇</button>';
    h += '</div>';
  });
  el.innerHTML = h;
}
