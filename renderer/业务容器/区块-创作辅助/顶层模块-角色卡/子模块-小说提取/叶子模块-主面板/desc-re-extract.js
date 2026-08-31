// ===== 重新提取角色（按时间线方式全文扫描） =====
window.小说提取弹出重新提取 = function(name) {
  window._reExtractName = name;
  if (document.getElementById('reExtractOverlay')) return;
  var ov = document.createElement('div');
  ov.id = 'reExtractOverlay';
  ov.className = 'ovl';
  ov.innerHTML = '<div class="mcard" style="max-width:480px;width:90%">' +
    '<div style="font-size:15px;font-weight:600;margin-bottom:4px">🔄 重新提取角色</div>' +
    '<div style="font-size:11px;color:var(--fg2);margin-bottom:14px">将扫描全文重新提取「' + escHtml(name) + '」的全部数据</div>' +
    '<div style="font-size:11px;font-weight:500;margin-bottom:6px;color:var(--fg)">快捷方向（可多选）</div>' +
    '<div id="reExtractChips" style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px">' +
    '<span class="tag-chip" data-dir="重点提取该角色的性相关内容，逐项展开四个性字段，不得缩水：\n- sexCharacteristics（性特征）：第二性征发育、体态曲线、私处（乳房/阴茎/阴道/肛门等）的外貌描述，原文有明确描写必须完整提取，不遗漏任何细节\n- sexualSkill（性经验与身体表现）：从经历中沉淀出的性技能与身体被开发程度——技巧熟练度、性欲强弱、敏感带与身体反应、床笫间的表现（主动/被动、克制/放浪）、被调教出的身体习惯与承受力，尽可能详尽\n- sexualPreferences（性偏好与癖好）：敏感带、喜欢的性行为方式、性幻想、特殊癖好、接受度等，逐项挖掘\n- sexualDetails（性爱明细）：字符串数组按时间顺序编号（1. 2. 3. ...不限于4条），原文描写过的每场性爱都要单独成条，每条详细描述、内容充足、不能一句话带过，作为角色的性爱百科\n原文如何描写就如何提取，不要缩写，性内容不得因戏份少而缩水" onclick="小说提取切换重新提取chip(this)" style="cursor:pointer;font-size:10px">🔞 重点提取性内容</span>' +
    '<span class="tag-chip" data-dir="若原文缺乏该角色的性相关内容，请根据角色设定（性别、种族、职业、年龄、性格、背景、故事定位）合理推演并自行编写补充，使性字段完整饱满：\n- sexCharacteristics（性特征）：依据角色性别与种族设定合理描写第二性征发育、体态曲线、私处（乳房/阴茎/阴道/肛门等）的外貌\n- sexualSkill（性经验与身体表现）：结合角色经历与身份推演其性经验深浅与身体被开发程度——技巧熟练度、性欲强弱、敏感带与身体反应、床笫间的表现（主动/被动、克制/放浪）、被调教出的身体习惯与承受力\n- sexualPreferences（性偏好与癖好）：结合性格与故事定位设计合理的性偏好——敏感带、喜欢的性行为方式、性幻想、特殊癖好、接受度等\n- sexualDetails（性爱明细）：为角色编写若干次与背景相符的性经历，按时间顺序编号（1. 2. 3. ...不限于4条），每条详细描述、内容充足、不能一句话带过\n补充内容需与角色设定保持一致，不突兀、不崩人设" onclick="小说提取切换重新提取chip(this)" style="cursor:pointer;font-size:10px">✍️ 自编补充性内容</span>' +
    '</div>' +
    '<div style="font-size:11px;font-weight:500;margin-bottom:6px;color:var(--fg)">提取方向（可选，可补充）</div>' +
    '<div style="font-size:10px;color:var(--fg3);margin-bottom:8px">点击上方快捷选项填入，也可直接输入自定义方向</div>' +
    '<textarea id="reExtractHint" class="llm-input" rows="3" style="width:100%;font-size:12px;resize:vertical;font-family:inherit" placeholder="留空则按默认方式提取……"></textarea>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">' +
    '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>' +
    '<button class="btn-main" onclick="小说提取确认重新提取()">🔄 开始重新提取</button>' +
    '</div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
};

