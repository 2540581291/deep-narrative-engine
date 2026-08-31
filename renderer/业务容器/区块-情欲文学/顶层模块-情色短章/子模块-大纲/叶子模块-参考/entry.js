function 短aiGenerateReferences() {
  openAiGenPanel('V_gen_refs');
}

function 短renderOutlineReferences(el) {
  Store.vignette.get(短ot).then(function(m) {
    m = m || {};
    var refs = m.references || [];
    var h =
      '<div class="flex justify-between items-center mb-6">' +
      '<div><h4 class="m-0">📚 参考文档</h4><p class="text-muted text-sm mt-2">从已有作品中按标签重叠度引用，帮助保持设定一致性。</p></div>' +
      '<button class="btn" id="refAiGenBtn" class="bg-accent fs-12" onclick="openAiGenPanel(\'V_gen_refs\')">🤖 AI 推荐参考</button></div>' +
      '<div id="refList">';
    if (refs.length === 0) h += '<div class="placeholder-text">暂无参考文档。在下方添加。</div>';
    else refs.forEach(function(r, i) {
      h += '<div class="n-card" style="margin-bottom:6px;padding:10px;display:flex;align-items:center;gap:8px">' +
           '<div class="flex-1"><div class="fw-600 fs-12">' + escHtml(r.title||'未命名') + '</div>' +
           (r.tags ? '<div class="fs-10 c-fg2 mt-2">' + escHtml(r.tags) + '</div>' : '') +
           (r.note ? '<div class="fs-10 c-fg2 mt-2">' + escHtml(r.note).slice(0,60) + '</div>' : '') + '</div>' +
           '<button class="btn-secondary btn-sm ref-del" data-idx="' + i + '" class="c-error flex-shrink-0">✕</button></div>';
    });
    h += '</div><div class="n-card" style="padding:10px;display:flex;gap:8px;align-items:center">' +
      '<input class="llm-input" id="refTitle" class="flex-2 fs-12" placeholder="作品名">' +
      '<input class="llm-input" id="refTags" class="flex-1 fs-12" placeholder="标签">' +
      '<input class="llm-input" id="refNote" class="flex-2 fs-12" placeholder="简述">' +
      '<button class="btn-sm" id="短refAddBtn">＋ 添加</button></div>';
    el.innerHTML = h;
    // 页面级 AI 已通过 onclick 在 HTML 中调用 openAiGenPanel
    document.getElementById('短refAddBtn').addEventListener('click', 短refAdd);
    Array.from(el.querySelectorAll('.ref-del')).forEach(function(btn) {
      btn.addEventListener('click', function() { 短refRemove(parseInt(this.getAttribute('data-idx'))); });
    });
  });
}
function 短refAdd() {
  var title = document.getElementById('refTitle').value.trim();
  if (!title) { toast('请输入作品名'); return; }
  Store.vignette.get(短ot).then(function(m) {
    m = m || {}; if (!m.references) m.references = [];
    m.references.push({ title: title, tags: document.getElementById('refTags').value.trim(), note: document.getElementById('refNote').value.trim() });
    Store.vignette.save(短ot, m).then(function() { 短otab('references'); });
  });
}
function 短refRemove(i) {
  Store.vignette.get(短ot).then(function(m) {
    if (!m || !m.references) return;
    m.references.splice(i, 1);
    Store.vignette.save(短ot, m).then(function() { 短otab('references'); });
  });
}
