import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Compass, Search, Heart, ShoppingBag, Bell, Moon, Sun, 
  ChevronDown, LayoutDashboard, ShieldCheck, Check, Globe, 
  PlusCircle, BookOpen, Sparkles 
} from 'lucide-react';
import { UserRole } from '../../types';
import { toPersianDigits } from '../../utils/persian';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    userRole,
    setUserRole,
    navigate,
    language,
    setLanguage,
    theme,
    toggleTheme,
    cart,
    wishlist,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setSearchModalOpen,
    categories,
    t,
    isRTL
  } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
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
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs border-b border-gray-200 dark:border-slate-800 py-3'
          : 'bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
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
              onClick={() => navigate('catalog')}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#456774] dark:text-slate-300 hover:text-[#0d9488] dark:hover:text-[#5eead4] rounded-xl hover:bg-[#f0faf7] dark:hover:bg-[#0b252e] transition-colors"
            >
              کاتالوگ دوره‌ها
            </button>
            <button
              onClick={() => navigate('catalog', undefined, 'sort=popular')}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#456774] dark:text-slate-300 hover:text-[#0d9488] dark:hover:text-[#5eead4] rounded-xl hover:bg-[#f0faf7] dark:hover:bg-[#0b252e] transition-colors"
            >
              مدرسین و اساتید
            </button>
            <button
              onClick={() => navigate('admin')}
              className="px-3.5 py-1.5 text-xs font-black text-[#0b3b49] dark:text-[#5eead4] bg-[#def4ee]/60 dark:bg-[#0e3b47]/60 hover:bg-[#def4ee] dark:hover:bg-[#0e3b47] rounded-xl border border-[#0d9488]/30 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles size={13} className="text-[#0d9488] dark:text-[#5eead4]" />
              <span>استودیو مدیریت دوره‌ها</span>
            </button>
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

        {/* End: User Badge, Actions, Wishlist, Cart, Notifications, Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Search Button */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="md:hidden p-2 rounded-xl text-[#0b3b49] dark:text-slate-300 hover:bg-[#f0faf7] dark:hover:bg-slate-800 transition-colors"
            aria-label="Search"
          >
            <Search size={19} />
          </button>

          {/* User Quick Badge Link (Matching Image 2: "Maziar M | دوره‌های من") */}
          <button
            onClick={() => navigate('dashboard')}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#def4ee]/70 dark:bg-[#0e3b47] hover:bg-[#def4ee] border border-teal-200/60 dark:border-teal-800 transition-all text-start cursor-pointer"
            title="رفتن به داشبورد و دوره‌های من"
          >
            <div className="w-6 h-6 rounded-full bg-[#0b3b49] text-[#5eead4] font-black text-xs flex items-center justify-center shadow-xs">
              {currentUser.name ? currentUser.name.charAt(0) : 'M'}
            </div>
            <span className="text-xs font-bold text-[#06242e] dark:text-[#ccede5]">
              {currentUser.name}
            </span>
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

          {/* Wishlist */}
          <button
            onClick={() => navigate('wishlist')}
            className="relative p-2 rounded-xl text-[#456774] dark:text-slate-300 hover:text-[#0d9488] hover:bg-[#f0faf7] dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={t('wishlist')}
          >
            <Heart size={19} />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 inset-inline-end-0.5 w-4 h-4 bg-[#0d9488] text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900">
                {language === 'fa' ? toPersianDigits(wishlist.length) : wishlist.length}
              </span>
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

          {/* Notifications Popover */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl text-[#456774] dark:text-slate-300 hover:text-[#0d9488] hover:bg-[#f0faf7] dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={t('notifications')}
            >
              <Bell size={19} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 inset-inline-end-1.5 w-2 h-2 bg-[#0d9488] rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {notificationsOpen && (
              <div
                className={`absolute ${
                  isRTL ? 'left-0' : 'right-0'
                } mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50`}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-slate-100">{t('notifications')}</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        {language === 'fa' ? `${toPersianDigits(unreadNotificationsCount)} جدید` : `${unreadNotificationsCount} new`}
                      </span>
                    )}
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {language === 'fa' ? 'علامت‌گذاری همه به عنوان خوانده‌شده' : 'Mark all as read'}
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400">
                      {language === 'fa' ? 'اعلانی جهت نمایش وجود ندارد.' : 'No notifications yet.'}
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-2.5 rounded-xl cursor-pointer transition-colors ${
                          n.read
                            ? 'bg-transparent hover:bg-gray-50 dark:hover:bg-slate-800/40'
                            : 'bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-gray-900 dark:text-slate-100">{n.title}</h5>
                          <span className="text-[10px] text-gray-400 shrink-0">{n.createdAt}</span>
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher Dropdown */}
          <div className="relative ms-1" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-0.5 rounded-full ring-2 ring-transparent hover:ring-indigo-500/30 transition-all"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 border-2 border-white dark:border-slate-700 shadow-xs overflow-hidden">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </button>

            {profileOpen && (
              <div
                className={`absolute ${
                  isRTL ? 'left-0' : 'right-0'
                } mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50`}
              >
                {/* User Info Header */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-2">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                    {language === 'fa' ? 'نقش فعال:' : 'Role:'}{' '}
                    {userRole === 'student' ? 'دانشجو' : userRole === 'instructor' ? 'مدرس' : 'مدیر سیستم'}
                  </div>
                </div>

                {/* Role Switcher Section */}
                <div className="p-1 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('switchRole')}
                  </div>
                  {(['student', 'instructor', 'admin'] as UserRole[]).map(role => {
                    const label = role === 'student' 
                      ? (language === 'fa' ? 'پنل دانشجو' : 'Student View')
                      : role === 'instructor'
                      ? (language === 'fa' ? 'استودیو مدرس' : 'Instructor Studio')
                      : (language === 'fa' ? 'پنل مدیر سیستم' : 'Admin Panel');
                    return (
                      <button
                        key={role}
                        onClick={() => {
                          setUserRole(role);
                          if (role === 'student') navigate('dashboard');
                          else if (role === 'instructor') navigate('instructor');
                          else if (role === 'admin') navigate('admin');
                          setProfileOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                          userRole === role
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{label}</span>
                        {userRole === role && <Check size={13} />}
                      </button>
                    );
                  })}
                </div>

                {/* Primary Navigation Links */}
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      navigate('dashboard');
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <LayoutDashboard size={15} />
                    <span>{t('myLearning')}</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('instructor');
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <PlusCircle size={15} />
                    <span>{t('instructorStudio')}</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('admin');
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ShieldCheck size={15} />
                    <span>{t('adminDashboard')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
