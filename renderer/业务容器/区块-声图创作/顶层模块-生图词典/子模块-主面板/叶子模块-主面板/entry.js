// 声图创作 · 生图词典（5 tab：本地提示词 / 本地批量提示词 / 云端提示词 / 词典 / 视频拆分）
// 入口壳：仅保留 STCD 全局状态、渲染入口、tab 切换、公共结果区、各 tab 委托、生成入口。
// 拆分文件（加载顺序见 index.html）：
//   local-data.js  本地提示词数据层（选项定义/状态/持久化/时间线算法）
//   local-ui.js    本地提示词渲染层（本地 tab / 时间线面板 / 深化入口）
//   picker.js      角色选择器弹窗（正式角色卡 / 灵感角色库双源）
//   batch-ui.js    本地批量提示词 tab
//   video-ui.js    本地视频提示词 tab + 视频拆分工具 tab
//   cloud-ui.js    云端提示词 tab
//   ai-fields.js   AI 字段注册（二元模板）
//
// ⚠️「灵感角色库」已迁至「角色卡」顶层模块的子模块（子模块-灵感角色库），
//    生图词典不再持有该 tab。其数据仍通过全局 STCD_INSPIRE / stcdInspire* 供 picker 使用。

var STCD = window.STCD || { lastResult: null, currentTab: 'local', batchMode: 'multi', batchResult: [], outputMode: 'tag', localCharOpt: '', localFormOpt: '', localEventOpt: '', localStyleOpt: '', localCard: null, localOptDetail: {}, localOptSuggestList: {}, localOptSuggestSel: {}, localOptSuggestCount: 0, localOptSuggestCtx: null, localOptDeepenCtx: null };
var STCD_TABS = [
  { id: 'local', label: '🖥 本地提示词' },
  { id: 'batch', label: '📦 本地批量提示词' },
  { id: 'video', label: '📹 本地视频提示词' },
  { id: 'cloud', label: '☁️ 云端提示词' },
  { id: 'dict', label: '📖 词典' },
  { id: 'vidsplit', label: '✂️ 视频拆分' },
];
var stcdApi = null;

// 输出模式变量（提示词 tag 模式 / 自然语言模式）
function stcdModeVar() {
  return STCD.outputMode === 'natural'
    ? '【输出模式】自然语言模式：用流畅自然的英文句子描述画面，不要用逗号分隔的标签堆砌'
    : '【输出模式】提示词标签模式：用逗号分隔的英文标签（tag），一个词一个标签，简洁直接';
}
function stcdFormatVar() {
  return STCD.outputMode === 'natural'
    ? '【要求】用自然英文句子描述，流畅连贯，可带少量逗号分隔的修饰短语'
    : '【要求】prompt 用标签式短语，不要完整句子';
}

function 渲染生图词典(el) {
  if (!el) el = document.getElementById('sheng-tu-ci-dianContent');
  if (!el) return;
  // 第一层：6 个功能 tab 用芯片标签栏渲染
  if (!stcdApi) {
    stcdApi = 渲染标签栏(el, STCD_TABS, { active: STCD.currentTab, subId: 'stcdTabContent', onSwitch: function(t) { stcdSwitchTab(t); } });
  } else {
    stcdApi.setActive(STCD.currentTab);
  }
  stcdSwitchTab(STCD.currentTab);
}

function stcdSwitchTab(tab, skipRender) {
  STCD.currentTab = tab;
  if (stcdApi) stcdApi.setActive(tab);
  if (skipRender) return;
  var vEl = document.getElementById('stcdTabContent');
  if (!vEl) return;
  if (tab === 'local') stcdRenderLocal(vEl);
  else if (tab === 'batch') stcdRenderBatch(vEl);
  else if (tab === 'video') stcdRenderVideo(vEl);
  else if (tab === 'cloud') stcdRenderCloud(vEl);
  else if (tab === 'dict') stcdRenderDict(vEl);
  else if (tab === 'vidsplit') stcdRenderVideoSplit(vEl);
}

