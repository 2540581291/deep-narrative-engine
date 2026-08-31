// 深度-叙事引擎 · 角色卡 · 📖 小说提取 · 性爱明细生成
// 单个重生成角色性爱明细（直接覆盖回角色数据）

// ===== 弹窗：单个生成角色性爱明细 =====
window.小说提取弹出生成单个描述 = function(name) {
  if (document.getElementById('genDescSingleOverlay')) return;
  var ov = document.createElement('div');
  ov.id = 'genDescSingleOverlay';
  ov.className = 'ovl';
  ov.innerHTML = '<div class="mcard" style="max-width:520px;width:90%">' +
    '<div style="font-size:15px;font-weight:600;margin-bottom:4px">📝 生成性爱明细</div>' +
    '<div style="font-size:11px;color:var(--fg2);margin-bottom:14px">角色：' + escHtml(name) + ' · 将按原文重新生成性爱明细，结果直接覆盖原数据</div>' +
    '<div style="font-size:11px;font-weight:500;margin-bottom:6px;color:var(--fg)">生成方向（可选）</div>' +
    '<div style="font-size:10px;color:var(--fg3);margin-bottom:8px">例如：重点描写被调教/被开发的情节 / 聚焦与特定对象之间的性经历</div>' +
    '<textarea id="genDescSingleHint" class="llm-input" rows="5" style="width:100%;font-size:12px;resize:vertical;font-family:inherit" placeholder="留空则按默认方式生成……"></textarea>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">' +
    '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>' +
    '<button class="btn-main" onclick="小说提取确认生成单个描述(\'' + escHtml(name) + '\')">🚀 确认生成</button>' +
    '</div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
};

window.小说提取确认生成单个描述 = function(name) {
  var hintInput = document.getElementById('genDescSingleHint');
  var hint = hintInput ? hintInput.value.trim() : '';
  var ov = document.getElementById('genDescSingleOverlay');
  if (ov) ov.remove();
  小说提取生成单个描述(name, hint);
};

// ===== 单个生成角色描述 =====