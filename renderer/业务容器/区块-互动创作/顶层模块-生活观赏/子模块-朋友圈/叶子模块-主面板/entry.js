// ============================================================
// 生活观赏 · 朋友圈动态（微信朋友圈 / QQ空间；发动态、点赞、评论）
// ============================================================
// 内容结构：{ platform, posts: [ { author, time, text, likes, comments:[{author,text}] } ] }
// 说明：通用字段写入 生活观赏设 已统一放在「主界面」入口，此处直接使用 window.生活观赏设

// 平台固定选项
var 生活观赏朋友圈平台表 = ['微信朋友圈', 'QQ空间'];
window.生活观赏朋友圈平台表 = 生活观赏朋友圈平台表;

// 渲染朋友圈（editable=true 时呈现可编辑表单）
function 生活观赏渲染朋友圈(el, content, editable) {
  if (!content) content = 生活观赏内容;
  if (!content || !content.posts) { el.innerHTML = '<div class="placeholder-text">暂无动态内容</div>'; return; }
  var posts = content.posts || [];
  var platform = (typeof 生活观赏朋友圈平台表 !== 'undefined' && 生活观赏朋友圈平台表.indexOf(content.platform || '') >= 0) ? content.platform : '微信朋友圈';
  var h = '';
  // 平台选择 / 徽章
  if (editable) {
    h += '<div class="flex gap-6 items-center mb-8">';
    h += '<span class="fs-11 c-fg2">平台</span><select class="llm-input llm-select" style="width:140px" onchange="生活观赏朋友圈设平台(this.value)">';
    生活观赏朋友圈平台表.forEach(function(p) {
      h += '<option value="' + p + '"' + (p === platform ? ' selected' : '') + '>' + p + '</option>';
    });
    h += '</select></div>';
  } else {
    h += '<div class="mb-8"><span class="badge-tag">' + escHtml(platform) + '</span></div>';
  }
  if (!posts.length) h += '<div class="placeholder-text">暂无动态</div>';
  posts.forEach(function(p, pi) {
    var bi = 生活观赏角色查找(p.author);
    var icon = (bi && bi.icon) || '👤';
    h += '<div style="border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px;background:var(--bg2)">';
    // 作者行
    h += '<div class="flex items-center gap-6 mb-6">';
    h += '<div style="width:34px;height:34px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">' + icon + '</div>';
    if (editable) {
      h += '<input class="llm-input" style="flex:1;height:26px;font-size:11px" value="' + escHtml(p.author || '') + '" placeholder="发布者" oninput="生活观赏设(\'posts.' + pi + '.author\', this.value)">';
    } else {
      h += '<span class="fw-600 fs-13">' + escHtml(p.author || '') + '</span>';
    }
    if (editable) {
      h += '<input class="llm-input" style="width:110px;height:26px;font-size:11px" value="' + escHtml(p.time || '') + '" placeholder="时间" oninput="生活观赏设(\'posts.' + pi + '.time\', this.value)">';
    } else if (p.time) {
      h += '<span class="fs-11 c-fg3">' + escHtml(p.time) + '</span>';
    }
    if (editable) h += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="生活观赏朋友圈删动态(' + pi + ')">✕ 删除</span>';
    h += '</div>';
    // 正文
    if (editable) {
      h += '<textarea class="llm-input" style="width:100%;min-height:56px;resize:vertical;margin-bottom:6px" placeholder="动态正文" oninput="生活观赏设(\'posts.' + pi + '.text\', this.value)">' + escHtml(p.text || '') + '</textarea>';
    } else {
      h += '<div style="font-size:13px;line-height:1.6;white-space:pre-wrap;margin-bottom:6px">' + escHtml(p.text || '') + '</div>';
    }
    // 点赞
    h += '<div class="flex items-center gap-6 mb-6">';
    h += '<span class="fs-11 c-fg2">❤️ ';
    if (editable) h += '<input class="llm-input" style="width:56px;height:24px;font-size:11px;display:inline-block" type="number" value="' + escHtml(p.likes) + '" oninput="生活观赏设(\'posts.' + pi + '.likes\', this.value)">';
    else h += escHtml(p.likes != null ? p.likes : 0);
    h += '</span>';
    h += '<span class="fs-11 c-fg2">💬 ' + ((p.comments || []).length) + ' 条评论</span>';
    if (editable) h += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="生活观赏朋友圈加评论(' + pi + ')">＋ 评论</span>';
    h += '</div>';
    // 评论（多层：评论 + 互相回复的对话链路）
    var comments = p.comments || [];
    if (comments.length || editable) {
      h += '<div style="border-top:1px solid var(--border);padding-top:6px">';
      comments.forEach(function(c, ci) {
        h += '<div class="mb-4">';
        // 顶层评论
        h += '<div class="flex items-center gap-4 mb-2">';
        if (editable) {
          h += '<input class="llm-input" style="flex:1;height:24px;font-size:11px" value="' + escHtml(c.author || '') + '" placeholder="评论者" oninput="生活观赏设(\'posts.' + pi + '.comments.' + ci + '.author\', this.value)">';
          h += '<input class="llm-input" style="width:90px;height:24px;font-size:11px" value="' + escHtml(c.time || '') + '" placeholder="时间" oninput="生活观赏设(\'posts.' + pi + '.comments.' + ci + '.time\', this.value)">';
          h += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="生活观赏朋友圈删评论(' + pi + ',' + ci + ')">✕</span>';
        } else {
          h += '<span class="fs-12" style="color:var(--accent);font-weight:600;flex-shrink:0">' + escHtml(c.author || '') + '</span>';
          if (c.time) h += '<span class="fs-10 c-fg3">' + escHtml(c.time) + '</span>';
        }
        h += '</div>';
        if (editable) {
          h += '<input class="llm-input" style="width:100%;height:24px;font-size:11px;margin-bottom:4px" value="' + escHtml(c.text || '') + '" placeholder="评论内容" oninput="生活观赏设(\'posts.' + pi + '.comments.' + ci + '.text\', this.value)">';
          h += '<span class="btn-out btn-sm" style="font-size:10px" onclick="生活观赏朋友圈加回复(' + pi + ',' + ci + ')">＋ 回复</span>';
        } else {
          h += '<div class="fs-12" style="line-height:1.6;margin-bottom:4px">' + escHtml(c.text || '') + '</div>';
        }
        // 回复链路
        var replies = c.replies || [];
        replies.forEach(function(r, ri) {
          h += '<div class="flex items-center gap-4 mb-2" style="margin-left:14px;border-left:2px solid var(--border);padding-left:8px">';
          if (editable) {
            h += '<input class="llm-input" style="flex:1;height:22px;font-size:10px" value="' + escHtml(r.author || '') + '" placeholder="回复者" oninput="生活观赏设(\'posts.' + pi + '.comments.' + ci + '.replies.' + ri + '.author\', this.value)">';
            h += '<input class="llm-input" style="width:80px;height:22px;font-size:10px" value="' + escHtml(r.replyTo || '') + '" placeholder="回复谁" oninput="生活观赏设(\'posts.' + pi + '.comments.' + ci + '.replies.' + ri + '.replyTo\', this.value)">';
            h += '<input class="llm-input" style="flex:2;height:22px;font-size:10px" value="' + escHtml(r.text || '') + '" placeholder="回复内容" oninput="生活观赏设(\'posts.' + pi + '.comments.' + ci + '.replies.' + ri + '.text\', this.value)">';
            h += '<span class="btn-secondary btn-sm" style="font-size:10px" onclick="生活观赏朋友圈删回复(' + pi + ',' + ci + ',' + ri + ')">✕</span>';
          } else {
            h += '<span class="fs-11" style="color:var(--accent);font-weight:600;flex-shrink:0">' + escHtml(r.author || '') + '</span>';
            h += '<span class="fs-11" style="flex:1;line-height:1.6">' + (r.replyTo ? '<span style="color:var(--fg3)">回复 @' + escHtml(r.replyTo) + '：</span>' : '') + escHtml(r.text || '') + '</span>';
          }
          h += '</div>';
        });
        h += '</div>';
      });
      if (!comments.length) h += '<div class="fs-11 c-fg3">暂无评论 — 点「＋ 评论」添加</div>';
      h += '</div>';
    }
    h += '</div>';
  });
  if (editable) {
    h += '<button class="btn-secondary btn-sm" style="font-size:11px" onclick="生活观赏朋友圈加动态()">＋ 添加一条动态</button>';
  }
  el.innerHTML = h;
}
window.生活观赏渲染朋友圈 = 生活观赏渲染朋友圈;

