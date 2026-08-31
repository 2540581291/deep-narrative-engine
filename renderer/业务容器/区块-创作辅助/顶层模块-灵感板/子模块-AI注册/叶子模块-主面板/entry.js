// 灵感板 · AI 字段注册
  registerAiField('inspiration_generate', '生成灵感', function() {
    var direction = window._inspireDirection || '';
    var count = typeof _inspirations !== 'undefined' ? _inspirations.length : 0;
    var r = renderPrompt('inspiration_generate', { direction: direction, count: count });
    return { user: r.user, system: r.system };
  }, { fillFn: function(d) {
    if (!d || !d.scene) { toast('AI 返回格式异常'); return; }
    _inspirations.push({
      content: d.scene.trim(),
      mood: '',
      type: 'original',
      createdAt: fmtDate(new Date()),
      _title: d.title || '',
      _plays: d.plays || '',
      _character: d.character || '',
      _whyWorks: d.whyWorks || '',
    });
    saveInspirations().then(function() {
      var el = document.getElementById('inspirationContent');
      if (el && typeof 渲染灵感板 === 'function') 渲染灵感板(el);
      toast('已生成1条灵感');
    });
  }});

  registerAiField('inspiration_classify', '氛围分类', function() {
    var idx = window._classifyInspirationIdx;
    if (idx === undefined) return '请先选择灵感';
    if (typeof _inspirations === 'undefined') return '灵感数据未加载';
    var realIdx = _inspirations.length - 1 - idx;
    var insp = _inspirations[realIdx];
    if (!insp) return '未找到灵感';
    var r = renderPrompt('inspiration_classify', { content: insp.content });
    return { user: r.user, system: r.system };
  }, { fillFn: function(d) {
    var idx = window._classifyInspirationIdx;
    if (!d || !d.mood) { toast('AI 返回异常'); return; }
    if (typeof _inspirations === 'undefined') { toast('灵感数据未加载'); return; }
    var realIdx = _inspirations.length - 1 - idx;
    var insp = _inspirations[realIdx];
    if (!insp) { toast('灵感索引异常'); return; }
    insp.mood = d.mood;
    saveInspirations().then(function() {
      var el = document.getElementById('inspirationContent');
      if (el && typeof 渲染灵感板 === 'function') 渲染灵感板(el);
      toast('氛围标签已设置：' + d.mood);
    });
  }});

  registerAiField('inspiration_polish', '润色灵感', function() {
    var idx = window._polishInspirationIdx;
    if (idx === undefined) return '请先选择灵感';
    if (typeof _inspirations === 'undefined') return '灵感数据未加载';
    var realIdx = _inspirations.length - 1 - idx;
    var insp = _inspirations[realIdx];
    if (!insp) return '未找到灵感';
    var r = renderPrompt('inspiration_polish', { content: insp.content });
    return { user: r.user, system: r.system };
  }, { fillFn: function(result) {
    if (!result || !result.trim()) { toast('AI 返回为空'); return; }
    var idx = window._polishInspirationIdx;
    if (typeof _inspirations === 'undefined') { toast('灵感数据未加载'); return; }
    var realIdx = _inspirations.length - 1 - idx;
    var insp = _inspirations[realIdx];
    if (!insp) { toast('灵感索引异常'); return; }
    insp._prevContent = insp.content;
    insp.content = result.trim();
    saveInspirations().then(function() {
      var el = document.getElementById('inspirationContent');
      if (el && typeof 渲染灵感板 === 'function') 渲染灵感板(el);
      toast('润色完成');
    });
  }});
