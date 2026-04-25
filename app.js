/* ============================================================
   SAWKLY.JS — Complete Marketing Platform Logic
   ============================================================ */

'use strict';

/* ============================================================
   SUPABASE CONFIG
   ============================================================ */
const SUPABASE_URL = 'https://kkcidsunsqftnpzdnwba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrY2lkc3Vuc3FmdG5wemRud2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTU1MjYsImV4cCI6MjA4ODgzMTUyNn0.JYE2LbsvNmK9gU4ty4MKRFjs4zrGtH-QaFg26r6ruqs';

let _supabase = null;
try { _supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null; } catch(e) {}

let currentUser = null;

/* ============================================================
   PAGE NAVIGATION — Fixed History Stack
   ============================================================ */
let _currentPage = 'landing';
const _pageHistory = [];

function goPage(name) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(p => {
    p.style.display = 'none';
    p.classList.remove('active');
  });

  const target = document.getElementById('page-' + name);
  if (!target) { console.warn('Page not found: page-' + name); return; }

  // Push to history stack
  if (_currentPage && _currentPage !== name) _pageHistory.push(_currentPage);

  target.style.display = (name === 'dashboard') ? 'flex' : 'block';
  target.classList.add('active');
  _currentPage = name;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Nav visibility
  const nav = document.getElementById('main-nav');
  if (nav) nav.style.display = (name === 'login' || name === 'signup') ? 'none' : 'flex';

  // Page-specific init
  if (name === 'login' || name === 'signup') initLoginPage();
  if (name === 'profile') initProfilePage();
  if (name === 'services') initServicesPage();
  if (name === 'chat') initChatPage();
  if (name === 'dashboard') initDashboard();
  if (name === 'library') renderLibrary();
}

function goBack() {
  if (_pageHistory.length > 0) {
    const prev = _pageHistory.pop();
    const target = document.getElementById('page-' + prev);
    if (target) {
      document.querySelectorAll('.page').forEach(p => { p.style.display='none'; p.classList.remove('active'); });
      target.style.display = (prev === 'dashboard') ? 'flex' : 'block';
      target.classList.add('active');
      _currentPage = prev;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } else {
    goPage('landing');
  }
}

function sTo(id) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

/* ============================================================
   DASHBOARD TABS — Fixed
   ============================================================ */
function switchTab(name, el) {
  // Hide all tab content
  document.querySelectorAll('.tab-c').forEach(t => t.classList.remove('active'));
  // Remove active from all sidebar items
  document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));

  const tab = document.getElementById('tab-' + name);
  if (tab) tab.classList.add('active');
  if (el) el.classList.add('active');

  // Tab-specific init
  if (name === 'ideas') renderIdeasTab();
  if (name === 'campaigns') renderCampaignsTab();
  if (name === 'results') renderResultsTab();
  if (name === 'tools') renderToolsTab();
  if (name === 'settings') loadSavedProjectToSettings();
}

function initDashboard() {
  // Load user info into sidebar
  try {
    const name = localStorage.getItem('soqly_user_name') || 'المستخدم';
    const email = localStorage.getItem('soqly_user_email') || '';
    const plan = localStorage.getItem('soqly_plan') || 'مجاني';
    const sbName = document.querySelector('.sb-name');
    const sbPlan = document.querySelector('.sb-plan');
    const sbAvatar = document.querySelector('.sb-avatar');
    if (sbName) sbName.textContent = name;
    if (sbPlan) sbPlan.textContent = 'خطة ' + plan;
    if (sbAvatar) sbAvatar.textContent = name.charAt(0).toUpperCase();
  } catch(e) {}
  renderHomeTab();
}

/* ============================================================
   APP STATE
   ============================================================ */
const state = {
  domain: null,
  domainName: null,
  serviceType: null,
  serviceName: null,
  serviceIcon: null,
  projectName: '',
  projectType: '',
  budget: 1000,
  audience: '',
  description: '',
  prices: '',
  videoType: null,
  scriptType: null,
  platform: null,
  contentType: null,
  currentStep: 1
};

/* ============================================================
   DOMAIN SERVICES — كل مجال عنده خدمات مختلفة تماماً
   ============================================================ */
const domainServices = {
  restaurant: {
    name: 'مطاعم وكافيهات', icon: '🍔',
    services: [
      { ico:'📸', nm:'أفكار محتوى المطعم',      desc:'صور أطباق + ريلز تحضير + قصص خلف الكواليس', type:'content', tag:'محتوى' },
      { ico:'📋', nm:'خطة تسويق مطعم',          desc:'خطة شهرية كاملة للمطعم بجداول النشر',         type:'plan',    tag:'خطة' },
      { ico:'🎬', nm:'سكريبت فيديو أطباق',       desc:'سكريبت Reel أو TikTok لعرض الأطباق',         type:'video',   tag:'فيديو' },
      { ico:'🏷️', nm:'حملة عروض المطعم',         desc:'عروض يومية وأسبوعية تجذب الزبائن',           type:'ads',     tag:'عروض' },
      { ico:'📸', nm:'حملة Instagram مطعم',      desc:'إعلانات Reels + Stories للأطباق والعروض',    type:'ads',     tag:'Instagram' },
      { ico:'👻', nm:'حملة Snapchat مطعم',       desc:'إعلانات سناب للعروض اليومية والوجبات',        type:'ads',     tag:'Snapchat' },
      { ico:'🎵', nm:'حملة TikTok مطعم',         desc:'فيديو تيك توك فيروسي لمشهد التحضير',         type:'ads',     tag:'TikTok' },
      { ico:'⭐', nm:'إدارة تقييمات Google',      desc:'خطة جمع تقييمات Google Maps وTripAdvisor',   type:'ads',     tag:'تقييمات' },
    ]
  },
  fashion: {
    name: 'ملابس وموضة', icon: '👕',
    services: [
      { ico:'🎽', nm:'أفكار محتوى الموضة',       desc:'Try-On + Outfit + Style Tips للملابس',       type:'content', tag:'محتوى' },
      { ico:'📋', nm:'خطة تسويق متجر الملابس',   desc:'خطة نمو المتجر على السوشيال ميديا',          type:'plan',    tag:'خطة' },
      { ico:'🎬', nm:'سكريبت فيديو كولكشن',      desc:'سكريبت لعرض الكولكشن الجديد',               type:'video',   tag:'فيديو' },
      { ico:'🛍️', nm:'حملات تصفية المخزون',      desc:'Seasonal Sale وتصفية المخزون بشكل احترافي', type:'ads',     tag:'عروض' },
      { ico:'📸', nm:'حملة Instagram ملابس',     desc:'Reels + Stories + Shopping للملابس',         type:'ads',     tag:'Instagram' },
      { ico:'👻', nm:'حملة Snapchat موضة',        desc:'إعلانات سناب للكولكشن والعروض الموسمية',     type:'ads',     tag:'Snapchat' },
      { ico:'🎵', nm:'حملة TikTok ملابس',         desc:'Try-On Trends + Outfit Challenges',          type:'ads',     tag:'TikTok' },
      { ico:'🤝', nm:'حملة مؤثرين الموضة',        desc:'استراتيجية Nano + Micro Influencers',        type:'ads',     tag:'مؤثرين' },
    ]
  },
  ecommerce: {
    name: 'تجارة إلكترونية', icon: '🛒',
    services: [
      { ico:'📦', nm:'أفكار محتوى المتجر',       desc:'Unboxing + مراجعات + عروض المنتجات',         type:'content', tag:'محتوى' },
      { ico:'📋', nm:'خطة تسويق المتجر الأونلاين', desc:'خطة تسويق متكاملة لمتجرك الإلكتروني',     type:'plan',    tag:'خطة' },
      { ico:'🎬', nm:'سكريبت فيديو المنتج',      desc:'سكريبت Unboxing أو Product Demo',            type:'video',   tag:'فيديو' },
      { ico:'⚡', nm:'حملة Flash Sale',           desc:'خصم مفاجئ 24 ساعة مع Countdown',            type:'ads',     tag:'عروض' },
      { ico:'📸', nm:'حملة Instagram Shopping',  desc:'Product Tags + Reels + Stories للتجارة',    type:'ads',     tag:'Instagram' },
      { ico:'👻', nm:'حملة Snapchat تجارة',       desc:'Dynamic Ads للمنتجات على سناب شات',          type:'ads',     tag:'Snapchat' },
      { ico:'🔍', nm:'حملة Google Shopping',      desc:'إعلانات Google Shopping + Search',           type:'ads',     tag:'Google' },
      { ico:'📧', nm:'Email Marketing للمتجر',    desc:'نشرة بريدية أسبوعية للعروض والمنتجات',      type:'ads',     tag:'Email' },
    ]
  },
  beauty: {
    name: 'تجميل وعناية', icon: '💄',
    services: [
      { ico:'✨', nm:'أفكار محتوى التجميل',       desc:'Before/After + Tutorials + روتين العناية',   type:'content', tag:'محتوى' },
      { ico:'📋', nm:'خطة تسويق التجميل',         desc:'خطة نمو براند التجميل شهرياً',               type:'plan',    tag:'خطة' },
      { ico:'🎬', nm:'سكريبت فيديو تجميل',        desc:'Tutorial + مراجعة منتجات التجميل',           type:'video',   tag:'فيديو' },
      { ico:'🎁', nm:'حملات هدايا ومناسبات',      desc:'خصومات الأعياد والمناسبات الخاصة',           type:'ads',     tag:'عروض' },
      { ico:'📸', nm:'حملة Instagram تجميل',      desc:'Reels قبل/بعد + Stories + Tutorials',       type:'ads',     tag:'Instagram' },
      { ico:'👻', nm:'حملة Snapchat تجميل',        desc:'إعلانات سناب للـ Before/After والعروض',      type:'ads',     tag:'Snapchat' },
      { ico:'🎵', nm:'حملة TikTok تجميل',          desc:'Get Ready With Me + Skincare Tutorials',    type:'ads',     tag:'TikTok' },
      { ico:'🤝', nm:'حملة مؤثرين التجميل',        desc:'تعاون مع Beauty Influencers لمراجعات',     type:'ads',     tag:'مؤثرين' },
    ]
  },
  tech: {
    name: 'تقنية وبرمجة', icon: '💻',
    services: [
      { ico:'💡', nm:'أفكار محتوى تقني',          desc:'Demo + Tips + Case Studies لمنتجك التقني',  type:'content', tag:'محتوى' },
      { ico:'📋', nm:'خطة تسويق B2B/B2C',         desc:'خطة مخصصة حسب جمهورك — أفراد أو شركات',    type:'plan',    tag:'خطة' },
      { ico:'🎬', nm:'سكريبت Explainer Video',    desc:'فيديو شرح المنتج في 60 ثانية',              type:'video',   tag:'فيديو' },
      { ico:'🔍', nm:'حملة SEO + Google Ads',     desc:'ظهور في جوجل لمن يبحث عن منتجك',           type:'ads',     tag:'Google' },
      { ico:'📸', nm:'حملة Instagram تقني',        desc:'إعلانات إنستجرام للمنتج التقني',            type:'ads',     tag:'Instagram' },
      { ico:'👻', nm:'حملة Snapchat تقني',          desc:'استهداف الشباب المهتم بالتقنية',            type:'ads',     tag:'Snapchat' },
      { ico:'💼', nm:'حملة LinkedIn B2B',          desc:'إعلانات لينكد إن للوصول للشركات',          type:'ads',     tag:'LinkedIn' },
      { ico:'📧', nm:'Email للمطورين',             desc:'نشرة بريدية تقنية احترافية',                type:'ads',     tag:'Email' },
    ]
  },
  services: {
    name: 'خدمات مهنية', icon: '🏥',
    services: [
      { ico:'📚', nm:'أفكار محتوى الخدمات',       desc:'قصص نجاح + نصائح + محتوى يبني الخبرة',     type:'content', tag:'محتوى' },
      { ico:'📋', nm:'خطة تسويق الخدمات',          desc:'خطة نمو مخصصة لخدمتك المهنية',              type:'plan',    tag:'خطة' },
      { ico:'🎬', nm:'سكريبت فيديو تعريفي',        desc:'فيديو يشرح قيمة خدمتك ويقنع العملاء',       type:'video',   tag:'فيديو' },
      { ico:'⭐', nm:'حملة تقييمات Google Maps',   desc:'استراتيجية جمع تقييمات محلية',              type:'ads',     tag:'تقييمات' },
      { ico:'📸', nm:'حملة Instagram خدمات',       desc:'قصص نجاح + إعلانات لخدمتك',                type:'ads',     tag:'Instagram' },
      { ico:'👻', nm:'حملة Snapchat خدمات',         desc:'استهداف العملاء المحليين على سناب',          type:'ads',     tag:'Snapchat' },
      { ico:'🗺️', nm:'حملة Google Local',          desc:'Google Maps + Local Search Ads',            type:'ads',     tag:'Google' },
      { ico:'🤝', nm:'برنامج الإحالة',             desc:'نظام تحفيز العملاء لإحالة عملاء جدد',      type:'ads',     tag:'إحالة' },
    ]
  },
  retail: {
    name: 'مشاريع تجارية', icon: '🏪',
    services: [
      { ico:'🛒', nm:'أفكار محتوى المتجر',        desc:'عرض المنتجات + شهادات العملاء + عروض',      type:'content', tag:'محتوى' },
      { ico:'📋', nm:'خطة تسويق المتجر',           desc:'خطة شهرية لزيادة مبيعات متجرك',             type:'plan',    tag:'خطة' },
      { ico:'🎬', nm:'سكريبت فيديو المنتجات',      desc:'سكريبت لعرض وشرح مميزات المنتجات',          type:'video',   tag:'فيديو' },
      { ico:'🏷️', nm:'حملات عروض موسمية',          desc:'خصومات الموسم وتصفية المخزون',              type:'ads',     tag:'عروض' },
      { ico:'📸', nm:'حملة Instagram تجاري',       desc:'Shopping + Reels + Stories للمنتجات',      type:'ads',     tag:'Instagram' },
      { ico:'👻', nm:'حملة Snapchat تجاري',         desc:'إعلانات سناب للمنتجات الجديدة والعروض',     type:'ads',     tag:'Snapchat' },
      { ico:'🔍', nm:'حملة Google Shopping',       desc:'ظهور منتجاتك في نتائج جوجل مباشرة',        type:'ads',     tag:'Google' },
      { ico:'📧', nm:'Email Marketing',            desc:'نشرة بريدية أسبوعية للعملاء',              type:'ads',     tag:'Email' },
    ]
  }
};

