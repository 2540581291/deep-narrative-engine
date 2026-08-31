// 深度-叙事引擎 · 核心提示词模板
// 全局函数（PROMPTS / registerPrompt / renderPrompt）已拆分到 子模块-全局函数/叶子模块-主面板/entry.js

// ===== 提示词模板 =====
registerPrompt('novel_title_suggest', {
  system: '你是一个情色小说标题生成专家。参考作品设定生成{count}个合适的小说标题。JSON输出：{"options":["标题1","标题2"]}。{wordLimit}{direction}',
  user: '小说设定：{context}\n\n参考以上设定，生成合适的标题选项。',
});

registerPrompt('novel_premise_suggest', {
  system: '你是一个情色小说构思专家。基于给定的标签生成{count}个合适的一句话设定。JSON输出：{"options":["设定1","设定2"]}。{wordLimit}{direction}',
  user: '题材标签：{tags}\n{direction}\n\n参考以上设定，生成合适的故事框架。',
});

registerPrompt('novel_outline', {
  system: '你是一个情色小说大纲规划专家。为小说生成{count}章大纲，严格遵守以下规则：\n不可逆操作集中在最后1/3章。\n每章有因果衔接，引子不占节点。\n输出格式：先输出引子，再输出正文章节，最后输出结局方向。\n输出严格JSON：{"chapters":[{"title":"引子","playTags":"—","link":"","content":"引子场景概述","node":"一"},{"title":"第01章·章名","playTags":"标签1·标签2·标签3","link":"≤40字因果过渡","content":"≥100字核心场景描述","node":"节点编号","wordTarget":2000,"eroticaLevel":"轻度/中度/重度"}],"ending":"结局方向一句话概括"}。不要输出其他文字。',
  user: '小说标题：{title}\n调教者：{domName}\n被调教者：{subName}\n题材：{tags}\n一句话设定：{premise}\n{direction}',
});

registerPrompt('novel_chapter', {
  system: '你是一个情色小说作家。参考以上完整设定写出章节正文，语言细腻、有感染力。遵循大纲中的节点和玩法规划。',
  user: '小说：{title}（{tags}）\n整体设定：{premise}\n\n【完整故事脉络】\n{allChaptersOverview}\n\n【当前章节】\n章节：{chapterTitle}\n本章概要：{summary}\n玩法：{playTags}\n情色强度：{eroticaLevel}\n出场角色：{characters}\n场景设置：{setting}\n目标字数：{wordTarget}\n衔接逻辑：{link}{characterGuidance}\n\n【前文提要】\n{previousSummary}\n\n【上一章正文最后部分】\n{previousChapterContent}\n\n请根据以上设定写出这一章。要求：1. 直接输出正文，不要输出书名、章节号、章节标题等任何标题性内容；2. 不要输出分析、说明或注释；3. 从第一段正文直接开始。',
});

registerPrompt('chapter_continue', {
  system: '你是一个情色小说作家。根据前文续写接下来的内容，严格保持风格一致，不要重复前文内容。',
  user: '小说：{title}\n当前内容：\n{context}\n\n请自然地续写，不要重复上文最后几句，直接推进情节或描写。',
});

registerPrompt('chapter_rewrite', {
  system: '你是一个情色小说润色专家。按照给定的方向对文本进行改写，保持核心情节不变。\n{direction}',
  user: '原文：\n{context}\n\n请改写。直接输出改写后的正文，不要说明改动。',
});

registerPrompt('chapter_expand', {
  system: '你是一个情色小说作家。对给定的内容进行扩写，增加细节描写和心理活动，保持风格一致。',
  user: '原文：\n{context}\n\n请扩写（现有字数：{wordCount}，目标字数：{targetCount}）。直接输出扩写后的正文，不要说明改动。',
});

registerPrompt('chapter_polish', {
  system: '你是一个文字编辑。对给定的文本进行润色：修正语病、优化表达、提升文采。不改变核心内容和风格。',
  user: '原文：\n{context}\n\n请润色。直接输出润色后的正文，不要说明改动。',
});

