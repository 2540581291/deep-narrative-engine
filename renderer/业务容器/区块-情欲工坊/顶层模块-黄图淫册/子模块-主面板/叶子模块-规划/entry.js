// 黄图淫册 · 📝 规划（作品模式 + 期号模式）

// ===== 提示词模板（二元模板 · Prompt 结构层） =====
registerPrompt('ht_program_name', {
  system: '',
  user: '你是一个图画/画册策划专家。根据以下作品完整信息生成{count}个合适的作品名称。JSON输出：{"options":["名称1","名称2"]}。{wordLimit}{direction}\n\n{context}\n\n基于以上全部信息，生成合适的作品名称选项。',
});
registerPrompt('ht_program_focus', {
  system: '',
  user: '你是一个图画/画册策划专家。根据以下作品完整信息生成{count}个合适的作品定位/关注方向。JSON输出：{"options":["方向1","方向2"]}。{wordLimit}{direction}\n\n{context}\n\n基于以上全部信息，生成合适的作品定位和关注方向选项。',
});
registerPrompt('ht_program_desc', {
  system: '',
  user: '你是一个图画/画册策划专家。根据作品所有信息撰写作品简介，聚焦于作品的主题内容和题材方向。\n\n{context}\n\n请为这个作品撰写一段简介，说明本作品聚焦什么题材、什么主题方向、关注哪类画面和人物。不要涉及板块结构或排版安排，只需说明作品的话题领域和内容取向。直接输出简介正文，不要标题。',
});
registerPrompt('ht_program_gen_all', {
  system: '',
  user: '你是一个图画/画册策划专家。根据已有信息补全作品的剩余字段。\n已有信息中某些字段可能为空，你需要生成合适的值来补齐。\n\n{context}\n\n请根据以上已有信息，补全为空的字段并整体输出完整的JSON。\n\n输出严格 JSON 格式：{"name":"作品名称","focus":"作品定位/关注方向","description":"作品简介"}。\n- name：作品名称，有特色好记\n- focus：作品定位/关注方向，一句话概括\n- description：作品简介，聚焦作品的主题题材方向和内容取向，不涉及板块结构或排版安排',
});
// 连载作品（漫画）：作品级只规划 大致剧情内容 + 剧情发展方向，具体每期内容另在期号里生成
registerPrompt('ht_program_gen_all_paged', {
  system: '',
  user: '你是一个图画/画册策划专家。根据已有信息补全连载作品（漫画）的剩余字段。\n连载作品通常有很多话/期，作品级只确定整部作品的大方向，不展开每一话的细节。\n已有信息中某些字段可能为空，你需要生成合适的值来补齐。\n\n{context}\n\n【本次任务说明 · 以此为准】\n本作由常驻画师以执笔者身份绘制，画师以其画风技法与创作风格来呈现本作内容。\n本作的类型是上方「作品类型」所定义的那一类，剧情内核严格围绕该类型展开（其内涵见「作品类型说明」）。\n剧情要丰富、完整、符合逻辑与情理，主线清晰、有起承转合，人物动机与情节推进自然合理。\n画师的创作风格用于画面表现；本作的类型与剧情由上述「作品类型 + 剧情发展方向/定位 + 出场角色」共同决定。\n\n请根据以上已有信息，补全为空的字段并整体输出完整的JSON。\n\n输出严格 JSON 格式：{"name":"作品名称","focus":"剧情发展方向","description":"大致剧情内容"}。\n- name：作品名称，有特色好记\n- focus：剧情发展方向，一句话概括整部连载的大方向\n- description：大致剧情内容，把整部连载的故事走向与题材取向写得完整、连贯、有层次（讲清开端、发展、核心矛盾与走向），但不要写成具体每一话的逐页内容；具体每期内容应在各期号里再生成',
});
// 单张载体（插画）：一次调用同时补齐 名称/定位/简介/画面描述，避免二次调用
registerPrompt('ht_program_gen_all_visual', {
  system: '',
  user: '你是一个图画/画册策划专家兼情色画师。根据已有信息补全插画的剩余字段，并生成这张插画的画面描述。\n已有信息中某些字段可能为空，你需要生成合适的值来补齐。\n\n{context}\n\n【画师风格硬约束】请把上方画师的画风技法与创作风格融入这张插画的「画面描述」各键中；画师的创作题材与偏好可作为这张插画的内容倾向。画师以本作执笔者身份绘制此图，其风格技法贯穿画面。\n\n请根据以上已有信息，补全为空的字段，并生成一张插画的完整画面描述，整体输出完整的JSON。\n\n输出严格 JSON 格式：{"name":"插画名称","focus":"插画主题","description":"画面内容概述","visual":"画面描述"}。\n- name：插画名称，有特色好记\n- focus：插画主题，一句话概括这张插画要传达的主题或情绪氛围\n- description：画面内容概述\n- visual：画面描述对象。一个 JSON 对象，键固定为：构图与视角、人物姿态与神情、服饰与材质、裸露与性器官细节、身体接触与体位、光影与色调、背景环境、氛围与细节。每个键的值是该字段的具体描述，精准、细腻、巨细无遗：构图与视角（人物数量、近/中/远景、仰俯平视、人物位置与朝向）；人物姿态与神情（坐/站/跪/躺、四肢摆放、面部表情、眼神、嘴部、潮红/迷离/羞怯/放荡）；服饰与材质（穿着/半褪/全裸、材质质感、项圈/绑带/情趣装/饰品）；裸露与性器官细节（胸部、臀部、乳房、性器官形态/湿润度/状态/插入位置）；身体接触与体位（交合或亲昵体位、肢体交缠、接触部位）；光影与色调（光源方向、冷暖色调、明暗对比、亮度）；背景环境（室内/室外、具体场所、周围物件与布置）；氛围与细节（潮湿/高温/暧昧/压迫氛围，以及汗珠、体液、水渍、布料皱褶、凌乱发丝、纹身/饰品等一切细节）。禁止笼统概括，禁止遗漏任何内容。',
});
registerPrompt('ht_episode_focus', {
  system: '',
  user: '你是一个图画/画册策划专家。根据作品完整信息生成{count}个本期内容的简介选项。JSON输出：{"options":["简介1","简介2"]}。{wordLimit}{direction}\n\n{context}\n\n基于以上全部信息，生成适合该作品某一期的内容简介选项（说明本期看什么剧情/画面/材料）。',
});
registerPrompt('ht_episode_plan', {
  system: '',
  user: '你是一个图画/画册策划专家。根据作品完整信息，为**新一期**直接生成完整的板块内容。\n\n{context}\n\n【本次任务说明 · 以此为准】本作由常驻画师/摄影师以执笔者身份创作，其画风技法与创作风格用于呈现本作内容；本期的内容内核严格围绕上方「作品类型」与整部作品方向展开，主题与看点与前几期有所不同，内容要丰富完整、符合逻辑与情理、贴合画面。\n\n⚠️ 注意：这是新的一期，已有期号的内容仅供参考，请不要重复已有期号的标题、方向和情节。每期必须有不同的主题和看点。\n\n请根据以上信息，为各板块生成完整的画面与台词，直接作为本期的最终内容。\n\n输出严格 JSON 格式：{"headline":"本期头条标题","epFocus":"本期内容简介","sections":{"板块名":[{"speaker":"角色名或旁白","visual":"画面描述","content":"台词或旁白文字"}]}}。\n- headline：本期头条标题（吸引眼球，体现本期核心话题，不能与已有期号的标题相同）\n- epFocus：本期内容简介（说明本期的侧重点和内容倾向，需与前几期有区分度）\n- sections：sections 的 key 必须与上方「板块结构」完全一致；每个板块含多个段落，每段有 speaker/visual/content。\n每个 visual 必须极其精准、细腻、巨细无遗：写清构图与视角、人物姿态/朝向/面部表情/眼神、服饰与材质、裸露部位与性器官细节、身体接触与体位、肢体动作、光影与色调、背景环境、氛围与空气感，以及汗珠、体液、水渍、布料皱褶、饰品、纹身等一切细节，禁止笼统概括或遗漏；content 为台词/旁白，角色要有实际出场和互动。',
});
// 连载漫画：期号规划 = 本期内容简介 + 分页内容（一页一页，每页可含分格）
registerPrompt('ht_episode_plan_paged', {
  system: '',
  user: '你是一个图画/画册策划专家兼漫画分镜师。为连载漫画的**新一期**规划本期的分页内容。\n\n{context}\n\n【本次任务说明 · 以此为准】本作由常驻画师以执笔者身份绘制，画师以其画风技法与创作风格来呈现本作内容。本期剧情内核严格围绕上方「作品类型」与整部作品方向展开，并与前几期承上启下；本期内容要丰富完整、符合逻辑与情理，人物动机合理、情节推进自然。\n\n⚠️ 注意：这是新的一期，已有期号内容仅供参考，请不要重复已有期号的标题和情节。漫画按「页」组织，从封面到末页，一页一页；每页是一张完整的图片，若该页为分格（如四格漫画），则再把每一格的内容描述出来。\n\n请根据以上信息，生成该期规划。\n\n输出严格 JSON 格式：{"headline":"本期标题","epFocus":"本期内容简介","pages":[{"description":"本页画面描述","panels":[{"description":"这一格的内容描述","dialogue":"台词/旁白"}]}]}。\n- headline：本期标题（有吸引力，不与已有期号重复）\n- epFocus：本期内容简介（概括本期剧情内容与看点）\n- pages：分页数组，从封面到末页按顺序排列；每页 description 描述这一页整张图片的内容（即本页的最终画面）；每页可含 panels 数组，若为分格则逐格给出 description 与 dialogue（无分格则 panels 为空数组）。\n每页/每格的画面描述必须极其精准、细腻、巨细无遗：写清构图与视角、人物数量与姿态/朝向/面部表情/眼神、服饰与材质、裸露部位与性器官细节、身体接触与体位、光影与色调、背景环境、氛围与空气感，以及汗珠、体液、水渍、布料皱褶、饰品、纹身等一切细节；台词/旁白需贴切。禁止笼统概括或遗漏。\n\n禁止给出预设的风格/类型列表，按作品本身与画师风格自由创作。',
});

