window.小说提取生成单个描述 = function(name, userHint) {
  小说提取生成中[name] = true;
  刷新视图();
  toast('⚡ 正在为「' + name + '」生成性爱明细...');

  var c = null;
  小说提取角色列表.forEach(function(r) { if (r.name === name) c = r; });
  if (!c) {
    // 尝试解析为时间线卡名：父角色名-阶段名（阶段数据来自独立文件）
    var dashIdx = name.indexOf('-');
    if (dashIdx > 0) {
      var baseName = name.substring(0, dashIdx);
      var stageNamePart = name.substring(dashIdx + 1);
      小说提取角色列表.forEach(function(r) {
        if (r.name === baseName && 小说提取阶段数据[r.name]) {
          小说提取阶段数据[r.name].forEach(function(s) {
            if (s.name === stageNamePart) {
              // 时间线卡：以父角色完整字段为基础，阶段特有字段覆盖，与普通角色卡字段完全一致
              c = { name: name, _isStage: true, _stageParent: r, _stageData: s };
              小说提取正文段字段.forEach(function(f) {
                c[f] = r[f] !== undefined && r[f] !== null ? r[f] : null;
              });
              if (s.fields) {
                Object.keys(s.fields).forEach(function(f) {
                  if (s.fields[f] !== undefined && s.fields[f] !== null && s.fields[f] !== 'null') c[f] = s.fields[f];
                });
              }
            }
          });
        }
      });
    }
  }
  if (!c) { toast('未找到角色'); delete 小说提取生成中[name]; 刷新视图(); return; }

  var extractedInfo = '';
  var fields = 小说提取正文段字段;
  fields.forEach(function(f) {
    if (c[f] && c[f] !== 'null') {
      extractedInfo += '\n' + f + '：' + (typeof c[f] === 'object' ? JSON.stringify(c[f]) : c[f]);
    }
  });

  var searchName = c._isStage ? c._stageParent.name : c.name;
  // 时间线式全文扫描：收集搜索词 → 扫描50区间 → 提取段落
  var terms = [searchName];
  var src = c._isStage ? c._stageParent : c;
  if (src.aliases && Array.isArray(src.aliases)) {
    src.aliases.forEach(function(a) { if (a && terms.indexOf(a) < 0) terms.push(a); });
  }
  var extra = [];
  terms.forEach(function(t) {
    var m = t.match(/^(.+?)[（(【](.+?)[）)】]$/);
    if (m) { if (m[1] && extra.indexOf(m[1]) < 0) extra.push(m[1]); if (m[2] && extra.indexOf(m[2]) < 0) extra.push(m[2]); }
    if (t.indexOf('·') >= 0) t.split('·').forEach(function(p) { if (p && extra.indexOf(p) < 0) extra.push(p); });
    if (t.indexOf('/') >= 0) t.split('/').forEach(function(p) { if (p && extra.indexOf(p) < 0) extra.push(p); });
  });
  extra.forEach(function(e) { if (terms.indexOf(e) < 0) terms.push(e); });

  var fullText = 小说提取原始文本 || '';
  var 相关段落 = '';
  var ps = 全文锚点段落(fullText, terms, { maxChars: 100000, maxSegs: 50 });
  if (ps.length) {
    相关段落 = ps.map(function(p, i) { return '【段落' + (i+1) + '/' + ps.length + '】\n' + p.text; }).join('\n\n---\n\n');
  }
  // 阶段卡：增加阶段上下文，引导 LLM 聚焦该阶段
  var stageExtra = '';
  if (c._isStage && c._stageData) {
    stageExtra = '\n\n⚠️ 注意：这是【' + c._stageParent.name + '】在【' + c._stageData.name + '】阶段的性爱明细。\n请聚焦于该阶段发生的性经历，突出与其他阶段的区别，不要混入其他人生阶段的信息。\n阶段简述：' + (c._stageData.description || '无') + '\n';
  }

  var hintBlock = userHint ? '\n\n【用户方向】\n' + userHint : '';

  // 仅生成性爱明细（sexualDetailsGen），不复写角色详情
  var _r = renderPrompt('ext_char_sexgen', {
    角色名: c.name,
    提取数据: (extractedInfo || '（无额外提取信息）'),
    相关段落: 相关段落 + stageExtra,
    用户方向: hintBlock,
  });
  LLM.call({
    prompt: _r.user,
    system: _r.system,
    label: '性爱明细生成: ' + c.name,
    temperature: 0.4,
  }).then(function(text) {
    var genList = null;
    try {
      var jsonMatch = text.match(/\{[\s\S]*\}/);
      var data = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      if (data && Array.isArray(data.sexualDetailsGen)) genList = data.sexualDetailsGen;
    } catch(e) { /* skip failed */ }
    delete 小说提取生成中[c.name];
    if (genList) {
      // 直接覆盖回角色数据：普通角色写 sexualDetails 字段；阶段卡写入阶段文件 fields.sexualDetails
      if (c._isStage && c._stageData) {
        c._stageData.fields = c._stageData.fields || {};
        c._stageData.fields.sexualDetails = genList;
        小说提取保存阶段文件(c._stageParent.name, { sourceCharacter: c._stageParent.name, stages: 小说提取阶段数据[c._stageParent.name] });
      } else {
        c.sexualDetails = genList;
        小说提取保存单个角色(c);
      }
      刷新视图();
      toast('✅ 已生成「' + name + '」的性爱明细（' + genList.length + ' 条）');
    } else {
      刷新视图();
      toast('⚠️ 性爱明细生成返回格式异常，请重试');
    }
  }).catch(function() {
    delete 小说提取生成中[c.name];
    刷新视图();
    toast('⚠️ 「' + name + '」性爱明细生成失败');
  });
};

