// 性癖问答 · 考场（文件3/3：成绩页 + 考生详情 + 统计 + 考生互评 + 自评）
// 依赖：Store.examRoom / Store.character / LLM / window.角色卡全部 / window.角色卡身份与外貌 / 问答评价身份提示

// ===== Step5：成绩页 =====
function 考试计算成绩(){
  var students = 考试数据.players.filter(function(p){ return p.role === 'student'; });
  var judges = 考试数据.players.filter(function(p){ return p.role === 'judge'; });
  students.forEach(function(s){
    var total = 0, full = 考试数据.questions.length * 2;
    考试数据.questions.forEach(function(q, qi){
      var scores = [];
      judges.forEach(function(j){
        var r = 考试数据.reviews[j.key] && 考试数据.reviews[j.key][qi] && 考试数据.reviews[j.key][qi][s.key];
        if(r) scores.push(r.score);
      });
      var avg = scores.length ? (scores.reduce(function(a,b){ return a+b; }, 0) / scores.length) : 0;
      total += avg;
    });
    var ratio = full ? total / full : 0;
    考试数据.scores[s.key] = { total: Math.round(total * 10) / 10, full: full, ratio: ratio, grade: 考试等级(ratio), rank: 0, pass: false };
  });
  // 名次 + 及格判定（始终取前 40% 及格，及格线按比例自动计算）
  var sorted = students.slice().sort(function(a,b){ return (考试数据.scores[b.key].total || 0) - (考试数据.scores[a.key].total || 0); });
  sorted.forEach(function(s, idx){ 考试数据.scores[s.key].rank = idx + 1; });
  var 及格数 = Math.max(1, Math.ceil(sorted.length * 0.4));
  sorted.forEach(function(s, idx){
    if(idx < 及格数) 考试数据.scores[s.key].pass = true;
  });
  // 及格线 = 第 及格数 名考生的总分
  考试数据.passLine = sorted.length ? (考试数据.scores[sorted[Math.min(及格数, sorted.length) - 1].key].total || 0) : 0;
  考试数据.passCount = Math.min(及格数, sorted.length);
}

// 考生详情展开状态
// 当前详情页考生（整行点击进入）

// 展开/收起单个考生详情（兼容保留，新入口为整行点击）
window.考试展开考生 = function(sKey){
  考试展开考生Key = (考试展开考生Key === sKey) ? null : sKey;
  var el = 考试容器 || document.getElementById('fqViewContent');
  if(el) 考试成绩页(el);
};

// 整行点击进入考生详情页（双栏对照）
window.考试打开考生详情 = function(sKey){
  考试当前详情考生 = sKey;
  考试展开考生Key = null;
  var el = 考试容器 || document.getElementById('fqViewContent');
  if(el) 渲染问答考试(el);
};

// 从详情页返回成绩页
window.考试详情返回 = function(){
  考试当前详情考生 = null;
  var el = 考试容器 || document.getElementById('fqViewContent');
  if(el) 渲染问答考试(el);
};