// ===== 共享缓存 =====
var 图册新建角色缓存 = [];
var 图册新建来源缓存 = [];
var 图册角色完整缓存 = {};
var 图册节目简介缓存 = '';
var 图册自动保存计时器 = null;

// 画面描述的结构化字段
var 图册画面字段 = ['构图与视角','人物姿态与神情','服饰与材质','裸露与性器官细节','身体接触与体位','光影与色调','背景环境','氛围与细节'];
function 图册视觉是否空(obj) { return !obj || !Object.keys(obj).length; }

// 画师 → 可逐条消费的「风格指令」。关键：把字段分成两段——
//   画风技法（可继承到画面表现） 与 题材口味（仅参考，绝不可作为剧情硬约束）
var 图册画师内容词 = ['定位', '母题', '性癖', '题材', '人设', '简介', '偏好', '口味', '代表作', '经历', '背景', '标签', '擅长绘制', '画面重心'];
function 图册画师字段用途(label) {
  if (!label) return 'style';
  for (var i = 0; i < 图册画师内容词.length; i++) if (label.indexOf(图册画师内容词[i]) >= 0) return 'content';
  return 'style';
}
function 图册画师风格指令(src, mode) {
  if (!src) return '';
  if (typeof src === 'string') return '* 画师：' + src + '（完整数据不可用）';
  var 标签 = function(v) { if (!v) return ''; return Array.isArray(v) ? v.join('、') : String(v); };
  var 画风 = [], 题材 = [];
  var 收 = function(f) {
    var 文本 = 标签(f.value);
    if (!f.label || !文本) return;
    if (f.kind === 'content' || 图册画师字段用途(f.label) === 'content') 题材.push('* ' + f.label + '：' + 文本);
    else 画风.push('* ' + f.label + '：' + 文本);
  };
  if (Array.isArray(src.fields)) {
    src.fields.forEach(收);
  } else {
    // 兼容未迁移的旧扁平结构
    if (src.persona || src.bio) 收({ label: '定位', value: src.persona || src.bio });
    if (src.styleName || src.style) 收({ label: '招牌画风', value: src.styleName || src.style });
    [['画风标签', src.styleTags], ['流派', src.genre], ['媒介笔触', src.medium], ['色调', src.palette], ['光影', src.lighting], ['线条', src.laneStyle], ['肌肤质感', src.skinRendering], ['画面重心', src.subjectFocus], ['露骨尺度', src.explicitness], ['擅长绘制角色', src.preferredGender], ['标志性母题', src.motifs], ['擅长性癖', src.fetishes]].forEach(function(pa) {
      if (pa[1]) 收({ label: pa[0], value: pa[1] });
    });
  }
  // 画师的全部内容都输入：既含画风技法，也含题材/母题/性癖（作为画师创作领域的背景信息）
  var lines = [];
  lines.push('* 画师：' + (src.name || ''));
  if (画风.length) { lines.push('【画师画风技法 · 用于画面呈现】'); 画风.forEach(function(l) { lines.push(l); }); }
  if (题材.length) { lines.push('【画师创作题材与偏好 · 画师的创作领域】'); 题材.forEach(function(l) { lines.push(l); }); }
  return lines.join('\n');
}
window.图册画师风格指令 = 图册画师风格指令;

// ===== 分页（连载漫画）期号内容存取：第X期/pages.json = { pages: [...] } =====
function 图册期号分页路径(期号路径) { return 图册根路径 + 期号路径 + '/pages.json'; }
function 图册保存期号分页(期号路径, pages) { return LocalFS.saveJSON(图册期号分页路径(期号路径), { pages: pages || [] }); }
function 图册加载期号分页(期号路径) { return LocalFS.readJSON(图册期号分页路径(期号路径)).then(function(d) { return (d && d.pages) || []; }); }
window.图册保存期号分页 = 图册保存期号分页;
window.图册加载期号分页 = 图册加载期号分页;

function 图册渲染规划(el) {
  var mk = 图册当前载体;
  if (!图册当前节目) {
    图册渲染规划作品(el);
  } else {
    图册渲染规划期号(el);
  }
}

// ===== AI 字段注册（二元模板 · UI 层） =====
function 图册构建作品上下文基础() {
  var mk = 图册当前载体;
  var f = window.图册规划作品表单;
  var m = 图册载体[mk];
  var cfg = f ? window.图册获取节目配置(f.type, f.subtype) : null;
  var lines = [];
  if (m) { lines.push('载体类型：' + m.label); if (m.desc) lines.push('载体说明：' + m.desc); }
  if (cfg) {
    lines.push('作品类型：' + cfg.label);
    if (cfg.styleDesc) lines.push('作品类型说明：' + cfg.styleDesc);
    lines.push(图册是否分页(mk) ? '内容组织：连载作品，按「页」组织，从封面到末页，每期内容在期号里逐页生成。' : '板块结构：' + cfg.sections.join('、'));
  }
  if (f && f.name) lines.push('作品名称：' + f.name);
  if (f && f.focus) lines.push(图册是否分页(mk) ? '剧情发展方向：' + f.focus : '作品定位/关注方向：' + f.focus);
  if (f && f.description) lines.push(图册是否分页(mk) ? '大致剧情内容：' + f.description : '作品简介：' + f.description);
  var 画师名 = [];
  if (f && f.refSources && f.refSources.length) {
    f.refSources.forEach(function(s) { 画师名.push(typeof s === 'string' ? s : s.name); });
  }
  if (画师名.length) lines.push('常驻' + (图册来源名称映射[mk] || '画师') + '：' + 画师名.join('、'));
  var 角色名 = f && f.refChars ? f.refChars : [];
  if (角色名.length) lines.push('常驻角色：' + 角色名.join('、'));
  if (f && f.refSources && f.refSources.length) {
    lines.push('');
    lines.push('【画师 · 本作执笔者】请让以下画师以执笔者身份贯穿本作，用她的画风技法与创作风格来呈现本作的内容：');
    f.refSources.forEach(function(s) { lines.push(图册画师风格指令(s)); });
  }
  return lines.join('\n');
}

function 图册加载角色身份(角色名列表) {
  var lines = [];
  return Promise.all(角色名列表.map(function(rn) {
    return Store.character.get(rn).then(function(d) { return { name: rn, data: d }; });
  })).then(function(loaded) {
    loaded.forEach(function(item) {
      var d = item.data || {};
      var id = d.identity || {};
      // 精简角色上下文：只给 基本信息/背景气质/关键外貌，避免把超长性史塞进提示词导致画面描述变剧情
      var brief = {
        基本信息: (id.basicInfo || {}),
        背景与气质: (id.background || {}),
        外貌: ((d.appearance && (d.appearance.facialFeatures || d.appearance.bodyShape || d.appearance.skinHair)) || d.appearance || {})
      };
      lines.push(JSON.stringify(brief, null, 2) + '\n');
    });
    return lines.join('');
  });
}

(function() {
  registerAiField('ht_program_name', '作品名称', function() { return 图册构建作品上下文基础(); }, { suggestPrompt: 'ht_program_name' });
  registerAiField('ht_program_focus', '作品定位', function() { return 图册构建作品上下文基础(); }, { suggestPrompt: 'ht_program_focus' });
  registerAiField('ht_program_desc', '作品简介', function() {
    var ctx = 图册构建作品上下文基础();
    return renderPrompt('ht_program_desc', { context: ctx });
  }, { rawText: true, suggestPrompt: 'ht_program_desc', fillFn: function(text) { var ta = document.getElementById('htProgramDesc'); if (ta) { ta.value = text; } 图册节目简介缓存 = text; } });

  registerAiField('ht_episode_focus', '本期内容简介', function() {
    var 节目 = 图册当前节目;
    var cfg = window.图册获取节目配置(节目 ? 节目.info.type : '', 节目 ? 节目.info.subtype : '');
    var ctx = '作品名称：' + (节目 ? 节目.info.name : '') + '\n';
    ctx += '作品类型：' + (cfg ? cfg.label : '') + '\n';
    ctx += '作品类型说明：' + (cfg ? cfg.styleDesc : '') + '\n';
    ctx += '板块结构：' + (cfg ? cfg.sections.join('、') : '') + '\n';
    if (节目 && 节目.info.focus) ctx += '作品定位：' + 节目.info.focus + '\n';
    if (节目 && 节目.info.description) ctx += '作品简介：' + 节目.info.description + '\n';
    if (window.图册期号来源缓存 && window.图册期号来源缓存.length) {
      ctx += '\n【画师 · 本作执笔者】\n';
      window.图册期号来源缓存.forEach(function(s) { ctx += 图册画师风格指令(s) + '\n'; });
    }
    if (window.图册期号角色全量缓存 && window.图册期号角色全量缓存.length) {
      ctx += '\n【出场人物】\n';
      window.图册期号角色全量缓存.forEach(function(c) {
        var name = ((c.identity && c.identity.basicInfo) || {}).name || c.title || '未命名';
        ctx += '- ' + name + '\n';
      });
    }
    return ctx;
  }, { suggestPrompt: 'ht_episode_focus' });
})();

