// 系列写作 · 概览

// ===== 导入目标切换 =====
window.XL切换导入目标 = function(el) {
  var parent = el.parentNode;
  parent.querySelectorAll('.tag-chip').forEach(function(c) {
    c.classList.remove('act');
    c.style.borderColor = 'var(--border)';
    c.style.color = 'var(--fg3)';
    c.style.background = 'transparent';
  });
  el.classList.add('act');
  el.style.borderColor = 'var(--accent)';
  el.style.color = 'var(--accent)';
  el.style.background = 'var(--accent)15';
};

function XL获取导入目标() {
  var el = document.querySelector('.ovl .tag-chip.act');
  return el ? el.getAttribute('data-target') : 'doms';
}

function XLOpenCharImport(genderFilter) {
  // 统一走全局角色卡导入弹窗；导入目标默认调教者
  stcdOpenCharPicker('', {
    gender: genderFilter || '女性',
    onPick: function(data) {
      XLImportChar(data, 'doms');
    }
  });
}

function XLImportChar(data, targetKey) {
  Store.seriesWriting.get(swActiveSeries).then(function(m) {
    m = m || {};
    if (!m[targetKey]) m[targetKey] = [];
    m[targetKey].push(JSON.parse(JSON.stringify(data)));
    Store.seriesWriting.save(swActiveSeries, m);
    toast('已导入：' + (data.name || ''));
  })
  .catch(function(err) { console.error("[系列大纲] 导入角色失败:", err); toast("读取角色卡失败"); });
}

// ===== 查看档案 =====
window.XL查看角色档案 = function(idx) {
  Store.seriesWriting.get(swActiveSeries).then(function(m) {
    m = m || {};
    var doms = m.doms || [];
    var subs = m.subs || [];
    var all = [];
    doms.forEach(function(d, i) { all.push({ data: d, key: 'doms', idx: i }); });
    subs.forEach(function(d, i) { all.push({ data: d, key: 'subs', idx: i }); });
    var c = all[idx];
    if (!c) { toast('角色不存在'); return; }
    if (typeof window.显示角色档案 === 'function') {
      window.显示角色档案({ fullChar: JSON.parse(JSON.stringify(c.data)), outline: null });
    } else {
      toast('角色档案模块未加载');
    }
  });
};

function XLSendToCharCard(idx, key) {
  Store.seriesWriting.get(swActiveSeries).then(function(m) {
    m = m || {};
    var charData = (m[key] || [])[idx];
    if (!charData) { toast('角色数据不存在'); return; }
    var bi = charData.identity && charData.identity.basicInfo || {};
    var name = bi.name || '';
    if (!name) { toast('请先为角色填写姓名'); return; }
    var gender = bi.gender || '女性';
    var catKeyMap = { '男性': 'male', '女性': 'female', '扶她': 'futa', '伪娘': 'femboy' };
    var catKey = catKeyMap[gender] || 'female';
    var outlineData = JSON.parse(JSON.stringify({ identity: charData.identity }));
    if (!S.generatedCharacters) S.generatedCharacters = {};
    if (!S.generatedCharacters[catKey]) S.generatedCharacters[catKey] = {};
    var source = '系列写作 - ' + swActiveSeries;
    var existing = S.generatedCharacters[catKey][name];
    if (existing) {
      existing.outline = outlineData;
      existing.desc = source;
      existing.phase = existing.fullChar ? 'full' : 'outline';
    } else {
      S.generatedCharacters[catKey][name] = {
        id: name, catKey: catKey, desc: source,
        outline: outlineData, fullChar: null,
        phase: 'outline', status: 'pending', createdAt: Date.now()
      };
    }
    if (typeof window.角色持久化 === 'function') window.角色持久化();
    toast('角色「' + name + '」已发送到角色卡');
  });
}
window.XLSendToCharCard = XLSendToCharCard;

// ===== 新增/删除角色 =====
function XL增加角色(key) {
  Store.seriesWriting.get(swActiveSeries).then(function(m) {
    m = m || {};
    if (!m[key]) m[key] = [];
    var defaultGender = key === 'doms' ? '男性' : '女性';
    m[key].push({
      identity: {
        basicInfo: { name: '', title: '', age: '', race: '', gender: defaultGender, rarity: '', price: '' },
        background: { origin: '', birthStatus: '', family: '', upbringing: '', education: '', skills: [], talents: [], aura: '' },
        experience: { currentOccupation: '', timeline: '', lifeOverview: '', dailyLife: '', sexualAwakening: '', dailySexuality: '' },
      },
    });
    Store.seriesWriting.save(swActiveSeries, m);
    XLRenderOverview(document.getElementById('XLOutlineTabContent'));
  });
}
function XLOvAddDom() { XL增加角色('doms'); }
function XLOvAddSub() { XL增加角色('subs'); }
window.XLOvAddDom = XLOvAddDom;
window.XLOvAddSub = XLOvAddSub;

