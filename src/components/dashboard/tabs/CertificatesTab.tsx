import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  Award, Download, Share2, CheckCircle2, 
  ExternalLink, ShieldCheck, Copy, Sparkles, BookOpen 
} from 'lucide-react';
import { toPersianDigits } from '../../../utils/persian';
import { Certificate } from '../../../types';

export const CertificatesTab: React.FC = () => {
  const { currentUser, enrollments, courses, certificates, navigate, addToast } = useApp();
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  // Enrolled courses list
  const enrolledCourseIds = Object.keys(enrollments);
  const enrolledList = enrolledCourseIds
    .map(id => {
      const course = courses.find(c => c.id === id);
      const enrollment = enrollments[id];
      return { course, enrollment };
    })
    .filter((item): item is { course: typeof courses[0]; enrollment: typeof enrollments[string] } => !!item.course);

  // Completed courses
  const completedCourses = enrolledList.filter(item => item.enrollment.progressPercent >= 100);

  // Generated or mapped certificates
  const userCerts: Certificate[] = completedCourses.map(({ course, enrollment }) => {
    const existing = certificates.find(c => c.courseId === course.id);
    if (existing) return existing;
    return {
      id: `CERT-LUMINA-${course.id.substring(0, 8).toUpperCase()}`,
      courseId: course.id,
      courseTitle: course.title,
      studentName: currentUser.name,
      issueDate: '۱۴۰۴/۱۱/۲۰',
      instructorName: course.instructorName,
      certificateUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=1200&auto=format&fit=crop',
      grade: 'عالی (Grade A+)',
      verificationCode: `VERIFY-${Math.floor(100000 + Math.random() * 900000)}`
    };
  });

  const copyVerification = (code: string) => {
    navigator.clipboard.writeText(code);
    addToast({
      title: 'کپی شد',
      message: `کد استعلام ${code} در حافظه کپی شد.`,
      type: 'info'
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white border border-amber-900/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Award size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              گواهینامه‌های رسمی و معتبر پایان دوره
            </h3>
            <p className="text-xs text-amber-200/80 mt-1 max-w-xl">
              پس از تکمیل ۱۰۰٪ جلسات هر دوره، گواهینامه دیجیتال دو زبانه با شناسه یکتای اعتبارسنجی بین‌المللی برای شما صادر می‌شود.
            </p>
          </div>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 shrink-0 font-bold">
          {toPersianDigits(userCerts.length)} مدرک رسمی
        </div>
      </div>

      {/* Certificates Grid */}
      {userCerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userCerts.map(cert => (
            <div 
              key={cert.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/50 shadow-md hover:shadow-xl transition-all space-y-4 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                      Lumina Certified Professional
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {cert.courseTitle}
                    </h4>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold shrink-0">
                  {cert.grade || 'Grade A+'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">دانش‌آموخته:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{cert.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">مدرس دوره:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{cert.instructorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">تاریخ صدور:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{cert.issueDate}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400">کد استعلام اصالت:</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-teal-600 dark:text-teal-400">
                    <span>{cert.verificationCode || cert.id}</span>
                    <button 
                      onClick={() => copyVerification(cert.verificationCode || cert.id)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="کپی کد استعلام"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    addToast({
                      title: 'دریافت گواهینامه 🎓',
                      message: 'فایل نسخه PDF با کیفیت چاپی و واترمرک دیجیتال در حال دانلود است.',
                      type: 'success'
                    });
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} />
                  <span>دانلود گواهی رسمی (PDF)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <Award size={36} className="text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            هنوز گواهینامه‌ای دریافت نکرده‌اید
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-5 max-w-md mx-auto leading-relaxed">
            با مشاهده تمام جلسات دوره‌های خود و رساندن میزان یادگیری به ۱۰۰٪، گواهینامه رسمی شما بلافاصله صادر می‌گردد.
          </p>
          <button
            onClick={() => navigate('catalog')}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            مشاهده دوره‌های در حال یادگیری
          </button>
        </div>
      )}

    </div>
  );
};
