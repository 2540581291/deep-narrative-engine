// 深度-叙事引擎 · 角色卡 · 📖 小说提取 · AI 分段分析提取（主流程）
// 分段分析 + 合并去重 + 断点续传

// ===== AI 分析提取（分段分析 + 合并去重，覆盖全文） =====
window.小说提取开始分析 = function() {
  // 在用户手势窗口内预热提示音 AudioContext，确保完成时能正常播放
  if (typeof window.预热提示音 === 'function') window.预热提示音();
  var text = 小说提取原始文本 || '';
  if (!text || text.length < 50) {
    var ta = document.getElementById('novelPasteArea');
    text = ta ? ta.value.trim() : '';
  }
  if (!text || text.length < 50) { toast('请至少输入 50 字以上的文本'); return; }

  小说提取原始文本 = text;
  小说提取步骤 = 'analyzing';
  小说提取角色列表 = [];
  小说提取角色描述 = {};
  小说提取生成中 = {};
  小说提取审查进度 = null;
  小说提取展开角色 = {};
  小说提取当前记录ID = null;
  // 保留文件名标题，让文件夹以用户上传的文件命名
  if (!小说提取当前记录标题) 小说提取当前记录标题 = '';
  小说提取当前记录时间 = null;
  小说提取分析进度 = { done: 0, total: 0 };
  小说提取分析中结果 = null;
  小说提取请求暂停 = false;
  刷新视图();

  // 读取分段上限
  var limitInput = document.getElementById('chunkLimitInput');
  小说提取分段上限 = limitInput ? parseInt(limitInput.value) || 0 : 0;


  var maxChunkLen = 120000;
  var chunks = 切割文本(text, maxChunkLen);

  var maxChunks = 100;
  if (chunks.length > maxChunks) {
    chunks = chunks.slice(0, maxChunks);
    toast('⚠️ 文本超长，将分析前约 1200 万字');
  }

  小说提取分析进度.total = chunks.length;
  刷新视图();

  var allChunkResults = [];
  var 当前已识别摘要 = '';
  function 构建已识别摘要() {
    var merged = 合并角色列表(allChunkResults);
    if (!merged.length) return '（暂未识别到角色）';
    var lines = merged.map(function(c) {
      return c.name + '（' + (c.gender || '未知') + '，' + (c.role || '龙套') + '）：' + (c.brief ? c.brief.substring(0, 60) : '暂无概要');
    });
    return '前段已识别角色：\n' + lines.join('\n');
  }

  function 处理下一段(idx) {

    // 检查是否请求暂停
    if (小说提取请求暂停) {
      小说提取请求暂停 = false;
      小说提取分析中结果 = allChunkResults;
      小说提取分析进度.done = idx;
      // 先保存记录（生成ID和文件夹），再写进度到文件夹内
      小说提取角色列表 = 合并角色列表(allChunkResults);
      小说提取步骤 = 'paused';
      小说提取保存当前记录();
      小说提取保存进度();
      toast("⏸️ 分析已暂停，已保存 " + 小说提取角色列表.length + " 个角色到历史");
      return;
    }
if (idx >= chunks.length) {
      var merged = 合并角色列表(allChunkResults);
      if (!merged.length) {
        小说提取步骤 = 'error';
        刷新视图();
        return;
      }
      // 全部分段分析完毕，直接展示合并结果
      小说提取角色列表 = merged;
      小说提取步骤 = 'result';
      刷新视图();
      小说提取保存当前记录();
      // 清除临时进度文件
      小说提取清除进度();
      if (typeof window.playDing === 'function') window.playDing();
      toast('✅ 分析完成，共提取 ' + 小说提取角色列表.length + ' 个角色');
      return;
    }

    // 检查分段上限
    if (小说提取分段上限 > 0 && idx >= 小说提取分段上限) {
      小说提取分析中结果 = allChunkResults;
      小说提取分析进度.done = idx;
      小说提取角色列表 = 合并角色列表(allChunkResults);
      小说提取步骤 = 'paused';
      小说提取保存当前记录();
      小说提取保存进度().then(function() {
        刷新视图();
        toast('⏸️ 已达分段上限，进度已保存');
      }).catch(function() {
        小说提取步骤 = 'paused';
        刷新视图();
        toast('⏸️ 已达分段上限');
      });
      return;
    }

    小说提取分析进度.done = idx;
    刷新视图();

    var chunkText = chunks[idx];
    var chunkLabel = '第' + (idx + 1) + '/' + chunks.length + '段';

    var 字段Schema = 小说提取字段Schema(小说提取字段序);
    var _r = renderPrompt('ext_char_extract', {
      已识别摘要: 当前已识别摘要,
      chunkLabel: chunkLabel,
      chunkText: chunkText,
      字段Schema: 字段Schema,
    });
    var llmPromise = LLM.callJSON({
      prompt: _r.user,
      system: _r.system,
      label: '角色提取 ' + chunkLabel,
      temperature: 0.3,
    }).then(function(data) {
      try {
        if (data && data.characters && data.characters.length) {
          allChunkResults.push(data.characters);
          当前已识别摘要 = 构建已识别摘要();
        }
      } catch(e) { console.warn('[提取] 解析失败:', e); }
      // 每段保存进度和角色卡片
      小说提取分析中结果 = allChunkResults;
      小说提取角色列表 = 合并角色列表(allChunkResults);
      小说提取保存当前记录();
      小说提取保存进度().catch(function(e) { console.warn("文件删除失败:", e); });
      处理下一段(idx + 1);
    }).catch(function(err) {
      console.error('[提取] LLM 调用失败:', err && err.message ? err.message : err);
      // 调用失败时保存当前进度并暂停，下次可继续
      小说提取分析中结果 = allChunkResults;
      小说提取角色列表 = 合并角色列表(allChunkResults);
      小说提取步骤 = 'paused';
      小说提取分析进度.done = idx;
      小说提取保存当前记录();
      小说提取保存进度();
      刷新视图();
      toast('⚠️ AI 调用失败，进度已保存（第 ' + (idx + 1) + '/' + chunks.length + ' 段）');
    });
  }
  处理下一段(0);
};

