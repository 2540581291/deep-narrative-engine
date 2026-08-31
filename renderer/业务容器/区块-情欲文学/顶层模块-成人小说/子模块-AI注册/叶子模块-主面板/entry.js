  registerAiField('gen_overview', '角色设定', function() {
    window._ovGenSnap = { title: _outlineTitle };
    return getOutlineContextWithoutChars(_outlineTitle).then(function(ctx) {
      var r = renderPrompt('gen_overview', { ctx: ctx });
      return { user: r.user, system: r.system };
    });
  }, { fillFn: function(d) {
    try {
      if (d) {
        var snap = window._ovGenSnap || {};
        var target = snap.title || _outlineTitle;
        Store.novel.get(target).then(function(m) {
          m = m || {};
          if (d.doms) m.doms = d.doms;
          if (d.subs) m.subs = d.subs;
          Store.novel.save(target, m).then(function() {
            if (target === _outlineTitle || target === novelCurrentTitle) {
              if (typeof renderOutlineOverview === 'function') {
                var tabEl = document.getElementById('说outlineTabContent');
                if (tabEl) renderOutlineOverview(tabEl);
              }
            }
            toast('角色设定已生成');
          });
        });
      }
    } catch(e) { toast('解析失败，请重试'); }
  }});
  registerAiField('gen_story', '故事设定', function() {
    window._ovStorySnap = { title: _outlineTitle };
    return getOutlineContext(_outlineTitle).then(function(ctx) {
      var r = renderPrompt('gen_story', { ctx: ctx, chapterHint: '微小说（3章）、短篇（5章）、中篇（10章）、长篇（20章）、超长篇（30章）' });
      return r.user;
    });
  }, { fillFn: function(d) {
    try {
      if (d) {
        var snap = window._ovStorySnap || {};
        var target = snap.title || _outlineTitle;
        Store.novel.get(target).then(function(m) {
          m = m || {};
          m.genreTags = d.genreTags || [];
          m.playTags = d.playTags || [];
          m.tags = m.genreTags;
          m.premise = d.premise || '';
          m.ending = d.ending || '';
          if (d.chapterCount) m.chapterCount = d.chapterCount;
          Store.novel.save(target, m).then(function() {
            if (target === _outlineTitle || target === novelCurrentTitle) {
              var gc = document.getElementById('ovGenreChips');
              if (gc) gc.innerHTML = renderTagChips(m.genreTags, GENRE_TAGS);
              var pc = document.getElementById('ovPlayChips');
              if (pc) pc.innerHTML = renderTagChips(m.playTags, PLAY_TAGS);
              var pe = document.getElementById('ovPremise');
              if (pe) pe.value = m.premise;
              var ee = document.getElementById('ovEnding');
              if (ee) ee.value = m.ending;
              if (d.chapterCount) {
                var cc = document.getElementById('ovChapterCount');
                if (cc) cc.value = d.chapterCount;
              }
            }
            toast('故事设定已生成');
          });
        });
      }
    } catch(e) { toast('解析失败，请重试'); }
  }});
  registerAiField('gen_outline', '大纲重绘', function() {
    window._ovOutlineSnap = { title: _outlineTitle };
    return Store.novel.get(_outlineTitle).then(function(m) {
      m = m || {};
      var outline = m.outline || [];
      return getOutlineContext(_outlineTitle).then(function(ctx) {
        var hasBlanks = outline.some(function(ch) { return !ch.title && !ch.content; });
        if (hasBlanks) {
          // 场景二：存在空白章节 → 保留全部已有章节，标注哪些需填充
          var blankSlots = [];
          for (var i = 0; i < outline.length; i++) {
            if (!outline[i].title && !outline[i].content) blankSlots.push('第' + (i+1) + '章');
          }
          ctx += '\n\n【保留约束】已有章节如上，请遵守以下规则：\n';
          ctx += '- 非空白章节内容必须原样保留，不得修改；\n';
          ctx += '- 以下空白章节需生成完整新内容：' + blankSlots.join('、');
        } else if (outline.length > 0) {
          // 场景一：所有章节已有内容 → 剔除已有大纲章节，防 AI 照抄
          ctx = ctx.replace(/\n已有大纲章节：[\s\S]*?(?=\n(?:结局方向|参考作品|【参考文档|计划章节数)|\s*$)/, '');
        }
        var r = renderPrompt('gen_quick_outline', { ctx: ctx, chapterHint: '微小说=3、短篇=5、中篇=10、长篇=20、超长篇=30' });
        return r.user;
      });
    });
  }, { fillFn: function(d) {
    try {
      if (!d || !d.chapters) { toast('AI 返回格式异常'); return; }
      var snap = window._ovOutlineSnap || {};
      var target = snap.title || _outlineTitle;
      var chapters = d.chapters;
      chapters.forEach(function(ch, i) {
        if (ch.index === undefined) ch.index = i + 1;
        if (!ch.wordTarget) ch.wordTarget = 4000;
        if (ch.highlight === undefined) ch.highlight = false;
        if (ch.eroticaLevel === undefined) ch.eroticaLevel = '中度';
        if (ch.characters && typeof ch.characters === "string") ch.characters = ch.characters.split(/[、,，\s]+/).filter(Boolean);
        if (!ch.characters || !Array.isArray(ch.characters)) ch.characters = [];
      });
      _outlineChapters = chapters;
      Store.novel.get(target).then(function(m) {
        m = m || {};
        m.outline = _outlineChapters;
        Store.novel.save(target, m).then(function() {
          if (target === _outlineTitle || target === novelCurrentTitle) {
          }
        });
      });
      _outlineSubTab = 'outline';
      window.N_otab('outline');
      toast('大纲已生成');
    } catch(e) { toast('解析失败: ' + e.message); }
  }});
  AI_QUICK_PRESETS['gen_outline'] = [
    { label: '📐 BDSM向', dir: '以BDSM为核心，突出权力交换、调教关系', category: 'style' },
    { label: '📐 纯爱向', dir: '以纯爱浪漫为核心，突出情感发展', category: 'style' },
    { label: '📐 禁忌向', dir: '以禁忌之恋为核心，突出背德感', category: 'style' },
    { label: '📐 奇幻向', dir: '以奇幻世界为背景', category: 'style' },
    { label: '📐 科幻向', dir: '以科幻设定为背景', category: 'style' },
    { label: '📐 古风向', dir: '以古代背景为舞台', category: 'style' },
    { label: '📐 重口味', dir: '偏向重度描写', category: 'precision' },
    { label: '📐 轻度口味', dir: '偏向轻度描写', category: 'precision' },
    { label: '📐 长篇化', dir: '生成20章以上长篇大纲', category: 'precision' },
    { label: '📐 短篇精悍', dir: '生成5-8章短篇大纲', category: 'precision' },
  ];
  AI_QUICK_PRESETS['gen_notes'] = [
    { label: '📌 心理描写', dir: '加强角色心理活动和情绪变化', category: 'style' },
    { label: '📌 悬念感', dir: '保持故事的悬念和不确定性', category: 'style' },
    { label: '📌 情色氛围', dir: '突出情色场景的气氛渲染', category: 'style' },
  ];
  AI_QUICK_PRESETS['gen_refs'] = [
    { label: '📚 同题材', dir: '推荐相同题材的参考作品', category: 'style' },
    { label: '📚 同风格', dir: '推荐相同文风的参考作品', category: 'style' },
    { label: '📚 反套路', dir: '推荐视角独特、反套路的参考作品', category: 'style' },
  ];
  registerAiField('gen_notes', '写作备注', function() {
    window._ovNotesSnap = { title: _outlineTitle };
    return getOutlineContext(_outlineTitle).then(function(ctx) {
      var r = renderPrompt('gen_notes', { ctx: ctx });
      return { user: r.user, system: r.system };
    });
  }, { fillFn: function(d) {
    try {
      if (d && d.writingNotes && d.writingNotes.length) {
        var snap = window._ovNotesSnap || {};
        var target = snap.title || _outlineTitle;
        Store.novel.get(target).then(function(m) {
          m = m || {};
          m.writingNotes = d.writingNotes;
          Store.novel.save(target, m).then(function() {
            if (target === _outlineTitle || target === novelCurrentTitle) N_otab('notes');
            toast('写作备注已生成');
          });
        });
      }
    } catch(e) { toast('解析失败，请重试'); }
  }});
  registerAiField('gen_refs', '参考文档', function() {
    window._ovRefsSnap = { title: _outlineTitle };
    return getOutlineContext(_outlineTitle).then(function(ctx) {
      var r = renderPrompt('gen_refs', { ctx: ctx });
      return { user: r.user, system: r.system };
    });
  }, { fillFn: function(d) {
    try {
      if (d && d.references && d.references.length) {
        var snap = window._ovRefsSnap || {};
        var target = snap.title || _outlineTitle;
        Store.novel.get(target).then(function(m) {
          m = m || {};
          m.references = d.references;
          Store.novel.save(target, m).then(function() {
            if (target === _outlineTitle || target === novelCurrentTitle) N_otab('references');
            toast('参考文档已生成');
          });
        });
      }
    } catch(e) { toast('解析失败，请重试'); }
  }});
  registerAiField('ovCharSingle', '概览角色生成', function() {
    if (!_outlineTitle) return '请先保存作品';
    return Store.novel.get(_outlineTitle).then(function(m) {
      m = m || {};
      var editIdx = typeof _bodyEditIdx !== 'undefined' ? _bodyEditIdx : 0;
      var domsLen = m.doms ? m.doms.length : 0;
      var targetKey = editIdx < domsLen ? 'doms' : 'subs';
      var idx = editIdx < domsLen ? editIdx : editIdx - domsLen;
      var charData = (m[targetKey] && m[targetKey][idx]) ? m[targetKey][idx] : {};

      // 快照：记录生成时指向的是哪个作品+哪个角色，fillFn 用快照定位，不依赖运行时状态
      window._ovCharSnap = { title: _outlineTitle, key: targetKey, idx: idx }; console.log('[ovChar] ctxFn snap set:',JSON.stringify(window._ovCharSnap),'editIdx:',editIdx,'domsLen:',domsLen);

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
      // 同时补充另一组角色列表作为参考
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
      console.log('[ovChar] fillFn called', d ? 'd.identity:'+!!d.identity : 'd=null');
      if (!d || !d.identity) { toast('AI 返回异常'); return; }
      var snap = window._ovCharSnap || {};
      var targetTitle = snap.title || _outlineTitle;
      var targetKey = snap.key || 'doms';
      var idx = snap.idx || 0;
      console.log('[ovChar] snap:',JSON.stringify(snap),'key:',targetKey,'idx:',idx);
      Store.novel.get(targetTitle).then(function(m) {
        m = m || {};
        var found = !!(m[targetKey] && m[targetKey][idx]);
        console.log('[ovChar] get done, found:',found,'len:',(m[targetKey]||[]).length);
        if (m[targetKey] && m[targetKey][idx]) {
          var existing = m[targetKey][idx];
          if (!existing.identity) existing.identity = {};
          ['basicInfo','background','experience'].forEach(function(s) {
            if (d.identity[s] && typeof d.identity[s] === 'object') {
              if (!existing.identity[s]) existing.identity[s] = {};
              var cnt=0;
              for (var k in d.identity[s]) { existing.identity[s][k]=d.identity[s][k]; cnt++; }
              console.log('[ovChar] filled',s,cnt,'fields');
            }
          });
          Store.novel.save(targetTitle, m).then(function() {
            var name=(existing.identity&&existing.identity.basicInfo&&existing.identity.basicInfo.name)||'';
            toast('角色已生成：' + name);
            if (targetTitle===_outlineTitle||targetTitle===novelCurrentTitle) {
              var tabEl = document.getElementById('说outlineTabContent');
              if (tabEl && typeof renderOutlineOverview === 'function') renderOutlineOverview(tabEl);
            }
          }).catch(function(e){console.error('[ovChar] save err:',e);toast('保存失败: '+e.message);});
        } else {
          console.warn('[ovChar] idx not found, fallback');
          toast('角色已生成（但索引变化，数据已保存到 Store）');
          Store.novel.save(targetTitle, m).catch(function(e){console.error('[ovChar] fallback save err:',e);});
        }
      }).catch(function(e){console.error('[ovChar] get err:',e);toast('读取失败: '+e.message);});
    } catch(e) { console.error('[ovChar] sync err:',e); toast('AI 生成失败: ' + e.message); }
  }});
  registerAiField('charBodyAiGen', '角色卡 AI 生成', function() {
    if (!_outlineTitle) return '请先保存作品';
    // 快照：记录当前编辑的角色索引
    window._ovCharBodySnap = { title: _outlineTitle, editIdx: typeof _bodyEditIdx !== 'undefined' ? _bodyEditIdx : 0 };
    return Store.novel.get(_outlineTitle).then(function(m) {
      m = m || {};
      // 当前编辑角色
      var snap = window._ovCharBodySnap || {};
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
      var snap = window._ovCharBodySnap || {};
      var target = snap.title || _outlineTitle;
      var editIdx = snap.editIdx !== undefined ? snap.editIdx : 0;
      Store.novel.get(target).then(function(m) {
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
          Store.novel.save(target, m).then(function() {
            toast('角色已更新：' + ((d.identity && d.identity.basicInfo && d.identity.basicInfo.name) || d.name || ''));
            if (target === _outlineTitle || target === novelCurrentTitle) window.N_otab('body');
          });
        } else {
          toast('角色索引异常');
        }
      });
    } catch(e) { toast('AI 生成失败: ' + e.message); }
  }});

  // 大纲正文章节字段 AI 建议
  registerAiField('olChapTitle', '章节标题', function() {
    return getOutlineContext(_outlineTitle).then(function(ctx) {
      var idx = typeof _aiChapIdx !== 'undefined' ? _aiChapIdx : 0;
      var ch = _outlineChapters[idx];
      if (!ch) return ctx;
      return ctx + '\n\n当前章节序号：' + (idx + 1) + '\n当前标题：（待填充）';
    });
  }, { suggestPrompt: 'suggest_chapter_title' });
  registerAiField('olChapPlay', '玩法标签', function() {
    return getOutlineContext(_outlineTitle).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_chapter_play' });
  registerAiField('olChapLink', '因果衔接', function() {
    return getOutlineContext(_outlineTitle).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_chapter_link' });
  registerAiField('olChapContent', '场景内容', function() {
    return getOutlineContext(_outlineTitle).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_chapter_content' });
  registerAiField('olChapChar', '出场角色', function() {
    return getOutlineContext(_outlineTitle).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_chapter_char' });
  registerAiField('olChapSet', '场景地点', function() {
    return getOutlineContext(_outlineTitle).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_chapter_setting' });

  // 单章重写：完整重生成单章所有字段
  registerAiField('olChapFull', '单章重写', function() {
    return getOutlineContext(_outlineTitle).then(function(ctx) {
      var idx = typeof _aiChapIdx !== 'undefined' ? _aiChapIdx : 0;
      var ch = _outlineChapters[idx];
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
      var idx = typeof _aiChapIdx !== 'undefined' ? _aiChapIdx : 0;
      if (!_outlineChapters[idx]) { toast('未找到对应章节'); return; }
      var ch = _outlineChapters[idx];
      ['title','playTags','link','content','setting'].forEach(function(k) {
        if (d[k] !== undefined && d[k] !== null && d[k] !== '') ch[k] = d[k];
      });
      if (d.wordTarget) ch.wordTarget = d.wordTarget;
      if (d.eroticaLevel) ch.eroticaLevel = d.eroticaLevel;
      if (d.highlight !== undefined) ch.highlight = !!d.highlight;
      if (d.characters) {
        ch.characters = Array.isArray(d.characters) ? d.characters : (typeof d.characters === 'string' ? d.characters.split(/[、,，\s]+/).filter(Boolean) : []);
      }
      if (typeof renderOutlineList === 'function') renderOutlineList();
      olAutoSave();
      toast('章节已重写');
    } catch(e) { toast('重写失败: ' + e.message); }
  }});

  // 概览页小字段 AI 建议
  registerAiField('ovGenreSuggestion', '题材', function() {
    return getOutlineContext(_outlineTitle).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_genre' });
  registerAiField('ovPlaySuggestion', '玩法', function() {
    return getOutlineContext(_outlineTitle).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_genre' });
  registerAiField('ovPremise', '故事概述', function() {
    return getOutlineContext(_outlineTitle).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_premise' });
  registerAiField('ovEnding', '结局方向', function() {
    return getOutlineContext(_outlineTitle).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_ending' });
  registerAiField('ovDomSpeech', '语言风格', function() {
    return getOutlineContext(_outlineTitle).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_speech' });
  registerAiField('ovDomPersonality', '性格', function() {
    return getOutlineContext(_outlineTitle).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_personality' });
  registerAiField('ovDomKinks', '性癖', function() {
    return getOutlineContext(_outlineTitle).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_fetish' });
  registerAiField('novelTitleSuggest', '大纲标题', function() {
    return getOutlineContextWithoutChars(_outlineTitle).then(function(ctx) {
      return ctx;
    });
  }, { suggestPrompt: 'suggest_title' });
