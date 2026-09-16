import React, { useState, useEffect } from 'react';
import { 
  Settings, Shield, Server, Save, CheckCircle2, Landmark, CreditCard, 
  UserPlus, Globe, Key, AlertCircle, Trash2, AlertTriangle, MessageSquare,
  Sparkles, Mail, Phone, MapPin, Send, Instagram, Linkedin, Youtube, Twitter, 
  X, RefreshCw
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { api } from '../../../services/api';

export const StudioSettingsTab: React.FC = () => {
  const { 
    addToast, 
    currentUser, 
    updateUserProfile, 
    isInstructorRegistrationEnabled, 
    toggleInstructorRegistration,
    siteSettings,
    updateSiteSettings,
    refreshCourses
  } = useApp();

  // CMS & Branding state
  const [siteName, setSiteName] = useState(siteSettings?.siteName || 'آکادمی لومینا لرن');
  const [siteNameEn, setSiteNameEn] = useState(siteSettings?.siteNameEn || 'Lumina Academy');
  const [tagline, setTagline] = useState(siteSettings?.tagline || 'مسیر یادگیری حرفه‌ای و تخصصی را دنبال کن.');
  const [heroSubtitle, setHeroSubtitle] = useState(
    siteSettings?.heroSubtitle || 
    'لومینا لرن، خانه‌ای آرام برای کشف، یادگیری عمیق و نگه‌داشتن دانش تخصصی است؛ هر دوره با ریتمی استاندارد که برای رشد مهارت‌های واقعی شما ساخته شده است.'
  );
  const [contactEmail, setContactEmail] = useState(siteSettings?.contactEmail || 'support@lumina.com');
  const [contactPhone, setContactPhone] = useState(siteSettings?.contactPhone || '021-88997766');
  const [address, setAddress] = useState(siteSettings?.address || 'تهران، میدان ونک، پارک علم و فناوری، ساختمان نوآوری لومینا');
  const [footerText, setFooterText] = useState(
    siteSettings?.footerText || 
    'پلتفرم جامع آموزش ویدیویی مهارت‌های خلاق، طراحی محصول، برنامه‌نویسی و هوش مصنوعی با تدریس برترین اساتید صنعت.'
  );
  const [copyrightText, setCopyrightText] = useState(
    siteSettings?.copyrightText || 
    '© ۱۴۰۴ آکادمی لومینا لرن. تمامی حقوق مادی و معنوی محفوظ است.'
  );

  // Social links state
  const [socialInstagram, setSocialInstagram] = useState(siteSettings?.socialLinks?.instagram || 'https://instagram.com/lumina');
  const [socialTelegram, setSocialTelegram] = useState(siteSettings?.socialLinks?.telegram || 'https://t.me/lumina_channel');
  const [socialLinkedin, setSocialLinkedin] = useState(siteSettings?.socialLinks?.linkedin || 'https://linkedin.com/company/lumina');
  const [socialYoutube, setSocialYoutube] = useState(siteSettings?.socialLinks?.youtube || 'https://youtube.com/@lumina');
  const [socialTwitter, setSocialTwitter] = useState(siteSettings?.socialLinks?.twitter || 'https://x.com/lumina_academy');

  const [isSavingCms, setIsSavingCms] = useState(false);

  // Studio Infrastructure & Streaming
  const [cdnProvider, setCdnProvider] = useState('arvan');
  const [videoWatermark, setVideoWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState('LuminaLearn - شناسه دانشجو: {USER_ID}');
  const [defaultPlatformFee, setDefaultPlatformFee] = useState(20);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30);
  const [shebaNumber, setShebaNumber] = useState(currentUser?.shebaNumber || '');
  const [instructorToggleLoading, setInstructorToggleLoading] = useState(false);

  // Payment Gateway Settings
  const [paymentGatewayMode, setPaymentGatewayMode] = useState<'MOCK_GATEWAY' | 'ZARINPAL'>('MOCK_GATEWAY');
  const [zarinpalMerchantId, setZarinpalMerchantId] = useState('00000000-0000-0000-0000-000000000000');
  const [zarinpalSandbox, setZarinpalSandbox] = useState(true);
  const [isSavingGateway, setIsSavingGateway] = useState(false);

  // Danger Zone (Wipe Data) state
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipeConfirmInput, setWipeConfirmInput] = useState('');
  const [isWiping, setIsWiping] = useState(false);
  const [wipeSuccessStats, setWipeSuccessStats] = useState<any>(null);

  // Sync state when siteSettings loads
  useEffect(() => {
    if (siteSettings) {
      if (siteSettings.siteName) setSiteName(siteSettings.siteName);
      if (siteSettings.siteNameEn) setSiteNameEn(siteSettings.siteNameEn);
      if (siteSettings.tagline) setTagline(siteSettings.tagline);
      if (siteSettings.heroSubtitle) setHeroSubtitle(siteSettings.heroSubtitle);
      if (siteSettings.contactEmail) setContactEmail(siteSettings.contactEmail);
      if (siteSettings.contactPhone) setContactPhone(siteSettings.contactPhone);
      if (siteSettings.address) setAddress(siteSettings.address);
      if (siteSettings.footerText) setFooterText(siteSettings.footerText);
      if (siteSettings.copyrightText) setCopyrightText(siteSettings.copyrightText);
      if (siteSettings.paymentGatewayMode) setPaymentGatewayMode(siteSettings.paymentGatewayMode);
      if (siteSettings.zarinpalMerchantId) setZarinpalMerchantId(siteSettings.zarinpalMerchantId);
      if (siteSettings.zarinpalSandbox !== undefined) setZarinpalSandbox(siteSettings.zarinpalSandbox);
      if (siteSettings.socialLinks) {
        if (siteSettings.socialLinks.instagram) setSocialInstagram(siteSettings.socialLinks.instagram);
        if (siteSettings.socialLinks.telegram) setSocialTelegram(siteSettings.socialLinks.telegram);
        if (siteSettings.socialLinks.linkedin) setSocialLinkedin(siteSettings.socialLinks.linkedin);
        if (siteSettings.socialLinks.youtube) setSocialYoutube(siteSettings.socialLinks.youtube);
        if (siteSettings.socialLinks.twitter) setSocialTwitter(siteSettings.socialLinks.twitter);
      }
    }
  }, [siteSettings]);

  const handleToggleInstructorRegistration = async (enabled: boolean) => {
    setInstructorToggleLoading(true);
    try {
      await toggleInstructorRegistration(enabled);
      addToast({
        title: enabled ? 'ثبت‌نام مدرسین فعال شد' : 'ثبت‌نام مدرسین غیرفعال شد',
        message: enabled 
          ? 'منو و فرم ثبت‌نام مدرس اکنون در دسترس کاربران عمومی و دانشجویان قرار دارد.'
          : 'منو و دسترسی‌های ثبت‌نام مدرس از دید عموم مخفی گردید.',
        type: 'success'
      });
    } finally {
      setInstructorToggleLoading(false);
    }
  };

  const handleSaveCmsSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingCms(true);
    try {
      const updates = {
        siteName: siteName.trim(),
        siteNameEn: siteNameEn.trim(),
        tagline: tagline.trim(),
        heroSubtitle: heroSubtitle.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        address: address.trim(),
        footerText: footerText.trim(),
        copyrightText: copyrightText.trim(),
        socialLinks: {
          instagram: socialInstagram.trim(),
          telegram: socialTelegram.trim(),
          linkedin: socialLinkedin.trim(),
          youtube: socialYoutube.trim(),
          twitter: socialTwitter.trim()
        }
      };

      const ok = await updateSiteSettings(updates);
      if (ok) {
        addToast({
          title: 'برند و CMS با موفقیت ذخیره شد',
          message: 'تغییرات نام سایت، بنر اصلی صفحه اول، اطلاعات فوتر و شبکه‌های اجتماعی در دیتابیس اعمال گردید.',
          type: 'success'
        });
      } else {
        throw new Error('خطا در ذخیره‌سازی داده‌ها در سرور');
      }
    } catch (err: any) {
      addToast({
        title: 'خطا در ذخیره تنظیمات CMS',
        message: err.message || 'مشکلی رخ داد.',
        type: 'error'
      });
    } finally {
      setIsSavingCms(false);
    }
  };

  const handleSaveInfrastructure = async () => {
    setIsSavingGateway(true);
    try {
      if (shebaNumber !== (currentUser?.shebaNumber || '')) {
        await updateUserProfile({ shebaNumber: shebaNumber.trim() });
      }

      await updateSiteSettings({
        paymentGatewayMode,
        zarinpalMerchantId: zarinpalMerchantId.trim(),
        zarinpalSandbox
      });

      addToast({
        title: 'تنظیمات زیرساخت و درگاه ذخیره شد',
        message: `پیکربندی درگاه پرداخت (${paymentGatewayMode === 'ZARINPAL' ? 'زرین‌پال شاپرک' : 'شبیه‌ساز بانکی'}) و تنظیمات استودیو به‌روزرسانی شد.`,
        type: 'success'
      });
    } catch (err: any) {
      addToast({
        title: 'خطا در ذخیره تنظیمات',
        message: err.message || 'مشکلی در ثبت تنظیمات رخ داد.',
        type: 'error'
      });
    } finally {
      setIsSavingGateway(false);
    }
  };

  const handleExecuteWipe = async () => {
    if (wipeConfirmInput.trim().toUpperCase() !== 'CONFIRM') {
      addToast({
        title: 'کد تایید اشتباه است',
        message: 'لطفاً دقیقاً عبارت CONFIRM را وارد کنید.',
        type: 'error'
      });
      return;
    }

    setIsWiping(true);
    try {
      const res = await api.admin.wipeTestData('CONFIRM');
      if (res.data?.success) {
        setWipeSuccessStats(res.data.stats);
        addToast({
          title: 'پاکسازی با موفقیت انجام شد',
          message: res.data.message || 'دوره‌های تستی، کاربران دمو و سفارشات با موفقیت حذف شدند.',
          type: 'success'
        });
        if (refreshCourses) {
          await refreshCourses();
        }
      }
    } catch (err: any) {
      addToast({
        title: 'خطا در اجرای پاکسازی',
        message: err.message || 'مشکلی در پاکسازی دیتابیس پیش آمد.',
        type: 'error'
      });
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="space-y-8 text-xs max-w-4xl pb-16">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-[#06242e] dark:text-white">
          تنظیمات عمومی پلتفرم، CMS و زیرساخت
        </h2>
        <p className="text-xs text-[#527683] dark:text-[#8ab5be] mt-0.5">
          مدیریت هویت بصری و متون صفحه اول، درگاه پرداخت شاپرک، دسترسی مدرسین و پاکسازی داده‌ها
        </p>
      </div>

      {/* SECTION 1: CMS & Brand Customization Form */}
      <section className="p-6 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#ccede5]/60 dark:border-teal-900/40 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-[#0d9488] dark:text-[#2dd4bf] flex items-center justify-center">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#06242e] dark:text-white">
                شخصی‌سازی متون، برند و CMS صفحه اصلی
              </h3>
              <p className="text-[11px] text-[#527683] dark:text-[#8ab5be]">
                ویرایش نام سایت، تیتر بنر هیرو، توضیحات فوتر و لینک‌های شبکه‌های اجتماعی
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#def4ee] dark:bg-teal-950 text-[#0b3b49] dark:text-[#5eead4]">
            ذخیره خودکار در دیتابیس
          </span>
        </div>

        <form onSubmit={handleSaveCmsSettings} className="space-y-5">
          {/* Site Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-[#06242e] dark:text-white flex items-center gap-1.5">
                <span>نام وب‌سایت (فارسی)</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={siteName}
                onChange={e => setSiteName(e.target.value)}
                placeholder="مثال: آکادمی لومینا لرن"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white focus:outline-hidden focus:border-[#0d9488]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#06242e] dark:text-white flex items-center gap-1.5">
                <span>نام لاتین برند (English Name)</span>
              </label>
              <input
                type="text"
                value={siteNameEn}
                onChange={e => setSiteNameEn(e.target.value)}
                placeholder="Lumina Academy"
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white font-mono focus:outline-hidden focus:border-[#0d9488]"
              />
            </div>
          </div>

          {/* Hero Banner Text */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#06242e] dark:text-white flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#0d9488]" />
              <span>عنوان بنر اصلی صفحه اول (Hero Banner Title / Tagline)</span>
            </label>
            <input
              type="text"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              placeholder="مثال: مسیر یادگیری حرفه‌ای و تخصصی را دنبال کن."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white focus:outline-hidden focus:border-[#0d9488]"
              required
            />
            <p className="text-[10px] text-[#527683] dark:text-[#8ab5be]">
              این متن با فونت درشت و برجسته در بالای صفحه اول (Hero Section) نمایش داده می‌شود.
            </p>
          </div>

          {/* Hero Subtitle */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#06242e] dark:text-white">
              متن زیرعنوان و توضیحات بنر اصلی صفحه نخست
            </label>
            <textarea
              rows={2}
              value={heroSubtitle}
              onChange={e => setHeroSubtitle(e.target.value)}
              placeholder="توضیحات کوتاه چند خطی در مورد رسالت و برتری آکادمی..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white focus:outline-hidden focus:border-[#0d9488] leading-relaxed"
            />
          </div>

          {/* Footer & Copyright Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="font-bold text-[#06242e] dark:text-white">
                متن معرفی کوتاه فوتر (Footer Bio)
              </label>
              <textarea
                rows={2}
                value={footerText}
                onChange={e => setFooterText(e.target.value)}
                placeholder="متن معرفی مختصر پلتفرم در فوتر سایت..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white focus:outline-hidden focus:border-[#0d9488] leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#06242e] dark:text-white">
                متن کپی‌رایت انتهای سایت (Copyright Notice)
              </label>
              <textarea
                rows={2}
                value={copyrightText}
                onChange={e => setCopyrightText(e.target.value)}
                placeholder="© ۱۴۰۴ آکادمی لومینا لرن. تمامی حقوق مادی و معنوی محفوظ است."
                className="w-full px-3.5 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white focus:outline-hidden focus:border-[#0d9488] leading-relaxed"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-[#09242d] border border-slate-200 dark:border-teal-900/60 space-y-3">
            <div className="font-extrabold text-[#06242e] dark:text-white flex items-center gap-2">
              <Phone size={14} className="text-[#0d9488]" />
              <span>اطلاعات تماس و نشانی درج‌شده در فوتر</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Mail size={12} className="text-[#0d9488]" />
                  <span>ایمیل تماس و پشتیبانی</span>
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="support@lumina.com"
                  dir="ltr"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#071c23] border border-slate-200 dark:border-teal-900 font-mono text-xs text-[#06242e] dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Phone size={12} className="text-[#0d9488]" />
                  <span>شماره تلفن پاسخگویی</span>
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="021-88997766"
                  dir="ltr"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#071c23] border border-slate-200 dark:border-teal-900 font-mono text-xs text-[#06242e] dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <MapPin size={12} className="text-[#0d9488]" />
                <span>آدرس فیزیکی دفتر یا پارک فناوری</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="تهران، میدان ونک..."
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#071c23] border border-slate-200 dark:border-teal-900 text-xs text-[#06242e] dark:text-white"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-[#09242d] border border-slate-200 dark:border-teal-900/60 space-y-3">
            <div className="font-extrabold text-[#06242e] dark:text-white flex items-center gap-2">
              <Send size={14} className="text-[#0d9488]" />
              <span>لینک شبکه‌های اجتماعی (نمایش خودکار آیکون‌ها در فوتر)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Instagram size={12} className="text-pink-600" />
                  <span>اینستاگرام (Instagram URL)</span>
                </label>
                <input
                  type="url"
                  value={socialInstagram}
                  onChange={e => setSocialInstagram(e.target.value)}
                  placeholder="https://instagram.com/..."
                  dir="ltr"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#071c23] border border-slate-200 dark:border-teal-900 font-mono text-[11px] text-[#06242e] dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Send size={12} className="text-sky-500" />
                  <span>کانال تلگرام (Telegram)</span>
                </label>
                <input
                  type="url"
                  value={socialTelegram}
                  onChange={e => setSocialTelegram(e.target.value)}
                  placeholder="https://t.me/..."
                  dir="ltr"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#071c23] border border-slate-200 dark:border-teal-900 font-mono text-[11px] text-[#06242e] dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Linkedin size={12} className="text-blue-600" />
                  <span>صفحه لینکدین (LinkedIn)</span>
                </label>
                <input
                  type="url"
                  value={socialLinkedin}
                  onChange={e => setSocialLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/..."
                  dir="ltr"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#071c23] border border-slate-200 dark:border-teal-900 font-mono text-[11px] text-[#06242e] dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Youtube size={12} className="text-red-500" />
                  <span>کانال یوتیوب (YouTube)</span>
                </label>
                <input
                  type="url"
                  value={socialYoutube}
                  onChange={e => setSocialYoutube(e.target.value)}
                  placeholder="https://youtube.com/..."
                  dir="ltr"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#071c23] border border-slate-200 dark:border-teal-900 font-mono text-[11px] text-[#06242e] dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Twitter size={12} className="text-slate-700 dark:text-slate-300" />
                  <span>توییتر / X</span>
                </label>
                <input
                  type="url"
                  value={socialTwitter}
                  onChange={e => setSocialTwitter(e.target.value)}
                  placeholder="https://x.com/..."
                  dir="ltr"
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#071c23] border border-slate-200 dark:border-teal-900 font-mono text-[11px] text-[#06242e] dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Button for CMS */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingCms}
              className="px-6 py-2.5 rounded-xl bg-[#0b3b49] hover:bg-[#06242e] dark:bg-[#5eead4] dark:hover:bg-[#2dd4bf] text-white dark:text-[#06242e] font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save size={16} />
              <span>{isSavingCms ? 'در حال ثبت تغییرات...' : 'ذخیره مشخصات برند و CMS'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* SECTION 2: Instructor Registration & Platform Control */}
      <section className="p-6 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 shadow-xs space-y-6">
        
        {/* Feature Toggle: Instructor Registration */}
        <div className="p-5 rounded-2xl bg-gradient-to-l from-[#def4ee]/60 to-white dark:from-[#0e3b47]/60 dark:to-[#06242e] border border-teal-200 dark:border-teal-800/80 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-[#0d9488] dark:text-[#2dd4bf] flex items-center justify-center">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#06242e] dark:text-white">
                    فعال‌سازی ثبت‌نام مدرسین جدید
                  </h3>
                  <p className="text-[11px] text-[#527683] dark:text-[#8ab5be]">
                    امکان ارسال فرم درخواست تدریس توسط کاربران، نمایش منو و تب «درخواست تدریس» در هدر و داشبورد دانشجو
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 ${
                isInstructorRegistrationEnabled
                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isInstructorRegistrationEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                <span>{isInstructorRegistrationEnabled ? 'فعال (ثبت‌نام باز است)' : 'غیرفعال (مخفی از دید دانشجویان)'}</span>
              </span>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="instructor-registration-toggle"
                  checked={isInstructorRegistrationEnabled}
                  disabled={instructorToggleLoading}
                  onChange={e => handleToggleInstructorRegistration(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d9488]"></div>
              </label>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-900/40 p-3 rounded-xl border border-teal-100 dark:border-teal-900/40 flex items-center justify-between">
            <span>
              وضعیت در دیتابیس: <code className="font-mono text-[10px] text-[#0d9488] dark:text-[#2dd4bf] font-bold">isInstructorRegistrationEnabled = {isInstructorRegistrationEnabled ? 'true' : 'false'}</code>
            </span>
            <span>
              {isInstructorRegistrationEnabled
                ? '✅ کاربران می‌توانند درخواست مدرسی ارسال کنند.'
                : '🔒 تمامی دکمه‌ها و منوهای ثبت‌نام مدرس مخفی و API محافظت شده است.'}
            </span>
          </div>
        </div>

        {/* Video CDN Engine */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#06242e] dark:text-white">
            <Server size={18} className="text-[#0d9488]" />
            <span>سرورهای ذخیره‌سازی ابری و CDN ویدیو</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
              cdnProvider === 'arvan' ? 'border-[#0d9488] bg-[#def4ee]/30 dark:bg-[#0e3b47]/40 font-bold' : 'border-[#ccede5] dark:border-teal-900'
            }`}>
              <div className="space-y-1">
                <input
                  type="radio"
                  name="cdn"
                  value="arvan"
                  checked={cdnProvider === 'arvan'}
                  onChange={() => setCdnProvider('arvan')}
                  className="sr-only"
                />
                <div className="font-extrabold text-xs text-[#06242e] dark:text-white">ابر آروان (ArvanCloud)</div>
                <div className="text-[10px] text-[#527683] dark:text-[#8ab5be]">سرورهای داخل ایران با ترافیک نیم‌بها</div>
              </div>
              <span className="text-[10px] text-[#0d9488] dark:text-[#5eead4] mt-2 font-bold">توصیه شده ✓</span>
            </label>

            <label className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
              cdnProvider === 'cloudflare' ? 'border-[#0d9488] bg-[#def4ee]/30 dark:bg-[#0e3b47]/40 font-bold' : 'border-[#ccede5] dark:border-teal-900'
            }`}>
              <div className="space-y-1">
                <input
                  type="radio"
                  name="cdn"
                  value="cloudflare"
                  checked={cdnProvider === 'cloudflare'}
                  onChange={() => setCdnProvider('cloudflare')}
                  className="sr-only"
                />
                <div className="font-extrabold text-xs text-[#06242e] dark:text-white">Cloudflare Stream</div>
                <div className="text-[10px] text-[#527683] dark:text-[#8ab5be]">پخش جهانی فوق سریع</div>
              </div>
            </label>

            <label className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
              cdnProvider === 'custom' ? 'border-[#0d9488] bg-[#def4ee]/30 dark:bg-[#0e3b47]/40 font-bold' : 'border-[#ccede5] dark:border-teal-900'
            }`}>
              <div className="space-y-1">
                <input
                  type="radio"
                  name="cdn"
                  value="custom"
                  checked={cdnProvider === 'custom'}
                  onChange={() => setCdnProvider('custom')}
                  className="sr-only"
                />
                <div className="font-extrabold text-xs text-[#06242e] dark:text-white">هاست اختصاصی S3 / MinIO</div>
                <div className="text-[10px] text-[#527683] dark:text-[#8ab5be]">سرور ذخیره‌سازی اختصاصی سازمان</div>
              </div>
            </label>
          </div>
        </div>

        {/* Dynamic Watermarking Security */}
        <div className="space-y-3 pt-4 border-t border-[#ccede5]/60 dark:border-teal-900/40">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[#06242e] dark:text-white">
                <Shield size={18} className="text-[#0d9488]" />
                <span>واترمارک داینامیک و ضد سرقت ویدیوها</span>
              </div>
              <p className="text-[11px] text-[#527683] dark:text-[#8ab5be]">
                نمایش نام و شماره تماس دانشجو به صورت متحرک روی ویدیو حین پخش
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={videoWatermark}
                onChange={e => setVideoWatermark(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d9488]"></div>
            </label>
          </div>

          {videoWatermark && (
            <div className="space-y-1.5">
              <label className="font-bold text-[#06242e] dark:text-white">الگوی متن واترمارک</label>
              <input
                type="text"
                value={watermarkText}
                onChange={e => setWatermarkText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 font-mono text-xs text-[#06242e] dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Commission & Autosave */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#ccede5]/60 dark:border-teal-900/40">
          <div className="space-y-1.5">
            <label className="font-bold text-[#06242e] dark:text-white">کارمزد پیش‌فرض پلتفرم (درصد)</label>
            <input
              type="number"
              value={defaultPlatformFee}
              onChange={e => setDefaultPlatformFee(Number(e.target.value))}
              min={0}
              max={100}
              className="w-full px-3 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#06242e] dark:text-white">بازه زمانی ذخیره خودکار (ثانیه)</label>
            <input
              type="number"
              value={autoSaveInterval}
              onChange={e => setAutoSaveInterval(Number(e.target.value))}
              min={10}
              max={300}
              className="w-full px-3 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white"
            />
          </div>
        </div>

        {/* Instructor Payout & Sheba IBAN */}
        <div className="space-y-3 pt-4 border-t border-[#ccede5]/60 dark:border-teal-900/40">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#06242e] dark:text-white">
            <Landmark size={18} className="text-[#0d9488]" />
            <span>شماره شبا بانکی (IBAN) جهت تسویه‌حساب مدرس</span>
          </div>
          <p className="text-[11px] text-[#527683] dark:text-[#8ab5be]">
            مبالغ حق‌التدریس و سهم حاصل از فروش دوره‌های شما به این حساب واریز خواهد شد.
          </p>
          <div className="relative flex items-center max-w-md">
            <span className="absolute left-3.5 text-xs font-mono font-bold text-slate-400 dark:text-slate-500 select-none">
              IR
            </span>
            <input
              type="text"
              value={shebaNumber}
              onChange={e => {
                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 24);
                setShebaNumber(val);
              }}
              placeholder="000000000000000000000000"
              maxLength={24}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 font-mono text-xs text-[#06242e] dark:text-white tracking-wider"
              dir="ltr"
            />
            <CreditCard size={16} className="absolute right-3.5 text-slate-400" />
          </div>
        </div>

        {/* Payment Gateway Architecture */}
        <div className="space-y-4 pt-4 border-t border-[#ccede5]/60 dark:border-teal-900/40">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[#06242e] dark:text-white">
                <CreditCard size={18} className="text-[#0d9488]" />
                <span>درگاه پرداخت و تسویه‌حساب آنلاین (Payment Gateway)</span>
              </div>
              <p className="text-[11px] text-[#527683] dark:text-[#8ab5be]">
                تنظیم اتصال به شبکه رسمی پرداخت شاپرک یا شبیه‌ساز تراکنش‌های مالی
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Mock Gateway Option */}
            <div
              onClick={() => setPaymentGatewayMode('MOCK_GATEWAY')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                paymentGatewayMode === 'MOCK_GATEWAY'
                  ? 'border-[#0d9488] bg-[#def4ee]/30 dark:bg-[#0e3b47]/50 shadow-xs'
                  : 'border-[#ccede5] dark:border-teal-900/60 hover:border-teal-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-xs text-[#06242e] dark:text-white">
                  شبیه‌ساز پرداخت ایمن (تست و دمو)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                  پیشنهاد توسعه
                </span>
              </div>
              <p className="text-[11px] text-[#527683] dark:text-[#8ab5be]">
                بدون نیاز به ثبت مرچنت بانکی؛ امکان تست کامل چرخه خرید، اعتبارسنجی فاکتور و فعال‌سازی آنی دوره‌ها.
              </p>
            </div>

            {/* ZarinPal Gateway Option */}
            <div
              onClick={() => setPaymentGatewayMode('ZARINPAL')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                paymentGatewayMode === 'ZARINPAL'
                  ? 'border-[#0d9488] bg-[#def4ee]/30 dark:bg-[#0e3b47]/50 shadow-xs'
                  : 'border-[#ccede5] dark:border-teal-900/60 hover:border-teal-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-xs text-[#06242e] dark:text-white">
                  درگاه رسمی زرین‌پال (ZarinPal Real)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  شبکه شاپرک
                </span>
              </div>
              <p className="text-[11px] text-[#527683] dark:text-[#8ab5be]">
                اتصال رسمی به درگاه پرداخت اینترنتی زرین‌پال طبق استاندارد REST API v4 و بازگشت خودکار (Callback) پس از پرداخت.
              </p>
            </div>
          </div>

          {/* ZarinPal Parameters (when active) */}
          {paymentGatewayMode === 'ZARINPAL' && (
            <div className="p-4 rounded-xl bg-[#f0fbf8]/80 dark:bg-[#09222b] border border-[#ccede5] dark:border-teal-900 space-y-3">
              <div className="space-y-1.5">
                <label className="font-bold text-[#06242e] dark:text-white flex items-center gap-1.5">
                  <Key size={14} className="text-[#0d9488]" />
                  <span>کد مرچنت درگاه زرین‌پال (Merchant ID)</span>
                </label>
                <input
                  type="text"
                  value={zarinpalMerchantId}
                  onChange={e => setZarinpalMerchantId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0c2e39] border border-[#ccede5] dark:border-teal-900 font-mono text-xs text-[#06242e] dark:text-white tracking-wider"
                  dir="ltr"
                />
                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>شناسه ۳۶ کاراکتری دریافت‌شده از پنل زرین‌پال (در حالت سندباکس ۳۶ کاراکتر صفر کفایت می‌کند)</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#ccede5]/60 dark:border-teal-900/40">
                <div>
                  <div className="font-bold text-[#06242e] dark:text-white text-xs">
                    محیط آزمایشگاهی زرین‌پال (ZarinPal Sandbox)
                  </div>
                  <div className="text-[10px] text-[#527683] dark:text-[#8ab5be]">
                    جهت تست کامل جریان پرداخت واقعی با پول مجازی بدون کسر از کارت واقعی
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={zarinpalSandbox}
                    onChange={e => setZarinpalSandbox(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0d9488]"></div>
                </label>
              </div>
            </div>
          )}

          {/* Save Button for Infrastructure */}
          <div className="pt-4 border-t border-[#ccede5]/60 dark:border-teal-900/40 flex justify-end">
            <button
              onClick={handleSaveInfrastructure}
              disabled={isSavingGateway}
              className="px-6 py-2.5 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] font-black text-xs flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Save size={16} />
              <span>{isSavingGateway ? 'در حال ذخیره‌سازی...' : 'ذخیره تنظیمات استودیو و درگاه پرداخت'}</span>
            </button>
          </div>
        </div>

      </section>

      {/* SECTION 3: DANGER ZONE (پاکسازی داده‌های تستی) */}
      <section className="p-6 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/70 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 className="text-sm font-black text-rose-900 dark:text-rose-200 flex items-center gap-2">
                <span>منطقه بحرانی: پاکسازی داده‌های تستی (Danger Zone)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-100">
                  غیرقابل بازگشت
                </span>
              </h3>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80 mt-0.5">
                حذف دوره‌های دمو، کاربران تستی، سفارشات و پیشرفت‌ها جهت آماده‌سازی پلتفرم برای راه‌اندازی رسمی
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-rose-800 dark:text-rose-300 bg-white/80 dark:bg-slate-900/60 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 space-y-2">
          <p className="font-bold">
            🛡️ امنیت و تضمین‌های فرایند پاکسازی:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
            <li>
              حساب مدیر ارشد سیستم با ایمیل <code className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">admin@lumina.com</code> و رمز عبور <code className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">123456</code> کاملاً حفظ می‌شود.
            </li>
            <li>
              تمامی تنظیمات کلی پلتفرم (CMS، نام سایت، درگاه زرین‌پال و بنرها) دست‌نخورده باقی می‌مانند.
            </li>
            <li>
              ساختار جدول‌ها و کدهای سیستم به حالت استاندار آماده دریافت دوره‌ها و دانشجویان واقعی بازنشانی می‌شود.
            </li>
          </ul>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => {
              setWipeConfirmInput('');
              setWipeSuccessStats(null);
              setShowWipeModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Trash2 size={16} />
            <span>پاکسازی دوره‌ها و کاربران تستی...</span>
          </button>
        </div>
      </section>

      {/* Wipe Confirmation Modal */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#06242e] border-2 border-rose-500 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-right">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
                <AlertTriangle size={24} />
                <h4 className="font-black text-base text-[#06242e] dark:text-white">
                  تایید نهایی پاکسازی داده‌های سیستم
                </h4>
              </div>
              <button
                onClick={() => setShowWipeModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {wipeSuccessStats ? (
              /* Success State inside modal */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs space-y-2">
                  <div className="font-black flex items-center gap-2 text-sm">
                    <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <span>عملیات پاکسازی با موفقیت پایان یافت</span>
                  </div>
                  <p className="text-[11px]">
                    آمار رکوردهای حذف‌شده از پایگاه داده:
                  </p>
                  <ul className="text-[11px] font-mono space-y-1">
                    <li>• دوره‌های حذف شده: {wipeSuccessStats.wipedCourses}</li>
                    <li>• ثبت‌نام‌های حذف شده: {wipeSuccessStats.wipedEnrollments}</li>
                    <li>• دیدگاه‌های حذف شده: {wipeSuccessStats.wipedReviews}</li>
                    <li>• کاربران تستی حذف شده: {wipeSuccessStats.wipedStudents}</li>
                    <li>• حساب حفظ‌شده: {wipeSuccessStats.retainedAdmin}</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowWipeModal(false);
                      window.location.reload();
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#0b3b49] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw size={14} />
                    <span>بارگذاری مجدد سیستم و مشاهده داشبورد پاک</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Confirmation Form */
              <div className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  با این کار تمامی داده‌های تستی پاک می‌شوند. اکانت <strong className="text-[#06242e] dark:text-white font-mono">admin@lumina.com</strong> فعال و بدون تغییر باقی خواهد ماند.
                </p>

                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-2">
                  <label className="block text-[11px] font-black text-rose-800 dark:text-rose-300">
                    برای تایید قطعی، لطفاً کلمه <code className="font-mono text-sm bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-rose-300 dark:border-rose-700 font-bold">CONFIRM</code> را در کادر زیر تایپ کنید:
                  </label>
                  <input
                    type="text"
                    value={wipeConfirmInput}
                    onChange={e => setWipeConfirmInput(e.target.value)}
                    placeholder="CONFIRM"
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-rose-300 dark:border-rose-700 font-mono font-bold text-center text-sm tracking-widest text-[#06242e] dark:text-white focus:outline-hidden focus:border-rose-600"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    disabled={isWiping}
                    onClick={() => setShowWipeModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-200"
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    disabled={wipeConfirmInput.trim().toUpperCase() !== 'CONFIRM' || isWiping}
                    onClick={handleExecuteWipe}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={15} />
                    <span>{isWiping ? 'در حال پاکسازی...' : 'تایید و پاکسازی کل داده‌ها'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