// ===== 世界观模块 =====
// 用于世界观「版块→子维度」的内容生成：附带世界名 + 该子维度 + 整个世界已有内容作为上下文。
// {section} 版块（世界设定/地理/...）；{dim} 子维度（基本设定/宇宙与法则/情色生态/...）；
// {existing} 该子维度已有条目；{context} 整个世界其余部分已有的内容（供参考避免冲突）；{direction} 用户方向。
registerPrompt('world_element', {
  system: '你是一个世界构建专家，为成人向创作软件构建世界观设定。根据给出的世界名、目标版块子维度、以及世界已有内容，生成该子维度下的条目。严格按 JSON 输出。',
  user: '世界名称：{worldName}\n目标版块：{section}\n目标子维度：{dim}\n\n本类别说明（该类别该写什么、以及不要混入其他类别）：\n{类约束}\n\n该子维度已有内容：{existing}\n\n这个世界其他部分已有的设定（供参考，保持一致性）：\n{context}\n\n用户方向要求：{direction}\n\n【任务】为该子维度生成**全新条目**。每条目包含「条目」「详细描述」字段（详细描述要具体、可被小说情节和生图 prompt 直接使用；色情向内容要贴合本世界的情色生态）。\n\n【重要约束·不要重复】**严禁生成与「该子维度已有内容」重复的条目**——请对照上面的「已有内容」逐条检查，新生成的条目名和内容**不得与任何已有条目相同或雷同**（条目标题同名、内容大量重叠、换皮重写均视为重复）。只创作**全新、彼此各异**的条目。\n\n【重要约束·不要带类别名】「目标子维度」（如「{dim}」）只是告诉你当前正在生成的是哪个类别，**绝不要**把这个类别名写进条目标题或条目内容里——不要出现「{dim}是什么」「某某{section}」「{dim}的某机构」这类把类别名揉进条目的写法；不要反复声明「这是一个{section}」「这是{section}势力」等。条目名只写该类下**具体势力/地点的自身名称**（如一个具体政权的名、一个具体门派的名），条目内容只描写它本身，不要带类别标签。\n\n【输出】只输出 JSON：{"items":[{"条目":"","详细描述":""}, ...]}，items 为数组，**条目数量见末尾【数量要求】为准**，每项一个条目，条目名简短、互相不重复，详细描述可数百字。不要输出其他文字。',
});

// ===== 世界观 · 提取文本并全部生成（从一段叙述逐段提取，每段生成一条完整条目）=====
registerPrompt('world_text_entry', {
  system: '你是世界观生成专家。根据用户提供的一段叙述文字，提炼出其中关于世界观的设定要点，生成一条结构化的世界观条目。只输出 JSON。',
  user: '正在为世界「{worldName}」的「{section}·{dim}」生成条目。\n\n本类别说明：\n{类约束}\n\n【输入段落】\n{paragraph}\n\n【任务】从这段叙述中提炼世界观设定，生成一条【完整】条目：\n- 条目名简短贴切、能概括该段核心设定，不得写进类别名\n- 「详细描述」把这一段里关于世界观的设定信息写全、写具体、可独立成段，贴合本世界的情色生态；这是一段独立的完整表述，不是提纲\n\n【输出】只输出 JSON：{"条目":"","详细描述":""}，不要其他文字。',
});

// ===== 情色场景 =====
registerPrompt('erotica_scene', {
  system: '你是一个情色文学作家。根据给定的角色和场景生成情色场景描写。注重氛围、感官细节和情绪递进。直接输出场景正文。',
  user: '角色：{characters}\n氛围：{mood}\n场景设置：{setting}\n类型：{type}\n强度等级：{intensity}\n特殊要求：{direction}\n\n请写出这个场景：',
});

// ===== 通用字段建议 =====
registerPrompt('design_field_suggest', {
  system: '你是一个创作专家。生成{count}个简洁的建议，必须严格按照 JSON 格式输出：{"options":["建议1","建议2"]}。{wordLimit}',
  user: '当前概要：{context}\n字段：{field}\n{direction}',
});

registerPrompt('booksTitle_suggest', {
  system: '你是一个春宫学术出版标题专家。为教材/学术著作设计兼具学术正式感和情色直白性的标题。',
  user: '{context}\n\n【生成要求】\n请为以上{field}生成{count}个选项。{direction}\n\n请严格按照 JSON 格式输出，只输出 JSON，不要任何解释。\n输出格式：{"options":["标题1","标题2","标题3","标题4","标题5"]}',
});

