import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { UserCheck, Star, Users, BookOpen, Plus, Mail, Award, CheckCircle2, Trash2 } from 'lucide-react';
import { toPersianDigits } from '../../../utils/persian';
import { Instructor } from '../../../types';

export const InstructorsManagerTab: React.FC = () => {
  const { instructors, courses, addToast } = useApp();
  const [localInstructors, setLocalInstructors] = useState<Instructor[]>(instructors);

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600');

  const handleAddInstructor = () => {
    if (!name.trim()) return;
    const newInst: Instructor = {
      id: `inst-${Date.now()}`,
      name: name.trim(),
      title: title.trim() || 'مدرس ارشد لومینا لرن',
      bio: bio.trim() || 'متخصص و مدرس باتجربه در حوزه‌های تخصصی نرم‌افزار و طراحی',
      avatar,
      rating: 5.0,
      reviewCount: 0,
      studentCount: 0,
      courseCount: 0,
      skills: ['طراحی محصول', 'توسعه فرانت‌اند', 'معماری دیزاین']
    };

    setLocalInstructors(prev => [...prev, newInst]);
    setShowAddModal(false);
    setName('');
    setTitle('');
    setBio('');
    addToast({
      title: 'مدرس جدید افزوده شد',
      message: `استاد «${newInst.name}» با موفقیت به پلتفرم اضافه شد.`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-6 text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#06242e] dark:text-white">
            مدیریت مدرسین و اساتید دوره
          </h2>
          <p className="text-xs text-[#527683] dark:text-[#8ab5be] mt-0.5">
            پروفایل اساتید، دوره‌های ارائه شده و تسویه‌های مالی
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] text-xs font-extrabold shadow-sm transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>+ افزودن مدرس جدید</span>
        </button>
      </div>

      {/* Instructors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {localInstructors.map(inst => {
          const instructorCourses = courses.filter(c => c.instructorId === inst.id);

          return (
            <div
              key={inst.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={inst.avatar}
                      alt={inst.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-[#5eead4]"
                    />
                    <span className="absolute -bottom-1 -end-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px]">
                      ✓
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-[#06242e] dark:text-white">
                      {inst.name}
                    </h3>
                    <div className="text-[11px] text-[#0d9488] dark:text-[#5eead4] font-bold">
                      {inst.title}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-[#527683] dark:text-[#8ab5be] line-clamp-2">
                  {inst.bio}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#f0fbf8] dark:bg-[#092b36] text-center">
                  <div>
                    <div className="text-[10px] text-[#527683] dark:text-[#8ab5be]">دوره‌ها</div>
                    <div className="font-black text-xs text-[#06242e] dark:text-white mt-0.5">
                      {toPersianDigits(instructorCourses.length || inst.courseCount)}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-[#527683] dark:text-[#8ab5be]">دانشجویان</div>
                    <div className="font-black text-xs text-[#06242e] dark:text-white mt-0.5">
                      {toPersianDigits(inst.studentCount || 820)}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-[#527683] dark:text-[#8ab5be]">امتیاز</div>
                    <div className="font-black text-xs text-amber-500 mt-0.5 flex items-center justify-center gap-0.5">
                      <span>{toPersianDigits(inst.rating)}</span>
                      <Star size={11} className="fill-amber-500" />
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {inst.skills && (
                  <div className="flex flex-wrap gap-1">
                    {inst.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#def4ee]/60 dark:bg-[#0e3b47] text-[#0b3b49] dark:text-[#5eead4] text-[10px] font-bold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#ccede5]/60 dark:border-teal-900/40 flex items-center justify-between text-[11px] text-[#527683] dark:text-[#8ab5be]">
                <span>شناسه: {inst.id}</span>
                <button
                  onClick={() => {
                    setLocalInstructors(prev => prev.filter(i => i.id !== inst.id));
                    addToast({ title: 'مدرس حذف شد', message: 'پروفایل مدرس از سیستم حذف گردید.', type: 'info' });
                  }}
                  className="text-rose-500 hover:text-rose-700 p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#06242e] rounded-2xl max-w-md w-full p-6 border border-[#ccede5] dark:border-teal-900 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-sm text-[#06242e] dark:text-white">
              ثبت مدرس و استاد جدید
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-[#06242e] dark:text-white">نام و نام خانوادگی مدرس *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="مثال: مهندس رامین حسینی"
                  className="w-full px-3 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#06242e] dark:text-white">عنوان شغلی و تخصص</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Senior Product Designer @ TechCorp"
                  className="w-full px-3 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#06242e] dark:text-white">بیوگرافی و سوابق</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  placeholder="توضیحات کوتاه درباره سوابق تدریس و پروژه‌ها..."
                  className="w-full p-3 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#06242e] dark:text-white">لینک تصویر آواتار</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={e => setAvatar(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#ccede5]/60 dark:border-teal-900/40">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#09222b] text-[#06242e] dark:text-white font-bold"
              >
                انصراف
              </button>
              <button
                onClick={handleAddInstructor}
                className="px-5 py-2 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] font-extrabold"
              >
                ثبت مدرس
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
