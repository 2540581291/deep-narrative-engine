// 深度-叙事引擎 · 角色卡 · 📖 小说提取 · 针对性提取
// 弹窗 + 方向选择 + 执行
// 支持两种模式：Tab 1 关键词搜索 / Tab 2 AI 智能分析

// ===== 针对性提取：打开弹窗（双 tab） =====

window.小说提取打开针对性提取 = function() {
  var text = 小说提取原始文本 || '';
  if (!text || text.length < 50) {
    var ta = document.getElementById('novelPasteArea');
    text = ta ? ta.value.trim() : '';
  }
  if (!text || text.length < 50) { toast('请先上传或粘贴小说文本'); return; }
  小说提取原始文本 = text;

  if (document.getElementById('targetedExtractOverlay')) return;
  var ov = document.createElement('div');
  ov.id = 'targetedExtractOverlay';
  ov.className = 'ovl';
  ov.innerHTML =
    '<div class="mcard" style="max-width:580px;width:90%">' +
    '<div style="font-size:15px;font-weight:600;margin-bottom:4px">🎯 针对性角色提取</div>' +
    '<div style="font-size:11px;color:var(--fg2);margin-bottom:12px">通过关键词搜索或 AI 分析定位原文相关段落并提取角色</div>' +

    // === 性别筛选（共享，两个 tab 通用） ===
    '<div style="font-size:11px;font-weight:500;margin-bottom:5px;color:var(--fg)">性别筛选（点击切换，可多选，不选则提取全部）</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px" id="targetedGenderSelector">' +
    '<span class="gender-chip" data-gender="female" onclick="window.小说提取切换提取性别(this)" style="cursor:pointer;font-size:10px;padding:2px 10px;border-radius:4px;border:1px solid var(--border);color:var(--fg3);user-select:none">👩 女性</span>' +
    '<span class="gender-chip" data-gender="male" onclick="window.小说提取切换提取性别(this)" style="cursor:pointer;font-size:10px;padding:2px 10px;border-radius:4px;border:1px solid var(--border);color:var(--fg3);user-select:none">👨 男性</span>' +
    '<span class="gender-chip" data-gender="femboy" onclick="window.小说提取切换提取性别(this)" style="cursor:pointer;font-size:10px;padding:2px 10px;border-radius:4px;border:1px solid var(--border);color:var(--fg3);user-select:none">⚧ 伪娘</span>' +
    '<span class="gender-chip" data-gender="futa" onclick="window.小说提取切换提取性别(this)" style="cursor:pointer;font-size:10px;padding:2px 10px;border-radius:4px;border:1px solid var(--border);color:var(--fg3);user-select:none">🔮 扶她</span>' +
    '<span class="gender-chip" data-gender="beast" onclick="window.小说提取切换提取性别(this)" style="cursor:pointer;font-size:10px;padding:2px 10px;border-radius:4px;border:1px solid var(--border);color:var(--fg3);user-select:none">👾 异种</span>' +
    '</div>' +

    // === Tab 栏 ===
    '<div style="display:flex;gap:0;border-bottom:1px solid var(--border);margin-bottom:12px">' +
    '<div id="ttab_keyword" onclick="window.小说提取切换提取Tab(\'keyword\')" style="padding:6px 16px;font-size:12px;cursor:pointer;border-bottom:2px solid var(--accent);color:var(--fg);font-weight:600">🔑 关键词搜索</div>' +
    '<div id="ttab_ai" onclick="window.小说提取切换提取Tab(\'ai\')" style="padding:6px 16px;font-size:12px;cursor:pointer;border-bottom:2px solid transparent;color:var(--fg3);font-weight:400">🤖 AI 智能分析</div>' +
    '</div>' +

    // === Tab 1: 关键词搜索 ===
    '<div id="tabpane_keyword">' +
    '<div style="font-size:11px;font-weight:500;margin-bottom:6px;color:var(--fg)">快捷搜索</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px" id="targetedChips">' +
    '<span class="tag-chip" onclick="window.小说提取填入方向(this,\'她\')" style="cursor:pointer;font-size:10px">👩 女性角色</span>' +
    '<span class="tag-chip" onclick="window.小说提取填入方向(this,\'他\')" style="cursor:pointer;font-size:10px">👨 男性角色</span>' +
    '<span class="tag-chip" onclick="window.小说提取填入方向(this,\'反派\')" style="cursor:pointer;font-size:10px">😈 反派角色</span>' +
    '<span class="tag-chip" onclick="window.小说提取填入方向(this,\'主角\')" style="cursor:pointer;font-size:10px">⭐ 主角/主配</span>' +
    '<span class="tag-chip" onclick="window.小说提取填入方向(this,\'家族\')" style="cursor:pointer;font-size:10px">🏰 家族人物</span>' +
    '<span class="tag-chip" onclick="window.小说提取填入方向(this,\'爱\')" style="cursor:pointer;font-size:10px">🔞 亲密关系</span>' +
    '</div>' +
    '<div style="font-size:11px;font-weight:500;margin-bottom:6px;color:var(--fg)">关键词</div>' +
    '<textarea id="targetedDirectionInput" class="llm-input" rows="2" style="width:100%;font-size:12px;resize:vertical;font-family:inherit" placeholder="输入关键词，如：唐舞桐、女性、学院、家族、反派……"></textarea>' +
    '<div style="font-size:10px;color:var(--fg3);margin-top:4px">💡 将在全文中搜索该关键词，取前 50 处匹配段落交给 AI 提取角色。</div>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">' +
    '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>' +
    '<button class="btn-main" onclick="window.小说提取确认针对性提取()">🔍 搜索提取</button>' +
    '</div>' +
    '</div>' +

    // === Tab 2: AI 智能分析 ===
    '<div id="tabpane_ai" style="display:none">' +
    '<div style="font-size:11px;font-weight:500;margin-bottom:6px;color:var(--fg)">快捷描述</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px">' +
    '<span class="tag-chip" onclick="window.小说提取填入AI描述(this,\'提取所有女性角色\')" style="cursor:pointer;font-size:10px">👩 女性</span>' +
    '<span class="tag-chip" onclick="window.小说提取填入AI描述(this,\'提取所有男性角色\')" style="cursor:pointer;font-size:10px">👨 男性</span>' +
    '<span class="tag-chip" onclick="window.小说提取填入AI描述(this,\'提取所有伪娘角色\')" style="cursor:pointer;font-size:10px">⚧ 伪娘</span>' +
    '<span class="tag-chip" onclick="window.小说提取填入AI描述(this,\'提取所有扶她角色\')" style="cursor:pointer;font-size:10px">🔮 扶她</span>' +
    '<span class="tag-chip" onclick="window.小说提取填入AI描述(this,\'提取所有非人生物、怪物、野兽、动物等异种角色\')" style="cursor:pointer;font-size:10px">👾 异种</span>' +
    '</div>' +
    '<div style="font-size:11px;font-weight:500;margin-bottom:6px;color:var(--fg)">描述你想要提取的角色类型</div>' +
    '<textarea id="aiDirectionInput" class="llm-input" rows="3" style="width:100%;font-size:12px;resize:vertical;font-family:inherit" placeholder="例如：文中的非人生物、怪物、野兽&#10;例如：主角的家人、亲属和重要关系人&#10;例如：所有女性角色、尤其是外貌描写多的"></textarea>' +
    '<div style="font-size:10px;color:var(--fg3);margin-top:4px;margin-bottom:10px">💡 AI 先分析原文第一段（约 12 万字），根据你的描述决定搜索关键词。</div>' +

    // 关键词输入区（常驻）
    '<div style="padding-top:10px;border-top:1px solid var(--border)">' +
    '<div style="font-size:11px;font-weight:500;margin-bottom:6px;color:var(--fg)">AI 建议搜索的关键词（可编辑修改，点「AI 分析」自动生成）</div>' +
    '<textarea id="aiKeywordsInput" class="llm-input" rows="2" style="width:100%;font-size:12px;resize:vertical;font-family:inherit" placeholder="AI 分析出的关键词将显示在这里，你也可以手动输入……"></textarea>' +
    '<div style="font-size:10px;color:var(--fg3);margin-top:4px;margin-bottom:10px">💡 将在全文中搜索这些关键词，取匹配段落交给 AI 提取角色。</div>' +
    '</div>' +

    '<div style="display:flex;gap:8px;justify-content:flex-end">' +
    '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>' +
    '<button class="btn-out" id="aiAnalyzeBtn" onclick="window.小说提取AI决定关键词()">🤖 AI 分析关键词</button>' +
    '<button class="btn-main" onclick="window.小说提取确认AI提取()">🔍 开始提取</button>' +
    '</div>' +
    '</div>' +

    '</div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
};

