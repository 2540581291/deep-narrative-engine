// 深度-叙事引擎 · 角色卡 · 📖 小说提取 · 工具函数

// ===== 工具函数 =====

function 切割文本(text, maxLen) {
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  var paragraphs = text.split('\n');
  var chunks = [];
  var current = [];
  var currentLen = 0;

  paragraphs.forEach(function(p) {
    var newLen = currentLen + (current.length > 0 ? 1 : 0) + p.length;
    if (newLen > maxLen && current.length > 0) {
      chunks.push(current.join('\n'));
      current = [p];
      currentLen = p.length;
    } else {
      current.push(p);
      currentLen = newLen;
    }
  });

  if (current.length > 0) {
    chunks.push(current.join('\n'));
  }

  return chunks;
}

// 从全文中提取指定角色出现的段落（跨章节，确保描述生成基于角色实际出场内容）
function 提取角色相关段落(fullText, charName, maxLen) {
  if (!fullText || !charName) return '（无可参考的原文段落）';
  var paras = fullText.split('\n');
  var matched = [];
  paras.forEach(function(p) {
    if (p.indexOf(charName) >= 0) {
      matched.push(p);
    }
  });
  var result = matched.join('\n\n');
  if (result.length > maxLen) {
    result = result.substring(0, maxLen) + '\n\n……（剩余角色相关段落已省略）';
  }
  return result || '（无直接提及该角色的原文段落，依赖提取信息生成）';
}

