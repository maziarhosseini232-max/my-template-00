import React from 'react';
import { useApp } from '../../context/AppContext';
import { Quote, Star } from 'lucide-react';

export const TestimonialSection: React.FC = () => {
  const { t, language } = useApp();

  const testimonialsFa = [
    {
      name: 'سارا مرادی',
      role: 'طراح ارشد محصول در اسنپ',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop',
      course: 'مسترکلاس دیزاین سیستم سازمانی',
      quote: 'کیفیت آموزش‌ها و عمق بررسی مباحث توکن‌های طراحی به حدی بالا بود که مستقیماً در ارتقای معماری سیستم دیزاین تیم ما به کار آمد و مسیر شغلی مرا متحول کرد.',
      rating: 5
    },
    {
      name: 'مهندس امیررضا رضایی',
      role: 'مدیر فنی تیم هوش مصنوعی تپسی',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=300&auto=format&fit=crop',
      course: 'معماری ایجنت‌های هوش مصنوعی فول‌استک',
      quote: 'توضیحات دکتر آریا زندی درباره ماشین‌های وضعیت و ارتباطات استریمینگ ایجنت‌ها فراتر از استانداردهای دوره‌های معمول بود. فوق‌العاده کاربردی و دقیق.',
      rating: 5
    },
    {
      name: 'نیلوفر صادقی',
      role: 'کارگردان و اصلاح‌کننده رنگ سینمایی',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
      course: 'کالرگریدینگ پیشرفته در داوینچی ریزالو',
      quote: 'تسلط بر علم رنگ و فضاهای لاگ توسط استاد شریفی باعث شد بتوانم به صورت حرفه‌ای پروژه‌های ویدیویی بین‌المللی با کیفیت سینمایی را تحویل دهم.',
      rating: 5
    }
  ];

  const testimonialsEn = [
    {
      name: 'Sophia Montgomery',
      role: 'Staff Product Designer at Stripe',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop',
      course: 'Enterprise Design Systems Masterclass',
      quote: 'Lumina represents a quantum leap in online education. The depth of instruction on tokenized design architecture provided the exact foundation that secured my lead position.',
      rating: 5
    },
    {
      name: 'Amir Rezaei',
      role: 'Founding Engineer at Synthetix AI',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=300&auto=format&fit=crop',
      course: 'Fullstack AI Agents Architecture',
      quote: 'The explanations of structured agent state machines and streaming contracts are better than university graduate programs. Absolutely essential for modern engineers.',
      rating: 5
    },
    {
      name: 'Claire Dupont',
      role: 'Commercial Film Director, Paris',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
      course: 'Cinematic Color Grading in DaVinci',
      quote: 'The color science breakdown transformed my commercial look development. You are not just learning button clicks; you are mastering visual taste and emotional resonance.',
      rating: 5
    }
  ];

  const list = language === 'fa' ? testimonialsFa : testimonialsEn;

  return (
    <section className="py-20 bg-[#F3F8F6] dark:bg-[#07171e] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-[#0d9488] dark:text-[#2dd4bf] uppercase tracking-wider bg-[#def4ee] dark:bg-[#0e3b47] px-3.5 py-1 rounded-full">
            {language === 'fa' ? 'نتایج واقعی دانشجویان' : 'Proven Outcomes'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#06242e] dark:text-white tracking-tight mt-2">
            {t('testimonials')}
          </h2>
          <p className="text-xs sm:text-sm text-[#456774] dark:text-slate-400 mt-1">
            {t('testimonialsDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {list.map((tItem, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-[#09222b] border border-[#ccede5] dark:border-teal-900/60 relative hover:shadow-lg hover:border-[#14b8a6]/60 transition-all duration-300 shadow-xs"
            >
              <Quote className="w-8 h-8 text-[#0d9488]/30 dark:text-teal-500/40 mb-3 shrink-0" />
              
              <p className="text-xs sm:text-sm text-[#31515c] dark:text-slate-300 leading-relaxed italic mb-6">
                &ldquo;{tItem.quote}&rdquo;
              </p>

              <div>
                <div className="flex items-center gap-1 text-[#0d9488] mb-3">
                  {Array.from({ length: tItem.rating }).map((_, i) => (
                    <Star key={i} size={13} className="fill-[#0d9488]" />
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-[#ccede5]/60 dark:border-teal-900/40">
                  <img
                    src={tItem.avatar}
                    alt={tItem.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#ccede5] dark:border-teal-800"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-[#06242e] dark:text-slate-100">{tItem.name}</h4>
                    <p className="text-[11px] text-[#527683] dark:text-slate-400">{tItem.role}</p>
                    <span className="text-[10px] text-[#0d9488] dark:text-[#2dd4bf] font-medium">
                      {language === 'fa' ? `دانشجوی ${tItem.course}` : `Enrolled in ${tItem.course}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
