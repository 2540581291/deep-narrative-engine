// 系列写作 · 统一 AI 上下文
function XLGetOutlineContext(title) {
  return Store.seriesWriting.get(title).then(function(m) {
    m = m || {};

    var domGenre = [], domPlay = [];
    Array.from(document.querySelectorAll('#XLGenreChips .XL-tag-del')).forEach(function(el) {
      var t = el.getAttribute('data-tag');
      if (t) domGenre.push(t);
    });
    Array.from(document.querySelectorAll('#XLPlayChips .XL-tag-del')).forEach(function(el) {
      var t = el.getAttribute('data-tag');
      if (t) domPlay.push(t);
    });

    var doms = m.doms || [];
    var subs = m.subs || [];

    var domPremise = document.getElementById('XLPremise');
    var domChapterCount = document.getElementById('XLChapterCount');

    var genre = domGenre.length ? domGenre : (m.genreTags || m.tags || []);
    var play = domPlay.length ? domPlay : (m.playTags || []);
    var premise = domPremise ? domPremise.value.trim() : (m.premise || '');
    var outline = m.outline || [];
    var inputCount = parseInt(domChapterCount ? domChapterCount.value : (m.chapterCount || 10));
    var chapterCount = Math.max(inputCount, isNaN(inputCount) ? 10 : outline.length);

    var parts = [];
    parts.push('作品标题：' + (title || '未命名'));
    if (genre.length) parts.push('题材：' + genre.join('、'));
    if (play.length) parts.push('玩法：' + play.join('、'));

    if (doms.length) {
      parts.push('调教者：' + doms.map(function(d) {
        return XLFormatCharContext(d);
      }).join(' | '));
    }
    if (subs.length) {
      parts.push('被调教者：' + subs.map(function(s) {
        return XLFormatCharContext(s);
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

function XLGetOutlineContextWithoutChars(title) {
  return Store.seriesWriting.get(title).then(function(m) {
    m = m || {};
    var domGenre = [], domPlay = [];
    Array.from(document.querySelectorAll('#XLGenreChips .XL-tag-del')).forEach(function(el) {
      var t = el.getAttribute('data-tag');
      if (t) domGenre.push(t);
    });
    Array.from(document.querySelectorAll('#XLPlayChips .XL-tag-del')).forEach(function(el) {
      var t = el.getAttribute('data-tag');
      if (t) domPlay.push(t);
    });
    var domPremise = document.getElementById('XLPremise');
    var domChapterCount = document.getElementById('XLChapterCount');
    var genre = domGenre.length ? domGenre : (m.genreTags || m.tags || []);
    var play = domPlay.length ? domPlay : (m.playTags || []);
    var premise = domPremise ? domPremise.value.trim() : (m.premise || '');
    var chapterCount = domChapterCount ? domChapterCount.value : (m.chapterCount || 10);

    var parts = [];
    parts.push('作品标题：' + (title || '未命名'));
    if (genre.length) parts.push('题材：' + genre.join('、'));
    if (play.length) parts.push('玩法：' + play.join('、'));
    if (premise) parts.push('故事概述：' + premise);
    parts.push('计划章节数：' + chapterCount);
    return parts.join('\n');
  });
}

function XLFormatCharContext(c) {
  var parts = [];

  if (c.identity && c.identity.basicInfo) {
    var bi = c.identity.basicInfo;
    var bg = c.identity.background || {};
    var exp = c.identity.experience || {};
    parts.push(bi.name || bi.title || '未命名');
    if (bi.gender) parts.push('['+bi.gender+']');
    if (bi.age) parts.push(bi.age+'岁');
    if (bi.race) parts.push('种族:'+bi.race);
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
    if (exp.lifeOverview) parts.push('背景:'+exp.lifeOverview);
    return parts.join(' ');
  }

  parts.push(c.name || c.title || '未命名');
  if (c.gender) parts.push('['+c.gender+']');
  if (c.age) parts.push(c.age+'岁');
  if (c.career && c.career.occupation) parts.push('身份:'+c.career.occupation);
  else if (c.occupation) parts.push('身份:'+c.occupation);
  if (c.race) parts.push('种族:'+c.race);
  var personalityStr = '';
  if (typeof c.personality === 'object' && c.personality !== null) {
    personalityStr = c.personality.temperament || '';
  } else if (typeof c.personality === 'string') {
    personalityStr = c.personality;
  }
  if (personalityStr) parts.push('性格:'+personalityStr);
  if (c.figure) parts.push('体型:'+c.figure);
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
  if (c.background) parts.push('背景:'+c.background.slice(0, 100));
  return parts.join(' ');
}

window.XLGetOutlineContext = XLGetOutlineContext;
window.XLGetOutlineContextWithoutChars = XLGetOutlineContextWithoutChars;
window.XLFormatCharContext = XLFormatCharContext;
