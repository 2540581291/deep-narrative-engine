// 性癖问答 · 问答
var 问答出题类型 = 'ai'; // 'ai'=AI自动出题 'bank'=从题库抽题

function 渲染问答问答(el){
  if(!问答角色){el.innerHTML='<div class="placeholder-text">请先选择角色</div>';return;}
  var h='<div style="display:flex;gap:2px;margin-bottom:8px">'
    +'<div class="sub-nav-item cur-ptr fs-12'+(问答模式==='user'?' act':'')+'" onclick="问答设置模式(\'user\')">✋ 我来出题</div>'
    +'<div class="sub-nav-item cur-ptr fs-12'+(问答模式==='ai'?' act':'')+'" onclick="问答设置模式(\'ai\')">✋ 我来回答</div></div>';
  h+='<div class="flex justify-between mb-8"><span class="fw-600">📋 性癖问答 · '+escHtml(问答角色.name)+'</span><span class="btn-secondary btn-sm" onclick="问答切换视图(\'chars\')">← 换人</span></div>';
  // 身份设定选择器
  h+='<div class="filter-row">'
    +'<span class="filter-label">身份</span>';
  问答身份选项.forEach(function(身份){
    var act = 问答当前身份===身份;
    h+='<span class="filter-chip'+(act?' act':'')+'" onclick="问答设置身份(\''+身份+'\')">'+身份+'</span>';
  });
  h+='</div>';
  h+='<div id="fqChatLog" style="border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:8px;background:var(--bg2);min-height:300px;max-height:420px;overflow-y:auto">';
  if(!问答日志.length){
    if(问答模式==='user'){
      h+='<div class="text-center py-40"><div style="font-size:24px;margin-bottom:8px">✋</div><div class="text-muted text-sm">向 '+escHtml(问答角色.name)+' 提问，TA 会以角色身份回答你</div></div>';
    }else{
      h+='<div class="text-center py-40"><div style="font-size:24px;margin-bottom:8px">💬</div><div class="text-muted text-sm">'+escHtml(问答角色.name)+' 开始问你问题了...</div></div>';
    }
  }else{
    问答日志.forEach(function(entry){
      if(entry.question&&entry.choice===undefined){
        h+='<div class="flex justify-end mb-4"><div style="max-width:75%;padding:8px 12px;border-radius:16px 16px 4px 16px;background:var(--accent);color:#fff;font-size:13px">❓ '+escHtml(entry.question)+'</div></div>';
        if(entry.answer){
          h+='<div style="display:flex;justify-content:flex-start;margin-bottom:6px"><div style="max-width:85%;padding:8px 12px;border-radius:16px 16px 16px 4px;background:var(--bg);font-size:13px">';
          h+='<div class="text-xs mb-2 opacity-7">'+escHtml(问答角色.name)+'</div>';
          // 语言回答
          h+='<div style="margin-bottom:6px">'+escHtml(entry.answer)+'</div>';
          // 角色反应
          if(entry.reaction){h+='<div style="font-size:12px;color:var(--accent2);margin-bottom:4px"><span class="opacity-7" style="color:var(--fg3)">⚡ 反应：</span>'+escHtml(entry.reaction)+'</div>';}
          // 角色心理
          if(entry.mind){h+='<div style="font-size:12px;font-style:italic;color:var(--fg2)"><span style="color:var(--fg3)">💭 心理：</span>'+escHtml(entry.mind)+'</div>';}
          h+='</div></div>';
        }
      }else if(entry.question){
        h+='<div style="display:flex;justify-content:flex-start;margin-bottom:6px"><div style="max-width:80%;padding:8px 12px;border-radius:16px 16px 16px 4px;background:var(--bg);font-size:13px"><div class="text-xs mb-2 opacity-7">'+escHtml(问答角色.name)+'</div>'+escHtml(entry.question)+'</div></div>';
        if(entry.choice){h+='<div class="flex justify-end mb-4"><div style="max-width:70%;padding:8px 12px;border-radius:16px 16px 4px 16px;background:var(--accent);color:#fff;font-size:13px">'+escHtml(entry.choice)+'</div></div>';}
        // 评价三部分：语言回应 + 反应 + 心理
        if(entry.answer||entry.reaction||entry.mind){
          h+='<div style="display:flex;justify-content:flex-start;margin-bottom:8px"><div style="max-width:85%;padding:8px 12px;border-radius:16px 16px 16px 4px;background:var(--accent-dim);font-size:13px">';
          if(entry.answer){h+='<div style="margin-bottom:6px">'+escHtml(entry.answer)+'</div>';}
          if(entry.reaction){h+='<div style="font-size:12px;color:var(--accent2);margin-bottom:4px"><span class="opacity-7" style="color:var(--fg3)">⚡ 反应：</span>'+escHtml(entry.reaction)+'</div>';}
          if(entry.mind){h+='<div style="font-size:12px;font-style:italic;color:var(--fg2)"><span style="color:var(--fg3)">💭 心理：</span>'+escHtml(entry.mind)+'</div>';}
          h+='</div></div>';
        }
      }
    });
  }
  h+='</div>';
  // 我来回答（ai）：出题后展示题目+选项供选择；未出题时与我来出题一致显示输入框
  if(问答模式==='ai'){
    // 两个入口按钮
    h+='<div style="display:flex;gap:8px;margin-bottom:8px">'
      +'<button class="btn bg-accent flex-1" style="font-size:12px" onclick="问答AI自动出题()"'+(问答正在出题?' disabled':'')+'>'+(问答正在出题?'⏳ 生成中...':'🤖 AI 自动出题')+'</button>'
      +'<button class="btn btn-secondary flex-1" style="font-size:12px" onclick="问答题库抽题()"'+(问答正在出题?' disabled':'')+'>📚 从题库随机抽题</button>'
      +'</div>';
    if(问答正在出题){
      h+='<div class="text-xs text-muted" style="text-align:center;padding:6px;margin-bottom:8px">⏳ 正在准备题目...</div>';
    }
    // 有题目时展示题目+选项
    var qs=问答题目集||问答默认题目;
    if(!问答正在出题&&问答当前索引<qs.length&&qs.length){
      var q=qs[问答当前索引];
      h+='<div class="n-card" style="padding:10px"><div style="font-weight:600;font-size:14px;margin-bottom:8px">'+escHtml(q.q)+'</div>';
      h+='<div style="display:flex;flex-wrap:wrap;gap:4px">';
      if(q.options&&q.options.length){
        q.options.forEach(function(opt,i){h+='<span class="tag-chip" onclick="问答选择('+i+')" style="cursor:pointer;font-size:13px;padding:6px 12px">'+escHtml(opt)+'</span>';});
      }
      h+='</div></div>';
    }
  }
  // 我来出题（user）：输入框
  if(问答模式==='user'){
    // 两个入口按钮
    h+='<div style="display:flex;gap:8px;margin-bottom:8px">'
      +'<button class="btn bg-accent flex-1" style="font-size:12px" onclick="问答用户AI出题()"'+(问答正在出题?' disabled':'')+'>'+(问答正在出题?'⏳ 生成中...':'🤖 AI 自动出题')+'</button>'
      +'<button class="btn btn-secondary flex-1" style="font-size:12px" onclick="问答用户题库抽题()"'+(问答正在出题?' disabled':'')+'>📚 从题库随机抽题</button>'
      +'</div>';
    if(问答正在出题){
      h+='<div class="text-xs text-muted" style="text-align:center;padding:6px;margin-bottom:8px">⏳ 正在准备题目...</div>';
    }
    h+='<div class="n-card p-8"><div class="fw-600 fs-13 mb-4">✋ 输入你的问题</div>'
      +'<div class="flex gap-4"><input class="llm-input flex-1 fs-13" id="fqUserQuestion" placeholder="想问'+escHtml(问答角色.name)+'什么？" onkeydown="if(event.key===\'Enter\'){event.preventDefault();问答自定义提问()}">'
      +'<button class="btn-sm bg-accent" onclick="问答自定义提问()">问TA</button></div></div>';
  }
  el.innerHTML=h;
  var chat=document.getElementById('fqChatLog');if(chat)chat.scrollTop=chat.scrollHeight;
}

