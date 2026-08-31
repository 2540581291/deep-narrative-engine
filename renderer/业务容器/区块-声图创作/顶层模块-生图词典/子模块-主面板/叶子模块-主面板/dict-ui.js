// 生图词典 · UI 层（词典 tab：词库浏览 / 详情编辑 / 组合拼装）

var STCD_DICT_BATCH = 80;

// ===== 筛选后的词条（按当前分区 + 大类 + 子类）=====
function stcdDictFiltered() {
  var all = stcdDictSectionItems(STCD_DICT.section);
  var f = STCD_DICT.filter;        // 大类
  var sf = STCD_DICT.subfilter;    // 子类
  var q = STCD_DICT.search.trim();
  return all.filter(function(it) {
    if (f === '⭐ 收藏' && !STCD_DICT.favIds[it.id]) return false;
    if (f !== '全部' && f !== '⭐ 收藏' && it.cat !== f) return false;
    if (sf && it.subcat !== sf) return false;
    if (q) {
      var hay = (it.zh || '') + (it.tag || '');
      if (hay.indexOf(q) < 0) return false;
    }
    return true;
  });
}

// ===== 主渲染 =====
function stcdDictRender(el) {
  if (!el) el = document.getElementById('stcdTabContent');
  if (!el) return;
  var h = '';
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
  h += '<div style="font-size:14px;color:var(--fg);font-weight:700">📖 词库</div>';
  // 分区 chips：正常 / 色情 / LoRA
  h += '<div style="display:flex;gap:4px">';
  [['normal', '🌿 正常'], ['nsfw', '🔞 色情'], ['lora', '🧬 LoRA']].forEach(function(s) {
    var active = STCD_DICT.section === s[0];
    h += '<span class="btn-out btn-sm" style="font-size:11px;padding:3px 10px;' + (active ? 'background:var(--accent);color:#fff;border-color:var(--accent)' : '') + ';cursor:pointer" onclick="stcdDictSection(\'' + s[0] + '\')">' + s[1] + '</span>';
  });
  h += '</div>';
  h += '<div id="stcd-dict-stats" style="font-size:11px;color:var(--fg3);flex:1">加载中…</div>';
  h += '<button class="btn-out" style="padding:3px 10px;font-size:11px" onclick="stcdShowSavedPrompts()">📁 保存的提示词</button>';
  h += '<button class="btn-main" style="padding:3px 10px;font-size:11px" onclick="stcdDictNew()">➕ 新增词条</button>';
  h += '</div>';
  h += '<div style="display:grid;grid-template-columns:3fr 2fr;gap:10px;align-items:start">';
  // 左列：搜索 + 分类 + 列表
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px">';
  h += '<div style="display:flex;gap:6px;margin-bottom:8px">';
  h += '<input id="stcd-dict-search" type="text" placeholder="搜索中文词 / 英文标签…" value="' + escHtml(STCD_DICT.search) + '" style="flex:1;font-size:12px;padding:4px 8px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;color:var(--fg)" onkeydown="if(event.key===\'Enter\'){stcdDictSearch(this.value)}">';
  h += '<button class="btn btn-sm" style="font-size:11px;padding:4px 10px" onclick="stcdDictSearch(document.getElementById(\'stcd-dict-search\').value)">🔍</button>';
  if (STCD_DICT.search) h += '<span style="font-size:10px;color:var(--fg3);cursor:pointer;align-self:center" onclick="stcdDictSearch(\'\')">✕ 清除</span>';
  h += '</div>';
  h += '<div id="stcd-dict-cats" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px"></div>';
  h += '<div id="stcd-dict-list" style="max-height:52vh;overflow-y:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:6px;align-content:start;padding:2px"></div>';
  h += '</div>';
  // 右列：详情/编辑 + 组合拼装
  h += '<div>';
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px">';
  h += '<div style="font-size:13px;color:var(--fg);font-weight:600;margin-bottom:6px">📋 词条详情 / 编辑</div>';
  h += '<div id="stcd-dict-detail" style="font-size:12px;color:var(--fg3)">点击左侧词条查看详情，或点「➕ 新增词条」</div>';
  h += '</div>';
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px">';
  h += '<div style="font-size:13px;color:var(--fg);font-weight:600;margin-bottom:6px;display:flex;align-items:center;gap:8px">🧩 组合拼装';
  h += '<button class="btn-out" style="padding:2px 10px;font-size:11px" onclick="stcdRandomCombo()">🎲 随机拼装</button>';
  h += '</div>';
  h += '<div id="stcd-dict-combo"></div>';
  h += '</div>';
  h += '</div>';
  h += '</div>';
  el.innerHTML = h;
  stcdDictLoad().then(function() {
    stcdDictRefreshAll();
  });
}

