// ===== 主渲染函数：上传区始终可见，结果区始终存在 =====
function 渲染小说提取面板() {
  // 顶部 tab 切换
  var h = '<div style="display:flex;gap:0;margin:0;border-bottom:1px solid var(--bd)">';
  h += '<div onclick="小说提取切换视图(\'upload\')" style="padding:8px 16px;font-size:12px;cursor:pointer;border-bottom:2px solid ' + (小说提取视图 === 'upload' ? 'var(--accent)' : 'transparent') + ';color:' + (小说提取视图 === 'upload' ? 'var(--fg)' : 'var(--fg3)') + ';font-weight:' + (小说提取视图 === 'upload' ? '600' : '400') + '">📤 提取新角色</div>';
  h += '<div onclick="小说提取切换视图(\'history\')" style="padding:8px 16px;font-size:12px;cursor:pointer;border-bottom:2px solid ' + (小说提取视图 === 'history' ? 'var(--accent)' : 'transparent') + ';color:' + (小说提取视图 === 'history' ? 'var(--fg)' : 'var(--fg3)') + ';font-weight:' + (小说提取视图 === 'history' ? '600' : '400') + '">📚 历史提取</div>';
  h += '<div onclick="小说提取切换视图(\'overview\')" style="padding:8px 16px;font-size:12px;cursor:pointer;border-bottom:2px solid ' + (小说提取视图 === 'overview' ? 'var(--accent)' : 'transparent') + ';color:' + (小说提取视图 === 'overview' ? 'var(--fg)' : 'var(--fg3)') + ';font-weight:' + (小说提取视图 === 'overview' ? '600' : '400') + '">👥 角色提取总览</div>';
  h += '</div>';

  if (小说提取视图 === 'history') {
    h += 小说渲染历史面板();
    return h;
  }

  if (小说提取视图 === 'overview') {
    h += window.小说渲染总览面板();
    return h;
  }

  h += window.小说渲染上传区();

  if (小说提取步骤 === 'analyzing' || 小说提取步骤 === 'consolidating' || 小说提取步骤 === 'paused') {
    h += 小说渲染提取中();
  }

  h += 小说渲染结果区();

  return h;
}

// ===== 上传区 =====
window.小说渲染上传区 = function() {
  var h = '<div style="padding:20px;max-width:700px">';

  // 拖放上传
  h += '<div id="novelDropZone" style="border:2px dashed var(--border);border-radius:8px;padding:32px;text-align:center;cursor:pointer;background:var(--bg2);margin-bottom:12px;transition:border-color 0.2s"';
  h += ' ondragover="event.preventDefault();this.style.borderColor=\'var(--accent)\'"';
  h += ' ondragleave="this.style.borderColor=\'var(--border)\'"';
  h += ' ondrop="event.preventDefault();小说提取加载文件(event.dataTransfer.files[0])"';
  h += ' onclick="document.getElementById(\'novelFileInput\').click()">';
  h += '<div style="font-size:30px;margin-bottom:6px">📂</div>';
  h += '<div style="font-size:12px;color:var(--fg2)">点击选择 .txt 文件 或 拖拽文件到这里</div>';
  h += '</div>';
  h += '<input type="file" id="novelFileInput" accept=".txt" style="display:none" onchange="小说提取加载文件(this.files[0])">';

  // 分割
  h += '<div style="display:flex;align-items:center;gap:8px;margin:12px 0">';
  h += '<hr style="flex:1;border:none;border-top:1px solid var(--border)">';
  h += '<span style="font-size:10px;color:var(--fg3);flex-shrink:0">或直接粘贴</span>';
  h += '<hr style="flex:1;border:none;border-top:1px solid var(--border)"></div>';

  // 粘贴区
  h += '<textarea id="novelPasteArea" rows="10" class="llm-input" style="width:100%;resize:vertical;font-size:12px;line-height:1.8;font-family:inherit" placeholder="在此粘贴小说文本内容……&#10;&#10;提示：建议至少 1000 字，越长提取越准确"></textarea>';

  // 错误提示
  if (小说提取步骤 === 'error') {
    h += '<div style="color:var(--err);font-size:11px;margin:6px 0">⚠️ 提取失败，请检查文本内容后重试</div>';
  }

  // 按钮
  h += '<div class="flex gap-8 mt-10" style="display:flex;gap:8px">';
  h += '<button class="btn flex-1" onclick="小说提取开始分析()" style="flex:1">🤖 分析提取角色</button>';
  h += '<button class="btn-out" onclick="小说提取打开针对性提取()" style="font-size:11px;white-space:nowrap">🎯 针对性提取</button>';
  h += '<button class="btn-out btn-sm" onclick="document.getElementById(\'novelPasteArea\').value=\'\'" style="font-size:11px">🗑️ 清空</button>';
  h += '</div>';

  h += '<div style="display:flex;align-items:center;gap:6px;margin-top:8px">';
  h += '<label style="font-size:10px;color:var(--fg3)">分段上限：</label>';
  h += '<input id="chunkLimitInput" type="number" min="0" max="100" value="0" style="width:60px;font-size:11px;padding:2px 4px;background:var(--bg2);border:1px solid var(--border);border-radius:3px;color:var(--fg)">';
  h += '<span style="font-size:9px;color:var(--fg3)">（0=不限，超限自动暂停保存进度，下次可继续）</span>';
  h += '</div>';

  h += '<div style="font-size:10px;color:var(--fg3);margin-top:8px">💡 云端模型逐段分析，每段约 12 万字，覆盖全文后合并去重。</div>';
  h += '</div>';

  return h;
};

