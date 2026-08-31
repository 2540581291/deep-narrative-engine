// 章节写作（AI 生成初稿 → 人在其上修改）
// 利用大纲完整数据：playTags/link/setting/characters/wordTarget/eroticaLevel/highlight
var 小说写作当前章 = 0;
var 小说写作章集 = [];
var _writingAutoSaveTimer = null;
var _writingRepairTimer = null;
var _writingCtxPanelOpen = true;

// === AI 工坊 状态 ===
var _writingAiStudioOpen = false;
var _writingLastVersionA = null;
var _writingLastVersionB = null;
var _writingKeystrokes = 0;
var _writingKeystrokeLog = [];
var _writingLastRecordTime = Date.now();
var _writingSnapshots = [];

// 写作热力图（localStorage）
var _writingStreakStoreKey = '';

function 渲染小说写作(el) {
  try {
    console.log('[Writing] 渲染小说写作 called, novelCurrentTitle=', novelCurrentTitle);
    // 如果 novelCurrentTitle 为空，尝试从 _outlineTitle 恢复
    if (!novelCurrentTitle && typeof _outlineTitle !== 'undefined' && _outlineTitle) {
      console.log('[Writing] recovering novelCurrentTitle from _outlineTitle:', _outlineTitle);
      novelCurrentTitle = _outlineTitle;
    }
    debugLog('novel', '渲染小说写作', 'title=' + novelCurrentTitle);
    if (!novelCurrentTitle) {
      console.log('[Writing] ERROR: novelCurrentTitle is empty, showing error message');
      el.innerHTML = '<div class="placeholder-text">请先在作品列表中选择或创建一部作品</div>';
      return;
    }

    // 从 localStorage 恢复预设和热力图 key
    _writingStreakStoreKey = 'writing_streak_' + novelCurrentTitle;
    loadStreakFromStorage();

    var zenLeftStyle = '';
    var zenRightStyle = '';
    var aiStudioDisplay = _writingAiStudioOpen ? '' : 'display:none;';

    el.innerHTML = [
      '<div class="flex-row writing-root" style="gap:0;height:calc(100vh - 200px);align-items:stretch;border-radius:12px;border:1px solid #2a2a4a;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.4);background:#0a0a1a;color:#e0e0e0;font-family:\'Microsoft YaHei\',sans-serif;font-size:12px">',
      // ====== 左侧栏 ======
      '<div style="width:190px;flex-shrink:0;background:#111128;border-right:1px solid #1e1e3a;overflow-y:auto;display:flex;flex-direction:column" id="writingChapterList" class="writing-left-panel">',
      '  <div class="flex-row" style="justify-content:space-between;align-items:center;margin-bottom:6px">',
      '    <span class="text-sm text-muted">章节列表</span>',
      '    <button class="btn-secondary btn-sm" id="writingBatchGenBtn" title="批量生成未写章节" class="fs-10">⚡ 批量</button>',
      '  </div>',
      '  <div id="writingChapterItems" style="flex:1;overflow-y:auto"><div class="text-muted text-sm p-8">加载中...</div></div>',
      // 热力图
      '  <div id="writingStreakBar" class="writing-streak-bar"></div>',
      '</div>',
      // ====== 中央编辑区 ======
      '<div style="flex:1;display:flex;flex-direction:column;min-width:0;background:#0a0a1a">',
      // 工具行1：标题 + AI 操作按钮 + 快照 + 保存
      '  <div class="flex-row" style="align-items:flex-start;margin-bottom:6px;gap:4px;padding:8px 12px;border-bottom:1px solid #1e1e3a">',
      '    <div style="min-width:0;overflow:hidden">',
      '      <div style="font-size:11px;color:#667;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(novelCurrentTitle || '') + '</div>',
      '      <h3 id="writingChapterTitle" style="font-size:14px;font-weight:600;color:#fff;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></h3>',
      '    </div>',
      '    <div style="display:flex;justify-content:space-between;align-items:center;flex-shrink:0;gap:4px">',
      '    <div class="flex-row" style="gap:3px;flex-shrink:0;flex-wrap:wrap">',
      '      <button class="btn-secondary btn-sm" onclick="openAiGenPanel(\'n_write_continue\')" style="background:#1e1e3a;color:#aab;padding:4px 10px;border:none;border-radius:4px;cursor:pointer">✏ 续写</button>',
      '      <button class="btn-secondary btn-sm" onclick="novelDoRewrite()" style="background:#1e1e3a;color:#aab;padding:4px 10px;border:none;border-radius:4px;cursor:pointer">🔄 改写</button>',
      '      <button class="btn-secondary btn-sm" onclick="novelDoExpand()" style="background:#1e1e3a;color:#aab;padding:4px 10px;border:none;border-radius:4px;cursor:pointer">📖 扩写</button>',
      '      <button class="btn-secondary btn-sm" onclick="novelDoPolish()" style="background:#1e1e3a;color:#aab;padding:4px 10px;border:none;border-radius:4px;cursor:pointer">✨ 润色</button>',
      '      </div>',
      '    <button class="btn-secondary btn-sm" onclick="toggleAiStudio()" id="aiStudioToggleBtn_novel" style="background:#0d3a2a;color:#4ecca3;padding:4px 10px;border:none;border-radius:4px;cursor:pointer">🎨 工坊 ▼</button>',
      '    </div>',
      '  </div>',

      // AI 工坊面板（方案模式，可折叠）
      '  <div id="writingAiStudio" style="' + aiStudioDisplay + '">',
      '    <div class="writing-ai-studio" style="background:#0d0d22;border:1px solid #2a2a4a;border-radius:8px;padding:12px 12px 6px;margin:0 12px 6px">',
      '      <div style="align-items:center;margin-bottom:8px">',
      '        <span style="font-size:10px;color:#4ecca3;font-weight:600">🎨 AI 工坊 · 风格方案</span>',
      '      </div>',
      '      <div style="font-size:10px;color:#667;margin-bottom:8px">启用方案后，点击「为已启用方案生成」按钮，AI 会同时为所有已启用的方案生成内容。</div>',
      '      <div style="margin-bottom:10px"><span class="btn-sm" onclick="writingGeneratePlans()" style="display:inline-flex;align-items:center;gap:4px;padding:5px 14px;border-radius:4px;background:#4ecca3;color:#000;font-weight:600;font-size:11px;border:none;cursor:pointer">🤖 为已启用方案生成</span></div>',
      // 方案 A：诗意温柔 · 心理沉浸
      '      <div class="writing-plan" id="planA" style="background:#0a0a1a;border:1px solid #1e1e3a;border-radius:6px;padding:10px;margin-bottom:8px">',
      '        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">',
      '          <div class="writing-plan-toggle" id="toggleA" onclick="toggleWritingPlan(\'A\')" style="position:relative;width:32px;height:18px;background:#1e1e3a;border-radius:9px;cursor:pointer;transition:background 0.2s"><div style="position:absolute;top:2px;left:2px;width:14px;height:14px;background:#fff;border-radius:50%;transition:left 0.2s" id="knobA"></div></div>',
      '          <span style="font-size:11px;font-weight:600;color:#4ecca3">方案 A</span>',
      '          <span style="font-size:10px;color:#667;flex:1">诗意温柔 · 心理沉浸</span>',
      '        </div>',
      '        <div id="planAChips" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px"></div>',
      '        <div id="planALoading" style="display:none;font-size:10px;color:#4ecca3;margin-top:6px">⏳ AI 生成中...</div>',
      '        <div id="planAResult" style="display:none;margin-top:8px;padding:8px;background:#111128;border-radius:4px;border:1px solid #1e1e3a">',
      '          <div id="planAResultText" style="font-size:12px;color:#ccc;line-height:1.6;max-height:80px;overflow-y:auto"></div>',
      '          <div style="display:flex;gap:6px;margin-top:6px"><span class="writing-plan-write" onclick="writingPlanWrite(\'A\')" style="font-size:10px;padding:4px 12px;border-radius:4px;background:#4ecca3;color:#000;cursor:pointer;font-weight:600">✓ 写入</span><span class="writing-plan-diff" onclick="writingShowDiff(\'A\')" style="font-size:10px;padding:4px 10px;border-radius:4px;background:transparent;color:#667;cursor:pointer;border:1px solid #2a2a4a">📊 对比</span></div>',
      '        </div>',
      '      </div>',
      // 方案 B：直白狂放 · 感官冲击
      '      <div class="writing-plan" id="planB" style="background:#0a0a1a;border:1px solid #1e1e3a;border-radius:6px;padding:10px;margin-bottom:8px">',
      '        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">',
      '          <div class="writing-plan-toggle" id="toggleB" onclick="toggleWritingPlan(\'B\')" style="position:relative;width:32px;height:18px;background:#1e1e3a;border-radius:9px;cursor:pointer;transition:background 0.2s"><div style="position:absolute;top:2px;left:2px;width:14px;height:14px;background:#fff;border-radius:50%;transition:left 0.2s" id="knobB"></div></div>',
      '          <span style="font-size:11px;font-weight:600;color:#4ecca3">方案 B</span>',
      '          <span style="font-size:10px;color:#667;flex:1">直白狂放 · 感官冲击</span>',
      '        </div>',
      '        <div id="planBChips" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px"></div>',
      '        <div id="planBLoading" style="display:none;font-size:10px;color:#4ecca3;margin-top:6px">⏳ AI 生成中...</div>',
      '        <div id="planBResult" style="display:none;margin-top:8px;padding:8px;background:#111128;border-radius:4px;border:1px solid #1e1e3a">',
      '          <div id="planBResultText" style="font-size:12px;color:#ccc;line-height:1.6;max-height:80px;overflow-y:auto"></div>',
      '          <div style="display:flex;gap:6px;margin-top:6px"><span class="writing-plan-write" onclick="writingPlanWrite(\'B\')" style="font-size:10px;padding:4px 12px;border-radius:4px;background:#4ecca3;color:#000;cursor:pointer;font-weight:600">✓ 写入</span><span class="writing-plan-diff" onclick="writingShowDiff(\'B\')" style="font-size:10px;padding:4px 10px;border-radius:4px;background:transparent;color:#667;cursor:pointer;border:1px solid #2a2a4a">📊 对比</span></div>',
      '        </div>',
      '      </div>',
      // 方案 C：冷峻旁观 · 视觉意象
      '      <div class="writing-plan" id="planC" style="background:#0a0a1a;border:1px solid #1e1e3a;border-radius:6px;padding:10px;margin-bottom:8px">',
      '        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">',
      '          <div class="writing-plan-toggle" id="toggleC" onclick="toggleWritingPlan(\'C\')" style="position:relative;width:32px;height:18px;background:#1e1e3a;border-radius:9px;cursor:pointer;transition:background 0.2s"><div style="position:absolute;top:2px;left:2px;width:14px;height:14px;background:#fff;border-radius:50%;transition:left 0.2s" id="knobC"></div></div>',
      '          <span style="font-size:11px;font-weight:600;color:#4ecca3">方案 C</span>',
      '          <span style="font-size:10px;color:#667;flex:1">冷峻旁观 · 视觉意象</span>',
      '        </div>',
      '        <div id="planCChips" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px"></div>',
      '        <div id="planCLoading" style="display:none;font-size:10px;color:#4ecca3;margin-top:6px">⏳ AI 生成中...</div>',
      '        <div id="planCResult" style="display:none;margin-top:8px;padding:8px;background:#111128;border-radius:4px;border:1px solid #1e1e3a">',
      '          <div id="planCResultText" style="font-size:12px;color:#ccc;line-height:1.6;max-height:80px;overflow-y:auto"></div>',
      '          <div style="display:flex;gap:6px;margin-top:6px"><span class="writing-plan-write" onclick="writingPlanWrite(\'C\')" style="font-size:10px;padding:4px 12px;border-radius:4px;background:#4ecca3;color:#000;cursor:pointer;font-weight:600">✓ 写入</span><span class="writing-plan-diff" onclick="writingShowDiff(\'C\')" style="font-size:10px;padding:4px 10px;border-radius:4px;background:transparent;color:#667;cursor:pointer;border:1px solid #2a2a4a">📊 对比</span></div>',
      '        </div>',
      '      </div>',
      // 方案 D：自定义方向
      '      <div class="writing-plan" id="planD" style="background:#0a0a1a;border:1px solid #1e1e3a;border-radius:6px;padding:10px">',
      '        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">',
      '          <div class="writing-plan-toggle" id="toggleD" onclick="toggleWritingPlan(\'D\')" style="position:relative;width:32px;height:18px;background:#1e1e3a;border-radius:9px;cursor:pointer;transition:background 0.2s"><div style="position:absolute;top:2px;left:2px;width:14px;height:14px;background:#fff;border-radius:50%;transition:left 0.2s" id="knobD"></div></div>',
      '          <span style="font-size:11px;font-weight:600;color:#4ecca3">方案 D</span>',
      '          <span style="font-size:10px;color:#667;flex:1">自定义方向</span>',
      '        </div>',
      '        <textarea id="planDCustom" style="width:100%;background:#0a0a1a;border:1px solid #2a2a4a;border-radius:4px;padding:6px 8px;color:#ccc;font-size:11px;font-family:inherit;resize:none;min-height:40px" placeholder="输入你想要的写作风格、方向、特殊要求..."></textarea>',
      '        <div id="planDLoading" style="display:none;font-size:10px;color:#4ecca3;margin-top:6px">⏳ AI 生成中...</div>',
      '        <div id="planDResult" style="display:none;margin-top:8px;padding:8px;background:#111128;border-radius:4px;border:1px solid #1e1e3a">',
      '          <div id="planDResultText" style="font-size:12px;color:#ccc;line-height:1.6;max-height:80px;overflow-y:auto"></div>',
      '          <div style="display:flex;gap:6px;margin-top:6px"><span class="writing-plan-write" onclick="writingPlanWrite(\'D\')" style="font-size:10px;padding:4px 12px;border-radius:4px;background:#4ecca3;color:#000;cursor:pointer;font-weight:600">✓ 写入</span><span class="writing-plan-diff" onclick="writingShowDiff(\'D\')" style="font-size:10px;padding:4px 10px;border-radius:4px;background:transparent;color:#667;cursor:pointer;border:1px solid #2a2a4a">📊 对比</span></div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      // 编辑器（contenteditable div，支持对话着色）
      '  <div id="writingEditor" contenteditable="true" class="writing-editor" style="flex:1;min-height:300px;font-family:\'Noto Serif SC\',\'Source Han Serif SC\',Georgia,serif;font-size:16px;line-height:2.2;padding:20px 28px;background:#0a0a1a;color:#d4d4d4;outline:none;border-top:1px solid #1e1e3a;overflow-y:auto;white-space:pre-wrap;word-wrap:break-word;letter-spacing:0.5px" data-placeholder="选择章节开始写作，或点击「生成」让 AI 根据大纲写出初稿"></div>',
      // 状态栏
      '  <div id="writingStatusBar" class="writing-status-bar" style="padding:4px 12px;border-top:1px solid #1e1e3a;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#667;background:#0a0a1a">',
      '    <div class="writing-status-left" style="display:flex;align-items:center;gap:12px">',
      '      <span class="writing-wc" id="writingWordCount"></span>',
      '      <span class="writing-sparkline" id="writingSparkline" style="display:flex;align-items:flex-end;gap:2px;height:16px"></span>',
      '      <span class="writing-speed" id="writingSpeed" style="color:#667">✍ 0字/分</span>',
      '    </div>',
      '    <div class="writing-status-right" style="display:flex;align-items:center;gap:8px">',
      '      <span class="writing-ai-tag" id="writingAiTag" style="font-size:9px;padding:1px 6px;border-radius:4px;background:#0d1f3a;color:#4ecca3;white-space:nowrap"></span>',
      '      <span id="writingKeystrokeCount" style="color:#667">⌨ 0键</span>',
      '      <span id="writingFocusTimer" style="color:#667">⏱ --:--</span>',
      '      <span id="writingSnapshotCount" style="color:#667">📸 0</span>',
      '      <span id="writingGenStatus" style="display:none;color:#4ecca3;font-size:10px;padding:1px 6px;border-radius:4px;background:#0d3a2a">🤖 生成中...</span>',
      '    </div>',
      '  </div>',
      // 浮动提示
      '  <div id="writingFloatHint" class="writing-float-hint" style="position:fixed;bottom:60px;right:290px;background:#0d3a2a;border:1px solid #4ecca3;border-radius:8px;padding:8px 12px;font-size:11px;color:#4ecca3;box-shadow:0 4px 12px rgba(78,204,163,0.2);display:none;align-items:center;gap:6px;z-index:100">💡 <span id="writingFloatHintText">需要灵感？试试切换风格或使用「续写」推进剧情</span></div>',
      '</div>',
      // ====== 右侧上下文面板 ======
      '<div id="writingCtxPanel" style="width:270px;flex-shrink:0;background:#0f0f23;border-left:1px solid #1e1e3a;padding:12px;overflow-y:auto" class="writing-right-panel">',
      '  <div class="flex-row" style="justify-content:space-between;align-items:center;margin-bottom:6px">',
      '    <span style="font-size:12px;color:#667">章节信息</span>',
      '    <button class="btn-secondary btn-sm" id="writingCtxToggle" style="font-size:10px;background:transparent;color:#667;border:none;cursor:pointer;padding:2px 6px">◀ 收起</button>',
      '  </div>',
      '  <div id="writingCtxContent" style="color:#e0e0e0"></div>',
      // AI 预设区域
      '  <div id="writingPresetArea" class="writing-preset-area" style="margin-top:10px;padding-top:8px;border-top:1px solid #1e1e3a">',
      '    <div style="font-size:11px;color:#667;margin-bottom:4px">📦 风格预设</div>',
      '    <div id="writingPresetList" class="writing-preset-list" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px"></div>',
      '  </div>',
      // 写作提示
      '  <div id="writingHintBox" class="writing-hint-box" style="margin-top:8px;padding:8px;background:#0a0a1a;border:1px solid #1e1e3a;border-radius:6px;display:flex;gap:6px;align-items:flex-start">',
      '    <div style="font-size:12px;flex-shrink:0">💡</div>',
      '    <div style="font-size:10px;color:#8899aa;line-height:1.5" id="writingHintText">当前节奏偏慢，建议推进对话或切换情绪生成下一段</div>',
      '  </div>',
      '</div>',
      '</div>',
    ].join('\n');

    // === 事件绑定 ===
    var toggleBtn = document.getElementById('writingCtxToggle');
    if (toggleBtn) toggleBtn.addEventListener('click', function() {
      var panel = document.getElementById('writingCtxPanel');
      var btn = document.getElementById('writingCtxToggle');
      if (_writingCtxPanelOpen) { panel.style.display = 'none'; btn.textContent = '▶ 展开'; }
      else { panel.style.display = ''; btn.textContent = '◀ 收起'; }
      _writingCtxPanelOpen = !_writingCtxPanelOpen;
    });
    var genBtn = document.getElementById('writingGenBtn');
    if (genBtn) genBtn.addEventListener('click', function() {
      var ch = 小说写作章集[小说写作当前章];
      if (!ch) return;
      var editor = document.getElementById('writingEditor');
      if (editor && editor.innerText.trim()) 小说AI续写();
      else 小说AI生成章节();
    });
    var batchBtn = document.getElementById('writingBatchGenBtn');
    if (batchBtn) batchBtn.addEventListener('click', 小说批量生成未写);

    // AI 工坊展开/折叠
    window.toggleAiStudio = function() {
      _writingAiStudioOpen = !_writingAiStudioOpen;
      var studio = document.getElementById('writingAiStudio');
      if (studio) studio.style.display = _writingAiStudioOpen ? '' : 'none';
      var btn = document.getElementById('aiStudioToggleBtn_novel');
      if (btn) btn.innerHTML = _writingAiStudioOpen ? '🎨 工坊 ▼' : '🎨 工坊 ▶';
    };

    // 渲染 AI 方案芯片
    renderPlanChips();

    // 编辑器事件
    var editor = document.getElementById('writingEditor');
    if (editor) {
      editor.addEventListener('input', function() {
        if (_writingAutoSaveTimer) clearTimeout(_writingAutoSaveTimer);
        if (_writingRepairTimer) clearTimeout(_writingRepairTimer);
        updateWritingStatus();
        updateSparkline();
        _writingAutoSaveTimer = setTimeout(小说保存当前章, 500);
        _writingRepairTimer = setTimeout(修复编辑器显示, 2000);
      });
      editor.addEventListener('keydown', function(e) {
        _writingKeystrokes++;
        if (_writingKeystrokes % 10 === 0) updateKeystrokeDisplay();
        if (e.ctrlKey && e.key === 's') { e.preventDefault(); 小说保存当前章(); }
      });
      editor.addEventListener('paste', function() {
        setTimeout(修复编辑器显示, 100);
      });
    }

    console.log('[Writing] about to call loadWritingChapters, novelCurrentTitle=', novelCurrentTitle);
    debugLog('novel', '渲染小说写作', 'about to call loadWritingChapters, title=' + novelCurrentTitle);
    try {
      小说loadWritingChapters();
    } catch(e) {
      debugLog('novel', 'loadWritingChapters CRASH', e.message + ' | ' + e.stack);
      console.error('[Writing] loadWritingChapters error:', e);
    }
  } catch(e) { console.error('[Writing] render error:', e); el.innerHTML = '<div class="placeholder-text c-error">加载错误: ' + e.message + '</div>'; }
}