// ===== 暂停分析 =====
window.小说提取暂停分析 = function() {
  小说提取请求暂停 = true;
  toast('⏸️ 正在等待当前段处理完成...');
};
// ===== 继续分析（断点续传） =====
window.小说提取继续分析 = function() {
  var saved = 小说提取加载进度();
  if (!saved || !saved.allResults || !saved.allResults.length) {
    toast("⚠️ 未找到保存的进度，请重新开始分析");
    return;
  }
  var text = 小说提取原始文本 || "";
  if (!text || text.length < 50) { toast("⚠️ 原文已丢失，请重新加载"); return; }
  小说提取步骤 = "analyzing";
  小说提取审查进度 = null;
  刷新视图();
  var maxChunkLen = 120000;
  var chunks = 切割文本(text, maxChunkLen);
  if (chunks.length > 100) chunks = chunks.slice(0, 100);
  var allChunkResults = saved.allResults;
  var startIdx = saved.done;
  小说提取分析进度 = { done: startIdx, total: chunks.length };
  小说提取分析中结果 = allChunkResults;
  刷新视图();
  function 构建已识别摘要() {
    var merged = 合并角色列表(allChunkResults);
    if (!merged.length) return "（暂未识别到角色）";
    var cl = merged.map(function(c) {
      return c.name + "（" + (c.gender || "未知") + "，" + (c.role || "龙套") + "）：" + (c.brief ? c.brief.substring(0, 60) : "暂无概要");
    });
    return "前段已识别角色：\n" + cl.join("\n");
  }
  function 处理下一段(idx) {
    if (小说提取请求暂停) {
      小说提取请求暂停 = false;
      小说提取分析中结果 = allChunkResults;
      小说提取分析进度.done = idx;
      // 先保存记录（生成ID和文件夹），再写进度到文件夹内
      小说提取角色列表 = 合并角色列表(allChunkResults);
      小说提取步骤 = "paused";
      小说提取保存当前记录();
      小说提取保存进度();
      刷新视图();
      toast("⏸️ 分析已暂停，已保存 " + 小说提取角色列表.length + " 个角色到历史");
      return;
    }
    if (idx >= chunks.length) {
      var merged = 合并角色列表(allChunkResults);
      if (!merged.length) {
        小说提取步骤 = "error";
        刷新视图();
        return;
      }
      小说提取角色列表 = merged;
      小说提取步骤 = "result";
      刷新视图();
      小说提取保存当前记录();
      小说提取清除进度();
      if (typeof window.playDing === 'function') window.playDing();
      toast("✅ 分析完成，共提取 " + 小说提取角色列表.length + " 个角色");
      return;
    }
    if (小说提取分段上限 > 0 && idx >= 小说提取分段上限) {
      小说提取分析中结果 = allChunkResults;
      小说提取分析进度.done = idx;
      小说提取角色列表 = 合并角色列表(allChunkResults);
      小说提取步骤 = "paused";
      小说提取保存当前记录();
      小说提取保存进度().then(function() {
        刷新视图();
        toast("⏸️ 已达分段上限，进度已保存");
      }).catch(function() {
        小说提取步骤 = "paused";
        刷新视图();
        toast("⏸️ 已达分段上限");
      });
      return;
    }
    小说提取分析进度.done = idx;
    刷新视图();
    var chunkText = chunks[idx];
    var chunkLabel = "第" + (idx + 1) + "/" + chunks.length + "段";
    var 字段Schema = 小说提取字段Schema(小说提取字段序);
    var _r = renderPrompt('ext_char_extract', {
      已识别摘要: 构建已识别摘要(),
      chunkLabel: chunkLabel,
      chunkText: chunkText,
      字段Schema: 字段Schema,
    });
    LLM.callJSON({
      prompt: _r.user,
      system: _r.system,
      label: "角色提取 " + chunkLabel,
      temperature: 0.3,
    }).then(function(data) {
      try {
        if (data && data.characters && data.characters.length) {
          allChunkResults.push(data.characters);
        }
      } catch(e) { console.warn('[提取] 解析失败:', e); }
      小说提取分析中结果 = allChunkResults;
      小说提取角色列表 = 合并角色列表(allChunkResults);
      小说提取保存当前记录();
      小说提取保存进度().catch(function() {});
      处理下一段(idx + 1);
    }).catch(function(err) {
      console.error('[提取续] LLM 调用失败:', err && err.message ? err.message : err);
      // 调用失败时保存当前进度并暂停
      小说提取分析中结果 = allChunkResults;
      小说提取角色列表 = 合并角色列表(allChunkResults);
      小说提取步骤 = 'paused';
      小说提取分析进度.done = idx;
      小说提取保存当前记录();
      小说提取保存进度();
      刷新视图();
      toast('⚠️ AI 调用失败，进度已保存（第 ' + (idx + 1) + '/' + chunks.length + ' 段）');
    });
  }
  处理下一段(startIdx);
};
