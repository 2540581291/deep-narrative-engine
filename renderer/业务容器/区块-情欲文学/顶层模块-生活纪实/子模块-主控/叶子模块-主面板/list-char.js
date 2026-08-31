// 生活纪实 · 模拟列表 + 角色库
var lifeDoc展开角色 = {};
var lifeDoc当前显示文章 = [];
var lifeDoc列表视图 = 'grid'; // 'grid' = 角色卡片网格, 角色名 = 该角色详情

// ===== 模拟列表（重构：角色卡片 + 按人详情） =====

function lifeDoc渲染模拟列表(el) {
  var h = '<div style="padding:0;height:100%;display:flex;flex-direction:column;box-sizing:border-box">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-shrink:0;flex-wrap:wrap">';
  h += '<select id="lifeDocFilterSelect" style="padding:4px 8px;border-radius:4px;background:var(--bg2);color:var(--fg);border:1px solid var(--border);font-size:12px">';
  h += '<option value="all">📋 全部天类型</option>';
  h += '<option value="workday">' + lifeDoc天类型标签.workday + '</option>';
  h += '<option value="restday">' + lifeDoc天类型标签.restday + '</option>';
  h += '<option value="sexday">' + lifeDoc天类型标签.sexday + '</option>';
  h += '<option value="_customSeg">' + lifeDoc天类型标签._customSeg + '</option>';
  h += '<option value="_customDay">' + lifeDoc天类型标签._customDay + '</option>';
  h += '</select>';
  h += '<span style="font-size:11px;color:var(--fg2)">共 <span id="lifeDocArticleCount">0</span> 篇内容</span>';
  h += '</div>';
  h += '<div id="lifeDocArticleList" style="flex:1;overflow-y:auto;min-height:0"></div>';
  h += '</div>';
  el.innerHTML = h;
  document.getElementById('lifeDocFilterSelect').addEventListener('change', lifeDoc刷新筛选);
  lifeDoc列表视图 = 'grid';
  lifeDoc刷新文章列表();
}

function lifeDoc刷新筛选() { lifeDoc刷新文章列表(); }