// ===== 显示层修复：确保编辑器始终遵守缩进 + 对白绿色格式 =====
function 修复编辑器显示() {
  var ed = document.getElementById('writingEditor');
  if (!ed) return;
  var txt = ed.innerText;
  if (!txt.trim()) return;
  var formatted = formatForDisplay(txt);
  if (formatted && formatted !== ed.innerHTML) {
    ed.innerHTML = formatted;
  }
}

// ===== 保存 =====
function 小说保存当前章() {
  var editor = document.getElementById('writingEditor');
  if (!editor || !novelCurrentTitle) return;
  var ch = 小说写作章集[小说写作当前章];
  if (!ch) return;
  var chName = 'ch' + (小说写作当前章 + 1) + '.txt';
  var content = formatForStorage(editor.innerText);
  ch._written = !!content.trim();
  ch._wordCount = wordCount(content);
  // 更新保存指示
  var dot = document.getElementById('writingSaveDot');
  if (dot) { dot.style.background = '#4ecca3'; setTimeout(function() { if (dot) dot.style.background = '#4ecca3'; }, 300); }
  var now = new Date();
  var headerSave = document.getElementById('writingSaveStatusHeader');
  if (headerSave) headerSave.textContent = '已保存 ' + fmtDate(now);
  Store.novel.saveChapter(novelCurrentTitle, chName, content).then(function() {
    renderChapterList();
    recordWritingStreak();
    renderStreakBar();
  });
}

