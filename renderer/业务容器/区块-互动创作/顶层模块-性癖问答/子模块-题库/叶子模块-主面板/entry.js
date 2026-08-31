// 性癖问答 · 题库（四级标签平铺联动：大类 → 中类 → 小类 → 细类，每级含"全部"，下级默认全部展示）

// 四级当前选中状态（'' 表示该级为"全部"）
var 题库四级 = { major:'', mid:'', item:'', tag:'' };

function 渲染题库(el){
  var h='<div style="display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap;justify-content:space-between">'
    +'<div class="flex gap-4 flex-wrap">'
    +'<span class="btn-sm bg-accent" onclick="fqBankShowAdd()">＋ 添加题目</span>'
    +'<span class="text-xs text-muted" style="align-self:center">四级标签：大类 → 中类 → 小类 → 细类</span>'
    +'</div></div><div id="fqBankContent"></div>';
  el.innerHTML=h;
  题库刷新();
}

// ===== 获取各级的可选项（上级为"全部"时聚合全部下级，保证默认展示） =====

// 当前大类的下级中类（大类=全部 → 聚合所有大类下的中类，去重）
function 题库当前中类(){
  if(题库四级.major){
    var md=标签层级数据[题库四级.major]||{};
    return Object.keys(md.mids||{});
  }
  var seen={},out=[];
  Object.keys(标签层级数据).forEach(function(ma){
    var md=标签层级数据[ma]||{};
    Object.keys(md.mids||{}).forEach(function(mi){if(!seen[mi]){seen[mi]=1;out.push(mi);}});
  });
  return out;
}
// 当前中类的下级小类（中类=全部 → 聚合范围内所有小类，去重）
function 题库当前小类(){
  if(题库四级.mid){
    var md=标签层级数据[题库四级.major||'']||{};
    var midv=(md.mids||{})[题库四级.mid]||{};
    return Object.keys(midv.items||{});
  }
  var seen={},out=[];
  var majors=题库四级.major?[题库四级.major]:Object.keys(标签层级数据);
  majors.forEach(function(ma){
    var md=标签层级数据[ma]||{};
    Object.keys(md.mids||{}).forEach(function(mi){
      Object.keys((md.mids[mi].items)||{}).forEach(function(it){if(!seen[it]){seen[it]=1;out.push(it);}});
    });
  });
  return out;
}
// 当前小类的下级细类（小类=全部 → 聚合范围内所有细类，去重）
function 题库当前细类(){
  if(题库四级.item){
    var md=标签层级数据[题库四级.major||'']||{};
    var midv=(md.mids||{})[题库四级.mid||'']||{};
    var itv=(midv.items||{})[题库四级.item]||{};
    return itv.tags||[];
  }
  var seen={},out=[];
  var majors=题库四级.major?[题库四级.major]:Object.keys(标签层级数据);
  majors.forEach(function(ma){
    var md=标签层级数据[ma]||{};
    Object.keys(md.mids||{}).forEach(function(mi){
      Object.keys(md.mids[mi].items||{}).forEach(function(it){
        (md.mids[mi].items[it].tags||[]).forEach(function(t){if(!seen[t]){seen[t]=1;out.push(t);}});
      });
    });
  });
  return out;
}

// ===== 点击下级时自动定位上级（上级为"全部"时找到第一个包含它的路径） =====

function 题库定位中类(mid){
  if(!题库四级.major){
    var majors=Object.keys(标签层级数据);
    for(var i=0;i<majors.length;i++){
      var md=标签层级数据[majors[i]]||{};
      if((md.mids||{})[mid]){题库四级.major=majors[i];break;}
    }
  }
}
function 题库定位小类(it){
  if(!题库四级.mid){
    var majors=题库四级.major?[题库四级.major]:Object.keys(标签层级数据);
    for(var i=0;i<majors.length;i++){
      var md=标签层级数据[majors[i]]||{};
      var mks=Object.keys(md.mids||{});
      for(var j=0;j<mks.length;j++){
        if(((md.mids[mks[j]].items)||{})[it]){题库四级.major=majors[i];题库四级.mid=mks[j];return;}
      }
    }
  }
}
function 题库定位细类(t){
  if(!题库四级.item){
    var majors=题库四级.major?[题库四级.major]:Object.keys(标签层级数据);
    for(var i=0;i<majors.length;i++){
      var md=标签层级数据[majors[i]]||{};
      var mks=Object.keys(md.mids||{});
      for(var j=0;j<mks.length;j++){
        var iks=Object.keys((md.mids[mks[j]].items)||{});
        for(var k=0;k<iks.length;k++){
          var tags=(md.mids[mks[j]].items[iks[k]].tags||[]);
          if(tags.indexOf(t)>=0){题库四级.major=majors[i];题库四级.mid=mks[j];题库四级.item=iks[k];return;}
        }
      }
    }
  }
}

