// 生图词典 · ③ 本地视频提示词 tab + 视频拆分工具 tab
// 依赖：entry.js（STCD/stcdModeChips/stcdCharBoxHTML/stcdResultHTML/stcdFillResult/stcdModeVar/stcdFormatVar）；picker.js

// ===== ③ 本地视频提示词 tab（格式与本地提示词一致，面向视频生成工具）=====
var STCD_VIDEO_MODELS = [
  { id: 'wan', label: 'Wan(万相)' },
  { id: 'h3', label: 'MiniMax H3(海螺)' },
];
// H3 下的生成方式子选择（文生视频 T2VA / 图生视频 I2VA / 参考视频 V2V）
var STCD_VIDEO_H3_MODES = [
  { id: 't2v', label: '文生视频' },
  { id: 'i2v', label: '图生视频' },
  { id: 'v2v', label: '参考视频' },
];
STCD.videoModel = STCD.videoModel || 'h3';
STCD.videoH3Mode = STCD.videoH3Mode || 't2v';
STCD.videoFirstFrame = STCD.videoFirstFrame || null;  // 图生视频首帧 dataURL
STCD.videoFirstFrameDesc = STCD.videoFirstFrameDesc || null;  // 首帧自动识图描述（I2V，生成前注入）
STCD.videoLastFrame = STCD.videoLastFrame || null;     // 尾帧图 dataURL（动态壁纸-首尾帧）
STCD.videoLastFrameDesc = STCD.videoLastFrameDesc || null;  // 尾帧自动识图描述
STCD.videoLoopEnd = STCD.videoLoopEnd || 5;            // 循环尾帧对齐秒数
STCD.videoRefSegs = STCD.videoRefSegs || [];          // 参考视频片段列表（V2V，[{name,path}]）
STCD.videoWallpaperMode = STCD.videoWallpaperMode || (STCD.videoWallpaper ? 'single' : 'off');  // off / single(单帧) / loop(首尾帧)
var STCD_WALLPAPER_MODE_LABELS = { off: '关', single: '动态壁纸', loop: '动态壁纸-首尾帧' };

// 动态壁纸锁定措辞（单帧）——完整豁免基底的分镜/运镜规则，避免冲突
var STCD_WALLPAPER_RULE = '当用户选择动态壁纸模式时：此模式**完整豁免**提示词基底中的分镜/运镜规则，以下规则优先于一切镜头指令——严格锁定原图，构图/姿势/位置/外观全程不变，只保留呼吸、眨眼、发丝飘动、目光微动等细微动作；镜头完全静止（static shot），不换镜头、不写任何运镜指令（不写推近/拉远/环绕/跟随/横移/升降/手持/俯仰/摇移等），不增加位移、转身、走动、坐下等任何大动作；原图任何细节（无论内容如何，包括裸体）都原样保留，不增删服装或其他元素；整段视频只保留一个镜头。';

// 动态壁纸-首尾帧（官方 I2VA 关键帧格式）：双参考图卡住首尾 + 无缝循环
var STCD_WALLPAPER_LOOP_RULE = '用户选择【动态壁纸-首尾帧】模式时：以首帧图与尾帧图两张参考图定义视频的两端——图1对齐视频 0.00 秒处，图2对齐片段末尾（即循环尾帧对齐秒）；若图1与图2逐像素一致，则片段可无缝循环。此模式**完整豁免**提示词基底中的分镜/运镜规则，以下优先于一切镜头指令——镜头完全静止（static locked camera，固定机位、平视、全程同一构图），不换镜头、不写任何运镜指令；只保留呼吸、眨眼、发丝、织物/窗帘微动、光尘、花瓣、光环脉动等细微动作，其余一切（桌/椅/背景文字/海报/阴影/天气/光线）保持绝对静止；动作前半段缓慢起、后半段衰减至零，最终精确落在图2所确立的状态上。原图任何细节（无论内容如何，包括裸体）都原样保留，不增删任何元素；整段只保留一个镜头。音效与配乐也须配合循环：无明显的开头/结尾重音，结束与开头无缝衔接。';

