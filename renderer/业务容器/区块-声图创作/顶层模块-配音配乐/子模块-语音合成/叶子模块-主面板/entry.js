// 配音配乐 · 语音合成（② 语音合成 tab）

// ===== 设计标签组合 =====
var PY_GEN_ZH_TO_EN = {
  '女': 'female', '男': 'male',
  '儿童': 'child', '少年': 'teenager', '青年': 'young adult', '中年': 'middle-aged', '老年': 'elderly',
  '极低音调': 'very low pitch', '低音调': 'low pitch', '中音调': 'moderate pitch',
  '高音调': 'high pitch', '极高音调': 'very high pitch',
};

function pypyBuildInstruct() {
  var gender = document.getElementById('pypy-gen-gender').value;
  var age = document.getElementById('pypy-gen-age').value;
  var pitch = document.getElementById('pypy-gen-pitch').value;
  var style = document.getElementById('pypy-gen-style').value;
  var dialect = document.getElementById('pypy-gen-dialect').value;
  var parts = [gender, age, pitch];
  if (style) parts.push(style);
  if (dialect) parts.push(dialect);
  return parts.join('，');
}

function pypyUpdateInstructPreview() {
  var el = document.getElementById('pypy-gen-instruct-preview');
  if (el) el.textContent = pypyBuildInstruct();
}

// ===== 音色下拉（内置 + 克隆音色 + 临时参考音频，按类别分组） =====
function pypyRenderVoiceSelect() {
  var el = document.getElementById('pypy-gen-voice');
  if (!el) return;
  var h = '<option value="demo0001">demo0001（内置默认）</option>';
  if (PY.voices && PY.voices.length) {
    var custom = PY.voices.filter(function(v) { return v.id !== 'demo0001'; });
    if (custom.length) {
      // 按类别分组（保持类别名首现顺序）
      var groups = {};
      var order = [];
      custom.forEach(function(v) {
        var c = (typeof pypyVoiceCategory === 'function') ? pypyVoiceCategory(v) : '其他';
        if (!groups[c]) { groups[c] = []; order.push(c); }
        groups[c].push(v);
      });
      order.forEach(function(cat) {
        h += '<optgroup label="' + escHtml(cat) + '">';
        groups[cat].forEach(function(v) {
          h += '<option value="' + escHtml(v.id) + '">' + escHtml(pypyVoiceDisplayName(v)) + '</option>';
        });
        h += '</optgroup>';
      });
    }
  }
  h += '<option value="__tmp_ref__">📎 临时参考音频</option>';
  el.innerHTML = h;
  // 恢复上次选择（持久化状态）
  var saved = (PY.uiState || {}).genVoice;
  if (saved && el.querySelector('option[value="' + saved + '"]')) el.value = saved;
}

function pypySeedFor(voice) {
  var s = 42;
  for (var i = 0; i < voice.length; i++) s = (s * 31 + voice.charCodeAt(i)) % 2147483647;
  return s;
}

