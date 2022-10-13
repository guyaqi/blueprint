export const names = [
  "曹礼娅",
  "满文良",
  "何杞蕾",
  "康盛芙",
  "郝薇斌",
  "廉芃华",
  "阴伟宇",
  "彭茹运",
  "那博涛",
  "滕桂延",
  "居优帛",
  "凤翱舒",
  "邢鹤雪",
  "黎琪峰",
  "范勇格",
  "温可玉",
  "扶晨菡",
  "双辞禧",
  "管月濡",
  "裴格听",
  "奚杉芃",
  "郭尧锋",
  "林昭文",
  "訾芝卓",
  "郎婷灵",
  "宿谛彤",
  "车颖材",
  "罗克树",
  "赵雨东",
  "武瑞花",
  "辛蔓天",
  "胥媛桐",
  "邢桀皓",
  "朱婷雪",
  "房平西",
  "薛萱函",
  "萧梅楷",
  "葛逸馨",
  "乔初橘",
  "厍航云",
  "魏凌柏",
  "骆韦珊",
  "农馨雯",
  "巢美龙",
  "雍美骏",
  "伊桓伟",
  "芮晓韵",
  "空坤婧",
  "周振蔓",
  "季敏彬",
  "卫初韦",
  "韶杰玥",
  "厍心禧",
  "华菡娜",
  "东槐爵",
  "从倩歆",
  "毛俊子",
  "养杉凯",
  "卞休蔓",
  "齐峰平",
  "瞿祯茜",
  "冀颜珍",
  "孔畅稷",
  "仲锋",
  "戎雪涛",
  "祝爵强",
  "刁龙蕾",
  "段涛升",
  "伍稷琬",
  "相枫中",
  "陆钰琛",
  "邓栋盛",
  "郝伟侠",
  "蔚腾桃",
  "花钊玲",
  "尤俊函",
  "满丽雪",
  "郏祜澄",
  "柴蔓锦",
  "仇乘格",
  "燕然胤",
  "房璐然",
  "吴英静",
  "巴萱明",
  "王欣宇",
  "刁倩文",
  "熊升祜",
  "姚寒晖",
  "金诚婧",
  "费尧佑",
  "柏歆桓",
  "马函琬",
  "柯吉浩",
  "桓阳月",
  "黄珊芝",
  "林成翱",
  "连涛天",
  "蓬材谷",
  "苍泽静",
  "阎婧萱",
  "伊喆茹",
  "潘颖芃",
  "支桃琳",
  "松婧侠",
  "翁暄蓓",
  "屈烁潍",
  "阙心可",
  "左婧春",
  "闵休阳",
  "钭惠帆",
  "桑钊格",
  "易杞华",
  "井星凯",
  "陶怡郁",
  "葛运楠",
  "危露淑",
  "盛稷冰",
  "燕诚文",
  "应鹤礼",
  "家雅琳",
  "钮枫辞",
  "吴欣袖",
  "詹奇春",
]

export const professions = [
  'millwright',
  'accountant',
  'clerk',
  'driver',
  'engineer',
  'dustman',
  'chef',
  'buyer',
  'auditor',
]

export const persons = [] as Person[]

class Person {
  name = "";
  sex = "";
  id = "";
  profession = ""

  toString() {
    return `| ${this.name}\t | ${this.sex}\t | ${this.id}\t | ${this.profession}\t |`
  }
}

for (let i=0;i<20;i++) {
  const person = new Person()

  // name
  person.name = names[i]

  // sex
  person.sex = ['男', '女'][Math.floor(Math.random()*2)]

  // id
  let id = ''
  for (let k=0;k<18;k++) {
    id = id + (Math.floor(Math.random()*10)).toString()
  }
  person.id = id

  // profession
  person.profession = professions[Math.floor(Math.random()*professions.length)]

  persons.push(person)
}