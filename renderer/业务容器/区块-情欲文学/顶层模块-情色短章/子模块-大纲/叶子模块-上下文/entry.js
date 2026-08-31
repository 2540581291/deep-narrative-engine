// 大纲 · 统一 AI 上下文
// 从 Store 读取完整的大纲数据，组装为纯文本上下文块供所有 AI 调用使用

function 短getOutlineContext(title) {
  return Store.vignette.get(title).then(function(m) {
    m = m || {};

    // 先从 DOM 读当前未保存的 chip（用户刚选未保存的标签）
    var domGenre = [], domPlay = [];
    Array.from(document.querySelectorAll('#ovGenreChips .ov-tag-del')).forEach(function(el) {
      var t = el.getAttribute('data-tag');
      if (t) domGenre.push(t);
    });
    Array.from(document.querySelectorAll('#ovPlayChips .ov-tag-del')).forEach(function(el) {
      var t = el.getAttribute('data-tag');
      if (t) domPlay.push(t);
    });

    // 角色数据直接从 Store 读取（完整角色卡对象）
    // 不再依赖 DOM 读取
    var doms = m.doms || [];
    var subs = m.subs || [];

    var domPremise = document.getElementById('ovPremise');
    var domChapterCount = document.getElementById('ovChapterCount');

    // 处理角色名 -> 调教者/被调教者
    var genre = domGenre.length ? domGenre : (m.genreTags || m.tags || []);
    var play = domPlay.length ? domPlay : (m.playTags || []);
    var premise = domPremise ? domPremise.value.trim() : (m.premise || '');
    var outline = m.outline || [];
    var inputCount = parseInt(domChapterCount ? domChapterCount.value : (m.chapterCount || 1));
    var chapterCount = Math.max(inputCount, isNaN(inputCount) ? 1 : outline.length);

    var parts = [];
    parts.push('作品标题：' + (title || '未命名'));
    if (genre.length) parts.push('题材：' + genre.join('、'));
    if (play.length) parts.push('玩法：' + play.join('、'));

    // 调教者上下文（完整角色卡数据）
    if (doms.length) {
      parts.push('调教者：' + doms.map(function(d) {
        return 短formatCharContext(d);
      }).join(' | '));
    }

    // 被调教者上下文（完整角色卡数据）
    if (subs.length) {
      parts.push('被调教者：' + subs.map(function(s) {
        return 短formatCharContext(s);
      }).join(' | '));
    }

    if (doms.length) {
      parts.push('调教者性别：' + doms.map(function(d) { return (d.identity && d.identity.basicInfo && d.identity.basicInfo.gender) || d.gender || '未设置'; }).join('、'));
    }
    if (subs.length) {
      parts.push('被调教者性别：' + subs.map(function(d) { return (d.identity && d.identity.basicInfo && d.identity.basicInfo.gender) || d.gender || '未设置'; }).join('、'));
    }

    if (premise) parts.push('故事概述：' + premise);
    var bodies = m.bodyParams || [];
    if (bodies.length) parts.push('身体参数：' + bodies.map(function(b){
      var bp = b.name+'['+b.level+','+b.age+'岁]';
      if (b.bodySize) bp += ' 体型:'+b.bodySize;
      if (b.chest) bp += ' 胸:'+b.chest;
      if (b.genital) bp += ' 私处:'+b.genital;
      if (b.anus) bp += ' 肛:'+b.anus;
      return bp;
    }).join(' | '));
    var notes = m.writingNotes || [];
    if (notes.length) parts.push('【写作方向要求】' + notes.join('；'));

    if (outline.length) parts.push('已有大纲章节：\n' + outline.map(function(o,i){
      var s = '  ' + (i+1) + '.「' + (o.title||'') + '」';
      if (o.playTags) s += ' 玩法:' + o.playTags;
      if (o.link) s += ' 衔接:' + o.link;
      if (o.content) s += '\n    内容:' + (o.content.length > 120 ? o.content.slice(0,120)+'…' : o.content);
      if (o.setting) s += ' 场景:' + o.setting;
      if (o.characters && o.characters.length) {
        var chs = Array.isArray(o.characters) ? o.characters : (typeof o.characters==='string' ? o.characters.split(/[、,，\s]+/).filter(Boolean) : []);
        if (chs.length) s += ' 角色:' + chs.join('、');
      }
      return s;
    }).join('\n'));
    var ending = m.ending || '';
    if (ending) parts.push('结局方向：' + ending);
    var refs = m.references || [];
    if (refs.length) parts.push('参考作品：' + refs.map(function(r){return r.title;}).join('、'));
    // 有 refDocKey 的引用，加载完整文档内容到 AI 上下文
    var docKeys = refs.filter(function(r) { return r.refDocKey; }).map(function(r) { return r.refDocKey; });
    if (docKeys.length && typeof Store.refDoc !== 'undefined') {
      return Promise.all(docKeys.map(function(k) {
        return Store.refDoc.get(k).then(function(doc) {
          return doc && doc.content ? { title: k, content: doc.content } : null;
        });
      })).then(function(docs) {
        docs.filter(Boolean).forEach(function(d) {
          var preview = d.content.length > 3000 ? d.content.slice(0, 3000) + '...' : d.content;
          parts.push('【参考文档：' + d.title + '】\n' + preview);
        });
        return parts.join('\n');
      });
    }
    parts.push('计划章节数：' + chapterCount);
    return parts.join('\n');
  });
}