// ===== Tab 切换 =====
window.小说提取切换提取Tab = function(tab) {
  ['keyword','ai'].forEach(function(t) {
    var pane = document.getElementById('tabpane_' + t);
    var tabEl = document.getElementById('ttab_' + t);
    if (t === tab) {
      pane.style.display = '';
      tabEl.style.borderBottomColor = 'var(--accent)';
      tabEl.style.color = 'var(--fg)';
      tabEl.style.fontWeight = '600';
    } else {
      pane.style.display = 'none';
      tabEl.style.borderBottomColor = 'transparent';
      tabEl.style.color = 'var(--fg3)';
      tabEl.style.fontWeight = '400';
    }
  });
};

// ===== 性别筛选：点击切换选中状态 =====
var 小说提取性别颜色 = { female: 'var(--accent2)', male: 'var(--blue)', femboy: 'var(--accent)', futa: 'var(--green)', beast: '#e94560' };

window.小说提取切换提取性别 = function(el) {
  var color = 小说提取性别颜色[el.dataset.gender] || 'var(--accent)';
  if (el.dataset.selected === 'true') {
    el.dataset.selected = 'false';
    el.style.borderColor = 'var(--border)';
    el.style.color = 'var(--fg3)';
    el.style.background = 'transparent';
  } else {
    el.dataset.selected = 'true';
    el.style.borderColor = color;
    el.style.color = color;
    el.style.background = color.replace(')', '15)');
  }
};

