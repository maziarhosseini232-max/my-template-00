import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User, Role, Permission, Category, Tag, Course, CourseSection, CourseLesson,
  DigitalProduct, Enrollment, LessonProgress, CourseProgress, LessonNote,
  Review, HomepageSection, SiteSetting, NavigationItem, Page, BlogPost,
  SeoMetadata, AuditLog, UserRoleType, Order, Payment, Coupon, PaymentTransaction,
  SubscriptionPlan
} from './schema.js';

export interface DbSnapshot {
  version: number;
  timestamp: string;
  siteSetting: SiteSetting;
  users: User[];
  roles: Role[];
  permissions: Permission[];
  categories: Category[];
  tags: Tag[];
  courses: Course[];
  digitalProducts: DigitalProduct[];
  enrollments: Enrollment[];
  lessonProgress: LessonProgress[];
  courseProgress: CourseProgress[];
  lessonNotes: LessonNote[];
  reviews: Review[];
  homepageSections: HomepageSection[];
  navigationItems: NavigationItem[];
  pages: Page[];
  blogPosts: BlogPost[];
  seoMetadata: SeoMetadata[];
  auditLogs: AuditLog[];
  orders: Order[];
  payments: Payment[];
  coupons: Coupon[];
  paymentTransactions: PaymentTransaction[];
  subscriptionPlans?: SubscriptionPlan[];
}

// Define Granular Permissions
export const PERMISSIONS: Permission[] = [
  // Course Permissions
  { id: 'p1', name: 'course:view', description: 'مشاهده دوره‌ها', module: 'COURSES' },
  { id: 'p2', name: 'course:create', description: 'ایجاد دوره جدید', module: 'COURSES' },
  { id: 'p3', name: 'course:update', description: 'ویرایش اطلاعات دوره', module: 'COURSES' },
  { id: 'p4', name: 'course:publish', description: 'انتشار یا خارج کردن از انتشار دوره', module: 'COURSES' },
  { id: 'p5', name: 'course:delete', description: 'حذف یا آرشیو دوره', module: 'COURSES' },
  
  // Lesson Permissions
  { id: 'p6', name: 'lesson:create', description: 'افزودن جلسه به دوره', module: 'LESSONS' },
  { id: 'p7', name: 'lesson:update', description: 'ویرایش جلسات', module: 'LESSONS' },
  { id: 'p8', name: 'lesson:delete', description: 'حذف جلسات', module: 'LESSONS' },
  
  // Product & File Permissions
  { id: 'p9', name: 'file:upload', description: 'آپلود فایل‌های دانلودی', module: 'FILES' },
  { id: 'p10', name: 'file:manage', description: 'مدیریت محصولات دیجیتال', module: 'FILES' },
  
  // User Management Permissions
  { id: 'p11', name: 'user:view', description: 'مشاهده لیست کاربران', module: 'USERS' },
  { id: 'p12', name: 'user:update', description: 'ویرایش مشخصات و نقش کاربران', module: 'USERS' },
  { id: 'p13', name: 'user:delete', description: 'غیرفعال‌سازی حساب کاربران', module: 'USERS' },
  
  // CMS & Site Builder
  { id: 'p14', name: 'cms:manage', description: 'مدیریت سکشن‌های صفحه اصلی و صفحات', module: 'CMS' },
  { id: 'p15', name: 'navigation:update', description: 'مدیریت منوهای هدر و فوتر', module: 'NAVIGATION' },
  { id: 'p16', name: 'settings:update', description: 'تنظیمات کلی و ظاهر سایت', module: 'SETTINGS' },
  { id: 'p17', name: 'seo:update', description: 'مدیریت متادیتای سئو', module: 'SEO' },
  { id: 'p18', name: 'audit:view', description: 'مشاهده لاگ‌های امنیتی و سیستمی', module: 'AUDIT' },

  // Commerce & Pricing Permissions
  { id: 'p19', name: 'commerce:manage', description: 'مدیریت سفارش‌ها، تراکنش‌ها و کوپن‌ها', module: 'COMMERCE' },
  { id: 'p20', name: 'pricing:manage', description: 'مدیریت قیمت‌گذاری و وضعیت Free/Paid دوره‌ها', module: 'COMMERCE' },
];

export const ROLES: Role[] = [
  {
    id: 'r_owner',
    name: 'OWNER',
    description: 'مالک پلتفرم با دسترسی کامل به تمامی بخش‌ها',
    permissions: PERMISSIONS.map(p => p.name)
  },
  {
    id: 'r_admin',
    name: 'ADMIN',
    description: 'مدیر ارشد با دسترسی‌های مدیریتی و نظارتی',
    permissions: PERMISSIONS.map(p => p.name)
  },
  {
    id: 'r_instructor',
    name: 'INSTRUCTOR',
    description: 'مدرس با دسترسی ساخت و ویرایش دوره‌های خود',
    permissions: [
      'course:view', 'course:create', 'course:update', 'course:publish', 'course:delete',
      'lesson:create', 'lesson:update', 'lesson:delete',
      'file:upload'
    ]
  },
  {
    id: 'r_editor',
    name: 'EDITOR',
    description: 'نویسنده و تدوین‌گر محتوای سایت و وبلاگ',
    permissions: ['cms:manage', 'seo:update', 'course:view', 'course:update']
  },
  {
    id: 'r_support',
    name: 'SUPPORT',
    description: 'پشتیبانی فنی و پاسخگویی به دانشجویان',
    permissions: ['user:view', 'course:view']
  },
  {
    id: 'r_student',
    name: 'STUDENT',
    description: 'دانشجو با دسترسی ثبت‌نام، یادگیری و مشاهده دوره‌ها',
    permissions: ['course:view']
  }
];

