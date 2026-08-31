// 黄游拔作 · 🖥️ 游戏详情页 —— Steam 商店页 1:1 复刻（真实 Steam DOM 类 + 真实 Steam 作用域 CSS）
// 样式：steam/steam-detail.css（已作用域 .steam-root 的真实 Steam CSS，17k 行）
// 核心：点进任一已生成游戏 → 渲染完整的真实 Steam 商店页布局（媒体区/glance 右栏/购买区/功能/语言/关于/系统需求/用户评测），
//       并把该游戏的 info.json + 已生成词条版块 + 评价 注入进对应槽位。
var 黄游详情当前评价 = [];

// 素材（EDF/示例头图，可被用户替换；生成游戏无真实图时用示例占位保住 Steam 观感）
function 黄游素材(rel) { return '业务容器/区块-情欲工坊/顶层模块-黄游拔作/子模块-主面板/叶子模块-详情页/steam/' + rel; }

// ===== 图片占位：不填充真图，用文字描述"这个图是什么内容"，保留占位尺寸 =====
// extra 传尺寸样式（如 aspect-ratio、width/height）；text 为该图的内容描述；mini 时省略底部提示（用于小块）
function 黄游图占(text, extra, mini) {
  extra = extra || '';
  return '<div class="yy-img-ph" style="' + extra + '"><span class="yy-img-label">' + escHtml(text || '配图占位') + '</span>' + (mini ? '' : '<span class="yy-img-hint">配图描述</span>') + '</div>';
}
// 为某个图片槽位生成"内容描述"文案（基于游戏/本体数据）
function 黄游图说(info, kind, idx) {
  var n = info.name || '本作';
  var focus = info.focus || info.description || '';
  var 主题 = [
    { k: '主视觉', t: '主视觉图：' + (focus ? focus.slice(0, 30) : '本作主题画面') },
    { k: '头图', t: '头图封面：' + n },
    { k: 'logo', t: n.slice(0, 2) },
    { k: 's1', t: '截图①主界面：' + (info.subtype || focus.slice(0, 14)) },
    { k: 's2', t: '截图②战斗/探索场景' },
    { k: 's3', t: '截图③关键剧情/立绘' },
    { k: 's4', t: '截图④H场景' },
    { k: 's5', t: '截图⑤事件CG' },
    { k: 's6', t: '截图⑥结局/回想' }
  ];
  var f = 主题.filter(function(x) { return x.k === kind; })[0];
  return f ? f.t : ('图片：' + n);
}

// ===== 上下文：当前渲染的是「本体游戏」还是「它的某个 DLC」=====
// 黄游当前游戏 = { name, info, cat, isDLC, dlcOf }
function 黄游上下文() { return 黄游当前游戏 || { name: '', info: {}, cat: 黄游当前分类, isDLC: false, dlcOf: '' }; }
function 黄游版块取(sec) { var c = 黄游上下文(); return c.isDLC ? 黄游加载DLC版块(c.cat, c.dlcOf, c.name, sec) : 黄游加载版块(c.cat, c.name, sec); }
function 黄游版块存(sec, data) { var c = 黄游上下文(); return c.isDLC ? 黄游保存DLC版块(c.cat, c.dlcOf, c.name, sec, data) : 黄游保存版块(c.cat, c.name, sec, data); }
function 黄游评价取() { var c = 黄游上下文(); return c.isDLC ? 黄游加载DLC评价(c.cat, c.dlcOf, c.name) : 黄游加载评价(c.cat, c.name); }
function 黄游评价存(list) { var c = 黄游上下文(); return c.isDLC ? 黄游保存DLC评价(c.cat, c.dlcOf, c.name, list) : 黄游保存评价(c.cat, c.name, list); }
function 黄游版块关键词(cfg) { return (cfg && cfg.sections) || []; }

// 返回：DLC 详情 → 本体详情；本体详情 → 图鉴列表
window.黄游返回 = function() {
  var c = 黄游上下文();
  var el = document.getElementById('yyContentView');
  if (!el) return;
  if (c.isDLC) {
    黄游打开详情(c.dlcOf);
  } else {
    黄游渲染列表(el);
  }
};

// ============================================================
// 入口：打开本体游戏详情
// ============================================================
window.黄游打开详情 = function(游戏名) {
  var cat = 黄游当前分类;
  黄游加载游戏(cat, 游戏名).then(function(info) {
    if (!info) { toast('游戏数据不存在'); return; }
    黄游当前游戏 = { name: 游戏名, info: info, cat: cat, isDLC: false, dlcOf: '' };
    var el = document.getElementById('yyContentView');
    if (el) 黄游渲染详情(el);
  });
};

// 入口：打开某个 DLC 详情（界面与本体几乎一致）
window.黄游打开DLC详情 = function(游戏名, dlc名) {
  var cat = 黄游当前分类;
  黄游加载DLC(cat, 游戏名, dlc名).then(function(info) {
    if (!info) { toast('DLC 数据不存在'); return; }
    黄游当前游戏 = { name: dlc名, info: info, cat: cat, isDLC: true, dlcOf: 游戏名 };
    var el = document.getElementById('yyContentView');
    if (el) 黄游渲染详情(el);
  });
};

// 生成：为当前游戏生成一版 DLC 列表（每个 DLC 作为一个子目录，可独立生成内容/进入详情）
window.黄游生成DLC列表 = function() {
  var c = 黄游上下文();
  if (c.isDLC) { toast('请在本体详情页生成 DLC 列表'); return; }
  var cat = c.cat; var 游戏名 = c.name;
  var ctx = '游戏名称：' + c.info.name + '\n分类：' + (黄游游戏分类[cat] ? 黄游游戏分类[cat].label : '') + '\n类型：' + 黄游获取词条配置(c.info.type, c.info.subtype).label + '\n简介：' + (c.info.description || '') + '\n主打卖点：' + (c.info.focus || '');
  var rendered = renderPrompt('hybz_dlc_gen', { context: ctx });
  toast('🤖 生成 DLC 列表...');
  LLM.callJSON({ prompt: rendered.user, system: rendered.system, label: 'DLC 生成', temperature: 0.85 }).then(function(data) {
    var list = (data && data.list) || [];
    if (!list.length) { toast('生成失败'); return; }
    var saves = list.map(function(d) {
      return 黄游保存DLC(cat, 游戏名, d.name, { name: d.name, type: c.info.type, subtype: c.info.subtype, focus: d.focus || '', description: d.description || '', price: d.price || 'HK$ 30', studio: c.info.studio || '', releaseDate: c.info.releaseDate || '', platform: c.info.platform || 'PC', publisher: c.info.publisher || '', createdAt: Date.now() });
    });
    return Promise.all(saves);
  }).then(function() {
    toast('✅ 已生成 ' + list.length + ' 个 DLC');
    var el = document.getElementById('yyContentView'); if (el) 黄游渲染详情(el);
  }).catch(function(err) { toast('❌ ' + err.message); });
};