var 问答正在出题 = false;

function 问答设置模式(mode){问答模式=mode;问答当前索引=0;问答题目集=null;问答正在出题=false;渲染问答问答(document.getElementById('fqViewContent'));}
window.问答设置模式=问答设置模式;
window.fqSetMode = window.问答设置模式;

// 切换询问人身份
window.问答设置身份 = function(身份){
  问答当前身份 = 身份;
  渲染问答问答(document.getElementById('fqViewContent'));
};
window.fqSetIdentity = window.问答设置身份;

// 身份注入文本：在提示词中注明当前询问人/被询问人的身份（含义 + 行为指引已合并进 问答身份含义）
function 问答身份提示(role){
  // role: 'asker' = 询问人（提问方） / 'answerer' = 被询问人（回答方）
  var 身份 = 问答当前身份 || '陌生人';
  var 含义 = (typeof 问答身份含义 !== 'undefined' && 问答身份含义[身份]) ? '（' + 问答身份含义[身份] + '）' : '';
  if(role === 'asker'){
    return '当前询问人身份：' + 身份 + 含义 + '。请以该身份作为提问方。';
  }
  return '当前被询问人身份：' + 身份 + 含义 + '。对方是提问方，你是被询问方。';
}

// 评价场景的身份模板：角色评价用户的选择（区别于回答场景，不用"被询问方"表述）
function 问答评价身份提示(){
  var 身份 = 问答当前身份 || '陌生人';
  var 含义 = (typeof 问答身份含义 !== 'undefined' && 问答身份含义[身份]) ? '（' + 问答身份含义[身份] + '）' : '';
  return '当前身份关系：对方是角色的' + 身份 + 含义 + '。这道问题是你（角色）问的，对方针对你的问题做出了这个选择和回复，你需要对这个选择与回复做出评价。';
}

