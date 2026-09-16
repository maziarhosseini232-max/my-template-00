import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  Download, Search, FileText, Code2, Archive, 
  Layers, CheckCircle2, Clock, Play, Sparkles, ExternalLink,
  ShieldCheck, RefreshCw
} from 'lucide-react';
import { toPersianDigits } from '../../../utils/persian';
import { CourseDownloadItem } from '../../../types';

export const DownloadsTab: React.FC = () => {
  const { downloads, enrollments, courses, navigate, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'figma' | 'zip' | 'pdf' | 'code' | 'audio'>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Filter downloads
  const filteredDownloads = downloads.filter(item => {
    if (selectedType !== 'all' && item.fileType !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.courseTitle.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleDownload = (item: CourseDownloadItem) => {
    setDownloadingId(item.id);
    addToast({
      title: 'دانلود فایل آغاز شد 📥',
      message: `فایل «${item.title}» با موفقیت آماده دانلود شد.`,
      type: 'info'
    });

    setTimeout(() => {
      setDownloadingId(null);
      // Trigger browser download
      const link = document.createElement('a');
      link.href = item.downloadUrl;
      link.download = item.title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 600);
  };

  const getFileTypeBadge = (type: CourseDownloadItem['fileType']) => {
    switch (type) {
      case 'figma':
        return {
          icon: Layers,
          label: 'FIGMA',
          bg: 'bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
        };
      case 'zip':
      case 'code':
        return {
          icon: Archive,
          label: 'ZIP SOURCE',
          bg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
        };
      case 'pdf':
        return {
          icon: FileText,
          label: 'PDF GUIDE',
          bg: 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
        };
      case 'audio':
        return {
          icon: Sparkles,
          label: 'AUDIO MP3',
          bg: 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
        };
      default:
        return {
          icon: Download,
          label: 'FILE',
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
        };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner Notice */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white border border-blue-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-blue-300 flex items-center justify-center shrink-0 border border-white/10">
            <Download size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              مرکز دانلود فایل‌ها و منابع آموزشی دوره‌ها
            </h3>
            <p className="text-xs text-blue-200 mt-1 max-w-xl">
              تمامی پروژه‌های عملی، فایل‌های فیگما، سورس‌کدهای ری‌اکت و کتب راهنما دوره‌های ثبت‌نامی شما همیشه در این بخش با آخرین به‌روزرسانی‌ها قابل دریافت هستند.
            </p>
          </div>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-blue-200 shrink-0 font-medium">
          {toPersianDigits(downloads.length)} فایل در دسترس
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          {/* File Types Filter */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-bold">
            {[
              { id: 'all', label: 'همه فایل‌ها' },
              { id: 'figma', label: 'پروژه‌های فیگما' },
              { id: 'zip', label: 'سورس‌کدهای فشرده (ZIP)' },
              { id: 'pdf', label: 'دفترچه‌ها و چیت‌شیت‌ها (PDF)' },
              { id: 'code', label: 'کدهای پروژه' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id as typeof selectedType)}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedType === type.id
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در فایل‌ها و دوره‌ها..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

        </div>

        {/* Downloads List */}
        {filteredDownloads.length > 0 ? (
          <div className="grid grid-cols-1 gap-3.5 pt-2">
            {filteredDownloads.map(item => {
              const badge = getFileTypeBadge(item.fileType);
              const BadgeIcon = badge.icon;
              const isCurrentDownloading = downloadingId === item.id;

              return (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 hover:border-blue-500/40 transition-all group"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${badge.bg}`}>
                      <BadgeIcon size={20} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300">
                          {item.courseTitle}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h4>

                      {item.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
                        <span>حجم فایل: <strong className="text-slate-600 dark:text-slate-300 font-mono">{item.fileSize}</strong></span>
                        <span>•</span>
                        {item.downloadCount && (
                          <>
                            <span>{toPersianDigits(item.downloadCount)} بار دانلود شده</span>
                            <span>•</span>
                          </>
                        )}
                        <span>تاریخ انتشار: {item.addedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-700">
                    {item.courseId && (
                      <button
                        onClick={() => navigate('player', item.courseId)}
                        className="px-3 py-2 rounded-xl bg-slate-200/80 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title="مشاهده جلسه مربوطه در ویدیو پلیر"
                      >
                        <Play size={13} />
                        <span>مشاهده جلسه</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDownload(item)}
                      disabled={isCurrentDownloading}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isCurrentDownloading ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>در حال دریافت...</span>
                        </>
                      ) : (
                        <>
                          <Download size={14} />
                          <span>دریافت فایل</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <Download size={30} className="text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              هیچ فایلی با این فیلتر یا عبارت یافت نشد
            </p>
          </div>
        )}

      </div>

    </div>
  );
};
