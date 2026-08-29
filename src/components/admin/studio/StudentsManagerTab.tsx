import React, { useState } from 'react';
import { Users, Search, Award, BookOpen, Clock, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toPersianDigits } from '../../../utils/persian';

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  enrolledCourseCount: number;
  completedLessons: number;
  totalLessons: number;
  hasCertificate: boolean;
  joinDate: string;
  avatar: string;
}

export const StudentsManagerTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const [students] = useState<StudentRecord[]>([
    {
      id: 'std-1',
      name: 'امیررضا کاظمی',
      email: 'amirreza.k@gmail.com',
      enrolledCourseCount: 4,
      completedLessons: 38,
      totalLessons: 45,
      hasCertificate: true,
      joinDate: '۱۴۰۳/۰۵/۱۲',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200'
    },
    {
      id: 'std-2',
      name: 'مریم بهرامی',
      email: 'm.bahrami@yahoo.com',
      enrolledCourseCount: 2,
      completedLessons: 18,
      totalLessons: 24,
      hasCertificate: false,
      joinDate: '۱۴۰۳/۰۶/۰۱',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200'
    },
    {
      id: 'std-3',
      name: 'پویا دهقان',
      email: 'pouya.dehghan@outlook.com',
      enrolledCourseCount: 6,
      completedLessons: 82,
      totalLessons: 82,
      hasCertificate: true,
      joinDate: '۱۴۰۳/۰۲/۱۸',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200'
    },
    {
      id: 'std-4',
      name: 'سارا ناصری',
      email: 'sara.naseri@gmail.com',
      enrolledCourseCount: 3,
      completedLessons: 29,
      totalLessons: 50,
      hasCertificate: false,
      joinDate: '۱۴۰۳/۰۷/۱۰',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200'
    }
  ]);

  const filtered = students.filter(s =>
    !searchTerm.trim() || s.name.includes(searchTerm) || s.email.includes(searchTerm)
  );

  return (
    <div className="space-y-6 text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#06242e] dark:text-white">
            دانشجویان و فراگیران دوره‌ها
          </h2>
          <p className="text-xs text-[#527683] dark:text-[#8ab5be] mt-0.5">
            پیگیری پیشرفت تحصیلی، صدور مدارک و آمار ثبت‌نام
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-[#527683]" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="جستجو بر اساس نام یا ایمیل دانشجو..."
            className="w-full ps-9 pe-4 py-2 rounded-xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#06242e] rounded-2xl border border-[#ccede5] dark:border-teal-900/60 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-[#ccede5] dark:border-teal-900/60 bg-[#f0fbf8] dark:bg-[#092b36] text-[11px] font-bold text-[#527683] dark:text-[#8ab5be]">
                <th className="p-4">مشخصات دانشجو</th>
                <th className="p-4">دوره‌های ثبت‌نامی</th>
                <th className="p-4">درصد پیشرفت و جلسات</th>
                <th className="p-4">گواهینامه</th>
                <th className="p-4">تاریخ عضویت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ccede5]/60 dark:divide-teal-900/40">
              {filtered.map(std => {
                const progressPct = Math.round((std.completedLessons / std.totalLessons) * 100);

                return (
                  <tr key={std.id} className="hover:bg-[#f0fbf8]/50 dark:hover:bg-[#082834] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={std.avatar} alt={std.name} className="w-9 h-9 rounded-xl object-cover" />
                        <div>
                          <div className="font-extrabold text-xs text-[#06242e] dark:text-white">{std.name}</div>
                          <div className="text-[10px] text-[#527683] dark:text-[#8ab5be] font-mono">{std.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-[#06242e] dark:text-white">
                      {toPersianDigits(std.enrolledCourseCount)} دوره
                    </td>

                    <td className="p-4">
                      <div className="space-y-1 max-w-[140px]">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>{toPersianDigits(std.completedLessons)} از {toPersianDigits(std.totalLessons)} جلسه</span>
                          <span className="text-[#0d9488] dark:text-[#5eead4]">{toPersianDigits(progressPct)}٪</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-[#0d9488]" style={{ width: `${progressPct}%` }} />
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      {std.hasCertificate ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                          <Award size={12} />
                          <span>صادر شده</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#527683] dark:text-[#8ab5be]">در حال گذراندن</span>
                      )}
                    </td>

                    <td className="p-4 text-[#527683] dark:text-[#8ab5be]">
                      {std.joinDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
