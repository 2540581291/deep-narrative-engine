// 性癖问答 · 考场（文件1/3：全局状态 + 纯函数 + 入口 + 首页 + 创建考场 + 组选人）
// 依赖：Store.examRoom / Store.character / LLM / window.角色卡全部 / window.角色卡身份与外貌

// ===== 全局状态（唯一声明处，其余文件引用） =====
var 考试容器 = null;
var 考试流程 = 'list';                       // list | create | questions | answering | reviewing | result
var 考试数据 = null;                          // 当前考场数据
var 考试筛选 = { major:'', mid:'', item:'', tag:'' };  // 本地四级筛选（不碰题库模块全局）
var 考试草稿 = { name:'', students:[], judges:[], source:'bank', direction:'identity', count:5, questions:[] };
var 考试组性别 = { student:'女性', judge:'女性' };
var 考试展开考生Key = null;
var 考试当前详情考生 = null;
var 考试互评选择 = { rater: '', ratee: '' };

// ===== 纯函数：三档换算 =====
function 考试三档换算(level){ return level === 'good' ? 2 : (level === 'mid' ? 1 : 0); }
function 考试等级(ratio){ return ratio >= 0.66 ? '很好' : (ratio >= 0.33 ? '一般' : '很差'); }
function 考试角色卡(c){ return (typeof window.角色卡全部 === 'function') ? window.角色卡全部(c) : JSON.stringify(c||{}); }

// ===== 入口：按流程分发渲染 =====
function 渲染问答考试(el){
  考试容器 = el || null;
  if(!el) return;
  // 考试时默认以「考官」身份
  问答当前身份 = '考官';
  if(考试流程 === 'create') return 问答考试创建页(el);
  if(考试流程 === 'questions') return 考试选题目页(el);
  if(考试流程 === 'result'){
    if(考试当前详情考生) return 考试考生详情页(el);
    return 考试成绩页(el);
  }
  if(考试流程 === 'answering' || 考试流程 === 'reviewing') return 考试进行页(el);
  考试首页(el);
}
window.渲染问答考试 = 渲染问答考试;

// ===== Step0：首页（创建入口 + 历史列表） =====
function 考试首页(el){
  考试流程 = 'list';
  var h = '<div class="n-card" style="cursor:pointer;padding:16px;text-align:center" onclick="问答考试创建()">'
    + '<span class="fs-24">🏛️</span>'
    + '<div style="font-weight:600;font-size:15px;margin-top:6px">创建考场</div>'
    + '<div class="text-xs text-muted mt-2">分组选择考生与考官，出题考试，考官互评三档打分</div>'
    + '</div>';
  h += '<div id="examRoomList" class="mt-8"></div>';
  el.innerHTML = h;
  Store.examRoom.list().then(function(rooms){
    var listEl = document.getElementById('examRoomList');
    if(!listEl) return;
    if(!rooms || !rooms.length){ listEl.innerHTML = '<div class="fs-11 c-fg3 p-12-0 text-center">暂无考场记录。</div>'; return; }
    var lh = '<div class="fs-12 fw-600 c-fg mb-8">📋 历史考场</div>';
    rooms.forEach(function(r){
      var tag = r.source === 'ai' ? 'AI出题' : '题库抽题';
      var tagColor = r.source === 'ai' ? 'var(--accent)' : 'var(--fg2)';
      lh += '<div class="n-card flex justify-between items-center mb-4 p-8">'
        + '<div><span class="fs-13 fw-600">' + escHtml(r.name || '未命名') + '</span>'
        + ' <span class="fs-10" style="color:' + tagColor + '">' + tag + '</span>'
        + '<div class="fs-10 c-fg3">' + escHtml((r.created || '').slice(0,10)) + '</div></div>'
        + '<button class="btn btn-sm" style="font-size:10px" onclick="问答考试载入历史(\'' + escHtml(r.id || '') + '\')">查看</button>'
        + '</div>';
    });
    listEl.innerHTML = lh;
  }).catch(function(){});
}
window.考试首页 = 考试首页;

window.问答考试载入历史 = function(id){
  Store.examRoom.get(id).then(function(data){
    if(!data){ toast('未找到该考场'); return; }
    考试数据 = data;
    考试流程 = 'result';
    var el = document.getElementById('fqViewContent');
    if(el) 渲染问答考试(el);
  });
};

// ===== Step1：创建考场（考场名 + 考生/考官分组选人） =====

function 问答考试创建(){
  考试流程 = 'create';
  考试草稿 = { name:'', students:[], judges:[], source:'bank', direction:'identity', count:5, questions:[] };
  考试组性别 = { student:'女性', judge:'女性' };
  var el = 考试容器 || document.getElementById('fqViewContent');
  if(el) 渲染问答考试(el);
}
window.问答考试创建 = 问答考试创建;
window.fqExamCreate = window.问答考试创建;

