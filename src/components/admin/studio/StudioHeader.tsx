import React from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  Plus, 
  UploadCloud, 
  ShieldCheck, 
  Sparkles, 
  Bell, 
  ExternalLink,
  Laptop
} from 'lucide-react';
import { toPersianDigits } from '../../../utils/persian';

interface StudioHeaderProps {
  onNewCourse: () => void;
  onOpenImport: () => void;
  onOpenBulkUpload: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  onNewCourse,
  onOpenImport,
  onOpenBulkUpload
}) => {
  const { currentUser, navigate, language } = useApp();

  return (
    <header className="bg-white dark:bg-[#06242e] border-b border-[#ccede5] dark:border-teal-900/60 sticky top-0 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Studio Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0b3b49] to-[#06242e] border border-[#5eead4]/40 flex items-center justify-center shadow-xs">
              <Sparkles size={20} className="text-[#5eead4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-[#06242e] dark:text-white tracking-tight">
                  استودیو مدیریت دوره‌ها
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#def4ee] dark:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4] text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] animate-pulse" />
                  <span>نسخه حرفه‌ای v2.5</span>
                </span>
              </div>
              <p className="text-[11px] text-[#527683] dark:text-[#8ab5be] hidden sm:block">
                سیستم جامع مدیریت محتوای آموزشی، سرفصل‌ها، ویدیوها و انتشار کاتالوگ
              </p>
            </div>
          </div>

          {/* Quick Actions & Admin Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Marketplace Button */}
            <button
              onClick={() => navigate('catalog')}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#09222b] hover:bg-slate-200 dark:hover:bg-[#0e3b47] text-[#06242e] dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-transparent dark:border-teal-900/40"
              title="مشاهده نمای دانشجویان"
            >
              <Laptop size={14} />
              <span>مشاهده سایت</span>
              <ExternalLink size={12} />
            </button>

            {/* Bulk Upload Button */}
            <button
              onClick={onOpenBulkUpload}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#def4ee] hover:bg-[#c9eee5] dark:bg-[#0e3b47] dark:hover:bg-[#124d5d] text-[#0b3b49] dark:text-[#5eead4] text-xs font-bold transition-colors cursor-pointer"
              title="بارگذاری گروهی فایل‌های ویدیویی و رسانه‌ها"
            >
              <UploadCloud size={15} />
              <span className="hidden sm:inline">بارگذاری گروهی</span>
            </button>

            {/* Create New Course Button */}
            <button
              onClick={onNewCourse}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0b3b49] hover:bg-[#06242e] dark:bg-[#5eead4] dark:hover:bg-[#2dd4bf] text-white dark:text-[#06242e] text-xs font-extrabold shadow-sm transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>+ ایجاد دوره جدید</span>
            </button>

            {/* Admin Avatar & Role */}
            <div className="flex items-center gap-2 ps-2 border-s border-[#ccede5] dark:border-teal-900/60">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-xl object-cover border border-[#5eead4]/40"
                />
                <span className="absolute -bottom-0.5 -end-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#06242e]" />
              </div>
              <div className="hidden lg:block text-start">
                <div className="text-xs font-bold text-[#06242e] dark:text-white truncate max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-[#0d9488] dark:text-[#5eead4] font-semibold flex items-center gap-1">
                  <ShieldCheck size={11} />
                  <span>مدیر ارشد پلتفرم</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
