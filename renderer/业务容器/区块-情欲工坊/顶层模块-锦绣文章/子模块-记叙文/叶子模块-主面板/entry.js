// 情欲工坊 · 锦绣文章 · 记叙文（人物记、事件记、风物记、艳事记；由共享工厂生成）
var 记叙文 = 锦绣文章模块工厂({
  storeKey: 'jiXuWen', containerId: 'jiXuWenContent', viewContentId: 'jiXuWenViewContent',
  prefix: 'jiXuWenEdit', windowPrefix: '记叙文',
  navLabelList: '📋 记叙集', navLabelEdit: '✍️ 创作',
  formOptionsLabel: '文体', formOptions: ['人物记', '事件记', '风物记', '艳事记'],
  form解释: {
    '人物记': '以记人为中心，写人的形貌、性情与际遇，借人事写情欲',
    '事件记': '以记事为中心，按事件脉络推进，重在起承转合的完整过程',
    '风物记': '以写景状物为中心，借风物渲染情色氛围，景与情交融',
    '艳事记': '以艳事为核心，直写一场露骨的情事，过程细节具体可感',
  },
  默认文体: '事件记', 默认露骨度: '粗俗荤诗',
  专属选题: {
    label: '所记对象', 编辑键: 'subject', ctx标签: '所记对象',
    options: ['邻家女子', '青楼名伶', '深夜造访', '山寺一夜', '雨中邂逅', '青梅旧识']
  },
  promptName: 'ji_xu_wen_gen', adaptPromptName: 'ji_xu_wen_adapt_gen', suggestPromptName: 'wen_zhang_title_suggest',
  aiFieldId: 'jiXuWenGen', aiLabel: '记叙文',
  显示标签: true, 筛选维度: ['form', 'genre', 'explicit'],
});
