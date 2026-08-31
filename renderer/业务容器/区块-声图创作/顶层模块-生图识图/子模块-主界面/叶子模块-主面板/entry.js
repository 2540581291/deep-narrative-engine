// 生图识图 · 主界面入口

var aidsApi = null;

// 第一层功能导航（芯片，icon + label）
var 辅助导航芯片 = 辅助导航.map(function(v) {
  var icon = { recognition: '🔍', t2i: '✍️', i2i: '🖼️' }[v.id] || '▪';
  return { id: v.id, label: icon + ' ' + v.label };
});

function 切换辅助视图(view) {
  当前辅助视图 = view;
  var el = document.getElementById('aidsContent');
  if (!el) return;
  // 第一层：芯片标签栏
  if (!aidsApi) {
    aidsApi = 渲染标签栏(el, 辅助导航芯片, { active: view, subId: 'aidsViewContent', onSwitch: function(v) { 切换辅助视图(v); } });
  } else {
    aidsApi.setActive(view);
  }
  // （模块级快捷模型选择已移除，统一走全局模型切换器）
  // 渲染当前视图内容进 子容器（sub）
  var vEl = aidsApi.sub;
  if (!vEl) return;
  if (view === 't2i') renderT2I(vEl);
  else if (view === 'i2i') renderI2I(vEl);
  else if (view === 'recognition') renderRecognition(vEl);

  // 异步加载历史生成结果（仅首次）
  loadStoredResults();
}

// ===== 初始化 =====
Store.aids = createStore('aids');
registerPageRoute('aids', function(e) { 切换辅助视图(当前辅助视图); });
window.切换辅助视图 = 切换辅助视图;
window.生图识图获取配置Id = 生图识图获取配置Id;

// backward compat
window.aidsSwitchView = window.切换辅助视图;

// window exports
window.renderT2I = renderT2I;
window.onT2IGenerate = onT2IGenerate;
window.onT2ICancel = onT2ICancel;
window.onT2IClear = onT2IClear;
window.renderI2I = renderI2I;
window.onI2IGenerate = onI2IGenerate;
window.onI2ICancel = onI2ICancel;
window.onI2IClear = onI2IClear;
window.renderRecognition = renderRecognition;
window.onRecognitionAnalyze = onRecognitionAnalyze;
window.onRecognitionClear = onRecognitionClear;
window.removeRecImage = removeRecImage;
window.openImagePreview = openImagePreview;
window.openImageResult = openImageResult;
