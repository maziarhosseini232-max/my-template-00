import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, Clock, TrendingUp, BookOpen, User, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatPriceToman, toPersianDigits } from '../../utils/persian';

export const SearchModal: React.FC = () => {
  const { 
    searchModalOpen, 
    setSearchModalOpen, 
    courses, 
    instructors, 
    categories, 
    recentSearches, 
    addRecentSearch, 
    clearRecentSearches,
    navigate,
    t,
    isRTL,
    language 
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [searchModalOpen]);

  // Global escape key listener to close modal from anywhere
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchModalOpen) {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [searchModalOpen, setSearchModalOpen]);

  const filteredCourses = query.trim()
    ? courses.filter(c => 
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        c.categoryName.toLowerCase().includes(query.toLowerCase()) ||
        c.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5)
    : [];

  const filteredInstructors = query.trim()
    ? instructors.filter(i => 
        i.name.toLowerCase().includes(query.toLowerCase()) ||
        (i.nameFa && i.nameFa.toLowerCase().includes(query.toLowerCase())) ||
        i.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3)
    : [];

  const handleSelectCourse = (slug: string) => {
    if (query.trim()) addRecentSearch(query.trim());
    setSearchModalOpen(false);
    navigate('course-detail', slug);
  };

  const handleSelectSearch = (term: string) => {
    addRecentSearch(term);
    setSearchModalOpen(false);
    navigate('catalog', undefined, `search=${encodeURIComponent(term)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchModalOpen(false);
    } else if (e.key === 'Enter' && query.trim()) {
      handleSelectSearch(query.trim());
    }
  };

  if (!searchModalOpen) return null;

  const trendingTopics = language === 'fa' 
    ? ['دیزاین سیستم و فیگما', 'معماری هوش مصنوعی', 'داوینچی ریزالو', 'سرمایه‌گذاری استارتاپ', 'میکس و مسترینگ صدا', 'عکاسی پرتره استودیویی']
    : ['Design Systems', 'AI Agents Architecture', 'DaVinci Resolve', 'Venture Strategy', 'Ableton Synth Design', 'Portrait Lighting'];

  return (
    <AnimatePresence>
      <div 
        id="search-modal-backdrop"
        onClick={() => setSearchModalOpen(false)}
        className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 md:pt-24 px-3 sm:px-4 bg-slate-950/70 backdrop-blur-md transition-all duration-200 cursor-pointer"
        role="dialog"
        aria-modal="true"
        aria-label={language === 'fa' ? 'پنجره جستجوی دوره‌ها و اساتید' : 'Search courses and instructors'}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -12 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] cursor-default"
          onClick={e => e.stopPropagation()}
        >
          {/* Input Header */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 gap-2.5 sm:gap-3 bg-slate-50/50 dark:bg-slate-900/60">
            <Search className="w-5 h-5 text-[#0d9488] dark:text-[#5eead4] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('searchPlaceholder')}
              className="flex-1 bg-transparent text-sm md:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
              autoFocus
            />

            {/* Clear Query Button (when query is typed) */}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title={language === 'fa' ? 'پاک‌کردن متن' : 'Clear text'}
                aria-label="Clear query"
              >
                <X size={15} />
              </button>
            )}

            {/* Keyboard ESC indicator */}
            <kbd className="hidden sm:inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700/80">
              ESC
            </kbd>

            {/* Dedicated Modern Close Button */}
            <button
              type="button"
              id="search-modal-close-btn"
              onClick={() => setSearchModalOpen(false)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 transition-all duration-150 cursor-pointer flex items-center justify-center shrink-0 group"
              title={language === 'fa' ? 'بستن پنجره جستجو (ESC)' : 'Close search (ESC)'}
              aria-label={language === 'fa' ? 'بستن پنجره جستجو' : 'Close search modal'}
            >
              <X size={18} className="group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          {/* Results / Suggestion Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* If query entered: show categorized matches */}
            {query.trim() ? (
              <>
                {/* Courses */}
                {filteredCourses.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                      <BookOpen size={13} />
                      <span>{t('allCourses')}</span>
                    </div>
                    <div className="space-y-1">
                      {filteredCourses.map(course => (
                        <div
                          key={course.id}
                          onClick={() => handleSelectCourse(course.slug)}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-12 h-8 rounded object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs md:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                {course.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate">
                                {course.instructorName} • {course.categoryName}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100 shrink-0 ms-2">
                            {formatPriceToman(course.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructors */}
                {filteredInstructors.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                      <User size={13} />
                      <span>{t('instructorSpotlight')}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredInstructors.map(inst => (
                        <div
                          key={inst.id}
                          onClick={() => handleSelectSearch(language === 'fa' && inst.nameFa ? inst.nameFa : inst.name)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                        >
                          <img
                            src={inst.avatar}
                            alt={inst.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {language === 'fa' && inst.nameFa ? inst.nameFa : inst.name}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">{inst.title}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {filteredCourses.length === 0 && filteredInstructors.length === 0 && (
                  <div className="py-12 text-center text-slate-500">
                    <p className="text-sm">{t('noCoursesFound')}</p>
                    <button
                      onClick={() => handleSelectSearch(query)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <span>{language === 'fa' ? `جستجو برای «${query}» در کاتالوگ` : `Search catalog for "${query}"`}</span>
                      {isRTL ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} />
                        <span>{language === 'fa' ? 'جستجوهای اخیر شما' : 'Recent Searches'}</span>
                      </div>
                      <button
                        onClick={clearRecentSearches}
                        className="text-[11px] font-normal text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {language === 'fa' ? 'پاک‌کردن' : 'Clear'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectSearch(term)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-400 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Topics */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                    <TrendingUp size={13} />
                    <span>{language === 'fa' ? 'موضوعات پرطرفدار و کلیدی' : 'Trending Masterclasses'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingTopics.map((topic, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectSearch(topic)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                    <Sparkles size={13} />
                    <span>{language === 'fa' ? 'دسته‌بندی‌های برگزیده' : 'Top Categories'}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {categories.slice(0, 4).map(cat => (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setSearchModalOpen(false);
                          navigate('catalog', undefined, `category=${cat.id}`);
                        }}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all"
                      >
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {language === 'fa' ? cat.nameFa : cat.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {language === 'fa' ? `${toPersianDigits(cat.courseCount)} دوره` : `${cat.courseCount} courses`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">↵ Enter</kbd>
              <span>
                {language === 'fa' ? 'جستجو در کاتالوگ' : 'Search in catalog'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-slate-400">
                {language === 'fa' ? 'کلیک در فضای خالی یا فشردن ESC' : 'Click backdrop or press ESC'}
              </span>
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
              >
                {language === 'fa' ? 'بستن' : 'Close'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
