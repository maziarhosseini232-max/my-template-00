import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, 
  CheckCircle2, RefreshCw, ArrowLeft, Terminal, ShieldAlert 
} from 'lucide-react';
import { toLatinDigits } from '../../utils/persian';

export const AdminLoginPage: React.FC = () => {
  const { login, logout, navigate, isLoggedIn, currentUser, addToast } = useApp();

  const isActualAdmin = Boolean(
    isLoggedIn && currentUser &&
    (currentUser.roles?.some(r => r === 'ADMIN' || r === 'OWNER') ||
     (currentUser.role === 'admin' && (!currentUser.roles || currentUser.roles.length === 0)))
  );

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Security verification captcha
  const [captchaCode, setCaptchaCode] = useState('8419');
  const [captchaInput, setCaptchaInput] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  // Generate random 4-digit security code
  const refreshCaptcha = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptchaCode(code);
    setCaptchaInput('');
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  // If already authenticated as actual admin, provide direct link or auto-navigate
  useEffect(() => {
    if (isLoggedIn && isActualAdmin && !authSuccess) {
      // Admin is already signed in
    }
  }, [isLoggedIn, isActualAdmin, authSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!emailOrUsername.trim()) {
      setErrorMsg('لطفاً شناسه کاربری یا ایمیل مدیر را وارد فرمایید.');
      return;
    }
    if (!password) {
      setErrorMsg('لطفاً رمز عبور امنیتی را وارد فرمایید.');
      return;
    }
    if (toLatinDigits(captchaInput.trim()) !== captchaCode) {
      setErrorMsg('کد امنیتی ۴ رقمی نامعتبر است. لطفاً مجدداً امتحان کنید.');
      refreshCaptcha();
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login(emailOrUsername.trim(), password);

      if (!res.success) {
        setErrorMsg(res.message || 'اطلاعات اعتبارسنجی مدیر نامعتبر است.');
        refreshCaptcha();
        setIsSubmitting(false);
        return;
      }

      // Check current user role after login
      // Small timeout to allow state to settle
      setTimeout(() => {
        const storedUser = localStorage.getItem('lumina_user');
        let parsedUser: any = null;
        try {
          parsedUser = storedUser ? JSON.parse(storedUser) : null;
        } catch (e) {
          parsedUser = null;
        }

        const isAdmin = Boolean(
          parsedUser &&
          (parsedUser.roles?.some((r: string) => r === 'ADMIN' || r === 'OWNER') ||
           (parsedUser.role === 'admin' && (!parsedUser.roles || parsedUser.roles.length === 0)))
        );

        if (!isAdmin) {
          // Reject non-admin logins immediately
          logout();
          setErrorMsg('⛔ دسترسی مسدود شد: این حساب کاربری فاقد سطح دسترسی سرپرستی (ADMIN / OWNER) است.');
          refreshCaptcha();
          setIsSubmitting(false);
        } else {
          setAuthSuccess(true);
          setIsSubmitting(false);
          addToast({
            title: 'احراز هویت مدیر تایید شد 🛡️',
            message: 'خوش آمدید. در حال انتقال به استودیو مدیریت دوره‌ها...',
            type: 'success'
          });
          setTimeout(() => {
            navigate('admin');
          }, 600);
        }
      }, 150);

    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ارتباط با سرور امنیتی احراز هویت.');
      refreshCaptcha();
      setIsSubmitting(false);
    }
  };

  // Quick preset for easy demonstration
  const handleFillDemoAdmin = () => {
    setEmailOrUsername('admin@lumina.com');
    setPassword('123456');
    setCaptchaInput(captchaCode);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#020b10] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-['Vazirmatn',sans-serif]" dir="rtl">
      
      {/* High-security background ambient glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Subtle security matrix grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#5eead4 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} 
      />

      <div className="w-full max-w-md relative z-10">
        
        {/* Security Header Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-800/80 text-teal-400 text-[11px] font-mono mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <Terminal size={13} />
            <span dir="ltr">CONFIDENTIAL ACCESS • PORTAL 256-BIT</span>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-teal-900/60 to-[#05242c] border border-teal-700/50 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-teal-950/50">
            <ShieldCheck size={34} className="text-[#2dd4bf]" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            درگاه امنیتی مدیریت سیستم
          </h1>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
            ورود اختصاصی مدیران ارشد و مالکین سامانه لومینا لرن
          </p>
        </div>

        {/* Already logged in as admin notification */}
        {isLoggedIn && isActualAdmin && !authSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-teal-950/70 border border-teal-800/80 text-xs text-teal-200 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-teal-400 shrink-0" />
              <span>نشست کاری شما با عنوان مدیر ارشد فعال است ({currentUser.name}).</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('admin')}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>ورود مستقیم به استودیو مدیریت</span>
              <ArrowLeft size={14} />
            </button>
          </div>
        )}

        {/* Main Secure Login Box */}
        <div className="bg-[#04161d]/90 backdrop-blur-xl border border-teal-900/70 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {authSuccess && (
            <div className="mb-5 p-3.5 rounded-xl bg-teal-950/70 border border-teal-700/80 text-teal-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 size={16} className="shrink-0 text-teal-400" />
              <span>احراز هویت موفقیت‌آمیز بود. در حال بارگذاری استودیو...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email / Username field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                شناسه امنیتی یا ایمیل مدیر <span className="text-teal-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={e => setEmailOrUsername(e.target.value)}
                  placeholder="admin@lumina.com یا شناسه مدیر"
                  className="w-full pl-3 pr-10 py-2.5 bg-[#020d12] border border-teal-950 focus:border-teal-500 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-teal-500 transition-all font-mono"
                  dir="ltr"
                  autoComplete="username"
                  required
                />
                <Mail size={16} className="absolute right-3.5 top-3 text-slate-500" />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                کلمه عبور دسترسی ویژه <span className="text-teal-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#020d12] border border-teal-950 focus:border-teal-500 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-teal-500 transition-all font-mono"
                  dir="ltr"
                  autoComplete="current-password"
                  required
                />
                <Lock size={16} className="absolute right-3.5 top-3 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-3 text-slate-500 hover:text-teal-400 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Security Verification Code (CAPTCHA) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                کد اعتبارسنجی امنیتی <span className="text-teal-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={captchaInput}
                  onChange={e => setCaptchaInput(e.target.value)}
                  placeholder="کد ۴ رقمی روبرو"
                  className="flex-1 px-3 py-2.5 bg-[#020d12] border border-teal-950 focus:border-teal-500 rounded-xl text-xs text-white text-center font-mono tracking-widest placeholder:text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                  dir="ltr"
                  required
                />
                <div 
                  className="px-4 py-2 bg-teal-950/90 border border-teal-800/80 rounded-xl font-mono text-sm font-black text-teal-300 tracking-widest select-none flex items-center justify-center min-w-[75px]"
                  dir="ltr"
                >
                  {captchaCode}
                </div>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="p-2.5 rounded-xl bg-slate-900 border border-teal-950 hover:border-teal-800 text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
                  title="تغییر کد امنیتی"
                >
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-teal-600 bg-slate-900 border-teal-900 focus:ring-teal-500 accent-teal-500"
                />
                <span className="text-[11px] text-slate-400 font-medium">ذخیره توکن امنیتی در مرورگر</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || authSuccess}
              className="w-full mt-3 py-3 px-4 bg-gradient-to-l from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-teal-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <ShieldCheck size={16} />
              )}
              <span>{isSubmitting ? 'در حال تایید هویت و کلید امنیتی...' : 'تایید هویت و ورود به پنل مدیریت'}</span>
            </button>
          </form>

          {/* Quick Preset Helper for testing */}
          <div className="mt-6 pt-4 border-t border-teal-950/80 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">حساب دارای سطح دسترسی ارشد:</span>
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="text-[10px] font-mono text-teal-400 hover:text-teal-300 underline underline-offset-4 cursor-pointer"
            >
              پر کردن اطلاعات مدیر (تست)
            </button>
          </div>

        </div>

        {/* Quiet footer return link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <span>بازگشت به پرتال اصلی وب‌سایت</span>
            <ArrowLeft size={13} />
          </button>
        </div>

        {/* Security Notice */}
        <p className="text-[10px] text-slate-600 text-center mt-6 leading-relaxed">
          کلیه فعالیت‌ها، ورودها و تلاش‌های احراز هویت در این درگاه ثبت و رمزنگاری می‌شوند. هرگونه دسترسی غیرمجاز پیگرد قانونی دارد.
        </p>

      </div>
    </div>
  );
};
