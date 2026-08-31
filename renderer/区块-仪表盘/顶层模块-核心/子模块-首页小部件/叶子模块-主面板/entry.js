// 深度-叙事引擎 · 首页小部件系统
// 每个顶层模块 = 一个小部件（widget），可自由添加/移除/排序，像手机桌面小部件
// 数据原则：先聚合提取成快照，页面只读快照，不实时逐个调用 Store

// ===== 小部件定义（按六大区块分组；dirs 为存储目录，供无 store 的模块兜底）=====
var HOME_WIDGETS = [
  // ---- 情欲文学 ----
  { id:'novel', block:'情欲文学', icon:'📕', label:'成人小说', desc:'长篇创作', pg:'novel', store:'novel' },
  { id:'seriesWriting', block:'情欲文学', icon:'📘', label:'系列写作', desc:'系列作品', pg:'series-writing', store:'seriesWriting' },
  { id:'vignette', block:'情欲文学', icon:'📗', label:'情色短章', desc:'短篇速写', pg:'vignette', store:'vignette' },
  { id:'lifeDoc', block:'情欲文学', icon:'📝', label:'生活纪实', desc:'日记体纪实', pg:'life-doc', store:'lifeDoc' },
  // ---- 情欲工坊 ----
  { id:'yin-shi-yan-qu', block:'情欲工坊', icon:'📜', label:'淫诗艳曲', desc:'诗词曲赋', pg:'yin-shi-yan-qu', store:'yinShi', dirs:['淫诗','情诗','艳词','艳曲','古体艳诗','现代艳诗','近代艳诗','打油艳诗'] },
  { id:'lang-yu-sao-ge', block:'情欲工坊', icon:'🎵', label:'浪语骚歌', desc:'歌词歌谣', pg:'lang-yu-sao-ge', store:'popSong', dirs:['民歌山歌','流行歌曲','军旅战歌','儿歌童谣','鬼畜神曲','影视金曲','酒桌欢歌','颂歌圣咏','嘻哈说唱'] },
  { id:'meng-xue-yan-dian', block:'情欲工坊', icon:'🏛', label:'蒙学艳典', desc:'典籍改编', pg:'meng-xue-yan-dian', store:'mengXueSanZiJing', dirs:['三字经艳典','弟子规艳典','论语艳典'] },
  { id:'sex-script', block:'情欲工坊', icon:'🎭', label:'性爱台本', desc:'台本对白', pg:'sex-script', store:'sexScript', dirs:['性爱台本','戏曲唱段','调教对白','暧昧对白','直播对白','相声','快板'] },
  { id:'role-script', block:'情欲工坊', icon:'🎬', label:'角色台本', desc:'自述·诵读·对白', pg:'role-script', store:'roleMonologue', dirs:['角色自述','角色诵读','经历台词','关系对话','角色辱骂','性辱骂'] },
  { id:'jin-xiu-wen-zhang', block:'情欲工坊', icon:'✒️', label:'锦绣文章', desc:'文章辞赋', pg:'jin-xiu-wen-zhang', store:'yiLunWen', dirs:['锦绣议论','锦绣记叙','锦绣游记','锦绣辞赋','锦绣词赋'] },
  { id:'wen-xue-gai-bian', block:'情欲工坊', icon:'🏺', label:'文学改编', desc:'童话神话名著', pg:'wen-xue-gai-bian', store:null, dirs:['历史改编','神话改编','名著改编','寓言改编','童话改编'] },
  { id:'dian-ping-shang-xi', block:'情欲工坊', icon:'🌟', label:'点评赏析', desc:'作品点评', pg:'dian-ping-shang-xi', store:null, dirs:['点评赏析'] },
  { id:'books', block:'情欲工坊', icon:'📚', label:'学术春宫', desc:'学术研究', pg:'books', store:null, dirs:['学术'] },
  { id:'newspaper', block:'情欲工坊', icon:'📰', label:'新闻媒体', desc:'媒体创作', pg:'newspaper', store:null, dirs:['新闻媒体'] },
  { id:'arts', block:'情欲工坊', icon:'🎨', label:'黄图淫册', desc:'视觉创作', pg:'arts', store:null, dirs:['黄图淫册'] },
  { id:'videos', block:'情欲工坊', icon:'🎬', label:'影视动画', desc:'影视剧本', pg:'videos', store:null, dirs:['影视动画'] },
  { id:'games', block:'情欲工坊', icon:'🎮', label:'黄游拔作', desc:'游戏剧本', pg:'games', store:null, dirs:['黄游拔作'] },
  // ---- 情色杂物 ----
  { id:'erotica-doc', block:'情色杂物', icon:'📦', label:'记录文书', desc:'契约·日志·台账', pg:'erotica-doc', store:'docContract', dirs:['情色杂物/记录文书/性奴契约','情色杂物/记录文书/调教计划','情色杂物/记录文书/调教日志','情色杂物/记录文书/性奴日志','情色杂物/记录文书/反差婊的自我养成','情色杂物/记录文书/伪娘的自我养成','情色杂物/记录文书/奖惩台账','情色杂物/记录文书/性癖档案','情色杂物/记录文书/绿奴契约','情色杂物/记录文书/淫妻契约','情色杂物/记录文书/宠物契约','情色杂物/记录文书/厕奴契约'] },
  { id:'erotica-life', block:'情色杂物', icon:'🛍', label:'生活消费', desc:'吃喝穿戴居家', pg:'erotica-life', store:'lifeFood', dirs:['情色杂物/生活消费/吃喝','情色杂物/生活消费/穿戴','情色杂物/生活消费/居家','情色杂物/生活消费/情趣','情色杂物/生活消费/玩乐'] },
  { id:'erotica-pub', block:'情色杂物', icon:'📢', label:'宣传发布', desc:'传单·广告·海报·邀约', pg:'erotica-pub', store:'flyer', dirs:['情色杂物/宣传发布/传单','情色杂物/宣传发布/广告','情色杂物/宣传发布/海报','情色杂物/宣传发布/邀请函'] },
  { id:'flash', block:'情色杂物', icon:'😄', label:'闲情小品', desc:'段子谜语俳句', pg:'flash', store:'comedy', dirs:['情色杂物/闲情小品/段子','情色杂物/闲情小品/谜语','情色杂物/闲情小品/歇后语','情色杂物/闲情小品/对联'] },
  // ---- 互动创作 ----
  { id:'interactive-novel', block:'互动创作', icon:'📖', label:'互动小说', desc:'分支剧情', pg:'interactive-novel', store:null, dirs:['互动小说'] },
  { id:'fetish-quiz', block:'互动创作', icon:'❓', label:'性癖问答', desc:'题库与考试', pg:'fetish-quiz', store:null, dirs:['性癖问答'] },
  { id:'char-chat', block:'互动创作', icon:'💬', label:'角色聊天', desc:'聊天模拟', pg:'char-chat', store:'charChat', dirs:['聊天模拟'] },
  { id:'life-observe', block:'互动创作', icon:'👁', label:'生活观赏', desc:'旁观角色互动', pg:'life-observe', store:'shenghuoGuanshang', dirs:['生活观赏'] },
  // ---- 声图创作 ----
  { id:'sheng-tu-ci-dian', block:'声图创作', icon:'📖', label:'生图词典', desc:'提示词库', pg:'sheng-tu-ci-dian', store:null, dirs:['生图词典'] },
  { id:'aids', block:'声图创作', icon:'🧰', label:'生图识图', desc:'文/图生图', pg:'aids', store:'aids', dirs:['生图识图'] },
  { id:'pei-yin-pei-yue', block:'声图创作', icon:'🎙', label:'配音配乐', desc:'语音合成', pg:'pei-yin-pei-yue', store:null },
  { id:'sheng-tu-cheng-guo', block:'声图创作', icon:'🖼', label:'生图成果', desc:'作品画廊', pg:'sheng-tu-cheng-guo', store:null, dirs:['生图成果'] },
  // ---- 创作辅助 ----
  { id:'character', block:'创作辅助', icon:'👤', label:'角色卡', desc:'角色档案', pg:'character', store:'character', dirs:['角色卡'] },
  { id:'today-char', block:'创作辅助', icon:'⭐', label:'今日角色', desc:'随机角色图 + 档案', pg:'character', store:null, dirs:['生图成果'] },
  { id:'world', block:'创作辅助', icon:'🌍', label:'世界观', desc:'世界设定', pg:'world', store:'world', dirs:['创作辅助/世界观'] },
  { id:'fap-reference', block:'创作辅助', icon:'🔥', label:'玩法参考', desc:'玩法库', pg:'fap-reference', store:'fapReference' },
  { id:'ref-doc', block:'创作辅助', icon:'📖', label:'文风分析', desc:'参考文档', pg:'ref-doc', store:null, dirs:['创作辅助/文风分析'] },
  { id:'inspiration', block:'创作辅助', icon:'💡', label:'灵感板', desc:'灵感火花', pg:'inspiration', store:'inspiration', dirs:['创作辅助/灵感板'] },
];

