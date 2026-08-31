// 情欲工坊 · 淫诗艳曲（淫诗 + 古体诗 + 浪词 + 艳曲 + 近代诗 + 现代诗 + 打油诗 + 俳句）
var 淫诗艳曲标签页 = [
  { id: 'free', label: '📖 淫诗' },
  { id: 'guti', label: '🏛️ 古体诗' },
  { id: 'ci', label: '📜 浪词' },
  { id: 'qu', label: '🎶 艳曲' },
  { id: 'jindai', label: '🏮 近代诗' },
  { id: 'modern', label: '✨ 现代诗' },
  { id: 'dirty', label: '🎭 打油诗' },
  { id: 'haiku', label: '🍃 俳句' },
];
var yinShiActiveTab = 'free';
var yinShiApi = null;

function 淫诗艳曲切换标签(tab) {
  yinShiActiveTab = tab;
  var el = document.getElementById('yin-shi-yan-quContent');
  if (!el) return;
  if (!yinShiApi) {
    yinShiApi = 渲染标签栏(el, 淫诗艳曲标签页, { active: tab, subId: 'yinShiSubContent', onSwitch: function(t){ 淫诗艳曲切换标签(t); } });
  } else {
    yinShiApi.setActive(tab);
  }
  var subEl = yinShiApi.sub;
  switch (tab) {
    case 'free':   subEl.innerHTML = '<div id="poetryContent"></div>'; 淫诗切换视图('list'); break;
    case 'guti':   subEl.innerHTML = '<div id="gu-ti-shiContent"></div>'; 古体诗切换视图('list'); break;
    case 'ci':     subEl.innerHTML = '<div id="yin-ciContent"></div>'; 词切换视图('list'); break;
    case 'qu':     subEl.innerHTML = '<div id="yin-quContent"></div>'; 曲切换视图('list'); break;
    case 'jindai': subEl.innerHTML = '<div id="jindai-poetryContent"></div>'; 近代诗切换视图('list'); break;
    case 'modern': subEl.innerHTML = '<div id="modern-poetryContent"></div>'; 现代诗切换视图('list'); break;
    case 'dirty':  subEl.innerHTML = '<div id="dirty-poetryContent"></div>'; 打油诗切换视图('list'); break;
    case 'haiku':  subEl.innerHTML = '<div id="erotic-haikuContent"></div>'; 俳句切换视图('list'); break;
  }
}

registerPageRoute('yin-shi-yan-qu', function(){ 淫诗艳曲切换标签(yinShiActiveTab); });
window.淫诗艳曲切换标签 = 淫诗艳曲切换标签;
