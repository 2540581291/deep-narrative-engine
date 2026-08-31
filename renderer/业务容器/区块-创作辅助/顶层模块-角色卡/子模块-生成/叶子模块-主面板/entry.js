// 深度-叙事引擎 · 角色卡 · ✨ 生成子模块
// LLM 角色定制生成 —— 两步流程

// ===== 快速选择芯片 =====

function 渲染快速选择芯片() {
  var h = '<div class="mb-4">';
  for (var g = 0; g < 角色快速芯片.length; g++) {
    var group = 角色快速芯片[g];
    h += '<div class="fs-10 c-fg3 mb-2">' + escHtml(group.group) + '</div>';
    h += '<div class="flex flex-wrap gap-2 mb-4">';
    for (var c = 0; c < group.chips.length; c++) {
      h += '<span class="tag-chip" style="cursor:pointer;padding:1px 5px;font-size:9px" onclick="window.角色追加芯片(' + g + ',' + c + ')">'
        + escHtml(group.chips[c].text) + '</span>';
    }
    h += '</div>';
  }
  h += '</div>';
  return h;
}

window.角色追加芯片 = function(g, c) {
  var chip = 角色快速芯片[g].chips[c];
  var input = document.getElementById('charDescInput');
  if (!input) return;
  var cur = input.value.trim();
  input.value = cur ? cur + '，' + chip.append : chip.append;
  角色生成描述 = input.value;
  input.focus();
};

// ===== 概要卡片 =====

function 渲染概要卡片(o) {
  if (!o) return '';
  var bi = o.identity && o.identity.basicInfo || {};
  var bg = o.identity && o.identity.background || {};
  var exp = o.identity && o.identity.experience || {};
  var info = 角色类别映射[角色生成类别] || { label: '未知', icon: '❓' };
  var h = '<div class="n-card" style="margin-bottom:12px">';
  h += '<div class="fs-11 c-accent2 fw-600 mb-8">📋 角色概要（身份信息）</div>';
  h += '<div class="flex items-center gap-12 mb-10">';
  h += '<div class="fs-40">' + (bi.icon || info.icon) + '</div>';
  h += '<div class="flex-1">';
  h += '<div class="fs-16 fw-700 c-fg">' + escHtml(bi.name || '未命名') + '</div>';
  h += '<div class="fs-11 c-accent2">' + escHtml(bi.title || '') + '</div>';
  h += '<div class="fs-11 c-fg3 mt-1">' + [info.label, bi.age ? bi.age + '岁' : '', bi.race, bg.origin].filter(Boolean).join(' · ') + '</div>';
  if (bi.rarity) {
    h += '<span class="tag-chip fs-09 p-1-5 mt-2">' + escHtml(bi.rarity) + '</span>';
  }
  h += '</div></div>';

  h += '<div class="fs-11">';
  h += '<div class="c-fg3 mb-2">出身</div>';
  h += '<div class="c-fg mb-6">' + [bg.origin, bg.birthStatus].filter(Boolean).join(' · ') + '</div>';
  if (bg.family) {
    h += '<div class="c-fg3 mb-2">家族</div>';
    h += '<div class="c-fg mb-6">' + escHtml(bg.family) + '</div>';
  }
  if (bg.upbringing) {
    h += '<div class="c-fg3 mb-2">成长</div>';
    h += '<div class="c-fg mb-6">' + escHtml(bg.upbringing) + '</div>';
  }
  if (bg.education) {
    h += '<div class="c-fg3 mb-2">教育</div>';
    h += '<div class="c-fg mb-6">' + escHtml(bg.education) + '</div>';
  }
  h += '<div class="c-fg3 mb-2">背景</div>';
  var lifeStory = exp.lifeOverview || '';
  h += '<div class="c-fg mb-6">' + escHtml(lifeStory.substring(0, 120)) + (lifeStory.length > 120 ? '...' : '') + '</div>';
  h += '<div class="c-fg3 mb-2">气质</div>';
  h += '<div class="c-fg mb-6">' + escHtml(bg.aura || '') + '</div>';
  if (exp.currentOccupation) {
    h += '<div class="c-fg3 mb-2">职业</div>';
    h += '<div class="c-fg mb-6">' + escHtml(exp.currentOccupation) + (exp.timeline ? ' — ' + escHtml(exp.timeline) : '') + '</div>';
  }
  if (exp.dailyLife) {
    h += '<div class="c-fg3 mb-2">日常</div>';
    h += '<div class="c-fg mb-6">' + escHtml(exp.dailyLife.substring(0, 80)) + (exp.dailyLife.length > 80 ? '...' : '') + '</div>';
  }
  if (exp.sexualAwakening) {
    h += '<div class="c-fg3 mb-2">性启蒙</div>';
    h += '<div class="c-fg mb-6">' + escHtml(exp.sexualAwakening.substring(0, 80)) + (exp.sexualAwakening.length > 80 ? '...' : '') + '</div>';
  }
  if (exp.dailySexuality) {
    h += '<div class="c-fg3 mb-2">日常性事</div>';
    h += '<div class="c-fg mb-6">' + escHtml(exp.dailySexuality.substring(0, 80)) + (exp.dailySexuality.length > 80 ? '...' : '') + '</div>';
  }
  if (exp.sexualDetails && exp.sexualDetails.length) {
    h += '<div class="c-fg3 mb-2">性爱明细</div>';
    h += '<div class="c-fg mb-6">' + escHtml(exp.sexualDetails.join(' / ')) + '</div>';
  }
  if (bg.skills && bg.skills.length) {
    h += '<div class="c-fg3 mb-2">技能</div>';
    h += '<div class="c-fg mb-6">' + escHtml(bg.skills.join('、')) + '</div>';
  }
  if (bg.talents && bg.talents.length) {
    h += '<div class="c-fg3 mb-2">天赋</div>';
    h += '<div class="c-fg mb-6">' + escHtml(bg.talents.join('、')) + '</div>';
  }
  h += '</div></div>';
  return h;
}