// 分区切换（不同分区读取不同的内置/用户词典文件）
function stcdDictSection(s) {
  if (s === STCD_DICT.section) return;
  STCD_DICT.section = s;
  STCD_DICT.filter = '全部';
  STCD_DICT.subfilter = '';
  STCD_DICT.search = '';
  STCD_DICT.selected = {};
  // 重置加载状态，按新分区重载数据
  if (typeof stcdDictReload === 'function') {
    stcdDictReload().then(function() {
      stcdDictRender(document.getElementById('stcdTabContent'));
    });
  } else {
    stcdDictRender(document.getElementById('stcdTabContent'));
  }
}

// 刷新当前分区视图（统计/分类 chips/列表/详情/组合）
function stcdDictRefreshAll() {
  var stats = document.getElementById('stcd-dict-stats');
  if (stats) {
    var secItems = stcdDictSectionItems(STCD_DICT.section);
    var zoneTxt = (STCD_DICT.section === 'nsfw') ? '🔞 色情' : ((STCD_DICT.section === 'lora') ? '🧬 LoRA' : '🌿 正常');
    stats.textContent = '共 ' + secItems.length + ' 条（' + zoneTxt + '）';
  }
  stcdDictRenderCats();
  stcdDictRenderList();
  stcdDictRenderCombo();
  stcdDictRenderDetail();
}

// 当前分区的分类表（正常 → STCD_DICT_CATS；色情 → STCD_DICT_NSFW_CATS；LoRA → STCD_DICT_LORA_CATS）
function stcdDictCatsTable() {
  if (STCD_DICT.section === 'nsfw' && typeof STCD_DICT_NSFW_CATS !== 'undefined') return STCD_DICT_NSFW_CATS;
  if (STCD_DICT.section === 'lora' && typeof STCD_DICT_LORA_CATS !== 'undefined') return STCD_DICT_LORA_CATS;
  return STCD_DICT_CATS;
}

// 全部分类表（正常 + 色情 + LoRA 合并，用于编辑表单下拉）
function stcdDictAllCats() {
  var merged = STCD_DICT_CATS.slice();
  [STCD_DICT_NSFW_CATS, STCD_DICT_LORA_CATS].forEach(function(table) {
    if (typeof table === 'undefined') return;
    table.forEach(function(c) {
      if (!merged.some(function(x) { return x.name === c.name; })) merged.push(c);
    });
  });
  return merged;
}

// 分类 chips（正常/色情/LoRA 区统一）——大类 chips + 选中大类后显示子类 chips
function stcdDictRenderCats() {
  var el = document.getElementById('stcd-dict-cats');
  if (!el) return;
  var cats = stcdDictCatsTable();
  var h = '';
  h += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px">';
  ['全部', '⭐ 收藏'].forEach(function(c) {
    var active = STCD_DICT.filter === c;
    h += '<span class="btn-out btn-sm" style="font-size:10px;padding:2px 8px;' + (active ? 'background:var(--accent);color:#fff;border-color:var(--accent)' : '') + ';cursor:pointer" onclick="stcdDictFilter(\'' + c + '\')">' + c + '</span>';
  });
  cats.forEach(function(c) {
    var active = STCD_DICT.filter === c.name;
    h += '<span class="btn-out btn-sm" style="font-size:10px;padding:2px 8px;' + (active ? 'background:var(--accent);color:#fff;border-color:var(--accent)' : '') + ';cursor:pointer" onclick="stcdDictFilter(\'' + c.name + '\')">' + c.name + '</span>';
  });
  h += '</div>';
  // 选中大类后显示子类 chips
  var curCat = cats.filter(function(c) { return c.name === STCD_DICT.filter; })[0];
  if (curCat) {
    h += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px;padding-left:8px">';
    h += '<span class="btn-out btn-sm" style="font-size:10px;padding:2px 8px;' + (!STCD_DICT.subfilter ? 'background:var(--accent);color:#fff;border-color:var(--accent)' : '') + ';cursor:pointer" onclick="stcdDictSubFilter(\'\')">全部子类</span>';
    curCat.subs.forEach(function(s) {
      var active = STCD_DICT.subfilter === s;
      h += '<span class="btn-out btn-sm" style="font-size:10px;padding:2px 8px;' + (active ? 'background:var(--accent);color:#fff;border-color:var(--accent)' : '') + ';cursor:pointer" onclick="stcdDictSubFilter(\'' + s + '\')">' + s + '</span>';
    });
    h += '</div>';
  }
  el.innerHTML = h;
}

// ===== 列表（分批渲染）=====
function stcdDictRenderList() {
  var el = document.getElementById('stcd-dict-list');
  if (!el) return;
  STCD_DICT.renderedCount = 0;
  el.innerHTML = '';
  el.scrollTop = 0;
  stcdDictAppendList();
}