// 获取当前选中的性别列表（空数组 = 提取全部）
function 小说提取获取选中性别() {
  var selected = [];
  document.querySelectorAll('#targetedGenderSelector .gender-chip[data-selected="true"]').forEach(function(el) {
    selected.push(el.dataset.gender);
  });
  return selected;
}

// 根据选中性别生成 prompt 筛选指令
function 小说提取性别筛选指令(selected) {
  if (!selected || !selected.length) return '';
  var labels = selected.map(function(g) { return 小说提取性别配置[g] ? 小说提取性别配置[g].label : g; });
  return '\n- **性别筛选**：用户指定只提取以下性别的角色：' + labels.join('、') + '。请严格按此筛选，其他性别的角色不要输出。';
}

// ===== Tab 1: 快捷方向填入 =====
window.小说提取填入方向 = function(el, dir) {
  document.querySelectorAll('#targetedChips .tag-chip').forEach(function(c) { c.style.borderColor = ''; c.style.color = ''; });
  el.style.borderColor = 'var(--accent)';
  el.style.color = 'var(--accent)';
  document.getElementById('targetedDirectionInput').value = dir;
};

// ===== Tab 2: 快捷描述填入 =====
window.小说提取填入AI描述 = function(el, desc) {
  document.querySelectorAll('#tabpane_ai .tag-chip').forEach(function(c) { c.style.borderColor = ''; c.style.color = ''; });
  el.style.borderColor = 'var(--accent)';
  el.style.color = 'var(--accent)';
  document.getElementById('aiDirectionInput').value = desc;
};

// ===== Tab 1: 确认执行关键词搜索提取 =====
window.小说提取确认针对性提取 = function() {
  var direction = document.getElementById('targetedDirectionInput').value.trim();
  if (!direction) { toast('请输入提取方向'); return; }
  var genders = 小说提取获取选中性别();
  document.getElementById('targetedExtractOverlay').remove();
  小说提取执行针对性提取(direction, genders);
};

