// 性癖问答 · 题库内容（题目条目数据，按四级标签组织）
// 结构：大类 → 中类 → 小类 → 题目条目数组
// 每个题目：{ q, options, type, detail, tag }
//   q       题目文本
//   options  选项数组
//   type     normal（正常）/ erotic（色情）
//   detail   题目关联的细类选项（若与题库通用细类不同可单独指定，否则复用细类标签）
//   tag      题目归属的细类标签

var 题库内容数据 = {
  "正常器官": {
    "label": "正常器官",
    "mids": {
      "正常生殖": {
        "label": "正常生殖",
        "items": {
          "正常尺寸": {
            "label": "正常尺寸",
            "questions": [
              { "q": "你认为自己的生殖器官尺寸偏小吗？", "options": ["是的，偏小", "不算小", "没注意过", "其他人这么说过"], "type": "normal", "detail": "偏小" },
              { "q": "你觉得自己生殖器官的尺寸是中等水平吗？", "options": ["是，中等", "偏小", "偏大", "不清楚"], "type": "normal", "detail": "中等" },
              { "q": "你认为自己的生殖器官尺寸偏大吗？", "options": ["是，偏大", "中等", "没感觉", "有人提过"], "type": "normal", "detail": "偏大" },
              { "q": "你的生殖器官尺寸是否看起来不明显、内敛？", "options": ["是，不明显", "正常可见", "偏小", "没注意"], "type": "normal", "detail": "不明显" },
              { "q": "你是否能判断自己的生殖器官尺寸？", "options": ["能判断", "不太能判断", "从未想过", "凭感觉"], "type": "normal", "detail": "无法判断" }
            ]
          },
          "正常形状": {
            "label": "正常形状",
            "questions": [
              { "q": "你的生殖器官勃起时是挺直的吗？", "options": ["挺直", "微弯", "有明显弧度", "没注意"], "type": "normal", "detail": "挺直" },
              { "q": "你的生殖器官是否有些微弯曲？", "options": ["微弯，正常", "挺直", "弯曲明显", "没注意"], "type": "normal", "detail": "微弯" },
              { "q": "你的生殖器官头部形状圆润吗？", "options": ["圆润", "偏尖", "不规则", "没注意"], "type": "normal", "detail": "圆润" },
              { "q": "你的身体两侧器官对称吗？", "options": ["完全对称", "基本对称", "有点不对称", "没注意"], "type": "normal", "detail": "对称" },
              { "q": "你的生殖器官形状是否不规则？", "options": ["不规则", "规则", "轻微不对称", "没注意"], "type": "normal", "detail": "不规则" }
            ]
          },
          "正常颜色": {
            "label": "正常颜色",
            "questions": [
              { "q": "你的生殖器官颜色接近正常肤色吗？", "options": ["接近肤色", "偏红", "偏深", "没注意"], "type": "normal", "detail": "肤色" },
              { "q": "你的生殖器官是否呈红润色？", "options": ["红润", "偏粉", "偏暗", "没注意"], "type": "normal", "detail": "红润" },
              { "q": "你的生殖器官颜色粉嫩吗？", "options": ["粉嫩", "偏红", "偏肤色", "没注意"], "type": "normal", "detail": "粉嫩" },
              { "q": "你的生殖器官颜色是否偏暗沉？", "options": ["偏暗沉", "正常", "偏粉", "没注意"], "type": "normal", "detail": "暗沉" },
              { "q": "你的生殖器官是否出现过异色？", "options": ["有异色", "正常", "轻微变色", "没注意"], "type": "normal", "detail": "异色" }
            ]
          }
        }
      }
    }
  },
  "性爱器官": {
    "label": "性爱器官",
    "mids": {
      "男性乳头": {
        "label": "男性乳头",
        "items": {
          "频率": {
            "label": "频率",
            "questions": [
              { "q": "你揉弄乳头的频率是？", "options": ["每天", "每周几次", "偶尔", "很少", "从不"], "type": "normal", "detail": "每天" },
              { "q": "你会刻意用指甲刺激乳头吗？", "options": ["经常会", "偶尔会", "很少", "不会"], "type": "erotic", "detail": "方式" }
            ]
          },
          "方式": {
            "label": "方式",
            "questions": [
              { "q": "你通常用什么方式揉弄乳头？", "options": ["手指", "工具", "摩擦衣物", "揉搓", "按压"], "type": "normal", "detail": "手" }
            ]
          },
          "被发现": { "label": "被发现", "questions": [] },
          "快感": { "label": "快感", "questions": [] },
          "第一次": { "label": "第一次", "questions": [] },
          "极限": { "label": "极限", "questions": [] },
          "幻想": { "label": "幻想", "questions": [] },
          "露出": { "label": "露出", "questions": [] },
          "记录": { "label": "记录", "questions": [] },
          "寸止": { "label": "寸止", "questions": [] },
          "禁欲": { "label": "禁欲", "questions": [] }
        }
      },
      "龟头": {
        "label": "龟头",
        "items": {
          "频率": { "label": "频率", "questions": [] },
          "方式": { "label": "方式", "questions": [] },
          "被发现": { "label": "被发现", "questions": [] },
          "快感": { "label": "快感", "questions": [] },
          "第一次": { "label": "第一次", "questions": [] },
          "极限": { "label": "极限", "questions": [] },
          "幻想": { "label": "幻想", "questions": [] },
          "露出": { "label": "露出", "questions": [] },
          "记录": { "label": "记录", "questions": [] },
          "寸止": { "label": "寸止", "questions": [] },
          "禁欲": { "label": "禁欲", "questions": [] }
        }
      },
      "阴茎": {
        "label": "阴茎",
        "items": {
          "频率": { "label": "频率", "questions": [
            { "q": "你每天都会想到或触碰自己的阴茎吗？", "options": ["每天多次", "每天一次", "经常", "偶尔", "很少"], "type": "normal", "detail": "每天" },
            { "q": "你关注阴茎状态的频率是每周一次左右吗？", "options": ["每周", "每天", "偶尔", "很少"], "type": "normal", "detail": "每周" },
            { "q": "你只是偶尔才会注意到自己的阴茎吗？", "options": ["偶尔", "经常", "很少", "从不"], "type": "normal", "detail": "偶尔" },
            { "q": "你对阴茎的关注程度会随状态变化而起伏吗？", "options": ["会变化", "基本稳定", "看情况", "没注意"], "type": "normal", "detail": "变化" },
            { "q": "你会刻意节制对阴茎的触碰或关注吗？", "options": ["会节制", "顺其自然", "忍不住", "没想过"], "type": "normal", "detail": "节制" }
          ] },
          "方式": { "label": "方式", "questions": [
            { "q": "你平时主要用手触碰阴茎吗？", "options": ["用手", "用工具", "摩擦", "揉搓", "按压"], "type": "normal", "detail": "手" },
            { "q": "你使用过工具来接触阴茎吗？", "options": ["用过", "没用过", "想过", "经常用"], "type": "erotic", "detail": "工具" },
            { "q": "你会用衣物或物品摩擦阴茎吗？", "options": ["会", "偶尔", "不会", "没试过"], "type": "normal", "detail": "摩擦" },
            { "q": "你通常揉搓阴茎的哪个部位？", "options": ["根部", "中部", "顶端", "整体"], "type": "normal", "detail": "揉搓" },
            { "q": "你喜欢按压阴茎来获得感觉吗？", "options": ["喜欢", "一般", "不喜欢", "没试过"], "type": "normal", "detail": "按压" }
          ] },
          "被发现": { "label": "被发现", "questions": [
            { "q": "你被他人发现关注阴茎的次数多吗？", "options": ["多次", "一两次", "从未", "差点被发现"], "type": "normal", "detail": "次数" },
            { "q": "你担心自己关注阴茎被他人发现吗？", "options": ["很担心", "有点担心", "不担心", "希望被看到"], "type": "normal", "detail": "担心" },
            { "q": "想到被发现的可能时你会兴奋吗？", "options": ["会兴奋", "会紧张", "没感觉", "厌恶"], "type": "erotic", "detail": "兴奋" },
            { "q": "被发现时会感到羞耻吗？", "options": ["很羞耻", "有点", "不羞耻", "反而兴奋"], "type": "erotic", "detail": "羞耻" },
            { "q": "遇到可能被发现的场面你会如何应对？", "options": ["立刻掩饰", "装作自然", "继续动作", "找借口离开"], "type": "normal", "detail": "应对" }
          ] },
          "快感": { "label": "快感", "questions": [
            { "q": "你触摸阴茎获得的快感程度如何？", "options": ["强烈", "中等", "轻微", "几乎没有"], "type": "normal", "detail": "程度" },
            { "q": "你能描述一下阴茎带来的快感是什么样的吗？", "options": ["酥麻", "电流感", "温热", "胀满感", "说不清"], "type": "normal", "detail": "描述" },
            { "q": "阴茎带来的快感和身体其他部位相比如何？", "options": ["最强", "差不多", "更弱", "无法比较"], "type": "normal", "detail": "对比" },
            { "q": "你如何给阴茎快感在全身排名？", "options": ["第一名", "前几名", "中等", "靠后"], "type": "normal", "detail": "排名" }
          ] },
          "第一次": { "label": "第一次", "questions": [
            { "q": "你第一次关注到自己的阴茎大概多大？", "options": ["儿童期", "青春期前", "青春期", "成年后", "不记得"], "type": "normal", "detail": "年龄" },
            { "q": "你第一次触碰阴茎是通过什么方式？", "options": ["无意摸到", "别人告知", "看片后模仿", "洗澡时", "不记得"], "type": "normal", "detail": "方式" },
            { "q": "第一次接触阴茎是在什么场景下？", "options": ["家中", "浴室", "学校", "独处时", "不记得"], "type": "normal", "detail": "场景" },
            { "q": "第一次触碰阴茎时的感受是什么？", "options": ["好奇", "舒服", "紧张", "羞耻", "不记得"], "type": "normal", "detail": "感受" },
            { "q": "是谁引导了你第一次关注阴茎？", "options": ["自己发现", "同伴", "长辈", "影视作品", "没有人"], "type": "normal", "detail": "引导" }
          ] },
          "极限": { "label": "极限", "questions": [
            { "q": "你的阴茎敏感度如何？", "options": ["很敏感", "正常", "迟钝", "时高时低"], "type": "normal", "detail": "敏感度" },
            { "q": "你的阴茎能承受多大强度的刺激？", "options": ["很强", "一般", "较弱", "不确定"], "type": "normal", "detail": "耐受度" },
            { "q": "你经历过刺激过度导致不适吗？", "options": ["经常", "偶尔", "很少", "从未"], "type": "erotic", "detail": "过度" },
            { "q": "刺激过度后你需要多久恢复？", "options": ["很快", "一会儿", "较久", "没注意"], "type": "normal", "detail": "恢复" }
          ] },
          "幻想": { "label": "幻想", "questions": [
            { "q": "你幻想阴茎被他人触碰的内容多吗？", "options": ["经常", "偶尔", "很少", "从不"], "type": "erotic", "detail": "内容" },
            { "q": "你幻想中触碰你阴茎的对象是谁？", "options": ["恋人", "陌生人", "特定的人", "多人", "自己"], "type": "erotic", "detail": "对象" },
            { "q": "你幻想的触碰场景通常在哪里？", "options": ["室内", "户外", "公共场合", "床上", "浴室"], "type": "erotic", "detail": "场景" },
            { "q": "你会渴望把幻想中的阴茎体验变成现实吗？", "options": ["很渴望", "有点想", "只想想", "不想"], "type": "erotic", "detail": "渴望" }
          ] },
          "露出": { "label": "露出", "questions": [
            { "q": "你曾在哪些场合无意暴露过阴茎？", "options": ["公共更衣室", "厕所", "户外", "从未", "家中"], "type": "normal", "detail": "场合" },
            { "q": "暴露阴茎时你感到的暴露感强吗？", "options": ["很强", "一般", "轻微", "没感觉"], "type": "erotic", "detail": "暴露感" },
            { "q": "被看到阴茎会让你兴奋吗？", "options": ["会", "不会", "有点", "厌恶"], "type": "erotic", "detail": "兴奋" },
            { "q": "阴茎暴露会让你感到羞耻吗？", "options": ["很羞耻", "有点", "不羞耻", "反而刺激"], "type": "erotic", "detail": "羞耻" },
            { "q": "你评估过阴茎暴露的风险吗？", "options": ["想过风险", "没想过", "觉得危险", "不在意"], "type": "normal", "detail": "风险" }
          ] },
          "记录": { "label": "记录", "questions": [
            { "q": "你用手写方式记录过关于阴茎的事情吗？", "options": ["写过", "没写过", "想过", "日记里提过"], "type": "normal", "detail": "手写" },
            { "q": "你拍摄或录像过自己的阴茎吗？", "options": ["拍过", "没拍过", "想过", "删掉了"], "type": "erotic", "detail": "录像" },
            { "q": "你会回看自己的阴茎影像记录吗？", "options": ["经常", "偶尔", "从不", "只有一次"], "type": "erotic", "detail": "回看" },
            { "q": "你有保存过精液之类的体液吗？", "options": ["保存过", "没保存过", "想过", "觉得恶心"], "type": "erotic", "detail": "保存液体" },
            { "q": "你会删除自己的相关记录吗？", "options": ["删过", "没删过", "想过删除", "保留着"], "type": "normal", "detail": "删除" }
          ] },
          "寸止": { "label": "寸止", "questions": [
            { "q": "你能控制自己在快到时停下来吗？", "options": ["完全能", "偶尔能", "很难", "做不到"], "type": "erotic", "detail": "控制" },
            { "q": "你能忍受中途停下来的感觉吗？", "options": ["能忍耐", "有点难受", "很难受", "忍不住"], "type": "erotic", "detail": "忍耐" },
            { "q": "你尝试过故意不让释放来训练自己吗？", "options": ["经常", "偶尔", "试过一次", "从未"], "type": "erotic", "detail": "训练" },
            { "q": "寸止训练失败过吗？", "options": ["经常失败", "偶尔", "很少", "从未失败"], "type": "erotic", "detail": "失败" },
            { "q": "寸止后最终释放的感受如何？", "options": ["更强烈", "差不多", "更弱", "没感觉"], "type": "erotic", "detail": "释放" }
          ] },
          "禁欲": { "label": "禁欲", "questions": [
            { "q": "你最长禁欲过多少天？", "options": ["一两天", "一周", "一个月", "几个月以上", "从未禁欲"], "type": "normal", "detail": "天数" },
            { "q": "对你来说禁欲的难度大吗？", "options": ["很难", "中等", "容易", "没试过"], "type": "normal", "detail": "难度" },
            { "q": "你禁欲的原因是什么？", "options": ["自控", "健康", "心理", "宗教或道德", "没有原因"], "type": "normal", "detail": "原因" },
            { "q": "禁欲期间你的感受如何？", "options": ["烦躁", "平静", "专注", "胀满感", "没有变化"], "type": "normal", "detail": "感受" },
            { "q": "你破戒（结束禁欲）时是什么感觉？", "options": ["解脱", "愧疚", "快感加倍", "平淡", "没特别感觉"], "type": "normal", "detail": "破戒" }
          ] },
          "射精": { "label": "射精", "questions": [
            { "q": "你能控制射精的时机吗？", "options": ["完全能控制", "基本能", "很难控制", "完全不能"], "type": "erotic", "detail": "控制" },
            { "q": "你每次射精的量如何？", "options": ["很多", "正常", "较少", "很少", "不稳定"], "type": "erotic", "detail": "量" },
            { "q": "你射精的力度如何？", "options": ["喷射", "流出", "中等", "时强时弱"], "type": "erotic", "detail": "力度" },
            { "q": "你射精能射多远？", "options": ["很远", "中等", "很近", "流出来", "没注意"], "type": "erotic", "detail": "距离" },
            { "q": "你精液的颜色正常吗？", "options": ["乳白", "偏黄", "透明", "偏红", "没注意"], "type": "normal", "detail": "颜色" }
          ] }
        }
      },
      "男性尿道": {
        "label": "男性尿道",
        "items": {
          "频率": { "label": "频率", "questions": [] },
          "方式": { "label": "方式", "questions": [] },
          "被发现": { "label": "被发现", "questions": [] },
          "快感": { "label": "快感", "questions": [] },
          "第一次": { "label": "第一次", "questions": [] },
          "极限": { "label": "极限", "questions": [] },
          "幻想": { "label": "幻想", "questions": [] },
          "露出": { "label": "露出", "questions": [] },
          "记录": { "label": "记录", "questions": [] },
          "寸止": { "label": "寸止", "questions": [] },
          "禁欲": { "label": "禁欲", "questions": [] }
        }
      },
      "男性肛门": {
        "label": "男性肛门",
        "items": {
          "频率": { "label": "频率", "questions": [] },
          "方式": { "label": "方式", "questions": [] },
          "被发现": { "label": "被发现", "questions": [] },
          "快感": { "label": "快感", "questions": [] },
          "第一次": { "label": "第一次", "questions": [] },
          "极限": { "label": "极限", "questions": [] },
          "幻想": { "label": "幻想", "questions": [] },
          "露出": { "label": "露出", "questions": [] },
          "记录": { "label": "记录", "questions": [] },
          "寸止": { "label": "寸止", "questions": [] },
          "禁欲": { "label": "禁欲", "questions": [] }
        }
      },
      "前列腺": {
        "label": "前列腺",
        "items": {
          "频率": { "label": "频率", "questions": [] },
          "方式": { "label": "方式", "questions": [] },
          "被发现": { "label": "被发现", "questions": [] },
          "快感": { "label": "快感", "questions": [] },
          "第一次": { "label": "第一次", "questions": [] },
          "极限": { "label": "极限", "questions": [] },
          "幻想": { "label": "幻想", "questions": [] },
          "露出": { "label": "露出", "questions": [] },
          "记录": { "label": "记录", "questions": [] },
          "寸止": { "label": "寸止", "questions": [] },
          "禁欲": { "label": "禁欲", "questions": [] },
          "高潮": { "label": "高潮", "questions": [] }
        }
      },
      "女性乳头": {
        "label": "女性乳头",
        "items": {
          "频率": { "label": "频率", "questions": [] },
          "方式": { "label": "方式", "questions": [] },
          "被发现": { "label": "被发现", "questions": [] },
          "快感": { "label": "快感", "questions": [] },
          "第一次": { "label": "第一次", "questions": [] },
          "极限": { "label": "极限", "questions": [] },
          "幻想": { "label": "幻想", "questions": [] },
          "露出": { "label": "露出", "questions": [] },
          "记录": { "label": "记录", "questions": [] },
          "寸止": { "label": "寸止", "questions": [] },
          "禁欲": { "label": "禁欲", "questions": [] }
        }
      },
      "阴蒂": {
        "label": "阴蒂",
        "items": {
          "频率": { "label": "频率", "questions": [] },
          "方式": { "label": "方式", "questions": [] },
          "被发现": { "label": "被发现", "questions": [] },
          "快感": { "label": "快感", "questions": [] },
          "第一次": { "label": "第一次", "questions": [] },
          "极限": { "label": "极限", "questions": [] },
          "幻想": { "label": "幻想", "questions": [] },
          "露出": { "label": "露出", "questions": [] },
          "记录": { "label": "记录", "questions": [] },
          "寸止": { "label": "寸止", "questions": [] },
          "禁欲": { "label": "禁欲", "questions": [] },
          "高潮": { "label": "高潮", "questions": [] }
        }
      },
      "阴道": {
        "label": "阴道",
        "items": {
          "频率": { "label": "频率", "questions": [] },
          "方式": { "label": "方式", "questions": [] },
          "被发现": { "label": "被发现", "questions": [] },
          "快感": { "label": "快感", "questions": [] },
          "第一次": { "label": "第一次", "questions": [] },
          "极限": { "label": "极限", "questions": [] },
          "幻想": { "label": "幻想", "questions": [] },
          "露出": { "label": "露出", "questions": [] },
          "记录": { "label": "记录", "questions": [] },
          "寸止": { "label": "寸止", "questions": [] },
          "禁欲": { "label": "禁欲", "questions": [] },
          "湿润": { "label": "湿润", "questions": [] }
        }
      },
      "女性尿道": {
        "label": "女性尿道",
        "items": {
          "频率": { "label": "频率", "questions": [] },
          "方式": { "label": "方式", "questions": [] },
          "被发现": { "label": "被发现", "questions": [] },
          "快感": { "label": "快感", "questions": [] },
          "第一次": { "label": "第一次", "questions": [] },
          "极限": { "label": "极限", "questions": [] },
          "幻想": { "label": "幻想", "questions": [] },
          "露出": { "label": "露出", "questions": [] },
          "记录": { "label": "记录", "questions": [] },
          "寸止": { "label": "寸止", "questions": [] },
          "禁欲": { "label": "禁欲", "questions": [] }
        }
      },
      "女性肛门": {
        "label": "女性肛门",
        "items": {
          "频率": { "label": "频率", "questions": [] },
          "方式": { "label": "方式", "questions": [] },
          "被发现": { "label": "被发现", "questions": [] },
          "快感": { "label": "快感", "questions": [] },
          "第一次": { "label": "第一次", "questions": [] },
          "极限": { "label": "极限", "questions": [] },
          "幻想": { "label": "幻想", "questions": [] },
          "露出": { "label": "露出", "questions": [] },
          "记录": { "label": "记录", "questions": [] },
          "寸止": { "label": "寸止", "questions": [] },
          "禁欲": { "label": "禁欲", "questions": [] }
        }
      }
    }
  },
  "自慰行为": {
    "label": "自慰行为",
    "mids": {
      "男性乳头": {
        "label": "男性乳头",
        "items": {
          "频率": { "label": "频率", "questions": [] },
          "方式": { "label": "方式", "questions": [] },
          "被发现": { "label": "被发现", "questions": [] },
          "快感": { "label": "快感", "questions": [] },
          "第一次": { "label": "第一次", "questions": [] },
          "极限": { "label": "极限", "questions": [] },
          "幻想": { "label": "幻想", "questions": [] },
          "露出": { "label": "露出", "questions": [] },
          "记录": { "label": "记录", "questions": [] },
          "寸止": { "label": "寸止", "questions": [] },
          "禁欲": { "label": "禁欲", "questions": [] }
        }
      },
      "龟头": {
        "label": "龟头",
        "items": {
          "频率": { "label": "频率", "questions": [] },
          "方式": { "label": "方式", "questions": [] },
          "被发现": { "label": "被发现", "questions": [] },
          "快感": { "label": "快感", "questions": [] },
          "第一次": { "label": "第一次", "questions": [] },
          "极限": { "label": "极限", "questions": [] },
          "幻想": { "label": "幻想", "questions": [] },
          "露出": { "label": "露出", "questions": [] },
          "记录": { "label": "记录", "questions": [] },
          "寸止": { "label": "寸止", "questions": [] },
          "禁欲": { "label": "禁欲", "questions": [] }
        }
      }
    }
  },
  "体液分泌": {
    "label": "体液分泌",
    "mids": {
      "性器官液体": {
        "label": "性器官液体",
        "items": {
          "爱液": { "label": "爱液", "questions": [] },
          "精液": { "label": "精液", "questions": [] },
          "前列腺液": { "label": "前列腺液", "questions": [] },
          "淫水": { "label": "淫水", "questions": [] }
        }
      },
      "日常产生": {
        "label": "日常产生",
        "items": {
          "汗水": { "label": "汗水", "questions": [] },
          "口水": { "label": "口水", "questions": [] },
          "眼泪": { "label": "眼泪", "questions": [] },
          "油脂": { "label": "油脂", "questions": [] },
          "耳垢": { "label": "耳垢", "questions": [] }
        }
      }
    }
  },
  "排泄利用": {
    "label": "排泄利用",
    "mids": {
      "人体排泄": {
        "label": "人体排泄",
        "items": {
          "眼屎": { "label": "眼屎", "questions": [] },
          "鼻涕": { "label": "鼻涕", "questions": [] },
          "唾痰": { "label": "唾痰", "questions": [] },
          "耳屎": { "label": "耳屎", "questions": [] },
          "包皮垢": { "label": "包皮垢", "questions": [] },
          "粪便": { "label": "粪便", "questions": [] },
          "尿液": { "label": "尿液", "questions": [] },
          "尿垢": { "label": "尿垢", "questions": [] }
        }
      }
    }
  },
  "生理失控": {
    "label": "生理失控",
    "mids": {
      "面部失控": {
        "label": "面部失控",
        "items": {
          "流口水": { "label": "流口水", "questions": [] },
          "翻白眼": { "label": "翻白眼", "questions": [] },
          "表情失控": { "label": "表情失控", "questions": [] }
        }
      },
      "身体失控": {
        "label": "身体失控",
        "items": {
          "抽搐": { "label": "抽搐", "questions": [] },
          "颤抖": { "label": "颤抖", "questions": [] },
          "挺腰": { "label": "挺腰", "questions": [] }
        }
      },
      "意识失控": {
        "label": "意识失控",
        "items": {
          "失神": { "label": "失神", "questions": [] },
          "潮红": { "label": "潮红", "questions": [] },
          "失语": { "label": "失语", "questions": [] }
        }
      }
    }
  }
};

// 暴露到全局
window.题库内容数据 = 题库内容数据;

// 工具：获取某个四级路径下的题目数组
function 题库内容取题(major, mid, item) {
  var md = 题库内容数据[major] || {};
  var midv = (md.mids || {})[mid] || {};
  var itv = (midv.items || {})[item] || {};
  return itv.questions || [];
}
window.题库内容取题 = 题库内容取题;

// 工具：统计各级别题目数量
function 题库内容统计() {
  var stats = { major: 0, mid: 0, item: 0, question: 0 };
  Object.keys(题库内容数据).forEach(function(major) {
    stats.major++;
    Object.keys(题库内容数据[major].mids || {}).forEach(function(mid) {
      stats.mid++;
      Object.keys(题库内容数据[major].mids[mid].items || {}).forEach(function(item) {
        stats.item++;
        stats.question += (题库内容数据[major].mids[mid].items[item].questions || []).length;
      });
    });
  });
  return stats;
}
window.题库内容统计 = 题库内容统计;
