// 深度-叙事引擎 · 角色卡 · 👥 角色提取总览
// 跨全部提取记录的角色总览：性别筛选 + 全字段关键词搜索 + 快捷词筛选 + 来源跳转 + 内嵌详情
// 依赖 fields.js / state.js / persist.js / persist-ops.js / entry-history.js

// ===== 状态与缓存 =====
window.小说提取总览缓存 = { chars: [], books: [], loadedAt: null };
window.小说提取总览进度 = { loaded: 0, total: 0 };
window.小说提取总览筛选 = window.小说提取总览筛选 || { gender: '', kw: '', quick: '', content: '' };
window.小说提取总览展开 = window.小说提取总览展开 || {};
var 总览加载中 = false;

var 总览性别标签 = { female: '女性', male: '男性', femboy: '伪娘', futa: '扶她', beast: '异种' };

// 快捷词固定预设（纯 toggle 按钮，无增删）
var 总览默认快捷词 = ['拘束', '调教', '绿帽', '精液', '产卵', '贞操', '足', '口', '肛', '粪', '尿', '孕', '炮机', '跳蛋', '尿道', '屎'];

function 总览读快捷词() {
  return 总览默认快捷词.slice();
}

// ===== 数据加载（全字段预加载 + 进度 + 缓存） =====

window.小说提取总览确保加载 = function() {
  var cache = window.小说提取总览缓存;
  if (cache.loadedAt) return Promise.resolve(cache);
  if (总览加载中) {
    // 等待进行中的扫描完成
    return new Promise(function(resolve) {
      var timer = setInterval(function() {
        if (window.小说提取总览缓存.loadedAt) { clearInterval(timer); resolve(window.小说提取总览缓存); }
      }, 300);
    });
  }
  return 小说提取总览扫描();
};

