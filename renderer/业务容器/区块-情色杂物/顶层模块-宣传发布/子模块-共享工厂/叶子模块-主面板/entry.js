// 情色杂物 · 宣传发布 · 专属共享工厂
// 完全照抄生活消费工厂的行式与范式，但字段由「字段架构」驱动、并针对宣传域定制：
//   - 信息卡 = 字段架构（字段定义数组：text/number/textarea/textarealist）
//   - chips 维度 = 题材(宣传题材) / 露骨度 / 渠道(宣传渠道) / 角色
//   - 灵感素材卡 = 意象库（氛围/场景/人群/主题/时间/色彩 等宣传意象）
//   - AI 三段 = Suggest(标题建议) / Gen(主生成) / Adapt(改编)，提案回填编辑器
//   - 自动建档：标题 onchange 即建档，字段改动防抖写盘

// ===== 宣传意象库（宣传域灵感数据源，各模块可覆盖）=====
var 宣传意象库 = {
  '氛围': ['暧昧', '撩人', '神秘', '禁忌', '张扬', '低调', '热烈', '慵懒', '靡靡', '荷尔蒙', '夜色', '躁动'],
  '场景': ['私人会所', '顶层公寓', '地下酒吧', '酒店套房', '私人泳池', '天台', '私家花园', '暗房', '密室', '车厢', '更衣室', '剧场后台'],
  '人群': ['单身', '情侣', '熟客', '新面孔', '圈内人', '高玩', '新人', '会员', '贵宾', '匿名', '搭子', '同好'],
  '主题': ['支配', '臣服', '诱惑', '声控', '触觉', '视觉', '嗅觉', '节奏', '反差', '角色扮演', '暴露', '失禁'],
  '时间': ['周末夜', '午夜', '黄金档', '周五场', '节假日', '会员日', '限定场', '首夜', '收官夜', '傍晚'],
  '色彩': ['暗红', '酒红', '墨黑', '香槟金', '银灰', '绯红', '藏蓝', '紫罗兰', '蜜桃粉', '奶白'],
};

// 露骨度档位（宣传域共用，统一为 含蓄隐晦 / 粗俗露骨 两档）
function 宣传共享露骨度解释表() {
  return {
    '含蓄隐晦': '以暗示、隐喻、借代带出情色意味，不明写性事',
    '粗俗露骨': '用最直白惹火的荤词与身体描写，毫不遮掩'
  };
}

// 渠道档位解释（AI 参数段用）
function 宣传共享渠道解释表() {
  return {
    '线下实体': '实体张贴、传单派发、现场物料', '线上群发': '社群、私聊、群发消息',
    '朋友圈': '微信朋友圈文案', '公众号': '公众号推文、菜单', '短视频': '短视频/直播口播',
    '私域': '一对一私聊、会员通知', '纸质': '纸质邀请函、请柬', '网页': '落地页、专题页',
    '邮件': '邮件/短信群发'
  };
}

