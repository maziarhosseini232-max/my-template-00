import React from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Users, 
  DollarSign, 
  FolderOpen, 
  TrendingUp, 
  Plus, 
  UploadCloud, 
  FileCode, 
  ArrowUpRight, 
  Play, 
  Sparkles, 
  Edit3, 
  Eye, 
  Copy,
  AlertCircle
} from 'lucide-react';
import { toPersianDigits, formatTomanPrice } from '../../../utils/persian';
import { Course } from '../../../types';

interface StudioDashboardProps {
  onSelectTab: (tab: any) => void;
  onEditCourse: (course: Course) => void;
  onPreviewCourse: (course: Course) => void;
  onOpenBulkUpload: () => void;
  onOpenImport: () => void;
}

export const StudioDashboard: React.FC<StudioDashboardProps> = ({
  onSelectTab,
  onEditCourse,
  onPreviewCourse,
  onOpenBulkUpload,
  onOpenImport
}) => {
  const { courses, mediaAssets, enrollments, duplicateCourse, updateCourseStatus } = useApp();

  const publishedCourses = courses.filter(c => c.status === 'published');
  const draftCourses = courses.filter(c => c.status === 'draft');
  const pendingCourses = courses.filter(c => c.status === 'pending');
  const totalStudents = courses.reduce((sum, c) => sum + (c.studentCount || 0), 0);
  const totalRevenue = courses.reduce((sum, c) => sum + ((c.studentCount || 0) * (c.price || 0)), 0);

  const stats = [
    {
      title: 'کل دوره‌های پلتفرم',
      value: toPersianDigits(courses.length),
      subtext: `${toPersianDigits(publishedCourses.length)} دوره فعال در مارکت‌پلیس`,
      icon: BookOpen,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
      badge: '+۱۲٪ رشد این ماه'
    },
    {
      title: 'پیش‌نویس‌ها و کارتابل',
      value: toPersianDigits(draftCourses.length + pendingCourses.length),
      subtext: `${toPersianDigits(draftCourses.length)} پیش‌نویس | ${toPersianDigits(pendingCourses.length)} در انتظار انتشار`,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
      badge: 'نیازمند تکمیل'
    },
    {
      title: 'مجموع دانشجویان فعال',
      value: toPersianDigits(totalStudents),
      subtext: 'دانشجوی ثبت‌نام‌شده در دوره‌ها',
      icon: Users,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
      badge: 'نرخ تکمیل ۸۴٪'
    },
    {
      title: 'ارزش فروش ناخالص دوره‌ها',
      value: formatTomanPrice(totalRevenue),
      subtext: 'مجموع ارزش تراکنش‌های ثبت‌شده',
      icon: DollarSign,
      color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400',
      badge: 'تضمین تسویه'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner with Quick Action Launchpad */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0b3b49] via-[#092b36] to-[#06242e] text-white p-6 sm:p-8 shadow-sm border border-teal-900/60 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-96 h-96 bg-[#5eead4]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5eead4]/20 border border-[#5eead4]/30 text-[#5eead4] text-xs font-extrabold">
              <Sparkles size={14} />
              <span>مرکز فرماندهی تولید و انتشار محتوای آموزشی</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              به استودیو مدیریت دوره‌ها خوش آمدید
            </h2>
            <p className="text-sm text-[#8ab5be] leading-relaxed">
              تمامی مراحل ساخت دوره، چیدمان سرفصل‌ها با کشیدن و رها کردن (Drag & Drop)، بارگذاری چندگانه فایل‌های ویدیویی، تعیین قیمت، سئو و انتشار در این بخش قابل مدیریت است.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('create-course')}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#5eead4] hover:bg-[#2dd4bf] text-[#06242e] font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              <Plus size={18} />
              <span>ایجاد دوره جدید</span>
            </button>
            <button
              onClick={onOpenBulkUpload}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer backdrop-blur-xs"
            >
              <UploadCloud size={17} />
              <span>بارگذاری گروهی ویدیو</span>
            </button>
            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer backdrop-blur-xs"
            >
              <FileCode size={17} />
              <span>درون‌ریزی JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon size={20} />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4]">
                  {stat.badge}
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-[#06242e] dark:text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-[#06242e] dark:text-slate-200 mt-0.5">
                  {stat.title}
                </div>
                <div className="text-[11px] text-[#527683] dark:text-[#8ab5be] mt-1">
                  {stat.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Courses and Quick Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Course Catalog Snapshot (2 Columns) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#06242e] dark:text-white">
                دوره‌های اخیر پلتفرم
              </h3>
              <p className="text-xs text-[#527683] dark:text-[#8ab5be]">
                آخرین دوره‌های ایجاد شده یا در حال ویرایش
              </p>
            </div>
            <button
              onClick={() => onSelectTab('courses')}
              className="text-xs font-bold text-[#0d9488] dark:text-[#5eead4] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>مشاهده همه</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* List of courses */}
          <div className="space-y-3">
            {courses.slice(0, 4).map(course => {
              const statusLabels: Record<string, { label: string; style: string }> = {
                published: { label: 'منتشرشده', style: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
                draft: { label: 'پیش‌نویس', style: 'bg-slate-100 text-slate-700 dark:bg-[#0e3b47] dark:text-slate-300 border-slate-200 dark:border-teal-800' },
                pending: { label: 'در حال بررسی', style: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
                disabled: { label: 'غیرفعال', style: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800' }
              };

              const statusInfo = statusLabels[course.status] || statusLabels.draft;
              const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);

              return (
                <div
                  key={course.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-[#ccede5]/70 dark:border-teal-900/40 hover:bg-[#f0fbf8] dark:hover:bg-[#092b36] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-14 h-11 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-teal-900"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.style}`}>
                          {statusInfo.label}
                        </span>
                        <span className="text-[11px] text-[#527683] dark:text-[#8ab5be]">
                          {course.categoryName}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#06242e] dark:text-white truncate mt-1">
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] text-[#527683] dark:text-[#8ab5be] mt-0.5">
                        <span>{toPersianDigits(course.modules.length)} فصل</span>
                        <span>•</span>
                        <span>{toPersianDigits(totalLessons)} جلسه</span>
                        <span>•</span>
                        <span>{course.price ? formatTomanPrice(course.price) : 'رایگان'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onPreviewCourse(course)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-[#0e3b47] hover:bg-slate-200 dark:hover:bg-[#124d5d] text-[#06242e] dark:text-slate-200 transition-colors cursor-pointer"
                      title="پیش‌نمایش دوره"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => duplicateCourse(course.id)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-[#0e3b47] hover:bg-slate-200 dark:hover:bg-[#124d5d] text-[#06242e] dark:text-slate-200 transition-colors cursor-pointer"
                      title="ایجاد نسخه کپی"
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      onClick={() => onEditCourse(course)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Edit3 size={13} />
                      <span>ویرایش</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Media Library Quick Card & Publishing Guidelines */}
        <div className="space-y-4">
          
          {/* Media Assets Summary */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="text-[#0d9488] dark:text-[#5eead4]" size={18} />
                <h3 className="font-extrabold text-sm text-[#06242e] dark:text-white">
                  کتابخانه رسانه‌ها
                </h3>
              </div>
              <button
                onClick={() => onSelectTab('media')}
                className="text-xs font-bold text-[#0d9488] dark:text-[#5eead4] hover:underline cursor-pointer"
              >
                مدیریت فایل‌ها
              </button>
            </div>
            
            <p className="text-xs text-[#527683] dark:text-[#8ab5be] mb-4">
              {toPersianDigits(mediaAssets.length)} فایل رسانه‌ای (ویدیو، تصویر، PDF و فایل‌های دانلودی) آماده الحاق به دوره‌ها.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-[#def4ee]/50 dark:bg-[#0e3b47]/40 border border-[#ccede5] dark:border-teal-900/40 text-center">
                <div className="text-lg font-black text-[#0b3b49] dark:text-[#5eead4]">
                  {toPersianDigits(mediaAssets.filter(m => m.type === 'video').length)}
                </div>
                <div className="text-[11px] text-[#527683] dark:text-[#8ab5be]">ویدیوهای آموزشی</div>
              </div>
              <div className="p-3 rounded-xl bg-[#def4ee]/50 dark:bg-[#0e3b47]/40 border border-[#ccede5] dark:border-teal-900/40 text-center">
                <div className="text-lg font-black text-[#0b3b49] dark:text-[#5eead4]">
                  {toPersianDigits(mediaAssets.filter(m => m.type === 'pdf' || m.type === 'download').length)}
                </div>
                <div className="text-[11px] text-[#527683] dark:text-[#8ab5be]">جزوات و فایل‌ها</div>
              </div>
            </div>

            <button
              onClick={onOpenBulkUpload}
              className="w-full mt-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#09222b] hover:bg-slate-200 dark:hover:bg-[#0e3b47] text-[#06242e] dark:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-transparent dark:border-teal-900/40"
            >
              <UploadCloud size={16} />
              <span>بارگذاری رسانه جدید</span>
            </button>
          </div>

          {/* Publishing Checklist Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/50 dark:from-[#092b36] dark:to-[#06242e] border border-emerald-200 dark:border-teal-900/60">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs mb-2">
              <CheckCircle2 size={16} />
              <span>دستورالعمل انتشار دوره استاندارد</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-[#527683] dark:text-[#8ab5be]">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>کاور با ابعاد 16:9 و کیفیت حداقل 1080p</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>حداقل ۱ فصل و ۳ جلسه ویدیویی تکمیل‌شده</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>تنظیم حداقل ۱ جلسه رایگان جهت پیش‌نمایش</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>تعیین سرفصل‌ها و اهداف یادگیری در تب سئو</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