// 选择大类：选中具体大类时下级重置为"全部"
window.题库选择大类 = function(m){
  题库四级.major=m;题库四级.mid='';题库四级.item='';题库四级.tag='';
  题库刷新();
};
// 选择中类：若上级为"全部"，自动定位到包含它的第一个大类
window.题库选择中类 = function(m){
  if(!m){题库四级.mid='';题库四级.item='';题库四级.tag='';题库刷新();return;}
  题库定位中类(m);题库四级.mid=m;题库四级.item='';题库四级.tag='';题库刷新();
};
// 选择小类
window.题库选择小类 = function(it){
  if(!it){题库四级.item='';题库四级.tag='';题库刷新();return;}
  题库定位小类(it);题库四级.item=it;题库四级.tag='';题库刷新();
};
// 选择细类
window.题库选择细类 = function(t){
  if(!t){题库四级.tag='';题库刷新();return;}
  题库定位细类(t);题库四级.tag=t;题库刷新();
};

// 收集题目：根据四级选择（''=全部不过滤）汇总题目
function 题库收集题目(){
  var qs=[];
  if(typeof 题库内容数据==='undefined')return qs;
  var majors=题库四级.major?[题库四级.major]:Object.keys(题库内容数据);
  majors.forEach(function(ma){
    var md=题库内容数据[ma]||{};
    var mids=题库四级.mid?[题库四级.mid]:Object.keys(md.mids||{});
    mids.forEach(function(mi){
      var midv=(md.mids||{})[mi]||{};
      var items=题库四级.item?[题库四级.item]:Object.keys(midv.items||{});
      items.forEach(function(it){
        var itv=(midv.items||{})[it]||{};
        (itv.questions||[]).forEach(function(q){
          if(!题库四级.tag||q.detail===题库四级.tag)qs.push(q);
        });
      });
    });
  });
  return qs;
}