function stcdDictAppendList() {
  var el = document.getElementById('stcd-dict-list');
  if (!el) return;
  var filtered = stcdDictFiltered();
  if (!filtered.length) {
    var emptyTxt = (STCD_DICT.section === 'nsfw')
      ? '暂无色情词条——点击「➕ 新增词条」或从提示词页「⭐ 收藏入词库」'
      : '无匹配词条';
    el.innerHTML = '<div style="font-size:12px;color:var(--fg3);padding:16px 0;grid-column:1 / -1;text-align:center">' + emptyTxt + '</div>';
    return;
  }
  var h = '';
  var start = STCD_DICT.renderedCount;
  var end = Math.min(start + STCD_DICT_BATCH, filtered.length);
  for (var i = start; i < end; i++) {
    var it = filtered[i];
    var checked = STCD_DICT.selected[it.id] ? ' checked' : '';
    var fav = STCD_DICT.favIds[it.id] ? '⭐' : '';
    // 竖长条卡片：缩略图在上方占大头，文字区在下方窄条（content-visibility 跳过视口外布局）
    h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:6px;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;position:relative;content-visibility:auto;contain-intrinsic-size:auto 210px" onclick="stcdDictView(\'' + it.id + '\')">';
    // 缩略图（占大头，异步加载，点击预览大图）
    h += '<span id="dictimg_' + escHtml(it.zh) + '" style="height:150px;background:var(--bg2);overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0" onclick="event.stopPropagation();stcdDictPreviewImg(\'' + escHtml(it.zh) + '\')">🗒</span>';
    // 下方窄条：中文名 + tag（不显示分类/子类）
    h += '<div style="padding:4px 5px 5px;display:flex;flex-direction:column;gap:2px;flex:1;min-width:0">';
    h += '<div style="font-size:11px;color:var(--fg);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(it.zh) + '</div>';
    // tag 两行截断（webkit-line-clamp）
    h += '<div style="font-size:9px;color:var(--fg2);line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-all;min-height:24px">' + escHtml(it.tag) + '</div>';
    h += '</div>';
    // 收藏角标
    if (fav) h += '<span style="position:absolute;top:4px;right:6px;font-size:11px">' + fav + '</span>';
    // 勾选框
    h += '<input type="checkbox" id="dictchk_' + it.id + '"' + checked + ' onclick="event.stopPropagation();stcdDictToggle(\'' + it.id + '\',this)" style="position:absolute;top:4px;left:6px;width:16px;height:16px;cursor:pointer">';
    h += '</div>';
  }
  el.insertAdjacentHTML('beforeend', h);
  // 异步加载缩略图（并发队列限制，避免 IPC 洪峰）
  for (var li = start; li < end; li++) {
    stcdDictImgEnqueue(filtered[li].zh);
  }
  STCD_DICT.renderedCount = end;
  // 触底追加
  el.onscroll = function() {
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      stcdDictAppendList();
    }
  };
  if (end >= filtered.length) el.onscroll = null;
}

// ===== 缩略图并发加载队列（同时最多 6 个 in-flight）=====
var STCD_DICT_IMG_QUEUE = [];
var STCD_DICT_IMG_INFLIGHT = 0;
var STCD_DICT_IMG_MAX = 6;

function stcdDictImgEnqueue(zh) {
  STCD_DICT_IMG_QUEUE.push(zh);
  stcdDictImgPump();
}

function stcdDictImgPump() {
  while (STCD_DICT_IMG_INFLIGHT < STCD_DICT_IMG_MAX && STCD_DICT_IMG_QUEUE.length) {
    var zh = STCD_DICT_IMG_QUEUE.shift();
    STCD_DICT_IMG_INFLIGHT++;
    (function(targetZh) {
      stcdDictImg(targetZh).then(function(dataUrl) {
        if (dataUrl) {
          var span = document.getElementById('dictimg_' + escHtml(targetZh));
          if (span) {
            span.innerHTML = '<img src="' + dataUrl + '" style="width:100%;height:100%;object-fit:cover;display:block" />';
          }
        }
      }).catch(function() {}).then(function() {
        STCD_DICT_IMG_INFLIGHT--;
        stcdDictImgPump();
      });
    })(zh);
  }
}

// ===== 搜索 / 筛选 =====
function stcdDictSearch(q) {
  STCD_DICT.search = q || '';
  stcdDictRenderList();
  var input = document.getElementById('stcd-dict-search');
  if (input) input.value = STCD_DICT.search;
}

function stcdDictFilter(c) {
  STCD_DICT.filter = c;
  STCD_DICT.subfilter = '';
  stcdDictRenderList();
  stcdDictRenderCats();
}

function stcdDictSubFilter(s) {
  STCD_DICT.subfilter = s;
  stcdDictRenderList();
  stcdDictRenderCats();
}

// ===== 勾选（局部刷新组合区，不重渲染列表）=====
function stcdDictToggle(id, el) {
  if (STCD_DICT.selected[id]) delete STCD_DICT.selected[id];
  else STCD_DICT.selected[id] = true;
  stcdDictRenderCombo();
}