// ===== 模式一：规划作品 =====
function 图册渲染规划作品(el) {
  var mk = 图册当前载体;
  var m = 图册载体[mk];
  var existing = window.图册规划作品表单 || null;
  var 表单 = {
    type: mk,
    subtype: (existing && existing.subtype) || '',
    name: (existing && existing.name) || '',
    focus: (existing && existing.focus) || '',
    description: (existing && existing.description) || '',
    visual: (existing && existing.visual) || {},
    refSources: (existing && existing.refSources) || [],
    refChars: (existing && existing.refChars) || [],
    _editing: (existing && existing._editing) || false,
    _editName: (existing && existing._editName) || null
  };
  图册节目简介缓存 = 表单.description;
  var 是否编辑 = existing && existing._editing;
  var 分页 = 图册是否分页(mk); // 连载作品（漫画）：作品级字段为 剧情发展方向 / 大致剧情内容
  var 定位标签 = 分页 ? '🎬 剧情发展方向' : '📌 作品定位/关注方向';
  var 简介标签 = 分页 ? '📖 大致剧情内容' : '📖 作品简介';
  var 定位占位 = 分页 ? '如：复仇堕落、纯爱沉溺、身份反转…（整部连载的大方向）' : '如：纯爱调教、重口猎奇、唯美人体';
  var 简介占位 = 分页 ? '说明整部连载的大致剧情内容与走向…（先定大方向，具体每期内容另在期号里生成）' : '说明本作品聚焦什么题材、什么主题方向…';

  var h = '<div class="n-card">';
  h += '<h3 style="font-size:15px;font-weight:600;margin-bottom:12px">' + m.icon + ' ' + (是否编辑 ? '编辑' : '新建') + '</h3>';

  // 子类型网格
  var 子类型配置 = 图册获取子类型配置(mk);
  var 子类型键 = 子类型配置 ? Object.keys(子类型配置) : [];
  if (子类型键.length) {
    h += '<div class="form-group" style="margin-bottom:8px"><label style="font-size:12px;font-weight:500;color:var(--fg2);display:block;margin-bottom:6px">📋 子类型</label>';
    h += '<div id="htSubTypeGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
    子类型键.forEach(function(k) {
      var cfg = 图册获取节目配置(mk, k);
      var act = (表单.subtype || 子类型键[0]) === k;
      h += '<div class="n-card" style="padding:10px;cursor:pointer;border:2px solid ' + (act ? 'var(--accent2)' : 'var(--border)') + ';border-radius:6px" onclick="document.querySelectorAll(\'#htSubTypeGrid .n-card\').forEach(function(c){c.style.borderColor=\'var(--border)\'});this.style.borderColor=\'var(--accent2)\';图册规划作品表单.subtype=\'' + k + '\'">';
      h += '<div style="font-size:13px;font-weight:600;color:var(--fg)">' + cfg.icon + ' ' + cfg.label + '</div>';
      h += '<div style="font-size:10px;color:var(--fg2);margin-top:2px">' + (图册是否分页(mk) ? '连载 · 按页/分格' : cfg.sections.join(' · ')) + '</div></div>';
    });
    h += '</div></div>';
    if (!表单.subtype) 表单.subtype = 子类型键[0];
  }

  h += '<div style="display:flex;gap:12px;margin-top:8px">';
  h += '<div style="flex:0 0 260px">';

  h += '<div class="form-group" style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">' + ((typeof window.图册来源标签 === 'function') ? 图册来源标签(图册当前载体) : '🎨 画师') + '</label>';
  h += '<div id="htPlanSources" style="max-height:100px;overflow-y:auto;display:flex;gap:4px;flex-wrap:wrap;padding:6px;background:var(--bg2);border-radius:6px;border:1px solid var(--border)">';
  h += '<span style="font-size:11px;color:var(--fg3)">加载中...</span></div></div>';

  h += '<div class="form-group"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">👤 常驻角色</label>';
  h += '<div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:4px" id="htPlanGenderTabs">';
  图册性别键.forEach(function(g) {
    h += '<span class="char-cat-tab" style="flex:1;min-width:46px;padding:3px 4px;text-align:center;font-size:10px;cursor:pointer;border-radius:4px;border:1px solid var(--border);background:var(--bg2)" data-pgender="' + g + '" onclick="window.图册新建角色性别=\'' + g + '\';document.querySelectorAll(\'#htPlanGenderTabs .char-cat-tab\').forEach(function(t){t.style.borderColor=\'var(--border)\';t.style.background=\'var(--bg2)\'});this.style.borderColor=\'var(--accent2)\';this.style.background=\'var(--accent-dim)\';window.图册渲染新建作品角色列表()">' + 图册性别图标[g] + ' ' + g + '</span>';
  });
  h += '</div>';
  h += '<div id="htPlanChars" style="max-height:260px;overflow-y:auto;padding:4px;background:var(--bg2);border-radius:6px;border:1px solid var(--border)">';
  h += '<span style="font-size:11px;color:var(--fg3)">加载中...</span></div></div>';
  h += '</div>'; // end left col

  h += '<div style="flex:1;min-width:0">';
  if (图册是否单张(mk)) {
    // 插画：纯 AI 生成内容（名称/主题/简介/画面描述），保留上方 类型/画师/角色
    h += '<div class="n-card" style="padding:12px;margin-bottom:10px;background:var(--bg2);border-left:3px solid var(--accent2)">';
    h += '<div style="font-size:12px;font-weight:600;color:var(--accent2);margin-bottom:6px">🤖 AI 自动生成</div>';
    h += '<div style="font-size:11px;color:var(--fg3);line-height:1.6">名称、主题、画面内容概述、画面描述（构图/姿态/服饰/性器官/体位/光影/环境/氛围细节）均由 AI 依据上方所选 类型、画师、角色 自动生成。选好后点下方按钮一键生成。</div>';
    h += '</div>';
  } else {
    h += '<div class="form-group"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">作品名称</label>';
    h += aiInput('ht_program_name', '', '如：「深夜画室」「淫绘卷」「密室写真」', 表单.name);
    h += '</div>';
    h += '<div class="form-group" style="margin-top:10px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">' + 定位标签 + '</label>';
    h += aiInput('ht_program_focus', '', 定位占位, 表单.focus);
    h += '</div>';
    h += '<div class="form-group" style="margin-top:10px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">' + 简介标签 + '</label>';
    h += '<div style="display:flex;gap:6px"><textarea class="llm-input" id="htProgramDesc" style="flex:1;min-height:120px;resize:vertical" placeholder="' + 简介占位 + '" oninput="图册节目简介缓存=this.value">' + escHtml(图册节目简介缓存) + '</textarea>';
    h += '<button class="ai-suggest-btn" onclick="openAiGenPanel(\'ht_program_desc\')" title="AI 生成作品简介" style="align-self:flex-start;margin-top:0">🤖</button></div></div>';
  }

  h += '<div style="margin-top:14px"><button class="btn-main" onclick="' + (图册是否单张(mk) ? '图册AI生成插画作品()' : '图册保存作品配置()') + '" style="width:100%;padding:10px;font-size:13px">' + (图册是否单张(mk) ? '🤖 AI 生成插画' : (是否编辑 ? '💾 保存修改' : '💾 创建作品')) + '</button></div>';
  h += '</div>'; // end right col
  h += '</div>'; // end flex row
  h += '</div>'; // end n-card
  el.innerHTML = h;

  window.图册规划作品表单 = 表单;

  图册新建来源缓存 = [];
  图册加载来源(mk).then(function(sources) {
    图册新建来源缓存 = sources || [];
    var pool = document.getElementById('htPlanSources');
    if (!pool) return;
    if (!sources.length) { pool.innerHTML = '<span style="font-size:11px;color:var(--fg3)">暂无' + ((typeof window.图册来源标题 === 'function') ? 图册来源标题(图册当前载体) : '画师') + '</span>'; return; }
    pool.innerHTML = sources.map(function(s, i) {
      var 已选 = 表单.refSources.some(function(r) { return typeof r === 'string' ? r === s.name : r === s; });
      return '<span class="tag-chip' + (已选 ? ' tag-active' : '') + '" data-idx="' + i + '" onclick="var f=window.图册规划作品表单;var s=图册新建来源缓存[this.getAttribute(\'data-idx\')];if(!s)return;var sn=s.name||\'\';var idx=f.refSources.findIndex(function(r){return typeof r===\'string\'?r===sn:r===s;});if(idx>=0){f.refSources.splice(idx,1);this.classList.remove(\'tag-active\')}else{f.refSources.push(s);this.classList.add(\'tag-active\')}" style="cursor:pointer">' + escHtml(s.name || '') + '</span>';
    }).join('');
  });

  图册新建角色缓存 = [];
  window.图册新建角色按性别 = { '女性': [], '男性': [], '扶她': [], '伪娘': [] };
  window.图册新建角色性别 = '女性';
  var pGenderMap = { 'female': '女性', 'male': '男性', 'femboy': '伪娘', 'futa': '扶她', 'beast': '男性' };
  Store.character.list().then(function(items) {
    图册新建角色缓存 = items || [];
    图册新建角色缓存.forEach(function(c) {
      var bi = c.identity && c.identity.basicInfo || {};
      var cg = pGenderMap[bi.gender] || bi.gender;
      if (window.图册新建角色按性别[cg]) window.图册新建角色按性别[cg].push(c);
    });
    // 有已选常驻角色时，默认切到第一个已选角色的性别 tab，避免被遮蔽
    var f2 = window.图册规划作品表单;
    if (f2 && f2.refChars && f2.refChars.length) {
      var 首名 = f2.refChars[0];
      var fo = 图册新建角色缓存.find(function(c) { var bi = (c.identity && c.identity.basicInfo) || {}; return (bi.name || c.title || '') === 首名; });
      var bi2 = (fo && (fo.identity && fo.identity.basicInfo)) || {};
      var cg2 = pGenderMap[bi2.gender] || bi2.gender || '女性';
      if (window.图册新建角色按性别[cg2]) window.图册新建角色性别 = cg2;
    }
    var tabs = document.querySelectorAll('#htPlanGenderTabs .char-cat-tab');
    tabs.forEach(function(t) {
      var on = t.getAttribute('data-pgender') === window.图册新建角色性别;
      t.style.borderColor = on ? 'var(--accent2)' : 'var(--border)';
      t.style.background = on ? 'var(--accent-dim)' : 'var(--bg2)';
    });
    window.图册渲染新建作品角色列表();
  });
}