// ===== Tab 2: AI 分析关键词（第一阶段） =====
window.小说提取AI决定关键词 = function() {
  var description = document.getElementById('aiDirectionInput').value.trim();
  if (!description) { toast('请描述你想要提取的角色类型'); return; }
  var genders = 小说提取获取选中性别();

  var btn = document.getElementById('aiAnalyzeBtn');
  btn.disabled = true;
  btn.textContent = '⏳ AI 分析中...';

  var fullText = 小说提取原始文本 || '';
  if (!fullText || fullText.length < 50) { btn.disabled = false; btn.textContent = '🤖 AI 分析关键词'; toast('⚠️ 原文已丢失'); return; }
  var chunkText = fullText.substring(0, 120000);
  var genderHint = '';
  if (genders.length) {
    var labels = genders.map(function(g) { return 小说提取性别配置[g] ? 小说提取性别配置[g].label : g; });
    genderHint = '\n（用户指定只提取以下性别：' + labels.join('、') + '，生成关键词时注意优先覆盖这些性别的角色）';
  }

  var _r = renderPrompt('ext_char_keywords', {
    需求: description,
    性别提示: genderHint,
    文本: chunkText,
  });
  LLM.callJSON({
    prompt: _r.user,
    system: _r.system,
    label: 'AI 决定关键词: ' + description.substring(0, 30),
    temperature: 0.3,
  }).then(function(data) {
    btn.disabled = false;
    btn.textContent = '🤖 AI 分析关键词';
    var keywords = (data && data.keywords) || [];
    if (!keywords.length) { toast('AI 未能生成关键词，请重试'); return; }
    document.getElementById('aiKeywordsInput').value = keywords.join('、');
    toast('AI 已生成 ' + keywords.length + ' 个关键词，确认后点击「开始提取」');
  }).catch(function(err) {
    btn.disabled = false;
    btn.textContent = '🤖 AI 分析关键词';
    toast('⚠️ AI 分析失败: ' + (err.message || ''));
  });
};

// ===== Tab 2: 确认 AI 提取（第二阶段） =====
window.小说提取确认AI提取 = function() {
  var raw = document.getElementById('aiKeywordsInput').value.trim();
  if (!raw) { toast('关键词为空，请重新分析或手动输入'); return; }
  var genders = 小说提取获取选中性别();
  var keywords = raw.split(/[、，,、\s]+/).filter(function(k) { return k.trim(); });
  if (!keywords.length) { toast('关键词为空'); return; }
  document.getElementById('targetedExtractOverlay').remove();
  小说提取批量关键词提取(keywords, genders);
};

