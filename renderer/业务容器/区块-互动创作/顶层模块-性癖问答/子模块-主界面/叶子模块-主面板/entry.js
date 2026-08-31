// 性癖问答 · 入口
var 问答导航=[{id:'chars',label:'👤 选择角色'},{id:'bank',label:'📚 题库'},{id:'exam',label:'🏛️ 考试'},{id:'quiz',label:'📋 问答'},{id:'results',label:'📊 历史记录'}];
var 问答当前视图='chars',问答角色=null,问答日志=[],问答当前索引=0,问答模式='user',问答题目集=null;
var 问答Api = null;
var 问答会话 = null; // 当前问答会话（实时保存到 Store.fetishQuiz）
var 问答默认题目=[];
var 考试模式='list',考试数据=null;
// 询问人身份设定（全局，性癖问答界面生效）：按情感梯度排序——陌生人到敌对
var 问答身份选项 = ['陌生人', '爱人', '恋人', '父亲', '儿子', '前任', '主人', '绿毛龟', '厌恶的人', '看不起的人', '考官'];
var 问答当前身份 = '陌生人';
// 身份含义 + 行为指引（合并为一个字典，避免拆分导致调用不一致；描述角色与用户的关系，无主语）
var 问答身份含义 = {
  '陌生人': '与角色毫无交集的陌生人，谈不上好感或恶感，客气疏离，点到为止。',
  '主人': '掌控、支配角色的主人，角色恭敬顺从、带着敬畏，一切归属于主人。',
  '爱人': '与角色真心相爱的人。角色在堕落、沉沦于肉欲之后，内心深深感到对不起对方，带着愧疚与自我厌恶，却又难以自拔。',
  '恋人': '与角色有恋人关系的人。角色已经背叛了对方，会刻意掩盖自己的出轨行为、假装什么都没发生，被抓包时也是遮掩辩解，不肯坦白。',
  '父亲': '角色的父亲，对角色有长辈的威严与管束。角色在父亲面前本能地收敛、不敢造次，与父亲交流私密话题时坐立不安、如芒在背，下意识地避重就轻。',
  '儿子': '角色的儿子。角色作为长辈，与儿子交流这种私密话题会觉得不成体统、面上挂不住，又想摆出长辈的样子，结果既尴尬又端着，话说到一半就说不下去。',
  '前任': '与角色相爱过、现已分手的人，早已没有当初的情分。聊到性爱话题会忍不住回忆起过往的性爱经历，还会和现任或后来的人比较性能力、性表现、身份，话里带刺。',
  '厌恶的人': '角色打心底厌恶、反感的人，态度冷淡、透着不耐烦，带着明显的对抗性——动不动就顶撞、嘲讽、回呛，故意对着干。',
  '看不起的人': '角色瞧不上眼、轻视的人，居高临下、轻蔑不屑，懒得认真对待。',
  '绿毛龟': '是角色的恋人，却早已被戴了绿帽。角色早不把对方放在眼里、满心瞧不起，会故意在对方面前描述自己被别人操的情形，反问"你看到了硬不硬"，欣赏对方的屈辱与无奈。',
  '考官': '角色面对如实作答的对象。角色会像做题一样认真、坦诚地回答每一个问题，不遮遮掩掩、不反讽绕弯、不作戏，有一说一，如实陈述自己的真实情况和想法。',
};

function 问答切换视图(view){
  问答当前视图=view;
  var el=document.getElementById('fetish-quizContent');if(!el)return;
  if(!问答Api){
    问答Api=渲染标签栏(el,问答导航,{active:view,subId:'fqViewContent',onSwitch:function(v){问答切换视图(v);}});
  }else{
    问答Api.setActive(view);
  }
  var vEl=问答Api.sub;
  // Load questions from bank when entering quiz view
  if(view==='quiz'||view==='bank'){
    Store.fetishBank.list().then(function(items){
      if(items&&items.length)问答默认题目=items;
    });
  }
  switch(view){
    case'chars':渲染问答角色(vEl);break;
    case'bank':渲染题库(vEl);break;
    case'exam':渲染问答考试(vEl);break;
    case'quiz':渲染问答问答(vEl);break;
    case'results':渲染问答结果(vEl);break;
  }
}

