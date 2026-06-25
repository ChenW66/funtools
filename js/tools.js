// ===== STORAGE =====
function loadState(k, fallback) { try { const v = localStorage.getItem('dc_'+k); return v ? JSON.parse(v) : fallback; } catch(e) { return fallback; } }
function saveState(k, v) { try { localStorage.setItem('dc_'+k, JSON.stringify(v)); } catch(e) {} }

// ===== THEME =====
try {
const themeDots = document.querySelectorAll('.theme-dot'), root = document.documentElement;
const themes = {
  neon:  {'--cyan':'#00f0ff','--magenta':'#ff00aa','--purple':'#8800ff','--bg-g1':'rgba(0,240,255,0.05)','--bg-g2':'rgba(255,0,170,0.05)','--bg-g3':'rgba(136,0,255,0.04)'},
  matrix:{'--cyan':'#00ff88','--magenta':'#00cc66','--purple':'#006644','--bg-g1':'rgba(0,255,136,0.05)','--bg-g2':'rgba(0,204,102,0.05)','--bg-g3':'rgba(0,102,68,0.04)'},
  sunset:{'--cyan':'#ff6600','--magenta':'#ff0055','--purple':'#880044','--bg-g1':'rgba(255,102,0,0.05)','--bg-g2':'rgba(255,0,85,0.05)','--bg-g3':'rgba(136,0,68,0.04)'},
  ice:   {'--cyan':'#00ccff','--magenta':'#8844ff','--purple':'#4400cc','--bg-g1':'rgba(0,204,255,0.05)','--bg-g2':'rgba(136,68,255,0.05)','--bg-g3':'rgba(68,0,204,0.04)'},
};
function applyTheme(n){ const t=themes[n]; if(t) Object.entries(t).forEach(function(kv){ root.style.setProperty(kv[0], kv[1]); }); }
const savedTheme = loadState('theme','neon');
themeDots.forEach(function(d) {
  if (d.dataset.theme === savedTheme) { d.classList.add('active'); applyTheme(savedTheme); }
  d.addEventListener('click', function() {
    themeDots.forEach(function(x) { x.classList.remove('active'); });
    d.classList.add('active');
    applyTheme(d.dataset.theme);
    saveState('theme', d.dataset.theme);
  });
});
} catch(e) { console.error('Theme error:', e); }

// ===== CLOCK =====
try {
const clockTime = document.getElementById('clock-time');
const clockDate = document.getElementById('clock-date');
const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
function updateClock() {
  const n = new Date();
  clockTime.textContent =
    String(n.getHours()).padStart(2,'0') + ':' +
    String(n.getMinutes()).padStart(2,'0') + ':' +
    String(n.getSeconds()).padStart(2,'0');
  clockDate.textContent =
    days[n.getDay()] + ' ' + months[n.getMonth()] + ' ' + n.getDate() + ', ' + n.getFullYear();
}
updateClock();
setInterval(updateClock, 1000);
} catch(e) { console.error('Clock error:', e); }

// ===== POMODORO =====
try {
const pomoDisplay = document.getElementById('pomo-display');
const pomoStart = document.getElementById('pomo-start');
const pomoReset = document.getElementById('pomo-reset');
const pomoStatus = document.getElementById('pomo-status');
let pomoTime = 25 * 60;
let pomoRunning = false;
let pomoInterval = null;
function updatePomo() {
  pomoDisplay.textContent =
    String(Math.floor(pomoTime / 60)).padStart(2,'0') + ':' +
    String(pomoTime % 60).padStart(2,'0');
}
function pomoFlush() {
  if (pomoTime <= 0) {
    clearInterval(pomoInterval);
    pomoRunning = false;
    pomoStart.textContent = '[ START ]';
    pomoStatus.textContent = '// 时间到了！';
    pomoStatus.style.color = '#ffcc00';
    return;
  }
  pomoTime--;
  updatePomo();
}
pomoStart.addEventListener('click', function() {
  if (pomoRunning) {
    clearInterval(pomoInterval);
    pomoRunning = false;
    pomoStart.textContent = '[ START ]';
    pomoStatus.textContent = '// 已暂停';
    pomoStatus.style.color = '#666688';
  } else {
    if (pomoTime <= 0) { pomoTime = 25 * 60; updatePomo(); }
    pomoRunning = true;
    pomoStart.textContent = '[ PAUSE ]';
    pomoStatus.textContent = '// 专注中...';
    pomoStatus.style.color = '#00ff88';
    pomoInterval = setInterval(pomoFlush, 1000);
  }
});
pomoReset.addEventListener('click', function() {
  clearInterval(pomoInterval);
  pomoRunning = false;
  pomoTime = 25 * 60;
  pomoStart.textContent = '[ START ]';
  pomoStatus.textContent = '// 已重置';
  pomoStatus.style.color = '#666688';
  updatePomo();
});
updatePomo();
} catch(e) { console.error('Pomo error:', e); }