registerPrompt('writer_gen', {
  system: '你是一个情色作家档案生成专家。根据方向和要求生成完整的作家档案。',
  user: '{context}\n\n【生成要求】\n请生成一位情色小说作家，JSON 格式包含以下字段：\n- name：姓名\n- bio：简介（生平经历和写作背景）\n- style：写作风格描述\n- preferredGender：擅长写的题材性别取向（不限/男性/女性/扶她/伪娘）\n- favoritePlays：玩法数组\n- fetishes：性癖数组\n\n请严格按照 JSON 格式输出，只输出 JSON，不要任何解释。\n输出格式：{"name":"","bio":"","style":"","preferredGender":"不限","favoritePlays":[],"fetishes":[]}',
});

registerPrompt('suggest_title', {
  system: '你是一个情色小说标题专家。根据设定生成{count}个作品标题。标题需包含情色元素和题材暗示，直白但不低俗。JSON输出：{"options":["标题1","标题2"]}。{wordLimit}{direction}',
  user: '{context}\n\n生成情色小说标题。{direction}',
});

registerPrompt('suggest_genre', {
  system: '你是一个标签推荐专家。根据作品设定推荐{count}个合适的标签。JSON输出：{"options":["标签1","标签2"]}。{wordLimit}{direction}',
  user: '{context}\n\n推荐题材/玩法标签。{direction}',
});

registerPrompt('suggest_premise', {
  system: '你是一个故事构思专家。根据设定生成{count}个故事概述。JSON输出：{"options":["概述1","概述2"]}。{wordLimit}{direction}',
  user: '{context}\n\n生成一句话故事设定。{direction}',
});

registerPrompt('suggest_ending', {
  system: '你是一个故事构思专家。根据设定生成{count}个结局方向。JSON输出：{"options":["结局1","结局2"]}。{wordLimit}{direction}',
  user: '{context}\n\n根据作品设定和已有大纲，生成合理的结局方向。{direction}',
});

registerPrompt('suggest_personality', {
  system: '你是一个角色创作专家。生成{count}个角色性格描述。JSON输出：{"options":["描述1","描述2"]}。{wordLimit}{direction}',
  user: '{context}\n\n生成角色性格。{direction}',
});

registerPrompt('suggest_speech', {
  system: '你是一个角色创作专家。生成{count}个语音风格描述。JSON输出：{"options":["风格1","风格2"]}。{wordLimit}{direction}',
  user: '{context}\n\n生成角色语言风格。{direction}',
});

registerPrompt('suggest_fetish', {
  system: '你是一个性癖设计专家。生成{count}个性癖描述。JSON输出：{"options":["性癖1","性癖2"]}。{wordLimit}{direction}',
  user: '{context}\n\n生成角色性癖。{direction}',
});

registerPrompt('suggest_chapter_title', {
  system: '你是一个小说章节命名专家。根据大纲数据生成{count}个章节标题。JSON输出：{"options":["标题1","标题2"]}。{wordLimit}{direction}',
  user: '{context}\n\n生成章节标题。{direction}',
});

registerPrompt('suggest_chapter_play', {
  system: '你是一个玩法标签推荐专家。根据章节内容生成{count}个玩法标签建议。JSON输出：{"options":["标签1","标签2"]}。{wordLimit}{direction}',
  user: '{context}\n\n推荐本章玩法标签。{direction}',
});

registerPrompt('suggest_chapter_link', {
  system: '你是一个小说衔接逻辑专家。根据前文生成{count}种因果衔接思路。JSON输出：{"options":["思路1","思路2"]}。{wordLimit}{direction}',
  user: '{context}\n\n设计本章因果衔接。{direction}',
});

registerPrompt('suggest_chapter_content', {
  system: '你是一个场景描写专家。根据大纲生成{count}个场景描写方向。JSON输出：{"options":["方向1","方向2"]}。{wordLimit}{direction}',
  user: '{context}\n\n生成核心场景方向。{direction}',
});

registerPrompt('suggest_chapter_char', {
  system: '你是一个角色出场规划专家。根据章节内容推荐{count}组角色出场方案。JSON输出：{"options":["方案1","方案2"]}。{wordLimit}{direction}',
  user: '{context}\n\n推荐本章出场角色。{direction}',
});

