// 深度-叙事引擎 · 使用统计追踪
// 价格单位：元/百万 tokens（按各厂商官方定价）
// DeepSeek-V4 官方定价（2026-08-17 起实施峰谷分时计价，api-docs.deepseek.com/zh-cn/quick_start/pricing）：
//   表内为「空闲时段」基准价；高峰时段（每日 9:00 与 14:00 起始，即北京 9:00-12:00、14:00-18:00）价格 ×2
//   input=缓存未命中标准输入价，cacheRead=cacheHit 缓存命中价，output=输出价
//   v4-flash：空闲 命中0.05 / 未命中1.5 / 输出4.5；高峰 命中0.10 / 未命中3.0 / 输出9.0
//   v4-pro  ：空闲 命中0.15 / 未命中4.5 / 输出13.5；高峰 命中0.30 / 未命中9.0 / 输出27.0
var MODEL_PRICES = {
  'gpt-4o': { input: 0.018, output: 0.072, cacheRead: 0.009 },
  'gpt-4o-mini': { input: 0.001, output: 0.004, cacheRead: 0.0005 },
  'o3': { input: 0.072, output: 0.288, cacheRead: 0.036 },
  'o4-mini': { input: 0.015, output: 0.060, cacheRead: 0.0075 },
  'gpt-4.1': { input: 0.018, output: 0.072, cacheRead: 0.009 },
  'claude-sonnet-4-20250514': { input: 0.022, output: 0.072, cacheRead: 0.0007, cacheWrite: 0.022 },
  'claude-haiku-3-20250313': { input: 0.007, output: 0.036, cacheRead: 0.0007, cacheWrite: 0.007 },
  'deepseek-v4-flash': { input: 1.5, output: 4.5, cacheRead: 0.05 },
  'deepseek-v4-pro': { input: 4.5, output: 13.5, cacheRead: 0.15 },
  'deepseek-chat': { input: 1.5, output: 4.5, cacheRead: 0.05 },
  'deepseek-reasoner': { input: 4.5, output: 13.5, cacheRead: 0.15 },
  'gemini-2.5-flash': { input: 0.0005, output: 0.002, cacheRead: 0.00005 },
  'gemini-2.5-pro': { input: 0.015, output: 0.060, cacheRead: 0.0015 },
};

// 峰谷定价：高峰时段（北京时间 9:00-12:00 和 14:00-18:00）价格 ×2
function 是否高峰时段(timestamp) {
  try {
    var d = timestamp ? new Date(timestamp) : new Date();
    var h = d.getHours() + d.getMinutes() / 60;
    return (h >= 9 && h < 12) || (h >= 14 && h < 18);
  } catch(e) { return false; }
}

var _records = [];
var _recordsLoaded = false;
var _savePending = false;
var _sessionStart = new Date().toISOString();
var _activeCalls = {};
var _activeCallId = 0;

function startActiveCall(name) {
  var id = ++_activeCallId;
  _activeCalls[id] = { name: name, startTime: Date.now() };
  return id;
}
function endActiveCall(id) { delete _activeCalls[id]; }
function getActiveCalls() {
  var list = [];
  for (var id in _activeCalls) {
    var c = _activeCalls[id];
    list.push({ name: c.name, elapsed: Math.round((Date.now() - c.startTime) / 1000) });
  }
  return list;
}

function _usageFilePath() { return 'usage.json'; }

function _ensureRecordsLoaded() {
  return new Promise(function(resolve) {
    if (_recordsLoaded) { resolve(); return; }
    LocalFS.readJSON(_usageFilePath()).then(function(data) {
      if (data && Array.isArray(data)) _records = data;
      _recordsLoaded = true;
      resolve();
    }).catch(function() {
      _recordsLoaded = true;
      resolve();
    });
  });
}

function _flushRecords() {
  if (_savePending) return;
  _savePending = true;
  setTimeout(function() {
    _savePending = false;
    LocalFS.saveJSON(_usageFilePath(), _records);
  }, 500);
}

