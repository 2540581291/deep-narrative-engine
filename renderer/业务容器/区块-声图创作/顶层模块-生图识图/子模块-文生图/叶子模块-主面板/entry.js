// 生图识图 · 文生图功能

// ===== 文生图 =====
function renderT2I(el) {
  if (!T2I.model) T2I.model = S.settings.runninghubDefaultT2i || 'seedream-v4';
  var models = RH.allT2iModels();
  var prefix = 't2i';

  var h = '';
  // 模型选择
  h += '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--border)">';
  h += '<span style="font-size:12px;color:var(--fg2);margin-right:4px">生图模型:</span>';
  h += '<select id="' + prefix + 'Model" style="background:var(--bg2);color:var(--text);border:1px solid var(--border);border-radius:4px;padding:3px 8px;font-size:12px;max-width:200px">';
  models.forEach(function(m) {
    h += '<option value="' + m.id + '"' + (m.id === T2I.model ? ' selected' : '') + '>' + escHtml(m.provider) + ' · ' + escHtml(m.name) + '</option>';
  });
  h += '</select></div>';

  // 提示词
  h += '<div style="margin-bottom:8px">';
  h += '<label style="font-size:0.8em;color:var(--fg2);display:block;margin-bottom:3px">提示词</label>';
  h += '<textarea id="' + prefix + 'Prompt" class="llm-input" style="width:100%;min-height:80px;resize:vertical;font-size:0.85em" placeholder="描述你想生成的画面...">' + escHtml(T2I.prompt) + '</textarea>';
  h += '</div>';

  // 尺寸 + 负面提示词
  h += renderSizeAndNegative(T2I, prefix);

  // 生成按钮 + 结果
  h += renderGenButtons(T2I, prefix, 'onT2IGenerate', 'onT2ICancel');
  h += renderResultsArea(T2I, prefix, 'onT2IClear');

  el.innerHTML = h;

  // 绑定事件
  bindInput(prefix + 'Prompt', function(v) { T2I.prompt = v; });
  bindInput(prefix + 'Negative', function(v) { T2I.negativePrompt = v; });
  bindModelSelect(prefix + 'Model', function(v) { T2I.model = v; });
  bindSizeInputs(T2I, prefix);
}

function onT2IGenerate() {
  if (T2I.status === 'submitting' || T2I.status === 'waiting') return;
  var prompt = T2I.prompt.trim();
  if (!prompt) { toast('请输入提示词'); return; }
  T2I.status = 'submitting'; T2I.statusText = '提交任务...';
  updateGenStatus(T2I, 't2i');
  RH.textToImage(T2I.model, { prompt: prompt, width: T2I.width, height: T2I.height, negativePrompt: T2I.negativePrompt.trim() || undefined })
    .then(function(res) { handleSubmitResult(T2I, res, 't2i'); })
    .catch(function(err) { handleSubmitError(T2I, err, 't2i'); });
}

function onT2ICancel() { cancelGen(T2I, 't2i'); }
function onT2IClear() { clearResults(T2I, 't2i'); }