// ============================================================
// 主渲染：完整 Steam 商店页
// ============================================================
window.黄游渲染详情 = function(el) {
  var 游戏 = 黄游当前游戏;
  if (!游戏) return;
  var isDLC = !!游戏.isDLC;
  var cat = 黄游当前分类;
  var info = 游戏.info;
  var cfg = 黄游获取词条配置(info.type, info.subtype);
  var 分类 = 黄游游戏分类[cat] || {};

  var h = '<div class="steam-root" id="yySteamRoot">';
  h += '<link rel="stylesheet" href="' + 黄游素材('steam-detail.css') + '">';
  h += '<link rel="stylesheet" href="' + 黄游素材('motiva_sans.css') + '">';
  // —— 作用域基础样式（补偿 app 容器缺少 body.v6/widestore 时的布局约束）——
  h += '<style>';
  h += '.steam-root{color:#c7d5e0;font-family:"Motiva Sans","Microsoft YaHei","Segoe UI",Arial,sans-serif;line-height:1.55;background:linear-gradient(180deg,#2a475e 0%,#1b2838 80%,#171a21 100%);min-height:100%;padding-bottom:60px}';
  h += '.steam-root *{box-sizing:border-box}';
  h += '.steam-root a{color:#c7d5e0;text-decoration:none}.steam-root a:hover{color:#fff}';
  h += '.steam-root .page_content{max-width:1150px;margin:0 auto;padding:0 12px}';
  h += '.steam-root .page_title_area{padding-top:18px}';
  h += '.steam-root .game_title_area .apphub_HomeHeaderContent{border:0}';
  h += '.steam-root .game_highlights{padding:14px 0}';
  h += '.steam-root .game_media_and_summary_ctn{width:100%}';
  h += '.steam-root .yy-row{display:flex;gap:16px;align-items:flex-start}';
  h += '.steam-root .game_highlights .yy-row{align-items:stretch}';
  h += '.steam-root .yy-media{display:flex;flex-direction:column}';
  h += '.steam-root .yy-media .highlight_player_item{flex:0 0 auto}';
  h += '.steam-root .yy-media .highlight_control{margin-top:auto}';
  h += '.steam-root .yy-glance{display:flex;flex-direction:column}';
  h += '.steam-root .yy-glance .glance_ctn{flex:1;display:flex;flex-direction:column}';
  h += '.steam-root .game_header_ctn{flex-shrink:0}';
  h += '.steam-root .glance_mid_ctn{flex:1;display:flex;flex-direction:column}';
  h += '.steam-root .glance_ctn .glance_ctn_responsive_right{margin-top:auto}';
  h += '.steam-root .yy-media{flex:1;min-width:0}';
  h += '.steam-root .yy-media .highlight_ctn{display:block}';
  h += '.steam-root .yy-media .highlight_overflow{display:block;overflow:hidden}';
  h += '.steam-root .yy-media .highlight_player_item{display:block;width:100%;margin-bottom:8px}';
  h += '.steam-root .yy-media .highlight_control{display:flex;flex-wrap:nowrap;overflow-x:auto;gap:6px;padding-bottom:6px;scrollbar-width:thin}';
  h += '.steam-root .yy-media .highlight_control .yy-img-ph{flex:0 0 116px}';
  h += '.steam-root .glance_tags,.steam-root .popular_tags{display:flex;flex-wrap:wrap;gap:4px;max-height:56px;overflow:hidden}';
  h += '.steam-root .glance_tags .app_tag{white-space:nowrap;margin:0}';
  h += '.steam-root .glance_ctn .release_date .date{font-size:12px;font-weight:400;color:#c7d5e0;line-height:1.4}';
  h += '.steam-root .glance_ctn .dev_row .summary.column{font-size:12px;line-height:1.4}';
  h += '.steam-root .glance_ctn .dev_row .subtitle,.steam-root .glance_ctn .release_date .subtitle,.steam-root .glance_ctn .user_reviews .subtitle{font-size:12px;color:#8f98a0;line-height:1.4}';
  h += '.steam-root .glance_ctn .release_date,.steam-root .glance_ctn .dev_row,.steam-root .glance_ctn .user_reviews_summary_row{border:none;margin:0;padding:0}';
  h += '.steam-root .responsive_reviewdesc{border:none}';
  h += '.steam-root .yy-meta .block .dev_row{font-size:12px;color:#8f98a0;line-height:1.6;border:none}';
  h += '.steam-root .yy-meta .block .dev_row b{color:#c7d5e0;font-weight:400}';
  h += '.steam-root .yy-glance{flex:0 0 320px;width:320px}';
  h += '.steam-root .yy-body{flex:1;min-width:0}';
  h += '.steam-root .yy-meta{flex:0 0 320px;width:320px}';
  h += '.steam-root .game_media_and_summary_ctn{background:transparent;padding:0}';
  h += '.steam-root .glance_ctn{background:transparent;padding-top:0}';
  h += '.steam-root .game_header_image_full{width:100%;display:block}';
  h += '.steam-root .highlight_player_item img{max-width:100%}';
  h += '.steam-root .highlight_control img{width:118px;height:66px;object-fit:cover;margin-right:6px;cursor:pointer;border:1px solid rgba(0,0,0,.4)}';
  h += '.steam-root .yy-img-ph{position:relative;background:linear-gradient(135deg,rgba(42,71,94,.5),rgba(27,40,56,.78));border:1px solid rgba(102,192,244,.22);border-radius:3px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:4px;padding:8px;overflow:hidden;box-sizing:border-box}';
  h += '.steam-root .yy-img-label{color:#c7d5e0;font-size:12px;font-weight:600;line-height:1.5;max-width:95%;word-break:break-word}';
  h += '.steam-root .yy-img-hint{color:#8f98a0;font-size:10px;letter-spacing:1px}';
  h += '.steam-root .yy-ver-table{width:100%;border-collapse:collapse;font-size:12px;color:#c7d5e0}';
  h += '.steam-root .yy-ver-table th,.steam-root .yy-ver-table td{padding:6px 10px;border-bottom:1px solid rgba(102,192,244,.12);text-align:center}';
  h += '.steam-root .yy-ver-table .yy-ver-name{text-align:left;color:#c7d5e0}';
  h += '.steam-root .yy-ver-table th{font-weight:600;color:#8f98a0}';
  h += '.steam-root .game_area_purchase{margin:18px 0}';
  h += '.steam-root .block{background:rgba(23,42,56,.45);border:1px solid rgba(102,192,244,.12);border-radius:3px;padding:12px 14px;margin-bottom:12px;font-size:12px;color:#c7d5e0}';
  h += '.steam-root .block .block_title{font-size:12px;color:#8f98a0;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:1px}';
  h += '.steam-root .game_area_features_list_ctn .game_area_details_specs_ctn{display:flex;align-items:center}';
  h += '.steam-root .game_area_purchase_game{padding:12px 14px 18px}';
  h += '.steam-root .game_area_purchase_game .game_purchase_action{right:14px;left:14px;bottom:10px}';
  h += '.steam-root .game_purchase_action_bg{display:inline-flex;align-items:center;height:32px;padding:0 2px 0 8px;vertical-align:bottom;white-space:nowrap}';
  h += '.steam-root .game_purchase_action_bg > *{vertical-align:middle;margin:0 2px;line-height:1.2}';
  h += '.steam-root .game_purchase_action_bg .btn_addtocart{margin-right:0}';
  h += '.steam-root .game_purchase_action_bg .game_purchase_price{min-width:46px;text-align:center;display:inline-block}';
  h += '.steam-root .block_header{font-size:13px;color:#fff;font-weight:600;margin-bottom:8px}';
  h += '.steam-root table.game_language_options{width:100%;border-collapse:collapse;color:#c7d5e0;font-size:12px}';
  h += '.steam-root .game_language_options th,.steam-root .game_language_options td{padding:4px 6px;border-bottom:1px solid rgba(90,120,150,.25);text-align:left}';
  h += '.steam-root .game_area_description img{max-width:100%}';
  h += '.steam-root .game_area_description h2{color:#fff;font-size:16px;margin:14px 0 8px}';
  h += '.steam-root .bb_img_ctn{display:block;margin:8px 0}';
  h += '.steam-root .sysreq_content{overflow:hidden}';
  h += '.steam-root .game_area_sys_req_leftCol,.steam-root .game_area_sys_req_rightCol{float:left;width:48%}';
  h += '.steam-root .game_area_sys_req_rightCol{margin-left:4%}';
  h += '.steam-root .game_area_sys_req ul{list-style:none;margin:0;padding:0;font-size:12px;color:#8f98a0}';
  h += '.steam-root .game_area_sys_req ul li{padding:2px 0}';
  h += '.steam-root .game_area_sys_req ul li strong{color:#c7d5e0}';
  h += '.steam-root .review_box{border-top:1px solid rgba(255,255,255,.05);padding:6px 0 2px}';
  h += '.steam-root .review_box .review_rightcol{padding:10px 12px 10px 2px}';
  h += '.steam-root .review_box .avatar .yy-ava{width:64px;height:64px;border-radius:1px;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:600;color:#fff;border:1px solid rgba(255,255,255,.08);box-sizing:border-box}';
  h += '.steam-root .review_box .vote_header .thumb svg{display:block;margin-top:5px}';
  h += '.steam-root .review_box .control_block a{color:#67c1f5;font-size:12px;text-decoration:none;margin-right:14px;cursor:pointer}';
  h += '.steam-root .review_box .control_block a:hover{color:#fff}';
  h += '.steam-root .user_reviews_filter_bar .dselect_container{background:rgba(103,193,245,.1);border-radius:3px;display:inline-block}';
  h += '.steam-root .user_reviews_filter_bar .dselect_container select{background:transparent;border:0;outline:none;color:#66c0f4;font-size:12px;padding:4px 8px;cursor:pointer}';
  h += '.steam-root .user_reviews_filter_bar .dselect_container select option{background:#1b2838;color:#c7d5e0}';
  h += '.steam-root .yy-reviews-title{font-size:22px;color:#fff;font-family:"Motiva Sans",Sans-serif;font-weight:300;margin:0}';
  h += '.steam-root .review_box .short_header{overflow:hidden}';
  h += '.steam-root .review_box .short_header .thumb svg{width:24px;height:24px;display:block;margin-top:0}';
  h += '.steam-root .game_area_purchase{margin:18px 0}';
  // —— 购买卡（对齐 Steam：标题左上 + 平台右上 + 副标题 + 胶囊行 + 底部右对齐动作行）——
  h += '.steam-root .yy-purchase{background:linear-gradient(-60deg,rgba(226,244,255,0.3) 5%,rgba(84,107,115,0.3) 95%);border-radius:4px;padding:16px 16px 18px;margin-bottom:16px;font-family:"Motiva Sans",Sans-serif;font-size:13px;color:#c6d4df}';
  h += '.steam-root .yy-pc-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}';
  h += '.steam-root .yy-pc-title{color:#fff;font-size:16px;font-weight:600;line-height:1.3;margin:0}';
  h += '.steam-root .yy-pc-badge{display:inline-block;font-size:11px;color:#8f98a0;background:rgba(103,193,245,.12);border:1px solid rgba(103,193,245,.25);border-radius:2px;padding:1px 6px;margin-left:8px;vertical-align:middle;font-weight:400}';
  h += '.steam-root .yy-pc-plat{display:flex;gap:8px;flex-shrink:0;align-items:center;color:#8f98a0;font-size:11px;white-space:nowrap}';
  h += '.steam-root .yy-pc-sub{font-size:12px;color:#8f98a0;margin:6px 0 10px;line-height:1.5}';
  h += '.steam-root .yy-pc-caps{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}';
  h += '.steam-root .yy-pc-caps .cap{width:104px;height:52px;flex:0 0 104px;border-radius:3px;background:linear-gradient(135deg,rgba(42,71,94,.5),rgba(27,40,56,.78));border:1px solid rgba(102,192,244,.22);display:flex;align-items:center;justify-content:center;padding:3px;overflow:hidden;color:#c7d5e0;font-size:10px;text-align:center;line-height:1.35;word-break:break-all}';
  h += '.steam-root .yy-pc-foot{display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-top:14px}';
  h += '.steam-root .yy-pc-price{color:#c6d4df;font-size:14px;white-space:nowrap}';
  h += '.steam-root .yy-pc-discount{display:flex;align-items:center;gap:6px;white-space:nowrap}';
  h += '.steam-root .yy-pc-dpct{background:#4c6b22;color:#a4d007;font-size:12px;font-weight:700;padding:2px 6px;border-radius:2px}';
  h += '.steam-root .yy-pc-dorig{color:#8f98a0;font-size:11px;text-decoration:line-through}';
  h += '.steam-root .yy-pc-dfinal{color:#a4d007;font-size:14px;font-weight:700}';
  // —— DLC 区：首个展开卡 + 其余一行行（复刻截图「此游戏的内容」）——
  h += '.steam-root .yy-dlc-block{margin:0 0 18px}';
  h += '.steam-root .yy-dlc-head{display:flex;justify-content:space-between;align-items:center;margin:4px 0 12px}';
  h += '.steam-root .yy-dlc-title{color:#fff;font-size:15px;font-weight:600}';
  h += '.steam-root .yy-dlc-featured{background:linear-gradient(-60deg,rgba(226,244,255,0.3) 5%,rgba(84,107,115,0.3) 95%);border-radius:4px;padding:14px;margin-bottom:10px;display:flex;gap:16px;align-items:center}';
  h += '.steam-root .yy-dlc-fimg{flex:0 0 200px;width:200px;height:96px;border-radius:3px;background:linear-gradient(135deg,rgba(42,71,94,.5),rgba(27,40,56,.78));border:1px solid rgba(102,192,244,.22);display:flex;align-items:center;justify-content:center;color:#c7d5e0;font-size:12px;text-align:center;padding:4px;overflow:hidden}';
  h += '.steam-root .yy-dlc-finfo{flex:1;min-width:0}';
  h += '.steam-root .yy-dlc-fname{color:#fff;font-size:15px;font-weight:600;margin-bottom:4px}';
  h += '.steam-root .yy-dlc-fsub{color:#8f98a0;font-size:12px;margin-bottom:8px;line-height:1.5}';
  h += '.steam-root .yy-dlc-foot{display:flex;justify-content:flex-end;align-items:center;gap:10px}';
  h += '.steam-root .yy-dlc-row{display:flex;align-items:center;gap:12px;padding:9px 10px;border-bottom:1px solid rgba(102,192,244,.08);font-size:13px;color:#c6d4df;cursor:pointer}';
  h += '.steam-root .yy-dlc-row:hover{background:rgba(103,193,245,.06)}';
  h += '.steam-root .yy-dlc-row-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#c7d5e0}';
  h += '.steam-root .yy-dlc-foot .btn_medium,.steam-root .yy-pc-foot .btn_medium{white-space:nowrap}';
  h += '</style>';

  // —— Steam 顶栏 global_header ——
  h += '<div role="banner" id="global_header"><div class="content"><div class="logo"><span id="logo_holder"><img src="' + 黄游素材('logo_steam.svg') + '" width="144.5" height="44" alt="Steam"></span></div>';
  h += '<div role="navigation" class="supernav_container" aria-label="全局菜单"><a class="menuitem supernav supernav_active" onclick="return false">商店</a><a class="menuitem supernav" onclick="return false">社区</a><a class="menuitem supernav" onclick="return false">关于</a><a class="menuitem supernav" onclick="return false">客服</a></div>';
  h += '<div id="global_actions"><a class="global_action_link" onclick="return false">登录</a>&nbsp;|&nbsp;<span class="pulldown global_action_link" onclick="return false">语言</span></div></div></div>';

  h += '<div class="page_content">';

  // —— 标题区：面包屑 + 游戏名 + 社区中心 ——
  // —— 面包屑（可点击导航）——
  h += '<div class="page_title_area game_title_area page_content"><div class="breadcrumbs">';
  h += '<a class="breadcrumb_item" onclick="黄游渲染列表(document.getElementById(\'yyContentView\'))">所有游戏</a> &gt; <a class="breadcrumb_item" onclick="return false">' + escHtml(分类.label || '') + '</a>';
  if (isDLC) h += ' &gt; <a class="breadcrumb_item" onclick="黄游打开详情(\'' + 游戏.dlcOf.replace(/'/g, "\\'") + '\')">' + escHtml(游戏.dlcOf) + '</a>';
  h += ' &gt; <span class="breadcrumb_item">' + escHtml(info.name) + '</span>';
  h += '</div><div class="apphub_HomeHeaderContent"><div class="apphub_HeaderStandardTop">';
  h += '<div class="apphub_OtherSiteInfo"><a class="btnv6_blue_hoverfade btn_medium" onclick="黄游打开区(\'讨论\')"><span>讨论区</span></a><a class="btnv6_blue_hoverfade btn_medium" onclick="黄游打开区(\'指南\')"><span>指南</span></a><a class="btnv6_blue_hoverfade btn_medium" onclick="黄游打开区(\'创意工坊\')"><span>创意工坊</span></a></div>';
  h += '<div class="apphub_AppIcon"><div class="yy-img-ph" style="width:32px;height:32px;padding:2px"><span class="yy-img-label" style="font-size:10px">' + escHtml(黄游图说(info, 'logo')) + '</span></div><div class="overlay"></div></div>';
  h += '<div id="appHubAppName" class="apphub_AppName" role="heading" aria-level="1">' + escHtml(info.name) + '</div>';
  h += '<div style="clear:both"></div></div></div></div>';

  // —— 中央：媒体播放区（左）+ 右栏 glance（右）——
  h += '<div class="block game_media_and_summary_ctn"><div id="game_highlights"><div class="yy-row">';
  // 左：媒体播放区（主视觉在上，缩略图横排换行在下）
  h += '<div class="yy-media">';
  h += '<div id="yyMediaBig" style="margin-bottom:10px">' + 黄游图占('主视觉图', 'aspect-ratio:16/9;width:100%') + '</div>';
  h += '<div id="yyMediaThumbs" class="highlight_control" style="display:flex;flex-wrap:nowrap;overflow-x:auto;gap:6px;padding-bottom:6px;scrollbar-width:thin"></div>';
  h += '</div>';
  // 右：glance（头条图 + 简介 + 评测汇总 + 发行日期/开发者/发行商 + 标签）
  h += '<div class="yy-glance"><div class="glance_ctn"><div class="game_header_ctn"><div class="game_header_image_ctn">' + 黄游图占(黄游图说(info, '头图'), 'aspect-ratio:616/353;width:100%') + '</div>';
  h += '<div class="game_description_snippet">' + escHtml((info.description || '').slice(0, 180)) + '</div></div>';
  h += '<div class="glance_mid_ctn"><div class="glance_ctn_responsive_left">';
  h += '<div id="yySteamUserReviews"></div>';
  h += '<div class="release_date"><div class="subtitle column">发行日期:</div><div class="date">' + escHtml(info.releaseDate || '待定') + '</div></div>';
  var devs = (info.refSourceNames && info.refSourceNames.length) ? info.refSourceNames.join('、') : (info.studio || '—');
  h += '<div class="dev_row"><div class="subtitle column">开发者:</div><div class="summary column" id="developers_list">' + escHtml(devs) + '</div></div>';
  h += '<div class="dev_row"><div class="subtitle column">发行商:</div><div class="summary column">' + escHtml(info.publisher || (info.studio || '—')) + '</div></div>';
  h += '</div>';
  h += '<div class="glance_ctn_responsive_right"><div class="responsive_block_header">标签</div>';
  h += '<div class="glance_tags_ctn"><div class="glance_tags_label">该产品的热门用户自定义标签：</div>';
  h += '<div class="glance_tags popular_tags">';
  黄游标签列表(info, cfg, 分类).forEach(function(t) { h += '<a class="app_tag" style="">' + escHtml(t) + '</a>'; });
  h += '</div></div></div>';
  h += '</div></div></div>'; // glance_mid_ctn + glance_ctn
  h += '</div>'; // yy-glance
  h += '</div></div></div>'; // yy-row + game_highlights + game_media_and_summary_ctn

  // —— 中间页：左侧 购买区/DLC区/关于/系统需求 + 右侧 名称/功能/语言 meta ——
  h += '<div class="page_content middle_page" style="margin-top:18px"><div class="yy-row">';
  // 左：购买区（本体=原版/豪华版/完整版；DLC=单张卡）+ DLC 区 + 关于 + 系统需求
  h += '<div class="yy-body game_description_column">';
  h += 黄游购买区();
  if (!isDLC) h += 黄游DLC区();
  if (!isDLC) h += 黄游版本对比();
  h += '<div id="aboutThisGame"><div id="game_area_description" class="game_area_description">';
  h += '<h2>' + (isDLC ? '关于此 DLC' : '关于此游戏') + '</h2>';
  h += 黄游关于正文(info, cfg, cat);
  if (isDLC && info.新增内容 && info.新增内容.length) {
    h += '<div style="margin-top:14px"><h2>本 DLC 新增加了什么</h2><ul class="yy-dlc-addlist">' + info.新增内容.map(function(x) { return '<li>' + escHtml(x) + '</li>'; }).join('') + '</ul></div>';
  }
  h += '</div></div>';
  h += 黄游系统需求();
  h += '<div id="game_area_legal" style="margin-top:18px"><p>© ' + (info.releaseDate ? info.releaseDate.slice(0, 4) : new Date().getFullYear()) + ' ' + escHtml(info.publisher || info.studio || info.name) + '</p></div>';
  h += '</div>'; // yy-body game_description_column

  // 右：功能 → 语言 → 名称/类型/开发者 → 内容级
  h += '<div class="yy-meta game_meta_data">';
  h += 黄游右栏功能(cfg);
  h += 黄游右栏语言();
  h += '<div class="block responsive_apppage_details_left"><div class="block_title">名称</div><div style="color:#c7d5e0;font-size:12px">' + escHtml(info.name) + '</div>';
  h += '<div class="dev_row"><b>类型:</b> ' + escHtml(cfg.label || info.type) + '</div>';
  h += '<div class="dev_row"><b>开发者:</b> ' + escHtml(devs) + '</div>';
  h += '<div class="dev_row"><b>发行商:</b> ' + escHtml(info.publisher || (info.studio || '—')) + '</div>';
  h += '<div class="dev_row"><b>发行日期:</b> ' + escHtml(info.releaseDate || '待定') + '</div>';
  h += '<div class="dev_row"><b>平台:</b> ' + escHtml(info.platform || 'PC / DL') + '</div>';
  h += '<div style="margin-top:8px"><a class="linkbar" onclick="return false">访问网站</a></div></div>';
  h += '<div class="block responsive_apppage_details_right"><div class="block_title">内容</div><div style="margin-top:2px"><a class="btnv6_blue_hoverfade btn_medium" onclick="黄游打开内容()"><span>👨‍💻 开发者模式</span></a></div></div>';
  h += '</div>'; // yy-meta game_meta_data
  h += '</div></div>'; // yy-row + middle_page

  // —— 用户评测完整区 ——
  h += '<div class="page_content"><div id="yySteamReviewsSection"></div></div>';

  // —— 页脚 ——
  h += '<div class="page_content" style="margin-top:34px"><div class="steam-root-footer" style="border-top:1px solid #2a3f53;padding-top:18px;color:#8f98a0;font-size:11px;display:flex;justify-content:space-between;align-items:center"><span>© ' + new Date().getFullYear() + ' ' + escHtml(info.name) + ' · 基于「深度叙事引擎 · 黄油图鉴」生成</span><span>按下 0–9 键可切换到相应的快捷操作</span></div></div>';

  h += '</div>'; // page_content
  h += '</div>'; // steam-root

  el.innerHTML = h;

  黄游刷新Glance评测();
  黄游加载评价区();
  黄游加载营销内容();
  黄游加载媒体();
  if (!isDLC) 黄游刷新DLC区();
};

// ============================================================
// 标签列表
// ============================================================
function 黄游标签列表(info, cfg, 分类) {
  var tags = [cfg.label, info.subtype, 分类.label, '成人', '恋爱模拟', '单机', '剧情'];
  if (info.focus) tags.unshift(info.focus.slice(0, 6) + '…');
  var seen = {}; var out = [];
  tags.forEach(function(t) { if (t && !seen[t]) { seen[t] = 1; out.push(t); } });
  return out.slice(0, 6);
}

// ============================================================
// 购买区：本体 → 原版/豪华版/完整版 三档定价（无折扣）；DLC 详情 → 单张卡
// 使用从真实 Steam 页提取的 game_area_purchase_game 结构
// ============================================================
function 黄游购买区() {
  var c = 黄游上下文();
  var info = c.info;
  function 数值(s) { return Math.round(parseFloat(String(s || '').replace(/[^\d.]/g, '')) || 0); }
  function 价(n) { return '¥ ' + n.toFixed(2); }
  var 版本;
  if (c.isDLC) {
    var fn = 数值(info.price);
    版本 = [{ title: '购买《' + info.name + '》', sub: 'DLC 追加内容', disc: 0, price: fn ? 价(fn) : '价格待定' }];
  } else {
    版本 = 黄游推导版本(info).map(function(v) {
      var nm = (v.label === '原版' ? '' : v.label);
      return { title: '购买《' + info.name + '》' + nm, disc: 0, price: 价(数值(v.price)) };
    });
  }
  var h = '<div id="game_area_purchase" class="game_area_purchase">';
  版本.forEach(function(v) {
    h += '<div class="game_area_purchase_game" style="min-height:65px">';
    h += '<div class="game_area_purchase_platform" style="position:absolute;top:14px;right:16px;z-index:1"><span class="platform_img win" style="background:none;width:16px;height:16px;display:inline-block;vertical-align:top"><svg width="16" height="16" viewBox="0 0 16 16" style="display:block"><g fill="#8aa0b2"><rect x="0" y="0" width="7" height="7"/><rect x="9" y="0" width="7" height="7"/><rect x="0" y="9" width="7" height="7"/><rect x="9" y="9" width="7" height="7"/></g></svg></span></div>';
    h += '<h2 class="title">' + escHtml(v.title) + '</h2>';
    h += '<div class="game_purchase_action" style="bottom:-17px"><div class="game_purchase_action_bg">';
    if (v.disc) { h += '<div class="discount_block game_purchase_discount"><div class="discount_pct">-' + v.disc + '%</div><div class="discount_prices"><div class="discount_original_price">' + escHtml(v.orig) + '</div><div class="discount_final_price">' + escHtml(v.final) + '</div></div></div>'; }
    else { h += '<div class="game_purchase_price price">' + escHtml(v.price) + '</div>'; }
    h += '<div class="btn_addtocart"><a class="btn_green_steamui btn_medium" onclick="toast(\'已加入购物车\')"><span>添加到购物车</span></a></div>';
    h += '</div></div></div>';
  });
  h += '</div>';
  return h;
}

// ============================================================
// DLC 区（仅本体展示）：复刻截图「此游戏的内容」—— 首个 DLC 展开卡 + 其余一行行
// ============================================================
// DLC 区（仅本体展示）：使用从真实 Steam 页提取的 game_area_dlc_row 结构
// 首个 DLC 为 dlc_highlight（展开：胶囊+已推荐+价格），其余为普通一行行
// ============================================================
function 黄游胶囊(text) {
  var t = (text || 'DLC').slice(0, 8);
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="231" height="87"><rect width="100%" height="100%" fill="#1b2838"/><text x="50%" y="50%" fill="#66c0f4" font-size="13" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif">' + t + '</text></svg>';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
function 黄游DLC区() {
  return '<div style="margin:0 0 18px"><h2 style="color:#fff;font-size:15px;font-weight:600;margin:4px 0 12px">此游戏的内容 <span style="color:#8f98a0;font-size:11px;font-weight:400">· 全部</span><span style="float:right;font-weight:400"><button class="btnv6_blue_hoverfade btn_small" onclick="黄游新增DLC()" style="margin-left:8px">➕ 新增 DLC</button></span></h2><div id="yyDlcList"><div style="color:#8f98a0;font-size:12px;padding:10px 0">暂无 DLC 内容。</div></div></div>';
}

window.黄游刷新DLC区 = function() {
  var box = document.getElementById('yyDlcList');
  if (!box) return;
  var c = 黄游上下文();
  黄游列出DLC(c.cat, c.name).then(function(list) {
    var gn = c.name.replace(/'/g, "\\'");
    function 价格(d) { var fn = Math.round(parseFloat(String(d.price || '0').replace(/[^\d.]/g, '')) || 0); return { final: fn ? '¥ ' + fn : '价格待定' }; }
    function 折扣块(pr) { return '<div class="game_area_dlc_price"><div style="font-size:14px;color:#c6d4df;font-family:Motiva Sans,Sans-serif">' + pr.final + '</div></div>'; }
    var h = '<div class="game_area_dlc_list"><div class="gameDlcBlocks">';
    var hasDeluxe = (list || []).some(function(d) { return d.豪华特典 || d.name === '豪华版特典'; });
    // 若数据里还没有「豪华版特典」，默认补一张豪华特典卡
    if (!hasDeluxe) {
      var 豪华 = 价格({ price: 黄游豪华DLC数字(c.info) });
      h += '<div class="game_area_dlc_row dlc_highlight odd" style="cursor:pointer" onclick="黄游打开豪华DLC()">';
      h += '<div class="capsule_container"><img class="capsule" src="' + 黄游胶囊('豪华版特典') + '" alt=""></div>';
      h += '<div class="game_area_dlc_name"><div class="dlc_highlight_reason_container"><div class="dlc_highlight_reason">豪华特典</div></div><div style="font-size:14px;font-weight:600;color:#fff">豪华版特典</div><div style="font-size:11px;color:#8f98a0">预售特典 · 专属服装 · 数码设定集 · 原声集</div></div>';
      h += '<div class="game_area_dlc_price">' + 折扣块(豪华) + '</div>';
      h += '</div>';
    }
    // 真实 DLC：豪华版特典 作高亮卡，其余作一行行
    list.forEach(function(d, idx) {
      var nm = (d.name || '未知 DLC').replace(/'/g, "\\'");
      var pr = 价格(d);
      if (d.豪华特典 || d.name === '豪华版特典') {
        h += '<a class="game_area_dlc_row dlc_highlight odd" onclick="黄游打开DLC详情(\'' + gn + '\',\'' + nm + '\')">';
        h += '<div class="capsule_container"><img class="capsule" src="' + 黄游胶囊(d.name) + '" alt=""></div>';
        h += '<div class="game_area_dlc_name"><div class="dlc_highlight_reason_container"><div class="dlc_highlight_reason">豪华特典</div></div>' + escHtml(d.name) + '</div>';
        h += '<div class="game_area_dlc_price">' + 折扣块(pr) + '</div></a>';
      } else {
        h += '<a class="game_area_dlc_row ' + (idx % 2 ? 'odd' : 'even') + '" onclick="黄游打开DLC详情(\'' + gn + '\',\'' + nm + '\')"><div class="game_area_dlc_name">' + escHtml(d.name) + '</div><div class="game_area_dlc_price">' + 折扣块(pr) + '</div></a>';
      }
    });
    h += '</div></div>';
    box.innerHTML = h;
  });
};
// 删除一个 DLC（dlc 目录 + 其全部内容）
window.黄游删除DLC确认 = function(游戏名, dlc名) {
  var cat = 黄游当前分类;
  var doDel = function() {
    黄游删除DLC(cat, 游戏名, dlc名).then(function() {
      toast('已删除 DLC「' + dlc名 + '」');
      if (typeof 黄游刷新DLC区 === 'function') 黄游刷新DLC区();
    });
  };
  if (typeof confirmDialog === 'function') confirmDialog('确定删除 DLC「' + dlc名 + '」及其全部内容？', doDel);
  else doDel();
};

// ============================================================
// 版本对比表：标准版 / 豪华版 / 完整版（带一点广告词）
// ============================================================
function 黄游版本对比() {
  var c = 黄游上下文();
  var info = c.info;
  var cfg = 黄游获取词条配置(info.type, info.subtype);
  var versions = 黄游推导版本(info);
  // 列头：版本名 + 动态价格
  var heads = versions.map(function(v, i) {
    var label = v.label === '原版' ? '标准版' : v.label;
    var num = parseFloat(String(v.price || '').replace(/[^\d.]/g, '')) || 0;
    return { label: label, price: num + ' 元', color: i === 1 ? '#66c0f4' : (i === 2 ? '#a4d007' : '') };
  });
  // 行：标准版/豪华版/完整版 勾选
  var 行 = [
    ['游戏本体', true, true, true],
    ['专属服装 & 数码设定集', false, true, true],
    ['原声音乐集', false, true, true],
    ['剧情 / 关卡扩展 DLC', false, false, true],
    ['全部更新内容', false, false, true],
  ];
  // 广告词：引用游戏名 + 定位 + 题材，让每个游戏都不同
  var focus = (info.focus || '一场难忘的冒险').slice(0, 32);
  var 广告 = '《' + escHtml(info.name) + '》——' + escHtml(focus) + '。官方为你准备了三种收藏方式：<b style="color:#c7d5e0">标准版</b>即刻开启这段' + escHtml(cfg.label || '') + '旅程；<b style="color:#66c0f4">豪华版</b>在标准版之上追加专属服装、数码设定集与原声集，把' + escHtml(info.name) + '的每一帧心动都装进收藏夹；<b style="color:#a4d007">完整版</b>则一次性集齐全部剧情、全部 DLC 与全部特典，让你的' + escHtml(info.name) + '之旅不留遗憾。';
  var h = '<div class="block" style="margin-top:16px"><div class="block_title">版本对比</div>';
  h += '<div style="color:#8f98a0;font-size:12px;line-height:1.8;margin-bottom:10px">' + 广告 + '</div>';
  h += '<table class="yy-ver-table"><thead><tr><th style="text-align:left">包含内容</th>';
  heads.forEach(function(hd) { h += '<th style="' + (hd.color ? 'color:' + hd.color : '') + '">' + escHtml(hd.label) + '<br><span style="font-weight:400;font-size:11px;color:#c7d5e0">' + escHtml(hd.price) + '</span></th>'; });
  h += '</tr></thead><tbody>';
  行.forEach(function(r) {
    h += '<tr><td class="yy-ver-name">' + escHtml(r[0]) + '</td><td>' + (r[1] ? '✔' : '—') + '</td><td>' + (r[2] ? '✔' : '—') + '</td><td>' + (r[3] ? '✔' : '—') + '</td></tr>';
  });
  h += '</tbody></table></div>';
  return h;
}

// 豪华版特典 特典包价格 = 豪华版价格 - 标准版价格（与版本价格联动）
function 黄游豪华DLC数字(info) {
  var vs = 黄游推导版本(info);
  var 标准 = parseFloat(String((vs[0] && vs[0].price) || '').replace(/[^\d.]/g, '')) || 68;
  var 豪华 = parseFloat(String((vs[1] && vs[1].price) || '').replace(/[^\d.]/g, '')) || 109;
  return Math.max(10, Math.round(豪华 - 标准));
}

// 打开「豪华版特典」详情（虚拟 DLC，界面与本作/DLC 一致）
window.黄游打开豪华DLC = function() {
  var c = 黄游上下文();
  黄游当前游戏 = { name: '豪华版特典', info: { name: '豪华版特典', type: c.info.type, subtype: c.info.subtype, focus: '预售/豪华特典：专属服装、数码设定集与原声集', description: '这是游戏《' + c.info.name + '》的豪华版特典 DLC，解锁专属角色服装、数字设定集与原声音乐集，把每一次心动瞬间都永久留藏，更沉浸地回味这段旅程。', price: '¥ ' + 黄游豪华DLC数字(c.info), platform: 'PC', studio: c.info.studio || '', publisher: c.info.publisher || '', refSourceNames: [], refChars: [] }, cat: c.cat, isDLC: true, dlcOf: c.name };
  var el = document.getElementById('yyContentView');
  if (el) 黄游渲染详情(el);
};

// ============================================================
// 新增 DLC：用全局 AI 生成弹窗（二元模板）新增一个 DLC
// ============================================================
window.黄游新增DLC = function() {
  if (typeof openAiGenPanel === 'function') openAiGenPanel('hybz_dlc_new');
  else toast('AI 面板未就绪');
};
function 黄游DLC新上下文() {
  var c = 黄游上下文();
  return 黄游AI开发者上下文().then(function(ctx) {
    return { user: ctx, system: '你是黄油 DLC 策划专家。将基于上下文为本作新增一个 DLC。' };
  });
}
function 黄游DLC新回填(d) {
  if (!d || !d.name) { toast('生成为空，请重试'); return; }
  var c = 黄游上下文();
  var dlcInfo = {
    name: d.name,
    dlcType: d.dlcType || '',
    type: c.info.type,
    subtype: d.subtype || c.info.subtype,
    focus: d.focus || '',
    description: d.description || '',
    price: d.price || '',
    platform: c.info.platform || 'PC',
    studio: c.info.studio || '', publisher: c.info.publisher || '',
    refSourceNames: [], refChars: [],
    配图: (d.配图 || []).map(function(x) { return { title: x.title || '', content: x.content || '' }; }),
    新增内容: d.新增内容 || [],
    createdAt: Date.now()
  };
  黄游保存DLC(c.cat, c.name, d.name, dlcInfo).then(function() {
    // 把该 DLC 的 配图→顶部媒体(media) + 关于此DLC 卖点块(sells) 存进 DLC 自己的 内容.json
    var prev = 黄游当前游戏;
    黄游当前游戏 = { name: d.name, info: dlcInfo, cat: c.cat, isDLC: true, dlcOf: c.name };
    var content = {};
    if (d.配图 && d.配图.length) content.media = d.配图.map(function(x) { return { label: x.title || '', desc: x.content || '' }; });
    if (d.sells && d.sells.length) content.sells = d.sells;
    黄游保存游戏内容(c.cat, d.name, content).then(function() { 黄游当前游戏 = prev; });
  }).then(function() {
    toast('✅ 已新增 DLC「' + d.name + '」');
    if (typeof 黄游刷新DLC区 === 'function') 黄游刷新DLC区();
    var el = document.getElementById('yyContentView');
    if (el && typeof 黄游渲染详情 === 'function') 黄游渲染详情(el);
  });
}
(function() {
  if (typeof registerAiField !== 'function') return;
  registerAiField('hybz_dlc_new', '新增 DLC', 黄游DLC新上下文, { suggestPrompt: 'hybz_dlc_new', fillFn: 黄游DLC新回填 });
  if (typeof registerPrompt === 'function') {
    registerPrompt('hybz_dlc_new', { system: '你是黄油 DLC 策划专家。', user: '依据下面的上下文，为本作新增一个 DLC。输出 JSON：{"name":"该 DLC 的专属名称（如 衣装调教扩充包 / 新章·夏日回忆 / 原声音乐集，不要包含游戏本体名，也不要带「DLC」字样）","dlcType":"剧情与关卡类/玩法与扩充类/装扮与场景类/设定与访谈类","subtype":"子类型","price":"本 DLC 价格（根据本 DLC 内容量的多少适当设定金额，以人民币 ¥ 为单位，不要给随意金额）","focus":"一句话卖点","description":"关于此DLC：一段营销介绍（含本 DLC 的定位与内容）","配图":[{"title":"配图名","content":"该配图的画面内容描述（图片应偏正常化、像典型 CG 掠影/场景，有色彩化、风格化、有氛围与构图讲究的画面；描述分成两个段落：①场景/构图/人物状态 ②氛围/光影/风格/细节；开头不要重复配图名，直接写画面内容）"}]],"新增内容":["本DLC新增加了什么（清单明细，一条一项，如：新增服装「XX」×3套 / 新增角色「XX」及其剧情线 / 新增后日谈剧情等）"],"sells":[{"title":"卖点标题（如 新增X套服装）","content":"关于此DLC的营销向推销描述（讲清这个亮点怎么好、内容量多少，勾人购买）"}]}\n要求：{direction}\n\n【游戏信息与上下文】\n{text}' });
  }
  if (window.AI_QUICK_PRESETS) window.AI_QUICK_PRESETS['hybz_dlc_new'] = [
    { label: '📜 剧情与关卡类', dir: 'DLC 类型：剧情与关卡类——**独立的番外/外传故事**（前传 / 另一个角色的完整线 / 合家欢 / 独立番外，是与主线无关的独立故事，不是结局后的后日谈）', category: 'type', mutual: true },
    { label: '⚙️ 玩法与扩充类', dir: 'DLC 类型：玩法与扩充类（新增玩法/系统/机制），开发者模式为「新增玩法内容 + 与游戏当前结合」', category: 'type', mutual: true },
    { label: '👗 装扮与场景类', dir: 'DLC 类型：装扮与场景类（新增服装/道具/场景），开发者模式为「新增物品说明 + 获取方式设定」', category: 'type', mutual: true },
    { label: '🎙 设定与访谈类', dir: 'DLC 类型：设定与访谈类（设定补充 + 访谈），开发者模式沿用本作布局并追加「访谈（开发者+声优）」', category: 'type', mutual: true },
    { label: '💥 破解开挂类', dir: 'DLC 类型：破解开挂类（开挂作弊/特殊功能），开发者模式为「作用 + 开挂剧情 + 彩蛋」', category: 'type', mutual: true },
  ];
})();

// 生成：某个 DLC 的词条内容
window.黄游生成DLC词条 = function(游戏名, dlc名) {
  var cat = 黄游当前分类;
  黄游加载DLC(cat, 游戏名, dlc名).then(function(dinfo) {
    if (!dinfo) { toast('DLC 数据不存在'); return; }
    var cfg = 黄游获取词条配置(dinfo.type, dinfo.subtype);
    toast('⚡ 正在生成「' + dinfo.name + '」DLC 词条内容...');
    var ctx = '这是游戏《' + 游戏名 + '》的 DLC。\nDLC 名称：' + dinfo.name + '\n游戏类型：' + cfg.label + '\n风格说明：' + cfg.styleDesc + '\n词条版块：' + cfg.sections.join('、') + '\n';
    if (dinfo.focus) ctx += 'DLC 定位：' + dinfo.focus + '\n';
    if (dinfo.description) ctx += 'DLC 简介：' + dinfo.description + '\n';
    var sectionKeys = JSON.stringify(cfg.sections);
    var outputFormat = 'sections 的 key 必须与词条版块完全一致，即 ' + sectionKeys + '。\n格式：{"sections":{"版块名":[{"type":"类型","speaker":"小标题/字段","content":"内容"},...]}}';
    var sysPrompt = '你是一名黄油图鉴编纂专家。为这款 DLC 撰写深度详实的图鉴词条，聚焦 DLC 新增的内容（新角色、新关卡、新H场景、新拔点等），字数要足、要够拔。';
    var req = '每个版块写出若干要点，内容具体；H场景·拔点要具体。';
    LLM.callJSON({ prompt: ctx + '\n【输出格式】\n' + outputFormat + '\n要求：' + req, system: sysPrompt, label: 'DLC 词条生成', temperature: 0.85 }).then(function(data) {
      if (!data || !data.sections) { toast('生成失败'); return; }
      var sectionMap = {};
      if (Array.isArray(data.sections)) { data.sections.forEach(function(s) { sectionMap[s.name] = s.segments || s.articles || s.items || []; }); }
      else { Object.keys(data.sections).forEach(function(k) { sectionMap[k] = data.sections[k]; }); }
      var saves = [];
      cfg.sections.forEach(function(section) { var items = sectionMap[section] || []; saves.push(黄游保存DLC版块(cat, 游戏名, dlc名, section, { section: section, segments: items })); });
      return Promise.all(saves);
    }).then(function() {
      toast('✅ DLC 词条已生成');
      var el = document.getElementById('yyContentView'); if (el) 黄游渲染详情(el);
    }).catch(function(err) { toast('❌ ' + err.message); });
  }).catch(function(err) { toast('❌ ' + err.message); });
};

// 生成：某个 DLC 的评测
window.黄游生成DLC评测 = function(游戏名, dlc名) {
  var cat = 黄游当前分类;
  toast('🤖 正在生成 DLC 评测...');
  // 若当前正打开该 DLC，直接用 DLC 完整上下文（本体 + 本DLC 两段）；否则按传入名加载
  var 黄游当前游戏 = window.黄游当前游戏;
  if (黄游当前游戏 && 黄游当前游戏.isDLC && (!dlc名 || 黄游当前游戏.name === dlc名)) {
    黄游AI开发者上下文().then(function(ctx) {
      var rendered = renderPrompt('hybz_review_gen', { text: ctx, count: 10, target: 'DLC' });
      return LLM.callJSON({ prompt: rendered.user, system: rendered.system, label: 'DLC 评测生成', temperature: 0.9 }).then(function(data) {
        var list = (data && data.list) || [];
        if (!list.length) { toast('生成失败'); return; }
        黄游保存DLC评价(cat, 黄游当前游戏.dlcOf, 黄游当前游戏.name, list).then(function() {
          toast('✅ 已生成 ' + list.length + ' 条 DLC 评测');
          var el = document.getElementById('yyContentView'); if (el) 黄游渲染详情(el);
        });
      });
    }).catch(function(err) { toast('❌ ' + (err && err.message ? err.message : err)); });
    return;
  }
  黄游加载DLC(cat, 游戏名, dlc名).then(function(dinfo) {
    if (!dinfo) { toast('DLC 数据不存在'); return; }
    var cfg = 黄游获取词条配置(dinfo.type, dinfo.subtype);
    var ctx = 'DLC 名称：' + dinfo.name + '\n所属游戏：' + 游戏名 + '\n类型：' + cfg.label + '\n简介：' + (dinfo.description || '') + '\n主打卖点：' + (dinfo.focus || '');
    var rendered = renderPrompt('hybz_review_gen', { text: ctx, count: 10, target: 'DLC' });
    LLM.callJSON({ prompt: rendered.user, system: rendered.system, label: 'DLC 评测生成', temperature: 0.9 }).then(function(data) {
      var list = (data && data.list) || [];
      if (!list.length) { toast('生成失败'); return; }
      黄游保存DLC评价(cat, 游戏名, dlc名, list).then(function() {
        toast('✅ 已生成 ' + list.length + ' 条 DLC 评测');
        var el = document.getElementById('yyContentView'); if (el) 黄游渲染详情(el);
      });
    }).catch(function(err) { toast('❌ ' + err.message); });
  }).catch(function(err) { toast('❌ ' + err.message); });
};

// ============================================================
// 右栏「功能」区块
// ============================================================
function 黄游右栏功能(cfg) {
  var feats = [
    { ic: 'page/ico_singlePlayer.png', lb: '单人' },
    { ic: 'page/ico_achievements.png', lb: 'Steam 成就' },
    { ic: 'page/ico_cloud.png', lb: '云存档' },
    { ic: 'page/ico_coop.png', lb: '在线合作' },
    { ic: 'page/ico_multiPlayer.png', lb: '多人' },
    { ic: 'page/ico_familysharing.png', lb: '家庭共享' },
  ];
  var h = '<div class="block responsive_apppage_details_left" id="category_block"><div class="block_title">功能</div><div class="game_area_features_list_ctn">';
  feats.forEach(function(f) {
    h += '<a class="game_area_details_specs_ctn" onclick="return false"><div class="icon"><img class="category_icon" src="' + 黄游素材(f.ic) + '" alt=""></div><div class="label">' + f.lb + '</div></a>';
  });
  h += '</div></div>';
  return h;
}

// ============================================================
// 右栏「语言」区块
// ============================================================
function 黄游右栏语言() {
  var langs = [
    { n: '简体中文', i: 1, a: 1, s: 1 },
    { n: '英语', i: 1, a: 1, s: 1 },
    { n: '日语', i: 1, a: 1, s: 1 },
    { n: '繁体中文', i: 1, a: 0, s: 1 },
    { n: '韩语', i: 1, a: 0, s: 1 },
    { n: '法语', i: 1, a: 0, s: 1 },
  ];
  var h = '<div class="block responsive_apppage_details_right"><div class="block_title">语言<span>:</span></div>';
  h += '<table class="game_language_options" cellpadding="0" cellspacing="0"><thead><tr><th style="width:110px"></th><th class="checkcol">界面</th><th class="checkcol">完全音频</th><th class="checkcol">字幕</th></tr></thead><tbody>';
  langs.forEach(function(l) {
    var cls = l.i === 0 && l.a === 0 && l.s === 0 ? ' class="unsupported"' : '';
    h += '<tr' + cls + '><td class="ellipsis">' + l.n + '</td><td class="checkcol">' + (l.i ? '<span>✔</span>' : '') + '</td><td class="checkcol">' + (l.a ? '<span>✔</span>' : '') + '</td><td class="checkcol">' + (l.s ? '<span>✔</span>' : '') + '</td></tr>';
  });
  h += '</tbody></table></div>';
  return h;
}

// ============================================================
// 关于此游戏：营销向文案（概述 + 口号 + ●卖点块，从 内容.json 读取）
// ============================================================
function 黄游关于正文(info, cfg, cat) {
  var h = '';
  if (info.description) h += '<p>' + escHtml(info.description) + '</p>';
  h += '<div id="yyAboutMarketing" style="margin-top:14px"><span class="yy-loading" style="color:#8f98a0;font-size:12px">⏳ 营销文案加载中…</span></div>';
  return h;
}

// 异步填充「关于此游戏」营销卖点块（内容.json 的 sells，初次生成即填充）
window.黄游加载营销内容 = function() {
  var box = document.getElementById('yyAboutMarketing');
  if (!box) return;
  var c = 黄游上下文();
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    var sells = (data && data.sells) || [];
    var h = '';
    sells.forEach(function(s) {
      h += '<div style="margin:14px 0"><strong style="color:#fff;font-size:14px">● ' + escHtml(s.title) + '</strong><div style="color:#c7d5e0;font-size:13px;line-height:1.8;margin-top:4px">' + escHtml(s.content || '') + '</div></div>';
    });
    if (!sells.length) h += '<div style="color:#8f98a0;font-size:12px">暂无营销内容。</div>';
    box.innerHTML = h;
  });
};

// 媒体区：按 内容.json 的 media（AI 生成）渲染，数量自由、最少 1 张；点击缩略图/箭头可切换（如真商店页）
window.黄游加载媒体 = function() {
  var c = 黄游上下文();
  var big = document.getElementById('yyMediaBig');
  var thumbs = document.getElementById('yyMediaThumbs');
  if (!big || !thumbs) return;
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    var media = (data && data.media) || [];
    if (!media.length) media = [{ label: '主视觉图', desc: '' }];
    // 若 AI 把图名/描述写反了（label 明显长于 desc），交换回来，保证 UI 上"名字在前、描述在后"。
    media = media.map(function(m) {
      var L = String(m.label || '').length, D = String(m.desc || '').length;
      if (L > D * 1.4 && D) return { label: m.desc, desc: m.label };
      return m;
    });
    window.黄游媒体列表 = media;
    window.黄游媒体索引 = 0;
    var th = '';
    media.forEach(function(m, i) {
      th += '<div onclick="黄游媒体切换(' + i + ')" class="yy-media-thumb">' + 黄游图占(m.label || '配图', 'width:116px;height:65px;flex:0 0 116px', true) + '</div>';
    });
    thumbs.innerHTML = th || '<span style="color:#8f98a0;font-size:11px;padding:4px 0">仅一张主图</span>';
    黄游媒体设置();
  });
};

window.黄游媒体设置 = function() {
  var big = document.getElementById('yyMediaBig');
  var media = window.黄游媒体列表 || [];
  var idx = window.黄游媒体索引 || 0;
  if (!big || !media.length) return;
  var m = media[idx];
  var h = '<div class="yy-media-big">';
  h += '<div class="yy-media-stage" style="background:' + 黄游角色色(m.label) + ';aspect-ratio:16/9;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px"><div class="yy-media-stage-ic">🖼</div><div class="yy-media-stage-title">' + escHtml(m.label || '配图') + '</div>';
  h += '<div class="yy-media-oncap"><div class="yy-media-cap-t">' + escHtml(m.label || '配图') + '</div><div class="yy-media-cap-d">' + escHtml(m.desc || '') + '</div></div>';
  h += '</div>';
  if (media.length > 1) {
    h += '<span class="yy-media-nav" style="left:12px" onclick="黄游媒体上()">‹</span>';
    h += '<span class="yy-media-nav" style="right:12px" onclick="黄游媒体下()">›</span>';
    h += '<span class="yy-media-count">' + (idx + 1) + ' / ' + media.length + '</span>';
  }
  h += '</div>';
  big.innerHTML = h;
  // 缩略图高亮当前张
  document.querySelectorAll('#yyMediaThumbs .yy-media-thumb').forEach(function(t, i) { t.classList.toggle('on', i === idx); });
};

window.黄游媒体切换 = function(idx) { window.黄游媒体索引 = idx; 黄游媒体设置(); };
window.黄游媒体上 = function() { var m = window.黄游媒体列表 || []; if (!m.length) return; window.黄游媒体索引 = (window.黄游媒体索引 - 1 + m.length) % m.length; 黄游媒体设置(); };
window.黄游媒体下 = function() { var m = window.黄游媒体列表 || []; if (!m.length) return; window.黄游媒体索引 = (window.黄游媒体索引 + 1) % m.length; 黄游媒体设置(); };

// 异步填充「关于此游戏」词条版块
window.黄游加载词条版块 = function() {
  var box = document.getElementById('yyAboutSections');
  if (!box) return;
  var c = 黄游上下文();
  var cfg = 黄游获取词条配置(c.info.type, c.info.subtype);
  var loads = (cfg.sections || []).map(function(s) { return 黄游版块取(s).then(function(d) { return { name: s, data: d }; }); });
  Promise.all(loads).then(function(results) {
    var hh = '';
    var has = false;
    results.forEach(function(r) {
      var segs = (r.data && r.data.segments) || [];
      if (!segs.length) return;
      has = true;
      hh += '<h2 class="bb_tag">' + escHtml(r.name) + '</h2>';
      segs.forEach(function(sg) {
        var sp = (sg && sg.speaker) || '';
        hh += '<p>' + (sp ? '<strong>' + escHtml(sp) + '</strong>　' : '') + escHtml((sg && sg.content) || '') + '</p>';
      });
    });
    if (has) { box.innerHTML = hh; }
    else { box.innerHTML = '<div style="color:#8f98a0;font-size:12px">词条版块尚未生成。</div>'; }
  });
};

// ============================================================
// 内容详情（点击右栏「内容」→ 开发者模式编辑具体内容：关卡/章节/线路等）
// ============================================================
var 黄游内容开发者模式 = true;
var 黄游内容板块当前 = '';