function stcdRenderVideo(el) {
  var h = '';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start">';
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px">';
  h += '<div style="font-size:14px;color:var(--fg);font-weight:700;margin-bottom:4px">🎬 视频创作要求</div>';
  h += '<div style="font-size:11px;color:var(--fg3);margin-bottom:8px">本地视频工具无审查，描述直白自由，想说什么就说什么</div>';
  // 目标模型选择器
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap">';
  h += '<span style="font-size:12px;color:var(--fg2);font-weight:600">🎯 目标模型</span>';
  h += '<select id="stcd-video-model" class="llm-input llm-select" style="font-size:12px;padding:3px 8px" onchange="stcdVideoModelChanged()">';
  STCD_VIDEO_MODELS.forEach(function(m) {
    h += '<option value="' + m.id + '"' + (m.id === STCD.videoModel ? ' selected' : '') + '>' + escHtml(m.label) + '</option>';
  });
  h += '</select>';
  // H3 下的生成方式子选择
  if (STCD.videoModel === 'h3') {
    h += '<span style="font-size:12px;color:var(--fg2);font-weight:600">生成方式</span>';
    h += '<select id="stcd-video-h3mode" class="llm-input llm-select" style="font-size:12px;padding:3px 8px" onchange="stcdVideoH3ModeChanged()">';
    STCD_VIDEO_H3_MODES.forEach(function(m) {
      h += '<option value="' + m.id + '"' + (m.id === STCD.videoH3Mode ? ' selected' : '') + '>' + escHtml(m.label) + '</option>';
    });
    h += '</select>';
  }
  h += '<span style="font-size:10px;color:var(--fg3)">提示词将按所选模型的规范生成</span>';
  h += '</div>';
  // 图生视频：首帧图上传框（仅 H3 + 图生视频）
  if (STCD.videoModel === 'h3' && STCD.videoH3Mode === 'i2v') {
    h += '<div style="margin-bottom:8px;border:1px dashed var(--border);border-radius:8px;padding:8px;text-align:center">';
    if (STCD.videoFirstFrame) {
      h += '<img src="' + STCD.videoFirstFrame + '" style="max-width:100%;max-height:140px;border-radius:6px;object-fit:contain;background:var(--bg2)" />';
      h += '<div style="display:flex;gap:6px;justify-content:center;margin-top:4px">';
      h += '<button class="btn-out" style="padding:2px 8px;font-size:10px" onclick="stcdVideoPickFirstFrame()">🔄 换图</button>';
      h += '<button class="btn-out" style="padding:2px 8px;font-size:10px;color:#e06c75" onclick="STCD.videoFirstFrame=null;STCD.videoFirstFrameDesc=null;if(STCD.videoWallpaperMode===\'loop\'){STCD.videoLastFrame=null;STCD.videoLastFrameDesc=null;}stcdRenderVideo(document.getElementById(\'stcdTabContent\'))">🗑 移除</button>';
      h += '</div>';
    } else {
      h += '<div style="font-size:11px;color:var(--fg3);margin-bottom:6px">🎞 首帧图（图生视频需要）</div>';
      h += '<button class="btn-out" style="padding:3px 10px;font-size:11px" onclick="stcdVideoPickFirstFrame()">📷 上传首帧图</button>';
    }
    h += '</div>';
    // 壁纸子模式（关 / 动态壁纸 / 动态壁纸-首尾帧）
    h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap">';
    h += '<span style="font-size:12px;color:var(--fg2);font-weight:600">🎞 壁纸子模式</span>';
    h += '<span class="preset-chip' + (STCD.videoWallpaperMode === 'off' ? ' preset-active' : '') + '" style="cursor:pointer" onclick="stcdVideoSetWallpaperMode(\'off\')">关</span>';
    h += '<span class="preset-chip' + (STCD.videoWallpaperMode === 'single' ? ' preset-active' : '') + '" style="cursor:pointer" onclick="stcdVideoSetWallpaperMode(\'single\')">🎞 动态壁纸</span>';
    h += '<span class="preset-chip' + (STCD.videoWallpaperMode === 'loop' ? ' preset-active' : '') + '" style="cursor:pointer" onclick="stcdVideoSetWallpaperMode(\'loop\')">🎞 动态壁纸-首尾帧</span>';
    h += '</div>';
    if (STCD.videoWallpaperMode === 'single') {
      h += '<div style="font-size:10px;color:var(--fg3);margin-bottom:8px">已启用：锁定原图构图，镜头完全静止，仅呼吸/眨眼/发丝微动等细微动作</div>';
    } else if (STCD.videoWallpaperMode === 'loop') {
      // 尾帧图上传框（默认=首帧，可换不同尾帧）
      h += '<div style="margin-bottom:8px;border:1px dashed var(--border);border-radius:8px;padding:8px;text-align:center">';
      if (STCD.videoLastFrame) {
        var _tailIsFirst = STCD.videoLastFrame === STCD.videoFirstFrame;
        h += '<div style="font-size:11px;color:var(--fg3);margin-bottom:4px">🎞 尾帧图（' + (_tailIsFirst ? '默认=首帧' : '已替换') + '，对齐循环末尾）</div>';
        h += '<img src="' + STCD.videoLastFrame + '" style="max-width:100%;max-height:140px;border-radius:6px;object-fit:contain;background:var(--bg2)" />';
        h += '<div style="display:flex;gap:6px;justify-content:center;margin-top:4px;flex-wrap:wrap">';
        h += '<button class="btn-out" style="padding:2px 8px;font-size:10px" onclick="stcdVideoPickLastFrame()">🔄 换尾帧</button>';
        if (!_tailIsFirst) {
          h += '<button class="btn-out" style="padding:2px 8px;font-size:10px" onclick="STCD.videoLastFrame=STCD.videoFirstFrame;STCD.videoLastFrameDesc=STCD.videoFirstFrameDesc;stcdRenderVideo(document.getElementById(\'stcdTabContent\'))">🔁 恢复为首帧</button>';
        }
        h += '<button class="btn-out" style="padding:2px 8px;font-size:10px;color:#e06c75" onclick="STCD.videoLastFrame=null;STCD.videoLastFrameDesc=null;stcdRenderVideo(document.getElementById(\'stcdTabContent\'))">🗑 移除</button>';
        h += '</div>';
      } else {
        h += '<div style="font-size:11px;color:var(--fg3);margin-bottom:6px">🎞 尾帧图（默认跟随首帧；不传时视为与首帧一致）</div>';
        h += '<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap">';
        h += '<button class="btn-out" style="padding:3px 10px;font-size:11px" onclick="stcdVideoPickLastFrame()">📷 上传尾帧图</button>';
        h += '<button class="btn-out" style="padding:3px 10px;font-size:11px" onclick="STCD.videoLastFrame=STCD.videoFirstFrame;STCD.videoLastFrameDesc=STCD.videoFirstFrameDesc;stcdRenderVideo(document.getElementById(\'stcdTabContent\'))">🔁 用首帧作为尾帧</button>';
        h += '</div>';
      }
      h += '</div>';
      // 尾帧对齐秒数
      h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap">';
      h += '<span style="font-size:11px;color:var(--fg2)">尾帧对齐秒数</span>';
      h += '<input type="number" min="1" max="15" step="0.5" value="' + (STCD.videoLoopEnd || 5) + '" style="width:64px;padding:2px 6px;font-size:11px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;color:var(--fg)" onchange="STCD.videoLoopEnd=parseFloat(this.value)||5;" />';
      h += '<span style="font-size:10px;color:var(--fg3)">图2将对齐此秒（片段末尾），与图1一致可无缝循环</span>';
      h += '</div>';
    }
  }
  // 参考视频：参考片段选择器（仅 H3 + 参考视频）
  if (STCD.videoModel === 'h3' && STCD.videoH3Mode === 'v2v') {
    h += '<div style="margin-bottom:8px;border:1px dashed var(--border);border-radius:8px;padding:8px">';
    h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">';
    h += '<span style="font-size:12px;color:var(--fg2);font-weight:600">📼 参考视频片段</span>';
    h += '<button class="btn-out" style="padding:2px 8px;font-size:10px" onclick="stcdVideoRefPick()">➕ 添加片段</button>';
    if (STCD.videoRefSegs.length) h += '<button class="btn-out" style="padding:2px 8px;font-size:10px;color:#e06c75" onclick="STCD.videoRefSegs=[];stcdRenderVideo(document.getElementById(\'stcdTabContent\'))">🗑 清空</button>';
    h += '</div>';
    if (STCD.videoRefSegs.length) {
      STCD.videoRefSegs.forEach(function(seg, i) {
        h += '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:11px;color:var(--fg)">';
        h += '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">🎞 ' + escHtml(seg.name) + '</span>';
        h += '<button class="btn-out" style="padding:0 6px;font-size:10px;color:#e06c75" onclick="stcdVideoRefRemove(' + i + ')">✕</button>';
        h += '</div>';
      });
    } else {
      h += '<div style="font-size:11px;color:var(--fg3)">添加已通过「✂️ 视频拆分」生成的合规参考片段（≤15s、≤50MB、MP4/H.264），提示词将按参考片段的动作/风格保持一致</div>';
    }
    h += '</div>';
  }
  h += stcdCharBoxHTML('stcd-video-char');
  h += stcdModeChips();
  h += '<textarea id="stcd-video-require" class="llm-input" style="width:100%;min-height:120px;resize:vertical" placeholder="例：红裙少女从床上起身，镜头缓缓推进，裙摆飘动"></textarea>';
  h += '<div style="display:flex;gap:8px;margin-top:12px">';
  h += '<button class="btn-main" onclick="stcdGen(\'video\')">🤖 生成视频提示词</button>';
  h += '<button class="btn-out" onclick="document.getElementById(\'stcd-video-require\').value=\'\'">清空</button>';
  h += '</div>';
  h += '</div>';
  h += '<div>' + stcdResultHTML('stcd-video') + '</div>';
  h += '</div>';
  el.innerHTML = h;
  // 渲染后按当前模型/生成方式重新注册 AI 字段
  if (typeof stcdRegisterVideoGenField === 'function') stcdRegisterVideoGenField();
}