// 设置朋友圈平台
function 生活观赏朋友圈设平台(v) {
  if (生活观赏内容) 生活观赏内容.platform = v;
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染内容(el, 生活观赏内容, true);
}
window.生活观赏朋友圈设平台 = 生活观赏朋友圈设平台;

// 在阵容中查找角色图标
function 生活观赏角色查找(name) {
  for (var i = 0; i < 生活观赏角色.length; i++) {
    if (生活观赏角色[i].name === name) {
      var bi = (生活观赏角色[i].data && 生活观赏角色[i].data.identity && 生活观赏角色[i].data.identity.basicInfo) || {};
      return bi;
    }
  }
  return null;
}
window.生活观赏角色查找 = 生活观赏角色查找;

// 填充：AI 返回的 JSON → 生活观赏内容
function 生活观赏填充朋友圈(d) {
  var posts = (d && Array.isArray(d.posts)) ? d.posts : [];
  var platform = (d && 生活观赏朋友圈平台表.indexOf(d.platform) >= 0) ? d.platform : '微信朋友圈';
  生活观赏内容 = {
    platform: platform,
    posts: posts.map(function(p) {
      return {
        author: p.author || '',
        time: p.time || '',
        text: p.text || '',
        likes: (p.likes != null ? p.likes : 0),
        comments: (Array.isArray(p.comments) ? p.comments : []).map(function(c) {
          return {
            author: c.author || '',
            time: c.time || '',
            text: c.text || '',
            replies: (Array.isArray(c.replies) ? c.replies : []).map(function(r) {
              return { author: r.author || '', time: r.time || '', text: r.text || '', replyTo: r.replyTo || '' };
            }),
          };
        }),
      };
    }),
  };
}
window.生活观赏填充朋友圈 = 生活观赏填充朋友圈;