// ===== 合成 =====
function pypySynthesize() {
  var textEl = document.getElementById('pypy-gen-text');
  var voiceEl = document.getElementById('pypy-gen-voice');
  var speedEl = document.getElementById('pypy-gen-speed');
  var statusEl = document.getElementById('pypy-gen-status');
  var text = textEl.value.trim();
  if (!text) { toast('请输入要合成的文本'); return; }
  var voice = voiceEl.value;
  var speed = parseFloat(speedEl.value) || 1.0;

  setPypyGenStatus('合成中…（本地推理，可能需要数秒）', '#e0c068');
  var btn = document.getElementById('pypy-gen-btn');
  if (btn) btn.disabled = true;

  var form = new FormData();
  form.append('text', text);
  form.append('language', 'zh');
  form.append('speed', String(speed));
  form.append('seed', String(pypySeedFor(voice)));

  // 临时参考音频
  if (voice === '__tmp_ref__') {
    if (!PY.tmpRefFile) {
      setPypyGenStatus('已选临时参考音频，请先选择音频文件', '#e06c75');
      if (btn) btn.disabled = false;
      return;
    }
    var tmpText = (document.getElementById('pypy-gen-tmpref-text') || {}).value || '';
    if (!tmpText.trim()) {
      setPypyGenStatus('已选参考音频，请填写「音频文字」（逐字稿）', '#e06c75');
      if (btn) btn.disabled = false;
      return;
    }
    form.append('ref_audio', PY.tmpRefFile);
    form.append('ref_text', tmpText.trim());
  } else if (voice && voice !== 'demo0001') {
    form.append('profile_id', voice);
  }

  // 音色设计（仅默认音色时叠加 instruct）
  var designEnabled = document.getElementById('pypy-gen-design-enabled');
  if (voice === 'demo0001' && designEnabled && designEnabled.checked) {
    var instruct = pypyBuildInstruct();
    if (instruct) form.append('instruct', instruct);
  }

  fetch(PY.baseUrl + '/generate', { method: 'POST', body: form })
    .then(function(r) {
      if (!r.ok) return r.text().then(function(t) { throw new Error('HTTP ' + r.status + ' ' + t); });
      return r.arrayBuffer();
    })
    .then(function(buf) {
      var blob = new Blob([buf], { type: 'audio/wav' });
      var url = URL.createObjectURL(blob);
      var player = document.getElementById('pypy-gen-player');
      if (player) {
        player.src = url;
        player.style.display = 'block';
        player.play();
      }
      // 加入历史
      var voiceName = voice === '__tmp_ref__' ? '临时参考音频' : (voiceEl.options[voiceEl.selectedIndex] || {}).text || voice;
      pypyAddHistory({
        time: new Date().toISOString(),
        text: text,
        voice: voiceName,
        size: buf.byteLength,
        base64: pypyArrayBufferToBase64(buf),
      });
      setPypyGenStatus('合成完成：' + (buf.byteLength / 1024).toFixed(0) + ' KB', '#7ec699');
      if (btn) btn.disabled = false;
    })
    .catch(function(e) {
      setPypyGenStatus('合成失败：' + e.message, '#e06c75');
      if (btn) btn.disabled = false;
    });
}

function setPypyGenStatus(msg, color) {
  var el = document.getElementById('pypy-gen-status');
  if (el) {
    el.textContent = msg;
    el.style.color = color || 'var(--fg2)';
  }
}

