// RunningHub API 服务 · 文生图 / 图生图
var RH = {};

// ===== 模型清单 =====
// 不预设任何生图模型：清单只由 设置 → 生图 API 的「🔄 获取可用模型」从 RunningHub 官方文档站
// （llms.txt 列模型 + 每个模型 .md 里取真实 endpoint）抓取，结果持久化到 settings，重启自动恢复
// （见 RH.dynamicT2i / RH.dynamicI2i 与 app.js 启动时的 RH.restoreDynamic）。
// 抓到的模型 id 就是官方 endpoint 路径（如 alibaba/qwen-image-2.0/text-to-image、youchuan/text-to-image-v7），
// 因此不需要再维护 endpoint 映射表，见 RH.buildEndpoint。

// ===== 常用尺寸 =====
// 按用途分组：风景（横屏为主）+ 人物（竖屏为主），每类 4 个常用项
RH.SIZE_PRESETS = [
  { label: '1280×720',  w: 1280, h: 720,  group: 'landscape' },
  { label: '1920×1080', w: 1920, h: 1080, group: 'landscape' },
  { label: '1536×1024', w: 1536, h: 1024, group: 'landscape' },
  { label: '1024×768',  w: 1024, h: 768,  group: 'landscape' },
  { label: '720×1280',  w: 720,  h: 1280, group: 'portrait' },
  { label: '1080×1920', w: 1080, h: 1920, group: 'portrait' },
  { label: '1024×1536', w: 1024, h: 1536, group: 'portrait' },
  { label: '768×1024',  w: 768,  h: 1024, group: 'portrait' },
];

// ===== 尺寸上限规则 =====
// 仅用于界面展示（设置页「可用模型参考」的最大尺寸列），不是模型清单：按 endpoint 关键词命中。
RH.SIZE_LIMIT_RULES = [
  { test: /seedream|rhart-image-g[-.]\d|text-to-image-pro/, maxW: 4096, maxH: 4096 },
];
RH.getModelLimits = function(modelId) {
  var id = String(modelId || '');
  for (var i = 0; i < RH.SIZE_LIMIT_RULES.length; i++) {
    if (RH.SIZE_LIMIT_RULES[i].test.test(id)) return { maxW: RH.SIZE_LIMIT_RULES[i].maxW, maxH: RH.SIZE_LIMIT_RULES[i].maxH };
  }
  return { maxW: 2048, maxH: 2048 };
};

// ===== 模型列表（只含官方抓取结果） =====
RH.allT2iModels = function() { return RH.dynamicT2i || []; };
RH.allI2iModels = function() { return RH.dynamicI2i || []; };

// 组合框候选：主文案＝厂商 · 名称，右侧灰色小字＝模型 id（endpoint 路径）
RH.modelOptions = function(models) {
  return (models || []).map(function(m) {
    return { value: m.id, label: (m.provider ? m.provider + ' · ' : '') + (m.name || m.id), meta: m.id };
  });
};

// ===== API 基础 =====
RH.BASE = 'https://www.runninghub.cn/openapi/v2';

RH.getApiKey = function() {
  return (S.settings && S.settings.runninghubApiKey) || '';
};

RH.buildEndpoint = function(modelId, suffix) {
  var id = String(modelId || '');
  // 官方抓取的模型 id 就是完整 endpoint 路径（含厂商前缀），直接使用
  if (id.indexOf('/') >= 0) return '/' + id;
  // 兜底：手输的短模型名 → /<模型名>/<后缀>
  return '/' + id + '/' + suffix;
};

