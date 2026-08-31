// 情色杂物 · 宣传发布 · 广告（情色广告）
// 由 宣传发布工厂 生成，本文件仅提供模块配置
// 字段：标题 + 标语 + 文案正文 + 行动号召 + 标签

function 广告初始化工厂() {
  if (typeof 宣传发布工厂 !== 'function') return;
  宣传发布工厂({
    storeKey: 'eroticaAd', containerId: 'pub-adContent', viewContentId: 'adViewContent',
    prefix: 'pubAd', windowPrefix: '宣传广告',
    navLabelList: '📢 广告牌', navLabelEdit: '✍️ 创作',
    图标: '📢', 单品名: '广告', 标题标签: '标题', 标题占位: '给这个广告起个标题…', 创建按钮文案: '＋ 写广告',
    题材选项: ['会员', '体验', '上门服务', '产品促销', '引流', '活动', '招募'],
    渠道选项: ['朋友圈', '公众号', '社群', '网页', '短视频', '私域'],
    露骨度选项: ['含蓄隐晦', '粗俗露骨'],
    预览字段: 'content',
    字段定义: [
      { key: 'slogan', label: '标语', type: 'text', placeholder: '一句吸引人的标语…' },
      { key: 'content', label: '文案正文', type: 'textarea', rows: 5, placeholder: '把卖点、煽动力、紧迫感写出来…' },
      { key: 'cta', label: '行动号召', type: 'text', placeholder: '立即购买/马上预约…' },
      { key: 'tags', label: '标签', type: 'textarealist', hint: '每行一个', placeholder: '标签\n标签' },
    ],
    筛选维度: ['genre', 'explicit', 'channel'],
    主正文: 'content', 展示行: ['slogan', 'cta'], 元信息: [], 列表: [],
    promptName: 'erotica_ad_gen', aiFieldId: 'adGen', aiLabel: '广告生成',
  });
}
if (typeof 宣传发布工厂 === 'function') {
  广告初始化工厂();
} else if (document.readyState === 'complete') {
  广告初始化工厂();
} else {
  window.addEventListener('load', 广告初始化工厂);
}
