// 深度-叙事引擎 · Anthropic Claude Provider

LLM.registerProvider('anthropic', {
  call: function(llm, config, opts) {
    var baseUrl = (config.baseUrl || 'https://api.anthropic.com').replace(/\/+$/, '');
    var model = config.model || 'claude-3-haiku-20240307';
    var apiKey = config.apiKey || '';
    if (!apiKey) {
      return Promise.reject(new Error('Anthropic 需要 API Key'));
    }

    var messages = [];
    if (opts.messages) {
      messages = opts.messages;
    } else if (opts.prompt) {
      messages.push({ role: 'user', content: opts.prompt });
    }

    var body = {
      model: model,
      max_tokens: opts.maxTokens || (config.defaultParams ? config.defaultParams.max_tokens : null) || config.maxTokens,
      messages: messages,
    };

    if (opts.system) {
      body.system = opts.system;
    }

    return fetch(baseUrl + '/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    }).then(function(r) {
      if (!r.ok) {
        return r.text().then(function(t) { throw new Error('Anthropic Error: ' + r.status + ' ' + t); });
      }
      return r.json();
    }).then(function(data) {
      if (typeof recordUsage !== 'undefined') recordUsage(config, data, opts);
      return data.content && data.content[0] ? data.content[0].text : '';
    });
  },
});