// 出题场景的身份句：你是{角色名}，正在向一个人提问。对方是你的【身份】（含义）。
function 问答出题身份句(){
  var 身份 = 问答当前身份 || '陌生人';
  var 含义 = (typeof 问答身份含义 !== 'undefined' && 问答身份含义[身份]) ? '（' + 问答身份含义[身份] + '）' : '';
  return '你是' + (问答角色 ? 问答角色.name : '角色') + '，正在向一个人提问。对方是你的【' + 身份 + '】' + 含义 + '。';
}

// "我来出题"模式的出题身份句：你是【身份】，正在向{角色}提问（用户扮演身份，问角色）
function 问答用户出题身份句(){
  var 身份 = 问答当前身份 || '陌生人';
  var 含义 = (typeof 问答身份含义 !== 'undefined' && 问答身份含义[身份]) ? '（' + 问答身份含义[身份] + '）' : '';
  return '你是【' + 身份 + '】' + 含义 + '，正在向' + (问答角色 ? 问答角色.name : '角色') + '提问。';
}

// ===== AI 出题方向定义 =====
var 问答出题方向 = [
  { key: 'identity',  label: '🪪 角色身份',   desc: '关于身份、种族、年龄、称号、出身' },
  { key: 'history',   label: '📖 性爱历史',   desc: '关于过往的性经历、初次、时间线' },
  { key: 'preference',label: '💕 性偏好',     desc: '关于性癖、玩法、禁忌' },
  { key: 'appearance',label: '✨ 外貌身材',   desc: '关于长相、身材、衣着、气质' },
  { key: 'daily',     label: '🏠 日常生活',   desc: '关于日常习惯、作息、生活环境' },
  { key: 'personality',label: '🧠 性格心理',  desc: '关于性格、想法、情感、处事方式' },
];

// 存储当前出题方向
var 问答当前出题方向 = 'identity';