function XLOvAiGenChar(i, key) {
  Store.seriesWriting.get(swActiveSeries).then(function(m) {
    m = m || {};
    var domsLen = m.doms ? m.doms.length : 0;
    window._XLBodyEditIdx = key === 'subs' ? domsLen + i : i;
    openAiGenPanel('XL_ovCharSingle');
  });
}
window.XLOvAiGenChar = XLOvAiGenChar;

function XL删除角色(idx, key) {
  if (!confirm('确定删除该角色？')) return;
  Store.seriesWriting.get(swActiveSeries).then(function(m) {
    m = m || {};
    if (m[key] && m[key][idx]) {
      m[key].splice(idx, 1);
      Store.seriesWriting.save(swActiveSeries, m);
      XLRenderOverview(document.getElementById('XLOutlineTabContent'));
      toast('已删除');
    }
  });
}
window.XL删除角色 = XL删除角色;

function XLRenderOverview(el) {
  Store.seriesWriting.get(swActiveSeries || '__none__').then(function(m) {
    m = m || {};
    var doms = m.doms || [];
    var subs = m.subs || [];

    var allChars = [];
    doms.forEach(function(d, i) { allChars.push({ data: d, key: 'doms', idx: i }); });
    subs.forEach(function(d, i) { allChars.push({ data: d, key: 'subs', idx: i }); });

    // ===== 卡片1：角色卡片网格 =====
    var h = '<div class="n-card mb-10">' +
      '<div class="flex justify-between items-center mb-8">' +
      '<div><h4 class="m-0">👥 角色设定</h4><p class="text-muted text-sm mt-2">点击卡片查看档案，可导入或发送到角色卡。</p></div>' +
      '<div class="flex-row" style="gap:4px">' +
      '<button class="btn-sm bg-accent2 c-white fs-11" onclick="XLOpenCharImport()">📂 导入角色卡</button>' +
      '<button class="btn-sm" style="background:var(--accent2);color:#fff;font-size:11px" onclick="XLOvAddDom()">＋ 调教者</button>' +
      '<button class="btn-sm" style="background:#6bc;color:#fff;font-size:11px" onclick="XLOvAddSub()">＋ 被调教者</button>' +
      '</div></div>';

    if (!allChars.length) {
      h += '<div class="placeholder-text">暂无角色。点击「导入角色卡」从角色卡库导入。</div>';
    } else {
      h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">';
      allChars.forEach(function(c, i) {
        var data = c.data;
        var bi = data.identity && data.identity.basicInfo || {};
        var name = bi.name || data.name || '未命名';
        var title = bi.title || '';
        var age = bi.age || '';
        var gender = bi.gender || '男性';
        var race = bi.race || '';
        var rarity = bi.rarity || '';
        var icon = bi.icon || '';
        var isDoms = c.key === 'doms';

        var rarityTitles = {'金':'传说','紫':'史诗','蓝':'稀有','绿':'精良','白':'普通'};
        var rarityLabel = rarityTitles[rarity] ? rarity + ' · ' + rarityTitles[rarity] : (rarity || '');
        var borderColor = isDoms ? 'var(--accent2)' : '#6bc';
        var roleBadge = isDoms ? '👑 调教者' : '🔗 被调教者';

        h += '<div class="n-card" style="border-left:4px solid ' + borderColor + ';padding:12px;display:flex;flex-direction:column;cursor:pointer" onclick="XL查看角色档案(' + i + ')" title="点击查看档案">';
        h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">';
        h += '<div style="font-size:26px">' + (icon || '👤') + '</div>';
        h += '<div style="flex:1;min-width:0">';
        h += '<div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(name) + '</div>';
        if (title) h += '<div style="font-size:10px;color:var(--fg3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(title) + '</div>';
        h += '</div></div>';
        h += '<div style="font-size:10px;color:var(--fg2);margin-bottom:6px;line-height:1.6">';
        var infoParts = [];
        if (age) infoParts.push(age + '岁');
        infoParts.push(gender);
        if (race) infoParts.push(race);
        h += infoParts.join(' · ');
        h += '</div>';
        if (rarity) h += '<div style="font-size:10px;color:var(--accent);margin-bottom:6px">' + escHtml(rarityLabel) + '</div>';
        h += '<div style="font-size:9px;padding:1px 8px;border-radius:3px;background:' + borderColor + '20;color:' + borderColor + ';display:inline-block;align-self:flex-start;margin-bottom:8px">' + roleBadge + '</div>';
        h += '<div style="flex:1"></div>';
        h += '<div style="display:flex;gap:4px;border-top:1px solid var(--border);padding-top:8px">';
        h += '<button class="btn-out btn-sm" style="font-size:12px;padding:3px 10px;flex:2" onclick="event.stopPropagation();XLOvAiGenChar(' + c.idx + ',\'' + c.key + '\')" title="AI 生成概要">🤖 AI 生成</button>';
        h += '<button class="btn-out btn-sm" style="font-size:10px;padding:2px 8px;flex:1" onclick="event.stopPropagation();XLSendToCharCard(' + c.idx + ',\'' + c.key + '\')">📤 发送</button>';
        h += '<button class="btn-out btn-sm" style="font-size:10px;padding:2px 6px;color:var(--err);border-color:var(--err)" onclick="event.stopPropagation();XL删除角色(' + c.idx + ',\'' + c.key + '\')" title="删除角色">✕</button>';
        h += '</div></div>';
      });
      h += '</div>';
    }
    h += '</div>';

    // ===== 卡片2：故事设定 =====
    h += '<div class="n-card mb-10">' +
      '<div class="flex justify-between items-center mb-8">' +
      '<div><h4 class="m-0">📖 故事设定</h4><p class="text-muted text-sm mt-2">题材、玩法、故事概述与章节规划。</p></div>' +
      '<button class="ai-gen-btn fs-12" onclick="openAiGenPanel(\'XL_gen_story\')">🤖 AI 生成故事设定</button></div>' +

      '  <div class="form-group"><label class="text-muted db mb-4">题材（故事背景）</label>' +
      '    <div id="XLGenreChips" class="flex gap-4 flex-wrap mb-6">' +
      XLRenderTagChips(m.genreTags||m.tags||[], GENRE_TAGS) + '</div>' +
      '    <div class="flex gap-4 items-center mb-4">' +
      '      <select id="XLGenreSelect" class="llm-input llm-select flex-1 fs-12">' +
      '        <option value="">— 选择题材 —</option>' +
      GENRE_TAGS.map(function(t){return '<option value="'+t.id+'">'+escHtml(t.label)+'</option>';}).join('') +
      '      </select>' +
      '      <button class="ai-suggest-btn" id="XLGenreAiBtn" title="AI 推荐题材">🤖</button></div>' +
      '    <div class="flex gap-4">' +
      '      <input class="llm-input flex-1 fs-12" id="XLGenreCustom" placeholder="自定义题材，回车添加">' +
      '      <button class="btn-secondary btn-sm" id="XLGenreCustomAddBtn">添加</button></div>' +
      '    <div id="aiopts_XL_ovGenreSuggestion" class="dn mt-4"></div></div>' +

      '  <div class="form-group"><label class="text-muted db mb-4">玩法（情色元素）</label>' +
      '    <div id="XLPlayChips" class="flex gap-4 flex-wrap mb-6">' +
      XLRenderTagChips(m.playTags||[], PLAY_TAGS) + '</div>' +
      '    <div class="flex gap-4 items-center mb-4">' +
      '      <select id="XLPlaySelect" class="llm-input llm-select flex-1 fs-12">' +
      '        <option value="">— 选择玩法 —</option>' +
      PLAY_TAGS.map(function(t){return '<option value="'+t.id+'">'+escHtml(t.label)+'</option>';}).join('') +
      '      </select>' +
      '      <button class="ai-suggest-btn" id="XLPlayAiBtn" title="AI 推荐玩法">🤖</button></div>' +
      '    <div class="flex gap-4">' +
      '      <input class="llm-input flex-1 fs-12" id="XLPlayCustom" placeholder="自定义玩法，回车添加">' +
      '      <button class="btn-secondary btn-sm" id="XLPlayCustomAddBtn">添加</button></div>' +
      '    <div id="aiopts_XL_ovPlaySuggestion" class="dn mt-4"></div></div>' +

      '  <div class="form-group"><label class="text-muted db mb-4">故事概述</label>' +
      '    <div class="ai-field-row">' +
      '      <textarea id="XLPremise" class="llm-input" style="min-height:100px;resize:vertical" placeholder="故事概述…">' + escHtml(m.premise||'') + '</textarea>' +
      '      <button class="ai-suggest-btn" onclick="openAiPanel(\'XL_ovPremise\')" title="AI 建议">🤖</button></div>' +
      '    <div id="aiopts_XL_ovPremise" class="dn mt-4"></div></div>' +
      '  <div class="form-group"><label class="text-muted db mb-4">结局方向</label>' +
      '    <div class="ai-field-row">' +
      '      <textarea id="XLEnding" class="llm-input" style="min-height:60px;resize:vertical" placeholder="结局方向…">' + escHtml(m.ending||'') + '</textarea>' +
      '      <button class="ai-suggest-btn" onclick="openAiPanel(\'XL_ovEnding\')" title="AI 建议">🤖</button></div>' +
      '    <div id="aiopts_XL_ovEnding" class="dn mt-4"></div></div>' +
      '  <div class="form-group"><label class="text-muted db mb-4">章节数量</label>' +
      '    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">' +
      '      <span class="btn-out btn-sm XL-cc-preset" data-cc="3">微小说（3章）</span>' +
      '      <span class="btn-out btn-sm XL-cc-preset" data-cc="5">短篇（5章）</span>' +
      '      <span class="btn-out btn-sm XL-cc-preset" data-cc="10">中篇（10章）</span>' +
      '      <span class="btn-out btn-sm XL-cc-preset" data-cc="20">长篇（20章）</span>' +
      '      <span class="btn-out btn-sm XL-cc-preset" data-cc="30">超长篇（30章）</span>' +
      '      <input type="number" id="XLChapterCount" class="llm-input w-80" value="' + (m.chapterCount||10) + '" min="1" max="100">' +
      '      <span class="text-muted text-sm">章</span>' +
      '    </div></div>' +
      '</div>';

    el.innerHTML = h;

    // Event bindings
    document.getElementById('XLGenreSelect').addEventListener('change', function() {
      if (this.value) { XLAddTag('XLGenreChips', this.value); this.value = ''; XLSaveDelayed(); }
    });
    document.getElementById('XLGenreCustomAddBtn').addEventListener('click', function() {
      var inp = document.getElementById('XLGenreCustom');
      if (inp && inp.value.trim()) { XLAddTag('XLGenreChips', inp.value.trim()); inp.value = ''; XLSaveDelayed(); }
    });
    document.getElementById('XLGenreCustom').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && this.value.trim()) { XLAddTag('XLGenreChips', this.value.trim()); this.value = ''; XLSaveDelayed(); }
    });
    document.getElementById('XLGenreChips').addEventListener('click', function(e) {
      if (e.target.classList.contains('XL-tag-del')) { var c = e.target.parentElement; if (c) c.remove(); XLSaveDelayed(); }
    });
    document.getElementById('XLGenreAiBtn').addEventListener('click', function() { openAiPanel('XL_ovGenreSuggestion'); });

    document.getElementById('XLPlaySelect').addEventListener('change', function() {
      if (this.value) { XLAddTag('XLPlayChips', this.value); this.value = ''; XLSaveDelayed(); }
    });
    document.getElementById('XLPlayCustomAddBtn').addEventListener('click', function() {
      var inp = document.getElementById('XLPlayCustom');
      if (inp && inp.value.trim()) { XLAddTag('XLPlayChips', inp.value.trim()); inp.value = ''; XLSaveDelayed(); }
    });
    document.getElementById('XLPlayCustom').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && this.value.trim()) { XLAddTag('XLPlayChips', this.value.trim()); this.value = ''; XLSaveDelayed(); }
    });
    document.getElementById('XLPlayChips').addEventListener('click', function(e) {
      if (e.target.classList.contains('XL-tag-del')) { var c = e.target.parentElement; if (c) c.remove(); XLSaveDelayed(); }
    });
    document.getElementById('XLPlayAiBtn').addEventListener('click', function() { openAiPanel('XL_ovPlaySuggestion'); });

    XLWatchAiSuggestions('XL_ovGenreSuggestion', 'XLGenreChips');
    XLWatchAiSuggestions('XL_ovPlaySuggestion', 'XLPlayChips');

    Array.from(el.querySelectorAll('.XL-cc-preset')).forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.getElementById('XLChapterCount').value = parseInt(this.getAttribute('data-cc')) || 10;
        Array.from(el.querySelectorAll('.XL-cc-preset')).forEach(function(b) { b.style.borderColor = 'var(--border)'; });
        this.style.borderColor = 'var(--accent)';
        XLSaveDelayed();
      });
    });

    document.getElementById('XLPremise').addEventListener('input', function() { if (_XLAutoSaveTimer) clearTimeout(_XLAutoSaveTimer); _XLAutoSaveTimer = setTimeout(XL保存, 500); });
    document.getElementById('XLEnding').addEventListener('input', function() { if (_XLAutoSaveTimer) clearTimeout(_XLAutoSaveTimer); _XLAutoSaveTimer = setTimeout(XL保存, 500); });
    document.getElementById('XLChapterCount').addEventListener('input', function() { if (_XLAutoSaveTimer) clearTimeout(_XLAutoSaveTimer); _XLAutoSaveTimer = setTimeout(XL保存, 500); });
  })
  .catch(function(err) { console.error("[系列大纲] 导入角色失败:", err); toast("读取角色卡失败"); });
}

window.XLOpenCharImport = XLOpenCharImport;
window.XLImportChar = XLImportChar;
window.XLRenderOverview = XLRenderOverview;
