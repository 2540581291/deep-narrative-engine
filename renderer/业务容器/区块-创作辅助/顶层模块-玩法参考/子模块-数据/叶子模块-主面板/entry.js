// 玩法参考模块 · 数据与配置

// ===== 女性版 8 主板块 =====
var 女性板块 = [
  { id: '身体开发', label: '身体开发', icon: '🧬' },
  { id: '极限开发', label: '极限开发', icon: '⚡' },
  { id: '调教玩法', label: '调教玩法', icon: '⛓️' },
  { id: '调教器具', label: '调教器具', icon: '🔧' },
  { id: '调教体系', label: '调教体系', icon: '🏛️' },
  { id: '体液开发', label: '体液开发', icon: '💧' },
  { id: '孕产全程', label: '孕产全程', icon: '🤰' },
  { id: '活体育种', label: '活体育种', icon: '🧫' },
];

var 伪娘板块 = [
  { id: '身体开发', label: '身体开发', icon: '🧬' },
  { id: '极限开发', label: '极限开发', icon: '⚡' },
  { id: '调教玩法', label: '调教玩法', icon: '⛓️' },
  { id: '调教器具', label: '调教器具', icon: '🔧' },
  { id: '调教体系', label: '调教体系', icon: '🏛️' },
  { id: '体液开发', label: '体液开发', icon: '💧' },
  { id: '创作底盘', label: '创作底盘', icon: '🎨' },
];

var 女性附表列表 = [
  { id: '服饰', label: '服饰', cols: 6 },
  { id: '性格', label: '性格', cols: 6 },
  { id: '身份', label: '身份', cols: 6 },
  { id: '题材', label: '题材', cols: 6 },
  { id: '词典', label: '词典', cols: 4 },
  { id: '对白', label: '对白', cols: 4 },
  { id: '对白-典型场景', label: '对白-典型场景', cols: 4 },
];

var 伪娘附表列表 = [
  { id: '词典', label: '词典', cols: 4 },
  { id: '对白', label: '对白', cols: 4 },
];

var 附表六列定义 = [
  { key: 'area', label: '区块' },
  { key: 'chapter', label: '章节' },
  { key: 'subclass', label: '中类' },
  { key: 'entry', label: '条目' },
  { key: 'description', label: '描述' },
  { key: 'example', label: '示例/对白' },
];

var 附表四列定义 = [
  { key: 'category', label: '项目' },
  { key: 'context', label: '语境/角色' },
  { key: 'term', label: '词条/原文' },
  { key: 'usage', label: '使用示例' },
];

// 词典用"中类/类型"而非"项目"
var 附表词典四列定义 = [
  { key: 'category', label: '中类/类型' },
  { key: 'context', label: '语境/角色' },
  { key: 'term', label: '词条/原文' },
  { key: 'usage', label: '使用示例' },
];

var 总览板块宽度 = 160;

// ===== 状态变量 =====
var 玩法性别 = 'female';
var 玩法视图 = 'overview';         // 'overview' | 'block' | 'appendix'
var 玩法板块 = '身体开发';
var 玩法附表 = null;
var 玩法已展开章节 = {};
var 玩法已展开条目 = {};
var 玩法滚动目标条目 = null;      // 跳转到条目标识
var 玩法滚动目标章节 = null;    // 跳转到章节
var 玩法保存滚动位置 = 0;          // 保存展开/折叠前的滚动位置

// ===== 路径工具 =====
function 获取玩法板块() { return 玩法性别 === 'female' ? 女性板块 : 伪娘板块; }
function 获取玩法附表() { return 玩法性别 === 'female' ? 女性附表列表 : 伪娘附表列表; }
function 加载玩法板块(blockId) {
  return LocalFS.dbReadJSON('玩法参考/' + 玩法性别 + '/' + blockId + '.json').then(function(data) { return data || []; });
}
function 加载附表(tableId) {
  return LocalFS.dbReadJSON('玩法参考/' + 玩法性别 + '/附表/' + tableId + '.json').then(function(data) { return data || []; });
}