// ===== 组合拼装 =====
function stcdDictRenderCombo() {
  var el = document.getElementById('stcd-dict-combo');
  if (!el) return;
  var ids = Object.keys(STCD_DICT.selected);
  if (!ids.length) {
    el.innerHTML = '<div style="font-size:12px;color:var(--fg3)">勾选左侧词条开始拼装</div>';
    return;
  }
  var picked = ids.map(function(id) { return stcdDictFind(id); }).filter(Boolean);
  var pos = picked.filter(function(it) { return it.cat !== '负面'; });
  var neg = picked.filter(function(it) { return it.cat === '负面'; });
  // 按分类顺序排序
  var catOrder = {};
  stcdDictAllCats().forEach(function(c, i) { catOrder[c.name] = i; });
  pos.sort(function(a, b) { return catOrder[a.cat] - catOrder[b.cat]; });

  var h = '';
  h += '<div style="font-size:11px;color:var(--fg2);margin-bottom:6px">已选 ' + ids.length + ' 条</div>';
  // 正向预览条
  h += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">';
  pos.forEach(function(it) {
    h += '<span style="font-size:10px;padding:2px 6px;border-radius:4px;background:var(--bg2);border:1px solid var(--border);cursor:pointer" onclick="stcdDictUnpick(\'' + it.id + '\')">' + escHtml(it.zh) + ' ×</span>';
  });
  if (!pos.length) h += '<span style="font-size:10px;color:var(--fg3)">（无正向词条）</span>';
  h += '</div>';
  // 负面预览条
  if (neg.length) {
    h += '<div style="font-size:11px;color:#e06c75;margin-bottom:4px">🚫 负面（' + neg.length + ' 条）</div>';
    h += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">';
    neg.forEach(function(it) {
      h += '<span style="font-size:10px;padding:2px 6px;border-radius:4px;background:rgba(224,108,117,.1);border:1px solid rgba(224,108,117,.3);cursor:pointer" onclick="stcdDictUnpick(\'' + it.id + '\')">' + escHtml(it.zh) + ' ×</span>';
    });
    h += '</div>';
  }
  // 拼装结果（无权重包装，直接输出 tag）
  var posText = pos.map(function(it) {
    return it.tag;
  }).join(', ');
  var negText = neg.map(function(it) { return it.tag; }).join(', ');
  h += '<div style="margin-bottom:6px"><div style="font-size:11px;color:var(--fg2);margin-bottom:3px">正向 prompt</div>';
  h += '<textarea id="stcd-combo-pos" class="llm-input" style="width:100%;min-height:70px;resize:vertical;font-size:11px" readonly>' + escHtml(posText) + '</textarea></div>';
  if (neg.length) {
    h += '<div style="margin-bottom:6px"><div style="font-size:11px;color:#e06c75;margin-bottom:3px">负面词</div>';
    h += '<textarea id="stcd-combo-neg" class="llm-input" style="width:100%;min-height:40px;resize:vertical;font-size:11px" readonly>' + escHtml(negText) + '</textarea></div>';
  }
  h += '<div style="display:flex;gap:6px">';
  h += '<button class="btn-out" style="flex:1;padding:3px 8px;font-size:11px" onclick="stcdCopy(\'stcd-combo-pos\')">📋 复制正向</button>';
  if (neg.length) h += '<button class="btn-out" style="flex:1;padding:3px 8px;font-size:11px" onclick="stcdCopy(\'stcd-combo-neg\')">📋 复制负面</button>';
  h += '<button class="btn-out" style="padding:3px 8px;font-size:11px;color:#e06c75" onclick="stcdDictClearSel()">清空</button>';
  h += '</div>';
  el.innerHTML = h;
}

function stcdDictUnpick(id) {
  delete STCD_DICT.selected[id];
  var chk = document.getElementById('dictchk_' + id);
  if (chk) chk.checked = false;
  stcdDictRenderCombo();
}

function stcdDictClearSel() {
  STCD_DICT.selected = {};
  var list = document.getElementById('stcd-dict-list');
  if (list) list.querySelectorAll('input[type=checkbox]').forEach(function(c) { c.checked = false; });
  stcdDictRenderCombo();
}

// ===== 随机拼装：当前分区每个大类随机抽 1 个，拼成完整 prompt =====
function stcdRandomCombo() {
  var section = STCD_DICT.section;
  var all = stcdDictSectionItems(section);
  if (!all.length) { toast('当前分区无词条可随机'); return; }
  var cats = stcdDictCatsTable();
  var picked = [];
  cats.forEach(function(c) {
    if (c.name === '负面') return;
    var pool = all.filter(function(it) { return it.cat === c.name && it.tag; });
    if (!pool.length) return;
    picked.push(pool[Math.floor(Math.random() * pool.length)]);
  });
  if (!picked.length) { toast('当前分区无正向词条'); return; }
  // 按分类顺序排序
  var catOrder = {};
  cats.forEach(function(c, i) { catOrder[c.name] = i; });
  picked.sort(function(a, b) { return catOrder[a.cat] - catOrder[b.cat]; });
  // 写入拼装结果
  var posText = picked.map(function(it) { return it.tag; }).join(', ');
  var el = document.getElementById('stcd-combo-pos');
  if (el) el.value = posText;
  // 更新已选状态（随机结果代替勾选）
  STCD_DICT.selected = {};
  picked.forEach(function(it) { STCD_DICT.selected[it.id] = true; });
  stcdDictRenderList();
  // 刷新组合区（中文预览 chips + 英文 prompt 文本框同步更新）
  stcdDictRenderCombo();
}

