import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { RatingStars } from '../common/RatingStars';
import { 
  Play, Check, ShieldCheck, Clock, BookOpen, 
  Award, Globe, ChevronDown, Lock, Share2, 
  CheckCircle2, ArrowLeft, ArrowRight, AlertCircle, 
  RotateCcw, Sparkles, UserCheck, Crown 
} from 'lucide-react';
import { formatPriceToman, toPersianDigits } from '../../utils/persian';
import { Course } from '../../types';
import { api } from '../../services/api';
import { updateMetaTags, resetMetaTags } from '../../utils/seo';

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
    isEnrolled, 
    enrollInCourse,
    isLoggedIn,
    openAuthModal,
    addToast,
    currentUser,
    t,
    isRTL,
    language 
  } = useApp();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [previewVideoModal, setPreviewVideoModal] = useState(false);
  const [activePreviewVideoUrl, setActivePreviewVideoUrl] = useState<string>('');

  const fetchCourse = useCallback(async () => {
    if (!slugOrId) return;
    setLoading(true);
    setError(null);
    setIsNotFound(false);

    try {
      const res = await api.courses.getById(slugOrId);
      if (res && res.data) {
        const fetched = res.data;
        setCourse(fetched);

        // Auto-expand first module / section
        if (fetched.modules && fetched.modules.length > 0) {
          setExpandedModules({ [fetched.modules[0].id]: true });
        } else if (fetched.sections && fetched.sections.length > 0) {
          setExpandedModules({ [fetched.sections[0].id]: true });
        }
      } else {
        const fallback = courses.find(c => 
          c.id === slugOrId || 
          c.slug === slugOrId ||
          (slugOrId.includes('ui-ux') && (c.id === 'crs_figma_ui' || c.slug.includes('figma'))) ||
          (slugOrId.includes('react') && (c.id === 'crs_react_pro' || c.slug.includes('react')))
        );
        if (fallback) {
          setCourse(fallback);
          if (fallback.modules && fallback.modules.length > 0) {
            setExpandedModules({ [fallback.modules[0].id]: true });
          }
        } else {
          setIsNotFound(true);
        }
      }
    } catch (err: any) {
      const fallback = courses.find(c => 
        c.id === slugOrId || 
        c.slug === slugOrId ||
        (slugOrId.includes('ui-ux') && (c.id === 'crs_figma_ui' || c.slug.includes('figma'))) ||
        (slugOrId.includes('react') && (c.id === 'crs_react_pro' || c.slug.includes('react')))
      );
      if (fallback) {
        setCourse(fallback);
        if (fallback.modules && fallback.modules.length > 0) {
          setExpandedModules({ [fallback.modules[0].id]: true });
        }
      } else if (err?.message?.includes('یافت نشد') || err?.status === 404) {
        setIsNotFound(true);
      } else {
        console.error('[CourseDetail Fetch Error]:', err);
        setError(err?.message || (language === 'fa' ? 'دریافت اطلاعات دوره با مشکل مواجه شد.' : 'Failed to load course details.'));
      }
    } finally {
      setLoading(false);
    }
  }, [slugOrId, courses, language]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  // Dynamic SEO metadata injection for Course detail page
  useEffect(() => {
    if (course) {
      const pageTitle = `${course.title} | لومینا لرن`;
      const desc = course.shortDescription || (course.description ? course.description.slice(0, 160) : '') || 'آموزش آنلاین تخصصی و کاربردی در آکادمی لومینا لرن';
      const canonicalUrl = `${window.location.origin}/courses/${course.slug || course.id}`;

      updateMetaTags({
        title: pageTitle,
        description: desc,
        keywords: `${course.title}, آموزش ${course.title}, لومینا لرن, دوره آنلاین, ${course.category || ''}`,
        image: course.thumbnail,
        url: canonicalUrl,
        type: 'article',
        canonical: canonicalUrl,
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: course.title,
          description: desc,
          image: course.thumbnail,
          provider: {
            '@type': 'Organization',
            name: 'لومینا لرن (Lumina Learn)',
            sameAs: window.location.origin
          },
          offers: {
            '@type': 'Offer',
            price: course.isFree ? '0' : course.price?.toString() || '0',
            priceCurrency: 'IRR',
            availability: 'https://schema.org/InStock'
          },
          aggregateRating: course.rating ? {
            '@type': 'AggregateRating',
            ratingValue: course.rating,
            reviewCount: course.reviewsCount || 10
          } : undefined,
          instructor: course.instructor ? {
            '@type': 'Person',
            name: course.instructor.name
          } : undefined
        }
      });
    }

    return () => {
      resetMetaTags();
    };
  }, [course]);

  // Handle module expansion toggle
  const toggleModule = (modId: string) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleOpenPreview = (videoUrl?: string) => {
    const targetUrl = videoUrl || (course as any)?.previewVideoUrl || (course as any)?.videoPreviewUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    setActivePreviewVideoUrl(targetUrl);
    setPreviewVideoModal(true);
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

  const formatLevel = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'سطح مقدماتی';
      case 'intermediate': return 'سطح متوسط';
      case 'advanced': return 'سطح پیشرفته';
      case 'all_levels':
      case 'all levels':
      case 'all': return 'تمام سطوح مهارتی';
      default: return level || 'تمام سطوح مهارتی';
    }
  };

  // 1. SKELETON LOADING STATE
  if (loading) {
    return (
      <div className="py-8 bg-slate-50/50 dark:bg-slate-950/60 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-64 mb-6" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-32" />
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            </div>
            <div className="lg:col-span-4">
              <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. 404 / NOT FOUND STATE
  if (isNotFound) {
    return (
      <div className="py-20 bg-slate-50/50 dark:bg-slate-950/60 min-h-screen flex items-center justify-center font-sans">
        <div className="max-w-md w-full mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-900/60 shadow-xs">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {language === 'fa' ? 'دوره مورد نظر یافت نشد' : 'Course Not Found'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            {language === 'fa'
              ? 'ممکن است آدرس دوره تغییر کرده باشد یا توسط مدرس از دسترس خارج شده باشد.'
              : 'The requested course does not exist or may have been archived.'}
          </p>
          <button
            onClick={() => navigate('catalog')}
            className="px-6 py-3 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all inline-flex items-center gap-2"
          >
            <span>{language === 'fa' ? 'مشاهده همه دوره‌ها' : 'Explore All Courses'}</span>
            {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    );
  }

  // 3. SERVER ERROR STATE WITH RETRY
  if (error || !course) {
    return (
      <div className="py-20 bg-slate-50/50 dark:bg-slate-950/60 min-h-screen flex items-center justify-center font-sans">
        <div className="max-w-md w-full mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-900/60 shadow-xs">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {language === 'fa' ? 'دریافت اطلاعات دوره با مشکل مواجه شد' : 'Failed to Load Course'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            {error || (language === 'fa' ? 'خطایی در برقراری ارتباط با سرور رخ داده است.' : 'An error occurred while connecting to the server.')}
          </p>
          <button
            onClick={fetchCourse}
            className="px-6 py-3 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all inline-flex items-center gap-2"
          >
            <RotateCcw size={16} />
            <span>{language === 'fa' ? 'تلاش مجدد' : 'Retry'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Check if course is VIP
  const isVipCourse = Boolean(course.isVip || (!course.isFree && course.price > 0));

  // Check if current logged in user has active VIP subscription
  const hasActiveSubscription = Boolean(
    currentUser?.subscriptionEndDate &&
    new Date(currentUser.subscriptionEndDate).getTime() > Date.now()
  );

  // Access check from backend userAccess payload or fallback to app state / VIP subscription
  const hasFullAccess = Boolean(
    course.userAccess?.canAccessFull || 
    isEnrolled(course.id) || 
    (isVipCourse && hasActiveSubscription) ||
    course.isFree || 
    course.price === 0
  );
  const inCart = isInCart(course.id);
  const courseReviews = reviews.filter(r => r.courseId === course.id);

  // Normalize modules / sections
  const modulesList = course.modules || (course.sections ? course.sections.map(s => ({
    id: s.id,
    title: s.title,
    order: s.orderIndex,
    lessons: (s.lessons || []).map(l => ({
      ...l,
      isPreviewFree: l.isFreePreview,
      order: l.orderIndex
    }))
  })) : []);

  const totalLessonsCount = course.lessonCount || modulesList.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

  const handleEnrollOrBuy = async () => {
    if (!course) return;

    if (hasFullAccess) {
      navigate('player', course.id);
      return;
    }

    // If VIP course, direct user to VIP subscription page
    if (isVipCourse) {
      navigate('vip');
      return;
    }

    if (course.price === 0 || course.isFree) {
      if (!isLoggedIn) {
        openAuthModal('login');
        addToast({
          title: language === 'fa' ? 'نیاز به ورود به حساب کاربری' : 'Login Required',
          message: language === 'fa' ? 'لطفاً برای ثبت‌نام در این دوره ابتدا وارد حساب کاربری خود شوید.' : 'Please log in or create an account to enroll.',
          type: 'info'
        });
        return;
      }

      if (isEnrolling) return; // Prevent double clicks
      setIsEnrolling(true);

      try {
        const res = await enrollInCourse(course.id);
        if (res.success) {
          addToast({
            title: language === 'fa' ? 'ثبت‌نام با موفقیت انجام شد 🎉' : 'Enrolled Successfully!',
            message: res.message || (language === 'fa' ? 'دسترسی کامل به جلسات دوره برای شما فعال گردید.' : 'You now have full access to this course.'),
            type: 'success'
          });
          // Re-fetch course from server to immediately reflect server-authoritative userAccess state
          await fetchCourse();
        } else {
          addToast({
            title: language === 'fa' ? 'خطا در ثبت‌نام' : 'Enrollment Failed',
            message: res.message || (language === 'fa' ? 'ثبت‌نام با خطا مواجه شد.' : 'Could not complete enrollment.'),
            type: 'error'
          });
        }
      } catch (err: any) {
        addToast({
          title: language === 'fa' ? 'خطای سرور' : 'Server Error',
          message: err.message || (language === 'fa' ? 'خطا در برقراری ارتباط با سرور ثبت‌نام.' : 'Error connecting to server.'),
          type: 'error'
        });
      } finally {
        setIsEnrolling(false);
      }
      return;
    }

    // Default to VIP
    navigate('vip');
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
            {course.categoryName || 'آموزش تخصصی'}
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
                  {course.categoryName || 'آموزش تخصصی'}
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
                {hasFullAccess && (
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-3 py-1 rounded-md flex items-center gap-1 border border-teal-200 dark:border-teal-800">
                    <UserCheck size={13} />
                    <span>دسترسی کامل فعال</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {course.subtitle || (course as any).shortDescription}
              </p>

              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <RatingStars rating={course.rating} reviewCount={course.reviewCount || (course as any).reviewsCount || 0} />
                </div>
                <div>•</div>
                <div>
                  <strong className="text-slate-900 dark:text-slate-100">
                    {toPersianDigits(course.studentCount || (course as any).enrolledStudentsCount || 0)}
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
                  <span>زبان: {course.language === 'fa' ? 'فارسی' : 'English'}</span>
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
                  onClick={() => handleOpenPreview()}
                  className="w-14 h-14 rounded-full bg-white text-indigo-900 flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform"
                >
                  <Play size={24} className="fill-indigo-900 ms-1" />
                </button>
              </div>
            </div>

            {/* What You'll Learn Box */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
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
            )}

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
                    {(course.requirements || (course as any).prerequisites || ['آشنایی اولیه با موضوع']).map((req: string, i: number) => (
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
                    {(course.targetAudience || ['دانشجویان و علاقه‌مندان به ورود حرفه‌ای به بازار کار']).map((aud: string, i: number) => (
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
                  {toPersianDigits(modulesList.length)} {t('modulesCount')} • {toPersianDigits(totalLessonsCount)} {t('totalLessons')} • {toPersianDigits(course.durationHours)} {t('hours')}
                </div>
              </div>

              <div className="space-y-3">
                {modulesList.map((module) => {
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
                          {toPersianDigits(module.lessons?.length || 0)} {t('lessons')}
                        </span>
                      </button>

                      {/* Module Lessons List */}
                      {isExpanded && (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {module.lessons?.map((lesson) => {
                            const isFree = !!(lesson.isPreviewFree || (lesson as any).isFreePreview);
                            const canAccessLesson = hasFullAccess || isFree;

                            return (
                              <div
                                key={lesson.id}
                                className="p-3.5 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 text-xs transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  {isFree ? (
                                    <button
                                      onClick={() => handleOpenPreview(lesson.videoUrl)}
                                      className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:scale-105 transition-transform"
                                      title={t('freePreviewAvailable')}
                                    >
                                      <Play size={11} className="fill-indigo-600 ms-0.5" />
                                    </button>
                                  ) : hasFullAccess ? (
                                    <button
                                      onClick={() => navigate('player', course.id)}
                                      className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:scale-105 transition-transform"
                                      title="مشاهده درس"
                                    >
                                      <Play size={11} className="fill-emerald-600 ms-0.5" />
                                    </button>
                                  ) : (
                                    <div 
                                      className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center"
                                      title="دسترسی نیاز به ثبت‌نام دارد"
                                    >
                                      <Lock size={12} />
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-medium text-slate-800 dark:text-slate-200">
                                      {lesson.title}
                                    </span>
                                    {!canAccessLesson && (
                                      <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1 font-medium">
                                        <Crown size={10} />
                                        <span>{isVipCourse ? 'نیازمند اشتراک ویژه VIP' : 'برای دسترسی به این درس ثبت‌نام کنید'}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  {isFree && (
                                    <button
                                      onClick={() => handleOpenPreview(lesson.videoUrl)}
                                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                                    >
                                      {t('freePreviewAvailable')}
                                    </button>
                                  )}
                                  <span className="text-slate-400 text-xs">
                                    {toPersianDigits(lesson.durationMinutes || 15)} دقیقه
                                  </span>
                                </div>
                              </div>
                            );
                          })}
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
                      ? 'مدرس با بیش از ۱۵ سال سابقه حرفه‌ای در تدریس و هدایت پروژه‌های سازمانی بزرگ در کلاس جهانی.'
                      : 'Senior practitioner with over 15 years leading production teams and designing industry curricula.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100">{toPersianDigits(course.rating)}</strong> امتیاز مدرس
                    </div>
                    <div>•</div>
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100">{toPersianDigits(course.studentCount || (course as any).enrolledStudentsCount || 0)}</strong> دانشجو
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
                    {toPersianDigits((course.rating || 4.9).toFixed(1))}
                  </div>
                  <RatingStars rating={course.rating || 4.9} size={16} showScore={false} className="mt-1" />
                  <div className="text-xs text-slate-400 mt-1">
                    {toPersianDigits(course.reviewCount || (course as any).reviewsCount || 0)} امتیاز ثبت شده
                  </div>
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
                    onClick={() => handleOpenPreview()}
                    className="w-14 h-14 rounded-full bg-white text-indigo-900 flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform"
                  >
                    <Play size={22} className="fill-indigo-900 ms-0.5" />
                  </button>
                </div>
                <span className="absolute bottom-3 inset-inline-start-3 bg-black/70 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded font-medium flex items-center gap-1">
                  <Play size={11} />
                  <span>{t('freePreviewAvailable')}</span>
                </span>
              </div>

              {/* Price & Checkout Card */}
              <div className="p-6 space-y-5">
                {/* Price block */}
                {isVipCourse ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-400/40 dark:border-amber-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-black text-sm">
                      <Crown size={18} className="text-amber-500 shrink-0" />
                      <span>دسترسی فقط با اشتراک ویژه (VIP)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      این دوره به همراه تمام دوره‌های دیگر با داشتن یکی از پلن‌های اشتراک VIP در دسترس شما قرار می‌گیرد.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                        {course.price === 0 ? 'رایگان' : formatPriceToman(course.price)}
                      </span>
                      {course.originalPrice && course.originalPrice > course.price ? (
                        <span className="text-xs sm:text-sm text-slate-400 line-through">
                          {formatPriceToman(course.originalPrice)}
                        </span>
                      ) : null}
                    </div>
                    {course.discountPercentage ? (
                      <span className="bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold px-2.5 py-1 rounded-full">
                        ٪{toPersianDigits(course.discountPercentage)} تخفیف
                      </span>
                    ) : null}
                  </div>
                )}

                {/* Primary CTA */}
                <div className="space-y-2.5">
                  <button
                    onClick={handleEnrollOrBuy}
                    disabled={isEnrolling}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isEnrolling
                        ? 'bg-indigo-700 opacity-80 cursor-wait text-white shadow-indigo-900/20'
                        : hasFullAccess
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
                        : isVipCourse
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-amber-500/30'
                        : 'bg-teal-700 hover:bg-teal-600 text-white shadow-teal-700/25'
                    }`}
                  >
                    {isEnrolling ? (
                      <>
                        <RotateCcw className="animate-spin" size={16} />
                        <span>{language === 'fa' ? 'در حال ثبت‌نام در دوره...' : 'Enrolling...'}</span>
                      </>
                    ) : hasFullAccess ? (
                      <>
                        <UserCheck size={18} />
                        <span>{language === 'fa' ? 'ورود به کلاس و مشاهده جلسات' : 'Start Learning'}</span>
                        {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                      </>
                    ) : isVipCourse ? (
                      <>
                        <Crown size={18} />
                        <span>تهیه اشتراک ویژه برای تماشا</span>
                        {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                      </>
                    ) : course.price === 0 || course.isFree ? (
                      <>
                        <span>{language === 'fa' ? 'ثبت‌نام رایگان در دوره' : 'Enroll in Free Course'}</span>
                        {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                      </>
                    ) : (
                      <>
                        <Crown size={18} />
                        <span>تهیه اشتراک ویژه برای تماشا</span>
                        {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                      </>
                    )}
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
                    <span>{toPersianDigits(totalLessonsCount)} جلسه و تمرین عملی و پروژه‌محور</span>
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
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video
                src={activePreviewVideoUrl || (course as any).previewVideoUrl || (course as any).videoPreviewUrl}
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
