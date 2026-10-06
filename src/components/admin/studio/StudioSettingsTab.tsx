import React, { useState, useEffect } from 'react';
import { 
  Settings, Shield, Server, Save, CheckCircle2, Landmark, CreditCard, 
  UserPlus, Globe, Key, AlertCircle, Trash2, AlertTriangle, MessageSquare,
  Sparkles, Mail, Phone, MapPin, Send, Instagram, Linkedin, Youtube, Twitter, 
  X, RefreshCw, UploadCloud, Copy, Check, Eye, EyeOff, HardDrive, Database, ExternalLink, Zap
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
  const [cdnProvider, setCdnProvider] = useState('parspack');
  const [videoWatermark, setVideoWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState('LuminaLearn - شناسه دانشجو: {USER_ID}');
  const [defaultPlatformFee, setDefaultPlatformFee] = useState(20);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30);
  const [shebaNumber, setShebaNumber] = useState(currentUser?.shebaNumber || '');
  const [instructorToggleLoading, setInstructorToggleLoading] = useState(false);

  // ParsPack S3 Object Storage Settings
  const [parspackEndpoint, setParspackEndpoint] = useState('https://c984071.parspack.net');
  const [parspackAccessKey, setParspackAccessKey] = useState('8pX21xsaAN8atKAT');
  const [parspackSecretKey, setParspackSecretKey] = useState('n9ZbWkSReYx42vfp8nY04PIMaPgReibK');
  const [parspackBucket, setParspackBucket] = useState('c984071');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isTestingStorage, setIsTestingStorage] = useState(false);
  const [storageTestResult, setStorageTestResult] = useState<{ success: boolean; message: string; endpoint?: string; bucket?: string } | null>(null);
  const [isSavingStorageConfig, setIsSavingStorageConfig] = useState(false);
  const [testUploadLoading, setTestUploadLoading] = useState(false);
  const [testUploadProgress, setTestUploadProgress] = useState<number | null>(null);
  const [testUploadedAsset, setTestUploadedAsset] = useState<{ url: string; name: string; size: string } | null>(null);

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
    addToast({
      title: 'کپی شد',
      message: `${label} در حافظه موقت کپی گردید.`,
      type: 'info'
    });
  };

  const handleTestStorageConnection = async () => {
    setIsTestingStorage(true);
    setStorageTestResult(null);
    try {
      const res = await api.storage.testConnection();
      setStorageTestResult({
        success: res.success,
        message: res.message || (res.success ? 'اتصال با موفقیت تأیید شد.' : 'خطا در ارتباط با پارس‌پک'),
        endpoint: res.data?.endpoint || parspackEndpoint,
        bucket: res.data?.bucket || parspackBucket
      });
      addToast({
        title: res.success ? 'اتصال موفق پارس‌پک' : 'بررسی اتصال ناموفق',
        message: res.message,
        type: res.success ? 'success' : 'error'
      });
    } catch (err: any) {
      setStorageTestResult({
        success: false,
        message: err.message || 'خطای شبکه در برقراری ارتباط با فضای ابری پارس‌پک'
      });
      addToast({
        title: 'خطا در تست اتصال',
        message: err.message || 'خطا در اتصال به پارس‌پک',
        type: 'error'
      });
    } finally {
      setIsTestingStorage(false);
    }
  };

  const handleSaveStorageConfig = async () => {
    setIsSavingStorageConfig(true);
    try {
      const res = await api.storage.updateConfig({
        endpoint: parspackEndpoint.trim(),
        accessKey: parspackAccessKey.trim(),
        secretKey: parspackSecretKey.trim(),
        bucket: parspackBucket.trim(),
        driver: 's3'
      });
      if (res.success) {
        addToast({
          title: 'ذخیره تنظیمات پارس‌پک',
          message: 'مشخصات اتصال فضای ابری پارس‌پک با موفقیت در بک‌اند به‌روزرسانی شد.',
          type: 'success'
        });
        if (res.data?.testResult) {
          setStorageTestResult(res.data.testResult);
        }
      }
    } catch (err: any) {
      addToast({
        title: 'خطا در ذخیره مشخصات',
        message: err.message || 'ثبت اطلاعات پارس‌پک با خطا مواجه شد.',
        type: 'error'
      });
    } finally {
      setIsSavingStorageConfig(false);
    }
  };

  const handleTestFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTestUploadLoading(true);
    setTestUploadProgress(0);
    setTestUploadedAsset(null);

    try {
      const res = await api.storage.uploadFile(file, 'courses', (percent) => {
        setTestUploadProgress(percent);
      });

      if (res.success && res.data) {
        setTestUploadedAsset({
          url: res.data.url,
          name: res.data.name,
          size: res.data.size
        });
        addToast({
          title: 'آپلود آزمایشی موفق در پارس‌پک',
          message: `فایل «${res.data.name}» با موفقیت در فضای ابری پارس‌پک ذخیره شد.`,
          type: 'success'
        });
      }
    } catch (err: any) {
      addToast({
        title: 'خطا در آپلود آزمایشی',
        message: err.message || 'آپلود به فضای ابری با شکست مواجه شد.',
        type: 'error'
      });
    } finally {
      setTestUploadLoading(false);
      setTestUploadProgress(null);
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

        {/* Video CDN & ParsPack Cloud Storage Engine */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#06242e] dark:text-white">
              <Server size={18} className="text-[#0d9488]" />
              <span>سرورهای ذخیره‌سازی ابری، اتصال به پارس‌پک و CDN ویدیو</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>پارس‌پک ابری S3 متصل است</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <label className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
              cdnProvider === 'parspack' ? 'border-[#0d9488] bg-[#def4ee]/40 dark:bg-[#0e3b47]/50 font-bold ring-2 ring-[#0d9488]/30 shadow-xs' : 'border-[#ccede5] dark:border-teal-900'
            }`}>
              <div className="space-y-1">
                <input
                  type="radio"
                  name="cdn"
                  value="parspack"
                  checked={cdnProvider === 'parspack'}
                  onChange={() => setCdnProvider('parspack')}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-[#06242e] dark:text-white">پارس‌پک ابری (ParsPack S3)</span>
                  <Database size={14} className="text-[#0d9488]" />
                </div>
                <div className="text-[10px] text-[#527683] dark:text-[#8ab5be]">سطل ذخیره‌سازی نامحدود S3 با CDN داخلی</div>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-[#5eead4] mt-2 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>متصل و فعال ✓</span>
              </span>
            </label>

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
              <span className="text-[10px] text-[#527683] dark:text-[#8ab5be] mt-2">پشتیبان ثانویه</span>
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
              <span className="text-[10px] text-[#527683] dark:text-[#8ab5be] mt-2">بین‌المللی</span>
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
                <div className="font-extrabold text-xs text-[#06242e] dark:text-white">سرور محلی (Local Server)</div>
                <div className="text-[10px] text-[#527683] dark:text-[#8ab5be]">ذخیره‌سازی در دیسک هاست</div>
              </div>
              <span className="text-[10px] text-[#527683] dark:text-[#8ab5be] mt-2">آفلاین</span>
            </label>
          </div>

          {/* ParsPack Active Configuration Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#06242e] to-[#0b3b49] text-white border border-teal-800 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5eead4] text-[#06242e] flex items-center justify-center font-black">
                  <Database size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-white">
                      تنظیمات فعال فضای ابری پارس‌پک (ParsPack Object Storage)
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-[#5eead4] border border-teal-500/30">
                      پروتکل S3 سازگار
                    </span>
                  </div>
                  <p className="text-[11px] text-teal-200/70">
                    فضای ذخیره‌سازی ویدیوهای دوره، فایل‌های دانلودی، کتابخانه رسانه‌ها و بک‌اند سایت
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestStorageConnection}
                  disabled={isTestingStorage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e3b47] hover:bg-[#144d5d] text-[#5eead4] border border-[#5eead4]/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={13} className={isTestingStorage ? 'animate-spin' : ''} />
                  <span>{isTestingStorage ? 'در حال تست...' : 'تست اتصال زنده'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveStorageConfig}
                  disabled={isSavingStorageConfig}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5eead4] hover:bg-[#2dd4bf] text-[#06242e] text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save size={13} />
                  <span>{isSavingStorageConfig ? 'در حال ثبت...' : 'ذخیره کلیدها'}</span>
                </button>
              </div>
            </div>

            {/* Test Result Feedback */}
            {storageTestResult && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2.5 border ${
                storageTestResult.success
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
              }`}>
                {storageTestResult.success ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> : <AlertTriangle size={16} className="text-rose-400 shrink-0" />}
                <div className="flex-1">
                  <div className="font-bold">{storageTestResult.message}</div>
                  {storageTestResult.bucket && (
                    <div className="text-[10px] opacity-80 font-mono mt-0.5" dir="ltr">
                      Bucket: {storageTestResult.bucket} | Endpoint: {storageTestResult.endpoint}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Credentials Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Endpoint URL */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-teal-200 flex items-center justify-between">
                  <span>End Point URL (آدرس سرور پارس‌پک):</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(parspackEndpoint, 'آدرس Endpoint')}
                    className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                  >
                    {copiedKey === 'آدرس Endpoint' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedKey === 'آدرس Endpoint' ? 'کپی شد' : 'کپی'}</span>
                  </button>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={parspackEndpoint}
                    onChange={e => setParspackEndpoint(e.target.value)}
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-teal-800 text-xs font-mono text-[#5eead4] focus:outline-hidden focus:border-[#5eead4]"
                  />
                </div>
              </div>

              {/* Bucket Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-teal-200 flex items-center justify-between">
                  <span>نام سطل ذخیره‌سازی (Bucket Name):</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(parspackBucket, 'نام سطل')}
                    className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                  >
                    {copiedKey === 'نام سطل' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedKey === 'نام سطل' ? 'کپی شد' : 'کپی'}</span>
                  </button>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={parspackBucket}
                    onChange={e => setParspackBucket(e.target.value)}
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-teal-800 text-xs font-mono text-white focus:outline-hidden focus:border-[#5eead4]"
                  />
                </div>
              </div>

              {/* Access Key */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-teal-200 flex items-center justify-between">
                  <span>Access Key:</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(parspackAccessKey, 'Access Key')}
                    className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                  >
                    {copiedKey === 'Access Key' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedKey === 'Access Key' ? 'کپی شد' : 'کپی'}</span>
                  </button>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={parspackAccessKey}
                    onChange={e => setParspackAccessKey(e.target.value)}
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-teal-800 text-xs font-mono text-white focus:outline-hidden focus:border-[#5eead4]"
                  />
                </div>
              </div>

              {/* Secret Key */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-teal-200 flex items-center justify-between">
                  <span>Secret Key:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                    >
                      {showSecretKey ? <EyeOff size={12} /> : <Eye size={12} />}
                      <span>{showSecretKey ? 'مخفی' : 'نمایش'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(parspackSecretKey, 'Secret Key')}
                      className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                    >
                      {copiedKey === 'Secret Key' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedKey === 'Secret Key' ? 'کپی شد' : 'کپی'}</span>
                    </button>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showSecretKey ? 'text' : 'password'}
                    value={parspackSecretKey}
                    onChange={e => setParspackSecretKey(e.target.value)}
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-teal-800 text-xs font-mono text-white focus:outline-hidden focus:border-[#5eead4]"
                  />
                </div>
              </div>

            </div>

            {/* Quick Test Upload Box */}
            <div className="pt-3 border-t border-teal-800/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40 p-3.5 rounded-xl border border-teal-900/60">
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-white flex items-center gap-1.5">
                    <UploadCloud size={15} className="text-[#5eead4]" />
                    <span>تست زنده آپلود فایل در فضای ابری پارس‌پک</span>
                  </div>
                  <p className="text-[10px] text-teal-200/70">
                    یک فایل آزمایشی انتخاب فرمایید تا مستقیماً در سطل پارس‌پک شما آپلود شده و آدرس نهایی نمایش داده شود.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b3b49] hover:bg-[#0e4859] border border-teal-700 text-[#5eead4] text-xs font-bold transition-all cursor-pointer">
                    <UploadCloud size={14} />
                    <span>انتخاب فایل آزمایشی...</span>
                    <input
                      type="file"
                      onChange={handleTestFileUpload}
                      disabled={testUploadLoading}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              {/* Upload Progress Bar */}
              {testUploadLoading && testUploadProgress !== null && (
                <div className="mt-3 p-3 bg-slate-950/60 rounded-xl border border-teal-800 space-y-1.5">
                  <div className="flex justify-between text-[11px] text-teal-200">
                    <span>در حال بارگذاری به سطل پارس‌پک ({parspackBucket})...</span>
                    <span className="font-mono font-bold text-[#5eead4]">{testUploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#5eead4] h-2 transition-all duration-300"
                      style={{ width: `${testUploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Result */}
              {testUploadedAsset && (
                <div className="mt-3 p-3 bg-emerald-950/50 rounded-xl border border-emerald-600/50 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 size={15} />
                      <span>فایل آزمایشی با موفقیت در پارس‌پک ذخیره شد!</span>
                    </span>
                    <span className="text-[10px] font-mono text-teal-200">{testUploadedAsset.size}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/70 p-2 rounded-lg border border-teal-900/60">
                    <input
                      type="text"
                      readOnly
                      value={testUploadedAsset.url}
                      dir="ltr"
                      className="flex-1 bg-transparent text-[11px] font-mono text-[#5eead4] outline-hidden truncate"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(testUploadedAsset.url, 'آدرس فایل آپلود شده')}
                      className="text-xs px-2 py-1 rounded bg-[#0b3b49] hover:bg-[#5eead4] hover:text-[#06242e] text-white transition-colors cursor-pointer shrink-0 font-bold"
                    >
                      کپی آدرس
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Guidance Note */}
            <div className="p-3.5 bg-teal-950/50 rounded-xl border border-teal-800/80 text-[11px] leading-relaxed text-teal-100/90 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#5eead4]" />
                <span>وضعیت کامل اتصال فضای ذخیره‌سازی:</span>
              </div>
              <p>
                تمامی تنظیمات اتصال به فضای ابری پارس‌پک، صدور کلیدهای امنیتی، آپلود ویدیوها، اسناد PDF و دانلود دوره‌ها در بک‌اند سایت (Express) پیکربندی و متصل شده است. در صورت نیاز به پخش عمومی بدون محدودیت توکن، کافی است دسترسی خواندن (Public Read) روی سطل ذخیره‌سازی در پنل پارس‌پک فعال باشد.
              </p>
            </div>
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