class Database {
  private _users: User[] = [];
  private _roles: Role[] = [...ROLES];
  private _permissions: Permission[] = [...PERMISSIONS];
  private _categories: Category[] = [];
  private _tags: Tag[] = [];
  private _courses: Course[] = [];
  private _digitalProducts: DigitalProduct[] = [];
  private _enrollments: Enrollment[] = [];
  private _lessonProgress: LessonProgress[] = [];
  private _courseProgress: CourseProgress[] = [];
  private _lessonNotes: LessonNote[] = [];
  private _reviews: Review[] = [];
  private _homepageSections: HomepageSection[] = [];
  private _siteSetting!: SiteSetting;
  private _navigationItems: NavigationItem[] = [];
  private _pages: Page[] = [];
  private _blogPosts: BlogPost[] = [];
  private _seoMetadata: SeoMetadata[] = [];
  private _auditLogs: AuditLog[] = [];
  private _orders: Order[] = [];
  private _payments: Payment[] = [];
  private _coupons: Coupon[] = [];
  private _paymentTransactions: PaymentTransaction[] = [];
  private _subscriptionPlans: SubscriptionPlan[] = [];

  // Persistence status flags & file path
  private isLoaded = false;
  private isSeeding = false;
  private isDirty = false;
  private saveTimeout: NodeJS.Timeout | null = null;
  private snapshotFilePath: string = process.env.DB_SNAPSHOT_PATH || path.join(process.cwd(), 'server', 'data', 'db_snapshot.json');

  // Wrap arrays with a proxy to auto-track mutations (push, splice, reorder, delete)
  private wrapCollection<T>(arr: T[]): T[] {
    if (!Array.isArray(arr)) return arr;
    return new Proxy(arr, {
      set: (target, prop, value, receiver) => {
        const res = Reflect.set(target, prop, value, receiver);
        this.markDirty();
        return res;
      },
      deleteProperty: (target, prop) => {
        const res = Reflect.deleteProperty(target, prop);
        this.markDirty();
        return res;
      }
    });
  }

  // Collection Getters and Setters ensuring continuous persistence wrapping
  get users(): User[] { return this._users; }
  set users(val: User[]) { this._users = this.wrapCollection(val); this.markDirty(); }

  get roles(): Role[] { return this._roles; }
  set roles(val: Role[]) { this._roles = this.wrapCollection(val); this.markDirty(); }

  get permissions(): Permission[] { return this._permissions; }
  set permissions(val: Permission[]) { this._permissions = this.wrapCollection(val); this.markDirty(); }

  get categories(): Category[] { return this._categories; }
  set categories(val: Category[]) { this._categories = this.wrapCollection(val); this.markDirty(); }

  get tags(): Tag[] { return this._tags; }
  set tags(val: Tag[]) { this._tags = this.wrapCollection(val); this.markDirty(); }

  get courses(): Course[] { return this._courses; }
  set courses(val: Course[]) { this._courses = this.wrapCollection(val); this.markDirty(); }

  get digitalProducts(): DigitalProduct[] { return this._digitalProducts; }
  set digitalProducts(val: DigitalProduct[]) { this._digitalProducts = this.wrapCollection(val); this.markDirty(); }

  get enrollments(): Enrollment[] { return this._enrollments; }
  set enrollments(val: Enrollment[]) { this._enrollments = this.wrapCollection(val); this.markDirty(); }

  get lessonProgress(): LessonProgress[] { return this._lessonProgress; }
  set lessonProgress(val: LessonProgress[]) { this._lessonProgress = this.wrapCollection(val); this.markDirty(); }

  get courseProgress(): CourseProgress[] { return this._courseProgress; }
  set courseProgress(val: CourseProgress[]) { this._courseProgress = this.wrapCollection(val); this.markDirty(); }

  get lessonNotes(): LessonNote[] { return this._lessonNotes; }
  set lessonNotes(val: LessonNote[]) { this._lessonNotes = this.wrapCollection(val); this.markDirty(); }

  get reviews(): Review[] { return this._reviews; }
  set reviews(val: Review[]) { this._reviews = this.wrapCollection(val); this.markDirty(); }

  get homepageSections(): HomepageSection[] { return this._homepageSections; }
  set homepageSections(val: HomepageSection[]) { this._homepageSections = this.wrapCollection(val); this.markDirty(); }

