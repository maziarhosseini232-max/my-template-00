import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Layers, Plus, Trash2, Edit3, Check, FolderPlus, Tag, BookOpen } from 'lucide-react';
import { toPersianDigits } from '../../../utils/persian';
import { Category } from '../../../types';

export const CategoriesManagerTab: React.FC = () => {
  const { categories, courses, addToast } = useApp();
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatNameFa, setNewCatNameFa] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatSubcats, setNewCatSubcats] = useState('دیزاین سیستم, فیگما, ری‌اکت');

  const handleAddCategory = () => {
    if (!newCatNameFa.trim()) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      slug: `cat-${Date.now()}`,
      name: newCatNameEn.trim() || newCatNameFa.trim(),
      nameFa: newCatNameFa.trim(),
      description: newCatDesc.trim() || 'دسته‌بندی تخصصی دوره‌های پلتفرم',
      icon: 'Layers',
      color: 'teal',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000',
      courseCount: 0,
      subCategories: newCatSubcats.split(',').map(s => s.trim()).filter(Boolean)
    };
    setLocalCategories(prev => [...prev, newCat]);
    setShowAddModal(false);
    setNewCatNameFa('');
    setNewCatNameEn('');
    setNewCatDesc('');
    addToast({
      title: 'دسته‌بندی جدید افزوده شد',
      message: `دسته‌بندی «${newCat.nameFa}» با موفقیت اضافه شد.`,
      type: 'success'
    });
  };

  const handleDeleteCategory = (catId: string) => {
    setLocalCategories(prev => prev.filter(c => c.id !== catId));
    addToast({
      title: 'دسته‌بندی حذف شد',
      message: 'دسته‌بندی با موفقیت از سیستم حذف گردید.',
      type: 'info'
    });
  };

  return (
    <div className="space-y-6 text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#06242e] dark:text-white">
            مدیریت دسته‌بندی‌ها و شاخه‌های آموزشی
          </h2>
          <p className="text-xs text-[#527683] dark:text-[#8ab5be] mt-0.5">
            ساختاربندی درخت دسته‌ها و زیرمجموعه‌های تخصصی دوره‌ها
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] text-xs font-extrabold shadow-sm transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>+ ایجاد دسته‌بندی جدید</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {localCategories.map(cat => {
          const matchedCourseCount = courses.filter(c => c.categoryId === cat.id).length;

          return (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-[#def4ee] dark:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4] flex items-center justify-center font-bold">
                    <Layers size={20} />
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#f0fbf8] dark:bg-[#092b36] text-[#0d9488] dark:text-[#5eead4] font-black text-[11px] border border-[#ccede5] dark:border-teal-900">
                    {toPersianDigits(matchedCourseCount || cat.courseCount)} دوره فعال
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-[#06242e] dark:text-white">
                    {cat.nameFa}
                  </h3>
                  <div className="text-[11px] text-[#527683] dark:text-[#8ab5be] font-mono mt-0.5">
                    {cat.name}
                  </div>
                </div>

                <p className="text-[11px] text-[#527683] dark:text-[#8ab5be] line-clamp-2">
                  {cat.description}
                </p>

                {/* Subcategories tags */}
                {cat.subCategories && cat.subCategories.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[10px] font-bold text-[#527683] dark:text-[#8ab5be] mb-1.5">
                      زیرمجموعه‌ها:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cat.subCategories.map((sub, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[#f0fbf8] dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-[#06242e] dark:text-slate-300 text-[10px]"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#ccede5]/60 dark:border-teal-900/40 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">ID: {cat.id}</span>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 cursor-pointer transition-colors"
                  title="حذف دسته‌بندی"
                >
                  <Trash2 size={15} />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#06242e] rounded-2xl max-w-md w-full p-6 border border-[#ccede5] dark:border-teal-900 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-sm text-[#06242e] dark:text-white">
              ایجاد دسته‌بندی آموزشی جدید
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-[#06242e] dark:text-white">نام فارسی دسته‌بندی *</label>
                <input
                  type="text"
                  value={newCatNameFa}
                  onChange={e => setNewCatNameFa(e.target.value)}
                  placeholder="مثال: هوش مصنوعی و داده"
                  className="w-full px-3 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#06242e] dark:text-white">نام انگلیسی (Slug / Identifier)</label>
                <input
                  type="text"
                  value={newCatNameEn}
                  onChange={e => setNewCatNameEn(e.target.value)}
                  placeholder="AI & Data Science"
                  className="w-full px-3 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#06242e] dark:text-white">توضیح کوتاه</label>
                <textarea
                  value={newCatDesc}
                  onChange={e => setNewCatDesc(e.target.value)}
                  rows={2}
                  placeholder="توضیح دسته‌بندی..."
                  className="w-full p-3 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#06242e] dark:text-white">زیرمجموعه‌ها (با ویرگول جدا کنید)</label>
                <input
                  type="text"
                  value={newCatSubcats}
                  onChange={e => setNewCatSubcats(e.target.value)}
                  placeholder="یادگیری ماشین, بینایی ماشین, NLP"
                  className="w-full px-3 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#ccede5]/60 dark:border-teal-900/40">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#09222b] text-[#06242e] dark:text-white font-bold"
              >
                انصراف
              </button>
              <button
                onClick={handleAddCategory}
                className="px-5 py-2 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] font-extrabold"
              >
                ثبت دسته‌بندی
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
