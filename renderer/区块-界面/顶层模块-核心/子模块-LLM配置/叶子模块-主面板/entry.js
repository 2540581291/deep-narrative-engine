// 深度-叙事引擎 · LLM 配置管理
var editingLlmId = null;

function renderLlmConfigs(el) {
  var configs = LLMService.getAll();
  var html = '<p class="settings-card-desc">管理你的 LLM API 配置。支持多个厂商和模型。</p>';
  if (editingLlmId !== null) {
    var editingConfig = null;
    if (editingLlmId === 'new') { editingConfig = { provider: 'openai', id: null, name: '', model: '', apiKey: '', baseUrl: '', thinkingMode: false, defaultParams: { temperature: 0.7, max_tokens: 4096, context_window: 128000 } }; }
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
      html += '<div style="font-size:11px;color:var(--fg2);margin-top:4px">' + (PROVIDER_NAMES[c.provider] || c.provider || '') + ' · ' + escHtml(c.model) + ' · 思考：' + 思考模式标签(c.thinkingMode) + '</div></div>';
      html += '<div style="display:flex;gap:6px"><button class="btn-out" style="padding:4px 12px;font-size:11px" onclick="editLLM(\'' + c.id + '\')">✏️ 编辑</button>';
      html += '<button class="btn-out" style="padding:4px 12px;font-size:11px;color:var(--error);border-color:rgba(231,76,60,.4)" onclick="deleteLLM(\'' + c.id + '\')">🗑 删除</button></div></div>';
      if (c.apiKey) html += '<div style="font-size:11px;color:var(--fg2);margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">API Key: <span style="font-family:monospace;color:var(--fg3)">' + maskKey(c.apiKey) + '</span></div>';
      html += '</div>';
    }
  }
  if (editingLlmId === null) html += '<div style="text-align:center;margin-top:8px"><button class="btn-new" onclick="addLLM()">＋ 添加 LLM 配置</button></div>';
  el.innerHTML = html;
  // 模型框挂上自绘下拉（候选实时取当前厂商的已获取列表）
  if (editingLlmId !== null && document.getElementById('f_model')) {
    attachCombo('f_model', {
      getOptions: function() {
        var sel = document.getElementById('f_provider');
        var p = sel ? sel.value : 'openai';
        return (PROVIDER_MODELS[p] || []).map(function(m) { return { value: m.value, label: m.label || m.value }; });
      },
      emptyHint: '尚未获取模型：点右侧「🔄 获取模型」从厂商官方接口拉取，也可以直接在框里手输模型名',
    });
  }
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
  html += '<div class="settings-row">' + label('模型名', FIELD_TIPS.model);
  html += '<div style="display:flex;gap:6px;align-items:center;width:100%">';
  // 不预设模型：始终是可自由输入的文本框，点开即列出「🔄 获取模型」拉到的官方模型
  html += 组合框HTML({ id: 'f_model', value: config.model || '', placeholder: modelPlaceholder(provider), style: 'flex:1' });
  html += '<button class="btn-out" style="white-space:nowrap" onclick="fetchProviderModels()" title="从厂商官方接口获取可用模型列表">🔄 获取模型</button>';
  html += '</div></div>';
  html += '<div class="settings-row">' + label('API Key', FIELD_TIPS.apiKey);
  html += '<input id="f_apikey" type="password" class="llm-input" style="width:100%" value="' + escHtml(config.apiKey || '') + '" placeholder="' + (provider === 'ollama' ? '本地服务无需 API Key，可留空' : 'sk-...') + '" ondblclick="this.type=\'text\'" onblur="this.type=\'password\'" /></div>';
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
  html += '</select></div>';
  // 思考模式（思维链）：默认「关闭」——老配置里没有这个字段时也按关闭显示/处理
  var 思考值 = config.thinkingMode === true ? 'on' : (config.thinkingMode === null ? 'auto' : 'off');
  html += '<div style="flex:1;min-width:150px">' + label('思考模式', FIELD_TIPS.thinkingMode);
  html += '<select id="f_thinking" class="llm-input llm-select" style="width:100%">';
  for (var xi = 0; xi < 思考模式选项.length; xi++) html += '<option value="' + 思考模式选项[xi].value + '"' + (思考值 === 思考模式选项[xi].value ? ' selected' : '') + '>' + 思考模式选项[xi].label + '</option>';
  html += '</select></div></div>';
  html += '<div style="display:flex;gap:8px;margin-top:6px"><button class="btn-new" onclick="saveLLM()">💾 保存</button><button class="btn-out" onclick="cancelLLM()">取消</button></div></div>';
  return html;
}

function modelPlaceholder(provider) {
  if (provider === 'ollama') return '点「🔄 获取模型」列出本机已装模型，或直接输入（如 qwen2.5:7b）';
  return '点「🔄 获取模型」拉取官方模型列表，或直接输入模型名';
}