registerPrompt('suggest_chapter_setting', {
  system: '你是一个场景设计专家。根据章节内容推荐{count}个场景地点。JSON输出：{"options":["地点1","地点2"]}。{wordLimit}{direction}',
  user: '{context}\n\n推荐本章场景地点。{direction}',
});

registerPrompt('brainstorm', {
  system: '你是一个创意构思专家。以下是头脑风暴需求，给出有创意的建议。',
  user: '主题：{topic}\n限制条件：{constraints}\n{direction}',
});

registerPrompt('gen_overview', {
  system: '你是一个角色定制专家，擅长根据作品设定生成结构完整的角色档案。你只输出合法 JSON，不要任何其他文字。',
  user: '{ctx}\n\n【任务】根据作品的方向设定，为其中的调教者（doms）和被调教者（subs）全新设计角色概要。所有字段包括名字都要重新生成，不要保留任何已有内容。\n\n每个角色的概要必须包含以下结构：\n- identity.basicInfo：名称、称号/头衔、年龄、种族、性别、稀有度、身价\n- identity.background：出身地、出生身份、家族背景、成长环境、教育程度、技能、天赋、气质\n- identity.experience：当前职业、人生时间线、人生故事概述、当下日常、性启蒙、日常性事、性爱明细\n\n===== 角色概要模板结构（严格参照此结构，不要增减字段） =====\n{\n  "identity": {\n    "basicInfo": { "name": "角色名", "title": "称号/头衔", "age": 25, "race": "人族", "gender": "男性/女性/扶她/伪娘", "rarity": "蓝", "price": 0 },\n    "background": { "origin": "出身地", "birthStatus": "平民", "family": "家族背景", "upbringing": "成长环境", "education": "教育程度", "skills": ["技能1", "技能2"], "talents": ["天赋1"], "aura": "气质印象一句话" },\n    "experience": { "currentOccupation": "当前职业", "timeline": "人生时间线", "lifeOverview": "角色人生故事，不少于100字", "dailyLife": "当下日常，不少于50字", "sexualAwakening": "性的启蒙，不少于50字", "dailySexuality": "日常性事，不少于50字", "sexualDetails": ["1. 时间事件描述", "2. 时间事件描述"] }\n  }\n}\n\n【要求】\n1. 必须包含 doms（调教者）和 subs（被调教者）两个数组\n2. 每个角色按上述模板结构填充，字段值请合理填充，保持角色设定一致性\n3. 角色名（name）要符合现实命名习惯，用常见的中文人名（如林雨桐、张伟、陈雪琳），不要用中二代号、英文名\n4. 称号（title）要有特色，贴合角色设定\n5. lifeOverview 不少于 100 字，要有完整叙事\n6. 时间线（timeline）的计数标准以角色岁数为准，标注"X岁"等里程碑节点\n7. dailyLife、sexualAwakening、dailySexuality 各不少于 50 字；sexualDetails 按时间顺序1234编号列出性爱相关事件\n8. skills 和 talents 尽量多列几项\n9. 价格 price 按以下公式估算：身价 = int(10000 × 年龄系数 × 容貌系数 × 种族系数 × 健康系数 × 身材系数 × 性格系数) + 技能数 × 500\n   年龄系数：6-9岁5.0 / 10-14岁3.0 / 15-18岁2.0 / 19-25岁1.0 / 26-35岁0.6 / 36岁以上0.3\n   种族系数：人族1.0 / 异族2.0\n   默认按容貌50、非处、健康、匀称身材、普通性格计算\n10. 稀有度（rarity）按价格判断：白≤10万 / 绿10-20万 / 蓝20-50万 / 紫50-100万 / 金≥100万\n11. gender 字段必须使用以下四个值之一： "男性"、"女性"、"扶她"、"伪娘"，不得使用其他值\n\n输出 JSON 格式：{"doms":[{"identity":{"basicInfo":{...},"background":{...},"experience":{...}}}],"subs":[]}',
});

