// 深度-叙事引擎 · 角色卡 · 📖 小说提取 · 角色时间线
// 展开/折叠切换、阶段切换、弹窗、全文搜索评估、拆分角色

// ===== 角色时间线：展开/折叠切换 =====
window.小说提取切换展开 = function(name) {
  小说提取展开角色[name] = 小说提取展开角色[name] !== true;
  刷新视图();
};

// ===== 角色时间线：弹出带建议输入框的弹窗 =====
window.小说提取弹出时间线输入 = function(name) {
  var c = null;
  小说提取角色列表.forEach(function(r) { if (r.name === name) c = r; });
  if (!c) { toast('未找到角色'); return; }

  if (document.getElementById('timelineInputOverlay')) return;
  var ov = document.createElement('div');
  ov.id = 'timelineInputOverlay';
  ov.className = 'ovl';
  ov.innerHTML = '<div class="mcard" style="max-width:520px;width:90%">' +
    '<div style="font-size:15px;font-weight:600;margin-bottom:4px">⏳ 生成角色时间线</div>' +
    '<div style="font-size:11px;color:var(--fg2);margin-bottom:14px">角色：' + escHtml(name) + '</div>' +

    '<div style="font-size:11px;font-weight:500;margin-bottom:6px;color:var(--fg)">请输入对时间线拆分的建议（可选）</div>' +
    '<div style="font-size:10px;color:var(--fg3);margin-bottom:8px">例如："童年、学院、战争三段" 或 "第一章到第三章是童年，第四章开始是学院"</div>' +
    '<textarea id="timelineHintInput" class="llm-input" rows="3" style="width:100%;font-size:12px;resize:vertical;font-family:inherit" placeholder="可输入拆分建议，留空则由 AI 自行分析……"></textarea>' +

    '<div style="font-size:11px;font-weight:500;margin-top:10px;margin-bottom:6px;color:var(--fg)">拆分阶段数量</div>' +
    '<div id="stageCountGroup" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">' +
    '<label style="font-size:11px;color:var(--fg2);cursor:pointer;padding:4px 10px;border:1px solid var(--border);border-radius:4px;background:var(--bg2)"><input type="radio" name="stageCount" value="0" checked onchange="document.getElementById(\'stageCustomInput\').disabled=true"> 自动</label>' +
    '<label style="font-size:11px;color:var(--fg2);cursor:pointer;padding:4px 10px;border:1px solid var(--border);border-radius:4px;background:var(--bg2)"><input type="radio" name="stageCount" value="2" onchange="document.getElementById(\'stageCustomInput\').disabled=true"> 2 个</label>' +
    '<label style="font-size:11px;color:var(--fg2);cursor:pointer;padding:4px 10px;border:1px solid var(--border);border-radius:4px;background:var(--bg2)"><input type="radio" name="stageCount" value="3" onchange="document.getElementById(\'stageCustomInput\').disabled=true"> 3 个</label>' +
    '<label style="font-size:11px;color:var(--fg2);cursor:pointer;padding:4px 10px;border:1px solid var(--border);border-radius:4px;background:var(--bg2)"><input type="radio" name="stageCount" value="5" onchange="document.getElementById(\'stageCustomInput\').disabled=true"> 5 个</label>' +
    '<label style="font-size:11px;color:var(--fg2);cursor:pointer;padding:4px 10px;border:1px solid var(--border);border-radius:4px;background:var(--bg2)"><input type="radio" name="stageCount" value="10" onchange="document.getElementById(\'stageCustomInput\').disabled=true"> 10 个</label>' +
    '<label style="font-size:11px;color:var(--fg2);cursor:pointer;padding:4px 10px;border:1px solid var(--border);border-radius:4px;background:var(--bg2)"><input type="radio" name="stageCount" value="custom" onchange="document.getElementById(\'stageCustomInput\').disabled=false;document.getElementById(\'stageCustomInput\').focus()"> 自定义</label>' +
    '<input id="stageCustomInput" type="number" min="1" max="30" value="4" disabled style="width:50px;font-size:11px;padding:3px 6px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;color:var(--fg)">' +
    '</div>' +

    '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">' +
    '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>' +
    '<button class="btn-main" onclick="小说提取确认生成时间线(\'' + escHtml(name) + '\')">🚀 确认生成</button>' +
    '</div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
};