function 问答考试创建页(el){
  var h = '<div class="n-card" style="max-width:760px;margin:0 auto;padding:20px">'
    + '<h3 style="font-size:15px;margin-bottom:8px">🏛️ 创建考场</h3>'
    + '<div class="form-group"><label>考场名称</label>'
    + '<div class="flex gap-4 items-center">'
    + '<span class="fs-13 c-fg2" id="examNameDisplay">' + (考试草稿.name ? escHtml(考试草稿.name) : '（未生成）') + '</span>'
    + '<button class="btn btn-sm" style="font-size:11px" onclick="考试生成名称()">🎲 AI 生成考场名</button>'
    + '</div></div>';
  // 考生 + 考官两组
  h += '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px">';
  h += 考试组面板('student', '👨‍🎓 考生（必选）', 考试草稿.students);
  h += 考试组面板('judge', '⚖️ 考官（必选）', 考试草稿.judges);
  h += '</div>';
  h += '<div style="display:flex;gap:6px;margin-top:14px">'
    + '<button class="btn w-100" onclick="考试下一步选题目()">下一步：选题目 →</button>'
    + '<button class="btn-secondary btn-sm" onclick="问答考试显示()">← 返回</button></div>'
    + '</div>';
  el.innerHTML = h;
  // 回填两组已选
  考试组渲染已选('student');
  考试组渲染已选('judge');
}

// AI 生成考场名（根据考生/考官角色）
// 组装参与者信息（名字 + 考生/考官身份 + 角色卡身份与外貌），供考场名生成使用
function 考试组装参与者信息(){
  var parts = [];
  var tasks = [];
  function 推(title, role){
    tasks.push(Store.character.get(title).then(function(卡){
      var 身份 = (typeof window.角色卡身份与外貌 === 'function') ? window.角色卡身份与外貌(卡 || {}) : '';
      var name = (卡 && 卡.identity && 卡.identity.basicInfo && 卡.identity.basicInfo.name) || title;
      parts.push('【' + name + '】（' + role + '）身份：' + (身份 || '未知'));
    }).catch(function(){
      parts.push('【' + title + '】（' + role + '）身份：未知');
    }));
  }
  考试草稿.students.forEach(function(t){ 推(t, '考生'); });
  考试草稿.judges.forEach(function(t){ 推(t, '考官'); });
  return Promise.all(tasks).then(function(){ return parts.join('\n'); });
}

