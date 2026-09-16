import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { CourseCard } from '../common/CourseCard';
import { 
  Filter, Grid, List, Search, X, SlidersHorizontal, 
  RotateCcw, Award, Star, Check, AlertCircle, RefreshCw,
  ChevronDown, Flame, Clock, ArrowDownWideNarrow, ArrowUpWideNarrow, Crown
} from 'lucide-react';
import { CatalogFilters, Course } from '../../types';
import { toPersianDigits } from '../../utils/persian';
import { api } from '../../services/api';

export const CatalogView: React.FC = () => {
  const { categories, currentRoute, navigate, t, language, isRTL } = useApp();

  const [apiCourses, setApiCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions = useMemo(() => [
    { value: 'popular' as const, label: t('sortPopular'), icon: Flame },
    { value: 'newest' as const, label: t('sortNewest'), icon: Clock },
    { value: 'rating' as const, label: t('sortRating'), icon: Star },
    { value: 'price-asc' as const, label: t('sortPriceLow'), icon: ArrowDownWideNarrow },
    { value: 'price-desc' as const, label: t('sortPriceHigh'), icon: ArrowUpWideNarrow },
  ], [t]);

  const currentSortOption = sortOptions.find(opt => opt.value === filters.sortBy) || sortOptions[0];
  const CurrentSortIcon = currentSortOption.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSortDropdownOpen(false);
      }
    };

    if (sortDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sortDropdownOpen]);

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

  // Real API Fetch with search & category & level filters
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.courses.getAll({
        categoryId: filters.categoryId !== 'all' ? filters.categoryId : undefined,
        search: filters.searchQuery.trim() ? filters.searchQuery.trim() : undefined,
        level: filters.level !== 'all' ? filters.level : undefined
      });

      if (res && res.data) {
        setApiCourses(res.data);
      } else {
        setApiCourses([]);
      }
    } catch (err: any) {
      console.error('[CatalogView API Error]:', err);
      setError(err?.message || (language === 'fa' ? 'دریافت دوره‌ها با مشکل مواجه شد.' : 'Failed to fetch courses.'));
    } finally {
      setLoading(false);
    }
  }, [filters.categoryId, filters.searchQuery, filters.level, language]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchCourses]);

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

  // Filter & Sort computation over API data
  const filteredCourses = useMemo(() => {
    return apiCourses.filter(course => {
      // Published check
      if (course.status && course.status.toLowerCase() !== 'published') return false;

      // Price type
      if (filters.priceType === 'free') {
        const isFreeCourse = (course as any).isFree || course.price === 0;
        const hasFreeModule = (course.modules || []).some(m => m.lessons.some(l => l.isPreviewFree || (l as any).isFreePreview));
        if (!isFreeCourse && !hasFreeModule) return false;
      } else if (filters.priceType === 'paid' && course.price === 0 && (course as any).isFree) {
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
      const aStudents = a.studentCount || (a as any).enrolledStudentsCount || 0;
      const bStudents = b.studentCount || (b as any).enrolledStudentsCount || 0;
      if (filters.sortBy === 'popular') return bStudents - aStudents;
      if (filters.sortBy === 'newest') {
        const aDate = new Date(a.publishedAt || a.createdAt || 0).getTime();
        const bDate = new Date(b.publishedAt || b.createdAt || 0).getTime();
        return bDate - aDate;
      }
      if (filters.sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (filters.sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (filters.sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      return 0;
    });
  }, [apiCourses, filters]);

  const activeFilterCount = [
    filters.categoryId !== 'all',
    filters.level !== 'all',
    filters.priceType !== 'all',
    filters.minRating > 0,
    filters.duration !== 'all',
    filters.hasCertificate
  ].filter(Boolean).length;

  const currentCategoryObj = categories.find(c => c.id === filters.categoryId || c.slug === filters.categoryId);
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
              ? `دسترسی مستقیم به دوره‌های تخصصی و مسترکلاس‌های جامع با تدریس برترین اساتید صنعت.`
              : `Explore industry masterclasses taught by world-class leaders and visionary artists.`}
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

            {/* Custom Styled Sort Dropdown */}
            <div className="relative flex items-center gap-2 text-xs" ref={sortDropdownRef}>
              <span className="text-slate-400 dark:text-slate-500 hidden sm:inline-block font-medium">{t('sortBy')}:</span>
              
              <button
                type="button"
                id="catalog-sort-select"
                onClick={() => setSortDropdownOpen(prev => !prev)}
                aria-haspopup="listbox"
                aria-expanded={sortDropdownOpen}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all duration-200 cursor-pointer shadow-2xs hover:bg-slate-100/80 dark:hover:bg-slate-750 ${
                  sortDropdownOpen 
                    ? 'border-[#0d9488] ring-2 ring-[#0d9488]/20 dark:border-[#5eead4]' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <CurrentSortIcon size={14} className="text-[#0d9488] dark:text-[#5eead4] shrink-0" />
                <span>{currentSortOption.label}</span>
                <ChevronDown 
                  size={14} 
                  className={`text-slate-400 dark:text-slate-400 transition-transform duration-200 shrink-0 ${
                    sortDropdownOpen ? 'rotate-180 text-[#0d9488] dark:text-[#5eead4]' : ''
                  }`} 
                />
              </button>

              {/* Floating Dropdown Menu with High-End Styling, Border & UX */}
              {sortDropdownOpen && (
                <div 
                  role="listbox"
                  id="catalog-sort-menu"
                  className="absolute top-full mt-2 inset-inline-end-0 z-50 w-52 bg-white dark:bg-[#08242d] rounded-2xl border border-slate-200 dark:border-teal-900/80 shadow-xl shadow-slate-200/50 dark:shadow-teal-950/70 p-1.5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 space-y-0.5"
                >
                  <div className="px-2.5 py-1.5 mb-1 border-b border-slate-100 dark:border-teal-950/60 flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-400">
                    <span>{t('sortBy')}</span>
                    <span className="text-[10px] text-[#0d9488] dark:text-[#5eead4] bg-teal-50 dark:bg-[#0e3b47] px-1.5 py-0.5 rounded-md">
                      {sortOptions.length} گزینه
                    </span>
                  </div>

                  {sortOptions.map(option => {
                    const isSelected = filters.sortBy === option.value;
                    const OptionIcon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setFilters(prev => ({ ...prev, sortBy: option.value }));
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all text-start cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4] font-bold shadow-2xs'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-[#0a2c36] hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected 
                              ? 'bg-[#0d9488]/15 dark:bg-[#5eead4]/20 text-[#0d9488] dark:text-[#5eead4]' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                            <OptionIcon size={13} />
                          </div>
                          <span>{option.label}</span>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-md bg-[#0d9488] dark:bg-[#5eead4] text-white dark:text-[#06242e] flex items-center justify-center shrink-0 shadow-2xs">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
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
                        <span className={(filters.categoryId === cat.id || filters.categoryId === cat.slug) ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}>
                          {language === 'fa' ? cat.nameFa : cat.name}
                        </span>
                        <input
                          type="radio"
                          name="category"
                          checked={filters.categoryId === cat.id || filters.categoryId === cat.slug}
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
              {loading && (
                <span className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <RefreshCw size={12} className="animate-spin" />
                  <span>{language === 'fa' ? 'در حال به‌روزرسانی...' : 'Updating...'}</span>
                </span>
              )}
            </div>

            {/* SKELETON LOADING STATE */}
            {loading && apiCourses.length === 0 ? (
              <div className={
                filters.viewMode === 'list'
                  ? 'space-y-4'
                  : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              }>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-4 animate-pulse">
                    <div className="w-full aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              /* ERROR STATE WITH RETRY */
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/40 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {language === 'fa' ? 'دریافت دوره‌ها با مشکل مواجه شد.' : 'Failed to fetch courses.'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
                  {error}
                </p>
                <button
                  onClick={fetchCourses}
                  className="px-5 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold transition-colors inline-flex items-center gap-2"
                >
                  <RotateCcw size={14} />
                  <span>{language === 'fa' ? 'تلاش مجدد' : 'Retry'}</span>
                </button>
              </div>
            ) : filteredCourses.length > 0 ? (
              /* COURSES GRID / LIST */
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
              /* EMPTY STATE */
              <div className="p-10 sm:p-14 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs max-w-xl mx-auto space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                  <Search size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                    {language === 'fa' ? 'دوره‌ای با فیلترهای انتخابی پیدا نشد.' : t('noCoursesFound')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    {language === 'fa' 
                      ? 'می‌توانید فیلترها را ریست کنید یا با عضویت ویژه VIP به تمامی آموزش‌ها به محض انتشار دسترسی داشته باشید.' 
                      : t('tryAdjustingFilters')}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleResetFilters}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {t('resetFilters')}
                  </button>
                  <button
                    onClick={() => navigate('vip')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Crown size={14} />
                    <span>خرید اشتراک ویژه VIP (دسترسی نامحدود)</span>
                  </button>
                </div>
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
                      (filters.categoryId === cat.id || filters.categoryId === cat.slug)
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