function pypyArrayBufferToBase64(buffer) {
  var bytes = new Uint8Array(buffer);
  var chunk = 8192;
  var bin = '';
  for (var i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

// ===== 临时参考音频文件选择 =====
function pypyTmpRefChanged(input) {
  var file = input.files && input.files[0];
  if (file) {
    PY.tmpRefFile = file;
    // 自动切到临时参考音频选项
    var voiceEl = document.getElementById('pypy-gen-voice');
    if (voiceEl) voiceEl.value = '__tmp_ref__';
    // 读取 base64 供转写
    var reader = new FileReader();
    reader.onload = function() { PY.tmpRefBase64 = String(reader.result).split(',')[1]; };
    reader.readAsDataURL(file);
  } else {
    PY.tmpRefFile = null;
    PY.tmpRefBase64 = null;
  }
}

// ===== 渲染合成页 =====
function pypyRenderGen(el) {
  if (!el) return;
  var st = PY.uiState || {};
  var h = '';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start">';

  // 左列：音色选择 + 设计
  h += '<div>';
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:10px">';
  h += '<div style="font-size:13px;color:var(--fg);margin-bottom:8px;font-weight:bold">音色选择</div>';
  h += '<label style="font-size:12px;color:var(--fg2);display:block;margin-bottom:3px">当前音色</label>';
  h += '<select id="pypy-gen-voice" class="llm-select" style="width:100%;margin-bottom:8px"></select>';
  h += '<label style="font-size:12px;color:var(--fg2);display:block;margin-bottom:3px">📎 临时参考音频（选音频后自动使用，手动换音色则失效）</label>';
  h += '<input type="file" id="pypy-gen-tmpref" accept="audio/*,.wav,.mp3,.flac,.ogg" style="width:100%;margin-bottom:6px" onchange="pypyTmpRefChanged(this)">';
  h += '<label style="font-size:12px;color:var(--fg2);display:block;margin-bottom:3px">音频文字（逐字稿）</label>';
  h += '<input type="text" id="pypy-gen-tmpref-text" class="llm-input" style="width:100%" placeholder="临时参考音频的逐字稿（必填）" value="' + escHtml(st.genTmpRefText || '') + '">';
  h += '</div>';

  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:10px">';
  h += '<div style="font-size:13px;color:var(--fg);margin-bottom:8px;font-weight:bold">音色设计（标签组合）</div>';
  h += '<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--fg2);margin-bottom:8px"><input type="checkbox" id="pypy-gen-design-enabled"' + (st.genDesignEnabled ? ' checked' : '') + '> 启用设计（仅默认音色时生效）</label>';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">';
  h += '<div><label style="font-size:12px;color:var(--fg2)">性别</label><select id="pypy-gen-gender" class="llm-select" style="width:100%" onchange="pypyUpdateInstructPreview()"><option value="女"' + (st.genGender === '女' ? ' selected' : '') + '>女</option><option value="男"' + (st.genGender === '男' ? ' selected' : '') + '>男</option></select></div>';
  h += '<div><label style="font-size:12px;color:var(--fg2)">年龄</label><select id="pypy-gen-age" class="llm-select" style="width:100%" onchange="pypyUpdateInstructPreview()"><option value="少年"' + (st.genAge === '少年' ? ' selected' : '') + '>少年</option><option value="儿童"' + (st.genAge === '儿童' ? ' selected' : '') + '>儿童</option><option value="青年"' + (st.genAge === '青年' ? ' selected' : '') + '>青年（18岁）</option><option value="中年"' + (st.genAge === '中年' ? ' selected' : '') + '>中年</option><option value="老年"' + (st.genAge === '老年' ? ' selected' : '') + '>老年</option></select></div>';
  h += '<div><label style="font-size:12px;color:var(--fg2)">音高</label><select id="pypy-gen-pitch" class="llm-select" style="width:100%" onchange="pypyUpdateInstructPreview()"><option value="中音调"' + (st.genPitch === '中音调' ? ' selected' : '') + '>中音调</option><option value="极低音调"' + (st.genPitch === '极低音调' ? ' selected' : '') + '>极低音调</option><option value="低音调"' + (st.genPitch === '低音调' ? ' selected' : '') + '>低音调</option><option value="高音调"' + (st.genPitch === '高音调' ? ' selected' : '') + '>高音调</option><option value="极高音调"' + (st.genPitch === '极高音调' ? ' selected' : '') + '>极高音调</option></select></div>';
  h += '<div><label style="font-size:12px;color:var(--fg2)">风格</label><select id="pypy-gen-style" class="llm-select" style="width:100%" onchange="pypyUpdateInstructPreview()"><option value=""' + (!st.genStyle ? ' selected' : '') + '>普通</option><option value="耳语"' + (st.genStyle === '耳语' ? ' selected' : '') + '>耳语</option></select></div>';
  h += '</div>';
  h += '<div style="margin-bottom:6px"><label style="font-size:12px;color:var(--fg2)">方言</label><select id="pypy-gen-dialect" class="llm-select" style="width:100%" onchange="pypyUpdateInstructPreview()"><option value=""' + (!st.genDialect ? ' selected' : '') + '>普通话</option><option value="东北话"' + (st.genDialect === '东北话' ? ' selected' : '') + '>东北话</option><option value="四川话"' + (st.genDialect === '四川话' ? ' selected' : '') + '>四川话</option><option value="河南话"' + (st.genDialect === '河南话' ? ' selected' : '') + '>河南话</option><option value="陕西话"' + (st.genDialect === '陕西话' ? ' selected' : '') + '>陕西话</option><option value="粤语"' + (st.genDialect === '粤语' ? ' selected' : '') + '>粤语</option></select></div>';
  h += '<div style="font-size:12px;color:var(--fg3)">组合结果：<b id="pypy-gen-instruct-preview"></b></div>';
  h += '</div>';
  h += '</div>';

  // 右列：文本 + 合成
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:10px">';
  h += '<div style="font-size:13px;color:var(--fg);margin-bottom:8px;font-weight:bold">文本输入</div>';
  h += '<div style="font-size:11px;color:var(--fg3);margin-bottom:6px">支持反应标签：[pause 500ms] 停顿 · [sigh] 叹气 · [laughter] 笑 · [surprise-ah] 惊呼 · [question-ah] 疑问 · [dissatisfaction-hnn] 不满</div>';
  h += '<textarea id="pypy-gen-text" class="llm-input" style="width:100%;min-height:160px;resize:vertical" placeholder="输入要合成的文本…">' + escHtml(st.genText || '') + '</textarea>';
  h += '<div style="display:flex;align-items:center;gap:10px;margin-top:8px">';
  h += '<label style="font-size:12px;color:var(--fg2)">语速</label>';
  h += '<input type="number" id="pypy-gen-speed" value="' + escHtml(st.genSpeed || '1.0') + '" step="0.1" min="0.5" max="2" style="width:70px;background:var(--bg2);color:var(--text);border:1px solid var(--border);border-radius:4px;padding:3px 6px;font-size:12px">';
  h += '<button class="btn-main" id="pypy-gen-btn" onclick="pypySynthesize()">🎙 合成并播放</button>';
  h += '<button class="btn-out" id="pypy-gen-tone-btn" onclick="openAiGenPanel(\'pypy-gen-tone\')" title="AI 自动在合适位置插入语气标签">🤖 AI 调整语气</button>';
  h += '<button class="btn-out" id="pypy-gen-clear" onclick="document.getElementById(\'pypy-gen-text\').value=\'\'">清空</button>';
  h += '</div>';
  h += '<div id="pypy-gen-status" style="font-size:12px;color:var(--fg2);margin-top:8px;min-height:16px"></div>';
  h += '<audio id="pypy-gen-player" controls style="width:100%;margin-top:8px;display:none"></audio>';
  h += '</div>';

  h += '</div>';
  el.innerHTML = h;

  pypyRenderVoiceSelect();
  pypyUpdateInstructPreview();

  // 输入即保存：所有字段变化立即持久化，切页回来仍保留
  ['pypy-gen-text', 'pypy-gen-tmpref-text', 'pypy-gen-voice', 'pypy-gen-speed',
   'pypy-gen-design-enabled', 'pypy-gen-gender', 'pypy-gen-age', 'pypy-gen-pitch',
   'pypy-gen-style', 'pypy-gen-dialect'].forEach(function(id) {
    var e = document.getElementById(id);
    if (e && typeof pypyBindUIState === 'function') pypyBindUIState(e);
  });
}

window.pypyRenderGen = pypyRenderGen;
window.pypySynthesize = pypySynthesize;
window.pypyTmpRefChanged = pypyTmpRefChanged;
window.pypyUpdateInstructPreview = pypyUpdateInstructPreview;

// ===== AI 调整语气（二元模板：AI 字段 + 提示词模板 + 弹窗 + 回填） =====
(function() {
  if (typeof registerAiField !== 'function') return;
  registerAiField('pypy-gen-tone', '配音语气调整', function() {
    var textEl = document.getElementById('pypy-gen-text');
    var text = textEl ? textEl.value.trim() : '';
    var voiceDesc = '';
    var voiceEl = document.getElementById('pypy-gen-voice');
    if (voiceEl && voiceEl.selectedIndex >= 0) {
      voiceDesc = voiceEl.options[voiceEl.selectedIndex].text || '';
    }
    return {
      user: text,
      voiceDesc: voiceDesc ? '（音色：' + voiceDesc + '）' : '',
    };
  }, {
    rawText: true,
    suggestPrompt: 'tts_tone_gen',
    fillFn: function(result) {
      var textEl = document.getElementById('pypy-gen-text');
      if (!textEl) return;
      textEl.value = (result && result.trim ? result.trim() : result || '');
      var evt = new Event('input', { bubbles: true });
      textEl.dispatchEvent(evt);
      toast('已插入语气标签');
    },
  });
})();
