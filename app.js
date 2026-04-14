/* ============================================================
   سَوقلي — app.js
   Complete Professional JavaScript
   ============================================================ */

'use strict';

// ============================================================
// SUPABASE CONFIG
// ============================================================
const SUPABASE_URL  = 'https://kkcidsunsqftnpzdnwba.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrY2lkc3Vuc3FmdG5wemRud2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTU1MjYsImV4cCI6MjA4ODgzMTUyNn0.JYE2LbsvNmK9gU4ty4MKRFjs4zrGtH-QaFg26r6ruqs';

let _sb = null;
let currentUser = null;

function initSupabase() {
  try {
    if (window.supabase) {
      _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
  } catch(e) { console.warn('Supabase init failed:', e); }
}

// ============================================================
// APP STATE
// ============================================================
const state = {
  domain: '', domainName: '',
  serviceType: '', serviceName: '', serviceIcon: '',
  projectName: '', projectType: '', audience: '',
  budget: '', budgetCurrency: 'EGP',
  description: '', prices: '',
  platform: '', videoType: '', scriptType: '', contentType: '',
  currentStep: 1,
};

const currencies = [
  { code:'EGP', sym:'ج.م', flag:'🇪🇬', label:'جنيه مصري',  rate:1 },
  { code:'USD', sym:'$',   flag:'🇺🇸', label:'دولار أمريكي', rate:0.021 },
  { code:'SAR', sym:'ر.س', flag:'🇸🇦', label:'ريال سعودي', rate:0.077 },
  { code:'AED', sym:'د.إ', flag:'🇦🇪', label:'درهم إماراتي', rate:0.076 },
  { code:'KWD', sym:'د.ك', flag:'🇰🇼', label:'دينار كويتي', rate:0.0064 },
  { code:'QAR', sym:'ر.ق', flag:'🇶🇦', label:'ريال قطري',  rate:0.075 },
];
let currentCurrency = currencies[0];

// ============================================================
// DOMAIN & SERVICE DATA
// ============================================================
const domainServices = {
  restaurant: {
    name:'مطاعم وأكل', icon:'🍔',
    services:[
      {type:'content', name:'أفكار محتوى مطعم',    icon:'💡', desc:'30 فكرة محتوى مخصصة لمطعمك'},
      {type:'plan',    name:'خطة تسويق مطعم',       icon:'📋', desc:'خطة تسويق شهرية شاملة'},
      {type:'video',   name:'سكريبت فيديو أكل',     icon:'🎬', desc:'سكريبت احترافي لفيديو الأكل'},
      {type:'campaign',name:'حملة عروض المطعم',      icon:'📢', desc:'حملة ترويجية كاملة لعروضك'},
      {type:'hooks',   name:'Hooks لـ TikTok',       icon:'🪝', desc:'جمل افتتاحية قوية لريلز المطعم'},
      {type:'calendar',name:'تقويم محتوى أسبوعي',   icon:'📅', desc:'خطة نشر أسبوعية مفصّلة'},
    ]
  },
  fashion: {
    name:'ملابس وموضة', icon:'👕',
    services:[
      {type:'content', name:'أفكار محتوى موضة',     icon:'💡', desc:'أفكار محتوى ترند للموضة'},
      {type:'plan',    name:'خطة تسويق متجر ملابس', icon:'📋', desc:'استراتيجية تسويق شاملة'},
      {type:'video',   name:'سكريبت Try-On',         icon:'🎬', desc:'سكريبت احترافي للـ Try-On'},
      {type:'campaign',name:'حملة تخفيضات موسمية',  icon:'📢', desc:'حملة تخفيضات احترافية'},
      {type:'hooks',   name:'Hooks للموضة',          icon:'🪝', desc:'جمل افتتاحية جذابة للموضة'},
      {type:'reels',   name:'أفكار Reels موضة',      icon:'🎯', desc:'أفكار Reels فيرال للموضة'},
    ]
  },
  ecommerce: {
    name:'تجارة إلكترونية', icon:'🛒',
    services:[
      {type:'content', name:'أفكار محتوى متجر',     icon:'💡', desc:'محتوى يزيد المبيعات'},
      {type:'plan',    name:'خطة تسويق متجر إلكتروني', icon:'📋', desc:'استراتيجية شاملة للمتجر'},
      {type:'video',   name:'سكريبت Unboxing',       icon:'🎬', desc:'سكريبت فتح علبة احترافي'},
      {type:'campaign',name:'حملة Flash Sale',       icon:'📢', desc:'حملة عروض سريعة مؤثرة'},
      {type:'ads',     name:'نص إعلانات Meta Ads',   icon:'💰', desc:'نصوص إعلانية لفيسبوك وإنستجرام'},
      {type:'email',   name:'حملة Email Marketing',  icon:'📧', desc:'سلسلة إيميلات تسويقية'},
    ]
  },
  beauty: {
    name:'تجميل وعناية', icon:'💄',
    services:[
      {type:'content', name:'أفكار محتوى تجميل',    icon:'💡', desc:'محتوى جذاب للتجميل والعناية'},
      {type:'plan',    name:'خطة تسويق صالون',       icon:'📋', desc:'خطة تسويق صالون أو متجر تجميل'},
      {type:'video',   name:'سكريبت تيوتوريال',      icon:'🎬', desc:'سكريبت تعليمي احترافي'},
      {type:'campaign',name:'حملة مؤثرين',           icon:'📢', desc:'استراتيجية التسويق بالمؤثرين'},
      {type:'hooks',   name:'Hooks للتجميل',         icon:'🪝', desc:'جمل افتتاحية للتجميل'},
      {type:'before_after', name:'محتوى قبل وبعد',  icon:'✨', desc:'أفكار محتوى قبل وبعد'},
    ]
  },
  tech: {
    name:'تقنية وبرمجيات', icon:'💻',
    services:[
      {type:'content', name:'أفكار محتوى تقني',     icon:'💡', desc:'محتوى تقني يبني مكانة الخبير'},
      {type:'plan',    name:'خطة تسويق B2B/B2C',     icon:'📋', desc:'خطة تسويق للمنتجات التقنية'},
      {type:'video',   name:'سكريبت Demo منتج',      icon:'🎬', desc:'سكريبت عرض منتج تقني'},
      {type:'linkedin',name:'حملة LinkedIn',         icon:'💼', desc:'استراتيجية LinkedIn للتقنية'},
      {type:'ads',     name:'Google Ads Copy',       icon:'💰', desc:'نصوص إعلانية لجوجل'},
      {type:'competitor', name:'تحليل المنافسين',    icon:'🔍', desc:'تحليل المنافسين وجوانب التميز'},
    ]
  },
  services: {
    name:'خدمات مهنية', icon:'🏢',
    services:[
      {type:'content', name:'أفكار محتوى خدمات',    icon:'💡', desc:'محتوى يبني ثقة العملاء'},
      {type:'plan',    name:'خطة تسويق خدمات',      icon:'📋', desc:'خطة تسويق شاملة للخدمات'},
      {type:'video',   name:'سكريبت تعريفي بالخدمة',icon:'🎬', desc:'سكريبت عرض الخدمة باحترافية'},
      {type:'campaign',name:'حملة جذب عملاء',       icon:'📢', desc:'حملة لجذب عملاء جدد'},
      {type:'testimonial', name:'بناء Testimonials', icon:'⭐', desc:'كيفية جمع وعرض شهادات العملاء'},
      {type:'funnel',  name:'بناء Sales Funnel',     icon:'🎯', desc:'قمع مبيعات للخدمات المهنية'},
    ]
  },
};

// ============================================================
// MARKETING LIBRARY — مكتبة التسويق
// ============================================================
const marketingLibrary = [
  // RESTAURANT
  { id:1,  domain:'restaurant', type:'content', tag:'📱 محتوى', tagBg:'#E8F5E9', title:'فيديو تحضير الطبق من الصفر', desc:'صوّر خلف الكواليس وهو بيتحضر الطبق — الجمهور بيحب يشوف الأصالة والجودة', tip:'أضف موسيقى هادئة وأظهر التفاصيل بالتصوير المقرّب' },
  { id:2,  domain:'restaurant', type:'video',   tag:'🎬 فيديو',  tagBg:'#E3F2FD', title:'تجربة العميل الأول بالكاميرا', desc:'اطلب من عميل حقيقي يحكي تجربته بعد الأكل مباشرة — أصدق من أي إعلان مدفوع', tip:'التلقائية أفضل من الإعداد — دع العميل يتكلم بحرية' },
  { id:3,  domain:'restaurant', type:'hook',    tag:'🪝 Hook',   tagBg:'#FCE4EC', title:'"مش هتصدق إن الطبق ده بيتعمل في 10 دقائق"', desc:'Hook افتتاحي قوي لفيديو تحضير سريع يجذب الانتباه في أول ثانيتين', tip:'اعرض النتيجة النهائية في أول 2 ثانية' },
  { id:4,  domain:'restaurant', type:'campaign',tag:'📢 حملة',   tagBg:'#FFF3E0', title:'حملة "وجبة الأسبوع" مع Countdown', desc:'كل أسبوع ارفع وجبة مميزة بسعر خاص مع كاونتداون — يخلق urgency حقيقي', tip:'استخدم Story مع countdown sticker على إنستجرام' },
  { id:5,  domain:'restaurant', type:'tip',     tag:'💡 نصيحة', tagBg:'#F3E5F5', title:'وقت النشر الذهبي للمطاعم', desc:'انشر في 11ص (قبل الغداء) و5م (قبل العشا) — أعلى engagement للمطاعم', tip:'الخميس والجمعة الأعلى تفاعلاً للمطاعم في منطقتنا' },
  { id:6,  domain:'restaurant', type:'content', tag:'📱 محتوى', tagBg:'#E8F5E9', title:'مسابقة "خمّن الطبق"', desc:'ارفع صورة مقربة جداً من الطبق واطلب من المتابعين يخمّنوا', tip:'يرفع التعليقات بشكل كبير — أضف جائزة بسيطة للفائز' },
  { id:7,  domain:'restaurant', type:'video',   tag:'🎬 فيديو',  tagBg:'#E3F2FD', title:'مقارنة قبل وبعد التحضير', desc:'الخامات الخام مقابل الطبق النهائي — transformation رائع يجذب المشاهدة', tip:'اجعل المونتاج سريعاً — لا يتجاوز 15 ثانية لأفضل نتيجة' },
  { id:8,  domain:'restaurant', type:'tip',     tag:'💡 نصيحة', tagBg:'#F3E5F5', title:'صور الأكل في الضوء الطبيعي', desc:'الضوء الطبيعي من النافذة يجعل الأكل يبدو أشهى بـ 3 أضعاف من الفلاش', tip:'الوقت المثالي للتصوير من 9ص حتى 12م' },

  // FASHION
  { id:9,  domain:'fashion', type:'content', tag:'📱 محتوى', tagBg:'#E8F5E9', title:'3 لوكات من قطعة واحدة', desc:'أظهر كيف قطعة واحدة تنفع لمواقف مختلفة — عملي ومفيد ويرفع المبيعات', tip:'استخدم نفس الخلفية عشان الفرق يبان أكتر' },
  { id:10, domain:'fashion', type:'video',   tag:'🎬 فيديو',  tagBg:'#E3F2FD', title:'Try-On Haul بتعليقات طبيعية', desc:'جرّب مجموعة منتجات جديدة أمام الكاميرا مع ردود فعل طبيعية وصادقة', tip:'الردود الطبيعية غير المصطنعة تبني ثقة أكبر بكثير' },
  { id:11, domain:'fashion', type:'hook',    tag:'🪝 Hook',   tagBg:'#FCE4EC', title:'"الغلطة اللي بتخلي ملابسك تبان غلط"', desc:'Hook يجذب الاهتمام ويخلق فضول قوي يمنع التمرير', tip:'ابدأ بالمشكلة قبل الحل — لا تكشف الحل في الـ Hook' },
  { id:12, domain:'fashion', type:'campaign',tag:'📢 حملة',   tagBg:'#FFF3E0', title:'حملة "لوك اليوم" اليومية', desc:'كل يوم لوك مختلف لأسبوع كامل — يبني عادة المتابعة اليومية عند جمهورك', tip:'حدد وقت ثابت للنشر كل يوم — الاتساق أهم من الكمال' },
  { id:13, domain:'fashion', type:'tip',     tag:'💡 نصيحة', tagBg:'#F3E5F5', title:'الألوان الأكثر مبيعاً حسب الموسم', desc:'خطط محتواك على الألوان الترند في كل موسم للحصول على أعلى تفاعل', tip:'تابع Pinterest Trend Reports و Google Trends كل موسم' },
  { id:14, domain:'fashion', type:'content', tag:'📱 محتوى', tagBg:'#E8F5E9', title:'Casual vs Formal نفس الميزانية', desc:'قارن بين لوك كاجوال ورسمي بنفس الميزانية — محتوى مفيد جداً', tip:'اسأل جمهورك أيهما يفضلون في التعليقات' },
  { id:15, domain:'fashion', type:'video',   tag:'🎬 فيديو',  tagBg:'#E3F2FD', title:'Get Ready With Me — يوم خاص', desc:'ارتدي ملابسك للمناسبة خطوة خطوة — محتوى تفاعلي عالي', tip:'ذكر المناسبة في العنوان يرفع البحث العضوي' },

  // ECOMMERCE
  { id:16, domain:'ecommerce', type:'content', tag:'📱 محتوى', tagBg:'#E8F5E9', title:'Unboxing المنتج بتفاعل طبيعي', desc:'افتح المنتج أمام الكاميرا بتفاعل طبيعي وغير مصطنع — يبني ثقة عالية', tip:'أظهر التغليف والتفاصيل الصغيرة — الناس تحب التفاصيل' },
  { id:17, domain:'ecommerce', type:'campaign',tag:'📢 حملة',   tagBg:'#FFF3E0', title:'Flash Sale 24 ساعة فقط', desc:'خصم مفاجئ لـ 24 ساعة بس — urgency حقيقي يرفع المبيعات بشكل كبير', tip:'أضف countdown timer في الستوري وفي الموقع' },
  { id:18, domain:'ecommerce', type:'hook',    tag:'🪝 Hook',   tagBg:'#FCE4EC', title:'"لو اشتريت ده قبل كده كنت وفّرت كتير"', desc:'Hook يثير الندم المحفّز على اتخاذ قرار الشراء الآن', tip:'اربطه بمشكلة حقيقية يعاني منها جمهورك المستهدف' },
  { id:19, domain:'ecommerce', type:'tip',     tag:'💡 نصيحة', tagBg:'#F3E5F5', title:'صورة المنتج على خلفية بيضاء + في السياق', desc:'دمج صورة على خلفية بيضاء مع صورة في الاستخدام الحقيقي يرفع المبيعات 40%', tip:'الصورة في السياق الحقيقي أكثر تأثيراً في قرار الشراء' },
  { id:20, domain:'ecommerce', type:'content', tag:'📱 محتوى', tagBg:'#E8F5E9', title:'أكثر 5 منتجات مبيعاً هذا الشهر', desc:'شارك Best Sellers كل شهر — Social Proof قوي يشجع على الشراء', tip:'أضف عدد الطلبات أو تقييم النجوم إذا كانت النتائج إيجابية' },
  { id:21, domain:'ecommerce', type:'video',   tag:'🎬 فيديو',  tagBg:'#E3F2FD', title:'مراجعة صادقة من عميل حقيقي', desc:'اطلب من عميل راضٍ يراجع المنتج بدون script مُعد — يزيد الثقة 10 أضعاف', tip:'عدم الكمال يزيد المصداقية — لا تحرر الفيديو كثيراً' },
  { id:22, domain:'ecommerce', type:'campaign',tag:'📢 حملة',   tagBg:'#FFF3E0', title:'برنامج Referral للعملاء', desc:'كل عميل يجلب عميل جديد يحصل على خصم — نمو عضوي مجاني', tip:'اجعل المكافأة جذابة بما يكفي للمشاركة الطبيعية' },

  // BEAUTY
  { id:23, domain:'beauty', type:'video',   tag:'🎬 فيديو',  tagBg:'#E3F2FD', title:'تيوتوريال ماكياج كامل في 5 دقائق', desc:'لوك كامل في 5 دقائق — سريع وعملي ومفيد ويُشارَك بكثرة', tip:'أظهر أسماء المنتجات المستخدمة بوضوح في كل خطوة' },
  { id:24, domain:'beauty', type:'content', tag:'📱 محتوى', tagBg:'#E8F5E9', title:'روتين عناية الصباح خطوة خطوة', desc:'من الغسيل حتى الـ SPF — تعليمي ومفيد ويبني ثقة الجمهور بك', tip:'ذكر أسماء المنتجات وأسعارها يزيد التفاعل بشكل كبير' },
  { id:25, domain:'beauty', type:'hook',    tag:'🪝 Hook',   tagBg:'#FCE4EC', title:'"الخطأ اللي بيخلي بشرتك تبان متعبة"', desc:'Hook يجذب اهتمام كل اهتمام بالعناية بالبشرة', tip:'ابدأ بالمشكلة الشائعة التي يعانيها جمهورك بالضبط' },
  { id:26, domain:'beauty', type:'campaign',tag:'📢 حملة',   tagBg:'#FFF3E0', title:'تحدي "قبل وبعد بدون فلاتر"', desc:'نتائج حقيقية بدون تعديل أو فلاتر — يبني ثقة هائلة في المنتج', tip:'الأصالة هي أقوى أداة تسويقية في عالم التجميل الآن' },
  { id:27, domain:'beauty', type:'tip',     tag:'💡 نصيحة', tagBg:'#F3E5F5', title:'Ring Light = صور احترافية بسعر بسيط', desc:'Ring Light أساسية تحوّل صور منتجاتك لاحترافية بأقل تكلفة', tip:'ضعها أمامك مباشرة لتحصل على catchlight جميل في العين' },
  { id:28, domain:'beauty', type:'content', tag:'📱 محتوى', tagBg:'#E8F5E9', title:'أفضل 3 منتجات بأقل من 100 جنيه', desc:'قيمة عالية بسعر منخفض — يجذب شريحة واسعة ويُشارَك بكثرة', tip:'محتوى Budget-Friendly يحصل على تفاعل عالٍ جداً' },

  // TECH
  { id:29, domain:'tech', type:'video',    tag:'🎬 فيديو',  tagBg:'#E3F2FD', title:'Demo المنتج في 60 ثانية بالضبط', desc:'أظهر المشكلة ثم الحل بمنتجك في دقيقة واحدة — مباشر وفعّال جداً', tip:'ابدأ بالمشكلة في أول 3 ثواني — لا تضيع الوقت في المقدمات' },
  { id:30, domain:'tech', type:'content',  tag:'📱 محتوى', tagBg:'#E8F5E9', title:'نصيحة تقنية واحدة كل أسبوع', desc:'نصيحة واحدة مفيدة كل أسبوع — يبني مكانة الخبير تدريجياً', tip:'البساطة أهم من العمق — اشرح لشخص غير متخصص' },
  { id:31, domain:'tech', type:'hook',     tag:'🪝 Hook',   tagBg:'#FCE4EC', title:'"90% من الناس بيضيّعوا وقتهم في ده"', desc:'Hook يثير الفضول والخوف من الخسارة — أحد أقوى محركات التفاعل', tip:'الأرقام الكبيرة تجذب الانتباه — تأكد من صحة الرقم' },
  { id:32, domain:'tech', type:'campaign', tag:'📢 حملة',   tagBg:'#FFF3E0', title:'سلسلة "مشكلة + حل" الأسبوعية', desc:'في كل بوست: مشكلة شائعة + الحل بمنتجك — Pattern ناجح جداً', tip:'اجعلها سلسلة مرقمة حتى يتابع الجمهور الحلقات القادمة' },
  { id:33, domain:'tech', type:'tip',      tag:'💡 نصيحة', tagBg:'#F3E5F5', title:'LinkedIn للـ B2B أقوى من Instagram', desc:'لو جمهورك شركات ومحترفين، LinkedIn يوصلك لهم أسرع وأرخص', tip:'انشر مقالات قصيرة مع insights حصرية لا تجدها في مكان آخر' },
  { id:34, domain:'tech', type:'content',  tag:'📱 محتوى', tagBg:'#E8F5E9', title:'مقارنة مع المنافسين بموضوعية', desc:'مقارنة صادقة تُظهر مميزاتك بدون هجوم — تبني ثقة كبيرة', tip:'اذكر نقاط ضعفك أيضاً لتزيد مصداقيتك وتميز نفسك' },

  // SERVICES
  { id:35, domain:'services', type:'content',  tag:'📱 محتوى', tagBg:'#E8F5E9', title:'قصة نجاح عميل بالأرقام', desc:'قبل وبعد العمل معك — أقوى دليل على كفاءتك أمام العملاء الجدد', tip:'احصل على إذن العميل وادعم القصة بأرقام وإحصاءات محددة' },
  { id:36, domain:'services', type:'video',    tag:'🎬 فيديو',  tagBg:'#E3F2FD', title:'يوم في حياة عملك اليومي', desc:'أظهر روتين عملك اليومي — يبني ألفة مع الجمهور ويميزك', tip:'أظهر التحديات الحقيقية وليس فقط النجاحات واللحظات الجيدة' },
  { id:37, domain:'services', type:'hook',     tag:'🪝 Hook',   tagBg:'#FCE4EC', title:'"لو مش بتعمل الخطوة دي، بتخسر عملاء يومياً"', desc:'Hook يثير القلق المحرّك على اتخاذ تصرف فوري', tip:'تأكد أن الخطوة فعلاً مفيدة وليست مبالغة — المصداقية أهم' },
  { id:38, domain:'services', type:'campaign', tag:'📢 حملة',   tagBg:'#FFF3E0', title:'حملة "استشارة مجانية 15 دقيقة"', desc:'استشارة مجانية محدودة المقاعد — Lead Magnet ممتاز جداً', tip:'قيّد الأماكن المتاحة عشان تخلق urgency حقيقي' },
  { id:39, domain:'services', type:'tip',      tag:'💡 نصيحة', tagBg:'#F3E5F5', title:'Testimonials بالفيديو أقوى 10 أضعاف', desc:'فيديو عميل راضٍ يتكلم بصدق = أفضل إعلان ممكن على الإطلاق', tip:'سؤالان فقط: المشكلة قبلك + النتيجة الملموسة بعدك' },
  { id:40, domain:'services', type:'content',  tag:'📱 محتوى', tagBg:'#E8F5E9', title:'أشهر 5 أسئلة من العملاء مع الإجابات', desc:'Q&A يُظهر خبرتك ويعالج اعتراضات العملاء مسبقاً', tip:'حوّل كل سؤال لبوست منفصل — مصدر لا ينضب للمحتوى' },

  // GENERAL
  { id:41, domain:'general', type:'tip',     tag:'💡 نصيحة', tagBg:'#F3E5F5', title:'قاعدة 80/20 في المحتوى الذهبية', desc:'80% محتوى مفيد وترفيهي + 20% بيع مباشر — هذا هو السر الحقيقي', tip:'الناس تتابعك لتستفيد، لا لتُباع لها — اعكس هذه المعادلة' },
  { id:42, domain:'general', type:'tip',     tag:'💡 نصيحة', tagBg:'#F3E5F5', title:'أوقات الذروة للجمهور العربي', desc:'7-9 صباحاً + 12-2 ظهراً + 7-10 مساءً — أعلى نشاط للجمهور العربي', tip:'افتح الـ Insights في حسابك وتحقق من وقت جمهورك تحديداً' },
  { id:43, domain:'general', type:'hook',    tag:'🪝 Hook',   tagBg:'#FCE4EC', title:'أقوى 5 كلمات في التسويق العربي', desc:'"مجاني، جديد، الآن، أنت، لماذا" — ادمجهم بذكاء في عناوينك', tip:'كلمة "أنت" المباشرة تضاعف التفاعل — خاطب القارئ مباشرة' },
  { id:44, domain:'general', type:'campaign',tag:'📢 حملة',   tagBg:'#FFF3E0', title:'حملة User Generated Content (UGC)', desc:'اطلب من عملاءك يشاركوا تجربتهم بـ Hashtag خاص — محتوى مجاني لا نهائي', tip:'قدّم جائزة رمزية كل أسبوع لأفضل محتوى — يرفع المشاركة' },
  { id:45, domain:'general', type:'tip',     tag:'💡 نصيحة', tagBg:'#F3E5F5', title:'Consistency أهم من Perfection', desc:'انشر بانتظام حتى لو المحتوى بسيط — أفضل من محتوى مثالي نادر', tip:'جدول أسبوعي ثابت وواضح أفضل بكثير من انفجار محتوى ثم صمت' },
  { id:46, domain:'general', type:'content', tag:'📱 محتوى', tagBg:'#E8F5E9', title:'Carousel "5 نصائح" أو "3 أخطاء"', desc:'Carousel Posts تحصل على أعلى Reach في Instagram وLinkedIn', tip:'السلايد الأولى هي الأهم — اجعلها مثيرة للفضول جداً' },
  { id:47, domain:'general', type:'hook',    tag:'🪝 Hook',   tagBg:'#FCE4EC', title:'"الحقيقة التي لا يخبرك بها أحد عن..."', desc:'Hook يثير الفضول ويكسر التوقعات — أحد أكثر الـ Hooks فيرالية', tip:'تأكد أن المحتوى يقدم فعلاً معلومة قيّمة — لا تخذل المشاهد' },
  { id:48, domain:'general', type:'campaign',tag:'📢 حملة',   tagBg:'#FFF3E0', title:'تحدي 30 يوم محتوى يومي', desc:'محتوى يومي لشهر كامل — يبني Following قوي ويرفع الـ Reach بشكل كبير', tip:'ضع الأفكار الـ 30 كاملة قبل ما تبدأ — لا تترك أي يوم للارتجال' },
  { id:49, domain:'general', type:'tip',     tag:'💡 نصيحة', tagBg:'#F3E5F5', title:'CTA واضح في كل بوست بدون استثناء', desc:'كل بوست لازم يحتوي على Call-to-Action واضح: تعليق، شير، تواصل', tip:'سؤال مباشر في نهاية البوست يضاعف عدد التعليقات' },
  { id:50, domain:'general', type:'content', tag:'📱 محتوى', tagBg:'#E8F5E9', title:'Repost المحتوى القديم الناجح', desc:'أعد نشر المحتوى الذي نجح قبل 6 أشهر — 80% من جمهورك لم يره', tip:'غيّر الـ Caption فقط وليس الصورة أو الفيديو — وفّر الوقت والجهد' },
];

// ============================================================
// CAMPAIGNS DATA
// ============================================================
const campaignsData = [
  {
    id:1, title:'حملة سوشيال ميديا شاملة', badge:'badge-social', badgeText:'سوشيال ميديا',
    desc:'حملة متكاملة لرفع الوعي والتفاعل على جميع منصات التواصل الاجتماعي خلال 30 يوماً',
    steps:[
      'الأسبوع 1: رفع 3 بوستات تعريفية بالبراند وقيمته',
      'الأسبوع 2: محتوى تعليمي ونصائح مفيدة للجمهور',
      'الأسبوع 3: Social Proof وشهادات عملاء حقيقيين',
      'الأسبوع 4: Call-to-Action مباشر وعروض مغرية',
      'القياس: تتبع Reach وEngagement وFollowers كل أسبوع',
    ]
  },
  {
    id:2, title:'حملة فيديو فيرال', badge:'badge-video', badgeText:'فيديو',
    desc:'استراتيجية لإنشاء محتوى فيديو قابل للانتشار الواسع على TikTok وInstagram Reels',
    steps:[
      'البحث عن Trending Sounds والـ Hooks الأكثر فيرالية هذا الأسبوع',
      'تصوير 3-5 فيديوهات قصيرة (7-30 ثانية) بأسلوب طبيعي',
      'استخدام Trending Hashtags + Hashtags خاصة بمجالك',
      'نشر في أوقات الذروة وتفاعل مع التعليقات الأولى خلال ساعة',
      'تحليل النتائج وتكرار الـ Format الأنجح',
    ]
  },
  {
    id:3, title:'حملة Email Marketing', badge:'badge-email', badgeText:'إيميل',
    desc:'سلسلة إيميلات تسويقية تبني علاقة مع العملاء وتحول المشتركين إلى مشترين',
    steps:[
      'الإيميل 1 (فوراً): ترحيب + هدية مجانية (PDF، خصم، أو نصيحة حصرية)',
      'الإيميل 2 (اليوم 3): قصة البراند وما يميزك عن المنافسين',
      'الإيميل 3 (اليوم 7): قيمة مجانية — نصائح أو محتوى تعليمي',
      'الإيميل 4 (اليوم 14): شهادات عملاء وقصص نجاح بالأرقام',
      'الإيميل 5 (اليوم 21): عرض خاص محدود المدة مع Urgency حقيقي',
    ]
  },
  {
    id:4, title:'حملة Meta Ads محترفة', badge:'badge-ads', badgeText:'إعلانات',
    desc:'استراتيجية إعلانات مدفوعة على فيسبوك وإنستجرام لتحقيق أعلى عائد على الاستثمار',
    steps:[
      'المرحلة 1 - Awareness: إعلانات Reach لأكبر شريحة ممكنة بميزانية صغيرة',
      'المرحلة 2 - Consideration: استهداف من تفاعل مع الـ Awareness بمحتوى أعمق',
      'المرحلة 3 - Conversion: Retargeting للمهتمين بعرض مباشر قوي',
      'الاستهداف: اهتمامات + Custom Audience + Lookalike Audience',
      'القياس: CPM, CPC, ROAS — اوقف الإعلان الأقل من 2x ROAS',
    ]
  },
  {
    id:5, title:'حملة Influencer Marketing', badge:'badge-social', badgeText:'مؤثرين',
    desc:'استراتيجية التسويق عبر المؤثرين لبناء مصداقية وتوسيع الانتشار',
    steps:[
      'اختر Micro-Influencers (10K-100K) في مجالك — أعلى تفاعلاً وأقل تكلفة',
      'تحقق من Engagement Rate — لازم يكون أعلى من 3%',
      'اتفق على Brief واضح: رسالة محددة + لا قيود على الأسلوب الشخصي',
      'اطلب Authentic Content وليس إعلان مباشر مكشوف',
      'تتبع النتائج: كود خصم خاص أو Tracking Link لكل مؤثر',
    ]
  },
  {
    id:6, title:'حملة Launch منتج جديد', badge:'badge-video', badgeText:'لانش',
    desc:'خطة إطلاق منتج جديد تخلق ضجة وتحقق مبيعات قوية من اليوم الأول',
    steps:[
      'الأسبوع 4 قبل الإطلاق: Teaser مثير للفضول بدون كشف المنتج',
      'الأسبوع 2 قبل الإطلاق: Countdown + كشف تدريجي للمزايا',
      'يوم الإطلاق: محتوى كثيف + Flash Sale لأول 24 ساعة + Live',
      'الأسبوع 1 بعد الإطلاق: شهادات أوائل المشترين + أسئلة وأجوبة',
      'الشهر الأول: حملة Reviews + UGC + Retargeting للمترددين',
    ]
  },
];

// ============================================================
// PAGE NAVIGATION
// ============================================================
function goPage(name) {
  document.querySelectorAll('.page').forEach(function(p) {
    p.classList.remove('active');
    p.style.display = 'none';
  });
  const pg = document.getElementById('page-' + name);
  if (!pg) { console.warn('Page not found: page-' + name); return; }
  pg.classList.add('active');
  pg.style.display = (name === 'dashboard') ? 'flex' : 'block';

  // Nav visibility
  const nav = document.getElementById('main-nav');
  if (nav) nav.style.display = (name === 'login' || name === 'signup') ? 'none' : 'flex';

  // Callbacks
  if (name === 'login' || name === 'signup') setTimeout(initAuthPage, 100);
  if (name === 'dashboard') setTimeout(initDashboard, 100);
  if (name === 'services')  {
    try { sessionStorage.setItem('prev_page', getPrevPage()); } catch(e) {}
  }

  window.scrollTo(0, 0);
  try { history.pushState({ page: name }, '', '#' + name); } catch(e) {}
}

function getPrevPage() {
  const active = document.querySelector('.page.active');
  return active ? (active.id.replace('page-', '') || 'landing') : 'landing';
}

window.onpopstate = function(e) {
  if (e.state && e.state.page) {
    goPage(e.state.page);
  }
};

// ============================================================
// AUTH
// ============================================================
function initAuthPage() {
  try {
    const saved = localStorage.getItem('soqly_remember_email');
    if (saved) {
      const el = document.getElementById('login-email');
      if (el) el.value = saved;
    }
  } catch(e) {}
}

function switchAuthTab(tab) {
  const loginForm  = document.getElementById('auth-login-form');
  const signupForm = document.getElementById('auth-signup-form');
  const loginBtn   = document.getElementById('tab-login-btn');
  const signupBtn  = document.getElementById('tab-signup-btn');
  if (!loginForm) return;

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    loginBtn.classList.add('active');
    signupBtn.classList.remove('active');
  } else {
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    signupBtn.classList.add('active');
    loginBtn.classList.remove('active');
  }
}

