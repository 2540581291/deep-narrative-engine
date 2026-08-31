// ===== 历史提取 · 渲染 =====

// 典型同人作品补充标签（分类弹窗与筛选行共用）
var 同人作品词 = ['我真没想重生啊', 'Fate', '生肖守护神', '斗罗大陆', '斗破苍穹', '诡秘之主', '艾尔登法环', '龙族'];

function 小说渲染历史面板() {
  var filters = window._历史分类筛选 || { type: '', origin: '', wc: '', kw: '', work: '' };
  var h = '<div style="padding:20px">';

  // 筛选栏（按维度分组，每行互斥）
  var groups = [
    { key: 'type', label: '内容', items: ['正经', '色情'] },
    { key: 'origin', label: '来源', items: ['同人', '原创'] },
    { key: 'wc', label: '字数', items: ['超短篇', '短篇', '中篇', '长篇'] },
    { key: 'gender', label: '角色', items: ['女性', '男性', '伪娘', '扶她', '异种'] },
  ];
  groups.forEach(function(g) {
    h += '<div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">';
    h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">' + g.label + '</span>';
    // 全部按钮（默认选中）
    var allActive = !filters[g.key];
    h += '<span class="btn-out btn-sm" style="font-size:10px;padding:2px 8px;' + (allActive ? 'background:var(--accent);color:#fff;border-color:var(--accent)' : '') + ';cursor:pointer" onclick="var a=window._历史分类筛选||{};a[\'' + g.key + '\']=\'\';window._历史分类筛选=a;刷新视图()">全部</span>';
    g.items.forEach(function(f) {
      var active = filters[g.key] === f;
      h += '<span class="btn-out btn-sm" style="font-size:10px;padding:2px 8px;' + (active ? 'background:var(--accent);color:#fff;border-color:var(--accent)' : 'opacity:0.4') + ';cursor:pointer" onclick="var a=window._历史分类筛选||{};a[\'' + g.key + '\']=\'' + f + '\';window._历史分类筛选=a;刷新视图()">' + f + '</span>';
    });
    h += '</div>';
    // 来源行下追加：典型同人作品补充标签（点击筛选，再点取消）
    if (g.key === 'origin') {
      h += '<div style="display:flex;align-items:center;gap:4px;margin-bottom:6px;flex-wrap:wrap">';
      h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">作品</span>';
      同人作品词.forEach(function(w) {
        var active = filters.work === w;
        h += '<span class="btn-out btn-sm" style="font-size:10px;padding:2px 8px;' + (active ? 'background:var(--accent);color:#fff;border-color:var(--accent)' : '') + ';cursor:pointer" onclick="var a=window._历史分类筛选||{};a.work=a.work===\'' + w + '\'?\'\':\'' + w + '\';window._历史分类筛选=a;刷新视图()">《' + w + '》</span>';
      });
      h += '</div>';
    }
  });

  var list = window._小说提取历史列表 || [];
  // 性别枚举映射（UI 中文 → 存储枚举）
  var genderMap = { '女性': 'female', '男性': 'male', '伪娘': 'femboy', '扶她': 'futa', '异种': 'beast' };
  // 搜索框（历史元数据：标题/分类/性别/字数）
  h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">';
  h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">搜索</span>';
  h += '<input id="historyKwInput" type="text" placeholder="搜索标题 / 分类 / 性别 / 字数…" value="' + escHtml((filters.kw || '')) + '" style="flex:1;font-size:12px;padding:4px 8px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;color:var(--fg)" onkeydown="if(event.key===\'Enter\'){小说提取历史执行搜索()}">';
  h += '<button class="btn btn-sm" onclick="小说提取历史执行搜索()" style="font-size:11px;padding:4px 12px">🔍 搜索</button>';
  h += '<button class="btn-out btn-sm" onclick="小说提取历史全部分类()" style="font-size:11px;padding:4px 12px" title="让 AI 对全部未分类记录自动判断内容/来源/补充标签">🤖 全部分类</button>';
  if (filters.kw) {
    h += '<span style="font-size:10px;color:var(--fg3);cursor:pointer" onclick="var a=window._历史分类筛选||{};a.kw=\'\';window._历史分类筛选=a;刷新视图()">✕ 清除</span>';
  }
  h += '</div>';

  // 筛选
  var hasFilter = filters.type || filters.origin || filters.wc || filters.gender || filters.kw || filters.work;
  if (hasFilter) {
    var kw = (filters.kw || '').trim().toLowerCase();
    list = list.filter(function(entry) {
      var c = entry.category || {};
      var len = entry.textLength || 0;
      var wc = len >= 1000000 ? '长篇' : len >= 500000 ? '中篇' : len >= 100000 ? '短篇' : '超短篇';
      if (filters.type && c.type && c.type !== filters.type) return false;
      if (filters.origin && c.origin && c.origin !== filters.origin) return false;
      if (filters.wc && wc !== filters.wc) return false;
      if (filters.gender && !(entry.genders || []).includes(genderMap[filters.gender])) return false;
      if (filters.work && (c.tags || []).indexOf(filters.work) < 0) return false;
      if (kw) {
        var haystack = (entry.title || '') + '|' + (c.type || '') + '|' + (c.origin || '') + '|' + wc + '|' + (entry.genders || []).join(',');
        if (haystack.toLowerCase().indexOf(kw) < 0) return false;
      }
      return true;
    });
  }

  // 统计行（与总览一致）
  h += '<div style="font-size:11px;color:var(--fg3);margin-bottom:10px">共 ' + (window._小说提取历史列表 || []).length + ' 条记录，当前筛选命中 ' + list.length + ' 条</div>';

  if (!list.length) {
    h += '<div style="padding:30px;text-align:center;color:var(--fg3);font-size:12px">' + (hasFilter ? '没有匹配的记录' : '暂无提取历史，请先提取一部小说') + '</div></div>';
    return h;
  }



  list.forEach(function(entry) {
    var date = entry.createdAt ? new Date(entry.createdAt).toLocaleDateString('zh-CN') : '';
    var textSize = entry.textLength > 10000 ? (Math.round(entry.textLength / 10000) + '万字') : (entry.textLength > 0 ? Math.round(entry.textLength / 1000) + '千字' : '');
    var wcLabel = entry.textLength >= 1000000 ? '长篇' : entry.textLength >= 500000 ? '中篇' : entry.textLength >= 100000 ? '短篇' : '超短篇';
    var loadKey = entry.folderName || entry.id;
    var isIncomplete = entry.completed === false;
    var borderColor = isIncomplete ? 'var(--warning)' : 'var(--accent)';
    var cat = entry.category || {};

    h += '<div class="card" style="padding:10px 12px;margin-bottom:8px;border-left:3px solid ' + borderColor + ';cursor:pointer" onclick="小说提取加载记录(\'' + loadKey + '\')">';
    h += '<div style="display:flex;justify-content:space-between;align-items:flex-start">';
    h += '<div style="flex:1;min-width:0">';
    h += '<div style="font-size:13px;font-weight:500">' + (isIncomplete ? '⏸️ ' : '📖 ') + escHtml(entry.title) + '</div>';
    h += '<div style="font-size:10px;color:var(--fg3);margin-top:2px">' + (entry.charCount || 0) + ' 个角色 · ' + textSize + ' · ' + date + '</div>';

    // 分类徽标
    h += '<div style="display:flex;gap:3px;margin-top:4px;flex-wrap:wrap">';
    var badges = [];
    if (cat.type) badges.push({ label: cat.type, color: cat.type === '色情' ? 'var(--accent2)' : 'var(--green)' });
    if (cat.origin) badges.push({ label: cat.origin, color: cat.origin === '同人' ? 'var(--purple)' : 'var(--blue)' });
    badges.push({ label: wcLabel, color: 'var(--fg3)' });
    // 性别徽标（按记录实际含有的性别显示）
    var genderLabelMap = { female: '女', male: '男', femboy: '伪娘', futa: '扶她', beast: '异种' };
    var genderColorMap = { female: 'var(--accent2)', male: 'var(--blue)', femboy: 'var(--accent)', futa: 'var(--green)', beast: '#e94560' };
    (entry.genders || []).forEach(function(g) {
      if (genderLabelMap[g]) badges.push({ label: genderLabelMap[g], color: genderColorMap[g] });
    });
    badges.forEach(function(b) {
      h += '<span style="font-size:9px;padding:1px 5px;border-radius:3px;background:' + b.color + '20;color:' + b.color + ';font-weight:500">' + b.label + '</span>';
    });
    // 补充标签（弱化显示：圆点前缀 + 深灰 + 细边框，区别于核心分类徽章）
    (cat.tags || []).forEach(function(t) {
      h += '<span style="font-size:9px;padding:1px 6px;border-radius:999px;background:var(--bg2);color:var(--fg3);border:1px dashed var(--border);font-weight:400">' + escHtml(t) + '</span>';
    });
    h += '</div></div>';

    h += '<div style="display:flex;gap:3px;flex-shrink:0;margin-left:8px">';
    h += '<button class="btn-out" onclick="event.stopPropagation();小说提取弹出分类(\'' + loadKey + '\')" style="font-size:11px;padding:3px 10px">✏️ 分类</button>';
    h += '<button class="btn-out" onclick="event.stopPropagation();小说提取弹出重命名(\'' + loadKey + '\')" style="font-size:11px;padding:3px 10px">📝 重命名</button>';
    h += '<button class="btn-out btn-sm" onclick="event.stopPropagation();小说提取删除记录(\'' + loadKey + '\')" style="font-size:10px;padding:1px 6px;color:var(--err);border-color:var(--err)">✕</button>';
    h += '</div></div></div>';
  });
  h += '</div>';
  return h;
}