function lifeDoc刷新文章列表() {
  var filterEl = document.getElementById('lifeDocFilterSelect');
  var filter = filterEl ? filterEl.value : 'all';
  lifeDoc当前显示文章 = [];
  lifeDoc角色库.forEach(function(ch) {
    if (ch.customActivitySegments && Array.isArray(ch.customActivitySegments)) {
      ch.customActivitySegments.forEach(function(seg, si) {
        var content = (seg.draft || '').trim();
        if (content) lifeDoc当前显示文章.push({ charName: ch.name, dayType: '_customSeg', segIdx: si, scene: seg.activities || seg.timeLabel || '', content: content, wordCount: wordCount(content) });
      });
    }
    if (ch.customDayList && Array.isArray(ch.customDayList)) {
      ch.customDayList.forEach(function(day, di) {
        if (day.segments) day.segments.forEach(function(seg, si) {
          var content = (seg.draft || '').trim();
          if (content) lifeDoc当前显示文章.push({ charName: ch.name, dayType: '_customDay', dayIdx: di, segIdx: si, scene: (day.title || '自定义日') + ' · ' + (seg.activities || seg.timeLabel || ''), content: content, wordCount: wordCount(content) });
        });
      });
    }
    if (ch.dailyRoutine) {
      Object.keys(ch.dailyRoutine).forEach(function(ptype) {
        var isPreset = ptype.indexOf('preset_') === 0;
        var isStandard = lifeDoc天类型键.indexOf(ptype) >= 0;
        if (!isPreset && !isStandard) return;
        var preset = isPreset && window.PRESET_DAYS ? PRESET_DAYS.find(function(p) { return p.id === ptype.replace('preset_', ''); }) : null;
        var segs = ch.dailyRoutine[ptype] || [];
        segs.forEach(function(seg, si) {
          var content = (typeof seg.draft === 'string' ? seg.draft : '').trim();
          if (content) {
            var scene = isPreset ? (preset ? preset.icon + ' ' + preset.title : ptype) + ' · ' + (seg.activities || seg.timeLabel || '') : seg.activities || seg.timeLabel || '';
            lifeDoc当前显示文章.push({ charName: ch.name, dayType: ptype, segIdx: si, scene: scene, content: content, wordCount: wordCount(content) });
          }
        });
      });
    }
  });

  // 过滤
  if (filter !== 'all') {
    lifeDoc当前显示文章 = lifeDoc当前显示文章.filter(function(a) { return a.dayType === filter || (filter === '_customDay' && a.dayType.indexOf('custday') === 0); });
  }

  // 给每篇文章加标签和预览
  lifeDoc当前显示文章.forEach(function(a) {
    if (a.dayType && a.dayType.indexOf('preset_') === 0) {
      var pid = a.dayType.replace('preset_', '');
      var p = window.PRESET_DAYS ? PRESET_DAYS.find(function(x) { return x.id === pid; }) : null;
      a.dayTypeLabel = p ? p.icon + ' ' + p.title : a.dayType;
    } else a.dayTypeLabel = lifeDoc天类型标签[a.dayType] || a.dayType;
    a.key = a.charName + '-' + a.dayType + '-' + a.segIdx;
    a.preview = (a.content || '').replace(/<[^>]+>/g, '').trim().slice(0, 80);
  });

  var listEl = document.getElementById('lifeDocArticleList');
  if (!listEl) return;
  var countEl = document.getElementById('lifeDocArticleCount');

  // 如果当前在角色详情视图，显示该角色详情
  if (lifeDoc列表视图 !== 'grid') {
    lifeDoc渲染角色文章详情(listEl, lifeDoc列表视图, countEl);
    return;
  }

  // 角色卡片网格视图
  var h = '';
  var charNames = [];
  var charStats = {};
  lifeDoc当前显示文章.forEach(function(a) {
    if (!charStats[a.charName]) { charStats[a.charName] = { count: 0, words: 0 }; charNames.push(a.charName); }
    charStats[a.charName].count++;
    charStats[a.charName].words += a.wordCount;
  });
  // 保持角色库顺序
  var charOrder = {};
  lifeDoc角色库.forEach(function(ch, i) { charOrder[ch.name] = i; });
  charNames.sort(function(a, b) { return (charOrder[a] || 999) - (charOrder[b] || 999); });

  if (countEl) countEl.textContent = String(lifeDoc当前显示文章.length);

  if (charNames.length === 0) {
    listEl.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--fg2);font-size:13px">暂无内容，请先在写作台创作</div>';
    return;
  }

  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">';
  charNames.forEach(function(cn) {
    var ch = null;
    for (var ci = 0; ci < lifeDoc角色库.length; ci++) { if (lifeDoc角色库[ci].name === cn) { ch = lifeDoc角色库[ci]; break; } }
    if (!ch) return;
    var stats = charStats[cn];
    var genderColors = { '女性':'var(--accent2)', '男性':'var(--blue)', '扶她':'var(--success)', '伪娘':'var(--accent)' };
    var gColor = genderColors[ch.gender] || 'var(--fg2)';
    var genderIcon = { '女性':'♀','男性':'♂','扶她':'⚤','伪娘':'⚥' }[ch.gender] || '?';

    h += '<div class="lifeDocCharCard" data-char="' + escHtml(cn) + '" style="border:1px solid var(--border);border-radius:10px;overflow:hidden;background:var(--bg2);cursor:pointer;transition:transform 0.1s,box-shadow 0.1s">';
    h += '<div style="height:4px;background:' + gColor + ';opacity:0.4"></div>';
    h += '<div style="padding:14px">';
    // 头像行
    h += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">';
    h += '<div style="width:40px;height:40px;border-radius:50%;background:' + gColor + '18;display:flex;align-items:center;justify-content:center;font-size:20px;color:' + gColor + ';flex-shrink:0;border:1px solid ' + gColor + '35">' + genderIcon + '</div>';
    h += '<div style="min-width:0;flex:1">';
    h += '<div style="font-weight:600;font-size:14px;color:var(--fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(cn) + '</div>';
    h += '<div style="font-size:11px;color:var(--fg2);margin-top:2px">';
    if (ch.age != null) h += '' + escHtml(String(ch.age)) + '岁';
    if (ch.title) h += ' · ' + escHtml(ch.title);
    h += '</div></div></div>';
    // 统计
    h += '<div style="display:flex;gap:8px">';
    h += '<span style="font-size:11px;background:var(--accent-dim);color:var(--accent);padding:2px 10px;border-radius:6px">' + stats.count + ' 篇</span>';
    h += '<span style="font-size:11px;background:var(--bg3);color:var(--fg2);padding:2px 10px;border-radius:6px">' + stats.words + ' 字</span>';
    h += '</div>';
    // 简介
    if (ch.bio) {
      h += '<div style="font-size:11px;color:var(--fg3);line-height:1.4;margin-top:8px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">' + escHtml(ch.bio) + '</div>';
    }
    h += '</div></div>';
  });
  h += '</div>';
  listEl.innerHTML = h;

  // 绑定角色卡片点击
  listEl.querySelectorAll('.lifeDocCharCard').forEach(function(card) {
    card.addEventListener('click', function() {
      var cn = this.getAttribute('data-char');
      if (!cn) return;
      lifeDoc列表视图 = cn;
      lifeDoc刷新文章列表();
    });
  });
}

function lifeDoc查看文章(displayIdx) {
  var article = lifeDoc当前显示文章[displayIdx];
  if (!article) return;
  var ch = null;
  for (var c = 0; c < lifeDoc角色库.length; c++) { if (lifeDoc角色库[c].name === article.charName) { ch = lifeDoc角色库[c]; break; } }
  var genderIcon = ch ? ({ '女性': '♀', '男性': '♂', '扶她': '⚤', '伪娘': '⚥' }[ch.gender] || '?') : '';
  var h = '<div style="max-width:720px;margin:0 auto;padding:0 16px">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap">';
  h += '<span style="font-size:20px">' + escHtml(genderIcon) + '</span>';
  h += '<span style="font-size:16px;font-weight:600">' + escHtml(article.charName) + '</span>';
  h += '<span style="flex:1"></span>';
  h += '<span style="font-size:11px;background:var(--bg3);color:var(--fg2);padding:2px 8px;border-radius:4px">' + escHtml(article.dayTypeLabel) + '</span>';
  h += '<span style="font-size:11px;color:var(--fg2)">' + article.wordCount + ' 字</span></div>';
  h += '<div style="font-size:14px;line-height:1.8;color:var(--fg);white-space:pre-wrap;padding:16px;background:var(--bg1);border-radius:8px;border:1px solid var(--border)">' + escHtml(article.content) + '</div>';
  h += '<div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end">';
  h += '<button class="btn-sm" onclick="this.closest(\'.ovl\').remove()" style="padding:6px 16px">关闭</button>';
  h += '<button class="btn-sm" style="padding:6px 16px;color:var(--error);background:var(--bg3)" onclick="lifeDoc删除文章(' + displayIdx + ');this.closest(\'.ovl\').remove()">🗑️ 删除</button></div></div>';
  showModal('📖 ' + escHtml(article.scene), h);
}