function 黄游内容板块配置(type) {
  var cur = window.黄游当前游戏;
  var dlcType = (cur && cur.isDLC) ? ((cur.info && cur.info.dlcType) || '') : '';
  var galgame = [
    { key: '登场角色', label: '登场角色', phT: '角色名（女主/配角）', phC: '立绘/性格/CV/对应独有线/其 H 场景，内容紧扣本作设定', route: false, chars: true },
    { key: '__route', label: '剧情路线', phT: '剧情节点', phC: '该节点剧情', route: true },
    { key: '后日谈', label: '后日谈', phT: '后日谈标题', phC: '从某个结局延伸的独立后日谈叙事', route: false, cards: true },
    { key: '回想CG', label: '回想CG', phT: 'CG 标题 / 场景名', phC: '该张 CG 的画面内容、构图、人物姿态/表情、氛围', route: false, cg: true },
    { key: '回想场景', label: '回想场景', phT: '场景标题（对应某节点）', phC: '该节点的具体对白（男女主对话为主）', route: false, scenes: true },
    { key: '物品', label: '物品', phT: '物品名', phC: '外观/用途/获取方式/解锁条件/所属套装/剧情关联（推进剧情的关键物品）', item: true },
    { key: '服装', label: '服装', phT: '服装名', phC: '外观/用途/获取方式/解锁条件/所属套装/剧情关联', item: true },
  ];
  // DLC 版：物品/服装 改名为「新增物品/新增服装」（区别于本体的 物品/服装）
  var galgameDLC = galgame.map(function(s) {
    if (s.key === '物品') return { key: s.key, label: '新增物品', phT: s.phT, phC: s.phC, item: true };
    if (s.key === '服装') return { key: s.key, label: '新增服装', phT: s.phT, phC: s.phC, item: true };
    return s;
  });
  // —— DLC 按「类型」走不同开发者模式布局 ——
  if (dlcType) {
    if (dlcType === '剧情与关卡类') return galgameDLC;
    if (dlcType === '玩法与扩充类') return [
      { key: '新增玩法内容', label: '新增玩法内容', phT: '玩法 / 系统名', phC: '该 DLC 新增的玩法、系统、机制的说明，内容紧扣本作' },
      { key: '与游戏当前结合', label: '与游戏当前结合', phT: '结合点 / 联动条目', phC: '该玩法如何与本作现有系统/剧情/角色结合，内容紧扣本作' },
      { key: '物品', label: '新增物品', phT: '物品名', phC: '该 DLC 新增物品的说明（外观/用途/获取/解锁/套装/剧情关联）', item: true },
      { key: '服装', label: '新增服装', phT: '服装名', phC: '该 DLC 新增服装的说明（外观/用途/获取/解锁/套装/剧情关联）', item: true },
    ];
    if (dlcType === '装扮与场景类') return [
      { key: '物品', label: '新增物品', phT: '物品名', phC: '该 DLC 新增物品的说明（外观/用途/获取/解锁/套装/剧情关联）', item: true },
      { key: '服装', label: '新增服装', phT: '服装名', phC: '该 DLC 新增服装的说明（外观/用途/获取/解锁/套装/剧情关联）', item: true },
      { key: '剧情事件', label: '剧情事件·触发', phT: '事件名', phC: '穿上/使用某服装道具后触发的剧情事件（地点/触发条件/剧情内容），内容紧扣本作' },
      { key: '角色反应', label: '角色反应', phT: '角色 × 服装/道具', phC: '每个角色穿上某服装/用某道具时的反应（害羞/兴奋/顺从/堕落），内容紧扣本作' },
    ];
    if (dlcType === '设定与访谈类') return galgame.concat([{ key: '访谈', label: '访谈', phT: '访谈标题', phC: '开发者/声优长篇访谈内容', route: false, interview: true }]);
    if (dlcType === '破解开挂类') return [
      { key: '作用', label: '作用', phT: '功能 / 效果', phC: '该开挂能实现什么功能/效果，区分「游戏内开挂」（改数值/解锁/跳过/全满）与「剧情外挂」（影响剧情走向/解锁隐藏线/改写结局），内容紧扣本作' },
      { key: '开挂剧情', label: '开挂剧情', phT: '剧情节点 / 情节', phC: '把剧情与开挂合理化，用开挂来实现非平常式的突飞猛进（瞬间跨越阶段/一步登天/解锁隐藏路线），展示那种"开了挂"的爽快与冲击，内容紧扣本作' },
      { key: '彩蛋', label: '彩蛋', phT: '彩蛋标题', phC: '开挂之后哪里有变动/惊喜（彩蛋风格：隐藏对话/额外分支/角色隐藏表现/偷藏的心意/未公开的立绘与连动），内容紧扣本作' },
    ];
  }
  var map = {
    galgame: galgame,
    rpg: [
      { key: '地图章节', label: '地图 / 章节', phT: '章节 / 地图名', phC: '地图、剧情节点、事件与角色遭遇，内容紧扣本作设定' },
      { key: '登场角色', label: '登场角色', phT: '角色名', phC: '职业/技能/性格/对应 H，内容紧扣本作设定' },
      { key: 'H场景', label: 'H 场景 · 拔点', phT: '对象 / 场景名', phC: '战败 H / 事件 H 的情形与拔点，内容紧扣本作设定' },
    ],
    slg: [
      { key: '战役关卡', label: '战役 / 关卡', phT: '关卡 / 战役名', phC: '胜利条件、敌方配置、解锁的 H 触发，内容紧扣本作设定' },
      { key: '登场单位', label: '登场角色 · 单位', phT: '角色 / 单位名', phC: '角色定位、调教/战斗数值、对应 H，内容紧扣本作设定' },
      { key: '事件', label: '剧情 · 事件', phT: '事件名', phC: '该事件的地图触发、剧情与 H，内容紧扣本作设定' },
    ],
    fmv: [
      { key: '选择分支', label: '选择 / 分支', phT: '选择点 / 分支名', phC: '该选择点通往的剧情与结局，内容紧扣本作设定' },
      { key: '登场角色', label: '登场角色 · 演员', phT: '角色名', phC: '演员/角色设定/性格/对应剧情，内容紧扣本作设定' },
    ],
    card: [
      { key: '卡牌图鉴', label: '卡牌 / 图鉴', phT: '卡名', phC: '稀有度、属性、养成与解锁 H，内容紧扣本作设定' },
    ],
  };
  return map[type] || [{ key: '游戏内容', label: '游戏内容', phT: '条目名', phC: '该条目的内容，内容紧扣本作设定' }];
}

// 各类型「游戏参数」明细字段（key → 占位提示）
function 黄游内容参数配置(type) {
  var map = {
    galgame: { 画面类型: '2D立绘 / 3D / Live2D / 全动态', 视角: '第一人称 / 第三人称', 女主数量: '如 4', 结局数: '如 10', 'H场景总数': '如 30', 'CG总数': '如 80', 回想容量: '如 60', '声优阵容': '如 小明 / 花梨…', 通关时长: '如 12 小时', 实用度: '★★★★★ / ☆☆☆☆☆', 年龄分级: '18禁 / 全年龄' },
    rpg: { '战斗类型': '回合 / 即时 / 指令', 迷宫: '有 / 无', '职业数量': '如 12', '技能树': '有 / 无', '属性系统': '处女膜等级 / 淫乱度 / H状态', '隐藏结局': '如 3', 通关时长: '如 25 小时', 年龄分级: '18禁' },
    slg: { '战略类型': '大战略 / 经营调教', '调教系统': '好感度 / 淫乱度 / 调教值', '可捕获角色': '如 8', 事件数: '如 40', '回合制': '是 / 否', 通关时长: '如 20 小时' },
    fmv: { 演出: '真人 / 全动态', 演员: '如 ×××', '分支结局数': '如 12', '互动方式': '选择 / 触摸 / 交互', '题材场景': '都市 / 宫斗 / 悬疑…', 通关时长: '如 6 小时' },
    card: { '卡牌类型': '收集 / 对战 / 养成', '稀有度分级': 'N/R/SR/SSR', 卡牌数量: '如 120', '抽卡机制': '有 / 无', '抽到稀有解锁': '专属 H', '编成队伍': '有 / 无' },
  };
  return map[type] || {};
}

function 黄游内容条目HTML(c, cfg, list, dev) {
  var h = '';
  if (!list.length) h += '<div class="yy-empty">还没有' + escHtml(cfg.label) + '——' + (dev ? '点下方「＋ 新增」或「🤖 AI 生成」' : '点右上「开发者模式」进入编辑') + '。</div>';
  list.forEach(function(it, i) {
    if (dev) {
      h += '<div class="yy-content-item">';
      h += '<div class="yy-ci-head"><span class="yy-ci-dot"></span><input class="llm-input" id="ct_t_' + i + '" value="' + escHtml(it.title || '') + '" placeholder="' + escHtml(cfg.phT) + '" oninput="黄游内容存(' + i + ',\'title\',this.value)"></div>';
      h += '<textarea class="llm-input" id="ct_c_' + i + '" rows="4" style="margin-top:7px" placeholder="' + escHtml(cfg.phC) + '" oninput="黄游内容存(' + i + ',\'content\',this.value)">' + escHtml(it.content || '') + '</textarea>';
      h += '<div class="yy-ci-actions"><span class="yy-btn blue yy-btn-sm" onclick="黄游内容AI(' + i + ')">🤖 AI 生成内容</span><span class="yy-btn grey yy-btn-sm" onclick="黄游内容删(' + i + ')">删除</span></div>';
      h += '</div>';
    } else {
      h += '<div class="yy-content-item ro"><div class="yy-ci-title">' + escHtml(it.title || '未命名') + '</div><div class="yy-ci-body">' + escHtml(it.content || '') + '</div>' + 黄游解析按钮(it.title || '', it.content || '') + '</div>';
    }
  });
  return h;
}

window.黄游打开内容 = function() {
  黄游内容开发者模式 = true;
  var c = 黄游上下文();
  window.黄游当前DLC类型 = (c.info && c.info.dlcType) || '';
  var el = document.getElementById('yyContentView');
  if (!el) return;
  el.innerHTML = '<div class="steam-root"><div style="padding:30px 16px;text-align:center;color:#8f98a0">加载中…</div></div>';
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    var sections = 黄游内容板块配置(c.info.type);
    if (!黄游内容板块当前 || !sections.some(function(s) { return s.key === 黄游内容板块当前; })) 黄游内容板块当前 = sections[0].key;
    var h = '<div class="steam-root">';
    h += '<link rel="stylesheet" href="' + 黄游素材('steam-community.css') + '"><link rel="stylesheet" href="' + 黄游素材('motiva_sans.css') + '">';
    h += 黄游社区样式();
    h += '<div class="page_content yy-dev-page">';
    h += '<div style="margin:14px 0 12px"><span class="yy-btn grey" onclick="黄游返回详情()">← 返回详情</span></div>';
    h += '<div class="yy-apphub"><div class="yy-apphub-name">' + escHtml(c.info.name) + '</div></div>';
    if (c.isDLC && c.info.dlcType === '剧情与关卡类') h += '<div class="yy-dlc-banner">✨ 独立剧情 DLC · 番外 / 外传 —— 与主线无关的独立故事（前传 / 另一角色的完整线 / 合家欢 / 独立番外），不是结局后的后日谈。</div>';
    h += '<div id="yyContentTabs">' + 黄游内容渲染Tab(c, sections) + '</div>';
    h += '<div id="yyDevContent">' + 黄游内容渲染当前(c, data, sections) + '</div>';
    h += '</div></div>';
    el.innerHTML = h;
  });
};

function 黄游内容渲染Tab(c, sections) {
  var h = '<div class="yy-cat-tabs" style="margin-top:6px">';
  sections.forEach(function(s) { h += '<span class="yy-cat-tab' + (s.key === 黄游内容板块当前 ? ' act' : '') + '" onclick="黄游内容切板块(\'' + s.key + '\')">' + escHtml(s.label) + '</span>'; });
  h += '</div>';
  return h;
}

window.黄游内容切板块 = function(key) { 黄游内容板块当前 = key; 黄游加载内容当前(); };

function 黄游内容取当前板块(c) {
  var sections = 黄游内容板块配置(c.info.type);
  if (黄游内容板块当前 === '__params') return null;
  return sections.filter(function(s) { return s.key === 黄游内容板块当前; })[0] || sections[0];
}

function 黄游内容渲染当前(c, data, sections) {
  var cfg = 黄游内容取当前板块(c);
  if (!cfg) return '<div class="yy-empty">请选择一个板块。</div>';
  if (cfg.route) return 黄游内容路线HTML(c, data);
  if (cfg.chars) return 黄游角色HTML(c, data);
  if (cfg.cards) return 黄游后日谈HTML(c, data);
  if (cfg.cg) return 黄游回想CGHTML(c, data);
  if (cfg.scenes) return 黄游回想场景HTML(c, data);
  if (cfg.interview) return 黄游访谈HTML(c, data);
  if (cfg.item) return 黄游物品服装HTML(c, data, cfg);
  var list = (data && data[cfg.key]) || [];
  var h = '<div class="yy-content-head" style="margin:12px 0;display:flex;justify-content:space-between;align-items:center"><div><span style="color:#c7d5e0;font-size:15px;font-weight:600">📦 ' + escHtml(cfg.label) + '</span> <span style="color:#8f98a0;font-size:12px">· 共 ' + list.length + ' 个</span></div></div>';
  h += '<div class="yy-cards">';
  if (!list.length) h += '<div class="yy-empty">还没有' + escHtml(cfg.label) + '——点下方「🤖 AI 生成」自动填写。</div>';
  list.forEach(function(it) { h += 黄游内容卡片(it); });
  h += '</div>';
  h += '<div style="display:flex;gap:8px;margin-top:14px"><span class="yy-btn blue" onclick="黄游内容AI全部()">🎨 一键生成全部' + escHtml(cfg.label) + '</span></div>';
  return h;
}

function 黄游内容卡片(it) {
  return '<div class="yy-content-item ro"><div class="yy-ci-head"><span class="yy-ci-dot"></span><div class="yy-ci-title">' + escHtml(it.title || '未命名') + '</div></div><div class="yy-ci-body">' + escHtml(it.content || '') + '</div>' + 黄游解析按钮(it.title || '', it.content || '') + '</div>';
}

// ============================================================
// 物品 / 服装（两版块）：富字段（名称/类别/外观/用途/获取/解锁/所属套装/剧情关联）+ 一键生成全部
// ============================================================
function 黄游物品服装HTML(c, data, cfg) {
  var list = (data && data[cfg.key]) || [];
  var label = cfg.label;
  var icon = cfg.key === '服装' ? '👗' : '🧸';
  var h = '<div class="yy-content-head" style="margin:12px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
  h += '<div><span style="color:#c7d5e0;font-size:15px;font-weight:600">' + icon + ' ' + escHtml(label) + '</span> <span style="color:#8f98a0;font-size:12px">· 共 ' + list.length + ' 个</span></div>';
  if (!黄游是设定访谈DLC()) h += '<span class="yy-btn blue" onclick="黄游物品服装AI全部()">🎨 一键生成全部' + escHtml(label) + '</span>';
  h += '</div>';
  if (!list.length) { h += '<div class="yy-empty">还没有' + escHtml(label) + (黄游是设定访谈DLC() ? '' : '——点右上「🎨 一键生成全部' + escHtml(label) + '」') + '。</div>'; return h; }
  // 按「所属套装」分组：同类套装放在一个套装块里、横向一排中间用线连接；无套装的单独展示
  var groups = {}, order = [], singles = [];
  list.forEach(function(it) {
    var set = (it.set || '').trim();
    if (set) { if (!groups[set]) { groups[set] = []; order.push(set); } groups[set].push(it); } else singles.push(it);
  });
  order.forEach(function(set) {
    h += '<div class="yy-set-block"><div class="yy-set-head"><span class="yy-set-ico">🎴</span><span class="yy-set-title">' + escHtml(set) + '</span><span class="yy-set-count">套装 · ' + groups[set].length + ' 件</span></div><div class="yy-set-row">';
    h += groups[set].map(function(it) { return 黄游物品服装卡(it); }).join('');
    h += '</div></div>';
  });
  if (singles.length) { h += '<div class="yy-item-grid">' + singles.map(黄游物品服装卡).join('') + '</div>'; }
  return h;
}
function 黄游物品服装卡(it) {
  var cat = it.cat ? '<span class="yy-item-cat">' + escHtml(it.cat) + '</span>' : '';
  var plotBadge = it.plot ? '<span class="yy-item-plot-badge">⭐ 剧情道具</span>' : '';
  var desc = [it.look, it.use, it.get].filter(Boolean).join('　') + (it.unlock ? '（解锁：' + it.unlock + '）' : '') + (it.plot ? '。剧情关联：' + it.plot : '');
  return '<div class="yy-item-card">' +
    '<div class="yy-item-head"><span class="yy-item-dot"></span><div class="yy-item-title">' + escHtml(it.name || '未命名') + '</div>' + plotBadge + cat + '</div>' +
    '<div class="yy-item-row"><span class="yy-item-k">外观</span><span class="yy-item-v">' + escHtml(it.look || '') + '</span></div>' +
    '<div class="yy-item-row"><span class="yy-item-k">用途</span><span class="yy-item-v">' + escHtml(it.use || '') + '</span></div>' +
    '<div class="yy-item-row"><span class="yy-item-k">获取</span><span class="yy-item-v">' + escHtml(it.get || '') + (it.unlock ? '（解锁：' + escHtml(it.unlock) + '）' : '') + '</span></div>' +
    (it.plot ? '<div class="yy-item-row plot"><span class="yy-item-k">剧情关联</span><span class="yy-item-v">' + escHtml(it.plot) + '</span></div>' : '') +
    黄游解析按钮(it.name || '', desc) +
    '</div>';
}
window.黄游物品服装AI全部 = function() {
  var c = 黄游上下文(); var cfg = 黄游内容取当前板块(c); var info = c.info;
  if (!cfg || !cfg.item) { toast('当前版块不是物品/服装'); return; }
  var kind = cfg.key === '服装' ? '服装' : '物品';
  toast('⚡ 正在生成全部' + kind + '…');
  黄游LLM({ prompt: '为游戏《' + info.name + '》生成「' + kind + '」列表（每项为一件' + kind + '）。注意：\n- **互斥**：' + (kind === '服装' ? '只生成「服装」（制服/内衣/泳装/婚纱/衣着/饰品等），**不要生成任何道具/装备/物品类**。' : '只生成「物品」（道具/装备/消耗品/饰品/剧情关键道具等），**不要生成任何服装/衣着/装扮类**。') + '\n- 若有成套的设定，用「所属套装(set)」把相关联的' + kind + '归到同一套装名下（套装可空）。\n- 识别并标注「推进剧情的关键' + kind + '」（在剧情中起关键机关/信物/解锁作用，与剧情路线对照），写入「剧情关联(plot)」。\n输出 JSON：{"list":[{"name":"名称","cat":"类别","look":"外观描述","use":"用途/效果","get":"获取方式","unlock":"解锁条件(可空)","set":"所属套装(无则空)","plot":"剧情关联/关键' + kind + '说明(可空)"}]}\n要求：内容具体、紧扣本作' + kind + '与 H 拔点，逻辑自洽。', system: '你是黄油图鉴内容专家。', label: kind + '生成', temperature: 0.85 }).then(function(d) {
    if (d && d.list && d.list.length) {
      var c2 = 黄游上下文();
      黄游加载游戏内容(c2.cat, c2.name).then(function(data) {
        data[cfg.key] = d.list;
        return 黄游保存游戏内容(c2.cat, c2.name, data);
      }).then(function() { toast('✅ 已生成'); 黄游加载内容当前(); });
    } else { toast('生成失败'); }
  }).catch(function(e) { toast('生成失败: ' + e.message); });
};

// —— 「剧情路线」拓扑节点流编辑器（共通线 → 分支节点 → 独有线 → 结局线）——
// ============================================================
// 开发者模式统一上下文：游戏信息 + 登场角色全部 + 剧情路线全部；DLC 则为「本体 + DLC 本卡」两段
// ============================================================
function 黄游AI信息块(label, info, data, dlcList) {
  var isDlc = label.indexOf('DLC') >= 0;
  var s = '【' + label + '】\n名称：' + (info.name || '') + '\n类型：' + (info.type || '') + (info.subtype ? '/' + info.subtype : '') + '\n定位：' + (info.focus || '') + '\n关于此' + (isDlc ? 'DLC' : '游戏') + '：' + (info.description || '');
  s += '\n价格：' + (info.price || '') + '\n制作：' + (info.studio || '') + '\n发行：' + (info.publisher || '') + '\n平台：' + (info.platform || '') + '\n发售日：' + (info.releaseDate || '');
  var vs = 黄游推导版本(info);
  if (!isDlc && vs && vs.length) s += '\n版本：' + vs.map(function(v) { var l = v.label === '原版' ? '标准版' : v.label; return l + '=' + (v.price || ''); }).join(' ｜ ');
  if (dlcList && dlcList.length) s += '\n本作 DLC：' + dlcList.map(function(d) { return d.name || ''; }).join('、');
  var sells = (data && data.sells) || [];
  if (sells.length) s += '\n\n【关于此' + (isDlc ? 'DLC' : '游戏') + ' · 营销卖点】\n' + sells.map(function(x) { return '● ' + (x.title || '') + '：' + (x.content || ''); }).join('\n');
  return s;
}
function 黄游AI角色块(label, data) {
  var chs = (data && data.登场角色) || [];
  return '【' + label + '】' + (chs.length ? '\n' + chs.map(function(ch) { return '· ' + (ch.name || '') + '｜性别：' + (ch.性别 || '') + '｜性格：' + (ch.性格 || '') + '｜CV：' + (ch.cv || '') + '｜对应线路：' + (ch.路线 || '') + '｜简介：' + (ch.简述 || ''); }).join('\n') : '（暂无）');
}
function 黄游AI路线块(label, data) {
  var route = (data && data.route) || { nodes: [], edges: [] };
  if (!(route.nodes || []).length) return '【' + label + '】暂无';
  var s = '【' + label + '】\n节点：\n' + route.nodes.map(function(n) { return '· [' + (n.type || '') + '] ' + (n.line ? n.line + ' - ' : '') + (n.name || '') + '｜内容：' + (n.content || '') + '｜好感' + (parseInt(n.好感度) || 0) + '(Δ' + (isNaN(parseInt(n.好感增量)) ? 0 : parseInt(n.好感增量)) + ')' + '｜堕落' + (parseInt(n.堕落值) || 0) + '(Δ' + (isNaN(parseInt(n.堕落增量)) ? 0 : parseInt(n.堕落增量)) + ')' + '｜淫乱' + (parseInt(n.淫乱值) || 0) + '(Δ' + (isNaN(parseInt(n.淫乱增量)) ? 0 : parseInt(n.淫乱增量)) + ')' + (n.事件 ? '｜事件：' + n.事件 : ''); }).join('\n');
  if (route.edges && route.edges.length) {
    s += '\n连接：\n' + route.edges.map(function(e) { var to = (route.nodes || []).filter(function(x) { return x.id === e.to; })[0]; var from = (route.nodes || []).filter(function(x) { return x.id === e.from; })[0]; return '· ' + ((from && (from.line ? from.line + ' - ' : '') + from.name) || e.from) + (e.option ? ' 「' + e.option + '」' : '') + ' → ' + ((to && (to.line ? to.line + ' - ' : '') + to.name) || e.to); }).join('\n');
  }
  return s;
}
function 黄游AI媒体块(label, data) {
  var media = (data && data.media) || [];
  if (!media.length) return '【' + label + '】暂无';
  return '【' + label + '】\n' + media.map(function(m) { return '· ' + (m.label || '') + '｜' + (m.desc || ''); }).join('\n');
}
// 把任意 DLC 版块的内容转成上下文文本（覆盖通用条目 / 物品/服装富字段 / 角色 / 路线 / 后日谈 / 回想CG / 回想场景 / 访谈）
function 黄游AI板块文本(s, data) {
  var k = s.key;
  if (s.chars) return 黄游AI角色块('登场角色', data).replace(/^【[^】]+】/, '');
  if (s.route) return 黄游AI路线块('剧情路线', data).replace(/^【[^】]+】/, '');
  if (s.cards) { var cs = (data.后日谈 || []); return cs.length ? cs.map(function(cd) { return '· ' + (cd.name || '') + '（从「' + (cd.from || '') + '」延伸' + ((cd.route && cd.route.nodes) ? ('，' + cd.route.nodes.length + '个节点') : '') + '）'; }).join('\n') : '（无）'; }
  if (s.cg) { var cgs = (((data.route || {}).nodes || []).filter(function(n) { return n.cg; })); return cgs.length ? cgs.map(function(n) { return '· ' + (n.name || '') + '→' + (n.cg.title || '') + '｜' + (n.cg.content || ''); }).join('\n') : '（无）'; }
  if (s.scenes) { var scs = (((data.route || {}).nodes || []).filter(function(n) { return n.scene; })); return scs.length ? scs.map(function(n) { return '· ' + (n.name || '') + '→' + (n.scene.dialogue || ''); }).join('\n') : '（无）'; }
  if (s.interview) { var itv = (data.访谈 || {}); var t = (itv.开发者 ? '· 开发者内部访谈：\n' + itv.开发者 : '') + (itv.声优 ? '\n· 角色声优访谈：\n' + itv.声优 : ''); return t || '（无）'; }
  if (s.item) { var its = (data[k] || []); return its.length ? its.map(function(it) { return '· ' + (it.name || '') + '｜类别：' + (it.cat || '') + '｜外观：' + (it.look || '') + '｜用途：' + (it.use || '') + '｜获取：' + (it.get || '') + (it.unlock ? '（解锁：' + it.unlock + '）' : '') + (it.set ? '｜套装：' + it.set : '') + (it.plot ? '｜剧情关联：' + it.plot : ''); }).join('\n') : '（无）'; }
  var list = (data[k] || []);
  return list.length ? list.map(function(x) { return '· ' + (x.title || '') + '｜' + (x.content || ''); }).join('\n') : '（无）';
}
function 黄游AI开发者上下文(noRoute) {
  var c = 黄游上下文();
  if (!c.isDLC) {
    return Promise.all([黄游加载游戏内容(c.cat, c.name), 黄游列出DLC(c.cat, c.name)]).then(function(r) {
      var data = r[0], dlcList = r[1];
      var m = [];
      m.push('══════════ 【本 作（游戏本体）】 ══════════');
      m.push(黄游AI信息块('游戏信息', c.info, data, dlcList));
      m.push(黄游AI角色块('登场角色（全部信息）', data));
      if (!noRoute) m.push(黄游AI路线块('剧情路线（全部内容）', data));
      m.push(黄游AI媒体块('媒体配图', data));
      return m.join('\n\n');
    }).catch(function() { return ''; });
  }
  // DLC：先取本体游戏信息+内容+本体DLC列表，再取本 DLC 的信息+内容，分成两大块
  return Promise.all([黄游加载游戏(c.cat, c.dlcOf), 黄游加载游戏内容(c.cat, c.dlcOf), 黄游列出DLC(c.cat, c.dlcOf)]).then(function(r) {
    var baseInfo = r[0], baseData = r[1], baseDlcList = r[2];
    return 黄游加载游戏内容(c.cat, c.name).then(function(dlcData) {
        var m = [];
        // ================= 本体 一整块 =================
        m.push('══════════ 【本 作（本体游戏）】 ══════════');
        if (baseInfo) m.push(黄游AI信息块('本体 · 游戏信息', baseInfo, baseData, baseDlcList));
        m.push('【本体 · 登场角色（全部信息）】' + (黄游AI角色块('本体登场角色', baseData).replace(/^【[^】]+】/, '')));
        if (!noRoute) m.push('【本体 · 剧情路线（全部内容）】' + (黄游AI路线块('本体剧情路线', baseData).replace(/^【[^】]+】/, '')));
        m.push('【本体 · 媒体配图】' + (黄游AI媒体块('本体媒体', baseData).replace(/^【[^】]+】/, '')));
        // ================= 本 DLC 一整块 =================
        m.push('══════════ 【本 DLC】 ══════════');
        m.push(黄游AI信息块('本 DLC · 游戏信息', c.info, dlcData));
        // DLC 内部全部板块内容（按该 DLC 的开发者模式 tab 遍历，含 登场角色/剧情路线/作用/开挂剧情/彩蛋/物品/服装/访谈 等）
        var dlcSections = 黄游内容板块配置(c.info.type);
        dlcSections.forEach(function(s) { m.push('【本 DLC · ' + s.label + '】\n' + 黄游AI板块文本(s, dlcData)); });
        m.push('【本 DLC · 媒体配图】' + (黄游AI媒体块('DLC媒体', dlcData).replace(/^【[^】]+】/, '')));
        if (c.info.新增内容 && c.info.新增内容.length) m.push('【本 DLC 新增加了什么（清单）】\n· ' + c.info.新增内容.join('\n· '));
        if (c.info.配图 && c.info.配图.length) m.push('【本 DLC 配图】\n' + c.info.配图.map(function(x) { return '· ' + (x.title || '') + '｜' + (x.content || ''); }).join('\n'));
        return m.join('\n\n');
      });
    });
}
function 黄游AI带上下文(basePrompt) {
  return 黄游AI开发者上下文().then(function(ctx) { return ctx + '\n\n【本次任务】\n' + basePrompt; });
}
// 开发者模式 AI 生成统一入口：先带上上下文，再调 LLM（noRoute=true 时不带剧情路线，用于覆盖式重生成路线）
window.黄游LLM = function(opts, noRoute) {
  return 黄游AI开发者上下文(noRoute).then(function(ctx) {
    var o = {}; for (var k in opts) o[k] = opts[k];
    o.prompt = ctx + '\n\n【本次任务】\n' + (o.prompt || '');
    return LLM.callJSON(o);
  });
};

function 黄游内容路线HTML(c, data) {
  var route = (data && data.route) || { nodes: [], edges: [] };
  var h = '<div class="yy-route-head"><div class="yy-lbl">🗺 剧情路线 · 选择驱动的有向无环图（可分叉 / 可汇合 / 结局可共享）</div>';
  if (!黄游是设定访谈DLC()) h += '<div class="yy-route-actions"><span class="yy-btn blue" onclick="黄游路线AI()">🤖 AI 生成全部路线</span></div>';
  h += '</div>';
  if (!route.nodes.length) h += '<div class="yy-empty">还没有剧情路线' + (黄游是设定访谈DLC() ? '' : '——点右上「AI 生成全部路线」自动创建') + '。</div>';
  else h += '<div class="yy-route-tree">' + 黄游路线树HTML(route) + '</div>';
  return h;
}

// 自上而下的分层树：每层一行卡片（自适应高度），连线用测量后的 SVG 叠加（不遮卡片/文字）；cardFn 可自定义节点卡片
function 黄游路线树HTML(route, cardFn, treeId) {
  treeId = treeId || 'yyRouteTree';
  window['黄游路线数据_' + treeId] = route;
  var nodes = route.nodes || [], edges = route.edges || [];
  var byId = {}; nodes.forEach(function(n) { byId[n.id] = n; });
  var level = {};
  function lvl(id) {
    if (level[id] !== undefined) return level[id];
    var mx = 0;
    for (var i = 0; i < edges.length; i++) { var e = edges[i]; if (e.to === id && byId[e.from]) mx = Math.max(mx, lvl(e.from) + 1); }
    level[id] = mx; return mx;
  }
  nodes.forEach(function(n) { lvl(n.id); });
  window['黄游路线层级_' + treeId] = level;
  var maxL = 0; nodes.forEach(function(n) { maxL = Math.max(maxL, level[n.id]); });
  var levels = []; for (var i = 0; i <= maxL; i++) levels.push([]);
  nodes.forEach(function(n) { levels[level[n.id]].push(n); });
  levels.forEach(function(lv) { lv.sort(function(a, b) { return (a.line || a.name).localeCompare(b.line || b.name); }); });
  var rf = cardFn || 黄游路线树节点;
  var h = '<div id="' + treeId + '" class="yy-rt-tree" style="position:relative;width:100%">';
  levels.forEach(function(lv, li) {
    h += '<div class="yy-rt-row" style="' + (li > 0 ? 'margin-top:58px' : '') + '">';
    lv.forEach(function(n) { h += '<div class="yy-rt-card" data-node="' + n.id + '">' + rf(n) + '</div>'; });
    h += '</div>';
  });
  h += '<svg class="yy-rt-svg" style="position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:0"></svg>';
  h += '</div>';
  return h;
}

function 黄游路线树节点(n) {
  var map = { '开端': ['start', '#2a6db0', '#1c4a78'], '日常节点': ['daily', '#2f9e8f', '#22705f'], '剧情节点': ['plot', '#2a7ac2', '#1c5a8f'], '做爱节点': ['hscene', '#e04a5a', '#a8323f'], '分歧节点': ['branch', '#c07a1f', '#8f5a16'], '汇合节点': ['merge', '#7a4fbf', '#5b3a8f'], '结局节点': ['end', '#3a8f4f', '#2a6b39'] };
  var m = map[n.type] || map['剧情节点'];
  var line = n.line;
  var title = '';
  if (line) title = '<span class="yy-rt-line">' + escHtml(line) + '</span><span class="yy-rt-dash">-</span>';
  title += '<span class="yy-rt-name">' + escHtml(n.name || '') + '</span>';
  var love = Math.max(0, Math.min(100, parseInt(n.好感度) || 0));
  var corrupt = Math.max(0, Math.min(100, parseInt(n.堕落值) || 0));
  var lewd = Math.max(0, Math.min(100, parseInt(n.淫乱值) || 0));
  var dl = parseInt(n.好感增量); var dc = parseInt(n.堕落增量); var dw = parseInt(n.淫乱增量);
  function dTxt(v) { if (isNaN(v)) return ''; var cls = v > 0 ? ' up' : (v < 0 ? ' down' : ' zero'); return '<span class="yy-delta' + cls + '">' + (v > 0 ? '+' : '') + v + '</span>'; }
  // 关键节点（里程碑）：好感/堕落/淫乱 达到 25/50/75；100 = 「值满·应结局」提示（非结局）；仅有 type=结局节点 才算结局
  var mile = '';
  [25, 50, 75].forEach(function(t) { if (love === t) mile += '<span class="yy-mile">好感 ' + t + '</span>'; if (corrupt === t) mile += '<span class="yy-mile">堕落 ' + t + '</span>'; if (lewd === t) mile += '<span class="yy-mile">淫乱 ' + t + '</span>'; });
  if (love >= 100) mile += '<span class="yy-mile">好感 100 · 值满</span>';
  if (corrupt >= 100) mile += '<span class="yy-mile">堕落 100 · 值满</span>';
  if (lewd >= 100) mile += '<span class="yy-mile">淫乱 100 · 值满</span>';
  if (n.type === '结局节点') mile += '<span class="yy-mile end">🏁 结局</span>';
  return '<div class="yy-rt-node' + (mile ? ' milestone' : '') + '" style="border-top-color:' + m[1] + ';position:relative">' +
    '<span class="yy-rt-del" onclick="黄游路线节点删(\'' + n.id + '\')" title="删除该节点">✕</span>' +
    '<span class="yy-rt-add" onclick="黄游路线补充围绕(\'' + n.id + '\')" title="围绕此节点 AI 补充（前/后/拆分）">✨</span>' +
    '<div class="yy-rt-badge"><span class="yy-rt-type ' + m[0] + '">' + escHtml(n.type || '剧情节点') + '</span></div>' +
    '<div class="yy-rt-title">' + title + '</div>' +
    '<div class="yy-rt-content">' + escHtml(n.content || '') + '</div>' +
    (mile ? '<div class="yy-rt-mile">' + mile + '</div>' : '') +
    (黄游是设定访谈DLC() ? '<div style="margin-top:8px"><span class="yy-btn grey yy-btn-sm" onclick="黄游解析(\'' + escHtml(((n.line ? n.line + ' - ' : '') + (n.name || ''))) + '\',\'' + escHtml(n.content || '') + '\')">💬 为何这样设计</span></div>' : '') +
    '<div class="yy-rt-stats"><div class="yy-stat"><span class="yy-stat-lb">好感</span><div class="yy-stat-bar"><div class="yy-stat-fill" style="width:' + love + '%;background:linear-gradient(90deg,#ff8ab0,#ff5c8a)"></div></div><span class="yy-stat-num">' + dTxt(dl) + '<b>' + love + '</b></span></div>' +
    '<div class="yy-stat"><span class="yy-stat-lb">堕落</span><div class="yy-stat-bar"><div class="yy-stat-fill" style="width:' + corrupt + '%;background:linear-gradient(90deg,#b08aff,#7a5cff)"></div></div><span class="yy-stat-num">' + dTxt(dc) + '<b>' + corrupt + '</b></span></div>' +
    '<div class="yy-stat"><span class="yy-stat-lb">淫乱</span><div class="yy-stat-bar"><div class="yy-stat-fill" style="width:' + lewd + '%;background:linear-gradient(90deg,#ffb25e,#ff7b3a)"></div></div><span class="yy-stat-num">' + dTxt(dw) + '<b>' + lewd + '</b></span></div></div></div>';
}

