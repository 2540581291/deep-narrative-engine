// 性癖问答 · 考场（文件2/3：选题目 + 作答 + 考官互评主控）
// 依赖：Store.examRoom / Store.character / LLM / 标签层级数据 / 题库内容数据 / 问答出题方向 / 问答身份提示

// ===== Step2：选题目（来源切换 + 题量 + 筛选 + 预览） =====
function 考试选题目页(el){
  var h = '<div class="n-card" style="max-width:760px;margin:0 auto;padding:20px">'
    + '<h3 style="font-size:15px;margin-bottom:8px">🏛️ 选题目 · ' + escHtml(考试草稿.name) + '</h3>';
  // 来源切换
  h += '<div class="filter-row">'
    + '<span class="filter-chip' + (考试草稿.source === 'bank' ? ' act' : '') + '" onclick="考试设来源(\'bank\')">📚 内置题库抽题</span>'
    + '<span class="filter-chip' + (考试草稿.source === 'ai' ? ' act' : '') + '" onclick="考试设来源(\'ai\')">🤖 AI 按角色出题</span>'
    + '</div>';
  // 题量
  h += '<div class="filter-row"><span class="filter-label">题量</span>';
  [3,5,10].forEach(function(n){
    var sel = 考试草稿.count === n;
    h += '<span class="filter-chip' + (sel ? ' act' : '') + '" onclick="考试设题量(' + n + ')">' + n + ' 题</span>';
  });
  h += '</div>';
  h += '<div id="examQuestionBody"></div>';
  h += '<div style="display:flex;gap:6px;margin-top:14px">'
    + '<button class="btn w-100" onclick="考试开始()">🚀 开始考试</button>'
    + '<button class="btn-secondary btn-sm" onclick="问答考试创建()">← 返回</button></div>'
    + '</div>';
  el.innerHTML = h;
  考试选题目主体();
}

window.考试设来源 = function(src){
  考试草稿.source = src;
  考试草稿.questions = [];
  var el = 考试容器 || document.getElementById('fqViewContent');
  if(el) 渲染问答考试(el);
};
window.考试设题量 = function(n){
  考试草稿.count = n;
  考试草稿.questions = [];
  var el = 考试容器 || document.getElementById('fqViewContent');
  if(el) 渲染问答考试(el);
};

function 考试选题目主体(){
  var body = document.getElementById('examQuestionBody');
  if(!body) return;
  if(考试草稿.source === 'bank'){ 考试题库主体(body); }
  else { 考试AI主体(body); }
}

// --- 题库抽题主体 ---
function 考试题库主体(body){
  var h = '';
  // 四级标签筛选（本地 考试筛选，复用 标签层级数据）
  var 标签 = (typeof 标签层级数据 !== 'undefined') ? 标签层级数据 : {};
  h += 考试筛选行('大类', Object.keys(标签), 考试筛选.major, '考试设筛选', 'major');
  if(考试筛选.major){
    var md = (标签[考试筛选.major] || {}).mids || {};
    h += 考试筛选行('中类', Object.keys(md), 考试筛选.mid, '考试设筛选', 'mid');
    if(考试筛选.mid){
      var midv = md[考试筛选.mid] || {};
      var items = midv.items || {};
      h += 考试筛选行('小类', Object.keys(items), 考试筛选.item, '考试设筛选', 'item');
      if(考试筛选.item){
        var itv = items[考试筛选.item] || {};
        h += 考试筛选行('细类', itv.tags || [], 考试筛选.tag, '考试设筛选', 'tag');
      }
    }
  }
  var 可选数 = 考试题库收集().length;
  h += '<div class="fs-10 c-fg3 mb-8">当前筛选范围内共 ' + 可选数 + ' 题</div>';
  h += '<button class="btn btn-sm mb-8" onclick="考试随机抽题()">🔄 随机抽题</button>';
  // 预览题目
  h += '<div id="examQuestionPreview" class="mt-8"></div>';
  body.innerHTML = h;
  考试预览渲染();
}

function 考试筛选行(level, keys, cur, fn, key){
  var h = '<div class="filter-row"><span class="filter-label">' + level + '</span>';
  h += '<span class="filter-chip' + (!cur ? ' act' : '') + '" onclick="' + fn + '(\'' + key + '\',\'\')">全部</span>';
  keys.forEach(function(k){
    var sel = cur === k;
    h += '<span class="filter-chip' + (sel ? ' act' : '') + '" onclick="' + fn + '(\'' + key + '\',\'' + escHtml(k) + '\')">' + escHtml(k) + '</span>';
  });
  h += '</div>';
  return h;
}