window.图册渲染新建作品角色列表 = function() {
  var pool = document.getElementById('htPlanChars');
  if (!pool) return;
  var gender = window.图册新建角色性别 || '女性';
  var items = window.图册新建角色按性别[gender] || [];
  var f = window.图册规划作品表单;
  var cards = items.map(function(c) {
    var bi = (c.identity && c.identity.basicInfo) || {};
    var name = bi.name || c.title || '';
    if (!name) return '';
    var 已选 = f && f.refChars && f.refChars.indexOf(name) >= 0;
    var age = bi.age || '';
    var title = bi.title || '';
    var cardStyle = 'cursor:pointer;margin-bottom:4px;padding:8px;border-radius:6px;border:2px solid ' + (已选 ? 'var(--accent2)' : 'var(--border)') + ';background:var(--bg);border-left:3px solid ' + (已选 ? 'var(--accent2)' : 'transparent') + ';transition:all 0.1s';
    return '<div class="n-card" style="' + cardStyle + '" data-pname="' + escHtml(name) + '" onclick="var n=this.getAttribute(\'data-pname\');if(!n)return;var f=window.图册规划作品表单;if(!f)return;var p=f.refChars.indexOf(n);if(p>=0){f.refChars.splice(p,1);this.style.borderColor=\'var(--border)\';this.style.borderLeftColor=\'transparent\'}else{f.refChars.push(n);Store.character.get(n).then(function(d){if(d)图册角色完整缓存[n]=d;});this.style.borderColor=\'var(--accent2)\';this.style.borderLeftColor=\'var(--accent2)\'}">' +
      '<div class="fw-600 fs-13" style="color:var(--fg)">' + escHtml(name) + (age ? ' <span class="text-muted" style="font-weight:400;font-size:11px;color:var(--fg2)">' + age + '岁</span>' : '') + '</div>' +
      (title ? '<div class="text-muted text-sm" style="font-size:11px;color:var(--fg2);margin-top:2px">' + escHtml(title) + '</div>' : '') +
    '</div>';
  }).join('');
  // 已选常驻角色常显（跨性别）
  var 已选块 = '';
  if (f && f.refChars && f.refChars.length) {
    已选块 = '<div style="font-size:10px;color:var(--fg2);margin-bottom:6px;padding:6px 8px;background:var(--bg2);border-radius:5px;border:1px solid var(--accent-dim)">常驻：' + f.refChars.map(function(n) { return '<span class="tag-chip tag-active" style="font-size:10px;margin:1px;cursor:pointer" onclick="图册新建移除角色(\'' + n + '\')" title="点击移除">' + escHtml(n) + ' ✕</span>'; }).join(' ') + '</div>';
  }
  if (cards) pool.innerHTML = 已选块 + cards;
  else pool.innerHTML = 已选块 + '<div style="padding:12px;text-align:center;font-size:11px;color:var(--fg3)">暂无此性别角色</div>';
};
window.图册新建移除角色 = function(name) {
  var f = window.图册规划作品表单;
  if (!f || !f.refChars) return;
  var p = f.refChars.indexOf(name);
  if (p >= 0) { f.refChars.splice(p, 1); 图册渲染新建作品角色列表(); }
};

// 单张载体（插画）：依据上方所选 类型/画师/角色 生成整张插画并保存
window.图册AI生成插画作品 = function() {
  var mk = 图册当前载体;
  var f = window.图册规划作品表单;
  if (!f) { toast('请先打开插画规划'); return; }
  toast('🤖 正在 AI 生成插画...');
  图册加载角色身份(f.refChars || []).then(function(角色上下文) {
    var ctx = 图册构建作品上下文基础();
    if (角色上下文) ctx += '\n【常驻角色】\n' + 角色上下文;
    var rendered = renderPrompt('ht_program_gen_all_visual', { context: ctx });
    LLM.callJSON({ prompt: rendered.user, system: rendered.system, label: '插画生成', temperature: 0.9 }).then(function(data) {
      if (!data) { toast('生成失败'); return; }
      f.name = data.name || (f.name || '');
      f.focus = data.focus || '';
      f.description = data.description || '';
      f.visual = data.visual || {};
      if (!f.name) { toast('AI 未能生成插画名称，请再试一次'); return; }
      return 图册保存作品直接(f);
    }).catch(function(err) { toast('❌ ' + err.message); });
  });
};

window.图册保存作品配置 = function() {
  var mk = 图册当前载体;
  var f = window.图册规划作品表单;
  var nameEl = document.getElementById('ht_program_name');
  if (nameEl) f.name = nameEl.value.trim();
  var focusEl = document.getElementById('ht_program_focus');
  if (focusEl) f.focus = focusEl.value.trim();
  var descEl = document.getElementById('htProgramDesc');
  if (descEl) f.description = descEl.value.trim();
  if (图册是否单张(mk)) {
    f.visual = {};
    图册画面字段.forEach(function(fx) { var ta = document.getElementById('htPV_' + fx); if (ta && ta.value.trim()) f.visual[fx] = ta.value.trim(); });
  }

  if (f.name && f.focus && f.description && !f._editing) { return 图册保存作品直接(f); }
  if (f._editing && f.name && f.focus && f.description) { return 图册保存作品直接(f); }

  toast('🔄 正在智能补全作品信息...');
  图册加载角色身份(f.refChars || []).then(function(角色上下文) {
    var ctx = 图册构建作品上下文基础();
    if (角色上下文) ctx += '\n【常驻角色】\n' + 角色上下文;
    var 单张 = 图册是否单张(mk);
    var 分页 = 图册是否分页(mk);
    var 模板名 = 单张 ? 'ht_program_gen_all_visual' : (分页 ? 'ht_program_gen_all_paged' : 'ht_program_gen_all');
    var rendered = renderPrompt(模板名, { context: ctx });
    LLM.callJSON({ prompt: rendered.user, system: rendered.system, label: '作品补全', temperature: 0.85 }).then(function(data) {
      if (!data) { toast('生成失败'); return; }
      if (!f.name && data.name) { f.name = data.name; if (nameEl) nameEl.value = data.name; }
      if (!f.focus && data.focus) { f.focus = data.focus; if (focusEl) focusEl.value = data.focus; }
      if (!f.description && data.description) { f.description = data.description; if (descEl) descEl.value = data.description; 图册节目简介缓存 = data.description; }
      if (单张 && 图册视觉是否空(f.visual) && data.visual) {
        f.visual = data.visual;
        图册画面字段.forEach(function(fx) { var ta = document.getElementById('htPV_' + fx); if (ta && data.visual[fx]) ta.value = data.visual[fx]; });
      }
      if (!f.name) { toast('AI 未能生成作品名称，请手动填写'); return; }
      return 图册保存作品直接(f);
    }).catch(function(err) { toast('AI 补全失败: ' + err.message); });
  });
};