// ===== 完整预览卡片（嵌套结构版） =====

function 渲染角色预览(c, catKey) {
  var bi = 获取嵌套值(c, 'identity.basicInfo') || {};
  var bg = 获取嵌套值(c, 'identity.background') || {};
  var exp = 获取嵌套值(c, 'identity.experience') || {};
  var bs = 获取嵌套值(c, 'appearance.bodyShape') || {};
  var pers = 获取嵌套值(c, 'personality.personalityTraits.personality') || {};
  var attrs = 获取嵌套值(c, 'attributes') || {};
  var meta = 获取嵌套值(c, 'meta') || {};

  var rarity = bi.rarity || '';
  var rarityCls = { '金': 'rarity-bd-legendary', '紫': 'rarity-bd-epic', '蓝': 'rarity-bd-rare', '绿': 'rarity-bd-uncommon', '白': 'rarity-bd-common' }[rarity] || '';
  var info = 角色类别映射[catKey] || { label: '未知', icon: '❓' };

  var h = '<div class="n-card ' + rarityCls + '" class="mb-12">';

  // 头部
  h += '<div class="flex items-center gap-12 mb-10">';
  h += '<div class="fs-40">' + (bi.icon || info.icon) + '</div>';
  h += '<div class="flex-1">';
  h += '<div class="fs-16 fw-700 c-fg">' + escHtml(bi.name || '未命名') + '</div>';
  h += '<div class="fs-11 c-accent2">' + escHtml(bi.title || '') + '</div>';
  h += '<div class="fs-11 c-fg3 mt-1">' + [info.label, bi.age ? bi.age + '岁' : '', bi.race, bs.figure, bg.origin].filter(Boolean).join(' · ') + '</div>';
  var metaTags = meta.tags || (meta.tagList && meta.tagList.tags) || [];
  if (metaTags.length) {
    h += '<div class="flex gap-2 flex-wrap mt-4">';
    for (var i = 0; i < metaTags.length; i++) {
      h += '<span class="tag-chip">' + escHtml(metaTags[i]) + '</span>';
    }
    h += '</div>';
  }
  h += '</div></div>';

  // 性焦点属性摘要
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;margin-bottom:8px">';
  h += '<div>';
  var breasts = 获取嵌套值(c, 'appearance.breasts') || {};
  var pussy = 获取嵌套值(c, 'appearance.pussy') || {};
  var vagina = pussy.vagina || {};
  var deflowered = 获取嵌套值(c, 'firstRecords.deflowered') || {};

  h += '<div class="c-fg3">体型</div>';
  h += '<div class="c-fg">' + escHtml([bs.figure, bs.height].filter(Boolean).join(' · ')) + '</div>';

  if (breasts.size || breasts.shape) {
    h += '<div class="c-fg3 mt-4">胸部</div>';
    h += '<div class="c-fg">' + escHtml([breasts.size, breasts.shape].filter(Boolean).join(' · ')) + '</div>';
  }

  if (pussy.appearance) {
    h += '<div class="c-fg3 mt-4">小穴</div>';
    h += '<div class="c-fg">' + escHtml(pussy.appearance) + (pussy.pubicHair ? ' · ' + escHtml(pussy.pubicHair) : '') + '</div>';
  }

  if (vagina.hymen) {
    h += '<div class="c-fg3 mt-4">处女膜</div>';
    h += '<div class="c-fg">' + escHtml(vagina.hymen) + '</div>';
  }

  if (exp.sexualAwakening) {
    h += '<div class="c-fg3 mt-4">性启蒙</div>';
    h += '<div class="c-fg fs-italic">"' + escHtml(exp.sexualAwakening.substring(0, 60)) + (exp.sexualAwakening.length > 60 ? '..."' : '"') + '</div>';
  }
  h += '</div>';

  h += '<div>';
  var sexAttr = attrs.sex || {};
  var corruption = attrs.corruption || {};

  h += '<div class="c-fg3">性欲</div>';
  h += '<div class="c-fg">' + (sexAttr.lust != null ? sexAttr.lust + '/100' : '未知') + '</div>';

  h += '<div class="c-fg3 mt-4">敏感度</div>';
  h += '<div class="c-fg">' + (sexAttr.sensitivity != null ? sexAttr.sensitivity + '/100' : '未知') + '</div>';

  h += '<div class="c-fg3 mt-4">性技巧</div>';
  h += '<div class="c-fg">' + (sexAttr.skill != null ? sexAttr.skill + '/100' : '未知') + '</div>';

  h += '<div class="c-fg3 mt-4">淫乱度</div>';
  h += '<div class="c-fg">' + (corruption.promiscuity != null ? corruption.promiscuity + '/100' : '未知') + '</div>';

  h += '<div class="c-fg3 mt-4">破处</div>';
  var deflorationParts = [];
  if (deflowered.vaginal) deflorationParts.push('阴道' + (deflowered.vaginal.status === '未破' ? '未破' : '已破'));
  if (deflowered.oral) deflorationParts.push('口交' + (deflowered.oral.status === '未破' ? '未破' : '已破'));
  if (deflowered.anal) deflorationParts.push('肛门' + (deflowered.anal.status === '未破' ? '未破' : '已破'));
  h += '<div class="c-fg">' + (deflorationParts.length ? deflorationParts.join(' | ') : '未知') + '</div>';

  if (exp.dailySexuality) {
    h += '<div class="c-fg3 mt-4">日常性事</div>';
    h += '<div class="c-fg fs-italic">"' + escHtml(exp.dailySexuality.substring(0, 60)) + (exp.dailySexuality.length > 60 ? '..."' : '"') + '</div>';
  }

  if (c.identity && c.identity.basicInfo && c.identity.basicInfo.price != null) {
    h += '<div class="c-accent2 fw-700 mt-4">💰 ' + c.identity.basicInfo.price + ' 元</div>';
  }
  h += '</div>';
  h += '</div>';

  // 操作按钮
  h += '<div class="flex gap-8 bt-border pt-10">';
  h += '<button class="btn btn-outline" onclick="window.角色生成重试()">🔄 重新定制</button>';
  h += '<button class="btn btn-outline" onclick="window.角色返回()">✕ 取消</button>';
  h += '</div>';

  // 审计按钮行
  h += '<div class="flex gap-8 mt-6 items-center">';
  h += '<button class="btn btn-outline btn-sm" onclick="window.角色审计执行(\'' + 角色暂存最新ID + '\',\'' + catKey + '\',\'pending\')">🔍 角色审计</button>';
  if (角色暂存最新ID) {
    var _auditPendingEntry = S.generatedCharacters && S.generatedCharacters[catKey] && S.generatedCharacters[catKey][角色暂存最新ID];
    if (_auditPendingEntry && _auditPendingEntry.audit) {
      var _auditD = _auditPendingEntry.audit;
      if (_auditD.fixesApplied) h += '<span class="fs-10 fw-700 c-success">✅ 已整改</span>';
      else if (_auditD.issueCount > 0) h += '<span class="fs-10 fw-700 c-accent2">🔍 ' + _auditD.issueCount + ' 项</span>';
      else h += '<span class="fs-10 c-fg3">🔍 已通过</span>';
    }
  }
  h += '</div>';

  h += '</div>';
  return h;
}