// 不包含角色数据的上下文（用于 AI 生成角色，避免 AI 偷懒不改）
function 短getOutlineContextWithoutChars(title) {
  return Store.vignette.get(title).then(function(m) {
    m = m || {};
    var domGenre = [], domPlay = [];
    Array.from(document.querySelectorAll('#ovGenreChips .ov-tag-del')).forEach(function(el) {
      var t = el.getAttribute('data-tag');
      if (t) domGenre.push(t);
    });
    Array.from(document.querySelectorAll('#ovPlayChips .ov-tag-del')).forEach(function(el) {
      var t = el.getAttribute('data-tag');
      if (t) domPlay.push(t);
    });
    var domPremise = document.getElementById('ovPremise');
    var domChapterCount = document.getElementById('ovChapterCount');
    var genre = domGenre.length ? domGenre : (m.genreTags || m.tags || []);
    var play = domPlay.length ? domPlay : (m.playTags || []);
    var premise = domPremise ? domPremise.value.trim() : (m.premise || '');
    var chapterCount = domChapterCount ? domChapterCount.value : (m.chapterCount || 1);

    var parts = [];
    parts.push('作品标题：' + (title || '未命名'));
    if (genre.length) parts.push('题材：' + genre.join('、'));
    if (play.length) parts.push('玩法：' + play.join('、'));
    if (premise) parts.push('故事概述：' + premise);
    // 从 Store 读取当前角色数量
    var domCount = (m.doms || []).length;
    var subCount = (m.subs || []).length;
    if (domCount > 0) {
      var domGenders = (m.doms || []).map(function(d) { return (d.identity && d.identity.basicInfo && d.identity.basicInfo.gender) || d.gender || '未设置'; });
      parts.push('调教者性别：' + domGenders.join('、'));
    }
    if (subCount > 0) {
      var subGenders = (m.subs || []).map(function(d) { return (d.identity && d.identity.basicInfo && d.identity.basicInfo.gender) || d.gender || '未设置'; });
      parts.push('被调教者性别：' + subGenders.join('、'));
    }
    parts.push('计划章节数：' + chapterCount);
    return parts.join('\n');
  });
}