// ===== 详情 / 编辑 =====
function stcdDictView(id) {
  var it = stcdDictFind(id);
  if (!it) return;
  STCD_DICT.viewItem = it;
  STCD_DICT.editMode = false;
  stcdDictRenderDetail();
}

function stcdDictNew() {
  STCD_DICT.viewItem = null;
  STCD_DICT.editMode = true;
  stcdDictRenderDetail();
}

function stcdDictEdit() {
  if (!STCD_DICT.viewItem) return;
  STCD_DICT.editMode = true;
  stcdDictRenderDetail();
}

function stcdDictRenderDetail() {
  var el = document.getElementById('stcd-dict-detail');
  if (!el) return;
  if (STCD_DICT.editMode) {
    var it = STCD_DICT.viewItem;
    var curZone = it ? (it.zone || 'SFW') : (STCD_DICT.section === 'nsfw' ? 'NSFW' : 'SFW');
    var curCat = it ? (it.cat || '场景') : '场景';
    var curSub = it ? (it.subcat || '') : '';
    var h = '<div style="display:flex;flex-direction:column;gap:6px">';
    h += '<div style="display:flex;gap:6px">';
    h += '<div style="flex:1"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:2px">中文词 *</label>';
    h += '<input id="stcd-dict-f-zh" class="llm-input" style="width:100%;font-size:12px" value="' + escHtml(it ? it.zh : '') + '"></div>';
    h += '<div style="flex:1"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:2px">分区</label>';
    h += '<select id="stcd-dict-f-zone" class="llm-input llm-select" style="width:100%;font-size:12px">';
    h += '<option value="SFW"' + (curZone === 'SFW' ? ' selected' : '') + '>🌿 正常 SFW</option>';
    h += '<option value="NSFW"' + (curZone === 'NSFW' ? ' selected' : '') + '>🔞 色情 NSFW</option>';
    h += '</select></div>';
    h += '</div>';
    h += '<div><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:2px">英文标签 *</label>';
    h += '<textarea id="stcd-dict-f-tag" class="llm-input" style="width:100%;min-height:60px;resize:vertical;font-size:11px">' + escHtml(it ? it.tag : '') + '</textarea></div>';
    h += '<div style="display:flex;gap:6px">';
    h += '<div style="flex:1"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:2px">大类</label>';
    h += '<select id="stcd-dict-f-cat" class="llm-input llm-select" style="width:100%;font-size:12px" onchange="stcdDictCatChanged()">';
    stcdDictAllCats().forEach(function(c) {
      h += '<option value="' + c.name + '"' + (curCat === c.name ? ' selected' : '') + '>' + c.name + '</option>';
    });
    h += '</select></div>';
    h += '<div style="flex:1"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:2px">子类</label>';
    h += '<select id="stcd-dict-f-subcat" class="llm-input llm-select" style="width:100%;font-size:12px">';
    h += '<option value="">（无子类）</option>';
    (function() {
      var catObj = stcdDictAllCats().filter(function(c) { return c.name === curCat; })[0];
      (catObj ? catObj.subs : []).forEach(function(s) {
        h += '<option value="' + s + '"' + (curSub === s ? ' selected' : '') + '>' + s + '</option>';
      });
    })();
    h += '</select></div>';
    h += '</div>';
    h += '<div><label style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--fg2)"><input type="checkbox" id="stcd-dict-f-fav"' + (it && STCD_DICT.favIds[it.id] ? ' checked' : '') + '> 收藏</label></div>';
    h += '<div style="display:flex;gap:6px">';
    h += '<button class="btn-main" style="flex:1;padding:4px 8px;font-size:11px" onclick="stcdDictSaveForm()">💾 保存</button>';
    h += '<button class="btn-out" style="padding:4px 8px;font-size:11px" onclick="openAiGenPanel(\'stcd-dict-tag-gen\')">🤖 AI 生成标签</button>';
    if (it && it.source === '用户') h += '<button class="btn-out" style="padding:4px 8px;font-size:11px;color:#e06c75" onclick="stcdDictDeleteForm()">🗑 删除</button>';
    h += '</div></div>';
    el.innerHTML = h;
  } else {
    var v = STCD_DICT.viewItem;
    if (!v) {
      el.innerHTML = '<div style="font-size:12px;color:var(--fg3)">点击左侧词条查看详情，或点「➕ 新增词条」</div>';
      return;
    }
    var favTxt = STCD_DICT.favIds[v.id] ? '⭐ 已收藏' : '☆ 未收藏';
    var zoneTxt = (v.zone === 'NSFW') ? '🔞 色情 NSFW' : ((v.zone === 'LORA') ? '🧬 LoRA' : '🌿 正常 SFW');
    var zoneStyle = (v.zone === 'NSFW') ? 'background:rgba(224,108,117,.15);color:#e06c75' : ((v.zone === 'LORA') ? 'background:rgba(167,139,250,.15);color:#a78bfa' : 'background:rgba(126,198,153,.15);color:#7ec699');
    var h = '<div style="font-size:14px;color:var(--fg);font-weight:600;margin-bottom:4px">' + escHtml(v.zh) + '</div>';
    h += '<div style="font-size:12px;color:var(--fg2);margin-bottom:6px;word-break:break-all">' + escHtml(v.tag) + '</div>';
    // 词条图片区（异步加载）
    h += '<div id="stcd-dict-detail-img" style="margin-bottom:8px;text-align:center">';
    h += '<div style="height:80px;display:flex;align-items:center;justify-content:center;border:1px dashed var(--border);border-radius:6px;color:var(--fg3);font-size:10px;background:var(--card)">加载图片…</div>';
    h += '<button class="btn-out" style="padding:2px 8px;font-size:10px;margin-top:4px" onclick="stcdDictUploadImgForm(\'' + escHtml(v.zh) + '\')">📷 上传图片</button>';
    h += '</div>';
    h += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">';
    h += '<span style="font-size:10px;padding:1px 8px;border-radius:8px;background:var(--bg2);color:var(--fg2)">' + escHtml(v.cat) + (v.subcat ? '/' + escHtml(v.subcat) : '') + '</span>';
    h += '<span style="font-size:10px;padding:1px 8px;border-radius:8px;background:var(--bg2);color:var(--fg3)">' + escHtml(v.source) + '</span>';
    h += '<span style="font-size:10px;padding:1px 8px;border-radius:8px;' + zoneStyle + '">' + zoneTxt + '</span>';
    h += '</div>';
    h += '<div style="display:flex;gap:6px">';
    h += '<button class="btn-out" style="flex:1;padding:4px 8px;font-size:11px" onclick="stcdDictFavBtn()">' + favTxt + '</button>';
    h += '<button class="btn-out" style="flex:1;padding:4px 8px;font-size:11px" onclick="stcdDictEdit()">✏️ 编辑</button>';
    if (v.source === '用户') h += '<button class="btn-out" style="flex:1;padding:4px 8px;font-size:11px;color:#e06c75" onclick="stcdDictDeleteForm()">🗑 删除</button>';
    h += '</div>';
    el.innerHTML = h;
    // 异步加载词条图片（详情用原图大图）
    (function(zh) {
      stcdDictOrigImg(zh).then(function(dataUrl) {
        var box = document.getElementById('stcd-dict-detail-img');
        if (!box) return;
        if (dataUrl) {
          box.innerHTML = '<img src="' + dataUrl + '" style="max-width:100%;max-height:180px;border-radius:6px;border:1px solid var(--border);object-fit:contain;background:var(--card);cursor:zoom-in" onclick="stcdDictPreviewImg(\'' + escHtml(zh) + '\')" />'
            + '<div style="display:flex;gap:4px;justify-content:center;margin-top:4px">'
            + '<button class="btn-out" style="padding:2px 8px;font-size:10px" onclick="stcdDictUploadImgForm(\'' + escHtml(zh) + '\')">🔄 换图</button>'
            + '<button class="btn-out" style="padding:2px 8px;font-size:10px;color:#e06c75" onclick="stcdDictRemoveImg(\'' + escHtml(zh) + '\')">🗑 删图</button>'
            + '</div>';
        } else {
          box.innerHTML = '<div style="height:80px;display:flex;align-items:center;justify-content:center;border:1px dashed var(--border);border-radius:6px;color:var(--fg3);font-size:10px;background:var(--card)">暂无图片</div>'
            + '<button class="btn-out" style="padding:2px 8px;font-size:10px;margin-top:4px" onclick="stcdDictUploadImgForm(\'' + escHtml(zh) + '\')">📷 上传图片</button>';
        }
      });
    })(v.zh);
  }
}

