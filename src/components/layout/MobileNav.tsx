import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Compass, BookOpen, Heart, Sparkles } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

export const MobileNav: React.FC = () => {
  const { currentRoute, navigate, wishlist, enrollments, t } = useApp();

  const activeEnrolledCount = Object.keys(enrollments).length;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#06242e]/95 backdrop-blur-lg border-t border-[#ccede5] dark:border-teal-900/80 px-2 py-2 safe-area-pb">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => navigate('home')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors ${
            currentRoute.view === 'home'
              ? 'text-[#0d9488] dark:text-[#5eead4] font-bold'
              : 'text-[#527683] dark:text-[#8ab5be]'
          }`}
        >
          <Home size={19} />
          <span className="text-[10px]">{t('home')}</span>
        </button>

        {/* Explore / Catalog */}
        <button
          onClick={() => navigate('catalog')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors ${
            currentRoute.view === 'catalog'
              ? 'text-[#0d9488] dark:text-[#5eead4] font-bold'
              : 'text-[#527683] dark:text-[#8ab5be]'
          }`}
        >
          <Compass size={19} />
          <span className="text-[10px]">{t('explore')}</span>
        </button>

        {/* Studio Button in Mobile Center */}
        <button
          onClick={() => navigate('admin')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors ${
            currentRoute.view === 'admin'
              ? 'text-[#0d9488] dark:text-[#5eead4] font-bold'
              : 'text-[#527683] dark:text-[#8ab5be]'
          }`}
        >
          <div className="w-6 h-6 rounded-lg bg-[#def4ee] dark:bg-[#0e3b47] flex items-center justify-center text-[#0d9488] dark:text-[#5eead4]">
            <Sparkles size={14} />
          </div>
          <span className="text-[10px] font-extrabold">استودیو</span>
        </button>

        {/* My Learning */}
        <button
          onClick={() => navigate('dashboard')}
          className={`relative flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors ${
            currentRoute.view === 'dashboard'
              ? 'text-[#0d9488] dark:text-[#5eead4] font-bold'
              : 'text-[#527683] dark:text-[#8ab5be]'
          }`}
        >
          <BookOpen size={19} />
          <span className="text-[10px]">{t('myLearning')}</span>
          {activeEnrolledCount > 0 && (
            <span className="absolute top-1 inset-inline-end-2 w-2 h-2 bg-[#0d9488] rounded-full" />
          )}
        </button>

        {/* Wishlist */}
        <button
          onClick={() => navigate('wishlist')}
          className={`relative flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors ${
            currentRoute.view === 'wishlist'
              ? 'text-[#0d9488] dark:text-[#5eead4] font-bold'
              : 'text-[#527683] dark:text-[#8ab5be]'
          }`}
        >
          <Heart size={19} />
          <span className="text-[10px]">{t('wishlist')}</span>
          {wishlist.length > 0 && (
            <span className="absolute top-1 inset-inline-end-2 w-2 h-2 bg-rose-500 rounded-full" />
          )}
        </button>
      </div>
    </nav>
  );
};
