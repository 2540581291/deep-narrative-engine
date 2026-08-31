// 深度-叙事引擎 · LLM 配置业务逻辑
window.LLMService = {
  getAll: function() {
    return S.settings.llmConfigs || [];
  },
  add: function(config) {
    config.id = config.id || uuid();
    var configs = S.settings.llmConfigs || [];
    configs.push(config);
    S.settings.llmConfigs = configs;
    saveSettings(S.settings);
    return config;
  },
  update: function(id, updates) {
    var configs = S.settings.llmConfigs || [];
    for (var i = 0; i < configs.length; i++) {
      if (configs[i].id === id) {
        for (var k in updates) configs[i][k] = updates[k];
        break;
      }
    }
    S.settings.llmConfigs = configs;
    saveSettings(S.settings);
  },
  remove: function(id) {
    var configs = S.settings.llmConfigs || [];
    S.settings.llmConfigs = configs.filter(function(c) { return c.id !== id; });
    saveSettings(S.settings);
  },
  getDefault: function() {
    var configs = this.getAll();
    return configs.length ? configs[0] : null;
  },
};