// ===== 提取中 / 暂停（显示分段分析进度） =====
function 小说渲染提取中() {
  var 是否是校验阶段 = 小说提取步骤 === 'consolidating';
  var 是否是暂停 = 小说提取步骤 === 'paused';
  var h = '<div style="padding:20px;text-align:center;color:var(--fg2);background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius)">';

  if (是否是暂停) {
    var total = 小说提取分析进度.total || 0;
    var done = 小说提取分析进度.done || 0;
    var pct = total > 0 ? Math.round(done / total * 100) : 0;
    h += '<div style="font-size:32px;margin-bottom:12px">⏸️</div>';
    h += '<div style="font-size:13px">分析已暂停（已完成 ' + done + '/' + total + ' 段）</div>';
    if (total > 0) {
      h += '<div style="height:4px;background:var(--bg2);border-radius:2px;overflow:hidden;max-width:300px;margin:8px auto 0">';
      h += '<div style="height:100%;width:' + pct + '%;background:var(--accent);border-radius:2px"></div></div>';
    }
    h += '<div style="margin-top:12px">';
    h += '<button class="btn" onclick="小说提取继续分析()" style="font-size:13px">▶️ 继续分析（第' + (done + 1) + '/' + total + '段）</button>';
    h += '</div>';
  } else {
    h += '<div style="font-size:32px;margin-bottom:12px">' + (是否是校验阶段 ? '✨' : '🔍') + '</div>';
    h += '<div style="font-size:13px">' + (是否是校验阶段 ? 'AI 正在校验并完善提取结果...' : 'AI 正在分段分析剧情，提取角色中...') + '</div>';

    if (是否是校验阶段) {
    var progress = 小说提取审查进度 || { done: 0, total: 0, processing: false };
    if (progress.processing || progress.done === 0) {
      h += '<div style="font-size:11px;color:var(--fg3);margin-top:8px">综合全文逐段检查遗漏角色...</div>';
      if (progress.total > 0 && progress.done > 0) {
        h += '<div style="font-size:11px;color:var(--fg3);margin-top:4px">已完成 ' + progress.done + '/' + progress.total + ' 段</div>';
      }
    } else if (progress.done > 0 && progress.done < progress.total) {
      h += '<div style="font-size:12px;color:var(--fg3);margin-top:10px">已完成 ' + progress.done + '/' + progress.total + ' 段检验</div>';
      h += '<div style="margin-top:10px">';
      h += '<button class="btn" onclick="小说提取继续校验()" style="font-size:13px">继续检验下一段（' + (progress.done + 1) + '/' + progress.total + '）</button>';
      h += '</div>';
    }
  } else {
    var total = 小说提取分析进度.total || 0;
    var done = 小说提取分析进度.done || 0;
    var pct = total > 0 ? Math.round(done / total * 100) : 0;
    if (total > 0) {
      h += '<div style="font-size:11px;color:var(--fg3);margin-top:4px">已完成 ' + done + '/' + total + ' 段</div>';
      h += '<div style="height:4px;background:var(--bg2);border-radius:2px;overflow:hidden;max-width:300px;margin:8px auto 0">';
      h += '<div style="height:100%;width:' + pct + '%;background:var(--accent);border-radius:2px;transition:width 0.3s"></div>';
      h += '</div>';
      h += '<div style="margin-top:10px">';
      h += '<button class="btn-out btn-sm" onclick="小说提取暂停分析()" style="font-size:13px;border-color:var(--warning);color:var(--warning)">⏸️ 暂停</button>';
      h += '</div>';
    } else {
      h += '<div style="font-size:11px;color:var(--fg3);margin-top:6px">请稍候，正在准备文本分段</div>';
    }
  }
  }

  h += '</div>';
  return h;
}