// ===== 区块元信息（用于区块总览小部件）=====
var HOME_WIDGET_BLOCKS = [
  { name:'情欲文学', icon:'📚' },
  { name:'情欲工坊', icon:'🔧' },
  { name:'情色杂物', icon:'📦' },
  { name:'互动创作', icon:'✨' },
  { name:'声图创作', icon:'🎨' },
  { name:'创作辅助', icon:'👤' },
];
var HOME_BLOCK_BY_NAME = {};
HOME_WIDGET_BLOCKS.forEach(function(b){ HOME_BLOCK_BY_NAME[b.name] = b; });

var HOME_WIDGET_BY_ID = {};
HOME_WIDGETS.forEach(function(w){ HOME_WIDGET_BY_ID[w.id] = w; });
// 区块总览小部件的 id：block-情欲文学
HOME_WIDGET_BLOCKS.forEach(function(b){
  HOME_WIDGET_BY_ID['block-' + b.name] = { id:'block-' + b.name, block:b.name, icon:b.icon, label:b.name + '·总览', desc:'区块汇总', pg:null, blockMeta:b, virtual:true };
});

// ===== 默认启用的小部件（首次进入时）=====
var HOME_WIDGET_DEFAULT = ['stats','today-char','character','sheng-tu-cheng-guo','novel','vignette','inspiration'];

