export type UserRole = 'student' | 'instructor' | 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  headline?: string;
  bio?: string;
  joinedDate: string;
  enrolledCourseIds: string[];
  wishlistCourseIds: string[];
  followedInstructorIds: string[];
}

export type CourseLevel = 'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced';

export interface CourseResource {
  id: string;
  title: string;
  fileSize: string;
  fileType: 'pdf' | 'zip' | 'figma' | 'code' | 'doc';
  downloadUrl: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export type LessonContentType = 'video' | 'text' | 'pdf' | 'audio' | 'image' | 'code' | 'quote' | 'link' | 'quiz' | 'assignment' | 'download';

export interface LessonContentBlock {
  id: string;
  type: LessonContentType;
  title?: string;
  content: string; // text, code, url, embed or markdown
  caption?: string;
  meta?: {
    fileSize?: string;
    duration?: string;
    language?: string;
    author?: string;
    targetUrl?: string;
  };
}

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  videoUrl: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  isPreviewFree?: boolean;
  description?: string;
  order?: number;
  resources?: CourseResource[];
  quiz?: Quiz;
  contentBlocks?: LessonContentBlock[];
  isPublished?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  order?: number;
  lessons: Lesson[];
  isExpanded?: boolean;
}

export interface CourseReview {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1 to 5
  date: string;
  comment: string;
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  instructorResponse?: {
    date: string;
    comment: string;
  };
}

export type CourseStatus = 'draft' | 'pending' | 'published' | 'disabled' | 'archived';

export interface CourseSettings {
  isLifetimeAccess: boolean;
  requireSequentialCompletion: boolean;
  hasCertificate: boolean;
  enableDiscussions: boolean;
  allowDownloads: boolean;
  timeLimitDays?: number;
  freePreviewEnabled: boolean;
}

export interface CourseSeoSettings {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  keywords: string[];
  ogImage?: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'video' | 'image' | 'pdf' | 'audio' | 'download';
  url: string;
  thumbnailUrl?: string;
  fileSize: string;
  sizeBytes?: number;
  duration?: string;
  resolution?: string;
  mimeType: string;
  createdAt: string;
  usedInCoursesCount?: number;
}

export interface UploadQueueItem {
  id: string;
  name: string;
  fileSize: string;
  type: 'video' | 'image' | 'pdf' | 'audio' | 'download';
  progress: number; // 0 to 100
  status: 'queued' | 'uploading' | 'processing' | 'ready' | 'error';
  errorMessage?: string;
  url?: string;
  thumbnailUrl?: string;
  duration?: string;
  resolution?: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  categoryId: string;
  categoryName: string;
  subCategory?: string;
  thumbnail: string;
  coverImage?: string;
  previewVideoUrl: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  instructorTitle: string;
  price: number;
  originalPrice: number;
  discountPercentage?: number;
  rating: number;
  reviewCount: number;
  studentCount: number;
  durationHours: number;
  lessonCount: number;
  level: CourseLevel;
  language: string;
  hasCertificate: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isPublished: boolean;
  publishedAt: string;
  updatedAt: string;
  whatYouWillLearn: string[];
  requirements: string[];
  targetAudience: string[];
  modules: CourseModule[];
  faqs: { question: string; answer: string }[];
  tags: string[];
  status: CourseStatus;
  settings?: Partial<CourseSettings>;
  seo?: Partial<CourseSeoSettings>;
  analytics?: {
    totalViews?: number;
    completionRate?: number;
    dropoffRate?: number;
    totalWatchTimeHours?: number;
    totalRevenue?: number;
  };
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  nameFa: string;
  description: string;
  iconName?: string;
  icon?: string;
  color?: string;
  image: string;
  courseCount: number;
  subCategories: string[];
}

export interface InstructorProfile {
  id: string;
  name: string;
  nameFa?: string;
  title: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  studentCount: number;
  rating: number;
  reviewCount: number;
  courseCount: number;
  isVerified?: boolean;
  skills?: string[];
  socials?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  featuredCourseId?: string;
}

export type Instructor = InstructorProfile;

export interface Enrollment {
  courseId: string;
  userId: string;
  enrolledAt: string;
  completedLessonIds: string[];
  lastLessonId: string;
  lastPositionSeconds: number;
  progressPercent: number;
  completedAt?: string;
  certificateId?: string;
  notes: {
    id: string;
    lessonId: string;
    lessonTitle: string;
    timestampSeconds: number;
    text: string;
    createdAt: string;
  }[];
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  studentId: string;
  studentName: string;
  issueDate: string;
  verificationUrl: string;
  skills: string[];
  gradeScore?: string;
}

export interface CartItem {
  courseId: string;
  course: Course;
  savedForLater?: boolean;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  minSpend?: number;
  expiresAt: string;
  description: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  courses: {
    id: string;
    title: string;
    price: number;
    thumbnail: string;
  }[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  total: number;
  paymentMethod: 'card' | 'paypal' | 'applepay';
  createdAt: string;
  status: 'completed' | 'processing' | 'refunded';
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'enrollment' | 'lesson' | 'completion' | 'certificate' | 'review' | 'payment' | 'announcement';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface DiscussionMessage {
  id: string;
  courseId: string;
  lessonId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  isInstructor?: boolean;
  text: string;
  createdAt: string;
  upvotes: number;
  userUpvoted?: boolean;
  replies?: DiscussionMessage[];
}

export interface CatalogFilters {
  searchQuery: string;
  categoryId: string;
  subCategory?: string;
  level: string;
  priceType: 'all' | 'free' | 'paid' | 'under50';
  minRating: number;
  duration: 'all' | '0-2' | '3-6' | '7+';
  language: string;
  hasCertificate: boolean;
  sortBy: 'popular' | 'newest' | 'rating' | 'price-asc' | 'price-desc';
  viewMode: 'grid' | 'list';
}

export type AppLanguage = 'en' | 'fa';
export type AppTheme = 'light' | 'dark' | 'system';