function 题库刷新(){
  var el=document.getElementById('fqBankContent');if(!el)return;
  var h='';

  var majors=Object.keys(标签层级数据);
  var mids=题库当前中类();
  var items=题库当前小类();
  var tags=题库当前细类();

  // ===== 第一行：大类 =====
  h+='<div class="filter-row" style="margin-bottom:6px">';
  h+='<span class="filter-label">大类</span>';
  var majorAct=!题库四级.major;
  h+='<span class="filter-chip'+(majorAct?' act':'')+'" onclick="题库选择大类(\'\')">全部</span>';
  majors.forEach(function(m){
    var md=标签层级数据[m]||{};
    var act=题库四级.major===m;
    h+='<span class="filter-chip'+(act?' act':'')+'" onclick="题库选择大类(\''+escHtml(m)+'\')">'+escHtml(md.label||m)+'</span>';
  });
  h+='</div>';

  // ===== 第二行：中类（上级未选时默认显示全部中类） =====
  h+='<div class="filter-row" style="margin-bottom:6px">';
  h+='<span class="filter-label">中类</span>';
  h+='<span class="filter-chip'+(!题库四级.mid?' act':'')+'" onclick="题库选择中类(\'\')">全部</span>';
  if(!mids.length){h+='<span class="text-xs text-muted" style="margin-left:4px">（无中类）</span>';}
  else{mids.forEach(function(mid){
    var md=标签层级数据[题库四级.major||'']||{};
    var midv=((md.mids||{})[mid])||{};
    var label=midv.label;
    if(label===undefined&&!题库四级.major){
      // 大类为全部时，从中类键所在的任意大类取 label
      Object.keys(标签层级数据).some(function(ma){
        var mv=(标签层级数据[ma].mids||{})[mid];
        if(mv){label=mv.label;return true;}
        return false;
      });
    }
    var act=题库四级.mid===mid;
    h+='<span class="filter-chip'+(act?' act':'')+'" onclick="题库选择中类(\''+escHtml(mid)+'\')">'+escHtml(label||mid)+'</span>';
  });}
  h+='</div>';

  // ===== 第三行：小类（上级未选时默认显示全部小类） =====
  h+='<div class="filter-row" style="margin-bottom:6px">';
  h+='<span class="filter-label">小类</span>';
  h+='<span class="filter-chip'+(!题库四级.item?' act':'')+'" onclick="题库选择小类(\'\')">全部</span>';
  if(!items.length){h+='<span class="text-xs text-muted" style="margin-left:4px">（无小类）</span>';}
  else{items.forEach(function(it){
    var md=标签层级数据[题库四级.major||'']||{};
    var midv=(md.mids||{})[题库四级.mid||'']||{};
    var itv=(midv.items||{})[it]||{};
    var label=itv.label;
    if(label===undefined&&!题库四级.mid){
      Object.keys(标签层级数据).some(function(ma){
        return Object.keys((标签层级数据[ma].mids||{})).some(function(mi){
          var mv=(标签层级数据[ma].mids[mi].items||{})[it];
          if(mv){label=mv.label;return true;}
          return false;
        });
      });
    }
    var act=题库四级.item===it;
    h+='<span class="filter-chip'+(act?' act':'')+'" onclick="题库选择小类(\''+escHtml(it)+'\')">'+escHtml(label||it)+'</span>';
  });}
  h+='</div>';

  // ===== 第四行：细类（上级未选时默认显示全部细类） =====
  h+='<div class="filter-row" style="margin-bottom:10px">';
  h+='<span class="filter-label">细类</span>';
  h+='<span class="filter-chip'+(!题库四级.tag?' act':'')+'" onclick="题库选择细类(\'\')">全部</span>';
  if(!tags.length){h+='<span class="text-xs text-muted" style="margin-left:4px">（无细类选项）</span>';}
  else{tags.forEach(function(t){
    var act=题库四级.tag===t;
    h+='<span class="filter-chip'+(act?' act':'')+'" onclick="题库选择细类(\''+escHtml(t)+'\')">'+escHtml(t)+'</span>';
  });}
  h+='</div>';

  h+='<div style="border-top:1px solid var(--border);padding-top:8px;font-size:11px;color:var(--fg2)">当前选中：'
    +escHtml((标签层级数据[题库四级.major]||{}).label||'全部')
    +' / '+escHtml((((标签层级数据[题库四级.major||'']||{}).mids||{})[题库四级.mid]||{}).label||'全部')
    +' / '+escHtml((((((标签层级数据[题库四级.major||'']||{}).mids||{})[题库四级.mid||'']||{}).items||{})[题库四级.item]||{}).label||'全部')
    +' / '+escHtml(题库四级.tag||'全部')+'</div>';

  // 题目列表：根据四级选择汇总
  h+=题库渲染题目列表();

  el.innerHTML=h;
}

