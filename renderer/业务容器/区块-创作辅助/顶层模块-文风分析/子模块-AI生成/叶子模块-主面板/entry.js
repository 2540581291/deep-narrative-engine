// 参考文档（文风分析）· AI 结构化文风分析生成（二元模板）

// ===== AI 文风分析生成（二元模板 / 结构化条目树） =====
function 生成文风分析() {
  // 打开面板前确保「条数/层级」快捷方向存在（模块内注册，避免依赖 AI_QUICK_PRESETS 加载顺序）
  if (typeof window.AI_QUICK_PRESETS !== 'undefined') {
    window.AI_QUICK_PRESETS['styleAnalysis'] = [
      { label: '📊 精简', dir: '每个板块生成 2-3 条顶层条目，最多 2 层，言简意赅', category: 'structure' },
      { label: '🔎 标准', dir: '每个板块生成 4-6 条顶层条目，技法拆解用「标签→技法→示例」3 层', category: 'structure' },
      { label: '🧠 详尽', dir: '每个板块生成 7-10 条顶层条目，子条目丰富，含较多原文示例', category: 'structure' },
      { label: '⚖️ 重技法', dir: '重点展开技法拆解与语言对白，其余板块精简', category: 'focus' },
      { label: '🎨 重节奏', dir: '重点分析语言节奏、对白风格与修辞，弱化标签罗列', category: 'focus' },
    ];
  }
  openAiGenPanel('styleAnalysis');
}
window.生成文风分析 = 生成文风分析;

if (typeof registerAiField !== 'undefined') {
  registerAiField('styleAnalysis', '文风分析', function() {
    var title = document.getElementById('styleEditTitle');
    var titleVal = title ? title.value.trim() : '';
    var srcText = document.getElementById('styleEditSource');
    var text = srcText && srcText.value.trim() ? srcText.value.trim() : (window._styleEditSourceCache || '');
    if (!text) { toast('请先在基本信息 tab 中粘贴要分析的文本'); return ''; }
    if (text.length > 30000) text = text.slice(0, 30000) + '\n\n[文本过长，已截取前 30000 字符]';
    // 返回原始文本 + 附加变量；提示词模板由 suggestPrompt 渲染（方向含条数/层级）
    return { user: text, textTitle: '原文档: ' + (titleVal || '未命名') };
  }, {
    suggestPrompt: 'style_analysis',
    fillFn: function(d) {
      var sec = (d && d.sections) || {};
      // 回填 6 个分析板块为条目树（基本信息=元数据表单，不填充）
      文风分析标签.forEach(function(t) {
        if (t.id === '基本信息') return;
        var arr = sec[t.id];
        _styleAna[t.id] = Array.isArray(arr) ? ((window.文风条目规范化 || function(x){return x||[];})(arr)) : [];
      });
      // 尝试回填标题/标签
      if (d.title) { var tel = document.getElementById('styleEditTitle'); if (tel && !tel.value.trim()) tel.value = d.title; }
      if (Array.isArray(d.tags) && d.tags.length) {
        window._styleEditTagsCache = d.tags;
        var tagEl = document.getElementById('styleEditTags');
        if (tagEl) tagEl.value = d.tags.join('、');
      }
      // 跳到「文风总评」展示已填充的条目树
      if (typeof window.文风切子标签 === 'function') window.文风切子标签('文风总评');
      else { _styleEditSubTab = '文风总评'; var el = document.getElementById('说styleTabContent'); if (el) 渲染当前分析段(el); }
      if (typeof window.文风调度自动保存 === 'function') window.文风调度自动保存();
      toast('文风分析已生成（结构化条目）');
    }
  });
}
