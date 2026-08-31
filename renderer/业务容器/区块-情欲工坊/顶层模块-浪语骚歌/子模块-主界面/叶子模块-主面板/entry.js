// 情欲工坊 · 浪语骚歌（流行歌曲 + 民歌山歌 + 军旅战歌 + 儿歌童谣 + 鬼畜神曲 + 影视金曲 + 酒桌欢歌 + 颂歌圣咏 + 嘻哈说唱）
var 浪语骚歌标签页 = [
  { id: 'song', label: '🎤 流行歌曲' },
  { id: 'mg', label: '🎶 民歌山歌' },
  { id: 'jun', label: '📣 军旅战歌' },
  { id: 'ertong', label: '🧸 儿歌童谣' },
  { id: 'guichu', label: '🤖 鬼畜神曲' },
  { id: 'yingshi', label: '🎬 影视金曲' },
  { id: 'jiuzhuo', label: '🍻 酒桌欢歌' },
  { id: 'songge', label: '⛪ 颂歌圣咏' },
  { id: 'xiha', label: '🎙 嘻哈说唱' },
];
var langYuActiveTab = 'song';
var langYuApi = null;

function 浪语骚歌切换标签(tab) {
  langYuActiveTab = tab;
  var el = document.getElementById('lang-yu-sao-geContent');
  if (!el) return;
  if (!langYuApi) {
    langYuApi = 渲染标签栏(el, 浪语骚歌标签页, { active: tab, subId: 'langYuSubContent', onSwitch: function(t){ 浪语骚歌切换标签(t); } });
  } else {
    langYuApi.setActive(tab);
  }
  var subEl = langYuApi.sub;
  switch (tab) {
    case 'song': subEl.innerHTML = '<div id="pop-songContent"></div>'; 流行歌曲切换视图('list'); break;
    case 'mg': subEl.innerHTML = '<div id="min-ge-shan-geContent"></div>'; 民歌山歌切换视图('list'); break;
    case 'jun': subEl.innerHTML = '<div id="jun-lv-zhan-geContent"></div>'; 军旅战歌切换视图('list'); break;
    case 'ertong': subEl.innerHTML = '<div id="er-ge-tong-yaoContent"></div>'; 儿歌童谣切换视图('list'); break;
    case 'guichu': subEl.innerHTML = '<div id="gui-chu-shen-quContent"></div>'; 鬼畜神曲切换视图('list'); break;
    case 'yingshi': subEl.innerHTML = '<div id="ying-shi-jin-quContent"></div>'; 影视金曲切换视图('list'); break;
    case 'jiuzhuo': subEl.innerHTML = '<div id="jiu-zhuo-huan-geContent"></div>'; 酒桌欢歌切换视图('list'); break;
    case 'songge': subEl.innerHTML = '<div id="song-ge-sheng-yongContent"></div>'; 颂歌圣咏切换视图('list'); break;
    case 'xiha': subEl.innerHTML = '<div id="xi-ha-shuo-changContent"></div>'; 嘻哈说唱切换视图('list'); break;
  }
}

registerPageRoute('lang-yu-sao-ge', function(){ 浪语骚歌切换标签(langYuActiveTab); });
window.浪语骚歌切换标签 = 浪语骚歌切换标签;
