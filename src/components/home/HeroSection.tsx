import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, ArrowRight, Play, Sparkles, Headphones, Clock, BookMarked, Compass } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

export const HeroSection: React.FC = () => {
  const { navigate, currentUser, enrollments, courses, isRTL, language } = useApp();

  const enrolledCourseIds = Object.keys(enrollments);
  const activeCourse = enrolledCourseIds.length > 0
    ? courses.find(c => c.id === enrolledCourseIds[0])
    : null;

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-teal-900/5 dark:border-teal-900/20">
      {/* Decorative ambient glowing halos */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] md:w-[750px] h-[550px] md:h-[750px] bg-[radial-gradient(circle,rgba(20,184,166,0.18)_0%,rgba(45,212,191,0.08)_45%,transparent_70%)] blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-12 inset-inline-end-10 w-96 h-96 bg-[radial-gradient(circle,rgba(222,244,238,0.7)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(13,148,136,0.12)_0%,transparent_70%)] blur-2xl rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-[#0b252e] border border-emerald-200/80 dark:border-teal-800 text-xs font-bold text-[#0f766e] dark:text-[#5eead4] shadow-xs">
              <Sparkles size={14} className="text-[#0d9488]" />
              <span>
                {activeCourse 
                  ? (language === 'fa' 
                      ? `خوش آمدید ${currentUser.name} • ادامه یادگیری دوره فعال`
                      : `Welcome back, ${currentUser.name} • Continue your masterclass`)
                  : 'هر روز، یک گام نزدیک‌تر به تخصص و خودت'}
              </span>
            </div>

            {/* Editorial Headline with Teal Highlight */}
            <h1 className="font-extrabold text-3xl sm:text-5xl lg:text-[3.5rem] text-[#06242e] dark:text-white tracking-tight leading-[1.28]">
              مسیر یادگیری <span className="text-[#0d9488] dark:text-[#2dd4bf] font-black">حرفه‌ای</span> و تخصصی را دنبال کن.
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-[#3b5d69] dark:text-slate-300 max-w-2xl leading-relaxed">
              لومینا لرن، خانه‌ای آرام برای کشف، یادگیری عمیق و نگه‌داشتن دانش تخصصی است؛ هر دوره با ریتمی استاندارد که برای رشد مهارت‌های واقعی شما ساخته شده است.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              {activeCourse ? (
                <button
                  onClick={() => navigate('player', activeCourse.id)}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#0b3b49] hover:bg-[#06242e] text-white font-bold text-sm shadow-lg shadow-[#0b3b49]/20 hover:shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Play size={16} className="fill-white ms-0.5" />
                  <span>
                    {language === 'fa' ? 'ادامه یادگیری: ' : 'Resume: '}
                    {activeCourse.title.split(':')[0]}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('catalog')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#0b3b49] hover:bg-[#06242e] text-white font-bold text-sm shadow-lg shadow-[#0b3b49]/20 hover:shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <span>شروع یادگیری و جست‌وجو</span>
                  {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </button>
              )}

              <button
                onClick={() => navigate('catalog')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white dark:bg-[#0b252e] border border-[#ccede5] dark:border-teal-800 text-[#0b3b49] dark:text-[#ccede5] font-bold text-sm hover:bg-[#f0faf7] dark:hover:bg-[#0f3440] hover:text-[#0d9488] hover:border-[#99f6e4] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Compass size={17} className="text-[#0d9488]" />
                <span>مشاهده کاتالوگ دوره‌ها</span>
              </button>
            </div>

            {/* Quick Feature Badges below CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3 text-xs font-semibold text-[#4a6e7a] dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <Headphones size={15} className="text-[#0d9488]" />
                <span>تجربهٔ یادگیری بی‌وقفه</span>
              </div>
              <span className="text-teal-300 dark:text-teal-700">•</span>
              <div className="flex items-center gap-1.5">
                <Clock size={15} className="text-[#0d9488]" />
                <span>سرعت پخش دلخواه</span>
              </div>
              <span className="text-teal-300 dark:text-teal-700">•</span>
              <div className="flex items-center gap-1.5">
                <BookMarked size={15} className="text-[#0d9488]" />
                <span>کتابخانهٔ شخصی و گواهی رسمی</span>
              </div>
            </div>

            {/* Social Trust Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 max-w-lg mx-auto lg:mx-0 border-t border-teal-100 dark:border-teal-900/40 text-[#082f3b] dark:text-white">
              <div>
                <div className="font-extrabold text-xl sm:text-2xl text-[#06242e] dark:text-white">
                  {toPersianDigits('250,000+')}
                </div>
                <div className="text-xs text-[#5a7d89] dark:text-slate-400 mt-0.5 font-medium">
                  دانشجوی فعال
                </div>
              </div>
              <div>
                <div className="font-extrabold text-xl sm:text-2xl text-[#06242e] dark:text-white">
                  {toPersianDigits('1,400+')}
                </div>
                <div className="text-xs text-[#5a7d89] dark:text-slate-400 mt-0.5 font-medium">
                  دوره تخصصی
                </div>
              </div>
              <div>
                <div className="font-extrabold text-xl sm:text-2xl text-[#0d9488] dark:text-[#2dd4bf]">
                  ٪{toPersianDigits('98.4')}
                </div>
                <div className="text-xs text-[#5a7d89] dark:text-slate-400 mt-0.5 font-medium">
                  رضایت فراگیران
                </div>
              </div>
            </div>
          </div>

          {/* Right Featured Hero Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative group">
              {/* Outer Halo Glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-[2.5rem] blur-xl opacity-60 group-hover:opacity-80 transition duration-500" />
              
              {/* Deep Petroleum Feature Card */}
              <div className="relative bg-[#06242e] border border-teal-800/40 rounded-[2rem] overflow-hidden shadow-2xl p-6 text-white">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#03151b] mb-5 border border-teal-900/50">
                  <img
                    src="https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=1200&auto=format&fit=crop"
                    alt="Featured Masterclass"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06242e] via-transparent to-transparent" />
                  
                  {/* Badge on top */}
                  <div className="absolute top-3 inset-inline-start-3 bg-[#06242e]/90 backdrop-blur-xs text-[#5eead4] font-bold text-xs px-3 py-1 rounded-lg border border-teal-700/50">
                    منتخب این هفته
                  </div>

                  <div className="absolute bottom-3 inset-inline-end-3 bg-black/60 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md font-medium">
                    {toPersianDigits(14.5)} ساعت • {toPersianDigits(28)} درس
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#2dd4bf] font-bold bg-teal-950/80 px-2.5 py-1 rounded-md border border-teal-800/60">
                      دیزاین سیستم و معماری رابط
                    </span>
                    <span className="text-slate-300">با تدریس النا رستگار</span>
                  </div>

                  <h3 className="font-extrabold text-lg text-white leading-snug">
                    مسترکلاس طراحی رابط کاربری (UI/UX) و دیزاین سیستم‌های مقیاس‌پذیر
                  </h3>

                  <p className="text-xs text-teal-100/70 leading-relaxed">
                    یادگیری عملی ساخت کامپوننت‌های مدرن، توکن‌های رنگی، ساختار شبکه‌ای و استانداردسازی رابط‌های تعاملی سازمانی.
                  </p>

                  <div className="pt-3 flex items-center justify-between border-t border-teal-900/60">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf] animate-ping" />
                      <span className="text-xs text-teal-200 font-medium">جلسه اول رایگان</span>
                    </div>

                    <button
                      onClick={() => navigate('course-detail', 'modern-ui-ux-design-systems-mastery')}
                      className="px-5 py-2.5 rounded-xl bg-[#2dd4bf] hover:bg-[#14b8a6] text-[#06242e] font-extrabold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Play size={14} className="fill-[#06242e]" />
                      <span>مشاهده پیش‌نمایش</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

