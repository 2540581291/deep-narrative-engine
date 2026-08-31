Store.novel = Object.assign(createStore('novel'), {
  listChapters: function(t) { var d = this._dir(t)+'/章节'; return LocalFS.list(d).then(function(e){if(!e)return[];return e.filter(function(x){return!x.isDir}).sort(function(a,b){return a.name.localeCompare(b.name,'zh-CN')});}); },
  getChapter: function(t,c) { return LocalFS.readText(this._dir(t)+'/章节/'+c); },
  saveChapter: function(t,c,ct) { return LocalFS.saveText(this._dir(t)+'/章节/'+c,ct); },
  deleteChapter: function(t,c) { return LocalFS.delete(this._dir(t)+'/章节/'+c); },
});
