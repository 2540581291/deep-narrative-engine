// 情色杂物 · 宣传发布 · 邀请函（私密邀约）
// 由 宣传发布工厂 生成，本文件仅提供模块配置
// 字段：标题 + 邀请对象 + 活动名称 + 日期 + 时间 + 地点 + 着装要求 + 温馨提醒 + 署名 + 标签

function 邀请函初始化工厂() {
  if (typeof 宣传发布工厂 !== 'function') return;
  宣传发布工厂({
    storeKey: 'invitation', containerId: 'pub-invitationContent', viewContentId: 'invitationViewContent',
    prefix: 'pubInvitation', windowPrefix: '宣传邀请函',
    navLabelList: '💌 邀请函', navLabelEdit: '✍️ 创作',
    图标: '💌', 单品名: '邀请函', 标题标签: '邀请标题', 标题占位: '给这份邀请拟个标题…', 创建按钮文案: '＋ 写邀请',
    题材选项: ['私密', '双人', '多人', '主题', '开业', '聚会', '感谢'],
    渠道选项: ['纸质', '微信', '邮件', '私域'],
    露骨度选项: ['含蓄隐晦', '粗俗露骨'],
    预览字段: 'remind',
    字段定义: [
      { key: 'guest', label: '邀请对象', type: 'text', placeholder: '亲爱的…（可留空）' },
      { key: 'event', label: '活动名称', type: 'text', placeholder: 'XX 主题之夜' },
      { key: 'date', label: '日期', type: 'text', placeholder: '2024-01-01' },
      { key: 'time', label: '时间', type: 'text', placeholder: '21:00 起' },
      { key: 'venue', label: '地点', type: 'text', placeholder: 'XX 会所 VIP 房' },
      { key: 'dress', label: '着装要求', type: 'text', placeholder: '正装/情趣内衣…' },
      { key: 'remind', label: '温馨提醒', type: 'textarea', rows: 4, placeholder: '注意事项、进场流程…' },
      { key: 'signer', label: '署名', type: 'text', placeholder: '主人 / XX 组委会' },
      { key: 'tags', label: '标签', type: 'textarealist', hint: '每行一个', placeholder: '标签\n标签' },
    ],
    筛选维度: ['genre', 'explicit', 'channel'],
    主正文: 'remind', 展示行: ['guest', 'event', 'dress', 'signer'], 元信息: ['date', 'time', 'venue'], 列表: [],
    promptName: 'promo_invitation_gen', aiFieldId: 'invitationGen', aiLabel: '邀请函生成',
  });
}
if (typeof 宣传发布工厂 === 'function') {
  邀请函初始化工厂();
} else if (document.readyState === 'complete') {
  邀请函初始化工厂();
} else {
  window.addEventListener('load', 邀请函初始化工厂);
}