// H3 生成方式切换（文生/图生）→ 重渲染显示首帧图框 + 重新注册字段
function stcdVideoH3ModeChanged() {
  var sel = document.getElementById('stcd-video-h3mode');
  if (sel) STCD.videoH3Mode = sel.value;
  stcdRenderVideo(document.getElementById('stcdTabContent'));
}

// 首帧图选择（文件选择器 → dataURL → 存 STCD.videoFirstFrame → 重渲染）
function stcdVideoPickFirstFrame() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.display = 'none';
  document.body.appendChild(input);
  input.addEventListener('change', function(e) {
    var file = e.target.files && e.target.files[0];
    document.body.removeChild(input);
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      STCD.videoFirstFrame = ev.target.result;
      STCD.videoFirstFrameDesc = null;  // 换图后清空旧识图描述
      // 首尾帧模式：默认尾帧=首帧（无缝循环，图1=图2）
      if (STCD.videoWallpaperMode === 'loop') {
        STCD.videoLastFrame = ev.target.result;
        STCD.videoLastFrameDesc = null;
      }
      stcdRenderVideo(document.getElementById('stcdTabContent'));
    };
    reader.onerror = function() { toast('读取文件失败'); };
    reader.readAsDataURL(file);
  });
  input.click();
}

function stcdVideoModelChanged() {
  var sel = document.getElementById('stcd-video-model');
  if (sel) STCD.videoModel = sel.value;
  stcdRenderVideo(document.getElementById('stcdTabContent'));
}

