// 深度-叙事引擎 · 使用统计弹窗
var _usageTab = 'session';
var _usageDateFrom = '';
var _usageDateTo = '';
var _usageDrillLabel = null;
var _usageRankingExpanded = false;

function openUsageModal() {
  _usageTab = 'session'; _usageDateFrom = ''; _usageDateTo = ''; _usageDrillLabel = null; _usageRankingExpanded = false;
  var el = document.createElement('div');
  el.className = 'ovl'; el.id = 'usageOverlay';
  el.innerHTML = '<div class="mcard" style="max-width:720px;width:94vw;max-height:88vh;overflow-y:auto;padding:0">' +
    '<div style="padding:14px 18px 0 18px">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
    '<h3 style="font-size:1em">💰 使用统计' +
    '<span id="usageBreadcrumb" style="font-size:0.72em;color:var(--accent2);margin-left:6px;cursor:pointer;display:none" onclick="usageClearDrill()"> ← 返回</span></h3>' +
    '<span class="btn-out" style="padding:2px 10px;font-size:0.72em;cursor:pointer" onclick="this.closest(\'.ovl\').remove()">✕ 关闭</span></div>' +
    '<div style="display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap;align-items:center">' +
    '<button class="btn-main" id="usageTab_session" onclick="switchUsageTab(\'session\')" style="font-size:0.74em;padding:3px 12px">📊 本次启动</button>' +
    '<button class="btn-out" id="usageTab_all" onclick="switchUsageTab(\'all\')" style="font-size:0.74em;padding:3px 12px">📈 历史总计</button>' +
    '<span class="flex-1"></span>' +
    '<span id="usageDatePicker" style="display:' + (_usageTab === 'all' ? 'inline' : 'none') + '">' +
    '<select id="usageDateFrom" class="llm-input llm-select" style="width:auto;font-size:0.68em;padding:2px 6px" onchange="usageDateFilter()"><option value="">起始日期</option></select>' +
    '<span style="font-size:0.68em;color:var(--fg2);margin:0 2px">—</span>' +
    '<select id="usageDateTo" class="llm-input llm-select" style="width:auto;font-size:0.68em;padding:2px 6px" onchange="usageDateFilter()"><option value="">结束日期</option></select></span></div>' +
    '<div id="usageModalLoading" style="text-align:center;padding:30px;color:var(--fg2);font-size:0.82em">加载中...</div>' +
    '<div id="usageModalTotals"></div><div id="usageModalActive" class="mb-8"></div>' +
    '<div id="usageModalTimeline" class="mb-10"></div>' +
    '<div id="usageModalRanking" class="mb-10"></div>' +
    '<div id="usageModalDetail" class="mb-8"></div>' +
    '<div style="font-size:0.62em;color:var(--fg2);text-align:center;padding:4px 14px 10px">Token ≈ 0.7 个汉字。费用按官方定价折算，高峰时段（北京 9-12/14-18）价格 ×2。</div></div></div>';
  document.body.appendChild(el);
  el.addEventListener('click', function(e) { if (e.target === el) el.remove(); });
  loadUsageData();
}

function usageClearDrill() { _usageDrillLabel = null; _usageRankingExpanded = false; var b = document.getElementById('usageBreadcrumb'); if (b) b.style.display = 'none'; renderContent(); }
function usageDateFilter() { var f = document.getElementById('usageDateFrom'); var t = document.getElementById('usageDateTo'); _usageDateFrom = f ? f.value : ''; _usageDateTo = t ? t.value : ''; renderContent(); }

function switchUsageTab(tab) {
  _usageTab = tab; _usageDrillLabel = null; _usageRankingExpanded = false;
  var b = document.getElementById('usageBreadcrumb'); if (b) b.style.display = 'none';
  var s = document.getElementById('usageTab_session'); var a = document.getElementById('usageTab_all');
  if (s) s.className = tab === 'session' ? 'btn-main' : 'btn-out';
  if (a) a.className = tab === 'all' ? 'btn-main' : 'btn-out';
  var dp = document.getElementById('usageDatePicker'); if (dp) dp.style.display = tab === 'all' ? 'inline' : 'none';
  renderContent();
}