// 全文锚点定位：按名字出现次数均分段落提取。
// 规则：全文≤maxChars 整篇返回；否则按名字出现顺序均分 ≤maxSegs 段，
// 每段取"名字出现的最中间"为核心锚点截取 2×contextLen 字符；
// 第一次/最后一次出现强制锁定为独立段；相邻段窗口重叠时顺延平移避重。
// 返回 [{start,end,text}]
function 全文锚点段落(fullText, terms, opts) {
  opts = opts || {};
  var contextLen = opts.contextLen || 1000;
  var maxChars = opts.maxChars != null ? opts.maxChars : 100000;
  var maxSegs = opts.maxSegs != null ? opts.maxSegs : 50;
  var totalChars = fullText.length;

  // 第 0 步：小文整篇传输
  if (!totalChars) return [];
  if (totalChars <= maxChars) {
    return [{ start: 0, end: totalChars, text: fullText }];
  }

  // 第 1 步：收集所有出现位置（多词条合并、排序、去重）
  var positions = [];
  terms.forEach(function(term) {
    if (!term) return;
    var pos = -1;
    while ((pos = fullText.indexOf(term, pos + 1)) >= 0) positions.push(pos);
  });
  positions.sort(function(a, b) { return a - b; });
  var occurrences = [];
  positions.forEach(function(p) {
    if (!occurrences.length || Math.abs(occurrences[occurrences.length - 1] - p) > 3) occurrences.push(p);
  });
  var N = occurrences.length;
  if (!N) return [];

  // 第 1.5 步：出现点不足 maxSegs 时，从出现点连续无缝顺延（不跳段）
  // 每段 2000 字（contextLen 前后各 1000），前段紧接后段边界，前后交替延伸，直到满 maxSegs 或触及全文两端
  if (N < maxSegs) {
    var 顺延段 = []; // 已收集的段 [start,end]
    function 已顺延覆盖(a) { return 顺延段.some(function(t) { return a >= t.start && a <= t.end; }); }
    function 加段(w) {
      顺延段.push({ start: w.start, end: w.end });
      顺延段.sort(function(a, b) { return a.start - b.start; });
    }
    // 每段固定宽度 = contextLen * 2
    var 段宽 = contextLen * 2;
    // 对每个出现点：以其窗口为起点，前后交替无缝顺延
    occurrences.forEach(function(p) {
      var curStart = Math.max(0, p - contextLen);
      var curEnd = Math.min(totalChars, p + contextLen);
      // 起点段（含出现点）
      if (!已顺延覆盖((curStart + curEnd) / 2)) 加段({ start: curStart, end: curEnd });
      // 前后交替：向前一步、向后一步，直到满 maxSegs 或两端都到边界
      var 前边界 = curStart, 后边界 = curEnd;
      var 已到前 = 前边界 <= 0, 已到后 = 后边界 >= totalChars;
      while (顺延段.length < maxSegs && (!已到前 || !已到后)) {
        // 向前：紧贴当前前边界往前 2000
        if (!已到前 && 顺延段.length < maxSegs) {
          var ns = 前边界 - 段宽;
          var nStart = Math.max(0, ns), nEnd = 前边界;
          if (nStart !== nEnd) {
            var nMid = (nStart + nEnd) / 2;
            if (!已顺延覆盖(nMid)) 加段({ start: nStart, end: nEnd });
          }
          前边界 = nStart;
          if (前边界 <= 0) 已到前 = true;
        }
        // 向后：紧贴当前后边界往后 2000
        if (!已到后 && 顺延段.length < maxSegs) {
          var ne = 后边界 + 段宽;
          var eEnd = Math.min(totalChars, ne), eStart = 后边界;
          if (eStart !== eEnd) {
            var eMid = (eStart + eEnd) / 2;
            if (!已顺延覆盖(eMid)) 加段({ start: eStart, end: eEnd });
          }
          后边界 = eEnd;
          if (后边界 >= totalChars) 已到后 = true;
        }
      }
      if (顺延段.length >= maxSegs) return; // 已满 50 段，停止
    });
    // 排序 + 拼装
    顺延段.sort(function(a, b) { return a.start - b.start; });
    return 顺延段.map(function(t) {
      return { start: t.start, end: t.end, text: fullText.substring(t.start, t.end) };
    });
  }

  // 第 2 步：按出现次数均分（首尾强制锁定）
  var anchors = []; // 每段的核心锚点位置
  if (N <= 2) {
    // 只有首尾（或更少）：每个出现单独一段
    occurrences.forEach(function(p) { anchors.push(p); });
  } else if (N < maxSegs) {
    // 出现不足 50：每个出现单独一段，首尾锁定自然满足
    occurrences.forEach(function(p) { anchors.push(p); });
  } else {
    // 首尾强制锁定
    anchors.push(occurrences[0]);
    anchors.push(occurrences[N - 1]);
    // 中间 N-2 个出现均分成 ≤maxSegs-2 段
    var inner = occurrences.slice(1, N - 1);
    var per = Math.ceil(inner.length / (maxSegs - 2));
    for (var i = 0; i < inner.length; i += per) {
      var seg = inner.slice(i, i + per);
      anchors.push(seg[Math.floor(seg.length / 2)]); // 取段内最中间出现
    }
  }
  anchors.sort(function(a, b) { return a - b; });

  // 第 3 步：每段转窗口
  function 窗口(a) {
    return { start: Math.max(0, a - contextLen), end: Math.min(totalChars, a + contextLen) };
  }
  var windows = anchors.map(窗口);

  // 第 4 步：顺延去重——窗口重叠时重新定位到"含角色名的未覆盖位置"，只保留未覆盖的新内容
  var taken = []; // 已确认的段（按 start 排序维护）
  function 与已选重叠(w) {
    return taken.some(function(t) { return w.start < t.end && t.start < w.end; });
  }
  // 已被任意已选窗口覆盖的出现位置集合
  function 已覆盖出现() {
    var covered = {};
    taken.forEach(function(t) {
      for (var i = 0; i < occurrences.length; i++) {
        if (occurrences[i] >= t.start && occurrences[i] <= t.end) covered[occurrences[i]] = true;
      }
    });
    return covered;
  }
  windows.forEach(function(w) {
    if (!与已选重叠(w)) {
      taken.push(w);
      taken.sort(function(a, b) { return a.start - b.start; });
      return;
    }
    // 有重叠：先找"含角色名的未覆盖出现位置"作新锚点
    var placed = false;
    var covered = 已覆盖出现();
    // 未覆盖的出现位置，按离当前锚点距离排序
    var free = occurrences.filter(function(p) { return !covered[p]; });
    free.sort(function(a, b) { return Math.abs(a - w.start) - Math.abs(b - w.start); });
    for (var fi = 0; fi < free.length; fi++) {
      var nw = 窗口(free[fi]);
      if (!与已选重叠(nw)) {
        taken.push(nw);
        taken.sort(function(a, b) { return a.start - b.start; });
        placed = true;
        break;
      }
    }
    if (placed) return;
    // 所有含角色名的未覆盖位置都放不下窗口：退而求其次，找最近的空隙（接受可能不含名）
    taken.sort(function(a, b) { return a.start - b.start; });
    var gaps = [];
    if (taken[0].start > 0) gaps.push({ start: 0, end: taken[0].start });
    for (var gi = 0; gi < taken.length - 1; gi++) {
      gaps.push({ start: taken[gi].end, end: taken[gi + 1].start });
    }
    var last = taken[taken.length - 1];
    if (last.end < totalChars) gaps.push({ start: last.end, end: totalChars });
    var bestGap = null, bestDist = Infinity;
    gaps.forEach(function(g) {
      var space = g.end - g.start;
      if (space <= 0) return;
      var gapMid = (g.start + g.end) / 2;
      var d = Math.abs(gapMid - w.start);
      if (space >= contextLen * 2 && d < bestDist) { bestDist = d; bestGap = g; }
    });
    if (bestGap) {
      var gw = { start: Math.min(Math.max(bestGap.start, w.start), bestGap.end - contextLen * 2), end: 0 };
      gw.end = Math.min(totalChars, gw.start + contextLen * 2);
      if (!与已选重叠(gw)) {
        taken.push(gw);
        taken.sort(function(a, b) { return a.start - b.start; });
        placed = true;
      }
    }
    if (!placed) {
      // 无处顺延：回退保留原窗口（接受小重叠），避免丢段
      taken.push(w);
      taken.sort(function(a, b) { return a.start - b.start; });
    }
  });

  // 第 5 步：排序 + 拼装
  taken.sort(function(a, b) { return a.start - b.start; });
  return taken.map(function(t) {
    return { start: t.start, end: t.end, text: fullText.substring(t.start, t.end) };
  });
}