  get siteSetting(): SiteSetting { return this._siteSetting; }
  set siteSetting(val: SiteSetting) { this._siteSetting = val; this.markDirty(); }

  get navigationItems(): NavigationItem[] { return this._navigationItems; }
  set navigationItems(val: NavigationItem[]) { this._navigationItems = this.wrapCollection(val); this.markDirty(); }

  get pages(): Page[] { return this._pages; }
  set pages(val: Page[]) { this._pages = this.wrapCollection(val); this.markDirty(); }

  get blogPosts(): BlogPost[] { return this._blogPosts; }
  set blogPosts(val: BlogPost[]) { this._blogPosts = this.wrapCollection(val); this.markDirty(); }

  get seoMetadata(): SeoMetadata[] { return this._seoMetadata; }
  set seoMetadata(val: SeoMetadata[]) { this._seoMetadata = this.wrapCollection(val); this.markDirty(); }

  get auditLogs(): AuditLog[] { return this._auditLogs; }
  set auditLogs(val: AuditLog[]) { this._auditLogs = this.wrapCollection(val); this.markDirty(); }

  get orders(): Order[] { return this._orders; }
  set orders(val: Order[]) { this._orders = this.wrapCollection(val); this.markDirty(); }

  get payments(): Payment[] { return this._payments; }
  set payments(val: Payment[]) { this._payments = this.wrapCollection(val); this.markDirty(); }

  get coupons(): Coupon[] { return this._coupons; }
  set coupons(val: Coupon[]) { this._coupons = this.wrapCollection(val); this.markDirty(); }

  get paymentTransactions(): PaymentTransaction[] { return this._paymentTransactions; }
  set paymentTransactions(val: PaymentTransaction[]) { this._paymentTransactions = this.wrapCollection(val); this.markDirty(); }

  get subscriptionPlans(): SubscriptionPlan[] { return this._subscriptionPlans; }
  set subscriptionPlans(val: SubscriptionPlan[]) { this._subscriptionPlans = this.wrapCollection(val); this.markDirty(); }

  constructor() {
    this._siteSetting = {
      id: 'setting_1',
      siteName: 'لومینا لرن',
      siteNameEn: 'Lumina Learn',
      tagline: 'پلتفرم جامع آموزش آنلاین مهارت‌های مدرن و فایل‌های دانلودی',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      faviconUrl: '/favicon.ico',
      primaryColor: '#2563EB',
      secondaryColor: '#4F46E5',
      fontFamily: 'Vazirmatn',
      defaultLanguage: 'fa',
      isRtl: true,
      contactEmail: 'support@luminalearn.ir',
      contactPhone: '۰۲۱-۸۸۸۸۴۴۲۲',
      address: 'تهران، میدان ونک، برج فناوری لومینا',
      socialLinks: {
        instagram: 'https://instagram.com/luminalearn',
        telegram: 'https://t.me/luminalearn',
        linkedin: 'https://linkedin.com/company/lumina-learn',
        youtube: 'https://youtube.com/@luminalearn'
      },
      footerText: 'لومینا لرن پلتفرمی برای پرورش متخصصان نسل آینده با آموزش‌های پروژه‌محور و منابع دیجیتال حرفه‌ای.',
      copyrightText: '© ۱۴۰۴ تمامی حقوق مادی و معنوی برای آکادمی لومینا محفوظ است.',
      isInstructorRegistrationEnabled: false,
      isAlacarteSaleEnabled: false,
      updatedAt: new Date().toISOString()
    };

    // Ensure all default arrays are wrapped
    this._users = this.wrapCollection(this._users);
    this._roles = this.wrapCollection(this._roles);
    this._permissions = this.wrapCollection(this._permissions);
    this._categories = this.wrapCollection(this._categories);
    this._tags = this.wrapCollection(this._tags);
    this._courses = this.wrapCollection(this._courses);
    this._digitalProducts = this.wrapCollection(this._digitalProducts);
    this._enrollments = this.wrapCollection(this._enrollments);
    this._lessonProgress = this.wrapCollection(this._lessonProgress);
    this._courseProgress = this.wrapCollection(this._courseProgress);
    this._lessonNotes = this.wrapCollection(this._lessonNotes);
    this._reviews = this.wrapCollection(this._reviews);
    this._homepageSections = this.wrapCollection(this._homepageSections);
    this._navigationItems = this.wrapCollection(this._navigationItems);
    this._pages = this.wrapCollection(this._pages);
    this._blogPosts = this.wrapCollection(this._blogPosts);
    this._seoMetadata = this.wrapCollection(this._seoMetadata);
    this._auditLogs = this.wrapCollection(this._auditLogs);
    this._orders = this.wrapCollection(this._orders);
    this._payments = this.wrapCollection(this._payments);
    this._coupons = this.wrapCollection(this._coupons);
    this._paymentTransactions = this.wrapCollection(this._paymentTransactions);
    this._subscriptionPlans = this.wrapCollection(this._subscriptionPlans);

    // Startup Snapshot Loading / Fail-Safe Seed Bootstrap
    if (this.hasSnapshot()) {
      const loaded = this.loadSnapshot();
      if (!loaded) {
        console.warn('[Database] Snapshot corrupt or unreadable. Initializing clean seed data as fail-safe.');
        this.isSeeding = true;
        this.seedInitialData();
        this.isSeeding = false;
        this.isLoaded = true;
        this.saveSnapshotSync();
      } else {
        console.log('[Database] Snapshot successfully loaded from disk.');
        this.ensureDefaultUsers();
      }
    } else {
      console.log('[Database] No snapshot found on disk. Initializing initial seed data.');
      this.isSeeding = true;
      this.seedInitialData();
      this.isSeeding = false;
      this.isLoaded = true;
      this.saveSnapshotSync();
    }

    this.initPersistenceLifecycle();
  }

