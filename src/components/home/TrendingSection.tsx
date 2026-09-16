import React from 'react';
import { useApp } from '../../context/AppContext';
import { CourseCard } from '../common/CourseCard';
import { Flame, ArrowLeft, ArrowRight } from 'lucide-react';

export const TrendingSection: React.FC = () => {
  const { courses, navigate, t, language, isRTL } = useApp();

  const trendingCourses = courses.filter(c => c.isTrending || c.rating >= 4.95);

  if (trendingCourses.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-[#F3F8F6] dark:bg-[#07171e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#def4ee] dark:bg-[#0e3b47] text-xs font-bold text-[#0d9488] dark:text-[#5eead4] uppercase tracking-wider">
              <Flame size={14} className="fill-[#0d9488] text-[#0d9488]" />
              <span>{t('trending')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#06242e] dark:text-white tracking-tight mt-2">
              {t('trendingCourses')}
            </h2>
            <p className="text-xs sm:text-sm text-[#456774] dark:text-slate-400 mt-1">
              {t('trendingCoursesDesc')}
            </p>
          </div>

          <button
            onClick={() => navigate('catalog', undefined, 'sort=popular')}
            className="text-xs font-bold text-[#0d9488] dark:text-[#2dd4bf] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>{language === 'fa' ? 'مشاهده همه دوره‌های داغ' : 'View All Trending'}</span>
            {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingCourses.slice(0, 3).map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
};