function getFilteredUsage() {
  var data = _usageTab === 'session' ? window._usageSessionData : window._usageAllData;
  if (!data) return { models: {}, totalCost: 0, totalTokens: 0, records: [], timeline: [] };
  if (_usageDateFrom || _usageDateTo) {
    var fromTs = _usageDateFrom ? _usageDateFrom + 'T00:00:00' : '';
    var toTs = _usageDateTo ? _usageDateTo + 'T23:59:59' : '';
    var filtered = data.records.filter(function(r) { if (fromTs && r.timestamp < fromTs) return false; if (toTs && r.timestamp > toTs) return false; return true; });
    return recomputeFromRecords(filtered);
  }
  return data;
}

function recomputeFromRecords(records) {
  var models = {}, totalCost = 0, totalTokens = 0, totalHit = 0, totalMiss = 0, totalOut = 0, byLabel = {}, hourBuckets = {};
  for (var i = 0; i < records.length; i++) {
    var r = records[i];
    var key = r.provider + '/' + (r.model || 'unknown');
    if (!models[key]) models[key] = { provider: r.provider || '', model: r.model || '', promptTokens: 0, completionTokens: 0, totalTokens: 0, cacheHitTokens: 0, cacheMissTokens: 0, cost: 0, count: 0 };
    var m = models[key];
    m.promptTokens += r.promptTokens || 0; m.completionTokens += r.completionTokens || 0; m.totalTokens += r.totalTokens || 0;
    m.cacheHitTokens += r.cacheHitTokens || 0; m.cacheMissTokens += r.cacheMissTokens || 0; m.cost += r.estimatedCost || 0; m.count++;
    totalCost += r.estimatedCost || 0; totalTokens += r.totalTokens || 0;
    totalHit += r.cacheHitTokens || 0; totalMiss += r.cacheMissTokens || 0; totalOut += r.completionTokens || 0;
    var label = r.label || '其他';
    if (!byLabel[label]) byLabel[label] = { label: label, totalTokens: 0, totalCost: 0, count: 0 };
    byLabel[label].totalTokens += r.totalTokens || 0; byLabel[label].totalCost += r.estimatedCost || 0; byLabel[label].count++;
    if (r.timestamp) { var hk = r.timestamp.substring(0, 13); if (!hourBuckets[hk]) hourBuckets[hk] = { key: hk, day: r.timestamp.substring(0, 10), tokens: 0, cost: 0, count: 0 }; hourBuckets[hk].tokens += r.totalTokens || 0; hourBuckets[hk].cost += r.estimatedCost || 0; hourBuckets[hk].count++; }
  }
  var timeline = Object.keys(hourBuckets).sort().map(function(k) { return hourBuckets[k]; });
  return { models: models, totalCost: totalCost, totalTokens: totalTokens, cacheHitTokens: totalHit, cacheMissTokens: totalMiss, completionTokens: totalOut, count: records.length, byLabel: byLabel, records: records, timeline: timeline };
}

function loadUsageData() {
  getAllUsage().then(function(allData) {
    window._usageAllData = allData;
    var dates = {}; for (var i = 0; i < (allData.records || []).length; i++) { var ts = allData.records[i].timestamp; if (ts) dates[ts.substring(0, 10)] = true; }
    var dateList = Object.keys(dates).sort();
    var fromEl = document.getElementById('usageDateFrom'); var toEl = document.getElementById('usageDateTo');
    if (fromEl && toEl) {
      fromEl.innerHTML = '<option value="">起始日期</option>'; toEl.innerHTML = '<option value="">结束日期</option>';
      for (var di = 0; di < dateList.length; di++) { fromEl.innerHTML += '<option value="' + dateList[di] + '">' + dateList[di] + '</option>'; toEl.innerHTML += '<option value="' + dateList[di] + '">' + dateList[di] + '</option>'; }
    }
    return getSessionUsage();
  }).then(function(sessionData) {
    window._usageSessionData = sessionData;
    renderContent();
  });
}