// ===== MODAL =====
try {
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalItemList = document.getElementById('modal-item-list');
const modalSearch = document.getElementById('modal-search');
const modalCustomInput = document.getElementById('modal-custom-input');
const modalCustomAddBtn = document.getElementById('modal-custom-add-btn');
const modalConfirm = document.getElementById('modal-confirm');
const modalCancel = document.getElementById('modal-cancel');
const modalClose = document.getElementById('modal-close');
let modalItems = [];
let modalChecked = new Set();
let modalCallback = null;
function openModal(title, items, callback) {
  modalTitle.textContent = '// ' + title;
  modalItems = items.slice();
  modalChecked = new Set(items);
  modalCallback = callback;
  modalSearch.value = '';
  renderModalItems();
  modalOverlay.classList.add('open');
}
function renderModalItems() {
  const q = modalSearch.value.toLowerCase();
  const filtered = q ? modalItems.filter(function(i) { return i.toLowerCase().includes(q); }) : modalItems;
  modalItemList.innerHTML = filtered.map(function(i) {
    var checked = modalChecked.has(i) ? 'checked' : '';
    return '<label class="modal-item-row"><input type="checkbox" value="' + i.replace(/"/g, '&quot;') + '" ' + checked + ' /><span>' + i + '</span></label>';
  }).join('');
  var cbs = modalItemList.querySelectorAll('input[type="checkbox"]');
  cbs.forEach(function(cb) {
    cb.addEventListener('change', function() {
      if (cb.checked) modalChecked.add(cb.value);
      else modalChecked.delete(cb.value);
    });
  });
}
modalSearch.addEventListener('input', renderModalItems);
modalCustomAddBtn.addEventListener('click', function() {
  var v = modalCustomInput.value.trim();
  if (v && modalItems.indexOf(v) === -1) {
    modalItems.push(v);
    modalChecked.add(v);
    modalCustomInput.value = '';
    renderModalItems();
    modalItemList.scrollTop = modalItemList.scrollHeight;
  }
});
modalCustomInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') modalCustomAddBtn.click();
});
function closeModal() {
  modalOverlay.classList.remove('open');
  modalCallback = null;
}
modalConfirm.addEventListener('click', function() {
  if (modalCallback) modalCallback(Array.from(modalChecked));
  closeModal();
});
modalCancel.addEventListener('click', closeModal);
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', function(e) {
  if (e.target === modalOverlay) closeModal();
});
} catch(e) { console.error('Modal error:', e); }