// 壁纸子模式切换（关 / 动态壁纸 / 动态壁纸-首尾帧）
function stcdVideoSetWallpaperMode(mode) {
  STCD.videoWallpaperMode = mode;
  STCD.videoWallpaper = (mode !== 'off');  // 兼容旧引用
  // 切到首尾帧：若已有首帧且未设尾帧，默认尾帧=首帧（无缝循环）
  if (mode === 'loop' && STCD.videoFirstFrame && !STCD.videoLastFrame) {
    STCD.videoLastFrame = STCD.videoFirstFrame;
    STCD.videoLastFrameDesc = STCD.videoFirstFrameDesc;
  }
  if (typeof stcdRegisterVideoGenField === 'function') stcdRegisterVideoGenField();
  stcdRenderVideo(document.getElementById('stcdTabContent'));
}

// 尾帧图选择（文件选择器 → dataURL → 存 STCD.videoLastFrame → 重渲染）
function stcdVideoPickLastFrame() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.display = 'none';
  document.body.appendChild(input);
  input.addEventListener('change', function(e) {
    var file = e.target.files && e.target.files[0];
    document.body.removeChild(input);
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      STCD.videoLastFrame = ev.target.result;
      STCD.videoLastFrameDesc = null;  // 换图后清空旧识图描述
      stcdRenderVideo(document.getElementById('stcdTabContent'));
    };
    reader.onerror = function() { toast('读取文件失败'); };
    reader.readAsDataURL(file);
  });
  input.click();
}

