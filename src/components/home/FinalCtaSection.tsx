import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, ArrowRight, Sparkles, UserPlus } from 'lucide-react';

export const FinalCtaSection: React.FC = () => {
  const { navigate, t, language, isRTL } = useApp();

  return (
    <section className="py-20 bg-gradient-to-br from-[#06242e] via-[#0b3b49] to-[#041920] text-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#5eead4_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-1/2 -inset-inline-start-20 w-80 h-80 bg-[#14b8a6]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -inset-inline-end-20 w-80 h-80 bg-[#5eead4]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-teal-200">
          <Sparkles size={14} className="text-[#5eead4]" />
          <span>{language === 'fa' ? 'جهش بزرگ در مسیر پیشرفت شغلی' : 'Transform your career trajectory'}</span>
        </div>

        <h2 className="font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight">
          {t('finalCtaHeadline')}
        </h2>

        <p className="text-base sm:text-lg text-teal-100/90 max-w-2xl mx-auto leading-relaxed">
          {t('finalCtaSubheadline')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => navigate('catalog')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#5eead4] hover:bg-[#2dd4bf] text-[#06242e] font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('exploreCourses')}</span>
            {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </button>

          <button
            onClick={() => navigate('instructor')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus size={16} />
            <span>{t('teachOnLumina')}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