window.考试设筛选 = function(key, val){
  考试筛选[key] = val;
  if(key === 'major'){ 考试筛选.mid=''; 考试筛选.item=''; 考试筛选.tag=''; }
  if(key === 'mid'){ 考试筛选.item=''; 考试筛选.tag=''; }
  if(key === 'item'){ 考试筛选.tag=''; }
  考试草稿.questions = [];
  var el = 考试容器 || document.getElementById('fqViewContent');
  if(el) 渲染问答考试(el);
};

// 按本地筛选从题库内容数据收集题目
function 考试题库收集(){
  var out = [];
  if(typeof 题库内容数据 === 'undefined') return out;
  var majors = 考试筛选.major ? [考试筛选.major] : Object.keys(题库内容数据);
  majors.forEach(function(ma){
    var md = 题库内容数据[ma] || {};
    var mids = 考试筛选.mid ? [考试筛选.mid] : Object.keys(md.mids || {});
    mids.forEach(function(mi){
      var midv = (md.mids || {})[mi] || {};
      var items = 考试筛选.item ? [考试筛选.item] : Object.keys(midv.items || {});
      items.forEach(function(it){
        var itv = (midv.items || {})[it] || {};
        (itv.questions || []).forEach(function(q){
          if(!考试筛选.tag || q.detail === 考试筛选.tag) out.push({ q: q.q, options: q.options || [], type: q.type || 'normal', detail: q.detail || '', from: 'bank' });
        });
      });
    });
  });
  return out;
}