// ===== AI 自动出题：先弹方向选择，再按方向生成题目 =====
window.问答AI自动出题 = function(){
  if(!问答角色){toast('请先选择角色');return;}
  var h = '<div class="mcard" style="max-width:420px">'
    + '<h3 style="font-size:14px;margin-bottom:6px">🤖 AI 自动出题</h3>'
    + '<p style="font-size:11px;color:var(--fg2);margin-bottom:10px">选择出题方向，'+escHtml(问答角色.name)+' 会按该方向向你提问</p>'
    + '<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">';
  问答出题方向.forEach(function(dir){
    h += '<div class="n-card cur-ptr" style="padding:8px 12px;cursor:pointer" onclick="this.closest(\'.ovl\').remove();问答按方向出题(\''+dir.key+'\')">'
      + '<div style="font-weight:600;font-size:13px">'+dir.label+'</div>'
      + '<div style="font-size:11px;color:var(--fg2);margin-top:2px">'+dir.desc+'</div></div>';
  });
  h += '</div><button class="btn-out" style="font-size:11px" onclick="this.closest(\'.ovl\').remove()">取消</button></div>';
  var ov = document.createElement('div');
  ov.className = 'ovl'; ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
};
window.fqAiQuestion = window.问答AI自动出题;

// 按指定方向生成题目（AI 出题模式）
window.问答按方向出题 = function(dirKey){
  if(!问答角色){toast('请先选择角色');return;}
  if(问答正在出题)return;
  问答当前出题方向 = dirKey;
  问答正在出题=true;问答题目集=null;问答当前索引=0;
  渲染问答问答(document.getElementById('fqViewContent'));
  // 找到方向描述
  var dirDesc = '';
  问答出题方向.forEach(function(d){ if(d.key===dirKey) dirDesc = d.label + '：' + d.desc; });
  var charDesc = (typeof window.角色卡全部 === 'function')
    ? window.角色卡全部(问答角色)
    : (问答角色.name || '角色');
  LLM.callJSON({
    label:'AI自动出题',
    system:'你是角色'+escHtml(问答角色.name)+'。\n\n【角色设定】\n' + charDesc,
    prompt:'你是一个性癖问答出题专家。请根据以上角色设定出一道贴合角色身份的性癖调查问题，并给出4-6个选项。只输出JSON，不要其他文字。\n'+问答出题身份句()+'\n【出题方向】'+dirDesc+'\n要求：问题中应当直接体现角色的信息——把角色设定里的关键点（身份、称号、经历、特长等）化用进问题，不要原样照抄设定原文；让问题明显是这个角色在问，而不是泛泛而问。同时问题中要包含身份信息——把当前的身份关系（'+问答当前身份+'）也化用进问题，自然地体现，不要直接照抄"前任""主人"这类标签词。\n输出JSON格式：{"q":"问题文本","options":["选项1","选项2","选项3","选项4","选项5"]}'
  }).then(function(d){
    问答正在出题=false;
    if(!d||!d.q){toast('AI 出题失败');渲染问答问答(document.getElementById('fqViewContent'));return;}
    问答题目集=[{q:d.q,options:d.options||[],type:'ai',detail:''}];
    问答当前索引=0;
    渲染问答问答(document.getElementById('fqViewContent'));
    toast('🤖 '+escHtml(问答角色.name)+' 出了一道题');
  }).catch(function(err){
    问答正在出题=false;
    toast('AI 出题失败: '+err.message);
    渲染问答问答(document.getElementById('fqViewContent'));
  });
};
window.fqAiQuestionDir = window.问答按方向出题;

