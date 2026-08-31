// 深度-叙事引擎 · LLM 配置管理
var editingLlmId = null;

function renderLlmConfigs(el) {
  var configs = LLMService.getAll();
  var html = '<p class="settings-card-desc">管理你的 LLM API 配置。支持多个厂商和模型。</p>';
  if (editingLlmId !== null) {
    var editingConfig = null;
    if (editingLlmId === 'new') { editingConfig = { provider: 'openai', id: null, name: '', model: '', apiKey: '', baseUrl: '', defaultParams: { temperature: 0.7, max_tokens: 4096, context_window: 128000 } }; }
    else { for (var i = 0; i < configs.length; i++) { if (configs[i].id === editingLlmId) { editingConfig = deepClone(configs[i]); break; } } }
    if (editingConfig) html += buildLlmForm(editingConfig);
  }
  if (configs.length === 0 && editingLlmId === null) {
    html += '<div style="text-align:center;padding:32px;color:var(--fg2);font-size:0.82em">暂无 LLM 配置。点击下方按钮添加一个。</div>';
  } else if (editingLlmId === null) {
    html += '<div class="settings-card" style="margin-bottom:8px"><div class="settings-card-title">📦 已保存 <span style="color:var(--accent2)">' + configs.length + '</span> 个配置</div></div>';
    for (var i = 0; i < configs.length; i++) {
      var c = configs[i];
      html += '<div class="settings-card">';
      html += '<div class="flex justify-between items-center">';
      html += '<div><div class="settings-card-title">' + escHtml(c.name || '未命名') + '</div>';
      html += '<div style="font-size:11px;color:var(--fg2);margin-top:4px">' + (PROVIDER_NAMES[c.provider] || c.provider || '') + ' · ' + escHtml(c.model) + '</div></div>';
      html += '<div style="display:flex;gap:6px"><button class="btn-out" style="padding:4px 12px;font-size:11px" onclick="editLLM(\'' + c.id + '\')">✏️ 编辑</button>';
      html += '<button class="btn-out" style="padding:4px 12px;font-size:11px;color:var(--error);border-color:rgba(231,76,60,.4)" onclick="deleteLLM(\'' + c.id + '\')">🗑 删除</button></div></div>';
      if (c.apiKey) html += '<div style="font-size:11px;color:var(--fg2);margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">API Key: <span style="font-family:monospace;color:var(--fg3)">' + maskKey(c.apiKey) + '</span></div>';
      html += '</div>';
    }
  }
  if (editingLlmId === null) html += '<div style="text-align:center;margin-top:8px"><button class="btn-new" onclick="addLLM()">＋ 添加 LLM 配置</button></div>';
  el.innerHTML = html;
}