function 小说提取总览扫描() {
  总览加载中 = true;
  window.小说提取总览进度 = { loaded: 0, total: 0 };

  return LocalFS.list(小说提取存储基路径).then(function(entries) {
    var bookDirs = entries.filter(function(e) { return e.isDir; });
    var total = bookDirs.length;
    window.小说提取总览进度.total = total;
    var allChars = [];
    var allBooks = [];
    var 已追加uid = {};

    // 跨书并发 8，书内 Promise.all；每个 worker 递归处理直到无剩余目录
    var index = 0;
    function 处理一本书(dir) {
      var folderPath = 小说提取存储基路径 + dir.name + '/';
      return LocalFS.readJSON(folderPath + '_meta.json').then(function(meta) {
        if (!meta) return;
        allBooks.push({ folderName: dir.name, title: meta.title || dir.name });
        // 列出角色文件
        return LocalFS.list(folderPath).then(function(files) {
          var jsonFiles = files.filter(function(f) {
            return f.name.endsWith('.json') && f.name !== '_meta.json' && f.name !== '_progress.json' && f.name.indexOf('_fullExtract_') !== 0 && f.name.indexOf('_stages_') !== 0;
          });
          return Promise.all(jsonFiles.map(function(f) {
            return LocalFS.readJSON(folderPath + f.name).then(function(c) {
              if (!c || !c.name) return;
              var ch = {
                uid: dir.name + '|' + c.name,
                name: c.name,
                gender: 小说提取规范化性别(c.gender),
                role: c.role || '龙套',
                brief: c.brief || '',
                sourceTitle: meta.title || dir.name,
                sourceFolder: dir.name
              };
              // 全字段拷贝（排除 relatedPassages 大段原文）
              小说提取字段名.forEach(function(field) {
                if (field === 'name') return;
                ch[field] = c[field] !== undefined ? c[field] : null;
              });
              // 预计算内容量指标：全字段总字数、性爱明细字数、详情区是否有内容（惰性折叠壳判定）
              ch._totalChars = 0;
              ch._sexChars = 0;
              ch._hasExtra = false;
              小说提取字段名.forEach(function(field) {
                if (field === 'name' || field === 'gender' || field === 'role') return;
                var v = c[field];
                if (v === null || v === undefined || v === 'null') return;
                var n = 0;
                if (Array.isArray(v)) {
                  v.forEach(function(it) { n += String(it).length; });
                } else if (typeof v === 'string') {
                  n = v.length;
                }
                ch._totalChars += n;
                if (field === 'sexualDetails') ch._sexChars = n;
                if (总览详情区字段.indexOf(field) >= 0) ch._hasExtra = true;
              });
              allChars.push(ch);
            }).catch(function() {});
          }));
        });
      }).catch(function() {}).then(function() {
        // 更新进度（异步块级更新，避免多次刷新视图）
        window.小说提取总览进度.loaded++;
        var p = window.小说提取总览进度;
        var progressEl = document.getElementById('novelOverviewProgress');
        if (progressEl) {
          progressEl.innerHTML = '正在加载角色总览 ' + p.loaded + '/' + p.total + ' 部小说…';
        }
        // 渐进追加：无筛选激活时，本书角色按级别排序后追加到列表区（先出先看）
        var f = window.小说提取总览筛选;
        var listEl = document.getElementById('overviewList');
        if (listEl && !f.gender && !f.kw && !f.quick && !f.content) {
          var bookChars = allChars.filter(function(ch) { return ch.sourceFolder === dir.name && !已追加uid[ch.uid]; });
          var w = { '主角': 3, '主配': 2.5, '配角': 2, '龙套': 1 };
          bookChars.sort(function(a, b) { return (w[b.role] || 0) - (w[a.role] || 0); });
          if (bookChars.length) {
            var hh = '';
            bookChars.forEach(function(ch) { hh += 小说提取总览卡片HTML(ch); 已追加uid[ch.uid] = true; });
            listEl.insertAdjacentHTML('beforeend', hh);
            var statsEl = document.getElementById('overviewStats');
            if (statsEl) statsEl.textContent = '正在加载角色总览 ' + p.loaded + '/' + p.total + ' 部小说，已显示 ' + Object.keys(已追加uid).length + ' 个角色…';
          }
        }
      });
    }

    function worker() {
      if (index >= bookDirs.length) return Promise.resolve();
      var dir = bookDirs[index++];
      // 处理完当前目录后递归处理下一个，直到扫描完所有目录
      return 处理一本书(dir).then(function() {
        return worker();
      });
    }

    // 并发 8 个 worker
    var workers = [];
    for (var w = 0; w < Math.min(8, bookDirs.length); w++) {
      workers.push(worker());
    }
    return Promise.all(workers).then(function() {
      // 全部目录扫描完成：排序 + 缓存 + 标记加载结束
      allChars.sort(function(a, b) {
        if (a.sourceFolder !== b.sourceFolder) return a.sourceFolder < b.sourceFolder ? -1 : 1;
        var w = { '主角': 3, '主配': 2.5, '配角': 2, '龙套': 1 };
        return (w[b.role] || 0) - (w[a.role] || 0);
      });
      window.小说提取总览缓存 = { chars: allChars, books: allBooks, loadedAt: Date.now() };
      总览加载中 = false;
      return window.小说提取总览缓存;
    });
  });
}

// ===== 筛选逻辑 =====

// 判断角色 c 是否在全部字段中包含关键词 kw
function 小说提取总览命中字段(c, kw) {
  for (var i = 0; i < 小说提取字段名.length; i++) {
    var field = 小说提取字段名[i];
    var v = c[field];
    if (v === null || v === undefined) continue;
    if (Array.isArray(v)) {
      for (var j = 0; j < v.length; j++) {
        if (v[j] && String(v[j]).toLowerCase().indexOf(kw) >= 0) return true;
      }
    } else if (String(v).toLowerCase().indexOf(kw) >= 0) {
      return true;
    }
  }
  return false;
}