async function handleLogin() {
  const email    = (document.getElementById('login-email')   || {}).value || '';
  const password = (document.getElementById('login-pass')    || {}).value || '';
  const remember = (document.getElementById('remember-me')   || {}).checked || false;

  if (!email || !password) { showToast('الإيميل وكلمة المرور مطلوبان ❌'); return; }

  const btn = document.querySelector('.btn-auth-login');
  if (btn) { btn.textContent = 'جاري الدخول...'; btn.disabled = true; }

  try {
    if (_sb) {
      const { data, error } = await _sb.auth.signInWithPassword({ email, password });
      if (error) {
        showToast('بيانات غير صحيحة — تأكد من الإيميل وكلمة المرور ❌');
        if (btn) { btn.textContent = 'تسجيل الدخول 🚀'; btn.disabled = false; }
        return;
      }
      currentUser = data.user;
    }
    try {
      localStorage.setItem('soqly_loggedIn', 'true');
      if (remember && email) localStorage.setItem('soqly_remember_email', email);
    } catch(e) {}
    showToast('أهلاً بك! 🎉');
    setTimeout(function() { goPage('dashboard'); }, 600);
  } catch(e) {
    showToast('خطأ في الاتصال — تأكد من الإنترنت ❌');
    if (btn) { btn.textContent = 'تسجيل الدخول 🚀'; btn.disabled = false; }
  }
}

