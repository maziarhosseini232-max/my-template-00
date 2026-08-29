import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  MoveUp, 
  MoveDown, 
  GripVertical, 
  ChevronDown, 
  ChevronUp, 
  Video, 
  FileText, 
  Eye, 
  Sparkles, 
  Copy, 
  Check, 
  Clock, 
  Layers,
  FilePlus,
  Play
} from 'lucide-react';
import { CourseModule, Lesson } from '../../../types';
import { toPersianDigits } from '../../../utils/persian';
import { LessonContentEditorModal } from './LessonContentEditorModal';

interface CurriculumBuilderProps {
  modules: CourseModule[];
  onChange: (modules: CourseModule[]) => void;
}

export const CurriculumBuilder: React.FC<CurriculumBuilderProps> = ({
  modules,
  onChange
}) => {
  const [editingLessonInfo, setEditingLessonInfo] = useState<{
    lesson: Lesson;
    moduleIndex: number;
    lessonIndex: number;
    moduleTitle: string;
  } | null>(null);

  const [expandedModuleIds, setExpandedModuleIds] = useState<string[]>(
    modules.map(m => m.id)
  );

  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingChapterTitle, setEditingChapterTitle] = useState('');

  // Drag & drop state for lessons
  const [draggedLesson, setDraggedLesson] = useState<{ moduleIndex: number; lessonIndex: number } | null>(null);

  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
  const totalMinutes = modules.reduce(
    (s, m) => s + m.lessons.reduce((ls, l) => ls + (l.durationMinutes || 0), 0),
    0
  );

  const toggleExpand = (modId: string) => {
    setExpandedModuleIds(prev => 
      prev.includes(modId) ? prev.filter(id => id !== modId) : [...prev, modId]
    );
  };

  const handleAddModule = () => {
    if (!newChapterTitle.trim()) return;
    const newMod: CourseModule = {
      id: `mod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: newChapterTitle.trim(),
      description: 'سرفصل جدید دوره',
      order: modules.length + 1,
      lessons: [
        {
          id: `les-${Date.now()}-1`,
          title: `معرفی سرفصل ${newChapterTitle.trim()}`,
          durationMinutes: 10,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          isPreviewFree: modules.length === 0, // First lesson is free by default
          description: 'جلسه افتتاحیه این بخش'
        }
      ]
    };
    onChange([...modules, newMod]);
    setExpandedModuleIds(prev => [...prev, newMod.id]);
    setNewChapterTitle('');
  };

  const handleRemoveModule = (modIndex: number) => {
    const updated = modules.filter((_, idx) => idx !== modIndex);
    onChange(updated);
  };

  const handleMoveModule = (modIndex: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && modIndex === 0) || (direction === 'down' && modIndex === modules.length - 1)) return;
    const updated = [...modules];
    const targetIndex = direction === 'up' ? modIndex - 1 : modIndex + 1;
    const temp = updated[modIndex];
    updated[modIndex] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  const handleSaveChapterTitle = (modIndex: number) => {
    if (!editingChapterTitle.trim()) return;
    const updated = [...modules];
    updated[modIndex] = { ...updated[modIndex], title: editingChapterTitle.trim() };
    onChange(updated);
    setEditingChapterId(null);
  };

  const handleAddLesson = (modIndex: number) => {
    const targetModule = modules[modIndex];
    const newLesson: Lesson = {
      id: `les-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `جلسه ${toPersianDigits(targetModule.lessons.length + 1)}: آموزش کاربردی`,
      durationMinutes: 12,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      isPreviewFree: false,
      description: 'توضیحات و نکات تکمیلی این جلسه'
    };

    const updated = [...modules];
    updated[modIndex] = {
      ...targetModule,
      lessons: [...targetModule.lessons, newLesson]
    };
    onChange(updated);
  };

  const handleRemoveLesson = (modIndex: number, lessonIndex: number) => {
    const updated = [...modules];
    updated[modIndex] = {
      ...updated[modIndex],
      lessons: updated[modIndex].lessons.filter((_, idx) => idx !== lessonIndex)
    };
    onChange(updated);
  };

  const handleMoveLesson = (modIndex: number, lessonIndex: number, direction: 'up' | 'down') => {
    const targetMod = modules[modIndex];
    if ((direction === 'up' && lessonIndex === 0) || (direction === 'down' && lessonIndex === targetMod.lessons.length - 1)) return;

    const newLessons = [...targetMod.lessons];
    const targetIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
    const temp = newLessons[lessonIndex];
    newLessons[lessonIndex] = newLessons[targetIndex];
    newLessons[targetIndex] = temp;

    const updated = [...modules];
    updated[modIndex] = { ...targetMod, lessons: newLessons };
    onChange(updated);
  };

  const handleDuplicateLesson = (modIndex: number, lessonIndex: number) => {
    const targetMod = modules[modIndex];
    const sourceLesson = targetMod.lessons[lessonIndex];
    const cloned: Lesson = {
      ...sourceLesson,
      id: `les-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${sourceLesson.title} (کپی)`
    };

    const newLessons = [...targetMod.lessons];
    newLessons.splice(lessonIndex + 1, 0, cloned);

    const updated = [...modules];
    updated[modIndex] = { ...targetMod, lessons: newLessons };
    onChange(updated);
  };

  const handleTogglePreviewFree = (modIndex: number, lessonIndex: number) => {
    const targetMod = modules[modIndex];
    const targetLesson = targetMod.lessons[lessonIndex];
    const updated = [...modules];
    updated[modIndex] = {
      ...targetMod,
      lessons: targetMod.lessons.map((l, idx) => 
        idx === lessonIndex ? { ...l, isPreviewFree: !l.isPreviewFree } : l
      )
    };
    onChange(updated);
  };

  // Drag and Drop handlers
  const handleDragStart = (modIndex: number, lessonIndex: number) => {
    setDraggedLesson({ moduleIndex: modIndex, lessonIndex });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropLesson = (targetModIndex: number, targetLessonIndex: number) => {
    if (!draggedLesson) return;
    const { moduleIndex: srcModIdx, lessonIndex: srcLesIdx } = draggedLesson;
    if (srcModIdx === targetModIndex && srcLesIdx === targetLessonIndex) {
      setDraggedLesson(null);
      return;
    }

    const updated = [...modules];
    const [movedLesson] = updated[srcModIdx].lessons.splice(srcLesIdx, 1);
    updated[targetModIndex].lessons.splice(targetLessonIndex, 0, movedLesson);

    onChange(updated);
    setDraggedLesson(null);
  };

  const handleSaveLessonFromModal = (updatedLesson: Lesson) => {
    if (!editingLessonInfo) return;
    const { moduleIndex, lessonIndex } = editingLessonInfo;
    const updated = [...modules];
    updated[moduleIndex].lessons[lessonIndex] = updatedLesson;
    onChange(updated);
    setEditingLessonInfo(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Overview Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#def4ee] to-[#c9eee5] dark:from-[#0e3b47] dark:to-[#092b36] border border-[#5eead4]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0b3b49] dark:text-[#5eead4]">
            <Layers size={16} />
            <span>ساختار سرفصل‌ها و جلسات آموزشی دوره</span>
          </div>
          <p className="text-[11px] text-[#527683] dark:text-[#8ab5be]">
            با کشیدن و رها کردن (Drag & Drop) یا دکمه‌های جابجایی، ترتیب فصول و جلسات را سازماندهی کنید.
          </p>
        </div>

        {/* Dynamic Stats Badges */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#06242e] text-[#06242e] dark:text-white text-xs font-black shadow-xs border border-[#ccede5] dark:border-teal-900">
            {toPersianDigits(modules.length)} فصل
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#06242e] text-[#06242e] dark:text-white text-xs font-black shadow-xs border border-[#ccede5] dark:border-teal-900">
            {toPersianDigits(totalLessons)} جلسه
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#06242e] text-[#06242e] dark:text-white text-xs font-black shadow-xs border border-[#ccede5] dark:border-teal-900 flex items-center gap-1">
            <Clock size={13} className="text-[#0d9488]" />
            <span>{toPersianDigits(Math.floor(totalMinutes / 60))} ساعت و {toPersianDigits(totalMinutes % 60)} دقیقه</span>
          </span>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {modules.map((mod, modIdx) => {
          const isExpanded = expandedModuleIds.includes(mod.id);
          const isEditing = editingChapterId === mod.id;

          return (
            <div
              key={mod.id}
              className="rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 shadow-xs overflow-hidden transition-all"
            >
              {/* Chapter Header Bar */}
              <div className="p-4 bg-[#f0fbf8] dark:bg-[#092b36] border-b border-[#ccede5]/70 dark:border-teal-900/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-8 h-8 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] font-black text-xs flex items-center justify-center shrink-0">
                    {toPersianDigits(modIdx + 1)}
                  </span>

                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 max-w-md">
                      <input
                        type="text"
                        value={editingChapterTitle}
                        onChange={e => setEditingChapterTitle(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#06242e] border border-[#0d9488] text-xs text-[#06242e] dark:text-white font-bold"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveChapterTitle(modIdx)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => toggleExpand(mod.id)} 
                      className="cursor-pointer flex-1 min-w-0"
                    >
                      <h4 className="font-extrabold text-sm text-[#06242e] dark:text-white truncate">
                        فصل {toPersianDigits(modIdx + 1)}: {mod.title}
                      </h4>
                      <div className="text-[11px] text-[#527683] dark:text-[#8ab5be] mt-0.5">
                        {toPersianDigits(mod.lessons.length)} جلسه آموزشی
                      </div>
                    </div>
                  )}
                </div>

                {/* Chapter Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingChapterId(mod.id);
                      setEditingChapterTitle(mod.title);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-[#0e3b47] text-[#527683] dark:text-[#8ab5be] cursor-pointer"
                    title="تغییر نام فصل"
                  >
                    <Edit3 size={14} />
                  </button>

                  <button
                    onClick={() => handleMoveModule(modIdx, 'up')}
                    disabled={modIdx === 0}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-[#0e3b47] disabled:opacity-30 text-[#527683] dark:text-[#8ab5be] cursor-pointer"
                    title="انتقال فصل به بالا"
                  >
                    <MoveUp size={14} />
                  </button>

                  <button
                    onClick={() => handleMoveModule(modIdx, 'down')}
                    disabled={modIdx === modules.length - 1}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-[#0e3b47] disabled:opacity-30 text-[#527683] dark:text-[#8ab5be] cursor-pointer"
                    title="انتقال فصل به پایین"
                  >
                    <MoveDown size={14} />
                  </button>

                  <button
                    onClick={() => handleRemoveModule(modIdx)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 cursor-pointer"
                    title="حذف کامل فصل"
                  >
                    <Trash2 size={14} />
                  </button>

                  <button
                    onClick={() => toggleExpand(mod.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-[#0e3b47] text-[#527683] dark:text-[#8ab5be] cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Lessons Container (when expanded) */}
              {isExpanded && (
                <div className="p-4 space-y-2.5">
                  {mod.lessons.map((lesson, lesIdx) => (
                    <div
                      key={lesson.id}
                      draggable
                      onDragStart={() => handleDragStart(modIdx, lesIdx)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDropLesson(modIdx, lesIdx)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-[#ccede5]/70 dark:border-teal-900/40 bg-white dark:bg-[#082834] hover:bg-[#f0fbf8] dark:hover:bg-[#092b36] transition-colors group cursor-grab active:cursor-grabbing"
                    >
                      {/* Lesson title & meta */}
                      <div className="flex items-center gap-3 min-w-0">
                        <GripVertical size={16} className="text-slate-400 opacity-50 group-hover:opacity-100 shrink-0" />
                        <span className="p-2 rounded-lg bg-[#def4ee] dark:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4] shrink-0">
                          <Play size={14} />
                        </span>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="font-extrabold text-xs text-[#06242e] dark:text-white truncate">
                              {lesson.title}
                            </h5>

                            {lesson.isPreviewFree && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold">
                                رایگان
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-[#527683] dark:text-[#8ab5be] mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              <span>{toPersianDigits(lesson.durationMinutes || 10)} دقیقه</span>
                            </span>
                            <span>•</span>
                            <span>{lesson.contentBlocks?.length ? `${toPersianDigits(lesson.contentBlocks.length)} بلوک محتوایی` : 'ویدیو استاندارد'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Lesson Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {/* Free preview toggle button */}
                        <button
                          onClick={() => handleTogglePreviewFree(modIdx, lesIdx)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            lesson.isPreviewFree
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
                              : 'bg-slate-100 dark:bg-[#06242e] text-[#527683] dark:text-[#8ab5be] border-transparent'
                          }`}
                          title="تغییر وضعیت پیش‌نمایش رایگان"
                        >
                          {lesson.isPreviewFree ? 'نمایش رایگان ✓' : 'تنظیم رایگان'}
                        </button>

                        <button
                          onClick={() => handleMoveLesson(modIdx, lesIdx, 'up')}
                          disabled={lesIdx === 0}
                          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#0e3b47] disabled:opacity-20 text-[#527683] dark:text-[#8ab5be] cursor-pointer"
                        >
                          <MoveUp size={13} />
                        </button>

                        <button
                          onClick={() => handleMoveLesson(modIdx, lesIdx, 'down')}
                          disabled={lesIdx === mod.lessons.length - 1}
                          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#0e3b47] disabled:opacity-20 text-[#527683] dark:text-[#8ab5be] cursor-pointer"
                        >
                          <MoveDown size={13} />
                        </button>

                        <button
                          onClick={() => handleDuplicateLesson(modIdx, lesIdx)}
                          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#0e3b47] text-[#527683] dark:text-[#8ab5be] cursor-pointer"
                          title="تکثیر این جلسه"
                        >
                          <Copy size={13} />
                        </button>

                        {/* Open Lesson Content Block Editor */}
                        <button
                          onClick={() => setEditingLessonInfo({
                            lesson,
                            moduleIndex: modIdx,
                            lessonIndex: lesIdx,
                            moduleTitle: mod.title
                          })}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          <Edit3 size={12} />
                          <span>ویرایش محتوا</span>
                        </button>

                        <button
                          onClick={() => handleRemoveLesson(modIdx, lesIdx)}
                          className="p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 cursor-pointer"
                          title="حذف جلسه"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Lesson Button */}
                  <button
                    onClick={() => handleAddLesson(modIdx)}
                    className="w-full py-2.5 rounded-xl border border-dashed border-[#0d9488]/40 hover:bg-[#def4ee]/30 dark:hover:bg-[#0e3b47]/30 text-[#0d9488] dark:text-[#5eead4] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>+ افزودن جلسه جدید به این فصل</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Chapter Bar */}
      <div className="p-4 rounded-2xl bg-[#f0fbf8] dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={newChapterTitle}
          onChange={e => setNewChapterTitle(e.target.value)}
          placeholder="عنوان فصل جدید را وارد کنید (مثال: فصل ۲: پیاده‌سازی عملی و کدنویسی پروژه)..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white placeholder-[#527683] focus:outline-hidden focus:border-[#0d9488]"
          onKeyDown={e => e.key === 'Enter' && handleAddModule()}
        />
        <button
          onClick={handleAddModule}
          className="px-5 py-2.5 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] hover:bg-[#06242e] dark:hover:bg-[#2dd4bf] text-white dark:text-[#06242e] text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>+ ایجاد فصل جدید</span>
        </button>
      </div>

      {/* Lesson Content Editor Modal */}
      {editingLessonInfo && (
        <LessonContentEditorModal
          lesson={editingLessonInfo.lesson}
          moduleTitle={editingLessonInfo.moduleTitle}
          onSave={handleSaveLessonFromModal}
          onClose={() => setEditingLessonInfo(null)}
        />
      )}

    </div>
  );
};