// 深色主题色板 — 每板块细微色相差异，整体与 --bg #0f0f1a 融合
var 章节色板 = [
  ['rgba(233,69,96,0.18)',  'rgba(233,69,96,0.08)'],   // 赤
  ['rgba(255,165,0,0.15)',  'rgba(255,165,0,0.06)'],   // 橙
  ['rgba(144,238,144,0.12)','rgba(144,238,144,0.05)'], // 绿
  ['rgba(100,149,237,0.15)','rgba(100,149,237,0.06)'], // 蓝
  ['rgba(218,112,214,0.15)','rgba(218,112,214,0.06)'], // 紫
  ['rgba(0,206,209,0.13)',  'rgba(0,206,209,0.05)'],   // 青
  ['rgba(255,182,193,0.15)','rgba(255,182,193,0.06)'], // 粉
  ['rgba(255,215,0,0.13)',  'rgba(255,215,0,0.05)'],   // 金
];

// ===== 通用玩法参考条目选择器 =====
window.打开玩法参考选择器 = function(callback, gender) {
  var _gend = gender || 'female';
  var _blocks = { female: ['身体开发','极限开发','调教玩法','调教器具','调教体系','体液开发','孕产全程','活体育种'], femboy: ['身体开发','极限开发','调教玩法','调教器具','调教体系','体液开发','创作底盘'] };
  var _list = [];
  // 直接用已知的保存目录 + 玩法参考目录名，不依赖 STORE_DIRS 变量
  var _dir = '玩法参考';
  var _fs = window.LocalFS || window.本地FS;
  var _esc = window.escHtml || function(s) { return String(s); };

  var ov = document.createElement('div'); ov.className = 'ovl';
  ov.innerHTML =
    '<div class="mcard" style="max-width:720px;max-height:85vh;overflow-y:auto;padding:16px">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
    '<h3 style="font-size:14px;margin:0">📖 从玩法参考选择条目</h3>' +
    '<button class="btn-sm" style="background:transparent;color:var(--fg2);border:1px solid var(--border)" onclick="this.closest(\'.ovl\').remove()">关闭</button></div>' +
    '<p style="font-size:11px;color:var(--fg2);margin-bottom:10px">选择性别 → 选择板块 → 点击条目，内容将回填到输入框</p>' +
    '<div style="display:flex;gap:6px;margin-bottom:10px" id="fpGen">' +
    '<span class="tag-chip act" data-gen="female" style="cursor:pointer;padding:2px 10px;font-size:12px">👩 女性玩法库</span>' +
    '<span class="tag-chip" data-gen="femboy" style="cursor:pointer;padding:2px 10px;font-size:12px">👧 伪娘玩法库</span></div>' +
    '<div id="fpBlk" style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px"></div>' +
    '<div id="fpEnt" style="font-size:12px;max-height:50vh;overflow-y:auto"></div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });

  // 性别切换
  ov.querySelectorAll('#fpGen .tag-chip').forEach(function(el) {
    el.onclick = function() {
      ov.querySelectorAll('#fpGen .tag-chip').forEach(function(t) { t.classList.remove('act'); });
      el.classList.add('act');
      renderBlocks(el.getAttribute('data-gen'));
      var e2 = ov.querySelector('#fpEnt');
      if (e2) e2.innerHTML = '<div style="color:var(--fg3);font-size:11px;padding:30px 20px;text-align:center">点击上方板块加载条目</div>';
    };
  });

  function renderBlocks(g) {
    var c = ov.querySelector('#fpBlk');
    if (!c) return;
    var b2 = _blocks[g] || _blocks.female;
    c.innerHTML = b2.map(function(b) { return '<span class="tag-chip" data-block="' + _esc(b) + '" style="cursor:pointer;font-size:11px;padding:2px 8px">' + _esc(b) + '</span>'; }).join('');
    c.querySelectorAll('[data-block]').forEach(function(el) {
      el.onclick = function() {
        c.querySelectorAll('[data-block]').forEach(function(x) { x.classList.remove('act'); });
        el.classList.add('act');
        loadEntries(g, el.getAttribute('data-block'));
      };
    });
  }

  function loadEntries(g, blockId) {
    var ce = ov.querySelector('#fpEnt');
    if (!ce) return;
    ce.innerHTML = '<div style="text-align:center;padding:30px 20px;color:var(--fg2);font-size:12px">⏳ 加载中...</div>';
    var path = _dir + '/' + g + '/' + blockId + '.json';
    if (!_fs || !_fs.dbReadJSON) { ce.innerHTML = '<div style="color:var(--error);padding:30px 20px;text-align:center;font-size:12px">文件系统不可用</div>'; return; }
    _fs.dbReadJSON(path).then(function(entries) {
      if (!entries || !entries.length) { ce.innerHTML = '<div style="color:var(--fg3);padding:30px 20px;text-align:center;font-size:12px">该板块暂无条目</div>'; return; }
      _list = entries;
      toast('✅ 已加载 ' + entries.length + ' 条条目');
      var groups = {};
      entries.forEach(function(e, i) { var ch = e.chapter || '未分类'; if (!groups[ch]) groups[ch] = []; groups[ch].push({ entry: e, idx: i }); });
      var hh = '<div style="font-size:11px;color:var(--fg2);margin-bottom:6px">共 ' + entries.length + ' 条条目</div>';
      Object.keys(groups).forEach(function(ch) {
        hh += '<div style="margin-bottom:6px"><div style="font-weight:600;font-size:12px;color:var(--accent);padding:3px 0;border-bottom:1px solid var(--bd);margin-bottom:3px">' + _esc(ch) + '</div><div style="display:flex;flex-wrap:wrap;gap:3px">';
        groups[ch].forEach(function(item) { hh += '<span class="tag-chip" data-fpidx="' + item.idx + '" style="cursor:pointer;font-size:11px;padding:2px 8px;margin:1px">' + _esc(item.entry.entry || '未命名') + '</span>'; });
        hh += '</div></div>';
      });
      ce.innerHTML = hh;
      ce.querySelectorAll('[data-fpidx]').forEach(function(el2) {
        el2.onclick = function() {
          var idx = parseInt(this.getAttribute('data-fpidx'));
          var e = _list[idx];
          if (!e) { toast('条目数据异常'); return; }
          toast('✅ 已选中: ' + (e.entry || ''));
          var txt = '【玩法参考：' + (e.entry || '') + '】';
          if (e.demo) txt += '\n' + e.demo;
          if (e.progress) txt += '\n\n[进度] ' + e.progress;
          if (e.bodyChange) txt += '\n\n[肉体变化] ' + e.bodyChange;
          if (e.psychChange) txt += '\n\n[心理变化] ' + e.psychChange;
          if (e.keyNode) txt += '\n\n[关键节点] ' + e.keyNode;
          if (e.linkage) txt += '\n\n[联动] ' + e.linkage;
          console.log('[玩法参考] selected:', txt);
          console.log('[玩法参考] typeof callback:', typeof callback);
          ov.remove();
          if (typeof callback === 'function') {
            console.log('[玩法参考] calling callback');
            callback(txt);
            console.log('[玩法参考] callback done');
          } else {
            console.log('[玩法参考] callback is NOT a function:', callback);
          }
        };
      });
    }).catch(function(err) {
      ce.innerHTML = '<div style="color:var(--error);padding:30px 20px;text-align:center;font-size:12px">加载失败: ' + (err && err.message ? err.message : String(err)) + '</div>';
    });
  }

  renderBlocks(_gend);
};