RH.submitTask = function(endpoint, body) {
  var apiKey = RH.getApiKey();
  if (!apiKey) return Promise.reject(new Error('未配置 RunningHub API Key，请先在设置中配置'));
  return fetch(RH.BASE + endpoint, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then(function(r) {
    return r.json().then(function(json) {
      if (!r.ok) throw new Error('API 错误 ' + r.status + ': ' + JSON.stringify(json));
      // RunningHub v2 标准包装: { code, message, data }
      if (json.code !== undefined) {
        if (json.code !== 0) throw new Error('API 错误: ' + (json.message || JSON.stringify(json)));
        return json.data || json;
      }
      return json;
    });
  });
};

// ===== 文生图 =====
RH.textToImage = function(modelId, params) {
  var ep = RH.buildEndpoint(modelId, 'text-to-image');
  var body = {
    prompt: params.prompt,
    width: params.width || 1024,
    height: params.height || 1024,
    outputFormat: 'url',
  };
  // 悠船 v8.1/v8.2 服务端把 hd（是否开启原生 2K）列为必填，缺省会被校验拒绝
  if (/youchuan\/text-to-image-v8\d/.test(ep)) body.hd = false;
  if (params.negativePrompt) body.negative_prompt = params.negativePrompt;
  return RH.submitTask(ep, body);
};

// ===== 图片上传（本地文件 → RunningHub download_url） =====
// RunningHub 图生图要求 http(s) URL，本地选择的文件是 dataURL，需先上传
RH.uploadImage = function(dataUrl) {
  if (!/^data:image\//.test(dataUrl)) return Promise.resolve(dataUrl); // 已是外链直接返回
  var m = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.*)$/);
  if (!m) return Promise.reject(new Error('不支持的图片格式'));
  var apiKey = RH.getApiKey();
  if (!apiKey) return Promise.reject(new Error('未配置 RunningHub API Key'));
  if (!window.narrative || !window.narrative.rhUploadImage) return Promise.reject(new Error('主进程上传接口不可用'));
  return window.narrative.rhUploadImage(apiKey, m[2], m[1]).then(function(res) {
    if (!res || !res.ok) throw new Error((res && res.error) || '图片上传失败');
    return res.url;
  });
};

// ===== 图生图 =====
// RunningHub 标准协议：prompt + imageUrls（图片必须是 http(s) URL，本地文件经 uploadImage 转换）
RH.imageToImage = function(modelId, params) {
  var ep = RH.buildEndpoint(modelId, 'image-to-image');
  var body = {
    prompt: params.prompt,
    imageUrls: [params.imageUrl],
    width: params.width || 1024,
    height: params.height || 1024,
  };
  if (params.negativePrompt && !/\/edit/.test(ep)) body.negative_prompt = params.negativePrompt;
  return RH.submitTask(ep, body);
};

// ===== 查询任务状态 =====
RH.queryTask = function(taskId) {
  return RH.submitTask('/query', { taskId: taskId });
};

// ===== 轮询直到完成 =====
RH.waitForResult = function(taskId, onProgress) {
  return new Promise(function(resolve, reject) {
    var poll = function() {
      RH.queryTask(taskId).then(function(res) {
        if (res.status === 'SUCCESS') {
          resolve(res);
        } else if (res.status === 'FAILED' || res.errorCode) {
          reject(new Error(res.errorMessage || '任务失败 (错误码: ' + (res.errorCode || '?') + ')'));
        } else {
          if (onProgress) onProgress(res);
          setTimeout(poll, 2000);
        }
      }).catch(function(err) {
        reject(err);
      });
    };
    poll();
  });
};

// ===== 从 URL 加载图片为 dataURL =====
RH.fetchImageAsDataUrl = function(url) {
  return fetch(url).then(function(r) { return r.blob(); }).then(function(blob) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function() { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  });
};

// ===== 从官方文档站获取可用模型（主进程代理抓取，无 CORS 限制） =====
RH.dynamicT2i = [];
RH.dynamicI2i = [];