function onProviderChange() {
  var provider = document.getElementById('f_provider').value;
  var modelInput = document.getElementById('f_model');
  if (modelInput) {
    // 换厂商＝换模型命名空间，清掉旧值，避免把 A 家的模型名留在 B 家配置里
    modelInput.value = '';
    modelInput.placeholder = modelPlaceholder(provider);
  }
  // 候选由组合框的 getOptions 实时读取，这里不用重建列表
  closeCombo();
  var urlInput = document.getElementById('f_baseurl');
  if (urlInput && DEFAULT_URLS[provider]) urlInput.value = DEFAULT_URLS[provider];
  var keyInput = document.getElementById('f_apikey');
  if (keyInput) keyInput.placeholder = provider === 'ollama' ? '本地服务无需 API Key，可留空' : 'sk-...';
}

function fetchProviderModels() {
  var provider = document.getElementById('f_provider').value;
  var apiKey = document.getElementById('f_apikey').value.trim();
  var baseUrl = document.getElementById('f_baseurl').value.trim();
  var isOllama = provider === 'ollama';

  if (!isOllama && !apiKey) { toast('请先填写 API Key'); return; }
  if (!baseUrl) { toast('请先填写 Base URL'); return; }

  var url, fetchOpts;
  if (isOllama) {
    // Ollama 原生接口：GET /api/tags → { models: [{ name, model, ... }] }，本地服务无需鉴权
    url = baseUrl.replace(/\/+$/, '').replace(/\/v1$/, '') + '/api/tags';
    fetchOpts = {};
  } else if (provider === 'anthropic') {
    // Anthropic 官方模型列表；浏览器环境必须带 direct-browser-access 头
    url = baseUrl.replace(/\/+$/, '') + '/v1/models?limit=100';
    fetchOpts = { headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' } };
  } else if (provider === 'gemini') {
    url = baseUrl + '/v1beta/models?key=' + encodeURIComponent(apiKey);
    fetchOpts = {};
  } else if (provider === 'opencodezen' || provider === 'opencodego') {
    // OpenCode Zen / Go：统一走 {根}/models，Bearer 鉴权，返回的就是 OpenAI 形状的 { data: [{ id }] }。
    // 地址先归一化：zen 的 /go/v1 是订阅制入口，用 oc_sk_ 密钥会报 MissingSessionID。
    url = zen根地址(baseUrl) + '/models';
    fetchOpts = { headers: { 'Authorization': 'Bearer ' + apiKey } };
  } else {
    url = baseUrl.replace(/\/+$/, '') + '/models';
    fetchOpts = { headers: { 'Authorization': 'Bearer ' + apiKey } };
  }

  toast('正在从官方接口获取模型列表...');

  fetch(url, fetchOpts).then(function(res) {
    if (!res.ok) return res.json().then(function(err) { throw new Error(err.error && err.error.message ? err.error.message : 'HTTP ' + res.status); });
    return res.json();
  }).then(function(data) {
    var rawModels = (provider === 'gemini' || isOllama) ? (data.models || []) : (data.data || []);
    var seen = {};
    var modelIds = [];
    for (var ri = 0; ri < rawModels.length; ri++) {
      var id = (rawModels[ri].id || rawModels[ri].name || rawModels[ri].model || '').replace(/^models\//, '');
      if (id && !seen[id]) { seen[id] = true; modelIds.push(id); }
    }
    modelIds.sort();

    if (!modelIds.length) { toast('官方接口返回的模型列表为空'); return; }

    // 官方列表为准：整表替换当前会话缓存的候选（不预设、不累积旧结果）
    PROVIDER_MODELS[provider] = modelIds.map(function(id) { return { value: id, label: id }; });

    // 拉完直接把候选列表弹出来，省得再点一次输入框
    var mi = document.getElementById('f_model');
    if (mi) { mi.focus(); openCombo('f_model'); }
    toast('已获取 ' + modelIds.length + ' 个官方模型，可直接从列表里选');
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
  var 思考下拉 = document.getElementById('f_thinking');
  var 思考值 = 思考下拉 ? 思考下拉.value : 'off';
  var thinkingMode = (思考值 === 'on') ? true : (思考值 === 'auto' ? null : false);
  if (!name) { toast('请输入配置名称'); return; }
  if (!model) { toast('请输入/选择模型名'); return; }
  if (!apiKey && provider !== 'ollama') { toast('请输入 API Key'); return; }
  var config = { name: name, provider: provider, model: model, apiKey: apiKey, baseUrl: baseUrl, thinkingMode: thinkingMode, defaultParams: { temperature: temp, max_tokens: maxTokens, context_window: contextWindow } };
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
