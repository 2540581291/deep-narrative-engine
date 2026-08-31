// 配音配乐 · 音色库（③ 音色库 tab：克隆 / 设计 / 列表）

// ===== 克隆 =====
function pypyCloneVoice() {
  var nameEl = document.getElementById('pypy-lib-clone-name');
  var audioEl = document.getElementById('pypy-lib-clone-audio');
  var textEl = document.getElementById('pypy-lib-clone-text');
  var statusEl = document.getElementById('pypy-lib-clone-status');
  var name = (nameEl.value || '').trim();
  var text = (textEl.value || '').trim();
  var file = audioEl.files && audioEl.files[0];
  if (!name) { setPypyLibStatus(statusEl, '请填写音色名称', '#e06c75'); return; }
  if (!file) { setPypyLibStatus(statusEl, '请选择参考音频文件', '#e06c75'); return; }
  if (!text) { setPypyLibStatus(statusEl, '请填写音频文字（逐字稿）——可点「自动转写」', '#e06c75'); return; }

  var btn = document.getElementById('pypy-lib-clone-btn');
  if (btn) btn.disabled = true;
  setPypyLibStatus(statusEl, '克隆中…', '#e0c068');

  var form = new FormData();
  form.append('name', name);
  form.append('kind', 'clone');
  form.append('ref_text', text);
  form.append('ref_audio', file);

  fetch(PY.baseUrl + '/profiles', { method: 'POST', body: form })
    .then(function(r) {
      if (!r.ok) return r.text().then(function(t) { throw new Error('HTTP ' + r.status + ' ' + t); });
      return r.json();
    })
    .then(function(data) {
      setPypyLibStatus(statusEl, '克隆成功：' + (data.name || name) + '（' + data.id + '）', '#7ec699');
      toast('音色克隆成功');
      if (btn) btn.disabled = false;
      // 默认归入「角色卡」类别
      if (data && data.id && typeof pypySetVoiceCategory === 'function') {
        pypySetVoiceCategory(data.id, '角色卡');
      }
      // 清空输入
      nameEl.value = '';
      audioEl.value = '';
      textEl.value = '';
      pypyLoadVoices();
      if (typeof pypyRenderVoiceLib === 'function') pypyRenderVoiceLib();
    })
    .catch(function(e) {
      setPypyLibStatus(statusEl, '克隆失败：' + e.message, '#e06c75');
      if (btn) btn.disabled = false;
    });
}

// ===== 自动转写 =====
function pypyTranscribeAudio() {
  var audioEl = document.getElementById('pypy-lib-clone-audio');
  var textEl = document.getElementById('pypy-lib-clone-text');
  var statusEl = document.getElementById('pypy-lib-clone-status');
  var file = audioEl.files && audioEl.files[0];
  if (!file) { setPypyLibStatus(statusEl, '请先选择参考音频', '#e06c75'); return; }
  var btn = document.getElementById('pypy-lib-transcribe-btn');
  if (btn) btn.disabled = true;
  setPypyLibStatus(statusEl, '转写中…（faster-whisper，约 10-30 秒）', '#e0c068');
  var reader = new FileReader();
  reader.onload = function() {
    var base64 = String(reader.result).split(',')[1];
    var ext = (file.name.split('.').pop() || 'wav').toLowerCase();
    window.narrative.ttsTranscribe(base64, ext).then(function(res) {
      if (res && res.ok) {
        textEl.value = res.text;
        setPypyLibStatus(statusEl, '转写完成', '#7ec699');
      } else {
        setPypyLibStatus(statusEl, '转写失败：' + (res && res.error || '未知'), '#e06c75');
      }
      if (btn) btn.disabled = false;
    });
  };
  reader.onerror = function() { setPypyLibStatus(statusEl, '读取文件失败', '#e06c75'); if (btn) btn.disabled = false; };
  reader.readAsDataURL(file);
}