// 重新提取弹窗：点击快捷方向 chip，切换选中状态并填入/移除提示词
window.小说提取切换重新提取chip = function(el) {
  var dir = el.getAttribute('data-dir');
  var ta = document.getElementById('reExtractHint');
  if (!ta) return;
  var current = ta.value.trim();
  var parts = current.split(/\n+/).map(function(x) { return x.trim(); }).filter(Boolean);
  if (el.getAttribute('data-on') === 'true') {
    // 取消选中：移除该方向
    el.removeAttribute('data-on');
    el.style.borderColor = '';
    el.style.color = '';
    el.style.background = '';
    ta.value = parts.filter(function(p) { return p !== dir; }).join('\n');
  } else {
    // 选中：追加该方向
    el.setAttribute('data-on', 'true');
    el.style.borderColor = 'var(--accent)';
    el.style.color = 'var(--accent)';
    el.style.background = 'rgba(255,255,255,0.06)';
    if (parts.indexOf(dir) < 0) parts.push(dir);
    ta.value = parts.join('\n');
  }
};

window.小说提取确认重新提取 = function() {
  var hint = document.getElementById('reExtractHint');
  var hintText = hint ? hint.value.trim() : '';
  var ov = document.getElementById('reExtractOverlay');
  if (ov) ov.remove();
  小说提取重新提取角色(window._reExtractName, hintText);
};

window.小说提取重新提取角色 = function(name, userHint) {
  if (!name) return;
  var c = null;
  小说提取角色列表.forEach(function(ch) { if (ch.name === name) c = ch; });
  if (!c) { toast('角色不存在'); return; }
  // 重新提取的角色提升为主角
  if (c.role !== '主角') {
    c.role = '主角';
    小说提取保存单个角色(c);
  }

  小说提取步骤 = 'result'; // 避免与主提取进度条冲突
  小说提取生成中[name] = true;
  刷新视图();

  var fullText = 小说提取原始文本 || '';
  if (!fullText || fullText.length < 50) { toast('原文已丢失'); 小说提取生成中[name] = false; 刷新视图(); return; }

  var terms = [c.name];
  if (c.aliases && Array.isArray(c.aliases)) {
    c.aliases.forEach(function(a) { if (a && terms.indexOf(a) < 0) terms.push(a); });
  }
  var extra = [];
  terms.forEach(function(t) {
    var m = t.match(/^(.+?)[（(【](.+?)[）)】]$/);
    if (m) { if (m[1] && extra.indexOf(m[1]) < 0) extra.push(m[1]); if (m[2] && extra.indexOf(m[2]) < 0) extra.push(m[2]); }
    if (t.indexOf('·') >= 0) t.split('·').forEach(function(p) { if (p && extra.indexOf(p) < 0) extra.push(p); });
    if (t.indexOf('/') >= 0) t.split('/').forEach(function(p) { if (p && extra.indexOf(p) < 0) extra.push(p); });
  });
  extra.forEach(function(e) { if (terms.indexOf(e) < 0) terms.push(e); });

  var passages = 全文锚点段落(fullText, terms, { maxChars: 100000, maxSegs: 50 });
  var pct = passages.length > 0 ? Math.round(passages.length / 50 * 100) : 0;
  var totalChars = fullText.length;
  var passageText = passages.map(function(p, i) {
    return '【段落' + (i + 1) + '/' + passages.length + ' 位于全文 ' + Math.round(p.start / totalChars * 100) + '%~' + Math.round(p.end / totalChars * 100) + '% 区间】\n' + p.text;
  }).join('\n\n---\n\n');

  var hintBlock = userHint ? '\n\n【用户建议】\n' + userHint : '';
  var 字段Schema = 小说提取字段Schema(小说提取字段序);
  var _r = renderPrompt('ext_char_reextract', {
    角色名: c.name,
    范围说明: '以下是与角色「' + c.name + '」相关的原文段落。请从这些段落中提取该角色的完整数据。',
    段落: passageText,
    用户建议: hintBlock,
    字段Schema: 字段Schema,
  });
  LLM.call({
    prompt: _r.user,
    system: _r.system,
    label: '重新提取: ' + c.name,
    temperature: 0.3,
  }).then(function(raw) {
    小说提取生成中[name] = false;
    var data = null;
    try { var m = raw.match(/\{[\s\S]*\}/); if (m) data = JSON.parse(m[0]); } catch(e) {}
    if (!data || !data.name) {
      toast('提取结果解析失败');
      刷新视图();
      return;
    }
    // gender/role 故意不在此列：重新提取不覆盖角色卡已设定的性别和级别
    var fields = 小说提取字段序.slice(4);
    fields.forEach(function(f) {
      if (data[f] !== undefined && data[f] !== null && data[f] !== 'null') c[f] = data[f];
    });
    // 别名合并进数组，保持数组结构（卡片渲染只认数组）
    var newAliases = Array.isArray(data.aliases) ? data.aliases
      : (typeof data.aliases === 'string' && data.aliases && data.aliases !== 'null' ? [data.aliases] : []);
    var aliases = Array.isArray(c.aliases) ? c.aliases.slice() : [];
    newAliases.forEach(function(a) {
      var v = String(a).trim();
      if (v && aliases.indexOf(v) < 0 && v !== c.name) aliases.push(v);
    });
    if (aliases.length) c.aliases = aliases;
    小说提取保存单个角色(c).then(function() {
      toast('已重新提取「' + c.name + '」');
      刷新视图();
    });

  }).catch(function(err) {
    小说提取生成中[name] = false;
    console.warn('重新提取失败:', err);
    toast('重新提取失败: ' + (err.message || ''));
    刷新视图();
  });
};

