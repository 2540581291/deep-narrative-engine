// 深度-叙事引擎 · 角色卡 · 🔍 审计子模块
// 叙事矛盾检查 + 用户意图对齐审计，支持整改和搁置

// ===== 审计状态 =====
var 审计状态 = null;
// { id, catKey, source, status, result, char, fixError, userDesc }

// ===== 性别参考（仅用于审计维度中的性别差异提示） =====

var 审计性别参考 = {
  female: {
    label: '女性',
    ch7_deflowered: 'oral/vaginal/urethral/anal 四种',
  },
  male: {
    label: '男性',
    ch7_deflowered: 'ejaculation(射精)一种',
  },
  femboy: {
    label: '伪娘',
    ch7_deflowered: 'ejaculation/oral/urethral/anal/prostate 五种',
  },
  futa: {
    label: '扶她',
    ch7_deflowered: 'ejaculation/oral/vaginal/urethral/anal/prostate 六种',
  },
};

// ===== 缺失字段基准（两级：章节→顶层模块，按性别区分） =====
// identity 内部字段单独用 审计身份字段基准 做深度检查
var 审计缺失字段基准 = {
  common: {
    identity: ['basicInfo', 'background', 'experience'],
    appearance: ['facialFeatures', 'bodyShape', 'skinHair', 'marks', 'voiceScent'],
    attire: ['clothing', 'legwear', 'ornaments'],
    sexualCapability: ['sexualAbility', 'orgasmReaction', 'postOrgasmOverstimulation'],
    sexualHistory: ['milestones', 'bodyStats'],
    firstRecords: ['deflowered', 'firstOrgasm', 'firstLosingControl'],
    sexualPreferences: ['organPreferences', 'playPreferences', 'specialPeriod'],
    physicalHealth: ['physique', 'diseases', 'disabilities', 'bodyModifications'],
    personality: ['personality', 'speech'],
    statusContract: ['currentState', 'workStats', 'ownership'],
    attributes: ['basic', 'beauty', 'sex', 'relation', 'corruption'],
  },
  sexOrgans: {
    female: ['feet', 'breasts', 'nipples', 'pussy', 'anus'],
    male: ['foreskin', 'glans', 'penis', 'scrotum', 'anus'],
    femboy: ['feet', 'breasts', 'nipples', 'foreskin', 'glans', 'penis', 'scrotum', 'urethra', 'anus', 'prostate'],
    futa: ['feet', 'breasts', 'nipples', 'glans', 'penis', 'scrotum', 'urethra', 'prostate', 'foreskin', 'pussy'],
  },
  reproductiveHealth: {
    female: ['uterusStatus', 'menstruation', 'fertility', 'currentPregnancy', 'contraception'],
    male: ['testes', 'semen', 'fertility', 'prostateHealth', 'contraception'],
    femboy: ['testes', 'bladder', 'semen', 'fertility', 'prostateHealth', 'contraception'],
    futa: ['uterusStatus', 'menstruation', 'fertility', 'currentPregnancy', 'testes', 'bladder', 'semen', 'prostateHealth', 'contraception'],
  },
  meta: {
    female: ['tags', 'flags', 'notes', 'metadata'],
    male: ['tags', 'flags', 'notes', 'metadata'],
    femboy: ['tags', 'flags', 'notes', 'metadata'],
    futa: ['tagList', 'flags', 'characterNotes', 'metadata'],
  },
};
// identity 内部字段深度检查（检查 basicInfo/background/experience 内的直接子字段）
var 审计身份字段基准 = {
  basicInfo: ['id', 'name', 'title', 'icon', 'role', 'age', 'race', 'gender', 'rarity', 'price'],
  background: ['origin', 'birthStatus', 'family', 'upbringing', 'education', 'skills', 'talents', 'aura'],
  experience: ['currentOccupation', 'timeline', 'lifeOverview', 'dailyLife', 'sexualAwakening', 'dailySexuality', 'sexualDetails'],
};
var 审计章节中文 = {
  identity: '身份', appearance: '外貌', attire: '衣着', sexOrgans: '性特征',
  sexualCapability: '性能力', sexualHistory: '性历史', firstRecords: '首次记录',
  sexualPreferences: '性偏好', reproductiveHealth: '生殖健康', physicalHealth: '身体健康',
  personality: '性格言行', statusContract: '状态与契约', attributes: '属性', meta: '后台'
};

// ===== 审计提示词（叙事矛盾 + 用户意图对齐） =====