// ===== MASSIVE PRESETS =====
const EAT = [
  '北京烤鸭','炸酱面','涮羊肉','卤煮火烧','炒肝','豆汁焦圈','京酱肉丝','糖醋里脊','乾隆白菜','芥末墩','麻豆腐','炙子烤肉','门钉肉饼','豌豆黄','驴打滚','艾窝窝','糖火烧',
  '天津狗不理','煎饼果子','耳朵眼炸糕','十八街麻花','锅巴菜','上海小笼包','生煎','葱油拌面','蟹壳黄','排骨年糕','八宝鸭','红烧肉','油爆虾','四喜烤麸','腌笃鲜','本帮熏鱼',
  '广东白切鸡','叉烧','烧鹅','肠粉','虾饺','烧卖','云吞面','煲仔饭','砂锅粥','萝卜糕','凤爪','糯米鸡','豉汁蒸排骨','干炒牛河','广州文昌鸡',
  '四川水煮鱼','麻婆豆腐','回锅肉','宫保鸡丁','夫妻肺片','钵钵鸡','串串香','担担面','灯影牛肉','毛血旺','辣子鸡','口水鸡','成都冒菜','乐山跷脚牛肉','宜宾燃面',
  '重庆火锅','酸辣粉','重庆小面','辣子鸡','毛血旺','黔江鸡杂','万州烤鱼','湖南剁椒鱼头','小炒肉','长沙臭豆腐','口味虾','湖南米粉','湘西腊肉','酱板鸭','攸县香干',
  '江苏盐水鸭','蟹粉汤包','糖醋排骨','松鼠鳜鱼','狮子头','大煮干丝','文思豆腐','东坡肉','西湖醋鱼','龙井虾仁','片儿川','叫花鸡','定胜糕','宁波汤圆',
  '福建佛跳墙','海蛎煎','沙茶面','扁食','荔枝肉','土笋冻','姜母鸭','福州鱼丸','云南过桥米线','汽锅鸡','菌子火锅','鲜花饼','宣威火腿','大理乳扇',
  '新疆大盘鸡','羊肉串','手抓饭','馕包肉','烤包子','拉条子','新疆炒米粉','陕西肉夹馍','biangbiang面','凉皮','羊肉泡馍','臊子面','油泼面','甑糕','葫芦头',
  '湖北热干面','鸭脖','武昌鱼','豆皮','面窝','排骨藕汤','孝感米酒','河南烩面','胡辣汤','灌汤包','道口烧鸡','洛阳水席','桶子鸡',
  '辽宁锅包肉','地三鲜','小鸡炖蘑菇','猪肉炖粉条','溜肉段','酱骨架','山东煎饼果子','德州扒鸡','葱烧海参','九转大肠','把子肉','青岛啤酒',
  '江西南昌炒粉','瓦罐汤','宁都三杯鸡','藜蒿炒腊肉','米粉蒸肉','赣南小炒鱼','井冈山烟笋','余干辣椒炒肉','临川牛杂','瑞金牛肉汤','萍乡小炒肉','铅山烫粉','景德镇冷粉','婺源糊豆腐','弋阳年糕','萍乡莲花血鸭','安福火腿','泰和乌鸡','鄱阳湖胖鱼头',
  '安徽板面','臭鳜鱼','毛豆腐','胡适一品锅','淮南牛肉汤','贵州酸汤鱼','花溪牛肉粉','肠旺面','丝娃娃','遵义羊肉粉','广西螺蛳粉','桂林米粉','柠檬鸭','老友粉',
  '海南文昌鸡','抱罗粉','清补凉','椰子饭','陵水酸粉','甘肃兰州拉面','酿皮','浆水面','手抓羊肉','张掖搓鱼面','内蒙古烤全羊','奶茶','手扒肉','莜面','奶皮子',
  '西藏酥油茶','糌粑','牦牛肉','藏面','黑龙江锅包肉','杀猪菜','酱骨头','马迭尔冰棍','哈尔滨红肠','吉林冷面','辣白菜','石锅拌饭','延吉烤肉',
  '河北驴肉火烧','保定糖葫芦','沧州火锅鸡','香河肉饼','山西刀削面','莜面栲栳栳','平遥牛肉','过油肉','台湾卤肉饭','珍珠奶茶','蚵仔煎','凤梨酥','担仔面',
  '香港烧腊','云吞面','菠萝包','丝袜奶茶','鸡蛋仔','澳门猪扒包','葡式蛋挞','水蟹粥','猪排包',
  '沙县小吃','黄焖鸡米饭','麻辣烫','烧烤','炸鸡啤酒','烤冷面','铁板鱿鱼','章鱼小丸子','关东煮','煎豆腐','烤面筋','鸡蛋灌饼','肉蛋堡','臭豆腐','炒河粉','炒米粉',
  '海底捞','麦当劳','肯德基','必胜客','汉堡王','味千拉面','永和大王','真功夫','吉野家','杨国福麻辣烫','张亮麻辣烫','周黑鸭','绝味鸭脖','正新鸡排','华莱士',
  '老乡鸡','大米先生','老娘舅','和府捞面','遇见小面','太二酸菜鱼','西贝莜面村','外婆家','绿茶餐厅','鼎泰丰','呷哺呷哺','小肥羊','黄记煌','汉拿山',
  '大董烤鸭','全聚德','东来顺','广州酒家','陶陶居','点都德','杏花楼','沈大成','南翔馒头店','喜家德水饺','袁记云饺','阿香米线',
  '吉祥馄饨','如意馄饨','赛百味','达美乐','棒约翰','尊宝披萨','萨莉亚','豪客来','王品牛排',
  '小龙坎','大龙燚','蜀大侠','谭鸭血','巴奴毛肚火锅','捞王锅物料理','左庭右院鲜牛肉火锅','太兴茶餐厅','翠华餐厅','敏华冰厅',
  '文和友','费大厨辣椒炒肉','炊烟时代小炒黄牛肉','徐记海鲜','蛙来哒','探鱼','鱼你在一起',
  '红盔甲','沪小胖','靓靓蒸虾','巴厘龙虾','胡大饭馆','花家怡园','利苑','新荣记','甬府','炳胜品味','惠食佳',
  '四季民福','便宜坊','利群烤鸭店','海碗居','护国寺小吃','锦芳小吃','牛街聚宝源','南门涮肉','宏源南门涮肉',
  '日昌餐馆','金鼎轩','唐宫海鲜舫','顺峰','四海一家','好伦哥','比格比萨','安妮意大利餐厅','祖母的厨房','新元素','Wagas',
  '手抓饼','烤冷面','鸡蛋灌饼','杂粮煎饼','酱香饼','千层饼','葱油饼','馅饼','烧饼','锅盔','肉夹馍','凉皮','凉面','擀面皮','牛筋面','酿皮',
  '麻辣拌','麻辣香锅','冒菜','三顾冒菜','芙蓉树下','馋嘴冒菜',
  '螺蛳粉','花甲粉','土豆粉','酸辣粉','过桥米线','桂林米粉',
  '炒饭','蛋炒饭','扬州炒饭','酱油炒饭','咖喱炒饭',
  '炒面','炒河粉','炒米粉','炒饼丝','炒年糕','炒米线',
  '盖饭','黄焖鸡米饭','煲仔饭','石锅饭','木桶饭','铁板饭','韩式拌饭','蛋包饭','咖喱饭','烤肉饭','脆皮鸡饭','鸡排饭','猪排饭',
  '隆江猪脚饭','烧腊饭','叉烧饭','烧鸭饭','手撕鸡饭','白切鸡饭','猪扒饭','牛腩饭','排骨饭',
  '烤串','羊肉串','牛肉串','烤鱿鱼','烤鸡翅','烤鸡腿','烤面筋','烤玉米','烤红薯','烤肠','热狗',
  '关东煮','饭团','寿司','紫菜包饭','三明治','汉堡','鸡肉卷','煎饺','锅贴','包子','馒头','花卷','蒸饺','水饺','馄饨','抄手',
  '油条','麻团','麻花','糍粑','年糕','汤圆','粽子',
  '茶叶蛋','卤蛋','泡面','方便面','自热火锅','自热米饭','拌面','葱油拌面','热干面','担担面','炸酱面','杂酱面',
  '拉面','刀削面','烩面','米线','米粉','河粉','粉丝','土豆粉','面皮','冷面',
  '冰粉','凉虾','双皮奶','姜撞奶','杨枝甘露','烧仙草','芋圆','西米露','芒果西米露',
  '红豆沙','绿豆沙','芝麻糊','花生糊','八宝粥','皮蛋瘦肉粥','白粥','小米粥','南瓜粥',
  '鱼片粥','艇仔粥','及第粥','生滚粥','烤鱼','纸上烤鱼','半天妖','木屋烧烤','很久以前',
  '麻辣烫','杨国福','张亮','小谷姐姐','拌将','觅姐','刁四','六品堂'
];
const DRINK = [
  '可口可乐','百事可乐','雪碧','芬达','美年达','七喜','北冰洋','健力宝','非常可乐','崂山可乐','天府可乐',
  '元气森林','零卡雪碧','零卡可乐','Dr Pepper','Mountain Dew',
  '红牛','东鹏特饮','魔爪','乐虎','Monster','佳得乐','宝矿力水特','脉动','尖叫','外星人电解质水',
  '农夫山泉','怡宝','冰露','纯悦','康师傅矿泉水','娃哈哈纯净水','百岁山','恒大冰泉','昆仑山','西藏5100','景田',
  '依云','巴黎水','圣培露','农夫山泉NFC果汁','美汁源果粒橙','统一鲜橙多','康师傅水蜜桃','酷儿','味全每日C','纯果乐','汇源果汁','椰子水','唯他可可',
  '小茗同学','茶π','东方树叶','三得利乌龙茶','康师傅冰红茶','统一冰红茶','康师傅绿茶','统一绿茶','康师傅茉莉花茶','达亦多大麦茶','伊藤园绿茶','淳茶舍',
  '星巴克','瑞幸咖啡','库迪咖啡','Manner','Costa','Seesaw','%Arabica',"Peet's Coffee",'Tims','麦咖啡','肯德基咖啡','全家湃客咖啡','711咖啡','罗森咖啡',
  '雀巢咖啡','悠诗诗','ucc','Blendy','Maxim麦馨','G7','三顿半','永璞','隅田川',
  '喜茶','奈雪的茶','蜜雪冰城','茶百道','古茗','霸王茶姬','一点点','CoCo都可','益禾堂','书亦烧仙草',
  '沪上阿姨','甜啦啦','七分甜','柠季','挞柠','LINLEE','邻里','丘大叔柠檬茶','茉莉奶白','茶颜悦色','爷爷不泡茶','茶话弄','霓裳茶舞','煮叶','乐乐茶',
  '王老吉','加多宝','和其正','椰树椰汁','特种兵椰汁','欢乐家椰汁',
  '养乐多','AD钙奶','旺仔牛奶','六个核桃','露露','银鹭花生牛奶','统一阿萨姆奶茶','康师傅经典奶茶','香飘飘','优乐美',
  '安慕希','纯甄','莫斯利安','蒙牛纯牛奶','伊利纯牛奶','特仑苏','金典','三元极致','光明优倍','晨光鲜奶','简爱','如实','和润','明治牛奶','朝日牛奶',
  '可尔必思','养味','九阳豆浆','维他奶','豆本豆','伊利优酸乳','君乐宝涨芝士啦','蒙牛真果粒','伊利谷粒多',
  '娃哈哈乳酸菌','美乐多','津威','维维豆奶','冰红茶','冰绿茶','蜂蜜柚子茶','柠檬水','酸梅汤','绿豆汤','豆浆','豆腐脑',
  '露露杏仁露','核桃奶','花生奶','燕麦奶','豆奶','椰奶','杏仁奶','米浆','芝麻糊','油茶','蒙古奶茶','酥油茶',
  '八宝茶','三炮台','龟苓膏','凉茶','竹蔗茅根水','菊花茶','茉莉花茶','桂花茶','玫瑰茶','洛神花茶','大麦茶','荞麦茶','决明子茶','枸杞茶','人参茶',
  '普洱','红茶','绿茶','乌龙茶','白茶','黄茶','黑茶','铁观音','大红袍','龙井','碧螺春','毛峰','猴魁',
  '正山小种','金骏眉','祁门红茶','滇红','福鼎白茶','生普','熟普','冰岛','班章','肉桂','水仙','单丛','凤凰单丛','东方美人',
  'Gin Tonic','Mojito','Margarita','Martini','Old Fashioned','Whiskey Sour','Negroni','Cosmopolitan','Long Island','Pina Colada','Daiquiri','Bloody Mary','Moscow Mule','Espresso Martini','Aperol Spritz',
  '啤酒','精酿','青岛啤酒','雪花','燕京','哈尔滨啤酒','珠江啤酒','百威','Corona','Heineken','Stella Artois','Hoegaarden','Guinness','Asahi','Sapporo','Kirin',
  '白酒','茅台','五粮液','洋河','泸州老窖','汾酒','剑南春','古井贡','郎酒','水井坊','红星二锅头','牛栏山二锅头','江小白','劲酒',
  '黄酒','绍兴酒','古越龙山','女儿红','花雕','清酒','獭祭','月桂冠','白鹤','梅酒','梅见','桂花酒','米酒','甜酒酿',
  '葡萄酒','拉菲','奔富','长城','张裕','王朝','威士忌','Johnnie Walker',"Jack Daniel's",'Macallan','Chivas','Hibiki',
  '白兰地','轩尼诗','人头马','马爹利','伏特加','绝对伏特加','灰雁','Smirnoff','朗姆酒','百加得','摩根船长',
  '金酒','哥顿','必富达','孟买','龙舌兰','Jose Cuervo','Patron',
  '喜茶 多肉葡萄','喜茶 芝芝莓莓','喜茶 芝芝桃桃','喜茶 满杯红柚','喜茶 黑糖波波','喜茶 芋泥啵啵','喜茶 杨枝甘露',
  '奈雪 霸气葡萄','奈雪 霸气芝士草莓','奈雪 霸气椰椰','奈雪 宝藏茶','奈雪 芋泥宝藏茶','奈雪 黑糖珍珠奶茶',
  '茶颜悦色 幽兰拿铁','茶颜悦色 声声乌龙','茶颜悦色 桂花弄','茶颜悦色 筝筝纸鸢','茶颜悦色 三季虫','茶颜悦色 素颜锡兰',
  '霸王茶姬 伯牙绝弦','霸王茶姬 恋恋山茶','霸王茶姬 七里香','霸王茶姬 青青糯山','霸王茶姬 花田乌龙','霸王茶姬 万山红',
  '蜜雪冰城 柠檬水','蜜雪冰城 珍珠奶茶','蜜雪冰城 草莓摇摇奶昔','蜜雪冰城 冰淇淋','蜜雪冰城 满杯百香果','蜜雪冰城 蜜桃四季春',
  '古茗 超A芝士葡萄','古茗 布丁芋奶露','古茗 杨枝甘露','古茗 大叔奶茶','古茗 百香果双响炮','古茗 厚道椰椰',
  '一点点 波霸奶茶','一点点 四季春青茶','一点点 冻顶乌龙','一点点 冰淇淋红茶','一点点 阿华田','一点点 抹茶拿铁',
  'COCO 百香果双响炮','COCO 鲜百香双响炮','COCO 奶茶三兄弟','COCO 养乐多','COCO 青稞奶茶','COCO 莓莓果茶',
  '沪上阿姨 桃桃蜜柚','沪上阿姨 血糯米','沪上阿姨 厚芋泥','沪上阿姨 杨枝甘露','沪上阿姨 绿豆牛乳','沪上阿姨 椰子水',
  '茶百道 杨枝甘露','茶百道 豆乳玉麒麟','茶百道 铁观音奶茶','茶百道 西瓜啵啵','茶百道 桂花酒酿','茶百道 招牌芋圆',
  '书亦烧仙草 招牌烧仙草','书亦烧仙草 葡萄芋圆冻冻','书亦烧仙草 刺梨柠檬柚','书亦烧仙草 生椰柠檬撞奶','书亦烧仙草 栀子花',
  '瑞幸 生椰拿铁','瑞幸 厚乳拿铁','瑞幸 丝绒拿铁','瑞幸 燕麦拿铁','瑞幸 陨石拿铁','瑞幸 椰云拿铁','瑞幸 茉莉海盐拿铁','瑞幸 橙C美式',
  '星巴克 焦糖玛奇朵','星巴克 抹茶星冰乐','星巴克 红茶拿铁','星巴克 摩卡','星巴克 香草拿铁','星巴克 燕麦拿铁','星巴克 馥芮白',
  '乐乐茶 草莓桃子酪酪','乐乐茶 杨枝甘露','乐乐茶 厚芋泥','乐乐茶 黑糖波霸脏脏茶','乐乐茶 桑葚葡萄',
  'Manner 桂花拿铁','Manner 清橙美式','Manner 桂花燕麦拿铁','Manner Dirty','Manner 拿铁',
  '库迪 生椰拿铁','库迪 潘帕斯蓝','库迪 星辰厚乳拿铁','库迪 柚见气泡冰萃','库迪 欢脱梅梅',
  '幸运咖 椰椰拿铁','幸运咖 浮云拿铁','幸运咖 鸳鸯拿铁','幸运咖 魔力雪顶',
  '7分甜 杨枝甘露','7分甜 西瓜椰椰','7分甜 芒椰小丸子','7分甜 招牌柠檬茶',
  '伏小桃 桃桃乌龙','伏小桃 草莓大福','伏小桃 杨枝甘露','伏小桃 三倍乳酪葡萄',
  '甜啦啦 水果茶','甜啦啦 鲜奶茶','甜啦啦 冰淇淋','甜啦啦 杨枝甘露','甜啦啦 黑糖珍珠奶茶',
  '益禾堂 益禾烤奶','益禾堂 翠峰茉莉','益禾堂 幽兰四季春','益禾堂 蜜桃乌龙','益禾堂 西瓜椰椰',
  '和气桃桃 玉子麻薯','和气桃桃 草莓冰冰','和气桃桃 白桃麻薯','和气桃桃 蜜桃牛乳',
  '柠檬茶','冻柠茶','港式奶茶','丝袜奶茶','鸳鸯奶茶','咸柠七','椰汁','椰子水','豆奶','椰奶','燕麦奶','豆奶拿铁',
  '冰可可','热可可','热牛奶','阿华田','好立克','美禄','维他奶','维他柠檬茶','菊花茶','廿四味','茅根竹蔗水',
  '蜂蜜柚子茶','蜂蜜柠檬水','姜茶','红糖姜茶','红枣茶','枸杞茶','玫瑰茶','桂花茶','茉莉茶','薄荷茶','果茶'
];
const TRAVEL = [
  '北京故宫','北京长城','天安门广场','颐和园','天坛','圆明园','北海公园','景山公园','香山公园','鸟巢','水立方','国家博物馆','国家大剧院',
  '三里屯','南锣鼓巷','王府井','什刹海','后海','798艺术区','环球影城','欢乐谷',
  '上海外滩','东方明珠','上海迪士尼','豫园','城隍庙','南京路','陆家嘴','上海中心','上海博物馆','田子坊','新天地','武康路','上海科技馆','自然博物馆',
  '广州塔','长隆野生动物世界','长隆欢乐世界','白云山','越秀公园','沙面','北京路','珠江夜游','陈家祠','岭南印象园',
  '深圳世界之窗','欢乐谷','东部华侨城','锦绣中华','大梅沙','小梅沙','深圳湾公园','莲花山公园','梧桐山',
  '成都宽窄巷子','锦里','武侯祠','杜甫草堂','青城山','都江堰','大熊猫基地','春熙路','太古里','九眼桥','人民公园','金沙遗址','三星堆',
  '峨眉山','乐山大佛','重庆洪崖洞','解放碑','磁器口','长江索道','武隆天生三桥','大足石刻','南山一棵树','朝天门',
  '西安兵马俑','大雁塔','小雁塔','钟楼','鼓楼','回民街','城墙','华清宫','陕西历史博物馆','大唐不夜城','华山','法门寺',
  '杭州西湖','灵隐寺','雷峰塔','断桥','苏堤','宋城','西溪湿地','千岛湖','乌镇','绍兴古城','舟山普陀山','雁荡山',
  '南京夫子庙','中山陵','明孝陵','南京博物院','玄武湖','鸡鸣寺','老门东','总统府','大报恩寺','栖霞山',
  '武汉黄鹤楼','东湖','户部巷','江汉路','武汉长江大桥','湖北省博物馆','武汉大学','楚河汉街',
  '长沙橘子洲','岳麓山','岳麓书院','太平街','坡子街','湖南省博物馆','张家界国家森林公园','天门山','凤凰古城',
  '天津之眼','五大道','意大利风情区','古文化街','瓷房子','盘山',
  '苏州园林','拙政园','留园','狮子林','虎丘','平江路','山塘街','周庄','同里','金鸡湖','苏州博物馆',
  '丽江古城','玉龙雪山','泸沽湖','束河古镇','大理古城','洱海','苍山','崇圣寺三塔','双廊古镇','昆明滇池','石林','西双版纳热带雨林',
  '桂林漓江','阳朔西街','十里画廊','象鼻山','龙脊梯田','银子岩','两江四湖',
  '三亚海滩','亚龙湾','蜈支洲岛','天涯海角','南山寺','鹿回头',
  '青岛栈桥','八大关','崂山','五四广场','奥帆中心','青岛啤酒博物馆','极地海洋世界','金沙滩',
  '大连老虎滩','星海广场','金石滩','发现王国','大连森林动物园','棒棰岛',
  '哈尔滨冰雪大世界','太阳岛','中央大街','圣索菲亚教堂','亚布力滑雪场','漠河北极村','雪乡',
  '长白山天池','长白山滑雪','长春伪满皇宫','净月潭','吉林雾凇','松花湖',
  '沈阳故宫','张氏帅府','北陵公园','洛阳龙门石窟','白马寺','关林','老君山','白云山',
  '敦煌莫高窟','鸣沙山月牙泉','雅丹地貌','玉门关','阳关','兰州黄河风情线','白塔山','甘肃省博物馆',
  '青海湖','茶卡盐湖','塔尔寺','祁连山','门源油菜花',
  '拉萨布达拉宫','大昭寺','八廓街','纳木错','羊卓雍措','珠穆朗玛峰大本营','林芝桃花',
  '厦门鼓浪屿','曾厝垵','厦门大学','南普陀寺','环岛路','中山路步行街','沙坡尾',
  '武夷山九曲溪','天游峰','大红袍','南昌滕王阁','八一广场','梅岭','秋水广场','庐山','含鄱口','三叠泉','美庐',
  '井冈山黄洋界','龙潭瀑布','三清山南清园','西海岸','龙虎山泸溪河','悬棺','武功山金顶','高山草甸',
  '黄山','迎客松','光明顶','宏村','西递','屯溪老街','济南趵突泉','大明湖','千佛山','泰山','岱庙','曲阜孔庙',
  '太原晋祠','平遥古城','云冈石窟','悬空寺','五台山','承德避暑山庄','北戴河','秦皇岛山海关',
  '郑州少林寺','嵩山','清明上河园','开封府','香港维多利亚港','太平山顶','迪士尼乐园','海洋公园','星光大道','铜锣湾','旺角','尖沙咀','中环','兰桂坊',
  '澳门大三巴','威尼斯人','巴黎人','澳门塔','新濠天地','氹仔官也街','台北101','故宫博物院','士林夜市','九份','淡水老街','阳明山','日月潭','阿里山','花莲太鲁阁','垦丁国家公园',
  '新疆天山天池','喀纳斯湖','禾木村','吐鲁番葡萄沟','火焰山','赛里木湖','那拉提草原','巴音布鲁克','独库公路',
  '西藏阿里冈仁波齐','玛旁雍错','古格王朝','扎什伦布寺','甘南拉卜楞寺','郎木寺','扎尕那','若尔盖草原',
  '额济纳胡杨林','巴丹吉林沙漠','腾格里沙漠','沙坡头','贺兰山','西夏王陵','呼伦贝尔大草原','满洲里国门','阿尔山天池','大兴安岭','漠河'
];
const JIANGXI = [
  '南昌炒粉','瓦罐汤','赣南小炒鱼','藜蒿炒腊肉','米粉蒸肉','宁都三杯鸡','井冈山烟笋','余干辣椒炒肉','临川牛杂','瑞金牛肉汤','萍乡小炒肉','铅山烫粉','景德镇冷粉','宜春扎粉','吉安薄酥饼','赣州鱼饼','婺源糊豆腐','弋阳年糕','湖口豆豉','安福火腿','泰和乌鸡','庐山石鸡','鄱阳湖胖鱼头','鹰潭牛肉粉','抚州泡粉','新余麻辣鸭头','高安腐竹','乐平狗肉','南城藕粉','上饶鸡腿','南昌拌粉','九江茶饼','赣州艾米果','吉安酱饼','抚州牛杂','萍乡莲花血鸭','景德镇碱水粑','鹰潭灯芯糕','瑞昌山药','鄱阳湖大闸蟹','永修柘林湖鱼头','武宁棍子鱼','修水哨子','铜鼓包圆','宜丰烧卖','上高蹄花','奉新米粉','丰城滑肉','进贤大闸蟹'
];