  private seedInitialData() {
    const passwordHash = bcrypt.hashSync('123456', 10);
    const now = new Date().toISOString();

    // 1. Users (Admin Accounts Preserved)
    this.users = [];
    this.ensureDefaultUsers();

    // 2. Categories (Preserved Hierarchy for New Content)
    this.categories = [
      { id: 'cat_ai', name: 'هوش مصنوعی و داده', slug: 'ai-data', icon: 'Sparkles', color: '#8B5CF6', description: 'آموزش مدل‌های زبانی، یادگیری ماشین و مهندسی پرامپت', orderIndex: 1, isActive: true, createdAt: now, updatedAt: now },
      { id: 'cat_dev', name: 'برنامه‌نویسی و فرانت‌اند', slug: 'development', icon: 'Code', color: '#3B82F6', description: 'توسعه وب مدرن با React، Next.js و TypeScript', orderIndex: 2, isActive: true, createdAt: now, updatedAt: now },
      { id: 'cat_uiux', name: 'طراحی رابط و تجربه کاربری', slug: 'ui-ux-design', icon: 'Palette', color: '#EC4899', description: 'طراحی دیزاین سیستم با فیگما و اصول UX حرفه‌ای', orderIndex: 3, isActive: true, createdAt: now, updatedAt: now },
      { id: 'cat_business', name: 'کسب‌وکار و دیجیتال مارکتینگ', slug: 'business', icon: 'TrendingUp', color: '#10B981', description: 'استراتژی‌های رشد، سئو تکنیکال و برندسازی شخصی', orderIndex: 4, isActive: true, createdAt: now, updatedAt: now },
      { id: 'cat_media', name: 'تولید محتوا و موشن‌گرافیک', slug: 'media-motion', icon: 'Video', color: '#F59E0B', description: 'تدوین ویدیو با پریمیر و افترافکت و تصویرسازی دیجیتال', orderIndex: 5, isActive: true, createdAt: now, updatedAt: now }
    ];

    // 3. Content & Digital Products (Clean slate for production)
    this.courses = [];
    this.digitalProducts = [];

    // 4. Enrollments, Reviews & Commerce Collections
    this.enrollments = [];
    this.lessonProgress = [];
    this.courseProgress = [];
    this.lessonNotes = [];
    this.reviews = [];
    this.coupons = [];
    this.orders = [];
    this.payments = [];
    this.paymentTransactions = [];

        // 6. Homepage Sections (Site Builder)
    this.homepageSections = [
      {
        id: 'sec_hero',
        sectionType: 'Hero',
        title: 'بنر اصلی و خوش‌آمدگویی',
        subtitle: 'تیتر، دکمه‌های اقدام و نشان‌های دستاورد',
        orderIndex: 1,
        isEnabled: true,
        content: {
          badge: 'پلتفرم نسل آینده آموزش آنلاین',
          title: 'مرجع یادگیری مهارت‌های تخصصی و منابع دیجیتال',
          description: 'دوره‌های جامع پروژه‌محور با سرفصل‌های مطابق استانداردهای بین‌المللی همراه با سورس‌کد، فایل‌های فیگما و پشتیبانی تخصصی اساتید.',
          primaryBtnText: 'کاوش تمام دوره‌ها',
          primaryBtnLink: '/catalog',
          secondaryBtnText: 'مشاهده منابع رایگان',
          secondaryBtnLink: '/catalog?free=true',
          statsCountStudents: '۱۲,۰۰۰+',
          statsCountCourses: '۴۵+',
          statsSatisfaction: '۹۸.۶٪'
        },
        updatedAt: now
      },
      {
        id: 'sec_categories',
        sectionType: 'Categories',
        title: 'دسته‌بندی‌های موضوعی',
        subtitle: 'دسترسی سریع به حوزه‌های تخصصی',
        orderIndex: 2,
        isEnabled: true,
        content: {
          heading: 'حوزه‌های آموزشی پرطرفدار',
          subheading: 'مسیر یادگیری حرفه‌ای خود را از میان دسته‌بندی‌های تخصصی انتخاب کنید.'
        },
        updatedAt: now
      },
      {
        id: 'sec_featured',
        sectionType: 'FeaturedCourses',
        title: 'دوره‌های ویژه و منتخب',
        subtitle: 'پربازدیدترین و کاربردی‌ترین دوره‌ها',
        orderIndex: 3,
        isEnabled: true,
        content: {
          heading: 'جدیدترین دوره‌های تخصصی',
          subheading: 'پروژه‌محور، به‌روزرسانی‌شده و همراه با گواهینامه معتبر پایان دوره.'
        },
        updatedAt: now
      },
      {
        id: 'sec_valueprops',
        sectionType: 'CTA',
        title: 'مزایای آکادمی لومینا',
        orderIndex: 4,
        isEnabled: true,
        content: {
          heading: 'چرا آکادمی لومینا لرن؟',
          subheading: 'ویژگی‌هایی که تجربه یادگیری شما را دگرگون می‌کنند.'
        },
        updatedAt: now
      },
      {
        id: 'sec_testimonials',
        sectionType: 'Testimonials',
        title: 'نظرات و فیدبک دانشجویان',
        orderIndex: 5,
        isEnabled: true,
        content: {
          heading: 'تجربه دانشجویان لومینا',
          subheading: 'آنچه فارغ‌التحصیلان دوره‌ها درباره پیشرفت شغلی خود می‌گویند.'
        },
        updatedAt: now
      },
      {
        id: 'sec_instructors',
        sectionType: 'Instructors',
        title: 'کادر اساتید و دعوت به تدریس',
        orderIndex: 6,
        isEnabled: true,
        content: {
          heading: 'تدریس در لومینا لرن',
          subheading: 'دانش و تجربه خود را با هزاران مشتاق یادگیری به اشتراک بگذارید.'
        },
        updatedAt: now
      }
    ];

    // 7. Navigation Items
    this.navigationItems = [
      { id: 'nav_1', menuLocation: 'HEADER_MAIN', label: 'صفحه اصلی', labelEn: 'Home', url: '/', orderIndex: 1, isEnabled: true, targetBlank: false },
      { id: 'nav_2', menuLocation: 'HEADER_MAIN', label: 'دوره‌های آموزشی', labelEn: 'Courses', url: '/catalog', orderIndex: 2, isEnabled: true, targetBlank: false },
      { id: 'nav_3', menuLocation: 'HEADER_MAIN', label: 'هوش مصنوعی', labelEn: 'AI & Data', url: '/catalog?cat=ai-data', orderIndex: 3, isEnabled: true, targetBlank: false },
      { id: 'nav_4', menuLocation: 'HEADER_MAIN', label: 'طراحی UI/UX', labelEn: 'UI/UX Design', url: '/catalog?cat=ui-ux-design', orderIndex: 4, isEnabled: true, targetBlank: false },
      { id: 'nav_5', menuLocation: 'HEADER_MAIN', label: 'مرکز دانلود فایل‌ها', labelEn: 'Downloads', url: '/dashboard?tab=downloads', orderIndex: 5, isEnabled: true, targetBlank: false },
      { id: 'nav_6', menuLocation: 'FOOTER_COLUMN_1', label: 'درباره لومینا لرن', url: '/about', orderIndex: 1, isEnabled: true, targetBlank: false },
      { id: 'nav_7', menuLocation: 'FOOTER_COLUMN_1', label: 'تدریس در آکادمی', url: '/dashboard?tab=instructor-request', orderIndex: 2, isEnabled: true, targetBlank: false },
      { id: 'nav_8', menuLocation: 'FOOTER_COLUMN_1', label: 'قوانین و حریم خصوصی', url: '/privacy', orderIndex: 3, isEnabled: true, targetBlank: false }
    ];

    // 8. SEO Metadata
    this.seoMetadata = [
      {
        id: 'seo_home',
        entityType: 'PAGE',
        entityId: 'home',
        title: 'لومینا لرن | مرجع آموزش‌های تخصصی برنامه‌نویسی، هوش مصنوعی و طراحی',
        description: 'آکادمی لومینا لرن؛ پلتفرم جامع آموزش آنلاین مهارت‌های مدرن وب، React، فیگما و هوش مصنوعی با پروژه‌های عملی و فایل‌های دانلودی رایگان.',
        canonical: 'https://luminalearn.ir/',
        robots: 'index, follow',
        ogTitle: 'لومینا لرن | آکادمی مهارت‌های مدرن',
        ogDescription: 'دوره‌های جامع هوش مصنوعی، فرانت‌اند و دیزاین سیستم به همراه سورس‌کد و مدارک بین‌المللی.',
        ogImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'
      },
      {
        id: 'seo_crs_react',
        entityType: 'COURSE',
        entityId: 'crs_react_pro',
        title: 'دوره جامع React 19 و Next.js 15 پروژه‌محور | لومینا لرن',
        description: 'آموزش کامل ری‌اکت ۱۹ و نکست‌جی‌اس ۱۵ با تایپ‌اسکریپت و پروژه‌های واقعی با مدرک پایان دوره.',
        canonical: 'https://luminalearn.ir/courses/react-19-nextjs-masterclass',
        robots: 'index, follow',
        ogTitle: 'مسترکلاس React 19 و Next.js 15',
        ogImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&auto=format&fit=crop&q=80'
      }
    ];

    // 9. Initial Audit Log
    this.auditLogs.push({
      id: 'audit_init',
      userId: 'usr_admin_1',
      userEmail: 'admin@luminalearn.ir',
      action: 'SYSTEM_BOOTSTRAP',
      entity: 'SYSTEM',
      changes: { message: 'سیستم لومینا لرن با موفقیت راه‌اندازی شد.' },
      createdAt: now
    });

    // 10. Initial Subscription Plans (VIP 1, 3, 6, 9 months)
    this.initDefaultSubscriptionPlans();
  }

