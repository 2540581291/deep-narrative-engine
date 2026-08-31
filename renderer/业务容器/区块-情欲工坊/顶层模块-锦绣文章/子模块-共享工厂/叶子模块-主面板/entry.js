// 情欲工坊 · 锦绣文章 · 文体模块共享工厂
// 为 议论文/记叙文/游记文/辞赋文 提供统一的 list/editor/阅读 AI 逻辑，避免多份重复代码

// 灵感素材卡·意象库（类别 → 意象列表；共享工厂内置默认，模块 cfg.意象库 可覆盖）
var 锦绣文章默认意象库 = {
  '身体': ['乳房', '乳头', '乳晕', '腰', '臀', '大腿', '阴毛', '肚脐', '锁骨', '脖颈', '嘴唇', '舌头', '手指', '脚', '脚踝', '肩膀', '腋窝', '膝弯'],
  '性器官': ['阴蒂', '阴唇', '阴阜', '阴道', '子宫', '处女膜', '阴茎', '龟头', '包皮', '阴囊', '睾丸', '尿道口', '前列腺', '肛门'],
  '玩具': ['跳蛋', '按摩棒', '假阳具', '振动棒', '飞机杯', '贞操带', '乳夹', '肛塞', '口塞', '锁精环', '皮鞭', '手铐', '项圈', '绳索', '蜡烛', '枷锁'],
  '动作': ['操', '干', '插', '捅', '抽', '顶', '舔', '吮', '含', '咬', '吸', '揉', '捏', '掐', '拍', '打', '扇', '抓', '压', '骑', '塞', '灌', '射', '尿', '拉', '滴', '深喉', '口爆', '颜射', '潮吹', '肛交'],
  '污物': ['尿', '粪', '精液', '包皮垢', '淫水', '白带', '经血', '前列腺液', '口水', '汗液'],
  '场景': ['春宵', '闺房', '浴室', '书房', '花园', '月下', '花前', '灯下', '帐中', '舟中', '屏风后', '池畔', '更衣室', '办公室', '电梯', '车里', '阳台', '天台', '酒吧', '浴室镜前', '雨夜', '雪夜', '午后', '深夜'],
  '衣服': ['船袜', '白丝', '黑丝', '渔网袜', '吊裤袜', '开裆裤', '肚兜', '亵衣', '绣花鞋', '旗袍', '吊带袜', '高跟鞋', '女仆装', '护士装', '教师装', '水手服', '和服', '汉服', '婚纱', '制服', '蕾丝内衣', '丁字裤', '情趣内衣', '猫耳', '眼罩', '项圈', '皮衣', '皮革手套', '露背装'],
};