// ===== 参考视频（V2V）片段选择 =====
function stcdVideoRefPick() {
  if (!window.narrative || !window.narrative.videoPickFile) { toast('主进程视频工具未就绪'); return; }
  window.narrative.videoPickFile().then(function(res) {
    if (!res || !res.ok) { if (res && res.canceled) return; toast(res && res.error ? res.error : '选择失败'); return; }
    var name = (res.filePath || '').split(/[\\/]/).pop();
    STCD.videoRefSegs.push({ name: name, path: res.filePath });
    stcdRenderVideo(document.getElementById('stcdTabContent'));
    toast('已添加参考片段：' + name);
  });
}
function stcdVideoRefRemove(i) {
  if (i >= 0 && i < STCD.videoRefSegs.length) STCD.videoRefSegs.splice(i, 1);
  stcdRenderVideo(document.getElementById('stcdTabContent'));
}

// ===== 首帧/尾帧自动识图：把参考图描述成英文文字（供 I2VA 首尾帧对齐）=====
function stcdDescribeFirstFrame(dataUrl, label) {
  label = label || '首帧';
  return new Promise(function(resolve, reject) {
    if (!dataUrl) { resolve('未上传' + label + '图'); return; }
    if (typeof 大模型 === 'undefined' || !大模型 || typeof 大模型.调用JSON !== 'function') {
      reject(new Error('多模态识图不可用'));
      return;
    }
    var sys = '你是视频参考画面分析助手。仔细查看传入的' + label + '图片，用**英文**写一段简洁、客观、可直接用于提示词对齐的画面描述，覆盖：画面中的主体及其外观/姿态、所处场景与环境、光线氛围、拍摄视角与景别、整体构图。只做客观描述，不做评价、不推测其即将发生的动作。';
    var text = '请用英文描述该' + label + '画面，用于 H3 图生视频提示词的' + label + '对齐。\n\n只输出 JSON：\n{"description":"英文画面描述"}';
    var content = [{ type: 'text', text: text }];
    content.push({ type: 'image_url', image_url: { url: dataUrl } });
    var opts = {
      system: sys,
      label: '视频' + label + '描述',
      messages: [{ role: 'user', content: content }],
      noPrefix: true,  // 首帧/尾帧描述是中性识图任务，跳过全局成人前缀
    };
    var configId = (typeof 生图识图获取配置Id === 'function') ? 生图识图获取配置Id() : undefined;
    if (configId) opts.configId = configId;
    大模型.调用JSON(opts).then(function(data) {
      if (data && typeof data === 'object' && data.description) resolve(String(data.description).trim());
      else if (data && typeof data === 'string' && data.trim()) resolve(data.trim());
      else resolve('已上传' + label + '图（自动识图未返回描述，生成时请手动补充' + label + '画面描述）');
    }).catch(reject);
  });
}

