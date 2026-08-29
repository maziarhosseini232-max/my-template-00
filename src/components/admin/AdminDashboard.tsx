import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Users, BookOpen, DollarSign, TrendingUp, Sparkles, Filter 
} from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

export const AdminDashboard: React.FC = () => {
  const { instructors, addToast, t, language } = useApp();

  const [activeTab, setActiveTab] = useState<'moderation' | 'instructors'>('moderation');
  
  // Pending moderation mock queue
  const [pendingSubmissions, setPendingSubmissions] = useState([
    {
      id: 'sub-1',
      title: 'طراحی پیشرفته میکروتعامل‌ها با WebGL و GLSL Shaders',
      instructorName: 'النا رستمی',
      category: 'طراحی دیزاین سیستم',
      price: '۹۹۰٬۰۰۰ تومان',
      submittedAt: '۳ ساعت پیش',
      status: 'pending'
    },
    {
      id: 'sub-2',
      title: 'مذاکرات جذب سرمایه خطرپذیر و ترم‌شیت برای بنیان‌گذاران استارتاپ',
      instructorName: 'ساسان رادپور',
      category: 'مدیریت و کسب‌وکار',
      price: '۱٬۴۹۰٬۰۰۰ تومان',
      submittedAt: '۶ ساعت پیش',
      status: 'pending'
    }
  ]);

  const handleApprove = (id: string, title: string) => {
    setPendingSubmissions(prev => prev.filter(s => s.id !== id));
    addToast({
      title: language === 'fa' ? 'دوره تایید و منتشر شد' : 'Course Approved',
      message: language === 'fa' ? `دوره «${title}» با موفقیت در کاتالوگ قرار گرفت.` : `"${title}" has been published to the marketplace.`,
      type: 'success'
    });
  };

  const handleReject = (id: string, title: string) => {
    setPendingSubmissions(prev => prev.filter(s => s.id !== id));
    addToast({
      title: language === 'fa' ? 'درخواست بازبینی ارسال شد' : 'Course Returned',
      message: language === 'fa' ? `دوره «${title}» جهت ویرایش سرفصل‌ها به مدرس بازگردانده شد.` : `"${title}" was returned to instructor for curriculum revisions.`,
      type: 'info'
    });
  };

  return (
    <div className="py-10 bg-slate-50/50 dark:bg-slate-950/60 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck size={13} />
              <span>{language === 'fa' ? 'نظارت و حاکمیت کیفیت پلتفرم' : 'Platform Governance'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t('adminDashboard')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'fa'
                ? 'بررسی استانداردهای آموزشی، اعتبارسنجی اساتید و نظارت بر سلامت جریان یادگیری.'
                : 'Review masterclass quality standards, verify mentors, and monitor marketplace health.'}
            </p>
          </div>
        </div>

        {/* High-level Platform Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="text-xs text-slate-400 font-semibold mb-1">
              {language === 'fa' ? 'حجم ناخالص تراکنش‌ها (GMV)' : 'Gross Marketplace Volume (GMV)'}
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {language === 'fa' ? `${toPersianDigits('14,205,000,000')} تومان` : '$1,420,500'}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1">
              {language === 'fa' ? `↑ ٪${toPersianDigits(24.8)} رشد سالانه` : '↑ +24.8% YoY'}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="text-xs text-slate-400 font-semibold mb-1">
              {language === 'fa' ? 'دانشجویان فعال پلتفرم' : 'Active Global Learners'}
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {language === 'fa' ? `بیش از ${toPersianDigits('2.4')} میلیون` : '2.4M+'}
            </div>
            <div className="text-[11px] text-indigo-600 font-bold mt-1">
              {language === 'fa' ? 'سراسر استان‌ها و کشورهای فارسی‌زبان' : '160+ countries'}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="text-xs text-slate-400 font-semibold mb-1">
              {language === 'fa' ? 'در انتظار بررسی و تایید' : 'Pending Moderation'}
            </div>
            <div className="text-2xl font-extrabold text-amber-500">
              {toPersianDigits(pendingSubmissions.length)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {language === 'fa' ? 'میانگین زمان بررسی زیر ۲۴ ساعت' : 'SLA: under 24 hours'}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="text-xs text-slate-400 font-semibold mb-1">
              {language === 'fa' ? 'اساتید و منتورهای تایید شده' : 'Verified Mentors'}
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {toPersianDigits(instructors.length)}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1">
              {language === 'fa' ? '۱۰۰٪ احراز صلاحیت شده' : '100% Verified'}
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'moderation'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {language === 'fa' 
              ? `صف بررسی کیفی دوره‌ها (${toPersianDigits(pendingSubmissions.length)})` 
              : `Course Review Queue (${pendingSubmissions.length})`}
          </button>
          <button
            onClick={() => setActiveTab('instructors')}
            className={`px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'instructors'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {language === 'fa' 
              ? `فهرست اساتید و منتورها (${toPersianDigits(instructors.length)})` 
              : `Instructor Directory (${instructors.length})`}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'moderation' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 font-bold text-xs text-slate-400 uppercase tracking-wider">
              {language === 'fa' ? 'دوره‌های ارسالی جدید برای تایید' : 'Pending Submissions'}
            </div>
            {pendingSubmissions.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingSubmissions.map(sub => (
                  <div key={sub.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                        {sub.category}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                        {sub.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {language === 'fa' 
                          ? `مدرس: ${sub.instructorName} • شهریه دوره: ${sub.price} • زمان ارسال: ${sub.submittedAt}` 
                          : `By ${sub.instructorName} • Pricing: ${sub.price} • Submitted ${sub.submittedAt}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(sub.id, sub.title)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                      >
                        {language === 'fa' ? 'درخواست ویرایش' : 'Request Changes'}
                      </button>
                      <button
                        onClick={() => handleApprove(sub.id, sub.title)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
                      >
                        {language === 'fa' ? 'تایید و انتشار رسمی' : 'Approve & Publish'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-500">
                {language === 'fa'
                  ? 'تمامی دوره‌های ارسالی بررسی شده‌اند. صف بررسی در وضعیت بهینه است.'
                  : 'All course submissions have been reviewed and approved.'}
              </div>
            )}
          </div>
        )}

        {activeTab === 'instructors' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 font-bold text-xs text-slate-400 uppercase tracking-wider">
              {language === 'fa' ? 'پروفایل اساتید تایید صلاحیت شده' : 'Verified Instructor Profiles'}
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {instructors.map(inst => (
                <div key={inst.id} className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={inst.avatar} alt={inst.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{inst.name}</span>
                        {inst.isVerified && (
                          <span className="text-indigo-600 text-[11px] font-semibold">
                            ✓ {language === 'fa' ? 'احراز شده' : 'Verified'}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{inst.title}</div>
                    </div>
                  </div>
                  <div className="text-end text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {toPersianDigits(inst.studentCount)} دانشجو
                    </div>
                    <div className="text-[11px] text-slate-400">★ {toPersianDigits(inst.rating.toFixed(1))}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