function 宣传发布工厂(cfg) {
  // cfg: { storeKey, containerId, viewContentId, prefix, windowPrefix,
  //        navLabelList, navLabelEdit, 图标, 单品名, 标题标签, 标题占位, 创建按钮文案,
  //        题材选项, 露骨度选项, 渠道选项, 意象库, 字段定义,
  //        筛选维度, 预览字段, promptName, aiFieldId, aiLabel, 默认露骨度, 露骨度标签 }
  var 共享题材选项 = cfg.题材选项 || ['主题派对', '双人私会', '群交', '主题夜', '招待', '推广'];
  var 共享露骨度选项 = cfg.露骨度选项 || ['含蓄隐晦', '粗俗露骨'];
  var 共享渠道选项 = cfg.渠道选项 || ['线下实体', '线上群发', '朋友圈', '公众号', '短视频', '私域'];
  var 共享受众性别选项 = cfg.性别选项 || ['通用', '女性', '伪娘', '扶她'];
  var 意象库 = cfg.意象库 || 宣传意象库;
  var 字段定义 = cfg.字段定义 || [];
  var 默认露骨度 = cfg.默认露骨度 || '粗俗露骨';
  var 图标 = cfg.图标 || '📣';
  var 单品名 = cfg.单品名 || '作品';
  var 标题标签 = cfg.标题标签 || '标题';
  var 标题占位 = cfg.标题占位 || '给' + 单品名 + '起个名字…';
  var 创建按钮文案 = cfg.创建按钮文案 || ('＋ 创建' + 单品名);
  var 露骨度标签 = cfg.露骨度标签 || '露骨度';
  var 预览字段 = cfg.预览字段 || (function() {
    // 默认预览第一个 textarea 字段，否则第一个 text 字段
    for (var i = 0; i < 字段定义.length; i++) { var f = 字段定义[i]; if (f.type === 'textarea' || f.type === 'textarealist') return f.key; }
    return 字段定义.length ? 字段定义[0].key : '';
  })();
  // 字段展示次序（信息卡渲染顺序）
  var 字段次序 = (字段定义 || []).map(function(f) { return f.key; });
  // 阅读弹窗字段角色：主正文（大段落）/ 展示行（带标签行）/ 元信息（紧凑网格）/ 列表（pill）
  var reader主正文 = cfg.主正文 || (function() {
    for (var i = 0; i < 字段定义.length; i++) { var f = 字段定义[i]; if (f.type === 'textarea') return f.key; }
    return 字段定义.length ? 字段定义[0].key : '';
  })();
  var reader展示行 = cfg.展示行 || [];
  var reader列表 = cfg.列表 || (字段定义.filter(function(f) { return f.type === 'textarealist' && f.key !== 'tags'; }).map(function(f) { return f.key; }));
  var reader元信息 = cfg.元信息 || (字段定义.filter(function(f) { return f.type === 'text' || f.type === 'number'; }).map(function(f) { return f.key; }).filter(function(k) { return k !== reader主正文 && k !== 'tags' && reader展示行.indexOf(k) < 0; }));

  var 导航 = [
    { id: 'list', label: cfg.navLabelList },
    { id: 'editor', label: cfg.navLabelEdit },
  ];
  var 当前视图 = 'list';
  var _editTitle = null;
  var 编辑状态 = {};
  var 创作防抖保存 = null;
  var 筛选状态 = {};
  var 筛选维度 = cfg.筛选维度 || ['genre', 'explicit', 'channel', 'gender'];

  // ===== 字段归一：按类型把 DOM 值转成存储值 =====
  function 字段类型(key) { var f = 字段定义.filter(function(x) { return x.key === key; })[0]; return f ? (f.type || 'text') : 'text'; }
  function 归一字段(key, val) {
    var t = 字段类型(key);
    if (t === 'number') return parseFloat(val) || 0;
    if (t === 'textarealist') return String(val == null ? '' : val).trim().split('\n').map(function(s) { return s.trim(); }).filter(Boolean);
    return String(val == null ? '' : val);
  }
  // 从存储值还原成输入框显示值
  function 反显字段(key, val) {
    var t = 字段类型(key);
    if (t === 'textarealist') return (Array.isArray(val) ? val : (val ? [val] : [])).join('\n');
    if (t === 'number') return val == null ? '' : String(val);
    return val == null ? '' : String(val);
  }
  // 是否有已生成内容（决定「生成内容」卡是否展开）
  function 是否有内容() {
    if (_editTitle) return true;
    for (var i = 0; i < 字段定义.length; i++) {
      var k = 字段定义[i].key, v = 编辑状态[k];
      if (v != null && v !== '' && v !== 0 && (!Array.isArray(v) || v.length)) return true;
    }
    return false;
  }

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
    el.querySelectorAll('.tl-subitem').forEach(function(i) {
      i.addEventListener('click', function() {
        var v = this.getAttribute('data-view');
        if (v === 'editor') { 新创作(); return; }
        切换视图(v);
      });
    });
    switch (view) {
      case 'list': 渲染列表(vEl); break;
      case 'editor': 渲染编辑器(vEl); break;
    }
  }

  function 新创作() { _editTitle = null; 切换视图('editor'); }

  // ===== 列表 =====
  function 筛选行HTML() {
    var h = '';
    if (筛选维度.indexOf('genre') >= 0 && 共享题材选项) {
      h += 筛选行('题材', ['全部'].concat(共享题材选项), 筛选状态.genre, cfg.windowPrefix + '筛选', 'genre');
    }
    if (筛选维度.indexOf('explicit') >= 0 && 共享露骨度选项) {
      h += 筛选行('露骨度', ['全部'].concat(共享露骨度选项), 筛选状态.explicit, cfg.windowPrefix + '筛选', 'explicit');
    }
    if (筛选维度.indexOf('channel') >= 0 && 共享渠道选项) {
      h += 筛选行('渠道', ['全部'].concat(共享渠道选项), 筛选状态.channel, cfg.windowPrefix + '筛选', 'channel');
    }
    if (筛选维度.indexOf('gender') >= 0 && 共享受众性别选项) {
      h += 筛选行('性别', ['全部'].concat(共享受众性别选项), 筛选状态.gender, cfg.windowPrefix + '筛选', 'gender');
    }
    return h;
  }
  function 渲染列表(el) {
    Store[cfg.storeKey].list().then(function(items) {
      var h = '<div class="mb-10"><button class="btn-new" onclick="' + cfg.windowPrefix + '新创作()">＋ 新建</button></div>';
      h += 筛选行HTML();
      var filtered = items || [];
      if (筛选状态.genre && 筛选状态.genre !== '全部') {
        filtered = filtered.filter(function(i) { var g = Array.isArray(i.genre) ? i.genre : (i.genre ? [i.genre] : []); return g.indexOf(筛选状态.genre) >= 0; });
      }
      if (筛选状态.explicit && 筛选状态.explicit !== '全部') {
        filtered = filtered.filter(function(i) { return (i.explicit || 默认露骨度) === 筛选状态.explicit; });
      }
      if (筛选状态.channel && 筛选状态.channel !== '全部') {
        filtered = filtered.filter(function(i) { var c = Array.isArray(i.channel) ? i.channel : (i.channel ? [i.channel] : []); return c.indexOf(筛选状态.channel) >= 0; });
      }
      if (筛选状态.gender && 筛选状态.gender !== '全部') {
        filtered = filtered.filter(function(i) { return (i.gender || '通用') === 筛选状态.gender; });
      }
      if (!filtered.length) { h += '<div class="placeholder-text">暂无' + 单品名 + '</div>'; }
      else {
        filtered.forEach(function(item) {
          h += '<div class="n-card cur-ptr mb-6 p-10" onclick="' + cfg.windowPrefix + '阅读(\'' + escHtml(item.title) + '\')">';
          h += '<div class="fw-600 fs-14">' + 图标 + ' ' + escHtml(item.title || '未命名') + '</div>';
          h += '<div class="mt-4 flex gap-4 flex-wrap">';
          if (item.explicit) h += '<span class="badge-tag">' + escHtml(item.explicit) + '</span>';
          var genres = Array.isArray(item.genre) ? item.genre : (item.genre ? [item.genre] : []);
          if (genres.length) h += genres.map(function(g) { return '<span class="badge-tag">' + escHtml(g) + '</span>'; }).join('');
          var chans = Array.isArray(item.channel) ? item.channel : (item.channel ? [item.channel] : []);
          if (chans.length) h += chans.map(function(c) { return '<span class="badge-tag">' + escHtml(c) + '</span>'; }).join('');
          h += '</div>';
          var prev = item[预览字段];
          if (prev) h += '<div class="text-muted text-sm mt-4" style="white-space:pre-wrap">' + escHtml(Array.isArray(prev) ? prev.join('、') : prev).slice(0, 120) + '</div>';
          h += '<div class="mt-6 flex gap-4">';
          h += '<span class="btn-secondary btn-sm" onclick="event.stopPropagation();' + cfg.windowPrefix + '编辑项(\'' + escHtml(item.title) + '\')">✏️ 编辑</span>';
          h += '<span class="btn-secondary btn-sm c-error" onclick="event.stopPropagation();' + cfg.windowPrefix + '删除项(\'' + escHtml(item.title) + '\')">🗑 删除</span>';
          h += '</div></div>';
        });
      }
      el.innerHTML = h;
    });
  }

  function 筛选(field, val) { 筛选状态[field] = val; 切换视图('list'); }

  function 编辑项(title) { _editTitle = title; 切换视图('editor'); }
  function 删除项(title) { confirmDialog('确定删除「' + title + '」？', function() { Store[cfg.storeKey].delete(title).then(function() { toast('已删除'); 切换视图('list'); }); }); }

  // ===== 阅读弹窗（reader 排版）=====
  function 阅读(title) {
    Store[cfg.storeKey].get(title).then(function(item) {
      item = item || {};
      document.querySelectorAll('.ovl').forEach(function(o) { o.remove(); });
      var h = '';
      // ① 头部：标题 + 元信息徽标（性别/露骨度/题材/渠道）
      h += '<div class="reader-head">';
      h += '<span class="reader-title">' + 图标 + ' ' + escHtml(item.title || title) + '</span>';
      if (item.gender && item.gender !== '通用') h += '<span class="reader-tag">' + escHtml(item.gender) + '</span>';
      if (item.explicit) h += '<span class="reader-tag">' + escHtml(item.explicit) + '</span>';
      var genres = Array.isArray(item.genre) ? item.genre : (item.genre ? [item.genre] : []);
      if (genres.length) h += '<span class="reader-tag">' + escHtml(genres.join('、')) + '</span>';
      var chans = Array.isArray(item.channel) ? item.channel : (item.channel ? [item.channel] : []);
      if (chans.length) h += '<span class="reader-tag">' + escHtml(chans.join('、')) + '</span>';
      h += '</div>';
      h += '<div class="reader-body">';
      // ② 主正文：核心内容大段落
      var mainVal = item[reader主正文];
      if (mainVal != null && mainVal !== '' && (!Array.isArray(mainVal) || mainVal.length)) {
        h += '<div class="reader-main">' + escHtml(Array.isArray(mainVal) ? mainVal.join('\n') : mainVal) + '</div>';
      }
      // ③ 展示行：带标签的文本行（如标语/主视觉/副题/提醒等）
      var rows = (reader展示行 || []).filter(function(k) { var v = item[k]; return v != null && v !== '' && (!Array.isArray(v) || v.length); });
      if (rows.length) {
        h += '<div class="reader-rows">';
        rows.forEach(function(k) {
          var f = 字段定义.filter(function(x) { return x.key === k; })[0];
          var v = item[k];
          h += '<div class="reader-row"><span class="reader-row-label">' + escHtml(f && f.label || k) + '</span><span class="reader-row-val">' + escHtml(Array.isArray(v) ? v.join('、') : v) + '</span></div>';
        });
        h += '</div>';
      }
      // ④ 元信息：紧凑两列网格（日期/时间/地点/票价/着装/联系方式等）
      var metas = (reader元信息 || []).filter(function(k) { var v = item[k]; return v != null && v !== '' && (!Array.isArray(v) || v.length); });
      if (metas.length) {
        h += '<div class="reader-meta-grid">';
        metas.forEach(function(k) {
          var f = 字段定义.filter(function(x) { return x.key === k; })[0];
          var v = item[k];
          h += '<div class="reader-meta"><span class="reader-meta-label">' + escHtml(f && f.label || k) + '</span><span class="reader-meta-val">' + escHtml(Array.isArray(v) ? v.join('、') : v) + '</span></div>';
        });
        h += '</div>';
      }
      // ⑤ 列表字段（亮点/话题）：pill
      (reader列表 || []).forEach(function(k) {
        var v = item[k];
        if (Array.isArray(v) && v.length) {
          h += '<div class="reader-pills">' + v.map(function(x) { return '<span class="reader-pill">✨ ' + escHtml(x) + '</span>'; }).join('') + '</div>';
        }
      });
      // ⑥ 标签：pill
      if (Array.isArray(item.tags) && item.tags.length) {
        h += '<div class="reader-pills">' + item.tags.map(function(x) { return '<span class="reader-pill">#' + escHtml(x) + '</span>'; }).join('') + '</div>';
      }
      h += '</div>';
      h += '<div class="reader-foot">';
      h += '<button class="reader-btn" onclick="' + cfg.windowPrefix + '编辑项(\'' + escHtml(title) + '\')">✏️ 编辑</button>';
      h += '<button class="reader-btn" onclick="' + cfg.windowPrefix + '复制全文(\'' + escHtml(title) + '\')">📋 复制全文</button>';
      h += '<button class="reader-btn" onclick="' + cfg.windowPrefix + '去改编(\'' + escHtml(title) + '\')">📥 去改编</button>';
      h += '<button class="reader-btn primary" onclick="this.closest(\'.ovl\').remove()">关闭</button>';
      h += '</div>';
      showModal('', h, { noWrap: true, cardClass: 'reader-night', ovlClass: 'reader-night-ovl' });
    });
  }

  function 复制全文(title) {
    Store[cfg.storeKey].get(title).then(function(item) {
      item = item || {};
      var lines = [item.title || title];
      if (item.explicit) lines.push('露骨度：' + item.explicit);
      字段次序.forEach(function(key) {
        var f = 字段定义.filter(function(x) { return x.key === key; })[0];
        var val = item[key];
        if (val == null || val === '' || (Array.isArray(val) && !val.length)) return;
        lines.push((f && f.label ? f.label + '：' : '') + (Array.isArray(val) ? val.join('、') : String(val)));
      });
      复制到剪贴板(lines.join('\n')).then(function(ok) { toast(ok ? '已复制全文' : '复制失败'); });
    });
  }

  // 去改编：把该作品带入编辑器改编卡，作为新作改编（保留原文，标题置空另起）
  function 去改编(title) {
    Store[cfg.storeKey].get(title).then(function(item) {
      item = item || {};
      _editTitle = null;
      // 取主内容字段作为改编原文
      var main = item[预览字段] || item.content || item.script || item.remind || item.cta || item.slogan || '';
      编辑状态.adaptSource = typeof main === 'string' ? main : (Array.isArray(main) ? main.join('、') : '');
      编辑状态.title = '';
      切换视图('editor');
    });
  }

  // ===== 自动建档 / 写盘 =====
  function 自动建档() {
    var t = (编辑状态.title || '').trim();
    if (_editTitle || !t) return Promise.resolve(false);
    return Store[cfg.storeKey].list().then(function(items) {
      for (var i = 0; i < items.length; i++) { if (items[i].title === t) { toast('同名' + 单品名 + '已存在，草稿未建立'); return false; } }
      _editTitle = t;
      return Store[cfg.storeKey].save(t, 生成数据()).then(function() { toast('已建立草稿「' + t + '」'); return true; });
    });
  }
  function 生成数据() {
    var d = { title: 编辑状态.title || '', genre: 编辑状态.genre || [], explicit: 编辑状态.explicit || 默认露骨度, channel: 编辑状态.channel || [], gender: 编辑状态.gender || '通用', imagery: 编辑状态.imagery || [], roles: 编辑状态.roles || [] };
    字段定义.forEach(function(f) { d[f.key] = 编辑状态[f.key] != null ? 编辑状态[f.key] : (f.type === 'textarealist' ? [] : (f.type === 'number' ? 0 : '')); });
    if (编辑状态.tags) d.tags = 编辑状态.tags;
    if (编辑状态.adaptSource) d.adaptSource = 编辑状态.adaptSource;
    if (编辑状态.adaptExplicit) d.adaptExplicit = 编辑状态.adaptExplicit;
    if (编辑状态.adaptLen) d.adaptLen = 编辑状态.adaptLen;
    return d;
  }
  function 写盘() {
    var t = 编辑状态.title || '';
    if (!t || !_editTitle) return;
    Store[cfg.storeKey].get(_editTitle).then(function(m) {
      m = m || {};
      Object.assign(m, 生成数据());
      Store[cfg.storeKey].save(_editTitle, m).then(function() {});
    });
  }
  function 编辑字段(key, val) {
    编辑状态[key] = val;
    if (_editTitle) {
      if (!创作防抖保存) 创作防抖保存 = 防抖(function() { 写盘(); }, 400);
      创作防抖保存();
    } else if ((编辑状态.title || '').trim()) {
      自动建档().then(function(ok) {
        if (!ok) return;
        if (!创作防抖保存) 创作防抖保存 = 防抖(function() { 写盘(); }, 400);
        创作防抖保存();
      });
    }
  }
  // textarealist 字段：onchange 时拆分收集
  function 编辑新行字段(key, raw) { 编辑字段(key, 归一字段(key, raw)); }

  function 渲染编辑器(el) {
    if (_editTitle) {
      Store[cfg.storeKey].get(_editTitle).then(function(data) { 渲染表单(el, data || {}); });
    } else {
      var defaults = { title: '', genre: [], explicit: 默认露骨度, channel: [], gender: '通用', imagery: [], roles: [], adaptSource: 编辑状态.adaptSource || '', adaptExplicit: 编辑状态.adaptExplicit || '', adaptLen: 编辑状态.adaptLen || '' };
      字段定义.forEach(function(f) { defaults[f.key] = (f.type === 'textarealist' ? [] : (f.type === 'number' ? 0 : '')); });
      渲染表单(el, defaults);
    }
  }

  // ===== 卡片式创作页 =====
  function 卡片头(icon, label, extra) {
    var h = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;font-family:var(--font-sans)">';
    h += '<span style="width:3px;height:12px;background:var(--accent2);flex-shrink:0"></span>';
    h += '<span style="font-size:11px;letter-spacing:2px;color:var(--fg2)">' + icon + ' ' + label + '</span>';
    if (extra) h += '<span style="margin-left:auto;font-size:10px;color:var(--fg3);letter-spacing:1px">' + extra + '</span>';
    h += '</div>';
    return h;
  }
  function 参数行(label, chipsHtml) {
    var w = 52;
    var hang = w + 4;
    return '<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:wrap;padding-left:' + hang + 'px">'
      + '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:' + w + 'px;flex-shrink:0;margin-left:-' + hang + 'px">' + label + '</span>'
      + chipsHtml + '</div>';
  }
  // 字段输入框（信息卡）
  function 字段输入HTML(f) {
    var id = cfg.prefix + 'F_' + f.key;
    var val = 反显字段(f.key, 编辑状态[f.key]);
    var onchange = f.type === 'textarealist'
      ? 'onchange="' + cfg.windowPrefix + '编辑新行字段(\'' + f.key + '\',this.value)"'
      : 'onchange="' + cfg.windowPrefix + '编辑字段(\'' + f.key + '\',this.value)"';
    if (f.type === 'number') {
      return '<div class="form-group"><label>' + escHtml(f.label || f.key) + '</label><input class="llm-input" id="' + id + '" type="number" value="' + escHtml(val) + '" placeholder="' + escHtml(f.placeholder || '') + '" ' + onchange + '></div>';
    }
    if (f.type === 'textarea') {
      return '<div class="form-group"><label>' + escHtml(f.label || f.key) + '</label><textarea class="llm-input" id="' + id + '" style="min-height:' + (f.rows ? (f.rows * 24) : 100) + 'px;resize:vertical" placeholder="' + escHtml(f.placeholder || '') + '" ' + onchange + '>' + escHtml(val) + '</textarea></div>';
    }
    if (f.type === 'textarealist') {
      return '<div class="form-group"><label>' + escHtml(f.label || f.key) + (f.hint ? '（' + escHtml(f.hint) + '）' : '') + '</label><textarea class="llm-input" id="' + id + '" style="min-height:' + (f.rows ? (f.rows * 24) : 100) + 'px;resize:vertical" placeholder="' + escHtml(f.placeholder || '') + '" ' + onchange + '>' + escHtml(val) + '</textarea></div>';
    }
    return '<div class="form-group"><label>' + escHtml(f.label || f.key) + '</label><input class="llm-input" id="' + id + '" value="' + escHtml(val) + '" placeholder="' + escHtml(f.placeholder || '') + '" ' + onchange + '></div>';
  }
  // 灵感素材卡
  function 灵感侧栏HTML() {
    var h = '<div class="inspire-panel">';
    Object.keys(意象库).forEach(function(cat) {
      var imgs = 意象库[cat].map(function(im) {
        return '<span class="tag-chip inspire-imagery' + ((编辑状态.imagery || []).indexOf(im) >= 0 ? ' tag-active' : '') + '" data-imagery="' + im + '" onclick="' + cfg.windowPrefix + '切换意象(\'' + im + '\');' + cfg.windowPrefix + '同步chips()">' + im + '</span>';
      }).join('');
      h += 参数行(cat, imgs);
    });
    var 灵感行 = '';
    灵感行 += '<button class="btn-sm" style="flex-shrink:0" onclick="' + cfg.windowPrefix + '随机灵感()">🎲 随机灵感</button>';
    if (灵感行) h += 参数行('灵感', 灵感行);
    h += '</div>';
    return h;
  }
  function 渲染表单(el, data) {
    编辑状态 = { title: data.title || '', genre: data.genre || [], explicit: data.explicit || 默认露骨度, channel: data.channel || [], gender: data.gender || '通用', imagery: data.imagery || [], roles: data.roles || [] };
    字段定义.forEach(function(f) { 编辑状态[f.key] = data[f.key] != null ? data[f.key] : (f.type === 'textarealist' ? [] : (f.type === 'number' ? 0 : '')); });
    if (data.tags) 编辑状态.tags = data.tags;
    if (data.adaptSource) 编辑状态.adaptSource = data.adaptSource;
    if (data.adaptExplicit) 编辑状态.adaptExplicit = data.adaptExplicit;
    if (data.adaptLen) 编辑状态.adaptLen = data.adaptLen;
    var s = 编辑状态;
    var h = '<div class="mw-600">';

    // ① 作品信息卡：标题（AI 生成自动填好，可微调）
    h += '<div class="n-card p-10 mb-6">';
    h += 卡片头('📋', 单品名 + '信息', 'AI 生成后自动填好');
    h += '<div class="ai-field-row">';
    h += '<input class="llm-input" id="' + cfg.prefix + 'Title" placeholder="' + escHtml(标题占位) + '" value="' + escHtml(s.title || '') + '" style="flex:1" onchange="' + cfg.windowPrefix + '编辑字段(\'title\',this.value)">';
    h += '<button class="ai-suggest-btn" onclick="openAiGenPanel(\'' + cfg.aiFieldId + 'Suggest\')" title="AI ' + 标题标签 + '建议">🤖</button>';
    h += '</div>';
    h += '</div>';

    // ② 选题卡：题材 / 露骨度 / 性别 / 渠道 / 角色
    h += '<div class="n-card p-10 mb-6">';
    h += 卡片头('🎯', '选题', 'AI 可一键建议');
    if (共享题材选项 && 共享题材选项.length) {
      h += 参数行('题材', 共享题材选项.map(function(g) {
        return '<span class="tag-chip' + (s.genre.indexOf(g) >= 0 ? ' tag-active' : '') + '" data-genre="' + g + '" onclick="' + cfg.windowPrefix + '切换题材(\'' + g + '\');' + cfg.windowPrefix + '同步chips()">' + g + '</span>';
      }).join(''));
    }
    h += 参数行(露骨度标签, 共享露骨度选项.map(function(e) {
      return '<span class="tag-chip' + (s.explicit === e ? ' tag-active' : '') + '" data-explicit="' + e + '" onclick="' + cfg.windowPrefix + '编辑字段(\'explicit\',\'' + e + '\');' + cfg.windowPrefix + '同步chips()">' + e + '</span>';
    }).join(''));
    h += 参数行('性别', 共享受众性别选项.map(function(g) {
      return '<span class="tag-chip' + ((s.gender || '通用') === g ? ' tag-active' : '') + '" data-gender="' + g + '" onclick="' + cfg.windowPrefix + '编辑字段(\'gender\',\'' + g + '\');' + cfg.windowPrefix + '同步chips()">' + g + '</span>';
    }).join(''));
    if (共享渠道选项 && 共享渠道选项.length) {
      h += 参数行('渠道', 共享渠道选项.map(function(c) {
        return '<span class="tag-chip' + (s.channel.indexOf(c) >= 0 ? ' tag-active' : '') + '" data-channel="' + c + '" onclick="' + cfg.windowPrefix + '切换渠道(\'' + c + '\');' + cfg.windowPrefix + '同步chips()">' + c + '</span>';
      }).join(''));
    }
    h += 参数行('角色', '<span id="' + cfg.prefix + 'RoleChips">' + 角色chipsHTML() + '</span>');
    h += '</div>';

    // ③ 灵感素材卡（始终展开）
    h += '<details class="n-card p-10 mb-6" open><summary style="display:flex;align-items:center;gap:8px;margin-bottom:10px;cursor:pointer;list-style:none;font-family:var(--font-sans)">';
    h += '<span style="width:3px;height:12px;background:var(--accent2);flex-shrink:0"></span>';
    h += '<span style="font-size:11px;letter-spacing:2px;color:var(--fg2)">💡 灵感素材</span>';
    h += '<span style="margin-left:auto;font-size:10px;color:var(--fg3);letter-spacing:1px">点击折叠</span>';
    h += '</summary>';
    h += 灵感侧栏HTML();
    h += '</details>';

    // ④ AI 智创卡：方向（置顶）+ AI 生成按钮（放底部）
    h += '<div class="n-card p-10 mb-6">';
    h += 卡片头('🚀', 'AI 智创', '给个方向，AI 自动生成完整内容');
    h += '<textarea class="llm-input llm-input-lg" id="' + cfg.prefix + 'Direction" placeholder="一句话说清想要什么（可选）：如一场小众私密主题夜、偏女性向、周末午夜场、要暗示不要直白…" style="width:100%;height:64px;resize:vertical"></textarea>';
    h += '<button class="btn btn-primary" style="width:100%;padding:10px 18px;font-size:13px;margin-top:10px" onclick="openAiGenPanel(\'' + cfg.aiFieldId + '\')">🚀 AI 生成</button>';
    h += '<div class="text-muted text-sm" style="margin-top:8px;line-height:1.7">💡 写一句方向、挑一下选题，点「AI 生成」即可。生成的完整内容会在弹出窗口中展示，无需你逐项手填。</div>';
    h += '</div>';

    // ⑤ 改编卡（粘贴原文按选项改编）
    h += '<div class="n-card p-10 mb-6">';
    h += 卡片头('📥', '改编', '粘贴或导入原文，按选项改编成新作');
    h += '<textarea class="llm-input llm-input-lg" id="' + cfg.prefix + 'AdaptSource" placeholder="要改编的原文（阅读弹窗「去改编」自动带入 / 粘贴）" style="width:100%;height:96px;resize:vertical" onchange="' + cfg.windowPrefix + '编辑字段(\'adaptSource\',this.value)">' + escHtml(s.adaptSource || '') + '</textarea>';
    h += 参数行('露骨度', ['维持原度', '污秽淫化'].map(function(o) {
      return '<span class="tag-chip' + ((s.adaptExplicit || '污秽淫化') === o ? ' tag-active' : '') + '" data-adapt-explicit="' + o + '" onclick="' + cfg.windowPrefix + '编辑字段(\'adaptExplicit\',\'' + o + '\');' + cfg.windowPrefix + '同步chips()">' + o + '</span>';
    }).join(''));
    h += 参数行('篇幅', ['浓缩', '维持', '扩写'].map(function(o) {
      return '<span class="tag-chip' + ((s.adaptLen || '维持') === o ? ' tag-active' : '') + '" data-adapt-len="' + o + '" onclick="' + cfg.windowPrefix + '编辑字段(\'adaptLen\',\'' + o + '\');' + cfg.windowPrefix + '同步chips()">' + o + '</span>';
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
        c.classList.toggle('tag-active', (编辑状态.imagery || []).indexOf(c.getAttribute('data-imagery')) >= 0);
      }
      else if (c.hasAttribute('data-genre')) c.classList.toggle('tag-active', (编辑状态.genre || []).indexOf(c.getAttribute('data-genre')) >= 0);
      else if (c.hasAttribute('data-explicit')) c.classList.toggle('tag-active', (编辑状态.explicit || 默认露骨度) === c.getAttribute('data-explicit'));
      else if (c.hasAttribute('data-gender')) c.classList.toggle('tag-active', (编辑状态.gender || '通用') === c.getAttribute('data-gender'));
      else if (c.hasAttribute('data-channel')) c.classList.toggle('tag-active', (编辑状态.channel || []).indexOf(c.getAttribute('data-channel')) >= 0);
      else if (c.hasAttribute('data-adapt-explicit')) c.classList.toggle('tag-active', (编辑状态.adaptExplicit || '污秽淫化') === c.getAttribute('data-adapt-explicit'));
      else if (c.hasAttribute('data-adapt-len')) c.classList.toggle('tag-active', (编辑状态.adaptLen || '维持') === c.getAttribute('data-adapt-len'));
    });
  }
  function 切换题材(g) { var arr = 编辑状态.genre || []; arr = arr.indexOf(g) >= 0 ? arr.filter(function(x) { return x !== g; }) : arr.concat([g]); 编辑字段('genre', arr); }
  function 切换渠道(c) { var arr = 编辑状态.channel || []; arr = arr.indexOf(c) >= 0 ? arr.filter(function(x) { return x !== c; }) : arr.concat([c]); 编辑字段('channel', arr); }
  function 切换意象(im) { var arr = 编辑状态.imagery || []; arr = arr.indexOf(im) >= 0 ? arr.filter(function(x) { return x !== im; }) : arr.concat([im]); 编辑字段('imagery', arr); }
  function 随机灵感() {
    if (!意象库) { toast('本模块暂无灵感数据'); return; }
    var cats = Object.keys(意象库), imgs = [];
    cats.forEach(function(c) { var arr = 意象库[c]; if (imgs.length < 6) imgs.push(arr[Math.floor(Math.random() * arr.length)]); });
    var g = (共享题材选项 && 共享题材选项.length) ? 共享题材选项[Math.floor(Math.random() * 共享题材选项.length)] : '';
    编辑状态.imagery = imgs.slice(0, 3 + Math.floor(Math.random() * 3));
    if (g) 编辑状态.genre = [g];
    编辑字段('imagery', 编辑状态.imagery);
    编辑字段('genre', 编辑状态.genre);
    同步chips();
    toast('灵感已填入：' + 编辑状态.imagery.slice(0, 3).join('、') + (g ? ' · ' + g : ''));
  }

  // ===== 角色导入（与生活消费工厂完全一致）=====
  function 角色名(c) { var bi = c && c.identity && c.identity.basicInfo || {}; return bi.name || '未命名'; }
  function 角色chipsHTML() {
    var h = '';
    (编辑状态.roles || []).forEach(function(c) { h += '<span class="tag-chip" title="点击移除" onclick="' + cfg.windowPrefix + '移除角色(this)">' + escHtml(角色名(c)) + ' ✕</span>'; });
    if ((编辑状态.roles || []).length) h += '<span class="tag-chip" style="color:var(--fg3)" title="清空已导入角色" onclick="' + cfg.windowPrefix + '清空角色()">✕ 清空</span>';
    h += '<span class="tag-chip" style="color:var(--accent);cursor:pointer" title="从角色卡导入" onclick="' + cfg.windowPrefix + '导入角色()">📂 导入</span>';
    return h;
  }
  function 刷新角色行() { var el = document.getElementById(cfg.prefix + 'RoleChips'); if (el) el.innerHTML = 角色chipsHTML(); }
  function 移除角色(chip) { var name = chip.textContent.replace(' ✕', '').trim(); 编辑状态.roles = (编辑状态.roles || []).filter(function(c) { return 角色名(c) !== name; }); 编辑字段('roles', 编辑状态.roles); 刷新角色行(); }
  function 清空角色() { 编辑字段('roles', []); 刷新角色行(); }
  function 导入角色() { stcdOpenCharPicker('', { onPick: function(data) { if (!data) { toast('角色数据不存在'); return; } 编辑状态.roles = 编辑状态.roles || []; 编辑状态.roles.push(JSON.parse(JSON.stringify(data))); 编辑字段('roles', 编辑状态.roles); 刷新角色行(); toast('已导入角色：' + 角色名(data)); } }); }

  // ===== AI 上下文组装 =====
  function 角色上下文() {
    var arr = (编辑状态.roles || []).map(function(c) {
      return '【' + 角色名(c) + '】\n' + (typeof window.角色卡身份与外貌 === 'function' ? window.角色卡身份与外貌(c) : JSON.stringify(c || {}));
    });
    if (!arr.length) return '';
    return '【要写的相关人物】\n\n' + arr.join('\n\n');
  }
  function 参数上下文() {
    var ctx = '';
    if (编辑状态.genre && 编辑状态.genre.length) ctx += '题材：' + 编辑状态.genre.join('、') + '\n';
    if (编辑状态.gender && 编辑状态.gender !== '通用') ctx += '受众：' + 编辑状态.gender + '向\n';
    if (编辑状态.explicit) { var ex = 宣传共享露骨度解释表()[编辑状态.explicit]; ctx += '露骨度：' + 编辑状态.explicit + (ex ? '\n　' + ex : '') + '\n'; }
    if (编辑状态.channel && 编辑状态.channel.length) {
      var chText = 编辑状态.channel.map(function(c) { var d = 宣传共享渠道解释表()[c]; return d ? c + '(' + d + ')' : c; }).join('、');
      ctx += '渠道：' + chText + '\n';
    }
    if (编辑状态.imagery && 编辑状态.imagery.length) ctx += '素材：' + 编辑状态.imagery.join('、') + '\n';
    字段定义.forEach(function(f) { if (编辑状态[f.key] && 编辑状态[f.key].length && f.type === 'textarealist') { ctx += (f.label || f.key) + '：' + 编辑状态[f.key].join('、') + '\n'; } });
    return ctx;
  }

  // ===== AI 字段注册（Suggest / Gen / Adapt）=====
  if (typeof registerAiField !== 'undefined') {
    registerAiField(cfg.aiFieldId + 'Suggest', cfg.aiLabel + '(' + 标题标签 + '建议)', function() {
      var ctx = '';
      if (编辑状态.genre && 编辑状态.genre.length) ctx += '题材：' + 编辑状态.genre.join('、') + '\n';
      if (编辑状态.gender && 编辑状态.gender !== '通用') ctx += '受众：' + 编辑状态.gender + '向\n';
      if (编辑状态.explicit) ctx += '露骨度：' + 编辑状态.explicit + '\n';
      if (编辑状态.channel && 编辑状态.channel.length) ctx += '渠道：' + 编辑状态.channel.join('、') + '\n';
      if (!ctx) ctx = '当前无已选元素，自由发挥';
      var r = renderPrompt(cfg.promptName + '_suggest', { ctx: ctx, charCtx: 角色上下文() }); return { user: r.user, system: r.system };
    }, { fillFn: function(d) {
      if (!d) return;
      if (d.title) 编辑字段('title', d.title);
      if (d.genre) 编辑字段('genre', d.genre);
      if (d.imagery) 编辑字段('imagery', d.imagery);
      if (d.explicit) 编辑字段('explicit', d.explicit);
      var titleEl = document.getElementById(cfg.prefix + 'Title');
      if (titleEl) titleEl.value = 编辑状态.title || '';
      同步chips();
      toast('名称建议已填入');
    }});
    registerAiField(cfg.aiFieldId, cfg.aiLabel, function() {
      var direction = (document.getElementById(cfg.prefix + 'Direction') || {}).value.trim();
      var ctx = 参数上下文();
      if (direction) ctx += '\n方向：' + direction;
      var r = renderPrompt(cfg.promptName, { ctx: ctx, charCtx: 角色上下文(), gender: 编辑状态.gender || '通用' }); return { user: r.user, system: r.system };
    }, { fillFn: function(d) { 回填内容(d, 'gen'); } });
    registerAiField(cfg.aiFieldId + 'Adapt', cfg.aiLabel + '改编', function() {
      var source = (document.getElementById(cfg.prefix + 'AdaptSource') || {}).value || '';
      if (!source.trim()) { toast('请先输入要改编的原文'); return null; }
      var ctx = '';
      if (编辑状态.genre && 编辑状态.genre.length) ctx += '题材：' + 编辑状态.genre.join('、') + '\n';
      if (编辑状态.imagery && 编辑状态.imagery.length) ctx += '素材：' + 编辑状态.imagery.join('、') + '\n';
      var r = renderPrompt(cfg.promptName + '_adapt', { ctx: ctx, charCtx: 角色上下文(), gender: 编辑状态.gender || '通用', source: source, adaptExplicit: 编辑状态.adaptExplicit || '污秽淫化', adaptLen: 编辑状态.adaptLen || '维持' }); return { user: r.user, system: r.system };
    }, { fillFn: function(d) { 回填内容(d, 'adapt'); } });
  }

  // ===== 提案回填：gen/adapt 共用 =====
  function 回填内容(d, mode) {
    if (!d) return;
    var s = 编辑状态;
    if (d.title) s.title = d.title;
    if (d.genre) s.genre = d.genre;
    if (d.explicit) s.explicit = d.explicit;
    if (d.channel) s.channel = d.channel;
    if (d.gender) s.gender = d.gender;
    if (d.imagery) s.imagery = d.imagery;
    if (d.tags) s.tags = d.tags;
    字段定义.forEach(function(f) { if (d[f.key] != null) s[f.key] = d[f.key]; });
    if (mode === 'adapt' && !(s.title || '').trim()) s.title = '改编' + String(s.adaptSource || '').substring(0, 4);
    var titleEl = document.getElementById(cfg.prefix + 'Title');
    if (titleEl) titleEl.value = s.title || '';
    同步chips();
    // 持久化 + 生成后弹出阅读窗口展示结果
    var data = 生成数据();
    var 打开结果 = function() { if ((s.title || '').trim()) 阅读(s.title); };
    var next = function() {
      if (_editTitle) {
        Store[cfg.storeKey].get(_editTitle).then(function(m) { m = m || {}; Object.assign(m, data); return Store[cfg.storeKey].save(_editTitle, m); }).then(打开结果);
      } else {
        Store[cfg.storeKey].save(s.title, data).then(function() { _editTitle = s.title; }).then(打开结果);
      }
      toast(mode === 'adapt' ? '改编完成，已保存' : '已生成并保存');
    };
    if (_editTitle && (s.title || '').trim() && s.title !== _editTitle) {
      var oldTitle = _editTitle;
      _editTitle = null;
      Store[cfg.storeKey].delete(oldTitle).catch(function() {}).then(function() { next(); });
    } else {
      next();
    }
  }

  // ===== 暴露 window 方法 =====
  window[cfg.windowPrefix + '切换视图'] = 切换视图;
  window[cfg.windowPrefix + '新创作'] = 新创作;
  window[cfg.windowPrefix + '筛选'] = 筛选;
  window[cfg.windowPrefix + '编辑项'] = 编辑项;
  window[cfg.windowPrefix + '删除项'] = 删除项;
  window[cfg.windowPrefix + '阅读'] = 阅读;
  window[cfg.windowPrefix + '复制全文'] = 复制全文;
  window[cfg.windowPrefix + '去改编'] = 去改编;
  window[cfg.windowPrefix + '编辑字段'] = 编辑字段;
  window[cfg.windowPrefix + '编辑新行字段'] = 编辑新行字段;
  window[cfg.windowPrefix + '同步chips'] = 同步chips;
  window[cfg.windowPrefix + '切换题材'] = 切换题材;
  window[cfg.windowPrefix + '切换渠道'] = 切换渠道;
  window[cfg.windowPrefix + '切换意象'] = 切换意象;
  window[cfg.windowPrefix + '随机灵感'] = 随机灵感;
  window[cfg.windowPrefix + '导入角色'] = 导入角色;
  window[cfg.windowPrefix + '移除角色'] = 移除角色;
  window[cfg.windowPrefix + '清空角色'] = 清空角色;

  if (typeof Store !== 'undefined' && !Store[cfg.storeKey]) Store[cfg.storeKey] = createStore(cfg.storeKey);

  return { 切换视图: 切换视图, 当前视图: function() { return 当前视图; } };
}
window.宣传发布工厂 = 宣传发布工厂;
