// 小说大纲 · 新建作品
function renderOutlineCreate(el) {
  debugLog('novel', 'renderOutlineCreate START', '_outlineTitle=' + _outlineTitle);
  // el 可能是外层容器（novelViewContent），也可能是 说outlineTabContent
  var contentEl = el || document.getElementById('说outlineTabContent');
  if (!contentEl) { debugLog('novel', 'renderOutlineCreate', '容器元素不存在！'); return; }
  var th = '';
  GENRE_TAGS.forEach(function(t) {
    th += '<label style="display:inline-flex;align-items:center;gap:4px;margin:4px 8px 4px 0;font-size:13px;cursor:pointer">' +
          '<input type="checkbox" class="novel-tag-cb" value="' + t.id + '"> ' + escHtml(t.label) + '</label>';
  });
  contentEl.innerHTML =
    '<div class="n-card mw-600 ma">' +
    '<div class="n-card-title mb-16">新建</div>' +
    '<p class="text-muted text-sm mb-16">填写信息后 AI 自动生成大纲。</p>' +
    aiInput('novelCreateTitle', '作品标题', '输入作品标题...') +
    '<div class="form-group"><label>题材标签（可多选）</label><div>' + th + '</div></div>' +
    aiTextarea('novelCreatePremise', '一句话设定', '例如：贵族小姐和男仆在禁闭古堡中的情欲纠葛...') +
    '<div class="form-group"><label>章节数量</label><div class="flex-row"><input type="number" id="novelChapterCount" class="llm-input" style="width:100px" value="10" min="1" max="100">' +
    '<span class="text-muted text-sm">章（默认10章）</span></div></div>' +
    '<div style="display:flex;gap:8px;margin-top:16px"><button class="btn" id="novelCreateBtn" class="flex-1 p-10">🚀 创建并生成大纲</button></div>' +
    '<div id="novelCreateStatus" class="text-center text-muted text-sm mt-8"></div></div>';

  document.getElementById('novelCreateBtn').addEventListener('click', function() {
    var title = document.getElementById('novelCreateTitle').value.trim();
    if (!title) { toast('请输入作品标题'); return; }
    var tags = []; Array.from(document.querySelectorAll('.novel-tag-cb:checked')).forEach(function(cb) { tags.push(cb.value); });
    var premise = document.getElementById('novelCreatePremise').value.trim();
    var cc = Math.max(1, Math.min(100, parseInt(document.getElementById('novelChapterCount').value) || 10));
    document.getElementById('novelCreateStatus').textContent = 'AI 正在生成 ' + cc + ' 章大纲...';
    this.disabled = true;
    Store.novel.save(title, { genreTags: tags, length: 'custom', premise: premise, chapterCount: cc, wordCount: 0, status: '规划中' }).then(function() {
      _outlineTitle = title; novelCurrentTitle = title;
      // 重新渲染大纲页面（带导航标签）
      渲染小说大纲(document.getElementById('novelViewContent'), title, { genreTags: tags, length: 'custom', premise: premise, chapterCount: cc });
    });
  });
}