function 小说提取总览筛选列表() {
  var cache = window.小说提取总览缓存;
  if (!cache.loadedAt) return [];
  var f = window.小说提取总览筛选;
  var list = cache.chars;

  // 性别过滤
  if (f.gender) {
    list = list.filter(function(c) { return c.gender === f.gender; });
  }

  // 自由搜索关键词
  var kw = (f.kw || '').trim().toLowerCase();
  if (kw) {
    list = list.filter(function(c) { return 小说提取总览命中字段(c, kw); });
  }

  // 快捷词（独立于自由搜索，两者叠加）
  var quick = (f.quick || '').trim().toLowerCase();
  if (quick) {
    list = list.filter(function(c) { return 小说提取总览命中字段(c, quick); });
  }

  // 内容量：丰富 = 全字段总字数 > 300；高质量 = 性爱明细字数 > 200
  if (f.content === 'rich') {
    list = list.filter(function(c) { return (c._totalChars || 0) > 300; });
  } else if (f.content === 'high') {
    list = list.filter(function(c) { return (c._sexChars || 0) > 200; });
  }

  return list;
}

// ===== 主渲染 =====

function 小说渲染总览面板() {
  var cache = window.小说提取总览缓存;
  var h = '<div style="padding:20px">';

  if (!cache.loadedAt) {
    // 点击即进：渲染完整骨架（筛选栏可交互），角色随扫描逐个追加
    h += 小说渲染总览筛选栏();
    h += '<div style="font-size:11px;color:var(--fg3);margin-bottom:10px" id="overviewStats">正在加载角色总览…</div>';
    h += '<div id="overviewList"></div>';
    h += '</div>';
    // 启动加载，完成后局部整刷（排序、统计数字修正）；期间不阻塞骨架展示
    小说提取总览确保加载().then(function() { 小说提取总览完成整刷(); });
    return h;
  }
  h += 小说渲染总览筛选栏();

  // ===== 结果统计 =====
  var f = window.小说提取总览筛选;
  var list = 小说提取总览筛选列表();
  h += '<div style="font-size:11px;color:var(--fg3);margin-bottom:10px">共 ' + cache.chars.length + ' 个角色，当前筛选命中 ' + list.length + ' 个</div>';

  if (!list.length) {
    h += '<div style="padding:30px;text-align:center;color:var(--fg3);font-size:12px">没有匹配的角色</div>';
    h += '</div>';
    return h;
  }

  // 无筛选且结果过多时截断
  var displayList = list;
  var truncated = false;
  if (!f.gender && !f.kw && !f.quick && list.length > 1200) {
    displayList = list.slice(0, 1200);
    truncated = true;
  }

  // ===== 角色列表（复用历史提取的通用角色卡片行，readonly 模式 = 完全一致 UI + 无操作按钮） =====
  h += '<div id="overviewList">';
  displayList.forEach(function(c) {
    h += 小说提取总览卡片HTML(c);
  });
  h += '</div>';
  h += '</div>';

  if (truncated) {
    h += '<div style="font-size:11px;color:var(--fg3);text-align:center;padding:10px">结果过多，仅显示前 1200 个。请使用筛选缩小范围。</div>';
  }

  h += '</div>';
  return h;
}