function normalizeUsage(provider, model, raw) {
  var rec = {
    id: uuid(), provider: provider, model: model,
    timestamp: new Date().toISOString(), sessionStart: _sessionStart, label: '',
    promptTokens: 0, completionTokens: 0, totalTokens: 0,
    cacheHitTokens: 0, cacheMissTokens: 0, estimatedCost: 0,
  };
  if (!raw) return rec;
  try {
    // OpenAI / DeepSeek: raw 是 response.usage
    if (provider === 'openai' || provider === 'deepseek') {
      var u = raw;
      rec.promptTokens = u.prompt_tokens || u.promptTokenCount || 0;
      rec.completionTokens = u.completion_tokens || u.candidatesTokenCount || 0;
      rec.totalTokens = u.total_tokens || u.totalTokenCount || (rec.promptTokens + rec.completionTokens);
      // 官方缓存命中/未命中字段（DeepSeek: prompt_cache_hit_tokens / prompt_cache_miss_tokens）
      var cacheHit = u.prompt_cache_hit_tokens;
      if (cacheHit === undefined && u.prompt_tokens_details) cacheHit = u.prompt_tokens_details.cached_tokens;
      var cacheMiss = u.prompt_cache_miss_tokens;
      if (cacheMiss === undefined && cacheHit !== undefined) cacheMiss = rec.promptTokens - cacheHit;
      rec.cacheHitTokens = cacheHit || 0;
      rec.cacheMissTokens = (cacheMiss !== undefined && cacheMiss !== null) ? cacheMiss : 0;
    // Anthropic: raw 是 response 本身（input_tokens/output_tokens 在根级）
    } else if (provider === 'anthropic') {
      rec.promptTokens = raw.input_tokens || 0;
      rec.completionTokens = raw.output_tokens || 0;
      rec.totalTokens = rec.promptTokens + rec.completionTokens;
      var ch = raw.cache_read_input_tokens || 0;
      var cm = raw.cache_creation_input_tokens || 0;
      rec.cacheHitTokens = ch;
      rec.cacheMissTokens = cm;
    // Gemini: raw 是 response.usageMetadata
    } else if (provider === 'gemini') {
      rec.promptTokens = raw.promptTokenCount || 0;
      rec.completionTokens = raw.candidatesTokenCount || 0;
      rec.totalTokens = raw.totalTokenCount || (rec.promptTokens + rec.completionTokens);
      rec.cacheHitTokens = raw.cachedContentTokenCount || 0;
      rec.cacheMissTokens = 0;
    // Ollama: prompt_eval_count/eval_count 在根级
    } else if (provider === 'ollama') {
      rec.promptTokens = raw.prompt_eval_count || 0;
      rec.completionTokens = raw.eval_count || 0;
      rec.totalTokens = rec.promptTokens + rec.completionTokens;
    }
  } catch(e) { console.warn('[Usage] 解析失败:', e); }
  rec.estimatedCost = estimateCost(provider, model, rec);
  return rec;
}

function estimateCost(provider, model, usage) {
  var price = MODEL_PRICES[model];
  if (!price) {
    for (var key in MODEL_PRICES) {
      if (model.indexOf(key) >= 0 || key.indexOf(model) >= 0) { price = MODEL_PRICES[key]; break; }
    }
  }
  if (!price) return 0;
  // 峰谷定价：高峰时段（北京 9-12 / 14-18）价格 ×2
  var 倍率 = 是否高峰时段(usage.timestamp) ? 2 : 1;
  var cacheHit = usage.cacheHitTokens || 0;
  var cacheMiss = usage.cacheMissTokens || 0;
  var cost = 0;
  // 输入·未命中缓存 = 标准输入价；输入·命中缓存 = 缓存读取价（低价）
  cost += cacheMiss * price.input;
  cost += cacheHit * (price.cacheRead || price.input);
  cost += usage.completionTokens * price.output;
  // 价格单位是"元/百万 tokens"，换算到 token 需除以 1,000,000
  return cost * 倍率 / 1000000;
}