// ===== 全文提取（按 12 万字分块，覆盖全文，逐块提取后合并） =====
window.小说提取弹出全文提取 = function(name) {
  window._fullExtractName = name;
  if (document.getElementById('fullExtractOverlay')) return;
  var ov = document.createElement('div');
  ov.id = 'fullExtractOverlay';
  ov.className = 'ovl';
  ov.innerHTML = '<div class="mcard" style="max-width:480px;width:90%">' +
    '<div style="font-size:15px;font-weight:600;margin-bottom:4px">📖 全文提取角色</div>' +
    '<div style="font-size:11px;color:var(--fg2);margin-bottom:14px">按每 12 万字分块扫描全文，逐块提取「' + escHtml(name) + '」的全部数据并合并</div>' +
    '<div style="font-size:11px;font-weight:500;margin-bottom:6px;color:var(--fg)">快捷方向（可多选）</div>' +
    '<div id="fullExtractChips" style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px">' +
    '<span class="tag-chip" data-dir="重点提取该角色的性相关内容，逐项展开四个性字段，不得缩水：\n- sexCharacteristics（性特征）：第二性征发育、体态曲线、私处（乳房/阴茎/阴道/肛门等）的外貌描述，原文有明确描写必须完整提取，不遗漏任何细节\n- sexualSkill（性经验与身体表现）：从经历中沉淀出的性技能与身体被开发程度——技巧熟练度、性欲强弱、敏感带与身体反应、床笫间的表现（主动/被动、克制/放浪）、被调教出的身体习惯与承受力，尽可能详尽\n- sexualPreferences（性偏好与癖好）：敏感带、喜欢的性行为方式、性幻想、特殊癖好、接受度等，逐项挖掘\n- sexualDetails（性爱明细）：字符串数组按时间顺序编号（1. 2. 3. ...不限于4条），原文描写过的每场性爱都要单独成条，每条详细描述、内容充足、不能一句话带过，作为角色的性爱百科\n原文如何描写就如何提取，不要缩写，性内容不得因戏份少而缩水" onclick="小说提取切换全文提取chip(this)" style="cursor:pointer;font-size:10px">🔞 重点提取性内容</span>' +
    '<span class="tag-chip" data-dir="若原文缺乏该角色的性相关内容，请根据角色设定（性别、种族、职业、年龄、性格、背景、故事定位）合理推演并自行编写补充，使性字段完整饱满：\n- sexCharacteristics（性特征）：依据角色性别与种族设定合理描写第二性征发育、体态曲线、私处（乳房/阴茎/阴道/肛门等）的外貌\n- sexualSkill（性经验与身体表现）：结合角色经历与身份推演其性经验深浅与身体被开发程度——技巧熟练度、性欲强弱、敏感带与身体反应、床笫间的表现（主动/被动、克制/放浪）、被调教出的身体习惯与承受力\n- sexualPreferences（性偏好与癖好）：结合性格与故事定位设计合理的性偏好——敏感带、喜欢的性行为方式、性幻想、特殊癖好、接受度等\n- sexualDetails（性爱明细）：为角色编写若干次与背景相符的性经历，按时间顺序编号（1. 2. 3. ...不限于4条），每条详细描述、内容充足、不能一句话带过\n补充内容需与角色设定保持一致，不突兀、不崩人设" onclick="小说提取切换全文提取chip(this)" style="cursor:pointer;font-size:10px">✍️ 自编补充性内容</span>' +
    '</div>' +
    '<div style="font-size:11px;font-weight:500;margin-bottom:6px;color:var(--fg)">提取方向（可选，可补充）</div>' +
    '<div style="font-size:10px;color:var(--fg3);margin-bottom:8px">点击上方快捷选项填入，也可直接输入自定义方向</div>' +
    '<textarea id="fullExtractHint" class="llm-input" rows="3" style="width:100%;font-size:12px;resize:vertical;font-family:inherit" placeholder="留空则按默认方式提取……"></textarea>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">' +
    '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>' +
    '<button class="btn-main" onclick="小说提取确认全文提取()">📖 开始全文提取</button>' +
    '</div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
};

