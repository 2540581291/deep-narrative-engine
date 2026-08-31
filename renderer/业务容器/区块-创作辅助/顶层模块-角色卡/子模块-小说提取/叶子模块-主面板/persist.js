// 深度-叙事引擎 · 角色卡 · 📖 小说提取 · 数据持久化
// 加载文件、保存/加载/删除记录、重置、选中、视图切换

// ===== 加载文件 =====
window.小说提取加载文件 = function(file) {
  if (!file) return;
  if (!file.name.toLowerCase().endsWith('.txt')) { toast('请选择 .txt 格式文件'); return; }
  var reader = new FileReader();
  reader.onload = function(e) {
    var bytes = new Uint8Array(e.target.result);
    // 先用 UTF-8 解码
    var decoder = new TextDecoder('UTF-8', { fatal: false });
    var text = decoder.decode(bytes);
    // 如果有替换字符 �（U+FFFD），说明不是 UTF-8，尝试 GBK
    if (text.indexOf('�') >= 0) {
      try {
        var gbkDecoder = new TextDecoder('GBK', { fatal: false });
        var gbkText = gbkDecoder.decode(bytes);
        // 如果 GBK 解码后没有替换字符，就用 GBK 结果
        if (gbkText.indexOf('�') < 0) {
          text = gbkText;
          console.log('小说提取：检测到 GBK 编码，已自动转换');
        }
      } catch(e) {
        console.warn('GBK 解码失败，保留 UTF-8 结果', e);
      }
    }
    // 直接存入原始文本，不走 textarea 中转
    小说提取原始文本 = text;
    // 用文件名作为记录标题
  小说提取当前记录标题 = file.name.replace(/.txt$/i, '');
    // 同时填入 textarea 方便用户查看/修改开头
    var ta = document.getElementById('novelPasteArea');
    if (ta) ta.value = text.length > 50000 ? text.substring(0, 50000) + '\n\n……[剩余 ' + (text.length - 50000) + ' 字已直接读入内存，点击分析即可处理全文]' : text;
    toast('✅ 已加载: ' + file.name + ' (' + text.length + ' 字)');
  };
  reader.readAsArrayBuffer(file);
};

// ===== 重新上传（重置） =====
window.小说提取重置 = function() {
  if (小说提取角色列表.length > 0 && !confirm('当前已有 ' + 小说提取角色列表.length + ' 个角色，重置将丢失全部已提取数据。确定重新上传？')) return;
  小说提取步骤 = 'upload';
  小说提取角色列表 = [];
  小说提取角色描述 = {};
  小说提取生成中 = {};
  小说提取审查进度 = null;
  小说提取展开角色 = {};
  小说提取当前记录ID = null;
  小说提取当前记录标题 = '';
  小说提取当前记录时间 = null;
  刷新视图();
};

// ===== 删除角色（普通角色或阶段角色） =====
window.小说提取删除角色 = function(name, isStage) {
  if (!confirm('确认删除「' + name + '」？')) return;

  if (isStage) {
    // 阶段角色：从阶段独立文件 _stages_<父>.json 的 stages 数组中移除该阶段
    var dashIdx = name.indexOf('-');
    if (dashIdx > 0) {
      var baseName = name.substring(0, dashIdx);
      var stageName = name.substring(dashIdx + 1);
      if (小说提取阶段数据[baseName]) {
        小说提取阶段数据[baseName] = 小说提取阶段数据[baseName].filter(function(s) { return s.name !== stageName; });
        小说提取保存阶段文件(baseName, { sourceCharacter: baseName, stages: 小说提取阶段数据[baseName] });
      }
    }
  } else {
    // 普通角色：从列表中移除，同时清理其阶段数据（独立文件 + 内存）
    var char = null;
    小说提取角色列表.forEach(function(c) { if (c.name === name) char = c; });
    if (char && 小说提取阶段数据[char.name]) {
      小说提取阶段数据[char.name].forEach(function(s) {
        var sn = char.name + '-' + s.name;
        delete 小说提取角色描述[sn];
      });
      delete 小说提取阶段数据[char.name];
    }
    小说提取角色列表 = 小说提取角色列表.filter(function(c) { return c.name !== name; });
    delete 小说提取展开角色[name];
  }

  delete 小说提取角色描述[name];
  // 从磁盘删除角色文件（阶段角色删除时父角色文件不动；普通角色删除时一并删阶段文件）
  if (小说提取当前记录ID) {
    var _folderName = 本地FS.清理(小说提取当前记录标题) || 小说提取当前记录ID;
    var _delPath = 小说提取存储基路径 + _folderName + "/" + 本地FS.清理(name) + ".json";
    LocalFS.delete(_delPath).then(function() {
      // 普通角色删除时顺带删其阶段独立文件
      if (!isStage) {
        var _stagePath = 小说提取存储基路径 + _folderName + "/_stages_" + 本地FS.清理(name) + ".json";
        LocalFS.delete(_stagePath).catch(function() {});
      }
      // 删除角色后实时重算该书 genders
      return 小说提取重算genders(小说提取存储基路径 + _folderName + "/");
    }).catch(function(e) { console.warn("文件删除失败:", e); });
  }
  刷新视图();
  toast('已删除「' + name + '」');
};

