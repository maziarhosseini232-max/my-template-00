import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  FileText, Play, Trash2, Clock, 
  Search, BookOpen, ExternalLink, Sparkles 
} from 'lucide-react';
import { toPersianDigits } from '../../../utils/persian';

export const NotesTab: React.FC = () => {
  const { enrollments, courses, deleteLessonNote, navigate, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');

  // Enrolled courses list
  const enrolledCourseIds = Object.keys(enrollments);
  const enrolledList = enrolledCourseIds
    .map(id => {
      const course = courses.find(c => c.id === id);
      const enrollment = enrollments[id];
      return { course, enrollment };
    })
    .filter((item): item is { course: typeof courses[0]; enrollment: typeof enrollments[string] } => !!item.course);

  // All notes
  const allNotes = enrolledList.flatMap(item => 
    (item.enrollment.notes || []).map(n => ({
      ...n,
      courseTitle: item.course.title,
      courseId: item.course.id
    }))
  );

  const formatSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Filter notes
  const filteredNotes = allNotes.filter(note => {
    if (selectedCourseId !== 'all' && note.courseId !== selectedCourseId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        note.text.toLowerCase().includes(q) ||
        note.courseTitle.toLowerCase().includes(q) ||
        (note.lessonTitle && note.lessonTitle.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-bold">
            <button
              onClick={() => setSelectedCourseId('all')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedCourseId === 'all'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              همه یادداشت‌ها ({toPersianDigits(allNotes.length)})
            </button>
            {enrolledList.map(({ course }) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap max-w-[200px] truncate ${
                  selectedCourseId === course.id
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {course.title}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در متن یادداشت‌ها..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-teal-500"
            />
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

        </div>

      </div>

      {/* Notes List */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/40 shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-2.5 py-0.5 rounded-md truncate max-w-[200px]">
                    {note.courseTitle}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Clock size={13} />
                    <span>{toPersianDigits(formatSeconds(note.timestampSeconds))}</span>
                  </div>
                </div>

                {note.lessonTitle && (
                  <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-2 truncate">
                    {note.lessonTitle}
                  </h4>
                )}

                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-50/70 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {note.text}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400">
                  {note.createdAt}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteLessonNote(note.courseId, note.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                    title="حذف یادداشت"
                  >
                    <Trash2 size={15} />
                  </button>

                  <button
                    onClick={() => navigate('player', note.courseId)}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Play size={12} className="fill-current" />
                    <span>پرش به ویدیو</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <FileText size={36} className="text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            یادداشتی ثبت نشده است
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-5 max-w-sm mx-auto">
            در حین تماشای جلسات در ویدیوپلیر می‌توانید در هر ثانیه دلخواه نکات مهم را یادداشت کنید.
          </p>
        </div>
      )}

    </div>
  );
};