function 构建审计提示词(charJSON, catKey, userDesc) {
  var g = 审计性别参考[catKey] || 审计性别参考.female;

  return '你是一位角色编辑。评估一个新生成角色的质量，做两件事：\n'
    + '① 检查这个角色有没有叙事层面的内在矛盾\n'
    + '② 检查这个角色是否匹配用户原始描述中的要求\n\n'
    + '不要做字段结构完整性检查（那些是模板生成阶段的职责）。也不要报告数值范围问题。\n'
    + '只关注真正会影响角色可信度和用户体验的问题。\n\n'

    + '========== 角色信息 ==========\n'
    + '性别：【' + g.label + '】\n'
    + '该性别破处类型：' + g.ch7_deflowered + '\n\n'

    + '========== 用户原始描述（最优先核对）==========\n'
    + (userDesc || '（无原始描述，跳过意图比对）') + '\n\n'

    + '========== 审计维度 ==========\n\n'

    + '### 维度一：用户意图对齐（最优先）\n'
    + '逐条核对用户原始描述中的每个需求，判断角色是否满足：\n'
    + '- 用户明确提到的性格特征（冷傲/温柔/病娇/女王等）是否在 personality 中有体现\n'
    + '- 用户指定的种族/世界观（精灵/修仙/赛博朋克等）是否贯穿角色的 background/appearance/skills\n'
    + '- 用户设定的身份（公主/战士/奴隶等）是否与角色实际设定一致\n'
    + '- 用户提到的具体身体特征（银发/紫眸/高挑等）是否在外貌中有对应\n'
    + '- 如果有角色类型要求（如"属于某人的奴隶"），ownership/status 是否匹配\n\n'
    + '记录匹配到的点 -> intentMatches，未匹配的点 -> intentMisses。\n'
    + '如果角色完全不匹配用户的描述，verdict 应为"不通过"。\n\n'

    + '### 维度二：时间线与因果矛盾\n'
    + '- 年龄与性启蒙年龄、性经历总量之间是否合理\n'
    + '- 职业经历总年数是否超过当前年龄-16\n'
    + '- 背景事件序列是否有明显的因果断裂\n'
    + '- firstTime/性启蒙年龄不能早于出生或晚于当前年龄\n'
    + '- 性爱明细（sexualDetails）中的事件时间是否与其他时间线信息冲突\n\n'

    + '### 维度三：性格与行为一致性\n'
    + '- personality 的性格描写与 sexualHistory 中的行为表现是否一致\n'
    + '- 性爱明细（sexualDetails）中记录的事件与角色性格、行为倾向是否相符\n'
    + '- dailyLife 描述与性格设定是否匹配\n'
    + '- personality 中是否同时有直接冲突的特质\n'
    + '- speechPattern 的文风与 personality 是否协调\n\n'

    + '### 维度四：种族与外貌一致性\n'
    + '- 种族设定（精灵/兽人/天使/恶魔/龙族等）是否在 face/bodyShape 中有对应的典型特征\n'
    + '- 如果种族暗示了特定的体型、肤色、气质差异，角色中是否有体现\n'
    + '- 跨种族混血设定是否在文本中有合理说明\n\n'

    + '### 维度五：背景与技能匹配\n'
    + '- 出身/成长环境与 skills/talents 是否有逻辑关联\n'
    + '- education 背景与 currentOccupation 之间的关联是否合理\n'
    + '- 世界观设定（魔法/科技/修仙等）是否在角色的 skills 和 aura 中延续\n\n'

    + '## 审计标准\n'
    + '- **宁缺毋滥**：没有明显问题时就写"通过"。不用逐字段找茬，不用硬凑问题。\n'
    + '- **意图对齐优先**：角色不符合用户描述比角色内部小矛盾严重得多。\n'
    + '- **每个 narrativeIssue 必须 50-200 字**，说清楚矛盾在哪里。\n'
    + '- **5-2 高潮反应 和 5-3 高潮后过度刺激 是假设性设定**（描述"如果角色高潮了会是什么反应"），不代表角色已经经历过这些事情。因此这两个章节的内容不应被标记为叙事矛盾。\n\n'

    + '严格按照以下 JSON 格式输出审计结果，不要其他文字：\n'
    + '{\n'
    + '  "verdict": "通过|有疑点|不通过",\n'
    + '  "verdictReason": "一句话结论",\n'
    + '  "summary": "总体评价（30-80字）",\n'
    + '  "intentMatches": [\n'
    + '    "用户指定的某要求已体现在角色的某章节中（10-50字）"\n'
    + '  ],\n'
    + '  "intentMisses": [\n'
    + '    "用户指定了某要求但角色中未体现（10-50字）"\n'
    + '  ],\n'
    + '  "narrativeIssues": [\n'
    + '    {\n'
    + '      "type": "矛盾|疑问|欠缺",\n'
    + '      "dimension": "时间线|性格|种族|背景",\n'
    + '      "detail": "具体问题说明（50-200字）",\n'
    + '      "location": "问题涉及的章节或字段",\n'
    + '      "suggestion": "改进建议（20-100字）"\n'
    + '    }\n'
    + '  ],\n'
    + '  "viability": "角色评估：建议走什么路线？（20-60字）",\n'
    + '  "suggestFix": false\n'
    + '}\n\n'
    + '要求：\n'
    + '- verdict: "通过"=角色优秀或仅有微小瑕疵；"有疑点"=有需要注意的问题但不致命；"不通过"=严重偏离用户需求或有重大矛盾\n'
    + '- intentMatches/intentMisses：每条对应一个用户需求点。如果用户描述中提到了3个要求，这里就应该有对应的3条\n'
    + '- narrativeIssues 的 type：矛盾=数据上直接冲突；疑问=读者会感到不合理但不确定；欠缺=缺少应有内容\n'
    + '- suggestFix：至少有一个"矛盾"级别问题或 intentMisses 有 2 条以上时为 true\n'
    + '- **无问题时 narrativeIssues 为空数组，但 intentMatches 仍应填写**\n\n'

    + '===== 角色数据 =====\n'
    + charJSON;
}

function 构建修复提示词(charJSON, issues) {
  var lines = [];
  for (var i = 0; i < issues.length; i++) {
    var iss = issues[i];
    lines.push((i + 1) + '. [type:' + (iss.type || iss.severity || '未知') + '] [' + (iss.dimension || iss.category || '') + ']'
      + '\n   问题：' + (iss.detail || iss.issue || '')
      + '\n   涉及：' + (iss.location || iss.field || '')
      + '\n   建议：' + (iss.suggestion || '(未提供)'));
  }
  return '请根据以下问题清单修正角色 JSON。\n\n'
    + '## 要求\n'
    + '1. **实际修改数据**：每条"矛盾"类问题涉及的字段必须修改其值\n'
    + '2. "疑问"或"欠缺"类问题：如果涉及缺失描述性文本，可以补充；不需要改数据结构的跳过\n'
    + '3. 保持角色核心设定不变（姓名、种族、世界观、主要人格特征等）\n'
    + '4. 只修正有问题或矛盾的字段，不要随意改动无关字段\n'
    + '5. 输出修正后的**完整角色 JSON**，不要改变 JSON 结构\n'
    + '6. 不要添加任何额外文字（包括注释），只输出 JSON\n\n'
    + '## 问题清单\n'
    + lines.map(function(l, i) { return '【问题' + (i + 1) + '】' + l; }).join('\n') + '\n\n'
    + '## 角色 JSON（原始数据）\n'
    + charJSON;
}

// ===== 手动修改请求 Prompt =====

function 构建修改提示词(charJSON, requestText) {
  return '你是一位角色编辑。用户希望对角色提出修改要求，请按要求修改角色数据。\n\n'
    + '## 要求\n'
    + '1. 根据用户的修改要求，修改角色 JSON 中对应的字段\n'
    + '2. 保持角色核心设定不变（姓名、种族、世界观、主要人格特征等），除非用户明确要求修改这些\n'
    + '3. 保持角色 JSON 的完整结构不变，不要添加也不删除字段\n'
    + '4. 如果要求修改的内容在角色 JSON 中没有直接对应的字段，可以在合适的描述性文本中添加\n'
    + '5. 输出修改后的**完整角色 JSON**，不要其他文字\n'
    + '6. 不要添加注释或额外说明，只输出 JSON\n\n'
    + '## 用户的修改要求\n'
    + requestText + '\n\n'
    + '## 原始角色 JSON\n'
    + charJSON;
}

// ===== 品级和价值审计 Prompt =====

function 构建品级价值审计提示词(charJSON, catKey, userDesc) {
	var g = 审计性别参考[catKey] || 审计性别参考.female;

	return '你是一位角色品级和价值评估专家。根据以下角色数据和市场标准，评估该角色的品级（稀有度）和身价。\n\n'
		+ '========== 品级标准 ==========\n'
		+ '品级分为五档：\n'
		+ '  白 = 10万及以下\n'
		+ '  绿 = 10万到20万\n'
		+ '  蓝 = 20万到50万\n'
		+ '  紫 = 50万到100万\n'
		+ '  金 = 100万以上\n\n'
		+ '========== 身价计算公式 ==========\n'
		+ '身价 = int(10000 × 年龄 × 容貌 × 种族 × 健康 × 身材 × 性格) + 技能数 × 500\n'
		+ '日维护费 = 身价 / 100\n'
		+ '赎身价 = 身价 × 2\n\n'
		+ '========== 角色信息 ==========\n'
		+ '性别：【' + g.label + '】\n\n'
		+ (userDesc ? '========== 用户原始描述 ==========\n' + userDesc + '\n\n' : '')
		+ '========== 评估要求 ==========\n'
		+ '1. 根据角色的全部数据（年龄、种族、容貌描述、身材描述、性格、技能、背景等），综合评估合理的品级和身价\n'
		+ '2. 品级必须匹配身价范围（如上标准）\n'
		+ '3. 身价按公式计算，但可以根据角色的特殊设定（独特种族、稀有技能、特殊身份等）进行合理浮动\n'
		+ '4. 给出详细的评估理由\n\n'
		+ '严格按照以下 JSON 格式输出评估结果，不要其他文字：\n'
		+ '{\n'
		+ '  "currentRarity": "当前品级值",\n'
		+ '  "suggestedRarity": "建议品级",\n'
		+ '  "currentPrice": 当前身价数字,\n'
		+ '  "suggestedPrice": 建议身价数字,\n'
		+ '  "rarityReason": "品级评估理由（30-100字）",\n'
		+ '  "priceReason": "身价评估理由（30-100字）",\n'
		+ '  "detail": "综合评估说明（50-200字）"\n'
		+ '}\n\n'
		+ '===== 角色数据 =====\n'
		+ charJSON;
}