// ===== 设计音色 =====
function pypySaveDesign() {
  var nameEl = document.getElementById('pypy-lib-design-name');
  var statusEl = document.getElementById('pypy-lib-design-status');
  var name = (nameEl.value || '').trim();
  if (!name) { setPypyLibStatus(statusEl, '请填写音色名称', '#e06c75'); return; }

  var instruct = pypyBuildDesignInstruct();
  var vd = pypyBuildVdStates();

  var btn = document.getElementById('pypy-lib-design-btn');
  if (btn) btn.disabled = true;
  setPypyLibStatus(statusEl, '保存中…（引擎渲染确定性样本）', '#e0c068');

  var form = new FormData();
  form.append('name', name);
  form.append('kind', 'design');
  form.append('vd_states', JSON.stringify(vd));
  form.append('instruct', instruct);

  fetch(PY.baseUrl + '/profiles', { method: 'POST', body: form })
    .then(function(r) {
      if (!r.ok) return r.text().then(function(t) { throw new Error('HTTP ' + r.status + ' ' + t); });
      return r.json();
    })
    .then(function(data) {
      setPypyLibStatus(statusEl, '设计音色保存成功：' + (data.name || name), '#7ec699');
      toast('设计音色已保存');
      if (btn) btn.disabled = false;
      nameEl.value = '';
      pypyLoadVoices();
      if (typeof pypyRenderVoiceLib === 'function') pypyRenderVoiceLib();
    })
    .catch(function(e) {
      setPypyLibStatus(statusEl, '保存失败：' + e.message, '#e06c75');
      if (btn) btn.disabled = false;
    });
}

function pypyBuildDesignInstruct() {
  var parts = [];
  parts.push(document.getElementById('pypy-lib-d-gender').value);
  parts.push(document.getElementById('pypy-lib-d-age').value);
  parts.push(document.getElementById('pypy-lib-d-pitch').value);
  var style = document.getElementById('pypy-lib-d-style').value;
  if (style) parts.push(style);
  var dialect = document.getElementById('pypy-lib-d-dialect').value;
  if (dialect) parts.push(dialect);
  return parts.join('，');
}

function pypyBuildVdStates() {
  return {
    Gender: PY_GEN_ZH_TO_EN[document.getElementById('pypy-lib-d-gender').value] || 'Auto',
    Age: PY_GEN_ZH_TO_EN[document.getElementById('pypy-lib-d-age').value] || 'Auto',
    Pitch: PY_GEN_ZH_TO_EN[document.getElementById('pypy-lib-d-pitch').value] || 'Auto',
    Style: document.getElementById('pypy-lib-d-style').value ? 'whisper' : 'Auto',
    EnglishAccent: 'Auto',
    ChineseDialect: document.getElementById('pypy-lib-d-dialect').value || 'Auto',
  };
}

function pypyUpdateDesignPreview() {
  var el = document.getElementById('pypy-lib-design-preview');
  if (el) el.textContent = pypyBuildDesignInstruct();
}

// ===== 音色列表（按类别分组，卡片网格） =====
var PY_VD_ZH = {
  'female': '女', 'male': '男',
  'child': '儿童', 'teenager': '少年', 'young adult': '青年', 'middle-aged': '中年', 'elderly': '老年',
  'very low pitch': '极低音调', 'low pitch': '低音调', 'moderate pitch': '中音调',
  'high pitch': '高音调', 'very high pitch': '极高音调',
  'whisper': '耳语', 'Auto': '自动',
};

// 设计音色的标签组合（vd_states → 中文标签数组）
function pypyVdTags(v) {
  var tags = [];
  try {
    var vd = (typeof v.vd_states === 'string') ? JSON.parse(v.vd_states) : (v.vd_states || {});
    ['Gender', 'Age', 'Pitch', 'Style', 'ChineseDialect'].forEach(function(k) {
      var val = vd[k];
      if (val && val !== 'Auto') tags.push(PY_VD_ZH[val] || val);
    });
  } catch(e) {}
  return tags;
}