window.小说提取加载记录 = 小说提取加载记录;
window.小说提取删除记录 = 小说提取删除记录;

// 历史提取搜索：读搜索框值设置 filters.kw，与分类筛选叠加
window.小说提取历史执行搜索 = function() {
  var input = document.getElementById('historyKwInput');
  var v = input ? input.value.trim() : '';
  var a = window._历史分类筛选 || {};
  a.kw = v;
  window._历史分类筛选 = a;
  刷新视图();
};

// 历史提取 · AI 全部分类：对全部未分类记录逐个调用 AI 判断并保存（内容/来源必选 + 补充标签非必选）
window.小说提取历史全部分类 = function() {
  var list = window._小说提取历史列表 || [];
  var pending = list.filter(function(e) {
    var c = e.category || {};
    return !c.type && !c.origin;
  });
  if (!pending.length) { toast('没有需要分类的记录'); return; }
  if (!confirm('将让 AI 依次分类 ' + pending.length + ' 条未分类记录（内容/来源/补充标签），是否继续？')) return;

  var done = 0;
  var failed = 0;
  function 分类一条(i) {
    if (i >= pending.length) {
      小说提取扫描目录().then(function() { 刷新视图(); });
      toast('全部分类完成：成功 ' + done + ' 条' + (failed ? '，失败 ' + failed + ' 条' : ''));
      return;
    }
    var entry = pending[i];
    var folderName = entry.folderName || entry.id;
    var path = 小说提取存储基路径 + folderName + '/fulltext.txt';
    LocalFS.readText(path).then(function(fullText) {
      var sample = (fullText || '').substring(0, 1000);
      var _r = renderPrompt('ext_char_classify', {
        标题: entry.title || '',
        开头: sample,
      });
      return LLM.callJSON({
        prompt: _r.user,
        system: _r.system,
        label: 'AI 分类 ' + (i + 1) + '/' + pending.length,
        temperature: 0.1,
      }).then(function(data) {
        var c = entry.category || {};
        c.type = (data && data.type) ? data.type : c.type || null;
        c.origin = (data && data.origin) ? data.origin : c.origin || null;
        if (data && Array.isArray(data.tags) && data.tags.length) c.tags = data.tags.filter(function(t) { return t; });
        if (c.type || c.origin) {
          return window.小说提取保存分类(folderName, c).then(function() { done++; });
        }
        failed++;
      });
    }).catch(function() { failed++; }).then(function() {
      分类一条(i + 1);
    });
  }
  分类一条(0);
};