// ===== 词条图片：预览 / 上传 / 删除 =====
function stcdDictPreviewImg(zh) {
  stcdDictOrigImg(zh).then(function(dataUrl) {
    if (!dataUrl) { toast('暂无图片'); return; }
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:zoom-out';
    ov.innerHTML = '<div style="color:var(--fg2);font-size:13px;margin-bottom:10px">' + escHtml(zh) + ' · 点击任意处关闭</div>'
      + '<img src="' + dataUrl + '" style="max-width:92vw;max-height:85vh;border-radius:8px;border:1px solid var(--border);object-fit:contain;background:#111" />';
    ov.addEventListener('click', function() { ov.remove(); });
    document.body.appendChild(ov);
  });
}

function stcdDictUploadImgForm(zh) {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.display = 'none';
  document.body.appendChild(input);
  input.addEventListener('change', function(e) {
    var file = e.target.files && e.target.files[0];
    document.body.removeChild(input);
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      toast('图片上传中…');
      stcdDictUploadImg(zh, ev.target.result).then(function(ok) {
        if (!ok) { toast('图片保存失败'); return; }
        toast('图片已上传');
        stcdDictRenderDetail();
        stcdDictRenderList();
      });
    };
    reader.onerror = function() { toast('读取文件失败'); };
    reader.readAsDataURL(file);
  });
  input.click();
}

