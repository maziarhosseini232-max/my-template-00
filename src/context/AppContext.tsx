import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  User, UserRole, Course, Category, InstructorProfile, 
  Enrollment, Certificate, CartItem, Coupon, NotificationItem, 
  CourseReview, AppLanguage, AppTheme, MediaAsset, UploadQueueItem, CourseStatus, CourseModule 
} from '../types';
import { 
  INITIAL_CATEGORIES, INITIAL_COURSES, INITIAL_INSTRUCTORS, 
  INITIAL_REVIEWS, INITIAL_COUPONS, INITIAL_USER, INITIAL_MEDIA_ASSETS 
} from '../data/mockData';
import { translations } from '../locales/translations';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface RouteState {
  view: 'home' | 'catalog' | 'course-detail' | 'player' | 'dashboard' | 'instructor' | 'admin' | 'cart' | 'checkout' | 'wishlist' | 'certificates' | 'certificate-verify' | 'instructor-profile' | 'category';
  param?: string; // course slug/id or instructor id or cert id
  id?: string;
  query?: string;
}

interface AppContextType {
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  isRTL: boolean;
  t: (key: keyof typeof translations['en']) => string;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;

  // Routing
  currentRoute: RouteState;
  navigate: (view: RouteState['view'], id?: string, query?: string) => void;

  // Data
  courses: Course[];
  categories: Category[];
  instructors: InstructorProfile[];
  reviews: CourseReview[];
  enrollments: Record<string, Enrollment>;
  certificates: Certificate[];
  notifications: NotificationItem[];
  cart: CartItem[];
  activeCoupon: Coupon | null;
  wishlist: string[];
  mediaAssets: MediaAsset[];
  uploadQueue: UploadQueueItem[];

  // Actions
  addToCart: (course: Course) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addToWishlist: (courseId: string) => void;
  removeFromWishlist: (courseId: string) => void;
  toggleWishlist: (courseId: string) => void;
  isInWishlist: (courseId: string) => boolean;
  isInCart: (courseId: string) => boolean;
  isEnrolled: (courseId: string) => boolean;

  // Learning actions
  enrollCourse: (courseId: string) => void;
  completeLesson: (courseId: string, lessonId: string) => void;
  saveLessonProgress: (courseId: string, lessonId: string, seconds: number) => void;
  addLessonNote: (courseId: string, lessonId: string, lessonTitle: string, timestampSeconds: number, text: string) => void;
  deleteLessonNote: (courseId: string, noteId: string) => void;
  addReview: (courseId: string, rating: number, comment: string) => void;
  claimCertificate: (courseId: string) => Certificate;
  getCertificateByCourse: (courseId: string) => Certificate | undefined;

  // Instructor & Admin actions
  createCourse: (courseData: Partial<Course>) => Course;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  updateCourseStatus: (courseId: string, status: CourseStatus) => void;
  deleteCourse: (courseId: string) => void;
  duplicateCourse: (courseId: string) => Course | undefined;
  importCoursePackage: (courseJson: string) => { success: boolean; message: string; course?: Course };
  exportCoursePackage: (courseId: string) => string;

  // Media Library actions
  addMediaAsset: (asset: Omit<MediaAsset, 'id' | 'createdAt'>) => MediaAsset;
  deleteMediaAsset: (id: string) => void;
  addToUploadQueue: (files: { name: string; fileSize: string; type: MediaAsset['type']; url?: string; duration?: string; resolution?: string }[]) => void;
  updateUploadItem: (id: string, updates: Partial<UploadQueueItem>) => void;
  removeFromUploadQueue: (id: string) => void;
  clearUploadQueue: () => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Search Modal
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;

