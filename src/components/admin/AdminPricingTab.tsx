import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { 
  DollarSign, Edit3, Check, X, Sparkles, Tag, 
  Percent, ShieldCheck, CheckCircle2, ArrowUpDown 
} from 'lucide-react';
import { Course } from '../../types/index.js';
import { api } from '../../services/api.js';
import { formatPriceToman, toPersianDigits } from '../../utils/persian.js';

export const AdminPricingTab: React.FC = () => {
  const { courses, updateCourse, addToast } = useApp();
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Quick edit form state
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [isSaleEnabled, setIsSaleEnabled] = useState(false);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setIsFree(Boolean(course.isFree || course.price === 0));
    setPrice(course.price || 0);
    setOriginalPrice(course.originalPrice || course.price || 0);
    setIsSaleEnabled(Boolean(course.isSaleEnabled));
    setSalePrice(course.salePrice || course.price || 0);
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    setIsSaving(true);
    const finalPrice = isFree ? 0 : Number(price);
    const finalOriginal = isFree ? 0 : Number(originalPrice) || finalPrice;
    const discount = (!isFree && finalOriginal > finalPrice) 
      ? Math.round(((finalOriginal - finalPrice) / finalOriginal) * 100) 
      : 0;

    try {
      // 1. Update backend dynamic pricing
      const res = await api.commerce.updateCoursePricing(editingCourse.id, {
        isFree,
        price: finalPrice,
        originalPrice: finalOriginal,
        salePrice: isSaleEnabled ? salePrice : undefined,
        discountPercentage: discount,
        currency: 'IRT',
        isSaleEnabled
      });

      // 2. Update frontend app state
      updateCourse(editingCourse.id, {
        ...editingCourse,
        isFree,
        accessType: isFree ? 'FREE' : 'PAID',
        price: finalPrice,
        originalPrice: finalOriginal,
        discountPercentage: discount,
        salePrice: isSaleEnabled ? salePrice : undefined,
        isSaleEnabled
      });

      addToast({
        title: 'قیمت‌گذاری دوره با موفقیت ذخیره شد',
        message: isFree 
          ? `دوره «${editingCourse.title}» اکنون به عنوان دوره کاملاً رایگان تنظیم شد.`
          : `قیمت دوره «${editingCourse.title}» به ${formatPriceToman(finalPrice)} به‌روزرسانی گردید.`,
        type: 'success'
      });

      setEditingCourse(null);
    } catch (err) {
      console.error('Pricing update error:', err);
      addToast({
        title: 'خطا در ثبت قیمت',
        message: 'ارتباط با سرور برقرار نشد، اما تغییرات محلی ذخیره شد.',
        type: 'info'
      });
      // Fallback local update
      updateCourse(editingCourse.id, {
        ...editingCourse,
        isFree,
        accessType: isFree ? 'FREE' : 'PAID',
        price: finalPrice,
        originalPrice: finalOriginal,
        discountPercentage: discount,
      });
      setEditingCourse(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Overview Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#08242d] border border-teal-100 dark:border-teal-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign size={18} className="text-[#0d9488]" />
            <span>مدیریت پویا و بدون کد قیمت‌گذاری دوره‌ها (Free / Paid)</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            تبدیل لحظه‌ای دوره‌ها به رایگان یا نقدی، تعیین تخفیف‌های زمان‌دار و اعمال قوانین دسترسی در لحظه.
          </p>
        </div>
      </div>

      {/* Courses Pricing Table */}
      <div className="bg-white dark:bg-[#08242d] rounded-3xl border border-teal-100 dark:border-teal-900 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-slate-50/70 dark:bg-[#0c2e39]/50 text-slate-400 text-[11px] font-bold border-b border-teal-100/60 dark:border-teal-900/60">
              <tr>
                <th className="py-3.5 px-4 text-start">عنوان دوره</th>
                <th className="py-3.5 px-4 text-start">مدرس</th>
                <th className="py-3.5 px-4 text-start">نوع دسترسی</th>
                <th className="py-3.5 px-4 text-start">قیمت فروش</th>
                <th className="py-3.5 px-4 text-start">قیمت اولیه (خط‌خورده)</th>
                <th className="py-3.5 px-4 text-start">درصد تخفیف</th>
                <th className="py-3.5 px-4 text-start">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-100/40 dark:divide-teal-900/40">
              {courses.map(course => {
                const freeAccess = Boolean(course.isFree || course.price === 0);
                return (
                  <tr key={course.id} className="hover:bg-slate-50/50 dark:hover:bg-[#0a2f3a]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white max-w-[260px] truncate">
                        {course.title}
                      </div>
                      <div className="text-[10px] text-slate-400">{course.categoryName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {course.instructorName}
                    </td>
                    <td className="py-3.5 px-4">
                      {freeAccess ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 size={11} />
                          رایگان (Free)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300">
                          <DollarSign size={11} />
                          پولی (Paid)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0d9488] dark:text-[#5eead4]">
                      {freeAccess ? 'رایگان' : formatPriceToman(course.price)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 line-through font-mono">
                      {!freeAccess && course.originalPrice > course.price ? formatPriceToman(course.originalPrice) : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {!freeAccess && course.discountPercentage && course.discountPercentage > 0 ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                          {toPersianDigits(course.discountPercentage)}٪ تخفیف
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleOpenEdit(course)}
                        className="px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 text-[#0d9488] dark:text-[#5eead4] hover:bg-teal-50 dark:hover:bg-teal-950/40 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Edit3 size={13} />
                        ویرایش تعرفه
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Pricing Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#08242d] border border-teal-100 dark:border-teal-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-teal-100/60 dark:border-teal-900/60 pb-3">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">ویرایش سیاست قیمت‌گذاری</div>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white truncate max-w-[280px]">
                  {editingCourse.title}
                </div>
              </div>
              <button
                onClick={() => setEditingCourse(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePricing} className="space-y-4 text-xs">
              {/* Free Toggle */}
              <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">دوره کاملاً رایگان (Free Access)</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">دانشجویان بدون پرداخت مستقیم ثبت‌نام می‌شوند.</div>
                </div>
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={e => setIsFree(e.target.checked)}
                  className="w-5 h-5 rounded text-[#0d9488] focus:ring-0 cursor-pointer"
                />
              </div>

              {!isFree && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Base Price */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800 dark:text-slate-200">
                          قیمت اصلی (Base Price)
                        </label>
                        <span className="text-[10px] text-slate-400">قبل از تخفیف</span>
                      </div>
                      <input
                        type="number"
                        value={originalPrice}
                        onChange={e => {
                          const val = Math.max(0, Number(e.target.value));
                          setOriginalPrice(val);
                          if (price > val) setPrice(val);
                        }}
                        step={10000}
                        min={0}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#09222b] border border-teal-100 dark:border-teal-900 font-bold text-slate-900 dark:text-white text-xs"
                      />
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-[#0d9488] dark:text-[#5eead4] font-bold">
                          {formatPriceToman(originalPrice)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setOriginalPrice(prev => Math.max(0, prev - 100000))}
                            className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-bold hover:bg-slate-300"
                          >
                            -100k
                          </button>
                          <button
                            type="button"
                            onClick={() => setOriginalPrice(prev => prev + 100000)}
                            className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-bold hover:bg-slate-300"
                          >
                            +100k
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Discounted Price */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800 dark:text-slate-200">
                          قیمت فروش (Discounted Price) <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] text-[#0d9488] font-bold">مبلغ دریافتی</span>
                      </div>
                      <input
                        type="number"
                        value={price}
                        onChange={e => setPrice(Math.max(0, Number(e.target.value)))}
                        step={10000}
                        min={0}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#09222b] border border-teal-100 dark:border-teal-900 font-bold text-slate-900 dark:text-white text-xs"
                        required
                      />
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-[#0d9488] dark:text-[#5eead4] font-bold">
                          {formatPriceToman(price)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setPrice(prev => Math.max(0, prev - 100000))}
                            className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-bold hover:bg-slate-300"
                          >
                            -100k
                          </button>
                          <button
                            type="button"
                            onClick={() => setPrice(prev => Math.min(originalPrice || Infinity, prev + 100000))}
                            className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-bold hover:bg-slate-300"
                          >
                            +100k
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Discounts & Live Badge */}
                  <div className="p-3 rounded-xl bg-teal-50/50 dark:bg-[#09222b] border border-teal-100 dark:border-teal-900/60 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-500">تخفیف سریع:</span>
                      {[
                        { label: '۰٪', percent: 0 },
                        { label: '۱۰٪', percent: 10 },
                        { label: '۲۰٪', percent: 20 },
                        { label: '۳۰٪', percent: 30 },
                        { label: '۵۰٪', percent: 50 },
                      ].map(p => (
                        <button
                          key={p.percent}
                          type="button"
                          onClick={() => {
                            const base = originalPrice || price || 1000000;
                            setOriginalPrice(base);
                            const disc = Math.round(base * (1 - p.percent / 100) / 10000) * 10000;
                            setPrice(disc);
                          }}
                          className="px-2 py-0.5 rounded bg-white dark:bg-[#0c2e39] border border-teal-200 dark:border-teal-800 text-[10px] font-bold text-[#0d9488] dark:text-[#5eead4] hover:bg-teal-50"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    <div>
                      {originalPrice > price ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white font-black text-[11px]">
                          {toPersianDigits(Math.round(((originalPrice - price) / originalPrice) * 100))}٪ تخفیف
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">بدون تخفیف</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSaving ? 'در حال ذخیره‌سازی...' : 'ذخیره تغییرات قیمت'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
