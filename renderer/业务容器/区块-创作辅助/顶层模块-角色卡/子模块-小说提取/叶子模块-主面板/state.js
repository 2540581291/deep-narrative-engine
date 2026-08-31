// 深度-叙事引擎 · 角色卡 · 📖 小说提取 · 状态变量
// 全局状态定义，所有子模块共享

var 小说提取原始文本 = '';
var 小说提取角色列表 = [];
var 小说提取角色描述 = {};
var 小说提取步骤 = 'upload';
var 小说提取分析进度 = { done: 0, total: 0 };
var 小说提取分段上限 = 0; // 0=不限，超限自动暂停保存
var 小说提取分析中结果 = null; // 分段分析中的累积结果，用于断点续传
var 小说提取请求暂停 = false; // 用户点击暂停时设为 true，当前段处理完即停
var 小说提取生成中 = {}; // 按角色名追踪生成中状态
var 小说提取审查进度 = null; // { done, total, chunks, taskId, processing }
var 小说提取视图 = 'upload'; // 'upload' | 'history'
var 小说提取当前记录标题 = '';
var 小说提取当前记录ID = null;
var 小说提取当前记录时间 = null;
var 小说提取存储基路径 = '角色卡/小说提取/';
var 小说提取展开角色 = {}; // { '角色名': true/false } 控制角色卡片展开状态
var 小说提取阶段数据 = {}; // { 父角色名: stagesArray } 时间线阶段独立文件数据（加载记录时填充）
// 性别配置：与角色库排序一致（女性 → 男性 → 伪娘 → 扶她）
var 小说提取性别配置 = {
  female: { label: '女性', icon: '👩', color: 'var(--accent2)' },
  male:   { label: '男性', icon: '👨', color: 'var(--blue)' },
  femboy: { label: '伪娘', icon: '⚧', color: 'var(--accent)' },
  futa:   { label: '扶她', icon: '🔮', color: 'var(--green)' },
  beast:  { label: '异种', icon: '👾', color: '#e94560' },
};
var 小说提取性别顺序 = ['female', 'male', 'femboy', 'futa', 'beast'];

// 性别值规范化：LLM 可能返回中文/带说明/空值，统一映射到标准枚举。
// 除 female/male/femboy/futa 四类外，其余一律归入 beast（异种）
function 小说提取规范化性别(v) {
  if (!v) return 'beast';
  var s = String(v).trim().toLowerCase();
  if (s === 'female' || s === '女性' || s === '女' || s === 'girl') return 'female';
  if (s === 'male' || s === '男性' || s === '男') return 'male';
  if (s === 'femboy' || s === '伪娘' || s === '女装' || s === '药娘') return 'femboy';
  if (s === 'futa' || s === '扶她' || s === '双性' || s === '两性') return 'futa';
  // 带说明/不确定的前缀值（如 "male（推断）"、"female?"）按前缀归类
  if (s.indexOf('male') === 0 || s.indexOf('男') === 0 || s.indexOf('雄') === 0) return 'male';
  if (s.indexOf('female') === 0 || s.indexOf('女') === 0 || s.indexOf('雌') === 0) return 'female';
  // 其余一切（other/unknown/mixed/null/不明/未分类等）归入异种
  return 'beast';
}
var 小说提取针对性方向 = '';
var 小说提取描述保存定时器 = null;
