import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, ShieldCheck, Award, Lock, Mail, Phone, MapPin, Send, Instagram, Linkedin, Youtube, Twitter } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

export const Footer: React.FC = () => {
  const { navigate, categories, addToast, t, language, siteSettings } = useApp();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      addToast({
        title: language === 'fa' ? 'ایمیل نامعتبر' : 'Invalid Email',
        message: language === 'fa' ? 'لطفاً یک آدرس ایمیل معتبر وارد فرمایید.' : 'Please enter a valid email address.',
        type: 'error'
      });
      return;
    }
    addToast({
      title: language === 'fa' ? 'عضویت در خبرنامه لومینا' : 'Subscribed to Lumina Insights',
      message: language === 'fa' ? 'ایمیل شما با موفقیت ثبت شد. مقالات و تخفیف‌های طلایی برای شما ارسال خواهند شد.' : 'You will receive our weekly masterclass breakdowns and curated essays.',
      type: 'success'
    });
    setEmail('');
  };

  return (
    <footer className="bg-[#06242e] text-[#a5cbd3] pt-16 pb-24 md:pb-16 border-t border-teal-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter & Brand Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-teal-900/50">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#0b3b49] border border-[#5eead4]/40 rounded-lg flex items-center justify-center shadow-xs shrink-0">
                <div className="w-3.5 h-3.5 bg-[#5eead4] rounded-xs rotate-45" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-extrabold tracking-tight text-xl text-white">
                  {siteSettings?.siteName || (language === 'fa' ? 'آکادمی تخصصی لومینا' : 'MASTERPRO')}
                </span>
                <span className="text-[10px] font-bold text-[#5eead4] uppercase tracking-widest">
                  {siteSettings?.siteNameEn || 'LUMINA'}
                </span>
              </div>
            </div>
            <p className="text-sm text-[#8ab5be] max-w-md leading-relaxed">
              {siteSettings?.footerText || (language === 'fa' 
                ? 'پلتفرم جامع آموزش ویدیویی مهارت‌های خلاق، طراحی محصول، برنامه‌نویسی و هوش مصنوعی با تدریس برترین اساتید صنعت.'
                : 'The premier online course marketplace designed for ambitious learners, software architects, and creative founders.')}
            </p>

            {/* Contact Details & Social Links */}
            {(siteSettings?.contactPhone || siteSettings?.contactEmail || siteSettings?.address || siteSettings?.socialLinks) && (
              <div className="space-y-2 pt-1 text-xs text-[#8ab5be]">
                {siteSettings.address && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#5eead4] shrink-0" />
                    <span>{siteSettings.address}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-4">
                  {siteSettings.contactPhone && (
                    <div className="flex items-center gap-1.5" dir="ltr">
                      <Phone size={14} className="text-[#5eead4] shrink-0" />
                      <span>{siteSettings.contactPhone}</span>
                    </div>
                  )}
                  {siteSettings.contactEmail && (
                    <div className="flex items-center gap-1.5">
                      <Mail size={14} className="text-[#5eead4] shrink-0" />
                      <span>{siteSettings.contactEmail}</span>
                    </div>
                  )}
                </div>

                {siteSettings.socialLinks && Object.values(siteSettings.socialLinks).some(Boolean) && (
                  <div className="flex items-center gap-3 pt-2">
                    {siteSettings.socialLinks.instagram && (
                      <a href={siteSettings.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-[#0b3b49] hover:bg-[#5eead4] hover:text-[#06242e] flex items-center justify-center transition-colors text-white">
                        <Instagram size={14} />
                      </a>
                    )}
                    {siteSettings.socialLinks.telegram && (
                      <a href={siteSettings.socialLinks.telegram} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-[#0b3b49] hover:bg-[#5eead4] hover:text-[#06242e] flex items-center justify-center transition-colors text-white">
                        <Send size={14} />
                      </a>
                    )}
                    {siteSettings.socialLinks.linkedin && (
                      <a href={siteSettings.socialLinks.linkedin} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-[#0b3b49] hover:bg-[#5eead4] hover:text-[#06242e] flex items-center justify-center transition-colors text-white">
                        <Linkedin size={14} />
                      </a>
                    )}
                    {siteSettings.socialLinks.youtube && (
                      <a href={siteSettings.socialLinks.youtube} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-[#0b3b49] hover:bg-[#5eead4] hover:text-[#06242e] flex items-center justify-center transition-colors text-white">
                        <Youtube size={14} />
                      </a>
                    )}
                    {siteSettings.socialLinks.twitter && (
                      <a href={siteSettings.socialLinks.twitter} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-[#0b3b49] hover:bg-[#5eead4] hover:text-[#06242e] flex items-center justify-center transition-colors text-white">
                        <Twitter size={14} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#ccede5] pt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#5eead4]" />
                <span>{language === 'fa' ? 'اساتید تایید صلاحیت‌شده' : 'Verified Instructors'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award size={16} className="text-[#5eead4]" />
                <span>{language === 'fa' ? 'گواهی‌نامه رسمی قابل استعلام' : 'Accredited Certificates'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock size={16} className="text-[#5eead4]" />
                <span>{language === 'fa' ? 'پرداخت امن شبکه شاپرک' : '256-Bit SSL Encrypted'}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center">
            <h4 className="text-sm font-bold text-white mb-2">
              {language === 'fa' ? 'عضویت در خبرنامه تحلیلی و تخصصی لومینا' : 'Join Lumina Weekly Dispatch'}
            </h4>
            <p className="text-xs text-[#8ab5be] mb-4">
              {language === 'fa' 
                ? 'دریافت جدیدترین آموزش‌ها، نقدهای دیزاین سیستم و کدهای تخفیف ویژه مستقیماً در ایمیل شما.'
                : 'Get hand-picked course excerpts, design system audits, and early bird discounts directly to your inbox.'}
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={language === 'fa' ? 'ایمیل کاری یا شخصی خود را وارد کنید...' : 'Enter your work email address...'}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#0b3b49] border border-teal-800 text-sm text-white placeholder:text-[#6a98a3] focus:outline-hidden focus:border-[#5eead4]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#5eead4] hover:bg-[#2dd4bf] text-[#06242e] font-extrabold text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                <span>{language === 'fa' ? 'عضویت' : 'Subscribe'}</span>
                <ArrowLeft size={14} className={language === 'fa' ? '' : 'rotate-180'} />
              </button>
            </form>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-teal-900/50 text-xs">
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-4">
              {language === 'fa' ? 'دسته‌بندی‌های برتر' : 'Top Disciplines'}
            </h5>
            <ul className="space-y-2.5">
              {categories.slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => navigate('catalog', undefined, `category=${cat.id}`)}
                    className="hover:text-[#5eead4] transition-colors cursor-pointer"
                  >
                    {language === 'fa' ? cat.nameFa : cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-4">
              {language === 'fa' ? 'تجربه یادگیری' : 'Learning Experience'}
            </h5>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => navigate('catalog')} className="hover:text-[#5eead4] transition-colors cursor-pointer">
                  {t('allCourses')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('dashboard')} className="hover:text-[#5eead4] transition-colors cursor-pointer">
                  {t('myLearning')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('certificates')} className="hover:text-[#5eead4] transition-colors cursor-pointer">
                  {t('certificates')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('catalog', undefined, 'sort=popular')} className="hover:text-[#5eead4] transition-colors cursor-pointer">
                  {t('bestsellers')}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-4">
              {language === 'fa' ? 'تدریس و سازمان‌ها' : 'Teaching & Enterprise'}
            </h5>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => navigate('instructor')} className="hover:text-[#5eead4] transition-colors cursor-pointer">
                  {t('teachOnLumina')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('instructor')} className="hover:text-[#5eead4] transition-colors cursor-pointer">
                  {t('instructorStudio')}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-4">
              {language === 'fa' ? 'قوانین و اعتماد' : 'Legal & Trust'}
            </h5>
            <ul className="space-y-2.5">
              <li className="hover:text-[#5eead4] transition-colors cursor-pointer">
                {language === 'fa' ? 'ضمانت بازگشت وجه تا ۳۰ روز' : '30-Day Refund Policy'}
              </li>
              <li className="hover:text-[#5eead4] transition-colors cursor-pointer">
                {language === 'fa' ? 'حریم خصوصی و امنیت داده‌ها' : 'Privacy Framework'}
              </li>
              <li className="hover:text-[#5eead4] transition-colors cursor-pointer">
                {language === 'fa' ? 'شرایط و قوانین استفاده' : 'Terms of Service'}
              </li>
              <li className="hover:text-[#5eead4] transition-colors cursor-pointer">
                {language === 'fa' ? 'پروتکل‌های امنیت شاپرک' : 'Security & Compliance'}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8ab5be]">
          <div>
            {siteSettings?.copyrightText || (language === 'fa'
              ? `© ۱۴۰۴ آکادمی لومینا لرن. تمامی حقوق مادی و معنوی محفوظ است.`
              : `© ${new Date().getFullYear()} MasterPro Lumina Inc. All rights reserved.`)}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-[#0b3b49] px-2.5 py-1 rounded-full text-[11px] text-[#ccede5]">
              <span className="w-1.5 h-1.5 bg-[#5eead4] rounded-full animate-pulse" />
              <span>{language === 'fa' ? 'وضعیت سامانه: فعال و پایدار' : 'Platform Status: Operational'}</span>
            </div>
            <span>{language === 'fa' ? 'توسعه‌یافته برای متخصصان پیشرو' : 'Built for world-class mastery'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
