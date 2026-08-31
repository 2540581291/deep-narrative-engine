// 情色杂物 · 宣传发布 · 海报（宣传海报）
// 由 宣传发布工厂 生成，本文件仅提供模块配置
// 字段：标题 + 副标题 + 主视觉文案 + 展出信息 + 联系方式 + 宣传正文 + 视觉建议 + 标签

function 海报初始化工厂() {
  if (typeof 宣传发布工厂 !== 'function') return;
  宣传发布工厂({
    storeKey: 'poster', containerId: 'pub-posterContent', viewContentId: 'posterViewContent',
    prefix: 'pubPoster', windowPrefix: '宣传海报',
    navLabelList: '🖼️ 海报墙', navLabelEdit: '✍️ 创作',
    图标: '🖼️', 单品名: '海报', 标题标签: '海报标题', 标题占位: '给这张海报拟个标题…', 创建按钮文案: '＋ 设计海报',
    题材选项: ['演出', '展览', '派对', '开张', '节气', '主题夜', '招募'],
    渠道选项: ['线下实体', '朋友圈', '公众号', '短视频', '网页'],
    露骨度选项: ['含蓄隐晦', '粗俗露骨'],
    预览字段: 'content',
    字段定义: [
      { key: 'subTitle', label: '副标题', type: 'text', placeholder: '一句补充说明…' },
      { key: 'headline', label: '主视觉文案', type: 'textarea', rows: 3, placeholder: '海报上最醒目的那句…' },
      { key: 'date', label: '日期', type: 'text', placeholder: '2024-01-01' },
      { key: 'venue', label: '地点', type: 'text', placeholder: 'XX 会所 3F' },
      { key: 'contact', label: '联系方式', type: 'text', placeholder: '微信/电话…' },
      { key: 'content', label: '宣传正文', type: 'textarea', rows: 4, placeholder: '海报的完整文案…' },
      { key: 'visual', label: '视觉建议', type: 'textarea', rows: 3, placeholder: '配色/构图/主图意象建议…' },
      { key: 'tags', label: '标签', type: 'textarealist', hint: '每行一个', placeholder: '标签\n标签' },
    ],
    筛选维度: ['genre', 'explicit', 'channel'],
    主正文: 'content', 展示行: ['headline', 'subTitle', 'visual'], 元信息: ['date', 'venue', 'contact'], 列表: [],
    promptName: 'promo_poster_gen', aiFieldId: 'posterGen', aiLabel: '海报生成',
  });
}
if (typeof 宣传发布工厂 === 'function') {
  海报初始化工厂();
} else if (document.readyState === 'complete') {
  海报初始化工厂();
} else {
  window.addEventListener('load', 海报初始化工厂);
}