  public initDefaultSubscriptionPlans(): void {
    const now = new Date().toISOString();
    const plans: SubscriptionPlan[] = [
      {
        id: 'plan_vip_1m',
        title: 'اشتراک ۱ ماهه طلایی (VIP)',
        durationInMonths: 1,
        price: 390000,
        discountedPrice: 290000,
        features: [
          'دسترسی نامحدود به تمامی دوره‌های پلتفرم',
          'مشاهده و دانلود ویدیوهای باکیفیت Full HD',
          'سورس‌کد و فایل‌های تمرینی جلسات',
          'پشتیبانی آنلاین و پاسخ به سوالات'
        ],
        isPopular: false,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'plan_vip_3m',
        title: 'اشتراک ۳ ماهه نقره‌ای (VIP)',
        durationInMonths: 3,
        price: 990000,
        discountedPrice: 750000,
        features: [
          'دسترسی نامحدود به تمامی دوره‌های پلتفرم',
          'مشاهده و دانلود ویدیوهای باکیفیت Full HD',
          'سورس‌کد و فایل‌های تمرینی جلسات',
          'پشتیبانی آنلاین و پاسخ به سوالات اساتید',
          'صدور گواهی‌نامه رسمی پایان دوره'
        ],
        isPopular: false,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'plan_vip_6m',
        title: 'اشتراک ۶ ماهه الماس (VIP محبوب‌ترین)',
        durationInMonths: 6,
        price: 1850000,
        discountedPrice: 1290000,
        features: [
          'دسترسی نامحدود به تمامی دوره‌ها و وبینارها',
          'مشاهده و دانلود بدون محدودیت با بالاترین کیفیت',
          'دسترسی زودهنگام به دوره‌ها و آپدیت‌های جدید',
          'سورس‌کد و فایل‌های لایه باز تمرینی',
          'پشتیبانی VIP مستقیم توسط منتورها',
          'صدور مدرک بین‌المللی دیجیتال با QR Code'
        ],
        isPopular: true,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'plan_vip_9m',
        title: 'اشتراک ۹ ماهه جامع (VIP ویژه حرفه‌ای‌ها)',
        durationInMonths: 9,
        price: 2600000,
        discountedPrice: 1790000,
        features: [
          'دسترسی نامحدود به کل آرشیو آموزش‌ها برای ۹ ماه',
          'امکان دانلود تمام سورس‌ها، فایل‌های پروژه و اسلایدها',
          'مشاوره اختصاصی مسیر شغلی و بررسی پورتفولیو',
          'پشتیبانی اولویت‌دار VIP ۲۴/۷',
          'صدور تمامی مدارک دوره‌ها همراه با استعلام آنلاین'
        ],
        isPopular: false,
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ];

    this._subscriptionPlans = this.wrapCollection(plans);
  }

  public ensureDefaultUsers(): void {
    const passwordHash = bcrypt.hashSync('123456', 10);
    const now = new Date().toISOString();

    const requiredUsers: User[] = [
      {
        id: 'usr_admin_1',
        name: 'مازیار حسینی (مدیر ارشد لومینا)',
        email: 'maziarhosseini232@gmail.com',
        phone: '09120000000',
        passwordHash,
        roles: ['OWNER', 'ADMIN'],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        headline: 'مدیر کل و معمار سیستم',
        bio: 'سرپرست تیم آموزش و توسعه سیستم‌های نرم‌افزاری مقیاس‌پذیر.',
        walletBalance: 0,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'usr_admin_2',
        name: 'مدیر سیستم لومینا',
        email: 'admin@lumina.com',
        phone: '09120000001',
        passwordHash,
        roles: ['OWNER', 'ADMIN'],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        headline: 'مدیر سیستم و نظارت بر محتوا',
        bio: 'مدیریت و پشتیبانی محتوای آموزشی لومینا لرن.',
        walletBalance: 0,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'usr_instructor_1',
        name: 'مهندس علی رضایی (مدرس ارشد)',
        email: 'instructor@luminalearn.ir',
        phone: '09120000002',
        passwordHash,
        roles: ['INSTRUCTOR'],
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        headline: 'مدرس ارشد فرانت‌اند و طراح دیزاین سیستم',
        bio: 'بیش از ۱۰ سال تجربه توسعه برنامه‌های وب و آموزش بیش از ۵,۰۰۰ دانشجو.',
        walletBalance: 0,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'usr_student_1',
        name: 'سارا احمدی (دانشجوی فعال)',
        email: 'student@luminalearn.ir',
        phone: '09120000003',
        passwordHash,
        roles: ['STUDENT'],
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        headline: 'دانشجوی مشتاق برنامه‌نویسی وب مدرن',
        bio: 'علاقه‌مند به یادگیری React، TypeScript و فناوری‌های هوش مصنوعی.',
        walletBalance: 0,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ];

    for (const reqUser of requiredUsers) {
      const idx = this.users.findIndex(u => u.id === reqUser.id || u.email.toLowerCase() === reqUser.email.toLowerCase());
      if (idx === -1) {
        this.users.push(reqUser);
      } else {
        const existing = this.users[idx];
        existing.isActive = true;
        existing.deletedAt = undefined;
        for (const r of reqUser.roles) {
          if (!existing.roles.includes(r)) {
            existing.roles.push(r);
          }
        }
        if (!existing.passwordHash || !bcrypt.compareSync('123456', existing.passwordHash)) {
          existing.passwordHash = reqUser.passwordHash;
        }
      }
    }
  }

  public initDefaultCourses(): void {
    this._courses = this.wrapCollection([]);
  }

  public initDefaultDigitalProducts(): void {
    this._digitalProducts = this.wrapCollection([]);
  }

  // --- Snapshot Persistence Methods ---

  public getSnapshotPath(): string {
    return this.snapshotFilePath;
  }

  public setSnapshotPath(newPath: string): void {
    this.snapshotFilePath = newPath;
  }

  public hasSnapshot(): boolean {
    try {
      return fs.existsSync(this.snapshotFilePath);
    } catch {
      return false;
    }
  }

  public markDirty(): void {
    if (this.isSeeding || !this.isLoaded) return;
    this.isDirty = true;
    this.scheduleSnapshot();
  }

  public scheduleSnapshot(): void {
    if (this.isSeeding || !this.isLoaded) return;
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveSnapshotSync();
    }, 500);
  }