function 合并角色列表(allResults) {
  var roleWeight = { '主角': 3, '主配': 2.5, '配角': 2, '龙套': 1 };
  var textFields = 小说提取文本字段.filter(function(f) { return f !== 'name'; });

  function 合并字段(exist, c, field) {
    var a = (exist[field] || '').toString().trim();
    var b = (c[field] || '').toString().trim();
    if (!b || b === 'null') return;
    if (!a || a === 'null') { exist[field] = b; return; }
    if (b.length > a.length) {
      exist[field] = b;
    }
  }

  function 合并别名(exist, c) {
    var alias = c.aliases;
    if (!alias || alias === 'null') return;
    // aliases 可能是字符串（JSON 中直接写字符串）或数组
    var names = Array.isArray(alias) ? alias : [alias];
    if (!exist.aliases) exist.aliases = [];
    names.forEach(function(n) {
      var v = String(n).trim();
      if (v && exist.aliases.indexOf(v) < 0 && v !== exist.name) {
        exist.aliases.push(v);
      }
    });
  }

  // 性爱明细数组：各段提取的明细按顺序合并、去重（同文案不重复）
  function 合并明细(exist, c) {
    var details = c.sexualDetails;
    if (!details) return;
    var list = Array.isArray(details) ? details : [details];
    if (!exist.sexualDetails) exist.sexualDetails = [];
    list.forEach(function(d) {
      var v = String(d).trim();
      if (v && exist.sexualDetails.indexOf(v) < 0) {
        exist.sexualDetails.push(v);
      }
    });
  }

  // 通用数组字段合并（catchphrases/bedroomTalk）：各段去重合并
  function 合并数组字段(exist, c, field) {
    var arr = c[field];
    if (!arr) return;
    var list = Array.isArray(arr) ? arr : [arr];
    if (!exist[field]) exist[field] = [];
    list.forEach(function(d) {
      var v = String(d).trim();
      if (v && v !== 'null' && exist[field].indexOf(v) < 0) {
        exist[field].push(v);
      }
    });
  }

  var merged = {};

  allResults.forEach(function(chunkChars) {
    chunkChars.forEach(function(c) {
      var name = c.name;
      if (!name) return;

      if (merged[name]) {
        var exist = merged[name];
        var curW = roleWeight[c.role] || 0;
        var existW = roleWeight[exist.role] || 0;
        if (curW > existW) exist.role = c.role;
        if (exist.gender === 'other' && c.gender !== 'other') {
          exist.gender = 小说提取规范化性别(c.gender);
        }
        textFields.forEach(function(f) { 合并字段(exist, c, f); });
        合并别名(exist, c);
        合并明细(exist, c);
        合并数组字段(exist, c, 'catchphrases');
        合并数组字段(exist, c, 'bedroomTalk');
      } else {
        merged[name] = { name: name, gender: 小说提取规范化性别(c.gender), role: c.role || '龙套' };
        textFields.forEach(function(f) {
          merged[name][f] = (c[f] && c[f] !== 'null') ? c[f] : null;
        });
        // 新角色直接拷贝明细数组
        if (c.sexualDetails) merged[name].sexualDetails = Array.isArray(c.sexualDetails) ? c.sexualDetails.slice() : [c.sexualDetails];
        // 拷贝口头禅与做爱的话数组
        if (c.catchphrases) merged[name].catchphrases = Array.isArray(c.catchphrases) ? c.catchphrases.slice() : [c.catchphrases];
        if (c.bedroomTalk) merged[name].bedroomTalk = Array.isArray(c.bedroomTalk) ? c.bedroomTalk.slice() : [c.bedroomTalk];
      }
    });
  });

  return Object.keys(merged).map(function(k) { return merged[k]; });
}