// ===== 填入生成页面 =====
window.小说提取填入生成 = function(name) {
  // 基础数据 = 角色提取字段（来自角色文件，含已覆盖写回的性爱明细）
  // 时间线卡（父角色名-阶段名）：以父角色完整字段为基础 + 阶段特有字段覆盖，字段与普通角色卡完全一致
  var charObj = null;
  小说提取角色列表.forEach(function(c) { if (c.name === name) charObj = c; });
  var isTimelineCard = false;
  if (!charObj) {
    var dashIdx = name.indexOf('-');
    if (dashIdx > 0) {
      var baseName = name.substring(0, dashIdx);
      小说提取角色列表.forEach(function(c) { if (c.name === baseName) charObj = c; });
      if (charObj) isTimelineCard = true;
    }
  }
  if (!charObj) { toast('未找到角色'); return; }

  // 组装填入数据：角色提取字段为基准
  var fillData = {};
  小说提取字段序.forEach(function(f) {
    if (charObj[f] !== undefined && charObj[f] !== null && charObj[f] !== '') fillData[f] = charObj[f];
  });
  // 时间线卡：合并阶段字段到 fillData（阶段特有字段覆盖父角色），使字段完整一致
  if (isTimelineCard) {
    var si = name.indexOf('-');
    var stageParentName = name.substring(0, si);
    var stageNamePart = name.substring(si + 1);
    var stageArr = 小说提取阶段数据[stageParentName] || [];
    stageArr.forEach(function(s) {
      if (s.name === stageNamePart && s.fields) {
        Object.keys(s.fields).forEach(function(f) {
          if (s.fields[f] !== undefined && s.fields[f] !== null && s.fields[f] !== '') fillData[f] = s.fields[f];
        });
        if (s.characterDesc) {
          Object.keys(s.characterDesc).forEach(function(f) {
            if (s.characterDesc[f] !== undefined && s.characterDesc[f] !== null) fillData[f] = s.characterDesc[f];
          });
        }
      }
    });
  }
  fillData.name = name; // 时间线卡用自身名字（父-阶段）

  var _mapGender = (fillData.gender || charObj.gender) === 'beast' ? 'male' : (fillData.gender || charObj.gender);
  if (_mapGender && 角色类别映射[_mapGender]) 角色生成类别 = _mapGender;

  var 别名字段 = Array.isArray(fillData.aliases) ? fillData.aliases.join('、') : (fillData.aliases || '');
  var fullDesc = '角色名：' + (fillData.name || name) +
    '\n性别：' + (fillData.gender || '') +
    '\n角色定位：' + (fillData.role || '') +
    '\n别名：' + 别名字段;
  // 其余字段按标准字段顺序循环拼接（与提取/描述模板一致，标签从字段字典读）
  var 展示顺序 = 小说提取字段序.filter(function(f) { return ['name','aliases','gender','role'].indexOf(f) < 0; });
  展示顺序.forEach(function(f) {
    var v = fillData[f];
    if (v == null || v === '') return;
    var label = (小说提取字段[f] || {}).label || f;
    if (Array.isArray(v)) {
      fullDesc += '\n' + label + '：' + v.join('、');
    } else if (typeof v === 'object') {
      fullDesc += '\n' + label + '：' + JSON.stringify(v);
    } else {
      fullDesc += '\n' + label + '：' + v;
    }
  });

  角色生成描述 = fullDesc;
  角色生成阶段 = 'input';
  角色当前标签 = 'generate';
  渲染角色主面板(document.getElementById('characterContent'));
  toast('✅ 已填入描述，可点击「生成角色」开始生成');
};

// ===== 保存描述字段（通过 data-name/data-field 委托调用） =====
window.小说提取保存描述字段 = function(name, field, value) {
  if (!小说提取角色描述[name]) 小说提取角色描述[name] = {};
  // 数组字段（性爱明细/口头禅/做爱的话等）：按行拆分回写，保持数组结构
  if (小说提取数组字段.indexOf(field) >= 0) {
    var lines = value.split('\n').map(function(x) { return x.trim(); }).filter(Boolean);
    小说提取角色描述[name][field] = lines;
  } else {
    小说提取角色描述[name][field] = value;
  }
  if (小说提取描述保存定时器) clearTimeout(小说提取描述保存定时器);
  小说提取描述保存定时器 = setTimeout(function() {
    try { 小说提取保存当前记录(); } catch(e) { console.warn('描述保存失败:', e); }
  }, 500);
};