// 全文提取弹窗：点击快捷方向 chip，切换选中状态并填入/移除提示词
window.小说提取切换全文提取chip = function(el) {
  var dir = el.getAttribute('data-dir');
  var ta = document.getElementById('fullExtractHint');
  if (!ta) return;
  var current = ta.value.trim();
  var parts = current.split(/\n+/).map(function(x) { return x.trim(); }).filter(Boolean);
  if (el.getAttribute('data-on') === 'true') {
    el.removeAttribute('data-on');
    el.style.borderColor = '';
    el.style.color = '';
    el.style.background = '';
    ta.value = parts.filter(function(p) { return p !== dir; }).join('\n');
  } else {
    el.setAttribute('data-on', 'true');
    el.style.borderColor = 'var(--accent)';
    el.style.color = 'var(--accent)';
    el.style.background = 'rgba(255,255,255,0.06)';
    if (parts.indexOf(dir) < 0) parts.push(dir);
    ta.value = parts.join('\n');
  }
};

window.小说提取确认全文提取 = function() {
  var hint = document.getElementById('fullExtractHint');
  var hintText = hint ? hint.value.trim() : '';
  var ov = document.getElementById('fullExtractOverlay');
  if (ov) ov.remove();
  小说提取全文提取角色(window._fullExtractName, hintText);
};

// 构造带别名的角色名，让 LLM 提取时能识别原文中的所有称呼
function 角色名带别名(c) {
  if (!c) return '';
  var aliases = (Array.isArray(c.aliases) && c.aliases.length) ? c.aliases : [];
  if (!aliases.length) return c.name;
  return c.name + '（别名：' + aliases.join('、') + '）';
}

// 全文提取分段数据文件路径：记录文件夹/_fullExtract_<角色名>.json
function 小说提取分段文件路径(name) {
  var folderName = 本地FS.清理(小说提取当前记录标题) || 小说提取当前记录ID;
  return 小说提取存储基路径 + folderName + '/_fullExtract_' + 本地FS.清理(name) + '.json';
}