const presetLibraries = {
  eat: { label: '今天吃什么', items: EAT },
  drink: { label: '今天喝什么', items: DRINK },
  travel: { label: '今天去哪玩', items: TRAVEL },
  jiangxi: { label: '江西菜', items: JIANGXI },
};

// ===== PICKER =====
try {
const pickerInput = document.getElementById('picker-input');
const pickerAddBtn = document.getElementById('picker-add');
const pickerSpin = document.getElementById('picker-spin');
const pickerClear = document.getElementById('picker-clear');
const pickerResult = document.getElementById('picker-result');
const pickerPresets = document.getElementById('picker-presets');
var pickerData = loadState('picker_items', []);

Object.keys(presetLibraries).forEach(function(key) {
  var lib = presetLibraries[key];
  var btn = document.createElement('button');
  btn.className = 'picker-preset-btn';
  btn.textContent = lib.label + ' (' + lib.items.length + ')';
  btn.dataset.key = key;
  btn.addEventListener('click', function() {
    openModal(lib.label, lib.items, function(selected) {
      pickerData = selected;
      saveState('picker_items', pickerData);
      pickerResult.textContent = '// 已选择 ' + selected.length + ' 项';
      var allBtns = document.querySelectorAll('.picker-preset-btn');
      allBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });
  pickerPresets.appendChild(btn);
});

pickerAddBtn.addEventListener('click', function() {
  var v = pickerInput.value.trim();
  if (v && pickerData.indexOf(v) === -1) {
    pickerData.push(v);
    saveState('picker_items', pickerData);
    pickerResult.textContent = '// 已添加 ' + pickerData.length + ' 项';
  }
  pickerInput.value = '';
  pickerInput.focus();
});
pickerInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') pickerAddBtn.click();
});
pickerClear.addEventListener('click', function() {
  pickerData = [];
  saveState('picker_items', pickerData);
  pickerResult.textContent = '// 已清空';
  document.querySelectorAll('.picker-preset-btn').forEach(function(b) { b.classList.remove('active'); });
});
pickerSpin.addEventListener('click', function() {
  if (pickerData.length === 0) { pickerResult.textContent = '// 请先选择预设或添加选项'; return; }
  pickerResult.classList.add('spinning');
  var c = 0;
  var m = 25;
  var iv = setInterval(function() {
    pickerResult.textContent = pickerData[Math.floor(Math.random() * pickerData.length)];
    c++;
    if (c >= m) { clearInterval(iv); pickerResult.classList.remove('spinning'); }
  }, 60);
});
if (pickerData.length > 0) pickerResult.textContent = '// 当前 ' + pickerData.length + ' 项';
} catch(e) { console.error('Picker error:', e); }

