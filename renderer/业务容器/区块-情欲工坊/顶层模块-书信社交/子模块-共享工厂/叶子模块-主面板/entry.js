// 情欲工坊 · 书信社交 · 分类模块共享工厂
// 创作界面 100% 照抄 淫诗艳曲 卡片式创作页（作品信息 / 选题 / 灵感素材 / AI 生成 / 改编 + 模板库 + 阅读弹窗）
// 字段语义按书信改：书信类型(原诗体)、收信人/署名/敬语/落款/日期、题材=情色题材、意象=书信意象
// 四类（书信/便条/聊天记录/社交动态）共用本工厂，各自传 cfg（storeKey/容器id/类型清单/题材/意象/prompt）

// ===== 书信意象库（类别 → 意象列表；共享工厂内置默认，模块 cfg.意象库 可覆盖）=====
var 书信社交意象库 = {
  '身体': ['乳房', '乳头', '乳晕', '腰', '臀', '大腿', '阴毛', '肚脐', '锁骨', '脖颈', '嘴唇', '舌头', '手指', '脚', '脚踝', '肩膀', '腋窝', '膝弯'],
  '性器官': ['阴蒂', '阴唇', '阴阜', '阴道', '子宫', '阴茎', '龟头', '包皮', '阴囊', '睾丸', '尿道口', '前列腺', '肛门'],
  '情欲意象': ['春潮', '云雨', '巫山', '红烛', '罗帐', '香汗', '酥胸', '玉体', '春宵', '暗香', '露水', '潮红', '锦衾', '合欢'],
  '书信意象': ['信笺', '红纸', '青鸾', '鸿雁', '尺牍', '泪痕', '墨香', '烛泪', '断肠', '断鸿', '青鸟', '秋水', '展信', '墨渖'],
  '场所': ['闺房', '书房', '浴室', '庭院', '月下', '灯下', '帐中', '舟中', '屏风后', '阳台', '窗边', '绣楼', '更衣室'],
  '动作': ['抚', '搂', '吻', '吮', '含', '揉', '捏', '抱', '压', '贴', '摩挲', '纠缠', '低语', '喘息'],
  '污物': ['精液', '淫水', '口水', '汗液', '尿液', '白带', '经血', '包皮垢'],
};