// 洗牌 + 随机取题
window.考试随机抽题 = function(){
  var pool = 考试题库收集();
  if(!pool.length){ toast('当前筛选范围内没有题目'); return; }
  var arr = pool.slice();
  for(var i = arr.length - 1; i > 0; i--){
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  考试草稿.questions = arr.slice(0, Math.min(考试草稿.count, arr.length));
  if(考试草稿.questions.length < 考试草稿.count) toast('可用题目不足，已取 ' + 考试草稿.questions.length + ' 题');
  考试预览渲染();
};

function 考试预览渲染(){
  var el = document.getElementById('examQuestionPreview');
  if(!el) return;
  if(!考试草稿.questions.length){ el.innerHTML = ''; return; }
  var h = '<div class="fs-12 fw-600 c-fg mb-6">已选 ' + 考试草稿.questions.length + ' 题</div>';
  考试草稿.questions.forEach(function(q, i){
    h += '<div class="n-card p-8 mb-4" style="background:var(--bg2)">'
      + '<div class="flex justify-between"><span class="fs-13 fw-600">' + (i + 1) + '. ' + escHtml(q.q) + '</span>'
      + '<span class="fs-9" style="color:' + (q.type === 'erotic' ? 'var(--accent)' : 'var(--fg3)') + '">' + (q.type === 'erotic' ? '色情' : '正常') + '</span></div>'
      + (q.options && q.options.length ? '<div class="fs-10 c-fg3 mt-2">选项：' + q.options.map(function(o){ return escHtml(o); }).join(' / ') + '</div>' : '')
      + '</div>';
  });
  el.innerHTML = h;
}

// --- AI 出题主体 ---
function 考试AI主体(body){
  var h = '';
  // 出题方向（复用 问答出题方向）
  var dirs = (typeof 问答出题方向 !== 'undefined') ? 问答出题方向 : [];
  h += '<div class="filter-row"><span class="filter-label">出题方向</span>';
  dirs.forEach(function(d){
    var sel = 考试草稿.direction === d.key;
    h += '<span class="filter-chip' + (sel ? ' act' : '') + '" onclick="考试设方向(\'' + d.key + '\')">' + d.label + '</span>';
  });
  h += '</div>';
  h += '<div class="fs-10 c-fg3 mb-8">将以考生「' + escHtml(考试草稿.students[0] || '') + '」的角色设定出题，问题融入角色信息。</div>';
  h += '<button class="btn btn-sm mb-8" onclick="考试AI出题()">✨ 生成题目</button>';
  h += '<div id="examQuestionPreview" class="mt-8"></div>';
  body.innerHTML = h;
  考试预览渲染();
}

window.考试设方向 = function(d){
  考试草稿.direction = d;
  考试草稿.questions = [];
  var el = 考试容器 || document.getElementById('fqViewContent');
  if(el) 渲染问答考试(el);
};

// AI 生成题目（以第一个考生角色）
window.考试AI出题 = function(){
  if(!考试草稿.students.length){ toast('请先选择考生'); return; }
  var btn = document.getElementById('examQuestionPreview');
  if(btn) btn.innerHTML = '<div class="fs-11 c-fg3 p-12-0 text-center">⏳ AI 生成题目中...</div>';
  Store.character.get(考试草稿.students[0]).then(function(考生卡){
    var dirDesc = '';
    (typeof 问答出题方向 !== 'undefined' ? 问答出题方向 : []).forEach(function(d){ if(d.key === 考试草稿.direction) dirDesc = d.label + '：' + d.desc; });
    var charDesc = 考试角色卡(考生卡 || {});
    var name = (考生卡 && 考生卡.identity && 考生卡.identity.basicInfo && 考生卡.identity.basicInfo.name) || 考试草稿.students[0];
    LLM.callJSON({
      label: '考场AI出题',
      system: '你是角色' + name + '。\n\n【角色设定】\n' + charDesc,
      prompt: '你是一个性癖问答出题专家。请根据角色设定生成 ' + 考试草稿.count + ' 道贴合角色的性癖调查题，每题给出4-6个选项。只输出JSON。\n【出题方向】' + dirDesc + '\n要求：问题中应化用角色的信息（身份、称号、经历等），不要直接照抄设定原文。\n输出JSON格式：{"questions":[{"q":"问题","options":["A","B","C","D"]}]}'
    }).then(function(d){
      if(!d || !d.questions || !d.questions.length){ toast('AI 出题失败'); return; }
      考试草稿.questions = d.questions.map(function(q){ return { q: q.q, options: q.options || [], type: 'normal', detail: '', from: 'ai', direction: 考试草稿.direction }; });
      考试预览渲染();
      toast('已生成 ' + 考试草稿.questions.length + ' 题');
    }).catch(function(err){ toast('AI 出题失败: ' + err.message); 考试预览渲染(); });
  });
};

// ===== Step3/4：作答与互评 =====
function 考试开始(){
  if(!考试草稿.questions.length){ toast('请先选择或生成题目'); return; }
  // 组装考场数据
  var students = 考试草稿.students.map(function(t, i){ return { key: 's' + i, title: t, name: t, role: 'student' }; });
  var judges = 考试草稿.judges.map(function(t, i){ return { key: 'j' + i, title: t, name: t, role: 'judge' }; });
  考试数据 = {
    id: 'exam_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    name: 考试草稿.name,
    status: 'answering',
    source: 考试草稿.source,
    count: 考试草稿.count,
    bankFilter: JSON.parse(JSON.stringify(考试筛选)),
    direction: 考试草稿.direction,
    players: students.concat(judges),
    questions: 考试草稿.questions.map(function(q, i){ return { id: 'q' + i, q: q.q, options: q.options, type: q.type, detail: q.detail, from: q.from, direction: q.direction }; }),
    answers: {},
    reviews: {},
    scores: {},
    created: new Date().toISOString()
  };
  考试数据.players.forEach(function(p){ if(p.role === 'student') 考试数据.answers[p.key] = {}; });
  考试数据.players.forEach(function(p){ if(p.role === 'judge') 考试数据.reviews[p.key] = {}; });
  考试流程 = 'answering';
  var el = 考试容器 || document.getElementById('fqViewContent');
  if(el) 渲染问答考试(el);
  // 开始作答
  Store.character.get(考试草稿.students[0]).then(function(){
    考试作答();
  });
}
window.考试开始 = 考试开始;

// 作答主控：逐题处理，每道题的所有考生并发作答（有几个考生就同步调用几个）
function 考试作答(){
  var students = 考试数据.players.filter(function(p){ return p.role === 'student'; });
  var total = 考试数据.questions.length * students.length;
  var done = 0;
  var qi = 0;
  function 下一题(){
    if(qi >= 考试数据.questions.length){
      考试流程 = 'reviewing';
      var el = 考试容器 || document.getElementById('fqViewContent');
      if(el) 渲染问答考试(el);
      考试互评();
      return;
    }
    var q = 考试数据.questions[qi];
    // 当前题的所有考生并发调用
    var tasks = students.map(function(s){
      return Store.character.get(s.title).then(function(考生卡){
        return 考试答一题(s, q, qi, 考生卡);
      }).then(function(){
        done++;
        考试作答进度(qi, total, done);
      }).catch(function(){
        考试数据.answers[s.key][qi] = { text: '（未回答）', reaction: '', mind: '', status: 'fail' };
        done++;
        考试作答进度(qi, total, done);
      });
    });
    Promise.all(tasks).then(function(){
      qi++;
      下一题();
    });
  }
  考试作答进度(0, total, 0);
  下一题();
}

function 考试答一题(student, q, qi, 考生卡){
  var name = (考生卡 && 考生卡.identity && 考生卡.identity.basicInfo && 考生卡.identity.basicInfo.name) || student.name;
  var charDesc = 考试角色卡(考生卡 || {});
  var 身份 = (typeof 问答身份提示 === 'function') ? 问答身份提示('answerer') : '';
  var 选项说明 = '';
  if(q.options && q.options.length){
    选项说明 = '这道题有选项：' + q.options.join('、') + '。请先给出答案：从选项中选择一项（如果都不符合，就回复"其他"），然后以角色身份展开回答。\n';
  } else {
    选项说明 = '这道题没有预设选项，请直接以角色身份回答。\n';
  }
  return LLM.callJSON({
    label: '考场作答',
    system: '你是角色' + name + '。\n\n【角色设定】\n' + charDesc,
    prompt: '请以该角色的身份用第一人称回答这道性癖调查题。\n' + 身份 + '\n' + 选项说明 + '回答分四部分：\n1. choice：先给出答案（从选项中选择一项；都不符合就填"其他"；无选项的题填"无"）\n2. reply：语言回答（以回答问题为核心，在所选答案基础上展开）\n3. reaction：身体反应（直接写动作、表情、神态）\n4. mind：内心想法（直接写，可与说的不一致）\n只输出JSON。\n问题：' + q.q + (q.options && q.options.length ? '\n可选项：' + q.options.join('、') : '') + '\n输出JSON格式：{"choice":"所选选项","reply":"语言回答","reaction":"身体反应","mind":"内心想法"}'
  }).then(function(d){
    考试数据.answers[student.key][qi] = { choice: (d && d.choice) || '其他', text: (d && d.reply) || '（未回答）', reaction: (d && d.reaction) || '', mind: (d && d.mind) || '', status: 'ok' };
  });
}

// 作答进度 UI（多个考生并发，显示已完成数）
function 考试作答进度(qi, total, done){
  var el = 考试容器 || document.getElementById('fqViewContent');
  if(!el) return;
  el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--fg2)">'
    + '<div class="fs-14 fw-600 mb-8">🏛️ ' + escHtml(考试数据.name) + '</div>'
    + '<div class="mb-8">已答 ' + done + ' / ' + total + '</div>'
    + '<div style="background:var(--bg2);border-radius:4px;height:8px;max-width:400px;margin:0 auto 12px"><div style="background:var(--accent);height:8px;border-radius:4px;width:' + (done / total * 100) + '%"></div></div>'
    + '<div class="fs-12">考生们正在作答 第 ' + (qi + 1) + ' 题…</div></div>';
}

