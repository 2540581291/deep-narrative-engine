// 生图词典 · AI 字段注册（二元模板：注册字段 + 提示词模板 + 回填函数）
// 依赖：所有 UI/数据文件已先加载（stcdModeVar/stcdFormatVar/stcdFillResult/stcdBatchFill/
//       STCD_LOCAL_OPT_LABELS/DESCS/stcdLocalOptField/stcdLocalDetailAsList/stcdLocalSuggestListOf/
//       stcdLocalOptSuggestShow/stcdLocalOptDeepenShow/stcdRegisterVideoGenField/stcdCurrentBannedPreset）

(function() {
  if (typeof registerAiField !== 'function') return;
  // 取某条方案的时间段/名称，用于在提示词里点明「插入位置锚点」
  function 段名(it) {
    if (!it) return '未知';
    return it.time || it.label || '未知';
  }
  // 通用模板变量：输出模式
  function commonVars() {
    return {
      mode: stcdModeVar(),
      outputFormat: stcdFormatVar(),
    };
  }
  // ① 本地提示词（角色卡 + 内容选项[各类别选一] + 创作要求，一次生成）
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
    if (STCD.localChaosOpt) picks.push(STCD.localChaosOpt);
    if (STCD.localFormOpt) picks.push(STCD.localFormOpt);
    if (STCD.localChaosFormOpt) picks.push(STCD.localChaosFormOpt);
    if (STCD.localChaosStyleOpt) picks.push(STCD.localChaosStyleOpt);
    if (STCD.localChaosGroupOpt) picks.push(STCD.localChaosGroupOpt);
    if (STCD.localGroupOpt) picks.push(STCD.localGroupOpt);
    if (STCD.localSectionOpt) picks.push(STCD.localSectionOpt);
    if (STCD.localChaosSectionOpt) picks.push(STCD.localChaosSectionOpt);
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
    var isForm = picks.some(function(k) { var f = stcdLocalOptField(k); return f === '形态' || f === '混沌形态'; });
    var isGroup = picks.some(function(k) { var f = stcdLocalOptField(k); return f === '群像' || f === '混沌群像' || f === '剖面' || f === '混沌剖面'; });
    // 造型组里的「合影摆拍」本身就是多人画面，不能落进下面的单人 solo 规则
    var isGroupPose = picks.some(function(k) { return k === 'styleGroupPose'; });
    var isGroupSex = picks.some(function(k) { return k === 'eventGroupSex'; });
    // 身高规则仅服装类启用（形态/事件不注入）：
    // 外观年龄 16 岁以下（含 16 岁）必须在姓名后追加身高标签，数值根据角色卡体型/外貌描述自行推断，须与外观年龄和体型相符；17 岁及以上不写身高
    v.heightRule = isEvent || isForm
      ? ''
      : '   - 身高（仅外观年龄 16 岁以下且含 16 岁时启用）：当角色的外观年龄在 16 岁以下时，在「姓名」之后**必须追加身高标签**（如 140cm、130cm tall、height 120cm 等），身高数值**根据角色卡的体型/外貌描述自行推断**（如角色卡写「娇小」「幼态」→ 往 130cm 上下推；写「身材矮小、骨骼纤细」→ 更低；若角色卡有明确身高描述则按它来），推断值须与外观年龄和体型描述相符，不要凭空给一个与描述矛盾的身高；外观年龄 17 岁及以上**不写身高**，保持三段';
    v.eventRule = isGroupSex
      ? '2. 以群体性行为为画面主体：多人（至少 3 人以上）一起进行的性行为，各人各动作、不重复，画面主体是群交场面本身'
      : isEvent
        ? '2. 以事件为描写主体，可包含角色正在进行的活动；角色姿态须符合事件情境\n3. 不得出现其他无关人员'
        : isGroup
          ? '2. 以多人群体为画面主体：**群像全景**——画面中至少 3 人以上**均匀散布**、各做各的事，**无单一焦点**（不聚焦、不突出任何一个人，人物大小相近、地位平等），**深景深**（所有人都在焦点内、不虚化任何人物），视角用全景/远景 wide shot / long shot（平视或略俯视）；人物之间有清晰的关系与互动，角色卡角色是群像的一员（不是主角，只是这场的一部分）'
          : isGroupPose
            ? '2. 以**多人摆拍合影**为画面主体：**至少 3 人以上**（角色是其中之一，不是唯一主角）**全员刻意摆好姿势、一起朝向镜头**，如合影 / 画报封面式的定格摆拍；**必须写清总人数与每个人的位置和姿势**；人人朝向观者，**不是各做各事的群像、也不是正在发生的性交场面**；所有人动作**静止定格**（摆拍感），相邻的人之间要有真实的接触 / 关系（贴靠 / 搭肩 / 牵手 / 牵绳 / 叠压）'
          : isForm
            ? ''
            : '2. **画面中只有角色一个人**：英文 prompt 中必须明确写出 solo（或 1girl / 1boy / futa / femboy 等单人标签，与开头性别标签一致），不得出现第二个人、不得出现其他任何人或剪影，也不描写所在场所';
    v.user = [charSeg ? '【角色信息】\n' + charSeg : '', optsSeg ? '【本次任务】\n' + optsSeg : '', text ? '【创作要求】\n' + text : ''].filter(Boolean).join('\n\n');
    return v;
  }, {
    suggestPrompt: 'local_prompt_gen',
    fillFn: function(d) { stcdFillResult('stcd-local', d); toast('生成完成'); },
  });
  // ① 本地提取选项方案（按选定类别生成时间线；支持初始/追加/中间/补充/重生成）
  registerAiField('stcd-local-opt-suggest', '提取选项方案', function() {
    var card = STCD.localCard;
    var charSeg = card ? (card.text || card.json || '') : '';
    // 收集选中的想象类类别（提取类无需方案）
    var picks = [];
    if (STCD.localCharOpt && STCD.localCharOpt.indexOf('Extract') < 0) picks.push(STCD.localCharOpt);
    if (STCD.localChaosOpt && STCD.localChaosOpt.indexOf('Extract') < 0) picks.push(STCD.localChaosOpt);
    if (STCD.localFormOpt && STCD.localFormOpt.indexOf('Extract') < 0) picks.push(STCD.localFormOpt);
    if (STCD.localChaosFormOpt && STCD.localChaosFormOpt.indexOf('Extract') < 0) picks.push(STCD.localChaosFormOpt);
    if (STCD.localChaosStyleOpt && STCD.localChaosStyleOpt.indexOf('Extract') < 0) picks.push(STCD.localChaosStyleOpt);
    if (STCD.localChaosGroupOpt && STCD.localChaosGroupOpt.indexOf('Extract') < 0) picks.push(STCD.localChaosGroupOpt);
    if (STCD.localGroupOpt && STCD.localGroupOpt.indexOf('Extract') < 0) picks.push(STCD.localGroupOpt);
    if (STCD.localSectionOpt && STCD.localSectionOpt.indexOf('Extract') < 0) picks.push(STCD.localSectionOpt);
    if (STCD.localChaosSectionOpt && STCD.localChaosSectionOpt.indexOf('Extract') < 0) picks.push(STCD.localChaosSectionOpt);
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
    // 仅「形态 / 造型」需要注入衣物通用规则（其余类别的写法由各自 DESC 负责）
    var isFormSel = picks.some(function(k) { var f = stcdLocalOptField(k); return f === '形态' || f === '混沌形态'; });
    var isStyleSel = picks.some(function(k) { var f = stcdLocalOptField(k); return f === '造型' || f === '混沌造型'; });
    // 形态通用规则（所有形态共用，统一注入，不写进各形态描述）：衣物与装饰
    var formCommonRule = isFormSel
      ? '\n【形态通用规则】**衣物与装饰**——衣物**自然地与形态本体相结合**，作为**装饰**存在，不要描写成脱去衣物或全裸；**每个方案必须写清衣物的具体状态**（款式/颜色/材质/破损或完好/是否被拘束带或金属环压住），衣物与形态结构融为一体（金属环穿过布料、衣料缠绕部件、布料嵌入缝隙、衣摆被夹于结构之间、束带与拘束带交织等），成为形态表面的一部分，**服装描写不得省略**；**袜装不得偷懒**——袜装须具体写明（样式：连裤/吊带/过膝/渔网/及踝等；颜色与材质），袜装与形态结构/拘束装置结合（吊袜带、袜圈被金属环扣住、袜料缠于部件、破损露肤等）。'
      : '';
    // 造型通用规则（所有造型共用，统一注入，不写进各造型描述）：衣物与整体相结合
    var styleCommonRule = isStyleSel
      ? '\n【造型通用规则】**衣物与整体相结合**——衣物**自然地与造型/整体画面主题相结合**，作为**一部分**存在，不要描写成脱去衣物或全裸；**每个方案必须写清衣物的具体状态**（款式/颜色/材质/破损或完好/是否被造型道具或配饰标记拴住），衣物与手持物/道具/主题融合（衣料缠绕手持物、配饰与衣扣交织、道具穿过衣料、标记牌挂于衣间等），成为整体画面的一部分，**服装描写不得省略**；**袜装不得偷懒**——袜装须具体写明（**长度**：及踝/短筒/中筒/及膝/过膝/大腿/长筒；**透度**：不透明/半透明/肉色/蕾丝透/渔网透；样式：连裤/吊带/过膝/渔网等；颜色与材质），袜装与造型道具/手持物结合（吊袜带、袜圈被道具扣住、袜料缠于道具、破损露肤等）。'
      : '';
    // 命名规则：所有类别统一一套（不按类别分支）
    var namingRule = '【命名规则】方案 label 按「[场景/场合/身份]·[核心特征]」命名：前缀用具体的场景、场合或身份（如 夜宴、祭坛、及笄礼、花房、猪圈、被俘后），不写分类名；后缀直接写该方案的核心特征本身（如 满堂宾客、绯红锦袍、青瓷淑女壶、青龙偃月刀、锁骨朱砂符、众奴跪侍），不堆 desc、不写完整句子；同一条时间线内 label 不得重复。';
    // 混沌事件专属：actual 基于真实经历做主题化改造，混沌幅度可更大
    var chaosTheme = '';
    var chaosKeys = { eventKhorne: '恐虐', eventSlaanesh: '色孽', eventNurgle: '纳垢', eventTzeentch: '奸奇' };
    picks.forEach(function(k) { if (chaosKeys[k]) chaosTheme = chaosKeys[k]; });
    var chaosRule = chaosTheme
      ? '\n【混沌基调】本次为混沌事件，基调必须极度混沌、极端化：不要温和、不要日常化，所有行为/过程/结果都往极端方向推。\n【混沌改造幅度】在通用「实历·想象主题化改造」的基础上，本次因是混沌事件，**改造幅度可在此基础上更大**——实历与想象都可把参与人数、对象、方式、过程与结果按「' + chaosTheme + '」主题大幅改写（例如一对一调教可改写成多人围观/轮番/群交，道具使用可改写成多人+道具同时开发等），使其彻底贴合混沌主题；实历仍保留核心人物、关系与情节骨架；想象同样不得脱离混沌主题另起炉灶。'
      : '';
    // 「本次只动哪一条时间线」：定点插入类操作必须说清，否则 AI 会把实历/想象当成一条线
    var trackKey = (ctx.track === 'actual' || ctx.track === 'imagined') ? ctx.track : '';
    var trackName = trackKey === 'imagined' ? '想象' : (trackKey === 'actual' ? '实历' : '');
    var trackArr = trackKey ? (list[trackKey] || []) : [];
    // 插入位置：直接写清「在实历/想象这条线的哪个位置」，锚点取自该条线本身
    var posRule;
    if (ctx.mode === 'before') posRule = '生成早于「' + trackName + '」这条时间线最早阶段『' + 段名(trackArr[0]) + '』的方案';
    else if (ctx.mode === 'after') posRule = '生成晚于「' + trackName + '」这条时间线最晚阶段『' + 段名(trackArr[trackArr.length - 1]) + '』的方案';
    else if (ctx.mode === 'between') posRule = '生成处于「' + trackName + '」这条时间线中『' + 段名(trackArr[ctx.insertIndex - 1]) + '』与『' + 段名(trackArr[ctx.insertIndex]) + '』两个阶段之间的方案';
    else if (ctx.mode === 'refill') posRule = '在「' + trackName + '」这条时间线的『' + 段名(trackArr[ctx.insertIndex - 1]) + '』这一时间段内补充方案';
    else if (ctx.mode === 'regenerate') posRule = '重新生成「' + trackName + '」这条时间线中『' + 段名(trackArr[ctx.replaceIndex]) + '』这一条方案';
    // 只注入当前模式的规则，不穷举其它模式
    // 字段名按选中类别动态生成（服装/形态/事件），不再写死「服装」
    var fieldName = '服装';
    picks.forEach(function(k) { fieldName = stcdLocalOptField(k); });
    var fullOutput = '【输出格式】完整 JSON：actual 与 imagined 两组分开，各自独立成组；每个方案必须带 time 字段（所处时间段标签，如：幼年/求学/初入江湖/成名后/被炼化后）与 seq 字段，并**自行判定各方案的时间先后，按时间段从前到后排列**；所有方案 label 必须唯一：不得与已有时间线中的任何方案重复，两条时间线之间也不得重复（含相似内容也不得重复），但**两条线各有各的阶段顺序，不得互相顶替**；实历（actual）的 reason 注明来源于角色卡哪段经历/日常，想象（imagined）的 reason 写明设计思路（基于角色何特点/背景设想）。**每个方案必须带 origin 字段，注明「原创」或「参考示例」**：原创=自行设计的新结构；参考示例=直接采用或明显基于示例库的结构。\n{"actual":[{"seq":1,"field":"' + fieldName + '","label":"方案名","desc":"具体描述（按选定类别写）","reason":"来源或思路","time":"时间段标签","origin":"原创"}],"imagined":[{"seq":1,"field":"' + fieldName + '","label":"方案名","desc":"具体描述（按选定类别写）","reason":"来源或思路","time":"时间段标签","origin":"参考示例"}]}';
    var modeRules = {
      init: '【生成模式】初始/追加生成：保留已有方案，追加生成新的、与已有不重复的方案（已有为空时即全新生成），不覆盖原有。',
      reorder: '【生成模式】顺序调整：只把**每一条时间线各自**的方案按正确时间先后重新排序输出（实历按实历自己的阶段排、想象按想象自己的阶段排，两条线互不参照）。**label 必须与已有时间线完全一致（软件靠 label 定位方案）**，seq 按**该条线内**的新时间顺序重新编号（1、2、3、4…），time/desc/reason 等一律沿用原文一字不改，不新增、不删除、不改写内容。\n【输出格式】精简 JSON：actual 与 imagined 两组分开，各自独立成组，每个方案只含 seq 与 label 两个字段，不要输出 desc/reason/time/field。\n{"actual":[{"seq":1,"label":"方案名"}],"imagined":[{"seq":1,"label":"方案名"}]}',
      before: '【生成模式】时间线之前：' + posRule + '（**只生成一个方案**，且与已有不重复）。',
      after: '【生成模式】时间线之后：' + posRule + '（**只生成一个方案**，且与已有不重复）。',
      between: '【生成模式】两段之间：' + posRule + '（**只生成一个方案**，且与已有不重复）。',
      refill: '【生成模式】某段补充：' + posRule + '（与已有不重复）。',
      regenerate: '【生成模式】单项重生成：' + posRule + '（保持其时间段与地位，其他方案一律不动）。',
    };
    var modeRule = modeRules[ctx.mode] || modeRules.init;
    if (ctx.mode !== 'reorder') modeRule += '\n' + fullOutput + chaosRule;

    // ===== 追加生成：必须真的「新的」，不许拿近似方案充数 =====
    // 实测问题：第二次生成时 AI 很容易把已有方案改一两个字（「青瓷淑女壶」→「青瓷长颈淑女壶」）
    // 或只增减一句描述就当成新方案交差。原来的提示词只说「不得重复」，没给判据也没给换维度的方向。
    var 追加模式 = (ctx.mode === 'init' || ctx.mode === 'append');
    var 已有条数 = exActual.length + exImagined.length;
    var noveltyRule = '';
    if (追加模式 && 已有条数 > 0) {
      noveltyRule = '\n【本次是「追加」，不是重排——已有方案一律不得再出现】'
        + '上面「已有时间线」已列出 ' + 已有条数 + ' 条方案，**它们全部作废，一个新方案都不许与它们相同或近似**。\n'
        + '**什么算重复（只要命中任一条，就算重复，必须重做）：**\n'
        + '· label 相同，或只在原 label 上**加/减一两个词**（如「花房·青瓷淑女壶」→「花房·青瓷长颈淑女壶」）；\n'
        + '· 内容（desc）只是把已有方案的描述**加一句、减一句、换几个词**，主体结构不变；\n'
        + '· 只是把同一件事**换个说法**（同义改写、调换语序、繁简互换）。\n'
        + '**什么才算真正的新方案（必须换维度，而不是改写措辞）：**换一个**摆放/固定方式**（立/卧/悬吊/倒置/穿挂/嵌入）；换一个**承重与结合结构**（基座/支架/横杆/环束/贯穿位置不同）；换一种**器具或器械形制**（不同器物种类、不同武器种类、不同家具种类）；换一个**身体部位作为主体**（改为以手/臂/脊背/腹部/颈部为主）；换一个**使用方式或触发方式**（如何被使用、如何启动）。\n'
        + '**硬要求**：本次给出的新方案，与已有方案之间**至少在两处维度上不同**；`reason` 里必须写明「与已有的哪条不同、不同在哪」。\n'
        + '**自检**：交卷前逐条对比已有的 ' + 已有条数 + ' 条——若某条只是已有方案的改写，**必须丢弃重做**，不要凑数；宁可少给几条，也不许给近似的。';
    }
    modeRule += noveltyRule;

    // ===== 双时间线轨道说明 =====
    // 实历与想象是**两条彼此独立的时间线**：各自从 1 排序，界面也是左右两栏分开显示。
    // 定点插入类操作（之前/之后/两段之间/某段补充/单项重生成）的锚点是从**某一栏**取的，
    // 若不明说这一栏属于哪条时间线，AI 会把两条线当成一条来判定插入位置，
    // 于是「这个方案是在实历里还是在想象里」就糊了。
    var trackRule;
    if (trackKey) {
      trackRule = '\n【本次只动「' + trackName + '」这一条时间线】**实历与想象是两条彼此独立的时间线**，各自从 1 排序；上文「已有时间线」里列出的两组是**两条线**，不是同一条线的前后段。本次操作的锚点全部取自「' + trackName + '」这一条，判定时间先后时**不得参考另一条时间线的阶段**。\n'
        + '· 输出**只填 ' + trackKey + ' 数组**，' + (trackKey === 'actual' ? 'imagined' : 'actual') + ' 数组给空数组（不要为了「两组都凑齐」往另一条时间线里塞方案）。\n'
        + '· 性质：' + (trackKey === 'actual'
          ? '「实历」是**从角色卡经历出发的事**——本次沿用角色卡已有的经历/日常来设计（reason 注明出自角色卡哪一段）。'
          : '「想象」是**按角色特点/背景自由设想的事**——本次按设计思路自由发挥即可（reason 写明思路），**不得声称为角色卡中真实发生过的事**。')
        + '\n· seq 仍按「' + trackName + '」这条线内的时间先后编号（从 1 起）。';
    } else {
      trackRule = '\n【两条时间线彼此独立】**实历（actual）与想象（imagined）是两条彼此独立的时间线**，各自从 1 起排序、各自成组。实历=从角色卡经历出发的方案（time 沿用角色卡人生阶段，reason 注明出处）；想象=按角色特点/背景自由设想的方案（reason 写明思路）。**不要把两条线当成一条来排先后，也不要把其中一条的阶段套到另一条上。**';
    }
    // 回填侧也用它：定点插入只允许落在用户点的那一栏，AI 若把方案塞进另一条线，一并归到所点这条线
    ctx.track = trackKey || null;

    return {
      user: '角色卡：\n' + charSeg + '\n\n选定类别：\n' + sel.join('\n') + '\n\n已有时间线：\n' + (existing || '（无）') + '\n\n本次生成目标：' + target + '\n' + countText + '\n\n' + trackRule + '\n\n' + namingRule + formCommonRule + '\n\n' + modeRule,
      charData: charSeg,
      selDescs: sel.join('\n'),
      existing: existing || '（无）',
      target: target,
      count: countText,
      trackRule: trackRule,
      namingRule: namingRule,
      commonRule: formCommonRule + styleCommonRule,
      modeRule: modeRule,
    };
  }, {
    suggestPrompt: 'stcd_local_opt_suggest',
    fillFn: function(d) { stcdLocalOptSuggestShow(d); },
  });

  // ===== 深化方向预设 chip：一比一列出所有现有类别（复用已写好的类别 DESC 作设计语言）=====
  // 说明：其它 AI 字段的预设方向是「手写独立片段」；这里的深化方向是「复用已写好的 STCD_LOCAL_OPT_DESCS」，
  //       所以运行时把各类别 DESC 取出填进 chip（50+ 个手写复制会爆、且与 DESC 双处失同步）。
  // 换行处理：DESC 内含真实换行，会破坏 onclick 内联字符串；先把真实换行转字面 \n，
  //       经 escHtml 内联后，浏览器解析 onclick 时由 JS 把字面 \n 还原为真实换行，LLM 收到完整格式。
  if (typeof window.AI_QUICK_PRESETS === 'object' && window.AI_QUICK_PRESETS !== null) {
    var deepenGroups = [
      { label: '服装', arr: STCD_LOCAL_CHAR_OPTS },
      { label: '混沌服装', arr: STCD_LOCAL_CHAOS_OPTS },
      { label: '形态', arr: STCD_LOCAL_FORM_OPTS },
      { label: '混沌形态', arr: STCD_LOCAL_CHAOS_FORM_OPTS },
      { label: '造型', arr: STCD_LOCAL_STYLE_OPTS },
      { label: '混沌造型', arr: STCD_LOCAL_CHAOS_STYLE_OPTS },
      { label: '群像', arr: STCD_LOCAL_GROUP_OPTS },
      { label: '剖面', arr: STCD_LOCAL_SECTION_OPTS },
      { label: '混沌剖面', arr: STCD_LOCAL_CHAOS_SECTION_OPTS },
      { label: '混沌群像', arr: STCD_LOCAL_CHAOS_GROUP_OPTS },
      { label: '事件', arr: ['eventNormal', 'eventErotic', 'eventFallen', 'eventTraining', 'eventGroupSex', 'eventKhorne', 'eventSlaanesh', 'eventNurgle', 'eventTzeentch'] },
    ];
    var deepenChips = [{ label: '✨ 通用深化', dir: '服装设计语言（作为笔法）：以「衣着穿戴」为设计维度——款式（廓形/版型：A字/鱼尾/直筒/蓬裙/曳地/修身等）、领口与袖型（立领/V领/一字肩/泡泡袖/喇叭袖等）、剪裁结构（腰带/束腰/褶皱/荷叶边/开衩/镂空/拼接等）、材质层次（主料/里料/辅料与质感对比）、配色逻辑（主色/辅色/点缀色）、纹样装饰（刺绣/暗纹/印花/花边/珠饰/金属件等）、配饰衔接（头饰/颈饰/腰饰/鞋袜与服装的搭配，袜装注明长度与透度）、暴露度（深V/露背/开衩/镂空/透视，暴露度只增不减）；可往风格化·奇装异服方向放大（颜色对冲/非主流前卫/材质奇趣/单品全身化/结构功能异化/超现实物理不可能/元素异化·材质换血/穿法·体量异化）；正常服装走前卫日常、色情/堕落服装可彻底放飞。', category: '通用', mutual: true }];
    deepenGroups.forEach(function(g) {
      (g.arr || []).forEach(function(key) {
        var dLabel = STCD_LOCAL_OPT_LABELS[key] || key;
        var dName = String(dLabel).replace(/^.. /, '');
        var dDesc = STCD_LOCAL_OPT_DESCS[key] || '';
        if (!dDesc) return;
        var dFull = '【深化方向：' + dName + '】本次深化请用「' + dName + '」的设计语言，据此深化方案（保持方案本质与类别基调不变，label 一字不改、只改写 desc；深化对象是「' + dName + '」本身，不描写无关的东西）。「' + dName + '」的设计语言定义如下：\n' + dDesc;
        deepenChips.push({
          label: dLabel,
          // 真实换行 → 字面 \n（onclick 内联安全，JS 解析时还原）；ASCII 单引号 → 中文右引号（避免 escHtml 的 &#39; 破坏 onclick 字符串）
          dir: dFull.replace(/\n/g, '\\n').replace(/'/g, '\u2019'),
          category: g.label,
          mutual: true,
        });
      });
    });
    window.AI_QUICK_PRESETS['stcd-local-opt-deepen'] = deepenChips;
    // 补充分组标题配色（catInfo 顶层 var 在浏览器里是 window 属性；补不上也不影响功能，只影响分组小标题）
    if (typeof window.catInfo === 'object' && window.catInfo !== null) {
      window.catInfo['通用'] = { label: '通用', color: '#94a3b8' };
      window.catInfo['服装'] = { label: '服装', color: '#f783ac' };
      window.catInfo['混沌服装'] = { label: '混沌服装', color: '#e94560' };
      window.catInfo['形态'] = { label: '形态', color: '#22d3ee' };
      window.catInfo['混沌形态'] = { label: '混沌形态', color: '#c084fc' };
      window.catInfo['造型'] = { label: '造型', color: '#4ecca3' };
      window.catInfo['混沌造型'] = { label: '混沌造型', color: '#fb923c' };
      window.catInfo['群像'] = { label: '群像', color: '#34d399' };
      window.catInfo['混沌群像'] = { label: '混沌群像', color: '#f472b6' };
      window.catInfo['事件'] = { label: '事件', color: '#a78bfa' };
    }
  }

  // ① 深化设计（对已有方案注入设计感；支持单项；只改写 desc，label/reason/time/seq 不动）
  registerAiField('stcd-local-opt-deepen', '深化设计', function() {
    var card = STCD.localCard;
    var charSeg = card ? (card.text || card.json || '') : '';
    var ctx = STCD.localOptDeepenCtx || { key: (STCD.localCharOpt || ''), mode: 'all' };
    var key = ctx.key;
    var list = stcdLocalSuggestListOf(key);
    // 类别名（只作基调参考，不传类别描述——描述内含大量肉体细节，会误导深化方向；深化只聚焦服装/形态本身）
    var sel = [];
    [STCD.localCharOpt, STCD.localChaosOpt, STCD.localFormOpt, STCD.localChaosFormOpt, STCD.localChaosStyleOpt, STCD.localChaosGroupOpt, STCD.localGroupOpt, STCD.localSectionOpt, STCD.localChaosSectionOpt, STCD.localEventOpt, STCD.localStyleOpt].forEach(function(k) {
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
  // ② 多人（在现有方案基础上增加一个角色，由 AI 自行判断怎么融入）
  registerAiField('stcd-local-opt-addchar', '多人', function() {
    var card = STCD.localCard;
    var charSeg = card ? (card.text || card.json || '') : '';
    var ctx = STCD.localOptAddCharCtx || {};
    var key = ctx.key;
    var list = stcdLocalSuggestListOf(key);
    var sel = [];
    [STCD.localCharOpt, STCD.localChaosOpt, STCD.localFormOpt, STCD.localChaosFormOpt, STCD.localChaosStyleOpt, STCD.localChaosGroupOpt, STCD.localGroupOpt, STCD.localSectionOpt, STCD.localChaosSectionOpt, STCD.localEventOpt, STCD.localStyleOpt].forEach(function(k) {
      if (!k) return;
      var name = (STCD_LOCAL_OPT_LABELS[k] || k).replace(/^.. /, '');
      sel.push(stcdLocalOptField(k) + '：' + name);
    });
    // 待处理方案：只处理当前这一条（单人场景增加一个角色）
    var targets = [];
    var arr = ctx.side ? (list[ctx.side] || []) : [];
    var one = (ctx.idx != null) ? arr[ctx.idx] : null;
    if (one && one.label) targets.push((ctx.side === 'actual' ? '[实历]' : '[想象]') + (one.time ? '[' + one.time + ']' : '') + one.label + (one.desc ? '：' + one.desc : ''));
    var itemsText = targets.length ? targets.join('\n') : '（无方案）';
    var newChar = ctx.charText ? ('【' + (ctx.charName || '') + '】\n' + ctx.charText) : '（未选择角色）';
    var user = [charSeg ? '角色卡（主）：\n' + charSeg : '', sel.length ? '选定类别（只作基调参考）：\n' + sel.join('\n') : '', '待处理方案：\n' + itemsText].filter(Boolean).join('\n\n');
    return {
      user: user,
      charData: charSeg,
      selDescs: sel.join('\n'),
      itemsText: itemsText,
      newChar: newChar,
    };
  }, {
    suggestPrompt: 'stcd_local_opt_addchar',
    fillFn: function(d) { stcdLocalOptAddCharShow(d); },
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
