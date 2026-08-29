import { Category, Course, CourseReview, InstructorProfile, User, Coupon, MediaAsset } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'design',
    slug: 'design',
    name: 'Design & Creative Arts',
    nameFa: 'طراحی و هنرهای دیجیتال',
    description: 'آموزش جامع طراحی رابط کاربری (UI/UX)، سیستم‌های دیزاین، فیگما، هویت بصری و گرافیک دیجیتال.',
    iconName: 'Palette',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000&auto=format&fit=crop',
    courseCount: 38,
    subCategories: ['طراحی UI/UX', 'سیستم‌های دیزاین', 'گرافیک دیزاین', 'هویت بصری', 'مدل‌سازی سه‌بعدی']
  },
  {
    id: 'development',
    slug: 'development',
    name: 'Software Engineering',
    nameFa: 'مهندسی نرم‌افزار و وب',
    description: 'ساخت اپلیکیشن‌های تحت وب مدرن، معماری فول‌استک با ری‌اکت، تایپ‌اسکریپت و مایکروسرویس‌ها.',
    iconName: 'Code',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop',
    courseCount: 42,
    subCategories: ['ری‌اکت و نکست‌جی‌اس', 'معماری فول‌استک', 'تایپ‌اسکریپت', 'بک‌اند و نود‌جی‌اس', 'طراحی سیستم']
  },
  {
    id: 'ai-tech',
    slug: 'ai-tech',
    name: 'AI & Machine Learning',
    nameFa: 'هوش مصنوعی و داده',
    description: 'ساخت ایجنت‌های هوشمند با LLM، مهندسی پرامپت، پردازش زبان طبیعی و ابزارهای هوش مصنوعی برای تولید محتوا.',
    iconName: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    courseCount: 29,
    subCategories: ['ایجنت‌های هوش مصنوعی', 'مهندسی پرامپت', 'هوش مصنوعی مولد', 'یادگیری ماشین']
  },
  {
    id: 'film-video',
    slug: 'film-video',
    name: 'Film & Cinematography',
    nameFa: 'سینما و تدوین فیلم',
    description: 'اصلاح رنگ سینمایی در داوینچی ریزالو، تدوین فیلم در پریمیر، نورپردازی صحنه و جلوه‌های ویژه افترافکت.',
    iconName: 'Film',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000&auto=format&fit=crop',
    courseCount: 24,
    subCategories: ['اصلاح رنگ سینمایی', 'داوینچی ریزالو', 'تدوین با پریمیر', 'افترافکت و موشن گرافیک']
  },
  {
    id: 'business',
    slug: 'business',
    name: 'Business & Strategy',
    nameFa: 'کسب‌وکار و کارآفرینی',
    description: 'مدیریت و رشد محصول، جذب سرمایه برای استارتاپ‌ها، استراتژی‌های ورود به بازار و رهبری تیم‌های فناوری.',
    iconName: 'TrendingUp',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop',
    courseCount: 31,
    subCategories: ['استراتژی محصول', 'جذب سرمایه و رشد', 'مارکتینگ', 'رهبری کسب‌وکار']
  },
  {
    id: 'photography',
    slug: 'photography',
    name: 'Photography & Lighting',
    nameFa: 'عکاسی و نورپردازی',
    description: 'عکاسی پرتره تجاری، مدیریت نور طبیعی و استودیویی، ترکیب‌بندی ژورنالیستی و ادیت حرفه‌ای در لایت‌روم.',
    iconName: 'Camera',
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop',
    courseCount: 19,
    subCategories: ['عکاسی پرتره', 'نورپردازی استودیو', 'ادیت در لایت‌روم', 'عکاسی تبلیغاتی']
  },
  {
    id: 'music-audio',
    slug: 'music-audio',
    name: 'Music & Sound Design',
    nameFa: 'موسیقی و مهندسی صدا',
    description: 'آهنگسازی و تنظیم در ابلتون لایو، میکس و مسترینگ حرفه‌ای، ساخت موسیقی متن و سینث‌سایزرها.',
    iconName: 'Headphones',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000&auto=format&fit=crop',
    courseCount: 17,
    subCategories: ['ابلتون لایو', 'میکس و مسترینگ', 'موسیقی متن فیلم', 'سینث‌سایزر و تولید صدا']
  },
  {
    id: 'writing',
    slug: 'writing',
    name: 'Writing & Storytelling',
    nameFa: 'نویسندگی و داستان‌سرایی',
    description: 'اصول کپی‌رایتینگ فروش، نویسندگی خلاق، فیلم‌نامه‌نویسی و استراتژی تولید محتوای داستانی برند.',
    iconName: 'PenTool',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1000&auto=format&fit=crop',
    courseCount: 15,
    subCategories: ['کپی‌رایتینگ تبلیغاتی', 'فیلم‌نامه‌نویسی', 'داستان‌سرایی برند', 'نویسندگی مقالات']
  }
];

