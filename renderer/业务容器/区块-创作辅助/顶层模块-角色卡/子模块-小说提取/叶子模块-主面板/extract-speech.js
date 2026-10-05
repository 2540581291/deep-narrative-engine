// 深度-叙事引擎 · 角色卡 · 📖 小说提取 · 角色话语
// 从原小说里摘出「该角色实际说出口的原话」（对白/独白/呻吟叫喊/念白唱词），逐块扫描全文后合并去重。
//
// 设计要点：
//   · 结果独立存放：写在角色数据自己的「话语」字段上（不进 小说提取字段序，因此不影响「填入生成」与角色卡 14 章生成），
//     同时镜像一份到全局「角色话语」库（保存/角色话语/…），供 性爱台本 / 角色台本 等模块自由选用。
//   · 进度用独立浮动弹窗显示（不写 fqViewContent——那是性癖问答的容器，在角色卡页面并不存在）。
//   · 逐块结果落盘到 记录文件夹/_speech/<角色名>.json（下划线前缀 + 子目录，不会被历史扫描当成角色文件）。

// ===== 分块进度文件路径与读写 =====
function 小说提取话语文件路径(name) {
  var folderName = 本地FS.清理(小说提取当前记录标题) || 小说提取当前记录ID;
  return 小说提取存储基路径 + folderName + '/_speech/' + 本地FS.清理(name) + '.json';
}

function 小说提取保存话语分段(name, data) {
  return LocalFS.saveJSON(小说提取话语文件路径(name), data).catch(function() {});
}

function 小说提取读取话语分段(name) {
  return LocalFS.readJSON(小说提取话语文件路径(name)).catch(function() { return null; });
}

