import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Users, BookOpen, DollarSign, TrendingUp, Sparkles, Filter,
  GraduationCap, Check, X, ShieldAlert, PlusCircle, ArrowLeft, Mail, Phone, Clock,
  ShoppingBag, Tag, Palette, Crown
} from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';
import { AdminOrdersTab } from './AdminOrdersTab';
import { AdminSubscriptionsTab } from './AdminSubscriptionsTab';
import { AdminCouponsTab } from './AdminCouponsTab';
import { AdminPricingTab } from './AdminPricingTab';
import { AdminCustomizationTab } from './AdminCustomizationTab';

export const AdminDashboard: React.FC = () => {
  const { 
    instructors, 
    instructorApplications, 
    reviewInstructorApplication,
    userRole,
    setUserRole,
    currentUser,
    navigate,
    addToast, 
    t, 
    language 
  } = useApp();

  const isActualAdmin = Boolean(
    currentUser &&
    (currentUser.roles?.some(r => r === 'ADMIN' || r === 'OWNER') ||
     (currentUser.role === 'admin' && (!currentUser.roles || currentUser.roles.length === 0)))
  );

  const [activeTab, setActiveTab] = useState<'orders' | 'subscriptions' | 'pricing' | 'coupons' | 'customization' | 'applications' | 'moderation' | 'instructors'>('orders');
  
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

  useEffect(() => {
    if (!isActualAdmin) {
      navigate('home');
    }
  }, [isActualAdmin, navigate]);

  if (!isActualAdmin) {
    return null;
  }

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

  const handleApproveApplicant = (appId: string, applicantName: string) => {
    reviewInstructorApplication(appId, 'approved', 'درخواست شما با موفقیت تایید گردید. به جمع اساتید لومینا لرن خوش آمدید.');
    addToast({
      title: 'درخواست تایید شد',
      message: `درخواست تدریس ${applicantName} مورد تایید قرار گرفت.`,
      type: 'success'
    });
  };

  const handleRejectApplicant = (appId: string, applicantName: string) => {
    reviewInstructorApplication(appId, 'rejected', 'با تشکر از درخواست شما، در حال حاضر امکان همکاری مقدور نمی‌باشد.');
    addToast({
      title: 'درخواست رد شد',
      message: `درخواست ${applicantName} رد شد.`,
      type: 'info'
    });
  };

  const pendingApps = instructorApplications.filter(a => a.status === 'pending');

  return (
    <div className="py-10 bg-slate-50/50 dark:bg-slate-950/60 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#def4ee] dark:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4] text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck size={13} />
              <span>پنل اختصاصی مدیریت و صاحب وب‌سایت</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              استودیو جامع مدیریت لومینا لرن
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              مدیریت و ایجاد دوره‌ها، ارزیابی متقاضیان تدریس، نظارت بر سلامت آموزش و تنظیمات پلتفرم.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('instructor')}
              className="px-4 py-2.5 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>ایجاد دوره جدید در استودیو</span>
            </button>
          </div>
        </div>

        {/* High-level Platform Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#08242d] border border-teal-100 dark:border-teal-900 shadow-2xs">
            <div className="text-xs text-slate-400 font-semibold mb-1">
              متقاضیان تدریس در انتظار
            </div>
            <div className="text-2xl font-extrabold text-[#0d9488] dark:text-[#5eead4]">
              {toPersianDigits(pendingApps.length)} درخواست
            </div>
            <div className="text-[11px] text-teal-600 font-bold mt-1">
              آماده بررسی و اعتبارسنجی
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#08242d] border border-teal-100 dark:border-teal-900 shadow-2xs">
            <div className="text-xs text-slate-400 font-semibold mb-1">
              دانشجویان فعال پلتفرم
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              بیش از {toPersianDigits('2.4')} میلیون
            </div>
            <div className="text-[11px] text-teal-600 font-bold mt-1">
              سراسر ایران و کشورهای فارسی‌زبان
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#08242d] border border-teal-100 dark:border-teal-900 shadow-2xs">
            <div className="text-xs text-slate-400 font-semibold mb-1">
              دوره‌های در انتظار انتشار
            </div>
            <div className="text-2xl font-extrabold text-amber-500">
              {toPersianDigits(pendingSubmissions.length)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              کنترل کیفی محتوا
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#08242d] border border-teal-100 dark:border-teal-900 shadow-2xs">
            <div className="text-xs text-slate-400 font-semibold mb-1">
              اساتید و منتورهای رسمی
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {toPersianDigits(instructors.length)}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1">
              ۱۰۰٪ احراز صلاحیت شده
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 sm:gap-2 border-b border-teal-100 dark:border-teal-900 mb-6 text-xs font-bold overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-[#0d9488] text-[#0d9488] dark:text-[#5eead4]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShoppingBag size={14} />
            <span>سفارش‌ها و تراکنش‌ها</span>
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-3.5 py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'subscriptions'
                ? 'border-[#0d9488] text-[#0d9488] dark:text-[#5eead4]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Crown size={14} />
            <span>مدیریت اشتراک‌ها</span>
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-3.5 py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pricing'
                ? 'border-[#0d9488] text-[#0d9488] dark:text-[#5eead4]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <DollarSign size={14} />
            <span>قیمت‌گذاری دوره‌ها (Free/Paid)</span>
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-3.5 py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'coupons'
                ? 'border-[#0d9488] text-[#0d9488] dark:text-[#5eead4]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Tag size={14} />
            <span>کدهای تخفیف</span>
          </button>
          <button
            onClick={() => setActiveTab('customization')}
            className={`px-3.5 py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'customization'
                ? 'border-[#0d9488] text-[#0d9488] dark:text-[#5eead4]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Palette size={14} />
            <span>سفارشی‌سازی بدون کد ظاهر</span>
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3.5 py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'applications'
                ? 'border-[#0d9488] text-[#0d9488] dark:text-[#5eead4]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            درخواست‌های اساتید ({toPersianDigits(instructorApplications.length)})
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-3.5 py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'moderation'
                ? 'border-[#0d9488] text-[#0d9488] dark:text-[#5eead4]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            صف بررسی ({toPersianDigits(pendingSubmissions.length)})
          </button>
          <button
            onClick={() => setActiveTab('instructors')}
            className={`px-3.5 py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'instructors'
                ? 'border-[#0d9488] text-[#0d9488] dark:text-[#5eead4]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            اساتید ({toPersianDigits(instructors.length)})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'orders' && <AdminOrdersTab />}
        {activeTab === 'subscriptions' && <AdminSubscriptionsTab />}
        {activeTab === 'pricing' && <AdminPricingTab />}
        {activeTab === 'coupons' && <AdminCouponsTab />}
        {activeTab === 'customization' && <AdminCustomizationTab />}
        {activeTab === 'applications' && (
          <div className="bg-white dark:bg-[#08242d] rounded-3xl border border-teal-100 dark:border-teal-900 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-teal-100/60 dark:border-teal-900/60 font-bold text-xs text-slate-400 uppercase tracking-wider">
              درخواست‌های ارسال شده توسط کاربران جهت پیوستن به کادر اساتید
            </div>

            {instructorApplications.length > 0 ? (
              <div className="divide-y divide-teal-100/60 dark:divide-teal-900/60">
                {instructorApplications.map(app => (
                  <div key={app.id} className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {app.fullName}
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            app.status === 'pending'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : app.status === 'approved'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}>
                            {app.status === 'pending' ? 'در انتظار بررسی' : app.status === 'approved' ? 'تایید شده' : 'رد شده'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-4">
                          <span className="flex items-center gap-1"><Mail size={13} /> {app.email}</span>
                          <span className="flex items-center gap-1"><Phone size={13} /> {app.phoneNumber}</span>
                          <span className="flex items-center gap-1"><Clock size={13} /> {app.submittedAt}</span>
                        </div>
                      </div>

                      {app.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRejectApplicant(app.id, app.fullName)}
                            className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                          >
                            عدم تایید
                          </button>
                          <button
                            onClick={() => handleApproveApplicant(app.id, app.fullName)}
                            className="px-4 py-1.5 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            تایید درخواست تدریس
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-teal-50/40 dark:bg-[#061d24] p-4 rounded-2xl text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold block mb-1">حوزه تخصصی و موضوع دوره پیشنهادی:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold">{app.expertiseArea} - {app.proposedCourseTitle}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block mb-1">سوابق کاری و تدریس:</span>
                        <span className="text-slate-800 dark:text-slate-200">{app.bio}</span>
                      </div>
                      {app.portfolioUrl && (
                        <div className="md:col-span-2">
                          <span className="text-slate-400 font-semibold block mb-1">لینک نمونه کار / رزومه:</span>
                          <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-[#0d9488] hover:underline" dir="ltr">
                            {app.portfolioUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-500">
                در حال حاضر درخواست تدریس جدیدی در سامانه ثبت نشده است.
              </div>
            )}
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="bg-white dark:bg-[#08242d] rounded-3xl border border-teal-100 dark:border-teal-900 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-teal-100/60 dark:border-teal-900/60 font-bold text-xs text-slate-400 uppercase tracking-wider">
              {language === 'fa' ? 'دوره‌های ارسالی جدید برای تایید' : 'Pending Submissions'}
            </div>
            {pendingSubmissions.length > 0 ? (
              <div className="divide-y divide-teal-100/60 dark:divide-teal-900/60">
                {pendingSubmissions.map(sub => (
                  <div key={sub.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-[#0d9488] dark:text-[#5eead4] bg-[#def4ee] dark:bg-[#0e3b47] px-2 py-0.5 rounded">
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
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                      >
                        {language === 'fa' ? 'درخواست ویرایش' : 'Request Changes'}
                      </button>
                      <button
                        onClick={() => handleApprove(sub.id, sub.title)}
                        className="px-4 py-1.5 rounded-xl bg-[#0d9488] text-white text-xs font-bold hover:bg-[#0f766e] shadow-xs cursor-pointer"
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
          <div className="bg-white dark:bg-[#08242d] rounded-3xl border border-teal-100 dark:border-teal-900 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-teal-100/60 dark:border-teal-900/60 font-bold text-xs text-slate-400 uppercase tracking-wider">
              {language === 'fa' ? 'پروفایل اساتید تایید صلاحیت شده' : 'Verified Instructor Profiles'}
            </div>
            <div className="divide-y divide-teal-100/60 dark:divide-teal-900/60">
              {instructors.map(inst => (
                <div key={inst.id} className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={inst.avatar} alt={inst.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{inst.name}</span>
                        {inst.isVerified && (
                          <span className="text-[#0d9488] dark:text-[#5eead4] text-[11px] font-semibold">
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

