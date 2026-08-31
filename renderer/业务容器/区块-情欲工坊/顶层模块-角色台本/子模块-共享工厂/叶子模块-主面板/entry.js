// 情欲工坊 · 角色台本 · 模块共享工厂
// 为 自述/诵读/经历/关系对话/辱骂/性辱骂 提供统一的 list/editor/AI 逻辑（以角色卡角色为核心，纯对白/独白生成）
// 创作界面与淫诗艳曲同构：作品信息 / 选题 / 角色素材 / AI 生成 四卡片式，无正文编辑区——AI 生成结果直接保存

function 角色台本工厂(cfg) {
  // cfg: { storeKey, containerId, viewContentId, prefix, windowPrefix, navLabelList, navLabelEdit,
  //         promptName, aiFieldId, aiLabel, 主题标签, 主题选项, 语气选项, 对象模式, 经历模式, 主题多选 }
  var 主题选项 = cfg.主题选项 || [];
  var 主题标签 = cfg.主题标签 || '主题';
  var 主题多选 = cfg.主题多选;    // 主题 chips 多选（如辱骂类型可组合多种）
  var 语气选项 = cfg.语气选项 || null;
  var 场合选项 = cfg.场合选项 || null;  // 场合/场景行（如 正在被操时 / 正在被调教时 / 当众对峙）
  var 双模式 = cfg.双模式 || null;      // 双模式（辱骂/性辱骂合并）：[{ key, label, promptName, 主题选项, 场合选项 }]
  var 双模式默认键 = cfg.默认模式 || (双模式 ? 双模式[0].key : '');  // 默认模式（辱骂默认性辱骂）
  var 对象模式 = cfg.对象模式;    // 关系对话/辱骂：对象人物行（输入 + 导入角色卡 + AI 提取关系）
  var 经历模式 = cfg.经历模式;    // 经历：经历列表行（角色卡性爱明细 / AI 提取）+ 选中经历

  // 主题值显示（多选时数组 join，单选时原样）
  function 主题显示(t) {
    if (Array.isArray(t)) return t.join('、');
    return t || '';
  }
  // 双模式：当前模式（编辑状态.kind 指定，缺省取第一个）
  function 当前模式() {
    if (!双模式) return null;
    var k = 编辑状态.kind || 双模式默认键;
    for (var i = 0; i < 双模式.length; i++) { if (双模式[i].key === k) return 双模式[i]; }
    return 双模式[0];
  }
  function 有效主题选项() { var m = 当前模式(); return m ? (m.主题选项 || []) : 主题选项; }
  function 有效场合选项() { var m = 当前模式(); return m ? (m.场合选项 || null) : 场合选项; }
  function 有效生成提示词() { var m = 当前模式(); return m ? m.promptName : cfg.promptName; }

  // 最少字数（创作页 AI 生成卡上的独立选项；默认 500，0 = 不限）
  var _最低字数 = 500;
  function 读取最少字数() { return _最低字数; }
  function 切换字数(v) {
    var n = Math.max(0, Math.floor(Number(v) || 0));
    _最低字数 = n;
    toast(n > 0 ? '最少字数：' + n + ' 字' : '最少字数：不限');
    var root = document.getElementById(cfg.viewContentId);
    if (root) {
      root.querySelectorAll('.tag-chip[data-minw]').forEach(function(c) {
        c.classList.toggle('tag-active', Number(c.getAttribute('data-minw')) === n);
      });
    }
  }

  var 导航 = [
    { id: 'list', label: cfg.navLabelList },
    { id: 'editor', label: cfg.navLabelEdit },
  ];
  var 当前视图 = 'list';
  var _editTitle = null;
  var 编辑状态 = {};
  var 创作防抖保存 = null;

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
      if (v === 'editor') { 新创作(); return; }
      切换视图(v);
    }); });
    switch (view) {
      case 'list': 渲染列表(vEl); break;
      case 'editor': 渲染编辑器(vEl); break;
    }
  }

  function 新创作() { _editTitle = null; 切换视图('editor'); }
  function 编辑项(title) { _editTitle = title; 切换视图('editor'); }
  function 删除项(title) { confirmDialog('确定删除「' + title + '」？', function(){ Store[cfg.storeKey].delete(title).then(function(){ toast('已删除'); 切换视图('list'); }); }); }

  // ===== 列表（角色筛选 chips + 卡片）=====
  var 列表角色筛选 = '全部';
  function 筛选角色(r) { 列表角色筛选 = r; 切换视图('list'); }

  function 渲染列表(el) {
    Store[cfg.storeKey].list().then(function(items) {
      items = items || [];
      var h = '<div class="mb-10"><button class="btn-new" onclick="' + cfg.windowPrefix + '新创作()">＋ 新建</button></div>';
      // 角色筛选行（有作品的角色）
      var chars = [];
      items.forEach(function(i) { if (i.char && chars.indexOf(i.char) < 0) chars.push(i.char); });
      chars.sort();
      var 角色筛选选项 = ['全部'].concat(chars);
      h += 筛选行('角色', 角色筛选选项, 列表角色筛选, cfg.windowPrefix + '筛选角色');
      var filtered = items;
      if (列表角色筛选 !== '全部') filtered = items.filter(function(i) { return i.char === 列表角色筛选; });
      if (!filtered.length) { h += '<div class="placeholder-text">暂无作品，点击「创作」生成</div>'; }
      else {
        filtered.forEach(function(item) {
          h += '<div class="n-card cur-ptr mb-6 p-10" onclick="' + cfg.windowPrefix + '阅读(\'' + escHtml(item.title) + '\')">';
          h += '<div class="fw-600 fs-14">' + escHtml(item.title) + '</div>';
          h += '<div class="mt-4 flex gap-4 flex-wrap">';
          if (item.char) h += '<span class="badge-tag">👤 ' + escHtml(item.char) + '</span>';
          if (item.theme) h += '<span class="badge-tag">' + escHtml(主题显示(item.theme)) + '</span>';
          if (item.kind) h += '<span class="badge-tag">' + escHtml(item.kind === '性' ? '💢 性辱骂' : '🗯 普通辱骂') + '</span>';
          if (item.scene) h += '<span class="badge-tag">📍 ' + escHtml(item.scene) + '</span>';
          if (item.tone) h += '<span class="badge-tag">' + escHtml(item.tone) + '</span>';
          if (item.target) h += '<span class="badge-tag">→ ' + escHtml(item.target) + '</span>';
          if (item.experience) h += '<span class="badge-tag" style="white-space:normal">📌 ' + escHtml(item.experience) + '</span>';
          h += '</div>';
          h += '<div class="text-muted text-sm mt-4" style="white-space:pre-wrap">' + escHtml(item.content||'').slice(0, 100) + '</div>';
          h += '<div class="mt-6 flex gap-4">';
          h += '<span class="btn-secondary btn-sm" onclick="event.stopPropagation();' + cfg.windowPrefix + '编辑项(\'' + escHtml(item.title) + '\')">✏️ 编辑</span>';
          h += '<span class="btn-secondary btn-sm c-error" onclick="event.stopPropagation();' + cfg.windowPrefix + '删除项(\'' + escHtml(item.title) + '\')">🗑 删除</span>';
          h += '</div></div>';
        });
      }
      el.innerHTML = h;
    });
  }

  // ===== 弹窗阅读（正文居中衬线排版）=====
  function 阅读(title) {
    Store[cfg.storeKey].get(title).then(function(item) {
      item = item || {};
      if (!item.content) { toast('该作品暂无正文'); return; }
      document.querySelectorAll('.ovl').forEach(function(o) { o.remove(); });
      var h = '';
      h += '<div class="reader-head">';
      h += '<span class="reader-title">📖 ' + escHtml(item.title || title) + '</span>';
      if (item.char) h += '<span class="reader-tag">👤 ' + escHtml(item.char) + '</span>';
      if (item.theme) h += '<span class="reader-tag">' + escHtml(主题显示(item.theme)) + '</span>';
      if (item.kind) h += '<span class="reader-tag">' + escHtml(item.kind === '性' ? '💢 性辱骂' : '🗯 普通辱骂') + '</span>';
      if (item.scene) h += '<span class="reader-tag">📍 ' + escHtml(item.scene) + '</span>';
      if (item.tone) h += '<span class="reader-tag">' + escHtml(item.tone) + '</span>';
      if (item.target) h += '<span class="reader-tag">→ ' + escHtml(item.target) + '</span>';
      h += '</div>';
      h += '<div class="reader-body">';
      h += '<div class="reader-poem-title">' + escHtml(item.title || title) + '</div>';
      h += '<div class="reader-poem-text">' + escHtml(item.content || '') + '</div>';
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
      var text = (item.title || title) + (item.char ? ' · ' + item.char : '') + (item.theme ? ' · ' + 主题显示(item.theme) : '') + (item.scene ? ' · ' + item.scene : '') + '\n' + (item.content || '');
      复制到剪贴板(text).then(function(ok){ toast(ok ? '已复制全文' : '复制失败'); });
    });
  }

  // 通用规则块：集中承载各生成提示词共用的规则（只说角色的话 / 注意状态与语气词骚话），
  // 由工厂在每次生成时统一追加到提示词末尾，不在各提示词里重复设置
  var 通用规则块 = '【通用规则】\n'
    + '1. 只生成角色说的话：内容必须是角色们口中说出的话语本身，禁止任何叙述者视角的情景、动作、神态、心理、音效描写；如需交代场景与处境，由角色自己在话语中带出。\n'
    + '2. 注意该角色当前的状态与处境，话语中适当加入语气词与符合身份的骚话。\n'
    + '3. 按句分行：每句话自成一行，一句话结束即换行，一句接一句逐行排列，不要连成一大段落。\n'
    + '4. 注意角色的年龄层次，语言风格、断句、语气词要随年龄明显不同，贴合角色的年龄。\n'
    + '5. 保持连续感：上下句要衔接自然，有承接、递进、因果，语气连贯，像一段不间断的话语流，勿使各句各自断裂、前后跳跃。\n'
    + '6. 若该角色要面对多个对象人物（涉及多人），该角色要逐一对着每个对象说话、都照顾到——是主角分别向每位对象开口、把话分头说给每个人，而非让对象人物自己也开口说话。\n'
    + '7. 正文务必达到所设的最小字数，宁长勿短，不要因篇幅短而省略内容。\n';

  // ===== 创作页现代化样式（作用域在 .rsc-creator 下，不改动全局类名，避免影响 chip 选中/保存逻辑）=====
  var 角色台本样式文本 = ''
    + '.rsc-creator{font-family:var(--font-sans);display:flex;flex-direction:column;gap:12px;width:100%;}'
    + '.rsc-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}'
    + '@media (max-width:900px){.rsc-grid{grid-template-columns:1fr;}}'
    + '.rsc-sub{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px;min-height:120px;}'
    + '.rsc-sub-head{display:flex;align-items:center;gap:6px;font-size:11px;letter-spacing:1px;color:var(--fg2);font-weight:600;margin-bottom:10px;}'
    + '.rsc-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:10px;}'
    + '.rsc-row .lbl{font-size:11px;color:var(--fg3);font-weight:600;width:48px;flex-shrink:0;letter-spacing:1px;}'
    + '.rsc-detail{font-size:11px;line-height:1.8;color:var(--fg2);background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:8px 10px;white-space:pre-wrap;max-height:420px;overflow-y:auto;}'
    + '.rsc-empty{font-size:11px;color:var(--fg3);padding:2px 0;}'
    + '.rsc-creator .mb-6{margin-bottom:12px;}'
    + '.rsc-creator .n-card{border-radius:12px;padding:14px 16px;background:linear-gradient(180deg,var(--card),var(--bg2));border:1px solid var(--border);box-shadow:0 2px 12px rgba(0,0,0,.22);transition:border-color .2s,box-shadow .2s;margin-bottom:0;}'
    + '.rsc-creator .n-card:hover{border-color:var(--accent2);box-shadow:0 4px 18px rgba(0,0,0,.3);}'
    + '.rsc-creator .tag-chip{border-radius:999px;padding:4px 11px;background:var(--bg2);border:1px solid var(--border);letter-spacing:.5px;transition:all .15s;}'
    + '.rsc-creator .tag-chip:hover{border-color:var(--accent2);color:var(--accent2);transform:translateY(-1px);}'
    + '.rsc-creator .tag-chip.tag-active{background:linear-gradient(135deg,var(--accent2),var(--accent));color:var(--bg);border-color:transparent;}'
    + '.rsc-creator .llm-input,.rsc-creator .llm-input-lg{border-radius:8px;background:var(--bg2);transition:border-color .15s,box-shadow .15s;}'
    + '.rsc-creator .llm-input:focus,.rsc-creator .llm-input-lg:focus{border-color:var(--accent2);box-shadow:0 0 0 2px var(--accent-dim);}'
    + '.rsc-creator .ai-suggest-btn{width:32px;height:32px;border-radius:8px;flex-shrink:0;}'
    + '.rsc-creator .btn-sm{background:var(--bg2);color:var(--fg);border:1px solid var(--border);border-radius:8px;padding:5px 12px;cursor:pointer;flex-shrink:0;font-family:var(--font-sans);letter-spacing:.5px;transition:all .15s;}'
    + '.rsc-creator .btn-sm:hover{border-color:var(--accent2);color:var(--accent2);transform:translateY(-1px);}'
    + '.rsc-creator .btn{border-radius:8px;}'
    + '.rsc-creator .btn.btn-primary{border-radius:10px;background:linear-gradient(135deg,var(--accent2),var(--accent));color:var(--bg);border:none;box-shadow:0 3px 14px rgba(212,136,158,.3);}'
    + '.rsc-creator .btn.btn-primary:hover{filter:brightness(1.08);transform:translateY(-1px);box-shadow:0 5px 18px rgba(212,136,158,.4);}'
    + '.rsc-creator .ai-field-row{border-radius:8px;}';
  var 角色台本样式已注入 = false;
  function 注入角色台本样式() {
    if (角色台本样式已注入) return;
    角色台本样式已注入 = true;
    if (typeof document === 'undefined' || !document.head || typeof document.createElement !== 'function' || typeof document.getElementById !== 'function') return;
    var id = 'role-script-creator-style';
    if (document.getElementById(id)) return;
    var st = document.createElement('style');
    st.id = id;
    st.textContent = 角色台本样式文本;
    document.head.appendChild(st);
  }

  // ===== 即时保存：标题确定即建档，字段改动防抖写盘 =====
  function 自动建档() {
    var t = (编辑状态.title || '').trim();
    if (_editTitle || !t) return Promise.resolve(false);
    return Store[cfg.storeKey].list().then(function(items) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].title === t) { toast('同名作品已存在，草稿未建立'); return false; }
      }
      _editTitle = t;
      var data = 当前数据快照();
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
        var data = 当前数据快照();
        data.title = t;
        Store[cfg.storeKey].save(t, data).then(function(){ _editTitle = t; });
      });
      return;
    }
    Store[cfg.storeKey].get(_editTitle).then(function(m) {
      m = m || {};
      Object.assign(m, 当前数据快照());
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
  function 当前数据快照() {
    var d = {};
    Object.assign(d, 编辑状态);
    if (typeof d.tags === 'string') d.tags = d.tags.split('、').map(function(x){return x.trim();}).filter(Boolean);
    return d;
  }

  // ===== 角色选择（走全局角色卡选择器 stcdOpenCharPicker）=====
  function 角色名(c) { var b = c && c.identity && c.identity.basicInfo || {}; return b.name || '未命名'; }
  function 自动标题() {
    if ((编辑状态.title || '').trim()) return;
    var t = (编辑状态.char || '');
    var themeText = 主题显示(编辑状态.theme);
    if (themeText) t = t ? t + ' · ' + themeText : themeText;
    if (!t.trim()) return;
    编辑状态.title = t;
    var ti = document.getElementById(cfg.prefix + 'Title');
    if (ti) ti.value = t;
  }
  function 打开角色选择() {
    if (typeof stcdOpenCharPicker !== 'function') { toast('角色卡选择器不可用'); return; }
    stcdOpenCharPicker('', { onPick: function(data) {
      if (!data) { toast('未选择角色'); return; }
      应用角色(data);
    }});
  }
  function 应用角色(card) {
    card = card || {};
    var name = 角色名(card);
    var 切换不同角色 = (编辑状态.char !== name);   // 是否真的切换到了另一个角色
    编辑状态.char = name;
    编辑状态.charRef = JSON.parse(JSON.stringify(card));
    if (name) 自动标题();
    编辑字段('char', name);
    var cd = document.getElementById(cfg.prefix + 'CharDisplay');
    if (cd) cd.innerHTML = '👤 ' + escHtml(name);
    // 切换到另一个角色时：先清空上一角色的经历/关系/选中，再加载新角色存档
    if (切换不同角色) {
      编辑状态.experiences = [];
      编辑状态.relations = [];
      编辑状态.selectedExps = [];
      编辑状态.targets = [];
    }
    // 加载该角色本地存档（关系/经历 全板块通用；对象人物/经历 默认不选中，尊重作品自身选择）
    读取角色提取().then(function(d) {
      if (d) {
        if (Array.isArray(d.experiences) && d.experiences.length) 编辑状态.experiences = d.experiences.slice();
        if (Array.isArray(d.relations) && d.relations.length) 编辑状态.relations = d.relations.slice();
      }
      // 无存档经历时：把角色卡自带性爱明细落盘为本地经历
      if ((!编辑状态.experiences || !编辑状态.experiences.length) && 经历模式 && card.identity && card.identity.experience && Array.isArray(card.identity.experience.sexualDetails) && card.identity.experience.sexualDetails.length) {
        编辑状态.experiences = card.identity.experience.sexualDetails.slice();
        保存角色提取({ experiences: 编辑状态.experiences });
      }
      刷新经历chips();
      刷新关系chips();
      刷新经历详情();
      刷新关系详情();
    });
  }
  function 选择角色(name) {
    name = name || '';
    if (!name) { 编辑状态.char = ''; 编辑状态.charRef = null; 刷新经历chips(); 刷新关系chips(); 刷新关系详情(); 刷新经历详情(); return; }
    Store.character.get(name).then(function(card) { 应用角色(card || { identity: { basicInfo: { name: name } } }); })
      .catch(function() { 应用角色({ identity: { basicInfo: { name: name } } }); });
  }
  // ===== 本地存档：角色关系/经历/对象人物（全板块通用，可重新生成覆盖）=====
  var 角色提取保存队列 = Promise.resolve();
  function 读取角色提取() {
    var k = 编辑状态.char || '';
    if (!k || typeof Store.roleExtract === 'undefined' || !Store.roleExtract.get) return Promise.resolve(null);
    return Store.roleExtract.get(k).then(function(d) { return d || null; }).catch(function() { return null; });
  }
  // 串行保存：避免「读-改-写」竞态导致连续写入互相覆盖
  function 保存角色提取(数据) {
    var k = 编辑状态.char || '';
    if (!k || typeof Store.roleExtract === 'undefined' || !Store.roleExtract.save) return Promise.resolve(false);
    角色提取保存队列 = 角色提取保存队列.then(function() {
      return 读取角色提取().then(function(old) {
        var merged = old || { title: k, char: k };
        Object.keys(数据).forEach(function(key) { merged[key] = 数据[key]; });
        merged.updatedAt = new Date().toISOString();
        return Store.roleExtract.save(k, merged);
      });
    });
    return 角色提取保存队列;
  }
  // ===== 角色经历：经历 chips（多选：点击加入/移出，多个可同时高亮；完整显示不截断）=====
  function 选中经历表() {
    return Array.isArray(编辑状态.selectedExps) ? 编辑状态.selectedExps : (编辑状态.selectedExps = []);
  }
  function 刷新经历chips() {
    var box = document.getElementById(cfg.prefix + 'ExpChips');
    if (!box) return;
    var arr = 编辑状态.experiences || [];
    if (!arr.length) { box.innerHTML = '<span class="rsc-empty">暂无经历 —— 点 🤖 提取或自制</span>'; return; }
    var sel = 选中经历表();
    var h = '';
    arr.forEach(function(e, i) {
      var t = String(e || '');
      h += '<span class="tag-chip' + (sel.indexOf(t) >= 0 ? ' tag-active' : '') + '" style="display:inline-block;cursor:pointer;white-space:normal;text-align:left;line-height:1.5;max-width:100%" onclick="' + cfg.windowPrefix + '选择经历(' + i + ')">' + escHtml(t) + '</span>';
    });
    box.innerHTML = h;
  }
  function 选择经历(i) {
    var e = (编辑状态.experiences && 编辑状态.experiences[i]) || '';
    var sel = 选中经历表();
    var j = sel.indexOf(e);
    if (j >= 0) sel.splice(j, 1); else sel.push(e);
    编辑字段('selectedExps', sel.slice());
    刷新经历chips();
    刷新经历详情();
  }

  // ===== 对象人物：关系人物（多选：点击加入/移出，多个可同时高亮；显示所有选中详情）=====
  function 选中对象表() {
    return Array.isArray(编辑状态.targets) ? 编辑状态.targets : (编辑状态.targets = []);
  }
  function 刷新关系详情() {
    var el = document.getElementById(cfg.prefix + 'RelDetail');
    if (!el) return;
    var sel = 选中对象表();
    if (!sel.length) { el.innerHTML = '<div class="rsc-empty">选中关系人物后此处显示详情</div>'; return; }
    var h = '';
    sel.forEach(function(name) {
      var rel = null;
      (编辑状态.relations || []).forEach(function(r) { if (r && r.name === name) rel = r; });
      if (!rel) return;
      h += '<span class="fw-600">' + escHtml(rel.name) + '</span>' + (rel.relation ? '（' + escHtml(rel.relation) + '）' : '');
      if (rel.style) h += '\n语言风格：' + escHtml(rel.style);
      if (rel.events) h += '\n交集经历：' + escHtml(rel.events);
      if (rel.sex) h += '\n性爱经历：' + escHtml(rel.sex);
      h += '\n\n';
    });
    el.innerHTML = h.trim();
  }
  // 经历详情（多选：显示所有选中经历全文）
  function 刷新经历详情() {
    var el = document.getElementById(cfg.prefix + 'ExpDetail');
    if (!el) return;
    var sel = 选中经历表();
    if (!sel.length) { el.innerHTML = '<div class="rsc-empty">选中经历后此处显示全文</div>'; return; }
    el.innerHTML = sel.map(function(e) { return escHtml(去序号(e)); }).join('\n\n');
  }
  function 选择关系(name) {
    var sel = 选中对象表();
    var i = sel.indexOf(name);
    if (i >= 0) sel.splice(i, 1); else sel.push(name);
    编辑字段('targets', sel.slice());
    刷新关系chips();
    刷新关系详情();
  }
  function 刷新关系chips() {
    var box = document.getElementById(cfg.prefix + 'RelChips');
    if (!box) return;
    var arr = 编辑状态.relations || [];
    var sel = 选中对象表();
    var h = '';
    arr.forEach(function(r) {
      var n = (r && r.name) || '';
      if (!n) return;
      var label = r.relation ? n + '（' + r.relation + '）' : n;
      h += '<span class="tag-chip' + (sel.indexOf(n) >= 0 ? ' tag-active' : '') + '" style="cursor:pointer" onclick="' + cfg.windowPrefix + '选择关系(\'' + escHtml(n) + '\')">' + escHtml(label) + '</span>';
    });
    box.innerHTML = h || '<span class="rsc-empty">暂无关系人物 —— 点 🤖 提取或自制人物</span>';
  }
  function 设置对象(name) {
    name = (name || '').trim();
    var sel = 选中对象表();
    if (name) { if (sel.indexOf(name) < 0) sel.push(name); } else { sel.length = 0; }
    编辑字段('targets', sel.slice());
    保存角色提取({ targets: sel.slice() });
    刷新关系chips();
    刷新关系详情();
  }

  // ===== 创作页（五卡片式：作品信息 / 选题 / 灵感素材 / AI 生成 / 正文）=====
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
  function 渲染编辑器(el) {
    if (_editTitle) {
      Store[cfg.storeKey].get(_editTitle).then(function(data) { 渲染表单(el, data||{}); });
    } else {
      渲染表单(el, { title:'', char:'', charRef:null, theme:'', tone:'', target:'', targetRef:null, experience:'', experiences:[], content:'', tags:[] });
    }
  }
  function 渲染表单(el, data) {
    注入角色台本样式();
    编辑状态 = {
      title: data.title||'', char: data.char||'', charRef: data.charRef||null,
      kind: data.kind || 双模式默认键,
      theme: 主题多选 ? (Array.isArray(data.theme) ? data.theme.slice() : (data.theme ? [data.theme] : [])) : (data.theme||''),
      tone: data.tone||'', scene: data.scene||'',
      target: data.target||'', targetRef: data.targetRef||null,
      targets: Array.isArray(data.targets) ? data.targets.slice() : (data.target ? [data.target] : []),
      experience: data.experience||'', experiences: Array.isArray(data.experiences) ? data.experiences : [],
      selectedExps: Array.isArray(data.selectedExps) ? data.selectedExps.slice() : (data.experience ? [data.experience] : []),
      relations: Array.isArray(data.relations) ? data.relations : [],
      content: data.content||'', tags: Array.isArray(data.tags) ? data.tags : [],
    };
    var s = 编辑状态;
    var h = '<div class="rsc-creator">';
    // ① 作品信息卡：角色 + 标题
    h += '<div class="n-card p-10 mb-6">';
    h += 卡片头('📋', '作品信息', '输入即自动保存');
    h += '<div class="ai-field-row">';
    h += '<button class="btn-sm" style="flex-shrink:0" onclick="' + cfg.windowPrefix + '打开角色选择()" title="从全局角色卡选择">🎭 选择角色</button>';
    h += '<span id="' + cfg.prefix + 'CharDisplay" style="flex:1;font-size:12px;color:var(--fg2);padding:6px 4px">' + (s.char ? '👤 ' + escHtml(s.char) : '未选择角色') + '</span>';
    h += '<input class="llm-input" id="' + cfg.prefix + 'Title" placeholder="标题（失焦自动建档；选好角色与主题后自动生成）" value="' + escHtml(s.title||'') + '" style="flex:2" onchange="' + cfg.windowPrefix + '编辑字段(\'title\',this.value)">';
    h += '</div>';
    h += '</div>';
    // ② 角色信息卡：🔗 对象人物 + 🗂 角色经历（两栏同构子面板 · 全板块通用 · 提取/选择/详情 · 本地存档）
    h += '<div class="n-card p-10 mb-6">';
    h += 卡片头('📁', '角色信息', '对象人物 / 经历 · 提取后本地存档，选中即显示详情');
    h += '<div class="rsc-grid">';
    // 左：🔗 对象人物
    h += '<div class="rsc-sub">';
    h += '<div class="rsc-sub-head">🔗 对象人物</div>';
    h += '<div class="rsc-row"><span id="' + cfg.prefix + 'RelChips" style="flex:1;display:flex;gap:4px;flex-wrap:wrap;max-height:320px;overflow-y:auto"></span>'
      + '<button class="btn-sm" onclick="openAiGenPanel(\'' + cfg.aiFieldId + 'ExtractRel\')" title="AI 提取该角色的关系人物（级别关系/语言风格/交集经历/性爱经历）">🤖 提取</button></div>';
    h += '<div class="rsc-row"><input class="llm-input" id="' + cfg.prefix + 'PersonReq" placeholder="自制人物（描述要设定的人物，AI 生成）" style="flex:1;min-width:130px">'
      + '<button class="ai-suggest-btn" onclick="openAiGenPanel(\'' + cfg.aiFieldId + 'CustomRel\')" title="AI 按你的要求设定一个假设人物">🤖</button></div>';
    h += '<div id="' + cfg.prefix + 'RelDetail" class="rsc-detail"></div>';
    h += '</div>';
    // 右：🗂 角色经历
    h += '<div class="rsc-sub">';
    h += '<div class="rsc-sub-head">🗂 角色经历</div>';
    h += '<div class="rsc-row"><span id="' + cfg.prefix + 'ExpChips" style="flex:1;display:flex;gap:4px;flex-wrap:wrap;max-height:320px;overflow-y:auto"></span>'
      + '<button class="btn-sm" onclick="openAiGenPanel(\'' + cfg.aiFieldId + 'Extract\')" title="AI 提取/重新生成该角色的性爱经历，结果本地存档">🤖 提取</button></div>';
    h += '<div class="rsc-row"><input class="llm-input" id="' + cfg.prefix + 'CustomReq" placeholder="自制经历（给出要求，AI 生成）" style="flex:1;min-width:130px">'
      + '<button class="ai-suggest-btn" onclick="openAiGenPanel(\'' + cfg.aiFieldId + 'Custom\')" title="AI 按你的要求创作一段经历">🤖</button></div>';
    h += '<div id="' + cfg.prefix + 'ExpDetail" class="rsc-detail"></div>';
    h += '</div>';
    h += '</div>'; // rsc-grid
    h += '</div>'; // 角色信息卡
    // ③ 选题卡：模式（双模式）/ 主题 / 语气 / 场合 / 随机灵感
    h += '<div class="n-card p-10 mb-6">';
    h += 卡片头('🎯', '选题', 'AI 可一键生成');
    if (双模式) h += 参数行('模式', 双模式.map(function(m) {
      return '<span class="tag-chip' + (s.kind === m.key ? ' tag-active' : '') + '" data-kind="' + m.key + '" onclick="' + cfg.windowPrefix + '切换模式(\'' + m.key + '\');' + cfg.windowPrefix + '同步chips()">' + m.label + '</span>';
    }).join(''));
    h += 参数行(主题标签, 有效主题选项().map(function(t) {
      return '<span class="tag-chip' + (s.theme === t ? ' tag-active' : '') + '" data-theme="' + t + '" onclick="' + cfg.windowPrefix + '切换主题(\'' + t + '\');' + cfg.windowPrefix + '同步chips()">' + t + '</span>';
    }).join(''));
    if (语气选项) h += 参数行('语气', 语气选项.map(function(t) {
      return '<span class="tag-chip' + (s.tone === t ? ' tag-active' : '') + '" data-tone="' + t + '" onclick="' + cfg.windowPrefix + '切换语气(\'' + t + '\');' + cfg.windowPrefix + '同步chips()">' + t + '</span>';
    }).join(''));
    if (有效场合选项()) h += 参数行('场合', 有效场合选项().map(function(t) {
      return '<span class="tag-chip' + (s.scene === t ? ' tag-active' : '') + '" data-scene="' + t + '" onclick="' + cfg.windowPrefix + '切换场合(\'' + t + '\');' + cfg.windowPrefix + '同步chips()">' + t + '</span>';
    }).join(''));
    h += 参数行('灵感', '<button class="btn-sm" onclick="' + cfg.windowPrefix + '随机灵感()">🎲 随机灵感</button>');
    h += '</div>';
    // ④ AI 生成卡
    h += '<div class="n-card p-10 mb-6">';
    h += 卡片头('🚀', 'AI 生成', '按当前参数生成 · 结果直接保存');
    var 字数预设 = [0, 300, 500, 800, 1000, 2000];
    var 当前字数 = 读取最少字数();
    var 字数chips = 字数预设.map(function(v) {
      return '<span class="tag-chip' + (当前字数 === v ? ' tag-active' : '') + '" data-minw="' + v + '" onclick="' + cfg.windowPrefix + '切换字数(' + v + ')">' + (v ? v + ' 字' : '不限') + '</span>';
    }).join('');
    字数chips += '<input type="number" class="llm-input" id="' + cfg.prefix + 'MinWords" value="' + 当前字数 + '" min="0" step="50" style="width:90px;font-size:11px" onchange="' + cfg.windowPrefix + '切换字数(this.value)">';
    h += 参数行('最少字数', 字数chips);
    h += '<div class="mb-6">';
    h += '<textarea class="llm-input llm-input-lg" id="' + cfg.prefix + 'Direction" placeholder="方向（可选，如：要带哭腔、要淫靡一些、要文雅一点）" style="width:100%;height:56px;resize:vertical"></textarea>';
    h += '</div>';
    h += '<button class="btn btn-primary" style="width:100%;padding:10px 18px;font-size:13px" onclick="openAiGenPanel(\'' + cfg.aiFieldId + '\')">🚀 AI 生成</button>';
    h += '</div>';
    el.innerHTML = h;
    // 已有角色：加载角色卡与本地存档（关系/经历/对象人物）；新作品则等待用户点「选择角色」
    if (s.char) {
      选择角色(s.char);
    } else {
      刷新经历chips();
    }
    刷新关系chips();
    刷新经历详情();
  }

  // ===== chips 交互 =====
  function 同步chips() {
    var root = document.getElementById(cfg.viewContentId);
    if (!root) return;
    root.querySelectorAll('.tag-chip').forEach(function(c) {
      if (c.hasAttribute('data-kind')) c.classList.toggle('tag-active', 编辑状态.kind === c.getAttribute('data-kind'));
      else if (c.hasAttribute('data-theme')) {
        if (主题多选) {
          var arr = Array.isArray(编辑状态.theme) ? 编辑状态.theme : [];
          c.classList.toggle('tag-active', arr.indexOf(c.getAttribute('data-theme')) >= 0);
        } else {
          c.classList.toggle('tag-active', 编辑状态.theme === c.getAttribute('data-theme'));
        }
      }
      else if (c.hasAttribute('data-tone')) c.classList.toggle('tag-active', 编辑状态.tone === c.getAttribute('data-tone'));
      else if (c.hasAttribute('data-scene')) c.classList.toggle('tag-active', 编辑状态.scene === c.getAttribute('data-scene'));
    });
  }
  function 切换主题(t) {
    if (主题多选) {
      var arr = Array.isArray(编辑状态.theme) ? 编辑状态.theme : [];
      arr = arr.indexOf(t) >= 0 ? arr.filter(function(x){ return x !== t; }) : arr.concat([t]);
      编辑状态.theme = arr;
    } else {
      编辑状态.theme = (编辑状态.theme === t) ? '' : t;
    }
    自动标题();
    编辑字段('theme', 编辑状态.theme);
  }
  function 切换语气(t) {
    编辑状态.tone = (编辑状态.tone === t) ? '' : t;
    编辑字段('tone', 编辑状态.tone);
  }
  function 切换场合(t) {
    编辑状态.scene = (编辑状态.scene === t) ? '' : t;
    编辑字段('scene', 编辑状态.scene);
  }
  function 切换模式(k) {
    var m = null;
    (双模式 || []).forEach(function(x) { if (x.key === k) m = x; });
    if (!m) return;
    编辑状态.kind = k;
    // 清掉新模式下不存在的主题/场合
    if (m.主题选项 && 编辑状态.theme) {
      var arr = Array.isArray(编辑状态.theme) ? 编辑状态.theme : [编辑状态.theme];
      编辑状态.theme = arr.filter(function(t) { return m.主题选项.indexOf(t) >= 0; });
      if (!编辑状态.theme.length) 编辑状态.theme = 主题多选 ? [] : '';
    }
    if (m.场合选项 && 编辑状态.scene && m.场合选项.indexOf(编辑状态.scene) < 0) 编辑状态.scene = '';
    自动标题();
    编辑字段('kind', k);
    // 重渲染表单以切换主题/场合 chips（保留其余状态）
    var vEl = document.getElementById(cfg.viewContentId);
    if (vEl) 渲染表单(vEl, 编辑状态);
  }
  function 随机灵感() {
    // ① 对象人物（随机选一个，替换当前选择）
    var 随机对象名 = '';
    if (编辑状态.relations && 编辑状态.relations.length) {
      var rel = 编辑状态.relations[Math.floor(Math.random() * 编辑状态.relations.length)];
      if (rel && rel.name) { 随机对象名 = rel.name; 编辑状态.targets = [rel.name]; }
      else { 编辑状态.targets = []; }
    } else { 编辑状态.targets = []; }
    编辑字段('targets', (编辑状态.targets || []).slice());
    刷新关系chips();
    刷新关系详情();
    // ② 对象经历（随机选一条，替换当前选择）
    if (编辑状态.experiences && 编辑状态.experiences.length) {
      var ei = Math.floor(Math.random() * 编辑状态.experiences.length);
      编辑状态.selectedExps = [编辑状态.experiences[ei]];
    } else { 编辑状态.selectedExps = []; }
    编辑字段('selectedExps', (编辑状态.selectedExps || []).slice());
    刷新经历chips();
    刷新经历详情();
    // ③ 主题/语气/场合（随机）
    var 当前主题选项 = 有效主题选项();
    if (主题多选) {
      var picks = [];
      if (当前主题选项.length) picks.push(当前主题选项[Math.floor(Math.random() * 当前主题选项.length)]);
      if (当前主题选项.length > 1 && Math.random() < 0.6) picks.push(当前主题选项[Math.floor(Math.random() * 当前主题选项.length)]);
      编辑状态.theme = picks;
    } else if (当前主题选项.length) {
      编辑状态.theme = 当前主题选项[Math.floor(Math.random() * 当前主题选项.length)];
    }
    if (语气选项 && 语气选项.length) 编辑状态.tone = 语气选项[Math.floor(Math.random() * 语气选项.length)];
    var 当前场合选项 = 有效场合选项();
    if (当前场合选项 && 当前场合选项.length) 编辑状态.scene = 当前场合选项[Math.floor(Math.random() * 当前场合选项.length)];
    自动标题();
    编辑字段('theme', 编辑状态.theme);
    编辑字段('tone', 编辑状态.tone);
    编辑字段('scene', 编辑状态.scene);
    同步chips();
    toast('灵感已填入：' + (主题显示(编辑状态.theme)||'') + (编辑状态.tone ? ' · ' + 编辑状态.tone : '') + (编辑状态.scene ? ' · ' + 编辑状态.scene : '') + (随机对象名 ? ' · 对象：' + 随机对象名 : '') + ((编辑状态.selectedExps||[]).length ? ' · 经历' : ''));
  }

  // ===== AI 提示词组装 =====
  function 角色上下文() {
    var ref = 编辑状态.charRef;
    if (!ref) return '';
    return (typeof window.角色卡全部 === 'function') ? 角色卡全部(ref) : JSON.stringify(ref || {});
  }
  function 参数上下文() {
    var ctx = '';
    if (编辑状态.char) ctx += '角色：' + 编辑状态.char + '\n';
    if (编辑状态.theme && (主题多选 ? 编辑状态.theme.length : 编辑状态.theme)) ctx += 主题标签 + '：' + 主题显示(编辑状态.theme) + '\n';
    if (编辑状态.tone) ctx += '语气：' + 编辑状态.tone + '\n';
    if (编辑状态.scene) ctx += '场合：' + 编辑状态.scene + '\n';
    if (对象模式 && (编辑状态.targets || []).length) ctx += '对象人物：' + (编辑状态.targets || []).join('、') + '\n';
    var direction = ((document.getElementById(cfg.prefix + 'Direction')||{}).value || '').trim();
    if (direction) ctx += '方向：' + direction + '\n';
    // 创作卡上的最少字数选项（默认 500）
    var minW = 读取最少字数();
    if (minW > 0) ctx += '最少字数：正文不少于 ' + minW + ' 字，宁长勿短\n';
    return ctx;
  }
  // 角色素材上下文：只注入「当前选中」的对象人物与该条经历（尊重点选，不再全量倾倒）
  function 去序号(s) { return String(s || '').replace(/^\s*\d+[.、．]\s*/, ''); }
  function 角色素材上下文() {
    var parts = [];
    var sel = 选中对象表();
    var selExp = 选中经历表();
    // 对象人物（仅选中的那些；含本地存档的 级别关系/语言风格/交集经历/性爱经历）
    if (对象模式 && sel.length) {
      var rels = [];
      sel.forEach(function(name) {
        var rel = null;
        (编辑状态.relations || []).forEach(function(r) { if (r && r.name === name) rel = r; });
        if (rel) rels.push(rel);
      });
      var ts = [];
      rels.forEach(function(rel) {
        var t = rel.name + (rel.relation ? '（' + rel.relation + '）' : '');
        if (rel.style) t += '\n　语言风格：' + rel.style;
        if (rel.events) t += '\n　交集经历：' + rel.events;
        if (rel.sex) t += '\n　性爱经历：' + rel.sex;
        ts.push(t);
      });
      if (ts.length) parts.push('【对象人物】' + ts.join('\n\n'));
    }
    // 角色经历（仅选中的那些，剥掉起始序号）
    if (selExp.length) {
      parts.push('【角色经历】' + selExp.map(function(e) { return '・ ' + 去序号(e); }).join('\n'));
    }
    return parts.length ? '\n\n' + parts.join('\n\n') : '';
  }

  // ===== AI 字段注册 =====
  if (typeof registerAiField !== 'undefined') {
    registerAiField(cfg.aiFieldId, cfg.aiLabel, function() {
      var vars = { ctx: 参数上下文(), charCtx: 角色上下文() };
      if (经历模式) vars.experience = 选中经历表().map(function(e) { return 去序号(e); }).join('\n');
      var r = renderPrompt(有效生成提示词(), vars);
      // 统一追加：角色素材上下文（选中对象/经历）+ 通用规则块
      r.user = (r.user || '') + 角色素材上下文() + '\n\n' + 通用规则块;
      return r;
    }, { fillFn: function(d) {
      if (!d) return;
      var s = 编辑状态;
      if (d.title) s.title = d.title;
      if (d.theme) s.theme = (主题多选 && typeof d.theme === 'string') ? [d.theme] : d.theme;
      if (d.content) s.content = d.content;
      if (d.tags) s.tags = d.tags;
      var titleEl = document.getElementById(cfg.prefix + 'Title');
      if (titleEl) titleEl.value = s.title || '';
      var contentEl = document.getElementById(cfg.prefix + 'Content');
      if (contentEl) contentEl.value = s.content || '';
      同步chips();
      var newTitle = (s.title || '').trim();
      if (!newTitle) {
        s.title = (s.char || '角色') + ' · ' + (s.theme || '未命名');
        newTitle = s.title;
        var titleEl2 = document.getElementById(cfg.prefix + 'Title');
        if (titleEl2) titleEl2.value = s.title;
      }
      var next = function() {
        if (_editTitle) {
          Store[cfg.storeKey].get(_editTitle).then(function(m) {
            m = m || {}; Object.assign(m, 当前数据快照());
            Store[cfg.storeKey].save(_editTitle, m).then(function(){});
          });
        } else {
          Store[cfg.storeKey].save(s.title, 当前数据快照()).then(function(){ _editTitle = s.title; });
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
    // 经历提取（全板块通用；可重新生成覆盖本地存档）
    registerAiField(cfg.aiFieldId + 'Extract', cfg.aiLabel + '·经历提取', function() {
      if (!编辑状态.charRef) { toast('请先选择角色'); return null; }
      return renderPrompt('role_experience_extract', { charCtx: 角色上下文() });
    }, { fillFn: function(d) {
      if (!d || !Array.isArray(d.experiences)) { toast('提取结果为空'); return; }
      编辑状态.experiences = d.experiences;
      编辑状态.selectedExps = [];   // 重新提取后重置选中
      编辑字段('selectedExps', []);
      刷新经历chips();
      刷新经历详情();
      保存角色提取({ experiences: d.experiences });
      toast('已提取 ' + d.experiences.length + ' 段性爱经历，已本地存档');
    }});
    // 自制经历（全板块通用；AI 按用户要求创作一段经历，加入列表并本地存档）
    registerAiField(cfg.aiFieldId + 'Custom', cfg.aiLabel + '·自制经历', function() {
      var req = ((document.getElementById(cfg.prefix + 'CustomReq')||{}).value || '').trim();
      if (!req) { toast('请先填写经历要求'); return null; }
      return renderPrompt('role_experience_custom_gen', { charCtx: 角色上下文(), req: req });
    }, { fillFn: function(d) {
      if (!d || !d.experience) { toast('生成结果为空'); return; }
      编辑状态.experiences = (Array.isArray(编辑状态.experiences) ? 编辑状态.experiences : []).concat([d.experience]);
      var sel = 选中经历表();
      if (sel.indexOf(d.experience) < 0) sel.push(d.experience);
      编辑字段('selectedExps', sel.slice());
      刷新经历chips();
      刷新经历详情();
      保存角色提取({ experiences: 编辑状态.experiences });
      toast('自制经历已加入并本地存档');
    }});
    // 关系提取（全板块通用；可重新生成覆盖本地存档；级别关系/语言风格/交集经历/性爱经历）
    registerAiField(cfg.aiFieldId + 'ExtractRel', cfg.aiLabel + '·关系提取', function() {
      if (!编辑状态.charRef) { toast('请先选择角色'); return null; }
      return renderPrompt('role_relation_extract', { charCtx: 角色上下文() });
    }, { fillFn: function(d) {
      if (!d || !Array.isArray(d.relations) || !d.relations.length) { toast('提取结果为空'); return; }
      编辑状态.relations = d.relations;
      保存角色提取({ relations: d.relations });
      // 提取后不自动选中，保持未选择状态，由用户点选
      刷新关系chips();
      刷新关系详情();
      toast('已提取 ' + d.relations.length + ' 个关系人物（级别关系/语言风格/交集经历/性爱经历），已本地存档');
    }});
    // 自制人物（全板块通用；AI 按要求设定一个假设人物，加入关系列表并本地存档）
    registerAiField(cfg.aiFieldId + 'CustomRel', cfg.aiLabel + '·自制人物', function() {
      var req = ((document.getElementById(cfg.prefix + 'PersonReq')||{}).value || '').trim();
      if (!req) { toast('请先描述要设定的人物'); return null; }
      return renderPrompt('role_relation_custom_gen', { charCtx: 角色上下文(), req: req });
    }, { fillFn: function(d) {
      if (!d || !d.name) { toast('生成结果为空'); return; }
      var rel = { name: d.name, relation: d.relation || '', style: d.style || '', events: d.events || '', sex: d.sex || '' };
      编辑状态.relations = (Array.isArray(编辑状态.relations) ? 编辑状态.relations : []).concat([rel]);
      保存角色提取({ relations: 编辑状态.relations });
      var selT = 选中对象表();
      if (selT.indexOf(rel.name) < 0) selT.push(rel.name);
      编辑字段('targets', selT.slice());
      刷新关系chips();
      刷新关系详情();
      toast('已生成假设人物「' + rel.name + '」，已本地存档');
    }});
  }

  // ===== 窗口导出 =====
  window[cfg.windowPrefix + '切换视图'] = 切换视图;
  window[cfg.windowPrefix + '新创作'] = 新创作;
  window[cfg.windowPrefix + '筛选角色'] = 筛选角色;
  window[cfg.windowPrefix + '编辑项'] = 编辑项;
  window[cfg.windowPrefix + '删除项'] = 删除项;
  window[cfg.windowPrefix + '阅读'] = 阅读;
  window[cfg.windowPrefix + '复制全文'] = 复制全文;
  window[cfg.windowPrefix + '编辑字段'] = 编辑字段;
  window[cfg.windowPrefix + '选择角色'] = 选择角色;
  window[cfg.windowPrefix + '打开角色选择'] = 打开角色选择;
  window[cfg.windowPrefix + '切换主题'] = 切换主题;
  window[cfg.windowPrefix + '切换语气'] = 切换语气;
  window[cfg.windowPrefix + '切换场合'] = 切换场合;
  window[cfg.windowPrefix + '切换模式'] = 切换模式;
  window[cfg.windowPrefix + '切换字数'] = 切换字数;
  window[cfg.windowPrefix + '随机灵感'] = 随机灵感;
  window[cfg.windowPrefix + '同步chips'] = 同步chips;
  window[cfg.windowPrefix + '设置对象'] = 设置对象;
  window[cfg.windowPrefix + '选择关系'] = 选择关系;
  window[cfg.windowPrefix + '选择经历'] = 选择经历;
  window[cfg.windowPrefix + '刷新经历详情'] = 刷新经历详情;

  return { 切换视图: 切换视图, 当前视图: function(){ return 当前视图; } };
}
window.角色台本工厂 = 角色台本工厂;
if (!Store.roleExtract) Store.roleExtract = createStore('roleExtract');