// ===== GLITCH + TEXT INFO =====
try {
var glitchInput = document.getElementById('glitch-input');
var glitchIntensity = document.getElementById('glitch-intensity');
var glitchOutput = document.getElementById('glitch-output');
var textinfoChars = document.getElementById('textinfo-chars');
var textinfoWords = document.getElementById('textinfo-words');
var gPool = '!@#$%^&*()_+-=[]{}|;:,.<>?/`~ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
var kana = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ';
var glitchTimer = null;
function applyGlitch(t, i) {
  if (!t) return '// 等待输入';
  var r = i / 10;
  return t.split('').map(function(c) {
    var x = Math.random();
    if (x < r) {
      var p = Math.random() > 0.5 ? gPool : kana;
      return p[Math.floor(Math.random() * p.length)];
    }
    if (x < r * 1.5) return c + c;
    return c;
  }).join('');
}
function updateGlitch() {
  var t = glitchInput.value;
  var i = parseInt(glitchIntensity.value, 10);
  glitchOutput.textContent = applyGlitch(t, i);
  glitchOutput.classList.add('glitching');
  clearTimeout(glitchTimer);
  glitchTimer = setTimeout(function() { glitchOutput.classList.remove('glitching'); }, 100);
  textinfoChars.textContent = t.length;
  textinfoWords.textContent = t.trim() ? t.trim().split(/\s+/).length : 0;
}
glitchInput.value = loadState('glitch_text', '');
glitchIntensity.value = loadState('glitch_intensity', '5');
updateGlitch();
glitchInput.addEventListener('input', function() { saveState('glitch_text', glitchInput.value); updateGlitch(); });
glitchIntensity.addEventListener('input', function() { saveState('glitch_intensity', glitchIntensity.value); updateGlitch(); });
} catch(e) { console.error('Glitch error:', e); }

