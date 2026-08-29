import React, { useState } from 'react';
import { 
  X, 
  Laptop, 
  Smartphone, 
  Play, 
  Star, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Award, 
  Globe, 
  User, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { Course } from '../../../types';
import { toPersianDigits, formatTomanPrice } from '../../../utils/persian';

interface CoursePreviewModalProps {
  course: Course;
  onClose: () => void;
}

export const CoursePreviewModal: React.FC<CoursePreviewModalProps> = ({ course, onClose }) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [expandedModules, setExpandedModules] = useState<string[]>([course.modules[0]?.id || '']);

  const toggleModule = (id: string) => {
    setExpandedModules(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#06242e] rounded-3xl w-full max-w-5xl h-[92vh] border border-[#ccede5] dark:border-teal-900 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Control Bar */}
        <div className="p-3.5 bg-[#f0fbf8] dark:bg-[#092b36] border-b border-[#ccede5] dark:border-teal-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#06242e] dark:text-white">
              پیش‌نمایش زنده صفحه دوره
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
              حالت شبیه‌ساز دانشجو
            </span>
          </div>

          {/* Device toggle */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#06242e] p-1 rounded-xl border border-[#ccede5] dark:border-teal-900">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                device === 'desktop' ? 'bg-[#0b3b49] text-white dark:bg-[#5eead4] dark:text-[#06242e]' : 'text-[#527683] dark:text-[#8ab5be]'
              }`}
            >
              <Laptop size={14} />
              <span className="text-[11px]">رایانه</span>
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                device === 'mobile' ? 'bg-[#0b3b49] text-white dark:bg-[#5eead4] dark:text-[#06242e]' : 'text-[#527683] dark:text-[#8ab5be]'
              }`}
            >
              <Smartphone size={14} />
              <span className="text-[11px]">موبایل</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#527683] hover:text-[#06242e] dark:text-[#8ab5be] dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#0e3b47] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewport Frame */}
        <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-[#04171d] p-4 flex justify-center">
          <div className={`w-full transition-all duration-300 bg-white dark:bg-[#06242e] rounded-2xl shadow-md border border-[#ccede5] dark:border-teal-900/60 overflow-hidden ${
            device === 'mobile' ? 'max-w-sm' : 'max-w-4xl'
          }`}>
            
            {/* Course Hero */}
            <div className="p-6 md:p-8 bg-gradient-to-b from-[#def4ee]/60 to-white dark:from-[#0e3b47]/60 dark:to-[#06242e] border-b border-[#ccede5] dark:border-teal-900/60 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#0d9488] dark:text-[#5eead4]">
                <span>{course.categoryName}</span>
                <span>•</span>
                <span>{course.subCategory}</span>
                <span>•</span>
                <span>سطح: {course.level === 'all' ? 'همه سطوح' : course.level}</span>
              </div>

              <h1 className="text-xl md:text-2xl font-black text-[#06242e] dark:text-white leading-snug">
                {course.title}
              </h1>

              <p className="text-xs md:text-sm text-[#527683] dark:text-[#8ab5be] leading-relaxed">
                {course.subtitle}
              </p>

              {/* Instructor & Rating */}
              <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
                <div className="flex items-center gap-2">
                  <img src={course.instructorAvatar} alt={course.instructorName} className="w-8 h-8 rounded-full object-cover border border-[#5eead4]" />
                  <span className="font-bold text-[#06242e] dark:text-white">{course.instructorName}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star size={14} className="fill-amber-500" />
                  <span>{toPersianDigits(course.rating)}</span>
                  <span className="text-[#527683] dark:text-[#8ab5be]">({toPersianDigits(course.reviewCount)} نظر)</span>
                </div>
                <div className="flex items-center gap-1 text-[#527683] dark:text-[#8ab5be]">
                  <User size={14} />
                  <span>{toPersianDigits(course.studentCount)} دانشجو</span>
                </div>
              </div>
            </div>

            {/* Video & Purchase Box */}
            <div className="p-6 space-y-6">
              
              <div className="aspect-video rounded-2xl overflow-hidden bg-black/10 relative shadow-sm border border-[#ccede5] dark:border-teal-900">
                {course.previewVideoUrl ? (
                  <video src={course.previewVideoUrl} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                )}
              </div>

              {/* Price and CTA */}
              <div className="p-4 rounded-2xl bg-[#def4ee]/40 dark:bg-[#0e3b47]/40 border border-[#ccede5] dark:border-teal-900 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-[#527683] dark:text-[#8ab5be]">شهریه ثبت‌نام دوره</div>
                  <div className="text-lg font-black text-[#0b3b49] dark:text-[#5eead4]">
                    {course.price === 0 ? 'کاملاً رایگان' : formatTomanPrice(course.price)}
                  </div>
                </div>
                <button className="px-6 py-3 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] font-black text-xs shadow-sm">
                  ثبت‌نام در دوره
                </button>
              </div>

              {/* What you'll learn */}
              {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                <div className="p-5 rounded-2xl border border-[#ccede5] dark:border-teal-900 space-y-3">
                  <h3 className="font-extrabold text-sm text-[#06242e] dark:text-white">
                    آنچه در این دوره می‌آموزید
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {course.whatYouWillLearn.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[#06242e] dark:text-slate-200">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Curriculum */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm text-[#06242e] dark:text-white">
                  سرفصل‌های آموزشی دوره ({toPersianDigits(course.modules.length)} فصل • {toPersianDigits(course.lessonCount)} جلسه)
                </h3>

                <div className="space-y-2">
                  {course.modules.map((mod, idx) => {
                    const isExpanded = expandedModules.includes(mod.id);
                    return (
                      <div key={mod.id} className="rounded-xl border border-[#ccede5] dark:border-teal-900 overflow-hidden text-xs">
                        <div
                          onClick={() => toggleModule(mod.id)}
                          className="p-3 bg-[#f0fbf8] dark:bg-[#092b36] flex items-center justify-between cursor-pointer"
                        >
                          <div className="font-bold text-[#06242e] dark:text-white">
                            فصل {toPersianDigits(idx + 1)}: {mod.title}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[#527683] dark:text-[#8ab5be]">
                              {toPersianDigits(mod.lessons.length)} جلسه
                            </span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-3 space-y-2 bg-white dark:bg-[#082834]">
                            {mod.lessons.map(lesson => (
                              <div key={lesson.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#0e3b47]">
                                <div className="flex items-center gap-2">
                                  <Play size={13} className="text-[#0d9488]" />
                                  <span className="text-[#06242e] dark:text-slate-200">{lesson.title}</span>
                                  {lesson.isPreviewFree && (
                                    <span className="px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-bold">
                                      پیش‌نمایش رایگان
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-[#527683] dark:text-[#8ab5be]">
                                  {toPersianDigits(lesson.durationMinutes || 10)} دقیقه
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