function lifeDoc删除文章(displayIdx) {
  var article = lifeDoc当前显示文章[displayIdx];
  if (!article) return;
  confirmDialog('确定删除「' + escHtml(article.scene) + '」？', function() {
    // 清空该时段对应的 draft
    for (var ci = 0; ci < lifeDoc角色库.length; ci++) {
      var ch = lifeDoc角色库[ci];
      if (ch.name !== article.charName) continue;
      if (article.dayType === '_customSeg' && ch.customActivitySegments) {
        var seg = ch.customActivitySegments[article.segIdx];
        if (seg) { seg.draft = ''; seg._draft = ''; }
      } else if (article.dayType === '_customDay' && ch.customDayList) {
        var day = ch.customDayList[article.dayIdx];
        if (day && day.segments) { var seg = day.segments[article.segIdx]; if (seg) { seg.draft = ''; seg._draft = ''; } }
      } else if (ch.dailyRoutine && ch.dailyRoutine[article.dayType]) {
        var seg = ch.dailyRoutine[article.dayType][article.segIdx];
        if (seg) { seg.draft = ''; seg._draft = ''; }
        lifeDoc保存日程(ch.name, article.dayType, ch.dailyRoutine[article.dayType]);
      }
    }
    lifeDoc保存角色();
    lifeDoc刷新文章列表();
    toast('已删除');
  });
}

// ===== 角色详情视图（按天分组） =====

