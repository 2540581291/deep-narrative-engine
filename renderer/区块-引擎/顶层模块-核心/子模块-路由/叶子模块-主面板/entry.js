var 页面路由 = {
  home:     { nav: 'main', label: '首页',       render: null },
  novel:    { nav: 'main', label: '情欲文学',   render: null },
  world:    { nav: 'main', label: '世界观',     render: null },
  character: { nav: 'main', label: '角色卡',     render: null },
  'fap-reference': { nav: 'main', label: '玩法参考', render: null },
  rp:       { nav: 'main', label: '场景模拟',   render: null },
  training: { nav: 'main', label: '调教模拟',   render: null },
  'interactive-novel': { nav: 'main', label: '互动小说', render: null },
  weixin: { nav: 'im', label: '微信', render: null },
  qqim: { nav: 'im', label: 'QQ', render: null },
  'xing-zheng-zhu-shou': { nav: 'tool', label: '行政助手', render: null },
  'social-feed': { nav: 'main', label: '社区动态', render: null },
  heisha: { nav: 'online', label: '小黑盒', render: null },
  weibo: { nav: 'online', label: '微博', render: null },
  douyin: { nav: 'online', label: '抖音', render: null },
  zhihu: { nav: 'online', label: '知乎', render: null },
  bilibili: { nav: 'online', label: '哔哩哔哩', render: null },
  xiaohongshu: { nav: 'online', label: '小红书', render: null },
  tianya: { nav: 'online', label: '天涯论坛', render: null },
  haijiao: { nav: 'online', label: '海角论坛', render: null },
  laowang: { nav: 'online', label: '老王论坛', render: null },
  tieba: { nav: 'online', label: '贴吧', render: null },
  qidian: { nav: 'online', label: '起点中文网', render: null },
  'fetish-quiz': { nav: 'main', label: '性癖问答', render: null },
  'char-chat': { nav: 'main', label: '角色聊天', render: null },
  'life-observe': { nav: 'main', label: '生活观赏', render: null },
  settings:    { nav: 'main', label: '设置',       render: null },
  'series-writing': { nav: 'main', label: '系列写作', render: null },
  vignette:    { nav: 'more', label: '情色短章',   render: null },
  fragment: { nav: 'more', label: '碎片叙事',   render: null },
  'letter-social': { nav: 'more', label: '书信社交', render: null },
  'life-doc': { nav: 'more', label: '生活纪实', render: null },
  newspaper: { nav: 'more', label: '新闻媒体', render: null },
  'yin-shi-yan-qu': { nav: 'more', label: '淫诗艳曲', render: null },
  'lang-yu-sao-ge': { nav: 'more', label: '浪语骚歌', render: null },
  'meng-xue-yan-dian': { nav: 'more', label: '蒙学艳典', render: null },
  'sex-script': { nav: 'more', label: '性爱台本', render: null },
  'role-script': { nav: 'more', label: '角色台本', render: null },
  flash: { nav: 'misc', label: '闲情小品', render: null },
  'wen-xue-gai-bian': { nav: 'more', label: '文学改编', render: null },
  'dian-ping-shang-xi': { nav: 'more', label: '点评赏析', render: null },
  'jin-xiu-wen-zhang': { nav: 'more', label: '锦绣文章', render: null },
  'erotica-pub': { nav: 'misc', label: '宣传发布', render: null },
  'erotica-doc': { nav: 'misc', label: '记录文书', render: null },
  'erotica-life': { nav: 'misc', label: '生活消费', render: null },

  aids:     { nav: 'more', label: '生图识图',   render: null },
  'pei-yin-pei-yue': { nav: 'more', label: '配音配乐', render: null },
  'sheng-tu-ci-dian': { nav: 'more', label: '生图词典', render: null },
  'sheng-tu-cheng-guo': { nav: 'more', label: '生图成果', render: null },
  'ref-doc': { nav: 'main', label: '文风分析',   render: null },
  inspiration: { nav: 'main', label: '灵感板', render: null },
  books: { nav: 'main', label: '学术春宫', render: null },
  arts: { nav: 'main', label: '黄图淫册', render: null },
  videos: { nav: 'main', label: '影视', render: null },
  games: { nav: 'main', label: '黄游拔作', render: null },
};

