// 系列写作 · AI 字段注册（主面板）
  registerAiField('XL_gen_overview', '角色设定', function() {
    window._XLGenSnap = { title: swActiveSeries };
    return XLGetOutlineContextWithoutChars(swActiveSeries).then(function(ctx) {
      var r = renderPrompt('gen_overview', { ctx: ctx });
      return { user: r.user, system: r.system };
    });
  }, { fillFn: function(d) {
    try {
      if (d) {
        var snap = window._XLGenSnap || {};
        var target = snap.title || swActiveSeries;
        Store.seriesWriting.get(target).then(function(m) {
          m = m || {};
          if (d.doms) m.doms = d.doms;
          if (d.subs) m.subs = d.subs;
          Store.seriesWriting.save(target, m).then(function() {
            if (target === swActiveSeries) {
              if (typeof XLRenderOverview === 'function') {
                var tabEl = document.getElementById('XLOutlineTabContent');
                if (tabEl) XLRenderOverview(tabEl);
              }
            }
            toast('角色设定已生成');
          });
        });
      }
    } catch(e) { toast('解析失败，请重试'); }
  }});
  registerAiField('XL_gen_story', '故事设定', function() {
    window._XLStorySnap = { title: swActiveSeries };
    return XLGetOutlineContext(swActiveSeries).then(function(ctx) {
      var r = renderPrompt('gen_story', { ctx: ctx, chapterHint: '微小说（3章）、短篇（5章）、中篇（10章）、长篇（20章）、超长篇（30章）' });
      return r.user;
    });
  }, { fillFn: function(d) {
    try {
      if (d) {
        var snap = window._XLStorySnap || {};
        var target = snap.title || swActiveSeries;
        Store.seriesWriting.get(target).then(function(m) {
          m = m || {};
          m.genreTags = d.genreTags || [];
          m.playTags = d.playTags || [];
          m.tags = m.genreTags;
          m.premise = d.premise || '';
          m.ending = d.ending || '';
          if (d.chapterCount) m.chapterCount = d.chapterCount;
          Store.seriesWriting.save(target, m).then(function() {
            if (target === swActiveSeries) {
              var gc = document.getElementById('XLGenreChips');
              if (gc) gc.innerHTML = XLRenderTagChips(m.genreTags, GENRE_TAGS);
              var pc = document.getElementById('XLPlayChips');
              if (pc) pc.innerHTML = XLRenderTagChips(m.playTags, PLAY_TAGS);
              var pe = document.getElementById('XLPremise');
              if (pe) pe.value = m.premise;
              var ee = document.getElementById('XLEnding');
              if (ee) ee.value = m.ending;
              if (d.chapterCount) {
                var cc = document.getElementById('XLChapterCount');
                if (cc) cc.value = d.chapterCount;
              }
            }
            toast('故事设定已生成');
          });
        });
      }
    } catch(e) { toast('解析失败，请重试'); }
  }});
  registerAiField('XL_gen_outline', '大纲重绘', function() {
    window._XLOutlineSnap = { title: swActiveSeries };
    return Store.seriesWriting.get(swActiveSeries).then(function(m) {
      m = m || {};
      var outline = m.outline || [];
      return XLGetOutlineContext(swActiveSeries).then(function(ctx) {
        var hasBlanks = outline.some(function(ch) { return !ch.title && !ch.content; });
        if (hasBlanks) {
          var blankSlots = [];
          for (var i = 0; i < outline.length; i++) {
            if (!outline[i].title && !outline[i].content) blankSlots.push('第' + (i+1) + '章');
          }
          ctx += '\n\n【保留约束】已有章节如上，请遵守以下规则：\n';
          ctx += '- 非空白章节内容必须原样保留，不得修改；\n';
          ctx += '- 以下空白章节需生成完整新内容：' + blankSlots.join('、');
        } else if (outline.length > 0) {
          ctx = ctx.replace(/\n已有大纲章节：[\s\S]*?(?=\n(?:结局方向|参考作品|【参考文档|计划章节数)|\s*$)/, '');
        }
        var r = renderPrompt('gen_quick_outline', { ctx: ctx, chapterHint: '微小说=3、短篇=5、中篇=10、长篇=20、超长篇=30' });
        return r.user;
      });
    });
  }, { fillFn: function(d) {
    try {
      if (!d || !d.chapters) { toast('AI 返回格式异常'); return; }
      var snap = window._XLOutlineSnap || {};
      var target = snap.title || swActiveSeries;
      var chapters = d.chapters;
      chapters.forEach(function(ch, i) {
        if (ch.index === undefined) ch.index = i + 1;
        if (!ch.wordTarget) ch.wordTarget = 4000;
        if (ch.highlight === undefined) ch.highlight = false;
        if (ch.eroticaLevel === undefined) ch.eroticaLevel = '中度';
        if (ch.characters && typeof ch.characters === "string") ch.characters = ch.characters.split(/[、,，\s]+/).filter(Boolean);
        if (!ch.characters || !Array.isArray(ch.characters)) ch.characters = [];
      });
      _XLChapters = chapters;
      Store.seriesWriting.get(target).then(function(m) {
        m = m || {};
        m.outline = _XLChapters;
        Store.seriesWriting.save(target, m).then(function() {
          if (target === swActiveSeries) {
          }
        });
      });
      if (typeof XLRenderList === 'function') XLRenderList();
      _XLSubTab = 'outline';
      window.XL切标签('outline');
      toast('大纲已生成');
    } catch(e) { toast('解析失败: ' + e.message); }
  }});
  AI_QUICK_PRESETS['XL_gen_outline'] = [
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
  AI_QUICK_PRESETS['XL_gen_notes'] = [
    { label: '📌 心理描写', dir: '加强角色心理活动和情绪变化', category: 'style' },
    { label: '📌 悬念感', dir: '保持故事的悬念和不确定性', category: 'style' },
    { label: '📌 情色氛围', dir: '突出情色场景的气氛渲染', category: 'style' },
  ];
  AI_QUICK_PRESETS['XL_gen_refs'] = [
    { label: '📚 同题材', dir: '推荐相同题材的参考作品', category: 'style' },
    { label: '📚 同风格', dir: '推荐相同文风的参考作品', category: 'style' },
    { label: '📚 反套路', dir: '推荐视角独特、反套路的参考作品', category: 'style' },
  ];
  registerAiField('XL_gen_notes', '写作备注', function() {
    window._XLNotesSnap = { title: swActiveSeries };
    return XLGetOutlineContext(swActiveSeries).then(function(ctx) {
      var r = renderPrompt('gen_notes', { ctx: ctx });
      return { user: r.user, system: r.system };
    });
  }, { fillFn: function(d) {
    try {
      if (d && d.writingNotes && d.writingNotes.length) {
        var snap = window._XLNotesSnap || {};
        var target = snap.title || swActiveSeries;
        Store.seriesWriting.get(target).then(function(m) {
          m = m || {};
          m.writingNotes = d.writingNotes;
          Store.seriesWriting.save(target, m).then(function() {
            if (target === swActiveSeries) window.XL切标签('notes');
            toast('写作备注已生成');
          });
        });
      }
    } catch(e) { toast('解析失败，请重试'); }
  }});