function 图册生成插画画面文本(f) {
  var mk = 图册当前载体;
  var cfg = window.图册获取节目配置(f.type, f.subtype);
  // 画师可能是名字（编辑旧作品时），也可能是完整对象（新建时）；名字时需要从来源库补全
  var needLoad = (f.refSources || []).some(function(s) { return typeof s === 'string'; });
  var srcPromise = needLoad ? 图册加载来源(mk) : Promise.resolve(f.refSources || []);
  return srcPromise.then(function(sources) {
    var refs = (f.refSources || []).map(function(s) {
      if (typeof s === 'string') return sources.find(function(x) { return x.name === s; }) || s;
      return s;
    });
    var ctx = '作品名称：' + (f.name || '') + '\n';
    ctx += '类型：' + (cfg.label || '') + '\n';
    ctx += '风格：' + (cfg.styleDesc || '') + '\n';
    if (f.focus) ctx += '定位：' + f.focus + '\n';
    if (f.description) ctx += '简介：' + f.description + '\n';
    if (f.refChars && f.refChars.length) ctx += '出场角色：' + f.refChars.join('、') + '\n';
    if (refs && refs.length) {
      ctx += '\n【画师风格指令】以下画师的画风签名层是本次生成的风格硬约束，必须逐条继承到画面描述中：\n';
      refs.forEach(function(s) { ctx += 图册画师风格指令(s) + '\n'; });
    }
    var sys = '你是一名极致细腻的情色画师。生成一张插画的画面描述对象，必须输出合法 JSON 对象，键固定为：构图与视角、人物姿态与神情、服饰与材质、裸露与性器官细节、身体接触与体位、光影与色调、背景环境、氛围与细节。每个键的值是对应字段的具体描述，精准、细腻、巨细无遗：构图与视角（人物数量、近/中/远景、仰俯平视、人物位置与朝向）；人物姿态与神情（坐/站/跪/躺、四肢摆放、面部表情、眼神、嘴部、潮红/迷离/羞怯/放荡）；服饰与材质（穿着/半褪/全裸、材质质感、项圈/绑带/情趣装/饰品）；裸露与性器官细节（胸部、臀部、乳房、性器官形态/湿润度/状态/插入位置）；身体接触与体位（交合或亲昵体位、肢体交缠、接触部位）；光影与色调（光源方向、冷暖色调、明暗对比、亮度）；背景环境（室内/室外、具体场所、周围物件与布置）；氛围与细节（潮湿/高温/暧昧/压迫氛围，以及汗珠、体液、水渍、布料皱褶、凌乱发丝、纹身/饰品等一切细节）。禁止笼统概括，禁止遗漏任何内容。';
    return LLM.callJSON({ prompt: ctx + '\n请输出这张插画的画面描述对象。', system: sys, label: '画面描述生成', temperature: 0.9 }).then(function(d) { return d || {}; });
  });
}

function 图册保存作品直接(f) {
  var mk = 图册当前载体;
  var info = { name: f.name, type: f.type, subtype: f.subtype || '', focus: f.focus || '', description: f.description || '', refSourceNames: f.refSources.map(function(s){return s.name;}), refChars: f.refChars, createdAt: Date.now() };
  if (图册是否单张(mk)) { info.visual = f.visual || {}; }
  var doSave = function() {
    var saveTask;
    if (f._editing && f._editName && f._editName !== f.name) {
      saveTask = 图册删除节目(mk, f._editName).then(function() { return 图册保存节目(mk, f.name, info); });
    } else { saveTask = 图册保存节目(mk, f.name, info); }
    return saveTask;
  };
  var prep;
  if (图册是否单张(mk) && 图册视觉是否空(info.visual)) {
    // 生成时直接出画面描述
    toast('🖼️ 正在生成画面描述...');
    prep = 图册生成插画画面文本(f).then(function(visual) { if (visual) info.visual = visual; return doSave(); });
  } else {
    prep = Promise.resolve(doSave());
  }
  return prep.then(function() {
    toast(f._editing ? '✅ 作品已更新' : '✅ 作品已创建');
    window.图册规划作品表单 = null;
    图册当前节目 = null;
    图册切换标签('list');
  });
}

window.图册生成插画画面 = function() {
  var f = window.图册规划作品表单;
  if (!f) { toast('请先填写作品信息'); return; }
  toast('🤖 生成画面描述中...');
  图册生成插画画面文本(f).then(function(v) {
    if (!v || 图册视觉是否空(v)) { toast('生成失败'); return; }
    图册画面字段.forEach(function(fx) {
      var ta = document.getElementById('htPV_' + fx);
      if (ta && v[fx]) ta.value = v[fx];
    });
    toast('✅ 画面描述已生成');
  }).catch(function(err) { toast('❌ ' + err.message); });
};

window.图册清除插画画框 = function() {
  图册画面字段.forEach(function(fx) {
    var ta = document.getElementById('htPV_' + fx);
    if (ta) ta.value = '';
  });
  toast('已清除');
};

function 图册计算下一期号(mk, 作品名) {
  return 图册列出期号(mk, 作品名).then(function(episodes) {
    if (!episodes || !episodes.length) return 1;
    var maxEp = 0;
    episodes.forEach(function(ep) {
      var num = ep.episode || 0;
      if (!num && ep._dir) { var m = (ep._dir || '').match(/第(\d+)期/); if (m) num = parseInt(m[1]); }
      if (num > maxEp) maxEp = num;
    });
    return maxEp + 1;
  });
}

window.图册期号规划返回 = function() {
  window.图册期号编辑缓存 = null;
  图册切换标签('list');
};

// ===== 模式二：规划期号 =====
window.图册期号来源缓存 = [];
var 图册期号角色缓存 = [];
window.图册期号角色按性别 = {};
window.图册期号角色性别 = '女性';
var 图册期号角色全量缓存 = [];
window.图册本期来源 = [];
window.图册本期角色 = [];
window.图册期号分页缓存 = []; // 连载漫画：分页内容 [{ description, panels:[{description, dialogue}] }]
var 图册性别键 = ['女性', '男性', '扶她', '伪娘'];
var 图册性别图标 = { '女性': '♀', '男性': '♂', '扶她': '⚤', '伪娘': '⚥' };
window.图册新建角色按性别 = {};
window.图册新建角色性别 = '女性';