// 保存分段数据到磁盘
function 小说提取保存分段(segData) {
  return LocalFS.saveJSON(小说提取分段文件路径(segData.character), segData);
}

// 读取角色的分段数据
function 小说提取读取分段(name) {
  return LocalFS.readJSON(小说提取分段文件路径(name)).catch(function() { return null; });
}

// 全文提取主流程：12 万字分块 → 逐块提取 → 合并写回（不覆盖 gender/role）
window.小说提取全文提取角色 = function(name, userHint) {
  if (!name) return;
  var c = null;
  小说提取角色列表.forEach(function(ch) { if (ch.name === name) c = ch; });
  if (!c) { toast('角色不存在'); return; }
  // 全文提取的角色提升为主角
  if (c.role !== '主角') {
    c.role = '主角';
    小说提取保存单个角色(c);
  }

  小说提取步骤 = 'result';
  小说提取生成中[name] = true;
  刷新视图();

  var fullText = 小说提取原始文本 || '';
  if (!fullText || fullText.length < 50) { toast('原文已丢失'); 小说提取生成中[name] = false; 刷新视图(); return; }

  // 与分析提取一致：按 12 万字分块覆盖全文
  var chunks = 切割文本(fullText, 120000);
  if (chunks.length > 100) { chunks = chunks.slice(0, 100); toast('⚠️ 文本超长，将提取前约 1200 万字'); }
  var 字段Schema = 小说提取字段Schema(小说提取字段序);
  var hintBlock = userHint ? '\n\n【用户建议】\n' + userHint : '';

  var 全部块结果 = [];   // 收集各块提取结果，最后由 LLM 合并

  // 初始化分段数据并持久化（含每段原文，供后续单段重提）
  var segData = {
    character: name,
    createdAt: Date.now(),
    hint: userHint || '',
    segments: chunks.map(function(chunk, i) {
      return { idx: i, chunkText: chunk, result: null, status: 'pending' };
    })
  };
  小说提取保存分段(segData);

  function 提取一块(idx) {
    if (idx >= chunks.length) {
      // 全部块提取完毕，交给 LLM 合并
      if (!全部块结果.length) {
        小说提取生成中[name] = false;
        toast('⚠️ 未提取到该角色数据');
        刷新视图();
        return;
      }
      var el2 = document.getElementById('fqViewContent');
      if (el2) el2.innerHTML = '<div style="text-align:center;padding:30px;color:var(--fg2)"><div class="fs-13 fw-600 mb-8">📖 全文提取「' + escHtml(name) + '」</div><div class="fs-12">正在合并 ' + 全部块结果.length + ' 块提取结果…</div></div>';
      var 分段数据 = 全部块结果.map(function(d, i) {
        return '【第' + (i + 1) + '段提取结果】\n' + JSON.stringify(d, null, 1);
      }).join('\n\n');
      var _m = renderPrompt('ext_char_merge', {
        角色名: 角色名带别名(c),
        分段数据: 分段数据,
        字段Schema: 字段Schema,
      });
      LLM.call({
        prompt: _m.user,
        system: _m.system,
        label: '全文提取合并 ' + name,
        temperature: 0.3,
      }).then(function(raw) {
        小说提取生成中[name] = false;
        var 合并结果 = null;
        try { var m = raw.match(/\{[\s\S]*\}/); if (m) 合并结果 = JSON.parse(m[0]); } catch(e) {}
        if (!合并结果) {
          toast('⚠️ 合并结果解析失败');
          刷新视图();
          return;
        }
        // 写回角色（不覆盖 gender/role）
        var 写回字段 = 小说提取字段序.slice(4);
        写回字段.forEach(function(f) {
          if (合并结果[f] !== undefined && 合并结果[f] !== null && 合并结果[f] !== 'null') c[f] = 合并结果[f];
        });
        // 别名合并进数组
        var newAliases = Array.isArray(合并结果.aliases) ? 合并结果.aliases : (typeof 合并结果.aliases === 'string' && 合并结果.aliases && 合并结果.aliases !== 'null' ? [合并结果.aliases] : []);
        var aliases = Array.isArray(c.aliases) ? c.aliases.slice() : [];
        newAliases.forEach(function(a) {
          var v = String(a).trim();
          if (v && aliases.indexOf(v) < 0 && v !== c.name) aliases.push(v);
        });
        if (aliases.length) c.aliases = aliases;
        // 合并完成：标记分段数据 mergedAt 并持久化
        segData.mergedAt = Date.now();
        小说提取保存分段(segData);
        小说提取保存单个角色(c).then(function() {
          toast('已全文提取「' + c.name + '」');
          刷新视图();
        });
      }).catch(function(err) {
        小说提取生成中[name] = false;
        console.warn('全文提取合并失败:', err);
        toast('⚠️ 合并失败: ' + (err.message || ''));
        刷新视图();
      });
      return;
    }

    var el = document.getElementById('fqViewContent');
    if (el) el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--fg2)">'
      + '<div class="fs-13 fw-600 mb-8">📖 全文提取「' + escHtml(name) + '」</div>'
      + '<div class="mb-8">已提取 ' + idx + ' / ' + chunks.length + ' 块</div>'
      + '<div style="background:var(--bg2);border-radius:4px;height:8px;max-width:300px;margin:0 auto"><div style="background:var(--accent);height:8px;border-radius:4px;width:' + (idx / chunks.length * 100) + '%"></div></div>'
      + '<div class="fs-12 mt-4">正在分析第 ' + (idx + 1) + ' 块…</div></div>';

    var chunkText = chunks[idx];
    var chunkLabel = '第' + (idx + 1) + '/' + chunks.length + '段';
    var _r = renderPrompt('ext_char_reextract', {
      角色名: 角色名带别名(c),
      范围说明: '这是全部的文章，请从中提取角色「' + c.name + '」的内容。**只提取这一个角色，不要输出其他任何角色**。',
      段落: '【' + chunkLabel + '】\n' + chunkText,
      用户建议: hintBlock,
      字段Schema: 字段Schema,
    });
    LLM.call({
      prompt: _r.user,
      system: _r.system,
      label: '全文提取 ' + name + ' ' + chunkLabel,
      temperature: 0.3,
    }).then(function(raw) {
      var data = null;
      try { var m = raw.match(/\{[\s\S]*\}/); if (m) data = JSON.parse(m[0]); } catch(e) {}
      if (data && data.name) 全部块结果.push(data);
      // 更新该段结果并持久化（含失败标记）
      segData.segments[idx].status = (data && data.name) ? 'ok' : 'failed';
      segData.segments[idx].result = (data && data.name) ? data : null;
      小说提取保存分段(segData);
      提取一块(idx + 1);
    }).catch(function() {
      segData.segments[idx].status = 'failed';
      小说提取保存分段(segData);
      提取一块(idx + 1);  // 单块失败继续下一块
    });
  }

  提取一块(0);
};