// 视频提示词 AI 字段注册（模型/生成方式切换时重新注册）
function stcdRegisterVideoGenField() {
  if (typeof registerAiField !== 'function') return;
  var promptName;
  if (STCD.videoModel === 'h3') {
    if (STCD.videoH3Mode === 'i2v') promptName = (STCD.videoWallpaperMode === 'loop') ? 'local_video_prompt_gen_h3_wallpaper_loop' : 'local_video_prompt_gen_h3_i2v';
    else if (STCD.videoH3Mode === 'v2v') promptName = 'local_video_prompt_gen_h3_v2v';
    else promptName = 'local_video_prompt_gen_h3_t2v';
  } else {
    promptName = 'local_video_prompt_gen_wan';
  }
  registerAiField('stcd-video-gen', '本地视频提示词', function() {
    var text = (document.getElementById('stcd-video-require') || {}).value || '';
    var char = (document.getElementById('stcd-video-char') || {}).value || '';
    var isI2v = STCD.videoModel === 'h3' && STCD.videoH3Mode === 'i2v';
    var wpMode = isI2v ? STCD.videoWallpaperMode : 'off';
    var v = {
      mode: stcdModeVar(),
      outputFormat: stcdFormatVar(),
      firstFrame: STCD.videoFirstFrameDesc || (STCD.videoFirstFrame ? '已上传首帧图（点击生成时会自动识图描述首帧）' : '未上传首帧图'),
      lastFrame: STCD.videoLastFrameDesc || (STCD.videoLastFrame ? '已上传尾帧图（点击生成时会自动识图描述尾帧）' : '未上传尾帧图'),
      loopEnd: STCD.videoLoopEnd || 5,
      refVideo: STCD.videoRefSegs.length ? STCD.videoRefSegs.map(function(s, i) { return (i + 1) + '.' + s.name; }).join('\n') : '未选择参考视频片段',
      wallpaperMode: '',
      wallpaperRule: '',
    };
    if (wpMode === 'single') {
      v.wallpaperMode = '【动态壁纸模式】（重要：此模式**完整豁免**下方提示词基底中的分镜/运镜规则，以下规则优先于一切镜头指令）严格锁定原图：构图/姿势/位置/外观全程不变，只保留呼吸、眨眼、发丝飘动、目光微动等细微动作。镜头完全静止（static shot）：不换镜头、不写任何运镜指令（不写推近/拉远/环绕/跟随/横移/升降/手持/俯仰/摇移等），不增加位移、转身、走动、坐下等任何大动作。原图任何细节（无论内容如何，包括裸体）都原样保留，不增删服装或任何元素。整段视频只保留一个镜头。';
      v.wallpaperRule = '用户要求动态壁纸风格：按锁定原图+细微动作规则输出，仅单镜头、零运镜，豁免一切分镜/运镜指令。';
    } else if (wpMode === 'loop') {
      v.wallpaperMode = '【动态壁纸-首尾帧模式】' + STCD_WALLPAPER_LOOP_RULE;
      v.wallpaperRule = '动态壁纸-首尾帧：以首帧与尾帧两张参考图定义首尾，镜头完全静止、只做细微动态，动作衰减至零并定格到尾帧状态，可无缝循环；豁免一切分镜/运镜指令。';
    }
    v.user = char ? '【人物】\n' + char + '\n\n【创作要求】\n' + text : text;
    return v;
  }, {
    suggestPrompt: promptName,
    fillFn: function(d) { stcdFillResult('stcd-video', d); toast('生成完成'); },
  });
}

// ===== 视频拆分工具 tab（独立工具：大视频按 15 秒段拆分重编码，符合 H3 参考视频限制）=====
var STCD_VIDEOSPLIT = { filePath: '', fileName: '', durationSec: 0, width: null, height: null, segments: [], splitting: false, segDur: 15 };

