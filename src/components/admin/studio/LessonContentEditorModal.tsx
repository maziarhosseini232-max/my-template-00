import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Video, 
  FileText, 
  FileCheck, 
  Headphones, 
  Code, 
  Quote, 
  Link as LinkIcon, 
  HelpCircle, 
  Download, 
  Sparkles, 
  Check, 
  FolderOpen,
  Eye,
  Clock
} from 'lucide-react';
import { Lesson, LessonContentBlock, LessonContentType } from '../../../types';
import { toPersianDigits } from '../../../utils/persian';
import { useApp } from '../../../context/AppContext';

interface LessonContentEditorModalProps {
  lesson: Lesson;
  moduleTitle: string;
  onSave: (updatedLesson: Lesson) => void;
  onClose: () => void;
}

export const LessonContentEditorModal: React.FC<LessonContentEditorModalProps> = ({
  lesson,
  moduleTitle,
  onSave,
  onClose
}) => {
  const { mediaAssets } = useApp();

  const [title, setTitle] = useState(lesson.title);
  const [durationMinutes, setDurationMinutes] = useState(lesson.durationMinutes || 10);
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || '');
  const [isPreviewFree, setIsPreviewFree] = useState(!!lesson.isPreviewFree);
  const [description, setDescription] = useState(lesson.description || '');
  const [blocks, setBlocks] = useState<LessonContentBlock[]>(lesson.contentBlocks || [
    {
      id: 'b-vid',
      type: 'video',
      title: 'ویدیو جلسه',
      content: lesson.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      caption: 'ویدیوی اصلی جلسه آموزشی با کیفیت FHD',
      meta: { duration: `${lesson.durationMinutes || 10}:00` }
    },
    {
      id: 'b-notes',
      type: 'text',
      title: 'یادداشت‌ها و نکات کلیدی جلسه',
      content: lesson.description || 'در این جلسه به بررسی اصول پایه و نکات اجرایی می‌پردازیم.'
    }
  ]);

  const [showMediaPickerBlockId, setShowMediaPickerBlockId] = useState<string | null>(null);

  const handleAddBlock = (type: LessonContentType) => {
    const newBlock: LessonContentBlock = {
      id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title: 
        type === 'video' ? 'ویدیو آموزشی' :
        type === 'text' ? 'متن و توضیحات تکمیلی' :
        type === 'pdf' ? 'فایل جزوه و اسلاید PDF' :
        type === 'audio' ? 'فایل صوتی و پادکست' :
        type === 'code' ? 'قطعه کد و تمرین برنامه‌نویسی' :
        type === 'quote' ? 'نقل‌قول و نکته کلیدی' :
        type === 'link' ? 'لینک منبع خارجی' :
        type === 'quiz' ? 'کوئیز و آزمونک' : 'فایل دانلودی ضمیمه',
      content: type === 'code' ? '// کد نمونه این جلسه\nconst greeting = "سلام دنیا";' : '',
      meta: type === 'code' ? { language: 'typescript' } : {}
    };

    setBlocks(prev => [...prev, newBlock]);
  };

  const handleRemoveBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    setBlocks(newBlocks);
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<LessonContentBlock>) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, ...updates } : b));
  };

  const handleSave = () => {
    // Find primary video block url if available
    const primaryVideo = blocks.find(b => b.type === 'video');
    const updated: Lesson = {
      ...lesson,
      title,
      durationMinutes: Number(durationMinutes) || 10,
      videoUrl: primaryVideo?.content || videoUrl,
      isPreviewFree,
      description,
      contentBlocks: blocks
    };
    onSave(updated);
  };

  const blockTypeIcons: Record<LessonContentType, React.FC<{ size?: number; className?: string }>> = {
    video: Video,
    text: FileText,
    pdf: FileCheck,
    audio: Headphones,
    code: Code,
    quote: Quote,
    link: LinkIcon,
    quiz: HelpCircle,
    assignment: FileCheck,
    download: Download,
    image: FolderOpen
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#06242e] rounded-3xl max-w-3xl w-full border border-[#ccede5] dark:border-teal-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-[#f0fbf8] dark:bg-[#092b36] border-b border-[#ccede5] dark:border-teal-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] flex items-center justify-center font-bold shadow-xs">
              <FileText size={20} />
            </div>
            <div>
              <div className="text-[11px] text-[#0d9488] dark:text-[#5eead4] font-bold">
                سرفصل: {moduleTitle}
              </div>
              <h3 className="font-extrabold text-base text-[#06242e] dark:text-white">
                ویرایشگر پیشرفته جلسه آموزشی
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#527683] hover:text-[#06242e] dark:text-[#8ab5be] dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#0e3b47] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-[#06242e] dark:text-white">
                عنوان جلسه <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="مثال: معرفی توکن‌های دیزاین و متغیرهای رنگی"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-[#06242e] dark:text-white focus:outline-hidden focus:border-[#0d9488]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#06242e] dark:text-white flex items-center gap-1">
                <Clock size={13} className="text-[#0d9488]" />
                <span>مدت زمان (دقیقه)</span>
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                min={1}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-[#06242e] dark:text-white focus:outline-hidden focus:border-[#0d9488]"
              />
            </div>
          </div>

          {/* Free Preview Option Toggle */}
          <div className="p-3.5 rounded-2xl bg-[#def4ee]/50 dark:bg-[#0e3b47]/40 border border-[#ccede5] dark:border-teal-900/60 flex items-center justify-between">
            <div>
              <div className="font-bold text-[#0b3b49] dark:text-[#5eead4]">
                جلسه رایگان پیش‌نمایش (Free Preview)
              </div>
              <div className="text-[11px] text-[#527683] dark:text-[#8ab5be] mt-0.5">
                کاربران می‌توانند بدون خرید دوره، این جلسه را به عنوان نمونه تماشا کنند.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPreviewFree}
                onChange={e => setIsPreviewFree(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Block-based Content Stream */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-[#06242e] dark:text-white">
                  بلوک‌های محتوایی جلسه ({toPersianDigits(blocks.length)})
                </h4>
                <p className="text-[11px] text-[#527683] dark:text-[#8ab5be]">
                  ترکیب ویدیو، متن، فایل‌های ضمیمه، کدهای برنامه‌نویسی و کوئیز
                </p>
              </div>
            </div>

            {/* Block items */}
            <div className="space-y-3">
              {blocks.map((block, index) => {
                const Icon = blockTypeIcons[block.type] || FileText;

                return (
                  <div
                    key={block.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#082834] border border-[#ccede5] dark:border-teal-900 shadow-xs space-y-3 relative"
                  >
                    {/* Block header */}
                    <div className="flex items-center justify-between gap-2 border-b border-[#ccede5]/60 dark:border-teal-900/40 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-[#def4ee] dark:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4]">
                          <Icon size={16} />
                        </span>
                        <input
                          type="text"
                          value={block.title || ''}
                          onChange={e => handleUpdateBlock(block.id, { title: e.target.value })}
                          className="font-bold text-xs bg-transparent border-0 text-[#06242e] dark:text-white focus:ring-0 p-0"
                          placeholder="عنوان بلوک..."
                        />
                      </div>

                      {/* Block ordering & delete */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveBlock(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#0e3b47] disabled:opacity-30 text-[#527683] dark:text-[#8ab5be] cursor-pointer"
                        >
                          <MoveUp size={14} />
                        </button>
                        <button
                          onClick={() => handleMoveBlock(index, 'down')}
                          disabled={index === blocks.length - 1}
                          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#0e3b47] disabled:opacity-30 text-[#527683] dark:text-[#8ab5be] cursor-pointer"
                        >
                          <MoveDown size={14} />
                        </button>
                        <button
                          onClick={() => handleRemoveBlock(block.id)}
                          className="p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Block inputs depending on type */}
                    {block.type === 'video' ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={block.content}
                            onChange={e => handleUpdateBlock(block.id, { content: e.target.value })}
                            placeholder="آدرس اینترنتی ویدیو (MP4 / HLS / Direct URL)..."
                            className="flex-1 px-3 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white focus:outline-hidden"
                          />
                          <button
                            onClick={() => setShowMediaPickerBlockId(block.id)}
                            className="px-3 py-2 rounded-xl bg-[#def4ee] dark:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4] font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <FolderOpen size={14} />
                            <span>انتخاب از رسانه‌ها</span>
                          </button>
                        </div>
                        {block.content && (
                          <div className="rounded-xl overflow-hidden aspect-video max-h-48 bg-black/10 border border-slate-200 dark:border-teal-900">
                            <video
                              src={block.content}
                              controls
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    ) : block.type === 'code' ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#527683] dark:text-[#8ab5be]">ویرایشگر کد:</span>
                          <select
                            value={block.meta?.language || 'typescript'}
                            onChange={e => handleUpdateBlock(block.id, { meta: { ...block.meta, language: e.target.value } })}
                            className="px-2 py-1 rounded-lg bg-[#f0fbf8] dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-[11px] text-[#06242e] dark:text-white"
                          >
                            <option value="typescript">TypeScript</option>
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="html">HTML/CSS</option>
                            <option value="json">JSON</option>
                          </select>
                        </div>
                        <textarea
                          value={block.content}
                          onChange={e => handleUpdateBlock(block.id, { content: e.target.value })}
                          rows={4}
                          dir="ltr"
                          className="w-full p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs border border-slate-700 focus:outline-hidden"
                          placeholder="// کدهای تمرینی این جلسه..."
                        />
                      </div>
                    ) : block.type === 'pdf' || block.type === 'download' ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={block.content}
                            onChange={e => handleUpdateBlock(block.id, { content: e.target.value })}
                            placeholder="لینک دانلود فایل یا جزوه PDF..."
                            className="flex-1 px-3 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white focus:outline-hidden"
                          />
                          <button
                            onClick={() => setShowMediaPickerBlockId(block.id)}
                            className="px-3 py-2 rounded-xl bg-[#def4ee] dark:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4] font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <FolderOpen size={14} />
                            <span>انتخاب فایل</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <textarea
                          value={block.content}
                          onChange={e => handleUpdateBlock(block.id, { content: e.target.value })}
                          rows={3}
                          className="w-full p-3 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white focus:outline-hidden"
                          placeholder="محتوای متنی، نکات و توضیحات..."
                        />
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Add Block Toolbar */}
            <div className="p-4 rounded-2xl bg-[#f0fbf8] dark:bg-[#092b36] border border-dashed border-[#ccede5] dark:border-teal-900 space-y-2">
              <div className="font-bold text-xs text-[#06242e] dark:text-white">
                + افزودن بلوک جدید به جلسه:
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleAddBlock('video')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0e3b47] hover:bg-[#def4ee] dark:hover:bg-[#124d5d] text-[#06242e] dark:text-slate-200 border border-[#ccede5] dark:border-teal-800 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Video size={14} className="text-blue-500" />
                  <span>ویدیو</span>
                </button>
                <button
                  onClick={() => handleAddBlock('text')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0e3b47] hover:bg-[#def4ee] dark:hover:bg-[#124d5d] text-[#06242e] dark:text-slate-200 border border-[#ccede5] dark:border-teal-800 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText size={14} className="text-emerald-500" />
                  <span>متن و توضیحات</span>
                </button>
                <button
                  onClick={() => handleAddBlock('code')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0e3b47] hover:bg-[#def4ee] dark:hover:bg-[#124d5d] text-[#06242e] dark:text-slate-200 border border-[#ccede5] dark:border-teal-800 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Code size={14} className="text-purple-500" />
                  <span>قطعه کد (Code)</span>
                </button>
                <button
                  onClick={() => handleAddBlock('pdf')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0e3b47] hover:bg-[#def4ee] dark:hover:bg-[#124d5d] text-[#06242e] dark:text-slate-200 border border-[#ccede5] dark:border-teal-800 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileCheck size={14} className="text-rose-500" />
                  <span>جزوه PDF</span>
                </button>
                <button
                  onClick={() => handleAddBlock('download')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0e3b47] hover:bg-[#def4ee] dark:hover:bg-[#124d5d] text-[#06242e] dark:text-slate-200 border border-[#ccede5] dark:border-teal-800 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={14} className="text-amber-500" />
                  <span>فایل دانلودی</span>
                </button>
                <button
                  onClick={() => handleAddBlock('quote')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0e3b47] hover:bg-[#def4ee] dark:hover:bg-[#124d5d] text-[#06242e] dark:text-slate-200 border border-[#ccede5] dark:border-teal-800 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Quote size={14} className="text-teal-500" />
                  <span>نقل‌قول و نکته</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f0fbf8] dark:bg-[#092b36] border-t border-[#ccede5] dark:border-teal-900/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#06242e] hover:bg-slate-200 dark:hover:bg-[#0e3b47] text-[#06242e] dark:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            انصراف
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] hover:bg-[#06242e] dark:hover:bg-[#2dd4bf] text-white dark:text-[#06242e] text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Check size={16} />
            <span>ذخیره تغییرات جلسه</span>
          </button>
        </div>

      </div>

      {/* Media Picker Modal */}
      {showMediaPickerBlockId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#06242e] rounded-2xl max-w-xl w-full p-6 border border-[#ccede5] dark:border-teal-900 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-[#06242e] dark:text-white">
                انتخاب فایل از کتابخانه رسانه‌ها
              </h4>
              <button
                onClick={() => setShowMediaPickerBlockId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1">
              {mediaAssets.map(asset => (
                <div
                  key={asset.id}
                  onClick={() => {
                    handleUpdateBlock(showMediaPickerBlockId, { content: asset.url });
                    setShowMediaPickerBlockId(null);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#ccede5] dark:border-teal-900 hover:bg-[#def4ee]/50 dark:hover:bg-[#0e3b47] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-[#def4ee] dark:bg-[#092b36] text-[#0d9488] dark:text-[#5eead4]">
                      {asset.type === 'video' ? <Video size={16} /> : <FileText size={16} />}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-[#06242e] dark:text-white line-clamp-1">
                        {asset.name}
                      </div>
                      <div className="text-[10px] text-[#527683] dark:text-[#8ab5be]">
                        {asset.fileSize} • {asset.createdAt}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] text-[10px] font-bold">
                    انتخاب
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