// 区块 → 模块列表映射
var 区块模块 = {
  home: [],
  'xing-zheng-zhu-shou': ['xing-zheng-zhu-shou'],
  weixin: ['weixin','qqim'],
  qqim: ['weixin','qqim'],
  novel: ['novel','series-writing','vignette','life-doc'],
  'interactive-novel': ['interactive-novel','fetish-quiz','char-chat','life-observe'],
  'sheng-tu-chuang-zuo': ['aids', 'sheng-tu-ci-dian', 'pei-yin-pei-yue', 'sheng-tu-cheng-guo'],
  settings: ['settings'],
  'social-feed': ['heisha','weibo','douyin','zhihu','bilibili','xiaohongshu','tianya','haijiao','laowang','tieba','qidian'],
  heisha: ['heisha','weibo','douyin','zhihu','bilibili','xiaohongshu','tianya','haijiao','laowang','tieba','qidian'],
  weibo: ['heisha','weibo','douyin','zhihu','bilibili','xiaohongshu','tianya','haijiao','laowang','tieba','qidian'],
  douyin: ['heisha','weibo','douyin','zhihu','bilibili','xiaohongshu','tianya','haijiao','laowang','tieba','qidian'],
  zhihu: ['heisha','weibo','douyin','zhihu','bilibili','xiaohongshu','tianya','haijiao','laowang','tieba','qidian'],
  bilibili: ['heisha','weibo','douyin','zhihu','bilibili','xiaohongshu','tianya','haijiao','laowang','tieba','qidian'],
  xiaohongshu: ['heisha','weibo','douyin','zhihu','bilibili','xiaohongshu','tianya','haijiao','laowang','tieba','qidian'],
  tianya: ['heisha','weibo','douyin','zhihu','bilibili','xiaohongshu','tianya','haijiao','laowang','tieba','qidian'],
  haijiao: ['heisha','weibo','douyin','zhihu','bilibili','xiaohongshu','tianya','haijiao','laowang','tieba','qidian'],
  laowang: ['heisha','weibo','douyin','zhihu','bilibili','xiaohongshu','tianya','haijiao','laowang','tieba','qidian'],
  tieba: ['heisha','weibo','douyin','zhihu','bilibili','xiaohongshu','tianya','haijiao','laowang','tieba','qidian'],
  qidian: ['heisha','weibo','douyin','zhihu','bilibili','xiaohongshu','tianya','haijiao','laowang','tieba','qidian'],
  'fetish-quiz': ['interactive-novel','fetish-quiz','char-chat','life-observe'],
  'char-chat': ['interactive-novel','fetish-quiz','char-chat','life-observe'],
  'life-observe': ['interactive-novel','fetish-quiz','char-chat','life-observe'],
  aids: ['sheng-tu-chuang-zuo','aids','sheng-tu-ci-dian','pei-yin-pei-yue'],
  'sheng-tu-ci-dian': ['sheng-tu-chuang-zuo','aids','sheng-tu-ci-dian','pei-yin-pei-yue'],
  'pei-yin-pei-yue': ['sheng-tu-chuang-zuo','aids','sheng-tu-ci-dian','pei-yin-pei-yue','sheng-tu-cheng-guo'],
  'sheng-tu-cheng-guo': ['sheng-tu-chuang-zuo','aids','sheng-tu-ci-dian','pei-yin-pei-yue','sheng-tu-cheng-guo'],
  world: ['world','character','fap-reference','ref-doc','inspiration'],
  character: ['world','character','fap-reference','ref-doc','inspiration'],
  'fap-reference': ['world','character','fap-reference','ref-doc','inspiration'],
  'ref-doc': ['world','character','fap-reference','ref-doc','inspiration'],
  'inspiration': ['world','character','fap-reference','ref-doc','inspiration'],
  'series-writing': ['novel','series-writing','vignette','life-doc'],
  vignette: ['novel','series-writing','vignette','life-doc'],
  'yin-shi-yan-qu': ['yin-shi-yan-qu','lang-yu-sao-ge','meng-xue-yan-dian','sex-script','role-script','flash','wen-xue-gai-bian','dian-ping-shang-xi','jin-xiu-wen-zhang','letter-social','books','newspaper','arts','videos','games'],
  'lang-yu-sao-ge': ['yin-shi-yan-qu','lang-yu-sao-ge','meng-xue-yan-dian','sex-script','role-script','flash','wen-xue-gai-bian','dian-ping-shang-xi','jin-xiu-wen-zhang','letter-social','books','newspaper','arts','videos','games'],
  'meng-xue-yan-dian': ['yin-shi-yan-qu','lang-yu-sao-ge','meng-xue-yan-dian','sex-script','role-script','flash','wen-xue-gai-bian','dian-ping-shang-xi','jin-xiu-wen-zhang','letter-social','books','newspaper','arts','videos','games'],
  flash: ['yin-shi-yan-qu','lang-yu-sao-ge','meng-xue-yan-dian','sex-script','role-script','flash','wen-xue-gai-bian','dian-ping-shang-xi','jin-xiu-wen-zhang','letter-social','books','newspaper','arts','videos','games'],
  'wen-xue-gai-bian': ['yin-shi-yan-qu','lang-yu-sao-ge','meng-xue-yan-dian','sex-script','role-script','flash','wen-xue-gai-bian','dian-ping-shang-xi','jin-xiu-wen-zhang','letter-social','books','newspaper','arts','videos','games'],
  books: ['yin-shi-yan-qu','lang-yu-sao-ge','meng-xue-yan-dian','sex-script','role-script','flash','wen-xue-gai-bian','dian-ping-shang-xi','jin-xiu-wen-zhang','letter-social','books','newspaper','arts','videos','games'],
  arts: ['yin-shi-yan-qu','lang-yu-sao-ge','meng-xue-yan-dian','sex-script','role-script','flash','wen-xue-gai-bian','dian-ping-shang-xi','jin-xiu-wen-zhang','letter-social','books','newspaper','arts','videos','games'],
  videos: ['yin-shi-yan-qu','lang-yu-sao-ge','meng-xue-yan-dian','sex-script','role-script','flash','wen-xue-gai-bian','dian-ping-shang-xi','jin-xiu-wen-zhang','letter-social','books','newspaper','arts','videos','games'],
  games: ['yin-shi-yan-qu','lang-yu-sao-ge','meng-xue-yan-dian','sex-script','role-script','flash','wen-xue-gai-bian','dian-ping-shang-xi','jin-xiu-wen-zhang','letter-social','books','newspaper','arts','videos','games'],
};