// ===== 分段管理 =====

// 分段管理弹窗
window.小说提取弹出分段管理 = function(name) {
  if (document.getElementById('segManageOverlay')) return;
  小说提取读取分段(name).then(function(segData) {
    if (!segData || !segData.segments || !segData.segments.length) {
      toast('该角色暂无分段数据（请先执行全文提取）');
      return;
    }
    var ov = document.createElement('div');
    ov.id = 'segManageOverlay';
    ov.className = 'ovl';
    var body = '<div class="mcard" style="max-width:720px;width:94vw;max-height:88vh;overflow-y:auto">';
    body += '<div style="font-size:15px;font-weight:600;margin-bottom:4px">📑 分段管理</div>';
    body += '<div style="font-size:11px;color:var(--fg2);margin-bottom:12px">角色：' + escHtml(name) + ' · ' + segData.segments.length + ' 段' + (segData.mergedAt ? ' · 已合并' : '') + '</div>';

    var okCount = segData.segments.filter(function(s) { return s.status === 'ok'; }).length;
    body += '<div style="font-size:10px;color:var(--fg3);margin-bottom:8px">成功 ' + okCount + ' / ' + segData.segments.length + ' 段。可对某段单独重新提取，改完点「重新合并」。</div>';

    segData.segments.forEach(function(seg) {
      var statusIcon = seg.status === 'ok' ? '<span style="color:var(--green)">✅</span>' : seg.status === 'failed' ? '<span style="color:var(--err)">❌</span>' : '<span style="color:var(--fg3)">⏳</span>';
      var brief = seg.result ? (seg.result.brief || seg.result.name || '') : '（未提取成功）';
      body += '<div style="border:1px solid var(--border);border-radius:6px;padding:6px 10px;margin-bottom:6px;background:var(--bg2)">';
      body += '<div style="display:flex;align-items:center;gap:6px">';
      body += '<span style="font-size:10px;color:var(--fg3);font-weight:600;flex-shrink:0">#' + (seg.idx + 1) + '</span>';
      body += statusIcon;
      body += '<span style="font-size:11px;color:var(--fg2);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(brief) + '</span>';
      body += '<button class="btn-out btn-sm" onclick="小说提取重提一段(\'' + escHtml(name) + '\',' + seg.idx + ')" style="font-size:10px;padding:1px 8px">🔄 重新提取</button>';
      body += '<span onclick="var el=document.getElementById(\'segDetail_' + seg.idx + '\');el.style.display=el.style.display===\'none\'?\'block\':\'none\';" style="font-size:10px;color:var(--accent);cursor:pointer;flex-shrink:0">查看</span>';
      body += '</div>';
      body += '<div id="segDetail_' + seg.idx + '" style="display:none;margin-top:4px;padding:6px 8px;background:var(--bg);border-radius:4px;font-size:10px;color:var(--fg2);max-height:180px;overflow-y:auto;white-space:pre-wrap">' + escHtml(JSON.stringify(seg.result || { status: '无结果' }, null, 1)) + '</div>';
      body += '</div>';
    });

    body += '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">';
    body += '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">关闭</button>';
    body += '<button class="btn-main" onclick="小说提取重新合并(\'' + escHtml(name) + '\')">🔀 重新合并</button>';
    body += '</div></div>';

    ov.innerHTML = body;
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  });
};

