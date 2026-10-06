import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileCheck, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Layers, 
  Plus, 
  Trash2,
  Database,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { toPersianDigits } from '../../../utils/persian';
import { api } from '../../../services/api';

interface BulkUploadModalProps {
  onClose: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ onClose }) => {
  const { uploadQueue, addToUploadQueue, addToast, addMediaAsset } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let detectedType: 'video' | 'download' = 'download';
      if (file.type.startsWith('video/') || file.name.match(/\.(mp4|mkv|webm|mov)$/i)) {
        detectedType = 'video';
      }

      const sizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + ' مگابایت';
      
      const newItems = addToUploadQueue([
        {
          name: file.name,
          fileSize: sizeFormatted,
          type: detectedType,
          resolution: detectedType === 'video' ? '1080p FHD' : undefined
        }
      ]);

      try {
        const res = await api.storage.uploadFile(file, 'courses');
        if (res.success && res.data) {
          addMediaAsset({
            name: file.name,
            url: res.data.url,
            type: detectedType,
            fileSize: res.data.size,
            mimeType: file.type || 'application/octet-stream',
            thumbnailUrl: detectedType === 'video' ? 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600' : undefined
          });

          addToast({
            title: 'آپلود در پارس‌پک کامل شد',
            message: `فایل «${file.name}» با موفقیت در فضای ابری پارس‌پک ذخیره گردید.`,
            type: 'success'
          });
        }
      } catch (err: any) {
        addToast({
          title: 'خطا در آپلود',
          message: err.message || `آپلود «${file.name}» با مشکل مواجه شد.`,
          type: 'error'
        });
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSimulateAddFiles = () => {
    addToUploadQueue([
      { name: 'فصل ۱ - قسمت ۱: آشنایی با معماری و دیزاین سیستم.mp4', fileSize: '85.4 مگابایت', type: 'video', duration: '22:15', resolution: '1920×1080' },
      { name: 'فصل ۱ - قسمت ۲: اصول چیدمان و تایپوگرافی سازمانی.mp4', fileSize: '110.2 مگابایت', type: 'video', duration: '28:40', resolution: '1920×1080' },
      { name: 'فصل ۱ - قسمت ۳: مدیریت رنگ‌ها و کدهای Tailwind.mp4', fileSize: '94.8 مگابایت', type: 'video', duration: '25:00', resolution: '1920×1080' },
      { name: 'فایل کدهای پروژه و فایل فیگما.zip', fileSize: '42.0 مگابایت', type: 'download' }
    ]);

    addToast({
      title: 'فایل‌ها افزوده شدند',
      message: '۴ فایل به صف بارگذاری سریع اضافه شد.',
      type: 'success'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#06242e] rounded-3xl max-w-2xl w-full border border-[#ccede5] dark:border-teal-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 bg-[#f0fbf8] dark:bg-[#092b36] border-b border-[#ccede5] dark:border-teal-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] flex items-center justify-center font-bold">
              <Database size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-[#06242e] dark:text-white">
                  سیستم بارگذاری در فضای ابری پارس‌پک (ParsPack Cloud)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  متصل به سطل c984071
                </span>
              </div>
              <p className="text-[11px] text-[#527683] dark:text-[#8ab5be]">
                آپلود همزمان ویدیوهای جلسات، فایل‌های تمرین و اسناد مستقیماً روی سرورهای پارس‌پک
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          
          {/* Dropzone with real file input */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-8 rounded-2xl border-2 border-dashed border-[#0d9488] bg-[#def4ee]/30 dark:bg-[#0e3b47]/30 text-center space-y-2 cursor-pointer hover:bg-[#def4ee]/60 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="video/*,application/pdf,image/*,.zip,.rar"
              onChange={handleFilesSelected}
              className="sr-only"
            />
            <UploadCloud size={36} className="mx-auto text-[#0d9488] dark:text-[#5eead4]" />
            <div className="font-bold text-xs text-[#06242e] dark:text-white">
              {isUploading ? 'در حال ارسال فایل‌ها به فضای ابری پارس‌پک...' : 'برای انتخاب و بارگذاری فایل‌ها کلیک کنید یا فایل‌ها را به اینجا بکشید'}
            </div>
            <p className="text-[10px] text-[#527683] dark:text-[#8ab5be]">
              سرور ابری: c984071.parspack.net &bull; پشتیبانی از ویدیوهای کیفیت بالا (MP4, MKV) تا ۵۰۰ مگابایت
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSimulateAddFiles();
                }}
                className="text-[10px] font-bold text-[#0d9488] dark:text-[#5eead4] hover:underline"
              >
                یا افزودن دسته‌ای نمونه‌های آزمایشی دوره &larr;
              </button>
            </div>
          </div>

          {/* Queue items */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-[#06242e] dark:text-white flex items-center justify-between">
              <span>وضعیت آپلود فایل‌ها در پارس‌پک ({toPersianDigits(uploadQueue.length)})</span>
              {isUploading && (
                <span className="flex items-center gap-1.5 text-[#0d9488] dark:text-[#5eead4] text-[11px] font-bold">
                  <RefreshCw size={12} className="animate-spin" />
                  <span>در حال انتقال ابری...</span>
                </span>
              )}
            </h4>

            {uploadQueue.map(item => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-[#ccede5] dark:border-teal-900 bg-[#f0fbf8]/50 dark:bg-[#082834] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#def4ee] dark:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4]">
                      {item.type === 'video' ? <Play size={14} /> : <FileCheck size={14} />}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-[#06242e] dark:text-white line-clamp-1">{item.name}</div>
                      <div className="text-[10px] text-[#527683] dark:text-[#8ab5be]">{item.fileSize} {item.resolution && `• ${item.resolution}`}</div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    item.status === 'ready' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    item.status === 'processing' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status === 'ready' ? 'ذخیره در پارس‌پک ✓' : item.status === 'processing' ? 'در حال ارسال...' : `${toPersianDigits(item.progress)}٪`}
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-l from-emerald-500 to-[#0d9488] transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f0fbf8] dark:bg-[#092b36] border-t border-[#ccede5] dark:border-teal-900/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] text-xs font-bold cursor-pointer"
          >
            تایید و بستن
          </button>
        </div>

      </div>
    </div>
  );
};