// ===== 确认生成时间线（从弹窗获取 hint，调用全文搜索） =====
window.小说提取确认生成时间线 = function(name) {
  var hint = document.getElementById('timelineHintInput');
  var userHint = hint ? hint.value.trim() : '';

  // 读取阶段数量选择
  var stageCount = 0;
  var checkedRadio = document.querySelector('input[name="stageCount"]:checked');
  if (checkedRadio) {
    if (checkedRadio.value === 'custom') {
      var customInput = document.getElementById('stageCustomInput');
      stageCount = customInput ? parseInt(customInput.value) || 0 : 0;
    } else {
      stageCount = parseInt(checkedRadio.value) || 0;
    }
  }

  var ov = document.getElementById('timelineInputOverlay');
  if (ov) ov.remove();
  小说提取全文搜索时间线(name, userHint, stageCount);
};

// ===== 全文搜索 + LLM 评估角色时间线（核心函数） =====
window.小说提取全文搜索时间线 = function(name, userHint, stageCount) {
  var c = null;
  小说提取角色列表.forEach(function(r) { if (r.name === name) c = r; });
  if (!c) { toast('未找到角色'); return; }

  toast('⏳ 正在从全文中搜索「' + name + '」的相关内容...');

  // 获取全文
  var fullText = 小说提取原始文本 || '';
  if (!fullText || fullText.length < 50) {
    toast('⚠️ 未找到原文，请重新加载小说文本');
    return;
  }

  // 按进度均分 50 段，每区间 2%，每段 1000 字
  var totalChars = fullText.length;
  var searchName = name;
  var SEGMENTS = 50;
  var contextLen = 500; // 前后各 500 字
  var intervalSize = totalChars / SEGMENTS;

  // 1. 收集所有搜索词（主名 + 别名），按每个词扫描出现位置
  var searchTerms = [searchName];
  if (c.aliases && Array.isArray(c.aliases)) {
    c.aliases.forEach(function(a) {
      if (a && searchTerms.indexOf(a) < 0) searchTerms.push(a);
    });
  }
  // 从 name 字段解析括号内的别名（如"冰雕女孩（零）" → 主名"冰雕女孩" + 别名"零"）
  var parenMatch = searchName.match(/([^（(]+)[（(]([^）)]+)[）)]/);
  if (parenMatch) {
    if (parenMatch[1] && searchTerms.indexOf(parenMatch[1]) < 0) searchTerms.push(parenMatch[1]);
    if (parenMatch[2] && searchTerms.indexOf(parenMatch[2]) < 0) searchTerms.push(parenMatch[2]);
  }

  var allPositions = [];
  searchTerms.forEach(function(term) {
    var sp = 0;
    while (true) {
      var foundIdx = fullText.indexOf(term, sp);
      if (foundIdx < 0) break;
      allPositions.push(foundIdx);
      sp = foundIdx + 1;
    }
  });
  // 按位置排序
  allPositions.sort(function(a, b) { return a - b; });

  // 2. 按进度区间分配
  var intervalPassages = [];
  for (var seg = 0; seg < SEGMENTS; seg++) {
    var rangeStart = seg * intervalSize;
    var rangeEnd = (seg + 1) * intervalSize;
    // 找该区间内最接近中间位置的出现
    var mid = (rangeStart + rangeEnd) / 2;
    var bestPos = -1;
    var bestDist = Infinity;
    for (var pi = 0; pi < allPositions.length; pi++) {
      var p = allPositions[pi];
      if (p >= rangeStart && p < rangeEnd) {
        var dist = Math.abs(p - mid);
        if (dist < bestDist) {
          bestDist = dist;
          bestPos = p;
        }
      }
    }
    intervalPassages.push(bestPos >= 0 ? bestPos : -1);
  }

  // 3. 保底：对缺失的区间从最近的已有区间借用
  function findNearest(seg) {
    for (var offset = 1; offset < SEGMENTS; offset++) {
      if (seg - offset >= 0 && intervalPassages[seg - offset] >= 0) return intervalPassages[seg - offset];
      if (seg + offset < SEGMENTS && intervalPassages[seg + offset] >= 0) return intervalPassages[seg + offset];
    }
    return allPositions.length > 0 ? allPositions[Math.floor(allPositions.length / 2)] : -1;
  }
  // 第一轮：填充缺失区间
  for (var seg = 0; seg < SEGMENTS; seg++) {
    if (intervalPassages[seg] < 0) {
      intervalPassages[seg] = findNearest(seg);
    }
  }
  // 第二轮：连续借用了同一位置的区间做偏移，避免完全重叠
  for (var seg = 1; seg < SEGMENTS; seg++) {
    if (intervalPassages[seg] >= 0 && intervalPassages[seg] === intervalPassages[seg - 1]) {
      intervalPassages[seg] += contextLen * 0.6;
      if (intervalPassages[seg] > totalChars - 10) intervalPassages[seg] = totalChars - 10;
    }
  }

  // 4. 提取段落文本
  var passages = [];
  for (var seg = 0; seg < SEGMENTS; seg++) {
    var pos = intervalPassages[seg];
    if (pos < 0) continue;
    var start = Math.max(0, pos - contextLen);
    var end = Math.min(totalChars, pos + searchName.length + contextLen);
    // 去重：与上一段重叠超过 50% 则跳过
    if (passages.length > 0) {
      var prevEnd = passages[passages.length - 1]._end;
      if (start < prevEnd && (prevEnd - start) > contextLen * 0.5) {
        continue;
      }
    }
    passages.push({
      text: fullText.substring(start, end),
      _start: start,
      _end: end,
      _seg: seg
    });
  }

  // 5. 构建 prompt 文本
  var passageText = passages.map(function(p, i) {
    var pctStart = Math.round(p._seg * 100 / SEGMENTS);
    var pctEnd = Math.round((p._seg + 1) * 100 / SEGMENTS);
    return '--- 段落 ' + (i + 1) + '/' + passages.length + '（位于全文 ' + pctStart + '%~' + pctEnd + ' 区间） ---\n' + p.text;
  }).join('\n\n');

  var fieldsList = ['age', 'appearance', 'personality', 'title', 'occupation', 'attireStyle', 'aura', 'background', 'lifeStory', 'race', 'speechManner', 'catchphrases', 'bedroomTalk', 'brief']; // 展示顺序（字段定义来自 小说提取字段）

  var charInfo = '';
  charInfo += '角色名：' + c.name + '\n';
  charInfo += '性别：' + c.gender + ' ｜ 定位：' + c.role + '\n';
  if (c.brief) charInfo += '简介：' + c.brief + '\n';
  fieldsList.forEach(function(f) {
    if (c[f] && c[f] !== 'null') charInfo += f + '：' + c[f] + '\n';
  });

  var hintSection = '';
  if (userHint) {
    hintSection = '用户对时间线拆分的建议（请参考但不必严格遵循）：\n' + userHint + '\n\n';
  }

  var 字段Schema = 小说提取字段Schema(小说提取字段序.slice(4), '\n          ');
  var 阶段Schema = '{\n      "name": "阶段名称（2-4字）",\n      "description": "本阶段简述",\n      "fields": {\n' + 字段Schema + '\n      }\n    },\n    {\n      "name": "阶段名称",\n      "description": "本阶段简述",\n      "fields": {\n' + 字段Schema + '\n      }\n    }';
  var _r = renderPrompt('ext_char_timeline', {
    角色名: c.name,
    角色信息: charInfo,
    hintSection: hintSection,
    段落: passageText,
    阶段数: (stageCount > 0 ? '请将「' + c.name + '」的人生分为 ' + stageCount + ' 个阶段，每个阶段输出一个条目。\n' : ''),
    阶段Schema: 阶段Schema,
  });
  LLM.call({
    prompt: _r.user,
    system: _r.system,
    label: '时间线评估: ' + c.name,
    temperature: 0.3
  }).then(function(text) {
    try {
      var jsonMatch = text.match(/\{[\s\S]*\}/);
      var data = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      if (data && data.stages && data.stages.length) {
        // 过滤掉 fields 中的 null/空值
        data.stages.forEach(function(s) {
          if (s.fields) {
            var cleaned = {};
            Object.keys(s.fields).forEach(function(fk) {
              if (s.fields[fk] && s.fields[fk] !== 'null' && s.fields[fk] !== '') {
                cleaned[fk] = s.fields[fk];
              }
            });
            s.fields = cleaned;
          }
        });
        // 写独立阶段文件（含全部阶段数据），不再内嵌父角色文件
        var stageData = { sourceCharacter: c.name, stages: data.stages };
        小说提取保存阶段文件(c.name, stageData);
        // 同步内存（保留已生成的阶段描述）
        小说提取阶段数据[c.name] = data.stages;
        小说提取展开角色[c.name] = true;
        刷新视图();
        toast('✅ 已生成「' + c.name + '」的时间线（' + data.stages.length + ' 个阶段）');
      } else if (data && data.hasStages === false) {
        toast('⏳ 该角色无明显阶段变化');
        // 仍然存储空数组，避免重复评估
        小说提取保存阶段文件(c.name, { sourceCharacter: c.name, stages: [] });
        小说提取阶段数据[c.name] = [];
        刷新视图();
      } else {
        toast('⚠️ 未识别到有效的阶段信息，请重试');
      }
    } catch(e) {
      console.error('解析时间线 JSON 失败:', e);
      toast('⚠️ 解析失败，请重试');
    }
  }).catch(function(err) {
    console.error('时间线 LLM 调用失败:', err);
    toast('⚠️ 调用失败: ' + (err.message || '未知错误'));
  });
};
