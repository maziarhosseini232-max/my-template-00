import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  User, UserRole, Course, Category, InstructorProfile, 
  Enrollment, Certificate, CartItem, Coupon, NotificationItem, 
  CourseReview, AppLanguage, AppTheme, MediaAsset, UploadQueueItem, CourseStatus, CourseModule,
  InstructorApplication, WalletTransaction, CourseDownloadItem,
  SiteSetting
} from '../types';
import { 
  INITIAL_CATEGORIES, INITIAL_COURSES, INITIAL_INSTRUCTORS, 
  INITIAL_REVIEWS, INITIAL_COUPONS, INITIAL_USER, ADMIN_USER, DEMO_STUDENT_USER, 
  INITIAL_INSTRUCTOR_APPLICATIONS, INITIAL_MEDIA_ASSETS,
  INITIAL_TRANSACTIONS, INITIAL_DOWNLOADS
} from '../data/mockData';
import { translations } from '../locales/translations';
import { api } from '../services/api';
import { GUEST_USER, mapServerUserToClientUser, getStoredAuthToken } from '../utils/auth';
import { toLatinDigits } from '../utils/persian';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface RouteState {
  view: 'home' | 'catalog' | 'course-detail' | 'player' | 'dashboard' | 'instructor' | 'admin' | 'cart' | 'checkout' | 'wishlist' | 'certificates' | 'certificate-verify' | 'instructor-profile' | 'category' | 'payment' | 'admin-login' | 'vip' | 'pricing' | 'mock-gateway';
  param?: string; // course slug/id or instructor id or cert id or order id
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

  // Authentication & Profile
  isLoggedIn: boolean;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register' | 'forgot';
  setAuthModalTab: (tab: 'login' | 'register' | 'forgot') => void;
  openAuthModal: (tab?: 'login' | 'register' | 'forgot') => void;
  login: (emailOrPhone: string, password: string) => Promise<{ success: boolean; message: string }>;
  registerUser: (data: { name: string; email: string; phone?: string; password: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loginAsDemo: (type: 'admin' | 'student') => Promise<{ success: boolean; message: string }>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  changeUserPassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;

  // Instructor Applications (Request to become instructor)
  instructorApplications: InstructorApplication[];
  submitInstructorApplication: (data: { expertise: string; experienceYears: string; phone: string; sampleUrl?: string; proposedTopic?: string; bio: string }) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  updateInstructorApplicationStatus: (appId: string, status: InstructorApplication['status']) => void;

  // Site Settings & Feature Toggles
  siteSettings: SiteSetting | null;
  isInstructorRegistrationEnabled: boolean;
  isAlacarteSaleEnabled: boolean;
  updateSiteSettings: (updates: Partial<SiteSetting>) => Promise<boolean>;
  toggleInstructorRegistration: (enabled: boolean) => Promise<boolean>;
  toggleAlacarteSale: (enabled: boolean) => Promise<boolean>;
  fetchSiteSettings: () => Promise<void>;

  // Routing
  currentRoute: RouteState;
  navigate: (view: RouteState['view'], id?: string, query?: string) => void;

  // Wallet & Financial
  walletBalance: number;
  transactions: WalletTransaction[];
  chargeWallet: (amount: number, gateway?: string) => { success: boolean; trackingCode: string };

  // Downloads & Resources
  downloads: CourseDownloadItem[];
  addDownloadResource: (item: Omit<CourseDownloadItem, 'id' | 'addedDate'>) => void;

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
  enrollInCourse: (courseId: string) => Promise<{ success: boolean; message: string; isNew?: boolean }>;
  fetchMyEnrollments: () => Promise<void>;
  archiveCourse: (courseId: string) => Promise<boolean>;
  dropCourse: (courseId: string) => Promise<boolean>;

  // Learning actions
  enrollCourse: (courseId: string) => void;
  completeLesson: (courseId: string, lessonId: string) => void;
  updateLessonProgress: (courseId: string, lessonId: string, isCompleted: boolean, positionSeconds?: number) => void;
  saveLessonProgress: (courseId: string, lessonId: string, seconds: number) => void;
  addLessonNote: (courseId: string, lessonId: string, lessonTitle: string, timestampSeconds: number, text: string) => void;
  addNote: (courseId: string, note: { lessonId: string; timestampSeconds: number; text: string; lessonTitle?: string }) => void;
  deleteLessonNote: (courseId: string, noteId: string) => void;
  deleteNote: (courseId: string, noteId: string) => void;
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

const DATA_VERSION = 'lumina_v5_clean_slate';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check version and clear all test data caches for production clean slate
  useEffect(() => {
    const currentVersion = localStorage.getItem('lumina_data_version');
    if (currentVersion !== DATA_VERSION) {
      localStorage.removeItem('lumina_courses');
      localStorage.removeItem('lumina_reviews');
      localStorage.removeItem('lumina_enrollments');
      localStorage.removeItem('lumina_user');
      localStorage.removeItem('lumina_auth_token');
      localStorage.removeItem('lumina_cart');
      localStorage.removeItem('lumina_wishlist');
      localStorage.removeItem('lumina_certs');
      localStorage.removeItem('lumina_wallet_txns');
      localStorage.removeItem('lumina_instructor_apps');
      localStorage.setItem('lumina_data_version', DATA_VERSION);
    }
  }, []);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const token = getStoredAuthToken();
      if (!token) return GUEST_USER;
      const saved = localStorage.getItem('lumina_user');
      return saved ? JSON.parse(saved) : GUEST_USER;
    } catch {
      return GUEST_USER;
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

  const [currentRoute, setCurrentRoute] = useState<RouteState>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
      const search = window.location.search;

      if (pathname === '/lumina-secure-portal') {
        return { view: 'admin-login' };
      }

      if (pathname === '/vip' || pathname === '/pricing') {
        return { view: 'vip' };
      }

      if (pathname === '/mock-gateway' || pathname.startsWith('/mock-gateway')) {
        return { view: 'mock-gateway' };
      }

      // If user tries to directly enter /admin, /studio or ?tab=studio
      if (pathname === '/admin' || pathname === '/studio' || search.includes('tab=studio')) {
        try {
          const userStr = localStorage.getItem('lumina_user');
          const token = localStorage.getItem('lumina_auth_token');
          if (userStr && token) {
            const u = JSON.parse(userStr);
            const isAdmin = Boolean(
              u.roles?.includes('ADMIN') || u.roles?.includes('OWNER') || u.role === 'admin'
            );
            if (isAdmin) {
              return { view: 'admin' };
            }
          }
        } catch (e) {}

        // Non-admin or unauthenticated guest: immediately divert to home with no indication of admin panel
        if (typeof window !== 'undefined' && window.history?.replaceState) {
          window.history.replaceState(null, '', '/');
        }
        return { view: 'home' };
      }
    }
    return { view: 'home' };
  });

  const [enrollments, setEnrollments] = useState<Record<string, Enrollment>>(() => {
    const saved = localStorage.getItem('lumina_enrollments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('lumina_enrollments', JSON.stringify(enrollments));
  }, [enrollments]);

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const saved = localStorage.getItem('lumina_certs');
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('lumina_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const wishlist: string[] = [];

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

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const token = getStoredAuthToken();
    return !!token;
  });

  // Restore authenticated session from backend on startup
  useEffect(() => {
    const token = getStoredAuthToken();
    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    let isMounted = true;
    api.auth.getMe()
      .then(res => {
        if (!isMounted) return;
        if (res.success && res.data) {
          const clientUser = mapServerUserToClientUser(res.data);
          setCurrentUser(clientUser);
          setIsLoggedIn(true);
          localStorage.setItem('lumina_user', JSON.stringify(clientUser));
          // Load real enrollments from backend
          api.enrollments.getMyEnrollments()
            .then(enrRes => {
              if (!isMounted) return;
              if (enrRes && enrRes.data && Array.isArray(enrRes.data)) {
                const map: Record<string, Enrollment> = {};
                const enrolledIds: string[] = [];
                enrRes.data.forEach((item: any) => {
                  const cId = item.courseId;
                  enrolledIds.push(cId);
                  map[cId] = {
                    courseId: cId,
                    userId: item.userId,
                    enrolledAt: item.enrolledAt,
                    completedLessonIds: [],
                    lastLessonId: '',
                    lastPositionSeconds: 0,
                    progressPercent: item.progress?.progressPercent || 0,
                    notes: []
                  };
                });
                setEnrollments(prev => ({ ...prev, ...map }));
                setCurrentUser(prev => ({
                  ...prev,
                  enrolledCourseIds: Array.from(new Set([...prev.enrolledCourseIds, ...enrolledIds]))
                }));
              }
            })
            .catch(e => console.warn('Enrollment fetch warning:', e));
        } else {
          api.auth.logout();
          setIsLoggedIn(false);
          setCurrentUser(GUEST_USER);
          localStorage.removeItem('lumina_user');
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.warn('Session verification note:', err?.message);
        api.auth.logout();
        setIsLoggedIn(false);
        setCurrentUser(GUEST_USER);
        localStorage.removeItem('lumina_user');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');

  const [instructorApplications, setInstructorApplications] = useState<InstructorApplication[]>(() => {
    try {
      const saved = localStorage.getItem('lumina_instructor_apps');
      return saved ? JSON.parse(saved) : INITIAL_INSTRUCTOR_APPLICATIONS;
    } catch {
      return INITIAL_INSTRUCTOR_APPLICATIONS;
    }
  });

  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('lumina_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [downloads, setDownloads] = useState<CourseDownloadItem[]>(() => {
    try {
      const saved = localStorage.getItem('lumina_downloads');
      return saved ? JSON.parse(saved) : INITIAL_DOWNLOADS;
    } catch {
      return INITIAL_DOWNLOADS;
    }
  });

  useEffect(() => {
    localStorage.setItem('lumina_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('lumina_downloads', JSON.stringify(downloads));
  }, [downloads]);

  useEffect(() => {
    localStorage.setItem('lumina_instructor_apps', JSON.stringify(instructorApplications));
  }, [instructorApplications]);

  useEffect(() => {
    localStorage.setItem('lumina_is_logged_in', isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

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

  // Sync with backend courses on startup
  useEffect(() => {
    api.courses.getAll()
      .then(res => {
        if (res && res.data && Array.isArray(res.data)) {
          setCourses(res.data);
        }
      })
      .catch(err => {
        console.warn('Could not fetch courses from backend API, using local state:', err);
      });
  }, []);

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
    localStorage.removeItem('lumina_wishlist');
  }, []);

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

  // Navigation with Admin Guard & URL Synchronization
  const navigate = useCallback((view: RouteState['view'], id?: string, query?: string) => {
    // If attempting to access admin without actual admin authorization
    if (view === 'admin') {
      const storedUser = localStorage.getItem('lumina_user');
      let isAdmin = false;
      try {
        if (storedUser) {
          const u = JSON.parse(storedUser);
          isAdmin = Boolean(u.roles?.includes('ADMIN') || u.roles?.includes('OWNER') || u.role === 'admin');
        }
      } catch (e) {
        isAdmin = false;
      }

      if (!isAdmin) {
        setCurrentRoute({ view: 'home' });
        if (typeof window !== 'undefined' && window.history?.replaceState) {
          window.history.replaceState(null, '', '/');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setCurrentRoute({ view, id, query });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (typeof window !== 'undefined' && window.history?.pushState) {
      if (view === 'admin-login') {
        if (window.location.pathname !== '/lumina-secure-portal') {
          window.history.pushState(null, '', '/lumina-secure-portal');
        }
      } else if (view === 'admin') {
        if (window.location.pathname !== '/admin') {
          window.history.pushState(null, '', '/admin');
        }
      } else if (view === 'vip' || view === 'pricing') {
        if (window.location.pathname !== '/vip') {
          window.history.pushState(null, '', '/vip');
        }
      } else if (view === 'mock-gateway' || view === 'payment') {
        if (!window.location.pathname.startsWith('/mock-gateway')) {
          window.history.pushState(null, '', '/mock-gateway' + (query ? `?${query}` : ''));
        }
      } else if (view === 'home') {
        if (window.location.pathname !== '/') {
          window.history.pushState(null, '', '/');
        }
      }
    }
  }, []);

  // PopState listener for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
      const search = window.location.search;

      if (pathname === '/lumina-secure-portal') {
        setCurrentRoute({ view: 'admin-login' });
      } else if (pathname === '/mock-gateway' || pathname.startsWith('/mock-gateway')) {
        setCurrentRoute({ view: 'mock-gateway' });
      } else if (pathname === '/admin' || pathname === '/studio' || search.includes('tab=studio')) {
        const storedUser = localStorage.getItem('lumina_user');
        let isAdmin = false;
        try {
          if (storedUser) {
            const u = JSON.parse(storedUser);
            isAdmin = Boolean(u.roles?.includes('ADMIN') || u.roles?.includes('OWNER') || u.role === 'admin');
          }
        } catch (e) {
          isAdmin = false;
        }

        if (isAdmin) {
          setCurrentRoute({ view: 'admin' });
        } else {
          window.history.replaceState(null, '', '/');
          setCurrentRoute({ view: 'home' });
        }
      } else if (pathname === '/vip' || pathname === '/pricing') {
        setCurrentRoute({ view: 'vip' });
      } else if (pathname === '/' || pathname === '') {
        setCurrentRoute({ view: 'home' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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

  // Site Settings & Feature Toggles
  const [siteSettings, setSiteSettings] = useState<SiteSetting | null>(null);

  const fetchSiteSettings = useCallback(async () => {
    try {
      const res = await api.cms.getSettings();
      if (res.success && res.data) {
        setSiteSettings(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch site settings:', err);
    }
  }, []);

  useEffect(() => {
    fetchSiteSettings();
  }, [fetchSiteSettings]);

  const isInstructorRegistrationEnabled = Boolean(siteSettings?.isInstructorRegistrationEnabled);
  const isAlacarteSaleEnabled = Boolean(siteSettings?.isAlacarteSaleEnabled);

  const updateSiteSettings = useCallback(async (updates: Partial<SiteSetting>) => {
    try {
      const res = await api.cms.updateSettings(updates);
      if (res.success && res.data) {
        setSiteSettings(res.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update site settings:', err);
      return false;
    }
  }, []);

  const toggleInstructorRegistration = useCallback(async (enabled: boolean) => {
    const success = await updateSiteSettings({ isInstructorRegistrationEnabled: enabled });
    if (success) {
      addToast({
        title: enabled ? 'ثبت‌نام مدرسین فعال شد' : 'ثبت‌نام مدرسین غیرفعال شد',
        message: enabled
          ? 'امکان ارسال درخواست تدریس برای عموم کاربران فعال گردید.'
          : 'منوها و فرم‌های درخواست مدرسی از دید دانشجویان مخفی شد.',
        type: 'info'
      });
    }
    return success;
  }, [updateSiteSettings, addToast]);

  const toggleAlacarteSale = useCallback(async (enabled: boolean) => {
    const success = await updateSiteSettings({ isAlacarteSaleEnabled: enabled });
    if (success) {
      addToast({
        title: enabled ? 'فروش تکی دوره‌ها فعال شد' : 'فروش تکی دوره‌ها غیرفعال شد',
        message: enabled
          ? 'امکان خرید تکی دوره‌ها در سایت فعال گردید.'
          : 'فروش تکی دوره‌ها در سایت مخفی شد (دسترسی فقط با اشتراک VIP).',
        type: 'info'
      });
    }
    return success;
  }, [updateSiteSettings, addToast]);

  // User Role Switcher (Guarded: Only ADMIN or OWNER can switch views/impersonate)
  const userRole = currentUser.role;
  const setUserRole = useCallback((role: UserRole) => {
    const isActualAdmin = Boolean(
      currentUser &&
      (currentUser.roles?.some(r => r === 'ADMIN' || r === 'OWNER') ||
       (currentUser.role === 'admin' && (!currentUser.roles || currentUser.roles.length === 0)))
    );

    if (!isActualAdmin) {
      return;
    }

    setCurrentUser(prev => ({ ...prev, role }));
    addToast({
      title: language === 'fa' ? 'تغییر نقش کاربری' : 'Role Switched',
      message: language === 'fa' 
        ? `دیدگاه به ${role === 'student' ? 'دانشجو' : role === 'instructor' ? 'مدرس' : 'مدیر سیستم'} تغییر یافت.`
        : `Active view updated to ${role.toUpperCase()}`,
      type: 'info'
    });
  }, [currentUser, language, addToast]);

  const openAuthModal = useCallback((tab: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  }, []);

  const fetchMyEnrollments = useCallback(async () => {
    if (!getStoredAuthToken()) return;
    try {
      const res = await api.enrollments.getMyEnrollments();
      if (res && res.data && Array.isArray(res.data)) {
        const map: Record<string, Enrollment> = {};
        const enrolledIds: string[] = [];
        res.data.forEach((item: any) => {
          const cId = item.courseId;
          enrolledIds.push(cId);
          map[cId] = {
            courseId: cId,
            userId: item.userId,
            enrolledAt: item.enrolledAt,
            completedLessonIds: [],
            lastLessonId: '',
            lastPositionSeconds: 0,
            progressPercent: item.progress?.progressPercent || 0,
            notes: []
          };
        });
        setEnrollments(prev => ({ ...prev, ...map }));
        setCurrentUser(prev => ({
          ...prev,
          enrolledCourseIds: Array.from(new Set([...prev.enrolledCourseIds, ...enrolledIds]))
        }));
      }
    } catch (err) {
      console.warn('[Fetch Enrollments Warning]:', err);
    }
  }, []);

  const login = useCallback(async (emailOrPhone: string, password: string): Promise<{ success: boolean; message: string }> => {
    const rawIdentifier = (emailOrPhone || '').trim();
    const normalizedIdentifier = toLatinDigits(rawIdentifier);
    if (!normalizedIdentifier || !password) {
      return { success: false, message: 'لطفاً ایمیل/شماره موبایل و رمز عبور را وارد کنید.' };
    }

    try {
      const res = await api.auth.login(normalizedIdentifier, password);
      if (res.success && res.data?.user) {
        const clientUser = mapServerUserToClientUser(res.data.user);
        setCurrentUser(clientUser);
        setIsLoggedIn(true);
        localStorage.setItem('lumina_user', JSON.stringify(clientUser));
        setAuthModalOpen(false);
        await fetchMyEnrollments();
        addToast({
          title: 'ورود موفق به حساب 🎉',
          message: `خوش آمدید ${clientUser.name}! ورود شما به پلتفرم لومینا با موفقیت انجام شد.`,
          type: 'success'
        });
        return { success: true, message: 'ورود موفقیت‌آمیز بود.' };
      }
      return { success: false, message: res.message || 'ایمیل یا کلمه عبور وارد شده اشتباه است.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'خطا در برقراری ارتباط با سرور.' };
    }
  }, [addToast, fetchMyEnrollments]);

  const registerUser = useCallback(async (data: { name: string; email: string; phone?: string; password: string }): Promise<{ success: boolean; message: string }> => {
    if (!data.name.trim() || !data.email.trim() || !data.password) {
      return { success: false, message: 'لطفاً تمامی فیلدهای الزامی را پر کنید.' };
    }

    try {
      const res = await api.auth.register({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || undefined,
        password: data.password
      });
      if (res.success && res.data?.user) {
        const clientUser = mapServerUserToClientUser(res.data.user);
        setCurrentUser(clientUser);
        setIsLoggedIn(true);
        localStorage.setItem('lumina_user', JSON.stringify(clientUser));
        setAuthModalOpen(false);
        await fetchMyEnrollments();
        addToast({
          title: 'حساب شما ایجاد شد 🎉',
          message: `ثبت‌نام شما با موفقیت انجام شد، ${clientUser.name}. به جامعه متخصصان لومینا لرن خوش آمدید!`,
          type: 'success'
        });
        return { success: true, message: 'ثبت‌نام موفقیت‌آمیز بود.' };
      }
      return { success: false, message: res.message || 'خطا در ایجاد حساب کاربری.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'خطا در برقراری ارتباط با سرور.' };
    }
  }, [addToast, fetchMyEnrollments]);

  const logout = useCallback(() => {
    api.auth.logout();
    setIsLoggedIn(false);
    setCurrentUser(GUEST_USER);
    setEnrollments({});
    localStorage.removeItem('lumina_user');
    localStorage.removeItem('lumina_is_logged_in');
    localStorage.removeItem('lumina_enrollments');
    if (currentRoute.view === 'admin' || currentRoute.view === 'instructor' || currentRoute.view === 'dashboard') {
      setCurrentRoute({ view: 'home' });
    }
    addToast({
      title: 'خروج از حساب کاربری',
      message: 'شما با موفقیت از حساب کاربری خود خارج شدید.',
      type: 'info'
    });
  }, [currentRoute.view, addToast]);

  const loginAsDemo = useCallback(async (type: 'admin' | 'student'): Promise<{ success: boolean; message: string }> => {
    return login('admin@lumina.com', '123456');
  }, [login]);

  const updateUserProfile = useCallback(async (updates: Partial<User>) => {
    try {
      const res = await api.auth.updateProfile(updates);
      if (res.success && res.data) {
        const updated = mapServerUserToClientUser(res.data);
        setCurrentUser(prev => {
          const merged = { ...prev, ...updated };
          localStorage.setItem('lumina_user', JSON.stringify(merged));
          return merged;
        });
        addToast({
          title: 'مشخصات به‌روزرسانی شد',
          message: 'تغییرات نام و پروفایل کاربری شما با موفقیت در سرور ذخیره گردید.',
          type: 'success'
        });
      }
    } catch (err: any) {
      addToast({
        title: 'خطا در ویرایش مشخصات',
        message: err.message || 'ذخیره مشخصات با خطا مواجه شد.',
        type: 'error'
      });
    }
  }, [addToast]);

  const changeUserPassword = useCallback(async (currentPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    if (!currentPass || !newPass) {
      return { success: false, message: 'لطفاً کلمه عبور فعلی و جدید را وارد فرمایید.' };
    }
    if (newPass.length < 6) {
      return { success: false, message: 'کلمه عبور جدید باید حداقل ۶ کاراکتر باشد.' };
    }
    
    try {
      const res = await api.auth.changePassword(currentPass, newPass);
      if (res.success) {
        addToast({
          title: 'تغییر کلمه عبور موفقیت‌آمیز بود',
          message: 'رمز عبور جدید با موفقیت اعمال شد. در دفعات بعدی با رمز عبور جدید وارد شوید.',
          type: 'success'
        });
        return { success: true, message: 'رمز عبور با موفقیت تغییر کرد.' };
      }
      return { success: false, message: res.message || 'خطا در تغییر رمز عبور.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'خطا در تغییر رمز عبور.' };
    }
  }, [addToast]);

  const submitInstructorApplication = useCallback(async (data: { expertise: string; experienceYears: string; phone: string; sampleUrl?: string; proposedTopic?: string; bio: string }) => {
    // Feature Toggle guard
    if (!isInstructorRegistrationEnabled) {
      addToast({
        title: 'ثبت‌نام غیرفعال است',
        message: 'قابلیت ثبت‌نام مدرس در حال حاضر غیرفعال است.',
        type: 'error'
      });
      return { success: false, message: 'قابلیت ثبت‌نام مدرس در حال حاضر غیرفعال است.' };
    }

    // Call server API for persistence and backend guard validation
    try {
      const apiRes = await api.instructor.apply(data);
      if (!apiRes.success) {
        addToast({
          title: 'خطای ثبت درخواست',
          message: apiRes.message || 'قابلیت ثبت‌نام مدرس در حال حاضر غیرفعال است.',
          type: 'error'
        });
        return { success: false, message: apiRes.message || 'خطا در ارسال درخواست' };
      }
    } catch (err: any) {
      const message = err?.message || 'قابلیت ثبت‌نام مدرس در حال حاضر غیرفعال است.';
      addToast({
        title: 'خطای ثبت درخواست',
        message,
        type: 'error'
      });
      return { success: false, message };
    }

    const newApp: InstructorApplication = {
      id: `app-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      phone: data.phone,
      expertise: data.expertise,
      experienceYears: data.experienceYears,
      sampleUrl: data.sampleUrl,
      proposedTopic: data.proposedTopic,
      bio: data.bio,
      status: 'pending',
      submittedAt: 'همین الان'
    };

    setInstructorApplications(prev => [newApp, ...prev]);

    // Send notification to user
    setNotifications(prev => [
      {
        id: `notif-app-${Date.now()}`,
        userId: currentUser.id,
        type: 'announcement',
        title: 'درخواست تبدیل به مدرس ثبت شد',
        message: 'درخواست و سرفصل پیشنهادی شما به مدیریت ارسال شد و در نوبت بررسی قرار گرفت.',
        read: false,
        createdAt: 'همین الان'
      },
      ...prev
    ]);

    addToast({
      title: 'درخواست مدرسی شما دریافت شد ✨',
      message: 'رزومه و سرفصل پیشنهادی شما توسط تیم مدیریت بررسی و در صورت تایید، دسترسی به پنل مدرس برای شما فعال خواهد شد.',
      type: 'success'
    });

    return { success: true, message: 'درخواست با موفقیت ثبت شد.' };
  }, [currentUser, addToast, isInstructorRegistrationEnabled]);

  const updateInstructorApplicationStatus = useCallback((appId: string, status: InstructorApplication['status']) => {
    setInstructorApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    addToast({
      title: 'وضعیت درخواست به‌روز شد',
      message: `وضعیت درخواست به «${status === 'approved' ? 'تایید شده' : status === 'rejected' ? 'رد شده' : 'بررسی شده'}» تغییر یافت.`,
      type: 'info'
    });
  }, [addToast]);

  // Wallet Actions
  const walletBalance = currentUser.walletBalance ?? 2450000;

  const chargeWallet = useCallback((amount: number, gateway: string = 'بانک سامان') => {
    const trackingCode = `TRX-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const now = new Date();
    const dateStr = `${now.toLocaleDateString('fa-IR')} - ${now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      type: 'deposit',
      amount,
      title: 'افزایش اعتبار آنلاین کیف پول',
      description: `شارژ سریع از طریق درگاه الکترونیکی ${gateway}`,
      trackingCode,
      gateway,
      date: dateStr,
      status: 'success'
    };

    setTransactions(prev => [newTx, ...prev]);
    setCurrentUser(prev => ({
      ...prev,
      walletBalance: (prev.walletBalance ?? 0) + amount
    }));

    setNotifications(prev => [
      {
        id: `notif-wallet-${Date.now()}`,
        userId: currentUser.id,
        type: 'payment',
        title: 'کیف پول با موفقیت شارژ شد',
        message: `مبلغ ${amount.toLocaleString('fa-IR')} تومان به موجودی حساب کاربری شما اضافه شد. شماره پیگیری: ${trackingCode}`,
        read: false,
        createdAt: 'همین الان'
      },
      ...prev
    ]);

    addToast({
      title: 'شارژ کیف پول با موفقیت انجام شد 💳',
      message: `مبلغ ${amount.toLocaleString('fa-IR')} تومان به موجودی شما اضافه شد. شماره پیگیری: ${trackingCode}`,
      type: 'success'
    });

    return { success: true, trackingCode };
  }, [currentUser.id, addToast]);

  // Download Resource Actions
  const addDownloadResource = useCallback((item: Omit<CourseDownloadItem, 'id' | 'addedDate'>) => {
    const now = new Date();
    const newDownload: CourseDownloadItem = {
      ...item,
      id: `dl-${Date.now()}`,
      addedDate: now.toLocaleDateString('fa-IR')
    };
    setDownloads(prev => [newDownload, ...prev]);
    addToast({
      title: 'فایل ضمیمه اضافه شد',
      message: `فایل «${item.title}» به لیست دانلودهای دوره افزوده شد.`,
      type: 'success'
    });
  }, [addToast]);


  // Wishlist actions (deprecated & cleaned up in Phase 14)
  const isInWishlist = useCallback((_courseId: string) => false, []);
  const addToWishlist = useCallback((_courseId: string) => {}, []);
  const removeFromWishlist = useCallback((_courseId: string) => {}, []);
  const toggleWishlist = useCallback((_courseId: string) => {}, []);

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

  // Enrollment checks and API sync
  const isEnrolled = useCallback((courseId: string) => {
    return !!enrollments[courseId];
  }, [enrollments]);

  const enrollInCourse = useCallback(async (courseId: string): Promise<{ success: boolean; message: string; isNew?: boolean }> => {
    if (!isLoggedIn) {
      openAuthModal('login');
      return { success: false, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' };
    }

    try {
      const res = await api.enrollments.enroll(courseId);
      if (res.success && res.data) {
        const targetCourseId = res.data.courseId || res.data.enrollment?.courseId || courseId;

        setEnrollments(prev => ({
          ...prev,
          [targetCourseId]: {
            courseId: targetCourseId,
            userId: currentUser.id,
            enrolledAt: res.data.enrollment?.enrolledAt || new Date().toISOString(),
            completedLessonIds: [],
            lastLessonId: '',
            lastPositionSeconds: 0,
            progressPercent: 0,
            notes: []
          }
        }));

        setCurrentUser(prev => ({
          ...prev,
          enrolledCourseIds: Array.from(new Set([...prev.enrolledCourseIds, targetCourseId]))
        }));

        await fetchMyEnrollments();

        return {
          success: true,
          message: res.message || 'ثبت‌نام در دوره با موفقیت انجام شد.',
          isNew: res.data.isNew
        };
      }
      return { success: false, message: res.message || 'خطا در ثبت‌نام دوره.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'خطای سرور در ثبت‌نام.' };
    }
  }, [isLoggedIn, openAuthModal, currentUser.id, fetchMyEnrollments]);

  const enrollCourse = useCallback((courseId: string) => {
    enrollInCourse(courseId);
  }, [enrollInCourse]);

  const archiveCourse = useCallback(async (courseId: string): Promise<boolean> => {
    try {
      const res = await api.enrollments.archive(courseId);
      if (res.success) {
        const archivedStatus = res.data?.isArchived;
        setEnrollments(prev => {
          const enr = prev[courseId];
          if (!enr) return prev;
          return {
            ...prev,
            [courseId]: {
              ...enr,
              isArchived: typeof archivedStatus === 'boolean' ? archivedStatus : !enr.isArchived
            }
          };
        });
        addToast(res.data?.message || res.message || 'وضعیت بایگانی دوره با موفقیت تغییر کرد.', 'success');
        await fetchMyEnrollments();
        return true;
      }
      addToast(res.message || 'خطا در عملیات بایگانی دوره.', 'error');
      return false;
    } catch (err: any) {
      addToast(err.message || 'خطا در برقراری ارتباط با سرور.', 'error');
      return false;
    }
  }, [addToast, fetchMyEnrollments]);

  const dropCourse = useCallback(async (courseId: string): Promise<boolean> => {
    try {
      const res = await api.enrollments.drop(courseId);
      if (res.success) {
        setEnrollments(prev => {
          const next = { ...prev };
          delete next[courseId];
          return next;
        });
        setCurrentUser(prev => ({
          ...prev,
          enrolledCourseIds: (prev.enrolledCourseIds || []).filter(id => id !== courseId)
        }));
        addToast(res.data?.message || res.message || 'انصراف از دوره با موفقیت انجام شد.', 'success');
        await fetchMyEnrollments();
        return true;
      }
      addToast(res.message || 'خطا در انصراف از دوره.', 'error');
      return false;
    } catch (err: any) {
      addToast(err.message || 'خطا در انصراف از دوره.', 'error');
      return false;
    }
  }, [addToast, fetchMyEnrollments]);

  // Lesson completion & progress
  const updateLessonProgress = useCallback(async (courseId: string, lessonId: string, isCompleted: boolean, positionSeconds = 0) => {
    const course = courses.find(c => c.id === courseId || c.slug === courseId);
    const targetCourseId = course ? course.id : courseId;
    const totalLessons = course ? course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0) : 1;

    setEnrollments(prev => {
      const current = prev[targetCourseId] || prev[courseId] || {
        courseId: targetCourseId,
        userId: currentUser.id,
        enrolledAt: new Date().toISOString().split('T')[0],
        completedLessonIds: [],
        lastLessonId: lessonId,
        lastPositionSeconds: positionSeconds,
        progressPercent: 0,
        notes: []
      };

      const updatedCompleted = isCompleted
        ? (current.completedLessonIds.includes(lessonId) ? current.completedLessonIds : [...current.completedLessonIds, lessonId])
        : current.completedLessonIds.filter(id => id !== lessonId);

      const progressPercent = Math.min(100, Math.round((updatedCompleted.length / Math.max(1, totalLessons)) * 100));
      const completedAt = progressPercent === 100 ? new Date().toISOString().split('T')[0] : current.completedAt;

      return {
        ...prev,
        [targetCourseId]: {
          ...current,
          completedLessonIds: updatedCompleted,
          lastLessonId: lessonId,
          lastPositionSeconds: positionSeconds || current.lastPositionSeconds,
          progressPercent,
          completedAt
        }
      };
    });

    if (getStoredAuthToken()) {
      try {
        const res = await api.progress.updateLesson(targetCourseId, lessonId, isCompleted, positionSeconds);
        if (res && res.success && res.data) {
          const { courseProgress, completedLessonIds } = res.data as any;
          if (courseProgress) {
            setEnrollments(prev => {
              const current = prev[targetCourseId];
              if (!current) return prev;
              return {
                ...prev,
                [targetCourseId]: {
                  ...current,
                  progressPercent: courseProgress.progressPercent ?? current.progressPercent,
                  completedLessonIds: completedLessonIds || current.completedLessonIds,
                  completedAt: courseProgress.completedAt || current.completedAt
                }
              };
            });
          }
        }
      } catch (err) {
        console.warn('[Update Lesson Progress Sync Warning]:', err);
      }
    }
  }, [courses, currentUser.id]);

  const completeLesson = useCallback((courseId: string, lessonId: string) => {
    updateLessonProgress(courseId, lessonId, true);
    addToast({
      title: 'Lesson Completed!',
      message: 'Progress tracked and saved to your account.',
      type: 'success'
    });
  }, [updateLessonProgress, addToast]);

  const saveLessonProgress = useCallback((courseId: string, lessonId: string, seconds: number) => {
    const course = courses.find(c => c.id === courseId || c.slug === courseId);
    const targetCourseId = course ? course.id : courseId;
    setEnrollments(prev => {
      const current = prev[targetCourseId] || prev[courseId];
      if (!current) return prev;
      return {
        ...prev,
        [targetCourseId]: {
          ...current,
          lastLessonId: lessonId,
          lastPositionSeconds: Math.round(seconds)
        }
      };
    });
    if (getStoredAuthToken()) {
      api.progress.updateLesson(targetCourseId, lessonId, false, Math.round(seconds)).catch(() => {});
    }
  }, [courses]);

  const addLessonNote = useCallback(async (courseId: string, lessonId: string, lessonTitle: string, timestampSeconds: number, text: string) => {
    const course = courses.find(c => c.id === courseId || c.slug === courseId);
    const targetCourseId = course ? course.id : courseId;
    const tempNoteId = 'note_' + Math.random().toString(36).substring(2, 9);
    const newNoteObj = {
      id: tempNoteId,
      lessonId,
      lessonTitle: lessonTitle || 'درس',
      timestampSeconds,
      text,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setEnrollments(prev => {
      const current = prev[targetCourseId] || prev[courseId];
      if (!current) return prev;
      return {
        ...prev,
        [targetCourseId]: {
          ...current,
          notes: [...(current.notes || []), newNoteObj]
        }
      };
    });

    if (getStoredAuthToken()) {
      try {
        const res = await api.progress.saveNote(targetCourseId, lessonId, text, timestampSeconds);
        if (res && res.success && res.data) {
          const serverNote = res.data;
          setEnrollments(prev => {
            const current = prev[targetCourseId];
            if (!current) return prev;
            return {
              ...prev,
              [targetCourseId]: {
                ...current,
                notes: current.notes.map(n => n.id === tempNoteId ? {
                  ...n,
                  id: serverNote.id,
                  createdAt: serverNote.createdAt
                } : n)
              }
            };
          });
        }
      } catch (err) {
        console.warn('[Save Note Sync Warning]:', err);
      }
    }
  }, [courses]);

  const addNote = useCallback((courseId: string, note: { lessonId: string; timestampSeconds: number; text: string; lessonTitle?: string }) => {
    addLessonNote(courseId, note.lessonId, note.lessonTitle || '', note.timestampSeconds, note.text);
  }, [addLessonNote]);

  const deleteLessonNote = useCallback(async (courseId: string, noteId: string) => {
    const course = courses.find(c => c.id === courseId || c.slug === courseId);
    const targetCourseId = course ? course.id : courseId;

    setEnrollments(prev => {
      const current = prev[targetCourseId] || prev[courseId];
      if (!current) return prev;
      return {
        ...prev,
        [targetCourseId]: {
          ...current,
          notes: (current.notes || []).filter(n => n.id !== noteId)
        }
      };
    });

    if (getStoredAuthToken()) {
      try {
        await api.progress.deleteNote(noteId);
      } catch (err) {
        console.warn('[Delete Note Sync Warning]:', err);
      }
    }
  }, [courses]);

  const deleteNote = useCallback((courseId: string, noteId: string) => {
    deleteLessonNote(courseId, noteId);
  }, [deleteLessonNote]);

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
    
    // Async backend synchronization
    api.courses.create({
      title: newCourse.title,
      subtitle: newCourse.subtitle,
      description: newCourse.description,
      categoryId: newCourse.categoryId,
      level: newCourse.level,
      price: newCourse.price,
      originalPrice: newCourse.originalPrice,
      durationHours: newCourse.durationHours,
      hasCertificate: newCourse.hasCertificate,
      thumbnail: newCourse.thumbnail,
      previewVideoUrl: newCourse.previewVideoUrl,
      whatYouWillLearn: newCourse.whatYouWillLearn,
      requirements: newCourse.requirements,
      targetAudience: newCourse.targetAudience,
      modules: newCourse.modules,
      status: 'published'
    }).catch(err => console.warn('Could not sync created course to backend:', err));

    addToast({
      title: language === 'fa' ? 'دوره ذخیره شد' : 'Course Created!',
      message: language === 'fa' ? `دوره «${newCourse.title}» با موفقیت در سیستم ثبت گردید.` : 'Submitted to Admin Studio catalog.',
      type: 'success'
    });
    return newCourse;
  }, [currentUser, language, addToast]);

  const updateCourse = useCallback((courseId: string, updates: Partial<Course>) => {
    setCourses(prev => prev.map(c => (c.id === courseId ? { ...c, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : c)));
    api.courses.update(courseId, updates).catch(err => console.warn('Could not sync course update to backend:', err));
    addToast({
      title: language === 'fa' ? 'تغییرات ذخیره شد' : 'Course Updated',
      message: language === 'fa' ? 'تمامی اطلاعات دوره با موفقیت به‌روزرسانی شدند.' : 'All changes saved successfully.',
      type: 'success'
    });
  }, [language, addToast]);

  const updateCourseStatus = useCallback((courseId: string, status: CourseStatus) => {
    setCourses(prev => prev.map(c => (c.id === courseId ? { ...c, status, isPublished: status === 'published' } : c)));
    api.courses.setStatus(courseId, status).catch(err => console.warn('Could not sync course status to backend:', err));
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
    api.courses.delete(courseId).catch(err => console.warn('Could not sync course deletion to backend:', err));
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

    // Authentication & Profile
    isLoggedIn,
    authModalOpen,
    setAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    openAuthModal,
    login,
    registerUser,
    logout,
    loginAsDemo,
    updateUserProfile,
    changeUserPassword,

    // Instructor Applications
    instructorApplications,
    submitInstructorApplication,
    updateInstructorApplicationStatus,

    // Site Settings & Feature Toggles
    siteSettings,
    isInstructorRegistrationEnabled,
    isAlacarteSaleEnabled,
    updateSiteSettings,
    toggleInstructorRegistration,
    toggleAlacarteSale,
    fetchSiteSettings,

    // Routing
    currentRoute,
    navigate,

    // Wallet & Financial
    walletBalance,
    transactions,
    chargeWallet,

    // Downloads & Resources
    downloads,
    addDownloadResource,

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
    enrollInCourse,
    fetchMyEnrollments,
    archiveCourse,
    dropCourse,
    enrollCourse,
    completeLesson,
    updateLessonProgress,
    saveLessonProgress,
    addLessonNote,
    addNote,
    deleteLessonNote,
    deleteNote,
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
    isLoggedIn, authModalOpen, authModalTab, openAuthModal, login, registerUser, logout,
    loginAsDemo, updateUserProfile, changeUserPassword, instructorApplications,
    submitInstructorApplication, updateInstructorApplicationStatus,
    siteSettings, isInstructorRegistrationEnabled, updateSiteSettings, toggleInstructorRegistration, fetchSiteSettings,
    walletBalance, transactions, chargeWallet, downloads, addDownloadResource,
    courses, categories, instructors, reviews, enrollments, certificates, notifications,
    cart, activeCoupon, wishlist, mediaAssets, uploadQueue, addToCart, removeFromCart, clearCart, applyCoupon,
    removeCoupon, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist,
    isInCart, isEnrolled, enrollInCourse, fetchMyEnrollments, archiveCourse, dropCourse, enrollCourse, completeLesson, updateLessonProgress, saveLessonProgress, addLessonNote,
    addNote, deleteLessonNote, deleteNote, addReview, claimCertificate, getCertificateByCourse, createCourse,
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