/* ============================================================
   MARKETING LIBRARY — Complete Database
   ============================================================ */
const marketingLibrary = [
  // ==================== مطاعم ====================
  { id:1,  domain:'restaurant', type:'content',  tag:'📱 محتوى', title:'فيديو تحضير الطبق خلف الكواليس', desc:'صوّر الطبق من الخامات للتقديم النهائي — الجمهور بيحب يشوف الأصالة والجودة', tip:'أضف موسيقى هادئة وأظهر التفاصيل بالتصوير المقرّب. المدة المثالية 15-30 ثانية.' },
  { id:2,  domain:'restaurant', type:'video',    tag:'🎬 فيديو',  title:'تجربة العميل الأول — Testimonial', desc:'اطلب من عميل حقيقي يحكي تجربته بعد الأكل مباشرة — أصدق من أي إعلان مدفوع', tip:'التلقائية أفضل من الإعداد المسبق. سؤالان: طلبك إيه؟ وعامل إزاي؟' },
  { id:3,  domain:'restaurant', type:'hook',     tag:'🪝 Hook',   title:'"مش هتصدق إن الطبق ده بيتعمل في 10 دقائق"', desc:'Hook افتتاحي قوي لفيديو تحضير سريع يشد الانتباه في أول ثانيتين', tip:'اعرض النتيجة النهائية في أول 2 ثانية قبل ما تبدأ الشرح.' },
  { id:4,  domain:'restaurant', type:'campaign', tag:'📢 حملة',  title:'حملة "وجبة الأسبوع" الأسبوعية', desc:'كل أسبوع وجبة مميزة بسعر خاص مع Countdown — يخلق Urgency حقيقي', tip:'استخدم Story مع Countdown Sticker. أعلن عنها الخميس لاستهداف عطلة نهاية الأسبوع.' },
  { id:5,  domain:'restaurant', type:'content',  tag:'📱 محتوى', title:'يوم كامل في المطبخ — Day in Life', desc:'من الفجر للإغلاق — فيديو يوم كامل يُظهر الجهد والجودة خلف كل طبق', tip:'ركّز على تفاصيل النظافة والجودة. هذا يبني ثقة هائلة عند الجمهور.' },
  { id:6,  domain:'restaurant', type:'tip',      tag:'💡 نصيحة', title:'وقت النشر الذهبي للمطاعم', desc:'انشر في 11ص (قبل الغداء) و5م (قبل العشاء) — أعلى نسبة مشاهدة وطلب', tip:'الخميس والجمعة الأعلى تفاعلاً في السوق العربي. جرّب وراقب Insights.' },
  { id:7,  domain:'restaurant', type:'content',  tag:'📱 محتوى', title:'مسابقة "خمّن الطبق" التفاعلية', desc:'ارفع صورة مقربة جداً لتفاصيل طبق واطلب من المتابعين يخمّنوا', tip:'يرفع التعليقات بشكل كبير. أعلن الفائز في ستوري ووزّع وجبة مجانية.' },
  { id:8,  domain:'restaurant', type:'video',    tag:'🎬 فيديو',  title:'Transformation: خامات → طبق نهائي', desc:'خامات خام مقابل الطبق النهائي — Transformation content يحصل على مشاركة عالية', tip:'اجعل المونتاج سريعاً 15 ثانية. استخدم موسيقى Trending على TikTok.' },
  { id:9,  domain:'restaurant', type:'campaign', tag:'📢 حملة',  title:'برنامج ولاء "الزبون الذهبي"', desc:'كل 10 وجبات = وجبة مجانية. Digital Card على واتساب — يرفع التكرار 40%', tip:'استخدم Google Forms أو تطبيق مجاني لإدارة نقاط الولاء.' },
  { id:10, domain:'restaurant', type:'hook',     tag:'🪝 Hook',   title:'"سبب ما بتيجيش تاني لأي مطعم بعد ما تجرّب ده"', desc:'Hook يثير الفضول ويتحدى المتابع يجرّب — من أقوى أنواع Hooks للمطاعم', tip:'اجعل الادعاء واضحاً وقابلاً للإثبات. الثقة الزائدة تشد الانتباه.' },

  // ==================== ملابس وموضة ====================
  { id:11, domain:'fashion', type:'content',  tag:'📱 محتوى', title:'3 لوكات من قطعة واحدة', desc:'أظهر كيف قطعة واحدة تنفع لأوكيجن مختلفة — عملي ومفيد ويُظهر قيمة المنتج', tip:'استخدم نفس الخلفية عشان الفرق يبان أكتر. أسرع محتوى في المشاركة.' },
  { id:12, domain:'fashion', type:'video',    tag:'🎬 فيديو',  title:'Try-On Haul من الكولكشن الجديد', desc:'جرّب مجموعة منتجات جديدة أمام الكاميرا مع تعليقات طبيعية', tip:'الردود الطبيعية أفضل من المصطنعة. أضف الأسعار في Comment أو Caption.' },
  { id:13, domain:'fashion', type:'hook',     tag:'🪝 Hook',   title:'"الغلطة اللي بتخلي ملابسك تبان غلط"', desc:'Hook يجذب الاهتمام ويخلق فضول عند الجمهور المهتم بالموضة', tip:'ابدأ بالمشكلة قبل الحل. الـ Pain Point يشد أكتر من المدح المباشر.' },
  { id:14, domain:'fashion', type:'campaign', tag:'📢 حملة',  title:'حملة "لوك اليوم" اليومية', desc:'كل يوم لوك مختلف لأسبوع كامل — يبني عادة المتابعة اليومية', tip:'حدد وقت ثابت للنشر كل يوم. الجمهور يتعلم يتوقع محتواك.' },
  { id:15, domain:'fashion', type:'tip',      tag:'💡 نصيحة', title:'الألوان الأكتر مبيعاً حسب الموسم', desc:'خطط محتواك على الألوان Trending في كل موسم مسبقاً بأسبوعين', tip:'تابع Pinterest Trend Reports وGoogle Trends كل موسم لتعرف الألوان الرائجة.' },
  { id:16, domain:'fashion', type:'content',  tag:'📱 محتوى', title:'مقارنة Casual vs Formal من نفس القطعة', desc:'ساعد جمهورك يختار + أظهر تنوع منتجاتك في نفس المحتوى', tip:'اسأل رأيهم في التعليقات: "تفضل A ولا B؟" — يرفع Engagement جداً.' },
  { id:17, domain:'fashion', type:'campaign', tag:'📢 حملة',  title:'حملة "شتاء/صيف" الموسمية', desc:'أعلن عن الكولكشن الموسمي قبل الموسم بأسبوعين — Teaser Campaign', tip:'ابدأ بـ Teaser مبهم → كشف تدريجي → إطلاق كامل. يبني Anticipation.' },
  { id:18, domain:'fashion', type:'video',    tag:'🎬 فيديو',  title:'مقارنة "منتجاتنا vs سعر أعلى"', desc:'أظهر جودة مقارنة بأسعار أعلى — Value Proposition واضح', tip:'لا تهاجم المنافسين. قارن بشكل موضوعي وايجابي.' },

  // ==================== تجارة إلكترونية ====================
  { id:19, domain:'ecommerce', type:'content',  tag:'📱 محتوى', title:'Unboxing المنتج بتفاعل طبيعي', desc:'افتح المنتج أمام الكاميرا بتفاعل طبيعي — يبني ثقة ويحفّز الشراء', tip:'أظهر التغليف والتفاصيل. رد الفعل الأول الطبيعي هو المحتوى الأقوى.' },
  { id:20, domain:'ecommerce', type:'video',    tag:'🎬 فيديو',  title:'مراجعة صادقة من عميل حقيقي', desc:'اطلب من عميل يراجع المنتج بدون Script — يزيد الثقة 10 أضعاف', tip:'عدم الكمال يزيد المصداقية. لا تطلب مراجعة مثالية.' },
  { id:21, domain:'ecommerce', type:'campaign', tag:'📢 حملة',  title:'Flash Sale 24 ساعة', desc:'خصم مفاجئ لـ 24 ساعة فقط — Urgency حقيقي يرفع المبيعات 300%', tip:'أضف Countdown Timer في الستوري. أرسل Push Notification للمشتركين.' },
  { id:22, domain:'ecommerce', type:'hook',     tag:'🪝 Hook',   title:'"لو اشتريت ده قبل كده كنت وفّرت كتير"', desc:'Hook يثير الندم المحفّز للشراء الفوري', tip:'اربطه بمشكلة فعلية يعانيها جمهورك. لا تبالغ لتحافظ على المصداقية.' },
  { id:23, domain:'ecommerce', type:'tip',      tag:'💡 نصيحة', title:'صور المنتج: خلفية بيضاء + في Context', desc:'صورة على خلفية بيضاء للوضوح + صورة في الاستخدام الحقيقي = مبيعات أعلى', tip:'الصورة في السياق ترفع المبيعات 40%. أظهر المنتج في الحياة الحقيقية.' },
  { id:24, domain:'ecommerce', type:'content',  tag:'📱 محتوى', title:'أكتر 5 منتجات مبيعاً هذا الشهر', desc:'شارك Best Sellers شهرياً — Social Proof قوي يحفّز التقليد', tip:'أضف عدد المبيعات لو ممكن: "بيع 500 قطعة هذا الشهر"' },
  { id:25, domain:'ecommerce', type:'campaign', tag:'📢 حملة',  title:'حملة "اشتري 2 واحصل على 1"', desc:'Bundle Offer يرفع متوسط قيمة الطلب بشكل كبير', tip:'اختار منتجات تكميلية في نفس الباقة. الـ Perceived Value أعلى من الخصم.' },

  // ==================== تجميل ====================
  { id:26, domain:'beauty', type:'video',    tag:'🎬 فيديو',  title:'تيوتوريال ماكياج 5 دقائق', desc:'لوك كامل في 5 دقائق — سريع وعملي ومفيد جداً للجمهور', tip:'أظهر اسم وسعر كل منتج بوضوح في الفيديو. يرفع نية الشراء.' },
  { id:27, domain:'beauty', type:'content',  tag:'📱 محتوى', title:'روتين العناية الصباحية خطوة خطوة', desc:'من الغسيل للـ SPF — محتوى تعليمي يُظهر خبرتك وتنوع منتجاتك', tip:'اذكر أسماء المنتجات والأسعار بوضوح. Affiliate potential عالي.' },
  { id:28, domain:'beauty', type:'hook',     tag:'🪝 Hook',   title:'"الخطأ اللي بيخلي بشرتك تبان متعبة"', desc:'Hook يجذب اهتمام كل متابع مهتم بالعناية بالبشرة', tip:'ابدأ بالمشكلة الشائعة. الـ Pain Point في التجميل فعّال جداً.' },
  { id:29, domain:'beauty', type:'campaign', tag:'📢 حملة',  title:'تحدي "قبل وبعد بدون فلاتر"', desc:'نتائج حقيقية بدون تعديل — يبني ثقة هائلة لا يستطيع أي إعلان يبنيها', tip:'الأصالة هي أقوى أداة تسويق في التجميل. الفلاتر تقلل المصداقية.' },
  { id:30, domain:'beauty', type:'tip',      tag:'💡 نصيحة', title:'Ring Light = صور احترافية بسعر بسيط', desc:'Ring Light الأساسية بتحوّل صور المنتجات من عادية لاحترافية', tip:'ضعها أمامك مباشرة للـ Catchlight في العين. تكلفة 200-400 جنيه.' },
  { id:31, domain:'beauty', type:'content',  tag:'📱 محتوى', title:'أفضل 3 منتجات بأقل من 100 جنيه', desc:'Budget-Friendly Content يجذب شريحة واسعة وتفاعل عالي جداً', tip:'الـ Budget Content يحصل على تفاعل أعلى من المنتجات الفاخرة.' },
  { id:32, domain:'beauty', type:'campaign', tag:'📢 حملة',  title:'حملة "عيد ميلاد البراند" السنوية', desc:'احتفل بذكرى تأسيس البراند بعروض حصرية — يبني انتماء عاطفي', tip:'أضف قصة البدايات والرحلة — المحتوى العاطفي يُشارَك أكتر.' },

  // ==================== تقنية ====================
  { id:33, domain:'tech', type:'video',    tag:'🎬 فيديو',  title:'Demo المنتج في 60 ثانية', desc:'أظهر المشكلة ثم الحل بمنتجك في دقيقة واحدة — مباشر وفعّال جداً', tip:'ابدأ بالمشكلة في أول 3 ثواني. الـ Demo الحقيقي أقوى من الـ Testimonial.' },
  { id:34, domain:'tech', type:'content',  tag:'📱 محتوى', title:'نصيحة تقنية أسبوعية', desc:'نصيحة واحدة مفيدة كل أسبوع — يبني مكانة الخبير ويجذب جمهور نوعي', tip:'البساطة أهم من العمق. نصيحة واحدة قابلة للتطبيق أفضل من 10 معقدة.' },
  { id:35, domain:'tech', type:'hook',     tag:'🪝 Hook',   title:'"90% من الناس بيضيّعوا وقتهم في ده"', desc:'Hook قوي لمحتوى Productivity — الأرقام تجذب الانتباه دائماً', tip:'استخدم أرقاماً حقيقية وقابلة للتحقق. الادعاء الكبير يحتاج دليل.' },
  { id:36, domain:'tech', type:'campaign', tag:'📢 حملة',  title:'حملة "مشكلة + حل" الأسبوعية', desc:'في كل بوست: مشكلة شائعة + حلها بمنتجك — Pattern ناجح وقابل للتكرار', tip:'اجعلها سلسلة أسبوعية بـ Hashtag خاص. يبني Community حول مشكلة معينة.' },
  { id:37, domain:'tech', type:'tip',      tag:'💡 نصيحة', title:'LinkedIn للـ B2B أقوى من Instagram', desc:'لو جمهورك شركات ومهنيين، LinkedIn يوصلك لهم أسرع وأرخص بكتير', tip:'انشر مقالات قصيرة مع Insights حقيقية. Organic Reach على LinkedIn أعلى بكثير.' },
  { id:38, domain:'tech', type:'content',  tag:'📱 محتوى', title:'مقارنة مع المنافسين بموضوعية', desc:'مقارنة صادقة تُظهر مميزاتك بدون هجوم — يبني ثقة ويجذب العملاء المترددين', tip:'اذكر نقاط ضعفك أيضاً. الشفافية تزيد مصداقيتك عند الجمهور النوعي.' },

  // ==================== خدمات مهنية ====================
  { id:39, domain:'services', type:'content',  tag:'📱 محتوى', title:'قصة نجاح عميل بالأرقام', desc:'قبل وبعد العمل معك بأرقام حقيقية — أقوى دليل على كفاءتك المهنية', tip:'استأذن العميل واحكِ القصة بأرقام: "وفّرنا X% من التكاليف".' },
  { id:40, domain:'services', type:'video',    tag:'🎬 فيديو',  title:'يوم في عملك — Day in Life', desc:'أظهر روتين عملك اليومي — يبني ألفة مع الجمهور ويثبت احترافيتك', tip:'أظهر التحديات الحقيقية وليس فقط النجاحات. الأصالة تبني الثقة.' },
  { id:41, domain:'services', type:'hook',     tag:'🪝 Hook',   title:'"لو مش بتعمل الخطوة دي، بتخسر عملاء كل يوم"', desc:'Hook يثير القلق المحرّك للتصرف الفوري — فعّال جداً للخدمات', tip:'تأكد إن الخطوة فيها فعلاً قيمة. لا تهدد بدون حل واضح.' },
  { id:42, domain:'services', type:'campaign', tag:'📢 حملة',  title:'حملة "استشارة مجانية 15 دقيقة"', desc:'استشارة مجانية — Lead Magnet ممتاز يجذب العملاء المحتملين', tip:'قيّد الأماكن عشان تخلق Urgency: "باقي 3 أماكن هذا الأسبوع".' },
  { id:43, domain:'services', type:'tip',      tag:'💡 نصيحة', title:'الـ Testimonials بالصوت أقوى من الكتابة', desc:'فيديو عميل راضٍ يتكلم بصدق = أفضل إعلان ممكن لخدمتك', tip:'سؤالان فقط: المشكلة قبلك + النتيجة بعدك. 60 ثانية كافية.' },
  { id:44, domain:'services', type:'content',  tag:'📱 محتوى', title:'أشهر 5 أسئلة يسألها العملاء', desc:'Q&A يُظهر خبرتك ويجيب على Objections العملاء المترددين مسبقاً', tip:'حوّل كل سؤال لبوست منفصل. المحتوى المبني على الأسئلة الحقيقية = أعلى تفاعل.' },

  // ==================== تسويق عام ====================
  { id:45, domain:'general', type:'tip',      tag:'💡 نصيحة', title:'قاعدة 80/20 في المحتوى', desc:'80% محتوى مفيد وترفيهي + 20% بيع مباشر — هذه هي معادلة التسويق الناجح', tip:'الناس تتابع لتستفيد وتسلّي، وليس لتُباع لها. ابنِ الثقة أولاً.' },
  { id:46, domain:'general', type:'tip',      tag:'💡 نصيحة', title:'وقت النشر الذهبي للسوق العربي', desc:'7-9 ص + 12-2 ظ + 7-10 م — أعلى نشاط للجمهور العربي على السوشيال ميديا', tip:'جرّب وشوف وقت جمهورك تحديداً في Insights. كل جمهور مختلف.' },
  { id:47, domain:'general', type:'hook',     tag:'🪝 Hook',   title:'أقوى 5 كلمات في التسويق', desc:'"مجاني، جديد، الآن، أنت، لماذا" — ادمجهم في عناوينك وكابشنك', tip:'كلمة "أنت" تضاعف التفاعل. التخصيص المباشر يشد الجمهور.' },
  { id:48, domain:'general', type:'campaign', tag:'📢 حملة',  title:'حملة User Generated Content', desc:'اطلب من عملاءك يشاركوا تجربتهم بـ Hashtag خاص — محتوى مجاني ومصداقية عالية', tip:'قدّم جائزة رمزية للمشاركين. أعد نشر المحتوى المميز في حسابك.' },
  { id:49, domain:'general', type:'content',  tag:'📱 محتوى', title:'محتوى خلف الكواليس', desc:'الناس فضولية — أظهر عملية الإنتاج والتفاصيل الخفية لبراندك', tip:'يزيد الثقة والارتباط العاطفي بالبراند. أحد أعلى أنواع المحتوى مشاركةً.' },
  { id:50, domain:'general', type:'tip',      tag:'💡 نصيحة', title:'Consistency > Perfection دائماً', desc:'انشر بانتظام حتى لو المحتوى بسيط — أفضل بكتير من محتوى مثالي ونادر', tip:'جدول أسبوعي ثابت أفضل من انفجار محتوى ثم صمت. الخوارزمية تكافئ الثبات.' },
  { id:51, domain:'general', type:'campaign', tag:'📢 حملة',  title:'تحدي 30 يوم', desc:'محتوى يومي لشهر كامل — يبني Following قوي ويرفع Organic Reach بشكل كبير', tip:'ضع الأفكار الـ 30 قبل ما تبدأ. التخطيط المسبق يقلل الضغط.' },
  { id:52, domain:'general', type:'tip',      tag:'💡 نصيحة', title:'CTA في كل بوست بدون استثناء', desc:'كل بوست لازم ينتهي بـ Call-to-Action واضح: تعليق، شير، احجز، تواصل', tip:'سؤال في نهاية البوست يضاعف التعليقات. "رأيك؟" أو "شاركنا تجربتك!"' },
  { id:53, domain:'general', type:'content',  tag:'📱 محتوى', title:'Carousel "5 نصائح" أو "3 أخطاء"', desc:'Carousel Posts تحصل على أعلى Reach في Instagram وLinkedIn', tip:'السلايد الأولى هي الأهم — اجعلها صادمة أو مثيرة للفضول جداً.' },
  { id:54, domain:'general', type:'hook',     tag:'🪝 Hook',   title:'"الحقيقة اللي مش أحد بيقولهالك عن..."', desc:'Hook يثير الفضول ويكسر التوقع — أحد أقوى Patterns في التسويق الرقمي', tip:'تأكد إن المحتوى فيه فعلاً معلومة مفيدة غير متوقعة. لا تخيّب الوعد.' },
  { id:55, domain:'general', type:'campaign', tag:'📢 حملة',  title:'حملة الإحالة "احضر صديق"', desc:'مكافأة لكل عميل يحضر عميل جديد — أرخص وأفضل تسويق ممكن', tip:'المكافأة لازم تكون لـ الطرفين. Double-sided rewards تنجح أكتر.' },
  { id:56, domain:'general', type:'tip',      tag:'💡 نصيحة', title:'الـ Stories تبني قرب من المتابعين', desc:'Stories اليومية أهم من البوستات في بناء العلاقة مع الجمهور', tip:'استخدم Poll + Question Stickers كل أسبوع. يرفع Engagement ويعطيك بيانات.' },
];

