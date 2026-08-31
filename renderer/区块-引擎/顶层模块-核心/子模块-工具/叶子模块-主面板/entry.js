// 深度-叙事引擎 · 工具函数

function 唯一标识() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function 格式化日期(date) {
  var d = date || new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0') + ' ' +
    String(d.getHours()).padStart(2, '0') + ':' +
    String(d.getMinutes()).padStart(2, '0');
}

function 字数统计(text) {
  if (!text) return 0;
  // Chinese characters count as words, English split by whitespace
  var cn = (text.match(/[一-鿿㐀-䶿豈-﫿]/g) || []).length;
  var en = text.replace(/[一-鿿㐀-䶿豈-﫿]/g, ' ')
    .split(/\s+/).filter(Boolean).length;
  return cn + en;
}

function 转义HTML(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function 防抖(fn, ms) {
  var timer;
  return function() {
    var ctx = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function() { fn.apply(ctx, args); }, ms);
  };
}

function 截断(str, len) {
  if (!str || str.length <= len) return str || '';
  return str.slice(0, len) + '...';
}

window.唯一标识 = 唯一标识;
window.uuid = 唯一标识;
window.格式化日期 = 格式化日期;
window.fmtDate = 格式化日期;
window.字数统计 = 字数统计;
window.wordCount = 字数统计;
window.转义HTML = 转义HTML;
window.escHtml = 转义HTML;
window.防抖 = 防抖;
window.debounce = 防抖;
window.截断 = 截断;
window.truncate = 截断;