function stcdDictRemoveImg(zh) {
  if (!confirm('确定删除「' + zh + '」的图片？')) return;
  stcdDictDeleteImg(zh).then(function(ok) {
    toast(ok ? '图片已删除' : '删除失败');
    stcdDictRenderDetail();
    stcdDictRenderList();
  });
}

function stcdDictFavBtn() {
  var v = STCD_DICT.viewItem;
  if (!v) return;
  stcdDictToggleFav(v.id).then(function() {
    toast(STCD_DICT.favIds[v.id] ? '已收藏' : '已取消收藏');
    stcdDictRenderDetail();
    stcdDictRenderList();
  });
}

// 大类切换时联动刷新子类下拉
function stcdDictCatChanged() {
  var catEl = document.getElementById('stcd-dict-f-cat');
  if (!catEl) return;
  var catObj = stcdDictAllCats().filter(function(c) { return c.name === catEl.value; })[0];
  var subEl = document.getElementById('stcd-dict-f-subcat');
  if (!subEl) return;
  var cur = subEl.value;
  subEl.innerHTML = '<option value="">（无子类）</option>';
  (catObj ? catObj.subs : []).forEach(function(s) {
    subEl.innerHTML += '<option value="' + s + '">' + s + '</option>';
  });
  // 尝试保留原选中的子类
  if (cur) {
    var opts = subEl.querySelectorAll('option');
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].value === cur) { subEl.value = cur; break; }
    }
  }
}

function stcdDictSaveForm() {
  var zh = (document.getElementById('stcd-dict-f-zh') || {}).value || '';
  var tag = (document.getElementById('stcd-dict-f-tag') || {}).value || '';
  var cat = (document.getElementById('stcd-dict-f-cat') || {}).value || '场景';
  var subcat = (document.getElementById('stcd-dict-f-subcat') || {}).value || '';
  var zone = (document.getElementById('stcd-dict-f-zone') || {}).value || 'SFW';
  var fav = !!(document.getElementById('stcd-dict-f-fav') || {}).checked;
  if (!zh.trim() || !tag.trim()) { toast('中文词和英文标签不能为空'); return; }
  var v = STCD_DICT.viewItem;
  if (v && v.source === '用户') {
    stcdDictUpdate(v.id, { zh: zh.trim(), tag: tag.trim(), cat: cat, subcat: subcat, zone: zone, fav: fav }).then(function() {
      toast('已保存');
      STCD_DICT.editMode = false;
      stcdDictRenderDetail();
      stcdDictRenderList();
    });
  } else {
    stcdDictAdd({ zh: zh.trim(), tag: tag.trim(), cat: cat, subcat: subcat, zone: zone, fav: fav }).then(function() {
      toast('已新增');
      STCD_DICT.editMode = false;
      stcdDictRenderDetail();
      stcdDictRenderList();
    });
  }
}

function stcdDictDeleteForm() {
  var v = STCD_DICT.viewItem;
  if (!v) return;
  if (!confirm('确定删除词条「' + v.zh + '」？')) return;
  stcdDictDelete(v.id).then(function() {
    toast('已删除');
    STCD_DICT.viewItem = null;
    STCD_DICT.editMode = false;
    stcdDictRenderDetail();
    stcdDictRenderList();
  });
}