async function handleSignup() {
  const name     = (document.getElementById('signup-name')  || {}).value || '';
  const email    = (document.getElementById('signup-email') || {}).value || '';
  const password = (document.getElementById('signup-pass')  || {}).value || '';

  if (!name || !email || !password) { showToast('كل الحقول مطلوبة ❌'); return; }
  if (password.length < 6) { showToast('كلمة المرور أقل من 6 أحرف ❌'); return; }

  const btn = document.querySelector('.btn-auth-signup');
  if (btn) { btn.textContent = 'جاري التسجيل...'; btn.disabled = true; }

  try {
    if (_sb) {
      const { data, error } = await _sb.auth.signUp({
        email, password,
        options: { data: { name } }
      });
      if (error) {
        showToast('خطأ: ' + error.message + ' ❌');
        if (btn) { btn.textContent = 'إنشاء حساب مجاني 🎉'; btn.disabled = false; }
        return;
      }
      currentUser = data.user;
      if (_sb && data.user) {
        await _sb.from('users').upsert([{ id: data.user.id, name, email, plan: 'free' }]);
      }
    }
    try { localStorage.setItem('soqly_loggedIn', 'true'); } catch(e) {}
    showToast('تم إنشاء حسابك! 🎉');
    setTimeout(function() { goPage('dashboard'); }, 600);
  } catch(e) {
    showToast('خطأ في الاتصال ❌');
    if (btn) { btn.textContent = 'إنشاء حساب مجاني 🎉'; btn.disabled = false; }
  }
}