function 书信社交工厂(cfg) {
  // cfg: { storeKey, containerId, viewContentId, prefix, windowPrefix, navLabelList, navLabelEdit, promptName, aiFieldId, aiLabel, formOptions, formOptionsLabel, 题材选项, 露骨度选项, 默认类型, 默认露骨度, 意象库, 显示标签, 筛选维度, dbPath, dbFormat, classicLabel, 题材库, 朝代轴, 作者档位, 书信字段, 模块独有选题 }
  var 共享题材选项 = cfg.题材选项 || ['相思', '暧昧', '禁忌', '调情', '钟情', '偷情', '沦陷', '献身'];
  var 共享露骨度选项 = cfg.露骨度选项 || ['含蓄隐晦', '唯美风雅', '直白露骨', '粗俗荤文'];
  var 默认类型 = cfg.默认类型 || (cfg.formOptions && cfg.formOptions[0]) || '';
  var 默认露骨度 = cfg.默认露骨度 || '含蓄隐晦';
  var 意象库 = cfg.意象库 || 书信社交意象库;

  var 导航 = [
    { id: 'list', label: cfg.navLabelList },
    { id: 'editor', label: cfg.navLabelEdit },
  ];
  if (cfg.dbPath) 导航.push({ id: 'classic', label: '📚 模板库' });
  var 当前视图 = 'list';
  var _editTitle = null;
  var 编辑状态 = {};
  var 筛选状态 = {};        // 列表筛选：{ form:'全部', genre:'全部', explicit:'全部' }
  var 筛选维度 = cfg.筛选维度 || ['form'];
  var 创作防抖保存 = null;
  var 经典分页 = 0;
  var 经典每页 = 50;
  var 期望默认类型 = 默认类型;

  function 切换视图(view) {
    当前视图 = view;
    var el = document.getElementById(cfg.containerId);
    if (!el) return;
    var h = '<div class="tl-subnav">';
    导航.forEach(function(v) { h += '<div class="tl-subitem' + (v.id === 当前视图 ? ' act' : '') + '" data-view="' + v.id + '">' + escHtml(v.label) + '</div>'; });
    h += '</div><div id="' + cfg.viewContentId + '"></div>';
    el.innerHTML = h;
    var vEl = document.getElementById(cfg.viewContentId);
    if (!vEl) return;
    el.querySelectorAll('.tl-subitem').forEach(function(i) { i.addEventListener('click', function() {
      var v = this.getAttribute('data-view');
      if (v === 'editor') { 新创作(); return; }
      切换视图(v);
    }); });
    switch (view) {
      case 'list': 渲染列表(vEl); break;
      case 'editor': 渲染编辑器(vEl); break;
      case 'classic': 渲染模板库(vEl); break;
    }
  }

  function 新创作() { _editTitle = null; 切换视图('editor'); }

  function 渲染列表(el) {
    Store[cfg.storeKey].list().then(function(items) {
      var h = '<div class="ls-toolbar">';
      h += '<div class="ls-actions">';
      h += '<button class="btn-new" onclick="' + cfg.windowPrefix + '新创作()">＋ 新建</button>';
      h += '</div></div>';
      // 各筛选维度，每个维度一行（统一现代化筛选芯片）
      if (筛选维度.indexOf('form') >= 0) {
        h += 筛选行(cfg.formOptionsLabel || '类型', ['全部'].concat(cfg.formOptions || []), 筛选状态.form, cfg.windowPrefix + '筛选', 'form');
      }
      if (筛选维度.indexOf('genre') >= 0 && 共享题材选项) {
        h += 筛选行('题材', ['全部'].concat(共享题材选项), 筛选状态.genre, cfg.windowPrefix + '筛选', 'genre');
      }
      if (筛选维度.indexOf('explicit') >= 0 && 共享露骨度选项) {
        h += 筛选行('露骨度', ['全部'].concat(共享露骨度选项), 筛选状态.explicit, cfg.windowPrefix + '筛选', 'explicit');
      }
      var filtered = items || [];
      if (筛选状态.form && 筛选状态.form !== '全部') filtered = filtered.filter(function(i) { return (i.form || 默认类型) === 筛选状态.form; });
      if (筛选状态.genre && 筛选状态.genre !== '全部') filtered = filtered.filter(function(i) { var g = Array.isArray(i.genre) ? i.genre : (i.genre ? [i.genre] : []); return g.indexOf(筛选状态.genre) >= 0; });
      if (筛选状态.explicit && 筛选状态.explicit !== '全部') filtered = filtered.filter(function(i) { return (i.explicit || 默认露骨度) === 筛选状态.explicit; });
      h += '<div class="ls-list">';
      if (!filtered.length) {
        h += '<div class="ls-empty">暂无' + (cfg.classicLabel || '作品') + '，点「＋ 创作」开始</div>';
      } else {
        filtered.forEach(function(item) {
          var tags = [];
          if (item.form && item.form !== 默认类型) tags.push('<span class="ls-chip">' + escHtml(item.form) + '</span>');
          if (item.explicit) tags.push('<span class="ls-chip ls-chip-dim">' + escHtml(item.explicit) + '</span>');
          if (item.recipient) tags.push('<span class="ls-chip ls-chip-dim">📨 ' + escHtml(item.recipient) + '</span>');
          var genres = Array.isArray(item.genre) ? item.genre : (item.genre ? [item.genre] : []);
          genres.forEach(function(g) { tags.push('<span class="ls-chip ls-chip-dim">' + escHtml(g) + '</span>'); });
          h += '<div class="ls-item" onclick="' + cfg.windowPrefix + '阅读(\'' + escHtml(item.title) + '\')">';
          h += '<div class="ls-item-icon">' + cfg.图标 + '</div>';
          h += '<div class="ls-item-body">';
          h += '<div class="ls-item-title">' + escHtml(item.title) + '</div>';
          var preview = String(item.content || '').replace(/\s+/g, ' ').trim();
          if (preview) h += '<div class="ls-item-preview">' + escHtml(preview.slice(0, 60)) + '</div>';
          h += '</div>';
          if (tags.length) h += '<div class="ls-item-tags">' + tags.join('') + '</div>';
          h += '<div class="ls-item-actions">';
          h += '<span class="ls-icon-btn" title="编辑" onclick="event.stopPropagation();' + cfg.windowPrefix + '编辑项(\'' + escHtml(item.title) + '\')">✏️</span>';
          h += '<span class="ls-icon-btn danger" title="删除" onclick="event.stopPropagation();' + cfg.windowPrefix + '删除项(\'' + escHtml(item.title) + '\')">🗑</span>';
          h += '</div>';
          h += '</div>';
        });
      }
      h += '</div>';
      el.innerHTML = h;
    });
  }

  function 筛选(field, val) { 筛选状态[field] = val; 切换视图('list'); }

  function 编辑项(title) { _editTitle = title; 切换视图('editor'); }
  function 删除项(title) { confirmDialog('确定删除「' + title + '」？', function(){ Store[cfg.storeKey].delete(title).then(function(){ toast('已删除'); 切换视图('list'); }); }); }

  // ===== 列表弹窗阅读（与经典库同款 reader 排版）=====
  function 阅读(title) {
    Store[cfg.storeKey].get(title).then(function(item) {
      item = item || {};
      if (!item.content) { toast('该作品暂无内容'); return; }
      document.querySelectorAll('.ovl').forEach(function(o) { o.remove(); });
      var len = (item.content || '').length;
      var h = '';
      h += '<div class="reader-head">';
      h += '<span class="reader-title">' + cfg.图标 + ' ' + escHtml(item.title || title) + '</span>';
      if (item.form && item.form !== 默认类型) h += '<span class="reader-tag">' + escHtml(item.form) + '</span>';
      if (item.explicit) h += '<span class="reader-tag">' + escHtml(item.explicit) + '</span>';
      var genres2 = Array.isArray(item.genre) ? item.genre : (item.genre ? [item.genre] : []);
      if (genres2.length) h += '<span class="reader-tag">' + escHtml(genres2.join('、')) + '</span>';
      if (item.date) h += '<span class="reader-tag">📅 ' + escHtml(item.date) + '</span>';
      h += '<span class="reader-meta" style="margin-left:auto">' + (len < 80 ? '短' : len < 300 ? '中' : '长') + ' · ' + len + ' 字</span>';
      h += '</div>';
      h += '<div class="reader-body">';
      h += '<div class="reader-poem-title">' + escHtml(item.title || title) + '</div>';
      var signing = (item.recipient ? '致 ' + item.recipient : '') + (item.form && item.form !== 默认类型 ? ' · ' + item.form : '');
      h += '<div class="reader-poem-author">' + escHtml(signing) + '<span class="reader-dot">·</span>' + escHtml(item.explicit || '') + '</div>';
      h += '<div class="reader-poem-text" style="font-family:serif;line-height:1.9;text-align:left">' + escHtml(item.content || '') + '</div>';
      if (item.salutation) h += '<div class="reader-meta" style="text-align:left;margin-top:12px">' + escHtml(item.salutation) + '</div>';
      if (item.sender) h += '<div class="reader-meta" style="text-align:right;margin-top:12px">✍️ ' + escHtml(item.sender) + '</div>';
      if (item.closing) h += '<div class="reader-meta" style="text-align:right">' + escHtml(item.closing) + '</div>';
      h += '</div>';
      h += '<div class="reader-foot">';
      h += '<button class="reader-btn" onclick="' + cfg.windowPrefix + '编辑项(\'' + escHtml(title) + '\')">✏️ 编辑</button>';
      h += '<button class="reader-btn" onclick="' + cfg.windowPrefix + '复制全文(\'' + escHtml(title) + '\')">📋 复制全文</button>';
      h += '<button class="reader-btn primary" onclick="this.closest(\'.ovl\').remove()">关闭</button>';
      h += '</div>';
      showModal('', h, { noWrap: true, cardClass: 'reader-night', ovlClass: 'reader-night-ovl' });
    });
  }

  function 复制全文(title) {
    Store[cfg.storeKey].get(title).then(function(item) {
      item = item || {};
      var text = (item.title || title) + (item.form ? ' · ' + item.form : '') + '\n' + (item.recipient ? '致 ' + item.recipient + '\n' : '') + (item.salutation ? item.salutation + '\n' : '') + (item.content || '') + (item.closing ? '\n' + item.closing : '') + (item.sender ? '\n—— ' + item.sender : '');
      复制到剪贴板(text).then(function(ok){ toast(ok ? '已复制全文' : '复制失败'); });
    });
  }

  // ===== 自动建档 / 写盘 =====
  function 自动建档() {
    var t = (编辑状态.title || '').trim();
    if (_editTitle || !t) return Promise.resolve(false);
    return Store[cfg.storeKey].list().then(function(items) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].title === t) { toast('同名作品已存在，草稿未建立'); return false; }
      }
      _editTitle = t;
      var data = {
        title: t, content: 编辑状态.content || '', tags: 编辑状态.tags || [],
        form: 编辑状态.form || 默认类型, explicit: 编辑状态.explicit || 默认露骨度,
        genre: 编辑状态.genre || [], imagery: 编辑状态.imagery || [],
        recipient: 编辑状态.recipient || '', sender: 编辑状态.sender || '',
        salutation: 编辑状态.salutation || '', closing: 编辑状态.closing || '', date: 编辑状态.date || '',
        roles: 编辑状态.roles || []
      };
      if (模块独有选题) data[模块独有选题.编辑键] = 编辑状态[模块独有选题.编辑键] || '';
      return Store[cfg.storeKey].save(t, data).then(function() { toast('已建立草稿「' + t + '」'); return true; });
    });
  }

  function 写盘() {
    var t = (编辑状态.title || '').trim();
    if (!t || !_editTitle) return;
    if (t !== _editTitle) {
      var oldTitle = _editTitle;
      _editTitle = null;
      Store[cfg.storeKey].delete(oldTitle).catch(function(){}).then(function() {
        var data = {};
        Object.assign(data, 编辑状态);
        data.title = t;
        if (typeof data.tags === 'string') data.tags = data.tags.split('、').map(function(x){return x.trim();}).filter(Boolean);
        if (模块独有选题) data[模块独有选题.编辑键] = 编辑状态[模块独有选题.编辑键] || '';
        Store[cfg.storeKey].save(t, data).then(function(){ _editTitle = t; });
      });
      return;
    }
    Store[cfg.storeKey].get(_editTitle).then(function(m) {
      m = m || {};
      Object.assign(m, 编辑状态);
      if (typeof 编辑状态.tags === 'string') m.tags = 编辑状态.tags.split('、').map(function(x){return x.trim();}).filter(Boolean);
      if (模块独有选题) m[模块独有选题.编辑键] = 编辑状态[模块独有选题.编辑键] || '';
      Store[cfg.storeKey].save(_editTitle, m).then(function(){});
    });
  }

  function 编辑字段(key, val) {
    编辑状态[key] = val;
    if (_editTitle) {
      if (!创作防抖保存) 创作防抖保存 = 防抖(function(){ 写盘(); }, 400);
      创作防抖保存();
    } else if ((编辑状态.title || '').trim()) {
      自动建档().then(function(ok) {
        if (!ok) return;
        if (!创作防抖保存) 创作防抖保存 = 防抖(function(){ 写盘(); }, 400);
        创作防抖保存();
      });
    }
  }

  function 渲染编辑器(el) {
    if (_editTitle) {
      Store[cfg.storeKey].get(_editTitle).then(function(data) { 渲染表单(el, data||{}); });
    } else {
      渲染表单(el, { title:'', content:'', tags:[], form:默认类型, genre:[], explicit:默认露骨度, imagery:[], recipient:'', sender:'', salutation:'', closing:'', date:'', adaptSource: 编辑状态.adaptSource || '', adaptExplicit: 编辑状态.adaptExplicit || '', adaptLen: 编辑状态.adaptLen || '' });
    }
  }

  // ===== 卡片式创作页（与淫诗艳曲 100% 一致：作品信息 / 选题 / 灵感素材 / AI 生成 / 改编）=====
  function 共享卡片头(icon, label, extra) {
    var h = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;font-family:var(--font-sans)">';
    h += '<span style="width:3px;height:12px;background:var(--accent2);flex-shrink:0"></span>';
    h += '<span style="font-size:11px;letter-spacing:2px;color:var(--fg2)">' + icon + ' ' + label + '</span>';
    if (extra) h += '<span style="margin-left:auto;font-size:10px;color:var(--fg3);letter-spacing:1px">' + extra + '</span>';
    h += '</div>';
    return h;
  }
  function 共享参数行(label, chipsHtml) {
    var w = 52;
    var hang = w + 4;
    return '<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:wrap;padding-left:' + hang + 'px">'
      + '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:' + w + 'px;flex-shrink:0;margin-left:-' + hang + 'px">' + label + '</span>'
      + chipsHtml + '</div>';
  }
  function 共享灵感侧栏HTML() {
    var h = '<div class="inspire-panel">';
    Object.keys(意象库).forEach(function(cat) {
      var imgs = 意象库[cat].map(function(im) {
        return '<span class="tag-chip inspire-imagery' + ((编辑状态.imagery||[]).indexOf(im) >= 0 ? ' tag-active' : '') + '" data-imagery="' + im + '" onclick="' + cfg.windowPrefix + '切换意象(\'' + im + '\');' + cfg.windowPrefix + '同步chips()">' + im + '</span>';
      }).join('');
      h += 共享参数行(cat, imgs);
    });
    var 灵感行 = '';
    灵感行 += '<button class="btn-sm" style="flex-shrink:0" onclick="' + cfg.windowPrefix + '随机灵感()">🎲 随机灵感</button>';
    灵感行 += '<input class="llm-input" id="' + cfg.prefix + 'Acrostic" placeholder="藏字（如：愿君珍重，一字一格；留空则自由生成）" style="flex:1;min-width:150px">';
    if (灵感行) h += 共享参数行('灵感', 灵感行);
    h += '</div>';
    return h;
  }
  function 渲染表单(el, data) {
    编辑状态 = { title:data.title||'', form:data.form||默认类型, genre:data.genre||[], explicit:data.explicit||默认露骨度, content:data.content||'', tags:(Array.isArray(data.tags) ? data.tags : (data.tags ? String(data.tags).split('、') : [])).join('、'), imagery:data.imagery||[], recipient:data.recipient||'', sender:data.sender||'', salutation:data.salutation||'', closing:data.closing||'', date:data.date||'', roles:data.roles||[] };
    if (data.adaptSource) 编辑状态.adaptSource = data.adaptSource;
    if (data.adaptExplicit) 编辑状态.adaptExplicit = data.adaptExplicit;
    if (data.adaptLen) 编辑状态.adaptLen = data.adaptLen;
    if (模块独有选题) 编辑状态[模块独有选题.编辑键] = data[模块独有选题.编辑键] || '';
    var formOpts = (cfg.formOptions || []).indexOf(期望默认类型) < 0 ? [期望默认类型].concat(cfg.formOptions || []) : (cfg.formOptions || []);
    var formOptions = formOpts.map(function(f) { return '<option value="' + f + '"' + (编辑状态.form === f ? ' selected' : '') + '>' + f + '</option>'; }).join('');
    var s = 编辑状态;
    var h = '<div class="mw-600">';
    // ① 作品信息卡：标题（+AI 建议）| 类型下拉 | 收信人/署名/日期
    h += '<div class="n-card p-10 mb-6">';
    h += 共享卡片头('📋', '作品信息', '输入即自动保存');
    h += '<div class="ai-field-row">';
    h += '<input class="llm-input" id="' + cfg.prefix + 'Title" placeholder="题目（失焦即自动建档）" value="' + escHtml(s.title||'') + '" style="flex:2" onchange="' + cfg.windowPrefix + '编辑字段(\'title\',this.value)">';
    h += '<button class="ai-suggest-btn" onclick="openAiGenPanel(\'' + cfg.aiFieldId + 'Suggest\')" title="AI 题目建议">🤖</button>';
    h += '<select class="llm-input" id="' + cfg.prefix + 'Form" style="flex:1" onchange="' + cfg.windowPrefix + '编辑字段(\'form\',this.value);' + cfg.windowPrefix + '同步chips()">' + formOptions + '</select>';
    h += '</div>';
    h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">';
    if (cfg.书信字段 !== false) {
      h += '<input class="llm-input" id="' + cfg.prefix + 'Recipient" placeholder="收信人（如：卿卿/主人/亲爱的）" value="' + escHtml(s.recipient||'') + '" style="flex:1;min-width:120px;font-size:12px;padding:5px 8px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;color:var(--fg)" onchange="' + cfg.windowPrefix + '编辑字段(\'recipient\',this.value)">';
      h += '<input class="llm-input" id="' + cfg.prefix + 'Sender" placeholder="署名（如：奴/你的我）" value="' + escHtml(s.sender||'') + '" style="flex:1;min-width:120px;font-size:12px;padding:5px 8px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;color:var(--fg)" onchange="' + cfg.windowPrefix + '编辑字段(\'sender\',this.value)">';
      h += '<input class="llm-input" id="' + cfg.prefix + 'Date" placeholder="日期（如：崇祯三年春）" value="' + escHtml(s.date||'') + '" style="flex:1;min-width:120px;font-size:12px;padding:5px 8px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;color:var(--fg)" onchange="' + cfg.windowPrefix + '编辑字段(\'date\',this.value)">';
    }
    h += '</div>';
    if (cfg.书信字段 !== false) {
      h += 共享参数行('敬语', ['亲爱的', '敬爱的', '卿卿', '见字如面', '久违了', '主人'].map(function(c) {
        return '<span class="tag-chip' + (s.salutation === c ? ' tag-active' : '') + '" data-salute="' + c + '" onclick="' + cfg.windowPrefix + '编辑字段(\'salutation\',\'' + c + '\');' + cfg.windowPrefix + '同步chips()">' + c + '</span>';
      }).join('') + '<input class="llm-input" id="' + cfg.prefix + 'Salutation" value="' + escHtml(s.salutation||'') + '" placeholder="自定义敬语" style="flex:1;min-width:100px;font-size:11px;padding:2px 6px">');
      h += 共享参数行('落款', ['此致 敬礼', '爱你的', '永远属于你', '吻你', '跪拜', '勿念'].map(function(c) {
        return '<span class="tag-chip' + (s.closing === c ? ' tag-active' : '') + '" data-close="' + c + '" onclick="' + cfg.windowPrefix + '编辑字段(\'closing\',\'' + c + '\');' + cfg.windowPrefix + '同步chips()">' + c + '</span>';
      }).join('') + '<input class="llm-input" id="' + cfg.prefix + 'Closing" value="' + escHtml(s.closing||'') + '" placeholder="自定义落款" style="flex:1;min-width:100px;font-size:11px;padding:2px 6px">');
    }
    h += '</div>';
    // ② 选题卡：题材 / 露骨度 / 角色
    h += '<div class="n-card p-10 mb-6">';
    h += 共享卡片头('🎯', '选题', 'AI 可一键建议');
    h += 共享参数行('题材', 共享题材选项.map(function(g) {
      return '<span class="tag-chip' + (s.genre.indexOf(g) >= 0 ? ' tag-active' : '') + '" data-genre="' + g + '" onclick="' + cfg.windowPrefix + '切换题材(\'' + g + '\');' + cfg.windowPrefix + '同步chips()">' + g + '</span>';
    }).join(''));
    h += 共享参数行('露骨度', 共享露骨度选项.map(function(e) {
      return '<span class="tag-chip' + (s.explicit === e ? ' tag-active' : '') + '" data-explicit="' + e + '" onclick="' + cfg.windowPrefix + '编辑字段(\'explicit\',\'' + e + '\');' + cfg.windowPrefix + '同步chips()">' + e + '</span>';
    }).join(''));
    h += 共享参数行('角色', '<span id="' + cfg.prefix + 'RoleChips">' + 共享角色chipsHTML() + '</span>');
    h += '</div>';
    // ③ 灵感素材卡（折叠，默认展开）：意象/藏字/随机灵感
    h += '<details class="n-card p-10 mb-6" open><summary style="display:flex;align-items:center;gap:8px;margin-bottom:10px;cursor:pointer;list-style:none;font-family:var(--font-sans)">';
    h += '<span style="width:3px;height:12px;background:var(--accent2);flex-shrink:0"></span>';
    h += '<span style="font-size:11px;letter-spacing:2px;color:var(--fg2)">💡 灵感素材</span>';
    h += '<span style="margin-left:auto;font-size:10px;color:var(--fg3);letter-spacing:1px">点击折叠</span>';
    h += '</summary>';
    h += 共享灵感侧栏HTML();
    h += '</details>';
    // ④ AI 生成卡
    h += '<div class="n-card p-10 mb-6">';
    h += 共享卡片头('🚀', 'AI 生成', '按当前参数生成 · 结果回填表单');
    h += '<div class="mb-6">';
    h += '<textarea class="llm-input llm-input-lg" id="' + cfg.prefix + 'Direction" placeholder="主题 / 氛围（可选，如：深夜烛下、痛彻心扉的情书）" style="width:100%;height:64px;resize:vertical"></textarea>';
    h += '</div>';
    h += '<button class="btn btn-primary" style="width:100%;padding:10px 18px;font-size:13px" onclick="openAiGenPanel(\'' + cfg.aiFieldId + '\')">🚀 AI 生成</button>';
    h += '</div>';
    // ⑤ 改编卡
    h += '<div class="n-card p-10 mb-6">';
    h += 共享卡片头('📥', '改编', '粘贴或从模板库「去改编」原文，按选项改写成新作');
    h += '<textarea class="llm-input llm-input-lg" id="' + cfg.prefix + 'AdaptSource" placeholder="要改编的原文（模板库「去改编」自动带入 / 粘贴）" style="width:100%;height:96px;resize:vertical" onchange="' + cfg.windowPrefix + '编辑字段(\'adaptSource\',this.value)">' + escHtml(s.adaptSource||'') + '</textarea>';
    h += 共享参数行('露骨度', ['维持原度','污秽淫化'].map(function(o){
      return '<span class="tag-chip' + ((s.adaptExplicit||'污秽淫化') === o ? ' tag-active' : '') + '" data-adapt-explicit="' + o + '" onclick="' + cfg.windowPrefix + '编辑字段(\'adaptExplicit\',\'' + o + '\');' + cfg.windowPrefix + '同步chips()">' + o + '</span>';
    }).join(''));
    h += 共享参数行('篇幅', ['浓缩','维持','扩写'].map(function(o){
      return '<span class="tag-chip' + ((s.adaptLen||'维持') === o ? ' tag-active' : '') + '" data-adapt-len="' + o + '" onclick="' + cfg.windowPrefix + '编辑字段(\'adaptLen\',\'' + o + '\');' + cfg.windowPrefix + '同步chips()">' + o + '</span>';
    }).join(''));
    h += '<button class="btn btn-primary" style="width:100%;padding:10px 18px;font-size:13px;margin-top:6px" onclick="openAiGenPanel(\'' + cfg.aiFieldId + 'Adapt\')">📥 生成改编</button>';
    h += '</div>';
    el.innerHTML = h;
    // 敬语/落款自定义输入框联动
    var sal = document.getElementById(cfg.prefix + 'Salutation');
    if (sal) sal.addEventListener('input', function(){ 编辑字段('salutation', this.value); 同步chips(); });
    var clo = document.getElementById(cfg.prefix + 'Closing');
    if (clo) clo.addEventListener('input', function(){ 编辑字段('closing', this.value); 同步chips(); });
  }

  function 同步chips() {
    var root = document.getElementById(cfg.viewContentId);
    if (!root) return;
    root.querySelectorAll('.tag-chip').forEach(function(c) {
      if (c.classList.contains('inspire-imagery')) c.classList.toggle('tag-active', (编辑状态.imagery||[]).indexOf(c.getAttribute('data-imagery')) >= 0);
      else if (c.hasAttribute('data-genre')) c.classList.toggle('tag-active', (编辑状态.genre||[]).indexOf(c.getAttribute('data-genre')) >= 0);
      else if (c.hasAttribute('data-explicit')) c.classList.toggle('tag-active', (编辑状态.explicit||默认露骨度) === c.getAttribute('data-explicit'));
      else if (c.hasAttribute('data-salute')) c.classList.toggle('tag-active', (编辑状态.salutation||'') === c.getAttribute('data-salute'));
      else if (c.hasAttribute('data-close')) c.classList.toggle('tag-active', (编辑状态.closing||'') === c.getAttribute('data-close'));
      else if (c.hasAttribute('data-adapt-explicit')) c.classList.toggle('tag-active', (编辑状态.adaptExplicit||'污秽淫化') === c.getAttribute('data-adapt-explicit'));
      else if (c.hasAttribute('data-adapt-len')) c.classList.toggle('tag-active', (编辑状态.adaptLen||'维持') === c.getAttribute('data-adapt-len'));
    });
  }
  function 切换题材(g) {
    var arr = 编辑状态.genre || [];
    arr = arr.indexOf(g) >= 0 ? arr.filter(function(x){return x!==g;}) : arr.concat([g]);
    编辑状态.genre = arr;
  }
  function 切换意象(im) {
    var arr = 编辑状态.imagery || [];
    arr = arr.indexOf(im) >= 0 ? arr.filter(function(x){return x!==im;}) : arr.concat([im]);
    编辑状态.imagery = arr;
  }
  function 随机灵感() {
    if (!意象库) { toast('本模块暂无灵感数据'); return; }
    var cats = Object.keys(意象库);
    var imgs = [];
    cats.forEach(function(c) {
      var arr = 意象库[c];
      if (imgs.length < 6) imgs.push(arr[Math.floor(Math.random() * arr.length)]);
    });
    var g = 共享题材选项[Math.floor(Math.random() * 共享题材选项.length)];
    编辑状态.imagery = imgs.slice(0, 3 + Math.floor(Math.random() * 3));
    编辑状态.genre = g ? [g] : 编辑状态.genre;
    编辑字段('imagery', 编辑状态.imagery);
    编辑字段('genre', 编辑状态.genre);
    同步chips();
    toast('灵感已填入：' + 编辑状态.imagery.slice(0,3).join('、') + (g ? ' · ' + g : ''));
  }

  // ===== 角色导入 =====
  function 共享角色名(c) { var bi = c && c.identity && c.identity.basicInfo || {}; return bi.name || '未命名'; }
  function 共享角色chipsHTML() {
    var h = '';
    (编辑状态.roles || []).forEach(function(c) {
      h += '<span class="tag-chip" title="点击移除" onclick="' + cfg.windowPrefix + '移除角色(this)">' + escHtml(共享角色名(c)) + ' ✕</span>';
    });
    if ((编辑状态.roles || []).length) h += '<span class="tag-chip" style="color:var(--fg3)" title="清空已导入角色" onclick="' + cfg.windowPrefix + '清空角色()">✕ 清空</span>';
    h += '<span class="tag-chip" style="color:var(--accent);cursor:pointer" title="从角色卡导入" onclick="' + cfg.windowPrefix + '导入角色()">📂 导入</span>';
    return h;
  }
  function 共享刷新角色行() { var el = document.getElementById(cfg.prefix + 'RoleChips'); if (el) el.innerHTML = 共享角色chipsHTML(); }
  function 共享移除角色(chip) { var name = chip.textContent.replace(' ✕', '').trim(); 编辑状态.roles = (编辑状态.roles || []).filter(function(c) { return 共享角色名(c) !== name; }); 编辑字段('roles', 编辑状态.roles); 共享刷新角色行(); }
  function 共享清空角色() { 编辑字段('roles', []); 共享刷新角色行(); }
  function 共享导入角色() {
    stcdOpenCharPicker('', { onPick: function(data) { if (!data) { toast('角色数据不存在'); return; } 编辑状态.roles = 编辑状态.roles || []; 编辑状态.roles.push(JSON.parse(JSON.stringify(data))); 编辑字段('roles', 编辑状态.roles); 共享刷新角色行(); toast('已导入角色：' + 共享角色名(data)); } });
  }
  function 共享导入角色列表(genderFilter) { 共享导入角色(); }

  // ===== AI 提示词组装（角色段 / 参数段，藏字段）=====
  var 模块独有选题 = cfg.模块独有选题;
  var 共享露骨度解释表 = {
    '含蓄隐晦': '以隐喻借代写情欲、不明写性事', '唯美风雅': '用优美雅致的语汇写情欲、点到即止',
    '直白露骨': '直接描写身体与交合、用词大胆', '粗俗荤文': '用最粗鄙直白的荤词俚语、情欲描写毫不遮掩'
  };
  var 共享类型解释表 = cfg.类型解释表 || {};
  function 共享角色上下文() {
    var arr = (编辑状态.roles || []).map(function(c) {
      return '【' + 共享角色名(c) + '】\n' + (typeof window.角色卡身份与外貌 === 'function' ? window.角色卡身份与外貌(c) : JSON.stringify(c || {}));
    });
    if (!arr.length) return '';
    return '【要写的相关人物】\n\n' + arr.join('\n\n');
  }
  function 共享藏字上下文() {
    var t = ((document.getElementById(cfg.prefix + 'Acrostic') || {}).value || '').trim();
    if (!t) return '';
    var chars = Array.from(t);
    return '【藏字】' + t + '\n（共 ' + chars.length + ' 个，每行/每段句首依次嵌入「' + chars.join('」「') + '」，首字连读即此文字；藏字须自然融入句意，不生硬）\n';
  }
  function 共享参数上下文() {
    var ctx = '';
    if (编辑状态.form && 编辑状态.form !== 期望默认类型) ctx += (cfg.formOptionsLabel || '类型') + '：' + 编辑状态.form + (共享类型解释表[编辑状态.form] ? '\n　' + 共享类型解释表[编辑状态.form] : '') + '\n';
    if (编辑状态.recipient) ctx += '收信人：' + 编辑状态.recipient + '\n';
    if (编辑状态.sender) ctx += '署名：' + 编辑状态.sender + '\n';
    if (编辑状态.salutation) ctx += '敬语：' + 编辑状态.salutation + '\n';
    if (编辑状态.closing) ctx += '落款：' + 编辑状态.closing + '\n';
    if (编辑状态.date) ctx += '日期：' + 编辑状态.date + '\n';
    if (编辑状态.genre && 编辑状态.genre.length) ctx += '题材：' + 编辑状态.genre.join('、') + '\n';
    if (编辑状态.explicit) ctx += '露骨度：' + 编辑状态.explicit + (共享露骨度解释表[编辑状态.explicit] ? '\n　' + 共享露骨度解释表[编辑状态.explicit] : '') + '\n';
    if (编辑状态.imagery && 编辑状态.imagery.length) ctx += '意象：' + 编辑状态.imagery.join('、') + '\n';
    return ctx;
  }

  // ===== AI 字段注册 =====
  if (typeof registerAiField !== 'undefined') {
    registerAiField(cfg.aiFieldId + 'Suggest', cfg.aiLabel + '题目建议', function() {
      var ctx = '';
      if (编辑状态.genre && 编辑状态.genre.length) ctx += '题材：' + 编辑状态.genre.join('、') + '\n';
      if (编辑状态.explicit) ctx += '露骨度：' + 编辑状态.explicit + '\n';
      if (编辑状态.imagery && 编辑状态.imagery.length) ctx += '意象：' + 编辑状态.imagery.join('、') + '\n';
      if (!ctx) ctx = '当前无已选元素，自由发挥';
      var r = renderPrompt(cfg.promptName + '_inspire', { ctx: ctx, charCtx: 共享角色上下文() }); return { user: r.user, system: r.system };
    }, { fillFn: function(d) {
      if (!d) return;
      if (d.title) 编辑字段('title', d.title);
      if (d.genre) 编辑字段('genre', d.genre);
      if (d.imagery) 编辑字段('imagery', d.imagery);
      if (d.explicit) 编辑字段('explicit', d.explicit);
      var titleEl = document.getElementById(cfg.prefix + 'Title');
      if (titleEl) titleEl.value = 编辑状态.title || '';
      同步chips();
      toast('题目建议已填入');
    }});
    registerAiField(cfg.aiFieldId, cfg.aiLabel, function() {
      var direction = ((document.getElementById(cfg.prefix + 'Direction')||{}).value || '').trim();
      var ctx = 共享参数上下文();
      if (direction) ctx += '\n方向：' + direction;
      var acrosticText = ((document.getElementById(cfg.prefix + 'Acrostic')||{}).value||'').trim();
      var promptName = acrosticText ? cfg.promptName + '_acrostic' : cfg.promptName;
      var r = renderPrompt(promptName, { ctx: ctx, charCtx: 共享角色上下文(), acrostic: acrosticText ? 共享藏字上下文() : '' }); return { user: r.user, system: r.system };
    }, { fillFn: function(d) {
      if (!d) return;
      var s = 编辑状态;
      if (d.title) s.title = d.title;
      if (d.content) s.content = d.content;
      if (d.tags) s.tags = d.tags;
      if (d.form) s.form = d.form;
      if (d.genre) s.genre = d.genre;
      if (d.explicit) s.explicit = d.explicit;
      if (d.imagery) s.imagery = d.imagery;
      if (d.recipient) s.recipient = d.recipient;
      if (d.sender) s.sender = d.sender;
      if (d.salutation) s.salutation = d.salutation;
      if (d.closing) s.closing = d.closing;
      if (d.date) s.date = d.date;
      var titleEl = document.getElementById(cfg.prefix + 'Title');
      if (titleEl) titleEl.value = s.title || '';
      var formEl = document.getElementById(cfg.prefix + 'Form');
      if (formEl) formEl.value = s.form || 默认类型;
      var contentEl = document.getElementById(cfg.prefix + 'Content');
      if (contentEl) contentEl.value = s.content || '';
      同步chips();
      var newTitle = (s.title || '').trim();
      var next = function() {
        if (_editTitle) {
          Store[cfg.storeKey].get(_editTitle).then(function(m) {
            m = m || {}; Object.assign(m, s);
            Store[cfg.storeKey].save(_editTitle, m).then(function(){});
          });
        } else {
          var data = {
            title: s.title, content: s.content || '', tags: s.tags || [],
            form: s.form || 默认类型, explicit: s.explicit || 默认露骨度,
            genre: s.genre || [], imagery: s.imagery || [],
            recipient: s.recipient || '', sender: s.sender || '',
            salutation: s.salutation || '', closing: s.closing || '', date: s.date || '',
            roles: s.roles || []
          };
          Store[cfg.storeKey].save(s.title, data).then(function(){ _editTitle = s.title; });
        }
        toast('AI 提案已填入，可修改后保存');
      };
      if (_editTitle && newTitle && newTitle !== _editTitle) {
        var oldTitle = _editTitle;
        _editTitle = null;
        Store[cfg.storeKey].delete(oldTitle).catch(function(){}).then(function() { next(); });
      } else { next(); }
    }});
    registerAiField(cfg.aiFieldId + 'Adapt', cfg.aiLabel + '改编', function() {
      var source = (document.getElementById(cfg.prefix + 'AdaptSource')||{}).value || '';
      var s = 编辑状态;
      if (!source.trim()) { toast('请先输入要改编的原文'); return null; }
      var ctx = '';
      if (s.genre && s.genre.length) ctx += '题材：' + s.genre.join('、') + '\n';
      if (s.imagery && s.imagery.length) ctx += '意象：' + s.imagery.join('、') + '\n';
      if (s.recipient) ctx += '收信人：' + s.recipient + '\n';
      if (s.sender) ctx += '署名：' + s.sender + '\n';
      var acrosticText = ((document.getElementById(cfg.prefix + 'Acrostic')||{}).value||'').trim();
      var promptName = acrosticText ? cfg.promptName + '_acrostic' : cfg.promptName + '_adapt';
      var r = renderPrompt(promptName, {
        ctx: ctx,
        charCtx: 共享角色上下文(),
        acrostic: acrosticText ? 共享藏字上下文() : '',
        source: source,
        adaptExplicit: s.adaptExplicit || '污秽淫化',
        adaptLen: s.adaptLen || '维持'
      }); return { user: r.user, system: r.system };
    }, { fillFn: function(d) {
      if (!d) return;
      var s = 编辑状态;
      if (d.title) s.title = d.title;
      if (d.content) s.content = d.content;
      if (d.form) s.form = d.form;
      if (d.genre) s.genre = d.genre;
      if (d.explicit) s.explicit = d.explicit;
      if (d.imagery) s.imagery = d.imagery;
      if (d.tags) s.tags = d.tags;
      if (d.recipient) s.recipient = d.recipient;
      if (d.sender) s.sender = d.sender;
      if (d.salutation) s.salutation = d.salutation;
      if (d.closing) s.closing = d.closing;
      if (!(s.title || '').trim()) s.title = '改编' + (s.adaptSource || '').substring(0, 4);
      var titleEl = document.getElementById(cfg.prefix + 'Title');
      if (titleEl) titleEl.value = s.title || '';
      var formEl = document.getElementById(cfg.prefix + 'Form');
      if (formEl) formEl.value = s.form || 默认类型;
      var contentEl = document.getElementById(cfg.prefix + 'Content');
      if (contentEl) contentEl.value = s.content || '';
      同步chips();
      var data = {
        title: s.title, content: s.content || '', tags: s.tags || [],
        form: s.form || 默认类型, explicit: s.explicit || 默认露骨度,
        genre: s.genre || [], imagery: s.imagery || [],
        recipient: s.recipient || '', sender: s.sender || '',
        salutation: s.salutation || '', closing: s.closing || '', date: s.date || '',
        adaptSource: s.adaptSource || '', adaptExplicit: s.adaptExplicit || '', adaptLen: s.adaptLen || '',
        roles: s.roles || []
      };
      if (_editTitle) {
        Store[cfg.storeKey].get(_editTitle).then(function(m) {
          m = m || {}; Object.assign(m, data);
          Store[cfg.storeKey].save(_editTitle, m).then(function(){});
        });
      } else {
        Store[cfg.storeKey].save(s.title, data).then(function(){ _editTitle = s.title; });
      }
      toast('改编结果已填入编辑器，可修改后保存');
    }});
  }

  // ===== 模板库（读 renderer/数据库/书信社交）=====
  var 模板缓存 = null;
  var 模板筛选 = { form: '', genre: '' };
  var 模板搜索 = '';
  var 模板题材库 = cfg.题材库 || [];
  function 模板构建题材命中(arr, item) {
    var t = (item.title || '') + '|' + (item.body || item.content || '');
    var hit = [];
    模板题材库.forEach(function(g) {
      for (var i = 0; i < (g.kws || []).length; i++) {
        if (t.indexOf(g.kws[i]) >= 0) { hit.push(g.key); break; }
      }
    });
    return hit;
  }
  function 渲染模板库(el) {
    if (!cfg.dbPath) { el.innerHTML = '<div class="placeholder-text">模板库暂无数据</div>'; return; }
    if (模板缓存) { 渲染模板列表(el); return; }
    el.innerHTML = '<div class="text-muted p-20 text-center">正在加载模板库...</div>';
    LocalFS.dbRead(cfg.dbPath).then(function(text) {
      if (!text) { el.innerHTML = '<div class="placeholder-text">模板库暂无数据</div>'; return; }
      try {
        var arr = JSON.parse(text);
        模板缓存 = { all: arr.map(function(p) {
          return { title: p.title || '无题', author: p.author || '', era: p.era || '', type: p.type || '', body: p.body || p.content || '' };
        }) };
      } catch(e) { 模板缓存 = { all: [] }; }
      渲染模板列表(el);
    }).catch(function() { el.innerHTML = '<div class="placeholder-text">模板库加载失败</div>'; });
  }
  function 模板筛选栏HTML() {
    var f = 模板筛选;
    var h = '';
    var chip = function(active, fn, label) {
      return '<span class="btn-out btn-sm" style="font-size:10px;padding:2px 8px;' + (active ? 'background:var(--accent);color:#fff;border-color:var(--accent)' : '') + ';cursor:pointer" onclick="' + cfg.windowPrefix + fn + '">' + label + '</span>';
    };
    // 类型行
    if (cfg.formOptions && cfg.formOptions.length) {
      h += '<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:wrap">';
      h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">类型</span>';
      h += chip(!f.form, '模板筛选类型(\'\')', '全部');
      cfg.formOptions.forEach(function(t) { h += chip(f.form === t, '模板筛选类型(\'' + t + '\')', escHtml(t)); });
      h += '</div>';
    }
    // 题材行
    if (模板题材库.length) {
      h += '<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:wrap">';
      h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">题材</span>';
      h += chip(!f.genre, '模板筛选题材(\'\')', '全部');
      模板题材库.forEach(function(g) { h += chip(f.genre === g.key, '模板筛选题材(\'' + g.key + '\')', g.key); });
      h += '</div>';
    }
    // 搜索行
    h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">';
    h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">搜索</span>';
    h += '<input id="' + cfg.prefix + 'TemplateSearch" type="text" placeholder="搜索标题 / 正文…" value="' + escHtml(模板搜索) + '" style="flex:1;font-size:12px;padding:4px 8px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;color:var(--fg)" onkeydown="if(event.key===\'Enter\'){' + cfg.windowPrefix + '模板执行搜索()}">';
    h += '<button class="btn btn-sm" onclick="' + cfg.windowPrefix + '模板执行搜索()" style="font-size:11px;padding:4px 12px">🔍 搜索</button>';
    if (模板搜索) h += '<span style="font-size:10px;color:var(--fg3);cursor:pointer" onclick="' + cfg.windowPrefix + '模板清空搜索()">✕ 清除</span>';
    h += '</div>';
    return h;
  }
  function 模板筛选逻辑(all) {
    var filtered = all;
    if (模板筛选.form) filtered = filtered.filter(function(p) { return (p.type || '') === 模板筛选.form; });
    if (模板筛选.genre && 模板题材库.length) filtered = filtered.filter(function(p) { return 模板题材命中(p).indexOf(模板筛选.genre) >= 0; });
    if (模板搜索) {
      var q = 模板搜索;
      filtered = filtered.filter(function(p) { return (p.title||'').indexOf(q) >= 0 || (p.body||'').indexOf(q) >= 0; });
    }
    return filtered;
  }
  var 模板题材命中内存 = {};
  function 模板题材命中(p) {
    var t = (p.title || '') + '|' + (p.body || '');
    var key = t.slice(0, 30);
    if (模板题材命中内存[key]) return 模板题材命中内存[key];
    var hit = [];
    模板题材库.forEach(function(g) {
      for (var i = 0; i < (g.kws || []).length; i++) { if (t.indexOf(g.kws[i]) >= 0) { hit.push(g.key); break; } }
    });
    模板题材命中内存[key] = hit;
    return hit;
  }
  function 渲染模板列表(el) {
    var all = 模板缓存.all;
    var filtered = 模板筛选逻辑(all);
    var total = filtered.length;
    var pages = Math.max(1, Math.ceil(total / 经典每页));
    if (经典分页 >= pages) 经典分页 = 0;
    var pageItems = filtered.slice(经典分页 * 经典每页, (经典分页 + 1) * 经典每页);
    var h = '';
    h += '<div class="text-sm fw-600 mb-4" style="color:var(--accent)">📚 ' + (cfg.classicLabel || '书信') + '模板库</div>';
    h += 模板筛选栏HTML();
    h += '<div style="font-size:11px;color:var(--fg3);margin-bottom:10px">共 ' + all.length + ' 篇，当前筛选命中 ' + total + ' 篇</div>';
    if (!pageItems.length) h += '<div class="placeholder-text">无匹配模板</div>';
    pageItems.forEach(function(p) {
      var len = (p.body || '').length;
      var lenLabel = len < 80 ? '短' : (len < 300 ? '中' : '长');
      var t = p.type || '';
      h += '<div class="cur-ptr" style="padding:9px 10px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:9px;transition:background 0.12s" onmouseover="this.style.background=\'var(--accent-dim)\'" onmouseout="this.style.background=\'\'" onclick="' + cfg.windowPrefix + '模板阅读(\'' + escHtml(p.title) + '\')">';
      // 左侧：类型徽标（彩色小圆角）
      h += '<span style="flex-shrink:0;font-size:10px;padding:2px 8px;border-radius:6px;background:var(--accent-dim);color:var(--accent2);max-width:88px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + escHtml(t) + '">' + escHtml(t || '模板') + '</span>';
      // 主标题 + 预览
      h += '<div style="flex:1;min-width:0">';
      h += '<div style="font-size:13px;font-weight:600;color:var(--fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(模板显示标题(p)) + '</div>';
      h += '<div style="font-size:11px;color:var(--fg3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px">' + escHtml(p.body || '').replace(/\s+/g, ' ').slice(0, 44) + '</div>';
      h += '</div>';
      // 右侧：字数 + 年代
      h += '<div style="flex-shrink:0;text-align:right">';
      h += '<div style="font-size:10px;color:var(--fg3)">' + lenLabel + ' · ' + len + '字</div>';
      if (p.era) h += '<div style="font-size:10px;color:var(--fg3);margin-top:1px">' + escHtml(p.era) + '</div>';
      h += '</div>';
      h += '</div>';
    });
    if (pages > 1) {
      h += '<div class="flex gap-4 align-center mt-6 flex-wrap">';
      h += '<button class="btn-sm"' + (经典分页 === 0 ? ' disabled' : '') + ' onclick="' + cfg.windowPrefix + '模板翻页(-1)">← 上一页</button>';
      h += '<span class="text-sm text-muted">第 ' + (经典分页 + 1) + ' / ' + pages + ' 页</span>';
      h += '<button class="btn-sm"' + (经典分页 >= pages - 1 ? ' disabled' : '') + ' onclick="' + cfg.windowPrefix + '模板翻页(1)">下一页 →</button>';
      h += '</div>';
    }
    el.innerHTML = h;
    var si = document.getElementById(cfg.prefix + 'TemplateSearch');
    if (si) si.value = 模板搜索;
  }
  // 模板显示标题：优先用正文首句（去掉编号/前缀），作为卡片与阅读窗的展示标题；title 仅作内部定位
  function 模板显示标题(p) {
    var b = String(p.body || '').trim().split(/\r?\n/)[0] || '';
    b = b.replace(/^[\d一二三四五六七八九十]+[、.．)）]\s*/, '').replace(/^(他|她|男|女|A|B|我|你)[：:]\s*/, '');
    if (b && b.length > 2) return b;  // 用首句
    return p.title || '无题';
  }
  function 模板阅读(title) {
    var all = 模板缓存.all;
    var filtered = 模板筛选逻辑(all);
    var idx = -1;
    for (var i = 0; i < filtered.length; i++) if (filtered[i].title === title) { idx = i; break; }
    if (idx < 0) return;
    var p = filtered[idx];
    document.querySelectorAll('.ovl').forEach(function(o) { o.remove(); });
    var len = (p.body || '').length;
    var h = '';
    h += '<div class="reader-head">';
    h += '<span class="reader-title">📖 ' + escHtml(模板显示标题(p)) + '</span>';
    if (p.era) h += '<span class="reader-tag">' + escHtml(p.era) + '</span>';
    if (p.type) h += '<span class="reader-tag">' + escHtml(p.type) + '</span>';
    if (p.author) h += '<span class="reader-tag">' + escHtml(p.author) + '</span>';
    h += '<span class="reader-meta" style="margin-left:auto">' + (len < 80 ? '短' : len < 300 ? '中' : '长') + ' · ' + len + ' 字</span>';
    h += '</div>';
    h += '<div class="reader-body">';
    h += '<div class="reader-poem-title">' + escHtml(模板显示标题(p)) + '</div>';
    h += '<div class="reader-poem-author">' + escHtml(p.era || '') + '<span class="reader-dot">·</span>' + escHtml(p.type || '') + '</div>';
    h += '<div class="reader-poem-text" style="font-family:serif;line-height:1.9;text-align:left">' + escHtml(p.body || '') + '</div>';
    h += '</div>';
    h += '<div class="reader-foot">';
    h += '<span class="reader-count">' + (idx + 1) + ' / ' + filtered.length + '</span>';
    h += '<button class="reader-btn" onclick="' + cfg.windowPrefix + '模板去改编(\'' + escHtml(p.title) + '\')">✍️ 去改编</button>';
    h += '<button class="reader-btn" onclick="' + cfg.windowPrefix + '模板复制(\'' + escHtml(p.title) + '\')">📋 复制全文</button>';
    h += '<button class="reader-btn primary" onclick="this.closest(\'.ovl\').remove()">关闭</button>';
    h += '</div>';
    showModal('', h, { noWrap: true, cardClass: 'reader-night', ovlClass: 'reader-night-ovl' });
  }
  function 模板复制(title) {
    var all = 模板缓存.all;
    var filtered = 模板筛选逻辑(all);
    var p = null;
    for (var i = 0; i < filtered.length; i++) if (filtered[i].title === title) { p = filtered[i]; break; }
    if (!p) return;
    var text = (p.title || '') + '\n' + (p.body || '');
    复制到剪贴板(text).then(function(ok){ toast(ok ? '已复制全文' : '复制失败'); });
  }
  function 模板去改编(title) {
    var all = 模板缓存.all;
    var filtered = 模板筛选逻辑(all);
    var p = null;
    for (var i = 0; i < filtered.length; i++) if (filtered[i].title === title) { p = filtered[i]; break; }
    if (!p || !(p.body || '').trim()) { toast('该模板正文为空'); return; }
    document.querySelectorAll('.ovl').forEach(function(o) { o.remove(); });
    _editTitle = null;
    编辑状态.adaptSource = p.body || '';
    编辑状态.adaptExplicit = '污秽淫化';
    编辑状态.adaptLen = '维持';
    切换视图('editor');
    toast('模板已带入创作页改编卡');
  }
  function 模板筛选类型(t) { 模板筛选.form = t; 经典分页 = 0; 模板刷新(); }
  function 模板筛选题材(k) { 模板筛选.genre = k; 经典分页 = 0; 模板刷新(); }
  function 模板执行搜索() { var input = document.getElementById(cfg.prefix + 'TemplateSearch'); 模板搜索 = input ? input.value.trim() : ''; 经典分页 = 0; 模板刷新(); }
  function 模板清空搜索() { 模板搜索 = ''; 经典分页 = 0; 模板刷新(); }
  function 模板刷新() { var vEl = document.getElementById(cfg.viewContentId); if (vEl) 渲染模板列表(vEl); }
  function 模板翻页(delta) { 经典分页 += delta; if (经典分页 < 0) 经典分页 = 0; 模板刷新(); }

  window[cfg.windowPrefix + '切换视图'] = 切换视图;
  window[cfg.windowPrefix + '新创作'] = 新创作;
  window[cfg.windowPrefix + '筛选'] = 筛选;
  window[cfg.windowPrefix + '编辑项'] = 编辑项;
  window[cfg.windowPrefix + '删除项'] = 删除项;
  window[cfg.windowPrefix + '阅读'] = 阅读;
  window[cfg.windowPrefix + '复制全文'] = 复制全文;
  window[cfg.windowPrefix + '编辑字段'] = 编辑字段;
  window[cfg.windowPrefix + '同步chips'] = 同步chips;
  window[cfg.windowPrefix + '切换题材'] = 切换题材;
  window[cfg.windowPrefix + '切换意象'] = 切换意象;
  window[cfg.windowPrefix + '随机灵感'] = 随机灵感;
  window[cfg.windowPrefix + '导入角色'] = 共享导入角色;
  window[cfg.windowPrefix + '导入角色列表'] = 共享导入角色列表;
  window[cfg.windowPrefix + '移除角色'] = 共享移除角色;
  window[cfg.windowPrefix + '清空角色'] = 共享清空角色;
  window[cfg.windowPrefix + '模板库'] = function() { 切换视图('classic'); };
  window[cfg.windowPrefix + '模板筛选类型'] = 模板筛选类型;
  window[cfg.windowPrefix + '模板筛选题材'] = 模板筛选题材;
  window[cfg.windowPrefix + '模板执行搜索'] = 模板执行搜索;
  window[cfg.windowPrefix + '模板清空搜索'] = 模板清空搜索;
  window[cfg.windowPrefix + '模板刷新'] = 模板刷新;
  window[cfg.windowPrefix + '模板翻页'] = 模板翻页;
  window[cfg.windowPrefix + '模板阅读'] = 模板阅读;
  window[cfg.windowPrefix + '模板复制'] = 模板复制;
  window[cfg.windowPrefix + '模板去改编'] = 模板去改编;

  return { 切换视图: 切换视图, 当前视图: function(){ return 当前视图; } };
}
window.书信社交工厂 = 书信社交工厂;
