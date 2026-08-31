// 情欲文学 · 情色短章模块
var 短章导航 = [
  { id: 'list', label: '📋 作品列表' },
  { id: 'outline', label: '📐 大纲规划' },
  { id: 'writing', label: '📝 写作台' },
];
var 短章当前视图 = 'list';
var vignetteCurrentTitle = null;

var 短章Api = null;

function 短章切换视图(view) {
  // 如果切换到写作，但没有选择作品，自动切换到列表
  if (view === 'writing' && !vignetteCurrentTitle) {
    view = 'list';
  }
  短章当前视图 = view;
  var el = document.getElementById('vignetteContent');
  if (!el) return;
  if (!短章Api) {
    短章Api = 渲染标签栏(el, 短章导航, { active: view, subId: 'vignetteViewContent', onSwitch: function(v){ 短章切换视图(v); } });
  } else {
    短章Api.setActive(view);
  }
  var vEl = 短章Api.sub;
  switch (view) {
    case 'list':        typeof 渲染短章列表 === 'function' ? 渲染短章列表(vEl) : vEl.innerHTML = '<div class="placeholder-text">加载中...</div>'; break;
    case 'outline':     typeof window.renderVignetteOutline === 'function' ? window.renderVignetteOutline(vEl) : vEl.innerHTML = '<div class="placeholder-text">加载中...</div>'; break;
    case 'writing':     typeof 渲染短章写作 === 'function' ? 渲染短章写作(vEl) : vEl.innerHTML = '<div class="placeholder-text">加载中...</div>'; break;
    default: vEl.innerHTML = '<div class="placeholder-text">开发中...</div>';
  }
}

Store.vignette = Object.assign(createStore('vignette'), {
  listChapters: function(t) { var d = this._dir(t) + '/章节'; return LocalFS.list(d).then(function(e){if(!e)return[];return e.filter(function(x){return!x.isDir}).sort(function(a,b){return a.name.localeCompare(b.name,'zh-CN')});}); },
  getChapter: function(t,c) { return LocalFS.readText(this._dir(t)+'/章节/'+c); },
  saveChapter: function(t,c,ct) { return LocalFS.saveText(this._dir(t)+'/章节/'+c,ct); },
  deleteChapter: function(t,c) { return LocalFS.delete(this._dir(t)+'/章节/'+c); },
});
registerPageRoute('vignette', function(el) { debugLog('vignette', '页面加载'); 短章切换视图(短章当前视图); });
window.短章切换视图 = 短章切换视图;