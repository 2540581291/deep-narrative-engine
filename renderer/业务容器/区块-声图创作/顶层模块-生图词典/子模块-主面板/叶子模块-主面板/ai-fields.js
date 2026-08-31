// 生图词典 · AI 字段注册（二元模板：注册字段 + 提示词模板 + 回填函数）
// 依赖：所有 UI/数据文件已先加载（stcdModeVar/stcdFormatVar/stcdFillResult/stcdBatchFill/
//       STCD_LOCAL_OPT_LABELS/DESCS/stcdLocalOptField/stcdLocalDetailAsList/stcdLocalSuggestListOf/
//       stcdLocalOptSuggestShow/stcdLocalOptDeepenShow/stcdRegisterVideoGenField/stcdCurrentBannedPreset）

(function() {
  if (typeof registerAiField !== 'function') return;
  // 通用模板变量：输出模式
  function commonVars() {
    return {
      mode: stcdModeVar(),
      outputFormat: stcdFormatVar(),
    };
  }
  // ① 本地提示词（角色卡 + 内容选项[服装/事件各一] + 创作要求，一次生成）
  registerAiField('stcd-local-gen', '本地提示词', function() {
    var text = (document.getElementById('stcd-local-require') || {}).value || '';
    var v = commonVars();
    var charSeg = '';
    var optsSeg = '';
    if (STCD.localCard && (STCD.localCard.text || STCD.localCard.json)) {
      charSeg = STCD.localCard.text || STCD.localCard.json;
    }
    // 只把当前选中的选项拼进去：每个选项自带完整描述，不穷举其他选项
    var sel = [];
    var picks = [];
    if (STCD.localCharOpt) picks.push(STCD.localCharOpt);
    if (STCD.localFormOpt) picks.push(STCD.localFormOpt);
    if (STCD.localEventOpt) picks.push(STCD.localEventOpt);
    if (STCD.localStyleOpt) picks.push(STCD.localStyleOpt);
    picks.forEach(function(k) {
      var name = (STCD_LOCAL_OPT_LABELS[k] || k).replace(/^.. /, '');
      var desc = STCD_LOCAL_OPT_DESCS[k] || '';
      var line = stcdLocalOptField(k) + '：' + name + (desc ? '\n' + desc : '');
      // 已钉选的时间线方案：全量信息按时间顺序传入（时间段 + 方案名 + 说明 + 来源/思路）
      var arr = stcdLocalDetailAsList(STCD.localOptDetail && STCD.localOptDetail[k]);
      if (arr.length) {
        var plans = arr.map(function(it, idx) {
          if (!it || !it.label) return null;
          var t = it.label;
          if (it.time) t = '[' + it.time + ']' + t;
          var extra = '';
          if (it.desc) extra += '（' + it.desc + '）';
          if (it.reason) {
            var r = String(it.reason).replace(/^(来源|思路)[：:]\s*/, '');
            extra += '；' + (it.side === 'actual' ? '来源' : '思路') + '：' + r;
          }
          return (idx + 1) + '.' + t + extra;
        }).filter(Boolean);
        if (plans.length) line += '\n【具体方案】\n' + plans.join('\n');
      }
      sel.push(line);
    });
    if (sel.length) optsSeg = sel.join('\n');
    v.char = charSeg;
    v.opts = optsSeg;
    v.text = text;
    // 服装/形态/事件各自的画面主体规则：服装/形态→只描写角色自身、画面只有一人；事件→以事件/环境为主体
    var isEvent = picks.some(function(k) { return stcdLocalOptField(k) === '事件'; });
    var isForm = picks.some(function(k) { return stcdLocalOptField(k) === '形态'; });
    // 身高规则仅服装类启用（形态/事件不注入）：
    // 外观年龄 16 岁以下（含 16 岁）必须在姓名后追加身高标签，数值根据角色卡体型/外貌描述自行推断，须与外观年龄和体型相符；17 岁及以上不写身高
    v.heightRule = isEvent || isForm
      ? ''
      : '   - 身高（仅外观年龄 16 岁以下且含 16 岁时启用）：当角色的外观年龄在 16 岁以下时，在「姓名」之后**必须追加身高标签**（如 140cm、130cm tall、height 120cm 等），身高数值**根据角色卡的体型/外貌描述自行推断**（如角色卡写「娇小」「幼态」→ 往 130cm 上下推；写「身材矮小、骨骼纤细」→ 更低；若角色卡有明确身高描述则按它来），推断值须与外观年龄和体型描述相符，不要凭空给一个与描述矛盾的身高；外观年龄 17 岁及以上**不写身高**，保持三段';
    v.eventRule = isEvent
      ? '2. 以事件为描写主体，可包含角色正在进行的活动；角色姿态须符合事件情境\n3. 不得出现其他无关人员'
      : isForm
        ? ''
        : '2. **画面中只有角色一个人**：英文 prompt 中必须明确写出 solo（或 1girl / 1boy / futa / femboy 等单人标签，与开头性别标签一致），不得出现第二个人、不得出现其他任何人或剪影，也不描写所在场所';
    v.user = [charSeg ? '【角色信息】\n' + charSeg : '', optsSeg ? '【本次任务】\n' + optsSeg : '', text ? '【创作要求】\n' + text : ''].filter(Boolean).join('\n\n');
    return v;
  }, {
    suggestPrompt: 'local_prompt_gen',
    fillFn: function(d) { stcdFillResult('stcd-local', d); toast('生成完成'); },
  });
  // ① 本地提取选项方案（按选定类别生成服装/事件时间线；支持初始/追加/中间/补充/重生成）
  registerAiField('stcd-local-opt-suggest', '提取选项方案', function() {
    var card = STCD.localCard;
    var charSeg = card ? (card.text || card.json || '') : '';
    // 收集选中的想象类类别（提取类无需方案）
    var picks = [];
    if (STCD.localCharOpt && STCD.localCharOpt.indexOf('Extract') < 0) picks.push(STCD.localCharOpt);
    if (STCD.localFormOpt && STCD.localFormOpt.indexOf('Extract') < 0) picks.push(STCD.localFormOpt);
    if (STCD.localEventOpt && STCD.localEventOpt.indexOf('Extract') < 0) picks.push(STCD.localEventOpt);
    if (STCD.localStyleOpt && STCD.localStyleOpt.indexOf('Extract') < 0) picks.push(STCD.localStyleOpt);
    var sel = [];
    picks.forEach(function(k) {
      var name = (STCD_LOCAL_OPT_LABELS[k] || k).replace(/^.. /, '');
      var desc = STCD_LOCAL_OPT_DESCS[k] || '';
      sel.push(stcdLocalOptField(k) + '：' + name + (desc ? '\n' + desc : ''));
    });
    // 已有时间线（供追加/中间/补充/重生成参考，避免重复）——实历/想象分两组各自注明
    var ctx = STCD.localOptSuggestCtx || {};
    var list = stcdLocalSuggestListOf(ctx.key || (STCD.localCharOpt || ''));
    var exActual = [];
    var exImagined = [];
    (list.actual || []).forEach(function(it, i) {
      if (!it || !it.label) return;
      exActual.push((i + 1) + '[' + (it.time || '') + ']' + it.label + (it.desc ? '（' + it.desc + '）' : ''));
    });
    (list.imagined || []).forEach(function(it, i) {
      if (!it || !it.label) return;
      exImagined.push((i + 1) + '[' + (it.time || '') + ']' + it.label + (it.desc ? '（' + it.desc + '）' : ''));
    });
    var exParts = [];
    if (exActual.length) exParts.push('实历（实际发生）：\n' + exActual.join('\n'));
    if (exImagined.length) exParts.push('想象（想象发生）：\n' + exImagined.join('\n'));
    var existing = exParts.length ? exParts.join('\n\n') : '（无）';
    // 本次生成目标（由面板动作设置）
    var target = ctx.targetText || '初始生成';
    var count = ctx.count || 0;
    var countText;
    if (ctx.mode === 'reorder') {
      countText = '本次仅调整顺序：不新增方案，只按角色卡信息重排已有时间线（内容完全不变）';
    } else if (count > 0) {
      countText = '生成数量：实际与想象各 ' + count + ' 个';
    } else {
      countText = '生成数量：由你自行判断——依据角色卡的人生经历/阶段划分时间段，每个时间段给出方案，实际与想象各自成组';
    }
    // 命名规则：按当前选中类别只注入服装/形态/事件对应的那一条
    var isEventSel = picks.some(function(k) { return stcdLocalOptField(k) === '事件'; });
    var isFormSel = picks.some(function(k) { return stcdLocalOptField(k) === '形态'; });
    var isStyleSel = picks.some(function(k) { return stcdLocalOptField(k) === '造型'; });
    // 形态通用规则（所有形态共用，统一注入，不写进各形态描述）：衣物与装饰
    var formCommonRule = isFormSel
      ? '\n【形态通用规则】**衣物与装饰**——衣物**自然地与形态本体相结合**，作为**装饰**存在，不要描写成脱去衣物或全裸；**每个方案必须写清衣物的具体状态**（款式/颜色/材质/破损或完好/是否被拘束带或金属环压住），衣物与形态结构融为一体（金属环穿过布料、衣料缠绕部件、布料嵌入缝隙、衣摆被夹于结构之间、束带与拘束带交织等），成为形态表面的一部分，**服装描写不得省略**；**袜装不得偷懒**——袜装须具体写明（样式：连裤/吊带/过膝/渔网/及踝等；颜色与材质），袜装与形态结构/拘束装置结合（吊袜带、袜圈被金属环扣住、袜料缠于部件、破损露肤等）。'
      : '';
    // 造型通用规则（所有造型共用，统一注入，不写进各造型描述）：衣物与整体相结合
    var styleCommonRule = isStyleSel
      ? '\n【造型通用规则】**衣物与整体相结合**——衣物**自然地与造型/整体画面主题相结合**，作为**一部分**存在，不要描写成脱去衣物或全裸；**每个方案必须写清衣物的具体状态**（款式/颜色/材质/破损或完好/是否被造型道具或配饰标记拴住），衣物与手持物/道具/主题融合（衣料缠绕手持物、配饰与衣扣交织、道具穿过衣料、标记牌挂于衣间等），成为整体画面的一部分，**服装描写不得省略**；**袜装不得偷懒**——袜装须具体写明（**长度**：及踝/短筒/中筒/及膝/过膝/大腿/长筒；**透度**：不透明/半透明/肉色/蕾丝透/渔网透；样式：连裤/吊带/过膝/渔网等；颜色与材质），袜装与造型道具/手持物结合（吊袜带、袜圈被道具扣住、袜料缠于道具、破损露肤等）。'
      : '';
    var namingRule = isEventSel
      ? '【命名规则】方案 label 按「[场景/阶段/地点]·[核心事件]」命名：前缀用具体场景/阶段/地点（如 霍尔庄园·晨间礼仪课），不写分类名（正常/色情/堕落/调教/恐虐/色孽/纳垢/奸奇），同一条时间线内 label 不得重复，核心部分直接写事件本身，不堆 desc、不写完整句子。'
      : isFormSel
        ? '【命名规则】方案 label 按「[身份/场合]·[核心形态]」命名：前缀用具体身份或场合（如 花房·青瓷淑女壶），不写分类名（淑女壶/虫化），同一条时间线内 label 不得重复，核心部分直接写形态特征本身（如 釉面长颈壶、鎏金节肢虫体），不堆 desc、不写完整句子。'
        : isStyleSel
          ? '【命名规则】方案 label 按「[身份/场合]·[核心造型]」命名：前缀用具体身份或场合，不写分类名（手持武器/手持道具/手持乐器/手持性玩具/奇异姿势/淫荡姿势/母猪姿势），同一条时间线内 label 不得重复，核心部分直接写造型/手持物/母畜感特征本身（如 夏夜·青龙偃月刀、花厅·汝窑空盏、猪圈·哺乳母猪低伏），不堆 desc、不写完整句子。'
          : '【命名规则】方案 label 按「[身份/场合]·[核心服装]」命名：前缀用具体身份或场合（如 及笄礼·绯红锦袍），不写分类名（正常/色情/堕落），同一条时间线内 label 不得重复，核心部分直接写服装本身，不堆 desc、不写完整句子。';
    // 混沌事件专属：actual 必须基于真实经历改造，不得凭空编造
    var chaosTheme = '';
    var chaosKeys = { eventKhorne: '恐虐', eventSlaanesh: '色孽', eventNurgle: '纳垢', eventTzeentch: '奸奇' };
    picks.forEach(function(k) { if (chaosKeys[k]) chaosTheme = chaosKeys[k]; });
    var chaosRule = chaosTheme
      ? '\n【混沌基调】本次为混沌事件，基调必须极度混沌、极端化：不要温和、不要日常化，所有行为/过程/结果都往极端方向推。\n【实际事件改造】本次为混沌事件：actual（实际发生）必须基于角色卡中真实发生过的事件/经历进行主题化改造，**改造幅度可以很大**——保留原事件的核心人物、关系与情节骨架，但参与人数、对象、方式、过程与结果都可以按「' + chaosTheme + '」主题大幅度改写（例如一对一调教可改写成多人围观/轮番/群交，道具使用可改写成多人+道具同时开发等），使其彻底贴合主题；不得凭空编造一个从未发生过的「实际事件」；imagined（想象发生）可自由推演。'
      : '';
    // 只注入当前模式的规则，不穷举其它模式
    // 字段名按选中类别动态生成（服装/形态/事件），不再写死「服装」
    var fieldName = '服装';
    picks.forEach(function(k) { fieldName = stcdLocalOptField(k); });
    var fullOutput = '【输出格式】完整 JSON：actual 与 imagined 两组分开，各自独立成组；每个方案必须带 time 字段（所处时间段标签，如：幼年/求学/初入江湖/成名后/被炼化后）与 seq 字段，并**自行判定各方案的时间先后，按时间段从前到后排列**；所有方案 label 必须唯一：不得与已有时间线中的任何方案重复，actual 与 imagined 两组之间也不得重复（含相似内容也不得重复）；实历（actual）的 reason 注明来源于角色卡哪段经历/日常，想象（imagined）的 reason 写明设计思路（基于角色何特点/背景设想）。**每个方案必须带 origin 字段，注明「原创」或「参考示例」**：原创=自行设计的新结构；参考示例=直接采用或明显基于示例库的结构。\n{"actual":[{"seq":1,"field":"' + fieldName + '","label":"方案名","desc":"款式/颜色/材质","reason":"来源或思路","time":"时间段标签","origin":"原创"}],"imagined":[{"seq":1,"field":"' + fieldName + '","label":"方案名","desc":"款式/颜色/材质","reason":"来源或思路","time":"时间段标签","origin":"参考示例"}]}';
    var modeRules = {
      init: '【生成模式】初始/追加生成：保留已有方案，追加生成新的、与已有不重复的方案（已有为空时即全新生成），不覆盖原有。',
      reorder: '【生成模式】顺序调整：只把已有时间线中的方案按正确时间先后重新排序输出。**label 必须与已有时间线完全一致（软件靠 label 定位方案）**，seq 按新时间顺序重新编号（1、2、3、4…），time/desc/reason 等一律沿用原文一字不改，不新增、不删除、不改写内容。\n【输出格式】精简 JSON：actual 与 imagined 两组分开，各自独立成组，每个方案只含 seq 与 label 两个字段，不要输出 desc/reason/time/field。\n{"actual":[{"seq":1,"label":"方案名"}],"imagined":[{"seq":1,"label":"方案名"}]}',
      before: '【生成模式】时间线之前：生成早于已有时间线最早阶段的方案（**只生成一个方案**，且与已有不重复）。',
      after: '【生成模式】时间线之后：生成晚于已有时间线最晚阶段的方案（**只生成一个方案**，且与已有不重复）。',
      between: '【生成模式】两段之间：生成处于『段A 与 段B 之间』时间段的方案（**只生成一个方案**，且与已有不重复）。',
      refill: '【生成模式】某段补充：生成同属该时间段的更多方案（与已有不重复）。',
      regenerate: '【生成模式】单项重生成：只重新生成指定方案（保持其时间段与地位，其他方案不动）。',
    };
    var modeRule = modeRules[ctx.mode] || modeRules.init;
    if (ctx.mode !== 'reorder') modeRule += '\n' + fullOutput + chaosRule;
    return {
      user: '角色卡：\n' + charSeg + '\n\n选定类别：\n' + sel.join('\n') + '\n\n已有时间线：\n' + (existing || '（无）') + '\n\n本次生成目标：' + target + '\n' + countText + '\n\n' + namingRule + formCommonRule + '\n\n' + modeRule,
      charData: charSeg,
      selDescs: sel.join('\n'),
      existing: existing || '（无）',
      target: target,
      count: countText,
      namingRule: namingRule,
      commonRule: formCommonRule + styleCommonRule,
      modeRule: modeRule,
    };
  }, {
    suggestPrompt: 'stcd_local_opt_suggest',
    fillFn: function(d) { stcdLocalOptSuggestShow(d); },
  });
  // ① 深化设计（对已有服装/事件方案注入设计感；支持单项/全部；只改写 desc，label/reason/time/seq 不动）
  registerAiField('stcd-local-opt-deepen', '深化设计', function() {
    var card = STCD.localCard;
    var charSeg = card ? (card.text || card.json || '') : '';
    var ctx = STCD.localOptDeepenCtx || { key: (STCD.localCharOpt || ''), mode: 'all' };
    var key = ctx.key;
    var list = stcdLocalSuggestListOf(key);
    // 类别名（只作基调参考，不传类别描述——描述内含大量肉体细节，会误导深化方向；深化只聚焦服装/形态本身）
    var sel = [];
    [STCD.localCharOpt, STCD.localFormOpt, STCD.localEventOpt, STCD.localStyleOpt].forEach(function(k) {
      if (!k) return;
      var name = (STCD_LOCAL_OPT_LABELS[k] || k).replace(/^.. /, '');
      sel.push(stcdLocalOptField(k) + '：' + name);
    });
    // 待深化方案：全部 / 单项
    var targets = [];
    function pushItems(arr, side) {
      (arr || []).forEach(function(it) {
        if (!it || !it.label) return;
        targets.push((side === 'actual' ? '[实历]' : '[想象]') + (it.time ? '[' + it.time + ']' : '') + it.label + (it.desc ? '：' + it.desc : ''));
      });
    }
    if (ctx.mode === 'one' && ctx.side && ctx.idx != null) {
      var arr = list[ctx.side] || [];
      var one = arr[ctx.idx];
      if (one && one.label) targets.push((ctx.side === 'actual' ? '[实历]' : '[想象]') + (one.time ? '[' + one.time + ']' : '') + one.label + (one.desc ? '：' + one.desc : ''));
    } else {
      pushItems(list.actual, 'actual');
      pushItems(list.imagined, 'imagined');
    }
    var itemsText = targets.length ? targets.join('\n') : '（无方案）';
    var targetText = (ctx.mode === 'one') ? '单项深化：' + (ctx.oneLabel || '') : '深化该时间线全部方案';
    var user = [charSeg ? '角色卡：\n' + charSeg : '', sel.length ? '选定类别：\n' + sel.join('\n') : '', '待深化方案：\n' + itemsText, '本次目标：' + targetText].filter(Boolean).join('\n\n');
    return {
      user: user,
      charData: charSeg,
      selDescs: sel.join('\n'),
      itemsText: itemsText,
      targetText: targetText,
    };
  }, {
    suggestPrompt: 'stcd_local_opt_deepen',
    fillFn: function(d) { stcdLocalOptDeepenShow(d); },
  });
  // ② 本地批量
  registerAiField('stcd-batch-gen', '本地批量提示词', function() {
    var text = (document.getElementById('stcd-batch-require') || {}).value || '';
    var char = (document.getElementById('stcd-batch-char') || {}).value || '';
    var v = commonVars();
    v.user = char ? '【人物】\n' + char + '\n\n【创作要求】\n' + text : text;
    return v;
  }, {
    suggestPrompt: STCD.batchMode === 'variant' ? 'local_variants_prompt_gen' : 'local_batch_prompt_gen',
    fillFn: function(d) {
      var items = (d && (d.items || d.prompts)) || [];
      if (items.length) stcdBatchFill(items);
      else if (d && d.prompt) stcdBatchFill([{ topic: '', prompt: d.prompt, prompt_cn: d.prompt_cn || '', zh: d.zh || '' }]);
      toast('批量生成完成');
    },
  });
  // ③ 本地视频提示词（模型切换时重注册，见 stcdVideoModelChanged）
  stcdRegisterVideoGenField();
  // ④ 云端提示词
  registerAiField('stcd-cloud-gen', '云端提示词', function() {
    var text = (document.getElementById('stcd-cloud-require') || {}).value || '';
    var char = (document.getElementById('stcd-cloud-char') || {}).value || '';
    var v = commonVars();
    v.user = char ? '【人物】\n' + char + '\n\n【创作要求】\n' + text : text;
    var preset = (typeof stcdCurrentBannedPreset === 'function') ? stcdCurrentBannedPreset() : { words: '', note: '' };
    // 两段分明：生成要求（note）在前，禁止词（words）在后
    var req = (preset.note || '').trim();
    var ban = (preset.words || '').trim();
    var parts = [];
    if (req) parts.push('【生成要求】' + req);
    if (ban) parts.push('【禁止词】' + ban);
    v.bannedRule = parts.join('\n');
    return v;
  }, {
    suggestPrompt: 'cloud_prompt_gen',
    fillFn: function(d) { stcdFillResult('stcd-cloud', d); toast('生成完成'); },
  });
  // ⑤ 词典
  registerAiField('sheng-tu-ci-dian-gen', '生图词典生成', function() {
    var text = (document.getElementById('stcd-require') || {}).value || '';
    var v = commonVars();
    v.user = text;
    return v;
  }, {
    suggestPrompt: 'sd_prompt_gen',
    fillFn: function(d) {
      STCD.lastResult = d;
      stcdFillResult('stcd-dict', d);
      toast('生成完成');
    },
  });
})();
