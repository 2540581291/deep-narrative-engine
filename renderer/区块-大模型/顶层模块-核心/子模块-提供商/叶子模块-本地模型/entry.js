// 深度-叙事引擎 · Ollama 本地 Provider
// 注意：本文件在「子模块-大模型」之后加载，注册进 大模型._处理器（window.LLM === window.大模型），
// 而 大模型.调用 只认「调用」方法名，因此这里用 调用 注册；call 保留作旧接口兼容。

function ollama调用(大模型, config, opts) {
  config = config || {};
  opts = opts || {};
  var baseUrl = (config.baseUrl || 'http://localhost:11434').replace(/\/+$/, '');
  // 允许填 http://localhost:11434/v1（OpenAI 兼容地址），统一回到原生接口
  baseUrl = baseUrl.replace(/\/v1$/, '');
  var model = config.model || 'llama3.2';

  var messages = [];
  if (opts.system) {
    messages.push({ role: 'system', content: opts.system });
  }
  if (opts.messages) {
    messages = messages.concat(opts.messages);
  } else {
    messages.push({ role: 'user', content: opts.prompt || opts.user || '' });
  }

  var params = config.defaultParams || {};
  var temperature = opts.temperature != null ? opts.temperature
    : (params.temperature != null ? params.temperature : 0.7);
  var numPredict = opts.maxTokens || params.max_tokens || 4096;

  var body = {
    model: model,
    messages: messages,
    stream: false,
    options: {
      temperature: temperature,
      num_predict: numPredict,
    },
  };
  // 思考模式：默认关闭——Ollama 用 think:true/false 控制（false = 请求不输出思考，模型允许时生效）；
  // 「跟随服务端默认」不下发；旧版 Ollama 会忽略不认识的字段，不会报错。
  if (typeof 思考是否开启 === 'function' && 思考是否开启(config)) body.think = true;
  else if (typeof 思考是否关闭 === 'function' && 思考是否关闭(config)) body.think = false;

  return fetch(baseUrl + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: opts._signal,
  }).then(function(r) {
    if (!r.ok) {
      return r.text().then(function(t) { throw new Error('Ollama Error: ' + r.status + ' ' + t); });
    }
    return r.json();
  }).then(function(data) {
    if (typeof recordUsage !== 'undefined') recordUsage(config, data, opts);
    if (data && data.message && typeof data.message.content === 'string' && data.message.content.trim()) {
      return data.message.content;
    }
    // 空响应（思维链模型只输出思考内容等）→ 返回空串，由上层统一重试
    return '';
  });
}

LLM.registerProvider('ollama', { 调用: ollama调用, call: ollama调用 });
