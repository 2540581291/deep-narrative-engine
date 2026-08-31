// 深度-叙事引擎 · 角色卡 · 📖 小说提取 · AI 重命名
// ===== 弹窗：AI 重命名 =====
window.小说提取弹出重命名 = function(key) {
  var label = (window._小说提取历史列表 || []).reduce(function(found, e) {
    return (e.folderName || e.id) === key ? e.title : found;
  }, '') || key;
  if (document.getElementById('renameOverlay')) return;
  var ov = document.createElement('div');
  ov.id = 'renameOverlay';
  ov.className = 'ovl';
  ov.innerHTML = '<div class="mcard" style="max-width:520px;width:90%">' +
    '<div style="font-size:15px;font-weight:600;margin-bottom:4px">📝 重命名</div>' +
    '<div style="font-size:11px;color:var(--fg2);margin-bottom:14px">当前：' + escHtml(label) + '</div>' +
    '<div style="font-size:11px;font-weight:500;margin-bottom:6px;color:var(--fg)">给 AI 的建议（可选）</div>' +
    '<div style="font-size:10px;color:var(--fg3);margin-bottom:8px">输入你的想法或方向，AI 将参考它来生成标题；留空则由 AI 自行推断</div>' +
    '<textarea id="renameTitleInput" class="llm-input" rows="2" style="width:100%;font-size:12px;resize:vertical;font-family:inherit" placeholder="例：这是个校园恋爱故事……"></textarea>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">' +
    '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>' +
    '<button class="btn-main" onclick="window.小说提取确认重命名(\'' + key + '\')">📝 确认重命名</button>' +
    '</div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
};

window.小说提取确认重命名 = function(key) {
  var input = document.getElementById('renameTitleInput');
  var hint = input ? input.value.trim() : '';
  var ov = document.getElementById('renameOverlay');
  if (ov) ov.remove();
  小说提取重命名记录(key, hint);
};

// ===== AI 重命名提取记录 =====
window.小说提取重命名记录 = function(key, userHint) {
  var loadPromise = LocalFS.readText(小说提取存储基路径 + key + '/fulltext.txt').then(function(fullText) {
    return { fullText: fullText || '', title: key };
  });

  loadPromise.then(function(data) {
    if (!data) { toast('记录未找到'); return; }
    var fullText = data.fullText || '';
    if (!fullText || fullText.length < 50) { toast('⚠️ 原文已丢失，无法生成标题'); return; }

    var sample = fullText.substring(0, 2000);
    var hintBlock = userHint ? '\n\n用户建议（请参考以下建议来理解内容方向，辅助提取书名）：' + userHint + '\n\n不管你提取的是什么，你都要以用户的建议为最高指示。' : '';

    var _r = renderPrompt('ext_char_rename', {
      文件名: key,
      用户建议: hintBlock,
      文本: sample,
    });
    LLM.call({
      prompt: _r.user,
      system: _r.system,
      label: '重命名: ' + (data.title || '未知'),
      temperature: 0.3
    }).then(function(text) {
      var m = text.match(/《[^》]+》/);
      var newTitle = m ? m[0] : text.replace(/[""''「」『』【】]/g, '').trim();
      if (!newTitle || newTitle.length < 2 || newTitle.length > 50) {
        toast('⚠️ 生成的标题不合法: ' + (newTitle || '空'));
        return;
      }
      saveRenamed(key, newTitle);
    }).catch(function(err) {
      toast('⚠️ AI 生成标题失败: ' + (err.message || ''));
      console.warn(err);
    });
  }).catch(function(err) {
    toast('⚠️ 读取记录失败');
    console.warn(err);
  });
};

function saveRenamed(key, newTitle) {
  // 读取现有 meta 只更新 title，保留 id/createdAt/completed/category/textLength
  LocalFS.readJSON(小说提取存储基路径 + key + '/_meta.json').then(function(meta) {
    if (!meta) { toast('记录未找到'); return; }
    meta.title = newTitle;
    return LocalFS.saveJSON(小说提取存储基路径 + key + '/_meta.json', meta).then(function() {
      var newFolderName = 本地FS.清理(newTitle);
      if (newFolderName && newFolderName !== key) {
        return LocalFS.rename(小说提取存储基路径 + key, 小说提取存储基路径 + newFolderName).then(function() {
          toast('✅ 已重命名为「' + newTitle + '」');
          小说提取扫描目录().then(function() { 刷新视图(); });
        }).catch(function() {
          toast('✅ 标题已更新（文件夹未重命名）');
          小说提取扫描目录().then(function() { 刷新视图(); });
        });
      }
      toast('✅ 标题已更新为「' + newTitle + '」');
      小说提取扫描目录().then(function() { 刷新视图(); });
    });
  }).catch(function(e) { toast('⚠️ 保存失败'); console.warn(e); });
}
