import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, Lock, CreditCard, ArrowRight, ArrowLeft, 
  CheckCircle2, AlertCircle, RefreshCw, Smartphone, KeyRound, Building2, HelpCircle 
} from 'lucide-react';
import { formatPriceToman, toPersianDigits } from '../../utils/persian';
import { api } from '../../services/api';

export const PaymentGatewayPortal: React.FC = () => {
  const { currentRoute, navigate, clearCart, enrollCourse, addToast, language, isRTL, setCurrentUser } = useApp();

  // Extract query params from route or window location
  const [orderId, setOrderId] = useState<string>('');
  const [authority, setAuthority] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [gatewayType, setGatewayType] = useState<'ZARINPAL' | 'MOCK_GATEWAY'>('ZARINPAL');

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cvv2, setCvv2] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('7392');
  const [dynamicOtp, setDynamicOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(120);

  // Submission & Result states
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    trackingCode?: string;
    referenceNumber?: string;
    cardPanMasked?: string;
    paidAt?: string;
    amount?: number;
    orderNumber?: string;
    errorMessage?: string;
  } | null>(null);

  useEffect(() => {
    // Parse order and authority from currentRoute or URL search
    const urlParams = new URLSearchParams(window.location.search);
    const qOrder = urlParams.get('order') || currentRoute.param || currentRoute.id || '';
    const qAuth = urlParams.get('authority') || urlParams.get('txn') || 'A000000000000000000000000000' + Math.floor(100000 + Math.random() * 900000);
    const qAmount = Number(urlParams.get('amount')) || 0;
    const qGateway = (urlParams.get('gateway') || 'ZARINPAL') as any;

    setOrderId(qOrder);
    setAuthority(qAuth);
    setGatewayType(qGateway);

    if (qAmount > 0) {
      setAmount(qAmount);
    } else if (qOrder) {
      // Fetch order details
      api.commerce.getOrderById(qOrder).then(res => {
        if (res.data?.order) {
          setAmount(res.data.order.totalAmount);
        }
      }).catch(err => console.warn('Could not load order details:', err));
    }

    generateCaptcha();
  }, [currentRoute]);

  // Dynamic OTP timer
  useEffect(() => {
    let interval: any;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  const generateCaptcha = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptchaCode(code);
    setCaptchaInput('');
  };

  const handleRequestOtp = () => {
    if (cardNumber.replace(/\s/g, '').length < 16) {
      addToast({
        title: 'شماره کارت نامعتبر',
        message: 'لطفاً ابتدا شماره ۱۶ رقمی کارت بانکی خود را وارد نمایید.',
        type: 'error'
      });
      return;
    }
    setOtpSent(true);
    setOtpTimer(120);
    setDynamicOtp('684291'); // Auto-fill demo dynamic password for testing convenience
    addToast({
      title: 'رمز پویا ارسال شد',
      message: 'رمز دوم پویا به شماره همراه متصل به کارت شما پیامک شد.',
      type: 'info'
    });
  };

  // Detect card bank
  const getBankName = (number: string) => {
    const clean = number.replace(/\s/g, '');
    if (clean.startsWith('603799')) return 'بانک ملی ایران';
    if (clean.startsWith('610433')) return 'بانک ملت';
    if (clean.startsWith('621986')) return 'بانک سامان';
    if (clean.startsWith('627412')) return 'بانک اقتصاد نوین';
    if (clean.startsWith('502229')) return 'بانک پاسارگاد';
    if (clean.startsWith('627353')) return 'بانک تجارت';
    if (clean.startsWith('603769')) return 'بانک صادرات ایران';
    if (clean.length >= 6) return 'کارت شبکه شتاب';
    return null;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : raw);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (captchaInput !== captchaCode) {
      addToast({
        title: 'کد امنیتی نادرست است',
        message: 'لطفاً کد امنیتی داخل تصویر را به دقت وارد کنید.',
        type: 'error'
      });
      generateCaptcha();
      return;
    }

    setIsProcessing(true);

    try {
      const res = await api.commerce.verifyPayment({
        orderId: orderId,
        authority: authority,
        status: 'OK'
      });

      if (res.success) {
        // Automatically enroll in all courses
        if (res.data?.enrolledCourseIds) {
          res.data.enrolledCourseIds.forEach((cId: string) => enrollCourse(cId));
        }

        // If VIP subscription was purchased, update currentUser
        if (res.data?.subscriptionEndDate) {
          setCurrentUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, subscriptionEndDate: res.data?.subscriptionEndDate };
            localStorage.setItem('lumina_user', JSON.stringify(updated));
            return updated;
          });
        }

        clearCart();

        setPaymentResult({
          success: true,
          trackingCode: res.data?.order?.trackingCode || authority,
          referenceNumber: res.data?.payment?.transactionId || authority,
          cardPanMasked: res.data?.payment?.cardPanMasked || (cardNumber ? cardNumber.slice(0, 7) + '******' + cardNumber.slice(-4) : '۶۰۳۷-۹۹**-****-۲۸۹۴'),
          paidAt: res.data?.order?.paidAt || new Date().toISOString(),
          amount: res.data?.order?.totalAmount || amount,
          orderNumber: res.data?.order?.orderNumber
        });

        addToast({
          title: 'پرداخت با موفقیت انجام شد! 🎉',
          message: res.data?.message || (res.data?.subscriptionEndDate 
            ? 'تراکنش تایید شد و اشتراک ویژه VIP حساب کاربری شما با موفقیت فعال گردید.'
            : 'تراکنش توسط شبکه بانکی شاپرک تایید شد و دسترسی به دوره‌ها فعال گردید.'),
          type: 'success'
        });
      } else {
        throw new Error(res.message || 'خطا در تایید تراکنش بانکی');
      }
    } catch (err: any) {
      setPaymentResult({
        success: false,
        errorMessage: err?.message || 'تراکنش از سوی بانک یا به دلیل عدم موجودی کافی لغو شد.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPayment = async () => {
    if (orderId) {
      try {
        await api.commerce.verifyPayment({
          orderId,
          authority,
          status: 'NOK'
        });
      } catch {
        // ignore
      }
    }
    addToast({
      title: 'پرداخت لغو شد',
      message: 'شما از فرایند پرداخت انصراف دادید.',
      type: 'info'
    });
    navigate('cart');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#071d24] py-8 px-4 flex flex-col items-center justify-center font-sans text-xs">
      
      {/* Official Shaparak & Gateway Header */}
      <div className="w-full max-w-2xl bg-white dark:bg-[#09252f] rounded-2xl shadow-xl border border-teal-100 dark:border-teal-900/60 overflow-hidden mb-6">
        
        {/* Security Bar */}
        <div className="bg-[#0b3b49] dark:bg-[#06242e] text-white px-6 py-3.5 flex items-center justify-between border-b border-teal-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Lock size={15} />
            </div>
            <div>
              <div className="font-extrabold text-xs tracking-wide">
                درگاه پرداخت الکترونیک شاپرک • زرین‌پال
              </div>
              <div className="text-[10px] text-teal-200/70 font-mono">
                https://shaparak.ir/gateway/v4/pay
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <ShieldCheck size={12} />
              اتصال امن SSL
            </span>
          </div>
        </div>

        {/* Order Details Ribbon */}
        <div className="p-5 bg-teal-50/50 dark:bg-[#0c2e39]/60 border-b border-teal-100 dark:border-teal-900/60 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">پذیرنده اینترنتی</span>
            <span className="font-black text-sm text-[#06242e] dark:text-white">
              آکادمی آموزش آنلاین لومینا لرن (LuminaLearn)
            </span>
          </div>

          <div className="text-start sm:text-end">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">مبلغ قابل پرداخت</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-[#0d9488] dark:text-[#5eead4]">
                {formatPriceToman(amount || 0)}
              </span>
              <span className="text-[10px] text-slate-400">
                ({(amount * 10).toLocaleString('fa-IR')} ریال)
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Content: Receipt vs Form vs Error */}
        {paymentResult?.success ? (
          /* Success Receipt View */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                پرداخت با موفقیت انجام شد
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ثبت‌نام شما نهایی شد و دسترسی به دوره‌های خریداری شده بلافاصله فعال گردید.
              </p>
            </div>

            {/* Receipt Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900/60 max-w-md mx-auto text-start space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">شماره سفارش:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{paymentResult.orderNumber || orderId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">کد پیگیری شاپرک:</span>
                <span className="font-bold text-[#0d9488] dark:text-[#5eead4]">{paymentResult.trackingCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">شماره مرجع بانکی:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{paymentResult.referenceNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans">شماره کارت پرداخت‌کننده:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200" dir="ltr">{paymentResult.cardPanMasked}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-teal-100 dark:border-teal-900">
                <span className="text-slate-500 font-sans">مبلغ نهایی:</span>
                <span className="font-black text-sm text-slate-900 dark:text-white font-sans">{formatPriceToman(paymentResult.amount || amount)}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('dashboard')}
                className="px-6 py-3 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] font-black text-xs flex items-center gap-2 shadow-md hover:opacity-90"
              >
                <span>مشاهده در داشبورد و شروع دوره</span>
                {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
              </button>
              <button
                onClick={() => navigate('home')}
                className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                بازگشت به صفحه اصلی
              </button>
            </div>
          </div>
        ) : paymentResult && !paymentResult.success ? (
          /* Error State View */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle size={36} />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                تراکنش ناموفق بود
              </h2>
              <p className="text-xs text-rose-600 dark:text-rose-400">
                {paymentResult.errorMessage}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPaymentResult(null)}
                className="px-5 py-2.5 rounded-xl bg-[#0b3b49] text-white font-bold text-xs"
              >
                تلاش مجدد پرداخت
              </button>
              <button
                onClick={handleCancelPayment}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                بازگشت به سبد خرید
              </button>
            </div>
          </div>
        ) : (
          /* Interactive Bank Payment Form */
          <form onSubmit={handleSubmitPayment} className="p-6 sm:p-8 space-y-5">
            
            {/* Card Number */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CreditCard size={15} className="text-[#0d9488]" />
                  <span>شماره کارت بانکی (۱۶ رقمی)</span>
                </label>
                {getBankName(cardNumber) && (
                  <span className="text-[11px] font-bold text-[#0d9488] bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                    {getBankName(cardNumber)}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="۶۰۳۷ ۹۹۱۸ ۴۵۲۳ ۷۸۹۰"
                  maxLength={19}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 font-mono text-sm tracking-widest text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0d9488]"
                  dir="ltr"
                  required
                />
              </div>
              <div className="text-[10px] text-slate-400">
                جهت تست می‌توانید از شماره نمونه ۶۰۳۷-۹۹۱۸-۴۵۲۳-۷۸۹۰ استفاده کنید.
              </div>
            </div>

            {/* CVV2 and Expiry Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  کد شناسایی دوم (CVV2)
                </label>
                <input
                  type="password"
                  value={cvv2}
                  onChange={e => setCvv2(e.target.value.slice(0, 4))}
                  placeholder="۳ یا ۴ رقم"
                  maxLength={4}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 font-mono text-xs text-slate-900 dark:text-white"
                  dir="ltr"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  تاریخ انقضای کارت (ماه / سال)
                </label>
                <div className="flex items-center gap-2" dir="ltr">
                  <input
                    type="text"
                    value={expMonth}
                    onChange={e => setExpMonth(e.target.value.slice(0, 2))}
                    placeholder="ماه (۰۸)"
                    maxLength={2}
                    className="w-1/2 px-3 py-2.5 text-center rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 font-mono text-xs text-slate-900 dark:text-white"
                    required
                  />
                  <span className="text-slate-400 font-bold">/</span>
                  <input
                    type="text"
                    value={expYear}
                    onChange={e => setExpYear(e.target.value.slice(0, 2))}
                    placeholder="سال (۰۶)"
                    maxLength={2}
                    className="w-1/2 px-3 py-2.5 text-center rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 font-mono text-xs text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Dynamic OTP (رمز دوم پویا) */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound size={15} className="text-[#0d9488]" />
                  <span>رمز اینترنتی (رمز دوم پویا)</span>
                </span>
                {otpSent && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                    اعتبار رمز: {toPersianDigits(otpTimer)} ثانیه
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={dynamicOtp}
                  onChange={e => setDynamicOtp(e.target.value)}
                  placeholder="رمز پیامک‌شده"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 font-mono text-xs text-slate-900 dark:text-white"
                  dir="ltr"
                  required
                />
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={otpSent && otpTimer > 0}
                  className="px-4 py-2.5 rounded-xl bg-teal-100 dark:bg-teal-900/60 hover:bg-teal-200 text-[#0b3b49] dark:text-[#5eead4] font-bold text-xs whitespace-nowrap disabled:opacity-50"
                >
                  {otpSent ? 'ارسال مجدد رمز' : 'دریافت رمز پویا'}
                </button>
              </div>
            </div>

            {/* Captcha Security */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                کد امنیتی داخل کادر
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={captchaInput}
                  onChange={e => setCaptchaInput(e.target.value)}
                  placeholder="کد ۴ رقمی"
                  maxLength={4}
                  className="w-32 px-4 py-2 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 font-mono text-sm text-slate-900 dark:text-white text-center"
                  dir="ltr"
                  required
                />
                <div className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-lg font-black tracking-widest text-slate-700 dark:text-slate-200 select-none line-through decoration-teal-500">
                  {toPersianDigits(captchaCode)}
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400"
                  title="تغییر تصویر کد امنیتی"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-teal-100 dark:border-teal-900/60 flex flex-wrap items-center justify-between gap-3">
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 sm:flex-initial px-8 py-3 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] font-black text-xs flex items-center justify-center gap-2 shadow-md hover:opacity-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>در حال ارتباط با شاپرک و تایید تراکنش...</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>پرداخت و تایید نهایی ({formatPriceToman(amount)})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancelPayment}
                disabled={isProcessing}
                className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold text-xs"
              >
                انصراف و بازگشت
              </button>
            </div>

          </form>
        )}

      </div>

      {/* Trust & Security Badges footer */}
      <div className="w-full max-w-2xl flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-2 gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>امنیت تراکنش طبق استانداردهای PCI-DSS و پروتکل شاپرک تضمین گردیده است.</span>
        </div>
        <div className="font-mono">
          Authority: {authority.slice(0, 14)}...
        </div>
      </div>

    </div>
  );
};