function 渲染问答角色(el){
  Store.character.list().then(function(items){
    // 性别 tab（照抄角色库 UI）：女性 / 男性 / 伪娘 / 扶她
    var 性别映射 = { '女性': '👩', '男性': '👨', '伪娘': '👘', '扶她': '⚧' };
    var h='<div class="n-card mb-12">';
    h+='<div class="fs-12 fw-600 c-fg mb-8">👤 选择角色</div>';
    h+='<div class="fs-10 c-fg3 mb-8">选一个角色，TA 会问你关于性癖的问题，并根据你的回答实时做出评价。</div>';
    h+='<div class="flex gap-6 mb-0">';
    // 默认选中第一个性别
    if(!问答角色性别) 问答角色性别 = Object.keys(性别映射)[0];
    Object.keys(性别映射).forEach(function(g){
      var sel = 问答角色性别===g;
      h+='<div class="char-cat-tab flex-1'+(sel?' act':'')+'" onclick="问答角色设性别(\''+g+'\')">';
      h+='<div class="char-cat-tab-icon">'+性别映射[g]+'</div><div class="char-cat-tab-label">'+g+'</div></div>';
    });
    h+='</div></div>';

    // 角色列表
    h+='<div class="n-card mb-12">';
    var filtered = (items||[]).filter(function(item){
      var g = item.identity && item.identity.basicInfo && item.identity.basicInfo.gender;
      return g === 问答角色性别;
    });
    if(!filtered.length){
      h+='<div class="fs-11 c-fg3 p-12-0 text-center">'+(items&&items.length?'该性别下暂无角色。':'暂无角色，请先创建角色卡')+'</div>';
    }else{
      h+='<table style="width:100%;border-collapse:collapse;font-size:11px">';
      h+='<thead><tr style="border-bottom:1px solid var(--border)">';
      h+='<th style="padding:6px 8px;text-align:left;color:var(--fg3);font-weight:600">角色</th>';
      h+='<th style="padding:6px 8px;text-align:left;color:var(--fg3);font-weight:600">头衔</th>';
      h+='<th style="padding:6px 8px;text-align:left;color:var(--fg3);font-weight:600">年龄</th>';
      h+='<th style="padding:6px 8px;text-align:left;color:var(--fg3);font-weight:600">品级</th>';
      h+='</tr></thead><tbody>';
      filtered.forEach(function(item){
        var bi = item.identity && item.identity.basicInfo || {};
        var safeTitle=(item.title||bi.title||'').replace(/'/g,"\\'");
        var name = bi.name || item.name || item.title || '未命名';
        var icon = bi.icon || '👤';
        var rarityColor = ({'金':'var(--accent2)','紫':'var(--accent)','蓝':'var(--fg2)','绿':'var(--success)','白':'var(--fg3)'})[bi.rarity] || 'var(--fg3)';
        h+='<tr style="border-bottom:1px solid var(--border);cursor:pointer" onclick="问答选择角色(\''+safeTitle+'\')">';
        h+='<td style="padding:8px"><div class="flex items-center gap-4"><span class="fs-16 flex-shrink-0">'+icon+'</span><span class="fw-700 c-fg">'+escHtml(name)+'</span></div></td>';
        h+='<td style="padding:8px;color:var(--fg2)">'+escHtml(bi.title||'')+'</td>';
        h+='<td style="padding:8px;color:var(--fg2)">'+escHtml(bi.age!=null?bi.age+'岁':'')+'</td>';
        h+='<td style="padding:8px">';
        if(bi.rarity) h+='<span class="fs-10 fw-700" style="color:'+rarityColor+';padding:1px 4px;border-radius:3px;border:1px solid '+rarityColor+'">'+bi.rarity+'</span>';
        h+='</td></tr>';
      });
      h+='</tbody></table>';
    }
    h+='</div>';
    el.innerHTML=h;
  });
}
// 性别 tab 状态（照抄角色库）
var 问答角色性别 = '';
window.问答角色设性别 = function(g){
  问答角色性别 = g;
  var el=document.getElementById('fqViewContent');
  if(el) 渲染问答角色(el);
};
function 问答选择角色(title){
  Store.character.get(title).then(function(data){
    if(!data)return;问答角色=data;问答角色.name=问答角色.name||问答角色.title||title;问答日志=[];问答当前索引=0;
    // 创建新会话（支持多条历史，不覆盖）
    问答会话 = { id:'quiz_' + Date.now() + '_' + Math.floor(Math.random()*1000), character: 问答角色.name, charData: JSON.parse(JSON.stringify(data)), log: 问答日志, date: new Date().toISOString() };
    问答切换视图('quiz');
  });
}
window.问答选择角色=问答选择角色;
window.fqSelectChar = window.问答选择角色;

// 历史记录页 tab 状态：'quiz'（问答记录）| 'exam'（成绩单）
var 问答历史Tab = 'quiz';

function 渲染问答结果(el){
  var h = '<div class="flex gap-2 mb-8">'
    + '<div class="sub-nav-item cur-ptr fs-12' + (问答历史Tab === 'quiz' ? ' act' : '') + '" onclick="问答历史切Tab(\'quiz\')">📋 问答记录</div>'
    + '<div class="sub-nav-item cur-ptr fs-12' + (问答历史Tab === 'exam' ? ' act' : '') + '" onclick="问答历史切Tab(\'exam\')">📝 成绩单</div>'
    + '</div><div id="quizHistoryBody"></div>';
  el.innerHTML = h;
  if(问答历史Tab === 'quiz'){ 渲染问答历史(el); }
  else { 渲染成绩单历史(el); }
}

window.问答历史切Tab = function(tab){
  问答历史Tab = tab;
  var el = document.getElementById('fqViewContent');
  if(el) 渲染问答结果(el);
};

// ===== 问答记录 tab：读 Store.fetishQuiz，按角色分组 =====
function 渲染问答历史(el){
  var body = document.getElementById('quizHistoryBody');
  if(!body) return;
  body.innerHTML = '<div class="fs-11 c-fg3 p-12-0 text-center">加载中...</div>';
  Store.fetishQuiz.list().then(function(items){
    if(!items || !items.length){ body.innerHTML = '<div class="fs-11 c-fg3 p-12-0 text-center">暂无问答记录。在「问答」页面与角色对话后，记录会自动保存。</div>'; return; }
    // 按角色分组
    var groups = {};
    items.forEach(function(it){
      var name = it.character || it.name || '未知';
      if(!groups[name]) groups[name] = [];
      groups[name].push(it);
    });
    var h = '';
    Object.keys(groups).forEach(function(name){
      var list = groups[name];
      h += '<div class="n-card mb-8 p-10">'
        + '<div class="fs-13 fw-600 c-fg mb-4">👤 ' + escHtml(name) + '（' + list.length + ' 次会话）</div>';
      list.forEach(function(session){
        var logLen = (session.log || []).length;
        h += '<div class="n-card cur-ptr p-8 mb-4" style="background:var(--bg2)" onclick="问答查看会话(\'' + escHtml(session.id || '') + '\')">'
          + '<div class="fs-12">' + escHtml(session.date || '') + ' · ' + logLen + ' 条对话</div>'
          + '<div class="fs-10 c-fg3 mt-2">点击查看会话详情</div></div>';
      });
      h += '</div>';
    });
    body.innerHTML = h;
  }).catch(function(){ body.innerHTML = '<div class="fs-11 c-fg3 p-12-0 text-center">读取失败</div>'; });
}

// 查看单个会话详情（按模式分两个区块：✋ 我来出题 / ✋ 我来回答）
window.问答查看会话 = function(id){
  Store.fetishQuiz.get(id).then(function(session){
    if(!session){ toast('未找到该会话'); return; }
    var body = document.getElementById('quizHistoryBody');
    if(!body) return;
    var log = session.log || [];
    var h = '<div class="flex justify-between items-center mb-8">'
      + '<span class="fs-13 fw-600">👤 ' + escHtml(session.character || '') + ' · 会话详情</span>'
      + '<button class="btn-secondary btn-sm" style="font-size:10px" onclick="问答历史切Tab(\'quiz\');渲染问答历史(document.getElementById(\'fqViewContent\'))">← 返回</button></div>';
    if(!log.length){ h += '<div class="fs-11 c-fg3 p-12-0 text-center">该会话暂无对话</div>'; body.innerHTML = h; return; }
    // 按模式分组：无 choice = 我来出题（用户问角色答）；有 choice = 我来回答（角色问用户选）
    var 出题组 = [], 回答组 = [];
    log.forEach(function(entry){
      if(entry.choice != null) 回答组.push(entry);
      else 出题组.push(entry);
    });
    // 区块1：✋ 我来出题（用户问角色答）
    if(出题组.length){
      h += '<div class="n-card mb-8 p-10"><div class="fs-13 fw-600 c-fg mb-6">✋ 我来出题（你问 · ' + escHtml(session.character || '') + ' 答）</div>';
      出题组.forEach(function(entry, i){
        h += '<div class="n-card p-8 mb-4" style="background:var(--bg2)">';
        h += '<div class="fs-13 fw-600 mb-4">' + (i+1) + '. ' + escHtml(entry.question || '') + '</div>';
        if(entry.answer){ h += '<div class="text-sm mt-2">✋ ' + escHtml(entry.answer) + '</div>'; }
        if(entry.reaction){ h += '<div class="text-sm mt-2" style="font-style:italic;color:var(--fg2)">⚡ 反应：' + escHtml(entry.reaction) + '</div>'; }
        if(entry.mind){ h += '<div class="text-sm mt-2" style="font-style:italic;color:var(--fg3)">💭 心理：' + escHtml(entry.mind) + '</div>'; }
        h += '</div>';
      });
      h += '</div>';
    }
    // 区块2：✋ 我来回答（角色问用户选）
    if(回答组.length){
      h += '<div class="n-card mb-8 p-10"><div class="fs-13 fw-600 c-fg mb-6">✋ 我来回答（' + escHtml(session.character || '') + ' 问 · 你答）</div>';
      回答组.forEach(function(entry, i){
        h += '<div class="n-card p-8 mb-4" style="background:var(--bg2)">';
        h += '<div class="fs-13 fw-600 mb-4">' + (i+1) + '. ' + escHtml(entry.question || '') + '</div>';
        if(entry.choice != null){
          h += '<div style="margin-left:12px;padding:4px 8px;background:var(--accent);color:#fff;border-radius:6px;font-size:12px;display:inline-block">' + escHtml(entry.choice) + '</div>';
        }
        if(entry.answer){ h += '<div class="text-sm mt-2">✋ ' + escHtml(entry.answer) + '</div>'; }
        if(entry.reaction){ h += '<div class="text-sm mt-2" style="font-style:italic;color:var(--fg2)">⚡ 反应：' + escHtml(entry.reaction) + '</div>'; }
        if(entry.mind){ h += '<div class="text-sm mt-2" style="font-style:italic;color:var(--fg3)">💭 心理：' + escHtml(entry.mind) + '</div>'; }
        h += '</div>';
      });
      h += '</div>';
    }
    body.innerHTML = h;
  });
};

// ===== 成绩单 tab：读 Store.examRoom =====
function 渲染成绩单历史(el){
  var body = document.getElementById('quizHistoryBody');
  if(!body) return;
  body.innerHTML = '<div class="fs-11 c-fg3 p-12-0 text-center">加载中...</div>';
  Store.examRoom.list().then(function(rooms){
    if(!rooms || !rooms.length){ body.innerHTML = '<div class="fs-11 c-fg3 p-12-0 text-center">暂无成绩单。完成一次考试后自动保存。</div>'; return; }
    var h = '';
    rooms.forEach(function(r){
      var tag = r.source === 'ai' ? 'AI出题' : '题库抽题';
      var tagColor = r.source === 'ai' ? 'var(--accent)' : 'var(--fg2)';
      h += '<div class="n-card flex justify-between items-center mb-4 p-8">'
        + '<div><span class="fs-13 fw-600">🏛️ ' + escHtml(r.name || '未命名') + '</span>'
        + ' <span class="fs-10" style="color:' + tagColor + '">' + tag + '</span>'
        + '<div class="fs-10 c-fg3">' + escHtml((r.created || '').slice(0,10)) + '</div></div>'
        + '<button class="btn btn-sm" style="font-size:10px" onclick="问答查看成绩(\'' + escHtml(r.id || '') + '\')">查看成绩</button>'
        + '</div>';
    });
    body.innerHTML = h;
  }).catch(function(){ body.innerHTML = '<div class="fs-11 c-fg3 p-12-0 text-center">读取失败</div>'; });
}

// 查看考试成绩（复用考试模块的成绩页）
window.问答查看成绩 = function(id){
  Store.examRoom.get(id).then(function(data){
    if(!data){ toast('未找到该成绩'); return; }
    if(typeof 考试数据 === 'undefined'){ toast('考试模块未加载'); return; }
    考试数据 = data;
    考试流程 = 'result';
    var el = document.getElementById('fqViewContent');
    if(el && typeof 渲染问答考试 === 'function') 渲染问答考试(el);
  });
};

Store.fetishQuiz=createStore('fetishQuiz');
Store.fetishBank=createStore('fetishBank');
Store.fetishPaper=createStore('fetishPaper');
Store.fetishExam=createStore('fetishExam');
Store.examRoom=createStore('examRoom');
registerPageRoute('fetish-quiz',function(){问答切换视图(问答当前视图);});
window.问答切换视图=问答切换视图;
window.fqSwitchView = window.问答切换视图;
