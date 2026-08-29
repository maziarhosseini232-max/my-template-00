import React from 'react';
import { X, TrendingUp, Users, DollarSign, Clock, Star, Award, CheckCircle2 } from 'lucide-react';
import { Course } from '../../../types';
import { toPersianDigits, formatTomanPrice } from '../../../utils/persian';

interface CourseAnalyticsModalProps {
  course: Course;
  onClose: () => void;
}

export const CourseAnalyticsModal: React.FC<CourseAnalyticsModalProps> = ({ course, onClose }) => {
  const estimatedRevenue = (course.studentCount || 1) * course.price;
  const completionRate = 74; // percentage
  const avgWatchTime = '۷۸٪';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#06242e] rounded-3xl max-w-2xl w-full border border-[#ccede5] dark:border-teal-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-xs">
        
        {/* Header */}
        <div className="p-5 bg-[#f0fbf8] dark:bg-[#092b36] border-b border-[#ccede5] dark:border-teal-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] flex items-center justify-center font-bold">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#06242e] dark:text-white">
                گزارش عملکرد و تحلیل آماری دوره
              </h3>
              <p className="text-[11px] text-[#0d9488] dark:text-[#5eead4] font-bold">
                {course.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#527683] hover:text-[#06242e] dark:text-[#8ab5be] dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#0e3b47] cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <div className="p-3.5 rounded-2xl bg-[#def4ee]/40 dark:bg-[#082834] border border-[#ccede5] dark:border-teal-900">
              <div className="text-[11px] text-[#527683] dark:text-[#8ab5be]">دانشجویان فعال</div>
              <div className="text-lg font-black text-[#06242e] dark:text-white mt-1">
                {toPersianDigits(course.studentCount)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#def4ee]/40 dark:bg-[#082834] border border-[#ccede5] dark:border-teal-900">
              <div className="text-[11px] text-[#527683] dark:text-[#8ab5be]">مجموع فروش ناخالص</div>
              <div className="text-sm font-black text-[#0d9488] dark:text-[#5eead4] mt-1.5 truncate">
                {formatTomanPrice(estimatedRevenue)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#def4ee]/40 dark:bg-[#082834] border border-[#ccede5] dark:border-teal-900">
              <div className="text-[11px] text-[#527683] dark:text-[#8ab5be]">میانگین امتیاز</div>
              <div className="text-lg font-black text-amber-500 mt-1 flex items-center gap-1">
                <span>{toPersianDigits(course.rating)}</span>
                <Star size={14} className="fill-amber-500" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#def4ee]/40 dark:bg-[#082834] border border-[#ccede5] dark:border-teal-900">
              <div className="text-[11px] text-[#527683] dark:text-[#8ab5be]">نرخ تکمیل دوره</div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {toPersianDigits(completionRate)}٪
              </div>
            </div>

          </div>

          {/* Retention & Progress */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#082834] border border-[#ccede5] dark:border-teal-900 space-y-3">
            <h4 className="font-extrabold text-xs text-[#06242e] dark:text-white">
              میزان پیشروی دانشجویان در سرفصل‌ها
            </h4>

            {course.modules.map((mod, idx) => (
              <div key={mod.id} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-[#06242e] dark:text-white">{mod.title}</span>
                  <span className="text-[#0d9488] dark:text-[#5eead4] font-bold">
                    {toPersianDigits(Math.max(30, 95 - idx * 15))}٪ مشاهده
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0d9488]"
                    style={{ width: `${Math.max(30, 95 - idx * 15)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f0fbf8] dark:bg-[#092b36] border-t border-[#ccede5] dark:border-teal-900/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] font-bold"
          >
            بستن گزارش
          </button>
        </div>

      </div>
    </div>
  );
};
