// 情欲工坊 · 蒙学艳典（集部名篇 + 经部 + 史部 + 子部·诸子 + 兵书 + 笔记 + 医家 + 蒙学 的艳解戏仿）
var 蒙学艳典标签页 = [
  { id: 'jbmp', label: '🖋️ 集部名篇' },
  { id: 'jb', label: '📗 经部' },
  { id: 'sb', label: '📕 史部' },
  { id: 'zb', label: '📘 子部' },
  { id: 'bs', label: '🗡️ 兵书' },
  { id: 'bj', label: '📚 笔记' },
  { id: 'yj', label: '🏥 医家' },
  { id: 'mx', label: '🧒 蒙学' },
];
var mengXueActiveTab = 'jbmp';
var mengXueApi = null;

function 蒙学艳典切换标签(tab) {
  mengXueActiveTab = tab;
  var el = document.getElementById('meng-xue-yan-dianContent');
  if (!el) return;
  if (!mengXueApi) {
    mengXueApi = 渲染标签栏(el, 蒙学艳典标签页, { active: tab, subId: 'mengXueSubContent', onSwitch: function(t){ 蒙学艳典切换标签(t); } });
  } else {
    mengXueApi.setActive(tab);
  }
  var subEl = mengXueApi.sub;
  switch (tab) {
    case 'jbmp': subEl.innerHTML = '<div id="ji-bu-ming-pianContent"></div>'; 集部名篇切换视图('list'); break;
    case 'jb': subEl.innerHTML = '<div id="jing-buContent"></div>'; 经部切换视图('list'); break;
    case 'sb': subEl.innerHTML = '<div id="shi-buContent"></div>'; 史部切换视图('list'); break;
    case 'zb': subEl.innerHTML = '<div id="zi-buContent"></div>'; 子部切换视图('list'); break;
    case 'bs': subEl.innerHTML = '<div id="bing-shuContent"></div>'; 兵书切换视图('list'); break;
    case 'bj': subEl.innerHTML = '<div id="bi-jiContent"></div>'; 笔记切换视图('list'); break;
    case 'yj': subEl.innerHTML = '<div id="yi-jiaContent"></div>'; 医家切换视图('list'); break;
    case 'mx': subEl.innerHTML = '<div id="meng-xueContent"></div>'; 蒙学切换视图('list'); break;
  }
}

registerPageRoute('meng-xue-yan-dian', function(){ 蒙学艳典切换标签(mengXueActiveTab); });
window.蒙学艳典切换标签 = 蒙学艳典切换标签;