function lifeDoc渲染角色文章详情(el, charName, countEl) {
  var articles = lifeDoc当前显示文章.filter(function(a) { return a.charName === charName; });
  var ch = null;
  for (var ci = 0; ci < lifeDoc角色库.length; ci++) { if (lifeDoc角色库[ci].name === charName) { ch = lifeDoc角色库[ci]; break; } }
  if (countEl) countEl.textContent = String(articles.length);

  if (!ch || articles.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--fg2);font-size:13px">该角色暂无内容</div>';
    return;
  }

  var genderColors = { '女性':'var(--accent2)', '男性':'var(--blue)', '扶她':'var(--success)', '伪娘':'var(--accent)' };
  var gColor = genderColors[ch.gender] || 'var(--fg2)';
  var genderIcon = { '女性':'♀','男性':'♂','扶她':'⚤','伪娘':'⚥' }[ch.gender] || '?';

  var h = '';
  // 角色头部
  h += '<div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;background:var(--bg2);flex-shrink:0">';
  h += '<span style="cursor:pointer;color:var(--accent);font-size:13px;padding:4px 10px;border-radius:6px;background:var(--accent-dim)" onclick="lifeDoc列表视图=\'grid\';lifeDoc刷新文章列表()">← 返回</span>';
  h += '<div style="width:36px;height:36px;border-radius:50%;background:' + gColor + '18;display:flex;align-items:center;justify-content:center;font-size:18px;color:' + gColor + ';border:1px solid ' + gColor + '35">' + genderIcon + '</div>';
  h += '<div><div style="font-weight:600;font-size:15px;color:var(--fg)">' + escHtml(charName) + '</div>';
  h += '<div style="font-size:11px;color:var(--fg2)">' + (ch.age != null ? ch.age + '岁' : '') + (ch.title ? ' · ' + escHtml(ch.title) : '') + ' · 共 ' + articles.length + ' 篇</div></div>';
  h += '</div>';

  // 按天类型分组
  var dayOrder = lifeDoc天类型键.slice();
  dayOrder.push('_customSeg', '_customDay');
  var grouped = {};
  articles.forEach(function(a) {
    var typeKey = a.dayType;
    if (typeKey.indexOf('preset_') === 0) typeKey = '_presets';
    if (!grouped[typeKey]) grouped[typeKey] = [];
    grouped[typeKey].push(a);
  });

  // 渲染已展开的天类型（保持展开状态）
  if (!lifeDoc展开角色[charName]) lifeDoc展开角色[charName] = {};

  h += '<div style="display:flex;flex-direction:column;gap:10px;padding:12px 16px">';
  dayOrder.forEach(function(typeKey) {
    var items = grouped[typeKey];
    if (!items || !items.length) return;
    var isExpanded = lifeDoc展开角色[charName][typeKey] !== false; // 默认展开
    var typeLabel = typeKey === '_presets' ? '📁 预设日' : (lifeDoc天类型标签[typeKey] || typeKey);
    var totalWords = 0;
    items.forEach(function(a) { totalWords += a.wordCount; });

    h += '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;background:var(--bg2)">';
    // 天类型头部
    h += '<div class="lifeDocDayHeader" data-char="' + escHtml(charName) + '" data-type="' + typeKey + '" style="display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;user-select:none;border-bottom:' + (isExpanded ? '1px solid var(--border)' : 'none') + '">';
    h += '<span style="font-size:13px;font-weight:500;color:var(--fg)">' + typeLabel + '</span>';
    h += '<span style="font-size:11px;color:var(--accent);background:var(--accent-dim);padding:1px 8px;border-radius:6px">' + items.length + ' 篇</span>';
    h += '<span style="font-size:11px;color:var(--fg2)">' + totalWords + ' 字</span>';
    h += '<span style="flex:1"></span>';
    h += '<span style="font-size:10px;color:var(--fg2);transition:transform 0.2s' + (isExpanded ? ';transform:rotate(180deg)' : '') + '">▼</span>';
    h += '</div>';
    // 条目列表
    if (isExpanded) {
      h += '<div style="padding:4px 0">';
      items.forEach(function(a, ai) {
        var dayTypeParam = (a.dayType.indexOf('preset_') === 0) ? a.dayType : (a.dayType === '_customSeg' || a.dayType === '_customDay' ? a.dayType : a.dayType);
        h += '<div style="padding:8px 12px' + (ai < items.length - 1 ? ';border-bottom:1px solid var(--border)' : '') + '">';
        h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">';
        h += '<span style="font-size:12px;font-weight:500;color:var(--fg)">' + escHtml(a.scene) + '</span>';
        h += '<span style="flex:1"></span>';
        h += '<span style="font-size:10px;color:var(--fg2)">' + a.wordCount + ' 字</span></div>';
        h += '<div class="lifeDocArticleItem" data-key="' + escHtml(a.key) + '" style="font-size:12px;color:var(--fg2);line-height:1.5;cursor:pointer;padding:5px 8px;border-radius:4px;background:var(--bg1);margin:2px 0 4px">' + escHtml(a.preview || '(空)') + '</div>';
        h += '<div style="display:flex;gap:6px;justify-content:flex-end">';
        h += '<span class="lifeDocGoWrite" data-char="' + escHtml(charName) + '" data-daytype="' + dayTypeParam + '" data-segidx="' + a.segIdx + '" data-dayidx="' + (a.dayIdx != null ? a.dayIdx : '') + '" style="font-size:10px;color:var(--accent);cursor:pointer;padding:2px 8px;border-radius:3px;background:var(--accent-dim)">✍ 去写作</span>';
        h += '<span class="lifeDocArticleDel" data-key="' + escHtml(a.key) + '" style="font-size:10px;color:var(--error);cursor:pointer;opacity:0.5;padding:2px 8px;border-radius:3px">🗑️ 删除</span></div>';
        h += '</div>';
      });
      h += '</div>';
    }
    h += '</div>';
  });
  h += '</div>';
  el.innerHTML = h;

  // 绑定事件
  el.querySelectorAll('.lifeDocDayHeader').forEach(function(hdr) {
    hdr.addEventListener('click', function() {
      var cn = this.getAttribute('data-char');
      var dt = this.getAttribute('data-type');
      if (!cn || !dt) return;
      if (!lifeDoc展开角色[cn]) lifeDoc展开角色[cn] = {};
      lifeDoc展开角色[cn][dt] = lifeDoc展开角色[cn][dt] === false ? true : false;
      lifeDoc刷新文章列表();
    });
  });
  el.querySelectorAll('.lifeDocArticleItem').forEach(function(item) {
    item.addEventListener('click', function() {
      var key = this.getAttribute('data-key');
      for (var i = 0; i < lifeDoc当前显示文章.length; i++) { if (lifeDoc当前显示文章[i].key === key) { lifeDoc查看文章(i); return; } }
    });
  });
  el.querySelectorAll('.lifeDocArticleDel').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var key = this.getAttribute('data-key');
      for (var i = 0; i < lifeDoc当前显示文章.length; i++) { if (lifeDoc当前显示文章[i].key === key) { lifeDoc删除文章(i); return; } }
    });
  });
  el.querySelectorAll('.lifeDocGoWrite').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var cn = this.getAttribute('data-char');
      var dt = this.getAttribute('data-daytype');
      var si = parseInt(this.getAttribute('data-segidx'), 10);
      var diAttr = this.getAttribute('data-dayidx');
      var di = diAttr ? parseInt(diAttr, 10) : null;
      if (!cn || isNaN(si)) return;
      lifeDoc打开写作台(cn, dt, si, di);
    });
  });
}

function lifeDoc打开写作台(charName, dayType, segIdx, dayIdx) {
  for (var ci = 0; ci < lifeDoc角色库.length; ci++) {
    if (lifeDoc角色库[ci].name === charName) {
      lifeDoc当前角色 = lifeDoc角色库[ci];
      lifeDoc当前角色名 = charName;
      break;
    }
  }
  if (!lifeDoc当前角色) { toast('未找到角色'); return; }
  lifeDoc写作台当前天类型 = dayType;
  lifeDoc自定义日索引 = (dayType === '_customDay' && dayIdx != null) ? dayIdx : -1;

  // 设置时段索引
  if (typeof ldw当前段索引 !== 'undefined') {
    ldw当前段索引 = segIdx || 0;
  }

  lifeDoc切换视图('writing');
}

function lifeDoc渲染角色库(el) {
  var h = '<div style="padding:0;height:100%;display:flex;flex-direction:column;box-sizing:border-box">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-shrink:0;flex-wrap:wrap">';
  h += '<button class="btn-new" onclick="lifeDoc新建角色()">＋ 新建</button>';
  h += '<button class="btn-import" onclick="lifeDoc显示导入弹窗()">📥 导入角色</button></div>';
  h += '<div id="lifeDocCharList" style="flex:1;overflow-y:auto;min-height:0"></div></div>';
  el.innerHTML = h;
  lifeDoc渲染角色列表();
}