// ===== 公共：结果四区（英文提示词/中文提示词/中文解释）=====
function stcdResultHTML(prefix) {
  var h = '';
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px">';
  h += '<div style="display:flex;align-items:center;margin-bottom:6px">';
  h += '<div style="font-size:13px;color:var(--fg);font-weight:600;flex:1">🖼 英文提示词</div>';
  h += '<button class="btn-out" style="padding:2px 8px;font-size:11px" onclick="stcdCopy(\'' + prefix + '-prompt\')">📋 复制</button>';
  h += '<button class="btn-out" style="padding:2px 8px;font-size:11px;margin-left:4px" onclick="stcdCollectPrompt(\'' + prefix + '\')">⭐ 收藏入词库</button>';
  h += '</div>';
  h += '<textarea id="' + prefix + '-prompt" class="llm-input" style="width:100%;min-height:180px;resize:vertical" readonly placeholder="生成的英文提示词将显示在这里"></textarea>';
  h += '</div>';
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px">';
  h += '<div style="display:flex;align-items:center;margin-bottom:6px">';
  h += '<div style="font-size:13px;color:var(--fg);font-weight:600;flex:1">🈶 中文提示词</div>';
  h += '<button class="btn-out" style="padding:2px 10px;font-size:11px" onclick="stcdCopy(\'' + prefix + '-promptcn\')">📋 复制</button>';
  h += '</div>';
  h += '<textarea id="' + prefix + '-promptcn" class="llm-input" style="width:100%;min-height:130px;resize:vertical" readonly placeholder="AI 返回的中文提示词将显示在这里"></textarea>';
  h += '</div>';
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px">';
  h += '<div style="font-size:13px;color:var(--fg);font-weight:600;margin-bottom:6px">📝 中文解释</div>';
  h += '<div id="' + prefix + '-zh" style="font-size:12px;color:var(--fg2);line-height:1.7;min-height:60px">生成后显示提示词的中文说明</div>';
  h += '</div>';
  return h;
}

function stcdFillResult(prefix, d) {
  if (!d) return;
  var p = document.getElementById(prefix + '-prompt');
  var pc = document.getElementById(prefix + '-promptcn');
  var z = document.getElementById(prefix + '-zh');
  if (p && d.prompt) p.value = d.prompt;
  if (pc && d.prompt_cn) pc.value = d.prompt_cn;
  if (z && d.zh) z.textContent = d.zh;
}

// ===== 公共：输出模式 chips =====
function stcdModeChips() {
  var h = '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px">';
  h += '<span class="preset-chip' + (STCD.outputMode === 'tag' ? ' preset-active' : '') + '" onclick="stcdOutputMode(\'tag\')">🏷 标签模式</span>';
  h += '<span class="preset-chip' + (STCD.outputMode === 'natural' ? ' preset-active' : '') + '" onclick="stcdOutputMode(\'natural\')">📝 自然语言</span>';
  h += '</div>';
  return h;
}

function stcdOutputMode(mode) {
  STCD.outputMode = mode;
  var navItems = document.querySelectorAll('#sheng-tu-ci-dianContent .preset-chip');
  navItems.forEach(function(i) {
    var on = i.getAttribute('onclick') || '';
    if (on.indexOf("stcdOutputMode('tag')") >= 0) i.classList.toggle('preset-active', mode === 'tag');
    if (on.indexOf("stcdOutputMode('natural')") >= 0) i.classList.toggle('preset-active', mode === 'natural');
  });
}

// 收藏当前结果区提示词入词库（供 stcdResultHTML 的收藏按钮调用）
function stcdCollectPrompt(prefix) {
  var p = document.getElementById(prefix + '-prompt');
  var z = document.getElementById(prefix + '-zh');
  if (!p || !p.value.trim()) { toast('没有可收藏的提示词'); return; }
  if (typeof stcdAddToDict === 'function') {
    stcdAddToDict(p.value.trim(), z ? z.textContent.trim() : '');
  } else {
    toast('词库未就绪');
  }
}

