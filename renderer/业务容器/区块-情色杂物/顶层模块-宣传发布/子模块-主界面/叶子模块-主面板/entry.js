// 情色杂物 · 宣传发布（传单 + 广告 + 海报 + 邀请函）
var 宣传发布标签页 = [
  { id: 'flyer', label: '🎪 传单' },
  { id: 'ad', label: '📢 广告' },
  { id: 'poster', label: '🖼️ 海报' },
  { id: 'invitation', label: '💌 邀请函' },
];
var pubActiveTab = 'flyer';
var pubApi = null;

// 各子模块对应：容器 id + 视图切换函数 + 默认视图
var 宣传发布子模块映射 = {
  flyer:      { contentId: 'pub-flyerContent',      switchFn: '宣传传单切换视图' },
  ad:         { contentId: 'pub-adContent',         switchFn: '宣传广告切换视图' },
  poster:     { contentId: 'pub-posterContent',     switchFn: '宣传海报切换视图' },
  invitation: { contentId: 'pub-invitationContent', switchFn: '宣传邀请函切换视图' },
};

function pubSwitchTab(tab) {
  pubActiveTab = tab;
  var el = document.getElementById('erotica-pubContent');
  if (!el) return;
  if (!pubApi) {
    pubApi = 渲染标签栏(el, 宣传发布标签页, { active: tab, subId: 'pubSubContent', onSwitch: function(t){ pubSwitchTab(t); } });
  } else {
    pubApi.setActive(tab);
  }
  var subEl = pubApi.sub;
  if (!subEl) return;
  var m = 宣传发布子模块映射[tab];
  if (!m) return;
  subEl.innerHTML = '<div id="' + m.contentId + '"></div>';
  if (typeof window[m.switchFn] === 'function') window[m.switchFn]('list');
  else 渲染宣传缺模块提示(subEl, m);
}

function 渲染宣传缺模块提示(el, m) {
  el.innerHTML = '<div class="n-card p-10"><div class="text-sm text-muted">该宣传模块尚未加载，请检查脚本加载顺序。模块：' + escHtml(m.contentId) + '</div></div>';
}

registerPageRoute('erotica-pub', function(){ pubSwitchTab(pubActiveTab); });
window.pubSwitchTab = pubSwitchTab;