// ===== 多关键词搜索提取（Tab 1 和 Tab 2 共用） =====
window.小说提取批量关键词提取 = function(keywords, genders) {
  小说提取步骤 = 'analyzing';
  小说提取生成中 = {};
  小说提取审查进度 = null;
  if (!小说提取当前记录标题) 小说提取当前记录标题 = '';
  小说提取当前记录时间 = null;
  小说提取分析进度 = { done: 0, total: 0 };
  刷新视图();

  var fullText = 小说提取原始文本 || '';
  if (!fullText || fullText.length < 50) { toast('⚠️ 原文已丢失'); return; }

  // 多关键词搜索，去重合并匹配段落
  var contextLen = 500;
  var maxPassages = 50;
  var seenRanges = [];
  var passages = [];

  keywords.forEach(function(keyword) {
    if (!keyword) return;
    var searchPos = 0;
    while (passages.length < maxPassages) {
      var idx = fullText.indexOf(keyword, searchPos);
      if (idx === -1) break;
      var start = Math.max(0, idx - contextLen);
      var end = Math.min(fullText.length, idx + keyword.length + contextLen);
      var overlap = false;
      for (var si = 0; si < seenRanges.length; si++) {
        var sr = seenRanges[si];
        if (Math.min(end, sr.end) - Math.max(start, sr.start) > (end - start) * 0.7) { overlap = true; break; }
      }
      if (!overlap) {
        passages.push(fullText.substring(start, end));
        seenRanges.push({ start: start, end: end });
      }
      searchPos = idx + keyword.length;
      if (searchPos <= idx) searchPos = idx + 1;
    }
  });

  if (!passages.length) {
    小说提取步骤 = 'error';
    刷新视图();
    toast('⚠️ 未找到匹配段落，请尝试其他描述');
    return;
  }

  刷新视图();

  var genderFilterStr = 小说提取性别筛选指令(genders);
  var passageText = passages.map(function(p, i) {
    return '--- 匹配段落 ' + (i + 1) + '/' + passages.length + ' ---\n' + p;
  }).join('\n\n');

  var 字段Schema = 小说提取字段Schema(小说提取字段序);
  var _r = renderPrompt('ext_char_targeted', {
    关键词: '[' + keywords.join(', ') + ']',
    段落数: passages.length,
    段落: passageText,
    性别筛选: genderFilterStr,
    字段Schema: 字段Schema,
  });
  LLM.callJSON({
    prompt: _r.user,
    system: _r.system,
    label: 'AI针对性提取: ' + keywords.slice(0, 3).join('+'),
    temperature: 0.3
  }).then(function(data) {
    var newChars = (data && data.characters) || [];
    if (!newChars.length) {
      小说提取步骤 = 'error';
      刷新视图();
      toast('⚠️ 未从相关段落中提取到角色');
      return;
    }
    var existingNames = {};
    小说提取角色列表.forEach(function(c) { existingNames[c.name] = true; });
    var added = 0;
    newChars.forEach(function(c) {
      if (c.name && !existingNames[c.name]) {
        var entry = { name: c.name, gender: 小说提取规范化性别(c.gender), role: c.role || '龙套', brief: c.brief || null };
        小说提取正文段字段.forEach(function(f) {
          entry[f] = (c[f] && c[f] !== 'null') ? c[f] : null;
        });
        // aliases 统一为数组：LLM 若返回字符串（可能含顿号/逗号）则拆分为数组
        if (entry.aliases && typeof entry.aliases === 'string') {
          entry.aliases = entry.aliases.split(/[、,，/\s]+/).filter(function(a) { return a && a !== c.name; });
        }
        if (Array.isArray(entry.aliases)) {
          entry.aliases = entry.aliases.filter(function(v, i, self) { return self.indexOf(v) === i; });
        } else {
          entry.aliases = null;
        }
        // 数组字段统一为数组：LLM 若返回字符串则拆分
        小说提取数组字段.forEach(function(af) {
          if (entry[af] && typeof entry[af] === 'string') {
            entry[af] = entry[af].split(/[、,，/\s]+/).filter(function(a) { return a && a !== 'null'; });
          }
          if (entry[af] && Array.isArray(entry[af])) {
            entry[af] = entry[af].filter(function(v, i, self) { return self.indexOf(v) === i; });
          }
          if (!entry[af] || (Array.isArray(entry[af]) && !entry[af].length)) entry[af] = null;
        });
        小说提取角色列表.push(entry);
        existingNames[c.name] = true;
        added++;
      }
    });
    小说提取步骤 = 'result';
    刷新视图();
    小说提取保存当前记录();
    toast('✅ 针对性提取完成，新增 ' + added + ' 个角色');
  }).catch(function(err) {
    console.warn('针对性提取失败:', err);
    小说提取步骤 = 'error';
    刷新视图();
    toast('⚠️ 针对性提取失败: ' + (err.message || ''));
  });
};

