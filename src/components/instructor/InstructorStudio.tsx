import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  DollarSign, Users, Star, PlusCircle, 
  CheckCircle, Video, ShieldAlert, GraduationCap,
  Sparkles, TrendingUp, ArrowRight, ArrowLeft, ShieldCheck 
} from 'lucide-react';
import { CourseModule, Lesson } from '../../types';
import { formatPriceToman, toPersianDigits } from '../../utils/persian';

export const InstructorStudio: React.FC = () => {
  const { courses, categories, addToast, navigate, t, language, isRTL, userRole, setUserRole, currentUser } = useApp();

  const isActualAdmin = Boolean(
    currentUser &&
    (currentUser.roles?.some(r => r === 'ADMIN' || r === 'OWNER') ||
     (currentUser.role === 'admin' && (!currentUser.roles || currentUser.roles.length === 0)))
  );

  const [creatorModalOpen, setCreatorModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // If user is not admin, show clear message according to instructions
  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen py-16 bg-slate-50/50 dark:bg-slate-950/60 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white dark:bg-[#08242d] rounded-3xl p-8 border border-teal-100 dark:border-teal-900 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-xs">
            <ShieldAlert size={32} />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold">
              دسترسی ویژه مدیریت
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
              امکان ایجاد و انتشار دوره منحصراً برای مدیریت فعال است
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              در ساختار فعلی پلتفرم لومینا لرن، ایجاد سرفصل و انتشار دوره‌ها توسط صاحب و مدیر سایت انجام می‌پذیرد. اگر تمایل دارید به عنوان مدرس در لومینا لرن فعالیت نمایید، می‌توانید فرم درخواست تدریس را تکمیل کنید تا توسط مدیریت بررسی شود.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate('dashboard')}
              className="flex-1 py-3 px-4 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <GraduationCap size={16} />
              <span>ارسال فرم درخواست تدریس</span>
            </button>

            {isActualAdmin && (
              <button
                onClick={() => setUserRole('admin')}
                className="py-3 px-4 rounded-xl border border-teal-200 dark:border-teal-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck size={16} className="text-[#0d9488]" />
                <span>بازگشت به دیدگاه مدیر (ADMIN)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // New course draft state
  const [courseForm, setCourseForm] = useState({
    title: '',
    subtitle: '',
    categoryId: 'cat-1',
    categoryName: 'طراحی سیستم‌ها و UI/UX',
    level: 'Intermediate' as const,
    price: 890000,
    originalPrice: 1990000,
    durationHours: 10,
    hasCertificate: true,
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    whatYouWillLearn: [
      'تسلط کامل بر معماری دیزاین سیستم‌های سازمانی',
      'طراحی تعاملی با فیگما و توکن‌های استاندارد فرانت‌اند'
    ],
    requirements: ['آشنایی اولیه با مفاهیم طراحی رابط کاربری'],
    targetAudience: ['طراحان محصول', 'مهندسان فرانت‌اند'],
    modules: [
      {
        id: 'new-mod-1',
        title: 'فصل اول: اصول و مبانی پایه',
        order: 1,
        lessons: [
          {
            id: 'new-les-1',
            title: 'جلسه ۱: خوش‌آمدگویی و معرفی نقشه راه دوره',
            durationMinutes: 14,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            isPreviewFree: true,
            order: 1
          }
        ]
      }
    ]
  });

  const handleAddModule = () => {
    const nextModNum = courseForm.modules.length + 1;
    const newMod: CourseModule = {
      id: `new-mod-${Date.now()}`,
      title: language === 'fa' ? `فصل ${toPersianDigits(nextModNum)}: مفاهیم تکمیلی و پیشرفته` : `Module ${nextModNum}: Deep Dive`,
      order: nextModNum,
      lessons: [
        {
          id: `new-les-${Date.now()}`,
          title: language === 'fa' ? 'جلسه ۱: پیاده‌سازی کاربردی' : 'Lesson 1: Key Concepts',
          durationMinutes: 15,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          isPreviewFree: false,
          order: 1
        }
      ]
    };
    setCourseForm(prev => ({ ...prev, modules: [...prev.modules, newMod] }));
  };

  const handleAddLesson = (modIndex: number) => {
    const targetMod = courseForm.modules[modIndex];
    const newLesson: Lesson = {
      id: `new-les-${Date.now()}`,
      title: language === 'fa' 
        ? `جلسه ${toPersianDigits(targetMod.lessons.length + 1)}: کارگاه عملی و پیاده‌سازی پروژه` 
        : `Lesson ${targetMod.lessons.length + 1}: Hands-on Implementation`,
      durationMinutes: 18,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      isPreviewFree: false,
      order: targetMod.lessons.length + 1
    };
    const updatedModules = [...courseForm.modules];
    updatedModules[modIndex].lessons.push(newLesson);
    setCourseForm(prev => ({ ...prev, modules: updatedModules }));
  };

  const handleSaveCourse = () => {
    if (!courseForm.title.trim()) {
      addToast({
        title: language === 'fa' ? 'عنوان دوره الزامی است' : 'Missing Title',
        message: language === 'fa' ? 'لطفاً عنوانی مناسب برای دوره آموزشی خود وارد نمایید.' : 'Please enter a title for your masterclass.',
        type: 'error'
      });
      return;
    }

    addToast({
      title: language === 'fa' ? 'دوره با موفقیت منتشر شد! 🚀' : 'Masterclass Published! 🚀',
      message: language === 'fa' 
        ? `دوره «${courseForm.title}» هم‌اکنون در پلتفرم فعال و در دسترس دانشجویان قرار گرفت.` 
        : `"${courseForm.title}" is now live and accepting student enrollments.`,
      type: 'success'
    });
    setCreatorModalOpen(false);
  };

  const handleWithdrawPayout = () => {
    addToast({
      title: language === 'fa' ? 'درخواست تسویه حساب ثبت شد' : 'Payout Initiated',
      message: language === 'fa' ? 'مبلغ ۴۸٬۵۰۰٬۰۰۰ تومان به شماره شبای ثبت‌شده واریز خواهد شد.' : 'Withdrawal transferred to your linked bank account.',
      type: 'success'
    });
  };

  return (
    <div className="py-10 bg-slate-50/50 dark:bg-slate-950/60 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Instructor Studio Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={13} />
              <span>{language === 'fa' ? 'مرکز مدیریت و تدریس اساتید' : 'Instructor Command Center'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t('instructorStudio')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'fa'
                ? 'طراحی سرفصل‌ها، مدیریت فروش دوره‌ها و تعامل با جامعه دانشجویان.'
                : 'Create curriculum, review student submissions, and manage masterclass analytics.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleWithdrawPayout}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs"
            >
              {language === 'fa' ? 'درخواست تسویه (۴۸٬۵۰۰٬۰۰۰ تومان)' : 'Withdraw ($4,850.00)'}
            </button>
            <button
              onClick={() => {
                setActiveStep(1);
                setCreatorModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-900/25 transition-all"
            >
              <PlusCircle size={15} />
              <span>{t('createCourse')}</span>
            </button>
          </div>
        </div>

        {/* Studio Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">{language === 'fa' ? 'درآمد کل دوره‌ها' : 'Total Revenue'}</span>
              <DollarSign size={18} className="text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {language === 'fa' ? `${toPersianDigits('489,200,000')} تومان` : '$48,920.00'}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-1">
              <TrendingUp size={12} />
              <span>{language === 'fa' ? `٪${toPersianDigits(18.4)} رشد در این ماه` : '+18.4% this month'}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">{language === 'fa' ? 'کل دانشجویان' : 'Total Students'}</span>
              <Users size={18} className="text-indigo-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {toPersianDigits('12,450')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {language === 'fa' ? `در مجموع ${toPersianDigits(4)} دوره تخصصی` : 'Across 4 masterclasses'}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">{language === 'fa' ? 'میانگین رضایت' : 'Average Rating'}</span>
              <Star size={18} className="text-amber-400 fill-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {toPersianDigits(4.94)} / {toPersianDigits(5)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {language === 'fa' ? `بر اساس ${toPersianDigits('1,820')} دیدگاه ثبت‌شده` : 'Based on 1,820 reviews'}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">{language === 'fa' ? 'نرخ تکمیل دوره' : 'Course Completion'}</span>
              <CheckCircle size={18} className="text-indigo-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              ٪{toPersianDigits(87.2)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {language === 'fa' ? 'بالاتر از میانگین صنعت آموزش آنلاین' : 'Industry high completion'}
            </div>
          </div>
        </div>

        {/* Existing Courses Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {language === 'fa' ? 'دوره‌های منتشر شده شما' : 'Your Published Masterclasses'}
            </h3>
            <span className="text-xs text-slate-400">
              {toPersianDigits(courses.length)} {language === 'fa' ? 'دوره فعال' : 'Live Courses'}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {courses.map(course => (
              <div
                key={course.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-24 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      {course.categoryName}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {course.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>{toPersianDigits(course.studentCount)} دانشجو</span>
                      <span>•</span>
                      <span>★ {toPersianDigits(course.rating.toFixed(1))}</span>
                      <span>•</span>
                      <span>{formatPriceToman(course.price)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => navigate('course-detail', course.slug)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  >
                    {language === 'fa' ? 'پیش‌نمایش' : 'Preview'}
                  </button>
                  <button
                    onClick={() => {
                      setCourseForm({
                        title: course.title,
                        subtitle: course.subtitle,
                        categoryId: course.categoryId,
                        categoryName: course.categoryName,
                        level: course.level,
                        price: course.price,
                        originalPrice: course.originalPrice,
                        durationHours: course.durationHours,
                        hasCertificate: course.hasCertificate,
                        thumbnail: course.thumbnail,
                        previewVideoUrl: course.previewVideoUrl,
                        whatYouWillLearn: course.whatYouWillLearn,
                        requirements: course.requirements,
                        targetAudience: course.targetAudience,
                        modules: course.modules
                      });
                      setActiveStep(1);
                      setCreatorModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100"
                  >
                    {language === 'fa' ? 'ویرایش سرفصل‌ها' : 'Edit Syllabus'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Course Creator Multi-Step Modal */}
      {creatorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  {language === 'fa' ? 'استودیو و کارگاه ساخت دوره آموزشی' : 'Course Studio Creator'}
                </h3>
                <div className="flex items-center gap-3 text-xs font-semibold mt-1">
                  <span className={activeStep === 1 ? 'text-indigo-600 font-bold' : 'text-slate-400'}>
                    {language === 'fa' ? '۱. مشخصات پایه' : '1. Basic Info'}
                  </span>
                  <span>←</span>
                  <span className={activeStep === 2 ? 'text-indigo-600 font-bold' : 'text-slate-400'}>
                    {language === 'fa' ? '۲. سرفصل‌ها و جلسات' : '2. Curriculum & Lessons'}
                  </span>
                  <span>←</span>
                  <span className={activeStep === 3 ? 'text-indigo-600 font-bold' : 'text-slate-400'}>
                    {language === 'fa' ? '۳. قیمت‌گذاری و انتشار' : '3. Pricing & Launch'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setCreatorModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Stepper */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {activeStep === 1 && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {language === 'fa' ? 'عنوان دوره آموزشی *' : 'Course Title *'}
                    </label>
                    <input
                      type="text"
                      value={courseForm.title}
                      onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                      placeholder={language === 'fa' ? 'مثال: مسترکلاس جامع معماری دیزاین سیستم در مقیاس سازمانی' : 'e.g. Master Design Systems'}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {language === 'fa' ? 'توضیح کوتاه و جذاب یک خطی' : 'Subtitle / One-line summary'}
                    </label>
                    <input
                      type="text"
                      value={courseForm.subtitle}
                      onChange={e => setCourseForm({ ...courseForm, subtitle: e.target.value })}
                      placeholder={language === 'fa' ? 'مثال: آموزش مدیریت توکن‌های طراحی، اتولایوت و اتصال به کد ری‌اکت' : 'e.g. Learn tokenized layout'}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {t('categories')}
                      </label>
                      <select
                        value={courseForm.categoryId}
                        onChange={e => {
                          const cat = categories.find(c => c.id === e.target.value);
                          setCourseForm({
                            ...courseForm,
                            categoryId: e.target.value,
                            categoryName: cat ? (language === 'fa' ? cat.nameFa : cat.name) : 'Design'
                          });
                        }}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>
                            {language === 'fa' ? c.nameFa : c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {t('level')}
                      </label>
                      <select
                        value={courseForm.level}
                        onChange={e => setCourseForm({ ...courseForm, level: e.target.value as any })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                      >
                        <option value="Beginner">{language === 'fa' ? 'مقدماتی' : 'Beginner'}</option>
                        <option value="Intermediate">{language === 'fa' ? 'متوسط' : 'Intermediate'}</option>
                        <option value="Advanced">{language === 'fa' ? 'پیشرفته' : 'Advanced'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {language === 'fa' ? 'آدرس لینک تصویر کاور (URL)' : 'Cover Image URL'}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={courseForm.thumbnail}
                      onChange={e => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-6 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {language === 'fa' ? 'فصل‌ها و جلسات ویدیویی دوره' : 'Modules & Video Lessons'}
                    </h4>
                    <button
                      onClick={handleAddModule}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 flex items-center gap-1"
                    >
                      <PlusCircle size={13} />
                      <span>{language === 'fa' ? 'افزودن فصل جدید' : 'Add Module'}</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {courseForm.modules.map((mod, modIdx) => (
                      <div
                        key={mod.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={mod.title}
                            onChange={e => {
                              const updated = [...courseForm.modules];
                              updated[modIdx].title = e.target.value;
                              setCourseForm({ ...courseForm, modules: updated });
                            }}
                            className="font-bold text-xs sm:text-sm bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-hidden text-slate-900 dark:text-slate-100 flex-1 me-2"
                          />
                          <button
                            onClick={() => handleAddLesson(modIdx)}
                            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            {language === 'fa' ? '+ افزودن جلسه' : '+ Add Lesson'}
                          </button>
                        </div>

                        <div className="space-y-2">
                          {mod.lessons.map((les, lesIdx) => (
                            <div
                              key={les.id}
                              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <Video size={14} className="text-slate-400" />
                                <input
                                  type="text"
                                  value={les.title}
                                  onChange={e => {
                                    const updated = [...courseForm.modules];
                                    updated[modIdx].lessons[lesIdx].title = e.target.value;
                                    setCourseForm({ ...courseForm, modules: updated });
                                  }}
                                  className="bg-transparent text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden flex-1"
                                />
                              </div>
                              <span className="text-[11px] text-slate-400">{toPersianDigits(les.durationMinutes)} دقیقه</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {language === 'fa' ? 'قیمت فروش دوره (تومان)' : 'Selling Price'}
                      </label>
                      <input
                        type="number"
                        value={courseForm.price}
                        onChange={e => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {language === 'fa' ? 'قیمت اصلی بدون تخفیف (تومان)' : 'Original Price'}
                      </label>
                      <input
                        type="number"
                        value={courseForm.originalPrice}
                        onChange={e => setCourseForm({ ...courseForm, originalPrice: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/60">
                    <h5 className="font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                      {language === 'fa' ? 'آماده برای ثبت‌نام و جذب دانشجو' : 'Ready for Student Enrollment'}
                    </h5>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      {language === 'fa' 
                        ? 'پس از انتشار، دوره شما بلافاصله در موتور جستجوی لومینا و کاروسل‌های دسته‌بندی نمایش داده خواهد شد.'
                        : 'Your course will be instantly indexed into the marketplace search directory.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {activeStep > 1 ? (
                <button
                  onClick={() => setActiveStep((activeStep - 1) as any)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {language === 'fa' ? 'مرحله قبلی' : 'Previous'}
                </button>
              ) : <div />}

              {activeStep < 3 ? (
                <button
                  onClick={() => setActiveStep((activeStep + 1) as any)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-900 text-white text-xs font-bold hover:bg-indigo-800"
                >
                  {language === 'fa' ? 'مرحله بعد' : 'Next Step'}
                </button>
              ) : (
                <button
                  onClick={handleSaveCourse}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg"
                >
                  {language === 'fa' ? 'انتشار رسمی دوره' : 'Publish Masterclass'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
