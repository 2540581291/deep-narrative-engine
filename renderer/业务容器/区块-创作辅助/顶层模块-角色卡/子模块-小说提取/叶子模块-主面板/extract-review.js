// 深度-叙事引擎 · 角色卡 · 📖 小说提取 · 审查校验 & 别名补全
// 逐段校验、重复审查、别名搜索、审查面板 UI、修正应用

// ===== 审查用性别筛选辅助 =====
var 审查性别颜色 = { female: 'var(--accent2)', male: 'var(--blue)', femboy: 'var(--accent)', futa: 'var(--green)', beast: '#e94560' };
var 审查性别配置 = { female: { label: '女性', icon: '👩' }, male: { label: '男性', icon: '👨' }, femboy: { label: '伪娘', icon: '⚧' }, futa: { label: '扶她', icon: '🔮' }, beast: { label: '异种', icon: '👾' } };

window.小说提取切换审查性别 = function(el) {
  var color = 审查性别颜色[el.dataset.gender] || 'var(--accent)';
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

function 审查获取选中性别(containerId) {
  var selected = [];
  document.querySelectorAll('#' + containerId + ' .review-gender-chip[data-selected="true"]').forEach(function(el) {
    selected.push(el.dataset.gender);
  });
  return selected;
}

function 审查性别筛选HTML(containerId) {
  var h = '<div style="font-size:11px;font-weight:500;margin-bottom:5px;color:var(--fg)">性别筛选（点击切换，不选则审查全部）</div><div id="' + containerId + '">';
  ['female', 'male', 'femboy', 'futa', 'beast'].forEach(function(g) {
    var cfg = 审查性别配置[g];
    h += '<span class="review-gender-chip" data-gender="' + g + '" onclick="window.小说提取切换审查性别(this)" style="cursor:pointer;font-size:10px;padding:2px 10px;border-radius:4px;border:1px solid var(--border);color:var(--fg3);user-select:none;margin-right:4px;margin-bottom:4px;display:inline-block">' + cfg.icon + ' ' + cfg.label + '</span>';
  });
  h += '</div>';
  return h;
}

// ===== 弹窗：质量审查（性别判定专项） =====
window.小说提取填入审查方向 = function(el, dir) {
  document.getElementById('fullReviewHint').value = dir;
  document.querySelectorAll('.review-dir-chip').forEach(function(c) { c.style.borderColor = ''; c.style.color = ''; c.style.background = ''; });
  el.style.borderColor = 'var(--accent)';
  el.style.color = 'var(--accent)';
  el.style.background = 'var(--accent)15';
};

window.小说提取弹出审查校验 = function() {
  if (!小说提取角色列表.length) { toast('没有角色可供审查'); return; }
  if (document.getElementById('fullReviewOverlay')) return;
  var ov = document.createElement('div');
  ov.id = 'fullReviewOverlay';
  ov.className = 'ovl';
  ov.innerHTML = '<div class="mcard" style="max-width:520px;width:90%">' +
    '<div style="font-size:15px;font-weight:600;margin-bottom:4px">🔍 性别判定审查</div>' +
    '<div style="font-size:11px;color:var(--fg2);margin-bottom:12px">已提取 ' + 小说提取角色列表.length + ' 个角色 · 检查性别判定是否准确</div>' +
    审查性别筛选HTML('reviewGenderContainer') +
    '<div style="font-size:11px;font-weight:500;margin-bottom:6px;color:var(--fg);margin-top:8px">审查方向（可选）</div>' +
    '<div style="margin-bottom:6px">' +
    '<span class="review-dir-chip" onclick="小说提取填入审查方向(this,\'重点关注性别判定是否准确，检查每个角色的gender字段与称号、描述、角色名是否矛盾\')" style="cursor:pointer;font-size:10px;padding:2px 10px;border-radius:4px;border:1px solid var(--border);color:var(--fg3);user-select:none;margin-right:4px">性别判定</span>' +
    '<span class="review-dir-chip" onclick="小说提取填入审查方向(this,\'重点关注角色定位与频次排名是否匹配，检查role字段是否准确\')" style="cursor:pointer;font-size:10px;padding:2px 10px;border-radius:4px;border:1px solid var(--border);color:var(--fg3);user-select:none;margin-right:4px">角色定位</span>' +
    '<span class="review-dir-chip" onclick="小说提取填入审查方向(this,\'重点关注别名格式是否规范，检查aliases中是否包含未拆分的顿号分隔\')" style="cursor:pointer;font-size:10px;padding:2px 10px;border-radius:4px;border:1px solid var(--border);color:var(--fg3);user-select:none;margin-right:4px">别名规范</span>' +
    '</div>' +
    '<div style="font-size:10px;color:var(--fg3);margin-bottom:8px">例如：重点关注有伪娘/扶她特征的角色 / 检查男性角色是否有误标</div>' +
    '<textarea id="fullReviewHint" class="llm-input" rows="3" style="width:100%;font-size:12px;resize:vertical;font-family:inherit" placeholder="留空则检查全部角色……"></textarea>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">' +
    '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>' +
    '<button class="btn-main" onclick="小说提取确认审查校验()">🔍 开始审查</button>' +
    '</div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
};

window.小说提取确认审查校验 = function() {
  var hintInput = document.getElementById('fullReviewHint');
  var hint = hintInput ? hintInput.value.trim() : '';
  var genders = 审查获取选中性别('reviewGenderContainer');
  var ov = document.getElementById('fullReviewOverlay');
  if (ov) ov.remove();
  质量审查(hint, genders);
};

// ===== 质量审查：性别判定专项（只检查角色列表，不传全文） =====
window.质量审查 = function(userHint, genderFilter) {
  if (!小说提取角色列表.length) { toast('没有角色可供审查'); return; }
  小说提取步骤 = 'consolidating';
  刷新视图();

  // 按性别排序
  var sorted = 小说提取角色列表.slice().sort(function(a, b) {
    var ai = 小说提取性别顺序.indexOf(a.gender);
    var bi = 小说提取性别顺序.indexOf(b.gender);
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
  });
  // 如果指定了性别筛选，过滤角色列表
  if (genderFilter && genderFilter.length) {
    sorted = sorted.filter(function(c) { return genderFilter.indexOf(c.gender) >= 0; });
    if (!sorted.length) { toast('所选性别没有角色'); 小说提取步骤 = 'result'; 刷新视图(); return; }
  }

  // 统计角色名在原文中的出现频次（含别名），用于角色定位审查
  var rawText = 小说提取原始文本 || '';
  var freqData = {}, totalFreq = 0;
  小说提取角色列表.forEach(function(c) {
    var names = [c.name];
    // 自动拆解括号：如 "佳佳（陈佳薇）" → 同时搜 "佳佳" 和 "陈佳薇"
    var parenMatch = c.name.match(/^(.+?)[（(【](.+?)[）)】]$/);
    if (parenMatch) {
      if (parenMatch[1] && names.indexOf(parenMatch[1]) < 0) names.push(parenMatch[1]);
      if (parenMatch[2] && names.indexOf(parenMatch[2]) < 0) names.push(parenMatch[2]);
    }
    // 自动拆解分隔符：如 "伊丽莎白·洛朗" → 同时搜 "伊丽莎白" 和 "洛朗"
    // "EVA/诺玛" → "EVA" + "诺玛"，"唐三 小唐三" → "唐三" + "小唐三"
    if (/[·/\-—\s]/.test(c.name)) {
      c.name.split(/[·/\-—\s]+/).forEach(function(part) {
        if (part && names.indexOf(part) < 0) names.push(part);
      });
    }
    if (c.aliases && Array.isArray(c.aliases)) {
      c.aliases.forEach(function(a) { if (a && names.indexOf(a) < 0) names.push(a); });
    }
    var count = 0;
    names.forEach(function(n) {
      if (!n) return;
      var pos = -1;
      while ((pos = rawText.indexOf(n, pos + 1)) >= 0) count++;
    });
    freqData[c.name] = count;
    totalFreq += count;
  });
  var byFreq = 小说提取角色列表.slice().sort(function(a, b) {
    return (freqData[b.name] || 0) - (freqData[a.name] || 0);
  });
  var rankMap = {};
  byFreq.forEach(function(c, i) { rankMap[c.name] = i + 1; });

  var ALL_CHAR_FIELDS = 小说提取审查字段;
  var charList = sorted.map(function(c) {
    var parts = ['name:' + c.name, 'gender:' + c.gender, 'role:' + c.role];
    ALL_CHAR_FIELDS.slice(3).forEach(function(f) {
      if (c[f] && c[f] !== 'null') parts.push(f + ':' + String(c[f]).substring(0, 200));
    });
    var freq = freqData[c.name] || 0;
    var rank = rankMap[c.name] || '?';
    parts.push('freq:' + freq + ' rank:' + rank + '/' + 小说提取角色列表.length);
    return parts.join('  ');
  }).join('\n\n---\n\n');

  var hintBlock = userHint ? '\n\n【用户重点关注】\n' + userHint : '';
  var genderNote = (genderFilter && genderFilter.length) ? '\n\n【性别筛选】本次仅审查以下性别：' + genderFilter.map(function(g) { return (审查性别配置[g] || {}).label || g; }).join('、') + '。其他性别不在此次审查范围内。' : '';

  var _r = renderPrompt('ext_char_review', {
    角色列表: charList,
    性别筛选: genderNote,
    审查方向: hintBlock,
  });
  LLM.call({
    prompt: _r.user,
    system: _r.system,
    label: '质量审查-性别与角色定位',
  }).then(function(raw) {
    var data = null;
    try {
      var m = raw.match(/\{[\s\S]*\}/);
      if (m) data = JSON.parse(m[0]);
    } catch(e) {}
    window._reviewCorrections = (data && data.corrections) || [];
    显示审查结果面板(window._reviewCorrections, !data || !data.corrections || !data.corrections.length);
    小说提取步骤 = 'result';
    刷新视图();
    if (data && data.corrections && data.corrections.length) {
      toast('发现 ' + data.corrections.length + ' 个可能的性别判定问题');
    } else if (!data) {
      toast('⚠️ LLM 返回解析失败');
    } else {
      toast('✅ 性别判定审查完成，未发现问题');
    }
    小说提取保存当前记录();
  }).catch(function(err) {
    console.warn('性别审查失败:', err);
    小说提取步骤 = 'result';
    刷新视图();
    toast('⚠️ 审查调用失败: ' + (err.message || '未知错误'));
  });
};

// ===== 弹窗：重复审查 =====
window.小说提取填入重复审查方向 = function(el, dir) {
  document.getElementById('simpleReviewHint').value = dir;
  document.querySelectorAll('.review-dir-chip').forEach(function(c) { c.style.borderColor = ''; c.style.color = ''; c.style.background = ''; });
  el.style.borderColor = 'var(--accent)';
  el.style.color = 'var(--accent)';
  el.style.background = 'var(--accent)15';
};

window.小说提取弹出简单审查 = function() {
  if (!小说提取角色列表.length) { toast('没有角色可供审查'); return; }
  if (document.getElementById('simpleReviewOverlay')) return;
  var ov = document.createElement('div');
  ov.id = 'simpleReviewOverlay';
  ov.className = 'ovl';
  ov.innerHTML = '<div class="mcard" style="max-width:520px;width:90%">' +
    '<div style="font-size:15px;font-weight:600;margin-bottom:4px">🔍 一致性审查</div>' +
    '<div style="font-size:11px;color:var(--fg2);margin-bottom:12px">已提取 ' + 小说提取角色列表.length + ' 个角色 · 检查合并检测/性别矛盾/角色定位/数据矛盾</div>' +
    审查性别筛选HTML('simpleReviewGenderContainer') +
    '<div style="font-size:11px;font-weight:500;margin-bottom:6px;color:var(--fg);margin-top:8px">审查方向（可选）</div>' +
    '<div style="margin-bottom:6px">' +
    '<span class="review-dir-chip" onclick="小说提取填入重复审查方向(this,\'重点关注同名合并检测，检查是否有两个角色名指向同一人\')" style="cursor:pointer;font-size:10px;padding:2px 10px;border-radius:4px;border:1px solid var(--border);color:var(--fg3);user-select:none;margin-right:4px">合并检测</span>' +
    '<span class="review-dir-chip" onclick="小说提取填入重复审查方向(this,\'重点关注性别矛盾，检查gender是否与称号/描述明显矛盾\')" style="cursor:pointer;font-size:10px;padding:2px 10px;border-radius:4px;border:1px solid var(--border);color:var(--fg3);user-select:none;margin-right:4px">性别矛盾</span>' +
    '<span class="review-dir-chip" onclick="小说提取填入重复审查方向(this,\'重点关注角色定位，检查role是否与剧情占比相符\')" style="cursor:pointer;font-size:10px;padding:2px 10px;border-radius:4px;border:1px solid var(--border);color:var(--fg3);user-select:none;margin-right:4px">角色定位</span>' +
    '<span class="review-dir-chip" onclick="小说提取填入重复审查方向(this,\'重点关注数据矛盾，检查年龄、种族、职业等字段是否有明显矛盾\')" style="cursor:pointer;font-size:10px;padding:2px 10px;border-radius:4px;border:1px solid var(--border);color:var(--fg3);user-select:none;margin-right:4px">数据矛盾</span>' +
    '</div>' +
    '<div style="font-size:10px;color:var(--fg3);margin-bottom:8px">例如：重点关注同名合并检测 / 检查女性角色是否有误标</div>' +
    '<textarea id="simpleReviewHint" class="llm-input" rows="3" style="width:100%;font-size:12px;resize:vertical;font-family:inherit" placeholder="留空则进行四项常规检查……"></textarea>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">' +
    '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>' +
    '<button class="btn-main" onclick="小说提取确认简单审查()">🔍 开始审查</button>' +
    '</div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
};

window.小说提取确认简单审查 = function() {
  var hintInput = document.getElementById('simpleReviewHint');
  var hint = hintInput ? hintInput.value.trim() : '';
  var genders = 审查获取选中性别('simpleReviewGenderContainer');
  var ov = document.getElementById('simpleReviewOverlay');
  if (ov) ov.remove();
  小说提取简单审查(hint, genders);
};

// ===== 重复审查：仅检查已提取角色的一致性（含合并检测 + 选择性修正） =====
window.小说提取简单审查 = function(userHint, genderFilter) {
  if (!小说提取角色列表.length) { toast('没有角色可供审查'); return; }

  var sorted = 小说提取角色列表.slice().sort(function(a, b) {
    var ai = 小说提取性别顺序.indexOf(a.gender);
    var bi = 小说提取性别顺序.indexOf(b.gender);
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
  });
  if (genderFilter && genderFilter.length) {
    sorted = sorted.filter(function(c) { return genderFilter.indexOf(c.gender) >= 0; });
    if (!sorted.length) { toast('所选性别没有角色'); return; }
  }
  var ALL_CHAR_FIELDS = 小说提取审查字段;
  var charList = sorted.map(function(c) {
    var parts = ['name:' + c.name, 'gender:' + c.gender, 'role:' + c.role];
    ALL_CHAR_FIELDS.slice(3).forEach(function(f) {
      if (c[f] && c[f] !== 'null') parts.push(f + ':' + String(c[f]).substring(0, 200));
    });
    return parts.join('  ');
  }).join('\n\n---\n\n');

  var hintBlock = userHint ? '\n\n【用户重点关注】\n' + userHint : '';
  var genderNote = (genderFilter && genderFilter.length) ? '\n\n【性别筛选】本次仅审查以下性别：' + genderFilter.map(function(g) { return (审查性别配置[g] || {}).label || g; }).join('、') + '。其他性别不在此次审查范围内。' : '';

  var _r = renderPrompt('ext_char_review_simple', {
    角色列表: charList,
    审查方向: hintBlock,
    性别筛选: genderNote,
  });


  LLM.callJSON({
    prompt: _r.user,
    system: _r.system,
    label: '重复审查-角色一致性',
    temperature: 0.2,
  }).then(function(data) {
    window._reviewCorrections = (data && data.corrections) || [];
    显示审查结果面板(window._reviewCorrections, !data || !data.corrections || !data.corrections.length);
    if (data && data.corrections && data.corrections.length) {
      // 正常显示修正
    } else if (!data) {
      toast('⚠️ LLM 返回内容解析失败，请重试或查看控制台');
    }
  }).catch(function(err) {
    console.warn('重复审查 LLM 调用失败:', err);
    toast('⚠️ 审查调用失败: ' + (err.message || '未知错误'));
  });
};