function buildLlmForm(config) {
  var isNew = editingLlmId === 'new';
  var provider = config.provider || 'openai';
  var html = '<div class="settings-card" style="border-color:var(--accent2)" id="llmForm">';
  html += '<div class="settings-card-title">' + (isNew ? '➕ 添加配置' : '✏️ 编辑配置') + '</div>';
  html += '<div class="settings-card-desc">填写下方信息，完成后保存。</div>';
  html += '<div class="settings-row">' + label('配置名称', FIELD_TIPS.name);
  html += '<input id="f_name" type="text" value="' + escHtml(config.name || '') + '" class="llm-input" style="width:100%" placeholder="例如：我的 GPT-4o" /></div>';
  html += '<div class="settings-row">' + label('厂商', FIELD_TIPS.provider);
  html += '<select id="f_provider" class="llm-input llm-select" style="width:100%" onchange="onProviderChange()">';
  for (var i = 0; i < PROVIDER_OPTIONS.length; i++) html += '<option value="' + PROVIDER_OPTIONS[i].id + '"' + (provider === PROVIDER_OPTIONS[i].id ? ' selected' : '') + '>' + PROVIDER_OPTIONS[i].name + '</option>';
  html += '</select></div>';
  var models = PROVIDER_MODELS[provider] || [];
  html += '<div class="settings-row">' + label('模型名', FIELD_TIPS.model);
  html += '<div style="display:flex;gap:6px;align-items:center;width:100%">';
  if (models.length > 0) {
    html += '<select id="f_model" class="llm-input llm-select" style="flex:1">';
    var found = false;
    for (var mi = 0; mi < models.length; mi++) { var sel = (config.model === models[mi].value) ? ' selected' : ''; if (sel) found = true; html += '<option value="' + models[mi].value + '"' + sel + '>' + models[mi].label + '</option>'; }
    if (config.model && !found) html += '<option value="' + escHtml(config.model) + '" selected>' + escHtml(config.model) + '（自定义）</option>';
    html += '</select>';
  } else { html += '<input id="f_model" type="text" class="llm-input" style="flex:1" value="' + escHtml(config.model || '') + '" placeholder="输入模型名" />'; }
  html += '<button class="btn-out" style="white-space:nowrap" onclick="fetchProviderModels()" title="从 API 获取可用模型列表">🔄 获取模型</button>';
  html += '</div></div>';
  html += '<div class="settings-row">' + label('API Key', FIELD_TIPS.apiKey);
  html += '<input id="f_apikey" type="password" class="llm-input" style="width:100%" value="' + escHtml(config.apiKey || '') + '" placeholder="sk-..." ondblclick="this.type=\'text\'" onblur="this.type=\'password\'" /></div>';
  html += '<div class="settings-row">' + label('Base URL（可选）', FIELD_TIPS.baseUrl);
  html += '<input id="f_baseurl" type="text" class="llm-input" style="width:100%" value="' + escHtml(config.baseUrl || DEFAULT_URLS[provider] || '') + '" placeholder="https://..." /></div>';
  html += '<div class="settings-group">模型参数</div>';
  html += '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px">';
  html += '<div style="flex:1;min-width:150px">' + label('Temperature', FIELD_TIPS.temperature);
  html += '<input id="f_temp" type="number" step="0.1" min="0" max="2" value="' + ((config.defaultParams && config.defaultParams.temperature) || 0.7) + '" class="llm-input" style="width:100%" /></div>';
  html += '<div style="flex:1;min-width:150px">' + label('Max Tokens', FIELD_TIPS.maxTokens);
  html += '<select id="f_maxtokens" class="llm-input llm-select" style="width:100%">';
  var currentVal = (config.defaultParams && config.defaultParams.max_tokens) || 2048;
  for (var ti = 0; ti < TOKEN_OPTIONS.length; ti++) html += '<option value="' + TOKEN_OPTIONS[ti] + '"' + (currentVal === TOKEN_OPTIONS[ti] ? ' selected' : '') + '>' + fmtToken(TOKEN_OPTIONS[ti]) + '</option>';
  html += '</select></div>';
  html += '<div style="flex:1;min-width:150px">' + label('上下文窗口', FIELD_TIPS.contextWindow);
  var contextVal = (config.defaultParams && config.defaultParams.context_window) || DEFAULT_CONTEXT_WINDOWS[provider] || 128000;
  html += '<select id="f_context" class="llm-input llm-select" style="width:100%">';
  for (var ci = 0; ci < CONTEXT_WINDOW_OPTIONS.length; ci++) html += '<option value="' + CONTEXT_WINDOW_OPTIONS[ci].value + '"' + (contextVal === CONTEXT_WINDOW_OPTIONS[ci].value ? ' selected' : '') + '>' + CONTEXT_WINDOW_OPTIONS[ci].label + '</option>';
  html += '</select></div></div>';
  html += '<div style="display:flex;gap:8px;margin-top:6px"><button class="btn-new" onclick="saveLLM()">💾 保存</button><button class="btn-out" onclick="cancelLLM()">取消</button></div></div>';
  return html;
}

function onProviderChange() {
  var provider = document.getElementById('f_provider').value;
  var modelSelect = document.getElementById('f_model');
  var urlInput = document.getElementById('f_baseurl');
  var models = PROVIDER_MODELS[provider] || [];
  if (modelSelect && models.length > 0) {
    modelSelect.innerHTML = '';
    for (var mi = 0; mi < models.length; mi++) { var opt = document.createElement('option'); opt.value = models[mi].value; opt.textContent = models[mi].label; modelSelect.appendChild(opt); }
  }
  if (urlInput && DEFAULT_URLS[provider]) urlInput.value = DEFAULT_URLS[provider];
}

