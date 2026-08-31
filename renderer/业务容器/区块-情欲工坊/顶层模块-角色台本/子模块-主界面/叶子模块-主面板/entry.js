// 情欲工坊 · 角色台本（自述 + 诵读 + 经历 + 关系对话 + 辱骂 · 以角色卡角色为核心）
var 角色台本标签页 = [
  { id: 'monologue', label: '🎙 自述' },
  { id: 'recite', label: '📢 诵读' },
  { id: 'experience', label: '🗂 经历' },
  { id: 'relation', label: '💬 关系对话' },
  { id: 'insult', label: '🗯 辱骂' },
];
var roleScriptActiveTab = 'monologue';
var roleScriptApi = null;

function 角色台本切换标签(tab) {
  roleScriptActiveTab = tab;
  var el = document.getElementById('role-scriptContent');
  if (!el) return;
  if (!roleScriptApi) {
    roleScriptApi = 渲染标签栏(el, 角色台本标签页, { active: tab, subId: 'roleScriptSubContent', onSwitch: function(t){ 角色台本切换标签(t); } });
  } else {
    roleScriptApi.setActive(tab);
  }
  var subEl = roleScriptApi.sub;
  switch (tab) {
    case 'monologue': subEl.innerHTML = '<div id="roleMonologueContent"></div>'; 角色自述切换视图('list'); break;
    case 'recite': subEl.innerHTML = '<div id="roleReciteContent"></div>'; 角色诵读切换视图('list'); break;
    case 'experience': subEl.innerHTML = '<div id="roleExperienceContent"></div>'; 角色经历切换视图('list'); break;
    case 'relation': subEl.innerHTML = '<div id="roleRelationContent"></div>'; 角色关系对话切换视图('list'); break;
    case 'insult': subEl.innerHTML = '<div id="roleInsultContent"></div>'; 角色辱骂切换视图('list'); break;
  }
}

registerPageRoute('role-script', function(){ 角色台本切换标签(roleScriptActiveTab); });
window.角色台本切换标签 = 角色台本切换标签;
