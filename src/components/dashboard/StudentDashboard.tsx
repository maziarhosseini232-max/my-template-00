import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, BookOpen, Wallet, Download, Award, FileText, 
  User, GraduationCap, ShieldCheck, Flame, Clock, Plus,
  ChevronLeft, ArrowLeft, ArrowRight, ExternalLink, Zap, LogOut, CheckCircle2, Sparkles, Crown, Bell, Receipt
} from 'lucide-react';
import { toPersianDigits, formatPriceToman } from '../../utils/persian';

// Tabs
import { OverviewTab } from './tabs/OverviewTab';
import { MyCoursesTab } from './tabs/MyCoursesTab';
import { WalletTab } from './tabs/WalletTab';
import { DownloadsTab } from './tabs/DownloadsTab';
import { CertificatesTab } from './tabs/CertificatesTab';
import { NotesTab } from './tabs/NotesTab';
import { ProfileSettingsTab } from './tabs/ProfileSettingsTab';
import { InstructorRequestTab } from './tabs/InstructorRequestTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { TransactionsTab } from './tabs/TransactionsTab';

export type DashboardTabType = 
  | 'overview' 
  | 'my-courses' 
  | 'transactions'
  | 'wallet' 
  | 'notifications' 
  | 'downloads' 
  | 'certificates' 
  | 'notes' 
  | 'profile' 
  | 'instructor-request';