function lifeDoc新建角色() {
  var genderOpts = ['女性','男性','扶她','伪娘'].map(function(g) { return '<option value="' + g + '">' + g + '</option>'; }).join('');
  var h = '<div style="max-width:480px;margin:0 auto;padding:0 16px">';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">';
  h += '<div><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">姓名</label><input id="lifeDocNewCharName" style="width:100%;padding:6px 8px;border-radius:4px;border:1px solid var(--border);background:var(--bg2);color:var(--fg);font-size:13px" placeholder="输入角色名"></div>';
  h += '<div><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">性别</label><select id="lifeDocNewCharGender" style="width:100%;padding:6px 8px;border-radius:4px;border:1px solid var(--border);background:var(--bg2);color:var(--fg);font-size:13px">' + genderOpts + '</select></div>';
  h += '<div><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">年龄</label><input id="lifeDocNewCharAge" type="number" style="width:100%;padding:6px 8px;border-radius:4px;border:1px solid var(--border);background:var(--bg2);color:var(--fg);font-size:13px" placeholder="如 25"></div>';
  h += '<div><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">称号</label><input id="lifeDocNewCharTitle" style="width:100%;padding:6px 8px;border-radius:4px;border:1px solid var(--border);background:var(--bg2);color:var(--fg);font-size:13px" placeholder="如 上班族"></div></div>';
  h += '<div style="margin-bottom:10px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">简介</label><textarea id="lifeDocNewCharBio" style="width:100%;padding:6px 8px;border-radius:4px;border:1px solid var(--border);background:var(--bg2);color:var(--fg);font-size:12px;min-height:60px;resize:vertical;font-family:inherit" placeholder="角色简介..."></textarea></div>';
  h += '<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn-out" onclick="this.closest(\'.ovl\').remove()" style="padding:6px 16px">取消</button><button class="btn-main" onclick="lifeDoc确认新建角色(this)" style="padding:6px 16px">确认创建</button></div></div>';
  showModal('➕ 新建', h);
}

function lifeDoc确认新建角色(btn) {
  var name = (document.getElementById('lifeDocNewCharName')||{}).value;
  if (!name || !name.trim()) { toast('请输入角色名'); return; }
  name = name.trim();
  for (var i = 0; i < lifeDoc角色库.length; i++) { if (lifeDoc角色库[i].name === name) { toast('角色名已存在'); return; } }
  lifeDoc角色库.push({
    name: name,
    gender: (document.getElementById('lifeDocNewCharGender')||{}).value || '女性',
    age: parseInt((document.getElementById('lifeDocNewCharAge')||{}).value) || 25,
    title: (document.getElementById('lifeDocNewCharTitle')||{}).value.trim() || '',
    bio: (document.getElementById('lifeDocNewCharBio')||{}).value.trim() || '',
    dailyRoutine: lifeDoc空行程(),
    customActivitySegments: [], customDayList: [], customActivityPrompt: ''
  });
  lifeDoc保存角色();
  var ovl = btn.closest('.ovl'); if (ovl) ovl.remove();
  lifeDoc渲染角色列表();
  toast('✅ 已创建：' + name);
}