// 解析 llms.txt 中的模型条目: "模型API > 图像生成与处理 > text-to-image > 厂商 [模型名](文档url)"
RH.parseLlmEntries = function(text, suffix) {
  var out = [];
  var re = new RegExp('- .*?> ' + suffix + ' > ([^\\[]+)\\[([^\\]]+)\\]\\(https://www\\.runninghub\\.cn/runninghub-api-doc-cn/(api-\\d+)\\.md\\)', 'g');
  var m;
  while ((m = re.exec(text)) !== null) {
    out.push({
      category: m[1].trim(),
      title: m[2],
      docId: m[3],
      isT2i: suffix === 'text-to-image',
      isI2i: suffix === 'image-to-image',
    });
  }
  return out;
};

// 从模型 .md 文档提取 endpoint（第一个 /openapi/v2/ 下的路径，排除 /query）
RH.parseEndpointFromDoc = function(text) {
  var m = text.match(/\/openapi\/v2\/([A-Za-z0-9_\/.-]+?)(?=:|\s|`|$)/);
  if (!m) return null;
  var ep = m[1];
  return ep === 'query' ? null : ep;
};

// 文生图/图生图 endpoint 后缀（动态模型可能同名不同后缀，如 seedream-v5-pro-图生图）
RH.epSuffixOf = function(endpoint) {
  var m = endpoint.match(/(text-to-image|image-to-image)[^/]*$/);
  return m ? m[1] : null;
};
RH.epBaseOf = function(endpoint) {
  var s = RH.epSuffixOf(endpoint);
  return s ? endpoint.slice(0, endpoint.length - s.length) : endpoint;
};

// 抓取全部可用模型（llms.txt 一次拿列表，再逐条抓 .md 取 endpoint）
RH.fetchModels = function(onProgress) {
  var apiKey = RH.getApiKey();
  if (!apiKey) return Promise.reject(new Error('未配置 RunningHub API Key，请先在设置中配置'));
  return window.narrative.rhFetchDoc('/runninghub-api-doc-cn/llms.txt').then(function(r) {
    if (!r.ok) throw new Error('抓取模型列表失败: ' + r.error);
    var t2i = RH.parseLlmEntries(r.text, 'text-to-image');
    var i2i = RH.parseLlmEntries(r.text, 'image-to-image');
    var all = t2i.concat(i2i).filter(function(e) { return e.docId; });
    var total = all.length, done = 0;
    if (onProgress) onProgress(0, total, '解析模型列表…');
    return Promise.all(all.map(function(e) {
      return window.narrative.rhFetchDoc('/runninghub-api-doc-cn/' + e.docId + '.md').then(function(dr) {
        done++;
        if (onProgress) onProgress(done, total, e.title);
        if (!dr.ok) return null;
        var ep = RH.parseEndpointFromDoc(dr.text);
        if (!ep) return null;
        var name = e.title.replace(/[（(].*?[)）]/, '').trim() || e.category;
        return {
          title: e.title, name: name, category: e.category, docId: e.docId, endpoint: ep,
          isT2i: !!e.isT2i, isI2i: !!e.isI2i,
        };
      });
    })).then(function(results) {
      var models = results.filter(Boolean);
      // 按 endpoint 去重（同名同端点如 万相2.7 文生图/Pro）
      var seen = {};
      var uniq = [];
      models.forEach(function(x) {
        if (seen[x.endpoint]) return;
        seen[x.endpoint] = true;
        uniq.push(x);
      });
      // 分类按 llms.txt 层级判断（image-to-image 分类含 edit 变体）
      // topazlabs 放大/增强类（gigapixel/upscale/denoise）参数结构不同，排除
      var isTool = function(x) {
        return /topazlabs|图像放大|图像增强|upscale|gigapixel|denoise|image-effects/.test((x.category || '') + x.endpoint);
      };
      // RunningHub 文档站把部分文生图模型（如悠船 v6/v8.1）错挂到 image-to-image 分类，
      // 按 endpoint 语义二次纠正：含 text-to-image 的一律归文生图
      var byEndpoint = function(x) {
        var ep = x.endpoint;
        if (/text-to-image/.test(ep)) return { t2i: true, i2i: false };
        if (/image-to-image|image-edit|\/edit/.test(ep)) return { t2i: false, i2i: true };
        return { t2i: !!x.isT2i, i2i: !!x.isI2i };
      };
      return {
        t2i: uniq.filter(function(x) { var c = byEndpoint(x); return (x.isT2i || c.t2i) && !isTool(x); }),
        i2i: uniq.filter(function(x) { var c = byEndpoint(x); return (x.isI2i && c.i2i) && !isTool(x); }),
        total: total,
      };
    });
  });
};

// 合并动态模型到模型表（endpoint 已有则跳过）
RH.mergeDynamic = function(list, dynamic) {
  var existing = {};
  list.forEach(function(x) { existing[x.id] = true; });
  dynamic.forEach(function(x) {
    if (existing[x.endpoint]) return;
    existing[x.endpoint] = true;
    list.push({ id: x.endpoint, name: x.name, provider: RH.vendorOf(x.category), endpointSuffix: undefined, dynamic: true });
  });
  return list;
};

// ===== 动态模型持久化（重启后自动恢复，无需重新抓取） =====
RH.toDiskModels = function(dynamic) {
  return dynamic.map(function(x) {
    return { id: x.id, name: x.name, provider: x.provider, docId: x.docId };
  });
};
RH.fromDiskModels = function(list) {
  return (list || []).filter(function(x) { return x && x.id; }).map(function(x) {
    return { id: x.id, name: x.name || x.id, provider: x.provider || 'RH', docId: x.docId, endpointSuffix: undefined, dynamic: true };
  });
};
// 保存动态模型到 settings（磁盘持久化，重启后 restoreDynamic 恢复）
RH.persistDynamic = function() {
  if (!S || !S.settings) return;
  S.settings.runninghubDynamicT2i = RH.toDiskModels(RH.dynamicT2i);
  S.settings.runninghubDynamicI2i = RH.toDiskModels(RH.dynamicI2i);
  if (typeof 保存设置 === 'function') 保存设置(S.settings);
};
// 启动时从 settings 恢复动态模型（无网络请求，瞬间可用）
RH.restoreDynamic = function() {
  if (!S || !S.settings) return;
  var cleaned = false;
  if (S.settings.runninghubDynamicT2i && S.settings.runninghubDynamicT2i.length) {
    RH.dynamicT2i = RH.fromDiskModels(S.settings.runninghubDynamicT2i);
  }
  if (S.settings.runninghubDynamicI2i && S.settings.runninghubDynamicI2i.length) {
    // 过滤文档站错挂分类的旧数据（如悠船 v6/v8.1 实为文生图）
    var before = S.settings.runninghubDynamicI2i.length;
    RH.dynamicI2i = RH.fromDiskModels(S.settings.runninghubDynamicI2i).filter(function(x) {
      return !/text-to-image/.test(x.id);
    });
    if (RH.dynamicI2i.length !== before) cleaned = true;
  }
  // 若磁盘上是脏数据（恢复后有剔除），回写干净列表
  if (cleaned) RH.persistDynamic();
};

RH.vendorOf = function(category) {
  var map = [
    ['seedream', 'MiniMax'], ['万相', '阿里'], ['千问', '阿里'], ['qwen', '阿里'], ['悠船', '优船'],
    ['即梦', '字节'], ['jimeng', '字节'], ['全能图片', 'RH'], ['全能视频', 'RH'],
    ['topazlabs', 'Topaz'], ['可灵', '快手'], ['kling', '快手'], ['海螺', 'MiniMax'],
  ];
  for (var i = 0; i < map.length; i++) {
    if (category.indexOf(map[i][0]) >= 0) return map[i][1];
  }
  return 'RH';
};

// ===== 保存图片到本地 =====
RH.saveImage = function(url, filename) {
  // 通过 Electron 的下载功能
  var a = document.createElement('a');
  a.href = url;
  a.download = filename || 'generated_' + Date.now() + '.png';
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  setTimeout(function() { document.body.removeChild(a); }, 100);
};

window.RH = RH;