export const StudentDashboard: React.FC = () => {
  const { 
    currentUser, 
    userRole, 
    currentRoute,
    enrollments, 
    courses, 
    walletBalance, 
    downloads, 
    notifications,
    instructorApplications,
    isInstructorRegistrationEnabled,
    navigate, 
    logout,
    addToast,
    language 
  } = useApp();

  const isActualAdmin = Boolean(
    currentUser &&
    (currentUser.roles?.some(r => r === 'ADMIN' || r === 'OWNER') ||
     (currentUser.role === 'admin' && (!currentUser.roles || currentUser.roles.length === 0)))
  );

  const [activeTab, setActiveTab] = useState<DashboardTabType>('overview');

  // Activate tab from URL query if provided
  useEffect(() => {
    if (currentRoute?.query?.includes('tab=')) {
      const match = currentRoute.query.match(/tab=([^&]+)/);
      if (match && match[1]) {
        const reqTab = match[1];
        if (reqTab === 'studio') {
          // If unauthenticated guest or non-admin asks for studio tab, immediately block and redirect to home
          if (!isActualAdmin) {
            navigate('home');
            return;
          } else {
            navigate('admin');
            return;
          }
        }
        if (reqTab === 'instructor-request' && !isInstructorRegistrationEnabled) {
          setActiveTab('overview');
        } else {
          setActiveTab(reqTab as DashboardTabType);
        }
      }
    }
  }, [currentRoute?.query, isInstructorRegistrationEnabled, isActualAdmin, navigate]);

  useEffect(() => {
    if (!isInstructorRegistrationEnabled && activeTab === 'instructor-request') {
      setActiveTab('overview');
    }
  }, [isInstructorRegistrationEnabled, activeTab]);

  // Enrolled courses
  const enrolledCourseIds = Object.keys(enrollments);
  const enrolledList = enrolledCourseIds
    .map(id => {
      const course = courses.find(c => c.id === id);
      const enrollment = enrollments[id];
      return { course, enrollment };
    })
    .filter((item): item is { course: typeof courses[0]; enrollment: typeof enrollments[string] } => !!item.course);

  const inProgressList = enrolledList.filter(item => item.enrollment.progressPercent < 100);
  const completedList = enrolledList.filter(item => item.enrollment.progressPercent >= 100);

  // Total notes
  const totalNotesCount = enrolledList.reduce((acc, curr) => acc + (curr.enrollment.notes?.length || 0), 0);
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Navigation items for the Right Sidebar
  const navItems = [
    {
      id: 'overview',
      label: 'نمای کلی داشبورد',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'my-courses',
      label: 'آموزش‌های من',
      icon: BookOpen,
      badge: toPersianDigits(enrolledList.length)
    },
    {
      id: 'transactions',
      label: 'تراکنش‌های مالی و اشتراک',
      icon: Receipt,
      badge: null
    },
    {
      id: 'wallet',
      label: 'کیف پول و موجودی',
      icon: Wallet,
      badge: `${toPersianDigits(Math.floor(walletBalance / 1000).toLocaleString('fa-IR'))}k`
    },
    {
      id: 'notifications',
      label: 'پیام‌ها و اعلان‌ها',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? `${toPersianDigits(unreadNotificationsCount)} جدید` : null
    },
    {
      id: 'downloads',
      label: 'فایل‌ها و دانلودها',
      icon: Download,
      badge: toPersianDigits(downloads.length)
    },
    {
      id: 'certificates',
      label: 'گواهینامه‌های من',
      icon: Award,
      badge: completedList.length > 0 ? toPersianDigits(completedList.length) : null
    },
    {
      id: 'notes',
      label: 'یادداشت‌های درسی',
      icon: FileText,
      badge: totalNotesCount > 0 ? toPersianDigits(totalNotesCount) : null
    },
    {
      id: 'profile',
      label: 'ویرایش مشخصات و رمز عبور',
      icon: User,
      badge: null
    },
    ...(isInstructorRegistrationEnabled ? [{
      id: 'instructor-request',
      label: 'درخواست تدریس و مدرسی',
      icon: GraduationCap,
      badge: instructorApplications.filter(a => a.userId === currentUser.id).length > 0 ? 'ثبت شده' : null
    }] : [])
  ];

  const isVipActive = Boolean(
    currentUser?.subscriptionEndDate &&
    new Date(currentUser.subscriptionEndDate).getTime() > Date.now()
  );

  const daysRemaining = currentUser?.subscriptionEndDate
    ? Math.max(0, Math.ceil((new Date(currentUser.subscriptionEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const formattedExpiryDate = currentUser?.subscriptionEndDate
    ? new Date(currentUser.subscriptionEndDate).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  return (
    <div className="py-8 bg-slate-50/70 dark:bg-slate-950/70 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ================= FULL-WIDTH MODERN GLASSMORPHISM VIP PRO BANNER ================= */}
        {isVipActive && (
          <div className="relative mb-8 overflow-hidden rounded-3xl border border-amber-400/40 dark:border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-purple-600/10 to-teal-500/15 dark:from-amber-950/40 dark:via-purple-950/20 dark:to-teal-950/30 backdrop-blur-xl shadow-xl shadow-amber-500/5 p-6 sm:p-8">
            {/* Ambient decorative lighting orbs */}
            <div className="absolute -top-16 -right-16 w-72 h-72 bg-amber-400/20 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-teal-400/20 dark:bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 ring-4 ring-white/60 dark:ring-slate-900/60 shrink-0">
                  <Crown size={38} className="text-slate-950 fill-slate-950 drop-shadow animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black shadow-xs flex items-center gap-1">
                      <Sparkles size={13} className="fill-slate-950" />
                      <span>PRO / VIP ACCESS</span>
                    </span>
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-200/50 dark:bg-amber-900/50 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/80">
                      اشتراک ویژه فعال
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    شما کاربر PRO / VIP هستید ✨
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                    تمامی دوره‌های تخصصی، کارگاه‌های پیشرفته، جلسات VIP و سورس‌کدهای اختصاصی بدون هیچ محدودیتی برای حساب کاربری شما باز و در دسترس هستند.
                  </p>
                </div>
              </div>

              {/* Status & Actions Box */}
              <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <div className="px-4 py-3 rounded-2xl bg-white/75 dark:bg-slate-900/75 border border-amber-300/50 dark:border-amber-700/50 backdrop-blur-md text-center sm:text-start">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    تاریخ انقضا: {formattedExpiryDate}
                  </div>
                  <div className="text-sm font-black text-amber-600 dark:text-amber-400 flex items-center justify-center sm:justify-start gap-1 font-mono mt-0.5">
                    <span>{toPersianDigits(daysRemaining)}</span>
                    <span className="text-xs font-sans">روز دیگر باقیمانده</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('vip')}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  <Sparkles size={16} />
                  <span>تمدید و انباشت زمان</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Dashboard Layout: Right Sidebar + Left Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= RIGHT SIDEBAR ================= */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-6 lg:sticky lg:top-24">
            
            {/* User Profile Mini Card */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
              
              {/* Background Accent glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-teal-500/30"
                  />
                  <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 absolute -bottom-1 -left-1" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </h2>
                  </div>
                  <span className="text-[11px] text-slate-400 block truncate mt-0.5" dir="ltr">
                    {currentUser.email}
                  </span>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      currentUser.role === 'admin'
                        ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                        : 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300'
                    }`}>
                      {currentUser.role === 'admin' ? 'مدیر ارشد و صاحب پلتفرم' : 'دانشجوی تخصصی'}
                    </span>
                    {currentUser.subscriptionEndDate && new Date(currentUser.subscriptionEndDate).getTime() > Date.now() ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                        <Crown size={10} className="text-amber-600" />
                        <span>VIP</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* VIP Subscription Quick Card in Sidebar */}
              {currentUser.subscriptionEndDate && new Date(currentUser.subscriptionEndDate).getTime() > Date.now() ? (
                <div
                  onClick={() => navigate('vip')}
                  className="mt-4 p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-700/60 flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                      <Crown size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-900 dark:text-amber-200 font-extrabold block">اشتراک ویژه VIP فعال</span>
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block font-mono">
                        {toPersianDigits(Math.max(0, Math.ceil((new Date(currentUser.subscriptionEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))))} روز باقیمانده
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('vip');
                    }}
                    className="text-amber-700 dark:text-amber-300 text-xs font-bold hover:underline"
                  >
                    تمدید
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => navigate('vip')}
                  className="mt-4 p-3 rounded-2xl bg-gradient-to-l from-amber-500/15 to-orange-500/15 border border-amber-400/40 flex items-center justify-between cursor-pointer hover:border-amber-500/70 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                      <Crown size={16} />
                    </div>
                    <div>
                      <span className="text-[11px] text-amber-900 dark:text-amber-200 font-black block">خرید اشتراک ویژه (VIP)</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">دسترسی به تمام دوره‌ها</span>
                    </div>
                  </div>
                  <Sparkles size={15} className="text-amber-500 group-hover:scale-110 transition-transform" />
                </div>
              )}

              {/* Wallet Quick Summary in Sidebar */}
              <div 
                onClick={() => setActiveTab('wallet')}
                className="mt-2.5 p-3.5 rounded-2xl bg-gradient-to-l from-slate-900 to-indigo-950 text-white flex items-center justify-between cursor-pointer hover:shadow-md transition-all group border border-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center">
                    <Wallet size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 block">اعتبار کیف پول</span>
                    <span className="text-xs font-black font-mono text-white">
                      {toPersianDigits(walletBalance.toLocaleString('fa-IR'))} تومان
                    </span>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab('wallet');
                  }}
                  className="w-7 h-7 rounded-lg bg-teal-500 group-hover:bg-teal-400 text-slate-950 flex items-center justify-center transition-colors"
                  title="شارژ کیف پول"
                >
                  <Plus size={15} />
                </button>
              </div>

            </div>

            {/* Vertical Navigation Menu */}
            <nav className="p-3 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                منوی کاربری داشبورد
              </div>

              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as DashboardTabType)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Admin Studio Jump Button (Only visible in dashboard if admin) */}
              {(userRole === 'admin' || currentUser.role === 'admin') && (
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => navigate('admin')}
                    className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl bg-gradient-to-l from-teal-700 to-indigo-700 text-white text-xs font-bold shadow-md hover:opacity-95 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles size={18} className="text-teal-300" />
                      <span>استودیو و پنل مدیریت دوره‌ها</span>
                    </div>
                    <ChevronLeft size={16} />
                  </button>
                </div>
              )}

              {/* Logout Action */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    logout();
                    navigate('home');
                    addToast({
                      title: 'خروج از حساب',
                      message: 'با موفقیت از حساب کاربری خارج شدید.',
                      type: 'info'
                    });
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>خروج از حساب کاربری</span>
                </button>
              </div>

            </nav>

            {/* Support / Quick Help Box */}
            <div className="p-4 rounded-3xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-1">
                <Zap size={14} className="text-teal-600 dark:text-teal-400" />
                <span>پشتیبانی و راهنما</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                در صورت بروز هرگونه سوال پیرامون دوره‌ها یا شارژ کیف پول با پشتیبانی آنلاین در ارتباط باشید.
              </p>
            </div>

          </aside>

          {/* ================= LEFT MAIN CONTENT AREA ================= */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* Mobile Tab Scroller */}
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as DashboardTabType)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Tab View Rendering */}
            {activeTab === 'overview' && (
              <OverviewTab 
                onSwitchTab={(t) => setActiveTab(t as DashboardTabType)} 
                onOpenChargeModal={() => setActiveTab('wallet')}
              />
            )}

            {activeTab === 'my-courses' && (
              <MyCoursesTab 
                onSwitchToCertificates={() => setActiveTab('certificates')} 
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionsTab />
            )}

            {activeTab === 'wallet' && (
              <WalletTab />
            )}

            {activeTab === 'notifications' && (
              <NotificationsTab />
            )}

            {activeTab === 'downloads' && (
              <DownloadsTab />
            )}

            {activeTab === 'certificates' && (
              <CertificatesTab />
            )}

            {activeTab === 'notes' && (
              <NotesTab />
            )}

            {activeTab === 'profile' && (
              <ProfileSettingsTab />
            )}

            {activeTab === 'instructor-request' && isInstructorRegistrationEnabled && (
              <InstructorRequestTab />
            )}

          </main>

        </div>

      </div>
    </div>
  );
};
