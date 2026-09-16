import React, { useState, useEffect } from 'react';
import { 
  Tag, Plus, Trash2, CheckCircle2, XCircle, 
  AlertCircle, Percent, DollarSign, Calendar, Copy, Check 
} from 'lucide-react';
import { Coupon } from '../../types/index.js';
import { api } from '../../services/api.js';
import { formatPriceToman, toPersianDigits } from '../../utils/persian.js';

export const AdminCouponsTab: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [newValue, setNewValue] = useState<number>(20);
  const [newMinAmount, setNewMinAmount] = useState<number>(0);
  const [newMaxDiscount, setNewMaxDiscount] = useState<number>(0);
  const [newLimit, setNewLimit] = useState<number>(100);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.commerce.getCoupons();
      if (res.success && res.data) {
        setCoupons(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newTitle) return;

    try {
      const res = await api.commerce.createCoupon({
        code: newCode,
        title: newTitle,
        type: newType,
        value: Number(newValue),
        minOrderAmount: newMinAmount > 0 ? Number(newMinAmount) : undefined,
        maxDiscountAmount: newMaxDiscount > 0 ? Number(newMaxDiscount) : undefined,
        usageLimit: newLimit > 0 ? Number(newLimit) : undefined,
        isActive: true
      });

      if (res.success && res.data) {
        setCoupons(prev => [res.data!, ...prev]);
        setShowCreateModal(false);
        // Reset form
        setNewCode('');
        setNewTitle('');
        setNewValue(20);
        setNewMinAmount(0);
        setNewMaxDiscount(0);
        setNewLimit(100);
      }
    } catch (err) {
      console.error('Coupon creation failed:', err);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await api.commerce.updateCoupon(coupon.id, { isActive: !coupon.isActive });
      if (res.success && res.data) {
        setCoupons(prev => prev.map(c => c.id === coupon.id ? res.data! : c));
      }
    } catch (err) {
      console.error('Toggle coupon failed:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این کد تخفیف اطمینان دارید؟')) return;
    try {
      const res = await api.commerce.deleteCoupon(id);
      if (res.success) {
        setCoupons(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('Delete coupon failed:', err);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Top Banner & Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-[#08242d] border border-teal-100 dark:border-teal-900 shadow-2xs">
        <div>
          <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Tag size={18} className="text-[#0d9488]" />
            <span>مدیریت کدهای تخفیف، جشنواره‌ها و پروموشن‌ها</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            تعریف کدهای درصدی یا مبلغی با محدودیت تعداد استفاده، حداقل مبلغ سفارش و سقف تخفیف.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus size={15} />
          <span>ایجاد کد تخفیف جدید</span>
        </button>
      </div>

      {/* Coupons Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="inline-block w-6 h-6 border-2 border-[#0d9488] border-t-transparent rounded-full animate-spin mb-2"></div>
          <div>در حال دریافت کدهای تخفیف...</div>
        </div>
      ) : coupons.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white dark:bg-[#08242d] rounded-3xl border border-teal-100 dark:border-teal-900">
          هیچ کد تخفیفی تاکنون ایجاد نشده است.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map(coupon => (
            <div 
              key={coupon.id} 
              className={`p-5 rounded-3xl border transition-all bg-white dark:bg-[#08242d] ${
                coupon.isActive 
                  ? 'border-teal-100 dark:border-teal-900 shadow-2xs' 
                  : 'border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {coupon.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono font-bold text-xs tracking-wider border border-teal-200/60 dark:border-teal-800/60">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleCopy(coupon.code)}
                      className="p-1 rounded-md text-slate-400 hover:text-teal-600 transition-colors cursor-pointer"
                      title="کپی کد"
                    >
                      {copiedCode === coupon.code ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  coupon.isActive 
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {coupon.isActive ? 'فعال' : 'غیرفعال'}
                </span>
              </div>

              {/* Details & Limits */}
              <div className="space-y-1.5 py-3 border-y border-teal-100/50 dark:border-teal-900/50 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">میزان تخفیف:</span>
                  <span className="font-extrabold text-[#0d9488] dark:text-[#5eead4]">
                    {coupon.type === 'PERCENTAGE' 
                      ? `${toPersianDigits(coupon.value)}٪ تخفیف` 
                      : formatPriceToman(coupon.value)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">دفعات استفاده:</span>
                  <span className="font-bold">
                    {toPersianDigits(coupon.usedCount)} {coupon.usageLimit ? `از ${toPersianDigits(coupon.usageLimit)}` : 'بدون سقف'}
                  </span>
                </div>
                {coupon.minOrderAmount && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">حداقل خرید:</span>
                    <span>{formatPriceToman(coupon.minOrderAmount)}</span>
                  </div>
                )}
                {coupon.maxDiscountAmount && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">سقف تخفیف:</span>
                    <span>{formatPriceToman(coupon.maxDiscountAmount)}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3">
                <button
                  onClick={() => handleToggleActive(coupon)}
                  className={`text-[11px] font-bold cursor-pointer transition-colors ${
                    coupon.isActive 
                      ? 'text-amber-600 hover:text-amber-700' 
                      : 'text-emerald-600 hover:text-emerald-700'
                  }`}
                >
                  {coupon.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی مجدد'}
                </button>

                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                  title="حذف کد"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#08242d] border border-teal-100 dark:border-teal-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-teal-100/60 dark:border-teal-900/60 pb-3">
              <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Tag size={16} className="text-[#0d9488]" />
                <span>تعریف کد تخفیف جدید</span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  کد کوپن (انگلیسی) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCode}
                  onChange={e => setNewCode(e.target.value.toUpperCase())}
                  placeholder="مثال: NOROOZ50"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 font-mono font-bold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  عنوان / مناسبت <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="مثال: جشنواره تخفیف ویژه عید نوروز"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 text-slate-900 dark:text-white font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200">نوع محاسبه</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="PERCENTAGE">درصدی (٪)</option>
                    <option value="FIXED">مبلغ ثابت (تومان)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200">
                    مقدار تخفیف {newType === 'PERCENTAGE' ? '(درصد)' : '(تومان)'}
                  </label>
                  <input
                    type="number"
                    value={newValue}
                    onChange={e => setNewValue(Number(e.target.value))}
                    min={1}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 text-slate-900 dark:text-white font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200">حداقل مبلغ سبد (تومان)</label>
                  <input
                    type="number"
                    value={newMinAmount}
                    onChange={e => setNewMinAmount(Number(e.target.value))}
                    step={50000}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200">سقف مجاز تخفیف (تومان)</label>
                  <input
                    type="number"
                    value={newMaxDiscount}
                    onChange={e => setNewMaxDiscount(Number(e.target.value))}
                    step={50000}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">حداکثر تعداد مجاز استفاده</label>
                <input
                  type="number"
                  value={newLimit}
                  onChange={e => setNewLimit(Number(e.target.value))}
                  min={1}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold cursor-pointer transition-all"
                >
                  ثبت و فعال‌سازی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