// 编辑操作
function 生活观赏朋友圈加动态() {
  if (!生活观赏内容) 生活观赏内容 = { platform: '微信朋友圈', posts: [] };
  if (!生活观赏内容.posts) 生活观赏内容.posts = [];
  生活观赏内容.posts.push({ author: '', time: '', text: '', likes: 0, comments: [] });
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染朋友圈(el, 生活观赏内容, true);
}
window.生活观赏朋友圈加动态 = 生活观赏朋友圈加动态;

function 生活观赏朋友圈删动态(pi) {
  if (!生活观赏内容 || !生活观赏内容.posts) return;
  生活观赏内容.posts.splice(pi, 1);
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染朋友圈(el, 生活观赏内容, true);
}
window.生活观赏朋友圈删动态 = 生活观赏朋友圈删动态;

function 生活观赏朋友圈加评论(pi) {
  if (!生活观赏内容 || !生活观赏内容.posts || !生活观赏内容.posts[pi]) return;
  if (!生活观赏内容.posts[pi].comments) 生活观赏内容.posts[pi].comments = [];
  生活观赏内容.posts[pi].comments.push({ author: '', time: '', text: '', replies: [] });
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染朋友圈(el, 生活观赏内容, true);
}
window.生活观赏朋友圈加评论 = 生活观赏朋友圈加评论;

function 生活观赏朋友圈删评论(pi, ci) {
  if (!生活观赏内容 || !生活观赏内容.posts || !生活观赏内容.posts[pi] || !生活观赏内容.posts[pi].comments) return;
  生活观赏内容.posts[pi].comments.splice(ci, 1);
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染朋友圈(el, 生活观赏内容, true);
}
window.生活观赏朋友圈删评论 = 生活观赏朋友圈删评论;

// 在评论下添加一条回复（可逐层延伸）
function 生活观赏朋友圈加回复(pi, ci) {
  if (!生活观赏内容 || !生活观赏内容.posts || !生活观赏内容.posts[pi] || !生活观赏内容.posts[pi].comments || !生活观赏内容.posts[pi].comments[ci]) return;
  var c = 生活观赏内容.posts[pi].comments[ci];
  if (!c.replies) c.replies = [];
  c.replies.push({ author: '', time: '', text: '', replyTo: c.author || '' });
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染朋友圈(el, 生活观赏内容, true);
}
window.生活观赏朋友圈加回复 = 生活观赏朋友圈加回复;

function 生活观赏朋友圈删回复(pi, ci, ri) {
  if (!生活观赏内容 || !生活观赏内容.posts || !生活观赏内容.posts[pi] || !生活观赏内容.posts[pi].comments || !生活观赏内容.posts[pi].comments[ci]) return;
  生活观赏内容.posts[pi].comments[ci].replies.splice(ri, 1);
  var el = document.getElementById('loContent');
  if (el) 生活观赏渲染朋友圈(el, 生活观赏内容, true);
}
window.生活观赏朋友圈删回复 = 生活观赏朋友圈删回复;
