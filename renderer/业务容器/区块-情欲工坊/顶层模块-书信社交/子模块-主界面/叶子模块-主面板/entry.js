// 情欲工坊 · 书信社交（书信 + 便条 + 聊天记录 + 社交动态）
var 书信社交标签页 = [
  { id: 'letter', label: '✉️ 书信' },
  { id: 'note', label: '📝 便条' },
  { id: 'chatlog', label: '💬 聊天记录' },
  { id: 'social', label: '📱 社交动态' },
];
var letterSocialActiveTab = 'letter';
var letterSocialApi = null;

function 书信社交切换标签(tab) {
  letterSocialActiveTab = tab;
  var el = document.getElementById('letter-socialContent');
  if (!el) return;
  if (!letterSocialApi) {
    letterSocialApi = 渲染标签栏(el, 书信社交标签页, { active: tab, subId: 'letterSocialSubContent', onSwitch: function(t){ 书信社交切换标签(t); } });
  } else {
    letterSocialApi.setActive(tab);
  }
  var subEl = letterSocialApi.sub;
  switch (tab) {
    case 'letter':  subEl.innerHTML = '<div id="letterContent"></div>';        书信切换视图('list'); break;
    case 'note':    subEl.innerHTML = '<div id="noteContent"></div>';          便条切换视图('list'); break;
    case 'chatlog': subEl.innerHTML = '<div id="chatLogContent"></div>';       聊天记录切换视图('list'); break;
    case 'social':  subEl.innerHTML = '<div id="socialPostContent"></div>';    社交动态切换视图('list'); break;
  }
}

registerPageRoute('letter-social', function(){ 书信社交切换标签(letterSocialActiveTab); });
window.书信社交切换标签 = 书信社交切换标签;
window.letterSocialSwitchTab = 书信社交切换标签;