// ===== 从题库随机抽题 =====
window.问答题库抽题 = function(){
  if(!问答角色){toast('请先选择角色');return;}
  if(问答正在出题)return;
  问答正在出题=true;问答题目集=null;问答当前索引=0;
  渲染问答问答(document.getElementById('fqViewContent'));
  var pool = (typeof 题库内容数据!=='undefined') ? 题库全部题目() : [];
  // 兜底：从 fetishBank 加载
  if(!pool.length){
    Store.fetishBank.list().then(function(items){
      if(!items||!items.length){问答正在出题=false;toast('题库为空，请先在题库添加题目');渲染问答问答(document.getElementById('fqViewContent'));return;}
      var it=items[Math.floor(Math.random()*items.length)];
      问答出题类型='bank';
      问答题目集=[{q:it.q||it.text||'',options:it.options||[],type:'normal',detail:''}];
      问答当前索引=0;
      问答正在出题=false;
      渲染问答问答(document.getElementById('fqViewContent'));
    }).catch(function(){问答正在出题=false;toast('题库读取失败');渲染问答问答(document.getElementById('fqViewContent'));});
    return;
  }
  var it=pool[Math.floor(Math.random()*pool.length)];
  问答出题类型='bank';
  问答题目集=[{q:it.q||'',options:it.options||[],type:it.type||'normal',detail:it.detail||''}];
  问答当前索引=0;
  问答正在出题=false;
  渲染问答问答(document.getElementById('fqViewContent'));
};
window.fqBankQuestion = window.问答题库抽题;

// ===== "我来出题"模式的 AI 自动出题：先弹方向选择，再按方向生成题目并自动发送给角色回答 =====
window.问答用户AI出题 = function(){
  if(!问答角色){toast('请先选择角色');return;}
  var h = '<div class="mcard" style="max-width:420px">'
    + '<h3 style="font-size:14px;margin-bottom:6px">🤖 AI 自动出题</h3>'
    + '<p style="font-size:11px;color:var(--fg2);margin-bottom:10px">选择出题方向，生成题目后自动向 '+escHtml(问答角色.name)+' 提问</p>'
    + '<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">';
  问答出题方向.forEach(function(dir){
    h += '<div class="n-card cur-ptr" style="padding:8px 12px;cursor:pointer" onclick="this.closest(\'.ovl\').remove();问答用户按方向出题(\''+dir.key+'\')">'
      + '<div style="font-weight:600;font-size:13px">'+dir.label+'</div>'
      + '<div style="font-size:11px;color:var(--fg2);margin-top:2px">'+dir.desc+'</div></div>';
  });
  h += '</div><button class="btn-out" style="font-size:11px" onclick="this.closest(\'.ovl\').remove()">取消</button></div>';
  var ov = document.createElement('div');
  ov.className = 'ovl'; ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
};
window.fqUserAiQuestion = window.问答用户AI出题;

// 按指定方向生成题目并自动发送给角色回答（"我来出题"模式）
window.问答用户按方向出题 = function(dirKey){
  if(!问答角色){toast('请先选择角色');return;}
  if(问答正在出题)return;
  问答当前出题方向 = dirKey;
  问答正在出题=true;
  渲染问答问答(document.getElementById('fqViewContent'));
  var dirDesc = '';
  问答出题方向.forEach(function(d){ if(d.key===dirKey) dirDesc = d.label + '：' + d.desc; });
  var charDesc = (typeof window.角色卡全部 === 'function')
    ? window.角色卡全部(问答角色)
    : (问答角色.name || '角色');
  LLM.callJSON({
    label:'AI自动出题',
    system:'你是一个性癖问答出题助手，正在帮用户构思要问【'+escHtml(问答角色.name)+'】的问题。用户扮演的身份是【'+(问答当前身份||'陌生人')+'】。以下是'+escHtml(问答角色.name)+'的角色设定，作为出题的参考。\n\n【'+escHtml(问答角色.name)+'角色设定】\n' + charDesc,
    prompt:'你是一个性癖问答出题专家。请根据以上角色设定出一道贴合角色身份的性癖调查问题，并给出4-6个选项。只输出JSON，不要其他文字。\n'+问答用户出题身份句()+'\n【出题方向】'+dirDesc+'\n要求：问题中应当直接体现角色的信息——把角色设定里的关键点（身份、称号、经历、特长等）化用进问题，不要原样照抄设定原文；让问题明显是在问这个角色，而不是泛泛而问。同时问题中要包含身份信息——把当前的身份关系（'+问答当前身份+'）也化用进问题，自然地体现，不要直接照抄"前任""主人"这类标签词。\n输出JSON格式：{"q":"问题文本","options":["选项1","选项2","选项3","选项4","选项5"]}'
  }).then(function(d){
    问答正在出题=false;
    if(!d||!d.q){toast('AI 出题失败');渲染问答问答(document.getElementById('fqViewContent'));return;}
    // 自动发送给角色回答
    问答发送问题(d.q);
    toast('🤖 '+escHtml(问答角色.name)+' 出了一道题');
  }).catch(function(err){
    问答正在出题=false;
    toast('AI 出题失败: '+err.message);
    渲染问答问答(document.getElementById('fqViewContent'));
  });
};
window.fqUserAiQuestionDir = window.问答用户按方向出题;

