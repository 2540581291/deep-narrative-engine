// 深度-色欲世界 · 女性（female）角色档案渲染器
// 纯遍历式：14 个函数全部委托 renderContainer/renderStatsContainer

window.女性渲染身份 = function(c) {
  return renderContainer(c.identity, 'chF.identity');
};
window.女性渲染外貌 = function(c) {
  return renderContainer(c.appearance, 'chF.appearance');
};
window.女性渲染衣着 = function(c) {
  return renderContainer(c.attire, 'chF.attire');
};
window.女性渲染性器官 = function(c) {
  return renderContainer(c.sexOrgans, 'chF.sexOrgans');
};
window.女性渲染性能力 = function(c) {
  return renderContainer(c.sexualCapability, 'chF.sexualCapability');
};
window.女性渲染性历史 = function(c) {
  return renderContainer(c.sexualHistory, 'chF.sexualHistory');
};
window.女性渲染首次记录 = function(c) {
  return c.firstRecords ? renderContainer(c.firstRecords, 'chF.firstRecords') : '';
};
window.女性渲染性偏好 = function(c) {
  return renderContainer(c.sexualPreferences, 'chF.sexualPreferences');
};
window.女性渲染生殖健康 = function(c) {
  return renderContainer(c.reproductiveHealth, 'chF.reproductiveHealth');
};
window.女性渲染身体健康 = function(c) {
  return renderContainer(c.physicalHealth, 'chF.physicalHealth');
};
window.女性渲染性格言行 = function(c) {
  return renderContainer(c.personality, 'chF.personality');
};
window.女性渲染状态契约 = function(c) {
  return renderContainer(c.statusContract, 'chF.statusContract');
};
window.女性渲染属性 = function(c) {
  return renderStatsContainer(c.attributes, 'chF.attributes');
};
window.女性渲染后台 = function(c) {
  return renderContainer(c.meta, 'chF.meta');
};

// backward compat
window.femaleRenderIdentity = window.女性渲染身份;
window.femaleRenderAppearance = window.女性渲染外貌;
window.femaleRenderAttire = window.女性渲染衣着;
window.femaleRenderBody = window.女性渲染性器官;
window.femaleRenderAbility = window.女性渲染性能力;
window.femaleRenderHistory = window.女性渲染性历史;
window.femaleRenderFirstTimes = window.女性渲染首次记录;
window.femaleRenderPrefs = window.女性渲染性偏好;
window.femaleRenderReproductive = window.女性渲染生殖健康;
window.femaleRenderHealth = window.女性渲染身体健康;
window.femaleRenderPsychology = window.女性渲染性格言行;
window.femaleRenderStatus = window.女性渲染状态契约;
window.femaleRenderStats = window.女性渲染属性;
window.femaleRenderAdmin = window.女性渲染后台;
