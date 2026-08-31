// 深度-叙事引擎 · 统一 Store 工厂

function createStore(moduleKey) {
  // 通过映射表获取中文目录名，如果没找到则直接用 key
  var dirName = (typeof STORE_DIRS !== 'undefined' && STORE_DIRS[moduleKey]) || moduleKey;
  var BASE = dirName + '/';

  function san(t) { return LocalFS.sanitize(t); }
  function dir(title) { return BASE + san(title); }
  function metaPath(title) { return dir(title) + '/' + san(title) + ' - 信息.json'; }

  function list() {
    return LocalFS.list(BASE).then(function(entries) {
      if (!entries || !Array.isArray(entries)) return [];
      var count = entries.filter(function(e){return e.isDir;}).length;
      debugLog('store', 'list', moduleKey + ' [' + count + ']');
      var promises = entries
        .filter(function(e) { return e.isDir; })
        .map(function(e) {
          return LocalFS.readJSON(BASE + e.name + '/' + e.name + ' - 信息.json')
            .then(function(meta) {
              meta = meta || {};
              meta.title = meta.title || e.name;
              meta._dirName = e.name;
              return meta;
            });
        });
      return Promise.all(promises).then(function(items) {
        items.sort(function(a, b) {
          return (b.updatedAt || '').localeCompare(a.updatedAt || '');
        });
        return items;
      });
    });
  }

  function get(title) {
    debugLog('store', 'get', moduleKey + ' [' + title + ']');
    return LocalFS.readJSON(metaPath(title));
  }

  function save(title, meta) {
    meta = meta || {};
    meta.title = title;
    meta.updatedAt = fmtDate(new Date());
    if (!meta.createdAt) meta.createdAt = fmtDate(new Date());
    debugLog('store', 'save', moduleKey + ' [' + title + ']');
    return LocalFS.saveJSON(metaPath(title), meta);
  }

  function del(title) {
    debugLog('store', 'delete', moduleKey + ' [' + title + ']');
    return LocalFS.delete(dir(title)).then(function(res) {
      // IPC 返回 {ok:true} 或 {ok:true, notFound:true}，都算成功
      return res;
    }).catch(function(err) {
      // storage 端已用 force:true，基本不会失败。兜底抛出
      throw err;
    });
  }

  function saveContent(title, content) {
    return LocalFS.saveText(dir(title) + '/' + san(title) + '.txt', content);
  }

  function loadContent(title) {
    return LocalFS.readText(dir(title) + '/' + san(title) + '.txt');
  }

  function rename(oldTitle, newTitle) {
    if (oldTitle === newTitle) return Promise.resolve({ ok: true });
    debugLog('store', 'rename', moduleKey + ' [' + oldTitle + ' → ' + newTitle + ']');
    return get(oldTitle).then(function(data) {
      if (!data) return { ok: true, notFound: true };
      return save(newTitle, data).then(function() {
        return del(oldTitle).then(function() {
          return { ok: true };
        });
      });
    });
  }

  return {
    list: list,
    get: get,
    save: save,
    delete: del,
    rename: rename,
    saveContent: saveContent,
    loadContent: loadContent,
    _dir: dir,
    _metaPath: metaPath,
  };
}

window.createStore = createStore;