// ===== 分类弹窗 =====
window.小说提取弹出分类 = function(folderName) {
  if (document.getElementById('catOverlay')) return;
  var list = window._小说提取历史列表 || [];
  var entry = null;
  list.forEach(function(e) { if (e.folderName === folderName) entry = e; });
  if (!entry) { toast('未找到记录'); return; }
  var cat = entry.category || {};
  var textLen = entry.textLength || 0;
  var wcLabel = textLen >= 1000000 ? '长篇' : textLen >= 500000 ? '中篇' : textLen >= 100000 ? '短篇' : '超短篇';

  var ov = document.createElement('div');
  ov.id = 'catOverlay';
  ov.className = 'ovl';
  ov.innerHTML = '<div class="mcard" style="max-width:400px;width:90%">' +
    '<div style="font-size:15px;font-weight:600;margin-bottom:12px">📁 编辑分类</div>' +
    '<div style="font-size:12px;color:var(--fg2);margin-bottom:12px">' + escHtml(entry.title) + '</div>' +
    // 字数（只读）
    '<div style="font-size:11px;color:var(--fg3);margin-bottom:10px">字数：' + textLen.toLocaleString() + ' 字（' + wcLabel + '）</div>' +
    // 内容类型
    '<div style="font-size:11px;font-weight:500;margin-bottom:4px;color:var(--fg)">内容类型</div>' +
    '<div style="display:flex;gap:6px;margin-bottom:10px">' +
    '  <label style="font-size:12px;display:flex;align-items:center;gap:4px;cursor:pointer"><input type="radio" name="cat_type" value="正经"' + (cat.type === '正经' ? ' checked' : '') + '>正经</label>' +
    '  <label style="font-size:12px;display:flex;align-items:center;gap:4px;cursor:pointer"><input type="radio" name="cat_type" value="色情"' + (cat.type === '色情' ? ' checked' : '') + '>色情</label>' +
    '</div>' +
    // 来源类型
    '<div style="font-size:11px;font-weight:500;margin-bottom:4px;color:var(--fg)">来源类型</div>' +
    '<div style="display:flex;gap:6px;margin-bottom:12px">' +
    '  <label style="font-size:12px;display:flex;align-items:center;gap:4px;cursor:pointer"><input type="radio" name="cat_origin" value="同人"' + (cat.origin === '同人' ? ' checked' : '') + '>同人</label>' +
    '  <label style="font-size:12px;display:flex;align-items:center;gap:4px;cursor:pointer"><input type="radio" name="cat_origin" value="原创"' + (cat.origin === '原创' ? ' checked' : '') + '>原创</label>' +
    '</div>' +
    // AI 按钮
    '<button class="btn-out" onclick="小说提取AI分类(\'' + folderName + '\')" style="font-size:11px;padding:4px 12px;margin-bottom:12px">🤖 AI 自动判断</button>' +
    // 补充标签（chips 区，标题与说明已删除）
    '<div id="catTagsRow" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">' +
    同人作品词.map(function(w) {
      var sel = (cat.tags || []).indexOf(w) >= 0;
      return '<span data-work="' + w + '" style="font-size:11px;padding:2px 10px;border:1px solid ' + (sel ? 'var(--accent)' : 'var(--border)') + ';color:' + (sel ? 'var(--accent)' : 'var(--fg3)') + ';border-radius:999px;cursor:pointer;font-weight:' + (sel ? '600' : '400') + '" onclick="小说提取切换补充标签(this)">《' + w + '》</span>';
    }).join('') +
    '</div>' +
    '<div style="display:flex;gap:6px;margin-bottom:12px">' +
    '<input id="catTagInput" type="text" placeholder="自定义标签，回车添加" style="flex:1;font-size:11px;padding:3px 8px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;color:var(--fg)" onkeydown="if(event.key===\'Enter\'){小说提取添加自定义标签()}">' +
    '</div>' +
    // 按钮组
    '<div style="display:flex;gap:8px;justify-content:flex-end">' +
    '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>' +
    '<button class="btn-main" onclick="小说提取确认分类(\'' + folderName + '\')">保存</button>' +
    '</div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
};