// 考生详情页（方案B：双栏对照——左"我的作答"，右"评价"）
function 考试考生详情页(el){
  var s = 考试数据.players.filter(function(p){ return p.key === 考试当前详情考生; })[0];
  if(!s){ 考试当前详情考生 = null; 考试成绩页(el); return; }
  var students = 考试数据.players.filter(function(p){ return p.role === 'student'; });
  var judges = 考试数据.players.filter(function(p){ return p.role === 'judge'; });
  var sc = 考试数据.scores[s.key] || {};
  var 档色 = { 'good': 'rgba(76,204,163,0.15)', 'mid': 'rgba(240,208,96,0.15)', 'bad': 'rgba(233,69,96,0.15)' };
  var 档字 = { 'good': '#4ecca3', 'mid': '#f0d060', 'bad': '#e94560' };
  function 档标签(lv){ return lv === 'good' ? '很好' : (lv === 'mid' ? '一般' : '很差'); }
  function 档css(lv){ return 档色[lv]; }
  function 档color(lv){ return 档字[lv]; }

  // 档案头
  var 考生图标 = ['👧','👸','🧝','🧜‍♀️','🦊','🌸','🌙','🐚'];
  var sIdx = 考试数据.players.indexOf(s);
  var 头像 = 考生图标[sIdx % 考生图标.length];
  var h = '<div style="max-width:900px;margin:0 auto;padding:22px 24px;background:linear-gradient(180deg,var(--card),#12121c);border:1px solid var(--border);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,0.35);font-family:var(--font-sans);font-size:13px;line-height:1.7;color:var(--fg)">'
    + '<div style="display:flex;align-items:center;gap:16px;padding-bottom:16px;border-bottom:1px solid var(--border)">'
    + '<div style="width:52px;height:52px;border-radius:14px;background:var(--bg2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0">' + 头像 + '</div>'
    + '<div><div style="font-size:21px;font-weight:700;color:var(--fg);letter-spacing:0.5px">' + escHtml(s.name) + '</div>'
    + '<div style="font-size:11px;color:var(--fg3);margin-top:3px;letter-spacing:0.3px">👨‍🎓 考生 · ' + escHtml(考试数据.name) + '</div></div>'
    + '<div style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap;align-items:center">'
    + '<span class="tag-chip fs-10" style="background:' + 档css(sc.grade === '很好' ? 'good' : (sc.grade === '一般' ? 'mid' : 'bad')) + ';color:' + 档color(sc.grade === '很好' ? 'good' : (sc.grade === '一般' ? 'mid' : 'bad')) + ';border-radius:8px;padding:3px 10px">等级 ' + escHtml(sc.grade || '') + '</span>'
    + '<span class="tag-chip fs-10" style="background:rgba(46,204,113,0.15);color:#2ecc71;border-radius:8px;padding:3px 10px">第 ' + (sc.rank || '-') + ' 名</span>'
    + (sc.pass
        ? '<span class="tag-chip fs-10" style="background:rgba(46,204,113,0.2);color:#2ecc71;border-radius:8px;padding:3px 10px">✅ 及格</span>'
        : '<span class="tag-chip fs-10" style="background:rgba(231,76,60,0.2);color:#e74c3c;border-radius:8px;padding:3px 10px">❌ 不及格</span>')
    + '<button class="btn-secondary btn-sm" style="font-size:10px;margin-left:6px;border-radius:6px" onclick="考试详情返回()">← 返回成绩单</button>'
    + '</div></div>';

  // 摘要条
  h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:16px 0">'
    + '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:12px;text-align:center"><div style="font-size:18px;font-weight:700;color:var(--fg);font-variant-numeric:tabular-nums">' + (sc.total || 0) + ' <span style="color:var(--fg3);font-weight:400">/ ' + (sc.full || 0) + '</span></div><div style="font-size:10px;color:var(--fg3);margin-top:3px;letter-spacing:0.5px">总分</div></div>'
    + '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:12px;text-align:center"><div style="font-size:18px;font-weight:700;color:var(--accent2);font-variant-numeric:tabular-nums">' + Math.round((sc.ratio || 0) * 100) + '%</div><div style="font-size:10px;color:var(--fg3);margin-top:3px;letter-spacing:0.5px">得分率</div></div>'
    + '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:12px;text-align:center"><div style="font-size:18px;font-weight:700;color:var(--fg)">' + judges.length + ' 考 + ' + students.length + ' 互</div><div style="font-size:10px;color:var(--fg3);margin-top:3px;letter-spacing:0.5px">评价来源</div></div>'
    + '</div>';

  // 每题：双栏对照
  考试数据.questions.forEach(function(q, qi){
    var a = 考试数据.answers[s.key] && 考试数据.answers[s.key][qi];
    // 该题平均档
    var 该题scores = [];
    judges.forEach(function(j){
      var r = 考试数据.reviews[j.key] && 考试数据.reviews[j.key][qi] && 考试数据.reviews[j.key][qi][s.key];
      if(r) 该题scores.push(r);
    });
    var avg = 该题scores.length ? 该题scores.reduce(function(x,y){ return x + 考试三档换算(y.level); }, 0) / 该题scores.length : 0;
    var lvl = avg >= 1.5 ? 'good' : (avg >= 0.5 ? 'mid' : 'bad');

    h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;margin-bottom:14px;overflow:hidden">';
    h += '<div style="display:flex;align-items:center;gap:10px;padding:13px 18px;background:var(--card);border-bottom:1px solid var(--border)">'
      + '<span style="font-size:11px;font-weight:700;color:#f0d060;background:rgba(240,208,96,0.15);padding:2px 9px;border-radius:8px">Q' + (qi + 1) + '</span>'
      + '<span style="font-size:14px;font-weight:700;color:var(--fg)">' + escHtml(q.q) + '</span>'
      + '<span style="margin-left:auto;font-size:10px;padding:2px 9px;border-radius:8px;background:' + 档css(lvl) + ';color:' + 档color(lvl) + '">' + 档标签(lvl) + '</span></div>';
    // 双栏
    h += '<div style="display:grid;grid-template-columns:1fr 1fr">';
    // 左：我的作答
    h += '<div style="padding:16px 18px;border-right:1px solid var(--border)">'
      + '<div style="font-size:11px;color:var(--fg3);font-weight:700;margin-bottom:12px;letter-spacing:1px">✋ 我的作答</div>'
      + (a && a.choice ? '<div style="display:inline-block;font-size:11px;color:var(--accent2);background:rgba(212,136,158,0.12);padding:2px 9px;border-radius:6px;margin-bottom:10px">🔘 选：' + escHtml(a.choice) + '</div>' : '')
      + '<div style="font-size:13.5px;line-height:2;color:var(--fg)">' + escHtml((a && a.text) || '（未回答）') + '</div>'
      + (a && a.reaction ? '<div style="font-size:12px;color:var(--fg2);margin-top:10px;padding:8px 12px;background:rgba(255,255,255,0.04);border-radius:6px;border-left:3px solid var(--fg2);line-height:1.7">⚡ ' + escHtml(a.reaction) + '</div>' : '')
      + (a && a.mind ? '<div style="font-size:12px;color:var(--fg2);margin-top:10px;padding:8px 12px;background:rgba(255,255,255,0.04);border-radius:6px;border-left:3px solid var(--accent2);line-height:1.7">💭 ' + escHtml(a.mind) + '</div>' : '')
      + '</div>';
    // 右：评价
    h += '<div style="padding:16px 18px">';
    h += '<div style="font-size:11px;color:var(--fg3);font-weight:700;margin-bottom:12px;letter-spacing:1px">⚖️ 评价</div>';
    // 考官
    judges.forEach(function(j){
      var r = 考试数据.reviews[j.key] && 考试数据.reviews[j.key][qi] && 考试数据.reviews[j.key][qi][s.key];
      if(!r) return;
      h += '<div style="margin-bottom:16px"><div style="font-size:11px;color:var(--fg2);margin-bottom:5px">⚖️ <b style="color:var(--accent2)">' + escHtml(j.name) + '</b>（考官）</div>'
        + '<div style="font-size:12.5px;line-height:1.9;border-left:2px solid var(--border);padding-left:12px;color:var(--fg)"><span style="font-size:10px;padding:1px 7px;border-radius:6px;background:' + 档css(r.level) + ';color:' + 档color(r.level) + ';margin-right:6px">' + 档标签(r.level) + '</span>' + escHtml(r.comment || '') + '</div></div>';
    });
    // 考生互评
    students.forEach(function(st){
      if(st.key === s.key) return;
      var r = 考试数据.reviews[st.key] && 考试数据.reviews[st.key][qi] && 考试数据.reviews[st.key][qi][s.key];
      if(!r) return;
      h += '<div style="margin-bottom:16px"><div style="font-size:11px;color:var(--fg2);margin-bottom:5px">👥 <b style="color:var(--accent)">' + escHtml(st.name) + '</b>（考生）</div>'
        + '<div style="font-size:12.5px;line-height:1.9;border-left:2px solid var(--border);padding-left:12px;color:var(--fg)"><span style="font-size:10px;padding:1px 7px;border-radius:6px;background:' + 档css(r.level) + ';color:' + 档color(r.level) + ';margin-right:6px">' + 档标签(r.level) + '</span>' + escHtml(r.comment || '') + '</div></div>';
    });
    if(!该题scores.length){
      // 该题无任何评价
    }
    h += '</div>';
    h += '</div></div>';
  });

  // 自评
  var sr = 考试数据.selfReviews && 考试数据.selfReviews[s.key];
  h += '<div style="border:1px solid var(--accent);border-radius:12px;overflow:hidden;margin-top:2px;background:var(--bg2)">'
    + '<div style="padding:12px 18px;background:rgba(212,196,240,0.08);border-bottom:1px solid var(--accent);font-size:12px;font-weight:700;color:var(--accent);letter-spacing:0.5px">📝 ' + escHtml(s.name) + ' 的自评</div>'
    + '<div style="padding:16px 18px;font-size:13.5px;line-height:2.1;white-space:pre-wrap;color:var(--fg)">' + escHtml((sr && sr.text) || '（暂无自评）') + '</div>'
    + '</div>';

  h += '</div>';
  el.innerHTML = h;
}
window.考试考生详情页 = 考试考生详情页;

