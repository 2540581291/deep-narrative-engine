// 情欲文学 · 成人小说模块（重构版）
var 小说导航 = [
  { id: 'list', label: '📋 作品列表' },
  { id: 'outline', label: '📐 大纲规划' },
  { id: 'writing', label: '📝 写作台' },
];
var 小说当前视图 = 'list';
var novelCurrentTitle = localStorage.getItem('novelCurrentTitle') || null;

var 小说Api = null;

function 小说切换视图(view) {
  // 如果切换到写作，但没有选择作品，自动切换到列表
  if (view === 'writing' && !novelCurrentTitle) {
    view = 'list';
  }
  小说当前视图 = view;
  var el = document.getElementById('novelContent');
  if (!el) return;
  if (!小说Api) {
    小说Api = 渲染标签栏(el, 小说导航, { active: view, subId: 'novelViewContent', onSwitch: function(v){ 小说切换视图(v); } });
  } else {
    小说Api.setActive(view);
  }
  var vEl = 小说Api.sub;
  switch (view) {
    case 'list':    渲染小说列表(vEl); break;
    case 'outline': renderNovelOutline(vEl, novelCurrentTitle); break;
    case 'writing': 渲染小说写作(vEl); break;
    default: vEl.innerHTML = '<div class="placeholder-text">开发中...</div>';
  }
}

// 题材标签
var GENRE_TAGS = [
  { id: 'school', label: '校园' }, { id: 'xiuxian', label: '修仙' },
  { id: 'fantasy', label: '奇幻' }, { id: 'scifi', label: '科幻' },
  { id: 'modern', label: '现代' }, { id: 'ancient', label: '古代' },
  { id: 'western', label: '西方' }, { id: 'apocalypse', label: '末日' },
  { id: 'palace', label: '宫廷' }, { id: 'urban', label: '都市' },
  { id: 'reality', label: '现实' }, { id: 'game', label: '游戏世界' },
];
// 玩法标签
var PLAY_TAGS = [
  { id: 'pure-love', label: '纯爱' }, { id: 'ntr', label: 'NTR' },
  { id: 'bdsm', label: 'BDSM' }, { id: 'training', label: '调教' },
  { id: 'sex-slave', label: '性奴' }, { id: 'beast', label: '兽奸' },
  { id: 'hypnosis', label: '催眠' }, { id: 'exposure', label: '露出' },
  { id: 'cuckold', label: '绿帽' }, { id: 'gangbang', label: '群P' },
  { id: 'incest', label: '乱伦' }, { id: 'sm', label: 'SM' },
  { id: 'tentacle', label: '触手' }, { id: 'futanari', label: '扶她' },
  { id: 'yuri', label: '百合' }, { id: 'yaoi', label: '耽美' },
  { id: 'double-sex', label: '双性' }, { id: 'enema', label: '浣肠' },
  { id: 'squirt', label: '潮吹' }, { id: 'incontinence', label: '失禁' },
  { id: 'bondage', label: '拘束' }, { id: 'body-mod', label: '人体改造' },
  { id: 'impregnation', label: '孕肚' }, { id: 'egg-laying', label: '产卵' },
  { id: 'bukkake', label: '颜射' }, { id: 'footjob', label: '足交' },
  { id: 'fellatio', label: '口交' }, { id: 'body-writing', label: '淫纹' },
  { id: 'piercing', label: '穿刺' }, { id: 'watersports', label: '尿Play' },
  { id: 'tickle', label: '挠痒' }, { id: 'mind-control', label: '精神控制' },
];
// 向后兼容
var NOVEL_TAGS = GENRE_TAGS;

// 篇幅选项
var NOVEL_LENGTHS = [
  { id: 'long', label: '长篇连载（20 章+）' },
  { id: 'medium', label: '中篇（5-20 章）' },
  { id: 'short', label: '短篇（1-5 章）' },
  { id: 'micro', label: '微小说（300-800 字）' },
];

registerPageRoute('novel', function(el) { debugLog('novel', '页面加载'); 小说切换视图(小说当前视图); });
window.小说切换视图 = 小说切换视图;
window.小说切换视图 = window.小说切换视图;
window.NOVEL_TAGS = NOVEL_TAGS;
window.GENRE_TAGS = GENRE_TAGS;
window.PLAY_TAGS = PLAY_TAGS;
window.NOVEL_LENGTHS = NOVEL_LENGTHS;