async function logout() {
  try {
    if (_sb) await _sb.auth.signOut();
    localStorage.removeItem('soqly_loggedIn');
    currentUser = null;
  } catch(e) {}
  goPage('landing');
}

// ============================================================
// DASHBOARD
// ============================================================
function initDashboard() {
  switchTab('home');
  loadUserInfo();
}

function loadUserInfo() {
  try {
    const name = localStorage.getItem('soqly_user_name') || 'مرحباً';
    const el = document.getElementById('dash-user-name');
    if (el) el.textContent = name;
  } catch(e) {}
}

function switchTab(name, el) {
  document.querySelectorAll('.tab-c').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.sb-item').forEach(function(i) { i.classList.remove('active'); });

  const tab = document.getElementById('tab-' + name);
  if (tab) tab.classList.add('active');
  if (el) el.classList.add('active');
  else {
    const sbItem = document.querySelector('[data-tab="' + name + '"]');
    if (sbItem) sbItem.classList.add('active');
  }

  // Lazy render
  if (name === 'ideas')     setTimeout(renderLibrary, 50);
  if (name === 'campaigns') setTimeout(renderCampaigns, 50);
  if (name === 'calendar')  setTimeout(renderCalendar, 50);
  if (name === 'results')   setTimeout(renderResultsHistory, 50);
  if (name === 'projects')  setTimeout(renderProjects, 50);
}

// ============================================================
// SERVICES WIZARD
// ============================================================
function initServicesPage() {
  Object.assign(state, {
    domain:'', domainName:'', serviceType:'', serviceName:'', serviceIcon:'',
    projectName:'', projectType:'', audience:'', budget:'',
    description:'', prices:'', platform:'', videoType:'', scriptType:'', contentType:'',
    currentStep: 1
  });
  wzGoStep(1);
  buildDomainCards();
}

function handleServicesBack() {
  if (state.currentStep <= 1) {
    try {
      const prev = sessionStorage.getItem('prev_page') || 'landing';
      goPage(prev);
    } catch(e) { goPage('landing'); }
  } else {
    wzGoStep(state.currentStep - 1);
  }
}

function wzGoStep(n) {
  if (n > state.currentStep + 1) return;
  state.currentStep = n;
  for (let i = 1; i <= 4; i++) {
    const step = document.getElementById('wz' + i);
    const cont = document.getElementById('wz-content-' + i);
    if (step) step.classList.toggle('active', i === n);
    if (step) step.classList.toggle('done',   i < n);
    if (cont) cont.classList.toggle('active', i === n);
  }
}

function buildDomainCards() {
  const container = document.getElementById('domain-cards');
  if (!container) return;
  container.innerHTML = Object.entries(domainServices).map(function(entry) {
    const key = entry[0], d = entry[1];
    return '<div class="dom-card" onclick="selectDomain(\'' + key + '\',this)">' +
      '<div class="dom-ico">' + d.icon + '</div>' +
      '<div class="dom-name">' + d.name + '</div>' +
      '<div class="dom-count">' + d.services.length + ' خدمات</div>' +
      '</div>';
  }).join('');
}

function selectDomain(key, el) {
  if (!domainServices[key]) return;
  state.domain = key;
  state.domainName = domainServices[key].name;
  document.querySelectorAll('.dom-card').forEach(function(c) { c.classList.remove('selected'); });
  if (el) el.classList.add('selected');
  buildServiceCards(key);
  setTimeout(function() { wzGoStep(2); }, 200);
}

function buildServiceCards(domain) {
  const container = document.getElementById('service-cards');
  if (!container) return;
  const d = domainServices[domain];
  if (!d) return;
  document.getElementById('step2-domain-name').textContent = d.icon + ' ' + d.name;
  container.innerHTML = d.services.map(function(s, i) {
    return '<div class="svc-card" onclick="selectService(\'' + s.type + '\',\'' + s.name + '\',\'' + s.icon + '\',' + i + ')">' +
      '<div class="svc-ico">' + s.icon + '</div>' +
      '<div class="svc-name">' + s.name + '</div>' +
      '<div class="svc-desc">' + s.desc + '</div>' +
      '</div>';
  }).join('');
}

