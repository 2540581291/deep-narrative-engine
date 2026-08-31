// 章节写作（AI 生成初稿 → 人在其上修改）
// 利用大纲完整数据：playTags/link/setting/characters/wordTarget/eroticaLevel/highlight
var 短写作当前章 = 0;
var 短写作章集 = [];
var 短_writingAutoSaveTimer = null;
var 短_writingRepairTimer = null;
var 短_writingCtxPanelOpen = true;

// === AI 工坊 状态 ===
var 短_writingAiStudioOpen = false;
var 短_writingLastVersionA = null;
var 短_writingLastVersionB = null;
var 短_writingKeystrokes = 0;
var 短_writingKeystrokeLog = [];
var 短_writingLastRecordTime = Date.now();
var 短_writingSnapshots = [];

var 短_writingStreakStoreKey = '';

function 渲染短章写作(el) {
  try {
    // 如果 vignetteCurrentTitle 为空，尝试从 短ot 恢复
    if (!vignetteCurrentTitle && typeof 短ot !== 'undefined' && 短ot) {
      vignetteCurrentTitle = 短ot;
    }
    debugLog('novel', '渲染短章写作', 'title=' + vignetteCurrentTitle);
    if (!vignetteCurrentTitle) {
      el.innerHTML = '<div class="placeholder-text">请先在作品列表中选择或创建一部作品</div>';
      return;
    }

    短_writingStreakStoreKey = 'v_streak_' + vignetteCurrentTitle;
    短loadStreakFromStorage();

    var zenLeftStyle = '';
    var zenRightStyle = '';
    var aiStudioDisplay = 短_writingAiStudioOpen ? '' : 'display:none;';

    el.innerHTML = [
      '<div class="flex-row writing-root" style="gap:0;height:calc(100vh - 200px);align-items:stretch;border-radius:12px;border:1px solid #2a2a4a;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.4);background:#0a0a1a;color:#e0e0e0;font-family:\'Microsoft YaHei\',sans-serif;font-size:12px">',
      '<div style="width:190px;flex-shrink:0;background:#111128;border-right:1px solid #1e1e3a;overflow-y:auto;display:flex;flex-direction:column" id="writingChapterList" class="writing-left-panel">',
      '  <div class="flex-row" style="justify-content:space-between;align-items:center;margin-bottom:6px">',
      '    <span class="text-sm text-muted">章节列表</span>',
      '    <button class="btn-secondary btn-sm" id="writingBatchGenBtn" title="批量生成未写章节" class="fs-10">⚡ 批量</button>',
      '  </div>',
      '  <div id="writingChapterItems" style="flex:1;overflow-y:auto"><div class="text-muted text-sm p-8">加载中...</div></div>',
      '  <div id="writingStreakBar" class="writing-streak-bar"></div>',
      '</div>',
      '<div style="flex:1;display:flex;flex-direction:column;min-width:0;background:#0a0a1a">',
      '  <div class="flex-row" style="align-items:flex-start;margin-bottom:6px;gap:4px;padding:8px 12px;border-bottom:1px solid #1e1e3a">',
      '    <div style="min-width:0;overflow:hidden">',
      '      <div style="font-size:11px;color:#667;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(vignetteCurrentTitle || '') + '</div>',
      '      <h3 id="writingChapterTitle" style="font-size:14px;font-weight:600;color:#fff;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></h3>',
      '    </div>',
      '    <div style="display:flex;justify-content:space-between;align-items:center;flex-shrink:0;gap:4px">',
      '    <div class="flex-row" style="gap:3px;flex-shrink:0;flex-wrap:wrap">',
      '      <button class="btn-secondary btn-sm" onclick="openAiGenPanel(\'v_write_continue\')" style="background:#1e1e3a;color:#aab;padding:4px 10px;border:none;border-radius:4px;cursor:pointer">✏ 续写</button>',
      '      <button class="btn-secondary btn-sm" onclick="短章改写()" style="background:#1e1e3a;color:#aab;padding:4px 10px;border:none;border-radius:4px;cursor:pointer">🔄 改写</button>',
      '      <button class="btn-secondary btn-sm" onclick="短章扩写()" style="background:#1e1e3a;color:#aab;padding:4px 10px;border:none;border-radius:4px;cursor:pointer">📖 扩写</button>',
      '      <button class="btn-secondary btn-sm" onclick="短章润色()" style="background:#1e1e3a;color:#aab;padding:4px 10px;border:none;border-radius:4px;cursor:pointer">✨ 润色</button>',
      '      </div>',
      '    <button class="btn-secondary btn-sm" onclick="短toggleAiStudio()" id="aiStudioToggleBtn_short" style="background:#0d3a2a;color:#4ecca3;padding:4px 10px;border:none;border-radius:4px;cursor:pointer">🎨 工坊 ▼</button>',
      '    </div>',
      '  </div>',

      '  <div id="writingAiStudio" style="' + aiStudioDisplay + '">',
      '    <div class="writing-ai-studio" style="background:#0d0d22;border:1px solid #2a2a4a;border-radius:8px;padding:12px 12px 6px;margin:0 12px 6px">',
      '      <div style="align-items:center;margin-bottom:8px">',
      '        <span style="font-size:10px;color:#4ecca3;font-weight:600">🎨 AI 工坊 · 风格方案</span>',
      '      </div>',
      '      <div style="font-size:10px;color:#667;margin-bottom:8px">启用方案后，点击「为已启用方案生成」按钮，AI 会同时为所有已启用的方案生成内容。</div>',
      '      <div style="margin-bottom:10px"><span class="btn-sm" onclick="短writingGeneratePlans()" style="display:inline-flex;align-items:center;gap:4px;padding:5px 14px;border-radius:4px;background:#4ecca3;color:#000;font-weight:600;font-size:11px;border:none;cursor:pointer">🤖 为已启用方案生成</span></div>',
      // 方案 A
      '      <div class="writing-plan" id="planA" style="background:#0a0a1a;border:1px solid #1e1e3a;border-radius:6px;padding:10px;margin-bottom:8px">',
      '        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">',
      '          <div class="writing-plan-toggle" id="toggleA" onclick="短toggleWritingPlan(\'A\')" style="position:relative;width:32px;height:18px;background:#1e1e3a;border-radius:9px;cursor:pointer;transition:background 0.2s"><div style="position:absolute;top:2px;left:2px;width:14px;height:14px;background:#fff;border-radius:50%;transition:left 0.2s" id="knobA"></div></div>',
      '          <span style="font-size:11px;font-weight:600;color:#4ecca3">方案 A</span>',
      '          <span style="font-size:10px;color:#667;flex:1">诗意温柔 · 心理沉浸</span>',
      '        </div>',
      '        <div id="planAChips" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px"></div>',
      '        <div id="planALoading" style="display:none;font-size:10px;color:#4ecca3;margin-top:6px">⏳ AI 生成中...</div>',
      '        <div id="planAResult" style="display:none;margin-top:8px;padding:8px;background:#111128;border-radius:4px;border:1px solid #1e1e3a">',
      '          <div id="planAResultText" style="font-size:12px;color:#ccc;line-height:1.6;max-height:80px;overflow-y:auto"></div>',
      '          <div style="display:flex;gap:6px;margin-top:6px"><span class="writing-plan-write" onclick="短writingPlanWrite(\'A\')" style="font-size:10px;padding:4px 12px;border-radius:4px;background:#4ecca3;color:#000;cursor:pointer;font-weight:600">✓ 写入</span><span class="writing-plan-diff" onclick="短writingShowDiff(\'A\')" style="font-size:10px;padding:4px 10px;border-radius:4px;background:transparent;color:#667;cursor:pointer;border:1px solid #2a2a4a">📊 对比</span></div>',
      '        </div>',
      '      </div>',
      // 方案 B
      '      <div class="writing-plan" id="planB" style="background:#0a0a1a;border:1px solid #1e1e3a;border-radius:6px;padding:10px;margin-bottom:8px">',
      '        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">',
      '          <div class="writing-plan-toggle" id="toggleB" onclick="短toggleWritingPlan(\'B\')" style="position:relative;width:32px;height:18px;background:#1e1e3a;border-radius:9px;cursor:pointer;transition:background 0.2s"><div style="position:absolute;top:2px;left:2px;width:14px;height:14px;background:#fff;border-radius:50%;transition:left 0.2s" id="knobB"></div></div>',
      '          <span style="font-size:11px;font-weight:600;color:#4ecca3">方案 B</span>',
      '          <span style="font-size:10px;color:#667;flex:1">直白狂放 · 感官冲击</span>',
      '        </div>',
      '        <div id="planBChips" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px"></div>',
      '        <div id="planBLoading" style="display:none;font-size:10px;color:#4ecca3;margin-top:6px">⏳ AI 生成中...</div>',
      '        <div id="planBResult" style="display:none;margin-top:8px;padding:8px;background:#111128;border-radius:4px;border:1px solid #1e1e3a">',
      '          <div id="planBResultText" style="font-size:12px;color:#ccc;line-height:1.6;max-height:80px;overflow-y:auto"></div>',
      '          <div style="display:flex;gap:6px;margin-top:6px"><span class="writing-plan-write" onclick="短writingPlanWrite(\'B\')" style="font-size:10px;padding:4px 12px;border-radius:4px;background:#4ecca3;color:#000;cursor:pointer;font-weight:600">✓ 写入</span><span class="writing-plan-diff" onclick="短writingShowDiff(\'B\')" style="font-size:10px;padding:4px 10px;border-radius:4px;background:transparent;color:#667;cursor:pointer;border:1px solid #2a2a4a">📊 对比</span></div>',
      '        </div>',
      '      </div>',
      // 方案 C
      '      <div class="writing-plan" id="planC" style="background:#0a0a1a;border:1px solid #1e1e3a;border-radius:6px;padding:10px;margin-bottom:8px">',
      '        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">',
      '          <div class="writing-plan-toggle" id="toggleC" onclick="短toggleWritingPlan(\'C\')" style="position:relative;width:32px;height:18px;background:#1e1e3a;border-radius:9px;cursor:pointer;transition:background 0.2s"><div style="position:absolute;top:2px;left:2px;width:14px;height:14px;background:#fff;border-radius:50%;transition:left 0.2s" id="knobC"></div></div>',
      '          <span style="font-size:11px;font-weight:600;color:#4ecca3">方案 C</span>',
      '          <span style="font-size:10px;color:#667;flex:1">冷峻旁观 · 视觉意象</span>',
      '        </div>',
      '        <div id="planCChips" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px"></div>',
      '        <div id="planCLoading" style="display:none;font-size:10px;color:#4ecca3;margin-top:6px">⏳ AI 生成中...</div>',
      '        <div id="planCResult" style="display:none;margin-top:8px;padding:8px;background:#111128;border-radius:4px;border:1px solid #1e1e3a">',
      '          <div id="planCResultText" style="font-size:12px;color:#ccc;line-height:1.6;max-height:80px;overflow-y:auto"></div>',
      '          <div style="display:flex;gap:6px;margin-top:6px"><span class="writing-plan-write" onclick="短writingPlanWrite(\'C\')" style="font-size:10px;padding:4px 12px;border-radius:4px;background:#4ecca3;color:#000;cursor:pointer;font-weight:600">✓ 写入</span><span class="writing-plan-diff" onclick="短writingShowDiff(\'C\')" style="font-size:10px;padding:4px 10px;border-radius:4px;background:transparent;color:#667;cursor:pointer;border:1px solid #2a2a4a">📊 对比</span></div>',
      '        </div>',
      '      </div>',
      // 方案 D
      '      <div class="writing-plan" id="planD" style="background:#0a0a1a;border:1px solid #1e1e3a;border-radius:6px;padding:10px">',
      '        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">',
      '          <div class="writing-plan-toggle" id="toggleD" onclick="短toggleWritingPlan(\'D\')" style="position:relative;width:32px;height:18px;background:#1e1e3a;border-radius:9px;cursor:pointer;transition:background 0.2s"><div style="position:absolute;top:2px;left:2px;width:14px;height:14px;background:#fff;border-radius:50%;transition:left 0.2s" id="knobD"></div></div>',
      '          <span style="font-size:11px;font-weight:600;color:#4ecca3">方案 D</span>',
      '          <span style="font-size:10px;color:#667;flex:1">自定义方向</span>',
      '        </div>',
      '        <textarea id="planDCustom" style="width:100%;background:#0a0a1a;border:1px solid #2a2a4a;border-radius:4px;padding:6px 8px;color:#ccc;font-size:11px;font-family:inherit;resize:none;min-height:40px" placeholder="输入你想要的写作风格、方向、特殊要求..."></textarea>',
      '        <div id="planDLoading" style="display:none;font-size:10px;color:#4ecca3;margin-top:6px">⏳ AI 生成中...</div>',
      '        <div id="planDResult" style="display:none;margin-top:8px;padding:8px;background:#111128;border-radius:4px;border:1px solid #1e1e3a">',
      '          <div id="planDResultText" style="font-size:12px;color:#ccc;line-height:1.6;max-height:80px;overflow-y:auto"></div>',
      '          <div style="display:flex;gap:6px;margin-top:6px"><span class="writing-plan-write" onclick="短writingPlanWrite(\'D\')" style="font-size:10px;padding:4px 12px;border-radius:4px;background:#4ecca3;color:#000;cursor:pointer;font-weight:600">✓ 写入</span><span class="writing-plan-diff" onclick="短writingShowDiff(\'D\')" style="font-size:10px;padding:4px 10px;border-radius:4px;background:transparent;color:#667;cursor:pointer;border:1px solid #2a2a4a">📊 对比</span></div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div id="writingEditor" contenteditable="true" class="writing-editor" style="flex:1;min-height:300px;font-family:\'Noto Serif SC\',\'Source Han Serif SC\',Georgia,serif;font-size:16px;line-height:2.2;padding:20px 28px;background:#0a0a1a;color:#d4d4d4;outline:none;border-top:1px solid #1e1e3a;overflow-y:auto;white-space:pre-wrap;word-wrap:break-word;letter-spacing:0.5px" data-placeholder="选择章节开始写作，或点击「生成」让 AI 根据大纲写出初稿"></div>',
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
      '  <div id="writingFloatHint" class="writing-float-hint" style="position:fixed;bottom:60px;right:290px;background:#0d3a2a;border:1px solid #4ecca3;border-radius:8px;padding:8px 12px;font-size:11px;color:#4ecca3;box-shadow:0 4px 12px rgba(78,204,163,0.2);display:none;align-items:center;gap:6px;z-index:100">💡 <span id="writingFloatHintText">需要灵感？试试切换风格或使用「续写」推进剧情</span></div>',
      '</div>',
      '<div id="writingCtxPanel" style="width:270px;flex-shrink:0;background:#0f0f23;border-left:1px solid #1e1e3a;padding:12px;overflow-y:auto" class="writing-right-panel">',
      '  <div class="flex-row" style="justify-content:space-between;align-items:center;margin-bottom:6px">',
      '    <span style="font-size:12px;color:#667">章节信息</span>',
      '    <button class="btn-secondary btn-sm" id="writingCtxToggle" style="font-size:10px;background:transparent;color:#667;border:none;cursor:pointer;padding:2px 6px">◀ 收起</button>',
      '  </div>',
      '  <div id="writingCtxContent" style="color:#e0e0e0"></div>',
      '  <div id="writingPresetArea" class="writing-preset-area" style="margin-top:10px;padding-top:8px;border-top:1px solid #1e1e3a">',
      '    <div style="font-size:11px;color:#667;margin-bottom:4px">📦 风格预设</div>',
      '    <div id="writingPresetList" class="writing-preset-list" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px"></div>',
      '  </div>',
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
      if (短_writingCtxPanelOpen) { panel.style.display = 'none'; btn.textContent = '▶ 展开'; }
      else { panel.style.display = ''; btn.textContent = '◀ 收起'; }
      短_writingCtxPanelOpen = !短_writingCtxPanelOpen;
    });
    var genBtn = document.getElementById('writingGenBtn');
    if (genBtn) genBtn.addEventListener('click', function() {
      var ch = 短写作章集[短写作当前章];
      if (!ch) return;
      var editor = document.getElementById('writingEditor');
      if (editor && editor.innerText.trim()) 短章AI续写();
      else { if (typeof window.短章AI生成章节 === 'function') window.短章AI生成章节(); else toast('AI 模块未加载'); }
    });
    var batchBtn = document.getElementById('writingBatchGenBtn');
    if (batchBtn) batchBtn.addEventListener('click', 短章批量生成未写);

    // AI 工坊展开/折叠
    window.短toggleAiStudio = function() {
      短_writingAiStudioOpen = !短_writingAiStudioOpen;
      var studio = document.getElementById('writingAiStudio');
      if (studio) studio.style.display = 短_writingAiStudioOpen ? '' : 'none';
      var btn = document.getElementById('aiStudioToggleBtn_short');
      if (btn) btn.innerHTML = 短_writingAiStudioOpen ? '🎨 工坊 ▼' : '🎨 工坊 ▶';
    };

    // 渲染 AI 方案芯片
    短renderPlanChips();

    var editor = document.getElementById('writingEditor');
    if (editor) {
      editor.addEventListener('input', function() {
        if (短_writingAutoSaveTimer) clearTimeout(短_writingAutoSaveTimer);
        if (短_writingRepairTimer) clearTimeout(短_writingRepairTimer);
        短updateWritingStatus();
        短updateSparkline();
        短_writingAutoSaveTimer = setTimeout(短章保存当前章, 500);
        短_writingRepairTimer = setTimeout(短修复编辑器显示, 2000);
      });
      editor.addEventListener('keydown', function(e) {
        短_writingKeystrokes++;
        if (短_writingKeystrokes % 10 === 0) 短updateKeystrokeDisplay();
        if (e.ctrlKey && e.key === 's') { e.preventDefault(); 短章保存当前章(); }
      });
      editor.addEventListener('paste', function() {
        setTimeout(短修复编辑器显示, 100);
      });
    }

    try {
      短loadWritingChapters();
    } catch(e) {
      console.error('[Writing] loadWritingChapters error:', e);
    }
  } catch(e) { console.error('[Writing] render error:', e); el.innerHTML = '<div class="placeholder-text c-error">加载错误: ' + e.message + '</div>'; }
}

