// 生图识图 · 状态与配置

// ===== 导航配置 =====
var 辅助导航 = [
  { id: 'recognition', label: '识图' },
  { id: 't2i', label: '文生图' },
  { id: 'i2i', label: '图生图' },
];
var 当前辅助视图 = 'recognition';

// ===== 状态 =====
var T2I = { model: null, prompt: '', negativePrompt: '', width: 1024, height: 1024, results: [], taskId: null, status: 'idle', statusText: '就绪' };
var I2I = { model: null, prompt: '', negativePrompt: '', width: 1024, height: 1024, imageUrl: '', results: [], taskId: null, status: 'idle', statusText: '就绪' };
var REC = { imageUrls: [], prompt: '', result: '', status: 'idle' };
// 兼容旧版单图存储
if (REC.imageUrl && !REC.imageUrls.length) { REC.imageUrls = [REC.imageUrl]; REC.imageUrl = ''; }

// ===== 配置获取 =====
function 生图识图获取配置Id() {
  return (S.settings.moduleModels && S.settings.moduleModels.aids) || '';
}