// 进行中页面（作答/互评时简单展示）
function 考试进行页(el){
  el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--fg2)">'
    + '<div class="fs-14 fw-600 mb-8">🏛️ ' + (考试数据 ? escHtml(考试数据.name) : '考试') + '</div>'
    + '<div class="fs-12">' + (考试流程 === 'answering' ? '考生作答中…' : '考官互评中…') + '</div></div>';
}

// 互评主控：每个考官一次评全部题
function 考试互评(){
  var total = 考试数据.players.filter(function(p){ return p.role === 'judge'; }).length;
  var done = 0;
  var students = 考试数据.players.filter(function(p){ return p.role === 'student'; });
  var judges = 考试数据.players.filter(function(p){ return p.role === 'judge'; });
  // 预加载所有考生卡（被评价者身份信息用）
  var 考生卡表 = {};
  Promise.all(students.map(function(s){
    return Store.character.get(s.title).then(function(卡){ 考生卡表[s.key] = 卡; }).catch(function(){});
  })).then(function(){
    function 下一考官(){
      if(done >= total){
        考试计算成绩();
        考试流程 = 'result';
        var el = 考试容器 || document.getElementById('fqViewContent');
        if(el) 渲染问答考试(el);
        // 出结果后立即保存（实时保存，无需按钮）
        Store.examRoom.save(考试数据.id, 考试数据).catch(function(){});
        toast('互评完成，已自动保存');
        return;
      }
      var j = judges[done];
      考试互评进度(j, total, done);
      Store.character.get(j.title).then(function(考官卡){
        return 考试整体评价(j, students, 考官卡, 考生卡表);
      }).then(function(){
        done++;
        下一考官();
      }).catch(function(){ done++; 下一考官(); });
    }
    下一考官();
  });
}

