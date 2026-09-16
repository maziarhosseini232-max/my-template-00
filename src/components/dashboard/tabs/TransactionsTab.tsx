import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { api } from '../../../services/api';
import { 
  Receipt, CheckCircle2, XCircle, Clock, ExternalLink, 
  Crown, CreditCard, Sparkles, Filter, RefreshCw, 
  ArrowLeft, ArrowRight, Printer, ShieldCheck, Copy, Check, Download, AlertCircle
} from 'lucide-react';
import { formatPriceToman, toPersianDigits } from '../../../utils/persian';
import { Order } from '../../../types';

export const TransactionsTab: React.FC = () => {
  const { currentUser, navigate, language, isRTL } = useApp();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PAID' | 'FAILED' | 'SUBSCRIPTION'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch real orders from commerce API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.commerce.getMyOrders(1, 50);
      if (res && res.data?.orders) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.warn('Could not fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Helper to format ISO date to readable Persian string
  const formatPersianDate = (isoStr?: string) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  // Resolve plan title
  const getOrderTitle = (order: Order) => {
    if (order.type === 'SUBSCRIPTION' || order.subscriptionPlanId || (order.durationInMonths && order.durationInMonths > 0)) {
      const months = order.durationInMonths || (order.subscriptionPlanId?.includes('12') ? 12 : order.subscriptionPlanId?.includes('6') ? 6 : order.subscriptionPlanId?.includes('3') ? 3 : 1);
      return `اشتراک ویژه VIP (${toPersianDigits(months)} ماهه)`;
    }
    if (order.items && order.items.length > 0) {
      if (order.items.length === 1) {
        return order.items[0].title || 'دوره آموزشی تخصصی';
      }
      return `${order.items[0].title} و ${toPersianDigits(order.items.length - 1)} دوره دیگر`;
    }
    return 'سفارش آموزشی لومینا';
  };

  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    if (filter === 'PAID') return o.status === 'PAID';
    if (filter === 'FAILED') return o.status === 'FAILED' || o.status === 'CANCELLED';
    if (filter === 'SUBSCRIPTION') return o.type === 'SUBSCRIPTION' || Boolean(orderIsVip(o));
    return true;
  });

  function orderIsVip(order: Order) {
    return order.type === 'SUBSCRIPTION' || Boolean(order.subscriptionPlanId) || Boolean(order.durationInMonths);
  }

  // Summary stats
  const totalPaidAmount = orders
    .filter(o => o.status === 'PAID')
    .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  const successfulCount = orders.filter(o => o.status === 'PAID').length;

  const isVipActive = Boolean(
    currentUser?.subscriptionEndDate && new Date(currentUser.subscriptionEndDate) > new Date()
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-full mb-2">
            <Receipt size={14} />
            <span>امور مالی و پرداخت‌ها</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            تراکنش‌های مالی و اشتراک
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            مشاهده سوابق پرداخت‌ها، تمدید اشتراک VIP و دریافت فاکتورهای رسمی دیجیتال شاپرک
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
            title="به‌روزرسانی لیست"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => navigate('vip')}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Crown size={14} />
            <span>خرید یا تمدید اشتراک VIP</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Total Paid */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
            مجموع مبالغ واریزی
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {formatPriceToman(totalPaidAmount)}
          </div>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1 block">
            {toPersianDigits(successfulCount)} تراکنش موفق ثبت‌شده
          </span>
        </div>

        {/* Card 2: Successful Orders */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
            تعداد کل فاکتورها
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {toPersianDigits(orders.length)} عدد
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            شامل خرید اشتراک و دوره‌ها
          </span>
        </div>

        {/* Card 3: VIP Status */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
              وضعیت اشتراک ویژه
            </span>
            <div className="text-sm font-black flex items-center gap-1.5">
              {isVipActive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-600 dark:text-emerald-400">عضویت VIP فعال</span>
                </>
              ) : (
                <span className="text-slate-400">بدون اشتراک فعال</span>
              )}
            </div>
            {isVipActive && currentUser?.subscriptionEndDate && (
              <span className="text-[10px] text-slate-400 mt-1 block">
                تا {formatPersianDate(currentUser.subscriptionEndDate)}
              </span>
            )}
          </div>

          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            isVipActive ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}>
            <Crown size={20} />
          </div>
        </div>

      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          همه تراکنش‌ها ({toPersianDigits(orders.length)})
        </button>

        <button
          onClick={() => setFilter('PAID')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'PAID'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          پرداخت‌های موفق ({toPersianDigits(orders.filter(o => o.status === 'PAID').length)})
        </button>

        <button
          onClick={() => setFilter('SUBSCRIPTION')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'SUBSCRIPTION'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          اشتراک‌های ویژه VIP ({toPersianDigits(orders.filter(orderIsVip).length)})
        </button>

        <button
          onClick={() => setFilter('FAILED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'FAILED'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          ناموفق / انصراف ({toPersianDigits(orders.filter(o => o.status === 'FAILED' || o.status === 'CANCELLED').length)})
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        
        /* Modern Card List of Transactions */
        <div className="space-y-3">
          {filteredOrders.map(order => {
            const isVip = orderIsVip(order);
            const isSuccess = order.status === 'PAID';
            const isFailed = order.status === 'FAILED' || order.status === 'CANCELLED';

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                {/* Right: Icon & Details */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isVip 
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
                      : isSuccess
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                  }`}>
                    {isVip ? <Crown size={20} /> : <CreditCard size={20} />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        {getOrderTitle(order)}
                      </h3>
                      {isVip && (
                        <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md">
                          پلن VIP
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span>{formatPersianDate(order.paidAt || order.createdAt)}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">
                        کد پیگیری: {order.trackingCode || order.orderNumber || '—'}
                      </span>
                      <span>•</span>
                      <span>درگاه: {order.paymentGateway === 'ZARINPAL' ? 'زرین‌پال شاپرک' : 'شبیه‌ساز شاپرک'}</span>
                    </div>
                  </div>
                </div>

                {/* Left: Amount, Badge & Invoice Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60">
                  
                  {/* Status Badge */}
                  <div>
                    {isSuccess ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 size={12} />
                        <span>موفق</span>
                      </span>
                    ) : isFailed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                        <XCircle size={12} />
                        <span>ناموفق</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                        <Clock size={12} />
                        <span>در انتظار</span>
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-left font-black text-sm text-slate-900 dark:text-white min-w-[100px]">
                    {formatPriceToman(order.totalAmount || 0)}
                  </div>

                  {/* Invoice Modal Trigger */}
                  <button
                    onClick={() => setSelectedInvoice(order)}
                    className="p-2 rounded-xl text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="مشاهده جزئیات فاکتور"
                  >
                    <Receipt size={17} />
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      ) : (
        
        /* TASK 3: Universal Attractive Empty State */
        <div className="p-10 sm:p-14 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-inner">
            <Receipt size={32} />
          </div>

          <div className="space-y-1">
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              {filter === 'all' 
                ? 'هنوز هیچ تراکنش مالی یا خریدی ثبت نشده است'
                : 'تراکنشی در این دسته‌بندی یافت نشد'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              با فعال‌سازی اشتراک ویژه VIP، به تمام دوره‌های تخصصی، کارگاه‌های هفتگی و سورس‌کدهای پروژه بدون محدودیت دسترسی خواهید داشت.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('vip')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Crown size={14} />
              <span>خرید اشتراک ویژه VIP (ارتقای حساب)</span>
            </button>

            <button
              onClick={() => navigate('catalog')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              مشاهده کاتالوگ دوره‌ها
            </button>
          </div>
        </div>
      )}

      {/* ================= INVOICE MODAL ================= */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
                  <Receipt size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    فاکتور رسمی الکترونیک
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    شماره سفارش: {selectedInvoice.orderNumber}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Invoice Meta Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px]">خریدار:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {currentUser?.name || 'دانشجوی گرامی'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">تاریخ پرداخت:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatPersianDate(selectedInvoice.paidAt || selectedInvoice.createdAt)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">شماره پیگیری:</span>
                <button
                  onClick={() => copyToClipboard(selectedInvoice.trackingCode || '', 'trk')}
                  className="font-mono font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline"
                >
                  <span>{selectedInvoice.trackingCode || '—'}</span>
                  {copiedCode === 'trk' ? <Check size={11} /> : <Copy size={11} />}
                </button>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">وضعیت فاکتور:</span>
                <span className="font-bold text-emerald-600">پرداخت‌شده و معتبر</span>
              </div>
            </div>

            {/* Item Breakdown */}
            <div className="space-y-2 text-xs">
              <span className="text-slate-400 font-bold block text-[11px]">آیتم‌های فاکتور:</span>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex justify-between items-center">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {getOrderTitle(selectedInvoice)}
                </span>
                <span className="font-mono font-bold">
                  {formatPriceToman(selectedInvoice.subtotal || selectedInvoice.totalAmount)}
                </span>
              </div>

              {selectedInvoice.discountAmount && selectedInvoice.discountAmount > 0 ? (
                <div className="flex justify-between items-center text-emerald-600 px-2">
                  <span>تخفیف اعمال شده ({selectedInvoice.couponCode || 'کوپن'}):</span>
                  <span>- {formatPriceToman(selectedInvoice.discountAmount)}</span>
                </div>
              ) : null}

              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800 px-2 font-black text-sm">
                <span>مبلغ نهایی پرداختی:</span>
                <span className="text-teal-600 dark:text-teal-400">
                  {formatPriceToman(selectedInvoice.totalAmount)}
                </span>
              </div>
            </div>

            {/* Official Digital Seal */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 text-xs text-teal-800 dark:text-teal-300">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-teal-600" />
                <span>مهر تایید شاپرک و درگاه پرداخت رسمی زرین‌پال</span>
              </div>
              <span className="text-[10px] font-mono opacity-75">SECURITY VERIFIED</span>
            </div>

            {/* Print / Close Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer size={14} />
                <span>چاپ فاکتور</span>
              </button>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                بستن
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