// 题目维度统计：每题平均分/难度/档位分布
function 考试题目统计(students, judges){
  var h = '<div style="display:flex;align-items:center;gap:8px;margin:22px 0 10px">'
    + '<span style="font-size:15px">📊</span><span style="font-size:13.5px;font-weight:700;color:var(--fg);letter-spacing:0.5px">题目统计</span>'
    + '<span style="height:1px;flex:1;background:linear-gradient(90deg,var(--border),transparent)"></span></div>';
  h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:6px 12px">';
  考试数据.questions.forEach(function(q, qi){
    var scores = [];
    var 档计 = { good: 0, mid: 0, bad: 0 };
    students.forEach(function(s){
      judges.forEach(function(j){
        var r = 考试数据.reviews[j.key] && 考试数据.reviews[j.key][qi] && 考试数据.reviews[j.key][qi][s.key];
        if(r){ scores.push(r.score); 档计[r.level] = (档计[r.level]||0)+1; }
      });
    });
    var avg = scores.length ? (scores.reduce(function(a,b){ return a+b; },0) / scores.length) : 0;
    var 难度 = avg >= 1.5 ? '简单' : (avg >= 0.5 ? '适中' : '困难');
    var 难度色 = avg >= 1.5 ? 'var(--success)' : (avg >= 0.5 ? 'var(--warning)' : 'var(--error)');
    h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:11px 6px;border-bottom:1px solid var(--border)">'
      + '<div style="font-size:12.5px;font-weight:600;color:var(--fg)">Q' + (qi+1) + ' <span style="color:var(--fg2);font-weight:400">·</span> ' + escHtml(q.q) + '</div>'
      + '<div style="display:flex;gap:12px;flex-shrink:0;font-size:11px;align-items:center">'
      + '<span style="color:var(--fg2)">平均 <b class="exam-num" style="color:var(--fg)">' + (Math.round(avg*10)/10) + '</b></span>'
      + '<span style="color:' + 难度色 + '">难度 ' + 难度 + '</span>'
      + '<span class="exam-num" style="color:var(--success)">很好 ' + (档计.good||0) + '</span>'
      + '<span class="exam-num" style="color:var(--warning)">一般 ' + (档计.mid||0) + '</span>'
      + '<span class="exam-num" style="color:var(--error)">很差 ' + (档计.bad||0) + '</span>'
      + '</div></div>';
  });
  h += '</div>';
  return h;
}