function 图册渲染规划期号(el) {
  var mk = 图册当前载体;
  var 节目 = 图册当前节目;
  var cfg = window.图册获取节目配置(节目.info.type, 节目.info.subtype);
  var 分页 = 图册是否分页(mk);
  var 关注标签 = 分页 ? '🎬 本期内容简介' : '🎯 本期关注方向';
  var 关注占位 = 分页 ? '用一段话概括本期的剧情内容与看点…' : '本期重点关注话题、画面倾向…';

  var editCache = window.图册期号编辑缓存;
  var 编辑中期号 = editCache && editCache.episode ? editCache : null;
  if (编辑中期号) {
    图册本期来源 = (编辑中期号.refSourceNames || 节目.info.refSourceNames || []).slice();
    图册本期角色 = (编辑中期号.refChars || 节目.info.refChars || []).slice();
  } else {
    图册本期来源 = (节目.info.refSourceNames || []).slice();
    图册本期角色 = (节目.info.refChars || []).slice();
  }

  var 标题 = 编辑中期号 ? '编辑' + escHtml(节目.info.name) + ' · 第' + 编辑中期号.episode + '期' : escHtml(节目.info.name) + ' · 新建期号';
  if (编辑中期号) window.图册期号编辑缓存 = 编辑中期号;
  var h = '<div class="n-card">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">';
  h += '<h3 style="font-size:15px;font-weight:600;margin:0">' + 标题 + '</h3>';
  h += '<button class="btn-sm" style="background:transparent;color:var(--fg2);border:1px solid var(--border);padding:2px 10px;border-radius:4px;cursor:pointer" onclick="图册期号规划返回()">← 返回</button>';
  h += '</div>';

  h += '<div style="display:flex;gap:12px">';
  h += '<div style="flex:0 0 260px">';

  h += '<div class="form-group" style="margin-bottom:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">' + ((typeof window.图册来源标签 === 'function') ? 图册来源标签(图册当前载体) : '🎨 画师') + '</label>';
  h += '<div id="htEpSources" style="max-height:100px;overflow-y:auto;display:flex;gap:4px;flex-wrap:wrap;padding:6px;background:var(--bg2);border-radius:6px;border:1px solid var(--border)">';
  h += '<span style="font-size:11px;color:var(--fg3)">加载中...</span></div></div>';

  h += '<div class="form-group"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">👤 出场人物</label>';
  h += '<div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:4px" id="htEpGenderTabs">';
  图册性别键.forEach(function(g) {
    h += '<span class="char-cat-tab" style="flex:1;min-width:46px;padding:3px 4px;text-align:center;font-size:10px;cursor:pointer;border-radius:4px;border:1px solid var(--border);background:var(--bg2)" data-gender="' + g + '" onclick="window.图册期号角色性别=\'' + g + '\';document.querySelectorAll(\'#htEpGenderTabs .char-cat-tab\').forEach(function(t){t.style.borderColor=\'var(--border)\';t.style.background=\'var(--bg2)\'});this.style.borderColor=\'var(--accent2)\';this.style.background=\'var(--accent-dim)\';window.图册渲染期号角色列表()">' + 图册性别图标[g] + ' ' + g + '</span>';
  });
  h += '</div>';
  h += '<div id="htEpChars" style="max-height:300px;overflow-y:auto;padding:4px;background:var(--bg2);border-radius:6px;border:1px solid var(--border)">';
  h += '<span style="font-size:11px;color:var(--fg3)">加载中...</span></div></div>';
  h += '</div>'; // end left col

  h += '<div style="flex:1;min-width:0">';
  h += '<div style="display:flex;gap:10px">';
  h += '<div class="form-group" style="flex:0 0 70px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">期号</label>';
  h += '<input class="llm-input" id="htEpNumber" type="number" min="1" style="width:100%" readonly></div>';
  h += '<div class="form-group" style="flex:1"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">📌 本期标题</label>';
  h += '<input class="llm-input" id="htEpHeadline" style="width:100%" placeholder="留空由 AI 生成" value="' + escHtml(编辑中期号 && 编辑中期号.headline ? 编辑中期号.headline : '') + '" oninput="图册自动保存期号()"></div>';
  h += '</div>';

  h += '<div class="form-group" style="margin-top:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">' + 关注标签 + '</label>';
  h += '<div style="display:flex;gap:6px"><textarea class="llm-input" id="htEpFocus" style="flex:1;min-height:70px;resize:vertical" placeholder="' + 关注占位 + '" oninput="图册自动保存期号()">' + escHtml(编辑中期号 && 编辑中期号.epFocus ? 编辑中期号.epFocus : '') + '</textarea>';
  h += '<button class="ai-suggest-btn" onclick="openAiGenPanel(\'ht_episode_focus\')" title="AI 建议" style="align-self:flex-start;margin-top:0">🤖</button></div></div>';

  if (分页) {
    // 连载漫画：分页内容（从封面到末页，每页可含多个分格）
    h += '<div class="form-group" style="margin-top:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">📄 分页内容</label>';
    h += '<div id="htEpPages" style="display:flex;flex-direction:column;gap:8px"></div>';
    h += '<div style="margin-top:4px"><button class="btn-sm btn-outline" onclick="图册期号添加页()" style="font-size:11px">＋ 添加一页</button></div></div>';
  } else {
    h += '<div class="form-group" style="margin-top:8px"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px">📄 本期内容</label>';
    h += '<div id="htEpSections" style="display:flex;flex-direction:column;gap:8px"></div></div>';
  }

  h += '<div style="margin-top:10px"><button class="btn-main" onclick="图册AI生成期号()" style="width:100%;padding:8px;font-size:13px">🤖 AI 生成规划</button></div>';
  h += '<div id="htEpStatus" style="margin-top:6px;font-size:11px;color:var(--fg2)"></div>';
  h += '</div>'; // end right col
  h += '</div>'; // end flex row
  h += '</div>'; // end n-card
  el.innerHTML = h;

  var epInput = document.getElementById('htEpNumber');
  if (epInput) {
    if (编辑中期号) { epInput.value = 编辑中期号.episode; window.图册当前期号编号 = 编辑中期号.episode; }
    else { 图册计算下一期号(mk, 节目.name).then(function(nextEp) { epInput.value = nextEp; window.图册当前期号编号 = nextEp; }); }
  }

  // 连载漫画：加载该期已有分页并渲染编辑器
  if (分页) {
    window.图册期号分页缓存 = [];
    var 加载期号 = 编辑中期号 ? 编辑中期号.episode : (window.图册当前期号编号 || 1);
    var epPath = 图册期号路径(mk, 节目.name, 加载期号);
    图册加载期号分页(epPath).then(function(pages) {
      window.图册期号分页缓存 = pages || [];
      图册期号渲染分页();
    });
  } else {
    // 设定集/写真集：加载该期各板块内容并渲染编辑器
    window.图册期号板块缓存 = {};
    var boards = cfg.sections || [];
    var 加载期号2 = 编辑中期号 ? 编辑中期号.episode : (window.图册当前期号编号 || 1);
    var epPath2 = 图册期号路径(mk, 节目.name, 加载期号2);
    Promise.all(boards.map(function(b) {
      return 图册加载版块(epPath2, b).then(function(d) { return { board: b, segs: (d && d.segments) || [] }; });
    })).then(function(results) {
      results.forEach(function(r) { window.图册期号板块缓存[r.board] = r.segs; });
      图册期号渲染板块编辑器();
    });
  }

  var srcPool = document.getElementById('htEpSources');
  if (srcPool) {
    图册加载来源(mk).then(function(sources) {
      图册期号来源缓存 = sources || [];
      srcPool.innerHTML = sources.map(function(s, i) {
        var 是常驻 = 图册本期来源.indexOf(s.name) >= 0;
        var cls = 是常驻 ? 'tag-chip tag-active' : 'tag-chip';
        return '<span class="' + cls + '" data-idx="' + i + '" onclick="var a=图册期号来源缓存[this.getAttribute(\'data-idx\')];if(!a)return;var p=window.图册本期来源.indexOf(a.name);if(p>=0){window.图册本期来源.splice(p,1);this.classList.remove(\'tag-active\')}else{window.图册本期来源.push(a.name);this.classList.add(\'tag-active\')};图册自动保存期号()" style="cursor:pointer;' + (是常驻 ? 'color:var(--accent2)' : '') + '">' + escHtml(s.name || '') + '</span>';
      }).join('');
    });
  }

  window.图册期号角色性别 = '女性';
  图册期号角色全量缓存 = [];
  window.图册期号角色按性别 = { '女性': [], '男性': [], '扶她': [], '伪娘': [] };
  var genderMap = { 'female': '女性', 'male': '男性', 'femboy': '伪娘', 'futa': '扶她', 'beast': '男性' };
  Store.character.list().then(function(items) {
    图册期号角色全量缓存 = items || [];
    图册期号角色全量缓存.forEach(function(c) {
      var bi = c.identity && c.identity.basicInfo || {};
      var cg = genderMap[bi.gender] || bi.gender;
      if (window.图册期号角色按性别[cg]) window.图册期号角色按性别[cg].push(c);
    });
    // 有已选人物时，默认切到第一个已选人物的性别 tab，避免伪娘/扶她被「女性」tab 遮蔽导致误操作
    var 首选 = (图册本期角色 && 图册本期角色.length) ? 图册本期角色[0] : '';
    if (首选) {
      var found = 图册期号角色全量缓存.find(function(c) { var bi = (c.identity && c.identity.basicInfo) || {}; return (bi.name || c.title || '') === 首选; });
      var bi2 = (found && (found.identity && found.identity.basicInfo)) || {};
      var cg2 = genderMap[bi2.gender] || bi2.gender || '女性';
      if (window.图册期号角色按性别[cg2]) window.图册期号角色性别 = cg2;
    }
    var tabs = document.querySelectorAll('#htEpGenderTabs .char-cat-tab');
    tabs.forEach(function(t) {
      var on = t.getAttribute('data-gender') === window.图册期号角色性别;
      t.style.borderColor = on ? 'var(--accent2)' : 'var(--border)';
      t.style.background = on ? 'var(--accent-dim)' : 'var(--bg2)';
    });
    图册渲染期号角色列表();
  });
}

window.图册渲染期号角色列表 = function() {
  var pool = document.getElementById('htEpChars');
  if (!pool) return;
  var gender = window.图册期号角色性别 || '女性';
  var items = window.图册期号角色按性别[gender] || [];
  var cards = items.map(function(c) {
    var bi = (c.identity && c.identity.basicInfo) || {};
    var name = bi.name || c.title || '';
    if (!name) return '';
    var 已选 = window.图册本期角色.indexOf(name) >= 0;
    var age = bi.age || '';
    var title = bi.title || '';
    var cardStyle = 'cursor:pointer;margin-bottom:4px;padding:8px;border-radius:6px;border:2px solid ' + (已选 ? 'var(--accent2)' : 'var(--border)') + ';background:var(--bg);border-left:3px solid ' + (已选 ? 'var(--accent2)' : 'transparent') + ';transition:all 0.1s';
    return '<div class="n-card" style="' + cardStyle + '" data-name="' + escHtml(name) + '" onclick="var n=this.getAttribute(\'data-name\');if(!n)return;var p=window.图册本期角色.indexOf(n);if(p>=0){window.图册本期角色.splice(p,1);this.style.borderColor=\'var(--border)\';this.style.borderLeftColor=\'transparent\'}else{window.图册本期角色.push(n);this.style.borderColor=\'var(--accent2)\';this.style.borderLeftColor=\'var(--accent2)\'};图册自动保存期号()">' +
      '<div class="fw-600 fs-13" style="color:var(--fg)">' + escHtml(name) + (age ? ' <span class="text-muted" style="font-weight:400;font-size:11px;color:var(--fg2)">' + age + '岁</span>' : '') + '</div>' +
      (title ? '<div class="text-muted text-sm" style="font-size:11px;color:var(--fg2);margin-top:2px">' + escHtml(title) + '</div>' : '') +
    '</div>';
  }).join('');
  // 已选人物常显（跨性别），避免被当前性别 tab 遮蔽
  var 已选块 = '';
  var 已选阵容 = (window.图册本期角色 || []).slice();
  if (已选阵容.length) {
    已选块 = '<div style="font-size:10px;color:var(--fg2);margin-bottom:6px;padding:6px 8px;background:var(--bg2);border-radius:5px;border:1px solid var(--accent-dim)">已选：' + 已选阵容.map(function(n) { return '<span class="tag-chip tag-active" style="font-size:10px;margin:1px;cursor:pointer" onclick="图册期号移除人物(\'' + n + '\')" title="点击移除">' + escHtml(n) + ' ✕</span>'; }).join(' ') + '</div>';
  }
  if (cards) pool.innerHTML = 已选块 + cards;
  else pool.innerHTML = 已选块 + '<div style="padding:12px;text-align:center;font-size:11px;color:var(--fg3)">暂无此性别角色</div>';
};
window.图册期号移除人物 = function(name) {
  var p = (window.图册本期角色 || []).indexOf(name);
  if (p >= 0) { window.图册本期角色.splice(p, 1); 图册渲染期号角色列表(); 图册自动保存期号(); }
};

