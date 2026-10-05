// 生图识图 · 图生图功能

// ===== 图生图 =====
function renderI2I(el) {
  if (!I2I.model) I2I.model = S.settings.runninghubDefaultI2i || '';
  var models = RH.allI2iModels();
  var prefix = 'i2i';

  var h = '';
  // 模型选择：不预设，候选来自官方抓取，也可直接手输模型 id
  h += '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--border)">';
  h += '<span style="font-size:12px;color:var(--fg2);margin-right:4px">生图模型:</span>';
  h += 组合框HTML({ id: prefix + 'Model', value: I2I.model, placeholder: '点开选已获取的官方模型，或手输模型 id', style: 'max-width:300px' });
  if (!models.length) h += '<span style="font-size:11px;color:var(--fg3)">尚未获取模型：请到 设置 → 生图 API 点「🔄 获取可用模型」</span>';
  h += '</div>';

  // 提示词
  h += '<div style="margin-bottom:8px">';
  h += '<label style="font-size:0.8em;color:var(--fg2);display:block;margin-bottom:3px">提示词</label>';
  h += '<textarea id="' + prefix + 'Prompt" class="llm-input" style="width:100%;min-height:80px;resize:vertical;font-size:0.85em" placeholder="描述你想生成的画面...">' + escHtml(I2I.prompt) + '</textarea>';
  h += '</div>';

  // 参考图片
  h += '<div style="margin-bottom:8px">';
  h += '<label style="font-size:0.8em;color:var(--fg2);display:block;margin-bottom:3px">参考图片</label>';
  h += '<div style="display:flex;gap:6px;align-items:center">';
  h += '<input id="' + prefix + 'ImageUrl" type="text" class="llm-input" style="flex:1;font-size:0.82em" placeholder="输入图片 URL，或点击右侧上传..." value="' + escHtml(I2I.imageUrl) + '" />';
  h += '<button class="btn-out" style="font-size:0.78em;white-space:nowrap" onclick="document.getElementById(\'' + prefix + 'FileInput\').click()">📁 选择文件</button>';
  h += '<input type="file" id="' + prefix + 'FileInput" accept="image/*" style="display:none" />';
  h += '</div>';
  if (I2I.imageUrl) {
    h += '<div style="margin-top:6px"><img src="' + escHtml(I2I.imageUrl) + '" style="max-width:200px;max-height:150px;border-radius:4px;border:1px solid var(--border)" /></div>';
  }
  h += '</div>';

  // 尺寸 + 负面提示词
  h += renderSizeAndNegative(I2I, prefix);

  // 生成按钮 + 结果
  h += renderGenButtons(I2I, prefix, 'onI2IGenerate', 'onI2ICancel');
  h += renderResultsArea(I2I, prefix, 'onI2IClear');

  el.innerHTML = h;

  // 绑定事件
  bindInput(prefix + 'Prompt', function(v) { I2I.prompt = v; });
  bindInput(prefix + 'Negative', function(v) { I2I.negativePrompt = v; });
  bindModelSelect(prefix + 'Model', function(v) { I2I.model = v; });
  bindSizeInputs(I2I, prefix);
  bindImageUrl(I2I, prefix);
  bindFileUpload(I2I, prefix, el);
  attachCombo(prefix + 'Model', {
    getOptions: function() { return RH.modelOptions(RH.allI2iModels()); },
    emptyHint: '尚未获取模型：请到 设置 → 生图 API 点「🔄 获取可用模型」，也可以直接手输模型 id',
  });
}

function onI2IGenerate() {
  if (I2I.status === 'submitting' || I2I.status === 'waiting') return;
  var prompt = I2I.prompt.trim();
  if (!prompt) { toast('请输入提示词'); return; }
  if (!I2I.model) { toast('请先选择或输入生图模型（设置 → 生图 API 里可点「🔄 获取可用模型」）'); return; }
  if (!I2I.imageUrl) { toast('图生图需要提供参考图片'); return; }
  I2I.status = 'submitting'; I2I.statusText = '提交任务...';
  updateGenStatus(I2I, 'i2i');
  // 本地文件是 dataURL，RunningHub 只接受 http(s) URL，先上传转换
  RH.uploadImage(I2I.imageUrl).then(function(uploadedUrl) {
    return RH.imageToImage(I2I.model, { prompt: prompt, imageUrl: uploadedUrl, width: I2I.width, height: I2I.height, negativePrompt: I2I.negativePrompt.trim() || undefined });
  })
    .then(function(res) { handleSubmitResult(I2I, res, 'i2i'); })
    .catch(function(err) { handleSubmitError(I2I, err, 'i2i'); });
}

function onI2ICancel() { cancelGen(I2I, 'i2i'); }
function onI2IClear() { clearResults(I2I, 'i2i'); }
