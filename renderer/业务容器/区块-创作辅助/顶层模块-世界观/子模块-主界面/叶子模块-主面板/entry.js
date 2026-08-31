// 设定构建 · 世界观 · 核心导航 + 路由
// 世界观模块结构（重构后两级：世界列表 / 开天辟地）：
//   - 首页   = 世界列表（富卡片网格，顶部「开天辟地」入口）
//   - 开天辟地 = 创建世界（单页精美创世表单）
// 进入某个世界后的「世界详情页」暂未实现（后续再议）。
//
// Store.world 用一个独立内容文件 content.json（即时保存），与其它模块一致：
//   {title}.json   —— 信息文件（name/type/description/modules/createdAt/updatedAt）
//   {title}/content.json —— 内容数据（详情页用，创建时预置空对象）
// 加载顺序依赖：区块-存储（createStore/STORE_DIRS）、区块-界面（registerPageRoute）、全局工具。

// ===== Store.world 统一挂载（主界面为唯一挂载点）=====
Store.world = Object.assign(createStore('world'), {
  // 读取世界内容（content.json）
  loadContent: function(t) {
    var dir = STORE_DIRS.world + '/' + LocalFS.sanitize(t) + '/';
    return LocalFS.readJSON(dir + 'content.json').then(function(x) {
      x = x || {};
      // 键名迁移：地理旧子维度名 → 新名（世界地理/聚落/奇境）
      var geo = (x && x.地理) ? x.地理 : null;
      if (geo) {
        if (geo['地理与生态'] !== undefined && !geo['世界地理']) { geo['世界地理'] = geo['地理与生态']; delete geo['地理与生态']; }
        if (geo['聚落志'] !== undefined && !geo['聚落']) { geo['聚落'] = geo['聚落志']; delete geo['聚落志']; }
        if (geo['奇境录'] !== undefined && !geo['奇境']) { geo['奇境'] = geo['奇境录']; delete geo['奇境录']; }
      }
      return x;
    });
  },
  // 保存世界内容（content.json）
  saveContent: function(t, c) {
    var dir = STORE_DIRS.world + '/' + LocalFS.sanitize(t) + '/';
    return LocalFS.saveJSON(dir + 'content.json', c || {});
  },
});

registerPageRoute('world', function(e) { 世界切换视图('list'); });
window.worldSwitchView = window.世界切换视图;
