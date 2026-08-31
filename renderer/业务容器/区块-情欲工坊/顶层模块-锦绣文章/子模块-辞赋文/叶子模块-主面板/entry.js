// 情欲工坊 · 锦绣文章 · 辞赋文（词、赋、颂、赞、铭；由共享工厂生成）
var 辞赋文 = 锦绣文章模块工厂({
  storeKey: 'ciFuWen', containerId: 'ciFuWenContent', viewContentId: 'ciFuWenViewContent',
  prefix: 'ciFuWenEdit', windowPrefix: '辞赋文',
  navLabelList: '📋 辞赋集', navLabelEdit: '✍️ 创作',
  formOptionsLabel: '体例', formOptions: ['词', '赋', '颂', '赞', '铭'],
  form解释: {
    '词': '借词牌之名行现代白话之实，用现代口语写一曲肉麻夸赞',
    '赋': '借赋体之名，用现代白话铺陈排比，把吟咏对象捧上天',
    '颂': '借颂体之名，用现代白话一本正经地歌功颂德',
    '赞': '借赞体之名，用现代白话简短咏叹、溢美褒扬',
    '铭': '借铭体之名，用现代白话郑重其事地题铭立传',
  },
  默认文体: '赋', 默认露骨度: '粗俗荤诗',
  专属选题: {
    label: '吟咏对象', 编辑键: 'subject', ctx标签: '吟咏对象',
    options: ['玉体', '骚穴', '淫荡', '不屈', '雄风']
  },
  promptName: 'ci_fu_wen_gen', adaptPromptName: 'ci_fu_wen_adapt_gen', suggestPromptName: 'wen_zhang_title_suggest',
  aiFieldId: 'ciFuWenGen', aiLabel: '辞赋文',
  显示标签: true, 筛选维度: ['form', 'genre', 'explicit'],
});