  public saveSnapshotSync(): boolean {
    try {
      const dir = path.dirname(this.snapshotFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const snapshot: DbSnapshot = {
        version: 1,
        timestamp: new Date().toISOString(),
        siteSetting: this._siteSetting,
        users: this._users,
        roles: this._roles,
        permissions: this._permissions,
        categories: this._categories,
        tags: this._tags,
        courses: this._courses,
        digitalProducts: this._digitalProducts,
        enrollments: this._enrollments,
        lessonProgress: this._lessonProgress,
        courseProgress: this._courseProgress,
        lessonNotes: this._lessonNotes,
        reviews: this._reviews,
        homepageSections: this._homepageSections,
        navigationItems: this._navigationItems,
        pages: this._pages,
        blogPosts: this._blogPosts,
        seoMetadata: this._seoMetadata,
        auditLogs: this._auditLogs,
        orders: this._orders,
        payments: this._payments,
        coupons: this._coupons,
        paymentTransactions: this._paymentTransactions,
        subscriptionPlans: this._subscriptionPlans,
      };

      // Atomic write: Write to unique temp file, then rename/replace actual snapshot
      const tempPath = `${this.snapshotFilePath}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(snapshot, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.snapshotFilePath);

      this.isDirty = false;
      return true;
    } catch (err) {
      console.error('[Database] Failed to write atomic snapshot to disk:', err);
      return false;
    }
  }

  public async saveSnapshot(): Promise<boolean> {
    return this.saveSnapshotSync();
  }

  public loadSnapshot(silent = false): boolean {
    try {
      if (!fs.existsSync(this.snapshotFilePath)) {
        return false;
      }
      const raw = fs.readFileSync(this.snapshotFilePath, 'utf-8');
      if (!raw || !raw.trim()) {
        if (!silent) console.warn('[Database] Snapshot file exists but is empty.');
        return false;
      }

      const parsed: DbSnapshot = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.users) || !Array.isArray(parsed.courses)) {
        if (!silent) console.warn('[Database] Snapshot content is malformed.');
        return false;
      }

      // Populate wrapped state cleanly without duplicating
      if (parsed.siteSetting) {
        this._siteSetting = {
          ...this._siteSetting,
          ...parsed.siteSetting,
          isInstructorRegistrationEnabled: Boolean(parsed.siteSetting.isInstructorRegistrationEnabled),
          isAlacarteSaleEnabled: Boolean(parsed.siteSetting.isAlacarteSaleEnabled)
        };
      }
      if (Array.isArray(parsed.users)) this._users = this.wrapCollection(parsed.users);
      this.ensureDefaultUsers();

      if (Array.isArray(parsed.roles)) this._roles = this.wrapCollection(parsed.roles.length > 0 ? parsed.roles : [...ROLES]);
      if (Array.isArray(parsed.permissions)) this._permissions = this.wrapCollection(parsed.permissions.length > 0 ? parsed.permissions : [...PERMISSIONS]);
      if (Array.isArray(parsed.categories)) this._categories = this.wrapCollection(parsed.categories);
      if (Array.isArray(parsed.tags)) this._tags = this.wrapCollection(parsed.tags);
      
      // Ensure courses have sections & lessons
      if (Array.isArray(parsed.courses) && parsed.courses.some(c => c.sections && c.sections.length > 0)) {
        this._courses = this.wrapCollection(parsed.courses);
      } else {
        this.initDefaultCourses();
      }

      // Ensure digital products exist
      if (Array.isArray(parsed.digitalProducts) && parsed.digitalProducts.length > 0) {
        this._digitalProducts = this.wrapCollection(parsed.digitalProducts);
      } else {
        this.initDefaultDigitalProducts();
      }

      if (Array.isArray(parsed.enrollments)) this._enrollments = this.wrapCollection(parsed.enrollments);
      if (Array.isArray(parsed.lessonProgress)) this._lessonProgress = this.wrapCollection(parsed.lessonProgress);
      if (Array.isArray(parsed.courseProgress)) this._courseProgress = this.wrapCollection(parsed.courseProgress);
      if (Array.isArray(parsed.lessonNotes)) this._lessonNotes = this.wrapCollection(parsed.lessonNotes);
      if (Array.isArray(parsed.reviews)) this._reviews = this.wrapCollection(parsed.reviews);
      if (Array.isArray(parsed.homepageSections)) this._homepageSections = this.wrapCollection(parsed.homepageSections);
      if (Array.isArray(parsed.navigationItems)) this._navigationItems = this.wrapCollection(parsed.navigationItems);
      if (Array.isArray(parsed.pages)) this._pages = this.wrapCollection(parsed.pages);
      if (Array.isArray(parsed.blogPosts)) this._blogPosts = this.wrapCollection(parsed.blogPosts);
      if (Array.isArray(parsed.seoMetadata)) this._seoMetadata = this.wrapCollection(parsed.seoMetadata);
      if (Array.isArray(parsed.auditLogs)) this._auditLogs = this.wrapCollection(parsed.auditLogs);
      if (Array.isArray(parsed.orders)) this._orders = this.wrapCollection(parsed.orders);
      if (Array.isArray(parsed.payments)) this._payments = this.wrapCollection(parsed.payments);
      if (Array.isArray(parsed.coupons)) this._coupons = this.wrapCollection(parsed.coupons);
      if (Array.isArray(parsed.paymentTransactions)) this._paymentTransactions = this.wrapCollection(parsed.paymentTransactions);
      if (Array.isArray(parsed.subscriptionPlans) && parsed.subscriptionPlans.length > 0) {
        this._subscriptionPlans = this.wrapCollection(parsed.subscriptionPlans);
      } else {
        this.initDefaultSubscriptionPlans();
      }

      this.isDirty = false;
      this.isLoaded = true;
      return true;
    } catch (err) {
      if (!silent) {
        console.warn('[Database] Fail-safe warning: snapshot file is unreadable or malformed, handled safely.');
      }
      return false;
    }
  }

  public wipeToCleanSlate(): void {
    const adminEmails = ['admin@lumina.com', 'maziarhosseini232@gmail.com'];
    const preserved = this._users.filter(u =>
      adminEmails.includes(u.email) ||
      (u.roles && (u.roles.includes('OWNER') || u.roles.includes('ADMIN')))
    ).map(u => ({
      ...u,
      walletBalance: 0,
      subscriptionPlanId: undefined,
      subscriptionStartDate: undefined,
      subscriptionEndDate: undefined,
      subscriptionStatus: undefined,
      isVip: false
    }));

    this.users = preserved;
    this.courses = [];
    this.digitalProducts = [];
    this.enrollments = [];
    this.lessonProgress = [];
    this.courseProgress = [];
    this.lessonNotes = [];
    this.reviews = [];
    this.coupons = [];
    this.orders = [];
    this.payments = [];
    this.paymentTransactions = [];

    this.saveSnapshotSync();
  }

  public resetToSeed(): void {
    this.isSeeding = true;
    this.seedInitialData();
    this.isSeeding = false;
    this.isLoaded = true;
    this.saveSnapshotSync();
  }

  private initPersistenceLifecycle(): void {
    const flush = () => {
      if (this.isDirty) {
        this.saveSnapshotSync();
      }
    };
    process.on('beforeExit', flush);
    process.on('exit', flush);

    const timer = setInterval(() => {
      if (this.isDirty) {
        this.saveSnapshotSync();
      }
    }, 2000);
    if (timer.unref) timer.unref();
  }

  // Transaction Simulation with Mutex Lock
  public async transaction<T>(callback: () => Promise<T>): Promise<T> {
    try {
      const result = await callback();
      this.markDirty();
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export const db = new Database();