window.图册AI生成期号 = function() {
  var mk = 图册当前载体;
  var 节目 = 图册当前节目;
  var 分页 = 图册是否分页(mk);
  if (!节目) { toast('请先选择作品'); return; }
  var epInput = document.getElementById('htEpNumber');
  var ep = epInput ? parseInt(epInput.value) : 0;
  if (!ep || ep < 1) { toast('请输入期号'); return; }
  var hlEl = document.getElementById('htEpHeadline');
  var headline = hlEl ? hlEl.value.trim() : '';
  var focusEl = document.getElementById('htEpFocus');
  var epFocus = focusEl ? focusEl.value.trim() : '';
  var plotEl = document.getElementById('htEpPlot');
  var plot = plotEl ? plotEl.value.trim() : '';
  var statusEl = document.getElementById('htEpStatus');
  toast('🤖 正在生成第' + ep + '期规划...');
  if (statusEl) statusEl.textContent = '⏳ 生成中...';

  var cfg = window.图册获取节目配置(节目.info.type, 节目.info.subtype);

  图册列出期号(mk, 节目.name).then(function(eps) {
    var ctx = '载体类型：' + (图册载体[mk] ? 图册载体[mk].label : '') + '\n';
    ctx += '文件夹：' + 图册文件夹[mk] + '\n';
    ctx += '作品名称：' + 节目.info.name + '\n';
    ctx += '作品类型：' + cfg.label + '\n风格要求：' + cfg.styleDesc + '\n';
    ctx += (分页 ? '本期内容按「页」组织：从封面到末页，每页一张图片，若有分格则描述每一格。\n' : '板块结构：' + cfg.sections.join('、') + '\n');
    ctx += '期号：第' + ep + '期（新期号）\n';
    if (节目.info.focus) ctx += (分页 ? '剧情发展方向：' : '作品定位：') + 节目.info.focus + '\n';
    if (节目.info.description) ctx += (分页 ? '大致剧情内容：' : '作品简介：') + 节目.info.description + '\n';
    if (headline) ctx += '已填标题：' + headline + '\n';
    if (epFocus) ctx += (分页 ? '已填内容简介：' : '已填关注方向：') + epFocus + '\n';
    if (plot) ctx += '已填情节概述：' + plot + '\n';

    var 节目常驻画师 = 节目.info.refSourceNames || [];
    var 节目常驻角色 = 节目.info.refChars || [];
    ctx += '\n【本期概况】\n';
    ctx += '本期' + ((typeof window.图册来源标题 === 'function') ? 图册来源标题(图册当前载体) : '画师') + '：' + (图册本期来源.length ? 图册本期来源.join('、') : '（无）') + '\n';
    ctx += '本期出场：' + (图册本期角色.length ? 图册本期角色.join('、') : '（无）') + '\n';

    if (eps && eps.length) {
      ctx += '\n【已有期号概览】\n';
      eps.sort(function(a, b) { return (a.episode || 0) - (b.episode || 0); });
      eps.forEach(function(e) {
        var plotText = e.plot || '';
        var head = plotText ? '\n    开头：' + plotText.slice(0, 100) : '';
        var tail = plotText.length > 100 ? '\n    结尾：' + plotText.slice(-80) : '';
        ctx += '第' + e.episode + '期：' + (e.headline || '无标题') + head + tail + '\n';
      });
    }

    if (图册本期来源 && 图册本期来源.length) {
      ctx += '\n【画师 · 本作执笔者】\n';
      图册本期来源.forEach(function(n) {
        var found = 图册期号来源缓存.find(function(s) { return s.name === n; });
        ctx += 图册画师风格指令(found || n) + '\n';
      });
    }

    var 角色加载 = [];
    if (图册本期角色 && 图册本期角色.length) {
      ctx += '\n【出场人物】\n';
      角色加载 = 图册本期角色.map(function(rn) {
        return Store.character.get(rn).then(function(d) { return { name: rn, data: d }; });
      });
    }

    Promise.all(角色加载).then(function(角色列表) {
      角色列表.forEach(function(item) {
        ctx += (item.data && item.data.identity ? JSON.stringify({ identity: item.data.identity }, null, 2) : '- ' + item.name) + '\n';
      });

      var 模板名 = 分页 ? 'ht_episode_plan_paged' : 'ht_episode_plan';
      var rendered = renderPrompt(模板名, { context: ctx });
      LLM.callJSON({ prompt: rendered.user, system: rendered.system, label: '期号规划', temperature: 0.85 }).then(function(data) {
        if (!data) { toast('生成失败'); return; }
        var newHeadline = data.headline || '';
        var newFocus = data.epFocus || '';
        if (hlEl && newHeadline) hlEl.value = newHeadline;
        if (focusEl && newFocus) focusEl.value = newFocus;
        if (分页) {
          if (data.pages && Array.isArray(data.pages)) {
            window.图册期号分页缓存 = data.pages.map(function(p) {
              return { description: p.description || '', panels: (p.panels || []).map(function(g) { return { description: g.description || '', dialogue: g.dialogue || '' }; }) };
            });
            图册期号渲染分页();
          }
        } else {
          if (data.sections && typeof data.sections === 'object') {
            var boards = cfg.sections || [];
            var newBoards = {};
            boards.forEach(function(b) {
              var segs = Array.isArray(data.sections[b]) ? data.sections[b] : ((data.sections[b] && data.sections[b].segments) || []);
              newBoards[b] = segs.map(function(s) { return { speaker: s.speaker || '', visual: s.visual || '', content: s.content || '' }; });
            });
            window.图册期号板块缓存 = newBoards;
            图册期号渲染板块编辑器();
          }
        }
        图册自动保存期号();
        toast('✅ 第' + ep + '期规划已生成');
        if (statusEl) statusEl.textContent = '✅ 规划完成';
      }).catch(function(err) { toast('❌ ' + err.message); if (statusEl) statusEl.textContent = '❌ ' + err.message; });
    });
  }).catch(function(err) { toast('❌ ' + err.message); });
};

// ===== 连载漫画：分页内容编辑器 =====
window.图册期号渲染分页 = function() {
  var el = document.getElementById('htEpPages');
  if (!el) return;
  var pages = window.图册期号分页缓存 || [];
  if (!pages.length) { el.innerHTML = '<div style="font-size:11px;color:var(--fg3)">还没有页面，点「＋ 添加一页」或「🤖 AI 生成规划」。</div>'; return; }
  el.innerHTML = pages.map(function(p, pi) {
    var h = '<div class="n-card" style="padding:10px;border-left:3px solid var(--accent2);background:var(--bg2)">';
    h += '<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px">';
    h += '<span style="font-size:11px;font-weight:600;color:var(--accent2)">📄 第' + (pi + 1) + '页</span>';
    h += '<span class="btn-sm" style="font-size:10px;color:var(--error);cursor:pointer" onclick="图册期号删页(' + pi + ')">🗑 删除此页</span></div>';
    h += '<textarea class="llm-input" style="width:100%;min-height:56px;font-size:11px;resize:vertical" placeholder="本页画面描述（这一页整张图片的内容、构图、人物与场景）" oninput="图册期号更新页(' + pi + ',\'description\',this.value)">' + escHtml(p.description || '') + '</textarea>';
    h += '<div style="margin-top:6px;display:flex;flex-direction:column;gap:4px">';
    (p.panels || []).forEach(function(g, gi) {
      h += '<div class="n-card" style="padding:8px;background:var(--bg1);border-radius:6px;border:1px solid var(--border)">';
      h += '<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px"><span style="font-size:10px;color:var(--fg3)">格 ' + (gi + 1) + '</span><span class="btn-sm" style="font-size:10px;color:var(--error);cursor:pointer" onclick="图册期号删格(' + pi + ',' + gi + ')">🗑</span></div>';
      h += '<textarea class="llm-input" style="width:100%;min-height:40px;font-size:11px;resize:vertical" placeholder="这一格的内容描述（本格画面：人物、动作、表情、构图）" oninput="图册期号更新格(' + pi + ',' + gi + ',\'description\',this.value)">' + escHtml(g.description || '') + '</textarea>';
      h += '<input class="llm-input" style="width:100%;font-size:11px;margin-top:4px" placeholder="台词 / 旁白（本格对话框或图注）" value="' + escHtml(g.dialogue || '') + '" oninput="图册期号更新格(' + pi + ',' + gi + ',\'dialogue\',this.value)">';
      h += '</div>';
    });
    h += '<button class="btn-sm btn-outline" style="font-size:10px;align-self:flex-start" onclick="图册期号添加格(' + pi + ')">＋ 添加一格（分格）</button></div>';
    h += '</div>';
    return h;
  }).join('');
};