// 单段重新提取：只对该段原文重新调 LLM，覆盖该段结果
window.小说提取重提一段 = function(name, idx) {
  if (!confirm('重新提取第 ' + (idx + 1) + ' 段？')) return;
  var c = null;
  小说提取角色列表.forEach(function(ch) { if (ch.name === name) c = ch; });
  if (!c) { toast('角色不存在'); return; }
  小说提取读取分段(name).then(function(segData) {
    if (!segData || !segData.segments[idx]) { toast('分段数据缺失'); return; }
    var seg = segData.segments[idx];
    var 字段Schema = 小说提取字段Schema(小说提取字段序);
    var hintBlock = segData.hint ? '\n\n【用户建议】\n' + segData.hint : '';
    var _r = renderPrompt('ext_char_reextract', {
      角色名: 角色名带别名(c),
      范围说明: '以下是与角色「' + c.name + '」相关的原文段落。请从这些段落中提取该角色的完整数据。',
      段落: '【第' + (idx + 1) + '段】\n' + seg.chunkText,
      用户建议: hintBlock,
      字段Schema: 字段Schema,
    });
    seg.status = 'pending';
    小说提取保存分段(segData);
    刷新视图();
    LLM.call({
      prompt: _r.user,
      system: _r.system,
      label: '重提第' + (idx + 1) + '段 ' + name,
      temperature: 0.3,
    }).then(function(raw) {
      var data = null;
      try { var m = raw.match(/\{[\s\S]*\}/); if (m) data = JSON.parse(m[0]); } catch(e) {}
      if (data && data.name) {
        seg.result = data;
        seg.status = 'ok';
      } else {
        seg.status = 'failed';
      }
      小说提取保存分段(segData).then(function() {
        toast(data && data.name ? '已重提第 ' + (idx + 1) + ' 段' : '第 ' + (idx + 1) + ' 段提取失败');
        var ov = document.getElementById('segManageOverlay');
        if (ov) ov.remove();
        小说提取弹出分段管理(name);  // 重开弹窗显示最新状态
      });
    }).catch(function() {
      seg.status = 'failed';
      小说提取保存分段(segData).then(function() {
        toast('第 ' + (idx + 1) + ' 段提取失败');
        var ov = document.getElementById('segManageOverlay');
        if (ov) ov.remove();
        小说提取弹出分段管理(name);
      });
    });
  });
};

