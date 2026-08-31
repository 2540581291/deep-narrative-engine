// ===== 审查结果浮动面板（小弹窗，不遮挡原文） =====
function 显示审查结果面板(corrections, noIssues) {
  var existing = document.getElementById('reviewResultPanel');
  if (existing) existing.remove();

  var panel = document.createElement('div');
  panel.id = 'reviewResultPanel';
  panel.style.cssText = 'position:fixed;top:80px;right:24px;width:440px;max-height:72vh;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);box-shadow:0 8px 32px rgba(0,0,0,0.5);z-index:2500;display:flex;flex-direction:column;font-size:13px;overflow:hidden';

  var h = '';

  // Header
  h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border);flex-shrink:0">';
  h += '<div><span style="font-weight:600">🔍 ' + (noIssues ? '审查完成' : '审查发现问题') + '</span>';
  if (!noIssues) h += '<span style="margin-left:8px;color:var(--fg3);font-size:12px">' + corrections.length + ' 项</span>';
  h += '</div>';
  h += '<span onclick="window.关闭审查面板()" style="cursor:pointer;color:var(--fg3);font-size:16px;line-height:1;padding:2px 6px;border-radius:3px">✕</span></div>';

  // Body
  h += '<div style="flex:1;overflow-y:auto;padding:10px 14px">';

  // 用户修改意见输入
  h += '<div style="margin-bottom:10px;background:var(--card-bg);border:1px solid var(--border);border-radius:6px;padding:8px 10px">';
  h += '<label style="font-size:11px;color:var(--fg3);display:block;margin-bottom:4px">✏️ 修改意见（可选，输入后点「按意见重新审查」）</label>';
  h += '<textarea id="review_user_input" class="llm-input" style="width:100%;min-height:50px;resize:vertical;font-size:12px;font-family:inherit" placeholder="例如：不要把小明合并到王小明，他们是双胞胎兄弟"></textarea>';
  h += '</div>';

  if (noIssues) {
    h += '<div style="text-align:center;padding:20px 0;color:var(--fg3);font-size:13px">✅ 未发现问题，可输入修改意见后点「按意见重新审查」进行手动调整</div>';
  } else {
    corrections.forEach(function(c, i) {
      var isMerge = c.type === 'merge';
      var badgeColor = isMerge ? 'var(--purple)' : 'var(--accent2)';
      var badgeText = isMerge ? '合并' : '修正';
      h += '<div style="background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:10px 12px;margin-bottom:10px;border-left:3px solid ' + badgeColor + '">';
      h += '<div style="display:flex;align-items:flex-start;gap:8px">';
      h += '<input type="checkbox" id="review_chk_' + i + '" style="margin-top:3px;accent-color:' + badgeColor + ';flex-shrink:0;width:20px;height:32px">';
      h += '<div style="flex:1;min-width:0">';
      h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">';
      h += '<span style="font-size:10px;padding:1px 7px;border-radius:3px;background:' + badgeColor + '20;color:' + badgeColor + ';font-weight:600">' + badgeText + '</span>';
      if (isMerge) {
        h += '<span style="font-weight:500;font-size:13px">「' + escHtml(c.name) + '」→「' + escHtml(c.mergeInto) + '」</span>';
      } else {
        h += '<span style="font-weight:500;font-size:13px">' + escHtml(c.name) + '：' + escHtml(c.field) + ' → ' + escHtml(c.value) + '</span>';
      }
      h += '</div>';
      h += '<div style="color:var(--fg2);font-size:12px;line-height:1.6;margin-bottom:3px">';
      h += escHtml(c.problem || (isMerge ? '角色「' + c.name + '」与「' + c.mergeInto + '」可能为同一人' : '角色「' + c.name + '」的字段需要修正'));
      h += '</div>';
      if (c.suggestion) {
        h += '<div style="color:var(--fg3);font-size:11px;margin-top:2px">💡 ' + escHtml(c.suggestion) + '</div>';
      }
      h += '</div></div></div>';
    });
  }

  h += '</div>';

  // Footer
  h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-top:1px solid var(--border);flex-shrink:0;gap:8px">';
  h += '<div style="display:flex;gap:6px">';
  if (!noIssues) {
    h += '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;padding:4px 0;font-size:12px;color:var(--fg2);user-select:none">';
    h += '<input type="checkbox" id="review_chk_select_all" style="width:18px;height:18px;accent-color:var(--accent);margin:0" onchange="var c=this.checked;document.querySelectorAll(\'[id^=review_chk_]\').forEach(function(e){e.checked=c})">';
    h += '全选';
    h += '</label>';
  }
  h += '<button class="btn-out" onclick="window.重新审查按意见()" style="font-size:11px;padding:6px 12px">🔄 按意见重新审查</button>';
  h += '</div>';
  if (!noIssues) {
    h += '<button class="btn-main" onclick="window.应用审查修正()" style="font-size:12px;padding:6px 18px">✓ 应用选中修正</button>';
  }
  h += '</div>';

  panel.innerHTML = h;
  document.body.appendChild(panel);
}

window.关闭审查面板 = function() {
  var el = document.getElementById('reviewResultPanel');
  if (el) el.remove();
  window._reviewCorrections = null;
};

window.应用审查修正 = function() {
  try {
    var corrections = window._reviewCorrections;
    if (!corrections || !corrections.length) { 关闭审查面板(); return; }

    var selected = [];
    corrections.forEach(function(c, i) {
      var chk = document.getElementById('review_chk_' + i);
      if (chk && chk.checked) selected.push(c);
    });

    if (!selected.length) { toast('请至少选择一项修正'); return; }

    selected.forEach(function(c) {
      if (c.type === 'merge') {
        var srcName = c.name;
        var tgtName = c.mergeInto;
        小说提取角色列表 = 小说提取角色列表.filter(function(ch) { return ch.name !== srcName; });
        if (小说提取角色描述[srcName]) {
          if (!小说提取角色描述[tgtName]) 小说提取角色描述[tgtName] = {};
          Object.keys(小说提取角色描述[srcName]).forEach(function(k) {
            if (!小说提取角色描述[tgtName][k]) 小说提取角色描述[tgtName][k] = 小说提取角色描述[srcName][k];
          });
          delete 小说提取角色描述[srcName];
        }
        // 从磁盘删除被合并角色的文件
        if (小说提取当前记录ID) {
          var _folderName = 本地FS.清理(小说提取当前记录标题) || 小说提取当前记录ID;
          LocalFS.delete(小说提取存储基路径 + _folderName + "/" + 本地FS.清理(srcName) + ".json").catch(function() {});
        }
      } else if (c.type === 'fix') {
        var nameMatch = c.name.trim();
        var found = 小说提取角色列表.some(function(ch) {
          if (ch.name.trim() === nameMatch) { ch[c.field] = c.value; return true; }
        });
        if (!found) console.warn('应用修正: 未找到角色「' + c.name + '」');
      }
    });

    try { 小说提取保存当前记录(); } catch(e) { console.warn('保存失败（预览环境？）:', e); }
    window.关闭审查面板();
    刷新视图();
    toast('✅ 已应用 ' + selected.length + ' 项修正');
  } catch(err) {
    console.error('应用修正出错:', err);
    toast('⚠️ 应用修正失败: ' + (err.message || '未知错误'));
  }
};
