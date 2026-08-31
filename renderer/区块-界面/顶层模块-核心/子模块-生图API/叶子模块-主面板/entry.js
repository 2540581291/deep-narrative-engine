// 深度-叙事引擎 · RunningHub 生图 API 配置

function renderAiGenConfig(el) {
  _rhConfigEl = el;
  var apiKey = RH.getApiKey();
  var defaultT2i = S.settings.runninghubDefaultT2i || 'seedream-v4';
  var defaultI2i = S.settings.runninghubDefaultI2i || 'seedream-v4';

  var html = '<p class="settings-card-desc">RunningHub 生图 API 配置。支持文生图（text-to-image）和图生图（image-to-image）两种模式。</p>';

  // API Key
  html += '<div class="settings-card">';
  html += '<div class="settings-card-title">🔑 API Key</div>';
  html += '<div class="settings-card-desc">可在 <a href="https://www.runninghub.cn" target="_blank" style="color:var(--accent)">runninghub.cn</a> 获取。密钥仅保存在本地。</div>';
  html += '<input id="rhApiKey" type="password" value="' + escHtml(apiKey) + '" class="llm-input" style="width:100%;font-family:monospace" placeholder="输入你的 RunningHub API Key" ondblclick="this.type=\'text\'" onblur="this.type=\'password\'" />';
  html += '<button class="btn-new mt-8" style="margin-top:12px" onclick="saveRhApiKey()">💾 保存 API Key</button>';
  html += '</div>';

  // 默认模型
  html += '<div class="settings-card">';
  html += '<div class="settings-card-title">🤖 默认模型</div>';
  html += '<div class="settings-row">' + label('默认文生图模型');
  html += '<select id="rhDefaultT2i" class="llm-input llm-select" style="width:100%;max-width:400px">';
  var t2iModels = RH.allT2iModels();
  t2iModels.forEach(function(m) {
    html += '<option value="' + m.id + '"' + (m.id === defaultT2i ? ' selected' : '') + '>' + escHtml(m.provider) + ' — ' + escHtml(m.name) + '</option>';
  });
  html += '</select></div>';
  html += '<div class="settings-row">' + label('默认图生图模型');
  html += '<select id="rhDefaultI2i" class="llm-input llm-select" style="width:100%;max-width:400px">';
  var i2iModels = RH.allI2iModels();
  i2iModels.forEach(function(m) {
    html += '<option value="' + m.id + '"' + (m.id === defaultI2i ? ' selected' : '') + '>' + escHtml(m.provider) + ' — ' + escHtml(m.name) + '</option>';
  });
  html += '</select></div>';
  html += '<button class="btn-new" onclick="saveRhDefaultModels()">💾 保存默认模型</button>';
  html += '</div>';

  // 可用模型参考（静态 + 动态获取）
  var t2iModels = RH.allT2iModels();
  var i2iModels = RH.allI2iModels();
  var dynCount = RH.dynamicT2i.length + RH.dynamicI2i.length;
  html += '<div class="settings-card">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">';
  html += '<div class="settings-card-title">📋 可用模型参考' + (dynCount ? ' <span style="color:var(--accent);font-weight:400;font-size:11px">(+' + dynCount + ' 动态获取)</span>' : '') + '</div>';
  html += '<button class="btn-new" onclick="fetchRhModels()">🔄 获取可用模型</button>';
  html += '</div>';
  html += '<div id="rhFetchStatus" style="font-size:0.75em;color:var(--fg2);margin:8px 0 0"></div>';
  html += '<details><summary style="cursor:pointer;color:var(--accent);font-size:0.82em">文生图模型 (' + t2iModels.length + ' 个)</summary>';
  html += '<table style="width:100%;border-collapse:collapse;font-size:0.78em;margin-top:6px">';
  html += '<tr class="b-border-bottom"><th class="text-left p-4-6" style="padding:4px 6px">名称</th><th class="text-left p-4-6">厂商</th><th class="text-right p-4-6">最大尺寸</th></tr>';
  t2iModels.forEach(function(m) {
    var limit = RH.getModelLimits(m.id);
    html += '<tr class="b-border-bottom"><td class="p-4-6">' + escHtml(m.name) + '</td><td class="p-4-6 c-fg2">' + escHtml(m.provider) + '</td><td class="p-4-6 c-fg2 text-right">' + limit.maxW + '×' + limit.maxH + '</td></tr>';
  });
  html += '</table></details>';
  html += '<details class="mt-8"><summary style="cursor:pointer;color:var(--accent);font-size:0.82em">图生图模型 (' + i2iModels.length + ' 个)</summary>';
  html += '<table style="width:100%;border-collapse:collapse;font-size:0.78em;margin-top:6px">';
  html += '<tr class="b-border-bottom"><th class="text-left p-4-6">名称</th><th class="text-left p-4-6">厂商</th></tr>';
  i2iModels.forEach(function(m) {
    html += '<tr class="b-border-bottom"><td class="p-4-6">' + escHtml(m.name) + '</td><td class="p-4-6 c-fg2">' + escHtml(m.provider) + '</td></tr>';
  });
  html += '</table></details>';
  html += '</div>';

  el.innerHTML = html;
}

