import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CourseCard } from '../common/CourseCard';
import { 
  Filter, Grid, List, Search, X, SlidersHorizontal, 
  RotateCcw, Award, Star, Check 
} from 'lucide-react';
import { CatalogFilters } from '../../types';
import { toPersianDigits } from '../../utils/persian';

export const CatalogView: React.FC = () => {
  const { courses, categories, currentRoute, navigate, t, language, isRTL } = useApp();

  // Parse initial query params if coming from category or search or instructor
  const [filters, setFilters] = useState<CatalogFilters>({
    searchQuery: '',
    categoryId: 'all',
    level: 'all',
    priceType: 'all',
    minRating: 0,
    duration: 'all',
    language: 'all',
    hasCertificate: false,
    sortBy: 'popular',
    viewMode: 'grid'
  });

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync route query parameters on mount or change
  useEffect(() => {
    if (currentRoute.query) {
      const params = new URLSearchParams(currentRoute.query);
      const catParam = params.get('category');
      const sortParam = params.get('sort');
      const searchParam = params.get('search');

      setFilters(prev => ({
        ...prev,
        categoryId: catParam || prev.categoryId,
        sortBy: (sortParam as CatalogFilters['sortBy']) || prev.sortBy,
        searchQuery: searchParam ? decodeURIComponent(searchParam) : prev.searchQuery
      }));
    }
  }, [currentRoute.query]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      categoryId: 'all',
      level: 'all',
      priceType: 'all',
      minRating: 0,
      duration: 'all',
      language: 'all',
      hasCertificate: false,
      sortBy: 'popular',
      viewMode: filters.viewMode
    });
  };

  // Filter & Sort computation
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Published check
      if (course.status && course.status !== 'published') return false;

      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(q);
        const matchesSubtitle = course.subtitle.toLowerCase().includes(q);
        const matchesInstructor = course.instructorName.toLowerCase().includes(q);
        const matchesTags = course.tags.some(tag => tag.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSubtitle && !matchesInstructor && !matchesTags) return false;
      }

      // Category
      if (filters.categoryId !== 'all' && course.categoryId !== filters.categoryId) {
        return false;
      }

      // Level
      if (filters.level !== 'all' && course.level !== filters.level) {
        return false;
      }

      // Price type
      if (filters.priceType === 'free') {
        const hasFree = course.modules.some(m => m.lessons.some(l => l.isPreviewFree));
        if (!hasFree) return false;
      } else if (filters.priceType === 'paid' && course.price === 0) {
        return false;
      } else if (filters.priceType === 'under50' && course.price >= 500000) {
        return false;
      }

      // Rating
      if (filters.minRating > 0 && course.rating < filters.minRating) {
        return false;
      }

      // Duration
      if (filters.duration === '0-2' && course.durationHours > 2) return false;
      if (filters.duration === '3-6' && (course.durationHours < 3 || course.durationHours > 6)) return false;
      if (filters.duration === '7+' && course.durationHours < 7) return false;

      // Certificate
      if (filters.hasCertificate && !course.hasCertificate) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'popular') return b.studentCount - a.studentCount;
      if (filters.sortBy === 'newest') return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [courses, filters]);

  const activeFilterCount = [
    filters.categoryId !== 'all',
    filters.level !== 'all',
    filters.priceType !== 'all',
    filters.minRating > 0,
    filters.duration !== 'all',
    filters.hasCertificate
  ].filter(Boolean).length;

  const currentCategoryObj = categories.find(c => c.id === filters.categoryId);
  const currentCategoryName = currentCategoryObj 
    ? (language === 'fa' ? currentCategoryObj.nameFa : currentCategoryObj.name)
    : t('allCourses');

  const levelLabels: Record<string, { en: string; fa: string }> = {
    all: { en: 'All Levels', fa: 'تمام سطوح' },
    Beginner: { en: 'Beginner', fa: 'مقدماتی' },
    Intermediate: { en: 'Intermediate', fa: 'متوسط' },
    Advanced: { en: 'Advanced', fa: 'پیشرفته' }
  };

  return (
    <div className="py-8 bg-slate-50/50 dark:bg-slate-950/60 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
            <button onClick={() => navigate('home')} className="hover:underline">{t('home')}</button>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold">{t('allCourses')}</span>
            {filters.categoryId !== 'all' && (
              <>
                <span>/</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{currentCategoryName}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {currentCategoryName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'fa'
              ? `دسترسی به بیش از ${toPersianDigits(courses.length)} مسترکلاس جامع با تدریس برترین اساتید و نخبگان صنعت.`
              : `Explore ${courses.length}+ masterclasses taught by world-class leaders and visionary artists.`}
          </p>
        </div>

        {/* Top Controls Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute inset-inline-start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder={language === 'fa' ? 'جستجو بر اساس عنوان، مهارت یا مدرس...' : 'Search by title, topic, or instructor...'}
              className="w-full ps-10 pe-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <Filter size={15} />
              <span>{t('filterBy')}</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 bg-indigo-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {toPersianDigits(activeFilterCount)}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 hidden sm:inline-block">{t('sortBy')}:</span>
              <select
                value={filters.sortBy}
                onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as CatalogFilters['sortBy'] }))}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="popular">{t('sortPopular')}</option>
                <option value="newest">{t('sortNewest')}</option>
                <option value="rating">{t('sortRating')}</option>
                <option value="price-asc">{t('sortPriceLow')}</option>
                <option value="price-desc">{t('sortPriceHigh')}</option>
              </select>
            </div>

            {/* Grid / List View Toggle */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setFilters(prev => ({ ...prev, viewMode: 'grid' }))}
                className={`p-1.5 rounded-lg transition-colors ${
                  filters.viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
                title={language === 'fa' ? 'نمای شبکه‌ای' : 'Grid View'}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, viewMode: 'list' }))}
                className={`p-1.5 rounded-lg transition-colors ${
                  filters.viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
                title={language === 'fa' ? 'نمای فهرستی' : 'List View'}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Layout with Sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Desktop Left Filter Sidebar */}
          <aside className="hidden md:block md:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs sticky top-24">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{t('filterBy')}</h3>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw size={12} />
                    <span>{t('resetFilters')}</span>
                  </button>
                )}
              </div>

              <div className="space-y-5 text-xs">
                {/* Category Filter */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] mb-2.5">
                    {t('categories')}
                  </h4>
                  <div className="space-y-1">
                    <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                      <span className={filters.categoryId === 'all' ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}>
                        {t('allCategories')}
                      </span>
                      <input
                        type="radio"
                        name="category"
                        checked={filters.categoryId === 'all'}
                        onChange={() => setFilters(prev => ({ ...prev, categoryId: 'all' }))}
                        className="accent-indigo-600"
                      />
                    </label>
                    {categories.map(cat => (
                      <label
                        key={cat.id}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <span className={filters.categoryId === cat.id ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}>
                          {language === 'fa' ? cat.nameFa : cat.name}
                        </span>
                        <input
                          type="radio"
                          name="category"
                          checked={filters.categoryId === cat.id}
                          onChange={() => setFilters(prev => ({ ...prev, categoryId: cat.id }))}
                          className="accent-indigo-600"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Skill Level */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] mb-2.5">
                    {t('level')}
                  </h4>
                  <div className="space-y-1">
                    {['all', 'Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                      <label
                        key={lvl}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <span className={filters.level === lvl ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}>
                          {language === 'fa' ? levelLabels[lvl]?.fa : levelLabels[lvl]?.en}
                        </span>
                        <input
                          type="radio"
                          name="level"
                          checked={filters.level === lvl}
                          onChange={() => setFilters(prev => ({ ...prev, level: lvl }))}
                          className="accent-indigo-600"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Type */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] mb-2.5">
                    {t('price')}
                  </h4>
                  <div className="space-y-1">
                    {[
                      { id: 'all', label: t('allPrices') },
                      { id: 'free', label: t('freeOnly') },
                      { id: 'under50', label: language === 'fa' ? 'زیر ۵۰۰٬۰۰۰ تومان' : 'Under $50' }
                    ].map(p => (
                      <label
                        key={p.id}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <span className={filters.priceType === p.id ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}>
                          {p.label}
                        </span>
                        <input
                          type="radio"
                          name="priceType"
                          checked={filters.priceType === p.id}
                          onChange={() => setFilters(prev => ({ ...prev, priceType: p.id as CatalogFilters['priceType'] }))}
                          className="accent-indigo-600"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] mb-2.5">
                    {t('rating')}
                  </h4>
                  <div className="space-y-1">
                    {[4.8, 4.5, 4.0].map(ratingVal => (
                      <button
                        key={ratingVal}
                        onClick={() => setFilters(prev => ({ ...prev, minRating: prev.minRating === ratingVal ? 0 : ratingVal }))}
                        className={`w-full flex items-center justify-between p-1.5 rounded-lg transition-colors ${
                          filters.minRating === ratingVal
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-600 dark:text-indigo-400'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Star size={13} className="fill-amber-400 text-amber-400" />
                          <span>{language === 'fa' ? `${toPersianDigits(ratingVal)} و بالاتر` : `${ratingVal} & up`}</span>
                        </div>
                        {filters.minRating === ratingVal && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Certificate Checkbox */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Award size={15} className="text-emerald-500" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {t('certificateIncluded')}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={filters.hasCertificate}
                      onChange={e => setFilters(prev => ({ ...prev, hasCertificate: e.target.checked }))}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                  </label>
                </div>

              </div>
            </div>
          </aside>

          {/* Right Courses Result Area */}
          <main className="md:col-span-9">
            {/* Active Criteria Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t('showingResults')} <strong className="text-slate-900 dark:text-slate-100">{toPersianDigits(filteredCourses.length)}</strong> {t('resultsFor')}
              </span>
            </div>

            {/* Courses List / Grid */}
            {filteredCourses.length > 0 ? (
              <div
                className={
                  filters.viewMode === 'list'
                    ? 'space-y-4'
                    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                }
              >
                {filteredCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    variant={filters.viewMode}
                  />
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                  <Search size={22} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {t('noCoursesFound')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
                  {t('tryAdjustingFilters')}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold transition-colors"
                >
                  {t('resetFilters')}
                </button>
              </div>
            )}
          </main>

        </div>
      </div>

      {/* Mobile Filters Bottom Sheet Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto space-y-6 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{t('filterBy')}</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile Category List */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">{t('categories')}</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, categoryId: 'all' }))}
                  className={`p-2.5 rounded-xl text-xs font-semibold text-start border ${
                    filters.categoryId === 'all'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {t('allCategories')}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilters(prev => ({ ...prev, categoryId: cat.id }))}
                    className={`p-2.5 rounded-xl text-xs font-semibold text-start border ${
                      filters.categoryId === cat.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {language === 'fa' ? cat.nameFa : cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                {t('resetFilters')}
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 rounded-xl bg-indigo-900 text-white text-xs font-bold"
              >
                {language === 'fa' 
                  ? `اعمال فیلترها (${toPersianDigits(filteredCourses.length)})`
                  : `Apply (${filteredCourses.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
