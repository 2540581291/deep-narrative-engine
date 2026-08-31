// 系列写作 · 写作备注
function XLAiGenerateNotes() {
  openAiGenPanel('XL_gen_notes');
}

function XLRenderNotes(el) {
  Store.seriesWriting.get(swActiveSeries).then(function(m) {
    m = m || {}; var notes = (m.writingNotes && m.writingNotes.length) ? m.writingNotes : ['待用户补充'];
    var h = '<div class="flex justify-between items-center mb-6">' +
      '<div><h4 class="m-0">📌 写作备注</h4><p class="text-muted text-sm mt-2">记录创作方向性要求，AI 生成会参考这些规则。</p></div>' +
      '<button class="btn" id="XLNotesAiGenBtn" class="bg-accent fs-12" onclick="openAiGenPanel(\'XL_gen_notes\')">🤖 AI 生成备注</button></div>' +
      '<div id="XLNotesList">';
    notes.forEach(function(note, i) {
      h += '<div class="n-card" style="margin-bottom:6px;padding:8px;display:flex;align-items:center;gap:8px">' +
           '<span class="llm-input XL-note-inp" style="flex:1;font-size:12px;border:none;background:transparent;padding:4px 0" contenteditable="true" data-nidx="' + i + '">' + escHtml(note) + '</span>' +
           '<button class="btn-secondary btn-sm XL-note-del" data-nidx="' + i + '" class="c-error flex-shrink-0">✕</button></div>';
    });
    h += '</div><button class="btn-secondary btn-sm" id="XLNoteAddBtn">＋ 添加备注</button>';
    el.innerHTML = h;
    document.getElementById('XLNoteAddBtn').addEventListener('click', function() {
      Store.seriesWriting.get(swActiveSeries).then(function(m2) {
        m2 = m2 || {};
        if (!m2.writingNotes) m2.writingNotes = [];
        m2.writingNotes.push('');
        Store.seriesWriting.save(swActiveSeries, m2);
        XL切标签('notes');
      });
    });
    Array.from(el.querySelectorAll('.XL-note-inp')).forEach(function(inp) {
      inp.addEventListener('blur', function() {
        var i = parseInt(this.getAttribute('data-nidx'));
        Store.seriesWriting.get(swActiveSeries).then(function(m2) {
          if (m2 && m2.writingNotes) {
            m2.writingNotes[i] = inp.textContent.trim();
            Store.seriesWriting.save(swActiveSeries, m2);
          }
        });
      });
    });
    Array.from(el.querySelectorAll('.XL-note-del')).forEach(function(btn) {
      btn.addEventListener('click', function() {
        var i = parseInt(this.getAttribute('data-nidx'));
        Store.seriesWriting.get(swActiveSeries).then(function(m2) {
          if (m2 && m2.writingNotes && m2.writingNotes.length > 0) {
            m2.writingNotes.splice(i, 1);
            if (!m2.writingNotes.length) m2.writingNotes = ['待用户补充'];
            Store.seriesWriting.save(swActiveSeries, m2);
            XL切标签('notes');
          }
        });
      });
    });
  });
}
