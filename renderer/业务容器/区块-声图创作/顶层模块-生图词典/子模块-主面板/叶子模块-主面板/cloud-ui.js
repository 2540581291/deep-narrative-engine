// 生图词典 · ④ 云端提示词 tab（Midjourney 过审改写 + 禁用词预设管理）
// 依赖：entry.js（STCD/stcdModeChips/stcdCharBoxHTML/stcdResultHTML/stcdGen）；picker.js；dict-data.js（stcdLoadBanned/stcdSaveBannedFile/stcdCurrentBannedPreset/STCD_DICT）

function stcdRenderCloud(el) {
  // 先加载禁用词文件（异步），再渲染
  if (typeof stcdLoadBanned === 'function') {
    stcdLoadBanned().then(function() { stcdRenderCloudInner(el); });
  } else {
    stcdRenderCloudInner(el);
  }
}

function stcdRenderCloudInner(el) {
  if (!el) return;
  // 数据全部来自磁盘文件（stcdLoadBanned 已保证 banned 结构完整）
  var banned = (STCD_DICT && STCD_DICT.banned) || { presets: { '默认预设': { words: '', note: '' }, '自定义': { words: '', note: '' } }, active: '默认预设' };
  var presets = banned.presets || {};
  var activeName = banned.active || '默认预设';
  var activePreset = presets[activeName] || {};
  var isDefault = activeName === '默认预设';
  var isCustom = activeName === '自定义';
  var h = '';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start">';
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px">';
  h += '<div style="font-size:14px;color:var(--fg);font-weight:700;margin-bottom:4px">✍️ 云端创作要求</div>';
  h += '<div style="font-size:11px;color:var(--fg3);margin-bottom:8px">直接写你想生成的画面，AI 会改写为 Midjourney 能过审的隐晦提示词</div>';
  h += stcdModeChips();
  h += stcdCharBoxHTML('stcd-cloud-char');
  h += '<textarea id="stcd-cloud-require" class="llm-input" style="width:100%;min-height:100px;resize:vertical" placeholder="例：一个裸体女人躺在床上，眼神迷离"></textarea>';
  // 提示词要求栏：默认预设 / 自定义 / 命名预设（两段内容：生成要求 + 禁止词）
  h += '<div style="margin-top:12px;border-top:1px dashed var(--border);padding-top:10px">';
  h += '<div style="font-size:12px;color:var(--fg);font-weight:600;margin-bottom:6px">📋 提示词要求</div>';
  h += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px">';
  // 固定：默认预设
  h += '<span class="preset-chip' + (isDefault ? ' preset-active' : '') + '" onclick="stcdBannedMode(\'默认预设\')">🛡 默认预设</span>';
  // 固定：自定义
  h += '<span class="preset-chip' + (isCustom ? ' preset-active' : '') + '" onclick="stcdBannedMode(\'自定义\')">✏️ 自定义</span>';
  // 动态：已保存的命名预设
  Object.keys(presets).forEach(function(name) {
    if (name === '默认预设' || name === '自定义') return;
    var active = name === activeName;
    h += '<span class="preset-chip' + (active ? ' preset-active' : '') + '" onclick="stcdBannedMode(\'' + stcdAttrEscape(name) + '\')">⭐ ' + escHtml(name) + '</span>';
  });
  h += '</div>';
  if (isDefault) {
    // 默认预设：只读展示内置内容（生成要求在上，禁止词在下）
    h += '<div style="font-size:11px;color:var(--fg2);margin-bottom:3px">📝 生成要求（AI 生成时须遵守的说明）</div>';
    h += '<div style="font-size:11px;color:var(--fg3);line-height:1.6;background:var(--bg2);border-radius:6px;padding:6px 8px">' + escHtml(activePreset.note || '') + '</div>';
    h += '<div style="font-size:11px;color:var(--fg2);margin:10px 0 3px">🚫 禁止出现的词（禁止词，AI 生成时绝不用这些词）</div>';
    h += '<div style="font-size:11px;color:var(--fg3);line-height:1.6;background:var(--bg2);border-radius:6px;padding:6px 8px;word-break:break-all">' + escHtml(activePreset.words || '') + '</div>';
    h += '<div style="display:flex;gap:8px;margin-top:8px">';
    h += '<button class="btn-out" style="padding:3px 12px;font-size:11px" onclick="stcdResetBanned()">恢复默认预设</button>';
    h += '</div>';
    h += '<div style="font-size:10px;color:var(--fg3);margin-top:6px">切到「自定义」可编辑并保存自己的提示词要求</div>';
  } else {
    // 自定义 / 命名预设：可编辑两段内容（生成要求在上，禁止词在下）
    h += '<div style="font-size:11px;color:var(--fg2);margin-bottom:3px">📝 生成要求（AI 生成时须遵守的说明）</div>';
    h += '<textarea id="stcd-cloud-banned-note" class="llm-input" style="width:100%;min-height:40px;resize:vertical;font-size:11px" placeholder="例：这些词绝不允许出现在输出中">' + escHtml(activePreset.note || '') + '</textarea>';
    h += '<div style="font-size:11px;color:var(--fg2);margin:10px 0 3px">🚫 禁止出现的词（禁止词，AI 生成时绝不用这些词）</div>';
    h += '<textarea id="stcd-cloud-banned" class="llm-input" style="width:100%;min-height:60px;resize:vertical;font-size:11px" placeholder="每行一个禁止词，AI 生成时绝不用这些词">' + escHtml(activePreset.words || '') + '</textarea>';
    h += '<div style="display:flex;gap:8px;margin-top:8px">';
    h += '<button class="btn-main" style="padding:3px 12px;font-size:11px" onclick="stcdSaveBanned()">' + (isCustom ? '💾 命名并保存' : '💾 保存预设') + '</button>';
    if (!isCustom) {
      h += '<button class="btn-out" style="padding:3px 12px;font-size:11px" onclick="stcdDeleteBannedPreset()">🗑 删除此预设</button>';
    }
    h += '<button class="btn-out" style="padding:3px 12px;font-size:11px" onclick="stcdResetBanned()">恢复默认预设</button>';
    h += '</div>';
  }
  h += '</div>';
  h += '<div style="display:flex;gap:8px;margin-top:12px">';
  h += '<button class="btn-main" onclick="stcdGen(\'cloud\')">🤖 生成过审提示词</button>';
  h += '<button class="btn-out" onclick="document.getElementById(\'stcd-cloud-require\').value=\'\'">清空</button>';
  h += '</div>';
  h += '</div>';
  h += '<div>' + stcdResultHTML('stcd-cloud') + '</div>';
  h += '</div>';
  el.innerHTML = h;
}