// ===== "我来出题"模式的从题库抽题：抽题后自动发送给角色回答 =====
window.问答用户题库抽题 = function(){
  if(!问答角色){toast('请先选择角色');return;}
  if(问答正在出题)return;
  问答正在出题=true;
  渲染问答问答(document.getElementById('fqViewContent'));
  var pool = (typeof 题库内容数据!=='undefined') ? 题库全部题目() : [];
  if(!pool.length){
    Store.fetishBank.list().then(function(items){
      if(!items||!items.length){问答正在出题=false;toast('题库为空，请先在题库添加题目');渲染问答问答(document.getElementById('fqViewContent'));return;}
      var it=items[Math.floor(Math.random()*items.length)];
      问答正在出题=false;
      问答发送问题(it.q||it.text||'');
      if(it.q||it.text)toast('📚 已从题库抽题');
    }).catch(function(){问答正在出题=false;toast('题库读取失败');渲染问答问答(document.getElementById('fqViewContent'));});
    return;
  }
  var it=pool[Math.floor(Math.random()*pool.length)];
  问答正在出题=false;
  问答发送问题(it.q||'');
  if(it.q)toast('📚 已从题库抽题');
};
window.fqUserBankQuestion = window.问答用户题库抽题;

// 收集题库内容数据全部题目
function 题库全部题目(){
  var out=[];
  if(typeof 题库内容数据==='undefined')return out;
  Object.keys(题库内容数据).forEach(function(ma){
    Object.keys(题库内容数据[ma].mids||{}).forEach(function(mi){
      Object.keys(题库内容数据[ma].mids[mi].items||{}).forEach(function(it){
        (题库内容数据[ma].mids[mi].items[it].questions||[]).forEach(function(q){out.push(q);});
      });
    });
  });
  return out;
}

function 问答选择(optIdx){
  var qs=问答题目集||问答默认题目;
  if(问答当前索引>=qs.length)return;
  var q=qs[问答当前索引];var choice=q.options[optIdx]||'未选择';
  var entry={question:q.q,choice:choice,answer:'',reaction:'',mind:''};
  // Get AI reaction（三部分：语言回应 + 身体反应 + 内心想法）
  if(问答角色){
    var 角色设定 = (typeof window.角色卡全部 === 'function') ? window.角色卡全部(问答角色) : JSON.stringify(问答角色||{});
    LLM.callJSON({system:'你是角色'+escHtml(问答角色.name)+'。\n\n【角色设定】\n' + 角色设定, prompt:'请以该角色的身份评价用户的这个选择。评价分三部分：\n1. reply：语言回应（直接说出口的话，对用户的选择表态，可以反讽、敷衍，但不能答非所问）\n2. reaction：身体反应（直接写身体动作、表情、神态等非语言表现，不要写"听到这个问题后"之类的引导语）\n3. mind：内心想法（直接写内心真实想法，不要写"心里想..."。可以与说的不一致）\n'+问答评价身份提示()+'\n只输出JSON，不要其他文字。\n问题：'+q.q+'\n用户选择：'+choice+'\n输出JSON格式：{"reply":"语言回应","reaction":"身体反应","mind":"内心想法"}',label:'问答反应'}).then(function(d){
      if(d&&d.reply)entry.answer=d.reply;
      if(d&&d.reaction)entry.reaction=d.reaction;
      if(d&&d.mind)entry.mind=d.mind;
      问答日志.push(entry);
      问答当前索引++;
      问答保存会话();
      渲染问答问答(document.getElementById('fqViewContent'));
    }).catch(function(){
      问答日志.push(entry);
      问答当前索引++;
      问答保存会话();
      渲染问答问答(document.getElementById('fqViewContent'));
    });
  }else{
    问答日志.push(entry);
    问答当前索引++;
    问答保存会话();
    渲染问答问答(document.getElementById('fqViewContent'));
  }
}
window.问答选择=问答选择;
window.fqChoose = window.问答选择;