function selectService(type, name, icon, idx) {
  state.serviceType = type;
  state.serviceName = name;
  state.serviceIcon = icon;
  document.querySelectorAll('.svc-card').forEach(function(c) { c.classList.remove('selected'); });
  const cards = document.querySelectorAll('.svc-card');
  if (cards[idx]) cards[idx].classList.add('selected');
  buildStep3(type);
  setTimeout(function() { wzGoStep(3); }, 200);
}

function buildStep3(type) {
  const container = document.getElementById('step3-form');
  if (!container) return;

  document.getElementById('step3-service-name').textContent = state.serviceIcon + ' ' + state.serviceName;

  const savedProject = getSavedProject();

  let extraHTML = '';
  if (type === 'video') {
    extraHTML = '<div class="form-group full"><div class="form-label">نوع الفيديو</div>' +
      '<div class="type-cards">' +
      ['reels_short','tiktok_trend','testimonial','tutorial'].map(function(v, i) {
        const labels = ['ريلز قصير 15ث','TikTok Trend','شهادة عميل','تيوتوريال'];
        const icons  = ['⚡','🎵','⭐','📚'];
        return '<div class="type-card" onclick="selectTypeCard(this,\'videoType\',\'' + v + '\')">' +
          '<div class="type-card-ico">' + icons[i] + '</div>' +
          '<div class="type-card-name">' + labels[i] + '</div></div>';
      }).join('') + '</div></div>' +
      '<div class="form-group full"><div class="form-label">أسلوب السكريبت</div>' +
      '<div class="type-cards">' +
      ['hook_first','story','problem_solution','trend'].map(function(v, i) {
        const labels = ['Hook أولاً','قصة','مشكلة وحل','Trend'];
        const icons  = ['🪝','📖','🔧','🔥'];
        return '<div class="type-card" onclick="selectTypeCard(this,\'scriptType\',\'' + v + '\')">' +
          '<div class="type-card-ico">' + icons[i] + '</div>' +
          '<div class="type-card-name">' + labels[i] + '</div></div>';
      }).join('') + '</div></div>';
  } else if (type === 'content') {
    extraHTML = '<div class="form-group full"><div class="form-label">المنصة المستهدفة</div>' +
      '<div class="type-cards">' +
      ['instagram','tiktok','facebook','youtube'].map(function(v, i) {
        const labels = ['Instagram','TikTok','Facebook','YouTube'];
        const icons  = ['📸','🎵','👍','▶️'];
        return '<div class="type-card" onclick="selectTypeCard(this,\'platform\',\'' + v + '\')">' +
          '<div class="type-card-ico">' + icons[i] + '</div>' +
          '<div class="type-card-name">' + labels[i] + '</div></div>';
      }).join('') + '</div></div>';
  }

  container.innerHTML =
    '<div class="form-grid">' +
    '<div class="form-group">' +
      '<label class="form-label">اسم المشروع *</label>' +
      '<input class="form-inp" id="f-project-name" placeholder="مثال: مطعم البيت" value="' + (savedProject.projectName || '') + '"/>' +
    '</div>' +
    '<div class="form-group">' +
      '<label class="form-label">نوع المشروع</label>' +
      '<input class="form-inp" id="f-project-type" placeholder="مثال: مطعم عائلي شعبي" value="' + (savedProject.projectType || '') + '"/>' +
    '</div>' +
    '<div class="form-group">' +
      '<label class="form-label">الجمهور المستهدف</label>' +
      '<input class="form-inp" id="f-audience" placeholder="مثال: شباب 20-35 القاهرة" value="' + (savedProject.audience || '') + '"/>' +
    '</div>' +
    '<div class="form-group">' +
      '<label class="form-label">الميزانية التسويقية</label>' +
      '<div style="display:flex;gap:8px">' +
        '<input class="form-inp" id="f-budget" placeholder="مثال: 2000" style="flex:1" value="' + (savedProject.budget || '') + '" type="number"/>' +
        '<select class="form-inp" id="f-currency" style="width:90px">' +
          currencies.map(function(c) {
            return '<option value="' + c.code + '" ' + (c.code === currentCurrency.code ? 'selected' : '') + '>' + c.flag + ' ' + c.code + '</option>';
          }).join('') +
        '</select>' +
      '</div>' +
    '</div>' +
    '<div class="form-group">' +
      '<label class="form-label">أسعار منتجاتك</label>' +
      '<input class="form-inp" id="f-prices" placeholder="مثال: الوجبة من 80 - 150 جنيه" value="' + (savedProject.prices || '') + '"/>' +
    '</div>' +
    '<div class="form-group full">' +
      '<label class="form-label">وصف مشروعك</label>' +
      '<textarea class="form-inp" id="f-description" rows="3" placeholder="اكتب عن مشروعك ومميزاته...">' + (savedProject.description || '') + '</textarea>' +
    '</div>' +
    extraHTML +
    '</div>';
}

function selectTypeCard(el, key, val) {
  const parent = el.closest('.type-cards');
  if (parent) parent.querySelectorAll('.type-card').forEach(function(c) { c.classList.remove('selected'); });
  el.classList.add('selected');
  state[key] = val;
}

function getSavedProject() {
  try { return JSON.parse(localStorage.getItem('soqly_project') || '{}'); } catch(e) { return {}; }
}

function saveFormData() {
  const data = {
    projectName:   (document.getElementById('f-project-name') || {}).value || '',
    projectType:   (document.getElementById('f-project-type') || {}).value || '',
    audience:      (document.getElementById('f-audience')     || {}).value || '',
    budget:        (document.getElementById('f-budget')       || {}).value || '',
    budgetCurrency:(document.getElementById('f-currency')     || {}).value || 'EGP',
    prices:        (document.getElementById('f-prices')       || {}).value || '',
    description:   (document.getElementById('f-description')  || {}).value || '',
  };
  Object.assign(state, data);
  try { localStorage.setItem('soqly_project', JSON.stringify(data)); } catch(e) {}
  return data;
}

function startServiceFlow(domainKey) {
  initServicesPage();
  goPage('services');
  setTimeout(function() { selectDomain(domainKey); }, 100);
}

// ============================================================
// AI GENERATION
// ============================================================
async function generateWithAI() {
  const data = saveFormData();
  if (!data.projectName) { showToast('اكتب اسم المشروع أولاً ❌'); return; }

  wzGoStep(4);
  showResultLoading(true);

  const prompt = buildPrompt(data);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      })
    });
    const result = await response.json();
    if (result.content && result.content[0]) {
      const text = result.content[0].text;
      showResult(text);
    } else {
      showResult(generateLocalResult(state.serviceType));
    }
  } catch(e) {
    showResult(generateLocalResult(state.serviceType));
  }
}

function buildPrompt(data) {
  const svcMap = {
    content:'توليد 20 فكرة محتوى متنوعة وعملية',
    plan:   'إنشاء خطة تسويق شهرية كاملة ومفصّلة',
    video:  'كتابة سكريبت فيديو احترافي وجذاب',
    campaign:'تصميم حملة تسويقية متكاملة',
    hooks:  'توليد 15 Hook افتتاحي قوي وجذاب',
    calendar:'إنشاء تقويم محتوى أسبوعي مفصّل',
    ads:    'كتابة نصوص إعلانية احترافية لـ Meta Ads',
    email:  'كتابة سلسلة إيميلات تسويقية فعّالة',
    linkedin:'إنشاء استراتيجية LinkedIn احترافية',
    competitor:'تحليل المنافسين وخطة التميز',
    testimonial:'خطة بناء وعرض شهادات العملاء',
    funnel: 'بناء Sales Funnel متكامل للخدمة',
    reels:  'توليد أفكار Reels فيرال ومميزة',
    before_after:'أفكار محتوى قبل وبعد إبداعية',
  };
  const task = svcMap[state.serviceType] || 'إنشاء محتوى تسويقي احترافي';

  return 'أنت خبير تسويق رقمي متخصص. المهمة: ' + task + '\n\n' +
    'المشروع: ' + (data.projectName || 'مشروعي') + '\n' +
    'المجال: ' + (state.domainName || data.projectType) + '\n' +
    'الجمهور: ' + (data.audience || 'الجمهور المستهدف') + '\n' +
    (data.budget ? 'الميزانية: ' + data.budget + ' ' + data.budgetCurrency + '\n' : '') +
    (data.prices ? 'الأسعار: ' + data.prices + '\n' : '') +
    (data.description ? 'الوصف: ' + data.description + '\n' : '') +
    (state.platform ? 'المنصة: ' + state.platform + '\n' : '') +
    (state.videoType ? 'نوع الفيديو: ' + state.videoType + '\n' : '') +
    '\nالشروط:\n' +
    '- النتيجة باللغة العربية الواضحة\n' +
    '- مخصصة تماماً للمشروع المذكور\n' +
    '- عملية وقابلة للتطبيق الفوري\n' +
    '- منظمة بعناوين وأرقام وتفاصيل\n' +
    '- احترافية ومثيرة للتفاعل';
}

