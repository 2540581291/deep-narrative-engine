// 深度-叙事引擎 · OpenAI 兼容 Provider

LLM.registerProvider('openai', {
  call: function(llm, config, opts) {
    var baseUrl = (config.baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
    var model = config.model || 'gpt-4o-mini';
    var apiKey = config.apiKey || '';

    var messages = [];
    if (opts.system) {
      messages.push({ role: 'system', content: opts.system });
    }
    if (opts.messages) {
      messages = messages.concat(opts.messages);
    } else if (opts.prompt) {
      messages.push({ role: 'user', content: opts.prompt });
    }

    var body = {
      model: model,
      messages: messages,
      temperature: opts.temperature != null ? opts.temperature : (config.defaultParams ? config.defaultParams.temperature : null) || config.temperature || 0.7,
      max_tokens: opts.maxTokens || (config.defaultParams ? config.defaultParams.max_tokens : null) || config.maxTokens,
    };

    var headers = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['Authorization'] = 'Bearer ' + apiKey;
    }
    if (config.customHeader) {
      try { var ch = JSON.parse(config.customHeader); for (var k in ch) headers[k] = ch[k]; } catch(e) {}
    }

    return fetch(baseUrl + '/chat/completions', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    }).then(function(r) {
      if (!r.ok) {
        return r.text().then(function(t) { throw new Error('API Error: ' + r.status + ' ' + t); });
      }
      return r.json();
    }).then(function(data) {
      if (typeof recordUsage !== 'undefined') recordUsage(config, data, opts);
      if (data.choices && data.choices[0] && data.choices[0].message) {
        var msg = data.choices[0].message;
        // content 为空时回退 reasoning_content（思维链文本），避免空响应
        return (msg.content && String(msg.content).trim()) ? msg.content : (msg.reasoning_content || '');
      }
      return '';
    });
  },
});
