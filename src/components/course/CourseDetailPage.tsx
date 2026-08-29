import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RatingStars } from '../common/RatingStars';
import { 
  Play, Check, Heart, ShieldCheck, Clock, BookOpen, 
  Award, Globe, ChevronDown, Lock, Share2, 
  CheckCircle2, ArrowLeft, ArrowRight 
} from 'lucide-react';
import { formatPriceToman, toPersianDigits } from '../../utils/persian';

interface CourseDetailPageProps {
  slugOrId: string;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ slugOrId }) => {
  const { 
    courses, 
    reviews, 
    navigate, 
    addToCart, 
    isInCart, 
    toggleWishlist, 
    isInWishlist, 
    isEnrolled, 
    addToast,
    t,
    isRTL,
    language 
  } = useApp();

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({ 'mod-1': true, 'mod-ai-1': true, 'mod-cg-1': true });
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [previewVideoModal, setPreviewVideoModal] = useState(false);

  // Find course by slug or ID
  const course = courses.find(c => c.slug === slugOrId || c.id === slugOrId) || courses[0];
  const enrolled = isEnrolled(course.id);
  const inCart = isInCart(course.id);
  const inWishlist = isInWishlist(course.id);

  // Course reviews
  const courseReviews = reviews.filter(r => r.courseId === course.id);

  // Toggle module expansion
  const toggleModule = (modId: string) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleEnrollOrBuy = () => {
    if (enrolled) {
      navigate('player', course.id);
    } else {
      addToCart(course);
      navigate('cart');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast({
        title: language === 'fa' ? 'لینک کپی شد' : 'Link Copied',
        message: language === 'fa' ? 'لینک دوره در کلیپ‌بورد کپی شد.' : 'Course link copied to clipboard.',
        type: 'success'
      });
    }
  };

  const formatLevel = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'سطح مقدماتی';
      case 'intermediate': return 'سطح متوسط';
      case 'advanced': return 'سطح پیشرفته';
      case 'all levels':
      case 'all': return 'تمام سطوح مهارتی';
      default: return level || 'تمام سطوح مهارتی';
    }
  };

  return (
    <div className="py-8 bg-slate-50/50 dark:bg-slate-950/60 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 flex-wrap">
          <button onClick={() => navigate('home')} className="hover:underline font-medium">خانه</button>
          <span>/</span>
          <button onClick={() => navigate('catalog')} className="hover:underline font-medium">همه دوره‌ها</button>
          <span>/</span>
          <button onClick={() => navigate('catalog', undefined, `category=${course.categoryId}`)} className="hover:underline font-medium">
            {course.categoryName || 'طراحی و دیزاین'}
          </button>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold truncate max-w-xs">{course.title}</span>
        </div>

        {/* Main Content & Sticky Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left / Main Column */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Header Hero Title Section */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-md">
                  {course.categoryName || 'طراحی و هنرهای دیجیتال'}
                </span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">
                  {formatLevel(course.level)}
                </span>
                {course.hasCertificate && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-md flex items-center gap-1">
                    <Award size={13} />
                    <span>مدرک رسمی و معتبر لومینا</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {course.subtitle}
              </p>

              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <RatingStars rating={course.rating} reviewCount={course.reviewCount} />
                </div>
                <div>•</div>
                <div>
                  <strong className="text-slate-900 dark:text-slate-100">
                    {toPersianDigits(course.studentCount)}
                  </strong> دانشجو
                </div>
                <div>•</div>
                <div className="flex items-center gap-1.5">
                  <img
                    src={course.instructorAvatar}
                    alt={course.instructorName}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span>
                    تدریس توسط <strong className="text-slate-900 dark:text-slate-100">{course.instructorName}</strong>
                  </span>
                </div>
                <div>•</div>
                <div className="flex items-center gap-1">
                  <Globe size={13} />
                  <span>زبان: فارسی</span>
                </div>
              </div>
            </div>

            {/* Mobile Video Preview Card */}
            <div className="lg:hidden relative rounded-2xl overflow-hidden shadow-lg aspect-video bg-slate-950">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <button
                  onClick={() => setPreviewVideoModal(true)}
                  className="w-14 h-14 rounded-full bg-white text-indigo-900 flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform"
                >
                  <Play size={24} className="fill-indigo-900 ms-1" />
                </button>
              </div>
            </div>

            {/* What You'll Learn Box */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-indigo-600 dark:text-indigo-400" />
                <span>{t('whatYoullLearn')}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {course.whatYouWillLearn.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Description */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                {language === 'fa' ? 'معرفی جامع و سرفصل آموزشی دوره' : 'Course Overview & Pedagogy'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {course.description}
              </p>
              
              {/* Requirements & Target Audience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                    {t('requirements')}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {course.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                    {t('whoIsThisFor')}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {course.targetAudience.map((aud, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{aud}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Course Curriculum & Expandable Modules */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  {t('courseCurriculum')}
                </h3>
                <div className="text-xs text-slate-500">
                  {toPersianDigits(course.modules.length)} {t('modulesCount')} • {toPersianDigits(course.lessonCount)} {t('totalLessons')} • {toPersianDigits(course.durationHours)} {t('hours')}
                </div>
              </div>

              <div className="space-y-3">
                {course.modules.map(module => {
                  const isExpanded = !!expandedModules[module.id];
                  return (
                    <div
                      key={module.id}
                      className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
                    >
                      {/* Module Header */}
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-start"
                      >
                        <div className="flex items-center gap-3">
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                            {module.title}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {toPersianDigits(module.lessons.length)} {t('lessons')}
                        </span>
                      </button>

                      {/* Module Lessons List */}
                      {isExpanded && (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {module.lessons.map(lesson => (
                            <div
                              key={lesson.id}
                              className="p-3.5 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 text-xs transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {lesson.isPreviewFree ? (
                                  <button
                                    onClick={() => setPreviewVideoModal(true)}
                                    className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"
                                    title={t('freePreviewAvailable')}
                                  >
                                    <Play size={10} className="fill-indigo-600 ms-0.5" />
                                  </button>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                                    <Lock size={11} />
                                  </div>
                                )}
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                  {lesson.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                {lesson.isPreviewFree && (
                                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                                    {t('freePreviewAvailable')}
                                  </span>
                                )}
                                <span className="text-slate-400 text-xs">{toPersianDigits(lesson.durationMinutes)} دقیقه</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instructor Spotlight */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4">
                {t('aboutInstructor')}
              </h3>

              <div className="flex flex-col sm:flex-row items-start gap-5">
                <img
                  src={course.instructorAvatar}
                  alt={course.instructorName}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-100 dark:ring-slate-800 shrink-0"
                />
                <div className="space-y-2">
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {course.instructorName}
                    </h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      {course.instructorTitle}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {language === 'fa'
                      ? 'مدرس با بیش از ۱۵ سال سابقه حرفه‌ای در رهبری تیم‌های مهندسی و طراحی محصول در شرکت‌های معتبر فناوری. مشاور و طراح ساختارهای استاندارد تولید محتوا.'
                      : 'Senior practitioner with over 15 years leading production teams and designing industry curricula.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100">{toPersianDigits(course.rating)}</strong> امتیاز مدرس
                    </div>
                    <div>•</div>
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100">{toPersianDigits(course.studentCount)}</strong> دانشجو
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Reviews Section */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4">
                {t('studentFeedback')}
              </h3>

              {/* Rating summary */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {toPersianDigits(course.rating.toFixed(1))}
                  </div>
                  <RatingStars rating={course.rating} size={16} showScore={false} className="mt-1" />
                  <div className="text-xs text-slate-400 mt-1">{toPersianDigits(course.reviewCount)} امتیاز ثبت شده</div>
                </div>

                <div className="flex-1 w-full space-y-1.5 text-xs">
                  {[
                    { stars: 5, pct: 88 },
                    { stars: 4, pct: 9 },
                    { stars: 3, pct: 2 },
                    { stars: 2, pct: 1 },
                    { stars: 1, pct: 0 }
                  ].map(row => (
                    <div key={row.stars} className="flex items-center gap-2">
                      <span className="w-16 text-slate-500 text-end">{toPersianDigits(row.stars)} ستاره</span>
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${row.pct}%` }} />
                      </div>
                      <span className="w-12 text-slate-400 text-end">٪{toPersianDigits(row.pct)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {courseReviews.map(rev => (
                  <div key={rev.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.userAvatar}
                          alt={rev.userName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <span>{rev.userName}</span>
                            {rev.isVerifiedPurchase && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                                ✓ {language === 'fa' ? 'دانشجوی دوره' : 'Verified Student'}
                              </span>
                            )}
                          </div>
                          <RatingStars rating={rev.rating} size={12} showScore={false} />
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">{rev.date}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rev.comment}
                    </p>

                    {rev.instructorResponse && (
                      <div className="mt-2 p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100/60 dark:border-indigo-900/40 text-xs">
                        <div className="font-bold text-indigo-700 dark:text-indigo-300 mb-0.5">
                          {language === 'fa' ? `پاسخ مدرس (${course.instructorName}):` : `Response from ${course.instructorName}:`}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">
                          {rev.instructorResponse.comment}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs */}
            {course.faqs && course.faqs.length > 0 && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4">
                  {t('frequentlyAskedQuestions')}
                </h3>
                <div className="space-y-2">
                  {course.faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 text-start text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown size={16} className={`transition-transform ${activeFaq === index ? 'rotate-180' : ''}`} />
                      </button>
                      {activeFaq === index && (
                        <div className="p-4 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Sticky Purchase Sidebar */}
          <aside className="lg:col-span-4 sticky top-24">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              
              {/* Video Preview Hero */}
              <div className="relative aspect-video bg-slate-950 overflow-hidden group">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button
                    onClick={() => setPreviewVideoModal(true)}
                    className="w-14 h-14 rounded-full bg-white text-indigo-900 flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform"
                  >
                    <Play size={22} className="fill-indigo-900 ms-0.5" />
                  </button>
                </div>
                <span className="absolute bottom-3 inset-inline-start-3 bg-black/70 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded font-medium">
                  {t('freePreviewAvailable')}
                </span>
              </div>

              {/* Price & Checkout Card */}
              <div className="p-6 space-y-5">
                {/* Price block */}
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                      {formatPriceToman(course.price)}
                    </span>
                    {course.originalPrice > course.price && (
                      <span className="text-xs sm:text-sm text-slate-400 line-through">
                        {formatPriceToman(course.originalPrice)}
                      </span>
                    )}
                  </div>
                  {course.discountPercentage && (
                    <span className="bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold px-2.5 py-1 rounded-full">
                      ٪{toPersianDigits(course.discountPercentage)} تخفیف
                    </span>
                  )}
                </div>

                {/* Primary CTA */}
                <div className="space-y-2.5">
                  <button
                    onClick={handleEnrollOrBuy}
                    className="w-full py-3.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-sm shadow-lg shadow-indigo-900/25 transition-all flex items-center justify-center gap-2"
                  >
                    <span>
                      {enrolled 
                        ? t('goToCourse') 
                        : inCart 
                        ? (language === 'fa' ? 'مشاهده سبد خرید و تسویه' : 'Proceed to Cart')
                        : t('buyNow')}
                    </span>
                    {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                  </button>

                  <button
                    onClick={() => toggleWishlist(course.id)}
                    className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Heart size={15} className={inWishlist ? 'fill-rose-500 text-rose-500' : ''} />
                    <span>{inWishlist ? t('removeFromWishlist') : t('addToWishlist')}</span>
                  </button>
                </div>

                {/* Guarantee & Inclusions */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span>{t('thirtyDayGuarantee')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-indigo-500" />
                    <span>{toPersianDigits(course.durationHours)} ساعت محتوای ویدیویی آنلاین</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-indigo-500" />
                    <span>{toPersianDigits(course.lessonCount)} جلسه و تمرین عملی و پروژه‌محور</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-amber-500" />
                    <span>مدرک رسمی و قابل اعتبارسنجی</span>
                  </div>
                </div>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="w-full pt-2 flex items-center justify-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  <Share2 size={13} />
                  <span>{t('shareCourse')}</span>
                </button>

              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* Video Preview Modal */}
      {previewVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 text-white">
              <span className="font-bold text-sm">
                {language === 'fa' ? `پیش‌نمایش ویدیویی: ${course.title}` : `Preview: ${course.title}`}
              </span>
              <button
                onClick={() => setPreviewVideoModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video
                src={course.previewVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