function lifeDoc渲染角色列表() {
  var el = document.getElementById('lifeDocCharList');
  if (!el) return;
  if (!lifeDoc角色库.length) { el.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--fg2);font-size:13px">暂无角色，点击上方按钮创建或导入</div>'; return; }

  var h = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">';
  lifeDoc角色库.forEach(function(ch, idx) {
    var genderColors = { '女性':'var(--accent2)', '男性':'var(--blue)', '扶她':'var(--success)', '伪娘':'var(--accent)' };
    var gColor = genderColors[ch.gender] || 'var(--fg2)';
    var genderIcon = { '女性':'♀','男性':'♂','扶她':'⚤','伪娘':'⚥' }[ch.gender] || '?';

    // 计算已有日程和文章数
    var hasRoutine = ch.dailyRoutine && (ch.dailyRoutine.workday || ch.dailyRoutine.restday || ch.dailyRoutine.sexday);
    var presetCount = ch.dailyRoutine ? Object.keys(ch.dailyRoutine).filter(function(k) { return k.indexOf('preset_') === 0; }).length : 0;
    var dayCount = 0;
    if (hasRoutine) dayCount += lifeDoc天类型键.filter(function(t) { return ch.dailyRoutine[t] && ch.dailyRoutine[t].length > 0; }).length;

    h += '<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;background:var(--bg2)">';
    // 顶部色条 + 头像区
    h += '<div style="height:4px;background:' + gColor + ';opacity:0.5"></div>';
    h += '<div style="padding:12px 14px 10px">';
    // 第一行：头像 + 姓名 + 性别
    h += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">';
    h += '<div style="width:36px;height:36px;border-radius:50%;background:' + gColor + '20;display:flex;align-items:center;justify-content:center;font-size:18px;color:' + gColor + ';flex-shrink:0;border:1px solid ' + gColor + '40">' + genderIcon + '</div>';
    h += '<div style="min-width:0;flex:1">';
    h += '<div style="font-weight:600;font-size:13px;color:var(--fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(ch.name) + '</div>';
    h += '<div style="font-size:10px;color:var(--fg2);margin-top:1px">';
    if (ch.age != null) h += '<span>' + escHtml(String(ch.age)) + '岁</span>';
    if (ch.title) h += '<span style="margin-left:4px">· ' + escHtml(ch.title) + '</span>';
    if (!ch.age && !ch.title) h += '<span style="color:var(--fg3)">' + ch.gender + '</span>';
    h += '</div></div>';
    // 状态徽章
    h += '<div style="display:flex;gap:3px;flex-shrink:0;align-items:center">';
    if (dayCount > 0) h += '<span style="font-size:9px;padding:1px 6px;border-radius:4px;background:var(--accent-dim);color:var(--accent2)">' + dayCount + '天</span>';
    if (presetCount > 0) h += '<span style="font-size:9px;padding:1px 6px;border-radius:4px;background:var(--green-dim);color:var(--success)">+' + presetCount + '</span>';
    h += '</div></div>';

    // 简介（有就显示）
    if (ch.bio) {
      h += '<div style="font-size:10px;color:var(--fg2);line-height:1.5;margin-bottom:8px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;padding:0 2px">' + escHtml(ch.bio) + '</div>';
    }

    // 分隔线
    h += '<div style="border-top:1px solid var(--border);margin:0 -14px;padding:6px 14px 0;display:flex;gap:4px;flex-wrap:wrap">';
    // 按钮
    h += '<button class="lifeDocCharPlan" data-idx="' + idx + '" style="flex:1;padding:4px 0;font-size:10px;border-radius:4px;background:' + gColor + '15;color:' + gColor + ';border:1px solid ' + gColor + '30;cursor:pointer;text-align:center">📋 规划</button>';
    var hasRoutine = ch.dailyRoutine && lifeDoc天类型键.some(function(t) { return ch.dailyRoutine[t] && ch.dailyRoutine[t].length > 0; });
    h += '<button class="lifeDocCharAiAnalyze" data-idx="' + idx + '" style="flex:1;padding:4px 0;font-size:10px;border-radius:4px;background:var(--bg3);color:var(--fg2);border:1px solid var(--border);cursor:pointer;text-align:center">🤖 ' + (hasRoutine ? '再次分析' : '分析') + '</button>';
    h += '<button class="lifeDocCharDel" data-idx="' + idx + '" style="padding:4px 8px;font-size:10px;border-radius:4px;background:transparent;color:var(--error);border:1px solid transparent;cursor:pointer" title="删除">🗑</button>';
    h += '</div></div></div>';
  });
  h += '</div>';
  el.innerHTML = h;
  el.querySelectorAll('.lifeDocCharPlan').forEach(function(btn) { btn.addEventListener('click', function() { var idx = parseInt(this.getAttribute('data-idx')); if (isNaN(idx)) return; lifeDoc规划角色索引 = idx; lifeDoc当前角色 = lifeDoc角色库[idx]; lifeDoc当前角色名 = lifeDoc角色库[idx].name; lifeDoc切换视图('plan'); }); });
  el.querySelectorAll('.lifeDocCharAiAnalyze').forEach(function(btn) { btn.addEventListener('click', function() { var idx = parseInt(this.getAttribute('data-idx')); if (isNaN(idx)) return; lifeDocAI分析日常(idx); }); });
  el.querySelectorAll('.lifeDocCharDel').forEach(function(btn) { btn.addEventListener('click', function() { var idx = parseInt(this.getAttribute('data-idx')); if (isNaN(idx)) return; lifeDoc删除角色(idx); }); });
}

function lifeDoc删除角色(idx) {
  var ch = lifeDoc角色库[idx];
  if (!ch) return;
  confirmDialog('确定删除「' + escHtml(ch.name) + '」？', function() {
    var name = ch.name;
    lifeDoc角色库.splice(idx, 1);
    lifeDoc保存角色();
    // 删除磁盘上的角色目录（含所有日程文件）
    var lifeDocDir = (typeof STORE_DIRS !== 'undefined' && STORE_DIRS.lifeDoc) ? STORE_DIRS.lifeDoc : '生活纪实';
    LocalFS.delete(lifeDocDir + '/' + LocalFS.sanitize(name)).catch(function(){});
    lifeDoc渲染角色列表();
    toast('已删除');
  });
}

// ===== 工具：安全格式化年龄/称号等可能为对象或字符串的字段 =====

// ===== 导入角色（两步：性别选择 → 角色列表） =====

function lifeDoc显示导入弹窗() {
  var sel = '<div class="mcard" style="max-width:360px"><h3 style="font-size:14px;margin-bottom:12px">选择要导入的角色性别</h3>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
    '<button class="btn-main" onclick="this.closest(\'.ovl\').remove();lifeDoc显示导入角色列表(\'女性\')">女性</button>' +
    '<button class="btn-main bg-accent2" onclick="this.closest(\'.ovl\').remove();lifeDoc显示导入角色列表(\'伪娘\')">伪娘</button>' +
    '<button class="btn-main" onclick="this.closest(\'.ovl\').remove();lifeDoc显示导入角色列表(\'扶她\')" style="background:#e94560">扶她</button>' +
    '<button class="btn-main" onclick="this.closest(\'.ovl\').remove();lifeDoc显示导入角色列表(\'男性\')" style="background:#6bc">男性</button></div>' +
    '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button></div>';
  var ov = document.createElement('div');
  ov.className = 'ovl'; ov.innerHTML = sel;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
}

