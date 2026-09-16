import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, Mail, Lock, User as UserIcon, Phone, Eye, EyeOff, 
  Sparkles, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, LogIn 
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    authModalTab, 
    setAuthModalTab, 
    login, 
    registerUser, 
    loginAsDemo, 
    addToast,
    currentUser
  } = useApp();

  const isActualAdmin = currentUser && (currentUser.roles?.some(r => r === 'ADMIN' || r === 'OWNER') || (currentUser.role === 'admin' && (!currentUser.roles || currentUser.roles.length === 0)));

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Error & loading state
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginEmail.trim()) {
      setErrorMsg('لطفاً ایمیل یا شماره موبایل خود را وارد کنید.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('لطفاً کلمه عبور خود را وارد کنید.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regName.trim()) {
      setErrorMsg('لطفاً نام و نام خانوادگی خود را وارد کنید.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMsg('لطفاً یک آدرس ایمیل معتبر وارد کنید.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('کلمه عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('تکرار کلمه عبور با کلمه عبور وارد شده همخوانی ندارد.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('لطفاً قوانین و مقررات پلتفرم را تایید فرمایید.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerUser({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword
      });

      if (!res.success) {
        setErrorMsg(res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (type: 'admin' | 'student') => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await loginAsDemo(type);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setErrorMsg('لطفاً ایمیل معتبر وارد نمایید.');
      return;
    }
    setForgotSubmitted(true);
    addToast({
      title: 'لینک بازیابی ارسال شد',
      message: `لینک بازنشانی کلمه عبور به ایمیل ${forgotEmail} ارسال گردید.`,
      type: 'success'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#08242d] rounded-3xl border border-teal-100 dark:border-teal-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-teal-100/80 dark:border-teal-900/80 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#def4ee] dark:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4] flex items-center justify-center font-black">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {authModalTab === 'login' && 'ورود به حساب کاربری'}
                {authModalTab === 'register' && 'ثبت‌نام و عضویت سریع'}
                {authModalTab === 'forgot' && 'بازیابی کلمه عبور'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                پلتفرم تخصصی دوره‌های آموزشی لومینا لرن
              </p>
            </div>
          </div>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher (if not in forgot mode) */}
        {authModalTab !== 'forgot' && (
          <div className="p-3 bg-teal-50/40 dark:bg-[#061d24] border-b border-teal-100/60 dark:border-teal-900/60 flex items-center gap-2">
            <button
              onClick={() => { setAuthModalTab('login'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                authModalTab === 'login'
                  ? 'bg-white dark:bg-[#0b2e38] text-[#0d9488] dark:text-[#5eead4] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ورود به حساب
            </button>
            <button
              onClick={() => { setAuthModalTab('register'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                authModalTab === 'register'
                  ? 'bg-white dark:bg-[#0b2e38] text-[#0d9488] dark:text-[#5eead4] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ثبت‌نام کاربر جدید
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* LOGIN TAB */}
          {authModalTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  ایمیل یا شماره موبایل
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="مثال: maziarhosseini232@gmail.com یا ۰۹۱۲۳۴۵۶۷۸۹"
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0d9488]"
                    dir="ltr"
                  />
                  <Mail size={16} className="absolute right-3.5 top-3 text-slate-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    کلمه عبور
                  </label>
                  <button
                    type="button"
                    onClick={() => { setAuthModalTab('forgot'); setErrorMsg(''); }}
                    className="text-[11px] font-medium text-[#0d9488] dark:text-[#5eead4] hover:underline"
                  >
                    فراموشی رمز عبور؟
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0d9488]"
                    dir="ltr"
                  />
                  <Lock size={16} className="absolute right-3.5 top-3 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute left-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-[#0d9488] focus:ring-[#0d9488] accent-[#0d9488]"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">مرا به خاطر بسپار</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#0d9488] hover:bg-[#0f766e] disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <LogIn size={15} />
                )}
                <span>{isSubmitting ? 'در حال برقراری ارتباط...' : 'ورود به حساب کاربری'}</span>
              </button>

              {/* Quick Admin Access Box (Visible ONLY for ADMIN / OWNER) */}
              {isActualAdmin && (
                <div className="mt-6 pt-5 border-t border-teal-100 dark:border-teal-900">
                  <p className="text-[11px] font-bold text-slate-400 text-center mb-3">
                    ⚡ ورود مستقیم مدیر سیستم
                  </p>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleDemoLogin('admin')}
                    className="w-full p-2.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-[#def4ee]/60 dark:bg-[#0b2f3a]/60 hover:bg-[#def4ee] dark:hover:bg-[#0b2f3a] disabled:opacity-50 text-start transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-[#0d9488] dark:text-[#5eead4]" />
                      <span className="text-xs font-bold text-[#06242e] dark:text-white">ورود با حساب مدیر ارشد (admin@lumina.com)</span>
                    </div>
                    <span className="text-[10px] text-teal-700 dark:text-teal-300 font-mono">123456</span>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* REGISTER TAB */}
          {authModalTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  نام و نام خانوادگی <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="مثال: علی احمدی"
                    className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0d9488]"
                  />
                  <UserIcon size={16} className="absolute right-3.5 top-2.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  آدرس ایمیل <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0d9488]"
                    dir="ltr"
                  />
                  <Mail size={16} className="absolute right-3.5 top-2.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  شماره موبایل (اختیاری)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0d9488]"
                    dir="ltr"
                  />
                  <Phone size={16} className="absolute right-3.5 top-2.5 text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    کلمه عبور <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="حداقل ۶ کاراکتر"
                      className="w-full pl-8 pr-9 py-2 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0d9488]"
                      dir="ltr"
                    />
                    <Lock size={15} className="absolute right-3 top-2.5 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute left-2.5 top-2.5 text-slate-400"
                    >
                      {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    تکرار کلمه عبور <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      placeholder="تکرار رمز عبور"
                      className="w-full pl-3 pr-9 py-2 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0d9488]"
                      dir="ltr"
                    />
                    <Lock size={15} className="absolute right-3 top-2.5 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={e => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded-sm text-[#0d9488] focus:ring-[#0d9488] accent-[#0d9488]"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    با عضویت در لومینا لرن، کلیه قوانین، شرایط استفاده و حریم خصوصی را می‌پذیرم.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#0d9488] hover:bg-[#0f766e] disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                <span>{isSubmitting ? 'در حال ثبت‌نام و ایجاد حساب...' : 'ثبت‌نام و ورود به پنل'}</span>
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD TAB */}
          {authModalTab === 'forgot' && (
            <div className="space-y-4">
              {forgotSubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">ایمیل ارسال شد!</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    دستورالعمل بازیابی کلمه عبور به ایمیل شما ارسال گردید. لطفاً صندوق ورودی یا هرزنامه خود را بررسی فرمایید.
                  </p>
                  <button
                    onClick={() => { setAuthModalTab('login'); setForgotSubmitted(false); }}
                    className="mt-4 px-4 py-2 bg-[#def4ee] dark:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4] text-xs font-bold rounded-xl"
                  >
                    بازگشت به فرم ورود
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    ایمیل حساب کاربری خود را وارد کنید تا لینک بازنشانی رمز عبور برای شما ارسال شود.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      آدرس ایمیل
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-[#061d24] border border-teal-100 dark:border-teal-900 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0d9488]"
                        dir="ltr"
                      />
                      <Mail size={16} className="absolute right-3.5 top-3 text-slate-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>ارسال لینک بازنشانی کلمه عبور</span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthModalTab('login')}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      انصراف و بازگشت به ورود
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