// 分类弹窗：补充标签 toggle（点击选中/取消，多选）
window.小说提取切换补充标签 = function(el) {
  var isSel = el.style.color === 'var(--accent)';
  if (isSel) {
    el.style.color = 'var(--fg3)';
    el.style.borderColor = 'var(--border)';
    el.style.fontWeight = '400';
  } else {
    el.style.color = 'var(--accent)';
    el.style.borderColor = 'var(--accent)';
    el.style.fontWeight = '600';
  }
};

// 分类弹窗：自定义补充标签，回车添加
window.小说提取添加自定义标签 = function() {
  var input = document.getElementById('catTagInput');
  if (!input) return;
  var v = input.value.trim();
  if (!v) return;
  var row = document.getElementById('catTagsRow');
  if (!row) return;
  var span = document.createElement('span');
  span.setAttribute('data-work', v);
  span.textContent = v;
  span.style.cssText = 'font-size:11px;padding:2px 10px;border:1px solid var(--accent);color:var(--accent);border-radius:999px;cursor:pointer;font-weight:600';
  span.onclick = function() { 小说提取切换补充标签(this); };
  row.appendChild(span);
  input.value = '';
};

window.小说提取确认分类 = function(folderName) {
  var typeEl = document.querySelector('input[name="cat_type"]:checked');
  var originEl = document.querySelector('input[name="cat_origin"]:checked');
  var type = typeEl ? typeEl.value : '';
  var origin = originEl ? originEl.value : '';
  if (!type && !origin) { toast('请至少选择一个分类'); return; }
  // 收集补充标签：选中的 chips（按强调色判断）+ 自定义标签
  var tags = [];
  document.querySelectorAll('#catTagsRow [data-work]').forEach(function(span) {
    if (span.style.color === 'var(--accent)') tags.push(span.getAttribute('data-work'));
  });
  var ov = document.getElementById('catOverlay');
  if (ov) ov.remove();
  window.小说提取保存分类(folderName, { type: type || null, origin: origin || null, tags: tags.length ? tags : null });
};

