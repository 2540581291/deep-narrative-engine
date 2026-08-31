// ===== 别名补全：全文搜索角色其他称呼（分段并行） =====

// ===== 弹窗：别名搜索 =====
window.小说提取弹出别名输入 = function(name) {
  if (document.getElementById('aliasSearchOverlay')) return;
  var ov = document.createElement('div');
  ov.id = 'aliasSearchOverlay';
  ov.className = 'ovl';
  ov.innerHTML = '<div class="mcard" style="max-width:520px;width:90%">' +
    '<div style="font-size:15px;font-weight:600;margin-bottom:4px">📌 别名补全</div>' +
    '<div style="font-size:11px;color:var(--fg2);margin-bottom:14px">角色：' + escHtml(name) + '</div>' +
    '<div style="font-size:11px;font-weight:500;margin-bottom:6px;color:var(--fg)">搜索提示（可选）</div>' +
    '<div style="font-size:10px;color:var(--fg3);margin-bottom:8px">例如：该角色后期改名为XXX / 重点关注家族称呼和封号</div>' +
    '<textarea id="aliasSearchHint" class="llm-input" rows="3" style="width:100%;font-size:12px;resize:vertical;font-family:inherit" placeholder="留空则搜索所有可能称呼……"></textarea>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">' +
    '<button class="btn-out" onclick="this.closest(\'.ovl\').remove()">取消</button>' +
    '<button class="btn-main" onclick="小说提取确认别名补全(\'' + escHtml(name) + '\')">🔍 开始搜索</button>' +
    '</div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', function(e) { if (e.target === ov) ov.remove(); });
};

window.小说提取确认别名补全 = function(name) {
  var hintInput = document.getElementById('aliasSearchHint');
  var hint = hintInput ? hintInput.value.trim() : '';
  var ov = document.getElementById('aliasSearchOverlay');
  if (ov) ov.remove();
  小说提取别名补全(name, hint);
};

window.小说提取别名补全 = function(name, userHint) {
  if (!name) { toast("请指定角色"); return; }
  var fullText = 小说提取原始文本 || "";
  if (!fullText || fullText.length < 50) { toast("⚠️ 原文已丢失"); return; }

  var chunks = 切割文本(fullText, 120000);
  if (chunks.length > 100) chunks = chunks.slice(0, 100);

  var maxConcurrent = 5;
  var allAliases = [];
  var processed = 0;

  function processNextBatch() {
    var batch = chunks.slice(processed, processed + maxConcurrent);
    if (!batch.length) return Promise.resolve();

    return Promise.allSettled(batch.map(function(chunk, i) {
      var globalIdx = processed + i;
      var _r = renderPrompt('ext_char_alias', {
        角色名: name,
        提示: (userHint ? "\n\n【用户提示】\n" + userHint + "\n" : ""),
        文本: chunk,
      });
      return LLM.callJSON({
        prompt: _r.user,
        system: _r.system,
        label: "别名搜索 " + name + " 第" + (globalIdx + 1) + "/" + chunks.length + "段",
        temperature: 0.1
      });
    })).then(function(results) {
      results.forEach(function(r) {
        if (r.status === "fulfilled" && r.value) {
          var data = r.value;
          if (data.found && Array.isArray(data.aliases) && data.aliases.length) {
            data.aliases.forEach(function(a) {
              if (a && a !== name && allAliases.indexOf(a) < 0) allAliases.push(a);
            });
          }
        }
      });
      processed += batch.length;
      return processNextBatch();
    });
  }

  processNextBatch().then(function() {
    if (!allAliases.length) {
      toast("✅ 未发现其他称呼");
      return;
    }

    小说提取角色列表.forEach(function(c) {
      if (c.name === name) {
        if (!c.aliases) c.aliases = [];
        var count = 0;
        allAliases.forEach(function(a) {
          if (c.aliases.indexOf(a) < 0) { c.aliases.push(a); count++; }
        });
        // 去重兜底
        c.aliases = c.aliases.filter(function(v, i, self) { return self.indexOf(v) === i; });
        小说提取保存当前记录();
        刷新视图();
        toast("✅ 角色「" + name + "」别名搜索完成，新增 " + count + " 个");
      }
    });
  }).catch(function(err) {
    console.warn("别名搜索失败:", err);
    toast("⚠️ 别名搜索失败: " + (err.message || ""));
  });
};

// ===== 按用户意见重新审查 =====
window.重新审查按意见 = function() {
  var input = document.getElementById('review_user_input');
  var userOpinion = input ? input.value.trim() : '';
  if (!userOpinion) { toast('请先输入修改意见'); return; }

  var oldCorrections = window._reviewCorrections || [];
  var sorted = 小说提取角色列表.slice().sort(function(a, b) {
    var ai = 小说提取性别顺序.indexOf(a.gender);
    var bi = 小说提取性别顺序.indexOf(b.gender);
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
  });
  var ALL_CHAR_FIELDS = 小说提取审查字段;
  var charList = sorted.map(function(c) {
    var parts = ['name:' + c.name, 'gender:' + c.gender, 'role:' + c.role];
    ALL_CHAR_FIELDS.slice(3).forEach(function(f) {
      if (c[f] && c[f] !== 'null') parts.push(f + ':' + String(c[f]).substring(0, 200));
    });
    return parts.join('  ');
  }).join('\n\n---\n\n');

  var oldPlan = oldCorrections.length ? '当前已发现的修正方案：\n' + JSON.stringify(oldCorrections, null, 2) : '当前暂无修正方案。';

  var _r = renderPrompt('ext_char_review_revise', {
    角色列表: charList,
    旧方案: oldPlan,
    用户意见: userOpinion,
  });

  LLM.callJSON({
    prompt: _r.user,
    system: _r.system,
    label: '重新审查-按意见',
    temperature: 0.2
  }).then(function(data) {
    window._reviewCorrections = (data && data.corrections) || [];
    显示审查结果面板(window._reviewCorrections, !data || !data.corrections || !data.corrections.length);
    if (data && data.corrections && data.corrections.length) {
      toast('审查方案已按意见更新');
    } else if (!data) {
      toast('⚠️ LLM 返回无法解析，请重试');
    }
  }).catch(function(err) {
    console.warn('重新审查 LLM 调用失败:', err);
    toast('⚠️ 重新审查调用失败: ' + (err.message || '未知错误'));
  });
};
