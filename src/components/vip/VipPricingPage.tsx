import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Crown, Sparkles, Check, ArrowRight, ArrowLeft, ShieldCheck, 
  Zap, Clock, HelpCircle, CheckCircle2, ChevronDown, Lock,
  CreditCard, Wallet, Tag, RotateCcw, AlertCircle, Award, Film, Download, Headphones
} from 'lucide-react';
import { SubscriptionPlan, PaymentGatewayType } from '../../types';
import { api } from '../../services/api';
import { formatPriceToman, toPersianDigits } from '../../utils/persian';

export const VipPricingPage: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser,
    isLoggedIn, 
    openAuthModal, 
    navigate, 
    addToast, 
    walletBalance,
    language, 
    isRTL 
  } = useApp();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected plan for checkout modal
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; title: string; discountPercent: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  // Gateways
  const [paymentMethod, setPaymentMethod] = useState<'gateway' | 'wallet'>('gateway');
  const [gateways, setGateways] = useState<{ id: PaymentGatewayType; name: string; isReal: boolean }[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayType>('ZARINPAL');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Fetch subscription plans from backend
  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.commerce.getSubscriptionPlans(true);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        // Sort by duration: 1, 3, 6, 9
        const sorted = [...res.data].sort((a, b) => a.durationInMonths - b.durationInMonths);
        setPlans(sorted);
      } else {
        // Fallback default 4 plans
        setPlans(getDefaultPlans());
      }
    } catch (err: any) {
      console.warn('Could not fetch subscription plans, using standard plans:', err);
      setPlans(getDefaultPlans());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();

    // Fetch available gateways
    api.commerce.getGateways().then(res => {
      if (res.data && res.data.length > 0) {
        setGateways(res.data);
        setSelectedGateway(res.data[0].id);
      }
    }).catch(() => {
      setGateways([
        { id: 'ZARINPAL', name: 'درگاه پرداخت شاپرک زرین‌پال', isReal: true },
        { id: 'MOCK_GATEWAY', name: 'درگاه شبیه‌ساز آزمایشی', isReal: false }
      ]);
    });
  }, []);

  const getDefaultPlans = (): SubscriptionPlan[] => [
    {
      id: 'plan_vip_1m',
      title: 'اشتراک ۱ ماهه طلایی (شروع سریع)',
      durationInMonths: 1,
      price: 490000,
      discountedPrice: 390000,
      features: [
        'دسترسی نامحدود به تمامی دوره‌ها و وبینارها',
        'مشاهده با بالاترین کیفیت ۱۰۸۰p Full HD',
        'دانلود بدون محدودیت فایل‌ها و سورس‌کدها',
        'پشتیبانی تخصصی توسط منتورها',
        'صدور گواهی پایان دوره معتبر'
      ],
      isPopular: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'plan_vip_3m',
      title: 'اشتراک ۳ ماهه نقره‌ای (رشد هدفمند)',
      durationInMonths: 3,
      price: 1190000,
      discountedPrice: 890000,
      features: [
        'دسترسی نامحدود به تمامی دوره‌ها و وبینارها',
        'مشاهده با بالاترین کیفیت ۱۰۸۰p Full HD',
        'دانلود بدون محدودیت فایل‌ها و سورس‌کدها',
        'پشتیبانی تخصصی توسط منتورها',
        'صدور گواهی پایان دوره معتبر',
        'دسترسی به ورکشاپ‌های ماهانه'
      ],
      isPopular: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'plan_vip_6m',
      title: 'اشتراک ۶ ماهه الماس (محبوب‌ترین انتخاب)',
      durationInMonths: 6,
      price: 1850000,
      discountedPrice: 1290000,
      features: [
        'دسترسی نامحدود به تمامی دوره‌ها و وبینارها',
        'مشاهده با بالاترین کیفیت ۱۰۸۰p Full HD',
        'دانلود بدون محدودیت فایل‌ها و سورس‌کدها',
        'پشتیبانی VIP مستقیم توسط منتورها',
        'صدور گواهی پایان دوره همراه با QR Code',
        'دسترسی زودهنگام به دوره‌ها و آپدیت‌های آینده',
        'مشاوره و بازبینی پروژه‌های تمرینی'
      ],
      isPopular: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'plan_vip_9m',
      title: 'اشتراک ۹ ماهه جامع (تسلط حرفه‌ای)',
      durationInMonths: 9,
      price: 2600000,
      discountedPrice: 1790000,
      features: [
        'دسترسی نامحدود به کل آرشیو آموزش‌ها برای ۹ ماه',
        'مشاهده با بالاترین کیفیت ۱۰۸۰p Full HD',
        'امکان دانلود تمام سورس‌ها، فایل‌های پروژه و اسلایدها',
        'مشاوره اختصاصی مسیر شغلی و بررسی پورتفولیو',
        'پشتیبانی اولویت‌دار VIP ۲۴/۷',
        'صدور تمامی مدارک دوره‌ها همراه با استعلام آنلاین',
        'بیشترین صرفه‌جویی اقتصادی (بیش از ۴۰٪ تخفیف)'
      ],
      isPopular: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // User subscription status calculation
  const hasActiveSubscription = Boolean(
    currentUser?.subscriptionEndDate &&
    new Date(currentUser.subscriptionEndDate).getTime() > Date.now()
  );

  const daysRemaining = currentUser?.subscriptionEndDate
    ? Math.max(0, Math.ceil((new Date(currentUser.subscriptionEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const formattedExpiryDate = currentUser?.subscriptionEndDate
    ? new Date(currentUser.subscriptionEndDate).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  // Track current user's active plan duration (e.g. 1, 3, 6, 9 months)
  const [currentUserPlanDuration, setCurrentUserPlanDuration] = useState<number>(1);

  useEffect(() => {
    if (isLoggedIn && hasActiveSubscription) {
      api.commerce.getMyOrders(1, 10).then(res => {
        if (res.success && res.data?.orders) {
          const lastSubOrder = res.data.orders.find(o => o.type === 'SUBSCRIPTION' && o.status === 'PAID');
          if (lastSubOrder && lastSubOrder.durationInMonths) {
            setCurrentUserPlanDuration(lastSubOrder.durationInMonths);
          }
        }
      }).catch(() => {
        if (daysRemaining > 150) setCurrentUserPlanDuration(6);
        else if (daysRemaining > 60) setCurrentUserPlanDuration(3);
        else setCurrentUserPlanDuration(1);
      });
    }
  }, [isLoggedIn, hasActiveSubscription, daysRemaining]);

  const getPlanButtonText = (plan: SubscriptionPlan) => {
    if (!hasActiveSubscription) {
      return 'انتخاب و خرید اشتراک';
    }
    if (plan.durationInMonths <= currentUserPlanDuration) {
      return 'تمدید اشتراک';
    }
    return `ارتقا به ${toPersianDigits(plan.durationInMonths)} ماهه (اقتصادی)`;
  };

  // Handle plan click
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!isLoggedIn) {
      openAuthModal('login');
      addToast({
        title: language === 'fa' ? 'ورود به حساب کاربری' : 'Login Required',
        message: language === 'fa' 
          ? 'لطفاً ابتدا وارد حساب کاربری خود شوید یا حساب جدید بسازید.' 
          : 'Please log in or register to purchase a subscription.',
        type: 'info'
      });
      return;
    }
    setSelectedPlan(plan);
    setAppliedCoupon(null);
    setCouponCode('');
  };

  // Coupon validation
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code || !selectedPlan) return;

    setIsApplyingCoupon(true);
    try {
      const planPrice = selectedPlan.discountedPrice !== undefined ? selectedPlan.discountedPrice : selectedPlan.price;
      const res = await api.commerce.validateCoupon(code, planPrice);
      if (res.success && res.data?.isValid) {
        setAppliedCoupon({
          code,
          title: res.data.coupon?.title || code,
          discountPercent: res.data.coupon?.value || 10
        });
        addToast({
          title: language === 'fa' ? 'کد تخفیف اعمال شد! 🎉' : 'Coupon Applied',
          message: res.data.message || (language === 'fa' ? 'تخفیف ویژه روی پلن اعمال شد.' : 'Discount applied.'),
          type: 'success'
        });
      } else {
        addToast({
          title: language === 'fa' ? 'کد تخفیف نامعتبر' : 'Invalid Coupon',
          message: res.data?.message || (language === 'fa' ? 'کد وارد شده معتبر نمی‌باشد.' : 'Invalid coupon code.'),
          type: 'error'
        });
      }
    } catch {
      if (code === 'VIP50' || code === 'LUMINA50') {
        setAppliedCoupon({
          code,
          title: '۵۰٪ تخفیف اشتراک ویژه VIP',
          discountPercent: 50
        });
        addToast({
          title: 'کد تخفیف اعمال شد! 🎉',
          message: '۵۰٪ تخفیف روی پلن اشتراکی اعمال گردید.',
          type: 'success'
        });
      } else {
        addToast({
          title: 'کد تخفیف نامعتبر',
          message: 'کد وارد شده نامعتبر یا منقضی شده است. کد "VIP50" را امتحان کنید.',
          type: 'error'
        });
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Finalize Checkout
  const handleCheckoutSubmit = async () => {
    if (!selectedPlan) return;

    setIsCheckingOut(true);
    try {
      const res = await api.commerce.checkout({
        planId: selectedPlan.id,
        subscriptionPlanId: selectedPlan.id,
        couponCode: appliedCoupon?.code,
        paymentMethod: paymentMethod === 'wallet' ? 'wallet' : 'gateway',
        paymentGateway: paymentMethod === 'gateway' ? selectedGateway : undefined
      });

      if (res.success && res.data) {
        // 1. Zarinpal / Real Gateway Redirect
        if (res.data.requiresRedirect && res.data.redirectUrl) {
          setIsCheckingOut(false);
          addToast({
            title: language === 'fa' ? 'در حال انتقال به درگاه شاپرک...' : 'Redirecting to Gateway...',
            message: language === 'fa' ? 'در حال اتصال امن به درگاه بانکی.' : 'Connecting to secure payment portal.',
            type: 'info'
          });
          window.history.pushState(null, '', res.data.redirectUrl);
          navigate('mock-gateway', res.data.order?.id);
          return;
        }

        // 2. Direct fulfillment (Mock Gateway or Wallet payment)
        if (res.data.subscriptionEndDate) {
          setCurrentUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, subscriptionEndDate: res.data.subscriptionEndDate };
            localStorage.setItem('lumina_user', JSON.stringify(updated));
            return updated;
          });
        }

        setIsCheckingOut(false);
        setSelectedPlan(null);
        addToast({
          title: language === 'fa' ? 'اشتراک ویژه فعال شد! 🎉' : 'VIP Activated! 🎉',
          message: language === 'fa' 
            ? `اشتراک ${toPersianDigits(selectedPlan.durationInMonths)} ماهه با موفقیت فعال شد. به تمامی دوره‌ها دسترسی کامل دارید.`
            : `Your ${selectedPlan.durationInMonths}-month VIP subscription is now active!`,
          type: 'success'
        });
        navigate('dashboard');
      } else {
        throw new Error(res.message || 'خطا در ثبت سفارش اشتراک');
      }
    } catch (err: any) {
      setIsCheckingOut(false);
      addToast({
        title: language === 'fa' ? 'خطا در پرداخت' : 'Payment Failed',
        message: err?.message || (language === 'fa' ? 'پرداخت انجام نشد. لطفاً مجدداً تلاش فرمایید.' : 'Payment could not be processed.'),
        type: 'error'
      });
    }
  };

  // Price calculations for modal
  const basePlanPrice = selectedPlan
    ? (selectedPlan.discountedPrice !== undefined ? selectedPlan.discountedPrice : selectedPlan.price)
    : 0;
  const discountAmount = appliedCoupon ? Math.round((basePlanPrice * appliedCoupon.discountPercent) / 100) : 0;
  const finalPrice = Math.max(0, basePlanPrice - discountAmount);

  // FAQs data
  const faqs = [
    {
      q: 'آیا با تهیه اشتراک ویژه، به تمام دوره‌ها بدون محدودیت دسترسی خواهم داشت؟',
      a: 'بله! با فعال بودن اشتراک VIP، شما به تمامی دوره‌های تخصصی، وبینارها، فایل‌های تمرینی و آپدیت‌های جدید که در مدت اشتراک شما منتشر می‌شوند، دسترسی کامل، آنی و نامحدود دارید.'
    },
    {
      q: 'اگر اشتراک فعال داشته باشم و پلن جدیدی خریداری کنم، چه اتفاقی می‌افتد؟',
      a: 'سیستم به صورت کاملاً هوشمند مدت زمان پلن جدید را به ادامه تاریخ انقضای فعلی شما اضافه می‌کند؛ بنابراین هیچ روزی از اشتراک قبلی شما از دست نخواهد رفت.'
    },
    {
      q: 'آیا برای جلسات و دوره‌ها گواهینامه پایان دوره نیز صادر می‌شود؟',
      a: 'بله، پس از اتمام جلسات و پروژه‌های هر دوره، گواهینامه رسمی دوزبانه با کد پیگیری و قابلیت استعلام آنلاین برای شما صادر می‌گردد.'
    },
    {
      q: 'آیا می‌توانم فایل‌های سورس‌کد و تمرین‌های دوره‌ها را دانلود کنم؟',
      a: 'بله، تمام مشترکین VIP امکان دانلود مستقیم فایل‌های ضمیمه، پروژه‌ها، اسلایدها و منابع جانبی بدون محدودیت را دارند.'
    }
  ];

  return (
    <div className="py-12 bg-slate-50/60 dark:bg-slate-950/70 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* HERO HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/80 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-bold shadow-xs">
            <Sparkles size={15} className="text-amber-600 dark:text-amber-400 animate-pulse" />
            <span>پلن‌های اشتراک ویژه VIP لومینا لرن</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            یک بار اشتراک تهیه کنید، <span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-600 to-indigo-600 dark:from-teal-400 dark:to-indigo-400">نامحدود یاد بگیرید</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            به جای خرید تکی دوره‌ها با هزینه‌های سنگین، با عضویت در باشگاه VIP لومینا لرن به کل آرشیو آموزش‌های تخصصی، فایل‌ها و آپدیت‌های آینده دسترسی آزاد داشته باشید.
          </p>
        </div>

        {/* USER ACTIVE SUBSCRIPTION STATUS BANNER (If Logged in & Active) */}
        {isLoggedIn && hasActiveSubscription && (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-teal-900 via-indigo-950 to-slate-950 text-white shadow-xl border border-teal-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 shadow-inner">
                  <Crown size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg text-white">
                      اشتراک ویژه VIP شما فعال است
                    </h3>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      فعال
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    اعتبار تا: <strong className="text-amber-300 font-mono">{formattedExpiryDate}</strong> ({toPersianDigits(daysRemaining)} روز باقیمانده)
                  </p>
                  <p className="text-[11px] text-teal-300/90 mt-1.5 flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-400" />
                    <span>سیستم انباشت هوشمند (Stacking) فعال است: زمان پلن جدید مستقیماً به انتهای اعتبار فعلی اضافه می‌شود.</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    const highest = plans.find(p => p.durationInMonths === 9) || plans.find(p => p.isPopular) || plans[0];
                    if (highest) handleSelectPlan(highest);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
                >
                  <Sparkles size={15} />
                  <span>ارتقا به بهترین پلن (۹ ماهه)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRICING CARDS GRID (4 Plans: 1, 3, 6, 9 Months) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {plans.map((plan) => {
              const hasDiscount = Boolean(
                plan.discountedPrice &&
                plan.discountedPrice > 0 &&
                plan.discountedPrice < plan.price
              );
              const effectivePrice = hasDiscount ? plan.discountedPrice! : plan.price;
              const discountPercent = hasDiscount
                ? Math.round(((plan.price - plan.discountedPrice!) / plan.price) * 100)
                : 0;
              const perMonthPrice = Math.round(effectivePrice / plan.durationInMonths);
              const isHighestValueUpgrade = plan.durationInMonths === 9;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between p-6 rounded-3xl transition-all duration-300 ${
                    isHighestValueUpgrade
                      ? 'bg-gradient-to-b from-emerald-50/70 via-white to-teal-50/50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/40 border-2 border-emerald-500 dark:border-emerald-400 shadow-2xl shadow-emerald-500/20 ring-2 ring-emerald-500/30 scale-[1.04] z-10'
                      : plan.isPopular
                      ? 'bg-gradient-to-b from-white via-amber-50/20 to-white dark:from-slate-900 dark:via-amber-950/10 dark:to-slate-900 border-2 border-amber-400 dark:border-amber-500 shadow-xl shadow-amber-500/10 scale-[1.02]'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-teal-500/40'
                  }`}
                >
                  {/* Badges */}
                  {isHighestValueUpgrade ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white font-black text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1.5 whitespace-nowrap ring-2 ring-white dark:ring-slate-900">
                      <Sparkles size={12} className="text-amber-300 fill-amber-300" />
                      <span>بیشترین ارزش خرید و ارتقا (بیش از ۴۰٪ صرفه‌جویی)</span>
                    </div>
                  ) : plan.isPopular ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1 whitespace-nowrap">
                      <Crown size={12} className="text-slate-950" />
                      <span>محبوب‌ترین و به‌صرفه‌ترین انتخاب</span>
                    </div>
                  ) : null}

                  {/* Header info */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-3 py-1 rounded-xl text-xs font-black border ${
                        isHighestValueUpgrade
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900/60'
                      }`}>
                        {toPersianDigits(plan.durationInMonths)} ماهه
                      </span>
                      {hasDiscount && (
                        <div className="px-2.5 py-1 rounded-full bg-rose-500/15 dark:bg-rose-500/20 backdrop-blur-md border border-rose-500/30 text-rose-600 dark:text-rose-300 text-[11px] font-black shadow-xs flex items-center gap-1">
                          <Sparkles size={11} className="text-rose-500 shrink-0" />
                          <span>٪{toPersianDigits(discountPercent)} تخفیف ویژه</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {plan.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        دسترسی بدون قفل برای {toPersianDigits(plan.durationInMonths)} ماه کامل
                      </p>
                    </div>

                    {/* Price block */}
                    <div className="pt-2 pb-3 border-y border-slate-100 dark:border-slate-800/80 space-y-1.5">
                      {hasDiscount ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 line-through font-semibold">
                              {formatPriceToman(plan.price)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">قیمت اصلی</span>
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
                              {toPersianDigits(effectivePrice.toLocaleString('fa-IR'))}
                            </span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">تومان</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                            {toPersianDigits(effectivePrice.toLocaleString('fa-IR'))}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">تومان</span>
                        </div>
                      )}

                      <div className={`text-[11px] font-medium ${isHighestValueUpgrade ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-teal-600 dark:text-teal-400'}`}>
                        معادل ماهانه {toPersianDigits(perMonthPrice.toLocaleString('fa-IR'))} تومان
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2.5 pt-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        امکانات این پلن:
                      </span>
                      {(plan.features || [
                        'دسترسی نامحدود به تمامی دوره‌ها',
                        'مشاهده با بالاترین کیفیت ویدیو',
                        'دانلود تمامی فایل‌ها و منابع آموزشی',
                        'پشتیبانی تخصصی توسط مدرسین'
                      ]).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <Check size={15} className={`${isHighestValueUpgrade ? 'text-emerald-600' : 'text-emerald-500'} shrink-0 mt-0.5`} />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-6 mt-4">
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-3.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                        isHighestValueUpgrade
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                          : plan.isPopular
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                          : 'bg-teal-700 hover:bg-teal-600 text-white shadow-teal-700/20'
                      }`}
                    >
                      <span>{getPlanButtonText(plan)}</span>
                      {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* WHY VIP ADVANTAGES BANNER */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              چرا اشتراک ویژه لومینا لرن؟
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              صرفه‌جویی در هزینه، آزادی عمل در انتخاب مسیر آموزشی و همراهی مداوم
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2 border border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Film size={20} />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">دسترسی به کل دوره‌ها</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                بدون پرداخت هزینه برای هر دوره مجزا، به تمامی دوره‌های برنامه‌نویسی، هوش مصنوعی، طراحی و کسب‌وکار دسترسی دارید.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2 border border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Download size={20} />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">دانلود سورس‌کد و پروژه‌ها</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                تمام فایل‌های تمرینی، فایل‌های لایه‌باز، اسلایدها و پروژه‌های واقعی دوره‌ها را بدون محدودیت دانلود کنید.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2 border border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Award size={20} />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">مدارک بین‌المللی آنلاین</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                با پایان رساندن هر دوره، گواهینامه معتبر با QR Code اختصاصی دریافت کرده و به رزومه خود اضافه کنید.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2 border border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Headphones size={20} />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">پشتیبانی اختصاصی VIP</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                سوالات و اشکالات شما با اولویت بالا توسط اساتید و منتورهای مجرب پلتفرم پاسخ داده می‌شود.
              </p>
            </div>
          </div>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              پرسش‌های متداول درباره اشتراک ویژه
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              پاسخ به سوالاتی که ممکن است قبل از خرید اشتراک داشته باشید
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-start text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* CHECKOUT MODAL / POPUP */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Crown size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    تسویه و فعال‌سازی اشتراک ویژه
                  </h3>
                  <span className="text-xs text-slate-400">
                    پلن انتخابی: {selectedPlan.title}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Plan Info Badge */}
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-teal-950 dark:text-teal-200 block">مدت اعتبار اشتراک:</span>
                <span className="text-teal-700 dark:text-teal-400 mt-0.5 block">
                  {toPersianDigits(selectedPlan.durationInMonths)} ماه دسترسی نامحدود به تمامی دوره‌های VIP
                </span>
              </div>
              <span className="px-3 py-1 bg-teal-600 text-white font-bold rounded-lg text-xs font-mono">
                {toPersianDigits(selectedPlan.durationInMonths)}M VIP
              </span>
            </div>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Tag size={14} className="text-teal-600" />
                <span>کد تخفیف دارید؟</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="مثلاً VIP50 یا LUMINA50"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  disabled={isApplyingCoupon || !couponCode.trim()}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isApplyingCoupon ? 'بررسی...' : 'اعمال'}
                </button>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 pt-1">
                  <span>✓ {appliedCoupon.title} (٪{toPersianDigits(appliedCoupon.discountPercent)} تخفیف)</span>
                  <button 
                    type="button" 
                    onClick={() => setAppliedCoupon(null)}
                    className="text-rose-500 hover:underline text-[11px]"
                  >
                    حذف تخفیف
                  </button>
                </div>
              )}
            </form>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                روش پرداخت:
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('gateway')}
                  className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                    paymentMethod === 'gateway'
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 ring-2 ring-teal-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-teal-600" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">درگاه بانکی شاپرک</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">کلیه کارت‌های عضو شتاب</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                    paymentMethod === 'wallet'
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 ring-2 ring-teal-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Wallet size={16} className="text-amber-500" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">کیف پول لومینا</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    موجودی: {toPersianDigits(walletBalance.toLocaleString('fa-IR'))} ت
                  </span>
                </button>
              </div>

              {/* Gateway Choice if Gateway is Selected */}
              {paymentMethod === 'gateway' && gateways.length > 1 && (
                <div className="pt-1">
                  <label className="text-[11px] text-slate-400 mb-1.5 block">انتخاب درگاه پرداخت:</label>
                  <div className="flex items-center gap-2">
                    {gateways.map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGateway(g.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          selectedGateway === g.id
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>قیمت پایه اشتراک ({toPersianDigits(selectedPlan.durationInMonths)} ماه):</span>
                <span>{formatPriceToman(basePlanPrice)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>تخفیف کوپن:</span>
                  <span>- {formatPriceToman(discountAmount)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm font-extrabold text-slate-900 dark:text-white">
                <span>مبلغ قابل پرداخت نهایی:</span>
                <span className="text-base text-teal-600 dark:text-teal-400 font-mono">
                  {formatPriceToman(finalPrice)}
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCheckoutSubmit}
                disabled={isCheckingOut}
                className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isCheckingOut ? (
                  <>
                    <RotateCcw size={16} className="animate-spin" />
                    <span>در حال اتصال به درگاه پرداخت...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>پرداخت امن و فعال‌سازی آنی اشتراک</span>
                    {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                  </>
                )}
              </button>

              <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1 mt-1">
                <Lock size={11} />
                <span>اتصال امن رمزنگاری‌شده بانکی تحت نظارت شبکه الکترونیکی پرداخت شاپرک</span>
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