// 筛选栏（标题下常驻，骨架/已加载共用）
function 小说渲染总览筛选栏() {
  var cache = window.小说提取总览缓存;
  var f = window.小说提取总览筛选;
  var h = '';
  // 性别 chip
  h += '<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:wrap">';
  h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">性别</span>';
  var allActive = !f.gender;
  h += '<span class="btn-out btn-sm" style="font-size:10px;padding:2px 8px;' + (allActive ? 'background:var(--accent);color:#fff;border-color:var(--accent)' : '') + ';cursor:pointer" onclick="var a=window.小说提取总览筛选;a.gender=\'\';window.小说提取总览筛选=a;刷新视图()">全部</span>';
  小说提取性别顺序.forEach(function(g) {
    var gc = 小说提取性别配置[g] || { label: g, icon: '❓', color: 'var(--fg3)' };
    var active = f.gender === g;
    h += '<span style="font-size:10px;padding:2px 8px;cursor:pointer;border:1px solid ' + (active ? gc.color : 'var(--border)') + ';color:' + (active ? gc.color : 'var(--fg3)') + ';background:' + (active ? 'rgba(255,255,255,0.06)' : 'transparent') + ';border-radius:3px;font-weight:' + (active ? '600' : '400') + '" onclick="var a=window.小说提取总览筛选;a.gender=\'' + g + '\';window.小说提取总览筛选=a;刷新视图()">' + gc.icon + ' ' + gc.label + '</span>';
  });
  h += '</div>';

  // 内容量行（丰富 = 总字段 >300 字；高质量 = 性爱明细 >200 字）
  h += '<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:wrap">';
  h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">内容</span>';
  var contentOptions = [
    { key: '', label: '全部' },
    { key: 'rich', label: '🌟 丰富' },
    { key: 'high', label: '💎 高质量' },
  ];
  contentOptions.forEach(function(opt) {
    var active = (f.content || '') === opt.key;
    h += '<span class="btn-out btn-sm" style="font-size:10px;padding:2px 8px;cursor:pointer;' + (active ? 'background:var(--accent);color:#fff;border-color:var(--accent)' : '') + '" onclick="var a=window.小说提取总览筛选;a.content=\'' + opt.key + '\';window.小说提取总览筛选=a;刷新视图()">' + opt.label + '</span>';
  });
  h += '</div>';

  // 快捷词行（常驻，点击 = 筛选，再点 = 取消；纯按钮无增删）
  var quickwords = 总览读快捷词();
  h += '<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:wrap">';
  h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">快捷</span>';
  quickwords.forEach(function(w) {
    var active = f.quick === w;
    h += '<span class="btn-out btn-sm" style="font-size:10px;padding:2px 8px;cursor:pointer;' + (active ? 'background:var(--accent);color:#fff;border-color:var(--accent)' : '') + '" onclick="小说提取总览切快捷词(\'' + escHtml(w) + '\')">' + escHtml(w) + '</span>';
  });
  h += '</div>';

  // 自由搜索框（独立于快捷词，不显示快捷词内容）
  h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">';
  h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">搜索</span>';
  h += '<input id="overviewKwInput" type="text" placeholder="搜索名称 / 别名 / 外貌 / 性格 / 性偏好 / 性爱明细等全部字段…" value="' + escHtml(f.kw || '') + '" style="flex:1;font-size:12px;padding:4px 8px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;color:var(--fg)" onkeydown="if(event.key===\'Enter\'){小说提取总览执行搜索()}">';
  h += '<button class="btn btn-sm" onclick="小说提取总览执行搜索()" style="font-size:11px;padding:4px 12px">🔍 搜索</button>';
  if (f.kw) {
    h += '<span style="font-size:10px;color:var(--fg3);cursor:pointer" onclick="var a=window.小说提取总览筛选;a.kw=\'\';window.小说提取总览筛选=a;刷新视图()">✕ 清除</span>';
  }
  h += '</div>';
  return h;
}

// 单个角色卡片行（总览整刷/渐进追加共用；lazyDetails = 详情折叠区惰性渲染）
function 小说提取总览卡片HTML(c) {
  var gc = 小说提取性别配置[c.gender] || { label: c.gender || '未知', icon: '❓', color: 'var(--fg3)' };
  // 复用历史提取的 .card 容器样式（背景 var(--card) + 性别色左边框），与历史提取视觉一致
  var h = '<div class="card" style="padding:6px 12px;margin-bottom:8px;border-left:3px solid ' + gc.color + '">';
  // 右侧跳转按钮（与历史提取操作按钮同位置）
  var rightBtns = '<button class="btn-out btn-sm" onclick="event.stopPropagation();小说提取总览跳转(\'' + escHtml(c.sourceFolder) + '\')" title="跳转到「' + escHtml(c.sourceTitle) + '」" style="font-size:10px;padding:2px 8px">📖 ' + escHtml(c.sourceTitle) + '</button>';
  // 复用历史提取通用角色卡：readonly = 无操作按钮、不可编辑、UI 完全一致；noDetail = 总览只渲染提取详情，跳过时间线
  h += 小说渲染角色卡片行(c, { readonly: true, noDetail: true, lazyDetails: true, hasExtra: c._hasExtra, rightButtons: rightBtns });
  h += '</div>';
  return h;
}

