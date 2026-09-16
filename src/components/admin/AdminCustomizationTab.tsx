import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.js';
import { 
  Palette, Layout, Sliders, Sparkles, Check, 
  Save, RefreshCw, Globe, Type, Image as ImageIcon, Eye 
} from 'lucide-react';
import { SiteSetting } from '../../types/index.js';
import { api } from '../../services/api.js';

export const AdminCustomizationTab: React.FC = () => {
  const { addToast } = useApp();
  const [settings, setSettings] = useState<SiteSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [siteName, setSiteName] = useState('');
  const [siteNameEn, setSiteNameEn] = useState('');
  const [tagline, setTagline] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0d9488');
  const [secondaryColor, setSecondaryColor] = useState('#06242e');
  const [accentColor, setAccentColor] = useState('#f59e0b');
  const [borderRadius, setBorderRadius] = useState<'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'>('xl');
  const [buttonStyle, setButtonStyle] = useState<'solid' | 'outline' | 'soft' | 'gradient'>('solid');
  const [fontFamily, setFontFamily] = useState('Vazirmatn');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [copyrightText, setCopyrightText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [isInstructorRegistrationEnabled, setIsInstructorRegistrationEnabled] = useState(false);
  const [isAlacarteSaleEnabled, setIsAlacarteSaleEnabled] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.cms.getSettings();
      if (res.success && res.data) {
        const s = res.data;
        setSettings(s);
        setSiteName(s.siteName || '');
        setSiteNameEn(s.siteNameEn || '');
        setTagline(s.tagline || '');
        setPrimaryColor(s.primaryColor || '#0d9488');
        setSecondaryColor(s.secondaryColor || '#06242e');
        setAccentColor(s.accentColor || '#f59e0b');
        setBorderRadius(s.borderRadius || 'xl');
        setButtonStyle(s.buttonStyle || 'solid');
        setFontFamily(s.fontFamily || 'Vazirmatn');
        setContactEmail(s.contactEmail || '');
        setContactPhone(s.contactPhone || '');
        setCopyrightText(s.copyrightText || '');
        setFooterText(s.footerText || '');
        setIsInstructorRegistrationEnabled(Boolean(s.isInstructorRegistrationEnabled));
        setIsAlacarteSaleEnabled(Boolean(s.isAlacarteSaleEnabled));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: Partial<SiteSetting> = {
        siteName,
        siteNameEn,
        tagline,
        primaryColor,
        secondaryColor,
        accentColor,
        borderRadius,
        buttonStyle,
        fontFamily,
        contactEmail,
        contactPhone,
        copyrightText,
        footerText,
        isInstructorRegistrationEnabled,
        isAlacarteSaleEnabled
      };

      const res = await api.cms.updateSettings(payload);
      if (res.success && res.data) {
        setSettings(res.data);
        // Apply CSS custom variables live to the document
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--secondary-color', secondaryColor);
        addToast({
          title: 'تنظیمات بصری سایت با موفقیت اعمال شد! ✨',
          message: 'تغییرات رنگ، چیدمان و هویت برند به صورت بلادرنگ در کل پلتفرم فعال گردید.',
          type: 'success'
        });
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      addToast({
        title: 'خطا در ذخیره تنظیمات',
        message: 'امکان ذخیره تغییرات فراهم نشد.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400">
        <div className="inline-block w-6 h-6 border-2 border-[#0d9488] border-t-transparent rounded-full animate-spin mb-2"></div>
        <div>در حال بارگذاری تنظیمات بصری پلتفرم...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 text-xs max-w-5xl">
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#08242d] border border-teal-100 dark:border-teal-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Palette size={18} className="text-[#0d9488]" />
            <span>سفارشی‌سازی بدون کد ظاهر، استایل و برندینگ پلتفرم (No-Code Visual Customizer)</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            تغییر نام برند، رنگ‌های اختصاصی، رادیوس کارت‌ها و استایل دکمه‌ها بدون نیاز به برنامه‌نویسی.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <Save size={15} />
          <span>{isSaving ? 'در حال انتشار...' : 'ذخیره و انتشار تغییرات'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Controls (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brand Identity */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#08242d] border border-teal-100 dark:border-teal-900 shadow-2xs space-y-4">
            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-teal-100/60 dark:border-teal-900/60">
              <Globe size={15} className="text-[#0d9488]" />
              <span>هویت برند و عناوین پلتفرم</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">نام سایت (فارسی)</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={e => setSiteName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">نام انگلیسی برند</label>
                <input
                  type="text"
                  value={siteNameEn}
                  onChange={e => setSiteNameEn(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200">شعار اصلی و معرفی کوتاه</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Color Palette Customizer */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#08242d] border border-teal-100 dark:border-teal-900 shadow-2xs space-y-4">
            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-teal-100/60 dark:border-teal-900/60">
              <Palette size={15} className="text-[#0d9488]" />
              <span>پالت رنگی اختصاصی (Dynamic Color Theme)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">رنگ اصلی (Primary)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-teal-100 dark:border-teal-900 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 font-mono text-slate-800 dark:text-slate-200 text-xs uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">رنگ دوم (Secondary)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={e => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-teal-100 dark:border-teal-900 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={e => setSecondaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 font-mono text-slate-800 dark:text-slate-200 text-xs uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">رنگ تاکید (Accent / Sale)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={e => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-teal-100 dark:border-teal-900 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={e => setAccentColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 font-mono text-slate-800 dark:text-slate-200 text-xs uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Geometry & Border Radius */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#08242d] border border-teal-100 dark:border-teal-900 shadow-2xs space-y-4">
            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-teal-100/60 dark:border-teal-900/60">
              <Layout size={15} className="text-[#0d9488]" />
              <span>هندسه گوشه‌ها و استایل دکمه‌ها (Corner Geometry)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">میزان انحنای گوشه‌ها (Border Radius)</label>
                <select
                  value={borderRadius}
                  onChange={e => setBorderRadius(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 text-slate-900 dark:text-white font-bold"
                >
                  <option value="none">مستطیلی بدون انحنا (Sharp 0px)</option>
                  <option value="sm">انحنای ملایم (Small 6px)</option>
                  <option value="md">انحنای استاندارد (Medium 10px)</option>
                  <option value="lg">انحنای مدرن (Large 16px)</option>
                  <option value="xl">انحنای گرد لوکس (Extra Large 24px)</option>
                  <option value="full">کپسولی (Full Rounded)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200">استایل دکمه‌های اصلی</label>
                <select
                  value={buttonStyle}
                  onChange={e => setButtonStyle(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900 text-slate-900 dark:text-white font-bold"
                >
                  <option value="solid">رنگ یکپارچه و فلت (Solid Primary)</option>
                  <option value="gradient">گرادینت مدرن اقیانوسی (Oceanic Gradient)</option>
                  <option value="soft">زمینه ملایم با متن پررنگ (Soft Tint)</option>
                  <option value="outline">حاشیه‌دار مینیمال (Clean Outline)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feature Toggle: Instructor Registration */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#08242d] border border-teal-100 dark:border-teal-900 shadow-2xs space-y-4">
            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between pb-2 border-b border-teal-100/60 dark:border-teal-900/60">
              <div className="flex items-center gap-2">
                <Sliders size={15} className="text-[#0d9488]" />
                <span>کلیدهای سیستمی (Feature Toggles)</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isInstructorRegistrationEnabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {isInstructorRegistrationEnabled ? 'ثبت‌نام مدرس: فعال' : 'ثبت‌نام مدرس: غیرفعال'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/60">
              <div className="space-y-0.5">
                <div className="font-bold text-xs text-slate-900 dark:text-white">
                  فعال‌سازی ثبت‌نام مدرسین جدید
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  نمایش فرم و دکمه‌های «درخواست تدریس» در هدر و داشبورد دانشجو
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInstructorRegistrationEnabled}
                  onChange={e => setIsInstructorRegistrationEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d9488]"></div>
              </label>
            </div>

            {/* Feature Toggle: A-La-Carte Kill Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/60">
              <div className="space-y-1">
                <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                  <span>فعال‌سازی فروش تکی دوره‌ها</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isAlacarteSaleEnabled
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
                  }`}>
                    {isAlacarteSaleEnabled ? 'روشن (امکان خرید تکی)' : 'خاموش (دسترسی انحصاری با اشتراک VIP)'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                  در صورت خاموش بودن (پیش‌فرض)، دکمه «خرید تکی دوره» در صفحات دوره‌ها به کلی مخفی شده و کاربران فقط گزینه «تماشا با اشتراک VIP» را مشاهده خواهند کرد (زیرساخت قیمت‌گذاری در بک‌اند محفوظ می‌ماند).
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 ms-3">
                <input
                  type="checkbox"
                  checked={isAlacarteSaleEnabled}
                  onChange={e => setIsAlacarteSaleEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d9488]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Card Preview */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#08242d] border border-teal-100 dark:border-teal-900 shadow-2xs space-y-4">
            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-teal-100/60 dark:border-teal-900/60">
              <Eye size={15} className="text-[#0d9488]" />
              <span>پیش‌نمایش زنده استایل (Live Preview)</span>
            </div>

            <div 
              className="p-5 border space-y-4 transition-all"
              style={{
                borderRadius: borderRadius === 'full' ? '32px' : borderRadius === 'xl' ? '24px' : borderRadius === 'lg' ? '16px' : borderRadius === 'md' ? '12px' : '4px',
                borderColor: `${primaryColor}40`,
                backgroundColor: 'rgba(255,255,255,0.05)'
              }}
            >
              <div className="flex items-center justify-between">
                <span 
                  className="px-2.5 py-0.5 text-[10px] font-bold rounded-full"
                  style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                >
                  {siteName || 'لومینا لرن'}
                </span>
                <span 
                  className="text-[11px] font-bold"
                  style={{ color: accentColor }}
                >
                  ویژه
                </span>
              </div>

              <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                عنوان نمونه دوره آموزشی
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {tagline || 'آکادمی پیشرو آموزش مهارت‌های تخصصی و کاربردی'}
              </p>

              <div className="pt-2 flex items-center justify-between">
                <div className="font-bold text-sm" style={{ color: primaryColor }}>
                  ۴۹۰٬۰۰۰ تومان
                </div>

                <button
                  type="button"
                  className="px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer"
                  style={{
                    backgroundColor: primaryColor,
                    borderRadius: borderRadius === 'full' ? '9999px' : borderRadius === 'xl' ? '16px' : borderRadius === 'lg' ? '12px' : '8px',
                    boxShadow: `0 4px 14px ${primaryColor}40`
                  }}
                >
                  ثبت‌نام در دوره
                </button>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center leading-relaxed">
              این پیش‌نمایش نحوه ظاهر شدن کارت‌ها، دکمه‌ها و پالت رنگی را در سراسر سایت شبیه‌سازی می‌کند.
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
