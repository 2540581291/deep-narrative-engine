// 情欲工坊 · 模块工厂函数（通用 pattern）

function createWorkshopModule(pgId, displayName, storeKey, storeDir, customViews) {
  // 防御：如果 PAGE_ROUTES 还没有这个条目，动态添加
  if (typeof PAGE_ROUTES !== 'undefined' && !PAGE_ROUTES[pgId]) {
    PAGE_ROUTES[pgId] = { nav: 'more', label: displayName, render: null };
  }

  var NAV = customViews || [
    { id: 'list', label: displayName + '列表' },
    { id: 'create', label: '新建' + displayName },
    { id: 'editor', label: '编辑' },
  ];
  var activeView = 'list';

  function renderNav() {
    var h = '<div class="tl-subnav">';
    NAV.forEach(function(v) { h += '<div class="tl-subitem' + (v.id === activeView ? ' act' : '') + '" data-view="' + v.id + '">' + escHtml(v.label) + '</div>'; });
    h += '</div><div id="' + pgId + 'ViewContent"></div>';
    return h;
  }

  function switchView(view) {
    activeView = view;
    var el = document.getElementById(pgId + 'Content');
    if (!el) return;
    el.innerHTML = renderNav();
    var vEl = document.getElementById(pgId + 'ViewContent');
    if (!vEl) return;
    el.querySelectorAll('.tl-subitem').forEach(function(i) { i.addEventListener('click', function() { switchView(this.getAttribute('data-view')); }); });
    vEl.innerHTML = '<div class="placeholder-text">' + displayName + '（即将推出）</div>';
  }

  Store[storeKey] = createStore(storeKey);

  var switchFnName = pgId + 'SwitchView';
  window[switchFnName] = switchView;

  if (typeof registerPageRoute !== 'undefined') {
    registerPageRoute(pgId, function(el) { switchView(activeView); });
  }
}
