// 情欲工坊 · 性爱台本（台本 + 戏曲唱段 + 调教对白 + 暧昧对白 + 直播对白 + 相声 + 快板）
var 性爱台本标签页 = [
  { id: 'script', label: '📜 台本' },
  { id: 'xiqu', label: '🎭 戏曲唱段' },
  { id: 'tiaojiao', label: '⛓️ 调教对白' },
  { id: 'aimei', label: '💞 暧昧对白' },
  { id: 'zhibo', label: '📡 直播对白' },
  { id: 'xiangsheng', label: '🎤 相声' },
  { id: 'kuaiban', label: '🥁 快板' },
];
var sexScriptActiveTab = 'script';
var sexScriptApi = null;

function 性爱台本切换标签(tab) {
  sexScriptActiveTab = tab;
  var el = document.getElementById('sex-scriptContent');
  if (!el) return;
  if (!sexScriptApi) {
    sexScriptApi = 渲染标签栏(el, 性爱台本标签页, { active: tab, subId: 'sexScriptSubContent', onSwitch: function(t){ 性爱台本切换标签(t); } });
  } else {
    sexScriptApi.setActive(tab);
  }
  var subEl = sexScriptApi.sub;
  switch (tab) {
    case 'script': subEl.innerHTML = '<div id="scriptContent"></div>'; 性爱台本切换视图('list'); break;
    case 'xiqu': subEl.innerHTML = '<div id="xi-qu-chang-duanContent"></div>'; 戏曲唱段切换视图('list'); break;
    case 'tiaojiao': subEl.innerHTML = '<div id="tiao-jiao-dui-baiContent"></div>'; 调教对白切换视图('list'); break;
    case 'aimei': subEl.innerHTML = '<div id="ai-mei-dui-baiContent"></div>'; 暧昧对白切换视图('list'); break;
    case 'zhibo': subEl.innerHTML = '<div id="zhi-bo-dui-baiContent"></div>'; 直播对白切换视图('list'); break;
    case 'xiangsheng': subEl.innerHTML = '<div id="xiang-shengContent"></div>'; 相声切换视图('list'); break;
    case 'kuaiban': subEl.innerHTML = '<div id="kuai-banContent"></div>'; 快板切换视图('list'); break;
  }
}

registerPageRoute('sex-script', function(){ 性爱台本切换标签(sexScriptActiveTab); });
window.性爱台本切换标签 = 性爱台本切换标签;