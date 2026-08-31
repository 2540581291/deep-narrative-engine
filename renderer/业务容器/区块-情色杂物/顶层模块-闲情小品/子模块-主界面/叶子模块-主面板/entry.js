// 情色杂物 · 闲情小品（段子 + 谜语 + 歇后语 + 对联）
var 闲情小品标签页 = [
  { id: 'joke', label: '😂 段子' },
  { id: 'riddle', label: '🔮 谜语' },
  { id: 'proverb', label: '🀄 歇后语' },
  { id: 'couplet', label: '🏮 对联' },
];
var flashActiveTab = 'joke';
var flashApi = null;

function 闲情小品切换标签(tab) {
  flashActiveTab = tab;
  var el = document.getElementById('flashContent');
  if (!el) return;
  if (!flashApi) {
    flashApi = 渲染标签栏(el, 闲情小品标签页, { active: tab, subId: 'flashSubContent', onSwitch: function(t){ 闲情小品切换标签(t); } });
  } else {
    flashApi.setActive(tab);
  }
  var subEl = flashApi.sub;
  switch (tab) {
    case 'joke':    subEl.innerHTML = '<div id="comedyContent"></div>';           段子切换视图('list'); break;
    case 'riddle':  subEl.innerHTML = '<div id="erotic-riddleContent"></div>';    谜语切换视图('list'); break;
    case 'proverb': subEl.innerHTML = '<div id="eroticProverbContent"></div>';    歇后语切换视图('list'); break;
    case 'couplet': subEl.innerHTML = '<div id="eroticCoupletContent"></div>';    对联切换视图('list'); break;
  }
}

registerPageRoute('flash', function(){ 闲情小品切换标签(flashActiveTab); });
window.闲情小品切换标签 = 闲情小品切换标签;

window.flashSwitchTab = window.闲情小品切换标签;