// 测量后绘制连线（折线 + 箭头 + 选项文字，带深色描边避免被遮）；遍历内容区内所有路线树
window.黄游路线画连线 = function() {
  var box = document.getElementById('yyDevContent');
  if (!box) return;
  box.querySelectorAll('.yy-rt-tree').forEach(function(tree) {
    var svg = tree.querySelector('.yy-rt-svg');
    var route = window['黄游路线数据_' + tree.id] || { nodes: [], edges: [] };
    if (!svg) return;
    var tr = tree.getBoundingClientRect();
    svg.setAttribute('viewBox', '0 0 ' + tr.width + ' ' + tr.height);
    var cards = {};
    tree.querySelectorAll('.yy-rt-card').forEach(function(card) { cards[card.getAttribute('data-node')] = card; });
    // 用渲染树时算好的稳定层级给节点定层（自上而下 0,1,2...）：确保按拓扑层级分组，避免按像素聚类误判
    var nodeLv = window['黄游路线层级_' + tree.id] || {};
    // 同一组「from层→to层」的边按 from 节点水平位置排序，分配错位偏移
    var groups = {};
    (route.edges || []).forEach(function(e) {
      if (!cards[e.from] || !cards[e.to]) return;
      var k = (nodeLv[e.from] || 0) + '>' + (nodeLv[e.to] || 0);
      (groups[k] = groups[k] || []).push(e);
    });
    Object.keys(groups).forEach(function(k) { groups[k].sort(function(a, b) { return cards[a.from].getBoundingClientRect().left - cards[b.from].getBoundingClientRect().left; }); });
    var assigned = {};
    var p = '';
    (route.edges || []).forEach(function(e) {
      var a = cards[e.from], b = cards[e.to]; if (!a || !b) return;
      var ar = a.getBoundingClientRect(), br = b.getBoundingClientRect();
      var x1 = ar.left - tr.left + ar.width / 2, y1 = ar.bottom - tr.top - 1;
      var x2 = br.left - tr.left + br.width / 2, y2 = br.top - tr.top + 1;
      var band = nodeLv[e.from] + '>' + nodeLv[e.to];
      var idx = groups[band] ? groups[band].indexOf(e) : 0;
      var cnt = (groups[band] || []).length;
      // 横向段在上下相邻两行之间错位：同组中间那几条用小的偏移，边缘用大偏移，呈扇形而不叠成一条线
      var offset = (cnt <= 1) ? 0 : ((idx - (cnt - 1) / 2) * 6);
      var my = (y1 + y2) / 2 + offset;
      // 约束在 [y1+7, y2-7] 之间，避免折弯处越到卡片上方/下方
      my = Math.max(y1 + 7, Math.min(y2 - 7, my));
      p += '<path d="M ' + x1 + ' ' + y1 + ' L ' + x1 + ' ' + my + ' L ' + x2 + ' ' + my + ' L ' + x2 + ' ' + y2 + '" fill="none" stroke="#66c0f4" stroke-width="2" opacity="0.5"/>';
      p += '<path d="M ' + x2 + ' ' + y2 + ' L ' + (x2 - 5) + ' ' + (y2 - 10) + ' L ' + (x2 + 5) + ' ' + (y2 - 10) + ' Z" fill="#66c0f4"/>';
      if (e.option) p += '<text x="' + ((x1 + x2) / 2) + '" y="' + (my - 6) + '" fill="#e0b952" font-size="11" text-anchor="middle" style="paint-order:stroke;stroke:rgba(14,20,27,.95);stroke-width:3px">' + escHtml(e.option) + '</text>';
    });
    svg.innerHTML = p;
  });
};

window.黄游路线节点存 = function(id, k, v) {
  var c = 黄游上下文();
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    var route = data.route || (data.route = { nodes: [], edges: [] });
    var n = route.nodes.filter(function(x) { return x.id === id; })[0];
    if (n) { n[k] = v; return 黄游保存游戏内容(c.cat, c.name, data); }
  });
};

window.黄游路线节点新增 = function() {
  var c = 黄游上下文();
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    var route = data.route || (data.route = { nodes: [], edges: [] });
    route.nodes.push({ id: 'n' + Date.now(), name: '新节点', type: '共通线', content: '' });
    return 黄游保存游戏内容(c.cat, c.name, data);
  }).then(function() { 黄游加载内容当前(); });
};

window.黄游路线节点删 = function(id) {
  var c = 黄游上下文();
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    var route = 黄游路线当前路由(data);
    route.nodes = route.nodes.filter(function(x) { return x.id !== id; });
    route.edges = route.edges.filter(function(e) { return e.from !== id && e.to !== id; });
    return 黄游保存游戏内容(c.cat, c.name, data);
  }).then(function() { 黄游加载内容当前(); });
};

window.黄游路线边新增 = function(from) {
  var c = 黄游上下文();
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    var route = data.route || (data.route = { nodes: [], edges: [] });
    route.edges.push({ id: 'e' + Date.now(), from: from, to: '', option: '' });
    return 黄游保存游戏内容(c.cat, c.name, data);
  }).then(function() { 黄游加载内容当前(); });
};

window.黄游路线边存 = function(eid, k, v) {
  var c = 黄游上下文();
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    var route = data.route || (data.route = { nodes: [], edges: [] });
    var e = route.edges.filter(function(x) { return x.id === eid; })[0];
    if (e) { e[k] = v; return 黄游保存游戏内容(c.cat, c.name, data); }
  });
};

window.黄游路线边改 = function(eid, to) { 黄游路线边存(eid, 'to', to); 黄游加载内容当前(); };
window.黄游路线边删 = function(eid) {
  var c = 黄游上下文();
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    var route = data.route || (data.route = { nodes: [], edges: [] });
    route.edges = route.edges.filter(function(x) { return x.id !== eid; });
    return 黄游保存游戏内容(c.cat, c.name, data);
  }).then(function() { 黄游加载内容当前(); });
};

// 取当前要写入的路由（routeKey=某个后日谈卡片 id 写回该卡片；默认主 route / 当前后日谈）
function 黄游路线当前路由(data, routeKey) {
  var key = routeKey !== undefined ? routeKey : window.黄游后日谈当前;
  if (key && data.后日谈) {
    var card = data.后日谈.filter(function(x) { return x.id === key; })[0];
    if (card) return card.route || (card.route = { nodes: [], edges: [] });
  }
  return data.route || (data.route = { nodes: [], edges: [] });
}

window.黄游路线AI = function() {
  var c = 黄游上下文(); var info = c.info;
  toast('⚡ 正在生成《' + info.name + '》剧情路线 …');
  黄游LLM({ prompt: '为游戏《' + info.name + '》生成剧情路线（有向无环图 DAG，以"选择"区分线路）。galgame 惯例：一条共通线开场，经过 1-2 个分歧点按「选项」分叉到不同角色线；各线可中途汇合；最后可汇聚到同一结局，也可各自有结局。输出 JSON：{"nodes":[{"id":"n1","line":"线路名(如 共通线/蜜桃线/结局线，可空)","name":"节点标题","type":"开端/日常节点/剧情节点/做爱节点/分歧节点/汇合节点/结局节点","content":"该节点剧情","好感度":0,"堕落值":0,"淫乱值":0,"好感增量":0,"堕落增量":0,"淫乱增量":0,"事件":"该节点/达阈值发生的关键事件(可空)"}],"edges":[{"from":"n1","to":"n2","option":"该分支对应的选择(可空=直连)"}]}\n要求：\n- 节点用 from/to 连成图；「分歧节点」可有多条带 option 的出边；一个节点可有多条入边（汇合）。\n- 无出边的节点=结局；可共享或各自有结局。\n- **type 区分**：`日常节点`=纯日常/生活片段（吃饭、闲谈、日常互动，**不推进剧情**）；`剧情节点`=推进故事/游戏进度（关键发展、冲突、事件、推动主线）；`做爱节点`=情色性爱/H场景（具体到体位/地点/情形）；`开端`=开场；`分歧节点`=分叉；`汇合节点`=多线并入；`结局节点`=终点。\n- **节奏**：日常（日常节点）作铺垫与缓冲、剧情（剧情节点）推进主线，两者与情色（做爱节点）合理交叉，不要只有日常没有主线推进、也不要全是主线没有日常缓冲。\n- 【好感度/堕落值/淫乱值】0-100 整数，是节点处的当前状态。三值含义区分：\n  - **好感度**：女主对玩家的情感/爱慕程度（越亲密、越依恋）。\n  - **堕落值**：对调教/过激行为的**忍耐/承受程度**（露出、尿粪、截肢等极端行为的耐受），偏**被动承受**。\n  - **淫乱值**：**主动的性欲/主动程度**（多想主动接受、主动求欢、会引发"反推"），偏**主动**。\n-【好感增量/堕落增量/淫乱增量】经过该节点后数值的增减（可为负）。\n-【关键阈值 25/50/75】：数值达到时该节点为"关键节点"，在 content/事件 写明关键事件。**数值=100 只是「值满·应结局」提示，不代表该节点自动成为结局。**\n-【结局】只有 `type=结局节点` 且位于**该线路末尾（无出边）**才称为结局。按三值（好感度/堕落值/淫乱值）的**排列组合**共 7 条结局线：\n  - 单值满 3 条：① 好感度=100（好感线），② 堕落值=100（堕落线），③ 淫乱值=100（淫乱线）。\n  - 双值满 3 条：④ 好感+堕落=100（依存·完美线），⑤ 好感+淫乱=100（情欲沉沦线），⑥ 堕落+淫乱=100（调教母狗线）。\n  - 三值满 1 条：⑦ 好感+堕落+淫乱=100（终极全满线）。\n这些终点节点 type=结局节点、无出边、末尾各值为对应满值（100）。尽量让 7 种都出现，各线走向与内容随对应满值而不同。\n- 内容聚焦本作情节与 H 拔点，逻辑自洽。', system: '你是黄油剧情规划专家。', label: '剧情路线生成', temperature: 0.85 }, true).then(function(d) {
    if (d && d.nodes && d.nodes.length) {
      var c2 = 黄游上下文();
      黄游加载游戏内容(c2.cat, c2.name).then(function(data) {
        var rt = 黄游路线当前路由(data);
        rt.nodes = d.nodes; rt.edges = (d.edges || []);
        return 黄游保存游戏内容(c2.cat, c2.name, data);
      }).then(function() { toast('✅ 已生成'); 黄游加载内容当前(); });
    } else { toast('生成失败'); }
  }).catch(function(e) { toast('生成失败: ' + e.message); });
};

// —— AI 补充生成：在现有剧情路线上插入/拆分节点（带位置+类型选项）——
// —— AI 补充生成：用全局 AI 生成弹窗（openAiGenPanel），依据现有路线补充/插入/拆分 ——
function 黄游路线补充上下文() {
  var c = 黄游上下文();
  return 黄游加载游戏内容(c.cat, c.name).then(function(data) {
    var route = (data && data.route) || { nodes: [], edges: [] };
    var targetId = window.黄游路线补充目标 || '';
    var tn = (route.nodes || []).filter(function(n) { return n.id === targetId; })[0];
    var head = '游戏《' + c.info.name + '》现有剧情路线：\n' + JSON.stringify(route);
    if (tn) head += '\n\n【本次以节点「' + ((tn.line ? tn.line + ' - ' : '') + (tn.name || tn.id)) + '」为核心：围绕它在【前/后】插入新情节、新增分歧/结局，或把它拆分丰富。】';
    return { user: head, system: '你是黄油剧情规划专家。将围绕用户选定的【核心节点】在前/后插入新情节、新增分歧/结局，或把该节点拆分成更多节点；只输出「新增的节点 + 连接它们所需的边」，from/to 可引用现有节点 id（尤其要有与核心节点的连接，或把核心节点的原出边转移给新节点）。' };
  });
}
// 以某个节点为核心打开全局 AI 补充面板
window.黄游路线补充围绕 = function(id) {
  window.黄游路线补充目标 = id;
  if (typeof openAiGenPanel === 'function') openAiGenPanel('hybz_route_supplement');
  else toast('AI 面板未就绪');
}
function 黄游路线补充回填(d) {
  if (!d || !d.nodes || !d.nodes.length) { toast('生成为空，请重试'); return; }
  var c = 黄游上下文();
  黄游加载游戏内容(c.cat, c.name).then(function(curData) {
    var rt = 黄游路线当前路由(curData);
    rt.nodes = rt.nodes.concat(d.nodes || []);
    (d.edges || []).forEach(function(e) { if (!rt.edges.some(function(x) { return x.from === e.from && x.to === e.to; })) rt.edges.push(e); });
    return 黄游保存游戏内容(c.cat, c.name, curData);
  }).then(function() { toast('✅ 已补充'); 黄游加载内容当前(); });
}
(function() {
  if (typeof registerAiField !== 'function') return;
  registerAiField('hybz_route_supplement', '补充剧情路线', 黄游路线补充上下文, { suggestPrompt: 'hybz_route_supplement', fillFn: 黄游路线补充回填 });
  if (typeof registerPrompt === 'function') {
    registerPrompt('hybz_route_supplement', { system: '你是黄油剧情规划专家。', user: '依据下面的现有剧情路线，按用户选定的方向进行补充：围绕用户选定的核心节点在前/后插入新情节、新增分歧/结局、新增做爱节点，或把它拆分成更多节点。只输出「新增的节点 + 连接它们所需的边」。\n\n现有剧情路线：\n{text}\n\n输出 JSON：{"nodes":[{"id":"naddX","line":"线路名","name":"节点标题","type":"开端/日常节点/剧情节点/做爱节点/分歧节点/汇合节点/结局节点","content":"内容","好感度":0,"堕落值":0,"淫乱值":0,"好感增量":0,"堕落增量":0,"淫乱增量":0,"事件":"该节点关键事件(可空)"}],"edges":[{"from":"现有节点id或naddX","to":"现有节点id或naddX","option":"该分支选择，可空"}]}\n要求：from/to 可引用现有节点 id；`日常节点`=纯日常（不推进剧情）；`剧情节点`=推进故事/游戏进度；`做爱节点`=情色性爱/H场景（具体化）；新增节点给 好感度/堕落值/淫乱值(0-100) 与 好感增量/堕落增量/淫乱增量；数值达 25/50/75 为关键节点写事件；**数值=100 只是「应结局」提示**，只有 type=结局节点 且在线的结尾才算结局。内容聚焦本作情节与 H 拔点，逻辑自洽。\n\n【用户方向】{direction}' });
  }
  if (window.AI_QUICK_PRESETS) window.AI_QUICK_PRESETS['hybz_route_supplement'] = [
    // ① 针对节点（位置）—— 必选其一
    { label: '⬅️ 在此节点前', dir: '在核心节点【之前】插入（新节点连向核心节点）', category: 'structure' },
    { label: '➡️ 在此节点后', dir: '在核心节点【之后】插入（核心节点连向新节点）', category: 'structure' },
    { label: '✂️ 拆分此节点', dir: '把核心节点【拆分】成多个更细的节点（保持走向）', category: 'structure' },
    // ② 具体内容（关注重点）—— 选具体加什么
    { label: '🎭 新增剧情节点', dir: '具体内容：新增一段剧情节点', category: 'focus' },
    { label: '🔀 新增分歧点', dir: '具体内容：新增一个分歧节点并分叉', category: 'focus' },
    { label: '🏁 新增结局', dir: '具体内容：新增一个结局节点', category: 'focus' },
    { label: '🔞 新增调教/H事件', dir: '具体内容：新增一段调教或 H 事件', category: 'focus' },
  ];
})();

// ============================================================
// 后日谈：卡片列表 + 每个卡片各自的剧情路线（拓扑，结构同主路线）
// ============================================================
// 后日谈「对应结局」徽章（按结局名着色）
function 黄游结局徽章(from) {
  if (!from) return '<span class="yy-epi-end" style="background:linear-gradient(135deg,#66707a,#4a525b)">🏁 未指定结局</span>';
  return '<span class="yy-epi-end" style="background:' + 黄游角色色(from) + '">🏁 ' + escHtml(from) + '</span>';
}
function 黄游后日谈HTML(c, data) {
  var cards = (data && data.后日谈) || [];
  if (window.黄游后日谈当前) {
    var card = cards.filter(function(x) { return x.id === window.黄游后日谈当前; })[0];
    if (card) {
      var h = '<div class="yy-content-head" style="margin:12px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
      h += '<div><span style="color:#c7d5e0;font-size:15px;font-weight:600">📖 后日谈 · ' + escHtml(card.name || '未命名') + '</span> <span style="color:#8f98a0;font-size:12px">· 对应结局：</span>' + 黄游结局徽章(card.from) + '</div>';
      h += '<span class="yy-btn grey" onclick="黄游后日谈返回()">← 返回后日谈列表</span></div>';
      if (!card.route || !card.route.nodes || !card.route.nodes.length) {
        h += '<div class="yy-empty">还没有后日谈情节——点「🤖 AI 生成后日谈剧情」，AI 会延续该结局后的故事。</div>';
        h += '<div style="display:flex;gap:8px;margin-top:14px"><span class="yy-btn blue" onclick="黄游后日谈AI情节()">🤖 AI 生成后日谈剧情</span></div>';
      } else {
        h += '<div class="yy-route-tree">' + 黄游路线树HTML(card.route) + '</div>';
        h += '<div style="display:flex;gap:8px;margin-top:14px"><span class="yy-btn blue" onclick="黄游后日谈AI情节()">🤖 AI 生成后日谈剧情</span></div>';
      }
      return h;
    }
  }
  var h = '<div class="yy-content-head" style="margin:12px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><div><span style="color:#c7d5e0;font-size:15px;font-weight:600">📖 后日谈 <span style="color:#8f98a0;font-size:12px">· 共 ' + cards.length + ' 个</span></span></div>' + (!黄游是设定访谈DLC() ? '<span class="yy-btn blue" onclick="黄游后日谈AI卡片()">🤖 AI 生成后日谈卡片</span>' : '') + '</div>';
  h += '<div class="yy-cards">';
  if (!cards.length) h += '<div class="yy-empty">还没有后日谈——点「🤖 AI 生成后日谈卡片」，AI 会读取剧情路线、挑选从哪个结局继续推进。</div>';
  cards.forEach(function(cd) {
    var nc = ((cd.route && cd.route.nodes) || []).length;
    h += '<div class="yy-card" style="cursor:pointer;position:relative" onclick="黄游后日谈打开(\'' + cd.id + '\')"><span class="yy-card-del" onclick="event.stopPropagation();黄游后日谈删除(\'' + cd.id + '\')" title="删除该后日谈">✕</span><div class="yy-card-head"><span class="yy-card-dot"></span><div class="yy-card-title">' + escHtml(cd.name || '未命名') + '</div></div>' + 黄游结局徽章(cd.from) + '<div class="yy-card-body">' + nc + ' 个节点</div>' + (黄游是设定访谈DLC() ? '<div style="margin-top:6px"><span class="yy-btn grey yy-btn-sm" onclick="event.stopPropagation();黄游解析(\'' + escHtml(cd.name || '未命名') + '\',\'' + escHtml('从「' + (cd.from || '某结局') + '」延伸的' + (cd.name || '') + '后日谈') + '\')">💬 为何这样设计</span></div>' : '') + '</div>';
  });
  h += '</div>';
  return h;
}
window.黄游后日谈删除 = function(id) {
  var c = 黄游上下文();
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    data.后日谈 = (data.后日谈 || []).filter(function(x) { return x.id !== id; });
    if (window.黄游后日谈当前 === id) window.黄游后日谈当前 = '';
    return 黄游保存游戏内容(c.cat, c.name, data);
  }).then(function() { toast('已删除该后日谈'); 黄游加载内容当前(); });
};
window.黄游后日谈打开 = function(id) { window.黄游后日谈当前 = id; 黄游加载内容当前(); };
window.黄游后日谈返回 = function() { window.黄游后日谈当前 = ''; 黄游加载内容当前(); };
window.黄游后日谈AI卡片 = function() {
  var c = 黄游上下文(); var info = c.info;
  toast('⚡ 正在读剧情路线、生成后日谈卡片 …');
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    var route = (data && data.route) || { nodes: [], edges: [] };
    黄游LLM({ prompt: '为游戏《' + info.name + '》生成「后日谈」卡片，**覆盖该作的 7 条结局线**（按 好感度/堕落值/淫乱值 三值排列组合）：① 好感=100（好感线）② 堕落=100（堕落线）③ 淫乱=100（淫乱线）④ 好感+堕落=100（依存·完美线）⑤ 好感+淫乱=100（情欲沉沦线）⑥ 堕落+淫乱=100（调教母狗线）⑦ 好感+堕落+淫乱=100（终极全满线）。**每条结局各配一张**后日谈（from 写明对应结局）。输出 JSON：{"list":[{"name":"后日谈标题","from":"对应结局（如 好感线结局 / 双满·依存完美结局）"}]}', system: '你是黄油剧情规划专家。', label: '后日谈卡片生成', temperature: 0.85 }).then(function(d) {
      if (d && d.list && d.list.length) {
        var c2 = 黄游上下文();
        黄游加载游戏内容(c2.cat, c2.name).then(function(curData) {
          curData.后日谈 = (curData.后日谈 || []).concat(d.list.map(function(x) { return { id: 'hr' + Date.now() + (Math.random() * 1000 | 0), name: x.name, from: x.from || '', route: { nodes: [], edges: [] } }; }));
          return 黄游保存游戏内容(c2.cat, c2.name, curData);
        }).then(function() { toast('✅ 已生成'); 黄游加载内容当前(); });
      } else { toast('生成失败'); }
    }).catch(function(e) { toast('生成失败: ' + e.message); });
  });
};
// 生成当前后日谈卡片的情节：这个后日谈只沿「它的那个结局」往下走，没有跨结局的共通线
window.黄游后日谈AI情节 = function() {
  var c = 黄游上下文(); var info = c.info;
  var cardId = window.黄游后日谈当前;
  if (!cardId) { toast('请先进入某张后日谈'); return; }
  toast('⚡ 正在生成该后日谈情节 …');
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    var card = ((data && data.后日谈) || []).filter(function(x) { return x.id === cardId; })[0];
    if (!card) { toast('后日谈不存在'); return; }
    var from = card.from || '该结局';
    黄游AI带上下文('为本作下述「后日谈」生成后续剧情路线。这个后日谈【从「' + from + '」这个结局之后】继续推进。\n说明：\n- 后日谈**没有跨结局的「共通线」**——不同结局注定走向不同方向，所以这段只沿「' + from + '」这一条线往下走，不要生成 共通线/跨角色分叉 之类的结构（可以有这条线内部的小分歧与小汇合）。\n- 内容是这个结局之后发生的事（日常/剧情/做爱/此后日谈自己的结局），聚焦「' + from + '」之后的故事与 H 拔点，逻辑自洽。\n输出 JSON：{"nodes":[{"id":"n1","line":"后日谈","name":"节点标题","type":"开端/日常节点/剧情节点/做爱节点/分歧节点/汇合节点/结局节点","content":"内容","好感度":0,"堕落值":0,"淫乱值":0,"好感增量":0,"堕落增量":0,"淫乱增量":0,"事件":"关键事件(可空)"}],"edges":[{"from":"n1","to":"n2","option":"可空=直连"}]}').then(function(prompt) {
      return LLM.callJSON({ prompt: prompt, system: '你是黄油剧情规划专家。', label: '后日谈剧情生成', temperature: 0.85 });
    }).then(function(d) {
      if (d && d.nodes && d.nodes.length) {
        var c2 = 黄游上下文();
        黄游加载游戏内容(c2.cat, c2.name).then(function(cur) {
          var rt = 黄游路线当前路由(cur, cardId);
          rt.nodes = d.nodes; rt.edges = d.edges || [];
          return 黄游保存游戏内容(c2.cat, c2.name, cur);
        }).then(function() { toast('✅ 已生成'); 黄游加载内容当前(); });
      } else { toast('生成失败'); }
    }).catch(function(e) { toast('生成失败: ' + e.message); });
  });
};