// ===== 显示层修复：确保编辑器始终遵守缩进 + 对白绿色格式 =====
function 短修复编辑器显示() {
  var ed = document.getElementById('writingEditor');
  if (!ed) return;
  var txt = ed.innerText;
  if (!txt.trim()) return;
  var formatted = 短formatForDisplay(txt);
  if (formatted && formatted !== ed.innerHTML) {
    ed.innerHTML = formatted;
  }
}

// ===== 保存 =====
function 短章保存当前章() {
  var editor = document.getElementById('writingEditor');
  if (!editor || !vignetteCurrentTitle) return;
  var ch = 短写作章集[短写作当前章];
  if (!ch) return;
  var chName = 'ch' + (短写作当前章 + 1) + '.txt';
  var content = 短formatForStorage(editor.innerText);
  ch._written = !!content.trim();
  ch._wordCount = wordCount(content);
  var now = new Date();
  var headerSave = document.getElementById('writingSaveStatusHeader');
  if (headerSave) headerSave.textContent = '已保存 ' + fmtDate(now);
  Store.vignette.saveChapter(vignetteCurrentTitle, chName, content).then(function() {
    短renderChapterList();
    短recordWritingStreak();
    短renderStreakBar();
  });
}

// ===== Exports =====
window.渲染短章写作 = 渲染短章写作;
window.renderVignetteWriting = window.渲染短章写作;
window.短章AI生成章节 = typeof window.短章AI生成章节 !== 'undefined' ? window.短章AI生成章节 : function() { toast('AI 生成模块未加载'); };
window.短章AI续写 = function() { openAiGenPanel('v_write_continue'); };
window.短章AI重写 = 短章改写;
window.短章AI扩写 = 短章扩写;
window.短章AI润色 = 短章润色;