function pypyRenderVoiceLib() {
  var el = document.getElementById('pypy-lib-list');
  if (!el) return;
  if (!PY.voicesLoaded || !PY.voices.length) {
    el.innerHTML = '<div style="font-size:12px;color:var(--fg3);padding:12px 0">暂无音色（引擎就绪后自动加载）</div>';
    return;
  }
  // 按类别分组（保持类别名首现顺序）
  var groups = {};
  var order = [];
  PY.voices.forEach(function(v) {
    var c = (typeof pypyVoiceCategory === 'function') ? pypyVoiceCategory(v) : '其他';
    if (!groups[c]) { groups[c] = []; order.push(c); }
    groups[c].push(v);
  });

  var h = '';
  var dlId = 'pypy-lib-cat-options';
  h += '<datalist id="' + dlId + '">';
  (PY.voiceCategoryPresets || ['明日方舟', '原神', '内置', '其他']).forEach(function(p) {
    h += '<option value="' + escHtml(p) + '"></option>';
  });
  h += '</datalist>';

  order.forEach(function(cat) {
    var items = groups[cat];
    h += '<div style="display:flex;align-items:center;gap:8px;margin:12px 0 8px">';
    h += '<span style="font-size:13px;color:var(--fg);font-weight:600">' + escHtml(cat) + '</span>';
    h += '<span style="font-size:11px;color:var(--fg3)">' + items.length + ' 个</span>';
    h += '<div style="flex:1;height:1px;background:var(--border)"></div>';
    h += '</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
    items.forEach(function(v) {
      var kind = v.kind === 'design' ? '🎨 设计' : '🎤 克隆';
      h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:8px 10px">';
      h += '<div style="display:flex;align-items:center;gap:6px">';
      h += '<span style="font-size:10px;padding:1px 6px;border-radius:3px;' + (v.kind === 'design' ? 'background:rgba(224,192,104,.15);color:#e0c068' : 'background:rgba(126,198,153,.15);color:#7ec699') + ';flex-shrink:0">' + kind + '</span>';
      h += '<span style="font-size:13px;font-weight:600;color:var(--text);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(v.name || v.id) + '</span>';
      h += '<span style="font-size:10px;color:var(--fg3);padding:1px 6px;border:1px dashed var(--border);border-radius:8px;cursor:pointer;flex-shrink:0" onclick="pypyEditCategoryInline(\'' + escHtml(v.id) + '\',this)" title="点击修改类别">' + escHtml(cat) + ' ✎</span>';
      h += '</div>';
      h += '<div style="font-size:10px;color:var(--fg3);margin-top:3px;font-family:monospace">' + escHtml(v.id || '') + '</div>';
      h += '<div style="font-size:11px;color:var(--fg3);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (v.ref_text ? '📝 ' + escHtml(String(v.ref_text).slice(0, 40)) : '（无逐字稿）') + '</div>';
      h += '<div style="display:flex;gap:6px;margin-top:6px">';
      h += '<button class="btn-out" style="flex:1;padding:2px 6px;font-size:10px" onclick="pypyVoiceDetail(\'' + escHtml(v.id) + '\')">详情</button>';
      h += '<button class="btn-out" style="flex:1;padding:2px 6px;font-size:10px" onclick="pypyVoiceRename(\'' + escHtml(v.id) + '\')">✏️ 重命名</button>';
      h += '<button class="btn-out" style="flex:1;padding:2px 6px;font-size:10px;color:#e06c75" onclick="pypyVoiceDelete(\'' + escHtml(v.id) + '\',\'' + escHtml(v.name || '') + '\')">删除</button>';
      h += '</div>';
      h += '</div>';
    });
    h += '</div>';
  });
  el.innerHTML = h;
}

// 点击类别徽章 → 行内输入框（Enter 保存 / Esc 取消 / 失焦保存）
function pypyEditCategoryInline(id, el) {
  var v = PY.voices.find(function(x) { return x.id === id; });
  if (!v) return;
  var cur = (typeof pypyVoiceCategory === 'function') ? pypyVoiceCategory(v) : '其他';
  var box = document.createElement('input');
  box.type = 'text';
  box.value = cur;
  box.setAttribute('list', 'pypy-lib-cat-options');
  box.style.cssText = 'width:100px;font-size:10px;padding:1px 6px;background:var(--bg2);border:1px solid var(--accent);border-radius:8px;color:var(--fg)';
  el.replaceWith(box);
  box.focus();
  box.select();
  var saved = false;
  function finish() {
    if (saved) return;
    saved = true;
    var val = box.value.trim();
    if (val && typeof pypySetVoiceCategory === 'function') pypySetVoiceCategory(id, val);
    else if (typeof pypyRenderVoiceLib === 'function') pypyRenderVoiceLib();
  }
  box.addEventListener('keydown', function(ev) {
    if (ev.key === 'Enter') finish();
    else if (ev.key === 'Escape') { saved = true; if (typeof pypyRenderVoiceLib === 'function') pypyRenderVoiceLib(); }
  });
  box.addEventListener('blur', finish);
}

