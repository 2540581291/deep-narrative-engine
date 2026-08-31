// 情欲工坊 · 文学改编（童话改编 + 历史改编 + 神话改编 + 名著改编 + 寓言改编）
// 标签壳：切换到某类型即调用该类型工厂的 切换视图('list')
var 文学改编标签页 = [
  { id: 'fairy', label: '\u{1F9DA} 童话改编' },
  { id: 'history', label: '\u{1F4DC} 历史改编' },
  { id: 'myth', label: '\u{1F3DB}\uFE0F 神话改编' },
  { id: 'classic', label: '\u{1F4DA} 名著改编' },
  { id: 'fable', label: '\u{1F98A} 寓言改编' },
];
var wxgbActiveTab = 'fairy';
var wxgbApi = null;
var wxgbTabIdMap = { fairy: '童话改编', history: '历史改编', myth: '神话改编', classic: '名著改编', fable: '寓言改编' };
var wxgbContainerMap = {
  fairy: 'erotic-fairy-taleContent',
  history: 'historyAdaptContent',
  myth: 'mythAdaptContent',
  classic: 'classicAdaptContent',
  fable: 'fableAdaptContent',
};

function 文学改编切换标签(tab) {
  wxgbActiveTab = tab;
  var el = document.getElementById('wen-xue-gai-bianContent');
  if (!el) return;
  if (!wxgbApi) {
    wxgbApi = 渲染标签栏(el, 文学改编标签页, { active: tab, subId: 'wxgbSubContent', onSwitch: function(t){ 文学改编切换标签(t); } });
  } else {
    wxgbApi.setActive(tab);
  }
  var subEl = wxgbApi.sub;
  var 类型名 = wxgbTabIdMap[tab];
  subEl.innerHTML = '<div id="' + wxgbContainerMap[tab] + '"></div>';
  if (window[类型名 + '切换视图']) window[类型名 + '切换视图']('list');
}
registerPageRoute('wen-xue-gai-bian', function() { 文学改编切换标签(wxgbActiveTab); });
window.文学改编切换标签 = 文学改编切换标签;
window.wxgbSwitchTab = window.文学改编切换标签;
