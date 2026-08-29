import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CourseCard } from '../common/CourseCard';
import { 
  BookOpen, CheckCircle2, Award, FileText, 
  Flame, Clock, Download, CreditCard, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { formatPriceToman, toPersianDigits } from '../../utils/persian';

export const StudentDashboard: React.FC = () => {
  const { 
    currentUser, 
    enrollments, 
    courses, 
    navigate, 
    addToast,
    t, 
    isRTL,
    language 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed' | 'notes' | 'certificates' | 'history'>('in-progress');

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

  // All notes across courses
  const allNotes = enrolledList.flatMap(item => 
    (item.enrollment.notes || []).map(n => ({
      ...n,
      courseTitle: item.course.title,
      courseId: item.course.id
    }))
  );

  return (
    <div className="py-10 bg-slate-50/50 dark:bg-slate-950/60 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* User Hero Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/10"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold font-serif">{currentUser.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold uppercase">
                    {language === 'fa' ? 'دانشجوی حرفه‌ای' : 'Pro Learner'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1" dir="ltr">{currentUser.email}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-indigo-200">
                  <div className="flex items-center gap-1">
                    <Flame size={14} className="text-amber-400 fill-amber-400" />
                    <span>{language === 'fa' ? `${toPersianDigits(7)} روز یادگیری مستمر` : '7-Day Active Streak'}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{language === 'fa' ? `${toPersianDigits(32.4)} ساعت زمان یادگیری` : '32.4 Hours Learned'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 self-stretch sm:self-auto justify-around sm:justify-start">
              <div className="text-center px-2">
                <div className="text-xl font-bold text-white">{toPersianDigits(enrolledList.length)}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {language === 'fa' ? 'ثبت‌نامی‌ها' : 'Enrolled'}
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center px-2">
                <div className="text-xl font-bold text-emerald-400">{toPersianDigits(completedList.length)}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {language === 'fa' ? 'تکمیل شده' : 'Completed'}
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center px-2">
                <div className="text-xl font-bold text-amber-400">{toPersianDigits(completedList.length)}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {language === 'fa' ? 'گواهی‌ها' : 'Certificates'}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto scrollbar-none text-xs font-bold">
          {[
            { id: 'in-progress', label: `${t('inProgress')} (${toPersianDigits(inProgressList.length)})`, icon: BookOpen },
            { id: 'completed', label: `${t('completed')} (${toPersianDigits(completedList.length)})`, icon: CheckCircle2 },
            { id: 'certificates', label: `${t('myCertificates')} (${toPersianDigits(completedList.length)})`, icon: Award },
            { id: 'notes', label: `${language === 'fa' ? 'یادداشت‌های من' : 'My Notes'} (${toPersianDigits(allNotes.length)})`, icon: FileText },
            { id: 'history', label: language === 'fa' ? 'تاریخچه پرداخت‌ها' : 'Order History', icon: CreditCard }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div>
          {/* In Progress */}
          {activeTab === 'in-progress' && (
            <div>
              {inProgressList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inProgressList.map(({ course }) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      showEnrollProgress={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <BookOpen size={28} className="text-indigo-500 mx-auto mb-3" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {language === 'fa' ? 'هیچ دوره‌ای در حال حاضر فعال نیست' : 'No courses in progress'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 mb-5">
                    {language === 'fa' ? 'کاتالوگ جامع دوره‌ها را مرور کرده و مهارت جدیدی انتخاب کنید.' : 'Browse the catalog and pick your next masterclass.'}
                  </p>
                  <button
                    onClick={() => navigate('catalog')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-900 text-white font-bold text-xs hover:bg-indigo-800"
                  >
                    {t('allCourses')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Completed */}
          {activeTab === 'completed' && (
            <div>
              {completedList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedList.map(({ course }) => (
                    <div
                      key={course.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4"
                    >
                      <img src={course.thumbnail} alt={course.title} className="w-full aspect-video rounded-xl object-cover" />
                      <div>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                          ✓ ۱۰۰٪ تکمیل شده
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">
                          {course.title}
                        </h4>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => navigate('player', course.id)}
                          className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                        >
                          {language === 'fa' ? 'مرور مجدد جلسات' : 'Review Lessons'}
                        </button>
                        <button
                          onClick={() => setActiveTab('certificates')}
                          className="flex-1 py-2 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400"
                        >
                          {t('myCertificates')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <Award size={28} className="text-slate-400 mx-auto mb-3" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {language === 'fa' ? 'هنوز دوره‌ای به پایان نرسیده است' : 'No completed courses yet'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'fa' ? 'با اتمام تمامی جلسات دوره، گواهی رسمی خود را دریافت نمایید.' : 'Complete all lessons in a course to earn your verified certificate.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Certificates */}
          {activeTab === 'certificates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledList.map(({ course }) => (
                <div
                  key={course.id}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      <span className="font-bold text-xs uppercase tracking-wider text-amber-500">
                        {language === 'fa' ? 'گواهی رسمی پایان دوره آکادمی لومینا' : 'Lumina Accredited Certificate'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400" dir="ltr">LUM-2026-{course.id.toUpperCase().slice(0, 4)}</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{course.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'fa' ? `مدرس دوره: ${course.instructorName}` : `Instructor: ${course.instructorName}`}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>صادر شده برای: <strong>{currentUser.name}</strong></span>
                    <span>وضعیت: <strong className="text-emerald-500">تایید شده ✓</strong></span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => addToast({ 
                        title: language === 'fa' ? 'گواهی دانلود شد' : 'Certificate Downloaded', 
                        message: language === 'fa' ? `فایل PDF گواهی دوره «${course.title}» ذخیره شد.` : `Downloaded PDF for ${course.title}`, 
                        type: 'success' 
                      })}
                      className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors"
                    >
                      <Download size={14} />
                      <span>{language === 'fa' ? 'دانلود فایل PDF' : 'Download PDF'}</span>
                    </button>
                    <button
                      onClick={() => navigate('player', course.id)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {language === 'fa' ? 'ورود به پلیر' : 'Open in Player'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {allNotes.length > 0 ? (
                allNotes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => navigate('player', note.courseId)}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:border-indigo-500/50 transition-all flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                        {note.courseTitle}
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200">{note.text}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-500 shrink-0" dir="ltr">
                      {toPersianDigits(Math.floor(note.timestampSeconds / 60))}:{toPersianDigits((note.timestampSeconds % 60).toString().padStart(2, '0'))}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <FileText size={28} className="text-slate-400 mx-auto mb-3" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {language === 'fa' ? 'هنوز یادداشتی ذخیره نکرده‌اید' : 'No saved notes'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'fa' ? 'هنگام تماشای هر جلسه، می‌توانید دقایق کلیدی را نشانه‌گذاری نمایید.' : 'Bookmark key timestamps while watching any video lesson.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Purchase Order History */}
          {activeTab === 'history' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-xs text-slate-400 uppercase tracking-wider">
                {language === 'fa' ? 'رسیدها و تراکنش‌های مالی' : 'Transaction Receipts'}
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {enrolledList.map(({ course }) => (
                  <div key={course.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{course.title}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {language === 'fa' 
                          ? `شماره سفارش: LUM-${course.id.slice(0, 5).toUpperCase()} • پرداخت آنلاین شتابی` 
                          : `Order #LUM-${course.id.slice(0, 5).toUpperCase()} • Paid via Credit Card`}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {formatPriceToman(course.price)}
                      </span>
                      <button
                        onClick={() => addToast({ 
                          title: language === 'fa' ? 'فاکتور ذخیره شد' : 'Invoice Downloaded', 
                          message: language === 'fa' ? `فاکتور دوره «${course.title}» دریافت شد.` : `Invoice for ${course.title} saved.`, 
                          type: 'info' 
                        })}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 transition-colors"
                        title={language === 'fa' ? 'دریافت فاکتور رسمی' : 'Download Invoice'}
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