function renderContent() {
  var data = getFilteredUsage();
  if (!data) { setTimeout(renderContent, 100); return; }
  window._usageCurrentData = data;
  renderSummary(data); renderActiveCalls(); renderTimeline(data); renderRanking(data);
  if (_usageDrillLabel) { renderDrillDetail(data); var b = document.getElementById('usageBreadcrumb'); if (b) b.style.display = 'inline'; }
  else { renderDetailTable(data); var b = document.getElementById('usageBreadcrumb'); if (b) b.style.display = 'none'; }
  var loading = document.getElementById('usageModalLoading'); if (loading) loading.style.display = 'none';
  if (window._usageRefreshTimer) clearInterval(window._usageRefreshTimer);
  window._usageRefreshTimer = setInterval(function() { var ov = document.getElementById('usageOverlay'); if (ov && ov.isConnected) renderActiveCalls(); else clearInterval(window._usageRefreshTimer); }, 3000);
}

function renderActiveCalls() {
  var active = getActiveCalls(); var container = document.getElementById('usageModalActive'); if (!container) return;
  if (active.length === 0) { container.style.display = 'none'; return; }
  container.style.display = 'block';
  var html = '<div style="background:var(--bg2);border:1px solid var(--green);border-radius:var(--radius);overflow:hidden;font-size:0.74em">';
  html += '<div style="padding:5px 10px;background:var(--bg);border-bottom:1px solid var(--border);font-weight:600;font-size:0.78em;display:flex;align-items:center;gap:6px">';
  html += '<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--green);animation:pulse 1.5s infinite"></span>正在消耗 Token 的功能</div>';
  for (var i = 0; i < active.length; i++) html += '<div style="display:flex;justify-content:space-between;padding:4px 10px;font-size:0.70em"><span>' + escHtml(active[i].name) + '</span><span class="c-fg2">' + active[i].elapsed + 's</span></div>';
  html += '</div>'; container.innerHTML = html;
}

function renderSummary(data) {
  if (!data) return;
  var html = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">' + summaryCard('📊 总用量', fmtToken(data.totalTokens) + ' Token', '#4ecca3') + summaryCard('💰 总花费', '¥' + data.totalCost.toFixed(4), '#ffc857') + summaryCard('🔄 调用', data.count, '#c084fc') + '</div>';
  // Token 拆分：输入(命中缓存) / 输入(未命中缓存) / 输出
  var hit = data.cacheHitTokens || 0;
  var miss = data.cacheMissTokens || 0;
  var out = data.completionTokens || 0;
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">' +
    '<div style="background:var(--bg2);border:1px solid var(--green);border-radius:var(--radius);padding:8px 8px;text-align:center"><div style="font-size:0.62em;color:var(--fg2);margin-bottom:1px">⬆️ 输入·命中缓存</div><div style="font-size:0.78em;font-weight:600;color:var(--green)">' + fmtToken(hit) + '</div></div>' +
    '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:8px 8px;text-align:center"><div style="font-size:0.62em;color:var(--fg2);margin-bottom:1px">⬆️ 输入·未命中</div><div style="font-size:0.78em;font-weight:600;color:var(--fg)">' + fmtToken(miss) + '</div></div>' +
    '<div style="background:var(--bg2);border:1px solid var(--accent2);border-radius:var(--radius);padding:8px 8px;text-align:center"><div style="font-size:0.62em;color:var(--fg2);margin-bottom:1px">⬇️ 输出</div><div style="font-size:0.78em;font-weight:600;color:var(--accent2)">' + fmtToken(out) + '</div></div>' +
    '</div>';
  var el = document.getElementById('usageModalTotals'); if (el) el.innerHTML = html;
}
function summaryCard(icon, value, color) { return '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:10px 8px;text-align:center"><div style="font-size:0.65em;color:var(--fg2);margin-bottom:1px">' + icon + '</div><div style="font-size:0.80em;font-weight:600;color:' + color + '">' + value + '</div></div>'; }