// ===== 单关键词搜索提取（保留，Tab 1 使用） =====
window.小说提取执行针对性提取 = function(keyword, genderFilter) {
  if (!keyword || !keyword.trim()) { toast('请输入搜索关键词'); return; }
  keyword = keyword.trim();
  小说提取步骤 = 'analyzing';
  小说提取生成中 = {};
  小说提取审查进度 = null;
  if (!小说提取当前记录标题) 小说提取当前记录标题 = '';
  小说提取当前记录时间 = null;
  小说提取分析进度 = { done: 0, total: 0 };
  刷新视图();

  var fullText = 小说提取原始文本 || '';
  if (!fullText || fullText.length < 50) { toast('⚠️ 原文已丢失'); return; }

  // 搜索关键词，取前 50 处匹配段落上下文
  var contextLen = 500;
  var maxPassages = 50;
  var passages = [];
  var searchPos = 0;

  while (passages.length < maxPassages) {
    var idx = fullText.indexOf(keyword, searchPos);
    if (idx === -1) break;
    var start = Math.max(0, idx - contextLen);
    var end = Math.min(fullText.length, idx + keyword.length + contextLen);
    passages.push(fullText.substring(start, end));
    searchPos = idx + keyword.length;
    if (searchPos <= idx) searchPos = idx + 1;
  }

  if (!passages.length) {
    小说提取步骤 = 'error';
    刷新视图();
    toast('⚠️ 全文未找到「' + keyword + '」，请尝试其他关键词');
    return;
  }

  刷新视图();

  var genderFilterStr = 小说提取性别筛选指令(genderFilter);
  var passageText = passages.map(function(p, i) {
    return '--- 匹配段落 ' + (i + 1) + '/' + passages.length + ' ---\n' + p;
  }).join('\n\n');

  var 字段Schema = 小说提取字段Schema(小说提取字段序);
  var _r = renderPrompt('ext_char_targeted', {
    关键词: '「' + keyword + '」',
    段落数: passages.length,
    段落: passageText,
    性别筛选: genderFilterStr,
    字段Schema: 字段Schema,
  });
  LLM.callJSON({
    prompt: _r.user,
    system: _r.system,
    label: '针对性提取: ' + keyword,
    temperature: 0.3
  }).then(function(data) {
    var newChars = (data && data.characters) || [];
    if (!newChars.length) {
      小说提取步骤 = 'error';
      刷新视图();
      toast('⚠️ 未从相关段落中提取到角色');
      return;
    }
    var existingNames = {};
    小说提取角色列表.forEach(function(c) { existingNames[c.name] = true; });
    var added = 0;
    newChars.forEach(function(c) {
      if (c.name && !existingNames[c.name]) {
        var entry = {
          name: c.name,
          gender: 小说提取规范化性别(c.gender),
          role: c.role || '龙套',
          brief: c.brief || null
        };
        小说提取正文段字段.forEach(function(f) {
          entry[f] = (c[f] && c[f] !== 'null') ? c[f] : null;
        });
        // aliases 统一为数组：LLM 若返回字符串（可能含顿号/逗号）则拆分为数组
        if (entry.aliases && typeof entry.aliases === 'string') {
          entry.aliases = entry.aliases.split(/[、,，/\s]+/).filter(function(a) { return a && a !== c.name; });
        }
        if (Array.isArray(entry.aliases)) {
          entry.aliases = entry.aliases.filter(function(v, i, self) { return self.indexOf(v) === i; });
        } else {
          entry.aliases = null;
        }
        // 数组字段统一为数组：LLM 若返回字符串则拆分
        小说提取数组字段.forEach(function(af) {
          if (entry[af] && typeof entry[af] === 'string') {
            entry[af] = entry[af].split(/[、,，/\s]+/).filter(function(a) { return a && a !== 'null'; });
          }
          if (entry[af] && Array.isArray(entry[af])) {
            entry[af] = entry[af].filter(function(v, i, self) { return self.indexOf(v) === i; });
          }
          if (!entry[af] || (Array.isArray(entry[af]) && !entry[af].length)) entry[af] = null;
        });
        小说提取角色列表.push(entry);
        existingNames[c.name] = true;
        added++;
      }
    });
    小说提取步骤 = 'result';
    刷新视图();
    小说提取保存当前记录();
    toast('✅ 针对性提取完成，新增 ' + added + ' 个角色');
  }).catch(function(err) {
    console.warn('针对性提取失败:', err);
    小说提取步骤 = 'error';
    刷新视图();
    toast('⚠️ 针对性提取失败: ' + (err.message || ''));
  });
};
