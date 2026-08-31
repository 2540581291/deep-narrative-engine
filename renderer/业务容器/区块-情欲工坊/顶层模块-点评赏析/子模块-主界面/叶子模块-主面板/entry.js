// 情欲工坊 · 点评赏析 · 主界面（Tab 壳：评价赏析 / 喷子 / 水军）
// 三种点评方向各自一个类型模块（见 子模块-评价赏析 / 子模块-喷子 / 子模块-水军），
// 各自实现列表与创作界面；本文件只声明标签页并调度到对应类型的「切换视图」。

var 点评赏析标签页 = [
  { id: 'appreciate', label: '🌟 评价赏析', container: 'dianPingAppContent', win: '评价赏析' },
  { id: 'troll',      label: '🗯 喷子',       container: 'dianPingTrollContent', win: '喷子' },
  { id: 'shill',      label: '🎉 水军',       container: 'dianPingShillContent', win: '水军' },
];
var 点评赏析当前标签 = 'appreciate';
var 点评赏析Api = null;

// 三种方向共用统一存储（dianPingShangXi）
Store.dianPingShangXi = createStore('dianPingShangXi');

function 点评赏析切换标签(tab) {
  点评赏析当前标签 = tab;
  var el = document.getElementById('dian-ping-shang-xiContent');
  if (!el) return;
  var t = null;
  点评赏析标签页.forEach(function(x) { if (x.id === tab) t = x; });
  if (!t) t = 点评赏析标签页[0];
  if (!点评赏析Api) {
    点评赏析Api = 渲染标签栏(el, 点评赏析标签页, { active: tab, subId: 'dianPingTabContent', onSwitch: function(t){ 点评赏析切换标签(t); } });
  } else {
    点评赏析Api.setActive(tab);
  }
  var subEl = 点评赏析Api.sub;
  subEl.innerHTML = '<div id="' + t.container + '"></div>';
  if (window[t.win + '切换视图']) window[t.win + '切换视图']('list');
}

registerPageRoute('dian-ping-shang-xi', function() { 点评赏析切换标签(点评赏析当前标签); });
window.点评赏析切换标签 = 点评赏析切换标签;
