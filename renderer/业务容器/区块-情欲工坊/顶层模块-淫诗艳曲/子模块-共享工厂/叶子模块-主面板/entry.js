// 情欲工坊 · 淫诗艳曲 · 诗体模块共享工厂
// 为 词/曲/现代诗/打油诗 提供统一的 list/editor/经典库 AI 逻辑，避免多份重复代码

// 经典库筛选配置常量（各模块 cfg 引用）
// 朝代时间轴（从古到今，供朝代行排序）
var 淫诗古典朝代轴 = ['先秦', '汉', '魏晋', '南北朝', '隋', '隋末唐初', '唐', '唐末宋初', '五代', '宋', '辽', '金', '宋末金初', '宋末元初', '元', '金末元初', '元末明初', '明', '明末清初', '清'];
var 淫诗近代朝代轴 = ['清末民国初', '清末近现代初', '近现代', '近现代末当代初', '民国末当代初', '当代'];

// 古典八题材（词/曲/古体诗/近代诗 共用）
var 淫诗古典题材库 = [
  { key: '艳情', kws: ['云雨', '巫山', '春宵', '红烛', '罗帏', '香汗', '鸳鸯', '酥胸', '锦衾', '玉体'] },
  { key: '闺怨', kws: ['闺怨', '深闺', '垂泪', '独守', '思君', '忆郎', '盼归', '玉楼'] },
  { key: '送别', kws: ['折柳', '阳关', '送别', '赠别', '灞桥', '惜别', '离愁', '远行'] },
  { key: '咏物', kws: ['咏梅', '咏雪', '咏怀', '赋得', '题画', '咏物'] },
  { key: '山水', kws: ['烟波', '青山', '绿水', '瀑布', '江湖', '烟霞', '山川'] },
  { key: '怀古', kws: ['怀古', '咏史', '金陵', '咸阳', '故宫', '废殿', '遗迹', '凭吊'] },
  { key: '边塞', kws: ['边塞', '烽火', '羌笛', '胡尘', '征人', '关山', '戍鼓'] },
  { key: '田园', kws: ['桑麻', '田园', '村居', '田家', '渔樵', '荷锄', '农事'] },
];
// 现代六题材（白话诗无朝代，题材词用现代语汇）
var 淫诗现代题材库 = [
  { key: '情爱', kws: ['爱情', '情人', '恋人', '接吻', '亲吻', '拥抱', '热恋', '欲望', '我爱你', '思念', '想你'] },
  { key: '都市', kws: ['都市', '城市', '街道', '马路', '地铁', '霓虹', '高楼', '工厂', '车站', '广场'] },
  { key: '乡愁', kws: ['故乡', '家乡', '乡愁', '村庄', '老家', '田野', '漂泊', '远方', '游子'] },
  { key: '自然', kws: ['月亮', '月光', '大海', '海浪', '落日', '夕阳', '星光', '雪花', '森林', '草原'] },
  { key: '时光', kws: ['岁月', '时光', '青春', '老年', '白发', '记忆', '往事', '童年', '时间'] },
  { key: '人生', kws: ['命运', '孤独', '死亡', '梦想', '希望', '灵魂', '墓碑', '黄昏', '虚无'] },
];

// 灵感素材卡·意象库（类别 → 意象列表；共享工厂内置默认，模块 cfg.意象库 可覆盖）
var 淫诗意象库 = {
  '身体': ['乳房', '乳头', '乳晕', '腰', '臀', '大腿', '阴毛', '肚脐', '锁骨', '脖颈', '嘴唇', '舌头', '手指', '脚', '脚踝', '肩膀', '腋窝', '膝弯'],
  '性器官': ['阴蒂', '阴唇', '阴阜', '阴道', '子宫', '处女膜', '阴茎', '龟头', '包皮', '阴囊', '睾丸', '尿道口', '前列腺', '肛门'],
  '玩具': ['跳蛋', '按摩棒', '假阳具', '振动棒', '飞机杯', '贞操带', '乳夹', '肛塞', '口塞', '锁精环', '皮鞭', '手铐', '项圈', '绳索', '蜡烛', '枷锁'],
  '动作': ['操', '干', '插', '捅', '抽', '顶', '舔', '吮', '含', '咬', '吸', '揉', '捏', '掐', '拍', '打', '扇', '抓', '压', '骑', '塞', '灌', '射', '尿', '拉', '滴', '深喉', '口爆', '颜射', '潮吹', '肛交'],
  '污物': ['尿', '粪', '精液', '包皮垢', '淫水', '白带', '经血', '前列腺液', '口水', '汗液'],
  '场景': ['春宵', '闺房', '浴室', '书房', '花园', '月下', '花前', '灯下', '帐中', '舟中', '屏风后', '池畔', '更衣室', '办公室', '电梯', '车里', '阳台', '天台', '酒吧', '浴室镜前', '雨夜', '雪夜', '午后', '深夜'],
  '衣服': ['船袜', '白丝', '黑丝', '渔网袜', '吊裤袜', '开裆裤', '肚兜', '亵衣', '绣花鞋', '旗袍', '吊带袜', '高跟鞋', '女仆装', '护士装', '教师装', '水手服', '和服', '汉服', '婚纱', '制服', '蕾丝内衣', '丁字裤', '情趣内衣', '猫耳', '眼罩', '项圈', '皮衣', '皮革手套', '露背装'],
};

