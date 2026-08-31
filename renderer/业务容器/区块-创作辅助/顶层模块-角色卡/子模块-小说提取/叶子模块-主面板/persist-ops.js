// ===== 分类 =====
window.小说提取保存分类 = function(folderName, category) {
  var path = 小说提取存储基路径 + folderName + '/_meta.json';
  return LocalFS.readJSON(path).then(function(meta) {
    if (!meta) { toast('⚠️ 记录未找到'); return; }
    meta.category = category;
    return LocalFS.saveJSON(path, meta).then(function() {
      return 小说提取扫描目录().then(function() {
        toast('✅ 分类已保存');
      });
    });
  }).catch(function(e) {
    toast('⚠️ 分类保存失败');
    console.warn(e);
  });
};

function 小说提取加载记录(key) {
  var folderPath = 小说提取存储基路径 + key + '/';
  return LocalFS.readJSON(folderPath + '_meta.json').then(function(meta) {
    if (!meta) { toast('记录文件缺失'); return null; }
    // 全文从独立文件读取，避免扫描/加载时 JSON 解析整段正文
    return LocalFS.readText(folderPath + 'fulltext.txt').then(function(fullText) {
      小说提取原始文本 = fullText || '';
      小说提取当前记录ID = meta.id;
      小说提取当前记录标题 = meta.title;
      小说提取当前记录时间 = meta.createdAt;
      小说提取角色列表 = [];
      小说提取角色描述 = {};
      // 从磁盘读取角色文件列表，不依赖 meta.characters
      return LocalFS.list(folderPath).then(function(entries) {
        var jsonFiles = entries.filter(function(e) {
          return e.name.endsWith(".json") && e.name !== "_meta.json" && e.name !== "_progress.json" && e.name.indexOf("_fullExtract_") !== 0 && e.name.indexOf("_stages_") !== 0;
        });
        return Promise.all(jsonFiles.map(function(e) {
          return LocalFS.readJSON(folderPath + e.name).then(function(charData) {
            if (!charData) return;
            var cc = {
              name: charData.name,
              gender: 小说提取规范化性别(charData.gender),
              role: charData.role || '龙套',
              brief: charData.brief || null
            };
            var fields = 小说提取正文段字段;
            fields.forEach(function(f) { cc[f] = charData[f] || null; });
            小说提取角色列表.push(cc);
            if (charData.description) 小说提取角色描述[charData.name] = charData.description;
          });
        })).then(function() {
          // 加载时间线阶段独立文件到内存（供展示/描述生成用）
          小说提取阶段数据 = {};
          var stageFiles = entries.filter(function(e) {
            return e.name.indexOf("_stages_") === 0 && e.name.endsWith(".json");
          });
          return Promise.all(stageFiles.map(function(e) {
            return LocalFS.readJSON(folderPath + e.name).then(function(sd) {
              if (!sd || !sd.sourceCharacter || !sd.stages) return;
              var parentName = sd.sourceCharacter;
              小说提取阶段数据[parentName] = sd.stages;
              // 阶段描述挂到内存（含 characterDesc）
              sd.stages.forEach(function(s) {
                if (s.characterDesc) 小说提取角色描述[parentName + '-' + s.name] = s.characterDesc;
              });
            }).catch(function() {});
          })).then(function() {
            小说提取生成中 = {};
            小说提取步骤 = meta.completed === false ? 'paused' : 'result';
            if (meta.completed === false) {
              var progressData = LocalFS.readJSONSync(folderPath + '_progress.json');
              if (progressData) {
                小说提取分析进度.done = progressData.done || 0;
                小说提取分析进度.total = progressData.total || 0;
                小说提取分析中结果 = progressData.allResults || [];
              } else {
                小说提取步骤 = 'result';
              }
            }
            小说提取视图 = 'upload';
            刷新视图();
            return meta;
          });
        });
      });
    });
  });
}

function 小说提取删除记录(key) {
  if (!confirm('确认删除此提取记录？')) return;
  var folderPath = 小说提取存储基路径 + key + '/';
  var p = LocalFS.readJSON(folderPath + '_meta.json').then(function(meta) {
    if (!meta) return;
    // 直接从磁盘删除整个目录及所有文件
    return LocalFS.delete(folderPath).catch(function(){});
  }).catch(function() {});
  p.then(function() {
    window._小说提取历史列表 = (window._小说提取历史列表 || []).filter(function(e) {
      return (e.folderName || e.id) !== key;
    });
    刷新视图();
  });
}

window.小说提取切换视图 = function(view) {
  小说提取视图 = view;
  if (view === 'history') {
    小说提取扫描目录().then(function() { 刷新视图(); });
  } else {
    // overview 立即渲染骨架（面板内部自行启动总览扫描，完成后整刷），不等扫描完成
    刷新视图();
  }
};

// ===== 分析进度保存/加载/清除（断点续传，存入当前记录文件夹） =====

window.小说提取保存进度 = function() {
  if (!小说提取当前记录ID) return;
  var data = {
    done: 小说提取分析进度.done,
    total: 小说提取分析进度.total,
    allResults: 小说提取分析中结果 || []
  };
  var folderName = 本地FS.清理(小说提取当前记录标题) || 小说提取当前记录ID;
  return LocalFS.saveJSON(小说提取存储基路径 + folderName + '/_progress.json', data).catch(function() {});
};

window.小说提取加载进度 = function() {
  if (!小说提取当前记录ID) return null;
  var folderName = 本地FS.清理(小说提取当前记录标题) || 小说提取当前记录ID;
  var data = LocalFS.readJSONSync(小说提取存储基路径 + folderName + '/_progress.json');
  if (!data) return null;
  小说提取分析进度.done = data.done || 0;
  小说提取分析进度.total = data.total || 0;
  小说提取分析中结果 = data.allResults || [];
  return { done: data.done || 0, total: data.total || 0, allResults: data.allResults || [] };
};

window.小说提取清除进度 = function() {
  小说提取分析中结果 = null;
  if (!小说提取当前记录ID) return;
  var folderName = 本地FS.清理(小说提取当前记录标题) || 小说提取当前记录ID;
  LocalFS.delete(小说提取存储基路径 + folderName + '/_progress.json').catch(function() {});
};