// ===== DICE + COIN FLIP =====
try {
var diceDisplay = document.getElementById('dice-display');
var diceRoll = document.getElementById('dice-roll');
var diceHistory = document.getElementById('dice-history');
var diceHist = loadState('dice_history', []);
function renderDiceHist() {
  diceHistory.innerHTML = diceHist.map(function(n) {
    return '<span class="dice-history-item">' + n + '</span>';
  }).join('');
}
renderDiceHist();
diceRoll.addEventListener('click', function() {
  diceDisplay.classList.add('rolling');
  var c = 0;
  var m = 12;
  var iv = setInterval(function() {
    diceDisplay.textContent = Math.floor(Math.random() * 6) + 1;
    c++;
    if (c >= m) {
      clearInterval(iv);
      var r = Math.floor(Math.random() * 6) + 1;
      diceDisplay.textContent = r;
      diceDisplay.classList.remove('rolling');
      diceHist.push(r);
      if (diceHist.length > 20) diceHist.shift();
      saveState('dice_history', diceHist);
      renderDiceHist();
    }
  }, 60);
});

var coinResult = document.getElementById('coinflip-result');
var coinBtn = document.getElementById('coinflip-btn');
coinBtn.addEventListener('click', function() {
  var c = 0;
  var m = 14;
  var iv = setInterval(function() {
    coinResult.textContent = Math.random() > 0.5 ? 'HEADS' : 'TAILS';
    c++;
    if (c >= m) { clearInterval(iv); }
  }, 70);
});
} catch(e) { console.error('Dice error:', e); }

