import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  FolderOpen, 
  Search, 
  UploadCloud, 
  Trash2, 
  Copy, 
  Play, 
  FileText, 
  Image as ImageIcon, 
  Headphones, 
  Download, 
  Eye, 
  Filter, 
  Plus, 
  Check, 
  Clock, 
  FileCheck 
} from 'lucide-react';
import { toPersianDigits } from '../../../utils/persian';
import { MediaAsset } from '../../../types';

interface MediaLibraryTabProps {
  onOpenBulkUpload: () => void;
}

export const MediaLibraryTab: React.FC<MediaLibraryTabProps> = ({ onOpenBulkUpload }) => {
  const { mediaAssets, addMediaAsset, deleteMediaAsset, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  const [showAddUrlModal, setShowAddUrlModal] = useState(false);
  const [newUrlName, setNewUrlName] = useState('');
  const [newUrlLink, setNewUrlLink] = useState('');
  const [newUrlType, setNewUrlType] = useState<MediaAsset['type']>('video');

  const filteredAssets = useMemo(() => {
    return mediaAssets.filter(asset => {
      const matchesSearch = !searchTerm.trim() || asset.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = activeType === 'all' || asset.type === activeType;
      return matchesSearch && matchesType;
    });
  }, [mediaAssets, searchTerm, activeType]);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    addToast({
      title: 'لینک کپی شد',
      message: 'آدرس فایل در کلیپ‌بورد کپی شد.',
      type: 'info'
    });
  };

  const handleAddDirectUrl = () => {
    if (!newUrlName.trim() || !newUrlLink.trim()) return;
    addMediaAsset({
      name: newUrlName.trim(),
      url: newUrlLink.trim(),
      type: newUrlType,
      fileSize: 'ابر سرور لومینا',
      mimeType: newUrlType === 'video' ? 'video/mp4' : newUrlType === 'image' ? 'image/webp' : 'application/pdf',
      thumbnailUrl: newUrlType === 'video' ? 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600' : undefined
    });
    setNewUrlName('');
    setNewUrlLink('');
    setShowAddUrlModal(false);
  };

  const typeConfig: Record<string, { label: string; icon: React.FC<{ size?: number; className?: string }> }> = {
    all: { label: 'همه فایل‌ها', icon: FolderOpen },
    video: { label: 'ویدیوها', icon: Play },
    image: { label: 'تصاویر و کاورها', icon: ImageIcon },
    pdf: { label: 'اسناد و جزوات PDF', icon: FileCheck },
    audio: { label: 'فایل‌های صوتی', icon: Headphones },
    download: { label: 'فایل‌های دانلودی و سورس', icon: Download }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Upload Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#06242e] dark:text-white">
            کتابخانه فایل‌ها و رسانه‌ها (Media Library)
          </h2>
          <p className="text-xs text-[#527683] dark:text-[#8ab5be] mt-0.5">
            مدیریت متمرکز ویدیوها، اسناد PDF، تصاویر کاور و فایل‌های دانلودی
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddUrlModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900 text-[#06242e] dark:text-slate-200 text-xs font-bold hover:bg-[#f0fbf8] dark:hover:bg-[#092b36] transition-colors cursor-pointer"
          >
            <Plus size={15} />
            <span>ثبت با آدرس اینترنتی (URL)</span>
          </button>

          <button
            onClick={onOpenBulkUpload}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] text-xs font-extrabold shadow-sm transition-all cursor-pointer"
          >
            <UploadCloud size={16} />
            <span>بارگذاری رسانه جدید</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-[#527683] dark:text-[#8ab5be]" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="جستجو در نام فایل‌های رسانه‌ای..."
              className="w-full ps-9 pe-4 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white placeholder-[#527683] focus:outline-hidden focus:border-[#0d9488]"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 md:pb-0">
            {Object.entries(typeConfig).map(([key, config]) => {
              const Icon = config.icon;
              const isActive = activeType === key;

              return (
                <button
                  key={key}
                  onClick={() => setActiveType(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#0b3b49] text-white dark:bg-[#5eead4] dark:text-[#06242e]'
                      : 'bg-slate-100 dark:bg-[#092b36] text-[#527683] dark:text-[#8ab5be] hover:text-[#06242e] dark:hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Media Grid */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#06242e] rounded-2xl border border-[#ccede5] dark:border-teal-900/60 p-6 space-y-3">
          <FolderOpen size={36} className="mx-auto text-[#0d9488] dark:text-[#5eead4]" />
          <h3 className="font-extrabold text-sm text-[#06242e] dark:text-white">
            هیچ فایلی با این فیلتر یافت نشد
          </h3>
          <p className="text-xs text-[#527683] dark:text-[#8ab5be]">
            می‌توانید فایل‌های جدید را از طریق دکمه بارگذاری گروهی اضافه کنید.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map(asset => {
            const isVideo = asset.type === 'video';
            const isImage = asset.type === 'image';

            return (
              <div
                key={asset.id}
                className="rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Media Preview Box */}
                <div className="aspect-video bg-slate-100 dark:bg-[#092b36] relative group flex items-center justify-center overflow-hidden">
                  {isVideo ? (
                    <>
                      <img
                        src={asset.thumbnailUrl || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600'}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="w-10 h-10 rounded-full bg-white/90 text-[#06242e] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play size={18} />
                        </span>
                      </div>
                      {asset.duration && (
                        <span className="absolute bottom-2 end-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-bold">
                          {asset.duration}
                        </span>
                      )}
                    </>
                  ) : isImage ? (
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <FileCheck size={36} className="mx-auto text-rose-500 mb-1" />
                      <span className="text-[10px] font-bold text-[#527683] dark:text-[#8ab5be] uppercase">
                        {asset.mimeType}
                      </span>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2 start-2">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold backdrop-blur-xs">
                      {asset.type === 'video' ? 'ویدیو' : asset.type === 'image' ? 'تصویر' : asset.type === 'pdf' ? 'PDF' : 'فایل'}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3.5 space-y-2">
                  <h4 className="font-extrabold text-xs text-[#06242e] dark:text-white line-clamp-1" title={asset.name}>
                    {asset.name}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-[#527683] dark:text-[#8ab5be]">
                    <span>{asset.fileSize}</span>
                    <span>{asset.createdAt}</span>
                  </div>
                </div>

                {/* Action footer */}
                <div className="p-3 pt-0 flex items-center justify-between border-t border-[#ccede5]/60 dark:border-teal-900/40 mt-1">
                  <button
                    onClick={() => handleCopyUrl(asset.url)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#09222b] hover:bg-slate-200 dark:hover:bg-[#0e3b47] text-[#06242e] dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="کپی آدرس فایل"
                  >
                    <Copy size={13} />
                    <span className="text-[10px]">کپی لینک</span>
                  </button>

                  <button
                    onClick={() => deleteMediaAsset(asset.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 transition-colors cursor-pointer"
                    title="حذف رسانه"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Direct URL Modal */}
      {showAddUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#06242e] rounded-2xl max-w-md w-full p-6 border border-[#ccede5] dark:border-teal-900 shadow-xl space-y-4 text-xs">
            <h4 className="font-extrabold text-sm text-[#06242e] dark:text-white">
              ثبت رسانه با آدرس اینترنتی (Direct URL)
            </h4>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-[#06242e] dark:text-white">نام فایل</label>
                <input
                  type="text"
                  value={newUrlName}
                  onChange={e => setNewUrlName(e.target.value)}
                  placeholder="مثال: جلسه پنجم دوره ریکت.mp4"
                  className="w-full px-3 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#06242e] dark:text-white">نوع رسانه</label>
                <select
                  value={newUrlType}
                  onChange={e => setNewUrlType(e.target.value as MediaAsset['type'])}
                  className="w-full px-3 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white"
                >
                  <option value="video">ویدیو (MP4 / HLS)</option>
                  <option value="image">تصویر (WebP / JPG / PNG)</option>
                  <option value="pdf">سند PDF</option>
                  <option value="audio">فایل صوتی (MP3)</option>
                  <option value="download">فایل دانلودی (ZIP / RAR)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#06242e] dark:text-white">آدرس کامل فایل (URL)</label>
                <input
                  type="text"
                  value={newUrlLink}
                  onChange={e => setNewUrlLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#ccede5]/60 dark:border-teal-900/40">
              <button
                onClick={() => setShowAddUrlModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#09222b] text-[#06242e] dark:text-white font-bold"
              >
                انصراف
              </button>
              <button
                onClick={handleAddDirectUrl}
                className="px-4 py-2 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] font-extrabold"
              >
                افزودن به کتابخانه
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