registerPrompt('ov_char_single', {
  system: '你是一个角色定制专家，擅长根据作品设定生成结构完整的角色档案。你只输出合法 JSON，不要任何其他文字。',
  user: '{ctx}\n\n【生成目标】本次仅生成一个角色，身份为：{targetRole}\n\n【任务】根据作品设定方向，为当前角色生成完整的概要数据（仅 identity.basicInfo、identity.background、identity.experience）。\n\n⚠️ 注意：上下文中列出的其他角色（"其他调教者"/"其他被调教者"）是已经存在的角色，本次不要生成他们，也不要生成同名角色。\n\n已有角色信息（作为参考，仅保留需要的字段，其他由你补充完善）：\n{charJson}\n\n每个角色的概要必须包含以下结构：\n- identity.basicInfo：名称、称号/头衔、年龄、种族、性别、稀有度、身价\n- identity.background：出身地、出生身份、家族背景、成长环境、教育程度、技能、天赋、气质\n- identity.experience：当前职业、人生时间线、人生故事概述、当下日常、性启蒙、日常性事、性爱明细\n\n===== 角色概要模板结构（严格参照此结构，不要增减字段） =====\n{\n  "identity": {\n    "basicInfo": { "name": "角色名", "title": "称号/头衔", "age": 25, "race": "人族", "gender": "男性/女性/扶她/伪娘", "rarity": "蓝", "price": 0 },\n    "background": { "origin": "出身地", "birthStatus": "平民", "family": "家族背景", "upbringing": "成长环境", "education": "教育程度", "skills": ["技能1", "技能2"], "talents": ["天赋1"], "aura": "气质印象一句话" },\n    "experience": { "currentOccupation": "当前职业", "timeline": "人生时间线", "lifeOverview": "角色人生故事，不少于100字", "dailyLife": "当下日常，不少于50字", "sexualAwakening": "性的启蒙，不少于50字", "dailySexuality": "日常性事，不少于50字", "sexualDetails": ["1. 时间事件描述", "2. 时间事件描述"] }\n  }\n}\n\n【要求】\n1. 仅输出一个角色的 identity 对象，不要 doms/subs 数组\n2. 已有角色信息的字段内容（name、gender、race 等）必须原样保留，不得修改。如果 name 为空则 AI 可以生成新名称，否则必须使用原名\n3. gender 字段必须严格保留已有值（可选的 gender 值只有四个："男性"、"女性"、"扶她"、"伪娘"），不得根据故事设定推断或更改性别\n4. 称号（title）要有特色，贴合角色设定\n5. lifeOverview 不少于 100 字，要有完整叙事\n6. dailyLife、sexualAwakening、dailySexuality 各不少于 50 字；sexualDetails 按时间顺序1234编号列出性爱相关事件\n7. skills 和 talents 尽量多列几项\n8. 价格 price 按以下公式估算：身价 = int(10000 × 年龄系数 × 容貌系数 × 种族系数 × 健康系数 × 身材系数 × 性格系数) + 技能数 × 500\n   年龄系数：6-9岁5.0 / 10-14岁3.0 / 15-18岁2.0 / 19-25岁1.0 / 26-35岁0.6 / 36岁以上0.3\n   种族系数：人族1.0 / 异族2.0\n   默认按容貌50、非处、健康、匀称身材、普通性格计算\n9. 稀有度（rarity）按价格判断：白≤10万 / 绿10-20万 / 蓝20-50万 / 紫50-100万 / 金≥100万\n🔴 关键：本次只生成一个角色（{targetRole}），不要生成上下文中已列出的其他角色，不要生成同名角色\n\n输出 JSON 格式：{"identity":{"basicInfo":{...},"background":{...},"experience":{...}}}',
});

registerPrompt('gen_story', {
  system: '',
  user: '{ctx}\n\n【任务】根据完整设定生成故事设定——题材、玩法、故事概述、结局方向、章节数量。注意题材和玩法不要偏离已有设定太远，但也不要照抄。\n{chapterHint}\n输出JSON：{"genreTags":["题材1","题材2","题材3"],"playTags":["玩法1","玩法2","玩法3","玩法4"],"premise":"完整的核心故事梗概，包含冲突感和情色元素","ending":"结局方向","chapterCount":10}\npremise（故事概述）至少200字。每个数组至少2项。',
});

registerPrompt('gen_story_vignette', {
  system: '',
  user: '{ctx}\n\n【任务】根据完整设定生成故事设定——题材、玩法、故事概述、结局方向、章节数量。注意题材和玩法不要偏离已有设定太远，但也不要照抄。\n{chapterHint}\n输出JSON：{"genreTags":["题材1","题材2","题材3"],"playTags":["玩法1","玩法2","玩法3","玩法4"],"premise":"完整的核心故事梗概，包含冲突感和情色元素","ending":"结局方向","chapterCount":3}\npremise（故事概述）至少200字。每个数组至少2项。',
});

