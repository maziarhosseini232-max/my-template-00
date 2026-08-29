import React, { useState } from 'react';
import { X, Upload, FileCode, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

interface ImportCoursePackageModalProps {
  onClose: () => void;
}

export const ImportCoursePackageModal: React.FC<ImportCoursePackageModalProps> = ({ onClose }) => {
  const { importCourseFromJson, addToast } = useApp();
  const [jsonText, setJsonText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleJson = JSON.stringify({
    title: "مسترکلاس طراحی دیزاین سیستم پیشرفته",
    subtitle: "آموزش کامل پیاده‌سازی متغیرها، توکن‌ها و کامپوننت‌های مقیاس‌پذیر در فیگما و ری‌اکت",
    description: "در این دوره تخصصی یاد می‌گیرید چگونه دیزاین سیستم‌های سازمانی را از صفر تا صد طراحی و اجرا کنید.",
    categoryId: "design",
    subCategory: "دیزاین سیستم",
    level: "intermediate",
    price: 1850000,
    originalPrice: 2400000,
    thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop",
    previewVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    modules: [
      {
        id: "mod-1",
        title: "فصل ۱: توکن‌های دیزاین و مبانی معماری",
        order: 1,
        lessons: [
          {
            id: "les-1",
            title: "درس اول: مقدمه‌ای بر ساختار توکن‌ها",
            durationMinutes: 12,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            isPreviewFree: true
          }
        ]
      }
    ]
  }, null, 2);

  const handleImport = () => {
    setErrorMsg(null);
    if (!jsonText.trim()) {
      setErrorMsg('لطفاً کد JSON پکیج دوره را وارد کنید.');
      return;
    }

    const success = importCourseFromJson(jsonText);
    if (success) {
      onClose();
    } else {
      setErrorMsg('فرمت داده‌های وارد شده نامعتبر است. لطفاً ساختار JSON را بررسی نمایید.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#06242e] rounded-3xl max-w-xl w-full border border-[#ccede5] dark:border-teal-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-xs">
        
        {/* Header */}
        <div className="p-5 bg-[#f0fbf8] dark:bg-[#092b36] border-b border-[#ccede5] dark:border-teal-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] flex items-center justify-center font-bold">
              <Upload size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#06242e] dark:text-white">
                وارد کردن دوره از فایل یا بسته JSON
              </h3>
              <p className="text-[11px] text-[#527683] dark:text-[#8ab5be]">
                ایمپورت سریع پکیج دوره‌های آماده شامل سرفصل‌ها و جلسات
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#527683] hover:text-[#06242e] dark:text-[#8ab5be] dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#0e3b47] cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          <div className="flex items-center justify-between">
            <label className="font-bold text-[#06242e] dark:text-white">
              محتوای JSON پکیج دوره:
            </label>
            <button
              onClick={() => setJsonText(sampleJson)}
              className="text-[11px] text-[#0d9488] dark:text-[#5eead4] font-bold hover:underline cursor-pointer"
            >
              درج نمونه داده استاندارد
            </button>
          </div>

          <textarea
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            rows={10}
            dir="ltr"
            placeholder="کد JSON را در اینجا قرار دهید..."
            className="w-full p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs border border-slate-700 focus:outline-hidden"
          />

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f0fbf8] dark:bg-[#092b36] border-t border-[#ccede5] dark:border-teal-900/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#09222b] text-[#06242e] dark:text-white font-bold"
          >
            انصراف
          </button>
          <button
            onClick={handleImport}
            className="px-5 py-2 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] font-extrabold flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            <span>ایمپورت و ایجاد دوره</span>
          </button>
        </div>

      </div>
    </div>
  );
};
