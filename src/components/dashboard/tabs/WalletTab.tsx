import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft,
  CreditCard, ShieldCheck, CheckCircle2, AlertCircle, 
  Clock, RefreshCw, Eye, EyeOff, Search, Filter,
  Sparkles, Download, Receipt, Copy, ExternalLink, Zap
} from 'lucide-react';
import { formatPriceToman, toPersianDigits } from '../../../utils/persian';
import { WalletTransaction } from '../../../types';

export const WalletTab: React.FC = () => {
  const { 
    currentUser, 
    walletBalance, 
    transactions, 
    chargeWallet, 
    addToast 
  } = useApp();

  const [hideBalance, setHideBalance] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number>(1000000);
  const [customAmount, setCustomAmount] = useState<string>('1000000');
  const [selectedGateway, setSelectedGateway] = useState<'saman' | 'zarinpal' | 'mellat'>('saman');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'deposit' | 'purchase' | 'bonus'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<WalletTransaction | null>(null);

  // Preset amounts in Tomans
  const presetAmounts = [
    { label: '۵۰۰ هزار تومان', value: 500000 },
    { label: '۱ میلیون تومان', value: 1000000 },
    { label: '۲ میلیون تومان', value: 2000000 },
    { label: '۵ میلیون تومان', value: 5000000 },
    { label: '۱۰ میلیون تومان', value: 10000000 }
  ];

  const handleSelectPreset = (val: number) => {
    setSelectedPreset(val);
    setCustomAmount(val.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(rawVal);
    setSelectedPreset(Number(rawVal) || 0);
  };

  const handleChargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(customAmount, 10);
    if (isNaN(amountNum) || amountNum < 50000) {
      addToast({
        title: 'مبلغ نامعتبر',
        message: 'حداقل مبلغ قابل شارژ ۵۰٬۰۰۰ تومان می‌باشد.',
        type: 'error'
      });
      return;
    }

    setIsProcessing(true);
    const gatewayName = selectedGateway === 'saman' 
      ? 'سامان کیش (شاپرک)' 
      : selectedGateway === 'zarinpal' 
        ? 'زرین‌پال' 
        : 'بانک ملت (به‌پرداخت)';

    setTimeout(() => {
      const res = chargeWallet(amountNum, gatewayName);
      setIsProcessing(false);
    }, 800);
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter(tx => {
    if (activeFilter !== 'all' && tx.type !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.title.toLowerCase().includes(q) ||
        tx.trackingCode.toLowerCase().includes(q) ||
        (tx.description && tx.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calculate totals
  const totalDeposits = transactions
    .filter(t => t.type === 'deposit' || t.type === 'bonus')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = transactions
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + t.amount, 0);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast({
      title: 'کپی شد',
      message: 'کد پیگیری در حافظه کپی شد.',
      type: 'info'
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Wallet Digital Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Luxury Digital Virtual Card */}
        <div className="lg:col-span-5 relative p-6 sm:p-7 rounded-3xl bg-gradient-to-tr from-slate-950 via-slate-900 to-teal-950 text-white border border-teal-900/60 shadow-2xl overflow-hidden flex flex-col justify-between min-h-[240px]">
          
          {/* Card Decorative Elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Card Top Row */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <Wallet size={18} />
              </div>
              <div>
                <span className="font-bold text-sm text-teal-300">لومینا کارت</span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">کیف پول دیجیتال</span>
              </div>
            </div>
            <button
              onClick={() => setHideBalance(!hideBalance)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              title={hideBalance ? 'نمایش موجودی' : 'مخفی کردن موجودی'}
            >
              {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Card Chip & Balance */}
          <div className="my-6 relative z-10">
            <span className="text-xs text-slate-400 font-medium block mb-1">موجودی فعلی حساب شما</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                {hideBalance ? '••••••••' : toPersianDigits(walletBalance.toLocaleString('fa-IR'))}
              </span>
              <span className="text-sm font-bold text-teal-400">تومان</span>
            </div>
          </div>

          {/* Card Bottom Row */}
          <div className="flex items-center justify-between relative z-10 pt-4 border-t border-white/10 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">صاحب حساب</span>
              <span className="font-bold text-slate-200">{currentUser.name}</span>
            </div>
            <div className="text-left font-mono text-[11px] text-slate-400">
              <span>LUMINA-PAY</span>
              <span className="text-teal-400 mr-2">● عضو ویژه</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Stats & Benefits */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">مجموع شارژ و واریزها</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ArrowDownLeft size={18} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {toPersianDigits(totalDeposits.toLocaleString('fa-IR'))}
                <span className="text-xs text-slate-400 font-sans mr-1 font-normal">تومان</span>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                <TrendingUp size={13} />
                تراکنش‌های موفق بانکی
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">مجموع پرداختی خرید دوره‌ها</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ArrowUpRight size={18} />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {toPersianDigits(totalSpent.toLocaleString('fa-IR'))}
                <span className="text-xs text-slate-400 font-sans mr-1 font-normal">تومان</span>
              </div>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-1">
                <ShieldCheck size={13} />
                دسترسی مادام‌العمر به آموزش‌ها
              </span>
            </div>
          </div>

          <div className="sm:col-span-2 p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-900/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center shrink-0">
              <Zap size={20} />
            </div>
            <div className="text-xs">
              <span className="font-bold text-teal-900 dark:text-teal-200 block">
                مزیت پرداخت با کیف پول
              </span>
              <p className="text-teal-700 dark:text-teal-400 mt-0.5 leading-relaxed">
                با شارژ کیف پول خود، از ثبت‌نام آنی در جشنواره‌ها با یک کلیک و ۵٪ تخفیف مازاد بر تمامی دوره‌های سایت بهره‌مند شوید.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Charge Wallet Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              افزایش اعتبار و شارژ حساب
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              مبلغ مورد نظر را انتخاب نموده یا وارد کنید و از طریق درگاه امن بانکی پرداخت نمایید
            </p>
          </div>
        </div>

        <form onSubmit={handleChargeSubmit} className="space-y-6">
          
          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
              انتخاب مبالغ پیشنهادی
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {presetAmounts.map(preset => (
                <button
                  type="button"
                  key={preset.value}
                  onClick={() => handleSelectPreset(preset.value)}
                  className={`py-3 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                    selectedPreset === preset.value
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-600/30'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:border-teal-500'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              یا مبلغ دلخواه را وارد کنید (تومان)
            </label>
            <div className="relative max-w-md">
              <input
                type="text"
                value={customAmount ? Number(customAmount).toLocaleString('fa-IR') : ''}
                onChange={handleCustomAmountChange}
                placeholder="مثال: ۱٬۵۰۰٬۰۰۰"
                className="w-full pl-16 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-base focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                تومان
              </span>
            </div>
            {customAmount && Number(customAmount) > 0 && (
              <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-1.5 font-medium">
                مبلغ نهایی پرداخت: {toPersianDigits(Number(customAmount).toLocaleString('fa-IR'))} تومان
              </p>
            )}
          </div>

          {/* Gateway Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
              انتخاب درگاه پرداخت الکترونیکی
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
              
              <label 
                onClick={() => setSelectedGateway('saman')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedGateway === 'saman'
                    ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedGateway === 'saman' ? 'border-teal-600 bg-teal-600' : 'border-slate-400'
                }`}>
                  {selectedGateway === 'saman' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <div className="text-xs">
                  <span className="font-bold block">بانک سامان (سپ)</span>
                  <span className="text-[10px] text-slate-400">شاپرک - مستقیم و سریع</span>
                </div>
              </label>

              <label 
                onClick={() => setSelectedGateway('zarinpal')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedGateway === 'zarinpal'
                    ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedGateway === 'zarinpal' ? 'border-teal-600 bg-teal-600' : 'border-slate-400'
                }`}>
                  {selectedGateway === 'zarinpal' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <div className="text-xs">
                  <span className="font-bold block">زرین‌پال (ZarinPal)</span>
                  <span className="text-[10px] text-slate-400">پرداخت امن با کلیه کارت‌ها</span>
                </div>
              </label>

              <label 
                onClick={() => setSelectedGateway('mellat')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedGateway === 'mellat'
                    ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedGateway === 'mellat' ? 'border-teal-600 bg-teal-600' : 'border-slate-400'
                }`}>
                  {selectedGateway === 'mellat' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <div className="text-xs">
                  <span className="font-bold block">بانک ملت (به‌پرداخت)</span>
                  <span className="text-[10px] text-slate-400">شاپرک - درگاه پشتیبان</span>
                </div>
              </label>

            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center gap-4">
            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-98 text-slate-950 font-bold text-xs shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>در حال اتصال به شاپرک...</span>
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  <span>انتقال به درگاه و افزایش اعتبار</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-500" />
              تضمین امنیت پرداخت با پروتکل رمزنگاری شاپرک
            </span>
          </div>

        </form>
      </div>

      {/* Transactions History Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              ریز گردش حساب و سوابق تراکنش‌ها
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              لیست کامل واریزها، خریدهای آموزشی و اعتبارات هدیه با امکان استعلام
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو با عنوان یا کد پیگیری..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-teal-500"
            />
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pb-4 overflow-x-auto scrollbar-none text-xs font-bold mb-4">
          {[
            { id: 'all', label: 'همه تراکنش‌ها' },
            { id: 'deposit', label: 'افزایش اعتبار (واریز)' },
            { id: 'purchase', label: 'خرید دوره‌ها' },
            { id: 'bonus', label: 'جوایز و هدایا' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as typeof activeFilter)}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === f.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Transactions Table / List */}
        {filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map(tx => {
              const isPositive = tx.type === 'deposit' || tx.type === 'bonus';
              return (
                <div 
                  key={tx.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 hover:border-teal-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isPositive 
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {isPositive ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {tx.title}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.status === 'success' 
                            ? 'bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {tx.status === 'success' ? 'موفق' : 'ناموفق'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {tx.description || tx.gateway || 'پرداخت الکترونیک'}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span className="font-mono">کد پیگیری: {tx.trackingCode}</span>
                        <button 
                          onClick={() => copyToClipboard(tx.trackingCode)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          title="کپی کد پیگیری"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                    <div className="text-left">
                      <span className={`text-sm sm:text-base font-black font-mono block ${
                        isPositive 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {isPositive ? '+' : '-'}{toPersianDigits(tx.amount.toLocaleString('fa-IR'))}
                      </span>
                      <span className="text-[10px] text-slate-400">تومان</span>
                    </div>

                    <button
                      onClick={() => setSelectedReceipt(tx)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Receipt size={13} />
                      <span>رسید</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <Wallet size={28} className="text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              هیچ تراکنشی در این دسته‌بندی یافت نشد
            </p>
          </div>
        )}

      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl animate-scaleUp">
            <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">رسید تراکنش الکترونیکی</h4>
              <span className="text-xs text-slate-400">پلتفرم آموزشی لومینا لرن</span>
            </div>

            <div className="py-5 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400">عنوان تراکنش:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedReceipt.title}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400">مبلغ تراکنش:</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                  {toPersianDigits(selectedReceipt.amount.toLocaleString('fa-IR'))} تومان
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400">شماره پیگیری:</span>
                <span className="font-bold font-mono text-teal-600 dark:text-teal-400">{selectedReceipt.trackingCode}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400">درگاه پرداخت:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{selectedReceipt.gateway || 'کیف پول لومینا'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400">تاریخ و ساعت:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">وضعیت پرداخت:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">تایید شده توسط شاپرک</span>
              </div>
            </div>

            <div className="pt-3 flex gap-3">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                بستن
              </button>
              <button
                onClick={() => {
                  copyToClipboard(selectedReceipt.trackingCode);
                  setSelectedReceipt(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 text-slate-950 text-xs font-bold hover:bg-teal-500 transition-colors flex items-center justify-center gap-1"
              >
                <Copy size={13} />
                <span>کپی کد پیگیری</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