// 格式化角色卡对象为文本上下文
function 短formatCharContext(c) {
  var parts = [];

  // 新格式：identity 嵌套结构（概要模板生成）
  if (c.identity && c.identity.basicInfo) {
    var bi = c.identity.basicInfo;
    var bg = c.identity.background || {};
    var exp = c.identity.experience || {};
    parts.push(bi.name || bi.title || '未命名');
    if (bi.gender) parts.push('['+bi.gender+']');
    if (bi.age) parts.push(bi.age+'岁');
    if (bi.race) parts.push('种族:'+bi.race);
    if (bi.rarity) parts.push('稀有度:'+bi.rarity);
    if (bi.title) parts.push('头衔:'+bi.title);
    if (exp.currentOccupation) parts.push('身份:'+exp.currentOccupation);
    if (bg.aura) parts.push('气质:'+bg.aura);
    if (c.personality) {
      var pStr = typeof c.personality === 'object' ? c.personality.temperament || '' : c.personality;
      if (pStr) parts.push('性格:'+pStr);
    }
    if (c.kinks) {
      var kStr = Array.isArray(c.kinks) ? c.kinks.join('、') : c.kinks;
      if (kStr) parts.push('性癖:'+kStr);
    }
    if (bg.origin) parts.push('出身:'+bg.origin);
    if (bg.birthStatus) parts.push('出生:'+bg.birthStatus);
    if (bg.family) parts.push('家族:'+bg.family);
    if (bg.upbringing) parts.push('成长:'+bg.upbringing);
    if (bg.education) parts.push('教育:'+bg.education);
    if (bg.skills && bg.skills.length) parts.push('技能:'+(Array.isArray(bg.skills)?bg.skills.join('、'):bg.skills));
    if (bg.talents && bg.talents.length) parts.push('天赋:'+(Array.isArray(bg.talents)?bg.talents.join('、'):bg.talents));
    if (exp.lifeOverview) parts.push('背景:'+exp.lifeOverview);
    if (exp.timeline) parts.push('经历:'+exp.timeline);
    if (exp.dailyLife) parts.push('日常:'+exp.dailyLife);
    if (exp.sexualAwakening) parts.push('性启蒙:'+exp.sexualAwakening);
    if (exp.dailySexuality) parts.push('性日常:'+exp.dailySexuality);
    return parts.join(' ');
  }

  // 旧格式（扁平字段 / 完整角色卡）
  parts.push(c.name || c.title || '未命名');
  if (c.gender) parts.push('['+c.gender+']');
  if (c.age) parts.push(c.age+'岁');
  if (c.career && c.career.occupation) parts.push('身份:'+c.career.occupation);
  else if (c.occupation) parts.push('身份:'+c.occupation);
  if (c.race) parts.push('种族:'+c.race);
  // personality 可能是字符串或对象
  var personalityStr = '';
  if (typeof c.personality === 'object' && c.personality !== null) {
    personalityStr = c.personality.temperament || '';
  } else if (typeof c.personality === 'string') {
    personalityStr = c.personality;
  }
  if (personalityStr) parts.push('性格:'+personalityStr);
  if (c.figure) parts.push('体型:'+c.figure);
  // 性癖
  var kinksStr = '';
  if (c.fetish && c.fetish.fetishes) {
    if (Array.isArray(c.fetish.fetishes)) kinksStr = c.fetish.fetishes.join('、');
    else kinksStr = c.fetish.fetishes;
  } else if (c.kinks) {
    if (Array.isArray(c.kinks)) kinksStr = c.kinks.join('、');
    else if (typeof c.kinks === 'string') kinksStr = c.kinks;
  } else if (c.preferences && c.preferences.fetishes) {
    if (Array.isArray(c.preferences.fetishes)) kinksStr = c.preferences.fetishes.join('、');
    else kinksStr = c.preferences.fetishes;
  }
  if (kinksStr) parts.push('性癖:'+kinksStr);
  if (c.image && c.image.height) parts.push('身高:'+c.image.height);
  if (c.image && c.image.bust) parts.push('胸围:'+c.image.bust);
  if (c.image && c.image.measurements) parts.push('三围:'+c.image.measurements);
  if (c.appearance) parts.push('外貌:'+c.appearance);
  if (c.background) parts.push('背景:'+c.background);
  return parts.join(' ');
}

window.短formatCharContext = 短formatCharContext;
