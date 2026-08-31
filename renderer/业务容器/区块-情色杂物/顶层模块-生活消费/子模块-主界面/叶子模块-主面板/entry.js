// 情色杂物 · 生活消费（吃喝 + 穿戴 + 居家 + 情趣 + 玩乐）
var 生活消费标签页 = [
  { id: 'food', label: '🍽️ 吃喝' },
  { id: 'wear', label: '👗 穿戴' },
  { id: 'home', label: '🏠 居家' },
  { id: 'kink', label: '🧸 情趣' },
  { id: 'play', label: '🎮 玩乐' },
];
var lifeActiveTab = 'food';
var lifeApi = null;

function 生活消费切换标签(tab) {
  lifeActiveTab = tab;
  var el = document.getElementById('erotica-lifeContent');
  if (!el) return;
  if (!lifeApi) {
    lifeApi = 渲染标签栏(el, 生活消费标签页, { active: tab, subId: 'lifeSubContent', onSwitch: function(t){ 生活消费切换标签(t); } });
  } else {
    lifeApi.setActive(tab);
  }
  var subEl = lifeApi.sub;
  switch (tab) {
    case 'food': subEl.innerHTML = '<div id="life-foodContent"></div>'; 吃喝切换视图('list'); break;
    case 'wear': subEl.innerHTML = '<div id="life-wearContent"></div>'; 穿戴切换视图('list'); break;
    case 'home': subEl.innerHTML = '<div id="life-homeContent"></div>'; 居家切换视图('list'); break;
    case 'kink': subEl.innerHTML = '<div id="life-kinkContent"></div>'; 情趣切换视图('list'); break;
    case 'play': subEl.innerHTML = '<div id="life-playContent"></div>'; 玩乐切换视图('list'); break;
  }
}

registerPageRoute('erotica-life', function(){ 生活消费切换标签(lifeActiveTab); });
window.生活消费切换标签 = 生活消费切换标签;
window.lifeSwitchTab = 生活消费切换标签;
