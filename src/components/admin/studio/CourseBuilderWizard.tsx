import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  Save, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Image as ImageIcon, 
  Layers, 
  UploadCloud, 
  FolderOpen, 
  DollarSign, 
  Settings as SettingsIcon, 
  Globe, 
  Send, 
  Eye, 
  Play, 
  X, 
  Plus, 
  Trash2, 
  Sparkles,
  Info,
  Laptop,
  Smartphone,
  Copy,
  Gift,
  CreditCard,
  Tag,
  Crown
} from 'lucide-react';
import { api } from '../../../services/api';
import { Course, CourseModule, CourseStatus, CourseLevel } from '../../../types';
import { toPersianDigits, formatTomanPrice } from '../../../utils/persian';
import { CurriculumBuilder } from './CurriculumBuilder';

type WizardTab = 
  | 'basic' 
  | 'media' 
  | 'curriculum' 
  | 'bulk-upload' 
  | 'media-library' 
  | 'pricing' 
  | 'settings' 
  | 'seo' 
  | 'publish';

interface CourseBuilderWizardProps {
  initialCourse?: Course | null;
  onSaveAndClose: () => void;
  onCancel: () => void;
  onPreview: (course: Course) => void;
}

export const CourseBuilderWizard: React.FC<CourseBuilderWizardProps> = ({
  initialCourse,
  onSaveAndClose,
  onCancel,
  onPreview
}) => {
  const { 
    categories, 
    instructors, 
    createCourse, 
    updateCourse, 
    mediaAssets, 
    uploadQueue, 
    addToUploadQueue, 
    addToast 
  } = useApp();

  const isEditing = !!initialCourse;

  // Form State
  const [title, setTitle] = useState(initialCourse?.title || '');
  const [subtitle, setSubtitle] = useState(initialCourse?.subtitle || '');
  const [description, setDescription] = useState(initialCourse?.description || '');
  const [categoryId, setCategoryId] = useState(initialCourse?.categoryId || categories[0]?.id || 'design');
  const [subCategory, setSubCategory] = useState(initialCourse?.subCategory || 'دیزاین سیستم');
  const [instructorId, setInstructorId] = useState(initialCourse?.instructorId || instructors[0]?.id || 'inst-elena');
  const [level, setLevel] = useState<CourseLevel>(initialCourse?.level || 'all');
  const [language, setCourseLanguage] = useState(initialCourse?.language || 'فارسی');

  // Media
  const [thumbnail, setThumbnail] = useState(
    initialCourse?.thumbnail || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop'
  );
  const [previewVideoUrl, setPreviewVideoUrl] = useState(
    initialCourse?.previewVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  );

  // Curriculum
  const [modules, setModules] = useState<CourseModule[]>(
    initialCourse?.modules || [
      {
        id: 'mod-init-1',
        title: 'فصل اول: آشنایی و مبانی مقدماتی',
        description: 'مفاهیم اولیه و نصب ابزارهای مورد نیاز',
        order: 1,
        lessons: [
          {
            id: 'les-init-1',
            title: 'جلسه ۱: خوش‌آمدگویی و نقشه راه دوره',
            durationMinutes: 8,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            isPreviewFree: true,
            description: 'در این جلسه سرفصل‌ها و اهداف دوره را بررسی می‌کنیم.'
          },
          {
            id: 'les-init-2',
            title: 'جلسه ۲: نصب ابزارها و مقدمات دیزاین سیستم',
            durationMinutes: 15,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            isPreviewFree: false,
            description: 'راه‌اندازی محیط کاری و فایل‌های تمرینی'
          }
        ]
      }
    ]
  );

  // Learning Outcomes & Requirements
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>(
    initialCourse?.whatYouWillLearn || [
      'تسلط کامل بر اصول و استانداردهای طراحی مدرن',
      'پیاده‌سازی پروژه‌های عملی و پرتفوی‌محور',
      'درک عمیق ساختار معماری و متغیرها'
    ]
  );
  const [newOutcome, setNewOutcome] = useState('');

  const [requirements, setRequirements] = useState<string[]>(
    initialCourse?.requirements || [
      'آشنایی اولیه با کامپیوتر و اینترنت',
      'انگیزه بالا برای یادگیری و تمرین مستمر'
    ]
  );
  const [newRequirement, setNewRequirement] = useState('');

  const [targetAudience, setTargetAudience] = useState<string[]>(
    initialCourse?.targetAudience || [
      'طراحان رابط کاربری و تجربه کاربری',
      'توسعه‌دهندگان فرانت‌اند علاقه‌مند به دیزاین',
      'دانشجویان و علاقه‌مندان به ورود به بازار کار'
    ]
  );
  const [newAudience, setNewAudience] = useState('');

  // Access & Subscription Status (VIP vs Free)
  const [isVipRequired, setIsVipRequired] = useState<boolean>(() => {
    if (!initialCourse) return true;
    if (initialCourse.isFree && !initialCourse.isVip && !initialCourse.requiresSubscription) {
      return false;
    }
    return true;
  });
  const [isSavingPricing, setIsSavingPricing] = useState(false);

  // Settings
  const [isLifetimeAccess, setIsLifetimeAccess] = useState(
    initialCourse?.settings?.isLifetimeAccess !== undefined ? !!initialCourse.settings.isLifetimeAccess : true
  );
  const [hasCertificate, setHasCertificate] = useState(
    initialCourse?.hasCertificate !== undefined ? !!initialCourse.hasCertificate : true
  );
  const [requireSequential, setRequireSequential] = useState(
    initialCourse?.settings?.requireSequentialCompletion !== undefined ? !!initialCourse.settings.requireSequentialCompletion : false
  );
  const [enableDiscussions, setEnableDiscussions] = useState(
    initialCourse?.settings?.enableDiscussions !== undefined ? !!initialCourse.settings.enableDiscussions : true
  );
  const [allowDownloads, setAllowDownloads] = useState(
    initialCourse?.settings?.allowDownloads !== undefined ? !!initialCourse.settings.allowDownloads : true
  );

  // SEO
  const [slug, setSlug] = useState(
    initialCourse?.slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `course-${Math.random().toString(36).substring(2, 7)}`)
  );
  const [metaTitle, setMetaTitle] = useState(initialCourse?.seo?.metaTitle || title || '');
  const [metaDescription, setMetaDescription] = useState(initialCourse?.seo?.metaDescription || subtitle || '');
  const [tags, setTags] = useState<string[]>(initialCourse?.tags || ['طراحی UI/UX', 'دیزاین سیستم', 'مسترکلاس']);
  const [newTag, setNewTag] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<WizardTab>('basic');
  const [lastSavedTime, setLastSavedTime] = useState<string>('همین الان');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Selected Category / Instructor objects
  const currentCategory = categories.find(c => c.id === categoryId) || categories[0];
  const currentInstructor = instructors.find(i => i.id === instructorId) || instructors[0];

  // Dynamic calculations
  const totalLessons = useMemo(() => modules.reduce((s, m) => s + m.lessons.length, 0), [modules]);
  const totalDurationMinutes = useMemo(() => 
    modules.reduce((s, m) => s + m.lessons.reduce((ls, l) => ls + (l.durationMinutes || 0), 0), 0)
  , [modules]);
  const durationHours = Math.max(1, Math.round(totalDurationMinutes / 60));

  // Pre-flight checks
  const validationChecks = useMemo(() => [
    { label: 'عنوان و توضیحات اصلی دوره تکمیل شده است', valid: title.trim().length >= 5 },
    { label: 'کاور اصلی دوره انتخاب شده است', valid: !!thumbnail },
    { label: 'حداقل ۱ فصل و ۳ جلسه آموزشی تعریف شده است', valid: modules.length >= 1 && totalLessons >= 3 },
    { label: 'حداقل یک جلسه رایگان برای پیش‌نمایش تعیین شده است', valid: modules.some(m => m.lessons.some(l => l.isPreviewFree)) },
    { label: 'وضعیت دسترسی و اشتراک دوره مشخص شده است', valid: true },
    { label: 'اهداف یادگیری و پیش‌نیازها درج شده است', valid: whatYouWillLearn.length >= 2 }
  ], [title, thumbnail, modules, totalLessons, isVipRequired, whatYouWillLearn]);

  const isValidForPublish = validationChecks.every(c => c.valid);

  // Auto-sync slug when title changes in new course
  useEffect(() => {
    if (!isEditing && title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/^-+|-+$/g, ''));
      setMetaTitle(title);
    }
  }, [title, isEditing]);

  const constructCoursePayload = (status: CourseStatus): Course => {
    const isFree = !isVipRequired;
    return {
      id: initialCourse?.id || `course-${Math.random().toString(36).substring(2, 9)}`,
      slug: slug || `course-${Date.now()}`,
      title: title || 'دوره جدید بدون عنوان',
      subtitle: subtitle || 'توضیحات کوتاه دوره',
      description: description || 'توضیحات جامع و سرفصل‌های دوره آموزشی.',
      categoryId,
      categoryName: currentCategory?.nameFa || 'طراحی و دیزاین',
      subCategory,
      thumbnail,
      previewVideoUrl,
      instructorId,
      instructorName: currentInstructor?.name || 'مدرس پلتفرم',
      instructorAvatar: currentInstructor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600',
      instructorTitle: currentInstructor?.title || 'مدرس تخصصی',
      price: 0,
      originalPrice: 0,
      isFree,
      isVip: isVipRequired,
      requiresSubscription: isVipRequired,
      accessType: isFree ? 'FREE' : 'PAID',
      currency: 'IRT',
      discountPercentage: 0,
      rating: initialCourse?.rating || 5.0,
      reviewCount: initialCourse?.reviewCount || 0,
      studentCount: initialCourse?.studentCount || 0,
      durationHours,
      lessonCount: totalLessons,
      level,
      language,
      hasCertificate,
      isPublished: status === 'published',
      publishedAt: initialCourse?.publishedAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      whatYouWillLearn,
      requirements,
      targetAudience,
      modules,
      faqs: initialCourse?.faqs || [
        { question: 'آیا دسترسی به ویدیوها دائمی است؟', answer: 'بله، پس از ثبت‌نام دسترسی نامحدود به تمامی جلسات خواهید داشت.' },
        { question: 'آیا گواهینامه پایان دوره ارائه می‌شود؟', answer: 'پس از مشاهده ۱۰۰٪ جلسات و قبولی در آزمون، گواهینامه معتبر آنلاین برای شما صادر خواهد شد.' }
      ],
      tags,
      status,
      settings: {
        isLifetimeAccess,
        requireSequentialCompletion: requireSequential,
        hasCertificate,
        enableDiscussions,
        allowDownloads,
        freePreviewEnabled: true
      },
      seo: {
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || subtitle,
        slug,
        keywords: tags
      }
    };
  };

  const handleSaveDraft = () => {
    const payload = constructCoursePayload('draft');
    if (isEditing && initialCourse) {
      updateCourse(initialCourse.id, payload);
    } else {
      createCourse(payload);
    }
    setLastSavedTime(new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }));
    onSaveAndClose();
  };

  const handlePublish = () => {
    const payload = constructCoursePayload('published');
    if (isEditing && initialCourse) {
      updateCourse(initialCourse.id, payload);
    } else {
      createCourse(payload);
    }
    addToast({
      title: 'دوره با موفقیت منتشر شد!',
      message: `دوره «${payload.title}» اکنون در کاتالوگ عمومی پلتفرم فعال و در دسترس دانشجویان است.`,
      type: 'success'
    });
    onSaveAndClose();
  };

  const handleQuickSavePricing = async () => {
    setIsSavingPricing(true);
    try {
      const isFree = !isVipRequired;
      const isVip = isVipRequired;

      if (isEditing && initialCourse) {
        await api.commerce.updateCoursePricing(initialCourse.id, {
          isFree,
          price: 0,
          originalPrice: 0
        });
        updateCourse(initialCourse.id, {
          isFree,
          isVip,
          requiresSubscription: isVip,
          accessType: isFree ? 'FREE' : 'PAID',
          price: 0,
          originalPrice: 0,
          discountPercentage: 0
        });
        addToast({
          title: 'وضعیت دسترسی دوره ذخیره شد',
          message: `دوره «${initialCourse.title}» بر روی وضعیت «${isVipRequired ? 'نیازمند اشتراک ویژه (VIP)' : 'رایگان'}» تنظیم و ذخیره شد.`,
          type: 'success'
        });
      } else {
        addToast({
          title: 'تنظیمات دسترسی لحاظ شد',
          message: `وضعیت دسترسی دوره بر روی «${isVipRequired ? 'نیازمند اشتراک ویژه (VIP)' : 'رایگان'}» تنظیم شد.`,
          type: 'info'
        });
      }
    } catch (err: any) {
      addToast({
        title: 'خطا در ثبت وضعیت دسترسی دوره',
        message: err.message || 'مشکلی در به‌روزرسانی پیش آمد.',
        type: 'error'
      });
    } finally {
      setIsSavingPricing(false);
    }
  };

  const tabs: { id: WizardTab; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'basic', label: 'اطلاعات اصلی', icon: FileText },
    { id: 'media', label: 'کاور و ویدیو', icon: ImageIcon },
    { id: 'curriculum', label: 'سازنده سرفصل‌ها', icon: Layers },
    { id: 'bulk-upload', label: 'بارگذاری گروهی', icon: UploadCloud },
    { id: 'media-library', label: 'کتابخانه رسانه‌ها', icon: FolderOpen },
    { id: 'pricing', label: 'وضعیت دسترسی و VIP', icon: Crown },
    { id: 'settings', label: 'تنظیمات و دسترسی', icon: SettingsIcon },
    { id: 'seo', label: 'سئو و متا', icon: Globe },
    { id: 'publish', label: 'پیش‌نمایش و انتشار', icon: Send }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header with Autosave indicator & Save Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#09222b] hover:bg-slate-200 dark:hover:bg-[#0e3b47] text-[#06242e] dark:text-white transition-colors cursor-pointer"
            title="بازگشت به لیست دوره‌ها"
          >
            <ArrowRight size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-base sm:text-lg text-[#06242e] dark:text-white">
                {isEditing ? `ویرایش دوره: ${initialCourse.title}` : 'ایجاد دوره آموزشی جدید'}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#def4ee] dark:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4] text-[10px] font-bold">
                {isEditing ? (initialCourse.status === 'published' ? 'منتشرشده' : 'پیش‌نویس') : 'پیش‌نویس جدید'}
              </span>
            </div>
            <p className="text-[11px] text-[#527683] dark:text-[#8ab5be] flex items-center gap-1 mt-0.5">
              <CheckCircle2 size={12} className="text-emerald-500" />
              <span>آخرین ذخیره خودکار: {lastSavedTime}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => onPreview(constructCoursePayload('draft'))}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#09222b] hover:bg-slate-200 dark:hover:bg-[#0e3b47] text-[#06242e] dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-transparent dark:border-teal-900/40"
          >
            <Eye size={15} />
            <span>پیش‌نمایش زنده</span>
          </button>

          <button
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#def4ee] hover:bg-[#c9eee5] dark:bg-[#0e3b47] dark:hover:bg-[#124d5d] text-[#0b3b49] dark:text-[#5eead4] text-xs font-bold transition-colors cursor-pointer"
          >
            <Save size={15} />
            <span>ذخیره پیش‌نویس</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={!isValidForPublish}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0b3b49] hover:bg-[#06242e] dark:bg-[#5eead4] dark:hover:bg-[#2dd4bf] disabled:opacity-40 disabled:cursor-not-allowed text-white dark:text-[#06242e] text-xs font-extrabold shadow-sm transition-all cursor-pointer"
          >
            <Send size={15} />
            <span>انتشار دوره</span>
          </button>
        </div>
      </div>

      {/* 9 Tabs Horizontal Navigation Bar */}
      <div className="bg-white dark:bg-[#06242e] rounded-2xl border border-[#ccede5] dark:border-teal-900/60 p-2 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0b3b49] text-white dark:bg-[#5eead4] dark:text-[#06242e] shadow-xs'
                    : 'text-[#527683] dark:text-[#8ab5be] hover:bg-[#f0fbf8] dark:hover:bg-[#092b36] hover:text-[#06242e] dark:hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Basic Info */}
      {activeTab === 'basic' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 shadow-xs space-y-6 text-xs">
          <div>
            <h3 className="font-extrabold text-sm text-[#06242e] dark:text-white">
              اطلاعات پایه و معرفی دوره
            </h3>
            <p className="text-[11px] text-[#527683] dark:text-[#8ab5be] mt-0.5">
              عنوان جذاب، معرفی واضح و مدرس دوره را مشخص کنید.
            </p>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#06242e] dark:text-white">
                عنوان اصلی دوره <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="مثال: مسترکلاس جامع طراحی دیزاین سیستم سازمانی با فیگما و توکن‌های دیزاین"
                className="w-full px-4 py-2.5 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white placeholder-[#527683] focus:outline-hidden focus:border-[#0d9488]"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#06242e] dark:text-white">
                زیرعنوان / شعار دوره <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="مثال: از متغیرهای فیگما تا خروجی کدهای ری‌اکت و تلویند، استاندارد شرکت‌های جهانی"
                className="w-full px-4 py-2.5 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white placeholder-[#527683] focus:outline-hidden focus:border-[#0d9488]"
              />
            </div>

            {/* Category & SubCategory & Instructor */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-[#06242e] dark:text-white">دسته‌بندی اصلی</label>
                <select
                  value={categoryId}
                  onChange={e => {
                    setCategoryId(e.target.value);
                    const cat = categories.find(c => c.id === e.target.value);
                    if (cat?.subCategories?.[0]) setSubCategory(cat.subCategories[0]);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white focus:outline-hidden"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nameFa}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#06242e] dark:text-white">زیرمجموعه تخصصی</label>
                <input
                  type="text"
                  value={subCategory}
                  onChange={e => setSubCategory(e.target.value)}
                  placeholder="مثال: فیگما پیشرفته"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#06242e] dark:text-white">مدرس و ارائه دهنده</label>
                <select
                  value={instructorId}
                  onChange={e => setInstructorId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white focus:outline-hidden"
                >
                  {instructors.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name} ({inst.title})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Level & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-[#06242e] dark:text-white">سطح مخاطب دوره</label>
                <select
                  value={level}
                  onChange={e => setLevel(e.target.value as CourseLevel)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white focus:outline-hidden"
                >
                  <option value="all">همه سطوح (مقدماتی تا پیشرفته)</option>
                  <option value="beginner">مقدماتی (شروع از صفر)</option>
                  <option value="intermediate">متوسط</option>
                  <option value="advanced">پیشرفته و فوق تخصصی</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#06242e] dark:text-white">زبان تدریس</label>
                <input
                  type="text"
                  value={language}
                  onChange={e => setCourseLanguage(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Full Description */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#06242e] dark:text-white">
                توضیحات و شرح کامل دوره
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={5}
                placeholder="توضیحات تفصیلی، متدولوژی تدریس و مزایای شرکت در این دوره..."
                className="w-full p-4 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white focus:outline-hidden"
              />
            </div>

            {/* What you'll learn list */}
            <div className="space-y-2 pt-2 border-t border-[#ccede5]/60 dark:border-teal-900/40">
              <label className="font-bold text-[#06242e] dark:text-white">
                آنچه در این دوره خواهید آموخت (Learning Outcomes)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOutcome}
                  onChange={e => setNewOutcome(e.target.value)}
                  placeholder="مورد جدید را وارد کنید..."
                  className="flex-1 px-3 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newOutcome.trim()) {
                      setWhatYouWillLearn(prev => [...prev, newOutcome.trim()]);
                      setNewOutcome('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newOutcome.trim()) {
                      setWhatYouWillLearn(prev => [...prev, newOutcome.trim()]);
                      setNewOutcome('');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] font-bold"
                >
                  افزودن
                </button>
              </div>

              <div className="space-y-1.5 pt-1">
                {whatYouWillLearn.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#def4ee]/40 dark:bg-[#0e3b47]/40 border border-[#ccede5] dark:border-teal-900">
                    <span className="text-xs text-[#06242e] dark:text-white">✓ {item}</span>
                    <button
                      onClick={() => setWhatYouWillLearn(prev => prev.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-4 border-t border-[#ccede5]/60 dark:border-teal-900/40">
            <button
              onClick={() => setActiveTab('media')}
              className="px-5 py-2.5 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>مرحله بعد: کاور و ویدیو</span>
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Media & Cover */}
      {activeTab === 'media' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 shadow-xs space-y-6 text-xs">
          <div>
            <h3 className="font-extrabold text-sm text-[#06242e] dark:text-white">
              کاور دوره و ویدئوی معرفی
            </h3>
            <p className="text-[11px] text-[#527683] dark:text-[#8ab5be] mt-0.5">
              تصویر با کیفیت و ویدیوی جذاب اولین چیزی است که دانشجویان می‌بینند.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Cover Image Upload Card */}
            <div className="p-5 rounded-2xl border border-[#ccede5] dark:border-teal-900 space-y-3">
              <div className="font-bold text-sm text-[#06242e] dark:text-white flex items-center gap-1.5">
                <ImageIcon size={16} className="text-[#0d9488]" />
                <span>تصویر کاور اصلی دوره (16:9)</span>
              </div>
              <p className="text-[11px] text-[#527683] dark:text-[#8ab5be]">
                ابعاد پیشنهادی: ۱۹۲۰ در ۱۰۸۰ پیکسل. فرمت‌های مجاز: WebP, PNG, JPG.
              </p>

              <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-[#092b36] border-2 border-dashed border-[#ccede5] dark:border-teal-800 relative group flex items-center justify-center">
                {thumbnail ? (
                  <>
                    <img src={thumbnail} alt="Cover Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setThumbnail('')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs"
                      >
                        حذف تصویر
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <UploadCloud size={32} className="mx-auto text-slate-400" />
                    <div className="font-bold text-xs text-[#06242e] dark:text-white">
                      تصویر کاور را به اینجا بکشید یا انتخاب کنید
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[11px] text-[#527683] dark:text-[#8ab5be]">یا آدرس تصویر کاور:</label>
                <input
                  type="text"
                  value={thumbnail}
                  onChange={e => setThumbnail(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white"
                />
              </div>
            </div>

            {/* Promo Video Card */}
            <div className="p-5 rounded-2xl border border-[#ccede5] dark:border-teal-900 space-y-3">
              <div className="font-bold text-sm text-[#06242e] dark:text-white flex items-center gap-1.5">
                <Play size={16} className="text-[#0d9488]" />
                <span>ویدئوی تیزر و معرفی دوره (Promo Video)</span>
              </div>
              <p className="text-[11px] text-[#527683] dark:text-[#8ab5be]">
                ویدیوی ۱ تا ۳ دقیقه‌ای شامل معرفی اهداف دوره و نمونه پروژه‌ها.
              </p>

              <div className="aspect-video rounded-xl overflow-hidden bg-black/10 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-800">
                {previewVideoUrl ? (
                  <video src={previewVideoUrl} controls className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    ویدیویی انتخاب نشده است
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[11px] text-[#527683] dark:text-[#8ab5be]">آدرس ویدیوی تیزر:</label>
                <input
                  type="text"
                  value={previewVideoUrl}
                  onChange={e => setPreviewVideoUrl(e.target.value)}
                  placeholder="https://... (.mp4 / hls)"
                  className="w-full px-3 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white"
                />
              </div>
            </div>

          </div>

          <div className="flex justify-between pt-4 border-t border-[#ccede5]/60 dark:border-teal-900/40">
            <button
              onClick={() => setActiveTab('basic')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#09222b] text-[#06242e] dark:text-white font-bold"
            >
              مرحله قبل
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className="px-5 py-2.5 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>مرحله بعد: سازنده سرفصل‌ها</span>
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Curriculum Builder */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          <CurriculumBuilder
            modules={modules}
            onChange={updated => setModules(updated)}
          />

          <div className="flex justify-between p-4 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60">
            <button
              onClick={() => setActiveTab('media')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#09222b] text-[#06242e] dark:text-white text-xs font-bold"
            >
              مرحله قبل
            </button>
            <button
              onClick={() => setActiveTab('bulk-upload')}
              className="px-5 py-2.5 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>مرحله بعد: بارگذاری گروهی</span>
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Bulk Upload */}
      {activeTab === 'bulk-upload' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 shadow-xs space-y-6 text-xs">
          <div>
            <h3 className="font-extrabold text-sm text-[#06242e] dark:text-white">
              بارگذاری گروهی فایل‌ها و ویدیوها (Bulk Upload Queue)
            </h3>
            <p className="text-[11px] text-[#527683] dark:text-[#8ab5be] mt-0.5">
              چندین فایل را همزمان بارگذاری کنید و سپس مستقیماً به جلسات تخصیص دهید.
            </p>
          </div>

          {/* Drag and Drop Zone */}
          <div 
            onClick={() => {
              addToUploadQueue([
                { name: 'جلسه ۳: ساختار توکن‌های طراحی در فیگما.mp4', fileSize: '54.2 مگابایت', type: 'video', duration: '18:40', resolution: '1920×1080' },
                { name: 'جلسه ۴: کامپوننت‌های پیشرفته و AutoLayout.mp4', fileSize: '68.1 مگابایت', type: 'video', duration: '24:10', resolution: '1920×1080' },
                { name: 'جزوه تمرین عملی سرفصل اول.pdf', fileSize: '6.4 مگابایت', type: 'pdf' }
              ]);
              addToast({
                title: 'فایل‌ها در صف بارگذاری قرار گرفتند',
                message: '۳ فایل جدید با موفقیت اضافه شدند.',
                type: 'info'
              });
            }}
            className="p-8 rounded-2xl border-2 border-dashed border-[#0d9488] bg-[#f0fbf8] dark:bg-[#092b36] text-center space-y-2 cursor-pointer hover:bg-[#def4ee]/50 transition-colors"
          >
            <UploadCloud size={40} className="mx-auto text-[#0d9488] dark:text-[#5eead4]" />
            <div className="font-extrabold text-sm text-[#06242e] dark:text-white">
              کلیک کنید تا فایل‌های نمونه به صف بارگذاری اضافه شوند
            </div>
            <p className="text-[11px] text-[#527683] dark:text-[#8ab5be]">
              پشتیبانی از فرمت‌های MP4, MKV, WebM, PDF, ZIP (حداکثر ۵ گیگابایت برای هر فایل)
            </p>
          </div>

          {/* Queue List */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-[#06242e] dark:text-white">
              صف بارگذاری ({toPersianDigits(uploadQueue.length)} فایل)
            </h4>

            {uploadQueue.length === 0 ? (
              <div className="p-6 text-center text-[#527683] dark:text-[#8ab5be] bg-slate-50 dark:bg-[#092b36] rounded-xl">
                صف بارگذاری خالی است.
              </div>
            ) : (
              <div className="space-y-2">
                {uploadQueue.map(item => (
                  <div key={item.id} className="p-3.5 rounded-xl border border-[#ccede5] dark:border-teal-900 bg-white dark:bg-[#082834] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-[#def4ee] dark:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4]">
                          <UploadCloud size={15} />
                        </span>
                        <div>
                          <div className="font-bold text-xs text-[#06242e] dark:text-white">{item.name}</div>
                          <div className="text-[10px] text-[#527683] dark:text-[#8ab5be]">{item.fileSize}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.status === 'ready' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        item.status === 'processing' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status === 'ready' ? 'آماده الحاق ✓' : item.status === 'processing' ? 'پردازش کیفیت...' : `${toPersianDigits(item.progress)}٪`}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0d9488] transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-[#ccede5]/60 dark:border-teal-900/40">
            <button
              onClick={() => setActiveTab('curriculum')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#09222b] text-[#06242e] dark:text-white font-bold"
            >
              مرحله قبل
            </button>
            <button
              onClick={() => setActiveTab('media-library')}
              className="px-5 py-2.5 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>مرحله بعد: کتابخانه رسانه‌ها</span>
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Media Library */}
      {activeTab === 'media-library' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 shadow-xs space-y-6 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-[#06242e] dark:text-white">
                کتابخانه رسانه‌ها (Media Assets Library)
              </h3>
              <p className="text-[11px] text-[#527683] dark:text-[#8ab5be] mt-0.5">
                تمامی فایل‌های بارگذاری‌شده روی سرورهای پلتفرم
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#def4ee] dark:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4] text-xs font-black">
              {toPersianDigits(mediaAssets.length)} فایل ذخیره شده
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaAssets.map(asset => (
              <div
                key={asset.id}
                className="p-4 rounded-xl border border-[#ccede5] dark:border-teal-900 bg-[#f0fbf8]/50 dark:bg-[#082834] space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-[#def4ee] dark:bg-[#0e3b47] text-[#0d9488] dark:text-[#5eead4]">
                      {asset.type === 'video' ? <Play size={16} /> : <FileText size={16} />}
                    </span>
                    <span className="text-[10px] text-[#527683] dark:text-[#8ab5be] font-bold">
                      {asset.fileSize}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#06242e] dark:text-white mt-2 line-clamp-2">
                    {asset.name}
                  </h4>
                </div>

                <div className="pt-2 border-t border-[#ccede5]/60 dark:border-teal-900/40 flex items-center justify-between">
                  <span className="text-[10px] text-[#527683] dark:text-[#8ab5be]">{asset.createdAt}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(asset.url);
                      addToast({
                        title: 'لینک کپی شد',
                        message: 'آدرس اینترنتی فایل در کلیپ‌بورد کپی شد.',
                        type: 'info'
                      });
                    }}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-[#0e3b47] text-[#06242e] dark:text-white text-[10px] font-bold flex items-center gap-1"
                  >
                    <Copy size={11} />
                    <span>کپی لینک</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-[#ccede5]/60 dark:border-teal-900/40">
            <button
              onClick={() => setActiveTab('bulk-upload')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#09222b] text-[#06242e] dark:text-white font-bold"
            >
              مرحله قبل
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className="px-5 py-2.5 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>مرحله بعد: وضعیت دسترسی و VIP</span>
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 6: Access & Subscription Status */}
      {activeTab === 'pricing' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 shadow-xs space-y-6 text-xs">
          
          {/* Header with Quick Save */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ccede5]/60 dark:border-teal-900/40 pb-4">
            <div>
              <h3 className="font-extrabold text-sm text-[#06242e] dark:text-white flex items-center gap-2">
                <Crown size={16} className="text-[#0d9488]" />
                <span>وضعیت دسترسی و اشتراک ویژه (VIP)</span>
              </h3>
              <p className="text-[11px] text-[#527683] dark:text-[#8ab5be] mt-0.5">
                تنظیم نحوه دسترسی دانشجویان به محتوای دوره بر اساس مدل اشتراکی پلتفرم
              </p>
            </div>

            <button
              type="button"
              onClick={handleQuickSavePricing}
              disabled={isSavingPricing}
              className="px-4 py-2 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save size={14} />
              <span>{isSavingPricing ? 'در حال ثبت وضعیت...' : 'ذخیره آنی وضعیت دسترسی'}</span>
            </button>
          </div>

          {/* Access Status Toggle Card */}
          <div className="p-6 rounded-2xl bg-slate-50/80 dark:bg-[#07242d] border border-[#ccede5] dark:border-teal-900/60 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="font-black text-sm text-[#06242e] dark:text-white flex items-center gap-2">
                  <span>وضعیت دسترسی: رایگان / نیازمند اشتراک ویژه (VIP)</span>
                </label>
                <p className="text-[11px] text-[#527683] dark:text-[#8ab5be]">
                  برای تغییر وضعیت دوره میان دسترسی عمومی رایگان یا اختصاصی کاربران VIP، کلید را تغییر دهید.
                </p>
              </div>

              {/* The Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isVipRequired}
                onClick={() => setIsVipRequired(!isVipRequired)}
                className={`relative inline-flex h-9 w-18 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isVipRequired ? 'bg-[#0d9488]' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                    isVipRequired ? '-translate-x-9' : 'translate-x-0'
                  }`}
                >
                  {isVipRequired ? (
                    <Crown size={15} className="text-[#0d9488]" />
                  ) : (
                    <Sparkles size={15} className="text-slate-400" />
                  )}
                </span>
              </button>
            </div>

            {/* Visual Status Feedback */}
            <div className="pt-2">
              {isVipRequired ? (
                <div className="p-4 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 text-teal-900 dark:text-teal-200 space-y-2">
                  <div className="flex items-center gap-2 font-black text-xs text-[#0d9488] dark:text-[#5eead4]">
                    <Crown size={16} />
                    <span>وضعیت فعلی: نیازمند اشتراک ویژه (VIP)</span>
                  </div>
                  <p className="text-[11px] text-teal-800 dark:text-teal-300 leading-relaxed">
                    این دوره اختصاصی است و تنها دانشجویانی که دارای اشتراک ویژه فعال (۱، ۳، ۶ یا ۹ ماهه) هستند، به تمامی جلسات، ویدیوها و منابع تکمیلی دسترسی دارند. جلساتی با برچسب «پیش‌نمایش رایگان» برای همه اعضا باز خواهد بود.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-black text-xs text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 size={16} />
                    <span>وضعیت فعلی: کاملاً رایگان (Free Access)</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    این دوره برای تمامی کاربران عمومی پلتفرم رایگان است. هر کاربری بدون نیاز به خرید اشتراک یا پرداخت وجه، می‌تواند در دوره ثبت‌نام کرده و محتوای آموزشی را مشاهده نماید.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-[#ccede5]/60 dark:border-teal-900/40">
            <button
              onClick={() => setActiveTab('media-library')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#09222b] text-[#06242e] dark:text-white font-bold cursor-pointer hover:bg-slate-200"
            >
              مرحله قبل
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleQuickSavePricing}
                disabled={isSavingPricing}
                className="px-4 py-2 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-[#0d9488] dark:text-[#5eead4] font-black text-xs flex items-center gap-1.5 cursor-pointer hover:bg-teal-200"
              >
                <Save size={14} />
                <span>ذخیره وضعیت</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className="px-5 py-2 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span>مرحله بعد: تنظیمات</span>
                <ArrowLeft size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Settings */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 shadow-xs space-y-6 text-xs">
          <div>
            <h3 className="font-extrabold text-sm text-[#06242e] dark:text-white">
              تنظیمات دسترسی، پیشرفت و گواهینامه
            </h3>
            <p className="text-[11px] text-[#527683] dark:text-[#8ab5be] mt-0.5">
              قوانین مشاهده جلسات و امکانات ویژه دوره
            </p>
          </div>

          <div className="space-y-3">
            {/* Lifetime Access */}
            <div className="p-3.5 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#082834] border border-[#ccede5] dark:border-teal-900 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-[#06242e] dark:text-white">دسترسی مادام‌العمر</div>
                <div className="text-[11px] text-[#527683] dark:text-[#8ab5be]">دانشجویان بدون محدودیت زمانی به محتوا دسترسی دارند.</div>
              </div>
              <input
                type="checkbox"
                checked={isLifetimeAccess}
                onChange={e => setIsLifetimeAccess(e.target.checked)}
                className="rounded text-[#0d9488] focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Certificate */}
            <div className="p-3.5 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#082834] border border-[#ccede5] dark:border-teal-900 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-[#06242e] dark:text-white">صدور گواهینامه معتبر پایان دوره</div>
                <div className="text-[11px] text-[#527683] dark:text-[#8ab5be]">پس از تکمیل ۱۰۰٪ جلسات گواهی رسمی صادر می‌شود.</div>
              </div>
              <input
                type="checkbox"
                checked={hasCertificate}
                onChange={e => setHasCertificate(e.target.checked)}
                className="rounded text-[#0d9488] focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Sequential Completion */}
            <div className="p-3.5 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#082834] border border-[#ccede5] dark:border-teal-900 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-[#06242e] dark:text-white">قفل ترتیبی جلسات</div>
                <div className="text-[11px] text-[#527683] dark:text-[#8ab5be]">مشاهده جلسه بعدی فقط پس از اتمام جلسه قبلی مجاز است.</div>
              </div>
              <input
                type="checkbox"
                checked={requireSequential}
                onChange={e => setRequireSequential(e.target.checked)}
                className="rounded text-[#0d9488] focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Q&A Discussions */}
            <div className="p-3.5 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#082834] border border-[#ccede5] dark:border-teal-900 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-[#06242e] dark:text-white">تالار پرسش و پاسخ دانشجویان</div>
                <div className="text-[11px] text-[#527683] dark:text-[#8ab5be]">امکان ثبت کامنت و پرسش سوال زیر هر جلسه فعال باشد.</div>
              </div>
              <input
                type="checkbox"
                checked={enableDiscussions}
                onChange={e => setEnableDiscussions(e.target.checked)}
                className="rounded text-[#0d9488] focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Allow Downloads */}
            <div className="p-3.5 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#082834] border border-[#ccede5] dark:border-teal-900 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-[#06242e] dark:text-white">اجازه دانلود فایل‌های ضمیمه و پروژه</div>
                <div className="text-[11px] text-[#527683] dark:text-[#8ab5be]">فایل‌های پروژه و اسلایدهای PDF قابل دریافت باشند.</div>
              </div>
              <input
                type="checkbox"
                checked={allowDownloads}
                onChange={e => setAllowDownloads(e.target.checked)}
                className="rounded text-[#0d9488] focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-[#ccede5]/60 dark:border-teal-900/40">
            <button
              onClick={() => setActiveTab('pricing')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#09222b] text-[#06242e] dark:text-white font-bold"
            >
              مرحله قبل
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className="px-5 py-2.5 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>مرحله بعد: سئو و متا</span>
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 8: SEO & Meta */}
      {activeTab === 'seo' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 shadow-xs space-y-6 text-xs">
          <div>
            <h3 className="font-extrabold text-sm text-[#06242e] dark:text-white">
              بهینه‌سازی موتورهای جستجو (SEO) و آدرس یکتا
            </h3>
            <p className="text-[11px] text-[#527683] dark:text-[#8ab5be] mt-0.5">
              تنظیمات متاتگ‌ها جهت رتبه‌گیری در گوگل و پیش‌نمایش در شبکه‌های اجتماعی
            </p>
          </div>

          <div className="space-y-4">
            {/* Slug */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#06242e] dark:text-white">
                نامک / آدرس یکتا (Slug URL)
              </label>
              <div className="flex items-center" dir="ltr">
                <span className="px-3 py-2.5 rounded-s-xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[11px] border border-e-0 border-[#ccede5] dark:border-teal-900">
                  https://luminalearn.ir/course/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-e-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white font-mono focus:outline-hidden"
                />
              </div>
            </div>

            {/* Meta Title */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#06242e] dark:text-white">
                عنوان سئو (Meta Title)
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={e => setMetaTitle(e.target.value)}
                placeholder="عنوان جهت نمایش در نتایج گوگل..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#06242e] dark:text-white">
                توضیحات متا (Meta Description)
              </label>
              <textarea
                value={metaDescription}
                onChange={e => setMetaDescription(e.target.value)}
                rows={3}
                placeholder="توضیحات کوتاه حداکثر ۱۶۰ کاراکتر جهت نمایش در گوگل..."
                className="w-full p-4 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="font-bold text-[#06242e] dark:text-white">برچسب‌ها و کلمات کلیدی</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  placeholder="برچسب جدید..."
                  className="flex-1 px-3 py-2 rounded-xl bg-[#f0fbf8]/70 dark:bg-[#092b36] border border-[#ccede5] dark:border-teal-900/60 text-xs text-[#06242e] dark:text-white"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newTag.trim()) {
                      setTags(prev => [...prev, newTag.trim()]);
                      setNewTag('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newTag.trim()) {
                      setTags(prev => [...prev, newTag.trim()]);
                      setNewTag('');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] font-bold"
                >
                  افزودن برچسب
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#def4ee] dark:bg-[#0e3b47] text-[#0b3b49] dark:text-[#5eead4] font-bold text-[11px]">
                    <span>#{tag}</span>
                    <button onClick={() => setTags(prev => prev.filter((_, i) => i !== idx))} className="text-rose-500">×</button>
                  </span>
                ))}
              </div>
            </div>

          </div>

          <div className="flex justify-between pt-4 border-t border-[#ccede5]/60 dark:border-teal-900/40">
            <button
              onClick={() => setActiveTab('settings')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#09222b] text-[#06242e] dark:text-white font-bold"
            >
              مرحله قبل
            </button>
            <button
              onClick={() => setActiveTab('publish')}
              className="px-5 py-2.5 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>مرحله بعد: پیش‌نمایش و انتشار</span>
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 9: Preview and Publishing Pre-flight Checks */}
      {activeTab === 'publish' && (
        <div className="space-y-6 text-xs">
          
          {/* Pre-flight Checklist */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#06242e] dark:text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-[#0d9488] dark:text-[#5eead4]" />
                  <span>چک‌لیست بررسی نهایی پیش از انتشار (Pre-Flight Checks)</span>
                </h3>
                <p className="text-[11px] text-[#527683] dark:text-[#8ab5be] mt-0.5">
                  جهت اطمینان از تجربه کاربری عالی و کیفیت استاندارد دوره
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black ${
                isValidForPublish ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800'
              }`}>
                {isValidForPublish ? 'آماده انتشار در کاتالوگ ✓' : 'نیازمند تکمیل موارد قرمز'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {validationChecks.map((check, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border ${
                    check.valid 
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300' 
                      : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-300'
                  }`}
                >
                  {check.valid ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  )}
                  <span className="font-bold text-xs">{check.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Live Preview Simulator */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-[#06242e] dark:text-white">
                  پیش‌نمایش کارت دوره در مارکت‌پلیس
                </h4>
                <p className="text-[11px] text-[#527683] dark:text-[#8ab5be]">
                  نمای ظاهری دقیق دوره برای دانشجویان
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    previewDevice === 'desktop' ? 'bg-[#0b3b49] text-white dark:bg-[#5eead4] dark:text-[#06242e]' : 'bg-slate-100 dark:bg-[#092b36] text-[#527683]'
                  }`}
                >
                  <Laptop size={15} />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    previewDevice === 'mobile' ? 'bg-[#0b3b49] text-white dark:bg-[#5eead4] dark:text-[#06242e]' : 'bg-slate-100 dark:bg-[#092b36] text-[#527683]'
                  }`}
                >
                  <Smartphone size={15} />
                </button>
              </div>
            </div>

            {/* Preview Card Mockup */}
            <div className={`mx-auto transition-all ${previewDevice === 'mobile' ? 'max-w-xs' : 'max-w-md'}`}>
              <div className="rounded-2xl bg-white dark:bg-[#082834] border border-[#ccede5] dark:border-teal-900 overflow-hidden shadow-md">
                <div className="aspect-video relative">
                  <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
                  <div className={`absolute top-2 start-2 px-2.5 py-1 rounded-full text-white text-[10px] font-extrabold shadow-sm flex items-center gap-1 ${
                    isVipRequired ? 'bg-[#0d9488]' : 'bg-emerald-600'
                  }`}>
                    {isVipRequired ? (
                      <>
                        <Crown size={11} />
                        <span>اشتراک VIP</span>
                      </>
                    ) : (
                      <span>رایگان</span>
                    )}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="text-[11px] text-[#0d9488] dark:text-[#5eead4] font-bold">
                    {currentCategory?.nameFa} • {level === 'all' ? 'همه سطوح' : level}
                  </div>
                  <h5 className="font-extrabold text-sm text-[#06242e] dark:text-white line-clamp-2">
                    {title || 'عنوان دوره'}
                  </h5>
                  <p className="text-[11px] text-[#527683] dark:text-[#8ab5be] line-clamp-2">
                    {subtitle || 'توضیحات کوتاه'}
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-[#ccede5]/60 dark:border-teal-900/40">
                    <img src={currentInstructor?.avatar} alt={currentInstructor?.name} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-xs font-semibold text-[#06242e] dark:text-slate-200">{currentInstructor?.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Final Action Launch Bar */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0b3b49] to-[#06242e] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div>
              <h4 className="font-extrabold text-base">دوره آماده انتشار است</h4>
              <p className="text-xs text-[#8ab5be] mt-0.5">
                با زدن دکمه انتشار، تمامی تغییرات در پایگاه داده اعمال شده و در کاتالوگ آنلاین قرار می‌گیرد.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveDraft}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                ذخیره به عنوان پیش‌نویس
              </button>
              <button
                onClick={handlePublish}
                disabled={!isValidForPublish}
                className="px-6 py-2.5 rounded-xl bg-[#5eead4] hover:bg-[#2dd4bf] disabled:opacity-40 disabled:cursor-not-allowed text-[#06242e] text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Send size={16} />
                <span>تایید نهایی و انتشار در سایت</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