function 锦绣文章模块工厂(cfg) {
  // cfg: { storeKey, navLabelList, navLabelEdit, containerId, viewContentId, formOptions, formOptionsLabel, 默认文体, 默认露骨度, 题材选项, 题材解释, 专属选题, 意象库, promptName, adaptPromptName, suggestPromptName, aiFieldId, aiLabel, 显示标签, 筛选维度 }
  var 共享题材选项 = cfg.题材选项 || ['口交', '乳交', '调教', '绿帽', '人妻', '乱伦', '足交', '露出', '肛交', '群交'];
  // 题材/体例解释仅注入 AI 参数段，不渲染到 UI
  var 共享题材解释表 = cfg.题材解释 || {
    '口交': '以口舌侍弄性器的性行为为核心展开',
    '乳交': '以乳部夹侍性器的性行为为核心展开',
    '调教': '以支配驯服、规矩训练的关系为核心展开',
    '绿帽': '以伴侣与他人染指的关系纠葛为核心展开',
    '人妻': '以已婚女子与禁忌关系为核心展开',
    '乱伦': '以亲属间的禁忌关系为核心展开',
    '足交': '以足部侍弄性器的性行为为核心展开',
    '露出': '以公共场所暴露身体与性事为核心展开',
    '肛交': '以肛门性行为为核心展开',
    '群交': '以三人及以上同场交合为核心展开',
  };
  function 共享题材解释txt() {
    var sel = 编辑状态.genre || [];
    var arr = [];
    sel.forEach(function(g) {
      var t = 共享题材解释表[g];
      if (t) arr.push(g + '：' + t);
    });
    return arr.join('；');
  }
  // 体例（文体/类型/体例）解释：仅注入 AI 参数段
  function 体例解释txt() {
    return cfg.form解释 ? (cfg.form解释[编辑状态.form] || '') : '';
  }
  var 共享露骨度选项 = cfg.露骨度选项 || ['含蓄隐晦', '粗俗荤诗'];
  var 导航 = [
    { id: 'list', label: cfg.navLabelList },
    { id: 'editor', label: cfg.navLabelEdit },
  ];
  var 当前视图 = 'list';
  var _editTitle = null;
  var 编辑状态 = {};
  var 筛选状态 = {};        // 列表筛选：{ form:'全部', genre:'全部', explicit:'全部' }
  var 筛选维度 = cfg.筛选维度 || ['form'];   // 列表筛选维度（默认仅文体行）
  var 创作防抖保存 = null;   // 自动建档模块的字段防抖写盘
  var 默认露骨度 = cfg.默认露骨度 || '粗俗荤诗';
  var 默认文体 = cfg.默认文体 || (cfg.formOptions && cfg.formOptions[0]) || '';
  var 意象库 = cfg.意象库 || 锦绣文章默认意象库;   // 灵感素材卡数据源
  var 模块独有选题 = cfg.专属选题;     // 选题卡模块独有行：{ label, options: [..], 编辑键: 'xx', ctx标签: 'xx' }

  // 旧数据兼容：早期作品把文体存在 type 字段（现统一为 form）
  function 取文体(item) { return (item && (item.form || item.type)) || 默认文体; }

  function 切换视图(view) {
    当前视图 = view;
    var el = document.getElementById(cfg.containerId);
    if (!el) return;
    var h = '<div class="tl-subnav">';
    导航.forEach(function(v) { h += '<div class="tl-subitem' + (v.id === 当前视图 ? ' act' : '') + '" data-view="' + v.id + '">' + v.label + '</div>'; });
    h += '</div><div id="' + cfg.viewContentId + '"></div>';
    el.innerHTML = h;
    var vEl = document.getElementById(cfg.viewContentId);
    if (!vEl) return;
    el.querySelectorAll('.tl-subitem').forEach(function(i) { i.addEventListener('click', function() {
      var v = this.getAttribute('data-view');
      // 每次点进创作 tab 都重置为新表单（编辑已有作品走 编辑项 直接切换，不受影响）
      if (v === 'editor') { 新创作(); return; }
      切换视图(v);
    }); });
    switch (view) {
      case 'list': 渲染列表(vEl); break;
      case 'editor': 渲染编辑器(vEl); break;
    }
  }

  function 新创作() { _editTitle = null; 切换视图('editor'); }

  function 渲染列表(el) {
    Store[cfg.storeKey].list().then(function(items) {
      var h = '<div class="mb-10"><button class="btn-new" onclick="' + cfg.windowPrefix + '新创作()">＋ 新建</button></div>';
      // 文体筛选行（默认第一维）
      if (筛选维度.indexOf('form') >= 0) {
        h += 筛选行(cfg.formOptionsLabel || '文体', ['全部'].concat(cfg.formOptions), 筛选状态.form, cfg.windowPrefix + '筛选', 'form');
      }
      // 题材筛选行（cfg.筛选维度 含 genre 时）
      if (筛选维度.indexOf('genre') >= 0 && 共享题材选项) {
        h += 筛选行('题材', ['全部'].concat(共享题材选项), 筛选状态.genre, cfg.windowPrefix + '筛选', 'genre');
      }
      // 露骨度筛选行（cfg.筛选维度 含 explicit 时）
      if (筛选维度.indexOf('explicit') >= 0) {
        h += 筛选行('露骨度', ['全部'].concat(共享露骨度选项), 筛选状态.explicit, cfg.windowPrefix + '筛选', 'explicit');
      }
      var filtered = items || [];
      if (筛选状态.form && 筛选状态.form !== '全部') {
        filtered = filtered.filter(function(i) { return 取文体(i) === 筛选状态.form; });
      }
      if (筛选状态.genre && 筛选状态.genre !== '全部') {
        filtered = filtered.filter(function(i) { var g = Array.isArray(i.genre) ? i.genre : (i.genre ? [i.genre] : []); return g.indexOf(筛选状态.genre) >= 0; });
      }
      if (筛选状态.explicit && 筛选状态.explicit !== '全部') {
        filtered = filtered.filter(function(i) { return (i.explicit || 默认露骨度) === 筛选状态.explicit; });
      }
      if (!filtered.length) { h += '<div class="placeholder-text">暂无作品</div>'; }
      else {
        filtered.forEach(function(item) {
          h += '<div class="n-card cur-ptr mb-6 p-10" onclick="' + cfg.windowPrefix + '阅读(\'' + escHtml(item.title) + '\')">';
          h += '<div class="fw-600 fs-14">' + escHtml(item.title) + '</div>';
          h += '<div class="mt-4 flex gap-4 flex-wrap">';
          var fm = 取文体(item);
          if (fm && fm !== 默认文体) h += '<span class="badge-tag">' + escHtml(fm) + '</span>';
          if (item.explicit) h += '<span class="badge-tag">' + escHtml(item.explicit) + '</span>';
          var genres = Array.isArray(item.genre) ? item.genre : (item.genre ? [item.genre] : []);
          if (genres.length) h += genres.map(function(g){return '<span class="badge-tag">' + escHtml(g) + '</span>';}).join('');
          var tagsArr = Array.isArray(item.tags) ? item.tags : (item.tags ? [item.tags] : []);
          if (cfg.显示标签 && tagsArr.length) h += tagsArr.map(function(t){return '<span class="badge-tag">' + escHtml(t) + '</span>';}).join('');
          h += '</div>';
          h += '<div class="text-muted text-sm mt-4" style="white-space:pre-wrap">' + escHtml(item.content||'').slice(0,120) + '</div>';
          h += '<div class="mt-6 flex gap-4">';
          h += '<span class="btn-secondary btn-sm" onclick="event.stopPropagation();' + cfg.windowPrefix + '编辑项(\'' + escHtml(item.title) + '\')">✏️ 编辑</span>';
          h += '<span class="btn-secondary btn-sm c-error" onclick="event.stopPropagation();' + cfg.windowPrefix + '删除项(\'' + escHtml(item.title) + '\')">🗑 删除</span>';
          h += '</div></div>';
        });
      }
      el.innerHTML = h;
    });
  }

  function 筛选(field, val) {
    筛选状态[field] = val;
    切换视图('list');
  }

  function 编辑项(title) { _editTitle = title; 切换视图('editor'); }
  function 删除项(title) { confirmDialog('确定删除「' + title + '」？', function(){ Store[cfg.storeKey].delete(title).then(function(){ toast('已删除'); 切换视图('list'); }); }); }

  // ===== 列表弹窗阅读（正文居中衬线大字排版，下方赏析区不限字数）=====
  function 阅读(title) {
    Store[cfg.storeKey].get(title).then(function(item) {
      item = item || {};
      if (!item.content) { toast('该作品暂无正文'); return; }
      document.querySelectorAll('.ovl').forEach(function(o) { o.remove(); });
      var len = (item.content || '').length;
      var h = '';
      // 顶部元信息行
      h += '<div class="reader-head">';
      h += '<span class="reader-title">📖 ' + escHtml(item.title || title) + '</span>';
      var fm = 取文体(item);
      if (fm) h += '<span class="reader-tag">' + escHtml(fm) + '</span>';
      if (模块独有选题 && item[模块独有选题.编辑键]) h += '<span class="reader-tag">' + escHtml(item[模块独有选题.编辑键]) + '</span>';
      if (item.explicit) h += '<span class="reader-tag">' + escHtml(item.explicit) + '</span>';
      var genres2 = Array.isArray(item.genre) ? item.genre : (item.genre ? [item.genre] : []);
      if (genres2.length) h += '<span class="reader-tag">' + escHtml(genres2.join('、')) + '</span>';
      h += '<span class="reader-meta" style="margin-left:auto">' + (len < 80 ? '短' : len < 300 ? '中' : '长') + ' · ' + len + ' 字</span>';
      h += '</div>';
      // 正文区（居中题名 + 衬线大字排版）
      h += '<div class="reader-body">';
      h += '<div class="reader-poem-title">' + escHtml(item.title || title) + '</div>';
      h += '<div class="reader-poem-author">' + (fm ? escHtml(fm) : '') + '<span class="reader-dot">·</span>' + escHtml(item.explicit || '') + '</div>';
      h += '<div class="reader-poem-text">' + escHtml(item.content || '') + '</div>';
      // 赏析区（与正文同排版；生成按钮始终存在，可重新生成）
      h += '<div class="reader-appr">';
      if (item.appreciation) {
        h += '<div class="reader-appr-title">✦ 赏析</div>';
        h += '<div class="reader-appr-text">' + escHtml(item.appreciation) + '</div>';
      } else {
        h += '<div class="reader-appr-empty">';
        h += '<div class="text-muted" style="font-size:11px;letter-spacing:2px;margin-bottom:12px">暂无赏析</div>';
        h += '</div>';
      }
      h += '<button class="reader-btn" style="margin-top:10px" onclick="' + cfg.windowPrefix + '阅读生成赏析(\'' + escHtml(title) + '\')">🤖 生成赏析</button>';
      h += '</div>';
      h += '</div>';
      // 底部按钮栏
      h += '<div class="reader-foot">';
      h += '<button class="reader-btn" onclick="' + cfg.windowPrefix + '编辑项(\'' + escHtml(title) + '\')">✏️ 编辑</button>';
      h += '<button class="reader-btn" onclick="' + cfg.windowPrefix + '复制全文(\'' + escHtml(title) + '\')">📋 复制全文</button>';
      h += '<button class="reader-btn primary" onclick="this.closest(\'.ovl\').remove()">关闭</button>';
      h += '</div>';
      showModal('', h, { noWrap: true, cardClass: 'reader-night', ovlClass: 'reader-night-ovl' });
    });
  }

  // 弹窗内生成赏析：AI 结果写回 appreciation 并重开弹窗展示
  function 阅读生成赏析(title) {
    Store[cfg.storeKey].get(title).then(function(item) {
      item = item || {};
      if (!item.content) { toast('该作品暂无正文'); return; }
      if (typeof registerAiField === 'undefined') return;
      registerAiField(cfg.aiFieldId + 'Appr', cfg.aiLabel + '赏析', function() {
        var ctx = '作品标题：' + title + '\n' + (cfg.formOptionsLabel || '文体') + '：' + 取文体(item) + '\n题材：' + ((Array.isArray(item.genre) ? item.genre : (item.genre ? [item.genre] : [])).join('、')||'无') + '\n露骨度：' + (item.explicit||'') + '\n正文：\n' + item.content;
        var r = renderPrompt('poetry_appreciation_gen', { ctx: ctx, charCtx: '' }); return { user: r.user, system: r.system };
      }, { fillFn: function(d) {
        if (!d) return;
        item.appreciation = (d.content || d.text || '');
        Store[cfg.storeKey].save(title, item).then(function(){ toast('赏析已生成'); 阅读(title); });
      }});
      openAiGenPanel(cfg.aiFieldId + 'Appr');
    });
  }

  // 复制全文到剪贴板
  function 复制全文(title) {
    Store[cfg.storeKey].get(title).then(function(item) {
      item = item || {};
      var text = (item.title || title) + (取文体(item) ? ' · ' + 取文体(item) : '') + (item.explicit ? ' · ' + item.explicit : '') + '\n' + (item.content || '');
      复制到剪贴板(text).then(function(ok){ toast(ok ? '已复制全文' : '复制失败'); });
    });
  }

  // 自动建档（所有模块启用）：标题一确定（失焦/编辑其他字段）即落盘草稿，之后字段改动防抖写盘
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
        form: 编辑状态.form || 默认文体, explicit: 编辑状态.explicit || 默认露骨度,
        genre: 编辑状态.genre || [], imagery: 编辑状态.imagery || [],
        appreciation: 编辑状态.appreciation || '',
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
      // 用户改了标题：旧档案删除，按新标题重建，避免列表回退到旧标题
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
      // 标题一确定（失焦 onchange）即建档；未建档时编辑其他字段也先建档
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
      渲染表单(el, { title:'', content:'', tags:[], form:默认文体, genre:[], explicit:默认露骨度, imagery:[], appreciation:'',
        // 从改编带入的原文与选项（新建作品时保留，避免被重置冲掉）
        adaptSource: 编辑状态.adaptSource || '',
        adaptExplicit: 编辑状态.adaptExplicit || '',
        adaptLen: 编辑状态.adaptLen || ''
      });
    }
  }

  // ===== 卡片式创作页（与淫诗艳曲一致：作品信息 / 选题 / 灵感素材 / AI 生成 / 改编）=====
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
  // 灵感素材卡内容：意象 chips / 🎲 随机灵感（所有模块无条件渲染）
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
    if (灵感行) h += 共享参数行('灵感', 灵感行);
    h += '</div>';
    return h;
  }
  function 渲染表单(el, data) {
    编辑状态 = { title:data.title||'', form:取文体(data) || 默认文体, genre:data.genre||[], explicit:data.explicit||默认露骨度, content:data.content||'', tags:(Array.isArray(data.tags) ? data.tags : (data.tags ? String(data.tags).split('、') : [])).join('、'), imagery:data.imagery||[], appreciation:data.appreciation||'', roles:data.roles||[] };
    if (data.adaptSource) 编辑状态.adaptSource = data.adaptSource;
    if (data.adaptExplicit) 编辑状态.adaptExplicit = data.adaptExplicit;
    if (data.adaptLen) 编辑状态.adaptLen = data.adaptLen;
    if (模块独有选题) 编辑状态[模块独有选题.编辑键] = data[模块独有选题.编辑键] || '';
    var formOptions = cfg.formOptions.map(function(f) { return '<option value="' + f + '"' + (编辑状态.form === f ? ' selected' : '') + '>' + f + '</option>'; }).join('');
    var s = 编辑状态;
    var h = '<div class="mw-600">';
    // ① 作品信息卡：标题（+AI 建议）| 文体
    h += '<div class="n-card p-10 mb-6">';
    h += 共享卡片头('📋', '作品信息', '输入即自动保存');
    h += '<div class="ai-field-row">';
    h += '<input class="llm-input" id="' + cfg.prefix + 'Title" placeholder="' + escHtml(cfg.aiLabel) + '标题（失焦即自动建档）" value="' + escHtml(s.title||'') + '" style="flex:2" onchange="' + cfg.windowPrefix + '编辑字段(\'title\',this.value)">';
    h += '<button class="ai-suggest-btn" onclick="openAiGenPanel(\'' + cfg.aiFieldId + 'Suggest\')" title="AI 标题建议">🤖</button>';
    h += '<select class="llm-input" id="' + cfg.prefix + 'Form" style="flex:1" onchange="' + cfg.windowPrefix + '编辑字段(\'form\',this.value);' + cfg.windowPrefix + '同步chips()">' + formOptions + '</select>';
    h += '</div></div>';
    // ② 选题卡：题材 / 露骨度 / 专属选题 / 角色
    h += '<div class="n-card p-10 mb-6">';
    h += 共享卡片头('🎯', '选题', 'AI 可一键建议');
    if (共享题材选项 && 共享题材选项.length) h += 共享参数行('题材', 共享题材选项.map(function(g) {
      return '<span class="tag-chip' + (s.genre.indexOf(g) >= 0 ? ' tag-active' : '') + '" data-genre="' + g + '" onclick="' + cfg.windowPrefix + '切换题材(\'' + g + '\');' + cfg.windowPrefix + '同步chips()">' + g + '</span>';
    }).join(''));
    h += 共享参数行('露骨度', 共享露骨度选项.map(function(e) {
      return '<span class="tag-chip' + (s.explicit === e ? ' tag-active' : '') + '" data-explicit="' + e + '" onclick="' + cfg.windowPrefix + '编辑字段(\'explicit\',\'' + e + '\');' + cfg.windowPrefix + '同步chips()">' + e + '</span>';
    }).join(''));
    if (模块独有选题) h += 共享参数行(模块独有选题.label, 模块独有选题.options.map(function(o) {
      return '<span class="tag-chip' + (s[模块独有选题.编辑键] === o ? ' tag-active' : '') + '" data-module-opt="' + o + '" onclick="' + cfg.windowPrefix + '编辑字段(\'' + 模块独有选题.编辑键 + '\',\'' + o + '\');' + cfg.windowPrefix + '同步chips()">' + o + '</span>';
    }).join(''));
    // 额外选题行（如游记的「时长」）：{ label, options: [..], 编辑键: 'xx' }
    (cfg.额外选题 || []).forEach(function(extra) {
      h += 共享参数行(extra.label, extra.options.map(function(o) {
        return '<span class="tag-chip' + (s[extra.编辑键] === o ? ' tag-active' : '') + '" data-extra-opt="' + o + '" data-extra-key="' + extra.编辑键 + '" onclick="' + cfg.windowPrefix + '编辑字段(\'' + extra.编辑键 + '\',\'' + o + '\');' + cfg.windowPrefix + '同步chips()">' + o + '</span>';
      }).join(''));
    });
    h += 共享参数行('角色', '<span id="' + cfg.prefix + 'RoleChips">' + 共享角色chipsHTML() + '</span>');
    h += '</div>';
    // ③ 灵感素材卡（折叠，默认展开）：意象/随机灵感
    h += '<details class="n-card p-10 mb-6" open><summary style="display:flex;align-items:center;gap:8px;margin-bottom:10px;cursor:pointer;list-style:none;font-family:var(--font-sans)">';
    h += '<span style="width:3px;height:12px;background:var(--accent2);flex-shrink:0"></span>';
    h += '<span style="font-size:11px;letter-spacing:2px;color:var(--fg2)">💡 灵感素材</span>';
    h += '<span style="margin-left:auto;font-size:10px;color:var(--fg3);letter-spacing:1px">点击折叠</span>';
    h += '</summary>';
    h += 共享灵感侧栏HTML();
    h += '</details>';
    // ④ AI 生成卡：方向 → AI 生成按钮
    h += '<div class="n-card p-10 mb-6">';
    h += 共享卡片头('🚀', 'AI 生成', '按当前参数生成 · 结果回填表单');
    h += '<div class="mb-6">';
    h += '<textarea class="llm-input llm-input-lg" id="' + cfg.prefix + 'Direction" placeholder="主题 / 方向（可选，如：偏古典婉约、带淫靡氛围）" style="width:100%;height:64px;resize:vertical"></textarea>';
    h += '</div>';
    h += '<button class="btn btn-primary" style="width:100%;padding:10px 18px;font-size:13px" onclick="openAiGenPanel(\'' + cfg.aiFieldId + '\')">🚀 AI 生成</button>';
    h += '</div>';
    // ⑤ 改编卡：原文 + 露骨度/篇幅 chips + 生成按钮
    h += '<div class="n-card p-10 mb-6">';
    h += 共享卡片头('📥', '改编', '粘贴或导入原文，按选项改编成新作');
    h += '<textarea class="llm-input llm-input-lg" id="' + cfg.prefix + 'AdaptSource" placeholder="要改编的原文（粘贴）" style="width:100%;height:96px;resize:vertical" onchange="' + cfg.windowPrefix + '编辑字段(\'adaptSource\',this.value)">' + escHtml(s.adaptSource||'') + '</textarea>';
    h += 共享参数行('露骨度', ['维持原度','污秽淫化'].map(function(o){
      return '<span class="tag-chip' + ((s.adaptExplicit||'污秽淫化') === o ? ' tag-active' : '') + '" data-adapt-explicit="' + o + '" onclick="' + cfg.windowPrefix + '编辑字段(\'adaptExplicit\',\'' + o + '\');' + cfg.windowPrefix + '同步chips()">' + o + '</span>';
    }).join(''));
    h += 共享参数行('篇幅', ['浓缩','维持','扩写'].map(function(o){
      return '<span class="tag-chip' + ((s.adaptLen||'维持') === o ? ' tag-active' : '') + '" data-adapt-len="' + o + '" onclick="' + cfg.windowPrefix + '编辑字段(\'adaptLen\',\'' + o + '\');' + cfg.windowPrefix + '同步chips()">' + o + '</span>';
    }).join(''));
    h += '<button class="btn btn-primary" style="width:100%;padding:10px 18px;font-size:13px;margin-top:6px" onclick="openAiGenPanel(\'' + cfg.aiFieldId + 'Adapt\')">📥 生成改编</button>';
    h += '</div>';
    el.innerHTML = h;
  }

  function 同步chips() {
    var root = document.getElementById(cfg.viewContentId);
    if (!root) return;
    root.querySelectorAll('.tag-chip').forEach(function(c) {
      if (c.classList.contains('inspire-imagery')) {
        c.classList.toggle('tag-active', (编辑状态.imagery||[]).indexOf(c.getAttribute('data-imagery')) >= 0);
      }
      else if (c.hasAttribute('data-genre')) c.classList.toggle('tag-active', (编辑状态.genre||[]).indexOf(c.getAttribute('data-genre')) >= 0);
      else if (c.hasAttribute('data-explicit')) c.classList.toggle('tag-active', (编辑状态.explicit||默认露骨度) === c.getAttribute('data-explicit'));
      else if (c.hasAttribute('data-adapt-explicit')) c.classList.toggle('tag-active', (编辑状态.adaptExplicit||'污秽淫化') === c.getAttribute('data-adapt-explicit'));
      else if (c.hasAttribute('data-adapt-len')) c.classList.toggle('tag-active', (编辑状态.adaptLen||'维持') === c.getAttribute('data-adapt-len'));
      else if (模块独有选题 && c.hasAttribute('data-module-opt')) c.classList.toggle('tag-active', (编辑状态[模块独有选题.编辑键]||'') === c.getAttribute('data-module-opt'));
      else if (c.hasAttribute('data-extra-opt')) c.classList.toggle('tag-active', (编辑状态[c.getAttribute('data-extra-key')]||'') === c.getAttribute('data-extra-opt'));
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
  // 随机灵感（从意象库各取一个随机意象 + 随机题材）
  function 随机灵感() {
    if (!意象库) { toast('本模块暂无灵感数据'); return; }
    var cats = Object.keys(意象库);
    var imgs = [];
    cats.forEach(function(c) {
      var arr = 意象库[c];
      if (imgs.length < 6) imgs.push(arr[Math.floor(Math.random() * arr.length)]);
    });
    var g = 共享题材选项 && 共享题材选项.length ? 共享题材选项[Math.floor(Math.random() * 共享题材选项.length)] : null;
    编辑状态.imagery = imgs.slice(0, 3 + Math.floor(Math.random() * 3));
    编辑状态.genre = g ? [g] : 编辑状态.genre;
    编辑字段('imagery', 编辑状态.imagery);
    编辑字段('genre', 编辑状态.genre);
    同步chips();
    toast('灵感已填入：' + 编辑状态.imagery.slice(0,3).join('、') + (g ? ' · ' + g : ''));
  }

  // ===== AI 提示词组装（角色段 / 参数段）=====
  // 露骨度档位解释（由低到高，AI 参数段使用；改编卡「维持原度/污秽淫化」为改编专用档位，不在四档内）
  var 共享露骨度解释表 = {
    '含蓄隐晦': '以隐喻借代写性、不明写性事', '粗俗荤诗': '用最粗鄙直白的荤词俚语、性描写毫不遮掩'
  };
  // 角色段：【要写的相关人物】+ 各角色身份原文（角色卡身份与外貌 原样输出，不改动）
  function 共享角色上下文() {
    var arr = (编辑状态.roles || []).map(function(c) {
      return '【' + 共享角色名(c) + '】\n' + (typeof window.角色卡身份与外貌 === 'function' ? window.角色卡身份与外貌(c) : JSON.stringify(c || {}));
    });
    if (!arr.length) return '';
    return '【要写的相关人物】\n\n' + arr.join('\n\n');
  }
  // 参数段：选题 + 灵感素材，有值才列；露骨度附档位解释
  function 共享参数上下文() {
    var ctx = '';
    var title = (编辑状态.title || '').trim();
    ctx += title ? '作品标题：' + title + '\n' : '作品标题：无（请自动拟定标题）\n';
    if (编辑状态.form) ctx += (cfg.formOptionsLabel || '文体') + '：' + 编辑状态.form + (体例解释txt() ? '\n　' + 体例解释txt() : '') + '\n';
    if (模块独有选题 && 编辑状态[模块独有选题.编辑键]) ctx += (模块独有选题.ctx标签 || 模块独有选题.label) + '：' + 编辑状态[模块独有选题.编辑键] + '\n';
    (cfg.额外选题 || []).forEach(function(extra) {
      if (编辑状态[extra.编辑键]) ctx += extra.label + '：' + 编辑状态[extra.编辑键] + '\n';
    });
    if (编辑状态.genre && 编辑状态.genre.length) ctx += '题材：' + 编辑状态.genre.join('、') + (共享题材解释txt() ? '\n　' + 共享题材解释txt() : '') + '\n';
    if (编辑状态.explicit) ctx += '露骨度：' + 编辑状态.explicit + (共享露骨度解释表[编辑状态.explicit] ? '\n　' + 共享露骨度解释表[编辑状态.explicit] : '') + '\n';
    if (编辑状态.imagery && 编辑状态.imagery.length) ctx += '素材：' + 编辑状态.imagery.join('、') + '\n';
    return ctx;
  }

  // ===== 角色导入（创作页角色行：导入角色卡，AI 生成时注入角色身份）=====
  function 共享角色名(c) {
    var bi = c && c.identity && c.identity.basicInfo || {};
    return bi.name || '未命名';
  }
  function 共享角色chipsHTML() {
    var h = '';
    (编辑状态.roles || []).forEach(function(c) {
      h += '<span class="tag-chip" title="点击移除" onclick="' + cfg.windowPrefix + '移除角色(this)">' + escHtml(共享角色名(c)) + ' ✕</span>';
    });
    if ((编辑状态.roles || []).length) {
      h += '<span class="tag-chip" style="color:var(--fg3)" title="清空已导入角色" onclick="' + cfg.windowPrefix + '清空角色()">✕ 清空</span>';
    }
    h += '<span class="tag-chip" style="color:var(--accent);cursor:pointer" title="从角色卡导入" onclick="' + cfg.windowPrefix + '导入角色()">📂 导入</span>';
    return h;
  }
  function 共享刷新角色行() {
    var el = document.getElementById(cfg.prefix + 'RoleChips');
    if (el) el.innerHTML = 共享角色chipsHTML();
  }
  function 共享移除角色(chip) {
    var name = chip.textContent.replace(' ✕', '').trim();
    编辑状态.roles = (编辑状态.roles || []).filter(function(c) { return 共享角色名(c) !== name; });
    编辑字段('roles', 编辑状态.roles);
    共享刷新角色行();
  }
  function 共享清空角色() {
    编辑字段('roles', []);
    共享刷新角色行();
  }
  function 共享导入角色() {
    // 统一走全局角色卡导入弹窗
    stcdOpenCharPicker('', {
      onPick: function(data) {
        if (!data) { toast('角色数据不存在'); return; }
        编辑状态.roles = 编辑状态.roles || [];
        编辑状态.roles.push(JSON.parse(JSON.stringify(data)));
        编辑字段('roles', 编辑状态.roles);
        共享刷新角色行();
        toast('已导入角色：' + 共享角色名(data));
      }
    });
  }
  function 共享导入角色列表(genderFilter) {
    共享导入角色();
  }

  // AI 字段注册（生成 / 改编 / 标题建议，全部经 fillFn 回填并即时写盘）
  if (typeof registerAiField !== 'undefined') {
    // 标题建议（作品信息卡 🤖 按钮）
    registerAiField(cfg.aiFieldId + 'Suggest', cfg.aiLabel + '标题建议', function() {
      var ctx = '';
      if ((编辑状态.title || '').trim()) ctx += '作品标题：' + 编辑状态.title + '\n';
      if (编辑状态.form) ctx += (cfg.formOptionsLabel || '文体') + '：' + 编辑状态.form + (体例解释txt() ? '\n　' + 体例解释txt() : '') + '\n';
      if (模块独有选题 && 编辑状态[模块独有选题.编辑键]) ctx += (模块独有选题.ctx标签 || 模块独有选题.label) + '：' + 编辑状态[模块独有选题.编辑键] + '\n';
      if (编辑状态.genre && 编辑状态.genre.length) ctx += '题材：' + 编辑状态.genre.join('、') + (共享题材解释txt() ? '\n　' + 共享题材解释txt() : '') + '\n';
      if (编辑状态.explicit) ctx += '露骨度：' + 编辑状态.explicit + '\n';
      if (编辑状态.imagery && 编辑状态.imagery.length) ctx += '素材：' + 编辑状态.imagery.join('、') + '\n';
      if (!ctx) ctx = '当前无已选元素，自由发挥';
      var r = renderPrompt(cfg.suggestPromptName, { ctx: ctx }); return { user: r.user, system: r.system };
    }, { fillFn: function(d) {
      if (!d) return;
      if (d.title) 编辑字段('title', d.title);
      var titleEl = document.getElementById(cfg.prefix + 'Title');
      if (titleEl) titleEl.value = 编辑状态.title || '';
      同步chips();
      toast('标题建议已填入');
    }});
    // 主生成（AI 生成卡）
    registerAiField(cfg.aiFieldId, cfg.aiLabel, function() {
      var direction = ((document.getElementById(cfg.prefix + 'Direction')||{}).value || '').trim();
      var ctx = 共享参数上下文();
      if (direction) ctx += '\n方向：' + direction;
      var r = renderPrompt(cfg.promptName, { ctx: ctx, charCtx: 共享角色上下文() }); return { user: r.user, system: r.system };
    }, { fillFn: function(d) {
      if (!d) return;
      var s = 编辑状态;
      if (d.title) s.title = d.title;
      if (d.content) s.content = d.content;
      if (d.tags) s.tags = d.tags;
      if (d.form) s.form = d.form;
      if (d.type) s.form = d.type;      // 兼容：模板仍可能回传 type 字段
      if (模块独有选题 && d[模块独有选题.编辑键]) s[模块独有选题.编辑键] = d[模块独有选题.编辑键];
      // 题材 / 露骨度 / 意象为锁定参数：不回填，仅用于生成上下文
      var titleEl = document.getElementById(cfg.prefix + 'Title');
      if (titleEl) titleEl.value = s.title || '';
      var formEl = document.getElementById(cfg.prefix + 'Form');
      if (formEl) formEl.value = s.form || 默认文体;
      var contentEl = document.getElementById(cfg.prefix + 'Content');
      if (contentEl) contentEl.value = s.content || '';
      同步chips();
      // 标题变化（含新建未建档）：用新标题重新建档，避免 AI 题名与旧草稿脱节
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
            form: s.form || 默认文体, explicit: s.explicit || 默认露骨度,
            genre: s.genre || [], imagery: s.imagery || [],
            appreciation: s.appreciation || '',
            roles: s.roles || []
          };
          if (模块独有选题) data[模块独有选题.编辑键] = s[模块独有选题.编辑键] || '';
          Store[cfg.storeKey].save(s.title, data).then(function(){ _editTitle = s.title; });
        }
        toast('AI 提案已填入，可修改后保存');
      };
      if (_editTitle && newTitle && newTitle !== _editTitle) {
        var oldTitle = _editTitle;
        _editTitle = null;
        Store[cfg.storeKey].delete(oldTitle).catch(function(){}).then(function() { next(); });
      } else {
        next();
      }
    }});
    // 改编生成（创作页改编卡：原文 + 选项 → 回填编辑器）
    registerAiField(cfg.aiFieldId + 'Adapt', cfg.aiLabel + '改编', function() {
      var source = (document.getElementById(cfg.prefix + 'AdaptSource')||{}).value || '';
      var s = 编辑状态;
      if (!source.trim()) { toast('请先输入要改编的原文'); return null; }
      // 改编专用参数段：含文体与专属选题，但不含露骨度（改编露骨度由改编卡「维持原度/污秽淫化」决定，避免两个露骨度指令冲突）
      var ctx = '';
      var title = (s.title || '').trim();
      ctx += title ? '作品标题：' + title + '\n' : '作品标题：无（请自动拟定标题）\n';
      if (s.form) ctx += (cfg.formOptionsLabel || '文体') + '：' + s.form + (体例解释txt() ? '\n　' + 体例解释txt() : '') + '\n';
      if (模块独有选题 && s[模块独有选题.编辑键]) ctx += (模块独有选题.ctx标签 || 模块独有选题.label) + '：' + s[模块独有选题.编辑键] + '\n';
      if (s.genre && s.genre.length) ctx += '题材：' + s.genre.join('、') + (共享题材解释txt() ? '\n　' + 共享题材解释txt() : '') + '\n';
      if (s.imagery && s.imagery.length) ctx += '素材：' + s.imagery.join('、') + '\n';
      var r = renderPrompt(cfg.adaptPromptName, {
        ctx: ctx,
        charCtx: 共享角色上下文(),
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
      if (d.type) s.form = d.type;
      if (模块独有选题 && d[模块独有选题.编辑键]) s[模块独有选题.编辑键] = d[模块独有选题.编辑键];
      // 题材 / 露骨度 / 意象为锁定参数：不回填，仅用于生成上下文
      if (d.tags) s.tags = d.tags;
      if (!(s.title || '').trim()) s.title = '改编' + (s.adaptSource || '').substring(0, 4);
      // 回填编辑器 DOM（不重渲染，保住焦点）
      var titleEl = document.getElementById(cfg.prefix + 'Title');
      if (titleEl) titleEl.value = s.title || '';
      var formEl = document.getElementById(cfg.prefix + 'Form');
      if (formEl) formEl.value = s.form || 默认文体;
      var contentEl = document.getElementById(cfg.prefix + 'Content');
      if (contentEl) contentEl.value = s.content || '';
      同步chips();
      // 持久化：已建档直接写盘；未建档用新标题建档
      var data = {
        title: s.title, content: s.content || '', tags: s.tags || [],
        form: s.form || 默认文体, explicit: s.explicit || 默认露骨度,
        genre: s.genre || [], imagery: s.imagery || [],
        appreciation: s.appreciation || '',
        adaptSource: s.adaptSource || '',
        adaptExplicit: s.adaptExplicit || '', adaptLen: s.adaptLen || '',
        roles: s.roles || []
      };
      if (模块独有选题) data[模块独有选题.编辑键] = s[模块独有选题.编辑键] || '';
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

  window[cfg.windowPrefix + '切换视图'] = 切换视图;
  window[cfg.windowPrefix + '新创作'] = 新创作;
  window[cfg.windowPrefix + '筛选'] = 筛选;
  window[cfg.windowPrefix + '编辑项'] = 编辑项;
  window[cfg.windowPrefix + '删除项'] = 删除项;
  window[cfg.windowPrefix + '阅读'] = 阅读;
  window[cfg.windowPrefix + '阅读生成赏析'] = 阅读生成赏析;
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

  return { 切换视图: 切换视图, 当前视图: function(){ return 当前视图; } };
}
window.锦绣文章模块工厂 = 锦绣文章模块工厂;

// 锦绣文章通用风格预设（4 个文体 AI 生成弹窗共用）
var 锦绣文章风格预设 = [
  { label: '📜 论辩犀利', dir: '论点锋锐、论证严密、气势逼人，层层进逼', category: 'style' },
  { label: '🕊️ 温婉说理', dir: '以情动人、以理服人，态度温厚、文气委婉', category: 'style' },
  { label: '🖌️ 白描素写', dir: '不施雕琢、平实如话，以细节与留白取胜', category: 'style' },
  { label: '🏮 辞藻华丽', dir: '辞藻富丽、骈俪铺陈，用典精当、文采斐然', category: 'style' },
  { label: '🌶️ 辛辣反讽', dir: '笔锋带刺、冷嘲热讽，以反讽揭示情欲世界的荒诞', category: 'style' },
  { label: '🌙 旖旎缠绵', dir: '氛围暧昧、情致缠绵，性描写的张力在于若即若离', category: 'style' },
  { label: '⛩️ 古典雅正', dir: '行文循古典章法，引经据典，语感古雅', category: 'style' },
  { label: '💫 现代随笔', dir: '现代白话随笔风，节奏明快、思考留白', category: 'style' },
];
var 锦绣文章Gen字段 = ['yiLunWenGen', 'jiXuWenGen', 'youJiWenGen', 'ciFuWenGen'];
if (typeof window.AI_QUICK_PRESETS !== 'undefined') {
  锦绣文章Gen字段.forEach(function(id) { window.AI_QUICK_PRESETS[id] = 锦绣文章风格预设; });
}
