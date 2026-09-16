import React from 'react';
import { useApp } from '../../context/AppContext';
import { InstructorCard } from '../common/InstructorCard';
import { Award, ArrowLeft, ArrowRight } from 'lucide-react';

export const InstructorSpotlight: React.FC = () => {
  const { instructors, navigate, t, language, isRTL } = useApp();

  if (instructors.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-[#EAF8F5]/60 dark:bg-[#061c24] border-t border-b border-[#ccede5]/70 dark:border-teal-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#def4ee] dark:bg-[#0e3b47] text-xs font-bold text-[#0d9488] dark:text-[#5eead4] uppercase tracking-wider">
              <Award size={15} />
              <span>{language === 'fa' ? 'اساتید برجسته و راهبران صنعت' : 'World-Class Mentors'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#06242e] dark:text-white tracking-tight mt-2">
              {t('instructorSpotlight')}
            </h2>
            <p className="text-xs sm:text-sm text-[#456774] dark:text-slate-400 mt-1 max-w-xl">
              {t('instructorSpotlightDesc')}
            </p>
          </div>

          <button
            onClick={() => {
              navigate('instructor');
            }}
            className="text-xs font-bold text-[#0d9488] dark:text-[#2dd4bf] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>{t('teachOnLumina')}</span>
            {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {instructors.map(instructor => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))}
        </div>
      </div>
    </section>
  );
};