window.考试生成名称 = function(){
  if(!考试草稿.students.length && !考试草稿.judges.length){ toast('请先选择考生或考官'); return; }
  var nameEl = document.getElementById('examNameDisplay');
  if(nameEl) nameEl.innerHTML = '⏳ 生成中...';
  考试组装参与者信息().then(function(参与者信息){
    LLM.call({
      label: '考场名生成',
      system: '你是一个性癖问答考场起名专家。输出一个贴切有趣的考场名称，只输出名称本身，不要引号和其他文字。',
      prompt: '考场参与者信息：\n' + 参与者信息 + '\n\n请为这场性癖考试起一个名称（2-8字，可带一点情色暗示，风格不限）。'
    }).then(function(name){
      name = (name || '').trim().replace(/["""'']/g, '').slice(0, 20);
      if(!name){ toast('生成失败'); if(nameEl) nameEl.innerHTML = '（未生成）'; return; }
      考试草稿.name = name;
      if(nameEl) nameEl.innerHTML = escHtml(name);
    }).catch(function(err){
      toast('生成失败: ' + err.message);
      if(nameEl) nameEl.innerHTML = '（未生成）';
    });
  });
};
window.fqExamName = window.考试生成名称;

function 考试组面板(role, title, selected){
  var 性别映射 = { '女性':'👩', '男性':'👨', '伪娘':'👘', '扶她':'⚧' };
  var g = 考试组性别[role];
  var h = '<div class="n-card" style="flex:1;min-width:280px;padding:14px">'
    + '<div class="fs-13 fw-600 c-fg mb-8">' + title + '</div>'
    + '<div class="filter-row" style="margin-bottom:8px">';
  Object.keys(性别映射).forEach(function(gg){
    var sel = g === gg;
    h += '<span class="filter-chip' + (sel ? ' act' : '') + '" onclick="考试组设性别(\'' + role + '\',\'' + gg + '\')">' + 性别映射[gg] + gg + '</span>';
  });
  h += '</div><div id="examGroup_' + role + '" style="max-height:260px;overflow-y:auto"></div>'
    + '<div class="fs-10 c-fg3 mt-6" id="examGroupCount_' + role + '">已选 0 人</div></div>';
  return h;
}

window.考试组设性别 = function(role, g){
  考试组性别[role] = g;
  考试组渲染角色(role);
};

function 考试组渲染角色(role){
  var el = document.getElementById('examGroup_' + role);
  var cntEl = document.getElementById('examGroupCount_' + role);
  if(!el) return;
  var g = 考试组性别[role];
  Store.character.list().then(function(items){
    var 性别映射 = { '女性':'👩', '男性':'👨', '伪娘':'👘', '扶她':'⚧' };
    var filtered = (items || []).filter(function(item){
      var gg = item.identity && item.identity.basicInfo && item.identity.basicInfo.gender;
      return gg === g;
    });
    var selected = role === 'student' ? 考试草稿.students : 考试草稿.judges;
    var h = '';
    if(!filtered.length){ h = '<div class="fs-11 c-fg3 text-center p-12-0">该性别下暂无角色。</div>'; }
    else {
      filtered.forEach(function(item){
        var bi = item.identity && item.identity.basicInfo || {};
        var name = bi.name || item.name || item.title || '未命名';
        var title = item.title || '';
        var checked = selected.indexOf(title) >= 0;
        h += '<label style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:12px;cursor:pointer">'
          + '<input type="checkbox" class="exam-pick-cb" data-role="' + role + '" value="' + escHtml(title) + '"' + (checked ? ' checked' : '') + '>'
          + '<span>' + (bi.icon || '👤') + ' ' + escHtml(name) + '</span>'
          + (bi.title ? ' <span class="fs-10 c-fg3">' + escHtml(bi.title) + '</span>' : '')
          + '</label>';
      });
    }
    el.innerHTML = h;
    if(cntEl) cntEl.innerHTML = '已选 ' + selected.length + ' 人';
    // 绑定勾选
    el.querySelectorAll('.exam-pick-cb').forEach(function(cb){
      cb.addEventListener('change', function(){ 考试组勾选(role, this.value, this.checked); });
    });
  });
}
window.考试组渲染角色 = 考试组渲染角色;

function 考试组渲染已选(role){
  考试组渲染角色(role);
}

window.考试组勾选 = function(role, title, checked){
  var arr = role === 'student' ? 考试草稿.students : 考试草稿.judges;
  var otherRole = role === 'student' ? 'judge' : 'student';
  var otherArr = otherRole === 'student' ? 考试草稿.students : 考试草稿.judges;
  var idx = arr.indexOf(title);
  if(checked && idx < 0){
    arr.push(title);
    // 跨组互斥：从另一组移除
    var oidx = otherArr.indexOf(title);
    if(oidx >= 0) otherArr.splice(oidx, 1);
  } else if(!checked && idx >= 0){
    arr.splice(idx, 1);
  }
  考试组渲染已选(role);
  考试组渲染已选(otherRole);
};

window.考试下一步选题目 = function(){
  if(!考试草稿.students.length){ toast('请至少选择一名考生'); return; }
  if(!考试草稿.judges.length){ toast('请至少选择一名考官'); return; }
  if(!考试草稿.name){
    toast('正在生成考场名称...');
    考试生成名称后进入();
    return;
  }
  考试流程 = 'questions';
  var el = 考试容器 || document.getElementById('fqViewContent');
  if(el) 渲染问答考试(el);
};

// 先生成名称，成功后进入选题页
function 考试生成名称后进入(){
  考试组装参与者信息().then(function(参与者信息){
    LLM.call({
      label: '考场名生成',
      system: '你是一个性癖问答考场起名专家。输出一个贴切有趣的考场名称，只输出名称本身，不要引号和其他文字。',
      prompt: '考场参与者信息：\n' + 参与者信息 + '\n\n请为这场性癖考试起一个名称（2-8字，可带一点情色暗示，风格不限）。'
    }).then(function(name){
      name = (name || '').trim().replace(/["""'']/g, '').slice(0, 20);
      if(!name) name = '性癖考场';
      考试草稿.name = name;
      考试流程 = 'questions';
      var el = 考试容器 || document.getElementById('fqViewContent');
      if(el) 渲染问答考试(el);
    }).catch(function(){
      考试草稿.name = '性癖考场';
      考试流程 = 'questions';
      var el = 考试容器 || document.getElementById('fqViewContent');
      if(el) 渲染问答考试(el);
    });
  }).catch(function(){
    考试草稿.name = '性癖考场';
    考试流程 = 'questions';
    var el = 考试容器 || document.getElementById('fqViewContent');
    if(el) 渲染问答考试(el);
  });
}

window.问答考试显示 = function(){
  考试流程 = 'list';
  考试数据 = null;
  var el = document.getElementById('fqViewContent');
  if(el) 渲染问答考试(el);
};
window.fqExamBack = window.问答考试显示;