// ============================================================
// 登场角色：结构化角色卡片（立绘占位 + 性格/CV/路线 + 简述）
// ============================================================
function 黄游角色色(s) {
  var h = 0; s = String(s || '');
  for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return 'linear-gradient(135deg,hsl(' + h + ',58%,42%),hsl(' + ((h + 45) % 360) + ',52%,30%))';
}
// 配图卡：只显示封面 + 图名（描述文字已在上方媒体轮播中展示，此处不再重复）
function 黄游配图卡(x) {
  return '<div class="yy-imgcard"><div class="yy-img-head"><span class="yy-img-ico">🖼</span><span class="yy-img-title">' + escHtml(x.title || '配图') + '</span></div><div class="yy-img-cover" style="background:' + 黄游角色色(x.title) + '"><span>' + escHtml(x.title || '') + '</span></div></div>';
}
function 黄游角色HTML(c, data) {
  var chs = (data && data.登场角色) || [];
  var h = '<div class="yy-content-head" style="margin:12px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><div><span style="color:#c7d5e0;font-size:15px;font-weight:600">👤 登场角色 <span style="color:#8f98a0;font-size:12px">· 共 ' + chs.length + ' 个</span></span></div>' + (黄游是设定访谈DLC() ? '' : '<div class="yy-route-actions"><span class="yy-btn grey" onclick="黄游角色导入()">📥 导入角色</span><span class="yy-btn blue" onclick="黄游角色AI()">🤖 AI 生成角色</span></div>') + '</div>';
  h += '<div class="yy-cards">';
  if (!chs.length) h += '<div class="yy-empty">还没有登场角色——点「🤖 AI 生成角色」，或「📥 导入角色」从角色卡/灵感角色库导入。</div>';
  chs.forEach(function(ch) {
    var tags = (ch.性别 ? '<span class="yy-char-tag sex">' + escHtml(ch.性别) + '</span>' : '') +
      (ch.性格 ? '<span class="yy-char-tag">' + escHtml(ch.性格) + '</span>' : '') +
      (ch.cv ? '<span class="yy-char-tag cv">CV·' + escHtml(ch.cv) + '</span>' : '') +
      (ch.路线 ? '<span class="yy-char-tag line">' + escHtml(ch.路线) + '</span>' : '');
    h += '<div class="yy-charcard" style="position:relative"><span class="yy-card-del" onclick="黄游角色删(\'' + ch.id + '\')" title="删除该角色">✕</span>' +
      '<div class="yy-char-top"><div class="yy-char-ava" style="background:' + 黄游角色色(ch.name) + '">' + escHtml((ch.name || '?').slice(0, 1)) + '</div><div class="yy-char-name">' + escHtml(ch.name || '未命名') + '</div></div>' +
      (tags ? '<div class="yy-char-tags">' + tags + '</div>' : '') +
      '<div class="yy-char-brief">' + escHtml(ch.简述 || '') + '</div>' +
      黄游解析按钮(ch.name || '', ch.简述 || '') +
      '<div class="yy-char-actions"><span class="yy-btn grey yy-btn-sm" onclick="黄游角色导出(\'' + ch.id + '\')">📤 导出到角色卡</span></div></div>';
  });
  h += '</div>';
  return h;
}
window.黄游角色导入 = function() {
  if (typeof window.stcdOpenCharPicker !== 'function') { toast('角色选择器未就绪'); return; }
  window.stcdOpenCharPicker('hybz_char_import', { gender: '女性', onPick: function(found) {
    var c = 黄游上下文(); var info = c.info;
    var nm = (found.identity && found.identity.basicInfo && found.identity.basicInfo.name) || found.title || '未命名';
    var gender = (found.identity && found.identity.basicInfo && found.identity.basicInfo.gender);
    var genderCn = { female: '女性', male: '男性', femboy: '伪娘', futa: '扶她', beast: '男性' }[gender] || '女性';
    var full = (typeof window.角色卡全部 === 'function') ? window.角色卡全部(found) : '';
    if (!full) { toast('该角色档案为空'); return; }
    toast('◇ 已读取「' + nm + '」角色卡信息，正在按本作生成登场角色 …');
    黄游AI带上下文('用下面的角色卡信息，为游戏《' + info.name + '》生成本作登场角色的条目。输出 JSON：{"name":"角色名","性别":"' + genderCn + '","性格":"性格/属性","cv":"CV 名(可空)","路线":"对应独有线/线路(可空)","简述":"一段描述，含外貌、定位、其 H 场景概况"}\n要求：扣紧本作设定，与角色卡信息保持一致，重新组织成黄游图鉴需要的字段。\n\n【该角色的角色卡全部信息】\n' + full).then(function(prompt) {
      return LLM.callJSON({ prompt: prompt, system: '你是黄油角色设定专家。', label: '导入角色生成', temperature: 0.85 });
    }).then(function(d) {
      if (d && d.name) {
        var c2 = 黄游上下文();
        黄游加载游戏内容(c2.cat, c2.name).then(function(data) {
          data.登场角色 = (data.登场角色 || []).concat([{ id: 'ch' + Date.now() + (Math.random() * 1000 | 0), name: d.name, 性格: d.性格 || '', cv: d.cv || '', 路线: d.路线 || '', 性别: d.性别 || genderCn, 简述: d.简述 || '' }]);
          return 黄游保存游戏内容(c2.cat, c2.name, data);
        }).then(function() { toast('✅ 已导入并生成「' + (d.name || '') + '」'); 黄游加载内容当前(); });
      } else { toast('生成失败'); }
    }).catch(function(e) { toast('生成失败: ' + e.message); });
  } });
};
// 导出：把该角色的内容发送到「角色卡」顶层模块的「生成角色 → 角色描述」，按性别送到对应性别卡
window.黄游角色导出 = function(id) {
  var c = 黄游上下文();
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    var ch = (data.登场角色 || []).filter(function(x) { return x.id === id; })[0];
    if (!ch) return;
    if (typeof 渲染角色主面板 !== 'function') { toast('角色卡模块未就绪'); return; }
    var genderCn = ch.性别 || '女性';
    var catKey = { '女性': 'female', '男性': 'male', '伪娘': 'femboy', '扶她': 'futa', '女': 'female', '男': 'male' }[genderCn] || 'female';
    // 组装完整上下文：游戏信息 + 登场角色全部 + 剧情路线等（走统一 AI 上下文），一并传给角色卡生成
    黄游AI开发者上下文().then(function(ctx) {
      var desc = ctx + '\n\n【本次要导出的角色】\n角色名：' + (ch.name || '') +
        '\n性别：' + genderCn +
        (ch.性格 ? '\n性格：' + ch.性格 : '') +
        (ch.cv ? '\nCV：' + ch.cv : '') +
        (ch.路线 ? '\n对应路线：' + ch.路线 : '') +
        '\n简介：' + (ch.简述 || '');
      角色生成类别 = catKey; 角色生成描述 = desc; 角色生成阶段 = 'input'; 角色当前标签 = 'generate';
      var el = document.getElementById('characterContent');
      if (typeof 切换页面 === 'function') 切换页面('character');
      渲染角色主面板(el || document.body);
      toast('已导出到角色卡·' + genderCn + '·「' + (ch.name || '未命名') + '」');
    });
  });
};
window.黄游角色删 = function(id) {
  var c = 黄游上下文();
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    data.登场角色 = (data.登场角色 || []).filter(function(x) { return x.id !== id; });
    return 黄游保存游戏内容(c.cat, c.name, data);
  }).then(function() { toast('已删除该角色'); 黄游加载内容当前(); });
};
window.黄游角色AI = function() {
  var c = 黄游上下文(); var info = c.info;
  toast('⚡ 正在生成登场角色 …');
  黄游AI带上下文('为游戏《' + info.name + '》生成登场角色。输出 JSON：{"list":[{"name":"角色名","性别":"女性/男性/伪娘/扶她","性格":"性格/属性","cv":"CV 名","路线":"对应独有线/线路","简述":"一段描述，含外貌、定位、其 H 场景概况"}]}\n要求：女主优先，再给配角；结合本作设定与角色关系（如 NTR 就扣紧婚姻/人物），逻辑自洽。').then(function(prompt) {
    return LLM.callJSON({ prompt: prompt, system: '你是黄油角色设定专家。', label: '登场角色生成', temperature: 0.85 });
  }).then(function(d) {
    if (d && d.list && d.list.length) {
      var c2 = 黄游上下文();
      黄游加载游戏内容(c2.cat, c2.name).then(function(curData) {
        curData.登场角色 = d.list.map(function(x) { return { id: 'ch' + Date.now() + (Math.random() * 1000 | 0), name: x.name, 性格: x.性格, cv: x.cv, 路线: x.路线, 性别: x.性别 || '女性', 简述: x.简述 }; });
        return 黄游保存游戏内容(c2.cat, c2.name, curData);
      }).then(function() { toast('✅ 已生成'); 黄游加载内容当前(); });
    } else { toast('生成失败'); }
  }).catch(function(e) { toast('生成失败: ' + e.message); });
};
// ============================================================
// 回想CG / 回想场景：镜像剧情路线（与节点一一对应），每个节点一个生成按钮
// ============================================================
// 常用节点类型颜色
function 黄游回想色(n) {
  var map = { '开端': ['start', '#2a6db0'], '日常节点': ['daily', '#2f9e8f'], '剧情节点': ['plot', '#2a7ac2'], '做爱节点': ['hscene', '#e04a5a'], '分歧节点': ['branch', '#c07a1f'], '汇合节点': ['merge', '#7a4fbf'], '结局节点': ['end', '#3a8f4f'] };
  return map[n.type] || map['剧情节点'];
}
// 是否为「设定与访谈类」DLC（每个节点/条目都带"为何这样设计"解析）
function 黄游是设定访谈DLC() {
  var c = 黄游上下文();
  var t = (window.黄游当前DLC类型) || (c.info && c.info.dlcType) || '';
  return t === '设定与访谈类';
}
// 解析按钮：以开发者视角，分析该节点/条目为何这样设计（导演剪辑版式导演点评）
window.黄游解析 = function(标题, 内容) {
  var c = 黄游上下文(); var info = c.info;
  toast('⚡ 正在解析「' + 标题 + '」为何这样设计 …');
  黄游AI带上下文('作为这款游戏的开发者，分析以下这个设计点**为何这样设计**：它想达到什么效果、背后的考量/意图、与整体设定的呼应。\n\n【设计点】' + 标题 + '\n【内容】' + 内容 + '\n\n输出一篇导演点评式的解析（可从 目的/效果/设计巧思/与剧情的呼应 等角度，较详细）。').then(function(prompt) {
    return LLM.call({ label: '设计解析', prompt: prompt, system: '你是游戏主创，做导演剪辑版式的设计点评，具体、有见解。', temperature: 0.9 });
  }).then(function(text) { if (text) toast('✅ 已生成：\n\n' + text); else toast('生成失败'); }).catch(function(e) { toast('生成失败: ' + e.message); });
};
// 设定与访谈类：每个条目底部的"为何这样设计"按钮（否则返回空）
function 黄游解析按钮(标题, 内容) {
  if (!黄游是设定访谈DLC()) return '';
  return '<div style="margin-top:8px"><span class="yy-btn grey yy-btn-sm" onclick="黄游解析(\'' + escHtml(标题) + '\',\'' + escHtml(内容) + '\')">💬 为何这样设计</span></div>';
}
// 纯对白：去掉每行开头的「角色名：/冒号」、动作旁白/括号等，只留说话内容
function 黄游纯对白(d) {
  return String(d || '').split('\n').map(function(line) {
    line = line.replace(/^\s*[「『【\[]?[^：:\n]{1,12}[」』】\]]?[：:]\s*/, '');
    line = line.replace(/[（(][^）)]{0,30}[）)]\s*/g, '').trim();
    return line;
  }).filter(function(l) { return l; }).join('\n');
}
// 回想 tab 栏（剧情路线 / 后日谈）
function 黄游回想TabBar(type) {
  var cur = window['黄游回想Tab' + type] || 'route';
  function tb(id, label) { return '<span class="yy-rt-tab' + (cur === id ? ' on' : '') + '" onclick="window[\'黄游回想Tab' + type + '\']=\'' + id + '\';黄游加载内容当前()">' + label + '</span>'; }
  return '<div class="yy-rt-tabs">' + tb('route', '🗺 剧情路线') + tb('epilogue', '📖 后日谈') + '</div>';
}
// 回想内容：按当前 tab 渲染（剧情路线 / 后日谈卡片）
function 黄游回想内容(c, data, type) {
  var isCG = type === 'CG';
  var mk = function(rk) { return function(n) { return isCG ? 黄游回想CG卡(n, rk) : 黄游回想场景卡(n, rk); }; };
  if ((window['黄游回想Tab' + type] || 'route') === 'epilogue') {
    var ep = (data && data.后日谈) || [];
    if (!ep.length) return '<div class="yy-empty">还没有后日谈——先去「后日谈」生成，才能按后日谈节点对应回想。</div>';
    var card = window.黄游回想后日谈当前 ? ep.filter(function(x) { return x.id === window.黄游回想后日谈当前; })[0] : null;
    var h = '';
    if (card) {
      h += '<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap"><span class="yy-btn grey yy-btn-sm" onclick="黄游回想后日谈返回()">← 返回后日谈列表</span><span style="color:#8f98a0;font-size:12px">后日谈：' + escHtml(card.name || '') + '</span></div>';
      h += '<div class="yy-route-tree">' + 黄游路线树HTML(card.route || { nodes: [], edges: [] }, mk(card.id), 'yyRouteTree_hd' + card.id) + '</div>';
      return h;
    }
    h += '<div class="yy-cards">';
    ep.forEach(function(e) {
      var nc = ((e.route && e.route.nodes) || []).length;
      h += '<div class="yy-card" style="cursor:pointer" onclick="黄游回想后日谈打开(\'' + e.id + '\')"><div class="yy-card-head"><span class="yy-card-dot"></span><div class="yy-card-title">' + escHtml(e.name || '未命名') + '</div></div><div class="yy-card-body">从「' + escHtml(e.from || '') + '」延伸 · ' + nc + ' 个节点</div></div>';
    });
    h += '</div>';
    return h;
  }
  var route = (data && data.route) || { nodes: [], edges: [] };
  if ((route.nodes || []).length) return '<div class="yy-route-tree">' + 黄游路线树HTML(route, mk(''), 'yyRouteTree') + '</div>';
  return '<div class="yy-empty">还没有剧情路线——先去「剧情路线」生成，回想' + (isCG ? 'CG' : '场景') + '才会按节点对应。</div>';
}
window.黄游回想后日谈打开 = function(id) { window.黄游回想后日谈当前 = id; 黄游加载内容当前(); };
window.黄游回想后日谈返回 = function() { window.黄游回想后日谈当前 = ''; 黄游加载内容当前(); };
// 回想CG
function 黄游回想CGHTML(c, data) {
  var h = '<div class="yy-content-head" style="margin:12px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><div><span style="color:#c7d5e0;font-size:15px;font-weight:600">🖼 回想CG <span style="color:#8f98a0;font-size:12px">· 与剧情路线/后日谈节点一一对应</span></span></div>' + (黄游是设定访谈DLC() ? '' : '<span class="yy-btn blue" onclick="黄游回想CG全部生成()">🎨 一键生成全部节点CG</span>') + '</div>';
  h += '<div style="font-size:11px;color:#8f98a0;margin-bottom:6px">每个节点的 CG 由「该节点的生成按钮」单独生成/重生成。</div>';
  h += 黄游回想TabBar('CG');
  h += 黄游回想内容(c, data, 'CG');
  return h;
}
function 黄游回想CG卡(n, routeKey) {
  var m = 黄游回想色(n);
  var lineTxt = n.line ? '<span class="yy-rt-line">' + escHtml(n.line) + '</span><span class="yy-rt-dash">-</span>' : '';
  var cg = n.cg;
  var h = '<div class="yy-rt-node" style="border-top-color:' + m[1] + ';position:relative">' +
    '<div class="yy-rt-badge"><span class="yy-rt-type ' + m[0] + '">' + escHtml(n.type || '剧情节点') + '</span></div>' +
    '<div class="yy-rt-title">' + lineTxt + '<span class="yy-rt-name">' + escHtml(n.name || '') + '</span></div>';
  if (cg && cg.title) h += '<div class="yy-ttc-img" style="background:' + 黄游角色色(cg.title) + '"><span class="yy-ttc-lbl">CG</span><span class="yy-ttc-title">' + escHtml(cg.title) + '</span></div><div class="yy-rt-content">' + escHtml(cg.content || '') + '</div>';
  else h += '<div class="yy-empty" style="font-size:11px">此节点暂无 CG</div>';
  h += 黄游解析按钮(n.name || '', ((cg && cg.content) || ''));
  h += '<div style="margin-top:8px"><span class="yy-btn blue yy-btn-sm" onclick="黄游回想CG节点生成(\'' + routeKey + '\',\'' + n.id + '\')">' + ((cg && cg.title) ? '🔄 重生成此节点CG' : '🎨 生成本节点CG') + '</span></div></div>';
  return h;
}
window.黄游回想CG节点生成 = function(routeKey, nodeId) {
  var c = 黄游上下文(); var info = c.info;
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    var rt = 黄游路线当前路由(data, routeKey);
    var n = (rt.nodes || []).filter(function(x) { return x.id === nodeId; })[0];
    if (!n) { toast('节点不存在'); return; }
    toast('⚡ 正在生成该节点 CG …');
    黄游LLM({ prompt: '为游戏《' + info.name + '》剧情节点「' + ((n.line ? n.line + ' - ' : '') + (n.name || '')) + '」生成对应的回想CG（以图片为核心）。输出 JSON：{"title":"CG标题/场景名","content":"该CG的画面内容：构图、人物姿态/表情、氛围、背景"}\n节点内容：' + (n.content || ''), system: '你是黄油CG/演出设定专家。', label: '节点回想CG生成', temperature: 0.85 }).then(function(d) {
      if (d && d.title) {
        var c2 = 黄游上下文();
        黄游加载游戏内容(c2.cat, c2.name).then(function(cur) {
          var rt2 = 黄游路线当前路由(cur, routeKey);
          var n2 = (rt2.nodes || []).filter(function(x) { return x.id === nodeId; })[0];
          if (n2) n2.cg = { title: d.title, content: d.content || '' };
          return 黄游保存游戏内容(c2.cat, c2.name, cur);
        }).then(function() { toast('✅ 已生成'); 黄游加载内容当前(); });
      } else { toast('生成失败'); }
    }).catch(function(e) { toast('生成失败: ' + e.message); });
  });
};
window.黄游回想CG全部生成 = function() {
  var c = 黄游上下文(); var info = c.info;
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    var rt = (data && data.route) || { nodes: [], edges: [] };
    var nodes = rt.nodes || [];
    if (!nodes.length) { toast('没有剧情节点'); return; }
    toast('⚡ 正在为 ' + nodes.length + ' 个节点生成 CG …');
    黄游LLM({ prompt: '为游戏《' + info.name + '》为以下每个剧情节点生成一张回想CG。输出 JSON：{"list":[{"id":"节点id","title":"CG标题","content":"画面内容：构图/姿态/表情/氛围/背景"}]}\n节点列表：' + JSON.stringify(nodes.map(function(n) { return { id: n.id, name: (n.line ? n.line + ' - ' : '') + n.name, type: n.type, content: n.content }; })) + '\n要求：每个节点一张 CG，紧扣节点内容与剧情。', system: '你是黄油CG/演出设定专家。', label: '回想CG全部生成', temperature: 0.85 }).then(function(d) {
      if (d && d.list) {
        var c2 = 黄游上下文();
        黄游加载游戏内容(c2.cat, c2.name).then(function(cur) {
          var rt2 = 黄游路线当前路由(cur, '');
          d.list.forEach(function(g) { var n = (rt2.nodes || []).filter(function(x) { return x.id === g.id; })[0]; if (n) n.cg = { title: g.title, content: g.content || '' }; });
          return 黄游保存游戏内容(c2.cat, c2.name, cur);
        }).then(function() { toast('✅ 已生成'); 黄游加载内容当前(); });
      } else { toast('生成失败'); }
    }).catch(function(e) { toast('生成失败: ' + e.message); });
  });
};
// 回想场景
function 黄游回想场景HTML(c, data) {
  var h = '<div class="yy-content-head" style="margin:12px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><div><span style="color:#c7d5e0;font-size:15px;font-weight:600">💬 回想场景 <span style="color:#8f98a0;font-size:12px">· 与剧情路线/后日谈节点一一对应</span></span></div>' + (黄游是设定访谈DLC() ? '' : '<span class="yy-btn blue" onclick="黄游回想场景全部生成()">🎙 一键生成全部节点场景</span>') + '</div>';
  h += '<div style="font-size:11px;color:#8f98a0;margin-bottom:6px">每个节点的场景（男女主对白）由「该节点的生成按钮」单独生成/重生成。</div>';
  h += 黄游回想TabBar('scene');
  h += 黄游回想内容(c, data, 'scene');
  return h;
}
function 黄游回想场景卡(n, routeKey) {
  var m = 黄游回想色(n);
  var lineTxt = n.line ? '<span class="yy-rt-line">' + escHtml(n.line) + '</span><span class="yy-rt-dash">-</span>' : '';
  var scene = n.scene;
  var h = '<div class="yy-rt-node" style="border-top-color:' + m[1] + ';position:relative">' +
    '<div class="yy-rt-badge"><span class="yy-rt-type ' + m[0] + '">' + escHtml(n.type || '剧情节点') + '</span></div>' +
    '<div class="yy-rt-title">' + lineTxt + '<span class="yy-rt-name">' + escHtml(n.name || '') + '</span></div>';
  if (scene && scene.dialogue) h += '<div class="yy-sc-dlg">' + escHtml(黄游纯对白(scene.dialogue)) + '</div>';
  else h += '<div class="yy-empty" style="font-size:11px">此节点暂无场景对白</div>';
  h += 黄游解析按钮(n.name || '', ((scene && scene.dialogue) || ''));
  h += '<div style="margin-top:8px"><span class="yy-btn blue yy-btn-sm" onclick="黄游回想场景节点生成(\'' + routeKey + '\',\'' + n.id + '\')">' + ((scene && scene.dialogue) ? '🔄 重生成此节点场景' : '🎙 生成本节点场景') + '</span></div></div>';
  return h;
}
window.黄游回想场景节点生成 = function(routeKey, nodeId) {
  var c = 黄游上下文(); var info = c.info;
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    var rt = 黄游路线当前路由(data, routeKey);
    var n = (rt.nodes || []).filter(function(x) { return x.id === nodeId; })[0];
    if (!n) { toast('节点不存在'); return; }
    toast('⚡ 正在生成该节点场景对白 …');
    黄游LLM({ prompt: '为游戏《' + info.name + '》剧情节点「' + ((n.line ? n.line + ' - ' : '') + (n.name || '')) + '」生成对应的回想场景（该节点具体发生了什么，基本是男女主之间的对白）。输出 JSON：{"dialogue":"纯对白"}\n【纯对白要求】**只能输出人说的话本身**：每行一句话，**绝对不要出现** 角色名/人名前缀、冒号、动作旁白、括号提示、省略号等，就是纯粹的话语内容。\n节点内容：' + (n.content || ''), system: '你是黄油剧情对白专家。', label: '节点回想场景生成', temperature: 0.85 }).then(function(d) {
      if (d && d.dialogue) {
        var c2 = 黄游上下文();
        黄游加载游戏内容(c2.cat, c2.name).then(function(cur) {
          var rt2 = 黄游路线当前路由(cur, routeKey);
          var n2 = (rt2.nodes || []).filter(function(x) { return x.id === nodeId; })[0];
          if (n2) n2.scene = { dialogue: d.dialogue };
          return 黄游保存游戏内容(c2.cat, c2.name, cur);
        }).then(function() { toast('✅ 已生成'); 黄游加载内容当前(); });
      } else { toast('生成失败'); }
    }).catch(function(e) { toast('生成失败: ' + e.message); });
  });
};
window.黄游回想场景全部生成 = function() {
  var c = 黄游上下文(); var info = c.info;
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    var rt = (data && data.route) || { nodes: [], edges: [] };
    var nodes = rt.nodes || [];
    if (!nodes.length) { toast('没有剧情节点'); return; }
    toast('⚡ 正在为 ' + nodes.length + ' 个节点生成场景对白 …');
    黄游LLM({ prompt: '为游戏《' + info.name + '》为以下每个剧情节点生成「回想场景」（该节点发生的男女主对白）。输出 JSON：{"list":[{"id":"节点id","dialogue":"纯对白"}]}\n【纯对白要求】**只能输出人说的话本身**：每行一句话，**绝对不要出现** 角色名/人名前缀、冒号、动作旁白、括号提示等，就是纯粹的话语内容。\n节点列表：' + JSON.stringify(nodes.map(function(n) { return { id: n.id, name: (n.line ? n.line + ' - ' : '') + n.name, type: n.type, content: n.content }; })) + '\n要求：每个节点一段对白，紧扣节点内容与人物口吻。', system: '你是黄油剧情对白专家。', label: '回想场景全部生成', temperature: 0.85 }).then(function(d) {
      if (d && d.list) {
        var c2 = 黄游上下文();
        黄游加载游戏内容(c2.cat, c2.name).then(function(cur) {
          var rt2 = 黄游路线当前路由(cur, '');
          d.list.forEach(function(g) { var n = (rt2.nodes || []).filter(function(x) { return x.id === g.id; })[0]; if (n) n.scene = { dialogue: g.dialogue || '' }; });
          return 黄游保存游戏内容(c2.cat, c2.name, cur);
        }).then(function() { toast('✅ 已生成'); 黄游加载内容当前(); });
      } else { toast('生成失败'); }
    }).catch(function(e) { toast('生成失败: ' + e.message); });
  });
};

// ============================================================
// 设定与访谈类：访谈（开发者内部 + 声优），长篇、无字数限制
// ============================================================
function 黄游访谈HTML(c, data) {
  var itv = (data && data.访谈) || {};
  var dev = itv.开发者 || '', va = itv.声优 || '';
  var h = '<div class="yy-content-head" style="margin:12px 0"><span style="color:#c7d5e0;font-size:15px;font-weight:600">🎙 访谈 <span style="color:#8f98a0;font-size:12px">· 开发者 + 声优 · 长篇、无字数限制</span></span></div>';
  h += '<div class="yy-itv-card"><div class="yy-itv-head"><span class="yy-itv-ico">🎙</span><div><div class="yy-itv-title">开发者内部访谈</div><div class="yy-itv-sub">开发者们聊开发情景、趣事、灵感来源</div></div></div>';
  h += '<div class="yy-itv-body"><textarea class="yy-itv-ta" rows="14" placeholder="开发者们互相谈当时开发情景、中间发生的趣事、玩法灵感来源等（长篇，不限字数）。" oninput="黄游访谈存(\'开发者\',this.value)">' + escHtml(dev) + '</textarea></div>';
  h += '<div class="yy-itv-foot"><span class="yy-btn blue" onclick="黄游访谈AI(\'开发者\')">🤖 AI 生成开发者访谈</span></div></div>';
  h += '<div class="yy-itv-card" style="margin-top:16px"><div class="yy-itv-head"><span class="yy-itv-ico va">🗣</span><div><div class="yy-itv-title">角色声优访谈</div><div class="yy-itv-sub">为角色配音的声优们的长篇访谈</div></div></div>';
  h += '<div class="yy-itv-body"><textarea class="yy-itv-ta" rows="14" placeholder="为角色配音的声优们的访谈（长篇，不限字数）。" oninput="黄游访谈存(\'声优\',this.value)">' + escHtml(va) + '</textarea></div>';
  h += '<div class="yy-itv-foot"><span class="yy-btn blue" onclick="黄游访谈AI(\'声优\')">🤖 AI 生成声优访谈</span></div></div>';
  return h;
}
window.黄游访谈存 = function(k, v) {
  var c = 黄游上下文();
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    data.访谈 = data.访谈 || {}; data.访谈[k] = v;
    return 黄游保存游戏内容(c.cat, c.name, data);
  });
};
window.黄游访谈AI = function(k) {
  var c = 黄游上下文(); var info = c.info;
  toast('⚡ 正在生成' + (k === '开发者' ? '开发者' : '声优') + '访谈 …');
  var desc = (k === '开发者')
    ? '写一篇开发者自己人之间的长篇访谈：开发者们互相聊这段游戏是怎么开发的，开发中途发生的趣事、某处设计为什么这么做、玩法的灵感来源、遇到的困难与解决等。'
    : '写一篇为角色配音的声优们的长篇访谈：声优聊聊自己如何理解与演绎角色、配音时的趣事与挑战、最喜欢的台词/场景、对角色的感想等。';
  黄游AI带上下文(desc).then(function(prompt) {
    return LLM.call({ label: k === '开发者' ? '开发者访谈' : '声优访谈', prompt: prompt, system: '你是采访撰写专家，输出长篇访谈，不要给字数限制，内容丰富生动。', temperature: 0.9 });
  }).then(function(text) {
    if (text) { var c2 = 黄游上下文(); 黄游加载游戏内容(c2.cat, c2.name).then(function(data) { data.访谈 = data.访谈 || {}; data.访谈[k] = text; return 黄游保存游戏内容(c2.cat, c2.name, data); }).then(function() { toast('✅ 已生成'); 黄游加载内容当前(); }); }
    else { toast('生成失败'); }
  }).catch(function(e) { toast('生成失败: ' + e.message); });
};

function 黄游内容参数HTML(c, data) {
  var fields = 黄游内容参数配置(c.info.type);
  var params = (data && data.__params) || {};
  var h = '<div class="yy-content-head" style="margin:12px 0"><span style="color:#c7d5e0;font-size:15px;font-weight:600">📊 游戏参数</span></div>';
  h += '<div style="padding:14px;background:rgba(23,42,56,.5);border:1px solid rgba(102,192,244,.15);border-radius:4px">';
  Object.keys(fields).forEach(function(k) {
    h += '<div style="margin-bottom:8px"><label style="color:#8f98a0;font-size:11px;display:block;margin-bottom:3px">' + escHtml(k) + '</label><input class="llm-input" value="' + escHtml(params[k] || '') + '" placeholder="' + escHtml(fields[k]) + '" oninput="黄游内容参数存(\'' + escHtml(k) + '\',this.value)"></div>';
  });
  h += '<div style="margin-top:6px;display:flex;gap:8px;align-items:center"><span class="yy-btn blue" onclick="黄游内容参数AI()">🤖 AI 生成参数</span><span style="color:#8f98a0;font-size:11px">（即时保存到 内容.json）</span></div>';
  h += '</div>';
  return h;
}

function 黄游加载内容当前() {
  var c = 黄游上下文();
  var tabsBox = document.getElementById('yyContentTabs');
  var box = document.getElementById('yyDevContent');
  if (!box) return;
  var load;
  if (c.isDLC && c.info.dlcType === '设定与访谈类') {
    // 设定与访谈类 = 镜像本体数据（登场角色/剧情路线/后日谈/回想CG/回想场景/物品/服装 用本体的；仅「访谈」用 DLC 自己的）
    load = Promise.all([黄游加载游戏内容(c.cat, c.dlcOf), 黄游加载游戏内容(c.cat, c.name)]).then(function(r) {
      var base = r[0] || {}, dlc = r[1] || {};
      var m = {};
      ['登场角色', 'route', '后日谈', '物品', '服装'].forEach(function(k) { m[k] = (dlc[k] && (dlc[k].length || dlc[k].nodes && dlc[k].nodes.length)) ? dlc[k] : base[k]; });
      m.访谈 = dlc.访谈;
      m.__params = dlc.__params || base.__params || {};
      return m;
    });
  } else {
    load = 黄游加载游戏内容(c.cat, c.name);
  }
  load.then(function(data) {
    var sections = 黄游内容板块配置(c.info.type);
    if (tabsBox) tabsBox.innerHTML = 黄游内容渲染Tab(c, sections);
    box.innerHTML = 黄游内容渲染当前(c, data, sections);
    if (['__route', '回想CG', '回想场景', '后日谈'].indexOf(黄游内容板块当前) >= 0) requestAnimationFrame(function() { 黄游路线画连线(); });
  });
}

window.黄游内容参数存 = function(k, v) {
  var c = 黄游上下文();
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    data.__params = data.__params || {};
    data.__params[k] = v;
    return 黄游保存游戏内容(c.cat, c.name, data);
  });
};

function 黄游内容营销HTML(c, data) {
  var hook = (data && data.hook) || '';
  var sells = (data && data.sells) || [];
  var h = '<div class="yy-content-head" style="margin:12px 0"><span style="color:#c7d5e0;font-size:15px;font-weight:600">📝 关于此游戏 · 营销文案</span></div>';
  h += '<div class="yy-content-item" style="padding:12px;background:rgba(23,42,56,.5);border:1px solid rgba(102,192,244,.15);border-radius:4px;margin-bottom:12px">';
  h += '<label style="color:#8f98a0;font-size:11px;display:block;margin-bottom:3px">口号 / 钩子</label>';
  h += '<input class="llm-input" id="hk_hook" value="' + escHtml(hook) + '" placeholder="一句话卖点口号，如：让圣女在堕落中彻底沉沦" oninput="黄游营销Hook(this.value)"></div>';
  if (!sells.length) h += '<div class="yy-empty">还没有卖点——点「＋ 新增」或「🤖 AI 生成卖点」。</div>';
  sells.forEach(function(s, i) {
    h += '<div class="yy-content-item" style="margin-bottom:12px;padding:12px;background:rgba(23,42,56,.5);border:1px solid rgba(102,192,244,.15);border-radius:4px">';
    h += '<input class="llm-input" id="ct_t_' + i + '" value="' + escHtml(s.title || '') + '" placeholder="卖点标题（如 60 段回想全收集）" oninput="黄游内容存(' + i + ',\'title\',this.value)">';
    h += '<textarea class="llm-input" id="ct_c_' + i + '" rows="4" style="margin-top:6px" placeholder="这段卖点的描述（讲它怎么好、内容量多少）" oninput="黄游内容存(' + i + ',\'content\',this.value)">' + escHtml(s.content || '') + '</textarea>';
    h += '<div style="margin-top:6px;display:flex;gap:6px"><span class="yy-btn blue" onclick="黄游内容AI(' + i + ')">🤖 AI 生成卖点</span><span class="yy-btn grey" onclick="黄游内容删(' + i + ')">删除</span></div></div>';
  });
  if (黄游内容开发者模式) h += '<div style="display:flex;gap:8px;margin-top:10px"><span class="yy-btn green" onclick="黄游内容新增()">＋ 新增</span><span class="yy-btn blue" onclick="黄游内容AI全部()">🤖 AI 生成全部</span></div>';
  return h;
}

window.黄游营销Hook = function(v) {
  var c = 黄游上下文();
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    data.hook = v;
    return 黄游保存游戏内容(c.cat, c.name, data);
  });
};

window.黄游内容参数AI = function() {
  var c = 黄游上下文(); var info = c.info; var fields = 黄游内容参数配置(info.type);
  toast('⚡ 正在生成「游戏参数」…');
  黄游LLM({ prompt: '为游戏《' + info.name + '》生成以下游戏参数（JSON 键，值填具体合适的内容：数字/文字/枚举）。输出 JSON 键：' + JSON.stringify(Object.keys(fields)) + '。', system: '你是黄油图鉴参数专家。', label: '游戏参数生成', temperature: 0.85 }).then(function(d) {
    if (d) {
      var c2 = 黄游上下文();
      黄游加载游戏内容(c2.cat, c2.name).then(function(data) {
        data.__params = data.__params || {};
        Object.keys(fields).forEach(function(k) { if (d[k] !== undefined && d[k] !== null) data.__params[k] = d[k]; });
        return 黄游保存游戏内容(c2.cat, c2.name, data);
      }).then(function() { toast('✅ 已生成'); 黄游加载内容当前(); });
    } else { toast('生成失败'); }
  }).catch(function(e) { toast('生成失败: ' + e.message); });
};

window.黄游内容存 = function(idx, k, v) {
  var c = 黄游上下文(); var key = 黄游内容板块当前 === '__about' ? 'sells' : 黄游内容板块当前;
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    var list = data[key] || (data[key] = []);
    if (!list[idx]) list[idx] = {};
    list[idx][k] = v;
    return 黄游保存游戏内容(c.cat, c.name, data);
  });
};

window.黄游内容删 = function(idx) {
  var c = 黄游上下文(); var key = 黄游内容板块当前 === '__about' ? 'sells' : 黄游内容板块当前;
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    var list = data[key] || (data[key] = []);
    list.splice(idx, 1);
    return 黄游保存游戏内容(c.cat, c.name, data);
  }).then(function() { 黄游加载内容当前(); });
};

window.黄游内容新增 = function() {
  var c = 黄游上下文();
  if (黄游内容板块当前 === '__about') {
    黄游加载游戏内容(c.cat, c.name).then(function(data) {
      var list = data.sells || (data.sells = []);
      list.push({ title: '卖点 ' + (list.length + 1), content: '' });
      return 黄游保存游戏内容(c.cat, c.name, data);
    }).then(function() { 黄游加载内容当前(); });
    return;
  }
  var cfg = 黄游内容取当前板块(c);
  黄游加载游戏内容(c.cat, c.name).then(function(data) {
    var list = data[cfg.key] || (data[cfg.key] = []);
    list.push({ title: '第 ' + (list.length + 1) + ' ' + (cfg.phT || '条目'), content: '' });
    return 黄游保存游戏内容(c.cat, c.name, data);
  }).then(function() { 黄游加载内容当前(); });
};

window.黄游内容AI = function(idx) {
  var c = 黄游上下文(); var isAbout = 黄游内容板块当前 === '__about';
  var cfg = isAbout ? { label: '卖点', phT: '卖点' } : 黄游内容取当前板块(c);
  var title = ((document.getElementById('ct_t_' + idx) || {}).value) || '';
  toast('⚡ 生成「' + (title || cfg.phT) + '」内容…');
  var ctx = '这是游戏《' + c.info.name + '》的「' + cfg.label + '」详情。\n条目：' + (title || cfg.phT) + '\n分类：' + (c.info.type) + '\n子类型：' + (c.info.subtype || '') + '\n简介：' + (c.info.description || '') + '\n定位：' + (c.info.focus || '');
  var prompt = isAbout
    ? '为上述游戏卖点写一段吸引人的推销描述（讲清这个亮点怎么好、内容量多少，勾人购买）。输出 JSON：{"content":"描述"}。'
    : '为上述黄油条目生成一段具体、详尽的内容描述。输出 JSON：{"content":"内容"}，聚焦该（关卡/章节/线路/卡牌/角色/H场景）的具体内容、触发条件与 H 拔点。';
  黄游LLM({ prompt: prompt, system: '你是黄油图鉴内容专家。', label: '内容条目生成', temperature: 0.85 }).then(function(d) {
    if (d && d.content) { var box = document.getElementById('ct_c_' + idx); if (box) { box.value = d.content; box.dispatchEvent(new Event('input')); } toast('✅ 已生成'); }
    else { toast('生成失败'); }
  }).catch(function(e) { toast('生成失败: ' + e.message); });
};