// 渲染当前选中范围下的题目列表
function 题库渲染题目列表(){
  var qs=题库收集题目();
  // 缓存当前列表，点击题目时按索引取完整对象
  window._fqCurQuestions = qs;
  var h='<div style="margin-top:10px">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
    +'<span style="font-size:12px;font-weight:600">📝 题目（'+qs.length+'）</span>'
    +'<span class="btn-sm btn-secondary" style="font-size:10px" onclick="fqBankShowAdd()">＋ 添加题目</span></div>';
  if(!qs.length){
    h+='<div class="text-xs text-muted" style="padding:10px;background:var(--bg2);border:1px dashed var(--border);border-radius:6px">该分类下暂无题目，点击「＋ 添加题目」新建。</div>';
  }else{
    h+='<div style="display:flex;flex-direction:column;gap:4px">';
    qs.forEach(function(q,qi){
      h+='<div class="n-card cur-ptr" style="padding:8px 10px;display:flex;justify-content:space-between;align-items:center;cursor:pointer" onclick="题库提问弹出('+qi+')" title="点击选择角色来回答这道题">';
      h+='<div style="flex:1"><span class="fw-600 fs-13">'+(qi+1)+'. '+escHtml(q.q)+'</span>';
      if(q.options&&q.options.length){h+='<div class="text-xs text-muted" style="margin-top:2px">选项：'+q.options.map(function(o){return escHtml(o);}).join(' / ')+'</div>';}
      if(q.detail){h+='<span class="text-xs" style="margin-left:6px;color:var(--accent2)">['+escHtml(q.detail)+']</span>';}
      h+='</div>';
      h+='<span style="font-size:9px;padding:1px 6px;border-radius:3px;'+(q.type==='erotic'?'background:var(--accent-dim);color:var(--accent)':'background:var(--bg2);color:var(--fg3)')+'">'+escHtml(q.type==='erotic'?'色情':'正常')+'</span>';
      h+='<span style="font-size:11px;color:var(--accent);margin-left:6px;flex-shrink:0">🎤 问TA</span>';
      h+='</div>';
    });
    h+='</div>';
  }
  h+='</div>';
  return h;
}

// ===== 点击题目 → 弹出选角色（与"导入角色卡"一致：先性别 → 再选角色） =====
var 题库当前提问索引 = -1;

// 第一步：弹 4 个性别选择
window.题库提问弹出 = function(idx){
  var qs=window._fqCurQuestions||[];
  var q=qs[idx];
  if(!q){toast('题目不存在');return;}
  题库当前提问索引 = idx;
  var sel = '<div class="mcard" style="max-width:360px"><h3 style="font-size:14px;margin-bottom:8px">🎤 选择回答角色</h3>' +
    '<div style="font-size:11px;color:var(--fg2);margin-bottom:10px">题目：' + escHtml(q.q) + '</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
    '<button class="btn-main" onclick="this.closest(\'.ovl\').remove();题库提问选性别(\'女性\')">女性</button>' +
    '<button class="btn-main bg-accent2" onclick="this.closest(\'.ovl\').remove();题库提问选性别(\'伪娘\')">伪娘</button>' +
    '<button class="btn-main" onclick="this.closest(\'.ovl\').remove();题库提问选性别(\'扶她\')" style="background:#e94560">扶她</button>' +
    '<button class="btn-main" onclick="this.closest(\'.ovl\').remove();题库提问选性别(\'男性\')" style="background:#6bc">男性</button></div>' +
    '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button></div>';
  var ov = document.createElement('div');
  ov.className = 'ovl'; ov.innerHTML = sel;
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
};

// 第二步：按性别列出角色
window.题库提问选性别 = function(gender){
  Store.character.list().then(function(items) {
    var _genderMap = { 'female': '女性', 'male': '男性', 'femboy': '伪娘', 'futa': '扶她', 'beast': '男性' };
    var h = '<div class="mcard" style="max-width:500px;max-height:500px;overflow-y:auto">';
    h += '<h3 style="font-size:14px;margin-bottom:10px">📂 选择 ' + gender + ' 角色回答</h3>';
    if (!items || !items.length) {
      h += '<div class="placeholder-text">暂无角色卡数据，请先在角色卡模块创建角色</div>';
    } else {
      items.forEach(function(c) {
        var bi = c.identity && c.identity.basicInfo || {};
        var cg = _genderMap[bi.gender] || bi.gender;
        if (cg !== gender) return;
        var name = bi.name || c.title || '';
        h += '<div class="n-card cur-ptr" style="cursor:pointer;margin-bottom:4px;padding:8px" data-char-name="' + escHtml(name) + '">';
        h += '<div class="fw-600 fs-13">' + escHtml(name || '未命名') + (bi.age ? ' <span class="text-muted" style="font-weight:400;font-size:11px">' + bi.age + '岁</span>' : '') + '</div>';
        h += (bi.title ? '<div class="text-muted text-sm" style="font-size:11px;color:var(--fg2);margin-top:2px">' + escHtml(bi.title) + '</div>' : '');
        h += '</div>';
      });
    }
    h += '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:8px">';
    h += '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button></div></div>';

    var ov = document.createElement('div');
    ov.className = 'ovl';
    ov.innerHTML = h;
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });

    ov.querySelectorAll('.n-card[data-char-name]').forEach(function(card) {
      card.addEventListener('click', function() {
        var name = this.getAttribute('data-char-name');
        ov.remove();
        Store.character.get(name).then(function(data) {
          if (!data) { toast('角色数据不存在'); return; }
          题库提问开始(data, name);
        });
      });
    });
  })
    .catch(function(err) { console.error("[题库] 读取角色卡失败:", err); toast("读取角色卡失败"); });
};