function generateLocalResult(type) {
  const name = state.projectName || 'مشروعك';
  const results = {
    content: '💡 أفكار محتوى لـ ' + name + '\n\n' +
      '📱 المحتوى اليومي:\n' +
      '1. فيديو "خلف الكواليس" يومياً\n2. قصة عميل راضٍ أسبوعياً\n3. نصيحة مفيدة لجمهورك\n4. سؤال تفاعلي يومي\n5. عرض أو خصم أسبوعي\n\n' +
      '🎬 أفكار فيديو:\n6. قبل وبعد\n7. Day in the Life\n8. FAQ شائعة\n9. تحدي مع الجمهور\n10. مراجعة منتج أو خدمة\n\n' +
      '📅 جدول النشر:\nالأحد: فيديو منتج | الاثنين: نصيحة | الثلاثاء: خصم\nالأربعاء: خلف الكواليس | الخميس: عميل | الجمعة: ترفيهي',

    plan: '📋 خطة تسويق لـ ' + name + '\n\n' +
      '🎯 الأهداف الشهرية:\n• رفع الوعي بالبراند 30%\n• زيادة التفاعل 50%\n• تحويل 5% من المتابعين لعملاء\n\n' +
      '📅 الخطة الأسبوعية:\nالأسبوع 1: محتوى تعريفي بالبراند\nالأسبوع 2: محتوى تعليمي ومفيد\nالأسبوع 3: Social Proof وشهادات\nالأسبوع 4: عروض وCTA مباشر\n\n' +
      '💰 توزيع الميزانية:\n40% إعلانات مدفوعة | 30% إنتاج محتوى\n20% مؤثرين محليين | 10% تجارب وتحليل',

    video: '🎬 سكريبت فيديو لـ ' + name + '\n\n' +
      '⏱️ المدة: 30-60 ثانية\n\n' +
      '🪝 الـ Hook (ثانية 0-3):\n"لو بتدور على [حل المشكلة]، لازم تشوف ده!"\n\n' +
      '📖 المشهد 1 (ثانية 3-15):\nأظهر المشكلة التي يعاني منها جمهورك بشكل واضح\n\n' +
      '✨ المشهد 2 (ثانية 15-45):\nقدّم الحل من خلال منتجك أو خدمتك مع إظهار النتيجة\n\n' +
      '🎯 الـ CTA (ثانية 45-60):\n"اضغط الرابط في البايو — التوصيل مجاني لفترة محدودة!"\n\n' +
      '📝 الكابشن: جرّب [اسم المنتج] واحكيلنا رأيك في التعليقات 👇',
  };
  return results[type] || results.content;
}

function showResultLoading(show) {
  const loading = document.getElementById('result-loading');
  const content = document.getElementById('result-content');
  if (loading) loading.style.display = show ? 'flex' : 'none';
  if (content) content.style.display = show ? 'none' : 'block';
}

function showResult(text) {
  showResultLoading(false);
  const el = document.getElementById('result-text');
  if (el) el.textContent = text;
  // Save to history
  saveResultToHistory(text);
  // Save to Supabase
  if (_sb && currentUser) saveResultToSupabase(text);
}

function saveResultToHistory(text) {
  try {
    const history = JSON.parse(localStorage.getItem('soqly_results') || '[]');
    history.unshift({
      id: Date.now(),
      serviceName: state.serviceName,
      serviceIcon: state.serviceIcon,
      domain: state.domainName,
      projectName: state.projectName,
      text: text,
      date: new Date().toLocaleDateString('ar-EG'),
    });
    localStorage.setItem('soqly_results', JSON.stringify(history.slice(0, 20)));
  } catch(e) {}
}

async function saveResultToSupabase(text) {
  if (!_sb || !currentUser) return;
  try {
    await _sb.from('results').insert([{
      user_id: currentUser.id,
      service_type: state.serviceType,
      service_name: state.serviceName,
      domain: state.domain,
      result_text: text,
    }]);
  } catch(e) {}
}

async function saveProjectToSupabase(data) {
  if (!_sb || !currentUser) return;
  try {
    await _sb.from('projects').insert([{
      user_id: currentUser.id,
      name: data.projectName || 'مشروعي',
      type: data.projectType || '',
      domain: state.domain || '',
      budget: data.budget || '',
      budget_currency: data.budgetCurrency || 'EGP',
      audience: data.audience || '',
      description: data.description || '',
      prices: data.prices || '',
    }]);
  } catch(e) {}
}

function copyResult() {
  const el = document.getElementById('result-text');
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).catch(function() {});
  showToast('تم النسخ ✅');
}

function downloadResult() {
  const el = document.getElementById('result-text');
  if (!el || !el.textContent.trim()) { showToast('لا توجد نتيجة للتحميل'); return; }
  const blob = new Blob([el.textContent], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sawqly-' + (state.projectName || 'result') + '.txt';
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('تم التحميل ✅');
}

function addToCalendar() {
  const text = encodeURIComponent(state.serviceName + ' — ' + (state.projectName || 'مشروعي'));
  window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + text, '_blank');
}

// ============================================================
// LIBRARY RENDERING
// ============================================================
let libDomainFilter = 'all';
let libTypeFilter   = 'all';
let libSearchQuery  = '';

function renderLibrary() {
  const grid    = document.getElementById('lib-grid');
  const countEl = document.getElementById('lib-count');
  if (!grid) return;

  let items = marketingLibrary;
  if (libDomainFilter !== 'all') items = items.filter(function(i) { return i.domain === libDomainFilter; });
  if (libTypeFilter   !== 'all') items = items.filter(function(i) { return i.type  === libTypeFilter;   });
  if (libSearchQuery) {
    const q = libSearchQuery;
    items = items.filter(function(i) {
      return i.title.includes(q) || i.desc.includes(q) || i.tip.includes(q);
    });
  }

  if (countEl) countEl.textContent = items.length + ' فكرة';

  grid.innerHTML = items.map(function(item) {
    return '<div class="lib-card" onclick="showLibCard(' + item.id + ')">' +
      '<span class="lib-tag" style="background:' + item.tagBg + ';color:#333">' + item.tag + '</span>' +
      '<div class="lib-card-title">' + item.title + '</div>' +
      '<div class="lib-card-desc">' + item.desc + '</div>' +
      '<div class="lib-tip">💡 <strong>نصيحة:</strong> ' + item.tip + '</div>' +
      '</div>';
  }).join('');
}

function filterByDomain(domain, el) {
  libDomainFilter = domain;
  document.querySelectorAll('.lib-filter').forEach(function(b) { b.classList.remove('active'); });
  if (el) el.classList.add('active');
  renderLibrary();
}

function filterByType(type, el) {
  libTypeFilter = type;
  document.querySelectorAll('.lib-type').forEach(function(b) { b.classList.remove('active'); });
  if (el) el.classList.add('active');
  renderLibrary();
}

function filterLibrary(val) {
  libSearchQuery = val;
  renderLibrary();
}

function showLibCard(id) {
  const item = marketingLibrary.find(function(i) { return i.id === id; });
  if (!item) return;
  const html = [
    '<div style="margin-bottom:14px;font-size:13px;line-height:1.8;color:#5D4037">' + item.desc + '</div>',
    '<div style="background:#F5F1EC;border-radius:12px;padding:14px;margin-bottom:18px">',
    '<div style="font-size:12px;font-weight:700;color:#3E2723;margin-bottom:4px">💡 نصيحة الخبير</div>',
    '<div style="font-size:12px;color:#6D4C41">' + item.tip + '</div>',
    '</div>',
    '<button onclick="closeModal()" style="width:100%;padding:12px;border-radius:20px;background:linear-gradient(135deg,#3E2723,#5D4037);border:none;color:white;font-size:13px;font-weight:800;cursor:pointer;font-family:Cairo,sans-serif">&#x2190; طبّق الفكرة دي</button>',
  ].join('');
  openModal(item.title, html);
}

// ============================================================
// CAMPAIGNS RENDERING
// ============================================================
function renderCampaigns() {
  const container = document.getElementById('campaigns-list');
  if (!container) return;

  const typeBadges = { 'badge-social':'#E3F2FD', 'badge-video':'#FCE4EC', 'badge-email':'#E8F5E9', 'badge-ads':'#FFF3E0' };

  container.innerHTML = campaignsData.map(function(camp) {
    return '<div class="campaign-card">' +
      '<div class="campaign-header">' +
        '<div class="campaign-title">' + camp.title + '</div>' +
        '<span class="campaign-badge ' + camp.badge + '">' + camp.badgeText + '</span>' +
      '</div>' +
      '<div class="campaign-desc">' + camp.desc + '</div>' +
      '<div class="campaign-steps">' +
        camp.steps.map(function(s, i) {
          return '<div class="c-step"><div class="c-step-num">' + (i+1) + '</div><span>' + s + '</span></div>';
        }).join('') +
      '</div>' +
      '<button onclick="applyCampaign(' + camp.id + ')" class="btn-sm btn-sm-outline" style="margin-top:14px">تطبيق هذه الحملة ←</button>' +
      '</div>';
  }).join('');
}

function applyCampaign(id) {
  const camp = campaignsData.find(function(c) { return c.id === id; });
  if (!camp) return;
  showToast('تم إضافة "' + camp.title + '" لمشاريعك ✅');
}

// ============================================================
// RESULTS HISTORY
// ============================================================
function renderResultsHistory() {
  const container = document.getElementById('results-list');
  if (!container) return;

  const results = [];
  try {
    const stored = JSON.parse(localStorage.getItem('soqly_results') || '[]');
    stored.forEach(function(r) { results.push(r); });
  } catch(e) {}

  if (results.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-ico">📊</div><div class="empty-title">لا توجد نتائج بعد</div><div class="empty-desc">ابدأ بتوليد محتوى لأول مشروع</div></div>';
    return;
  }

  container.innerHTML = results.map(function(r) {
    return '<div class="result-hist-card" onclick="showStoredResult(' + r.id + ')">' +
      '<div class="result-hist-ico">' + (r.serviceIcon || '📋') + '</div>' +
      '<div class="result-hist-info">' +
        '<div class="result-hist-title">' + (r.serviceName || 'نتيجة') + ' — ' + (r.projectName || '') + '</div>' +
        '<div class="result-hist-meta">' + (r.domain || '') + ' • ' + (r.date || '') + '</div>' +
      '</div>' +
      '<div class="result-hist-arrow">←</div>' +
      '</div>';
  }).join('');
}

