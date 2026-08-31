// 系列写作 · 阅读
function 渲染系列写作阅读(el) {
  if (!swActiveSeries) { el.innerHTML = '<div class="placeholder-text">请先选择一个系列</div>'; return; }
  Store.seriesWriting.get(swActiveSeries).then(function(data) {
    var writings = data.writings || {};
    var keys = Object.keys(writings).sort();
    var h = '<div class="mb-8 flex justify-between items-center">';
    h += '<div><span class="fw-600">📖 ' + escHtml(swActiveSeries) + '</span></div>';
    h += '<div class="btn-secondary btn-sm" onclick="系列写作切换标签(\'outline\')">← 大纲</div></div>';
    if (!keys.length) {
      h += '<div class="placeholder-text">暂无内容</div>';
    } else {
      h += '<div id="swReadingContent" class="pre-wrap lh-18 fs-14"></div>';
    }
    el.innerHTML = h;
    if (keys.length) {
      系列写作阅读章节(keys[0]);
    }
  });
}

function 系列写作阅读章节(key) {
  Store.seriesWriting.get(swActiveSeries).then(function(data) {
    var w = (data.writings||{})[key];
    var el = document.getElementById('swReadingContent');
    if (!el || !w) return;
    el.innerHTML = '<div style="font-weight:600;font-size:16px;margin-bottom:12px">' + escHtml(w.title) + '</div>'
      + '<div>' + escHtml(w.content) + '</div>';
  });
}
window.系列写作阅读章节 = 系列写作阅读章节;

window.swReadChapter = window.系列写作阅读章节;