// ===== 数据聚合：一次性提取所有小部件数据 → 快照 =====
var HOME_SNAPSHOT_PROMISE = null;
function 聚合首页数据() {
  if (HOME_SNAPSHOT_PROMISE) return HOME_SNAPSHOT_PROMISE;
  var jobs = [];
  var snapshot = {};
  HOME_WIDGETS.forEach(function(w) {
    // 这些模块由专门提取函数提供（内容结构特殊、信息更丰富）
    if (w.id === 'inspiration' || w.id === 'character' || w.id === 'sheng-tu-cheng-guo') return;
    jobs.push(提取小部件数据(w).then(function(d){ snapshot[w.id] = d; }));
  });
  // 统计/灵感/角色墙/生图成果快照由聚合层统一算出
  jobs.push(提取统计快照().then(function(d){ snapshot.stats = d; }));
  jobs.push(提取灵感快照().then(function(d){ snapshot.inspiration = d; }));
  jobs.push(提取角色卡快照().then(function(d){ snapshot.character = d; }));
  jobs.push(提取生图成果快照().then(function(d){ snapshot['sheng-tu-cheng-guo'] = d; }));
  jobs.push(提取今日角色快照().then(function(d){ snapshot['today-char'] = d; }));
  HOME_SNAPSHOT_PROMISE = Promise.all(jobs).then(function() {
    // 按区块汇总（区块总览小部件数据）
    HOME_WIDGET_BLOCKS.forEach(function(b) {
      var mods = HOME_WIDGETS.filter(function(w){ return w.block === b.name; });
      var total = 0;
      var rows = [];
      mods.forEach(function(w) {
        var d = snapshot[w.id] || { count: 0, latest: [] };
        total += (d.count || 0);
        rows.push({ id: w.id, icon: w.icon, label: w.label, count: d.count || 0 });
      });
      rows.sort(function(a,b){ return b.count - a.count; });
      snapshot['block-' + b.name] = { count: total, rows: rows, blockName: b.name, icon: b.icon };
    });
    window.HOME_SNAPSHOT = snapshot;
    return snapshot;
  });
  return HOME_SNAPSHOT_PROMISE;
}

