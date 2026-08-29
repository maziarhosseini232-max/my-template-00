import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Trash2, ArrowLeft, ArrowRight, ShieldCheck, Tag, Lock, 
  CreditCard, ShoppingBag, Wallet, CheckCircle 
} from 'lucide-react';
import { formatPriceToman, toPersianDigits } from '../../utils/persian';

export const CartView: React.FC = () => {
  const { 
    cart, 
    removeFromCart, 
    clearCart, 
    enrollCourse, 
    navigate, 
    addToast, 
    t, 
    isRTL,
    language 
  } = useApp();

  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'shaparak' | 'wallet' | 'card'>('shaparak');
  const [isProcessing, setIsProcessing] = useState(false);

  // Subtotal
  const subtotal = cart.reduce((acc, course) => acc + course.price, 0);
  const originalSubtotal = cart.reduce((acc, course) => acc + course.originalPrice, 0);
  const discountAmount = Math.round((subtotal * appliedDiscount) / 100);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'LUMINA50' || code === 'نوروز۵۰') {
      setAppliedDiscount(50);
      setCouponApplied(language === 'fa' ? '۵۰٪ تخفیف طلایی' : 'LUMINA50 (50% OFF)');
      addToast({
        title: language === 'fa' ? 'کد تخفیف اعمال شد! 🎉' : 'Coupon Applied!',
        message: language === 'fa' ? '۵۰٪ تخفیف ویژه روی سبد خرید شما اعمال گردید.' : '50% VIP discount applied to your order.',
        type: 'success'
      });
    } else if (code === 'WELCOME20' || code === 'خوش‌آمد۲۰') {
      setAppliedDiscount(20);
      setCouponApplied(language === 'fa' ? '۲۰٪ تخفیف خوش‌آمد' : 'WELCOME20 (20% OFF)');
      addToast({
        title: language === 'fa' ? 'کد تخفیف اعمال شد!' : 'Coupon Applied!',
        message: language === 'fa' ? '۲۰٪ تخفیف خوش‌آمدگویی اعمال شد.' : '20% welcome discount applied.',
        type: 'success'
      });
    } else {
      addToast({
        title: language === 'fa' ? 'کد تخفیف نامعتبر' : 'Invalid Coupon',
        message: language === 'fa' ? 'کد "LUMINA50" یا "WELCOME20" را امتحان کنید.' : 'Try using code "LUMINA50" or "WELCOME20".',
        type: 'error'
      });
    }
    setCouponCode('');
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      cart.forEach(course => enrollCourse(course.id));
      clearCart();
      setIsProcessing(false);
      addToast({
        title: language === 'fa' ? 'ثبت‌نام با موفقیت انجام شد! 🎉' : 'Order Confirmed! 🎉',
        message: language === 'fa' 
          ? `شما با موفقیت در ${toPersianDigits(cart.length)} دوره تخصصی ثبت‌نام شدید. به آکادمی لومینا خوش آمدید!`
          : `Successfully enrolled in ${cart.length} masterclass(es). Welcome aboard!`,
        type: 'success'
      });
      navigate('dashboard');
    }, 900);
  };

  if (cart.length === 0) {
    return (
      <div className="py-16 bg-slate-50/50 dark:bg-slate-950/60 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t('cartEmpty')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
            {language === 'fa'
              ? 'مجموعه دوره‌های آموزشی و مسترکلاس‌های تخصصی را بررسی کنید و مسیر رشد مهارت‌هایتان را آغاز نمایید.'
              : 'Explore our curated selection of masterclasses and level up your craft today.'}
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
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-8">
          {t('shoppingCart')} ({language === 'fa' ? toPersianDigits(cart.length) : cart.length})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map(course => (
              <div
                key={course.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-24 sm:w-32 h-16 sm:h-20 rounded-xl object-cover shrink-0 cursor-pointer"
                    onClick={() => navigate('course-detail', course.slug)}
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      {course.categoryName}
                    </span>
                    <h3
                      onClick={() => navigate('course-detail', course.slug)}
                      className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      {language === 'fa' ? `مدرس: ${course.instructorName}` : `By ${course.instructorName}`}
                    </p>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {language === 'fa' 
                        ? `${toPersianDigits(course.durationHours)} ساعت • ${toPersianDigits(course.lessonCount)} درس`
                        : `${course.durationHours}h • ${course.lessonCount} lessons • ${course.level}`}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                  <div className="text-start sm:text-end">
                    <div className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {formatPriceToman(course.price)}
                    </div>
                    {course.originalPrice > course.price && (
                      <div className="text-xs text-slate-400 line-through">
                        {formatPriceToman(course.originalPrice)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart(course.id)}
                    className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 mt-2"
                  >
                    <Trash2 size={13} />
                    <span>{t('remove')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Order Summary & Checkout */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-5">
              <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                {t('orderSummary')}
              </h2>

              {/* Price rows */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{language === 'fa' ? 'قیمت کل اولیه:' : 'Original Total:'}</span>
                  <span className="line-through">{formatPriceToman(originalSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{language === 'fa' ? 'جمع کل دوره‌ها:' : 'Subtotal:'}</span>
                  <span>{formatPriceToman(subtotal)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>{language === 'fa' ? `تخفیف کوپن (${couponApplied}):` : `Coupon Discount (${couponApplied}):`}</span>
                    <span>- {formatPriceToman(discountAmount)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-base font-bold text-slate-900 dark:text-white">
                  <span>{t('total')}:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{formatPriceToman(finalTotal)}</span>
                </div>
              </div>

              {/* Coupon input */}
              <form onSubmit={handleApplyCoupon} className="pt-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      placeholder={language === 'fa' ? 'کد تخفیف: LUMINA50' : 'Coupon: LUMINA50'}
                      className="w-full ps-8 pe-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs transition-colors"
                  >
                    {language === 'fa' ? 'اعمال' : 'Apply'}
                  </button>
                </div>
              </form>

              {/* Payment Method Selector */}
              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  {language === 'fa' ? 'روش پرداخت آنلاین' : 'Payment Method'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'shaparak', label: language === 'fa' ? 'شاپرک / شتاب' : 'Bank Gateway' },
                    { id: 'wallet', label: language === 'fa' ? 'کیف پول' : 'Wallet' },
                    { id: 'card', label: language === 'fa' ? 'کارت به کارت' : 'Direct Card' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold text-center transition-all ${
                        paymentMethod === m.id
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-indigo-900 hover:bg-indigo-800 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-900/25 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>{language === 'fa' ? 'در حال اتصال به درگاه پرداخت شاپرک...' : 'Securing Enrollment...'}</span>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>
                      {language === 'fa' 
                        ? `پرداخت نهایی و ثبت‌نام • ${formatPriceToman(finalTotal)}`
                        : `Complete Purchase • $${finalTotal.toFixed(2)}`}
                    </span>
                  </>
                )}
              </button>

              {/* Guarantee badge */}
              <div className="pt-2 text-center flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck size={15} className="text-emerald-500" />
                <span>{language === 'fa' ? 'ضمانت بازگشت وجه تا ۳۰ روز' : '30-Day Money-Back Guarantee'}</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