// 考官评分对比
function 考试考官对比(students, judges){
  var h = '<div style="display:flex;align-items:center;gap:8px;margin:22px 0 10px">'
    + '<span style="font-size:15px">⚖️</span><span style="font-size:13.5px;font-weight:700;color:var(--fg);letter-spacing:0.5px">考官对比</span>'
    + '<span style="height:1px;flex:1;background:linear-gradient(90deg,var(--border),transparent)"></span></div>';
  h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:6px 12px">';
  judges.forEach(function(j){
    var scores = [];
    var 档计 = { good: 0, mid: 0, bad: 0 };
    考试数据.questions.forEach(function(q, qi){
      students.forEach(function(s){
        var r = 考试数据.reviews[j.key] && 考试数据.reviews[j.key][qi] && 考试数据.reviews[j.key][qi][s.key];
        if(r){ scores.push(r.score); 档计[r.level] = (档计[r.level]||0)+1; }
      });
    });
    var avg = scores.length ? (scores.reduce(function(a,b){ return a+b; },0) / scores.length) : 0;
    var 常用档 = 档计.good >= 档计.mid && 档计.good >= 档计.bad ? '很好' : (档计.mid >= 档计.bad ? '一般' : '很差');
    var 常用档色 = 常用档 === '很好' ? 'var(--success)' : (常用档 === '一般' ? 'var(--warning)' : 'var(--error)');
    h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:11px 6px;border-bottom:1px solid var(--border)">'
      + '<div style="font-size:12.5px;font-weight:600;color:var(--fg)">👤 ' + escHtml(j.name) + '</div>'
      + '<div style="display:flex;gap:12px;flex-shrink:0;font-size:11px;align-items:center">'
      + '<span style="color:var(--fg2)">平均给分 <b class="exam-num" style="color:var(--fg)">' + (Math.round(avg*10)/10) + '</b></span>'
      + '<span style="color:' + 常用档色 + '">常用档 ' + 常用档 + '</span>'
      + '<span class="exam-num" style="color:var(--success)">很好 ' + (档计.good||0) + '</span>'
      + '<span class="exam-num" style="color:var(--warning)">一般 ' + (档计.mid||0) + '</span>'
      + '<span class="exam-num" style="color:var(--error)">很差 ' + (档计.bad||0) + '</span>'
      + '</div></div>';
  });
  h += '</div>';
  return h;
}