// 第三步：设置问答状态，用该角色回答这道题（"我来出题"模式，自动发送给 AI）
function 题库提问开始(charData, name){
  var qs=window._fqCurQuestions||[];
  var q=qs[题库当前提问索引]||{q:'',options:[],type:'normal',detail:''};
  问答角色 = charData;
  问答角色.name = 问答角色.name || 问答角色.title || name;
  问答日志 = [];
  问答当前索引 = 0;
  问答模式 = 'user'; // 我来出题：用户出题、角色回答
  问答题目集 = null;
  // 创建新会话（支持多条历史，不覆盖）
  问答会话 = { id:'quiz_' + Date.now() + '_' + Math.floor(Math.random()*1000), character: 问答角色.name, charData: JSON.parse(JSON.stringify(charData)), log: 问答日志, date: new Date().toISOString() };
  问答当前视图='quiz';
  问答切换视图('quiz');
  // 自动把这道题发送给角色 AI，让它立刻开始回答
  if(typeof 问答发送问题 === 'function'){
    问答发送问题(q.q);
  }else{
    toast('🎤 '+escHtml(问答角色.name)+' 回答：'+escHtml(q.q));
  }
}
window.题库提问开始 = 题库提问开始;

window.题库刷新=题库刷新;
window.fqBankRefresh = window.题库刷新;

// 添加题目
function fqBankShowAdd(){
  var el=document.getElementById('fqBankContent');if(!el)return;
  var h='<div class="n-card" style="max-width:500px;margin:0 auto;padding:16px">'
    +'<h3 class="fs-15 mb-8">＋ 添加题目</h3>'
    +'<div class="form-group"><label>题目文本</label><input class="llm-input" id="fqNewQ" placeholder="如：你自慰的频率是？"></div>'
    +'<div class="form-group"><label>选项（用逗号分隔）</label><input class="llm-input" id="fqNewOptions" placeholder="如：每天,每周,偶尔"></div>'
    +'<div class="form-group"><label>四级标签（大类,中类,小类,细类）</label><input class="llm-input" id="fqNewTags" placeholder="如：自慰行为,龟头,频率,每天"></div>'
    +'<div class="flex gap-4 mt-4"><button class="btn" onclick="fqBankDoAdd()">✅ 保存</button>'
    +'<button class="btn-secondary btn-sm" onclick="题库刷新()">← 取消</button></div></div>';
  el.innerHTML=h;
}
window.fqBankShowAdd=fqBankShowAdd;

function fqBankDoAdd(){
  var q=document.getElementById('fqNewQ');var opts=document.getElementById('fqNewOptions');
  var tagsEl=document.getElementById('fqNewTags');
  if(!q||!q.value.trim()){toast('请输入题目');return;}
  var tags=(tagsEl?tagsEl.value.split(/[,，]/):[]).map(function(s){return s.trim();}).filter(Boolean);
  Store.fetishBank.save('q_'+Date.now(),{
    q:q.value.trim(),options:(opts?opts.value.split(/[,，]/):[]).map(function(s){return s.trim();}).filter(Boolean),
    category:tags[1]||'',type:'normal',tags:tags,id:'q_'+Date.now()
  }).then(function(){toast('已添加');题库刷新();});
}
window.fqBankDoAdd=fqBankDoAdd;

function resetFetishBank(){
  Store.fetishBank.list().then(function(items){
    if(!items||!items.length){toast('题库已空');return;}
    Promise.all(items.map(function(item){return Store.fetishBank.delete(item.id);}))
      .then(function(){toast('题库已重置');});
  });
}
window.resetFetishBank=resetFetishBank;
