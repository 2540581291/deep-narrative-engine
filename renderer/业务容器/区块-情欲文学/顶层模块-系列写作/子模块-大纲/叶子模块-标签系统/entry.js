// 系列写作 · 标签系统

function XLWatchAiSuggestions(fieldId, containerId) {
  var container = document.getElementById('aiopts_XL_' + fieldId);
  if (!container) return;
  var obs = new MutationObserver(function() {
    container.querySelectorAll('.ai-chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        var text = this.textContent.trim();
        var ds = document.getElementById(containerId);
        if (ds) ds.innerHTML += XLRenderTagChips([text]);
        container.style.display = 'none';
        XLSaveDelayed();
      });
    });
  });
  obs.observe(container, { childList: true, subtree: true });
}

function XLRenderTagChips(tags, tagList) {
  if (!tags || !tags.length) return '';
  return tags.map(function(t) {
    var label = t;
    if (tagList) tagList.forEach(function(tl) { if (tl.id === t) label = tl.label; });
    return '<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;background:var(--accent-dim);color:var(--accent2);border-radius:10px;font-size:11px;border:1px solid var(--accent)">' +
      escHtml(label) + '<span class="XL-tag-del" data-tag="' + escHtml(t) + '" style="cursor:pointer;opacity:0.6;margin-left:2px">✕</span></span>';
  }).join('');
}

function XLAddTag(containerId, tag) {
  if (!tag) return;
  var chips = document.getElementById(containerId);
  if (!chips) return;
  var existing = chips.querySelectorAll('[data-tag]');
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].getAttribute('data-tag') === tag) return;
  }
  chips.innerHTML += XLRenderTagChips([tag]);
}

window.XLWatchAiSuggestions = XLWatchAiSuggestions;
window.XLRenderTagChips = XLRenderTagChips;
window.XLAddTag = XLAddTag;