export const INITIAL_INSTRUCTORS: InstructorProfile[] = [
  {
    id: 'inst-elena',
    name: 'النا رستمی',
    nameFa: 'النا رستمی',
    title: 'طراح ارشد محصول و مشاور ارشد دیزاین سیستم',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
    bio: 'النا با بیش از ۱۲ سال تجربه در رهبری تیم‌های طراحی محصول و ساخت سیستم‌های دیزاین سازمانی در مقیاس میلیون‌ها کاربر، برنده ۲ جایزه بین‌المللی Red Dot Design است.',
    studentCount: 24800,
    rating: 4.96,
    reviewCount: 2840,
    courseCount: 3,
    isVerified: true,
    socials: {
      website: 'https://elenarostami.design',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com'
    }
  },
  {
    id: 'inst-marcus',
    name: 'دکتر آرش رادمنش',
    nameFa: 'دکتر آرش رادمنش',
    title: 'معمار ارشد هوش مصنوعی و سیستم‌های توزیع‌شده',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop',
    bio: 'دکترای علوم کامپیوتر با تمرکز بر پردازش زبان طبیعی و عامل‌های هوشمند چندمنظوره. محقق پیشین پروژه‌های متن‌باز LLM و مشاور شرکت‌های پیشرو فناوری.',
    studentCount: 31200,
    rating: 4.98,
    reviewCount: 3410,
    courseCount: 4,
    isVerified: true,
    socials: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      youtube: 'https://youtube.com'
    }
  },
  {
    id: 'inst-clara',
    name: 'سارا محمدی',
    nameFa: 'سارا محمدی',
    title: 'مدیر فیلم‌برداری و متخصص ارشد اصلاح رنگ داوینچی ریزالو',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format&fit=crop',
    bio: 'تدوین‌گر و مدیر فیلم‌برداری با تجربه اصلاح رنگ بیش از ۳۰ فیلم مستند و سینمایی معتبر. سارا مدرس بین‌المللی نرم‌افزار DaVinci Resolve و نورپردازی سینمایی است.',
    studentCount: 18400,
    rating: 4.94,
    reviewCount: 1690,
    courseCount: 2,
    isVerified: true,
    socials: {
      website: 'https://saramohammadi.film',
      twitter: 'https://twitter.com',
      youtube: 'https://youtube.com'
    }
  },
  {
    id: 'inst-tariq',
    name: 'مهندس پویا شمس',
    nameFa: 'مهندس پویا شمس',
    title: 'مشاور استراتژی محصول و هم‌بنیان‌گذار استارتاپ‌های مقیاس‌پذیر',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
    bio: 'پویا در مقیاس‌پذیری و رشد چند استارتاپ موفق فناوری نقش مستقیم داشته و بیش از ۴۰ تیم محصولی را در زمینه تحلیل متریک‌ها و مدل‌های کسب‌وکار راهنمایی کرده است.',
    studentCount: 15600,
    rating: 4.92,
    reviewCount: 1240,
    courseCount: 2,
    isVerified: true,
    socials: {
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com'
    }
  },
  {
    id: 'inst-reza',
    name: 'رضا صبوری',
    nameFa: 'رضا صبوری',
    title: 'عکاس پرتره تجاری و مدرس تکنیک‌های نورپردازی استودیو',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop',
    bio: 'بیش از یک دهه فعالیت در عکاسی تبلیغاتی و مد برای برندهای مطرح. رضا متخصص شبیه‌سازی نور طبیعی در محیط‌های تاریک استودیو است.',
    studentCount: 12900,
    rating: 4.91,
    reviewCount: 980,
    courseCount: 2,
    isVerified: true,
    socials: {
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com'
    }
  },
  {
    id: 'inst-leila',
    name: 'لیلا دانشور',
    nameFa: 'لیلا دانشور',
    title: 'فیلم‌نامه‌نویس و استراتژیست ارشد کپی‌رایتینگ برند',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop',
    bio: 'نویسنده و مشاور محتوایی برندهای بزرگ فناوری. لیلا فرمول‌های داستان‌سرایی تبلیغاتی و تکنیک‌های متقاعدسازی مخاطب را تدریس می‌کند.',
    studentCount: 9400,
    rating: 4.95,
    reviewCount: 760,
    courseCount: 1,
    isVerified: true,
    socials: {
      linkedin: 'https://linkedin.com'
    }
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-uiux-bootcamp',
    slug: 'modern-ui-ux-design-systems-mastery',
    title: 'آموزش جامع طراحی UI/UX و سیستم‌های دیزاین سازمانی در فیگما',
    subtitle: 'از تعریف توکن‌ها و متغیرهای فیگما (Figma Variables) تا ساخت کامپوننت‌های تعاملی و تحویل دقیق به مهندسان فرانت‌اند.',
    description: 'در این دوره مسترکلاس، نحوه طراحی رابط‌های کاربری مدرن، مقیاس‌پذیر و در کلاس جهانی را فرامی‌گیرید. با تمرکز بر اصول اتمیک دیزاین، کنتراست‌های استاندارد، سلسله‌مراتب تایپوگرافی، رعایت استانداردهای دسترس‌پذیری (WCAG 2.2) و پروتوتایپ‌های پیشرفته.',
    categoryId: 'design',
    categoryName: 'طراحی و هنرهای دیجیتال',
    subCategory: 'سیستم‌های دیزاین',
    thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=1000&auto=format&fit=crop',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    instructorId: 'inst-elena',
    instructorName: 'النا رستمی',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    instructorTitle: 'طراح ارشد محصول و مشاور ارشد دیزاین سیستم',
    price: 490000,
    originalPrice: 890000,
    discountPercentage: 45,
    rating: 4.96,
    reviewCount: 1240,
    studentCount: 14850,
    durationHours: 14.5,
    lessonCount: 28,
    level: 'Intermediate',
    language: 'فارسی',
    hasCertificate: true,
    isTrending: true,
    isFeatured: true,
    isNew: false,
    isPublished: true,
    publishedAt: '۱۴۰۴/۱۰/۲۵',
    updatedAt: '۱۴۰۴/۱۱/۲۰',
    tags: ['فیگما', 'طراحی UI/UX', 'سیستم‌های دیزاین', 'توکن‌های طراحی', 'طراحی محصول'],
    status: 'published',
    whatYouWillLearn: [
      'معماری سیستم‌های دیزاین سازمانی با متغیرها، تم‌های تیره و روشن و اسلات‌های کامپوننت فیگما',
      'اجرای تحقیقات کاربردپذیری و تبدیل بازخوردها به وایرفریم‌ها و پروتوتایپ‌های باکیفیت',
      'تسلط بر میکرواینتراکشن‌های جذاب و انیمیشن‌های روان برای بهبود تجربه کاربری',
      'همکاری بدون اصطکاک با برنامه‌نویسان فرانت‌اند با استفاده از توکن‌های طراحی ساخت‌یافته',
      'طراحی تعاملی کاملاً ریسپانسیو و موبایل-محور با رعایت کامل استانداردهای WCAG AA'
    ],
    requirements: [
      'آشنایی اولیه با محیط نرم‌افزار فیگما یا سایر ابزارهای طراحی برداری',
      'یک کامپیوتر یا لپ‌تاپ با مرورگر وب مدرن',
      'انگیزه و اشتیاق برای خلق رابط‌های کاربری فوق‌العاده حرفه‌ای'
    ],
    targetAudience: [
      'طراحان محصول که می‌خواهند از سطح مقدماتی به سطوح ارشد و لید دیزاین ارتقا یابند',
      'توسعه‌دهندگان فرانت‌اند که به دنبال درک عمیق محاسبات چیدمان، فاصله‌گذاری و تایپوگرافی هستند',
      'علاقه‌مندان به ورود حرفه‌ای به بازار کار پرتقاضای طراحی UI/UX'
    ],
    modules: [
      {
        id: 'mod-1',
        title: 'فصل اول: مبانی تایپوگرافی و سلسله‌مراتب بصری در زبان فارسی و انگلیسی',
        description: 'تنظیم نسبت‌های مقیاس تایپوگرافی، ریتم فاصله‌گذاری اصولی و رنگ‌های خنثی جذاب.',
        lessons: [
          {
            id: 'les-1-1',
            title: 'جلسه ۱: آناتومی زیبایی‌شناسی محصولات دیجیتال مدرن',
            durationMinutes: 18,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            isPreviewFree: true,
            description: 'چرا کیفیت بصری و تقارن طراحی مستقیماً اعتماد کاربر و نرخ تبدیل محصول را تعیین می‌کند.',
            resources: [
              { id: 'res-1', title: 'راهنمای_توکن‌های_دیزاین_سیستم.pdf', fileSize: '۲.۴ مگابایت', fileType: 'pdf', downloadUrl: '#' },
              { id: 'res-2', title: 'ماشین_حساب_مقیاس_تایپوگرافی.fig', fileSize: '۸.۱ مگابایت', fileType: 'figma', downloadUrl: '#' }
            ]
          },
          {
            id: 'les-1-2',
            title: 'جلسه ۲: فاصله‌گذاری ریاضی و گرید نرم ۸ پیکسلی در محیط راست‌چین (RTL)',
            durationMinutes: 24,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            isPreviewFree: true,
            description: 'استخراج ریتم‌های یکپارچه و حذف تداخل‌های بصری در کانتینرهای مختلف.'
          },
          {
            id: 'les-1-3',
            title: 'جلسه ۳: انتخاب پالت‌های رنگی جذاب و خنثی هوشمندانه',
            durationMinutes: 22,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            isPreviewFree: false,
            description: 'فرمولاسیون رنگ‌های خاکستری گرم و سرد با اشباع کمتر از ۵ درصد.'
          }
        ]
      },
      {
        id: 'mod-2',
        title: 'فصل دوم: متغیرهای فیگما (Figma Variables) و توکن‌های چندبرندی',
        description: 'بررسی عمیق حالت‌های فیگما، سلسله‌مراتب متغیرها و مدیریت تم تیره و روشن.',
        lessons: [
          {
            id: 'les-2-1',
            title: 'جلسه ۴: راه‌اندازی متغیرهای معنایی و ساختار توکن‌ها در فیگما',
            durationMinutes: 32,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            isPreviewFree: false,
            description: 'ساخت لایه‌های متغیر پایه، معنایی و اختصاصی کامپوننت‌ها در فیگما.'
          },
          {
            id: 'les-2-2',
            title: 'جلسه ۵: معماری تم روشن و تم تیره (Light / Dark Mode)',
            durationMinutes: 29,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
            isPreviewFree: false,
            description: 'قواعد ارتفاع لایه‌ها و حفظ خوانایی نوری در حالت تاریک.'
          },
          {
            id: 'les-2-3',
            title: 'جلسه ۶: کارگاه پروتوتایپ تعاملی و میکرواینتراکشن‌ها',
            durationMinutes: 35,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            isPreviewFree: false,
            description: 'انیمیشن‌های فنری، منحنی‌های نرم حرکتی و شاخص‌های ناوبری کیبورد.'
          }
        ]
      }
    ],
    faqs: [
      { question: 'آیا برای شرکت در این دوره به اشتراک پولی فیگما نیاز دارم؟', answer: 'خیر، نسخه رایگان فیگما از تمامی تکنیک‌ها، اتولایوت‌ها و متغیرهای تدریس‌شده در این دوره به طور کامل پشتیبانی می‌کند.' },
      { question: 'آیا در پایان دوره گواهی رسمی اعطا می‌شود؟', answer: 'بله، پس از تکمیل ۱۰۰٪ جلسات و آزمون دوره، گواهی معتبر با کد پیگیری اختصاصی صادر می‌گردد.' }
    ]
  },
  {
    id: 'course-ai-agents-fullstack',
    slug: 'fullstack-llm-agents-production-architecture',
    title: 'آموزش جامع ساخت ایجنت‌های هوش مصنوعی (AI Agents) و معماری فول‌استک',
    subtitle: 'طراحی و پیاده‌سازی سیستم‌های خودکار چند عاملی با Function Calling، حافظه برداری و رابط کاربری استریم زنده.',
    description: 'فاصله میان اسکریپت‌های آزمایشی پرامپت و محصولات هوش مصنوعی سطح سازمانی را پر کنید. تسلط بر جریان‌های کاری مدرن مدل‌های زبانی با تایپ‌اسکریپت، ایندکس‌گذاری معنایی، فراخوانی توابع ساخت‌یافته و استریم بی‌درنگ در ری‌اکت.',
    categoryId: 'ai-tech',
    categoryName: 'هوش مصنوعی و داده',
    subCategory: 'ایجنت‌های هوش مصنوعی',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    instructorId: 'inst-marcus',
    instructorName: 'دکتر آرش رادمنش',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    instructorTitle: 'معمار ارشد هوش مصنوعی و سیستم‌های توزیع‌شده',
    price: 750000,
    originalPrice: 1350000,
    discountPercentage: 44,
    rating: 4.98,
    reviewCount: 2180,
    studentCount: 18900,
    durationHours: 18.0,
    lessonCount: 34,
    level: 'Advanced',
    language: 'فارسی',
    hasCertificate: true,
    isTrending: true,
    isFeatured: true,
    isNew: true,
    isPublished: true,
    publishedAt: '۱۴۰۴/۱۱/۱۰',
    updatedAt: '۱۴۰۴/۱۱/۲۸',
    tags: ['هوش مصنوعی', 'تایپ‌اسکریپت', 'ایجنت هوشمند', 'جمینای', 'طراحی سیستم'],
    status: 'published',
    whatYouWillLearn: [
      'طراحی حلقه‌های تصمیم‌گیری ایجنت‌های هوشمند با اعتبارسنجی قطعی اسکیماهای JSON',
      'پیاده‌سازی ابزارهای چندمرحله‌ای با اجرای ایمن در محیط سندباکس',
      'ایجاد اندپوینت‌های کم‌تاخیر استریم SSE و به‌روزرسانی آنی رابط کاربری در ری‌اکت',
      'ساخت خطوط لوله سفارشی RAG با بازتولید معنایی و رتبه‌بندی مجدد پیشرفته',
      'پیاده‌سازی گاردرایلهای امنیتی و محافظت در برابر حملات تزریق پرامپت (Prompt Injection)'
    ],
    requirements: [
      'تسلط مناسب بر زبان تایپ‌اسکریپت یا جاوااسکریپت مدرن',
      'آشنایی با مفاهیم پایه‌ای APIهای REST و برنامه‌نویسی ناهمگام (Async)',
      'علاقه به توسعه راهکارهای پیشرفته هوش مصنوعی مولد'
    ],
    targetAudience: [
      'مهندسان ارشد نرم‌افزار که مایلند محصولات هوش مصنوعی سطح تجاری بسازند',
      'توسعه‌دهندگان فول‌استک علاقه‌مند به سیستم‌های هوشمند تعاملی',
      'بنیان‌گذاران فنی که در حال ساخت استارتاپ‌های مبتنی بر AI هستند'
    ],
    modules: [
      {
        id: 'mod-ai-1',
        title: 'فصل اول: مبانی حلقه‌های تصمیم‌گیری در ایجنت‌های مدرن (Agentic Loops)',
        description: 'معماری رفتاری، مدیریت خطا و تصمیم‌گیری گام به گام مدل‌های هوش مصنوعی.',
        lessons: [
          {
            id: 'les-ai-1',
            title: 'جلسه ۱: آناتومی ابزارها و Function Calling ساخت‌یافته',
            durationMinutes: 28,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            isPreviewFree: true,
            description: 'نحوه نگاشت درخواست‌های کاربر به توابع کد با استفاده از JSON Schema بدون خطا.'
          },
          {
            id: 'les-ai-2',
            title: 'جلسه ۲: معماری سیستم‌های بازیابی اطلاعات (RAG) ترکیبی',
            durationMinutes: 34,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            isPreviewFree: true,
            description: 'ترکیب جستجوی لغوی و معنایی با امبدینگ‌های پیشرفته.'
          }
        ]
      }
    ],
    faqs: [
      { question: 'آیا برای این دوره به کلید اختصاصی API نیاز است؟', answer: 'در طول دوره روش‌های استفاده از سهمیه رایگان و بهینه‌سازی مصرف توکن‌ها به طور کامل شرح داده می‌شود.' }
    ]
  },
  {
    id: 'course-cinematic-color-grading',
    slug: 'davinci-resolve-cinematic-color-grading-masterclass',
    title: 'آموزش حرفه‌ای اصلاح رنگ سینمایی در داوینچی ریزالو (DaVinci Resolve)',
    subtitle: 'از اصول مدیریت رنگ ACES و کار با لاگ (Log) دوربین‌ها تا خلق لوک‌های اختصاصی سینمایی و استانداردهای پخش نتفلیکس.',
    description: 'تبدیل تصاویر خام ویدیویی به شاهکارهای بصری با عمق نوری و پالت‌های رنگی جذاب. یادگیری تکنیک‌های پیشرفته اصلاح رنگ، تصحیح تناژ پوست (Skin Tone)، ماسک‌گذاری متحرک و استفاده از ابزارهای قدرتمند DaVinci Resolve Studio.',
    categoryId: 'film-video',
    categoryName: 'سینما و تدوین فیلم',
    subCategory: 'اصلاح رنگ سینمایی',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1000&auto=format&fit=crop',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    instructorId: 'inst-clara',
    instructorName: 'سارا محمدی',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
    instructorTitle: 'مدیر فیلم‌برداری و متخصص ارشد اصلاح رنگ داوینچی ریزالو',
    price: 580000,
    originalPrice: 980000,
    discountPercentage: 40,
    rating: 4.94,
    reviewCount: 1690,
    studentCount: 12400,
    durationHours: 16.0,
    lessonCount: 30,
    level: 'Intermediate',
    language: 'فارسی',
    hasCertificate: true,
    isTrending: true,
    isFeatured: false,
    isNew: false,
    isPublished: true,
    publishedAt: '۱۴۰۴/۰۹/۱۴',
    updatedAt: '۱۴۰۴/۱۱/۰۵',
    tags: ['داوینچی ریزالو', 'اصلاح رنگ', 'سینما', 'تدوین فیلم', 'کالر گریدینگ'],
    status: 'published',
    whatYouWillLearn: [
      'تنظیم گردش کار استانداردهای رنگی ACEScc و DaVinci YRGB Color Managed',
      'جداسازی و تنظیم بی‌نقص رنگ پوست بازیگران بدون تاثیر منفی بر پس‌زمینه',
      'ایجاد کنتراست‌های نرم فیلمی و شبیه‌سازی دقیق نگاتیوهای معروف Kodak و Fuji',
      'کار با نودهای موازی، لایه‌ای و ترکیبی برای خلق افکت‌های نوری دراماتیک'
    ],
    requirements: [
      'نصب نسخه رایگان یا استودیوی DaVinci Resolve روی سیستم',
      'کارت گرافیک با حافظه حداقل ۴ گیگابایت برای رندر روان ویدیوها'
    ],
    targetAudience: [
      'تدوین‌گران و فیلم‌سازان علاقه‌مند به ارتقای چشمگیر کیفیت خروجی آثارشان',
      'تولیدکنندگان محتوای ویدیویی و یوتیوبرهای حرفه‌ای'
    ],
    modules: [
      {
        id: 'mod-cc-1',
        title: 'فصل اول: تسلط بر ابزارهای Color Wheels و Curves',
        description: 'اصول تراز سفیدی، تنظیم اکسپوژر و تفکیک رنگ‌ها.',
        lessons: [
          {
            id: 'les-cc-1',
            title: 'جلسه ۱: جریان کار نودها در صفحه Color داوینچی',
            durationMinutes: 25,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
            isPreviewFree: true,
            description: 'نحوه اتصال نودهای سریالی و تصحیح پایه نور و رنگ.'
          }
        ]
      }
    ],
    faqs: [
      { question: 'آیا فوتیج‌های تمرینی خام (RAW) در اختیار دانشجویان قرار می‌گیرد؟', answer: 'بله، تمامی فوتیج‌های سینمایی با فرمت‌های ProRes و BRAW برای تمرین در پوشه فایل‌های دوره قرار داده شده است.' }
    ]
  },
  {
    id: 'course-react-fullstack',
    slug: 'react-19-nextjs-fullstack-mastery',
    title: 'آموزش جامع React 19 و Next.js 15 از مقدماتی تا سطح سازمانی',
    subtitle: 'معماری سرور کامپوننت‌ها (RSC)، سرور اکشن‌ها، کشینگ هوشمند و دیتابیس با استاندارد تایپ‌اسکریپت کامل.',
    description: 'صفر تا صد توسعه وب مدرن با جدیدترین ویژگی‌های ری‌اکت ۱۹ و نکست ۱۵. ساخت پروژه‌های واقعی با پرفورمنس عالی، بهینه‌سازی سئو، سیستم احراز هویت و پایگاه‌داده امن.',
    categoryId: 'development',
    categoryName: 'مهندسی نرم‌افزار و وب',
    subCategory: 'ری‌اکت و نکست‌جی‌اس',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    instructorId: 'inst-marcus',
    instructorName: 'دکتر آرش رادمنش',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    instructorTitle: 'معمار ارشد هوش مصنوعی و سیستم‌های توزیع‌شده',
    price: 690000,
    originalPrice: 1200000,
    discountPercentage: 42,
    rating: 4.97,
    reviewCount: 3100,
    studentCount: 22400,
    durationHours: 22.0,
    lessonCount: 42,
    level: 'All Levels',
    language: 'فارسی',
    hasCertificate: true,
    isTrending: true,
    isFeatured: true,
    isNew: false,
    isPublished: true,
    publishedAt: '۱۴۰۴/۱۰/۰۵',
    updatedAt: '۱۴۰۴/۱۱/۲۵',
    tags: ['React 19', 'Next.js', 'تایپ‌اسکریپت', 'فرانت‌اند', 'فول‌استک'],
    status: 'published',
    whatYouWillLearn: [
      'معماری پیشرفته React Server Components و استراتژی‌های کشینگ Next.js',
      'مدیریت فرم‌ها و عملیات دیتابیس با Server Actions بدون نیاز به نوشتن API اضافی',
      'بهینه‌سازی حداکثری سرعت بارگذاری و سئو تکنیکال برای رتبه یک گوگل',
      'احراز هویت ایمن، مدیریت نقش‌های کاربری و پرداخت آنلاین'
    ],
    requirements: [
      'آشنایی مقدماتی با HTML، CSS و اصول اولیه جاوااسکریپت'
    ],
    targetAudience: [
      'توسعه‌دهندگانی که می‌خواهند از React سنتی به Next.js مدرن مهاجرت کنند',
      'افرادی که به دنبال ورود حرفه‌ای به بازار کار پردرآمد برنامه‌نویسی وب هستند'
    ],
    modules: [
      {
        id: 'mod-rc-1',
        title: 'فصل اول: مبانی هسته ری‌اکت ۱۹ و ساختار کامپوننت‌ها',
        description: 'آشنایی با هوک‌های جدید، رندرینگ شرطی و مدیریت استیت.',
        lessons: [
          {
            id: 'les-rc-1',
            title: 'جلسه ۱: راه‌اندازی پروژه و ساختار پوشه‌بندی مدرن',
            durationMinutes: 20,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
            isPreviewFree: true,
            description: 'نصب تایپ‌اسکریپت و ساختار پوشه‌های بهینه برای پروژه‌های بزرگ.'
          }
        ]
      }
    ],
    faqs: [
      { question: 'آیا در طول دوره پروژه عملی ساخته می‌شود؟', answer: 'بله، یک پلتفرم فروشگاهی و آموزشی کامل از صفر تا انتشار نهایی ساخته خواهد شد.' }
    ]
  },
  {
    id: 'course-product-growth',
    slug: 'product-strategy-growth-loops-masterclass',
    title: 'مسترکلاس استراتژی رشد محصول، متریک‌ها و جذب سرمایه استارتاپ',
    subtitle: 'روش‌های علمی مقیاس‌پذیری محصول، بهینه‌سازی نرخ تبدیل (CRO)، اقتصاد واحد و ارائه به سرمایه‌گذاران جسورانه.',
    description: 'چگونه یک ایده نوآورانه را به محصولی پایدار با رشد ارگانیک تبدیل کنیم؟ بررسی حلقه‌های رشد ویروسی، اندازه‌گیری LTV و CAC، تحلیل کوهورت کاربران و تکنیک‌های افزایش نرخ نگه‌داشت (Retention).',
    categoryId: 'business',
    categoryName: 'کسب‌وکار و کارآفرینی',
    subCategory: 'استراتژی محصول',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    instructorId: 'inst-tariq',
    instructorName: 'مهندس پویا شمس',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
    instructorTitle: 'مشاور استراتژی محصول و هم‌بنیان‌گذار استارتاپ‌های مقیاس‌پذیر',
    price: 540000,
    originalPrice: 950000,
    discountPercentage: 43,
    rating: 4.92,
    reviewCount: 1240,
    studentCount: 11200,
    durationHours: 12.0,
    lessonCount: 22,
    level: 'Intermediate',
    language: 'فارسی',
    hasCertificate: true,
    isTrending: false,
    isFeatured: true,
    isNew: false,
    isPublished: true,
    publishedAt: '۱۴۰۴/۰۸/۲۲',
    updatedAt: '۱۴۰۴/۱۱/۱۵',
    tags: ['استراتژی محصول', 'رشد محصول', 'استارتاپ', 'جذب سرمایه', 'مارکتینگ'],
    status: 'published',
    whatYouWillLearn: [
      'طراحی حلقه‌های رشد ارگانیک و مکانیزم‌های بازگشت کاربر به محصول',
      'مدل‌سازی مالی دقیق Unit Economics و محاسبه هزینه جذب مشتری',
      'ساخت پیچ‌دک استاندارد و قانع‌کننده برای جلسات جذب سرمایه'
    ],
    requirements: [
      'علاقه به راه‌اندازی و مدیریت کسب‌وکارهای دیجیتال'
    ],
    targetAudience: [
      'مدیران محصول و مارکتینگ',
      'بنیان‌گذاران استارتاپ‌ها و کارآفرینان'
    ],
    modules: [
      {
        id: 'mod-pg-1',
        title: 'فصل اول: چارچوب‌های اعتبارسنجی فرضیات و Product-Market Fit',
        description: 'آزمایش سریع ایده‌ها و مصاحبه اصولی با کاربران هدف.',
        lessons: [
          {
            id: 'les-pg-1',
            title: 'جلسه ۱: کشف ارزش اصلی و شاخص North Star Metric',
            durationMinutes: 22,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            isPreviewFree: true,
            description: 'چگونه متریک کلیدی متمرکز بر ارزش واقعی محصول را تعریف کنیم.'
          }
        ]
      }
    ],
    faqs: [
      { question: 'آیا قالب‌های اکسل محاسباتی به همراه دوره ارائه می‌شود؟', answer: 'بله، تمامی الگوهای اکسل و تمپلیت‌های آماده پیچ‌دک به عنوان ضمیمه قابل دانلود هستند.' }
    ]
  },
  {
    id: 'course-free-intro-figma',
    slug: 'free-introduction-to-figma-and-ui-design',
    title: 'آموزش رایگان مبانی فیگما و ورود به دنیای طراحی رابط کاربری',
    subtitle: 'شروع یادگیری طراحی رابط کاربری از صفر با ابزارهای رایگان فیگما، اتولایوت و طراحی اولین اپلیکیشن موبایل.',
    description: 'اگر می‌خواهید بدون هزینه اولیه وارد دنیای جذاب طراحی دیجیتال شوید، این دوره نقطه شروع ایده‌آل شماست. آموزش کار با فریم‌ها، اشکال، تایپوگرافی و طراحی صفحات واکنش‌گرا.',
    categoryId: 'design',
    categoryName: 'طراحی و هنرهای دیجیتال',
    subCategory: 'طراحی UI/UX',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1000&auto=format&fit=crop',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    instructorId: 'inst-elena',
    instructorName: 'النا رستمی',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    instructorTitle: 'طراح ارشد محصول و مشاور ارشد دیزاین سیستم',
    price: 0,
    originalPrice: 0,
    discountPercentage: 0,
    rating: 4.95,
    reviewCount: 4200,
    studentCount: 38500,
    durationHours: 4.0,
    lessonCount: 10,
    level: 'Beginner',
    language: 'فارسی',
    hasCertificate: true,
    isTrending: true,
    isFeatured: false,
    isNew: true,
    isPublished: true,
    publishedAt: '۱۴۰۴/۱۱/۰۱',
    updatedAt: '۱۴۰۴/۱۱/۲۵',
    tags: ['رایگان', 'فیگما', 'مبتدی', 'طراحی UI', 'موبایل'],
    status: 'published',
    whatYouWillLearn: [
      'آشنایی کامل با محیط کاری فیگما و ابزارهای پرکاربرد',
      'طراحی اولین رابط کاربری اپلیکیشن موبایل از ابتدا تا انتها',
      'درک مفهوم اتولایوت (Auto Layout) برای چیدمان خودکار المان‌ها'
    ],
    requirements: [
      'یک مرورگر اینترنتی و اشتیاق برای یادگیری'
    ],
    targetAudience: [
      'افراد مبتدی که می‌خواهند بدون هزینه وارد حوزه طراحی دیجیتال شوند'
    ],
    modules: [
      {
        id: 'mod-free-1',
        title: 'فصل اول: جعبه ابزار فیگما و اولین طرح شما',
        description: 'رسم اشکال، تنظیم رنگ‌ها و کار با لایه‌ها.',
        lessons: [
          {
            id: 'les-free-1',
            title: 'جلسه ۱: ایجاد حساب کاربری و آشنایی با پنل‌های فیگما',
            durationMinutes: 15,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            isPreviewFree: true,
            description: 'آشنایی اولیه با محیط ویرایشگر و کلیدهای میانبر پرکاربرد.'
          }
        ]
      }
    ],
    faqs: [
      { question: 'آیا این دوره واقعاً رایگان است؟', answer: 'بله، دسترسی به تمامی جلسات این دوره برای تمام کاربران کاملاً رایگان است.' }
    ]
  }
];