// 重新合并：取所有段结果调 ext_char_merge 写回角色
window.小说提取重新合并 = function(name) {
  var c = null;
  小说提取角色列表.forEach(function(ch) { if (ch.name === name) c = ch; });
  if (!c) { toast('角色不存在'); return; }
  小说提取读取分段(name).then(function(segData) {
    if (!segData || !segData.segments.length) { toast('分段数据缺失'); return; }
    var 成功段 = segData.segments.filter(function(s) { return s.status === 'ok' && s.result; });
    if (!成功段.length) { toast('没有成功的分段可合并'); return; }
    var 字段Schema = 小说提取字段Schema(小说提取字段序);
    var 分段数据 = 成功段.map(function(seg, i) {
      return '【第' + seg.idx + '段提取结果】\n' + JSON.stringify(seg.result, null, 1);
    }).join('\n\n');
    var _m = renderPrompt('ext_char_merge', {
      角色名: 角色名带别名(c),
      分段数据: 分段数据,
      字段Schema: 字段Schema,
    });
    var ov = document.getElementById('segManageOverlay');
    if (ov) ov.innerHTML = '<div class="mcard" style="max-width:720px;width:94vw;max-height:88vh;overflow-y:auto"><div style="text-align:center;padding:30px;color:var(--fg2)"><div class="fs-13 fw-600 mb-8">🔀 正在合并「' + escHtml(name) + '」</div><div class="fs-12">' + 成功段.length + ' 段提取结果</div></div></div>';
    LLM.call({
      prompt: _m.user,
      system: _m.system,
      label: '分段重新合并 ' + name,
      temperature: 0.3,
    }).then(function(raw) {
      var 合并结果 = null;
      try { var m = raw.match(/\{[\s\S]*\}/); if (m) 合并结果 = JSON.parse(m[0]); } catch(e) {}
      if (!合并结果) { toast('⚠️ 合并结果解析失败'); 刷新视图(); return; }
      var 写回字段 = 小说提取字段序.slice(4);
      写回字段.forEach(function(f) {
        if (合并结果[f] !== undefined && 合并结果[f] !== null && 合并结果[f] !== 'null') c[f] = 合并结果[f];
      });
      var newAliases = Array.isArray(合并结果.aliases) ? 合并结果.aliases : (typeof 合并结果.aliases === 'string' && 合并结果.aliases && 合并结果.aliases !== 'null' ? [合并结果.aliases] : []);
      var aliases = Array.isArray(c.aliases) ? c.aliases.slice() : [];
      newAliases.forEach(function(a) {
        var v = String(a).trim();
        if (v && aliases.indexOf(v) < 0 && v !== c.name) aliases.push(v);
      });
      if (aliases.length) c.aliases = aliases;
      segData.mergedAt = Date.now();
      小说提取保存分段(segData);
      小说提取保存单个角色(c).then(function() {
        toast('已重新合并「' + c.name + '」');
        刷新视图();
      });
    }).catch(function(err) {
      console.warn('分段重新合并失败:', err);
      toast('⚠️ 合并失败: ' + (err.message || ''));
      刷新视图();
    });
  });
};