var 区块标签 = {
  'interactive-novel':'互动创作', 'sheng-tu-chuang-zuo':'声图创作',
  'erotica-pub':'情色杂物', settings:'设置'
};

var 侧边栏项 = [
  { cat: '📖 情欲文学', items: [
    { id:'novel', label:'成人小说' },
    { id:'series-writing', label:'系列写作' },
    { id:'vignette', label:'情色短章' },
    { id:'life-doc', label:'生活纪实' },
  ]},
  { cat: '🔧 情欲工坊', items: [
    { id:'yin-shi-yan-qu', label:'淫诗艳曲' }, { id:'lang-yu-sao-ge', label:'浪语骚歌' },
    { id:'meng-xue-yan-dian', label:'蒙学艳典' },
    { id:'sex-script', label:'性爱台本' },
    { id:'role-script', label:'角色台本' },
    { id:'letter-social', label:'书信社交' },
    { id:'wen-xue-gai-bian', label:'文学改编' },
    { id:'dian-ping-shang-xi', label:'点评赏析' },
    { id:'jin-xiu-wen-zhang', label:'锦绣文章' },
    { id:'books', label:'学术春宫' },
    { id:'newspaper', label:'新闻媒体' },
    { id:'arts', label:'黄图淫册' },
    { id:'videos', label:'影视动画' },
    { id:'games', label:'黄游拔作' },
  ]},
  { cat: '📦 情色杂物', items: [
    { id:'erotica-pub', label:'宣传发布' },
    { id:'erotica-doc', label:'记录文书' },
    { id:'erotica-life', label:'生活消费' },
    { id:'flash', label:'闲情小品' },
  ]},
  { cat: '✨ 互动创作', items: [
    { id:'interactive-novel', label:'互动小说' },
    { id:'fetish-quiz', label:'性癖问答' },
    { id:'char-chat', label:'角色聊天' },
    { id:'life-observe', label:'生活观赏' },
  ]},
  { cat: '🎨 声图创作', items: [
    { id:'sheng-tu-ci-dian', label:'生图词典' },
    { id:'aids', label:'生图识图' },
    { id:'pei-yin-pei-yue', label:'配音配乐' },
    { id:'sheng-tu-cheng-guo', label:'生图成果' },
  ]},
  { cat: '👤 创作辅助', items: [
    { id:'character', label:'角色卡' },
    { id:'world', label:'世界观' },
    { id:'fap-reference', label:'玩法参考' },
    { id:'ref-doc',   label:'文风分析' },
    { id:'inspiration', label:'灵感板' },
  ]},
];