// ===== 生成标签页渲染 =====

function 渲染生成面板() {
  var phase = 角色生成阶段;
  var h = '';

  // 卡片 1：标题 + 说明 + 性别选择器
  if (phase === 'input' || phase === 'outline-loading') {
    h += '<div class="n-card mb-6">';
    h += '<div class="fs-12 fw-600 c-fg mb-8">✨ 生成角色</div>';
    h += '<div class="fs-10 c-fg3 mb-8">描述你的需求，AI 将为你定制生成独一无二的角色档案。</div>';
    h += '<div class="flex gap-6 mb-0">';
    for (var i = 0; i < 类别键数组.length; i++) {
      var k = 类别键数组[i];
      var info = 角色类别映射[k];
      var sel = 角色生成类别 === k;
      var disabledStyle = phase === 'outline-loading' ? 'pointer-events:none;opacity:0.6' : '';
      h += '<div class="char-cat-tab flex-1' + (sel ? ' act"' : '"') + ' style="padding:4px 4px;' + disabledStyle + '" onclick="window.角色设置类别(\'' + k + '\')">';
      h += '<div class="char-cat-tab-icon" style="font-size:14px">' + info.icon + '</div>';
      h += '<div class="char-cat-tab-label" style="font-size:10px">' + info.label + '</div>';
      h += '</div>';
    }
    h += '</div>';
    h += '</div>';
  }

  // 卡片 2：芯片 + 输入 + 按钮
  h += '<div class="n-card mb-6">';

  // 快速选择芯片（仅 input 阶段）
  if (phase === 'input') {
    h += 渲染快速选择芯片();
  }

  // 描述输入区（所有阶段显示，非 input 阶段禁用）
  var textDisabled = phase !== 'input';
  h += '<div class="fs-11 fw-600 c-fg3 mb-4">角色描述</div>';
  h += '<textarea id="charDescInput" rows="12" class="llm-input w-100 resize-v"' +
    (textDisabled ? ' disabled' : '') +
    ' placeholder="描述你想要的角色...&#10;例如：一个冷艳高傲的精灵公主，活了300多年，银色长发，紫色眼眸..."' +
    '>' + escHtml(角色生成描述) + '</textarea>';

  // 按钮 + 状态
  if (phase === 'input') {
    h += '<button class="btn btn-primary w-100 mt-8" onclick="window.角色生成提交()">🎯 生成角色</button>';
  } else if (phase === 'outline-loading' || phase === 'full-loading') {
    var loadingText = phase === 'outline-loading' ? '正在构思角色方向...' : '正在生成完整角色详情...';
    h += '<div class="text-center p-16-0">';
    h += '<div class="fs-32 mb-8" style="animation:pulse 1.5s infinite">🔮</div>';
    h += '<div class="fs-13 c-accent2 fw-700">' + loadingText + '</div>';
    h += '<div class="fs-11 c-fg3 mt-4">角色构思中，请稍候</div>';
    h += '</div>';
    h += '<button class="btn btn-primary w-100 opacity-5" disabled>⏳ 生成中...</button>';
  }

  h += '<div id="charStatus" class="mt-6 fs-11 c-fg3 text-center"></div>';
  h += '</div>';

  // 预览区（结果展示，独立卡片）
  if (phase === 'outline' && 角色生成概要) {
    h += 渲染概要卡片(角色生成概要);
    h += '<div class="flex gap-8 mb-12">';
    h += '<button class="btn btn-primary flex-1" onclick="window.角色生成继续()">🎯 确认方向，生成完整角色</button>';
    h += '<button class="btn btn-outline" onclick="window.角色生成暂存()">📥 暂存</button>';
    h += '<button class="btn btn-outline" onclick="window.角色返回()">✏️ 重新描述</button>';
    h += '</div>';
  } else if (phase === 'full' && 角色生成结果 && 角色生成结果._char) {
    h += 渲染角色预览(角色生成结果._char, 角色生成类别);
  } else if (phase === 'error' && 角色生成结果 && 角色生成结果._error) {
    h += '<div class="n-card" style="border-color:var(--error)">';
    h += '<div class="c-error fw-700 mb-4">❌ 生成失败</div>';
    h += '<div class="fs-12 c-fg3">' + escHtml(角色生成结果._error) + '</div>';
    if (角色生成结果._raw) {
      h += '<details class="mt-8"><summary class="fs-11 c-fg3 cur-ptr">查看原始返回</summary>';
      h += '<pre class="fs-10 c-fg3 maxh-450 overflow-y-auto bg-bg2 p-8 rad-3 mt-4">' + escHtml(角色生成结果._raw) + '</pre>';
      h += '</details>';
    }
    h += '<div class="flex gap-8 mt-8">';
    if (角色生成结果._fromPhase === 'full-loading' && 角色生成概要) {
      h += '<button class="btn btn-primary" onclick="window.角色生成继续()">🔄 重试生成完整角色</button>';
      h += '<button class="btn btn-outline" onclick="window.角色返回(true)">✏️ 返回概要</button>';
    } else {
      h += '<button class="btn btn-outline" onclick="window.角色返回()">✏️ 重新描述</button>';
    }
    h += '</div>';
    h += '</div>';
  }

  return h;
}