function lifeDoc显示导入角色列表(genderFilter) {
  var genderMap = { 'female': '女性', 'male': '男性', 'femboy': '伪娘', 'futa': '扶她', 'beast': '男性' };
  Store.character.list().then(function(items) {
    var h = '<div class="mcard" style="max-width:500px;max-height:500px;overflow-y:auto">';
    h += '<h3 style="font-size:14px;margin-bottom:10px">📂 选择 ' + genderFilter + ' 角色</h3>';
    h += '<div class="text-muted text-sm mb-8">点击角色导入到生活纪实</div>';
    if (!items || !items.length) {
      h += '<div class="placeholder-text">暂无角色卡数据，请先在角色卡模块创建角色</div>';
    } else {
      items.forEach(function(c) {
        var bi = c.identity && c.identity.basicInfo || {};
        var cg = genderMap[bi.gender] || bi.gender;
        if (cg !== genderFilter) return;
        h += '<div class="n-card" style="cursor:pointer;margin-bottom:4px;padding:8px" data-name="' + escHtml(bi.name || c.title || '') + '">';
        h += '<div class="fw-600 fs-13">' + escHtml(bi.name || c.title || '未命名') + (bi.age ? ' <span class="text-muted" style="font-weight:400;font-size:11px">' + bi.age + '岁</span>' : '') + '</div>';
        h += (bi.title ? '<div class="text-muted text-sm" style="font-size:11px;color:var(--fg2);margin-top:2px">' + escHtml(bi.title) + '</div>' : '');
        h += '</div>';
      });
    }
    h += '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:8px">';
    h += '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button></div></div>';

    var ov = document.createElement('div');
    ov.className = 'ovl'; ov.innerHTML = h;
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });

    ov.querySelectorAll('[data-name]').forEach(function(card) {
      card.addEventListener('click', function() {
        var name = this.getAttribute('data-name');
        ov.remove();
        Store.character.get(name).then(function(data) {
          if (!data) { toast('角色数据不存在'); return; }
          lifeDoc完成导入(data);
        });
      });
    });
  }).catch(function(err) { console.error('[生活纪实] 导入角色失败:', err); toast('读取角色卡失败'); });
}

function lifeDoc完成导入(data) {
  var bi = data.identity && data.identity.basicInfo || {};
  var name = bi.name || data.title || '';
  if (!name) { toast('角色数据不完整'); return; }
  // 检查重名
  for (var i = 0; i < lifeDoc角色库.length; i++) {
    if (lifeDoc角色库[i].name === name) { toast('该角色已在库中'); return; }
  }
  lifeDoc角色库.push({
    name: name,
    gender: bi.gender || '女性',
    age: bi.age || '',
    title: bi.title || '',
    identity: data.identity ? JSON.parse(JSON.stringify(data.identity)) : {},
    dailyRoutine: lifeDoc空行程(),
    customActivitySegments: [],
    customDayList: [],
    customActivityPrompt: '',
    createdAt: Date.now()
  });
  lifeDoc保存角色();
  if (lifeDoc当前视图 === 'chars') lifeDoc渲染角色列表();
  toast('✅ 已导入：' + name);
}

// ===== AI 分析 =====

// 获取角色的完整数据（优先从 S.generatedCharacters 取完整角色卡）
function lifeDocFullCharData(ch) {
  if (typeof S === 'undefined' || !S.generatedCharacters || !ch) return null;
  var genderMap = { '女性':'female', '男性':'male', '伪娘':'femboy', '扶她':'futa' };
  var catKey = genderMap[ch.gender] || 'female';
  var cat = S.generatedCharacters[catKey];
  if (cat) {
    var keys = Object.keys(cat);
    for (var i = 0; i < keys.length; i++) {
      var entry = cat[keys[i]];
      if (entry.fullChar) {
        var fcName = entry.fullChar.name || (entry.fullChar.identity && entry.fullChar.identity.basicInfo && entry.fullChar.identity.basicInfo.name);
        var biName = ch.name || ch.title;
        if (fcName === biName) return entry.fullChar;
        if (entry.outline) {
          var olName = entry.outline.name || (entry.outline.identity && entry.outline.identity.basicInfo && entry.outline.identity.basicInfo.name);
          if (olName === biName) return entry.fullChar;
        }
      }
    }
  }
  return null;
}

function lifeDocAI分析日常(idx) {
  var ch = lifeDoc角色库[idx];
  if (!ch) return;
  
  var sourceData = lifeDocFullCharData(ch);
  // 清理掉已经规划好的日程数据，只传角色自身信息给 LLM
  var cleanData = JSON.parse(JSON.stringify(sourceData));
  delete cleanData.dailyRoutine;
  delete cleanData.customDayList;
  delete cleanData.customActivitySegments;
  delete cleanData.customActivityPrompt;
  var charData = JSON.stringify(cleanData, null, 2);
  var rendered = renderPrompt('life_doc_analyze', { charData: charData });
  LLM.callJSON({ prompt: rendered.user || '', system: rendered.system || '', label: 'AI分析日常: ' + ch.name }).then(function(data) {
    if (!data) { toast('AI 返回异常'); return; }
    ch.dailyRoutine = lifeDoc空行程();
    lifeDoc天类型键.forEach(function(k) { ch.dailyRoutine[k] = (data[k] && data[k].length) ? data[k] : []; });
    lifeDoc保存角色();
    toast(ch.name + ' 日常分析完成');
    if (lifeDoc当前视图 === 'chars') lifeDoc渲染角色列表();
  }).catch(function(err) { toast('⚠️ 分析失败: ' + (err.message || '未知错误')); });
}

