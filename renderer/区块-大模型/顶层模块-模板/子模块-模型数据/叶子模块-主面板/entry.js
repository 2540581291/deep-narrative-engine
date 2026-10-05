// 深度-叙事引擎 · LLM 数据定义
var PROVIDER_OPTIONS = [
  { id: 'openai', name: 'OpenAI / 兼容接口' },
  { id: 'deepseek', name: 'DeepSeek' },
  { id: 'opencodezen', name: 'OpenCode Zen' },
  { id: 'opencodego', name: 'Open Code Go（订阅制，需 x-opencode-session）' },
  { id: 'ollama', name: 'Ollama' },
  { id: 'custom', name: '自定义' },
];

var DEFAULT_URLS = {
  openai: 'https://api.openai.com/v1',
  deepseek: 'https://api.deepseek.com',
  // Zen（pay-as-you-go，oc_sk_ 密钥）：一个地址下按模型家族分 4 套协议，界面会自动分流
  opencodezen: 'https://opencode.ai/zen/v1',
  // OpenCode Go 是订阅制产品，地址是 /zen/go/v1 且必须带 x-opencode-session；
  // 用 Zen 的 oc_sk_ 密钥填这里会报 MissingSessionID，所以单独列一项、不设默认值
  opencodego: 'https://opencode.ai/zen/go/v1',
  ollama: 'http://localhost:11434',
  custom: '',
};

// 不预设任何模型：模型列表一律由 LLM 配置页的「🔄 获取模型」从各厂商官方接口实时拉取，
// 也允许直接手输模型名（模型输入框始终可编辑）。这里保留空数组，仅用于缓存本次会话的拉取结果。
var PROVIDER_MODELS = {
  openai: [],
  deepseek: [],
  opencodezen: [],
  opencodego: [],
  ollama: [],
  custom: [],
};

var TOKEN_OPTIONS = [1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144];

var CONTEXT_WINDOW_OPTIONS = [
  { value: 8192, label: '8K（本地小模型）' },
  { value: 32768, label: '32K（Ollama 常用）' },
  { value: 128000, label: '128K（GPT-4o / GPT-4.1 默认）' },
  { value: 200000, label: '200K（长上下文）' },
  { value: 1048576, label: '1M（DeepSeek-V4 默认）' },
  { value: 2097152, label: '2M（自定义扩展）' },
];

var PROVIDER_TIPS = {
  openai: '选用 OpenAI 接口或兼容 OpenAI 格式的第三方服务',
  deepseek: 'DeepSeek-V4 系列，支持百万字超长上下文，兼容 OpenAI 格式',
  opencodezen: 'OpenCode Zen 聚合网关（oc_sk_ 密钥）。一个地址下同时有 GPT / Claude / Gemini / Grok / DeepSeek / GLM / Kimi / Qwen 等，软件会按模型名自动切换 Google / Anthropic / OpenAI 各自的原生协议',
  opencodego: 'OpenCode Go 订阅制服务，地址为 /zen/go/v1 且必须带 x-opencode-session，普通 API Key 无法直接调用；一般请选上面的「OpenCode Zen」',
  ollama: '本地 Ollama 服务，模型跑在自己电脑上，无需 API Key。默认地址 http://localhost:11434',
  custom: '自定义接口，需手动填写 Base URL 和模型名',
};

var FIELD_TIPS = {
  name: '给你的配置起个名字，如"我的 GPT-4o"或"写作专用模型"',
  provider: '选择 AI 服务提供商。切换厂商后模型列表和 Base URL 会自动更新',
  model: '不预设模型。点右边「🔄 获取模型」从厂商官方接口拉取可用模型，也可以直接手输模型名',
  apiKey: '从 AI 服务商后台获取的密钥。存储在本机，不会上传到别处',
  baseUrl: 'API 请求的基础地址。一般不需要修改，自建代理时修改此项',
  temperature: '控制输出随机性。0=精确保守，1=平衡，2=创造性。写作推荐 0.7-0.9',
  maxTokens: '单次生成的最大 token 数量（max_tokens）。写作建议 2048-4096，长文本可设 8192+，上限由各 API 决定',
  contextWindow: '模型能读取的最大上下文长度。1M = 100万 token。DeepSeek-V4 支持 1M，GPT-4o 128K，本地 Ollama 模型常见 8K-32K。注意：上下文窗口 ≠ 单次输出上限',
  thinkingMode: '思考模式（思维链 / reasoning）。多数新模型的服务端默认是「开」，会明显变慢、吃掉输出预算，还常出现"只吐思考内容、正文为空"的情况，所以这里默认「关闭」。各家参数名不一样，软件按模型名自动分派：DeepSeek → thinking:{type:disabled}；千问 → enable_thinking:false；智谱 GLM / Kimi → thinking:{type:disabled}；GPT-5 系 → reasoning_effort（gpt-5.1+ 可设 none，其余降到最低档）；Gemini 2.5 Flash / 3 Flash → thinkingBudget:0 / thinkingLevel:minimal；Ollama → think:false。注意有些型号**强制思考、关不掉**（GLM-5.3 系、kimi-k3、kimi-k2.7-code、MiniMax M2、deepseek-r1、Gemini Pro 系），这些会按服务端默认走、不会报错；认不出的模型同样不下发参数。「跟随服务端默认」= 什么都不发，由厂商决定',
};

// 思考模式（思维链）三态：false = 关闭（默认）/ true = 开启 / null = 跟随服务端默认
// 注意：老配置里没有这个字段（undefined）按「关闭」处理——「默认关闭」就是靠这条成立的。
var 思考模式选项 = [
  { value: 'off',  label: '关闭（默认，推荐）' },
  { value: 'on',   label: '开启' },
  { value: 'auto', label: '跟随服务端默认' },
];
function 思考模式标签(v) { return v === true ? '开启' : (v === null ? '跟随服务端' : '关闭'); }

var PROVIDER_NAMES = {
  openai: 'OpenAI',
  deepseek: 'DeepSeek',
  opencodezen: 'OpenCode Zen',
  opencodego: 'Open Code Go',
  ollama: 'Ollama',
  custom: '自定义',
};

var DEFAULT_CONTEXT_WINDOWS = {
  openai: 128000,
  deepseek: 1048576,
  opencodezen: 200000,
  opencodego: 200000,
  ollama: 32768,
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
