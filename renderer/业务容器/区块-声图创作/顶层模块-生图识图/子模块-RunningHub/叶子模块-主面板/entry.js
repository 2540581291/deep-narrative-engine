// RunningHub API 服务 · 文生图 / 图生图
var RH = {};

// ===== 模型定义 =====
RH.T2I_MODELS = [
  { id: 'seedream-v4', name: 'Seedream v4', provider: 'MiniMax', maxW: 4096, maxH: 4096 },
  { id: 'seedream-v4.5', name: 'Seedream v4.5', provider: 'MiniMax', maxW: 4096, maxH: 4096 },
  { id: 'seedream-v5-lite', name: 'Seedream v5 Lite', provider: 'MiniMax', maxW: 4096, maxH: 4096 },
  { id: 'rhart-image-x-official', name: '全能图片X', provider: 'RH', maxW: 2048, maxH: 2048 },
  { id: 'rhart-image-v1-official', name: '全能图片V1', provider: 'RH', maxW: 2048, maxH: 2048 },
  { id: 'rhart-image-n-pro-official', name: '全能图片PRO', provider: 'RH', maxW: 2048, maxH: 2048 },
  { id: 'rhart-image-g-1.5-official', name: '全能图片G1.5', provider: 'RH', maxW: 4096, maxH: 4096 },
  { id: 'rhart-image-g-2-official', name: '全能图片G2', provider: 'RH', maxW: 4096, maxH: 4096 },
  { id: 'alibaba/qwen-image-2.0', name: '千问 2.0', provider: '阿里', maxW: 2048, maxH: 2048 },
  { id: 'alibaba/qwen-image-2.0-pro', name: '千问 2.0 Pro', provider: '阿里', maxW: 2048, maxH: 2048 },
  { id: 'alibaba/wan-2.5-preview', name: '万相 2.5 Preview', provider: '阿里', maxW: 2048, maxH: 2048 },
  { id: 'alibaba/wan-2.7', name: '万相 2.7', provider: '阿里', maxW: 2048, maxH: 2048 },
  { id: 'alibaba/wan-2.7', name: '万相 2.7 Pro', provider: '阿里', maxW: 4096, maxH: 4096, endpointSuffix: 'text-to-image-pro' },
  { id: 'bytedance/jimeng-4.6', name: '即梦 4.6', provider: '字节', maxW: 2048, maxH: 2048 },
];
// 悠船系列
RH.YOUCHUAN_T2I = [
  { id: 'youchuan/v6', name: '悠船 v6', provider: '优船', endpointSuffix: 'text-to-image-v6' },
  { id: 'youchuan/v61', name: '悠船 v61', provider: '优船', endpointSuffix: 'text-to-image-v61' },
  { id: 'youchuan/v7', name: '悠船 v7', provider: '优船', endpointSuffix: 'text-to-image-v7' },
  { id: 'youchuan/niji6', name: '悠船 Niji 6', provider: '优船', endpointSuffix: 'text-to-image-niji6' },
  { id: 'youchuan/niji7', name: '悠船 Niji 7', provider: '优船', endpointSuffix: 'text-to-image-niji7' },
];

RH.I2I_MODELS = [
  { id: 'seedream-v4', name: 'Seedream v4', provider: 'MiniMax' },
  { id: 'seedream-v4.5', name: 'Seedream v4.5', provider: 'MiniMax' },
  { id: 'seedream-v5-lite', name: 'Seedream v5 Lite', provider: 'MiniMax' },
  { id: 'rhart-image-x-official', name: '全能图片X', provider: 'RH' },
  { id: 'rhart-image-v1-official', name: '全能图片V1', provider: 'RH' },
  { id: 'rhart-image-n-pro-official', name: '全能图片PRO', provider: 'RH' },
  { id: 'rhart-image-g-1.5-official', name: '全能图片G1.5', provider: 'RH' },
  { id: 'rhart-image-g-2-official', name: '全能图片G2', provider: 'RH' },
  { id: 'alibaba/qwen-image-2.0', name: '千问 2.0', provider: '阿里' },
  { id: 'alibaba/qwen-image-2.0-pro', name: '千问 2.0 Pro', provider: '阿里' },
  { id: 'alibaba/wan-2.5-preview', name: '万相 2.5 Preview', provider: '阿里' },
  { id: 'alibaba/wan-2.7', name: '万相 2.7', provider: '阿里' },
  { id: 'bytedance/jimeng-4.6', name: '即梦 4.6', provider: '字节' },
];
// 悠系列图生图
RH.YOUCHUAN_I2I = [
  { id: 'youchuan/v6', name: '悠船 v6', provider: '优船', endpointSuffix: 'image-to-image-v6' },
  { id: 'youchuan/v61', name: '悠船 v61', provider: '优船', endpointSuffix: 'image-to-image-v61' },
  { id: 'youchuan/v7', name: '悠船 v7', provider: '优船', endpointSuffix: 'image-to-image-v7' },
];

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

// ===== 尺寸限制（按模型） =====
RH.getModelLimits = function(modelId) {
  var all = RH.T2I_MODELS.concat(RH.YOUCHUAN_T2I);
  for (var i = 0; i < all.length; i++) {
    if (all[i].id === modelId) return { maxW: all[i].maxW || 2048, maxH: all[i].maxH || 2048 };
  }
  return { maxW: 2048, maxH: 2048 };
};

// ===== 模型合并（静态 + 动态获取的） =====
RH.allT2iModels = function() { return RH.T2I_MODELS.concat(RH.YOUCHUAN_T2I).concat(RH.dynamicT2i); };
RH.allI2iModels = function() { return RH.I2I_MODELS.concat(RH.YOUCHUAN_I2I).concat(RH.dynamicI2i); };

// ===== API 基础 =====
RH.BASE = 'https://www.runninghub.cn/openapi/v2';

RH.getApiKey = function() {
  return (S.settings && S.settings.runninghubApiKey) || '';
};

RH.buildEndpoint = function(modelId, suffix) {
  // 部分模型有自定义 endpoint
  var all = RH.T2I_MODELS.concat(RH.YOUCHUAN_T2I).concat(RH.I2I_MODELS).concat(RH.YOUCHUAN_I2I);
  for (var i = 0; i < all.length; i++) {
    if (all[i].id === modelId && all[i].endpointSuffix) {
      // youchuan 的 endpoint 格式: /openapi/v2/youchuan/text-to-image-v6
      var parts = modelId.split('/');
      return '/' + parts[0] + '/' + all[i].endpointSuffix;
    }
  }
  // 动态获取的模型: id 即为完整 endpoint 路径
  if (modelId.indexOf('/') >= 0) return '/' + modelId;
  return '/' + modelId + '/' + suffix;
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
