// 情色杂物 · 宣传发布 · 传单（活动宣传单）
// 由 宣传发布工厂 生成，本文件仅提供模块配置
// 字段：名称 + 日期 + 时间 + 地点 + 票价 + 着装 + 联系方式 + 活动描述 + 亮点 + 标签

function 传单初始化工厂() {
  if (typeof 宣传发布工厂 !== 'function') return;
  宣传发布工厂({
    storeKey: 'flyer', containerId: 'pub-flyerContent', viewContentId: 'flyerViewContent',
    prefix: 'pubFlyer', windowPrefix: '宣传传单',
    navLabelList: '🎪 传单墙', navLabelEdit: '✍️ 创作',
    图标: '🎪', 单品名: '传单', 标题标签: '活动名称', 标题占位: '给这场活动起个名字…', 创建按钮文案: '＋ 设计传单',
    题材选项: ['主题派对', '双人私会', '群交', '主题夜', '招待', '推广', '上门', '表演'],
    渠道选项: ['线下实体', '线上群发', '朋友圈', '公众号', '短视频', '私域'],
    露骨度选项: ['含蓄隐晦', '粗俗露骨'],
    预览字段: 'content',
    字段定义: [
      { key: 'date', label: '日期', type: 'text', placeholder: '2024-01-01' },
      { key: 'time', label: '时间', type: 'text', placeholder: '20:00-02:00' },
      { key: 'venue', label: '地点', type: 'text', placeholder: '地下俱乐部 XXX' },
      { key: 'price', label: '票价', type: 'number', placeholder: '0' },
      { key: 'dress', label: '着装要求', type: 'text', placeholder: '皮革/情趣内衣…' },
      { key: 'contact', label: '联系方式', type: 'text', placeholder: '微信/电话…' },
      { key: 'content', label: '活动描述', type: 'textarea', rows: 4, placeholder: '把这场活动的卖点、氛围、流程写出来…' },
      { key: 'highlights', label: '亮点', type: 'textarealist', hint: '每行一个', placeholder: '亮点1\n亮点2' },
      { key: 'tags', label: '标签', type: 'textarealist', hint: '每行一个', placeholder: '标签\n标签' },
    ],
    筛选维度: ['genre', 'explicit', 'channel'],
    主正文: 'content', 展示行: [], 元信息: ['date', 'time', 'venue', 'price', 'dress', 'contact'], 列表: ['highlights'],
    promptName: 'flyer_gen', aiFieldId: 'flyerGen', aiLabel: '传单生成',
  });
}
if (typeof 宣传发布工厂 === 'function') {
  传单初始化工厂();
} else if (document.readyState === 'complete') {
  传单初始化工厂();
} else {
  window.addEventListener('load', 传单初始化工厂);
}
