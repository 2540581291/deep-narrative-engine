// 玩法参考模块 · 渲染与视图

// ===== 渲染入口（第一层性别导航用全局组件「渲染标签栏」；二级板块导航用 .tl-subnav）=====
var 玩法Api = null;

function 渲染玩法导航(el) {
  if (!el) el = document.getElementById('fap-referenceContent');
  if (!el) return;
  var items = [
    { id: 'female', label: '👩 女性玩法库' },
    { id: 'femboy', label: '👧 伪娘玩法库' },
  ];
  if (!玩法Api) {
    玩法Api = 渲染标签栏(el, items, { active: 玩法性别, onSwitch: function(g) { 切换玩法性别(g); } });
  } else {
    玩法Api.setActive(玩法性别);
  }
  渲染板块导航();
  渲染板块内容();
}

// 二级板块导航 + 内容容器，都渲染进组件 sub
function 渲染板块导航() {
  var sub = 玩法Api ? 玩法Api.sub : null;
  if (!sub) return;
  var blocks = 获取玩法板块();
  var h = '<div class="tl-subnav">';
  h += '<div class="tl-subitem' + (玩法视图 === 'overview' ? ' act' : '') + '" data-fapview="overview">📂 总览</div>';
  blocks.forEach(function(b) {
    var bIcon = (b.icon || '📁');
    h += '<div class="tl-subitem' + (b.id === 玩法板块 && 玩法视图 === 'block' ? ' act' : '') + '" data-fapview="block" data-block="' + escHtml(b.id) + '">' + bIcon + ' ' + escHtml(b.label) + '</div>';
  });
  h += '<div class="tl-subitem' + (玩法视图 === 'appendix' ? ' act' : '') + '" data-fapview="appendix">📋 附表</div>';
  h += '</div><div id="fapBlockContent"></div>';
  sub.innerHTML = h;
  sub.querySelectorAll('.tl-subitem').forEach(function(i) {
    i.addEventListener('click', function() {
      var v = this.getAttribute('data-fapview');
      if (v === 'overview') { 切换玩法总览(); }
      else if (v === 'appendix') { 切换玩法附表(); }
      else if (v === 'block') { 切换玩法板块(this.getAttribute('data-block')); }
    });
  });
}