// ===== AI 分类 =====
window.小说提取AI分类 = function(folderName) {
  var list = window._小说提取历史列表 || [];
  var entry = null;
  list.forEach(function(e) { if (e.folderName === folderName) entry = e; });
  if (!entry) { toast('未找到记录'); return; }

  // 读取全文开头用于 AI 判断（全文独立存于 fulltext.txt）
  var path = '角色卡/小说提取/' + folderName + '/fulltext.txt';
  LocalFS.readText(path).then(function(fullText) {
    if (!fullText) { toast('读取记录失败'); return; }
    var sample = fullText.substring(0, 1000);
    var title = entry.title || '';
    // 禁用 AI 按钮防止重复点击
    var btn = document.querySelector('button[onclick*="小说提取AI分类"]');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ AI 判断中...'; }

    var _r = renderPrompt('ext_char_classify', {
      标题: title,
      开头: sample,
    });
    LLM.callJSON({
      prompt: _r.user,
      system: _r.system,
      label: 'AI 分类',
      temperature: 0.1,
    }).then(function(data) {
      if (data && data.type) {
        var typeEl = document.querySelector('input[name="cat_type"][value="' + data.type + '"]');
        if (typeEl) typeEl.checked = true;
      }
      if (data && data.origin) {
        var originEl = document.querySelector('input[name="cat_origin"][value="' + data.origin + '"]');
        if (originEl) originEl.checked = true;
      }
      // 补充标签（非必选）：AI 判定为某典型作品时回填到标签区
      if (data && Array.isArray(data.tags) && data.tags.length) {
        data.tags.forEach(function(t) {
          if (!t) return;
          var span = document.querySelector('#catTagsRow [data-work="' + t + '"]');
          if (span) {
            span.style.color = 'var(--accent)';
            span.style.borderColor = 'var(--accent)';
            span.style.fontWeight = '600';
          }
        });
      }
      toast('AI 判断完成');
    }).catch(function(err) {
      toast('AI 判断失败: ' + (err.message || ''));
    }).finally(function() {
      if (btn) { btn.disabled = false; btn.textContent = '🤖 AI 自动判断'; }
    });
  }).catch(function(e) {
    toast('读取失败');
    console.warn(e);
  });
};