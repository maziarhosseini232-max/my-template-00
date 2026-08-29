import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  Layers, 
  GraduationCap, 
  Users, 
  ShoppingCart, 
  CreditCard, 
  BarChart3, 
  FolderOpen, 
  Settings,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { toPersianDigits } from '../../../utils/persian';

export type StudioTab = 
  | 'dashboard' 
  | 'courses' 
  | 'create-course' 
  | 'categories' 
  | 'instructors' 
  | 'students' 
  | 'orders' 
  | 'payouts' 
  | 'reports' 
  | 'media' 
  | 'settings';

interface StudioSidebarProps {
  activeTab: StudioTab;
  onSelectTab: (tab: StudioTab) => void;
  courseCount: number;
  draftCount: number;
  pendingCount: number;
  mediaCount: number;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  activeTab,
  onSelectTab,
  courseCount,
  draftCount,
  pendingCount,
  mediaCount
}) => {
  const navItems: {
    id: StudioTab;
    label: string;
    icon: React.FC<{ size?: number; className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    isPrimary?: boolean;
  }[] = [
    {
      id: 'dashboard',
      label: 'داشبورد استودیو',
      icon: LayoutDashboard
    },
    {
      id: 'courses',
      label: 'مدیریت دوره‌ها',
      icon: BookOpen,
      badge: toPersianDigits(courseCount)
    },
    {
      id: 'create-course',
      label: 'ایجاد دوره جدید',
      icon: PlusCircle,
      isPrimary: true
    },
    {
      id: 'media',
      label: 'کتابخانه رسانه‌ها',
      icon: FolderOpen,
      badge: toPersianDigits(mediaCount)
    },
    {
      id: 'categories',
      label: 'دسته‌بندی‌ها',
      icon: Layers
    },
    {
      id: 'instructors',
      label: 'مدرس‌ها و اساتید',
      icon: GraduationCap
    },
    {
      id: 'students',
      label: 'دانشجویان و پیشرفت',
      icon: Users
    },
    {
      id: 'orders',
      label: 'سفارش‌ها و تراکنش‌ها',
      icon: ShoppingCart
    },
    {
      id: 'payouts',
      label: 'پرداخت‌ها و تسویه‌حساب',
      icon: CreditCard
    },
    {
      id: 'reports',
      label: 'گزارش‌ها و آنالیتیکس',
      icon: BarChart3
    },
    {
      id: 'settings',
      label: 'تنظیمات استودیو',
      icon: Settings
    }
  ];

  return (
    <aside className="w-full lg:w-64 bg-white dark:bg-[#06242e] border-b lg:border-b-0 lg:border-e border-[#ccede5] dark:border-teal-900/60 p-4 shrink-0 flex lg:flex-col justify-between">
      <div className="w-full">
        {/* Navigation list */}
        <div className="text-[11px] font-bold text-[#527683] dark:text-[#8ab5be] uppercase tracking-wider px-3 mb-2 hidden lg:block">
          بخش‌های مدیریت
        </div>

        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer text-start ${
                  isActive
                    ? 'bg-[#0b3b49] text-white dark:bg-[#5eead4] dark:text-[#06242e] shadow-xs'
                    : item.isPrimary
                    ? 'bg-[#def4ee] hover:bg-[#c9eee5] dark:bg-[#0e3b47] dark:hover:bg-[#124d5d] text-[#0b3b49] dark:text-[#5eead4]'
                    : 'text-[#06242e] dark:text-slate-200 hover:bg-[#f0fbf8] dark:hover:bg-[#092b36]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={17} className={isActive ? (activeTab === 'create-course' ? '' : 'text-[#5eead4] dark:text-[#06242e]') : 'text-[#0d9488] dark:text-[#5eead4]'} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive 
                      ? 'bg-white/20 text-white dark:bg-black/20 dark:text-[#06242e]' 
                      : 'bg-slate-100 dark:bg-[#0e3b47] text-[#527683] dark:text-[#8ab5be]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Status Pill at Sidebar Bottom */}
      <div className="hidden lg:block mt-6 p-3 rounded-2xl bg-gradient-to-br from-[#def4ee]/60 to-[#c9eee5]/40 dark:from-[#092b36] dark:to-[#06242e] border border-[#ccede5] dark:border-teal-900/60">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0b3b49] dark:text-[#5eead4] mb-1.5">
          <Sparkles size={14} />
          <span>وضعیت مخزن دوره‌ها</span>
        </div>
        <div className="space-y-1.5 text-[11px] text-[#527683] dark:text-[#8ab5be]">
          <div className="flex justify-between items-center">
            <span>پیش‌نویس‌های در حال ویرایش:</span>
            <span className="font-extrabold text-[#06242e] dark:text-white">{toPersianDigits(draftCount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>در انتظار بازبینی:</span>
            <span className="font-extrabold text-amber-600 dark:text-amber-400">{toPersianDigits(pendingCount)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
