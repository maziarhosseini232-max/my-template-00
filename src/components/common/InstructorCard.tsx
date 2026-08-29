import React, { useState } from 'react';
import { InstructorProfile } from '../../types';
import { useApp } from '../../context/AppContext';
import { Star, CheckCircle2, UserPlus, UserCheck } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

interface InstructorCardProps {
  instructor: InstructorProfile;
}

export const InstructorCard: React.FC<InstructorCardProps> = ({ instructor }) => {
  const { navigate, addToast, language, t } = useApp();
  const [isFollowing, setIsFollowing] = useState(false);

  const displayName = language === 'fa' && instructor.nameFa ? instructor.nameFa : instructor.name;

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowing(prev => !prev);
    addToast({
      title: isFollowing 
        ? (language === 'fa' ? 'لغو دنبال‌کردن مدرس' : 'Unfollowed Instructor')
        : (language === 'fa' ? 'دنبال‌کردن مدرس' : 'Following Instructor'),
      message: isFollowing
        ? (language === 'fa' ? `دیگر اعلان دوره‌های جدید ${displayName} را دریافت نخواهید کرد.` : `You will no longer receive course updates from ${instructor.name}.`)
        : (language === 'fa' ? `شما اکنون ${displayName} را دنبال می‌کنید. دوره‌های جدید به شما اطلاع داده خواهد شد.` : `You are now following ${instructor.name}. You'll be notified of new masterclasses.`),
      type: 'success'
    });
  };

  const studentCountDisplay = language === 'fa'
    ? `${toPersianDigits(Math.round(instructor.studentCount / 1000))} هزار`
    : `${(instructor.studentCount / 1000).toFixed(0)}k`;

  return (
    <div
      onClick={() => navigate('catalog', undefined, `instructor=${instructor.id}`)}
      className="group relative flex flex-col items-center text-center p-6 bg-white dark:bg-[#09222b] border border-[#ccede5] dark:border-teal-900/60 rounded-2xl shadow-xs hover:border-[#14b8a6]/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
    >
      <div className="relative mb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#def4ee] dark:ring-teal-900/60 group-hover:ring-[#14b8a6]/40 transition-all">
          <img
            src={instructor.avatar}
            alt={displayName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        {instructor.isVerified && (
          <div className="absolute bottom-0 inset-inline-end-1 w-6 h-6 bg-[#0b3b49] text-[#5eead4] rounded-full flex items-center justify-center shadow-md">
            <CheckCircle2 size={14} />
          </div>
        )}
      </div>

      <h4 className="font-bold text-base text-[#06242e] dark:text-slate-100 group-hover:text-[#0d9488] dark:group-hover:text-[#2dd4bf] transition-colors">
        {displayName}
      </h4>
      <p className="text-xs text-[#527683] dark:text-slate-400 line-clamp-2 mt-1 mb-4 h-8">
        {instructor.title}
      </p>

      <div className="grid grid-cols-3 gap-2 w-full py-3 px-2 rounded-xl bg-[#f0faf7] dark:bg-[#0e3b47] border border-[#ccede5]/60 dark:border-teal-900/40 text-xs mb-4">
        <div>
          <div className="flex items-center justify-center gap-1 text-[#0d9488] dark:text-[#2dd4bf] font-bold">
            <Star size={12} className="fill-[#0d9488] text-[#0d9488]" />
            <span>{language === 'fa' ? toPersianDigits(instructor.rating.toFixed(1)) : instructor.rating.toFixed(1)}</span>
          </div>
          <div className="text-[10px] text-[#527683] dark:text-slate-400 mt-0.5">{language === 'fa' ? 'امتیاز' : 'Rating'}</div>
        </div>
        <div>
          <div className="font-bold text-[#0b3b49] dark:text-slate-200">
            {language === 'fa' ? toPersianDigits(instructor.courseCount) : instructor.courseCount}
          </div>
          <div className="text-[10px] text-[#527683] dark:text-slate-400 mt-0.5">{t('courses')}</div>
        </div>
        <div>
          <div className="font-bold text-[#0b3b49] dark:text-slate-200">
            {studentCountDisplay}
          </div>
          <div className="text-[10px] text-[#527683] dark:text-slate-400 mt-0.5">{t('students')}</div>
        </div>
      </div>

      <button
        onClick={handleFollow}
        className={`w-full py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
          isFollowing
            ? 'bg-[#def4ee] dark:bg-[#0e3b47] text-[#0b3b49] dark:text-[#5eead4] hover:bg-rose-50 hover:text-rose-600'
            : 'bg-[#0b3b49] hover:bg-[#06242e] text-white shadow-xs'
        }`}
      >
        {isFollowing ? (
          <>
            <UserCheck size={14} />
            <span>{language === 'fa' ? 'دنبال می‌کنید' : 'Following'}</span>
          </>
        ) : (
          <>
            <UserPlus size={14} />
            <span>{language === 'fa' ? 'دنبال کردن' : 'Follow'}</span>
          </>
        )}
      </button>
    </div>
  );
};