function fetchProviderModels() {
  var provider = document.getElementById('f_provider').value;
  var apiKey = document.getElementById('f_apikey').value.trim();
  var baseUrl = document.getElementById('f_baseurl').value.trim();

  if (!apiKey) { toast('请先填写 API Key'); return; }
  if (!baseUrl) { toast('请先填写 Base URL'); return; }
  if (provider === 'anthropic') { toast('Anthropic 暂不支持 API 获取模型列表，请手动输入模型名'); return; }

  var url, fetchOpts;
  if (provider === 'gemini') {
    url = baseUrl + '/v1beta/models?key=' + encodeURIComponent(apiKey);
    fetchOpts = {};
  } else {
    url = baseUrl.replace(/\/+$/, '') + '/models';
    fetchOpts = { headers: { 'Authorization': 'Bearer ' + apiKey } };
  }

  toast('正在获取模型列表...');

  fetch(url, fetchOpts).then(function(res) {
    if (!res.ok) return res.json().then(function(err) { throw new Error(err.error && err.error.message ? err.error.message : 'HTTP ' + res.status); });
    return res.json();
  }).then(function(data) {
    var rawModels = provider === 'gemini' ? (data.models || []) : (data.data || []);
    var modelIds = rawModels.map(function(m) { return (m.id || m.name || '').replace(/^models\//, ''); }).filter(Boolean);

    if (!modelIds.length) { toast('API 返回的模型列表为空'); return; }

    // 合并到 PROVIDER_MODELS（去重）
    var existing = PROVIDER_MODELS[provider] || [];
    var existingValues = {};
    for (var ei = 0; ei < existing.length; ei++) existingValues[existing[ei].value] = true;
    for (var fi = 0; fi < modelIds.length; fi++) {
      if (!existingValues[modelIds[fi]]) {
        existing.push({ value: modelIds[fi], label: modelIds[fi] });
        existingValues[modelIds[fi]] = true;
      }
    }
    PROVIDER_MODELS[provider] = existing;

    // 重建下拉框
    var modelSelect = document.getElementById('f_model');
    if (modelSelect) {
      var currentVal = modelSelect.value;
      modelSelect.innerHTML = '';
      for (var mi = 0; mi < existing.length; mi++) {
        var opt = document.createElement('option');
        opt.value = existing[mi].value;
        opt.textContent = existing[mi].label;
        modelSelect.appendChild(opt);
      }
      modelSelect.value = currentVal;
    }
    toast('已获取 ' + modelIds.length + ' 个模型');
  }).catch(function(err) {
    toast('获取模型列表失败: ' + err.message);
  });
}

function addLLM() { editingLlmId = 'new'; renderLlmConfigs(document.getElementById('settingsTabContent')); var el = document.getElementById('f_name'); if (el) el.focus(); }
function editLLM(id) { editingLlmId = id; renderLlmConfigs(document.getElementById('settingsTabContent')); var el = document.getElementById('f_name'); if (el) el.focus(); }
function cancelLLM() { editingLlmId = null; renderLlmConfigs(document.getElementById('settingsTabContent')); }

function saveLLM() {
  var name = document.getElementById('f_name').value.trim();
  var provider = document.getElementById('f_provider').value;
  var modelInput = document.getElementById('f_model');
  var model = modelInput ? modelInput.value.trim() : '';
  var apiKey = document.getElementById('f_apikey').value.trim();
  var baseUrl = document.getElementById('f_baseurl').value.trim();
  var temp = parseFloat(document.getElementById('f_temp').value) || 0.7;
  var maxTokens = parseInt(document.getElementById('f_maxtokens').value) || 2048;
  var contextWindow = parseInt(document.getElementById('f_context').value) || 128000;
  if (!name) { toast('请输入配置名称'); return; }
  if (!model) { toast('请输入/选择模型名'); return; }
  if (!apiKey) { toast('请输入 API Key'); return; }
  var config = { name: name, provider: provider, model: model, apiKey: apiKey, baseUrl: baseUrl, defaultParams: { temperature: temp, max_tokens: maxTokens, context_window: contextWindow } };
  if (editingLlmId === 'new') { LLMService.add(config); toast('已添加配置: ' + name); }
  else { LLMService.update(editingLlmId, config); toast('已更新配置: ' + name); }
  editingLlmId = null;
  renderLlmConfigs(document.getElementById('settingsTabContent'));
}

function deleteLLM(id) {
  var configs = LLMService.getAll();
  var c = null;
  for (var i = 0; i < configs.length; i++) { if (configs[i].id === id) { c = configs[i]; break; } }
  if (!c) return;
  confirmDialog('确定删除配置「' + escHtml(c.name) + '」吗？', function() { LLMService.remove(id); toast('已删除配置'); renderLlmConfigs(document.getElementById('settingsTabContent')); });
}

// 暴露到全局
window.renderLlmConfigs = renderLlmConfigs;
window.addLLM = addLLM;
window.editLLM = editLLM;
window.cancelLLM = cancelLLM;
window.saveLLM = saveLLM;
window.deleteLLM = deleteLLM;
window.onProviderChange = onProviderChange;
window.fetchProviderModels = fetchProviderModels;