// ===== 板块详情渲染 =====
function 渲染板块内容() {
  var el = document.getElementById('fapBlockContent');
  if (!el) return;

  if (玩法视图 === 'overview') {
    渲染玩法总览(el);
    return;
  }
  if (玩法视图 === 'appendix') {
    渲染附表内容();
    return;
  }

  el.innerHTML = '<div class="text-center p-30"><div class="loading-spinner"></div></div>';

  加载玩法板块(玩法板块).then(function(entries) {
    var blockLabel = '';
    var blocks = 获取玩法板块();
    blocks.forEach(function(b) { if (b.id === 玩法板块) blockLabel = b.label; });

    var h = '<div class="mb-10">';
    h += '<div class="flex justify-between items-center">';
    h += '<span class="fs-16 fw-700 c-fg">' + escHtml(blockLabel) + '</span>';
    h += '<span class="fs-12 c-fg2">共 ' + entries.length + ' 条</span>';
    h += '</div>';
    h += '<div style="display:flex;gap:6px;margin-top:8px">';
    var anyExpanded = false;
    for (var k in 玩法已展开章节) { if (玩法已展开章节[k]) { anyExpanded = true; break; } }
    if (anyExpanded) {
      h += '<button class="btn-secondary btn-sm" onclick="全部折叠()">− 全部折叠</button>';
    } else {
      h += '<button class="btn-secondary btn-sm" onclick="全部展开()">＋ 全部展开</button>';
    }
    h += '<button class="btn-secondary btn-sm" onclick="切换玩法总览()">‹ 返回总览</button>';
    h += '</div></div>';

    if (entries.length === 0) {
      h += '<div class="placeholder-text">暂无条目，点击上方新增</div>';
      el.innerHTML = h;
      return;
    }

    var groups = {};
    entries.forEach(function(e, i) {
      var ch = e.chapter || '未分类';
      if (!groups[ch]) groups[ch] = [];
      groups[ch].push({ entry: e, idx: i });
    });

    var chKeys = Object.keys(groups);
    h += '<div style="display:flex;flex-direction:column;gap:6px">';

    for (var gi = 0; gi < chKeys.length; gi++) {
      var ch = chKeys[gi];
      var items = groups[ch];
      var isExpanded = 玩法已展开章节[ch] !== false;

      h += '<div style="border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden">';
      h += '<div data-fap-chapter="' + escHtml(ch) + '" onclick="折叠章节(\'' + escHtml(ch) + '\')" style="display:flex;align-items:center;gap:6px;padding:6px 12px;cursor:pointer;border-bottom:1px solid var(--border);user-select:none">';
      h += '<span style="font-size:9px;color:var(--fg3);flex-shrink:0">▶</span>';
      h += '<span style="font-size:12px;color:var(--fg2)">' + escHtml(ch) + '</span>';
      h += '<span class="text-xs">' + items.length + ' 条</span>';
      h += '</div>';

      if (isExpanded) {
        h += '<div style="padding:4px 8px 8px">';
        // 按中类分组，相同中类只显示一次
        var subGroups = {};
        items.forEach(function(item) {
          var sc = item.entry.subclass || '';
          if (!subGroups[sc]) subGroups[sc] = [];
          subGroups[sc].push(item);
        });
        var scKeys = Object.keys(subGroups);
        scKeys.forEach(function(sc) {
          var scItems = subGroups[sc];
          // 中类标题行
          h += '<div style="display:flex;align-items:center;gap:6px;padding:2px 8px;margin-top:4px;margin-bottom:1px;border-radius:3px;background:var(--accent-dim);font-weight:500;font-size:12px;color:var(--accent)">' + escHtml(sc) + '</div>';
          scItems.forEach(function(item, si) {
            var expKey = 'e' + item.idx;
            var isRowExpanded = 玩法已展开条目[expKey] === true;
            var isScrollTarget = (玩法滚动目标条目 === item.idx);

            var rowId = 'fapEntryRow_' + item.idx;
            h += '<div id="' + rowId + '" onclick="折叠条目(' + item.idx + ')" style="display:flex;align-items:center;gap:10px;padding:5px 10px 5px 24px;border-bottom:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;background:' + (isRowExpanded ? 'var(--accent-dim)' : 'transparent') + ';border-left:2px solid ' + (isRowExpanded ? 'var(--accent)' : 'transparent') + ';' + (isScrollTarget ? 'scroll-margin-top:50px' : '') + '">';
            h += '<span style="font-weight:600;font-size:14px;color:var(--accent2);min-width:80px;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(item.entry.entry || '未命名') + '</span>';
            if (item.entry.demo) {
              var demoPreview = item.entry.demo.split('\n').filter(Boolean).slice(0, 2).join(' ｜ ');
              h += '<span style="font-size:11px;color:var(--fg2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(demoPreview).slice(0, 120) + (demoPreview.length > 120 ? '…' : '') + '</span>';
            }
            h += '<span style="margin-left:auto;display:flex;align-items:center;gap:6px;flex-shrink:0">';
            h += '<span style="font-size:10px;color:var(--fg2)">' + (isRowExpanded ? '▲' : '▼') + '</span>';
            h += '</span>';
            h += '</div>';

            if (isRowExpanded) {
              h += 渲染条目详情(item.entry);
            }
          });
        });
        h += '</div>';
      }
      h += '</div>';
    }

    h += '</div>';
    el.innerHTML = h;

    // 滚动到目标章节或条目
    if (玩法滚动目标章节 !== null) {
      var chHeaders = el.querySelectorAll('[data-fap-chapter]');
      chHeaders.forEach(function(el2) {
        if (el2.getAttribute('data-fap-chapter') === 玩法滚动目标章节) {
          el2.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
      玩法滚动目标章节 = null;
    }
    if (玩法滚动目标条目 !== null) {
      var targetRow = document.getElementById('fapEntryRow_' + 玩法滚动目标条目);
      if (targetRow) { targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      玩法滚动目标条目 = null;
    }
    // 恢复保存的滚动位置（展开/折叠操作后）
    if (玩法保存滚动位置 > 0 && !玩法滚动目标条目 && !玩法滚动目标章节) {
      window.scroll(0, 玩法保存滚动位置);
      玩法保存滚动位置 = 0;
    }
  });
}

// ===== 总览 =====
function 渲染玩法总览(el) {
  el.innerHTML = '<div class="text-center p-30"><div class="loading-spinner"></div></div>';

  var blocks = 获取玩法板块();
  var loadPromises = blocks.map(function(b) {
    return 加载玩法板块(b.id).then(function(data) {
      return { block: b, entries: data };
    });
  });

  Promise.all(loadPromises).then(function(results) {
    results.forEach(function(r) {
      r.entries.forEach(function(e, i) { e._idx = i; });
    });

    var genderLabel = 玩法性别 === 'female' ? '女性' : '伪娘';
    var totalCount = 0;
    results.forEach(function(r) { totalCount += r.entries.length; });

    var h = '<div class="mb-10">';
    h += '<div class="flex justify-between items-center">';
    h += '<span class="fs-12 c-fg2">' + blocks.length + ' 板块 · ' + totalCount + ' 条</span>';
    h += '</div>';
    h += '</div>';

    // 整体容器：无内滚动，跟随页面滚
    h += '<div style="overflow-x:auto;padding-bottom:4px">';
    h += '<div style="display:flex;gap:2px;min-width:' + (blocks.length * 总览板块宽度) + 'px">';

    results.forEach(function(r, bi) {
      var block = r.block;
      var entries = r.entries;
      var palette = 章节色板[bi % 章节色板.length];

      var tree = {};
      entries.forEach(function(e) {
        var ch = e.chapter || '未分类';
        var sub = e.subclass || '';
        if (!tree[ch]) tree[ch] = {};
        if (!tree[ch][sub]) tree[ch][sub] = [];
        tree[ch][sub].push({ name: e.entry || '未命名', idx: e._idx });
      });

      h += '<div style="flex:1;min-width:' + (总览板块宽度 - 2) + 'px;display:flex;flex-direction:column">';

      // 板块表头
      h += '<div style="padding:8px 6px;background:var(--bg2);color:var(--fg);font-weight:500;font-size:12px;text-align:center;cursor:pointer;border-radius:4px 4px 0 0;border:1px solid var(--border);border-bottom:none" onclick="切换玩法板块(\'' + block.id + '\')" title="点击进入板块">' + genderLabel + ' · ' + escHtml(block.label) + '</div>';

      // 列名子表头
      h += '<div style="display:flex;font-size:10px;color:var(--fg2);background:var(--bg3);border-left:1px solid var(--border);border-right:1px solid var(--border);padding:3px 4px">';
      h += '<span style="flex:0 0 40px;font-weight:600">章</span>';
      h += '<span style="flex:0 0 40px;font-weight:600">中类</span>';
      h += '<span style="flex:1;font-weight:600">条目</span>';
      h += '</div>';

      // 数据区
      h += '<div style="border:1px solid var(--border);border-top:none;border-radius:0 0 4px 4px;background:var(--bg);overflow:hidden">';

      var chNames = Object.keys(tree);

      chNames.forEach(function(ch) {
        var subs = tree[ch];
        var subNames = Object.keys(subs);

        var chTotal = 0;
        subNames.forEach(function(s) { chTotal += subs[s].length; });

        // 章节行（全宽合并，跨所有子行）
        h += '<div style="display:flex;align-items:center;padding:4px 4px;background:var(--accent-dim);border-bottom:1px solid var(--border);gap:4px;cursor:pointer" onclick="切换玩法板块定位(\'' + block.id + '\',\'' + escHtml(ch) + '\',null)" title="跳转到此章节">';
        h += '<span style="font-size:10px;color:var(--fg2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(ch) + '</span>';
        h += '<span style="font-size:9px;color:var(--fg2);flex-shrink:0">' + chTotal + '条</span>';
        h += '<span style="font-size:9px;color:var(--fg2);flex-shrink:0">›</span>';
        h += '</div>';

        // 用表格实现中类合并单元格（rowspan）
        h += '<table style="width:100%;border-collapse:collapse;font-size:11px">';

        subNames.forEach(function(sub) {
          var items = subs[sub];
          var rowspan = items.length;

          items.forEach(function(item, ei) {
            h += '<tr class="b-border-bottom">';
            if (ei === 0) {
              // 中类：跨 rowspan 行
              h += '<td rowspan="' + rowspan + '" style="width:40px;padding:2px 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--fg2);font-weight:500;vertical-align:top">' + escHtml(sub) + '</td>';
            }
            h += '<td style="padding:2px 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--accent2);font-weight:600;cursor:pointer" onclick="event.stopPropagation();总览条目弹窗(\'' + block.id + '\',\'' + escHtml(ch) + '\',' + item.idx + ')" title="查看条目：' + escHtml(item.name) + '">' + escHtml(item.name) + '</td>';
            h += '</tr>';
          });
        });

        h += '</table>';
      });

      h += '</div></div>';
    });

    h += '</div></div>';
    el.innerHTML = h;
  });
}

// ===== 行内展开详情 =====
function 渲染条目详情(entry) {
  var sections = [
    { key: 'demo', label: '玩法演示', isMulti: true },
    { key: 'progress', label: '进度', isMulti: false },
    { key: 'bodyChange', label: '直接肉体变化', isMulti: true },
    { key: 'psychChange', label: '心理变化', isMulti: false },
    { key: 'keyNode', label: '关键节点', isMulti: false },
    { key: 'linkage', label: '联动', isMulti: false },
  ];

  var h = '<div style="padding:8px 10px 10px 13px;margin:0 0 2px 0;background:var(--bg);border-radius:var(--radius-sm);border:1px solid var(--border);border-left:2px solid var(--accent2);font-size:12px;line-height:1.6">';

  sections.forEach(function(s) {
    var val = entry[s.key];
    if (!val) return;
    h += '<div class="mb-6">';
    h += '<span style="font-weight:600;color:var(--accent2);font-size:11px;display:block;margin-bottom:3px">' + escHtml(s.label) + '</span>';
    if (s.isMulti) {
      val.split('\n').filter(Boolean).forEach(function(line) {
        h += '<div style="padding:4px 8px;margin-bottom:3px;background:var(--bg2);border:1px solid var(--border);border-radius:3px;font-size:11px;line-height:1.4;color:var(--fg)">' + escHtml(line) + '</div>';
      });
    } else {
      h += '<div style="padding-left:8px;color:var(--fg)">' + escHtml(val) + '</div>';
    }
    h += '</div>';
  });

  h += '</div>';
  return h;
}

// ===== 总览条目弹窗 =====
function 总览条目弹窗(blockId, chapter, idx) {
  加载玩法板块(blockId).then(function(entries) {
    var e = entries[idx];
    if (!e) { toast('条目数据异常'); return; }
    var ov = document.createElement('div'); ov.className = 'ovl';
    ov.innerHTML = '<div class="mcard" style="max-width:640px;max-height:85vh;overflow-y:auto">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
      '<span style="font-weight:700;font-size:14px;color:var(--accent)">' + escHtml(e.entry || '未命名') + '</span>' +
      '<button class="btn-sm" style="background:transparent;color:var(--fg2);border:1px solid var(--border)" onclick="this.closest(\'.ovl\').remove()">✕</button></div>' +
      '<div style="font-size:11px;color:var(--fg2);margin-bottom:10px">' + escHtml(e.chapter || '未分类') + ' · ' + escHtml(e.subclass || '') + '</div>' +
      渲染条目详情(e) +
      '</div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function(ev) { if (ev.target === ov) ov.remove(); });
  });
}

// ===== 附表渲染（只读） =====
function 渲染附表内容() {
  var el = document.getElementById('fapBlockContent');
  if (!el) return;

  var h = '<h4>📋 附表 <span class="text-muted text-sm">参考数据</span></h4>';

  if (!玩法附表) {
    h += '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">';
    获取玩法附表().forEach(function(t) {
      var icon = t.cols === 4 ? '📖' : '📋';
      h += '<div class="n-card" style="padding:14px 18px;cursor:pointer;min-width:130px;text-align:center;transition:transform .15s" onmouseover="this.style.transform=\'scale(1.04)\'" onmouseout="this.style.transform=\'\'" onclick="切换玩法附表详情(\'' + t.id + '\')">';
      h += '<div style="font-size:22px;margin-bottom:4px">' + icon + '</div>';
      h += '<div style="font-size:14px;font-weight:600">' + escHtml(t.label) + '</div>';
      h += '<div class="text-muted text-sm">' + t.cols + ' 列</div></div>';
    });
    h += '</div>';
    el.innerHTML = h;
    return;
  }

  var tableDef = null;
  获取玩法附表().forEach(function(t) { if (t.id === 玩法附表) tableDef = t; });
  if (!tableDef) { el.innerHTML = h + '<div class="placeholder-text">未知附表</div>'; return; }

  var columns = tableDef.cols === 4 ? 附表四列定义 : 附表六列定义;
  // 词典用专用的列名
  if (tableDef.cols === 4 && (玩法附表 === '词典')) {
    columns = 附表词典四列定义;
  }
  var toolbar = '<div style="margin-bottom:10px;display:flex;align-items:center;gap:8px">';
  toolbar += '<button class="btn-secondary btn-sm" onclick="返回附表列表()">‹ 返回附表列表</button>';
  toolbar += '<span class="fw-600 ml-4">' + escHtml(tableDef.label) + '</span>';
  toolbar += '</div>';

  el.innerHTML = toolbar + '<div class="text-center p-30"><div class="loading-spinner"></div></div>';

  加载附表(玩法附表).then(function(rows) {
    if (!rows || rows.length === 0) {
      el.innerHTML = toolbar + '<div class="placeholder-text">暂无数据</div>';
      return;
    }

    var html = toolbar;
    html += '<div style="overflow-x:auto;max-height:70vh;overflow-y:auto;border:1px solid var(--border);border-radius:4px">';
    html += '<table style="width:100%;font-size:12px;border-collapse:collapse">';
    html += '<thead><tr style="position:sticky;top:0;z-index:1">';
    columns.forEach(function(c) {
      html += '<th style="padding:7px 10px;background:#2F5496;color:#fff;text-align:left;font-weight:600;white-space:nowrap">' + escHtml(c.label) + '</th>';
    });
    html += '</tr></thead><tbody>';

    if (tableDef.cols === 4) {
      // 4 列表：处理分区标题行 + 普通数据行
      rows.forEach(function(row) {
        var firstVal = row[columns[0].key] || '';
        var hasDataInLater = row[columns[1].key] || row[columns[2].key] || row[columns[3].key];
        if (firstVal && !hasDataInLater) {
          var isMajor = firstVal.indexOf('▌') === 0;
          html += '<tr style="background:' + (isMajor ? '#2F5496' : 'var(--accent-dim)') + '">';
          html += '<td colspan="' + columns.length + '" style="padding:6px 10px;font-weight:' + (isMajor ? '700' : '600') + ';font-size:' + (isMajor ? '13px' : '12px') + ';color:' + (isMajor ? '#fff' : 'var(--accent)') + '">' + escHtml(firstVal.replace(/^▌/, '')) + '</td>';
          html += '</tr>';
        } else {
          html += '<tr class="b-border-bottom">';
          columns.forEach(function(c) {
            html += '<td style="padding:5px 10px;vertical-align:top">' + escHtml((row[c.key] || '')) + '</td>';
          });
          html += '</tr>';
        }
      });
    } else {
      // 6 列表：树形合并（A列区块→B列章节→C列中类→D列条目）
      // 预计算每列的 rowspan：对每行，如果该列有值，从当前位置往后数直到下一个同列有值为止
      var n = rows.length;
      var cols = columns;
      var keyA = cols[0].key, keyB = cols[1].key, keyC = cols[2].key;
      var rowspanA = new Array(n).fill(0);
      var rowspanB = new Array(n).fill(0);
      var rowspanC = new Array(n).fill(0);

      for (var ri = 0; ri < n; ri++) {
        if (rows[ri][keyA]) {
          var cnt = 1;
          for (var j = ri + 1; j < n && !rows[j][keyA]; j++) cnt++;
          rowspanA[ri] = cnt;
        }
        if (rows[ri][keyB]) {
          var cnt = 1;
          for (var j = ri + 1; j < n && !rows[j][keyB]; j++) cnt++;
          rowspanB[ri] = cnt;
        }
        if (rows[ri][keyC]) {
          var cnt = 1;
          for (var j = ri + 1; j < n && !rows[j][keyC]; j++) cnt++;
          rowspanC[ri] = cnt;
        }
      }

      for (var ri = 0; ri < n; ri++) {
        var row = rows[ri];
        html += '<tr class="b-border-bottom">';

        // A列（区块）- 只在合并起始处渲染
        if (row[columns[0].key]) {
          html += '<td rowspan="' + rowspanA[ri] + '" style="padding:5px 10px;vertical-align:top;font-weight:600;color:var(--accent);background:var(--accent-dim);font-size:12px">' + escHtml(row[columns[0].key]) + '</td>';
        }

        // B列（章节）
        if (row[columns[1].key]) {
          html += '<td rowspan="' + rowspanB[ri] + '" style="padding:5px 10px;vertical-align:top;font-weight:600;color:var(--fg2);font-size:11px">' + escHtml(row[columns[1].key]) + '</td>';
        }

        // C列（中类）
        if (row[columns[2].key]) {
          html += '<td rowspan="' + rowspanC[ri] + '" style="padding:5px 10px;vertical-align:top;color:var(--fg2);font-size:11px">' + escHtml(row[columns[2].key]) + '</td>';
        }

        // D列（条目）+ E列（描述）+ F列（示例）
        for (var ci = 3; ci < columns.length; ci++) {
          html += '<td style="padding:5px 10px;vertical-align:top' + (ci === 3 ? ';font-weight:600;font-size:11px' : ';font-size:11px') + '">' + escHtml((row[columns[ci].key] || '')) + '</td>';
        }

        html += '</tr>';
      }
    }

    html += '</tbody></table></div>';
    el.innerHTML = html;
  });
}

window.总览条目弹窗 = 总览条目弹窗;

