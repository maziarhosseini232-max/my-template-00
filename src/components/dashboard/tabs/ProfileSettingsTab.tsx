import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  User, Mail, Phone, Briefcase, FileText, Lock, 
  CheckCircle2, AlertCircle, Save, ShieldCheck, KeyRound, Sparkles, Image as ImageIcon,
  Landmark, CreditCard
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop'
];

export const ProfileSettingsTab: React.FC = () => {
  const { currentUser, updateUserProfile, changeUserPassword, addToast } = useApp();

  // Profile Form state
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [headline, setHeadline] = useState(currentUser.headline || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [shebaNumber, setShebaNumber] = useState(currentUser.shebaNumber || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast({
        title: 'خطا در ثبت نام',
        message: 'نام و نام خانوادگی نمی‌تواند خالی باشد.',
        type: 'error'
      });
      return;
    }

    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      headline: headline.trim(),
      bio: bio.trim(),
      avatar: avatar.trim(),
      shebaNumber: shebaNumber.trim()
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    if (!currentPassword) {
      setPassError('لطفاً کلمه عبور فعلی را وارد نمایید.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('کلمه عبور جدید باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('تکرار کلمه عبور جدید مطابقت ندارد.');
      return;
    }

    const res = await changeUserPassword(currentPassword, newPassword);
    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPassError(res.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Details Card */}
      <div className="bg-white dark:bg-[#08242d] rounded-3xl border border-teal-100 dark:border-teal-900/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 pb-6 border-b border-teal-100/60 dark:border-teal-900/60">
          <div className="w-10 h-10 rounded-2xl bg-[#def4ee] dark:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4] flex items-center justify-center font-black">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              مشخصات حساب کاربری و اطلاعات فردی
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ویرایش نام، بیوگرافی، اطلاعات تماس و تصویر آواتار در پلتفرم
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="mt-6 space-y-6">
          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
              تصویر آواتار پروفایل
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <img
                  src={avatar || currentUser.avatar}
                  alt={name}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#0d9488]/20 shadow-md"
                />
                <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-[#0d9488] text-white text-[9px] font-bold shadow-xs">
                  فعلی
                </span>
              </div>

              <div className="flex-1 min-w-[240px]">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  یکی از تصاویر پیش‌فرض را انتخاب کنید یا لینک تصویر دلخواه خود را وارد نمایید:
                </p>
                <div className="flex items-center gap-2 mb-2">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        avatar === url ? 'border-[#0d9488] scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="Preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="یا آدرس اینترنتی تصویر خود را وارد کنید..."
                    value={customAvatarUrl}
                    onChange={e => setCustomAvatarUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-800 dark:text-white"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customAvatarUrl.trim()) setAvatar(customAvatarUrl.trim());
                    }}
                    className="px-3 py-1.5 bg-[#def4ee] dark:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4] text-xs font-bold rounded-xl hover:bg-[#def4ee]/80"
                  >
                    اعمال
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Name & Headline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                نام و نام خانوادگی <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="نام کامل خود را وارد کنید"
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#0d9488]"
                />
                <User size={16} className="absolute right-3.5 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                عنوان و تخصص شغلی (Headline)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  placeholder="مثال: طراح ارشد رابط کاربری و فرانت‌اند"
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0d9488]"
                />
                <Briefcase size={16} className="absolute right-3.5 top-3 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                آدرس ایمیل
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0d9488]"
                  dir="ltr"
                />
                <Mail size={16} className="absolute right-3.5 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                شماره موبایل
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0d9488]"
                  dir="ltr"
                />
                <Phone size={16} className="absolute right-3.5 top-3 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              درباره من / بیوگرافی
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="توضیحی کوتاه درباره علایق، تجربیات کاری و اهداف یادگیری خود بنویسید..."
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-[#0d9488]"
              />
              <FileText size={16} className="absolute right-3.5 top-3 text-slate-400" />
            </div>
          </div>

          {/* Sheba / IBAN for Settlements */}
          <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100/80 dark:border-teal-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Landmark size={16} className="text-[#0d9488]" />
                <span>شماره شبا بانکی (IBAN) جهت تسویه‌حساب</span>
              </label>
              <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">مخصوص مدرسین و تسویه درآمد</span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-mono font-bold text-slate-400 dark:text-slate-500 select-none">
                IR
              </span>
              <input
                type="text"
                value={shebaNumber}
                onChange={e => {
                  // Keep only digits and up to 24 chars
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 24);
                  setShebaNumber(val);
                }}
                placeholder="000000000000000000000000"
                maxLength={24}
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0d9488] tracking-wider"
                dir="ltr"
              />
              <CreditCard size={16} className="absolute right-3.5 top-3 text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              شماره ۲۴ رقمی شبا بدون IR. این شماره برای واریز درآمدهای حاصل از فروش دوره‌ها و حق‌التدریس مورد استفاده قرار می‌گیرد.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save size={15} />
              <span>ذخیره تغییرات مشخصات</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & Change Password Card */}
      <div className="bg-white dark:bg-[#08242d] rounded-3xl border border-teal-100 dark:border-teal-900/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 pb-6 border-b border-teal-100/60 dark:border-teal-900/60">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
            <KeyRound size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              امنیت و تغییر کلمه عبور
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              برای افزایش امنیت حساب، رمز عبور خود را به‌صورت دوره‌ای به‌روزرسانی فرمایید
            </p>
          </div>
        </div>

        {passError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{passError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="mt-6 space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              کلمه عبور فعلی <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="رمز عبور فعلی"
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0d9488]"
                dir="ltr"
              />
              <Lock size={16} className="absolute right-3.5 top-3 text-slate-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                کلمه عبور جدید <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="حداقل ۶ کاراکتر"
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0d9488]"
                  dir="ltr"
                />
                <Lock size={16} className="absolute right-3.5 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                تکرار کلمه عبور جدید <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="تکرار رمز جدید"
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0d9488]"
                  dir="ltr"
                />
                <Lock size={16} className="absolute right-3.5 top-3 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex justify-start pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={15} />
              <span>به‌روزرسانی رمز عبور</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
