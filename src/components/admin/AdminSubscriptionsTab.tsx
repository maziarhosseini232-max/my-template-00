import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { 
  Crown, Sparkles, Check, Edit3, Save, X, RefreshCw, 
  Calendar, ShieldCheck, UserCheck, AlertCircle, PlusCircle, CheckCircle2 
} from 'lucide-react';
import { api } from '../../services/api.js';
import { SubscriptionPlan } from '../../types/index.js';
import { formatPriceToman, toPersianDigits } from '../../utils/persian.js';

export const AdminSubscriptionsTab: React.FC = () => {
  const { addToast, language } = useApp();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDiscountedPrice, setEditDiscountedPrice] = useState<number>(0);
  const [editIsPopular, setEditIsPopular] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editFeatures, setEditFeatures] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Grant Subscription to User state
  const [targetUserId, setTargetUserId] = useState('');
  const [grantDuration, setGrantDuration] = useState<1 | 3 | 6 | 9>(3);
  const [isGranting, setIsGranting] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.commerce.getSubscriptionPlans(true);
      if (res && res.data) {
        setPlans(res.data);
      }
    } catch (err: any) {
      addToast({
        title: 'خطا در بارگذاری پلن‌ها',
        message: err.message || 'مشکلی در برقراری ارتباط با سرور رخ داد.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleStartEdit = (plan: SubscriptionPlan) => {
    setEditingPlanId(plan.id);
    setEditTitle(plan.title);
    setEditPrice(plan.price);
    setEditDiscountedPrice(plan.discountedPrice || 0);
    setEditIsPopular(Boolean(plan.isPopular));
    setEditIsActive(plan.isActive);
    setEditFeatures((plan.features || []).join('\n'));
  };

  const handleCancelEdit = () => {
    setEditingPlanId(null);
  };

  const handleSavePlan = async (planId: string) => {
    setIsSaving(true);
    try {
      const featuresArray = editFeatures
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const res: any = await api.commerce.updateSubscriptionPlan(planId, {
        title: editTitle,
        price: Number(editPrice),
        discountedPrice: Number(editDiscountedPrice) > 0 ? Number(editDiscountedPrice) : 0,
        isPopular: editIsPopular,
        isActive: editIsActive,
        features: featuresArray
      });

      const updatedPlan = res?.data || res;
      if (updatedPlan) {
        setPlans(prev => prev.map(p => p.id === planId ? { ...p, ...updatedPlan } : p));
        setEditingPlanId(null);
        addToast({
          title: 'پلن اشتراک به‌روزرسانی شد',
          message: `تنظیمات پلن با موفقیت ذخیره شد.`,
          type: 'success'
        });
      }
    } catch (err: any) {
      addToast({
        title: 'خطا در ذخیره پلن',
        message: err.message || 'ذخیره‌سازی اطلاعات با مشکل مواجه شد.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGrantSubscription = async () => {
    if (!targetUserId.trim()) {
      addToast({
        title: 'شناسه کاربر الزامی است',
        message: 'لطفاً شناسه کاربر (User ID) را وارد فرمایید.',
        type: 'warning'
      });
      return;
    }

    setIsGranting(true);
    try {
      const res = await api.commerce.grantUserSubscription(targetUserId.trim(), grantDuration);
      addToast({
        title: 'اشتراک با موفقیت اعطا شد',
        message: `اشتراک ویژه ${grantDuration} ماهه برای کاربر ${targetUserId} فعال گردید.`,
        type: 'success'
      });
      setTargetUserId('');
    } catch (err: any) {
      addToast({
        title: 'خطا در اعطای اشتراک',
        message: err.message || 'مشکلی در اعطای اشتراک رخ داد.',
        type: 'error'
      });
    } finally {
      setIsGranting(false);
    }
  };

  return (
    <div className="space-y-8" id="admin-subscriptions-tab">
      {/* Header Info Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-900 via-[#0b3b49] to-cyan-900 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-300">
              <Crown size={22} />
            </span>
            <h2 className="text-lg font-black tracking-tight">
              مدیریت اشتراک‌های ویژه (VIP Membership)
            </h2>
          </div>
          <p className="text-xs text-teal-100/80 leading-relaxed max-w-2xl">
            در این بخش قیمت‌گذاری و ویژگی‌های پلن‌های اشتراک ۱، ۳، ۶ و ۹ ماهه پلتفرم را مدیریت کنید.
            دانشجویان با خرید هر یک از این پلن‌ها، در بازه زمانی تعیین‌شده به تمامی دوره‌های VIP دسترسی نامحدود خواهند داشت.
          </p>
        </div>

        <button
          onClick={fetchPlans}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>بروزرسانی پلن‌ها</span>
        </button>
      </div>

      {/* Subscription Plans Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar size={16} className="text-[#0d9488]" />
            <span>پلن‌های اشتراک دوره (۱، ۳، ۶ و ۹ ماهه)</span>
          </h3>
          <span className="text-xs text-slate-400">
            {toPersianDigits(plans.length)} پلن تعریف‌شده
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#0d9488]" />
            در حال دریافت پلن‌های اشتراک از سرور...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const isEditing = editingPlanId === plan.id;
              const hasDiscount = (plan.discountedPrice || 0) > 0 && (plan.discountedPrice || 0) < plan.price;

              return (
                <div
                  key={plan.id}
                  className={`relative p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    plan.isPopular
                      ? 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-500 shadow-sm ring-1 ring-teal-500/30'
                      : 'bg-white dark:bg-[#07242d] border-teal-100 dark:border-teal-900/60'
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-black shadow-xs flex items-center gap-1">
                      <Sparkles size={10} />
                      <span>پلن پیشنهادی و پرفروش</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Card Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-black text-teal-600 dark:text-teal-400">
                          اشتراک {toPersianDigits(plan.durationInMonths)} ماهه
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                          {plan.title}
                        </h4>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        plan.isActive 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}>
                        {plan.isActive ? 'فعال' : 'غیرفعال'}
                      </span>
                    </div>

                    {/* Price display */}
                    {!isEditing ? (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#092b36] border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="text-[11px] text-slate-400">هزینه اشتراک:</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-slate-900 dark:text-white">
                            {formatPriceToman(hasDiscount ? plan.discountedPrice! : plan.price)}
                          </span>
                        </div>
                        {hasDiscount && (
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="line-through text-slate-400 font-semibold">
                              {formatPriceToman(plan.price)}
                            </span>
                            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded">
                              {toPersianDigits(Math.round(((plan.price - plan.discountedPrice!) / plan.price) * 100))}٪ تخفیف
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Editing Mode Form */
                      <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#092b36] border border-teal-300 dark:border-teal-700">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                            عنوان پلن
                          </label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#06242e] text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                            قیمت اصلی (تومان)
                          </label>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={e => setEditPrice(Number(e.target.value))}
                            step={10000}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#06242e] text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                            قیمت با تخفیف (تومان - ۰ یعنی بدون تخفیف)
                          </label>
                          <input
                            type="number"
                            value={editDiscountedPrice}
                            onChange={e => setEditDiscountedPrice(Number(e.target.value))}
                            step={10000}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#06242e] text-xs font-bold"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <label className="text-[11px] font-bold flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editIsPopular}
                              onChange={e => setEditIsPopular(e.target.checked)}
                              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span>پلن محبوب / ویژه</span>
                          </label>
                          <label className="text-[11px] font-bold flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editIsActive}
                              onChange={e => setEditIsActive(e.target.checked)}
                              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span>وضعیت فعال</span>
                          </label>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                            ویژگی‌ها (هر خط یک مورد)
                          </label>
                          <textarea
                            rows={3}
                            value={editFeatures}
                            onChange={e => setEditFeatures(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#06242e] text-[11px] leading-relaxed"
                          />
                        </div>
                      </div>
                    )}

                    {/* Features list in read mode */}
                    {!isEditing && plan.features && plan.features.length > 0 && (
                      <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check size={13} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                    {!isEditing ? (
                      <button
                        onClick={() => handleStartEdit(plan)}
                        className="w-full py-2 rounded-xl bg-slate-100 dark:bg-[#092b36] hover:bg-teal-50 dark:hover:bg-teal-900/40 text-slate-800 dark:text-slate-200 hover:text-teal-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit3 size={13} />
                        <span>ویرایش قیمت و مشخصات</span>
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleSavePlan(plan.id)}
                          disabled={isSaving}
                          className="py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Save size={13} />
                          <span>{isSaving ? 'در حال ثبت...' : 'ذخیره'}</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                          className="py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <X size={13} />
                          <span>انصراف</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual User VIP Subscription Grant Box */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#07242d] border border-teal-100 dark:border-teal-900/60 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <UserCheck size={18} className="text-[#0d9488]" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            اعطای دستی اشتراک VIP به کاربر (پشتیبانی / هدیه)
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          مدیر سیستم می‌تواند برای هر کاربر بر اساس شناسه کاربری (User ID)، اشتراک ویژه ۱، ۳، ۶ یا ۹ ماهه را به صورت آنی فعال نماید.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <input
            type="text"
            placeholder="شناسه کاربر (مثال: usr-student-1 یا ID کاربر)"
            value={targetUserId}
            onChange={e => setTargetUserId(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#06242e] text-xs font-bold"
          />

          <select
            value={grantDuration}
            onChange={e => setGrantDuration(Number(e.target.value) as 1 | 3 | 6 | 9)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#06242e] text-xs font-bold"
          >
            <option value={1}>اشتراک ۱ ماهه VIP</option>
            <option value={3}>اشتراک ۳ ماهه VIP</option>
            <option value={6}>اشتراک ۶ ماهه VIP</option>
            <option value={9}>اشتراک ۹ ماهه VIP</option>
          </select>

          <button
            onClick={handleGrantSubscription}
            disabled={isGranting || !targetUserId.trim()}
            className="px-6 py-2.5 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck size={14} />
            <span>{isGranting ? 'در حال فعال‌سازی...' : 'فعال‌سازی اشتراک VIP کاربر'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
