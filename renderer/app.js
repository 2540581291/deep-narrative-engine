// 深度-叙事引擎 · 应用启动入口
(function() {
  // ===== 滚动条滚动时高亮：滚动中给 body 加 .scrolling，停止后移除 =====
  (function() {
    var _scrollTimer = null;
    function onScroll(e) {
      document.body.classList.add('scrolling');
      // 滚动发生在左栏时，同步给左栏加 .scrolling（显示其滚动条颜色）
      var t = e && e.target;
      if (t && t.classList && t.classList.contains && t.classList.contains('left-bar')) {
        t.classList.add('scrolling');
      }
      if (_scrollTimer) clearTimeout(_scrollTimer);
      _scrollTimer = setTimeout(function() {
        document.body.classList.remove('scrolling');
        var lb = document.getElementById('leftBar');
        if (lb) lb.classList.remove('scrolling');
      }, 300);
    }
    // 监听所有可能的滚动容器（.pg 主页面、.left-bar 侧边栏等），用捕获阶段拦截
    document.addEventListener('scroll', onScroll, true);
  })();
  // ===== 渲染进程全局错误捕获 =====
  window.onerror = function(msg, url, line, col, err) {
    try {
      window.narrative.logCrash({
        type: 'renderer-window-error',
        message: msg + ' at ' + url + ':' + line + ':' + col,
        stack: err && err.stack ? err.stack : ''
      }).catch(function() {});
    } catch(e) {}
    return false;
  };
  window.addEventListener('unhandledrejection', function(e) {
    try {
      window.narrative.logCrash({
        type: 'renderer-unhandled-rejection',
        message: e.reason ? (e.reason.message || String(e.reason)) : 'unknown',
        stack: e.reason && e.reason.stack ? e.reason.stack : ''
      }).catch(function() {});
    } catch(e) {}
  });

  initState();
  initStores();

  // 恢复 RunningHub 动态模型（上次抓取已持久化到 settings，无需重新抓取）
  try {
    if (typeof RH !== 'undefined' && RH.restoreDynamic) RH.restoreDynamic();
  } catch(e) { console.warn('[启动] RunningHub 动态模型恢复失败:', e); }

  // 应用已保存的主题（修复重启后主题还原的 bug）
  try {
    if (typeof changeTheme === 'function' && S.settings && S.settings.theme) {
      changeTheme(S.settings.theme);
    }
  } catch(e) { console.warn('[启动] 主题应用失败:', e); }

  // 写入一条启动日志验证日志系统
  try {
    window.narrative.logCrash({
      type: 'app-start',
      message: '应用启动',
      stack: '',
      url: '',
      line: '',
      col: ''
    });
  } catch(e) {}

  // 预创建所有存储目录（写入空索引文件确保目录存在）
  if (typeof STORE_DIRS !== 'undefined') {
    for (var key in STORE_DIRS) {
      var dir = STORE_DIRS[key];
      try {
        if (typeof LocalFS !== 'undefined' && LocalFS.saveJSON) {
          LocalFS.saveJSON(dir + '/.dir', { created: new Date().toISOString() });
        }
      } catch(e) {
        console.warn('[启动] 创建存储目录失败:', dir, e);
      }
    }
  }

  // Render dashboard（小部件首页）
  var homeEl = document.getElementById('homeContent');
  if (homeEl && typeof renderDashboard === 'function') {
    renderDashboard(homeEl);
  }

  // 启动时预聚合首页数据快照（页面只读快照，不实时调用）
  if (typeof 聚合首页数据 === 'function' && !window.HOME_SNAPSHOT) {
    聚合首页数据().then(function(snap) {
      window.HOME_SNAPSHOT = snap;
      // 若首页已渲染且网格为空，则刷新
      var grid = document.getElementById('homeWidgetGrid');
      if (grid && !grid.childElementCount) {
        if (typeof renderDashboard === 'function' && homeEl) renderDashboard(homeEl);
      }
    });
  }

  // Navigate to home always
  switchPage('home');

  // 确保玩法参考路由已注册（模块级注册失败的兜底）
  try {
    if (typeof 页面路由 !== 'undefined' && 页面路由['fap-reference'] && !页面路由['fap-reference'].render) {
      if (typeof window.渲染玩法导航 === 'function') {
        页面路由['fap-reference'].render = function(el) {
          if (typeof window.渲染玩法导航 === 'function') window.渲染玩法导航(el);
        };
        console.log('[启动] fap-reference 路由已通过 app.js 注册');
      }
    }
  } catch(e) { console.warn('[启动] fap 路由兜底失败:', e); }

  // 启动后自动开启 debug 拦截
  if (typeof debugWatchPrefix === 'function') {
    debugWatchPrefix('switch', 'view');
    debugWatchPrefix('novel', 'novel');
    debugWatchPrefix('vignette', 'vignette');
    debugWatchPrefix('renderNovel', 'novel');
    debugWatchPrefix('renderVignette', 'vignette');
    debugWatchPrefix('renderOutline', 'novel');
    debugWatchPrefix('N_otab', 'novel');
    debugWatchPrefix('V_otab', 'vignette');
    debugLog('system', '自动拦截已启动');
  }

  console.log('深度-叙事引擎 v0.2.0 已启动');
})();