window.图册期号添加页 = function() {
  window.图册期号分页缓存.push({ description: '', panels: [] });
  图册期号渲染分页();
  图册自动保存期号();
};
window.图册期号删页 = function(pi) {
  window.图册期号分页缓存.splice(pi, 1);
  图册期号渲染分页();
  图册自动保存期号();
};
window.图册期号添加格 = function(pi) {
  var pages = window.图册期号分页缓存;
  if (!pages[pi]) return;
  if (!pages[pi].panels) pages[pi].panels = [];
  pages[pi].panels.push({ description: '', dialogue: '' });
  图册期号渲染分页();
  图册自动保存期号();
};
window.图册期号删格 = function(pi, gi) {
  var pages = window.图册期号分页缓存;
  if (pages[pi] && pages[pi].panels) pages[pi].panels.splice(gi, 1);
  图册期号渲染分页();
  图册自动保存期号();
};
window.图册期号更新页 = function(pi, field, val) {
  var pages = window.图册期号分页缓存;
  if (!pages[pi]) pages[pi] = { description: '', panels: [] };
  pages[pi][field] = val;
  图册自动保存期号();
};
window.图册期号更新格 = function(pi, gi, field, val) {
  var pages = window.图册期号分页缓存;
  if (pages[pi] && pages[pi].panels && pages[pi].panels[gi]) pages[pi].panels[gi][field] = val;
  图册自动保存期号();
};

// ===== 非分页载体（设定集/写真集）：分板块内容编辑器 =====
window.图册期号板块缓存 = {};
window.图册期号当前板块 = '';

window.图册期号渲染板块编辑器 = function() {
  var el = document.getElementById('htEpSections');
  if (!el) return;
  var cfg = window.图册获取节目配置(图册当前节目 ? 图册当前节目.info.type : '', 图册当前节目 ? 图册当前节目.info.subtype : '');
  var boards = cfg.sections || [];
  if (!boards.length) { el.innerHTML = '<div style="font-size:11px;color:var(--fg3)">无线索板块</div>'; return; }
  if (!window.图册期号当前板块 || boards.indexOf(window.图册期号当前板块) < 0) window.图册期号当前板块 = boards[0];
  var h = '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">';
  boards.forEach(function(b) { h += '<span class="tag-chip' + (b === window.图册期号当前板块 ? ' tag-active' : '') + '" style="font-size:10px;cursor:pointer" onclick="图册期号切板块(\'' + b + '\')">' + escHtml(b) + '</span>'; });
  h += '</div><div style="display:flex;flex-direction:column;gap:6px">';
  var segs = window.图册期号板块缓存[window.图册期号当前板块] || [];
  if (!segs.length) h += '<div style="font-size:11px;color:var(--fg3)">板块「' + escHtml(window.图册期号当前板块) + '」暂无内容，点「🤖 AI 生成规划」或「＋ 添加段落」。</div>';
  segs.forEach(function(sg, i) {
    h += '<div class="n-card" style="padding:8px;border-left:3px solid var(--accent2)">';
    h += '<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px"><input style="flex:1;font-size:11px;font-weight:600;color:var(--accent2);background:transparent;border:none" value="' + escHtml(sg.speaker || '') + '" placeholder="角色 / 旁白" onchange="图册期号更新段(\'' + window.图册期号当前板块 + '\',' + i + ',\'speaker\',this.value)"><span class="btn-sm" style="font-size:10px;color:var(--accent2);cursor:pointer" onclick="图册期号AI段(\'' + window.图册期号当前板块 + '\',' + i + ')">🤖</span><span class="btn-sm" style="font-size:10px;color:var(--error);cursor:pointer" onclick="图册期号删段(\'' + window.图册期号当前板块 + '\',' + i + ')">🗑</span></div>';
    h += '<textarea class="llm-input" style="width:100%;min-height:60px;font-size:12px;resize:vertical;margin-bottom:4px" placeholder="画面描述" onchange="图册期号更新段(\'' + window.图册期号当前板块 + '\',' + i + ',\'visual\',this.value)">' + escHtml(sg.visual || '') + '</textarea>';
    h += '<textarea class="llm-input" style="width:100%;min-height:44px;font-size:12px;resize:vertical" placeholder="台词 / 旁白" onchange="图册期号更新段(\'' + window.图册期号当前板块 + '\',' + i + ',\'content\',this.value)">' + escHtml(sg.content || '') + '</textarea>';
    h += '</div>';
  });
  h += '</div><div style="margin-top:6px"><button class="btn-sm btn-outline" onclick="图册期号加段(\'' + window.图册期号当前板块 + '\')" style="font-size:11px">＋ 添加段落</button></div>';
  el.innerHTML = h;
};
window.图册期号切板块 = function(b) { window.图册期号当前板块 = b; 图册期号渲染板块编辑器(); };
window.图册期号更新段 = function(b, i, field, val) {
  if (!window.图册期号板块缓存[b]) window.图册期号板块缓存[b] = [];
  if (!window.图册期号板块缓存[b][i]) window.图册期号板块缓存[b][i] = {};
  window.图册期号板块缓存[b][i][field] = val;
  图册自动保存期号();
};
window.图册期号删段 = function(b, i) {
  if (window.图册期号板块缓存[b]) window.图册期号板块缓存[b].splice(i, 1);
  图册期号渲染板块编辑器();
  图册自动保存期号();
};
window.图册期号加段 = function(b) {
  if (!window.图册期号板块缓存[b]) window.图册期号板块缓存[b] = [];
  window.图册期号板块缓存[b].push({ speaker: '旁白', visual: '', content: '' });
  图册期号渲染板块编辑器();
  图册自动保存期号();
};
window.图册期号AI段 = function(b, i) {
  var segs = window.图册期号板块缓存[b];
  if (!segs || !segs[i]) return;
  var cfg = window.图册获取节目配置(图册当前节目 ? 图册当前节目.info.type : '', 图册当前节目 ? 图册当前节目.info.subtype : '');
  var prompt = '名称：' + (图册当前节目 ? 图册当前节目.info.name : '') + '\n第' + ((图册当前期号 && 图册当前期号.info.episode) || (window.图册当前期号编号 || '?')) + '期\n板块：' + b + '\n风格：' + (cfg.styleDesc || '') + '\n';
  var sys = '你是一名极致细腻的情色画师/分镜师。JSON格式：{"speaker":"角色名或旁白","visual":"画面描述","content":"台词或旁白文字"}。visual必须极度精准、细腻、毫无遗漏（构图、人物、姿态表情、服饰材质、裸露细节、体位、光影、环境、氛围与一切细节）。content为台词或旁白。';
  toast('🤖 生成中...');
  LLM.callJSON({ prompt: prompt, system: sys, label: '图册期号板块生成', temperature: 0.85 }).then(function(d) {
    if (!d) return;
    if (d.speaker) segs[i].speaker = d.speaker;
    if (d.visual) segs[i].visual = d.visual;
    if (d.content) segs[i].content = d.content;
    图册期号渲染板块编辑器();
    图册自动保存期号();
    toast('✅ 已生成');
  }).catch(function(e) { toast('❌ ' + e.message); });
};

window.图册自动保存期号 = function() {
  if (图册自动保存计时器) clearTimeout(图册自动保存计时器);
  图册自动保存计时器 = setTimeout(图册保存当前期号, 500);
};

function 图册保存当前期号() {
  var mk = 图册当前载体;
  var 节目 = 图册当前节目;
  if (!节目) return Promise.resolve();
  if (图册是否单张(mk)) return Promise.resolve(); // 单张载体（插画）无期号，不写入期号 info
  var epInput = document.getElementById('htEpNumber');
  var ep = epInput ? parseInt(epInput.value) : 0;
  if (!ep || ep < 1) return Promise.resolve();
  var hlEl = document.getElementById('htEpHeadline');
  var focusEl = document.getElementById('htEpFocus');
  var plotEl = document.getElementById('htEpPlot');
  var info = { episode: ep, headline: (hlEl ? hlEl.value.trim() : '') || '', epFocus: (focusEl ? focusEl.value.trim() : '') || '', plot: (plotEl ? plotEl.value.trim() : '') || '', refChars: 图册本期角色 || [], refSourceNames: 图册本期来源 || [], createdAt: Date.now() };
  var 期号路径 = 图册期号路径(mk, 节目.name, ep);
  var saveTasks = [图册保存期号(期号路径, info)];
  if (图册是否分页(mk)) saveTasks.push(图册保存期号分页(期号路径, (window.图册期号分页缓存 || []).map(function(p) { return { description: p.description || '', panels: (p.panels || []).map(function(g) { return { description: g.description || '', dialogue: g.dialogue || '' }; }) }; })));
  else if (window.图册期号板块缓存 && Object.keys(window.图册期号板块缓存).length) {
    Object.keys(window.图册期号板块缓存).forEach(function(b) {
      saveTasks.push(图册保存版块(期号路径, b, { section: b, segments: window.图册期号板块缓存[b] }));
    });
  }
  return Promise.all(saveTasks).then(function() { window.图册当前期号 = { dir: 期号路径, info: info }; });
}

window.图册期号完成规划 = function() {
  图册保存当前期号().then(function() {
    图册当前期号 = window.图册当前期号 || null;
    window.图册期号编辑缓存 = null;
    图册切换标签('list');
  });
};

window.图册渲染规划 = 图册渲染规划;
