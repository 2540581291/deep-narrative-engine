// 深度-叙事引擎 · LLM 数据定义
var PROVIDER_OPTIONS = [
  { id: 'openai', name: 'OpenAI / 兼容接口' },
  { id: 'anthropic', name: 'Anthropic Claude' },
  { id: 'gemini', name: 'Google Gemini' },
  { id: 'deepseek', name: 'DeepSeek' },
  { id: 'opencodego', name: 'Open Code Go' },
  { id: 'custom', name: '自定义' },
];

var DEFAULT_URLS = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com',
  gemini: 'https://generativelanguage.googleapis.com',
  deepseek: 'https://api.deepseek.com',
  opencodego: 'https://opencode.ai/zen/go/v1',
  custom: '',
};

var PROVIDER_MODELS = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o（旗舰模型，多模态）' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini（轻量经济版）' },
    { value: 'gpt-4.1', label: 'GPT-4.1（长上下文，1M）' },
  ],
  anthropic: [
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4（平衡型，擅长写作）' },
    { value: 'claude-haiku-3-20250313', label: 'Claude Haiku 3.5（轻量快速）' },
  ],
  gemini: [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash（高效，大上下文）' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro（旗舰，强推理）' },
  ],
  deepseek: [
    { value: 'deepseek-v4-flash', label: 'DeepSeek-V4 Flash（经济快捷）' },
    { value: 'deepseek-v4-pro', label: 'DeepSeek-V4 Pro（顶配性能）' },
  ],
  opencodego: [
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4（平衡型，擅长写作）' },
    { value: 'claude-haiku-3-20250313', label: 'Claude Haiku 3.5（轻量快速）' },
  ],
  custom: [],
};

var TOKEN_OPTIONS = [1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144];

var CONTEXT_WINDOW_OPTIONS = [
  { value: 128000, label: '128K（GPT-4o / GPT-4.1 默认）' },
  { value: 200000, label: '200K（Claude 默认）' },
  { value: 1048576, label: '1M（DeepSeek-V4 / Gemini 默认）' },
  { value: 2097152, label: '2M（自定义扩展）' },
];

var PROVIDER_TIPS = {
  openai: '选用 OpenAI 接口或兼容 OpenAI 格式的第三方服务',
  anthropic: '选用 Anthropic 的 Claude 系列模型',
  gemini: '选用 Google 的 Gemini 系列模型',
  deepseek: 'DeepSeek-V4 系列，支持百万字超长上下文，兼容 OpenAI 格式',
  opencodego: '通过 Open Code Go 订阅使用 Claude 系列模型，OpenAI 兼容接口',
  custom: '自定义接口，需手动填写 Base URL 和模型名',
};

var FIELD_TIPS = {
  name: '给你的配置起个名字，如"我的 GPT-4o"或"写作专用模型"',
  provider: '选择 AI 服务提供商。切换厂商后模型列表和 Base URL 会自动更新',
  model: '选择具体的模型版本。不同厂商的模型列表不同',
  apiKey: '从 AI 服务商后台获取的密钥。存储在本机，不会上传到别处',
  baseUrl: 'API 请求的基础地址。一般不需要修改，自建代理时修改此项',
  temperature: '控制输出随机性。0=精确保守，1=平衡，2=创造性。写作推荐 0.7-0.9',
  maxTokens: '单次生成的最大 token 数量（max_tokens）。写作建议 2048-4096，长文本可设 8192+，上限由各 API 决定',
  contextWindow: '模型能读取的最大上下文长度。1M = 100万 token。DeepSeek-V4 支持 1M，Claude 200K，GPT-4o 128K。注意：上下文窗口 ≠ 单次输出上限',
};

var PROVIDER_NAMES = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Gemini',
  deepseek: 'DeepSeek',
  opencodego: 'Open Code Go',
  custom: '自定义',
};

var DEFAULT_CONTEXT_WINDOWS = {
  openai: 128000,
  anthropic: 200000,
  gemini: 1048576,
  deepseek: 1048576,
  opencodego: 200000,
  custom: 128000,
};

function fmtToken(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  if (n >= 1000) return (n / 1000).toFixed(0) + '千';
  return String(n);
}

window.PROVIDER_OPTIONS = PROVIDER_OPTIONS;
window.DEFAULT_URLS = DEFAULT_URLS;
window.PROVIDER_MODELS = PROVIDER_MODELS;
window.TOKEN_OPTIONS = TOKEN_OPTIONS;
window.CONTEXT_WINDOW_OPTIONS = CONTEXT_WINDOW_OPTIONS;
window.PROVIDER_TIPS = PROVIDER_TIPS;
window.FIELD_TIPS = FIELD_TIPS;
window.PROVIDER_NAMES = PROVIDER_NAMES;
window.DEFAULT_CONTEXT_WINDOWS = DEFAULT_CONTEXT_WINDOWS;
window.fmtToken = fmtToken;
