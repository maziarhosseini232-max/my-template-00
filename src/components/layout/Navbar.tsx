import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Compass, Search, ShoppingBag, Bell, Moon, Sun, 
  ChevronDown, LayoutDashboard, ShieldCheck, Check, Globe, 
  BookOpen, Sparkles, LogIn, LogOut, User as UserIcon, KeyRound, GraduationCap, ArrowRight,
  Wallet, Crown
} from 'lucide-react';
import { UserRole } from '../../types';
import { toPersianDigits } from '../../utils/persian';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    userRole,
    setUserRole,
    isLoggedIn,
    openAuthModal,
    logout,
    navigate,
    language,
    setLanguage,
    theme,
    toggleTheme,
    cart,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setSearchModalOpen,
    categories,
    walletBalance,
    isInstructorRegistrationEnabled,
    t,
    isRTL
  } = useApp();

  const isActualAdmin = Boolean(
    currentUser &&
    currentUser.email &&
    (currentUser.email === 'admin@lumina.com' ||
     currentUser.roles?.some(r => r === 'ADMIN' || r === 'OWNER') ||
     (currentUser.role === 'admin' && (!currentUser.roles || currentUser.roles.length === 0)))
  );

  const isVipUser = Boolean(
    currentUser?.subscriptionEndDate &&
    new Date(currentUser.subscriptionEndDate).getTime() > Date.now()
  );

  const [isScrolled, setIsScrolled] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsExpanded, setNotificationsExpanded] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
        setNotificationsExpanded(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setLanguageOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle scroll compacting
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs border-b border-gray-200 dark:border-slate-800'
          : 'bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800'
      }`}
    >
      {/* Impersonation Alert Banner */}
      {isActualAdmin && userRole !== 'admin' && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-1.5 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span>حالت بررسی مدیر: در حال مشاهده سامانه با نقش «{userRole === 'instructor' ? 'مدرس' : 'دانشجو'}»</span>
            </div>
            <button
              onClick={() => setUserRole('admin')}
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              بازگشت به دیدگاه مدیر
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 py-3">
        {/* Start: Brand Logo & Navigation */}
        <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
          {/* Brand Logo */}
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-2.5 text-start focus:outline-hidden group cursor-pointer"
          >
            <div className="w-9 h-9 bg-[#0b3b49] dark:bg-[#0f4d5f] rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <BookOpen size={18} className="text-[#5eead4]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black tracking-tight text-lg text-[#06242e] dark:text-white leading-none">
                  لومینا لرن
                </span>
                <span className="text-[9px] font-bold text-[#0d9488] bg-[#eaf8f5] dark:bg-[#09333f] px-1.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
                  پلتفرم تخصصی
                </span>
              </div>
              <span className="text-[10px] text-[#5a7e8a] dark:text-slate-400 font-medium mt-0.5 hidden md:inline">
                فضای رشد و یادگیری شما
              </span>
            </div>
          </button>

          {/* Quick Nav Links Matching Screenshot */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => navigate('home')}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#def4ee] dark:bg-[#0e3b47] text-[#06242e] dark:text-[#5eead4] transition-all"
            >
              خانه
            </button>
            <button
              id="navbar-courses-btn"
              onClick={() => navigate('catalog')}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#456774] dark:text-slate-300 hover:text-[#0d9488] dark:hover:text-[#5eead4] rounded-xl hover:bg-[#f0faf7] dark:hover:bg-[#0b252e] transition-colors"
            >
              دوره‌ها
            </button>

            {/* VIP Subscription Link */}
            {isVipUser ? (
              <button
                id="navbar-vip-btn"
                onClick={() => navigate('vip')}
                className="px-3.5 py-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 border border-amber-300 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/25 ring-2 ring-amber-400/40 cursor-pointer"
                title="عضو طلایی VIP فعال - مشاهده وضعیت یا تمدید اشتراک"
              >
                <Crown size={14} className="text-slate-950 fill-slate-950 animate-pulse" />
                <span>عضو طلایی VIP</span>
              </button>
            ) : (
              <button
                id="navbar-vip-btn"
                onClick={() => navigate('vip')}
                className="px-3 py-1.5 text-xs font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/80 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Sparkles size={13} className="text-amber-500 animate-pulse" />
                <span>اشتراک ویژه (VIP)</span>
              </button>
            )}

            {/* Quick Link to Apply as Instructor */}
            {isInstructorRegistrationEnabled && (
              <button
                onClick={() => navigate('dashboard', undefined, 'tab=instructor-request')}
                className="px-3 py-1.5 text-xs font-semibold text-[#0d9488] dark:text-[#5eead4] hover:bg-[#def4ee]/50 dark:hover:bg-[#0e3b47]/50 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                title="درخواست پیوستن به جمع اساتید لومینا لرن"
              >
                <GraduationCap size={14} />
                <span>درخواست تدریس</span>
              </button>
            )}
          </nav>

          {/* Categories Dropdown */}
          <div className="relative hidden xl:block" ref={categoriesRef}>
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#456774] dark:text-slate-200 hover:text-[#0d9488] hover:bg-[#f0faf7] dark:hover:bg-[#0b252e] transition-colors cursor-pointer"
            >
              <Compass size={15} className="text-[#0d9488]" />
              <span>دسته‌بندی‌ها</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
            </button>

            {categoriesOpen && (
              <div
                className={`absolute ${
                  isRTL ? 'right-0' : 'left-0'
                } mt-2 w-80 bg-white dark:bg-[#08242d] border border-teal-100 dark:border-teal-900 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150`}
              >
                <div className="p-2 text-[11px] font-bold text-[#5a7e8a] dark:text-slate-400 uppercase tracking-widest">
                  {t('categories')}
                </div>
                <div className="space-y-1">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategoriesOpen(false);
                        navigate('catalog', undefined, `category=${cat.id}`);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#f0faf7] dark:hover:bg-[#0f3744] text-start transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#def4ee] dark:bg-[#0e3b47] text-[#06242e] dark:text-[#5eead4] flex items-center justify-center font-bold text-xs">
                          {cat.nameFa ? cat.nameFa.charAt(0) : cat.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[#06242e] dark:text-slate-100 group-hover:text-[#0d9488] dark:group-hover:text-[#5eead4]">
                            {language === 'fa' ? cat.nameFa : cat.name}
                          </div>
                          <div className="text-[10px] text-[#5a7e8a] dark:text-slate-400">
                            {language === 'fa' ? toPersianDigits(cat.courseCount) : cat.courseCount} {t('courses')}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="pt-2 mt-2 border-t border-teal-100 dark:border-teal-900">
                  <button
                    onClick={() => {
                      setCategoriesOpen(false);
                      navigate('catalog');
                    }}
                    className="w-full py-2 text-center text-xs font-bold text-[#0d9488] hover:underline cursor-pointer"
                  >
                    {t('allCourses')} ←
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Trigger Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="w-full flex items-center justify-between px-4 py-2 bg-white dark:bg-[#08242d] border border-[#ccede5] dark:border-teal-800/80 rounded-full text-xs text-[#5a7e8a] hover:border-[#0d9488] hover:bg-[#f0faf7] dark:hover:bg-[#0e3744] transition-all text-start shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search size={15} className="text-[#0d9488] shrink-0" />
              <span className="truncate">جست‌وجوی دوره، کتاب، استاد یا موضوع...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-[#0b3b49] dark:text-[#ccede5] bg-[#def4ee] dark:bg-[#0b2f3a] rounded-full border border-teal-200 dark:border-teal-800 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* End: User Badge, Actions, Cart, Notifications, Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Search Button */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="md:hidden p-2 rounded-xl text-[#0b3b49] dark:text-slate-300 hover:bg-[#f0faf7] dark:hover:bg-slate-800 transition-colors"
            aria-label="Search"
          >
            <Search size={19} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[#456774] dark:text-slate-300 hover:text-[#0d9488] hover:bg-[#f0faf7] dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'تغییر به حالت روشن (روز)' : 'تغییر به حالت تاریک (شب)'}
            aria-label={theme === 'dark' ? 'حالت روشن' : 'حالت تاریک'}
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon size={18} className="text-[#0b3b49] hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Shopping Cart */}
          <button
            onClick={() => navigate('cart')}
            className="relative p-2 rounded-xl text-[#456774] dark:text-slate-300 hover:text-[#0d9488] hover:bg-[#f0faf7] dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={t('shoppingCart')}
          >
            <ShoppingBag size={19} />
            {cart.length > 0 && (
              <span className="absolute -top-0.5 inset-inline-end-0.5 w-4 h-4 bg-[#0d9488] text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900">
                {language === 'fa' ? toPersianDigits(cart.length) : cart.length}
              </span>
            )}
          </button>

          {/* Authentication / Profile Section */}
          {!isLoggedIn ? (
            <div className="flex items-center gap-2 ms-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn size={15} />
                <span>ورود / ثبت‌نام</span>
              </button>
            </div>
          ) : (
            <div className="relative ms-1" ref={profileRef}>
              {/* Unified Profile & User Name Component Button */}
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-2 ps-1 pe-3 py-1 rounded-full transition-all cursor-pointer border shadow-xs ${
                  isVipUser
                    ? 'bg-gradient-to-r from-amber-100/90 via-amber-50/80 to-yellow-100/90 dark:from-amber-950/60 dark:via-slate-900 dark:to-yellow-950/60 border-amber-400/80 ring-1 ring-amber-400/40 hover:scale-102'
                    : 'bg-[#def4ee]/70 dark:bg-[#0e3b47] hover:bg-[#def4ee] border-teal-200/60 dark:border-teal-800'
                }`}
                title="منوی کاربری و داشبورد"
              >
                {/* Avatar with unread indicator */}
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#def4ee] dark:bg-[#0e3b47] border-2 border-white dark:border-slate-700 shadow-xs overflow-hidden">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-0.5 inset-inline-end-0 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                  )}
                </div>

                {/* User Name & VIP Badge (inside the same component) */}
                <span className="text-xs font-bold text-[#06242e] dark:text-[#ccede5] max-w-[110px] truncate">
                  {currentUser.name}
                </span>

                {isVipUser && (
                  <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[9px] font-black flex items-center gap-0.5 shadow-xs">
                    <Crown size={10} className="fill-slate-950" />
                    <span>VIP</span>
                  </span>
                )}

                <ChevronDown size={13} className={`text-slate-500 dark:text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div
                  className={`absolute ${
                    isRTL ? 'left-0' : 'right-0'
                  } mt-2 w-80 sm:w-84 bg-white dark:bg-[#08242d] border border-teal-100 dark:border-teal-900 rounded-2xl shadow-2xl p-3 z-50`}
                >
                  {/* User Profile Header */}
                  <div className="p-3 bg-teal-50/50 dark:bg-[#061d24] rounded-xl mb-2.5 border border-teal-100/50 dark:border-teal-900/40">
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate" dir="ltr">{currentUser.email}</div>
                    
                    {/* Wallet mini bar */}
                    <div 
                      onClick={() => {
                        navigate('dashboard', undefined, 'tab=wallet');
                        setProfileOpen(false);
                      }}
                      className="mt-2.5 p-2 rounded-lg bg-white dark:bg-slate-800 border border-teal-100 dark:border-teal-900/60 flex items-center justify-between cursor-pointer hover:border-teal-500 transition-colors shadow-2xs"
                      title="مشاهده موجودی و شارژ کیف پول"
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <Wallet size={14} className="text-teal-600 dark:text-teal-400" />
                        <span>کیف پول من:</span>
                      </div>
                      <span className="text-xs font-black font-mono text-teal-700 dark:text-teal-300">
                        {toPersianDigits(walletBalance.toLocaleString('fa-IR'))} تومان
                      </span>
                    </div>

                    {/* Role Badge & Impersonation */}
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          userRole === 'admin'
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                            : userRole === 'instructor'
                            ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                            : 'bg-[#def4ee] dark:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4]'
                        }`}>
                          {userRole === 'admin' ? (
                            <>
                              <ShieldCheck size={12} />
                              <span>مدیر ارشد و صاحب سایت</span>
                            </>
                          ) : userRole === 'instructor' ? (
                            <>
                              <GraduationCap size={12} />
                              <span>مدرس پلتفرم</span>
                            </>
                          ) : (
                            <>
                              <UserIcon size={12} />
                              <span>دانشجوی لومینا</span>
                            </>
                          )}
                        </span>

                        {isActualAdmin && userRole !== 'admin' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold">
                            شبیه‌سازی دیدگاه
                          </span>
                        )}
                      </div>

                      {/* Admin Impersonation Switcher (Only visible for ADMIN in admin mode) */}
                      {isActualAdmin && userRole === 'admin' && (
                        <div className="pt-2 border-t border-dashed border-teal-200/80 dark:border-teal-900/60">
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-1.5 flex items-center justify-between">
                            <span>تغییر دیدگاه مدیر (Impersonation):</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              onClick={() => setUserRole('admin')}
                              className={`px-1.5 py-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer ${
                                userRole === 'admin'
                                  ? 'bg-[#0d9488] text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              مدیر
                            </button>
                            <button
                              onClick={() => setUserRole('instructor')}
                              className={`px-1.5 py-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer ${
                                userRole === 'instructor'
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              مدرس
                            </button>
                            <button
                              onClick={() => setUserRole('student')}
                              className={`px-1.5 py-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer ${
                                userRole === 'student'
                                  ? 'bg-[#0d9488] text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              دانشجو
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Return to Admin View button when admin is in simulated student/instructor mode */}
                      {isActualAdmin && userRole !== 'admin' && (
                        <div className="pt-2 border-t border-dashed border-amber-200/80 dark:border-amber-900/60">
                          <button
                            onClick={() => setUserRole('admin')}
                            className="w-full py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <ShieldCheck size={14} />
                            <span>بازگشت به دیدگاه مدیر</span>
                          </button>
                        </div>
                      )}

                      {/* VIP Subscription Status inside Profile Menu */}
                      {isVipUser && (
                        <div 
                          onClick={() => {
                            navigate('vip');
                            setProfileOpen(false);
                          }}
                          className="mt-2 p-2 rounded-xl bg-gradient-to-r from-amber-500/15 to-yellow-500/15 border border-amber-400/50 flex items-center justify-between cursor-pointer hover:bg-amber-500/25 transition-all group"
                        >
                          <div className="flex items-center gap-1.5">
                            <Crown size={14} className="text-amber-500 fill-amber-500 shrink-0" />
                            <span className="text-[11px] font-black text-amber-900 dark:text-amber-200">عضو ویژه PRO / VIP</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 font-mono">
                            {toPersianDigits(Math.max(0, Math.ceil((new Date(currentUser.subscriptionEndDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))))} روز اعتبار
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Links & Notifications */}
                  <div className="space-y-1 py-1">
                    {/* Dashboard Link */}
                    <button
                      onClick={() => {
                        navigate('dashboard');
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <LayoutDashboard size={15} className="text-teal-600 dark:text-teal-400" />
                        <span>داشبورد من</span>
                      </div>
                      <span className="text-[10px] text-slate-400">ورود</span>
                    </button>

                    {/* Notifications / Alerts Collapsible Section */}
                    <div className="rounded-xl border border-teal-100/80 dark:border-teal-900/60 overflow-hidden bg-slate-50/60 dark:bg-slate-900/40">
                      <button
                        type="button"
                        onClick={() => setNotificationsExpanded(!notificationsExpanded)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-teal-50/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <Bell size={15} className="text-teal-600 dark:text-teal-400" />
                            {unreadNotificationsCount > 0 && (
                              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                            )}
                          </div>
                          <span>پیام‌ها و اعلان‌ها</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {unreadNotificationsCount > 0 ? (
                            <span className="px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                              {toPersianDigits(unreadNotificationsCount)} جدید
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              {toPersianDigits(notifications.length)}
                            </span>
                          )}
                          <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${notificationsExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {/* Notifications List Popup Content */}
                      {notificationsExpanded && (
                        <div className="p-2 pt-1 border-t border-teal-100/60 dark:border-teal-900/60 bg-white dark:bg-[#071d24]">
                          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-slate-400">آخرین رویدادها و اعلان‌ها</span>
                            {unreadNotificationsCount > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAllNotificationsAsRead();
                                }}
                                className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                              >
                                علامت‌گذاری همه
                              </button>
                            )}
                          </div>

                          <div className="max-h-48 overflow-y-auto space-y-1.5">
                            {notifications.length === 0 ? (
                              <div className="py-4 text-center text-[11px] text-slate-400">
                                اعلانی جهت نمایش وجود ندارد.
                              </div>
                            ) : (
                              notifications.map(n => (
                                <div
                                  key={n.id}
                                  onClick={() => markNotificationAsRead(n.id)}
                                  className={`p-2 rounded-lg cursor-pointer transition-colors text-start ${
                                    n.read
                                      ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-75'
                                      : 'bg-teal-50/80 dark:bg-teal-950/50 hover:bg-teal-100/60 dark:hover:bg-teal-900/40 border-r-2 border-teal-500'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <h6 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{n.title}</h6>
                                    <span className="text-[9px] text-slate-400 shrink-0 font-mono">{n.createdAt}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                                    {n.message}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="pt-1.5 mt-1.5 border-t border-slate-100 dark:border-slate-800 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                navigate('dashboard', undefined, 'tab=notifications');
                                setProfileOpen(false);
                              }}
                              className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                            >
                              مشاهده همه در صفحه داشبورد ←
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Instructor Request Link */}
                    {isInstructorRegistrationEnabled && (
                      <button
                        onClick={() => {
                          navigate('dashboard', undefined, 'tab=instructor-request');
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <GraduationCap size={15} className="text-indigo-500" />
                        <span>درخواست پیوستن به مدرسان</span>
                      </button>
                    )}
                  </div>

                  {/* Switch Account & Logout */}
                  <div className="pt-2 mt-2 border-t border-teal-100/60 dark:border-teal-900/60 space-y-1">
                    <button
                      onClick={() => {
                        openAuthModal('login');
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <span>تغییر حساب / ورود دیگر</span>
                      <ArrowRight size={13} />
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>خروج از حساب کاربری</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