function lifeDocAI分析单日日程(type) {
  var ch = lifeDoc角色库[lifeDoc规划角色索引];
  if (!ch) { toast('请先选择角色'); return; }
  
  var dayHint = type === 'workday' ? '工作日，按上班/上学节奏安排。' : type === 'restday' ? '休息日，休闲娱乐为主。' : '性爱日，以性爱为核心。';
  var prompt = '为以下角色生成' + dayHint + '\n角色：' + ch.name + '\n简介：' + (ch.bio || '无') + '\n\n输出JSON数组：[{"timeLabel":"","timeRange":"","plays":"","narrative":"","location":""}] 每个时段5个字段完整填写，共5-8个时段，时间范围首尾相接。';
  LLM.callJSON({ prompt: prompt, system: '你是生活模拟分析师。输出JSON数组。', label: 'AI行程: ' + ch.name }).then(function(data) {
    if (!data || !data.length) {  toast('生成失败'); return; }
    if (!ch.dailyRoutine) ch.dailyRoutine = lifeDoc空行程();
    ch.dailyRoutine[type] = data;
    lifeDoc保存角色();
    
    toast(ch.name + ' ' + type + ' 已生成');
    if (lifeDoc当前视图 === 'plan') lifeDoc渲染生活规划(document.getElementById('lifeDocViewContent'));
  }).catch(function(err) {  });
}

function lifeDoc默认行程(type) {
  var d = {
    workday: [
      { timeLabel:'早晨', timeRange:'6:30-7:30', activities:'起床、洗漱、早餐', details:'', location:'家' },
      { timeLabel:'通勤', timeRange:'7:30-8:30', activities:'通勤路上', details:'', location:'通勤途中' },
      { timeLabel:'上午', timeRange:'8:30-12:00', activities:'上午工作', details:'', location:'办公室' },
      { timeLabel:'午休', timeRange:'12:00-13:30', activities:'午餐、休息', details:'', location:'餐厅' },
      { timeLabel:'下午', timeRange:'13:30-18:00', activities:'下午工作', details:'', location:'办公室' },
      { timeLabel:'傍晚', timeRange:'18:00-19:30', activities:'下班回家、晚餐', details:'', location:'家' },
      { timeLabel:'晚间', timeRange:'19:30-22:30', activities:'自由活动', details:'', location:'家' },
      { timeLabel:'睡眠', timeRange:'22:30-6:30', activities:'睡觉', details:'', location:'家' },
    ],
    restday: [
      { timeLabel:'早晨', timeRange:'8:00-9:30', activities:'自然醒、懒床', details:'', location:'家' },
      { timeLabel:'上午', timeRange:'9:30-12:00', activities:'休闲活动', details:'', location:'家/外出' },
      { timeLabel:'中午', timeRange:'12:00-14:00', activities:'午餐、午休', details:'', location:'家' },
      { timeLabel:'下午', timeRange:'14:00-17:00', activities:'外出/娱乐', details:'', location:'外出' },
      { timeLabel:'傍晚', timeRange:'17:00-19:00', activities:'准备晚餐', details:'', location:'家' },
      { timeLabel:'晚上', timeRange:'19:00-23:00', activities:'夜间娱乐', details:'', location:'家' },
    ],
    sexday: [
      { timeLabel:'早晨', timeRange:'7:00-8:00', activities:'晨起调情', details:'', location:'卧室' },
      { timeLabel:'上午', timeRange:'8:00-12:00', activities:'期待与准备', details:'', location:'家' },
      { timeLabel:'中午', timeRange:'12:00-13:00', activities:'亲密午餐', details:'', location:'餐厅' },
      { timeLabel:'下午', timeRange:'13:00-17:00', activities:'主戏时间', details:'', location:'卧室' },
      { timeLabel:'傍晚', timeRange:'17:00-19:00', activities:'温存休憩', details:'', location:'卧室' },
      { timeLabel:'晚上', timeRange:'19:00-23:00', activities:'第二次约会', details:'', location:'家' },
    ],
  };
  return d[type] || d.workday;
}

// ===== 导出 =====
window.lifeDoc展开角色 = lifeDoc展开角色;
window.lifeDoc渲染模拟列表 = lifeDoc渲染模拟列表;
window.lifeDoc刷新筛选 = lifeDoc刷新筛选;
window.lifeDoc刷新文章列表 = lifeDoc刷新文章列表;
window.lifeDoc查看文章 = lifeDoc查看文章;
window.lifeDoc删除文章 = lifeDoc删除文章;
window.lifeDoc渲染角色文章详情 = lifeDoc渲染角色文章详情;
window.lifeDoc打开写作台 = lifeDoc打开写作台;
window.lifeDoc列表视图 = lifeDoc列表视图;
window.lifeDoc渲染角色库 = lifeDoc渲染角色库;
window.lifeDoc新建角色 = lifeDoc新建角色;
window.lifeDoc确认新建角色 = lifeDoc确认新建角色;
window.lifeDoc渲染角色列表 = lifeDoc渲染角色列表;
window.lifeDoc删除角色 = lifeDoc删除角色;
window.lifeDoc显示导入弹窗 = lifeDoc显示导入弹窗;
window.lifeDoc显示导入角色列表 = lifeDoc显示导入角色列表;
window.lifeDoc完成导入 = lifeDoc完成导入;
window.lifeDocAI分析日常 = lifeDocAI分析日常;
window.lifeDocAI分析单日日程 = lifeDocAI分析单日日程;
window.lifeDoc默认行程 = lifeDoc默认行程;
window.lifeDocFullCharData = lifeDocFullCharData;