function stcdRenderVideoSplit(el) {
  var s = STCD_VIDEOSPLIT;
  var h = '';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start">';
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px">';
  h += '<div style="font-size:14px;color:var(--fg);font-weight:700;margin-bottom:4px">✂️ 视频参考片段拆分</div>';
  h += '<div style="font-size:11px;color:var(--fg3);margin-bottom:10px">把大视频自动拆成多个合规参考片段（MiniMax H3 限制：单段 ≤50MB、≤15 秒、MP4/H.264）。</div>';
  // 选择视频
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">';
  h += '<button class="btn-main" style="padding:4px 12px;font-size:11px" onclick="stcdVideoSplitPick()">📁 选择视频</button>';
  if (s.fileName) {
    h += '<span style="font-size:12px;color:var(--fg);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(s.fileName) + '</span>';
  } else {
    h += '<span style="font-size:11px;color:var(--fg3)">未选择视频（支持 mp4/mov/mkv/webm）</span>';
  }
  h += '</div>';
  // 视频信息
  if (s.fileName) {
    var infoParts = [];
    if (s.durationSec) infoParts.push('时长 ' + s.durationSec + 's');
    if (s.width && s.height) infoParts.push(s.width + '×' + s.height);
    h += '<div style="font-size:11px;color:var(--fg2);margin-bottom:10px">' + escHtml(infoParts.join(' · ')) + '</div>';
    // 每段秒数
    h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">';
    h += '<span style="font-size:12px;color:var(--fg2)">每段时长</span>';
    h += '<select id="stcd-videosplit-segdur" class="llm-input llm-select" style="font-size:12px;padding:3px 8px">';
    [5, 10, 15].forEach(function(d) {
      h += '<option value="' + d + '"' + (d === s.segDur ? ' selected' : '') + '>' + d + ' 秒</option>';
    });
    h += '</select>';
    h += '<button class="btn-main" style="padding:4px 12px;font-size:11px"' + (s.splitting ? ' disabled' : '') + ' onclick="stcdVideoSplitRun()">' + (s.splitting ? '⏳ 拆分中…' : '✂️ 拆分为参考片段') + '</button>';
    h += '</div>';
  }
  // 进度
  if (s.splitting) {
    h += '<div style="font-size:11px;color:var(--accent);margin-bottom:8px">⏳ 正在拆分第 ' + (s.progressSeg || 0) + '/' + (s.progressTotal || '?') + ' 段…（重编码压码率，耗时与视频大小相关）</div>';
  }
  h += '</div>';
  // 片段列表
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px">';
  h += '<div style="font-size:13px;color:var(--fg);font-weight:600;margin-bottom:6px">📦 拆分结果（' + s.segments.length + ' 段）</div>';
  if (!s.segments.length) {
    h += '<div style="font-size:12px;color:var(--fg3)">选择视频并点击「拆分为参考片段」后，片段列表显示在这里</div>';
  } else {
    s.segments.forEach(function(seg, i) {
      var sizeMB = (seg.sizeBytes / 1024 / 1024).toFixed(1);
      var ok = seg.sizeBytes <= 50 * 1024 * 1024;
      h += '<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)">';
      h += '<div style="flex:1;min-width:0">';
      h += '<div style="font-size:12px;color:var(--fg)">片段' + seg.index + '（' + seg.startSec + 's - ' + (seg.startSec + seg.durationSec) + 's）</div>';
      h += '<div style="font-size:10px;color:var(--fg3)">' + sizeMB + 'MB' + (ok ? ' ✅ 合规' : ' ⚠️ 超 50MB') + '</div>';
      h += '</div>';
      h += '<button class="btn-out" style="padding:2px 8px;font-size:10px" onclick="stcdVideoSplitOpen(' + i + ')">📂 打开位置</button>';
      h += '<button class="btn-out" style="padding:2px 8px;font-size:10px" onclick="stcdVideoSplitCopy(' + i + ')">📋 复制路径</button>';
      h += '</div>';
    });
  }
  h += '</div>';
  h += '</div>';
  el.innerHTML = h;
}

// 选择视频文件
function stcdVideoSplitPick() {
  if (!window.narrative || !window.narrative.videoPickFile) { toast('主进程视频工具未就绪'); return; }
  window.narrative.videoPickFile().then(function(res) {
    if (!res || !res.ok) { if (res && res.canceled) return; toast(res && res.error ? res.error : '选择失败'); return; }
    STCD_VIDEOSPLIT.filePath = res.filePath;
    STCD_VIDEOSPLIT.fileName = (res.filePath || '').split(/[\\/]/).pop();
    STCD_VIDEOSPLIT.durationSec = 0;
    STCD_VIDEOSPLIT.width = null;
    STCD_VIDEOSPLIT.height = null;
    STCD_VIDEOSPLIT.segments = [];
    // 探测信息
    if (window.narrative.videoProbe) {
      window.narrative.videoProbe(res.filePath).then(function(pr) {
        if (pr && pr.ok) {
          STCD_VIDEOSPLIT.durationSec = pr.durationSec;
          STCD_VIDEOSPLIT.width = pr.width;
          STCD_VIDEOSPLIT.height = pr.height;
        }
        stcdRenderVideoSplit(document.getElementById('stcdTabContent'));
      });
      return;
    }
    stcdRenderVideoSplit(document.getElementById('stcdTabContent'));
  });
}

