// 情色杂物 · 记录文书（性奴契约 + 调教计划 + 反差婊的自我养成 + 伪娘的自我养成 + 奖惩台账 + 性癖档案 + 绿奴契约 + 淫妻契约 + 宠物契约 + 厕奴契约）
var 记录文书标签页 = [
  { id: 'contract', label: '📜 性奴契约' },
  { id: 'training', label: '🗓️ 调教计划' },
  { id: 'reverse', label: '🔁 反差婊的自我养成' },
  { id: 'femboy', label: '🌸 伪娘的自我养成' },
  { id: 'reward', label: '🏆 奖惩台账' },
  { id: 'profile', label: '🗂️ 性癖档案' },
  { id: 'cuckold', label: '💚 绿奴契约' },
  { id: 'hotwife', label: '🔥 淫妻契约' },
  { id: 'pet', label: '🐶 宠物契约' },
  { id: 'toilet', label: '🚽 厕奴契约' },
];
var docActiveTab = 'contract';
var docApi = null;

function 记录文书切换标签(tab) {
  docActiveTab = tab;
  var el = document.getElementById('erotica-docContent');
  if (!el) return;
  if (!docApi) {
    docApi = 渲染标签栏(el, 记录文书标签页, { active: tab, subId: 'docSubContent', onSwitch: function(t){ 记录文书切换标签(t); } });
  } else {
    docApi.setActive(tab);
  }
  var subEl = docApi.sub;
  switch (tab) {
    case 'contract': subEl.innerHTML = '<div id="doc-contractContent"></div>'; 性奴契约切换视图('list'); break;
    case 'training': subEl.innerHTML = '<div id="doc-planContent"></div>'; 调教入口(); break;
    case 'reverse':  subEl.innerHTML = '<div id="doc-reverseContent"></div>'; 反差表切换视图('list'); break;
    case 'femboy':   subEl.innerHTML = '<div id="doc-femboyContent"></div>'; 伪娘契约切换视图('list'); break;
    case 'reward':   subEl.innerHTML = '<div id="doc-rewardContent"></div>'; 奖惩台账切换视图('list'); break;
    case 'profile':  subEl.innerHTML = '<div id="doc-profileContent"></div>'; 性癖档案切换视图('list'); break;
    case 'cuckold':  subEl.innerHTML = '<div id="doc-cuckoldContent"></div>'; 绿奴契约切换视图('list'); break;
    case 'hotwife':  subEl.innerHTML = '<div id="doc-hotwifeContent"></div>'; 淫妻契约切换视图('list'); break;
    case 'pet':      subEl.innerHTML = '<div id="doc-petContent"></div>'; 宠物契约切换视图('list'); break;
    case 'toilet':   subEl.innerHTML = '<div id="doc-toiletContent"></div>'; 厕奴契约切换视图('list'); break;
  }
}

registerPageRoute('erotica-doc', function(){ 记录文书切换标签(docActiveTab); });
window.记录文书切换标签 = 记录文书切换标签;