registerPrompt('gen_quick_outline', {
  system: '',
  user: '{ctx}\n\n【任务】根据以上作品数据，重新生成大纲章节。输出纯 JSON，只输出 chapters 数组：\n"chapters": 章节数组\n\n每个 chapter 包含：\n  title：章节标题，不含"第X章"前缀\n  playTags：玩法，空格分隔如"束缚 羞辱 调教"\n  link：衔接，≤40字\n  content：内容，≥100字\n  setting：场景\n  wordTarget：字数，默认4000\n  eroticaLevel：强度，"轻度"/"中度"/"重度"\n  highlight：是否重点（true/false，不超过总章节数10%，向上取整）\n  characters：出场角色名数组\n\n注意：只输出 chapters 字段。结局方向和角色数据已在上下文中提供，不需要输出。',
});

registerPrompt('gen_notes', {
  system: '你是一个情色小说编辑。参考完整作品设定生成创作方向性备注。',
  user: '{ctx}\n\n【任务】根据完整设定生成写作备注。备注是创作方向性要求，如"注意角色心理描写"、"保持悬念"。3-5条。\n输出JSON格式：{"writingNotes":["备注1","备注2","备注3"]}\n备注应基于完整作品设定，不要与已有备注重复。',
});

registerPrompt('gen_refs', {
  system: '你是一个情色文学推荐专家。参考完整作品设定推荐合适的参考作品。',
  user: '{ctx}\n\n【任务】根据以上完整设定，推荐风格或题材相似的情色文学作品作为参考。\n输出JSON格式：{"references":[{"title":"作品名","tags":"重叠标签","note":"简述"}]} 推荐3-5部，不要与已有参考重复。',
});

registerPrompt('char_import', {
  system: '你是一个角色数据解析专家。将自由文本中的角色信息提取为结构化JSON数据。',
  user: '请将以下角色描述文本解析为结构化的角色数据。如果描述中包含多个角色，输出数组。\n文本内容：\n{text}\n\n输出JSON，角色对象包含 name/age/gender/role/identity/personality/appearance/background/tags 等字段。参考模板结构：{"name":"","age":0,"gender":"","role":"","identity":"","personality":"","appearance":"","outfit":"","background":"","speechStyle":"","kinks":"","sellingPoint":"","tags":[]}\n如果文本中有多个角色请输出数组 []，单个角色直接输出对象 {}。尽可能提取信息，无法确定的字段留空。',
});

registerPrompt('char_recommend', {
  system: '你是一个角色推荐专家。根据用户需求从已有角色库匹配角色，输出JSON。',
  user: '我有一个角色需求：{input}\n\n以下是我的角色库中的全部角色列表：\n{charList}\n\n请根据需求从列表中匹配角色，输出JSON：\n{"bestMatch":{"name":"最接近的角色名","reason":"原因"},"closeMatches":[{"name":"相对接近的角色名","reason":"原因"}],"oppositeMatches":[{"name":"截然相反的角色名","reason":"原因"}]}\n尽量匹配5个close和5个opposite，不够就按实际数量。',
});

registerPrompt('ol_chapter_rewrite', {
  system: '你是一个小说大纲编辑。根据当前章节数据重新生成章节信息。',
  user: '当前章节数据：\n{chData}\n\n{direction}',
});

registerPrompt('inspiration_generate', {
  system: '你是一个情色灵感生成器。生成富有画面感和情色张力的灵感文字。',
  user: '{direction}\n\n输出一段灵感文字，50-150字。',
});

registerPrompt('inspiration_classify', {
  system: '',
  user: '{content}\n\n用一到两个词概括以上灵感内容的基调。',
});

registerPrompt('inspiration_polish', {
  system: '',
  user: '保留核心意象，用精炼而淫秽色情的语言扩写以下灵感，输出 3-5 句。\n\n{content}',
});