function 考试成绩页(el){
  var students = 考试数据.players.filter(function(p){ return p.role === 'student'; });
  var judges = 考试数据.players.filter(function(p){ return p.role === 'judge'; });
  var srcLabel = 考试数据.source === 'ai' ? 'AI出题' : '题库抽题';
  var h = '<style>'
    + '.exam-table{border-collapse:collapse;width:100%}'
    + '.exam-table thead th{position:sticky;top:0;background:var(--card);z-index:1;font-weight:600;letter-spacing:0.5px;color:var(--fg2)}'
    + '.exam-table tbody tr{transition:background 0.15s ease,border-color 0.15s ease}'
    + '.exam-table tbody tr:hover{background:var(--card-hover)}'
    + '.exam-num{font-family:var(--font-sans);font-variant-numeric:tabular-nums}'
    + '.exam-name{display:flex;align-items:center;gap:8px}'
    + '.exam-avatar{width:26px;height:26px;border-radius:8px;background:var(--card-hover);border:1px solid var(--border);display:inline-flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}'
    + '</style>'
    + '<div style="max-width:900px;margin:0 auto;padding:22px 24px;background:linear-gradient(180deg,var(--card),#12121c);border:1px solid var(--border);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,0.35);font-family:var(--font-sans);font-size:13px;line-height:1.7;color:var(--fg)">'
    + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding-bottom:16px;border-bottom:1px solid var(--border);margin-bottom:18px">'
    + '<div><div style="display:flex;align-items:center;gap:10px"><span style="font-size:20px;line-height:1">📊</span>'
    + '<h3 style="font-size:19px;font-weight:700;margin:0;letter-spacing:0.5px;color:var(--fg)">' + escHtml(考试数据.name) + '</h3></div>'
    + '<div style="font-size:11px;color:var(--fg3);margin-top:5px;letter-spacing:0.3px">' + srcLabel + ' · ' + 考试数据.questions.length + ' 题 · 考官' + judges.length + '人</div></div>'
    + '<div style="display:flex;gap:8px;flex-shrink:0">'
    + '<button class="btn-secondary btn-sm" style="font-size:10px;border-radius:6px" onclick="考试重开互评()">⚖️ 考官评价</button>'
    + '<button class="btn-secondary btn-sm" style="font-size:10px;border-radius:6px" onclick="考试考生互评弹窗()">👥 考生互评</button>'
    + '<button class="btn-secondary btn-sm" style="font-size:10px;border-radius:6px" onclick="问答考试显示()">← 返回</button>'
    + '</div></div>';

  // ===== 1. 统计概览卡片 =====
  var 平均ratio = students.length ? students.reduce(function(a,s){ return a + (考试数据.scores[s.key]?.ratio||0); },0) / students.length : 0;
  var 最高 = 0, 最低 = Infinity;
  students.forEach(function(s){ var t = 考试数据.scores[s.key]?.total||0; if(t>最高)最高=t; if(t<最低)最低=t; });
  if(!students.length) 最低 = 0;
  h += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">';
  function 统计卡(icon, val, lab, hl){
    return '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px 8px;text-align:center;transition:transform 0.15s ease,border-color 0.15s ease" onmouseover="this.style.transform=\'translateY(-2px)\';this.style.borderColor=\'var(--accent2)\'" onmouseout="this.style.transform=\'\';this.style.borderColor=\'\'">'
      + '<div style="font-size:18px;line-height:1">' + icon + '</div>'
      + '<div style="font-size:19px;font-weight:700;margin-top:6px;color:' + (hl || 'var(--fg)') + ';font-family:var(--font-sans);font-variant-numeric:tabular-nums">' + val + '</div>'
      + '<div style="font-size:10px;color:var(--fg3);margin-top:3px;letter-spacing:0.5px">' + lab + '</div></div>';
  }
  h += 统计卡('👥', students.length, '考生');
  h += 统计卡('📝', 考试数据.questions.length, '题数');
  h += 统计卡('🎯', (考试数据.passCount||0) + '/' + students.length, '及格 · 线' + (考试数据.passLine||0) + '分', 'var(--accent)');
  h += 统计卡('📈', Math.round(平均ratio*100) + '%', '平均得分率', 'var(--accent2)');
  h += '</div>';

  // ===== 2. 成绩表（平均分列 + 分数 + 及格标记；整行点击进入考生详情） =====
  h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;overflow:auto;padding:4px">';
  h += '<table class="exam-table">';
  h += '<thead><tr style="border-bottom:1px solid var(--border)"><th style="padding:10px 12px;text-align:left;font-size:11px">考生</th>';
  考试数据.questions.forEach(function(q, qi){ h += '<th style="padding:10px 12px;text-align:center;font-size:11px">Q' + (qi+1) + '</th>'; });
  h += '<th style="padding:10px 12px;text-align:center;font-size:11px">平均分</th><th style="padding:10px 12px;text-align:center;font-size:11px">总分</th><th style="padding:10px 12px;text-align:center;font-size:11px">等级</th><th style="padding:10px 12px;text-align:center;font-size:11px">名次</th><th style="padding:10px 12px;text-align:center;font-size:11px">及格</th></tr></thead><tbody>';
  var 档色 = { 'good': 'rgba(46,204,113,0.16)', 'mid': 'rgba(243,156,18,0.16)', 'bad': 'rgba(231,76,60,0.16)' };
  var 档字色 = { 'good': '#2ecc71', 'mid': '#f39c12', 'bad': '#e74c3c' };
  students.forEach(function(s){
    var sc = 考试数据.scores[s.key] || {};
    var sIdx = 考试数据.players.indexOf(s);
    var 头像 = (sIdx % 8 === 0 ? '👧' : sIdx % 8 === 1 ? '👸' : sIdx % 8 === 2 ? '🧝' : sIdx % 8 === 3 ? '🧜‍♀️' : sIdx % 8 === 4 ? '🦊' : sIdx % 8 === 5 ? '🌸' : sIdx % 8 === 6 ? '🌙' : '🐚');
    h += '<tr style="border-bottom:1px solid var(--border);cursor:pointer" onclick="考试打开考生详情(\'' + s.key + '\')" title="点击查看 ' + escHtml(s.name) + ' 的完整档案">'
      + '<td style="padding:11px 12px"><div class="exam-name"><span class="exam-avatar">' + 头像 + '</span><span style="font-weight:600;font-size:13px;color:var(--fg)">' + escHtml(s.name) + '</span></div></td>';
    考试数据.questions.forEach(function(q, qi){
      var scores = [];
      judges.forEach(function(j){
        var r = 考试数据.reviews[j.key] && 考试数据.reviews[j.key][qi] && 考试数据.reviews[j.key][qi][s.key];
        if(r) scores.push(r);
      });
      var avg = scores.length ? scores.reduce(function(a,b){ return a + 考试三档换算(b.level); }, 0) / scores.length : 0;
      var lvl = avg >= 1.5 ? 'good' : (avg >= 0.5 ? 'mid' : 'bad');
      var label = lvl === 'good' ? '很好' : (lvl === 'mid' ? '一般' : '很差');
      h += '<td style="padding:9px 10px;text-align:center;font-size:11.5px;background:' + 档色[lvl] + ';color:' + 档字色[lvl] + ';border-radius:8px;font-weight:600">' + label + ' · <span class="exam-num">' + (Math.round(avg*10)/10) + '</span></td>';
    });
    var 均分 = Math.round((sc.ratio||0)*100);
    h += '<td style="padding:10px 12px;text-align:center;font-size:12px;font-weight:600" class="exam-num">' + 均分 + '%</td>'
      + '<td style="padding:10px 12px;text-align:center;font-weight:700;font-size:12.5px" class="exam-num">' + (sc.total || 0) + '<span style="color:var(--fg3);font-weight:400">/' + (sc.full || 0) + '</span></td>'
      + '<td style="padding:10px 12px;text-align:center;font-size:11.5px">' + (sc.grade || '') + '</td>'
      + '<td style="padding:10px 12px;text-align:center;font-size:11.5px" class="exam-num">' + (sc.rank || '-') + '</td>'
      + '<td style="padding:10px 12px;text-align:center">' + (sc.pass ? '<span style="color:var(--success);font-weight:700;font-size:11.5px">✅ 及格</span>' : '<span style="color:var(--error);font-weight:700;font-size:11.5px">❌ 不及格</span>') + '</td></tr>';
  });
  h += '</tbody></table></div>';

  // ===== 3. 题目统计 =====
  h += 考试题目统计(students, judges);

  // ===== 4. 考官对比 =====
  h += 考试考官对比(students, judges);

  // ===== 5. 评语明细 =====
  h += '<div style="display:flex;align-items:center;gap:8px;margin:22px 0 10px">'
    + '<span style="font-size:15px">📝</span><span style="font-size:13.5px;font-weight:700;color:var(--fg);letter-spacing:0.5px">评语明细</span>'
    + '<span style="height:1px;flex:1;background:linear-gradient(90deg,var(--border),transparent)"></span></div>';
  考试数据.questions.forEach(function(q, qi){
    h += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:10px"><div style="font-size:12.5px;font-weight:700;margin-bottom:10px;color:var(--fg)">Q' + (qi+1) + ': ' + escHtml(q.q) + '</div>';
    students.forEach(function(s){
      var a = 考试数据.answers[s.key] && 考试数据.answers[s.key][qi];
      h += '<div style="font-size:11.5px;color:var(--fg2);margin-bottom:4px;line-height:1.6">👤 <b style="color:var(--fg)">' + escHtml(s.name) + '</b>' + (a && a.choice ? '<span style="color:var(--accent2)">（选：' + escHtml(a.choice) + '）</span>' : '') + '：' + escHtml((a && a.text) || '（未回答）') + '</div>';
      judges.forEach(function(j){
        var r = 考试数据.reviews[j.key] && 考试数据.reviews[j.key][qi] && 考试数据.reviews[j.key][qi][s.key];
        if(!r) return;
        var lvl = r.level === 'good' ? '很好' : (r.level === 'mid' ? '一般' : '很差');
        var lvl色 = r.level === 'good' ? 'var(--success)' : (r.level === 'mid' ? 'var(--warning)' : 'var(--error)');
        h += '<div style="font-size:11px;margin-left:14px;color:var(--fg3);line-height:1.6;border-left:2px solid var(--border);padding-left:10px">⚖️ <b style="color:var(--fg2)">' + escHtml(j.name) + '</b> <span style="color:' + lvl色 + '">' + lvl + '</span> — ' + escHtml(r.comment || '') + '</div>';
      });
    });
    h += '</div>';
  });
  h += '</div>';
  el.innerHTML = h;
}

