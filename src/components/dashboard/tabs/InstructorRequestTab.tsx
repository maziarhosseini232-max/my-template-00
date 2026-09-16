import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  GraduationCap, Send, ShieldAlert, CheckCircle2, 
  Clock, AlertCircle, FileSpreadsheet, Sparkles, BookOpen, ExternalLink 
} from 'lucide-react';

export const InstructorRequestTab: React.FC = () => {
  const { currentUser, instructorApplications, submitInstructorApplication, isInstructorRegistrationEnabled } = useApp();

  const [expertise, setExpertise] = useState('');
  const [experienceYears, setExperienceYears] = useState('۳ تا ۵ سال');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [sampleUrl, setSampleUrl] = useState('');
  const [proposedTopic, setProposedTopic] = useState('');
  const [bio, setBio] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Filter applications submitted by the current user
  const userApps = instructorApplications.filter(app => app.userId === currentUser.id || app.userEmail === currentUser.email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!expertise.trim()) {
      setFormError('لطفاً حوزه تخصصی تدریس خود را وارد کنید.');
      return;
    }
    if (!phone.trim()) {
      setFormError('لطفاً شماره تماس معتبر جهت هماهنگی را وارد کنید.');
      return;
    }
    if (!proposedTopic.trim()) {
      setFormError('لطفاً عنوان دوره یا سرفصل پیشنهادی خود را وارد کنید.');
      return;
    }
    if (!bio.trim()) {
      setFormError('لطفاً شرح مختصری از سوابق و تجربه کاری خود بنویسید.');
      return;
    }

    const res = submitInstructorApplication({
      expertise: expertise.trim(),
      experienceYears,
      phone: phone.trim(),
      sampleUrl: sampleUrl.trim(),
      proposedTopic: proposedTopic.trim(),
      bio: bio.trim()
    });

    if (res.success) {
      setSubmittedSuccess(true);
      setExpertise('');
      setProposedTopic('');
      setSampleUrl('');
      setBio('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Notice Banner about Course Publishing Policy */}
      <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 dark:border-amber-500/30">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              اطلاعیه اختصاصی ایجاد دوره در پلتفرم لومینا لرن
            </h3>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              در حال حاضر، امکان بارگذاری، تعریف قیمت و انتشار مستقیم دوره‌های آموزشی صرفاً در اختیار 
              <strong className="mx-1 font-extrabold text-amber-950 dark:text-amber-100">مدیریت ارشد و صاحب سایت</strong>
              قرار دارد. اگر شما نیز تمایل دارید دوره‌ای تخصصی ضبط و در لومینا لرن منتشر کنید، فرم درخواست همکاری زیر را تکمیل نمایید تا سرفصل و رزومه شما توسط مدیریت بررسی و در صورت تایید، دسترسی به پنل مدرس برای شما فعال گردد.
            </p>
          </div>
        </div>
      </div>

      {/* Application Form or Disabled Message */}
      {!isInstructorRegistrationEnabled ? (
        <div className="bg-white dark:bg-[#08242d] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
            <ShieldAlert size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            ثبت‌نام مدرس جدید در حال حاضر غیرفعال است
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            امکان ارسال درخواست همکاری برای تدریس و ثبت‌نام اساتید جدید موقتاً توسط مدیریت سایت غیرفعال شده است. لطفاً در زمان دیگری مراجعه فرمایید.
          </p>
        </div>
      ) : (
      <div className="bg-white dark:bg-[#08242d] rounded-3xl border border-teal-100 dark:border-teal-900/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 pb-6 border-b border-teal-100/60 dark:border-teal-900/60">
          <div className="w-10 h-10 rounded-2xl bg-[#def4ee] dark:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4] flex items-center justify-center font-black">
            <GraduationCap size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              فرم درخواست پیوستن به جمع مدرسان لومینا لرن
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              سوابق، مهارت‌ها و سرفصل پیشنهادی خود را جهت بررسی تیم مدیریت ارسال کنید
            </p>
          </div>
        </div>

        {submittedSuccess && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 size={18} />
              <span>درخواست شما با موفقیت به مدیریت ارسال شد!</span>
            </div>
            <p className="leading-relaxed">
              تیم مدیریت لومینا لرن اطلاعات و سرفصل ارسالی شما را بررسی کرده و نتیجه از طریق بخش اعلان‌ها و تماس تلفنی به شما اعلام خواهد شد.
            </p>
          </div>
        )}

        {formError && (
          <div className="mt-6 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                حوزه تخصصی تدریس <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={expertise}
                onChange={e => setExpertise(e.target.value)}
                placeholder="مثال: توسعه هوش مصنوعی، طراحی UI/UX، فرانت‌اند"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0d9488]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                سابقه فعالیت کاری و تدریس
              </label>
              <select
                value={experienceYears}
                onChange={e => setExperienceYears(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0d9488]"
              >
                <option value="کمتر از ۱ سال">کمتر از ۱ سال</option>
                <option value="۱ تا ۳ سال">۱ تا ۳ سال</option>
                <option value="۳ تا ۵ سال">۳ تا ۵ سال</option>
                <option value="بیش از ۵ سال">بیش از ۵ سال سابقه تخصصی</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                شماره تماس مستقیم <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0d9488]"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                لینک رزومه، نمونه‌کار یا لینکدین (اختیاری)
              </label>
              <input
                type="url"
                value={sampleUrl}
                onChange={e => setSampleUrl(e.target.value)}
                placeholder="https://linkedin.com/in/... یا github.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0d9488]"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              عنوان و سرفصل‌های پیشنهادی دوره <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={proposedTopic}
              onChange={e => setProposedTopic(e.target.value)}
              placeholder="مثال: دوره جامع ساخت اپلیکیشن‌های هوش مصنوعی با LangChain و Next.js"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0d9488]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              معرفی کامل، سوابق آموزشی و پروژه‌های شاخص <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="شرح مختصری از سبک تدریس، مباحث کلیدی که قصد دارید آموزش دهید و تجربیات حرفه‌ای خود..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-[#0d9488]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send size={15} />
              <span>ارسال درخواست به مدیریت</span>
            </button>
          </div>
        </form>
      </div>
      )}

      {/* User's Previous Applications Status */}
      {userApps.length > 0 && (
        <div className="bg-white dark:bg-[#08242d] rounded-3xl border border-teal-100 dark:border-teal-900/80 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={16} className="text-[#0d9488]" />
            <span>تاریخچه درخواست‌های ارسالی شما</span>
          </h3>

          <div className="space-y-3">
            {userApps.map(app => (
              <div 
                key={app.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-[#061d24] border border-teal-100/60 dark:border-teal-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {app.proposedTopic || app.expertise}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      app.status === 'approved' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : app.status === 'reviewed'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : app.status === 'rejected'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {app.status === 'approved' && 'تایید شده'}
                      {app.status === 'reviewed' && 'در حال مصاحبه و بررسی'}
                      {app.status === 'rejected' && 'عدم تایید'}
                      {app.status === 'pending' && 'در صف بررسی مدیریت'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    تخصص: {app.expertise} | تاریخ ارسال: {app.submittedAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