// ===== 保存的提示词弹窗 =====
function stcdShowSavedPrompts() {
  stcdLoadSavedPrompts().then(function() {
    var list = STCD_DICT.savedPrompts;
    var h = '<div class="mcard" style="max-width:560px">';
    h += '<h3 style="font-size:0.95em;margin-bottom:10px">📁 保存的提示词（' + list.length + ' 条）</h3>';
    if (!list.length) {
      h += '<div style="font-size:0.8em;color:var(--fg3);margin-bottom:12px">暂无——在提示词 tab 点「⭐ 收藏入词库」后会出现在这里</div>';
    } else {
      list.forEach(function(it, i) {
        h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:8px;margin-bottom:6px">';
        h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">';
        h += '<span style="font-size:12px;color:var(--fg);font-weight:600;flex:1">' + escHtml(it.zh || '未命名') + '</span>';
        h += '<span style="font-size:10px;color:var(--fg3)">' + escHtml((it.createdAt || '').slice(0, 16).replace('T', ' ')) + '</span>';
        h += '<button class="btn-out" style="padding:1px 6px;font-size:10px" onclick="stcdSavedPromptCopy(\'' + i + '\')">📋 复制</button>';
        h += '<button class="btn-out" style="padding:1px 6px;font-size:10px" onclick="stcdSavedPromptToDict(\'' + i + '\')">📖 转词条</button>';
        h += '<button class="btn-out" style="padding:1px 6px;font-size:10px;color:#e06c75" onclick="stcdSavedPromptDel(\'' + i + '\')">🗑</button>';
        h += '</div>';
        h += '<div style="font-size:10px;color:var(--fg3);word-break:break-all">' + escHtml(it.tag) + '</div>';
        h += '</div>';
      });
    }
    h += '<div style="text-align:right"><button class="btn-main" onclick="this.closest(\'.ovl\').remove()">关闭</button></div>';
    h += '</div>';
    var ov = document.createElement('div');
    ov.className = 'ovl';
    ov.innerHTML = h;
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  });
}

function stcdSavedPromptCopy(idx) {
  var it = STCD_DICT.savedPrompts[parseInt(idx)];
  if (!it) return;
  复制到剪贴板(it.tag).then(function(ok) { toast(ok ? '已复制' : '复制失败'); });
}

function stcdSavedPromptToDict(idx) {
  var it = STCD_DICT.savedPrompts[parseInt(idx)];
  if (!it) return;
  stcdDictAdd({ zh: it.zh || '未命名', tag: it.tag, cat: it.cat || '场景', zone: it.zone || 'SFW', fav: false }).then(function() {
    toast('已转为词条');
    STCD_DICT.savedPrompts.splice(parseInt(idx), 1);
    stcdSaveSavedPrompts();
    stcdShowSavedPrompts();
    stcdDictRenderList();
  });
}

function stcdSavedPromptDel(idx) {
  STCD_DICT.savedPrompts.splice(parseInt(idx), 1);
  stcdSaveSavedPrompts().then(function() {
    toast('已删除');
    stcdShowSavedPrompts();
  });
}


// ===== AI 字段：词条标签生成（二元模板）=====
(function() {
  if (typeof registerAiField !== 'function') return;
  registerAiField('stcd-dict-tag-gen', '词条标签生成', function() {
    var zh = (document.getElementById('stcd-dict-f-zh') || {}).value || '';
    return { user: zh };
  }, {
    suggestPrompt: 'dict_tag_gen',
    fillFn: function(d) {
      if (!d || !d.tag) { toast('AI 返回异常'); return; }
      var tagEl = document.getElementById('stcd-dict-f-tag');
      if (tagEl) tagEl.value = d.tag;
      var catEl = document.getElementById('stcd-dict-f-cat');
      if (catEl && d.cat && STCD_DICT_CATS.some(function(c) { return c.name === d.cat; })) {
        catEl.value = d.cat;
        stcdDictCatChanged();
      }
      if (d.suggestZh) {
        var zhEl = document.getElementById('stcd-dict-f-zh');
        if (zhEl) zhEl.value = d.suggestZh;
      }
      toast('标签已生成');
    },
  });
})();

window.stcdDictRender = stcdDictRender;
window.stcdDictSection = stcdDictSection;
window.stcdDictSearch = stcdDictSearch;
window.stcdDictFilter = stcdDictFilter;
window.stcdDictSubFilter = stcdDictSubFilter;
window.stcdDictCatChanged = stcdDictCatChanged;
window.stcdDictToggle = stcdDictToggle;
window.stcdDictUnpick = stcdDictUnpick;
window.stcdDictClearSel = stcdDictClearSel;
window.stcdRandomCombo = stcdRandomCombo;
window.stcdDictView = stcdDictView;
window.stcdDictNew = stcdDictNew;
window.stcdDictEdit = stcdDictEdit;
window.stcdDictFavBtn = stcdDictFavBtn;
window.stcdDictSaveForm = stcdDictSaveForm;
window.stcdDictDeleteForm = stcdDictDeleteForm;
window.stcdDictPreviewImg = stcdDictPreviewImg;
window.stcdDictUploadImgForm = stcdDictUploadImgForm;
window.stcdDictRemoveImg = stcdDictRemoveImg;
window.stcdShowSavedPrompts = stcdShowSavedPrompts;
window.stcdSavedPromptCopy = stcdSavedPromptCopy;
window.stcdSavedPromptToDict = stcdSavedPromptToDict;
window.stcdSavedPromptDel = stcdSavedPromptDel;