export const INITIAL_REVIEWS: CourseReview[] = [
  {
    id: 'rev-1',
    courseId: 'course-uiux-bootcamp',
    userId: 'user-2',
    userName: 'مهندس نوید خراسانی',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
    rating: 5,
    date: '۲ روز پیش',
    comment: 'کیفیت تدریس استاد رستمی فوق‌العاده است. مباحث مربوط به متغیرهای فیگما و توکن‌های طراحی باعث شد در شرکت ساختار دیزاین سیستم را به طور کامل بازطراحی کنیم.',
    helpfulCount: 48,
    isVerifiedPurchase: true,
    instructorResponse: {
      date: 'دیروز',
      comment: 'خیلی خوشحالم که این دوره برای شما مفید بوده است نوید عزیز. موفقیت در اجرای دیزاین سیستم جدید آرزوی من است!'
    }
  },
  {
    id: 'rev-2',
    courseId: 'course-uiux-bootcamp',
    userId: 'user-3',
    userName: 'مریم فراهانی',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
    rating: 5,
    date: '۱ هفته پیش',
    comment: 'تاکید روی اصول فاصله‌گذاری ریاضی و انتخاب اصولی رنگ‌های خنثی دیدگاه من رو در طراحی تغییر داد. فوق‌العاده کاربردی بود.',
    helpfulCount: 32,
    isVerifiedPurchase: true
  },
  {
    id: 'rev-3',
    courseId: 'course-ai-agents-fullstack',
    userId: 'user-4',
    userName: 'امیرحسین کریمی',
    userAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=300&auto=format&fit=crop',
    rating: 5,
    date: '۴ روز پیش',
    comment: 'بهترین آموزش ساخت ایجنت‌های هوش مصنوعی با تایپ‌اسکریپت و فراخوانی توابع ساخت‌یافته. دکتر رادمنش مفاهیم سخت رو با سادگی و تسلط کامل توضیح می‌دهند.',
    helpfulCount: 29,
    isVerifiedPurchase: true
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'NOROOZ1405',
    discountPercentage: 25,
    expiresAt: '۱۴۰۵/۰۱/۱۵',
    description: '۲۵٪ تخفیف ویژه برای تمام دوره‌های آموزشی'
  },
  {
    code: 'LUMINA50',
    discountPercentage: 50,
    expiresAt: '۱۴۰۴/۱۲/۲۹',
    description: '۵۰٪ تخفیف طلایی ثبت‌نام دوره اول'
  },
  {
    code: 'BAHAR30',
    discountPercentage: 30,
    expiresAt: '۱۴۰۵/۰۲/۳۰',
    description: '۳۰٪ تخفیف جشنواره فصل بهار'
  }
];