window.黄游内容AI全部 = function() {
  var c = 黄游上下文(); var isAbout = 黄游内容板块当前 === '__about';
  var cfg = isAbout ? { label: '卖点', key: 'sells', phT: '卖点' } : 黄游内容取当前板块(c);
  toast('⚡ 正在生成全部「' + cfg.label + '」…');
  var info = c.info;
  var prompt = isAbout
    ? '为游戏《' + info.name + '》写一段营销向「关于此游戏」的推销文案：若干 ●卖点块（加粗标题 + 吸引人的描述，讲清亮点怎么好、内容量多少）。输出 JSON：{"list":[{"title":"卖点标题（如 50+ 关卡）","content":"该卖点的推销描述"}]}\n请紧扣游戏真实内容量/特色（关卡数、女主数、H场景数、画风、系统、收集、画师CV等），并与本作题材/定位逻辑自洽（如 NTR 题材勿写入无关角色）。\n请写出若干卖点。'
    : '为游戏《' + info.name + '》生成「' + cfg.label + '」的条目列表。输出 JSON：{"list":[{"title":"' + cfg.phT + '","content":"内容"}]}\n要求：生成若干 ' + cfg.phT + '，内容具体、聚焦 H 拔点，且须与本作题材/定位逻辑自洽（如 NTR 题材的角色应紧扣婚姻关系设定）。';
  黄游LLM({ prompt: prompt, system: '你是黄油图鉴内容专家。', label: '内容列表生成', temperature: 0.85 }).then(function(d) {
    if (d && (isAbout ? (d.hook || (d.list && d.list.length)) : (d.list && d.list.length))) {
      var c2 = 黄游上下文();
      黄游加载游戏内容(c2.cat, c2.name).then(function(data) {
        if (isAbout) { if (d.hook) data.hook = d.hook; data.sells = d.list || data.sells || []; }
        else { data[cfg.key] = d.list; }
        return 黄游保存游戏内容(c2.cat, c2.name, data);
      }).then(function() { toast('✅ 已生成'); 黄游加载内容当前(); });
    } else { toast('生成失败'); }
  }).catch(function(e) { toast('生成失败: ' + e.message); });
};

// ============================================================
// 系统需求
// ============================================================
function 黄游系统需求() {
  var min = [['操作系统', 'Windows 10 (64-bit)'], ['处理器', 'Intel Core i3-8100 / AMD Ryzen 3'], ['内存', '8 GB RAM'], ['显卡', 'NVIDIA GeForce GTX 750 Ti / Radeon HD 7790'], ['DirectX 版本', '11'], ['存储空间', '需要 12 GB 可用空间']];
  var rec = [['操作系统', 'Windows 10 / 11 (64-bit)'], ['处理器', 'Intel Core i7-4770 / AMD Ryzen 5 1400'], ['内存', '16 GB RAM'], ['显卡', 'GeForce GTX 1050 Ti / Radeon R9 280'], ['DirectX 版本', '12'], ['存储空间', '需要 16 GB 可用空间']];
  function col(title, items) {
    var li = '<strong>' + title + ':</strong><br><ul class="bb_ul">';
    items.forEach(function(it) { li += '<li><strong>' + it[0] + ':</strong> ' + it[1] + '<br></li>'; });
    li += '</ul>';
    return li;
  }
  var h = '<div class="game_page_autocollapse sys_req" style="margin-top:20px"><h2 style="color:#fff;font-size:15px;margin-bottom:8px">系统需求</h2>';
  h += '<div class="sysreq_contents"><div class="game_area_sys_req sysreq_content active" data-os="win">';
  h += '<div class="game_area_sys_req_leftCol"><ul>' + col('最低配置', min) + '</ul></div>';
  h += '<div class="game_area_sys_req_rightCol"><ul>' + col('推荐配置', rec) + '</ul></div>';
  h += '<div style="clear:both"></div><div class="game_area_sys_req_note"><strong>*</strong> 2024 年 1 月 1 日（PT）起，Steam 客户端将仅支持 Windows 10 及更新版本。</div>';
  h += '</div></div></div>';
  return h;
}

// ============================================================
// 评测评分等级（Steam 中文文案）
// ============================================================
function 黄游评测等级(rate) {
  if (rate >= 0.98) return { label: '好评如潮', cls: 'positive' };
  if (rate >= 0.80) return { label: '特别好评', cls: 'positive' };
  if (rate >= 0.70) return { label: '特别好评', cls: 'positive' };
  if (rate >= 0.65) return { label: '多半好评', cls: 'mixed' };
  if (rate >= 0.40) return { label: '褒贬不一', cls: 'mixed' };
  if (rate >= 0.20) return { label: '多半差评', cls: 'negative' };
  if (rate >= 0.10) return { label: '差评', cls: 'negative' };
  return { label: '差评如潮', cls: 'negative' };
}

// ============================================================
// glance 评测汇总条
// ============================================================
function 黄游刷新Glance评测() {
  var box = document.getElementById('yySteamUserReviews');
  if (!box) return;
  黄游评价取().then(function(list) {
    var total = list.length; var 好评 = list.filter(function(r) { return r.recommended !== false; }).length;
    var rate = total ? 好评 / total : 0; var 等级 = total ? 黄游评测等级(rate) : { label: '暂无评测', cls: 'mixed' };
    var pct = total ? Math.round(rate * 100) : 0;
    var desc = total ? ('- 此游戏的 ' + total + ' 篇用户评测中有 ' + pct + '% 为好评。') : '暂无用户评测。';
    box.innerHTML = '<div class="user_reviews">' +
      '<a class="user_reviews_summary_row" onclick="return false">' +
      '<div class="subtitle column all">所有评测：</div>' +
      '<div class="summary column"><span class="game_review_summary ' + 等级.cls + '" style="font-weight:700">' + 等级.label + '</span><span class="responsive_hidden">(' + total + ')</span><div class="responsive_reviewdesc" style="color:#8f98a0">' + desc + '</div></div></a>' +
      (total ? '<div style="margin-top:8px"><div style="height:8px;border-radius:4px;background:rgba(103,193,245,.15);overflow:hidden"><div style="height:100%;width:' + pct + '%;background:linear-gradient(to right,#8ed629,#a4d007)"></div></div></div>' : '') + '</div>';
  });
}