// ===== 历史提取 · 持久化 =====

function 小说提取扫描目录() {
  return LocalFS.list(小说提取存储基路径).then(function(entries) {
    var items = [];
    var pending = [];
    entries.forEach(function(e) {
      if (!e.isDir) return;
      pending.push(
        LocalFS.readJSON(小说提取存储基路径 + e.name + '/_meta.json')
          .then(function(meta) {
            if (!meta) return;
            // 从磁盘统计角色文件数
            return LocalFS.list(小说提取存储基路径 + e.name + "/").then(function(files) {
              var charCount = files.filter(function(f) { return f.name.endsWith(".json") && f.name !== "_meta.json" && f.name !== "_progress.json" && f.name.indexOf("_fullExtract_") !== 0 && f.name.indexOf("_stages_") !== 0; }).length;
              items.push({
                id: meta.id,
                title: meta.title,
                folderName: e.name,
                createdAt: meta.createdAt,
                charCount: charCount,
                textLength: meta.textLength || 0,
                completed: meta.completed !== false,
                category: meta.category || null,
                genders: meta.genders || []
              });
            });
          })
          .catch(function() {})
      );
    });
    return Promise.all(pending).then(function() {
      items.sort(function(a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
      window._小说提取历史列表 = items;
      return items;
    });
  });
}

function 构建角色数据(c) {
  var charData = {
    name: c.name,
    gender: c.gender,
    role: c.role,
    brief: c.brief || null
  };
  var fields = 小说提取正文段字段;
  fields.forEach(function(f) {
    charData[f] = c[f] || null;
  });
  // 阶段数据已独立存 _stages_<父>.json，角色文件不再含 _lifeStages / _stageDescriptions
  if (小说提取角色描述[c.name]) {
    charData.description = 小说提取角色描述[c.name];
  }
  charData.relatedPassages = 提取角色相关段落(小说提取原始文本, c.name, 5000);
  return charData;
}

// 重算某本书的 genders 并写回 _meta.json（角色改动后实时同步历史面板性别徽标）
function 小说提取重算genders(folderPath) {
  return LocalFS.list(folderPath).then(function(files) {
    var genders = {};
    var jsonFiles = files.filter(function(f) {
      return f.name.endsWith('.json') && f.name !== '_meta.json' && f.name !== '_progress.json' && f.name.indexOf('_fullExtract_') !== 0 && f.name.indexOf('_stages_') !== 0;
    });
    return Promise.all(jsonFiles.map(function(f) {
      return LocalFS.readJSON(folderPath + f.name).then(function(c) {
        if (!c) return;
        if (c.gender) genders[小说提取规范化性别(c.gender)] = true;
      }).catch(function() {});
    })).then(function() {
      // 阶段文件的性别统计（独立文件 _stages_<父>.json）
      return LocalFS.list(folderPath).then(function(files) {
        var stageFiles = files.filter(function(f) { return f.name.indexOf("_stages_") === 0 && f.name.endsWith(".json"); });
        return Promise.all(stageFiles.map(function(f) {
          return LocalFS.readJSON(folderPath + f.name).then(function(sd) {
            if (!sd || !sd.stages) return;
            sd.stages.forEach(function(s) {
              if (s.fields && s.fields.gender) genders[小说提取规范化性别(s.fields.gender)] = true;
            });
          }).catch(function() {});
        }));
      });
    }).then(function() {
      return LocalFS.readJSON(folderPath + '_meta.json').then(function(meta) {
        if (!meta) return;
        meta.genders = Object.keys(genders);
        return LocalFS.saveJSON(folderPath + '_meta.json', meta);
      });
    });
  }).catch(function() {});
}

// ===== 时间线阶段文件（单文件存全部阶段，类似 _progress.json 模式） =====

function 小说提取阶段文件路径(父角色名) {
  var folderName = 本地FS.清理(小说提取当前记录标题) || 小说提取当前记录ID;
  return 小说提取存储基路径 + folderName + '/_stages_' + 本地FS.清理(父角色名) + '.json';
}

function 小说提取保存阶段文件(父角色名, data) {
  return LocalFS.saveJSON(小说提取阶段文件路径(父角色名), data);
}

function 小说提取读取阶段文件(父角色名) {
  return LocalFS.readJSON(小说提取阶段文件路径(父角色名)).then(function(data) {
    return (data && data.stages) ? data : null;
  }).catch(function() { return null; });
}

// 只保存单个角色的文件（不写 _meta.json、不写其他角色），用于删除/改级别/重命名等单点变更
function 小说提取保存单个角色(c) {
  if (!c || !c.name) return Promise.resolve();
  if (!小说提取当前记录ID) {
    小说提取当前记录ID = 'ext_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    小说提取当前记录时间 = Date.now();
  }
  var title = 小说提取当前记录标题;
  if (!title) {
    title = (小说提取原始文本 || '').substring(0, 40).replace(/\n/g, ' ').trim() || '未命名小说';
  }
  小说提取当前记录标题 = title;

  var folderName = 本地FS.清理(title) || 小说提取当前记录ID;
  var folderPath = 小说提取存储基路径 + folderName + '/';

  var safeName = 本地FS.清理(c.name) || c.name;
  return LocalFS.saveJSON(folderPath + safeName + '.json', 构建角色数据(c)).then(function() {
    // 角色改动后实时重算该书 genders，保证历史面板性别徽标与角色文件一致
    return 小说提取重算genders(folderPath);
  });
}

function 小说提取保存当前记录() {
  if (!小说提取当前记录ID) {
    小说提取当前记录ID = 'ext_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    小说提取当前记录时间 = Date.now();
  }
  var title = 小说提取当前记录标题;
  if (!title) {
    title = (小说提取原始文本 || '').substring(0, 40).replace(/\n/g, ' ').trim() || '未命名小说';
  }
  小说提取当前记录标题 = title;

  var folderName = 本地FS.清理(title) || 小说提取当前记录ID;
  var folderPath = 小说提取存储基路径 + folderName + '/';

  // 统计记录包含的性别集合（用于历史面板性别筛选）
  var genders = {};
  小说提取角色列表.forEach(function(c) {
    if (c.gender) genders[小说提取规范化性别(c.gender)] = true;
  });
  // 阶段角色也计入（阶段数据来自独立文件）
  小说提取角色列表.forEach(function(c) {
    var cStages = 小说提取阶段数据[c.name];
    if (cStages) {
      cStages.forEach(function(s) {
        if (s.fields && s.fields.gender) genders[小说提取规范化性别(s.fields.gender)] = true;
      });
    }
  });

  var meta = {
    id: 小说提取当前记录ID,
    title: title,
    createdAt: 小说提取当前记录时间,
    textLength: (小说提取原始文本 || '').length,
    completed: 小说提取步骤 === 'result',
    category: null, // 分类在提取后单独设置
    genders: Object.keys(genders)
  };
  // 保留已有分类：加载过/设置过的分类不因分段保存被覆盖
  try {
    var _existing = LocalFS.readJSONSync(folderPath + '_meta.json');
    if (_existing && _existing.category) meta.category = _existing.category;
  } catch(e) {}

  var savePromises = 小说提取角色列表.map(function(c) {
    var safeName = 本地FS.清理(c.name) || c.name;
    return LocalFS.saveJSON(folderPath + safeName + '.json', 构建角色数据(c));
  });

  // 全文独立存储，避免 _meta.json 被全文撑大导致历史扫描全量解析
  savePromises.push(LocalFS.saveText(folderPath + 'fulltext.txt', 小说提取原始文本 || ''));
  savePromises.push(LocalFS.saveJSON(folderPath + '_meta.json', meta));

  return Promise.all(savePromises);
}