// ===== 结果区（始终存在，无角色时显示占位） =====
function 小说渲染结果区() {
  var h = '<div style="border-top:1px solid var(--border);margin:0 20px;padding-top:16px;padding-bottom:20px">';

  var 有角色 = 小说提取角色列表.length > 0;
  var descCount = Object.keys(小说提取角色描述).length;

  // 顶栏：标题始终显示
  h += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;flex-wrap:wrap;gap:8px">';
  h += '<div>';
  h += '<div style="font-size:14px;font-weight:600">📖 提取的角色';
  if (有角色) {
    h += ' <span style="font-weight:400;color:var(--fg3);font-size:12px">' + 小说提取角色列表.length + '</span>';
  }
  if (descCount > 0) {
    h += ' <span style="font-weight:400;color:var(--accent);font-size:11px">（' + descCount + ' 个已生成描述）</span>';
  }
  h += '</div></div>';

  h += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
  if (有角色) {
    h += '<button class="btn-out btn-sm" onclick="小说提取弹出审查校验()" style="font-size:11px">🔍 质量审查</button>';
    h += '<button class="btn-out btn-sm" onclick="小说提取弹出简单审查()" style="font-size:11px">🔍 重复审查</button>';
  }
  h += '<button class="btn-out btn-sm" onclick="小说提取重置()" style="font-size:11px">← 重新上传</button>';
  h += '</div></div>';

  // 分类设置入口
  if (有角色 && 小说提取步骤 === 'result' && 小说提取当前记录标题) {
    var _catEntry = window._小说提取历史列表 ? window._小说提取历史列表.reduce(function(found, e) {
      return (e.title === 小说提取当前记录标题) ? e : found;
    }, null) : null;
    var _cat = _catEntry ? _catEntry.category : null;
    h += '<div style="display:flex;align-items:center;gap:6px;margin:-4px 0 8px 0;font-size:11px;color:var(--fg3)">';
    h += '📁 ';
    if (_cat && (_cat.type || _cat.origin)) {
      if (_cat.type) h += '<span style="background:' + (_cat.type === '色情' ? 'var(--accent2)' : 'var(--green)') + '20;color:' + (_cat.type === '色情' ? 'var(--accent2)' : 'var(--green)') + ';padding:1px 6px;border-radius:3px;font-weight:500">' + _cat.type + '</span> ';
      if (_cat.origin) h += '<span style="background:' + (_cat.origin === '同人' ? 'var(--purple)' : 'var(--blue)') + '20;color:' + (_cat.origin === '同人' ? 'var(--purple)' : 'var(--blue)') + ';padding:1px 6px;border-radius:3px;font-weight:500">' + _cat.origin + '</span> ';
    } else {
      h += '未分类 ';
    }
    if (小说提取当前记录ID) {
      var _fk = 本地FS.清理(小说提取当前记录标题) || 小说提取当前记录ID;
      h += '<span class="btn-out btn-sm" onclick="小说提取弹出分类(\'' + _fk + '\')" style="font-size:10px;padding:1px 8px;cursor:pointer">✏️ 分类</span>';
    }
    h += '</div>';
  }

  // 无角色：占位
  if (!有角色 && 小说提取步骤 !== 'analyzing') {
    h += '<div style="padding:30px;text-align:center;color:var(--fg3);font-size:12px">暂无提取的角色，请上传小说或粘贴文本后点击「分析提取角色」</div>';
    h += '</div>';
    return h;
  }

  // 有角色：按性别分组渲染
  var groups = {};
  小说提取角色列表.forEach(function(c) {
    if (!groups[c.gender]) groups[c.gender] = [];
    groups[c.gender].push(c);
  });

  小说提取性别顺序.forEach(function(g) {
    if (!groups[g] || !groups[g].length) return;
    var cfg = 小说提取性别配置[g] || { label: g, icon: '❓', color: 'var(--fg3)' };

    h += '<div class="card" style="padding:10px 12px;margin-bottom:8px;border-left:3px solid ' + cfg.color + '">';
    h += '<div onclick="小说提取切换性别折叠(\'' + g + '\')" style="cursor:pointer;font-size:11px;font-weight:600;margin-bottom:6px;color:' + cfg.color + ';user-select:none">';
    h += '<span style="display:inline-block;transition:transform 0.2s;' + (小说提取性别折叠[g] ? '' : 'transform:rotate(90deg)') + '">▶</span> ';
    h += cfg.icon + ' ' + cfg.label + ' <span style="font-weight:400;color:var(--fg3)">' + groups[g].length + '</span></div>';
    h += '<div id="novelGenderGroup_' + g + '" style="display:' + (小说提取性别折叠[g] ? 'none' : 'block') + '">';

    groups[g].sort(function(a, b) {
      var w = { '主角': 3, '主配': 2.5, '配角': 2, '龙套': 1 };
      return (w[b.role] || 0) - (w[a.role] || 0);
    }).forEach(function(c) {
      var hasDesc = !!小说提取角色描述[c.name];
      var isGenerating = 小说提取生成中[c.name] === true;
      var desc = 小说提取角色描述[c.name];

      h += 小说渲染角色卡片行(c, { hasDesc: hasDesc, isGenerating: isGenerating, desc: desc, isStage: false });
    });

    h += '</div></div>';
  });

  h += '</div>';
  return h;
}
