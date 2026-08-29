import React from 'react';
import { useApp } from '../../context/AppContext';
import { CourseCard } from '../common/CourseCard';
import { Heart, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

export const WishlistView: React.FC = () => {
  const { wishlist, courses, addToCart, navigate, t, language, isRTL } = useApp();

  const wishlistCourses = courses.filter(c => wishlist.includes(c.id));

  const handleMoveAllToCart = () => {
    wishlistCourses.forEach(c => addToCart(c));
    navigate('cart');
  };

  if (wishlistCourses.length === 0) {
    return (
      <div className="py-16 bg-slate-50/50 dark:bg-slate-950/60 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Heart size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {language === 'fa' ? 'لیست علاقه‌مندی‌های شما خالی است' : 'Your Wishlist is Empty'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
            {language === 'fa'
              ? 'دوره‌هایی را که مایلید بعداً یاد بگیرید، با کلیک روی آیکون قلب در کارت دوره ذخیره نمایید.'
              : 'Bookmark courses you want to master later by clicking the heart icon on any masterclass card.'}
          </p>
          <button
            onClick={() => navigate('catalog')}
            className="px-6 py-3 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs transition-all inline-flex items-center gap-2 shadow-lg shadow-indigo-900/25"
          >
            <span>{t('exploreCourses')}</span>
            {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-slate-50/50 dark:bg-slate-950/60 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t('myWishlist')} ({language === 'fa' ? toPersianDigits(wishlistCourses.length) : wishlistCourses.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {language === 'fa'
                ? 'دوره‌های ذخیره‌شده برای برنامه‌ریزی یادگیری و پیشرفت آینده شما.'
                : 'Courses saved for your upcoming learning milestones.'}
            </p>
          </div>

          <button
            onClick={handleMoveAllToCart}
            className="px-5 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs transition-all flex items-center gap-2 self-start sm:self-auto shadow-md"
          >
            <ShoppingBag size={14} />
            <span>{language === 'fa' ? 'انتقال همه به سبد خرید' : 'Move All to Cart'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistCourses.map(course => (
            <CourseCard key={course.id} course={course} variant="grid" />
          ))}
        </div>
      </div>
    </div>
  );
};
