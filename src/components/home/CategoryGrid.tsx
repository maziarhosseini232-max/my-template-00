import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Palette, Code, Sparkles, Film, TrendingUp, 
  Camera, Headphones, PenTool, ArrowUpLeft, ArrowUpRight 
} from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

export const CategoryGrid: React.FC = () => {
  const { categories, courses, navigate, t, language, isRTL } = useApp();

  const getIcon = (name: string) => {
    switch (name) {
      case 'Palette': return <Palette size={20} />;
      case 'Code': return <Code size={20} />;
      case 'Sparkles': return <Sparkles size={20} />;
      case 'Film': return <Film size={20} />;
      case 'TrendingUp': return <TrendingUp size={20} />;
      case 'Camera': return <Camera size={20} />;
      case 'Headphones': return <Headphones size={20} />;
      default: return <PenTool size={20} />;
    }
  };

  return (
    <section className="py-16 bg-[#F3F8F6] dark:bg-[#07171e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-[#0d9488] dark:text-[#2dd4bf] uppercase tracking-wider bg-[#def4ee] dark:bg-[#0e3b47] px-3 py-1 rounded-full">
              {t('allCategories')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#06242e] dark:text-white tracking-tight mt-2">
              {t('featuredCategories')}
            </h2>
            <p className="text-xs sm:text-sm text-[#456774] dark:text-slate-400 mt-1 max-w-xl">
              {t('featuredCategoriesDesc')}
            </p>
          </div>
          <button
            onClick={() => navigate('catalog')}
            className="text-xs font-bold text-[#0d9488] dark:text-[#2dd4bf] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>{language === 'fa' ? 'مشاهده همه دسته‌بندی‌ها' : 'View All Categories'}</span>
            {isRTL ? <ArrowUpLeft size={14} /> : <ArrowUpRight size={14} />}
          </button>
        </div>

        {/* Category Visual Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map(category => (
            <div
              key={category.id}
              onClick={() => navigate('catalog', undefined, `category=${category.id}`)}
              className="group relative h-48 sm:h-56 rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-[#ccede5] dark:border-teal-900/40"
            >
              {/* Background Image */}
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                loading="lazy"
              />

              {/* Dark Petroleum Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#06242e]/95 via-[#06242e]/45 to-transparent group-hover:from-[#0b3b49]/95 transition-colors" />

              {/* Content */}
              <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md text-[#5eead4] flex items-center justify-center border border-white/25 shadow-md">
                  {getIcon(category.iconName)}
                </div>

                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base leading-snug group-hover:text-[#5eead4] transition-colors">
                    {language === 'fa' ? category.nameFa : category.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-teal-100/80 mt-0.5 font-medium">
                    {(() => {
                      const count = courses.filter(c => c.categoryId === category.id || c.category === category.id || c.categoryId === category.slug).length;
                      return language === 'fa' ? `${toPersianDigits(count)} دوره تخصصی` : `${count} Masterclasses`;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
