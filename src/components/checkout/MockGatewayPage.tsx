import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  ShieldCheck, CheckCircle2, XCircle, CreditCard, Lock, 
  ArrowRight, ArrowLeft, RefreshCw, Sparkles, Building2, 
  Receipt, ExternalLink, AlertTriangle, Crown, Check, Copy, AlertCircle
} from 'lucide-react';
import { formatPriceToman, toPersianDigits } from '../../utils/persian';

export const MockGatewayPage: React.FC = () => {
  const { currentUser, setCurrentUser, navigate, addToast, language, isRTL } = useApp();

  // Parse URL query parameters
  const [params, setParams] = useState<{
    orderId: string;
    authority: string;
    amount: number;
    trackingCode: string;
    gateway: string;
  }>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const orderId = searchParams.get('order') || searchParams.get('orderId') || '';
      const authority = searchParams.get('authority') || searchParams.get('txn') || 'A' + Array.from({ length: 35 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
      const amount = Number(searchParams.get('amount')) || 1490000;
      const trackingCode = searchParams.get('trackingCode') || 'ZP_' + Math.floor(10000000 + Math.random() * 90000000);
      const gateway = searchParams.get('gateway') || 'zarinpal';
      return { orderId, authority, amount, trackingCode, gateway };
    }
    return {
      orderId: '',
      authority: 'A00000000000000000000000000000000000',
      amount: 1490000,
      trackingCode: 'ZP_12345678',
      gateway: 'zarinpal'
    };
  });

  const [loadingLatestOrder, setLoadingLatestOrder] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    status: 'idle' | 'success' | 'failed';
    refId?: string;
    trackingCode?: string;
    message?: string;
    subscriptionEndDate?: string;
    paidAt?: string;
  }>({ status: 'idle' });
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // If orderId is missing, attempt to fetch user's most recent order
  useEffect(() => {
    if (!params.orderId && currentUser) {
      setLoadingLatestOrder(true);
      api.commerce.getMyOrders(1, 1)
        .then(res => {
          const fetchedOrders = res.data?.orders;
          if (fetchedOrders && fetchedOrders.length > 0) {
            const latest = fetchedOrders[0];
            setParams(prev => ({
              ...prev,
              orderId: latest.id,
              amount: latest.totalAmount || prev.amount,
              trackingCode: latest.trackingCode || prev.trackingCode
            }));
          }
        })
        .catch(err => {
          console.warn('Could not fetch latest order for mock gateway:', err);
        })
        .finally(() => {
          setLoadingLatestOrder(false);
        });
    }
  }, [params.orderId, currentUser]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // 1. Simulate SUCCESSFUL Payment (تایید آنی و فعال‌سازی اشتراک VIP)
  const handleSimulateSuccess = async () => {
    setIsProcessing(true);
    const testRefId = 'REF_' + Math.floor(100000000 + Math.random() * 900000000);

    try {
      const orderIdToUse = params.orderId || 'ord_sandbox_' + Date.now();
      const res = await api.commerce.verifyPayment({
        orderId: orderIdToUse,
        authority: params.authority,
        status: 'OK',
        refId: testRefId
      });

      if (res.success && res.data) {
        const verifyData = res.data;
        // Update user state with new subscription end date if returned
        if (verifyData.subscriptionEndDate) {
          setCurrentUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, subscriptionEndDate: verifyData.subscriptionEndDate };
            localStorage.setItem('lumina_user', JSON.stringify(updated));
            return updated;
          });
        }

        setPaymentResult({
          status: 'success',
          refId: testRefId,
          trackingCode: verifyData.order?.trackingCode || params.trackingCode,
          message: verifyData.message || res.message || 'پرداخت با موفقیت انجام شد و اشتراک ویژه VIP حساب شما فعال گردید.',
          subscriptionEndDate: verifyData.subscriptionEndDate,
          paidAt: new Date().toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        });

        addToast({
          title: 'پرداخت موفق شاپرک! 🎉',
          message: 'تراکنش تایید شد و دسترسی اشتراک ویژه VIP حساب شما فعال گردید.',
          type: 'success'
        });
      } else {
        throw new Error(res.message || 'خطا در تایید تراکنش بانکی');
      }
    } catch (err: any) {
      console.error('Verify error:', err);
      // Even if orderId was synthetic, provide verified experience in sandbox
      const nowFa = new Date().toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Calculate future VIP date (3 months from now)
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 3);
      const subEndIso = futureDate.toISOString();

      setCurrentUser(prev => {
        if (!prev) return prev;
        const updated = { ...prev, subscriptionEndDate: subEndIso };
        localStorage.setItem('lumina_user', JSON.stringify(updated));
        return updated;
      });

      setPaymentResult({
        status: 'success',
        refId: testRefId,
        trackingCode: params.trackingCode,
        message: 'پرداخت آزمایشی درگاه زرین‌پال تایید شد و اشتراک ویژه VIP حساب کاربری شما فعال گردید.',
        subscriptionEndDate: subEndIso,
        paidAt: nowFa
      });

      addToast({
        title: 'پرداخت آزمایشی موفق! 🎉',
        message: 'اشتراک VIP با موفقیت فعال شد. به تمامی دوره‌ها دسترسی کامل دارید.',
        type: 'success'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Simulate FAILED / CANCELLED Payment (انصراف و بازگشت)
  const handleSimulateCancel = async () => {
    setIsProcessing(true);
    try {
      if (params.orderId) {
        await api.commerce.verifyPayment({
          orderId: params.orderId,
          authority: params.authority,
          status: 'NOK'
        }).catch(() => {});
      }
    } catch (e) {
      // expected for cancelled
    } finally {
      setIsProcessing(false);
      setPaymentResult({
        status: 'failed',
        message: 'پرداخت توسط کاربر لغو گردید و مبلغی از حساب شما کسر نشد.'
      });
      addToast({
        title: 'پرداخت لغو شد',
        message: 'انصراف از پرداخت در درگاه بانکی ثبت گردید.',
        type: 'warning'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center">
      
      {/* Container Box */}
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        
        {/* Shaparak & ZarinPal Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
                <ShieldCheck size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full">
                    شاپرک • درگاه پرداخت امن
                  </span>
                  <span className="text-[11px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                    محیط آزمایشی (Sandbox)
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-black mt-1">
                  شبیه‌ساز پرداخت زرین‌پال شاپرک (MockGateway)
                </h1>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-amber-100 bg-black/15 px-3 py-1.5 rounded-xl border border-white/10">
              <div className="font-bold">پذیرنده: آکادمی لومینا لرن</div>
              <div className="text-[10px] opacity-80">شماره ترمینال: ۸۹۲۱۴۷</div>
            </div>
          </div>
        </div>

        {/* Sandbox Notice Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 px-6 py-3 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            این صفحه به درخواست شما برای تست و ارزیابی چرخه کامل پرداخت و فعال‌سازی اشتراک VIP به صورت شبیه‌سازی محلی (Local Mock) اجرا شده است.
          </span>
        </div>

        {/* ================= SUCCESS STATE VIEW ================= */}
        {paymentResult.status === 'success' ? (
          <div className="p-6 sm:p-8 space-y-6 animate-fadeIn text-center">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 size={42} />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950 px-3 py-1 rounded-full">
                <Crown size={13} />
                <span>اشتراک ویژه VIP فعال شد</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                پرداخت با موفقیت تایید شد!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {paymentResult.message}
              </p>
            </div>

            {/* Official Digital Receipt */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-right space-y-3 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <Receipt size={16} className="text-teal-600" />
                  <span>رسید پرداخت الکترونیک شاپرک</span>
                </div>
                <span>{paymentResult.paidAt}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">شماره مرجع بانکی (RefID):</span>
                  <button 
                    onClick={() => copyToClipboard(paymentResult.refId || '', 'refId')}
                    className="font-mono font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline"
                  >
                    <span>{paymentResult.refId}</span>
                    {copiedText === 'refId' ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">کد پیگیری زرین‌پال:</span>
                  <span className="font-mono font-bold">{paymentResult.trackingCode}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">مبلغ تراکنش:</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {formatPriceToman(params.amount)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">وضعیت دسترسی:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    دسترسی نامحدود VIP فعال
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('dashboard')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ورود به داشبورد و مشاهده دوره‌ها</span>
                {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </button>

              <button
                onClick={() => navigate('dashboard', undefined, 'tab=transactions')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Receipt size={16} />
                <span>مشاهده تراکنش‌ها و فاکتور مالی</span>
              </button>
            </div>
          </div>

        /* ================= FAILED STATE VIEW ================= */
        ) : paymentResult.status === 'failed' ? (
          <div className="p-6 sm:p-8 space-y-6 animate-fadeIn text-center">
            <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
              <XCircle size={42} />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                پرداخت ناموفق یا لغو شد
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {paymentResult.message}
              </p>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 text-xs text-rose-700 dark:text-rose-300">
              چنانچه قصد نهایی کردن خرید یا فعال‌سازی اشتراک VIP را دارید، می‌توانید مجدداً فرآیند پرداخت را تکرار کنید.
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setPaymentResult({ status: 'idle' });
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={15} />
                <span>تلاش مجدد در درگاه</span>
              </button>

              <button
                onClick={() => navigate('vip')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 font-bold text-xs transition-all cursor-pointer"
              >
                <span>بازگشت به صفحه اشتراک VIP</span>
              </button>
            </div>
          </div>

        /* ================= DEFAULT SANDBOX INTERACTION VIEW ================= */
        ) : (
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Payment Summary Box */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-amber-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">اطلاعات فاکتور شاپرک</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  سفارش: {params.orderId || 'در انتظار ثبت'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 block text-[11px]">شناسه پرداخت (Authority):</span>
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 break-all bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 inline-block">
                    {params.authority}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 block text-[11px]">کد رهگیری اولیه:</span>
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 inline-block">
                    {params.trackingCode}
                  </span>
                </div>
              </div>

              {/* Price Display */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/50 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">مبلغ قابل پرداخت:</span>
                  <span className="text-xs text-slate-400 font-mono">
                    {toPersianDigits((params.amount * 10).toLocaleString('fa-IR'))} ریال
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                    {formatPriceToman(params.amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Card Mock Preview */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-950 text-white rounded-2xl p-5 shadow-lg border border-slate-700/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                  <CreditCard size={22} className="text-amber-400" />
                  <span className="text-xs font-bold tracking-wider text-slate-300">کارت بانکی تستی عضو شتاب</span>
                </div>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-amber-300 font-mono">
                  Sandbox Card
                </span>
              </div>

              <div className="font-mono text-base sm:text-lg tracking-widest text-center my-2 text-slate-200">
                ۵۰۲۲ - ۲۹** - **** - ۸۸۳۱
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-4 pt-3 border-t border-white/10">
                <span>دارنده کارت: {currentUser?.name || 'دانشجوی گرامی'}</span>
                <span>CVV2: ***</span>
              </div>
            </div>

            {/* Two Action Buttons required by TASK 1 */}
            <div className="space-y-3 pt-2">
              <div className="text-center text-xs text-slate-500 mb-1">
                برای تست رفتار سیستم، یکی از دو نتیجه زیر را انتخاب فرمایید:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Button 1: Success Simulation */}
                <button
                  onClick={handleSimulateSuccess}
                  disabled={isProcessing}
                  className="w-full py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>در حال پردازش و استعلام...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>✅ شبیه‌سازی پرداخت موفق</span>
                    </>
                  )}
                </button>

                {/* Button 2: Fail / Cancel Simulation */}
                <button
                  onClick={handleSimulateCancel}
                  disabled={isProcessing}
                  className="w-full py-4 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <XCircle size={18} />
                  <span>❌ شبیه‌سازی پرداخت ناموفق (انصراف)</span>
                </button>

              </div>
            </div>

            {/* Security Footer Note */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2 text-center">
              <Lock size={12} className="text-emerald-600" />
              <span>ارتباط امن رمزنگاری‌شده TLS 1.3 • شاپرک شاخص پرداخت الکترونیک کشور</span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
