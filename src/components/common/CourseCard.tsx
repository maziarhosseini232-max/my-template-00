import React, { useState } from 'react';
import { Course } from '../../types';
import { useApp } from '../../context/AppContext';
import { RatingStars } from './RatingStars';
import { Play, Clock, BookOpen, Award, Crown, CheckCircle2 } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

interface CourseCardProps {
  course: Course;
  variant?: 'grid' | 'list' | 'compact';
  showEnrollProgress?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  variant = 'grid',
  showEnrollProgress = false
}) => {
  const { 
    navigate, 
    addToCart, 
    isInCart, 
    isEnrolled,
    enrollments,
    language,
    t
  } = useApp();

  const [isHovered, setIsHovered] = useState(false);
  const enrolled = isEnrolled(course.id);
  const enrollment = enrollments[course.id];
  const inCart = isInCart(course.id);

  const handleCardClick = () => {
    if (enrolled) {
      navigate('player', course.id);
    } else {
      navigate('course-detail', course.slug || course.id);
    }
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (enrolled) {
      navigate('player', course.id);
    } else if (inCart) {
      navigate('cart');
    } else {
      addToCart(course);
    }
  };

  // Localized level mapping
  const levelText = language === 'fa' 
    ? (course.level === 'Beginner' || (course.level as any) === 'BEGINNER' ? 'مقدماتی' 
       : course.level === 'Intermediate' || (course.level as any) === 'INTERMEDIATE' ? 'متوسط' 
       : course.level === 'Advanced' || (course.level as any) === 'ADVANCED' ? 'پیشرفته' 
       : 'همه سطوح')
    : course.level;

  const durationDisplay = language === 'fa'
    ? `${toPersianDigits(course.durationHours || 0)} ${t('hours')}`
    : `${course.durationHours || 0}h`;

  const lessonCountDisplay = language === 'fa'
    ? `${toPersianDigits(course.lessonCount || (course as any).totalLessons || 0)} ${t('lessons')}`
    : `${course.lessonCount || (course as any).totalLessons || 0} ${t('lessons')}`;

  const discountPercent = (!course.isFree && course.price > 0 && course.originalPrice > course.price)
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : (course.discountPercentage || 0);

  if (variant === 'list') {
    return (
      <div 
        onClick={handleCardClick}
        className="group relative flex flex-col md:flex-row bg-white dark:bg-[#09222b] border border-[#ccede5] dark:border-teal-900/60 rounded-2xl overflow-hidden shadow-xs hover:border-[#14b8a6]/60 hover:shadow-lg transition-all duration-200 cursor-pointer"
      >
        {/* Thumbnail */}
        <div className="relative md:w-72 h-48 md:h-auto shrink-0 overflow-hidden bg-slate-900">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-white/95 text-[#0b3b49] flex items-center justify-center shadow-lg backdrop-blur-xs transform scale-95 group-hover:scale-100 transition-transform">
              <Play size={18} className="fill-[#0b3b49] ms-0.5" />
            </div>
          </div>
          {course.isTrending && (
            <span className="absolute top-3 inset-inline-start-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-[#0b3b49] dark:text-[#5eead4] font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider shadow-2xs border border-gray-200/50 dark:border-slate-700/50">
              {t('trending')}
            </span>
          )}
          {course.isNew && (
            <span className="absolute top-3 inset-inline-start-3 bg-[#0d9488] text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider shadow-2xs">
              {t('newBadge')}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-[#0b3b49] dark:text-[#5eead4] bg-[#def4ee] dark:bg-[#0e3b47] px-2.5 py-0.5 rounded-md">
                {course.categoryName}
              </span>
            </div>

            <h3 className="text-base font-bold text-[#06242e] dark:text-slate-100 group-hover:text-[#0d9488] dark:group-hover:text-[#2dd4bf] transition-colors line-clamp-1 mb-1">
              {course.title}
            </h3>
            <p className="text-xs text-[#527683] dark:text-slate-400 line-clamp-2 mb-3">
              {course.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#527683] dark:text-slate-400 mb-3">
              <div className="flex items-center gap-2">
                <img
                  src={course.instructorAvatar}
                  alt={course.instructorName}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="font-medium text-[#0b3b49] dark:text-slate-300">{course.instructorName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={13} />
                <span>{durationDisplay}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen size={13} />
                <span>{lessonCountDisplay}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#f0faf7] dark:bg-[#0e3b47] text-[11px] font-medium text-[#0b3b49] dark:text-slate-300">
                {levelText}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-teal-100 dark:border-teal-900/60">
            <RatingStars rating={course.rating} reviewCount={course.reviewCount} />
            <div className="flex items-center gap-3">
              <div className="text-start">
                {enrolled ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0d9488] dark:text-[#5eead4] bg-[#def4ee] dark:bg-[#0e3b47] px-2.5 py-1 rounded-lg">
                    <CheckCircle2 size={14} />
                    <span>{t('enrolled')}</span>
                  </span>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/60 text-xs font-bold text-amber-700 dark:text-amber-300">
                    <Crown size={14} className="text-amber-500 fill-amber-400" />
                    <span>دسترسی با اشتراک ویژه</span>
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  enrolled
                    ? 'bg-[#0d9488] text-white hover:bg-[#0f766e]'
                    : 'bg-[#0b3b49] hover:bg-[#06242e] text-white shadow-xs'
                }`}
              >
                {enrolled ? t('goToCourse') : 'مشاهده دوره'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid / Compact default variant
  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-white dark:bg-[#09222b] border border-[#ccede5] dark:border-teal-900/60 rounded-2xl overflow-hidden shadow-xs hover:border-[#14b8a6]/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient Overlay & Hover Preview Button */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="px-3.5 py-1.5 rounded-full bg-white/95 text-[#0b3b49] font-bold text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-xs transform scale-95 group-hover:scale-100 transition-transform">
            <Play size={13} className="fill-[#0b3b49] ms-0.5" />
            <span>{enrolled ? t('goToCourse') : t('previewCourse')}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2.5 inset-inline-start-2.5 flex flex-wrap gap-1.5 pointer-events-none">
          {course.isTrending && (
            <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-[#0b3b49] dark:text-[#5eead4] font-bold text-[10px] px-2 py-0.5 rounded shadow-2xs uppercase tracking-wider border border-teal-200/50 dark:border-teal-800">
              {t('trending')}
            </span>
          )}
          {course.isNew && (
            <span className="bg-[#0d9488] text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-2xs uppercase tracking-wider">
              {t('newBadge')}
            </span>
          )}
        </div>

        {/* Duration / Certificate pill */}
        <div className="absolute bottom-2 inset-inline-start-2.5 inset-inline-end-2.5 flex items-center justify-between text-[11px] text-white/90 font-medium">
          <span className="bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px]">
            {durationDisplay}
          </span>
          {course.hasCertificate && (
            <span className="bg-[#06242e]/90 text-[#5eead4] border border-teal-500/30 px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-xs text-[10px]">
              <Award size={11} />
              <span>{language === 'fa' ? 'گواهی‌نامه' : 'Cert'}</span>
            </span>
          )}
        </div>
      </div>

      {/* Body Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="font-bold text-[#0d9488] dark:text-[#2dd4bf]">
              {course.categoryName}
            </span>
            <span className="text-[#527683] dark:text-slate-400 text-[11px]">
              {levelText}
            </span>
          </div>

          <h3 className="font-bold text-[#06242e] dark:text-slate-100 text-sm leading-snug group-hover:text-[#0d9488] dark:group-hover:text-[#2dd4bf] transition-colors line-clamp-2 mb-1.5">
            {course.title}
          </h3>

          <p className="text-xs text-[#527683] dark:text-slate-400 line-clamp-1 mb-2.5">
            {course.subtitle}
          </p>

          <div className="flex items-center gap-2 mb-3">
            <img
              src={course.instructorAvatar}
              alt={course.instructorName}
              className="w-5 h-5 rounded-full object-cover border border-[#ccede5] dark:border-teal-800"
            />
            <span className="text-xs text-[#456774] dark:text-slate-300 font-medium truncate">
              {course.instructorName}
            </span>
          </div>
        </div>

        {/* Progress bar if Enrolled */}
        {showEnrollProgress && enrolled && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500 dark:text-slate-400">{t('courseProgress')}</span>
              <span className="font-bold text-[#0d9488] dark:text-[#2dd4bf]">
                {language === 'fa' ? toPersianDigits(enrollment?.progressPercent || 0) : enrollment?.progressPercent || 0}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#0d9488] rounded-full transition-all duration-300"
                style={{ width: `${enrollment?.progressPercent || 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Rating and Subscription Access Row */}
        <div className="pt-2.5 border-t border-teal-100 dark:border-teal-900/60 flex items-center justify-between">
          <RatingStars rating={course.rating} reviewCount={course.reviewCount} />
          
          <div className="flex items-center gap-1.5 text-start">
            {enrolled ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0d9488] dark:text-[#5eead4] bg-[#def4ee] dark:bg-[#0e3b47] px-2 py-0.5 rounded-lg">
                <CheckCircle2 size={13} />
                <span>{t('enrolled')}</span>
              </span>
            ) : (
              <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/60 px-2 py-0.5 rounded-lg">
                <Crown size={12} className="text-amber-500 fill-amber-400" />
                <span>دسترسی VIP</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