function recordUsage(config, apiResponse, opts) {
  if (!apiResponse || !config) return;
  // 各 provider 的 usage 字段位置不同：
  var rawUsage = apiResponse.usage || apiResponse.usageMetadata || null;
  // Anthropic: input_tokens/output_tokens 在 response 根级
  if (apiResponse.input_tokens !== undefined || apiResponse.output_tokens !== undefined) {
    rawUsage = apiResponse;
  }
  // Ollama: prompt_eval_count/eval_count 在 response 根级
  if (!rawUsage && (apiResponse.prompt_eval_count !== undefined || apiResponse.eval_count !== undefined)) {
    rawUsage = apiResponse;
  }
  var rec = normalizeUsage(config.provider || 'openai', config.model || 'unknown', rawUsage);
  if (!rawUsage || rec.totalTokens === 0) return;
  if (opts && opts.label) rec.label = opts.label;

  if (_recordsLoaded) {
    _records.push(rec);
    _flushRecords();
  } else {
    _ensureRecordsLoaded().then(function() {
      _records.push(rec);
      _flushRecords();
    });
  }
}

function _aggregate(records) {
  var models = {}, totalCost = 0, totalTokens = 0, totalHit = 0, totalMiss = 0, totalOut = 0, byLabel = {}, hourBuckets = {};
  for (var i = 0; i < records.length; i++) {
    var r = records[i];
    var key = r.provider + '/' + (r.model || 'unknown');
    if (!models[key]) models[key] = { provider: r.provider || '', model: r.model || '', promptTokens: 0, completionTokens: 0, totalTokens: 0, cacheHitTokens: 0, cacheMissTokens: 0, cost: 0, count: 0 };
    var m = models[key];
    m.promptTokens += r.promptTokens || 0; m.completionTokens += r.completionTokens || 0;
    m.totalTokens += r.totalTokens || 0; m.cacheHitTokens += r.cacheHitTokens || 0;
    m.cacheMissTokens += r.cacheMissTokens || 0; m.cost += r.estimatedCost || 0; m.count++;
    totalCost += r.estimatedCost || 0; totalTokens += r.totalTokens || 0;
    totalHit += r.cacheHitTokens || 0; totalMiss += r.cacheMissTokens || 0; totalOut += r.completionTokens || 0;
    var label = r.label || '其他';
    if (!byLabel[label]) byLabel[label] = { label: label, totalTokens: 0, totalCost: 0, count: 0 };
    byLabel[label].totalTokens += r.totalTokens || 0; byLabel[label].totalCost += r.estimatedCost || 0; byLabel[label].count++;
    if (r.timestamp) {
      var hk = r.timestamp.substring(0, 13);
      if (!hourBuckets[hk]) hourBuckets[hk] = { key: hk, day: r.timestamp.substring(0, 10), tokens: 0, cost: 0, count: 0 };
      hourBuckets[hk].tokens += r.totalTokens || 0; hourBuckets[hk].cost += r.estimatedCost || 0; hourBuckets[hk].count++;
    }
  }
  var timeline = Object.keys(hourBuckets).sort().map(function(k) { return hourBuckets[k]; });
  return { models: models, totalCost: totalCost, totalTokens: totalTokens, cacheHitTokens: totalHit, cacheMissTokens: totalMiss, completionTokens: totalOut, count: records.length, byLabel: byLabel, records: records, timeline: timeline };
}

function getUsageSummary(sinceTimestamp, filterLabel) {
  return _ensureRecordsLoaded().then(function() {
    var filtered = _records;
    if (sinceTimestamp) filtered = filtered.filter(function(r) { return r.timestamp >= sinceTimestamp; });
    if (filterLabel) filtered = filtered.filter(function(r) { return (r.label || '其他') === filterLabel; });
    return _aggregate(filtered);
  });
}

function getSessionUsage() { return getUsageSummary(_sessionStart); }
function getAllUsage() { return getUsageSummary(null); }
function getLabelUsage(label) { return getUsageSummary(null, label); }
function clearUsage() {
  return _ensureRecordsLoaded().then(function() {
    _records = [];
    return LocalFS.saveJSON(_usageFilePath(), []);
  });
}

window.startActiveCall = startActiveCall;
window.endActiveCall = endActiveCall;
window.getActiveCalls = getActiveCalls;
window.recordUsage = recordUsage;
window.getSessionUsage = getSessionUsage;
window.getAllUsage = getAllUsage;
window.getLabelUsage = getLabelUsage;
window.clearUsage = clearUsage;