// 预设名写入 onclick 属性时的转义（防引号/标签注入）
function stcdAttrEscape(s) {
  return (s + '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function stcdBannedMode(name) {
  if (!STCD_DICT || !STCD_DICT.banned) return;
  // 默认预设 / 自定义是固定槽位，始终可切换；命名预设必须已存在
  if (name !== '默认预设' && name !== '自定义' && !STCD_DICT.banned.presets[name]) return;
  STCD_DICT.banned.active = name;
  stcdRenderCloud(document.getElementById('stcdTabContent'));
}

// 自定义命名弹窗（Electron 不支持 window.prompt，用 .ovl + .mcard 模式替代）
function stcdBannedNameModal(cb) {
  var h = '<div class="mcard" style="max-width:380px">';
  h += '<h3 style="font-size:0.95em;margin-bottom:10px">✏️ 保存为命名预设</h3>';
  h += '<div style="margin-bottom:10px"><label style="font-size:0.8em;color:var(--fg2);display:block;margin-bottom:4px">预设名称</label>';
  h += '<input id="stcd-banned-name" class="llm-input" style="width:100%" placeholder="例如：过审向、艺术向" value=""></div>';
  h += '<div style="display:flex;gap:8px;justify-content:flex-end">';
  h += '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>';
  h += '<button class="btn-main" id="stcd-banned-name-ok">💾 保存</button>';
  h += '</div></div>';
  var ov = document.createElement('div');
  ov.className = 'ovl';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
  document.getElementById('stcd-banned-name-ok').onclick = function() {
    var name = (document.getElementById('stcd-banned-name').value || '').trim();
    if (!name) { toast('预设名称不能为空'); return; }
    if (name === '默认预设' || name === '自定义') { toast('该名称不可用'); return; }
    if (STCD_DICT.banned.presets[name]) { toast('该预设已存在'); return; }
    ov.remove();
    cb(name);
  };
  document.getElementById('stcd-banned-name').onkeydown = function(e) {
    if (e.key === 'Enter') document.getElementById('stcd-banned-name-ok').click();
  };
  setTimeout(function() { var d = document.getElementById('stcd-banned-name'); if (d) d.focus(); }, 50);
}

// 保存当前内容：默认预设/自定义上保存时弹出命名，保存为新的命名预设；命名预设上保存为覆盖更新
function stcdSaveBanned() {
  var wordsEl = document.getElementById('stcd-cloud-banned');
  var noteEl = document.getElementById('stcd-cloud-banned-note');
  if (!wordsEl) return;
  if (!STCD_DICT || !STCD_DICT.banned) return;
  var activeName = STCD_DICT.banned.active;
  var words = (wordsEl.value || '').trim();
  var note = (noteEl ? noteEl.value || '' : '').trim();
  if (activeName === '默认预设' || activeName === '自定义') {
    stcdBannedNameModal(function(name) {
      STCD_DICT.banned.presets[name] = { words: words, note: note };
      // 自定义槽同时保留草稿，便于下次继续编辑
      if (activeName === '自定义') {
        STCD_DICT.banned.presets['自定义'] = { words: words, note: note };
      }
      STCD_DICT.banned.active = name;
      if (typeof stcdSaveBannedFile === 'function') stcdSaveBannedFile();
      stcdRenderCloud(document.getElementById('stcdTabContent'));
      toast('预设「' + name + '」已创建');
    });
    return;
  }
  STCD_DICT.banned.presets[activeName] = { words: words, note: note };
  STCD_DICT.banned.active = activeName;
  if (typeof stcdSaveBannedFile === 'function') stcdSaveBannedFile();
  stcdRenderCloud(document.getElementById('stcdTabContent'));
  toast('预设「' + activeName + '」已保存');
}

function stcdDeleteBannedPreset() {
  if (!STCD_DICT || !STCD_DICT.banned) return;
  var name = STCD_DICT.banned.active;
  if (name === '默认预设' || name === '自定义') return;
  if (!confirm('确定删除预设「' + name + '」？')) return;
  delete STCD_DICT.banned.presets[name];
  STCD_DICT.banned.active = '默认预设';
  stcdSaveBannedFile();
  stcdRenderCloud(document.getElementById('stcdTabContent'));
  toast('已删除预设「' + name + '」');
}

function stcdResetBanned() {
  // 数据全在磁盘：恢复 = 清空内存缓存，从磁盘重新加载并切回默认预设
  var doReset = function() {
    if (!STCD_DICT) return;
    STCD_DICT.banned = null;
    if (typeof stcdLoadBanned === 'function') {
      stcdLoadBanned().then(function() {
        if (!STCD_DICT.banned.presets['默认预设']) STCD_DICT.banned.presets['默认预设'] = { words: '', note: '' };
        STCD_DICT.banned.active = '默认预设';
        stcdRenderCloud(document.getElementById('stcdTabContent'));
        toast('已切回默认预设');
      });
    }
  };
  if (typeof stcdLoadBanned === 'function') stcdLoadBanned().then(doReset);
  else doReset();
}

window.stcdBannedMode = stcdBannedMode;
window.stcdSaveBanned = stcdSaveBanned;
window.stcdDeleteBannedPreset = stcdDeleteBannedPreset;
window.stcdResetBanned = stcdResetBanned;
