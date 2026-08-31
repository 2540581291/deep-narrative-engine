// 系列写作 · 章节 AI 字段注册

  registerAiField('XL_ovCharSingle', '概览角色生成', function() {
    if (!swActiveSeries) return '请先保存系列';
    return Store.seriesWriting.get(swActiveSeries).then(function(m) {
      m = m || {};
      var editIdx = typeof _XLBodyEditIdx !== 'undefined' ? _XLBodyEditIdx : 0;
      var domsLen = m.doms ? m.doms.length : 0;
      var targetKey = editIdx < domsLen ? 'doms' : 'subs';
      var idx = editIdx < domsLen ? editIdx : editIdx - domsLen;
      var charData = (m[targetKey] && m[targetKey][idx]) ? m[targetKey][idx] : {};

      window._XLCharSnap = { title: swActiveSeries, key: targetKey, idx: idx };

      var ctx = '';
      if (m.premise) ctx += '故事设定：' + m.premise + '\n';
      if (m.genreTags && m.genreTags.length) ctx += '题材：' + m.genreTags.join('、') + '\n';
      if (m.playTags && m.playTags.length) ctx += '玩法：' + m.playTags.join('、') + '\n';
      if (targetKey === 'doms') {
        var 其他调教者 = m.doms.map(function(d) { return (d.identity && d.identity.basicInfo && d.identity.basicInfo.name) || d.name; }).filter(function(n) { return n && n !== ((charData.identity && charData.identity.basicInfo && charData.identity.basicInfo.name) || charData.name); });
        if (其他调教者.length) ctx += '\n其他调教者：' + 其他调教者.join('、') + '\n';
      }
      if (targetKey === 'subs') {
        var 其他被调教者 = m.subs.map(function(d) { return (d.identity && d.identity.basicInfo && d.identity.basicInfo.name) || d.name; }).filter(function(n) { return n && n !== ((charData.identity && charData.identity.basicInfo && charData.identity.basicInfo.name) || charData.name); });
        if (其他被调教者.length) ctx += '\n其他被调教者：' + 其他被调教者.join('、') + '\n';
      }
      if (m.subs && m.subs.length && targetKey !== 'subs') {
        var 被调教者名单 = m.subs.map(function(d) { return (d.identity && d.identity.basicInfo && d.identity.basicInfo.name) || d.name; }).filter(function(n) { return n; });
        if (被调教者名单.length) ctx += '被调教者：' + 被调教者名单.join('、') + '\n';
      }
      if (m.doms && m.doms.length && targetKey !== 'doms') {
        var 调教者名单 = m.doms.map(function(d) { return (d.identity && d.identity.basicInfo && d.identity.basicInfo.name) || d.name; }).filter(function(n) { return n; });
        if (调教者名单.length) ctx += '调教者：' + 调教者名单.join('、') + '\n';
      }

      var targetRole = targetKey === 'doms' ? '调教者' : '被调教者';
      var targetGender = (charData.identity && charData.identity.basicInfo && charData.identity.basicInfo.gender) || charData.gender || '';
      var r = renderPrompt('ov_char_single', { ctx: ctx, charJson: JSON.stringify(charData, null, 2), targetRole: targetRole, targetGender: targetGender });
      return { user: r.user, system: r.system };
    });
  }, { fillFn: function(d) {
    try {
      if (!d || !d.identity) { toast('AI 返回异常'); return; }
      var snap = window._XLCharSnap || {};
      var targetTitle = snap.title || swActiveSeries;
      var targetKey = snap.key || 'doms';
      var idx = snap.idx || 0;
      Store.seriesWriting.get(targetTitle).then(function(m) {
        m = m || {};
        if (m[targetKey] && m[targetKey][idx]) {
          var existing = m[targetKey][idx];
          if (!existing.identity) existing.identity = {};
          ['basicInfo','background','experience'].forEach(function(s) {
            if (d.identity[s] && typeof d.identity[s] === 'object') {
              if (!existing.identity[s]) existing.identity[s] = {};
              for (var k in d.identity[s]) { existing.identity[s][k]=d.identity[s][k]; }
            }
          });
          Store.seriesWriting.save(targetTitle, m).then(function() {
            var name=(existing.identity&&existing.identity.basicInfo&&existing.identity.basicInfo.name)||'';
            toast('角色已生成：' + name);
            if (targetTitle===swActiveSeries) {
              var tabEl = document.getElementById('XLOutlineTabContent');
              if (tabEl && typeof XLRenderOverview === 'function') XLRenderOverview(tabEl);
            }
          });
        } else {
          toast('角色已生成（但索引变化，数据已保存到 Store）');
          Store.seriesWriting.save(targetTitle, m);
        }
      });
    } catch(e) { toast('AI 生成失败: ' + e.message); }
  }});
  registerAiField('XL_charBodyAiGen', '角色卡 AI 生成', function() {
    if (!swActiveSeries) return '请先保存系列';
    window._XLCharBodySnap = { title: swActiveSeries, editIdx: typeof _XLBodyEditIdx !== 'undefined' ? _XLBodyEditIdx : 0 };
    return Store.seriesWriting.get(swActiveSeries).then(function(m) {
      m = m || {};
      var snap = window._XLCharBodySnap || {};
      var editIdx = snap.editIdx || 0;
      var domsLen = m.doms ? m.doms.length : 0;
      var targetKey = editIdx < domsLen ? 'doms' : 'subs';
      var idx = editIdx < domsLen ? editIdx : editIdx - domsLen;
      var charData = (m[targetKey] && m[targetKey][idx]) ? m[targetKey][idx] : {};
      var gender = (charData.identity && charData.identity.basicInfo && charData.identity.basicInfo.gender) || charData.gender || '女性';

      var ctx = '';
      if (m.doms && m.doms.length) ctx += '已有调教者：' + m.doms.map(function(d) { return (d.identity && d.identity.basicInfo && d.identity.basicInfo.name) || d.name || '?'; }).join('、') + '\n';
      if (m.subs && m.subs.length) ctx += '已有被调教者：' + m.subs.map(function(d) { return (d.identity && d.identity.basicInfo && d.identity.basicInfo.name) || d.name || '?'; }).join('、') + '\n';
      if (m.premise) ctx += '故事设定：' + m.premise + '\n';
      if (m.genreTags && m.genreTags.length) ctx += '题材：' + m.genreTags.join('、') + '\n';
      if (m.playTags && m.playTags.length) ctx += '玩法：' + m.playTags.join('、') + '\n';
      ctx += '\n当前选中角色：' + JSON.stringify(charData, null, 2) + '\n';

      var tmplMap = { '女性': 'FEMALE_CHARACTER_TEMPLATE', '男性': 'MALE_CHARACTER_TEMPLATE', '扶她': 'FUTA_CHARACTER_TEMPLATE', '伪娘': 'FEMBOY_CHARACTER_TEMPLATE' };
      var tmpl = window[tmplMap[gender] || 'FEMALE_CHARACTER_TEMPLATE'];
      var sample = '{\n' + (window.buildSampleJSON ? window.buildSampleJSON(tmpl, 0, 3) : '') + '\n}';
      var r = renderPrompt('char_body_gen', { ctx: ctx, gender: gender, sample: sample });
      return { user: r.user, system: r.system };
    });
  }, { fillFn: function(d) {
    try {
      if (!d) { toast('AI 返回异常'); return; }
      var snap = window._XLCharBodySnap || {};
      var target = snap.title || swActiveSeries;
      var editIdx = snap.editIdx !== undefined ? snap.editIdx : 0;
      Store.seriesWriting.get(target).then(function(m) {
        m = m || {};
        var domsLen = m.doms ? m.doms.length : 0;
        var targetKey = editIdx < domsLen ? 'doms' : 'subs';
        var idx = editIdx < domsLen ? editIdx : editIdx - domsLen;
        if (m[targetKey] && m[targetKey][idx]) {
          var existing = m[targetKey][idx];
          var gender = (existing.identity && existing.identity.basicInfo && existing.identity.basicInfo.gender) || existing.gender || '女性';
          var tmplMap = { '女性': 'FEMALE_CHARACTER_TEMPLATE', '男性': 'MALE_CHARACTER_TEMPLATE', '扶她': 'FUTA_CHARACTER_TEMPLATE', '伪娘': 'FEMBOY_CHARACTER_TEMPLATE' };
          var tmpl = window[tmplMap[gender] || 'FEMALE_CHARACTER_TEMPLATE'];
          if (tmpl && window.mergeObject) {
            var merged = window.mergeObject(tmpl, d);
            for (var k in d) {
              if (d[k] !== undefined && d[k] !== null && d[k] !== '') existing[k] = merged[k];
            }
            for (var defKey in tmpl) {
              if (existing[defKey] === undefined) existing[defKey] = JSON.parse(JSON.stringify(tmpl[defKey]));
            }
          } else {
            for (var k in d) {
              if (d[k] !== undefined && d[k] !== null && d[k] !== '') existing[k] = d[k];
            }
          }
          Store.seriesWriting.save(target, m).then(function() {
            toast('角色已更新：' + ((d.identity && d.identity.basicInfo && d.identity.basicInfo.name) || d.name || ''));
            if (target === swActiveSeries) window.XL切标签('body');
          });
        } else {
          toast('角色索引异常');
        }
      });
    } catch(e) { toast('AI 生成失败: ' + e.message); }
  }});

  // 大纲正文章节字段 AI 建议
  registerAiField('XL_olChapTitle', '章节标题', function() {
    return XLGetOutlineContext(swActiveSeries).then(function(ctx) {
      var idx = typeof _XLAiChapIdx !== 'undefined' ? _XLAiChapIdx : 0;
      var ch = _XLChapters[idx];
      if (!ch) return ctx;
      return ctx + '\n\n当前章节序号：' + (idx + 1) + '\n当前标题：（待填充）';
    });
  }, { suggestPrompt: 'suggest_chapter_title' });
  registerAiField('XL_olChapPlay', '玩法标签', function() {
    return XLGetOutlineContext(swActiveSeries).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_chapter_play' });
  registerAiField('XL_olChapLink', '因果衔接', function() {
    return XLGetOutlineContext(swActiveSeries).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_chapter_link' });
  registerAiField('XL_olChapContent', '场景内容', function() {
    return XLGetOutlineContext(swActiveSeries).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_chapter_content' });
  registerAiField('XL_olChapChar', '出场角色', function() {
    return XLGetOutlineContext(swActiveSeries).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_chapter_char' });
  registerAiField('XL_olChapSet', '场景地点', function() {
    return XLGetOutlineContext(swActiveSeries).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_chapter_setting' });

  // 单章重写
  registerAiField('XL_olChapFull', '单章重写', function() {
    return XLGetOutlineContext(swActiveSeries).then(function(ctx) {
      var idx = typeof _XLAiChapIdx !== 'undefined' ? _XLAiChapIdx : 0;
      var ch = _XLChapters[idx];
      if (!ch) return ctx;
      ctx += '\n\n需要重写的章节（第' + (idx + 1) + '章）：\n';
      ctx += '当前数据：' + JSON.stringify(ch, null, 2) + '\n';
      ctx += '\n请重新生成该章节的完整数据。字段说明：\n';
      ctx += '- title：章节标题（只写标题本身，不含"第X章"前缀）\n';
      ctx += '- playTags：玩法标签，格式"标签1·标签2·标签3"\n';
      ctx += '- link：因果衔接（本章场景为什么发生），≤40字\n';
      ctx += '- content：核心场景描述，≥100字\n';
      ctx += '- setting：场景/地点\n';
      ctx += '- characters：出场角色数组，如["角色A","角色B"]\n';
      ctx += '- wordTarget：目标字数（默认4000，重点章节8000）\n';
      ctx += '- eroticaLevel：情色程度，"轻度/中度/重度"\n';
      ctx += '- highlight：是否重点章节，boolean\n';
      ctx += 'JSON 格式输出，不要多余文字。';
      return { user: ctx, system: '你是一个情色小说大纲规划专家。重新生成指定章节的完整大纲数据，严格JSON格式。' };
    });
  }, { fillFn: function(d) {
    try {
      if (!d) { toast('AI 返回异常'); return; }
      var idx = typeof _XLAiChapIdx !== 'undefined' ? _XLAiChapIdx : 0;
      if (!_XLChapters[idx]) { toast('未找到对应章节'); return; }
      var ch = _XLChapters[idx];
      ['title','playTags','link','content','setting'].forEach(function(k) {
        if (d[k] !== undefined && d[k] !== null && d[k] !== '') ch[k] = d[k];
      });
      if (d.wordTarget) ch.wordTarget = d.wordTarget;
      if (d.eroticaLevel) ch.eroticaLevel = d.eroticaLevel;
      if (d.highlight !== undefined) ch.highlight = !!d.highlight;
      if (d.characters) {
        ch.characters = Array.isArray(d.characters) ? d.characters : (typeof d.characters === 'string' ? d.characters.split(/[、,，\s]+/).filter(Boolean) : []);
      }
      if (typeof XLRenderList === 'function') XLRenderList();
      XLAutoSave();
      toast('章节已重写');
    } catch(e) { toast('重写失败: ' + e.message); }
  }});

  // 概览页小字段 AI 建议
  registerAiField('XL_ovGenreSuggestion', '题材', function() {
    return XLGetOutlineContext(swActiveSeries).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_genre' });
  registerAiField('XL_ovPlaySuggestion', '玩法', function() {
    return XLGetOutlineContext(swActiveSeries).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_genre' });
  registerAiField('XL_ovPremise', '故事概述', function() {
    return XLGetOutlineContext(swActiveSeries).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_premise' });
  registerAiField('XLTitleSuggest', '大纲标题', function() {
    return XLGetOutlineContextWithoutChars(swActiveSeries).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_title' });