// 考官整体评价全部题目（评价者=考官全量信息，被评价者=考生基础身份信息）
function 考试整体评价(judge, students, 考官卡, 考生卡表){
  var name = (考官卡 && 考官卡.identity && 考官卡.identity.basicInfo && 考官卡.identity.basicInfo.name) || judge.name;
  var charDesc = 考试角色卡(考官卡 || {});
  // 被评价者身份信息（基础身份段）
  var 考生信息 = students.map(function(s){
    var sc = 考生卡表 ? 考生卡表[s.key] : null;
    var 身份 = (typeof window.角色卡身份与外貌 === 'function') ? window.角色卡身份与外貌(sc || {}) : '';
    return '考生' + s.key + '(' + s.name + ')【身份：' + (身份 || '未知') + '】';
  }).join('\n');
  var qLines = 考试数据.questions.map(function(q, qi){
    var stLines = students.map(function(s){
      var a = 考试数据.answers[s.key] && 考试数据.answers[s.key][qi];
      return '考生' + s.key + '(' + s.name + ')：' + ((a && a.choice ? '选择：' + a.choice + '；' : '') + ((a && a.text) || '（未回答）'));
    }).join('\n');
    return '第' + (qi + 1) + '题：' + q.q + '\n' + stLines;
  }).join('\n\n');
  return LLM.callJSON({
    label: '考场互评',
    system: '你是考官' + name + '，正在主持一场性癖考试。\n\n【考官角色设定（本人完整信息）】\n' + charDesc,
    prompt: '以下是这场考试的题目、每位考生的作答，以及每位考生的身份信息。请结合考生身份，以你的角色口吻，对每个考生每题给出评价。评价分两部分：\n1. level：评价等级（三档：很差/一般/很好，用 bad/mid/good）\n2. comment：评价内容（针对该考生的作答给出具体评语）\n\n【考生身份信息】\n' + 考生信息 + '\n\n【题目与作答】\n' + qLines + '\n\n输出JSON格式：{"results":[{"qi":0,"studentKey":"s0","level":"bad","comment":"评价内容"}]}\nlevel 取值：bad=很差 / mid=一般 / good=很好。每题每个考生都要评价，两部分都要输出。'
  }).then(function(d){
    if(!d || !d.results || !d.results.length) throw new Error('互评返回空');
    d.results.forEach(function(r){
      var qi = r.qi;
      var sk = r.studentKey;
      if(!考试数据.reviews[judge.key][qi]) 考试数据.reviews[judge.key][qi] = {};
      考试数据.reviews[judge.key][qi][sk] = { level: r.level || 'mid', score: 考试三档换算(r.level), comment: r.comment || '' };
    });
  });
}

// 互评进度
function 考试互评进度(judge, total, done){
  var el = 考试容器 || document.getElementById('fqViewContent');
  if(!el) return;
  el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--fg2)">'
    + '<div class="fs-14 fw-600 mb-8">🏛️ ' + escHtml(考试数据.name) + '</div>'
    + '<div class="mb-8">考官 ' + (done + 1) + ' / ' + total + '</div>'
    + '<div style="background:var(--bg2);border-radius:4px;height:8px;max-width:400px;margin:0 auto 12px"><div style="background:var(--accent);height:8px;border-radius:4px;width:' + ((done + 1) / total * 100) + '%"></div></div>'
    + '<div class="fs-12">' + escHtml(judge.name) + ' 正在评价全部题目…</div></div>';
}
