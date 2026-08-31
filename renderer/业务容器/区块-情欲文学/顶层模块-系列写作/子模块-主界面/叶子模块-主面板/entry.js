// 情欲文学 · 系列写作（入口）
var 系列写作标签页 = [
  { id: 'list', label: '📋 系列列表' },
  { id: 'outline', label: '📖 系列大纲' },
  { id: 'writing', label: '✍️ 写作台' },
];
var swActiveTab = 'list';
var swActiveSeries = null;
var swApi = null;

function 系列写作切换标签(tab) {
  swActiveTab = tab;
  var el = document.getElementById('series-writingContent');
  if (!el) return;
  if (!swApi) {
    swApi = 渲染标签栏(el, 系列写作标签页, { active: tab, subId: 'swSubContent', onSwitch: function(t){ 系列写作切换标签(t); } });
  } else {
    swApi.setActive(tab);
  }
  var subEl = swApi.sub;
  switch (tab) {
    case 'list':    渲染系列写作列表(subEl); break;
    case 'outline': XL渲染大纲(subEl); break;
    case 'writing': renderSwWriting(subEl); break;
  }
}

Store.seriesWriting = createStore('seriesWriting');
registerPageRoute('series-writing', function() { 系列写作切换标签(swActiveTab); });
window.系列写作切换标签 = 系列写作切换标签;

window.swSwitchTab = window.系列写作切换标签;