function 淫诗体模块工厂(cfg) {
  // cfg: { storeKey, navLabelList, navLabelEdit, containerId, viewContentId, formOptions, formOptionsLabel, promptName, aiFieldId, aiLabel, dbPath, classicLabel, dbFormat, 题材选项, 露骨度选项, 默认诗体, 默认露骨度, 意象库, 显示标签, 筛选维度, 题材库, 朝代轴, 作者档位 }
  // 创作 tab 完全一致：词牌 chips / 意象 chips / 藏头 / 随机灵感 / 自动建档 / 题材选项 / 露骨度选项 全部无条件渲染（cfg 无需传，默认与淫诗一致）
  var 共享题材选项 = cfg.题材选项 || ['口交', '乳交', '调教', '绿帽', '人妻', '乱伦', '足交', '露出', '肛交', '群交'];
  var 共享露骨度选项 = cfg.露骨度选项 || ['含蓄隐晦', '粗俗荤诗'];
  var 导航 = [
    { id: 'list', label: cfg.navLabelList },
    { id: 'editor', label: cfg.navLabelEdit },
  ];
  if (cfg.dbPath) 导航.push({ id: 'classic', label: '📚 经典库' });
  var 当前视图 = 'list';
  var _editTitle = null;
  var 编辑状态 = {};
  var 经典分页 = 0;
  var 经典每页 = 50;
  var 筛选状态 = {};        // 列表筛选：{ form:'全部', genre:'全部', explicit:'全部' }
  var 筛选维度 = cfg.筛选维度 || ['form'];   // 列表筛选维度（默认仅诗体行）
  var 创作防抖保存 = null;   // 自动建档模块的字段防抖写盘
  var 默认露骨度 = cfg.默认露骨度 || '含蓄隐晦';
  var 默认诗体 = cfg.默认诗体 || '无';
  var 意象库 = cfg.意象库 || 淫诗意象库;   // 灵感素材卡数据源（默认内置全量意象库）
  var 模块独有选题 = cfg.模块独有选题;     // 选题卡模块独有行：{ label, options: [..], 编辑键: 'xx', ctx标签: 'xx' }

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
      case 'classic': 渲染经典库(vEl); break;
    }
  }

  function 新创作() { _editTitle = null; 切换视图('editor'); }

  function 渲染列表(el) {
    Store[cfg.storeKey].list().then(function(items) {
      var h = '<div class="mb-10"><button class="btn-new" onclick="' + cfg.windowPrefix + '新创作()">＋ 新建</button></div>';
      // 诗体筛选行（默认第一维）
      if (筛选维度.indexOf('form') >= 0) {
        var formChips = ['全部'].concat(cfg.formOptions.indexOf('无') < 0 ? ['无'].concat(cfg.formOptions) : cfg.formOptions);
        h += 筛选行(cfg.formOptionsLabel || '形式', formChips, 筛选状态.form, cfg.windowPrefix + '筛选', 'form');
      }
      // 题材筛选行（cfg.筛选维度 含 genre 时）
      if (筛选维度.indexOf('genre') >= 0 && 共享题材选项) {
        h += 筛选行('题材', ['全部'].concat(共享题材选项), 筛选状态.genre, cfg.windowPrefix + '筛选', 'genre');
      }
      // 露骨度筛选行（cfg.筛选维度 含 explicit 时）
      if (筛选维度.indexOf('explicit') >= 0 && 共享露骨度选项) {
        h += 筛选行('露骨度', ['全部'].concat(共享露骨度选项), 筛选状态.explicit, cfg.windowPrefix + '筛选', 'explicit');
      }
      var filtered = items || [];
      if (筛选状态.form && 筛选状态.form !== '全部') {
        filtered = filtered.filter(function(i) { return (i.form || '无') === 筛选状态.form; });
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
          if (item.form && item.form !== '无') h += '<span class="badge-tag">' + escHtml(item.form) + '</span>';
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

  // ===== 列表弹窗阅读（与经典库同款 reader 排版：正文居中衬线大字，下方赏析区不限字数）=====
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
      if (item.form && item.form !== '无') h += '<span class="reader-tag">' + escHtml(item.form) + '</span>';
      if (item.cipai) h += '<span class="reader-tag">' + escHtml(item.cipai) + '</span>';
      if (item.explicit) h += '<span class="reader-tag">' + escHtml(item.explicit) + '</span>';
      var genres2 = Array.isArray(item.genre) ? item.genre : (item.genre ? [item.genre] : []);
      if (genres2.length) h += '<span class="reader-tag">' + escHtml(genres2.join('、')) + '</span>';
      h += '<span class="reader-meta" style="margin-left:auto">' + (len < 80 ? '短' : len < 300 ? '中' : '长') + ' · ' + len + ' 字</span>';
      h += '</div>';
      // 正文区（居中题名 + 衬线大字排版）
      h += '<div class="reader-body">';
      h += '<div class="reader-poem-title">' + escHtml(item.title || title) + '</div>';
      h += '<div class="reader-poem-author">' + (item.form && item.form !== '无' ? escHtml(item.form) : '') + '<span class="reader-dot">·</span>' + escHtml(item.explicit || '') + '</div>';
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
        var ctx = '作品标题：' + title + '\n体式：' + (item.form||'') + '\n题材：' + ((Array.isArray(item.genre) ? item.genre : (item.genre ? [item.genre] : [])).join('、')||'无') + '\n露骨度：' + (item.explicit||'') + '\n正文：\n' + item.content;
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
      var text = (item.title || title) + (item.form ? ' · ' + item.form : '') + (item.explicit ? ' · ' + item.explicit : '') + '\n' + (item.content || '');
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
        form: 编辑状态.form || 默认诗体, explicit: 编辑状态.explicit || 默认露骨度,
        genre: 编辑状态.genre || [], imagery: 编辑状态.imagery || [],
        rhyme: 编辑状态.rhyme || '', appreciation: 编辑状态.appreciation || '',
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
      渲染表单(el, { title:'', content:'', tags:[], form:默认诗体, genre:[], explicit:默认露骨度, imagery:[], rhyme:'', appreciation:'',
        // 从经典库「去改编」带入的原文与选项（新建作品时保留，避免被重置冲掉）
        adaptSource: 编辑状态.adaptSource || '',
        adaptExplicit: 编辑状态.adaptExplicit || '',
        adaptLen: 编辑状态.adaptLen || ''
      });
    }
  }

  // ===== 卡片式创作页（与淫诗诗集版一致：作品信息 / 选题 / 灵感素材 / AI 生成 / 改编）=====
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
  // 灵感素材卡内容：意象 chips / 藏头输入 / 🎲 随机灵感（所有模块无条件渲染，创作 tab 完全一致）
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
    灵感行 += '<input class="llm-input" id="' + cfg.prefix + 'Acrostic" placeholder="藏头字（如：春宵一刻值千金，一字一格；留空则生成全诗）" style="flex:1;min-width:150px">';
    if (灵感行) h += 共享参数行('灵感', 灵感行);
    h += '</div>';
    return h;
  }
  function 渲染表单(el, data) {
    编辑状态 = { title:data.title||'', form:data.form||默认诗体, genre:data.genre||[], explicit:data.explicit||默认露骨度, content:data.content||'', tags:(Array.isArray(data.tags) ? data.tags : (data.tags ? String(data.tags).split('、') : [])).join('、'), imagery:data.imagery||[], rhyme:data.rhyme||'', appreciation:data.appreciation||'', roles:data.roles||[] };
    if (data.adaptSource) 编辑状态.adaptSource = data.adaptSource;
    if (data.adaptExplicit) 编辑状态.adaptExplicit = data.adaptExplicit;
    if (data.adaptLen) 编辑状态.adaptLen = data.adaptLen;
    if (模块独有选题) 编辑状态[模块独有选题.编辑键] = data[模块独有选题.编辑键] || '';
    var formOpts = cfg.formOptions.indexOf('无') < 0 ? ['无'].concat(cfg.formOptions) : cfg.formOptions;
    var formOptions = formOpts.map(function(f) { return '<option value="' + f + '"' + (编辑状态.form === f ? ' selected' : '') + '>' + f + '</option>'; }).join('');
    var s = 编辑状态;
    var h = '<div class="mw-600">';
    // ① 作品信息卡：标题（+AI 建议）| 体式（词牌在灵感卡中选择）
    h += '<div class="n-card p-10 mb-6">';
    h += 共享卡片头('📋', '作品信息', '输入即自动保存');
    h += '<div class="ai-field-row">';
    h += '<input class="llm-input" id="' + cfg.prefix + 'Title" placeholder="诗题（失焦即自动建档）" value="' + escHtml(s.title||'') + '" style="flex:2" onchange="' + cfg.windowPrefix + '编辑字段(\'title\',this.value)">';
    h += '<button class="ai-suggest-btn" onclick="openAiGenPanel(\'' + cfg.aiFieldId + 'Suggest\')" title="AI 诗题建议">🤖</button>';
    h += '<select class="llm-input" id="' + cfg.prefix + 'Form" style="flex:1" onchange="' + cfg.windowPrefix + '编辑字段(\'form\',this.value);' + cfg.windowPrefix + '同步chips()">' + formOptions + '</select>';
    h += '</div></div>';
    // ② 选题卡：题材 / 露骨度 / 角色
    h += '<div class="n-card p-10 mb-6">';
    h += 共享卡片头('🎯', '选题', 'AI 可一键建议');
    h += 共享参数行('题材', 共享题材选项.map(function(g) {
      return '<span class="tag-chip' + (s.genre.indexOf(g) >= 0 ? ' tag-active' : '') + '" data-genre="' + g + '" onclick="' + cfg.windowPrefix + '切换题材(\'' + g + '\');' + cfg.windowPrefix + '同步chips()">' + g + '</span>';
    }).join(''));
    h += 共享参数行('露骨度', 共享露骨度选项.map(function(e) {
      return '<span class="tag-chip' + (s.explicit === e ? ' tag-active' : '') + '" data-explicit="' + e + '" onclick="' + cfg.windowPrefix + '编辑字段(\'explicit\',\'' + e + '\');' + cfg.windowPrefix + '同步chips()">' + e + '</span>';
    }).join(''));
    if (模块独有选题) h += 共享参数行(模块独有选题.label, 模块独有选题.options.map(function(o) {
      return '<span class="tag-chip' + (s[模块独有选题.编辑键] === o ? ' tag-active' : '') + '" data-module-opt="' + o + '" onclick="' + cfg.windowPrefix + '编辑字段(\'' + 模块独有选题.编辑键 + '\',\'' + o + '\');' + cfg.windowPrefix + '同步chips()">' + o + '</span>';
    }).join(''));
    h += 共享参数行('角色', '<span id="' + cfg.prefix + 'RoleChips">' + 共享角色chipsHTML() + '</span>');
    h += '</div>';
    // ③ 灵感素材卡（折叠，默认展开）：词牌/意象/藏头/随机灵感（所有模块无条件渲染）
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
    h += '<textarea class="llm-input llm-input-lg" id="' + cfg.prefix + 'AdaptSource" placeholder="要改编的原文（经典库「去改编」自动带入 / 粘贴）" style="width:100%;height:96px;resize:vertical" onchange="' + cfg.windowPrefix + '编辑字段(\'adaptSource\',this.value)">' + escHtml(s.adaptSource||'') + '</textarea>';
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
    var g = 共享题材选项[Math.floor(Math.random() * 共享题材选项.length)];
    编辑状态.imagery = imgs.slice(0, 3 + Math.floor(Math.random() * 3));
    编辑状态.genre = g ? [g] : 编辑状态.genre;
    编辑字段('imagery', 编辑状态.imagery);
    编辑字段('genre', 编辑状态.genre);
    同步chips();
    toast('灵感已填入：' + 编辑状态.imagery.slice(0,3).join('、') + (g ? ' · ' + g : ''));
  }

  // ===== AI 提示词组装（角色段 / 参数段，共享工厂无藏头输入，acrostic 恒为空）=====
  // 体式解释（共享工厂各模块 formOptions 不同：词=小令/中调/长调、曲=小令/套数/带过曲、现代诗=自由诗/散文诗/格律体/民歌体/老干体/屎尿体、打油诗=打油诗/四句半/顺口溜、近代诗=词牌体/律绝体/古风杂诗、古体诗=诗经体/骚体/古风/乐府/歌行/杂言；无匹配时仅列选项名）
  var 共享诗体解释表 = {
    '五言': '每句五字、句数不限；完整范作：「白日依山尽，黄河入海流。欲穷千里目，更上一层楼。」',
    '七言': '每句七字、句数不限；完整范作：「杨柳青青江水平，闻郎江上踏歌声。东边日出西边雨，道是无晴却有晴。」',
    '五绝': '五言四句；完整范作：「床前明月光，疑是地上霜。举头望明月，低头思故乡。」',
    '七绝': '七言四句；完整范作：「春宵一刻值千金，花有清香月有阴。歌管楼台声细细，秋千院落夜沉沉。」',
    '五律': '五言八句；完整范作：「国破山河在，城春草木深。感时花溅泪，恨别鸟惊心。烽火连三月，家书抵万金。白头搔更短，浑欲不胜簪。」',
    '七律': '七言八句；完整范作：「风急天高猿啸哀，渚清沙白鸟飞回。无边落木萧萧下，不尽长江滚滚来。万里悲秋常作客，百年多病独登台。艰难苦恨繁霜鬓，潦倒新停浊酒杯。」',
    '排律': '五言或七言、十句以上，句句对仗；完整范作（钱起·省试湘灵鼓瑟）：「善鼓云和瑟，常闻帝子灵。冯夷空自舞，楚客不堪听。苦调凄金石，清音入杳冥。苍梧来怨慕，白芷动芳馨。流水传湘浦，悲风过洞庭。曲终人不见，江上数峰青。」',
    '长短句': '每句字数随内容变化、不齐整；完整范作：「春花秋月何时了，往事知多少。小楼昨夜又东风，故国不堪回首月明中。雕栏玉砌应犹在，只是朱颜改。问君能有几多愁，恰似一江春水向东流。」',
    '自由诗': '不限句数字数、无格律约束、按情感节奏分行；完整范作：「你站在桥上看风景，看风景的人在楼上看你。明月装饰了你的窗子，你装饰了别人的梦。」',
    '散文诗': '不分行、以散文句式写诗；完整范作：「我独自在雨中行走，任雨打湿我的衣衫。世界在雨雾里朦胧，我在世界里孤独。野草在墙根疯长，记忆在夜里发芽。」',
    '格律体': '有固定句数字数与韵脚安排（新诗格律）；完整范作：「轻轻的我走了，正如我轻轻的来；我轻轻的招手，作别西天的云彩。那河畔的金柳，是夕阳中的新娘；波光里的艳影，在我的心头荡漾。软泥上的青荇，油油的在水底招摇；在康河的柔波里，我甘心做一条水草。那榆荫下的一潭，不是清泉，是天上虹；揉碎在浮藻间，沉淀着彩虹似的梦。寻梦？撑一支长篙，向青草更青处漫溯；满载一船星辉，在星辉斑斓里放歌。但我不能放歌，悄悄是别离的笙箫；夏虫也为我沉默，沉默是今晚的康桥。悄悄的我走了，正如我悄悄的来；我挥一挥衣袖，不带走一片云彩。」',
    '民歌体': '句式整齐、押韵顺口、有民歌风味；完整范作：「太阳出来喜洋洋，挑起扁担上山岗。山岗上边好风光，妹在坡上唱山歌。唱得哥哥心里痒，唱得太阳下山坡。」',
    '老干体': '老干部式豪言壮语、铿锵押韵、宏大叙事腔调；完整范作：「万里江山万里红，中华儿女尽英雄。红旗漫卷东风劲，战鼓擂鸣大地隆。四海翻腾云水怒，五洲震荡风雷动。高歌猛进新时代，阔步征程再立功。」',
    '屎尿体': '日常琐碎白描、以屎尿屁吃喝拉撒等生活细节入诗、用最朴素的字眼写最直白的情欲；完整范作：「晚上睡在床上的时候，我想起了我拉的屎。它静静地躺在茅坑里，像我一天的烦恼。第二天早上起来，它已经被冲走了，我也就干净了。」',
    '打油诗': '五七言俚俗句、押韵顺口、诙谐幽默；完整范作：「一片两片三四片，五片六片七八片。九片十片无数片，飞入梅花都不见。」',
    '四句半': '四句加一句半句收尾的诙谐结构；完整范作：「人穷志不穷，白布染了红。脸皮厚如墙，肚皮大过缸——熬住。」',
    '顺口溜': '口语化押韵、朗朗上口、便于念诵；完整范作：「小小子儿坐门墩儿，哭着喊着要媳妇儿。要媳妇儿干什么？点灯说话儿，吹灯做伴儿，明儿早晨梳小辫儿。」',
    '词牌体': '依词牌格律填词；完整范作（如梦令）：「常记溪亭日暮，沉醉不知归路。兴尽晚回舟，误入藕花深处。争渡，争渡，惊起一滩鸥鹭。」',
    '律绝体': '五七言律诗或绝句、平仄对仗合律；完整范作：「辛苦遭逢起一经，干戈寥落四周星。山河破碎风飘絮，身世浮沉雨打萍。惶恐滩头说惶恐，零丁洋里叹零丁。人生自古谁无死，留取丹心照汗青。」',
    '古风体': '古体诗风、不拘平仄对仗；完整范作：「前不见古人，后不见来者。念天地之悠悠，独怆然而涕下。」',
    '杂言体': '杂言自由、长短句错落；完整范作：「噫吁嚱，危乎高哉！蜀道之难，难于上青天。蚕丛及鱼凫，开国何茫然。尔来四万八千岁，不与秦塞通人烟。」',
    '诗经体（四言）': '四言为主、重章叠句、古朴复沓；完整范作：「关关雎鸠，在河之洲。窈窕淑女，君子好逑。参差荇菜，左右流之。窈窕淑女，寤寐求之。」',
    '骚体（兮字句）': '楚辞体、句中或句尾用兮字、长短错落；完整范作：「若有人兮山之阿，被薜荔兮带女罗。既含睇兮又宜笑，子慕予兮善窈窕。乘赤豹兮从文狸，辛夷车兮结桂旗。被石兰兮带杜衡，折芳馨兮遗所思。」',
    '古风': '五七言古体、不拘平仄、质朴流畅；完整范作：「人生得意须尽欢，莫使金樽空对月。天生我材必有用，千金散尽还复来。烹羊宰牛且为乐，会须一饮三百杯。」',
    '乐府': '乐府诗体、叙事性强、语言朴拙；完整范作：「江南可采莲，莲叶何田田。鱼戏莲叶间。鱼戏莲叶东，鱼戏莲叶西，鱼戏莲叶南，鱼戏莲叶北。」',
    '歌行': '七言歌行体、句式舒展、气韵奔放；完整范作：「大弦嘈嘈如急雨，小弦切切如私语。嘈嘈切切错杂弹，大珠小珠落玉盘。间关莺语花底滑，幽咽泉流冰下难。」',
    '柏梁体': '七言、句句押平声韵；完整范作：「日月星辰和四时，骖驾驷马从梁来。郡国士马羽林材，总领天下诚难治。和抚四夷不易哉，刀笔之吏臣执之。撞钟伐鼓声中诗，宗室广大日益滋。周卫交戟禁不时，总领从官柏梁台。平理请谳决嫌疑，修饰舆马待驾来。郡国吏功差次之，乘舆御物主治之。陈粟万石扬以箕，徼道宫下随讨治。三辅盗贼天下危，盗阻南山为民灾。外家公主不可治，椒房率更领其材。蛮夷朝贺常会期，柱欀欂栌相枝持。枇杷橘栗桃李梅，走狗逐兔张罘罳。齿妃女唇甘如饴，迫窘诘屈几穷哉。」',
    '杂言': '句数长短不拘、随情感起伏；完整范作：「君不见黄河之水天上来，奔流到海不复回。君不见高堂明镜悲白发，朝如青丝暮成雪。人生得意须尽欢，莫使金樽空对月。」',
    '小令': '短小单支、58字以内；完整范作（天净沙）：「枯藤老树昏鸦，小桥流水人家，古道西风瘦马。夕阳西下，断肠人在天涯。」',
    '中调': '59至90字；完整范作（水调歌头）：「明月几时有，把酒问青天。不知天上宫阙，今夕是何年。我欲乘风归去，又恐琼楼玉宇，高处不胜寒。起舞弄清影，何似在人间。转朱阁，低绮户，照无眠。不应有恨，何事长向别时圆。人有悲欢离合，月有阴晴圆缺，此事古难全。但愿人长久，千里共婵娟。」',
    '长调': '91字以上、多长于铺叙；完整范作（念奴娇）：「大江东去，浪淘尽，千古风流人物。故垒西边，人道是，三国周郎赤壁。乱石穿空，惊涛拍岸，卷起千堆雪。江山如画，一时多少豪杰。遥想公瑾当年，小乔初嫁了，雄姿英发。羽扇纶巾，谈笑间，樯橹灰飞烟灭。故国神游，多情应笑我，早生华发。人生如梦，一尊还酹江月。」',
    '套数': '同一宫调多支曲牌连缀成套；完整范作（双调·夜行船·秋思）：「百岁光阴一梦蝶，重回首往事堪嗟。今日春来，明朝花谢。急罚盏夜阑灯灭。想秦宫汉阙，都做了衰草牛羊野。不恁么渔樵没话说。纵荒坟横断碑，不辨龙蛇。投至狐踪与兔穴，多少豪杰。鼎足虽坚半腰里折。魏耶？晋耶？天教你富，莫太奢。没多时好天良夜。富家儿更做道你心似铁，争辜负了锦堂风月。眼前红日又西斜，疾似下坡车。不争镜里添白雪，上床与鞋履相别。莫笑巢鸠计拙，葫芦提一向装呆。利名竭，是非绝。红尘不向门前惹，绿树偏宜屋角遮。青山正补墙头缺，更那堪竹篱茅舍。蛩吟一觉才宁贴，鸡鸣万事无休歇。何年是彻？看密匝匝蚁排兵，乱纷纷蜂酿蜜，闹穰穰蝇争血。裴公绿野堂，陶令白莲社。爱秋来那些：和露摘黄花，带霜烹紫蟹，煮酒烧红叶。想人生有限杯，浑几个重阳节？人问我顽童记者：便北海探吾来，道东篱醉了也。」',
    '带过曲': '两三支曲牌连写、中间不换宫调；完整范作（雁儿落过得胜令·美色）：「他生得柳似眉莲似腮，樱桃口芙蓉额。不将朱粉施，自有天然态。半折慢弓鞋，一搦俏形骸。粉腕黄金钏，乌云白玉钗。欢谐，笑解香罗带。疑猜，莫不是阳台梦里来？」'
  };
  // 露骨度档位解释（由低到高，AI 参数段使用；改编卡「维持原度/污秽淫化」为改编专用档位，不在四档内）
  var 共享露骨度解释表 = {
    '含蓄隐晦': '以隐喻借代写性、不明写性事', '唯美风雅': '用优美雅致的语汇写性事、点到即止',
    '直白露骨': '直接描写性器官与性行为、用词大胆', '粗俗荤诗': '用最粗鄙直白的荤词俚语、性描写毫不遮掩'
  };
  // 角色段：【要写的相关人物】+ 各角色身份原文（角色卡身份与外貌 原样输出，不改动）
  function 共享角色上下文() {
    var arr = (编辑状态.roles || []).map(function(c) {
      return '【' + 共享角色名(c) + '】\n' + (typeof window.角色卡身份与外貌 === 'function' ? window.角色卡身份与外貌(c) : JSON.stringify(c || {}));
    });
    if (!arr.length) return '';
    return '【要写的相关人物】\n\n' + arr.join('\n\n');
  }
  // 藏头段（读输入框；未输入返回空，整段不显示）
  function 共享藏头上下文() {
    var t = ((document.getElementById(cfg.prefix + 'Acrostic') || {}).value || '').trim();
    if (!t) return '';
    var chars = Array.from(t);
    return '【藏头】' + t + '\n（共 ' + chars.length + ' 句，每句句首依次嵌入「' + chars.join('」「') + '」，全诗句首连读即此文字；藏字须自然融入句意，不生硬）\n';
  }
  // 参数段：选题 + 灵感素材，有值才列；体式/露骨度附选项解释（无匹配解释时仅列选项名）
  function 共享参数上下文() {
    var ctx = '';
    if (编辑状态.form && 编辑状态.form !== '无') ctx += (cfg.formOptionsLabel || '体式') + '：' + 编辑状态.form + (共享诗体解释表[编辑状态.form] ? '\n　' + 共享诗体解释表[编辑状态.form] : '') + '\n';
    if (模块独有选题 && 编辑状态[模块独有选题.编辑键]) ctx += (模块独有选题.ctx标签 || 模块独有选题.label) + '：' + 编辑状态[模块独有选题.编辑键] + '\n';
    if (编辑状态.genre && 编辑状态.genre.length) ctx += '题材：' + 编辑状态.genre.join('、') + '\n';
    if (编辑状态.explicit) ctx += '露骨度：' + 编辑状态.explicit + (共享露骨度解释表[编辑状态.explicit] ? '\n　' + 共享露骨度解释表[编辑状态.explicit] : '') + '\n';
    if (编辑状态.imagery && 编辑状态.imagery.length) ctx += '意象：' + 编辑状态.imagery.join('、') + '\n';
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

  // ===== 经典库（读 renderer/数据库）=====
  // 顶部筛选栏 UI 与「角色提取总览」一致：维度行（朝代/作者/题材）+ 全部/选项 chip + 搜索框 + 统计行
  var 经典缓存 = null;
  var 经典分页 = 0;
  var 经典每页 = 50;
  var 经典筛选 = { dynasty: '', level: '', theme: '' };
  var 经典搜索 = '';
  var 经典作者统计 = null;
  var 经典题材缓存 = null;
  var 经典题材库 = cfg.题材库 || 淫诗古典题材库;
  var 经典朝代轴 = cfg.朝代轴 || 淫诗古典朝代轴;
  var 经典档位 = cfg.作者档位 || { 低: 2, 中: 10, 顶: 50 };

  // 朝代列表（按时间轴从古到今排序，轴外朝代排末尾）
  var 经典朝代列表 = null;
  function 经典获取朝代() {
    if (经典朝代列表) return 经典朝代列表;
    var seen = {};
    经典缓存.all.forEach(function(p) {
      var d = p.dynasty || '';
      if (d && !seen[d]) seen[d] = 1;
    });
    var list = Object.keys(seen);
    var 轴 = {};
    经典朝代轴.forEach(function(d, i) { 轴[d] = i; });
    list.sort(function(a, b) {
      var ai = 轴[a], bi = 轴[b];
      if (ai !== undefined && bi !== undefined) return ai - bi;
      if (ai !== undefined) return -1;
      if (bi !== undefined) return 1;
      return a.localeCompare(b);
    });
    经典朝代列表 = list;
    return list;
  }

  // 作者作品数统计（排除 无名氏/不详/佚名；惰性构建）
  function 经典构建作者统计() {
    if (经典作者统计) return;
    var cnt = {};
    经典缓存.all.forEach(function(p) {
      var a = (p.author || '').trim();
      if (a && a !== '无名氏' && a !== '不详' && a !== '佚名') cnt[a] = (cnt[a] || 0) + 1;
    });
    经典作者统计 = cnt;
  }
  function 经典作者档位(name) {
    var a = (name || '').trim();
    if (!a || !经典作者统计 || 经典作者统计[a] === undefined) return '';
    var n = 经典作者统计[a];
    if (n >= 经典档位.顶) return '顶级';
    if (n >= 经典档位.中) return '中知名度';
    if (n >= 经典档位.低) return '低知名度';
    return '不知名';
  }
  var 经典作者档位表 = ['不知名', '低知名度', '中知名度', '顶级'];

  // 题材标签缓存（每首命中题材数组；首次点题材筛选时惰性构建）
  function 经典构建题材缓存() {
    if (经典题材缓存) return;
    经典题材缓存 = 经典缓存.all.map(function(p) {
      var t = (p.title || '') + '|' + (p.content || '');
      var arr = [];
      经典题材库.forEach(function(g) {
        for (var i = 0; i < g.kws.length; i++) {
          if (t.indexOf(g.kws[i]) >= 0) { arr.push(g.key); break; }
        }
      });
      return arr;
    });
  }

  function 经典筛选逻辑(all) {
    var filtered = all;
    if (经典筛选.dynasty) filtered = filtered.filter(function(p) { return (p.dynasty || '') === 经典筛选.dynasty; });
    if (经典筛选.level) filtered = filtered.filter(function(p) { return 经典作者档位(p.author) === 经典筛选.level; });
    if (经典筛选.theme) {
      经典构建题材缓存();
      filtered = filtered.filter(function(p, i) { return 经典题材缓存[i].indexOf(经典筛选.theme) >= 0; });
    }
    if (经典搜索) {
      var q = 经典搜索;
      filtered = filtered.filter(function(p) {
        return (p.title || '').indexOf(q) >= 0 || (p.author || '').indexOf(q) >= 0 || (p.content || '').indexOf(q) >= 0;
      });
    }
    return filtered;
  }

  function 经典筛选栏HTML() {
    var f = 经典筛选;
    var h = '';
    var chip = function(active, fn, label) {
      return '<span class="btn-out btn-sm" style="font-size:10px;padding:2px 8px;' + (active ? 'background:var(--accent);color:#fff;border-color:var(--accent)' : '') + ';cursor:pointer" onclick="' + cfg.windowPrefix + fn + '">' + label + '</span>';
    };
    // 朝代行（从古到今；无朝代数据的模块不显示）
    var dyns = 经典获取朝代();
    if (dyns.length) {
      h += '<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:wrap">';
      h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">朝代</span>';
      h += chip(!f.dynasty, '经典筛选朝代(\'\')', '全部');
      dyns.forEach(function(d) {
        h += chip(f.dynasty === d, '经典筛选朝代(\'' + d + '\')', escHtml(d));
      });
      h += '</div>';
    }
    // 作者等级行（按作品数分级，阈值随模块数据分布自适应）
    经典构建作者统计();
    h += '<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:wrap">';
    h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">作者</span>';
    h += chip(!f.level, '经典筛选等级(\'\')', '全部');
    经典作者档位表.forEach(function(l) {
      h += chip(f.level === l, '经典筛选等级(\'' + l + '\')', l);
    });
    h += '</div>';
    // 题材行（关键词命中：标题/内容 任一关键词即归入）
    h += '<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:wrap">';
    h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">题材</span>';
    h += chip(!f.theme, '经典筛选题材(\'\')', '全部');
    经典题材库.forEach(function(g) {
      h += chip(f.theme === g.key, '经典筛选题材(\'' + g.key + '\')', g.key);
    });
    h += '</div>';
    // 搜索行
    h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">';
    h += '<span style="font-size:11px;color:var(--fg3);font-weight:500;width:32px;flex-shrink:0">搜索</span>';
    h += '<input id="' + cfg.prefix + 'ClassicSearch" type="text" placeholder="搜索标题 / 作者 / 内容…" value="' + escHtml(经典搜索) + '" style="flex:1;font-size:12px;padding:4px 8px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;color:var(--fg)" onkeydown="if(event.key===\'Enter\'){' + cfg.windowPrefix + '经典执行搜索()}">';
    h += '<button class="btn btn-sm" onclick="' + cfg.windowPrefix + '经典执行搜索()" style="font-size:11px;padding:4px 12px">🔍 搜索</button>';
    if (经典搜索) {
      h += '<span style="font-size:10px;color:var(--fg3);cursor:pointer" onclick="' + cfg.windowPrefix + '经典清空搜索()">✕ 清除</span>';
    }
    h += '</div>';
    return h;
  }

  function 渲染经典库(el) {
    if (!cfg.dbPath) { el.innerHTML = '<div class="placeholder-text">经典库暂无数据</div>'; return; }
    if (经典缓存) { 渲染经典列表(el); return; }
    el.innerHTML = '<div class="text-muted p-20 text-center">正在加载经典库...</div>';
    LocalFS.dbRead(cfg.dbPath).then(function(text) {
      if (!text) { el.innerHTML = '<div class="placeholder-text">经典库暂无数据</div>'; return; }
      if (cfg.dbFormat === 'json') {
        var arr = JSON.parse(text);
        经典缓存 = { all: arr.map(function(p) {
          return { title: p.title || p.author || '无题', dynasty: '', author: p.author || '', content: p.body || p.content || '', source: '现代诗库', cipai: '' };
        }) };
      } else {
        var lines = text.split(/\r?\n/).slice(1).filter(Boolean);
        var all = lines.map(function(l) {
          var m = l.match(/^"(.*?)","(.*?)","(.*?)","(.*?)","(.*?)",(.*)$/);
          // ⏎ 是歌库数据里的歌词分行符，转成换行显示
          return m ? { title: m[1], dynasty: m[2], author: m[3], content: m[4].split('⏎').join('\n'), source: m[5], cipai: m[6] } : null;
        }).filter(Boolean);
        经典缓存 = { all: all };
      }
      渲染经典列表(el);
    }).catch(function() { el.innerHTML = '<div class="placeholder-text">经典库加载失败</div>'; });
  }

  function 渲染经典列表(el) {
    var all = 经典缓存.all;
    var filtered = 经典筛选逻辑(all);
    var total = filtered.length;
    var pages = Math.max(1, Math.ceil(total / 经典每页));
    if (经典分页 >= pages) 经典分页 = 0;
    var pageItems = filtered.slice(经典分页 * 经典每页, (经典分页 + 1) * 经典每页);

    var h = '';
    h += '<div class="text-sm fw-600 mb-4" style="color:var(--accent)">📚 ' + cfg.classicLabel + '经典库</div>';
    h += 经典筛选栏HTML();
    // 统计行（与角色提取总览一致）
    h += '<div style="font-size:11px;color:var(--fg3);margin-bottom:10px">共 ' + all.length + ' 首，当前筛选命中 ' + total + ' 首</div>';

    if (!pageItems.length) h += '<div class="placeholder-text">无匹配作品</div>';
    pageItems.forEach(function(p, i) {
      var gIdx = 经典分页 * 经典每页 + i;
      var len = (p.content || '').length;
      var lenLabel = len < 80 ? '短' : (len < 300 ? '中' : '长');
      h += '<div class="n-card cur-ptr mb-4 p-8" onclick="' + cfg.windowPrefix + '经典阅读(' + gIdx + ')">';
      h += '<div class="flex gap-4 align-center flex-wrap">';
      h += '<div class="fw-600 fs-13">' + escHtml(p.title || '无题') + '</div>';
      if (p.dynasty) h += '<span class="badge-tag">' + escHtml(p.dynasty) + '</span>';
      if (p.author) h += '<span class="badge-tag">' + escHtml(p.author) + '</span>';
      if (p.cipai) h += '<span class="badge-tag">' + escHtml(p.cipai) + '</span>';
      h += '<span class="text-xs text-muted" style="margin-left:auto">' + lenLabel + ' · ' + len + '字</span>';
      h += '</div>';
      h += '<div class="text-muted text-sm mt-2" style="white-space:pre-wrap;font-family:serif;line-height:1.7">' + escHtml(p.content || '').slice(0, 90) + '</div>';
      h += '</div>';
    });

    // 分页
    if (pages > 1) {
      h += '<div class="flex gap-4 align-center mt-6 flex-wrap">';
      h += '<button class="btn-sm"' + (经典分页 === 0 ? ' disabled' : '') + ' onclick="' + cfg.windowPrefix + '经典翻页(-1)">← 上一页</button>';
      h += '<span class="text-sm text-muted">第 ' + (经典分页 + 1) + ' / ' + pages + ' 页</span>';
      h += '<button class="btn-sm"' + (经典分页 >= pages - 1 ? ' disabled' : '') + ' onclick="' + cfg.windowPrefix + '经典翻页(1)">下一页 →</button>';
      h += '</div>';
    }
    el.innerHTML = h;
    // 保持搜索框值
    var si = document.getElementById(cfg.prefix + 'ClassicSearch');
    if (si) si.value = 经典搜索;
  }

  // ===== 弹窗阅读（点击条目弹出居中阅读窗，上一篇/下一篇/AI赏析/复制）=====
  function 经典阅读(idx) {
    var filtered = 经典筛选逻辑(经典缓存.all);
    var p = filtered[idx];
    if (!p) return;
    // 替换式弹窗：切换上一篇/下一篇时移除旧弹窗，避免堆叠
    document.querySelectorAll('.ovl').forEach(function(o) { o.remove(); });
    var len = (p.content || '').length;
    var h = '';
    // 顶部元信息行
    h += '<div class="reader-head">';
    h += '<span class="reader-title">📖 ' + escHtml(p.title || '无题') + '</span>';
    if (p.dynasty) h += '<span class="reader-tag">' + escHtml(p.dynasty) + '</span>';
    if (p.author) h += '<span class="reader-tag">' + escHtml(p.author) + '</span>';
    if (p.cipai) h += '<span class="reader-tag">' + escHtml(p.cipai) + '</span>';
    h += '<span class="reader-meta" style="margin-left:auto">' + (len < 80 ? '短' : len < 300 ? '中' : '长') + ' · ' + len + ' 字</span>';
    h += '</div>';
    // 正文区（居中题名 + 衬线大字排版，限高内部滚动）
    h += '<div class="reader-body">';
    h += '<div class="reader-poem-title">' + escHtml(p.title || '无题') + '</div>';
    h += '<div class="reader-poem-author">' + escHtml(p.dynasty || '') + '<span class="reader-dot">·</span>' + escHtml(p.author || '无名') + '</div>';
    h += '<div class="reader-poem-text">' + escHtml(p.content || '') + '</div>';
    h += '</div>';
    // 底部按钮栏
    h += '<div class="reader-foot">';
    h += '<span class="reader-count">' + (idx + 1) + ' / ' + filtered.length + '</span>';
    h += '<button class="reader-btn"' + (idx === 0 ? ' disabled' : '') + ' onclick="' + cfg.windowPrefix + '经典阅读(' + (idx - 1) + ')">← 上一篇</button>';
    h += '<button class="reader-btn"' + (idx >= filtered.length - 1 ? ' disabled' : '') + ' onclick="' + cfg.windowPrefix + '经典阅读(' + (idx + 1) + ')">下一篇 →</button>';
    h += '<button class="reader-btn" onclick="' + cfg.windowPrefix + '经典去改编(' + idx + ')">✍️ 去改编</button>';
    h += '<button class="reader-btn" onclick="' + cfg.windowPrefix + '经典复制(' + idx + ')">📋 复制全文</button>';
    h += '<button class="reader-btn primary" onclick="this.closest(\'.ovl\').remove()">关闭</button>';
    h += '</div>';
    showModal('', h, { noWrap: true, cardClass: 'reader-night', ovlClass: 'reader-night-ovl' });
  }

  // 复制全文到剪贴板
  function 经典复制(idx) {
    var filtered = 经典筛选逻辑(经典缓存.all);
    var p = filtered[idx];
    if (!p) return;
    var text = (p.title || '') + (p.dynasty ? ' · ' + p.dynasty : '') + (p.author ? ' · ' + p.author : '') + '\n' + (p.content || '');
    复制到剪贴板(text).then(function(ok){ toast(ok ? '已复制全文' : '复制失败'); });
  }

  // ===== 去改编（经典库弹窗 → 直接跳创作页，原文带入改编卡）=====
  function 经典去改编(idx) {
    var filtered = 经典筛选逻辑(经典缓存.all);
    var p = filtered[idx];
    if (!p || !(p.content || '').trim()) { toast('该作品暂无正文'); return; }
    document.querySelectorAll('.ovl').forEach(function(o) { o.remove(); });
    // 去改编 = 新建创作，重置编辑链接，避免编辑器加载旧作品覆盖带入的原文
    _editTitle = null;
    编辑状态.adaptSource = p.content || '';
    编辑状态.adaptExplicit = '污秽淫化';
    编辑状态.adaptLen = '维持';
    切换视图('editor');
    toast('原文已带入创作页改编卡');
  }
  window[cfg.windowPrefix + '经典去改编'] = 经典去改编;

  // 筛选交互（与总览一致：点击选中，点「全部」取消）
  function 经典筛选朝代(d) { 经典筛选.dynasty = d; 经典分页 = 0; 经典刷新(); }
  function 经典筛选等级(l) { 经典筛选.level = l; 经典分页 = 0; 经典刷新(); }
  function 经典筛选题材(t) { 经典筛选.theme = t; 经典分页 = 0; 经典刷新(); }
  function 经典执行搜索() {
    var input = document.getElementById(cfg.prefix + 'ClassicSearch');
    经典搜索 = input ? input.value.trim() : '';
    经典分页 = 0;
    经典刷新();
  }
  function 经典清空搜索() {
    经典搜索 = '';
    经典分页 = 0;
    经典刷新();
  }
  function 经典刷新() {
    var vEl = document.getElementById(cfg.viewContentId);
    if (vEl) 渲染经典列表(vEl);
  }
  function 经典翻页(delta) {
    经典分页 += delta;
    if (经典分页 < 0) 经典分页 = 0;
    经典刷新();
  }

  window[cfg.windowPrefix + '经典库'] = function() { 切换视图('classic'); };
  window[cfg.windowPrefix + '经典筛选朝代'] = 经典筛选朝代;
  window[cfg.windowPrefix + '经典筛选等级'] = 经典筛选等级;
  window[cfg.windowPrefix + '经典筛选题材'] = 经典筛选题材;
  window[cfg.windowPrefix + '经典执行搜索'] = 经典执行搜索;
  window[cfg.windowPrefix + '经典清空搜索'] = 经典清空搜索;
  window[cfg.windowPrefix + '经典刷新'] = 经典刷新;
  window[cfg.windowPrefix + '经典翻页'] = 经典翻页;
  window[cfg.windowPrefix + '经典阅读'] = 经典阅读;
  window[cfg.windowPrefix + '经典复制'] = 经典复制;
  window[cfg.windowPrefix + '经典分页'] = 0;

  // AI 字段注册
  if (typeof registerAiField !== 'undefined') {
    // 诗题建议（作品信息卡 🤖 按钮）
    registerAiField(cfg.aiFieldId + 'Suggest', cfg.aiLabel + '诗题建议', function() {
      var ctx = '';
      if (编辑状态.genre && 编辑状态.genre.length) ctx += '题材：' + 编辑状态.genre.join('、') + '\n';
      if (模块独有选题 && 编辑状态[模块独有选题.编辑键]) ctx += (模块独有选题.ctx标签 || 模块独有选题.label) + '：' + 编辑状态[模块独有选题.编辑键] + '\n';
      if (编辑状态.imagery && 编辑状态.imagery.length) ctx += '意象：' + 编辑状态.imagery.join('、') + '\n';
      if (编辑状态.form && 编辑状态.form !== '无') ctx += (cfg.formOptionsLabel || '体式') + '：' + 编辑状态.form + '\n';
      if (!ctx) ctx = '当前无已选元素，自由发挥';
      var r = renderPrompt('poetry_inspire_gen', { ctx: ctx, charCtx: 共享角色上下文() }); return { user: r.user, system: r.system };
    }, { fillFn: function(d) {
      if (!d) return;
      if (d.title) 编辑字段('title', d.title);
      if (d.genre) 编辑字段('genre', d.genre);
      if (d.imagery) 编辑字段('imagery', d.imagery);
      if (d.explicit) 编辑字段('explicit', d.explicit);
      var titleEl = document.getElementById(cfg.prefix + 'Title');
      if (titleEl) titleEl.value = 编辑状态.title || '';
      同步chips();
      toast('诗题建议已填入');
    }});
    registerAiField(cfg.aiFieldId, cfg.aiLabel, function() {
      var direction = ((document.getElementById(cfg.prefix + 'Direction')||{}).value || '').trim();
      var ctx = 共享参数上下文();
      if (direction) ctx += '\n方向：' + direction;
      var acrosticText = ((document.getElementById(cfg.prefix + 'Acrostic')||{}).value||'').trim();
      var promptName = acrosticText ? 'poetry_acrostic_gen' : cfg.promptName;
      var r = renderPrompt(promptName, { ctx: ctx, charCtx: 共享角色上下文(), acrostic: acrosticText ? 共享藏头上下文() : '' }); return { user: r.user, system: r.system };
    }, { fillFn: function(d) {
      if (!d) return;
      var s = 编辑状态;
      if (d.title) s.title = d.title;
      if (d.content) s.content = d.content;
      if (d.tags) s.tags = d.tags;
      if (d.form) s.form = d.form;
      if (d.genre) s.genre = d.genre;
      if (d.explicit) s.explicit = d.explicit;
      if (d.imagery) s.imagery = d.imagery;      // AI 生成的是提案：回填编辑器供修改，人确认后再保存
      var titleEl = document.getElementById(cfg.prefix + 'Title');
      if (titleEl) titleEl.value = s.title || '';
      var formEl = document.getElementById(cfg.prefix + 'Form');
      if (formEl) formEl.value = s.form || 默认诗体;
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
            form: s.form || 默认诗体, explicit: s.explicit || 默认露骨度,
            genre: s.genre || [], imagery: s.imagery || [],
            rhyme: s.rhyme || '', appreciation: s.appreciation || '',
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
      } else {
        next();
      }
    }});
    // 改编生成（创作页改编卡：原文 + 选项 → 回填编辑器；原文从经典库「去改编」带入）
    registerAiField(cfg.aiFieldId + 'Adapt', cfg.aiLabel + '改编', function() {
      var source = (document.getElementById(cfg.prefix + 'AdaptSource')||{}).value || '';
      var s = 编辑状态;
      if (!source.trim()) { toast('请先输入要改编的原文'); return null; }
      // 改编专用参数段：含体式（带样式参照）与模块独有选题，但不含露骨度（改编露骨度由改编卡「维持原度/污秽淫化」决定，避免两个露骨度指令冲突）
      var ctx = '';
      if (s.form && s.form !== '无') ctx += (cfg.formOptionsLabel || '体式') + '：' + s.form + (共享诗体解释表[s.form] ? '\n　' + 共享诗体解释表[s.form] : '') + '\n';
      if (模块独有选题 && s[模块独有选题.编辑键]) ctx += (模块独有选题.ctx标签 || 模块独有选题.label) + '：' + s[模块独有选题.编辑键] + '\n';
      if (s.genre && s.genre.length) ctx += '题材：' + s.genre.join('、') + '\n';
      if (s.imagery && s.imagery.length) ctx += '意象：' + s.imagery.join('、') + '\n';
      var acrosticText = ((document.getElementById(cfg.prefix + 'Acrostic')||{}).value||'').trim();
      var promptName = acrosticText ? 'poetry_acrostic_gen' : 'poetry_adapt_gen';
      var r = renderPrompt(promptName, {
        ctx: ctx,
        charCtx: 共享角色上下文(),
        acrostic: acrosticText ? 共享藏头上下文() : '',
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
      if (!(s.title || '').trim()) s.title = '改编' + (s.adaptSource || '').substring(0, 4);
      // 回填编辑器 DOM（不重渲染，保住焦点）
      var titleEl = document.getElementById(cfg.prefix + 'Title');
      if (titleEl) titleEl.value = s.title || '';
      var formEl = document.getElementById(cfg.prefix + 'Form');
      if (formEl) formEl.value = s.form || 默认诗体;
      var contentEl = document.getElementById(cfg.prefix + 'Content');
      if (contentEl) contentEl.value = s.content || '';
      同步chips();
      // 持久化：已建档直接写盘；未建档用新标题建档
      var data = {
        title: s.title, content: s.content || '', tags: s.tags || [],
        form: s.form || 默认诗体, explicit: s.explicit || 默认露骨度,
        genre: s.genre || [], imagery: s.imagery || [],
        rhyme: s.rhyme || '', appreciation: s.appreciation || '',
        adaptSource: s.adaptSource || '',
        adaptExplicit: s.adaptExplicit || '', adaptLen: s.adaptLen || '',
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
window.淫诗体模块工厂 = 淫诗体模块工厂;
if (!Store.yinShi) Store.yinShi = createStore('qingShi');
