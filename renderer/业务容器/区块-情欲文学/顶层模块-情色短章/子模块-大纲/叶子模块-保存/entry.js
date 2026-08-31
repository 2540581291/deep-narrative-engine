// 情色短章大纲 · 保存逻辑

var 短ovAutoSaveTimer = null;
function 短saveDelayed() { if (短ovAutoSaveTimer) clearTimeout(短ovAutoSaveTimer); 短ovAutoSaveTimer = setTimeout(短ovSave, 500); }

// ===== 短ovSave（包含角色字段，data-ovfield 嵌套 identity） =====
function 短ovSave() {
  Store.vignette.get(短ot).then(function(m) {
    m = m || {};

    // 合并概览角色字段到已有数据（仅保存 DOM 中的可编辑字段）
    Array.from(document.querySelectorAll('#ovDomList > .n-card')).forEach(function(card, i) {
      var nameInput = card.querySelector('.ov-cname');
      if (!nameInput) return;
      var name = nameInput.value.trim();
      if (!name) return;
      if (!m.doms) m.doms = [];
      var existing = m.doms[i] || {};
      // 保留已有 identity 结构（含 overview 不展示的字段如 price/id/icon/role）
      if (!existing.identity) existing.identity = {};
      ['basicInfo','background','experience'].forEach(function(s) { if (!existing.identity[s]) existing.identity[s] = {}; });

      // 从 DOM 读取特定字段
      existing.identity.basicInfo.name = name;
      existing.identity.basicInfo.gender = (card.querySelector('.ov-cgender') || {}).value || '女性';

      // 统一从 data-ovfield 读取所有可编辑 identity 字段
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

    Array.from(document.querySelectorAll('#ovSubList > .n-card')).forEach(function(card, i) {
      var nameInput = card.querySelector('.ov-cname');
      if (!nameInput) return;
      var name = nameInput.value.trim();
      if (!name) return;
      if (!m.subs) m.subs = [];
      var existing = m.subs[i] || {};

      // 保留已有 identity 结构（含 overview 不展示的字段）
      if (!existing.identity) existing.identity = {};
      ['basicInfo','background','experience'].forEach(function(s) { if (!existing.identity[s]) existing.identity[s] = {}; });

      // 从 DOM 读取特定字段
      existing.identity.basicInfo.name = name;
      existing.identity.basicInfo.gender = (card.querySelector('.ov-cgender') || {}).value || '女性';

      // 统一从 data-ovfield 读取所有可编辑 identity 字段
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

    // 收藏故事设定
    m.genreTags = [];
    Array.from(document.querySelectorAll('#ovGenreChips .ov-tag-del')).forEach(function(el) {
      var t = el.getAttribute('data-tag');
      if (t) m.genreTags.push(t);
    });
    m.playTags = [];
    Array.from(document.querySelectorAll('#ovPlayChips .ov-tag-del')).forEach(function(el) {
      var t = el.getAttribute('data-tag');
      if (t) m.playTags.push(t);
    });
    m.tags = m.genreTags;
    m.premise = document.getElementById('ovPremise').value.trim();
    m.chapterCount = Math.max(1, Math.min(100, parseInt(document.getElementById('ovChapterCount').value) || 1));
    Store.vignette.save(短ot, m);
  });
}

// 暴露到全局
window.短saveDelayed = 短saveDelayed;
window.短ovSave = 短ovSave;