// ===== 性别切换 =====

window.角色设置类别 = function(cat) {
  if (角色生成类别 === cat) return;
  角色生成类别 = cat;
  角色生成阶段 = 'input';
  角色生成概要 = null;
  角色生成结果 = null;
  角色生成描述 = ''; // 切性别时清空，避免旧描述泄露到新角色
  渲染角色主面板(document.getElementById('characterContent'));
};

// ===== 提交生成概要（第一步） =====

window.角色生成提交 = function() {
  var input = document.getElementById('charDescInput');
  var desc = input ? input.value.trim() : '';
  if (!desc) {
    显示状态('请先输入角色描述');
    return;
  }
  if (!LLM || !LLM.getCurrentConfig || !LLM.getCurrentConfig()) {
    显示状态('请先在设置中配置 LLM');
    return;
  }

  角色生成描述 = desc;
  角色生成阶段 = 'outline-loading';
  角色生成概要 = null;
  角色生成结果 = null;
  渲染角色主面板(document.getElementById('characterContent'));

  var genderLabel = 角色类别映射[角色生成类别] ? 角色类别映射[角色生成类别].label : '未知';
  var system = '你是一个角色定制专家，擅长根据描述生成结构完整的角色档案。你只输出合法 JSON，不要任何其他文字。';
  var prompt = '请根据以下角色描述，按下方模板结构生成角色概要 JSON。\n\n'
    + '只输出模板中的字段，不要额外增减。\n'
    + '字段值请合理填充，保持角色设定一致性。\n\n'
    + '角色性别：' + genderLabel + '\n'
    + '角色描述：' + desc + '\n\n'
    + '===== 概要模板 =====\n'
    + JSON.stringify(角色概要模板[角色生成类别] || 角色概要模板.female, null, 2) + '\n\n'
    + '要求：\n'
    + '1. 角色名（name）如果是玩家在描述开头明确给出的（如「木彩萌-祖宗大人，xxx」），则原样使用，不得修改任何字符（包括连字符等标点）；否则必须是真实人名的感觉，禁止在名字中加入任何间隔号（·、•、．等）。如果是其他语言的角色名，必须翻译过来用中文。称号（title）要有特色，贴合角色描述。\n'
    + '2. icon 必须是一个能代表角色特征或气质的表情符号（如 🦊🧝‍♀️👩‍🎤🧙‍♀️💃👸等），不得使用默认的 👤\n'
    + '3. lifeOverview 不少于 100 字，要有完整叙事\n'
    + '4. dailyLife、sexualAwakening、dailySexuality 各不少于 50 字；sexualDetails 按时间顺序1234编号列出性爱相关事件\n'
    + '5. skills 和 talents 尽量多列几项\n'
    + '6. 价格 price 按以下公式估算：身价 = int(10000 × 年龄系数 × 容貌系数 × 种族系数 × 健康系数 × 身材系数 × 性格系数) + 技能数 × 500\n'
    + '   年龄系数：6-9岁5.0 / 10-14岁3.0 / 15-18岁2.0 / 19-25岁1.0 / 26-35岁0.6 / 36岁以上0.3\n'
    + '   种族系数：人族1.0 / 异族2.0\n'
    + '   默认按容貌50、非处、健康、匀称身材、普通性格计算\n'
    + '7. 稀有度（rarity）按价格判断：白≤10万 / 绿10-20万 / 蓝20-50万 / 紫50-100万 / 金≥100万\n'
    + '8. sexualDetails（性爱明细）以丰富为主，完整保留并展开角色描述中的性爱相关信息，不应该删除或简写。如果角色描述中已经明确给出了性爱明细条目（如带编号的"1. xxx""2. xxx"），必须逐条完整保留，任何一条都不允许删除、合并、缩写或改写，并可在其后继续补充新的条目。';

  LLM.call({
    label: '角色概要生成',
    system: system,
    prompt: prompt,
  }).then(function(text) {
    var parsed = 解析概要JSON(text);
    if (parsed.ok) {
      角色生成概要 = parsed.outline;
      角色生成概要._desc = desc; // 闭包捕获的原始值
      角色生成阶段 = 'outline';
      角色生成结果 = null;
      if (!S.generatedCharacters) S.generatedCharacters = { female: {}, male: {}, femboy: {}, futa: {} };
      if (!S.generatedCharacters[角色生成类别]) S.generatedCharacters[角色生成类别] = {};
      var 角色名 = parsed.outline.identity.basicInfo.name || ('gs_' + uuid());
      S.generatedCharacters[角色生成类别][角色名] = {
        id: 角色名,
        desc: desc,
        outline: JSON.parse(JSON.stringify(parsed.outline)),
        phase: 'outline',
        status: 'pending',
        createdAt: Date.now()
      };
      角色暂存最新ID = 角色名;
      save();
    } else {
      角色生成结果 = { _error: parsed.error, _raw: text, _fromPhase: 'outline-loading' };
      角色生成阶段 = 'error';
    }
    渲染角色主面板(document.getElementById('characterContent'));
  }).catch(function(err) {
    角色生成结果 = { _error: 'LLM 调用失败: ' + err.message, _raw: null, _fromPhase: 'outline-loading' };
    角色生成阶段 = 'error';
    渲染角色主面板(document.getElementById('characterContent'));
  });
};