// ===== 生活纪实 · 日常分析 =====
registerPrompt('life_doc_analyze', {
  system: '你是一个生活模拟分析师。你根据角色的完整角色卡 JSON 数据（包含 identity/bio 等全部字段）分析其三种不同类型日的典型活动安排，输出结构化 JSON。',
  user: '以下是角色的完整角色卡 JSON 数据，包含身份信息、背景、性格、日常、性偏好等全部字段：\n\n{charData}\n\n请基于以上完整角色数据，为这个角色分析三种不同类型的典型一日行程安排。\n\n请分别输出三种天的典型行程，每种天拆分为 {segCount} 个时段：\n1. workday（工作日）：上班/上学日的典型行程\n2. restday（休息日）：周末/假期的典型行程\n3. sexday（性爱日）：以性爱为核心主题的一天，包含调情、前戏、性交、温存等环节\n\n请以如下 JSON 格式输出（只输出 JSON，不要其他文字）：\n{\n  "workday": [\n    { "timeLabel": "通勤路上", "timeRange": "7:30-8:30", "plays": "无", "narrative": "早高峰的地铁车厢里人贴着人……", "location": "地铁" }\n  ],\n  "restday": [ ... ],\n  "sexday": [ ... ]\n}\n\n字段要求：\n- timeLabel：用实实在在的活动名称，不要"早晨""上午""下午"这类笼统的时段标签\n- plays：使用的玩法/道具，没有则填"无"，多个用、隔开（如"跳蛋、束缚、眼罩"）\n- narrative：这个时间段里发生的事情，**100-200字**\n- location：典型地点\n\n请根据角色的完整档案合理安排每种天的行程，三种天要有明显区分。\n⚠️ 重要：所有时段的时间范围必须首尾相接、严丝合缝，中间不能有任何时间跳跃或空白。前一个时段的结束时间必须是后一个时段的开始时间，完整覆盖从起床到入睡的整个一天。',
});

registerPrompt('life_doc_analyze_single', {
  system: '你是一个生活模拟分析师。根据角色的角色卡 JSON 数据，为其分析某一特定天类型的典型行程安排，输出时段数组 JSON。',
  user: '以下是角色的完整角色卡 JSON 数据：\n\n{charData}\n\n请为此角色生成「{dayTypeLabel}」的典型一日行程安排。{dayTypeHint}\n\n拆分为 {segCount} 个时段，以如下 JSON 数组格式输出（只输出 JSON，不要其他文字）：\n[\n  { "timeLabel": "通勤路上", "timeRange": "7:30-8:30", "plays": "无", "narrative": "……", "location": "地铁" }\n]\n\n字段要求：\n- timeLabel：用实实在在的活动名称，不要"早晨""上午""下午"这类笼统标签\n- plays：使用的玩法/道具，没有则填"无"，多个用、隔开（如"跳蛋、束缚、眼罩"）\n- narrative：这个时间段里发生的事情，**100-200字**\n- location：典型地点\n\n请根据角色的完整档案合理安排行程。\n⚠️ 重要：所有时段的时间范围必须首尾相接、严丝合缝，中间不能有任何时间跳跃或空白。前一个时段的结束时间必须是后一个时段的开始时间，完整覆盖从起床到入睡的整个一天。',
});

registerPrompt('life_doc_activity_describe', {
  system: '你是一个生活纪实活动策划师。根据角色数据和活动关键词，生成一个结构化的活动段数据。输出合法 JSON，不要其他文字。',
  user: '以下是角色的完整角色卡 JSON 数据：\n\n{charData}\n\n自定义活动描述：{activityPrompt}\n\n请根据以上角色数据，为这个角色生成一个关于该活动的活动段。这个活动段是一个独立的日程片段，包含该活动的完整场景描述。\n\n输出 JSON 格式：\n{\n  "title": "简短标题",\n  "timeLabel": "实实在在的活动名称",\n  "timeRange": "6:00-7:30",\n  "plays": "晨跑、拉伸",\n  "narrative": "这个时间段里发生的事情，100-200字",\n  "location": "地点"\n}\n\n确保 title 简洁准确反映玩法道具。',
});

