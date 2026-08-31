// 情欲工坊 · 锦绣文章（议论文 + 记叙文 + 游记文 + 辞赋文）
var 锦绣文章标签页 = [
  { id: 'yi-lun', label: '📜 议论文' },
  { id: 'ji-xu', label: '📖 记叙文' },
  { id: 'you-ji', label: '🗺️ 游记文' },
  { id: 'ci-fu', label: '🖋️ 辞赋文' },
];
var jinXiuWenZhangActiveTab = 'yi-lun';
var jinXiuWenZhangApi = null;

function 锦绣文章切换标签(tab) {
  jinXiuWenZhangActiveTab = tab;
  var el = document.getElementById('jin-xiu-wen-zhangContent');
  if (!el) return;
  if (!jinXiuWenZhangApi) {
    jinXiuWenZhangApi = 渲染标签栏(el, 锦绣文章标签页, { active: tab, subId: 'jinXiuWenZhangSubContent', onSwitch: function(t){ 锦绣文章切换标签(t); } });
  } else {
    jinXiuWenZhangApi.setActive(tab);
  }
  var subEl = jinXiuWenZhangApi.sub;
  switch (tab) {
    case 'yi-lun': subEl.innerHTML = '<div id="yiLunWenContent"></div>'; 议论文切换视图('list'); break;
    case 'ji-xu':  subEl.innerHTML = '<div id="jiXuWenContent"></div>'; 记叙文切换视图('list'); break;
    case 'you-ji': subEl.innerHTML = '<div id="youJiWenContent"></div>'; 游记文切换视图('list'); break;
    case 'ci-fu':  subEl.innerHTML = '<div id="ciFuWenContent"></div>'; 辞赋文切换视图('list'); break;
  }
}

registerPageRoute('jin-xiu-wen-zhang', function(){ 锦绣文章切换标签(jinXiuWenZhangActiveTab); });
window.锦绣文章切换标签 = 锦绣文章切换标签;
