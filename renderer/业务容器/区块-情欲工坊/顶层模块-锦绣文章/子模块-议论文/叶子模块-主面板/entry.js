// 情欲工坊 · 锦绣文章 · 议论文（立论、驳论、辩难、劝诫、时评；由共享工厂生成）
var 议论文 = 锦绣文章模块工厂({
  storeKey: 'yiLunWen', containerId: 'yiLunWenContent', viewContentId: 'yiLunWenViewContent',
  prefix: 'yiLunWenEdit', windowPrefix: '议论文',
  navLabelList: '📋 议论集', navLabelEdit: '✍️ 创作',
  formOptionsLabel: '文体', formOptions: ['立论', '驳论', '辩难', '劝诫', '时评'],
  form解释: {
    '立论': '正面确立并论证自己的主张，先亮观点后摆论据，层层推进',
    '驳论': '先树敌论再逐条批驳，以破为立，在反证中确立己见',
    '辩难': '设问自答、辩诘往复，在一问一答中把道理辩明',
    '劝诫': '以情带理、谆谆劝勉，警醒规戒而不失温厚',
    '时评': '就当下情色话题与时事议题立论，尖锐犀利、针砭切中要害',
  },
  默认文体: '立论', 默认露骨度: '粗俗荤诗',
  专属选题: {
    label: '议题', 编辑键: 'topic', ctx标签: '议题',
    options: ['情与欲之辨', '灵与肉何者为先', '节制与放纵', '风流与下流的界限',
      '情色文学的艺术价值', '含蓄与直白之辨', '文字能否写出身体的真实',
      '创作自由与底线', '性与爱能否分开谈', '情欲与婚姻的关系',
      '明清艳情小说兴衰小论', '春宫文化的雅俗之辩']
  },
  promptName: 'yi_lun_wen_gen', adaptPromptName: 'yi_lun_wen_adapt_gen', suggestPromptName: 'wen_zhang_title_suggest',
  aiFieldId: 'yiLunWenGen', aiLabel: '议论文',
  显示标签: true, 筛选维度: ['form', 'genre', 'explicit'],
});
