// 生图词典 · ② 本地批量提示词 tab
// 依赖：entry.js（STCD/stcdModeChips/stcdCharBoxHTML/stcdGen）；picker.js（角色选择器）

function stcdRenderBatch(el) {
  var h = '';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start">';
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px">';
  h += '<div style="font-size:14px;color:var(--fg);font-weight:700;margin-bottom:4px">📦 批量创作要求</div>';
  h += '<div style="font-size:11px;color:var(--fg3);margin-bottom:8px">本地工具无审查，直白自由</div>';
  h += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px">';
  h += '<span class="preset-chip' + (STCD.batchMode === 'multi' ? ' preset-active' : '') + '" onclick="stcdBatchMode(\'multi\')">多主题批量</span>';
  h += '<span class="preset-chip' + (STCD.batchMode === 'variant' ? ' preset-active' : '') + '" onclick="stcdBatchMode(\'variant\')">一主题多组变体</span>';
  h += '</div>';
  h += stcdModeChips();
  h += stcdCharBoxHTML('stcd-batch-char');
  if (STCD.batchMode === 'multi') {
    h += '<div style="font-size:11px;color:var(--fg3);margin-bottom:4px">每行一个主题，AI 逐行生成独立提示词</div>';
    h += '<textarea id="stcd-batch-require" class="llm-input" style="width:100%;min-height:140px;resize:vertical" placeholder="例：&#10;少女躺在丝绸上&#10;御姐穿皮衣&#10;教室里的师生"></textarea>';
  } else {
    h += '<div style="font-size:11px;color:var(--fg3);margin-bottom:4px">填一个主题，AI 生成 4-6 组不同角度变体</div>';
    h += '<textarea id="stcd-batch-require" class="llm-input" style="width:100%;min-height:80px;resize:vertical" placeholder="例：御姐穿黑丝，高跟鞋"></textarea>';
  }
  h += '<div style="display:flex;gap:8px;margin-top:12px">';
  h += '<button class="btn-main" onclick="stcdGen(\'batch\')">🤖 批量生成</button>';
  h += '<button class="btn-out" onclick="document.getElementById(\'stcd-batch-require\').value=\'\'">清空</button>';
  h += '</div>';
  h += '</div>';
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px">';
  h += '<div style="font-size:13px;color:var(--fg);font-weight:600;margin-bottom:6px">🖼 批量结果</div>';
  h += '<div id="stcd-batch-list"></div>';
  h += '</div>';
  h += '</div>';
  el.innerHTML = h;
  if (STCD.batchResult && STCD.batchResult.length) stcdBatchFill(STCD.batchResult);
}

function stcdBatchMode(mode) {
  STCD.batchMode = mode;
  stcdRenderBatch(document.getElementById('stcdTabContent'));
}

function stcdBatchFill(items) {
  var el = document.getElementById('stcd-batch-list');
  if (!el) return;
  STCD.batchResult = items || [];
  if (!STCD.batchResult.length) { el.innerHTML = '<div style="font-size:12px;color:var(--fg3)">暂无结果</div>'; return; }
  var h = '';
  STCD.batchResult.forEach(function(item, i) {
    var label = item.topic || item.variant || ('第 ' + (i + 1) + ' 组');
    h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:8px">';
    h += '<div style="display:flex;align-items:center;margin-bottom:4px">';
    h += '<div style="font-size:12px;color:var(--accent);font-weight:600;flex:1">' + escHtml(label) + '</div>';
    h += '<button class="btn-out" style="padding:2px 8px;font-size:10px" onclick="stcdBatchCollect(\'' + i + '\')">⭐ 收藏</button>';
    h += '<button class="btn-out" style="padding:2px 8px;font-size:10px" onclick="stcdCopyText(this,\'' + i + '\')">📋 复制</button>';
    h += '</div>';
    h += '<textarea class="llm-input" style="width:100%;min-height:50px;resize:vertical;font-size:11px" readonly>' + escHtml(item.prompt || '') + '</textarea>';
    if (item.prompt_cn) {
      h += '<div style="font-size:10px;color:var(--fg2);margin-top:4px">中文：' + escHtml(item.prompt_cn) + '</div>';
    }
    if (item.zh) {
      h += '<div style="font-size:10px;color:var(--fg3);margin-top:2px">解释：' + escHtml(item.zh) + '</div>';
    }
    h += '</div>';
  });
  el.innerHTML = h;
}

function stcdBatchCollect(idx) {
  var items = STCD.batchResult || [];
  var item = items[parseInt(idx)];
  if (!item || !item.prompt) { toast('没有可收藏的提示词'); return; }
  if (typeof stcdAddToDict === 'function') {
    stcdAddToDict(item.prompt.trim(), item.zh || item.topic || item.variant || '');
  } else {
    toast('词库未就绪');
  }
}

function stcdCopyText(btn, idx) {
  var items = STCD.batchResult || [];
  var item = items[parseInt(idx)];
  if (!item || !item.prompt) { toast('没有可复制的内容'); return; }
  复制到剪贴板(item.prompt.trim()).then(function(ok) {
    toast(ok ? '已复制' : '复制失败');
  });
}

window.stcdBatchMode = stcdBatchMode;
window.stcdCopyText = stcdCopyText;
window.stcdBatchCollect = stcdBatchCollect;
