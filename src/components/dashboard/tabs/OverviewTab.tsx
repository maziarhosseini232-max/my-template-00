import React from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  BookOpen, CheckCircle2, Wallet, Download, Clock, 
  Flame, Play, Award, FileText, ArrowRight, ArrowLeft,
  ChevronLeft, Sparkles, TrendingUp, ShieldCheck, Zap, Crown
} from 'lucide-react';
import { formatPriceToman, toPersianDigits } from '../../../utils/persian';

interface OverviewTabProps {
  onSwitchTab: (tabId: string) => void;
  onOpenChargeModal: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onSwitchTab, onOpenChargeModal }) => {
  const { 
    currentUser, 
    enrollments, 
    courses, 
    walletBalance, 
    transactions, 
    navigate,
    isRTL,
    language 
  } = useApp();

  // Enrolled courses list
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

  // Notes count
  const totalNotesCount = enrolledList.reduce((acc, curr) => acc + (curr.enrollment.notes?.length || 0), 0);

  // Recent transactions (last 3)
  const recentTransactions = transactions.slice(0, 3);

  // VIP Subscription status
  const hasActiveSubscription = Boolean(
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
    <div className="space-y-8 animate-fadeIn">
      {/* VIP Subscription Status Banner */}
      {hasActiveSubscription ? (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-teal-500/10 border border-amber-400/40 dark:border-amber-500/30 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                <Crown size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    اشتراک ویژه VIP شما فعال است
                  </h3>
                  <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    فعال
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  تاریخ پایان اعتبار: <strong className="text-amber-700 dark:text-amber-300 font-mono">{formattedExpiryDate}</strong> ({toPersianDigits(daysRemaining)} روز باقیمانده)
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('vip')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>تمدید یا افزایش مدت اشتراک</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-xl border border-indigo-800/60 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-amber-300 flex items-center justify-center shrink-0 border border-white/10">
                <Crown size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-white">
                    به خانواده اعضای ویژه (VIP) بپیوندید
                  </h3>
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    دسترسی نامحدود
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  با تهیه اشتراک VIP، به تمامی دوره‌های تخصصی، وبینارها و سورس‌کدها دسترسی آزاد پیدا کنید.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('vip')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Crown size={14} />
              <span>مشاهده پلن‌ها و تهیه اشتراک</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Card 1: My Courses */}
        <div 
          onClick={() => onSwitchTab('my-courses')}
          className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/50 dark:hover:border-teal-500/50 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">دوره‌های من</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {toPersianDigits(enrolledList.length)}
            </span>
            <span className="text-xs text-slate-400">دوره آموزشی</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-medium">
            <span>{toPersianDigits(inProgressList.length)} دوره در حال یادگیری</span>
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Wallet Balance */}
        <div 
          onClick={() => onSwitchTab('wallet')}
          className="group relative p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white border border-indigo-800 shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-200">موجودی کیف پول</span>
            <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-white font-mono">
              {toPersianDigits(walletBalance.toLocaleString('fa-IR'))}
            </span>
            <span className="text-xs text-indigo-200">تومان</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-emerald-300 flex items-center gap-1">
              <Zap size={12} />
              شارژ آنی و بدون کارمزد
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onOpenChargeModal();
              }}
              className="px-2.5 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer"
            >
              + شارژ سریع
            </button>
          </div>
        </div>

        {/* Card 3: Completed & Certificates */}
        <div 
          onClick={() => onSwitchTab('certificates')}
          className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">گواهینامه‌های رسمی</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {toPersianDigits(completedList.length)}
            </span>
            <span className="text-xs text-slate-400">مدرک اخذ شده</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <span>مشاهده و استعلام مدارک</span>
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* Section: In-Progress Learning Courses */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Flame size={18} className="fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                ادامه روند یادگیری
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                دوره‌های در دست مطالعه شما با آخرین وضعیت پیشرفت جلسات
              </p>
            </div>
          </div>
          <button 
            onClick={() => onSwitchTab('my-courses')}
            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
          >
            <span>مشاهده همه</span>
            <ChevronLeft size={16} />
          </button>
        </div>

        {inProgressList.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {inProgressList.map(({ course, enrollment }) => {
              const progress = enrollment.progressPercent || 0;
              const completedLessons = enrollment.completedLessonIds?.length || 0;
              const totalLessons = course.lessonCount || 10;

              return (
                <div 
                  key={course.id}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:border-teal-500/40 transition-colors"
                >
                  <div className="relative w-full sm:w-36 h-28 sm:h-24 rounded-xl overflow-hidden shrink-0 group">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-9 h-9 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center shadow-lg">
                        <Play size={16} className="fill-current mr-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono font-medium backdrop-blur-xs">
                      {toPersianDigits(progress)}٪
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-950/80 px-2 py-0.5 rounded-full">
                          {course.categoryName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {toPersianDigits(completedLessons)} از {toPersianDigits(totalLessons)} جلسه
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {course.title}
                      </h3>
                    </div>

                    <div className="mt-3">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-2">
                        <div 
                          className="bg-gradient-to-l from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          مدرس: {course.instructorName}
                        </span>
                        <button
                          onClick={() => navigate('player', course.id)}
                          className="flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700"
                        >
                          <span>ادامه یادگیری</span>
                          <ChevronLeft size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <BookOpen size={28} className="text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              هیچ دوره فعالی در حال یادگیری ندارید
            </p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              از میان دوره‌های تخصصی هوش مصنوعی و طراحی محصول دوره مورد علاقه خود را آغاز کنید.
            </p>
            <button
              onClick={() => navigate('catalog')}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors"
            >
              مرور تمام دوره‌ها
            </button>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Wallet size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                آخرین تراکنش‌های مالی
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                سابقه شارژ، خرید و دریافت اعتبار هدیه
              </p>
            </div>
          </div>
          <button 
            onClick={() => onSwitchTab('wallet')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <span>مشاهده کیف پول</span>
            <ChevronLeft size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentTransactions.map(tx => {
            const isDeposit = tx.type === 'deposit' || tx.type === 'bonus';
            return (
              <div 
                key={tx.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isDeposit 
                      ? 'bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-indigo-100/70 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {isDeposit ? <TrendingUp size={16} /> : <BookOpen size={16} />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {tx.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {tx.date} • کد پیگیری: {tx.trackingCode}
                    </p>
                  </div>
                </div>
                <div className="text-left shrink-0">
                  <span className={`text-xs font-black font-mono ${
                    isDeposit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                  }`}>
                    {isDeposit ? '+' : '-'}{toPersianDigits(tx.amount.toLocaleString('fa-IR'))}
                  </span>
                  <span className="text-[10px] text-slate-400 block">تومان</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