  // Toasts
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DATA_VERSION = 'lumina_v4_fa_clean';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check version and clear old English caches if needed
  useEffect(() => {
    const currentVersion = localStorage.getItem('lumina_data_version');
    if (currentVersion !== DATA_VERSION) {
      localStorage.removeItem('lumina_courses');
      localStorage.removeItem('lumina_reviews');
      localStorage.removeItem('lumina_enrollments');
      localStorage.removeItem('lumina_user');
      localStorage.setItem('lumina_data_version', DATA_VERSION);
    }
  }, []);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const v = localStorage.getItem('lumina_data_version');
      if (v !== DATA_VERSION) return INITIAL_USER;
      const saved = localStorage.getItem('lumina_user');
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const v = localStorage.getItem('lumina_data_version');
      if (v !== DATA_VERSION) return INITIAL_COURSES;
      const saved = localStorage.getItem('lumina_courses');
      if (!saved) return INITIAL_COURSES;
      const parsed: Course[] = JSON.parse(saved);
      // Extra safety check: if old english titles exist, fallback to INITIAL_COURSES
      if (parsed.some(c => c.title.includes('Modern UI/UX') || c.title.includes('Fullstack'))) {
        return INITIAL_COURSES;
      }
      return parsed;
    } catch {
      return INITIAL_COURSES;
    }
  });

  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [instructors] = useState<InstructorProfile[]>(INITIAL_INSTRUCTORS);
  const [reviews, setReviews] = useState<CourseReview[]>(() => {
    try {
      const v = localStorage.getItem('lumina_data_version');
      if (v !== DATA_VERSION) return INITIAL_REVIEWS;
      const saved = localStorage.getItem('lumina_reviews');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [language, setLanguageState] = useState<AppLanguage>('fa');

  const [theme, setThemeState] = useState<AppTheme>(() => {
    return (localStorage.getItem('lumina_theme') as AppTheme) || 'light';
  });

  const [currentRoute, setCurrentRoute] = useState<RouteState>({ view: 'home' });

  const [enrollments, setEnrollments] = useState<Record<string, Enrollment>>(() => {
    const saved = localStorage.getItem('lumina_enrollments');
    if (saved) return JSON.parse(saved);
    // Seed an initial enrollment for user
    return {
      'course-uiux-bootcamp': {
        courseId: 'course-uiux-bootcamp',
        userId: INITIAL_USER.id,
        enrolledAt: '۱۴۰۴/۱۱/۰۱',
        completedLessonIds: ['les-1-1', 'les-1-2'],
        lastLessonId: 'les-1-3',
        lastPositionSeconds: 420,
        progressPercent: 35,
        notes: [
          {
            id: 'note-1',
            lessonId: 'les-1-1',
            lessonTitle: 'جلسه ۱: آناتومی زیبایی‌شناسی محصولات دیجیتال مدرن',
            timestampSeconds: 145,
            text: 'نکته کلیدی: نسبت‌های مقیاس تایپوگرافی باید با میزان تراکم اطلاعات و ساختار محصول هماهنگ باشند.',
            createdAt: '۱۴۰۴/۱۱/۰۵'
          }
        ]
      }
    };
  });

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const saved = localStorage.getItem('lumina_certs');
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('lumina_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('lumina_wishlist');
    return saved ? JSON.parse(saved) : INITIAL_USER.wishlistCourseIds;
  });

  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      userId: INITIAL_USER.id,
      type: 'announcement',
      title: 'به لومینا لرن خوش آمدید!',
      message: 'به بیش از ۱٬۴۵۰ مسترکلاس تخصصی با تدریس برترین اساتید دسترسی دارید. یادگیری را آغاز کنید.',
      read: false,
      createdAt: 'همین الان'
    },
    {
      id: 'notif-2',
      userId: INITIAL_USER.id,
      type: 'lesson',
      title: 'ادامه یادگیری طراحی UI/UX',
      message: 'جلسه ۳ از فصل اول منتظر شماست. هر زمان مایل بودید ادامه دهید!',
      read: false,
      createdAt: '۲ ساعت پیش'
    }
  ]);

  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(() => {
    try {
      const saved = localStorage.getItem('lumina_media_assets');
      return saved ? JSON.parse(saved) : INITIAL_MEDIA_ASSETS;
    } catch {
      return INITIAL_MEDIA_ASSETS;
    }
  });

  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);

  useEffect(() => {
    localStorage.setItem('lumina_media_assets', JSON.stringify(mediaAssets));
  }, [mediaAssets]);

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('lumina_recent_searches');
    return saved ? JSON.parse(saved) : ['طراحی UI/UX', 'هوش مصنوعی', 'اصلاح رنگ داوینچی', 'ری‌اکت و نکست‌جی‌اس'];
  });

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('lumina_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('lumina_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('lumina_enrollments', JSON.stringify(enrollments));
  }, [enrollments]);

  useEffect(() => {
    localStorage.setItem('lumina_certs', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem('lumina_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('lumina_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('lumina_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('lumina_recent_searches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Set Language & Direction
  const isRTL = language === 'fa';
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('lumina_lang', language);
  }, [language, isRTL]);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
  };

  // Set Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('lumina_theme', theme);
  }, [theme]);

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
  };

  const toggleTheme = () => {
    setThemeState(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      addToast({
        title: nextTheme === 'light' ? 'حالت روشن فعال شد' : 'حالت تاریک فعال شد',
        message: nextTheme === 'light' ? 'پوسته سایت به حالت روز و پس‌زمینه روشن تغییر یافت.' : 'پوسته سایت به حالت شب و پس‌زمینه تیره تغییر یافت.',
        type: 'info'
      });
      return nextTheme;
    });
  };

  // Translation helper
  const t = useCallback((key: keyof typeof translations['en']): string => {
    const dict = translations[language] || translations['en'];
    return dict[key] || translations['en'][key] || String(key);
  }, [language]);

  // Navigation
  const navigate = useCallback((view: RouteState['view'], id?: string, query?: string) => {
    setCurrentRoute({ view, id, query });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Keyboard shortcut for search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toasts
  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(item => item.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(item => item.id !== id));
  }, []);

  // User Role Switcher
  const userRole = currentUser.role;
  const setUserRole = useCallback((role: UserRole) => {
    setCurrentUser(prev => ({ ...prev, role }));
    addToast({
      title: language === 'fa' ? 'تغییر نقش کاربری' : 'Role Switched',
      message: language === 'fa' 
        ? `پنل کاربری به ${role === 'student' ? 'دانشجو' : role === 'instructor' ? 'مدرس' : 'مدیر سیستم'} تغییر یافت.`
        : `Active view updated to ${role.toUpperCase()}`,
      type: 'info'
    });
  }, [language, addToast]);

  // Wishlist actions
  const isInWishlist = useCallback((courseId: string) => {
    return wishlist.includes(courseId);
  }, [wishlist]);

  const addToWishlist = useCallback((courseId: string) => {
    if (!wishlist.includes(courseId)) {
      setWishlist(prev => [...prev, courseId]);
      addToast({
        title: language === 'fa' ? 'افزودن به علاقه‌مندی‌ها' : 'Saved to Wishlist',
        message: language === 'fa' ? 'دوره با موفقیت به لیست علاقه‌مندی‌های شما اضافه شد.' : 'Course added to your wishlist successfully.',
        type: 'success'
      });
    }
  }, [wishlist, language, addToast]);

  const removeFromWishlist = useCallback((courseId: string) => {
    setWishlist(prev => prev.filter(id => id !== courseId));
    addToast({
      title: language === 'fa' ? 'حذف از علاقه‌مندی‌ها' : 'Removed from Wishlist',
      message: language === 'fa' ? 'دوره از لیست علاقه‌مندی‌های شما حذف شد.' : 'Course removed from your wishlist.',
      type: 'info'
    });
  }, [language, addToast]);

  const toggleWishlist = useCallback((courseId: string) => {
    if (isInWishlist(courseId)) {
      removeFromWishlist(courseId);
    } else {
      addToWishlist(courseId);
    }
  }, [isInWishlist, removeFromWishlist, addToWishlist]);

  // Cart actions
  const isInCart = useCallback((courseId: string) => {
    return cart.some(item => item.courseId === courseId);
  }, [cart]);

  const addToCart = useCallback((course: Course) => {
    if (enrollments[course.id]) {
      addToast({
        title: language === 'fa' ? 'قبلاً ثبت‌نام کرده‌اید' : 'Already Enrolled',
        message: language === 'fa' ? 'شما دسترسی مادام‌العمر به این دوره را در حساب خود دارید.' : 'You already have lifetime access to this masterclass.',
        type: 'info'
      });
      return;
    }
    if (!cart.some(item => item.courseId === course.id)) {
      setCart(prev => [...prev, { courseId: course.id, course }]);
      addToast({
        title: language === 'fa' ? 'افزوده شد به سبد خرید' : 'Added to Cart',
        message: language === 'fa' ? `«${course.title}» به سبد خرید شما افزوده شد.` : `"${course.title}" added to your shopping cart.`,
        type: 'success'
      });
    }
  }, [enrollments, cart, language, addToast]);

  const removeFromCart = useCallback((courseId: string) => {
    setCart(prev => prev.filter(item => item.courseId !== courseId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setActiveCoupon(null);
  }, []);

  const applyCoupon = useCallback((code: string) => {
    const found = INITIAL_COUPONS.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (found) {
      setActiveCoupon(found);
      addToast({
        title: language === 'fa' ? 'کد تخفیف اعمال شد!' : 'Coupon Applied!',
        message: language === 'fa' 
          ? `تخفیف ${found.discountPercentage}٪ با کد ${found.code} با موفقیت اعمال گردید.`
          : `Saved ${found.discountPercentage}% off your entire order with code ${found.code}.`,
        type: 'success'
      });
      return { success: true, message: `Applied ${found.discountPercentage}% discount!` };
    } else {
      addToast({
        title: language === 'fa' ? 'کد تخفیف نامعتبر است' : 'Invalid Coupon Code',
        message: language === 'fa' ? 'کد وارد شده معتبر نیست یا منقضی شده است. کد NOROOZ1405 را امتحان کنید.' : 'The promo code entered is either expired or invalid. Try LUMINA2025.',
        type: 'error'
      });
      return { success: false, message: 'Invalid promo code' };
    }
  }, [language, addToast]);

  const removeCoupon = useCallback(() => {
    setActiveCoupon(null);
  }, []);

  // Enrollment checks
  const isEnrolled = useCallback((courseId: string) => {
    return !!enrollments[courseId];
  }, [enrollments]);

  const enrollCourse = useCallback((courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    if (!enrollments[courseId]) {
      const firstModule = course.modules[0];
      const firstLesson = firstModule?.lessons[0];

      const newEnrollment: Enrollment = {
        courseId,
        userId: currentUser.id,
        enrolledAt: new Date().toISOString().split('T')[0],
        completedLessonIds: [],
        lastLessonId: firstLesson ? firstLesson.id : '',
        lastPositionSeconds: 0,
        progressPercent: 0,
        notes: []
      };

      setEnrollments(prev => ({ ...prev, [courseId]: newEnrollment }));
      setCurrentUser(prev => ({
        ...prev,
        enrolledCourseIds: Array.from(new Set([...prev.enrolledCourseIds, courseId]))
      }));

      // Add enrollment notification
      setNotifications(prev => [
        {
          id: Math.random().toString(36).substring(2, 9),
          userId: currentUser.id,
          type: 'enrollment',
          title: `Enrolled in ${course.title}`,
          message: 'Welcome to the masterclass! Start watching your first lesson.',
          read: false,
          createdAt: 'Just now'
        },
        ...prev
      ]);
    }
  }, [courses, enrollments, currentUser.id]);

  // Lesson completion & progress
  const completeLesson = useCallback((courseId: string, lessonId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);

    setEnrollments(prev => {
      const current = prev[courseId] || {
        courseId,
        userId: currentUser.id,
        enrolledAt: new Date().toISOString().split('T')[0],
        completedLessonIds: [],
        lastLessonId: lessonId,
        lastPositionSeconds: 0,
        progressPercent: 0,
        notes: []
      };

      const updatedCompleted = current.completedLessonIds.includes(lessonId)
        ? current.completedLessonIds
        : [...current.completedLessonIds, lessonId];

      const progressPercent = Math.min(100, Math.round((updatedCompleted.length / Math.max(1, totalLessons)) * 100));
      const completedAt = progressPercent === 100 ? new Date().toISOString().split('T')[0] : current.completedAt;

      return {
        ...prev,
        [courseId]: {
          ...current,
          completedLessonIds: updatedCompleted,
          lastLessonId: lessonId,
          progressPercent,
          completedAt
        }
      };
    });

    addToast({
      title: 'Lesson Completed!',
      message: 'Progress tracked and saved to your account.',
      type: 'success'
    });
  }, [courses, currentUser.id, addToast]);

  const saveLessonProgress = useCallback((courseId: string, lessonId: string, seconds: number) => {
    setEnrollments(prev => {
      const current = prev[courseId];
      if (!current) return prev;
      return {
        ...prev,
        [courseId]: {
          ...current,
          lastLessonId: lessonId,
          lastPositionSeconds: Math.round(seconds)
        }
      };
    });
  }, []);

  const addLessonNote = useCallback((courseId: string, lessonId: string, lessonTitle: string, timestampSeconds: number, text: string) => {
    const noteId = Math.random().toString(36).substring(2, 9);
    setEnrollments(prev => {
      const current = prev[courseId];
      if (!current) return prev;
      return {
        ...prev,
        [courseId]: {
          ...current,
          notes: [
            ...current.notes,
            {
              id: noteId,
              lessonId,
              lessonTitle,
              timestampSeconds,
              text,
              createdAt: new Date().toISOString().split('T')[0]
            }
          ]
        }
      };
    });
    addToast({
      title: 'Note Saved',
      message: 'Timestamped note successfully attached to this lesson.',
      type: 'success'
    });
  }, [addToast]);

  const deleteLessonNote = useCallback((courseId: string, noteId: string) => {
    setEnrollments(prev => {
      const current = prev[courseId];
      if (!current) return prev;
      return {
        ...prev,
        [courseId]: {
          ...current,
          notes: current.notes.filter(n => n.id !== noteId)
        }
      };
    });
  }, []);

  const addReview = useCallback((courseId: string, rating: number, comment: string) => {
    const newRev: CourseReview = {
      id: Math.random().toString(36).substring(2, 9),
      courseId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      rating,
      date: 'Just now',
      comment,
      helpfulCount: 0,
      isVerifiedPurchase: true
    };
    setReviews(prev => [newRev, ...prev]);
    addToast({
      title: 'Review Published',
      message: 'Thank you for sharing your experience with fellow students!',
      type: 'success'
    });
  }, [currentUser, addToast]);

  // Certificates
  const claimCertificate = useCallback((courseId: string): Certificate => {
    const course = courses.find(c => c.id === courseId);
    const existing = certificates.find(cert => cert.courseId === courseId);
    if (existing) return existing;

    const certNum = `LUM-${Math.floor(100000 + Math.random() * 900000)}`;
    const newCert: Certificate = {
      id: certNum.toLowerCase(),
      certificateNumber: certNum,
      courseId,
      courseTitle: course?.title || 'Masterclass',
      instructorName: course?.instructorName || 'Master Instructor',
      studentId: currentUser.id,
      studentName: currentUser.name,
      issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      verificationUrl: `${window.location.origin}?verify=${certNum}`,
      skills: course?.tags || ['Professional Mastery', 'Curriculum Execution'],
      gradeScore: '98% Mastery'
    };

    setCertificates(prev => [newCert, ...prev]);
    setEnrollments(prev => {
      if (!prev[courseId]) return prev;
      return {
        ...prev,
        [courseId]: {
          ...prev[courseId],
          certificateId: newCert.id
        }
      };
    });

    addToast({
      title: 'Official Certificate Issued!',
      message: 'Your verifiable completion credential is now active.',
      type: 'success'
    });

    return newCert;
  }, [courses, certificates, currentUser, addToast]);

  const getCertificateByCourse = useCallback((courseId: string) => {
    return certificates.find(c => c.courseId === courseId);
  }, [certificates]);

  // Instructor & Admin actions
  const createCourse = useCallback((courseData: Partial<Course>): Course => {
    const id = `course-${Math.random().toString(36).substring(2, 9)}`;
    const newCourse: Course = {
      id,
      slug: (courseData.title || 'new-course').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: courseData.title || 'Untitled Masterclass',
      subtitle: courseData.subtitle || 'Comprehensive practical course curriculum',
      description: courseData.description || 'Full immersive course description with project outcomes.',
      categoryId: courseData.categoryId || 'design',
      categoryName: courseData.categoryName || 'Design & Creative Arts',
      subCategory: courseData.subCategory || 'General',
      thumbnail: courseData.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop',
      previewVideoUrl: courseData.previewVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      instructorId: currentUser.id,
      instructorName: currentUser.name,
      instructorAvatar: currentUser.avatar,
      instructorTitle: currentUser.headline || 'Senior Instructor',
      price: courseData.price || 49,
      originalPrice: courseData.originalPrice || 99,
      discountPercentage: 50,
      rating: 5.0,
      reviewCount: 0,
      studentCount: 0,
      durationHours: courseData.durationHours || 6.5,
      lessonCount: courseData.modules?.reduce((acc, m) => acc + m.lessons.length, 0) || 12,
      level: courseData.level || 'Intermediate',
      language: courseData.language || 'English',
      hasCertificate: true,
      isPublished: false,
      publishedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      whatYouWillLearn: courseData.whatYouWillLearn || ['Master advanced core concepts', 'Build real-world capstones'],
      requirements: courseData.requirements || ['Basic computer literacy'],
      targetAudience: courseData.targetAudience || ['Ambitious creative professionals'],
      modules: courseData.modules || [
        {
          id: 'mod-init-1',
          title: 'Module 1: Introduction & Foundations',
          lessons: [
            {
              id: 'les-init-1',
              title: '01. Welcome & Course Overview',
              durationMinutes: 12,
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              isPreviewFree: true
            }
          ]
        }
      ],
      faqs: courseData.faqs || [],
      tags: courseData.tags || ['Masterclass'],
      status: 'pending' // Send to admin moderation queue
    };

    setCourses(prev => [newCourse, ...prev]);
    addToast({
      title: language === 'fa' ? 'دوره ذخیره شد' : 'Course Created!',
      message: language === 'fa' ? `دوره «${newCourse.title}» با موفقیت در سیستم ثبت گردید.` : 'Submitted to Admin Studio catalog.',
      type: 'success'
    });
    return newCourse;
  }, [currentUser, language, addToast]);

  const updateCourse = useCallback((courseId: string, updates: Partial<Course>) => {
    setCourses(prev => prev.map(c => (c.id === courseId ? { ...c, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : c)));
    addToast({
      title: language === 'fa' ? 'تغییرات ذخیره شد' : 'Course Updated',
      message: language === 'fa' ? 'تمامی اطلاعات دوره با موفقیت به‌روزرسانی شدند.' : 'All changes saved successfully.',
      type: 'success'
    });
  }, [language, addToast]);

  const updateCourseStatus = useCallback((courseId: string, status: CourseStatus) => {
    setCourses(prev => prev.map(c => (c.id === courseId ? { ...c, status, isPublished: status === 'published' } : c)));
    const statusFaMap: Record<CourseStatus, string> = {
      published: 'منتشرشده',
      draft: 'پیش‌نویس',
      pending: 'در حال بررسی',
      disabled: 'غیرفعال',
      archived: 'آرشیوشده'
    };
    addToast({
      title: language === 'fa' ? 'وضعیت دوره تغییر کرد' : 'Status Updated',
      message: language === 'fa' 
        ? `وضعیت دوره به «${statusFaMap[status] || status}» تغییر یافت.` 
        : `Course marked as ${status.toUpperCase()}`,
      type: 'info'
    });
  }, [language, addToast]);

  const deleteCourse = useCallback((courseId: string) => {
    const target = courses.find(c => c.id === courseId);
    setCourses(prev => prev.filter(c => c.id !== courseId));
    addToast({
      title: language === 'fa' ? 'دوره حذف شد' : 'Course Deleted',
      message: language === 'fa' 
        ? `دوره «${target?.title || ''}» به طور کامل از کاتالوگ حذف گردید.` 
        : 'Course has been permanently removed.',
      type: 'warning'
    });
  }, [courses, language, addToast]);

  const duplicateCourse = useCallback((courseId: string): Course | undefined => {
    const source = courses.find(c => c.id === courseId);
    if (!source) return undefined;

    const newId = `course-${Math.random().toString(36).substring(2, 9)}`;
    const clonedModules: CourseModule[] = source.modules.map(mod => ({
      ...mod,
      id: `mod-${Math.random().toString(36).substring(2, 8)}`,
      lessons: mod.lessons.map(les => ({
        ...les,
        id: `les-${Math.random().toString(36).substring(2, 8)}`
      }))
    }));

    const duplicated: Course = {
      ...source,
      id: newId,
      slug: `${source.slug}-copy-${Math.floor(100 + Math.random() * 900)}`,
      title: language === 'fa' ? `${source.title} (نسخه کپی)` : `${source.title} (Copy)`,
      status: 'draft',
      isPublished: false,
      studentCount: 0,
      rating: 5.0,
      reviewCount: 0,
      publishedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      modules: clonedModules
    };

    setCourses(prev => [duplicated, ...prev]);
    addToast({
      title: language === 'fa' ? 'نسخه کپی ایجاد شد' : 'Course Duplicated',
      message: language === 'fa' 
        ? `نسخه جدید از «${source.title}» در قالب پیش‌نویس آماده ویرایش است.` 
        : `Duplicated "${source.title}" into a new draft course.`,
      type: 'success'
    });
    return duplicated;
  }, [courses, language, addToast]);

  const importCoursePackage = useCallback((courseJson: string) => {
    try {
      const parsed = JSON.parse(courseJson);
      if (!parsed.title) {
        return { success: false, message: language === 'fa' ? 'فایل نامعتبر است؛ عنوان دوره یافت نشد.' : 'Invalid course package JSON.' };
      }
      const newId = `course-${Math.random().toString(36).substring(2, 9)}`;
      const imported: Course = {
        ...parsed,
        id: newId,
        slug: parsed.slug || (parsed.title || 'imported').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        status: 'draft',
        isPublished: false,
        studentCount: parsed.studentCount || 0,
        rating: parsed.rating || 5.0,
        reviewCount: parsed.reviewCount || 0,
        publishedAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        modules: parsed.modules || []
      };

      setCourses(prev => [imported, ...prev]);
      addToast({
        title: language === 'fa' ? 'بسته دوره وارد شد' : 'Course Imported',
        message: language === 'fa' ? `دوره «${imported.title}» با موفقیت به سیستم اضافه شد.` : `Imported "${imported.title}" successfully.`,
        type: 'success'
      });
      return { success: true, message: 'Course imported successfully', course: imported };
    } catch {
      return { success: false, message: language === 'fa' ? 'خطا در خواندن فایل ساختار JSON دوره.' : 'Invalid JSON file format.' };
    }
  }, [language, addToast]);

  const exportCoursePackage = useCallback((courseId: string): string => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return '{}';
    return JSON.stringify(course, null, 2);
  }, [courses]);

  // Media Library helpers
  const addMediaAsset = useCallback((asset: Omit<MediaAsset, 'id' | 'createdAt'>): MediaAsset => {
    const newAsset: MediaAsset = {
      ...asset,
      id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: '۱۴۰۴/۱۱/۲۸'
    };
    setMediaAssets(prev => [newAsset, ...prev]);
    addToast({
      title: language === 'fa' ? 'رسانه ثبت شد' : 'Media Added',
      message: language === 'fa' ? `فایل «${newAsset.name}» به کتابخانه رسانه‌ها افزوده شد.` : `"${newAsset.name}" added to media library.`,
      type: 'success'
    });
    return newAsset;
  }, [language, addToast]);

  const deleteMediaAsset = useCallback((id: string) => {
    setMediaAssets(prev => prev.filter(m => m.id !== id));
    addToast({
      title: language === 'fa' ? 'فایل حذف شد' : 'File Removed',
      message: language === 'fa' ? 'رسانه از کتابخانه حذف گردید.' : 'Media asset deleted.',
      type: 'info'
    });
  }, [language, addToast]);

  const addToUploadQueue = useCallback((files: { name: string; fileSize: string; type: MediaAsset['type']; url?: string; duration?: string; resolution?: string }[]) => {
    const newItems: UploadQueueItem[] = files.map((f, idx) => ({
      id: `up-${Date.now()}-${idx}`,
      name: f.name,
      fileSize: f.fileSize,
      type: f.type,
      progress: 0,
      status: 'queued',
      url: f.url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop',
      duration: f.duration,
      resolution: f.resolution
    }));

    setUploadQueue(prev => [...prev, ...newItems]);

    // Simulate realistic progressive uploading and processing
    newItems.forEach((item, index) => {
      setTimeout(() => {
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'uploading', progress: 15 } : q));
      }, 400 * (index + 1));

      setTimeout(() => {
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, progress: 65 } : q));
      }, 1000 * (index + 1));

      setTimeout(() => {
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, progress: 100, status: 'processing' } : q));
      }, 1600 * (index + 1));

      setTimeout(() => {
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'ready' } : q));
        // Add to media assets
        setMediaAssets(prev => {
          if (prev.some(m => m.name === item.name)) return prev;
          return [
            {
              id: `media-${Date.now()}-${index}`,
              name: item.name,
              type: item.type,
              url: item.url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop',
              thumbnailUrl: item.type === 'video' ? 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop' : undefined,
              fileSize: item.fileSize,
              duration: item.duration || (item.type === 'video' ? '14:20' : undefined),
              resolution: item.resolution || (item.type === 'video' ? '1920×1080 (FHD)' : undefined),
              mimeType: item.type === 'video' ? 'video/mp4' : item.type === 'image' ? 'image/webp' : 'application/pdf',
              createdAt: 'همین الان',
              usedInCoursesCount: 0
            },
            ...prev
          ];
        });
      }, 2300 * (index + 1));
    });
  }, []);

  const updateUploadItem = useCallback((id: string, updates: Partial<UploadQueueItem>) => {
    setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const removeFromUploadQueue = useCallback((id: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearUploadQueue = useCallback(() => {
    setUploadQueue([]);
  }, []);

  // Notifications
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Search History
  const addRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    setRecentSearches(prev => [term, ...prev.filter(t => t.toLowerCase() !== term.toLowerCase())].slice(0, 8));
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  const value = useMemo(() => ({
    currentUser,
    setCurrentUser,
    userRole,
    setUserRole,
    language,
    setLanguage,
    isRTL,
    t,
    theme,
    setTheme,
    toggleTheme,
    currentRoute,
    navigate,
    courses,
    categories,
    instructors,
    reviews,
    enrollments,
    certificates,
    notifications,
    cart,
    activeCoupon,
    wishlist,
    mediaAssets,
    uploadQueue,
    addToCart,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    isInCart,
    isEnrolled,
    enrollCourse,
    completeLesson,
    saveLessonProgress,
    addLessonNote,
    deleteLessonNote,
    addReview,
    claimCertificate,
    getCertificateByCourse,
    createCourse,
    updateCourse,
    updateCourseStatus,
    deleteCourse,
    duplicateCourse,
    importCoursePackage,
    exportCoursePackage,
    addMediaAsset,
    deleteMediaAsset,
    addToUploadQueue,
    updateUploadItem,
    removeFromUploadQueue,
    clearUploadQueue,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    searchModalOpen,
    setSearchModalOpen,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    toasts,
    addToast,
    removeToast
  }), [
    currentUser, userRole, setUserRole, language, isRTL, t, theme, currentRoute, navigate,
    courses, categories, instructors, reviews, enrollments, certificates, notifications,
    cart, activeCoupon, wishlist, mediaAssets, uploadQueue, addToCart, removeFromCart, clearCart, applyCoupon,
    removeCoupon, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist,
    isInCart, isEnrolled, enrollCourse, completeLesson, saveLessonProgress, addLessonNote,
    deleteLessonNote, addReview, claimCertificate, getCertificateByCourse, createCourse,
    updateCourse, updateCourseStatus, deleteCourse, duplicateCourse, importCoursePackage,
    exportCoursePackage, addMediaAsset, deleteMediaAsset, addToUploadQueue, updateUploadItem,
    removeFromUploadQueue, clearUploadQueue, markNotificationAsRead,
    markAllNotificationsAsRead, searchModalOpen, recentSearches, addRecentSearch,
    clearRecentSearches, toasts, addToast, removeToast
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
