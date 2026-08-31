// 深度-色欲世界 · 扶她（futa）角色档案渲染器
// 纯遍历式：14 个函数全部委托 renderContainer/renderStatsContainer

window.扶她渲染身份 = function(c) {
  return renderContainer(c.identity, 'chFT.identity');
};
window.扶她渲染外貌 = function(c) {
  return renderContainer(c.appearance, 'chFT.appearance');
};
window.扶她渲染衣着 = function(c) {
  return renderContainer(c.attire, 'chFT.attire');
};
window.扶她渲染性器官 = function(c) {
  return renderContainer(c.sexOrgans, 'chFT.sexOrgans');
};
window.扶她渲染性能力 = function(c) {
  return renderContainer(c.sexualCapability, 'chFT.sexualCapability');
};
window.扶她渲染性历史 = function(c) {
  return renderContainer(c.sexualHistory, 'chFT.sexualHistory');
};
window.扶她渲染首次记录 = function(c) {
  return c.firstRecords ? renderContainer(c.firstRecords, 'chFT.firstRecords') : '';
};
window.扶她渲染性偏好 = function(c) {
  return renderContainer(c.sexualPreferences, 'chFT.sexualPreferences');
};
window.扶她渲染生殖健康 = function(c) {
  return renderContainer(c.reproductiveHealth, 'chFT.reproductiveHealth');
};
window.扶她渲染身体健康 = function(c) {
  return renderContainer(c.physicalHealth, 'chFT.physicalHealth');
};
window.扶她渲染性格言行 = function(c) {
  return renderContainer(c.personality, 'chFT.personality');
};
window.扶她渲染状态契约 = function(c) {
  return renderContainer(c.statusContract, 'chFT.statusContract');
};
window.扶她渲染属性 = function(c) {
  return renderStatsContainer(c.attributes, 'chFT.attributes');
};
window.扶她渲染后台 = function(c) {
  return renderContainer(c.meta, 'chFT.meta');
};

// backward compat
window.futaRenderIdentity = window.扶她渲染身份;
window.futaRenderAppearance = window.扶她渲染外貌;
window.futaRenderAttire = window.扶她渲染衣着;
window.futaRenderBody = window.扶她渲染性器官;
window.futaRenderAbility = window.扶她渲染性能力;
window.futaRenderHistory = window.扶她渲染性历史;
window.futaRenderFirstTimes = window.扶她渲染首次记录;
window.futaRenderPrefs = window.扶她渲染性偏好;
window.futaRenderReproductive = window.扶她渲染生殖健康;
window.futaRenderHealth = window.扶她渲染身体健康;
window.futaRenderPsychology = window.扶她渲染性格言行;
window.futaRenderStatus = window.扶她渲染状态契约;
window.futaRenderStats = window.扶她渲染属性;
window.futaRenderAdmin = window.扶她渲染后台;