// ===== 渲染音色标签（设计音色的标签组合） =====
function pypyRenderVoiceTags() {
  var el = document.getElementById('pypy-lib-tags');
  if (!el) return;
  var designs = (PY.voices || []).filter(function(v) { return v.kind === 'design'; });
  if (!designs.length) {
    el.innerHTML = '<div style="font-size:12px;color:var(--fg3);padding:14px 0">暂无设计音色——到「🎛 音色生成」页用标签组合设计并保存后，会出现在这里</div>';
    return;
  }
  var h = '';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
  designs.forEach(function(v) {
    var tags = pypyVdTags(v);
    h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:8px 10px">';
    h += '<div style="display:flex;align-items:center;gap:6px">';
    h += '<span style="font-size:13px;font-weight:600;color:var(--text);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(v.name || v.id) + '</span>';
    h += '<button class="btn-out" style="padding:2px 6px;font-size:10px" onclick="pypyVoiceDetail(\'' + escHtml(v.id) + '\')">详情</button>';
    h += '<button class="btn-out" style="padding:2px 6px;font-size:10px;color:#e06c75" onclick="pypyVoiceDelete(\'' + escHtml(v.id) + '\',\'' + escHtml(v.name || '') + '\')">删除</button>';
    h += '</div>';
    h += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">';
    if (tags.length) tags.forEach(function(t) {
      h += '<span style="font-size:10px;padding:1px 7px;border-radius:8px;background:rgba(224,192,104,.12);color:#e0c068">' + escHtml(t) + '</span>';
    });
    else h += '<span style="font-size:10px;color:var(--fg3)">（无标签）</span>';
    h += '</div>';
    h += '</div>';
  });
  h += '</div>';
  el.innerHTML = h;
}

function pypyVoiceRename(id) {
  var v = PY.voices.find(function(x) { return x.id === id; });
  if (!v) return;
  var newName = prompt('重命名音色「' + (v.name || v.id) + '」为：', v.name || '');
  if (!newName || !newName.trim()) return;
  newName = newName.trim();
  fetch(PY.baseUrl + '/profiles/' + encodeURIComponent(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName }),
  })
    .then(function(r) {
      if (!r.ok) return r.text().then(function(t) { throw new Error('HTTP ' + r.status + ' ' + t); });
      return r.json();
    })
    .then(function(d) {
      v.name = d.name || newName;
      toast('已重命名为：' + newName);
      pypyRenderVoiceLib();
      if (typeof pypyRenderVoiceSelect === 'function') pypyRenderVoiceSelect();
    })
    .catch(function(e) { toast('重命名失败：' + e.message); });
}

function pypyVoiceDetail(id) {
  var v = PY.voices.find(function(x) { return x.id === id; });
  if (!v) return;
  var kind = v.kind === 'design' ? '设计音色' : '克隆音色';
  var cat = (typeof pypyVoiceCategory === 'function') ? pypyVoiceCategory(v) : '其他';
  var h = '';
  // 第一行：音频 + 类别 / ID
  h += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">';
  if (v.ref_audio_path) {
    h += '<audio controls style="flex:1;height:36px;max-width:340px" src="' + PY.baseUrl + '/profiles/' + escHtml(v.id) + '/audio"></audio>';
  } else {
    h += '<span style="font-size:12px;color:var(--fg3)">（无参考音频）</span>';
  }
  h += '<span style="font-size:11px;color:var(--fg2);white-space:nowrap">类别：<span style="color:var(--fg)">' + escHtml(cat) + '</span></span>';
  h += '<span style="font-size:11px;color:var(--fg2);white-space:nowrap">ID：<span style="font-family:monospace;color:var(--fg3)">' + escHtml(v.id || '') + '</span></span>';
  h += '</div>';
  // 第二行：逐字稿
  h += '<div style="font-size:11px;color:var(--fg2);margin-bottom:4px">逐字稿：</div>';
  h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:6px 8px;font-size:12px;line-height:1.7;color:var(--text);white-space:pre-wrap;max-height:160px;overflow-y:auto">' + escHtml(v.ref_text || '（无逐字稿）') + '</div>';
  showModal(escHtml(v.name || v.id) + '（' + kind + '）', h, { cardClass: 'mcard mcard-sm' });
}

