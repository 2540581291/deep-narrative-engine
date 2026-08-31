// 深度-色欲世界 · 伪娘（femboy）角色档案渲染器
// 纯遍历式：14 个函数全部委托 renderContainer/renderStatsContainer

window.伪娘渲染身份 = function(c) {
  return renderContainer(c.identity, 'chFB.identity');
};
window.伪娘渲染外貌 = function(c) {
  return renderContainer(c.appearance, 'chFB.appearance');
};
window.伪娘渲染衣着 = function(c) {
  return renderContainer(c.attire, 'chFB.attire');
};
window.伪娘渲染性器官 = function(c) {
  return renderContainer(c.sexOrgans, 'chFB.sexOrgans');
};
window.伪娘渲染性能力 = function(c) {
  return renderContainer(c.sexualCapability, 'chFB.sexualCapability');
};
window.伪娘渲染性历史 = function(c) {
  return renderContainer(c.sexualHistory, 'chFB.sexualHistory');
};
window.伪娘渲染首次记录 = function(c) {
  return c.firstRecords ? renderContainer(c.firstRecords, 'chFB.firstRecords') : '';
};
window.伪娘渲染性偏好 = function(c) {
  return renderContainer(c.sexualPreferences, 'chFB.sexualPreferences');
};
window.伪娘渲染生殖健康 = function(c) {
  return renderContainer(c.reproductiveHealth, 'chFB.reproductiveHealth');
};
window.伪娘渲染身体健康 = function(c) {
  return renderContainer(c.physicalHealth, 'chFB.physicalHealth');
};
window.伪娘渲染性格言行 = function(c) {
  return renderContainer(c.personality, 'chFB.personality');
};
window.伪娘渲染状态契约 = function(c) {
  return renderContainer(c.statusContract, 'chFB.statusContract');
};
window.伪娘渲染属性 = function(c) {
  return renderStatsContainer(c.attributes, 'chFB.attributes');
};
window.伪娘渲染后台 = function(c) {
  return renderContainer(c.meta, 'chFB.meta');
};

// backward compat
window.femboyRenderIdentity = window.伪娘渲染身份;
window.femboyRenderAppearance = window.伪娘渲染外貌;
window.femboyRenderAttire = window.伪娘渲染衣着;
window.femboyRenderBody = window.伪娘渲染性器官;
window.femboyRenderAbility = window.伪娘渲染性能力;
window.femboyRenderHistory = window.伪娘渲染性历史;
window.femboyRenderFirstTimes = window.伪娘渲染首次记录;
window.femboyRenderPrefs = window.伪娘渲染性偏好;
window.femboyRenderReproductive = window.伪娘渲染生殖健康;
window.femboyRenderHealth = window.伪娘渲染身体健康;
window.femboyRenderPsychology = window.伪娘渲染性格言行;
window.femboyRenderStatus = window.伪娘渲染状态契约;
window.femboyRenderStats = window.伪娘渲染属性;
window.femboyRenderAdmin = window.伪娘渲染后台;