// ============================================================
// 底部完整评测区
// ============================================================
function 黄游加载评价区() {
  var c = 黄游上下文();
  黄游评价取().then(function(list) {
    黄游详情当前评价 = list || [];
    var area = document.getElementById('yySteamReviewsSection');
    if (!area) return;
    var total = list.length; var 好评 = list.filter(function(r) { return r.recommended !== false; }).length;
    var rate = total ? 好评 / total : 0; var 等级 = total ? 黄游评测等级(rate) : { label: '暂无评测', cls: 'mixed' };
    // Steam 官方评分图标（正=蓝 #66C0F4，负=橙红 #C85E2D，与官方 user_reviews_*.png 同色）
    var 评分图标 = function(pos, size) {
      var s = size || 26;
      var c = pos ? '#66C0F4' : '#C85E2D';
      var d = 'M1 21h4V9H1v12zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z';
      return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24"><g' + (pos ? '' : ' transform="rotate(180 12 12)"') + '><path fill="' + c + '" d="' + d + '"/></g></svg>';
    };
    // 单条完整评测卡片（左列/右列共用）
    var card = function(r, idx) {
      var rec = r.recommended !== false; var a = r.author || '匿名';
      var hue = 0; for (var i = 0; i < a.length; i++) hue = (hue * 31 + a.charCodeAt(i)) & 0xffff;
      var hours = (r.hours || '').trim();
      return '<div class="review_box">' +
        '<div class="ReviewContentCtn">' +
          '<div class="review_leftcol">' +
            '<div class="avatar"><div class="yy-ava" style="background:hsl(' + (hue % 360) + ',55%,45%)">' + escHtml(a[0] || '匿') + '</div></div>' +
            '<a class="vote_header" onclick="return false">' +
              '<div class="thumb">' + 评分图标(rec) + '</div>' +
              '<div class="title">' + (rec ? '推荐' : '不推荐') + '</div>' +
              (hours ? '<div class="hours">在记录中 ' + escHtml(hours) + '</div>' : '') +
            '</a>' +
          '</div>' +
          '<div class="review_rightcol">' +
            '<div class="persona_block"><span class="persona_name">' + escHtml(a) + '</span></div>' +
            '<div class="content">' + escHtml(r.content || '') + '</div>' +
            '<div class="postedDate">发布于 Steam</div>' +
            '<div class="hr"></div>' +
            '<div class="control_block"><span class="text">这篇评测是否有价值？</span><a onclick="return false">是</a><a onclick="return false">否</a><a onclick="return false">搞笑</a><a onclick="return false">奖励</a><a onclick="黄游评测删除(' + idx + ')" style="color:#89a4b8">✕ 删除</a></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    };
    var h = '<div class="app_reviews_area">';
    // 区头（官方 .user_reviews_header 结构：标题 + 查看全部 chip，底边框 #5b7381）
    h += '<div class="user_reviews_header" style="margin-top:0;display:flex;align-items:flex-end;justify-content:space-between;padding-bottom:4px;border-bottom:1px solid #5b7381;margin-bottom:14px">';
    h += '<div class="yy-reviews-title">用户评测</div>';
    h += '<span class="user_reviews_see_all"><a onclick="return false">查看全部</a></span>';
    h += '</div>';
    // 筛选条（官方 .user_reviews_filter_bar）
    h += '<div class="user_reviews_filter_bar" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">';
    h += '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">';
    h += '<span class="user_reviews_filter_text">筛选</span>';
    h += '<span class="dselect_container"><select onchange="return false"><option>筛选排序</option><option>最有价值</option><option>最新</option><option>游玩时长最多</option><option>好评数最多</option></select></span>';
    h += '</div>';
    h += '<a class="btnv6_blue_hoverfade btn_medium" onclick="黄游生成评测()" title="按本作信息生成 10 条评测"><span>🤖 AI 生成评测</span></a>';
    h += '</div>';
    // 汇总（官方 game_review_summary / game_review_summary_count）
    h += '<div style="margin-bottom:18px"><span class="game_review_summary ' + 等级.cls + '" style="font-size:17px;font-weight:700;font-family:\'Motiva Sans\',Sans-serif">' + 等级.label + '</span> <span class="game_review_summary_count">(' + total + ')</span>' +
      (total ? '<div style="color:#8f98a0;font-size:12px;margin-top:6px">- 此游戏的 ' + total + ' 篇用户评测中有 ' + Math.round(rate * 100) + '% 为好评。</div>' : '') + '</div>';
    if (!total) {
      h += '<div class="review_box"><div class="noReviewsYetTitle">暂无评测</div><div class="noReviewsYetSub">点右上方「AI 生成评测」，为本作生成 10 条玩家评测。</div></div>';
    } else {
      // 两列对开平分（各占一半，平级）：奇偶位分开到左/右列
      var 左 = [], 右 = [];
      list.forEach(function(r, i) { (i % 2 === 0 ? 左 : 右).push(i); });
      h += '<div style="display:flex;gap:22px;align-items:flex-start">';
      h += '<div class="yy-col" style="flex:1 1 0;min-width:0"><div class="block_title" style="margin-bottom:10px">最有价值的评测</div>' + 左.map(function(i) { return card(list[i], i); }).join('') + '</div>';
      h += '<div class="yy-col" style="flex:1 1 0;min-width:0"><div class="block_title" style="margin-bottom:10px">最新的评测</div>' + 右.map(function(i) { return card(list[i], i); }).join('') + '</div>';
      h += '</div>';
    }
    h += '</div>';
    area.innerHTML = h;
  });
}

// ============================================================
// AI 生成：词条内容
// ============================================================
window.黄游生成词条 = function() {
  var cat = 黄游当前分类; var 游戏 = 黄游当前游戏;
  if (!游戏) { toast('请先选择游戏'); return; }
  var cfg = 黄游获取词条配置(游戏.info.type, 游戏.info.subtype);
  toast('⚡ 正在生成「' + 游戏.info.name + '」词条内容...');
  Promise.all([黄游加载开发者(), 黄游评价取()]).then(function(res) {
    var sources = res[0] || [];
    var ctx = '游戏分类：' + (黄游游戏分类[cat] ? 黄游游戏分类[cat].label : '') + '\n分类说明：' + (黄游游戏分类[cat] ? 黄游游戏分类[cat].desc : '') + '\n游戏名称：' + 游戏.info.name + '\n游戏类型：' + cfg.label + '\n风格说明：' + cfg.styleDesc + '\n词条版块：' + cfg.sections.join('、') + '\n';
    if (游戏.info.focus) ctx += '游戏定位：' + 游戏.info.focus + '\n';
    if (游戏.info.description) ctx += '游戏简介：' + 游戏.info.description + '\n';
    var devNames = 游戏.info.refSourceNames || [];
    if (devNames.length) { ctx += '\n【开发者】\n'; devNames.forEach(function(n) { var s = sources.find(function(x) { return x.name === n; }); ctx += (s ? JSON.stringify(s, null, 2) : n) + '\n'; }); }
    var charNames = 游戏.info.refChars || [];
    var loadRoles = charNames.length ? Promise.all(charNames.map(function(rn) { return Store.character.get(rn).then(function(d) { return { name: rn, data: d }; }); })) : Promise.resolve([]);
    return loadRoles.then(function(roles) {
      if (roles.length) { ctx += '\n【登场角色】\n'; roles.forEach(function(item) { ctx += (item.data && item.data.identity ? JSON.stringify({ identity: item.data.identity }, null, 2) : '- ' + item.name) + '\n'; }); }
      var sectionKeys = JSON.stringify(cfg.sections);
      var outputFormat = 'sections 的 key 必须与词条版块完全一致，即 ' + sectionKeys + '。\n格式：{"sections":{"版块名":[{"type":"类型","speaker":"小标题/字段","content":"内容"},...]}}';
      var sysPrompt = '你是一名黄油图鉴编纂专家。为这款游戏撰写深度详实的图鉴词条。每个版块写出该题材的具体内容（数值、机制、角色、H场景、结局等），字数要足、要够拔。';
      var req = '每个版块写出若干要点，内容具体；登场角色/单位逐个介绍；战役/调教系统写明数值维度与机制；H场景·拔点要具体；结局·收集写达成条件。';
      return LLM.callJSON({ prompt: ctx + '\n【输出格式】\n' + outputFormat + '\n要求：' + req, system: sysPrompt, label: '图鉴词条生成', temperature: 0.85 }).then(function(data) {
        if (!data || !data.sections) { toast('生成失败'); return; }
        var sectionMap = {};
        if (Array.isArray(data.sections)) { data.sections.forEach(function(s) { sectionMap[s.name] = s.segments || s.articles || s.items || []; }); }
        else { Object.keys(data.sections).forEach(function(k) { sectionMap[k] = data.sections[k]; }); }
        var saves = [];
        cfg.sections.forEach(function(section) { var items = sectionMap[section] || []; saves.push(黄游版块存(section, { section: section, segments: items })); });
        return Promise.all(saves);
      }).then(function() {
        toast('✅ 词条内容已生成');
        var el = document.getElementById('yyContentView'); if (el) 黄游渲染详情(el);
      }).catch(function(err) { toast('❌ ' + err.message); });
    });
  }).catch(function(err) { toast('❌ ' + err.message); });
};

// ============================================================
// AI 生成：评价
// ============================================================
window.黄游生成评测 = function() {
  var 游戏 = 黄游当前游戏;
  if (!游戏) { toast('请先选择游戏'); return; }
  toast('🤖 正在生成 10 条评测...');
  黄游AI开发者上下文().then(function(ctx) {
    var rendered = renderPrompt('hybz_review_gen', { text: ctx, count: 10, target: '游戏' });
    return LLM.callJSON({ prompt: rendered.user, system: rendered.system, label: '玩家评测生成', temperature: 0.9 }).then(function(data) {
      var list = (data && data.list) || [];
      if (!list.length) { toast('生成失败'); return; }
      黄游评价存(list).then(function() {
        toast('✅ 已生成 ' + list.length + ' 条评测');
        var el = document.getElementById('yyContentView'); if (el) 黄游渲染详情(el);
      });
    });
  }).catch(function(err) { toast('❌ ' + (err && err.message ? err.message : err)); });
};

// 删除某条评测（按索引）
window.黄游评测删除 = function(index) {
  var idx = parseInt(index, 10);
  if (isNaN(idx) || idx < 0) { toast('无效索引'); return; }
  if (typeof confirmDialog === 'function') confirmDialog('确定删除这条评测？', doDel); else doDel();
  function doDel() {
    黄游评价取().then(function(list) {
      list = list || [];
      if (idx >= list.length) { toast('评测不存在'); return; }
      list.splice(idx, 1);
      return 黄游评价存(list);
    }).then(function() {
      toast('✅ 已删除评测');
      var el = document.getElementById('yyContentView'); if (el) 黄游渲染详情(el);
    }).catch(function(err) { toast('❌ ' + (err && err.message ? err.message : err)); });
  }
};

// ============================================================
// 社区区：讨论区 / 指南 / 创意工坊（每个游戏各有一套，存 讨论.json/指南.json/创意工坊.json）
// 数据：讨论 thread{id,title,author,time,content,replies[]}；指南 guide{id,title,author,time,type,content}；工坊 item{id,name,author,time,desc,subs}
// ============================================================
var 黄游当前区 = '';   // '' | '讨论' | '指南' | '创意工坊'

function 黄游社区样式() {
  return '<style>' +
    '.steam-root{font-family:"Motiva Sans","Microsoft YaHei","Segoe UI",Arial,sans-serif;color:#c7d5e0;background:linear-gradient(180deg,#2a475e 0%,#1b2838 80%,#171a21 100%);min-height:100vh;font-size:13px}' +
    '.steam-root a{color:#c7d5e0;text-decoration:none}' +
    '.steam-root .page_content{max-width:1150px;margin:0 auto;padding:0 12px}' +
    '.steam-root .yy-dev-page{max-width:none;width:100%}' +
    '.steam-root .yy-apphub{padding:14px 0 0}' +
    '.steam-root .yy-apphub-name{color:#fff;font-size:26px;font-weight:300;letter-spacing:.5px;line-height:1.2}' +
    '.steam-root #global_header{background:#171d25;border-bottom:1px solid #2a3f53}' +
    '.steam-root #global_header .content{max-width:1150px;margin:0 auto;padding:8px 16px;display:flex;align-items:center;gap:18px}' +
    '.steam-root #global_header .logo{flex:0 0 auto}' +
    '.steam-root #global_header .supernav_container{display:flex;gap:16px;align-items:center}' +
    '.steam-root #global_header .menuitem{color:#c7d5e0;font-size:12px;cursor:pointer;background:transparent}' +
    '.steam-root #global_header .menuitem:hover,.steam-root #global_header .menuitem.supernav_active{color:#66c0f4}' +
    '.steam-root #global_header #global_actions{margin-left:auto;color:#c7d5e0;font-size:12px}' +
    '.steam-root #global_header #global_actions .pulldown,.steam-root #global_header #global_actions .global_action_link{color:#c7d5e0;font-size:12px;cursor:pointer;background:transparent}' +
    '.steam-root .yy-comm-nav{display:flex;gap:8px;align-items:center;margin:10px 0 14px;flex-wrap:wrap}' +
    '.steam-root .yy-comm-tab{padding:6px 16px;border:1px solid rgba(102,192,244,.25);border-radius:3px;color:#66c0f4;cursor:pointer;font-size:13px;background:transparent}' +
    '.steam-root .yy-comm-tab.act{background:#66c0f4;color:#171a21}' +
    '.steam-root .yy-comm-tab:hover{background:rgba(102,192,244,.3)}' +
    '.steam-root .yy-comm-title{color:#fff;font-size:18px;font-weight:700;margin:4px 0}' +
    '.steam-root .yy-thread{background:rgba(23,42,56,.45);border:1px solid rgba(102,192,244,.12);border-radius:3px;padding:12px 14px;margin-bottom:10px;cursor:pointer}' +
    '.steam-root .yy-thread:hover{border-color:rgba(102,192,244,.4)}' +
    '.steam-root .yy-thread-title{color:#c7d5e0;font-size:14px;font-weight:600}' +
    '.steam-root .yy-thread-meta{color:#8f98a0;font-size:11px;margin:4px 0}' +
    '.steam-root .yy-thread-sum{color:#8f98a0;font-size:12px;line-height:1.5}' +
    '.steam-root .yy-post{background:rgba(23,42,56,.45);border:1px solid rgba(102,192,244,.12);border-radius:3px;padding:14px;margin-bottom:14px}' +
    '.steam-root .yy-post-title{color:#fff;font-size:16px;font-weight:700}' +
    '.steam-root .yy-post-meta{color:#8f98a0;font-size:11px;margin:4px 0 8px}' +
    '.steam-root .yy-post-body{color:#c7d5e0;font-size:13px;line-height:1.7;white-space:pre-wrap}' +
    '.steam-root .yy-reply{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid rgba(102,192,244,.08);position:relative}' +
    '.steam-root .yy-reply-author{flex:0 0 90px;color:#66c0f4;font-size:12px}' +
    '.steam-root .yy-reply-body{flex:1;color:#c7d5e0;font-size:13px;line-height:1.6;white-space:pre-wrap}' +
    '.steam-root .yy-reply-del{position:absolute;right:0;top:8px;color:#8f98a0;font-size:12px;cursor:pointer;padding:2px 6px;border-radius:4px;opacity:.35}' +
    '.steam-root .yy-reply-del:hover{color:#e06565;opacity:1;background:rgba(224,101,101,.14)}' +
    '.steam-root .forum_topic_del{position:absolute;right:4px;top:50%;transform:translateY(-50%);color:#8f98a0;font-size:13px;cursor:pointer;padding:4px 8px;border-radius:4px;z-index:3;opacity:.6}' +
    '.steam-root .forum_topic_del:hover{color:#e06565;opacity:1;background:rgba(224,101,101,.14)}' +
    '.steam-root .yy-gd-del{color:#8f98a0;font-size:12px;cursor:pointer;padding:2px 7px;border-radius:4px;margin-left:auto}' +
    '.steam-root .yy-gd-del:hover{color:#e06565;background:rgba(224,101,101,.14)}' +
    '.steam-root .yy-ws-del{color:#8f98a0;font-size:12px;cursor:pointer;padding:2px 8px;border-radius:4px;opacity:.6}' +
    '.steam-root .yy-ws-del:hover{color:#e06565;opacity:1;background:rgba(224,101,101,.14)}' +
    '.steam-root .yy-input{width:100%;background:rgba(0,0,0,.2);border:1px solid rgba(102,192,244,.25);border-radius:3px;color:#c7d5e0;padding:8px 10px;font-size:13px;resize:vertical;font-family:inherit;box-sizing:border-box}' +
    '.steam-root .yy-ws-lay{display:flex;gap:20px;align-items:flex-start}' +
    '.steam-root .yy-ws-main{flex:1;min-width:0}' +
    '.steam-root .yy-ws-side{flex:0 0 240px}' +
    '.steam-root .yy-ws-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}' +
    '.steam-root .yy-ws-item{position:relative;background:#0e1a22;cursor:pointer;border-radius:2px;overflow:hidden;min-height:220px;display:flex;flex-direction:column;justify-content:flex-end}' +
    '.steam-root .yy-ws-item:hover{outline:1px solid rgba(102,192,244,.4)}' +
    '.steam-root .yy-ws-img{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#7c8ea3;font-size:13px;text-align:center;padding:14px;box-sizing:border-box;overflow:hidden;z-index:0}' +
    '.steam-root .yy-ws-stars{color:#ffca28;font-size:14px;letter-spacing:2px;position:absolute;top:10px;right:12px;z-index:2}' +
    '.steam-root .yy-ws-info{position:relative;z-index:1;padding:10px 12px;background:rgba(14,26,34,.6)}' +
    '.steam-root .yy-ws-name{color:#fff;font-size:14px;font-weight:700}' +
    '.steam-root .yy-ws-author{color:#c7d5e0;font-size:11px;margin:2px 0}' +
    '.steam-root .yy-ws-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}' +
    '.steam-root .yy-ws-tag{background:rgba(53,74,95,.9);color:#fff;font-size:10px;padding:2px 6px;border-radius:2px}' +
    '.steam-root .yy-ws-review{color:#8f98a0;font-size:11px;margin-top:6px}' +
    '.steam-root .yy-ws-sort{display:flex;gap:16px;margin-bottom:12px;flex-wrap:wrap}' +
    '.steam-root .yy-ws-sort-tab{color:#8f98a0;font-size:13px;cursor:pointer;padding-bottom:3px;border-bottom:2px solid transparent}' +
    '.steam-root .yy-ws-sort-tab.act{color:#66c0f4;border-bottom-color:#66c0f4}' +
    '.steam-root .yy-ws-sort-tab:hover{color:#66c0f4}' +
    '.steam-root .yy-ws-toolbar{display:flex;gap:10px;align-items:center;margin-bottom:14px;flex-wrap:wrap}' +
    '.steam-root .yy-ws-tab{padding:5px 14px;border:1px solid rgba(102,192,244,.25);border-radius:3px;color:#66c0f4;font-size:13px;cursor:pointer;background:transparent}' +
    '.steam-root .yy-ws-tab.act{background:#66c0f4;color:#171a21}' +
    '.steam-root .yy-ws-tab:hover{background:rgba(102,192,244,.3)}' +
    '.steam-root .yy-detail{display:flex;gap:20px;align-items:flex-start}' +
    '.steam-root .yy-detail-img{flex:0 0 320px;width:320px;aspect-ratio:1/1;background:#0e1a22;display:flex;align-items:center;justify-content:center;color:#7c8ea3;font-size:13px;text-align:center;padding:10px;box-sizing:border-box;border-radius:3px;overflow:hidden}' +
    '.steam-root .yy-detail-body{flex:1;min-width:0}' +
    '.steam-root .yy-detail-title{color:#fff;font-size:18px;font-weight:700}' +
    '.steam-root .yy-detail-meta{color:#8f98a0;font-size:12px;margin:4px 0 10px}' +
    '.steam-root .yy-detail-desc{color:#c7d5e0;font-size:13px;line-height:1.7;white-space:pre-wrap}' +
    '.steam-root .yy-detail-actions{display:flex;gap:10px;margin-top:14px}' +
    '.steam-root .yy-gd-item{display:flex;gap:14px;padding:12px;background:rgba(23,42,56,.4);margin-bottom:2px;cursor:pointer;align-items:flex-start;border-radius:2px}' +
    '.steam-root .yy-gd-item:hover{background:rgba(103,193,245,.12)}' +
    '.steam-root .yy-gd-thumb{flex:0 0 64px;width:64px;height:64px;background:#0e1a22;display:flex;align-items:center;justify-content:center;color:#7c8ea3;font-size:10px;text-align:center;padding:4px;box-sizing:border-box;overflow:hidden}' +
    '.steam-root .yy-gd-body{flex:1;min-width:0}' +
    '.steam-root .yy-gd-title{color:#fff;font-size:14px;font-weight:600}' +
    '.steam-root .yy-gd-author{color:#8f98a0;font-size:11px;margin:2px 0}' +
    '.steam-root .yy-gd-desc{color:#8f98a0;font-size:12px;line-height:1.6;margin:4px 0}' +
    '.steam-root .yy-gd-foot{display:flex;align-items:center;gap:12px;color:#8f98a0;font-size:12px}' +
    '.steam-root .yy-stars{color:#ffca28;font-size:14px;letter-spacing:2px}' +
    '.steam-root .yy-gd-pop{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;margin:10px 0 14px}' +
    '.steam-root .yy-gd-pop-card{background:rgba(23,42,56,.5);padding:8px;cursor:pointer;border-radius:2px}' +
    '.steam-root .yy-gd-pop-card:hover{background:rgba(103,193,245,.1)}' +
    '.steam-root .yy-gd-pop-img{width:100%;aspect-ratio:2/1;background:#0e1a22;display:flex;align-items:center;justify-content:center;color:#7c8ea3;font-size:11px;margin-bottom:6px}' +
    '.steam-root .yy-gd-pop-name{color:#c7d5e0;font-size:12px}' +
    '.steam-root .yy-gd-lay{display:flex;gap:20px;align-items:flex-start}' +
    '.steam-root .yy-gd-main{flex:1;min-width:0}' +
    '.steam-root .yy-gd-side{flex:0 0 280px}' +
    '.steam-root .yy-gd-sub{color:#8f98a0;font-size:12px;margin:4px 0 10px}' +
    '.steam-root .yy-gd-h{color:#fff;font-size:15px;font-weight:600;margin:4px 0 8px}' +
    '.steam-root .yy-btn{display:inline-block;color:#fff;padding:6px 16px;font-size:12px;border-radius:2px;cursor:pointer;border:0;white-space:nowrap}' +
    '.steam-root .yy-btn.blue{background:linear-gradient(to right,#47bfff 5%,#1a44c2 95%)}' +
    '.steam-root .yy-btn.green{background:linear-gradient(to right,#8ed629 5%,#6aa621 95%)}' +
    '.steam-root .yy-btn.grey{background:#354a5f;color:#c7d5e0}' +
    '.steam-root .yy-btn:hover{filter:brightness(1.1)}' +
    '.steam-root .yy-empty{color:#8f98a0;font-size:12px;padding:20px 0}' +
    '.steam-root .yy-route{display:flex;flex-direction:column;align-items:center;gap:0;padding:6px 0 6px}' +
    '.steam-root .yy-route-tree{overflow-x:auto;padding:8px 0 4px;text-align:center}' +
    '.steam-root .yy-route-head{display:flex;justify-content:space-between;align-items:center;gap:14px;margin:12px 0;flex-wrap:wrap}' +
    '.steam-root .yy-route-actions{display:flex;gap:8px;align-items:center}' +
    '.steam-root .yy-rt-row{display:flex;justify-content:center;align-items:flex-start;gap:34px}' +
    '.steam-root .yy-rt-card{width:260px;background:#16222e;border-radius:12px;position:relative;z-index:1}' +
    '.steam-root .yy-rt-node{background:#1b2a38;border:1px solid #2b4a63;border-top:4px solid;border-radius:10px;padding:10px 13px;box-shadow:0 3px 10px rgba(0,0,0,.25);text-align:left}' +
    '.steam-root .yy-rt-badge{margin-bottom:6px}' +
    '.steam-root .yy-rt-type{font-size:10px;padding:2px 9px;border-radius:12px;color:#fff;font-weight:600;letter-spacing:.3px}' +
    '.steam-root .yy-rt-type.start{background:linear-gradient(135deg,#2a6db0,#1c4a78)}' +
    '.steam-root .yy-rt-type.plot{background:linear-gradient(135deg,#2a7ac2,#1c5a8f)}' +
    '.steam-root .yy-rt-type.daily{background:linear-gradient(135deg,#2f9e8f,#22705f)}' +
    '.steam-root .yy-rt-type.hscene{background:linear-gradient(135deg,#e04a5a,#a8323f)}' +
    '.steam-root .yy-rt-type.branch{background:linear-gradient(135deg,#c07a1f,#8f5a16)}' +
    '.steam-root .yy-rt-type.merge{background:linear-gradient(135deg,#7a4fbf,#5b3a8f)}' +
    '.steam-root .yy-rt-type.end{background:linear-gradient(135deg,#3a8f4f,#2a6b39)}' +
    '.steam-root .yy-rt-title{font-size:14px;font-weight:700;color:#fff;margin:6px 0 3px;display:flex;flex-wrap:wrap;gap:4px;align-items:baseline;line-height:1.3}' +
    '.steam-root .yy-rt-line{color:#66c0f4}' +
    '.steam-root .yy-rt-dash{color:#8f98a0}' +
    '.steam-root .yy-rt-name{color:#fff}' +
    '.steam-root .yy-rt-content{font-size:11px;color:#c7d5e0;line-height:1.6}' +
    '.steam-root .yy-rt-tabs{display:flex;gap:6px;margin:4px 0 12px;border-bottom:1px solid rgba(102,192,244,.15);padding-bottom:7px}' +
    '.steam-root .yy-rt-tab{font-size:13px;color:#8f98a0;cursor:pointer;padding:4px 13px;border-radius:7px;user-select:none}' +
    '.steam-root .yy-rt-tab.on{color:#66c0f4;background:rgba(102,192,244,.14)}' +
    '.steam-root .yy-rt-tab:hover{color:#c7d5e0}' +
    '.steam-root .yy-rt-del{position:absolute;top:7px;right:9px;color:#8f98a0;font-size:13px;cursor:pointer;padding:2px 6px;border-radius:6px;z-index:5;user-select:none}' +
    '.steam-root .yy-rt-del:hover{color:#e06565;background:rgba(224,101,101,.14)}' +
    '.steam-root .yy-rt-add{position:absolute;top:7px;right:32px;color:#66c0f4;font-size:13px;cursor:pointer;padding:2px 6px;border-radius:6px;z-index:5;user-select:none}' +
    '.steam-root .yy-rt-add:hover{color:#fff;background:rgba(102,192,244,.18)}' +
    '.steam-root .yy-rt-stats{display:flex;gap:8px;margin-top:9px;padding-top:8px;border-top:1px dashed rgba(102,192,244,.16)}' +
    '.steam-root .yy-stat{display:flex;align-items:center;gap:4px;flex:1 1 0;min-width:0}' +
    '.steam-root .yy-stat-lb{font-size:10px;color:#8f98a0;white-space:nowrap;flex-shrink:0;min-width:24px}' +
    '.steam-root .yy-stat-bar{flex:1 1 auto;min-width:20px;height:6px;background:rgba(23,42,56,.8);border-radius:4px;overflow:hidden}' +
    '.steam-root .yy-stat-fill{height:100%;border-radius:4px;transition:width .3s}' +
    '.steam-root .yy-stat-num{display:flex;flex-direction:column;align-items:flex-end;justify-content:center;gap:1px;font-size:10px;color:#fff;font-weight:600;min-width:20px;text-align:right;flex-shrink:0;line-height:1.1}' +
    '.steam-root .yy-stat-num b{font-size:12px;font-weight:700}' +
    '.steam-root .yy-delta{font-size:9px;font-weight:700;margin-left:3px;padding:0 3px;border-radius:4px}' +
    '.steam-root .yy-delta.up{color:#4ecca3;background:rgba(78,204,163,.16)}' +
    '.steam-root .yy-delta.down{color:#ff6b6b;background:rgba(255,107,107,.16)}' +
    '.steam-root .yy-delta.zero{color:#8f98a0;background:rgba(143,152,160,.16)}' +
    '.steam-root .yy-rt-node.milestone{box-shadow:0 0 0 1px rgba(240,185,82,.5),0 6px 20px rgba(240,185,82,.22);border-color:rgba(240,185,82,.4)}' +
    '.steam-root .yy-rt-mile{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}' +
    '.steam-root .yy-mile{font-size:10px;padding:2px 8px;border-radius:11px;background:rgba(240,185,82,.14);color:#e0b952;font-weight:600;border:1px solid rgba(240,185,82,.3)}' +
    '.steam-root .yy-mile.end{background:rgba(58,143,79,.18);color:#7ee08a;border-color:rgba(58,143,79,.4)}' +
    '.steam-root .yy-route-node{width:100%;max-width:640px;background:rgba(23,42,56,.55);border:1px solid rgba(102,192,244,.16);border-radius:10px;padding:12px 14px;position:relative;box-shadow:0 2px 8px rgba(0,0,0,.25)}' +
    '.steam-root .yy-route-node+.yy-route-node{margin-top:16px}' +
    '.steam-root .yy-route-gap{height:18px;width:2px;background:rgba(102,192,244,.3);position:relative}' +
    '.steam-root .yy-route-gap::after{content:"";position:absolute;left:-4px;bottom:0;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:6px solid rgba(102,192,244,.5)}' +
    '.steam-root .yy-route-node-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}' +
    '.steam-root .yy-route-type{font-size:10px;padding:2px 9px;border-radius:12px;color:#fff;font-weight:600;white-space:nowrap;letter-spacing:.3px}' +
    '.steam-root .yy-route-type.common{background:linear-gradient(135deg,#2a6db0,#1c4a78)}' +
    '.steam-root .yy-route-type.branch{background:linear-gradient(135deg,#c07a1f,#8f5a16)}' +
    '.steam-root .yy-route-type.alone{background:linear-gradient(135deg,#3a8f4f,#2a6b39)}' +
    '.steam-root .yy-route-type.end{background:linear-gradient(135deg,#7a4fbf,#5b3a8f)}' +
    '.steam-root .yy-route-type-pick{display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap}' +
    '.steam-root .yy-route-type-pick .yy-route-type{cursor:pointer;border:1px solid transparent}' +
    '.steam-root .yy-route-type-pick .yy-route-type.off{opacity:.4}' +
    '.steam-root .yy-route-branches{display:flex;flex-direction:column;gap:6px;margin-top:10px;padding:8px 0 0 14px;border-top:1px dashed rgba(102,192,244,.2)}' +
    '.steam-root .yy-route-branch{display:flex;gap:8px;align-items:center;font-size:12px;color:#c7d5e0}' +
    '.steam-root .yy-route-branch .opt{color:#e0b952;font-size:11px;background:rgba(224,185,82,.12);padding:1px 6px;border-radius:3px}' +
    '.steam-root .yy-route-lbl{font-size:11px;color:#8f98a0;margin:10px 0 6px;font-weight:600;letter-spacing:.3px}' +
    '.steam-root .yy-route-name{flex:1;font-size:14px;font-weight:700;color:#fff;line-height:1.3}' +
    '.steam-root .yy-route-content{color:#c7d5e0;font-size:12px;line-height:1.7;margin:4px 0 2px}' +
    '.steam-root .yy-route-branch .to{color:#66c0f4;font-weight:600}' +
    '.steam-root .yy-route-branch .arrow{color:#8f98a0}' +
    '.steam-root .yy-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}' +
    '.steam-root .yy-card{background:rgba(23,42,56,.55);border:1px solid rgba(102,192,244,.14);border-radius:10px;padding:12px 14px;box-shadow:0 2px 8px rgba(0,0,0,.22);position:relative}' +
    '.steam-root .yy-card-del{position:absolute;top:7px;right:9px;color:#8f98a0;font-size:13px;cursor:pointer;padding:2px 6px;border-radius:6px;z-index:5;user-select:none}' +
    '.steam-root .yy-card-del:hover{color:#e06565;background:rgba(224,101,101,.14)}' +
    '.steam-root .yy-card-head{display:flex;align-items:center;gap:8px;margin-bottom:6px}' +
    '.steam-root .yy-card-dot{width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#66c0f4,#2a7ac2);flex:0 0 auto}' +
    '.steam-root .yy-card-title{color:#fff;font-size:14px;font-weight:700;line-height:1.4}' +
    '.steam-root .yy-card-body{color:#c7d5e0;font-size:12px;line-height:1.7;margin-top:2px}' +
    '.steam-root .yy-epi-end{display:inline-block;margin:6px 0 2px;font-size:11px;color:#fff;padding:3px 10px;border-radius:12px;text-shadow:0 1px 2px rgba(0,0,0,.4);font-weight:600}' +
    '.steam-root .yy-dlc-banner{background:linear-gradient(90deg,rgba(122,79,191,.22),rgba(122,79,191,.08));border:1px solid rgba(122,79,191,.35);color:#c9a9ff;font-size:12px;line-height:1.7;padding:10px 14px;border-radius:10px;margin:2px 0 12px}' +
    '.steam-root .yy-charcard{background:rgba(23,42,56,.55);border:1px solid rgba(102,192,244,.14);border-radius:12px;padding:14px;box-shadow:0 3px 12px rgba(0,0,0,.25)}' +
    '.steam-root .yy-char-top{display:flex;align-items:center;gap:12px;margin-bottom:10px}' +
    '.steam-root .yy-char-ava{width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:700;box-shadow:inset 0 0 0 1px rgba(255,255,255,.15);flex:0 0 auto}' +
    '.steam-root .yy-char-name{font-size:16px;font-weight:700;color:#fff;line-height:1.3}' +
    '.steam-root .yy-char-tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}' +
    '.steam-root .yy-char-tag{font-size:11px;padding:2px 9px;border-radius:11px;background:rgba(102,192,244,.14);color:#9fd0f0;border:1px solid rgba(102,192,244,.25)}' +
    '.steam-root .yy-char-tag.cv{background:rgba(240,185,82,.14);color:#e0b952;border-color:rgba(240,185,82,.3)}' +
    '.steam-root .yy-char-tag.line{background:rgba(122,79,191,.16);color:#c9a9ff;border-color:rgba(122,79,191,.35)}' +
    '.steam-root .yy-char-tag.sex{background:rgba(78,204,163,.14);color:#7ee08a;border-color:rgba(78,204,163,.3)}' +
    '.steam-root .yy-char-brief{font-size:12px;line-height:1.7;color:#c7d5e0}' +
    '.steam-root .yy-char-actions{display:flex;gap:6px;margin-top:10px}' +
    '.steam-root .yy-btn-sm{padding:3px 10px;font-size:11px}' +
    '.steam-root .yy-content-item{background:linear-gradient(180deg,rgba(23,42,56,.74),rgba(23,42,56,.5));border:1px solid rgba(102,192,244,.16);border-radius:12px;padding:13px 14px;box-shadow:0 3px 12px rgba(0,0,0,.28);margin-bottom:12px}' +
    '.steam-root .yy-content-item.ro{border-left:3px solid rgba(102,192,244,.5)}' +
    '.steam-root .yy-ci-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}' +
    '.steam-root .yy-ci-dot{width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#66c0f4,#2a7ac2);flex:0 0 auto}' +
    '.steam-root .yy-ci-title{color:#fff;font-size:14px;font-weight:700}' +
    '.steam-root .yy-ci-body{color:#c7d5e0;font-size:12px;line-height:1.8;margin-top:5px}' +
    '.steam-root .yy-ci-actions{display:flex;gap:6px;margin-top:9px}' +
    '.steam-root .yy-itv-card{background:linear-gradient(180deg,rgba(23,42,56,.74),rgba(23,42,56,.5));border:1px solid rgba(102,192,244,.16);border-radius:14px;padding:16px;box-shadow:0 4px 16px rgba(0,0,0,.3)}' +
    '.steam-root .yy-itv-head{display:flex;align-items:center;gap:12px;margin-bottom:12px}' +
    '.steam-root .yy-itv-ico{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;background:linear-gradient(135deg,#66c0f4,#2a7ac2);flex:0 0 auto;color:#0e141b}' +
    '.steam-root .yy-itv-ico.va{background:linear-gradient(135deg,#c084fc,#7a5cff);color:#fff}' +
    '.steam-root .yy-itv-title{color:#fff;font-size:15px;font-weight:700}' +
    '.steam-root .yy-itv-sub{color:#8f98a0;font-size:11px;margin-top:2px}' +
    '.steam-root .yy-itv-ta{width:100%;background:rgba(14,20,27,.4);border:1px solid rgba(102,192,244,.18);border-radius:10px;color:#c7d5e0;font-size:13px;line-height:1.9;padding:12px 14px;font-family:inherit;box-sizing:border-box}' +
    '.steam-root .yy-itv-ta:focus{outline:none;border-color:rgba(102,192,244,.5)}' +
    '.steam-root .yy-itv-foot{display:flex;justify-content:flex-end;margin-top:10px}' +
    '.steam-root .yy-item-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}' +
    '.steam-root .yy-item-card{background:linear-gradient(180deg,rgba(23,42,56,.74),rgba(23,42,56,.5));border:1px solid rgba(102,192,244,.16);border-radius:12px;padding:13px 14px;box-shadow:0 3px 12px rgba(0,0,0,.28)}' +
    '.steam-root .yy-item-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}' +
    '.steam-root .yy-item-dot{width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#66c0f4,#2a7ac2);flex:0 0 auto}' +
    '.steam-root .yy-item-title{color:#fff;font-size:14px;font-weight:700}' +
    '.steam-root .yy-item-cat{font-size:10px;padding:1px 8px;border-radius:9px;background:rgba(240,185,82,.18);color:#e0b952;margin-left:auto}' +
    '.steam-root .yy-item-setrow{margin:4px 0 2px}' +
    '.steam-root .yy-item-set{font-size:10px;padding:2px 8px;border-radius:9px;background:rgba(122,79,191,.2);color:#c9a9ff}' +
    '.steam-root .yy-item-row{display:flex;gap:8px;margin-top:6px;font-size:12px;line-height:1.6}' +
    '.steam-root .yy-item-k{color:#8f98a0;flex:0 0 46px;font-size:11px}' +
    '.steam-root .yy-item-v{color:#c7d5e0;flex:1}' +
    '.steam-root .yy-item-row.plot{margin-top:8px;padding-top:8px;border-top:1px dashed rgba(102,192,244,.2)}' +
    '.steam-root .yy-item-row.plot .yy-item-k{color:#9fd0f0}' +
    '.steam-root .yy-item-plot-badge{font-size:10px;padding:1px 8px;border-radius:9px;background:rgba(255,176,46,.2);color:#ffcf6e;font-weight:600}' +
    '.steam-root .yy-set-block{background:linear-gradient(180deg,rgba(122,79,191,.14),rgba(122,79,191,.05));border:1px solid rgba(122,79,191,.28);border-radius:14px;padding:14px;margin-bottom:14px}' +
    '.steam-root .yy-set-head{display:flex;align-items:center;gap:8px;margin-bottom:12px}' +
    '.steam-root .yy-set-ico{font-size:16px}' +
    '.steam-root .yy-set-title{color:#c9a9ff;font-size:14px;font-weight:700}' +
    '.steam-root .yy-set-count{color:#8f98a0;font-size:11px}' +
    '.steam-root .yy-set-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}' +
    '.steam-root .yy-set-block .yy-item-card{border-left:3px solid rgba(122,79,191,.55)}' +
    '.steam-root .yy-cg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}' +
    '.steam-root .yy-cgcard{background:rgba(23,42,56,.55);border:1px solid rgba(102,192,244,.14);border-radius:12px;overflow:hidden;box-shadow:0 3px 12px rgba(0,0,0,.25)}' +
    '.steam-root .yy-cg-img{position:relative;aspect-ratio:16/10;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#fff}' +
    '.steam-root .yy-cg-lbl{position:absolute;top:8px;left:8px;font-size:9px;padding:2px 7px;border-radius:9px;background:rgba(0,0,0,.35);color:#fff;letter-spacing:1px}' +
    '.steam-root .yy-cg-title{font-size:15px;font-weight:800;text-shadow:0 2px 8px rgba(0,0,0,.5);text-align:center;padding:0 10px}' +
    '.steam-root .yy-cg-cap{font-size:11px;line-height:1.7;color:#c7d5e0;padding:10px 13px}' +
    '.steam-root .yy-sc-head{display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap}' +
    '.steam-root .yy-sc-node{font-size:10px;color:#e0b952;background:rgba(240,185,82,.14);padding:2px 8px;border-radius:10px;border:1px solid rgba(240,185,82,.3)}' +
    '.steam-root .yy-sc-title{font-size:14px;font-weight:700;color:#fff}' +
    '.steam-root .yy-sc-dlg{font-size:12px;line-height:1.9;color:#c7d5e0;white-space:pre-line;background:rgba(23,42,56,.4);border-radius:8px;padding:8px 10px;border-left:3px solid rgba(102,192,244,.35)}' +
    '.steam-root .yy-ttc-img{position:relative;aspect-ratio:16/10;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#fff;border-radius:8px;margin-bottom:6px}' +
    '.steam-root .yy-ttc-lbl{position:absolute;top:6px;left:6px;font-size:9px;padding:2px 7px;border-radius:9px;background:rgba(0,0,0,.35);color:#fff;letter-spacing:1px}' +
    '.steam-root .yy-ttc-title{font-size:14px;font-weight:800;text-shadow:0 2px 8px rgba(0,0,0,.5);text-align:center;padding:0 10px}' +
    '.steam-root .yy-dlc-addlist{margin:6px 0 0;padding-left:18px;color:#c7d5e0;font-size:12px;line-height:1.9}' +
    '.steam-root .yy-dlc-addlist li{list-style:disc;margin-bottom:2px}' +
    '.steam-root .yy-dlc-imgrow{display:flex;gap:10px;flex-wrap:wrap}' +
    '.steam-root .yy-imgrow{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px;margin-top:8px}' +
    '.steam-root .yy-imgcard{background:linear-gradient(180deg,rgba(23,42,56,.74),rgba(23,42,56,.5));border:1px solid rgba(102,192,244,.16);border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.3)}' +
    '.steam-root .yy-img-head{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid rgba(102,192,244,.12)}' +
    '.steam-root .yy-img-ico{font-size:14px}' +
    '.steam-root .yy-img-title{color:#fff;font-size:14px;font-weight:700}' +
    '.steam-root .yy-img-cover{height:132px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:800;text-shadow:0 3px 10px rgba(0,0,0,.5);letter-spacing:1px}' +
    '.steam-root .yy-img-body{padding:14px 16px}' +
    '.steam-root .yy-img-p1{color:#c7d5e0;font-size:13px;line-height:1.9;margin:0 0 10px}' +
    '.steam-root .yy-img-p2{color:#9fd0f0;font-size:13px;line-height:1.9;margin:0;padding-top:9px;border-top:1px dashed rgba(102,192,244,.2)}' +
    '.steam-root .yy-dlc-img{width:150px;aspect-ratio:16/10;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;text-shadow:0 2px 8px rgba(0,0,0,.5);text-align:center;padding:0 8px}' +
    '.steam-root .yy-media{border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.3);background:rgba(14,20,27,.35)}' +
    '.steam-root .yy-media-big{position:relative;width:100%;overflow:hidden;border-radius:12px;box-shadow:0 6px 20px rgba(0,0,0,.42);background:#0e141b}' +
    '.steam-root .yy-media-stage{position:relative;width:100%;aspect-ratio:16/9;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px}' +
    '.steam-root .yy-media-stage-ic{font-size:50px;opacity:.92;filter:drop-shadow(0 4px 14px rgba(0,0,0,.45))}' +
    '.steam-root .yy-media-stage-title{font-size:20px;font-weight:800;letter-spacing:1px;padding:0 44px;text-align:center;text-shadow:0 3px 12px rgba(0,0,0,.5)}' +
    '.steam-root .yy-media-oncap{position:absolute;left:0;right:0;bottom:0;padding:32px 18px 14px;background:linear-gradient(0deg,rgba(0,0,0,.82),rgba(0,0,0,.34) 60%,transparent);color:#fff;z-index:1}' +
    '.steam-root .yy-media-cap-t{font-size:13px;font-weight:700;color:#fff;text-shadow:0 1px 3px #000}' +
    '.steam-root .yy-media-cap-d{font-size:12px;line-height:1.7;color:#d6e3ee;margin-top:3px;max-height:51px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;text-shadow:0 1px 2px #000;opacity:.95}' +
    '.steam-root .yy-media-nav{position:absolute;top:38%;transform:translateY(-50%);width:38px;height:38px;border-radius:50%;background:rgba(14,20,27,.62);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;user-select:none;transition:background .12s,transform .12s;z-index:2}' +
    '.steam-root .yy-media-nav:hover{background:rgba(102,192,244,.75);color:#0e141b;transform:translateY(-50%) scale(1.08)}' +
    '.steam-root .yy-media-count{position:absolute;top:10px;right:10px;padding:3px 11px;border-radius:12px;background:rgba(0,0,0,.55);color:#fff;font-size:11px;z-index:2;letter-spacing:.5px}' +
    '.steam-root .yy-media-thumb{flex:0 0 116px;cursor:pointer;border-radius:8px;overflow:hidden;border:2px solid transparent;opacity:.72;transition:border-color .12s,opacity .12s}' +
    '.steam-root .yy-media-thumb.on{border-color:#66c0f4;opacity:1}' +
    '.steam-root .yy-dlc-del{position:absolute;top:8px;right:8px;color:#8f98a0;font-size:15px;cursor:pointer;padding:2px 6px;border-radius:6px;z-index:3;user-select:none}' +
    '.steam-root .yy-dlc-del:hover{color:#e06565;background:rgba(224,101,101,.16)}' +
    '.steam-root .yy-cat-tabs{display:flex;gap:16px;margin:6px 0 14px;flex-wrap:wrap;border-bottom:1px solid rgba(102,192,244,.12);padding-bottom:10px}' +
    '.steam-root .yy-cat-tab{color:#8f98a0;font-size:13px;cursor:pointer;padding:4px 2px;border-bottom:2px solid transparent}' +
    '.steam-root .yy-cat-tab.act{color:#66c0f4;border-bottom-color:#66c0f4}' +
    '.steam-root .yy-cat-tab:hover{color:#66c0f4}' +
    '.steam-root .yy-forum{display:flex;gap:20px;align-items:flex-start;background:transparent;padding:0}' +
    '.steam-root .yy-forum-main{flex:1;min-width:0;overflow:hidden}' +
    '.steam-root .yy-forum-side{flex:0 0 280px}' +
    '.steam-root .yy-forum-subhead{color:#8f98a0;font-size:12px;margin:4px 0 10px}' +
    '.steam-root .forum_topic{position:relative;height:48px;background-color:rgba(84,133,183,.4);margin-bottom:2px;padding-inline:5px 15px;cursor:pointer;overflow:hidden}' +
    '.steam-root .forum_topic_overlay{position:absolute;display:block;left:0;top:0;right:0;bottom:0;z-index:2}' +
    '.steam-root .forum_topic:hover{background-color:rgba(117,204,255,.5)}' +
    '.steam-root .forum_topic:hover .forum_topic_name{color:#fff}' +
    '.steam-root .forum_topic .forum_topic_label{font-weight:bold}' +
    '.steam-root .forum_topic_label.sticky_label{color:#AEDD08}' +
    '.steam-root .forum_topic_icon{float:left;height:16px;width:16px;padding:12px 12px 16px 6px;position:relative;z-index:4}' +
    '.steam-root .forum_topic_details{color:#8F98A0;line-height:48px}' +
    '.steam-root .forum_topic_reply_count{font-size:14px;float:right;color:#c6d4df;padding-left:5px}' +
    '.steam-root .forum_topic_reply_count img{vertical-align:middle;height:20px}' +
    '.steam-root .forum_topic_lastpost{font-size:11px;float:right;padding-right:28px;color:#8ED1F9}' +
    '.steam-root .forum_topic_name{font-size:14px;color:#dcdcdc;line-height:30px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:20px}' +
    '.steam-root .forum_topic.unread .forum_topic_name{font-weight:bold;color:#fff}' +
    '.steam-root .forum_topic_op{color:#8ED1F9;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.steam-root .forum_topic:hover .forum_topic_op{color:#70beed}' +
    '.steam-root .yy-side-box{background:rgba(23,42,56,.45);border:1px solid rgba(102,192,244,.12);border-radius:3px;padding:10px 12px;margin-bottom:12px}' +
    '.steam-root .yy-side-box .side-title{color:#fff;font-size:13px;font-weight:600;margin-bottom:8px}' +
    '.steam-root .yy-side-btn{display:block;width:100%;text-align:center;padding:8px;background:#66c0f4;color:#171a21;border-radius:3px;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:8px}' +
    '.steam-root .yy-side-btn.grey{background:#354a5f;color:#c7d5e0}' +
    '.steam-root .yy-side-btn:hover{filter:brightness(1.1)}' +
    '.steam-root .yy-follow{display:block;color:#66c0f4;font-size:13px;margin:4px 0 8px;cursor:pointer}' +
    '.steam-root .yy-cat-row{display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(102,192,244,.08);font-size:13px;color:#c7d5e0;cursor:pointer}' +
    '.steam-root .yy-cat-row:hover{color:#66c0f4}' +
    '.steam-root .yy-cat-count{color:#8f98a0;font-size:12px}' +
    '.steam-root .yy-search{width:100%;background:rgba(0,0,0,.25);border:1px solid rgba(102,192,244,.2);border-radius:3px;color:#c7d5e0;padding:6px 10px;font-size:13px;margin-bottom:10px;box-sizing:border-box}' +
    '</style>';
}

window.黄游打开区 = function(区名) { 黄游当前区 = 区名; var el = document.getElementById('yyContentView'); if (el) 黄游渲染区(el); };
window.黄游返回详情 = function() { 黄游当前区 = ''; var el = document.getElementById('yyContentView'); if (el) 黄游渲染详情(el); };

function 黄游渲染区(el) {
  var c = 黄游上下文();
  var 区名 = 黄游当前区 || '讨论';
  var h = '<div class="steam-root">';
  h += '<link rel="stylesheet" href="' + 黄游素材('steam-community.css') + '"><link rel="stylesheet" href="' + 黄游素材('motiva_sans.css') + '">';
  h += 黄游社区样式();
  h += '<div role="banner" id="global_header"><div class="content"><div class="logo"><span id="logo_holder"><img src="' + 黄游素材('logo_steam.svg') + '" width="144.5" height="44" alt="Steam"></span></div><div role="navigation" class="supernav_container" aria-label="全局菜单"><a class="menuitem supernav supernav_active" onclick="return false">商店</a><a class="menuitem supernav" onclick="return false">社区</a><a class="menuitem supernav" onclick="return false">关于</a><a class="menuitem supernav" onclick="return false">客服</a></div><div id="global_actions"><a class="global_action_link" onclick="return false">登录</a></div></div></div>';
  h += '<div class="page_content">';
  h += '<div class="page_title_area game_title_area page_content"><div class="breadcrumbs"><a class="breadcrumb_item" onclick="黄游渲染列表(document.getElementById(\'yyContentView\'))">所有游戏</a> &gt; <a class="breadcrumb_item" onclick="return false">' + escHtml((黄游游戏分类[c.cat] || {}).label || '') + '</a>' + (c.isDLC ? ' &gt; <a class="breadcrumb_item" onclick="黄游打开详情(\'' + c.dlcOf.replace(/'/g, "\\'") + '\')">' + escHtml(c.dlcOf) + '</a>' : '') + ' &gt; <a class="breadcrumb_item" onclick="黄游返回详情()">' + escHtml(c.info.name) + '</a> &gt; <span class="breadcrumb_item">' + 区名 + '</span></div></div>';
  h += '<div class="yy-apphub">';
  h += '<div class="yy-apphub-name">' + escHtml(c.info.name) + '</div>';
  h += '<div class="yy-cat-tabs">';
  [['讨论', '讨论区'], ['指南', '指南'], ['创意工坊', '创意工坊']].forEach(function(t) {
    h += '<span class="yy-cat-tab' + (t[0] === 区名 ? ' act' : '') + '" onclick="黄游打开区(\'' + t[0] + '\')">' + t[1] + '</span>';
  });
  h += '</div></div>';
  h += '<div id="yyCommBody"><div class="yy-empty">加载中…</div></div>';
  h += '</div></div>';
  el.innerHTML = h;
  黄游加载区数据();
}

function 黄游加载区数据() {
  var c = 黄游上下文(); var 区名 = 黄游当前区;
  var body = document.getElementById('yyCommBody');
  if (!body) return;
  黄游读区(c.cat, c.name, 区名).then(function(d) {
    var list = (d && d.list) || [];
    if (区名 === '讨论') body.innerHTML = 黄游讨论区论坛(c, list);
    else if (区名 === '指南') body.innerHTML = 黄游指南列表(c, list);
    else if (区名 === '创意工坊') body.innerHTML = 黄游工坊列表(c, list);
  });
}

// ===== 讨论区（复刻 Steam 社区讨论：左列表 + 右侧栏）=====
function 黄游讨论区论坛(c, list) {
  var h = '<div class="yy-forum">';
  // 左：主题列表
  h += '<div class="yy-forum-main" id="yyForumMain">';
  h += '<div class="yy-forum-subhead">显示第 1 - ' + list.length + ' 个，共 ' + list.length + ' 个（按 时间）</div>';
  if (!list.length) h += '<div class="yy-empty">还没有讨论——用右上「发帖讨论」发起一个主题。</div>';
  list.slice().reverse().forEach(function(t, i) { h += 黄游讨论区行(t); });
  h += '</div>';
  // 右：侧栏
  h += '<div class="yy-forum-side">' + 黄游讨论区侧栏(c, list) + '</div>';
  h += '</div>';
  return h;
}

function 黄游讨论区行(t) {
  var cla = 'forum_topic unread' + (t.locked ? ' locked' : '') + (t.sticky ? ' sticky' : '');
  var ic = t.locked ? 黄游素材('forum_icon_Locked.png') : 黄游素材('forum_icon_Comments.png');
  var 置顶标签 = t.sticky ? '<span class="forum_topic_label sticky_label">置顶：</span>' : '';
  return '<div class="' + cla + '">' +
    '<a class="forum_topic_overlay" onclick="黄游打开线程(\'' + escHtml(t.id) + '\')"></a>' +
    '<div class="forum_topic_details"><div class="forum_topic_reply_count"><img src="' + 黄游素材('forum_icon_Comments.png') + '" alt=""> ' + ((t.replies || []).length) + '</div><div class="forum_topic_lastpost">' + escHtml(t.time || '') + '</div></div>' +
    '<div class="forum_topic_icon"><img src="' + ic + '" style="width:20px" alt=""></div>' +
    '<div class="forum_topic_name">' + 置顶标签 + escHtml(t.title) + '</div>' +
    '<div class="forum_topic_op">' + escHtml(t.author || '匿名') + '</div>' +
    '<div class="forum_topic_del" onclick="event.stopPropagation();黄游社区删除条目(\'讨论\',\'' + escHtml(t.id) + '\')" title="删除该主题">🗑</div>' +
    '<div style="clear:both"></div></div>';
}

function 黄游讨论区侧栏(c, list) {
  var tags = {}; list.forEach(function(t) { var k = t.tag || '讨论'; tags[k] = (tags[k] || 0) + 1; });
  var h = '<div class="yy-side-box">';
  h += '<input class="yy-search" placeholder="搜索" id="yyForumSearch" onkeydown="if(event.key===\'Enter\')黄游论坛搜索()">';
  h += '<span class="yy-side-btn" onclick="黄游发帖()">发帖讨论</span>';
  h += '<span class="yy-side-btn grey" onclick="toast(\'已订阅论坛\')">订阅论坛</span>';
  h += '</div>';
  h += '<div class="yy-side-box"><div class="side-title">贡献</div>';
  h += '<div class="yy-cat-row" onclick="黄游论坛筛选(\'全部\')"><span>全部讨论</span><span class="yy-cat-count">' + list.length + '</span></div>';
  Object.keys(tags).sort().forEach(function(k) { h += '<div class="yy-cat-row" onclick="黄游论坛筛选(\'' + escHtml(k) + '\')"><span>' + escHtml(k) + '</span><span class="yy-cat-count">' + tags[k] + '</span></div>'; });
  h += '</div>';
  h += '<div class="yy-follow">★ 关注论坛</div><div class="yy-follow">🔖 给论坛添加书签</div>';
  return h;
}

window.黄游论坛搜索 = function() {
  var v = (document.getElementById('yyForumSearch') || {}).value || '';
  var c = 黄游上下文();
  黄游读区(c.cat, c.name, '讨论').then(function(d) {
    var list = ((d && d.list) || []).filter(function(t) { return !v || (t.title || '').indexOf(v) >= 0 || (t.content || '').indexOf(v) >= 0; });
    document.getElementById('yyForumMain') ? document.getElementById('yyForumMain').innerHTML = (list.length ? list.slice().reverse().map(function(t) { return 黄游讨论区行(t); }).join('') : '<div class="yy-empty">无结果</div>') : 0;
  });
};

window.黄游论坛筛选 = function(标签) {
  var c = 黄游上下文();
  黄游读区(c.cat, c.name, '讨论').then(function(d) {
    var list = ((d && d.list) || []).filter(function(t) { return 标签 === '全部' || (t.tag || '讨论') === 标签; });
    var main = document.getElementById('yyForumMain');
    if (main) main.innerHTML = list.slice().reverse().map(function(t) { return 黄游讨论区行(t); }).join('');
  });
};

window.黄游发帖 = function() {
  var body = document.getElementById('yyCommBody');
  if (!body) return;
  body.innerHTML = '<div class="yy-post"><div class="yy-post-title">发起新主题</div><input class="yy-input" id="yyThreadTitle" placeholder="主题标题" style="margin:10px 0"><textarea class="yy-input" id="yyThreadContent" rows="6" placeholder="正文内容…"></textarea><div style="margin:10px 0"><span class="yy-btn blue" onclick="黄游帖子AI()">🤖 让 AI 生成</span></div><div><span class="yy-btn green" onclick="黄游提交帖子()">发布</span> <span class="yy-btn grey" onclick="黄游加载区数据()">取消</span></div></div>';
};

// 讨论区：AI 生成主题帖（注入完整上下文，DLC 时分段提供）
window.黄游帖子AI = function() {
  toast('🤖 正在根据本作信息生成讨论主题...');
  黄游社区AI生成('hybz_thread_gen', function(d) {
    var t = (document.getElementById('yyThreadTitle')); if (t && d.title) t.value = d.title;
    var c = (document.getElementById('yyThreadContent')); if (c && d.content) c.value = d.content;
    toast('✅ 已生成，可修改后发布');
  });
};

window.黄游提交帖子 = function() {
  var c = 黄游上下文(); var 游戏名 = c.name;
  var title = (document.getElementById('yyThreadTitle') || {}).value || '';
  var content = (document.getElementById('yyThreadContent') || {}).value || '';
  if (!title.trim()) { toast('请填写标题'); return; }
  黄游读区(c.cat, 游戏名, '讨论').then(function(d) {
    var list = (d && d.list) || [];
    list.push({ id: 't' + Date.now(), title: title.trim(), author: '玩家', time: '刚刚', content: content.trim(), replies: [] });
    return 黄游写区(c.cat, 游戏名, '讨论', { list: list });
  }).then(function() { toast('✅ 已发布'); 黄游加载区数据(); });
};

// ===== 社区区通用 AI 生成：注入开发者模式完整上下文（本体/DLC 自动分段），回填表单 =====
window.黄游社区AI生成 = function(promptName, fillFn) {
  var c = 黄游上下文();
  var target = c.isDLC ? 'DLC' : '游戏';
  黄游AI开发者上下文().then(function(ctx) {
    var rendered = renderPrompt(promptName, { text: ctx, target: target });
    return LLM.callJSON({ prompt: rendered.user, system: rendered.system, label: '社区内容生成', temperature: 0.85 }).then(function(d) {
      if (!d) { toast('生成失败'); return; }
      if (fillFn) fillFn(d);
    });
  }).catch(function(err) { toast('❌ ' + (err && err.message ? err.message : err)); });
};

// ===== 社区区通用 AI 一键生成回复：注入完整上下文，生成 replies 加入对应项 =====
window.黄游社区AI回复 = function(区名, id, subject) {
  var c = 黄游上下文();
  var target = c.isDLC ? 'DLC' : '游戏';
  toast('🤖 正在生成回复...');
  黄游AI开发者上下文().then(function(ctx) {
    var rendered = renderPrompt('hybz_reply_gen', { text: ctx, target: target, subject: subject, count: 5 });
    return LLM.callJSON({ prompt: rendered.user, system: rendered.system, label: '社区回复生成', temperature: 0.85 }).then(function(d) {
      var rs = (d && d.replies) || [];
      if (!rs.length) { toast('生成失败'); return; }
      return 黄游读区(c.cat, c.name, 区名).then(function(dd) {
        var list = (dd && dd.list) || [];
        var it = list.filter(function(x) { return x.id === id; })[0];
        if (!it) { toast('条目不存在'); return; }
        it.replies = it.replies || [];
        rs.forEach(function(r) { it.replies.push({ author: r.author || '玩家', content: r.content || '', time: '刚刚' }); });
        return 黄游写区(c.cat, c.name, 区名, { list: list });
      }).then(function() {
        toast('✅ 已生成 ' + rs.length + ' 条回复');
        if (区名 === '讨论') 黄游打开线程(id);
        else if (区名 === '指南') 黄游打开指南(id);
        else if (区名 === '创意工坊') 黄游打开作品(id);
      });
    });
  }).catch(function(err) { toast('❌ ' + (err && err.message ? err.message : err)); });
};

// ===== 社区区通用删除：条目（讨论/指南/工坊）=====
window.黄游社区删除条目 = function(区名, id) {
  var c = 黄游上下文(); var 游戏名 = c.name;
  var 名称 = { '讨论': '主题', '指南': '指南', '创意工坊': '作品' }[区名] || '条目';
  if (typeof confirmDialog === 'function') confirmDialog('确定删除该' + 名称 + '？', doDel); else doDel();
  function doDel() {
    黄游读区(c.cat, 游戏名, 区名).then(function(d) {
      var list = (d && d.list) || [];
      list = list.filter(function(x) { return x.id !== id; });
      return 黄游写区(c.cat, 游戏名, 区名, { list: list });
    }).then(function() { toast('✅ 已删除'); 黄游加载区数据(); });
  }
};

// ===== 社区区通用删除：回复/评论 =====
window.黄游社区删除回复 = function(区名, id, replyIndex) {
  var c = 黄游上下文(); var 游戏名 = c.name;
  黄游读区(c.cat, 游戏名, 区名).then(function(d) {
    var list = (d && d.list) || [];
    var it = list.filter(function(x) { return x.id === id; })[0];
    if (!it) { toast('条目不存在'); return; }
    it.replies = it.replies || [];
    var idx = parseInt(replyIndex, 10);
    if (idx >= 0 && idx < it.replies.length) it.replies.splice(idx, 1);
    return 黄游写区(c.cat, 游戏名, 区名, { list: list });
  }).then(function() {
    if (区名 === '讨论') 黄游打开线程(id);
    else if (区名 === '指南') 黄游打开指南(id);
    else if (区名 === '创意工坊') 黄游打开作品(id);
  });
};

window.黄游打开线程 = function(id) {
  var c = 黄游上下文(); var 游戏名 = c.name;
  黄游读区(c.cat, 游戏名, '讨论').then(function(d) {
    var list = (d && d.list) || [];
    var t = list.filter(function(x) { return x.id === id; })[0];
    if (!t) { toast('主题不存在'); return; }
    var body = document.getElementById('yyCommBody');
    if (!body) return;
    var h = '<div class="yy-post"><div class="yy-post-title">' + escHtml(t.title) + '</div><div class="yy-post-meta">' + escHtml(t.author || '匿名') + ' · ' + escHtml(t.time || '') + '</div><div class="yy-post-body">' + escHtml(t.content || '') + '</div></div>';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;margin:4px 0 8px"><div style="color:#fff;font-size:14px;font-weight:700">全部回复 (' + ((t.replies || []).length) + ')</div><span class="yy-btn blue yy-btn-sm" onclick="黄游社区AI回复(\'讨论\',\'' + escHtml(id) + '\',\'' + escHtml(t.title) + '\')">🤖 AI 一键生成回复</span></div>';
    (t.replies || []).forEach(function(r, ri) {
      h += '<div class="yy-reply"><div class="yy-reply-author">' + escHtml(r.author || '匿名') + '</div><div class="yy-reply-body">' + escHtml(r.content || '') + '</div><span class="yy-reply-del" onclick="黄游社区删除回复(\'讨论\',\'' + escHtml(id) + '\',' + ri + ')" title="删除该回复">🗑</span></div>';
    });
    h += '<div style="margin-top:12px"><textarea class="yy-input" id="yyReplyBox" rows="2" placeholder="回复…"></textarea><div style="margin-top:8px"><span class="yy-btn blue" onclick="黄游回复线程(\'' + escHtml(id) + '\')">回复</span></div></div>';
    body.innerHTML = h;
  });
};

window.黄游回复线程 = function(id) {
  var c = 黄游上下文(); var 游戏名 = c.name;
  var text = (document.getElementById('yyReplyBox') || {}).value || '';
  if (!text.trim()) { toast('请输入回复'); return; }
  黄游读区(c.cat, 游戏名, '讨论').then(function(d) {
    var list = (d && d.list) || [];
    var t = list.filter(function(x) { return x.id === id; })[0];
    if (!t) { toast('主题不存在'); return; }
    t.replies = t.replies || []; t.replies.push({ author: '玩家', content: text.trim(), time: '刚刚' });
    return 黄游写区(c.cat, 游戏名, '讨论', { list: list });
  }).then(function() { toast('✅ 已回复'); 黄游打开线程(id); });
};

// ===== 指南（Steam 指南：副标题 + 创建入口 + 工具栏 + 卡片列表 + 详情评分）=====
var 黄游指南分类 = '全部';
var 黄游指南搜索词 = '';

function 黄游指南列表(c, rawList) {
  var list = rawList.filter(function(g) {
    if (黄游指南分类 !== '全部' && (g.type || '攻略') !== 黄游指南分类) return false;
    if (黄游指南搜索词 && (g.title || '').indexOf(黄游指南搜索词) < 0 && (g.content || '').indexOf(黄游指南搜索词) < 0) return false;
    return true;
  });
  var h = '<div class="yy-gd-lay"><div class="yy-gd-main">';
  h += '<div class="yy-gd-h">热门指南 <span style="font-size:11px;color:#8f98a0;font-weight:400">(' + list.length + ')</span></div>';
  h += 黄游指南热门排行(list);
  h += '<div class="yy-gd-h">我的 Steam 指南 <span style="font-size:11px;color:#8f98a0;font-weight:400">(共 ' + list.length + ' 篇)</span></div>';
  h += '<div class="yy-gd-sub">浏览玩家为此游戏创作的指南并为其评分。</div>';
  if (!list.length) h += '<div class="yy-empty">没有符合条件的指南——用右侧「创建指南」撰写一篇。</div>';
  list.slice().reverse().forEach(function(g) { h += 黄游指南卡片(g); });
  h += '</div>';
  h += '<div class="yy-gd-side">' + 黄游指南侧栏(c, list) + '</div></div>';
  return h;
}

function 黄游指南热门排行(list) {
  var pop = list.slice().reverse().slice(0, 6);
  var h = '<div class="yy-gd-pop">';
  pop.forEach(function(g) {
    h += '<div class="yy-gd-pop-card" onclick="黄游打开指南(\'' + escHtml(g.id) + '\')"><div class="yy-gd-pop-img">' + escHtml(g.type || '指南') + '</div><div class="yy-gd-pop-name">' + escHtml(g.title) + '</div></div>';
  });
  h += '</div>';
  return h;
}

function 黄游指南卡片(g) {
  var views = g.views || ((g.votes || 0) * 37 + 128);
  return '<div class="yy-gd-item" onclick="黄游打开指南(\'' + escHtml(g.id) + '\')">' +
    '<div class="yy-gd-thumb">' + escHtml(g.type || '指南') + '</div>' +
    '<div class="yy-gd-body"><div class="yy-gd-title">' + escHtml(g.title) + '</div>' +
    '<div class="yy-gd-author">作者：' + escHtml(g.author || '编辑') + '</div>' +
    '<div class="yy-gd-desc">' + escHtml((g.content || '').slice(0, 150)) + '</div>' +
    '<div class="yy-gd-foot"><span class="yy-stars">★★★★★</span><span>' + escHtml(String(views)) + ' 次浏览</span><span>👍 ' + (g.votes || 0) + ' 评分</span><span class="yy-gd-del" onclick="event.stopPropagation();黄游社区删除条目(\'指南\',\'' + escHtml(g.id) + '\')" title="删除该指南">🗑</span></div></div></div>';
}

function 黄游指南侧栏(c, list) {
  var types = {}; list.forEach(function(g) { var k = g.type || '攻略'; types[k] = (types[k] || 0) + 1; });
  var h = '<div class="yy-side-box">';
  h += '<input class="yy-search" placeholder="搜索 ' + escHtml(c.info.name) + ' 指南" id="yyGuideSearch" value="' + escHtml(黄游指南搜索词) + '" onkeydown="if(event.key===\'Enter\')黄游指南搜索()">';
  h += '<div class="side-title">类型</div>';
  h += '<div class="yy-cat-row" onclick="黄游指南筛选(\'全部\')"><span>全部</span><span class="yy-cat-count">' + list.length + '</span></div>';
  Object.keys(types).forEach(function(k) { h += '<div class="yy-cat-row" onclick="黄游指南筛选(\'' + escHtml(k) + '\')"><span>' + escHtml(k) + '</span><span class="yy-cat-count">' + types[k] + '</span></div>'; });
  h += '</div>';
  h += '<span class="yy-side-btn" onclick="黄游指南创建()" style="margin-bottom:8px">浏览所有指南</span>';
  h += '<span class="yy-side-btn blue" onclick="黄游指南创建()">创建指南</span>';
  return h;
}

window.黄游打开指南 = function(id) {
  var c = 黄游上下文(); var 游戏名 = c.name;
  黄游读区(c.cat, 游戏名, '指南').then(function(d) {
    var list = (d && d.list) || [];
    var g = list.filter(function(x) { return x.id === id; })[0];
    if (!g) { toast('指南不存在'); return; }
    var body = document.getElementById('yyCommBody');
    if (!body) return;
    var h = '<div style="margin-bottom:12px"><span class="yy-btn grey" onclick="黄游加载区数据()">← 返回指南</span></div>';
    h += '<div class="yy-post"><div class="yy-post-title">' + escHtml(g.title) + ' <span style="font-size:12px;color:#66c0f4;font-weight:400">' + escHtml(g.type || '攻略') + '</span></div>';
    h += '<div class="yy-post-meta">' + escHtml(g.author || '编辑') + ' · ' + escHtml(g.time || '') + '</div>';
    h += '<div class="yy-post-body">' + escHtml(g.content || (g.conclusion || '暂无内容')) + '</div>';
    h += '<div class="yy-detail-actions"><span class="yy-btn blue" onclick="黄游指南评分(\'' + escHtml(g.id) + '\')">👍 ' + (g.votes || 0) + ' 评分</span><span class="yy-btn grey" onclick="黄游指南收藏(\'' + escHtml(g.id) + '\')">' + (g.favorited ? '★ 已收藏' : '☆ 收藏') + '</span></div></div>';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;margin:4px 0 8px"><div style="color:#fff;font-size:14px;font-weight:700">全部评论 (' + ((g.replies || []).length) + ')</div><span class="yy-btn blue yy-btn-sm" onclick="黄游社区AI回复(\'指南\',\'' + escHtml(g.id) + '\',\'' + escHtml(g.title) + '\')">🤖 AI 一键生成评论</span></div>';
    (g.replies || []).forEach(function(r, ri) {
      h += '<div class="yy-reply"><div class="yy-reply-author">' + escHtml(r.author || '匿名') + '</div><div class="yy-reply-body">' + escHtml(r.content || '') + '</div><span class="yy-reply-del" onclick="黄游社区删除回复(\'指南\',\'' + escHtml(g.id) + '\',' + ri + ')" title="删除该评论">🗑</span></div>';
    });
    h += '<div style="margin-top:12px"><textarea class="yy-input" id="yyGuideReplyBox" rows="2" placeholder="评论…"></textarea><div style="margin-top:8px"><span class="yy-btn blue" onclick="黄游指南回复(\'' + escHtml(g.id) + '\')">评论</span></div></div>';
    body.innerHTML = h;
  });
};

window.黄游指南评分 = function(id) {
  var c = 黄游上下文(); var 游戏名 = c.name;
  黄游读区(c.cat, 游戏名, '指南').then(function(d) {
    var list = (d && d.list) || [];
    var g = list.filter(function(x) { return x.id === id; })[0];
    if (g) { g.rated = !g.rated; g.votes = (g.votes || 0) + (g.rated ? 1 : -1); if (g.votes < 0) g.votes = 0; }
    return 黄游写区(c.cat, 游戏名, '指南', { list: list });
  }).then(function() { toast('✅ 已更新'); 黄游加载区数据(); });
};

window.黄游指南收藏 = function(id) {
  var c = 黄游上下文(); var 游戏名 = c.name;
  黄游读区(c.cat, 游戏名, '指南').then(function(d) {
    var list = (d && d.list) || [];
    var g = list.filter(function(x) { return x.id === id; })[0];
    if (g) g.favorited = !g.favorited;
    return 黄游写区(c.cat, 游戏名, '指南', { list: list });
  }).then(function() { toast('✅ 已更新'); 黄游加载区数据(); });
};

window.黄游指南回复 = function(id) {
  var c = 黄游上下文(); var 游戏名 = c.name;
  var text = (document.getElementById('yyGuideReplyBox') || {}).value || '';
  if (!text.trim()) { toast('请输入评论'); return; }
  黄游读区(c.cat, 游戏名, '指南').then(function(d) {
    var list = (d && d.list) || [];
    var g = list.filter(function(x) { return x.id === id; })[0];
    if (!g) { toast('指南不存在'); return; }
    g.replies = g.replies || []; g.replies.push({ author: '玩家', content: text.trim(), time: '刚刚' });
    return 黄游写区(c.cat, 游戏名, '指南', { list: list });
  }).then(function() { toast('✅ 已评论'); 黄游打开指南(id); });
};

window.黄游指南筛选 = function(tab) {
  黄游指南分类 = tab; var c = 黄游上下文();
  黄游读区(c.cat, c.name, '指南').then(function(d) {
    var body = document.getElementById('yyCommBody'); if (body) body.innerHTML = 黄游指南列表(c, (d && d.list) || []);
  });
};

window.黄游指南搜索 = function() {
  黄游指南搜索词 = (document.getElementById('yyGuideSearch') || {}).value || '';
  var c = 黄游上下文();
  黄游读区(c.cat, c.name, '指南').then(function(d) {
    var body = document.getElementById('yyCommBody'); if (body) body.innerHTML = 黄游指南列表(c, (d && d.list) || []);
  });
};

window.黄游指南创建 = function() {
  var body = document.getElementById('yyCommBody'); if (!body) return;
  body.innerHTML = '<div class="yy-post"><div class="yy-post-title">创建自己的指南</div><input class="yy-input" id="yyGuideTitle" placeholder="指南标题" style="margin:10px 0"><input class="yy-input" id="yyGuideType" placeholder="类型（攻略 / 评测 / 目标…）" style="margin-bottom:10px"><input class="yy-input" id="yyGuideAuthor" placeholder="作者名" style="margin-bottom:10px"><textarea class="yy-input" id="yyGuideContent" rows="6" placeholder="指南内容…"></textarea><div style="margin:10px 0"><span class="yy-btn blue" onclick="黄游指南生成()">🤖 让 AI 生成</span></div><div><span class="yy-btn green" onclick="黄游指南提交()">发布</span> <span class="yy-btn grey" onclick="黄游加载区数据()">取消</span></div></div>';
};

window.黄游指南提交 = function() {
  var c = 黄游上下文(); var 游戏名 = c.name;
  var title = (document.getElementById('yyGuideTitle') || {}).value || '';
  var type = (document.getElementById('yyGuideType') || {}).value || '';
  var author = (document.getElementById('yyGuideAuthor') || {}).value || '';
  var content = (document.getElementById('yyGuideContent') || {}).value || '';
  if (!title.trim()) { toast('请填写标题'); return; }
  黄游读区(c.cat, 游戏名, '指南').then(function(d) {
    var list = (d && d.list) || [];
    list.push({ id: 'g' + Date.now(), title: title.trim(), type: type.trim() || '攻略', author: author.trim() || '玩家', content: content.trim(), time: '刚刚', votes: 0, favorited: false });
    return 黄游写区(c.cat, 游戏名, '指南', { list: list });
  }).then(function() { toast('✅ 已发布'); 黄游加载区数据(); });
};

window.黄游指南生成 = function() {
  toast('🤖 正在根据本作信息生成指南...');
  黄游社区AI生成('hybz_guide_gen', function(d) {
    var t = (document.getElementById('yyGuideTitle')); if (t && d.title) t.value = d.title;
    var ty = (document.getElementById('yyGuideType')); if (ty && d.type) ty.value = d.type;
    var c = (document.getElementById('yyGuideContent')); if (c && d.content) c.value = d.content;
    toast('✅ 已生成，可修改后发布');
  });
};

// ===== 创意工坊（Steam Workshop 风格：工具栏 + 网格 + 作品详情）=====
var 黄游工坊标签 = '全部';
var 黄游工坊搜索词 = '';
var 黄游工坊排序 = '热门';

function 黄游工坊列表(c, rawList) {
  var list = rawList.filter(function(it) {
    if (黄游工坊标签 && (it.tags || []).indexOf(黄游工坊标签) < 0 && 黄游工坊标签 !== '全部') return false;
    if (黄游工坊搜索词 && (it.name || '').indexOf(黄游工坊搜索词) < 0 && (it.author || '').indexOf(黄游工坊搜索词) < 0) return false;
    return true;
  });
  var h = '<div class="yy-ws-lay"><div class="yy-ws-side">' + 黄游工坊侧栏(c, rawList) + '</div><div class="yy-ws-main">';
  h += '<div class="yy-ws-sort">';
  [['最热门', '热门'], ['最多人订阅', '订阅'], ['最新更新', '更新'], ['最新', '最新']].forEach(function(s) {
    h += '<span class="yy-ws-sort-tab' + (黄游工坊排序 === s[1] ? ' act' : '') + '" onclick="黄游工坊排序(\'' + s[1] + '\')">' + s[0] + '</span>';
  });
  h += '</div>';
  h += '<div class="yy-gd-sub">最近 1 个月内发布的项目</div>';
  if (!list.length) h += '<div class="yy-empty">没有符合条件的项目。</div>';
  h += '<div class="yy-ws-grid">';
  list.slice().reverse().forEach(function(it) { h += 黄游工坊卡片(it); });
  h += '</div></div></div>';
  return h;
}

function 黄游工坊卡片(it) {
  var tags = it.tags && it.tags.length ? it.tags : ['Mod'];
  return '<div class="yy-ws-item" onclick="黄游打开作品(\'' + escHtml(it.id) + '\')">' +
    '<div class="yy-ws-img">' + escHtml('「' + (it.name || '作品') + '」') + '</div>' +
    '<div class="yy-ws-stars">★★★★★</div>' +
    '<div class="yy-ws-info"><div class="yy-ws-name">' + escHtml(it.name || '未命名') + '</div>' +
    '<div class="yy-ws-author">作者：' + escHtml(it.author || '作者') + '</div>' +
    '<div class="yy-ws-tags">' + tags.map(function(t) { return '<span class="yy-ws-tag">' + escHtml(t) + '</span>'; }).join('') + '</div>' +
    '<div class="yy-ws-review" style="display:flex;align-items:center;justify-content:space-between"><span>' + (it.reviews || 0) + ' 个评价</span><span class="yy-ws-del" onclick="event.stopPropagation();黄游社区删除条目(\'创意工坊\',\'' + escHtml(it.id) + '\')" title="删除该作品">🗑 删除</span></div></div></div>';
}

function 黄游工坊侧栏(c, list) {
  var tags = {}; list.forEach(function(it) { (it.tags || ['Mod']).forEach(function(t) { tags[t] = (tags[t] || 0) + 1; }); });
  var h = '<div class="yy-side-box">';
  h += '<input class="yy-search" placeholder="搜索 ' + escHtml(c.info.name) + '…" id="yyWsSearch" value="' + escHtml(黄游工坊搜索词) + '" onkeydown="if(event.key===\'Enter\')黄游工坊搜索()">';
  h += '<div class="side-title">标签</div>';
  h += '<div class="yy-cat-row" onclick="黄游工坊标签筛选(\'全部\')"><span>全部</span><span class="yy-cat-count">' + list.length + '</span></div>';
  Object.keys(tags).forEach(function(t) { h += '<div class="yy-cat-row" onclick="黄游工坊标签筛选(\'' + escHtml(t) + '\')"><span>' + escHtml(t) + '</span><span class="yy-cat-count">' + tags[t] + '</span></div>'; });
  h += '</div>';
  h += '<span class="yy-side-btn" onclick="黄游工坊创建()">创建项目</span>';
  return h;
}

window.黄游打开作品 = function(id) {
  var c = 黄游上下文(); var 游戏名 = c.name;
  黄游读区(c.cat, 游戏名, '创意工坊').then(function(d) {
    var list = (d && d.list) || [];
    var it = list.filter(function(x) { return x.id === id; })[0];
    if (!it) { toast('作品不存在'); return; }
    var body = document.getElementById('yyCommBody');
    if (!body) return;
    var h = '<div style="margin-bottom:12px"><span class="yy-btn grey" onclick="黄游加载区数据()">← 返回创意工坊</span></div>';
    h += '<div class="yy-detail"><div class="yy-detail-img">' + escHtml('「' + (it.name || '作品') + '」') + '</div><div class="yy-detail-body">';
    h += '<div class="yy-detail-title">' + escHtml(it.name || '未命名') + '</div>';
    h += '<div class="yy-detail-meta">' + escHtml(it.author || '作者') + ' · 🔖 ' + (it.subs || 0) + ' 订阅' + (it.subscribed ? ' · ✔ 已订阅' : '') + '</div>';
    h += '<div class="yy-detail-desc">' + escHtml(it.desc || '这是一个玩家在 Steam 创意工坊发布的自制作品，为游戏带来全新内容。') + '</div>';
    h += '<div class="yy-detail-actions"><span class="yy-btn blue" onclick="黄游工坊订阅(\'' + escHtml(it.id) + '\')">' + (it.subscribed ? '取消订阅' : '订阅') + '</span><span class="yy-btn grey" onclick="黄游工坊收藏(\'' + escHtml(it.id) + '\')">' + (it.favorited ? '★ 已收藏' : '☆ 收藏') + '</span></div>';
    h += '</div></div>';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;margin:4px 0 8px"><div style="color:#fff;font-size:14px;font-weight:700">全部评论 (' + ((it.replies || []).length) + ')</div><span class="yy-btn blue yy-btn-sm" onclick="黄游社区AI回复(\'创意工坊\',\'' + escHtml(it.id) + '\',\'' + escHtml(it.name) + '\')">🤖 AI 一键生成评论</span></div>';
    (it.replies || []).forEach(function(r, ri) {
      h += '<div class="yy-reply"><div class="yy-reply-author">' + escHtml(r.author || '匿名') + '</div><div class="yy-reply-body">' + escHtml(r.content || '') + '</div><span class="yy-reply-del" onclick="黄游社区删除回复(\'创意工坊\',\'' + escHtml(it.id) + '\',' + ri + ')" title="删除该评论">🗑</span></div>';
    });
    h += '<div style="margin-top:12px"><textarea class="yy-input" id="yyWsReplyBox" rows="2" placeholder="评论…"></textarea><div style="margin-top:8px"><span class="yy-btn blue" onclick="黄游工坊回复(\'' + escHtml(it.id) + '\')">评论</span></div></div>';
    body.innerHTML = h;
  });
};

window.黄游工坊订阅 = function(id) {
  var c = 黄游上下文(); var 游戏名 = c.name;
  黄游读区(c.cat, 游戏名, '创意工坊').then(function(d) {
    var list = (d && d.list) || [];
    var it = list.filter(function(x) { return x.id === id; })[0];
    if (it) { if (it.subscribed) { it.subscribed = false; it.subs = Math.max(0, (it.subs || 0) - 1); } else { it.subscribed = true; it.subs = (it.subs || 0) + 1; } }
    return 黄游写区(c.cat, 游戏名, '创意工坊', { list: list });
  }).then(function() { toast('✅ 已更新'); 黄游加载区数据(); });
};

window.黄游工坊收藏 = function(id) {
  var c = 黄游上下文(); var 游戏名 = c.name;
  黄游读区(c.cat, 游戏名, '创意工坊').then(function(d) {
    var list = (d && d.list) || [];
    var it = list.filter(function(x) { return x.id === id; })[0];
    if (it) it.favorited = !it.favorited;
    return 黄游写区(c.cat, 游戏名, '创意工坊', { list: list });
  }).then(function() { toast('✅ 已更新'); 黄游加载区数据(); });
};

window.黄游工坊回复 = function(id) {
  var c = 黄游上下文(); var 游戏名 = c.name;
  var text = (document.getElementById('yyWsReplyBox') || {}).value || '';
  if (!text.trim()) { toast('请输入评论'); return; }
  黄游读区(c.cat, 游戏名, '创意工坊').then(function(d) {
    var list = (d && d.list) || [];
    var it = list.filter(function(x) { return x.id === id; })[0];
    if (!it) { toast('作品不存在'); return; }
    it.replies = it.replies || []; it.replies.push({ author: '玩家', content: text.trim(), time: '刚刚' });
    return 黄游写区(c.cat, 游戏名, '创意工坊', { list: list });
  }).then(function() { toast('✅ 已评论'); 黄游打开作品(id); });
};

window.黄游工坊标签筛选 = function(tab) {
  黄游工坊标签 = tab; var c = 黄游上下文();
  黄游读区(c.cat, c.name, '创意工坊').then(function(d) {
    var body = document.getElementById('yyCommBody'); if (body) body.innerHTML = 黄游工坊列表(c, (d && d.list) || []);
  });
};

window.黄游工坊排序 = function(sort) {
  黄游工坊排序 = sort; var c = 黄游上下文();
  黄游读区(c.cat, c.name, '创意工坊').then(function(d) {
    var list = (d && d.list) || [];
    if (sort === '订阅') list = list.slice().sort(function(a, b) { return (b.subs || 0) - (a.subs || 0); });
    else if (sort === '更新') list = list.slice().sort(function(a, b) { return (b.upd || 0) - (a.upd || 0); });
    var body = document.getElementById('yyCommBody'); if (body) body.innerHTML = 黄游工坊列表(c, list);
  });
};

window.黄游工坊搜索 = function() {
  黄游工坊搜索词 = (document.getElementById('yyWsSearch') || {}).value || '';
  var c = 黄游上下文();
  黄游读区(c.cat, c.name, '创意工坊').then(function(d) {
    var body = document.getElementById('yyCommBody'); if (body) body.innerHTML = 黄游工坊列表(c, (d && d.list) || []);
  });
};

window.黄游工坊创建 = function() {
  var body = document.getElementById('yyCommBody'); if (!body) return;
  body.innerHTML = '<div class="yy-post"><div class="yy-post-title">创建创意工坊作品</div><input class="yy-input" id="yyWsName" placeholder="作品名称" style="margin:10px 0"><input class="yy-input" id="yyWsAuthor" placeholder="作者名" style="margin-bottom:10px"><textarea class="yy-input" id="yyWsDesc" rows="5" placeholder="作品简介…"></textarea><div style="margin:10px 0"><span class="yy-btn blue" onclick="黄游工坊AI()">🤖 让 AI 生成</span></div><div><span class="yy-btn green" onclick="黄游工坊提交()">发布</span> <span class="yy-btn grey" onclick="黄游加载区数据()">取消</span></div></div>';
};

window.黄游工坊AI = function() {
  toast('🤖 正在根据本作信息生成工坊作品...');
  黄游社区AI生成('hybz_workshop_gen', function(d) {
    var n = (document.getElementById('yyWsName')); if (n && d.name) n.value = d.name;
    var s = (document.getElementById('yyWsDesc')); if (s && d.desc) s.value = d.desc;
    toast('✅ 已生成，可修改后发布');
  });
};

window.黄游工坊提交 = function() {
  var c = 黄游上下文(); var 游戏名 = c.name;
  var name = (document.getElementById('yyWsName') || {}).value || '';
  var author = (document.getElementById('yyWsAuthor') || {}).value || '';
  var desc = (document.getElementById('yyWsDesc') || {}).value || '';
  if (!name.trim()) { toast('请填写作品名称'); return; }
  黄游读区(c.cat, 游戏名, '创意工坊').then(function(d) {
    var list = (d && d.list) || [];
    list.push({ id: 'w' + Date.now(), name: name.trim(), author: author.trim() || '玩家', desc: desc.trim(), subs: 0, subscribed: false, favorited: false });
    return 黄游写区(c.cat, 游戏名, '创意工坊', { list: list });
  }).then(function() { toast('✅ 已发布'); 黄游加载区数据(); });
};