// ===== 生成完整角色（第二步） =====

window.角色生成继续 = function() {
  if (!角色生成概要) {
    显示状态('没有概要数据，请重新开始');
    return;
  }
  if (!LLM || !LLM.getCurrentConfig || !LLM.getCurrentConfig()) {
    显示状态('请先在设置中配置 LLM');
    return;
  }

  角色生成阶段 = 'full-loading';
  角色生成结果 = null;
  渲染角色主面板(document.getElementById('characterContent'));

  var outline = 角色生成概要;
  var 原始描述 = outline._desc || 角色生成描述;
  var outlineGender = outline.identity && outline.identity.basicInfo && outline.identity.basicInfo.gender;
  var genderLabel = outlineGender && (outlineGender === '女性' || outlineGender === '男性' || outlineGender === '伪娘' || outlineGender === '扶她')
    ? outlineGender
    : 角色类别映射[角色生成类别].label;

  var system = '你是一个角色定制专家，擅长根据概要生成完整的角色档案。你只输出合法 JSON，不要任何其他文字。';
  var prompt = '请根据以下角色概要，按下方模板结构生成完整角色 JSON。\n\n'
    + '保持概要中的设定（名字、称号、头像icon、种族、背景故事等）不变，创造性地生成所有其他字段。\n'
    + '模板中的字段结构就是你要生成的内容，按字段名和类型逐一填充即可。\n\n'
    + '【重要】性历史（sexualHistory）和首次记录（firstRecords）部分：\n'
    + '   - 必须根据角色的年龄、生活经历、背景故事生成真实合理的数据\n'
    + '   - 不要照搬模板中的 0、null 或 "未破"——那些只是占位符\n'
    + '   - 如果角色描述表明有性经验，各项计数应 > 0，里程碑描述应有具体内容\n'
    + '   - 如果角色明显是处女/处男，则保持合理的数据\n'
    + '   - ⚠️ 关键：如果某个 partner 类型（如 alien、femboy、futa 等）的 count 为 0，则该类型的 desc、firstTime、mostShameful、best、worst 必须为 null，不得写入任何描述内容\n'
    + '   - ⚠️ 尤其禁止将一种 partner 类型的体验复制到另一种 count 为 0 的类型中\n\n'
    + '   - \u26a0\ufe0f bodyStats \u4e2d\u6bcf\u4e2a count \u90fd\u914d\u6709 desc\uff08\u8865\u5145\u8bf4\u660e\uff09\uff1a\u82e5 count > 0\uff0cdesc \u987b\u586b\u5199\u5177\u4f53\u63cf\u8ff0\uff1b\u82e5 count = 0 \u6216 null\uff0cdesc \u987b\u4e3a null\n\n'

    + '【重要】性格言行（personality）的「语言」（speech.words，含口头禅 catchphrases、骂人的话 curses、性 sex 下全部台词）部分：\n'
    + '   - ⚠️ 所有台词一律禁止使用省略号（……、...、…），必须用完整语句直接表达\n'
    + '   - 台词要具体、有辨识度，能体现角色性格与处境，不要用省略号代替情感或停顿\n\n'

    + '【原始角色描述】\n'
    + 原始描述 + '\n\n'
    + '角色性别：' + genderLabel + '\n'
    + '角色概要：' + JSON.stringify(outline, null, 2) + '\n\n'
    + '===== 完整模板（替换其中的占位值，保持 JSON 结构完整）=====\n'
    + JSON.stringify(角色完整模板[角色生成类别] || 角色完整模板.female, null, 2);

  LLM.call({
    label: '完整角色生成',
    system: system,
    prompt: prompt,
  }).then(function(text) {
    var parsed = 解析完整角色(text);
    if (parsed.ok) {
      var c = parsed.char;
      // 用户已确认的概要身份信息为准，覆盖 AI 二次生成的 identity
      if (outline && outline.identity) {
        c.identity = JSON.parse(JSON.stringify(outline.identity));
      }
      c._desc = 原始描述;
      var evalCatKey = 角色生成类别;
      if (c.identity && c.identity.basicInfo && c.identity.basicInfo.gender) {
        var g = c.identity.basicInfo.gender;
        if (g === '女性') evalCatKey = 'female';
        else if (g === '男性') evalCatKey = 'male';
        else if (g === '伪娘') evalCatKey = 'femboy';
        else if (g === '扶她') evalCatKey = 'futa';
      }
      角色生成结果 = { _char: c, _desc: 原始描述 };
      渲染角色主面板(document.getElementById('characterContent'));

      if (!S.generatedCharacters[evalCatKey]) S.generatedCharacters[evalCatKey] = {};
      var 角色名 = (c.identity.basicInfo && c.identity.basicInfo.name) || ('gs_' + uuid());
      S.generatedCharacters[evalCatKey][角色名] = {
        id: 角色名,
        desc: 原始描述,
        outline: outline ? JSON.parse(JSON.stringify(outline)) : null,
        fullChar: JSON.parse(JSON.stringify(c)),
        phase: 'full',
        status: 'pending',
        createdAt: Date.now()
      };
      角色暂存最新ID = 角色名;
      save();
      角色生成类别 = evalCatKey;
      角色生成阶段 = 'full';
      渲染角色主面板(document.getElementById('characterContent'));
    } else {
      角色生成结果 = { _error: parsed.error, _raw: text, _fromPhase: 'full-loading' };
      角色生成阶段 = 'error';
      渲染角色主面板(document.getElementById('characterContent'));
    }
  }).catch(function(err) {
    角色生成结果 = { _error: 'LLM 调用失败: ' + err.message, _raw: null, _fromPhase: 'full-loading' };
    角色生成阶段 = 'error';
    渲染角色主面板(document.getElementById('characterContent'));
  });
};