function 渲染侧边栏(pg) {
  var el = document.getElementById('leftBar');
  if (!el) return;
  var h = '';
  侧边栏项.forEach(function(section) {
    var hasActive = false;
    section.items.forEach(function(it) { if (it.id === pg) hasActive = true; });
    if (section.items.length === 0) return;
    h += '<div class="cat-block">';
    h += '<div class="cat">' + section.cat + '</div>';
    section.items.forEach(function(it) {
      h += '<div class="item' + (it.id === pg ? ' act' : '') + '" data-pg="' + it.id + '" onclick="切换页面(\'' + it.id + '\')">' + it.label + '</div>';
    });
    h += '</div>';
  });
  el.innerHTML = h;
}

function 注册页面路由(pgId, renderFn) {
  if (页面路由[pgId]) 页面路由[pgId].render = renderFn;
}

function 切换页面(pg) {
  // 清理残留的弹窗覆盖层
  document.querySelectorAll('.ovl').forEach(function(el) { el.remove(); });

  // Hide all pages, show target
  document.querySelectorAll('.pg').forEach(function(el) { el.style.display = 'none'; });
  var target = document.getElementById('pg-' + pg);
  if (target) target.style.display = 'block';

  // Update top nav
  document.querySelectorAll('.top-nav-item').forEach(function(el) { el.classList.remove('act'); });
  var activeNav = document.querySelector('.top-nav-item[data-pg="' + pg + '"]');
  if (activeNav) activeNav.classList.add('act');
  // Also try parent block for nav highlighting
  var block = Object.keys(区块模块).find(function(k) { return 区块模块[k].indexOf(pg) >= 0; });
  if (block && block !== pg) {
    var blockNav = document.querySelector('.top-nav-item[data-pg="' + block + '"]');
    if (blockNav) blockNav.classList.add('act');
  }

  设置当前页面(pg);
  debugLog('router', '切换页面', pg);

  // Update sidebar
  渲染侧边栏(pg);

  // Render content
  var route = 页面路由[pg];
  if (route && route.render) {
    var contentEl = document.getElementById(pg + 'Content');
    if (contentEl) {
      route.render(contentEl);
    } else {
      debugLog('router', '容器未找到', pg + 'Content');
    }
  } else {
    debugLog('router', '路由未注册', pg);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.top-nav-item').forEach(function(el) {
    el.addEventListener('click', function() { var p = this.getAttribute('data-pg'); if (p) 切换页面(p); });
  });
  document.querySelectorAll('.dash-card').forEach(function(el) {
    el.addEventListener('click', function() { var p = this.getAttribute('data-pg'); if (p) 切换页面(p); });
  });
  渲染侧边栏('home');
});

window.切换页面 = 切换页面;
window.switchPage = 切换页面;
window.注册页面路由 = 注册页面路由;
window.registerPageRoute = 注册页面路由;
// 侧边栏真实顺序（供「作品选择器」等组件按 UI 顺序排列）
window.侧边栏项 = 侧边栏项;
window.sidebarItems = 侧边栏项;