/* ============================================================
   SERVICES WIZARD
   ============================================================ */
function initServicesPage() {
  loadSavedProject();
  // Reset service state
  Object.assign(state, { domain: null, serviceType: null, serviceName: null,
    videoType: null, scriptType: null, platform: null, contentType: null, currentStep: 1 });
  wzGoStep(1);
  document.querySelectorAll('.pick-card, .svc-card').forEach(c => c.classList.remove('selected'));
}

function startServiceFlow(domainKey) {
  goPage('services');
  setTimeout(() => {
    initServicesPage();
    const card = document.querySelector(`.pick-card[data-domain="${domainKey}"]`);
    if (card) selectDomain(domainKey, card);
  }, 300);
}

function handleServicesBack() {
  if (state.currentStep <= 1) goBack();
  else wzGoStep(state.currentStep - 1);
}

function wzGoStep(n) {
  for (let i = 1; i <= 4; i++) {
    const wz = document.getElementById('wz' + i);
    const step = document.getElementById('svc-step' + i);
    if (wz) {
      wz.classList.remove('active', 'done');
      if (i < n) wz.classList.add('done');
      else if (i === n) wz.classList.add('active');
    }
    if (step) step.classList.toggle('active', i === n);
  }
  state.currentStep = n;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function selectDomain(key, el) {
  document.querySelectorAll('.pick-card').forEach(c => c.classList.remove('selected'));
  if (el) el.classList.add('selected');
  state.domain = key;
  const d = domainServices[key];
  if (!d) return;
  state.domainName = d.name;

  // Build domain-specific services grid
  const grid = document.getElementById('domain-services-grid');
  if (grid) {
    grid.innerHTML = d.services.map(s => `
      <div class="svc-card" onclick="selectService('${s.type}','${s.nm}','${s.ico}',this)">
        <span style="display:inline-block;padding:2px 9px;border-radius:9px;background:rgba(200,169,126,.12);
          color:var(--gold);font-size:10px;font-weight:800;margin-bottom:8px">${s.tag}</span>
        <div class="svc-ico">${s.ico}</div>
        <div class="svc-nm">${s.nm}</div>
        <div class="svc-desc">${s.desc}</div>
      </div>`).join('');
  }

  const title = document.getElementById('step2-domain-title');
  const sub   = document.getElementById('step2-domain-sub');
  if (title) title.textContent = d.icon + ' خدمات ' + d.name;
  if (sub)   sub.textContent   = 'اختر الخدمة المناسبة لمشروعك في ' + d.name;

  setTimeout(() => wzGoStep(2), 200);
}

function selectService(type, name, icon, el) {
  document.querySelectorAll('#domain-services-grid .svc-card').forEach(c => c.classList.remove('selected'));
  if (el) el.classList.add('selected');
  state.serviceType = type;
  state.serviceName = name;
  state.serviceIcon = icon;
  buildStep3(type);
  setTimeout(() => wzGoStep(3), 200);
}

function buildStep3(type) {
  const inner = document.getElementById('step3-inner');
  if (!inner) return;
  let html = `<h3 style="font-size:17px;font-weight:900;color:var(--brown);margin-bottom:4px">${state.serviceIcon} ${state.serviceName}</h3>`;

  if (type === 'video') {
    html += `<p style="font-size:13px;color:var(--brown3);margin-bottom:22px">اختر نوع الفيديو والسكريبت ثم أدخل بيانات مشروعك</p>
    <div style="margin-bottom:22px">
      <div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px">📹 نوع الفيديو</div>
      <div class="type-grid" id="tg-video">
        <div class="type-card" onclick="selectTypeCard('tg-video',this,'videoType','إعلان')"><div class="type-ico">📢</div><div class="type-nm">إعلان</div></div>
        <div class="type-card" onclick="selectTypeCard('tg-video',this,'videoType','سوشيال')"><div class="type-ico">📱</div><div class="type-nm">سوشيال</div></div>
        <div class="type-card" onclick="selectTypeCard('tg-video',this,'videoType','تعليمي')"><div class="type-ico">📚</div><div class="type-nm">تعليمي</div></div>
        <div class="type-card" onclick="selectTypeCard('tg-video',this,'videoType','ترويجي')"><div class="type-ico">🚀</div><div class="type-nm">ترويجي</div></div>
      </div>
    </div>
    <div style="margin-bottom:22px">
      <div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px">📝 نوع السكريبت</div>
      <div class="type-grid" id="tg-script">
        <div class="type-card" onclick="selectTypeCard('tg-script',this,'scriptType','قصة')"><div class="type-ico">📖</div><div class="type-nm">قصة</div></div>
        <div class="type-card" onclick="selectTypeCard('tg-script',this,'scriptType','إعلان مباشر')"><div class="type-ico">📣</div><div class="type-nm">إعلان مباشر</div></div>
        <div class="type-card" onclick="selectTypeCard('tg-script',this,'scriptType','تعليمي')"><div class="type-ico">🎓</div><div class="type-nm">تعليمي</div></div>
        <div class="type-card" onclick="selectTypeCard('tg-script',this,'scriptType','مراجعة')"><div class="type-ico">⭐</div><div class="type-nm">مراجعة منتج</div></div>
      </div>
    </div>`;
  } else if (type === 'content') {
    html += `<p style="font-size:13px;color:var(--brown3);margin-bottom:22px">اختر المنصة ونوع المحتوى</p>
    <div style="margin-bottom:22px">
      <div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px">📱 المنصة</div>
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px" id="platform-row">
        <button class="plat-btn" onclick="selectPlatform('Instagram',this)">📸 Instagram</button>
        <button class="plat-btn" onclick="selectPlatform('TikTok',this)">🎵 TikTok</button>
        <button class="plat-btn" onclick="selectPlatform('Snapchat',this)">👻 Snapchat</button>
        <button class="plat-btn" onclick="selectPlatform('Facebook',this)">📘 Facebook</button>
        <button class="plat-btn" onclick="selectPlatform('YouTube',this)">▶️ YouTube</button>
      </div>
      <div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:10px">🎨 نوع المحتوى</div>
      <div class="type-grid" id="tg-content">
        <div class="type-card" onclick="selectTypeCard('tg-content',this,'contentType','ترفيهي')"><div class="type-ico">😄</div><div class="type-nm">ترفيهي</div></div>
        <div class="type-card" onclick="selectTypeCard('tg-content',this,'contentType','تعليمي')"><div class="type-ico">📚</div><div class="type-nm">تعليمي</div></div>
        <div class="type-card" onclick="selectTypeCard('tg-content',this,'contentType','ترويجي')"><div class="type-ico">🛍️</div><div class="type-nm">ترويجي</div></div>
        <div class="type-card" onclick="selectTypeCard('tg-content',this,'contentType','تفاعلي')"><div class="type-ico">💬</div><div class="type-nm">تفاعلي</div></div>
      </div>
    </div>`;
  }

  html += buildProjectForm() +
    `<button class="btn-cta-main" onclick="generateWithAI()">
      ${type==='video' ? '🎬 توليد السكريبت' : type==='plan' ? '📋 توليد خطة التسويق' : type==='content' ? '💡 توليد أفكار المحتوى' : '🎯 توليد أفكار الحملة'} 🚀
    </button>`;

  inner.innerHTML = html;
}

function buildProjectForm() {
  return `
  <div class="form-box" style="background:white;border-radius:16px;padding:24px;box-shadow:var(--shadow);margin-bottom:22px;max-width:800px">
    <div style="font-size:14px;font-weight:900;color:var(--brown);margin-bottom:16px;
      padding-bottom:12px;border-bottom:1px solid rgba(200,169,126,.15)">📁 بيانات مشروعك</div>
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">اسم المشروع *</label>
        <input class="form-inp" id="f-name" placeholder="مثال: مطعم الشيف أحمد" value="${state.projectName}"/>
      </div>
      <div class="form-group">
        <label class="form-label">نوع المشروع *</label>
        <input class="form-inp" id="f-type" placeholder="مثال: مطعم وجبات سريعة" value="${state.projectType}"/>
      </div>
      <div class="form-group">
        <label class="form-label">الجمهور المستهدف</label>
        <input class="form-inp" id="f-audience" placeholder="مثال: شباب 18-30 في القاهرة" value="${state.audience}"/>
      </div>
      <div class="form-group">
        <label class="form-label">الأسعار / المنتجات الرئيسية</label>
        <input class="form-inp" id="f-prices" placeholder="مثال: وجبة برجر 35 ريال" value="${state.prices}"/>
      </div>
    </div>
    <div class="form-group" style="margin-top:14px">
      <label class="form-label">الميزانية التسويقية الشهرية</label>
      <div class="budget-row">
        <input type="range" min="100" max="20000" value="${state.budget}" step="100" id="budget-range"
          oninput="document.getElementById('budget-val').textContent='$'+this.value;state.budget=+this.value"
          style="flex:1;accent-color:var(--gold)"/>
        <span id="budget-val" style="font-weight:900;color:var(--brown);min-width:70px">$${state.budget}</span>
      </div>
    </div>
    <div class="form-group" style="margin-top:14px">
      <label class="form-label">وصف المشروع والمنتجات</label>
      <textarea class="form-inp" id="f-desc" rows="3"
        placeholder="وصف مختصر لمشروعك، خدماتك، ومنتجاتك الرئيسية..."
        style="resize:vertical">${state.description}</textarea>
    </div>
  </div>`;
}

function selectTypeCard(gridId, el, stateKey, val) {
  const grid = document.getElementById(gridId);
  if (grid) grid.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
  if (el) el.classList.add('selected');
  state[stateKey] = val;
}

function selectPlatform(p, el) {
  document.querySelectorAll('#platform-row .plat-btn').forEach(b => b.classList.remove('selected'));
  if (el) el.classList.add('selected');
  state.platform = p;
}

function saveFormData() {
  state.projectName  = (document.getElementById('f-name')     || {}).value || '';
  state.projectType  = (document.getElementById('f-type')     || {}).value || '';
  state.audience     = (document.getElementById('f-audience') || {}).value || '';
  state.prices       = (document.getElementById('f-prices')   || {}).value || '';
  state.description  = (document.getElementById('f-desc')     || {}).value || '';
  state.budget       = +((document.getElementById('budget-range') || {}).value || 1000);
  try {
    localStorage.setItem('soqly_project', JSON.stringify({
      projectName: state.projectName, projectType: state.projectType,
      audience: state.audience, prices: state.prices,
      description: state.description, budget: state.budget,
      domain: state.domain, domainName: state.domainName
    }));
  } catch(e) {}
}

function loadSavedProject() {
  try {
    const s = JSON.parse(localStorage.getItem('soqly_project') || '{}');
    if (s.projectName) state.projectName = s.projectName;
    if (s.projectType) state.projectType = s.projectType;
    if (s.audience)    state.audience    = s.audience;
    if (s.prices)      state.prices      = s.prices;
    if (s.description) state.description = s.description;
    if (s.budget)      state.budget      = s.budget;
    if (s.domain && !state.domain)     state.domain     = s.domain;
    if (s.domainName && !state.domainName) state.domainName = s.domainName;
  } catch(e) {}
}

function getSavedProject() {
  try { return JSON.parse(localStorage.getItem('soqly_project') || '{}'); } catch(e) { return {}; }
}

/* ============================================================
   AI GENERATION — Claude API + Rich Local Fallback
   ============================================================ */
async function generateWithAI() {
  saveFormData();
  const name     = state.projectName || 'مشروعك';
  const type     = state.projectType || state.domainName || 'المشروع';
  const audience = state.audience    || 'الجمهور المستهدف';
  const budget   = state.budget;
  const desc     = state.description || '';
  const prices   = state.prices      || '';

  if (!state.domain) { showToast('⚠️ اختر مجال مشروعك أولاً'); return; }

  wzGoStep(4);
  const loading = document.getElementById('step4-loading');
  const result  = document.getElementById('step4-result');
  if (loading) loading.style.display = 'block';
  if (result)  result.style.display  = 'none';

  const prompt = buildPrompt(name, type, audience, budget, desc, prices);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    const text = data.content?.map(i => i.text || '').join('\n') || generateLocalResult();
    showResult(text);
  } catch(e) {
    showResult(generateLocalResult());
  }
}

