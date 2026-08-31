// 系列写作 · 参考文档
function XLAiGenerateReferences() {
  openAiGenPanel('XL_gen_refs');
}

function XLRenderReferences(el) {
  Store.seriesWriting.get(swActiveSeries).then(function(m) {
    m = m || {};
    var refs = m.references || [];
    var h =
      '<div class="flex justify-between items-center mb-6">' +
      '<div><h4 class="m-0">📚 参考文档</h4><p class="text-muted text-sm mt-2">从已有作品中按标签重叠度引用，帮助保持设定一致性。</p></div>' +
      '<button class="btn" id="XLRefAiGenBtn" class="bg-accent fs-12" onclick="openAiGenPanel(\'XL_gen_refs\')">🤖 AI 推荐参考</button></div>' +
      '<div id="XLRefList">';
    if (refs.length === 0) h += '<div class="placeholder-text">暂无参考文档。在下方添加。</div>';
    else refs.forEach(function(r, i) {
      h += '<div class="n-card" style="margin-bottom:6px;padding:10px;display:flex;align-items:center;gap:8px">' +
           '<div class="flex-1"><div class="fw-600 fs-12">' + escHtml(r.title||'未命名') + '</div>' +
           (r.tags ? '<div class="fs-10 c-fg2 mt-2">' + escHtml(r.tags) + '</div>' : '') +
           (r.note ? '<div class="fs-10 c-fg2 mt-2">' + escHtml(r.note).slice(0,60) + '</div>' : '') +
           (r.refDocKey ? '<div class="fs-10 c-accent mt-2">📄 已关联参考文档</div>' : '') + '</div>' +
           '<button class="btn-secondary btn-sm XL-ref-del" data-idx="' + i + '" class="c-error flex-shrink-0">✕</button></div>';
    });
    h += '</div><div class="n-card" style="padding:10px;display:flex;gap:8px;align-items:center">' +
      '<input class="llm-input" id="XLRefTitle" class="flex-2 fs-12" placeholder="作品名">' +
      '<input class="llm-input" id="XLRefTags" class="flex-1 fs-12" placeholder="标签">' +
      '<input class="llm-input" id="XLRefNote" class="flex-2 fs-12" placeholder="简述">' +
      '<button class="btn-sm" id="XLRefAddBtn">＋ 添加</button></div>';

    h += '<div class="mt-10" id="XLRefDocImportSection"></div>';

    el.innerHTML = h;
    document.getElementById('XLRefAddBtn').addEventListener('click', XLRefAdd);
    Array.from(el.querySelectorAll('.XL-ref-del')).forEach(function(btn) {
      btn.addEventListener('click', function() { XLRefRemove(parseInt(this.getAttribute('data-idx'))); });
    });
    XLRenderRefDocImportList();
  });
}

function XLRenderRefDocImportList() {
  var section = document.getElementById('XLRefDocImportSection');
  if (!section) return;
  if (typeof Store.refDoc === 'undefined') { section.innerHTML = ''; return; }
  Store.refDoc.list().then(function(files) {
    var names = files ? Object.keys(files) : [];
    if (!names.length) { section.innerHTML = ''; return; }
    var h = '<div class="bt-border mb-6"></div><div class="fs-12 fw-600 mb-4">📂 从创作辅助·文风分析导入</div>';
    h += '<div style="max-height:200px;overflow-y:auto;display:flex;flex-direction:column;gap:4px">';
    names.sort().forEach(function(name) {
      h += '<div class="n-card" style="padding:6px 10px;display:flex;align-items:center;gap:8px">';
      h += '<div class="flex-1 fs-12">' + escHtml(name) + '</div>';
      h += '<button class="btn-secondary btn-sm" onclick="XLRefDoc引用(\'' + escHtml(name) + '\')" style="flex-shrink:0">＋ 引用</button>';
      h += '</div>';
    });
    h += '</div>';
    section.innerHTML = h;
  });
}

function XLRefDoc引用(name) {
  Store.seriesWriting.get(swActiveSeries).then(function(m) {
    m = m || {};
    if (!m.references) m.references = [];
    var exists = m.references.some(function(r) { return r.refDocKey === name || r.title === name; });
    if (exists) { toast('已引用该文档'); return; }
    m.references.push({ title: name, tags: '', note: '从参考文档导入', refDocKey: name });
    Store.seriesWriting.save(swActiveSeries, m).then(function() { toast('已引用'); XL切标签('references'); });
  });
}
window.XLRefDoc引用 = XLRefDoc引用;

function XLRefAdd() {
  var title = document.getElementById('XLRefTitle').value.trim();
  if (!title) { toast('请输入作品名'); return; }
  Store.seriesWriting.get(swActiveSeries).then(function(m) {
    m = m || {}; if (!m.references) m.references = [];
    m.references.push({ title: title, tags: document.getElementById('XLRefTags').value.trim(), note: document.getElementById('XLRefNote').value.trim() });
    Store.seriesWriting.save(swActiveSeries, m).then(function() { XL切标签('references'); });
  });
}

function XLRefRemove(i) {
  Store.seriesWriting.get(swActiveSeries).then(function(m) {
    if (!m || !m.references) return;
    m.references.splice(i, 1);
    Store.seriesWriting.save(swActiveSeries, m).then(function() { XL切标签('references'); });
  });
}