// ===== 获取可用模型（官方文档站 llms.txt + 模型 .md） =====
var _rhFetching = false;
var _rhConfigEl = null;
function fetchRhModels() {
  if (_rhFetching) return;
  // 每次重新查找元素，重渲染后旧引用会失效
  var setStatus = function(s) {
    var el = document.getElementById('rhFetchStatus');
    if (el) el.textContent = s;
  };
  var apiKey = RH.getApiKey();
  if (!apiKey) { setStatus('⚠️ 请先在上方配置 API Key'); return; }
  if (!window.narrative || !window.narrative.rhFetchDoc) { setStatus('⚠️ 主进程代理不可用'); return; }
  _rhFetching = true;
  setStatus('⏳ 正在抓取官方模型文档…');
  RH.fetchModels(function(done, total, title) {
    setStatus('⏳ 抓取中 ' + done + '/' + total + ' … ' + title);
  }).then(function(res) {
    RH.dynamicT2i = RH.mergeDynamic(RH.dynamicT2i, res.t2i);
    RH.dynamicI2i = RH.mergeDynamic(RH.dynamicI2i, res.i2i);
    // 合并完成后自动持久化，重启应用直接恢复，无需再次抓取
    RH.persistDynamic();
    _rhFetching = false;
    if (_rhConfigEl) renderAiGenConfig(_rhConfigEl);
    setStatus('✅ 已获取 ' + (res.t2i.length + res.i2i.length) + ' 个生图模型（动态 ' + dynCount() + ' 个）');
    toast('已获取可用模型');
  }).catch(function(err) {
    _rhFetching = false;
    setStatus('❌ 获取失败: ' + (err && err.message ? err.message : err));
  });
}
function dynCount() { return RH.dynamicT2i.length + RH.dynamicI2i.length; }

function saveRhApiKey() {
  var key = document.getElementById('rhApiKey').value.trim();
  S.settings.runninghubApiKey = key;
  保存设置(S.settings);
  toast('API Key 已' + (key ? '保存' : '清空'));
}

function saveRhDefaultModels() {
  var t2i = document.getElementById('rhDefaultT2i').value;
  var i2i = document.getElementById('rhDefaultI2i').value;
  S.settings.runninghubDefaultT2i = t2i;
  S.settings.runninghubDefaultI2i = i2i;
  保存设置(S.settings);
  toast('默认模型已保存');
}

// 暴露到全局
window.renderAiGenConfig = renderAiGenConfig;
window.saveRhApiKey = saveRhApiKey;
window.saveRhDefaultModels = saveRhDefaultModels;
window.fetchRhModels = fetchRhModels;