// 惰性详情绑定：details[data-lazy] 首次展开时按 uid 从缓存填充详情内容
// 采用 document 级事件委托（toggle 不冒泡，改用 capture），对动态插入的列表也生效，无需逐个绑定
var 总览惰性委托已注册 = false;
function 小说提取总览绑定惰性详情(root) {
  if (总览惰性委托已注册) return;
  总览惰性委托已注册 = true;
  document.addEventListener('toggle', function(e) {
    var d = e.target;
    if (!d || d.tagName !== 'DETAILS' || d.getAttribute('data-lazy') !== '1') return;
    if (!d.open) return;
    var uid = d.getAttribute('data-uid') || '';
    var ch = null;
    var cache = window.小说提取总览缓存;
    if (cache && cache.chars) {
      for (var i = 0; i < cache.chars.length; i++) {
        if (cache.chars[i].uid === uid) { ch = cache.chars[i]; break; }
      }
    }
    if (!ch) {
      d.insertAdjacentHTML('beforeend', '<div style="margin-top:2px;padding:4px 6px;background:var(--bg2);border-radius:4px;line-height:1.5;color:var(--fg3)">（详情加载中）</div>');
      return;
    }
    var extraInfo = 小说提取构建详情HTML(ch);
    if (extraInfo) {
      d.insertAdjacentHTML('beforeend', '<div style="margin-top:2px;padding:4px 6px;background:var(--bg2);border-radius:4px;line-height:1.5">' + extraInfo + '</div>');
    }
    d.removeAttribute('data-lazy');
  }, true);
}

// 扫描完成整刷：重建列表区并绑定惰性详情（渐进追加阶段以文本追加、无 DOM 节点，需重建才能绑定）
function 小说提取总览完成整刷() {
  var listEl = document.getElementById('overviewList');
  if (!listEl) return;
  var cache = window.小说提取总览缓存;
  var f = window.小说提取总览筛选;
  var list = 小说提取总览筛选列表();
  var stats = '共 ' + cache.chars.length + ' 个角色，当前筛选命中 ' + list.length + ' 个';
  var statsEl = document.getElementById('overviewStats');
  if (statsEl) statsEl.textContent = stats;
  if (!list.length) {
    listEl.innerHTML = '<div style="padding:30px;text-align:center;color:var(--fg3);font-size:12px">没有匹配的角色</div>';
    return;
  }
  var displayList = list;
  var truncated = false;
  if (!f.gender && !f.kw && !f.quick && list.length > 1200) {
    displayList = list.slice(0, 1200);
    truncated = true;
  }
  var h = '';
  displayList.forEach(function(c) { h += 小说提取总览卡片HTML(c); });
  if (truncated) h += '<div style="font-size:11px;color:var(--fg3);text-align:center;padding:10px">结果过多，仅显示前 1200 个。请使用筛选缩小范围。</div>';
  listEl.innerHTML = h;
}

// ===== 交互函数 =====

// 执行搜索：读搜索框值设置 f.kw（快捷词选中状态保留，两者可叠加）
window.小说提取总览执行搜索 = function() {
  var input = document.getElementById('overviewKwInput');
  var v = input ? input.value.trim() : '';
  var a = window.小说提取总览筛选;
  a.kw = v;
  window.小说提取总览筛选 = a;
  刷新视图();
};

// 快捷词 toggle：点一下选中并筛选，再点取消（与自由搜索独立叠加）
window.小说提取总览切快捷词 = function(word) {
  var a = window.小说提取总览筛选;
  a.quick = (a.quick === word) ? '' : word;
  window.小说提取总览筛选 = a;
  刷新视图();
};

// 跳转到来源书籍的提取页（复用加载记录，落 upload 视图显示该书角色卡）
window.小说提取总览跳转 = function(folder) {
  小说提取加载记录(folder);
};

window.小说渲染总览面板 = 小说渲染总览面板;

// 注册惰性详情委托（模块加载即生效，对任何动态插入的列表都有效）
小说提取总览绑定惰性详情();