function pypyVoiceDelete(id, name) {
  if (!confirm('确定删除音色「' + name + '」？')) return;
  fetch(PY.baseUrl + '/profiles/' + encodeURIComponent(id), { method: 'DELETE' })
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      toast('已删除：' + name);
      PY.voices = PY.voices.filter(function(x) { return x.id !== id; });
      // 清理类别映射
      if (typeof pypyLoadVoiceCategories === 'function') {
        pypyLoadVoiceCategories();
        if (PY.voiceCategories[id]) { delete PY.voiceCategories[id]; pypySaveVoiceCategories(); }
      }
      pypyRenderVoiceLib();
      if (typeof pypyRenderVoiceSelect === 'function') pypyRenderVoiceSelect();
    })
    .catch(function(e) { toast('删除失败：' + e.message); });
}

function setPypyLibStatus(el, msg, color) {
  if (el) { el.textContent = msg; el.style.color = color || 'var(--fg2)'; }
}

// ===== 音色库页（音色列表 + 音色标签 双区块） =====
function pypyRenderVoiceLibPage(el) {
  if (!el) return;
  var h = '';
  // 音色列表
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">';
  h += '<div style="font-size:14px;color:var(--fg);font-weight:700">🎤 音色列表</div>';
  h += '<span style="font-size:11px;color:var(--fg3)">' + (PY.voices || []).length + ' 个音色 · 点击类别徽章可修改</span>';
  h += '<div style="flex:1"></div>';
  h += '<button class="btn-out" style="padding:3px 10px;font-size:11px" onclick="pypyRefreshAll()">🔄 刷新</button>';
  h += '</div>';
  h += '<div style="font-size:11px;color:var(--fg3);margin-bottom:8px">按类别分组展示，点击音色卡片上的类别徽章可快速修改归类</div>';
  h += '<div id="pypy-lib-list"></div>';
  h += '</div>';

  // 音色标签（设计音色的标签组合）
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">';
  h += '<div style="font-size:14px;color:var(--fg);font-weight:700">🏷 音色标签</div>';
  h += '<span style="font-size:11px;color:var(--fg3)">设计音色的标签组合（性别 / 年龄 / 音高 / 风格 / 方言）</span>';
  h += '</div>';
  h += '<div style="font-size:11px;color:var(--fg3);margin-bottom:8px">在「🎛 音色生成」页用标签组合设计的音色会显示在这里</div>';
  h += '<div id="pypy-lib-tags"></div>';
  h += '</div>';

  el.innerHTML = h;
  pypyRenderVoiceLib();
  pypyRenderVoiceTags();
}