// 角色卡大卡片快照：全量角色（名字/图标/性别/稀有度/称号）+ 分布统计
function 提取角色卡快照() {
  if (typeof LocalFS === 'undefined' || !LocalFS.列表) return Promise.resolve({ count: 0, list: [], byGender: {}, byRarity: {} });
  return LocalFS.列表('角色卡/').then(function(entries) {
    var dirs = (entries||[]).filter(function(e){ return e.isDir && e.name !== '小说提取'; });
    var jobs = dirs.map(function(e) {
      var name = e.name;
      var filesJob = LocalFS.列表('角色卡/' + name + '/');
      return filesJob.then(function(files) {
        var hasInfo = (files||[]).some(function(f){ return !f.isDir && f.name && f.name.indexOf('信息') >= 0; });
        var infoName = hasInfo ? (name + ' - 信息.json') : (name + ' - 概要.json');
        return LocalFS.读取JSON('角色卡/' + name + '/' + infoName).then(function(j){
          if (!j) return { name: name, icon: '👤', gender: '', rarity: '', title: '', hasInfo: hasInfo };
          var id = (j.identity || {}).basicInfo || {};
          return {
            name: id.name || name,
            icon: id.icon || '👤',
            gender: id.gender || '',
            rarity: id.rarity || '',
            title: id.title || '',
            price: id.price,
            hasInfo: hasInfo,
          };
        }).catch(function(){ return { name: name, icon: '👤', gender: '', rarity: '', title: '', hasInfo: hasInfo }; });
      }).catch(function(){ return { name: name, icon: '👤', gender: '', rarity: '', title: '' }; });
    });
    return Promise.all(jobs).then(function(list) {
      var byGender = {}, byRarity = {};
      list.forEach(function(c){
        if (c.gender) byGender[c.gender] = (byGender[c.gender]||0) + 1;
        if (c.rarity) byRarity[c.rarity] = (byRarity[c.rarity]||0) + 1;
      });
      return { count: list.length, list: list, byGender: byGender, byRarity: byRarity };
    });
  }).catch(function(){ return { count: 0, list: [], byGender: {}, byRarity: {} }; });
}

// 生图成果大卡片快照：成果 + 生图词典资源（参考图/选项方案/灵感角色）+ 识图缓存
function 提取生图成果快照() {
  var s = { count: 0, artWorks: [], dict: { refImgs: 0, options: 0, inspireChars: 0 }, aids: 0 };
  if (typeof LocalFS === 'undefined' || !LocalFS.列表) return Promise.resolve(s);
  var jobs = [];
  // 生图成果目录
  jobs.push(LocalFS.列表('生图成果/').then(function(cats){
    var catJobs = (cats||[]).filter(function(e){ return e.isDir; }).map(function(cat){
      return LocalFS.列表('生图成果/' + cat.name + '/').then(function(chars){
        var charJobs = (chars||[]).filter(function(e){ return e.isDir; }).map(function(ch){
          return LocalFS.读取JSON('生图成果/' + cat.name + '/' + ch.name + '/成果.json').then(function(res){
            var n = 0;
            if (res && res.cats) {
              Object.keys(res.cats).forEach(function(k){ n += (res.cats[k]||[]).length; });
            }
            if (n) { s.count += n; s.artWorks.push({ cat: cat.name, char: ch.name, count: n }); }
            return null;
          }).catch(function(){ return null; });
        });
        return Promise.all(charJobs);
      }).catch(function(){ return []; });
    });
    return Promise.all(catJobs);
  }).catch(function(){}));
  // 生图词典：参考图数量（词典目录内图片）
  jobs.push(LocalFS.列表('生图词典/词典/').then(function(files){
    s.dict.refImgs = (files||[]).filter(function(f){ return !f.isDir && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name||''); }).length;
    return null;
  }).catch(function(){}));
  // 生图词典：选项方案（每个角色一个 json）
  jobs.push(LocalFS.列表('生图词典/选项方案/').then(function(files){
    s.dict.options = (files||[]).filter(function(f){ return !f.isDir && f.name && f.name.endsWith('.json'); }).length;
    return null;
  }).catch(function(){}));
  // 角色卡 · 灵感角色库（每个角色一个子目录）
  jobs.push(LocalFS.列表('角色卡/灵感角色库/').then(function(files){
    s.dict.inspireChars = (files||[]).filter(function(f){ return f.isDir; }).length;
    return null;
  }).catch(function(){}));
  // 生图识图：文生图缓存计数
  jobs.push(LocalFS.列表('生图识图/文生图/').then(function(files){
    s.aids = (files||[]).filter(function(f){ return !f.isDir && f.name && f.name.endsWith('.json'); }).length;
    return null;
  }).catch(function(){}));
  return Promise.all(jobs).then(function(){ return s; });
}