function 问答自定义提问(){
  var inp=document.getElementById('fqUserQuestion');if(!inp||!inp.value.trim())return;
  var text=inp.value.trim();inp.value='';
  问答发送问题(text);
}
window.问答自定义提问=问答自定义提问;
window.fqAskCustom = window.问答自定义提问;

// 通用发送：把一条问题发给角色 AI，以角色身份回答（"我来出题"模式核心）
// 角色回答分三部分：语言回答(reply) + 角色反应(reaction) + 角色心理(mind)
function 问答发送问题(text){
  if(!text)return;
  var entry={question:text,answer:'',reaction:'',mind:'',comment:'',commentReaction:''};
  if(问答角色){
    var 角色设定 = (typeof window.角色卡全部 === 'function') ? window.角色卡全部(问答角色) : JSON.stringify(问答角色||{});
    LLM.callJSON({system:'你是角色'+escHtml(问答角色.name)+'。\n\n【角色设定】\n' + 角色设定, prompt:'请以该角色的身份用第一人称回答用户的问题。\n'+问答身份提示('answerer')+'\n回答分三部分：\n1. reply：语言回答（以回答问题为核心，正面回应提问者的问题本身；可以反讽、敷衍，但不能答非所问或自说自话）\n2. reaction：角色反应（直接写身体动作、表情、神态等非语言表现，不要写"听到这个问题后"之类的引导语）\n3. mind：角色心理（直接写内心想法本身，不要写"心里想..."。注意：心理可以想到过去发生的某件事，也可以在心里嘲讽、辱骂提问者，不必与嘴上说的话一致）\n只输出JSON，不要其他文字。\n用户问：'+text+'\n输出JSON格式：{"reply":"语言回答","reaction":"角色反应","mind":"角色心理"}',label:'问答自定义'}).then(function(d){
      if(d&&d.reply)entry.answer=d.reply;
      if(d&&d.reaction)entry.reaction=d.reaction;
      if(d&&d.mind)entry.mind=d.mind;
      问答日志.push(entry);
      问答保存会话();
      渲染问答问答(document.getElementById('fqViewContent'));
    }).catch(function(){
      问答日志.push(entry);
      问答保存会话();
      渲染问答问答(document.getElementById('fqViewContent'));
    });
  }else{
    问答日志.push(entry);
    问答保存会话();
    渲染问答问答(document.getElementById('fqViewContent'));
  }
}
window.问答发送问题=问答发送问题;
window.fqSend = window.问答发送问题;

// 实时保存当前会话到 Store.fetishQuiz（key=会话id，不覆盖）
function 问答保存会话(){
  if(!问答会话) return;
  问答会话.log = 问答日志;
  问答会话.date = new Date().toISOString();
  Store.fetishQuiz.save(问答会话.id, 问答会话).catch(function(){});
}
window.问答保存会话 = 问答保存会话;
function 问答保存结果(){
  var name=问答角色?.name||'未知';
  Store.fetishQuiz.save(name+'性癖问答',{title:name+'性癖问答',character:name,log:问答日志,date:new Date().toISOString()}).then(function(){toast('结果已保存');});
}
window.问答保存结果=问答保存结果;
