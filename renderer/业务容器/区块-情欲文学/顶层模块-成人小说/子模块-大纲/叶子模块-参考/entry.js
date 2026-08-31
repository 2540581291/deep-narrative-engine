function aiGenerateReferences() {
  openAiGenPanel('gen_refs');
}

function renderOutlineReferences(el) {
  Store.novel.get(_outlineTitle).then(function(m) {
    m = m || {};
    var refs = m.references || [];
    var h =
      '<div class="flex justify-between items-center mb-6">' +
      '<div><h4 class="m-0">📚 参考文档</h4><p class="text-muted text-sm mt-2">从已有作品中按标签重叠度引用，帮助保持设定一致性。</p></div>' +
      '<button class="btn" id="refAiGenBtn" class="bg-accent fs-12" onclick="openAiGenPanel(\'gen_refs\')">🤖 AI 推荐参考</button></div>' +
      '<div id="refList">';
    if (refs.length === 0) h += '<div class="placeholder-text">暂无参考文档。在下方添加。</div>';
    else refs.forEach(function(r, i) {
      h += '<div class="n-card" style="margin-bottom:6px;padding:10px;display:flex;align-items:center;gap:8px">' +
           '<div class="flex-1"><div class="fw-600 fs-12">' + escHtml(r.title||'未命名') + '</div>' +
           (r.tags ? '<div class="fs-10 c-fg2 mt-2">' + escHtml(r.tags) + '</div>' : '') +
           (r.note ? '<div class="fs-10 c-fg2 mt-2">' + escHtml(r.note).slice(0,60) + '</div>' : '') +
           (r.refDocKey ? '<div class="fs-10 c-accent mt-2">📄 已关联参考文档</div>' : '') + '</div>' +
           '<button class="btn-secondary btn-sm ref-del" data-idx="' + i + '" class="c-error flex-shrink-0">✕</button></div>';
    });
    h += '</div><div class="n-card" style="padding:10px;display:flex;gap:8px;align-items:center">' +
      '<input class="llm-input" id="refTitle" class="flex-2 fs-12" placeholder="作品名">' +
      '<input class="llm-input" id="refTags" class="flex-1 fs-12" placeholder="标签">' +
      '<input class="llm-input" id="refNote" class="flex-2 fs-12" placeholder="简述">' +
      '<button class="btn-sm" id="refAddBtn">＋ 添加</button></div>';

    // 从参考文档导入
    h += '<div class="mt-10" id="refDocImportSection"></div>';

    el.innerHTML = h;
    document.getElementById('refAddBtn').addEventListener('click', refAdd);
    Array.from(el.querySelectorAll('.ref-del')).forEach(function(btn) {
      btn.addEventListener('click', function() { refRemove(parseInt(this.getAttribute('data-idx'))); });
    });
    渲染参考文档导入列表();
  });
}

function 渲染参考文档导入列表() {
  var section = document.getElementById('refDocImportSection');
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
      h += '<button class="btn-secondary btn-sm" onclick="引用参考文档(\'' + escHtml(name) + '\')" style="flex-shrink:0">＋ 引用</button>';
      h += '</div>';
    });
    h += '</div>';
    section.innerHTML = h;
  });
}

function 引用参考文档(name) {
  Store.novel.get(_outlineTitle).then(function(m) {
    m = m || {};
    if (!m.references) m.references = [];
    // 检查是否已引用
    var exists = m.references.some(function(r) { return r.refDocKey === name || r.title === name; });
    if (exists) { toast('已引用该文档'); return; }
    m.references.push({ title: name, tags: '', note: '从参考文档导入', refDocKey: name });
    Store.novel.save(_outlineTitle, m).then(function() { toast('已引用'); 说otab('references'); });
  });
}
window.引用参考文档 = 引用参考文档;
function refAdd() {
  var title = document.getElementById('refTitle').value.trim();
  if (!title) { toast('请输入作品名'); return; }
  Store.novel.get(_outlineTitle).then(function(m) {
    m = m || {}; if (!m.references) m.references = [];
    m.references.push({ title: title, tags: document.getElementById('refTags').value.trim(), note: document.getElementById('refNote').value.trim() });
    Store.novel.save(_outlineTitle, m).then(function() { 说otab('references'); });
  });
}
function refRemove(i) {
  Store.novel.get(_outlineTitle).then(function(m) {
    if (!m || !m.references) return;
    m.references.splice(i, 1);
    Store.novel.save(_outlineTitle, m).then(function() { 说otab('references'); });
  });
}