// ===== ⑤ 词典 tab（词库浏览 / 组合拼装，委托 dict-ui.js）=====
function stcdRenderDict(el) {
  if (typeof stcdDictRender === 'function') stcdDictRender(el);
  else if (el) el.innerHTML = '<div style="font-size:12px;color:var(--fg3);padding:12px">词典组件未加载</div>';
}

// ===== 生成入口 =====
function stcdGen(tab) {
  var fieldId;
  if (tab === 'local') fieldId = 'stcd-local-gen';
  else if (tab === 'batch') fieldId = 'stcd-batch-gen';
  else if (tab === 'video') fieldId = 'stcd-video-gen';
  else if (tab === 'cloud') fieldId = 'stcd-cloud-gen';
  else fieldId = 'sheng-tu-ci-dian-gen';
  // 视频提示词：一步到位直生成，无需中途中再点「生成并填充」；其他 tab 仍走带方向选择的弹窗
  var launch = (tab === 'video' && typeof generateAiDirectNow === 'function') ? generateAiDirectNow : openAiGenPanel;
  // H3 图生视频：生成前先自动识图描述参考图（首帧 / 首尾帧），再直生成（供 I2VA 对齐）
  if (tab === 'video' && STCD.videoModel === 'h3' && STCD.videoH3Mode === 'i2v') {
    var frames = [];
    if (STCD.videoFirstFrame) frames.push({ key: 'videoFirstFrameDesc', url: STCD.videoFirstFrame, label: '首帧' });
    if (STCD.videoWallpaperMode === 'loop' && STCD.videoLastFrame && STCD.videoLastFrame !== STCD.videoFirstFrame) frames.push({ key: 'videoLastFrameDesc', url: STCD.videoLastFrame, label: '尾帧' });
    if (frames.length && typeof stcdDescribeFirstFrame === 'function') {
      toast('正在识图画面…');
      STCD.videoFirstFrameDesc = null;
      STCD.videoLastFrameDesc = null;
      var chain = Promise.resolve();
      frames.forEach(function(fr) {
        chain = chain.then(function() {
          return stcdDescribeFirstFrame(fr.url, fr.label).then(function(desc) { STCD[fr.key] = desc || ''; });
        });
      });
      chain.then(function() {
        // 尾帧=首帧时复用同一描述（无缝循环）
        if (STCD.videoLastFrame && STCD.videoLastFrame === STCD.videoFirstFrame) STCD.videoLastFrameDesc = STCD.videoFirstFrameDesc;
        launch(fieldId);
      }).catch(function(e) {
        console.log('[视频] 识图失败:', e);
        STCD.videoFirstFrameDesc = STCD.videoFirstFrameDesc || '已上传首帧图（自动识图失败，请手动补充）';
        STCD.videoLastFrameDesc = STCD.videoLastFrameDesc || '已上传尾帧图（自动识图失败，请手动补充）';
        launch(fieldId);
      });
      return;
    }
  }
  // 不校验空值：上面没填也能直接生成（AI 自行发挥）
  if (typeof launch === 'function') launch(fieldId);
  else toast('AI 建议系统未就绪');
}

function stcdCopy(id) {
  var el = document.getElementById(id);
  if (!el || !el.value.trim()) { toast('没有可复制的内容'); return; }
  复制到剪贴板(el.value.trim()).then(function(ok) {
    toast(ok ? '已复制' : '复制失败');
  });
}

// ===== 初始化 =====
registerPageRoute('sheng-tu-ci-dian', function(e) {
  渲染生图词典(e);
});

window.渲染生图词典 = 渲染生图词典;
window.stcdSwitchTab = stcdSwitchTab;
window.stcdGen = stcdGen;
window.stcdCopy = stcdCopy;
window.stcdOutputMode = stcdOutputMode;
window.stcdCollectPrompt = stcdCollectPrompt;
window.STCD = STCD;
