import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2, 
  Download, 
  UploadCloud, 
  FileCode, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronDown, 
  Layers, 
  Grid, 
  List, 
  MoreVertical,
  GraduationCap,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { toPersianDigits, formatTomanPrice } from '../../../utils/persian';
import { Course, CourseStatus } from '../../../types';

interface CourseListManagerProps {
  onNewCourse: () => void;
  onEditCourse: (course: Course) => void;
  onPreviewCourse: (course: Course) => void;
  onOpenAnalytics: (course: Course) => void;
  onOpenImport: () => void;
}

export const CourseListManager: React.FC<CourseListManagerProps> = ({
  onNewCourse,
  onEditCourse,
  onPreviewCourse,
  onOpenAnalytics,
  onOpenImport
}) => {
  const { 
    courses, 
    categories, 
    instructors, 
    updateCourseStatus, 
    deleteCourse, 
    duplicateCourse, 
    exportCoursePackage,
    addToast 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('all');
  const [selectedPricing, setSelectedPricing] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtering
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Search
      const matchesSearch = 
        !searchTerm.trim() ||
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.categoryName && course.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status
      const matchesStatus = selectedStatus === 'all' || course.status === selectedStatus;

      // Category
      const matchesCategory = selectedCategory === 'all' || course.categoryId === selectedCategory;

      // Instructor
      const matchesInstructor = selectedInstructor === 'all' || course.instructorId === selectedInstructor;

      // Pricing
      const matchesPricing = 
        selectedPricing === 'all' ||
        (selectedPricing === 'free' && course.price === 0) ||
        (selectedPricing === 'paid' && course.price > 0);

      return matchesSearch && matchesStatus && matchesCategory && matchesInstructor && matchesPricing;
    });
  }, [courses, searchTerm, selectedStatus, selectedCategory, selectedInstructor, selectedPricing]);

  // Bulk selection handlers
  const handleToggleSelectAll = () => {
    if (selectedCourseIds.length === filteredCourses.length) {
      setSelectedCourseIds([]);
    } else {
      setSelectedCourseIds(filteredCourses.map(c => c.id));
    }
  };

  const handleToggleSelectCourse = (id: string) => {
    setSelectedCourseIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = (status: CourseStatus) => {
    selectedCourseIds.forEach(id => {
      updateCourseStatus(id, status);
    });
    setSelectedCourseIds([]);
  };

  const handleExportJson = (course: Course) => {
    const jsonStr = exportCoursePackage(course.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `course-${course.slug || course.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      title: 'خروجی آماده شد',
      message: `بسته دوره‌ «${course.title}» در قالب فایل JSON دانلود شد.`,
      type: 'success'
    });
  };

  const statusConfig: Record<CourseStatus, { label: string; bg: string; text: string; dot: string }> = {
    published: { label: 'منتشرشده', bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    draft: { label: 'پیش‌نویس', bg: 'bg-slate-100 dark:bg-[#0e3b47]', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-400' },
    pending: { label: 'در حال بررسی', bg: 'bg-amber-50 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    disabled: { label: 'غیرفعال', bg: 'bg-rose-50 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
    archived: { label: 'آرشیوشده', bg: 'bg-gray-100 dark:bg-gray-900', text: 'text-gray-700 dark:text-gray-400', dot: 'bg-gray-500' }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#06242e] dark:text-white">
            مدیریت دوره‌های آموزشی
          </h2>
          <p className="text-xs text-[#527683] dark:text-[#8ab5be] mt-0.5">
            فهرست کامل، فیلترهای پیشرفته، ویرایشگر سرفصل‌ها و انتشار دوره‌ها
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900 text-[#06242e] dark:text-slate-200 text-xs font-bold hover:bg-[#f0fbf8] dark:hover:bg-[#092b36] transition-colors cursor-pointer"
          >
            <FileCode size={16} />
            <span>درون‌ریزی JSON</span>
          </button>
          
          <button
            onClick={onNewCourse}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0b3b49] hover:bg-[#06242e] dark:bg-[#5eead4] dark:hover:bg-[#2dd4bf] text-white dark:text-[#06242e] text-xs font-extrabold shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>+ ایجاد دوره جدید</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-[#527683] dark:text-[#8ab5be]" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="جستجو در عنوان دوره، مدرس یا دسته‌بندی..."
              className="w-full ps-9 pe-4 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white placeholder-[#527683] focus:outline-hidden focus:border-[#0d9488]"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white focus:outline-hidden focus:border-[#0d9488]"
            >
              <option value="all">همه وضعیت‌ها ({toPersianDigits(courses.length)})</option>
              <option value="published">منتشرشده ({toPersianDigits(courses.filter(c => c.status === 'published').length)})</option>
              <option value="draft">پیش‌نویس ({toPersianDigits(courses.filter(c => c.status === 'draft').length)})</option>
              <option value="pending">در حال بررسی ({toPersianDigits(courses.filter(c => c.status === 'pending').length)})</option>
              <option value="disabled">غیرفعال ({toPersianDigits(courses.filter(c => c.status === 'disabled').length)})</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white focus:outline-hidden focus:border-[#0d9488]"
            >
              <option value="all">همه دسته‌بندی‌ها</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nameFa}</option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#0b3b49] text-white dark:bg-[#5eead4] dark:text-[#06242e] border-transparent'
                  : 'bg-slate-100 dark:bg-[#092b36] text-[#527683] dark:text-[#8ab5be] border-transparent'
              }`}
              title="نمای جدولی"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#0b3b49] text-white dark:bg-[#5eead4] dark:text-[#06242e] border-transparent'
                  : 'bg-slate-100 dark:bg-[#092b36] text-[#527683] dark:text-[#8ab5be] border-transparent'
              }`}
              title="نمای کارتی"
            >
              <Grid size={16} />
            </button>
          </div>

        </div>

        {/* Batch Action Bar if any items selected */}
        {selectedCourseIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-[#def4ee] dark:bg-[#0e3b47] border border-[#5eead4]/50 text-xs text-[#0b3b49] dark:text-[#5eead4]">
            <div className="font-bold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{toPersianDigits(selectedCourseIds.length)} دوره انتخاب شده است:</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatusChange('published')}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer"
              >
                انتشار همه
              </button>
              <button
                onClick={() => handleBulkStatusChange('draft')}
                className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer"
              >
                تبدیل به پیش‌نویس
              </button>
              <button
                onClick={() => setSelectedCourseIds([])}
                className="px-2.5 py-1 rounded-lg bg-white/60 dark:bg-black/40 text-[#06242e] dark:text-white font-bold transition-colors cursor-pointer"
              >
                لغو انتخاب
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Courses List Content */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#06242e] rounded-2xl border border-[#ccede5] dark:border-teal-900/60 p-6 space-y-3">
          <AlertCircle size={36} className="mx-auto text-[#0d9488] dark:text-[#5eead4]" />
          <h3 className="font-extrabold text-sm text-[#06242e] dark:text-white">
            هیچ دوره‌ای با این مشخصات یافت نشد
          </h3>
          <p className="text-xs text-[#527683] dark:text-[#8ab5be] max-w-sm mx-auto">
            لطفاً عبارت جستجو یا فیلتر وضعیت و دسته‌بندی را تغییر دهید یا دوره جدیدی ایجاد کنید.
          </p>
          <button
            onClick={onNewCourse}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>ایجاد اولین دوره</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        
        /* Table View */
        <div className="bg-white dark:bg-[#06242e] rounded-2xl border border-[#ccede5] dark:border-teal-900/60 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-[#f0fbf8] dark:bg-[#092b36] border-b border-[#ccede5] dark:border-teal-900/60 text-[#527683] dark:text-[#8ab5be] font-bold">
                <tr>
                  <th className="p-3.5 text-center w-10">
                    <input
                      type="checkbox"
                      checked={selectedCourseIds.length === filteredCourses.length && filteredCourses.length > 0}
                      onChange={handleToggleSelectAll}
                      className="rounded text-[#0d9488] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5 text-start">دوره و اطلاعات</th>
                  <th className="p-3.5 text-start">مدرس</th>
                  <th className="p-3.5 text-center">سرفصل و جلسات</th>
                  <th className="p-3.5 text-center">قیمت (تومان)</th>
                  <th className="p-3.5 text-center">وضعیت انتشار</th>
                  <th className="p-3.5 text-center">دانشجویان</th>
                  <th className="p-3.5 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ccede5]/60 dark:divide-teal-900/40">
                {filteredCourses.map(course => {
                  const status = statusConfig[course.status] || statusConfig.draft;
                  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
                  const isSelected = selectedCourseIds.includes(course.id);

                  return (
                    <tr 
                      key={course.id} 
                      className={`hover:bg-[#f0fbf8]/50 dark:hover:bg-[#092b36]/50 transition-colors ${
                        isSelected ? 'bg-[#def4ee]/30 dark:bg-[#0e3b47]/30' : ''
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectCourse(course.id)}
                          className="rounded text-[#0d9488] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Course info */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-14 h-11 rounded-lg object-cover border border-slate-200 dark:border-teal-900 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-xs text-[#06242e] dark:text-white truncate max-w-xs">
                              {course.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-[#527683] dark:text-[#8ab5be] mt-0.5">
                              <span>{course.categoryName}</span>
                              <span>•</span>
                              <span>{course.level === 'all' ? 'همه سطوح' : course.level === 'beginner' ? 'مقدماتی' : course.level === 'intermediate' ? 'متوسط' : 'پیشرفته'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Instructor */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <img
                            src={course.instructorAvatar}
                            alt={course.instructorName}
                            className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-teal-900 shrink-0"
                          />
                          <span className="font-semibold text-xs text-[#06242e] dark:text-slate-200">
                            {course.instructorName}
                          </span>
                        </div>
                      </td>

                      {/* Curriculum Stats */}
                      <td className="p-3.5 text-center">
                        <div className="font-extrabold text-[#06242e] dark:text-white">
                          {toPersianDigits(course.modules.length)} فصل
                        </div>
                        <div className="text-[11px] text-[#527683] dark:text-[#8ab5be]">
                          {toPersianDigits(totalLessons)} جلسه آموزشی
                        </div>
                      </td>

                      {/* Price */}
                      <td className="p-3.5 text-center">
                        {course.price === 0 ? (
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            رایگان
                          </span>
                        ) : (
                          <div>
                            <div className="font-extrabold text-[#06242e] dark:text-white">
                              {formatTomanPrice(course.price)}
                            </div>
                            {course.originalPrice > course.price && (
                              <div className="text-[10px] line-through text-[#527683] dark:text-[#8ab5be]">
                                {formatTomanPrice(course.originalPrice)}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status quick toggle */}
                      <td className="p-3.5 text-center">
                        <select
                          value={course.status}
                          onChange={e => updateCourseStatus(course.id, e.target.value as CourseStatus)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border-0 cursor-pointer ${status.bg} ${status.text}`}
                        >
                          <option value="published">منتشرشده</option>
                          <option value="draft">پیش‌نویس</option>
                          <option value="pending">در حال بررسی</option>
                          <option value="disabled">غیرفعال</option>
                          <option value="archived">آرشیو</option>
                        </select>
                      </td>

                      {/* Students */}
                      <td className="p-3.5 text-center">
                        <div className="font-extrabold text-[#06242e] dark:text-white">
                          {toPersianDigits(course.studentCount || 0)}
                        </div>
                        <div className="text-[10px] text-amber-500 font-bold flex items-center justify-center gap-1">
                          <span>★</span>
                          <span>{toPersianDigits(course.rating || 5.0)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onPreviewCourse(course)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#0e3b47] text-[#527683] dark:text-[#8ab5be] hover:text-[#06242e] dark:hover:text-white transition-colors cursor-pointer"
                            title="پیش‌نمایش دوره"
                          >
                            <Eye size={15} />
                          </button>
                          
                          <button
                            onClick={() => onEditCourse(course)}
                            className="p-1.5 rounded-lg hover:bg-[#def4ee] dark:hover:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4] transition-colors cursor-pointer"
                            title="ویرایش کامل دوره"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            onClick={() => duplicateCourse(course.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#0e3b47] text-[#527683] dark:text-[#8ab5be] transition-colors cursor-pointer"
                            title="تکثیر / کپی دوره"
                          >
                            <Copy size={15} />
                          </button>

                          <button
                            onClick={() => handleExportJson(course)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#0e3b47] text-[#527683] dark:text-[#8ab5be] transition-colors cursor-pointer"
                            title="خروجی JSON دوره"
                          >
                            <Download size={15} />
                          </button>

                          <button
                            onClick={() => onOpenAnalytics(course)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#0e3b47] text-[#527683] dark:text-[#8ab5be] transition-colors cursor-pointer"
                            title="آمار و آنالیتیکس"
                          >
                            <BarChart3 size={15} />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(course.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 transition-colors cursor-pointer"
                            title="حذف دوره"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      ) : (

        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map(course => {
            const status = statusConfig[course.status] || statusConfig.draft;
            const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);

            return (
              <div
                key={course.id}
                className="rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail & Badges */}
                  <div className="relative aspect-video">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 start-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${status.bg} ${status.text} backdrop-blur-xs`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="absolute bottom-2 end-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                      {toPersianDigits(course.modules.length)} فصل • {toPersianDigits(totalLessons)} جلسه
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-[#527683] dark:text-[#8ab5be]">
                      <span>{course.categoryName}</span>
                      <span>{course.level === 'all' ? 'همه سطوح' : course.level}</span>
                    </div>

                    <h4 className="font-extrabold text-sm text-[#06242e] dark:text-white line-clamp-2 leading-snug">
                      {course.title}
                    </h4>

                    {/* Instructor */}
                    <div className="flex items-center gap-2 pt-1 border-t border-[#ccede5]/60 dark:border-teal-900/40">
                      <img
                        src={course.instructorAvatar}
                        alt={course.instructorName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs font-semibold text-[#06242e] dark:text-slate-200 truncate">
                        {course.instructorName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer and Actions */}
                <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-[#ccede5]/60 dark:border-teal-900/40 mt-2">
                  <div className="font-black text-xs text-[#06242e] dark:text-white">
                    {course.price === 0 ? 'رایگان' : formatTomanPrice(course.price)}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onPreviewCourse(course)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#0e3b47] hover:bg-slate-200 dark:hover:bg-[#124d5d] text-[#06242e] dark:text-white text-xs font-bold transition-colors cursor-pointer"
                      title="پیش‌نمایش"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => onEditCourse(course)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Edit3 size={13} />
                      <span>ویرایش</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#06242e] rounded-2xl max-w-sm w-full p-6 border border-[#ccede5] dark:border-teal-900 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-[#06242e] dark:text-white">
                آیا از حذف این دوره اطمینان دارید؟
              </h4>
              <p className="text-xs text-[#527683] dark:text-[#8ab5be] mt-1">
                دوره و تمامی سرفصل‌ها و جلسات مرتبط به صورت دائمی حذف خواهند شد.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#09222b] text-[#06242e] dark:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={() => {
                  deleteCourse(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-colors cursor-pointer"
              >
                تایید و حذف دائمی
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