export const INITIAL_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'media-vid-1',
    name: 'ویدیو معرفی مسترکلاس طراحی دیزاین سیستم (نسخه 4K).mp4',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop',
    fileSize: '42.8 مگابایت',
    duration: '03:45',
    resolution: '3840×2160 (4K)',
    mimeType: 'video/mp4',
    createdAt: '۱۴۰۴/۱۱/۲۰',
    usedInCoursesCount: 2
  },
  {
    id: 'media-vid-2',
    name: 'جلسه اول: معماری ایجنت‌های هوش مصنوعی با تایپ‌اسکریپت.mp4',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    fileSize: '78.2 مگابایت',
    duration: '22:15',
    resolution: '1920×1080 (FHD)',
    mimeType: 'video/mp4',
    createdAt: '۱۴۰۴/۱۱/۱۸',
    usedInCoursesCount: 1
  },
  {
    id: 'media-img-1',
    name: 'کاور اصلی دوره طراحی UI/UX مدرن.webp',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=300&auto=format&fit=crop',
    fileSize: '1.4 مگابایت',
    resolution: '1920×1080',
    mimeType: 'image/webp',
    createdAt: '۱۴۰۴/۱۱/۱۵',
    usedInCoursesCount: 3
  },
  {
    id: 'media-img-2',
    name: 'کاور مسترکلاس اصلاح رنگ داوینچی ریزالو.webp',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1200&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=300&auto=format&fit=crop',
    fileSize: '2.1 مگابایت',
    resolution: '1920×1080',
    mimeType: 'image/webp',
    createdAt: '۱۴۰۴/۱۱/۱۰',
    usedInCoursesCount: 1
  },
  {
    id: 'media-pdf-1',
    name: 'چیت‌شیت جامع متغیرهای فیگما و توکن‌های دیزاین (Figma Variables Cheatsheet).pdf',
    type: 'pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '8.6 مگابایت',
    mimeType: 'application/pdf',
    createdAt: '۱۴۰۴/۱۱/۰۸',
    usedInCoursesCount: 2
  },
  {
    id: 'media-pdf-2',
    name: 'دفترچه راهنمای مهندسی پرامپت و الگوهای ایجنتیک LLM.pdf',
    type: 'pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '14.2 مگابایت',
    mimeType: 'application/pdf',
    createdAt: '۱۴۰۴/۱۱/۰۴',
    usedInCoursesCount: 1
  },
  {
    id: 'media-aud-1',
    name: 'پادکست آموزشی: ناگفته‌های مصاحبه شغلی دیزاین لید.mp3',
    type: 'audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    fileSize: '18.5 مگابایت',
    duration: '28:30',
    mimeType: 'audio/mpeg',
    createdAt: '۱۴۰۴/۱۰/۲۸',
    usedInCoursesCount: 1
  },
  {
    id: 'media-zip-1',
    name: 'فایل‌های سورس پروژه ری‌اکت و تلویند دیزاین سیستم.zip',
    type: 'download',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '34.8 مگابایت',
    mimeType: 'application/zip',
    createdAt: '۱۴۰۴/۱۰/۲۵',
    usedInCoursesCount: 1
  }
];

export const INITIAL_USER: User = {
  id: 'user-current',
  name: 'مازیار رضایی',
  email: 'maziar.rezaei@luminalearn.ir',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
  role: 'student',
  headline: 'طراح ارشد محصول و توسعه‌دهنده فرانت‌اند',
  bio: 'علاقه‌مند به یادگیری مستمر، طراحی سیستم‌های تعاملی پیشرفته و توسعه وب مدرن.',
  joinedDate: 'آذر ۱۴۰۳',
  enrolledCourseIds: ['course-uiux-bootcamp'],
  wishlistCourseIds: ['course-ai-agents-fullstack', 'course-cinematic-color-grading'],
  followedInstructorIds: ['inst-elena', 'inst-marcus']
};