window.考试保存 = function(){
  Store.examRoom.save(考试数据.id, 考试数据).then(function(){
    toast('考场已保存');
  }).catch(function(err){ toast('保存失败: ' + err.message); });
};

// ===== 考生互评：选评价者 + 被评价者，逐题评价 =====

// 弹窗选择评价者与被评价者（都是考生）
window.考试考生互评弹窗 = function(){
  var students = 考试数据.players.filter(function(p){ return p.role === 'student'; });
  if(students.length < 2){ toast('至少需要两名考生才能互评'); return; }
  var h = '<div class="mcard" style="max-width:480px">'
    + '<h3 style="font-size:14px;margin-bottom:10px">👥 考生互评</h3>'
    + '<div class="form-group"><label>评价者（选谁来做评价）</label><select class="llm-input llm-select" id="examRateRater" style="width:100%">';
  students.forEach(function(s){ h += '<option value="' + s.key + '">' + escHtml(s.name) + '</option>'; });
  h += '</select></div>'
    + '<div class="form-group"><label>被评价者（选谁被评价）</label><select class="llm-input llm-select" id="examRateRatee" style="width:100%">';
  students.forEach(function(s){ h += '<option value="' + s.key + '">' + escHtml(s.name) + '</option>'; });
  h += '</select></div>'
    + '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:10px">'
    + '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>'
    + '<button class="btn-main" onclick="考试考生互评开始()">🚀 开始互评</button></div></div>';
  var ov = document.createElement('div');
  ov.className = 'ovl'; ov.innerHTML = h;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e){ if(e.target === ov) ov.remove(); });
};