// ===== MOUSE TRAIL =====
try {
var trailEls = [];
for (var i = 0; i < 10; i++) {
  var d = document.createElement('div');
  d.className = 'mouse-trail';
  d.style.opacity = 0.6 * (1 - i / 10);
  d.style.transform = 'scale(' + (1 - i / 10 * 0.6) + ')';
  document.body.appendChild(d);
  trailEls.push({ el: d, x: -100, y: -100 });
}
var mX = -100, mY = -100;
document.addEventListener('mousemove', function(e) { mX = e.clientX; mY = e.clientY; });
document.addEventListener('touchmove', function(e) {
  var t = e.touches[0];
  mX = t.clientX; mY = t.clientY;
}, { passive: true });
function updateTrail() {
  trailEls[0].x += (mX - trailEls[0].x) * 0.35;
  trailEls[0].y += (mY - trailEls[0].y) * 0.35;
  for (var j = 1; j < trailEls.length; j++) {
    var prev2 = trailEls[j - 1], curr2 = trailEls[j];
    curr2.x += (prev2.x - curr2.x) * 0.3;
    curr2.y += (prev2.y - curr2.y) * 0.3;
  }
  trailEls.forEach(function(t) {
    t.el.style.left = (t.x - 3) + 'px';
    t.el.style.top = (t.y - 3) + 'px';
  });
  requestAnimationFrame(updateTrail);
}
updateTrail();
} catch(e) { console.error('Trail error:', e); }

// ===== CLICK / TOUCH RIPPLE =====
try {
function addRipple(x, y) {
  var r = document.createElement('div');
  r.className = 'click-ripple';
  r.style.left = (x - 60) + 'px';
  r.style.top = (y - 60) + 'px';
  document.body.appendChild(r);
  setTimeout(function() { r.remove(); }, 700);
}
document.addEventListener('click', function(e) { addRipple(e.clientX, e.clientY); });
document.addEventListener('touchstart', function(e) {
  var t = e.touches[0];
  addRipple(t.clientX, t.clientY);
}, { passive: true });
} catch(e) { console.error('Ripple error:', e); }
