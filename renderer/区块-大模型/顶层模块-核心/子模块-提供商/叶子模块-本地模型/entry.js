// 深度-叙事引擎 · Ollama 本地 Provider

LLM.registerProvider('ollama', {
  call: function(llm, config, opts) {
    var baseUrl = (config.baseUrl || 'http://localhost:11434').replace(/\/+$/, '');
    var model = config.model || 'llama3';

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
      stream: false,
      options: {
        temperature: opts.temperature != null ? opts.temperature : (config.defaultParams ? config.defaultParams.temperature : null) || config.temperature || 0.7,
        num_predict: opts.maxTokens || (config.defaultParams ? config.defaultParams.max_tokens : null) || config.maxTokens,
      },
    };

    return fetch(baseUrl + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(function(r) {
      if (!r.ok) {
        return r.text().then(function(t) { throw new Error('Ollama Error: ' + r.status + ' ' + t); });
      }
      return r.json();
    }).then(function(data) {
      if (typeof recordUsage !== 'undefined') recordUsage(config, data, opts);
      return data.message ? data.message.content : '';
    });
  },
});