// 开始考生互评
window.考试考生互评开始 = function(){
  var raterEl = document.getElementById('examRateRater');
  var rateeEl = document.getElementById('examRateRatee');
  var rater = raterEl ? raterEl.value : '';
  var ratee = rateeEl ? rateeEl.value : '';
  if(!rater || !ratee){ toast('请选择评价者和被评价者'); return; }
  if(rater === ratee){ toast('评价者和被评价者不能是同一人'); return; }
  document.querySelectorAll('.ovl').forEach(function(o){ if(o.querySelector('.mcard')) o.remove(); });
  考试互评选择 = { rater: rater, ratee: ratee };
  考试考生互评();
};

// 逐题评价
function 考试考生互评(){
  var rater = 考试数据.players.filter(function(p){ return p.key === 考试互评选择.rater; })[0];
  var ratee = 考试数据.players.filter(function(p){ return p.key === 考试互评选择.ratee; })[0];
  if(!rater || !ratee){ toast('考生不存在'); return; }
  // 用评价者 key 作为评价维度（考生也可当评价者）
  if(!考试数据.reviews[rater.key]) 考试数据.reviews[rater.key] = {};
  var total = 考试数据.questions.length;
  var done = 0;
  // 预加载被评价者卡（身份信息用）
  var 被评卡 = null;
  Store.character.get(ratee.title).then(function(卡){ 被评卡 = 卡; }).catch(function(){}).then(function(){
    function 下一题(){
      if(done >= total){
        考试计算成绩();
        考试流程 = 'result';
        var el = 考试容器 || document.getElementById('fqViewContent');
        if(el) 渲染问答考试(el);
        Store.examRoom.save(考试数据.id, 考试数据).catch(function(){});
        toast('考生互评完成，已自动保存');
        return;
      }
      var qi = done;
      var q = 考试数据.questions[qi];
      考试考生互评进度(rater, ratee, qi, total);
      Store.character.get(rater.title).then(function(评价者卡){
        return 考试考生评一题(rater, ratee, q, qi, 评价者卡, 被评卡);
      }).then(function(){
        done++;
        下一题();
      }).catch(function(){ done++; 下一题(); });
    }
    下一题();
  });
}

// 评价者对被评价者评单题（三档 + 评语）——评价者全量信息，被评价者身份信息
function 考试考生评一题(rater, ratee, q, qi, 评价者卡, 被评卡){
  var name = (评价者卡 && 评价者卡.identity && 评价者卡.identity.basicInfo && 评价者卡.identity.basicInfo.name) || rater.name;
  var charDesc = 考试角色卡(评价者卡 || {});
  var 被评身份 = (typeof window.角色卡身份与外貌 === 'function') ? window.角色卡身份与外貌(被评卡 || {}) : '';
  var a = 考试数据.answers[ratee.key] && 考试数据.answers[ratee.key][qi];
  var 身份 = (typeof 问答评价身份提示 === 'function') ? 问答评价身份提示() : '';
  return LLM.callJSON({
    label: '考生互评',
    system: '你是考生' + name + '，现在要像考官一样评价另一位考生的作答。\n\n【你的角色设定（本人完整信息）】\n' + charDesc,
    prompt: '请以你的角色口吻，评价下面这道题中【' + ratee.name + '】的作答。评价分两部分：\n1. level：评价等级（三档：很差/一般/很好，用 bad/mid/good）\n2. comment：评价内容（针对该考生的作答给出具体评语）\n' + 身份 + '\n【被评价者身份信息】\n' + (被评身份 || '未知') + '\n题目：' + q.q + '\n作答：' + ((a && a.choice ? '选择：' + a.choice + '；' : '') + ((a && a.text) || '（未回答）')) + '\n输出JSON格式：{"level":"bad","comment":"评价内容"}\nlevel 取值：bad=很差 / mid=一般 / good=很好。两部分都要输出。'
  }).then(function(d){
    if(!考试数据.reviews[rater.key][qi]) 考试数据.reviews[rater.key][qi] = {};
    考试数据.reviews[rater.key][qi][ratee.key] = { level: (d && d.level) || 'mid', score: 考试三档换算(d && d.level), comment: (d && d.comment) || '' };
  });
}

