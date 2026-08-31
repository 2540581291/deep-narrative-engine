function aiGenerateNotes() {
  // 已迁移至 registerAiField('gen_notes')，通过 openAiGenPanel 调用
  // 保留此函数以防旧按钮引用
  openAiGenPanel('gen_notes');
}

function renderOutlineNotes(el) {
  Store.novel.get(_outlineTitle).then(function(m) {
    m = m || {}; var notes = (m.writingNotes && m.writingNotes.length) ? m.writingNotes : ['待用户补充'];
    var h = '<div class="flex justify-between items-center mb-6">' +
      '<div><h4 class="m-0">📌 写作备注</h4><p class="text-muted text-sm mt-2">记录创作方向性要求，AI 生成会参考这些规则。</p></div>' +
      '<button class="btn" id="notesAiGenBtn" class="bg-accent fs-12" onclick="openAiGenPanel(\'gen_notes\')">🤖 AI 生成备注</button></div>' +
      '<div id="notesList">';
    notes.forEach(function(note, i) {
      h += '<div class="n-card" style="margin-bottom:6px;padding:8px;display:flex;align-items:center;gap:8px">' +
           '<span class="llm-input note-inp" style="flex:1;font-size:12px;border:none;background:transparent;padding:4px 0" contenteditable="true" data-nidx="' + i + '">' + escHtml(note) + '</span>' +
           '<button class="btn-secondary btn-sm note-del" data-nidx="' + i + '" class="c-error flex-shrink-0">✕</button></div>';
    });
    h += '</div><button class="btn-secondary btn-sm" id="noteAddBtn">＋ 添加备注</button>';
    el.innerHTML = h;
    // 页面级 AI 已通过 onclick 在 HTML 中调用 openAiGenPanel
    document.getElementById('noteAddBtn').addEventListener('click', function() {
      Store.novel.get(_outlineTitle).then(function(m2) {
        m2 = m2 || {};
        if (!m2.writingNotes) m2.writingNotes = [];
        m2.writingNotes.push('');
        Store.novel.save(_outlineTitle, m2);
        说otab('notes');
      });
    });
    Array.from(el.querySelectorAll('.note-inp')).forEach(function(inp) {
      inp.addEventListener('blur', function() {
        var i = parseInt(this.getAttribute('data-nidx'));
        Store.novel.get(_outlineTitle).then(function(m2) {
          if (m2 && m2.writingNotes) {
            m2.writingNotes[i] = inp.textContent.trim();
            Store.novel.save(_outlineTitle, m2);
          }
        });
      });
    });
    Array.from(el.querySelectorAll('.note-del')).forEach(function(btn) {
      btn.addEventListener('click', function() {
        var i = parseInt(this.getAttribute('data-nidx'));
        Store.novel.get(_outlineTitle).then(function(m2) {
          if (m2 && m2.writingNotes && m2.writingNotes.length > 0) {
            m2.writingNotes.splice(i, 1);
            if (!m2.writingNotes.length) m2.writingNotes = ['待用户补充'];
            Store.novel.save(_outlineTitle, m2);
            说otab('notes');
          }
        });
      });
    });
  });
}