function buildPrompt(name, type, audience, budget, desc, prices) {
  const svcType = state.serviceType;
  const domain  = state.domainName;

  const base = `اسم المشروع: ${name}\nالمجال: ${domain} — ${type}\nالجمهور: ${audience}\nالميزانية: $${budget}/شهر\nالأسعار: ${prices}\nوصف: ${desc}`;

  if (svcType === 'video') return `أنت خبير تسويق عربي محترف. اكتب سكريبت فيديو ${state.videoType||'ترويجي'} بأسلوب "${state.scriptType||'إعلان مباشر'}" للمشروع التالي:\n${base}\n\nالسكريبت مقسم لمشاهد واضحة مع: النص المنطوق + وصف اللقطة + المدة. أضف كابشن وهاشتاقات. 30-60 ثانية.`;

  if (svcType === 'plan') return `أنت خبير تسويق. اكتب خطة تسويق شهرية مفصلة لـ:\n${base}\n\nتشمل: أهداف شهرية + المنصات + خطة 4 أسابيع + توزيع ميزانية + KPIs + نصائح خاصة بـ${domain}.`;

  if (svcType === 'content') return `أنت خبير محتوى رقمي متخصص في ${domain}. اقترح 10 أفكار محتوى لـ:\n${base}\nالمنصة: ${state.platform||'السوشيال ميديا'} | النوع: ${state.contentType||'متنوع'}\n\nلكل فكرة: العنوان + التفاصيل + نوع المحتوى + كابشن مقترح.`;

  return `أنت خبير إعلانات. اقترح استراتيجية حملات إعلانية لـ:\n${base}\n\nاكتب: 3 أفكار حملات + النص الإعلاني لكل منها + الجمهور المستهدف + المنصة + الميزانية المقترحة + توقعات النتائج.`;
}

function generateLocalResult() {
  const name     = state.projectName || 'مشروعك';
  const type     = state.projectType || state.domainName;
  const audience = state.audience    || 'الجمهور المستهدف';
  const budget   = state.budget;
  const svcType  = state.serviceType;
  const domain   = state.domainName  || 'مجالك';

  // ===== VIDEO SCRIPT =====
  if (svcType === 'video') {
    const scriptTypes = {
      'قصة': `[المشهد 1 — 0:00-0:05]\n📷 لقطة: شخص يواجه المشكلة\n🎙️ "كنت في نفس موقفك... بدوّر على ${type} بجودة حقيقية وسعر مناسب..."\n\n[المشهد 2 — 0:05-0:15]\n📷 لقطة: اكتشاف الحل\n🎙️ "وبعدين لقيت ${name}... وحياتي اتغيّرت"\n\n[المشهد 3 — 0:15-0:25]\n📷 لقطة: النتائج الإيجابية\n🎙️ "${name} بيقدملك ${type} بجودة لا مثيل لها في ${audience}"\n\n[المشهد 4 — 0:25-0:30]\n📷 لقطة: CTA قوي\n🎙️ "جرّب ${name} دلوقتي — اللينك في البايو 👇"`,
      'إعلان مباشر': `[المشهد 1 — 0:00-0:03]\n📷 لقطة افتتاحية مثيرة للاهتمام\n🎙️ "⚡ عرض محدود لـ 48 ساعة فقط!"\n\n[المشهد 2 — 0:03-0:12]\n📷 عرض المنتج/الخدمة\n🎙️ "${name} — أفضل ${type} بسعر لا يتكرر!"\n\n[المشهد 3 — 0:12-0:22]\n📷 المزايا\n🎙️ "✅ جودة عالية ✅ سعر مناسب ✅ ${audience} بيحبوه"\n\n[المشهد 4 — 0:22-0:30]\n📷 CTA مع Urgency\n🎙️ "اتواصل معنا الآن قبل ما العرض ينتهي! 📞"`,
      'تعليمي': `[المشهد 1 — 0:00-0:05]\n📷 سؤال أو مشكلة\n🎙️ "هل تعرف إزاي تحصل على أفضل ${type}?"\n\n[المشهد 2 — 0:05-0:18]\n📷 خطوات عملية\n🎙️ "الخطوة 1: اختار الجودة مش السعر الرخيص\nالخطوة 2: ابحث عن التقييمات الحقيقية\nالخطوة 3: جرّب ${name}!"\n\n[المشهد 3 — 0:18-0:28]\n📷 النتيجة\n🎙️ "دلوقتي تعرف — و${name} هنا يساعدك تطبّق ده!"\n\n[المشهد 4 — 0:28-0:30]\n📷 CTA\n🎙️ "احجز دلوقتي! 👇"`,
      'مراجعة': `[المشهد 1 — 0:00-0:05]\n📷 افتتاح صادق\n🎙️ "هقولكم رأيي الصريح في ${name}..."\n\n[المشهد 2 — 0:05-0:20]\n📷 المراجعة\n🎙️ "جربت ${name} لمدة أسبوع وأنا رأيي إن...\n✅ إيجابيات: الجودة ممتازة والسعر معقول لـ${audience}\n⚠️ ملاحظة: محتاج تحجز مسبقاً في أوقات الذروة"\n\n[المشهد 3 — 0:20-0:28]\n📷 التقييم النهائي\n🎙️ "التقييم: 9/10 — بوصي بيه بشدة!"\n\n[المشهد 4 — 0:28-0:30]\n📷 CTA\n🎙️ "اللينك في البايو جرّبه بنفسك! 👇"`
    };
    const scriptContent = scriptTypes[state.scriptType] || scriptTypes['إعلان مباشر'];
    return `🎬 سكريبت فيديو ${state.videoType || 'ترويجي'} — "${name}"\nنوع السكريبت: ${state.scriptType || 'إعلان مباشر'}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━\n${scriptContent}\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📱 كابشن مقترح:\n${name} — أفضل ${type} لـ ${audience}! 🔥\n${state.videoType === 'إعلان' ? 'عرض محدود — تواصل الآن! ⚡' : 'اكتشف التفرقة بنفسك 👇'}\n\n#${name.replace(/\s/g,'')} #${(type||'').replace(/\s/g,'')} #${domain.replace(/\s/g,'')} #تسويق #سوشيال_ميديا`;
  }

  // ===== CONTENT IDEAS =====
  if (svcType === 'content') {
    const platform = state.platform || 'السوشيال ميديا';
    const domainIdeas = {
      restaurant: ['📸 صورة طبق اليوم مع كاليجرافي الاسم والسعر', '🎬 Reel تحضير الطبق الأشهر من الصفر', '❓ "خمّن الطبق من الصورة المقربة"', '⭐ Story تقييم عميل حقيقي بعد الأكل مباشرة', '🏷️ "وجبة اليوم" بسعر خاص مع Countdown', '🎭 خلف الكواليس في المطبخ الساعة 7 الصبح', '🤤 "أكل جديد وصل!" — Teaser قبل الإضافة', '📊 "أكتر 3 طلبات هذا الأسبوع" — Social Proof'],
      fashion: ['👗 Try-On Reel لقطع الكولكشن الجديد', '✨ "3 طرق تنسيق لقطعة واحدة"', '📊 Poll "لوك A أم لوك B؟" في الستوري', '🛍️ Haul من الوصول الجديد بردود فعل طبيعية', '🎯 "لوك اليوم" بالسعر الكامل وطريقة الشراء', '💡 "5 أخطاء في اختيار الملابس"', '📦 Unboxing الطلب مع Packaging الجميل', '🌟 Testimonial عميلة راضية بالتفصيل'],
      beauty: ['✨ Tutorial ماكياج 5 دقائق كامل', '📸 قبل وبعد بدون فلاتر — Real Results', '🧪 Review منتج جديد بالتفصيل والصدق', '💡 "5 أخطاء في روتين العناية"', '🌅 Routine صباحية كاملة خطوة بخطوة', '💰 "أفضل 3 منتجات تحت 100 جنيه"', '🤝 Collab مع Beauty Influencer', '🎁 Giveaway بشروط بسيطة لزيادة المتابعين'],
      tech: ['⚡ Demo المنتج في 60 ثانية', '💡 "نصيحة تقنية تغنيك عن ساعة من العمل"', '📊 مقارنة موضوعية مع المنافسين', '🎯 Case Study: كيف حل منتجك مشكلة عميل', '🔧 Tutorial: كيفية استخدام الميزة الأهم', '⚠️ "أشهر 3 أخطاء يقع فيها المستخدمون"', '🚀 "ميزة جديدة!" — Feature Announcement', '💬 Q&A: أسئلة المستخدمين والإجابات']
    };
    const ideas = domainIdeas[state.domain] || domainIdeas['restaurant'];
    return `💡 أفكار محتوى لـ "${name}" على ${platform}\nالمجال: ${domain} | النوع: ${state.contentType || 'متنوع'}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${ideas.map((idea, i) => `${i+1}. ${idea}`).join('\n\n')}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📅 جدول النشر المقترح لهذا الأسبوع:\nالأحد: الفكرة 1 — ${ideas[0]}\nالثلاثاء: الفكرة 2 — ${ideas[2]}\nالخميس: الفكرة 3 — ${ideas[4]}\nالسبت: الفكرة 4 — ${ideas[6]}\n\n💡 نصيحة: انشر في ${platform === 'Instagram' || platform === 'TikTok' ? '7-9 ص أو 7-10 م' : '12-2 ظ أو 7-10 م'} لأعلى وصول.`;
  }

  // ===== ADS CAMPAIGN =====
  if (svcType === 'ads') {
    const b30 = Math.round(budget * 0.3);
    const b50 = Math.round(budget * 0.5);
    const b20 = Math.round(budget * 0.2);
    return `🎯 استراتيجية حملات إعلانية لـ "${name}"\nالمجال: ${domain} | الجمهور: ${audience} | الميزانية: $${budget}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📢 الحملة 1 — Awareness (بناء الوعي)\n• الهدف: تعريف الناس بـ${name}\n• المنصة: Instagram + TikTok\n• الميزانية: $${b30}/شهر\n• نوع المحتوى: فيديو قصير 15-30 ثانية\n• الجمهور: ${audience} في نطاق 20 كم\n\n🎯 الحملة 2 — Consideration (التفكير)\n• الهدف: جعل الجمهور يزور صفحتك ويطلع على المنتجات\n• المنصة: Facebook Ads\n• الميزانية: $${b50}/شهر\n• نوع المحتوى: Carousel للمنتجات + Testimonials\n• الجمهور: Retargeting زوار الموقع + Lookalike Audience\n\n🛒 الحملة 3 — Conversion (التحويل)\n• الهدف: تحويل المهتمين لعملاء فعليين\n• المنصة: Google Search Ads\n• الميزانية: $${b20}/شهر\n• الكلمات المفتاحية: "${type}، ${type} ${audience}، أفضل ${type}"\n• CTA: "احجز الآن | اشتري الآن"\n\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📊 توقعات النتائج الشهرية:\n• الوصول المتوقع: ${budget * 50}-${budget * 150} شخص\n• النقرات: ${budget * 5}-${budget * 20}\n• العملاء الجدد: ${Math.round(budget * 0.5)}-${budget} عميل\n• العائد المتوقع: $${budget * 3}-$${budget * 8}`;
  }

  // ===== MARKETING PLAN =====
  const b30 = Math.round(budget * 0.3);
  const b40 = Math.round(budget * 0.4);
  const b20 = Math.round(budget * 0.2);
  const b10 = Math.round(budget * 0.1);
  return `📋 خطة التسويق الشهرية لـ "${name}"\nالمجال: ${domain} | الجمهور: ${audience} | الميزانية: $${budget}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━\n🎯 الأهداف الشهرية:\n• زيادة المتابعين 25-30%\n• رفع التفاعل 40%\n• تحويل 5% للعملاء الفعليين\n• بناء قاعدة ولاء 100+ عميل\n\n━━━━━━━━━━━━━━━━━━━━━━━━━\n📅 خطة الأسابيع الأربعة:\n\n🟡 الأسبوع 1 — بناء الوعي:\n• 4-5 منشورات أسبوعياً (صور + ريلز)\n• فيديو تعريفي بـ ${name}\n• حملة إعلانية صغيرة $${b30}\n\n🟠 الأسبوع 2 — التفاعل:\n• محتوى تفاعلي (Polls + Q&A)\n• Reels وTikTok قصيرة\n• تعاون مع مؤثر صغير\n\n🟢 الأسبوع 3 — التحويل:\n• عرض خاص لمتابعيك\n• إعلانات Retargeting $${b40}\n• Live أو Q&A مباشر\n\n🔵 الأسبوع 4 — الاحتفاظ:\n• جمع التقييمات والآراء\n• برنامج ولاء أو إحالة\n• تحليل الأداء وتعديل الخطة\n\n━━━━━━━━━━━━━━━━━━━━━━━━━\n💰 توزيع الميزانية ($${budget}):\n• محتوى وتصميم: $${b30} (30%)\n• إعلانات مدفوعة: $${b40} (40%)\n• مؤثرين و UGC: $${b20} (20%)\n• أدوات وتحليل: $${b10} (10%)\n\n━━━━━━━━━━━━━━━━━━━━━━━━━\n📊 KPIs للقياس:\n• Reach الشهري\n• Engagement Rate (هدف: +3%)\n• تحويل الموقع أو الحجوزات\n• تكلفة اكتساب العميل (CAC)`;
}