// 考生互评进度
function 考试考生互评进度(rater, ratee, qi, total){
  var el = 考试容器 || document.getElementById('fqViewContent');
  if(!el) return;
  el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--fg2)">'
    + '<div class="fs-14 fw-600 mb-8">🏛️ ' + escHtml(考试数据.name) + '</div>'
    + '<div class="mb-8">' + escHtml(rater.name) + ' 正在评价 ' + escHtml(ratee.name) + ' · 第 ' + (qi + 1) + '/' + total + ' 题</div>'
    + '<div style="background:var(--bg2);border-radius:4px;height:8px;max-width:400px;margin:0 auto 12px"><div style="background:var(--accent);height:8px;border-radius:4px;width:' + ((qi + 1) / total * 100) + '%"></div></div>'
    + '</div>';
}

// ===== 考生自评：考生看整套卷子 + 评委分数评语，输出全面自评 =====
window.考试考生自评 = function(sKey){
  var s = 考试数据.players.filter(function(p){ return p.key === sKey; })[0];
  if(!s){ toast('考生不存在'); return; }
  if(!考试数据.selfReviews) 考试数据.selfReviews = {};
  var el = 考试容器 || document.getElementById('fqViewContent');
  if(el) el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--fg2)">⏳ ' + escHtml(s.name) + ' 正在审视整场考试与自己的成绩...</div>';
  // 收集所有评委（考官 + 互评考生）对该考生的分数和评语
  var 评委行 = [];
  考试数据.players.forEach(function(p){
    if(p.key === sKey) return;
    var hasReview = 考试数据.reviews[p.key] ? Object.keys(考试数据.reviews[p.key]).length > 0 : false;
    if(!hasReview) return;
    评委行.push(p);
  });
  // 组装卷子信息
  var 卷面 = 考试数据.questions.map(function(q, qi){
    var a = 考试数据.answers[s.key] && 考试数据.answers[s.key][qi];
    var 评委们 = 评委行.map(function(p){
      var r = 考试数据.reviews[p.key] && 考试数据.reviews[p.key][qi] && 考试数据.reviews[p.key][qi][s.key];
      if(!r) return '';
      var lvl = r.level === 'good' ? '很好' : (r.level === 'mid' ? '一般' : '很差');
      return '评委' + p.name + '(' + (p.role === 'judge' ? '考官' : '考生') + ')：' + lvl + ' — ' + (r.comment || '');
    }).filter(Boolean).join('\n');
    return '第' + (qi+1) + '题：' + q.q + '\n我的作答：' + ((a && a.choice ? '选择：' + a.choice + '；' : '') + ((a && a.text) || '（未回答）')) + (评委们 ? '\n' + 评委们 : '\n（无评委评价）');
  }).join('\n\n');
  var sc = 考试数据.scores[s.key] || {};
  Store.character.get(s.title).then(function(考生卡){
    var name = (考生卡 && 考生卡.identity && 考生卡.identity.basicInfo && 考生卡.identity.basicInfo.name) || s.name;
    var charDesc = 考试角色卡(考生卡 || {});
    return LLM.call({
      label: '考生自评',
      system: '你是考生' + name + '。\n\n【你的角色设定】\n' + charDesc,
      prompt: '以下是这场考试的完整情况：你的分数、每位评委给你的评分与评语、以及你的作答。请以你的角色身份，对自己的考试成绩做一次全面自评。\n\n【我的成绩】总分：' + (sc.total||0) + '/' + (sc.full||0) + '，得分率：' + Math.round((sc.ratio||0)*100) + '%，等级：' + (sc.grade||'') + '，名次：第' + (sc.rank||'-') + '名，' + (sc.pass ? '及格' : '不及格') + '\n\n【整套卷子】\n' + 卷面 + '\n\n请从以下几个角度自评（自然成文，不要分条列项，用第一人称）：\n1. 对整体分数的看法：这个成绩是否符合你的预期，满意还是不满\n2. 得分点：哪些题答得好、为什么好\n3. 失分点：哪些题答得不好、失分在哪、下次如何改进\n4. 对评委的看法：对各位评委的评分和评语怎么看，认同或质疑哪些\n5. 自我反思：通过这场考试你对自己有什么新认识'
    });
  }).then(function(reply){
    考试数据.selfReviews[s.key] = { text: reply || '（自评失败）', date: new Date().toISOString() };
    Store.examRoom.save(考试数据.id, 考试数据).catch(function(){});
    考试流程 = 'result';
    var el2 = 考试容器 || document.getElementById('fqViewContent');
    if(el2) 考试成绩页(el2);
    toast('自评完成，已自动保存');
  }).catch(function(err){
    toast('自评失败: ' + err.message);
    考试流程 = 'result';
    var el2 = 考试容器 || document.getElementById('fqViewContent');
    if(el2) 考试成绩页(el2);
  });
};


window.考试重开互评 = function(){
  考试流程 = 'reviewing';
  var el = 考试容器 || document.getElementById('fqViewContent');
  if(el) 渲染问答考试(el);
  考试互评();
};
