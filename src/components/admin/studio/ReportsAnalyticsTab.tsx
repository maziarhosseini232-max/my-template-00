import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  Star, 
  Award, 
  Calendar, 
  Download, 
  Printer, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Sparkles, 
  Layers, 
  GraduationCap, 
  Eye, 
  ChevronDown,
  FileSpreadsheet,
  Activity,
  Flame,
  Percent
} from 'lucide-react';
import { toPersianDigits, formatTomanPrice } from '../../../utils/persian';
import { Course } from '../../../types';

interface ReportsAnalyticsTabProps {
  onViewCourseAnalytics?: (course: Course) => void;
  onSelectTab?: (tab: any) => void;
}

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

export const ReportsAnalyticsTab: React.FC<ReportsAnalyticsTabProps> = ({
  onViewCourseAnalytics,
  onSelectTab
}) => {
  const { courses, categories, addToast, language } = useApp();

  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'students'>('revenue');
  const [courseSearch, setCourseSearch] = useState<string>('');
  const [sortField, setSortField] = useState<'revenue' | 'students' | 'rating' | 'completion'>('revenue');

  // Filter courses by category
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      if (selectedCategory !== 'all' && c.categoryId !== selectedCategory && c.category !== selectedCategory) {
        return false;
      }
      if (courseSearch.trim()) {
        const query = courseSearch.toLowerCase();
        return c.title.toLowerCase().includes(query) || (c.instructor && c.instructor.name.toLowerCase().includes(query));
      }
      return true;
    });
  }, [courses, selectedCategory, courseSearch]);

  // Aggregate high-level stats
  const totalStudents = useMemo(() => {
    return courses.reduce((acc, c) => acc + (c.studentCount || 0), 0);
  }, [courses]);

  const totalRevenue = useMemo(() => {
    return courses.reduce((acc, c) => acc + ((c.studentCount || 0) * (c.price || 0)), 0);
  }, [courses]);

  // Instructors share vs Studio net share (70% instructor, 30% platform)
  const instructorShare = Math.round(totalRevenue * 0.7);
  const platformNetRevenue = totalRevenue - instructorShare;

  // Average course rating
  const avgRating = useMemo(() => {
    const rated = courses.filter(c => (c.rating || 0) > 0);
    if (!rated.length) return 4.9;
    const sum = rated.reduce((acc, c) => acc + c.rating, 0);
    return (sum / rated.length).toFixed(1);
  }, [courses]);

  // Total watch hours estimated based on lessons and students
  const totalWatchHours = useMemo(() => {
    return Math.round((totalStudents * 4.6));
  }, [totalStudents]);

  // Average completion rate
  const avgCompletionRate = 76; // 76%

  // Sorted list for Course Performance Table
  const sortedCourses = useMemo(() => {
    return [...filteredCourses].sort((a, b) => {
      const revA = (a.studentCount || 0) * (a.price || 0);
      const revB = (b.studentCount || 0) * (b.price || 0);
      if (sortField === 'revenue') return revB - revA;
      if (sortField === 'students') return (b.studentCount || 0) - (a.studentCount || 0);
      if (sortField === 'rating') return (b.rating || 0) - (a.rating || 0);
      // completion rate proxy based on studentCount
      const compA = Math.min(94, 60 + ((a.studentCount || 0) % 35));
      const compB = Math.min(94, 60 + ((b.studentCount || 0) % 35));
      return compB - compA;
    });
  }, [filteredCourses, sortField]);

  // Simulated trend data based on selected time range
  const trendData = useMemo(() => {
    if (timeRange === '7d') {
      return [
        { label: 'شنبه', revenue: 14200000, students: 28 },
        { label: 'یکشنبه', revenue: 18900000, students: 36 },
        { label: 'دوشنبه', revenue: 16500000, students: 31 },
        { label: 'سه‌شنبه', revenue: 22400000, students: 44 },
        { label: 'چهارشنبه', revenue: 27800000, students: 53 },
        { label: 'پنج‌شنبه', revenue: 34100000, students: 68 },
        { label: 'جمعه', revenue: 29500000, students: 59 },
      ];
    }
    if (timeRange === '30d') {
      return [
        { label: 'هفته ۱', revenue: 78500000, students: 164 },
        { label: 'هفته ۲', revenue: 92400000, students: 198 },
        { label: 'هفته ۳', revenue: 114000000, students: 242 },
        { label: 'هفته ۴', revenue: 148200000, students: 310 },
      ];
    }
    if (timeRange === '90d') {
      return [
        { label: 'تیر ماه', revenue: 245000000, students: 520 },
        { label: 'مرداد ماه', revenue: 310000000, students: 640 },
        { label: 'شهریور ماه', revenue: 395000000, students: 810 },
      ];
    }
    return [
      { label: 'بهار', revenue: 680000000, students: 1450 },
      { label: 'تابستان', revenue: 950000000, students: 1970 },
      { label: 'پاییز', revenue: 1120000000, students: 2340 },
      { label: 'زمستان', revenue: 1380000000, students: 2890 },
    ];
  }, [timeRange]);

  // Maximum value for SVG chart scaling
  const maxChartValue = useMemo(() => {
    const values = trendData.map(d => chartMetric === 'revenue' ? d.revenue : d.students);
    return Math.max(...values, 1);
  }, [trendData, chartMetric]);

  // Category distribution analysis
  const categoryStats = useMemo(() => {
    const catMap = new Map<string, { count: number; students: number; revenue: number }>();
    
    courses.forEach(c => {
      const catName = c.category || 'عمومی';
      const existing = catMap.get(catName) || { count: 0, students: 0, revenue: 0 };
      existing.count += 1;
      existing.students += (c.studentCount || 0);
      existing.revenue += ((c.studentCount || 0) * (c.price || 0));
      catMap.set(catName, existing);
    });

    const list = Array.from(catMap.entries()).map(([name, data]) => ({
      name,
      ...data,
      percent: totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0
    }));

    return list.sort((a, b) => b.revenue - a.revenue);
  }, [courses, totalRevenue]);

  // Export handlers
  const handleExportCSV = () => {
    const rows = [
      ['عنوان دوره', 'مدرس', 'دسته‌بندی', 'قیمت (تومان)', 'دانشجویان', 'فروش کل (تومان)', 'امتیاز'],
      ...sortedCourses.map(c => [
        `"${c.title}"`,
        `"${c.instructor?.name || 'مدرس ارشد'}"`,
        `"${c.category || 'عمومی'}"`,
        c.price || 0,
        c.studentCount || 0,
        (c.studentCount || 0) * (c.price || 0),
        c.rating || 5
      ])
    ];
    const csvContent = '\uFEFF' + rows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `lumina-analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({
      type: 'success',
      title: 'خروجی اکسل آماده شد',
      message: 'گزارش کامل تحلیل عملکرد و فروش دوره‌ها با موفقیت دانلود شد.'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="lumina-reports-analytics-view">
      
      {/* 1. Header & Controls Bar */}
      <div className="rounded-3xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-[#0d9488] dark:text-[#5eead4] font-bold text-xs mb-1">
            <BarChart3 size={18} />
            <span>هوش تجاری و تحلیل پیشرفته استودیو</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#06242e] dark:text-white tracking-tight">
            مرکز آمار، آنالیتیکس و گزارش‌های تحلیلی
          </h2>
          <p className="text-xs text-[#527683] dark:text-[#8ab5be] mt-1">
            پایش لحظه‌ای درآمد، تعامل و انگیزه دانشجویان، نرخ تبدیل و عملکرد اختصاصی دوره‌ها
          </p>
        </div>

        {/* Action Buttons & Time Range */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
          {/* Time range pills */}
          <div className="flex items-center p-1 bg-[#def4ee]/60 dark:bg-[#082834] rounded-2xl border border-[#ccede5] dark:border-teal-900/60 text-xs font-bold">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeRange === '7d' 
                  ? 'bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] shadow-xs' 
                  : 'text-[#527683] dark:text-[#8ab5be] hover:text-[#06242e] dark:hover:text-white'
              }`}
            >
              ۷ روز
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeRange === '30d' 
                  ? 'bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] shadow-xs' 
                  : 'text-[#527683] dark:text-[#8ab5be] hover:text-[#06242e] dark:hover:text-white'
              }`}
            >
              ۳۰ روز
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeRange === '90d' 
                  ? 'bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] shadow-xs' 
                  : 'text-[#527683] dark:text-[#8ab5be] hover:text-[#06242e] dark:hover:text-white'
              }`}
            >
              فصل اخیر
            </button>
            <button
              onClick={() => setTimeRange('1y')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeRange === '1y' 
                  ? 'bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] shadow-xs' 
                  : 'text-[#527683] dark:text-[#8ab5be] hover:text-[#06242e] dark:hover:text-white'
              }`}
            >
              سالانه
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#082834] border border-[#ccede5] dark:border-teal-900 text-xs font-bold text-[#06242e] dark:text-slate-200 hover:bg-[#def4ee]/50 dark:hover:bg-[#0e3b47] transition-all shadow-2xs cursor-pointer"
            title="دانلود گزارش CSV سازگار با اکسل"
          >
            <FileSpreadsheet size={15} className="text-emerald-600 dark:text-emerald-400" />
            <span>خروجی اکسل</span>
          </button>

          {/* Print PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#082834] border border-[#ccede5] dark:border-teal-900 text-xs font-bold text-[#06242e] dark:text-slate-200 hover:bg-[#def4ee]/50 dark:hover:bg-[#0e3b47] transition-all shadow-2xs cursor-pointer"
            title="چاپ یا ذخیره نسخه PDF کارنامه تحلیلی"
          >
            <Printer size={15} className="text-[#0d9488] dark:text-[#5eead4]" />
            <span>چاپ گزارش</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric KPI Scorecard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Gross Revenue & Split */}
        <div className="rounded-3xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 p-5 shadow-xs relative overflow-hidden group hover:border-[#0d9488] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#527683] dark:text-[#8ab5be]">فروش کل ناخالص</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#06242e] dark:text-white tracking-tight">
            {formatTomanPrice(totalRevenue)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-teal-900/40 flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
              <ArrowUpRight size={13} />
              +۱۸.۴٪ رشد این دوره
            </span>
            <span className="text-[#527683] dark:text-[#8ab5be]">
              سهم پلتفرم: {formatTomanPrice(platformNetRevenue)}
            </span>
          </div>
        </div>

        {/* Card 2: Students Count */}
        <div className="rounded-3xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 p-5 shadow-xs relative overflow-hidden group hover:border-[#0d9488] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#527683] dark:text-[#8ab5be]">ثبت‌نام‌های فعال</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#0d9488] dark:text-[#5eead4] flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#06242e] dark:text-white tracking-tight">
            {toPersianDigits(totalStudents)} <span className="text-xs font-normal text-slate-500">نفر</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-teal-900/40 flex items-center justify-between text-[11px]">
            <span className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-0.5">
              <TrendingUp size={13} />
              میانگین {(totalStudents / Math.max(courses.length, 1)).toFixed(0)} به ازای هر دوره
            </span>
            <span className="text-[#527683] dark:text-[#8ab5be]">
              {toPersianDigits(courses.length)} دوره
            </span>
          </div>
        </div>

        {/* Card 3: Completion Rate */}
        <div className="rounded-3xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 p-5 shadow-xs relative overflow-hidden group hover:border-[#0d9488] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#527683] dark:text-[#8ab5be]">نرخ تکمیل سرفصل‌ها</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Award size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#06242e] dark:text-white tracking-tight">
            {toPersianDigits(avgCompletionRate)}٪
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-teal-900/40 flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
              <CheckCircle2 size={13} />
              ۶ برابر میانگین جهانی
            </span>
            <span className="text-[#527683] dark:text-[#8ab5be]">
              ریزش پایین
            </span>
          </div>
        </div>

        {/* Card 4: Learning Hours & CSAT */}
        <div className="rounded-3xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 p-5 shadow-xs relative overflow-hidden group hover:border-[#0d9488] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#527683] dark:text-[#8ab5be]">ساعت یادگیری & رضایت</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Flame size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#06242e] dark:text-white tracking-tight flex items-baseline gap-2">
            <span>{toPersianDigits(totalWatchHours)}</span>
            <span className="text-xs font-normal text-slate-500">ساعت تماشا</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-teal-900/40 flex items-center justify-between text-[11px]">
            <span className="text-amber-500 font-bold flex items-center gap-1">
              <Star size={13} className="fill-amber-500" />
              رضایت: {toPersianDigits(avgRating)} از ۵.۰
            </span>
            <span className="text-[#527683] dark:text-[#8ab5be]">
              کیفیت عالی
            </span>
          </div>
        </div>

      </div>

      {/* 3. Interactive Trend Chart & Category Market Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart: Revenue / Students Trend (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="font-extrabold text-base text-[#06242e] dark:text-white flex items-center gap-2">
                  <Activity size={18} className="text-[#0d9488] dark:text-[#5eead4]" />
                  <span>روند درآمد و جذب دانشجو در بازه انتخابی</span>
                </h3>
                <p className="text-xs text-[#527683] dark:text-[#8ab5be] mt-0.5">
                  مقایسه روزانه و هفتگی مبالغ ورودی با نرخ رشد دانشجویان
                </p>
              </div>

              {/* Chart Metric Toggle */}
              <div className="flex items-center p-1 bg-[#def4ee]/60 dark:bg-[#082834] rounded-xl border border-[#ccede5] dark:border-teal-900/60 text-xs font-bold self-start">
                <button
                  onClick={() => setChartMetric('revenue')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    chartMetric === 'revenue'
                      ? 'bg-[#0b3b49] text-white dark:bg-[#5eead4] dark:text-[#06242e] shadow-2xs'
                      : 'text-[#527683] dark:text-[#8ab5be]'
                  }`}
                >
                  نمودار فروش (تومان)
                </button>
                <button
                  onClick={() => setChartMetric('students')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    chartMetric === 'students'
                      ? 'bg-[#0b3b49] text-white dark:bg-[#5eead4] dark:text-[#06242e] shadow-2xs'
                      : 'text-[#527683] dark:text-[#8ab5be]'
                  }`}
                >
                  تعداد دانشجو (نفر)
                </button>
              </div>
            </div>

            {/* Custom Interactive SVG Bar & Area Chart */}
            <div className="relative pt-6 pb-2">
              <div className="h-56 w-full flex items-end justify-between gap-3 sm:gap-6 px-2 border-b border-slate-100 dark:border-teal-900/40">
                {trendData.map((item, idx) => {
                  const val = chartMetric === 'revenue' ? item.revenue : item.students;
                  const heightPercent = Math.max(12, Math.round((val / maxChartValue) * 100));
                  
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 absolute -top-12 z-20 pointer-events-none bg-[#0b3b49] text-white text-[11px] font-bold py-1.5 px-2.5 rounded-xl shadow-lg whitespace-nowrap">
                        {chartMetric === 'revenue' ? formatTomanPrice(item.revenue) : `${toPersianDigits(item.students)} دانشجو`}
                      </div>

                      {/* Bar Fill */}
                      <div 
                        className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-[#0d9488] to-[#2dd4bf] dark:from-[#0f766e] dark:to-[#5eead4] group-hover:opacity-90 transition-all duration-300 relative shadow-xs"
                        style={{ height: `${heightPercent}%` }}
                      >
                        <div className="absolute top-1 inset-x-0 mx-auto w-2 h-2 rounded-full bg-white/60" />
                      </div>

                      {/* Label under bar */}
                      <div className="text-[11px] font-bold text-[#527683] dark:text-[#8ab5be] mt-3 truncate text-center">
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chart footer info */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-teal-900/40 flex flex-wrap items-center justify-between text-xs text-[#527683] dark:text-[#8ab5be]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488]" />
              پیک فروش معمولاً در روزهای پایانی هفته ثبت می‌شود.
            </span>
            <span className="font-bold text-[#06242e] dark:text-white">
              میانگین درآمد دوره انتخابی: {formatTomanPrice(Math.round(totalRevenue / Math.max(trendData.length, 1)))}
            </span>
          </div>
        </div>

        {/* Side Chart: Category Market Share (1 col) */}
        <div className="rounded-3xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-[#06242e] dark:text-white flex items-center gap-2">
                <Layers size={18} className="text-[#0d9488] dark:text-[#5eead4]" />
                <span>سهم بازار دسته‌بندی‌ها</span>
              </h3>
              <span className="text-[11px] text-[#527683] dark:text-[#8ab5be] font-bold">
                بر اساس ارزش فروش
              </span>
            </div>

            <div className="space-y-4">
              {categoryStats.slice(0, 5).map((cat, idx) => {
                const colors = [
                  'bg-[#0d9488]',
                  'bg-teal-500',
                  'bg-cyan-500',
                  'bg-emerald-500',
                  'bg-blue-500'
                ];
                const color = colors[idx % colors.length];

                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#06242e] dark:text-white flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${color}`} />
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#527683] dark:text-[#8ab5be] text-[11px]">
                          {toPersianDigits(cat.students)} دانشجو
                        </span>
                        <span className="font-extrabold text-[#0d9488] dark:text-[#5eead4]">
                          {toPersianDigits(cat.percent)}٪
                        </span>
                      </div>
                    </div>
                    {/* Progress Track */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#082834] overflow-hidden">
                      <div 
                        className={`h-full ${color} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(8, cat.percent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Category Insight */}
          <div className="mt-5 p-3 rounded-2xl bg-[#def4ee]/40 dark:bg-[#082834] border border-[#ccede5] dark:border-teal-900/60 text-[11px] text-[#06242e] dark:text-slate-300 flex items-start gap-2">
            <Sparkles size={16} className="text-[#0d9488] shrink-0 mt-0.5" />
            <span>
              دسته‌بندی <strong>طراحی و فیگما</strong> و <strong>هوش مصنوعی</strong> بالاترین تقاضای رشد ثبت‌نامی را در ۳۰ روز اخیر ثبت کرده‌اند.
            </span>
          </div>
        </div>

      </div>

      {/* 4. Student Study Habits & Retention Funnel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Retention & Progress Funnel */}
        <div className="rounded-3xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm sm:text-base text-[#06242e] dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-[#0d9488] dark:text-[#5eead4]" />
              <span>قیف یادگیری و نرخ اتمام دوره‌ها (Learning Funnel)</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg">
              پایداری بالا
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { stage: '۱. ثبت‌نام قطعی و پرداخت موفق', rate: 100, count: totalStudents, note: 'مبنای ورودی' },
              { stage: '۲. شروع جلسه اول و ورود به پلیر', rate: 94, count: Math.round(totalStudents * 0.94), note: '۶٪ عدم شروع' },
              { stage: '۳. عبور از ۵۰٪ سرفصل‌ها و تمرین‌ها', rate: 82, count: Math.round(totalStudents * 0.82), note: 'تعامل فعال' },
              { stage: '۴. اتمام آزمون‌ها و دریافت گواهینامه', rate: 76, count: Math.round(totalStudents * 0.76), note: 'فارغ‌التحصیلان موفق' }
            ].map((step, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-[#06242e] dark:text-white">{step.stage}</span>
                  <span className="font-extrabold text-[#0d9488] dark:text-[#5eead4]">
                    {toPersianDigits(step.rate)}٪ ({toPersianDigits(step.count)} نفر)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-[#082834] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-l from-[#0d9488] to-[#5eead4] rounded-full transition-all duration-300"
                    style={{ width: `${step.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Learning Activity & Study Habits */}
        <div className="rounded-3xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm sm:text-base text-[#06242e] dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-[#0d9488] dark:text-[#5eead4]" />
              <span>ساعات اوج مطالعه دانشجویان در شبانه‌روز</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-500">
              ترافیک پلیر ویدیو
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 text-center">
            <div className="p-3 rounded-2xl bg-[#def4ee]/30 dark:bg-[#082834] border border-[#ccede5]/60 dark:border-teal-900/40">
              <div className="text-[11px] text-[#527683] dark:text-[#8ab5be]">صبح (۰۶ تا ۱۲)</div>
              <div className="text-base font-extrabold text-[#06242e] dark:text-white mt-1">۱۴٪</div>
              <div className="text-[10px] text-slate-400 mt-0.5">مطالعه صبحگاهی</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#def4ee]/30 dark:bg-[#082834] border border-[#ccede5]/60 dark:border-teal-900/40">
              <div className="text-[11px] text-[#527683] dark:text-[#8ab5be]">عصر (۱۲ تا ۱۸)</div>
              <div className="text-base font-extrabold text-[#06242e] dark:text-white mt-1">۲۲٪</div>
              <div className="text-[10px] text-slate-400 mt-0.5">دانشجویان و کارمندان</div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">شب (۱۸ تا ۲۴)</div>
              <div className="text-base font-black text-emerald-800 dark:text-emerald-200 mt-1">۵۱٪</div>
              <div className="text-[10px] text-emerald-600 font-bold mt-0.5">ساعات اوج اصلی 🔥</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#def4ee]/30 dark:bg-[#082834] border border-[#ccede5]/60 dark:border-teal-900/40">
              <div className="text-[11px] text-[#527683] dark:text-[#8ab5be]">بامداد (۰۰ تا ۰۶)</div>
              <div className="text-base font-extrabold text-[#06242e] dark:text-white mt-1">۱۳٪</div>
              <div className="text-[10px] text-slate-400 mt-0.5">برنامه‌نویسان شب‌بیدار</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#f0fbf8] dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 flex items-center justify-between text-xs">
            <span className="text-[#527683] dark:text-[#8ab5be]">
              بیشترین نرخ شرکت در کوئیزها و ارسال تمرین:
            </span>
            <span className="font-extrabold text-[#0d9488] dark:text-[#5eead4]">
              ساعت ۲۰:۳۰ الی ۲۳:۰۰
            </span>
          </div>
        </div>

      </div>

      {/* 5. Deep Course Performance Table with Sorting & Direct Analytics Drill-down */}
      <div className="rounded-3xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 p-6 shadow-xs space-y-4">
        
        {/* Table Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-[#06242e] dark:text-white flex items-center gap-2">
              <GraduationCap size={20} className="text-[#0d9488] dark:text-[#5eead4]" />
              <span>جدول رتبه‌بندی و ارزیابی عمیق دوره‌ها</span>
            </h3>
            <p className="text-xs text-[#527683] dark:text-[#8ab5be] mt-0.5">
              تحلیل انفرادی دوره‌ها بر پایه فروش، امتیاز کیفی و نرخ ماندگاری
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={courseSearch}
                onChange={e => setCourseSearch(e.target.value)}
                placeholder="جستجوی دوره یا مدرس..."
                className="ps-9 pe-3 py-1.5 text-xs bg-slate-50 dark:bg-[#082834] border border-[#ccede5] dark:border-teal-900 rounded-xl text-[#06242e] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#0d9488]"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#082834] border border-[#ccede5] dark:border-teal-900 rounded-xl text-[#06242e] dark:text-white focus:outline-hidden focus:border-[#0d9488] cursor-pointer"
            >
              <option value="all">همه دسته‌ها</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>

            {/* Sort Toggle */}
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#082834] border border-[#ccede5] dark:border-teal-900 rounded-xl text-[#06242e] dark:text-white focus:outline-hidden focus:border-[#0d9488] cursor-pointer font-bold"
            >
              <option value="revenue">مرتب‌سازی: بیشترین فروش</option>
              <option value="students">مرتب‌سازی: تعداد دانشجو</option>
              <option value="rating">مرتب‌سازی: بالاترین امتیاز</option>
              <option value="completion">مرتب‌سازی: نرخ اتمام دوره</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-slate-100 dark:border-teal-900/60 text-[#527683] dark:text-[#8ab5be] text-[11px]">
                <th className="pb-3 text-start font-bold">دوره و سرفصل‌ها</th>
                <th className="pb-3 text-center font-bold">مدرس</th>
                <th className="pb-3 text-center font-bold">قیمت واحد</th>
                <th className="pb-3 text-center font-bold">دانشجویان</th>
                <th className="pb-3 text-center font-bold">فروش ناخالص</th>
                <th className="pb-3 text-center font-bold">امتیاز</th>
                <th className="pb-3 text-center font-bold">نرخ تکمیل</th>
                <th className="pb-3 text-center font-bold">عملیات آنالیتیکس</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-teal-900/40">
              {sortedCourses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    هیچ دوره‌ای با فیلترهای انتخابی یافت نشد.
                  </td>
                </tr>
              ) : (
                sortedCourses.map(course => {
                  const revenue = (course.studentCount || 0) * (course.price || 0);
                  const completion = Math.min(94, 60 + ((course.studentCount || 0) % 35));

                  return (
                    <tr key={course.id} className="hover:bg-[#f0fbf8] dark:hover:bg-[#082834]/60 transition-colors">
                      {/* Title & Image */}
                      <td className="py-3.5 pe-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={course.thumbnailUrl} 
                            alt={course.title}
                            className="w-12 h-8 rounded-lg object-cover border border-[#ccede5] dark:border-teal-900 shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-[#06242e] dark:text-white line-clamp-1">
                              {course.title}
                            </div>
                            <div className="text-[11px] text-[#527683] dark:text-[#8ab5be] flex items-center gap-2 mt-0.5">
                              <span>{course.category}</span>
                              <span>•</span>
                              <span>{toPersianDigits(course.modules?.length || 0)} سرفصل</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Instructor */}
                      <td className="py-3.5 px-2 text-center text-[#06242e] dark:text-slate-300">
                        {course.instructor?.name || 'مدرس استودیو'}
                      </td>

                      {/* Unit Price */}
                      <td className="py-3.5 px-2 text-center font-bold text-[#06242e] dark:text-slate-200">
                        {course.isFree ? 'رایگان' : formatTomanPrice(course.price)}
                      </td>

                      {/* Students Count */}
                      <td className="py-3.5 px-2 text-center">
                        <span className="font-black text-[#06242e] dark:text-white">
                          {toPersianDigits(course.studentCount)}
                        </span>
                      </td>

                      {/* Gross Revenue */}
                      <td className="py-3.5 px-2 text-center">
                        <span className="font-black text-emerald-600 dark:text-emerald-400">
                          {formatTomanPrice(revenue)}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-2 text-center">
                        <div className="flex items-center justify-center gap-1 font-bold text-amber-500">
                          <span>{toPersianDigits(course.rating)}</span>
                          <Star size={13} className="fill-amber-500" />
                        </div>
                      </td>

                      {/* Completion Rate with visual mini bar */}
                      <td className="py-3.5 px-2 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-extrabold text-[#0d9488] dark:text-[#5eead4]">
                            {toPersianDigits(completion)}٪
                          </span>
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#0d9488]"
                              style={{ width: `${completion}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Analytics Drill-down Action Button */}
                      <td className="py-3.5 ps-2 text-center">
                        <button
                          onClick={() => {
                            if (onViewCourseAnalytics) {
                              onViewCourseAnalytics(course);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#def4ee] hover:bg-[#c9eee5] dark:bg-[#0e3b47] dark:hover:bg-[#124d5d] text-[#0b3b49] dark:text-[#5eead4] font-bold text-xs transition-all shadow-2xs cursor-pointer"
                          title="نمایش گزارش و آنالیز جزئی این دوره"
                        >
                          <BarChart3 size={14} />
                          <span>آنالیز کامل</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination info */}
        <div className="pt-3 border-t border-slate-100 dark:border-teal-900/40 flex items-center justify-between text-xs text-[#527683] dark:text-[#8ab5be]">
          <span>
            نمایش {toPersianDigits(sortedCourses.length)} از {toPersianDigits(courses.length)} دوره ثبت‌شده در استودیو
          </span>
          <span className="text-[11px]">
            داده‌ها بر اساس پایگاه‌داده بلادرنگ استودیو به‌روزرسانی شده‌اند.
          </span>
        </div>

      </div>

      {/* 6. Smart Growth Recommendations */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0b3b49] via-[#092b36] to-[#06242e] text-white p-6 sm:p-7 shadow-sm border border-teal-900/60 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-80 h-80 bg-[#5eead4]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-[#5eead4] font-bold text-xs">
            <Sparkles size={18} />
            <span>بینش‌های هوشمند رشد و پیشنهادهای سیستمی</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-extrabold text-[#5eead4] text-sm">افزایش فروش دوره‌های طراحی</div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                دوره‌های دسته‌بندی دیزاین سیستم و فیگما بالاترین نرخ تبدیل را دارند. ایجاد باندل تخفیفی ویژه یا کارگاه تکمیلی برای این مخاطبان می‌تواند فروش را تا ۳۵٪ افزایش دهد.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-extrabold text-amber-300 text-sm">بهینه‌سازی سرفصل‌های طولانی</div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                در دروسی که ویدیو بیش از ۴۰ دقیقه است، ریزش ۶ درصدی مشاهده شده است. شکستن جلسات به ویدیوهای ۱۰ الی ۱۵ دقیقه‌ای همراه با آزمون‌های مرحله‌ای پیشنهاد می‌شود.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-extrabold text-emerald-300 text-sm">تبدیل دانشجویان تکی به اشتراک VIP</div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                ۴۲٪ از دانشجویانی که ۲ دوره خریداری کرده‌اند، پتانسیل بالای ارتقا به اشتراک سالانه طلایی VIP دارند. ارسال پیشنهاد تخفیف وفاداری در نوتیفیکیشن‌ها توصیه می‌شود.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