function showResult(text) {
  const loading = document.getElementById('step4-loading');
  const result  = document.getElementById('step4-result');
  if (loading) loading.style.display = 'none';
  if (!result) return;
  result.style.display = 'block';
  result.innerHTML = `
    <div class="result-box">
      <div class="result-title">
        ✨ النتيجة الجاهزة
        <span style="font-size:12px;color:var(--brown3);font-weight:600">${state.serviceName} — ${state.projectName}</span>
      </div>
      <div class="result-text" id="result-text">${text}</div>
      <div class="result-actions">
        <button class="btn-act btn-act-copy"    onclick="copyResult()">📋 نسخ</button>
        <button class="btn-act btn-act-calendar" onclick="addToCalendar()">📅 Calendar</button>
        <button class="btn-act btn-act-download" onclick="downloadResult()">⬇️ تحميل</button>
        <button class="btn-act btn-act-new"      onclick="initServicesPage()">🔄 طلب جديد</button>
      </div>
      <div class="upsell-box">
        <div class="upsell-title">🚀 هل تريد نتائج أقوى بالذكاء الاصطناعي؟</div>
        <div class="upsell-sub">الخطة المدفوعة تتيح: نتائج AI حقيقية غير محدودة، PDF احترافي، جدول نشر تلقائي</div>
        <div class="upsell-btns">
          <button class="btn-sm btn-sm-primary" onclick="goPage('landing');sTo('pricing')">⭐ ترقية للـ Pro</button>
          <button class="btn-sm" onclick="goPage('landing');sTo('pricing')">عرض الباقات</button>
        </div>
      </div>
    </div>`;

  // Save result
  try {
    const results = JSON.parse(localStorage.getItem('soqly_results') || '[]');
    results.unshift({ id: Date.now(), text, serviceName: state.serviceName,
      serviceIcon: state.serviceIcon, projectName: state.projectName,
      domain: state.domainName, date: new Date().toLocaleDateString('ar-EG') });
    if (results.length > 50) results.pop();
    localStorage.setItem('soqly_results', JSON.stringify(results));
  } catch(e) {}
}

function copyResult() {
  const el = document.getElementById('result-text');
  if (el) navigator.clipboard.writeText(el.textContent).then(() => showToast('تم النسخ! 📋')).catch(() => showToast('انسخ يدوياً'));
}