// ===== JSON 解析 =====

function 解析审计JSON(text) {
  if (!text || !text.trim()) return { verdict: '有疑点', summary: 'LLM 返回为空', suggestFix: false, intentMatches: [], intentMisses: [], narrativeIssues: [] };
  var cleaned = text.trim();

  // 尝试直接提取 {} 包裹的内容（跳过前导文字）
  var braceStart = cleaned.indexOf('{');
  var braceEnd = cleaned.lastIndexOf('}');
  if (braceStart < 0 || braceEnd <= braceStart) return { verdict: '有疑点', summary: '审计结果解析失败', suggestFix: false, intentMatches: [], intentMisses: [], narrativeIssues: [] };
  cleaned = cleaned.slice(braceStart, braceEnd + 1);

  // 去除 markdown 代码块包裹（如果 {} 被嵌套在 ``` 内）
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');

  // 单引号转双引号
  cleaned = cleaned.replace(/'/g, '"');

  // 去除尾逗号（最后一个 , 后面紧跟 } 或 ] 的情况）
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

  // 修复中文引号：""中文"" → "中文"（LLM 常把弯引号输成直引号）
  cleaned = cleaned.replace(/""([^"]{1,300}?)""/g, '“$1”');

  try {
    var obj = JSON.parse(cleaned);
    if (!obj.narrativeIssues) obj.narrativeIssues = obj.issues || [];
    if (!obj.intentMatches) obj.intentMatches = [];
    if (!obj.intentMisses) obj.intentMisses = [];
    if (!obj.verdict) obj.verdict = obj.narrativeIssues.length > 0 ? '有疑点' : '通过';
    if (!obj.summary) obj.summary = '审计完成';
    return obj;
  } catch(e) {
    // 兜底：去掉可能存在的注释再试一次
    try {
      cleaned = cleaned.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      var obj2 = JSON.parse(cleaned);
      if (!obj2.narrativeIssues) obj2.narrativeIssues = obj2.issues || [];
      if (!obj2.intentMatches) obj2.intentMatches = [];
      if (!obj2.intentMisses) obj2.intentMisses = [];
      if (!obj2.verdict) obj2.verdict = obj2.narrativeIssues.length > 0 ? '有疑点' : '通过';
      if (!obj2.summary) obj2.summary = '审计完成';
      return obj2;
    } catch(e2) {
      return { verdict: '有疑点', summary: '审计结果 JSON 解析失败', suggestFix: false, intentMatches: [], intentMisses: [], narrativeIssues: [] };
    }
  }
}

function 解析修复JSON(text) {
  if (!text || !text.trim()) return { ok: false, error: 'LLM 返回为空' };
  var cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  var braceStart = cleaned.indexOf('{');
  var braceEnd = cleaned.lastIndexOf('}');
  if (braceStart >= 0 && braceEnd > braceStart) {
    cleaned = cleaned.slice(braceStart, braceEnd + 1);
  } else {
    return { ok: false, error: '未找到 JSON 对象' };
  }
  // 尾逗号清理
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  // 中文引号修复
  cleaned = cleaned.replace(/""([^"]{1,300}?)""/g, '“$1”');
  try {
    var obj = JSON.parse(cleaned);
    if (!obj.identity || !obj.identity.basicInfo || !obj.identity.basicInfo.name) {
      return { ok: false, error: '修正后的角色缺少必需字段' };
    }
    return { ok: true, char: obj };
  } catch(e) {
    // 兜底：去掉注释再试
    try {
      cleaned = cleaned.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      var obj2 = JSON.parse(cleaned);
      if (!obj2.identity || !obj2.identity.basicInfo || !obj2.identity.basicInfo.name) {
        return { ok: false, error: '修正后的角色缺少必需字段' };
      }
      return { ok: true, char: obj2 };
    } catch(e2) {
      return { ok: false, error: 'JSON 解析失败: ' + e2.message };
    }
  }
}

function 解析品级价值审计JSON(text) {
	if (!text || !text.trim()) return { suggestedRarity: '白', suggestedPrice: 10000, rarityReason: 'LLM 返回为空', priceReason: '', detail: '' };
	var cleaned = text.trim();
	cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
	cleaned = cleaned.replace(/\s*```$/i, '');
	var braceStart = cleaned.indexOf('{');
	var braceEnd = cleaned.lastIndexOf('}');
	if (braceStart < 0 || braceEnd <= braceStart) {
		return { suggestedRarity: '白', suggestedPrice: 10000, rarityReason: '解析失败', priceReason: '', detail: '' };
	}
	cleaned = cleaned.slice(braceStart, braceEnd + 1);
	// 尾逗号清理
	cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
	try {
		var obj = JSON.parse(cleaned);
		if (!obj.suggestedRarity) obj.suggestedRarity = '白';
		if (!obj.suggestedPrice) obj.suggestedPrice = obj.currentPrice || 10000;
		if (!obj.rarityReason) obj.rarityReason = '';
		if (!obj.priceReason) obj.priceReason = '';
		if (!obj.detail) obj.detail = '';
		return obj;
	} catch(e) {
		// 兜底：去掉注释再试
		try {
			cleaned = cleaned.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
			var obj2 = JSON.parse(cleaned);
			if (!obj2.suggestedRarity) obj2.suggestedRarity = '白';
			if (!obj2.suggestedPrice) obj2.suggestedPrice = obj2.currentPrice || 10000;
			if (!obj2.rarityReason) obj2.rarityReason = '';
			if (!obj2.priceReason) obj2.priceReason = '';
			if (!obj2.detail) obj2.detail = '';
			return obj2;
		} catch(e2) {
			return { suggestedRarity: '白', suggestedPrice: 10000, rarityReason: 'JSON 解析失败: ' + e2.message, priceReason: '', detail: '' };
		}
	}
}

// ===== 缺失字段检查（确定性前端遍历，不耗 LLM） =====

function 检查缺失字段(char, catKey) {
  var missing = [];
  if (!char || typeof char !== 'object') return { missing: missing, count: 0 };
  var g = catKey || 'female';

  // 两级检查：章节 → 顶层模块
  function 查(chapter, subs) {
    var chObj = char[chapter];
    var chName = 审计章节中文[chapter] || chapter;
    if (!chObj || typeof chObj !== 'object') {
      subs.forEach(function(sub) {
        missing.push({ chapter: chapter, chapterName: chName, module: sub, field: '', path: chapter + '.' + sub });
      });
      return;
    }
    subs.forEach(function(sub) {
      if (chObj[sub] === undefined) {
        missing.push({ chapter: chapter, chapterName: chName, module: sub, field: '', path: chapter + '.' + sub });
      }
    });
  }

  // 身份内部字段深度检查：identity.basicInfo.name / identity.experience.sexualDetails 等
  function 查身份内部() {
    var chObj = char.identity;
    var chName = 审计章节中文.identity || '身份';
    if (!chObj || typeof chObj !== 'object') return; // identity 缺失已由两级检查覆盖
    Object.keys(审计身份字段基准).forEach(function(moduleKey) {
      var fields = 审计身份字段基准[moduleKey];
      if (chObj[moduleKey] === undefined || chObj[moduleKey] === null) return; // 模块缺失已由两级覆盖
      var modObj = chObj[moduleKey];
      if (typeof modObj !== 'object') return;
      fields.forEach(function(f) {
        if (modObj[f] === undefined) {
          missing.push({ chapter: 'identity', chapterName: chName, module: moduleKey, field: f, path: 'identity.' + moduleKey + '.' + f });
        }
      });
    });
  }

  // 性格言行内部深度检查：personality.personality{traits,goals,likes} / personality.speech{address,words}
  function 查性格言行内部() {
    var chName = 审计章节中文.personality || '性格言行';
    var pers = char.personality;
    if (!pers || typeof pers !== 'object') return;
    var 性格 = pers.personality;
    if (性格 && typeof 性格 === 'object') {
      ['traits', 'goals', 'likes'].forEach(function(sub) {
        if (性格[sub] === undefined) {
          missing.push({ chapter: 'personality', chapterName: chName, module: 'personality', field: sub, path: 'personality.personality.' + sub });
        }
      });
    }
    var speech = pers.speech;
    if (speech && typeof speech === 'object') {
      ['address', 'words'].forEach(function(sub) {
        if (speech[sub] === undefined) {
          missing.push({ chapter: 'personality', chapterName: chName, module: 'speech', field: sub, path: 'personality.speech.' + sub });
        }
      });
    }
  }

  var common = 审计缺失字段基准.common;
  Object.keys(common).forEach(function(chapter) { 查(chapter, common[chapter]); });
  var sexOrgans = 审计缺失字段基准.sexOrgans[g] || 审计缺失字段基准.sexOrgans.female;
  var repro = 审计缺失字段基准.reproductiveHealth[g] || 审计缺失字段基准.reproductiveHealth.female;
  var metaSubs = 审计缺失字段基准.meta[g] || 审计缺失字段基准.meta.female;
  查('sexOrgans', sexOrgans);
  查('reproductiveHealth', repro);
  查('meta', metaSubs);
  查身份内部();
  查性格言行内部();

  return { missing: missing, count: missing.length };
}

// ===== 角色数据访问 =====

// ===== 角色数据访问 =====

function 获取审计角色(id, catKey) {
  var map = S.generatedCharacters && S.generatedCharacters[catKey];
  if (map && map[id]) {
    var char = map[id].fullChar || map[id].outline || null;
    var desc = map[id].desc || (char && char._desc ? char._desc : '');
    return char ? { char: char, desc: desc } : null;
  }
  return null;
}

function 替换审计角色(id, catKey, newChar) {
  var map = S.generatedCharacters && S.generatedCharacters[catKey];
  if (map && map[id]) map[id].fullChar = newChar;
}

function 保存审计报告(id, catKey, result, fixesApplied) {
  var issues = result.narrativeIssues || [];
  var report = {
    status: 'completed',
    reportAt: Date.now(),
    fixesApplied: !!fixesApplied,
    verdict: result.verdict || '有疑点',
    summary: result.summary || '',
    suggestFix: !!result.suggestFix,
    intentMatches: result.intentMatches || [],
    intentMisses: result.intentMisses || [],
    viability: result.viability || '',
    issueCount: issues.length,
    // 保留 LLM 原始格式（type/dimension/detail/location/suggestion）
    narrativeIssues: issues.slice(),
    // 兼容旧格式
    issues: issues.map(function(iss) {
      return {
        severity: iss.type === '矛盾' ? 'major' : (iss.type === '疑问' ? 'minor' : 'minor'),
        category: iss.dimension || '叙事矛盾',
        field: iss.location || '',
        issue: iss.detail || '',
        suggestion: iss.suggestion || '',
      };
    }),
  };

  var map = S.generatedCharacters && S.generatedCharacters[catKey];
  if (map && map[id]) map[id].audit = report;
  save();
}

// ===== 统一审计入口 =====

window.角色审计打开 = function(id, catKey) {
  var entry = 获取审计角色(id, catKey);
  var char = entry ? entry.char : null;

  var report = null;
  var genMap = S.generatedCharacters && S.generatedCharacters[catKey];
  if (genMap && genMap[id] && genMap[id].audit) report = genMap[id].audit;

  if (report) {
    // 兼容旧数据：如果保存的 report 有 narrativeIssues 直接用，否则从旧格式 issues 反向映射
    var loadedIssues = report.narrativeIssues;
    if (!loadedIssues && report.issues && report.issues.length > 0) {
      loadedIssues = report.issues.map(function(iss) {
        return {
          type: iss.severity === 'major' ? '矛盾' : (iss.severity === 'minor' ? '疑问' : '疑问'),
          dimension: iss.category || '',
          detail: iss.issue || '',
          location: iss.field || '',
          suggestion: iss.suggestion || '',
        };
      });
    }
    审计状态 = {
      id: id, catKey: catKey, source: 'pending',
      status: 'viewing-saved',
      result: {
        verdict: report.verdict || (report.issueCount > 0 ? '有疑点' : '通过'),
        summary: report.summary || '审计报告（已保存）',
        suggestFix: report.suggestFix !== undefined ? report.suggestFix : !report.fixesApplied,
        intentMatches: report.intentMatches || [],
        intentMisses: report.intentMisses || [],
        viability: report.viability || '',
        narrativeIssues: loadedIssues || [],
      },
      char: char, fixError: null,
      savedReport: report,
    };
    渲染审计覆盖层();
  } else {
    审计状态 = {
      id: id, catKey: catKey, source: 'pending',
      status: 'menu',
      result: null, char: char,
      userDesc: entry ? entry.desc : '', fixError: null,
    };
    渲染审计覆盖层();
  }
};

// ===== 主审计触发 =====

window.角色审计执行 = function(id, catKey, source) {
  if (审计状态 && (审计状态.status === 'loading' || 审计状态.status === 'loading-fix')) return;

  var entry = 获取审计角色(id, catKey, source);
  if (!entry) { window.toast('角色数据不存在'); return; }

  审计状态 = {
    id: id,
    catKey: catKey,
    source: source,
    status: 'loading',
    result: null,
    char: entry.char,
    userDesc: entry.desc,
    fixError: null,
  };

  渲染审计覆盖层();

  var charJSON = JSON.stringify(entry.char, null, 2);
  var prompt = 构建审计提示词(charJSON, catKey, entry.desc);

  LLM.call({
    label: '角色审计',
    system: '你是一位角色编辑，评估角色的叙事一致性和用户意图匹配度。只输出 JSON。',
    prompt: prompt,
  }).then(function(text) {
    if (!审计状态 || 审计状态.status !== 'loading') return;
    var parsed = 解析审计JSON(text);
    审计状态.status = 'done';
    审计状态.result = parsed;
    渲染审计覆盖层();
  }).catch(function(err) {
    if (!审计状态 || 审计状态.status !== 'loading') return;
    审计状态.status = 'done';
    审计状态.result = { verdict: '有疑点', summary: 'LLM 调用失败: ' + err.message, suggestFix: false, intentMatches: [], intentMisses: [], narrativeIssues: [], viability: '' };
    渲染审计覆盖层();
  });
};

// ===== 品级价值审计触发 =====

window.角色品级价值审计执行 = function(id, catKey, source) {
	if (审计状态 && (审计状态.status === 'loading' || 审计状态.status === 'loading-fix')) return;

	var entry = 获取审计角色(id, catKey, source);
	if (!entry) { window.toast('角色数据不存在'); return; }

	审计状态 = {
		id: id,
		catKey: catKey,
		source: source,
		status: 'loading',
		auditType: 'grade-value',
		result: null,
		char: entry.char,
		userDesc: entry.desc,
		fixError: null,
	};

	渲染审计覆盖层();

	var charJSON = JSON.stringify(entry.char, null, 2);
	var prompt = 构建品级价值审计提示词(charJSON, catKey, entry.desc);

	LLM.call({
		label: '角色品级价值审计',
		system: '你是一位角色品级和价值评估专家。根据角色数据和市场标准评估品级和身价。只输出 JSON。',
		prompt: prompt,
	}).then(function(text) {
		if (!审计状态 || 审计状态.status !== 'loading') return;
		var parsed = 解析品级价值审计JSON(text);
		审计状态.status = 'done';
		审计状态.result = parsed;
		渲染审计覆盖层();
	}).catch(function(err) {
		if (!审计状态 || 审计状态.status !== 'loading') return;
		审计状态.status = 'done';
		审计状态.result = { suggestedRarity: '白', suggestedPrice: 10000, rarityReason: '', priceReason: '', detail: '', _isGradeValueError: true, summary: 'LLM 调用失败: ' + err.message };
		渲染审计覆盖层();
	});
};

// ===== 缺失字段检查触发 =====

window.角色缺失字段审计执行 = function(id, catKey, source) {
  var entry = 获取审计角色(id, catKey, source);
  if (!entry) { window.toast('角色数据不存在'); return; }

  审计状态 = {
    id: id,
    catKey: catKey,
    source: source,
    status: 'loading',
    result: null,
    char: entry.char,
    userDesc: entry.desc,
    fixError: null,
  };

  渲染审计覆盖层();

  // 缺失判定是确定性的，无需 LLM，直接同步产出结果
  var res = 检查缺失字段(entry.char, catKey);
  var issues = res.missing.map(function(m) {
    return {
      type: '欠缺',
      dimension: m.chapterName,
      detail: '缺失字段：' + m.path + '，该字段是角色卡「' + m.chapterName + '」的必要组成部分',
      location: m.path,
      suggestion: '补充该字段内容',
    };
  });

  审计状态.status = 'done';
  审计状态.result = {
    verdict: res.count > 0 ? '有疑点' : '通过',
    summary: res.count > 0 ? '发现 ' + res.count + ' 个缺失字段' : '所有关键字段完整',
    narrativeIssues: issues,
    intentMatches: [],
    intentMisses: [],
    viability: res.count > 0 ? '建议补充缺失字段后再用于生成' : '字段完整，可直接使用',
    suggestFix: res.count > 0,
  };
  渲染审计覆盖层();
};


// ===== 搁置 =====

window.角色审计搁置 = function() {
  if (!审计状态 || !审计状态.result) return;
  保存审计报告(审计状态.id, 审计状态.catKey, 审计状态.result, false);
  var issues = 审计状态.result.narrativeIssues || [];
  关闭审计覆盖层();
  window.toast(issues.length > 0 ? '审计报告已保存，问题暂未处理' : '审计完成，未发现问题');
};

// ===== 整改 =====

window.角色审计应用修复 = function() {
  if (!审计状态 || !审计状态.result) return;

  var entry = 获取审计角色(审计状态.id, 审计状态.catKey, 审计状态.source);
  if (!entry) { window.toast('角色数据不存在，无法修复'); return; }

  审计状态.status = 'loading-fix';
  审计状态.fixError = null;
  渲染审计覆盖层();

  var charJSON = JSON.stringify(entry.char, null, 2);
  var issues = 审计状态.result.narrativeIssues || [];
  var prompt = 构建修复提示词(charJSON, issues);

  LLM.call({
    label: '角色审计·自动修复',
    system: '你是一位角色数据修正专家。输出修正后的角色完整 JSON，不要其他文字。',
    prompt: prompt,
  }).then(function(text) {
    if (!审计状态 || 审计状态.status !== 'loading-fix') return;
    var parsed = 解析修复JSON(text);
    if (parsed.ok) {
      替换审计角色(审计状态.id, 审计状态.catKey, parsed.char);

      // 如果是从生成预览执行的审计，同步更新 角色生成结果._char
      if (审计状态.source === 'pending' && 角色暂存最新ID === 审计状态.id && 角色生成结果) {
        角色生成结果._char = JSON.parse(JSON.stringify(parsed.char));
      }

      保存审计报告(审计状态.id, 审计状态.catKey, 审计状态.result, true);
      审计状态.status = 'fix-done';
      审计状态.fixedChar = parsed.char;
      渲染审计覆盖层();
    } else {
      审计状态.status = 'done';
      审计状态.fixError = parsed.error || '修复结果解析失败';
      渲染审计覆盖层();
      window.toast('⚠️ 自动修复失败，可重试或搁置');
    }
  }).catch(function(err) {
    if (!审计状态 || 审计状态.status !== 'loading-fix') return;
    审计状态.status = 'done';
    审计状态.fixError = 'LLM 调用失败: ' + err.message;
    渲染审计覆盖层();
    window.toast('⚠️ 修复调用失败，可重试或搁置');
  });
};

// ===== 品级价值审计应用修复 =====

window.角色品级价值审计应用修复 = function() {
	if (!审计状态 || !审计状态.result || !审计状态.result.suggestedRarity) return;

	var entry = 获取审计角色(审计状态.id, 审计状态.catKey, 审计状态.source);
	if (!entry) { window.toast('角色数据不存在'); return; }

	var newChar = JSON.parse(JSON.stringify(entry.char));
	if (!newChar.identity) newChar.identity = {};
	if (!newChar.identity.basicInfo) newChar.identity.basicInfo = {};

	newChar.identity.basicInfo.rarity = 审计状态.result.suggestedRarity;
	newChar.identity.basicInfo.price = 审计状态.result.suggestedPrice;

	替换审计角色(审计状态.id, 审计状态.catKey, newChar);

	// 同步 pending 引用
	if (审计状态.source === 'pending' && typeof 角色暂存最新ID !== 'undefined' && 角色暂存最新ID === 审计状态.id && typeof 角色生成结果 !== 'undefined' && 角色生成结果) {
		角色生成结果._char = JSON.parse(JSON.stringify(newChar));
	}

	try { save(); } catch(e) {}
	window.toast('✅ 品级和价值已更新：' + newChar.identity.basicInfo.rarity + ' / ' + Number(newChar.identity.basicInfo.price).toLocaleString());
	审计状态 = null;
	关闭审计覆盖层();
};


// ===== 手动修改请求 =====

window.角色审计打开修改 = function() {
  if (!审计状态 || !审计状态.char) return;
  审计状态.status = 'request-input';
  审计状态.requestText = '';
  审计状态.requestError = null;
  审计状态.requestResult = null;
  渲染审计覆盖层();
};

window.角色审计应用修改 = function() {
  if (!审计状态 || 审计状态.status !== 'request-input') return;

  var textarea = document.getElementById('charAuditRequestInput');
  if (!textarea) return;
  var requestText = textarea.value.trim();
  if (!requestText) { window.toast('请输入修改要求'); return; }

  var entry = 获取审计角色(审计状态.id, 审计状态.catKey, 审计状态.source);
  if (!entry) { window.toast('角色数据不存在'); return; }

  审计状态.status = 'request-loading';
  审计状态.requestText = requestText;
  审计状态.requestError = null;
  审计状态.requestResult = null;
  渲染审计覆盖层();

  var charJSON = JSON.stringify(entry.char, null, 2);
  var prompt = 构建修改提示词(charJSON, requestText);

  LLM.call({
    label: '角色修改要求',
    system: '你是一位角色数据编辑专家。输出修改后的完整角色 JSON，不要其他文字。',
    prompt: prompt,
  }).then(function(text) {
    if (!审计状态 || 审计状态.status !== 'request-loading') return;
    var parsed = 解析修复JSON(text);
    if (parsed.ok) {
      审计状态.status = 'request-done';
      审计状态.requestResult = { char: parsed.char, request: requestText };
      渲染审计覆盖层();
    } else {
      审计状态.status = 'request-input';
      审计状态.requestError = parsed.error || '结果解析失败';
      渲染审计覆盖层();
      window.toast('⚠️ 修改要求处理失败，可调整后重试');
    }
  }).catch(function(err) {
    if (!审计状态 || 审计状态.status !== 'request-loading') return;
    审计状态.status = 'request-input';
    审计状态.requestError = 'LLM 调用失败: ' + err.message;
    渲染审计覆盖层();
    window.toast('⚠️ 调用失败，请重试');
  });
};

window.角色审计确认修改 = function() {
  if (!审计状态 || !审计状态.requestResult) return;
  var newChar = 审计状态.requestResult.char;
  替换审计角色(审计状态.id, 审计状态.catKey, newChar);

  // 同步更新 pending 引用
  if (审计状态.source === 'pending' && typeof 角色暂存最新ID !== 'undefined' && 角色暂存最新ID === 审计状态.id && typeof 角色生成结果 !== 'undefined' && 角色生成结果) {
    角色生成结果._char = JSON.parse(JSON.stringify(newChar));
  }

  try { save(); } catch(e) {}
  window.toast('✅ 修改要求已应用');
  审计状态 = null;
  关闭审计覆盖层();
};

window.角色审计取消修改 = function() {
  if (!审计状态) return;
  审计状态.status = 'done';
  审计状态.requestText = null;
  审计状态.requestError = null;
  审计状态.requestResult = null;
  渲染审计覆盖层();
};

// ===== 重新审计 =====

window.角色审计重新审计 = function() {
  if (!审计状态) return;
  window.角色审计执行(审计状态.id, 审计状态.catKey, 审计状态.source);
};

// ===== 取消（不保存） =====

window.角色审计取消 = function() {
  审计状态 = null;
  var overlay = document.getElementById('charAuditOverlay');
  if (overlay) {
    overlay.style.display = 'none';
    overlay.innerHTML = '';
  }
};

// ===== 覆盖层渲染 =====

function esc(s) { return escHtml(s); }

function 渲染审计覆盖层() {
  var overlay = document.getElementById('charAuditOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'charAuditOverlay';
    overlay.setAttribute('style', 'position:fixed;bottom:16px;right:16px;z-index:9999;width:480px;max-height:70vh;');
    document.body.appendChild(overlay);
  }

  var IS = 'background:var(--card,#1a1a2e);border:1px solid var(--accent2,#e8a0b4);border-radius:12px;max-height:68vh;overflow-y:auto;padding:14px;box-shadow:0 4px 20px rgba(0,0,0,0.4);';

  var h = '<div style="' + IS + '">';

  if (审计状态.status === 'loading') {
    h += '<div class="text-center py-30">';
    h += '<div class="fs-36 mb-12">🔍</div>';
    h += '<div class="fs-14 c-accent2 fw-700">正在审计角色...</div>';
    h += '<div class="fs-11 c-fg3 mt-8">检查叙事一致性和用户意图对齐中</div>';
    h += '</div>';
  } else if (审计状态.status === 'loading-fix') {
    h += '<div class="text-center py-30">';
    h += '<div class="fs-36 mb-12">🛠️</div>';
    h += '<div class="fs-14 c-accent2 fw-700">正在根据审计建议修正角色...</div>';
    h += '<div class="fs-11 c-fg3 mt-8">自动修复逻辑矛盾中</div>';
    h += '</div>';
  } else if (审计状态.status === 'fix-done') {
    var bi = 审计状态.char && 审计状态.char.identity && 审计状态.char.identity.basicInfo || {};
    var name = bi.name || '未知角色';
    h += '<div class="text-center py-10">';
    h += '<div class="fs-36 mb-8">✅</div>';
    h += '<div class="fs-14 c-success fw-700 mb-4">修复完成！</div>';
    h += '<div class="fs-12 c-fg3 mb-12">角色「' + esc(name) + '」的审计问题已自动修复</div>';
    h += '<div class="flex gap-8 justify-center">';
    h += '<button class="btn btn-primary" onclick="window.角色审计重新审计()">🔄 重新审计（验证修复效果）</button>';
    h += '<button class="btn btn-outline" onclick="window.角色审计取消()">✕ 关闭</button>';
    h += '</div></div>';
  } else if (审计状态.status === 'menu') {
    var bi = 审计状态.char && 审计状态.char.identity && 审计状态.char.identity.basicInfo || {};
    var name = bi.name || '...';
    h += '<div class="text-center p-20-0">';
    h += '<div class="fs-14 fw-700 c-fg mb-4">🔍 角色审计</div>';
    h += '<div class="fs-11 c-fg3 mb-16">还没有审计记录，请选择操作：</div>';
    h += '<div class="flex flex-col gap-8" style="max-width:280px;margin:0 auto">';
    h += '<button class="btn btn-primary" onclick="window.角色审计执行(\'' + 审计状态.id + '\',\'' + 审计状态.catKey + '\',\'' + 审计状态.source + '\')">🔍 开始审计（LLM 自动检查）</button>';
    h += '<button class="btn btn-outline" onclick="window.角色缺失字段审计执行(\'' + 审计状态.id + '\',\'' + 审计状态.catKey + '\',\'' + 审计状态.source + '\')">📌 缺失字段检查</button>';
    h += '<button class="btn btn-outline" onclick="window.角色审计打开修改()">✏️ 提出修改要求</button>';
    h += '<button class="btn btn-outline" onclick="window.角色品级价值审计执行(\'' + 审计状态.id + '\',\'' + 审计状态.catKey + '\',\'' + 审计状态.source + '\')">⭐ 品级和价值审计</button>';
    h += '<button class="btn btn-outline" onclick="window.角色审计取消()" style="padding:6px;font-size:11px;color:var(--fg3)">取消</button>';
    h += '</div></div>';
  } else if (审计状态.status === 'request-input') {
    h += '<div class="mb-12">';
    h += '<div class="flex items-center gap-6 mb-8">';
    h += '<span class="fs-16">✏️</span>';
    h += '<span class="fs-13 fw-700 c-fg">提出修改要求</span>';
    h += '<span onclick="window.角色审计取消修改()" class="cur-ptr fs-18 c-fg3" style="margin-left:auto">&times;</span>';
    h += '</div>';
    h += '<div class="fs-11 c-fg3 mb-6">描述你想要修改的内容。系统将根据要求修改角色数据，保持其他部分不变。</div>';
    h += '<div class="fs-10 c-accent2 mb-6">💡 例如：把性格改成冰山美人 / 给她加一道疤痕 / 改成兽耳娘 / 让她成为吸血鬼</div>';
    h += '<textarea id="charAuditRequestInput" placeholder="请输入你的修改要求..." class="llm-input w-100 minh-60 resize-v">' + escHtml(审计状态.requestText || '') + '</textarea>';
    if (审计状态.requestError) {
      h += '<div class="mt-6 p-6-10 bg-bg2 rad-3 fs-11" style="border:1px solid var(--error);color:var(--error)">⚠️ ' + esc(审计状态.requestError) + '</div>';
    }
    h += '<div class="flex gap-8 mt-10">';
    h += '<button class="btn btn-primary flex-1" onclick="window.角色审计应用修改()">🚀 应用修改</button>';
    h += '<button class="btn btn-outline" onclick="window.角色审计取消修改()">取消</button>';
    h += '</div></div>';
  } else if (审计状态.status === 'request-loading') {
    h += '<div class="text-center py-30">';
    h += '<div class="fs-36 mb-12">✏️</div>';
    h += '<div class="fs-14 c-accent2 fw-700">正在根据要求修改角色...</div>';
    h += '<div class="fs-11 c-fg3 mt-8" style="max-height:40px;overflow:hidden;text-overflow:ellipsis">"' + escHtml(审计状态.requestText || '') + '"</div>';
    h += '</div>';
  } else if (审计状态.status === 'request-done') {
    var result = 审计状态.requestResult;
    var bi = result && result.char && result.char.identity && result.char.identity.basicInfo || {};
    var name = bi.name || '未知角色';
    h += '<div class="text-center py-10">';
    h += '<div class="fs-36 mb-8">✅</div>';
    h += '<div class="fs-14 c-success fw-700 mb-4">修改完成！</div>';
    h += '<div class="fs-12 c-fg3 mb-6">角色「' + esc(name) + '」已按以下要求修改：</div>';
    h += '<div class="fs-11 c-fg p-8-10 bg-bg2 rad-6 mb-12 text-left fs-italic">"' + escHtml(审计状态.requestText || '') + '"</div>';
    h += '<div class="flex gap-8 justify-center">';
    h += '<button class="btn btn-primary flex-1" onclick="window.角色审计确认修改()">✅ 确认修改</button>';
    h += '<button class="btn btn-outline" onclick="window.角色审计取消修改()">✕ 取消</button>';
    h += '</div></div>';
  } else if (审计状态.auditType === 'grade-value' && (审计状态.status === 'done' || 审计状态.status === 'viewing-saved')) {
  	var result_gv = 审计状态.result;
  	var bi_gv = 审计状态.char && 审计状态.char.identity && 审计状态.char.identity.basicInfo || {};
  	var name_gv = bi_gv.name || '未知角色';
  	var rarityColors = { '金': 'var(--accent2)', '紫': 'var(--accent)', '蓝': 'var(--fg2)', '绿': 'var(--success)', '白': 'var(--fg3)' };

  	// Header
  	h += '<div class="flex items-center justify-between mb-10">';
  	h += '<div class="flex items-center gap-8">';
  	h += '<span class="fs-18">⭐</span>';
  	h += '<span style="font-size:14px;font-weight:bold;">品级和价值审计</span>';
  	h += '</div>';
  	if (审计状态.status === 'viewing-saved') {
  		h += '<div class="fs-10 c-fg3">🕐 ' + 格式化时间(审计状态.savedReport.reportAt) + '</div>';
  	}
  	h += '<div class="cur-ptr fs-22 c-fg3 p-0-4" onclick="window.角色审计取消()">&times;</div>';
  	h += '</div>';

  	// Character name
  	h += '<div class="fs-11 c-fg mb-12">📋 ' + esc(name_gv) + '</div>';

  	// Current vs suggested rarity
  	var curRar = result_gv.currentRarity || bi_gv.rarity || '白';
  	var sugRar = result_gv.suggestedRarity || '白';
  	h += '<div class="mb-10 p-8-12 bg-bg2 rad-6">';
  	h += '<div class="flex items-center justify-between mb-6">';
  	h += '<span class="fs-11 c-fg3">当前品级</span>';
  	h += '<span style="font-size:16px;font-weight:bold;color:' + (rarityColors[curRar] || 'var(--fg3)') + '">' + esc(curRar) + '</span>';
  	h += '</div>';
  	h += '<div class="flex items-center justify-between mb-6">';
  	h += '<span class="fs-11 c-fg3">建议品级</span>';
  	h += '<span style="font-size:16px;font-weight:bold;color:' + (rarityColors[sugRar] || 'var(--accent2)') + '">' + esc(sugRar) + '</span>';
  	h += '</div>';
  	if (sugRar !== curRar) {
  		h += '<div class="fs-10 c-accent2 mt-4">⬆ 品级需要调整（' + esc(curRar) + ' → ' + esc(sugRar) + '）</div>';
  	}
  	h += '</div>';

  	// Current vs suggested price
  	var curPri = result_gv.currentPrice || bi_gv.price || 0;
  	var sugPri = result_gv.suggestedPrice || 0;
  	h += '<div class="mb-10 p-8-12 bg-bg2 rad-6">';
  	h += '<div class="flex items-center justify-between mb-4">';
  	h += '<span class="fs-11 c-fg3">当前身价</span>';
  	h += '<span class="fs-14 fw-700 c-fg">' + Number(curPri).toLocaleString() + '</span>';
  	h += '</div>';
  	h += '<div class="flex items-center justify-between mb-4">';
  	h += '<span class="fs-11 c-fg3">建议身价</span>';
  	h += '<span class="fs-14 fw-700 c-accent2">' + Number(sugPri).toLocaleString() + '</span>';
  	h += '</div>';
  	if (sugPri !== curPri) {
  		var diff = sugPri > curPri ? '⬆ 提升' : '⬇ 降低';
  		h += '<div class="fs-10 c-accent2">' + diff + ' ' + Number(Math.abs(sugPri - curPri)).toLocaleString() + '</div>';
  	}
  	h += '</div>';

  	// Rarity reason
  	if (result_gv.rarityReason) {
  		h += '<div class="fs-11 c-fg p-8-10 bg-bg2 rad-6 mb-6">';
  		h += '<span class="fw-700">📋 品级评估：</span>' + esc(result_gv.rarityReason);
  		h += '</div>';
  	}

  	// Price reason
  	if (result_gv.priceReason) {
  		h += '<div class="fs-11 c-fg p-8-10 bg-bg2 rad-6 mb-6">';
  		h += '<span class="fw-700">💰 身价评估：</span>' + esc(result_gv.priceReason);
  		h += '</div>';
  	}

  	// Detail
  	if (result_gv.detail) {
  		h += '<div class="fs-11 c-fg3 p-8-10 bg-bg2 rad-6 mb-12">💬 ' + esc(result_gv.detail) + '</div>';
  	}

  	// Error fallback
  	if (result_gv._isGradeValueError) {
  		h += '<div class="fs-11 c-fg p-8-10 bg-bg2 rad-6 mb-12" style="border:1px solid var(--error)">';
  		h += '⚠️ ' + esc(result_gv.summary || 'LLM 调用失败');
  		h += '</div>';
  	}

  	// Buttons
  	h += '<div class="flex gap-8 bt-border pt-12">';
  	if (!审计状态.savedReport) {
  		h += '<button class="btn btn-primary flex-1" onclick="window.角色品级价值审计应用修复()">✅ 应用品级和价值修改</button>';
  	} else {
  		h += '<button class="btn btn-primary flex-1" onclick="window.角色审计重新审计()">🔄 重新审计</button>';
  	}
  	h += '<button class="btn btn-outline" onclick="window.角色审计搁置()">' + (审计状态.savedReport ? '✕ 关闭' : '📌 搁置') + '</button>';
  	h += '</div>';

  	// Manual modification
  	h += '<div class="mt-8 pt-8 bt-border text-center">';
  	h += '<button class="btn btn-outline fs-11 p-4-12" onclick="window.角色审计打开修改()">✏️ 提出修改要求（手动指定修改内容）</button>';
  	h += '</div>';
  } else if (审计状态.status === 'done' || 审计状态.status === 'viewing-saved') {
    var isViewingSaved = 审计状态.status === 'viewing-saved';
    var result = 审计状态.result;
    var bi = 审计状态.char && 审计状态.char.identity && 审计状态.char.identity.basicInfo || {};
    var name = bi.name || '未知角色';

    // 头部 + verdict
    var verdictColors = { '通过': 'var(--success)', '有疑点': 'var(--accent2)', '不通过': 'var(--error)' };
    var verdictIcons = { '通过': '✅', '有疑点': '⚠️', '不通过': '❌' };
    var vColor = verdictColors[result.verdict] || 'var(--fg3)';
    var vIcon = verdictIcons[result.verdict] || '🔍';
    h += '<div class="flex items-center justify-between mb-10">';
    h += '<div class="flex items-center gap-8">';
    h += '<span class="fs-18">' + vIcon + '</span>';
    h += '<span style="font-size:14px;font-weight:bold;color:' + vColor + '">' + esc(result.verdict || '审计完成') + '</span>';
    if (result.verdictReason) {
      h += '<span class="fs-11 c-fg3 fw-normal">— ' + esc(result.verdictReason) + '</span>';
    }
    h += '</div>';
    h += '<div class="cur-ptr fs-22 c-fg3 p-0-4" onclick="window.角色审计取消()">&times;</div>';
    h += '</div>';

    // 角色名 + 报告时间
    h += '<div class="fs-11 c-fg mb-8">📋 ' + esc(name) + '</div>';
    if (isViewingSaved && 审计状态.savedReport && 审计状态.savedReport.reportAt) {
      h += '<div class="fs-10 c-fg3 mb-6">🕐 ' + 格式化时间(审计状态.savedReport.reportAt) + '</div>';
    }

    // 总结
    if (result.summary) {
      h += '<div class="fs-12 c-fg p-8-10 bg-bg2 rad-6 mb-10">'
        + esc(result.summary) + '</div>';
    }

    // === 意图对齐区块 ===
    var iMatches = result.intentMatches || [];
    var iMisses = result.intentMisses || [];
    if (iMatches.length > 0 || iMisses.length > 0) {
      h += '<div class="mb-10">';
      h += '<div class="fs-11 fw-600 c-fg mb-4">🎯 用户意图对齐</div>';
      for (var mi = 0; mi < iMatches.length; mi++) {
        h += '<div style="font-size:11px;color:var(--success);padding:3px 8px;background:var(--success)11;border-radius:4px;margin-bottom:2px">✅ ' + esc(iMatches[mi]) + '</div>';
      }
      for (var mj = 0; mj < iMisses.length; mj++) {
        h += '<div style="font-size:11px;color:var(--error);padding:3px 8px;background:var(--error)11;border-radius:4px;margin-bottom:2px">❌ ' + esc(iMisses[mj]) + '</div>';
      }
      h += '</div>';
    }

    // === 叙事问题列表 ===
    var issues = result.narrativeIssues || [];
    if (issues.length > 0) {
      h += '<div class="fs-11 fw-600 c-fg mb-4">📌 叙事矛盾</div>';
      h += '<div style="max-height:240px;overflow-y:auto;margin-bottom:10px">';
      for (var ni = 0; ni < issues.length; ni++) {
        var iss = issues[ni];
        var tColor = ({'矛盾':'var(--error)','疑问':'var(--accent2)','欠缺':'var(--accent)'})[iss.type] || 'var(--fg3)';
        h += '<div style="padding:8px 10px;margin-bottom:5px;background:var(--bg2,#111);border-radius:6px;border-left:3px solid ' + tColor + '">';
        h += '<div class="flex gap-6 items-center mb-3">';
        h += '<span style="font-size:9px;font-weight:bold;color:' + tColor + '">' + esc(iss.type || '') + '</span>';
        if (iss.dimension) h += '<span class="fs-09 c-fg3">' + esc(iss.dimension) + '</span>';
        if (iss.location) h += '<span class="fs-09 c-accent2">' + esc(iss.location) + '</span>';
        h += '</div>';
        h += '<div class="fs-11 c-fg mb-2">' + esc(iss.detail || '') + '</div>';
        if (iss.suggestion) {
          h += '<div class="fs-10 c-accent2 fs-italic">💡 ' + esc(iss.suggestion) + '</div>';
        }
        h += '</div>';
      }
      h += '</div>';
    }

    // === 实用性建议 ===
    if (result.viability) {
      h += '<div class="fs-11 c-fg p-6-10 bg-bg2 rad-6 mb-10">';
      h += '💬 建议：' + esc(result.viability);
      h += '</div>';
    }

    // === 通过无问题时显示 ===
    if (issues.length === 0 && iMatches.length === 0 && iMisses.length === 0) {
      h += '<div class="text-center p-16 c-success fs-13">✅ 角色设定整体良好，未发现明显问题。</div>';
    }

    // === 操作按钮 ===
    h += '<div class="flex gap-8 bt-border pt-12">';
    if (isViewingSaved) {
      h += '<button class="btn btn-primary flex-1" onclick="window.角色审计重新审计()">🔄 重新审计</button>';
      h += '<button class="btn btn-outline flex-1" onclick="window.角色审计取消()">✕ 关闭</button>';
    } else {
      var hasFixable = result.suggestFix && (issues.length > 0 || iMisses.length > 0);
      if (hasFixable) {
        h += '<button class="btn btn-primary flex-1" onclick="window.角色审计应用修复()">🛠️ 进行整改</button>';
      }
      h += '<button class="btn btn-outline flex-1" onclick="window.角色审计搁置()">'
        + (issues.length > 0 || iMisses.length > 0 ? '📌 暂且搁置' : '✅ 确认关闭') + '</button>';
    }
    h += '</div>';

    // 手动修改要求
    h += '<div class="mt-8 pt-8 bt-border text-center">';
    h += '<button class="btn btn-outline fs-11 p-4-12" onclick="window.角色审计打开修改()">✏️ 提出修改要求（手动指定修改内容）</button>';
    h += '</div>';

    // 修复失败提示
    if (审计状态.fixError) {
      h += '<div style="margin-top:8px;padding:6px 10px;background:var(--error)11;border:1px solid var(--error)33;border-radius:4px;font-size:11px;color:var(--error)">';
      h += '⚠️ 修复失败: ' + esc(审计状态.fixError);
      h += '</div>';
    }
  }

  h += '</div>';
  overlay.innerHTML = h;
  overlay.style.display = 'flex';
}

// ===== 关闭覆盖层（保存后） =====

function 关闭审计覆盖层() {
  审计状态 = null;
  var overlay = document.getElementById('charAuditOverlay');
  if (overlay) {
    overlay.style.display = 'none';
    overlay.innerHTML = '';
  }
  var content = document.getElementById('characterContent');
  if (content) 渲染角色主面板(document.getElementById('characterContent'));
}