// ===== 暴露为 window 函数 =====
window.渲染小说写作 = 渲染小说写作;
window.renderNovelWriting = window.渲染小说写作;
window.小说保存当前章 = 小说保存当前章;
window.saveCurrentChapter = window.小说保存当前章;
window.小说AI续写 = function() { openAiGenPanel('n_write_continue'); };
window.aiContinueChapter = window.小说AI续写;
window.小说AI重写 = novelDoRewrite;
window.aiRewriteChapter = window.小说AI重写;
window.小说AI扩写 = novelDoExpand;
window.aiExpandChapter = window.小说AI扩写;
window.小说AI润色 = novelDoPolish;
window.aiPolishChapter = window.小说AI润色;

// ===== 选区感知的改写/扩写/润色 =====
function novelDoRewrite() {
  var editor = document.getElementById('writingEditor');
  var sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && !sel.isCollapsed && editor && editor.contains(sel.anchorNode)) {
    window._novelWriteSel = { text: sel.toString(), range: sel.getRangeAt(0).cloneRange() };
    openAiGenPanel('n_write_rewrite');
  } else {
    toast('请先在正文中选中要处理的文字');
  }
}
function novelDoExpand() {
  var editor = document.getElementById('writingEditor');
  var sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && !sel.isCollapsed && editor && editor.contains(sel.anchorNode)) {
    window._novelWriteSel = { text: sel.toString(), range: sel.getRangeAt(0).cloneRange() };
    openAiGenPanel('n_write_expand');
  } else {
    toast('请先在正文中选中要处理的文字');
  }
}
function novelDoPolish() {
  var editor = document.getElementById('writingEditor');
  var sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && !sel.isCollapsed && editor && editor.contains(sel.anchorNode)) {
    window._novelWriteSel = { text: sel.toString(), range: sel.getRangeAt(0).cloneRange() };
    openAiGenPanel('n_write_polish');
  } else {
    toast('请先在正文中选中要处理的文字');
  }
}
window.novelDoRewrite = novelDoRewrite;
window.novelDoExpand = novelDoExpand;
window.novelDoPolish = novelDoPolish;