registerPrompt('life_doc_custom_day', {
  system: '你是一个生活模拟分析师。根据角色数据和自定义活动描述，生成一整天与该活动相关的行程安排。输出合法 JSON，不要其他文字。',
  user: '以下是角色的完整角色卡 JSON 数据：\n\n{charData}\n\n自定义活动描述：{activityPrompt}\n\n请根据以上角色数据和自定义活动描述，为此角色生成一整天的行程安排——这一天的所有活动都围绕该自定义活动主题展开。拆分为 {segCount} 个时段。\n\n输出 JSON 格式：\n{\n  "title": "这一天名称",\n  "description": "一句话概括",\n  "segments": [\n    { "timeLabel": "实实在在的活动名称", "timeRange": "6:00-8:00", "plays": "玩法道具", "narrative": "这个时间段里发生的事情", "location": "地点" }\n  ]\n}\n\n字段要求：\n- timeLabel：用实实在在的活动名称，不要"早晨""上午"这类笼统标签\n- narrative：这个时间段里发生的事情，100-200字\n- 所有时段时间范围首尾相接、严丝合缝\n\n确保行程与自定义活动主题紧密相关。',
});


// ===== 新闻媒体 · 节目/期号 =====
registerPrompt('news_program_name', {
  system: '',
  user: '你是一个媒体策划专家。根据以下节目完整信息生成{count}个合适的节目名称。JSON输出：{"options":["名称1","名称2"]}。{wordLimit}{direction}\n\n{context}\n\n基于以上全部信息，生成合适的节目名称选项。',
});

registerPrompt('news_program_focus', {
  system: '',
  user: '你是一个媒体策划专家。根据以下节目完整信息生成{count}个合适的节目定位/关注方向。JSON输出：{"options":["方向1","方向2"]}。{wordLimit}{direction}\n\n{context}\n\n基于以上全部信息，生成合适的节目定位和关注方向选项。',
});

registerPrompt('news_program_desc', {
  system: '',
  user: '你是一个媒体策划专家。根据节目所有信息撰写节目简介，聚焦于节目的主题内容和题材方向。\n\n{context}\n\n请为这个节目撰写一段简介，说明本节目聚焦什么题材、什么主题方向、关注哪类故事和人物。不要涉及栏目结构或板块安排，只需说明节目的话题领域和内容取向。直接输出简介正文，不要标题。',
});

registerPrompt('news_program_gen_all', {
  system: '',
  user: '你是一个媒体策划专家。根据已有信息补全节目的剩余字段。\n已有信息中某些字段可能为空，你需要生成合适的值来补齐。\n\n{context}\n\n请根据以上已有信息，补全为空的字段并整体输出完整的JSON。\n\n输出严格 JSON 格式：{"name":"节目名称","focus":"节目定位/关注方向","description":"节目简介"}。\n- name：节目名称，2-8个字，有特色好记\n- focus：节目定位/关注方向，一句话概括\n- description：节目简介，100-200字，聚焦节目的主题题材方向和内容取向，不涉及栏目结构或板块安排',
});

registerPrompt('news_episode_focus', {
  system: '',
  user: '你是一个媒体策划专家。根据节目完整信息生成{count}个本期节目可以关注的具体方向。JSON输出：{"options":["方向1","方向2"]}。{wordLimit}{direction}\n\n{context}\n\n基于以上全部信息，生成适合该节目某一期具体关注的方向选项。',
});

// ===== 新闻媒体 · 期号规划 =====
registerPrompt('news_episode_plan', {
  system: '',
  user: '你是一个媒体策划专家。根据节目完整信息，为**新一期**制定完整的期号规划。\n\n{context}\n\n⚠️ 注意：这是新的一期，已有期号的内容仅供参考，请不要重复已有期号的标题、方向和情节。每期必须有不同的主题和看点。特别注意上一期的结尾中如果提到了「下一期预告」或伏笔，新一期的内容应当与之衔接，不要跳过或忽略。\n\n请根据以上信息，生成该新期的完整规划。\n\n输出严格 JSON 格式：{"headline":"本期头条标题","epFocus":"本期关注方向","plot":"本期大致情节概述"}。\n- headline：本期头条标题（6-20字，吸引眼球，体现本期核心话题，不能与已有期号的标题相同）\n- epFocus：本期关注方向（50-100字，说明本期的侧重点和内容倾向，需与前几期有区分度）\n- plot：本期大致情节概述（至少100字，无上限，围绕该节目类型的栏目结构按环节描述本期独特的剧情走向、看点、矛盾和张力），如果有本期新增或缺席的人员变化，在情节中自然提及缺席原因或新面孔出场方式，让人员变动融入叙事',
});