// 执行拆分
function stcdVideoSplitRun() {
  var s = STCD_VIDEOSPLIT;
  if (!s.filePath || s.splitting) return;
  if (!window.narrative || !window.narrative.videoSplit) { toast('主进程视频工具未就绪'); return; }
  var segDurEl = document.getElementById('stcd-videosplit-segdur');
  s.segDur = segDurEl ? (parseInt(segDurEl.value, 10) || 15) : 15;
  s.splitting = true;
  s.segments = [];
  s.progressSeg = 0;
  var fileNameBase = (s.fileName || 'video').replace(/\.[^.]+$/, '');
  var outDir = '视频参考片段/' + fileNameBase + '/';
  stcdRenderVideoSplit(document.getElementById('stcdTabContent'));
  toast('开始拆分…');
  // 估算段数用于进度
  window.narrative.videoProbe(s.filePath).then(function(pr) {
    if (pr && pr.ok) s.progressTotal = Math.ceil(pr.durationSec / s.segDur);
    // 进度: 主进程一次性完成,先显示探测段数
    return window.narrative.videoSplit(s.filePath, outDir, s.segDur);
  }).then(function(res) {
    s.splitting = false;
    if (!res || !res.ok) {
      toast(res && res.error ? res.error : '拆分失败');
      stcdRenderVideoSplit(document.getElementById('stcdTabContent'));
      return;
    }
    s.segments = res.segments || [];
    s.progressSeg = 0;
    stcdRenderVideoSplit(document.getElementById('stcdTabContent'));
    toast('拆分完成：' + s.segments.length + ' 段');
  }).catch(function(e) {
    s.splitting = false;
    toast('拆分失败：' + (e && e.message ? e.message : '未知'));
    stcdRenderVideoSplit(document.getElementById('stcdTabContent'));
  });
}

// 打开片段所在位置
function stcdVideoSplitOpen(i) {
  var seg = STCD_VIDEOSPLIT.segments[i];
  if (!seg) return;
  if (window.narrative && window.narrative.fileOpenPath) {
    window.narrative.fileOpenPath(seg.file);
  } else {
    toast('无法打开');
  }
}

// 复制片段路径
function stcdVideoSplitCopy(i) {
  var seg = STCD_VIDEOSPLIT.segments[i];
  if (!seg) return;
  复制到剪贴板(seg.file).then(function(ok) {
    toast(ok ? '路径已复制' : '复制失败');
  });
}

window.stcdRenderVideo = stcdRenderVideo;
window.stcdVideoModelChanged = stcdVideoModelChanged;
window.stcdVideoH3ModeChanged = stcdVideoH3ModeChanged;
window.stcdVideoPickFirstFrame = stcdVideoPickFirstFrame;
window.stcdVideoPickLastFrame = stcdVideoPickLastFrame;
window.stcdVideoSetWallpaperMode = stcdVideoSetWallpaperMode;
window.stcdVideoRefPick = stcdVideoRefPick;
window.stcdVideoRefRemove = stcdVideoRefRemove;
window.stcdDescribeFirstFrame = stcdDescribeFirstFrame;
window.stcdRegisterVideoGenField = stcdRegisterVideoGenField;
window.stcdRenderVideoSplit = stcdRenderVideoSplit;
window.stcdVideoSplitPick = stcdVideoSplitPick;
window.stcdVideoSplitRun = stcdVideoSplitRun;
window.stcdVideoSplitOpen = stcdVideoSplitOpen;
window.stcdVideoSplitCopy = stcdVideoSplitCopy;
