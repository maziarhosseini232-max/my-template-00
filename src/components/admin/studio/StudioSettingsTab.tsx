import React, { useState } from 'react';
import { Settings, Shield, Server, Video, Save, CheckCircle2, Sparkles, Sliders } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const StudioSettingsTab: React.FC = () => {
  const { addToast } = useApp();

  const [cdnProvider, setCdnProvider] = useState('arvan');
  const [videoWatermark, setVideoWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState('LuminaLearn - شناسه دانشجو: {USER_ID}');
  const [defaultPlatformFee, setDefaultPlatformFee] = useState(20);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30);

  const handleSaveSettings = () => {
    addToast({
      title: 'تنظیمات استودیو ذخیره شد',
      message: 'پیکربندی سرورهای پخش ویدیو و واترمارک امنیتی به‌روزرسانی گردید.',
      type: 'success'
    });
  };

  return (
    <div className="space-y-6 text-xs max-w-4xl">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-[#06242e] dark:text-white">
          تنظیمات زیرساخت استودیو و پخش ویدیو
        </h2>
        <p className="text-xs text-[#527683] dark:text-[#8ab5be] mt-0.5">
          تنظیمات CDN، پروتکل‌های رمزنگاری HLS، واترمارک ضد سرقت و کارمزد پلتفرم
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 shadow-xs space-y-6">
        
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

        {/* Save Button */}
        <div className="pt-4 border-t border-[#ccede5]/60 dark:border-teal-900/40 flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="px-6 py-2.5 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] font-black text-xs flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Save size={16} />
            <span>ذخیره تنظیمات استودیو</span>
          </button>
        </div>

      </div>

    </div>
  );
};
