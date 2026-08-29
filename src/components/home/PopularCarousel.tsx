import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CourseCard } from '../common/CourseCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

export const PopularCarousel: React.FC = () => {
  const { courses, categories, navigate, t, language, isRTL } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredCourses = courses.filter(c => {
    if (selectedCategory === 'all') return true;
    return c.categoryId === selectedCategory;
  });

  return (
    <section className="py-16 bg-[#EAF8F5]/60 dark:bg-[#061c24] border-t border-b border-[#ccede5]/70 dark:border-teal-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-[#0d9488] dark:text-[#2dd4bf] uppercase tracking-wider bg-[#def4ee] dark:bg-[#0e3b47] px-3 py-1 rounded-full">
              {t('popular')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#06242e] dark:text-white tracking-tight mt-2">
              {t('popularCourses')}
            </h2>
            <p className="text-xs sm:text-sm text-[#456774] dark:text-slate-400 mt-1">
              {t('popularCoursesDesc')}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#0b3b49] text-white shadow-xs'
                  : 'bg-white dark:bg-[#09252e] text-[#456774] dark:text-[#ccede5] hover:bg-[#def4ee] hover:text-[#0b3b49] border border-[#ccede5] dark:border-teal-800'
              }`}
            >
              {t('allCourses')}
            </button>
            {categories.slice(0, 4).map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#0b3b49] text-white shadow-xs'
                    : 'bg-white dark:bg-[#09252e] text-[#456774] dark:text-[#ccede5] hover:bg-[#def4ee] hover:text-[#0b3b49] border border-[#ccede5] dark:border-teal-800'
                }`}
              >
                {language === 'fa' ? cat.nameFa : cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.slice(0, 6).map(course => (
            <CourseCard key={course.id} course={course} variant="grid" />
          ))}
        </div>

        {/* Explore all CTA button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('catalog')}
            className="px-7 py-3 rounded-2xl bg-white dark:bg-[#0b2b35] border border-[#ccede5] dark:border-teal-800 text-[#0b3b49] dark:text-[#ccede5] font-extrabold text-xs hover:bg-[#def4ee] hover:text-[#06242e] hover:border-[#99f6e4] transition-all inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span>
              {language === 'fa' 
                ? `مشاهده تمام ${toPersianDigits('1,450')}+ دوره تخصصی`
                : 'Explore All 1,450+ Masterclasses'}
            </span>
            {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </section>
  );
};