function showStoredResult(id) {
  try {
    const results = JSON.parse(localStorage.getItem('soqly_results') || '[]');
    const r = results.find(function(x) { return x.id === id; });
    if (!r) return;
    openModal(r.serviceName || 'النتيجة',
      '<div style="white-space:pre-wrap;font-size:12px;line-height:1.9;color:#5D4037;background:#F5F1EC;border-radius:12px;padding:16px;max-height:400px;overflow-y:auto">' +
      r.text + '</div>' +
      '<button onclick="navigator.clipboard.writeText(\'' + r.text.replace(/'/g, "\\'").replace(/\n/g,'\\n') + '\');showToast(\'تم النسخ ✅\')" style="margin-top:14px;width:100%;padding:10px;border-radius:16px;background:#3E2723;border:none;color:white;font-size:12px;font-weight:700;cursor:pointer;font-family:Cairo,sans-serif">📋 نسخ</button>'
    );
  } catch(e) {}
}

// ============================================================
// PROJECTS
// ============================================================
function renderProjects() {
  const container = document.getElementById('projects-list');
  if (!container) return;

  const projects = [];
  try {
    const stored = JSON.parse(localStorage.getItem('soqly_projects_local') || '[]');
    stored.forEach(function(p) { projects.push(p); });
  } catch(e) {}

  if (projects.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-ico">📁</div><div class="empty-title">لا توجد مشاريع بعد</div><div class="empty-desc">ابدأ مشروعك الأول الآن</div>' +
      '<button class="btn-primary" onclick="goPage(\'services\');initServicesPage()">+ مشروع جديد</button></div>';
    return;
  }

  container.innerHTML = projects.map(function(p) {
    return '<div class="project-card">' +
      '<div class="proj-domain-badge">' + (p.domainIcon || '📁') + ' ' + (p.domain || '') + '</div>' +
      '<div class="proj-name">' + p.name + '</div>' +
      '<div class="proj-meta">' + (p.audience ? 'الجمهور: ' + p.audience + ' • ' : '') + (p.budget ? 'الميزانية: ' + p.budget + ' ' + (p.currency || 'EGP') : '') + '</div>' +
      '<div class="proj-actions"><button class="btn-sm btn-sm-primary" onclick="loadProject(' + p.id + ')">تابع ←</button>' +
      '<button class="btn-sm btn-sm-outline" onclick="deleteProject(' + p.id + ')">حذف</button></div>' +
      '</div>';
  }).join('');
}

function deleteProject(id) {
  try {
    let projects = JSON.parse(localStorage.getItem('soqly_projects_local') || '[]');
    projects = projects.filter(function(p) { return p.id !== id; });
    localStorage.setItem('soqly_projects_local', JSON.stringify(projects));
    renderProjects();
    showToast('تم حذف المشروع');
  } catch(e) {}
}

// ============================================================
// CONTENT CALENDAR
// ============================================================
function renderCalendar() {
  const container = document.getElementById('calendar-content');
  if (!container) return;

  const isPremium = false; // Check subscription
  if (!isPremium) {
    container.innerHTML = '<div class="cal-locked">' +
      '<div style="font-size:48px;margin-bottom:16px">🔒</div>' +
      '<div style="font-size:18px;font-weight:800;color:#3E2723;margin-bottom:8px">تقويم المحتوى</div>' +
      '<div style="font-size:13px;color:#6D4C41;margin-bottom:24px;max-width:300px">الميزة دي متاحة للمشتركين في خطة Pro فقط</div>' +
      '<button class="btn-primary" onclick="showToast(\'قريباً — ترقية للـ Pro 🚀\')">ترقية للـ Pro ✨</button>' +
      '</div>';
    return;
  }

  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const posts = [
    ['فيديو منتج'], ['نصيحة مفيدة', 'Story تفاعل'],
    ['عرض خاص'], ['خلف الكواليس'],
    ['مراجعة عميل', 'Q&A'], ['محتوى ترفيهي'], ['استطلاع رأي']
  ];

  container.innerHTML = '<div class="calendar-grid">' +
    days.map(function(day, i) {
      return '<div class="cal-day">' +
        '<div class="cal-day-name">' + day + '</div>' +
        (posts[i] || []).map(function(p) {
          return '<div class="cal-post">' + p + '</div>';
        }).join('') +
        '</div>';
    }).join('') +
    '</div>';
}

// ============================================================
// SEARCH BAR
// ============================================================
const searchItems = [
  {name:'أفكار المحتوى',       tab:'ideas',     icon:'💡', desc:'مكتبة أفكار تسويقية'},
  {name:'حملاتي التسويقية',    tab:'campaigns', icon:'📢', desc:'حملات جاهزة للتنفيذ'},
  {name:'نتائجي السابقة',      tab:'results',   icon:'📊', desc:'كل نتائجك المحفوظة'},
  {name:'مشاريعي',             tab:'projects',  icon:'📁', desc:'مشاريعك المحفوظة'},
  {name:'الأدوات التسويقية',   tab:'tools',     icon:'🛠️', desc:'Hook, Hashtag, وأكثر'},
  {name:'الإعدادات',           tab:'settings',  icon:'⚙️', desc:'إعدادات حسابك'},
  {name:'تقويم المحتوى',       tab:'calendar',  icon:'📅', desc:'جدول نشر أسبوعي'},
  {name:'Hook Generator',      tab:'tools',     icon:'🪝', desc:'جمل افتتاحية قوية'},
  {name:'Hashtag Generator',   tab:'tools',     icon:'#️⃣',  desc:'هاشتاجات مخصصة'},
  {name:'مشروع جديد',          page:'services', icon:'✨', desc:'ابدأ مشروع جديد الآن'},
];

let searchTimer = null;

function handleDashSearch(val) {
  const clearBtn = document.getElementById('search-clear');
  if (clearBtn) clearBtn.style.display = val ? 'block' : 'none';
  clearTimeout(searchTimer);
  if (!val.trim()) { removeSearchDropdown(); return; }
  searchTimer = setTimeout(function() {
    const q = val;
    const results = searchItems.filter(function(i) {
      return i.name.includes(q) || i.desc.includes(q);
    });
    showSearchDropdown(results, q);
  }, 250);
}

function showSearchDropdown(results, query) {
  removeSearchDropdown();
  const searchBar = document.querySelector('.dash-search');
  if (!searchBar) return;

  const dd = document.createElement('div');
  dd.id = 'search-dd';
  dd.className = 'search-dropdown';

  if (results.length === 0) {
    dd.innerHTML = '<div style="padding:16px;text-align:center;font-size:13px;color:#6D4C41">لا نتائج لـ "' + query + '"</div>';
  } else {
    dd.innerHTML = results.map(function(item) {
      const onclick = item.page
        ? 'onclick="clearDashSearch();goPage(\'' + item.page + '\');initServicesPage()"'
        : 'onclick="clearDashSearch();switchTab(\'' + item.tab + '\')"';
      return '<div class="search-item" ' + onclick + '>' +
        '<span style="font-size:20px">' + item.icon + '</span>' +
        '<div><div class="search-item-title">' + item.name + '</div>' +
        '<div class="search-item-desc">' + item.desc + '</div></div>' +
        '</div>';
    }).join('');
  }

  searchBar.style.position = 'relative';
  searchBar.appendChild(dd);
}

function removeSearchDropdown() {
  const dd = document.getElementById('search-dd');
  if (dd) dd.remove();
}

function clearDashSearch() {
  const inp = document.getElementById('dash-search-input');
  if (inp) inp.value = '';
  const btn = document.getElementById('search-clear');
  if (btn) btn.style.display = 'none';
  removeSearchDropdown();
}

// ============================================================
// TOOLS
// ============================================================
const allHooks = [
  '90% من الناس لا يعرفون هذه الحيلة...',
  'جربت هذا المنتج لمدة 7 أيام — النتيجة صدمتني!',
  'لا تشتري هذا المنتج قبل مشاهدة الفيديو',
  'الخطأ الذي يرتكبه معظم أصحاب المشاريع',
  'أفضل سر لزيادة المبيعات في 2025',
  'POV: قررت أبدأ مشروعي بـ 500 جنيه فقط',
  'الحقيقة التي لا يخبرك بها أحد عن التسويق',
  'لو عرفت هذا من زمان كنت وفّرت الكثير!',
  'هل تعرف لماذا مشروعك لا ينمو؟',
  'كيف حولت مشروعي لـ 3 أضعاف في شهر واحد؟',
  'الفرق بين من ينجح ومن يفشل هو هذه الخطوة',
  'أظهر هذا لجمهورك وستتضاعف مبيعاتك',
];

const hashtagsByDomain = {
  restaurant: ['#مطعم','#اكل','#وجبات','#مطبخ','#طعام','#food','#foodie','#restaurant','#yummy','#cooking','#chef','#instafood','#tasty'],
  fashion:    ['#ملابس','#موضة','#ستايل','#fashion','#style','#outfit','#ootd','#clothing','#تسوق','#fashionblogger','#trendy'],
  ecommerce:  ['#تسوق','#متجر','#عروض','#خصومات','#shop','#shopping','#sale','#deals','#store','#online','#ecommerce'],
  beauty:     ['#تجميل','#ماكياج','#عناية','#beauty','#makeup','#skincare','#selfcare','#beautytips','#glam','#cosmetics'],
  tech:       ['#تقنية','#تكنولوجيا','#tech','#technology','#startup','#digital','#software','#innovation'],
  services:   ['#خدمات','#اعمال','#تطوير','#services','#business','#consulting','#professional'],
};
const generalHashtags = ['#تسويق','#سَوقلي','#socialmedia','#marketing','#contentcreator','#entrepreneur','#smallbusiness'];

function openHookGenerator() {
  const shuffled = allHooks.slice().sort(function() { return .5 - Math.random(); }).slice(0, 5);
  const html = '<p style="font-size:12px;color:#6D4C41;margin-bottom:14px">اضغط على أي Hook لنسخه فوراً</p>' +
    '<div id="hooks-list" style="display:flex;flex-direction:column;gap:10px">' +
    shuffled.map(function(h) {
      return '<div onclick="copyHook(this,\'' + h.replace(/'/g, "\\'") + '\')" ' +
        'style="padding:12px 16px;border-radius:12px;border:1.5px solid rgba(200,169,126,.2);font-size:13px;font-weight:700;color:#3E2723;cursor:pointer">' +
        h + '<span style="float:left;font-size:11px;color:#C8A97E">نسخ ←</span></div>';
    }).join('') +
    '</div>' +
    '<button onclick="refreshHooks()" style="margin-top:14px;padding:10px 20px;border-radius:20px;background:linear-gradient(135deg,#3E2723,#5D4037);border:none;color:white;font-size:12px;font-weight:700;cursor:pointer;font-family:Cairo,sans-serif">🔄 توليد آخرين</button>';
  openModal('🪝 Hook Generator', html);
}

function refreshHooks() {
  const list = document.getElementById('hooks-list');
  if (!list) return;
  const shuffled = allHooks.slice().sort(function() { return .5 - Math.random(); }).slice(0, 5);
  list.innerHTML = shuffled.map(function(h) {
    return '<div onclick="copyHook(this,\'' + h.replace(/'/g, "\\'") + '\')" ' +
      'style="padding:12px 16px;border-radius:12px;border:1.5px solid rgba(200,169,126,.2);font-size:13px;font-weight:700;color:#3E2723;cursor:pointer">' +
      h + '<span style="float:left;font-size:11px;color:#C8A97E">نسخ ←</span></div>';
  }).join('');
}

function copyHook(el, text) {
  navigator.clipboard.writeText(text).catch(function() {});
  el.style.background = 'rgba(200,169,126,.1)';
  el.style.borderColor = '#C8A97E';
  showToast('تم نسخ الـ Hook 🪝');
}

function openHashtagGenerator() {
  const domain = state.domain || 'general';
  const domTags = hashtagsByDomain[domain] || [];
  const allTags = domTags.concat(generalHashtags);
  const selected = allTags.slice().sort(function() { return .5 - Math.random(); }).slice(0, 14);
  const html = '<div id="hashtags-wrap" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">' +
    selected.map(function(t) {
      return '<span onclick="this.style.background=\'rgba(200,169,126,.3)\'" ' +
        'style="padding:6px 14px;border-radius:20px;background:rgba(200,169,126,.1);border:1px solid rgba(200,169,126,.25);font-size:13px;font-weight:700;color:#3E2723;cursor:pointer">' +
        t + '</span>';
    }).join('') +
    '</div>' +
    '<button onclick="copyAllHashtags()" style="padding:10px 20px;border-radius:20px;background:linear-gradient(135deg,#C8A97E,#A07840);border:none;color:#3E2723;font-size:12px;font-weight:700;cursor:pointer;font-family:Cairo,sans-serif">📋 نسخ الكل</button>';
  openModal('#️⃣ Hashtag Generator', html);
}

function copyAllHashtags() {
  const spans = document.querySelectorAll('#hashtags-wrap span');
  const tags = Array.from(spans).map(function(s) { return s.textContent.trim(); }).join(' ');
  navigator.clipboard.writeText(tags).catch(function() {});
  showToast('تم نسخ الهاشتاجات 🔖');
}

function openPostDesignGenerator() {
  const designs = [
    { title:'بوست عرض خصم 30%',      desc:'خلفية ملونة + نص الخصم كبير + صورة المنتج + CTA واضح',          color:'#FF6B6B' },
    { title:'بوست منتج جديد',         desc:'صورة المنتج في المنتصف + تأثير جلو + نص "وصل حديثاً"',           color:'#4ECDC4' },
    { title:'بوست نصيحة للعملاء',     desc:'خلفية بيضاء نظيفة + أيقونات + نصائح مرقمة بشكل أنيق',           color:'#45B7D1' },
    { title:'بوست شهادة عميل',        desc:'صورة العميل + اقتباسه + نجوم التقييم + اسم البراند',            color:'#96CEB4' },
    { title:'بوست قبل وبعد',          desc:'تقسيم الصورة نصفين + صورتين واضحتين + نص مقارنة بسيط',         color:'#FFEAA7' },
    { title:'بوست موسمي مناسباتي',    desc:'تصميم موسمي جذاب + هوية البراند + عرض خاص محدود المدة',         color:'#DDA0DD' },
  ];
  const shuffled = designs.slice().sort(function() { return .5 - Math.random(); });
  const html = shuffled.map(function(d) {
    return '<div style="padding:14px 16px;border-radius:12px;border-right:4px solid ' + d.color + ';background:rgba(0,0,0,.02);margin-bottom:10px">' +
      '<div style="font-size:13px;font-weight:800;color:#3E2723;margin-bottom:4px">' + d.title + '</div>' +
      '<div style="font-size:11px;color:#6D4C41">' + d.desc + '</div>' +
      '</div>';
  }).join('');
  openModal('🎨 Post Design Ideas', html);
}

// ============================================================
// MODAL
// ============================================================
function openModal(title, html) {
  const overlay = document.getElementById('modal-overlay');
  const titleEl = document.getElementById('modal-title');
  const contentEl = document.getElementById('modal-content');
  if (!overlay) return;
  if (titleEl) titleEl.textContent = title;
  if (contentEl) contentEl.innerHTML = html;
  overlay.classList.remove('hidden');
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.add('hidden');
}

// ============================================================
// CHATBOT
// ============================================================
function toggleChat() {
  const win = document.querySelector('.chat-window');
  if (win) win.classList.toggle('open');
}

function quickAsk(q) {
  addMsg(q, 'user');
  setTimeout(function() { addMsg(getQuickReply(q), 'bot'); }, 500);
}

function sendChat() {
  const inp = document.getElementById('chat-inp');
  if (!inp || !inp.value.trim()) return;
  const msg = inp.value.trim();
  inp.value = '';
  addMsg(msg, 'user');
  setTimeout(function() { addMsg(generateSmartReply(msg), 'bot'); }, 600);
}

function addMsg(text, type) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'chat-msg ' + type;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function getQuickReply(q) {
  const replies = {
    'الأسعار':   'الخطة المجانية: 5 توليدات يومياً\nPro: 10$/شهر — توليدات غير محدودة + أدوات متقدمة\nBusiness: 25$/شهر — كل الميزات + API',
    'مطاعم':    'للمطاعم عندنا: أفكار محتوى، خطة تسويق، سكريبت فيديو أكل، حملات عروض، وتقويم أسبوعي كامل 🍔',
    'ملابس':    'لمتاجر الملابس: Try-On Hooks، حملات موسمية، أفكار Reels، وخطة Instagram + TikTok 👕',
    'حملات':    'نوفر 6 أنواع حملات: سوشيال ميديا، فيديو فيرال، Email، Meta Ads، مؤثرين، ولانش منتج 📢',
    'calendar': 'تقويم المحتوى متاح لمشتركي Pro — يتضمن جدول نشر أسبوعي مع أفكار لكل يوم 📅',
  };
  for (const key in replies) {
    if (q.includes(key)) return replies[key];
  }
  return generateSmartReply(q);
}

function generateSmartReply(q) {
  if (q.includes('محتوى') || q.includes('أفكار')) {
    return 'لتوليد أفكار محتوى مخصصة لمشروعك، اختار مجالك من صفحة الخدمات وأدخل بيانات مشروعك 💡';
  }
  if (q.includes('سعر') || q.includes('اشتراك')) {
    return 'لدينا خطة مجانية مناسبة للبداية، وPro بـ 10$ شهرياً للاحترافيين 💰';
  }
  if (q.includes('تسجيل') || q.includes('دخول')) {
    return 'يمكنك تسجيل حساب مجاني الآن وتجربة المنصة بدون بطاقة ائتمان ✅';
  }
  return 'أنا هنا لمساعدتك في تسويق مشروعك! اكتب سؤالك عن المحتوى أو الحملات أو الأسعار 😊';
}

// ============================================================
// CURRENCY
// ============================================================
function toggleCurrencyDropdown() {
  const dd = document.getElementById('currency-dd');
  if (dd) dd.classList.toggle('open');
}

function setCurrency(code) {
  const cur = currencies.find(function(c) { return c.code === code; });
  if (!cur) return;
  currentCurrency = cur;
  const dd = document.getElementById('currency-dd');
  if (dd) dd.classList.remove('open');
  updatePrices();
  showToast('تم التحويل لـ ' + cur.flag + ' ' + cur.label);
}

function updatePrices() {
  const proPrice  = (10 / currentCurrency.rate).toFixed(0);
  const bizPrice  = (25 / currentCurrency.rate).toFixed(0);
  document.querySelectorAll('[data-price="pro"]').forEach(function(el) { el.textContent = proPrice; });
  document.querySelectorAll('[data-price="biz"]').forEach(function(el) { el.textContent = bizPrice; });
  document.querySelectorAll('[data-currency]').forEach(function(el) { el.textContent = currentCurrency.sym; });
}

// ============================================================
// TOAST
// ============================================================
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { el.classList.remove('show'); }, 3000);
}

// ============================================================
// SETTINGS
// ============================================================
function saveSettings() {
  const name  = (document.getElementById('settings-name')  || {}).value || '';
  const email = (document.getElementById('settings-email') || {}).value || '';
  try {
    if (name)  localStorage.setItem('soqly_user_name', name);
    if (email) localStorage.setItem('soqly_user_email', email);
  } catch(e) {}
  showToast('تم حفظ الإعدادات ✅');
}

function loadSettingsData() {
  try {
    const nameEl  = document.getElementById('settings-name');
    const emailEl = document.getElementById('settings-email');
    if (nameEl)  nameEl.value  = localStorage.getItem('soqly_user_name')  || '';
    if (emailEl) emailEl.value = localStorage.getItem('soqly_user_email') || '';
  } catch(e) {}
}

function clearSavedProject() {
  try { localStorage.removeItem('soqly_project'); } catch(e) {}
  showToast('تم مسح بيانات المشروع');
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async function() {
  initSupabase();

  // Check session
  try {
    if (_sb) {
      const { data: { session } } = await _sb.auth.getSession();
      if (session) {
        currentUser = session.user;
        localStorage.setItem('soqly_loggedIn', 'true');
        goPage('dashboard');
        return;
      }
    }
    const loggedIn = localStorage.getItem('soqly_loggedIn') === 'true';
    if (loggedIn) { goPage('dashboard'); return; }
  } catch(e) {}

  // Show landing
  document.getElementById('page-landing').classList.add('active');
  document.getElementById('page-landing').style.display = 'block';
  history.replaceState({ page: 'landing' }, '', '#landing');

  // Close dropdowns on outside click
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.dash-search')) removeSearchDropdown();
    if (!e.target.closest('.currency-wrap')) {
      const dd = document.getElementById('currency-dd');
      if (dd) dd.classList.remove('open');
    }
    if (!e.target.closest('#modal-overlay')) return;
    if (e.target.id === 'modal-overlay') closeModal();
  });
});