// ===== 选区感知的改写/扩写/润色 =====
function 短章改写() {
  var editor = document.getElementById('writingEditor');
  var sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && !sel.isCollapsed && editor && editor.contains(sel.anchorNode)) {
    window._shortWriteSel = { text: sel.toString(), range: sel.getRangeAt(0).cloneRange() };
    openAiGenPanel('v_write_rewrite');
  } else {
    toast('请先在正文中选中要处理的文字');
  }
}
function 短章扩写() {
  var editor = document.getElementById('writingEditor');
  var sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && !sel.isCollapsed && editor && editor.contains(sel.anchorNode)) {
    window._shortWriteSel = { text: sel.toString(), range: sel.getRangeAt(0).cloneRange() };
    openAiGenPanel('v_write_expand');
  } else {
    toast('请先在正文中选中要处理的文字');
  }
}
function 短章润色() {
  var editor = document.getElementById('writingEditor');
  var sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && !sel.isCollapsed && editor && editor.contains(sel.anchorNode)) {
    window._shortWriteSel = { text: sel.toString(), range: sel.getRangeAt(0).cloneRange() };
    openAiGenPanel('v_write_polish');
  } else {
    toast('请先在正文中选中要处理的文字');
  }
}
window.短章改写 = 短章改写;
window.短章扩写 = 短章扩写;
window.短章润色 = 短章润色;
window.短章保存当前章 = 短章保存当前章;
window.短章批量生成未写 = 短章批量生成未写;
window.短手动快照 = 短手动快照;
window.短renderPlanChips = 短renderPlanChips;
