// 系列写作 · 保存逻辑

var _XLAutoSaveTimer = null;
function XLSaveDelayed() { if (_XLAutoSaveTimer) clearTimeout(_XLAutoSaveTimer); _XLAutoSaveTimer = setTimeout(XL保存, 500); }

function XL保存() {
  Store.seriesWriting.get(swActiveSeries).then(function(m) {
    m = m || {};

    Array.from(document.querySelectorAll('#XLDomList > .n-card')).forEach(function(card, i) {
      var nameInput = card.querySelector('.XL-cname');
      if (!nameInput) return;
      var name = nameInput.value.trim();
      if (!name) return;
      if (!m.doms) m.doms = [];
      var existing = m.doms[i] || {};
      if (!existing.identity) existing.identity = {};
      ['basicInfo','background','experience'].forEach(function(s) { if (!existing.identity[s]) existing.identity[s] = {}; });

      existing.identity.basicInfo.name = name;
      existing.identity.basicInfo.gender = (card.querySelector('.XL-cgender') || {}).value || '女性';

      card.querySelectorAll('[data-ovfield]').forEach(function(el) {
        var path = el.getAttribute('data-ovfield').split('.');
        if (path[0] !== 'identity') return;
        var cur = existing;
        for (var j = 1; j < path.length - 1; j++) {
          if (!cur[path[j]] || typeof cur[path[j]] !== 'object') cur[path[j]] = {};
          cur = cur[path[j]];
        }
        var raw = el.value.trim();
        var key = path[path.length - 1];
        cur[key] = (key === 'skills' || key === 'talents') ? (raw ? raw.split(/[、,，\s]+/).filter(Boolean) : []) : raw;
      });
      m.doms[i] = existing;
    });
    if (m.doms) m.doms = m.doms.filter(Boolean);

    Array.from(document.querySelectorAll('#XLSubList > .n-card')).forEach(function(card, i) {
      var nameInput = card.querySelector('.XL-cname');
      if (!nameInput) return;
      var name = nameInput.value.trim();
      if (!name) return;
      if (!m.subs) m.subs = [];
      var existing = m.subs[i] || {};
      if (!existing.identity) existing.identity = {};
      ['basicInfo','background','experience'].forEach(function(s) { if (!existing.identity[s]) existing.identity[s] = {}; });

      existing.identity.basicInfo.name = name;
      existing.identity.basicInfo.gender = (card.querySelector('.XL-cgender') || {}).value || '女性';

      card.querySelectorAll('[data-ovfield]').forEach(function(el) {
        var path = el.getAttribute('data-ovfield').split('.');
        if (path[0] !== 'identity') return;
        var cur = existing;
        for (var j = 1; j < path.length - 1; j++) {
          if (!cur[path[j]] || typeof cur[path[j]] !== 'object') cur[path[j]] = {};
          cur = cur[path[j]];
        }
        var raw = el.value.trim();
        var key = path[path.length - 1];
        cur[key] = (key === 'skills' || key === 'talents') ? (raw ? raw.split(/[、,，\s]+/).filter(Boolean) : []) : raw;
      });
      m.subs[i] = existing;
    });
    if (m.subs) m.subs = m.subs.filter(Boolean);

    m.genreTags = [];
    Array.from(document.querySelectorAll('#XLGenreChips .XL-tag-del')).forEach(function(el) {
      var t = el.getAttribute('data-tag');
      if (t) m.genreTags.push(t);
    });
    m.playTags = [];
    Array.from(document.querySelectorAll('#XLPlayChips .XL-tag-del')).forEach(function(el) {
      var t = el.getAttribute('data-tag');
      if (t) m.playTags.push(t);
    });
    m.tags = m.genreTags;
    m.premise = document.getElementById('XLPremise').value.trim();
    m.chapterCount = Math.max(1, Math.min(100, parseInt(document.getElementById('XLChapterCount').value) || 10));
    Store.seriesWriting.save(swActiveSeries, m);
  });
}

window.XLSaveDelayed = XLSaveDelayed;
window.XL保存 = XL保存;
