import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Play, Pause, SkipBack, SkipForward, 
  Maximize, CheckCircle2, Circle, Clock, Download, 
  MessageSquare, FileText, Award, ChevronLeft, ChevronRight, 
  Send, Trash2, Edit3, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { Lesson } from '../../types';
import { toPersianDigits } from '../../utils/persian';

interface CoursePlayerProps {
  courseId: string;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ courseId }) => {
  const { 
    courses, 
    enrollments, 
    updateLessonProgress, 
    addNote, 
    deleteNote, 
    navigate, 
    addToast,
    currentUser,
    t,
    isRTL,
    language 
  } = useApp();

  const course = courses.find(c => c.id === courseId) || courses[0];
  const enrollment = enrollments[courseId] || {
    courseId: course.id,
    enrolledAt: new Date().toISOString(),
    progressPercent: 25,
    completedLessonIds: [],
    lastLessonId: course.modules[0]?.lessons[0]?.id || '',
    notes: []
  };

  // Find all lessons flattened for easy next/prev indexing
  const allLessons = course.modules.flatMap(m => m.lessons);
  const initialLesson = allLessons.find(l => l.id === enrollment.lastLessonId) || allLessons[0];

  const [activeLesson, setActiveLesson] = useState<Lesson>(initialLesson);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'qa' | 'resources' | 'certificate'>('overview');
  
  // Notes state
  const [newNoteText, setNewNoteText] = useState('');
  
  // Q&A state
  const [questions, setQuestions] = useState([
    {
      id: 'q1',
      author: 'رضا علوی',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
      time: '۲ روز پیش',
      title: 'بهترین روش برای مدیریت توکن‌های طراحی در پروژه‌های مقیاس‌پذیر چیست؟',
      body: 'در ساخت دیزاین سیستم‌های بزرگ با فریم‌ورک‌های جدید، ساختار متغیرها و کامپوننت پراپرتی‌ها رو چطور باید منظم کنیم؟',
      upvotes: 8,
      replies: [
        {
          id: 'r1',
          author: course.instructorName,
          avatar: course.instructorAvatar,
          isInstructor: true,
          time: '۱ روز پیش',
          body: 'سوال بسیار عالی! پیشنهاد می‌کنم متغیرهای رنگ و فواصل را در سه لایه Global، Semantic و Component دسته‌بندی کنید تا پیاده‌سازی در فرانت‌اند با حداکثر بهره‌وری انجام شود.'
        }
      ]
    }
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);

  // Lesson index
  const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Handle lesson switch
  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setCurrentTime(0);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleToggleComplete = (lessonId: string) => {
    const isCompleted = enrollment.completedLessonIds.includes(lessonId);
    updateLessonProgress(course.id, lessonId, !isCompleted);
    addToast({
      title: !isCompleted ? (language === 'fa' ? 'جلسه تکمیل شد' : 'Lesson Completed') : (language === 'fa' ? 'وضعیت به‌روزرسانی شد' : 'Progress Updated'),
      message: !isCompleted 
        ? (language === 'fa' ? `جلسه «${activeLesson.title}» تکمیل شد!` : `Marked "${activeLesson.title}" as complete!`)
        : (language === 'fa' ? 'علامت تکمیل این جلسه برداشته شد.' : 'Lesson marked incomplete.'),
      type: 'success'
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addNote(course.id, {
      lessonId: activeLesson.id,
      timestampSeconds: Math.floor(currentTime),
      text: newNoteText.trim()
    });
    setNewNoteText('');
    addToast({
      title: language === 'fa' ? 'یادداشت ذخیره شد' : 'Note Saved',
      message: language === 'fa' ? `یادداشت در زمان ${formatTime(currentTime)} ثبت گردید.` : `Timestamped note recorded at ${formatTime(currentTime)}.`,
      type: 'success'
    });
  };

  const handleJumpToTimestamp = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      setCurrentTime(seconds);
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    const newQ = {
      id: `q-${Date.now()}`,
      author: currentUser.name,
      avatar: currentUser.avatar,
      time: language === 'fa' ? 'همین الان' : 'Just now',
      title: (language === 'fa' ? 'پرسش درباره جلسه: ' : 'Question on ') + activeLesson.title,
      body: newQuestionText.trim(),
      upvotes: 0,
      replies: []
    };
    setQuestions([newQ, ...questions]);
    setNewQuestionText('');
    addToast({
      title: language === 'fa' ? 'پرسش شما ثبت شد' : 'Question Submitted',
      message: language === 'fa' ? 'پرسش شما در بخش گفتگوی دوره قرار گرفت.' : 'Your question has been posted to the course community.',
      type: 'success'
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const formatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    return language === 'fa' ? toPersianDigits(formatted) : formatted;
  };

  const isCompleted = enrollment.completedLessonIds.includes(activeLesson.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Top Navbar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('course-detail', course.slug)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            <span>{language === 'fa' ? 'صفحه معرفی دوره' : 'Course Page'}</span>
          </button>
          <span className="text-slate-700">|</span>
          <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-md">
            {course.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-slate-400">
              {language === 'fa' ? `٪${toPersianDigits(enrollment.progressPercent)} پیشرفت` : `${enrollment.progressPercent}% Completed`}
            </span>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${enrollment.progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            {sidebarOpen 
              ? (language === 'fa' ? 'مخفی‌سازی سرفصل‌ها' : 'Hide Syllabus') 
              : (language === 'fa' ? 'نمایش سرفصل‌ها' : 'Show Syllabus')}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Side: Video Player & Tabs */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          
          {/* Custom Video Stage */}
          <div className="relative aspect-video bg-black flex items-center justify-center group select-none">
            <video
              ref={videoRef}
              src={activeLesson.videoUrl || course.previewVideoUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => handleToggleComplete(activeLesson.id)}
              className="w-full h-full object-contain"
            />

            {/* Floating Controls Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 transition-opacity duration-300 opacity-100 group-hover:opacity-100">
              
              {/* Scrubber Progress Bar */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-700 accent-indigo-500 rounded-lg appearance-none cursor-pointer mb-3"
              />

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleTogglePlay}
                    className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} className="fill-white" />}
                  </button>

                  {prevLesson && (
                    <button
                      onClick={() => handleSelectLesson(prevLesson)}
                      className="p-1.5 rounded-full hover:bg-white/20 text-slate-300 hover:text-white"
                      title={language === 'fa' ? 'جلسه قبلی' : 'Previous Lesson'}
                    >
                      {isRTL ? <SkipForward size={16} /> : <SkipBack size={16} />}
                    </button>
                  )}

                  {nextLesson && (
                    <button
                      onClick={() => handleSelectLesson(nextLesson)}
                      className="p-1.5 rounded-full hover:bg-white/20 text-slate-300 hover:text-white"
                      title={language === 'fa' ? 'جلسه بعدی' : 'Next Lesson'}
                    >
                      {isRTL ? <SkipBack size={16} /> : <SkipForward size={16} />}
                    </button>
                  )}

                  <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-mono" dir="ltr">
                    <span>{formatTime(currentTime)}</span>
                    <span>/</span>
                    <span>{formatTime(duration || activeLesson.durationMinutes * 60)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Speed Selector */}
                  <select
                    value={playbackRate}
                    onChange={e => {
                      const rate = parseFloat(e.target.value);
                      setPlaybackRate(rate);
                      if (videoRef.current) videoRef.current.playbackRate = rate;
                    }}
                    className="bg-slate-800 text-slate-300 rounded px-1.5 py-0.5 text-[11px] border border-slate-700"
                  >
                    <option value="0.75">0.75x</option>
                    <option value="1">1.0x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2.0x</option>
                  </select>

                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        if (document.fullscreenElement) {
                          document.exitFullscreen();
                        } else {
                          videoRef.current.requestFullscreen?.();
                        }
                      }
                    }}
                    className="p-1.5 hover:bg-white/20 rounded text-slate-300 hover:text-white"
                  >
                    <Maximize size={16} />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Lesson Header Actions Bar */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-indigo-400">
                {language === 'fa' ? 'جلسه در حال پخش' : 'Current Lesson'}
              </span>
              <h1 className="text-base sm:text-lg font-bold text-white">{activeLesson.title}</h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleComplete(activeLesson.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isCompleted
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <CheckCircle2 size={15} />
                <span>
                  {isCompleted 
                    ? (language === 'fa' ? 'تکمیل شد ✓' : 'Completed ✓')
                    : (language === 'fa' ? 'ثبت تکمیل جلسه' : 'Mark as Complete')}
                </span>
              </button>

              {nextLesson && (
                <button
                  onClick={() => handleSelectLesson(nextLesson)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>{language === 'fa' ? 'جلسه بعدی' : 'Next Lesson'}</span>
                  {isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>
              )}
            </div>
          </div>

          {/* Player Tab Navigation */}
          <div className="flex items-center border-b border-slate-800 bg-slate-900/60 px-4 text-xs font-semibold overflow-x-auto scrollbar-none">
            {[
              { id: 'overview', label: t('courseOverview'), icon: FileText },
              { id: 'notes', label: language === 'fa' ? 'یادداشت‌های من' : 'My Notes', icon: Edit3 },
              { id: 'qa', label: language === 'fa' ? 'پرسش و پاسخ' : 'Q&A Discussions', icon: MessageSquare },
              { id: 'resources', label: language === 'fa' ? 'فایل‌ها و ضمائم' : 'Files & Assets', icon: Download },
              { id: 'certificate', label: language === 'fa' ? 'گواهی پایان دوره' : 'Certificate', icon: Award }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-3.5 border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content View */}
          <div className="p-6 bg-slate-950 flex-1">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-slate-100 mb-2">
                    {language === 'fa' ? 'توضیحات و نکات این جلسه' : 'Lesson Description'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {language === 'fa'
                      ? 'در این جلسه به صورت کاملاً کاربردی با الگوهای پیاده‌سازی توکن‌های طراحی، لایه‌بندی اتولایوت واکنش‌گرا و ساخت کامپوننت‌های بهینه‌سازی شده برای توسعه فرانت‌اند آشنا می‌شوید.'
                      : 'In this session, you will learn the exact practical workflows to implement scalable design tokens, clean auto-layouts, and component composition patterns.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-3">
                    {language === 'fa' ? 'دستاوردهای کلیدی این جلسه' : 'Key Takeaways'}
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>{language === 'fa' ? 'اصول ساختاربندی توکن‌های رنگ، تایپوگرافی و سایه‌گذاری چندلایه.' : 'How to structure multi-tier color, typography, and elevation design tokens.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>{language === 'fa' ? 'جلوگیری از پرش چیدمان در ابعاد مختلف موبایل، تبلت و دسکتاپ.' : 'Preventing layout shift across mobile, tablet, and ultra-wide viewports.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>{language === 'fa' ? 'خروجی استاندارد برای تیم‌های مهندسی ری‌اکت و تیل‌ویند.' : 'Exporting token specs directly for React and Tailwind CSS teams.'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="max-w-3xl space-y-6">
                {/* Note creation input */}
                <form onSubmit={handleAddNote} className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {language === 'fa' 
                        ? <>ثبت یادداشت شخصی در ثانیه <strong className="text-indigo-400 font-mono">{formatTime(currentTime)}</strong></>
                        : <>Add a note at <strong className="text-indigo-400">{formatTime(currentTime)}</strong></>}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={newNoteText}
                      onChange={e => setNewNoteText(e.target.value)}
                      placeholder={language === 'fa' ? 'نکات مهم، میان‌برها و خلاصه‌های شخصی خود را اینجا بنویسید...' : 'Type your personal insights, key commands, or bookmarks...'}
                      className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 self-end py-3"
                    >
                      {language === 'fa' ? 'ذخیره یادداشت' : 'Save Note'}
                    </button>
                  </div>
                </form>

                {/* Saved notes list */}
                <div className="space-y-3 pt-4">
                  <h4 className="font-bold text-xs text-slate-300">
                    {language === 'fa' ? 'یادداشت‌های نشانه‌گذاری شده شما' : 'Your Timestamped Notes'}
                  </h4>
                  {enrollment.notes && enrollment.notes.length > 0 ? (
                    enrollment.notes.map(note => (
                      <div
                        key={note.id}
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <button
                            onClick={() => handleJumpToTimestamp(note.timestampSeconds)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 font-mono text-[11px] font-bold hover:bg-indigo-900 transition-colors"
                          >
                            <Clock size={11} />
                            <span>{formatTime(note.timestampSeconds)}</span>
                          </button>
                          <p className="text-xs text-slate-200">{note.text}</p>
                        </div>
                        <button
                          onClick={() => deleteNote(course.id, note.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-500">
                      {language === 'fa' 
                        ? 'هنوز یادداشتی ثبت نکرده‌اید. با تایپ در کادر بالا هر ثانیه از ویدیو را نشانه‌گذاری کنید.'
                        : 'No notes yet. Type above to bookmark any timestamp in the video!'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Q&A Discussions Tab */}
            {activeTab === 'qa' && (
              <div className="max-w-3xl space-y-6">
                {/* Ask question form */}
                <form onSubmit={handlePostQuestion} className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-300">
                    {language === 'fa' ? 'پرسش از مدرس و همراهان دوره' : 'Ask the Instructor & Community'}
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newQuestionText}
                      onChange={e => setNewQuestionText(e.target.value)}
                      placeholder={language === 'fa' ? 'هر سوال یا ابهامی درباره این درس دارید بنویسید...' : 'Have a doubt regarding this lesson? Ask here...'}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <Send size={13} />
                      <span>{language === 'fa' ? 'ارسال پرسش' : 'Post'}</span>
                    </button>
                  </div>
                </form>

                {/* Questions list */}
                <div className="space-y-4 pt-2">
                  {questions.map(q => (
                    <div key={q.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <img src={q.avatar} alt={q.author} className="w-7 h-7 rounded-full object-cover" />
                          <div>
                            <span className="font-bold text-xs text-white">{q.author}</span>
                            <span className="text-[10px] text-slate-500 ms-2">{q.time}</span>
                          </div>
                        </div>
                      </div>
                      <h5 className="font-semibold text-xs text-indigo-300">{q.title}</h5>
                      <p className="text-xs text-slate-300">{q.body}</p>

                      {/* Replies */}
                      {q.replies.map(r => (
                        <div key={r.id} className="ms-4 p-3 rounded-lg bg-slate-950 border border-indigo-900/40 space-y-1">
                          <div className="flex items-center gap-2">
                            <img src={r.avatar} alt={r.author} className="w-5 h-5 rounded-full object-cover" />
                            <span className="font-bold text-xs text-indigo-400">{r.author}</span>
                            <span className="text-[10px] bg-indigo-950 text-indigo-400 px-1.5 rounded">
                              {language === 'fa' ? 'مدرس دوره' : 'Instructor'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">{r.body}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="max-w-3xl space-y-4">
                <h4 className="font-bold text-xs text-slate-300">
                  {language === 'fa' ? 'فایل‌های تمرینی و منابع قابل دانلود' : 'Downloadable Lesson Files & Templates'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { name: 'Figma-Token-Kit-v4.2.fig', size: '۲۴.۸ مگابایت', type: 'فایل طراحی فیگما' },
                    { name: 'Design-Tokens-Cheatsheet.pdf', size: '۳.۱ مگابایت', type: 'مستندات و راهنما' },
                    { name: 'Starter-Component-Library.zip', size: '۱۲.۴ مگابایت', type: 'سورس کد آماده' }
                  ].map((res, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-xs text-white" dir="ltr">{res.name}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{res.type} • {res.size}</div>
                      </div>
                      <button
                        onClick={() => addToast({ title: language === 'fa' ? 'دانلود آغاز شد' : 'Download Started', message: `در حال دریافت ${res.name}`, type: 'info' })}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificate Tab */}
            {activeTab === 'certificate' && (
              <div className="max-w-3xl space-y-6">
                <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 text-center space-y-4 shadow-2xl relative overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto">
                    <Award size={28} />
                  </div>
                  <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                    {language === 'fa' ? 'گواهی رسمی پایان دوره آکادمی لومینا' : 'Lumina Certificate of Mastery'}
                  </span>
                  <h3 className="text-2xl font-bold font-serif text-white">{course.title}</h3>
                  <p className="text-xs text-slate-400">
                    {language === 'fa' ? 'این گواهی به رسمیت تایید می‌کند که' : 'This certifies that'}
                  </p>
                  <div className="text-xl font-bold text-indigo-400 border-b border-slate-800 pb-2 inline-block px-8">
                    {currentUser.name}
                  </div>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    {language === 'fa' 
                      ? 'تمامی سرفصل‌ها، تمرین‌های عملی و پروژه‌های نهایی این دوره را با موفقیت و تحت نظارت مستقیم مدرس به پایان رسانده است.'
                      : 'Has demonstrated mastery in all course curriculum criteria, graded projects, and peer reviews under instructor supervision.'}
                  </p>
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80 gap-2">
                    <span>{language === 'fa' ? 'مدرس:' : 'Instructor:'} <strong>{course.instructorName}</strong></span>
                    <span dir="ltr">کد استعلام: <strong>LUM-{toPersianDigits('2026')}-{course.id.toUpperCase().slice(0, 6)}</strong></span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => addToast({ title: language === 'fa' ? 'گواهی صادر شد' : 'Certificate Exported', message: language === 'fa' ? 'فایل PDF گواهی نامه دانلود شد.' : 'Official PDF Certificate downloaded.', type: 'success' })}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg"
                  >
                    <Download size={15} />
                    <span>{language === 'fa' ? 'دانلود گواهی رسمی با فرمت PDF' : 'Download Official PDF Certificate'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Syllabus Sidebar */}
        {sidebarOpen && (
          <aside className="w-full lg:w-80 xl:w-96 border-s border-slate-800 bg-slate-900 flex flex-col shrink-0 h-96 lg:h-auto overflow-y-auto">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                {language === 'fa' ? 'سرفصل‌ها و جلسات دوره' : 'Course Syllabus'}
              </h3>
              <span className="text-xs text-slate-400">
                {language === 'fa' 
                  ? `${toPersianDigits(enrollment.completedLessonIds.length)} از ${toPersianDigits(allLessons.length)} جلسه`
                  : `${enrollment.completedLessonIds.length} / ${allLessons.length} Done`}
              </span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {course.modules.map((mod, modIdx) => (
                <div key={mod.id} className="p-3">
                  <div className="text-xs font-bold text-slate-400 mb-2 px-1">
                    {language === 'fa' ? `فصل ${toPersianDigits(modIdx + 1)}: ${mod.title}` : `Module ${modIdx + 1}: ${mod.title}`}
                  </div>
                  <div className="space-y-1">
                    {mod.lessons.map(lesson => {
                      const active = lesson.id === activeLesson.id;
                      const done = enrollment.completedLessonIds.includes(lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson)}
                          className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer text-xs transition-all ${
                            active
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleToggleComplete(lesson.id);
                              }}
                              className="shrink-0"
                            >
                              {done ? (
                                <CheckCircle2 size={16} className={active ? 'text-white' : 'text-emerald-400'} />
                              ) : (
                                <Circle size={16} className={active ? 'text-white/60' : 'text-slate-600'} />
                              )}
                            </button>
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          <span className={`text-[11px] shrink-0 ms-2 ${active ? 'text-indigo-200' : 'text-slate-500'}`}>
                            {toPersianDigits(lesson.durationMinutes)} د
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}

      </div>
    </div>
  );
};