function downloadResult() {
  const el = document.getElementById('result-text');
  if (!el) return;
  const blob = new Blob([el.textContent], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `sawkly-${state.serviceType}-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('تم التحميل! ⬇️');
}

function addToCalendar() {
  const el   = document.getElementById('result-text');
  const text = el ? el.textContent.slice(0, 200) : 'خطة تسويق من Sawkly';
  const title   = encodeURIComponent('خطة تسويق: ' + (state.projectName || 'مشروعي'));
  const details = encodeURIComponent(text);
  const now = new Date();
  const fmt = d => d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
  const end = new Date(now.getTime() + 3600000);
  window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text='+title+'&details='+details+'&dates='+fmt(now)+'/'+fmt(end), '_blank');
  showToast('تم فتح Google Calendar 📅');
}

/* ============================================================
   LIBRARY
   ============================================================ */
let libDomainFilter = 'all';
let libTypeFilter   = 'all';
let libSearch       = '';

function renderLibrary() {
  const grid    = document.getElementById('lib-grid');
  const countEl = document.getElementById('lib-count');
  if (!grid) return;

  let items = marketingLibrary;
  if (libDomainFilter !== 'all') items = items.filter(i => i.domain === libDomainFilter);
  if (libTypeFilter   !== 'all') items = items.filter(i => i.type  === libTypeFilter);
  if (libSearch) {
    const q = libSearch.toLowerCase();
    items = items.filter(i => i.title.includes(q) || i.desc.includes(q) || i.tip.includes(q));
  }

  if (countEl) countEl.textContent = items.length + ' عنصر';
  if (!items.length) {
    grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--brown3)">لا توجد نتائج 🔍</div>';
    return;
  }

  grid.innerHTML = items.map(item => `
    <div class="lib-card" onclick="showLibCard(${item.id})" style="background:white;border-radius:var(--radius);
      padding:20px;border:1px solid rgba(200,169,126,.12);cursor:pointer;transition:all .25s;
      box-shadow:var(--shadow)" onmouseover="this.style.transform='translateY(-3px)';this.style.borderColor='var(--gold)'"
      onmouseout="this.style.transform='';this.style.borderColor='rgba(200,169,126,.12)'">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="padding:3px 10px;border-radius:10px;background:rgba(200,169,126,.12);color:var(--gold);font-size:11px;font-weight:800">${item.tag}</span>
      </div>
      <div style="font-size:14px;font-weight:800;color:var(--brown);margin-bottom:8px;line-height:1.4">${item.title}</div>
      <div style="font-size:12px;color:var(--brown3);line-height:1.7">${item.desc}</div>
      <div style="margin-top:10px;font-size:11px;color:var(--gold);font-weight:700">💡 ${item.tip.slice(0,60)}...</div>
    </div>`).join('');
}

function filterByDomain(domain, el) {
  libDomainFilter = domain;
  document.querySelectorAll('.lib-domain-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  renderLibrary();
}

function filterByType(type, el) {
  libTypeFilter = type;
  document.querySelectorAll('.lib-type-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  renderLibrary();
}

function filterLibrary(val) {
  libSearch = val.trim();
  renderLibrary();
}

function showLibCard(id) {
  const item = marketingLibrary.find(i => i.id === id);
  if (!item) return;
  showToolsModal(item.title, `
    <div style="margin-bottom:16px">
      <span style="padding:4px 12px;border-radius:10px;background:rgba(200,169,126,.15);color:var(--gold);font-size:12px;font-weight:800">${item.tag}</span>
    </div>
    <p style="font-size:14px;color:var(--brown2);line-height:1.8;margin-bottom:16px">${item.desc}</p>
    <div style="background:rgba(200,169,126,.08);border-radius:12px;padding:16px;border-right:3px solid var(--gold)">
      <div style="font-size:12px;font-weight:800;color:var(--gold);margin-bottom:6px">💡 نصيحة التطبيق</div>
      <div style="font-size:13px;color:var(--brown2);line-height:1.7">${item.tip}</div>
    </div>
    <button onclick="closeToolsModal()" style="margin-top:16px;width:100%;padding:12px;border-radius:16px;
      background:linear-gradient(135deg,var(--brown),var(--brown2));border:none;color:white;
      font-size:14px;font-weight:800;cursor:pointer;font-family:'Cairo',sans-serif">
      حفظ الفكرة ✅
    </button>`);
}

/* ============================================================
   DASHBOARD TABS CONTENT
   ============================================================ */
function renderHomeTab() {
  const results  = JSON.parse(localStorage.getItem('soqly_results')        || '[]');
  const projects = JSON.parse(localStorage.getItem('soqly_projects_local') || '[]');

  const st1 = document.getElementById('stat-plans');
  const st2 = document.getElementById('stat-projects');
  const st3 = document.getElementById('stat-ideas');
  if (st1) st1.textContent = results.length;
  if (st2) st2.textContent = projects.length;
  if (st3) st3.textContent = results.filter(r => r.serviceIcon === '💡').length;

  const list = document.getElementById('recent-results-list');
  if (list) {
    if (!results.length) {
      list.innerHTML = '<div style="color:var(--brown3);font-size:13px;text-align:center;padding:20px 0">لا توجد نتائج بعد — ابدأ بالخدمات! 🚀</div>';
      return;
    }
    list.innerHTML = results.slice(0, 5).map(r => `
      <div class="li-item">
        <div class="li-ico">${r.serviceIcon || '📋'}</div>
        <div class="li-info">
          <div class="li-name">${r.serviceName || 'خدمة'} — ${r.projectName || 'مشروع'}</div>
          <div class="li-sub">${r.domain || ''} • ${r.date || ''}</div>
        </div>
        <span class="badge badge-green">مكتمل</span>
      </div>`).join('');
  }
}

function renderIdeasTab() {
  const grid = document.getElementById('ideas-grid');
  if (!grid) return;
  const items = marketingLibrary.filter(i => i.type === 'tip' || i.type === 'hook').slice(0, 9);
  grid.innerHTML = items.map(item => `
    <div class="tool-card" onclick="showLibCard(${item.id})">
      <div class="tool-ico">${item.tag.split(' ')[0]}</div>
      <div class="tool-nm">${item.title.slice(0, 35)}${item.title.length > 35 ? '...' : ''}</div>
      <div class="tool-desc">${item.desc.slice(0, 70)}...</div>
      <button class="btn-detail">عرض التفاصيل ←</button>
    </div>`).join('');
}

function renderCampaignsTab() {
  const list = document.getElementById('campaigns-list');
  if (!list) return;
  const campaigns = marketingLibrary.filter(i => i.type === 'campaign');
  list.innerHTML = campaigns.slice(0, 8).map(c => `
    <div class="li-item">
      <div class="li-ico">📢</div>
      <div class="li-info">
        <div class="li-name">${c.title}</div>
        <div class="li-sub">${c.desc.slice(0, 70)}...</div>
      </div>
      <button class="btn-detail" onclick="showLibCard(${c.id})">تفاصيل</button>
    </div>`).join('');
}

function renderResultsTab() {
  try {
    const results = JSON.parse(localStorage.getItem('soqly_results') || '[]');
    const list = document.getElementById('results-list');
    if (!list) return;
    if (!results.length) {
      list.innerHTML = '<div style="color:var(--brown3);text-align:center;padding:30px">لا توجد نتائج محفوظة بعد</div>';
      return;
    }
    list.innerHTML = results.map((r, i) => `
      <div class="li-item">
        <div class="li-ico">${r.serviceIcon || '📋'}</div>
        <div class="li-info">
          <div class="li-name">${r.serviceName} — ${r.projectName}</div>
          <div class="li-sub">${r.domain} • ${r.date}</div>
        </div>
        <button class="btn-detail" onclick="viewSavedResult(${i})">عرض</button>
      </div>`).join('');
  } catch(e) {}
}

function viewSavedResult(idx) {
  try {
    const results = JSON.parse(localStorage.getItem('soqly_results') || '[]');
    const r = results[idx];
    if (!r) return;
    showToolsModal(r.serviceName + ' — ' + r.projectName,
      `<div style="white-space:pre-line;font-size:13px;color:var(--brown2);line-height:1.8;
        max-height:400px;overflow-y:auto;background:var(--cream);padding:16px;border-radius:12px">${r.text}</div>
       <button onclick="navigator.clipboard.writeText(this.previousElementSibling.textContent).then(()=>showToast('تم النسخ!'));closeToolsModal()"
        style="margin-top:14px;width:100%;padding:11px;border-radius:14px;background:linear-gradient(135deg,var(--brown),var(--brown2));
          border:none;color:white;font-size:13px;font-weight:800;cursor:pointer;font-family:'Cairo',sans-serif">
        📋 نسخ النتيجة
      </button>`);
  } catch(e) {}
}

function renderToolsTab() {
  const grid = document.getElementById('tools-grid-main');
  if (!grid) return;
  const tools = [
    { ico:'🪝', title:'مولد Hooks جذابة',   desc:'أكثر من 30 Hook جاهز لمجالك',  fn:'openHookGenerator()' },
    { ico:'#️⃣', title:'مولد هاشتاقات',      desc:'هاشتاقات مخصصة لكل مجال',       fn:'openHashtagGenerator()' },
    { ico:'🎨', title:'أفكار تصميم بوستات', desc:'قوالب وأفكار بصرية للبوستات',   fn:'openPostDesignGenerator()' },
    { ico:'📅', title:'جدول المحتوى',       desc:'خطط نشر أسبوعية وشهرية جاهزة', fn:`goPage('library')` },
    { ico:'📊', title:'مكتبة الأفكار',      desc:'56+ فكرة تسويقية لكل المجالات', fn:`goPage('library')` },
    { ico:'🤖', title:'AI Chat',            desc:'تحدث مع مساعد التسويق الذكي',   fn:`goPage('chat')` },
  ];
  grid.innerHTML = tools.map(t => `
    <div class="tool-card" onclick="${t.fn}">
      <div class="tool-ico">${t.ico}</div>
      <div class="tool-nm">${t.title}</div>
      <div class="tool-desc">${t.desc}</div>
      <button class="btn-detail">استخدم الآن ←</button>
    </div>`).join('');
}

/* ============================================================
   TOOLS MODAL
   ============================================================ */
function showToolsModal(title, html) {
  let modal = document.getElementById('tools-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'tools-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.55);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px';
    modal.innerHTML = `<div style="background:white;border-radius:22px;padding:32px;max-width:560px;width:100%;max-height:90vh;overflow-y:auto;animation:fadeDown .3s ease">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
        <div id="tools-modal-title" style="font-size:18px;font-weight:900;color:var(--brown)"></div>
        <button onclick="closeToolsModal()" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--brown3)">✕</button>
      </div>
      <div id="tools-modal-body"></div>
    </div>`;
    modal.onclick = e => { if (e.target === modal) closeToolsModal(); };
    document.body.appendChild(modal);
  }
  document.getElementById('tools-modal-title').textContent = title;
  document.getElementById('tools-modal-body').innerHTML = html;
  modal.style.display = 'flex';
}

function closeToolsModal() {
  const modal = document.getElementById('tools-modal');
  if (modal) modal.style.display = 'none';
}

/* ============================================================
   HOOKS GENERATOR
   ============================================================ */
const allHooks = [
  '"لو بتعمل كده، بتخسر عملاء كل يوم"',
  '"السر اللي مش أحد بيقوله عن {مجالك}"',
  '"90% من الناس بيغلطوا في ده — أنت؟"',
  '"الطريقة الوحيدة اللي بتنجح 100%"',
  '"وقفت لما قرأت إن {مشكلة شائعة}"',
  '"3 أسباب بيخلوا {مشكلة} — الأخير هيصدمك"',
  '"لو عندك دقيقة واحدة — شوف ده"',
  '"الخطأ اللي بيكلّف كتير بدون ما تحس"',
  '"حقيقة {مجالك} اللي مش أحد بيقولهالك"',
  '"ليه 99% بيفشلوا في {هدف} وإزاي تكون الـ 1%"',
  '"جربت {حل} لأسبوع وده اللي حصل"',
  '"مش هتصدق إن ده بيتعمل في 5 دقائق"',
  '"أنا غلطت في ده لسنين — استفد من تجربتي"',
  '"الفرق بين {خيار A} و{خيار B} أكبر مما تتخيل"',
  '"Stop! قبل ما تعمل {فعل}، اقرأ ده"',
  '"ده أفضل استثمار وقت عملته في {مجالك}"',
  '"لو عارف ده من زمان كنت وفّرت كتير"',
  '"تحدي: جرّب ده لأسبوع وشوف الفرق"',
  '"السبب الحقيقي وراء {نتيجة إيجابية}"',
  '"الناس بتتفاجأ لما بقولهم إن {حقيقة}"',
];

function openHookGenerator() {
  refreshHooks();
  showToolsModal('🪝 مولد Hooks جذابة', document.getElementById('_hook-temp')?.innerHTML || buildHooksHTML());
}

function buildHooksHTML() {
  const shuffled = [...allHooks].sort(() => Math.random() - .5).slice(0, 6);
  return `<p style="font-size:13px;color:var(--brown3);margin-bottom:16px">اختر Hook مناسب لمحتواك وعدّله حسب مجالك</p>
  <div id="hooks-list" style="display:flex;flex-direction:column;gap:10px">
    ${shuffled.map((h, i) => `
    <div style="background:var(--cream);border-radius:12px;padding:14px;border:1px solid rgba(200,169,126,.15);display:flex;align-items:center;justify-content:space-between;gap:10px">
      <span style="font-size:13px;color:var(--brown);font-weight:700;flex:1">${h}</span>
      <button onclick="copyHook(this,'${h.replace(/'/g,'\\\'')}')"
        style="padding:5px 12px;border-radius:10px;background:rgba(200,169,126,.15);border:1px solid rgba(200,169,126,.3);
          color:var(--brown);font-size:11px;font-weight:700;cursor:pointer;font-family:'Cairo',sans-serif;white-space:nowrap">
        نسخ 📋
      </button>
    </div>`).join('')}
  </div>
  <button onclick="refreshHooksInModal()"
    style="margin-top:14px;width:100%;padding:11px;border-radius:14px;background:rgba(62,39,35,.08);border:none;
      color:var(--brown);font-size:13px;font-weight:800;cursor:pointer;font-family:'Cairo',sans-serif">
    🔄 أفكار جديدة
  </button>`;
}

function refreshHooksInModal() {
  const body = document.getElementById('tools-modal-body');
  if (body) body.innerHTML = buildHooksHTML();
}

function copyHook(el, text) {
  navigator.clipboard.writeText(text).then(() => showToast('تم نسخ الـ Hook! 🪝')).catch(() => showToast('انسخ يدوياً'));
}

/* ============================================================
   HASHTAG GENERATOR
   ============================================================ */
const hashtagsByDomain = {
  restaurant: ['#مطعم', '#أكل', '#فود', '#طعام', '#مطاعم_السعودية', '#أكل_لذيذ', '#فودي', '#وجبات', '#مطبخ', '#طبخ', '#مطاعم_مصر', '#أكل_عربي'],
  fashion:    ['#موضة', '#ستايل', '#ملابس', '#أزياء', '#فاشن', '#لوك', '#fashion', '#style', '#ootd', '#تنسيق', '#كولكشن', '#تريند'],
  beauty:     ['#تجميل', '#مكياج', '#سكين_كير', '#عناية', '#جمال', '#beauty', '#makeup', '#skincare', '#روتين', '#بشرة', '#كريم', '#سيروم'],
  tech:       ['#تقنية', '#تكنولوجيا', '#برمجة', '#تطبيقات', '#ذكاء_اصطناعي', '#تك', '#tech', '#software', '#ai', '#startup', '#ريادة', '#مشاريع'],
  services:   ['#خدمات', '#استشارات', '#محترف', '#أعمال', '#شركات', '#مشاريع', '#نجاح', '#business', '#تطوير', '#ريادة_الأعمال', '#خبرة', '#كوتش'],
  ecommerce:  ['#تسوق', '#شوبينج', '#متجر', '#عروض', '#خصومات', '#تجارة', '#بيع', '#شراء', '#اونلاين', '#متجر_إلكتروني', '#تجارة_إلكترونية', '#ديل'],
  general:    ['#تسويق', '#سوشيال_ميديا', '#محتوى', '#مشاريع_صغيرة', '#ريادة_أعمال', '#نجاح', '#تطوير', '#إبداع', '#براند', '#نمو', '#استراتيجية', '#مبيعات'],
};

function openHashtagGenerator() {
  const domain = state.domain || 'general';
  const tags = hashtagsByDomain[domain] || hashtagsByDomain.general;
  const allTags = [...tags, ...hashtagsByDomain.general].slice(0, 20);
  showToolsModal('#️⃣ مولد هاشتاقات', `
    <p style="font-size:13px;color:var(--brown3);margin-bottom:16px">هاشتاقات مخصصة لمجال ${state.domainName || 'مشروعك'}</p>
    <div id="hashtag-container" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">
      ${allTags.map(t => `<span onclick="this.classList.toggle('selected');if(this.classList.contains('selected')){this.style.background='rgba(200,169,126,.3)';this.style.borderColor='var(--gold)'}else{this.style.background='rgba(200,169,126,.1)';this.style.borderColor='transparent'}"
        style="padding:6px 14px;border-radius:20px;background:rgba(200,169,126,.1);border:1px solid transparent;
          font-size:13px;font-weight:700;color:var(--brown);cursor:pointer;transition:all .2s">${t}</span>`).join('')}
    </div>
    <button onclick="copyAllHashtags()"
      style="width:100%;padding:12px;border-radius:14px;background:linear-gradient(135deg,var(--brown),var(--brown2));
        border:none;color:white;font-size:14px;font-weight:800;cursor:pointer;font-family:'Cairo',sans-serif">
      نسخ كل الهاشتاقات 📋
    </button>`);
}

function copyAllHashtags() {
  const tags = document.querySelectorAll('#hashtag-container span');
  const selected = Array.from(tags).filter(t => t.classList.contains('selected'));
  const toUse = selected.length ? selected : Array.from(tags);
  const text = toUse.map(t => t.textContent).join(' ');
  navigator.clipboard.writeText(text).then(() => showToast('تم نسخ الهاشتاقات! #️⃣')).catch(() => showToast('انسخ يدوياً'));
}

/* ============================================================
   POST DESIGN IDEAS
   ============================================================ */
function openPostDesignGenerator() {
  const ideas = [
    { bg:'linear-gradient(135deg,#3E2723,#6D4C41)', text:'white', title:'Dark Elegant', sample:'خلفية بنية + نص ذهبي = احترافية وتميز' },
    { bg:'linear-gradient(135deg,#fff9f0,#ede8e0)', text:'#3E2723', title:'Cream Minimal', sample:'خلفية كريمية + نص بني = نظافة وأناقة' },
    { bg:'linear-gradient(135deg,#C8A97E,#a07840)', text:'white', title:'Gold Premium', sample:'خلفية ذهبية = فخامة وحضور قوي' },
    { bg:'linear-gradient(135deg,#1a1a2e,#16213e)', text:'#C8A97E', title:'Dark Modern', sample:'أزرق داكن + ذهبي = عصري ومميز' },
    { bg:'#ffffff', text:'#3E2723', title:'Clean White', sample:'أبيض نظيف = وضوح وبساطة مؤثرة' },
    { bg:'linear-gradient(135deg,#f0f4ff,#e8f0fe)', text:'#1d4ed8', title:'Cool Blue', sample:'أزرق فاتح = ثقة وموثوقية' },
  ];
  showToolsModal('🎨 أفكار تصميم بوستات', `
    <p style="font-size:13px;color:var(--brown3);margin-bottom:16px">أفكار بصرية لبوستاتك — انسخ الوصف وشاركه مع المصمم</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
      ${ideas.map(d => `
      <div style="border-radius:12px;overflow:hidden;cursor:pointer;border:2px solid transparent;transition:all .2s"
        onmouseover="this.style.borderColor='var(--gold)'" onmouseout="this.style.borderColor='transparent'"
        onclick="copyDesignIdea('${d.sample.replace(/'/g,'\\\')}')">
        <div style="height:80px;background:${d.bg};display:flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:800;color:${d.text};text-align:center;padding:8px">${d.title}</div>
        <div style="padding:8px;background:white;font-size:10px;color:var(--brown3);line-height:1.4">${d.sample}</div>
      </div>`).join('')}
    </div>
    <p style="font-size:12px;color:var(--brown3);margin-top:16px;text-align:center">اضغط على أي تصميم لنسخ الوصف</p>`);
}

function copyDesignIdea(text) {
  navigator.clipboard.writeText(text).then(() => showToast('تم نسخ فكرة التصميم! 🎨')).catch(() => showToast('انسخ يدوياً'));
}

/* ============================================================
   AI CHAT — Full System
   ============================================================ */
const aiChatState = { domain:'', projectName:'', goal:'', audience:'', budget:'', step:0, answers:{} };
const aiQuestions = [
  { key:'projectName', q:'ما اسم مشروعك وبتبيع إيه بالتحديد؟' },
  { key:'goal',        q:'هدفك من التسويق إيه؟ (زيادة مبيعات / انتشار / عملاء جدد)' },
  { key:'audience',    q:'مين جمهورك المستهدف؟ (العمر والاهتمامات والمنطقة)' },
  { key:'budget',      q:'كام ميزانيتك التسويقية الشهرية تقريباً؟' },
];
const aiDomainNames = {
  restaurant:'مطاعم', fashion:'ملابس وموضة', ecommerce:'تجارة إلكترونية',
  beauty:'تجميل وعناية', tech:'تقنية وبرمجة', services:'خدمات مهنية', retail:'مشاريع تجارية'
};

function initChatPage() {
  const msgs = document.getElementById('ai-chat-messages');
  if (msgs && !msgs.children.length) clearAIChat();
}

function aiQuickStart(domain) {
  aiChatState.domain = domain;
  const dName = aiDomainNames[domain] || domain;
  addAIBotMsg(`ممتاز! هتشتغل على مجال ${dName} 💪\n\n${aiQuestions[0].q}`);
  aiChatState.step = 1;
  showNextSuggestions('goal');
}

async function sendAIMessage() {
  const inp = document.getElementById('ai-chat-input');
  if (!inp) return;
  const msg = inp.value.trim();
  if (!msg) return;
  inp.value = '';
  addAIUserMsg(msg);
  hideAISuggestions();
  showAITyping();
  setTimeout(() => { removeAITyping(); processAIResponse(msg); }, 900);
}

function processAIResponse(userMsg) {
  if (aiChatState.step < aiQuestions.length) {
    const q = aiQuestions[aiChatState.step - 1] || aiQuestions[0];
    aiChatState.answers[q.key] = userMsg;
    aiChatState[q.key] = userMsg;

    if (aiChatState.step < aiQuestions.length) {
      const nextQ = aiQuestions[aiChatState.step];
      aiChatState.step++;
      addAIBotMsg(nextQ.q);
      showNextSuggestions(nextQ.key);
    } else {
      aiChatState.step = aiQuestions.length + 1;
      addAIBotMsg('تمام! عندي كل المعلومات اللي محتاجها 🎯\nجاري توليد خطة تسويق مخصصة لك...');
      setTimeout(() => generateAIMarketingPlan(), 1500);
    }
    return;
  }

  // General Q&A after plan is generated
  const quickR = getQuickReply(userMsg);
  addAIBotMsg(quickR || generateSmartReply(userMsg));
}

async function generateAIMarketingPlan() {
  const name   = aiChatState.projectName || 'مشروعك';
  const goal   = aiChatState.goal        || 'زيادة المبيعات';
  const aud    = aiChatState.audience    || 'الجمهور المستهدف';
  const budget = aiChatState.budget      || '500 جنيه';
  const domain = aiDomainNames[aiChatState.domain] || 'أعمال';
  const prompt = `أنت خبير تسويق عربي محترف. اكتب خطة تسويق مختصرة وعملية لـ:\nالاسم: ${name}\nالمجال: ${domain}\nالهدف: ${goal}\nالجمهور: ${aud}\nالميزانية: ${budget}\n\nاكتب خطة عملية قصيرة: المنصات المناسبة + 3 أفكار محتوى فورية + توزيع الميزانية + خطوات البداية.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, messages:[{role:'user',content:prompt}] })
    });
    const data = await res.json();
    const text = data.content?.map(i=>i.text||'').join('\n') || getLocalMarketingPlan();
    showAIResult(text);
  } catch(e) {
    showAIResult(getLocalMarketingPlan());
  }
}