// ===== 音色生成页（① 克隆 + ② 设计） =====
function pypyRenderCreatePage(el) {
  if (!el) return;
  var h = '';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start">';

  // 克隆
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px">';
  h += '<div style="font-size:13px;color:var(--fg);margin-bottom:8px;font-weight:bold">🎤 克隆音色（参考音频）</div>';
  h += '<label style="font-size:12px;color:var(--fg2);display:block;margin-bottom:3px">音色名称</label>';
  h += '<input type="text" id="pypy-lib-clone-name" class="llm-input" style="width:100%;margin-bottom:8px" placeholder="如：小柔 / 御姐音">';
  h += '<label style="font-size:12px;color:var(--fg2);display:block;margin-bottom:3px">参考音频（8-15 秒最佳）</label>';
  h += '<input type="file" id="pypy-lib-clone-audio" accept="audio/*,.wav,.mp3,.flac,.ogg" style="width:100%;margin-bottom:8px">';
  h += '<label style="font-size:12px;color:var(--fg2);display:block;margin-bottom:3px">音频文字（逐字稿）</label>';
  h += '<div style="display:flex;gap:6px;margin-bottom:8px">';
  h += '<input type="text" id="pypy-lib-clone-text" class="llm-input" style="flex:1" placeholder="音频里说的原话">';
  h += '<button class="btn-out" id="pypy-lib-transcribe-btn" style="padding:3px 10px;font-size:12px;white-space:nowrap" onclick="pypyTranscribeAudio()">📝 自动转写</button>';
  h += '</div>';
  h += '<button class="btn-main" id="pypy-lib-clone-btn" onclick="pypyCloneVoice()">🎤 克隆音色</button>';
  h += '<div id="pypy-lib-clone-status" style="font-size:12px;margin-top:6px;min-height:16px"></div>';
  h += '</div>';

  // 设计
  h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px">';
  h += '<div style="font-size:13px;color:var(--fg);margin-bottom:8px;font-weight:bold">🏷 设计音色（标签组合）</div>';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">';
  h += '<div><label style="font-size:12px;color:var(--fg2)">性别</label><select id="pypy-lib-d-gender" class="llm-select" style="width:100%" onchange="pypyUpdateDesignPreview()"><option value="女">女</option><option value="男">男</option></select></div>';
  h += '<div><label style="font-size:12px;color:var(--fg2)">年龄</label><select id="pypy-lib-d-age" class="llm-select" style="width:100%" onchange="pypyUpdateDesignPreview()"><option value="儿童">儿童</option><option value="少年" selected>少年</option><option value="青年">青年</option><option value="中年">中年</option><option value="老年">老年</option></select></div>';
  h += '<div><label style="font-size:12px;color:var(--fg2)">音高</label><select id="pypy-lib-d-pitch" class="llm-select" style="width:100%" onchange="pypyUpdateDesignPreview()"><option value="中音调" selected>中音调</option><option value="极低音调">极低音调</option><option value="低音调">低音调</option><option value="高音调">高音调</option><option value="极高音调">极高音调</option></select></div>';
  h += '<div><label style="font-size:12px;color:var(--fg2)">风格</label><select id="pypy-lib-d-style" class="llm-select" style="width:100%" onchange="pypyUpdateDesignPreview()"><option value="">普通</option><option value="耳语">耳语</option></select></div>';
  h += '</div>';
  h += '<div style="margin-bottom:6px"><label style="font-size:12px;color:var(--fg2)">方言</label><select id="pypy-lib-d-dialect" class="llm-select" style="width:100%" onchange="pypyUpdateDesignPreview()"><option value="">普通话</option><option value="东北话">东北话</option><option value="四川话">四川话</option><option value="河南话">河南话</option><option value="陕西话">陕西话</option></select></div>';
  h += '<div style="font-size:12px;color:var(--fg3);margin-bottom:8px">组合结果：<b id="pypy-lib-design-preview">女，少年，中音调</b></div>';
  h += '<label style="font-size:12px;color:var(--fg2);display:block;margin-bottom:3px">音色名称</label>';
  h += '<input type="text" id="pypy-lib-design-name" class="llm-input" style="width:100%;margin-bottom:8px" placeholder="如：温柔少女">';
  h += '<button class="btn-main" id="pypy-lib-design-btn" onclick="pypySaveDesign()">💾 保存为设计音色</button>';
  h += '<div id="pypy-lib-design-status" style="font-size:12px;margin-top:6px;min-height:16px"></div>';
  h += '</div>';

  h += '</div>';
  el.innerHTML = h;
  pypyUpdateDesignPreview();
}

window.pypyRenderVoiceLibPage = pypyRenderVoiceLibPage;
window.pypyRenderCreatePage = pypyRenderCreatePage;
window.pypyCloneVoice = pypyCloneVoice;
window.pypyTranscribeAudio = pypyTranscribeAudio;
window.pypySaveDesign = pypySaveDesign;
window.pypyUpdateDesignPreview = pypyUpdateDesignPreview;
window.pypyVoiceDetail = pypyVoiceDetail;
window.pypyVoiceDelete = pypyVoiceDelete;
window.pypyRenderVoiceLib = pypyRenderVoiceLib;
window.pypyRenderVoiceTags = pypyRenderVoiceTags;
window.pypyEditCategoryInline = pypyEditCategoryInline;
window.pypyVoiceRename = pypyVoiceRename;
