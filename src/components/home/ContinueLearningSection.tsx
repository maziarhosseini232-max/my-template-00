import React from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

export const ContinueLearningSection: React.FC = () => {
  const { enrollments, courses, navigate, t, language, isRTL } = useApp();

  const enrolledCourseIds = Object.keys(enrollments);
  if (enrolledCourseIds.length === 0) return null;

  const activeCourses = enrolledCourseIds
    .map(id => {
      const course = courses.find(c => c.id === id);
      const enrollment = enrollments[id];
      return { course, enrollment };
    })
    .filter((item): item is { course: typeof courses[0]; enrollment: typeof enrollments[string] } => !!item.course);

  if (activeCourses.length === 0) return null;

  return (
    <section className="py-10 bg-[#EAF8F5] dark:bg-[#071d24] border-b border-[#ccede5] dark:border-teal-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#06242e] dark:text-white">
                {t('continueLearning')}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#def4ee] dark:bg-[#0e3b47] text-[#0b3b49] dark:text-[#5eead4] text-[11px] font-bold">
                <span className="w-1.5 h-1.5 bg-[#0d9488] rounded-full animate-pulse" />
                {language === 'fa' ? 'در حال یادگیری' : 'Active Session'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#456774] dark:text-slate-400 mt-0.5">
              {t('continueLearningDesc')}
            </p>
          </div>
          <button
            onClick={() => navigate('dashboard')}
            className="text-xs font-bold text-[#0d9488] dark:text-[#2dd4bf] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t('myLearning')}</span>
            {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCourses.slice(0, 2).map(({ course, enrollment }) => {
            // Find current lesson title
            let currentLessonTitle = language === 'fa' ? 'ادامه تماشا' : 'Continue watching';
            for (const mod of course.modules) {
              const match = mod.lessons.find(l => l.id === enrollment.lastLessonId);
              if (match) {
                currentLessonTitle = match.title;
                break;
              }
            }

            return (
              <div
                key={course.id}
                onClick={() => navigate('player', course.id)}
                className="group flex flex-col sm:flex-row bg-white dark:bg-[#09222b] border border-[#ccede5] dark:border-teal-900/60 rounded-2xl overflow-hidden shadow-xs hover:border-[#14b8a6]/60 hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                {/* Thumbnail with overlay play */}
                <div className="relative sm:w-48 h-36 sm:h-auto shrink-0 overflow-hidden bg-slate-950">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-[#06242e]/40 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white text-[#0b3b49] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play size={16} className="fill-[#0b3b49] ms-0.5" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#0d9488] dark:text-[#2dd4bf] uppercase tracking-wide">
                      {course.categoryName}
                    </span>
                    <h3 className="font-bold text-sm text-[#06242e] dark:text-slate-100 line-clamp-1 mt-0.5 group-hover:text-[#0d9488] transition-colors">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#527683] dark:text-slate-400 mt-1">
                      <Clock size={12} />
                      <span className="truncate">
                        {language === 'fa' ? 'درس فعال:' : 'Current:'} {currentLessonTitle}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] font-medium text-[#527683] dark:text-slate-400 mb-1.5">
                      <span>
                        {language === 'fa' 
                          ? `${toPersianDigits(enrollment.completedLessonIds.length)} از ${toPersianDigits(course.lessonCount)} درس تکمیل شده`
                          : `${enrollment.completedLessonIds.length} of ${course.lessonCount} lessons completed`}
                      </span>
                      <span className="font-bold text-[#0d9488] dark:text-[#2dd4bf]">
                        {language === 'fa' ? `٪${toPersianDigits(enrollment.progressPercent)}` : `${enrollment.progressPercent}%`}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#def4ee] dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0d9488] rounded-full transition-all duration-300"
                        style={{ width: `${enrollment.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