// ===== 暂存概要（手动保存到 S.charDrafts） =====

window.角色生成暂存 = function() {
  if (!角色生成概要) return;
  if (!S.charDrafts) S.charDrafts = [];
  var existingIdx = -1;
  if (角色生成概要._draftId) {
    for (var i = 0; i < S.charDrafts.length; i++) {
      if (S.charDrafts[i].id === 角色生成概要._draftId) { existingIdx = i; break; }
    }
  }
  var draft = {
    id: 角色生成概要._draftId || 'draft_' + uuid(),
    gender: 角色生成类别,
    desc: 角色生成描述,
    outline: 角色生成概要,
    createdAt: Date.now(),
  };
  if (existingIdx >= 0) {
    S.charDrafts[existingIdx] = draft;
  } else {
    S.charDrafts.push(draft);
    角色生成概要._draftId = draft.id;
  }
  save();
  window.toast('📥 已暂存角色概要');
  角色生成阶段 = 'input';
  角色生成结果 = null;
  渲染角色主面板(document.getElementById('characterContent'));
};

// ===== 从暂存加载概要 =====

window.角色生成载入暂存 = function(id) {
  var drafts = S.charDrafts || [];
  for (var i = 0; i < drafts.length; i++) {
    if (drafts[i].id === id) {
      var d = drafts[i];
      角色生成类别 = d.gender;
      角色生成描述 = d.desc || '';
      角色生成概要 = JSON.parse(JSON.stringify(d.outline || {}));
      角色生成概要._draftId = d.id;
      角色生成结果 = null;
      角色生成阶段 = 'outline';
      角色当前标签 = 'generate';
      渲染角色主面板(document.getElementById('characterContent'));
      return;
    }
  }
  window.toast('草稿不存在');
};

// ===== 删除暂存概要 =====

window.角色生成删除暂存 = function(id) {
  if (!S.charDrafts) return;
  S.charDrafts = S.charDrafts.filter(function(d) { return d.id !== id; });
  save();
  渲染角色主面板(document.getElementById('characterContent'));
};

// ===== 重新定制 =====

window.角色生成重试 = function() {
  角色生成阶段 = 'input';
  角色生成结果 = null;
  角色生成概要 = null;
  渲染角色主面板(document.getElementById('characterContent'));
};

// ===== 返回 =====

window.角色返回 = function(toOutline) {
  if (toOutline && 角色生成概要) {
    角色生成阶段 = 'outline';
    角色生成结果 = null;
  } else {
    角色生成阶段 = 'input';
    角色生成结果 = null;
    角色生成概要 = null;
  }
  角色当前标签 = 'generate';
  渲染角色主面板(document.getElementById('characterContent'));
};