// 今日角色快照：从生图成果中随机挑一位「已上传图片」的角色，取一张图 + 其档案
// 结构：{ name, gender, title, rarity, icon, img, charData（完整卡数据，供档案弹窗）, hasImage }
function 提取今日角色快照() {
  if (typeof LocalFS === 'undefined' || !LocalFS.列表 || !LocalFS.读取JSON || !LocalFS.readBase64) {
    return Promise.resolve({ empty: true });
  }
  return LocalFS.读取JSON('生图成果/.index.json').then(function(idx) {
    var entries = (idx && idx.entries) || {};
    var keys = Object.keys(entries);
    // 只保留 source='card'（正式角色卡，档案在角色库）且有 dir 的，逐个读成果判断是否有图
    var eligible = [];
    var jobs = keys
      .filter(function(k){ return entries[k] && entries[k].source === 'card' && entries[k].dir; })
      .map(function(k){
        var e = entries[k];
        return LocalFS.读取JSON('生图成果/' + (e.source === 'card' ? '角色卡' : '灵感角色') + '/' + e.dir + '/成果.json').then(function(res){
          var files = 收集生果图文件(res);
          if (files.length) eligible.push({ key: k, e: e, files: files });
          return null;
        }).catch(function(){ return null; });
      });
    return Promise.all(jobs).then(function(){
      if (!eligible.length) return { empty: true };
      // 纯随机挑一位角色
      var pick = eligible[Math.floor(Math.random() * eligible.length)];
      // 纯随机挑一张该角色的图
      var fname = pick.files[Math.floor(Math.random() * pick.files.length)];
      var sourceDir = pick.e.source === 'card' ? '角色卡' : '灵感角色';
      var imgPath = '生图成果/' + sourceDir + '/' + pick.e.dir + '/' + fname;
      return LocalFS.readBase64(imgPath).then(function(b64){
        var ext = (String(fname).split('.').pop() || 'png').toLowerCase();
        var mime = ext === 'jpg' ? 'jpeg' : ext;
        var img = b64 ? ('data:image/' + mime + ';base64,' + b64) : null;
        // 读档案：正式角色卡用 Store.character.get(名字)，灵感角色用 id 兜底
        return 加载今日角色档案(pick.e).then(function(charData){
          return {
            name: pick.e.name || pick.e.dir,
            img: img,
            charData: charData,
            empty: false,
          };
        });
      }).catch(function(){ return { empty: true }; });
    });
  }).catch(function(){ return { empty: true }; });
}

// 收集一份「成果.json」里所有有图的版本文件（遍历 cats→sub→groups→versions）
function 收集生果图文件(res) {
  var files = [];
  if (!res || !res.cats) return files;
  Object.keys(res.cats).forEach(function(catKey){
    (res.cats[catKey] || []).forEach(function(sb){
      (sb.groups || []).forEach(function(g){
        (g.versions || []).forEach(function(v){
          if (v && v.file) files.push(v.file);
          (v && v.variants || []).forEach(function(vr){ if (vr && vr.file) files.push(vr.file); });
        });
      });
    });
  });
  return files;
}

// 加载今日角色档案数据（正式角色卡直接读 Store.character；灵感角色按 id 推断）
function 加载今日角色档案(e) {
  if (e.source === 'card' && Store.character && typeof Store.character.get === 'function') {
    return Store.character.get(e.name).then(function(d){ return d || null; }).catch(function(){ return null; });
  }
  return Promise.resolve(null);
}

