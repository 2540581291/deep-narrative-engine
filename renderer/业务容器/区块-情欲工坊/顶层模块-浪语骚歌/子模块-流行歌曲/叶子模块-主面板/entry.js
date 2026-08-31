// 情欲工坊 · 浪语骚歌 · 流行歌曲（由共享工厂生成）
// 列表/阅读/赏析/复制/编辑/删除/创作/经典库 全部由 淫诗体模块工厂 提供（windowPrefix=流行歌曲 同名导出）

// ===== 工厂初始化（创作视图由 淫诗体模块工厂 生成，与淫诗艳曲完全一致）=====
var 流行歌曲 = 淫诗体模块工厂({
  storeKey: 'popSong', containerId: 'pop-songContent', viewContentId: 'popSongViewContent',
  prefix: 'popSongEdit', windowPrefix: '流行歌曲',
  navLabelList: '📋 歌曲列表', navLabelEdit: '✍️ 创作',
  formOptions: ['情歌', '舞曲', '民谣', '说唱'],
  默认露骨度: '粗俗荤诗', 默认诗体: '无',
  promptName: 'pop_song_gen', aiFieldId: 'popSongGen', aiLabel: '流行歌曲生成',
  dbPath: '浪语骚歌/流行歌曲.csv', classicLabel: '流行歌曲',
  题材库: [
    { key: '情爱', kws: ['爱情', '恋人', '情人', '想你', '思念', '亲吻', '拥抱', '牵手', '热恋', '我爱你'] },
    { key: '失恋', kws: ['分手', '眼泪', '心碎', '背叛', '离开', '孤独', '伤悲', '忘记'] },
    { key: '夜曲', kws: ['夜', '月', '星星', '路灯', '晚风', '霓虹', '凌晨'] },
    { key: '舞曲', kws: ['跳舞', '摇摆', '节奏', '旋律', '灯光', '狂欢', '迪斯科'] },
    { key: '情欲', kws: ['欲望', '抚摸', '吻', '身体', '颤抖', '缠绵', '火热', '温柔乡'] },
  ],
});
Store.popSong = createStore('popSong');
