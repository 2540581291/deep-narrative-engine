// 情色杂物 · 闲情小品 · 对联
// 由 生活消费工厂 生成，本文件仅提供模块配置（完全照抄 生活消费·吃喝 的写法）

// 对联意象库：上联/下联/横批取材
var 对联意象库 = {
  '上联': ['春宵', '红帐', '绣被', '罗帐', '巫山', '云雨', '月下', '花前', '桃源', '洞房', '龙穴', '金莲', '酥胸', '玉腿'],
  '下联': ['花烛', '春潮', '玉体', '香津', '鸳鸯', '并蒂', '合欢', '连理', '柳腰', '樱桃', '蔷薇', '牡丹', '红唇', '酥乳'],
  '横批': ['云雨', '风流', '醉乡', '春色', '永结', '连理', '鸳鸯', '携手', '春宵', '灯花', '合欢', '痴情'],
  '元素': ['春', '雨', '月', '花', '酒', '烛', '帐', '枕', '褥', '帘', '影', '香', '梦', '情'],
  '典故': ['巫山', '洛神', '嫦娥', '奔月', '牛郎', '织女', '江妃', '湘灵', '姑射', '瑶台', '蓬莱', '金屋'],
  '对仗': ['工对', '宽对', '流水对', '借对', '扇面对', '叠字对', '顶针对', '回文对'],
};

function 对联初始化工厂() {
  if (typeof 生活消费工厂 !== 'function') return;
  生活消费工厂({
    storeKey: 'eroticCouplet', containerId: 'eroticCoupletContent', viewContentId: 'eroticCoupletViewContent',
    prefix: 'eroticCouplet', windowPrefix: '对联',
    navLabelList: '🏮 对联清单', navLabelEdit: '✍️ 创作',
    图标: '🏮',
    品类选项: ['工对', '宽对', '流水对', '回文联', '拆字联', '嵌名联', '双关联', '叠字联'],
    意象库: 对联意象库,
    筛选维度: ['genre', 'explicit', 'price'],
    promptName: 'flash_couplet_gen', aiFieldId: 'flashCoupletGen', aiLabel: '对联生成',
  });
}
if (typeof 生活消费工厂 === 'function') {
  对联初始化工厂();
} else if (document.readyState === 'complete') {
  对联初始化工厂();
} else {
  window.addEventListener('load', 对联初始化工厂);
}