// 统计快照：角色/作品/灵感/用量（读 usage.json 与核心目录）
function 提取统计快照() {
  var p = {};
  var jobs = [];
  if (Store.character && typeof Store.character.list === 'function') {
    jobs.push(Store.character.list().then(function(items){ p.charCount = (items||[]).length; }));
  } else { p.charCount = 0; }
  jobs.push(安全计数('小说').then(function(n){ p.novelCount = n; }));
  jobs.push(安全计数('情色短章').then(function(n){ p.vignetteCount = n; }));
  jobs.push(Store.inspiration && typeof Store.inspiration.list === 'function'
    ? Store.inspiration.list().then(function(items){ p.inspCount = (items||[]).length; })
    : Promise.resolve().then(function(){ p.inspCount = 0; }));
  if (typeof LocalFS !== 'undefined' && LocalFS.读取JSON) {
    jobs.push(LocalFS.读取JSON('usage.json').then(function(u){
      u = u || [];
      p.totalTokens = u.reduce(function(s,x){ return s + (x.totalTokens||0); }, 0);
      p.totalCost = u.reduce(function(s,x){ return s + (x.estimatedCost||0); }, 0);
      p.totalRecords = u.length;
    }).catch(function(){ p.totalTokens=0; p.totalCost=0; p.totalRecords=0; }));
  } else { p.totalTokens=0; p.totalCost=0; p.totalRecords=0; }
  return Promise.all(jobs).then(function(){ return p; });
}

function 安全计数(dir) {
  if (typeof LocalFS === 'undefined' || !LocalFS.列表) return Promise.resolve(0);
  return LocalFS.列表(dir + '/').then(function(entries){
    if (!entries || !Array.isArray(entries)) return 0;
    return entries.filter(function(e){ return e.isDir; }).length;
  }).catch(function(){ return 0; });
}

// 灵感快照：从 Store.inspiration 读取（内容较特殊，单独处理）
function 提取灵感快照() {
  if (!Store.inspiration || typeof Store.inspiration.list !== 'function') return Promise.resolve({ count: 0, latest: [] });
  return Store.inspiration.list().then(function(items){
    items = items || [];
    var latest = items.slice(0, 6).map(function(j){
      return { title: (j && (j._title || j.title)) || '', time: (j && j.createdAt) || '' };
    }).filter(function(x){ return x.title; });
    latest.sort(function(a,b){ return (b.time||'').localeCompare(a.time||''); });
    return { count: items.length, latest: latest.slice(0,4) };
  }).catch(function(){ return { count: 0, latest: [] }; });
}

// 单个小部件数据：优先 Store.list()；无 store 或失败时按目录兜底
function 提取小部件数据(w) {
  var store = Store[w.store];
  if (store && typeof store.list === 'function') {
    return store.list().then(function(items) {
      items = items || [];
      return {
        count: items.length,
        latest: items.slice(0, 4).map(function(it) {
          return { title: it.title || it._dirName || '', time: it.updatedAt || it.createdAt || '' };
        }),
      };
    }).catch(function(){ return 目录兜底(w); });
  }
  return 目录兜底(w);
}

// 目录兜底：遍历 w.dirs 各目录，统计子目录数并尝试读信息文件标题
function 目录兜底(w) {
  if (!w.dirs || !w.dirs.length) return Promise.resolve({ count: 0, latest: [] });
  if (typeof LocalFS === 'undefined' || !LocalFS.列表) return Promise.resolve({ count: 0, latest: [] });
  var jobs = w.dirs.map(function(dir) {
    return LocalFS.列表(dir + '/').then(function(entries) {
      return (entries||[]).filter(function(e){ return e.isDir; }).map(function(e){
        return { dir: dir, name: e.name };
      });
    }).catch(function(){ return []; });
  });
  return Promise.all(jobs).then(function(allDirs) {
    var flat = [];
    allDirs.forEach(function(arr){ flat = flat.concat(arr); });
    var count = flat.length;
    // 尝试读前 4 个子目录的信息文件（{name} - 信息.json），失败则用目录名
    var readJobs = flat.slice(0, 4).map(function(e) {
      return LocalFS.读取JSON(e.dir + '/' + e.name + '/' + e.name + ' - 信息.json').then(function(j){
        if (j) return { title: j.title || j._dirName || e.name, time: j.updatedAt || j.createdAt || '' };
        return { title: e.name, time: '' };
      }).catch(function(){ return { title: e.name, time: '' }; });
    });
    return Promise.all(readJobs).then(function(latest){
      return { count: count, latest: latest };
    });
  });
}

window.HOME_WIDGETS = HOME_WIDGETS;
window.HOME_WIDGET_BY_ID = HOME_WIDGET_BY_ID;
window.HOME_WIDGET_DEFAULT = HOME_WIDGET_DEFAULT;
window.HOME_WIDGET_BLOCKS = HOME_WIDGET_BLOCKS;
window.HOME_BLOCK_BY_NAME = HOME_BLOCK_BY_NAME;
window.聚合首页数据 = 聚合首页数据;