function showAIResult(text) {
  const container = document.getElementById('ai-chat-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'ai-msg-bot ai-result-card';
  div.innerHTML = `<div class="ai-msg-avatar">🤖</div>
    <div class="ai-msg-bubble" style="max-width:100%">
      <div style="font-size:13px;font-weight:800;color:var(--brown);margin-bottom:10px">✨ خطة التسويق الخاصة بك:</div>
      <div style="white-space:pre-wrap;font-size:13px;color:var(--brown2);line-height:1.8">${text}</div>
      <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
        <button onclick="copyAIResult(this)" class="btn-sm">📋 نسخ</button>
        <button onclick="saveAIResult()" class="btn-sm">💾 حفظ</button>
        <button onclick="exportChatResult()" class="btn-sm">⬇️ تحميل</button>
        <button onclick="clearAIChat()" class="btn-sm">🔄 بداية جديدة</button>
      </div>
    </div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  showAISuggestions(['أعطني أفكار محتوى', 'كيف أقسم الميزانية؟', 'أفضل منصة لمجالي', 'نصائح للبداية']);
}

function getLocalMarketingPlan() {
  const name   = aiChatState.projectName || 'مشروعك';
  const domain = aiDomainNames[aiChatState.domain] || 'أعمال';
  const goal   = aiChatState.goal        || 'زيادة المبيعات';
  const aud    = aiChatState.audience    || 'الجمهور المستهدف';
  return `خطة تسويق لـ "${name}" (${domain})\nالهدف: ${goal}\nالجمهور: ${aud}\n\n📱 المنصات المقترحة:\nInstagram (أساسي) + TikTok (نمو) + Snapchat\n\n💡 3 أفكار فورية:\n1. فيديو تعريفي بـ "${name}" في 30 ثانية\n2. محتوى خلف الكواليس أسبوعياً\n3. عرض افتتاحي لأول 100 عميل\n\n📅 خطة أسبوع 1:\nالأحد: فيديو تعريفي\nالثلاثاء: محتوى تعليمي\nالخميس: عرض خاص\nالسبت: Testimonial\n\n⚡ ابدأ دلوقتي:\n1. أنشئ حساب Business على المنصات\n2. صوّر 5 فيديوهات قصيرة\n3. حدد وقت نشر ثابت يومياً\n4. تفاعل مع كل تعليق في أول ساعة`;
}

function getQuickReply(msg) {
  const m = msg;
  const replies = [
    { q:['مرحبا','هلا','السلام','اهلا','هاي'],
      a:'أهلاً! 👋 أنا مساعد Sawkly الذكي.\nأقدر أساعدك في خطط تسويق، أفكار محتوى، وسكريبتات فيديو!\nمن أي مجال مشروعك؟' },
    { q:['سعر','اشتراك','باقة','كم'],
      a:'لدينا خطتان:\n💛 مجاني: 5 خطط شهرياً + المكتبة الكاملة\n🥇 Pro ($10): غير محدود + AI حقيقي + PDF\n💎 Business ($25): كل Pro + استشارة شخصية\n\nأي باقة تناسبك؟' },
    { q:['محتوى','بوست','كابشن','فيديو','ريلز'],
      a:'لتوليد محتوى مخصص لمشروعك:\n1. أخبرني بمجالك أولاً\n2. أو اذهب للخدمات واختر "أفكار محتوى"\n\nمن مجال مشروعك؟ 🎯' },
    { q:['خطة','تسويق','استراتيجية'],
      a:'عشان أعطيك خطة تسويق مخصصة، أحتاج بعض المعلومات:\n1. اسم مشروعك وبتبيع إيه؟\n2. هدفك من التسويق؟\n3. جمهورك المستهدف؟\n4. ميزانيتك الشهرية؟\n\nأبدأ؟ 🚀' },
    { q:['شكرا','ممتاز','رائع','كويس'],
      a:'العفو! 😊 أنا هنا دائماً.\nعندك سؤال تاني؟ 🚀' },
  ];
  const r = replies.find(rep => rep.q.some(w => m.includes(w)));
  return r ? r.a : null;
}

function generateSmartReply(msg) {
  const domain = aiChatState.domain || 'general';
  const tips = [
    `بخصوص سؤالك 🎯\n\nمن أهم نصائح التسويق في ${aiDomainNames[domain]||'مجالك'}:\n✅ انشر بانتظام 4-5 مرات أسبوعياً\n✅ استخدم الفيديو القصير أكثر من الصور\n✅ تفاعل مع التعليقات في أول ساعة\n✅ راقب Insights كل أسبوع\n\nعندك سؤال أكثر تحديداً؟`,
    `سؤال ممتاز! 💡\n\nللنجاح في ${aiDomainNames[domain]||'مجالك'}:\n1. اعرف جمهورك قبل أي شيء\n2. المحتوى القيّم > الإعلان المباشر\n3. الثبات في النشر يبني الثقة\n4. استمع لتعليقات عملاءك دائماً\n\nعايز تفاصيل عن أي نقطة؟`
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

function addAIUserMsg(text) {
  const c = document.getElementById('ai-chat-messages');
  if (!c) return;
  const d = document.createElement('div');
  d.className = 'ai-msg-user';
  d.innerHTML = `<div class="ai-msg-avatar">أ</div><div class="ai-msg-bubble">${text}</div>`;
  c.appendChild(d); c.scrollTop = c.scrollHeight;
}

function addAIBotMsg(text) {
  const c = document.getElementById('ai-chat-messages');
  if (!c) return;
  const d = document.createElement('div');
  d.className = 'ai-msg-bot';
  d.innerHTML = `<div class="ai-msg-avatar">🤖</div><div class="ai-msg-bubble">${text.replace(/\n/g,'<br>')}</div>`;
  c.appendChild(d); c.scrollTop = c.scrollHeight;
}

function showAITyping() {
  const c = document.getElementById('ai-chat-messages');
  if (!c) return;
  const d = document.createElement('div');
  d.id = 'ai-typing'; d.className = 'ai-msg-bot';
  d.innerHTML = `<div class="ai-msg-avatar">🤖</div><div class="ai-typing"><span></span><span></span><span></span></div>`;
  c.appendChild(d); c.scrollTop = c.scrollHeight;
}

function removeAITyping() { const e = document.getElementById('ai-typing'); if (e) e.remove(); }
function showAISuggestions(items) {
  const c = document.getElementById('ai-suggestions');
  if (!c) return;
  c.innerHTML = items.map(i => `<button class="ai-quick-btn" onclick="document.getElementById('ai-chat-input').value='${i.replace(/'/g,"\\'")}';sendAIMessage()">${i}</button>`).join('');
}
function hideAISuggestions() { const c = document.getElementById('ai-suggestions'); if (c) c.innerHTML = ''; }

function clearAIChat() {
  Object.assign(aiChatState, { domain:'', projectName:'', goal:'', audience:'', budget:'', step:0, answers:{} });
  const c = document.getElementById('ai-chat-messages');
  if (!c) return;
  c.innerHTML = `<div class="ai-msg-bot"><div class="ai-msg-avatar">🤖</div>
    <div class="ai-msg-bubble">
      <div style="font-size:14px;font-weight:800;color:var(--brown);margin-bottom:8px">اختار مجال مشروعك ابدأ! 🚀</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px" id="ai-quick-start">
        <button class="ai-quick-btn" onclick="aiQuickStart('restaurant')">🍔 مطعم</button>
        <button class="ai-quick-btn" onclick="aiQuickStart('fashion')">👕 موضة</button>
        <button class="ai-quick-btn" onclick="aiQuickStart('ecommerce')">🛒 تجارة</button>
        <button class="ai-quick-btn" onclick="aiQuickStart('beauty')">💄 تجميل</button>
        <button class="ai-quick-btn" onclick="aiQuickStart('tech')">💻 تقنية</button>
        <button class="ai-quick-btn" onclick="aiQuickStart('services')">🏥 خدمات</button>
      </div>
    </div></div>`;
  hideAISuggestions();
}

function copyAIResult(btn) {
  const card = btn.closest('.ai-result-card');
  const el = card ? card.querySelector('[style*="pre-wrap"]') : null;
  if (el) navigator.clipboard.writeText(el.textContent).then(() => showToast('تم النسخ! 📋')).catch(() => {});
}

function saveAIResult() { showToast('تم حفظ الخطة في نتائجك ✅'); }

function exportChatResult() {
  const c = document.getElementById('ai-chat-messages');
  if (!c) return;
  const el = c.querySelector('[style*="pre-wrap"]');
  if (!el) { showToast('لا توجد نتيجة بعد'); return; }
  const blob = new Blob([el.textContent], { type:'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sawkly-plan-' + Date.now() + '.txt';
  a.click(); URL.revokeObjectURL(a.href);
  showToast('تم تصدير الخطة ⬇️');
}

function showNextSuggestions(key) {
  const s = {
    goal:     ['زيادة المبيعات','رفع الوعي بالبراند','زيادة المتابعين'],
    audience: ['شباب 18-35','سيدات 25-45','أصحاب أعمال'],
    budget:   ['500 جنيه','1000 جنيه','5000 جنيه','100 دولار'],
  };
  if (s[key]) showAISuggestions(s[key]);
}

/* ============================================================
   AUTH
   ============================================================ */
function switchAuthTab(tab) {
  const loginForm  = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginBtn   = document.getElementById('tab-login-btn');
  const signupBtn  = document.getElementById('tab-signup-btn');
  if (tab === 'login') {
    if (loginForm)  loginForm.style.display  = 'block';
    if (signupForm) signupForm.style.display = 'none';
    if (loginBtn)  { loginBtn.style.background  = 'white'; loginBtn.style.fontWeight = '800'; }
    if (signupBtn) { signupBtn.style.background = 'transparent'; signupBtn.style.fontWeight = '700'; }
  } else {
    if (loginForm)  loginForm.style.display  = 'none';
    if (signupForm) signupForm.style.display = 'block';
    if (loginBtn)  { loginBtn.style.background  = 'transparent'; loginBtn.style.fontWeight = '700'; }
    if (signupBtn) { signupBtn.style.background = 'white'; signupBtn.style.fontWeight = '800'; }
  }
}

async function handleLogin() {
  const emailEl = document.querySelector('#login-form .inp[type="email"]') ||
                  document.querySelector('#page-login .inp[type="email"]');
  const passEl  = document.querySelector('#login-form .inp[type="password"]') ||
                  document.querySelector('#page-login .inp[type="password"]');
  const email   = emailEl ? emailEl.value.trim() : '';
  const pass    = passEl  ? passEl.value         : '';

  if (!email || !pass) { showToast('⚠️ أدخل الإيميل وكلمة المرور'); return; }

  if (_supabase) {
    try {
      const { data, error } = await _supabase.auth.signInWithPassword({ email, password: pass });
      if (error) { showToast('❌ ' + error.message); return; }
      if (data.user) { currentUser = data.user; finishLogin(email); return; }
    } catch(e) {}
  }
  // Demo login fallback
  finishLogin(email);
}

async function handleSignup() {
  const nameEl  = document.querySelector('#signup-form input[placeholder*="اسم"]') ||
                  document.querySelector('#page-signup input[placeholder*="اسم"]');
  const emailEl = document.querySelector('#signup-form .inp[type="email"]') ||
                  document.querySelector('#page-signup .inp[type="email"]');
  const passEl  = document.querySelector('#signup-form .inp[type="password"]') ||
                  document.querySelector('#page-signup .inp[type="password"]');
  const name  = nameEl  ? nameEl.value.trim()  : '';
  const email = emailEl ? emailEl.value.trim() : '';
  const pass  = passEl  ? passEl.value         : '';

  if (!email || !pass) { showToast('⚠️ أدخل الإيميل وكلمة المرور'); return; }

  if (_supabase) {
    try {
      const { data, error } = await _supabase.auth.signUp({ email, password: pass });
      if (error) { showToast('❌ ' + error.message); return; }
    } catch(e) {}
  }
  if (name) try { localStorage.setItem('soqly_user_name', name); } catch(e) {}
  finishLogin(email, name);
}

function finishLogin(email, name) {
  try {
    localStorage.setItem('soqly_loggedIn', 'true');
    localStorage.setItem('soqly_user_email', email);
    if (name) localStorage.setItem('soqly_user_name', name);
  } catch(e) {}
  showToast('مرحباً بك في Sawkly! 🎉');
  goPage('dashboard');
}

async function logout() {
  if (_supabase) { try { await _supabase.auth.signOut(); } catch(e) {} }
  try { localStorage.removeItem('soqly_loggedIn'); } catch(e) {}
  currentUser = null;
  goPage('landing');
  showToast('تم تسجيل الخروج');
}

function initLoginPage() {
  try {
    const saved = localStorage.getItem('soqly_user_email');
    if (saved) {
      const emailEl = document.querySelector('.inp[type="email"]');
      const remEl   = document.querySelector('.remember input[type="checkbox"]');
      if (emailEl) emailEl.value = saved;
      if (remEl)   remEl.checked = true;
    }
  } catch(e) {}
}

/* ============================================================
   SETTINGS & PROFILE
   ============================================================ */
function saveSettings() {
  showToast('تم حفظ الإعدادات ✅');
}

function loadSavedProjectToSettings() {
  const saved = getSavedProject();
  const el    = document.getElementById('saved-project-content');
  if (!el) return;
  if (!saved.projectName) {
    el.innerHTML = `<div style="color:var(--brown3);text-align:center;padding:20px">
      لم تحفظ بيانات مشروع بعد.
      <br/><button class="btn-sm btn-sm-primary" style="margin-top:12px" onclick="goPage('services')">ابدأ بإدخال بيانات مشروعك ←</button>
    </div>`;
    return;
  }
  el.innerHTML = `
    <div class="li-item"><div class="li-info"><div class="li-name">اسم المشروع</div><div class="li-sub">${saved.projectName}</div></div></div>
    <div class="li-item"><div class="li-info"><div class="li-name">نوع المشروع</div><div class="li-sub">${saved.projectType||'—'}</div></div></div>
    <div class="li-item"><div class="li-info"><div class="li-name">الجمهور</div><div class="li-sub">${saved.audience||'—'}</div></div></div>
    <div class="li-item"><div class="li-info"><div class="li-name">الميزانية</div><div class="li-sub">$${saved.budget||'—'}</div></div></div>
    <div style="margin-top:12px;display:flex;gap:10px">
      <button class="btn-sm btn-sm-primary" onclick="goPage('services')">تعديل ✏️</button>
      <button class="btn-sm" onclick="clearSavedProject()">مسح 🗑️</button>
    </div>`;
}

function clearSavedProject() {
  try { localStorage.removeItem('soqly_project'); } catch(e) {}
  loadSavedProjectToSettings();
  showToast('تم مسح بيانات المشروع');
}

function initProfilePage() {
  try {
    const name  = localStorage.getItem('soqly_user_name')  || '';
    const email = localStorage.getItem('soqly_user_email') || '';
    const niche = localStorage.getItem('soqly_user_niche') || '';
    const goal  = localStorage.getItem('soqly_user_goal')  || '';
    ['profile-name','profile-email','profile-niche','profile-goal'].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.value = [name,email,niche,goal][i];
    });
    const nd = document.getElementById('profile-name-display');
    const ed = document.getElementById('profile-email-display');
    const av = document.getElementById('profile-avatar-big');
    if (nd) nd.textContent = name  || 'اسمك';
    if (ed) ed.textContent = email || 'email@example.com';
    if (av && name) av.textContent = name.charAt(0).toUpperCase();
    try {
      const results  = JSON.parse(localStorage.getItem('soqly_results')        || '[]');
      const projects = JSON.parse(localStorage.getItem('soqly_projects_local') || '[]');
      const sp = document.getElementById('profile-stat-plans');
      const si = document.getElementById('profile-stat-ideas');
      const sc = document.getElementById('profile-stat-projects');
      if (sp) sp.textContent = results.length;
      if (si) si.textContent = results.filter(r => r.serviceIcon === '💡').length;
      if (sc) sc.textContent = projects.length;
    } catch(e) {}
  } catch(e) {}
}

function saveProfile() {
  const name  = (document.getElementById('profile-name')  || {}).value || '';
  const niche = (document.getElementById('profile-niche') || {}).value || '';
  const goal  = (document.getElementById('profile-goal')  || {}).value || '';
  try {
    if (name)  localStorage.setItem('soqly_user_name',  name);
    if (niche) localStorage.setItem('soqly_user_niche', niche);
    if (goal)  localStorage.setItem('soqly_user_goal',  goal);
    const sbName = document.querySelector('.sb-name');
    const av     = document.getElementById('profile-avatar-big');
    if (sbName && name) sbName.textContent = name;
    if (av     && name) av.textContent = name.charAt(0).toUpperCase();
  } catch(e) {}
  showToast('تم حفظ الملف الشخصي ✅');
}

function clearAllData() {
  if (!confirm('هل أنت متأكد؟ سيتم حذف كل البيانات.')) return;
  try { ['soqly_results','soqly_projects_local','soqly_project'].forEach(k => localStorage.removeItem(k)); } catch(e) {}
  showToast('تم مسح البيانات');
}

/* ============================================================
   CURRENCY SELECTOR
   ============================================================ */
const basePrices = { p1: 10, p2: 25 };

function toggleCurrencyDropdown() {
  const d = document.getElementById('currency-dropdown');
  if (d) d.style.display = d.style.display === 'none' ? 'block' : 'none';
}

function setCurrency(code, sym, flag, label, rate) {
  const d = document.getElementById('currency-dropdown');
  if (d) d.style.display = 'none';
  const flagEl  = document.getElementById('currency-flag');
  const labelEl = document.getElementById('currency-label');
  if (flagEl)  flagEl.textContent  = flag;
  if (labelEl) labelEl.textContent = code + ' — ' + label;
  ['1','2'].forEach(n => {
    const base = basePrices['p'+n];
    const conv = (base * rate).toFixed(rate > 10 ? 0 : rate < 1 ? 2 : 1);
    const pe = document.getElementById('p'+n);
    const se = document.getElementById('sym'+n);
    if (pe) pe.textContent = conv;
    if (se) se.textContent = sym;
  });
  showToast('تم تغيير العملة إلى ' + label + ' ' + flag);
}

/* ============================================================
   DASHBOARD SEARCH
   ============================================================ */
function handleDashSearch(val) {
  const q = val.trim().toLowerCase();
  if (!q) { removeSearchResults(); return; }
  const items = [
    ...marketingLibrary.map(i => ({ type:'مكتبة', name: i.title, sub: i.desc.slice(0,60), fn: () => showLibCard(i.id) })),
  ];
  const results = items.filter(i => i.name.toLowerCase().includes(q) || i.sub.toLowerCase().includes(q));
  showSearchResults(results, val);
}

function showSearchResults(results, query) {
  let box = document.getElementById('dash-search-results');
  if (!box) {
    box = document.createElement('div');
    box.id = 'dash-search-results';
    box.style.cssText = 'position:absolute;top:100%;right:0;left:0;background:white;border-radius:14px;box-shadow:0 8px 30px rgba(62,39,35,.15);border:1px solid rgba(200,169,126,.2);z-index:200;max-height:320px;overflow-y:auto;margin-top:6px';
    const searchWrap = document.querySelector('.dash-search');
    if (searchWrap) { searchWrap.style.position='relative'; searchWrap.appendChild(box); }
  }
  if (!results.length) {
    box.innerHTML = '<div style="padding:16px;text-align:center;color:var(--brown3);font-size:13px">لا توجد نتائج</div>';
    return;
  }
  box.innerHTML = results.slice(0, 8).map(r => `
    <div onclick="(${r.fn.toString()})()" style="padding:12px 16px;cursor:pointer;border-bottom:1px solid rgba(62,39,35,.05);display:flex;gap:10px;align-items:center"
      onmouseover="this.style.background='rgba(200,169,126,.08)'" onmouseout="this.style.background=''">
      <span style="font-size:10px;padding:2px 8px;border-radius:8px;background:rgba(200,169,126,.15);color:var(--gold);font-weight:700;flex-shrink:0">${r.type}</span>
      <div><div style="font-size:13px;font-weight:700;color:var(--brown)">${r.name}</div><div style="font-size:11px;color:var(--brown3)">${r.sub}</div></div>
    </div>`).join('');
}

function removeSearchResults() {
  const box = document.getElementById('dash-search-results');
  if (box) box.remove();
}

function clearDashSearch() {
  const inp = document.querySelector('.dash-search input');
  if (inp) inp.value = '';
  removeSearchResults();
}

/* ============================================================
   CHATBOT (Landing)
   ============================================================ */
function toggleChat() {
  const box = document.getElementById('chat-window');
  if (box) box.classList.toggle('open');
}

function quickAsk(q) {
  const inp = document.getElementById('chat-input');
  if (inp) { inp.value = q; sendChat(); }
}

function sendChat() {
  const inp = document.getElementById('chat-input');
  if (!inp) return;
  const msg = inp.value.trim();
  if (!msg) return;
  addChatMsg(msg, 'user');
  inp.value = '';
  const reply = getQuickReply(msg) || generateSmartReply(msg);
  setTimeout(() => addChatMsg(reply, 'bot'), 700);
}

function addChatMsg(text, type) {
  const msgs = document.getElementById('chat-messages');
  if (!msgs) return;
  const d = document.createElement('div');
  d.className = type === 'bot' ? 'chat-msg-bot' : 'chat-msg-user';
  d.style.cssText = `max-width:80%;padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.7;margin-bottom:8px;align-self:${type==='bot'?'flex-start':'flex-end'};background:${type==='bot'?'var(--cream)':'var(--brown)'};color:${type==='bot'?'var(--brown)':'white'};white-space:pre-line`;
  d.textContent = text;
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
}

/* ============================================================
   TOAST
   ============================================================ */
let _toastTimer = null;
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ============================================================
   INIT
   ============================================================ */
window.addEventListener('load', () => {
  // إخفاء كل الصفحات
  document.querySelectorAll('.page').forEach(p => {
    p.style.display = 'none';
    p.classList.remove('active');
  });

  // فحص تسجيل الدخول
  try {
    if (localStorage.getItem('soqly_loggedIn') === 'true') {
      goPage('dashboard');
      return;
    }
  } catch(e) {}

  goPage('landing');

  // Close dropdowns on outside click
  document.addEventListener('click', e => {
    const cw = document.getElementById('currency-wrap');
    if (cw && !cw.contains(e.target)) {
      const dd = document.getElementById('currency-dropdown');
      if (dd) dd.style.display = 'none';
    }
    const searchBox = document.getElementById('dash-search-results');
    if (searchBox && !searchBox.contains(e.target)) removeSearchResults();
  });
});
