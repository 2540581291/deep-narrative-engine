// 玩法参考模块 · 交互与操作

// ===== 视图切换 =====
function 切换玩法性别(gender) {
  debugLog("fap", "性别切换", gender);
  玩法性别 = gender;
  玩法视图 = 'overview';
  玩法板块 = (gender === 'female' ? 女性板块 : 伪娘板块)[0].id;
  玩法附表 = null;
  玩法已展开章节 = {};
  玩法已展开条目 = {};
  玩法滚动目标条目 = null;
  玩法滚动目标章节 = null;
  玩法保存滚动位置 = 0;
  if (玩法Api) 玩法Api.setActive(gender);
  渲染板块导航();
  渲染板块内容();
}

function 切换玩法总览() {
  玩法视图 = 'overview';
  玩法滚动目标条目 = null;
  玩法滚动目标章节 = null;
  玩法保存滚动位置 = 0;
  渲染板块导航();
  渲染板块内容();
}

function 切换玩法板块(blockId) {
  debugLog("fap", "板块切换", blockId);
  玩法视图 = 'block';
  玩法板块 = blockId;
  玩法附表 = null;
  玩法已展开章节 = {};
  玩法已展开条目 = {};
  玩法滚动目标条目 = null;
  玩法滚动目标章节 = null;
  玩法保存滚动位置 = 0;
  渲染板块导航();
  渲染板块内容();
}

// 跳转到指定板块的指定章节和条目（无条目索引则跳转到章节）
function 切换玩法板块定位(blockId, chapter, entryIdx) {
  玩法视图 = 'block';
  玩法板块 = blockId;
  玩法附表 = null;
  玩法已展开章节 = {};
  玩法已展开条目 = {};
  玩法滚动目标条目 = null;
  玩法滚动目标章节 = null;

  if (chapter) { 玩法已展开章节[chapter] = true; }
  if (entryIdx !== null && entryIdx !== undefined) {
    玩法已展开条目['e' + entryIdx] = true;
    玩法滚动目标条目 = entryIdx;
  } else if (chapter) {
    // 只跳到章节，不展开具体条目
    玩法滚动目标章节 = chapter;
  }

  渲染板块导航();
  渲染板块内容();
}

function 切换玩法附表() {
  玩法视图 = 'appendix';
  玩法附表 = null;
  渲染板块导航();
  渲染板块内容();
}

function 切换玩法附表详情(tableId) {
  玩法附表 = tableId;
  渲染板块内容();
}

function 返回附表列表() {
  玩法附表 = null;
  渲染板块内容();
}

// ===== 折叠控制 =====
function 折叠章节(ch) {
  玩法保存滚动位置 = window.scrollY;
  玩法已展开章节[ch] = 玩法已展开章节[ch] === false ? true : false;
  渲染板块内容();
}

function 折叠条目(idx) {
  玩法保存滚动位置 = window.scrollY;
  var key = 'e' + idx;
  玩法已展开条目[key] = 玩法已展开条目[key] === true ? false : true;
  渲染板块内容();
}

function 全部折叠() {
  玩法保存滚动位置 = window.scrollY;
  加载玩法板块(玩法板块).then(function(entries) {
    entries.forEach(function(e) {
      玩法已展开章节[e.chapter || '未分类'] = false;
    });
    玩法已展开条目 = {};
    渲染板块内容();
  });
}

function 全部展开() {
  玩法保存滚动位置 = window.scrollY;
  Object.keys(玩法已展开章节).forEach(function(k) { 玩法已展开章节[k] = true; });
  玩法已展开条目 = {};
  渲染板块内容();
}

Store.fapReference = createStore('fapReference');
// 注册路由
try {
  window.注册页面路由('fap-reference', function(el) {
    渲染玩法导航(el);
  });
} catch(e) {
  console.error('fap route registration failed:', e);
}

window.切换玩法性别 = 切换玩法性别;
window.切换玩法板块 = 切换玩法板块;
window.切换玩法板块定位 = 切换玩法板块定位;
window.切换玩法总览 = 切换玩法总览;
window.切换玩法附表 = 切换玩法附表;
window.切换玩法附表详情 = 切换玩法附表详情;
window.返回附表列表 = 返回附表列表;
window.折叠章节 = 折叠章节;
window.折叠条目 = 折叠条目;
window.全部折叠 = 全部折叠;
window.全部展开 = 全部展开;

// backward compat
window.switchFapGender = window.切换玩法性别;
window.switchFapBlock = window.切换玩法板块;
window.switchFapBlockAt = window.切换玩法板块定位;
window.switchFapOverview = window.切换玩法总览;
window.switchFapAppendix = window.切换玩法附表;
window.switchFapAppendixTable = window.切换玩法附表详情;
window.fapBackToAppendixIndex = window.返回附表列表;
window.fapToggleChapter = window.折叠章节;
window.fapToggleEntry = window.折叠条目;
window.fapCollapseAll = window.全部折叠;
window.fapExpandAll = window.全部展开;

console.log('fap module fully loaded, route registered:',
  页面路由['fap-reference'] ? 页面路由['fap-reference'].render !== null : 'NO ROUTE ENTRY');
