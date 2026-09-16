import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  BookOpen, CheckCircle2, Play, Award, 
  Search, Filter, Clock, Flame, ChevronLeft, ArrowRight,
  ExternalLink, Sparkles, Archive, ArchiveRestore, UserMinus, AlertCircle, X, Crown
} from 'lucide-react';
import { toPersianDigits, formatPriceToman } from '../../../utils/persian';

interface MyCoursesTabProps {
  onSwitchToCertificates: () => void;
}

export const MyCoursesTab: React.FC<MyCoursesTabProps> = ({ onSwitchToCertificates }) => {
  const { 
    enrollments, 
    courses, 
    navigate, 
    archiveCourse,
    dropCourse,
    t, 
    language 
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'in-progress' | 'completed' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [courseToDrop, setCourseToDrop] = useState<{ id: string; title: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Enrolled courses list
  const enrolledCourseIds = Object.keys(enrollments);
  const enrolledList = enrolledCourseIds
    .map(id => {
      const course = courses.find(c => c.id === id || c.slug === id);
      const enrollment = enrollments[id];
      return { course, enrollment };
    })
    .filter((item): item is { course: typeof courses[0]; enrollment: typeof enrollments[string] } => !!item.course);

  // Categories list
  const categories = Array.from(new Set(courses.map(c => c.categoryName)));

  // Filter based on active tab and query
  const getFilteredItems = () => {
    return enrolledList.filter(({ course, enrollment }) => {
      if (filterType === 'archived') {
        if (!enrollment.isArchived) return false;
      } else {
        // In other tabs, hide archived courses
        if (enrollment.isArchived) return false;
      }

      if (filterType === 'in-progress' && enrollment.progressPercent >= 100) return false;
      if (filterType === 'completed' && enrollment.progressPercent < 100) return false;
      if (selectedCategory !== 'all' && course.categoryName !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return course.title.toLowerCase().includes(q) || course.instructorName.toLowerCase().includes(q);
      }
      return true;
    });
  };

  const filteredItems = getFilteredItems();
  const nonArchivedEnrolled = enrolledList.filter(i => !i.enrollment.isArchived);
  const inProgressCount = nonArchivedEnrolled.filter(i => i.enrollment.progressPercent < 100).length;
  const completedCount = nonArchivedEnrolled.filter(i => i.enrollment.progressPercent >= 100).length;
  const archivedCount = enrolledList.filter(i => !!i.enrollment.isArchived).length;

  const handleConfirmDrop = async () => {
    if (!courseToDrop) return;
    setIsProcessing(true);
    try {
      await dropCourse(courseToDrop.id);
      setCourseToDrop(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Main Status Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-bold">
            {[
              { id: 'all', label: `همه آموزش‌ها (${toPersianDigits(nonArchivedEnrolled.length)})` },
              { id: 'in-progress', label: `در حال یادگیری (${toPersianDigits(inProgressCount)})` },
              { id: 'completed', label: `تکمیل شده (${toPersianDigits(completedCount)})` },
              { id: 'archived', label: `بایگانی شده (${toPersianDigits(archivedCount)})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as typeof filterType)}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  filterType === tab.id
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در دوره‌ها یا اساتید..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-teal-500"
            />
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

        </div>

      </div>

      {/* Courses Display Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(({ course, enrollment }) => {
            const progress = enrollment.progressPercent || 0;
            const isDone = progress >= 100;
            const completedCount = enrollment.completedLessonIds?.length || 0;
            const totalLessons = course.lessonCount || 10;

            return (
                <div 
                  key={course.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail & Badges */}
                    <div className="relative aspect-video overflow-hidden group">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold">
                            {course.categoryName}
                          </span>
                          {isDone ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[11px] font-bold flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              تکمیل شده
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-teal-500 text-slate-950 text-[11px] font-mono font-bold">
                              {toPersianDigits(progress)}٪ یادگیری
                            </span>
                          )}
                        </div>

                        <div className="text-white text-xs">
                          <span className="text-slate-300">مدرس:</span> {course.instructorName}
                        </div>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-relaxed">
                        {course.title}
                      </h3>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                          <span>پیشرفت دوره</span>
                          <span>{toPersianDigits(completedCount)} از {toPersianDigits(totalLessons)} جلسه</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isDone ? 'bg-emerald-500' : 'bg-gradient-to-l from-teal-500 to-emerald-400'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 sm:p-5 pt-0 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => navigate('player', course.id)}
                      className="flex-1 min-w-[120px] py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play size={14} className="fill-current" />
                      <span>{isDone ? 'مرور مجدد جلسات' : 'ادامه یادگیری'}</span>
                    </button>

                    {isDone && (
                      <>
                        <button
                          onClick={onSwitchToCertificates}
                          className="px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          title="مشاهده و دانلود گواهینامه رسمی"
                        >
                          <Award size={15} />
                        </button>
                        <button
                          onClick={() => archiveCourse(course.id)}
                          className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                            enrollment.isArchived 
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200' 
                              : 'bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                          }`}
                          title={enrollment.isArchived ? "خروج از بایگانی" : "بایگانی دوره"}
                        >
                          {enrollment.isArchived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                          <span className="hidden sm:inline">{enrollment.isArchived ? 'خروج از بایگانی' : 'بایگانی'}</span>
                        </button>
                      </>
                    )}

                    {(course.isFree || (course.price || 0) === 0) && (
                      <button
                        onClick={() => setCourseToDrop({ id: course.id, title: course.title })}
                        className="px-3 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title="انصراف از دوره (مختص دوره‌های رایگان)"
                      >
                        <UserMinus size={15} />
                        <span className="hidden sm:inline">انصراف</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
        </div>
      ) : (
        <div className="p-10 sm:p-14 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-inner">
            <BookOpen size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              {filterType === 'archived' ? 'هیچ دوره‌ای در بخش بایگانی قرار ندارد' : 'هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              با ارتقا به اشتراک ویژه VIP، قفل تمام دوره‌ها، کارگاه‌ها و فایل‌های تمرینی به صورت خودکار برای شما باز خواهد شد.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('vip')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Crown size={14} />
              <span>خرید اشتراک ویژه VIP (ارتقای حساب)</span>
            </button>
            <button
              onClick={() => navigate('catalog')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              مشاهده کاتالوگ دوره‌ها
            </button>
          </div>
        </div>
      )}

      {/* Course Drop Confirmation Modal */}
      {courseToDrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-xl">
                <AlertCircle size={22} />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">انصراف از دوره آموزشی</h3>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              آیا از انصراف از دوره <strong className="text-slate-900 dark:text-white">«{courseToDrop.title}»</strong> اطمینان دارید؟ 
              با انجام این کار، این دوره از حساب شما حذف شده و برای دسترسی مجدد باید دوباره ثبت‌نام کنید.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCourseToDrop(null)}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                انصراف و بازگشت
              </button>
              <button
                onClick={handleConfirmDrop}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isProcessing ? 'در حال پردازش...' : 'تأیید انصراف از دوره'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
