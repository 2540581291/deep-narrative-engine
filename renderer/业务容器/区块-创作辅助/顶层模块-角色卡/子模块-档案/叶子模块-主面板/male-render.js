// 深度-色欲世界 · 男性（male）角色档案渲染器
// 纯遍历式：14 个函数全部委托 renderContainer/renderStatsContainer

window.男性渲染身份 = function(c) {
  return renderContainer(c.identity, 'chM.identity');
};
window.男性渲染外貌 = function(c) {
  return renderContainer(c.appearance, 'chM.appearance');
};
window.男性渲染衣着 = function(c) {
  return renderContainer(c.attire, 'chM.attire');
};
window.男性渲染性器官 = function(c) {
  return renderContainer(c.sexOrgans, 'chM.sexOrgans');
};
window.男性渲染性能力 = function(c) {
  return renderContainer(c.sexualCapability, 'chM.sexualCapability');
};
window.男性渲染性历史 = function(c) {
  return renderContainer(c.sexualHistory, 'chM.sexualHistory');
};
window.男性渲染首次记录 = function(c) {
  return c.firstRecords ? renderContainer(c.firstRecords, 'chM.firstRecords') : '';
};
window.男性渲染性偏好 = function(c) {
  return renderContainer(c.sexualPreferences, 'chM.sexualPreferences');
};
window.男性渲染生殖健康 = function(c) {
  return renderContainer(c.reproductiveHealth, 'chM.reproductiveHealth');
};
window.男性渲染身体健康 = function(c) {
  return renderContainer(c.physicalHealth, 'chM.physicalHealth');
};
window.男性渲染性格言行 = function(c) {
  return renderContainer(c.personality, 'chM.personality');
};
window.男性渲染状态契约 = function(c) {
  return renderContainer(c.statusContract, 'chM.statusContract');
};
window.男性渲染属性 = function(c) {
  return renderStatsContainer(c.attributes, 'chM.attributes');
};
window.男性渲染后台 = function(c) {
  return renderContainer(c.meta, 'chM.meta');
};

// backward compat
window.maleRenderIdentity = window.男性渲染身份;
window.maleRenderAppearance = window.男性渲染外貌;
window.maleRenderAttire = window.男性渲染衣着;
window.maleRenderBody = window.男性渲染性器官;
window.maleRenderAbility = window.男性渲染性能力;
window.maleRenderHistory = window.男性渲染性历史;
window.maleRenderFirstTimes = window.男性渲染首次记录;
window.maleRenderPrefs = window.男性渲染性偏好;
window.maleRenderReproductive = window.男性渲染生殖健康;
window.maleRenderHealth = window.男性渲染身体健康;
window.maleRenderPsychology = window.男性渲染性格言行;
window.maleRenderStatus = window.男性渲染状态契约;
window.maleRenderStats = window.男性渲染属性;
window.maleRenderAdmin = window.男性渲染后台;