function renderTimeline(data) {
  var container = document.getElementById('usageModalTimeline'); if (!container) return;
  var tl = data.timeline || [];
  if (tl.length === 0) {
    var eh = '<div class="bg-bg2 b-border rad-round overflow-hidden fs-074"><div class="p-5-10 bg-bg b-border-bottom fw-600 fs-078">📈 消耗趋势</div><div class="p-8-10"><div style="display:flex;align-items:center;gap:6px;opacity:0.3"><span style="font-size:0.65em;color:var(--fg2);width:80px">--</span><div style="flex:1;height:14px;background:var(--bg);border-radius:3px"></div><span style="font-size:0.65em;width:60px;text-align:right">0</span><span style="font-size:0.62em;width:50px;text-align:right">¥0</span></div></div></div>';
    container.innerHTML = eh; return;
  }
  var dayBuckets = {}; for (var i = 0; i < tl.length; i++) { var b = tl[i]; if (!dayBuckets[b.day]) dayBuckets[b.day] = { day: b.day, tokens: 0, cost: 0, hours: [] }; dayBuckets[b.day].tokens += b.tokens; dayBuckets[b.day].cost += b.cost; dayBuckets[b.day].hours.push(b); }
  var days = Object.keys(dayBuckets).sort(); var maxTokens = 0; for (var di = 0; di < days.length; di++) { if (dayBuckets[days[di]].tokens > maxTokens) maxTokens = dayBuckets[days[di]].tokens; }
  if (maxTokens === 0) { container.innerHTML = '<div class="bg-bg2 b-border rad-round overflow-hidden fs-074"><div class="p-5-10 bg-bg b-border-bottom fw-600 fs-078">📈 消耗趋势</div><div class="p-8-10">' + days.slice(0, 3).map(function(d) { return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;opacity:0.3"><span style="font-size:0.65em;width:80px">' + d + '</span><div style="flex:1;height:14px;background:var(--bg);border-radius:3px"></div><span style="font-size:0.65em;width:60px;text-align:right">0</span><span style="font-size:0.62em;width:50px;text-align:right">¥0</span></div>'; }).join('') + '</div></div>'; return; }
  var html = '<div class="bg-bg2 b-border rad-round overflow-hidden fs-074"><div class="p-5-10 bg-bg b-border-bottom fw-600 fs-078">📈 消耗趋势</div><div class="p-8-10">';
  for (var di = 0; di < days.length; di++) { var day = dayBuckets[days[di]]; var pct = Math.max(day.tokens / maxTokens * 100, 2); html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span style="font-size:0.65em;color:var(--fg2);width:80px;flex-shrink:0">' + day.day + '</span><div style="flex:1;height:14px;background:var(--bg);border-radius:3px;overflow:hidden;position:relative"><div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--green),var(--accent2));border-radius:3px;opacity:0.8"></div></div><span style="font-size:0.65em;color:var(--fg);width:60px;text-align:right;flex-shrink:0">' + fmtToken(day.tokens) + '</span><span style="font-size:0.62em;color:var(--fg2);width:50px;text-align:right;flex-shrink:0">¥' + day.cost.toFixed(3) + '</span></div>'; }
  html += '</div></div>'; container.innerHTML = html;
}

function getRanking(data) {
  var stats = {}; for (var i = 0; i < (data.records || []).length; i++) { var r = data.records[i]; var label = r.label || '其他'; if (!stats[label]) stats[label] = { label: label, totalTokens: 0, totalCost: 0, count: 0, cacheHit: 0, cacheMiss: 0, completion: 0 }; stats[label].totalTokens += r.totalTokens || 0; stats[label].totalCost += r.estimatedCost || 0; stats[label].count++; stats[label].cacheHit += r.cacheHitTokens || 0; stats[label].cacheMiss += r.cacheMissTokens || 0; stats[label].completion += r.completionTokens || 0; }
  var list = []; for (var k in stats) list.push(stats[k]); list.sort(function(a, b) { return b.totalTokens - a.totalTokens; }); while (list.length < 3) list.push({ label: '—', totalTokens: 0, totalCost: 0, count: 0, cacheHit: 0, cacheMiss: 0, completion: 0 }); return list;
}

function renderRanking(data) {
  var container = document.getElementById('usageModalRanking'); if (!container) return;
  var ranking = getRanking(data); var colors = ['#e94560', '#ffc857', '#4ecca3', '#c084fc', '#22d3ee', '#fb923c', '#94a3b8'];
  var limited = _usageRankingExpanded ? ranking : ranking.slice(0, 30);
  var hasMore = ranking.length > 30;
  var html = '<div class="bg-bg2 b-border rad-round overflow-hidden fs-074"><div class="p-5-10 bg-bg b-border-bottom fw-600 fs-078">🏆 消耗排行榜（点击查看明细）</div>';
  html += '<div style="display:grid;grid-template-columns:0.5fr 2fr 1fr 1fr 1fr 1fr 1fr;gap:2px;padding:3px 10px;font-size:0.62em;color:var(--fg2);border-bottom:1px solid var(--border);font-weight:600"><div>#</div><div>功能</div><div class="text-right">输入·命中</div><div class="text-right">输入·未命中</div><div class="text-right">输出</div><div class="text-right">次数</div><div class="text-right">费用</div></div>';
  for (var i = 0; i < limited.length; i++) { var r = limited[i]; var isP = r.label === '—'; var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1); var clickAttr = isP ? '' : ' onclick="usageDrillTo(\'' + escHtml(r.label) + '\')" title="点击查看 ' + escHtml(r.label) + ' 的消耗明细"'; html += '<div style="display:grid;grid-template-columns:0.5fr 2fr 1fr 1fr 1fr 1fr 1fr;gap:2px;padding:3px 10px;font-size:0.66em;' + (isP ? '' : 'cursor:pointer;') + 'background:transparent"' + clickAttr + '><div style="color:' + colors[i % colors.length] + ';font-weight:600' + (isP ? ';opacity:0.3' : '') + '">' + medal + '</div><div class="c-fg">' + escHtml(r.label) + '</div><div style="text-align:right;color:var(--green)">' + fmtToken(r.cacheHit) + '</div><div class="text-right c-fg2">' + fmtToken(r.cacheMiss) + '</div><div class="text-right c-fg2">' + fmtToken(r.completion) + '</div><div class="text-right c-fg2">' + r.count + '</div><div style="text-align:right;color:var(--accent);font-weight:600">¥' + r.totalCost.toFixed(4) + '</div></div>'; }
  if (hasMore) {
    html += '<div style="text-align:center;padding:6px 10px;border-top:1px solid var(--border)"><span class="btn-out" style="font-size:0.72em;padding:2px 14px;cursor:pointer" onclick="toggleUsageRanking()">' + (_usageRankingExpanded ? '▲ 收起' : '▼ 展开全部 (' + ranking.length + ' 项)') + '</span></div>';
  }
  html += '</div>'; container.innerHTML = html;
}

function toggleUsageRanking() {
  _usageRankingExpanded = !_usageRankingExpanded;
  renderRanking(window._usageCurrentData);
}

function usageDrillTo(label) {
  _usageDrillLabel = label; var data = getFilteredUsage(); var filtered = data.records.filter(function(r) { return (r.label || '其他') === label; });
  var drilled = recomputeFromRecords(filtered); window._usageCurrentData = drilled; renderSummary(drilled); renderTimeline(drilled); renderDrillDetail(drilled); renderDrillRanking(drilled);
  var b = document.getElementById('usageBreadcrumb'); if (b) { b.textContent = '← 返回 ' + label; b.style.display = 'inline'; }
}

function renderDrillRanking(data) {
  var container = document.getElementById('usageModalRanking'); if (!container) return;
  var html = '<div class="bg-bg2 b-border rad-round overflow-hidden fs-074"><div class="p-5-10 bg-bg b-border-bottom fw-600 fs-078">🔍 模型分布</div>';
  var modelKeys = Object.keys(data.models);
  if (modelKeys.length === 0) { html += '<div style="padding:10px;text-align:center;color:var(--fg2);font-size:0.72em">暂无数据</div>'; }
  else {
    html += '<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:2px;padding:3px 10px;font-size:0.64em;color:var(--fg2);border-bottom:1px solid var(--border);font-weight:600"><div>模型</div><div class="text-right">用量</div><div class="text-right">次数</div><div class="text-right">费用</div></div>';
    modelKeys.sort(function(a, b) { return data.models[b].cost - data.models[a].cost; });
    for (var i = 0; i < modelKeys.length; i++) { var m = data.models[modelKeys[i]]; html += '<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:2px;padding:3px 10px;font-size:0.68em;background:transparent"><div class="c-fg">' + escHtml(m.model) + '</div><div class="text-right c-fg2">' + fmtToken(m.totalTokens) + '</div><div class="text-right c-fg2">' + m.count + '</div><div style="text-align:right;color:var(--accent)">¥' + m.cost.toFixed(4) + '</div></div>'; }
  }
  html += '</div>'; container.innerHTML = html;
}

function renderDrillDetail(data) {
  var container = document.getElementById('usageModalDetail'); if (!container) return;
  var records = data.records || [];
  var html = '<div class="bg-bg2 b-border rad-round overflow-hidden fs-074"><div class="p-5-10 bg-bg b-border-bottom fw-600 fs-078">📋 调用记录</div>';
  if (records.length === 0) { html += '<div style="padding:10px;text-align:center;color:var(--fg2)">暂无记录</div>'; }
  else {
    html += '<div style="display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr 1fr 1.2fr;gap:2px;padding:3px 10px;font-size:0.62em;color:var(--fg2);border-bottom:1px solid var(--border);font-weight:600"><div>模型</div><div class="text-right">输入(命中)</div><div class="text-right">输入(未命中)</div><div class="text-right">输出</div><div class="text-right">费用</div><div class="text-right">时间</div></div>';
    for (var i = 0; i < records.length; i++) { var r = records[i]; var timeStr = r.timestamp ? r.timestamp.substring(11, 19) : '--'; var hit = r.cacheHitTokens || 0; var miss = r.cacheMissTokens || 0; var out = r.completionTokens || 0; html += '<div style="display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr 1fr 1.2fr;gap:2px;padding:3px 10px;font-size:0.64em;background:transparent"><div style="color:var(--fg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(r.model || '--') + '</div><div style="text-align:right;color:var(--green)">' + fmtToken(hit) + '</div><div class="text-right c-fg2">' + fmtToken(miss) + '</div><div class="text-right c-fg2">' + fmtToken(out) + '</div><div style="text-align:right;color:var(--accent)">¥' + (r.estimatedCost || 0).toFixed(4) + '</div><div style="text-align:right;color:var(--fg2);font-size:0.62em">' + timeStr + '</div></div>'; }
  }
  html += '</div>'; container.innerHTML = html;
}

function renderDetailTable(data) {
  var container = document.getElementById('usageModalDetail'); if (!container) return;
  var modelKeys = Object.keys(data.models);
  var html = '<div class="bg-bg2 b-border rad-round overflow-hidden fs-074"><div class="p-5-10 bg-bg b-border-bottom fw-600 fs-078">模型明细</div>';
  html += '<div style="display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr 1fr 1fr;gap:2px;padding:3px 10px;font-size:0.62em;color:var(--fg2);border-bottom:1px solid var(--border);font-weight:600"><div>模型</div><div class="text-right">输入(命中缓存)</div><div class="text-right">输入(未命中)</div><div class="text-right">输出</div><div class="text-right">次数</div><div class="text-right">费用</div></div>';
  if (modelKeys.length === 0) {
    html += '<div style="display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr 1fr 1fr;gap:2px;padding:3px 10px;font-size:0.68em;background:transparent"><div style="color:var(--fg2);opacity:0.3">暂无数据</div><div class="text-right c-fg2">0</div><div class="text-right c-fg2">0</div><div class="text-right c-fg2">0</div><div class="text-right c-fg2">0</div><div style="text-align:right;color:var(--accent);opacity:0.3">¥0</div></div>';
  } else {
    modelKeys.sort(function(a, b) { return data.models[b].cost - data.models[a].cost; });
    for (var i = 0; i < modelKeys.length; i++) { var m = data.models[modelKeys[i]]; var hit = m.cacheHitTokens || 0; var miss = m.cacheMissTokens || 0; var out = m.completionTokens || 0; html += '<div style="display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr 1fr 1fr;gap:2px;padding:3px 10px;font-size:0.66em;background:transparent"><div style="color:var(--fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="' + escHtml(m.model) + '">' + escHtml(m.model) + '</div><div style="text-align:right;color:var(--green)">' + fmtToken(hit) + '</div><div class="text-right c-fg2">' + fmtToken(miss) + '</div><div class="text-right c-fg2">' + fmtToken(out) + '</div><div class="text-right c-fg2">' + m.count + '</div><div style="text-align:right;color:var(--accent);font-weight:600">¥' + m.cost.toFixed(4) + '</div></div>'; }
  }
  html += '</div>'; container.innerHTML = html;
}

window.openUsageModal = openUsageModal;
window.switchUsageTab = switchUsageTab;
window.usageDateFilter = usageDateFilter;
window.usageClearDrill = usageClearDrill;
window.usageDrillTo = usageDrillTo;
window.toggleUsageRanking = toggleUsageRanking;