// ===== 清洗与去重 =====
// 只保留话语本身：去首尾空白、剥最外层引号/书名号、压掉换行、剥掉「某某道：」这类说话人前缀
function 话语清洗(s) {
  s = String(s == null ? '' : s).replace(/\s*\n+\s*/g, ' ').trim();
  if (!s) return '';
  // 剥最外层成对引号/书名号（可能叠两层）
  for (var i = 0; i < 2; i++) {
    var m = s.match(/^[「『“"《【]\s*([\s\S]*?)\s*[」』”"》】]$/);
    if (!m) break;
    s = m[1].trim();
  }
  // 说话人前缀：优先「XX说道：」，再退到「XX：（短名）」
  var m2 = s.match(/^([^，。！？；：…,.!?;:（(]{1,10}?)(说道|说|道|问道|问|答道|答|喊道|喊|叫道|叫|笑道|喝道|低声说|大声说|开口说|开口)[：:]\s*/);
  if (m2) s = s.slice(m2[0].length).trim();
  else {
    var m3 = s.match(/^([^，。！？；：…,.!?;:（(]{1,6})[：:]\s*/);
    if (m3) s = s.slice(m3[0].length).trim();
  }
  return s.trim();
}

// 是否为有效话语：含至少一个中日韩文字或字母（纯标点/纯符号丢弃）
function 话语有效(s) {
  return /[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u30ffA-Za-z]/.test(s);
}

// 逐块结果合并：清洗 → 丢弃无效 → 去掉纯重复（忽略空白与标点差异）
// 不设条数与字数上限：原文里出现过多少条原话就保留多少条
function 话语合并去重(分组数组, opts) {
  var seen = {};
  var out = [];
  (分组数组 || []).forEach(function(group) {
    (group || []).forEach(function(raw) {
      var s = 话语清洗(raw);
      if (!s || !话语有效(s)) return;
      var k = s.replace(/[\s，。！？；：、…？！,.!?;:"'“”‘’「」『』（）()【】《》—－-]/g, '');
      if (!k || seen[k]) return;
      seen[k] = 1;
      out.push(s);
    });
  });
  return out;
}

// ===== 写入角色 + 镜像到全局话语库 =====
// 来源信息 = { 表: {话语: 段号}, 段数 }：记录每条是从全文第几段摘出来的，
// 可靠性审查据此按位置取证据。调用方不传时，沿用库里已有的来源（未被删掉的行来源不丢）。
function 小说提取写入话语(c, lines, 来源信息) {
  if (!c) return Promise.resolve(false);
  c.话语 = lines || [];
  var 书名 = 小说提取当前记录标题 || '未命名';
  var bookId = 小说提取当前记录ID || ('book_' + 本地FS.清理(书名));
  var 键 = (typeof 角色话语键 === 'function') ? 角色话语键(bookId, c.name) : '';
  var 旧 = (键 && typeof 角色话语读取同步 === 'function') ? (角色话语读取同步(键) || {}) : {};
  var 旧表 = (旧.来源 && typeof 旧.来源 === 'object') ? 旧.来源 : {};
  var 传入表 = (来源信息 && 来源信息.表) ? 来源信息.表 : {};
  var 新表 = {};
  (c.话语 || []).forEach(function(t) {
    if (传入表[t] != null) 新表[t] = 传入表[t];
    else if (旧表[t] != null) 新表[t] = 旧表[t];
  });
  var 段数 = (来源信息 && 来源信息.段数) || 旧.来源段数 || 0;
  return 小说提取保存单个角色(c).then(function() {
    // 话语为空时 角色话语保存 会把该条从库里撤掉（不留 0 条空壳）
    return 角色话语保存({
      bookId: bookId, book: 书名, char: c.name,
      gender: 小说提取规范化性别(c.gender), role: c.role || '',
      source: '小说提取', lines: c.话语,
      来源: 新表, 来源段数: 段数
    });
  });
}

// ===== 进度：只用每块自己的 LLM 调用卡（全局任务进度面板，右下角常驻） =====
// 不再另建聚合卡——右下角同时出现两张卡是多余的；块进度由每块卡片的标题带出（第 N/M 段）。
// 也因为没有聚合卡可点，某块失败即视为中止整轮（见下方 摘一块 的 catch）。

// ===== 弹窗：提取角色话语 =====
window.小说提取弹出话语提取 = function(name) {
  window._speechExtractName = name;
  if (document.getElementById('speechExtractOverlay')) return;
  var c = null;
  小说提取角色列表.forEach(function(ch) { if (ch.name === name) c = ch; });
  var 已有 = (c && Array.isArray(c.话语)) ? c.话语.length : 0;
  var ov = document.createElement('div');
  ov.id = 'speechExtractOverlay';
  ov.className = 'ovl';
  ov.innerHTML = '<div class="mcard" style="max-width:520px;width:92%">'
    + '<div style="font-size:15px;font-weight:600;margin-bottom:4px">💬 提取角色话语</div>'
    + '<div style="font-size:11px;color:var(--fg2);margin-bottom:12px">按每 12 万字分块扫描全文，摘出「' + escHtml(name) + '」实际说过的原话并合并去重'
    + (已有 ? '<br><span style="color:var(--warning)">该角色已有 ' + 已有 + ' 条话语，重新提取将整体覆盖</span>' : '')
    + '</div>'
    + '<div style="font-size:11px;font-weight:500;margin-bottom:6px;color:var(--fg)">快捷方向（可多选）</div>'
    + '<div id="speechExtractChips" style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px">'
    + '<span class="tag-chip" data-dir="只摘该角色在性爱/情欲情境中说过的话（叫床、淫语、求饶、被逼供述、调情、哀求、命令等），其余日常场合的话不要摘" onclick="小说提取切换话语提取chip(this)" style="cursor:pointer;font-size:10px">🔞 只要情欲场合的话</span>'
    + '<span class="tag-chip" data-dir="呻吟、浪叫、哭喊、喘语这类只有声音的短句也要逐条摘出来，不要因为不成句、没有实义就丢弃" onclick="小说提取切换话语提取chip(this)" style="cursor:pointer;font-size:10px">📢 连呻吟与叫喊一起摘</span>'
    + '<span class="tag-chip" data-dir="该角色念出来的诵读稿、供述、唱词念白，以及「在心里说出的话」也一并摘录" onclick="小说提取切换话语提取chip(this)" style="cursor:pointer;font-size:10px">📖 含念白与唱词</span>'
    + '</div>'
    + '<div style="font-size:11px;font-weight:500;margin-bottom:6px;color:var(--fg)">提取方向（可选，可补充）</div>'
    + '<div style="font-size:10px;color:var(--fg3);margin-bottom:8px">点击上方快捷选项填入，也可直接输入自定义方向</div>'
    + '<textarea id="speechExtractHint" class="llm-input" rows="3" style="width:100%;font-size:12px;resize:vertical;font-family:inherit" placeholder="留空则按默认方式提取……"></textarea>'
    + '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">'
    + '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>'
    + '<button class="btn-main" onclick="小说提取确认话语提取()">💬 开始提取</button>'
    + '</div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
};

// 快捷方向 chip：切换选中状态并填入/移除提示词（与全文提取同款交互，两个提取弹窗共用）
function 切换方向chip(el, 输入框id) {
  var dir = el.getAttribute('data-dir');
  var ta = document.getElementById(输入框id);
  if (!ta) return;
  var parts = ta.value.trim().split(/\n+/).map(function(x) { return x.trim(); }).filter(Boolean);
  if (el.getAttribute('data-on') === 'true') {
    el.removeAttribute('data-on');
    el.style.borderColor = '';
    el.style.color = '';
    el.style.background = '';
    ta.value = parts.filter(function(p) { return p !== dir; }).join('\n');
  } else {
    el.setAttribute('data-on', 'true');
    el.style.borderColor = 'var(--accent)';
    el.style.color = 'var(--accent)';
    el.style.background = 'rgba(255,255,255,0.06)';
    if (parts.indexOf(dir) < 0) parts.push(dir);
    ta.value = parts.join('\n');
  }
}

window.小说提取切换话语提取chip = function(el) { 切换方向chip(el, 'speechExtractHint'); };

window.小说提取确认话语提取 = function() {
  var ta = document.getElementById('speechExtractHint');
  var hint = ta ? ta.value.trim() : '';
  var ov = document.getElementById('speechExtractOverlay');
  if (ov) ov.remove();
  小说提取话语提取角色(window._speechExtractName, hint, false);
};

// ===== 弹窗：补充提取角色话语（与提取同一套流程，结果追加到现有话语之后，不覆盖） =====
window.小说提取弹出补充话语 = function(name) {
  window._speechAppendName = name;
  if (document.getElementById('speechAppendOverlay')) return;
  // 先把查看框里挂起的改动落盘，保证「现有 N 条」与后续合并的基数是用户当前看到的版本
  小说提取查看话语落盘(name);
  var c = null;
  小说提取角色列表.forEach(function(ch) { if (ch.name === name) c = ch; });
  var 已有 = (c && Array.isArray(c.话语)) ? c.话语.length : 0;
  var ov = document.createElement('div');
  ov.id = 'speechAppendOverlay';
  ov.className = 'ovl';
  ov.innerHTML = '<div class="mcard" style="max-width:520px;width:92%">'
    + '<div style="font-size:15px;font-weight:600;margin-bottom:4px">➕ 补充提取角色话语</div>'
    + '<div style="font-size:11px;color:var(--fg2);margin-bottom:12px">按每 12 万字分块扫描全文，<b>除此之外继续提取</b>「' + escHtml(name) + '」说过的原话，摘到的新内容追加到现有话语之后'
    + (已有 ? '<br><span style="color:var(--fg3)">现有 ' + 已有 + ' 条不会被覆盖，重复的会自动去重</span>' : '<br><span style="color:var(--fg3)">该角色目前没有话语，等同于首次提取</span>')
    + '</div>'
    + '<div style="font-size:11px;font-weight:500;margin-bottom:6px;color:var(--fg)">快捷方向（可多选）</div>'
    + '<div id="speechAppendChips" style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px">'
    + '<span class="tag-chip" data-dir="只摘该角色在性爱/情欲情境中说过的话（叫床、淫语、求饶、被逼供述、调情、哀求、命令等），其余日常场合的话不要摘" onclick="小说提取切换补充话语chip(this)" style="cursor:pointer;font-size:10px">🔞 只要情欲场合的话</span>'
    + '<span class="tag-chip" data-dir="呻吟、浪叫、哭喊、喘语这类只有声音的短句也要逐条摘出来，不要因为不成句、没有实义就丢弃" onclick="小说提取切换补充话语chip(this)" style="cursor:pointer;font-size:10px">📢 连呻吟与叫喊一起摘</span>'
    + '<span class="tag-chip" data-dir="该角色念出来的诵读稿、供述、唱词念白，以及「在心里说出的话」也一并摘录" onclick="小说提取切换补充话语chip(this)" style="cursor:pointer;font-size:10px">📖 含念白与唱词</span>'
    + '<span class="tag-chip" data-dir="这次换个侧重：专挑上一次容易漏掉的地方——短促的应答、被打断的半句话、语气词与惊呼、只在别人转述里出现的该角色的原话" onclick="小说提取切换补充话语chip(this)" style="cursor:pointer;font-size:10px">🔍 专补容易漏的</span>'
    + '</div>'
    + '<div style="font-size:11px;font-weight:500;margin-bottom:6px;color:var(--fg)">补充方向（可选，可补充）</div>'
    + '<div style="font-size:10px;color:var(--fg3);margin-bottom:8px">点击上方快捷选项填入，也可直接输入自定义方向</div>'
    + '<textarea id="speechAppendHint" class="llm-input" rows="3" style="width:100%;font-size:12px;resize:vertical;font-family:inherit" placeholder="留空则按默认方式补充提取……"></textarea>'
    + '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">'
    + '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>'
    + '<button class="btn-main" onclick="小说提取确认补充话语()">➕ 开始补充提取</button>'
    + '</div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
};

window.小说提取切换补充话语chip = function(el) { 切换方向chip(el, 'speechAppendHint'); };

window.小说提取确认补充话语 = function() {
  var ta = document.getElementById('speechAppendHint');
  var hint = ta ? ta.value.trim() : '';
  var ov = document.getElementById('speechAppendOverlay');
  if (ov) ov.remove();
  小说提取话语提取角色(window._speechAppendName, hint, true);
};

// ===== 主流程：分块扫描全文 → 逐块摘原话 → 合并去重 → 写回角色并镜像入库 =====
// 追加 = false：整体覆盖（重新提取）
// 追加 = true ：补充提取——新摘到的追加到现有话语之后，与现有内容一起去重，不覆盖
function 小说提取话语提取角色(name, userHint, 追加) {
  if (!name) return;
  var c = null;
  小说提取角色列表.forEach(function(ch) { if (ch.name === name) c = ch; });
  if (!c) { toast('角色不存在'); return; }

  var fullText = 小说提取原始文本 || '';
  if (!fullText || fullText.length < 50) { toast('⚠️ 原文已丢失，请重新加载小说后再提取'); return; }

  var chunks = 切割文本(fullText, 120000);
  if (chunks.length > 100) { chunks = chunks.slice(0, 100); toast('⚠️ 文本超长，将只扫描前约 1200 万字'); }

  var 角色标签 = c.name + (Array.isArray(c.aliases) && c.aliases.length ? '（别名：' + c.aliases.join('、') + '）' : '');
  // 补充提取时给 AI 说清这是「除此之外继续提取」，并要求不与已收录的重复
  var 补充说明 = 追加 ? '这是**补充提取**：在已收录的原话之外，继续摘出尚未提取过的原话；已经收录过的不要再重复摘录。' : '';
  var hintBlock = (userHint || 补充说明) ? '\n\n【用户方向】\n' + [补充说明, userHint].filter(Boolean).join('\n') : '';
  // 已收录清单：补充提取时**逐条列给 AI**（否则它不知道已经有什么，只会把全书再摘一遍）
  var 已有清单 = 追加 ? (Array.isArray(c.话语) ? c.话语.slice() : []) : [];
  var 已有块 = 已有清单.length
    ? '\n【已收录的原话（共 ' + 已有清单.length + ' 条）——下面这些一律不要再重复摘录】\n'
      + 已有清单.map(function(t, i) { return (i + 1) + '. ' + t; }).join('\n') + '\n'
    : '';
  var 分块结果 = [];   // 每块一条 { idx: 第几块(0起), quotes: [...] }

  var segData = {
    character: name,
    createdAt: Date.now(),
    append: !!追加,
    hint: userHint || '',
    segments: chunks.map(function(chunk, i) { return { idx: i, result: null, status: 'pending' }; })
  };
  小说提取保存话语分段(name, segData);

  // 把各块结果摊平（话语合并去重吃的是「数组的数组」）
  function 摊平(结果集) { return (结果集 || []).map(function(x) { return x.quotes || []; }); }

  // 来源表：清洗后的话语 → 首次出现它的段号（1 起）
  function 构建来源表(结果集) {
    var 表 = {};
    (结果集 || []).forEach(function(x) {
      (x.quotes || []).forEach(function(raw) {
        var t = 话语清洗(raw);
        if (!t || !话语有效(t)) return;
        if (表[t] == null) 表[t] = x.idx + 1;
      });
    });
    return 表;
  }

  // 收尾：已中止 = 用户在某块卡片上点了「⏹ 终止」，或某块调用失败
  function 收尾(已中止, 已扫描块数) {
    var 新摘 = 话语合并去重(摊平(分块结果));
    // 现有话语在收尾时现读一次（不用启动时的快照）：提取途中用户在查看框里改的内容不会被这轮结果覆盖
    var 现有 = Array.isArray(c.话语) ? c.话语.slice() : [];
    // 追加模式：现有 + 新摘 一起去重（顺序上现有在前，新增附在后面）
    var lines = 追加 ? 话语合并去重([现有, 新摘]) : 新摘;
    var 新增数 = lines.length - 现有.length;
    var 来源信息 = { 表: 构建来源表(分块结果), 段数: chunks.length };

    // 中止时：补充提取的新摘是纯增量、落盘安全；整体提取若用半截结果覆盖现有话语风险太大 → 一律不写
    if (已中止 && !追加) {
      toast('⏹ 提取已中止（扫描 ' + 已扫描块数 + '/' + chunks.length + ' 块，摘到 ' + 新摘.length + ' 条），原话语 ' + 现有.length + ' 条未改动');
      刷新查看话语框(name);
      return;
    }
    if (!新摘.length) {
      if (追加) {
        toast('未摘到新的原话，现有 ' + 现有.length + ' 条未改动');
      } else {
        toast('⚠️ 未在该角色身上摘到原话（可能该角色在原文中很少开口）');
        刷新视图();
      }
      刷新查看话语框(name);
      return;
    }
    小说提取写入话语(c, lines, 来源信息).then(function() {
      segData.mergedAt = Date.now();
      小说提取保存话语分段(name, segData);
      if (追加) {
        toast(新增数
          ? '✅ 补充提取「' + name + '」：' + (已中止 ? '已中止，' : '') + '新增 ' + 新增数 + ' 条原话（原有 ' + 现有.length + ' 条，现共 ' + lines.length + ' 条）'
          : '补充提取「' + name + '」：这次摘到的都是已有内容，仍是 ' + lines.length + ' 条');
      } else {
        toast('✅ 已提取「' + name + '」的原话 ' + lines.length + ' 条（已存入角色话语库，可被性爱台本 / 角色台本选用）');
      }
      刷新查看话语框(name);   // 查看框若还开着，同步成最新内容（否则再输入会把刚补充的覆盖掉）
      刷新视图();
    }).catch(function() {
      toast('⚠️ 话语写入失败');
      刷新视图();
    });
  }

  function 摘一块(idx) {
    if (idx >= chunks.length) { 收尾(false, chunks.length); return; }
    var 暂得 = 话语合并去重(摊平(分块结果)).length;
    var chunkLabel = '第' + (idx + 1) + '/' + chunks.length + '段';
    var _r = renderPrompt('ext_char_speech', {
      角色名: 角色标签,
      chunkLabel: chunkLabel,
      chunkText: chunks[idx],
      用户方向: hintBlock,
      已有话语: 已有块,   // 首次提取为空串（模板里该占位符必须每次都传，否则会残留 {已有话语}）
    });
    // 进度只靠这张卡片：标题自带「第 N/M 段」，右侧有模型与耗时；不再另建聚合卡
    LLM.callJSON({
      prompt: _r.user,
      system: _r.system,
      label: (追加 ? '话语补充 ' : '话语提取 ') + name + ' ' + chunkLabel + (暂得 ? '（暂得' + 暂得 + '条）' : ''),
      temperature: 0.2,
    }).then(function(data) {
      var got = (data && Array.isArray(data.quotes)) ? data.quotes : [];
      if (got.length) 分块结果.push({ idx: idx, quotes: got });
      segData.segments[idx].status = got.length ? 'ok' : 'empty';
      segData.segments[idx].result = got;
      小说提取保存话语分段(name, segData);
      摘一块(idx + 1);
    }).catch(function(err) {
      // 没有聚合卡可点，某块失败（含用户在该块卡片上点「终止」）就中止整轮，不再默默跑下一块
      console.warn('[' + (追加 ? '话语补充' : '话语提取') + '] 第 ' + (idx + 1) + ' 块失败，整轮中止:', err && err.message ? err.message : err);
      segData.segments[idx].status = 'failed';
      小说提取保存话语分段(name, segData);
      收尾(true, idx + 1);
    });
  }

  摘一块(0);
}
window.小说提取话语提取角色 = 小说提取话语提取角色;

// ===== 弹窗：查看 / 编辑角色话语 =====
window.小说提取弹出查看话语 = function(name) {
  if (document.getElementById('speechViewOverlay')) return;
  var c = null;
  小说提取角色列表.forEach(function(ch) { if (ch.name === name) c = ch; });
  if (!c) { toast('角色不存在'); return; }
  var lines = Array.isArray(c.话语) ? c.话语 : [];
  var ov = document.createElement('div');
  ov.id = 'speechViewOverlay';
  ov.className = 'ovl';
  // 即时保存：没有「保存 / 取消」按钮，textarea 输入即防抖写盘；关窗（✕ 或点遮罩）时补一次落盘
  ov.innerHTML = '<div class="mcard" style="max-width:760px;width:94vw;height:82vh;max-height:82vh;display:flex;flex-direction:column">'
    + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">'
    + '<span style="font-size:15px;font-weight:600">💬 角色话语 · ' + escHtml(name) + '</span>'
    + '<span style="font-size:11px;color:var(--fg3)">共 <span id="speechViewCount">' + lines.length + '</span> 条 · 每行一条 · 输入即保存</span>'
    + '<div style="flex:1"></div>'
    + '<span style="cursor:pointer;color:var(--fg3);font-size:18px;line-height:1" onclick="小说提取关闭查看话语(\'' + escHtml(name) + '\')">✕</span>'
    + '</div>'
    + '<div style="font-size:11px;color:var(--fg2);margin-bottom:10px">改动即时写入角色与「角色话语」库，无需保存</div>'
    + '<textarea id="speechViewText" class="llm-input" spellcheck="false" style="flex:1;min-height:0;width:100%;resize:none;font-size:12px;line-height:1.8;font-family:inherit;white-space:pre-wrap" oninput="小说提取话语编辑防抖(\'' + escHtml(name) + '\')">' + escHtml(lines.join('\n')) + '</textarea>'
    + '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;flex-wrap:wrap">'
    + '<button class="btn-out" style="color:var(--accent);border-color:var(--accent)" onclick="小说提取弹出补充话语(\'' + escHtml(name) + '\')" title="照常分块扫描全文，把除此之外新摘到的原话补充到现有话语之后（不覆盖）">➕ 补充提取</button>'
    + '<button class="btn-out" style="color:var(--accent);border-color:var(--accent)" onclick="小说提取弹出话语审查(\'' + escHtml(name) + '\')" title="让 AI 逐条回原文核对：这句话是否真由该角色说出口">🔍 可靠性审查</button>'
    + '<button class="btn-out" onclick="小说提取复制话语(\'' + escHtml(name) + '\')">📋 复制全部</button>'
    + '</div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) 小说提取关闭查看话语(name); });
};

// 编辑防抖（500ms）→ 即时保存
var 话语编辑定时器 = {};
window.小说提取话语编辑防抖 = function(name) {
  if (话语编辑定时器[name]) clearTimeout(话语编辑定时器[name]);
  话语编辑定时器[name] = setTimeout(function() {
    delete 话语编辑定时器[name];
    小说提取话语编辑落盘(name);
  }, 500);
};

// 把查看框里的当前内容写回角色 + 话语库（静默，不弹提示、不整页刷新）
function 小说提取话语编辑落盘(name) {
  var ta = document.getElementById('speechViewText');
  if (!ta) return;
  var c = null;
  小说提取角色列表.forEach(function(ch) { if (ch.name === name) c = ch; });
  if (!c) return;
  var lines = 话语合并去重([ta.value.split('\n')]);
  var 条数 = document.getElementById('speechViewCount');
  if (条数) 条数.textContent = String(lines.length);
  小说提取写入话语(c, lines);
}

// 把挂起的防抖改动立刻落盘（打开补充提取 / 可靠性审查之前调用，保证后续流程读到的是最新内容）
function 小说提取查看话语落盘(name) {
  if (话语编辑定时器[name]) { clearTimeout(话语编辑定时器[name]); delete 话语编辑定时器[name]; }
  小说提取话语编辑落盘(name);
}

// 查看框还开着时，把它的内容同步成角色当前的话语（提取 / 补充提取跑完后调用）
function 刷新查看话语框(name) {
  var ta = document.getElementById('speechViewText');
  if (!ta) return;
  if (话语编辑定时器[name]) { clearTimeout(话语编辑定时器[name]); delete 话语编辑定时器[name]; }
  var c = null;
  小说提取角色列表.forEach(function(ch) { if (ch.name === name) c = ch; });
  var lines = (c && Array.isArray(c.话语)) ? c.话语 : [];
  ta.value = lines.join('\n');
  var 条数 = document.getElementById('speechViewCount');
  if (条数) 条数.textContent = String(lines.length);
}

// 关闭查看弹窗：先把最后一次改动落盘，再关窗并刷新列表卡片上的条数
window.小说提取关闭查看话语 = function(name) {
  小说提取查看话语落盘(name);
  var ov = document.getElementById('speechViewOverlay');
  if (ov) ov.remove();
  刷新视图();
};

window.小说提取复制话语 = function(name) {
  var ta = document.getElementById('speechViewText');
  if (!ta) return;
  复制到剪贴板(ta.value).then(function(ok) { toast(ok ? '已复制全部话语' : '复制失败'); });
};

// ===== 可靠性审查 =====
// 职责拆开，各自用最靠得住的证据：
//   ① 「这句话在不在原文里」——交给全文检索（确定性）：检索不到 = 不是原话（改写/编造），直接判删，不必问 AI
//   ② 「这句话是谁说的」——交给 AI，且只给它**这条话所在的那一段原文**当证据（按位置核对）
// 所以不会再有「这段窗口没覆盖 → 误判原文里没有」的段落间遗失：存在性由检索保证，归属由所在段保证。
// AI 若在这段里回「原文未见」，说明是模型自己没看到（它明明在段里），这种一律**保留**，只作报告。

// AI 能给的三种归属判定（「原文未见」也会出现——那说明模型自己没看到，一律保留并报告）
var 话语审查档位 = ['本人所说', '他人所说', '旁白叙述', '原文未见'];

// 查看框 → 先把挂起的改动落盘、关掉查看框，再审查
window.小说提取弹出话语审查 = function(name) {
  var c = null;
  小说提取角色列表.forEach(function(ch) { if (ch.name === name) c = ch; });
  if (!c) { toast('角色不存在'); return; }
  小说提取查看话语落盘(name);
  var ov = document.getElementById('speechViewOverlay');
  if (ov) ov.remove();
  if (!Array.isArray(c.话语) || !c.话语.length) { toast('该角色暂无可审查的话语'); return; }
  小说提取写入话语(c, c.话语).then(function() { 小说提取话语可靠性审查(name); });
};

// 归一化：只留中日韩文字与字母数字，用于忽略标点/空白的容错检索
function 话语归一字符串(s) {
  return String(s == null ? '' : s).toLowerCase().replace(/[^\u4e00-\u9fff\u3400-\u4dbf\u3040-\u30ff\uac00-\ud7af0-9a-z]/g, '');
}
// 把全文压成「只留有效字符」的串，并记录每个字符在原串中的下标，便于把命中位置映射回原文
function 话语归一索引(text) {
  var s = '', map = [];
  text = String(text == null ? '' : text).toLowerCase();
  for (var i = 0; i < text.length; i++) {
    var ch = text.charAt(i);
    if (/[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u30ff\uac00-\ud7af0-9a-z]/.test(ch)) { s += ch; map.push(i); }
  }
  return { s: s, map: map };
}
// 全文里的字符位置 → 段号（1 起）。切割文本 的切分是可精确还原的：chunks.join('\n') === 归一化后的全文
function 段号由位置(chunks, pos) {
  var start = 0;
  for (var i = 0; i < chunks.length; i++) {
    var end = start + chunks[i].length;
    if (pos < end) return i + 1;
    start = end + 1;   // 段之间隔着被切掉的那个换行
  }
  return chunks.length;
}
// 在全文里给一句话定位并算出段号；找不到返回 0
function 话语定位段号(全文, chunks, 归一索引, 文本) {
  if (!文本) return 0;
  var pos = 全文.indexOf(文本);
  if (pos >= 0) return 段号由位置(chunks, pos);
  var q = 话语归一字符串(文本);
  if (q.length < 2) return 0;
  var at = 归一索引.s.indexOf(q);
  if (at < 0) return 0;
  return 段号由位置(chunks, 归一索引.map[at]);
}

function 小说提取话语可靠性审查(name) {
  var c = null;
  小说提取角色列表.forEach(function(ch) { if (ch.name === name) c = ch; });
  if (!c) { toast('角色不存在'); return; }
  var lines = Array.isArray(c.话语) ? c.话语.slice() : [];
  if (!lines.length) { toast('该角色暂无可审查的话语'); return; }

  // 用归一化后的全文做切割与定位，保证「位置 ↔ 段号」的换算是准的（切割文本 内部也做同样的换行归一）
  var fullText = String(小说提取原始文本 || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!fullText || fullText.length < 50) { toast('⚠️ 原文已丢失，请重新加载小说后再审查'); return; }

  var chunks = 切割文本(fullText, 120000);
  var 归一索引 = null;   // 需要容错检索时才构建

  // 来源段号：只有段数对得上才可用（全文被换过时旧段号会错位，宁可直接重新定位）
  var bookId = 小说提取当前记录ID || ('book_' + 本地FS.清理(小说提取当前记录标题 || '未命名'));
  var 库来源 = (typeof 角色话语来源 === 'function') ? 角色话语来源(角色话语键(bookId, c.name)) : { 表: {}, 段数: 0 };
  var 来源表 = (库来源.段数 === chunks.length) ? 库来源.表 : {};

  // 逐条定位：段号 → 该段里要核对的话语（保持原顺序）；定位不到的另立一桶（原文里根本没有这句话）
  var 分组 = {};      // 段号(1起) → 话语数组
  var 检索不到 = [];  // 全文里检索不到的话语
  lines.forEach(function(t) {
    var seg = Number(来源表[t]) || 0;
    // 来源段号可信性守卫：该段里找不到这句话（标点差异也算找不到）时，不轻信它，改为全文重新定位
    if (seg > 0 && (chunks[seg - 1] || '').indexOf(t) < 0) seg = 0;
    if (!seg) {
      if (!归一索引) 归一索引 = 话语归一索引(fullText);
      seg = 话语定位段号(fullText, chunks, 归一索引, t);
    }
    if (seg > 0) {
      var k = String(seg);
      (分组[k] = 分组[k] || []).push(t);
    } else {
      检索不到.push(t);
    }
  });

  // 一次核对 = 一段的全部话语：证据本来就是同一段原文，
  // 再按条数切开只会把那段原文反复重发，所以这里不设条数上限。
  var 批次 = Object.keys(分组).map(function(segKey) {
    return { 段号: Number(segKey) || 0, 文本数组: 分组[segKey] };
  });

  var 结果 = [];          // [{文本, 判定, 依据, 段号, 未判}]
  var 总批数 = 批次.length;

  // 判定 → 是否删除：
  //   ① 全文检索不到 → 删（不是原文里的原话：被改写、拼接或编造）
  //   ② 能送进 AI 的都是检索到的，模型回「原文未见」说明是它没看到 → 保留，只报告
  //   ③ AI 漏给判定（输出被截断等）→ 保留，只报告
  function 应删除(r) {
    if (r.检索不到) return true;
    if (r.未判) return false;
    if (r.判定 === '本人所说' || r.判定 === '原文未见') return false;
    return true;   // 他人所说 / 旁白叙述
  }

  function 完成并清理() {
    var 统计 = {};
    话语审查档位.forEach(function(k) { 统计[k] = 0; });
    结果.forEach(function(r) { if (!r.未判 && !r.检索不到) 统计[r.判定] = (统计[r.判定] || 0) + 1; });
    var 移除集 = {};
    结果.forEach(function(r) { if (应删除(r)) 移除集[r.文本] = 1; });
    var 保留 = lines.filter(function(t) { return !移除集[t]; });   // 按原顺序保留
    var 移除数 = lines.length - 保留.length;
    var 未见保留数 = 结果.filter(function(r) { return !r.检索不到 && !r.未判 && r.判定 === '原文未见'; }).length;
    var 未判保留数 = 结果.filter(function(r) { return r.未判; }).length;
    var 明细 = '（他人所说 ' + 统计['他人所说'] + ' · 旁白叙述 ' + 统计['旁白叙述'] + ' · 原文检索不到 ' + 检索不到.length + '）';
    var 尾巴 = (未见保留数 ? '；另有 ' + 未见保留数 + ' 条 AI 说在这段里没看到，但原文确实含有，已保留' : '')
      + (未判保留数 ? '；另有 ' + 未判保留数 + ' 条 AI 未给出判定，已保留' : '');
    if (!移除数) {
      toast('✅ 核对完成：' + lines.length + ' 条全部确认为该角色本人所说，未做改动' + 尾巴);
      return;
    }
    小说提取写入话语(c, 保留).then(function() {
      toast('✅ 核对完成：' + lines.length + ' 条中移除 ' + 移除数 + ' 条' + 明细 + '，现余 ' + 保留.length + ' 条' + 尾巴);
      刷新视图();
    }).catch(function() { toast('⚠️ 清理写入失败，话语未改动'); });
  }

  // 只判归属：这些话语都已在全文中检索到（就在下面这一段里），请判断每一句是谁说的
  function 审一批(bi) {
    if (bi >= 批次.length) { 完成并清理(); return; }
    var 批 = 批次[bi];
    var seg = 批.段号;
    var 本批 = 批.文本数组.map(function(t, j) { return { 序号: j + 1, 文本: t }; });
    var 待核对 = 本批.map(function(x) { return x.序号 + '. ' + x.文本; }).join('\n');
    var 证据 = '【原文第 ' + seg + '/' + chunks.length + ' 段（这些话语就是从这一段里摘出来的，请只依据这一段判断）】\n' + chunks[seg - 1];
    var 核对范围 = '这些话语都已经在这一段原文里检索到（可能只是标点、空格与原文略有出入），它们就出自这一段全文（第 '
      + seg + '/' + chunks.length + ' 段）。请只依据这一段判断每一句是**谁说的**；确实在这段里找不到对应的那句话时，才判「原文未见」并在依据里说明。';

    var _r = renderPrompt('ext_char_speech_verify', {
      角色名: c.name + (Array.isArray(c.aliases) && c.aliases.length ? '（别名：' + c.aliases.join('、') + '）' : ''),
      条数: 本批.length,
      待核对: 待核对,
      核对范围: 核对范围,
      原文段落: 证据,
    });
    LLM.callJSON({
      prompt: _r.user,
      system: _r.system,
      label: '话语核对 ' + name + ' 第' + seg + '/' + chunks.length + '段（' + 本批.length + '条，第' + (bi + 1) + '/' + 总批数 + '次）',
      temperature: 0.1,
    }).then(function(data) {
      var items = (data && Array.isArray(data.items)) ? data.items : [];
      var 本批表 = {};
      本批.forEach(function(x) { 本批表[x.序号] = x.文本; });
      items.forEach(function(it) {
        var idx = parseInt(it && it.i, 10);
        if (!本批表[idx]) return;
        var 判定 = 话语审查档位.indexOf(it.判定) >= 0 ? it.判定 : '原文未见';
        结果.push({ 文本: 本批表[idx], 判定: 判定, 依据: it.依据 || '', 段号: seg });
      });
      // 模型漏给判定的条目：标为「未判」并保留（不删），最后在提示里报出来——
      // 不设条数上限后单次输出可能较长，万一被截断也不能因此把话删掉
      var 已判 = {};
      结果.forEach(function(r) { 已判[r.文本] = 1; });
      本批.forEach(function(x) { if (!已判[x.文本]) 结果.push({ 文本: x.文本, 判定: '原文未见', 依据: '（AI 未返回该条判定）', 段号: seg, 未判: true }); });
      审一批(bi + 1);
    }).catch(function(err) {
      // 核对没跑完就不确定哪些该删，一律不动话语：整轮中止（用户在右下角卡点「终止」也走这里）
      console.warn('[话语审查] 第 ' + (bi + 1) + ' 次核对失败:', err && err.message ? err.message : err);
      toast('⏹ 核对中止于第 ' + (bi + 1) + '/' + 总批数 + ' 次，话语未做任何改动');
    });
  }

  // 检索不到的条目不必问 AI：直接按「原文里没有这句话」记结果
  检索不到.forEach(function(t) { 结果.push({ 文本: t, 判定: '原文检索不到', 依据: '全文检索不到这句话（被改写、拼接或编造）', 检索不到: true, 段号: 0 }); });

  审一批(0);
}
window.小说提取话语可靠性审查 = 小说提取话语可靠性审查;
