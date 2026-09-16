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
    courseCount: 0,
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
    courseCount: 0,
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
    courseCount: 0,
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
    courseCount: 0,
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
    courseCount: 0,
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
    courseCount: 0,
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
    courseCount: 0,
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
    courseCount: 0,
    subCategories: ['کپی‌رایتینگ تبلیغاتی', 'فیلم‌نامه‌نویسی', 'داستان‌سرایی برند', 'نویسندگی مقالات']
  }
];

export const INITIAL_INSTRUCTORS: InstructorProfile[] = [];

export const INITIAL_COURSES: Course[] = [];

export const INITIAL_REVIEWS: CourseReview[] = [];

export const INITIAL_COUPONS: Coupon[] = [];

export const INITIAL_MEDIA_ASSETS: MediaAsset[] = [];

export const INITIAL_TRANSACTIONS: import('../types').WalletTransaction[] = [];

export const INITIAL_DOWNLOADS: import('../types').CourseDownloadItem[] = [];

export const ADMIN_USER: User = {
  id: 'usr_admin_2',
  name: 'مدیر ارشد لومینا',
  email: 'admin@lumina.com',
  phone: '۰۹۱۲۰۰۰۰۰۰۱',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  role: 'admin',
  roles: ['OWNER', 'ADMIN'],
  headline: 'مدیر سیستم و نظارت بر محتوا',
  bio: 'مدیر کل و برنامه‌ریز سیستم‌های یادگیری تخصصی لومینا لرن.',
  joinedDate: 'فروردین ۱۴۰۳',
  walletBalance: 0,
  enrolledCourseIds: [],
  wishlistCourseIds: [],
  followedInstructorIds: []
};

export const INITIAL_USER: User = {
  id: 'usr_admin_2',
  name: 'مدیر ارشد لومینا',
  email: 'admin@lumina.com',
  phone: '۰۹۱۲۰۰۰۰۰۰۱',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  role: 'admin',
  roles: ['OWNER', 'ADMIN'],
  headline: 'مدیر سیستم و نظارت بر محتوا',
  bio: 'مدیر کل و برنامه‌ریز سیستم‌های یادگیری تخصصی لومینا لرن.',
  joinedDate: 'فروردین ۱۴۰۳',
  walletBalance: 0,
  enrolledCourseIds: [],
  wishlistCourseIds: [],
  followedInstructorIds: []
};

export const DEMO_STUDENT_USER: User = {
  ...ADMIN_USER
};

export const INITIAL_INSTRUCTOR_APPLICATIONS: import('../types').InstructorApplication[] = [];
